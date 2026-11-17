/* Same-origin draft preview. No authentication data is passed into the frame. */
(function () {
  'use strict';
  var params = new URLSearchParams(location.search);
  var session = params.get('previewSession');
  if (params.get('adminPreview') !== '1' || window.parent === window || !/^[a-f0-9-]{36}$/.test(session || '')) return;
  var pending, resolveReady, applied = false;
  window.ESTAdminPreview = true;
  window.ESTContentReady = new Promise(function (resolve) { resolveReady = resolve; });
  function apply() {
    if (!pending || document.readyState === 'loading' || !window.ESTContent?.applySnapshot) return;
    var snapshot = pending;
    window.ESTAdminPreviewFocus = snapshot.focus;
    window.ESTContent.applySnapshot(snapshot);
    if (window.__estI18n && ['es','en','pt'].includes(snapshot.lang)) window.__estI18n.setLang(snapshot.lang);
    resolveReady(true);
    // Consumers waiting on ESTContentReady initialize before the focus update.
    queueMicrotask(function () {
      document.dispatchEvent(new CustomEvent('est:preview-updated', { detail: snapshot.focus }));
      if (!applied) { document.documentElement.dataset.adminPreview = 'true'; applied = true; }
      parent.postMessage({ type: 'est:preview-applied', session: session }, location.origin);
    });
  }
  window.addEventListener('message', function (event) {
    if (event.origin !== location.origin || event.source !== parent || event.data?.type !== 'est:preview-update' || event.data.session !== session) return;
    var snapshot = event.data.snapshot;
    if (!snapshot || !Array.isArray(snapshot.tours) || !Array.isArray(snapshot.partners) || !snapshot.site || typeof snapshot.site !== 'object') return;
    pending = snapshot; apply();
  });
  document.addEventListener('DOMContentLoaded', apply);
  document.addEventListener('est:preview-receiver-ready', apply);
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (link && !link.getAttribute('href').startsWith('#')) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  document.addEventListener('submit', function (event) { event.preventDefault(); event.stopImmediatePropagation(); }, true);
  window.open = function () { return null; };
  parent.postMessage({ type: 'est:preview-ready', session: session }, location.origin);
})();
