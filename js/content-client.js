/* Shared browser utilities for editable content. No private keys. */
(function () {
  'use strict';
  var config = window.ESTReviewsConfig || {};
  function escape(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  async function request(path, options) {
    options = options || {};
    if (!config.contentApiBaseUrl) throw new Error('El panel de contenido todavía no está conectado.');
    var form = options.body instanceof FormData;
    var response = await fetch(config.contentApiBaseUrl + path, Object.assign({}, options, { cache: 'no-store', signal: AbortSignal.timeout(30000), headers: Object.assign({ apikey: config.publishableKey }, options.body && !form ? { 'Content-Type': 'application/json' } : {}, options.headers || {}) }));
    var data; try { data = await response.json(); } catch (_) { throw new Error('La conexión devolvió una respuesta inválida.'); }
    if (!response.ok) { var error = new Error(data.error || 'No se pudo completar la operación.'); error.status = response.status; throw error; }
    return data;
  }
  function price(tour) {
    if (!tour.price || !Number.isFinite(tour.price.amount)) return '';
    var lang = window.__estI18n ? window.__estI18n.getLang() : 'es';
    var unit = tour.price.unit === 'group' ? { es: 'por grupo', en: 'per group', pt: 'por grupo' } : { es: 'por persona', en: 'per person', pt: 'por pessoa' };
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'USD' }).format(tour.price.amount) + ' ' + unit[lang] + ' · ' + ({ es: 'Precio orientativo; confirma al cotizar', en: 'Indicative price; confirm when requesting a quote', pt: 'Preço indicativo; confirme ao cotar' }[lang]);
  }
  window.ESTContent = { request: request, escape: escape, price: price, configured: Boolean(config.contentApiBaseUrl), contacts: {}, images: {} };
})();
