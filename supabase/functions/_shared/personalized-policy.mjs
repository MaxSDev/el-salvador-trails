import { COUNTRY_CODES } from './country-codes.mjs';
import { fieldIssues } from './personalized-fields.mjs';
export { COUNTRY_CODES };
export const OPTIONS = Object.freeze({
  group_size: ['one','two','3_5','6_10','over_10'],
  age_range: ['under_18','18_30','31_45','46_60','over_60','mixed'],
  interests: ['adventure','archaeology_history','nature','beach_relaxation','gastronomy','surf','extreme_sports','culture','birdwatching','photography','other'],
  stay_length: ['one_day','2_3_days','4_5_days','6_7_days','over_week'],
  budget: ['under_100','100_300','300_600','over_600'],
  accommodation: ['economy','boutique','hotel_4_5','beach_resort','no_preference']
});
export class QuoteError extends Error { constructor(code,status=400,fields) { super(code); this.code=code; this.status=status; if(fields)this.fields=fields; } }
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const clean=(value,max,required=false)=> {
  if (typeof value!=='string') throw new QuoteError('validation');
  const text=value.trim();
  if (text.length>max || (required&&!text) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text)) throw new QuoteError('validation');
  return text;
};
const choice=(name,value)=> {if(!OPTIONS[name].includes(value)) throw new QuoteError('validation'); return value;};
function list(value,allowed,max) {
  if(!Array.isArray(value)||value.length<1||value.length>max||value.some(v=>!allowed.includes(v))) throw new QuoteError('validation');
  return [...new Set(value)].sort();
}
export function validatePersonalized(input) {
  if(!input||!UUID.test(input.submission_id)||input.schema_version!==1||!['es','en','pt'].includes(input.lang)) throw new QuoteError('validation');
  const issues=fieldIssues(input);if(issues.length)throw new QuoteError('validation',400,issues);
  const full_name=clean(input.full_name,100,true), email=clean(input.email,254,true), whatsapp=clean(input.whatsapp,30,true);
  if(full_name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/^[+\d][\d ()-]{5,29}$/.test(whatsapp)) throw new QuoteError('validation');
  if(typeof input.needs_support!=='boolean') throw new QuoteError('validation');
  const nationalities=list(input.nationalities,COUNTRY_CODES,8), interests=list(input.interests,OPTIONS.interests,11);
  const other_nationalities=clean(input.other_nationalities||'',120), other_interest=clean(input.other_interest||'',200);
  const accessibility_notes=input.needs_support?clean(input.accessibility_notes||'',600):'';
  if(nationalities.includes('OTHER')&&!other_nationalities || interests.includes('other')&&!other_interest) throw new QuoteError('validation');
  return {
    submission_id:input.submission_id,schema_version:1,lang:input.lang,
    contact:{full_name,email,whatsapp},
    profile:{group_size:choice('group_size',input.group_size),age_range:choice('age_range',input.age_range),nationalities,other_nationalities,needs_support:input.needs_support,accessibility_notes,interests,other_interest,stay_length:choice('stay_length',input.stay_length),budget:choice('budget',input.budget),accommodation:choice('accommodation',input.accommodation),wishes:clean(input.wishes||'',1000)},
    consent_version:'personalized-v1'
  };
}
export function aggregatePersonalized(rows,from,to) {
  const dimensions={nationality:{},age_range:{},interests:{},group_size:{},stay_length:{},budget:{},accommodation:{}};
  const months={}; let total=0;
  const add=(obj,key)=>{obj[key]=(obj[key]||0)+1;};
  for(const row of rows) {
    if(row.created_at<from||row.created_at>=to) continue;
    total++;
    const date=new Intl.DateTimeFormat('en-CA',{timeZone:'America/El_Salvador',year:'numeric',month:'2-digit'}).formatToParts(new Date(row.created_at));
    add(months,`${date.find(x=>x.type==='year').value}-${date.find(x=>x.type==='month').value}`);
    for(const name of ['age_range','group_size','stay_length','budget','accommodation']) add(dimensions[name],row.profile[name]);
    for(const code of new Set(row.profile.nationalities)) add(dimensions.nationality,code);
    for(const code of new Set(row.profile.interests)) add(dimensions.interests,code);
  }
  const entries=obj=>Object.entries(obj).sort(([a],[b])=>a.localeCompare(b)).map(([key,count])=>({key,count}));
  return {version:1,unit:'requests',timeZone:'America/El_Salvador',from,to,total,byMonth:entries(months),dimensions:Object.fromEntries(Object.entries(dimensions).map(([key,value])=>[key,entries(value)]))};
}
