---
title: "De Markdown a HTML: qué le pasa realmente a tu archivo"
description: "Qué hace un conversor de Markdown a HTML con tu archivo — analizar, renderizar, sanear, envolver — y cómo se ve un fallo en cada una de las cuatro etapas."
updated: 2026-10-21
date: 2026-09-08
tag: Conversión
keywords: markdown a html, convertir markdown a html, conversor markdown a html online, generador de markdown a html, renderizar markdown como html, pasar md a html
---

Convertir un archivo Markdown a HTML suena como una sola acción. Son cuatro trabajos ejecutados en orden, y una herramienta puede ser cuidadosa con uno y descuidada con el siguiente. Saber cuál es cuál explica por qué dos conversores producen HTML distinto a partir del mismo archivo, por qué una tabla a veces llega como un párrafo lleno de barras verticales, y por qué el resultado se abre de vez en cuando como un muro de texto sin estilo con las rayas convertidas en caracteres ilegibles.

Las cuatro etapas son analizar, renderizar, sanear y envolver. Cada una descarta información o inventa información que nunca estuvo en tu origen, y cada una falla de una forma que se reconoce en pantalla en cuanto sabes qué buscar. Ninguna de las cuatro es opcional si el archivo tiene que abrirse en un sitio distinto de la herramienta que lo produjo.

Este es el relato mecánico: qué construye realmente el analizador, qué decide el renderizador en tu nombre, qué contiene la lista blanca de un sanitizador y qué elimina, y qué necesita un navegador en el `<head>` antes de mostrar tu documento como lo viste en la vista previa.

### Resumen rápido

Un conversor de Markdown a HTML analiza tu texto en un **árbol de sintaxis** de nodos tipados, recorre ese árbol para **renderizar** etiquetas, **sanea** el fragmento resultante contra una lista blanca de etiquetas, atributos y esquemas de URL, y luego **envuelve** el fragmento en un documento completo con un doctype, una codificación y estilos. El dialecto se decide en la primera etapa, así que un analizador CommonMark puro convierte tus tablas de GitHub en párrafos y no hay ningún mensaje de error. El saneado se decide en la tercera etapa, y importa en el momento en que el Markdown viene de cualquier sitio que no escribiste tú mismo. Si el archivo se abre correctamente para la persona a la que se lo envías lo decide casi por completo la cuarta etapa, con cuatro líneas en el head que la mayoría de las bibliotecas nunca escriben porque escribirlas no es trabajo de una biblioteca.

## Las cuatro etapas, de un vistazo

| Stage | Input | Output | Decided here |
| --- | --- | --- | --- |
| Analizar | Caracteres | Un árbol de nodos tipados | Dialecto: tablas, listas de tareas, notas al pie, reglas de salto de línea |
| Renderizar | El árbol | Un fragmento HTML | Ids de encabezado, clases de bloques de código, marcado de casillas, codificación de URL |
| Sanear | El fragmento | Un fragmento sin las partes peligrosas | Qué etiquetas, atributos y esquemas de URL sobreviven |
| Envolver | El fragmento | Un documento completo | Doctype, codificación, título, viewport, estilos, si necesita la red |

Lee esa tabla como una cadena. Un archivo que sale mal, sale mal exactamente en uno de esos cuatro puntos, y el síntoma te dice cuál. Las tablas que faltan son un problema de análisis y ningún nuevo estilo lo va a arreglar. El texto sin estilo es un problema de envoltura y no tiene nada que ver con el analizador. Una etiqueta `<script>` que sobrevive es un problema de saneado, y es el único de los cuatro que puede hacer daño a alguien.

## Etapa uno: analizar, y qué contiene realmente un árbol de sintaxis

Un analizador lee los caracteres y construye un árbol. No HTML — un árbol de nodos tipados, cada uno con un puñado de campos, y sin ninguna etiqueta dentro. Toma cuatro líneas de Markdown:

```markdown
## Release 2.1

- [x] Tighten the allow-list
- [ ] Document the API

See the [changelog](CHANGELOG.md) for the rest.
```

Lo que produce el analizador se parece más a esto, escrito como un esquema:

```text
document
  heading (level: 2)
    text "Release 2.1"
  list (ordered: false, tight: true, marker: "-")
    item (checked: true)
      paragraph
        text "Tighten the allow-list"
    item (checked: false)
      paragraph
        text "Document the API"
  paragraph
    text "See the "
    link (destination: "CHANGELOG.md", title: null)
      text "changelog"
    text " for the rest."
```

Vale la pena nombrar varias cosas de ese esquema, porque cada una se convierte después en una diferencia visible en el HTML.

**Los nodos son de bloque o en línea.** Los de bloque son la forma del documento: `document`, `heading`, `paragraph`, `list`, `item`, `block_quote`, `code_block`, `thematic_break`, `html_block`. Los en línea son el contenido de un bloque: `text`, `emphasis`, `strong`, `code`, `link`, `image`, `softbreak`, `linebreak`, `html_inline`. La estructura de bloque se determina primero, en una sola pasada sobre las líneas; el contenido en línea se analiza después, dentro de cada bloque. Ese diseño en dos fases es la razón por la que un `*` suelto al final de un párrafo no puede volver cursivo el encabezado siguiente, y por la que una fila de tabla no puede contener una lista.

**Cada nodo lleva posiciones de origen.** Línea y columna de inicio y de fin. Nadie las ve en el resultado, pero son lo que permite que la vista previa de un editor se desplace en sincronía con el texto, lo que deja a un linter decir «línea 47, columna 3», y lo que permite que una herramienta informe en qué línea estaba un enlace roto. Un conversor que descarta las posiciones no puede decirte dónde salió mal algo.

**Algunos nodos llevan atributos estructurales que cambian el renderizado.** Un nodo `list` registra si está ordenada, en qué número empieza, y si es *tight* o *loose*. Eso lo deciden las líneas en blanco de tu origen: viñetas sin línea en blanco entre ellas forman una lista tight, y los elementos de una lista tight se renderizan sin envolturas `<p>`. Pon una línea en blanco entre dos viñetas y cada elemento de la lista se vuelve loose, gana un párrafo, y toda la lista crece en altura. Ese es el «por qué cambió el espaciado» más común en Markdown, y ocurre en el árbol, antes de que exista ningún HTML.

Un nodo `code_block` registra el carácter de la valla, su longitud y la *cadena de información* — el `js` en ` ```js `. La cadena de información es texto libre; el analizador no sabe que es el nombre de un lenguaje. Un nodo `item` en un analizador con extensiones de GitHub registra si su casilla estaba marcada. Un nodo `link` registra un destino y un título opcional, ya sin escapar.

**Las definiciones de referencia de enlace no sobreviven como nodos.** Escribe `[changelog][cl]` en un párrafo y `[cl]: https://example.com/log` al final del archivo, y el analizador consume por completo la línea de definición y resuelve el destino dentro del nodo `link`. Nada en el árbol recuerda que el enlace se escribió en estilo referencia. De ahí se siguen dos consecuencias: una definición que nadie referencia desaparece sin dejar rastro, y una referencia con una errata en la etiqueta no es un error — es texto literal, y `[changelog][cl2]` se muestra tal cual, corchetes incluidos.

**El HTML crudo es una cadena opaca.** Un `<div>` o un `<script>` en tu Markdown se convierte en un nodo `html_block` cuyo contenido es el texto crudo. El analizador de Markdown no lo analiza en elementos, no comprueba que las etiquetas estén balanceadas, y no sabe qué dice. Es una caja sellada que se lleva hasta el resultado, y por eso el sanitizador de la etapa tres tiene que hacer su propio análisis de HTML en lugar de inspeccionar el árbol.

## Dónde se separan los dialectos de Markdown

El dialecto es una propiedad del analizador, y se decide aquí. Cada diferencia de abajo es una divergencia real y enumerable entre especificaciones e implementaciones con nombre.

**CommonMark puro no tiene tablas.** Ni listas de tareas, ni tachado, ni enlace automático de URLs sueltas. Tiene encabezados ATX, encabezados setext, código con valla e indentado, listas, citas, líneas horizontales, énfasis, enlaces, imágenes y HTML crudo. Esa es la especificación. Entrégale una tabla de barras a un analizador estrictamente conforme y obtienes un párrafo con caracteres de barra, dispuesto como una sola línea de texto corrido, sin ningún tipo de aviso.

**GitHub Flavored Markdown añade cinco extensiones sobre CommonMark:** tablas, elementos de lista de tareas, tachado con `~~`, literales de enlace automático, y HTML crudo restringido, que filtra una lista corta de etiquetas en la etapa de análisis. Es una especificación por derecho propio, publicada como una diferencia contra CommonMark, y por eso «¿soporta GFM?» es una pregunta con una respuesta clara de sí o no. Nota que la quinta extensión no sustituye a la etapa tres: nombra un puñado de etiquetas, no una lista blanca.

**Las notas al pie no están en ninguna de las dos especificaciones.** Un conversor que soporta `[^1]` lo hace como extensión, y las extensiones no se ponen de acuerdo entre sí sobre dónde puede vivir el texto de la nota, si una nota puede contener una lista, o cómo es el enlace de vuelta. Las notas al pie son la función con más probabilidades de sobrevivir a una conversión y desaparecer en la siguiente.

**El énfasis dentro de una palabra difiere.** CommonMark decide deliberadamente no tratar `_` dentro de una palabra como énfasis, así que `snake_case_name` queda intacto. Conversores más antiguos, incluidos algunos de JavaScript previos a CommonMark, ponen en cursiva la mitad de ese identificador. Si tu documento está lleno de nombres de variables, el analizador que elijas marca la diferencia entre legible y estropeado.

**Los saltos de línea suaves son una opción, no una regla.** Un solo salto de línea dentro de un párrafo es un nodo `softbreak`. CommonMark lo renderiza como un salto de línea en el HTML, que el navegador colapsa en un espacio. marked y markdown-it exponen ambos una opción `breaks` que lo renderiza como `<br>` en su lugar; Python-Markdown hace lo mismo con su extensión `nl2br`. El mismo archivo, dos configuraciones, dos documentos — uno donde tu bloque de dirección son tres líneas y otro donde es una sola.

**Los dialectos extendidos van todavía más lejos.** El propio Markdown de Pandoc añade listas de definición, divs con valla, citas bibliográficas y matemáticas en línea. La extensión `attr_list` de Python-Markdown deja adjuntar clases e ids a los elementos desde el origen. PHP Markdown Extra y MultiMarkdown tienen cada uno sus propias variaciones de sintaxis de tabla. Todos estos se analizan en la herramienta que los define y degradan a puntuación literal en cualquier otra parte, que es lo que la gente quiere decir cuando dice que un archivo Markdown no es portable. La cuestión del dialecto merece entenderse bien, porque [los dialectos difieren de formas concretas y enumerables](/blog/commonmark-gfm-and-the-flavours) y las diferencias son todas silenciosas.

## Etapa dos: renderizar, y las decisiones que nadie te preguntó

El renderizador recorre el árbol y escribe etiquetas. Aquí es donde el conversor empieza a inventar, porque el HTML necesita detalles que Markdown nunca expresó. A partir del árbol de arriba, un renderizador con extensiones de GitHub podría escribir:

```html
<h2 id="doc-release-21">Release 2.1</h2>
<ul class="contains-task-list">
  <li class="task-list-item"><input type="checkbox" checked disabled> Tighten the allow-list</li>
  <li class="task-list-item"><input type="checkbox" disabled> Document the API</li>
</ul>
<p>See the <a href="CHANGELOG.md">changelog</a> for the rest.</p>
```

Ni uno solo de esos ids, clases o elementos `input` existía en tu origen. Son decisiones de la casa, y por eso dos conversores pueden ser ambos correctos y aun así no estar de acuerdo.

**Los ids de encabezado son el borde más afilado.** Ninguna especificación dice que los encabezados llevan un `id`, y ninguna define cómo el texto se convierte en slug. Las implementaciones pasan a minúsculas, quitan la puntuación, cambian los espacios por guiones y añaden un contador a los duplicados — pero no se ponen de acuerdo sobre qué puntuación quitar ni cómo se ve el contador. Un renderizador elimina el punto y produce `release-21`; otro lo conserva y produce `release-2.1`; un tercero prefija todo, como `doc-release-21` arriba, para que el id no choque con el propio marcado de la página. Los enlaces de anclaje escritos a mano contra un esquema se rompen en silencio contra otro, y «en silencio» aquí significa que el navegador no se desplaza a ningún sitio y no muestra ningún error.

**Los bloques de código reciben una clase, y la convención no es universal.** El resultado habitual es `<pre><code class="language-js">`, tomando la primera palabra de la cadena de información. Algunos renderizadores escriben `class="js"`, algunos añaden un atributo `data-lang`, algunos emiten un `<div>` envolvente con el lenguaje dentro. El resaltado es otra decisión aparte: o el conversor ejecuta un resaltador en el momento de la conversión y emite spans con nombres de clase, o emite un elemento de código plano y espera que un script lo coloree en el navegador. El primero produce un archivo que funciona sin conexión; el segundo produce un archivo que necesita la red y una etiqueta script. Esa elección, y [el manejo de bloques de código en general](/blog/code-blocks-in-markdown), decide si tus ejemplos sobreviven a ser enviados por correo.

**El texto y las URLs se escapan, y el escape difiere.** Los nodos de texto reciben `&`, `<` y `>` sustituidos por entidades. Los valores de atributo reciben las comillas sustituidas. Los destinos de enlace se codifican por porcentaje, y las implementaciones no coinciden en si un destino que ya contiene un `%` se deja tal cual o se vuelve a codificar — lo segundo convierte una URL que funcionaba en un 404. Los renderizadores también difieren en si normalizan las mayúsculas de los escapes hexadecimales y en si codifican caracteres que son legales en una URL pero feos.

**La tipografía es opcional.** La opción `typographer` de markdown-it y la extensión `smart` de Pandoc convierten las comillas rectas en curvas, `--` en una raya, y `...` en elipsis. Agradable en prosa, equivocado en un documento lleno de líneas de comandos, donde una comilla curva pegada en una terminal falla con un mensaje que no menciona las comillas.

**El marcado de las listas de tareas varía.** Algunos renderizadores emiten un `<input type="checkbox" disabled>` real, algunos emiten un `<span>` con estilo, algunos dejan el texto literal `[x]` porque nunca implementaron la extensión. Esto importa dos veces: una por el aspecto, y otra en la etapa tres, porque un elemento input es justo el tipo de cosa que la lista blanca de un sanitizador tiende a eliminar.

**Las tablas reciben atributos o clases de alineación.** Los dos puntos en la fila delimitadora de una tabla GFM se convierten en atributos `align="left"` en las celdas, o en una clase por columna, o en estilos en línea — tres formas de expresar la misma intención, cada una tratada de forma distinta por un sanitizador. Las tablas cargan más de esto por línea que cualquier otra cosa en Markdown, que es por lo que [las tablas son lo que más se rompe en el camino](/blog/markdown-tables-that-survive-conversion).

Lo que devuelve el renderizador es un fragmento. Encabezados, párrafos y listas, sin doctype, sin head, sin estilos, y sin ninguna promesa de que nada de eso sea seguro.

## Etapa tres: sanear, el trabajo que la gente olvida

Markdown deja pasar HTML crudo por diseño. Una etiqueta `<script>` en un archivo .md no es un error; es contenido, y un renderizador fiel la copia en el resultado. Lo mismo hace un atributo `onerror` en una imagen, y lo mismo hace una URL `javascript:` en un enlace. Si el Markdown viene de cualquier sitio que no controlas — una pull request, un issue, un cliente, la salida de un modelo — el fragmento que acabas de producir es HTML no confiable, y abrirlo en un navegador lo ejecuta.

Sanear consiste en pasar ese fragmento por una lista blanca y descartar todo lo demás. Tiene que ser una lista blanca. Una lista negra de etiquetas conocidas como malas pierde ante el siguiente truco de codificación, la siguiente variante en mayúsculas, el siguiente espacio de nombres donde un atributo significa algo distinto.

## Cómo es realmente una lista blanca de sanitizador

Una lista blanca son tres listas y una regla, no una sola lista de etiquetas.

**La lista de etiquetas.** Todo lo que Markdown puede producir legítimamente, y nada más: `p`, `h1` a `h6`, `ul`, `ol`, `li`, `blockquote`, `pre`, `code`, `em`, `strong`, `del`, `a`, `img`, `hr`, `br`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `sup`, `sub`. Añade `input` si quieres casillas de listas de tareas, `details` y `summary` si tus documentos las usan, `span` y `div` si permites contenedores de HTML crudo en absoluto.

**La lista de atributos, por etiqueta.** Esta es la parte que la gente se equivoca al escribir una sola lista global. `a` recibe `href`, `title`, `rel` y posiblemente `target`. `img` recibe `src`, `alt`, `title`, `width` y `height`. `th` y `td` reciben `colspan`, `rowspan` y `align`. `code` recibe `class`, restringida al prefijo `language-` si tienes cuidado. `input` recibe `type`, `checked` y `disabled`, y `type` queda fijo en `checkbox`. Los encabezados reciben `id`. Nada más recibe nada.

**La lista de esquemas de URL.** `http`, `https` y `mailto` para enlaces; añade `data:` para imágenes solo si has decidido que quieres imágenes incrustadas, y en ese caso restríngelo a tipos de medio de imagen. Todo lo demás fuera: `javascript:`, `vbscript:`, `file:`, y `data:text/html`, que es un documento entero disfrazado de URL. Los esquemas tienen que comprobarse después de deshacer el escape y de quitar espacios en blanco y caracteres de control, porque `java&#09;script:` es una URL que un navegador seguirá encantado.

**La regla para todo lo demás.** Una etiqueta desconocida o se descarta entera, o se desenvuelve — se quita la etiqueta y se conservan sus hijos. Desenvolver conserva más de tu texto; descartar es más seguro para contenedores cuyo contenido nunca se pensó como prosa. Elige uno a propósito, porque la diferencia aparece como contenido duplicado o contenido que falta el día en que el documento de alguien contenga un `<template>`.

## Qué elimina un sanitizador, y por qué cada cosa

| Dropped | Why |
| --- | --- |
| `<script>` | Se ejecuta al abrir. Toda la razón de que exista esta etapa |
| Atributos `on*` | `onerror`, `onload`, `onmouseover` se ejecutan sin ninguna etiqueta script |
| URLs `javascript:` y `data:text/html` | Un enlace o un origen de imagen que ejecuta código en vez de traer un recurso |
| `<iframe>`, `<object>`, `<embed>` | Cargan y ejecutan contenido de terceros dentro de tu documento |
| `srcdoc` | Un documento HTML entero metido de contrabando en un atributo |
| `<style>` y atributos `style` | Pueden reposicionar y disfrazar elementos; a menudo se eliminan, a veces se permiten con una lista blanca de propiedades |
| `<form>`, `<button>`, `formaction` | Le pide algo al lector y lo envía a otro sitio |
| `<base>` | Una sola etiqueta que reescribe en silencio cada URL relativa del documento |
| `<meta http-equiv="refresh">` | Redirige al lector fuera de tu documento |
| `<svg>` y `<math>` | Las reglas de análisis de contenido ajeno difieren de las del HTML, y ambas pueden llevar scripts y su propia sintaxis de enlace |
| `id` y `name` sin prefijo | DOM clobbering: `id="attributes"` sombrea una propiedad real del DOM y rompe scripts que la leen |

Dos detalles decides si un sanitizador aguanta en la práctica.

**Dónde se ejecuta.** Un sanitizador en el navegador se apoya en el propio analizador del navegador, que es el mismo que después renderizará el documento — una ventaja real, porque ve el marcado como lo va a ver el navegador. Uno en el servidor tiene que analizar el HTML por su cuenta, con su propia idea de cómo se anidan las etiquetas malformadas. Si una herramienta convierte en ambos sitios, los dos tienen que coincidir, o el mismo documento se renderiza distinto según quién lo pidió. Aquí también viven los problemas de mutación: si el análisis del sanitizador y el del navegador no coinciden en un caso límite de anidamiento, limpiar el marcado puede producir algo que, al volver a analizarse en el navegador, se convierte en un marcado distinto del que se aprobó.

**Los ids de encabezado, otra vez.** Un `id="title"` desnudo sombrea una propiedad del DOM, así que un sanitizador de navegador lo elimina mientras que un analizador del lado del servidor lo conserva: un documento, dos formas, y enlaces de anclaje que funcionan en uno y no en el otro. Prefijar los ids resuelve ambos problemas a la vez. TransformPipe sanea con DOMPurify en el navegador y con el paquete `xss` en el servidor contra una misma lista blanca compartida, y sus ids de encabezado llevan un prefijo `doc-`.

Una última cosa sobre esta etapa: sanear es visible. Elimina cosas. Las casillas desaparecen si `input` no está en la lista, un bloque `<details>` se aplana en su contenido, un diagrama incrustado se convierte en nada. Eso no es un fallo — es la lista blanca haciendo su trabajo — pero significa que el resultado hay que leerlo, no suponerlo.

## Etapa cuatro: envolver, porque un fragmento no es una página

Lo que devuelven el renderizador y el sanitizador es un fragmento: `<h1>Title</h1><p>Text</p>` y nada alrededor. Pégalo en una página existente y funciona perfectamente. Guárdalo como .html, envíaselo a alguien, y el navegador hace lo que puede con un documento que nunca se declaró a sí mismo.

Un documento completo necesita un conjunto pequeño y fijo de cosas, y cada una tiene un fallo específico asociado.

**`<!doctype html>`, en la primera línea.** Sin él el navegador entra en modo quirks, que es un motor de renderizado distinto con un modelo de caja distinto, una herencia de celdas de tabla distinta y un manejo de altura de línea distinto. Tu documento no quedará roto exactamente — quedará espaciado de forma sutil e inexplicable respecto a la vista previa que aprobaste.

**`<html lang="en">`.** El atributo de idioma es lo que usa un lector de pantalla para elegir voz y pronunciación, y lo que usa el navegador para la separación de sílabas y las comillas. Omítelo y un documento en inglés puede leerse en voz alta con la fonética de lo que sea que traiga el lector por defecto.

**`<meta charset="utf-8">`, dentro de los primeros 1024 bytes.** Este es el que produce el síntoma clásico. Tu archivo es UTF-8; sin una declaración, un navegador adivina, y una mala suposición convierte cada raya en `â€"`, cada comilla curva en `â€™` y cada nombre acentuado en dos caracteres de ruido. La declaración tiene que llegar pronto, antes de cualquier contenido sustancial, porque el navegador deja de olfatear en cuanto ha empezado.

**`<title>`.** Nombra la pestaña del navegador, es lo que sugiere un diálogo de «guardar como» para el nombre de archivo, y es lo que muestra la vista previa de un enlace en un cliente de chat. Un documento sin título llega a la carpeta de descargas de alguien como su propia ruta.

**`<meta name="viewport" content="width=device-width, initial-scale=1">`.** Sin él, un teléfono presenta la página con un ancho parecido al de escritorio y luego reduce el zoom para que quepa, así que tu documento se abre legible solo si haces zoom con los dedos. La mitad de la gente a la que le envíes un documento lo abrirá primero en un teléfono.

**Una hoja de estilos.** Aquí está la diferencia entre convertido y con pinta de convertido. Lo que necesita no es glamuroso: una medida legible para que las líneas no corran todo el ancho de un monitor, una altura de línea, bordes y relleno en las celdas de tabla, `overflow-x: auto` en `pre` para que una línea de código larga haga scroll en vez de estirar la página, `max-width: 100%` en las imágenes para que una captura de pantalla no empuje el diseño hacia un lado, y un bloque `@media print` si alguien va a imprimirlo.

**Incrusta los estilos si el archivo tiene que viajar.** Un `<link>` a una hoja de estilos o a una fuente en un CDN significa que el documento solo se ve bien donde tiene conexión, y significa que abrir el archivo le dice a un tercero que se abrió. Un archivo autocontenido lleva sus estilos en un elemento `<style>` y no pide nada. Es un archivo más grande, y es la única versión que se renderiza igual sin conexión, en un portátil bloqueado, y dentro de cinco años cuando la URL del CDN se haya movido.

**Las rutas relativas se resuelven contra la nueva ubicación del archivo.** Una imagen escrita como `images/diagram.png` se resuelve en relación a donde quede ahora el .html, así que se rompe en el momento en que el archivo se mueve o se adjunta a un correo. Solo una URL absoluta o un URI de datos viaja con el documento. Lo mismo se aplica a `[changelog](CHANGELOG.md)`: se convierte en un `href` a un archivo .md, y un navegador al que le entregan un archivo .md normalmente lo descarga en vez de renderizarlo, a menos que también hayas convertido ese archivo y reescrito la extensión.

## Cómo se ve un fallo en cada etapa, en pantalla

El síntoma identifica la etapa. Esta es la tabla que conviene guardar.

| Stage | What you see | What actually happened | How to check |
| --- | --- | --- | --- |
| Analizar | Un párrafo lleno de caracteres `\|` donde debería haber una tabla | El analizador ejecuta CommonMark, no GFM; las tablas nunca se reconocieron | Mira el origen HTML buscando `<table>`. Si no hay un elemento tabla, ningún estilo va a ayudar |
| Analizar | `[x]` y `[ ]` literales al principio de los elementos de lista | La extensión de listas de tareas no está activada | Busca `type="checkbox"` en el resultado |
| Analizar | `[^1]` literal en el texto y ninguna nota al pie | Las notas al pie son una extensión y este analizador no la tiene | Comprueba el dialecto o la lista de extensiones de la herramienta |
| Analizar | Una dirección de tres líneas colapsada en una | Los saltos simples son suaves; la opción `breaks` está apagada | Busca `<br>` en el origen; no habrá ninguno |
| Analizar | Una lista anidada renderizada plana, o como bloque de código | La sangría de continuación no coincide con lo que espera el analizador | Cuenta los espacios; el árbol, no el CSS, está mal |
| Renderizar | Los enlaces de anclaje no llevan a ningún sitio | Los slugs de id de encabezado difieren de aquellos contra los que se escribieron tus enlaces | Compara un `href="#..."` contra el `id` del encabezado |
| Renderizar | Bloques de código presentes pero sin colorear | El renderizador emitió una clase y dejó el resaltado a un script que no está en el archivo | Busca `class="language-…"` y una etiqueta script |
| Renderizar | Comillas curvas en una línea de comandos que ahora falla al ejecutarse | La sustitución tipográfica estaba activada | Busca `’` y `“` en el resultado |
| Renderizar | Una URL que da 404 aunque funcionaba en el origen | El destino se codificó por porcentaje dos veces | Compara el `href` con el destino Markdown carácter a carácter |
| Sanear | Una alerta, o cualquier cosa ejecutándose | Nada saneó el fragmento. El documento ejecuta código de su autor | Busca `<script` y manejadores `on` en el origen antes de abrirlo |
| Sanear | Casillas desaparecidas, bloques `<details>` aplanados, un embed que falta | La lista blanca hizo su trabajo y esas etiquetas no estaban en ella | Compara los fragmentos previo y posterior al saneado si la herramienta muestra ambos |
| Sanear | El mismo documento se renderiza distinto en dos máquinas | Los sanitizadores del navegador y del servidor ejecutan listas blancas distintas | Convierte el mismo archivo en ambos sitios y compara el HTML |
| Envolver | Un muro de texto serif a todo el ancho de la ventana | Te entregaron un fragmento, no un documento. Sin doctype, sin head, sin estilos | Mira la primera línea del archivo buscando `<!doctype html>` |
| Envolver | `â€"` y `â€™` esparcidos por la prosa | Sin declaración de codificación, así que el navegador adivinó mal | Comprueba si hay `<meta charset="utf-8">` en el head |
| Envolver | Legible solo tras hacer zoom con los dedos en un teléfono | Sin etiqueta meta de viewport | Comprueba el head; luego ábrelo en un teléfono, no en un emulador |
| Envolver | Iconos de imagen rotos tras enviar el archivo por correo | Rutas de imagen relativas que ya no se resuelven | Mira los valores de `src`; cualquiera que no sea absoluto o un URI de datos se romperá |
| Envolver | Correcto con la red activada, sencillo con ella apagada | Los estilos o las fuentes están enlazados desde un CDN en vez de incrustados | Apaga la red y vuelve a abrir el archivo |

## Comparativa rápida: dónde pueden ejecutarse las cuatro etapas

Las cuatro etapas ocurren donde tú decidas. Lo que cambia es cuáles de las cuatro hace la herramienta por ti, y cuáles deja sobre tu mesa.

| Where you convert | Best for | Stages it handles | Price |
| --- | --- | --- | --- |
| Un conversor de navegador | Un archivo, ahora, con alguien a quien enviárselo | Las cuatro, incluida una envoltura autocontenida | Gratis |
| Una biblioteca en tu propio código | Renderizar dentro de una aplicación que estás construyendo | Analizar y renderizar; sanear y envolver son cosa tuya | Gratis, MIT o BSD según la biblioteca |
| Conversor de línea de comandos | Conversión guionizada y repetible de archivos en disco | Analizar, renderizar y opcionalmente envolver; sanear casi nunca | Gratis, código abierto; Pandoc es GPL |
| Generador de sitios estáticos | Un conjunto de documentos que se enlazan entre sí | Las cuatro, más navegación, sobre todo un directorio | Gratis, código abierto |
| API, CLI o acción de CI | Conversión dentro de una compilación sin navegador presente | Las cuatro, si el servicio lo hace; el objetivo es no instalar nada en el runner | Gratis con TransformPipe; varía en otros sitios |
| La exportación de un editor | El archivo que tienes abierto en ese momento | Analizar y renderizar; la envoltura depende por completo de la extensión | Gratis para VS Code; los editores de escritorio varían, revisa cada fabricante |

## Dónde ejecutar la conversión

### Un conversor de navegador — las cuatro etapas, un archivo, nada subido

Un conversor que corre en el navegador hace el análisis, el renderizado, el saneado y la envoltura en tu propia máquina y te entrega un archivo .html terminado. Sin haber iniciado sesión, el archivo nunca se envía a ningún sitio: se lee, se convierte y se renderiza localmente, algo que puedes verificar mirando cómo la pestaña de red no hace nada mientras trabaja.

| Pros | Cons |
| --- | --- |
| Produce un documento completo, no un fragmento | Un documento a la vez, o varios encadenados en uno |
| Nada se sube, así que el origen se queda en tu máquina | Un archivo muy grande queda limitado por la memoria de la máquina |
| Sanea contra una lista blanca fija antes de que abras el resultado | Sin lenguaje de plantillas, así que la envoltura es de la herramienta, no tuya |
| Sin instalación y nada que configurar | No es un paso de compilación: alguien tiene que estar ahí sentado |

**Precio:** gratis. Una cuenta añade historial, compartir y una API, también gratis.

**Detalles técnicos y funciones**

- GitHub Flavored Markdown en la etapa de análisis: tablas, listas de tareas, tachado, enlaces automáticos, código con valla
- Los ids de encabezado llevan un prefijo `doc-`, así que sobreviven tanto al saneado del navegador como al del servidor
- La exportación es autocontenida: doctype, head, codificación, viewport, `<style>` en línea, sin peticiones externas
- Una vista de «origen HTML», así puedes leer la envoltura y ver qué pasó con cualquier HTML crudo antes de enviarlo
- Se descarga como `.html`, `.md` o texto plano, o se imprime a PDF con el propio diálogo del navegador — y la descarga en texto toma sus propias decisiones sobre encabezados, enlaces y tablas, que es [lo que cuesta aplanar Markdown a texto plano](/blog/markdown-to-plain-text)

**¿Para quién es?** Para cualquiera cuyo siguiente paso sea «enviarle esto a una persona», y para cualquiera que convierta un documento que prefiere no subir — un contrato, la nota de un paciente, un plan sin publicar.

### Una biblioteca en tu propio código — dos etapas, y dos para ti

marked y markdown-it en JavaScript, Python-Markdown y markdown-it-py en Python, Goldmark en Go, commonmark.js cuando necesitas el comportamiento de referencia. Estas hacen bien el análisis y el renderizado y se detienen ahí, por diseño: una biblioteca no sabe si su resultado va a entrar en una página existente o en un archivo independiente, así que no puede escribir tu envoltura, y no sabe si el origen es de confianza, así que la mayoría no sanea en silencio.

| Pros | Cons |
| --- | --- |
| Control total de las opciones: dialecto, saltos, tipografía, ids de encabezado | Sanear es tu trabajo, y la omisión es silenciosa |
| Suficientemente rápido para correr por cada petición | Envolver es tu trabajo, y el fragmento parece roto sin ello |
| Puntos de extensión para renderizar nodos personalizados | Dos bibliotecas, dos valores por defecto de dialecto, dos conjuntos de errores |
| Comprobable dentro de tu propia suite | Ahora eres tú quien asume la decisión de seguridad |

**Precio:** gratis, código abierto. marked y markdown-it tienen licencia MIT; Python-Markdown y commonmark.js tienen licencia BSD.

**Detalles técnicos y funciones**

- markdown-it escapa el HTML crudo por defecto, que es la opción segura; marked lo deja pasar y documenta que conviene combinarlo con DOMPurify
- Ambos exponen una opción `breaks` para los saltos de línea suaves y opciones para los ids de encabezado
- markdown-it te da un flujo de tokens y marked un lexer, así que puedes inspeccionar el árbol antes de renderizar
- Las extensiones de Python-Markdown cubren tablas, notas al pie y listas de atributos

**¿Para quién es?** Para desarrolladores que renderizan Markdown dentro de una aplicación donde el documento que lo rodea ya existe — una caja de comentarios, un panel de vista previa, una compilación de documentación con su propia plantilla.

### La línea de comandos — repetible, guionizable, y silenciosa sobre seguridad

Pandoc es la respuesta general, y la mayoría de los lenguajes traen un envoltorio de línea de comandos alrededor de su biblioteca. Un conversor de línea de comandos es la herramienta correcta cuando la misma conversión tiene que repetirse la semana que viene, sobre archivos que viven en disco, sin nadie en una pestaña de navegador.

| Pros | Cons |
| --- | --- |
| Repetible y guionizable sobre muchos archivos | Requiere instalación y una terminal |
| `--standalone` de Pandoc escribe un documento real, y `--embed-resources` incrusta recursos | El HTML crudo pasa sin cambios: sanear no forma parte del trabajo |
| Las plantillas dan control exacto sobre la envoltura | Sus dialectos de Markdown difieren de GFM de formas que sorprenden |
| Funciona donde no hay navegador en absoluto | Más herramienta de la que necesita un solo archivo |

**Precio:** gratis, código abierto. Pandoc tiene licencia GPL.

**Detalles técnicos y funciones**

- Selección explícita de lector, así que puedes pedir `commonmark`, `gfm` o el propio dialecto de Pandoc en vez de adivinar
- `--standalone` para la envoltura, `--template` para la tuya, `--embed-resources` para un resultado en un solo archivo
- `--sandbox` restringe el acceso al sistema de archivos al convertir archivos en los que no confías
- Escribe formatos distintos de HTML a partir del mismo origen, que es la razón real para instalarlo

**¿Para quién es?** Para cualquiera que convierta según un calendario, en lote, o hacia formatos más allá de HTML.

### Un generador de sitios estáticos — las cuatro etapas, sobre un directorio

Hugo, Eleventy, MkDocs, Docusaurus y Jekyll convierten todos Markdown a HTML, y ninguno de ellos es un conversor. Son sistemas de compilación: esperan un directorio, un archivo de configuración, plantillas y un destino de despliegue, y devuelven navegación, búsqueda y enlaces cruzados.

| Pros | Cons |
| --- | --- |
| Una envoltura consistente en cada página | Sobrecarga enorme para un solo archivo |
| Navegación, feeds y enlaces entre documentos | Un archivo de configuración y un paso de compilación que mantener para siempre |
| Temas, así que la pregunta de la hoja de estilos queda respondida | El resultado es un sitio para desplegar, no un documento para enviar por correo |
| El analizador está fijado y es conocido | Su dialecto de Markdown es decisión del generador, no tuya |

**Precio:** gratis, código abierto.

**Detalles técnicos y funciones**

- El generador se queda con la etapa cuatro por completo, que es por lo que cada página se ve igual
- El front matter aquí es datos, no contenido: alimenta la plantilla en vez de aparecer en el texto
- La mayoría fija un analizador concreto — Hugo usa Goldmark, MkDocs usa Python-Markdown — así que el dialecto es propiedad del generador

**¿Para quién es?** Para cualquiera que publique un conjunto de documentos que se enlazan entre sí. Para un archivo y un destinatario, es la forma completamente equivocada.

### Una API, un CLI o una acción de CI — conversión sin navegador de por medio

Cuando la conversión tiene que ocurrir dentro de una pull request, una compilación nocturna o la llamada a una herramienta de un asistente, no hay nadie que haga clic en nada. Lo que necesitas son esas mismas cuatro etapas disponibles por cable o como un binario en el que el runner ya confía.

| Pros | Cons |
| --- | --- |
| Sin instalación en el runner de la compilación | Un salto de red, salvo que uses el CLI |
| La misma lista blanca y la misma envoltura que la herramienta interactiva, así que el resultado coincide | Dependes de que un servicio esté disponible |
| Encaja en la verificación de una pull request o en un trabajo de release | No es interactivo: lees el resultado después de los hechos, en un artefacto |

**Precio:** gratis con la API, el CLI, la GitHub Action y el servidor MCP de TransformPipe; varía en otros sitios.

**Detalles técnicos y funciones**

- El CLI no tiene dependencias, así que un runner no necesita un paso de instalación de paquetes
- La misma conversión es accesible desde una llamada REST, un shell, un paso de un flujo de trabajo o un asistente
- Como las cuatro etapas se ejecutan en el servidor, el resultado es el documento envuelto y saneado, no un fragmento

**¿Para quién es?** Para equipos que convierten como parte de una compilación — notas de versión, documentación generada, una vista previa renderizada adjunta a una pull request.

### La exportación de un editor — conveniente, y la envoltura es una lotería

VS Code trae una vista previa de Markdown construida sobre markdown-it, y las extensiones añaden exportación; [Markdown a HTML en VS Code](/blog/markdown-to-html-in-vs-code) explica qué escribe cada una alrededor del fragmento. Los editores de escritorio también exportan HTML. Si el archivo ya está abierto delante de ti, este es el camino más corto de texto a página.

| Pros | Cons |
| --- | --- |
| Ya instalado y ya mirando el archivo | El estilo de la vista previa suele no ser el estilo exportado |
| El dialecto de la vista previa se puede saber, porque el analizador tiene nombre | La calidad de la exportación depende por completo de la extensión que elegiste |
| Sin subir nada | Sanear generalmente no forma parte de ella |
| Sirve para un README o una nota | No es una cadena: convierte lo que está abierto |

**Precio:** gratis para VS Code y sus extensiones; los editores de escritorio los fija cada fabricante, así que revisa su propia página.

**Detalles técnicos y funciones**

- La vista previa de VS Code usa markdown-it, así que sigue CommonMark con las extensiones propias del editor encima
- Las extensiones de exportación difieren en si incrustan estilos, los enlazan, o escriben un fragmento
- Lo que muestra la vista previa lo estiliza el tema del editor, que no viaja con el archivo

**¿Para quién es?** Para desarrolladores que convierten un archivo de paso, y que van a abrir el resultado en otro sitio antes de enviarlo.

## Dónde falla la opción obvia, y qué cuesta

La opción obvia para un archivo es un conversor de navegador, y es la correcta con la frecuencia suficiente como para que valga la pena nombrar los fallos.

**Convierte un documento, no un proyecto.** Encadena varios archivos en uno y obtienes un documento largo; no obtienes un sitio con una barra lateral. Si la respuesta necesita navegación, el conversor es solo la primera etapa de un generador de sitios estáticos, y fingir lo contrario te cuesta una reconstrucción más adelante.

**La máquina es el límite.** La conversión del lado del navegador significa que el análisis, el renderizado y el saneado ocurren todos en una pestaña. Un archivo del tamaño de un libro con cientos de imágenes queda limitado por la memoria de esa pestaña, y el fallo es una rueda de carga, no un mensaje de error. La conversión del lado del servidor o de línea de comandos no tiene ese techo.

**No hay nada que diferenciar.** Una conversión que alguien hace a mano no está en control de versiones, no se puede repetir de forma idéntica el mes siguiente, y no puede hacer fallar una compilación. Si el mismo documento se publica una y otra vez, el clic es un pasivo y la API, el CLI o la acción son la solución.

**Un archivo autocontenido es un archivo grande.** Incrustar estilos, e imágenes como URIs de datos, puede multiplicar el tamaño varias veces. A cambio se renderiza igual sin conexión y no pide nada. Eso es un intercambio, y para una página servida desde un sitio web — donde una hoja de estilos compartida en caché es todo el punto — es el lado equivocado de ese intercambio.

**Sanear se lleva cosas que querías.** Una lista blanca fija no tiene forma de saber que el embed de tu documento era tuyo. Diagramas, reproductores incrustados y contenedores HTML escritos a mano salen como huecos. La cadena de trabajo honesta es convertir, leer el resultado, y devolver deliberadamente lo que la lista blanca eliminó.

**La envoltura es el gusto de otra persona.** Sin lenguaje de plantillas no hay tipografía de la casa, ni logotipo, ni portada. Para un documento que va a un cliente bajo una marca, esa es una limitación real, y un generador con plantillas es la respuesta incluso para una sola página.

**El front matter es una decisión del analizador que nadie documenta.** Un archivo de un sitio estático o de una app de notas suele empezar con una cabecera YAML, y ninguna especificación de Markdown dice qué es una cabecera. Así que se maneja en la etapa uno, según lo que decida hacer el analizador: consumirla, o tratarla como texto normal. El segundo resultado es el que ves, porque la cabecera llega al documento renderizado como contenido — por lo que conviene convertir un archivo de un directorio antes de convertir el directorio entero.

**Los ids de encabezado pueden no coincidir con los que asumen tus enlaces.** Prefijar los ids es la respuesta correcta para la seguridad y la equivocada para los enlaces de anclaje copiados de GitHub. Convierte un documento y haz clic en tus propios enlaces internos antes de confiar en un centenar.

## Cómo elegir

1. **Empieza por el destino, no por el formato.** Un documento para una persona necesita las cuatro etapas incluida la envoltura; un panel de vista previa dentro de tu app necesita solo dos, porque la página ya existe. Elige para el destino equivocado y acabarás escribiendo a mano un `<head>` al final de todo.
2. **Empareja el dialecto con el archivo antes que nada.** Si el documento tiene tablas, listas de tareas o notas al pie, confirma que el analizador las implementa, porque una extensión que falta produce prosa que parece plausible en vez de un error, y no lo notarás hasta que lo note un lector.
3. **Decide sobre el saneado antes de convertir un archivo que no escribiste tú.** Para tus propias notas es una no-cuestión. Para un README de la red, el documento de un cliente o la salida de un modelo, o el conversor sanea o lo haces tú — y si ninguno lo hace, abrir el resultado es ejecutarlo.
4. **Insiste en una envoltura que puedas leer.** Abre el origen HTML y busca el doctype, la codificación, la etiqueta viewport y dónde viven los estilos. Esas cuatro líneas predicen casi toda queja de «en mi máquina se veía bien» que recibirás después.
5. **Decide si el archivo puede necesitar la red.** Si se va a enviar por correo, archivar o abrir en un portátil bloqueado, incrusta todo; una sola fuente enlazada desde un CDN basta para que se renderice distinto para la persona a la que se lo enviaste.
6. **Cuenta las instalaciones frente a la frecuencia.** Una conversión puntual no debería exigir un gestor de paquetes; una compilación nocturna no debería exigir una pestaña de navegador y una persona en ella. Equivocarte al revés te cuesta o una tarde o una tarea recurrente.
7. **Prueba abriendo el resultado en otro sitio.** No en la vista previa de la herramienta — un navegador distinto, una máquina distinta, la red apagada, una vez en un teléfono. Esa sola prueba pesca fragmentos, codificaciones que faltan, enlaces de CDN y rutas de imagen rotas al mismo tiempo, y cuesta un minuto. Si todavía estás eligiendo entre herramientas, [la comparativa honesta es un artículo aparte](/blog/best-markdown-to-html-converters).

## Conclusión

Un conversor de Markdown a HTML es una cadena de cuatro etapas, y cada conversión decepcionante es una etapa identificable haciendo algo razonable que tú no querías: un analizador ejecutando un dialecto más pequeño, un renderizador inventando ids que no coinciden con tus enlaces, un sanitizador quitando un embed, o una envoltura que nunca se escribió porque una biblioteca decidió, con razón, no adivinar. Lee el resultado en vez de la lista de funciones, y léelo en la vista de origen HTML donde el doctype, la codificación y el HTML crudo que sobrevivió son todos visibles a la vez. Si quieres las cuatro etapas hechas en una sola pasada, en tu propia máquina, con un archivo autocontenido al final, [la conversión de Markdown a HTML de TransformPipe](/) es gratis, no necesita instalación, y no sube nada mientras no has iniciado sesión.

## Preguntas frecuentes

### ¿Qué le hace realmente a mi archivo un conversor de Markdown a HTML?

Analiza el texto en un árbol de nodos tipados, recorre ese árbol para escribir etiquetas HTML, filtra el resultado contra una lista blanca de etiquetas y atributos, y envuelve el fragmento en un documento completo. La primera etapa decide qué sintaxis existe siquiera, y la última decide si el archivo se abre correctamente para otra persona. Una herramienta puede hacer cualquier subconjunto de las cuatro y seguir llamándose conversor.

### ¿Por qué el mismo archivo Markdown produce HTML distinto en dos herramientas?

Porque dos de las etapas implican decisiones que ninguna especificación toma por ti. Los analizadores pueden estar ejecutando dialectos distintos, así que uno ve una tabla donde el otro ve un párrafo, y los renderizadores inventan ids de encabezado, clases de bloque de código y marcado de casillas según sus propias convenciones. Ambos resultados pueden ser HTML correcto y aun así no coincidir línea por línea.

### ¿Necesito sanear el Markdown que escribí yo mismo?

Para un archivo que redactaste y que solo tú vas a abrir, no — no hay nada dentro que no pusieras tú. Sanea en el momento en que el documento viene de otra persona, se ensambla a partir de varias fuentes, o se va a servir a otras personas, porque Markdown permite HTML crudo y el HTML crudo permite scripts. El coste de sanear un archivo seguro es nulo; el coste de no sanear uno inseguro es ejecutar el código de su autor.

### ¿Por qué desaparecieron las casillas de mi lista de tareas después de convertir?

Casi siempre porque la lista blanca del sanitizador no incluye `input`. GFM renderiza un elemento marcado como `<input type="checkbox" checked disabled>`, y una lista blanca conservadora descarta los elementos de formulario en bloque. Un conversor que soporta bien las listas de tareas permite `input` con `type` fijo en `checkbox` y nada más en él.

### ¿Qué tiene que estar en el head antes de que un archivo HTML se abra correctamente?

Un doctype en la primera línea, para que el navegador no caiga en modo quirks; `<meta charset="utf-8">` lo bastante pronto como para que se vea, para que los caracteres acentuados y las rayas no se conviertan en ruido; un título, porque eso nombra la pestaña y el archivo guardado; una etiqueta viewport, para que sea legible en un teléfono; y estilos, incrustados si el archivo tiene que viajar. Falta uno solo y el archivo se sigue abriendo — solo que no como lo viste.

### ¿Por qué dejan de funcionar mis enlaces de anclaje después de la conversión?

Porque los ids de encabezado son invención del renderizador, no tuya, y las reglas de slug difieren. Una herramienta convierte «Release 2.1» en `release-21`, otra en `release-2.1`, y una que prefija ids por seguridad produce algo distinto todavía. Convierte un documento y haz clic en cada enlace interno antes de confiar en el esquema.

### ¿Convertir Markdown a HTML cambia las palabras?

Puede. Las opciones tipográficas reescriben las comillas rectas como curvas y `--` como una raya, una opción `breaks` convierte los saltos simples en `<br>`, y las definiciones de enlace sin referenciar desaparecen del todo. El texto es el mismo para un lector y no es el mismo para una terminal, que es por lo que las líneas de comandos en un documento convertido merecen revisarse carácter a carácter.
