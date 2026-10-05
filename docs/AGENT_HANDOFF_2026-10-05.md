# Handoff para el siguiente agente — El Salvador Trails

Fecha: 2026-10-05  
Usuario: Max (estudiante). Trabaja directo en código.  
Carpeta de trabajo (fuente de verdad de este mockup):

`D:\Users\maxgs\Documents\Maxi 2.0\Proyectos\El Salvador Trails\Sitio Web\El Salvador Trails - Estado actual 2026-10-03\Mockups Diseño`

Al arrancar: usar **OpenViking** (`search mode=context`) y este archivo. No confiar en recursos ingestados de septiembre (hablan de Tailwind/sesión 2026-09-07). La conversación viva gana si hay conflicto.

## Qué es el proyecto

Sitio estático de **El Salvador Trails** (operadora boutique, Mario Domínguez). HTML/CSS/JS vanilla, ES/EN/PT, **sin carrito ni precios**. Cotización a medida; depósito de garantía vía Payment Links (aún no implementado). Paleta: papel `#FBF8ED`, vino `#7E1500`, café `#1C1714`, oro `#E9C262`. Tipografía: Fraunces, Work Sans, Cinzel; Adlerly Pro solo marca.

Servir: `python -m http.server 8000 --bind 127.0.0.1` → `http://127.0.0.1:8000/`

Git: rama `gh-pages`, remoto `OscarDiaz1/el-salvador-trails`. Checkpoint previo: `a297612`. El rediseño cinematográfico + correcciones de IA de Max **pueden estar en un commit local nuevo**; no pushear ni desplegar salvo que Max lo pida.

## Qué hizo esta sesión (2026-10-05, Max)

1. Cargó contexto del mockup (Tareas 1–8 del rediseño de alta fidelidad, QA 48/48 técnico del 2026-10-03).
2. Contrastó el recorte del rediseño contra el brief del cliente (`docs/PRODUCT.md`, reuniones, navbar original).
3. Restauración y luego corrección de IA:
   - **Pago en Línea** existe como `payment.html` (próximamente, depósito, sin pasarela inventada).
   - **Feedback NO va en la barra ni en el menú hamburguesa** (decisión de Max; anula el ítem de nav que se había reañadido).
   - El mural `#feedback` vive en **Home**, **arriba**: después del cotizador, antes de tours destacados.
   - `footer-links` en todas las páginas: **Política de Privacidad | Términos de Servicio | Contacto**. WhatsApp se quitó **solo** de ese div (sigue en redes y `wa-float`).
   - `privacy.html` y `terms.html` son placeholders “Próximamente” (sin texto legal inventado).
4. Tests vigentes: `npm test` **51/51**; `npm run media:check` cubre las páginas públicas actuales.

Nav actual (5 destinos): Página Inicial · Catálogo de Tours · About Us · Bienes Raíces · Pago en Línea.

## Mapa de archivos

| Qué | Dónde |
|---|---|
| Home | `index.html`, `css/home-cinematic.css`, `css/carrousel.css`, `js/home.js` |
| Mural Feedback | `#feedback` en `index.html`, `js/testimonials.js`, `data/reviews.json` + `reviews-data.js` |
| Tours / About / Real estate / Pago | `tours.html`, `about.html`, `real-estate.html`, `payment.html` |
| Legal placeholder | `privacy.html`, `terms.html` |
| Sistema | `css/styles.css`, `js/site.js`, `js/i18n.js` |
| Diario / specs | `docs/IMPLEMENTATION_PROGRESS.md`, `REFERENCE_PARITY_REDESIGN_SPEC_2026-10-02.md`, `VISUAL_SYSTEM_STAGE2.md`, `VIDEO_SOURCES.md`, `PRODUCT.md` |
| QA visual | `.qa-stage4` … `.qa-stage7`, `.qa-final/` |

## Decisiones que no revertir

- No meter Feedback otra vez en nav ni hamburguesa.
- No decir “sin pagos en línea” en el cotizador: el precio lo cotiza Mario; el depósito irá en Pago en Línea.
- No publicar socios de Bienes Raíces ni Stripe/PayPal/Wompi inventados.
- Videos YouTube: `productionApproved: false`; iframe `youtube-nocookie` solo tras clic.
- Brief cliente: ES/EN/PT, 35+/B2B, sin login, mural con moderación.

## Pendiente (prioridad)

Crítico de producto (aún abierto):

1. WhatsApp real: hoy `50370000000` (cotizador, flotante, redes, Personalized).
2. Reseñas del mural: semilla en `data/reviews.json` (Sarah Jenkins, etc.). El brief dice no fabricar testimonios. Sustituir por reales o vacío moderado.
3. Personalized Experience: falta cuestionario (edad, intereses, días, WhatsApp/correo; solicitud siempre por email). Hoy es botón WhatsApp.
4. Formulario de Feedback: simula `pending` en cliente; no llega a Mario.
5. Foto de Mario: placeholder (`founder-mario.jpg` ausente).
6. Videos de referencia: no aprobados para producción.
7. `about.html` no carga `js/i18n.js` (diccionario inline): riesgo de desfase con el resto.
8. Texto legal real de privacidad/términos.
9. Aprobación visual de Max del rediseño cinematográfico; después checkpoint Git + push **solo si lo autoriza**.

Siguiente comando de diseño razonable si Max pide pulir UI: Impeccable `polish` sobre Home/mural. No redesarrollar identidad (Fraunces/vino/São Tomé como composición, no copiar marca).

## Cómo verificar

```powershell
npm test
npm run media:check
python -m http.server 8000 --bind 127.0.0.1
```

Comprobar: nav 5 ítems; mural tras cotizador; footer-links sin WhatsApp; `payment.html` / `privacy.html` / `terms.html`.
