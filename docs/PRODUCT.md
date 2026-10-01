# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Usuario primario confirmado (respuesta directa 18/09/2026): **ambos por igual — B2C + B2B**.

- **Turista internacional 35+ / tercera edad:** viaja a El Salvador y Centroamérica buscando experiencias auténticas (historia, cultura, gastronomía, naturaleza) con guía experto. Necesita información clara, legible, sin sobrecarga, en su idioma (ES/EN/PT), y una vía simple para pedir cotización o reservar con depósito. No quiere carrito ni precios fijos: quiere confiar y contactar.
- **Operadores turísticos / trip leaders:** arman grupos y cotizan viajes a medida. Usan el sitio como catálogo confiable (Day Tours, Tour Packages, Personalized Experience) y canal de contacto para negociar depósito (25% personalizado, hasta 50% operadores).
- **Mercado brasileño [confirmado en brief]:** segmento prioritario dentro del B2C por la trayectoria de Mario en Brasil (1983–1995, 2016–2024, credencial de guía en Sergipe). El portugués es requisito de captación, no accesorio.

## Product Purpose

Sitio web de **El Salvador Trails (Senderos de El Salvador)**, operadora boutique fundada en 2024 por Mario Domínguez: convertir interés en contacto cotizado. El sitio presenta la operadora (Home con carrusel, About Us), su catálogo (Day Tours / Tour Packages / Personalized Experience), un Mural de Feedback moderado, Pago en Línea por depósito de garantía vía Payment Links, y Bienes Raíces (placeholder en nav, destino final abierto). Éxito = el visitante entiende la propuesta, encuentra un tour o pide una experiencia personalizada, y el equipo recibe la solicitud por correo con su medio de contacto preferido (WhatsApp o correo).

## Positioning

[Inferido — segundo probe estructurado caducó sin respuesta; derivado del brief explícito, pendiente de confirmación]: lo que un competidor no puede copiar con verdad es la combinación **guía-fundador con 25+ años operando entre El Salvador y Brasil + operadora anterior #1 en TripAdvisor en su categoría (2001–2016) + atención trilingüe ES/EN/PT orientada a brasileños + cotización a medida sin carrito con depósito simple**. No es un marketplace de tours: es trato directo, puntual, seguro y personalizado con quien diseñó la ruta.

## Operating Context

- Personalized Experience: cuestionario de perfil (edad, intereses, días) → Mario/Ellen analizan manualmente → propuesta a medida. La solicitud debe llegar **siempre por correo** (el hilo de correo es el CRM natural; ciclos de venta de meses). Fallback planeado: notificación en dashboard si el correo falla [confirmado en brief].
- Venta sin carrito: todo se cotiza por perfil; el pago en línea es solo depósito de garantía vía Payment Links (Stripe/PayPal/Wompi), sin cálculo de totales.
- Rituales: reuniones semanales (martes después de 4:30pm); avances como "borrador para su opinión", siempre con algo visual; carpetas horizontal (carrusel) / vertical (descripciones); dron directo a computadora, nunca por WhatsApp.
- Equipo: 2 devs estudiantes, disponibilidad mixta; cliente sin presión de fecha. Sin login de clientes (decisión explícita).
- Stack incumbente (evidencia en repo, no decisión de init): HTML estático + Tailwind CDN + JS vanilla con `data-i18n` trilingüe desde el inicio.

## Capabilities and Constraints

Confirmado:
- Nav: Página Inicial | Catálogo de Tours | About Us | Bienes Raíces | Pago en Línea | Feedback + selector ES/EN/PT. Home minimalista: carrusel full-width dominante (fade con sombra/blur de la foto activa, validado por cliente), fila de redes, botón tutorial.
- Catálogo: 4 Day Tours + 2 Tour Packages con contenido real recibido; cada tarjeta soporta las 3 traducciones desde el dato (no hardcodear ES). Personalized Experience posterior.
- Mural/Feedback: reseña + fotos (máx. 4); todo entra en pendiente y requiere moderación con filtro anti-odio/spam.
- Media: no sobrecargar con foto/video pesado; video vía embed/miniatura TikTok, no hosting propio.
- Admin: panel mínimo, no técnico; administrable todo el sitio + trilingüe.
- Terminología: Day Tours / Tour Packages / Personalized Experience; Mural (Feedback); Bienes Raíces / Real Estate.

Explícitamente indeciso (no inventar):
- Destino/contenido final de Bienes Raíces (solo nombre + posición en nav).
- Traducción EN/PT: profesional vs. asistida — sin definir.
- Dominio y hosting: pendiente de estimación de tráfico.
- Wireframes de About Us y Pago en Línea: abiertos a propuesta del equipo.

## Brand Commitments

- Nombre: El Salvador Trails / Senderos de El Salvador. Fundador y cara: Mario Domínguez, guía ES–BR desde 1999; colaboradora UX/estructura: Ellen Domínguez.
- Voz confirmada en copy real: cálida, experta, de anfitrión ("donde cada sendero cuenta una historia y cada experiencia se convierte en una aventura inolvidable"). Misión/Visión/Compromiso en `EST - Español.md` son texto vinculante.
- Assets: `assets/logo.svg`, carrusel, `carrusel-ui.mov`, `wireframe-tours.png`, bocetos de Ellen (el home sigue sus bocetos, no el sitio de competencia usado como referencia).
- Sin dirección estética nueva en este init (por regla): el sistema incumbente se preserva como autoridad visual hasta que new-work decida otra cosa.

## Evidence on Hand

- Contenido real: `EST - Español.md` (bio, visión/misión, 4 Day Tours, 2 Tour Packages con itinerarios).
- Contexto: `Referencia de reuniones hasta la fecha.md` (decisiones, constraints, plan).
- Implementación: `index.html`, `about.html`, `tours.html` + `tours.js`, `real-estate.html` (placeholder), `about-sendero.html`, `i18n.js`, `styles.css`, `carrousel.css`, `theme.js`, `testimonials.js`, `script.js`, `Carrousel_v1/`, `content/`, `assets/`.
- Ausencias que no deben fabricarse: testimonios reales del Mural, fotos finales, traducciones EN/PT verificadas, URLs reales de redes, contenido de Bienes Raíces.

## Product Principles

1. Claridad antes que catálogo: si un viajero 35+ no lo entiende a la primera, sobra.
2. Trato directo, no checkout: cada pantalla acerca a una conversación (cotizar, personalizar, depositar).
3. Trilingüe desde el dato, no como parche: nada hardcodeado solo en español.
4. Moderación como hospitalidad: el Mural solo publica lo que un futuro viajero merece leer.
5. Ligero por respeto: lo pesado vive en redes enlazadas; el sitio nunca frena con conexión modesta.

## Accessibility & Inclusion

Público 35+/tercera edad y operadores: diseño claro y legible, sin sobrecarga cognitiva ni visual. Sin estándar formal declarado; preservar contraste, tamaños legibles, navegación simple y los tres idiomas. Sin login (menos fricción).
