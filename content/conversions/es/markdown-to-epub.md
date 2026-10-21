## Lo que se conserva

Al convertir Markdown a EPUB aquí, el libro sale de la misma página que dibuja la vista previa, cortada en capítulos y empaquetada como EPUB 3.

| En el Markdown | En el libro |
| --- | --- |
| encabezados | capítulos, cortados en `#` si aparece dos veces o más, y si no en `##` con la misma regla |
| `$…$`, `$$…$$` y bloques `mermaid` | fórmulas en MathML; diagramas dibujados en SVG, con colores claros |
| bloques de código delimitados en un lenguaje conocido | letra monoespaciada, palabras clave en negrita, comentarios en cursiva |
| tablas, citas, avisos del tipo `[!NOTE]` | tablas con filetes, citas con una línea a la izquierda, avisos con un borde de color y su título |
| `==marked==`, `- [ ]`, `- [x]` | un resaltado, ☐, ☑ |
| `[^1]` | una nota numerada al final del libro, enlazada en ambos sentidos |
| enlaces a encabezados, direcciones web y `mailto:` | enlaces; el que apunta a un encabezado encuentra el capítulo donde quedó |
| imágenes incrustadas como `data:` | archivos dentro del libro: PNG, JPEG, GIF, WebP o SVG |
| imágenes en direcciones web | descargadas por su navegador y guardadas dentro del libro, si el servidor lo permite |

El índice muestra cada capítulo con su primer encabezado y, si hay varios capítulos, debajo el nivel siguiente, como página de navegación EPUB 3 y también como `toc.ncx`, el formato antiguo. El título es el primer encabezado de nivel 1 a 3 o, si no lo hay, el nombre del archivo; el idioma es el del sitio, así que en esta página es `es`. No se fija ninguna fuente ni color para el texto, de modo que se aplican la fuente, el tamaño y el modo nocturno del lector.

## Lo que se pierde

- **El bloque de metadatos (front matter).** El bloque YAML del principio se elimina; su `title:` y su `author:` no se leen ([más sobre el front matter](/blog/front-matter-and-what-converters-do-with-it)).
- **Autor y portada.** No se registra ninguno de los dos: el libro solo lleva un título, un idioma, una fecha y un identificador, que es nuevo en cada descarga.
- **Algunas imágenes.** Una que está en su disco, o incrustada en otro formato, se convierte en su descripción entre corchetes, en cursiva; una en una dirección web que el navegador no puede descargar, o que un libro no puede mostrar, se convierte en un enlace bajo esa descripción.
- **Enlaces que salen del documento.** Un enlace a otro archivo, o a un encabezado que no existe, conserva solo sus palabras. Lo mismo ocurre con un wikienlace.
- **El color.** El resaltado de sintaxis se ve en negrita y cursiva, nunca en color.
- **El HTML en bruto.** Un bloque `<details>` se despliega, y su resumen queda como texto simple.

## Un ejemplo

```markdown
---
title: Field notes
author: J. Hale
---

# Field notes

A year of walks round the reservoir.

## Spring

Snowdrops by the north gate.[^1]

![North gate](https://example.com/gate.jpg)

## Summer

The path floods in June; take [the dry route](#spring) instead.

- [x] Boots
- [ ] Map

[^1]: Counted on 4 March.
```

Un `#` y dos `##` sitúan el corte en `##`. Un título sin nada debajo abriría el primer capítulo; este lleva un párrafo, así que los dos forman un capítulo propio:

```text
mimetype
META-INF/container.xml
OEBPS/content.opf
OEBPS/toc.ncx
OEBPS/style.css
OEBPS/nav.xhtml
OEBPS/chapter-1.xhtml
OEBPS/chapter-2.xhtml
OEBPS/chapter-3.xhtml
```

El índice dice Field notes, Spring, Summer. Aquí se supone que el servidor de la imagen rechaza al navegador, así que el capítulo 2 la enlaza como `[North gate]`; si no, estaría en el libro como `OEBPS/images/picture-1.jpg`. El capítulo 3 queda así:

```html
<h2 id="doc-summer">Summer</h2>
<p>The path floods in June; take <a href="chapter-2.xhtml#doc-spring">the dry route</a> instead.</p>
<ul>
<li>☑ Boots</li>
<li>☐ Map</li>
</ul>
<hr class="md-fnrule" />
<ol class="md-footnotes">
<li id="doc-fn-1">Counted on 4 March. <a href="chapter-2.xhtml#doc-fnref-1" class="md-fnback">↩</a></li>
</ol>
```

## Límites

- Archivos `.md`, `.markdown`, `.mdown` y `.mkd` de hasta 10 MB, o Markdown pegado. Varios archivos soltados a la vez comparten los 10 MB y se convierten en un solo libro, separados por líneas.
- El libro se genera en su navegador, y solo allí: necesita el analizador HTML del navegador, por lo que la API no produce EPUB. Nada llega a una cuenta a menos que inicie sesión y pulse Guardar; un documento guardado puede ocupar como máximo 4 MB.
- Las imágenes en direcciones web las solicita su navegador, con un máximo de diez segundos cada una.

## Preguntas

### ¿Cómo convertir Markdown a EPUB?

Suelte aquí el archivo .md o pegue el Markdown, revise la vista previa y pulse Descargar .epub. [Cómo crear un EPUB a partir de Markdown](/how-to/make-epub) explica qué lectores lo abren y cómo comprobarlo.

### ¿Por qué mi libro es un único capítulo largo?

Los capítulos solo se cortan en `#` o `##`, y solo en un nivel que aparezca al menos dos veces. Un documento con `###` en todos sus encabezados, o con un solo `#` y un solo `##`, se queda en un capítulo.

### ¿Se puede definir el autor, la portada o el idioma?

Aquí no. El título sale del primer encabezado y el idioma del sitio: en la versión en español el libro queda marcado como `es`, en la inglesa como `en`. Calibre permite añadir después el autor y la portada que pedirá una tienda.

### ¿Se abre en un Kindle?

Send to Kindle acepta EPUB desde 2022, y Apple Books, Google Play Libros y Kobo lo abren directamente. Las fórmulas y los diagramas viajan como MathML y SVG, que algunos lectores de tinta electrónica antiguos no muestran.
