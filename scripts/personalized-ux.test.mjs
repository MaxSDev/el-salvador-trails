import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {COUNTRY_CODES} from '../supabase/functions/_shared/country-codes.mjs';
import {fieldIssues} from '../supabase/functions/_shared/personalized-fields.mjs';
import {validatePersonalized} from '../supabase/functions/_shared/personalized-policy.mjs';
import {createPersonalizedHandler} from '../supabase/functions/_shared/personalized-handler.mjs';
const require=createRequire(import.meta.url),search=require('../js/nationality-search.js');
const read=name=>readFile(new URL('../'+name,import.meta.url),'utf8');
const valid={submission_id:'40000000-0000-4000-8000-000000000001',schema_version:1,lang:'es',full_name:'Persona local',email:'visitante@example.invalid',whatsapp:'+503 7000 1234',group_size:'two',nationalities:['SV'],age_range:'mixed',needs_support:false,interests:['nature'],stay_length:'one_day',budget:'100_300',accommodation:'no_preference',adult:true,consent:true};
test('listado completo y códigos del navegador idénticos al servidor',async()=>{
  assert.equal(COUNTRY_CODES.length,251);assert.equal(new Set(COUNTRY_CODES).size,251);
  for(const code of ['SV','BR','NZ','JP','ZA','XK','OTHER'])assert.ok(COUNTRY_CODES.includes(code));
  const context={window:{}};vm.runInNewContext(await read('js/nationality-codes.js'),context);
  assert.deepEqual(Array.from(context.window.ESTNationalityCodes),Array.from(COUNTRY_CODES));
  for(const lang of ['es','en','pt'])assert.equal(search.catalog(COUNTRY_CODES,lang,'Other').length,251);
});
test('búsqueda admite gentilicios, acentos y errores pequeños sin aceptar entradas inexistentes',()=>{
  for(const [query,lang,code] of [['salvadoreña','es','SV'],['salvadorenha','pt','SV'],['brasilero','es','BR'],['brasli','en','BR'],['canadiense','es','CA'],['francés','es','FR'],['New Zealand','en','NZ'],['japonês','pt','JP']]){
    assert.equal(search.search(COUNTRY_CODES,query,lang,'Other')[0]?.code,code,query);
  }
  assert.equal(search.search(COUNTRY_CODES,'xyzqwerty','es','Other').length,0);
});
test('reglas del navegador y servidor producen los mismos errores por campo',async()=>{
  const context={window:{ESTNationalityCodes:Array.from(COUNTRY_CODES)},URL};vm.runInNewContext(await read('js/personalized-rules.js'),context);
  for(const value of [valid,{...valid,email:'incompleto',whatsapp:'123',nationalities:['BR','BR'],interests:[],adult:false},{...valid,other_interest:'A'.repeat(201)},{...valid,nationalities:{includes:123},interests:{includes:true}},{...valid,nationalities:Array(1000).fill('SV')}]){
    assert.deepEqual(JSON.parse(JSON.stringify(context.window.ESTPersonalizedFields.fieldIssues(value))),fieldIssues(value));
  }
  assert.deepEqual(fieldIssues(valid),[]);
  const issues=fieldIssues({...valid,email:'incompleto',whatsapp:'123',nationalities:['BR','BR'],interests:[],adult:false});
  for(const [field,code] of [['email','emailFormat'],['whatsapp','phoneFormat'],['nationalities','countryDuplicate'],['interests','selectMany'],['adult','adultRequired']])assert.ok(issues.some(issue=>issue.field===field&&issue.code===code));
});
test('servidor admite todas las opciones y mantiene notas de apoyo opcionales',()=>{
  for(const code of COUNTRY_CODES){const value={...valid,nationalities:[code],other_nationalities:code==='OTHER'?'Ciudadanía por confirmar':''};assert.equal(validatePersonalized(value).profile.nationalities[0],code);}
  assert.equal(validatePersonalized({...valid,needs_support:true}).profile.accessibility_notes,'');
  for(const value of [{...valid,nationalities:['QZ']},{...valid,whatsapp:'+1234567890123456'},{...valid,nationalities:['SV','SV']}])assert.throws(()=>validatePersonalized(value));
  for(const email of ['a@..com','a@-dominio.com','a@dominio.com:443','a..b@dominio.com'])assert.ok(fieldIssues({...valid,email}).some(issue=>issue.field==='email'));
  for(const email of ['nombre+viaje@example.com','info@café.com'])assert.ok(!fieldIssues({...valid,email}).some(issue=>issue.field==='email'));
});
test('respuesta de validación localiza errores sin devolver el contacto ingresado',async()=>{
  const origin='http://127.0.0.1:8000';let saved=false;
  const handler=createPersonalizedHandler({store:{save:async()=>{saved=true;}},verifyTurnstile:async()=>true},{allowedOrigins:[origin],localPreview:true});
  const response=await handler(new Request(origin+'/personalized-api/submit',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({...valid,email:'incompleto'})}));
  assert.equal(response.status,400);const body=await response.json();assert.equal(body.error,'validation');assert.ok(body.fields.some(issue=>issue.field==='email'&&issue.code==='emailFormat'));assert.equal(saved,false);assert.doesNotMatch(JSON.stringify(body),/Persona local|incompleto|7000/);
});
