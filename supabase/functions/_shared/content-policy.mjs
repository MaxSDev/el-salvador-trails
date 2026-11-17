export class ContentError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export const SITE_KEYS = [
  ...Array.from({ length: 4 }, (_, i) => [`slide${i}.title`, `slide${i}.desc`]).flat(),
  'home.guide.title', 'home.guide.quote', 'home.guide.text',
  ...Array.from({ length: 5 }, (_, i) => [`home.faq.q${i + 1}`, `home.faq.a${i + 1}`]).flat(),
  ...['hero', 'intro', 'beyond', 'partners', 'country', 'outlook', 'closing', 'signature'].map(key => 'realestate.' + key)
];
const languages = ['es', 'en', 'pt'];
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function identifier(value) {
  if (typeof value !== 'string' || value.length > 100 || !slug.test(value)) throw new ContentError('Identificador inválido. Usa letras minúsculas, números y guiones.');
  return value;
}
function text(value = '', max = 12000) {
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new ContentError('El texto es inválido o demasiado largo.');
  return value.trim();
}
function localized(value, max, required = false) {
  const result = Object.fromEntries(languages.map(lang => [lang, text(value?.[lang] ?? '', max)]));
  if (required && !result.es) throw new ContentError('Completa el título y las descripciones en español.');
  return result;
}
function lines(value) {
  return Object.fromEntries(languages.map(lang => {
    const list = value?.[lang] ?? [];
    if (!Array.isArray(list) || list.length > 40) throw new ContentError('Máximo 40 elementos por lista.');
    return [lang, list.map(v => text(v, 1000)).filter(Boolean)];
  }));
}
function tourMetadata(input, result) {
  if (input.contentSource !== undefined) {
    if (input.contentSource === null) result.contentSource = null;
    else {
      const source = input.contentSource;
      if (typeof source !== 'object' || Array.isArray(source)) throw new ContentError('La referencia del contenido es inválida.');
      result.contentSource = {};
      for (const key of ['document', 'client', 'translations']) if (source[key] !== undefined) result.contentSource[key] = text(source[key], 250);
      if (source.receivedDate !== undefined) {
        const date = text(source.receivedDate, 10);
        const parsed = new Date(date + 'T00:00:00Z');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) throw new ContentError('La fecha de referencia es inválida.');
        result.contentSource.receivedDate = date;
      }
      if (source.sourceNumber !== undefined) {
        if (!Number.isSafeInteger(source.sourceNumber) || source.sourceNumber < 1 || source.sourceNumber > 10000) throw new ContentError('El número de referencia es inválido.');
        result.contentSource.sourceNumber = source.sourceNumber;
      }
    }
  }
  if (input.optionalExtras !== undefined) {
    const extras = input.optionalExtras ?? [];
    if (!Array.isArray(extras) || extras.length > 30) throw new ContentError('Máximo 30 opciones adicionales por tour.');
    const used = new Set();
    result.optionalExtras = extras.map(extra => {
      const id = identifier(extra?.id);
      if (used.has(id)) throw new ContentError('Cada opción adicional debe tener un identificador diferente.');
      used.add(id);
      return { id, label: localized(extra.label, 1200) };
    });
  }
  if (input.imageDescriptions !== undefined && input.imageDescriptions !== null) {
    if (typeof input.imageDescriptions !== 'object' || Array.isArray(input.imageDescriptions)) throw new ContentError('Las descripciones de las fotos son inválidas.');
    result.imageDescriptions = Object.fromEntries(languages.map(language => {
      const captions = input.imageDescriptions[language] ?? [];
      if (!Array.isArray(captions) || captions.length > 30) throw new ContentError('Máximo 30 descripciones de fotos por idioma.');
      // Keep blank positions: descriptions correspond to image indexes.
      return [language, captions.map(caption => text(caption, 1200))];
    }));
  } else if (input.imageDescriptions === null) result.imageDescriptions = null;
  if (input.mediaNote !== undefined) result.mediaNote = input.mediaNote === null ? null : localized(input.mediaNote, 2000);
  if (input.rating !== undefined) {
    if (input.rating !== null && (typeof input.rating !== 'number' || !Number.isFinite(input.rating) || input.rating < 1 || input.rating > 5)) throw new ContentError('La valoración debe estar entre 1 y 5 o quedar vacía.');
    result.rating = input.rating;
  }
  if (input.ratingCount !== undefined) {
    if (!Number.isSafeInteger(input.ratingCount) || input.ratingCount < 0 || input.ratingCount > 1000000) throw new ContentError('El número de valoraciones es inválido.');
    result.ratingCount = input.ratingCount;
  }
}
export function safeLink(value, hosts) {
  if (!value) return '';
  const input = text(value, 2000); let url;
  try { url = new URL(input); } catch { throw new ContentError('El enlace debe ser una dirección HTTPS completa.'); }
  if (url.protocol !== 'https:' || url.username || url.password || (hosts && !hosts.some(host => url.hostname === host || url.hostname.endsWith('.' + host)))) throw new ContentError('El enlace no está permitido.');
  return url.href;
}
export function imagePath(value, mediaOrigin = '') {
  const input = text(value, 1500);
  if (/^assets\/[a-zA-Z0-9_ /().-]+\.(?:jpe?g|png|webp|avif)$/i.test(input) && !input.split('/').includes('..')) return input;
  let url; try { url = new URL(input); } catch { throw new ContentError('Elige una imagen de la biblioteca o sube una imagen.'); }
  if (!mediaOrigin || url.origin !== mediaOrigin || url.search || url.hash || !/^\/storage\/v1\/object\/public\/site-media\/[0-9a-f-]{36}\.(?:jpg|png|webp)$/.test(url.pathname)) throw new ContentError('La imagen no pertenece a la biblioteca de este sitio.');
  return url.href;
}
export function validateTour(input, { publish = true, mediaOrigin = '' } = {}) {
  if (!input || typeof input !== 'object') throw new ContentError('Tour inválido.');
  const result = { id: identifier(input.id), slug: identifier(input.slug || input.id), category: input.category };
  if (!['day', 'package'].includes(result.category)) throw new ContentError('Selecciona la categoría del tour.');
  result.sortOrder = input.sortOrder ?? 9999;
  if (!Number.isInteger(result.sortOrder) || result.sortOrder < 0 || result.sortOrder > 10000) throw new ContentError('El orden debe ser un número entero entre 0 y 10000.');
  for (const name of ['title', 'shortDescription', 'fullDescription', 'galleryLabel', 'duration', 'groupSize', 'pickup', 'badge']) result[name] = localized(input[name], name === 'fullDescription' ? 12000 : 1200, publish && ['title', 'shortDescription', 'fullDescription'].includes(name));
  if (!Array.isArray(input.images) || input.images.length > 30 || (publish && !input.images.length)) throw new ContentError('El tour necesita al menos una imagen para publicarse; máximo 30.');
  result.images = input.images.map(v => imagePath(v, mediaOrigin));
  result.highlights = lines(input.highlights); result.included = lines(input.included);
  if (input.itinerary && (!Array.isArray(input.itinerary) || input.itinerary.length > 30)) throw new ContentError('Máximo 30 días en el itinerario.');
  result.itinerary = (input.itinerary || []).map(day => ({ day: text(day.day, 60), title: localized(day.title, 250), text: localized(day.text, 4000) }));
  result.meetingPoint = { address: localized(input.meetingPoint?.address, 1000), photo: input.meetingPoint?.photo ? imagePath(input.meetingPoint.photo, mediaOrigin) : '', mapUrl: safeLink(input.meetingPoint?.mapUrl, ['google.com', 'maps.app.goo.gl', 'goo.gl']) };
  result.socialVideo = { platform: input.socialVideo?.platform === 'instagram' ? 'instagram' : 'tiktok', url: safeLink(input.socialVideo?.url, ['tiktok.com', 'instagram.com']) };
  if (input.price && input.price.amount !== null && input.price.amount !== '') {
    if (typeof input.price.amount !== 'number' || !Number.isFinite(input.price.amount) || input.price.amount < 0 || input.price.amount > 100000 || !['person', 'group'].includes(input.price.unit)) throw new ContentError('Precio inválido. Indica un monto en USD y su unidad.');
    result.price = { amount: Math.round(input.price.amount * 100) / 100, currency: 'USD', unit: input.price.unit };
  } else result.price = null;
  tourMetadata(input, result);
  return result;
}
export function validatePartner(input, { publish = true, mediaOrigin = '' } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ContentError('Alojamiento o aliado inválido.');
  const id = identifier(input.id);
  if (!id.startsWith('partner-')) throw new ContentError('El identificador del aliado debe comenzar con partner-.');
  const publicSlug = identifier(input.slug || id.slice('partner-'.length));
  if (id !== 'partner-' + publicSlug) throw new ContentError('El enlace del aliado no corresponde a su identificador.');
  const result = { id, slug: publicSlug, type: input.type ?? 'lodging' };
  if (!['lodging', 'partner'].includes(result.type)) throw new ContentError('Selecciona alojamiento o negocio aliado.');
  result.sortOrder = input.sortOrder ?? 9999;
  if (!Number.isInteger(result.sortOrder) || result.sortOrder < 0 || result.sortOrder > 10000) throw new ContentError('El orden debe ser un número entero entre 0 y 10000.');
  for (const key of ['name', 'tagline', 'shortDescription', 'description', 'location']) result[key] = localized(input[key], key === 'description' ? 12000 : 1200, publish && ['name', 'shortDescription', 'description'].includes(key));
  result.address = text(input.address, 1000);
  result.url = safeLink(input.url);
  const images = input.images ?? [];
  if (!Array.isArray(images) || images.length > 30 || (publish && !images.length)) throw new ContentError('El aliado necesita al menos una imagen para publicarse; máximo 30.');
  result.images = images.map(value => imagePath(value, mediaOrigin));
  const captions = input.imageCaptions ?? [];
  if (!Array.isArray(captions) || captions.length > 30) throw new ContentError('Máximo 30 descripciones de imágenes.');
  result.imageCaptions = result.images.map((_, index) => localized(captions[index], 1200));
  return result;
}
export function validateSite(input, { mediaOrigin = '' } = {}) {
  if (!input || typeof input !== 'object') throw new ContentError('Información inválida.');
  const result = { texts: {}, images: {}, contacts: {} };
  for (const [key, value] of Object.entries(input.texts || {})) {
    if (!SITE_KEYS.includes(key)) throw new ContentError('Este texto no es editable desde el panel.');
    result.texts[key] = localized(value, 3000);
  }
  for (const [key, value] of Object.entries(input.images || {})) {
    if (!['hero0', 'hero1', 'hero2', 'hero3', 'guide', 'estateHero'].includes(key)) throw new ContentError('Imagen de sección inválida.');
    if (value) result.images[key] = imagePath(value, mediaOrigin);
  }
  const contacts = input.contacts || {};
  result.contacts.whatsapp = text(contacts.whatsapp, 15);
  if (result.contacts.whatsapp && !/^[1-9]\d{6,14}$/.test(result.contacts.whatsapp)) throw new ContentError('WhatsApp: usa código de país y número, sin espacios ni signo +.');
  result.contacts.email = text(contacts.email, 254);
  if (result.contacts.email && !/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(result.contacts.email)) throw new ContentError('Correo inválido.');
  for (const name of ['instagram', 'facebook', 'tiktok']) result.contacts[name] = safeLink(contacts[name], [name + '.com']);
  return result;
}
