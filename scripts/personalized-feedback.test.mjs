import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {COUNTRY_CODES} from '../supabase/functions/_shared/country-codes.mjs';
import {DIAL_CODES} from '../supabase/functions/_shared/dial-codes.mjs';
import {fieldIssues,SUPPORT_OPTIONS,OTHER_EXPERIENCES} from '../supabase/functions/_shared/personalized-fields.mjs';
import {validatePersonalized} from '../supabase/functions/_shared/personalized-policy.mjs';
import {resendPersonalizedMailer} from '../supabase/functions/_shared/personalized-mail.mjs';
import {dialCodes} from './sync-personalized-contract.mjs';

// Client feedback 2026-10-14: country-code phone picker and choice-plus-text follow-ups.
const read=name=>readFile(new URL('../'+name,import.meta.url),'utf8');
const valid={submission_id:'40000000-0000-4000-8000-000000000009',schema_version:1,lang:'es',full_name:'Persona local',email:'visitante@example.invalid',whatsapp:'+503 7000 1234',whatsapp_country:'SV',group_size:'two',nationalities:['SV'],age_range:'mixed',needs_support:false,interests:['nature'],stay_length:'one_day',budget:'100_300',accommodation:'no_preference',adult:true,consent:true};
const has=(value,field,code)=>fieldIssues(value).some(issue=>issue.field===field&&issue.code===code);
async function browser(){
  const context={window:{},navigator:{languages:['pt-BR'],language:'pt-BR'},URL};
  vm.runInNewContext(await read('js/nationality-codes.js'),context);vm.runInNewContext(await read('js/dial-codes.js'),context);
  vm.runInNewContext(await read('js/personalized-rules.js'),context);vm.runInNewContext(await read('js/phone-country.js'),context);
  return context.window;
}

test('códigos telefónicos del navegador salen de libphonenumber y coinciden con el servidor',async()=>{
  const w=await browser();
  assert.deepEqual({...w.ESTDialCodes},dialCodes());assert.deepEqual({...w.ESTDialCodes},{...DIAL_CODES});
  for(const [code,dial] of [['SV','503'],['BR','55'],['US','1'],['CA','1'],['GB','44'],['XK','383'],['MX','52']])assert.equal(DIAL_CODES[code],dial,code);
  assert.ok(Object.keys(DIAL_CODES).length>=240);assert.ok(Object.keys(DIAL_CODES).every(code=>COUNTRY_CODES.includes(code)));
  assert.equal(w.ESTDialMain['1'],'US');assert.equal(w.ESTDialMain['7'],'RU');
});

test('un +código escrito elige el país principal sin pisar uno compatible ya elegido',async()=>{
  const {regionFromDigits,guessRegion}=(await browser()).ESTPhoneCountry;
  assert.equal(regionFromDigits('+1 555 0100',''),'US');assert.equal(regionFromDigits('+1 416','CA'),'CA');
  assert.equal(regionFromDigits('+503 7000 1234','US'),'SV');assert.equal(regionFromDigits('+55 11 9999','SV'),'BR');
  assert.equal(guessRegion('es'),'BR');
});

test('el país del teléfono debe existir y coincidir con el número',()=>{
  assert.deepEqual(fieldIssues(valid),[]);assert.deepEqual(fieldIssues({...valid,whatsapp_country:''}),[]);
  assert.ok(has({...valid,whatsapp_country:'BR'},'whatsapp','phoneCountry'));
  assert.ok(has({...valid,whatsapp_country:'ZZ'},'whatsapp','phoneCountry'));
  assert.ok(has({...valid,whatsapp_country:7},'whatsapp','phoneCountry'));
  assert.ok(!has({...valid,whatsapp:'+1 416 555 0100',whatsapp_country:'CA'},'whatsapp','phoneCountry'));
  assert.equal(validatePersonalized(valid).contact.whatsapp_country,'SV');
  assert.throws(()=>validatePersonalized({...valid,whatsapp_country:'BR'}));
});

test('apoyos: opciones y texto libre, ambos opcionales y descartados si no hay necesidad',()=>{
  const chosen=validatePersonalized({...valid,needs_support:true,support_options:['wheelchair','dietary'],accessibility_notes:'Rampa para el vehículo'});
  assert.deepEqual(chosen.profile.support_options,['dietary','wheelchair']);assert.equal(chosen.profile.accessibility_notes,'Rampa para el vehículo');
  assert.deepEqual(validatePersonalized({...valid,needs_support:true}).profile.support_options,[]);
  assert.deepEqual(validatePersonalized({...valid,needs_support:false,support_options:['wheelchair']}).profile.support_options,[]);
  for(const support_options of [['teleport'],['visual','visual'],'visual'])assert.ok(has({...valid,needs_support:true,support_options},'support_options','selectMany'));
  assert.equal(SUPPORT_OPTIONS.length,8);
});

test('otra experiencia: basta una opción o el texto; sin ninguno se pide completar',()=>{
  const base={...valid,interests:['nature','other']};
  assert.deepEqual(validatePersonalized({...base,other_interest_options:['crafts','coffee_cacao']}).profile.other_interest_options,['coffee_cacao','crafts']);
  assert.equal(validatePersonalized({...base,other_interest:'Pesca deportiva'}).profile.other_interest,'Pesca deportiva');
  assert.ok(has(base,'other_interest','chooseOrWrite'));assert.throws(()=>validatePersonalized(base));
  assert.ok(has({...base,other_interest_options:['skydiving']},'other_interest_options','selectMany'));
  assert.deepEqual(validatePersonalized({...valid,other_interest_options:['crafts']}).profile.other_interest_options,[]);
  assert.equal(OTHER_EXPERIENCES.length,8);
});

test('reglas del navegador siguen idénticas al servidor con los campos nuevos',async()=>{
  const w=await browser();
  for(const value of [valid,{...valid,whatsapp_country:'BR'},{...valid,needs_support:true,support_options:['nope']},{...valid,interests:['other']},{...valid,interests:['other'],other_interest_options:['markets']}])
    assert.deepEqual(JSON.parse(JSON.stringify(w.ESTPersonalizedFields.fieldIssues(value))),fieldIssues(value));
  assert.deepEqual(Array.from(w.ESTPersonalizedFields.SUPPORT_OPTIONS),SUPPORT_OPTIONS);
});

test('formulario, traducciones y correo cubren cada opción nueva',async()=>{
  const html=await read('personalized.html'),i18n=await read('js/personalized-ux-i18n.js');
  for(const value of SUPPORT_OPTIONS)assert.match(html,new RegExp('name="support_options" value="'+value+'"'));
  for(const value of OTHER_EXPERIENCES)assert.match(html,new RegExp('name="other_interest_options" value="'+value+'"'));
  for(const key of [...SUPPORT_OPTIONS.map(v=>'support_options.'+v),...OTHER_EXPERIENCES.map(v=>'other_interest_options.'+v),'phoneCountrySearch','fieldError.phoneCountry'])assert.equal(i18n.split("'"+key+"'").length-1+i18n.split(key+':').length-1>=3,true,key);
  assert.match(html,/name="whatsapp_country"/);assert.match(html,/autocomplete="tel-national"/);
  for(const icon of ['chat','group','route'])assert.match(html,new RegExp('personalized-heading-icon[^>]*>'+icon+'<'));
  let body='';const mailer=resendPersonalizedMailer({key:'k',from:'form@example.invalid',to:'equipo@example.invalid',fetcher:async(url,request)=>{body=JSON.parse(request.body).text;return Response.json({id:'mock'});}});
  const r=validatePersonalized({...valid,needs_support:true,support_options:['wheelchair'],interests:['other'],other_interest_options:['crafts']});
  await mailer.send({id:'40000000-0000-4000-8000-000000000009',request:{...r,created_at:'2026-10-16T00:00:00Z'}});
  assert.match(body,/Apoyos seleccionados: Silla de ruedas/);assert.match(body,/Otras experiencias: Artesanías y talleres/);assert.match(body,/WhatsApp: \+503 7000 1234 \(SV\) · https:\/\/wa\.me\/50370001234/);
});

test('ningún país se muestra como código suelto y los bloques no recortan las listas',async()=>{
  const {createRequire}=await import('node:module');const search=createRequire(import.meta.url)('../js/nationality-search.js');
  for(const lang of ['es','en','pt'])for(const item of search.catalog(COUNTRY_CODES,lang,'Other'))assert.notEqual(item.label,item.code,lang+' '+item.code);
  assert.equal(search.search(COUNTRY_CODES,'sahara','es','Otra')[0]?.code,'EH');
  const css=await read('css/personalized.css'),block=css.match(/\.personalized-section \{[^}]*\}/)[0];
  assert.doesNotMatch(block,/overflow:\s*(clip|hidden)/);assert.match(css,/\.personalized-section:focus-within/);
  assert.match(await read('js/phone-country.js'),/phoneNoResults/);
});
