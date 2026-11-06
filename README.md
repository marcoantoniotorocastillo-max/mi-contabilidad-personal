# Mi Contabilidad Personal — versión 0.2

PWA personal offline con IndexedDB local.

## Incluye
- Ingresos y gastos con partida doble.
- Transferencias entre cuentas de activo.
- Préstamos recibidos.
- Compras con tarjeta de crédito.
- Pagos de deuda registrados como amortización de capital.
- Saldos iniciales de activos contra patrimonio inicial.
- Creación de cuentas de activo y pasivo.
- Libro diario, balance de comprobación y resumen de activos/pasivos.
- Respaldo y restauración JSON.

## Actualización
Sube los archivos individuales de esta carpeta al repositorio GitHub reemplazando los archivos de igual nombre. Confirma los cambios en la rama main. El nuevo service worker usa caché `mi-contabilidad-v02`; abre la web con internet y recárgala para obtener la nueva versión.

## Consideraciones
- Registra el saldo inicial de cada cuenta de activo una sola vez.
- Para tarjetas, registra la compra como gasto con tarjeta y luego registra el pago de capital como pago de deuda. Los intereses deben registrarse como gasto por separado; el formulario de amortización actual solo registra capital.
- Los datos quedan almacenados localmente en el dispositivo y no se sincronizan automáticamente con otros dispositivos.
- Esta aplicación es una herramienta personal de control y no sustituye un sistema tributario certificado ni asesoría contable.
