---
title: "Turndown y cinco bibliotecas de HTML a Markdown: qué pierden"
description: "Seis bibliotecas comparadas en tablas, listas anidadas, bloques de código y espacios, con addRule, keep y remove de Turndown sobre el HTML que los necesita."
date: 2026-08-21
tag: Código
keywords: biblioteca html a markdown, turndown, turndown addrule, node-html-markdown, html-to-md, html2text python, pandoc html a markdown
---

El HTML que tienes que convertir nunca es el HTML del README. Tiene un `<div class="callout">` que significa algo, un bloque de código hecho de doscientos elementos `<span>`, una tabla con una celda de cabecera combinada, y un párrafo vacío cada tres elementos porque un CMS lo puso ahí. Todas las bibliotecas de esta página van a convertir esa página en Markdown. Van a producir cinco archivos distintos, y las diferencias no son cosméticas.

### Resumen rápido

Elige según la forma de la entrada y dónde corre el código. **Turndown** es la opción por defecto en JavaScript porque sus reglas se pueden sustituir elemento por elemento, que es lo único que hace manejable un HTML poco corriente — pero las tablas necesitan `turndown-plugin-gfm`. **node-html-markdown** lleva su propio analizador (`node-html-parser`), así que corre donde no hay DOM y trata las tablas sin plugin. **html-to-md** es la opción pequeña y sin dependencias, y su valor por defecto de `skipTags` ya descarta el mobiliario de la página. **html2text** es la respuesta en Python cuando la salida es para leer y no para volver a convertir. **Pandoc** como subproceso es la respuesta cuando Markdown no es el último formato al que tiene que llegar el documento.

El fallo que atrapa a la gente no es una función que falte. Es la suposición de que estas bibliotecas son intercambiables, así que la elección se puede hacer tarde y cambiar barato. No se puede: la configuración en este terreno es código, no flags, y el código es distinto en cada biblioteca. Una regla que convierte `<div class="warning">` en una cita son treinta líneas contra la API de Turndown y treinta líneas distintas contra la de node-html-markdown.

Lo segundo que conviene saber antes de instalar nada es cuál de estas bibliotecas necesita un DOM. Turndown trabaja a través de uno — en Node trae `@mixmark-io/domino` como dependencia para suministrarlo. Eso es cómodo, y también es una restricción sobre dónde puede correr el código y cuánta memoria cuesta un documento grande. Las bibliotecas que llevan su propio analizador hacen el cambio contrario. Si estás eligiendo entre herramientas y no entre bibliotecas, [la comparativa más amplia de conversores de HTML a Markdown](/blog/best-html-to-markdown-converters) cubre las extensiones, las CLI y las opciones alojadas; este artículo trata del código que importas.

## Seis bibliotecas, y qué es cada una

Cuatro de estas son bibliotecas que llamas, una es un paquete de Python con una CLI pegada, y una es un binario al que le haces shell. Esa distinción importa más que cualquier función de la tabla, porque decide qué pasa cuando la conversión falla: una biblioteca lanza una excepción, y un subproceso devuelve un código de salida y una línea en el error estándar que alguien tiene que leer.

| Biblioteca | Lenguaje | Mejor para | Capacidad clave | Licencia |
| --- | --- | --- | --- | --- |
| Turndown | JavaScript | Control elemento a elemento sobre HTML raro | `addRule`, `keep`, `remove`, y tres opciones de sustitución | Gratis, MIT |
| turndown-plugin-gfm | JavaScript | Tablas, tachado y listas de tareas en Turndown | `gfm`, `tables`, `strikethrough`, `taskListItems` | Gratis, MIT |
| node-html-markdown | TypeScript | Volumen, y entornos sin DOM | Incluye `node-html-parser`; un traductor por elemento | Gratis, MIT |
| html-to-md | JavaScript | Un conversor que es un detalle dentro de un bundle | Sin dependencias; `skipTags` y `aliasTags` | Gratis, MIT |
| html2text | Python | Salida de texto legible desde un script o una shell | CLI y biblioteca; `--backquote-code-style`, `--body-width` | Gratis, GPLv3 |
| Pandoc | Binario en Haskell | HTML que tiene que convertirse en algo más que Markdown | `-f html -t gfm`, lee la entrada estándar | Gratis, GPL |

Dos de las seis no compiten realmente. `turndown-plugin-gfm` forma parte de Turndown para cualquier entrada realista, porque el HTML sin tablas es lo bastante raro como para que tratar el soporte de tablas como opcional sea una decisión que vas a revertir. Pandoc no es en realidad una biblioteca en este contexto; es un proceso, y el coste de usarlo se mide en arranques de proceso, no en bytes del bundle.

## Turndown a fondo: rules, keep, remove y las sustituciones especiales

Turndown convierte una cadena de HTML o un nodo del DOM —un elemento, un documento, o un fragmento de documento— en Markdown. Esa flexibilidad de entrada es el primer detalle práctico: en una extensión de navegador puedes pasarle un elemento vivo en vez de serializar la página y volver a analizarla, lo que ahorra una copia del documento y conserva lo que los propios scripts de la página ya hayan cambiado.

Todo lo demás en Turndown es el sistema de reglas, así que merece la pena entender cómo se elige una regla antes de escribir una.

### Cómo elige Turndown una regla

Las reglas se prueban en un orden fijo, y ese orden explica la mayoría de las salidas sorprendentes:

1. La **regla en blanco**, que anula todo lo demás.
2. Las **reglas añadidas**, en el orden en que las añadiste.
3. Las **reglas de CommonMark** integradas.
4. Las **reglas de keep**.
5. Las **reglas de remove**.
6. La **regla por defecto**.

De ahí se siguen dos consecuencias de inmediato. Primero, tus propias reglas ganan a las integradas, así que nunca tienes que bifurcar nada para cambiar cómo se emiten `<a>` o `<pre>` — añades una regla con el mismo filtro y gana ella. Segundo, la regla en blanco te gana a ti. Un nodo está en blanco si solo contiene espacio en blanco y no es un `<a>`, `<td>`, `<th>` ni un elemento vacío. Así que si tu regla apunta a `<div class="spacer">` y el div está vacío, tu regla nunca se ejecuta, y la razón no está en tu código.

### addRule con un nombre de etiqueta, una lista, o una función de filtro

`addRule(key, rule)` recibe un nombre —usado solo para que una llamada posterior pueda sustituirlo— y un objeto con un `filter` y un `replacement`. Devuelve el servicio, así que las llamadas se encadenan.

El filtro tiene tres formas. Una cadena coincide con un nombre de etiqueta. Un array coincide con varios nombres de etiqueta. Una función recibe el nodo y las opciones y devuelve un booleano, que es donde pasa el trabajo real.

```js
import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
  strongDelimiter: '**',
  linkStyle: 'inlined',
});

// A string filter: one tag.
turndown.addRule('figcaption', {
  filter: 'figcaption',
  replacement: (content) => `\n\n_${content.trim()}_\n\n`,
});

// An array filter: several tags, one handler.
turndown.addRule('smallprint', {
  filter: ['small', 'cite'],
  replacement: (content) => content,
});

// A function filter: the only form that can see attributes.
turndown.addRule('warning', {
  filter: (node) =>
    node.nodeName === 'DIV' &&
    (node.getAttribute('class') || '').includes('warning'),
  replacement: (content) =>
    `\n\n> **Warning**\n>\n> ${content.trim().replace(/\n/g, '\n> ')}\n\n`,
});
```

La firma de `replacement` es `(content, node, options)`. `content` es el Markdown ya convertido de los hijos, que es la parte que la gente entiende mal: no te dan el HTML interno, te dan el resultado de convertirlo, así que no puedes volver a inspeccionar la estructura interna dentro de tu propia sustitución. Si necesitas la estructura, mira `node`; si necesitas el texto, mira `content`.

El filtro de función es también la respuesta al requisito real más común de todos: que un nombre de clase lleva un significado para el que Markdown no tiene vocabulario. Un `<div class="warning">` se convierte, con cualquier valor por defecto de este artículo, en un párrafo normal, y el lector pierde la única señal de que ese párrafo es el que importa. A Turndown se le puede decir que lo convierta en una cita. Eso es una regla por clase, escrita por ti, por sitio — y sigue siendo el arreglo más barato disponible.

### Las opciones, y las dos que de verdad cambian la salida

El objeto de opciones cubre `headingStyle` (`setext` o `atx`), `hr`, `bulletListMarker` (`-`, `+` o `*`), `codeBlockStyle` (`indented` o `fenced`), `fence` (comillas triples o `~~~`), `emDelimiter` (`_` o `*`), `strongDelimiter` (`**` o `__`), `linkStyle` (`inlined` o `referenced`), `linkReferenceStyle` (`full`, `collapsed` o `shortcut`) y `preformattedCode`.

La mayoría son estilo de casa y no rompen nada en ningún sentido. Dos no lo son:

- `codeBlockStyle: 'fenced'` es la que hay que fijar a propósito. Los bloques de código con sangría no pueden llevar un lenguaje, así que un bloque con sangría pierde el resaltado al otro extremo y un analizador poco cuidadoso no lo distingue de un elemento de lista muy sangrado.
- `linkStyle: 'referenced'` mueve cada URL al final del documento. Para una página con cuarenta enlaces en línea eso es la diferencia entre prosa legible y una pared de corchetes — y para un archivo que va a control de versiones es la diferencia entre un diff legible y uno que no lo es.

`preformattedCode` es la discreta. Gobierna si el espacio en blanco dentro de los elementos `code` se conserva en vez de colapsarse, y si estás convirtiendo HTML donde la sangría dentro de código en línea tiene significado, el valor por defecto te va a sorprender.

### keep, remove, y por qué no son opuestos

`keep(filter)` y `remove(filter)` aceptan las mismas tres formas de filtro que una regla, y hacen cosas muy distintas.

```js
// Emit these as raw HTML, because Markdown has no equivalent.
turndown.keep(['iframe', 'sup', 'sub', 'kbd']);

// Delete these and everything inside them.
turndown.remove(['script', 'style', 'noscript', 'nav', 'footer']);
```

`keep` significa «pon el HTML original en el Markdown». Los elementos de bloque conservados se separan del contenido circundante con líneas en blanco, así que la salida sigue siendo Markdown válido estructuralmente. Lo que no es: portable. El HTML crudo en un archivo Markdown solo sobrevive si el siguiente renderizador permite HTML crudo, y se escapa como una sopa de etiquetas visible si no lo permite. Conservar un `<iframe>` es una apuesta sobre el destino.

`remove` significa que el elemento y su contenido desaparecen. Por defecto no se elimina nada — esa es la parte que merece anotarse en una nota adhesiva. Turndown no quita `<script>` por ti. Dale una página web guardada y el contenido del script te llega como texto dentro del Markdown, lo cual no es en sí un problema de seguridad pero desde luego es un problema de salida, y es la razón de que existan tantos reportes de «por qué hay JavaScript en mi Markdown». Si el HTML viene de algún sitio que no controlas, quitar script y style es el mínimo, y [lo que sanear tiene que cubrir de verdad](/blog/sanitising-markdown-safely) merece leerse antes de confiar en el resultado de una conversión de cualquier forma.

El gancho de personalización para `keep` es `keepReplacement`, una función de sustitución como cualquier otra, así que puedes decidir que un elemento conservado se envuelva, se sangre o se anote en vez de emitirse literalmente.

### blankReplacement, y el problema del párrafo vacío

`blankReplacement` es la opción que resuelve la categoría más molesta de HTML malo: el elemento vacío que un sistema de gestión de contenidos inserta para dar espacio. La regla en blanco atrapa esos nodos antes que cualquier otra regla, y su sustitución decide en qué se convierten.

El valor por defecto conserva la separación de bloques — un nodo de bloque vacío sigue produciendo un salto de párrafo, un nodo en línea vacío no produce nada. Eso suele ser correcto y de vez en cuando es la causa exacta de un documento lleno de huecos.

```js
const turndown = new TurndownService({
  // Drop empty blocks entirely instead of leaving a paragraph break.
  blankReplacement: () => '',
});
```

El coste es real y conviene conocerlo antes de fijar esto: acabas de quitar el mecanismo que separaba dos bloques cuyo único separador era un nodo vacío. En HTML con estructura cuidada eso no cambia nada. En HTML donde un `<p>&nbsp;</p>` hacía el trabajo de un salto de párrafo, obtienes dos párrafos pegados. Convierte un documento representativo de las dos formas y lee el resultado en vez de razonarlo.

`defaultReplacement` es la tercera de las opciones especiales y la menos usada. Se activa para elementos a los que ninguna regla dio, y por defecto emite el contenido de texto del nodo, separado por líneas en blanco si el nodo es de bloque. Sobrescribirla es cómo descubres qué contiene tu HTML de verdad: devuelve una cadena marcadora en vez del contenido, convierte, y busca la marca con grep. Cada coincidencia es un elemento que ninguna de tus reglas trató.

### El plugin GFM: tablas, tachado, listas de tareas

El núcleo de Turndown implementa CommonMark, y CommonMark no tiene tablas. `turndown-plugin-gfm` suministra el resto.

```js
import TurndownService from 'turndown';
import { gfm, tables, strikethrough, taskListItems } from 'turndown-plugin-gfm';

const turndown = new TurndownService();

// Everything the plugin provides:
turndown.use(gfm);

// Or only what you want:
// turndown.use([tables, strikethrough, taskListItems]);
```

`use` acepta un plugin o un array de ellos, y devuelve el servicio, así que encadena con `addRule`. La forma selectiva importa más de lo que parece: `tables` es la regla cara del conjunto, y si sabes que la entrada no tiene tablas —mensajes de chat, cuerpos de comentarios, manejadores de pegado de un editor—, dejarla fuera quita del resultado toda una clase de casos extremos.

Lo que el plugin no puede hacer es inventar expresividad que a Markdown le falte. Las tablas de GFM son una cuadrícula plana de celdas simples: sin `rowspan`, sin `colspan`, sin contenido en bloque, sin una tabla dentro de una celda. [Lo que de verdad sobrevive cuando una tabla cambia de formato](/blog/markdown-tables-that-survive-conversion) es la forma del problema, y se aplica por igual a todas las bibliotecas de aquí.

### El escapado, y la sustitución con la que hay que tener cuidado

Turndown escapa con barras invertidas los caracteres de sintaxis Markdown que aparecen en el texto, para que un asterisco literal en el origen no se convierta en énfasis en la salida. El texto dentro de elementos `code` está exento, lo cual es correcto y también el límite donde viven la mayoría de las quejas: un nombre de archivo como `my_file_name.txt` en prosa normal sale como `my\_file\_name.txt`, que se renderiza correctamente y se ve mal en el archivo crudo.

`escape` es un método documentado y sustituible, así que la tentación es obvia:

```js
// Do this only if you own both ends of the pipeline.
turndown.escape = (text) => text;
```

Eso produce Markdown de aspecto limpio que significa algo distinto del HTML con el que empezaste. Los guiones bajos se convierten en énfasis, los guiones al principio de línea se convierten en elementos de lista, una línea que empieza con `#` se convierte en un encabezado. Si el Markdown va directo a un diff para que lo lea una persona y nunca vuelve a pasar por un renderizador, puede ser defendible. Si se va a renderizar, es corrupción de datos con aspecto pulcro. El arreglo más estrecho —restar una sola clase de caracteres al escapado por defecto en vez de todas— es casi siempre el tamaño correcto del cambio.

**Para quién es Turndown.** Desarrolladores de JavaScript que necesitan controlar la salida elemento a elemento: manejadores de pegado de un editor, extensiones de navegador, importadores que leen un CMS heredado. Su ubicuidad es una función genuina, porque cuando una página convierte mal alguien suele haber ya publicado la regla.

## node-html-markdown: sin DOM, un traductor por elemento

node-html-markdown es un conversor en TypeScript cuyo propósito declarado es el rendimiento. Depende de `node-html-parser` y usa el `DOMParser` nativo cuando hay uno disponible, controlado por la opción `preferNativeParser`. Esa es toda la diferencia arquitectónica con Turndown, y decide tres cosas: corre en un worker o una función serverless sin un DOM simulado, su perfil de memoria en un documento grande es un árbol de análisis en vez de un DOM completo, y su API de extensión es la suya propia en vez de la de Turndown.

```js
import { NodeHtmlMarkdown } from 'node-html-markdown';

// One-off:
const md = NodeHtmlMarkdown.translate(html);

// Reused — build the instance once, translate many times:
const nhm = new NodeHtmlMarkdown(
  {
    bulletMarker: '-',
    codeBlockStyle: 'fenced',
    strongDelimiter: '**',
    emDelimiter: '_',
    strikeDelimiter: '~~',
    maxConsecutiveNewlines: 2,
    keepDataImages: false,
    useInlineLinks: true,
  },
  {
    aside: { prefix: '> ', surroundingNewlines: 2 },
    button: { ignore: true },
    figcaption: { prefix: '_', postfix: '_' },
  }
);

const markdown = nhm.translate(html);
```

El estático `translate(html, options?, customTranslators?, customCodeBlockTranslators?)` es cómodo y lo construye todo en cada llamada. Si estás convirtiendo más de un puñado de documentos, construye la instancia una vez — esa es la diferencia para la que existe la biblioteca.

El objeto traductor es donde node-html-markdown se separa de forma más útil de Turndown. En vez de un filtro y una sustitución, un traductor es una declaración de campos, cada uno con un solo trabajo: `prefix` y `postfix` se colocan a cada lado del contenido, `content` fija una salida fija, `surroundingNewlines` añade saltos de línea antes y después (un booleano, o un número por lado), `recurse: false` detiene el escaneo de los elementos hijos por completo, `ignore` se salta el nodo entero, `noEscape` desactiva el escapado para ese elemento, `preserveWhitespace` conserva el espacio en blanco tal cual, `preserveIfEmpty` visita el traductor incluso cuando el elemento está vacío, `spaceIfRepeatingChar` inserta un espacio cuando el primer carácter colisionaría con el último escrito, `childTranslators` cambia la colección de traductores para los hijos, y `postprocess` corre después de que los nodos internos ya se han renderizado.

Ese último par es donde la API se lo gana. `postprocess` puede devolver `PostProcessResult.RemoveNode` para quitar un nodo después de ver a qué se renderizó — que es la respuesta a «borra este elemento si resultó estar vacío», una decisión que no puedes tomar con un filtro que corre antes de la conversión. `childTranslators` deja que una `<table>` trate a sus descendientes con reglas distintas del resto del documento, sin tocar la configuración global.

Las dos opciones que conviene fijar a propósito son `maxConsecutiveNewlines`, que es el control de espacio en blanco que las otras bibliotecas de JavaScript no exponen directamente, y `keepDataImages`. Una página con imágenes base64 incrustadas, si no, produce un archivo Markdown donde una sola línea de imagen es más larga que el resto del documento junto.

**Para quién es.** Conversión masiva, y cualquier entorno de ejecución sin DOM: un worker, una función edge, un consumidor de cola que va masticando un rastreo. También es sobre lo que corre el propio conversor de este sitio, por esa misma razón — la misma ruta de código en una pestaña de navegador y en un servidor.

## html-to-md: la pequeña, y las opciones que hacen el trabajo

html-to-md es un conversor de JavaScript sin dependencias con una sola función exportada. Su API son tres argumentos y ninguna instancia:

```js
import html2md from 'html-to-md';

const markdown = html2md(html, {
  skipTags: ['div', 'section', 'nav', 'footer', 'aside', 'header', 'main'],
  ignoreTags: ['script', 'style', 'svg', 'noscript', 'head', 'meta', 'form'],
  aliasTags: { figure: 'p', figcaption: 'p', dl: 'p', dt: 'p', dd: 'p' },
});
```

Las dos opciones que hay que entender son `skipTags` e `ignoreTags`, porque suenan parecido y hacen lo contrario con tu contenido. `skipTags` omite la etiqueta en la conversión y conserva lo que hay dentro — que es lo que quieres para `<div>` y `<section>`, elementos que llevan maquetación y ningún significado. `ignoreTags` descarta la etiqueta y todo su contenido interior, que es lo que quieres para `<script>`, `<style>` y `<svg>`. Confúndelas y o borras el artículo o le pegas dentro una hoja de estilos.

Los valores por defecto son inusualmente marcados de una forma que ahorra trabajo: `skipTags` ya contiene los elementos estructurales —`div`, `html`, `body`, `nav`, `section`, `footer`, `main`, `aside`, `article`, `header`— e `ignoreTags` ya contiene `style`, `head`, `script`, `meta`, `svg`, `noscript` y `form`. De fábrica está más cerca de que una página guardada sea legible que las otras bibliotecas de JavaScript, que es el cambio contrario al habitual para una dependencia pequeña.

`aliasTags` asigna una etiqueta a un manejador que ya existe, y es la vía de escape para una lista de etiquetas soportadas en vez de un sistema de reglas. La biblioteca documenta lo que trata: `a`, `b`, `blockquote`, `code`, `del`, `em`, de `h1` a `h6`, `hr`, `i`, `img`, `input`, `li`, `ol`, `p`, `pre`, `s`, `strong`, `table`, `tbody`, `td`, `th`, `thead`, `tr`, `ul`. Cualquier cosa fuera de esa lista necesita un alias, un skip, o `renderCustomTags` para decidir qué pasa con los elementos desconocidos. `tagListener` te da una sola etiqueta para que la trates tú mismo, y el orden de precedencia de las opciones está documentado como `skipTags` antes de `emptyTags` antes de `ignoreTags` antes de `aliasTags`, que es el orden en el que razonar cuando dos de tus listas mencionan el mismo elemento.

El tercer argumento de `html2md` decide si tus arrays sustituyen del todo a los valores por defecto integrados en vez de fusionarse con ellos. Eso es un interruptor más grande de lo que parece: pasa `skipTags: ['div']` sin él y puede que sigas dependiendo de otros nueve valores por defecto que nunca leíste.

**Para quién es.** Código de frontend donde el tamaño del bundle es una restricción real, y HTML razonablemente bien portado. Explícitamente no es la herramienta para marcado mal anidado o malformado — la propia guía de la biblioteca dice que espera HTML válido, y no tiene un analizador DOM detrás que le repare el desorden.

## Fuera de JavaScript: html2text y Pandoc

### html2text, para Python y para salida que lee gente

html2text es una biblioteca de Python con una interfaz de línea de comandos. Su propósito es texto legible que resulta ser Markdown válido, y sus valores por defecto reflejan esa prioridad y no la fidelidad.

```bash
html2text --backquote-code-style --body-width=0 --pad-tables page.html > page.md
```

```python
import html2text

h = html2text.HTML2Text()
h.body_width = 0             # no hard wrapping
h.backquote_code_style = True  # fenced code blocks
h.ignore_images = True
h.escape_snob = False

markdown = h.handle(html)
```

Tres flags cargan con la mayor parte de la diferencia entre una salida que puedes usar y una que no.

`--backquote-code-style` es la importante para cualquiera que convierta documentos técnicos: produce bloques de código multilínea con comillas triples. Sin ella dependes de bloques con sangría, o de `--mark-code`, que marca los bloques de código de programa con delimitadores literales `[code]` y `[/code]` — útil si vas a postprocesar, incorrecto si una persona va a leer el archivo.

`--body-width` fija los caracteres por línea de salida y acepta `0` para no ajustar. Este es el flag que decide si el Markdown es diffable. La prosa con ajuste forzado significa que una edición de una palabra reajusta un párrafo entero y el diff muestra cinco líneas cambiadas. Ponlo a cero para cualquier cosa que vaya a control de versiones.

Para las tablas hay tres posiciones separadas: `--pad-tables` rellena las celdas hasta un ancho de columna igual, `--bypass-tables` da formato a las tablas en HTML en vez de sintaxis Markdown, y `--ignore-tables` ignora las etiquetas relacionadas con tablas pero conserva las filas. Esta última merece conocerse porque es la respuesta honesta para tablas que se usan por maquetación y no por datos — conservas el contenido y abandonas la cuadrícula.

Otras dos merecen una línea. `--reference-links` usa enlaces de estilo referencia en vez de en línea, y `--protect-links` rodea los enlaces con corchetes angulares para que el ajuste de línea no los rompa. `--escape-all` escapa todos los caracteres especiales: menos legible, y evita los fallos de formato en casos extremos.

La licencia es lo primero que hay que comprobar, no lo último. html2text es GPLv3, que algunos proyectos no pueden aceptar.

**Para quién es.** Código de Python que produce texto para personas o para un índice: resúmenes, cuerpos de notificaciones, partes en texto plano de un correo, un corpus para un motor de búsqueda. Si necesitas una copia estructural fiel en vez de una legible, es el extremo equivocado del intercambio.

### Pandoc como subproceso

Pandoc no es una biblioteca que importas; es un binario que lanzas. En la dirección de HTML a Markdown la invocación es corta:

```bash
pandoc -f html -t gfm --wrap=none input.html -o output.md

# or read standard input, which is what you want from code
cat input.html | pandoc -f html -t gfm --wrap=none
```

Desde Node, pasa los argumentos como un array para que no intervenga ninguna shell y el HTML nunca tenga que entrecomillarse:

```js
import { execFileSync } from 'node:child_process';

const markdown = execFileSync(
  'pandoc',
  ['-f', 'html', '-t', 'gfm', '--wrap=none'],
  { input: html, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }
);
```

Desde Python:

```python
import subprocess

markdown = subprocess.run(
    ["pandoc", "-f", "html", "-t", "gfm", "--wrap=none"],
    input=html,
    capture_output=True,
    text=True,
    check=True,
).stdout
```

Cuatro cosas de este patrón merecen hacerse a propósito.

**El proceso es el coste.** Una conversión es gratis. Diez mil conversiones son diez mil arranques de proceso, cada uno con su propio inicio, y ahí es donde gana una biblioteca en proceso sin importar lo buena que sea la salida de Pandoc. Agrupa el trabajo en menos llamadas, o usa una biblioteca.

**`maxBuffer` y la tubería son límites reales.** Un documento grande que vuelve por una tubería tiene que caber en el búfer que permitiste. El valor por defecto en Node no es generoso, y el modo de fallo es un documento truncado en vez de una excepción que hubieras notado al probar.

**Nunca construyas el comando como una cadena.** Pasar un array, como arriba, significa que el HTML viaja por la entrada estándar y ninguna shell interpreta nada de él. Construir `pandoc ... "${html}"` con interpolación es una inyección de comandos esperando al primer documento con una comilla invertida.

**Comprueba el código de salida.** `check=True` en Python y el comportamiento de lanzar excepción ante un valor distinto de cero de `execFileSync` hacen un trabajo necesario. Un subproceso que falla en silencio te da un archivo vacío, y un archivo vacío parece un documento sin contenido en vez de un error.

La razón para aceptar todo esto es `-t gfm` y todo lo que viene después. Pandoc lee HTML y escribe a una larga lista de otros formatos, así que la misma pipeline que produce Markdown puede producir DOCX, LaTeX o EPUB a partir de la misma fuente, y `--sandbox` restringe el acceso al sistema de archivos cuando la entrada no es tuya. `--wrap=none` importa por la misma razón que `--body-width=0` en html2text.

**Para quién es.** Pipelines de compilación, jobs programados, y cualquier proyecto donde Markdown sea una salida entre varias. No para una conversión por petición en un servicio web.

## Tablas, bloques de código, listas anidadas y espacio en blanco

Esta es la comparación que decide proyectos reales, y no es con la que empiezan los README.

| Aspecto | Turndown | node-html-markdown | html-to-md | html2text | Pandoc |
| --- | --- | --- | --- | --- | --- |
| Tablas | Necesita plugin (`tables` o `gfm`) | Lo manejan los traductores por defecto | Soporta `table`, `thead`, `tbody`, `tr`, `th`, `td` | Tablas Markdown, más `--pad-tables`, `--bypass-tables`, `--ignore-tables` | Tablas pipe con `-t gfm` |
| Bloques de código | `codeBlockStyle: 'fenced'`, lenguaje leído de una clase `language-*` | `codeBlockStyle`, más traductores específicos de bloque de código | `pre` y `code` en la lista de etiquetas soportadas | Con sangría por defecto; `--backquote-code-style` para vallas | Con vallas, con el lenguaje cuando la clase lo indica |
| Listas anidadas | Sangra el contenido anidado, incluido el desplazamiento del marcador | Lo manejan los traductores de lista | Soporta `ul`, `ol`, `li` | Lo maneja, con el ajuste controlado por `--wrap-list-items` | Lo maneja |
| Espacio en blanco | Colapsado; `preformattedCode` para `code` | `maxConsecutiveNewlines`, `preserveWhitespace` por traductor | No expuesto directamente | `--body-width`, `--single-line-break` | `--wrap=none` |
| Corre en el navegador | Sí, y acepta un nodo DOM vivo | Sí, `DOMParser` nativo cuando está disponible | Sí, a través de un bundler | No | No |
| Analizador | Un DOM (`@mixmark-io/domino` en Node) | `node-html-parser` | El suyo propio, sin dependencias | El propio de Python | El lector de HTML de Pandoc |

Cuatro notas sobre cómo leer esa tabla.

**Las tablas son una decisión de plugin, no una casilla de función.** Turndown sin `turndown-plugin-gfm` no degrada una tabla en silencio a algo legible — obtienes el texto de las celdas mezclado con la prosa circundante, que parece que el conversor perdió tus datos porque eso es justo lo que pasó. Esta es la sorpresa más común de Turndown y es del todo evitable en una línea.

**Los bloques de código dependen del nombre de la clase, no de la etiqueta.** Todo resaltador de sintaxis emite un bloque de código como `<pre><code class="language-python">` envuelto alrededor de un nido de elementos `<span>` por token. Un conversor que lee la clase te da una valla anotada y resaltado al otro extremo; uno que no lo hace te da una valla desnuda y una pérdida que solo vas a notar cuando la página se publique. [Lo que necesita un bloque de código para sobrevivir a la conversión](/blog/code-blocks-in-markdown) es una lista corta, y la clase del lenguaje va arriba de ella.

**La sangría de las listas anidadas es donde los archivos dejan de ser portables.** Los analizadores de Markdown no se ponen de acuerdo sobre cuánta sangría hace que algo sea una sublista en vez de un bloque de código, y un conversor que sangra el contenido anidado con una cantidad distinta de la que espera tu renderizador produce un documento que se ve bien en un sitio y mal en otro. Convierte una lista de tres niveles y abre el resultado en el renderizador que de verdad vaya a publicarla.

**El espacio en blanco es un problema de diff antes de ser un problema de aspecto.** Las cinco van a producir algo que un navegador renderiza de forma idéntica. Solo algunas producen algo donde una edición de una frase aparece como un diff de una línea. Si el Markdown va a un repositorio, el control del espacio en blanco —`--wrap=none`, `--body-width=0`, `maxConsecutiveNewlines`— no es una configuración cosmética.

## Dónde falla la respuesta obvia de biblioteca

La respuesta obvia en JavaScript es Turndown, y es el valor por defecto correcto. Aquí es donde ella, y toda la categoría, dejan de ser suficiente.

**Una biblioteca convierte lo que le das, y una página guardada casi nunca es el artículo.** Ninguna de estas herramientas tiene una etapa de extracción. Dale a cualquiera de ellas una página de noticias guardada y obtienes la cabecera, la navegación, el aviso de cookies, el aviso de suscripción, la lista de artículos relacionados y un pie de sesenta enlaces, todo fielmente traducido a Markdown, con el artículo en algún punto en medio. `remove` y `skipTags` ayudan; no son un extractor de contenido. Si la entrada son páginas enteras, necesitas algo que encuentre primero el artículo, y [guardar una página web como Markdown](/blog/save-a-web-page-as-markdown) es un trabajo distinto con herramientas distintas.

**La configuración es código, y el código es un coste de mantenimiento.** Treinta reglas que asignan los nombres de clase de un sitio a construcciones de Markdown son un pequeño programa. Funciona hasta que rediseñan el sitio, momento en el que los nombres de clase cambian y tu conversor deja de reconocer los avisos en silencio. Nadie se da cuenta, porque la salida sigue siendo Markdown válido. Los conjuntos de reglas atados al marcado de otro tienen una fecha de caducidad que no está escrita en ningún sitio.

**El DOM es un coste de memoria que no presupuestaste.** El análisis de Turndown de un documento grande es un DOM completo, lo que significa un objeto nodo por cada elemento y cada tramo de texto en vez de los bytes que le pasaste. Eso está bien en un portátil, y es exactamente el tipo de cosa que falla en un entorno de ejecución con memoria limitada — y falla en los documentos más grandes del corpus en vez de en los primeros, así que una importación puede correr feliz durante mucho tiempo antes de romperse. Mide con tu entrada real más grande, no con una representativa.

**El escapado produce una salida que es correcta y se ve mal.** Toda biblioteca escapa la puntuación de Markdown en el texto, porque tiene que hacerlo. El resultado es `my\_file\_name.txt` y `1\. Introduction`, que se renderiza correctamente y le parece mal a cualquiera que abra el archivo crudo. Si una persona va a revisar el Markdown, lo va a reportar como un bug de tu conversor, repetidamente. No lo es, y decírselo no ayuda.

**Nada de esto sanea.** Turndown no elimina ningún elemento por defecto. El trabajo de un conversor es traducir, no dar seguridad, y un Markdown que arrastra HTML crudo —porque usaste `keep`, o porque la biblioteca emite HTML crudo para lo que Markdown no puede expresar— es Markdown que puede llevar una etiqueta `<script>` hasta el siguiente renderizador. El coste de hacer esto mal no es un archivo con mal aspecto.

**Y el viaje de ida y vuelta no es de ida y vuelta.** Convertir de HTML a Markdown y de vuelta no devuelve, en ninguna de estas bibliotecas, jamás, el HTML con el que empezaste. La maquetación, las clases, los ids, los estilos en línea, las celdas que abarcan varias columnas, los formularios y las incrustaciones no tienen representación en Markdown. Si alguien espera que entre HTML y salga HTML equivalente, corrige esa expectativa antes de escribir código, porque ninguna configuración llega hasta ahí.

## Cómo elegir una biblioteca

1. **Empieza por dónde corre el código, porque eso elimina opciones antes que cualquier función.** Un worker o una función edge sin DOM descarta la vía basada en DOM; un bundle de navegador con presupuesto de tamaño descarta cualquier cosa que arrastre un árbol de análisis detrás; un script de compilación no descarta nada y puede hacer shell a Pandoc.
2. **Decide si necesitas reglas por elemento, y sé honesto al respecto.** Si el HTML lo genera un sistema que controlas, los valores por defecto probablemente basten, y la API de reglas de Turndown es complejidad que no vas a usar. Si el HTML viene de muchas fuentes con nombres de clase que significan algo, esa API es la razón entera para elegirla.
3. **Convierte tu peor documento antes de comprometerte, no el más simple.** Elige la página con una tabla, un bloque de código resaltado, una lista de tres niveles y un aviso. Lo que conserve esas cuatro cosas conserva casi todo lo demás, y lo sabrás en diez minutos en vez de después de doscientos documentos.
4. **Fija las opciones de ajuste y espacio en blanco el primer día.** `--wrap=none`, `--body-width=0`, `maxConsecutiveNewlines`: fijarlas después de convertir el corpus significa convertirlo dos veces, porque reajustar cambia cada línea de cada archivo y entierra los cambios reales.
5. **Comprueba la licencia contra tu proyecto antes de comprobar las funciones.** html2text es GPLv3 y Pandoc es GPL; Turndown, node-html-markdown y html-to-md son MIT. Para una biblioteca que envías dentro de un producto, esa diferencia decide la preselección sin importar la calidad de la salida.
6. **Escribe qué pasa con lo que Markdown no puede expresar.** Descartado, conservado como HTML crudo, o aproximado por una regla que escribiste — elígelo a propósito por clase de elemento. Si lo dejas sin decidir, lo decide la biblioteca por ti, y decide distinto en cada una de las cinco.

## Conclusión

No hay una mejor biblioteca de HTML a Markdown, solo la distancia más corta entre tu entrada y el archivo que necesitas. En JavaScript, empieza con Turndown y el plugin GFM, y recurre a su API de reglas solo cuando un nombre de clase lleva significado; pásate a node-html-markdown cuando no haya DOM o el volumen sea real; elige html-to-md cuando el conversor sea un detalle dentro de un bundle. En Python, html2text si la salida es para leer y su licencia GPLv3 es aceptable. Haz shell a Pandoc cuando Markdown no sea el último formato al que llega el documento. Y cuando el trabajo sea un archivo en vez de una pipeline, una biblioteca es directamente la forma equivocada de respuesta — [la conversión de HTML a Markdown de TransformPipe](/html-to-markdown) corre en el navegador sin subir nada ni instalar nada, lo cual es una vía más rápida al mismo Markdown que cualquier `npm install`.

## Preguntas frecuentes

### ¿Cuál es la mejor biblioteca de HTML a Markdown para JavaScript?

Turndown, para la mayoría de proyectos: corre en el navegador y en Node, y su API de reglas te deja sobrescribir el manejador de cualquier elemento sin bifurcar la biblioteca. Añade `turndown-plugin-gfm` a menos que estés seguro de que la entrada no tiene tablas. Elige node-html-markdown en su lugar cuando no haya DOM disponible o estés convirtiendo en volumen.

### ¿Turndown soporta tablas?

No en el núcleo, que implementa CommonMark, y CommonMark no tiene tablas. `turndown-plugin-gfm` las añade, junto con el tachado y los elementos de lista de tareas; `turndownService.use(gfm)` activa las tres, o puedes importar `tables` solo. Sin el plugin, el texto de las celdas de una tabla se mezcla con la prosa circundante.

### ¿Cómo hago que Turndown ignore un elemento?

`remove(filter)` borra el elemento y su contenido, y acepta un nombre de etiqueta, un array de nombres de etiqueta o una función de filtro. Por defecto no se elimina nada, así que añadir `remove(['script', 'style', 'noscript'])` merece la pena en cualquier conversor que trate HTML que no escribiste tú. Usa `keep(filter)` en su lugar cuando quieras el HTML original en la salida en vez de nada.

### ¿Qué hace blankReplacement en Turndown?

Decide qué pasa con los nodos que solo contienen espacio en blanco — los párrafos vacíos que deja atrás un sistema de gestión de contenidos. La regla en blanco corre antes que cualquier otra regla, incluida la tuya, así que un elemento vacío nunca llega a una regla que escribiste. Fijar `blankReplacement: () => ''` quita esos huecos, al coste de perder la separación de bloques donde un nodo vacío era lo único que la proporcionaba.

### ¿Qué bibliotecas de HTML a Markdown corren en un navegador?

Turndown, node-html-markdown y html-to-md, las tres. Turndown acepta un elemento DOM vivo en vez de una cadena, por lo que lo usan las extensiones de navegador. html2text es Python y Pandoc es un binario, así que ninguno corre del lado del cliente; convertir en el navegador sin un paso de compilación significa una de las tres de JavaScript, o [una página conversora que ya incluye una](/blog/best-html-to-markdown-converters).

### ¿Qué hace --backquote-code-style en html2text?

Hace que los bloques de código multilínea usen vallas de comillas triples en vez de sangría. Sin ella obtienes bloques con sangría, que no pueden llevar una anotación de lenguaje, o marcas `[code]` si pasaste `--mark-code`. Combínala con `--body-width=0` para que el código no se ajuste forzosamente a la longitud de línea por defecto.

### ¿Merece la pena llamar a Pandoc desde código en vez de usar una biblioteca?

Sí cuando Markdown no es la única salida — la misma llamada puede producir DOCX, LaTeX o EPUB a partir del mismo HTML— y no cuando conviertes por cada petición. Cada conversión es un arranque de proceso, así que el rendimiento es pobre comparado con una biblioteca en proceso. Pasa los argumentos como un array y el HTML por la entrada estándar, nunca como una cadena de shell interpolada.
