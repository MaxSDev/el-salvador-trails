(function () {
  'use strict';
  function config() { return window.ESTReviewsConfig || {}; }
  function configured() {
    try { return /^(https?:)$/.test(new URL(config().apiBaseUrl).protocol); } catch (_) { return false; }
  }
  function failure(code, status) { var error = new Error(code); error.code = code; error.status = status; return error; }
  async function request(path, options) {
    if (!configured()) throw failure('configuration');
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 60000);
    try {
      var headers = Object.assign({}, options && options.headers);
      if (config().publishableKey) headers.apikey = config().publishableKey;
      var response = await fetch(config().apiBaseUrl.replace(/\/$/, '') + path, Object.assign({}, options, { headers: headers, signal: controller.signal, cache: 'no-store' }));
      var result;
      try { result = await response.json(); } catch (_) { throw failure('unavailable'); }
      if (!response.ok) throw failure(result.error || 'unavailable', response.status);
      return result;
    } catch (error) { if (error.code) throw error; throw failure('unavailable'); }
    finally { clearTimeout(timer); }
  }
  window.ESTReviews = {
    configured: configured,
    request: request,
    list: async function (page) {
      var data = await request('/public?page=' + page);
      if (!Array.isArray(data.reviews) || typeof data.hasMore !== 'boolean') throw failure('unavailable');
      return data;
    },
    submit: async function (form) {
      var data = await request('/submit', { method: 'POST', body: form });
      if (!data.id || !['published', 'pending'].includes(data.status)) throw failure('unavailable');
      return data;
    }
  };
})();
