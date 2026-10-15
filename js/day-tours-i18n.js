(function () {
  var dictionaries = window.__estI18n && window.__estI18n.DICTIONARIES;
  if (!dictionaries) return;
  var messages = {
    es: { 'tour.optionalExtras': 'Extras opcionales', 'tour.optionalExtras.note': 'Selecciona el extra que te interesa para incluirlo en la solicitud. Su disponibilidad y precio se confirman en la cotización.', 'tour.pricing.unconfirmed': 'Solicita una propuesta para tu grupo. Consulta horarios, punto de encuentro y condiciones al cotizar.', 'tour.pricing.childrenPlain': 'Niños menores de 12 años' },
    en: { 'tour.optionalExtras': 'Optional extras', 'tour.optionalExtras.note': 'Select the extra you would like to include in your request. Availability and price will be confirmed in your quote.', 'tour.pricing.unconfirmed': 'Request a proposal for your group. Ask about schedules, meeting point and conditions when requesting a quote.', 'tour.pricing.childrenPlain': 'Children under 12' },
    pt: { 'tour.optionalExtras': 'Extras opcionais', 'tour.optionalExtras.note': 'Selecione o extra que deseja incluir na solicitação. A disponibilidade e o preço serão confirmados na cotação.', 'tour.pricing.unconfirmed': 'Solicite uma proposta para seu grupo. Consulte horários, ponto de encontro e condições ao pedir uma cotação.', 'tour.pricing.childrenPlain': 'Crianças menores de 12 anos' }
  };
  Object.keys(messages).forEach(function (lang) { Object.assign(dictionaries[lang], messages[lang]); });
})();
