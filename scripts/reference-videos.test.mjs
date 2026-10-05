import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

async function loadRegistry() {
  const source = await read('data/reference-videos.js');
  const context = { window: {} };
  vm.runInNewContext(source, context);
  return context.window.EST_REFERENCE_VIDEOS;
}

test('el registro mantiene exactamente cuatro referencias temporales sin aprobar para producción', async () => {
  const registry = await loadRegistry();
  assert.equal(registry.mode, 'reference');
  assert.equal(registry.productionApproved, false);
  assert.equal(Object.keys(registry.items).join(','), 'main,volcano,flowers,city');
  assert.equal(new Set(Object.values(registry.items).map(video => video.youtubeId)).size, 4);
  assert.ok(Object.values(registry.items).every(video => video.status === 'temporary'));
});

test('cada referencia conserva el ID, autor, fuente y relación verificados', async () => {
  const registry = await loadRegistry();
  const expected = {
    main: ['zwagQ8pF9hs', 'MITUR El Salvador'],
    volcano: ['C_-Ooep_7Yk', 'Pato Viajes y Aventuras'],
    flowers: ['8y4fzg8JJdc', 'Santi Foci'],
    city: ['fiSf0t8KOG8', 'DelvisD']
  };

  for (const [key, video] of Object.entries(registry.items)) {
    assert.deepEqual([video.youtubeId, video.author], expected[key]);
    assert.equal(video.sourceUrl, `https://www.youtube.com/watch?v=${video.youtubeId}`);
    assert.ok(video.title.length > 8);
    assert.ok(video.relation.length > 8);
    assert.match(video.poster, /^assets\//);
  }
});

test('la Home ofrece cuatro activadores y un solo diálogo sin contactar YouTube en el HTML inicial', async () => {
  const html = await read('index.html');
  assert.equal((html.match(/data-video-trigger=/g) || []).length, 4);
  assert.equal((html.match(/data-video-modal(?:\s|>)/g) || []).length, 1);
  assert.doesNotMatch(html, /<iframe\b/i);
  assert.doesNotMatch(html, /youtube(?:-nocookie)?\.com\/embed/i);
});

function fakeElement(dataset = {}) {
  const listeners = new Map();
  const attributes = new Map();
  const classes = new Set();
  return {
    dataset,
    children: [],
    hidden: false,
    textContent: '',
    classList: {
      add: value => classes.add(value),
      remove: value => classes.delete(value),
      contains: value => classes.has(value)
    },
    addEventListener(type, handler) {
      const handlers = listeners.get(type) || [];
      handlers.push(handler);
      listeners.set(type, handlers);
    },
    dispatch(type, event = {}) {
      for (const handler of listeners.get(type) || []) handler({
        preventDefault() {},
        stopPropagation() {},
        target: this,
        ...event
      });
    },
    setAttribute: (name, value) => attributes.set(name, String(value)),
    getAttribute: name => attributes.get(name),
    removeAttribute: name => attributes.delete(name),
    replaceChildren(...nodes) { this.children = nodes; },
    querySelector: () => null,
    querySelectorAll: () => [],
    closest: () => null,
    contains(target) { return target === this || this.children.includes(target); },
    focus() { this.focused = true; }
  };
}

async function setupPlayer() {
  const [registrySource, playerSource] = await Promise.all([
    read('data/reference-videos.js'),
    read('js/video-player.js')
  ]);
  const mainTrigger = fakeElement({ videoTrigger: 'main' });
  const volcanoTrigger = fakeElement({ videoTrigger: 'volcano' });
  const flowerTrigger = fakeElement({ videoTrigger: 'flowers' });
  const cityTrigger = fakeElement({ videoTrigger: 'city' });
  const triggers = [mainTrigger, volcanoTrigger, flowerTrigger, cityTrigger];
  const mainFrame = fakeElement();
  const mainShell = fakeElement();
  mainShell.querySelector = selector => selector === '[data-video-frame]' ? mainFrame : null;
  mainTrigger.closest = selector => selector === '[data-video-shell]' ? mainShell : null;

  const modal = fakeElement();
  const modalFrame = fakeElement();
  const modalTitle = fakeElement();
  const modalAuthor = fakeElement();
  const modalSource = fakeElement();
  const modalFallback = fakeElement();
  const closeButton = fakeElement();
  modal.querySelector = selector => ({
    '[data-video-frame]': modalFrame,
    '[data-video-modal-title]': modalTitle,
    '[data-video-modal-author]': modalAuthor,
    '[data-video-source]': modalSource,
    '[data-video-fallback]': modalFallback,
    '[data-video-close]': closeButton
  })[selector] || null;
  modal.querySelectorAll = () => [closeButton, modalSource];
  modal.contains = target => [modal, modalFrame, modalTitle, modalAuthor, modalSource, modalFallback, closeButton].includes(target);

  const body = fakeElement();
  const documentListeners = new Map();
  const createdIframes = [];
  const document = {
    body,
    activeElement: null,
    addEventListener(type, handler) {
      const handlers = documentListeners.get(type) || [];
      handlers.push(handler);
      documentListeners.set(type, handlers);
    },
    dispatch(type, event = {}) {
      for (const handler of documentListeners.get(type) || []) handler(event);
    },
    querySelector(selector) {
      if (selector === '[data-video-modal]') return modal;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-video-trigger]') return triggers;
      return [];
    },
    createElement(tagName) {
      const node = fakeElement();
      node.tagName = tagName.toUpperCase();
      if (tagName === 'iframe') createdIframes.push(node);
      return node;
    }
  };
  for (const item of [mainTrigger, volcanoTrigger, flowerTrigger, cityTrigger, closeButton, modalSource]) {
    const originalFocus = item.focus;
    item.focus = function () {
      originalFocus.call(this);
      document.activeElement = this;
    };
  }

  const window = {};
  const context = { document, window, encodeURIComponent, setTimeout: handler => handler() };
  vm.runInNewContext(registrySource, context);
  vm.runInNewContext(playerSource, context);
  document.dispatch('DOMContentLoaded');
  return {
    body,
    cityTrigger,
    closeButton,
    createdIframes,
    document,
    mainFrame,
    mainTrigger,
    modal,
    modalFrame,
    modalSource,
    modalTitle,
    volcanoTrigger,
    window
  };
}

test('el video principal crea el iframe privado únicamente después del clic', async () => {
  const setup = await setupPlayer();
  assert.equal(setup.createdIframes.length, 0);
  assert.equal(setup.mainFrame.children.length, 0);

  setup.mainTrigger.dispatch('click');

  assert.equal(setup.createdIframes.length, 1);
  assert.equal(setup.mainFrame.children.length, 1);
  assert.match(setup.mainFrame.children[0].src, /^https:\/\/www\.youtube-nocookie\.com\/embed\/zwagQ8pF9hs\?/);
  assert.equal(setup.mainFrame.children[0].loading, 'lazy');
});

test('el diálogo de historias limpia el iframe, desbloquea el fondo y devuelve el foco', async () => {
  const setup = await setupPlayer();

  setup.volcanoTrigger.dispatch('click');
  assert.equal(setup.modal.classList.contains('open'), true);
  assert.equal(setup.modal.getAttribute('aria-hidden'), 'false');
  assert.equal(setup.body.classList.contains('is-video-open'), true);
  assert.equal(setup.modalFrame.children.length, 1);
  assert.match(setup.modalFrame.children[0].src, /C_-Ooep_7Yk/);
  assert.match(setup.modalTitle.textContent, /Lago de Coatepeque/);
  assert.equal(setup.modalSource.getAttribute('rel'), 'noopener noreferrer');

  setup.document.dispatch('keydown', { key: 'Escape', preventDefault() {} });
  assert.equal(setup.modal.classList.contains('open'), false);
  assert.equal(setup.modal.getAttribute('aria-hidden'), 'true');
  assert.equal(setup.body.classList.contains('is-video-open'), false);
  assert.equal(setup.modalFrame.children.length, 0);
  assert.equal(setup.volcanoTrigger.focused, true);
});
