/* Shared, coded tour options: display labels may change; quote IDs stay stable. */
(function (root) {
  'use strict';
  function pick(value, lang) { return value && (value[lang] || value.es) || ''; }
  function selectedExtras(tour, ids, lang) {
    return (tour.optionalExtras || []).filter(function (extra) {
      return ids.includes(extra.id);
    }).map(function (extra) { return pick(extra.label, lang); });
  }
  function extraLine(tour, ids, lang) {
    var labels = selectedExtras(tour, ids, lang);
    return labels.length ? '\n• Extra opcional solicitado: ' + labels.join(', ') : '';
  }
  function quickFacts(tour, lang) {
    var facts = ['duration', 'groupSize', 'pickup'].map(function (key, i) {
      return { icon: ['schedule', 'group', 'pin_drop'][i], text: pick(tour[key], lang) };
    }).filter(function (fact) { return fact.text; });
    if (Number.isFinite(tour.rating)) facts.push({ icon: 'star', text: tour.rating.toFixed(1) + (tour.ratingCount ? ' (' + tour.ratingCount + ')' : '') });
    return facts;
  }
  var api = { selectedExtras: selectedExtras, extraLine: extraLine, quickFacts: quickFacts };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ESTTourOptions = api;
})(typeof window !== 'undefined' ? window : this);
