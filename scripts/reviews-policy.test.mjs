import assert from 'node:assert/strict';
import test from 'node:test';

const policy = await import('../supabase/functions/_shared/review-policy.mjs').catch(() => ({}));
const valid = { name: 'Ana López', country: 'El Salvador', rating: 3, comment: 'El recorrido fue agradable y el guía llegó a tiempo.', lang: 'es', consent: true, tourSlug: 'volcan-santa-ana', submissionId: '4b79dc77-141c-4f8d-ad27-9db174095c0b' };

test('validates a guest review without requiring an account or email', () => {
  assert.equal(typeof policy.validateReview, 'function');
  const result = policy.validateReview(valid);
  assert.equal(result.name, 'Ana López');
  assert.equal(result.rating, 3);
  assert.equal(result.comment, valid.comment);
});

test('rejects missing consent, fractional stars and oversized comments', () => {
  for (const change of [{ consent: false }, { rating: 2.5 }, { comment: 'x'.repeat(2001) }, { name: 'A' }, { submissionId: 'invalid' }]) {
    assert.throws(() => policy.validateReview({ ...valid, ...change }), error => error.status === 400);
  }
});

test('retains profane text, including common spacing and symbol evasions, in three languages', () => {
  for (const comment of ['El guía fue una p.u.t.a durante el recorrido.', 'El guía fue una p u t a durante el recorrido.', 'The guide was a fücking asshole during this trip.', 'O passeio foi uma m3rda e não gostei de nada.']) {
    assert.ok(policy.localReviewFlags({ ...valid, comment }).includes('profanity'));
  }
});

test('does not treat a substring or a low rating as profanity', () => {
  assert.deepEqual(policy.localReviewFlags({ ...valid, rating: 1, comment: 'Hubo una disputa por el horario. El servicio puede mejorar.' }), []);
});

test('routes URLs, unhandled languages and public personal contact information to review', () => {
  assert.ok(policy.localReviewFlags({ ...valid, comment: 'Visita https://spam.example para una oferta mejor.' }).includes('link'));
  assert.ok(policy.localReviewFlags({ ...valid, lang: 'fr' }).includes('language'));
  assert.ok(policy.localReviewFlags({ ...valid, comment: 'Mi correo es ana@example.com, escríbeme para más detalles.' }).includes('personal-contact'));
});

test('auto approves only clean text when the external classifier succeeds', async () => {
  const clean = await policy.decideReview(valid, { photoCount: 0, manualOnly: false, moderate: async () => ({ flagged: false }) });
  assert.equal(clean.status, 'approved');
  assert.deepEqual(clean.reasons, []);
  const flagged = await policy.decideReview(valid, { photoCount: 0, manualOnly: false, moderate: async () => ({ flagged: true }) });
  assert.equal(flagged.status, 'pending');
  assert.ok(flagged.reasons.includes('harmful-content'));
});

test('classifier errors, malformed responses, photos and manual mode never auto publish', async () => {
  const cases = [
    { moderate: async () => { throw new Error('offline'); }, reason: 'moderation-unavailable' },
    { moderate: async () => ({}), reason: 'moderation-unavailable' },
    { photoCount: 1, reason: 'photos' },
    { manualOnly: true, reason: 'manual-mode' }
  ];
  for (const scenario of cases) {
    const result = await policy.decideReview(valid, { photoCount: 0, manualOnly: false, moderate: async () => ({ flagged: false }), ...scenario });
    assert.equal(result.status, 'pending');
    assert.ok(result.reasons.includes(scenario.reason));
  }
});

test('validates photo count, maximum size and file signatures instead of trusting filenames', async () => {
  const png = new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0])], 'foto.png', { type: 'image/png' });
  assert.equal((await policy.validatePhotos([png]))[0].extension, 'png');
  await assert.rejects(policy.validatePhotos(Array(5).fill(png)), error => error.code === 'photo-count');
  await assert.rejects(policy.validatePhotos([new File(['<script>alert(1)</script>'], 'foto.png', { type: 'image/png' })]), error => error.code === 'photo-format');
  await assert.rejects(policy.validatePhotos([new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.png', { type: 'image/png' })]), error => error.code === 'photo-size');
});
