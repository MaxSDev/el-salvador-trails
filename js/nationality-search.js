(function(root){
  'use strict';
  var aliases={SV:'salvadoreño salvadoreña salvadorenho salvadorenha salvadoran',BR:'brasileño brasileña brasileiro brasileira brazilian',ES:'español española espanhol espanhola spanish',US:'estadounidense american norteamericano norteamericana',GB:'británico británica britanico britanica british inglés inglesa english',CA:'canadiense canadense canadian',FR:'francés francesa francês french',DE:'alemán alemana alemão alemã german',PT:'portugués portuguesa português portuguese',MX:'mexicano mexicana mexican',GT:'guatemalteco guatemalteca guatemalan',HN:'hondureño hondureña hondurenho hondurenha honduran',NI:'nicaragüense nicaraguense nicaraguan',CR:'costarricense costa-riquenho costa-riquenha costa-rican',PA:'panameño panameña panamenho panamenha panamanian',BZ:'beliceño beliceña belizenho belizenha belizean',AR:'argentino argentina argentine argentinian',CL:'chileno chilena chilean',CO:'colombiano colombiana colombian',PE:'peruano peruana peruvian',EC:'ecuatoriano ecuatoriana equatoriano equatoriana ecuadorian',BO:'boliviano boliviana bolivian',UY:'uruguayo uruguaya uruguaio uruguaia uruguayan',PY:'paraguayo paraguaya paraguaio paraguaia paraguayan',VE:'venezolano venezolana venezuelano venezuelana venezuelan',CU:'cubano cubana cuban',DO:'dominicano dominicana dominican',HT:'haitiano haitiana haitian',JM:'jamaicano jamaicana jamaican',TT:'trinitense trinidadian',IT:'italiano italiana italian',CH:'suizo suiza suíço suíça swiss',AT:'austríaco austríaca austríaco austrian',BE:'belga belgian',NL:'holandés holandesa neerlandés neerlandesa dutch',IE:'irlandés irlandesa irish',DK:'danés danesa dinamarquês dinamarquesa danish',SE:'sueco sueca swedish',NO:'noruego noruega norueguês norueguesa norwegian',FI:'finlandés finlandesa finnish',IS:'islandés islandesa icelandic',GR:'griego griega grego grega greek',PL:'polaco polaca polonês polonesa polish',CZ:'checo checa czech',HU:'húngaro húngara hungarian',RO:'rumano rumana romeno romena romanian',BG:'búlgaro búlgara bulgarian',HR:'croata croatian',RS:'serbio serbia sérvio sérvia serbian',SK:'eslovaco eslovaca slovak',SI:'esloveno eslovena slovenian',UA:'ucraniano ucraniana ukrainian',RU:'ruso rusa russo russa russian',TR:'turco turca turkish',CN:'chino china chinês chinesa chinese',JP:'japonés japonesa japonês japanese',KR:'surcoreano surcoreana sul-coreano sul-coreana korean',KP:'norcoreano norcoreana north-korean',IN:'indio india indiano indiana indian',PK:'pakistaní paquistanês paquistanesa pakistani',BD:'bangladesí bangladeshi',NP:'nepalí nepalês nepalesa nepali',TH:'tailandés tailandesa thai',VN:'vietnamita vietnamese',ID:'indonesio indonesia indonésio indonésia indonesian',PH:'filipino filipina philippine',MY:'malasio malasia malaio malaia malaysian',SG:'singapurense singaporense singaporean',AU:'australiano australiana australian',NZ:'neozelandés neozelandesa neozelandês new-zealander',ZA:'sudafricano sudafricana sul-africano sul-africana south-african',EG:'egipcio egipcia egípcio egípcia egyptian',MA:'marroquí marroquino marroquina moroccan',DZ:'argelino argelina algerian',TN:'tunecino tunecina tunisiano tunisiana tunisian',NG:'nigeriano nigeriana nigerian',KE:'keniano keniana kenyan',GH:'ghanés ghanesa ganês ganesa ghanaian',ET:'etíope ethiopian',AO:'angoleño angoleña angolano angolana angolan',MZ:'mozambiqueño mozambiqueña moçambicano moçambicana mozambican',IL:'israelí israelense israeli',PS:'palestino palestina palestinian',LB:'libanés libanesa libanês lebanese',SY:'sirio siria sírio síria syrian',JO:'jordano jordana jordanian',SA:'saudí saudí saudita saudi',AE:'emiratí emiradense emirati',IR:'iraní iraniano iraniana iranian',IQ:'iraquí iraquiano iraquiana iraqi',AF:'afgano afgana afegão afegã afghan',XK:'kosovar'};
  var cache=new Map();
  function normalize(text){return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  function distance(a,b){
    var table=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
    for(var i=0;i<=a.length;i++)table[i][0]=i;for(var j=0;j<=b.length;j++)table[0][j]=j;
    for(i=1;i<=a.length;i++)for(j=1;j<=b.length;j++){
      table[i][j]=Math.min(table[i-1][j]+1,table[i][j-1]+1,table[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
      if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])table[i][j]=Math.min(table[i][j],table[i-2][j-2]+1);
    }
    return table[a.length][b.length];
  }
  function catalog(codes,lang,other){
    var key=lang+other;if(cache.has(key))return cache.get(key);
    var names=['es','en','pt'].map(locale=>new Intl.DisplayNames([locale],{type:'region'}));
    var local=new Intl.DisplayNames([lang],{type:'region'});
    var list=codes.map(code=>({code,label:code==='OTHER'?other:local.of(code),terms:code==='OTHER'?[normalize(other),normalize('Otra otra nacionalidad other outro')]:[code,...names.map(name=>name.of(code)),...(aliases[code]||'').split(' ')].map(normalize)}));
    list.sort((a,b)=>a.code==='OTHER'?1:b.code==='OTHER'?-1:a.label.localeCompare(b.label,lang));cache.set(key,list);return list;
  }
  function search(codes,query,lang,other){
    var q=normalize(query),list=catalog(codes,lang,other);if(!q)return list;
    return list.map(item=>{
      var score=Infinity;
      item.terms.forEach(term=>{
        if(term===q)score=0;
        else if(term.startsWith(q)||term.split(' ').some(word=>word.startsWith(q)))score=Math.min(score,1);
        else if(q.length>2&&term.includes(q))score=Math.min(score,2);
        else if(q.length>=4&&Math.abs(q.length-term.length)<=2){var d=distance(q,term);if(d<=Math.min(2,Math.floor(q.length/4)))score=Math.min(score,3+d);}
      });return {...item,score};
    }).filter(item=>Number.isFinite(item.score)).sort((a,b)=>a.score-b.score||a.label.localeCompare(b.label,lang));
  }
  var api={normalize:normalize,search:search,catalog:catalog};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ESTNationalitySearch=api;
})(typeof window!=='undefined'?window:this);
