// Server-only transport. No message is sent until recipient and verified sender are configured.
export function resendPersonalizedMailer({key,from,to,fetcher=fetch}) {
  if(!key||!from||!to) return null;
  if(/[\r\n]/.test(from+to)||!/^\S+@\S+\.\S+$/.test(to))throw new Error('Invalid mail configuration');
  return {send:async job=>{
    const r=job.request,p=r.profile,c=r.contact;
    const labels={group_size:'Grupo',nationalities:'Nacionalidades',other_nationalities:'Otras nacionalidades',age_range:'Edad del grupo',needs_support:'Necesidades de accesibilidad',accessibility_notes:'Apoyos solicitados',interests:'Intereses',other_interest:'Otro interés',stay_length:'Estancia',budget:'Presupuesto por persona (USD)',accommodation:'Alojamiento',wishes:'Lugares o experiencias solicitados'};
    const options={one:'1 persona',two:'2 personas','3_5':'3–5 personas','6_10':'6–10 personas',over_10:'Más de 10 personas',under_18:'Menores de 18', '18_30':'18–30 años','31_45':'31–45 años','46_60':'46–60 años',over_60:'Mayores de 60',mixed:'Edades mixtas',adventure:'Aventura',archaeology_history:'Arqueología e historia',nature:'Naturaleza',beach_relaxation:'Playa y relajación',gastronomy:'Gastronomía',surf:'Surf',extreme_sports:'Deportes extremos',culture:'Cultura y tradiciones',birdwatching:'Observación de aves',photography:'Fotografía',other:'Otra',one_day:'1 día','2_3_days':'2–3 días','4_5_days':'4–5 días','6_7_days':'6–7 días',over_week:'Más de una semana',under_100:'Menos de US$100','100_300':'US$100–300','300_600':'US$300–600',over_600:'Más de US$600',economy:'Económico',boutique:'Boutique',hotel_4_5:'Hotel de 4–5 estrellas',beach_resort:'Resort de playa',no_preference:'Sin preferencia'};
    const display=value=>typeof value==='boolean'?(value?'Sí':'No'):(options[value]||value||'No indicado');
    const text=[`Solicitud personalizada ${job.id}`,`Fecha: ${r.created_at}`,`Idioma: ${r.lang}`,`Nombre: ${c.full_name}`,`Correo: ${c.email}`,`WhatsApp: ${c.whatsapp}`,
      ...Object.entries(p).map(([name,value])=>`${labels[name]}: ${Array.isArray(value)?value.map(display).join(', '):display(value)}`)].join('\n');
    const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`personalized/${job.id}`},body:JSON.stringify({from,to:[to],reply_to:c.email,subject:`El Salvador Trails · Solicitud ${job.id.slice(0,8)}`,text}),signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error('Mail transport unavailable');
    const receipt=await response.json();if(!receipt.id)throw new Error('Invalid mail receipt');return receipt.id;
  }};
}
