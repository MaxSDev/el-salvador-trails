import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
const require=createRequire(import.meta.url);
const options=require('../js/tour-options.js');
const root=new URL('../',import.meta.url);
const read=name=>readFile(new URL(name,root),'utf8');
const data=JSON.parse(await read('data/tours.json'));
const days=data.tours.filter(tour=>tour.category==='day');
const additions=days.filter(tour=>tour.contentSource);

test('catálogo con nueve Day Tours únicos y dos paquetes; fallback file:// idéntico',async()=>{
  assert.equal(days.length,9);assert.equal(additions.length,5);
  assert.equal(data.tours.filter(tour=>tour.category==='package').length,2);
  assert.equal(new Set(data.tours.map(tour=>tour.id)).size,data.tours.length);
  assert.deepEqual(days.slice(0,4).map(tour=>tour.id),['city-tour-san-salvador','cihuatan-suchitoto','ruta-maya-el-salvador','volcan-santa-ana']);
  const context={window:{}};vm.runInNewContext(await read('data/tours-data.js'),context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.window.__TOURS_DATA)),data);
});

test('los cinco nuevos conservan el texto del cliente sin emojis y traducciones completas',async()=>{
  const source=(await read('docs/DAY_TOURS_CLIENT_SOURCE_2026-10-11.md')).replaceAll('\r\n','\n');
  const entries=[...source.matchAll(/## Day Tour (\d+) — (.*?)\n\n([\s\S]*?)(?=\n---|$)/g)];
  for(const tour of additions){
    const entry=entries.find(entry=>Number(entry[1])===tour.contentSource.sourceNumber);
    const formal=text=>text.replace(/[\u{1F33F}\u{1F30A}\u{1F30B}\u{1F3DB}\u2600]\uFE0F? /gu,'');
    assert.ok(entry,tour.id);assert.equal(tour.title.es,formal(entry[2]));
    assert.equal(tour.fullDescription.es,formal(entry[3].trim().replaceAll('**','')));
    for(const lang of ['es','en','pt'])for(const field of ['title','shortDescription','fullDescription','galleryLabel'])assert.ok(tour[field][lang].length,tour.id+' '+field+' '+lang);
    assert.equal(tour.rating,null);assert.equal(tour.pickup,null);assert.equal(tour.groupSize,null);assert.equal(tour.meetingPoint,null);
  }
});

test('las fotos de cada tour nuevo existen y tienen variantes; Ilopango identifica fotos del centro',async()=>{
  const manifest=JSON.parse(await read('data/media-manifest.json'));
  for(const tour of additions)for(const [i,src] of tour.images.entries()){
    await access(new URL(src,root));const media=manifest.images[src.replace(/^assets\//,'')];assert.ok(media,src);
    for(const lang of ['es','en','pt'])assert.ok(tour.imageDescriptions[lang][i]);
    for(const format of ['avif','webp'])for(const variant of media.variants[format])await access(new URL(manifest.outputRoot+'/'+variant.src,root));
  }
  const ilopango=days.find(tour=>tour.id==='ciudad-lago-ilopango');assert.match(ilopango.mediaNote.es,/Centro Histórico/);assert.match(ilopango.mediaNote.es,/pendientes/);
});

test('solo hechos confirmados y extras válidos entran en ficha y cotización',()=>{
  const coast=days.find(tour=>tour.id==='la-libertad-paraiso-del-surf');
  assert.deepEqual(options.quickFacts(coast,'es'),[]);
  assert.deepEqual(options.quickFacts(days.find(tour=>tour.id==='laguna-alegria-volcan-tecapa'),'en'),[{icon:'schedule',text:'Full day'}]);
  assert.equal(options.extraLine(coast,[],'es'),'');assert.equal(options.extraLine(coast,['invalid-extra'],'es'),'');
  assert.match(options.extraLine(coast,['surf-lesson-1h'],'en'),/One-hour surfing lesson/);
  assert.match(options.extraLine(coast,['surf-lesson-1h'],'pt'),/Aula de surf de uma hora/);
});

test('la cotización real añade surf seleccionado y conserva grupo al cambiar idioma sin enviar mensajes',async()=>{
  const nodes={};const node=(value='')=>({value,checked:false,listeners:{},addEventListener(name,fn){this.listeners[name]=fn;}});
  for(const id of ['quote-adults','quote-children','quote-date','btn-quote-whatsapp','btn-quote-email'])nodes[id]=node();
  nodes['quote-adults'].value='4';nodes['quote-children'].value='1';nodes['quote-date'].value='2026-12-01';
  const extra=node('surf-lesson-1h');extra.checked=true;
  nodes['tour-detail-container']={querySelectorAll:()=>[extra]};
  let opened='';let lang='es';
  const window={ESTTourOptions:options,__estI18n:{getLang:()=>lang},open:url=>{opened=url;},location:{href:''}};
  const document={querySelector:()=>null,getElementById:id=>nodes[id]||null,addEventListener(){}};
  const source=(await read('js/tours.js')).replace(/\}\)\(\);\s*$/,'window.testQuote = setupQuotationActions;})();');
  vm.runInNewContext(source,{window,document,console,setTimeout});
  const coast=days.find(tour=>tour.id==='la-libertad-paraiso-del-surf');
  window.testQuote(coast,coast.title.es);extra.listeners.change();nodes['btn-quote-whatsapp'].listeners.click();
  let message=new URL(opened).searchParams.get('text');assert.match(message,/Clase de surf de una hora/);assert.match(message,/Adultos: 4/);assert.doesNotMatch(message,/50%/);
  // Re-rendering after language change must restore the in-memory quote selections.
  extra.checked=false;nodes['quote-adults'].value='2';lang='pt';window.testQuote(coast,coast.title.pt);
  assert.equal(extra.checked,true);assert.equal(nodes['quote-adults'].value,'4');nodes['btn-quote-email'].listeners.click();
  message=new URL(window.location.href).searchParams.get('body');assert.match(message,/Aula de surf de uma hora/);
  extra.checked=false;nodes['btn-quote-whatsapp'].listeners.click();assert.doesNotMatch(new URL(opened).searchParams.get('text'),/Extra opcional/);
});
