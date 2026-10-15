// Generated from personalized-fields.mjs; tested for parity.
(function(){
var COUNTRY_CODES=window.ESTNationalityCodes;
function emailFormat(value){
  const parts=value.split('@');if(parts.length!==2)return false;
  const [local,domain]=parts;
  if(!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)||local.length>64||local.startsWith('.')||local.endsWith('.')||local.includes('..')||/[\s:/?#\[\]\\%]/.test(domain))return false;
  let host;try{host=new URL('https://'+domain).hostname;}catch{return false;}
  const labels=host.split('.');
  return labels.length>=2&&labels.every(label=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))&&!/^\d+$/.test(labels.at(-1));
}
function fieldIssues(input) {
  const p=input||{}, issues=[];
  const add=(field,code,index)=>issues.push({field,code,...(index===undefined?{}:{index})});
  const text=(field,max,required=true)=>{
    const value=p[field]??'';
    if(typeof value!=='string'||required&&!value.trim()){add(field,'required');return '';}
    if(value.length>max)add(field,'tooLong');
    if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))add(field,'format');
    return value.trim();
  };
  const name=text('full_name',100);if(name&&name.length<2)add('full_name','nameShort');
  const email=text('email',254);if(email&&!emailFormat(email))add('email','emailFormat');
  const phone=text('whatsapp',30);
  if(phone&&(!/^\+[1-9][\d ()-]+$/.test(phone)||phone.replace(/\D/g,'').length<7||phone.replace(/\D/g,'').length>15))add('whatsapp','phoneFormat');
  const choices={group_size:['one','two','3_5','6_10','over_10'],age_range:['under_18','18_30','31_45','46_60','over_60','mixed'],stay_length:['one_day','2_3_days','4_5_days','6_7_days','over_week'],budget:['under_100','100_300','300_600','over_600'],accommodation:['economy','boutique','hotel_4_5','beach_resort','no_preference']};
  for(const [field,allowed] of Object.entries(choices))if(!allowed.includes(p[field]))add(field,'selectOne');
  if(!Array.isArray(p.nationalities)||!p.nationalities.length)add('nationalities','countrySelect',0);
  else {
    if(p.nationalities.length>8)add('nationalities','countryLimit',8);
    p.nationalities.slice(0,8).forEach((code,index)=>{
      if(!COUNTRY_CODES.includes(code))add('nationalities','countrySelect',index);
      else if(p.nationalities.indexOf(code)!==index)add('nationalities','countryDuplicate',index);
    });
  }
  text('other_nationalities',120,Array.isArray(p.nationalities)&&p.nationalities.includes('OTHER'));
  const interests=['adventure','archaeology_history','nature','beach_relaxation','gastronomy','surf','extreme_sports','culture','birdwatching','photography','other'];
  if(!Array.isArray(p.interests)||!p.interests.length||p.interests.some(value=>!interests.includes(value))||p.interests.length>11)add('interests','selectMany');
  text('other_interest',200,Array.isArray(p.interests)&&p.interests.includes('other'));
  if(p.needs_support===true)text('accessibility_notes',600,false);
  text('wishes',1000,false);
  if(p.adult!==true)add('adult','adultRequired');
  if(p.consent!==true)add('consent','consentRequired');
  return issues;
}

window.ESTPersonalizedFields={fieldIssues:fieldIssues};
})();
