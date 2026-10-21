## Lo que se conserva

El Markdown se lee como GitHub Flavored Markdown, con las extensiones habituales en notas y documentación además:

| En el Markdown | En el HTML |
| --- | --- |
| Encabezados | `<h1>` a `<h6>`, cada uno con un id como `doc-setup` |
| Un enlace a `#setup` | Dirigido a ese encabezado, esté escrito al estilo de GitHub o al de Obsidian |
| Listas de tareas, tablas | Casillas que no se pueden marcar; tablas que se desplazan en pantallas estrechas |
| Bloques de código delimitados | Resaltado de sintaxis para Python, JavaScript, SQL, Bash, YAML y una veintena de lenguajes más |
| Un bloque `mermaid` | El diagrama, dibujado en SVG dentro del archivo descargado |
| Fórmulas `$…$`, notas al pie | MathML; notas numeradas y reunidas al final |
| `> [!NOTE]`, `==mark==`, `H~2~O` | Un recuadro de aviso, `<mark>`, `<sub>` |

«Descargar .html» guarda un único archivo: el documento con su hoja de estilos dentro, sin scripts ni fuentes web, en la paleta clara u oscura que muestre la aplicación, y en clara al imprimir. Una línea al pie indica el nombre del documento y la hora de la conversión, con un enlace a TransformPipe. El menú junto al botón ofrece además Markdown, Markdown para Obsidian, texto plano, Word, EPUB, Confluence, Jira, Slack y un PDF a través del diálogo de impresión.

## Lo que se pierde

- **El front matter.** Un bloque YAML entre dos líneas `---` al principio del archivo se elimina.
- **Los wikilinks.** `[[Install guide]]` se convierte en las palabras «Install guide», y `![[diagram.png]]` en el nombre del archivo en cursiva.
- **El HTML fuera de la lista permitida.** `<script>`, `<style>` e `<iframe>` desaparecen con su contenido, los atributos `style` y `onclick` se eliminan, y una etiqueta como `<details>` se pierde, aunque su texto se mantiene.
- **Los saltos de línea simples.** Un salto de línea dentro de un párrafo se convierte en un espacio, como en GitHub. Para un `<br>`, la línea debe terminar con dos espacios o con una barra invertida.
- **Las imágenes como archivos.** Una imagen sigue siendo un `<img>` que apunta a su dirección. Una ruta relativa como `img/chart.png` solo se ve si esa carpeta está junto al archivo descargado, porque al conversor solo llega el `.md`.

## Un ejemplo

La entrada:

```markdown
---
title: Release notes
---

# Release 2.4

Read the [setup notes][setup] first.

- [x] Faster export
- [ ] Print in dark mode

| Format | Size |
| --- | ---: |
| HTML | 48 KB |

## Setup

Run `npm ci`.[^1]

[setup]: #setup
[^1]: Node 20 or later.
```

Dentro del `<article>` del archivo descargado:

```html
<h1 id="doc-release-24">Release 2.4</h1>
<p>Read the <a href="#doc-setup">setup notes</a> first.</p>
<ul>
<li><input checked="" disabled="" type="checkbox"> Faster export</li>
<li><input disabled="" type="checkbox"> Print in dark mode</li>
</ul>
<div class="md-table"><table>
<thead>
<tr>
<th>Format</th>
<th align="right">Size</th>
</tr>
</thead>
<tbody><tr>
<td>HTML</td>
<td align="right">48 KB</td>
</tr>
</tbody></table>
</div>
<h2 id="doc-setup">Setup</h2>
<p>Run <code>npm ci</code>.<sup class="md-fnref" id="doc-fnref-1"><a href="#doc-fn-1">1</a></sup></p>
<hr class="md-fnrule">
<ol class="md-footnotes">
<li id="doc-fn-1">Node 20 or later. <a href="#doc-fnref-1" class="md-fnback">↩</a></li>
</ol>
```

El front matter ha desaparecido, el enlace llega al id real del encabezado, y la nota al pie ha pasado al final.

## Límites

- **10 MB por conversión**, contando todos los archivos que se sueltan a la vez. Varios archivos forman un solo documento, separados por una línea horizontal.
- **.md, .markdown, .mdown y .mkd**, o Markdown pegado como texto. Un `.txt` va en su lugar al conversor de texto plano.
- **Todo ocurre en el navegador**, tanto la conversión como la descarga. Sin iniciar sesión, el archivo no se sube; con la sesión iniciada, el documento llega a su cuenta solo al pulsar Guardar, hasta 4 MB.
- **Un diagrama tiene que ser válido.** Un bloque Mermaid con un error se queda como código fuente.
- **Una sola hoja de estilos.** No hay ningún ajuste para usar un CSS propio o una plantilla.

## Preguntas

### ¿Cómo convertir Markdown a HTML?

Suelte un archivo `.md` en esta página, o pegue el Markdown como texto. La vista previa muestra la página, y «Descargar .html» la guarda con el mismo nombre. No hace falta una cuenta. Si solo quiere leer un archivo, [Cómo abrir un archivo .md](/how-to/open-md) indica qué programas lo abren.

### ¿El archivo HTML es autocontenido?

Sí, salvo las imágenes enlazadas por su dirección. La hoja de estilos va dentro del archivo, no se descarga nada para fuentes ni scripts, y los diagramas y las fórmulas van dibujados, así que se abre igual desde un correo que desde un disco sin conexión. [HTML autocontenido explicado](/blog/self-contained-html-explained) entra en más detalle.

### ¿Se puede copiar el HTML en lugar de descargarlo?

Sí. La pestaña «Código HTML» muestra el archivo completo, con los diagramas todavía como código Mermaid, y «Copiar HTML» lo pone así en el portapapeles. Para pegar un fragmento en un CMS, basta con lo que hay dentro de `<article>`.

### ¿Admite GitHub Flavored Markdown?

Sí: las tablas, las listas de tareas, el `~~tachado~~`, los bloques de código delimitados y los enlaces sueltos se leen como los lee GitHub, y además las notas al pie, los avisos, las fórmulas y Mermaid.

### ¿Se sube mi Markdown a algún servidor?

No. Se convierte en el navegador y se guarda en el almacenamiento de ese navegador; solo llega a un servidor si inicia sesión y pulsa Guardar. [Cómo convertir Markdown a HTML online, sin instalar nada](/blog/convert-markdown-to-html-online) explica cómo comprobarlo con cualquier conversor.

### ¿Puedo usar mi propio CSS?

No. El archivo lleva la hoja de estilos del documento. Es HTML normal, así que el bloque `<style>` se puede sustituir después.
