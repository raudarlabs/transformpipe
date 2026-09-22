---
title: "CommonMark frente a GFM: qué admite cada motor, en una tabla"
description: "Qué fijó CommonMark, las cinco extensiones que añade GFM, qué no está en ninguno de los dos, y diez motores alineados para predecir dónde se rompe algo."
date: 2026-08-18
tag: Sintaxis
keywords: commonmark, commonmark vs markdown, github flavored markdown, gfm, diferencia entre commonmark y gfm, sabores de markdown, especificación de markdown, extensiones de markdown
---

Pega el mismo archivo en tres herramientas y puedes acabar con tres documentos. Una dibuja una
tabla, otra muestra una fila de barras verticales. Una convierte un salto de línea simple en un
corte de línea, otra junta las líneas en un párrafo. Nada está roto y nada está mal configurado.
Las herramientas hablan dialectos distintos, «Markdown» nombra a la familia entera y no a un
miembro concreto, y saber cuál estás escribiendo es la mayor parte de la solución.

### Resumen

CommonMark es una especificación con su propia batería de pruebas: resuelve las discusiones sobre
la sintaxis original y se detiene a propósito en un núcleo, sin tablas, sin listas de tareas, sin
tachado y sin autoenlaces de URL sueltas. GFM es esa especificación más exactamente cinco
extensiones con nombre —tablas, elementos de lista de tareas, tachado, autoenlaces, y un filtro que
escapa nueve etiquetas HTML crudas— y es el dialecto que la mayoría de la gente tiene en mente
cuando dice Markdown. Todo lo demás que has visto en un archivo `.md` —notas al pie, listas de
definiciones, listas de atributos, matemáticas, avisos, cabeceras de metadatos— no está en ninguna
de las dos especificaciones y solo llega hasta donde alcance la lista de extensiones de la siguiente
herramienta. Escribe para el lector más estricto de la cadena, y pruébalo con un archivo de sondeo
en vez de con una suposición.

## Tres especificaciones, y los años entre ellas

John Gruber publicó Markdown en 2004: una descripción de sintaxis en una página web, y
`Markdown.pl`, un script en Perl que convertía esa sintaxis en HTML. La última versión fue la
1.0.1, fechada el 17 de diciembre de 2004 (comprobado en daringfireball.net/projects/markdown, el 8
de septiembre de 2026). La página y el script juntos eran la definición, y allí donde la prosa
callaba —que era a menudo— lo que el script hiciera se convertía en la respuesta.

Eso funciona bien para un blog y resulta doloroso para la segunda implementación. La descripción
nunca dice cuántos espacios sangran una lista anidada, qué pasa cuando el énfasis se abre dentro de
una palabra, cómo interactúa una lista con la cita en la que está metida, o si un salto forzado
sobrevive al final de un párrafo. Cada implementador adivinaba, y las suposiciones diferían. En
pocos años había docenas de bibliotecas, todas llamadas Markdown, ninguna de acuerdo sobre los
casos incómodos y todas de acuerdo sobre los fáciles. Así que la comparación que la gente busca como
*commonmark vs markdown* es en realidad una comparación entre una especificación y una descripción
más un script.

CommonMark, publicado por primera vez en 2014, es esa especificación que faltaba, ya escrita.
Define las reglas de análisis con detalle y trae cientos de casos de prueba, cada uno un fragmento
de Markdown junto al HTML exacto que debe producir. No existe tal cosa como «casi CommonMark»: una
implementación pasa la batería o no la pasa.

GFM abordó el problema desde el otro extremo. GitHub tenía un renderizador con millones de archivos
apuntando a él y una lista de añadidos de los que dependían sus usuarios, así que escribió la
especificación de GitHub Flavored Markdown como un superconjunto estricto de CommonMark — el mismo
documento, con cinco secciones de extensión añadidas. Por eso *commonmark vs gfm* tiene una
respuesta corta: mismo núcleo, cinco añadidos con nombre, ninguna otra diferencia. Todo lo que queda
más allá de esos cinco es la extensión de alguien, y las extensiones son donde los archivos dejan de
viajar.

## Lo que CommonMark de verdad zanjó

Es fácil leer CommonMark como un Markdown más corto por lo que deja fuera. El valor está en lo que
fija. Cada uno de estos puntos fue un desacuerdo real entre implementaciones antes de que existiera
la especificación, y ahora cada uno se responde señalando un ejemplo numerado.

- **La sangría de las listas.** Cuánto hay que sangrar una lista hija se define en función de la
  columna de contenido del padre, no de un número fijo de espacios. Por eso las marcas `-` y `1.`
  se comportan distinto cuando anidas debajo de ellas: tienen anchuras diferentes.
- **Listas sueltas y compactas.** Una línea en blanco entre elementos vuelve suelta toda la lista,
  lo cual envuelve el texto de cada elemento en `<p>`. Una sola línea en blanco perdida cambia el
  espaciado de una lista que no tocaste — la sorpresa más frecuente de toda la especificación, y
  una que tiene [sus propios comportamientos que merece la pena conocer](/blog/markdown-line-breaks-and-lists).
- **El énfasis.** Las reglas de series de delimitadores flanqueantes por la izquierda y por la
  derecha sustituyen al viejo «depende» para `palabras_con_guion_bajo`, `**negrita**pegada`, y
  cualquier mezcla de asteriscos y guiones bajos.
- **Los bloques de código delimitados.** Cercas de comilla invertida y de virgulilla, las reglas de
  la cerca de cierre, y la cadena de información. La palabra después de la cerca es una etiqueta y
  nada más: [todo conversor la convierte en un nombre de clase y ahí se detiene](/blog/code-blocks-in-markdown).
- **Los saltos forzados.** Dos espacios finales o una barra invertida al final de la línea. Un
  salto de línea simple es un espacio. Esta es una regla de la especificación, no una preferencia, y
  es la regla que más herramientas ofrecen la opción de romper.
- **Los bloques HTML.** Siete tipos distintos, cada uno con sus propias condiciones de inicio y
  cierre, por eso un `<div>` a veces se traga el Markdown que viene después y a veces no.
- **Las definiciones de referencia de enlace**, las referencias de entidad, la expansión de
  tabulaciones a cuatro columnas, los separadores temáticos, las cabeceras ATX y setext, y la
  continuación perezosa de las citas.

CommonMark se detiene a propósito en ese núcleo. Sin tablas, sin notas al pie, sin tachado, sin
listas de tareas, sin autoenlazado de URL sueltas. El razonamiento es defendible: el núcleo es lo
que todos ya tenían en común, y congelar las discusiones sobre él era el trabajo. La consecuencia es
que un analizador estrictamente conforme renderiza tu tabla como un párrafo lleno de barras
verticales, en silencio y correctamente.

## Lo que añade GFM, regla por regla

La especificación de GFM nombra cinco extensiones. Cuatro añaden sintaxis; una quita algo. Cada una
tiene reglas lo bastante específicas como para tropezar con ellas, y los fallos son siempre
silenciosos — una tabla que no se reconoce es simplemente texto.

**Tablas.** Una fila de cabecera, una fila delimitadora, y luego cero o más filas de cuerpo. La
fila delimitadora son guiones con dos puntos opcionales: `:---` izquierda, `:---:` centro, `---:`
derecha. La regla con la que la gente tropieza es que la fila de cabecera y la fila delimitadora
tienen que contener el mismo número de celdas; si no coinciden, el bloque no es una tabla en
absoluto y obtienes barras verticales en la página (comprobado en github.github.com/gfm, el 8 de
septiembre de 2026). Las barras verticales inicial y final son opcionales. Las filas de cuerpo con
pocas celdas se rellenan con celdas vacías y las que tienen demasiadas se recortan. Las celdas solo
llevan contenido en línea —sin listas, sin bloques delimitados, sin un segundo párrafo dentro de
una celda— y una barra vertical literal tiene que escribirse `\|`, incluso dentro de un tramo de
código. La tabla termina en la primera línea en blanco o al empezar otro bloque. La mayor parte de
lo que sale mal con las tablas en una conversión viene de estas tres últimas reglas, y
[las tablas merecen su propia lectura](/blog/markdown-tables-that-survive-conversion).

**Elementos de lista de tareas.** `[ ]`, `[x]` o `[X]` como lo primero del primer párrafo de un
elemento de lista, seguido de un espacio. Tiene que ser un elemento de lista: los mismos corchetes
en una línea sola son corchetes literales. La salida es un `<input>` de casilla marcado
`disabled`, por eso una lista de comprobación convertida se ve apagada en el navegador — ese es el
renderizado especificado, no un fallo del conversor. Las vistas de issues y pull requests de GitHub
las vuelven pulsables a través de su propia aplicación, algo que no es parte de la sintaxis.

**Tachado.** `~~texto~~`. Un salto de párrafo termina el tramo, igual que termina el énfasis.
GitHub también renderiza una sola virgulilla, y no todas las implementaciones de GFM lo siguen en
eso, así que escribe dos si el archivo va a ir a cualquier otro sitio.

**Autoenlaces.** Una URL suelta `http://`, `https://` o `www.`, y una dirección de correo suelta,
se convierten en enlaces sin corchetes angulares. Las reglas son más estrechas de lo que parecen. La
URL tiene que empezar al principio de una línea o seguir a un espacio o a uno de `*`, `_`, `~` y
`(`. La puntuación final se recorta del extremo del enlace en vez de incluirse. Un paréntesis de
cierre se incluye solo si los paréntesis están equilibrados, por eso una URL de Wikipedia que
termina en `(disambiguation)` normalmente sobrevive y una URL dentro de un paréntesis suele perder
su último carácter. Un guion bajo en cualquier lugar de los dos últimos segmentos del dominio anula
el autoenlace por completo. Los autoenlaces con corchetes angulares, `<https://example.com>`, son
CommonMark puro y siempre funcionan — la extensión solo cubre la forma suelta.

**HTML crudo no permitido.** La resta. GFM escapa el `<` de apertura de nueve nombres de etiqueta
para que lleguen a la página como texto visible en lugar de como marcado: `title`, `textarea`,
`style`, `xmp`, `iframe`, `noembed`, `noframes`, `script` y `plaintext` (comprobado en
github.com/github/cmark-gfm, el 8 de septiembre de 2026). Esta es una regla de seguridad de
renderizado que pertenece a GFM y no a Markdown, y merece la pena ser preciso sobre lo que no es. No
es un depurador. Filtra nueve nombres de etiqueta por lista; no hace nada contra `onerror=` en una
`<img>`, nada contra `javascript:` en un `<a href>`, y nada contra un `<svg>` con un manejador
puesto. Si estás convirtiendo un archivo que escribió otra persona,
[sigues necesitando un depurador real con lista blanca](/blog/sanitising-markdown-safely) después
del analizador.

Se cree comúnmente que dos cosas están en GFM y no lo están. Las notas al pie no están en la
especificación, aunque el sitio de GitHub las renderiza. Tampoco los avisos `> [!NOTE]`. Ambos son
comportamientos de un renderizador concreto, añadidos después de escribirse la especificación, y un
analizador que afirma cumplir GFM no se equivoca al ignorarlos.

## Lo que no está en ninguna de las dos especificaciones

Más allá de esas cinco extensiones el terreno deja de ser compartido. Todo lo de abajo es común,
útil y no portable — cada uno existe en varias sintaxis, o en una sola herramienta.

- **Notas al pie** — `[^1]` en el texto, `[^1]:` al final. GitHub las renderiza, Pandoc las
  renderiza, remark-gfm las renderiza, y un analizador CommonMark puro imprime los corchetes
  exactamente tal como se escribieron.
- **Listas de definiciones** — un término, y luego líneas que empiezan con `:`. Heredadas de PHP
  Markdown Extra. Pandoc, Python-Markdown, Goldmark y kramdown la tienen; el mundo JavaScript en su
  mayoría no.
- **Listas de atributos** — `{#mi-id .aviso}` después de una cabecera o un tramo, para fijar un id,
  una clase o un atributo arbitrario. Incorporada en Pandoc y kramdown, una extensión oficial en
  Python-Markdown, un plugin en markdown-it, y ausente en marked.
- **Matemáticas** — `$...$` en línea y `$$...$$` en bloque, entregadas a KaTeX o MathJax en la
  página. Cada implementación lo escribe de forma distinta, y varias necesitan una opción de paso
  directo para que el analizador deje el TeX en paz en vez de comerse los guiones bajos como
  énfasis.
- **Avisos** — `> [!NOTE]` en GitHub, `:::note` en Docusaurus y en varios otros marcos, `!!! note`
  en MkDocs, una lista de atributos `{: .note}` en Jekyll. Cuatro sintaxis para una sola idea, y
  ninguna especificación para ninguna de ellas.
- **Cabeceras de metadatos** — un bloque YAML delimitado por `---` al principio del archivo. Los
  generadores de sitios lo eliminan y lo leen como metadatos. Un conversor que nunca ha oído hablar
  de él lo renderiza como contenido, y el resultado es una línea horizontal seguida de tus
  metadatos convertidos en una cabecera, porque `---` bajo una línea de texto es sintaxis de
  cabecera setext.
- **Anclas de cabecera** — los ids `#titulo-de-seccion` que hacen funcionar un índice. Generados en
  el momento de renderizar por GitHub, por casi todo generador, y por un plugin u opción en la
  mayoría de las bibliotecas. No es sintaxis en absoluto, y el algoritmo de slug difiere entre
  herramientas, así que un enlace cruzado escrito a mano puede romperse cuando cambia el
  renderizador.
- **Las más pequeñas** — abreviaturas, superíndices y subíndices, códigos cortos de emoji como
  `:tada:`, enlaces de wiki `[[Página]]`, mermaid tratado como diagrama en vez de como bloque de
  código, y puntuación inteligente que convierte tus comillas en curvas quieras o no.

## Comparativa rápida: los dialectos y los motores que los hablan

| Nombre | Mejor para | Capacidad clave | Precio |
| --- | --- | --- | --- |
| Markdown original 1.0.1 | Referencia histórica | La página de sintaxis de 2004 más `Markdown.pl` | Gratis, licencia de estilo BSD |
| CommonMark | Zanjar una discusión sobre el análisis | Una especificación con una batería de pruebas ejecutable | Gratis, especificación abierta |
| GitHub Flavored Markdown | El objetivo por defecto para cualquier cosa compartida | CommonMark más cinco extensiones con nombre | Gratis, especificación abierta |
| markdown-it (JS) | Corrección con margen para ampliar | Conforme a CommonMark, escapa el HTML crudo por defecto | Gratis, MIT |
| marked (JS) | GFM sin ninguna decisión que tomar | GFM activo por defecto, una llamada de función | Gratis, MIT |
| remark / unified (JS) | Reescribir el documento, no solo renderizarlo | Un AST más remark-gfm y un gran conjunto de plugins | Gratis, MIT |
| Markdown de Pandoc | Documentos que necesitan notas al pie y matemáticas | Extensiones con nombre que activas una por una | Gratis, GPL |
| Python-Markdown | Compilaciones en Python y sitios MkDocs | API de extensión oficial: tablas, notas al pie, attr_list | Gratis, BSD |
| Goldmark (Go) | Programas en Go y sitios Hugo | CommonMark más un conjunto de extensión GFM incluido | Gratis, MIT |
| kramdown (Ruby) | Jekyll y GitHub Pages | Un superconjunto de Markdown con listas de atributos en línea | Gratis, MIT |
| MDX | Sitios de documentación con componentes | JSX dentro de Markdown, compilado en vez de renderizado | Gratis, MIT |

## Los dialectos y las implementaciones, uno por uno

Lo que sigue trata solo del dialecto — qué construcciones reconoce cada uno y cómo cambias eso. Cuál
elegir como conversor es [una comparación distinta](/blog/best-markdown-to-html-converters), con
otros criterios.

### Markdown original 1.0.1 — el antepasado, no un objetivo

La página de sintaxis y el script en Perl de Gruber. Sigue siendo la razón por la que un archivo
`.md` permite HTML crudo en absoluto, y sigue siendo el origen de comportamientos que sobreviven en
herramientas escritas mucho después.

| A favor | En contra |
| --- | --- |
| La descripción más corta de la sintaxis jamás escrita | Ambigua justo en los puntos donde las implementaciones no se ponen de acuerdo |
| Explica por qué el HTML crudo pasa sin filtrar por defecto | Sin tablas, sin bloques de código delimitados, sin batería de pruebas |
| Sigue siendo la base de `markdown_strict` en Pandoc | Sin mantenimiento desde la 1.0.1 |

**Precio:** gratis, licencia de estilo BSD.

**Detalles técnicos y funciones**

- Solo bloques de código con sangría — el código delimitado llegó con dialectos posteriores
- Las etiquetas HTML a nivel de bloque crudas pasan sin tocar, y el Markdown dentro de ellas no se
  analiza
- Énfasis, enlaces, imágenes, citas, cabeceras ATX y setext, listas, líneas horizontales
- Ninguna especificación de la sangría de listas anidadas, que es la ambigüedad que todo lo
  posterior heredó

**¿Para quién es?** Para nadie, como objetivo. Léela para entender por qué una construcción se
comporta como se comporta, y elige `markdown_strict` en Pandoc si necesitas saber específicamente
cómo se habría renderizado un archivo en 2004.

### CommonMark — el núcleo contra el que se mide todo lo demás

CommonMark es la especificación más `cmark`, su implementación de referencia en C. Su propósito es
la conformidad, no las funciones, y su contención es la función.

| A favor | En contra |
| --- | --- |
| Cada caso incómodo tiene un ejemplo numerado y una salida esperada | Sin tablas, listas de tareas, tachado ni autoenlaces sueltos |
| Cientos de casos de prueba, así que la conformidad es un hecho y no una afirmación | Una tabla se renderiza como un párrafo de barras verticales, en silencio |
| Existen implementaciones para casi todos los lenguajes y apuntan a la misma batería | Deliberadamente sin ningún mecanismo de extensión en la propia especificación |
| El suelo más seguro contra el que escribir | La mayoría de los documentos reales necesitan al menos una extensión |

**Precio:** gratis, especificación abierta; `cmark` es gratuito con licencia BSD de 2 cláusulas.

**Detalles técnicos y funciones**

- Define la sangría de las listas relativa a la columna de contenido del padre, terminando la
  discusión de los espacios
- Las series de delimitadores flanqueantes por la izquierda y por la derecha definen el énfasis con
  precisión
- Siete tipos de bloque HTML, cada uno con condiciones explícitas de inicio y fin
- Los saltos forzados son dos espacios finales o una barra invertida final; un salto de línea suelto
  es un espacio
- El HTML crudo pasa sin filtrar por defecto, que es una decisión de la especificación y no una de
  seguridad
- Entre las implementaciones acompañantes están comrak en Rust, y markdown-it y Goldmark apuntan a
  la misma batería

**¿Para quién es?** Para cualquiera que necesite saber qué significa la sintaxis en vez de qué hace
una herramienta. Cuando dos renderizadores no están de acuerdo, los ejemplos de la especificación
decidien cuál tiene el error — y recurrir a ella es, más a menudo de lo que la gente espera, la
jugada correcta.

### GitHub Flavored Markdown — el valor por defecto práctico

GFM es CommonMark más tablas, listas de tareas, tachado, autoenlaces y el filtro de HTML crudo. Es
lo que renderiza un README, y lo que copiaron la mayoría de los rastreadores de issues y las
herramientas de chat.

| A favor | En contra |
| --- | --- |
| Una especificación escrita, no solo el comportamiento de un renderizador | Sigue sin notas al pie, listas de definiciones, matemáticas ni atributos |
| Cubre las construcciones que de verdad usa la mayoría de los documentos | El filtro de etiquetas se confunde a menudo con un depurador |
| Ampliamente implementado, así que un archivo GFM suele viajar bien | El sitio de GitHub renderiza cosas que la especificación no define |
| Un superconjunto estricto de CommonMark, así que nada del núcleo cambia | Las reglas de autoenlace suelto son más exigentes de lo que parecen |

**Precio:** gratis, especificación abierta.

**Detalles técnicos y funciones**

- Tablas con alineación por columna, solo contenido en línea, y se exige una fila delimitadora que
  coincida
- Elementos de lista de tareas renderizados como entradas de casilla `disabled`
- Tachado con `~~`; GitHub también acepta una sola virgulilla
- Autoenlaces de URL y correo sueltos, con reglas de puntuación final y de paréntesis equilibrados
- Nueve nombres de etiqueta HTML crudos escapados en vez de pasados sin filtrar
- Las notas al pie y los avisos `> [!NOTE]` funcionan en GitHub y no están en la especificación

**¿Para quién es?** Para casi todo el mundo, en casi todo archivo compartido. Si un documento tiene
que renderizarse en GitHub, en un sitio de documentación y como HTML convertido, GFM es la
intersección que los tres entienden.

### markdown-it — CommonMark primero, extensiones a demanda

Un analizador de JavaScript que sigue la especificación CommonMark y añade una pequeña cantidad
encima. Su propio resumen es que «añade extensiones de sintaxis y azúcar (autoenlazado de URL,
tipografía)» (comprobado en github.com/markdown-it/markdown-it, el 8 de septiembre de 2026).

| A favor | En contra |
| --- | --- |
| Pasa la batería de CommonMark, y trae un preajuste `commonmark` estricto | Las listas de tareas y las notas al pie necesitan plugins |
| Escapa el HTML crudo por defecto, así que el comportamiento seguro es el predeterminado | La calidad de los plugins varía en el ecosistema |
| Las reglas se pueden añadir, sustituir o reordenar a nivel de bloque y en línea | El autoenlazado está apagado hasta que lo activas |

**Precio:** gratis, licencia MIT.

**Detalles técnicos y funciones**

- Tres preajustes: `commonmark` para conformidad estricta, `default`, y `zero` para construir desde
  cero
- Las tablas y el tachado están activos en el preajuste por defecto; `linkify` y `breaks` están
  apagados
- `html: false` por defecto — el HTML crudo en el origen se escapa, no se pasa sin filtrar
- Los plugins cubren notas al pie, contenedores para avisos, atributos, anclas, listas de tareas y
  matemáticas
- La superficie de plugins está documentada, así que se puede escribir una extensión en vez de
  buscarla

**¿Para quién es?** Para equipos que quieren la especificación seguida por defecto y cada extensión
activada de forma deliberada. Es también el dialecto que hereda buena parte de las herramientas, la
vista previa de Markdown incorporada de VS Code entre ellas.

### marked — GFM sin ninguna decisión que tomar

Un analizador y compilador de JavaScript pequeño cuyo dialecto por defecto ya es el que la mayoría
de la gente quiere.

| A favor | En contra |
| --- | --- |
| GFM está activo por defecto: tablas, tachado, listas de tareas, autoenlaces | Sin ecosistema de plugins que valga la pena mencionar; las extensiones las escribes tú |
| Una función, un objeto de opciones | El HTML crudo pasa sin filtrar, por diseño |
| Corre en el navegador y en Node | Las notas al pie, las listas de definiciones y las matemáticas no están disponibles |

**Precio:** gratis, licencia MIT.

**Detalles técnicos y funciones**

- `gfm: true` por defecto; `breaks: false` por defecto, así que un salto de línea simple es un
  espacio
- `breaks: true` reproduce el comportamiento de las cajas de comentarios de GitHub en vez del de sus
  README
- Un lexer que puedes llamar por separado para inspeccionar tokens en vez de HTML
- Renderizadores personalizados sustituyen cómo se emite cualquier tipo de nodo, que es cómo se
  hacen la mayoría de las extensiones
- Sin depuración: la respuesta documentada es pasar la salida por DOMPurify

**¿Para quién es?** Para cualquiera cuyo dialecto objetivo sea GFM llano y que no necesite nada más
allá. Es el camino más corto de un archivo GFM a HTML con forma de GFM, y la razón de que tanto
software se comporte como GitHub con `breaks` mal puesto.

### remark y unified — el dialecto como lista de plugins

remark analiza Markdown en un árbol de sintaxis abstracto. El dialecto no es un ajuste; es qué
extensiones añadiste al proceso.

| A favor | En contra |
| --- | --- |
| remark-gfm cubre las cinco extensiones de GFM, más notas al pie | La opción más pesada de aquí, por un margen amplio |
| Las cabeceras de metadatos, las matemáticas y las directivas tienen cada una un plugin de primera clase | El proceso de unified exige un aprendizaje real |
| El HTML crudo se descarta salvo que lo permitas explícitamente | Cada extensión es una dependencia que mantener al día |

**Precio:** gratis, licencia MIT.

**Detalles técnicos y funciones**

- mdast para Markdown, hast para HTML, con plugins para moverse entre los dos
- remark-gfm añade tablas, listas de tareas, tachado, autoenlaces y notas al pie juntos
- remark-frontmatter analiza la cabecera YAML en vez de renderizarla como una cabecera de texto
- remark-directive da contenedores `:::note`, que es como se implementan la mayoría de las
  sintaxis de aviso
- Pasar HTML crudo sin filtrar exige `allowDangerousHtml`, así que la opción insegura es explícita

**¿Para quién es?** Para equipos que necesitan un dialecto que nadie ofrece — GFM más notas al pie
más directivas más una regla propia sobre el texto de los enlaces— y que están dispuestos a
montarlo y mantenerlo.

### El Markdown de Pandoc — un dialecto con un panel de interruptores

Pandoc lee varios dialectos de Markdown y el suyo propio, extendido, y cada construcción es una
extensión con nombre que puedes activar o desactivar individualmente.

| A favor | En contra |
| --- | --- |
| Notas al pie, listas de definiciones, atributos y matemáticas están incorporados | Su dialecto no es lo que renderiza GitHub, lo cual sorprende a la gente |
| Varias sintaxis de tabla, incluidas tablas de rejilla con celdas de varias líneas | Los nombres de las extensiones son un vocabulario que aprender |
| Los dialectos de lectura y escritura se eligen por separado | El HTML crudo pasa sin ninguna depuración |
| `markdown_strict`, `commonmark`, `gfm` y `commonmark_x` están todos disponibles | Exige instalación y una terminal |

**Precio:** gratis, licencia GPL.

**Detalles técnicos y funciones**

- Dialectos elegidos por nombre: `markdown`, `markdown_strict`, `markdown_phpextra`,
  `markdown_mmd`, `commonmark`, `commonmark_x`, `gfm`
- Extensiones activadas con `+nombre` y `-nombre` sobre el formato, por ejemplo `gfm+footnotes`
- Sintaxis de atributos `{#id .clase clave=valor}` en cabeceras, bloques de código, enlaces e
  imágenes
- `tex_math_dollars` para matemáticas, `fenced_divs` para contenedores al estilo aviso,
  `definition_lists`, `footnotes`
- Las tablas de rejilla y de varias líneas llevan contenido de bloque dentro de las celdas, algo que
  las tablas de barras verticales no pueden

**¿Para quién es?** Para cualquiera que escriba documentos y no páginas: algo con notas al pie,
citas, ecuaciones o un formato de salida distinto de HTML. Recurre a `gfm` explícitamente cuando el
archivo también tenga que renderizarse en GitHub, porque el dialecto propio de Pandoc acepta sin
problema sintaxis que GitHub no puede dibujar.

### Python-Markdown — extensiones como API

La implementación en Python de más larga trayectoria. Su dialecto base está más cerca del Markdown
original que de CommonMark, y su API de extensión es sobre lo que se construye buena parte de las
herramientas de documentación.

| A favor | En contra |
| --- | --- |
| Extensiones oficiales para tablas, notas al pie, listas de definiciones y listas de atributos | No es conforme con CommonMark en todos los detalles |
| `md_in_html` analiza Markdown dentro de bloques HTML crudos, algo que la mayoría de los analizadores no hace | Las listas de tareas y el tachado necesitan extensiones de terceros |
| La extensión `admonition` es la implementación de referencia de `!!! note` | Las diferencias con GFM aparecen en casos límite de listas y énfasis |

**Precio:** gratis, licencia BSD.

**Detalles técnicos y funciones**

- El paquete `extra` agrupa tablas, notas al pie, listas de definiciones, abreviaturas, listas de
  atributos, código delimitado y `md_in_html`
- `toc` genera ids de cabecera y un índice; `smarty` hace puntuación inteligente
- `nl2br` convierte los saltos de línea simples en `<br>`, el mismo interruptor que otras
  herramientas llaman `breaks`
- `meta` lee una cabecera de metadatos, y MkDocs gestiona la cabecera de metadatos YAML por encima
- El tachado, las listas de tareas y las matemáticas `$...$` vienen de las PyMdown Extensions de
  terceros

**¿Para quién es?** Para scripts de compilación en Python, y para cualquiera que amplíe MkDocs,
donde ya es el motor. Sé deliberado con qué extensiones activas: el dialecto es exactamente la lista
de tu archivo de configuración, y un archivo escrito contra una lista más completa perderá cosas en
silencio.

### Goldmark — CommonMark con un interruptor de GFM

Un analizador conforme con CommonMark en Go, y el motor dentro de Hugo. Sus extensiones son valores
de Go que compones en vez de cadenas que configuras.

| A favor | En contra |
| --- | --- |
| Conforme con CommonMark, con un único paquete `extension.GFM` para las cuatro adiciones de GFM | Solo Go |
| Listas de definiciones, notas al pie y tipografía inteligente vienen de fábrica | Menos extensiones ya hechas que en el ecosistema JavaScript |
| El comportamiento de atributos y de paso directo es explícito en vez de implícito | Algunas decisiones de dialecto llegan a través de la configuración de Hugo, no de la de Goldmark |

**Precio:** gratis, licencia MIT.

**Detalles técnicos y funciones**

- `extension.GFM` agrupa Table, Strikethrough, Linkify y TaskList (comprobado en
  github.com/yuin/goldmark, el 8 de septiembre de 2026)
- `extension.DefinitionList` y `extension.Footnote` implementan las sintaxis de PHP Markdown Extra
- `html.WithHardWraps()` renderiza un salto de línea como `<br>`, la misma opción con un tercer
  nombre
- `html.WithUnsafe()` es obligatorio antes de que el HTML crudo pase sin filtrar, así que el
  escapado es lo predeterminado
- Hugo añade encima ganchos de renderizado y su propia configuración, que es donde de verdad viven
  la mayoría de las dudas de dialecto en Hugo

**¿Para quién es?** Para programas en Go, y para usuarios de Hugo que intentan averiguar por qué
una construcción se renderiza en GitHub y no en su sitio. La respuesta suele ser una extensión que
está disponible y no activada.

### kramdown — un superconjunto, no un dialecto de CommonMark

Un conversor superconjunto de Markdown en Ruby puro, y el motor por defecto de Jekyll. Tiene su
propia sintaxis para varias cosas que las demás herramientas hacen de forma distinta, lo cual es una
ventaja real dentro de Jekyll y un problema real fuera de él.

| A favor | En contra |
| --- | --- |
| Listas de atributos en línea — `{: .aviso}` — en casi cualquier bloque | No es conforme con CommonMark, y no pretende serlo |
| Listas de definiciones, notas al pie, abreviaturas y matemáticas incorporadas | Sin listas de tareas ni tachado en la sintaxis principal |
| Las tablas admiten una fila de cabecera y una de pie separadoras | Su propia sintaxis no sobrevive a ser leída por otra herramienta |
| Ya instalado si usas Jekyll o GitHub Pages | La gestión de saltos de línea es configurable y no es la predeterminada de CommonMark |

**Precio:** gratis, licencia MIT (comprobado en github.com/gettalong/kramdown, el 8 de septiembre de
2026).

**Detalles técnicos y funciones**

- Escrito en Ruby, sin dependencias obligatorias para el analizador de Markdown
- Las listas de atributos en línea fijan ids, clases y atributos arbitrarios sin bajar a HTML
- Las matemáticas `$$...$$`, las notas al pie y las definiciones de abreviatura son sintaxis
  principal en vez de plugins
- Hay disponible un analizador GFM independiente y es lo que usa GitHub Pages, que no es lo mismo
  que el dialecto propio de kramdown
- Convierte a HTML, LaTeX y de vuelta a kramdown

**¿Para quién es?** Para sitios Jekyll, y solo para contenido que se queda en ellos. Si una página
escrita en kramdown tiene que leerse en cualquier otro sitio, sus listas de atributos se vuelven
llaves visibles.

### MDX — un lenguaje distinto con una superficie familiar

MDX pone componentes JSX dentro de Markdown. Se compila a un componente en vez de renderizarse a
HTML, y está construido sobre remark, así que la mitad Markdown es el dialecto de remark.

| A favor | En contra |
| --- | --- |
| Un componente de React en medio de un documento, con props | No es Markdown: ninguna herramienta de Markdown normal puede leerlo |
| La mitad Markdown es CommonMark más los plugins de remark que añadas | Necesita un paso de compilación y un marco de JavaScript |
| Da vida a sitios de documentación donde la prosa y los ejemplos interactivos se mezclan | Un `<` o un `{` suelto en la prosa se convierte en un error de sintaxis |

**Precio:** gratis, licencia MIT.

**Detalles técnicos y funciones**

- Se compila a JavaScript, así que la salida es un componente y no un archivo HTML
- Usa remark para Markdown y puede tomar remark-gfm y el resto del conjunto de plugins
- Las llaves son expresiones, lo cual significa que una `{` literal en la prosa hay que escaparla
- Las cabeceras de metadatos necesitan un plugin, como en todos los demás sitios

**¿Para quién es?** Para sitios de documentación que necesitan ejemplos vivos dentro de la prosa, y
para nadie que necesite que el archivo sea portable. Un archivo MDX es código fuente que se parece
a un documento.

## Funciones frente a implementaciones

Lee hacia abajo la columna de una herramienta, y a lo ancho la fila de una función. «Plugin»
significa disponible y no incorporado; «extensión» significa que viene con el proyecto y está
apagada hasta activarla; «opción» significa un booleano en algún lugar de la configuración.

| Función | CommonMark | GFM | markdown-it | marked | remark | Pandoc | Python-Markdown | Goldmark | kramdown |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tablas | No | Sí | Activa por defecto | Activa por defecto | remark-gfm | Incorporado, varias sintaxis | Extensión `tables` | `extension.Table` | Incorporado |
| Elementos de lista de tareas | No | Sí | Plugin | Activo por defecto | remark-gfm | Extensión `task_lists` | Extensión de terceros | `extension.TaskList` | No |
| Tachado | No | Sí | Activo por defecto | Activo por defecto | remark-gfm | Extensión `strikeout` | Extensión de terceros | `extension.Strikethrough` | No |
| Autoenlaces de URL suelta | No | Sí | Opción `linkify` | Activo por defecto | remark-gfm | `autolink_bare_uris` | Extensión de terceros | `extension.Linkify` | No |
| HTML crudo por defecto | Pasa sin filtrar | Nueve etiquetas escapadas | Escapado | Pasa sin filtrar | Se descarta salvo permiso | Pasa sin filtrar | Pasa sin filtrar | Escapado salvo modo inseguro | Pasa sin filtrar |
| Notas al pie | No | No en la especificación; GitHub las renderiza | Plugin | No | remark-gfm | Extensión `footnotes` | Extensión `footnotes` | `extension.Footnote` | Incorporado |
| Listas de definiciones | No | No | Plugin | No | Plugin | `definition_lists` | Extensión `def_list` | `extension.DefinitionList` | Incorporado |
| Listas de atributos | No | No | Plugin | No | Plugin | Incorporado | Extensión `attr_list` | De terceros | Incorporado |
| Matemáticas | No | No | Plugin | No | remark-math | `tex_math_dollars` | Extensión de terceros | Paso directo o de terceros | Incorporado |
| Contenedores de aviso | No | No | Plugin | No | remark-directive | `fenced_divs` | Extensión `admonition` | De terceros | Listas de atributos |
| Cabeceras de metadatos | No | No | Plugin | No | remark-frontmatter | Incorporado para su propio formato | Extensión `meta` | Gestionado por Hugo | Gestionado por Jekyll |
| Ids de cabecera | No | Añadidos por GitHub al renderizar | Plugin | Extensión | Plugin | Incorporado | Extensión `toc` | De terceros | Incorporado |
| Salto de línea como `<br>` | No | No | Opción `breaks` | Opción `breaks` | remark-breaks | `hard_line_breaks` | Extensión `nl2br` | `WithHardWraps` | Opción |

Dos patrones de esa tabla valen más que las celdas sueltas. El primero es que las herramientas
JavaScript no están de acuerdo sobre todo en los valores por defecto, no en las capacidades:
markdown-it y marked pueden renderizar el mismo archivo GFM, pero de fábrica una escapa tu HTML
crudo y la otra no. El segundo es que las herramientas con la sintaxis más rica —Pandoc,
Python-Markdown, kramdown— son las cuyos archivos viajan peor, porque la riqueza está toda en
extensiones que nada más implementa.

## Cómo saber qué dialecto habla una herramienta

No leas la documentación. Guarda un archivo de sondeo, pégalo, y lee lo que sale.

```markdown
| Feature | Renders |
| --- | --- |
| tables | yes? |

- [x] a checkbox
- [ ] or literal brackets

~~Strikethrough~~ and a bare URL: https://example.com

Term
: A definition, or a paragraph starting with a colon.

A footnote reference.[^1]

Heading with an attribute
{: .probe}

Line one
line two

[^1]: Only some tools render this.
```

Nueve respuestas de un solo pegado, en el orden que importa. Una tabla dibujada, casillas, texto
tachado y un enlace vivo cubren las cuatro extensiones de sintaxis de GFM — si aparecen las cuatro,
tienes al menos GFM. Una definición sangrada significa que la herramienta va más allá de GFM, hacia
el terreno de PHP Markdown Extra. Una nota al pie renderizada significa lo mismo. Unas llaves
visibles `{: .probe}` significan sin listas de atributos, que es la mayoría de las herramientas. Y
si «line two» queda en su propia línea, `breaks` está activado, algo que conviene saber antes de
escribir diez páginas sobre la suposición equivocada.

Añade un `$x^2$` y una línea `> [!NOTE]` si te importan las matemáticas o los avisos. La gracia del
archivo es que tarda diez segundos y sustituye a una tarde de suposiciones.

## Dónde falla GFM — la opción obvia — y qué cuesta

GFM es el valor por defecto correcto, y merece la pena ser honesto sobre los cuatro sitios donde se
queda corto.

**No tiene notas al pie, y tú tampoco.** GitHub renderiza notas al pie, así que la gente las
escribe, y no están en la especificación. Un analizador GFM que ignora `[^1]` es conforme. Si tu
documento de verdad necesita notas al pie, has salido de GFM aunque no fuera tu intención, y el
coste es que tu archivo ahora depende de la lista de extensiones de una herramienta concreta en vez
de una especificación — [qué herramientas renderizan la sintaxis de notas al pie y cuáles imprimen los corchetes](/blog/markdown-footnotes-support)
es la lista a comprobar antes de escribir cien notas.

**No tiene atributos, así que dar estilo significa HTML crudo.** No hay forma en GFM de poner una
clase en un párrafo. O bajas a un `<div>` —lo cual te deja a merced de lo que el renderizador haga
con el HTML crudo, y del filtro de etiquetas si es un renderizador GFM— o aceptas el estilo por
defecto. Pandoc y kramdown resolvieron esto hace años, y sus soluciones no viajan.

**El filtro de etiquetas no es seguridad.** Nueve nombres de etiqueta escapados son una lista, no
una política. Cualquiera que convierta Markdown de un tercero pensando que la conformidad con GFM
le cubre está a un `<img onerror=>` de descubrir lo contrario. La depuración ocurre después del
análisis, contra una lista blanca, y es un trabajo aparte de elegir un dialecto.

**La cuestión de los saltos no tiene una respuesta correcta.** Las cajas de comentarios de GitHub
convierten un salto de línea simple en un `<br>`; la especificación dice que un salto de línea
simple es un espacio; el renderizado de README sigue la especificación. Así que el mismo texto puede
renderizarse de dos formas en el mismo sitio web, y cada herramienta posterior tiene que elegir una.
TransformPipe convierte con GFM activo y `breaks` apagado, lo cual coincide con la especificación y
con el renderizado de README en vez de con la caja de comentarios, porque un documento está más
cerca de un README que de un comentario. Sea lo que elija una herramienta, los párrafos de alguien
salen mal, y es el problema de dialecto más reportado que existe.

El coste de los cuatro juntos es que «GFM» te dice qué se va a renderizar y no qué se va a ver bien.
Es un suelo, no un acabado.

## Cómo elegir un dialecto

1. **Escribe para el lector más estricto de la cadena.** Si un archivo tiene que renderizarse en
   GitHub, en un sitio de documentación y como HTML convertido, usa solo lo que los tres admitan,
   porque el analizador más débil decide lo que ve el lector y no te avisará.
2. **Elige el dialecto antes que la herramienta, no después.** Decidir que necesitas notas al pie y
   matemáticas te dice que instales Pandoc; decidir que necesitas que se renderice un README te dice
   que GFM basta. Hacerlo al revés significa descubrir el límite a mitad de un documento.
3. **Mantén cada extensión cerca de la herramienta que la posee.** Las cabeceras de metadatos
   pertenecen a un repositorio que lee un generador, no a un archivo que le entregas a un conversor
   que lo va a renderizar como una cabecera de texto. Una lista de atributos pertenece al sitio
   Jekyll, no al archivo que envías por correo.
4. **Trata los valores por defecto como parte del dialecto.** Dos bibliotecas pueden afirmar ambas
   que hacen GFM y diferir en el HTML crudo, el autoenlazado y los saltos de línea, lo cual son tres
   ocasiones para que un archivo se renderice de forma distinta sin que nadie haya cambiado una
   palabra.
5. **Convierte un archivo representativo antes de comprometerte.** No un archivo de hola-mundo: el
   que tiene la tabla, la lista de comprobación, la URL larga entre paréntesis y la nota al pie.
   Diez segundos de sondeo ganan a una reescritura, y es la única forma de ver un fallo silencioso
   mientras todavía es barato.

## Conclusión

CommonMark es el núcleo, GFM es el núcleo más cinco extensiones con nombre, y todo lo demás que
alguna vez escribiste en un archivo `.md` es la extensión de alguien que se detiene en el borde de
su herramienta. Ese es el mapa completo, y basta para predecir casi cualquier diferencia de
renderizado que vayas a encontrar. Escribe GFM por defecto, recurre a Pandoc cuando el documento
necesite notas al pie o ecuaciones, mantén las cabeceras de metadatos y las listas de atributos en
los proyectos que las entienden, y sondea antes de comprometerte. Si GFM es donde acabas,
[convertirlo a HTML](/) en el navegador te mostrará exactamente en qué se convirtió cada
construcción — el origen HTML está ahí mismo junto a la vista previa, así que puedes comprobar la
tabla en vez de confiar en que salga bien.

## Preguntas frecuentes

### ¿Cuál es la diferencia entre CommonMark y GFM?

GFM es la especificación CommonMark más cinco extensiones con nombre: tablas, elementos de lista de
tareas, tachado, autoenlaces de URL suelta, y un filtro que escapa nueve nombres de etiqueta HTML
crudos. Las reglas de análisis del núcleo son idénticas, porque GFM se define como un superconjunto
estricto. Cualquier otra diferencia entre dos renderizadores no es una diferencia entre CommonMark
y GFM — es una extensión que uno tiene y el otro no.

### ¿Es GFM un superconjunto de CommonMark?

Sí, y la especificación lo dice explícitamente. Todo documento CommonMark válido es un documento GFM
válido que se renderiza igual, con la única excepción de las nueve etiquetas HTML crudas filtradas,
que GFM escapa y CommonMark deja pasar. Por eso escribir CommonMark puro es la forma más segura de
hacer un archivo portable.

### ¿CommonMark admite tablas?

No. Las tablas no están en la especificación de CommonMark, y un analizador estrictamente conforme
renderiza una tabla de barras verticales como un párrafo normal que contiene esos caracteres. El
fallo es silencioso, así que si una tabla salió como texto, tu analizador probablemente está
haciendo exactamente lo que se le pidió. Las tablas llegan con GFM o con una extensión específica de
una herramienta.

### ¿Las notas al pie son parte de GitHub Flavored Markdown?

No en la especificación, a pesar de que el propio sitio de GitHub las renderiza. Las notas al pie
son una extensión que Pandoc, remark-gfm, Python-Markdown, Goldmark y kramdown implementan todos de
forma parecida, y que un analizador GFM llano tiene derecho a ignorar. Si tu documento las necesita,
elige una herramienta por ese requisito y no por la conformidad con GFM.

### ¿Por qué mi Markdown se renderiza distinto en GitHub y en mi conversor?

Tres causas habituales, por orden de probabilidad. El ajuste de saltos de línea: las cajas de
comentarios de GitHub tratan un salto de línea simple como un `<br>` y la especificación no. Una
extensión: las notas al pie, las cabeceras de metadatos, los avisos y las matemáticas se renderizan
todos en GitHub o en un generador y no están en ninguna especificación. O una construcción que no es
del todo válida —una tabla cuya fila delimitadora tiene el número equivocado de celdas, por
ejemplo—, de la que GitHub y tu conversor pueden recuperarse de formas distintas.

### ¿En qué dialecto de Markdown debería escribir?

En GFM, salvo que algo te obligue a salir de él. Está especificado, ampliamente implementado, y
cubre tablas, listas de comprobación y tachado, que es la mayor parte de lo que usa un documento
real. Pasa al dialecto de Pandoc cuando necesites notas al pie, listas de definiciones o ecuaciones,
y acepta que el archivo queda entonces atado a Pandoc.

### ¿Qué hace un conversor de Markdown con la cabecera de metadatos YAML?

Depende por completo de si la herramienta ha oído hablar de ella, porque las cabeceras de metadatos
no están en ninguna de las dos especificaciones. Un generador la elimina y la lee como metadatos; un
conversor llano la renderiza como contenido, lo cual produce una línea horizontal seguida de tus
metadatos convertidos en una cabecera setext. Si le estás entregando archivos a un conversor, o
quitas primero la cabecera o eliges una herramienta con una opción para cabeceras de metadatos.
