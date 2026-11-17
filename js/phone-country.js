// WhatsApp country-code picker: a button that opens a searchable listbox, like Google's phone field.
(function(){
'use strict';
var DIAL=window.ESTDialCodes,MAIN=window.ESTDialMain;
// Numbers in these regions keep their leading 0 in international format (+39 06…).
var KEEP_ZERO=['IT','SM','VA','CI','CG'];
var LANG_REGION={es:'SV',en:'US',pt:'BR'};
function guessRegion(lang){
  // Only the preferred tag counts: a secondary "es-ES" says little about where a visitor's phone is.
  var first=(navigator.languages&&navigator.languages[0])||navigator.language||'';
  var region=(first.split('-')[1]||'').toUpperCase();
  return DIAL[region]?region:LANG_REGION[lang]||'SV';
}
function digits(value){return String(value||'').replace(/\D/g,'');}
// Longest calling code that prefixes the typed international digits.
function regionFromDigits(value,current){
  var d=digits(value);
  for(var len=3;len>=1;len--){var code=d.slice(0,len);if(MAIN[code]){return DIAL[current]===code?current:MAIN[code];}}
  return '';
}
function create(opts){
  var t=opts.t,lang=opts.lang,root=opts.root;
  var button=root.querySelector('.phone-country'),iso=button.querySelector('[data-phone-iso]'),dialLabel=button.querySelector('[data-phone-dial]');
  var panel=root.querySelector('.phone-panel'),search=panel.querySelector('.phone-search'),list=panel.querySelector('[role=listbox]'),live=root.querySelector('.phone-live');
  var hidden=root.querySelector('[name=whatsapp_country]'),number=root.querySelector('[name=whatsapp_number]');
  var items=[],active=-1,manual=false;
  function catalog(){return window.ESTNationalitySearch.catalog(window.ESTNationalityCodes,lang(),t('countryOther')).filter(item=>DIAL[item.code]);}
  function name(code){var item=catalog().find(i=>i.code===code);return item?item.label:code;}
  function paint(){
    var code=hidden.value;iso.textContent=code||'—';dialLabel.textContent=code?'+'+DIAL[code]:'+';
    button.setAttribute('aria-label',code?t('phoneCountryCurrent').replace('{country}',name(code)).replace('{dial}','+'+DIAL[code]):t('phoneCountryChoose'));
    search.placeholder=t('phoneCountrySearch');search.setAttribute('aria-label',t('phoneCountrySearch'));list.setAttribute('aria-label',t('phoneCountryList'));
  }
  function set(code,byUser){
    if(!DIAL[code])return;var previous=hidden.value;hidden.value=code;if(byUser)manual=true;
    // Drop a typed +prefix that belonged to the previous code so the two never disagree.
    if(previous!==code&&number.value.trim().startsWith('+')&&DIAL[previous]&&digits(number.value).startsWith(DIAL[previous]))number.value=number.value.trim().replace(new RegExp('^\\+\\s*'+DIAL[previous].split('').join('\\s*')+'[\\s-]*'),'');
    paint();opts.onChange();
  }
  function setActive(index){
    active=index;list.querySelectorAll('[role=option]').forEach((option,i)=>option.classList.toggle('is-active',i===index));
    if(index>=0){search.setAttribute('aria-activedescendant',list.id+'-'+index);list.children[index].scrollIntoView({block:'nearest'});}else search.removeAttribute('aria-activedescendant');
  }
  function render(){
    var q=search.value.trim(),d=digits(q);
    items=/^\+?[\d\s]+$/.test(q)&&d?catalog().filter(item=>DIAL[item.code].startsWith(d)||d.startsWith(DIAL[item.code])):q?window.ESTNationalitySearch.search(window.ESTNationalityCodes,q,lang(),t('countryOther')).filter(item=>DIAL[item.code]):catalog();
    list.replaceChildren();
    items.forEach((item,index)=>{
      var option=document.createElement('li');option.id=list.id+'-'+index;option.setAttribute('role','option');option.setAttribute('aria-selected',String(item.code===hidden.value));
      var label=document.createElement('span');label.textContent=item.label;var code=document.createElement('span');code.className='phone-option-dial';code.textContent='+'+DIAL[item.code];
      option.append(label,code);option.addEventListener('pointerdown',e=>e.preventDefault());option.addEventListener('click',()=>{set(item.code,true);close(true);});list.append(option);
    });
    if(!items.length){var empty=document.createElement('li');empty.className='nationality-empty';empty.textContent=t('phoneNoResults');list.append(empty);}
    live.textContent=items.length+' '+t('countryResults');
    var current=items.findIndex(item=>item.code===hidden.value);setActive(q?(items.length?0:-1):current);
  }
  function open(){panel.hidden=false;button.setAttribute('aria-expanded','true');search.value='';render();search.focus({preventScroll:true});}
  function close(focusNumber){if(panel.hidden)return;panel.hidden=true;button.setAttribute('aria-expanded','false');setActive(-1);(focusNumber?number:button).focus({preventScroll:true});}
  button.addEventListener('click',()=>panel.hidden?open():close(false));
  button.addEventListener('keydown',e=>{if((e.key==='ArrowDown'||e.key==='ArrowUp')&&panel.hidden){e.preventDefault();open();}});
  search.addEventListener('input',render);
  search.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();close(false);}
    else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(items.length)setActive(e.key==='ArrowDown'?Math.min(items.length-1,active+1):Math.max(0,active-1));}
    else if(e.key==='Enter'){e.preventDefault();if(items[active]){set(items[active].code,true);close(true);}}
    else if(e.key==='Tab')close(false);
  });
  root.addEventListener('focusout',e=>{if(!panel.hidden&&!root.contains(e.relatedTarget))close(false);});
  document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!root.contains(e.target))close(false);});
  number.addEventListener('input',()=>{if(!number.value.trim().startsWith('+'))return;var region=regionFromDigits(number.value,hidden.value);if(region&&region!==hidden.value){hidden.value=region;manual=true;paint();}});
  return {
    // Full international number for the contract: "+503 7000 1234".
    value(){var raw=number.value.trim();if(!raw)return '';if(raw.startsWith('+'))return raw;var code=hidden.value;if(!code)return raw;var local=KEEP_ZERO.includes(code)?raw:raw.replace(/^0+/,'');return '+'+DIAL[code]+' '+local;},
    // Follow the first nationality until the visitor picks a code or types a number.
    suggest(code){if(!manual&&!number.value.trim()&&DIAL[code]&&code!==hidden.value){hidden.value=code;paint();}},
    // Drafts record whether the code was picked; older drafts without the flag count as picked.
    restore(picked){if(DIAL[hidden.value])manual=picked!==false;else{manual=false;hidden.value=guessRegion(lang());}paint();},
    isManual(){return manual;},
    reset(){manual=false;hidden.value=guessRegion(lang());paint();},
    // A language switch re-guesses the default only while the visitor has not chosen or typed.
    relocale(){if(!manual&&!number.value.trim())hidden.value=guessRegion(lang());paint();},
    refresh:paint,close
  };
}
window.ESTPhoneCountry={create:create,guessRegion:guessRegion,regionFromDigits:regionFromDigits};
})();
