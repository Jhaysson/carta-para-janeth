# Para Janeth

Folleto digital tipo libro, hecho con HTML, CSS y JavaScript. No necesita instalaciones ni compilación.

## Abrirlo en Visual Studio Code

1. Abre esta carpeta en VS Code.
2. Abre `index.html` con doble clic o con la extensión **Live Server** si la tienes instalada.
3. También puedes abrir `index.html` directamente en Chrome, Edge o Safari.

La forma más rápida sin extensiones es hacer clic derecho sobre `index.html` y elegir **Abrir con** el navegador.

## Archivos

- `index.html`: portada, 17 páginas de la carta y contraportada.
- `styles.css`: colores, papel, tipografías, corazones y diseño adaptable.
- `script.js`: giro de páginas, deslizamiento táctil, teclado, progreso y lluvia de corazones.
- `.nojekyll`: evita que GitHub Pages procese el sitio con Jekyll.

## Cómo navegar

- En celular: desliza hacia la izquierda o la derecha.
- En computadora: usa las flechas `←` y `→`, o los botones de abajo.
- En la portada: pulsa **Abrir**.
- En la última página: pulsa el corazón para lanzar corazones.
- En la contraportada: pulsa **Volver al inicio**.
- En pantallas muy pequeñas, si el texto de una página no cabe, aparece el aviso **Desliza**. Desplázate hacia arriba o abajo dentro de la página para leer el resto; el deslizamiento horizontal sigue cambiando de página.

## Publicarlo en GitHub Pages

1. Crea una cuenta en [github.com](https://github.com) si aún no tienes una.
2. Crea un repositorio nuevo y público. Puedes llamarlo, por ejemplo, `carta-digital`.
3. Sube estos archivos a la raíz del repositorio:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `.nojekyll`
   - `README.md` (opcional)
4. En el repositorio, entra a **Settings** > **Pages**.
5. En **Build and deployment**, elige **Deploy from a branch**.
6. Selecciona la rama `main` y la carpeta `/ (root)`. Guarda.
7. Espera uno o dos minutos. La dirección aparecerá en esa misma página, con este formato:

   `https://tu-usuario.github.io/carta-digital/`

Puedes enviar ese enlace por WhatsApp.

## Privacidad

El sitio incluye `noindex` para pedir a los buscadores que no lo indexen, pero **GitHub Pages gratuito publica el sitio desde un repositorio público**. Cualquier persona que tenga el enlace puede abrirlo. No hay contraseña ni acceso privado real.

Si prefieres un enlace menos asociado a tu perfil de GitHub, puedes publicar la misma carpeta en Netlify Drop o en Vercel. El folleto funciona igual.

## Personalizar

- Para cambiar una palabra o párrafo, edita el texto dentro de las etiquetas `<p>` en `index.html`.
- Para cambiar el nombre de la portada, busca `cover__name`.
- Para cambiar los colores, edita las variables al comienzo de `styles.css`.
- Para modificar el nombre **JEANS**, búscalo en `index.html` y `styles.css`.
- Si agregas más páginas, actualiza el contador de corazones automáticamente: el script calcula el total según las secciones con la clase `page`.

## Nota sobre las tipografías

El diseño usa Google Fonts (`Cormorant Garamond` y `Parisienne`). Si no hay conexión a internet, el navegador usará una tipografía clásica de respaldo y el folleto seguirá funcionando.
