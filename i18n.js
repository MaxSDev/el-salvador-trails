/* ==========================================================================
   El Salvador Trails — Sistema i18n (ES / EN / PT)

   - Diccionarios centralizados por clave, preparados para edición vía dashboard.
   - Selector de idioma persistido en localStorage ('est-lang').
   - Re-render automático de todos los elementos [data-i18n].
   - Texto de interfaz NUNCA hardcodeado en el HTML: siempre data-i18n="clave".
   ========================================================================== */
(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────────
     DICcionarios — cada clave cubre un fragmento de UI en las 3
     páginas principales (index, tours, real-estate).
     Agregar texto aquí es la ÚNICA forma de editar el sitio.
     ────────────────────────────────────────────────────────────── */
  var DICTIONARIES = {
    es: {
      // ---- Meta ----
      "html.lang":            "es",
      "page.index.title":     "El Salvador Trails",
      "page.tours.title":     "El Salvador Trails — Catálogo de Tours",
      "page.realestate.title":"El Salvador Trails — Bienes Raíces",
      "page.about.title":     "El Salvador Trails — About Us",

      // ---- Navegación ----
      "nav.home":             "Página Inicial",
      "nav.tours":            "Catálogo de Tours",
      "nav.about":            "About Us",
      "nav.realestate":       "Bienes Raíces",
      "nav.payment":          "Pago en Línea",
      "nav.feedback":         "Feedback",
      "nav.help":             "Cómo usar este sitio",

      // ---- Hero / Carrusel (index.html) ----
      "hero.title":           "Top destinos más buscados del país",
      "hero.subtitle":        "Elige los mejores destinos nacionales para viajar junto a tu familia y amigos.",
      "hero.brandTitle":      "Descubre El Salvador",
      "hero.cta":             "Explora el Catálogo de Tours",
      // Tabs del carrusel
      "tab.elTunco":          "El Tunco",
      "tab.rutaFlores":       "Ruta de las Flores",
      "tab.lagoCoatepeque":   "Lago de Coatepeque",
      "tab.volcanSantaAna":   "Volcán de Santa Ana",

      // ---- Slides del carrusel ----
      "slide0.title":         "Playa El Sunzal",
      "slide0.desc":          "Ubicada en La Libertad, es un referente mundial para el surf. Destaca por su icónica formación rocosa en la orilla, sus imponentes olas, una vibrante vida nocturna y atardeceres espectaculares sobre el océano Pacífico.",
      "slide1.title":         "Ruta de las Flores",
      "slide1.desc":          "Un encantador recorrido montañoso que conecta pintorescos pueblos llenos de color, murales artísticos, un clima fresco espectacular, cafetales tradicionales y la calidez inigualable de la gente local.",
      "slide2.title":         "Puerta del Diablo",
      "slide2.desc":          "Un majestuoso lago de origen volcánico ubicado en Santa Ana, catalogado como uno de los más hermosos del mundo. Sus aguas cristalinas cambian periódicamente a un asombroso color azul turquesa.",
      "slide3.title":         "Centro Histórico",
      "slide3.desc":          "Un lugar ideal para recorrer la historia, la arquitectura y la vida cultural de San Salvador. Sus plazas, edificios emblemáticos y espacios renovados ofrecen una visita agradable para quienes desean conocer un poco más del corazón de la ciudad.",

      // ---- Catálogo de Tours (tours.html) ----
      "catalog.title":        "Catálogo de Tours",
      // Day Tours
      "dayTours.heading":     "Day Tours",
      "dayTours.item1":       "Excursiones guiadas de un día completo.",
      "dayTours.item2":       "Visitas a volcanes, lagos y centros históricos.",
      "dayTours.item3":       "Transporte cómodo de ida y vuelta incluido.",
      "dayTours.item4":       "Almuerzos tradicionales con comida local.",
      "dayTours.cta":         "Ver más",
      // Tour Packages
      "tourPackages.heading": "Tour Packages",
      "tourPackages.item1":   "Itinerarios completos de varios días.",
      "tourPackages.item2":   "Hospedaje seleccionado en hoteles.",
      "tourPackages.item3":   "Exploración exhaustiva de los mejores destinos.",
      "tourPackages.item4":   "Guías dedicados durante todo el viaje.",
      "tourPackages.cta":     "Ver más",
      // Personalized Experience
      "personalized.heading": "Personalized Experience",
      "personalized.item1":   "Rutas diseñadas a tu propio gusto y ritmo.",
      "personalized.item2":   "Guías privados especializados.",
      "personalized.item3":   "Actividades exclusivas y paradas culinarias.",
      "personalized.item4":   "Perfecto para parejas, familias o grupos selectos.",
      "personalized.cta":     "Ver más",

      // ---- Bienes Raíces (placeholder) ----
      "realestate.title":     "Bienes Raíces",
      "realestate.subtitle":  "Próximamente",
      "realestate.message":   "Esta sección está actualmente en construcción. Pronto podrá explorar las mejores propiedades disponibles en El Salvador.",

      // ---- Social Connect ----
      "social.connect":       "Conecta con nosotros",

      // ---- Footer ----
      "footer.brand":         "El Salvador Trails",
      "footer.privacy":       "Pólitica de Privacidad",
      "footer.terms":         "Términos de Servicio",
      "footer.contact":       "Contacto",
      "footer.copyright":     "© 2026 El Salvador Trails.",

      // ---- Tema ----
      "theme.toggle.dark":    "Cambiar a modo oscuro",
      "theme.toggle.light":   "Cambiar a modo claro",
      "theme.icon.dark":      "dark_mode",
      "theme.icon.light":     "light_mode",

      // ---- Detalle de Tours ----
      "tour.viewDetails":     "Ver detalles",
      "tour.itinerary":       "Itinerario",
      "tour.included":        "Incluido",
      "tour.highlights":      "Destacados",
      "catalog.back":         "Volver",
      "personalized.comingSoon": "Próximamente",

      // ---- Modal de tours (accesibilidad) ----
      "tour.modal.close":     "Cerrar modal",
      "tour.modal.prev":      "Imagen anterior",
      "tour.modal.next":      "Siguiente imagen",
      "tour.modal.imgN":      "Imagen",
      // ---- Carrusel (accesibilidad) ----
      "carousel.nav":         "Navegación de destinos",
      "carousel.mainImg":     "Destinos El Salvador",
      "carousel.thumb":       "Miniatura",

      // ---- About Us ----
      "about.hero.badge":     "Nuestra Trayectoria",
      "about.hero.title":     "Detrás de Cada Sendero, una Historia de Pasión y Confianza",
      "about.hero.subtitle":  "Compartiendo la auténtica riqueza cultural y natural de El Salvador con viajeros de todo el mundo.",
      "about.founder.name":   "Mario Domínguez",
      "about.founder.role":   "Fundador y Guía de Turismo de El Salvador Trails",
      "about.founder.p1":     "Nací en San Salvador, El Salvador, un país que desde temprana edad despertó en mí una profunda admiración por su historia, cultura y riqueza natural. Mi trayectoria profesional en el turismo ha estado marcada por una pasión constante por compartir experiencias auténticas con viajeros de todo el mundo.",
      "about.founder.p2":     "Viví en Brasil durante los períodos 1983-1995 y 2016-2024, donde amplié mis conocimientos sobre la industria turística y obtuve las credenciales oficiales como guía de turismo en el Estado de Sergipe. Esta experiencia internacional me permitió desarrollar una visión más amplia del turismo y fortalecer mis habilidades para la atención de visitantes de diferentes culturas y nacionalidades.",
      "about.founder.p3":     "Desde 1999 me he desempeñado profesionalmente en el sector turístico tanto en El Salvador como en Brasil. Entre 2001 y 2016 fundé y dirigí una operadora turística en El Salvador, logrando posicionarla entre las mejores del país y alcanzando el reconocimiento de los viajeros en Tripadvisor, donde fue calificada como la número uno en su categoría. Estos años de trabajo me permitieron acumular una valiosa experiencia en la creación de recorridos, atención al cliente y desarrollo de productos turísticos de alta calidad.",
      "about.founder.p4":     "En 2024 regresé a mi país natal para iniciar una nueva etapa con la fundación de El Salvador Trails (Senderos de El Salvador), un proyecto que nace con la misma pasión y entusiasmo que inspiraron mi primera empresa turística el 1 de julio de 2001. Hoy, con una visión renovada, busco crear nuevas rutas, experiencias y aventuras que permitan a cada visitante descubrir la extraordinaria historia, cultura, gastronomía y naturaleza de El Salvador y Centroamérica.",
      "about.founder.welcome":"Bienvenidos a El Salvador Trails, donde cada sendero cuenta una historia y cada experiencia se convierte en una aventura inolvidable.",
      "about.values.heading": "Nuestros Pilares",
      "about.values.vision.title": "Nuestra Visión",
      "about.values.vision.desc": "Ser la operadora turística más comprometida con la creación de experiencias auténticas en El Salvador y Centroamérica, transformando cada viaje en un recuerdo único, significativo e inolvidable.",
      "about.values.mission.title": "Nuestra Misión",
      "about.values.mission.desc": "Brindar servicios turísticos con los más altos estándares de calidad, profesionalismo y calidez humana, superando las expectativas de nuestros visitantes.",
      "about.values.commitment.title": "Nuestro Compromiso",
      "about.values.commitment.desc": "Ofrecer un servicio basado en la puntualidad, la seguridad, el respeto y la atención personalizada, garantizando experiencias memorables para cada viajero que confía en nosotros.",
      "about.trust.exp":      "Más de 20 años de experiencia en turismo",
      "about.trust.cert":     "Guía certificado con credenciales oficiales",
      "about.trust.tripadvisor": "Trayectoria reconocida (#1 en TripAdvisor)",
      "about.trust.safety":   "Acompañamiento seguro y personalizado",
      "about.cta.tours":      "Explorar Catálogo de Tours",

      // ---- Carrusel de Testimonios & Feedback (Home) ----
      "testimonials.title":   "Lo que dicen nuestros viajeros",
      "testimonials.subtitle":"Experiencias reales de quienes han recorrido los senderos de El Salvador con nosotros.",
      "testimonials.cta":     "¿Viajaste con nosotros? Comparte tu experiencia",
      "testimonials.photos":  "Fotos del viaje",
      "testimonials.verified":"Viaje verificado",
      "testimonials.prev":    "Testimonio anterior",
      "testimonials.next":    "Siguiente testimonio",
      "feedback.modal.title": "Comparte tu experiencia",
      "feedback.modal.subtitle": "Tu reseña nos ayuda a seguir brindando viajes seguros y memorables.",
      "feedback.form.name":   "Tu nombre",
      "feedback.form.country":"País de origen (opcional)",
      "feedback.form.rating": "Calificación",
      "feedback.form.comment":"Tu reseña o testimonio",
      "feedback.form.photos": "Adjuntar fotos (opcional, máx. 4 imágenes)",
      "feedback.form.submit": "Enviar para revisión",
      "feedback.form.close":  "Cerrar",
      "feedback.form.success":"¡Muchas gracias! Tu reseña ha sido enviada y será publicada tras la revisión de nuestro equipo.",

      // ---- Política de Precios y Cotizaciones ----
      "tour.pricing.heading":     "Precios y condiciones: contáctenos",
      "tour.pricing.notice":      "Nuestras tarifas se adaptan al tamaño y necesidades específicas de su grupo (los niños menores de 12 años gozan de tarifa especial al 50%). Permítanos diseñar su cotización personalizada.",
      "tour.pricing.groupTitle":  "Indique la composición de su grupo para cotizar:",
      "tour.pricing.adults":      "Adultos",
      "tour.pricing.children":    "Niños (<12 años - 50%)",
      "tour.pricing.date":        "Fecha estimada",
      "tour.pricing.whatsappBtn": "Cotizar por WhatsApp",
      "tour.pricing.emailBtn":    "Cotizar por Correo",
      "tour.video.button":        "Ver video del tour",
      "tour.video.tiktok":        "TikTok",
      "tour.video.instagram":     "Instagram"
    },

    en: {
      "html.lang":            "en",
      "page.index.title":     "El Salvador Trails",
      "page.tours.title":     "El Salvador Trails — Tour Catalog",
      "page.realestate.title":"El Salvador Trails — Real Estate",
      "page.about.title":     "El Salvador Trails — About Us",

      "nav.home":             "Home",
      "nav.tours":            "Tour Catalog",
      "nav.about":            "About Us",
      "nav.realestate":       "Real Estate",
      "nav.payment":          "Online Payment",
      "nav.feedback":         "Feedback",
      "nav.help":             "How to use this site",

      "hero.title":           "Top most searched destinations in the country",
      "hero.subtitle":        "Choose the best national destinations to travel with your family and friends.",
      "hero.brandTitle":      "Discover El Salvador",
      "hero.cta":             "Explore the Tour Catalog",
      "tab.elTunco":          "El Tunco",
      "tab.rutaFlores":       "Flower Route",
      "tab.lagoCoatepeque":   "Coatepeque Lake",
      "tab.volcanSantaAna":   "Santa Ana Volcano",

      "slide0.title":         "El Sunzal Beach",
      "slide0.desc":          "Located in La Libertad, it is a world reference for surfing. It stands out for its iconic rocky formation on the shore, its imposing waves, a vibrant nightlife and spectacular sunsets over the Pacific Ocean.",
      "slide1.title":         "Flower Route",
      "slide1.desc":          "A charming mountain route that connects picturesque villages full of color, artistic murals, spectacular cool weather, traditional coffee farms and the incomparable warmth of the local people.",
      "slide2.title":         "Devil's Gate",
      "slide2.desc":          "A majestic volcanic lake located in Santa Ana, rated as one of the most beautiful in the world. Its crystal-clear waters periodically change to an amazing turquoise blue color.",
      "slide3.title":         "Historic Center",
      "slide3.desc":          "An ideal place to explore the history, architecture and cultural life of San Salvador. Its plazas, emblematic buildings and renovated spaces offer a pleasant visit for those who want to know more about the heart of the city.",

      "catalog.title":        "Tour Catalog",
      "dayTours.heading":     "Day Tours",
      "dayTours.item1":       "Full-day guided excursions.",
      "dayTours.item2":       "Visits to volcanoes, lakes and historic centers.",
      "dayTours.item3":       "Comfortable round-trip transportation included.",
      "dayTours.item4":       "Traditional lunches with local food.",
      "dayTours.cta":         "Learn more",

      "tourPackages.heading": "Tour Packages",
      "tourPackages.item1":   "Complete multi-day itineraries.",
      "tourPackages.item2":   "Selected hotel accommodations.",
      "tourPackages.item3":   "Thorough exploration of the best destinations.",
      "tourPackages.item4":   "Dedicated guides throughout the trip.",
      "tourPackages.cta":     "Learn more",

      "personalized.heading": "Personalized Experience",
      "personalized.item1":   "Routes designed to your own taste and pace.",
      "personalized.item2":   "Specialized private guides.",
      "personalized.item3":   "Exclusive activities and culinary stops.",
      "personalized.item4":   "Perfect for couples, families or select groups.",
      "personalized.cta":     "Learn more",

      "realestate.title":     "Real Estate",
      "realestate.subtitle":  "Coming Soon",
      "realestate.message":   "This section is currently under construction. Soon you will be able to explore the best properties available in El Salvador.",

      "social.connect":       "Connect with us",

      "footer.brand":         "El Salvador Trails",
      "footer.privacy":       "Privacy Policy",
      "footer.terms":         "Terms of Service",
      "footer.contact":       "Contact",
      "footer.copyright":     "© 2026 El Salvador Trails.",

      "theme.toggle.dark":    "Switch to dark mode",
      "theme.toggle.light":   "Switch to light mode",
      "theme.icon.dark":      "dark_mode",
      "theme.icon.light":     "light_mode",

      "tour.viewDetails":     "View details",
      "tour.itinerary":       "Itinerary",
      "tour.included":        "Included",
      "tour.highlights":      "Highlights",
      "catalog.back":         "Back",
      "personalized.comingSoon": "Coming Soon",

      // ---- Modal de tours (accesibilidad) ----
      "tour.modal.close":     "Close modal",
      "tour.modal.prev":      "Previous image",
      "tour.modal.next":      "Next image",
      "tour.modal.imgN":      "Image",
      // ---- Carrusel (accesibilidad) ----
      "carousel.nav":         "Destination navigation",
      "carousel.mainImg":     "El Salvador Destinations",
      "carousel.thumb":       "Thumbnail",

      // ---- About Us ----
      "about.hero.badge":     "Our Trajectory",
      "about.hero.title":     "Behind Every Trail, a Story of Passion and Trust",
      "about.hero.subtitle":  "Sharing the authentic cultural and natural wealth of El Salvador with travelers from all over the world.",
      "about.founder.name":   "Mario Domínguez",
      "about.founder.role":   "Founder & Tour Guide of El Salvador Trails",
      "about.founder.p1":     "I was born in San Salvador, El Salvador, a country that from an early age inspired in me a deep admiration for its history, culture, and natural beauty. My professional career in tourism has been marked by a constant passion for sharing authentic experiences with travelers worldwide.",
      "about.founder.p2":     "I lived in Brazil during the periods 1983-1995 and 2016-2024, where I expanded my knowledge of the tourism industry and obtained official credentials as a tour guide in the State of Sergipe. This international experience allowed me to develop a broader vision of tourism and strengthen my skills in serving visitors of diverse cultures and nationalities.",
      "about.founder.p3":     "Since 1999, I have worked professionally in the tourism sector in both El Salvador and Brazil. Between 2001 and 2016, I founded and managed a tour operator in El Salvador, positioning it among the best in the country and achieving the recognition of travelers on TripAdvisor, where it was ranked number one in its category. These years allowed me to accumulate valuable experience in designing tours, customer care, and high-quality tourism products.",
      "about.founder.p4":     "In 2024, I returned to my homeland to start a new chapter with the founding of El Salvador Trails, a project born with the same passion and enthusiasm that inspired my first tourism company on July 1, 2001. Today, with a renewed vision, I seek to create new routes, experiences, and adventures that allow every visitor to discover the extraordinary history, culture, gastronomy, and nature of El Salvador and Central America.",
      "about.founder.welcome":"Welcome to El Salvador Trails, where every trail tells a story and every experience becomes an unforgettable adventure.",
      "about.values.heading": "Our Pillars",
      "about.values.vision.title": "Our Vision",
      "about.values.vision.desc": "To be the tour operator most committed to creating authentic experiences in El Salvador and Central America, turning every trip into a unique, meaningful, and unforgettable memory.",
      "about.values.mission.title": "Our Mission",
      "about.values.mission.desc": "To provide tourism services with the highest standards of quality, professionalism, and human warmth, exceeding our visitors' expectations.",
      "about.values.commitment.title": "Our Commitment",
      "about.values.commitment.desc": "To offer a service based on punctuality, safety, respect, and personalized care, guaranteeing memorable experiences for every traveler who trusts us.",
      "about.trust.exp":      "Over 20 years of tourism experience",
      "about.trust.cert":     "Certified guide with official credentials",
      "about.trust.tripadvisor": "Proven track record (#1 on TripAdvisor)",
      "about.trust.safety":   "Safe, reliable, and personalized guidance",
      "about.cta.tours":      "Explore Tour Catalog",

      // ---- Carrusel de Testimonios & Feedback (Home) ----
      "testimonials.title":   "What Our Travelers Say",
      "testimonials.subtitle":"Real experiences from those who have walked the trails of El Salvador with us.",
      "testimonials.cta":     "Traveled with us? Share your experience",
      "testimonials.photos":  "Trip photos",
      "testimonials.verified":"Verified traveler",
      "testimonials.prev":    "Previous testimonial",
      "testimonials.next":    "Next testimonial",
      "feedback.modal.title": "Share Your Experience",
      "feedback.modal.subtitle": "Your review helps us continue providing safe and memorable journeys.",
      "feedback.form.name":   "Your name",
      "feedback.form.country":"Country of origin (optional)",
      "feedback.form.rating": "Rating",
      "feedback.form.comment":"Your review or story",
      "feedback.form.photos": "Attach photos (optional, up to 4 images)",
      "feedback.form.submit": "Submit for review",
      "feedback.form.close":  "Close",
      "feedback.form.success":"Thank you very much! Your review has been submitted and will appear once reviewed by our team.",

      // ---- Pricing Policy & Quotations ----
      "tour.pricing.heading":     "Prices and conditions: contact us",
      "tour.pricing.notice":      "Our rates adapt to the size and specific needs of your group (children under 12 enjoy a special 50% discount). Let us craft your custom quote.",
      "tour.pricing.groupTitle":  "Specify your group details to request a quote:",
      "tour.pricing.adults":      "Adults",
      "tour.pricing.children":    "Children (<12 yrs - 50%)",
      "tour.pricing.date":        "Estimated date",
      "tour.pricing.whatsappBtn": "Quote via WhatsApp",
      "tour.pricing.emailBtn":    "Quote via Email",
      "tour.video.button":        "Watch tour video",
      "tour.video.tiktok":        "TikTok",
      "tour.video.instagram":     "Instagram"
    },

    pt: {
      "html.lang":            "pt",
      "page.index.title":     "El Salvador Trails",
      "page.tours.title":     "El Salvador Trails — Catálogo de Tours",
      "page.realestate.title":"El Salvador Trails — Imóveis",
      "page.about.title":     "El Salvador Trails — About Us",

      "nav.home":             "Página Inicial",
      "nav.tours":            "Catálogo de Tours",
      "nav.about":            "About Us",
      "nav.realestate":       "Imóveis",
      "nav.payment":          "Pagamento Online",
      "nav.feedback":         "Feedback",
      "nav.help":             "Como usar este site",

      "hero.title":           "Principais destinos mais procurados do país",
      "hero.subtitle":        "Escolha os melhores destinos nacionais para viajar com sua família e amigos.",
      "hero.brandTitle":      "Descubra El Salvador",
      "hero.cta":             "Explore o Catálogo de Tours",
      "tab.elTunco":          "El Tunco",
      "tab.rutaFlores":       "Rota das Flores",
      "tab.lagoCoatepeque":   "Lago de Coatepeque",
      "tab.volcanSantaAna":   "Vulcão de Santa Ana",

      "slide0.title":         "Praia El Sunzal",
      "slide0.desc":          "Localizada em La Libertad, é uma referência mundial para o surf. Destaca-se por sua icônica formação rochosa na margem, suas imponentes ondas, uma vibrante vida noturna e pôr do sol espetaculares sobre o Oceano Pacífico.",
      "slide1.title":         "Rota das Flores",
      "slide1.desc":          "Um encantador percurso montanhoso que conecta pitorescos povoados repletos de cor, murais artísticos, um clima fresco espetacular, cafezais tradicionais e a incomparável calorosidade do povo local.",
      "slide2.title":         "Porta do Diabo",
      "slide2.desc":          "Um majestoso lago de origem vulcânica localizado em Santa Ana, classificado como um dos mais belos do mundo. Suas águas cristalinas mudam periodicamente para uma impressionante cor azul turquesa.",
      "slide3.title":         "Centro Histórico",
      "slide3.desc":          "Um lugar ideal para percorrer a história, a arquitetura e a vida cultural de San Salvador. Suas praças, edifícios emblemáticos e espaços renovados oferecem uma visita agradável para quem deseja conhecer mais sobre o coração da cidade.",

      "catalog.title":        "Catálogo de Tours",
      "dayTours.heading":     "Day Tours",
      "dayTours.item1":       "Excursões guiadas de um dia completo.",
      "dayTours.item2":       "Visitas a vulcões, lagos e centros históricos.",
      "dayTours.item3":       "Transporte confortável de ida e volta incluído.",
      "dayTours.item4":       "Almoços tradicionais com comida local.",
      "dayTours.cta":         "Saiba mais",

      "tourPackages.heading": "Pacotes de Tour",
      "tourPackages.item1":   "Itinerários completos de vários dias.",
      "tourPackages.item2":   "Hospedagem selecionada em hotéis.",
      "tourPackages.item3":   "Exploração exaustiva dos melhores destinos.",
      "tourPackages.item4":   "Guias dedicados durante toda a viagem.",
      "tourPackages.cta":     "Saiba mais",

      "personalized.heading": "Experiência Personalizada",
      "personalized.item1":   "Rotas projetadas ao seu próprio gosto e ritmo.",
      "personalized.item2":   "Guias privados especializados.",
      "personalized.item3":   "Atividades exclusivas e paradas gastronômicas.",
      "personalized.item4":   "Perfeito para casais, famílias ou grupos selecionados.",
      "personalized.cta":     "Saiba mais",

      "realestate.title":     "Imóveis",
      "realestate.subtitle":  "Em Breve",
      "realestate.message":   "Esta seção está atualmente em construção. Em breve você poderá explorar os melhores imóveis disponíveis em El Salvador.",

      "social.connect":       "Conecte-se conosco",

      "footer.brand":         "El Salvador Trails",
      "footer.privacy":       "Política de Privacidade",
      "footer.terms":         "Termos de Serviço",
      "footer.contact":       "Contato",
      "footer.copyright":     "© 2026 El Salvador Trails.",

      "theme.toggle.dark":    "Mudar para modo escuro",
      "theme.toggle.light":   "Mudar para modo claro",
      "theme.icon.dark":      "dark_mode",
      "theme.icon.light":     "light_mode",

      "tour.viewDetails":     "Ver detalhes",
      "tour.itinerary":       "Itinerário",
      "tour.included":        "Incluído",
      "tour.highlights":      "Destaques",
      "catalog.back":         "Voltar",
      "personalized.comingSoon": "Em Breve",

      // ---- Modal de tours (accesibilidad) ----
      "tour.modal.close":     "Fechar modal",
      "tour.modal.prev":      "Imagem anterior",
      "tour.modal.next":      "Próxima imagem",
      "tour.modal.imgN":      "Imagem",
      // ---- Carrusel (accesibilidad) ----
      "carousel.nav":         "Navegação de destinos",
      "carousel.mainImg":     "Destinos El Salvador",
      "carousel.thumb":       "Miniatura",

      // ---- About Us ----
      "about.hero.badge":     "Nossa Trajetória",
      "about.hero.title":     "Atrás de Cada Trilha, uma História de Paixão e Confiança",
      "about.hero.subtitle":  "Compartilhando a autêntica riqueza cultural e natural de El Salvador com viajantes de todo o mundo.",
      "about.founder.name":   "Mario Domínguez",
      "about.founder.role":   "Fundador e Guia de Turismo de El Salvador Trails",
      "about.founder.p1":     "Nasci em San Salvador, El Salvador, um país que desde jovem despertou em mim uma profunda admiração pela sua história, cultura e riqueza natural. Minha trajetória profissional no turismo sempre foi marcada pela paixão de compartilhar experiências autênticas com viajantes do mundo todo.",
      "about.founder.p2":     "Vivi no Brasil durante os períodos 1983-1995 e 2016-2024, onde ampliei meus conhecimentos sobre a indústria turística e obtive as credenciais oficiais como guia de turismo no Estado de Sergipe. Esta vivência internacional me permitiu desenvolver uma visão mais ampla do turismo e fortalecer a habilidade de atender visitantes de diferentes culturas e nacionalidades.",
      "about.founder.p3":     "Desde 1999 atuo profissionalmente no setor turístico tanto em El Salvador quanto no Brasil. Entre 2001 e 2016 fundei e liderei uma operadora de turismo em El Salvador, posicionando-a entre as melhores do país e alcançando o reconhecimento de viajantes no TripAdvisor, onde foi avaliada como número um em sua categoria. Esses anos proporcionaram valiosa experiência na criação de roteiros, atendimento ao cliente e desenvolvimento de produtos de alta qualidade.",
      "about.founder.p4":     "Em 2024 retornei à minha terra natal para iniciar uma nova etapa com a fundação da El Salvador Trails, projeto nascido com a mesma paixão e entusiasmo que inspiraram minha primeira empresa turística em 1º de julho de 2001. Hoje, com uma visão renovada, busco criar novas rotas, experiências e aventuras para descobrir a extraordinária história, cultura, gastronomia e natureza de El Salvador e América Central.",
      "about.founder.welcome":"Sejam bem-vindos a El Salvador Trails, onde cada trilha conta uma história e cada experiência se transforma em uma aventura inesquecível.",
      "about.values.heading": "Nossos Pilares",
      "about.values.vision.title": "Nossa Visão",
      "about.values.vision.desc": "Ser a operadora turística mais comprometida com a criação de experiências autênticas em El Salvador e América Central, transformando cada viagem em uma memória única, significativa e inesquecível.",
      "about.values.mission.title": "Nossa Missão",
      "about.values.mission.desc": "Prestar serviços turísticos com os mais altos padrões de qualidade, profissionalismo e calidez humana, superando as expectativas de nossos visitantes.",
      "about.values.commitment.title": "Nosso Compromisso",
      "about.values.commitment.desc": "Oferecer um atendimento pautado pela pontualidade, segurança, respeito e personalização, garantindo experiências memoráveis para cada viajante que confia em nós.",
      "about.trust.exp":      "Mais de 20 anos de experiência em turismo",
      "about.trust.cert":     "Guia certificado com credenciais oficiais",
      "about.trust.tripadvisor": "Trajetória comprovada (#1 no TripAdvisor)",
      "about.trust.safety":   "Acompanhamento seguro e personalizado",
      "about.cta.tours":      "Explorar Catálogo de Tours",

      // ---- Carrusel de Testimonios & Feedback (Home) ----
      "testimonials.title":   "O que dizem os nossos viajantes",
      "testimonials.subtitle":"Experiências reais de quem percorreu as trilhas de El Salvador conosco.",
      "testimonials.cta":     "Viajou conosco? Compartilhe sua experiência",
      "testimonials.photos":  "Fotos da viagem",
      "testimonials.verified":"Viajante verificado",
      "testimonials.prev":    "Depoimento anterior",
      "testimonials.next":    "Próximo depoimento",
      "feedback.modal.title": "Compartilhe sua experiência",
      "feedback.modal.subtitle": "Sua avaliação nos ajuda a continuar proporcionando viagens memoráveis e seguras.",
      "feedback.form.name":   "Seu nome",
      "feedback.form.country":"País de origem (opcional)",
      "feedback.form.rating": "Avaliação",
      "feedback.form.comment":"Seu depoimento ou comentário",
      "feedback.form.photos": "Anexar fotos (opcional, máx. 4 imagens)",
      "feedback.form.submit": "Enviar para moderação",
      "feedback.form.close":  "Fechar",
      "feedback.form.success":"Muito obrigado! Sua avaliação foi enviada e será publicada após revisão de nossa equipe.",

      // ---- Política de Preços e Cotações ----
      "tour.pricing.heading":     "Preços e condições: fale conosco",
      "tour.pricing.notice":      "Nossas tarifas se adaptam ao tamanho e às necessidades do seu grupo (crianças menores de 12 anos têm 50% de desconto). Permita-nos elaborar uma cotação personalizada.",
      "tour.pricing.groupTitle":  "Indique a composição do seu grupo:",
      "tour.pricing.adults":      "Adultos",
      "tour.pricing.children":    "Crianças (<12 anos - 50%)",
      "tour.pricing.date":        "Data estimada",
      "tour.pricing.whatsappBtn": "Cotar pelo WhatsApp",
      "tour.pricing.emailBtn":    "Cotar por E-mail",
      "tour.video.button":        "Ver vídeo do tour",
      "tour.video.tiktok":        "TikTok",
      "tour.video.instagram":     "Instagram"
    }
  };

  /* ── Estado ── */
  var STORAGE_KEY = 'est-lang';
  var currentLang = loadLang();

  /* ── Helpers ── */

  function loadLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && DICTIONARIES[stored]) return stored;
    } catch (e) { /* ignore */ }
    return 'es'; // default
  }

  function saveLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }

  /** Obtener traducción para una clave dada */
  function t(key) {
    return (DICTIONARIES[currentLang] && DICTIONARIES[currentLang][key]) || key;
  }

  /** Obtener el idioma activo */
  function getLang() {
    return currentLang;
  }

  /** Aplicar todas las traducciones al DOM */
  function applyTranslations() {
    // Actualizar lang attribute
    document.documentElement.setAttribute('lang', t('html.lang'));

    // Actualizar título de la página
    var titleKey = document.body.dataset.i18nPageTitle;
    if (titleKey) document.title = t(titleKey);

    // Texto de elementos
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });

    // Atributos aria-label / title
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      el.setAttribute('aria-label', t(key));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      el.setAttribute('title', t(key));
    });

    // Actualizar los botones del lang-switcher
    document.querySelectorAll('.lang-switcher-pill button').forEach(function (btn) {
      var lang = btn.getAttribute('data-lang');
      btn.classList.toggle('active', lang === currentLang);
    });

    // Notificar al tema para actualizar aria del toggle
    if (typeof window.__estUpdateThemeLabels === 'function') {
      window.__estUpdateThemeLabels();
    }
  }

  /** Cambiar idioma */
  function setLang(lang) {
    if (!DICTIONARIES[lang] || lang === currentLang) return;
    currentLang = lang;
    saveLang(lang);
    applyTranslations();
  }

  /* ── Exposición global ── */
  window.__estI18n = {
    t: t,
    getLang: getLang,
    setLang: setLang,
    applyTranslations: applyTranslations,
    DICTIONARIES: DICTIONARIES
  };

  /* ── Inicialización del lang-switcher ── */
  document.addEventListener('DOMContentLoaded', function () {
    // Asignar data-lang a los botones del pill
    document.querySelectorAll('.lang-switcher-pill button').forEach(function (btn) {
      var code = btn.textContent.trim().toLowerCase();
      btn.setAttribute('data-lang', code);
      btn.addEventListener('click', function () {
        window.__estI18n.setLang(code);
      });
    });

    // Aplicar traducciones iniciales
    applyTranslations();
  });
})();
