---
title: "Conversor gratis de Obsidian a Markdown: todas las opciones comparadas"
description: "Una bóveda de Obsidian ya es Markdown, así que no hay nada que comprar: comparamos las herramientas gratuitas que arreglan wikilinks, embeds, referencias y callouts"
date: 2026-09-14
tag: Conversión
keywords: conversor gratis de obsidian a markdown, exportar bóveda de obsidian gratis, obsidian a markdown gratis, convertir obsidian a markdown, conversor obsidian markdown online, plugin gratis para exportar obsidian
---

Quien busca un conversor gratuito de Obsidian a Markdown suele haber dado ya con la parte incómoda: no hay nada que comprar, porque no hay nada que convertir. Una bóveda de Obsidian es una carpeta de archivos `.md` en el disco. Puedes abrir uno en el Bloc de notas, o subir la carpeta entera a un repositorio, sin tocar ningún conversor. El formato ya es el formato de destino.

Y aun así la búsqueda se hace constantemente, porque los archivos dejan de funcionar en cuanto salen de allí. Una nota que se lee perfectamente dentro de Obsidian aterriza en otro sitio llevando `[[Project Brief]]` entre dobles corchetes, un marcador `> [!warning]` impreso como texto literal encima de una cita en bloque, y un `![[diagram.png]]` que no muestra nada. Lo que la gente está buscando no es un cambio de formato. Es una reparación de cuatro construcciones que se inventó Obsidian, y cada herramienta que merece comparar es una respuesta distinta a cómo se reparan esas cuatro.

Eso reformula la cuestión del precio de forma útil. Cuando el formato base es gratuito y los archivos de origen ya son tuyos, «gratis» deja de ser un descuento y pasa a ser lo normal. Lo que cuestan de verdad las opciones es configuración, control y cuánta estructura de la bóveda estás dispuesto a perder en el trato.

### Resumen rápido

Todas las opciones serias de aquí son gratuitas, así que elige por forma y no por precio. **El conversor de navegador en [/obsidian-to-markdown](/obsidian-to-markdown)** toma una bóveda comprimida y devuelve un solo documento con índice, los wikilinks reducidos a las palabras que mostraban y el frontmatter quitado — sin instalar nada, sin subir nada cuando no has iniciado sesión, y es la respuesta correcta cuando el destino es un único documento legible. **[obsidian-export](https://github.com/zoni/obsidian-export)** es una herramienta de línea de comandos gratuita escrita en Rust (BSD-2-Clause-Patent, consultado en github.com/zoni/obsidian-export, 14 de septiembre de 2026) que recorre una bóveda y escribe archivos CommonMark al otro lado con los enlaces y los embeds resueltos — lo que quieres cuando la bóveda tiene que seguir siendo una carpeta de archivos separados. **El ajuste «Use \[\[Wikilinks\]\]» del propio Obsidian** no cuesta nada y no arregla nada retroactivamente. **Un plugin de exportación de la comunidad** exporta una nota o una carpeta con sus imágenes empaquetadas, desde dentro del propio Obsidian. **Pandoc** es gratuito y GPL, y lee wikilinks solo detrás de una extensión que no está activada por defecto — sin índice de la bóveda, no puede resolver `[[Note]]` a una ruta como hace Obsidian. **Un script que escribes tú** es la única vía que te deja decidir qué pasa con un nombre de archivo duplicado. Para el detalle de sintaxis que hay detrás de todo esto, [la guía completa recorre el dialecto nota a nota](/blog/convert-obsidian-vault-to-markdown).

## Por qué una carpeta de archivos Markdown sigue necesitando un conversor

La razón de que este trabajo exista es que el dialecto de Obsidian es un superconjunto, y los añadidos no están marcados como añadidos en ninguna parte del archivo. No hay ninguna bandera, ni espacio de nombres, ni región delimitada que diga «esta parte es nuestra». Un wikilink tiene exactamente la pinta de texto corriente con corchetes dentro, que es precisamente por lo que un analizador estándar lo trata como texto corriente con corchetes dentro.

Cuatro construcciones se llevan casi todo el daño, y son la base entera sobre la que difieren las herramientas de abajo:

**Los wikilinks** —`[[Note]]`, `[[Note|Texto mostrado]]`, `[[Note#Encabezado]]`— se resuelven dentro de Obsidian contra un índice de la bóveda entera, encontrando un archivo por su nombre esté donde esté y también contra su frontmatter `aliases`. Fuera de la bóveda ese índice ya no existe, así que no queda nada contra lo que resolver.

**Los embeds.** `![[Note]]` incrusta otra nota en el momento de mostrarla; `![[imagen.png]]` muestra un adjunto. El Markdown estándar tiene una sintaxis de imagen y ninguna sintaxis de transclusión, así que un embed de una nota no tiene equivalente al que convertirse — solo una elección entre incrustar una copia y bajar a un enlace llano.

**Las referencias de bloque.** `[[Note#^block-id]]` apunta a un párrafo mediante un id añadido al final de la línea de ese párrafo. Cuando el id desaparece, la referencia no se rompe; deja de referirse a nada.

**Los callouts.** `> [!note]`, `> [!warning]` y compañía son citas en bloque con un marcador tipado en la primera línea. En cualquier otro sitio, el marcador es texto.

Hay un quinto elemento que no es una construcción sino un error de categoría que conviene nombrar pronto: cualquier cosa que un plugin representara en vez de escribir. Una consulta de Dataview se guarda como un bloque de código delimitado que contiene la pregunta, y la tabla que producía se generaba al abrir la nota, cada vez. Ningún conversor, gratuito o no, la recupera, porque no hay nada que recuperar. El frontmatter y los `%%comentarios en línea%%` completan la lista, los dos baratos de tratar si la herramienta se molesta — [lo que hacen los conversores con el front matter](/blog/front-matter-and-what-converters-do-with-it) en general se aplica aquí sin modificación.

## Qué cuesta lo gratuito en cada dirección

Como la columna de precio de abajo pone «gratis» en todas las filas, merece la pena ser explícito sobre lo que sí varía.

**El coste de configuración.** Una página de navegador es cero. Un binario de Rust es una descarga o un `cargo install`. Un plugin de la comunidad es un plugin que ahora mantienes. Un script es una tarde y luego para siempre.

**El control sobre la ambigüedad.** Dos notas llamadas `Meeting Notes.md` en carpetas distintas son ambiguas para un `[[Meeting Notes]]` pelado incluso dentro de Obsidian, que resuelve según su propia regla interna. Toda herramienta automática hereda esa ambigüedad en vez de resolverla; solo el código que escribes tú te deja decidir cuál gana.

**La forma de la salida.** La verdadera bifurcación del camino, y no una diferencia de calidad: unas herramientas producen una carpeta de archivos con enlaces relativos que funcionan entre ellos, otras producen un solo documento, lo que elimina la necesidad de un destino de enlace.

**Adónde va la bóveda.** Una bóveda suele ser lo más personal que tiene una persona en texto, así que un conversor que funciona en local y uno que sube archivos tienen el mismo precio y no son la misma transacción — la versión general de esa pregunta es si [un conversor online es seguro](/blog/is-an-online-converter-safe).

## Comparativa rápida: la chuleta

| Herramienta | Mejor para | Capacidad principal | Precio |
| --- | --- | --- | --- |
| TransformPipe | Una bóveda, o parte de ella, que debería convertirse en un documento legible | Bóveda comprimida dentro, un documento con índice fuera, con los wikilinks y el frontmatter tratados en la misma pasada | Gratis |
| obsidian-export | Una bóveda que tiene que seguir siendo una carpeta de archivos separados | Exportación recursiva de bóveda a CommonMark, resolviendo los enlaces `[[note]]` y los embeds `![[note]]` | Gratis, BSD-2-Clause-Patent |
| El ajuste «Use \[\[Wikilinks\]\]» de Obsidian | Que el atraso deje de crecer | Escribe enlaces estándar `[texto](ruta)` para todo lo creado después del cambio | Gratis, integrado |
| Un plugin de exportación de la comunidad | Exportar una nota o una carpeta desde dentro de Obsidian | Empaqueta los adjuntos de imagen enlazados junto al Markdown exportado | Gratis |
| Pandoc | Una bóveda que es una entrada más en una compilación documental que ya ejecutas | Soporte de wikilinks detrás de una extensión no predeterminada, hacia cualquier formato que escriba Pandoc | Gratis, GPL |
| Un script que escribes tú | Nombres duplicados, alias y reglas que solo conoces tú | Control exacto sobre cada caso ambiguo, y nada más de lo que fiarse | Gratis, cuesta tiempo |

## Las opciones, una a una

### TransformPipe — mejor cuando la bóveda debería convertirse en un documento

Comprime la carpeta de la bóveda, suelta el archivador en [/obsidian-to-markdown](/obsidian-to-markdown) y cada nota vuelve como una sección de un único documento Markdown, en orden de ruta, bajo un índice generado. No hay nada que instalar, no hace falta cuenta y, sin sesión iniciada, el archivador lo lee la página desde tu propio disco en lugar de enviarlo a ninguna parte.

La decisión de diseño que hay debajo hace que el problema de los wikilinks desaparezca en lugar de resolverlo: cuando cada nota es una sección del mismo documento, no hay un archivo aparte al que pueda apuntar un enlace. Así que `[[Project Brief]]` se convierte en las palabras *Project Brief*, `[[Project Brief|el informe]]` se convierte en *el informe* y `[[Project Brief#Alcance]]` se convierte en *Project Brief* — en cada caso, el texto que el lector estaba viendo de todos modos. Una pérdida si querías enlaces navegables; exactamente lo correcto si querías algo que alguien pueda leer de principio a fin.

| A favor | En contra |
| --- | --- |
| Sin instalación, sin binario, sin plugin — un zip y una pestaña del navegador | Un documento, no una carpeta de archivos: la forma equivocada si las notas tienen que seguir siendo direccionables por separado |
| Los wikilinks, las etiquetas con `\|` al estilo alias y las anclas `#encabezado` se reducen todos a sus palabras mostradas en una sola pasada | Los enlaces pasan a ser texto llano en vez de enlaces que funcionan, porque no queda ningún destino externo |
| El frontmatter se quita en lugar de representarse como una línea horizontal suelta y un bloque de ruido clave-valor, y un embed de imagen pasa a ser la imagen misma | El techo son dos megabytes de imágenes por documento, y un adjunto que no sea imagen sigue quedando como texto en cursiva |
| Un índice generado, así que una bóveda de cien notas se puede recorrer desde arriba | Las tablas de Dataview y otras vistas representadas por plugins no están, igual que por cualquier otra vía |
| Funciona en el navegador; la bóveda no se sube cuando no has iniciado sesión | Una bóveda muy grande está limitada por la máquina que hace el trabajo |

**Precio:** gratis. Una cuenta añade historial y compartir, también gratis.

**Detalles técnicos y funciones**

- Del archivador se leen solo las entradas `.md`, ordenadas por su ruta completa dentro del zip, que es lo que fija el orden de las secciones en la salida — renombra una carpeta y el orden cambia con ella
- El título de una nota sale de su nombre de archivo y no de nada escrito dentro, igual que Obsidian identifica las notas; si la primera línea de esa nota repite el título como H1, el duplicado se descarta en vez de imprimirse dos veces
- La reescritura de wikilinks cubre `[[Target]]`, `[[Target|Mostrado]]`, `[[Target#Encabezado]]` y `[[Target#Encabezado|Mostrado]]`, además de la forma de embed `![[...]]` de cada uno
- Un embed cuyo destino es una imagen presente en el zip pasa a ser esa imagen, llevada dentro del documento; uno cuyo destino es cualquier otro archivo de documento o medio reconocido pasa a ser texto en cursiva nombrándolo, en vez de una referencia rota apuntando a un archivo que no está
- El bloque de frontmatter YAML de la parte superior de una nota se elimina antes de que se ejecute nada más
- Las secciones se unen con una línea horizontal entre ellas, la misma convención que usa la aplicación para [fusionar varios archivos Markdown en uno](/blog/merging-many-markdown-files)

**¿Para quién es?** Para quien entrega una bóveda, o las notas de un proyecto sacadas de una, a alguien que no usa Obsidian — un cliente, un archivo, un traspaso, un documento que hay que leer y no navegar. No es la herramienta para una bóveda que tiene que seguir funcionando como un grafo enlazado al otro lado.

### obsidian-export — mejor cuando la bóveda sigue siendo una carpeta de archivos

obsidian-export es un programa de línea de comandos y una biblioteca de Rust que recorre una bóveda y escribe CommonMark llano al otro lado, un archivo dentro por un archivo fuera. Es lo más parecido a un conversor gratuito hecho a propósito para este trabajo que no sea un plugin, y su propia documentación tiene el cuidado de decir que no cuenta con el respaldo oficial de Obsidian y que soporta la mayor parte del dialecto, pero no todo.

| A favor | En contra |
| --- | --- |
| Conserva la forma de las carpetas: archivos separados con los enlaces entre ellos resueltos, no aplanados | Una herramienta de línea de comandos, así que una terminal es requisito previo |
| Maneja tanto las referencias `[[note]]` como las inclusiones de archivo `![[note]]`, no solo los enlaces llanos | Sin respaldo de Obsidian, y su propio README dice que la cobertura del dialecto es parcial |
| Los patrones de exclusión usan sintaxis de gitignore, y los archivos que git ya ignora se saltan por defecto | Asume UTF-8 para el texto de las notas y los nombres de archivo, con conversión con pérdida en caso contrario |
| El comportamiento del frontmatter es una opción y no una decisión fija | Otro binario que instalar y mantener al día |
| Programable, así que la exportación es repetible en vez de algo que alguien recuerda hacer | Una exportación parcial tiene reglas que conviene leer antes |

**Precio:** gratis, BSD-2-Clause-Patent según el propio `Cargo.toml` del proyecto (consultado en github.com/zoni/obsidian-export, 14 de septiembre de 2026).

**Detalles técnicos y funciones**

- `obsidian-export /ruta/a/la/boveda /ruta/de/salida` es toda la invocación básica; el directorio de destino tiene que existir ya
- `--start-at` exporta un subconjunto de la bóveda tratando aun así la bóveda entera como contexto de resolución, de modo que los enlaces que salen del subconjunto exportado siguen intactos. Nombrar un único archivo como origen, en cambio, deliberadamente no resuelve nada — la documentación dice que es así por diseño
- `--frontmatter=never` quita el frontmatter por completo, `--frontmatter=always` inserta un bloque vacío para los generadores de sitios estáticos que exigen uno, y lo predeterminado lo copia tal cual
- Los archivos ocultos, las rutas que encajan con un archivo `.export-ignore` y todo lo que git ya ignora quedan excluidos por defecto, cada cosa ajustable con su propia opción
- `--skip-tags` y `--only-tags` filtran las notas por las etiquetas del frontmatter, que es una forma genuinamente útil de exportar la mitad pública de una bóveda
- Una nota que enlaza a una nota excluida se queda sin enlace en vez de apuntando a la nada — el texto del enlace sobrevive, el enlace no
- Que dos notas se incrusten mutuamente es un error por defecto, y `--no-recursive-embeds` rompe el ciclo insertando un enlace en el segundo encuentro

**¿Para quién es?** Para quien exporte una bóveda a un sitio estático, a un repositorio de documentación o a cualquier sitio donde las notas necesiten conservar su identidad individual y sus enlaces entre ellas. Esta es la herramienta gratuita que más directamente encaja con el modelo mental de «exportar mi bóveda» tal y como lo entiende la mayoría.

### El ajuste «Use \[\[Wikilinks\]\]» del propio Obsidian — gratis, integrado y solo medio arreglo

El ajuste vive en los ajustes, bajo Files and links: desactiva «Use \[\[Wikilinks\]\]» y Obsidian escribirá enlaces Markdown estándar `[texto](ruta)` para todo lo que crees a partir de ese momento (consultado en obsidian.md y en la propia documentación de ajustes de Obsidian, 14 de septiembre de 2026). El autocompletado no cambia — escribes `[[`, eliges la nota — solo cambia la sintaxis que se escribe en el disco.

| A favor | En contra |
| --- | --- |
| No cuesta nada y no añade ninguna herramienta, plugin ni dependencia | Puramente hacia adelante: todos los enlaces escritos antes del cambio se quedan igual |
| La experiencia de escritura no cambia nada — el mismo autocompletado, el mismo flujo | Solo afecta a los enlaces llanos; los embeds, las referencias de bloque y los callouts se quedan igual |
| Hace la bóveda progresivamente más portable sin ningún evento de migración | No es una conversión en ningún sentido — una bóveda ya establecida sigue necesitando una pasada de reescritura |

**Precio:** gratis, forma parte de la aplicación. Obsidian en sí es gratuito para uso personal, con una licencia comercial de 50 $ por usuario y año para uso profesional dentro de una organización, y complementos opcionales de Sync y Publish con precio aparte (consultado en obsidian.md, 14 de septiembre de 2026).

**¿Para quién es?** Para todo el mundo, sea cual sea la otra opción que elijas para el atraso. Es lo único de esta página que está libre de contrapartidas, porque no intenta la parte difícil.

### Un plugin de exportación de la comunidad — mejor para una nota o una carpeta, desde dentro de Obsidian

El directorio de plugins de la comunidad de Obsidian tiene plugins de exportación, y [obsidian-markdown-export-plugin](https://github.com/bingryan/obsidian-markdown-export-plugin) es un ejemplo real y con actividad reciente: exporta una sola nota o una carpeta entera como un paquete con sus imágenes enlazadas empaquetadas junto al Markdown, desde un comando dentro de Obsidian y no desde una herramienta aparte.

| A favor | En contra |
| --- | --- |
| Funciona desde dentro de la aplicación, sobre la nota que estás mirando | El repositorio no lleva archivo de licencia, cosa que importa si piensas bifurcarlo o incorporar su código (consultado en github.com/bingryan/obsidian-markdown-export-plugin, 14 de septiembre de 2026) |
| Deja las imágenes como archivos junto al Markdown exportado, mientras que la vía de fusionar en un documento las pone dentro del documento | Un plugin de la comunidad es una dependencia con su propio ritmo de publicación y sus propias decisiones |
| Tiene una opción de salida en GitHub Flavored Markdown, que es el sabor en el que coinciden la mayoría de los destinos | Cómo trata las referencias de bloque, los callouts y el contenido representado por plugins es decisión del plugin, no tuya |
| Exporta carpetas además de archivos sueltos, y también puede sacar HTML | La exportación basada en plugin escala mal a una bóveda entera comparada con una herramienta de línea de comandos que puedes programar |

**Precio:** gratis, se instala desde el explorador de plugins de la comunidad de Obsidian.

**Detalles técnicos y funciones**

- Las capacidades documentadas son la exportación de carpetas y de archivos sueltos, la inclusión de adjuntos de imagen, una opción de salida en GitHub Flavored Markdown, el tratamiento del contenido incrustado y la salida como `md` o como `html` (consultado en github.com/bingryan/obsidian-markdown-export-plugin, 14 de septiembre de 2026)
- La instalación es la vía habitual de los plugins de la comunidad: ajustes, plugins de la comunidad, explorar, buscar «markdown export»
- Como se ejecuta dentro de Obsidian, tiene acceso al mismo índice de la bóveda que usa el propio Obsidian al resolver un enlace — la ventaja estructural que tienen los plugins sobre cualquier herramienta externa de esta lista

La precaución habitual sobre los plugins de la comunidad se aplica sin ponerse dramático: antes de depender de uno para algo que no puedes rehacer a mano, mira su ficha actual para ver el estado de mantenimiento y lee qué hace con las construcciones que de verdad tienes. Un plugin que se come los callouts en silencio no es problema si no tienes callouts.

**¿Para quién es?** Para quien exporte un puñado de notas cada vez, con imágenes, y prefiera quedarse dentro de Obsidian a aprender una herramienta de terminal. Los adjuntos son la función que decide — esta es la única opción de la página que se los lleva junto con el texto.

### Pandoc — mejor cuando la bóveda es una entrada más entre varias

Pandoc es el conversor de documentos general, gratuito y con licencia GPL (consultado en pandoc.org, 14 de septiembre de 2026), y se gana una fila aquí para quien ya lo tiene dentro de una compilación. Sí sabe de wikilinks, pero en unos términos que conviene entender antes de recurrir a él.

| A favor | En contra |
| --- | --- |
| Ya está instalado en muchísimas máquinas de compilación de documentación | Sin índice de la bóveda: no puede resolver `[[Note]]` a `carpeta/Note.md` como hace Obsidian |
| El análisis de wikilinks está disponible mediante una extensión documentada | Las extensiones no están activas por defecto, así que un `-f markdown` a secas deja los wikilinks como texto literal |
| Escribe a todos los formatos de salida que soporta Pandoc desde la misma entrada | No sabe nada de callouts, referencias de bloque ni Dataview — pasan tal como son textualmente |
| Se combina con filtros, así que una reescritura propia puede ejecutarse dentro de la conversión | Por naturaleza trabaja archivo a archivo; una bóveda es un bucle que escribes tú alrededor |

**Precio:** gratis, con licencia GPL.

**Detalles técnicos y funciones**

- `--from=markdown+wikilinks_title_after_pipe` activa el análisis de `[[Wiki]]` y `[[URL|título]]`; `wikilinks_title_before_pipe` es la imagen especular, `[[título|URL]]` (consultado en el manual de Pandoc en pandoc.org, 14 de septiembre de 2026)
- Las dos aparecen en la sección de extensiones no predeterminadas del manual, así que ninguna está activa salvo que la nombres. Obsidian pone el destino delante y el texto mostrado después de la barra, lo que convierte a `wikilinks_title_after_pipe` en la que encaja con una bóveda
- Lo que te da la extensión es un enlace cuyo destino es el texto literal que hay dentro de los corchetes — útil, y no lo mismo que una ruta relativa resuelta hacia un archivo de otro punto de la bóveda
- Un filtro de Lua es la forma honesta de cerrar ese hueco: analizas el destino del enlace, lo buscas en un índice que has construido tú a partir de la bóveda y reescribes el destino

**¿Para quién es?** Para quien tenga sus notas como una entrada más en una compilación que ya ejecuta Pandoc por otros motivos. Como conversor autónomo de Obsidian es la opción más floja de aquí, porque la parte difícil —la resolución a escala de bóveda— es justo la que no hace.

### Un script que escribes tú — mejor para los casos que nadie más puede decidir

La última opción gratuita es la que no tiene herramienta dentro. Recorre la bóveda, construye un índice de cada nombre de archivo y cada alias, encuentra los patrones de wikilink y de embed, resuelve cada destino contra ese índice y reescribe sobre la marcha.

| A favor | En contra |
| --- | --- |
| La única vía donde decides tú a qué se resuelve un nombre de archivo duplicado | Ahora mantienes un conversor |
| Los alias, las reglas de etiquetas y las convenciones de carpetas propias de tu bóveda se pueden codificar todas | Cada caso límite del dialecto es tuyo por descubrir, normalmente después de la exportación |
| Sin dependencias, sin plugin, sin binario, y nada de lo que fiarse salvo código que puedes leer | Más lento en llegar al primer resultado que cualquier otra opción de aquí, y los fallos interesantes son silenciosos |

**Precio:** gratis, pagado en tiempo.

**Detalles técnicos y funciones**

- Una sola expresión regular sobre `!?\[\[target(#heading)?(\|shown)?\]\]` atrapa a toda la familia, embeds incluidos; la guía enlazada más arriba recorre una versión que funciona junto con su resolutor
- La resolución tiene que buscar por nombre de archivo en la bóveda entera, no en el directorio de la nota que enlaza, porque eso es lo que hace Obsidian; un resolutor limitado al directorio produce enlaces muertos para cada nota guardada en otro sitio y no informa de nada
- El índice necesita el frontmatter `aliases` de cada nota junto a su nombre de archivo, o un enlace escrito contra el título antiguo de una nota renombrada se cae a texto llano
- Ten una bóveda de pruebas con una de cada construcción dentro —un callout, un embed, una referencia de bloque, un enlace por alias, un nombre duplicado— y pasa cada cambio por ella

**¿Para quién es?** Para quien mueva una bóveda grande y de larga vida a un sitio donde tiene que seguir funcionando, donde un enlace muerto y silencioso es peor que una tarde escribiendo código. También para quien haya probado una de las herramientas de arriba y haya encontrado una regla con la que no está de acuerdo.

## Dónde falla la opción gratuita y obvia

La opción gratuita obvia, para la mayoría, es «copia la carpeta y ya» — la bóveda es Markdown, así que muévela y listo. Dónde falla eso merece precisión, porque los fallos son silenciosos y llegan más tarde.

**Los enlaces parecen correctos hasta que alguien hace clic.** En un editor de texto llano, `[[Project Brief]]` es legible y un lector lo entiende. En un README de GitHub representado o en un sitio estático es legible y está muerto. Nada da error; la página simplemente lleva un trozo de texto que parece querer ser un enlace, y el lector supone que el sitio está roto y no la fuente.

**Los callouts pierden su énfasis y conservan sus palabras.** Una cita en bloque `> [!warning]` pierde su estilo y conserva su texto, así que una nota que usaba el color del callout para distinguir «haz esto» de «no hagas esto nunca» ahora se lee como dos citas en bloque idénticas. Eso es peor que perder el contenido, porque el contenido está y su peso ha desaparecido.

**Los adjuntos se rompen de una forma que el texto no muestra.** Las imágenes viven en una carpeta de adjuntos referenciada por un embed. Copia los archivos `.md` sin la carpeta y todas las imágenes desaparecen; copia la carpeta a una posición relativa distinta y todas las imágenes desaparecen de una forma que se ve idéntica. El Markdown está inalterado y correcto en los dos casos.

**Una referencia de bloque no es un enlace roto, es nada.** `[[Note#^a1b2c3]]` fuera de Obsidian apunta a un id que ya no existe en ningún archivo. No hay destino que arreglar ni alternativa que mostrar. La única reparación honesta es incrustar el texto al que se estaba apuntando, lo que significa seguir teniendo la bóveda abierta en Obsidian para ver cuál era.

**El contenido representado por plugins no deja rastro de haber existido.** Una nota cuyo valor entero era una tabla de Dataview se convierte en un bloque de código que contiene una consulta. Para un lector que nunca usó la bóveda, esa nota parece ahora que siempre fue un fragmento. Busca estos casos mientras la bóveda todavía los representa.

**Y el frontmatter a veces es estructural.** Puede ser el único sitio donde una nota registró de dónde venía o sobre quién iba. La vía de la fusión lo quita automáticamente, que es lo correcto para la legibilidad y merece un vistazo previo si esas propiedades importaban.

## Cómo elegir

1. **Decide primero la forma de la salida, porque no es barato dar marcha atrás.** Una carpeta de archivos separados con enlaces que funcionan entre ellos apunta a obsidian-export o a un script tuyo; un documento para que lo lea una persona apunta a la vía de la fusión. Convertir en la dirección equivocada y rehacer la forma a mano después es la versión más lenta de este trabajo.
2. **Busca las cuatro construcciones en la bóveda antes de elegir.** Haz `grep` de `![[`, de `> [!`, de `#^` y de ```` ```dataview ````. Una bóveda sin embeds y sin callouts puede usar casi cualquier cosa de aquí; una bóveda construida sobre ellos necesita una herramienta cuyo tratamiento de ellos hayas leído de verdad.
3. **Comprueba si los adjuntos tienen que venir también.** Si es así, la vía del plugin o una exportación de línea de comandos de archivo a archivo son las únicas opciones que los llevan. Una fusión solo de Markdown no puede, por construcción, y ninguna configuración cambia eso.
4. **Cuenta cuántas veces va a pasar esto.** Una vez es una pestaña del navegador. Cada semana, o en cada commit, es una herramienta de línea de comandos dentro de un script — que una persona se acuerde de arrastrar un zip a una página es el paso que acaba dejando de ocurrir.
5. **Busca nombres de archivo duplicados antes de fiarte de ninguna reescritura automática.** `find . -name '*.md' | xargs -n1 basename | sort | uniq -d` tarda un segundo. Si no devuelve nada, todas las herramientas de aquí son seguras en ese eje; si devuelve filas, solo un script que controles tú las resuelve como querías.

## Conclusión

Aquí no hay ningún plan de pago que comparar, lo que convierte esto en una comparativa inusualmente honesta: todas las vías son gratuitas, y la decisión va enteramente de la forma de la salida y de cuánto entiende cada una del dialecto de Obsidian. Para una bóveda que tiene que seguir siendo una carpeta de archivos enlazados que funciona, obsidian-export es la herramienta gratuita hecha exactamente para eso. Para una nota o una carpeta cuyas imágenes tienen que viajar con ella, un plugin de la comunidad es la única vía que lleva binarios. Para una bóveda que se convierte en un documento que leerá alguien de fuera de Obsidian, la [conversión de Obsidian a Markdown](/obsidian-to-markdown) de TransformPipe hace la fusión, el índice, el colapso de los wikilinks y la eliminación del frontmatter en una sola pasada, en el navegador y sin subir nada. Elijas la que elijas, desactiva «Use \[\[Wikilinks\]\]» ese mismo día para que el atraso deje de crecer, y busca los bloques de Dataview mientras la bóveda siga abierta — eso es lo único que ningún conversor de aquí, a ningún precio, recupera. Si Obsidian no es el único origen en juego, [la comparativa de las tres exportaciones](/blog/markdown-from-notion-obsidian-and-confluence) cubre en qué se diferencian Notion y Confluence.

## Preguntas frecuentes

### ¿Existe un conversor de Obsidian a Markdown genuinamente gratuito?

Lo son todos. Los archivos de Obsidian ya son Markdown y todas las herramientas de esta página son de uso gratuito, así que no hay ningún plan de pago con el que compararlas. Las opciones difieren en si producen archivos separados o un solo documento, y en lo completo que sea su tratamiento de los wikilinks, los embeds, las referencias de bloque y los callouts.

### ¿Obsidian tiene una exportación a Markdown integrada?

No, y no la necesita — la bóveda ya es una carpeta de archivos `.md`. Obsidian sí tiene un ajuste «Use \[\[Wikilinks\]\]» que hace que los enlaces nuevos sean Markdown estándar, pero solo se aplica a los enlaces escritos después de cambiarlo, así que es una medida preventiva más que una exportación.

### ¿Cuál es la forma gratuita más rápida de convertir una bóveda entera en un solo archivo?

Comprime la carpeta de la bóveda y suéltala en un conversor de navegador que lea el archivador directamente — devuelve un documento con cada nota como una sección bajo un índice generado. Nada que instalar, y el problema de los wikilinks se resuelve solo, porque un documento fusionado no tiene archivos separados a los que puedan apuntar los enlaces.

### ¿Un conversor gratuito conservará mis imágenes?

Solo algunos. Un plugin que exporta una nota o una carpeta con sus adjuntos empaquetados, sí; una herramienta que produce un único documento Markdown no puede, porque un archivo Markdown contiene texto y una referencia a una imagen, nunca la imagen en sí. Comprueba qué comportamiento estás obteniendo antes de convertir una bóveda donde los diagramas llevan el significado.

### ¿Puede Pandoc convertir gratis una bóveda de Obsidian?

Pandoc es gratuito y con licencia GPL, y analiza los wikilinks mediante la extensión no predeterminada `wikilinks_title_after_pipe`. Lo que no puede hacer es resolver un wikilink a un archivo de otro punto de la bóveda, porque no tiene ningún índice de ella — así que más allá de las notas más simples necesita un filtro o un script envoltorio que haga la resolución.

### ¿Qué pasa con las tablas de Dataview y el resto del contenido de plugins?

No hay nada que se los lleve, porque nunca estuvieron en el archivo. Dataview guarda la consulta y representa la tabla en el momento de mostrarla dentro de Obsidian, así que una nota convertida muestra la consulta como un bloque de código y ninguna tabla. Anota dónde importaban esas tablas antes de convertir, mientras siguen siendo visibles.

### ¿Es seguro convertir una bóveda en el navegador?

Depende enteramente de si la página sube el archivo o lo lee en local. Un conversor que hace el trabajo en tu propio navegador no envía el archivador a ninguna parte, cosa que puedes verificar abriendo el panel de red y viendo que no pasa nada — merece la pena hacerlo una vez con una bóveda que tenga algo privado dentro.
