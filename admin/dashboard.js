import { getAdminClient, isLocalPreview, recoveryRequested, adminHomeUrl, loadAdminAccess } from './admin-session.js';

const $ = id => document.getElementById(id);
const client = getAdminClient();
let passwordFlow = recoveryRequested();
let accessVersion = 0;
const allowedNext = new Set(['content.html', 'real-estate.html', 'reviews.html', 'site.html']);
function message(text, error = false) { $('admin-message').textContent = text; $('admin-message').dataset.error = String(error); $('admin-message').hidden = false; }
function showSection(id) { for (const section of ['login-section', 'password-section', 'dashboard-section']) $(section).hidden = section !== id; }
function showLogin() { accessVersion++; showSection('login-section'); $('login-form').elements.password.value = ''; }
function requestedDestination() { const next = new URL(location.href).searchParams.get('next'); return allowedNext.has(next) ? next : null; }

async function showDashboard({ navigate = false } = {}) {
  if (passwordFlow) { showSection('password-section'); return; }
  const version = ++accessVersion;
  $('reload-access').disabled = true;
  $('module-grid').setAttribute('aria-busy', 'true');
  try {
    const access = await loadAdminAccess(client);
    if (version !== accessVersion || passwordFlow) return;
    if (!access.session || [access.content, access.reviews].some(module => module?.reason === 'session-required')) {
      showLogin(); message('Tu sesión terminó. Vuelve a entrar.', true); return;
    }
    $('account-email').textContent = access.session.user.email;
    showSection('dashboard-section');
    let available = 0, unavailable = 0;
    document.querySelectorAll('[data-module]').forEach(card => {
      const result = access[card.dataset.module];
      card.hidden = result.allowed === false;
      card.classList.toggle('module-unavailable', result.allowed === null);
      const link = card.querySelector('a'); const status = card.querySelector('.module-status');
      link.hidden = result.allowed !== true;
      status.hidden = result.allowed === true;
      if (result.allowed === true) available++;
      else if (result.allowed === null) {
        unavailable++;
        status.textContent = result.reason === 'unconfigured' ? 'Esta sección aún no está conectada. Pide al equipo que complete su configuración.' : 'No pudimos comprobar esta sección. Pulsa “Actualizar accesos” para volver a intentarlo.';
      }
    });
    $('no-access').hidden = available !== 0 || unavailable !== 0;
    if (navigate) {
      const next = requestedDestination();
      const kind = next === 'reviews.html' ? 'reviews' : 'content';
      if (next && access[kind].allowed === true) location.assign(new URL(next, adminHomeUrl()).href);
    }
  } catch { message('No se pudieron comprobar los accesos. Vuelve a intentarlo.', true); }
  finally { $('reload-access').disabled = false; $('module-grid').setAttribute('aria-busy', 'false'); }
}

$('login-form').addEventListener('submit', async event => {
  event.preventDefault(); if (!client) return;
  const button = event.target.querySelector('button[type=submit]'); button.disabled = true;
  try {
    const { data, error } = await client.auth.signInWithPassword({ email: event.target.elements.email.value, password: event.target.elements.password.value });
    if (error || !data.session) { message('No pudimos iniciar sesión. Revisa el correo y la contraseña.', true); return; }
    event.target.elements.password.value = ''; $('admin-message').hidden = true;
    await showDashboard({ navigate: true });
  } catch { message('No se pudo conectar. Vuelve a intentarlo.', true); }
  finally { button.disabled = false; }
});
$('logout').addEventListener('click', async () => {
  const button = $('logout'); button.disabled = true;
  try { const { error } = await client.auth.signOut({ scope: 'local' }); if (error) throw error; showLogin(); $('admin-message').hidden = true; }
  catch { message('No se pudo cerrar la sesión. Vuelve a intentarlo.', true); }
  finally { button.disabled = false; }
});
$('reset-password').addEventListener('click', async () => {
  const input = $('login-form').elements.email;
  if (!client || !input.reportValidity()) return;
  const button = $('reset-password'); button.disabled = true;
  try {
    const { error } = await client.auth.resetPasswordForEmail(input.value, { redirectTo: adminHomeUrl() });
    if (error) throw error;
    message('Si esa cuenta existe, recibirá un enlace para cambiar la contraseña.');
  } catch { message('No se pudo solicitar el enlace. Vuelve a intentarlo.', true); }
  finally { button.disabled = false; }
});
$('password-form').addEventListener('submit', async event => {
  event.preventDefault(); if (!client) return;
  const button = event.target.querySelector('button'); button.disabled = true;
  try {
    const { error } = await client.auth.updateUser({ password: event.target.elements.password.value });
    if (error) throw error;
    passwordFlow = false; event.target.reset();
    history.replaceState(null, '', location.pathname + location.search);
    message('Contraseña guardada. Ya puedes administrar la página.'); await showDashboard();
  } catch { message('No se pudo guardar la contraseña. El enlace puede haber vencido; solicita uno nuevo.', true); }
  finally { button.disabled = false; }
});
$('reload-access').addEventListener('click', () => showDashboard());

async function initialize() {
  if (isLocalPreview()) $('local-notice').hidden = false;
  if (!client) {
    $('login-form').querySelectorAll('button').forEach(button => button.disabled = true);
    message('El panel todavía no está conectado. Pide al equipo que complete la configuración.', true); return;
  }
  client.auth.onAuthStateChange(event => {
    if (event === 'PASSWORD_RECOVERY') { passwordFlow = true; accessVersion++; showSection('password-section'); }
    if (event === 'SIGNED_OUT') { passwordFlow = false; showLogin(); }
  });
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  if (passwordFlow && data.session) showSection('password-section');
  else if (data.session) await showDashboard();
  else if (passwordFlow) message('El enlace de acceso ya no es válido. Solicita uno nuevo con tu correo.', true);
}
initialize().catch(() => message('No se pudo cargar tu sesión. Vuelve a abrir el panel.', true));
