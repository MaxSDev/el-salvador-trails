import {createClient} from 'npm:@supabase/supabase-js@2.117.3';
import {createPersonalizedHandler} from '../_shared/personalized-handler.mjs';
import {QuoteError} from '../_shared/personalized-policy.mjs';
import {resendPersonalizedMailer} from '../_shared/personalized-mail.mjs';
const env=(name:string)=>Deno.env.get(name)||'';
const client=createClient(env('SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
const allowedOrigins=env('REVIEW_ALLOWED_ORIGINS').split(',').map(x=>x.trim()).filter(Boolean);
const hostnames=new Set(allowedOrigins.map(x=>new URL(x).hostname));
async function checked(promise:any){const {data,error}=await promise;if(error){if(error.message.includes('rate-limit'))throw new QuoteError('rate-limit',429);if(error.message.includes('conflict')||error.code==='23505')throw new QuoteError('conflict',409);throw new Error('Storage unavailable');}return data;}
const handler=createPersonalizedHandler({
  store:{
    save:(data:any,digest:string,ip:string)=>checked(client.rpc('save_personalized_request',{p_id:data.submission_id,p_digest:digest,p_ip:ip,p_data:data})),
    isAdmin:async (id:string)=>!!await checked(client.from('review_admins').select('user_id').eq('user_id',id).maybeSingle()),
    stats:(from:string,to:string)=>checked(client.rpc('personalized_stats',{p_from:from,p_to:to})),
    claimMail:(limit:number)=>checked(client.rpc('claim_personalized_mail',{p_limit:limit})),
    finishMail:(id:string,receipt:string)=>checked(client.from('personalized_mail_outbox').update({status:'sent',sent_at:new Date().toISOString(),provider_id:receipt}).eq('request_id',id)),
    failMail:(id:string)=>checked(client.from('personalized_mail_outbox').update({status:'error'}).eq('request_id',id))
  },
  auth:{user:async(token:string)=>(await checked(client.auth.getUser(token))).user},
  hashIP:async(ip:string)=>{
    const salt=env('REVIEW_RATE_SALT');if(salt.length<32)throw new Error('Rate configuration missing');
    const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(salt),{name:'HMAC',hash:'SHA-256'},false,['sign']);
    const bytes=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode('personalized:'+ip));return Array.from(new Uint8Array(bytes)).map(x=>x.toString(16).padStart(2,'0')).join('');
  },
  verifyTurnstile:async(token:string,ip:string)=>{
    const secret=env('TURNSTILE_SECRET_KEY');if(!secret||/^[123]x0000000000000000000000000000000/.test(secret))return false;
    const body=new URLSearchParams({secret,response:token||''});if(ip!=='unknown')body.set('remoteip',ip);
    const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body,signal:AbortSignal.timeout(10000)});
    if(!response.ok)return false;const result=await response.json();return result.success===true&&result.action==='personalized'&&hostnames.has(result.hostname);
  },
  mailer:resendPersonalizedMailer({key:env('RESEND_API_KEY'),from:env('PERSONALIZED_MAIL_FROM'),to:env('PERSONALIZED_MAIL_TO')}),
  schedule:(task:Promise<unknown>)=>EdgeRuntime.waitUntil(task)
},{allowedOrigins});
Deno.serve(handler);
