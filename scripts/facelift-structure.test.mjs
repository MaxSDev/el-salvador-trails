import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const HOME_SECTION_MARKERS = [
  'id="destination-carousel"',
  'id="home-quote"',
  'id="home-featured-day"',
  'data-video-placeholder="main"',
  'aria-label="Categorías"',
  'id="feedback"',
  'data-video-placeholder="story"',
  'id="planning-title"',
  'id="steps-title"',
  'id="guide-title"',
  'id="faq-title"',
  'id="final-title"',
  'class="social-band'
];

test('la portada conserva el orden de sus bloques funcionales', async () => {
  const html = await read('index.html');
  let previousIndex = -1;

  for (const marker of HOME_SECTION_MARKERS) {
    const markerIndex = html.indexOf(marker);
    assert.notEqual(markerIndex, -1, `Falta el bloque ${marker}`);
    assert.ok(markerIndex > previousIndex, `${marker} está fuera del orden aprobado`);
    previousIndex = markerIndex;
  }
});

test('el carrusel y los espacios de video conservan su cantidad y controles', async () => {
  const html = await read('index.html');

  assert.equal((html.match(/data-carousel-tab=/g) || []).length, 4);
  assert.equal((html.match(/data-video-placeholder="story"/g) || []).length, 3);
  assert.match(html, /id="carousel-pause-btn"/);
  assert.match(html, /id="home-quote"/);
});
