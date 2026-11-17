import { getAdminClient, isLocalPreview, recoveryRequested, redirectToAdminLogin, initializeAdminNavigation } from './admin-session.js';

const $ = id => document.getElementById(id);
const config = window.ESTReviewsConfig || {};
let client, session, page = 0, loading = false, hasMore = false;
const reasons = { profanity: 'Palabras que requieren revisión', link: 'Incluye un enlace', 'personal-contact': 'Incluye datos de contacto', language: 'Idioma que requiere revisión', photos: 'Fotos pendientes de revisión', 'manual-mode': 'Revisión manual activada', 'harmful-content': 'El filtro detectó posible contenido dañino', 'moderation-unavailable': 'El filtro no pudo completar el análisis' };
function message(text, error = false) { $('admin-message').textContent = text; $('admin-message').dataset.error = String(error); $('admin-message').hidden = false; }
function failure(error) {
  if (error.status === 401) { session = null; showLogin(); return message('Tu sesión terminó. Vuelve a entrar.', true); }
  if (error.status === 403) return message('Esta cuenta no tiene permiso para administrar reseñas.', true);
  if (error.code === 'stale-review') return message('Otra persona ya cambió esta reseña. Actualiza la lista antes de decidir.', true);
  message('No se pudo completar la operación. Tus cambios no se han confirmado; vuelve a intentarlo.', true);
}
function showLogin() { $('login-section').hidden = false; $('review-section').hidden = true; $('review-list').replaceChildren(); }
async function request(path, options = {}) {
  const result = await client.auth.getSession();
  session = result.data.session;
  if (!session) { const error = new Error('session-required'); error.status = 401; throw error; }
  return window.ESTReviews.request(path, { ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), Authorization: 'Bearer ' + session.access_token } });
}
function element(tag, text, className) { const node = document.createElement(tag); if (text != null) node.textContent = text; if (className) node.className = className; return node; }
function renderReview(review) {
  const article = element('article', null, 'admin-review'); article.dataset.id = review.id;
  article.append(element('span', ({ pending: 'Pendiente de revisión', approved: 'Publicada', rejected: 'Rechazada', hidden: 'Oculta' })[review.status], 'review-status'));
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
  const more = element('details', null, 'review-more');
  more.append(element('summary', 'Más opciones'));
  const secondary = element('div', null, 'secondary-actions'); more.append(secondary);
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
    }); (status === 'hidden' ? secondary : actions).append(button);
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
  secondary.append(deleteButton); actions.append(more);
  article.append(actions); return article;
}
async function load() {
  if (loading) return;
  loading = true; $('review-list').setAttribute('aria-busy', 'true'); $('reload').disabled = true;
  $('previous-page').disabled = true; $('next-page').disabled = true;
  try {
    const data = await request(`/admin?status=${$('status-filter').value}&page=${page}`);
    if (!Array.isArray(data.reviews)) throw new Error('Invalid response');
    $('login-section').hidden = true; $('review-section').hidden = false;
    $('account-email').textContent = session.user.email;
    const manualOnly = data.settings?.manual_only === true;
    $('manual-status').textContent = manualOnly ? 'Revisión manual activada' : 'La revisión manual aún no está activada';
    $('manual-description').textContent = manualOnly ? 'Las reseñas nuevas esperan tu aprobación antes de aparecer en la página. Lee la experiencia completa antes de decidir.' : 'La configuración actual permite publicar algunos textos automáticamente. Pide al equipo que active la revisión manual acordada.';
    $('manual-status').parentElement.dataset.warning = String(!manualOnly);
    $('queue-title').textContent = ({ pending: 'Pendientes de revisión', approved: 'Reseñas publicadas', rejected: 'Reseñas rechazadas', hidden: 'Reseñas ocultas' })[$('status-filter').value];
    $('queue-summary').textContent = $('status-filter').value === 'pending' ? 'Publica o rechaza cada reseña después de leerla. Una observación negativa también puede aportar confianza.' : 'Puedes volver a publicar una reseña o revisar sus otras opciones.';
    if (data.photosPending) message('Algunas fotos de reseñas borradas siguen pendientes de eliminación. Pulsa Actualizar para volver a intentarlo.', true);
    $('review-list').replaceChildren();
    if (!data.reviews.length) $('review-list').append(element('p', $('status-filter').value === 'pending' ? 'No hay reseñas pendientes. Las nuevas experiencias aparecerán aquí para que las revises.' : 'No hay reseñas en esta categoría.', 'empty-reviews'));
    else data.reviews.forEach(review => $('review-list').append(renderReview(review)));
    hasMore = data.hasMore; $('page-label').textContent = 'Página ' + (page + 1);
  } catch (error) { failure(error); }
  finally { loading = false; $('review-list').setAttribute('aria-busy', 'false'); $('reload').disabled = false; $('previous-page').disabled = page === 0; $('next-page').disabled = !hasMore; }
}
async function initialize() {
  if (recoveryRequested()) { redirectToAdminLogin(); return; }
  client = getAdminClient();
  if (!config.supabaseUrl || !config.publishableKey || !window.ESTReviews.configured()) {
    message('El panel todavía no está conectado. Pide al equipo de desarrollo que complete la configuración.', true); return;
  }
  if (isLocalPreview()) $('local-notice').hidden = false;
  client.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') redirectToAdminLogin();
    if (event === 'SIGNED_OUT') showLogin();
  });
  const result = await client.auth.getSession(); session = result.data.session;
  if (session) {
    initializeAdminNavigation(client).catch(() => {});
    await load();
  } else showLogin();
}
$('logout').addEventListener('click', async () => {
  const button = $('logout'); button.disabled = true;
  try {
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) throw error;
    session = null; location.assign('index.html');
  } catch { message('No se pudo cerrar la sesión. Vuelve a intentarlo.', true); }
  finally { button.disabled = false; }
});
$('status-filter').addEventListener('change', () => { page = 0; load(); });
$('reload').addEventListener('click', () => load());
$('previous-page').addEventListener('click', () => { if (page > 0) { page--; load(); } });
$('next-page').addEventListener('click', () => { if (hasMore) { page++; load(); } });
initialize().catch(() => message('No se pudo cargar la sesión. Vuelve a abrir el panel.', true));
