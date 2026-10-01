import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('expone fuentes responsive para actualizar imágenes de un carrusel', () => {
  const program = String.raw`
    const { sourceData } = require('./js/media.js');
    const data = sourceData('assets/img/destino.jpg', {
      sourceRoot: 'assets',
      outputRoot: 'assets/optimized',
      images: {
        'img/destino.jpg': {
          width: 1600,
          height: 900,
          variants: {
            avif: [{ src: 'img/destino-480.avif', width: 480 }],
            webp: [{ src: 'img/destino-480.webp', width: 480 }]
          }
        }
      }
    });
    process.stdout.write(JSON.stringify(data));
  `;
  const result = spawnSync(process.execPath, ['-e', program], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    avif: 'assets/optimized/img/destino-480.avif 480w',
    webp: 'assets/optimized/img/destino-480.webp 480w',
    width: 1600,
    height: 900
  });
});
