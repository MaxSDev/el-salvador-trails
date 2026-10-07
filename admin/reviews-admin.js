import { createClient } from './supabase-client.js';

const $ = id => document.getElementById(id);
const config = window.ESTReviewsConfig || {};
let client, session, page = 0, loading = false, hasMore = false, manualOnly = false;
let passwordFlow = ['invite', 'recovery'].includes(new URLSearchParams(location.hash.slice(1)).get('type'));
const reasons = { profanity: 'Palabras que requieren revisión', link: 'Incluye un enlace', 'personal-contact': 'Incluye datos de contacto', language: 'Idioma que requiere revisión', photos: 'Fotos pendientes de revisión', 'manual-mode': 'Revisión manual activada', 'harmful-content': 'El filtro detectó posible contenido dañino', 'moderation-unavailable': 'El filtro no pudo completar el análisis' };
function message(text, error = false) { $('admin-message').textContent = text; $('admin-message').dataset.error = String(error); $('admin-message').hidden = false; }
function failure(error) {
  if (error.status === 401) { session = null; showLogin(); return message('Tu sesión terminó. Vuelve a entrar.', true); }
  if (error.status === 403) return message('Esta cuenta no tiene permiso para administrar reseñas.', true);
  if (error.code === 'stale-review') return message('Otra persona ya cambió esta reseña. Actualiza la lista antes de decidir.', true);
  message('No se pudo completar la operación. Tus cambios no se han confirmado; vuelve a intentarlo.', true);
}
function showLogin() { $('login-section').hidden = false; $('review-section').hidden = true; $('password-section').hidden = true; $('review-list').replaceChildren(); }
async function request(path, options = {}) {
  const result = await client.auth.getSession();
  session = result.data.session;
  if (!session) { const error = new Error('session-required'); error.status = 401; throw error; }
  return window.ESTReviews.request(path, { ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), Authorization: 'Bearer ' + session.access_token } });
}
function element(tag, text, className) { const node = document.createElement(tag); if (text != null) node.textContent = text; if (className) node.className = className; return node; }
function renderReview(review) {
  const article = element('article', null, 'admin-review'); article.dataset.id = review.id;
  article.append(element('h3', review.author.name));
  const date = new Date(review.createdAt).toLocaleDateString('es-SV');
  article.append(element('p', `${review.rating} / 5 · ${review.author.country || 'País no indicado'} · ${date}`, 'review-meta'));
  if (review.tourRef) article.append(element('p', review.tourRef, 'review-meta'));
  article.append(element('p', review.comment, 'review-body'));
  if (review.reasons?.length) {
    const list = element('ul', null, 'review-reasons');
    [...new Set(review.reasons)].forEach(reason => list.append(element('li', reasons[reason] || 'Requiere revisión')));
    article.append(list);
  }
  if (review.photos?.length) {
    const photos = element('div', null, 'photo-list');
    review.photos.forEach((photo, index) => {
      let url; try { url = new URL(photo.url); } catch { return; }
      if (!['https:', 'http:'].includes(url.protocol)) return;
      const link = element('a'); link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
      const image = element('img'); image.src = url.href; image.alt = 'Foto adjunta ' + (index + 1); image.loading = 'lazy';
      link.append(image); photos.append(link);
    }); article.append(photos);
  }
  const actions = element('div', null, 'review-actions');
  for (const [status, label] of [['approved', 'Publicar'], ['rejected', 'Rechazar'], ['hidden', 'Ocultar']]) {
    if (review.status === status || (review.status === 'pending' && status === 'hidden')) continue;
    const button = element('button', label, status === 'approved' ? 'primary' : ''); button.type = 'button';
    button.addEventListener('click', async () => {
      if (!confirm(`${label} la reseña de ${review.author.name}?`)) return;
      actions.querySelectorAll('button').forEach(item => item.disabled = true);
      try {
        await request('/admin', { method: 'PATCH', body: JSON.stringify({ id: review.id, status, version: review.version }) });
        message('Reseña ' + ({ approved: 'publicada.', rejected: 'rechazada.', hidden: 'ocultada.' }[status])); page = 0; await load();
      } catch (error) { failure(error); actions.querySelectorAll('button').forEach(item => item.disabled = false); }
    }); actions.append(button);
  }
  const deleteButton = element('button', 'Borrar', 'danger'); deleteButton.type = 'button';
  deleteButton.addEventListener('click', async () => {
    if (!confirm(`¿Borrar definitivamente la reseña de ${review.author.name} y sus fotos? Esta acción no se puede deshacer.`)) return;
    actions.querySelectorAll('button').forEach(item => item.disabled = true);
    try {
      const result = await request('/admin', { method: 'DELETE', body: JSON.stringify({ id: review.id, version: review.version }) });
      if (result.deleted !== true || result.id !== review.id) throw new Error('Invalid deletion response');
      message(result.photosPending ? 'La reseña se borró. Sus fotos siguen pendientes de eliminación; pulsa Actualizar para volver a intentarlo.' : 'Reseña y fotos borradas definitivamente.');
      page = 0; await load(); $('reload').focus();
    } catch (error) { failure(error); actions.querySelectorAll('button').forEach(item => item.disabled = false); }
  });
  actions.append(deleteButton);
  article.append(actions); return article;
}
async function load() {
  if (loading) return;
  loading = true; $('review-list').setAttribute('aria-busy', 'true'); $('reload').disabled = true;
  $('previous-page').disabled = true; $('next-page').disabled = true;
  try {
    const data = await request(`/admin?status=${$('status-filter').value}&page=${page}`);
    if (!Array.isArray(data.reviews)) throw new Error('Invalid response');
    $('login-section').hidden = true; $('password-section').hidden = true; $('review-section').hidden = false;
    $('account-email').textContent = session.user.email;
    manualOnly = data.settings.manual_only; $('manual-mode').checked = manualOnly;
    if (data.photosPending) message('Algunas fotos de reseñas borradas siguen pendientes de eliminación. Pulsa Actualizar para volver a intentarlo.', true);
    $('review-list').replaceChildren();
    if (!data.reviews.length) $('review-list').append(element('p', 'No hay reseñas en esta categoría.'));
    else data.reviews.forEach(review => $('review-list').append(renderReview(review)));
    hasMore = data.hasMore; $('page-label').textContent = 'Página ' + (page + 1);
  } catch (error) { failure(error); }
  finally { loading = false; $('review-list').setAttribute('aria-busy', 'false'); $('reload').disabled = false; $('previous-page').disabled = page === 0; $('next-page').disabled = !hasMore; }
}
async function initialize() {
  if (!config.supabaseUrl || !config.publishableKey || !window.ESTReviews.configured()) {
    $('login-form').querySelectorAll('button').forEach(button => button.disabled = true);
    message('El panel todavía no está conectado. Pide al equipo de desarrollo que complete la configuración.', true); return;
  }
  client = createClient(config.supabaseUrl, config.publishableKey, { auth: { storage: sessionStorage, storageKey: 'est-review-admin', autoRefreshToken: true, persistSession: true, detectSessionInUrl: true } });
  if (config.localPreview && ['127.0.0.1', 'localhost'].includes(location.hostname)) $('local-notice').hidden = false;
  client.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') { passwordFlow = true; $('password-section').hidden = false; $('login-section').hidden = true; $('review-section').hidden = true; }
    if (event === 'SIGNED_OUT') showLogin();
  });
  const result = await client.auth.getSession(); session = result.data.session;
  if (session) {
    if (passwordFlow) { $('password-section').hidden = false; $('login-section').hidden = true; }
    else await load();
  }
}
$('login-form').addEventListener('submit', async event => {
  event.preventDefault(); if (!client) return;
  const button = event.target.querySelector('button[type=submit]'); button.disabled = true;
  try {
    const { data, error } = await client.auth.signInWithPassword({ email: event.target.elements.email.value, password: event.target.elements.password.value });
    if (error) { message('No pudimos iniciar sesión. Revisa el correo y la contraseña.', true); return; }
    session = data.session; event.target.elements.password.value = ''; $('admin-message').hidden = true; page = 0; await load();
  } catch { message('No se pudo conectar. Vuelve a intentarlo.', true); }
  finally { button.disabled = false; }
});
$('logout').addEventListener('click', async () => { await client.auth.signOut({ scope: 'local' }); session = null; showLogin(); });
$('reset-password').addEventListener('click', async () => {
  const input = $('login-form').elements.email;
  if (!input.reportValidity()) return;
  const { error } = await client.auth.resetPasswordForEmail(input.value, { redirectTo: location.origin + location.pathname });
  message(error ? 'No se pudo solicitar el enlace. Vuelve a intentarlo.' : 'Si esa cuenta existe, recibirá un enlace para cambiar la contraseña.', !!error);
});
$('password-form').addEventListener('submit', async event => {
  event.preventDefault(); const button = event.target.querySelector('button'); button.disabled = true;
  try {
    const { error } = await client.auth.updateUser({ password: event.target.elements.password.value });
    if (error) throw error;
    passwordFlow = false; event.target.reset(); message('Contraseña guardada.'); await load();
  } catch { message('No se pudo guardar la contraseña. Vuelve a intentarlo.', true); }
  finally { button.disabled = false; }
});
$('status-filter').addEventListener('change', () => { page = 0; load(); });
$('reload').addEventListener('click', () => load());
$('previous-page').addEventListener('click', () => { if (page > 0) { page--; load(); } });
$('next-page').addEventListener('click', () => { if (hasMore) { page++; load(); } });
$('manual-mode').addEventListener('change', async event => {
  const input = event.target; const value = input.checked; input.disabled = true;
  try { await request('/settings', { method: 'PATCH', body: JSON.stringify({ manualOnly: value }) }); manualOnly = value; message(value ? 'Todas las reseñas pasarán por revisión manual.' : 'Se activó la publicación automática de texto que pasa los controles.'); }
  catch (error) { input.checked = manualOnly; failure(error); }
  finally { input.disabled = false; }
});
initialize().catch(() => message('No se pudo cargar la sesión. Vuelve a abrir el panel.', true));
