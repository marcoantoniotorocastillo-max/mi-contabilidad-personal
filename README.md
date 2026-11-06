# Mi Contabilidad Personal — versión 0.1

Aplicación web progresiva (PWA) inicial para registrar ingresos y gastos personales con asientos automáticos de partida doble. Los datos se almacenan localmente en IndexedDB.

## Requisitos
- Un navegador moderno (Chrome, Edge, Firefox o Safari).
- Para ejecutar localmente, Python 3 instalado (o cualquier servidor HTTP local).
- No requiere cuenta, base de datos en la nube ni conexión permanente.

## Ejecutar en Pop!_OS / Linux
1. Descomprime el proyecto.
2. Abre una terminal dentro de la carpeta `mi_contabilidad_personal`.
3. Ejecuta:

   `python3 -m http.server 8000`

4. Abre `http://localhost:8000` en el navegador.

No abras `index.html` directamente como archivo: el modo PWA y el almacenamiento se comportan mejor bajo `localhost` o HTTPS.

## Instalar en el dispositivo
- **iPhone:** publica primero la carpeta en una dirección HTTPS. Abre esa dirección en Safari > Compartir > Añadir a pantalla de inicio. Se añadieron metadatos y un icono específico para iOS.
- **Android:** publica primero la carpeta en una dirección HTTPS. Abre esa dirección en Chrome > menú > Instalar aplicación / Añadir a pantalla de inicio.
- En computador: abre el sitio local y usa la opción de instalar aplicación del navegador si está disponible.
- En iPhone: para instalar una PWA se necesita publicar temporalmente en un alojamiento HTTPS o usar un servidor HTTPS accesible; abre el enlace en Safari > Compartir > Añadir a pantalla de inicio.
- En Android: menú del navegador > Instalar aplicación / Añadir a pantalla de inicio.

## Qué incluye
- Panel de ingresos, gastos, resultado y cantidad de movimientos.
- Registro de ingreso o gasto.
- Asientos automáticos balanceados (Debe = Haber).
- Plan de cuentas inicial.
- Libro diario.
- Balance de comprobación.
- Exportación e importación de respaldo JSON.
- Caché offline mediante Service Worker.

## Estructura
- `index.html`: estructura de pantallas.
- `styles.css`: diseño adaptable a móvil y computador.
- `db.js`: IndexedDB, plan de cuentas y respaldo.
- `app.js`: lógica, cálculos y navegación.
- `manifest.webmanifest`: configuración instalable.
- `sw.js`: caché para funcionamiento sin conexión.
- `icon.svg`: icono.

## Importante
Esta versión es un prototipo inicial de contabilidad personal, no un sistema tributario certificado ni un reemplazo de asesoría contable. Aún no incluye conciliación bancaria, presupuestos, cuentas por cobrar/pagar, cierre de períodos, depreciaciones, ni estados financieros completos. Antes de registrar información real importante, prueba con datos ficticios y descarga un respaldo.

## Mantenimiento
- Antes de actualizar, exporta un respaldo JSON.
- No cambies `DB_NAME` ni `DB_VERSION` sin planificar una migración.
- Al cambiar archivos, incrementa el nombre de caché en `sw.js` (por ejemplo `mi-contabilidad-v02`) para que los dispositivos descarguen la versión nueva.
- Mantén al menos dos copias de respaldo en ubicaciones distintas.
