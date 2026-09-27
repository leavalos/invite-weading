# Conectar la confirmación a Google Sheets

La interfaz está lista localmente. **No hay conexión real hasta desplegar el script y configurar su URL.** No publicar la planilla ni dar acceso de edición a los invitados.

1. Abrir https://docs.google.com/spreadsheets/d/1u74S2zWM0RtUhka6OpLRPO5iWavaBC3osBPGKwhUgtA/edit con la cuenta propietaria.
2. Elegir **Extensiones → Apps Script**. En un proyecto nuevo, pegar el contenido completo de `Code.gs` en el archivo de código y guardar. Si ya hay código, conservarlo y usar un proyecto independiente en https://script.google.com/ (no duplicar funciones `doPost` o `setup` existentes).
3. Seleccionar la función **setup**, presionar **Ejecutar** y autorizar el acceso a la planilla. Crea una pestaña `Confirmaciones web`, sin modificar las otras pestañas. La celda I2 suma personas confirmadas.
4. **Implementar → Nueva implementación → Aplicación web**. Ejecutar como **Yo**. Quién tiene acceso: **Cualquier persona** (sin exigir iniciar sesión). Autorizar la implementación con tu cuenta. Si tu organización no ofrece esa opción, no sirve esta configuración para invitados sin cuenta.
5. Copiar la URL de aplicación web terminada en `/exec` y pasarla a Codex. No enviar contraseñas, tokens ni la URL del editor.

Para configurar localmente, crear `.env.local` (ignorado por Git):

```dotenv
VITE_RSVP_ENDPOINT=https://script.google.com/macros/s/ID_DE_IMPLEMENTACION/exec
```

Reiniciar Vite. Antes de publicar, comprobar desde el navegador una respuesta acordada de prueba, su fila en la planilla y el total. La interfaz solo muestra éxito después de recibir la confirmación JSON del servicio; no usa `no-cors` ni asume que enviar equivale a guardar. Si Google bloquea el acceso o la respuesta, el modal mantiene los datos y muestra un error.

Para Pages configurar la variable de repositorio `VITE_RSVP_ENDPOINT` con esa misma URL antes del próximo build. La URL es pública por diseño; nunca poner credenciales en variables `VITE_*`. Tras cambiar Code.gs, actualizar la implementación a una nueva versión.

Cada fila representa una respuesta familiar, con todos sus nombres y cantidad calculada por el servidor; quien no asiste cuenta como cero. Reintentar la misma respuesta dentro de la sesión no crea filas extra. Una nueva sesión o dispositivo sí puede enviar una nueva respuesta: esta primera versión no identifica invitaciones ni deduplica familias entre dispositivos. Los cambios posteriores se coordinan con los novios y se corrigen en la planilla. Para impedir duplicados por familia se necesitarían enlaces personalizados.

El endpoint público admite envíos sin autenticación; las validaciones limitan el tamaño y neutralizan fórmulas en texto, pero no equivalen a un control de invitados ni protección completa contra spam. No devuelve datos de invitados.
