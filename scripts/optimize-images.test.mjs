import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);

test('genera AVIF y WebP sin modificar el archivo original', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'est-images-'));
  const inputDir = join(fixtureRoot, 'input');
  const outputDir = join(fixtureRoot, 'output');
  const manifestPath = join(fixtureRoot, 'media-manifest.json');
  mkdirSync(inputDir, { recursive: true });

  const originalPath = join(inputDir, 'destino.png');
  writeFileSync(originalPath, ONE_PIXEL_PNG);
  const originalBefore = readFileSync(originalPath);

  execFileSync(
    process.execPath,
    [
      'scripts/optimize-images.mjs',
      '--input', inputDir,
      '--output', outputDir,
      '--manifest', manifestPath,
      '--widths', '1'
    ],
    { cwd: new URL('..', import.meta.url), stdio: 'pipe' }
  );

  assert.deepEqual(readFileSync(originalPath), originalBefore);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const image = manifest.images['destino.png'];
  assert.equal(image.width, 1);
  assert.equal(image.height, 1);
  assert.equal(image.variants.avif[0].src, 'destino-1.avif');
  assert.equal(image.variants.webp[0].src, 'destino-1.webp');
  assert.ok(readFileSync(join(outputDir, 'destino-1.avif')).length > 0);
  assert.ok(readFileSync(join(outputDir, 'destino-1.webp')).length > 0);
});
