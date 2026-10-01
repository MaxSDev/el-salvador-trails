import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('las páginas públicas solo referencian variantes responsive existentes', () => {
  const result = spawnSync(
    process.execPath,
    ['scripts/check-responsive-media.mjs'],
    { cwd: new URL('..', import.meta.url), encoding: 'utf8' }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /medios responsive verificados/i);
});
