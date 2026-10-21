---
title: Tu asistente de IA escribe en Markdown. Tus compañeros no lo leen así.
description: Por qué los asistentes de chat responden en Markdown, qué sobrevive al pegarlo en Word o Slack, y la vía aburrida que siempre funciona: guardar, convertir, enviar
updated: 2026-10-21
date: 2026-07-21
tag: Workflow
keywords: chatgpt markdown a word, exportar respuesta de chatgpt, convertir respuesta de claude a documento, salida markdown de un llm, documentacion generada por ia, pegar markdown en word, asteriscos en la respuesta de la ia, formulas con signos de dolar en markdown
---

La respuesta en la ventana de chat parece un documento. Encabezados, una tabla corta, una lista numerada, negrita en los sitios correctos. La copias en un correo y te encuentras con una pared de asteriscos y signos de número. O te llega medio documento: los encabezados salieron bien, la tabla llegó como una fila de barras verticales, y tu lector tiene que adivinar qué caracteres eran literales.

No se ha roto nada. El asistente escribió en Markdown, porque eso es lo que escriben estas herramientas.

La brecha no es una cuestión de gusto. Lo que ves en pantalla y lo que hay en tu portapapeles son dos documentos distintos, y cada sitio donde pegas hace su propia conjetura sobre cuál de los dos recibió. Algunos destinos adivinan bien. La mayoría adivina de forma distinta entre sí, que es por lo que la misma respuesta se ve bien en una ventana y rota en la siguiente.

### Resumen rápido

Los asistentes de chat responden en Markdown porque es la forma más barata de marcar un encabezado dentro de un flujo de texto plano, y la ventana de chat te devuelve esa fuente ya renderizada. El portapapeles se lleva la fuente. El correo, Slack, Word, Google Docs, Notion, los sistemas de tickets y los gestores de contenido la interpretan cada uno a su manera, así que las tablas, el código con cerca, las listas anidadas, las marcas de nota al pie y cualquier cosa matemática se rompen en un sitio distinto en cada uno. La vía que aguanta es aburrida: guarda la respuesta como archivo `.md`, léela contra una lista de comprobación antes de que lleve tu nombre, conviértela una vez en una página HTML autocontenida, y manda la página en lugar del texto pegado.

## Por qué la respuesta llega en Markdown

Un modelo emite texto pieza a pieza. Para marcar un encabezado tiene que usar caracteres dentro del mismo flujo que las palabras, y Markdown es la forma más barata de hacerlo: texto plano, unos pocos signos de puntuación, ningún formato que negociar. La interfaz de chat lo renderiza de vuelta en tu pantalla. Ese renderizado es la ilusión — lo que tienes en la mano es la fuente.

Esto no es una rareza de un solo producto. ChatGPT, Claude, Gemini y Copilot responden así, y también lo hacen los asistentes dentro de editores y sistemas de tickets. Pedir texto plano funciona a veces, pero entonces estás negociando con un modelo en lugar de convertir un archivo.

## Lo que hace copiarlo, en realidad

La mayoría de las ventanas de chat guardan dos copias de la respuesta. El botón de copiar te entrega la fuente, asteriscos y todo. Una selección con el ratón te entrega la versión renderizada como texto enriquecido, que el destino reinterpreta después. Ninguna de las dos es fiable, y fallan en sitios distintos.

| Dónde lo pegas | Botón de copiar (fuente) | Selección con el ratón (texto enriquecido) |
| --- | --- | --- |
| Correo en texto plano | Cada almohadilla, asterisco y barra vertical | Se aplana de vuelta a texto plano |
| Word o Google Docs | Sintaxis en bruto, nada renderizado | Encabezados, negrita y normalmente las tablas sobreviven; el código con cerca pierde su bloque |
| Slack o Teams | Parte de la sintaxis se renderiza, parte se queda literal | Varía según el cliente; las listas y las cercas de código son las que más sufren |
| Un wiki que entiende Markdown | Cerca de estar bien, si su dialecto coincide | Texto enriquecido, así que el Markdown ha desaparecido |

El caso a medias es el caro. Un lector que ve encabezados limpios encima de un desastre de barras verticales asume que lo mandaste sin cuidado, no que dos herramientas no se pusieron de acuerdo sobre las tablas. Las tablas son la víctima fiable en cualquier caso, por [razones que conviene conocer](/blog/markdown-tables-that-survive-conversion) si las pegas a menudo.

Merece la pena ser precisos sobre lo que entrega el botón de copiar, porque es lo mismo en todas partes aunque las interfaces no lo sean: una cadena de texto Markdown. No un documento, no un formato con nombre propio, no algo que un cliente de correo pueda abrir — una sucesión de caracteres donde `##` significa encabezado solo para un lector que ya sabe eso. Nada en el portapapeles lo dice.

Una selección con el ratón es distinta por naturaleza. Los navegadores ponen dos representaciones en el portapapeles a la vez: una versión en texto plano y una versión en HTML de la misma selección, y la aplicación receptora elige la que prefiera. Pega en un campo de texto plano y recibes el texto aplanado. Pega en un campo de texto enriquecido y recibes el propio marcado de la ventana de chat — sus etiquetas `<h2>`, su estructura de lista, y a veces sus clases CSS y sus colores, que es por lo que una respuesta pegada llega a veces en una tipografía que nadie eligió. Ninguna de las dos vías es un fallo, y ninguna se puede arreglar en el destino.

### A dónde va, destino por destino

Esta es la chuleta. Describe qué le pasa al texto Markdown del botón de copiar, porque esa es la copia que la gente usa, y la última columna es qué hacer en su lugar. El comportamiento varía entre clientes y versiones, así que lee la tabla como la forma del problema y no como una garantía sobre la versión que tienes delante.

| Destino | Qué sobrevive al pegado | Qué no sobrevive | Qué hacer en su lugar |
| --- | --- | --- | --- |
| Correo en texto plano | Nada se interpreta; el texto se muestra exactamente como se escribió | Cada encabezado, cada marcador de lista, cada fila de tabla se lee como puntuación | Adjunta o enlaza una página convertida |
| Correo HTML | Los saltos de párrafo, más o menos | Encabezados, negrita, tablas, código — todo sintaxis literal | Manda un enlace, o un archivo `.html` autocontenido |
| Slack | Negrita, cursiva y código en línea, una vez que el compositor los interpreta | Los encabezados y las tablas no tienen equivalente en un mensaje | Enlaza la página; pon dos líneas de resumen encima |
| Word | Párrafos, y lo que el autocorrector decida cambiar | Los encabezados se quedan como almohadillas; las cercas como acentos graves; las tablas como barras verticales | Convierte, o pega texto enriquecido y repáralo |
| Google Docs | Párrafos, y un comportamiento que depende de una preferencia del documento | Lo mismo, salvo que la preferencia diga otra cosa | Prueba la preferencia una vez, o convierte y enlaza |
| Notion | Casi todo: Notion lee el Markdown pegado como Markdown | El anidamiento profundo, y cualquier cosa sin bloque equivalente en Notion | Pégalo, y revisa las listas y los bloques de código |
| Un ticket | Todo, si el cuadro de comentarios del sistema entiende Markdown | Todo, si entiende su propio marcado en su lugar | Averigua en qué bando está tu sistema, una vez |
| Un CMS | Párrafos, como párrafos | La estructura, salvo que el editor importe Markdown a propósito | Impórtalo como Markdown si se ofrece; si no, convierte |
| Un wiki que entiende Markdown | Casi todo, si el dialecto coincide | Las extensiones que el wiki nunca implementó | Pégalo y lee el resultado antes de publicar |

### Correo

El correo son dos productos con un solo nombre. Un mensaje en texto plano no tiene analizador en absoluto, así que las almohadillas y los asteriscos se le muestran al lector como caracteres, que es el resultado de pared de puntuación que todo el mundo ha visto. Un mensaje enriquecido o HTML sí tiene analizador, pero es un analizador de HTML, y Markdown no es HTML. Ve un párrafo que empieza con dos almohadillas y renderiza un párrafo que empieza con dos almohadillas.

La vía de selección con el ratón lo hace mejor aquí e introduce su propio problema: el bloque pegado llega con el estilo de la aplicación de chat, así que tu mensaje tiene dos tipografías dentro y la cadena de respuestas debajo tiene una tercera. A largo plazo, la solución no es pegar en absoluto. Manda un enlace o un solo archivo autocontenido por correo, y deja que el documento sea un documento.

### Slack y Teams

Un compositor de mensajes no es un editor de documentos, y no pretende serlo. Hay énfasis en línea y código en línea, y eso es casi todo el vocabulario. No hay encabezado, así que `## Hallazgos` es el texto literal «## Hallazgos». No hay tabla, así que una tabla se convierte en una pila de líneas separadas por barras verticales que se envuelven en el borde de la ventana y pierden su alineación de columnas en la primera pantalla estrecha que encuentran.

Este es el destino donde más a menudo la gente decide que la respuesta está bien porque se veía bien en el compositor, y es el destino donde el cliente del lector tiene más probabilidades de diferir del del remitente. La forma segura para el chat es un resumen corto en el mensaje y un enlace al documento debajo. Dos líneas de prosa ganan a una tabla destrozada, y sobreviven a leerse en un teléfono.

### Word

Word hace dos cosas poco útiles a la vez. Toma el texto Markdown literalmente, y luego lo edita. El autocorrector convierte las comillas rectas en curvas, convierte un doble guion en una raya, pone mayúscula después de lo que interpreta como un punto final, y convierte una línea que empieza con un guion en una lista de Word con la numeración propia de Word. Cada una de esas cosas es razonable por sí sola, y juntas significan que el texto que pegas no es el texto que copiaste.

Para el código esto es fatal en vez de simplemente descuidado: un comando con una comilla curva dentro no se ejecuta, y quien lo intenta recibe un error que no tiene nada que ver con el comando. Si alguien de verdad necesita un archivo Word al final de todo esto, eso es un trabajo de conversión y no de pegado, y las herramientas que lo hacen bien son los conversores de documentos y no el portapapeles.

### Google Docs

Docs se comporta más o menos como Word, con una variable extra: existe una preferencia a nivel de documento que gobierna cómo se trata la sintaxis Markdown, así que el mismo pegado se comporta de forma distinta en dos documentos de la misma persona. Eso es peor que un fallo constante, porque te enseña una regla en un documento que resulta falsa en el siguiente.

Comprueba la preferencia una vez en un documento de prueba, pega una respuesta representativa con una tabla y un bloque de código dentro, y anota qué pasó. Después, confía en ello o ignóralo a propósito. Lo que no deberías hacer es asumir que el comportamiento que viste el mes pasado es el que vas a obtener hoy.

### Notion

Notion es la excepción, y la buena: el Markdown pegado normalmente se lee como Markdown y se convierte en bloques, así que los encabezados se vuelven encabezados y una tabla se vuelve tabla. Si el destino es Notion, el pegado suele ser la respuesta correcta y el resto de este artículo es innecesario.

Aun así hay dos cosas que revisar. Notion trabaja por bloques en lugar de por texto, así que un anidamiento más profundo del que su propia estructura permite se aplana, y la pista de lenguaje de un bloque con cerca puede sobrevivir o no como el lenguaje del bloque. Pégalo, y luego lee los bloques de código y la lista más profunda, que son los dos sitios donde la conversión pierde información.

### Un ticket

Los sistemas de tickets se dividen en dos bandos y la división no se ve desde fuera. Un bando trata el cuadro de comentarios como Markdown, en cuyo caso el pegado sale casi correcto y solo fallan las extensiones que use tu texto. El otro bando tiene su propio lenguaje de marcado anterior al dominio de Markdown, y en ese bando tus asteriscos y almohadillas no significan nada, o peor, significan otra cosa.

Averigua en qué bando está el tuyo una vez, con un comentario de prueba en un ticket que nadie esté mirando. Incluye una tabla, un bloque con cerca y una lista anidada, porque esos tres son los que separan a los bandos. Después sabrás si pegar la respuesta de un modelo en un ticket es un trabajo de dos segundos o una reescritura de diez minutos.

### Un CMS

Un sistema de gestión de contenido es donde un pegado malo hace más daño público, porque el fallo se publica en lugar de enviarse. Los editores de bloques suelen convertir cada línea en un párrafo y dejar la sintaxis visible, que al menos es evidente. El peor caso es un editor que analiza a medias: parte del énfasis en línea se convierte, los encabezados no, y el artículo se publica con tres almohadillas encima de la segunda sección.

La mayoría de los sistemas que publican Markdown tienen una vía de importación separada del pegado, y casi siempre es mejor. Si el tuyo no la tiene, convierte a HTML y pega el HTML en la vista de fuente del editor, donde la estructura es explícita y puedes ver exactamente qué se va a renderizar.

## Qué se rompe, construcción por construcción

El destino decide cómo se ve un fallo. La construcción decide si va a haber uno. Estas son las ocho que se rompen, en el orden aproximado en que aparecen en una respuesta de chat. Cada una tiene su apartado más abajo, salvo las matemáticas, que necesitan uno propio después de las demás por lo complicado que resulta el tema.

| Construcción | Lo que escribió el modelo | Lo que llega | Por qué |
| --- | --- | --- | --- |
| Tabla | Filas separadas por barras verticales | Filas de barras verticales, o una pila de líneas sin alinear | Las tablas son una extensión de GFM, no Markdown básico |
| Código con cerca | Tres acentos graves y una pista de lenguaje | Los acentos como texto, la sangría colapsada, las comillas curvadas | El destino no tiene ningún estilo de bloque de código con el que emparejarlo |
| Lista anidada | Elementos `-` y `1.` con sangría | Una sola lista plana, o marcadores literales | La sangría es significativa en Markdown y decorativa en texto enriquecido |
| Énfasis a mitad de palabra | `mi_variable_asi` | *mi variable* en cursiva a mitad de la palabra | Los analizadores más antiguos abren énfasis con guiones bajos dentro de una palabra |
| Matemáticas | `$x^2$` | Dos signos de dólar y un acento circunflejo | Las matemáticas no están en ninguna especificación de Markdown |
| Marca de nota al pie | `[^1]` y su definición | Corchetes literales, dos veces | Las notas al pie no están ni en CommonMark ni en el núcleo de GFM |
| Marca de cita | `[3]` o `[fuente]` | Corchetes literales sin nada detrás | La definición de referencia nunca se emitió |
| Emoji y comillas tipográficas | Puntos de código, comillas curvas, rayas | Cuadros, o caracteres que rompen comandos | Cobertura tipográfica y autocorrector, nada que tenga que ver con Markdown |

### Tablas

Una tabla Markdown es una fila de encabezado, una fila separadora de guiones y dos puntos, y filas de cuerpo, todo unido con barras verticales. No forma parte de la especificación original ni de CommonMark; llegó con GitHub Flavored Markdown, lo que quiere decir que un analizador puede ser perfectamente correcto y aun así renderizar tu tabla como un párrafo lleno de barras verticales.

El coste es peor que una tabla ausente, porque el resultado no queda en blanco. Es tu dato, sin alinear, en el orden de lectura, con puntuación entre las celdas. Los lectores intentan interpretarlo y se equivocan, y las columnas con celdas vacías desplazan su significado en silencio una posición. Si la respuesta lleva una tabla, ningún pegado la va a conservar en todos los sitios, y en ese punto convertir deja de ser opcional.

### Código con cerca

Un bloque con cerca son tres acentos graves, una pista de lenguaje opcional, el código, y tres acentos graves otra vez. Le pasan tres cosas por separado al salir. Los caracteres de la cerca se vuelven texto visible. La sangría inicial se normaliza según las reglas de párrafo del destino, así que el código en Python deja de ser válido. Y el autocorrector llega hasta las comillas, así que incluso el código que conservó su forma puede ya no ejecutarse.

Lo último es lo que le cuesta a alguien una tarde, porque el código parece correcto. Una comilla curva y una recta son indistinguibles a simple vista en una tipografía proporcional, y el mensaje de error señala un problema de sintaxis en lugar de un problema de carácter. Si vas a mandar código, manda una página o un archivo, nunca un pegado.

### Listas anidadas

Markdown construye el anidamiento a partir de la sangría, y el número de espacios importa. Un destino de texto enriquecido no tiene el concepto de «dos espacios de sangría significa un elemento hijo» — tiene niveles de lista, y los reconstruye a partir de lo que crea que recibió. Un plan de tres niveles a menudo llega como una sola lista plana con la jerarquía desaparecida, que es un cambio de significado y no un cambio de apariencia.

La vía en texto plano falla de forma más visible y menos peligrosa: los marcadores se quedan como `-` y `1.` y el lector puede ver qué se pretendía. El caso a medias vuelve a ser la trampa, y merece la pena leer la lista más profunda de cualquier respuesta antes de mandarla a ningún sitio.

### Énfasis dentro de una palabra

Los modelos escriben `**Nota:**` al principio de una línea constantemente, y ese caso suele estar bien. El fallo es el caso contrario: texto que nunca debía llevar énfasis y termina llevándolo. Los identificadores en snake_case son el ejemplo clásico — `mi_variable_asi` tiene dos guiones bajos alrededor de una palabra, y los analizadores más antiguos ponen en cursiva alegremente la mitad de ella.

CommonMark ajustó esto con reglas de flanqueo, así que un `_` dentro de una palabra ya no abre énfasis en un analizador conforme. No todos los destinos son conformes, y los que analizan un pegado a medias son los menos probables de serlo. El síntoma es un documento técnico donde a algunos identificadores les faltan caracteres en silencio, que es un defecto difícil de detectar y caro de dejar pasar.

### Marcas de nota al pie y de cita

Las notas al pie no están ni en CommonMark ni en el núcleo de GFM, así que `[^1]` es una extensión que un motor de renderizado concreto implementa o imprime tal cual. Cuando la imprime tal cual, te queda la marca en el cuerpo y la definición varada al final, las dos entre corchetes, y el vínculo entre ellas existe solo en la cabeza del lector. [Lo que hace cada implementación con las notas al pie](/blog/markdown-footnotes-support) merece la pena saberlo antes de depender de una.

Las marcas de cita son un problema distinto con la misma pinta. Un modelo al que le pides fuentes suele escribir `[1]`, `[2]`, `[fuente]` en línea sin emitir nunca las definiciones de referencia que esos corchetes necesitan. Eso no es un fallo de conversión — es un documento incompleto, y se renderiza como corchetes literales en cualquier herramienta, incluidas las que implementan bien las notas al pie. Comprueba que cada corchete tiene algo detrás antes de decidir que el fallo es del conversor.

### Emoji

Los emoji llegan como caracteres reales, así que sobreviven intactos al portapapeles. Lo que no sobreviven es la tipografía del destino. Una máquina sin el glifo muestra un cuadro, un cliente de correo antiguo puede mostrar un signo de interrogación, y una tipografía monocroma renderiza una viñeta donde quien escribió quería un estado. Convertir a HTML no arregla esto: un archivo autocontenido puede llevar sus propios estilos, pero no puede llevar la tipografía de emoji del sistema del lector.

Donde el carácter es decoración, esto no cuesta nada. Donde lleva significado — una marca de visto en una fila de una tabla y una cruz en otra — un cuadro en lugar del glifo pierde la única información de esa columna. Sustitúyelos por palabras. «Sí» y «No» se renderizan en cualquier tipografía que haya existido jamás.

### Comillas tipográficas y rayas

Los modelos emiten caracteres tipográficos: comillas curvas, apóstrofos, rayas, puntos suspensivos como un solo carácter. En la prosa son correctos y algo más elegantes que la alternativa. En cualquier cosa que vaya a leer una máquina son un defecto, y las dos cosas se encuentran cuando una respuesta contiene un comando de shell, un fragmento de JSON o una ruta de archivo.

El autocorrector del destino añade una segunda capa del mismo problema, así que un texto que salió recto del modelo puede llegar curvado. La regla que te mantiene a salvo es sencilla: la prosa puede tener caracteres tipográficos, el código no, y la única forma fiable de mantenerlos separados es hacer pasar el código por un conversor que preserve un bloque con cerca como un elemento `<pre>` en lugar de por un campo de texto que cree que está ayudando.

## Las matemáticas son su propio problema

Nada en Markdown define las matemáticas. Ni la sintaxis original, ni CommonMark, ni GFM. Las matemáticas delimitadas por dólares son una convención tomada de TeX que cada motor de renderizado añadió por su cuenta, uno a uno, con reglas ligeramente distintas. Esa es toda la explicación de por qué `$x^2$` parece una ecuación en la ventana de chat y dos signos de dólar con un acento circunflejo en cualquier otro sitio.

La ventana de chat lo renderiza porque hay una biblioteca de matemáticas cargada en la página junto al motor de Markdown. KaTeX, una de las opciones habituales, se describe a sí misma como la biblioteca de composición matemática más rápida para la web, con licencia MIT (comprobado en katex.org, el 9 de septiembre de 2026). GitHub lo renderiza porque GitHub añadió la función a propósito: acepta `$…$` y `$$…$$`, además de un bloque con cerca de tipo `math`, y su documentación dice que el renderizado lo hace MathJax (comprobado en docs.github.com, el 9 de septiembre de 2026).

Un conversor de Markdown a HTML corriente no tiene ninguna razón para saber nada de eso. Su trabajo es convertir Markdown en HTML, y los signos de dólar no son Markdown. Así que hace lo único correcto que tiene disponible y los deja pasar como texto. Esto no es una carencia que se arregle buscando un conversor general mejor; es un trabajo distinto que necesita una herramienta que lo haga.

Hay una segunda trampa dentro de la misma función. En un motor que sí admite matemáticas con dólares, un signo de dólar corriente en la prosa puede abrir una expresión que nunca se cierra, o peor, cerrar una. Un párrafo que menciona `$PATH` y un precio en las mismas líneas puede tragarse en silencio todo lo que hay entre ellos. El mismo archivo, por tanto, se renderiza de forma distinta en la ventana de chat, en GitHub y en tu conversor, y solo una de las tres es lo que querías decir.

| Si necesitas | Haz esto | Lo que cuesta |
| --- | --- | --- |
| Una o dos expresiones sencillas | Pídelas en palabras, o en notación simple como `x^2` | Nada, y se lee bien en cualquier destino |
| Notación real en un documento | Convierte con Pandoc, que tiene `--math-method=mathml` y `--math-method=katex` entre sus opciones (comprobado en pandoc.org, el 9 de septiembre de 2026) | Una instalación y un comando |
| Notación real en un archivo autocontenido | Prerrenderiza las expresiones a HTML con KaTeX en Node, y luego convierte el resultado | Un paso de compilación, sin biblioteca de matemáticas en el lado del lector |
| Matemáticas en una página que no debe pedir nada por red | MathML, o imágenes | El soporte de MathML varía; las imágenes no se ajustan ni escalan con el texto |
| Enviarlo hoy mismo | Pon las expresiones en un bloque con cerca y etiquétalas | Honesto, feo, e inequívoco — nadie lo confunde con un fallo de renderizado |

La respuesta pragmática para la mayoría de los documentos de trabajo es la primera fila. Si las matemáticas son una fórmula que el lector tiene que aplicar en lugar de una derivación que tiene que seguir, la notación simple dentro de un fragmento de código la comunica perfectamente y viaja a cualquier sitio. Guarda la composición tipográfica para los documentos donde la notación es lo importante.

## Léelo antes de que lleve tu nombre

La documentación generada por IA es documentación. Sale bajo tu nombre, y el lector te va a exigir cuentas a ti, no al modelo.

Haz esto antes de convertir, no después. Una página renderizada parece terminada, y lo que parece terminado se lee como si alguien lo hubiera revisado. Leer es la parte que un modelo no puede hacer por ti aquí — [un resumen de IA del documento](/blog/free-ai-document-summarizer) te dice lo que afirma decir, que es una pregunta distinta de si algo de eso es verdad.

- [ ] Cada número: ¿puedes decir de dónde salió?
- [ ] Cada enlace: ábrelo. Las URL plausibles que no llevan a ningún sitio son un fallo habitual.
- [ ] Cada cita, referencia y nombre de producto: confirma que existe y está bien escrito.
- [ ] Cualquier código: ejecútalo, o dilo claramente si no está probado.
- [ ] Los pasajes seguros de sí mismos: el tono es idéntico tanto si el modelo lo sabe como si está adivinando.
- [ ] Cualquier cosa que pegaste en el prompt: comprueba que no se ha repetido dentro de la respuesta.

Esa lista es el resumen. Las cinco comprobaciones de abajo son las que de verdad fallan, en el orden en que fallan, y merece la pena hacerlas una a una en vez de por encima.

| Qué comprobar | Cómo se ve cuando está mal | Qué cuesta saltárselo |
| --- | --- | --- |
| Afirmaciones sin fuente | Seguras de sí mismas, generales, imposibles de atribuir | Alguien planifica basándose en ellas |
| Enlaces | Una URL plausible que no lleva a ningún sitio | Tu credibilidad, en el primer clic |
| Citas atribuidas a personas | Un nombre real junto a palabras que nunca dijo | Una persona con nombre, tergiversada por escrito |
| Números sin origen | Una cifra precisa sin año ni fuente | Una decisión tomada sobre un número inventado |
| Afirmaciones sobre una empresa real | Un precio, una función, un límite, dicho sin rodeos | Una afirmación pública sobre el producto de otro |

### Afirmaciones sin fuente

La regla no es «¿esto suena plausible?» — la salida de un modelo es uniformemente plausible, que es exactamente el problema. La regla es: ¿puedes decir de dónde salió? Si la respuesta es un documento, una página o una persona, déjalo. Si la respuesta es «suena bien», o lo verificas o cortas la frase.

Presta atención al centro seguro de un párrafo más que a sus extremos. Las aperturas y las conclusiones se leen con cuidado porque llevan el argumento. La invención de peso suele estar en una cláusula subordinada a mitad de camino, dicha como contexto, que nadie piensa en cuestionar porque no es el punto de la frase.

### Enlaces que no resuelven

Ábrelos todos. No los pases por encima, ábrelos. Un modelo que ha aprendido cómo se ven las URL de documentación puede producir una cadena con forma de URL para una página que nunca ha existido, y la forma es convincente: el dominio correcto, una ruta plausible, a veces un ancla plausible.

Aquí se esconden dos fallos. El enlace muerto es el obvio y falla ruidosamente, que es el caso bueno. El peor caso es un enlace vivo a la página equivocada — el dominio correcto, un documento real, y no el que respalda la afirmación de al lado. Comprueba que la página a la que llegas dice lo que la frase dice que dice.

### Citas atribuidas a personas

Trata cualquier comilla alrededor de las palabras de una persona con nombre como un defecto hasta que se demuestre lo contrario. Una cita mal atribuida es lo más dañino de esta lista, porque es una afirmación escrita sobre lo que dijo alguien identificable, viaja bien, y esa misma persona la puede desmentir trivialmente.

Encuentra el original. Si no puedes encontrarlo, quita las comillas y el nombre juntos, y escribe la idea con tus propias palabras. Una paráfrasis que puedas defender vale más que una cita que no puedes.

### Números sin origen

Cada cifra necesita tres cosas: un valor, una unidad y una fecha. La salida de un modelo suele dar la primera y omitir las otras dos, y un porcentaje sin un año asociado no es información. Fíjate sobre todo en los números que se sienten demasiado redondos, y en los que se sienten demasiado precisos — los dos son patrones más que medidas.

Donde el número importa y no puedes conseguir la fuente, dilo en el documento. «Más o menos un tercio, de la exportación del segundo trimestre, sin comprobar de forma independiente» es útil para un lector. Un «34 %» seco que nadie puede rastrear es peor que nada, porque se va a citar en adelante sin la advertencia que nunca escribiste.

### Cualquier cosa sobre una empresa real

Precios, límites de plan, disponibilidad de una función, condiciones de licencia, si un producto todavía existe — todo esto cambia, todo se afirma con seguridad, y todo son afirmaciones sobre el negocio de otra persona que salen con tu nombre puesto. Un precio equivocado en un documento que circula internamente se convierte en un precio equivocado en un presupuesto.

La comprobación es abrir la propia página del proveedor y leerla. No un sitio comparativo, ni un resumen, ni lo que recuerdas del año pasado — la página que publica la empresa. Si conservas la afirmación, conserva la fecha al lado, para que el siguiente lector sepa cuán antigua es.

### El relleno, y la forma por defecto de los modelos

Corta también el relleno. Los modelos rellenan: una apertura que repite la pregunta, un párrafo de cierre que resume lo que el lector acaba de leer. Borra ambos.

El mismo instinto se aplica a la estructura. Una respuesta de tres puntos no necesita tres encabezados, una lista con viñetas y una tabla resumen diciendo lo mismo tres veces de tres formas distintas. Esa capa de más es lo que hace que un contenido corto parezca sustancial, y quitarla suele ser la diferencia entre una página que se lee como algo pensado y una que se lee como algo generado.

## Guárdalo, convíértelo, manda la página

La vía que aguanta es aburrida y lleva un minuto.

**Guarda la respuesta como archivo.** Pulsa copiar, pega en cualquier editor de texto, guarda como `entrega.md`. Un archivo `.md` es texto plano: nada que instalar, nada que pueda fallar. Lo que no puedes hacer es mandarlo — en la máquina de un compañero se abre con el programa que reclame la extensión, o en nada en absoluto.

**Convierte a HTML.** [La conversión de Markdown a HTML](/) lo hace en el navegador: sueltas el archivo dentro y el trabajo pasa en tu propia máquina. Sin haber iniciado sesión, el archivo nunca sale de ella, lo que importa cuando la respuesta contiene algo interno. Obtienes una vista previa, la fuente HTML exacta, y una descarga — un solo archivo `.html` autocontenido con estilos en línea, sin scripts y sin peticiones de red. Varias respuestas, varios archivos: sueltas todos a la vez y se encadenan en un solo documento, en orden, separados por una línea. Una respuesta de chat son unos pocos kilobytes de texto, así que nada de esto se acerca al límite de 10 MB de conversión; ese tope existe para documentos escaneados, no para prosa.

**Manda la página, no el archivo.** El `.html` se abre con doble clic en cualquier máquina. Si un adjunto sigue siendo la forma equivocada, inicia sesión y publica un enlace de solo lectura en su lugar: legible por cualquiera con la dirección, o solo por las direcciones que nombres. Revócalo y un enlace ya enviado deja de funcionar. [Las cuatro formas de enviar un documento](/blog/share-a-markdown-document-as-a-link) cubre cuál conviene a cada lector.

```bash
# con una clave ya recordada por `tp login`, publicar es una sola línea
node cli/tp.mjs push entrega.md --share link
```

Los tres pasos suman un minuto entre ellos, y ese minuto compra algo concreto: un solo artefacto con una sola dirección, en vez de un pegado por destinatario y ninguna forma de corregir ninguno de ellos. Cuando encuentras un error en una página, arreglas la página. Cuando encuentras un error en seis pegados, mandas seis disculpas.

### La pregunta de privacidad que nadie hace

Hay un paso en medio de todo esto que la gente da sin pensarlo, y merece una frase de reflexión. Pegar un borrador en un conversor online es una subida. La mayoría de los conversores funcionan en un servidor, lo que significa que el texto sale de tu máquina, cruza la red, y se analiza en hardware que no controlas, en una empresa cuya política de retención no has leído.

El contenido lo empeora en vez de mejorarlo. El documento que estás convirtiendo es una respuesta de chat, y una respuesta de chat contiene lo que sea que pusiste en el prompt: el nombre del cliente, la fecha aún sin publicar, la banda salarial, el párrafo que pegaste de un documento interno para que te lo resumieran. Eso es precisamente la clase de texto que no debería entregarse a un proveedor más como subproducto de darle formato.

El contraargumento es que el asistente ya tiene el texto, así que qué importa una copia más. Importa porque es otra empresa, otro periodo de retención, otra jurisdicción y otra superficie de filtración, y porque tu organización aprobó la primera y no sabe nada de la segunda. Un proveedor es una decisión. Dos es un accidente.

La comprobación lleva diez segundos y no es cuestión de confianza. Abre el panel de red del navegador, convierte un archivo, y observa. Un conversor que corre en el navegador no hace ninguna petición cuando sueltas el archivo — puedes ver la ausencia. Un conversor que sube el archivo te muestra la petición, con el archivo dentro. Eso es un hecho sobre la herramienta y no una afirmación de su marketing, y [la pregunta más amplia de qué hace un conversor online con tu archivo](/blog/is-an-online-converter-safe) merece leerse una vez y saberse para siempre.

La conversión del lado del navegador es la razón por la que TransformPipe puede decir que no se sube nada cuando no has iniciado sesión: no hay ninguna subida que describir. Iniciar sesión cambia eso a propósito, porque guardar un documento y publicar un enlace requieren los dos un servidor que lo mantenga — lo cual es un cambio que haces con conocimiento, documento por documento, y no por defecto.

### Saltarse el pegado por completo

El portapapeles es el eslabón débil de todo esto, y se puede quitar. Un asistente con [un conector](/agents) a un servicio de conversión hace la secuencia entera dentro de la propia conversación: toma el texto que acaba de escribir, lo convierte, y te devuelve un archivo o un enlace sin que nada de eso pase por un campo de texto. Nada tiene ocasión de autocorregirse, porque nada se pegó nunca.

El mecanismo es un servidor MCP, o una llamada de API, o una invocación de CLI desde lo que sea que el asistente pueda ejecutar — la misma conversión en cada caso, alcanzada desde una dirección distinta. [Convertir documentos desde dentro de un asistente](/blog/converting-documents-from-an-assistant) cubre qué puede y qué no puede hacer cada vía. Es la respuesta correcta cuando esto pasa lo bastante seguido como para ser un hábito y no un recado, y no cambia el paso de revisión de arriba, que sigue siendo tuyo.

## Dónde falla una página que parece terminada, y qué cuesta

Aquí está la parte incómoda, y es la razón por la que la sección de revisión va antes de la de conversión y no después.

El formato es una señal de credibilidad, y es una que los lectores aplican sin darse cuenta. Un muro de texto sin formato se lee con escepticismo; el lector asume que es un borrador y trata las afirmaciones como provisionales. El mismo contenido con encabezados, una tabla y un espaciado consistente se lee como un documento — algo que pasó por un proceso, que alguien revisó, que tiene cierto cuidado detrás. Nada de eso es verdad de una respuesta de chat convertida, y la conversión es justo lo que da esa impresión.

Así que la salida de un modelo es más peligrosa cuando está bien formateada. No cuando es incorrecta — es incorrecta al mismo ritmo en cualquier caso — sino cuando la presentación toma prestada una autoridad que el contenido no se ha ganado. La cita inventada que se habría cuestionado en un pegado desordenado se reenvía dos veces en una página con buen estilo. Este es un coste real de la vía que recomienda este artículo, y lo único que lo compensa es la lista de comprobación de arriba, hecha bien, cada vez.

Dos hábitos ayudan. Dilo claramente: una línea al principio que diga «redactado con un asistente, cifras comprobadas contra la exportación del segundo trimestre, enlaces verificados» no cuesta nada y viaja con el archivo. Y guarda el `.md` de origen junto a la página, para que la siguiente persona pueda ver qué cambió entre la respuesta del modelo y lo que enviaste.

Convertir tampoco vale siempre la pena. A veces otra herramienta gana claramente.

Si el destinatario tiene que editar el texto, manda algo editable: pégalo en un documento, acepta que el bloque de código va a sufrir, y déjalo trabajar. Si de verdad necesitas un `.docx`, Pandoc convierte entre formatos que un conversor de navegador no toca, y [es la herramienta mejor para ese trabajo](/blog/pandoc-alternatives-for-markdown-to-html).

Si la respuesta son tres frases, escríbelas directamente en el mensaje. Un paso de conversión para un párrafo es ceremonia.

Si el contenido pertenece al wiki del equipo, ponlo ahí. Notion, Confluence y la mayoría de los sistemas de tickets aceptan Markdown al importar o al pegar, cada uno con sus propias rarezas. Una página compartida es para documentos sin hogar, no para contenido que ya tiene uno.

Y si la respuesta va a estar equivocada dentro de dos semanas — un estado, un conjunto de números que se mueven cada semana — una página es el envase equivocado sin importar lo bien que convierta. Los documentos sobreviven a su propia exactitud, y una página bien hecha la sobrevive más tiempo aún, porque sigue pareciendo autorizada después de haber dejado de ser verdad.

## Cómo elegir qué mandar

1. **Empieza por lo que el lector va a hacer con ello.** Leer pide una página, editar pide un archivo editable, y aprobar pide que los números tengan fuente antes de que pase nada más. Elegir el formato antes de saber el verbo es cómo un documento termina con la forma equivocada para todos.
2. **Cuenta las construcciones antes de contar las palabras.** Una tabla, un bloque con cerca o una expresión entre signos de dólar basta para garantizar que algún destino la va a destrozar, y en ese punto convertir deja de ser una preferencia y se convierte en la única vía que aguanta.
3. **Decide si el texto puede salir de tu máquina.** Si no puede, el conversor tiene que correr en el navegador o en hardware que controlas, y el camino más corto — pegarlo en la primera herramienta que devuelva una búsqueda — se vuelve el que no puedes tomar.
4. **Presupuesta la revisión antes de la conversión.** Convertir lleva un minuto; buscar la fuente de cinco números y abrir nueve enlaces lleva veinte. Reservar solo el minuto es cómo una salida sin revisar acaba con una hoja de estilos y empieza a parecer trabajo que hizo alguien.
5. **Produce un solo artefacto en lugar de un pegado por persona.** La lista de destinatarios crece después de que la mandas — alguien la reenvía, alguien la pide una semana después — y una página se puede entregar sin cambios. Los pegados no: cada uno es una copia aparte que envejece por su cuenta.
6. **Prueba cada destino una vez, y deja de adivinar.** Pega una respuesta representativa —tabla, cerca de código, lista anidada— en la herramienta que más uses, guarda el resultado, y confía en él. El comportamiento es estable por destino aunque varíe muchísimo entre ellos.

## Conclusión

La respuesta en la ventana de chat es un renderizado, y lo que copias es la fuente que lo produjo. Cada destino donde pegas vuelve a decidir qué significa esa fuente, que es por lo que el mismo texto sale limpio en una ventana y lleno de barras verticales y asteriscos en la siguiente, y por lo que discutir con el asistente sobre el formato nunca lo arregla. La próxima vez que una respuesta merezca guardarse, guárdala como `.md` antes de hacer nada más. Léela contra la lista de comprobación, arregla lo que el modelo adivinó mal, corta el relleno, y luego conviértela una vez y manda la página — un archivo, una dirección, y el mismo documento para todos los que lo abran.

## Preguntas frecuentes

### ¿Por qué la respuesta de ChatGPT muestra asteriscos y almohadillas cuando la pego?

Porque el asistente escribió en Markdown y la ventana de chat lo renderizó para mostrarlo. El botón de copiar te da la fuente subyacente, y un destino sin analizador de Markdown muestra esos caracteres exactamente como son. Nada está roto; estás viendo el texto que produjo el formato que veías antes.

### ¿Cómo pego una respuesta de IA en Word sin perder la tabla?

Selecciona la respuesta renderizada con el ratón en vez de usar el botón de copiar, y el navegador pone en el portapapeles una versión en texto enriquecido que Word suele aceptar, tablas incluidas. Revisa después los bloques de código y las comillas, porque el autocorrector de Word edita lo que pegas. Para cualquier cosa que necesite ser exacta, convierte el archivo en lugar de pegarlo.

### ¿Cuál es la mejor forma de enviarle a alguien un documento generado por IA?

Guárdalo como archivo `.md`, revísalo, y convíértelo a un solo archivo HTML autocontenido o a un enlace de solo lectura. Los dos se abren con doble clic o con un clic, en cualquier máquina, sin instalar nada y sin que el lector necesite saber Markdown. El pegado solo es fiable cuando el destino es una herramienta nativa de Markdown como Notion o un cuadro de comentarios que lo entienda.

### ¿Por qué los signos de dólar de mis ecuaciones no se convierten en matemáticas?

Porque las matemáticas delimitadas por dólares no forman parte de ninguna especificación de Markdown. Es una convención que algunos motores de renderizado añadieron por su cuenta, así que la ventana de chat y GitHub la muestran mientras que un conversor general deja pasar los caracteres tal cual. Usa un conversor con modo matemático, prerrenderiza las expresiones, o escribe fórmulas sencillas en notación simple.

### ¿Es seguro pegar un borrador de IA en un conversor online?

Solo si sabes dónde pasa la conversión. Un conversor que funciona en un servidor está recibiendo la subida de un documento que probablemente contiene lo que sea que pusiste en el prompt, que a menudo es el texto más sensible que manejas en toda la semana. Abre el panel de red y observa: un conversor que corre en el navegador no hace ninguna petición en absoluto.

### ¿Debería decirle a la gente que un documento lo redactó un modelo?

Sí, en una línea, junto con lo que comprobaste. No cuesta nada, ajusta el escepticismo del lector al nivel correcto, y te protege cuando una cifra que verificaste resulta haber estado mal desde la fuente. Una salida de modelo sin advertir que después falla es una conversación mucho peor que una salida advertida que después falla.

### ¿Puedo sacar la respuesta sin pegarla en absoluto?

Sí, si el asistente puede llegar directamente a un servicio de conversión a través de un conector, una API o un comando que tenga permiso de ejecutar. El texto va del modelo al conversor sin tocar el portapapeles, lo que elimina por completo el autocorrector y los pegados a medio analizar del proceso. El paso de revisión se queda exactamente donde estaba.
