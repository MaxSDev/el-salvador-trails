import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { ContentError, validateTour, validatePartner } from '../supabase/functions/_shared/content-policy.mjs';

export async function localContentStore(directory, tours, adminId, partners = []) {
  await mkdir(directory, { recursive: true }); const path = join(directory, 'content.json');
  let state;
  try { state = JSON.parse(await readFile(path, 'utf8')); } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    state = { documents: tours.map((tour,index) => { const data = validateTour({...tour,sortOrder:index}); return { id: tour.id, kind: 'tour', draft: data, published: data, status: 'published', version: 0 }; }), media: [], audit: [], tour_metadata_v1: true };
    state.documents.push({ id: 'site', kind: 'site', draft: {}, published: {}, status: 'published', version: 0 });
    await writeFile(path, JSON.stringify(state));
  }
  let bootstrapChanged = false;
  if (!state.tour_metadata_v1) {
    const originals = new Map(tours.map(tour => [tour.id, validateTour(tour)]));
    const metadata = ['contentSource', 'optionalExtras', 'imageDescriptions', 'mediaNote', 'rating', 'ratingCount'];
    for (const document of state.documents) {
      const source = document.kind === 'tour' && originals.get(document.id);
      if (!source) continue;
      for (const snapshot of [document.draft, document.published]) {
        if (!snapshot || typeof snapshot !== 'object') continue;
        for (const key of metadata) {
          if (Object.hasOwn(snapshot, key) || !Object.hasOwn(source, key)) continue;
          if (key === 'imageDescriptions' && source.imageDescriptions) {
            snapshot.imageDescriptions = Object.fromEntries(['es', 'en', 'pt'].map(language => [language, (snapshot.images || []).map(image => {
              const index = source.images.indexOf(image);
              return index < 0 ? '' : source.imageDescriptions[language]?.[index] || '';
            })]));
          } else snapshot[key] = structuredClone(source[key]);
        }
      }
    }
    // This repair never changes document versions, publication state, photos or audit history.
    // Later explicit edits must not be replaced by replaying canonical metadata on restart.
    state.tour_metadata_v1 = true;
    bootstrapChanged = true;
  }
  // Deleted allies must not be recreated by the canonical import on restart.
  const deletedIds = new Set(state.audit.filter(entry => entry.action === 'delete').map(entry => entry.document_id));
  // Only add missing canonical allies: existing drafts, hidden content and owner edits win.
  for (const partner of partners) {
    const data = validatePartner(partner);
    if (!deletedIds.has(data.id) && !state.documents.some(document => document.id === data.id)) {
      if (state.documents.length >= 201) throw new ContentError('Se alcanzó el límite de contenido.');
      state.documents.push({ id: data.id, kind: 'partner', draft: data, published: structuredClone(data), status: 'published', version: 0 });
      bootstrapChanged = true;
    }
  }
  if (bootstrapChanged) { await writeFile(path + '.tmp', JSON.stringify(state)); await rename(path + '.tmp', path); }
  let queue = Promise.resolve();
  const copy = value => structuredClone(value);
  async function mutation(fn) {
    const next = queue.then(async () => { const previous = state; state = copy(state); try { const result = fn(); await writeFile(path + '.tmp', JSON.stringify(state)); await rename(path + '.tmp', path); return copy(result); } catch (e) { state = previous; throw e; } });
    queue = next.catch(() => {}); return next;
  }
  return {
    isAdmin: async id => id === adminId,
    list: async () => { await queue; return copy(state.documents); },
    media: async () => { await queue; return copy(state.media.slice(-100).reverse()); },
    addMedia: (actor, item) => mutation(() => { if (actor !== adminId) throw new ContentError('Acceso denegado.', 403); state.media.push(item); return item; }),
    write: (actor, input) => mutation(() => {
      if (actor !== adminId) throw new ContentError('Acceso denegado.', 403);
      if (!['save', 'publish', 'hide', 'delete'].includes(input.action) || (input.kind === 'site' && ['hide', 'delete'].includes(input.action))) throw new ContentError('Acción inválida.');
      let row = state.documents.find(d => d.id === input.id);
      if (row && (row.version !== input.version || row.kind !== input.kind) || !row && (input.version !== 0 || input.action === 'delete' || state.audit.some(entry => entry.document_id === input.id && entry.action === 'delete'))) throw new ContentError('Este contenido cambió o se borró. Actualiza la lista. Si estás creando otro, utiliza un nombre en el enlace diferente.', 409);
      if (input.action === 'delete') {
        state.audit.push({ document_id: row.id, actor_id: actor, action: 'delete', version: row.version + 1, created_at: new Date().toISOString() });
        state.documents = state.documents.filter(document => document.id !== row.id);
        return { deleted: { id: row.id } };
      }
      if (!row) { if (state.documents.length >= 201 || input.action === 'hide') throw new ContentError('No se puede crear el contenido.'); row = { id: input.id, kind: input.kind, draft: {}, published: null, version: 0, status: 'draft' }; state.documents.push(row); }
      if (input.action !== 'hide') row.draft = copy(input.draft);
      if (input.action === 'publish') { row.published = copy(row.draft); row.status = 'published'; }
      if (input.action === 'hide') row.status = 'hidden';
      row.version++; row.updated_at = new Date().toISOString();
      state.audit.push({ document_id: row.id, actor_id: actor, action: input.action, version: row.version, created_at: row.updated_at });
      return row;
    })
  };
}
