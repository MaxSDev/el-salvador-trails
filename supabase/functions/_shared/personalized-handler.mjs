import {validatePersonalized,QuoteError} from './personalized-policy.mjs';
import {sha256} from './review-handler.mjs';

async function body(request) {
  if(!request.headers.get('content-type')?.startsWith('application/json')) throw new QuoteError('validation');
  if(!request.body) throw new QuoteError('validation');
  const reader=request.body.getReader(); let size=0; const parts=[];
  try {while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>16000){await reader.cancel();throw new QuoteError('request-size',413);}parts.push(value);}}
  finally {reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;for(const value of parts){bytes.set(value,offset);offset+=value.length;}
  try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new QuoteError('validation');}
}
function period(url) {
  const parse=value=>{const d=new Date(value);if(!value||!Number.isFinite(+d))throw new QuoteError('period');return d;};
  const from=parse(url.searchParams.get('from')),to=parse(url.searchParams.get('to'));
  if(to<=from||to-from>366*86400000) throw new QuoteError('period');
  return [from.toISOString(),to.toISOString()];
}
export function createPersonalizedHandler(deps,{allowedOrigins,localPreview=false}) {
  async function deliver() {
    const jobs=await deps.store.claimMail(10); const results=[];
    for(const job of jobs){try{const receipt=await deps.mailer.send(job);await deps.store.finishMail(job.id,receipt);results.push({id:job.id,sent:true});}catch{await deps.store.failMail(job.id);results.push({id:job.id,sent:false});}}
    return results;
  }
  return async request=> {
    const origin=request.headers.get('origin');
    const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff'};
    const respond=(value,status=200)=>new Response(JSON.stringify(value),{status,headers});
    if(!origin||!allowedOrigins.includes(origin))return respond({error:'origin'},403);
    headers['Access-Control-Allow-Origin']=origin;
    headers['Access-Control-Allow-Headers']='authorization,apikey,content-type';
    headers['Access-Control-Allow-Methods']='POST,GET,OPTIONS';
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
    const path=new URL(request.url).pathname;
    try {
      if(request.method==='POST'&&path.endsWith('/submit')) {
        const input=await body(request);
        if(input.website)throw new QuoteError('validation');
        const value=validatePersonalized(input);
        const ip=(request.headers.get('x-forwarded-for')||'').split(',')[0].trim()||request.headers.get('cf-connecting-ip')||request.headers.get('x-real-ip')||'unknown';
        if(!await deps.verifyTurnstile(input.turnstile_token,ip))throw new QuoteError('captcha');
        const digest=await sha256(JSON.stringify(value));
        const result=await deps.store.save(value,digest,await deps.hashIP(ip));
        if(deps.mailer&&deps.schedule)deps.schedule(deliver().catch(()=>{}));
        // Durable outbox is created in the same transaction as the request. Submission never waits on mail.
        return respond({id:result.id,status:'received',localPreview},201);
      }
      const token=/^Bearer (.+)$/i.exec(request.headers.get('authorization')||'')?.[1];
      if(!token)throw new QuoteError('session-required',401);
      let user;try{user=await deps.auth.user(token);}catch{throw new QuoteError('session-required',401);}
      if(!user?.id)throw new QuoteError('session-required',401);
      if(!await deps.store.isAdmin(user.id))throw new QuoteError('admin-required',403);
      if(request.method==='GET'&&path.endsWith('/stats')) {
        const [from,to]=period(new URL(request.url)); return respond(await deps.store.stats(from,to));
      }
      if(request.method==='POST'&&path.endsWith('/retry-notifications')) {
        if(!deps.mailer)throw new QuoteError('mail-configuration',503);
        return respond({results:await deliver()});
      }
      return respond({error:'not-found'},404);
    } catch(error){return respond({error:error instanceof QuoteError?error.code:'unavailable',...(error instanceof QuoteError&&error.fields?{fields:error.fields}:{})},error instanceof QuoteError?error.status:503);}
  };
}
