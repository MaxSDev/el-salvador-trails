# Day Tours añadidos — 2026-10-12

Se integraron los cinco tours que faltaban del texto recibido de Mario Domínguez el 2026-10-11. El catálogo queda con nueve Day Tours y los dos paquetes anteriores. Los seis registros anteriores se compararon con el estado inicial y permanecen idénticos.

## Contenido y datos

Fuente preservada: DAY_TOURS_CLIENT_SOURCE_2026-10-11.md, copia del archivo entregado por Max. Sus notas se usan como referencia editorial; no autorizan cambios fuera de la solicitud.

El español conserva títulos, párrafos y exclamaciones del cliente; se elimina únicamente la sintaxis Markdown de negrita para almacenar texto plano. EN/PT son traducciones asistidas, pendientes de revisión editorial del cliente. Los destacados y etiquetas breves resumen ese contenido sin incorporar precios ni paradas nuevas.

| ID estable | Tour |
| --- | --- |
| laguna-alegria-volcan-tecapa | La Laguna de Alegría – Volcán Tecapa |
| la-libertad-paraiso-del-surf | La Libertad – Paraíso del Surf |
| boqueron-fumarolas-volcan-san-salvador | Boquerón y Fumarolas – Volcán de San Salvador |
| ciudad-puerta-del-diablo | Tour de Ciudad y Puerta del Diablo |
| ciudad-lago-ilopango | Tour de Ciudad y Lago de Ilopango |

data/tours.json es la fuente y data/tours-data.js su copia embebida idéntica para file:// y Home. La procedencia queda en contentSource; optionalExtras usa IDs estables. No se añadieron horarios, cupos, puntos de encuentro, mapas, valoraciones ni videos que el cliente no entregó. Alegría indica día completo porque su texto lo confirma; los 45 minutos de Boquerón siguen describiendo solo esa caminata, no la duración total.

La Libertad muestra las inclusiones confirmadas y permite seleccionar surf-lesson-1h (clase de una hora). La selección llega al texto de WhatsApp o mailto únicamente cuando está marcada. No es una reserva ni tiene precio automático. Grupo, fecha y extras se conservan en memoria al cerrar/reabrir el detalle o cambiar idioma; no se guardan en localStorage.

Los nuevos tours usan un aviso de cotización sin prometer el descuento infantil que aparecía en las fichas anteriores. Las fichas rápidas muestran únicamente valores presentes en los datos; se eliminó el fallback que mostraba cinco estrellas aunque no existiera una valoración.

## Fotos

Se seleccionaron visualmente doce fotos de las carpetas del cliente, sin imágenes de stock ni imágenes generadas. Fallbacks JPEG orientados y limitados a 1600px en assets/tours/day-updates/. Variantes AVIF/WebP 480/768/1200/1600 y entradas aditivas en los dos manifiestos de medios.

La correspondencia original/archivo del sitio se conserva en DAY_TOUR_PHOTOS.json. Los originales del cliente no fueron modificados.

No se encontró una carpeta de Ilopango. Hasta recibir fotos, ese tour usa una imagen existente del Centro Histórico, que también pertenece al itinerario, con alt y nota trilingüe explícitos. No se reutilizó Coatepeque como si fuera Ilopango. Las fotos de costa no se presentan como el hotel contratado o una inclusión específica.

## Interfaz

Se reutilizan mosaico, modal, galería, botones, colores y fuentes existentes. css/day-tours.css extiende las filas y limita el mosaico intrínseco a tres columnas; mantiene las composiciones anchas de los cuatro destinos originales y del noveno. No cambia Home, About, Bienes Raíces ni el formulario personalizado.

js/tour-options.js centraliza hechos confirmados y opciones admitidas. js/day-tours-i18n.js añade textos ES/EN/PT de los controles. js/tours.js admite inclusiones en un Day Tour, actualiza alt al cambiar foto y arma la solicitud con extras.

## Verificación

- 90/90 pruebas: incluyen paridad JSON/fallback, original español, IDs únicos, traducciones, fotos/variantes existentes, fichas sin valoraciones inventadas y mensajes con surf seleccionado/desmarcado.
- Prueba de mensajes mediante adaptadores simulados: cero correos o mensajes enviados.
- Navegador 1440×900 y 390×844, ES/EN/PT y temas claro/oscuro: nueve destinos, filas de 280px, sin desbordamiento horizontal; cinco detalles y galerías comprobados.
- La selección de surf y cuatro adultos se conservó al cerrar el modal, cambiar a portugués y reabrir.
- 8 páginas y 69 medios responsive verificados; build completado.
- Detector: sin hallazgos en css/day-tours.css. Los avisos sobre hero, menú e itinerarios anteriores quedaron fuera del cambio; no se rediseñó el sitio para corregirlos.

No se realizó commit, push ni despliegue remoto en esta tarea.

