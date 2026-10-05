import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

function element() {
  const classes = new Set();
  const listeners = new Map();
  const attributes = new Map();
  return {
    classList: {
      add: value => classes.add(value),
      remove: value => classes.delete(value),
      contains: value => classes.has(value),
      toggle(value, force) {
        if (typeof force === 'boolean') {
          if (force) classes.add(value);
          else classes.delete(value);
          return force;
        }
        if (classes.has(value)) {
          classes.delete(value);
          return false;
        }
        classes.add(value);
        return true;
      }
    },
    addEventListener: (type, handler) => listeners.set(type, handler),
    dispatch: (type, event = {}) => listeners.get(type)?.(event),
    setAttribute: (name, value) => attributes.set(name, value),
    getAttribute: name => attributes.get(name),
    querySelector: () => null,
    querySelectorAll: () => [],
    contains(target) { return target === this; },
    focus() { this.focused = true; }
  };
}

async function setupNavigation() {
  const source = await readFile(new URL('../js/site.js', import.meta.url), 'utf8');
  const toggle = element();
  const menu = element();
  const nav = element();
  const body = element();
  const utility = element();
  const firstLink = element();
  const secondLink = element();
  const links = [firstLink, secondLink];
  const animationFrames = [];
  const timers = [];
  let menuVisibilityCommitted = false;
  nav.contains = target => target === nav || target === utility;
  menu.querySelector = selector => selector === 'a' ? firstLink : null;
  menu.querySelectorAll = selector => selector === 'a' ? links : [];
  firstLink.focus = () => {
    if (menuVisibilityCommitted) firstLink.focused = true;
  };
  const documentListeners = new Map();
  const windowListeners = new Map();
  const document = {
    body,
    addEventListener(type, handler) {
      const handlers = documentListeners.get(type) || [];
      handlers.push(handler);
      documentListeners.set(type, handlers);
    },
    dispatch(type, event = {}) {
      for (const handler of documentListeners.get(type) || []) handler(event);
    },
    querySelector(selector) {
      if (selector === '[data-menu-toggle]') return toggle;
      if (selector === 'nav.fixed-nav-light') return nav;
      return null;
    },
    querySelectorAll: () => [],
    getElementById: id => id === 'mobile-menu' ? menu : null
  };
  const window = {
    scrollY: 0,
    addEventListener(type, handler) {
      const handlers = windowListeners.get(type) || [];
      handlers.push(handler);
      windowListeners.set(type, handlers);
    },
    dispatch(type, event = {}) {
      for (const handler of windowListeners.get(type) || []) handler(event);
    },
    requestAnimationFrame(callback) {
      animationFrames.push(callback);
    },
    setTimeout(callback) {
      timers.push(callback);
    }
  };

  vm.runInNewContext(source, {
    document,
    window,
    requestAnimationFrame: callback => window.requestAnimationFrame(callback),
    setTimeout: callback => window.setTimeout(callback)
  });
  documentListeners.get('DOMContentLoaded').forEach(handler => handler());

  return {
    body,
    document,
    firstLink,
    menu,
    nav,
    toggle,
    utility,
    window,
    flushAnimationFrame() {
      menuVisibilityCommitted = true;
      for (const callback of animationFrames.splice(0)) callback();
    },
    flushTimers() {
      for (const callback of timers.splice(0)) callback();
    }
  };
}

test('el menú inmersivo enfoca su primer enlace cuando la capa ya es visible', async () => {
  const {
    body,
    document,
    firstLink,
    flushAnimationFrame,
    flushTimers,
    menu,
    toggle
  } = await setupNavigation();

  let defaultPrevented = false;
  toggle.dispatch('keydown', {
    key: 'Enter',
    preventDefault() { defaultPrevented = true; }
  });
  assert.equal(defaultPrevented, true);
  assert.equal(menu.classList.contains('open'), true);
  assert.equal(menu.getAttribute('aria-hidden'), 'false');
  assert.equal(body.classList.contains('is-menu-open'), true);
  flushAnimationFrame();
  assert.equal(firstLink.focused, true);

  firstLink.focused = false;
  toggle.dispatch('keyup', { key: 'Enter' });
  flushTimers();
  assert.equal(firstLink.focused, true);

  document.dispatch('keydown', { key: 'Escape' });

  assert.equal(menu.classList.contains('open'), false);
  assert.equal(menu.getAttribute('aria-hidden'), 'true');
  assert.equal(body.classList.contains('is-menu-open'), false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(toggle.focused, true);
});

test('elegir un enlace cierra el menú y desbloquea la página', async () => {
  const { body, firstLink, menu, toggle } = await setupNavigation();

  toggle.dispatch('click');
  firstLink.dispatch('click');

  assert.equal(menu.classList.contains('open'), false);
  assert.equal(menu.getAttribute('aria-hidden'), 'true');
  assert.equal(body.classList.contains('is-menu-open'), false);
});

test('la navegación adopta estado sólido únicamente después de 72 px', async () => {
  const { nav, window } = await setupNavigation();

  assert.equal(nav.classList.contains('is-scrolled'), false);
  window.scrollY = 72;
  window.dispatch('scroll');
  assert.equal(nav.classList.contains('is-scrolled'), false);

  window.scrollY = 73;
  window.dispatch('scroll');
  assert.equal(nav.classList.contains('is-scrolled'), true);
});

test('usar una utilidad del encabezado no cierra el menú inmersivo', async () => {
  const { document, menu, toggle, utility } = await setupNavigation();

  toggle.dispatch('click');
  document.dispatch('click', { target: utility });

  assert.equal(menu.classList.contains('open'), true);
});
