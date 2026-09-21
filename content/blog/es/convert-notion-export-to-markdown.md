---
title: "Convertir una exportación de Notion a Markdown: todas las vías, con los ids incluidos"
description: "Cómo convertir el zip «Exportar como Markdown y CSV» de Notion en Markdown limpio: el id en cada nombre, qué arregla un script y qué solo arregla fusionar"
date: 2026-09-14
tag: Conversión
keywords: exportar notion a markdown, convertir notion a markdown, notion a md, notion api markdown, exportación de notion con ids, quitar ids de notion, zip de notion a markdown
---

El botón de exportar de Notion dice «Markdown y CSV» y entrega un zip que, en sentido estricto, dice la verdad. Ábrelo y cada archivo es Markdown de verdad: encabezados, listas, enlaces, todo legible en cualquier editor. Lo que no dice es que cada nombre de archivo y cada enlace entre páginas lleva ahora un id hexadecimal de 32 caracteres, que una base de datos salió como un CSV aparte al que tus archivos Markdown no hacen referencia, y que la exportación es una instantánea de un momento concreto, no una copia viva de nada.

Nada de eso es un fallo. Notion identifica una página por su id y trata el título como una etiqueta que puede cambiar, así que la exportación tiene que guardar el id en algún sitio estable — y ese sitio es el nombre del archivo. El problema está completamente más adelante: una carpeta de archivos que se señalan entre sí por id le sirve a Notion y es ilegible como destino de una migración hasta que algo reescribe esos punteros.

### Resumen rápido

Solo tres vías funcionan de verdad. **Exportar como Markdown y CSV, y luego reescribir los ids** es la vía general: descomprimir, construir un mapa del sufijo de id de cada archivo al nombre que realmente quieres, y reescribir desde ese único mapa cada enlace y cada nombre de archivo. Es trabajo manual con diez páginas y un script con mil. **`notion-to-md`**, un paquete de Node de código abierto que lee páginas por la propia API de Notion, encaja mejor en una cadena programada o en la compilación de un sitio estático, porque nunca llega a producir esos nombres de archivo con id, ya que tú mismo pones el nombre de salida. **Subir el zip de la exportación directamente a un conversor que lo fusiona** —[la conversión de Notion a Markdown de TransformPipe](/notion-to-markdown) es una de ellas— evita el problema del id por una tercera vía: cada página pasa a ser una sección de un único documento, en orden, con un índice, y un enlace entre páginas conserva las palabras que mostraba en vez de apuntar a un archivo que ya no existirá. Elige la primera para una carpeta de archivos separados que vas a mantener, la segunda para automatizar, la tercera para un documento que leer o compartir.

Sea la vía que sea, tres cosas no sobreviven a ninguna de ellas: los comentarios, porque son una discusión pegada a la página y no contenido de la página; las vistas no predeterminadas de una base de datos, porque Notion solo exporta la vista que tienes abierta; y los bloques sincronizados, que salen como su contenido en cada sitio donde se mostraban, duplicados, sin ninguna marca de que alguna vez fueron el mismo bloque.

## Por qué el id está ahí, y por qué no desaparece solo

Una página de Notion queda identificada por un UUID en el momento en que se crea. El título es un metadato pegado a ese id, editable en cualquier momento, y no aparece en ningún sitio donde la exportación necesite buscar una página por él. Así que cuando la exportación escribe `Meeting notes.md`, no tiene ninguna garantía de que ese nombre sea único — dos páginas tituladas «Meeting notes» existen en la mayoría de los espacios de trabajo con más de un año—, y lo resuelve escribiendo el id en cada nombre de archivo que produce.

```text
Meeting notes 21f4c8a1b2c34d5e8f90123456789abc.md    the file on disk
Meeting%20notes%2021f4c8a1b2c34d5e8f90123456789abc.md    the link another page uses to reach it
meeting-notes.md    what you actually want to keep
```

Un enlace de una página a otra está escrito contra el nombre de archivo exacto, codificado con porcentajes para el espacio. Renombra el archivo para quitar el id y cada enlace que apuntaba al nombre antiguo se rompe — en silencio, porque un enlace relativo muerto en una carpeta de archivos Markdown no produce ningún error hasta que alguien hace clic. Ese es el problema de migración completo: el renombrado y la reescritura de enlaces tienen que pasar juntos, desde un único mapa, en una sola pasada.

## El diálogo de exportación, y los límites que no anuncia

La exportación de Notion vive bajo el menú de la página o del espacio de trabajo como «Export», con un formato a elegir entre PDF, HTML o Markdown y CSV, un desplegable «Include content» que puede excluir archivos e imágenes, un interruptor «Include subpages» y otro «Create folders for subpages» (comprobado en notion.com, el 9 de septiembre de 2026). Tres límites de esa misma pantalla importan antes de planear una migración alrededor de ella:

- Solo se exporta la vista actual o la predeterminada de una base de datos. No hay forma de exportar todas las vistas a la vez, y una vista de formulario no se puede exportar en absoluto — sale la vista de tabla en su lugar.
- Una exportación grande llega por correo como enlace de descarga en vez de empezar al momento, el enlace caduca a los siete días, y el procesamiento puede tardar hasta treinta horas.
- Las subpáginas se exportan como carpetas anidadas cuando el interruptor está activado, que es lo que hace que merezca la pena conservar la estructura de carpetas del zip en vez de aplanarla.

Ese tiempo de procesamiento es un dato de planificación, no una nota a pie de página. «Exportar el espacio de trabajo el viernes por la tarde, convertirlo el viernes por la noche» supone una exportación que termina en minutos; para un espacio de trabajo grande puede no ser así.

## Comparativa rápida: tres vías y lo que cuesta cada una

| Vía | Mejor para | Conserva | Pierde | Instalación |
| --- | --- | --- | --- | --- |
| Exportar como Markdown y CSV, reescribir los ids a mano o con un script | Una carpeta de archivos separados que vas a seguir editando | Cada página, la estructura exacta, las filas de la base de datos como CSV | Comentarios, vistas no predeterminadas, la identidad de los bloques sincronizados | Ninguna, o un script corto |
| `notion-to-md` a través de la API de Notion | Un paso de compilación, un sitio estático, una sincronización programada | Lo que tú mismo escribas en tu propio renderizador | Lo mismo de arriba, más cualquier cosa que tu renderizador no implemente | Node, un token de integración |
| Subir el zip de la exportación directamente (TransformPipe) | Un documento para leer o compartir | Cada página en orden, un índice, las filas de la base de datos como tabla | Las direcciones de los enlaces entre páginas, comentarios, vistas no predeterminadas | Ninguna |
| Copiar una página, pegarla en un editor | Un puñado de páginas, una sola vez | El formato que entienda el destino del pegado | Todo lo relativo a la escala — esto no aguanta más allá de unas pocas páginas | Ninguna |

## Exportar como Markdown y CSV, y luego arreglar los ids

Esta es la exportación descrita arriba, y la manera honesta de usarla es tratar el id como un dato en lugar de como ruido: es lo único del zip que identifica una página de forma única y permanente, así que es la clave de unión para el renombrado.

```text
1. Unzip the export.
2. Walk every .md and .csv filename, split off the trailing id, build id -> new-name.
3. Rewrite every filename using the map.
4. Walk every file's content, find links matching the export's own href pattern,
   look up the id in the same map, rewrite the href to the new name.
5. Flatten or keep the folder structure, depending on where the files are going.
```

| A favor | En contra |
| --- | --- |
| Ninguna dependencia nueva, ninguna cuenta, ningún token de API | El renombrado y la reescritura de enlaces tienen que ser una sola pasada sobre un solo mapa, o la mitad de los enlaces se rompen |
| Funciona sin conexión, sobre archivos que ya tienes | El `.csv` de una base de datos no se une automáticamente de nuevo a la página a la que pertenecía |
| La vía más segura cuando el destino es una carpeta de archivos que deben conservar su propio nombre | Diez páginas a mano cuestan una tarde; mil páginas a mano no es realista |

**Detalles técnicos.** El id son 32 caracteres hexadecimales en minúscula, separados del título por un espacio (a veces un guion bajo, según la versión del cliente que produjera la exportación). Una expresión regular anclada al final del nombre de archivo —quitando antes la extensión, y luego buscando el id final— separa las dos partes de forma fiable. Los enlaces dentro del Markdown son relativos y llevan la misma codificación de porcentajes que el nombre de archivo, así que la misma expresión regular, aplicada después de decodificar la URL, encuentra también el id dentro de un enlace. El `.csv` de una base de datos se guarda junto a la carpeta de la página que la contenía, con el mismo esquema de nombre y su propio sufijo de id; unirlo a la página a la que pertenece es una coincidencia de nombres de archivo, algo que la exportación no registra de ninguna otra manera.

**¿Para quién es?** Para cualquiera cuyo destino sea una carpeta de archivos Markdown que necesitan seguir funcionando como archivos separados — un sitio de documentación con una página por URL, una importación a un wiki donde cada página se convierte en una entrada propia. La salida son archivos reales con nombres reales; lo que cuesta es hacer bien la reescritura una vez.

**Una versión mínima del script**, esbozada en lugar de como programa completo, porque lo que importa es la forma y no el lenguaje:

```text
map = {}
for file in list(export_folder, recursive=true):
    id = extract_trailing_hex(file.name_without_extension)
    map[id] = slugify(file.name_without_extension_or_id)

for file in list(export_folder, recursive=true):
    text = read(file)
    text = replace_all(text, LINK_PATTERN, (id) => map[id] ?? id)
    write(new_path_for(file, map), text)
```

`LINK_PATTERN` es una expresión regular sobre la propia forma de enlace de la exportación — un href relativo que termina en `.md` o `.csv`, codificado con porcentajes, con el mismo id hexadecimal final que lleva el nombre de archivo. El detalle que suele pillar a la gente: hay que ejecutar la extracción del id sobre el href ya decodificado, no sobre el crudo con porcentajes, porque `%20` no va a coincidir con un patrón escrito para un espacio literal.

**Las bases de datos merecen su propia pasada.** Una base de datos de página completa se exporta como un `.csv` junto a una carpeta con un `.md` por cada fila que tuviera cuerpo de página, y cada archivo de fila lleva su propio sufijo de id igual que una página. Reconstruir «la tabla, con un enlace a la página más completa para cualquier fila que la tuviera» es una unión entre las filas del CSV y los nombres de archivo de la carpeta, emparejados por la columna que Notion usara como título de página — algo que ni el CSV ni los archivos de fila registran de forma explícita como relación.

## `notion-to-md`: evitar el problema del id no escribiéndolo nunca

Notion también publica una API oficial, y leer las páginas a través de ella en lugar del botón de exportar evita el problema del nombre de archivo por completo, porque nada en la API obliga a meter un id en un nombre — eres tú quien llama a `writeFileSync` al final. [`notion-to-md`](https://github.com/souvikinator/notion-to-md) es el paquete de código abierto que se usa habitualmente para esto: Node, código abierto, lee el árbol de bloques de una página a través de la API y lo convierte a Markdown, MDX o algún otro destino. Tú eliges el nombre de archivo de salida, así que no hay nada que reescribir después.

| A favor | En contra |
| --- | --- |
| Nunca hay sufijo de id en la salida — pones tú cada nombre de archivo | Necesita un token de integración y acceso a la API, un paso de configuración que el botón de exportar no exige |
| Encaja de forma natural en un script de compilación o una sincronización programada | Una página a la vez, por id o por consulta de base de datos; recorrer todo un espacio de trabajo es recursión tuya |
| Se ejecuta en CI sin navegador ni exportación manual | Renderiza bloques que tienes que mapear tú mismo para cualquier cosa que salga del conjunto habitual — una vista de base de datos, un bloque sincronizado — las mismas pérdidas que la exportación |

**Precio:** gratis, código abierto — la licencia merece comprobarse antes de depender de ella, porque los metadatos publicados del paquete y el propio archivo `LICENSE` del repositorio no coinciden actualmente (comprobado en npmjs.com y github.com, el 14 de septiembre de 2026).

**Detalles técnicos:** el paquete pide los hijos de una página como bloques a través de la API de Notion y convierte ese árbol de bloques a Markdown, con enganches para tratar los tipos de bloque que no cubre por defecto. Necesita una integración creada en la propia configuración de Notion, y que esa integración esté compartida con las páginas o bases de datos que se van a leer — un paso de permisos, no de código, y el único punto en el que esta vía es más lenta de arrancar que pulsar Exportar.

La propia API tiene un límite de tres peticiones por segundo de media por integración, más el límite compartido del espacio de trabajo por encima de eso (comprobado en developers.notion.com, el 14 de septiembre de 2026); una petición que supera el límite recibe un 429 con una cabecera `Retry-After` en lugar de los datos, así que un script que recorra más de unas pocas decenas de páginas necesita el bucle de esperar y reintentar desde el principio, no añadido después del primer fallo. Para una sola página o una base de datos pequeña esto nunca importa; para un espacio de trabajo entero es la diferencia entre un script que termina y uno que parece colgado.

**¿Para quién es?** Para un sitio estático que trae su contenido de Notion en cada compilación, una tarea programada que refleja un espacio de trabajo en un repositorio git, o cualquier caso donde «exportar a mano periódicamente» sea la forma equivocada de tratar un contenido que cambia todo el tiempo.

## Qué pasa con las imágenes, archivos y adjuntos

Cada vía trata los recursos de forma distinta, y merece la pena comprobarlo antes de confiar en cualquiera de ellas para una página con más imágenes que texto.

La exportación de Markdown y CSV escribe las imágenes de cada página en una carpeta junto a su `.md`, con nombres generados, a las que se llega desde el Markdown con rutas relativas codificadas con porcentajes — que solo se mantienen mientras la carpeta de imágenes viaje junto al archivo al que pertenece (la misma fragilidad [que siempre llevan las rutas relativas](/blog/images-and-links-that-still-work)). Mueve el `.md` por su cuenta y toda referencia a imágenes se rompe sin ningún aviso, porque nada comprueba que la carpeta haya venido con él.

`notion-to-md` devuelve los bloques de imagen como sintaxis Markdown de imagen normal, apuntando a las URLs temporales de archivo de la propia Notion, que caducan — el paquete no descarga el archivo por ti, así que un script que use esta vía necesita su propio paso para traer cada URL de imagen antes de que caduque y reescribir el Markdown para que apunte a una copia local.

Una vía de fusión y subida antes solo veía lo que decía el texto del zip, y una ruta relativa rota seguía igual de rota. Ahora las imágenes también se leen del archivo y se llevan dentro del propio documento, así que ya no queda ninguna ruta que romperse: la imagen viaja dentro del Markdown, dentro de la exportación a HTML y dentro de todo lo que se comparta desde ahí. El techo son dos megabytes de imágenes por documento y uno por imagen — un documento guardado tiene que caber en cuatro — y una imagen por encima conserva el enlace que tenía, que no es peor que antes.

## Subir el zip de la exportación directamente, fusionado en un solo documento

El problema del id de la propia exportación desaparece de una tercera manera si el destino nunca fue una carpeta de archivos separados: [la conversión de Notion a Markdown de TransformPipe](/notion-to-markdown) coge el zip de «Exportar como Markdown y CSV» sin modificarlo, fusiona cada página en un solo documento en su orden original con un índice generado, y convierte un enlace entre páginas en las palabras que mostraba en vez de en un nombre de archivo que ya no se resolverá una vez que las páginas sean secciones del mismo documento. Una base de datos vuelve como una tabla, dentro del mismo documento.

| A favor | En contra |
| --- | --- |
| Sin renombrar, sin mapa de ids, sin script | Produce un solo documento — no es la forma correcta si las páginas necesitan seguir siendo archivos separados con su propia URL |
| Cada página en orden, con un índice ya generado | Los enlaces entre páginas conservan su texto, no su dirección — ya no queda ningún sitio al que apuntar una vez fusionados |
| Se ejecuta en el navegador; el zip no se sube a ninguna parte si no has iniciado sesión | Las vistas no predeterminadas de base de datos y los comentarios siguen ausentes, porque la exportación nunca los tuvo |

**Precio:** gratis, se ejecuta en local, en el navegador.

**¿Para quién es?** Para cualquiera cuyo objetivo real fuera un documento legible — un wiki exportado que se convierte en un único archivo de entrega, un espacio de trabajo archivado como una sola cosa que leer más tarde— en vez de una carpeta de páginas que necesitan cada una su propia dirección.

## Dónde fallan las tres vías por igual

**Los comentarios.** Un hilo de comentarios está pegado a una página, no escrito dentro de su contenido, así que ninguna de las tres vías anteriores lo ve. Si una decisión solo existe como respuesta en un hilo de comentarios, cópiala al cuerpo de la página antes de exportar nada — después, no está simplemente sin convertir, está desaparecida.

**Las vistas de base de datos no predeterminadas.** Notion exporta la vista que tienes abierta, no todas las que tiene una base de datos. Una base de datos filtrada de tres maneras distintas para tres públicos distintos se exporta como una de esas tres, y las otras dos no se pueden recuperar de la exportación en absoluto — hay que reconstruirlas a partir de las filas subyacentes.

**Los bloques sincronizados.** Un bloque sincronizado muestra el mismo contenido en varios sitios a la vez dentro de Notion. La exportación no tiene concepto de «el mismo bloque, mostrado dos veces» — cada lugar donde apareció recibe su propia copia del contenido, así que editar una copia después de la migración deja de actualizar la otra, y nada en el archivo marca que alguna vez estuvieron enlazadas.

## Cómo elegir

1. **Decide primero la forma del destino.** Archivos separados con su propia URL quiere la vía de reescritura o `notion-to-md`. Un solo documento quiere la vía de fusión. Elegir después de convertir significa rehacer el trabajo.
2. **Pregúntate con qué frecuencia va a pasar esto.** Una vez, y la exportación manual con reescritura está terminada antes de que se aprobara siquiera una integración de API. Cada semana o en cada despliegue, y `notion-to-md` dentro de un paso de compilación se amortiza en menos de un mes.
3. **Comprueba si hay comentarios y vistas no predeterminadas antes de exportar, no después.** Ambos son invisibles en la salida sin ningún error que los señale, así que la única comprobación fiable es mirar el origen en Notion primero.
4. **Cuenta las páginas.** Diez páginas aguantan una reescritura de ids a mano. Cien quieren un script. Mil quieren la vía de la API, porque pulsar Exportar y esperar hasta treinta horas tampoco escala.

Si la pregunta es qué herramienta y no qué vía —todas estas son gratis, y lo que las separa es el coste de configuración y no el precio—, [la comparativa de conversores gratuitos de Notion](/blog/free-notion-to-markdown-converter) es la respuesta más corta.

## Conclusión

La exportación de Notion es Markdown honesto que lleva puesto un id que no puede quitarse solo. Reescribir ese id desde un mapa lo resuelve para una carpeta de archivos que necesita seguir siendo archivos; leer el espacio de trabajo por la API y poner tú los nombres de salida lo resuelve para cualquier cosa programada; y fusionar la exportación en un solo documento lo resuelve de una tercera manera, quitando la necesidad de que el id se resuelva a nada en absoluto. Lo que ninguna de las tres vías recupera es lo que la exportación nunca tuvo — un hilo de comentarios, una vista de base de datos que no estabas mirando, o la identidad de un bloque sincronizado—, así que la única comprobación que merece la pena hacer antes de exportar nada es confirmar que eso no te importa perder. [Sigue leyendo](/blog/markdown-from-notion-obsidian-and-confluence) sobre cómo se comparan Confluence y Obsidian en el mismo problema.

## Preguntas frecuentes

### ¿Puede Notion exportar directamente a Markdown limpio, sin el id en el nombre de archivo?

No a través del botón de exportar — Markdown y CSV añade siempre el id, porque el título solo no es un nombre de archivo fiable. La vía de `notion-to-md`, leyendo páginas por la API, es la manera de conseguir nombres de archivo propios, ya que los escribes tú en lugar de aceptar lo que produce una exportación.

### ¿Por qué mis enlaces exportados apuntan a nombres de archivo con códigos largos?

Porque Notion identifica las páginas por id, el título es solo una etiqueta, y la exportación escribe el id en el nombre de archivo para mantener los nombres únicos. El enlace y el nombre de archivo usan el mismo id, que es lo que hace posible una reescritura: construye un mapa de id al nombre que prefieras, y reescribe ambos juntos.

### ¿La exportación incluye vistas de base de datos distintas de la que tenía abierta?

No. Solo se exporta la vista actual o la predeterminada, y el propio diálogo de exportación de Notion no ofrece «todas las vistas» como opción. Una vista de formulario en concreto no se puede exportar en absoluto — exporta en su lugar la vista de tabla de la misma base de datos.

### ¿Se incluyen los comentarios de Notion en una exportación?

No, en ninguno de los formatos que ofrece Notion. Un comentario está pegado a una página como discusión, no guardado como contenido de la página, así que nunca llega a PDF, HTML ni Markdown y CSV. Copia todo lo relevante para alguna decisión al cuerpo de la página antes de exportar.

### ¿Qué le pasa a un bloque sincronizado cuando lo exporto?

Se exporta como contenido normal en cada sitio donde se mostraba, sin ninguna indicación de que las copias fueron alguna vez el mismo bloque. Editar una copia después de la migración no actualizará las demás, porque la relación de sincronización existía solo dentro de Notion.

### ¿Puedo convertir una exportación de Notion sin subir mi espacio de trabajo a ninguna parte?

Sí, si el conversor se ejecuta en el navegador en lugar de en un servidor — merece la pena confirmarlo para un espacio de trabajo con algo sensible, abriendo el panel de red y comprobando que no sale nada mientras convierte.

### ¿Cuánto tarda una exportación de Notion?

Las exportaciones pequeñas terminan al instante como descarga directa. Una grande se envía por correo como enlace en vez de descargarse enseguida, ese enlace caduca a los siete días, y la propia documentación de Notion admite que el procesamiento puede tardar hasta treinta horas — planea la exportación con tiempo de sobra respecto a la fecha límite que depende de ella, no la misma tarde.

### ¿Hay un límite de peticiones si leo un espacio de trabajo por la API en vez de exportarlo?

Sí: una media de tres peticiones por segundo por integración, más un límite aparte compartido por todo el espacio de trabajo. Un script que lea más de un puñado de páginas debería tratar una respuesta `429` esperando la duración indicada en su cabecera `Retry-After` y reintentando, en lugar de tratar el error como un fallo.
