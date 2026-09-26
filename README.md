# Daniela & Lucas · Nuestra boda

Primera versión independiente de https://bodaluquidanch.my.canva.site.
Diez secciones, fotografías, collages, ilustraciones y tipografías recuperadas del sitio público. HTML, CSS y JavaScript con Vite; no necesita una cuenta ni scripts de Canva para funcionar.

## Desarrollo

Requiere Node.js 20.19+ o 22.12+.

```sh
npm install
npm run dev
```

Abrir http://localhost:5173. Los cambios se reflejan automáticamente.

```sh
npm run build
npm run preview
```

`dist/` contiene el sitio estático listo para alojar en un dominio propio.

## Publicación

Repositorio: https://github.com/leavalos/invite-weading

El repositorio es público y GitHub Pages está habilitado con origen **GitHub Actions** y la variable de repositorio `ENABLE_GITHUB_PAGES=true`. El workflow `.github/workflows/deploy.yml` compila y publica automáticamente con cada push a `main`.

Sitio: https://leavalos.github.io/invite-weading/

El workflow configura `DEPLOY_BASE_PATH=/invite-weading/` para las rutas de scripts, fotos y fuentes. Para probar ese despliegue localmente:

```sh
DEPLOY_BASE_PATH=/invite-weading/ npm run build
DEPLOY_BASE_PATH=/invite-weading/ npm run preview
# En otra terminal:
SITE_URL=http://127.0.0.1:4173/invite-weading/ npm run check
```

Para migrar a Vercel, importar el mismo repositorio y elegir `main`. `vercel.json` define Vite, el comando `npm run build` y la salida `dist`. No configurar `DEPLOY_BASE_PATH` allí: por defecto se publica desde `/`. La migración no requiere reescribir la página.

Para repetir la verificación de escritorio y celular, con el servidor de desarrollo activo: `npm run check`. La primera vez requiere `npx playwright install chromium`. Las capturas quedan en `artifacts/` (no versionado).

## Dónde editar

- `src/content.js`: textos, horarios, fecha del contador y enlaces.
- `src/style.css`: colores, tipografía, composición y adaptación móvil.
- `src/main.js`: estructura de las diez secciones y comportamiento de música/contador.
- `src/artwork.js`: composición de los collages originales, con recortes y rotaciones.
- `src/design.json`: datos visuales importados para los collages y catálogo de recursos.
- `public/_assets/`: imágenes y fuentes locales. Se pueden reemplazar por los originales de mejor resolución.

Los enlaces a Google Maps, Spotify, Google Photos y confirmación conservan los destinos de Canva. Spotify tiene un reproductor integrado; los datos bancarios se muestran en un modal local. La música de fondo usa `public/audio/evergreen.mp3`, en bucle, e intenta empezar al abrir la página. Si el navegador bloquea el audio automático, se inicia con la primera interacción. El botón flotante permite pausarla y reanudarla. El contador es local y no depende de TickCounter. Fotos, collages e ilustraciones tienen transiciones al entrar en pantalla. Se corrigieron tildes en los textos y se adaptó el diseño a celular.

## Fechas

La boda es el **20 de febrero de 2027 a las 19:00 (UTC−03:00)**. El plazo para confirmar asistencia es el **20 de diciembre de 2026**, corregido por indicación del usuario.

## Recuperación del diseño

`scripts/import-canva.mjs` importa el diseño desde un HTML descargado y opcionalmente descarga sus recursos públicos. No importa código de ejecución ni credenciales de Canva. No es necesario ejecutarlo para trabajar en el sitio.
