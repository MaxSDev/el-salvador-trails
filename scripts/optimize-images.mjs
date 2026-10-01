import { mkdir, readdir, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, parse, relative, resolve } from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const DEFAULT_WIDTHS = [480, 768, 1200, 1920];
const RASTER_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

function parseArgs(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!flag?.startsWith('--') || value === undefined) {
      throw new Error(`Argumento inválido: ${flag ?? ''}`);
    }
    values.set(flag.slice(2), value);
  }

  const projectRoot = process.cwd();
  return {
    input: resolve(values.get('input') ?? join(projectRoot, 'assets')),
    output: resolve(values.get('output') ?? join(projectRoot, 'assets', 'optimized')),
    manifest: resolve(values.get('manifest') ?? join(projectRoot, 'data', 'media-manifest.json')),
    widths: (values.get('widths') ?? DEFAULT_WIDTHS.join(','))
      .split(',')
      .map(Number)
      .filter((width) => Number.isInteger(width) && width > 0)
  };
}

function toWebPath(path) {
  return path.split('\\').join('/');
}

async function collectImages(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const images = [];

  for (const entry of entries) {
    const path = join(current, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'optimized') continue;
      images.push(...await collectImages(root, path));
    } else if (RASTER_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      images.push(path);
    }
  }

  return images.sort();
}

async function writeVariant(sourcePath, destinationPath, width, format) {
  await mkdir(dirname(destinationPath), { recursive: true });
  const pipeline = sharp(sourcePath)
    .rotate()
    .resize({ width, withoutEnlargement: true, fit: 'inside' });

  const configured = format === 'avif'
    ? pipeline.avif({ quality: 55, effort: 4 })
    : pipeline.webp({ quality: 80, effort: 5 });

  const { data, info } = await configured.toBuffer({ resolveWithObject: true });
  await writeFile(destinationPath, data);
  return { width: info.width, height: info.height, bytes: info.size };
}

async function optimizeImage(sourcePath, inputRoot, outputRoot, requestedWidths) {
  const metadata = await sharp(sourcePath).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`No se pudieron leer las dimensiones de ${sourcePath}`);
  }

  const relativeSource = relative(inputRoot, sourcePath);
  const sourceParts = parse(relativeSource);
  const widths = [...new Set(requestedWidths.filter((width) => width <= metadata.width))];
  if (!widths.length) widths.push(metadata.width);

  const variants = { avif: [], webp: [] };
  for (const width of widths) {
    for (const format of ['avif', 'webp']) {
      const relativeVariant = join(sourceParts.dir, `${sourceParts.name}-${width}.${format}`);
      const destinationPath = join(outputRoot, relativeVariant);
      const info = await writeVariant(sourcePath, destinationPath, width, format);
      variants[format].push({
        src: toWebPath(relativeVariant),
        width: info.width,
        height: info.height,
        bytes: info.bytes
      });
    }
  }

  const sourceStats = await stat(sourcePath);
  return {
    key: toWebPath(relativeSource),
    value: {
      width: metadata.width,
      height: metadata.height,
      bytes: sourceStats.size,
      variants
    }
  };
}

async function writeManifest(manifestPath, manifest) {
  await mkdir(dirname(manifestPath), { recursive: true });
  const temporaryPath = `${manifestPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, manifestPath);

  const scriptPath = manifestPath.replace(/\.json$/i, '.js');
  if (scriptPath !== manifestPath) {
    const scriptTemporaryPath = `${scriptPath}.tmp`;
    await writeFile(
      scriptTemporaryPath,
      `window.__MEDIA_MANIFEST__ = ${JSON.stringify(manifest)};\n`,
      'utf8'
    );
    await rename(scriptTemporaryPath, scriptPath);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.widths.length) throw new Error('Se requiere al menos un ancho válido.');

  const sourcePaths = await collectImages(options.input);
  const images = {};
  for (const sourcePath of sourcePaths) {
    const optimized = await optimizeImage(
      sourcePath,
      options.input,
      options.output,
      options.widths
    );
    images[optimized.key] = optimized.value;
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceRoot: toWebPath(relative(process.cwd(), options.input)) || '.',
    outputRoot: toWebPath(relative(process.cwd(), options.output)) || '.',
    widths: options.widths,
    images
  };
  await writeManifest(options.manifest, manifest);

  const originalBytes = Object.values(images).reduce((sum, image) => sum + image.bytes, 0);
  const optimizedBytes = Object.values(images).reduce(
    (sum, image) => sum + image.variants.avif.reduce((total, item) => total + item.bytes, 0)
      + image.variants.webp.reduce((total, item) => total + item.bytes, 0),
    0
  );
  process.stdout.write(`${sourcePaths.length} imágenes procesadas. Originales: ${originalBytes} bytes. Variantes: ${optimizedBytes} bytes.\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
