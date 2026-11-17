import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Inicio conserva cuatro espacios vacíos sin cargar los videos de referencia', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const frames = [...html.matchAll(/<div\b[^>]*\bdata-video-placeholder="(main|story)"[^>]*>([\s\S]*?)<\/div>/g)];
  assert.deepEqual(frames.map(frame => frame[1]), ['main', 'story', 'story', 'story']);
  assert.ok(frames.every(frame => !frame[2].trim()), 'Los espacios deben quedar sin miniaturas ni controles');
  assert.doesNotMatch(html, /data-video-trigger|data-video-modal|reference-videos\.js|video-player\.js|(?:youtube(?:-nocookie)?\.com\/(?:watch|embed)|youtu\.be\/)/i);
});
