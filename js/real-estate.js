/* Alojamientos y aliados: same public renderer for published data and editor previews. */
(function () {
  'use strict';
  var container;
  var focusedId = '';
  function pick(value) {
    if (typeof value === 'string') return value;
    var language = window.__estI18n?.getLang() || 'es';
    return value?.[language] || value?.es || '';
  }
  function words(es,en,pt) { return pick({es:es,en:en,pt:pt}); }
  function node(tag, text, className) {
    var element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function picture(path, alt, hero) {
    if (window.ESTMedia) {
      var holder = document.createElement('div');
      holder.innerHTML = window.ESTMedia.picture(path, { alt:alt, loading:'lazy', sizes:hero ? '(max-width:800px) 90vw,52vw' : '(max-width:640px) 90vw,42vw' });
      return holder.firstElementChild;
    }
    var image = node('img'); image.src = path; image.alt = alt; image.loading = 'lazy';
    return image;
  }
  function photo(partner, index) {
    var figure = node('figure', undefined, 'estate-gallery-item');
    var caption = pick(partner.imageCaptions?.[index]) || pick(partner.name);
    figure.append(picture(partner.images[index], caption, false), node('figcaption', caption));
    return figure;
  }
  function contact(partner) {
    var name = pick(partner.name);
    var link = node('a', words('Consultar sobre ', 'Ask about ', 'Consultar sobre ') + name, 'estate-button');
    var email = window.ESTContent?.contacts.email || 'hola@elsalvadortrails.com';
    link.href = 'mailto:' + email + '?subject=' + encodeURIComponent(words('Consulta sobre ','Question about ','Consulta sobre ') + name);
    return link;
  }
  function renderPartner(partner) {
    var name = pick(partner.name);
    var slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(partner.slug || '') ? partner.slug : 'alojamiento';
    var feature = node('section', undefined, 'estate-section estate-feature');
    feature.id = slug; feature.dataset.partnerId = partner.id;
    feature.setAttribute('aria-labelledby', slug + '-title');
    var image = node('figure', undefined, 'estate-feature-photo');
    if (partner.images?.length) image.append(picture(partner.images[0], pick(partner.imageCaptions?.[0]) || name, true));
    var copy = node('div', undefined, 'estate-feature-copy');
    var title = node('h2', name); title.id = slug + '-title';
    copy.append(title);
    var tagline = pick(partner.tagline) || (partner.type === 'lodging' ? words('Alojamiento','Accommodation','Hospedagem') : words('Negocio aliado','Partner business','Negócio parceiro'));
    copy.append(node('p', tagline, 'estate-property-type'), node('p', pick(partner.shortDescription)));
    if (pick(partner.location)) copy.append(node('p', pick(partner.location), 'estate-property-location'));
    if (partner.address) { var address = node('address', partner.address); address.style.whiteSpace = 'pre-line'; copy.append(address); }
    copy.append(contact(partner));
    if (partner.url) {
      try {
        var url = new URL(partner.url);
        if (url.protocol === 'https:' && !url.username && !url.password) {
          var external = node('a', words('Visitar sitio del aliado','Visit partner website','Visitar site do parceiro'), 'estate-link');
          external.href = url.href; external.target = '_blank'; external.rel = 'noopener noreferrer'; copy.append(external);
        }
      } catch (_) {}
    }
    copy.append(node('p', words('Escríbenos para conocer las opciones disponibles para tu visita.','Write to us to learn about the options available for your visit.','Escreva para conhecer as opções disponíveis para sua visita.'), 'estate-contact-note'));
    feature.append(image, copy);
    var gallery = node('section', undefined, 'estate-section estate-gallery');
    gallery.setAttribute('aria-labelledby', slug + '-gallery-title');
    var heading = node('header', undefined, 'estate-gallery-heading');
    var galleryTitle = node('h2', words('Una mirada a ','A look inside ','Um olhar sobre ') + name); galleryTitle.id = slug + '-gallery-title';
    heading.append(galleryTitle, node('p', pick(partner.description))); gallery.append(heading);
    var images = partner.images || [];
    if (images.length) {
      var grid = node('div', undefined, 'estate-photo-grid');
      images.slice(0,4).forEach(function (_,index) { grid.append(photo(partner,index)); }); gallery.append(grid);
      if (images.length > 4) {
        var details = node('details', undefined, 'estate-more-photos');
        var summary = node('summary');
        summary.append(node('span', words('Ver todas las fotos','See all photos','Ver todas as fotos')), node('span', String(images.length), 'estate-photo-count'));
        var more = node('div', undefined, 'estate-photo-grid');
        images.slice(4).forEach(function (_,index) { more.append(photo(partner,index+4)); });
        details.append(summary,more); gallery.append(details);
      }
    }
    return [feature,gallery];
  }
  function render() {
    if (!container) return;
    var partners = window.__REAL_ESTATE_DATA?.partners || [];
    container.replaceChildren(); container.setAttribute('aria-busy','false');
    partners.slice().sort(function(a,b) { return (a.sortOrder || 0)-(b.sortOrder || 0); }).forEach(function (partner) { container.append(...renderPartner(partner)); });
    var explore = document.querySelector('.estate-photo-hero .secondary-hero-link');
    var caption = document.querySelector('.estate-hero-caption');
    if (explore) {
      explore.hidden = !partners.length;
      if (partners.length) {
        explore.href = '#' + partners[0].slug;
        var text = explore.querySelector('span');
        if (text) { text.removeAttribute('data-i18n'); text.textContent = words('Conoce ','Discover ','Conheça ') + pick(partners[0].name); }
      }
    }
    if (caption) {
      caption.hidden = !partners.length;
      caption.textContent = partners.length ? pick(partners[0].name) + (pick(partners[0].location) ? ' · ' + pick(partners[0].location) : '') : '';
    }
    if (!partners.length && !window.ESTContent?.failed) container.append(node('p', words('Pronto compartiremos nuevos alojamientos y aliados.','New accommodation and partners will be available soon.','Em breve compartilharemos novas hospedagens e parceiros.'), 'estate-section'));
  }
  async function init() {
    var first = document.querySelector('.estate-feature');
    container = node('div'); container.id = 'estate-partners'; container.setAttribute('aria-busy','true');
    if (first) first.before(container);
    else document.querySelector('.estate-outlook')?.before(container);
    document.querySelectorAll('.estate-feature,.estate-gallery').forEach(function (element) { element.remove(); });
    if (window.ESTContentReady) await window.ESTContentReady;
    else if (!window.__REAL_ESTATE_DATA) {
      try { var response = await fetch('data/real-estate.json'); if (response.ok) window.__REAL_ESTATE_DATA = await response.json(); }
      catch (_) { window.__REAL_ESTATE_DATA = {partners:[]}; }
    }
    render();
    if (window.__estI18n) {
      var original = window.__estI18n.setLang;
      window.__estI18n.setLang = function (language) { original.call(window.__estI18n,language); render(); };
    }
  }
  document.addEventListener('DOMContentLoaded',init);
  document.addEventListener('est:content-loaded',render);
  document.addEventListener('est:preview-updated',function (event) {
    render();
    var focus = event.detail;
    if (focus?.kind === 'partner' && focus.id !== focusedId) {
      focusedId = focus.id;
      Array.from(container?.querySelectorAll('[data-partner-id]') || []).find(function (element) { return element.dataset.partnerId === focus.id; })?.scrollIntoView({block:'start'});
    }
  });
})();
