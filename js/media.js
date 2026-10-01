(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ESTMedia = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  function escapeAttribute(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function trimSlashes(value) {
    return String(value || '').replace(/^\.\//, '').replace(/^\/+|\/+$/g, '');
  }

  function findEntry(src, manifest) {
    if (!manifest || !manifest.images) return null;
    var normalizedSrc = trimSlashes(src);
    var sourceRoot = trimSlashes(manifest.sourceRoot);
    var key = sourceRoot && normalizedSrc.indexOf(sourceRoot + '/') === 0
      ? normalizedSrc.slice(sourceRoot.length + 1)
      : normalizedSrc;
    return manifest.images[key] ? { key: key, image: manifest.images[key] } : null;
  }

  function variantSrcset(items, outputRoot) {
    var rootPath = trimSlashes(outputRoot);
    return (items || []).map(function (item) {
      return (rootPath ? rootPath + '/' : '') + trimSlashes(item.src) + ' ' + item.width + 'w';
    }).join(', ');
  }

  function imageAttributes(src, options, image) {
    var attributes = [
      'src="' + escapeAttribute(src) + '"',
      'alt="' + escapeAttribute(options.alt || '') + '"'
    ];
    if (image && image.width && image.height) {
      attributes.push('width="' + image.width + '"', 'height="' + image.height + '"');
    }
    if (options.id) attributes.push('id="' + escapeAttribute(options.id) + '"');
    if (options.className) attributes.push('class="' + escapeAttribute(options.className) + '"');
    if (options.loading) attributes.push('loading="' + escapeAttribute(options.loading) + '"');
    if (options.decoding !== false) attributes.push('decoding="async"');
    if (options.fetchpriority) attributes.push('fetchpriority="' + escapeAttribute(options.fetchpriority) + '"');
    return attributes.join(' ');
  }

  function picture(src, options, providedManifest) {
    options = options || {};
    var manifest = providedManifest
      || (typeof window !== 'undefined' ? window.__MEDIA_MANIFEST__ : null);
    var found = findEntry(src, manifest);
    if (!found) return '<img ' + imageAttributes(src, options, null) + '>';

    var sizes = escapeAttribute(options.sizes || '100vw');
    var avif = variantSrcset(found.image.variants.avif, manifest.outputRoot);
    var webp = variantSrcset(found.image.variants.webp, manifest.outputRoot);
    return '<picture>'
      + (avif ? '<source type="image/avif" srcset="' + escapeAttribute(avif) + '" sizes="' + sizes + '">' : '')
      + (webp ? '<source type="image/webp" srcset="' + escapeAttribute(webp) + '" sizes="' + sizes + '">' : '')
      + '<img ' + imageAttributes(src, options, found.image) + '>'
      + '</picture>';
  }

  function sourceData(src, providedManifest) {
    var manifest = providedManifest
      || (typeof window !== 'undefined' ? window.__MEDIA_MANIFEST__ : null);
    var found = findEntry(src, manifest);
    if (!found) return null;
    return {
      avif: variantSrcset(found.image.variants.avif, manifest.outputRoot),
      webp: variantSrcset(found.image.variants.webp, manifest.outputRoot),
      width: found.image.width,
      height: found.image.height
    };
  }

  function preferredSource(src, options, providedManifest) {
    options = options || {};
    var manifest = providedManifest
      || (typeof window !== 'undefined' ? window.__MEDIA_MANIFEST__ : null);
    var found = findEntry(src, manifest);
    if (!found) return src;
    var format = options.format || 'webp';
    var variants = (found.image.variants && found.image.variants[format]) || [];
    if (!variants.length) return src;
    var maxWidth = Number(options.maxWidth) || Infinity;
    var eligible = variants.filter(function (item) { return item.width <= maxWidth; });
    var selected = (eligible.length ? eligible : variants).slice().sort(function (a, b) {
      return a.width - b.width;
    }).pop();
    return trimSlashes(manifest.outputRoot) + '/' + trimSlashes(selected.src);
  }

  return {
    picture: picture,
    findEntry: findEntry,
    sourceData: sourceData,
    preferredSource: preferredSource
  };
});
