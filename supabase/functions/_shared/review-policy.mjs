export class ReviewError extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status; }
}

export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const REQUEST_MAX_BYTES = 4 * PHOTO_MAX_BYTES + 64 * 1024;
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateReview(input) {
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const country = typeof input.country === 'string' ? input.country.trim() : '';
  const comment = typeof input.comment === 'string' ? input.comment.trim() : '';
  const rating = Number(input.rating);
  const lang = typeof input.lang === 'string' ? input.lang.toLowerCase() : '';
  const tourSlug = typeof input.tourSlug === 'string' ? input.tourSlug : '';
  if (name.length < 2 || name.length > 80) throw new ReviewError('name');
  if (country.length > 80) throw new ReviewError('country');
  if (comment.length < 20 || comment.length > 2000) throw new ReviewError('comment');
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new ReviewError('rating');
  if (!/^[a-z]{2,5}$/.test(lang)) throw new ReviewError('language');
  if (tourSlug && !/^[a-z0-9-]{1,100}$/.test(tourSlug)) throw new ReviewError('tour');
  if (input.consent !== true) throw new ReviewError('consent');
  if (!UUID.test(input.submissionId || '')) throw new ReviewError('submission-id');
  return { name, country, comment, rating, lang, tourSlug, submissionId: input.submissionId.toLowerCase(), consent: true };
}

// This list helps the classifier; it cannot certify identity or guarantee that all abuse is detected.
const words = ['puta', 'puto', 'mierda', 'cabron', 'pendejo', 'pendeja', 'verga', 'culero', 'culera', 'joder', 'maricon', 'coño', 'fuck', 'fucking', 'fucker', 'motherfucker', 'shit', 'shitty', 'bullshit', 'asshole', 'bitch', 'cunt', 'nigger', 'faggot', 'merda', 'porra', 'caralho', 'foda', 'foder', 'fodase', 'putaria', 'buceta', 'viado', 'cacete'];
const substitutions = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's' };
function normalized(text) {
  return text.normalize('NFKD').replace(/\p{M}/gu, '').replace(/[\u200B-\u200D\uFEFF]/g, '').toLowerCase().replace(/[013457@$]/g, c => substitutions[c]);
}
const profanity = words.map(word => new RegExp('(?:^|[^\\p{L}\\p{N}])' + normalized(word).split('').join('[\\s._*\\-]*') + '(?:$|[^\\p{L}\\p{N}])', 'u'));

export function localReviewFlags(review) {
  const raw = [review.name, review.country, review.comment].join(' ');
  const text = normalized(raw);
  const reasons = [];
  if (profanity.some(pattern => pattern.test(text))) reasons.push('profanity');
  if (/(?:https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|io|xyz)\b)/i.test(raw)) reasons.push('link');
  if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?\d[\s().-]*){8,}/i.test(raw)) reasons.push('personal-contact');
  if (!['es', 'en', 'pt'].includes(review.lang)) reasons.push('language');
  return reasons;
}

export async function decideReview(review, { photoCount, manualOnly, moderate }) {
  const reasons = localReviewFlags(review);
  if (photoCount) reasons.push('photos');
  if (manualOnly) reasons.push('manual-mode');
  // Anything already retained stays private; no need to send it to another service.
  if (!reasons.length) {
    try {
      const result = await moderate([review.name, review.country, review.comment].join('\n'));
      if (typeof result?.flagged !== 'boolean') throw new Error('Invalid moderation response');
      if (result.flagged) reasons.push('harmful-content');
    } catch { reasons.push('moderation-unavailable'); }
  }
  return { status: reasons.length ? 'pending' : 'approved', reasons: [...new Set(reasons)] };
}

export async function validatePhotos(files) {
  if (files.length > 4) throw new ReviewError('photo-count');
  const result = [];
  for (const file of files) {
    if (!file.size || file.size > PHOTO_MAX_BYTES) throw new ReviewError('photo-size');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const png = [137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value);
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp = new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP';
    const detected = png ? ['image/png', 'png'] : jpeg ? ['image/jpeg', 'jpg'] : webp ? ['image/webp', 'webp'] : null;
    if (!detected || file.type !== detected[0]) throw new ReviewError('photo-format');
    result.push({ bytes, mime: detected[0], extension: detected[1], size: file.size });
  }
  return result;
}
