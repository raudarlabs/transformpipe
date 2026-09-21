---
title: "El mejor conversor gratis de Confluence a Markdown en 2026: todas las opciones"
description: "Qué conversor gratis de Confluence a Markdown lo es en la práctica: dónde acaban las pruebas, por qué la exportación integrada pide permisos de admin y qué usar"
date: 2026-09-14
tag: Conversión
keywords: conversor gratis de confluence a markdown, convertir confluence a markdown, confluence a markdown, exportar confluence a markdown gratis, exportacion markdown confluence, app markdown confluence, exportar espacio confluence a markdown
---

Busca un conversor gratuito de Confluence a Markdown y todos los resultados dicen que son gratis. Luego los pruebas. Uno es una prueba de treinta días que se llama gratis en la ficha. Otro es genuinamente gratuito y va de página en página, que no es lo que querías cuando lo que hay que convertir es un wiki de cuatrocientas páginas. Otro es gratuito y ya viene integrado en Confluence, y te para en un permiso que no te puedes conceder a ti mismo. Y otro funcionaría de maravilla si pudieras sacar el contenido de Confluence en una forma que fuera capaz de leer, que es justamente el problema.

Es una cantidad inusualmente espesa de asteriscos para un trabajo que suena sencillo, y no es casualidad. Confluence no tiene exportación a Markdown, así que cada vía pasa o por un formato de exportación diseñado para otra cosa o por una aplicación que alguien con permisos de administrador tiene que instalar. Gratis, en este nicho, suele significar gratis-para-ti-si-otro-dice-que-sí.

Este artículo va de cuál de esas vías es gratuita de verdad, para quién y con qué alcance. Para la mecánica —qué formato de exportación conserva qué, en qué se convierte cada macro, por qué se rompen los enlaces internos— [cómo convertir una página de Confluence a Markdown](/blog/convert-confluence-page-to-markdown) repasa los formatos de exportación uno a uno y el daño que hace cada uno. Este es la lista de la compra.

### Resumen rápido

**La vía gratuita a escala de espacio entero es una exportación más una conversión.** La exportación HTML de espacio de la propia Confluence no cuesta nada, pero necesita permiso de administrador del espacio, y la exportación de un administrador de espacio contiene solo lo que su propia cuenta puede ver, salvo que la ejecute un administrador del sitio, que exporta todo con independencia de la visibilidad (consultado en support.atlassian.com, 14 de septiembre de 2026). Una vez que tienes ese zip, convertirlo es gratis desde cualquier dirección: suéltalo en [un conversor de navegador](/confluence-to-markdown) para obtener un documento fusionado con su índice, o apunta Pandoc o un script de turndown a los archivos HTML para obtener un archivo Markdown por página.

**En el Atlassian Marketplace, lee la palabra que hay encima del botón.** Una ficha encabezada por **Free app** es gratuita; una encabezada por **Try it free** es una prueba con un precio detrás. Las dos existen hoy en esta categoría, y la sección de abajo dice cuál es cuál (consultado en marketplace.atlassian.com, 14 de septiembre de 2026). En cualquier caso, alguien con permisos de administrador tiene que instalarla, que es la misma barrera que la de la exportación.

**La exportación a Word y a PDF es gratuita y no es una vía.** Son las dos exportaciones que cualquiera puede ejecutar sin permisos, que es exactamente por lo que la gente recurre a ellas, y son las dos que tiran a la basura la estructura que necesita una conversión a Markdown.

## Por qué en esta conversión lo difícil es lo gratuito

Para la mayoría de las conversiones, lo gratuito es una pregunta aburrida. Un CSV es un archivo en tu disco; un conversor lo lee; nadie aprueba nada. Confluence es distinto en dos aspectos, y los dos se traducen en dinero o en permisos.

**No hay exportación a Markdown, así que toda opción gratuita hace dos trabajos.** Una página se guarda en el formato de almacenamiento propio de Confluence, basado en XHTML, y el menú de exportación ofrece representaciones de él —Word, PDF, HTML, XML, CSV—, ninguna de ellas Markdown. Un conversor tiene que ser, por tanto, o una aplicación que vive dentro de Confluence y lee ese formato por la API, o un segundo paso posterior a una exportación. Las aplicaciones cuestan dinero porque son software mantenido contra una API en movimiento; los segundos pasos son gratuitos porque las piezas ya existen. Esa es la economía de toda esta categoría.

**Las exportaciones útiles están limitadas por permisos y no por pago.** La exportación de una sola página a Word y a PDF está disponible para cualquiera que pueda leer la página. Todo lo que sea a escala de espacio —HTML, XML, CSV— necesita permiso de administrador del espacio. La vía integrada y gratuita no cuesta dinero y puede costar una semana esperando un ticket. La mayoría de quienes buscan un conversor gratuito no son administradores de espacio; son un desarrollador, un redactor técnico o alguien recién llegado a quien le han entregado un wiki y le han pedido que lo meta en un repositorio.

Ese segundo punto merece decirse sin rodeos, porque ninguna página de producto te lo va a contar: **si no eres administrador del espacio y no puedes llegar a serlo, tu cuello de botella no es la elección del conversor.** La pregunta que estás respondiendo en realidad es cuál de dos favores es más pequeño: pedirle a un administrador de espacio que ejecute una exportación y te mande un zip, o pedirle a un administrador del sitio que instale una aplicación. Lo primero es un favor puntual; lo segundo es una decisión permanente sobre qué software corre en la Confluence de la empresa, y es la razón de que la vía de exportar y convertir gane más a menudo de lo que su ergonomía merece.

Una cosa más sobre esa exportación integrada y gratuita: la exportación de un administrador de espacio contiene solo lo que ese administrador ya puede ver. Las páginas restringidas frente a él están silenciosamente ausentes del zip, y nada que venga después puede hablarte de una página que nunca estuvo en el archivo. Un administrador del sitio que la ejecute obtiene todo (consultado en support.atlassian.com, 14 de septiembre de 2026). Las entradas de blog no están en absoluto en la exportación HTML ni en la PDF de un espacio, y los comentarios nunca están en una exportación a PDF, según esa misma documentación.

## Comparativa rápida: la chuleta

| Herramienta | Mejor para | Capacidad principal | Precio |
| --- | --- | --- | --- |
| La exportación HTML de espacio de Confluence | Sacar el contenido, para empezar | Un archivo HTML por página, más los adjuntos, en un zip | Gratis, exige permiso de admin del espacio |
| El conversor de navegador en /confluence-to-markdown | Convertir ese zip en un documento legible | Sueltas el zip de la exportación y sale un documento con su índice | Gratis; no se sube nada sin sesión iniciada |
| Pandoc | Una migración masiva con scripts | `html` dentro, `gfm` o `commonmark` fuera, un comando por archivo | Gratis, GPL |
| Un script con turndown | Reglas que necesitas controlar tú | Reglas propias para el marcado envoltorio que emite Confluence | Gratis, MIT |
| Aplicación del Marketplace, listada como Free app | Exportar Markdown desde dentro de Confluence | Exportar sin salir de la página | Gratis según la ficha; la instala un administrador |
| Aplicación del Marketplace, listada como Try it free | Evaluar antes de una decisión de compra | Lo mismo, con el árbol de páginas y los adjuntos resueltos por ti | Una prueba; el precio está en la pestaña de precios |
| Exportar a Word | Una página que necesitas en un editor | Un `.docx` de una sola página | Gratis, sin permisos especiales |
| Exportar a PDF | Mandarle una página a alguien | Una página representada y estática | Gratis, sin permisos, y sin camino hacia Markdown |

## Las opciones, una a una

### La exportación HTML de espacio de Confluence, y luego cualquier conversor de HTML a Markdown

Este es el punto de referencia contra el que se miden todas las demás opciones gratuitas, y son dos cosas gratuitas seguidas más que una herramienta. Desde la barra lateral del espacio: Más acciones, Configuración del espacio, General, Exportar espacio, HTML. Vuelve un zip con un archivo HTML representado por página, una carpeta de adjuntos y un índice que enumera las páginas. Convertir eso es una [conversión de HTML a Markdown](/blog/convert-html-to-markdown) corriente, sin ningún paso específico de Confluence.

| A favor | En contra |
| --- | --- |
| Gratis, sin cuenta, sin instalar y sin ninguna aplicación que aprobar | Permiso de administrador del espacio, que es la barrera con la que choca casi todo el mundo |
| Marcado de verdad: encabezados, listas, tablas y enlaces sobreviven como elementos | El zip solo contiene lo que la cuenta que exporta puede ver |
| Los adjuntos van empaquetados junto a las páginas que los referencian | Los nombres de archivo están generados por una máquina; el árbol de páginas vive solo en el archivo de índice |
| No depende de nada que pueda cambiar de precio o irse del Marketplace | Las entradas de blog no se incluyen en la exportación HTML |

**Precio:** gratis. La exportación forma parte de Confluence, y todos los conversores que merece la pena apuntar al resultado son también gratuitos.

**Detalles técnicos.** El HTML exportado es denso —estilos en línea, `div`s envoltorios de macros, `span`s de iconos sin texto—, que es por lo que el segundo paso pide un analizador de HTML de verdad y no un script que borra signos de mayor y menor. El archivo de índice es el único sitio donde existe la jerarquía de páginas, porque los nombres de archivo son planos y llevan ids generados en vez de títulos. Si tu destino necesita carpetas que reflejen el árbol del wiki, ese mapeo te toca construirlo a ti a partir del índice.

**¿Para quién es?** Para quien tenga permisos de administrador de espacio o conozca a alguien que los tenga, y para quien quiera una vía sin dependencias permanentes.

### El conversor de navegador — suelta el zip de la exportación y sale un documento

Una vez que tienes ese zip, el camino gratuito más corto es entregar el archivador entero a un conversor que lo lea directamente. [La conversión de Confluence a Markdown de TransformPipe](/confluence-to-markdown) coge el zip de la exportación tal y como sale de Confluence, convierte el HTML de cada página con el mismo conversor que hay detrás de su página de HTML a Markdown y lo fusiona todo en un solo documento con un índice arriba.

| A favor | En contra |
| --- | --- |
| Sin descomprimir, sin recorrer directorios, sin leer el archivo de índice a mano | Sale un documento, no un archivo por página — la forma equivocada para un sitio de documentación |
| El índice se genera a partir del título de cada página | El índice son títulos llanos, no enlaces |
| Funciona en el navegador; sin sesión iniciada, el zip no se sube a ninguna parte, y un adjunto que sea imagen se lleva dentro del documento | Un adjunto que no sea imagen conserva su enlace, que sigue pidiendo una sesión de Confluence |
| Gratis, sin cuenta, sin instalar, sin nada que tenga que aprobar un administrador | El orden de las páginas sigue las rutas del archivador, no la jerarquía del wiki |

**Precio:** gratis. Una cuenta añade historial, compartir y una API, también gratis.

**Detalles técnicos y funciones**

- Se lee cada entrada `.html`, se saltan los directorios y las entradas vacías, y las entradas se ordenan por ruta, así que dos exportaciones del mismo espacio producen el mismo documento en el mismo orden
- El título de cada página sale de su propio elemento `<title>`, y si no lo hay del nombre del archivo con el id numérico final quitado y los separadores devueltos a espacios, de modo que una página cuya exportación no conservó ningún título aterriza igualmente en el índice de forma legible
- Una página que ya abre con su propio título como encabezado no lo recibe dos veces; el duplicado se descarta antes de fusionar
- Las páginas se unen con una línea horizontal, la misma convención que se usa al fusionar a mano varios archivos subidos
- La descompresión es `fflate`, JavaScript puro sin enlaces nativos, lo que permite que el mismo código corra en una pestaña del navegador y en el servidor para quienes llaman a la API

**¿Para quién es?** Para un espacio que se archiva, un wiki entregado a un equipo nuevo como un solo documento, o el caso en que alguien te ha mandado un zip de exportación y quieres leerlo sin instalar nada. No es la herramienta si cada página tiene que seguir siendo su propio archivo con su propia URL.

### Pandoc — gratis, y la respuesta correcta para una migración masiva

Pandoc lee `html` y escribe `gfm`, `commonmark` y `markdown_strict` entre muchos otros, lo que convierte la segunda mitad de la vía de exportar y convertir en un bucle de shell (consultado en pandoc.org, 14 de septiembre de 2026). Es la opción gratuita que escala, para cuando la salida tiene que ser cientos de archivos con una estructura que controlas tú.

| A favor | En contra |
| --- | --- |
| Gratis y con licencia GPL, sin cuenta y sin ningún servicio detrás | Una instalación, y grande |
| `-t gfm` te da el sabor de Markdown que esperan GitHub y la mayoría de generadores de sitios estáticos | Ningún conocimiento de Confluence: los `div`s envoltorios pasan tal como estaban en el HTML |
| `--extract-media` saca el contenido multimedia enlazado a un directorio y reescribe las referencias | El bucle, la nomenclatura y la estructura de carpetas los escribes tú |
| También tiene un lector `jira` para el marcado wiki de Jira y Confluence | Ese marcado wiki no es lo que almacena una página moderna de Cloud |

**Precio:** gratis, con licencia GPL.

**Detalles técnicos y funciones**

- `pandoc -f html -t gfm page.html -o page.md` es la conversión entera de una página; un bucle sobre el directorio de la exportación es la conversión entera de un espacio
- `--wrap=none` evita que Pandoc corte las líneas a un ancho de columna, cosa que importa si el resultado aterriza en un repositorio donde las diferencias deberían verse frase a frase
- `--extract-media=media` extrae el contenido multimedia referenciado por el origen y ajusta las referencias para que apunten a los archivos extraídos — lo más parecido a un arreglo gratuito para las URLs de adjuntos de Confluence, que dependen de la sesión
- El formato `jira` figura como entrada y como salida, descrito como marcado wiki de Jira y Confluence — útil para páginas antiguas de Server escritas así, y no una vía para páginas de Cloud, que se guardan en el formato de almacenamiento basado en XHTML
- `gfm` es la variante que hay que pedir si importan las tablas; `markdown_strict` no tiene sintaxis de tablas en absoluto

**¿Para quién es?** Para quien mueva un wiki a un repositorio una vez y bien hecho — donde el resultado es un árbol de directorios, un esquema de nombres y una compilación que se regenera limpiamente. Una migración que vayas a ejecutar dos veces debería ser un script, y este es el script.

### Un script con turndown — gratis, cuando necesitas que las reglas sean tuyas

Turndown es una biblioteca de JavaScript que convierte HTML a Markdown, con licencia MIT, y acepta cadenas de HTML o nodos del DOM (consultado en github.com/mixmark-io/turndown, 14 de septiembre de 2026). La razón para programar alrededor de ella en vez de ejecutar Pandoc es que el HTML exportado por Confluence tiene formas reconocibles dentro —paneles de macro, envoltorios de bloques de código, macros de expandir— y turndown te deja añadir una regla por forma.

| A favor | En contra |
| --- | --- |
| Gratis, MIT, y una dependencia en vez de una instalación | Estás escribiendo un programa, con todo lo que eso implica |
| Las reglas pueden buscar los propios nombres de clase de Confluence y emitir exactamente lo que quieres | Cada regla es un pasivo de mantenimiento en cuanto cambia la representación de Confluence |
| `turndown-plugin-gfm` añade tablas y tachado sobre las reglas del núcleo | Turndown sin ese plugin no emite tablas |
| Corre en cualquier sitio donde corra Node, CI incluido | Necesita un DOM: en Node eso significa proporcionarle uno |

**Precio:** gratis, con licencia MIT.

**Detalles técnicos y funciones**

- Una regla es un filtro más una función de reemplazo, así que convertir `div.confluence-information-macro-note` en una cita en bloque son unas pocas líneas y no una pasada de posprocesado sobre la salida
- Como turndown acepta nodos del DOM, un script puede podar antes de convertir — quitando los `span`s de iconos y el mobiliario de navegación que un conversor genérico transforma fielmente en líneas vacías sueltas
- El plugin de GFM es la pieza que hay que añadir primero: las tablas son lo más habitual en un wiki exportado, y la biblioteca base las deja como HTML

**¿Para quién es?** Para una migración donde la salida tiene que ajustarse a una guía de estilo existente, o donde una macro aparece en doscientas páginas y tiene que salir igual todas las veces. Para una conversión puntual es más trabajo del que justifica el resultado.

### Aplicaciones del Atlassian Marketplace — lee la palabra que hay encima del botón

Varias aplicaciones exportan páginas de Confluence a Markdown desde dentro de Confluence, sin exportación HTML intermedia. Aquí es donde «gratis» exige más cuidado, porque el Marketplace muestra dos cosas distintas casi en el mismo sitio: una ficha encabezada por **Free app** es gratuita, y una encabezada por **Try it free** es una prueba con un precio en la pestaña de precios.

Hoy están presentes ambas. Listadas como aplicaciones gratuitas: «Markdown Exporter for Confluence (API, Bulk & Attachments)» de Yamuno Software US, y «Markdown | Source Editor | Markdown Exporter (FREE)» de Agilva Solutions. Listadas como Try it free: «Easy Markdown Exporter for Confluence» de AppLiger, «Markdown Exporter for Confluence» de Narva Software, «Export to Markdown for Confluence Cloud» de Atly Apps, e «Instant Markdown Exporter for Confluence» de Philip Lindner, que declara una prueba gratuita de 30 días (todas consultadas en marketplace.atlassian.com, 14 de septiembre de 2026).

| A favor | En contra |
| --- | --- |
| Markdown directamente, sin un paso aparte de exportar y convertir | Instalar una aplicación es una decisión de administrador, no del autor de una página |
| Algunas reescriben los enlaces a rutas relativas y conservan el árbol de páginas, cosa que la vía gratuita no hace | Una ficha que dice Try it free es una prueba, y el precio está a una pestaña de distancia |
| Trabajan sobre el contenido en vivo, así que nada es una instantánea del día de la exportación | Las fichas, los proveedores y los precios de esta categoría cambian a menudo |
| Las aplicaciones Forge corren dentro de tu propio entorno de Atlassian | Una aplicación es una dependencia permanente que alguien tiene que mantener |

**Precio:** varía, y el encabezado de la ficha es la señal más rápida — Free app o Try it free (consultado en marketplace.atlassian.com, 14 de septiembre de 2026). Consulta la ficha actual y no ningún artículo, este incluido: es la parte con más probabilidades de haber quedado desfasada cuando lo leas.

**Detalles técnicos.** Las diferencias que merece la pena comparar son las que la vía gratuita no puede hacer en absoluto: si la jerarquía de páginas se conserva como carpetas, si los adjuntos bajan con las páginas y si los enlaces internos se reescriben a rutas relativas para que el resultado se pueda navegar sin conexión. Esas tres cosas son el producto de verdad; convertir HTML a Markdown es la parte de mercancía común, y la razón de que existan tantas de estas aplicaciones con tan poco entre ellas.

**¿Para quién es?** Para equipos que instalan aplicaciones del Marketplace de forma rutinaria y quieren la exportación a Markdown como una capacidad permanente. Para una única migración, la vía de exportar y convertir te lleva hasta el final sin una conversación de compras.

### Exportar a Word o a PDF — gratis, sin permisos, y un callejón sin salida

Estas son las dos exportaciones disponibles para cualquiera que pueda leer una página, que es por lo que son lo primero que prueba la gente cuando la exportación HTML aparece en gris. Están aquí por honestidad, no como recomendación.

| A favor | En contra |
| --- | --- |
| Sin más permiso que el de leer la página | Una página cada vez; no hay una versión a escala de espacio de ninguna de las dos que ayude |
| Gratis, integrado, dos clics | El PDF es salida representada — la estructura ya no está antes de que la vea ningún conversor |
| Un `.docx` al menos conserva encabezados, listas y tablas como estructura | Los encabezados de Word son tan buenos como lo sea el uso de estilos de encabezado reales en la exportación |
| Perfecto cuando el destino era Word o PDF desde el principio | Los comentarios nunca se incluyen en una exportación a PDF |

**Precio:** gratis.

**Detalles técnicos.** La vía del `.docx` no es desesperada — un documento de Word tiene un modelo documental de verdad, y [convertirlo a Markdown](/blog/best-word-to-markdown-converters) recupera encabezados, listas y tablas. Es el camino largo: del formato de almacenamiento a Word y de Word a Markdown, perdiendo algo en cada salto, donde de HTML a Markdown es un salto con menos pérdida. El PDF sí es genuinamente un callejón sin salida, porque un PDF describe dónde va la tinta en una página y la estructura de encabezados que necesita Markdown ya no existe dentro.

**¿Para quién es?** Para alguien con una página, sin permisos de administrador de espacio y sin ganas de abrir un ticket. Para esa persona, la exportación a Word más una conversión de Word a Markdown es una vía gratuita legítima, y merece la pena decirlo en vez de fingir que la única respuesta correcta exige un permiso que no tiene.

## Dónde falla la opción gratuita obvia

La vía de exportar y luego convertir es la recomendación de este artículo, así que merece una sección sobre dónde no se sostiene. Hay cuatro sitios, y tres no son culpa del conversor.

**Produce archivos, y los archivos no son un wiki.** Un espacio de Confluence es un árbol con enlaces cruzados. La exportación HTML aplana ese árbol en un directorio de nombres de archivo generados, y todos los conversores que vengan después heredan ese aplanado. Te quedas con el contenido y pierdes la navegación, salvo que la reconstruyas tú desde el índice. Las aplicaciones del Marketplace que anuncian «conserva la jerarquía» están anunciando justo lo único que la vía gratuita no hace.

**Los enlaces entre páginas no sobreviven al traslado.** Un enlace de una página a otra era una URL de Confluence, y después de la conversión lo sigue siendo — correcto si Confluence se queda, equivocado si esto es una migración fuera de ella. Reescribir esos enlaces exige un mapeo de página a nueva ruta de archivo, y ese mapeo no existe hasta que has decidido la disposición de los archivos. Es la mayor pieza de trabajo manual en una migración real.

**Los adjuntos apuntan a una sesión.** Los enlaces en línea a adjuntos de Confluence apuntan a su propio punto de descarga, que espera que hayas iniciado sesión, así que una página que se ve completa en tu navegador tiene las imágenes rotas para todos los demás. La exportación de espacio empaqueta los archivos en el zip precisamente por esto; el arreglo es reapuntar los enlaces a esas copias locales. El `--extract-media` de Pandoc llega a medio camino; el resto es un buscar y reemplazar que escribes tú.

**Lo que era una macro ahora es una instantánea.** Cualquier cosa que fuera una consulta en vivo —una macro de incidencias de Jira, una página incluida, un árbol de páginas— se exportó como lo que representara ese día, y ningún conversor puede restaurar un comportamiento que nunca estuvo en el archivo. El [artículo de cómo hacerlo](/blog/convert-confluence-page-to-markdown) tiene la tabla macro por macro si necesitas eso antes de comprometerte.

Y una sobre lo gratuito más que sobre la estructura: **un conversor gratuito que sube tu wiki es un conversor gratuito que ahora tiene tu wiki.** La documentación interna guarda nombres de clientes, arquitectura y análisis de incidentes — la mitad de las cosas que una empresa preferiría no entregar a un servicio que nadie ha evaluado. La conversión en el navegador y las herramientas locales de línea de comandos son las dos formas donde la pregunta ni se plantea, y la diferencia no aparece en ninguna tabla de funciones; se comprueba mirando el panel de red. Si [un conversor online es seguro](/blog/is-an-online-converter-safe) merece diez minutos antes de soltar la exportación de un espacio en cualquier parte.

## Cómo elegir

1. **Resuelve la cuestión de los permisos antes de comparar nada.** Sin permisos de administrador de espacio, la exportación HTML no está a tu alcance, y una aplicación del Marketplace necesita a un administrador del sitio que la instale. Los dos caminos empiezan pidiéndole algo a alguien, y cuál de las dos personas es más fácil de alcanzar decide tu ruta más que ninguna función.
2. **Decide primero la forma de la salida.** ¿Un documento para leer, o un directorio de archivos? Un documento es soltar un archivo en un conversor que fusiona. Un directorio es Pandoc o un script, y una decisión sobre la disposición de carpetas antes de empezar.
3. **Cuenta las páginas.** Por debajo de diez, el trabajo manual sale más barato que la automatización, y la exportación a Word de una sola página es una respuesta gratuita legítima. Por encima de cien, solo sobrevive una vía con scripts, porque los arreglos a mano posteriores ya se van a comer tu paciencia.
4. **Comprueba si el contenido puede salir de la máquina.** La documentación interna normalmente no puede, lo que descarta cualquier conversor alojado que suba archivos y deja la conversión en el navegador, una herramienta local o una aplicación Forge corriendo en tu propio entorno de Atlassian.
5. **En el Marketplace, lee el encabezado y luego la pestaña de precios.** Free app y Try it free están en el mismo sitio y significan cosas distintas. Confirma también el alcance: una aplicación que exporta gratis una página es un producto distinto de una que exporta un espacio.
6. **Convierte una página difícil antes de convertir cuatrocientas.** Escoge la página con más macros, la tabla más ancha y más adjuntos, y lee el resultado con atención. Todo lo que va a salir mal en el espacio entero ya es visible en ese único archivo.

## Conclusión

El conversor gratuito de Confluence a Markdown que funciona para casi todo el mundo no es una herramienta: es la exportación HTML de espacio de la propia Confluence seguida de una conversión gratuita a tu elección. Esa vía no cuesta nada, no depende de nada que pueda cambiar de precio y funciona igual en Cloud, en Server y en Data Center. Su precio es un permiso —administrador de espacio— y decirlo con claridad es más útil que cualquier comparativa de funciones, porque para buena parte de la gente que busca esta frase el permiso es el problema entero y no lo resuelve ningún conversor.

A partir de ahí la elección es fácil. Un documento legible salido del zip de una exportación de espacio es soltar un archivo en [la conversión de Confluence de aquí](/confluence-to-markdown), gratis, con el zip quedándose en tu máquina cuando no has iniciado sesión. Un repositorio lleno de archivos es Pandoc en un bucle, o turndown con las reglas que escribiste tú. Y en el Marketplace, gratis significa lo que diga el encabezado de la ficha y nada más — algo que conviene comprobar hoy en vez de fiarse de un artículo, este incluido.

## Preguntas frecuentes

### ¿Existe un conversor de Confluence a Markdown genuinamente gratuito?

Sí, más de uno, pero la parte gratuita rara vez es el conversor en sí. La exportación HTML de espacio de Confluence es gratuita y necesita permiso de administrador del espacio; convertir esa exportación es gratis con Pandoc, con un script de turndown o con un conversor de navegador que acepte el zip directamente. En el Marketplace, algunas aplicaciones figuran como gratuitas y otras muestran Try it free, que es una prueba.

### ¿Puedo convertir Confluence a Markdown sin ser administrador?

A escala de espacio, no. Las exportaciones a HTML, XML y CSV son operaciones de nivel de espacio que necesitan permiso de administrador del espacio, e instalar una aplicación del Marketplace también necesita a un administrador. Para una sola página que ya puedes leer, la exportación a Word más una conversión de Word a Markdown es una vía gratuita que no requiere ningún permiso adicional.

### ¿Por qué la exportación gratuita no incluye todas las páginas?

Porque la exportación de un administrador de espacio contiene solo lo que su cuenta puede ver — las páginas restringidas están ausentes del zip, sin ningún aviso. Un administrador del sitio que ejecute la misma exportación obtiene todo con independencia de la visibilidad (consultado en support.atlassian.com, 14 de septiembre de 2026). Si a una migración le faltan cosas, comprueba eso primero.

### ¿Una aplicación gratuita de Confluence a Markdown conserva la jerarquía de páginas?

Algunas sí, y es lo principal que merece la pena comparar entre ellas, porque la vía de exportar y convertir no lo hace: la exportación HTML aplana las páginas en nombres de archivo generados y conserva el árbol solo en un archivo de índice. Mira en cada ficha la jerarquía, los adjuntos y la reescritura de enlaces relativos — esas tres cosas son las que separan a estas aplicaciones.

### ¿Cuál es la forma gratuita más rápida de leer un espacio de Confluence sin conexión?

Exporta el espacio a HTML y entrégale el zip a un conversor que lo fusione en un solo documento con su índice. Eso te ahorra descomprimir, el archivo de índice y cualquier decisión sobre la estructura de carpetas, a cambio de las fronteras de archivo por página, que no importan si el objetivo es leer.

### ¿Debería usar Pandoc o un conversor de navegador para esto?

Pandoc si la salida son muchos archivos con una disposición que controlas tú, porque escala y se programa. Un conversor de navegador si la salida es un solo documento y lo quieres sin instalar nada. Los dos son gratuitos y los dos funcionan en local; la diferencia es la forma que necesitas al final, no la calidad de la conversión.

### ¿Los nombres de aplicaciones del Marketplace de este artículo están al día?

Son los que mostraban las fichas el 14 de septiembre de 2026, y esta categoría cambia más rápido que la mayoría. Los proveedores entran y salen, los planes gratuitos aparecen y se cierran, y las pestañas de precios se mueven con independencia de los encabezados de las fichas. Toma los nombres como punto de partida y lee la ficha actual antes de decidir nada.
