---
title: "Cómo convertir DOCX a Markdown: las rutas del navegador, Pandoc y mammoth"
description: "Convierte un .docx a Markdown de tres formas, entiende qué decide lo que sobrevive, y encuentra lo que la conversión descartó en silencio"
date: 2026-09-04
tag: Conversión
keywords: docx a markdown, convertir docx a markdown, docx a md, pandoc docx a markdown, mammoth docx a markdown, docx a markdown línea de comandos, docx a markdown sin subir archivo, docx a markdown numeración
---

Tienes un archivo de Word y necesitas Markdown. Primer movimiento razonable: abrir el `.docx` en
un editor de texto y ver con qué estás tratando. Lo que obtienes es una pantalla de basura binaria
con las letras `PK` al principio y unos pocos nombres de archivo reconocibles enterrados dentro.
Nada en esa pantalla sugiere un documento.

Esa pantalla es lo más útil que verás en todo el día, porque te dice qué es en realidad la
conversión. Un `.docx` no es un archivo con texto dentro. Es un archivo zip que contiene una docena
de archivos XML, y las palabras están en uno de ellos mientras el significado de esas palabras está
repartido por los demás. Convertirlo a Markdown significa descomprimir el archivo, resolver esas
referencias cruzadas, y descartar todo aquello para lo que Markdown no tiene sintaxis.

Por eso el mismo documento se convierte de forma distinta en herramientas distintas, y por eso los
fallos son tan específicos. Las cabeceras llegan pero la lista numerada salió como párrafos
normales. La tabla llegó sin su fila de cabecera. Las imágenes o faltan, o están presentes como una
sola línea de base64 de cuarenta mil caracteres de largo. Las notas al pie simplemente no están, y
nada te avisó. Cada uno de estos casos tiene una causa que puedes encontrar en unos dos minutos en
cuanto sabes dónde mirar.

Esto es el cómo hacerlo: qué hay dentro del archivo, tres rutas para sacarlo, y luego la parte que
casi ninguna guía cubre — cómo leer el resultado y averiguar qué se perdió.

### Resumen

Para un solo documento, usa un conversor que corra en el navegador: suelta el `.docx`, lee el
Markdown, sin instalar nada y sin subir nada. Para más de un documento, para imágenes que necesitas
en disco, o para un archivo que ha pasado por revisión, instala **Pandoc** y usa
`pandoc -f docx -t gfm --wrap=none --extract-media=./media`. Para convertir dentro de tu propio
código, usa **mammoth** para producir HTML y un paso aparte de HTML a Markdown después — que es lo
que recomiendan los propios autores de mammoth. Luego comprueba tres cosas en la salida antes de
tirar el `.docx`: si las listas numeradas siguen siendo listas, adónde fueron las imágenes, y si las
notas al pie existen siquiera.

## Qué es en realidad un .docx, y por qué un editor de texto muestra sinsentido

Un `.docx` es un archivo zip en el formato Office Open XML, estandarizado como ECMA-376 e
ISO/IEC 29500. Todo archivo zip del mundo empieza con los dos bytes `PK`, las iniciales de Phil
Katz, quien escribió el formato original — así que eso es lo primero que muestra tu editor de
texto, seguido de datos comprimidos que no tiene forma de mostrar.

Renombra una copia a `.zip`, descomprímela, y el documento se convierte en un directorio:

```
$ cp report.docx report-copy.zip
$ unzip -l report-copy.zip
  [Content_Types].xml
  _rels/.rels
  word/document.xml
  word/styles.xml
  word/numbering.xml
  word/settings.xml
  word/fontTable.xml
  word/footnotes.xml
  word/media/image1.png
  word/media/image2.jpeg
  word/_rels/document.xml.rels
  docProps/core.xml
  docProps/app.xml
```

La lista exacta varía, y la variación es la parte interesante. `word/numbering.xml` solo está ahí si
el documento ha tenido alguna vez una lista. `word/footnotes.xml` solo está si tiene notas al pie.
`word/media/` solo existe si hay imágenes. `word/header1.xml` aparece si alguien puso una cabecera
que se repite. Un archivo comprimido al que le falta una de esas partes le falta la función
correspondiente, y ningún conversor puede inventarla.

En Windows, PowerShell no expandirá un archivo cuya extensión no sea `.zip`, así que cópialo
primero:

```powershell
Copy-Item report.docx report-copy.zip
Expand-Archive report-copy.zip -DestinationPath .\report-unzipped
```

`word/document.xml` suele ser una sola línea enorme, porque Word no tiene ningún motivo para
hacerlo legible. Pásalo por un formateador antes de intentarlo:

```
$ xmllint --format report-unzipped/word/document.xml | head -60
```

Ahora la parte importante. En ese XML, **el significado se guarda por referencia**. Una cabecera no
está etiquetada como cabecera. Es un párrafo que lleva un elemento `w:pStyle` que nombra un estilo,
y la definición de ese estilo —allá en `styles.xml`— es lo que dice que es Heading 1. Un elemento de
lista es un párrafo que lleva un elemento `w:numPr` con un `w:numId` y un `w:ilvl`, y si eso es una
viñeta o un número decimal vive en `numbering.xml`. Una imagen es un atributo `r:embed` que contiene
un id de relación, y `word/_rels/document.xml.rels` es lo que convierte ese id en
`word/media/image1.png`.

Así que un conversor de `.docx` a Markdown es un programa que hace cuatro cosas en orden:
descomprime el paquete, recorre `document.xml`, resuelve las referencias de cada elemento contra
las demás partes, y serializa el resultado como Markdown. Cada diferencia entre herramientas es una
diferencia en el paso tres o el paso cuatro. Cuando el paso tres no puede resolver algo, el
conversor no tiene ni idea de qué estaba mirando, y lo que obtienes es un párrafo normal.

| Parte del archivo comprimido | Qué contiene | Qué se rompe sin ella |
| --- | --- | --- |
| `word/document.xml` | Los párrafos, los tramos y las tablas | Nada se convierte en absoluto |
| `word/styles.xml` | Las definiciones de estilo con nombre | Las cabeceras llegan como párrafos en negrita |
| `word/numbering.xml` | Los formatos de lista, niveles y reinicios | Las listas numeradas y con viñetas llegan como párrafos |
| `word/_rels/document.xml.rels` | Los ids de relación hacia rutas de archivo | No se pueden localizar las imágenes |
| `word/media/` | Los propios archivos de imagen | Las referencias a imágenes apuntan a nada |
| `word/footnotes.xml` | Los cuerpos de las notas al pie | Marcadores de nota sin texto, o sin notas al pie |
| `word/comments.xml` | Los comentarios de revisión | Comentarios descartados, normalmente en silencio |

## Qué ruta para qué trabajo

| Ruta | Mejor para | Instalación necesaria | Qué hace con las imágenes | Precio |
| --- | --- | --- | --- | --- |
| Conversor de navegador | Un documento, ahora, sin subirlo | Ninguna | Las incrusta, o deja referencias | Gratis |
| Pandoc | Lotes, cambios rastreados, imágenes en disco | Pandoc | `--extract-media` las escribe en una carpeta | Gratis, GPL |
| mammoth (Node o navegador) | Conversión dentro de tu propia aplicación | npm | Data URIs por defecto, o tu propio callback | Gratis, BSD de 2 cláusulas |
| CLI de mammoth | Un trabajo puntual con las imágenes como archivos | npm | `--output-dir` las escribe junto al HTML | Gratis, BSD de 2 cláusulas |
| MarkItDown | Alimentar texto a un pipeline, no a una persona | Python | Extraídas donde el formato lo permite | Gratis, MIT |
| Word, Guardar como página web | Un documento que otros conversores estropean | Word | Escrito en una carpeta junto al HTML | Con Word |
| Exportación de Google Docs | Un documento ya en Drive | Ninguna | Incluida en la descarga | Gratis con una cuenta |
| Copiar y pegar | Unos pocos párrafos, de inmediato | Ninguna | Se pierden | Gratis |
| LibreOffice, sin interfaz | `.doc`, `.rtf` viejos y formatos raros | LibreOffice | Se lleva al `.docx` que escribe | Gratis, MPL 2.0 |
| python-docx y tu propio escritor | Una norma de la casa que ningún conversor implementa | Python | Lo que tú escribas | Gratis, MIT |
| Descomprimir y leer el XML | Diagnosticar por qué falló una conversión | Ninguna | Los estás mirando directamente | Gratis |

Tres de esas filas son las rutas que casi todo el mundo usa de verdad, y el resto de este artículo
trata principalmente de ellas. Si quieres las rutas comparadas como productos en lugar de como
procedimientos —precios, licencias, a quién le conviene cada una—,
[la comparativa completa de herramientas de Word a Markdown](/blog/best-word-to-markdown-converters)
cubre las que esta página solo enumera.

## La ruta del navegador: suelta el archivo, lee el Markdown

Un conversor de navegador lee el `.docx` con JavaScript en tu propia máquina. El archivo se
descomprime en la página, el XML se recorre en la página, y el Markdown aparece en la página. Sin
haber iniciado sesión, ninguna parte del archivo se envía a ningún sitio, y eso se puede comprobar
en vez de tener que creerlo: abre la pestaña de red, convierte, y observa que no pasa nada.

El procedimiento son cuatro pasos y no hay nada que configurar.

1. Abre la página de conversión.
2. Suelta el `.docx` sobre ella, o elígelo desde el diálogo de archivos.
3. Lee el Markdown que aparece, y edítalo en el sitio si lo necesitas.
4. Descarga el `.md`, o cópialo.

| A favor | En contra |
| --- | --- |
| Sin instalar, sin terminal, sin cuenta | Un documento a la vez, no un directorio |
| Nada se sube cuando no has iniciado sesión | El navegador hace el trabajo, así que un archivo muy grande está limitado por la máquina |
| Cabeceras, listas, tablas, enlaces, negrita y cursiva se conservan | Sin opción para extraer las imágenes a una carpeta de tu elección |
| El resultado se puede editar antes de llevártelo | Los cambios rastreados se resuelven como texto aceptado; los comentarios no se conservan |

Hay un techo de tamaño que merece la pena conocer de antemano, porque es lo único que te va a
parar. En TransformPipe, la conversión en sí está limitada a 10 MB, y un documento que guardas en tu
historial está limitado a 4 MB, porque la función que lo almacena rechaza un cuerpo de petición más
grande. Un `.docx` se hace grande por una razón — las fotografías— así que si un archivo se pasa del
límite, la respuesta suele ser revisar qué hay en `word/media/` en vez de suponer que el documento es
enorme.

Por debajo, la ruta del navegador es en general mammoth más un paso de HTML a Markdown, que es
exactamente el arreglo que recomienda la propia documentación de mammoth. Eso importa más de lo que
suena: significa que la ruta del navegador y la ruta de mammoth de más abajo tienen las mismas
fortalezas y los mismos puntos ciegos, y un documento que se convierte mal en una se va a convertir
mal en la otra.

**¿Para quién es?** Para cualquiera con un documento y una razón para no publicarlo en el servidor
de un desconocido — un contrato, una nota de paciente, un informe interno, un plan sin publicar.
También para cualquiera que simplemente quiera el Markdown en los próximos treinta segundos sin
aprender un indicador.

## La ruta de Pandoc: un comando, y los cuatro indicadores que importan

Pandoc es un conversor de documentos de línea de comandos escrito en Haskell que lee y escribe
alrededor de cuarenta formatos. Su lector de `.docx` es el más configurable que existe, y es la
única ruta de esta página con una respuesta documentada para los cambios rastreados.

El comando en su forma útil más corta:

```
$ pandoc -f docx -t gfm --wrap=none -o report.md report.docx
```

Eso es: lee `docx`, escribe GitHub Flavored Markdown, no reajustes los párrafos, saca a
`report.md`. Deja fuera `--wrap=none` y Pandoc va a ajustar tu prosa a 72 columnas de forma
forzada, lo cual produce un archivo hostil para los diffs y es lo primero que la mayoría de la
gente quiere deshacer.

Con las imágenes extraídas:

```
$ pandoc -f docx -t gfm --wrap=none \
    --extract-media=./media \
    -o report.md report.docx
```

Y para un documento que ha pasado por revisión:

```
$ pandoc -f docx -t gfm --wrap=none \
    --track-changes=all \
    -o report.md report.docx
```

Un directorio entero, en bash:

```
$ for f in *.docx; do
    pandoc -f docx -t gfm --wrap=none -o "${f%.docx}.md" "$f"
  done
```

Lo mismo en PowerShell:

```powershell
Get-ChildItem *.docx | ForEach-Object {
  pandoc -f docx -t gfm --wrap=none -o "$($_.BaseName).md" $_.Name
}
```

| Indicador | Qué hace | Por qué lo quieres |
| --- | --- | --- |
| `-t gfm` | Elige GitHub Flavored Markdown como salida | Las tablas y el tachado son GFM, no CommonMark. El dialecto por defecto de Pandoc es su propio Markdown extendido, que no es lo mismo |
| `--wrap=none` | Para de reajustar los párrafos a un límite de columna | Un párrafo por línea significa diffs legibles |
| `--extract-media=DIR` | Escribe las imágenes incrustadas en un directorio | Si no, las imágenes se quedan en el archivo comprimido que estás a punto de dejar de usar |
| `--track-changes=accept\|reject\|all` | Decide qué pasa con las inserciones, borrados y comentarios | `accept` es el valor por defecto y descarta la revisión en silencio; `all` conserva todo envuelto en tramos |
| `--markdown-headings=atx` | Fuerza cabeceras al estilo `#` | El propio escritor `markdown` de Pandoc usa cabeceras subrayadas para los dos primeros niveles si no |

| A favor | En contra |
| --- | --- |
| Programable, así que doscientos archivos cuestan lo mismo que uno | Una instalación, y una terminal |
| El único control documentado sobre los cambios rastreados y los comentarios | Su dialecto de salida por defecto no es GFM salvo que lo pidas |
| Las imágenes salen a una carpeta con un solo indicador | Los estilos personalizados de Word necesitan un mapeo que escribes tú |
| Lee y escribe `.docx`, así que los viajes de ida y vuelta son posibles | El manual es largo y los indicadores son muchos |

**Precio:** gratis, licencia GPL.

**¿Para quién es?** Para cualquiera que convierta más de un archivo, cualquiera que necesite las
imágenes como archivos, y cualquiera que tenga un documento que ha pasado por revisión legal o
editorial. Si un `.docx` tiene cambios rastreados, esta es la única ruta de la página que no los va
a resolver en silencio por ti.

## La ruta de mammoth: convertir un .docx dentro de tu propio código

mammoth es una biblioteca de JavaScript que convierte `.docx` a HTML, con compilaciones para Node y
para el navegador. Muchas herramientas de «Word a Markdown» resultan ser mammoth con un segundo
paso pegado encima, y si estás escribiendo tu propio conversor es la base sensata.

Su idea distintiva es el mapa de estilos. En lugar de adivinar qué es un párrafo, mammoth hace
coincidir los estilos con nombre de Word con elementos HTML, y el mapeo es configuración que
controlas tú:

```js
const mammoth = require("mammoth");
const TurndownService = require("turndown");

const { value: html, messages } = await mammoth.convertToHtml(
  { path: "report.docx" },
  {
    styleMap: [
      "p[style-name='Chapter Title'] => h1:fresh",
      "p[style-name='Section Heading'] => h2:fresh",
      "p[style-name='Intense Quote'] => blockquote:fresh",
    ],
  }
);

const markdown = new TurndownService().turndown(html);

for (const message of messages) {
  console.warn(message.message);
}
```

Dos cosas de ese fragmento son toda la razón para usar la biblioteca.

La primera es `styleMap`. Una organización con estilos propios de la casa —«Chapter Title» en vez
de «Heading 1»— va a obtener párrafos normales de cualquier otra herramienta de esta página, porque
no hay ninguna regla en ningún sitio que diga que un estilo llamado «Chapter Title» es una cabecera.
Aquí escribes esa regla tú. El sufijo `:fresh` le dice a mammoth que empiece un elemento nuevo en
vez de fusionarlo con el anterior, que es lo que quieres para las cabeceras y lo que no quieres para
un estilo que continúa un párrafo.

La segunda es `messages`. Cada resultado de mammoth lleva un array de avisos que lista los estilos
que no reconoció y los elementos que no gestionó. Esta es la única cuenta legible por máquina de lo
que descartó un conversor que ofrece cualquier ruta de esta página. Imprímela, regístrala,
muéstrasela a tus usuarios. Un aviso de estilo no reconocido es el momento exacto para añadir una
línea al mapa de estilos.

El README de mammoth marca su propio escritor de Markdown como obsoleto y recomienda generar HTML y
convertir eso a Markdown en su lugar. Sigue el consejo — HTML tiene un elemento para casi todo lo
que contiene un `.docx`, Markdown no, y pasar por HTML le da al segundo paso algo con lo que
trabajar. La elección de esa segunda biblioteca es su propia decisión pequeña, y
[los conversores de HTML a Markdown que merece la pena considerar](/blog/best-html-to-markdown-converters)
se diferencian sobre todo en qué hacen con el marcado que Markdown no puede expresar.

En el navegador, la entrada es un `ArrayBuffer` en vez de una ruta:

```js
const buffer = await file.arrayBuffer();
const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buffer });
```

Y desde la línea de comandos, para un trabajo puntual, el paquete trae una CLI que escribe las
imágenes como archivos separados en vez de incrustarlas:

```
$ npx mammoth report.docx --output-dir=out
```

| A favor | En contra |
| --- | --- |
| Corre en Node y en el navegador | Produce HTML; el paso a Markdown es tuyo |
| Los mapas de estilo gestionan bien los estilos personalizados de Word | Su propio escritor de Markdown está marcado como obsoleto por sus autores |
| Informa de lo que no pudo mapear, en `messages` | Solo JavaScript |
| Se incluye una CLI para trabajos puntuales | Sin diseño de página, porque HTML no tiene página |

**Precio:** gratis, licencia BSD de 2 cláusulas.

**¿Para quién es?** Para quien construye conversión dentro de una aplicación, y para cualquiera cuyos
documentos usen estilos propios de la casa en lugar de los incorporados de Word. En el navegador es,
en la práctica, la única opción real.

## Dónde falla la conversión, y qué cuesta

Todo lo de arriba funciona. Lo que sigue es lo que pasa de todos modos, porque un `.docx` tiene
cientos de construcciones y Markdown tiene alrededor de una docena. Las pérdidas son estructurales,
no errores, y la pregunta útil es a cuáles estás dando tu conformidad.

### La numeración solo sobrevive cuando numbering.xml resuelve la lista

Esta es la queja más común sobre la conversión de `.docx`, y tiene una causa precisa.

Una lista numerada en Word es un conjunto de párrafos, cada uno con un `w:numPr` que lleva un
`w:numId` y un `w:ilvl`. Eso es todo. El párrafo no sabe que está numerado, no sabe qué número le
toca, y no sabe si es una viñeta o un decimal. Todo eso vive en `numbering.xml`, donde un elemento
`w:num` mapea el `w:numId` a una definición abstracta, y esa definición lleva un `w:lvl` por cada
nivel de sangría con un `w:numFmt` que dice `bullet`, `decimal`, `lowerRoman` y así.

Así que un conversor que se encuentra con un párrafo de lista tiene que seguir dos saltos: del
`w:numId` a la definición de numeración, y luego del `w:ilvl` al nivel dentro de ella. Si cualquiera
de los dos saltos falla —la parte está ausente, o está presente pero no contiene la definición a la
que se hace referencia— el conversor no tiene nada de lo que partir. No sabe siquiera que el
párrafo era un elemento de lista. Lo que emite es un párrafo normal, y lo emite sin quejarse, porque
desde su punto de vista no ha pasado nada malo.

Leer el código fuente de mammoth deja ver el mecanismo directamente: un nivel cuenta como ordenado
cuando su formato de número es cualquier cosa distinta de `bullet`, y cuando no se encuentra la
parte de numeración la biblioteca cae en un conjunto vacío de definiciones. Con un conjunto vacío,
la búsqueda de la numeración de un párrafo no devuelve nada, el párrafo deja de coincidir con la
regla que lo habría convertido en un elemento de lista, y sale como prosa.

Por eso las listas de un documento se convierten a la perfección y las del siguiente se colapsan.
No es que la herramienta sea inconsistente. Un archivo comprimido tenía una parte de numeración
usable y el otro no — algo que le pasa a archivos montados por scripts, exportados desde otras
aplicaciones, generados por herramientas de informes, o reparados por Word después de un
cuelgue. Antes de culpar al conversor, descomprime el archivo y mira:

```
$ unzip -l report-copy.zip | grep numbering
```

Que no aparezca `word/numbering.xml` en la lista significa que ninguna ruta de esta página te va a
dar listas, y la solución está río arriba: abre el documento en Word o LibreOffice, aplica un
formato de lista real, guarda, y convierte la copia guardada. Y comprueba el anidamiento de lo que
sí sobreviva, porque los subniveles que se aplanan al nivel superior son un fallo distinto con sus
propias causas —
[la sangría de listas y los saltos de línea](/blog/markdown-line-breaks-and-lists) se comportan mal
en Markdown por razones que no tienen nada que ver con Word.

### Las imágenes llegan como archivos separados, como base64, o a ningún sitio

Markdown nunca contiene una imagen. Contiene una referencia a una — `![caption](path/to/image.png)`
— y el archivo tiene que existir en esa ruta cuando algo renderiza el Markdown. Un `.docx`, en
cambio, contiene los propios bytes de la imagen dentro de `word/media/`. Cerrar esa brecha es una
decisión, y cada ruta toma una distinta.

| Ruta | Qué obtienes | Qué tienes que hacer después |
| --- | --- | --- |
| Pandoc con `--extract-media=./media` | Archivos de imagen en `./media`, referencias que apuntan a ellos | Mantén la carpeta junto al Markdown, y haz commit de las dos |
| Pandoc sin él | Referencias a una ruta que no existe en disco | Vuelve a ejecutar con el indicador |
| mammoth, por defecto | `<img src="data:image/png;base64,...">` en el HTML | Decide si quieres un archivo enorme o archivos separados |
| mammoth con un callback `convertImage` | Lo que tú escribas | Escribe los archivos y devuelve el `src` que quieras |
| CLI de mammoth con `--output-dir` | Imágenes como archivos junto al HTML | Convierte el HTML a Markdown, con las rutas intactas |
| Copiar y pegar | Nada | Guarda cada imagen desde Word a mano |

El caso del base64 es el que más sorprende a la gente. Un data URI es legal, autónomo, y se
renderiza correctamente — y una sola fotografía se convierte en una línea de Markdown de decenas de
miles de caracteres, lo cual hace el archivo ilegible en un editor, imposible de revisar en un
diff, y lento en cualquier cosa que resalte sintaxis. Es la respuesta correcta cuando el Markdown
tiene que viajar solo, sin ninguna carpeta al lado, y la equivocada en un repositorio.

El valor por defecto de mammoth es el data URI, y anularlo es una opción documentada y no un truco:

```js
const options = {
  convertImage: mammoth.images.imgElement(function (image) {
    return image.read("base64").then(function (data) {
      return { src: "data:" + image.contentType + ";base64," + data };
    });
  }),
};
```

Ese ejemplo reproduce el valor por defecto; cambia el cuerpo por código que escriba los bytes en un
archivo y devuelva un `src` relativo, y tienes imágenes en disco con las rutas que elegiste. Sea la
ruta que tomes, las imágenes son la parte de la conversión más propensa a romperse después en vez
de ahora, cuando el Markdown se mueve y la carpeta no —
[lo que de verdad mantiene funcionando una referencia a una imagen](/blog/images-and-links-that-still-work)
merece la pena leerlo antes de hacer commit de cien archivos convertidos.

### Cabeceras que nunca fueron cabeceras

Si alguien construyó sus cabeceras seleccionando una línea, poniéndola a 18pt y pulsando negrita,
no hay ningún `w:pStyle` que resolver, y ningún conversor puede distinguir esa línea de una frase
enfática. Vas a obtener `**Chapter Two**` como párrafo, o texto plano, según la herramienta.

Esto no se arregla en el conversor, solo río arriba. Abre el documento, aplica estilos de cabecera
reales desde la galería de estilos, guarda, convierte de nuevo. Si el documento usa estilos con
nombre personalizados en su lugar, el `styleMap` de mammoth es la respuesta y Pandoc necesita un
mapeo de estilos que escribes tú. El coste de no arreglarlo es que tu Markdown no tiene ninguna
estructura de documento — sin índice, sin anclas, sin esquema— y la estructura es la mayor parte de
para qué sirve Markdown.

### Tablas que pierden su cabecera, o su forma

La sintaxis de tabla de Markdown es una rejilla de celdas sencillas, con una fila de cabecera, sin
combinaciones, y sin contenido de bloque. Una tabla de `.docx` es una estructura anidada de filas y
celdas con combinaciones, alineación vertical, tablas anidadas y párrafos dentro de las celdas.

Una rejilla plana se convierte bien. Cualquier otra cosa se degrada: una celda de cabecera
combinada se convierte en una sola celda y las columnas se desplazan, una celda que contiene una
lista con viñetas se convierte en una celda con el texto de la lista pegado, una tabla anidada se
aplana o se descarta. Peor aún, el resultado suele parecer plausible. El fallo no es un desastre en
la página, es una tabla que se lee correctamente y tiene el dato equivocado en la columna
equivocada. Cuenta las columnas de la salida contra las columnas de Word, en la tabla más ancha del
documento, antes de fiarte de cualquiera de ellas —
[las tablas son lo que más se rompe en cualquiera de las dos direcciones](/blog/markdown-tables-that-survive-conversion).

Las filas de cabecera desaparecen por una razón concreta que merece la pena conocer: Word marca una
fila de cabecera con una propiedad de fila de tabla, y un conversor que la ignora produce una tabla
cuya primera fila es una fila de datos normal. Markdown exige una fila de cabecera, así que lo que
obtienes es o una tabla con la primera fila de datos promocionada a cabecera, o una tabla con una
cabecera vacía y todo desplazado una fila hacia abajo.

### Notas al pie, comentarios y cuadros de texto

Las **notas al pie** viven en `word/footnotes.xml` y se referencian desde el texto con un
`w:footnoteReference`. Solo tienen dónde aterrizar en algunos dialectos: las notas al pie no están
ni en CommonMark ni en la especificación GFM, así que existen como extensiones. El propio dialecto
Markdown de Pandoc tiene sintaxis de notas al pie; un conversor que apunta a CommonMark estricto
tiene que meterlas en línea, añadirlas como párrafos normales al final, o descartarlas. Baja hasta
el final de la salida y mira antes de suponer nada.

Los **comentarios** son una conversación pegada a un rango de texto, y Markdown no tiene ningún
ancla a la que sujetarla. El manual de Pandoc dice que tanto `accept` como `reject` ignoran los
comentarios y que solo `--track-changes=all` los incluye. mammoth los deja fuera salvo que añadas tú
mismo un mapeo de referencia a comentarios. Todo lo demás los descarta sin decirlo. El hilo de
revisión suele ser lo más valioso de un documento y es lo primero que se pierde.

Los **cuadros de texto y las formas** son objetos de dibujo, no parte del flujo del documento. El
texto de dentro puede estar casi en cualquier sitio del XML relativo a dónde aparece en la página, y
suele desaparecer. Esta es la pérdida que a la gente más le cuesta creer, porque la cita destacada
estaba justo ahí en pantalla. Busca en la salida una frase que sabes que estaba en un cuadro de
texto; si falta, nunca estuvo en el flujo.

Y luego están las cosas sin ningún equivalente en Markdown: fuentes, tamaños de punto, colores,
márgenes, tamaño de página, saltos de página, cabeceras, pies de página y números de página. No
«mal soportado» — ausente de la sintaxis. Una herramienta que parece conservarlos está emitiendo
HTML crudo con atributos `style`, que es un documento distinto disfrazado de extensión de Markdown.

## La lista de comprobación: qué leer en el archivo convertido

Haz esto una vez, en un documento representativo, antes de convertir doscientos. Toma unos diez
minutos y vale más que cualquier tabla comparativa incluida la de arriba, porque tus documentos no
son los de nadie más.

1. **Lee las cabeceras como una lista.** `grep -n "^#" report.md` te da el esquema del documento en
   una sola pantalla. Si es corto, las cabeceras se convirtieron en párrafos — busca `**Línea en
   negrita**` sola en su propia línea, que es en lo que se convierte una cabecera formateada a mano.
2. **Encuentra las listas.** Busca líneas que empiecen con `1.`, `-` o `*`. Si el documento tenía
   procedimientos numerados y la salida no tiene ninguno, ve a comprobar si existe
   `word/numbering.xml` antes de hacer nada más.
3. **Comprueba el anidamiento de las listas.** Los subelementos deberían estar sangrados bajo sus
   padres. Los subniveles aplanados son comunes y cambian el significado de un procedimiento.
4. **Cuenta las columnas en la tabla más ancha.** Compáralo con Word. Luego comprueba si la fila de
   cabecera es de verdad la cabecera, y no la primera fila de datos promocionada.
5. **Busca las referencias a imágenes.** `grep -n "!\[" report.md` las lista. Luego confirma que
   los archivos existen en esas rutas, o confirma que los data URIs están ahí — una referencia a
   un archivo que nunca se extrajo se renderiza como una imagen rota y nada te avisa.
6. **Baja hasta el final.** Las notas al pie y las notas finales aparecen aquí, aparecen en línea, o
   no aparecen. Cualquiera de esas puede ser aceptable; no saber cuál obtuviste no lo es.
7. **Busca una frase que sabes que estaba en un cuadro de texto, una leyenda o un aviso.** Esta es
   la prueba para las pérdidas que nada reporta.
8. **Busca una frase que sabes que se borró durante la revisión.** Si está presente, los cambios
   rastreados se conservaron como texto. Si una frase borrada ha desaparecido y necesitabas el
   historial, convertiste con el ajuste equivocado.
9. **Mira el principio del archivo.** El índice basado en campos de Word se convierte en el texto
   que quedó guardado la última vez que Word lo actualizó, con números de página apuntando a
   páginas que ya no existen. Bórralo y deja que tu renderizador construya uno nuevo.
10. **Abre el Markdown en un renderizador, no en un editor.** El editor te muestra la sintaxis; el
    renderizador te muestra lo que recibe un lector. No están de acuerdo más a menudo de lo que
    esperarías.

En PowerShell, el primero, el segundo y el quinto de esos son:

```powershell
Select-String -Path report.md -Pattern '^#'
Select-String -Path report.md -Pattern '^\s*(\d+\.|[-*])\s'
Select-String -Path report.md -Pattern '!\['
```

| Síntoma en la salida | Qué pasó de verdad | Qué hacer |
| --- | --- | --- |
| Las cabeceras son párrafos en negrita | El documento no tenía estilos de cabecera, o tenía unos personalizados | Aplica estilos reales en Word, o escribe un mapa de estilos |
| Las listas numeradas son párrafos normales | `numbering.xml` falta o no se puede resolver | Comprueba el archivo comprimido; vuelve a guardar desde un procesador de texto |
| Los subelementos están al nivel superior | Los niveles de sangría se perdieron o se aplanaron | Arréglalo a mano; no hay ningún indicador para esto |
| La fila de cabecera de la tabla es una fila de datos | La propiedad de fila de cabecera se ignoró | Arréglalo a mano, o convierte pasando por HTML |
| Las columnas no se alinean | Celdas combinadas o anidadas aplanadas | Reestructura la tabla; Markdown no puede expresar combinaciones |
| Iconos de imagen rotos | Referencias extraídas, archivos no | Vuelve a ejecutar con `--extract-media` o un directorio de salida |
| Una línea del archivo tiene 40.000 caracteres | Imágenes incrustadas como data URIs | Cambia a una ruta que escriba archivos |
| Falta el texto de una nota al pie | El dialecto de destino no tiene sintaxis de notas al pie | Usa un dialecto que la tenga, o acepta que se metan en línea |
| Los comentarios han desaparecido | Todas las rutas excepto una los descartan | `--track-changes=all`, y conserva el original |
| Falta por completo una cita destacada | Estaba en un cuadro de texto | Cópiala a mano |

## Cómo elegir una ruta

1. **Decide adónde puede ir el archivo antes de elegir una herramienta.** Un README se puede subir
   a cualquier sitio. Un contrato firmado, un resultado sin publicar o cualquier cosa con datos
   médicos de una persona no puede, y elegir un conversor alojado para uno de esos es una
   divulgación y no una conversión. La conversión en el navegador mantiene el archivo en la
   máquina y puedes verificarlo en la pestaña de red.
2. **Cuenta los documentos, luego cuenta los clics.** Un archivo no justifica instalar un binario en
   Haskell. Doscientos archivos no justifican una pestaña del navegador y una persona haciendo clic
   en ella. La instalación se paga una vez; el clic se paga cada vez, lo cual invierte la respuesta
   en algún punto entre cinco archivos y cincuenta.
3. **Establece si el documento ha sido revisado.** Los cambios rastreados y los comentarios se
   descartan por defecto en casi todas partes. Si la revisión importa, `--track-changes=all` es la
   forma documentada de conservarla, y si no estás usando Pandoc entonces acepta que se perdió en
   vez de descubrirlo más tarde.
4. **Decide qué quieres que pase con las imágenes antes de convertir, no después.** Archivos en una
   carpeta, o base64 dentro del Markdown. Las dos son defendibles; ninguna es lo que obtienes por
   accidente, y el accidente suele ser referencias que apuntan a nada.
5. **Averigua si el documento usa estilos reales.** Ábrelo en Word y haz clic en una cabecera: si la
   casilla de estilo dice Heading 1, toda ruta va a funcionar. Si dice Normal, ninguna va a
   funcionar, y la solución está en el documento y no en la herramienta.
6. **Conserva el `.docx`.** Todo lo de la sección de arriba es de un solo sentido. Archiva el
   original donde puedas encontrarlo, porque el día que alguien pregunte qué decía el párrafo
   borrado es el día en que descubres que la respuesta solo estaba en el archivo que borraste.

## Conclusión

Convertir un `.docx` a Markdown no es traducción, es triaje. Si el documento vive en Google Docs en
vez de en disco, [esa exportación tiene su propia respuesta](/blog/convert-google-docs-to-markdown).
El trabajo es triaje: descomprimir el archivo, resolver lo que se puede resolver, y aceptar la
pérdida de todo aquello para lo que Markdown no tiene sintaxis. Saber que el archivo comprimido es
donde viven las respuestas convierte casi todo fallo misterioso en una comprobación de dos minutos —
sin `numbering.xml`, sin listas; sin estilos de cabecera, sin cabeceras; sin `--extract-media`, sin
imágenes. Para un solo documento, el camino honesto más corto es un conversor que corra en tu
navegador, que es lo que hace
[la conversión de Word a Markdown de TransformPipe](/word-to-markdown), gratis, sin instalar nada y
sin subir nada cuando no has iniciado sesión. Para un directorio, para imágenes en disco o para un
documento revisado, instala Pandoc. Para convertir dentro de tu propio código, usa mammoth, lee sus
`messages`, y convierte su HTML en vez de su Markdown. Luego recorre la lista de comprobación,
porque las pérdidas que importan son las silenciosas — y
[un inventario de cada una de ellas, con un veredicto sobre cuáles lamentar y cuáles celebrar](/blog/what-not-to-keep-from-a-docx)
es lo que hay que leer antes de decidir si mereció la pena conservar cualquiera de ellas.

## Preguntas frecuentes

### ¿Cómo convierto un .docx a Markdown sin instalar nada?

Usa un conversor que corra en el navegador: descomprime y lee el archivo con JavaScript en tu
propia máquina, así que no hay nada que instalar y, sin haber iniciado sesión, nada que subir.
Confirma esa última parte abriendo la pestaña de red mientras convierte. La otra ruta sin
instalación es copiar y pegar, que lleva cabeceras, listas y enlaces a través del portapapeles HTML
pero pierde cada imagen.

### ¿Por qué mis listas numeradas salieron como párrafos normales?

Porque falló la búsqueda de dos saltos en `numbering.xml`. Un párrafo de lista en Word solo lleva
un id de numeración y un nivel de sangría; el formato vive en esa parte separada del archivo
comprimido, y si falta o hace referencia a definiciones que no contiene, el conversor no puede
saber que el párrafo fue alguna vez un elemento de lista. Descomprime el `.docx` y comprueba si
existe `word/numbering.xml` antes de culpar a la herramienta.

### ¿Cuál es el mejor comando para convertir docx a Markdown?

`pandoc -f docx -t gfm --wrap=none --extract-media=./media -o out.md in.docx` cubre la mayoría de
los casos: GitHub Flavored Markdown para que las tablas sobrevivan, sin reajuste de párrafos para
que los diffs se mantengan legibles, e imágenes escritas en una carpeta en lugar de quedarse en el
archivo comprimido. Añade `--track-changes=all` si el documento ha pasado por revisión.

### ¿Puedo convertir un .doc en vez de un .docx?

No directamente con ninguna de estas rutas — el viejo `.doc` binario es un formato completamente
distinto, sin zip y sin XML. Conviértelo primero con LibreOffice sin interfaz,
`soffice --headless --convert-to docx old.doc`, y luego convierte el `.docx` que produce. Espera
que las sorpresas estén en ese primer paso, ya que es toda una conversión en sí misma.

### ¿Las imágenes llegarán automáticamente?

No, porque Markdown solo referencia jamás un archivo de imagen en vez de contenerlo. El
`--extract-media` de Pandoc las escribe en un directorio, mammoth las incrusta como data URIs por
defecto o se las pasa a un callback que escribes tú, y copiar y pegar las pierde por completo.
Comprueba las imágenes antes de borrar el documento de origen.

### ¿Por qué funcionan las cabeceras en un documento y no en otro?

Porque el hecho de ser una cabecera se guarda como una referencia de estilo, no como una propiedad
del texto. Un documento cuyas cabeceras vinieron de la galería de estilos se convierte con
limpieza; un documento cuyas cabeceras son texto en negrita a 18pt no tiene ninguna referencia de
estilo que resolver, así que no hay nada que un conversor pueda encontrar. La herramienta se
comporta de forma idéntica en los dos casos — los documentos son distintos.

### ¿Es mejor pasar por HTML que convertir directo a Markdown?

Normalmente sí, y es lo que recomiendan los autores de mammoth. HTML tiene un elemento para casi
todo lo que contiene un `.docx`, así que el primer paso casi no pierde nada, y el segundo paso toma
entonces una sola decisión clara sobre lo que Markdown no puede expresar. Convertir de un solo
salto significa que esas decisiones se toman en silencio, en el fondo del lector, donde no las
puedes ver ni cambiar.

### ¿Algo de esto vale para una presentación de PowerPoint?

Solo en parte. Un `.pptx` es el mismo tipo de zip de partes XML, pero una diapositiva es un lienzo
de formas colocadas y no un flujo de párrafos con estilos, así que la pregunta difícil pasa de
«qué estilo era este» a «en qué orden hay que leer esto» — y las notas del orador, que son una
parte aparte del archivo, son lo que pierden casi todos los caminos.
[Convertir PowerPoint a Markdown](/blog/convert-powerpoint-to-markdown) repasa los seis caminos y
lo que deja fuera cada uno.
