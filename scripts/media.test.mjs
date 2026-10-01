import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('genera picture con AVIF, WebP, fallback y atributos accesibles', () => {
  const program = String.raw`
    const { picture } = require('./js/media.js');
    const manifest = {
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
    };
    process.stdout.write(picture('assets/img/destino.jpg', {
      alt: 'Lago & volcán',
      className: 'hero-image',
      sizes: '100vw',
      loading: 'eager',
      fetchpriority: 'high'
    }, manifest));
  `;
  const result = spawnSync(process.execPath, ['-e', program], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /<picture>/);
  assert.match(result.stdout, /type="image\/avif"/);
  assert.match(result.stdout, /destino-480\.webp 480w/);
  assert.match(result.stdout, /src="assets\/img\/destino\.jpg"/);
  assert.match(result.stdout, /width="1600" height="900"/);
  assert.match(result.stdout, /alt="Lago &amp; volcán"/);
  assert.match(result.stdout, /loading="eager"/);
  assert.match(result.stdout, /fetchpriority="high"/);
});
