import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('elige una variante WebP limitada para fondos decorativos', () => {
  const program = String.raw`
    const { preferredSource } = require('./js/media.js');
    const manifest = {
      sourceRoot: 'assets',
      outputRoot: 'assets/optimized',
      images: {
        'img/destino.jpg': {
          variants: {
            webp: [
              { src: 'img/destino-480.webp', width: 480 },
              { src: 'img/destino-1200.webp', width: 1200 },
              { src: 'img/destino-1920.webp', width: 1920 }
            ]
          }
        }
      }
    };
    process.stdout.write(preferredSource('assets/img/destino.jpg', {
      format: 'webp',
      maxWidth: 1200
    }, manifest));
  `;
  const result = spawnSync(process.execPath, ['-e', program], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'assets/optimized/img/destino-1200.webp');
});
