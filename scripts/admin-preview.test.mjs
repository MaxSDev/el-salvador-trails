import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../admin/content-preview.js', import.meta.url), 'utf8');
const { buildPreviewSnapshot } = await import('data:text/javascript,' + encodeURIComponent(source));

test('preview includes only published versions and overlays the selected unsaved tour', () => {
  const documents = [
    { id:'city',kind:'tour',status:'published',published:{id:'city',title:{es:'Público'}},draft:{id:'city',title:{es:'Borrador ajeno'}} },
    { id:'hidden',kind:'tour',status:'hidden',published:{id:'hidden',title:{es:'Oculto'}},draft:{} },
    { id:'draft',kind:'tour',status:'draft',published:null,draft:{id:'draft',title:{es:'Privado'}} }
  ];
  const selected = { id:'city',kind:'tour',draft:{id:'city',category:'day',title:{es:'Cambio sin guardar'}} };
  const snapshot = buildPreviewSnapshot({documents,selected,language:'en'});
  assert.deepEqual(snapshot.tours.map(tour => tour.title.es), ['Cambio sin guardar']);
  assert.equal(snapshot.lang,'en');
  assert.equal(snapshot.focus.id,'city');
  assert.equal(documents[0].published.title.es,'Público');
});

test('preview supports a new ally without publishing it and does not forward document metadata', () => {
  const documents = [{id:'site',kind:'site',status:'published',published:{contacts:{email:'public@example.test'}},draft:{contacts:{email:'draft@example.test'}}}];
  const selected = {id:'',kind:'partner',version:4,access_token:'private-marker',draft:{name:{es:'Nuevo aliado'},images:[]}};
  const snapshot = buildPreviewSnapshot({documents,selected,language:'es'});
  assert.equal(snapshot.partners.length,1);
  assert.equal(snapshot.partners[0].name.es,'Nuevo aliado');
  assert.equal(snapshot.site.contacts.email,'public@example.test');
  assert.equal(JSON.stringify(snapshot).includes('private-marker'),false);
  assert.equal(selected.id,'');
});

test('an incomplete new tour can be rendered before required fields are entered', () => {
  const snapshot = buildPreviewSnapshot({selected:{id:'',kind:'tour',draft:{category:'package',images:[]}}});
  assert.deepEqual(snapshot.tours[0].highlights.es,[]);
  assert.deepEqual(snapshot.tours[0].title,{es:'',en:'',pt:''});
});
