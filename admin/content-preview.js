export function buildPreviewSnapshot({ documents = [], selected, language = 'es' } = {}) {
  const published = documents.filter(row => row.status === 'published' && row.published);
  const snapshot = {
    tours: published.filter(row => row.kind === 'tour').map(row => structuredClone(row.published)),
    partners: published.filter(row => row.kind === 'partner').map(row => structuredClone(row.published)),
    site: structuredClone(published.find(row => row.kind === 'site')?.published || {}),
    lang: ['es', 'en', 'pt'].includes(language) ? language : 'es',
    focus: { kind: selected?.kind || 'site', id: selected?.id || '', view: 'detail' }
  };
  if (!selected?.draft) return snapshot;
  const draft = structuredClone(selected.draft);
  if (selected.kind === 'tour') {
    for (const key of ['title','shortDescription','fullDescription','duration','groupSize','pickup','galleryLabel','badge']) draft[key] = {es:'',en:'',pt:'',...draft[key]};
    for (const key of ['highlights','included']) draft[key] = {es:[],en:[],pt:[],...draft[key]};
    draft.images ||= [];
    draft.itinerary ||= [];
  }
  if (selected.kind === 'site') snapshot.site = draft;
  else {
    const id = selected.id || draft.id || (selected.kind === 'partner' ? 'partner-preview' : 'preview-tour');
    draft.id = id;
    if (selected.kind === 'partner') draft.slug ||= id.replace(/^partner-/, '');
    const key = selected.kind === 'partner' ? 'partners' : 'tours';
    const index = snapshot[key].findIndex(item => item.id === id);
    if (index === -1) snapshot[key].push(draft);
    else snapshot[key][index] = draft;
    snapshot.focus.id = id;
    snapshot.focus.category = draft.category || 'day';
  }
  return snapshot;
}

export function createContentPreview(host) {
  const stylesheet = new URL('./content-preview.css', import.meta.url).href;
  if (!document.querySelector('link[data-content-preview-style]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = stylesheet; link.dataset.contentPreviewStyle = '';
    document.head.append(link);
  }
  const toolbar = document.createElement('div'); toolbar.className = 'preview-toolbar';
  const label = document.createElement('strong'); label.textContent = 'Vista previa del borrador';
  const tools = document.createElement('div'); tools.className = 'preview-tools';
  const phone = document.createElement('button'); phone.type = 'button'; phone.textContent = 'Celular';
  const desktop = document.createElement('button'); desktop.type = 'button'; desktop.textContent = 'Computadora';
  const viewLabel = document.createElement('label'); viewLabel.textContent = 'Mostrar';
  const view = document.createElement('select'); view.setAttribute('aria-label', 'Contenido de la vista previa');
  for (const [value, title] of [['detail', 'Detalle del tour'], ['card', 'Tarjeta en el catálogo']]) {
    const option = document.createElement('option'); option.value = value; option.textContent = title; view.append(option);
  }
  const destinationLabel = document.createElement('label'); destinationLabel.textContent = 'Página';
  const destination = document.createElement('select'); destination.setAttribute('aria-label','Página de la vista previa');
  for (const [value,title] of [['index.html','Inicio'],['real-estate.html','Bienes Raíces']]) {
    const option = document.createElement('option'); option.value = value; option.textContent = title; destination.append(option);
  }
  destinationLabel.append(destination);
  viewLabel.append(view); tools.append(desktop, phone, viewLabel, destinationLabel); toolbar.append(label, tools);
  const note = document.createElement('p'); note.className = 'support';
  note.textContent = 'Puedes revisar fotos y textos. Los cambios todavía no se han publicado y los envíos de consultas están desactivados aquí.';
  const status = document.createElement('p'); status.className = 'preview-status'; status.setAttribute('role', 'status');
  const stage = document.createElement('div'); stage.className = 'preview-stage';
  const frame = document.createElement('iframe'); frame.title = 'Página con los cambios del borrador';
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin'); frame.setAttribute('referrerpolicy', 'same-origin');
  stage.append(frame); host.replaceChildren(toolbar, note, status, stage);
  let current, target = '', ready = false, timer, mode = 'desktop', session = '', destroyed = false;
  function size() {
    const width = mode === 'phone' ? 390 : 1280;
    const height = mode === 'phone' ? 844 : 900;
    const available = stage.clientWidth || host.clientWidth || 800;
    const scale = Math.min(1, available / width);
    frame.style.width = width + 'px'; frame.style.height = height + 'px';
    frame.style.transform = `scale(${scale})`; stage.style.height = Math.ceil(height * scale) + 'px';
    phone.setAttribute('aria-pressed', String(mode === 'phone'));
    desktop.setAttribute('aria-pressed', String(mode === 'desktop'));
  }
  function send() {
    if (!ready || !current || destroyed) return;
    const snapshot = buildPreviewSnapshot(current); snapshot.focus.view = view.value;
    frame.contentWindow.postMessage({ type: 'est:preview-update', session, snapshot }, location.origin);
    status.textContent = 'Actualizando vista previa…';
  }
  const observer = new ResizeObserver(size); observer.observe(stage);
  function receive(event) {
    if (event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.session !== session) return;
    if (event.data.type === 'est:preview-ready') { ready = true; send(); }
    if (event.data.type === 'est:preview-applied') { status.textContent = 'Vista previa actualizada. Sin publicar.'; size(); }
  }
  window.addEventListener('message', receive);
  phone.addEventListener('click', () => { mode = 'phone'; size(); });
  desktop.addEventListener('click', () => { mode = 'desktop'; size(); });
  view.addEventListener('change', send);
  destination.addEventListener('change', () => { target = ''; update(current); });
  function update(input) {
      current = input;
      const kind = input.selected?.kind;
      const next = kind === 'tour' ? 'tours.html' : kind === 'partner' ? 'real-estate.html' : destination.value;
      viewLabel.hidden = kind !== 'tour';
      destinationLabel.hidden = kind !== 'site';
      if (next !== target) {
        target = next; ready = false; session = crypto.randomUUID();
        status.textContent = 'Cargando vista previa…';
        frame.src = `../${target}?adminPreview=1&previewSession=${session}`;
      }
      clearTimeout(timer); timer = setTimeout(send, 300); size();
  }
  return {
    update,
    destroy() { destroyed = true; clearTimeout(timer); observer.disconnect(); window.removeEventListener('message', receive); host.replaceChildren(); }
  };
}
