---
title: "mammoth.js en el navegador: convertToHtml con un arrayBuffer"
description: "Leer un .docx en el navegador o en Node: la llamada con arrayBuffer, style maps hacia tu propio HTML, imágenes en base64 y el array de avisos que nadie lee."
date: 2026-08-20
tag: Código
keywords: convertir docx a html javascript, mammoth js, leer docx en node, parsear docx javascript, docx4js, docxtemplater, docx a html en el navegador, python-docx, docx a markdown
---

Tienes un `.docx` y un programa que necesita HTML. En npm hay más de una docena de paquetes cuyo nombre contiene «docx», y tres de los más populares hacen una tarea completamente distinta de la que buscas. Uno genera archivos de Word desde cero. Otro rellena huecos en una plantilla. Otro dibuja un documento para que se vea como una página impresa. Solo algunos leen un archivo ya existente y te devuelven marcado.

La búsqueda es «docx a html javascript» y la respuesta honesta es corta: en JavaScript, ese trabajo es de mammoth. Lo que lleva más explicar es por qué su salida sale tan limpia de lo que esperabas, por qué omite en silencio cosas que estabas seguro que estaban en el documento, y por qué esos dos hechos son el mismo hecho.

La dificultad no es instalar una biblioteca. Es que un `.docx` guarda el significado por referencia, repartido entre una docena de archivos XML, y cada parser tiene que decidir qué referencias sigue y cuáles ignora. Uno que las sigue todas produce HTML lleno de `span` en línea que reproduce la página y no te dice nada. Uno que sigue solo algunas produce HTML semántico limpio y descarta el resto en silencio. No hay una tercera vía, y saber cuál de las dos has elegido es la mayor parte del trabajo.

### Resumen rápido

Para leer un `.docx` y obtener HTML en JavaScript, usa **mammoth** — licencia BSD de dos cláusulas, funciona en Node y en el navegador con el build `mammoth.browser.js`, y se guía por un **mapa de estilos** que traduce los estilos con nombre de Word a elementos HTML en lugar de intentar reproducir el formato. Lee el array `messages` de cada resultado: es la única lista legible por máquina de lo que el conversor no pudo traducir. Decide qué hacer con las imágenes de forma explícita, porque el comportamiento por defecto es incrustarlas como URIs base64 y `convertImage` es la opción que lo cambia. Y si las listas salen como párrafos sueltos, la causa casi siempre es `numbering.xml` — el archivo que las define, o no está en el archivo comprimido, o no se resuelve.

## Lo que un .docx es para un programa que tiene que leerlo

Un `.docx` es un archivo zip de partes XML en el formato Office Open XML. [Cómo entrar en uno y qué guarda cada parte](/blog/convert-docx-to-markdown) merece leerse si nunca has descomprimido uno, y el resto de este artículo asume que ya lo has hecho. Lo que importa aquí es la forma de los datos una vez pasado el zip, porque es a esa forma a la que reacciona cada biblioteca de esta página.

El cuerpo del documento es una secuencia de elementos de párrafo `w:p`. Cada párrafo contiene elementos `w:r` de «run» (fragmento de texto con un formato uniforme). Cada run contiene un elemento de texto `w:t`. Así que la frase «el informe trimestral llega tarde» no se guarda como una cadena de texto. Se guarda como cierto número de runs, y cuántos depende de hechos sobre el documento que no puedes predecir.

Esa es la primera sorpresa para quien intenta parsear el XML a mano. Word corta los runs en cada cambio de formato, lo cual es razonable, y también en los límites de las revisiones, el estado del corrector ortográfico y varias tareas internas de contabilidad, lo cual no lo es. Una sola palabra puede ser tres runs. La palabra «trimestral» puede ser `trimes` + `tr` + `al» porque alguien editó el centro en 2019. Cualquier enfoque basado en buscar una frase dentro de `document.xml` falla con documentos reales, y falla de forma intermitente, que es peor.

La segunda sorpresa es que los espacios en blanco son condicionales. Un elemento `w:t` descarta los espacios al principio y al final salvo que lleve `xml:space="preserve"`. Une los runs sin cuidado y obtienes «elinformetrimestral». Únelos con espacios y obtienes «trimes tr al».

La tercera sorpresa, y la que decide todo lo que viene después, es la indirección. Casi nada en `document.xml` dice lo que es:

| Lo que ves en `document.xml` | Dónde vive el significado | Qué tienes que seguir |
| --- | --- | --- |
| `w:pStyle` con el nombre de un estilo | `styles.xml` | La definición del estilo, más su cadena `w:basedOn` |
| `w:numPr` con `w:numId` y `w:ilvl` | `numbering.xml` | `w:num` hasta `w:abstractNumId` hasta `w:abstractNum` hasta el `w:lvl` correcto |
| `w:drawing` con un id `r:embed` | `word/_rels/document.xml.rels` | El id de relación hasta una ruta bajo `word/media/` |
| `w:hyperlink` con un `r:id` | la misma parte de relaciones | El id de relación hasta una URL |
| `w:footnoteReference` con un id | `footnotes.xml` | El cuerpo de la nota por su id |
| `w:commentRangeStart` y una referencia | `comments.xml` | El texto del comentario, su autor y su fecha |

Un encabezado es un párrafo cuyo estilo resuelve, dos archivos más allá, a algo llamado Heading 1. Una viñeta es un párrafo cuyo `w:numId` resuelve, a través de dos niveles de indirección, a una definición de numeración abstracta cuyo nivel cero tiene un `w:numFmt` de `bullet`. Una imagen es un id de relación. Nada se describe a sí mismo.

Y hay una capa por encima de todo esto. Los controles de contenido — elementos `w:sdt` — envuelven contenido arbitrario, así que los párrafos no siempre son hijos directos de `w:body`. Las tablas se anidan, y las celdas se fusionan mediante `w:gridSpan` y `w:vMerge` en lugar de algo parecido a `colspan`. Las imágenes llegan como `w:drawing` en DrawingML si se insertaron esta década y como `w:pict` en VML heredado si vinieron de un archivo antiguo o de un pegado. Las inserciones con control de cambios son runs normales envueltos en `w:ins`; las eliminaciones con control de cambios esconden su texto en `w:delText` en lugar de `w:t`, lo que significa que un lector que solo mira `w:t` acepta en silencio cada cambio pendiente como definitivo.

Así que escribir tu propio parser no es un fin de semana. Descomprimir con fflate y recorrer el XML es el cuarto fácil del trabajo. Los otros tres cuartos son la resolución de referencias, y eso es lo que estás eligiendo cuando eliges una biblioteca.

## Comparativa rápida: la chuleta

| Biblioteca | Lenguaje | Lee o escribe | Salida | Licencia |
| --- | --- | --- | --- | --- |
| mammoth | JavaScript (Node y navegador) | Lee `.docx` | HTML semántico, guiado por un mapa de estilos | Gratis, BSD de dos cláusulas |
| docx-preview | JavaScript (navegador) | Lee `.docx` | HTML que imita la página impresa | Gratis, Apache 2.0 |
| docx4js | JavaScript | Lee `.docx`, `.pptx` | Lo que construyan tus funciones visitantes | Gratis, MIT |
| docxtemplater | JavaScript | Escribe a partir de una plantilla `.docx` | Un `.docx` nuevo con los huecos rellenos | Gratis, MIT o GPL-3.0; módulos de pago |
| docx (dolanmiu) | JavaScript / TypeScript | Genera `.docx` | Un archivo de Word a partir de un árbol declarativo | Gratis, MIT |
| python-docx | Python | Lee y escribe | Un modelo de objetos que recorres tú mismo | Gratis, MIT |
| Pandoc como subproceso | Cualquiera (delega en un binario externo) | Lee `.docx` | HTML, Markdown, docenas de otros formatos | Gratis, GPL |
| LibreOffice sin interfaz | Cualquiera (delega en un binario externo) | Lee `.doc`, `.docx`, y más | HTML, o un `.docx` más limpio | Gratis, MPL-2.0 |
| Hacer el tuyo sobre fflate o JSZip | Cualquiera | Lee lo que tú implementes | Exactamente lo que escribas | Tu tiempo |

La columna que más importa es la tercera. Media confusión de este terreno viene de usar una biblioteca de escritura para un trabajo de lectura, porque el nombre del paquete no distinguía entre las dos cosas.

## mammoth y la filosofía del mapa de estilos

mammoth convierte `.docx` a HTML. No intenta reproducir tu documento. Su objetivo declarado es producir HTML simple y limpio usando la información semántica del archivo — los estilos con nombre — e ignorando el resto.

Esa única decisión explica todo lo que a la gente le gusta y todo lo que a la gente le molesta.

Piensa en un párrafo de Word que es de 16pt, negrita, azul oscuro y centrado, con 12pt de espacio encima. Un conversor centrado en la fidelidad emite un `div` con seis estilos en línea. mammoth se hace una pregunta distinta: ¿qué estilo tiene este párrafo? Si la respuesta es Heading 2, emite `<h2>`. Si la respuesta es Normal, emite `<p>` y descarta la negrita, el azul, el centrado y el espaciado, porque ninguna de esas cosas es lo que el párrafo *es*. Son solo cómo se veía.

```js
const mammoth = require("mammoth");

const result = await mammoth.convertToHtml(
  { path: "quarterly.docx" },
  {
    styleMap: [
      "p[style-name='Report Title'] => h1:fresh",
      "p[style-name='Report Subhead'] => h2:fresh",
      "p[style-name='Callout'] => aside.callout:fresh",
      "p[style-name='Code Sample'] => pre:separator('\\n')",
      "highlight[color='yellow'] => mark",
      "u => em",
      "comment-reference => sup",
    ],
    includeDefaultStyleMap: true,
  }
);

console.log(result.value);
```

Seis cosas de ese fragmento merecen explicarse.

**El emparejador es un nombre de estilo, entre comillas.** `p[style-name='Report Title']` empareja párrafos cuyo estilo se llama exactamente así. Los nombres de estilo son lo que el usuario ve en la galería de estilos de Word. mammoth también te deja emparejar por el **id** del estilo con sintaxis de punto — `p.ReportTitle` — que es más estable, porque los ids no cambian cuando el documento se abre en una versión de Word en otro idioma, mientras que los nombres a veces sí.

**`:fresh` no es decoración.** Sin él, mammoth fusiona párrafos consecutivos que coinciden en un solo elemento. Eso es correcto para un bloque `pre` e incorrecto para un encabezado. `:fresh` significa empezar un elemento nuevo cada vez. Olvidarlo en el mapeo de un encabezado produce un `h2` enorme que contiene tres encabezados distintos, y es el error de mapa de estilos más común de todos.

**`:separator()` cubre el caso contrario.** Cuando *sí* quieres que varios párrafos consecutivos se fusionen en un elemento, `pre:separator('\n')` pone un salto de línea entre ellos en lugar de pegar el texto sin más. Así es como una muestra de código de varios párrafos en Word se convierte en un `pre` utilizable.

**También existen emparejadores a nivel de run.** Los documentados incluyen `b`, `i`, `u`, `strike`, `all-caps`, `small-caps` y `highlight`, y `highlight` acepta un color opcional: `highlight[color='yellow'] => mark`. Así es como un documento donde el revisor resaltó las dudas abiertas se convierte en marcado que de verdad puedes consultar.

**`comment-reference` es un emparejador en sí mismo.** Los comentarios están soportados, y mapear `comment-reference => sup` es cómo las marcas de referencia llegan a la salida. Sin un mapeo para ello, los comentarios de revisión están entre las cosas que desaparecen sin avisar.

**`includeDefaultStyleMap` decide si estás extendiendo o sustituyendo.** Por defecto es `true`, así que tus reglas se añaden al mapa incorporado de mammoth en lugar de sustituirlo, y las tuyas tienen prioridad. Ponlo en `false` solo cuando quieras control total y estés dispuesto a mapear tú mismo el Heading 1.

Hay una opción más, `includeEmbeddedStyleMap`, y una función correspondiente, `mammoth.embedStyleMap(input, styleMap)`, que escribe un mapa de estilos **dentro** de una copia del `.docx`. Cuando mammoth lee después ese archivo, usa el mapa incrustado. Para un equipo que te entrega documentos construidos sobre estilos propios de la casa, es una idea genuinamente buena: el mapeo viaja con la plantilla en lugar de vivir en tu código, y quien renombra un estilo es quien tiene en la mano el archivo que lo describe.

### El build para el navegador

mammoth incluye un build independiente para el navegador, `mammoth.browser.js`, con sus dependencias ya empaquetadas, y el propio repositorio trae un ejemplo funcional en `browser-demo/index.html`. La única diferencia de API es la entrada: en vez de una ruta, le pasas un `arrayBuffer`.

```html
<input type="file" id="docx" accept=".docx">
<div id="out"></div>
<script src="mammoth.browser.js"></script>
<script>
  document.getElementById("docx").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
    document.getElementById("out").innerHTML = result.value;
    result.messages.forEach((m) => console.warn(m.type + ": " + m.message));
  });
</script>
```

Ese es el mecanismo completo detrás de cada conversor de Word en el navegador que hayas usado, incluido el de este sitio. El archivo lo lee la propia página, se convierte en tu máquina y nunca se envía a ninguna parte — algo que puedes comprobar con la pestaña de red abierta en vez de tener que creerlo por promesa.

Un aviso sobre ese fragmento, y no es menor: usar `innerHTML` con marcado que viene de un archivo que te ha mandado alguien es una decisión, no algo que se hace por defecto. La salida de mammoth se genera a partir de la estructura del documento, así que es mucho más limitada que HTML arbitrario, pero un `.docx` puede llevar un hipervínculo cuyo destino sea una URL `javascript:`, y un conversor que reproduce el enlace con fidelidad reproducirá también eso. Si el archivo no viene de ti, [sanea el resultado antes de que llegue al DOM](/blog/sanitising-markdown-safely).

Relacionado, y conviene saberlo antes de desplegar nada: mammoth documenta una opción `externalFileAccess`, y el acceso a archivos externos está **desactivado por defecto**, para activarse solo en documentos de confianza. Un `.docx` puede referenciar contenido fuera de sí mismo. El valor por defecto de la biblioteca es el seguro; déjalo así salvo que tengas una razón concreta para cambiarlo.

### mammoth en una tabla

| A favor | En contra |
| --- | --- |
| La salida es HTML semántico, del que habrías escrito a mano | Descarta el formato directo a propósito, incluidos color, tamaño y alineación |
| Los mapas de estilo cubren los estilos propios de la casa que ninguna otra herramienta conoce | Tienes que escribir esos mapas tú mismo; nada los infiere |
| Funciona igual en Node y en el navegador | Solo JavaScript |
| Informa de los estilos sin mapear en un array `messages` | Su propio escritor de Markdown está marcado como obsoleto por su autor |
| Las imágenes son configurables, no fijas | Sin geometría de página, porque HTML no tiene páginas |
| Incluye una CLI para trabajos puntuales | Cuadros de texto, campos y construcciones de maquetación llegan de forma desigual |

**Precio:** gratis, licencia BSD de dos cláusulas.

**¿Para quién es?** Para cualquiera cuyo siguiente paso sea HTML en una página o en un editor, y para cualquiera que convierta documentos producidos a partir de una plantilla conocida. Es la opción por defecto correcta en el navegador porque ahí no tiene competencia seria para una salida semántica.

## Imágenes y messages: las dos partes del resultado que hay que gestionar

Cada llamada a mammoth devuelve un objeto con dos propiedades, y la mayoría de los tutoriales usan solo una.

### Imágenes: base64 en línea, una función de conversión, o archivos en disco

Por defecto, las imágenes se incluyen en línea dentro del HTML de salida. En concreto, eso significa que se ejecuta `mammoth.images.dataUri` y cada imagen se convierte en un `<img>` cuyo `src` es una URI base64. Para un documento con dos logotipos esto es invisible y cómodo. Para un documento con cuarenta capturas de pantalla produce un archivo HTML varias veces más grande que el `.docx` original, y la codificación base64 añade aproximadamente un tercio más de peso sobre los bytes en crudo, antes de que nada de eso se guarde o se transmita.

La opción `convertImage` es cómo lo cambias, y `mammoth.images.imgElement` es el ayudante que envuelve tu función:

```js
const path = require("node:path");
const fs = require("node:fs/promises");

let index = 0;

const result = await mammoth.convertToHtml(
  { path: "quarterly.docx" },
  {
    convertImage: mammoth.images.imgElement(async (image) => {
      const extension = image.contentType.split("/")[1];
      const name = `image-${index++}.${extension}`;
      const buffer = await image.readAsBuffer();
      await fs.writeFile(path.join("media", name), buffer);
      return { src: `/media/${name}`, alt: image.altText ?? "" };
    }),
  }
);
```

El objeto de imagen que te pasa mammoth expone `contentType` — `image/png`, `image/jpeg` y así — y métodos de lectura para cada entorno: `readAsArrayBuffer()`, `readAsBuffer()` y `readAsBase64String()`. También hay un método más antiguo, `read([encoding])`, que la documentación marca como obsoleto; usa los tres explícitos.

Qué ruta conviene depende de a dónde va el HTML:

| Destino | Ruta | Por qué |
| --- | --- | --- |
| Un archivo autocontenido para enviar por correo | URIs base64 por defecto | El archivo se abre con la red desconectada |
| Una página de un sitio web | `convertImage` escribiendo archivos | El navegador cachea las imágenes por separado del marcado |
| Un CMS o un editor | `convertImage` subiendo, devolviendo la URL del CDN | Las imágenes pertenecen al CMS, no al marcado |
| Un trabajo puntual desde la terminal | La CLI con `--output-dir` | Escribe las imágenes como archivos separados por ti |

Dos detalles muerden a la gente. El primero es que `image.contentType` no es una extensión de archivo, y cortar por la barra es un atajo que produce `.jpeg` y `.svg+xml`; conviene mapearlo bien si los nombres de archivo importan. El segundo es que el texto alternativo en Word vive en un campo de descripción que casi ningún autor rellena, así que `alt` suele estar vacío y el problema de accesibilidad de tu salida se hereda, no se introduce.

### El array de messages: el único registro de lo que se descartó

La segunda propiedad del resultado es `messages`, un array de objetos con `type` — «warning» o «error» — un string `message`, y un `error` opcional que guarda la excepción lanzada cuando la hubo.

Es la API menos usada de toda esta categoría. Ningún otro conversor habitual te dice qué no pudo gestionar. Pandoc no enumera lo que normalizó en silencio. Un copia y pega no te dice nada, por definición. mammoth te entrega una lista.

```js
const { value, messages } = await mammoth.convertToHtml({ path: file });

const unmapped = messages.filter((m) => m.type === "warning");

if (unmapped.length) {
  console.warn(`${unmapped.length} things were not mapped:`);
  for (const m of unmapped) console.warn("  " + m.message);
}
```

Un aviso de estilo sin reconocer es una instrucción, no una queja. Está nombrando un estilo que existe en el documento y no tiene ninguna regla en tu mapa, lo que significa que esos párrafos salieron como `p` simples. Añade una línea al mapa de estilos y el aviso desaparece junto con el defecto. Ejecútalo sobre un corpus de documentos reales y los avisos se convierten en una lista de tareas ordenada por frecuencia.

El consejo práctico es directo: sácalos a la luz. Regístralos en una compilación, muéstralos en una interfaz, haz que un trabajo de CI falle cuando aparezca uno nuevo. Una canalización de conversión que descarta `messages` es una canalización que no puede distinguir una conversión limpia de una rota, y tampoco puedes tú.

## numbering.xml decide si las listas sobreviven o no

El fallo más reportado en esta categoría es que una lista numerada llega como una serie de párrafos sueltos, y el diagnóstico es casi siempre el mismo.

Un elemento de lista en `document.xml` tiene este aspecto — un párrafo con propiedades de numeración y ninguna otra pista sobre su naturaleza:

```xml
<w:p>
  <w:pPr>
    <w:numPr>
      <w:ilvl w:val="0"/>
      <w:numId w:val="4"/>
    </w:numPr>
  </w:pPr>
  <w:r><w:t>Approve the budget</w:t></w:r>
</w:p>
```

`w:ilvl` es el nivel de sangrado. `w:numId` apunta a un elemento `w:num` en `numbering.xml`, que apunta a un `w:abstractNumId`, que identifica un elemento `w:abstractNum`, que contiene un `w:lvl` por cada nivel, y *ahí* es donde `w:numFmt` finalmente dice `bullet`, o `decimal`, o `lowerLetter`, o `upperRoman`. Solo al final de esa cadena sabe alguien si el párrafo pertenece a un `ul` o a un `ol`.

Cada enlace de la cadena es un sitio donde puede romperse:

| Fallo | Causa | Qué ves |
| --- | --- | --- |
| `numbering.xml` no existe | El documento nunca tuvo una lista de verdad | Párrafos que empiezan con caracteres «1.» escritos a mano |
| `numId` no resuelve a nada | La parte se eliminó, o el documento está mal formado | Párrafos, sin marcado de lista |
| El autor escribió los números a mano | «1.», «2.», «3.» manuales, sin `w:numPr` alguno | Párrafos cuyo texto empieza por dígitos |
| La lista es un estilo, no una numeración | Un estilo «List Paragraph» con sangría pero sin `numPr` | Párrafos sangrados |
| Reinicios de nivel y `lvlOverride` | Word puede reiniciar la numeración a mitad de documento | Marcado de lista correcto, números visibles incorrectos |
| `lvlText` personalizado | Formatos como «Artículo 1.2 —» | Un `ol` que renumera desde 1 en el navegador |

Los dos últimos son el límite honesto y no un fallo. El `ol` de HTML tiene un atributo `start` y nada más. No puede expresar «reinicia en 1 para cada grupo de nivel dos pero sigue la secuencia del nivel uno», y no tiene equivalente de una cadena de formato de nivel personalizada. Un conversor que resuelve bien la estructura seguirá perdiendo los números visibles cuando el documento usó la numeración de Word como un sistema de citas legales. Si tu documento hace eso, los números son contenido y conviene ponerlos directamente en el texto.

Fíjate también en lo que el mapa de estilos alcanza y en lo que no. Los emparejadores documentados de mammoth cubren párrafos y sus estilos, runs y sus propiedades, tablas y referencias a comentarios. El manejo de listas está construido dentro del conversor en lugar de ser algo que configuras con una regla, así que el arreglo para una lista rota es un arreglo al documento — aplicar un estilo de lista de verdad — no una línea en tu mapa. Esa distinción ahorra una tarde entera.

La misma cadena explica por qué [las tablas y las listas se comportan de forma tan distinta al salir](/blog/markdown-tables-that-survive-conversion): la estructura de una tabla está ahí mismo en `document.xml` como elementos anidados, mientras que la estructura de una lista es una clave foránea.

## Las otras bibliotecas, y los trabajos distintos que hacen

### docx-preview — fidelidad en vez de semántica

docx-preview, del repositorio docxjs, es la apuesta contraria a la de mammoth. Su objetivo es renderizar un `.docx` como HTML que se parezca al documento, manteniendo el HTML todo lo semántico que puede mientras acepta que la prioridad es la apariencia. El punto de entrada principal es `renderAsync()`, que recibe el documento como un blob y un elemento destino, y se resuelve cuando termina el renderizado. `parseAsync()` y `renderDocument()` están disponibles para las dos mitades por separado.

Sus opciones lo delatan: `breakPages`, `ignoreWidth`, `ignoreHeight`, `renderHeaders`, `renderFooters`, `renderComments`, `useBase64URL`, `debug`. Son las preocupaciones de algo que dibuja una página — encabezados, pies, saltos de página, dimensiones físicas — nada de lo cual le importa a mammoth, porque un encabezado no tiene altura.

| A favor | En contra |
| --- | --- |
| La salida se parece al documento, con encabezados y saltos de página incluidos | El marcado es de presentación; no es contenido que quieras guardar |
| Renderiza comentarios, encabezados y pies de página | Orientado al navegador; no es un paso de conversión para Node |
| Opciones para ignorar la geometría de página cuando quieres que fluya | La biblioteca avisa que sus internos pueden cambiar; solo `renderAsync` se trata como estable |
| Sin ida y vuelta al servidor para una vista previa | No es una vía hacia Markdown ni hacia HTML limpio |

**Precio:** gratis, licencia Apache 2.0.

**¿Para quién es?** Para un visor. Si el usuario necesita *ver* el archivo de Word en tu aplicación antes de decidir algo, esta es la biblioteca. Si necesitas *guardar* lo que dice el archivo, es la equivocada — el marcado es un renderizado, no un documento.

### docx4js — un parser que conduces tú

docx4js parsea archivos de Office — `.docx` sobre todo, `.pptx` desde la versión 3.1.30, con `.xlsx` todavía limitado (ambos datos en su README, comprobado en github.com/lalalic/docx4js, el 8 de septiembre de 2026) — y te entrega el recorrido a ti. En lugar de construir un árbol completo en memoria, camina el documento, reconoce los modelos de Office XML y llama a tus funciones visitantes, lo que mantiene bajo el uso de memoria en archivos grandes. El renderizado ocurre a través de una función `createElement` que tú aportas, así que el formato de salida es enteramente decisión tuya.

Sus modelos identificados cubren una superficie amplia: secciones, encabezados, pies de página, párrafos, tablas, formas, imágenes, hipervínculos, controles de contenido incluidas casillas y desplegables, campos, ecuaciones, marcadores y gráficos.

| A favor | En contra |
| --- | --- |
| Reconoce construcciones que mammoth ignora — campos, ecuaciones, gráficos, controles de formulario | Tú escribes la capa de salida; no incluye ningún conversor a HTML |
| Funciones visitantes al estilo streaming en vez de un árbol completo | Un comienzo más cuesta arriba que un `convertToHtml` de una línea |
| También lee `.pptx` | Documentación más escasa que la de mammoth |
| Licencia MIT | Las líneas 2.x y 3.x traen cambios que rompen compatibilidad |

**Precio:** gratis, licencia MIT.

**¿Para quién es?** Para cualquiera cuyo requisito no sea HTML. Extraer el valor de cada control de contenido, sacar los gráficos de cien informes, construir un renderizador propio para una plantilla concreta — son trabajos de docx4js, y usar mammoth para ellos significa luchar contra una biblioteca diseñada precisamente para descartar ese material.

### docxtemplater — un trabajo completamente distinto

docxtemplater aparece en toda búsqueda de bibliotecas docx y no lee documentos en el sentido que buscas. Es un motor de plantillas que **genera** `.docx`, `.pptx` y `.xlsx` tomando un archivo de Word con huecos como `{first_name}` y sustituyéndolos por tus datos. El flujo es: leer el archivo plantilla, cargarlo en PizZip, construir un `Docxtemplater`, llamar a `render()` con tus datos, y escribir el resultado.

Su propia documentación dice sin rodeos que tanto docxtemplater como PizZip vienen del mismo equipo, y que capacidades adicionales llegan a través de módulos de pago — un módulo de imágenes para `{%image}`, un módulo de HTML para insertar texto formateado en un `.docx`, además de módulos de gráficos, XLSX, estilos, notas al pie, tablas, códigos QR y localización de errores, entre otros.

| A favor | En contra |
| --- | --- |
| La herramienta correcta para producir archivos de Word a partir de datos y una plantilla diseñada | No convierte un documento existente a nada |
| Conserva el estilo de la plantilla con exactitud, porque la plantilla *es* un `.docx` | El núcleo es gratis; varias capacidades viven detrás de módulos de pago |
| Doble licencia MIT o GPL-3.0 | La plantilla tiene que estar diseñada para esto |
| Mantenido desde hace mucho, con su autor describiéndolo como su trabajo principal | Los huecos dentro de Word pueden partirse entre varios runs, y eso es su propia clase de error |

**Precio:** gratis, con doble licencia MIT o GPL versión 3. Los módulos de pago los fija el proveedor por separado; consulta su propia página para las cifras actuales.

**¿Para quién es?** Contratos, facturas, certificados, cartas de oferta — cualquier cosa donde una persona diseñó la maquetación en Word y un programa aporta los valores. Nadie que convierta un documento a HTML lo necesita, y una cantidad sorprendente de gente lo instala antes de darse cuenta.

Esa nota sobre los huecos partidos entre runs no es una pega gratuita. Es el mismo hecho de la primera sección, visto desde el lado de la escritura: `{first_name}` puede guardarse como `{first_` + `name}` repartido en dos runs por una edición hecha hace meses, y todo motor de plantillas para docx tiene que lidiar con eso.

### docx de dolanmiu — generación, de forma declarativa

El paquete de npm literalmente llamado `docx` genera y modifica archivos `.docx` a partir de una API declarativa en TypeScript — `Document`, `Paragraph`, `TextRun`, `Table`, encabezados, pies de página, imágenes — y funciona en Node y en el navegador. Tiene licencia MIT.

**¿Para quién es?** Código que necesita entregarle a un usuario un archivo de Word. Se sitúa en el lado opuesto de la conversión respecto a mammoth, y las dos se usan a menudo en la misma aplicación: mammoth para leer, `docx` para escribir.

### python-docx — el modelo de objetos de referencia

Si tu canalización es Python, python-docx es el punto de partida equivalente, y es un tipo de herramienta genuinamente distinto: en lugar de convertir, te da un modelo de objetos para recorrer y editar. `Document`, `Paragraph`, `Run`, `Table` con `Row`, `Column` y `Cell`, `Section`, `Font` y `ParagraphFormat`, además de estilos, comentarios y formas. Su documentación tiene secciones dedicadas a encabezados y pies de página y a comentarios (comprobado en python-docx.readthedocs.io, el 8 de septiembre de 2026), y tiene licencia MIT.

| A favor | En contra |
| --- | --- |
| Lee y escribe con un solo modelo de objetos | Sin salida a HTML; el serializador lo escribes tú |
| API documentada para estilos, secciones, encabezados, pies de página y comentarios | El control de cambios no forma parte de la API documentada |
| Natural en una compilación Python o en una canalización de datos | Solo Python |
| Licencia MIT | Más código que un conversor, para un trabajo de conversión |

**¿Para quién es?** Para extraer y transformar en vez de convertir — sacar todas las tablas de un conjunto de informes a un dataframe, reescribir una cláusula en doscientos contratos, auditar qué documentos usan un estilo obsoleto. Cuando el requisito es «docx a HTML» y el lenguaje es Python, delegar en Pandoc suele ser menos código que construir un serializador sobre esto.

### Pandoc como subproceso — el atajo pragmático

La opción que la gente olvida: no parsear el documento en absoluto. Ejecutar Pandoc y leer su salida.

```js
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

const run = promisify(execFile);

const { stdout } = await run("pandoc", [
  "-f", "docx",
  "-t", "html",
  "--extract-media=./media",
  "--track-changes=all",
  "--sandbox",
  "quarterly.docx",
]);
```

El lector de `.docx` de Pandoc gestiona notas al pie, tablas, control de cambios y mucho más de lo que va a alcanzar cualquier biblioteca de JavaScript, y `--extract-media` te escribe las imágenes por separado. `--track-changes` es la opción cuya ausencia causa más confusión: un documento revisado tiene inserciones y eliminaciones dentro, y conviene elegir a propósito si quieres aceptarlas, rechazarlas o dejarlas anotadas, en lugar de aceptar lo que sea que traiga el valor por defecto. `--sandbox` restringe el acceso al sistema de archivos cuando el documento no es tuyo.

| A favor | En contra |
| --- | --- |
| Gestiona notas al pie, control de cambios y construcciones que ninguna biblioteca JS alcanza | Un binario externo en cada máquina que ejecuta tu código |
| Un solo comando, sin parser que mantener | Imposible en el navegador, y incómodo en la mayoría de entornos serverless |
| Convierte además a docenas de otros formatos desde la misma llamada | Sin equivalente a `messages`: no te dice qué normalizó |
| Licencia GPL y muchos años de vida | El HTML tiene el sabor de Pandoc; seguirás teniendo que postprocesarlo |

**¿Para quién es?** Para trabajo por lotes en el servidor, donde controlas el entorno. Es la respuesta correcta con más frecuencia de la que sugiere la lealtad a una biblioteca, y la respuesta equivocada en el momento en que el código tiene que correr en un navegador o en un contenedor que no construiste tú.

LibreOffice sin interfaz merece la misma nota al pie: `soffice --headless --convert-to html` lee archivos que nada más leerá, incluido el `.doc` binario antiguo, y también es útil solo como preprocesador — convertir primero el archivo raro a un `.docx` limpio, y entregárselo después a mammoth.

## Dónde mammoth es la respuesta equivocada, y qué cuesta

La recomendación del principio de este artículo tiene límites reales, y merece la pena decirlos con claridad porque son los que producen quejas después del despliegue.

**El formato directo desaparece, y eso es el diseño.** Un documento donde el autor nunca usó estilos — todo es Normal, con negrita y 18pt aplicados a mano — se convierte en un muro de elementos `p`. mammoth se está comportando correctamente: no hay información semántica en ese archivo para usar. El coste es que el arreglo no está en tu código. Alguien tiene que aplicarle estilos de verdad al documento, o tienes que escribir reglas de mapa de estilos contra propiedades de run y aceptar que es una apuesta. Reserva tiempo para esa conversación.

**La maquetación no existe en la salida.** Sin tamaño de página, sin márgenes, sin columnas, sin encabezados, sin pies de página, sin saltos de página. Si el requisito incluye la palabra «imprimir», mammoth no es la herramienta; docx-preview o una vía hacia PDF sí lo son.

**Los cuadros de texto, las formas y SmartArt llegan de forma desigual.** El contenido en un cuadro de texto flotante no está en el flujo del documento, y cualquier conversor a HTML tiene que decidir dónde ponerlo. Revisa un documento que los use antes de prometer nada.

**Los campos son valores, no fórmulas.** Un campo de número de página, una referencia cruzada, un campo de tabla de contenidos, un campo calculado — todos son instrucciones dentro del archivo, más un último resultado guardado en caché. HTML no tiene campos. Lo que obtienes es, como mucho, el texto en caché, y una tabla de contenidos se convierte en una lista de enlaces solo si el documento estaba construido lo bastante bien para que los anclajes existan.

**El escritor de Markdown está obsoleto.** mammoth tiene un `convertToMarkdown` y su documentación dice claramente que «el soporte de Markdown está obsoleto», recomendando en su lugar HTML más una biblioteca de HTML a Markdown independiente, con probabilidad de mejores resultados. Sigue ese consejo. Convierte a HTML y luego pasa un conversor dedicado — la elección entre [las bibliotecas de HTML a Markdown](/blog/best-html-to-markdown-converters) importa más de lo que suena, porque ahí es donde decides qué pasa con el marcado que Markdown no puede expresar.

**Los archivos muy grandes son una cuestión de memoria, sobre todo en el navegador.** Se lee el archivo completo, imágenes incluidas. Un documento de 30 MB con capturas de pantalla en alta resolución se hincha aún más como base64 en la salida, y una pestaña tiene menos margen que un servidor. Por eso los conversores alojados limitan el tamaño de subida; TransformPipe pone el límite de una conversión en 10 MB y el de un documento guardado en 4 MB, esto último porque una función de Vercel rechaza una petición o una respuesta con un cuerpo de más de 4,5 MB. Lo que construyas también necesitará un límite, y elegirlo a propósito es mejor que descubrirlo.

**Un solo documento no es un problema de biblioteca.** Si alguien necesita convertir hoy un único `.docx` a HTML o Markdown, instalar un parser y escribir un mapa de estilos es la vía más cara. [Los conversores que ya existen](/blog/best-word-to-markdown-converters) lo hacen en una pestaña del navegador. Recurre a una biblioteca cuando la conversión es una función de tu producto, no un recado puntual.

## Cómo elegir una biblioteca para docx

1. **Decide si quieres el significado o la apariencia, antes de comparar nada.** Querer las dos cosas es el error más caro de todos, porque te manda hacia un renderizador de fidelidad para guardar contenido, y el marcado de presentación que te llevas se quedará en tu base de datos durante años.
2. **Comprueba dónde corre el código.** Un navegador descarta cualquier subproceso y te deja con mammoth o docx-preview; un servidor controlado convierte a Pandoc en un candidato serio que casi no te cuesta código.
3. **Mira diez documentos reales antes de escribir el mapa de estilos, y cuenta los estilos.** Si los autores usaron estilos con nombre de verdad, mammoth producirá buen HTML a la primera; si formatearon a mano, ninguna biblioteca lo hará, y saberlo pronto convierte un problema de código en un problema de plantilla.
4. **Confirma que la biblioteca lee en lugar de escribir.** docxtemplater y `docx` son ambas excelentes y ninguna convertirá tu archivo, así que leer el primer párrafo de un README te ahorra una tarde de confusión.
5. **Conecta los avisos desde el primer día.** Con mammoth es el array `messages`; con cualquier otra cosa son tus propias comprobaciones sobre la salida, porque el silencio de un conversor no es prueba de que algo haya funcionado.
6. **Prueba un documento con una lista numerada, uno con imágenes y uno que haya pasado por revisión.** Esos tres cubren las tres cadenas que se rompen — `numbering.xml`, la parte de relaciones y las marcas de revisión — y si los tres salen bien, los documentos normales también saldrán bien.

## Conclusión

En JavaScript, leer un `.docx` y obtener HTML utilizable significa mammoth, y usarlo bien significa aceptar su trato: obtienes marcado semántico limpio porque mapea estilos con nombre y descarta la presentación, así que la calidad de tu salida depende de la calidad de los estilos del documento y del mapa de estilos que escribas contra ellos. Lee `messages` y la biblioteca te dirá exactamente dónde ese mapa se queda corto. Elige `convertImage` a propósito en vez de enviar una página llena de base64. Si el trabajo es ver un documento en lugar de guardar lo que dice, usa docx-preview; si es extraer campos o gráficos, usa docx4js; si es producir un archivo de Word, usa `docx` o docxtemplater; y si el código corre en un servidor que controlas, Pandoc como subproceso te da menos trabajo que cualquiera de las anteriores. Para un solo archivo no se necesita ninguna biblioteca en absoluto — [soltarlo en un conversor de navegador](/word-to-markdown) tarda unos diez segundos y no sube nada.

## Preguntas frecuentes

### ¿Cómo convierto un .docx a HTML en JavaScript?

Usa mammoth: `mammoth.convertToHtml({path: "file.docx"})` en Node, o `mammoth.convertToHtml({arrayBuffer: buffer})` en el navegador con el build `mammoth.browser.js`. El resultado tiene una propiedad `value` con el HTML y un array `messages` que enumera lo que no se pudo mapear. Añade un `styleMap` para los estilos propios de Word que use tu documento.

### ¿Por qué la salida de mammoth pierde mi formato?

Porque está diseñada así. mammoth mapea información semántica — estilos con nombre — a elementos HTML y descarta el formato directo, como el color, el tamaño de letra y la alineación. Si los autores del documento aplicaron negrita y 18pt a mano en lugar de usar un estilo de encabezado, no hay nada que mammoth pueda mapear, y el arreglo es dar estilo de verdad al documento o escribir reglas de mapa de estilos contra propiedades de run.

### ¿Por qué mis listas numeradas se convirtieron en párrafos sueltos?

Casi siempre porque la lista nunca fue una lista de verdad. Word guarda la pertenencia a una lista como un `w:numId` que se resuelve a través de `numbering.xml`, así que si esa parte falta, el id no resuelve, o el autor escribió «1.» y «2.» a mano, el conversor ve párrafos normales. Aplica un estilo de lista genuino en Word y convierte de nuevo.

### ¿Puedo leer un .docx en el navegador sin subirlo a ningún sitio?

Sí. `mammoth.browser.js` lee el `arrayBuffer()` de un objeto `File` y convierte todo dentro de la propia página, así que no se envía nada a un servidor. Así funcionan los conversores de Word basados en navegador, y puedes confirmarlo en cualquiera de ellos mirando la pestaña de red mientras un archivo se convierte.

### ¿Debería usar el convertToMarkdown de mammoth?

No. Su propia documentación marca el soporte de Markdown como obsoleto y recomienda generar HTML y pasarlo a una biblioteca dedicada de HTML a Markdown. HTML tiene un elemento para casi todo lo que un `.docx` puede contener y Markdown no, así que la vía en dos pasos le da a la segunda biblioteca más con qué trabajar.

### ¿Cuál es la diferencia entre mammoth y docx-preview?

Optimizan para cosas opuestas. mammoth produce HTML semántico limpio a partir de estilos con nombre e ignora la apariencia; docx-preview renderiza el documento para que se parezca a la página impresa, con opciones para saltos de página, encabezados y pies de página. Usa mammoth cuando quieras contenido para guardar, y docx-preview cuando un usuario necesite mirar el archivo.

### ¿Puedo simplemente descomprimir el .docx y parsear el XML yo mismo?

Puedes, y descomprimir es la parte fácil. Lo difícil es que el significado se guarda por referencia: los estilos en `styles.xml`, las listas en `numbering.xml`, las imágenes y los enlaces en la parte de relaciones, y el texto repartido de forma arbitraria entre runs, de modo que una sola palabra puede ser tres elementos. Esa resolución de referencias es la mayor parte de lo que es una biblioteca, y reimplementarla es un proyecto, no una tarea.
