// Local development adapter only. Production uses PostgreSQL and Supabase Auth.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { ReviewError } from '../supabase/functions/_shared/review-policy.mjs';

export const LOCAL_ADMIN_ID = '10000000-0000-4000-8000-000000000001';
export async function localReviewStore(directory) {
  await mkdir(directory, { recursive: true });
  const file = join(directory, 'reviews.json');
  let state;
  try { state = JSON.parse(await readFile(file, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; state = { reviews: [], manual_only: false, audit: [], limits: {} }; }
  let queue = Promise.resolve();
  function transaction(change) {
    const task = queue.then(async () => {
      const next = structuredClone(state); const result = change(next);
      await writeFile(file, JSON.stringify(next, null, 2)); state = next; return result;
    }); queue = task.catch(() => {}); return task;
  }
  function list(status, { offset, limit }) {
    const rows = state.reviews.filter(row => row.status === status).sort((a, b) => (b.published_at || b.created_at).localeCompare(a.published_at || a.created_at));
    return { rows: structuredClone(rows.slice(offset, offset + limit)), hasMore: rows.length > offset + limit };
  }
  return {
    settings: async () => ({ manual_only: state.manual_only }),
    isAdmin: async id => id === LOCAL_ADMIN_ID,
    findSubmission: async id => structuredClone(state.reviews.find(row => row.submission_id === id)),
    consumeRate: key => transaction(next => {
      const now = Date.now();
      for (const [k, value] of Object.entries(next.limits)) if (now - value.start > 86400000) delete next.limits[k];
      const limit = next.limits[key];
      if (!limit || now - limit.start >= 600000) next.limits[key] = { start: now, attempts: 0 };
      return ++next.limits[key].attempts <= 3;
    }),
    createReview: (row, photos) => transaction(next => {
      const old = next.reviews.find(item => item.submission_id === row.submission_id);
      if (old) { if (old.payload_hash !== row.payload_hash) throw new ReviewError('submission-conflict', 409); return { id: old.id, status: old.status, created: false }; }
      const saved = { ...row, moderation_reasons: [...row.moderation_reasons], created_at: new Date().toISOString(), review_photos: photos, version: 0 };
      if (next.manual_only) { saved.status = 'pending'; saved.moderation_reasons.push('manual-mode'); }
      if (photos.length) { saved.status = 'pending'; saved.moderation_reasons.push('photos'); }
      saved.published_at = saved.status === 'approved' ? new Date().toISOString() : null;
      next.reviews.push(saved); return { id: saved.id, status: saved.status, created: true };
    }),
    listPublic: async options => list('approved', options),
    listAdmin: async options => list(options.status, options),
    moderateReview: (actor, id, status, version) => transaction(next => {
      if (actor !== LOCAL_ADMIN_ID) throw new ReviewError('admin-required', 403);
      const row = next.reviews.find(item => item.id === id); if (!row) throw new ReviewError('review-not-found', 404);
      if (row.version !== version) throw new ReviewError('stale-review', 409);
      const previous = row.status; row.status = status; row.version++; row.reviewed_at = new Date().toISOString(); row.reviewed_by = actor;
      if (status === 'approved') row.published_at = new Date().toISOString();
      next.audit.push({ actor, review: id, from: previous, to: status, at: row.reviewed_at });
      return { id, status, version: row.version };
    }),
    deleteReview: (actor, id, version) => transaction(next => {
      if (actor !== LOCAL_ADMIN_ID) throw new ReviewError('admin-required', 403);
      next.photo_deletions ||= [];
      const row = next.reviews.find(item => item.id === id);
      if (row) {
        if (row.version !== version) throw new ReviewError('stale-review', 409);
        const paths = row.review_photos.map(photo => photo.storage_path);
        if (paths.length) next.photo_deletions.push({ review_id: id, storage_paths: paths });
        next.reviews = next.reviews.filter(item => item.id !== id);
        next.audit = next.audit.filter(item => item.review !== id);
        next.audit.push({ actor, action: 'delete', deleted_review_id: id, at: new Date().toISOString() });
      }
      return { id, storage_paths: next.photo_deletions.find(item => item.review_id === id)?.storage_paths || [] };
    }),
    pendingPhotoDeletions: async () => structuredClone((state.photo_deletions || []).slice(0, 13)),
    completePhotoDeletion: id => transaction(next => { next.photo_deletions = (next.photo_deletions || []).filter(item => item.review_id !== id); }),
    setManualMode: (actor, value) => transaction(next => {
      if (actor !== LOCAL_ADMIN_ID) throw new ReviewError('admin-required', 403);
      next.manual_only = value; next.audit.push({ actor, action: 'manual-mode', value, at: new Date().toISOString() });
    })
  };
}
