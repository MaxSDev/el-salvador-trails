import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {join} from 'node:path';
import {QuoteError,aggregatePersonalized} from '../supabase/functions/_shared/personalized-policy.mjs';
import {LOCAL_ADMIN_ID} from './reviews-local-store.mjs';
export async function localPersonalizedStore(directory) {
  await mkdir(directory,{recursive:true}); const file=join(directory,'personalized.json');
  let state;try{state=JSON.parse(await readFile(file,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;state={requests:[],outbox:[],rate:[]};}
  let queue=Promise.resolve();
  const transaction=fn=>{const run=queue.then(async()=>{const next=structuredClone(state);const result=await fn(next);await writeFile(file+'.tmp',JSON.stringify(next));await rename(file+'.tmp',file);state=next;return result;});queue=run.catch(()=>{});return run;};
  return {
    save:(value,digest,ip)=>transaction(s=>{
      const existing=s.requests.find(r=>r.id===value.submission_id);
      if(existing){if(existing.payload_hash!==digest)throw new QuoteError('conflict',409);return {id:existing.id};}
      const now=Date.now();s.rate=s.rate.filter(x=>now-x.time<600000);
      if(s.rate.filter(x=>x.ip===ip).length>=3)throw new QuoteError('rate-limit',429);
      const row={...value,id:value.submission_id,status:'new',payload_hash:digest,created_at:new Date(now).toISOString(),consented_at:new Date(now).toISOString()};
      s.requests.push(row);s.rate.push({ip,time:now});s.outbox.push({id:row.id,status:'pending',attempts:0});return {id:row.id};
    }),
    isAdmin:async id=>id===LOCAL_ADMIN_ID,
    stats:async (from,to)=>{await queue;return aggregatePersonalized(state.requests,from,to);},
    claimMail:limit=>transaction(s=>{const jobs=s.outbox.filter(x=>x.status==='pending'||x.status==='error').slice(0,limit);for(const job of jobs){job.status='sending';job.attempts++;}return jobs.map(job=>({...job,request:s.requests.find(r=>r.id===job.id)}));}),
    finishMail:(id,receipt)=>transaction(s=>{Object.assign(s.outbox.find(x=>x.id===id),{status:'sent',receipt});}),
    failMail:id=>transaction(s=>{s.outbox.find(x=>x.id===id).status='error';})
  };
}
