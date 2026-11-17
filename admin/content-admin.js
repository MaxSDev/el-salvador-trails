import { getAdminClient, initializeAdminNavigation, recoveryRequested, redirectToAdminLogin } from './admin-session.js';
import { createContentPreview } from './content-preview.js';

const $ = id => document.getElementById(id);
const config = window.ESTReviewsConfig || {};
const api = window.ESTContent;
const pageKind = document.body.dataset.contentKind || 'tour';
const categoryLabels = { day: 'Day Tours', package: 'Tour Packages' };
const partnerLabels = { lodging: 'Alojamiento', partner: 'Negocio aliado' };
const statusLabels = { draft: 'Borrador', published: 'Publicado', hidden: 'Oculto' };
const estateFields = [
  ['realestate.hero', 'Bienes Raíces: título de portada'],
  ['realestate.intro', 'Bienes Raíces: introducción'],
  ['realestate.beyond', 'Bienes Raíces: título de presentación'],
  ['realestate.partners', 'Bienes Raíces: presentación de aliados'],
  ['realestate.country', 'Bienes Raíces: oportunidades en el país'],
  ['realestate.outlook', 'Bienes Raíces: título de cierre'],
  ['realestate.closing', 'Bienes Raíces: texto de cierre'],
  ['realestate.signature', 'Bienes Raíces: firma']
];
const siteFields = [
  ...Array.from({ length: 4 }, (_, i) => [[`slide${i}.title`, `Portada ${i + 1}: título`], [`slide${i}.desc`, `Portada ${i + 1}: descripción`]]).flat(),
  ['home.guide.title', 'Presentación del guía: título'],
  ['home.guide.quote', 'Presentación del guía: frase'],
  ['home.guide.text', 'Presentación del guía: descripción'],
  ...Array.from({ length: 5 }, (_, i) => [[`home.faq.q${i + 1}`, `Pregunta frecuente ${i + 1}`], [`home.faq.a${i + 1}`, `Respuesta ${i + 1}`]]).flat()
];
let client, session, selected = null, chooseImage, preview;
let documents = [], media = [], dirty = false, busy = false, language = 'es', step = 0;
let livePreviewExpanded = false;
let fieldSequence = 0;

function element(tag, value, className) {
  const node = document.createElement(tag);
  if (value !== undefined) node.textContent = value;
  if (className) node.className = className;
  return node;
}

function button(title, action, className) {
  const node = element('button', title, className);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

function hasPendingChanges(row) {
  return row.status === 'published' && JSON.stringify(row.draft) !== JSON.stringify(row.published);
}

function stateLabel(row) {
  return hasPendingChanges(row) ? 'Publicado con cambios pendientes' : statusLabels[row.status] || 'Borrador';
}

function contentName(row) {
  return row.kind === 'site' ? 'Información general' : (row.draft[row.kind === 'tour' ? 'title' : 'name']?.es || 'Sin nombre');
}

function message(value, error = false) {
  const host = $('content-message');
  host.textContent = value;
  host.dataset.error = String(error);
  host.hidden = false;
  if (error) host.scrollIntoView({ block: 'nearest' });
}

function failure(error) {
  if (error.status === 401) {
    session = null;
    $('content-section').hidden = true;
    $('login-section').hidden = false;
  }
  const detail = error.status === 409
    ? 'Otra persona cambió o borró este contenido. Tus cambios siguen abiertos aquí. Cópialos antes de actualizar la lista o salir. Si estás creando otro, utiliza un nombre en el enlace diferente.'
    : error.message || 'No se pudo completar la operación. Intenta de nuevo.';
  message(detail, true);
}

function allowLeave() {
  return !dirty || confirm('Tienes cambios sin guardar. ¿Quieres salir y descartarlos?');
}

function updateDocumentState() {
  if (!selected) return;
  $('document-state').textContent = `${stateLabel(selected)} · Versión ${selected.version}. ` +
    (dirty ? 'Cambios sin guardar. La página publicada todavía no cambia.' : 'La página pública cambia solo al publicar.');
}

function updatePreview() {
  if (preview && selected) preview.update({ documents: structuredClone(documents), selected: structuredClone(selected), language });
}

function changed(captureValues = true) {
  dirty = true;
  if (captureValues) capture();
  updateDocumentState();
  updatePreview();
}

function lock(value) {
  busy = value;
  $('editor-fields').disabled = value;
  $('content-form').setAttribute('aria-busy', String(value));
  for (const id of ['new-tour', 'reload-content', 'logout']) $(id).disabled = value;
  $('tour-list').querySelectorAll('button').forEach(node => { node.disabled = value; });
}

async function request(path, options = {}) {
  const result = await client.auth.getSession();
  if (!result.data.session) {
    const error = new Error('Tu sesión terminó. Vuelve a entrar para continuar.');
    error.status = 401;
    throw error;
  }
  return api.request(path, { ...options, headers: { Authorization: 'Bearer ' + result.data.session.access_token } });
}

function field(container, title, path, value, { area = false, type = 'text', options, wide = false, hint = '', disabled = false, fallback = true } = {}) {
  const label = element('label', undefined, wide || area ? 'wide' : '');
  const titleNode = element('span', title);
  const inputId = 'content-field-' + (++fieldSequence);
  titleNode.id = inputId + '-label';
  label.append(titleNode);
  const input = element(options ? 'select' : area ? 'textarea' : 'input');
  input.id = inputId;
  input.setAttribute('aria-labelledby', titleNode.id);
  if (options) {
    options.forEach(([value, title]) => { const option = element('option', title); option.value = value; input.append(option); });
  } else if (!area) input.type = type;
  input.dataset.path = JSON.stringify(path);
  input.value = value ?? '';
  input.disabled = disabled;
  if (fallback && language !== 'es' && path.at(-1) === language) {
    let original = selected.draft;
    for (const part of [...path.slice(0, -1), 'es']) original = original?.[part];
    if (typeof original === 'string' && original) input.placeholder = 'Español: ' + original.slice(0, 120);
  }
  if (type === 'number') { input.min = '0'; input.max = '100000'; input.step = '.01'; }
  if (area) input.maxLength = path.includes('fullDescription') || path.includes('description') ? 12000 : 4000;
  else input.maxLength = 1200;
  label.append(input);
  if (hint) {
    const help = element('small', hint);
    help.id = inputId + '-hint';
    input.setAttribute('aria-describedby', help.id);
    label.append(help);
  }
  container.append(label);
  return input;
}

function capture() {
  if (!selected) return;
  $('editor-body').querySelectorAll('[data-path]').forEach(input => {
    const path = JSON.parse(input.dataset.path);
    let target = selected.draft;
    for (const part of path.slice(0, -1)) target = target[part] ??= {};
    let value = input.value;
    if (input.dataset.lines) value = value.split(/\r?\n/).map(v => v.trim()).filter(Boolean);
    if (input.type === 'number') value = value === '' ? null : Number(value);
    target[path.at(-1)] = value;
  });
}

function group(parent, title, open = false) {
  const node = element('details', undefined, 'content-group');
  node.open = open;
  node.append(element('summary', title));
  const body = element('div');
  node.append(body);
  parent.append(node);
  return body;
}

function fields(parent) {
  const node = element('div', undefined, 'content-fields');
  parent.append(node);
  return node;
}

function imageURL(path) {
  return path.startsWith('assets/') ? '../' + path : path;
}

function imageControls(parent, add, multiple = false) {
  const row = element('div', undefined, 'image-controls');
  row.append(button('Elegir de la biblioteca', () => openLibrary(add)));
  const label = element('label', 'Subir imagen (JPEG, PNG o WebP; máx. 5 MB)');
  const input = element('input');
  input.type = 'file';
  input.accept = 'image/jpeg,image/png,image/webp';
  input.multiple = multiple;
  input.addEventListener('change', async () => {
    if (!input.files.length || busy) return;
    const files = [...input.files];
    capture();
    lock(true);
    try {
      if (multiple && (selected.draft.images || []).length + files.length > 30) throw new Error('Puedes utilizar hasta 30 fotos por contenido.');
      for (const file of files) {
        if (!file.size || file.size > 5242880 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Selecciona imágenes JPEG, PNG o WebP de máximo 5 MB.');
        const form = new FormData();
        form.append('file', file);
        const result = await request('/media', { method: 'POST', body: form });
        media.unshift(result.media);
        add(result.media.url);
      }
      message('Imagen subida. Guarda el borrador o publica para aplicar el cambio.');
    } catch (error) { failure(error); }
    finally { lock(false); input.value = ''; }
  });
  label.append(input);
  row.append(label);
  parent.append(row);
}

function reorderPhoto(from, to) {
  capture();
  const data = selected.draft;
  const [image] = data.images.splice(from, 1);
  data.images.splice(to, 0, image);
  if (selected.kind === 'partner') {
    data.imageCaptions ??= data.images.map(() => ({}));
    const [caption] = data.imageCaptions.splice(from, 1);
    data.imageCaptions.splice(to, 0, caption || {});
  } else if (data.imageDescriptions) {
    for (const captions of Object.values(data.imageDescriptions)) {
      if (!Array.isArray(captions)) continue;
      while (captions.length < data.images.length) captions.push('');
      const [caption] = captions.splice(from, 1);
      captions.splice(to, 0, caption || '');
    }
  }
  changed(false);
  renderEditor();
}

function gallery(parent) {
  const data = selected.draft;
  data.images ??= [];
  if (selected.kind === 'partner') {
    data.imageCaptions ??= [];
    while (data.imageCaptions.length < data.images.length) data.imageCaptions.push({});
  }
  if (!data.images.length) parent.append(element('p', 'Todavía no hay fotos. Elige una de la biblioteca o sube una imagen para comenzar.', 'photo-empty'));
  const grid = element('div', undefined, 'gallery-editor');
  parent.append(grid);
  data.images.forEach((path, index) => {
    const figure = element('figure');
    const img = element('img');
    img.src = imageURL(path);
    img.alt = data.imageCaptions?.[index]?.[language] || data.imageCaptions?.[index]?.es || 'Foto ' + (index + 1);
    img.loading = 'lazy';
    figure.append(img, element('figcaption', index === 0 ? 'Portada' : 'Foto ' + (index + 1)));
    const actions = element('div', undefined, 'gallery-actions');
    const cover = button(index === 0 ? 'Portada actual' : 'Usar como portada', () => reorderPhoto(index, 0));
    cover.disabled = index === 0;
    actions.append(cover);
    if (index > 0) actions.append(button('Mover antes', () => reorderPhoto(index, index - 1)));
    if (index < data.images.length - 1) actions.append(button('Mover después', () => reorderPhoto(index, index + 1)));
    actions.append(button('Quitar foto', () => {
      capture();
      data.images.splice(index, 1);
      data.imageCaptions?.splice(index, 1);
      if (data.imageDescriptions) Object.values(data.imageDescriptions).forEach(captions => { if (Array.isArray(captions)) captions.splice(index, 1); });
      changed(false);
      renderEditor();
    }));
    figure.append(actions);
    if (selected.kind === 'partner') field(figure, `Descripción de la foto ${index + 1}`, ['imageCaptions', index, language], data.imageCaptions[index]?.[language], { hint: 'Describe lo que se ve. Ayuda a quienes no pueden ver la imagen.' });
    grid.append(figure);
  });
  imageControls(parent, path => {
    if (data.images.length >= 30) throw new Error('Máximo 30 fotos por contenido.');
    capture();
    data.images.push(path);
    if (selected.kind === 'partner') (data.imageCaptions ??= []).push({});
    else if (data.imageDescriptions) {
      Object.values(data.imageDescriptions).forEach(captions => {
        if (Array.isArray(captions)) while (captions.length < data.images.length) captions.push('');
      });
    }
    changed(false);
    renderEditor();
  }, true);
  parent.append(element('p', 'La primera foto es la portada. Quitarla de este contenido no la borra de la biblioteca. Las fotos que subes aquí son públicas.', 'support'));
}

function singleImage(parent, title, get, set, open = false) {
  const container = group(parent, title, open);
  if (get()) {
    const img = element('img', undefined, 'image-single-preview');
    img.src = imageURL(get());
    img.alt = title;
    container.append(img);
  }
  imageControls(container, path => { capture(); set(path); changed(false); renderEditor(); });
  container.append(button('Usar imagen original', () => { capture(); set(''); changed(false); renderEditor(); }));
}

function advanced(parent) {
  const data = selected.draft;
  const set = fields(group(parent, 'Opciones avanzadas'));
  const isPartner = selected.kind === 'partner';
  field(set, 'Nombre en el enlace (opcional)', [isPartner ? 'slug' : 'id'], isPartner ? data.slug : data.id, {
    disabled: Boolean(selected.id), hint: selected.id ? 'El enlace se conserva para que los visitantes puedan seguir utilizándolo.' : 'Se genera automáticamente desde el nombre. Puedes dejarlo vacío.'
  });
  const order = field(set, 'Orden en la página', ['sortOrder'], data.sortOrder ?? 9999, { type: 'number', hint: 'Los números menores aparecen primero.' });
  order.step = '1';
  order.max = '10000';
}

function renderTour(parent) {
  const data = selected.draft;
  if (step === 0) {
    const set = fields(parent);
    field(set, '¿Dónde quieres añadir el tour?', ['category'], data.category || 'day', { options: Object.entries(categoryLabels), wide: true, hint: 'Day Tours: recorridos de un día. Tour Packages: paquetes de varios días.' });
    field(set, 'Título', ['title', language], data.title?.[language], { wide: true, hint: 'Conservaremos las mayúsculas y los acentos tal como los escribas.' });
    field(set, 'Descripción breve', ['shortDescription', language], data.shortDescription?.[language], { area: true, hint: 'Presenta lo más atractivo del recorrido en unas pocas frases.' });
    advanced(parent);
  } else if (step === 1) {
    gallery(parent);
    field(fields(group(parent, 'Nombre de la galería')), 'Nombre para la galería', ['galleryLabel', language], data.galleryLabel?.[language]);
  } else if (step === 2) {
    const set = fields(parent);
    field(set, 'Descripción completa', ['fullDescription', language], data.fullDescription?.[language], { area: true, hint: 'Explica qué vivirá el visitante y qué necesita saber antes del recorrido.' });
    for (const [key, label] of [['duration', 'Duración'], ['groupSize', 'Tamaño del grupo'], ['pickup', 'Recogida'], ['badge', 'Etiqueta destacada (opcional)']]) field(set, label, [key, language], data[key]?.[language]);
    const lists = fields(group(parent, 'Destacados e incluidos'));
    for (const [key, label] of [['highlights', 'Lugares y actividades destacadas'], ['included', 'Qué incluye el tour']]) {
      const input = field(lists, label, [key, language], (data[key]?.[language] || []).join('\n'), { area: true, hint: 'Escribe un elemento por línea.' });
      input.dataset.lines = 'true';
    }
    const prices = fields(group(parent, 'Precio informativo'));
    field(prices, 'Precio en USD (opcional)', ['price', 'amount'], data.price?.amount, { type: 'number', hint: 'Déjalo vacío si el precio se define al cotizar. No se cobra desde este formulario.' });
    field(prices, 'Unidad del precio', ['price', 'unit'], data.price?.unit || 'person', { options: [['person', 'Por persona'], ['group', 'Por grupo']] });
    const meeting = fields(group(parent, 'Punto de encuentro y video'));
    field(meeting, 'Dirección / punto de encuentro', ['meetingPoint', 'address', language], data.meetingPoint?.address?.[language], { area: true });
    field(meeting, 'Enlace de Google Maps', ['meetingPoint', 'mapUrl'], data.meetingPoint?.mapUrl, { type: 'url' });
    field(meeting, 'Plataforma del video', ['socialVideo', 'platform'], data.socialVideo?.platform || 'tiktok', { options: [['tiktok', 'TikTok'], ['instagram', 'Instagram']] });
    field(meeting, 'Enlace del video (opcional)', ['socialVideo', 'url'], data.socialVideo?.url, { type: 'url' });
    singleImage(parent, 'Foto del punto de encuentro', () => data.meetingPoint?.photo, path => { (data.meetingPoint ??= {}).photo = path; });
    const itinerary = group(parent, 'Itinerario por días');
    (data.itinerary || []).forEach((day, index) => {
      const box = element('div', undefined, 'itinerary-day');
      const set = fields(box);
      field(set, 'Etiqueta del día', ['itinerary', index, 'day'], day.day);
      field(set, 'Título del día', ['itinerary', index, 'title', language], day.title?.[language]);
      field(set, 'Actividades del día', ['itinerary', index, 'text', language], day.text?.[language], { area: true });
      box.append(button('Quitar día', () => { capture(); data.itinerary.splice(index, 1); changed(false); renderEditor(); }));
      itinerary.append(box);
    });
    itinerary.append(button('Añadir día', () => {
      capture();
      (data.itinerary ??= []).push({ day: 'Día ' + ((data.itinerary?.length || 0) + 1), title: {}, text: {} });
      changed(false);
      renderEditor();
    }));
  }
}

function renderPartner(parent) {
  const data = selected.draft;
  if (step === 0) {
    const set = fields(parent);
    field(set, 'Tipo de contenido', ['type'], data.type || 'lodging', { options: Object.entries(partnerLabels) });
    field(set, 'Nombre del alojamiento o aliado', ['name', language], data.name?.[language]);
    field(set, 'Frase de presentación (opcional)', ['tagline', language], data.tagline?.[language], { wide: true });
    field(set, 'Descripción breve', ['shortDescription', language], data.shortDescription?.[language], { area: true });
    field(set, 'Ubicación', ['location', language], data.location?.[language], { wide: true, hint: 'Ejemplo: San Benito, San Salvador.' });
    advanced(parent);
  } else if (step === 1) gallery(parent);
  else if (step === 2) {
    const set = fields(parent);
    field(set, 'Descripción completa', ['description', language], data.description?.[language], { area: true });
    field(set, 'Dirección', ['address'], data.address, { area: true });
    field(set, 'Sitio web del negocio (opcional)', ['url'], data.url, { type: 'url', wide: true, hint: 'Utiliza un enlace completo que comience con https://. Las consultas usarán el contacto general de Zenith Trails.' });
  }
}

function dictionary(key, lang = language) {
  return window.__estI18n?.DICTIONARIES?.[lang]?.[key] || '';
}

function renderSite(parent) {
  const data = selected.draft;
  data.texts ??= {};
  data.images ??= {};
  data.contacts ??= {};
  if (step === 0) {
    const sections = [group(parent, 'Textos de portada', true), group(parent, 'Presentación del guía'), group(parent, 'Preguntas frecuentes')];
    siteFields.forEach(([key, label], index) => {
      const value = data.texts[key]?.[language] ?? dictionary(key);
      field(fields(sections[index < 8 ? 0 : index < 11 ? 1 : 2]), label, ['texts', key, language], value, { area: true });
    });
    const estate = fields(group(parent, 'Textos generales de Bienes Raíces'));
    estateFields.forEach(([key, label]) => field(estate, label, ['texts', key, language], data.texts[key]?.[language] ?? dictionary(key), { area: true }));
  } else if (step === 1) {
    for (const [key, label] of [['hero0', 'Portada 1'], ['hero1', 'Portada 2'], ['hero2', 'Portada 3'], ['hero3', 'Portada 4'], ['guide', 'Presentación del guía'], ['estateHero', 'Portada de Bienes Raíces']]) {
      singleImage(parent, 'Imagen: ' + label, () => data.images[key], path => { data.images[key] = path; }, key === 'hero0');
    }
  } else if (step === 2) {
    const contacts = fields(parent);
    field(contacts, 'WhatsApp', ['contacts', 'whatsapp'], data.contacts.whatsapp ?? '', { hint: 'Código de país y número, sin + ni espacios. Ejemplo: 50370000000. Vacío conserva el contacto original.' });
    field(contacts, 'Correo de contacto', ['contacts', 'email'], data.contacts.email, { type: 'email' });
    for (const name of ['instagram', 'facebook', 'tiktok']) field(contacts, name[0].toUpperCase() + name.slice(1), ['contacts', name], data.contacts[name], { type: 'url' });
  }
}

function missingFields() {
  if (!selected || selected.kind === 'site') return [];
  const data = selected.draft;
  const missing = [];
  if (!data[selected.kind === 'tour' ? 'title' : 'name']?.es?.trim()) missing.push({ title: 'El nombre en español', step: 0 });
  if (!data.shortDescription?.es?.trim()) missing.push({ title: 'La descripción breve en español', step: 0 });
  if (!data[selected.kind === 'tour' ? 'fullDescription' : 'description']?.es?.trim()) missing.push({ title: 'La descripción completa en español', step: 2 });
  if (!data.images?.length) missing.push({ title: 'Al menos una foto para la portada', step: 1 });
  return missing;
}

function renderPreview(parent) {
  const readiness = element('div', undefined, 'preview-readiness');
  const missing = missingFields();
  if (missing.length) {
    readiness.append(element('p', 'Antes de publicar, completa:'));
    const list = element('ul');
    missing.forEach(item => {
      const li = element('li', item.title);
      li.append(button('Completar', () => changeStep(item.step)));
      list.append(li);
    });
    readiness.append(list);
  } else readiness.append(element('p', 'El contenido está listo para revisar y publicar.'));
  readiness.append(element('p', 'Esta vista previa muestra el borrador. Los cambios todavía no se ven en la página pública.', 'support'));
  parent.append(readiness);
  const host = element('div');
  host.id = 'content-preview';
  parent.append(host);
  preview = createContentPreview(host);
  updatePreview();
}

function renderLivePreview(parent) {
  const details = element('details', undefined, 'live-preview');
  const summary = element('summary', 'Ver cómo va quedando');
  const host = element('div');
  host.id = 'live-content-preview';
  details.append(summary, host);
  details.open = livePreviewExpanded;
  function sync() {
    if (!details.isConnected) return;
    livePreviewExpanded = details.open;
    if (details.open && !preview) {
      preview = createContentPreview(host);
      updatePreview();
    } else if (!details.open && preview) {
      preview.destroy();
      preview = null;
    }
  }
  details.addEventListener('toggle', sync);
  parent.append(details);
  sync();
}

function stepLabels() {
  return selected?.kind === 'site' ? ['Textos del sitio', 'Fotos', 'Contacto', 'Vista previa'] : ['Datos básicos', 'Fotos', 'Detalles', 'Vista previa'];
}

function changeStep(next) {
  if (busy) return;
  capture();
  step = Math.max(0, Math.min(3, next));
  renderEditor();
  $('editor-steps').querySelector('[aria-current="step"]')?.focus({ preventScroll: true });
}

function renderEditor() {
  preview?.destroy();
  preview = null;
  if (!selected) { $('content-form').hidden = true; $('editor-empty').hidden = false; return; }
  $('editor-empty').hidden = true;
  $('content-form').hidden = false;
  $('editor-body').replaceChildren();
  const noun = selected.kind === 'tour' ? 'tour' : 'alojamiento o aliado';
  $('editor-title').textContent = selected.kind === 'site' ? 'Editar información general' : (selected.id ? 'Editar ' : 'Añadir ') + noun;
  updateDocumentState();
  $('hide-tour').hidden = selected.kind === 'site' || !selected.id || selected.status !== 'published';
  if ($('delete-content')) {
    const canDelete = selected.kind !== 'site' && Boolean(selected.id);
    $('delete-content').hidden = !canDelete;
    $('delete-help').hidden = !canDelete;
  }
  $('editor-steps').replaceChildren();
  const labels = stepLabels();
  labels.forEach((label, index) => {
    const node = button(`${index + 1} ${label}`, () => changeStep(index));
    node.setAttribute('aria-current', index === step ? 'step' : 'false');
    $('editor-steps').append(node);
  });
  $('previous-step').hidden = step === 0;
  $('next-step').hidden = step === 3;
  $('next-step').textContent = step === 2 ? 'Ver vista previa' : 'Siguiente';
  $('publish-content').hidden = step !== 3;
  const body = $('editor-body');
  body.append(element('h2', labels[step], 'step-heading'));
  const tips = ['Comienza con lo que ayudará a los visitantes a reconocer este contenido.', 'Elige la portada y organiza las imágenes en el orden en que quieres mostrarlas.', 'Completa la información que necesita el visitante antes de consultar.', 'Revisa el resultado en computadora y celular antes de publicar.'];
  body.append(element('p', tips[step], 'step-intro'));
  if (step === 3) renderPreview(body);
  else if (selected.kind === 'tour') renderTour(body);
  else if (selected.kind === 'partner') renderPartner(body);
  else renderSite(body);
  if (step !== 3) renderLivePreview(body);
  $('editor-fields').disabled = busy;
}

function revealEditor() {
  if (window.matchMedia('(max-width:800px)').matches) $('content-form').scrollIntoView({ block: 'start', behavior: 'auto' });
}

function selectDocument(row) {
  if (busy || !allowLeave()) return;
  selected = structuredClone(row);
  dirty = false;
  step = 0;
  language = 'es';
  $('editor-language').value = language;
  $('content-message').hidden = true;
  renderEditor();
  renderList();
  revealEditor();
}

function renderList() {
  $('tour-list').replaceChildren();
  const query = $('content-search').value.trim().toLocaleLowerCase('es');
  const filterStatus = $('filter-status').value;
  const filterCategory = $('filter-category').value;
  const rows = documents.filter(row => row.kind === pageKind).filter(row => {
    if (!contentName(row).toLocaleLowerCase('es').includes(query)) return false;
    if (filterStatus !== 'all' && (filterStatus === 'pending' ? !hasPendingChanges(row) : row.status !== filterStatus)) return false;
    return filterCategory === 'all' || (row.kind === 'tour' ? row.draft.category : row.draft.type) === filterCategory;
  }).sort((a, b) => (a.draft.sortOrder ?? 9999) - (b.draft.sortOrder ?? 9999));
  $('list-count').textContent = `${rows.length} ${rows.length === 1 ? 'contenido' : 'contenidos'}`;
  rows.forEach(row => {
    const node = element('article', undefined, 'tour-item');
    node.setAttribute('aria-current', String(selected?.id === row.id));
    const image = row.draft.images?.[0] || row.published?.images?.[0];
    if (image) {
      const img = element('img', undefined, 'tour-thumb');
      img.src = imageURL(image); img.alt = ''; img.loading = 'lazy'; node.append(img);
    } else node.append(element('span', row.kind === 'site' ? 'Sitio' : 'Sin foto', 'tour-thumb tour-thumb-placeholder'));
    const content = element('div');
    content.append(element('h3', contentName(row)));
    if (row.kind !== 'site') content.append(element('p', row.kind === 'tour' ? categoryLabels[row.draft.category] : partnerLabels[row.draft.type]));
    const badge = element('span', stateLabel(row), 'status-badge');
    badge.dataset.status = hasPendingChanges(row) ? 'pending' : row.status;
    content.append(badge);
    node.append(content, button('Editar', () => selectDocument(row)));
    $('tour-list').append(node);
  });
  if (!rows.length) $('tour-list').append(element('p', 'No hay contenidos con estos filtros.', 'support'));
}

async function load() {
  lock(true);
  try {
    const result = await request('/admin');
    if (!Array.isArray(result.documents) || !Array.isArray(result.media)) throw new Error('La lista no pudo cargarse. Intenta actualizarla de nuevo.');
    documents = result.documents;
    media = result.media;
    $('login-section').hidden = true;
    $('content-section').hidden = false;
    $('account-email').textContent = session.user.email;
    void initializeAdminNavigation(client);
    renderList();
    if (pageKind === 'site' && !selected) {
      selected = structuredClone(documents.find(row => row.kind === 'site') || { id: 'site', kind: 'site', status: 'draft', version: 0, draft: {} });
      renderEditor();
    }
  } finally { lock(false); }
}

function openLibrary(callback) {
  if (busy) return;
  capture();
  chooseImage = callback;
  $('media-list').replaceChildren();
  const paths = [...new Set([
    ...media.map(item => item.url),
    ...documents.filter(row => ['tour', 'partner'].includes(row.kind)).flatMap(row => [...(row.draft.images || []), ...(row.published?.images || [])]),
    ...Array.from({ length: 4 }, (_, i) => `assets/img/slide_${i}.jpg`)
  ])];
  paths.forEach((path, index) => {
    const node = button('Elegir imagen ' + (index + 1), () => {
      try { chooseImage(path); } catch (error) { failure(error); }
      $('media-dialog').close();
    });
    const img = element('img');
    img.src = imageURL(path); img.alt = ''; img.loading = 'lazy';
    node.prepend(img);
    $('media-list').append(node);
  });
  $('media-dialog').showModal();
}

function slug(value, max = 100) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, max).replace(/^-+|-+$/g, '');
}

function ensureIdentity() {
  if (selected.kind === 'tour') {
    selected.draft.id = selected.id || slug(selected.draft.id?.trim() || selected.draft.title?.es);
    selected.draft.slug = selected.draft.id;
  } else if (selected.kind === 'partner') {
    selected.draft.slug = selected.id ? selected.draft.slug : slug(selected.draft.slug?.trim() || selected.draft.name?.es, 92);
    selected.draft.id = selected.id || (selected.draft.slug ? 'partner-' + selected.draft.slug : '');
  }
  if (selected.kind !== 'site' && !selected.draft.id) throw new Error('Escribe primero un nombre en español para poder guardar el borrador.');
}

async function save(action) {
  if (!selected || busy) return;
  capture();
  try { ensureIdentity(); } catch (error) { failure(error); return; }
  if (action === 'publish') {
    if (step !== 3) { changeStep(3); return; }
    if (missingFields().length) {
      renderEditor();
      message('Completa los campos indicados antes de publicar. Puedes guardar un borrador mientras tanto.', true);
      return;
    }
    const where = selected.kind === 'tour' ? ' en ' + categoryLabels[selected.draft.category] : selected.kind === 'partner' ? ' en Bienes Raíces' : '';
    if (!confirm(`¿Publicar “${contentName(selected)}”${where}? Los visitantes verán estos cambios.`)) return;
  }
  if (action === 'hide' && !confirm('¿Ocultar “' + contentName(selected) + '” de la página? Podrás volver a publicarlo.' + (dirty ? ' Los cambios sin guardar se descartarán.' : ''))) return;
  lock(true);
  try {
    const result = await request('/admin', { method: 'POST', body: JSON.stringify({ id: selected.id || selected.draft.id, kind: selected.kind, draft: selected.draft, version: selected.version, action }) });
    if (!result.document?.id) throw new Error('No se confirmó el guardado. Tus cambios siguen abiertos aquí.');
    selected = result.document;
    dirty = false;
    const index = documents.findIndex(row => row.id === selected.id);
    if (index < 0) documents.push(structuredClone(selected));
    else documents[index] = structuredClone(selected);
    renderEditor();
    renderList();
    const savedMessage = {
      save: 'Borrador guardado. La página publicada conserva su versión anterior.',
      publish: selected.kind === 'tour' ? 'Contenido publicado en ' + categoryLabels[selected.draft.category] + '. Recarga la página para ver los cambios.' : 'Contenido publicado. Recarga la página para ver los cambios.',
      hide: 'Contenido oculto. Puedes editarlo y volver a publicarlo cuando quieras.'
    };
    message(savedMessage[action]);
  } catch (error) { failure(error); }
  finally { lock(false); }
}

async function deleteContent() {
  if (!selected?.id || selected.kind === 'site' || busy) return;
  capture();
  const { id, kind, version } = selected;
  const name = contentName(selected);
  if (!confirm(`¿Borrar definitivamente “${name}”? Se eliminará del panel y de la página. Esta acción no se puede deshacer. Las fotos subidas se conservarán en la biblioteca para otros contenidos.`)) return;
  let deleted = false;
  lock(true);
  try {
    const result = await request('/admin', { method: 'POST', body: JSON.stringify({ id, kind, version, action: 'delete' }) });
    if (result.deleted?.id !== id) throw new Error('No se confirmó el borrado. Actualiza la lista para comprobar el estado antes de intentarlo de nuevo.');
    documents = documents.filter(row => row.id !== id);
    selected = null;
    dirty = false;
    renderEditor();
    renderList();
    deleted = true;
    message(`“${name}” se borró del panel y de la página. Las fotos subidas siguen disponibles en la biblioteca.`);
    $('content-message').scrollIntoView({ block: 'nearest' });
  } catch (error) { failure(error); }
  finally {
    lock(false);
    if (deleted) $('new-tour').focus({ preventScroll: true });
  }
}

$('close-media').addEventListener('click', () => $('media-dialog').close());
$('content-form').addEventListener('input', event => { if (event.target.id !== 'editor-language') changed(); });
$('content-form').addEventListener('change', event => { if (event.target.id !== 'editor-language') changed(); });
$('editor-language').addEventListener('change', () => { capture(); language = $('editor-language').value; renderEditor(); });
$('previous-step').addEventListener('click', () => changeStep(step - 1));
$('next-step').addEventListener('click', () => changeStep(step + 1));
for (const id of ['content-search', 'filter-status', 'filter-category']) $(id).addEventListener(id === 'content-search' ? 'input' : 'change', renderList);
$('new-tour').addEventListener('click', () => {
  if (pageKind === 'site') {
    selectDocument(documents.find(row => row.kind === 'site') || { id: 'site', kind: 'site', status: 'draft', version: 0, draft: {} });
    return;
  }
  if (!allowLeave()) return;
  selected = { id: '', kind: pageKind, status: 'draft', version: 0, draft: pageKind === 'tour' ? { id: '', category: 'day', images: [], itinerary: [] } : { id: '', slug: '', type: 'lodging', images: [], imageCaptions: [] } };
  dirty = false; step = 0; language = 'es';
  $('editor-language').value = language;
  $('content-message').hidden = true;
  renderEditor(); renderList(); revealEditor();
});
$('reload-content').addEventListener('click', async () => {
  if (!allowLeave()) return;
  try {
    await load();
    if (selected?.id) {
      selected = structuredClone(documents.find(row => row.id === selected.id) || null);
      dirty = false;
      renderEditor();
    } else { selected = null; dirty = false; renderEditor(); }
  } catch (error) { failure(error); }
});
$('content-form').addEventListener('submit', event => { event.preventDefault(); save(event.submitter?.dataset.action || 'save'); });
$('hide-tour').addEventListener('click', () => save('hide'));
$('delete-content')?.addEventListener('click', deleteContent);
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (link && link.target !== '_blank' && !event.ctrlKey && !event.metaKey && dirty) {
    if (!allowLeave()) event.preventDefault();
    else dirty = false;
  }
});
window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
$('login-form').addEventListener('submit', async event => {
  event.preventDefault();
  const formElement = event.currentTarget;
  const form = new FormData(formElement);
  const submit = formElement.querySelector('button');
  submit.disabled = true;
  try {
    const result = await client.auth.signInWithPassword({ email: form.get('email'), password: form.get('password') });
    if (result.error) throw new Error('No se pudo iniciar sesión. Revisa correo y contraseña.');
    session = result.data.session;
    formElement.reset();
    await load();
  } catch (error) { failure(error); }
  finally { submit.disabled = false; }
});
$('logout').addEventListener('click', async () => {
  if (!allowLeave()) return;
  lock(true);
  try {
    const result = await client.auth.signOut();
    if (result.error) throw result.error;
    dirty = false; session = null; selected = null; documents = [];
    preview?.destroy(); preview = null;
    $('content-section').hidden = true;
    $('login-section').hidden = false;
    $('content-form').hidden = true;
    message('Sesión cerrada.');
  } catch (error) { failure(error); }
  finally { lock(false); }
});

if (recoveryRequested()) {
  redirectToAdminLogin();
} else if (!config.supabaseUrl || !config.publishableKey || !api.configured) {
  message('El panel está preparado, pero falta activar la conexión de contenido.', true);
  $('login-form').querySelector('button').disabled = true;
} else {
  $('local-notice').hidden = !config.localPreview;
  client = getAdminClient();
  client.auth.onAuthStateChange(event => {
    if (event === 'SIGNED_OUT') {
      session = null;
      $('content-section').hidden = true;
      $('login-section').hidden = false;
    }
  });
  try { session = (await client.auth.getSession()).data.session; if (session) await load(); }
  catch (error) { failure(error); }
}
