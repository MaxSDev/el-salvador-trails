# Web Chat Import Plan

- Source: Claude
- Imported at: 2026-08-31
- Original file: pasted (historial de chat web, sesión de asesoría de proyecto)
- Model that summarized: Claude Sonnet 5
- Handoff ID: est-trails-w4

## Overall Goal / Project

Equipo de 2 desarrolladores full-stack (estudiantes, sin experiencia previa en producción real) construyendo, como práctica profesional real y sin costo para el cliente, el sitio web de **El Salvador Trails** (Senderos de El Salvador) — operadora turística boutique fundada en 2024 por Mario Domínguez, con su hija Ellen Domínguez como colaboradora en UX/estructura. Plazo interno del equipo: 3 meses. Objetivo doble: entregar valor real al cliente y operar con el rigor de una agencia real (cronograma, reuniones semanales, documentación) como preparación para empleo remoto/freelance posterior.

## Key Decisions Made

- **Sin carrito de compras ni precios fijos.** Todo se cotiza según el perfil del cliente. El pago en línea es solo un **depósito de garantía** (25% clientes personalizados, hasta 50% operadores) vía **Payment Links** de Stripe/PayPal/Wompi,etc — no un checkout con cálculo de totales.
- **Estructura del sitio:** Página Inicial (carrusel + redes sociales + tutorial), About Us, Catálogo de Tours (pestañas: Day Tours / Tour Packages / Personalized Experience), Pago en Línea, Feedback/Mural (con moderación de contenido), más un nuevo ítem de nav "Bienes y Raíces" / "Real Estate" (placeholder por ahora).
- **Multi-idioma obligatorio:** Español, Inglés, Portugués (Portugués es clave por el mercado brasileño personal de Mario).
- **Panel de administración simple** — Mario se autodescribe "en transición análogo-digital"; el panel debe ser mínimo y no técnico.
- **Personalized Experience:** cuestionario de perfil (edad, intereses, días de viaje) → Mario/Ellen analizan manualmente y envían propuesta a medida. El usuario elige su **medio de contacto preferido** (WhatsApp o Correo), pero la solicitud siempre debe **llegar a la empresa por correo electrónico** — usan el hilo de correo como historial/CRM natural, porque los ciclos de venta pueden tardar meses. No se requiere vista/listado en el panel admin por ahora, pero se planea integrar como fallback en caso de que no se mande el correo que se tengan las dos opciones, ver en el correo o en el dashboard como notificación si falla en mandarse o que quede en espera.
- **Sin login de clientes.** Decisión explícita de no construir autenticación — no fue pedido y rompe la simplicidad del modelo sin carrito.
- **Stack recomendado:** frontend a medida + Supabase (U otra opción que funcione para el proyecto) (datos/notificaciones simples) + Payment Links — evita construir pasarela de pago o carrito complejo.
- **Composición del home** sigue los bocetos de Ellen (no el sitio de la competencia usado como referencia): Nav (Página Inicial | Catálogo de Tours | Pago en Línea | Feedback | selector ES/EN/PT) → carrusel full-width dominante → fila de íconos de redes sociales (FB, TikTok, Instagram, YouTube) → botón de tutorial. Minimalista — sin secciones extra tipo "destinos destacados" o blog en el home.
- **Carrusel:** efecto de fade entre fotos con sombra/blur de la misma foto activa como fondo — validado y elogiado por el cliente.
- **Catálogo de Tours:** construir primero Day Tours y Tour Packages (contenido real ya recibido: 4 Day Tours, 2 Tour Packages con descripciones completas), dejar Personalized Experience para después. Cada tarjeta debe soportar las 3 traducciones desde el inicio (no hardcodear texto en español).

## Constraints & Requirements

- Equipo de 2, disponibilidad mixta: 3 días/semana medio tiempo + 2 días/semana tiempo completo (8:00–17:00 con almuerzo).
- Tope interno de 3 meses (12 semanas); el cliente no presiona por fecha.
- Reuniones semanales con el cliente (martes, después de 4:30pm).
- Público objetivo: turistas internacionales 35+/tercera edad y operadores turísticos/trip leaders — no tanto público local salvadoreño. Diseño debe ser claro y legible, sin sobrecarga.
- No sobrecargar el sitio con fotos/video pesado — enlazar a redes sociales (TikTok para video) en vez de alojar todo el contenido. Esto quiere decir que en las fotos de los Day tours, etc. de los tours, irá como una galería de fotos, pero para poder alojar los videos solo se pondrá un embed de tiktok o una miniatura de tiktok que mande al sitio, o que lo reproduzca, para no saturar el sitio, o alguna forma que sea seamless y que no rompa la estética de la página.

## Current Plan / Next Actions (Plan Mode)

1. Agregar ítem de nav "Bienes Raíces" / "Real Estate" (destino final aún no definido).
2. Construir Catálogo de Tours: pestañas Day Tours y Tour Packages con el contenido real ya recibido, estructurado para soportar ES/EN/PT desde el modelo de datos.
3. Diseñar el formulario de Personalized Experience con campo "medio de contacto preferido" (WhatsApp/Correo).
4. Configurar notificación por correo electrónico al enviarse el formulario de Personalized Experience (sin vista en panel admin todavía, pero se implementará después).
6. Seguir el cronograma de semanas: descubrimiento/diseño, desarrollo, pagos/contenido/QA, lanzamiento.

## Important Facts & Context to Preserve

- El cliente valora sentirse parte del proceso creativo — presentar avances como "borrador para su opinión", nunca como aprobado; llevar siempre algo visual a cada reunión.
- Logística de contenido: carpetas separadas horizontal (carrusel) / vertical (descripciones); fotos de dron deben pasarse directo a computadora, nunca por WhatsApp (pierde calidad).
- Backlog: link de alojamiento colaborativo (Airbnb/real estate) — parcialmente confirmado ahora como el ítem de nav "Bienes Raíces".
- Bio de Mario (About Us): turismo en El Salvador y Brasil desde 1999, operadora anterior #1 en TripAdvisor en su categoría (2001–2016), fundación de El Salvador Trails en 2024 tras regresar de Brasil.

## Open Questions / Blockers

- Destino/contenido final del link "Bienes Raíces" — solo el nombre y la ubicación en el nav están confirmados.
- Traducción a inglés y portugués: sin definir si será profesional o asistida por herramienta.
- Dominio y proveedor de hosting: pendiente de estimar tráfico esperado antes de decidir nivel (básico/intermedio/avanzado).
- Wireframes propios de About Us y Pago en Línea: el cliente no los tiene — quedan abiertos a la propuesta del equipo.

## What the Harness Should Do Now

Tratar este paquete como la fuente de verdad más reciente de las reuniones con el cliente. Preguntar solo si hay un bloqueo genuino que no se resuelva con la información aquí.

## Full Original (reference only)

Stored at: historial de conversación web (Claude.ai), sesión de asesoría de proyecto — no persistido como archivo único. Consultar el historial completo del chat si se necesita más detalle granular de alguna reunión específica.
