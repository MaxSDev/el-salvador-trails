import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const pages = ['index.html', 'tours.html', 'about.html', 'real-estate.html'];
const manifest = JSON.parse(readFileSync(join(root, 'data', 'media-manifest.json'), 'utf8'));
const errors = [];

function localPath(webPath) {
  return join(root, ...webPath.split('/'));
}

for (const page of pages) {
  const html = readFileSync(join(root, page), 'utf8');

  for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) {
      const webPath = candidate.trim().split(/\s+/)[0];
      if (webPath.startsWith('assets/') && !existsSync(localPath(webPath))) {
        errors.push(`${page}: variante inexistente ${webPath}`);
      }
    }
  }

  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = match[0];
    const source = tag.match(/src="([^"]+)"/)?.[1] || '';
    if (!/^assets\/.+\.(?:jpe?g|png)$/i.test(source)) continue;

    const preceding = html.slice(0, match.index);
    const insidePicture = preceding.lastIndexOf('<picture') > preceding.lastIndexOf('</picture>');
    const placeholder = /data-media-placeholder/.test(tag);
    if (!insidePicture && !placeholder) {
      errors.push(`${page}: fotografía sin <picture> ni placeholder: ${source}`);
    }
    if (insidePicture && (!/\bwidth="\d+"/.test(tag) || !/\bheight="\d+"/.test(tag))) {
      errors.push(`${page}: fallback sin dimensiones: ${source}`);
    }
  }
}

for (const [source, image] of Object.entries(manifest.images)) {
  for (const format of ['avif', 'webp']) {
    for (const variant of image.variants[format]) {
      const path = join(root, manifest.outputRoot, ...variant.src.split('/'));
      if (!existsSync(path)) errors.push(`Manifiesto: falta ${format} para ${source}: ${variant.src}`);
    }
  }
}

if (errors.length) {
  process.stderr.write(`${errors.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`${pages.length} páginas y ${Object.keys(manifest.images).length} medios responsive verificados.\n`);
}
