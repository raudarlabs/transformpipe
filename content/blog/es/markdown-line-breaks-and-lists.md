---
title: "Saltos de línea y listas en Markdown: 14 síntomas, 14 reglas"
description: "Un salto convertido en espacio, una lista convertida en bloque de código, números que se renumeran solos: el síntoma, la regla y qué escribir en su lugar."
updated: 2026-09-09
date: 2026-07-11
tag: Sintaxis
keywords: salto de linea markdown, nueva linea markdown, dos espacios markdown, lista anidada markdown, lista ordenada markdown, checkbox markdown, lista de tareas markdown, escapar caracteres markdown, sangria de listas markdown, listas sueltas y apretadas, salto de linea forzado commonmark, markdown br
---

Markdown es lo bastante pequeño para que la mayoría de la gente lo aprenda imitando y nunca lea las reglas. Eso funciona hasta que una línea se niega a romperse, una lista llega como un solo párrafo largo, o un asterisco que querías literal se traga media frase. Nada de eso es un fallo. Cada caso es una regla haciendo lo que dice, en un sitio donde el archivo de origen no da ninguna pista visual de que esté pasando algo.

### Resumen rápido

Un salto de línea simple es un espacio, no un salto de línea: CommonMark lo llama salto de línea suave y deja a los renderizadores libertad para imprimirlo como espacio en blanco, que es lo que hace un archivo `.md` casi en todas partes. Para romper una línea dentro de un párrafo, termínala con **dos espacios** o una **barra invertida**; para empezar una nueva, deja una **línea en blanco**. Una lista anidada sangra el ancho del marcador del padre más los espacios que le siguen — **dos bajo `- `, tres bajo `1. `** — y una línea en blanco en cualquier parte de una lista la vuelve suelta entera, envolviendo su texto en `<p>`. Todo lo demás de esta página es una de esas dos reglas aplicándose en un sitio donde no estabas mirando.

Las reglas están escritas. CommonMark es la especificación que las fija, y la versión 0.31.2 es la vigente (comprobado en spec.commonmark.org, el 9 de septiembre de 2026). Cada caso de abajo es una regla numerada dentro de ella, no una rareza de una herramienta concreta. Lo que una especificación no puede ayudar es que ninguna de estas reglas deja marca en el origen. Un espacio final parece nada. Dos espacios de sangría parecen tres. Una línea en blanco dentro de una lista parece orden.

Los saltos de línea y las listas van juntos en un solo artículo porque comparten una aritmética. Que una línea se rompa depende de lo que haya al final; que un elemento anidado anide depende de lo lejos que empiece su línea de la columna de contenido de su padre. Ambos se cuentan en caracteres que no puedes ver, y ambos fallan en silencio — sin error, sin aviso, solo una salida que no es la que querías, casi siempre notada por otra persona.

## La chuleta: el síntoma, y la regla detrás

| Síntoma | La regla que lo causa | Qué escribir en su lugar |
| --- | --- | --- |
| Dos líneas salieron como una | Un salto de línea simple es un salto suave, impreso como espacio | Dos espacios al final, una barra invertida, o una línea en blanco |
| Se rompe en un cuadro de comentario y no en un archivo | Algunos renderizadores convierten cada salto de línea en `<br>`; un archivo `.md` no | Escribe el salto de forma explícita y sobrevive a los dos |
| El primer elemento de la lista acabó dentro del párrafo de arriba | Una lista ordenada solo puede interrumpir un párrafo cuando empieza en `1` | Deja una línea en blanco encima de la lista |
| Toda la lista salió en monoespaciado | Cuatro espacios en el nivel superior es un bloque de código con sangría | Empieza la lista dentro de tres espacios del margen |
| El elemento anidado se volvió hermano | La sangría de contenido es el ancho del marcador más los espacios que le siguen | Dos espacios bajo `- `, tres bajo `1. ` |
| El elemento anidado se volvió un bloque de código | El contenido está cuatro o más columnas por delante de la columna de contenido del padre | Cuenta desde la columna de contenido, no desde el margen |
| La lista ganó espacio vertical que nadie pidió | Una línea en blanco en cualquier parte vuelve suelta a toda la lista | Quítala, o acepta un `<p>` en cada elemento |
| Los números se renumeraron solos | Solo se lee el primer marcador; el navegador cuenta el resto | Escribe `1.` en cada elemento, a propósito |
| Una lista se convirtió en dos, en silencio | Cambiar el carácter de viñeta o el delimitador empieza una lista nueva | Mantén una viñeta y un delimitador por archivo |
| Un año al principio de una línea se volvió el elemento uno | `1986. ` es un marcador de lista ordenada válido | `1986\. ` |
| Los asteriscos desaparecieron y las palabras quedaron en cursiva | `*` abre énfasis en cualquier parte, incluso dentro de una palabra | `\*estrella\*`, o un fragmento de código |
| El checkbox se imprimió como `[ ]` | Las listas de tareas son una extensión de GFM, no CommonMark puro | Un conversor que hable GFM |
| Se imprimió una barra invertida al final de la línea | Ninguna sintaxis de salto funciona al final de un bloque | Pon el salto entre dos líneas, nunca después de la última |
| El segundo párrafo del elemento se cayó fuera de la lista | Una línea de continuación tiene que alcanzar la columna de contenido del elemento | Sángrala hasta donde empieza el propio texto del elemento |
| La sublista bajo el elemento diez perdió su sangría | `10. ` es una columna más ancha que `9. ` | Vuelve a contar el marcador en el diez, o sangra todo con cuatro espacios |
| El marcador del elemento anidado se imprimió como un guion en medio de una frase | Un texto sobresangrado sin línea en blanco encima es continuación del párrafo | Sangra hasta la columna de contenido, no más allá |

Cada fila es una regla de la especificación de CommonMark y no la opinión de una herramienta, y el resto de esta página son esas reglas con la aritmética escrita al detalle.

## Tres formas de terminar una línea

Empieza por el párrafo, porque toda pregunta sobre saltos de línea es en realidad una pregunta sobre párrafos disfrazada. Un párrafo es una serie de líneas consecutivas que no están en blanco. Termina en una línea en blanco y en ningún otro sitio. Los finales de línea dentro de él no son contenido: CommonMark llama a un final de línea dentro de un párrafo un salto de línea suave y dice que un renderizador puede presentarlo de varias formas. El comportamiento abrumadoramente por defecto, y lo que hace un archivo `.md` en cualquier sitio donde se renderice, es un único espacio.

Así que esto:

```markdown
Roses are red
Violets are blue
```

es un párrafo, dos líneas de origen y una línea de salida. El salto de línea sobrevive en el HTML como espacio en blanco, y el navegador lo colapsa como colapsaría cualquier serie de espacios en blanco. No se perdió nada y no se rompió nada. El archivo simplemente no está de acuerdo contigo sobre dónde termina una línea.

Dos detalles de esa definición importan más adelante. Las líneas de un párrafo pueden empezar cada una con hasta tres espacios de sangría sin cambiar nada, que es por lo que una línea ligeramente sangrada se sigue uniendo al párrafo de arriba en vez de convertirse en otra cosa. Y el espacio en blanco de ambos lados de un final de línea interno se descarta: la especificación dice que los espacios al final de una línea y al principio de la siguiente se eliminan (comprobado en spec.commonmark.org, el 9 de septiembre de 2026). Alinear la segunda línea de un párrafo no cambia nada en la salida, y tampoco lo hace desalinearla.

Tres cosas cambian eso, y una cuarta esquiva la pregunta.

| Lo que escribes | Qué hace el parser con eso | Qué obtienes |
| :--- | :--- | :--- |
| Una línea en blanco | Termina el párrafo | Un párrafo nuevo, `<p>` |
| Dos o más espacios al final de una línea | Un salto de línea forzado | `<br>` dentro del mismo párrafo |
| Una barra invertida al final de una línea | Un salto de línea forzado | `<br>` dentro del mismo párrafo |
| Un `<br>` literal | HTML crudo, pasado tal cual o escapado | `<br>`, si el conversor permite HTML crudo |

### Dos espacios al final, el salto que nadie puede ver

La regla de los dos espacios es el salto forzado original, y el más frágil. El espacio en blanco al final es invisible, muchos editores lo eliminan al guardar, los linters lo señalan, y quien revisa un diff no puede ver qué cambió.

Dos detalles que añade la especificación y que la mayoría de las guías se saltan. La regla es dos espacios *o más*, así que una línea que termina en cinco espacios se rompe exactamente igual que una que termina en dos — parte de por qué nadie lo distingue a simple vista, y por qué «añade otro espacio» nunca es el arreglo. Y ninguna de las dos formas hace nada al final de un bloque: un salto forzado necesita una línea después dentro del mismo párrafo, así que los espacios finales en la última línea de un párrafo son solo espacios finales.

Un tercer detalle resuelve una discusión que la gente tiene con sus propios archivos. Un salto forzado no puede ocurrir dentro de un fragmento de código ni dentro de una etiqueta HTML. Envuelve dos líneas en backticks, con dos espacios finales en la primera, y el renderizador te devuelve un único elemento `<code>` que lleva esos espacios como contenido y el salto de línea como espacio en blanco — ningún salto en ningún sitio. Si lo que quieres romper está dentro de un fragmento de código, la sintaxis que necesitas es un bloque con cercas, no un salto de línea.

### La barra invertida, y el único sitio donde se imprime a sí misma

La forma con barra invertida hace el mismo trabajo a la vista de todos. La especificación la presenta como la alternativa más visible a dos o más espacios. Es una incorporación de CommonMark: el documento original de sintaxis de Markdown solo describe la forma de dos espacios y trata una barra invertida puramente como una forma de imprimir un carácter literal (comprobado en daringfireball.net, el 9 de septiembre de 2026), así que un parser anterior a CommonMark imprime la barra invertida en vez de romper la línea.

Su modo de fallo es el opuesto al de los dos espacios, y la diferencia merece elegirse a propósito. Las dos son inertes al final de un bloque, pero solo la barra invertida lo dice. Un párrafo cuya última línea es `foo\` se renderiza como `<p>foo\</p>`, barra invertida incluida; un encabezado escrito `### foo\` se renderiza como `<h3>foo\</h3>`. Las mismas posiciones escritas con dos espacios finales se renderizan como `<p>foo</p>` y `<h3>foo</h3>` — nada se rompió, y nada lo dijo. Una sintaxis falla ruidosamente en la página; la otra falla en silencio y espera a que un lector note una línea que sigue de largo.

### `<br>`, y la opinión que tiene el conversor sobre él

La cuarta opción es dejar de usar Markdown para esa línea y escribir `<br>` tú mismo. Markdown permite HTML crudo por diseño, así que un `<br>` literal en el origen llega a la salida como un `<br>`. Es la única de las cuatro que es visible en un diff, sobrevive a un formateador, y no se puede borrar con un ajuste de editor. Sí depende de que el conversor deje pasar el HTML crudo, lo cual no es automático: markdown-it trae `html: false` en su preajuste por defecto, comentado como «Enable HTML tags in source» (comprobado en cdn.jsdelivr.net, el 9 de septiembre de 2026), así que las etiquetas crudas se escapan y tu `<br>` llega a la página como texto visible salvo que alguien haya activado esa opción. Un conversor que sanea un archivo que no escribió puede además descartar etiquetas que no reconoce. `<br>` está en cualquier lista blanca sensata, así que en la práctica llega — pero esa es la decisión del conversor, no la tuya.

### Qué hace un salto de línea simple, renderizador por renderizador

Antes de elegir entre las cuatro, merece la pena ver qué hacen de verdad los renderizadores, porque la razón de que la pregunta nunca se cierre es que las mismas dos líneas de Markdown producen documentos distintos según dónde se rendericen, y cada uno de esos renderizadores se comporta correctamente. La licencia de la especificación para divergir es explícita — un salto de línea suave puede presentarse de varias formas, y convertirlo en un `<br>` es una de ellas. Lo que sigue es la misma entrada contra los renderizadores que la gente de verdad usa, cada fila comprobada contra la documentación propia de ese proyecto.

| Dónde se renderiza el texto | Un salto de línea simple se convierte en | Cómo está documentado |
| --- | --- | --- |
| Un archivo `.md`, cualquier renderizador CommonMark o GFM | Un espacio | El tratamiento por defecto de la especificación para un salto suave |
| Un archivo `.md` en GitHub | Un espacio | La guía de escritura de GitHub dice que un salto en un archivo `.md` necesita dos espacios finales, una barra invertida o un `<br/>` (comprobado en docs.github.com, el 9 de septiembre de 2026) |
| Un comentario, issue, pull request o revisión en GitHub | `<br>` | La misma guía dice que los campos de comentario renderizan el salto por ti (comprobado en docs.github.com, el 9 de septiembre de 2026) |
| marked, sin configurar | Un espacio | Su opción `breaks` es `false` por defecto (comprobado en marked.js.org, el 9 de septiembre de 2026) |
| marked con `gfm: true` y `breaks: true` | `<br>` | Documentado como una copia del comportamiento de GitHub en comentarios, explícitamente no del comportamiento de GitHub en archivos renderizados; `breaks` exige `gfm` (comprobado en marked.js.org, el 9 de septiembre de 2026) |
| markdown-it, sin configurar | Un espacio | Su preajuste por defecto pone `breaks: false`, comentado como «Convert '\n' in paragraphs into `<br>`» (comprobado en cdn.jsdelivr.net, el 9 de septiembre de 2026) |
| markdown-it con `breaks: true` | `<br>` | La misma opción, haciendo el mismo trabajo |
| Python-Markdown, sin configurar | Un espacio | Los saltos de línea dentro de un párrafo son espacio en blanco salvo que una extensión diga lo contrario |
| Python-Markdown con la extensión `nl2br` | `<br />` | La extensión trata cada salto de línea como un salto forzado; se activa con `extensions=['nl2br']` (comprobado en python-markdown.github.io, el 9 de septiembre de 2026) |
| Pandoc leyendo `markdown`, `gfm` o `commonmark` | Un espacio | Su extensión `hard_line_breaks` está desactivada por defecto en los tres (comprobado en pandoc.org, el 9 de septiembre de 2026) |
| Pandoc con `+hard_line_breaks` | `<br />` | La extensión lee cada salto de línea dentro de un párrafo como un salto forzado en vez de un espacio (comprobado en pandoc.org, el 9 de septiembre de 2026) |

De ahí siguen dos consecuencias, y las dos son sobre el traspaso. Un texto redactado en un cuadro de comentario y pegado en un archivo se colapsa; un texto redactado en un archivo y pegado en un cuadro de comentario gana saltos que nunca tuvo. Ningún renderizador está equivocado, porque el documento nunca llevó esa información de ninguna de las dos formas.

La segunda consecuencia es más afilada. `breaks: true` es un ajuste del renderizador, no una propiedad del documento, así que un archivo que depende de él se renderiza correctamente en exactamente un sitio — el tuyo. Envíalo a un repositorio, un cliente de correo, una compilación de sitio estático o el conversor de cualquier otra persona, y los saltos desaparecen. Si el salto importa, ponlo en el documento: dos espacios, una barra invertida o un `<br>` sobreviven cualquier fila de esa tabla. [Las opciones que cambian cómo se comporta un renderizador de JavaScript](/blog/markdown-to-html-in-javascript) van mucho más allá de esta, y `breaks` es la que la gente activa sin pensar en quién va a leer la salida.

Hay un uso honorable de la opción, y merece nombrarse porque es el caso en el que suele estar quien la encuentra. Si tu aplicación controla los dos extremos — la caja donde alguien escribe y la página donde aparece su texto, y el texto nunca sale como un archivo `.md` —, entonces `breaks: true` coincide con lo que espera alguien que escribe en una caja, y nada más abajo se ve perjudicado. Un campo de comentario, un mensaje de chat, un panel de notas. En el momento en que ese texto se pueda exportar, confirmar o copiar en un repositorio, la opción deja de ser una comodidad y se convierte en un documento que solo se renderiza correctamente en casa.

### Cuál de las cuatro usar, y dónde

Para prosa corriente, la línea en blanco es casi siempre lo que querías. Reserva el salto forzado para donde la línea nueva es parte del contenido: una dirección, un verso, una firma de dos líneas.

| El documento va a | Usa | Porque |
| :--- | :--- | :--- |
| Un repositorio, leído en GitHub y en un editor | Una barra invertida | Visible en un diff, sobrevive a un recorte de espacios en blanco, y se imprime a sí misma si la pones en un sitio inútil |
| Un conversor que no controlas | `<br>` | HTML crudo, sujeto solo al saneado, no a opciones de salto de línea |
| Un archivo que toca un linter o un formateador al guardar | Una barra invertida o `<br>` | Dos espacios son la única forma que una cadena de herramientas borra sin avisar |
| Un cuadro de comentario, un issue, un mensaje de chat | Nada en absoluto | Esos renderizadores ya rompen en cada salto de línea |
| Prosa donde el salto es solo visual | Una línea en blanco | Es un párrafo nuevo, y los párrafos son para lo que se escriben las hojas de estilo |

Ninguna de las cinco respuestas es un ajuste de renderizador, y ese es el punto: un documento que lleva sus propios saltos se renderiza igual en cualquier sitio donde se abra. Las listas tienen la misma forma de problema medida en otra unidad — lo que hace una línea ahí depende de a qué distancia del margen empieza.

## Por qué la lista no es una lista

Una lista necesita una línea en blanco encima. Escrita justo debajo de una línea de prosa, el primer elemento puede absorberse en ese párrafo y salir como un guion suelto en medio de una frase.

Las reglas aquí difieren entre parsers. CommonMark deja que una lista de viñetas interrumpa un párrafo, y una lista ordenada solo cuando empieza en `1`. Los parsers más antiguos no permiten ninguna de las dos. Deja la línea en blanco y deja de importar cuál usa tu conversor — la misma defensa que mantiene [una tabla intacta](/blog/markdown-tables-that-survive-conversion), y una diferencia que cubre por completo [el artículo sobre los dialectos](/blog/commonmark-gfm-and-the-flavours).

### Interrumpir un párrafo, y la frase que creó la regla

La posición de CommonMark es que una lista puede interrumpir un párrafo, con dos excepciones sobre el primer elemento: cuando empieza en una línea que de otro modo sería texto de continuación del párrafo, el elemento no puede empezar con una línea en blanco, y si es ordenada su número de inicio tiene que ser `1` (comprobado en spec.commonmark.org, el 9 de septiembre de 2026). La especificación explica por qué de la forma más directa posible — imprimiendo la frase que se rompería de otro modo:

```markdown
The number of windows in my house is
14.  The number of doors is 6.
```

Eso se queda como un solo párrafo. Bajo una regla que permitiera que cualquier número interrumpiera, `14.` abriría una lista ordenada que empieza en catorce, y una frase envuelta automáticamente se desmoronaría según por dónde le tocara envolverse. Restringir la interrupción a `1` recupera casi cualquier numeral envuelto en prosa normal, y es la razón de que la regla sea asimétrica en vez de ordenada.

La lectura práctica es corta. Una lista de viñetas puede seguir a un párrafo sin línea en blanco y funciona. Una lista ordenada también puede, pero solo empezando en `1`, y solo bajo CommonMark. Cualquier cosa más antigua quiere la línea en blanco. Escribe la línea en blanco y nada de esto es tu problema.

### Cuatro espacios desde el margen no es una lista

El fallo opuesto es sangrar la lista. Hasta tres espacios de sangría antes del marcador no cambian nada en absoluto — la lista se renderiza como si los espacios no estuvieran. El cuarto espacio es el que cambia el bloque: una viñeta a cuatro espacios del margen izquierdo no es una lista, porque en el nivel superior cuatro espacios siguen significando un bloque de código con sangría, así que la lista llega como texto en monoespaciado con sus guiones intactos.

Es un fallo barato de diagnosticar y fácil de causar. Pegar una lista desde un contexto anidado, un editor que sangra al pulsar Enter, o una copia desde un cuadro de comentario que ya venía sangrado, producen todos esto. La pista es que nada en el origen se ve mal; la salida es una caja gris.

### Los números que escribes casi se ignoran

En una lista ordenada solo se lee el primer número. El número de inicio de la lista se toma de su primer elemento, y los números de los elementos siguientes se ignoran — el renderizador emite `<ol>`, o `<ol start="5">`, y el navegador cuenta desde ahí. Los marcadores tienen que tener nueve dígitos o menos: `123456789.` abre una lista, `1234567890.` es un párrafo que empieza con un número muy grande (comprobado en spec.commonmark.org, el 9 de septiembre de 2026). `1)` funciona igual que `1.` en CommonMark.

| Lo que escribes | Lo que se renderiza | La regla |
| :--- | :--- | :--- |
| `1.` `2.` `3.` | 1, 2, 3 | El primer marcador fija el inicio; el resto se ignora |
| `1.` `1.` `1.` | 1, 2, 3 | La misma regla, con un archivo que deja de contradecirse a sí mismo |
| `1.` `7.` `3.` | 1, 2, 3 | La misma regla otra vez — los números equivocados no cuestan nada |
| `5.` `6.` `7.` | 5, 6, 7 | `<ol start="5">`, y el navegador sigue contando desde cinco |
| `5.` `1.` `1.` | 5, 6, 7 | Solo se leyó el `5` |
| `0.` `0.` `0.` | 0, 1, 2 | Cero es un número de inicio válido |
| `1234567890.` | Un párrafo | Diez dígitos es uno de más para ser un marcador |

Escribir cada elemento como `1.` mantiene los diffs pequeños: la renumeración ocurre al renderizar en vez de a lo largo de veinte líneas del archivo, así que insertar un elemento en medio toca una línea en vez de todas. El contraargumento es que el origen ya no se lee en orden, lo cual importa si la gente lee el archivo `.md` directamente. Ambas posturas son defendibles; lo que no lo es es un archivo donde unas listas hacen una cosa y otras la otra, porque entonces un `7.` suelto parece un error que alguien debería corregir.

### Cambia el marcador y tienes dos listas

Cambiar el carácter de viñeta o el delimitador ordenado empieza una lista nueva. Es una regla, no una tolerancia, y es invisible en la página renderizada:

```markdown
- foo
- bar
+ baz
```

es un `<ul>` de dos elementos seguido de un `<ul>` de un elemento, no una lista de tres. Lo mismo pasa entre `1.`
y `1)`, y el caso ordenado lo anuncia más alto, porque la segunda lista empieza su propia numeración. Las causas
habituales son un archivo editado por dos personas con costumbres distintas, o un bloque pegado de algún sitio
que usaba `*` mientras tu archivo usa `-`.

En un navegador, dos listas de viñetas adyacentes se parecen casi exactamente a una, así que esto suele llegar a producción sin que nadie lo note. Lo que lo delata es el espaciado: si una de las dos listas contiene una línea en blanco se vuelve suelta mientras su vecina se queda apretada, y de repente media lista tiene más aire alrededor que la otra mitad. Un solo carácter de viñeta y un solo delimitador por documento elimina toda esta categoría de error.

## Cuánto sangrar una lista anidada en Markdown

La sangría se mide desde la columna de contenido del elemento padre, no desde el margen izquierdo. Esa es toda la regla, y explica cada lista que se niega a anidar.

```markdown
- Bullet: content starts at column 2
  - so two spaces nests under it
1. Ordered: `1. ` is three characters wide
   - so three spaces nests under it
10. At ten the marker is four wide
    - and four spaces is what nests
```

Cuatro espacios es la costumbre que casi todo el mundo trae de otro sitio, y como la sangría extra está permitida, suele funcionar. Falla en las dos direcciones: muy poca sangría y la lista anidada se vuelve hermana de su padre; cuatro o más columnas por delante de la columna de contenido y vuelve a ser código.

### La aritmética, escrita al detalle

La especificación construye un elemento de lista a partir de un marcador de ancho A seguido de N espacios, donde N está entre uno y cuatro, y luego sangra cada línea posterior de ese elemento por A + N (comprobado en
spec.commonmark.org, el 9 de septiembre de 2026). A + N es la columna de contenido, y es el único número que importa. La propia guía de escritura de GitHub da la misma regla sin el álgebra: escribe espacios delante del elemento anidado hasta que su marcador quede justo debajo del primer carácter del texto de arriba, y en una fuente proporcional, cuenta los caracteres que aparecen antes del contenido del elemento (comprobado en docs.github.com, el 9 de septiembre de 2026).

Así que el ancho del marcador es el ancho tal como se escribió, y cada parte de él cuenta:

| Marcador del padre | Ancho del marcador | Espacios después | Columna de contenido | Anida un hijo en |
| :--- | :--- | :--- | :--- | :--- |
| `- ` | 1 | 1 | 2 | 2 espacios |
| `* ` | 1 | 1 | 2 | 2 espacios |
| `-   ` | 1 | 3 | 4 | 4 espacios |
| `1. ` | 2 | 1 | 3 | 3 espacios |
| `1) ` | 2 | 1 | 3 | 3 espacios |
| `10. ` | 3 | 1 | 4 | 4 espacios |
| `100. ` | 4 | 1 | 5 | 5 espacios |

La fila que sorprende a la gente es `10. `. Una lista que anidó bien durante nueve elementos deja de anidar bien en el décimo, porque el marcador ganó un carácter y la columna de contenido se movió con él. Nadie busca eso, porque el archivo que se rompió es el mismo que funcionaba ayer con un elemento menos.

### Dos espacios bajo una viñeta, y qué producen las otras sangrías

Toma un padre de viñeta, columna de contenido 2. Correcto:

```markdown
- Parent item
  - Nested, because two spaces reach the content column
```

Un espacio de menos, y el hijo no es un hijo en absoluto — es otro elemento de la misma lista, porque un marcador de lista puede llevar hasta tres espacios de sangría propia:

```markdown
- Parent item
 - One space: a sibling, rendered flush with its parent
```

Cuatro columnas por delante de la columna de contenido, con una línea en blanco encima, y el parser lee un bloque de código con sangría dentro del elemento padre:

```markdown
- Parent item

      - Six spaces: this is code now
```

que se renderiza como `<li><p>Parent item</p><pre><code>- Six spaces: this is code now</code></pre></li>` — una caja gris bajo la viñeta, guion incluido. Quita la línea en blanco y los mismos seis espacios producen algo distinto otra vez: sin línea en blanco, el texto sobresangrado es continuación del párrafo, así que se une al propio párrafo del padre y el marcador se imprime como un guion literal en medio de la frase.

### Tres espacios bajo un elemento ordenado

Un padre ordenado mueve la columna en uno, y la costumbre de los dos espacios falla de una forma que parece un error del conversor:

```markdown
1. Parent item
  - Two spaces: not nested, and not even in the list
```

Dos espacios se quedan cortos de la columna de contenido, que está en 3, así que el hijo no forma parte del elemento; y como su marcador es una viñeta en vez de un número, tampoco puede ser hermano. La lista ordenada se cierra y se abre una lista de viñetas al lado. La página renderizada muestra un `<ol>` con un elemento seguido de un `<ul>` con un elemento — lo que, en la mayoría de las hojas de estilo, se ve como una lista anidada que perdió su sangría.

Tres espacios es el arreglo:

```markdown
1. Parent item
   - Three spaces: nested, as intended
```

| Sangría bajo un padre `- ` | Sangría bajo un padre `1. ` | Qué hace el parser con eso |
| :--- | :--- | :--- |
| 0–1 espacios | 0–2 espacios | No forma parte del elemento: un hermano si el tipo de marcador coincide, una lista completamente nueva si no |
| 2–5 espacios | 3–6 espacios | Una lista anidada — la columna de contenido, más hasta tres espacios de margen |
| 6+ espacios tras una línea en blanco | 7+ espacios tras una línea en blanco | Un bloque de código con sangría dentro del elemento padre |
| 6+ espacios sin línea en blanco | 7+ espacios sin línea en blanco | Continuación del párrafo: el marcador se imprime como texto |

El margen de la fila central es por lo que cuatro espacios suele funcionar y sigue siendo la costumbre equivocada. Cuatro está dentro del rango para los dos marcadores hoy. Deja de estar dentro del rango en el momento en que un marcador se hace más ancho, y esconde la aritmética a quien edite el archivo después.

### Qué puede ir dentro de un elemento de lista

Todo lo que puedes escribir en el nivel superior puede ir dentro de un elemento de lista, siempre que empiece en la columna de contenido del elemento. Esa es toda la extensión de la regla, y cubre cuatro cosas que la gente pregunta por separado:

- **Un segundo párrafo.** Línea en blanco, y luego el párrafo sangrado hasta la columna de contenido. Bajo `- item`
  eso son dos espacios. Sángralo con un espacio menos y se cae de la lista por completo: la lista se cierra y el
  texto se convierte en un párrafo propio, situado debajo de una lista de la que se supone que forma parte.
- **Un bloque de código.** Una valla que empieza en la columna de contenido pertenece al elemento; cuatro columnas
  más allá, la valla deja de ser una valla y se convierte en backticks literales dentro de un bloque de código con
  sangría. Ese caso tiene [su propia aritmética y sus propios ejemplos resueltos](/blog/code-blocks-in-markdown),
  incluido lo que pasa cuando la lista pasa del elemento diez.
- **Una cita en bloque.** Un `> ` en la columna de contenido, en cada línea de la cita, líneas en blanco incluidas.
  Quita la marca en una línea y la cita termina ahí.
- **Otra lista.** Que es la regla de anidado de arriba, aplicada otra vez desde la nueva columna de contenido.

Dos consecuencias se derivan de escribirlo así. Un elemento de lista es un contenedor de bloque, no una línea de
texto, así que cualquier cosa sobre él — espaciado, código, citas — es una pregunta sobre columnas, no sobre
listas. Y cuanto más anides, más columnas estás contando, que es el argumento práctico contra tres niveles de
anidado en un documento que va a editar alguien más.

## Listas apretadas, listas sueltas, y la línea en blanco que las cambia

Y luego está el espaciado que aparece de la nada. Una lista está apretada cuando sus elementos se apoyan unos contra otros, y su texto va directo dentro de cada `<li>`. Pon una línea en blanco entre dos elementos, o dale a un elemento dos párrafos, y toda la lista se vuelve suelta: cada elemento, incluidos los que no tocaste, se lleva su texto envuelto en un párrafo, que se ve en el navegador como espacio vertical extra. Una línea vacía cambió el tipo de la lista.

La especificación fija la condición y la consecuencia en un solo lugar: una lista es suelta si alguno de sus
elementos está separado por líneas en blanco, o si algún elemento contiene directamente dos elementos de bloque
con una línea en blanco entre ellos; en caso contrario está apretada. La diferencia en el HTML es que los
párrafos en una lista suelta van envueltos en etiquetas `<p>` y los párrafos en una lista apretada no (comprobado
en spec.commonmark.org, el 9 de septiembre de 2026).

Ese es el mecanismo entero. Aquí está el par, uno junto al otro. Apretada:

```markdown
- a
- b
- c
```

```html
<ul>
<li>a</li>
<li>b</li>
<li>c</li>
</ul>
```

Suelta, por una sola línea en blanco antes del último elemento:

```markdown
- a
- b

- c
```

```html
<ul>
<li><p>a</p></li>
<li><p>b</p></li>
<li><p>c</p></li>
</ul>
```

Tres cosas de esa salida merecen decirse con claridad, porque cada una es una pregunta de soporte que alguien ya
ha hecho.

**El cambio es a la lista, no al elemento.** Los elementos `a` y `b` no se tocaron y los dos ganaron un `<p>`.
Estar suelta es una propiedad de la lista entera, así que una línea en blanco en cualquier parte de ella
vuelve a renderizar cada elemento.

**El espaciado viene de tu hoja de estilo, no de Markdown.** Un `<p>` dentro de un `<li>` hereda cualquier
margen superior e inferior que la página le dé a los párrafos. Por eso el mismo archivo se ve bien en GitHub y
aireado en un sitio de documentación, o al revés: la cantidad de espacio extra es una decisión de CSS que
Markdown solo disparó.

**Una lista anidada después de una línea en blanco vuelve suelta también a la lista exterior.** Esta es la regla
que atrapa a quien no hizo nada mal:

```markdown
- a

  - a nested item
- b
```

El primer elemento ahora contiene directamente un párrafo y una lista con una línea en blanco entre ellos, así
que toda la lista exterior queda suelta y el elemento `b` se lleva un `<p>` que no pidió. Quita la línea en blanco
y la lista vuelve a estar apretada.

Nada de esto es un defecto que arreglar. Las listas sueltas son la forma correcta cuando los elementos son
frases o contienen varios bloques; las apretadas son correctas para etiquetas cortas. Lo que causa problemas es
hacer las dos cosas por accidente en un mismo documento, de modo que algunas listas respiran y otras no por
razones que nadie ve en el origen. Elige por lista, a propósito, y mantén las líneas en blanco consistentes
dentro de cada una.

## Checkboxes y listas de tareas

Un checkbox es un elemento de lista cuyo texto empieza con corchetes:

- [x] Marcador, espacio, corchetes, espacio, y luego el texto
- [ ] Los corchetes van primero — texto antes de ellos y es un elemento normal
- [ ] `x` o `X` lo marca, un solo espacio lo deja vacío, y ese espacio es obligatorio

Una lista de tareas es una extensión de GitHub Flavored Markdown, no CommonMark puro, así que un conversor estrictamente CommonMark te devuelve corchetes literales. TransformPipe habla GFM, así que las listas de tareas, las tablas, el tachado y los autoenlaces llegan como ellos mismos. El checkbox en la salida es una fotografía del estado de tu archivo, no un control: GFM lo renderiza como un input deshabilitado, así que no hay nada que se pueda pulsar.

La especificación de GFM es precisa sobre qué cuenta. Un elemento de lista de tareas es un elemento de lista cuyo primer bloque es un párrafo que empieza con una marca de lista de tareas seguida de al menos un carácter de espacio en blanco antes de cualquier otro contenido, y la marca en sí es un corchete izquierdo, o bien un carácter de espacio en blanco o la letra `x` en cualquier caso, y luego un corchete derecho. Renderizada, la marca se sustituye por un elemento de casilla, marcada cuando el carácter entre los corchetes es cualquier cosa que no sea espacio en blanco (comprobado en github.github.com, el 9 de septiembre de 2026).

Leído contra un archivo real, eso da cuatro reglas y una sorpresa:

| Lo que escribes | Lo que obtienes | Por qué |
| :--- | :--- | :--- |
| `- [ ] Tarea` | Un checkbox sin marcar | Espacio en blanco entre los corchetes |
| `- [x] Tarea` o `- [X] Tarea` | Un checkbox marcado | Cualquiera de las dos formas de `x` lo marca |
| `- []Tarea` | Un elemento de lista normal, corchetes visibles | Sin espacio en blanco dentro, y ninguno después |
| `- Tarea [ ] después` | Un elemento de lista normal, corchetes visibles | La marca tiene que empezar el primer párrafo del elemento |
| `- [ ] Padre` con un `- [ ] Hijo` sangrado | Checkboxes anidados | Las listas de tareas anidan como cualquier otra lista |

La sorpresa es la propia salida. El renderizado de referencia es `<input disabled="" type="checkbox">` —
un elemento input, ya deshabilitado, dentro del `<li>`. GitHub añade su propio comportamiento por encima
dentro de issues y pull requests, donde las casillas se pueden marcar y desmarcar mientras avanza el trabajo
(comprobado en docs.github.com, el 9 de septiembre de 2026); un documento HTML convertido no tiene dónde
guardar un clic, así que el checkbox es una fotografía estática del estado en el origen. Si necesitas un
checkbox que alguien pueda marcar y que se recuerde, necesitas una aplicación, no un documento.

El modo de fallo con un conversor que no habla GFM es más silencioso de lo que suena. No obtienes un
error; obtienes `<li>[ ] Tarea</li>`, que es una lista de elementos que empiezan con dos corchetes. En una
página con un estilo cuidado se lee como un error de formato en vez de una función que falta, que es por qué
«mis checkboxes dejaron de funcionar» suele ser un problema de dialecto — el mismo que hace que las tablas y
el tachado desaparezcan al mismo tiempo.

## Escapar un carácter que significa algo

El carácter de escape es una barra invertida. En CommonMark funciona delante de cualquier signo de puntuación ASCII y en ningún otro sitio, así que una barra invertida delante de una letra se queda en la página como una barra invertida.

```markdown
1986\. The year, not the first item of a list.
The shape is a \*star\*, and I mean the asterisks.
A literal backslash is written \\.
```

La fecha es el caso clásico: una línea que empieza con un número, un punto y un espacio es una lista ordenada, así que un párrafo que empieza con un año se convierte en silencio en el elemento uno. Los encabezados (`#`), las citas en bloque (`>`) y las viñetas (`-`) hacen lo mismo al principio de una línea, y las barras verticales necesitan escaparse dentro de una tabla.

Dos cosas te ahorran barras invertidas. Los guiones bajos dentro de una palabra se dejan tal cual, así que `snake_case_name` sobrevive sin tocar; los asteriscos no, así que `a*b*c` sigue poniendo énfasis. Y una barra invertida no hace nada dentro de un fragmento de código, que de todos modos es la mejor respuesta para un nombre de archivo, una opción o un patrón glob — el caso que abre [la referencia completa sobre el escape](/blog/markdown-escaping), que continúa con las referencias de carácter que una barra invertida no puede sustituir y los casos de plantillas, rutas de Windows e `__init__` que producen la mayoría de las quejas.

### Cada carácter que necesita uno, y dónde

El conjunto es fijo. CommonMark permite una barra invertida delante de cualquier carácter de puntuación ASCII
y en ningún otro sitio, y son estos treinta y dos: ``!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~`` (comprobado en
spec.commonmark.org, el 9 de septiembre de 2026). Una barra invertida delante de una letra, un dígito o un
espacio es una barra invertida literal, impresa.

La mayoría de esos treinta y dos nunca hacen nada y nunca necesitan escaparse. Estos sí:

| Carácter | Qué significa sin escapar | Dónde muerde | Escribe en su lugar |
| :--- | :--- | :--- | :--- |
| `\` | El propio carácter de escape | En cualquier parte del texto | `\\` |
| `` ` `` | Abre un fragmento de código | En cualquier parte en línea | ``\` ``, o envuelve el texto en más backticks |
| `*` | Énfasis, y una marca de viñeta | En cualquier parte en línea, incluso en medio de una palabra; al principio de línea | `\*` |
| `_` | Énfasis | Solo en un límite de palabra — un guion bajo en medio de una palabra es seguro | `\_` |
| `#` | Un encabezado ATX | Solo al principio de línea | `\#` |
| `>` | Una cita en bloque | Solo al principio de línea | `\>` |
| `-` | Una viñeta, un subrayado setext, una línea horizontal | Solo al principio de línea | `\-` |
| `+` | Una viñeta | Solo al principio de línea | `\+` |
| `.` | Un marcador de lista ordenada, tras dígitos | Solo al principio de línea | `1986\.` |
| `)` | Un marcador de lista ordenada, tras dígitos | Solo al principio de línea | `1986\)` |
| `[` `]` | Un enlace, una imagen, una nota, una marca de tarea | En cualquier parte en línea | `\[` `\]` |
| `!` | Una imagen, cuando le sigue `[` | En cualquier parte en línea | `\!` |
| `<` | HTML crudo, o un autoenlace | En cualquier parte en línea | `\<`, o la entidad `&lt;` |
| `&` | El inicio de una referencia de entidad | En cualquier parte en línea | `&amp;` |
| Una barra vertical | Un límite de celda en una tabla GFM | Solo dentro de una fila de tabla | Una barra invertida delante, incluso dentro de un fragmento de código |
| `~` | Tachado, en GFM | En cualquier parte en línea, en pares | `\~` |
| `=` | Un subrayado setext de encabezado, convirtiendo la línea de arriba en un `<h1>` | Al principio de línea, justo bajo un párrafo | `\=` |

La columna que ahorra más trabajo es la tercera. `#`, `>`, `-`, `+`, `.` y `)` tienen significado solo al
principio de una línea, así que un almohadilla en medio de una frase es solo un almohadilla y no necesita
nada. Escaparlos siempre es una costumbre heredada de herramientas que escapan por precaución, y deja barras
invertidas por toda la prosa que un lector va a ver eventualmente, porque una barra invertida delante de un
carácter que no significaba nada sigue desapareciendo de la salida pero se queda en el archivo para que la
siguiente persona se lo pregunte.

### Dónde una barra invertida no hace absolutamente nada

Los escapes no funcionan dentro de fragmentos de código, bloques de código, autoenlaces o HTML crudo
(comprobado en spec.commonmark.org, el 9 de septiembre de 2026). Dentro de backticks, `\*` es una barra
invertida y un asterisco, los dos impresos — que es exactamente lo que quieres para un patrón glob o una
ruta de Windows, y exactamente lo que sorprende a quien escapó primero y añadió los backticks después.

Sí funcionan en tres sitios que quizá no esperes: destinos de enlace, títulos de enlace, y la cadena de
información tras una valla. Un paréntesis dentro de una URL puede escaparse en vez de codificarse por
porcentaje, y un título que contiene unas comillas puede llevarlas.

### Los escapes que un conversor escribe por ti

En la otra dirección — HTML, un `.docx` o una hoja de cálculo convertidos a Markdown — cada uno de estos
caracteres es problema del conversor, no tuyo, y es una forma razonable de juzgarlo. Un párrafo de Word que
empieza «1986. El año» tiene que llegar como `1986\. El año` o el documento gana una lista que nadie escribió.
Un encabezado cuyo texto contiene un `#`, una frase con un guion bajo o un asterisco, una celda de tabla con
una barra vertical: cada uno necesita una barra invertida insertada durante la conversión, y un conversor que
se salta este paso produce un archivo Markdown que se renderiza como algo distinto del documento del que
vino. Merece la pena probarlo con un párrafo deliberadamente incómodo antes de confiarle a un conversor cien
páginas.

En la otra dirección, el escape es problema del navegador y el conversor lo gestiona en silencio: `<`
y `&` en tu texto llegan al HTML como `&lt;` y `&amp;`, que es por lo que un `<div>` literal escrito en
prosa aparece como texto en la página en vez de desaparecer dentro del marcado.

## La parte honesta: la sintaxis que borra tu propia cadena de herramientas

Todo lo anterior asume que el archivo que guardaste es el archivo que lee el conversor. Para el salto forzado
de dos espacios, esa suposición suele ser falsa, y lo es de una forma que nadie puede ver.

El espacio en blanco final es lo único que casi cualquier cadena de herramientas moderna está configurada
para eliminar. Es una propiedad estándar de EditorConfig: `trim_trailing_whitespace` puesto en `true` elimina
los caracteres de espacio en blanco antes del salto de línea, y está soportado en todos los editores
(comprobado en editorconfig.org, el 9 de septiembre de 2026). Un repositorio con un `.editorconfig` que lo
fija para `[*]` borra tus saltos de línea en el siguiente guardado, en cada archivo, para todo el mundo.
Nada avisa, porque desde el punto de vista del editor no eliminó nada de valor, y [el editor en el que
escribes](/blog/best-markdown-editors) suele ser el que lo está aplicando — un ajuste que alguien activó
hace años para un lenguaje donde el espacio en blanco final de verdad es ruido.

El linter está de acuerdo con el editor y en desacuerdo con la especificación. La regla MD009 de
markdownlint, con el alias `no-trailing-spaces`, marca las líneas que terminan en espacio en blanco
inesperado, con un parámetro `br_spaces` que permite una excepción para un número concreto de espacios
finales usados como salto explícito; su valor por defecto es `2` (comprobado en github.com, el 9 de
septiembre de 2026). Así que un salto de dos espacios pasa y uno de tres se marca — aunque los dos se
renderizan de forma idéntica, porque la regla real es «dos o más». La sintaxis es legal en cualquier
anchura por encima de uno y limpia para el linter en exactamente una anchura.

Suma los dos últimos hechos y el panorama queda completo. Una revisión de código no muestra nada: los
espacios finales no aparecen en un diff como contenido, así que el commit que borró tus saltos de línea se
parece al commit que arregló una sangría. Y quien se entera es el lector, semanas después, mirando una
dirección que quedó comprimida en una sola línea.

Este es el extremo más afilado de todo el asunto. La forma documentada, original, soportada en todas partes
de romper una línea es una secuencia de caracteres invisibles que las herramientas alrededor de tu archivo
están configuradas para borrar, que tu linter permite en exactamente una anchura, y cuya desaparición es
invisible en la revisión. No es un defecto de Markdown y no es un defecto de las herramientas; son dos
posturas razonables encontrándose en un archivo.

## Conclusión: las reglas que sobreviven un viaje de ida y vuelta

Diez reglas cubren cada fallo de esta página, y todas son la misma regla por debajo: pon el significado en
el documento en vez de en la herramienta que lo renderiza.

1. **Escribe los saltos forzados con una barra invertida, no con dos espacios.** Un recorte de espacios en
   blanco no puede borrarla, un diff la muestra, y si la pones en un sitio inútil se imprime en vez de fallar
   en silencio.
2. **Usa un `<br>` literal cuando el conversor no sea tuyo.** Lo único que puede eliminarlo es la lista blanca
   de un saneador, que es una lista más corta de posibilidades que la opción de salto de línea de cada
   renderizador.
3. **Recurre a una línea en blanco antes que a cualquiera de las dos.** Un párrafo nuevo es un bloque que una
   hoja de estilo puede espaciar, y un `<br>` no lo es — así que la mayoría de los saltos por los que la gente
   lucha debieron haber sido párrafos.
4. **Deja una línea en blanco encima de cada lista.** Cuesta una línea y elimina cada diferencia entre
   dialectos sobre interrumpir un párrafo, incluida la regla de que una lista ordenada tiene que empezar en 1.
5. **Cuenta el marcador en vez de fiarte de la costumbre: dos bajo `- `, tres bajo `1. `, cuatro desde el
   elemento diez.** Cuatro espacios funciona hasta que un marcador se hace más ancho, y la lista que se rompe
   es la que no editaste.
6. **Decide apretada o suelta por lista, y mantén consistentes las líneas en blanco dentro de ella.** De lo
   contrario el espaciado de tu documento cambia por razones invisibles en el origen y sin poder atribuirse en
   una revisión.
7. **Mantén un carácter de viñeta y un delimitador ordenado por documento.** Un `+` o un `1)` sueltos dividen
   en silencio una lista en dos, y dos listas adyacentes se parecen casi exactamente a una.
8. **Escapa un carácter solo donde de verdad significa algo.** `#`, `>`, `-` y `.` significan algo al
   principio de una línea y nada en cualquier otro sitio, así que escaparlos siempre deja barras invertidas en
   prosa que alguien va a leer eventualmente en el origen.
9. **Trata la opción `breaks` de un renderizador como una propiedad de tu aplicación, nunca de tus
   documentos.** El día que el texto se exporte, se confirme o se pegue en otro sitio, cada salto que
   dependía de ella desaparece.
10. **Lee el HTML, no la vista previa.** Un `<p>` donde esperabas un `<br>`, un `<pre>` donde esperabas un
    elemento anidado, un segundo `<ul>` donde esperabas una sola lista: la salida nombra la regla que se
    activó.

Nada de esto necesita una herramienta que lo haga cumplir. Necesita que el archivo de origen diga lo que
querías decir, para que el archivo siga significando eso después de que un formateador, un revisor y el
conversor de otra persona hayan pasado por él. Cuando un documento se sigue renderizando mal y no ves por
qué, convierte y lee el HTML junto a la vista previa — [TransformPipe hace eso en el navegador](/), con el
origen y la salida lado a lado — porque las etiquetas responden la pregunta que el origen no puede: un `<p>`
significa que el salto nunca ocurrió, un `<pre>` significa que sangraste demasiado, y una lista que ganó
párrafos significa que se coló una línea en blanco donde no estabas mirando. Cada síntoma de esta página se
resuelve en uno de esos tres, y cada uno es una regla haciendo exactamente lo que dice.

## Preguntas frecuentes

### ¿Cómo hago un salto de línea en Markdown?

Termina la línea con dos espacios o una barra invertida y el salto ocurre dentro del mismo párrafo, como un
`<br>`. Deja una línea en blanco en su lugar y obtienes un párrafo nuevo, que es lo que quieres para prosa.
La barra invertida es la mejor de las dos formas de salto forzado, porque los espacios finales son
invisibles y la mayoría de las cadenas de herramientas los eliminan.

### ¿Por qué no funciona mi salto de línea en GitHub?

Porque un archivo `.md` y un cuadro de comentario son dos renderizadores distintos. La guía de GitHub dice
que un campo de comentario renderiza el salto por ti, mientras que un salto en un archivo `.md` necesita dos
espacios finales, una barra invertida o un `<br/>` (comprobado en docs.github.com, el 9 de septiembre de
2026). Un texto redactado en un comentario y pegado en un archivo se colapsa por esta misma razón.

### ¿Cuántos espacios debo sangrar una lista anidada en Markdown?

Dos bajo `- `, tres bajo `1. `, y cuatro en cuanto la numeración llega a `10. ` — el ancho del marcador más
los espacios que le siguen. Muy pocos y el elemento se vuelve hermano en vez de hijo; cuatro o más columnas
por delante de ese punto y se vuelve un bloque de código o se une al párrafo del padre.

### ¿Por qué mi lista ganó de repente espacio extra entre elementos?

Una línea en blanco en algún sitio dentro de ella volvió suelta a toda la lista, así que el texto de cada
elemento ahora va envuelto en un `<p>` y hereda los márgenes de párrafo de tu hoja de estilo. La línea en
blanco no tiene que estar entre elementos — una antes de una lista anidada tiene el mismo efecto. Quítala y
la lista vuelve a estar apretada.

### ¿Por qué se renumeran solos los números de mi lista?

Solo se lee el primer marcador; los números de los elementos siguientes se ignoran y el navegador cuenta
desde el número de inicio. Por eso `1. 7. 3.` se renderiza como 1, 2, 3, y por eso escribir cada elemento
como `1.` es un estilo legítimo y no un error.

### ¿Por qué se renderiza mi checkbox como `[ ]`?

Las listas de tareas son una extensión de GitHub Flavored Markdown y no parte de CommonMark, así que un
conversor estrictamente CommonMark renderiza los corchetes como texto normal. Necesitas un conversor que
hable GFM — el mismo que necesitas para tablas, tachado y autoenlaces, que es por lo que suelen romperse
juntos.

### ¿Cómo evito que un año al principio de una línea se convierta en una lista?

Escapa el punto: `1986\. El año`. Un dígito seguido de `.` o `)` y un espacio es un marcador de lista
ordenada válido al principio de una línea, así que el párrafo se convierte en el elemento uno de una lista
que empieza en 1986. La barra invertida es invisible en la salida y no cuesta nada.
