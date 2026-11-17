/* Public snapshots and the same-origin editor preview share one rendering path. */
(function () {
  'use strict';
  var api = window.ESTContent;
  if (!api) return;
  var loaded = false;
  var originalTexts = {};
  var originalGuide, originalEstateHero, guideReplaced = false, estateHeroReplaced = false;
  function apply() {
    if (api.failed) {
      if (!document.getElementById('content-unavailable')) {
        var notice = document.createElement('p'); notice.id = 'content-unavailable'; notice.setAttribute('role', 'status');
        notice.style.cssText = 'padding:1rem;margin:1rem auto;max-width:65ch;text-align:center';
        var lang = window.__estI18n ? window.__estI18n.getLang() : 'es';
        notice.textContent = {es:'No se pudo cargar el contenido actualizado. ',en:'The updated content could not be loaded. ',pt:'Não foi possível carregar o conteúdo atualizado. '}[lang];
        var retry = document.createElement('a'); retry.href = location.href; retry.textContent = {es:'Volver a intentar',en:'Try again',pt:'Tentar novamente'}[lang]; notice.append(retry);
        document.querySelector('main')?.prepend(notice);
      }
      return;
    }
    if (!loaded) return;
    if (window.__estI18n) window.__estI18n.applyTranslations();
    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (api.contacts.whatsapp && /^https:\/\/wa\.me\//.test(href)) {
        var url = new URL(href); url.pathname = '/' + api.contacts.whatsapp; link.href = url.href;
      }
      if (api.contacts.email && /^mailto:/.test(href)) link.href = href.replace(/^mailto:[^?]*/, 'mailto:' + api.contacts.email);
      ['instagram','facebook','tiktok'].forEach(function (name) {
        if (api.contacts[name] && new RegExp('^https://(?:www\\.)?' + name + '\\.com/').test(href)) link.href = api.contacts[name];
      });
    });
    var mark = document.querySelector('.guide-mark');
    if (mark && !originalGuide) originalGuide = Array.from(mark.childNodes, child => child.cloneNode(true));
    if (api.images.guide) {
      if (mark) { var image = document.createElement('img'); image.src = api.images.guide; image.alt = ''; image.width = 320; image.height = 320; image.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit'; mark.replaceChildren(image); guideReplaced = true; }
    } else if (mark && guideReplaced) {
      mark.replaceChildren(...originalGuide.map(child => child.cloneNode(true))); guideReplaced = false;
    }
    var hero = document.querySelector('.estate-photo-hero .secondary-hero-media');
    if (hero && !originalEstateHero) originalEstateHero = Array.from(hero.childNodes, child => child.cloneNode(true));
    if (api.images.estateHero) {
      if (hero) { var image = document.createElement('img'); image.src = api.images.estateHero; image.alt = ''; image.width = 1600; image.height = 900; hero.replaceChildren(image); estateHeroReplaced = true; }
    } else if (hero && estateHeroReplaced) {
      hero.replaceChildren(...originalEstateHero.map(child => child.cloneNode(true))); estateHeroReplaced = false;
    }
    document.dispatchEvent(new CustomEvent('est:content-loaded'));
  }
  api.applySnapshot = function (data) {
    if (!Array.isArray(data.tours) || !data.site || typeof data.site !== 'object') throw new Error('Invalid public content');
    window.__TOURS_DATA = { tours: data.tours };
    window.__REAL_ESTATE_DATA = { partners: Array.isArray(data.partners) ? data.partners : [] };
    api.contacts = data.site.contacts || {}; api.images = data.site.images || {};
    if (window.__estI18n?.DICTIONARIES) {
      var dictionaries = window.__estI18n.DICTIONARIES;
      Object.keys(originalTexts).forEach(function (key) { ['es','en','pt'].forEach(function (lang) { dictionaries[lang][key] = originalTexts[key][lang]; }); });
      Object.entries(data.site.texts || {}).forEach(function ([key, value]) {
        if (!originalTexts[key]) originalTexts[key] = Object.fromEntries(['es','en','pt'].map(function (lang) { return [lang, dictionaries[lang][key]]; }));
        ['es','en','pt'].forEach(function (lang) { if (value[lang] || value.es) dictionaries[lang][key] = value[lang] || value.es; });
      });
    }
    loaded = true; api.failed = false;
    if (document.readyState !== 'loading') apply();
  };
  document.addEventListener('DOMContentLoaded', apply);
  if (window.ESTAdminPreview) {
    document.dispatchEvent(new Event('est:preview-receiver-ready'));
    return;
  }
  if (!api.configured) return;
  // A connection failure must not revive hidden records from old files.
  window.__TOURS_DATA = { tours: [] };
  window.__REAL_ESTATE_DATA = { partners: [] };
  window.ESTContentReady = api.request('/public').then(function (data) {
    api.applySnapshot(data); return true;
  }).catch(function () { api.failed = true; if (document.readyState !== 'loading') apply(); return false; });
})();
