import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {PGlite} from '@electric-sql/pglite';
import {validatePersonalized,aggregatePersonalized} from '../supabase/functions/_shared/personalized-policy.mjs';
import {createPersonalizedHandler} from '../supabase/functions/_shared/personalized-handler.mjs';
import {resendPersonalizedMailer} from '../supabase/functions/_shared/personalized-mail.mjs';
import {localPersonalizedStore} from './personalized-local-store.mjs';
import {LOCAL_ADMIN_ID} from './reviews-local-store.mjs';
const origin='http://127.0.0.1:8000',id='40000000-0000-4000-8000-000000000004';
export const fixture=(changes={})=>({schema_version:1,submission_id:id,lang:'es',full_name:'Persona de prueba',email:'visitante@example.invalid',whatsapp:'+503 7000 1234',group_size:'3_5',nationalities:['BR','SV'],other_nationalities:'',age_range:'mixed',needs_support:false,accessibility_notes:'',interests:['nature','photography'],other_interest:'',stay_length:'4_5_days',budget:'100_300',accommodation:'boutique',wishes:'Conocer el lago',adult:true,consent:true,turnstile_token:'valid',...changes});
test('normaliza categorías sin nombres traducidos y exige consentimiento y opciones válidas',()=>{
 const result=validatePersonalized(fixture({nationalities:['SV','BR'],accessibility_notes:'No guardar si no corresponde'}));
 assert.deepEqual(result.profile.nationalities,['BR','SV']);assert.equal(result.profile.accessibility_notes,'');
 assert.equal(validatePersonalized(fixture({needs_support:true})).profile.accessibility_notes,'');
 for(const change of [{consent:false},{adult:false},{email:'bad'},{whatsapp:'70001234'},{interests:[]},{age_range:'fake'},{budget:'gratis'},{nationalities:['XX']},{nationalities:['SV','SV']},{needs_support:'yes'},{interests:['other']},{nationalities:['OTHER']}])assert.throws(()=>validatePersonalized(fixture(change)));
});
test('estadísticas cuentan solicitudes por mes local y no incluyen PII ni necesidades especiales',()=>{
 const row={...validatePersonalized(fixture({needs_support:true,accessibility_notes:'Apoyo sensible'})),created_at:'2026-02-01T03:00:00.000Z'};
 const stats=aggregatePersonalized([row],'2026-01-01T00:00:00.000Z','2026-03-01T00:00:00.000Z');
 assert.equal(stats.total,1);assert.deepEqual(stats.byMonth,[{key:'2026-01',count:1}]);assert.equal(stats.unit,'requests');
 assert.equal(stats.dimensions.nationality.length,2);assert.equal(stats.dimensions.interests.length,2);
 assert.doesNotMatch(JSON.stringify(stats),/Persona|example|Apoyo|whatsapp|accessibility/);
});
test('envío privado es idempotente, limita abuso y protege estadísticas por administrador',async()=>{
 const fixtureDirectory=fileURLToPath(new URL('../.local/',import.meta.url));
 await mkdir(fixtureDirectory,{recursive:true});
 const store=await localPersonalizedStore(await mkdtemp(join(fixtureDirectory,'personalized-test-')));
 const handler=createPersonalizedHandler({store,verifyTurnstile:async token=>token==='valid',hashIP:async()=> 'ip',auth:{user:async token=>token==='admin'?{id:LOCAL_ADMIN_ID}:{id:'visitor'}}},{allowedOrigins:[origin],localPreview:true});
 const send=(value,headers={})=>handler(new Request(origin+'/personalized-api/submit',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body:JSON.stringify(value)}));
 assert.equal((await send(fixture({turnstile_token:'wrong'}))).status,400);
 const response=await send(fixture());assert.equal(response.status,201);assert.equal((await response.json()).localPreview,true);
 assert.equal((await send(fixture())).status,201);
 assert.equal((await send(fixture({wishes:'Changed'}))).status,409);
 for(let n=5;n<=6;n++) assert.equal((await send(fixture({submission_id:`40000000-0000-4000-8000-00000000000${n}`}))).status,201);
 assert.equal((await send(fixture({submission_id:'40000000-0000-4000-8000-000000000007'}))).status,429);
 const url=origin+'/personalized-api/stats?from=2020-01-01&to=2020-12-31';
 assert.equal((await handler(new Request(url,{headers:{Origin:origin}}))).status,401);
 assert.equal((await handler(new Request(url,{headers:{Origin:origin,Authorization:'Bearer visitor'}}))).status,403);
 assert.equal((await handler(new Request(url,{headers:{Origin:origin,Authorization:'Bearer admin'}}))).status,200);
 const jobs=await store.claimMail(10);assert.equal(jobs.length,3);assert.equal((await store.claimMail(10)).length,0);
});
test('correo no se activa sin configuración y usa exclusivamente el destinatario explícito',async()=>{
 assert.equal(resendPersonalizedMailer({key:'',from:'',to:''}),null);
 let captured;
 const mailer=resendPersonalizedMailer({key:'test-key',from:'form@example.invalid',to:'maxgsf444@gmail.com',fetcher:async(url,request)=>{captured={url,request};return Response.json({id:'mock-only'});}});
 const receipt=await mailer.send({id,request:{...validatePersonalized(fixture()),created_at:'2026-01-01T00:00:00Z'}});
 assert.equal(receipt,'mock-only');assert.deepEqual(JSON.parse(captured.request.body).to,['maxgsf444@gmail.com']);
 assert.equal(captured.request.headers['Idempotency-Key'],'personalized/'+id);
 assert.doesNotMatch(captured.request.body,/mario\.yourtourguide/);
});
test('PostgreSQL guarda solicitud y outbox juntos, rechaza lectura pública y agrega sin contacto',async()=>{
 const db=new PGlite();
 try {
  await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
  await db.exec(await readFile(new URL('../supabase/schemas/personalized.sql',import.meta.url),'utf8'));
  const value=validatePersonalized(fixture());
  const save=()=>db.query('select public.save_personalized_request($1,$2,$3,$4::jsonb)',[id,'digest','ip',JSON.stringify(value)]);
  await save();await save();assert.equal((await db.query('select count(*)::int as n from public.personalized_mail_outbox')).rows[0].n,1);
  await db.exec('set role anon');await assert.rejects(db.query('select * from public.personalized_requests'));
  await assert.rejects(db.query('select public.personalized_stats(now()-interval \'1 day\',now())'));
  await db.exec('reset role');
  const result=(await db.query('select public.personalized_stats(now()-interval \'1 day\',now()+interval \'1 day\') as stats')).rows[0].stats;
  assert.equal(result.total,1);assert.doesNotMatch(JSON.stringify(result),/email|whatsapp|full_name|accessibility/);
  const claimed=(await db.query('select public.claim_personalized_mail(10) as jobs')).rows[0].jobs;
  assert.equal(claimed.length,1);assert.equal((await db.query('select public.claim_personalized_mail(10) as jobs')).rows[0].jobs.length,0);
 } finally {await db.close();}
});
