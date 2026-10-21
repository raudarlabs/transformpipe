## Lo que se conserva

Todo lo que dentro de `<body>` tiene una forma en Markdown la recibe. Un asterisco o un guion bajo suelto en el texto se escapa. Las entidades se decodifican: `&copy;` llega como ©, y `&lt;b&gt;` como una etiqueta `<b>` de verdad.

| En el HTML | En el Markdown |
| --- | --- |
| `<h1>` a `<h6>` | `#` a `######` |
| `<strong>`, `<em>`, `<del>` y sus formas cortas | `**negrita**`, `*cursiva*`, `~~tachado~~` |
| `<a href>` | `[texto](dirección)`, o `<dirección>` cuando el texto es la propia dirección |
| `<img>` | `![alt](src)`, con el `src` tal como está escrito |
| `<ul>`, `<ol>` | Listas con `-` y `1.`, cada nivel sangrado dos espacios |
| Una casilla de verificación en un elemento de `<ul>` | `- [x]` o `- [ ]` |
| `<table>` | Una tabla, con la primera fila como encabezado |
| `<pre><code class="language-js">` | Un bloque de código cercado, marcado `js` |
| `<code>`, `<blockquote>`, `<hr>`, `<br>` | `` `código` ``, `>`, `---`, un salto de línea |

Las tablas se ordenan por el camino: una columna vacía en todas las filas desaparece, y las celdas no se rellenan con espacios. Un `<caption>` pasa a ser una línea en negrita sobre la tabla.

## Lo que se pierde

- **El `<head>`**: título, etiquetas meta, hojas de estilo y scripts, así que una página cuyo título solo está en `<title>` llega sin él.
- **`<script>`, `<style>`, `<noscript>`, `<template>`, `<svg>` e `<iframe>`**, con todo su contenido: un vídeo o un mapa incrustado no deja nada.
- **`<nav>` y `<footer>`**, contenido incluido, estén donde estén. `<header>` y `<aside>` se conservan.
- **Los comentarios, y todos los `class`, `id` y `style`.** `<u>`, `<mark>`, `<sub>` y `<sup>` conservan sus palabras y pierden la marca: `H<sub>2</sub>O` llega como H2O.
- **Las imágenes incrustadas como direcciones `data:`**, con su texto alternativo, de modo que una página autónoma, guardada en un solo archivo, pierde sus imágenes.

## Un ejemplo

Una página de notas de versión guardada:

```html
<!DOCTYPE html>
<html>
<head><title>Release 2.4</title><style>h1 { color: navy; }</style></head>
<body>
<nav><a href="/">Home</a> <a href="/blog">Blog</a></nav>
<h1>Release 2.4</h1>
<p>Adds <strong>offline mode</strong> and fixes the <em>sync</em> bug.
See <a href="https://example.com/changes">the changelog</a>.</p>
<ul>
  <li><input type="checkbox" checked> Update the docs</li>
  <li><input type="checkbox"> Tell support</li>
</ul>
<table>
  <tr><th>Platform</th><th>Status</th></tr>
  <tr><td>macOS</td><td>Shipped</td></tr>
  <tr><td>Windows</td><td><del>Beta</del> Shipped</td></tr>
</table>
<pre><code class="language-bash">npm install app@2.4</code></pre>
<footer>© 2026 Example Ltd</footer>
</body>
</html>
```

se convierte en:

````markdown
# Release 2.4

Adds **offline mode** and fixes the *sync* bug. See [the changelog](https://example.com/changes).

- [x] Update the docs
- [ ] Tell support

| Platform | Status |
| --- | --- |
| macOS | Shipped |
| Windows | ~~Beta~~ Shipped |

```bash
npm install app@2.4
```
````

El menú, el pie, la hoja de estilo y el título han desaparecido, y la línea partida a mitad de párrafo vuelve a ser una.

## Límites

- Archivos `.html`, `.htm` o `.xhtml`, o código HTML pegado, hasta 10 MB de una vez. Varios archivos cuentan juntos y forman un solo documento, separados por `---`.
- El archivo se convierte en su navegador y no se sube. Solo llega a su cuenta si ha iniciado sesión y pulsa Guardar, y un documento guardado puede ocupar como máximo 4 MB.
- El archivo se lee como UTF-8, diga lo que diga su `<meta charset>`: una página guardada en Windows-1252 muestra caracteres de sustitución en lugar de sus letras acentuadas.
- No hay detección del artículo: los avisos de cookies y las barras laterales también pasan. [Cómo convertir HTML a Markdown](/blog/convert-html-to-markdown) explica cómo quitarlos antes.
- Un bloque de código necesita un `<code>` solo dentro de su `<pre>`, sin ningún espacio en blanco alrededor, y su lenguaje solo sale de una clase `language-…`. Un `<pre>` sin `<code>` se convierte en texto sin nada escapado, cuyos saltos de línea desaparecen al mostrarse.
- Las celdas combinadas no se reparten: una celda con `colspan` o `rowspan` ocupa un solo hueco y el resto de la fila se desplaza a la izquierda. Las tablas anidadas se aplanan, y un `<br>` dentro de una celda junta sus palabras.
- Una lista dentro de un elemento numerado se sangra dos espacios, menos de los que exige CommonMark, así que deja de estar anidada.

## Preguntas

### ¿Se puede convertir una página web a Markdown a partir de su URL?

No: esta página necesita el archivo o su código fuente. Guarde la página como HTML y suelte aquí el archivo, o use la extensión del navegador, que convierte la página abierta y antes localiza el artículo en ella.

### ¿Hay una API para convertir HTML a Markdown?

Sí. Envíe el HTML como cuerpo de la petición a `/api/v1/documents?kind=html-to-markdown`, con una clave de API del menú de su cuenta. En el servidor se ejecuta el mismo conversor y guarda un documento; `GET /api/v1/documents/:id` devuelve su Markdown.

```bash
curl -H "Authorization: Bearer tp_live_…" \
     --data-binary @page.html \
     "https://transformpipe.com/api/v1/documents?kind=html-to-markdown&name=page.md"
```

### ¿Cómo convertir HTML a Markdown con Python?

No hay un paquete de Python. Un script puede llamar a la API con `requests`; para convertir dentro del propio Python, [esta comparativa de bibliotecas](/blog/turndown-and-html-to-markdown-libraries) trata html2text y Pandoc.

### ¿Una tabla HTML se convierte en una tabla Markdown?

Sí, con la primera fila como encabezado, porque una tabla Markdown lo necesita. La negrita, la cursiva, el tachado, los enlaces y las imágenes de una celda sobreviven; el código en línea pierde sus comillas invertidas.

### ¿Por qué faltan las imágenes?

O eran direcciones `data:`, que se descartan, o están en la carpeta que el navegador guarda junto a la página. Las rutas se mantienen tal cual, así que las imágenes solo aparecen si esa carpeta está junto al Markdown; [Cómo abrir un archivo .html](/how-to/open-html) explica esa carpeta.
