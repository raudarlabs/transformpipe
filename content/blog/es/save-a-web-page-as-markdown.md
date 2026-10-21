---
title: Cómo guardar una página web como Markdown que de verdad es tuyo
description: Cuatro formas de convertir una página web en Markdown —modo lectura, HTML guardado, clippers y línea de comandos— qué conserva cada una y qué pasa con las imágenes
updated: 2026-10-21
date: 2026-09-05
tag: Conversión
keywords: pasar una pagina web a markdown, guardar pagina web como markdown, convertir url a markdown, guardar articulo como markdown, web clipper markdown, extension para guardar articulos, descargar pagina web como texto, readability markdown
---

Una página que quieres conservar es una página que otro puede cambiar. El artículo que leíste en marzo ahora está detrás de un muro de registro, o el sitio se rediseñó y la URL da un 404, o el párrafo que recuerdas se ha editado en silencio y no hay forma de saberlo. Un marcador es una promesa hecha por un desconocido. El Markdown en tu propio disco es un archivo.

La conversión en sí es la parte fácil. Todas las rutas de abajo terminan con HTML convirtiéndose en Markdown, y ese paso lo resuelven bien media docena de herramientas. Lo que separa las rutas es todo lo demás: qué parte de la página termina en tus manos, si las imágenes vienen con ella, si el archivo sigue abriéndose dentro de cinco años, y cuánto de tu tarde se lleva un solo artículo.

### Resumen rápido

Para un artículo que estás leyendo ahora mismo, activa el modo lectura del navegador, guarda o copia la página ya limpia, y convierte eso — el modo lectura es un paso de extracción que te sale gratis, y quita la navegación, el cuadro de la newsletter y la barra de artículos relacionados antes de que ningún conversor los vea. Para una página que quieres entera, guárdala primero como HTML y convierte el archivo, porque un archivo guardado se puede volver a convertir cuando cambies de idea y un copia-pega no. Para lo rutinario, una extensión de clipper deja el Markdown directamente en tus notas con un clic y esconde los dos pasos a la vez. Y sea la ruta que sea, decide sobre las imágenes a propósito: un archivo Markdown que apunta a las URLs de imagen de otro es un archivo que poco a poco se va a quedar en blanco.

## Las rutas, comparadas

Cada fila es un intercambio distinto entre esfuerzo y fidelidad. Ninguna está mal; fallan en sitios distintos.

| Ruta | Mejor para | Qué conserva | Qué cuesta | Precio |
| --- | --- | --- | --- | --- |
| Modo lectura, luego convertir | Un artículo, leído ahora, guardado como prosa | Encabezados, párrafos, enlaces del cuerpo, casi siempre las tablas | Lo que el extractor juzgó como decoración, incluidas figuras reales | Gratis |
| Guardar como HTML, luego convertir el archivo | Una página que quieres entera, o quieres dos veces | Todo lo que traía la página, decoración incluida | Quitas la decoración tú mismo | Gratis |
| Conversor en el navegador | Un archivo convertido sin subirlo | Tablas, listas de tareas, código, encabezados | Un documento a la vez | Gratis |
| Extensión MarkDownload | Recortar la página que tienes delante | Artículo extraído, más front matter con la URL | Una extensión con permiso para leer páginas | Gratis, Apache 2.0 |
| Obsidian Web Clipper | Markdown que aterriza en una bóveda | Extracción, plantillas, propiedades de página | Atado a la carpeta de Obsidian | Gratis, MIT |
| Notion Web Clipper | Leer más tarde dentro de Notion | La página como bloques de Notion | No es Markdown — hace falta una segunda exportación para llegar ahí | Gratis |
| SingleFile | Conservar la página tal como se veía | Imágenes, CSS y fuentes incrustadas en un solo HTML | Un archivo grande, y la conversión sigue pendiente | Gratis, código abierto |
| monolith | Archivar páginas desde un script | Recursos incrustados como data URIs, sin carpeta | Una instalación de Rust; sin extracción del artículo | Gratis, código abierto |
| Pandoc | Conversión dentro de un build o un script | Estructura, e imágenes vía `--extract-media` | Sin extracción: dale HTML limpio o te da el menú | Gratis, GPL |
| Turndown | Una herramienta o extensión que estás escribiendo tú | Exactamente las reglas que definas | Tú aportas el DOM, la extracción y el envoltorio | Gratis, MIT |
| Mozilla Readability | Encontrar el artículo dentro de una página | Título, autor, HTML del artículo ya limpio | Produce HTML, no Markdown | Gratis, Apache 2.0 |
| `wget` / `curl` | Muchas páginas, sin sesión, desde un terminal | Los bytes tal como los envió el servidor | Sin extracción, y el deber de hacerlo con educación | Gratis |
| Un archivo web público | Demostrar qué decía la página | Una instantánea citable y fechada | No es tu archivo, y no es Markdown | Gratis |
| Imprimir a PDF | Un maquetado que no debe moverse | La página como una foto de sí misma | El texto estructurado desaparece; convertir de vuelta es un trabajo nuevo | Gratis |

## Ruta uno: guarda el HTML, luego convierte el archivo

Esta es la ruta que conviene aprender primero, porque separa la captura de la conversión. En cuanto el HTML está en disco puedes convertirlo de cuatro formas distintas, comparar los resultados y repetir todo el proceso el año que viene con una herramienta mejor. Copiar y pegar solo te da una oportunidad.

| A favor | En contra |
| --- | --- |
| La captura es permanente y se puede volver a convertir | Dos pasos en vez de uno |
| Funciona en cualquier página, incluidas las que ningún extractor maneja bien | Te llevas la navegación y el pie de página junto con el artículo |
| El archivo guardado es una prueba: es lo que decía la página ese día | Los formatos que ofrece el navegador no son igual de útiles entre sí |
| No hay que subir nada para convertirlo después | Los recursos aterrizan en una carpeta hermana que es fácil perder |

**Para quién es.** Para cualquiera que guarde una página como referencia y no para leerla — documentación que puede desaparecer, una especificación, un hilo de soporte que vas a necesitar citar, la página de precios de un competidor el día que la miraste.

### El formato del diálogo de guardado decide qué obtienes

Pulsar el atajo de guardar no es una sola acción. El desplegable del diálogo ofrece formatos que se comportan de forma muy distinta, y elegir el equivocado es la razón más común por la que una conversión no produce nada útil.

| Formato | Dónde se encuentra | Qué queda en disco | ¿Convierte bien? |
| --- | --- | --- | --- |
| Página web, completa | Chrome, Edge, Firefox («Página web completa») | Un archivo `.html` más una carpeta `_files` con imágenes, CSS y scripts | Sí, y las imágenes ya son locales |
| Página web, solo HTML | Chrome, Edge, Firefox («Página web, solo HTML») | Un único archivo `.html`, los recursos siguen remotos | Sí, aunque las imágenes se quedan como URLs remotas |
| Página web, archivo único | Chrome, Edge | Un archivo `.mhtml`: un archivo MIME multiparte de la página y sus piezas | Casi nunca — la mayoría de conversores de Markdown no leen MHTML |
| Archivo web | Safari | Un archivo `.webarchive`, una lista de propiedades binaria | No: es el formato de Apple, no HTML |
| Código fuente de la página | Safari | El HTML que envió el servidor | Sí, pero mira la nota sobre JavaScript más abajo |
| Archivos de texto | Firefox | La página como texto plano | No sobrevive ninguna estructura, así que no hay nada que convertir |

MHTML merece una advertencia propia, porque «archivo único» suena exactamente a lo que querías. Es un contenedor MIME — el mismo formato de sobre que un correo con adjuntos, estandarizado en el RFC 2557 — con el HTML y cada recurso como partes codificadas en base64. Los navegadores lo abren. Los conversores de Markdown, en general, no, y el archivo no da ninguna pista de que él es el problema: obtienes un error, o una línea enorme de base64.

### Cuando la página la construye JavaScript, guarda el DOM ya renderizado

Muchísimas páginas envían un documento casi vacío y lo van rellenando con script. Guarda el código fuente de una de esas y habrás guardado un indicador de carga. La solución fiable es tomar el DOM que el navegador acabó construyendo de verdad: abre las herramientas de desarrollador, busca el elemento `<html>` arriba del panel de elementos, haz clic derecho y elige Copiar, luego Copiar outerHTML. Pega eso en un archivo con extensión `.html` y convierte eso en su lugar. Es la página renderizada, tablas incluidas, en el estado en que la estabas mirando.

El mismo truco sirve para acotar el trabajo. En lugar del elemento `<html>`, copia el outerHTML del `<article>` o del contenedor principal de contenido. Con eso ya has hecho la extracción a mano, con precisión, en unos cuatro segundos, y al conversor no le queda nada que adivinar.

### El mismo trabajo con un script

Para más de una página, el terminal es más corto. `curl -sL <url> -o page.html` descarga el documento y sigue las redirecciones. `wget --page-requisites --convert-links <url>` descarga la página más las imágenes y hojas de estilo a las que hace referencia y reescribe esas referencias para que apunten a las copias locales, lo más parecido a «Página web, completa» desde un terminal.

Pandoc lee HTML y escribe Markdown directamente, y acepta una URL como entrada tanto como un archivo, así que `pandoc -f html -t gfm <url> -o page.md` es un comando de una línea para una página sencilla. No hace ninguna extracción — te vas a llevar el menú, el pie de página y cada enlace de la barra lateral — así que pertenece al final de un pipeline donde algo ya haya encontrado el artículo antes. Su opción `--extract-media` es la parte útil para conservar una página: escribe las imágenes en un directorio y reescribe los enlaces en el Markdown para que coincidan, lo que convierte un archivo lleno de URLs remotas en una carpeta autocontenida.

Si lo que quieres es la página en sí y no su texto, `monolith` es una pequeña herramienta de línea de comandos escrita en Rust que empaqueta una página y sus recursos en un único archivo HTML con todo incrustado como data URIs. No hay servidor ni carpeta que perder. Es gratis y de código abierto. Convierte ese archivo más tarde si quieres Markdown; guárdalo de todas formas si la página puede desaparecer.

## Ruta dos: modo lectura y extracción al estilo Readability

El modo lectura es la herramienta de conversión más desaprovechada del navegador, porque nadie piensa en él como tal. Lo que hace es exactamente la mitad difícil del trabajo: mira el documento, decide qué bloque es el artículo y tira el resto. La Vista de lectura de Firefox está construida sobre la biblioteca Readability de Mozilla. Safari tiene su Lector, Chrome tiene un modo de lectura en su panel lateral y Edge tiene Immersive Reader. No son idénticos, pero todos hacen el mismo tipo de puntuación — cuánto texto hay en este elemento, cuántos enlaces, cuán anidado está, qué nombres de clase lleva.

Actívalo, y luego guarda o copia desde la vista ya limpia. Como la vista de lectura es en sí misma un documento real dentro del navegador, el truco de las herramientas de desarrollador funciona sobre ella: copia el outerHTML del contenedor de lectura y tienes el artículo sin ninguna decoración. Convierte eso y el Markdown empieza en el titular.

| A favor | En contra |
| --- | --- |
| La extracción está hecha, gratis, por software que ha visto millones de páginas | Decide qué es una «figura», y a veces se equivoca |
| Funciona sobre la página que ya estás leyendo, sin instalar nada | Falla en páginas que no son artículos: paneles, documentación con barra lateral, foros |
| Elimina píxeles de seguimiento, huecos de publicidad y cajas de newsletter de propina | Las citas destacadas, los pies de foto y las notas al margen se pierden a menudo |
| Te da el título y el autor como campos limpios y separados | Sin control sobre las reglas salvo que ejecutes la biblioteca tú mismo |

**Para quién es.** Para lectores que guardan artículos: periodismo, ensayos, entradas de blog, cualquier cosa con una columna de prosa y un titular. Es la herramienta equivocada para documentación de referencia, donde la navegación lateral y las tablas al margen son la mitad del valor.

Ejecutar la biblioteca directamente vale la pena conocerlo si haces esto con cierto volumen. Readability de Mozilla es JavaScript, con licencia Apache 2.0, y toma un documento DOM; `new Readability(document).parse()` devuelve un objeto con el título, el autor, un extracto, el nombre del sitio y el artículo ya limpio como HTML. Ahí se detiene — la extracción es todo su alcance, y convertir ese HTML a Markdown es trabajo de la siguiente herramienta. Postlight Parser hace el mismo tipo de extracción y puede emitir Markdown directamente. La comparación entre esas herramientas y las bibliotecas planas [está desarrollada por separado en otro artículo](/blog/best-html-to-markdown-converters); lo que importa aquí es el orden de las operaciones. Extrae, luego convierte. Hacerlo al revés produce un pulcro Markdown de un menú de navegación.

## Ruta tres: extensiones de clipper, y qué destroza cada una

Un clipper es extracción y conversión unidas detrás de un solo botón, y para conservar cosas día a día esa es la forma correcta. El coste es una extensión de navegador con permiso para leer las páginas que visitas, y una opinión — decidida por otra persona — sobre qué merece la pena conservar de una página.

| Clipper | Qué produce | Adónde va | Qué suele destrozar |
| --- | --- | --- | --- |
| MarkDownload | Un archivo `.md`, opcionalmente con front matter YAML con la URL y el título | Tu carpeta de descargas, o el portapapeles | Lo que sea que el extractor descartara; las imágenes se quedan como enlaces remotos salvo que pidas otra cosa |
| Obsidian Web Clipper | Markdown más propiedades de página, con la forma de una plantilla que escribes tú | Directamente en una carpeta de la bóveda | Los resaltados y callouts son convenciones propias de Obsidian, así que viajan mal a otras herramientas |
| Notion Web Clipper | Bloques de Notion, no Markdown | Una base de datos o página de Notion | Todo lo que Notion no tiene bloque para representar; recuperar Markdown necesita una segunda exportación |
| Extensión de TransformPipe | Markdown del artículo extraído, o la página como un único archivo `.html` autónomo | El portapapeles, tu carpeta de descargas, o una cuenta si inicias sesión | Lo que el extractor descartara; las imágenes del Markdown se quedan como enlaces remotos, reescritos como direcciones absolutas |
| Una extensión genérica de «guardar como Markdown» | Varía enormemente | Descargas | Desconocido, que es el problema: no puedes auditar lo que no puedes leer |

MarkDownload es el caballo de batalla honesto: ejecuta Readability sobre la página y luego Turndown sobre el resultado, el mismo pipeline de dos fases descrito arriba, ya montado por ti. Es gratis y de código abierto bajo licencia Apache 2.0, lo que significa que el pipeline es inspeccionable — puedes leer exactamente qué reglas produjeron el archivo que obtuviste.

El Web Clipper de Obsidian es el que hay que usar si el destino es una bóveda, porque escribe la nota donde la bóveda la espera, con las propiedades que necesitan tus plantillas. Es gratis y con licencia MIT. Dos cosas que tener en cuenta. Primero, sus plantillas son una función real y merece la pena configurarlas una vez: una nota recortada con la URL de origen, el autor y la fecha de captura en sus propiedades es una nota que todavía podrás citar en dos años. Segundo, el sabor de Obsidian tiene sus propias extensiones — wikilinks, callouts, embeds — y una nota llena de ellas no es una nota que otra herramienta vaya a renderizar. [Lo que hace cada una de estas aplicaciones con el Markdown al exportarlo](/blog/markdown-from-notion-obsidian-and-confluence) es una historia más larga, y se aplica tanto a páginas recortadas como a notas escritas a mano.

El clipper de Notion es la excepción y el que sorprende a la gente. No guarda Markdown. Guarda la página en Notion como bloques de Notion, lo que es genuinamente útil si Notion es donde lees las cosas, y un callejón sin salida si lo que querías era un archivo. Para sacar Markdown exportas la página desde Notion después, lo que produce un zip con ids hexadecimales pegados a cada nombre de archivo y las bases de datos como archivos CSV aparte. Son dos conversiones con pérdida cuando pediste una sola.

El conversor que se describe más abajo también existe como [extensión del navegador](/extension), y es el mismo pipeline de dos fases: Readability encuentra el artículo en la página en la que estás, el conversor de HTML a Markdown del propio sitio escribe el Markdown, y cada dirección de enlace y de imagen se reescribe como absoluta para que el archivo siga apuntando a algún sitio cuando salga de la pestaña — las imágenes siguen siendo enlaces al sitio original, no copias. También puede guardar la página como un único archivo `.html` con sus hojas de estilo, imágenes y fuentes incrustadas como URI de datos, y su menú contextual convierte una selección en vez de la página entera. No pide ningún permiso de host al instalarla, solo lee una página cuando pulsas su botón o abres su panel lateral en ella, y sin sesión iniciada nunca contacta con los servidores del sitio; se instala en Chrome y en los navegadores basados en Chromium, y en Firefox para escritorio y para Android.

**Para quién son los clippers.** Para quien recorta páginas todos los días y quiere que la decisión ya esté tomada. Si recortas dos veces al año, el permiso de la extensión no compensa y la ruta en dos pasos funciona bien.

### La opción en el navegador, si prefieres no instalar nada

Entre «pegar en una web» e «instalar una extensión» hay una tercera posición: un conversor que funciona en la pestaña del navegador pero que no forma parte del navegador. Suelta el archivo `.html` guardado sobre la página, o pega el HTML que copiaste de las herramientas de desarrollador, y la conversión ocurre en tu propia máquina. Sin sesión iniciada, la [conversión de HTML a Markdown](/html-to-markdown) de TransformPipe no sube absolutamente nada — el archivo se lee, se analiza y se convierte en local, algo que puedes verificar abriendo el panel de red y viendo que no pasa nada. La conversión está limitada a 10 MB, y un documento que decidas guardar en una cuenta está limitado a 4 MB, porque la función que lo almacena rechaza una petición más grande.

| A favor | En contra |
| --- | --- |
| Sin instalación, sin permisos de extensión, nada se sube sin sesión iniciada | Igual tienes que capturar el HTML tú mismo |
| Conserva tablas GFM, listas de tareas, código con vallas y encabezados | Un documento a la vez, no un rastreo |
| También convierte en la otra dirección, y desde Word, CSV y JSON | El trabajo lo hace el navegador, así que una página enorme depende de la máquina |

**Para quién es.** Para alguien con una página guardada y una conversión que hacer, en una máquina donde instalar cosas es lento o no está permitido.

## Las imágenes: descárgalas, o acepta que se pudran

Esta es la parte que todas las guías se saltan, y es la que decide si tu archivo merece la pena tenerlo dentro de tres años.

Markdown tiene una sola sintaxis de imagen y guarda una ubicación: `![alt](url)`. Convierte una página web y esa URL es la que usaba la página — normalmente una dirección absoluta en el propio origen o en una CDN. El Markdown es correcto en el momento en que lo generas y no es una copia de nada. Es una copia del texto y un puntero a las imágenes de otra persona, y los punteros se pudren de al menos cinco formas:

- El sitio se rediseña y las rutas de los medios cambian.
- Se cambia la CDN, se renombra el bucket, o el prefijo antiguo deja de resolver.
- La URL llevaba una cadena de consulta firmada con caducidad, y la firma ya está caducada.
- La protección contra hotlinking empieza a rechazar peticiones que no vienen de las propias páginas del sitio.
- El sitio desaparece por completo, que suele ser justo la razón por la que guardaste la página.

Hay tres opciones honestas y ninguna cuarta.

| Opción | Qué obtienes | Qué se rompe | Esfuerzo |
| --- | --- | --- | --- |
| Dejar las URLs remotas | Un archivo de texto pequeño, imágenes mientras duren | Cada fallo de arriba, en silencio y de uno en uno | Ninguno |
| Descargar las imágenes junto al archivo | Una carpeta que de verdad es una copia | Las rutas relativas se rompen si el archivo se mueve sin la carpeta | Un flag, o un ajuste del clipper |
| Incrustar las imágenes como data URIs | Un archivo que no necesita ninguna red | Un archivo mucho más grande, y algunas herramientas rechazan URIs muy largas | Un paso de conversión |

Descargarlas es lo que debería hacer la mayoría, y el tooling ya existe: `--extract-media` de Pandoc escribe los medios y reescribe los enlaces, `wget --page-requisites --convert-links` hace lo equivalente en el momento de la captura, y SingleFile y monolith incrustan todo dentro del HTML antes de que la conversión sea siquiera una consideración. El problema de una carpeta es que un archivo Markdown y su directorio `images/` son ahora una sola unidad, y el vínculo entre ambos es una ruta relativa — que es exactamente [la suposición que se rompe la primera vez que alguien mueve el archivo](/blog/images-and-links-that-still-work) y no la carpeta.

Dos problemas de imágenes más pequeños conviene conocerlos antes de culpar al conversor. La carga diferida hace que la dirección real de la imagen viva a menudo en un atributo `data-src` o `srcset` mientras `src` guarda un marcador de posición, así que un conversor que trabaja sobre el HTML original captura ese marcador — un cuadrado gris o un GIF transparente de un píxel. Copiar el DOM ya renderizado después de hacer scroll en la página suele arreglarlo, porque para entonces el navegador ya ha puesto la dirección real. Y `<figure>` con `<figcaption>` no tiene equivalente en Markdown, así que el pie de foto llega como un párrafo suelto debajo de la imagen, indistinguible del texto normal.

## Dónde falla guardar una página como Markdown

La respuesta honesta es que Markdown es un formato con pérdidas para la web, y para algunas páginas esa pérdida es justo el objetivo de la página.

**Aplicaciones que fingen ser documentos.** Un panel, un mapa, una calculadora, una tabla ordenable con filtros — no hay nada que guardar. Lo que puedes conservar es una captura de pantalla o un PDF, que conserva la imagen y abandona el texto.

**Cualquier cosa que necesite la red para existir.** Vídeo incrustado, tuits, marcos de CodePen, hilos de comentarios que cargan al hacer scroll, gráficos interactivos dibujados desde un feed JSON. Un conversor convierte un `<iframe>` en nada, o en un enlace a una URL que puede no sobrevivir a la página.

**Scroll infinito y paginación.** Obtienes lo que estaba cargado cuando capturaste. Un hilo con doscientas respuestas te da las primeras veinte, y nada en el archivo lo advierte.

**Contenido detrás de una sesión iniciada.** Un clipper funciona porque el navegador ya está autenticado; `curl` no lo está, y descargará la pantalla de inicio de sesión y la convertirá perfectamente.

**HTML estructural sin equivalente en Markdown.** Tablas que usan `rowspan` o `colspan`, listas de definición, tablas anidadas, notas al margen, bloques `<details>`, matemáticas renderizadas por KaTeX o MathJax, código resaltado donde el lenguaje vive en un nombre de clase que el conversor no lee. Algunos conversores emiten HTML crudo para esto, lo que conserva la información al coste de la portabilidad; otros aproximan; otros lo descartan. Las tablas son la baja más habitual y la más visible, y [qué hace que una tabla sobreviva al viaje](/blog/markdown-tables-that-survive-conversion) merece leerse si tus páginas son documentación.

**La cuestión de seguridad, si el archivo va a ir a algún sitio.** Markdown permite HTML crudo, y el HTML convertido de una página web puede llevar HTML crudo a través — incluidos `<script>`, atributos `onerror=` y URLs `javascript:` de la página que guardaste. Eso está inerte en un editor de texto y vivo en el momento en que lo conviertes de vuelta a HTML y lo abres en un navegador. Si una página guardada va a volver a convertirse en página, [sanitizar es el paso que no se puede saltar](/blog/sanitising-markdown-safely).

**Y el coste que nadie menciona.** Una copia en Markdown es una instantánea con el maquetado, el estilo y la identidad de la fuente ya despojados. Es más pequeña, buscable, grepable, comparable y tuya. También ha dejado de ser prueba de nada, porque podrías haberla escrito tú. Si necesitas demostrar qué decía la página, conserva el HTML — o la instantánea del archivo — además del Markdown, y anota la URL y la fecha en que la capturaste en el front matter del archivo. Ese hábito cuesta una línea y resuelve discusiones.

## Tu propia lectura, no una republicación

Guardar una página para ti y publicar lo que guardaste son dos actos distintos, y el segundo no está cubierto por el primero.

El texto y las imágenes de una página web son el trabajo de alguien, y el derecho de autor se aplica exista o no un aviso. Conservar una copia personal para leer, anotar, buscar y citar es un uso ordinario, y las excepciones que preveen la mayoría de jurisdicciones — el trato leal para investigación no comercial y estudio privado en el Reino Unido, el uso justo en Estados Unidos — existen más o menos para eso. Tomar el Markdown que produjiste y publicarlo en tu propio sitio, meterlo en un producto, o hacerlo circular como un documento con tu nombre en la cabecera es una pregunta distinta, y la respuesta depende de cuánto tomaste, qué hiciste con ello y si estás cobrando por ello. Nada de esto es asesoramiento legal; la versión práctica va debajo.

| Qué estás haciendo | Cómo suele leerse | Qué hacer al respecto |
| --- | --- | --- |
| Guardar un artículo para leerlo sin conexión | Uso personal | Nada. Anota la URL y la fecha |
| Citar un párrafo con atribución | Cita ordinaria | Enlaza al original, nombra al autor |
| Republicar el artículo entero en tu sitio | Republicación | Pide permiso, o enlaza en vez de copiar |
| Construir un corpus buscable para un equipo | Depende enteramente de la escala y la licencia | Revisa los términos; pide permiso por escrito |
| Alimentar páginas a un producto comercial | No es uso personal bajo ninguna lectura | Pide asesoramiento antes, no después |

Luego está la mitad de las buenas formas, que es técnica y no opcional. `robots.txt` es una petición y no una licencia, y un script que descarga mil páginas es un rastreador aunque no lo veas así. Descarga despacio, una página a la vez, con una pausa entre peticiones. Manda un User-Agent que diga quién eres y cómo contactarte. Respeta un `429` y cualquier cabecera `Retry-After` que traiga en vez de reintentar de inmediato. Guarda en caché lo que ya has descargado para que una nueva ejecución no vuelva a golpear el sitio. Y lee los términos de servicio antes de automatizar nada contra un sitio que no es tuyo, sobre todo cuando el contenido está detrás de una sesión o un muro de pago — saltarse un control de acceso es una cuestión distinta del derecho de autor, y peor.

Una página, guardada a mano, de un sitio que lees: a nadie le importa, y para eso han tenido los navegadores un botón de guardar desde el principio. Un barrido con script de una publicación entera: pide permiso primero.

## Cómo elegir

1. **Parte de lo que vas a hacer con el archivo.** Si es leerlo más tarde, un extractor es tu amigo y la decoración es ruido. Si es citarlo en un argumento, conserva también el HTML, porque el Markdown no demuestra nada por sí solo.
2. **Captura antes de convertir.** Guarda el HTML, o copia el DOM renderizado, y conserva eso. Las herramientas de conversión mejoran y tus necesidades cambian, y un archivo en disco se puede pasar por una herramienta mejor el año que viene — un pegado en una caja de texto no.
3. **Decide sobre las imágenes en el momento de la captura, no después.** Descargarlas cuesta un flag mientras tienes la página delante, y cuesta un archivo roto si lo dejas para cuando las URLs ya se hayan podrido.
4. **Comprueba las tablas antes de confiar en la herramienta.** Las tablas no están en la especificación de CommonMark, así que un conversor tiene que implementar las tablas GFM a propósito. Convierte una página con una tabla y mírala; esa única prueba descarta la mayoría de las malas opciones.
5. **Sanitiza cualquier cosa que vaya a volver a ser HTML.** Una página que guardaste puede llevar scripts, y un viaje de ida y vuelta fiel los devuelve a un navegador. Si el Markdown solo se va a leer como texto, esto no importa; en el momento en que se publica, es lo único que importa.
6. **Compara el número de instalaciones con la frecuencia.** Recortar todos los días justifica una extensión y una plantilla. Dos páginas al año no: usa el modo lectura, guarda el HTML, convierte en una pestaña del navegador, y quédate tus permisos.

## Conclusión

La forma fiable de conservar una página web son dos pasos que parecen uno: sacar el artículo de la página, y luego sacar el Markdown del artículo. El modo lectura o un extractor hace lo primero, cualquier conversor competente hace lo segundo, y un clipper hace las dos cosas a la vez a cambio de un permiso de extensión. Sea la ruta que tomes, guarda las imágenes o acepta a sabiendas que se van a desvanecer, escribe la URL de origen y la fecha en el archivo, y recuerda que la copia es para ti — la página sigue siendo de quien la escribió.

## Preguntas frecuentes

### ¿Cuál es la forma más rápida de guardar una página web como Markdown?

Activa el modo lectura del navegador, copia el artículo ya limpio, y pégalo en un conversor — eso lleva menos de un minuto y no requiere instalar nada. Si lo haces con frecuencia, una extensión de clipper lo reduce a un clic, al coste de conceder acceso a esa extensión a las páginas que visitas.

### ¿Qué formato de guardado del navegador debería elegir?

«Página web, completa» si quieres las imágenes en disco, o «Página web, solo HTML» si solo te importa el texto. Evita «Página web, archivo único» (`.mhtml`) y el Archivo web de Safari cuando el objetivo sea Markdown, porque la mayoría de conversores no pueden leer ninguno de los dos formatos.

### ¿Por qué mi página guardada convierte a casi nada?

Lo más probable es que la página renderice su contenido con JavaScript, así que la fuente guardada es una carcasa vacía. Abre las herramientas de desarrollador, haz clic derecho sobre el elemento `<html>`, elige Copiar y luego Copiar outerHTML, guarda eso como un archivo `.html`, y convierte eso en su lugar — es la página tal como la construyó el navegador.

### ¿Las imágenes vienen con el Markdown?

No por defecto. Un conversor escribe las URLs de imagen que encontró, que apuntan al sitio original y solo seguirán funcionando mientras ese sitio siga en pie. Usa `--extract-media` de Pandoc, `wget --page-requisites --convert-links`, o una herramienta que incruste los recursos, si quieres una copia y no un puntero.

### ¿Puedo convertir una URL directamente a Markdown sin instalar nada?

Sí, para páginas sencillas: Pandoc acepta una URL como entrada, y varias herramientas en línea aceptan una. Ambos enfoques se saltan la extracción, así que espera la navegación y el pie de página en la salida salvo que la herramienta ejecute primero un extractor propio.

### ¿Es legal guardar una página web como Markdown?

Conservar una copia personal para leer es un uso ordinario, y es para lo que sirve el botón de guardar de un navegador. Republicar lo que guardaste, o construir un corpus comercial a partir de muchas páginas, es una pregunta distinta que depende de la escala, la licencia y los términos de servicio — pide permiso antes de automatizar contra un sitio que no es tuyo.

### ¿Puedo convertir un sitio entero de una vez?

Técnicamente sí, con `wget` y un conversor en un bucle, y es la petición con más probabilidad de molestar al dueño del sitio o de que te bloqueen la dirección. Limita la velocidad, identifícate en el User-Agent, respeta las respuestas `429`, y considera si una instantánea de archivo o una petición para conseguir la fuente directamente te serviría mejor.
