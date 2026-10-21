---
title: "Cómo abrir un archivo .md en Windows, macOS, Linux, iOS y Android"
description: "Un archivo .md es texto plano, por eso al hacer doble clic se abre un editor de código o nada — cómo leerlo como texto, leerlo renderizado y fijar la app por defecto"
updated: 2026-10-21
date: 2026-09-02
tag: Conversión
keywords: cómo abrir un archivo md, qué es un archivo md, visor de archivos md, ver markdown en el navegador, abrir md sin instalar nada, lector de markdown online, extensión de archivo markdown
---

Descargaste un archivo llamado `README.md`, le hiciste doble clic, y pasó algo poco útil. Se abrió un editor de código. O Windows ofreció una lista de programas que nunca habías visto. O apareció una ventana en blanco llena de signos numerales y asteriscos. O no pasó nada, y tu teléfono dijo que ninguna app puede abrir ese archivo.

El archivo no está roto ni corrupto. Ningún sistema operativo trae de fábrica una aplicación que muestre Markdown como Markdown, y ese único hecho explica cada versión del problema — la app equivocada, ninguna app, y la app que sí lo abre y te muestra puntuación en vez de formato.

Hay dos cosas distintas que podrías querer, y la mayoría de los consejos que circulan las mezclan. Puede que quieras ver qué hay dentro del archivo, algo que cualquier ordenador que tengas ya sabe hacer. O puede que quieras leerlo como un documento, con encabezados de verdad, negritas y tablas, y eso necesita algo más. El camino cambia según cuál de las dos quieras, y cambia otra vez si estás en el móvil.

### Resumen rápido

Un archivo `.md` es texto plano, así que cualquier cosa que abra un archivo de texto lo va a abrir: el Bloc de notas en Windows, TextEdit en macOS, `less` en Linux. Si vas a leer y escribir este tipo de archivos con regularidad, [un editor de Markdown](/blog/best-markdown-editors) es la mejor respuesta. Eso te muestra la fuente, puntuación incluida. Para leerlo como un documento con formato en su lugar, suéltalo en un visor que funcione en el navegador, instala un editor con vista previa como VS Code u Obsidian, o súbelo a GitHub. Si tienes que enviárselo a otra persona, deja de buscar un visor y conviértelo a HTML una vez — un archivo `.html` se abre con doble clic en cualquier dispositivo con navegador, algo que no es cierto de `.md` en ningún sitio.

## ¿Qué es un archivo .md?

Texto plano. Esa es toda la respuesta.

Ábrelo en el Bloc de notas y ves cada carácter que contiene. No hay formato oculto, ni datos binarios, ni compresión, nada que un programa especial tenga que decodificar. Un archivo `.docx` es un archivo zip lleno de XML y sería ilegible en un editor de texto; un archivo `.md` es exactamente lo que parece. La extensión markdown solo te dice qué convención sigue el texto: Markdown, un conjunto pequeño de reglas para escribir formato con puntuación normal.

```markdown
## Release notes

**Version 2** fixes the login timeout.

- Faster start-up
- New export button

| Platform | Status |
| --- | --- |
| Windows | Shipped |
| macOS | In review |
```

Cada `#` marca un encabezado, y cuantos más pones, más pequeño se vuelve. Los asteriscos hacen negrita. Los guiones hacen una lista. Las barras verticales hacen una tabla. Las comillas simples invertidas encierran código. Alguien lo escribió así para que un programa pudiera convertirlo después en un documento con formato, pero el texto crudo se sigue leyendo por sí solo — eso es casi todo el sentido de Markdown, y la razón por la que aparece en READMEs, changelogs, apps de notas y en la salida de cualquier asistente de IA.

Vas a encontrar el mismo contenido bajo otras extensiones. `.markdown`, `.mdown`, `.mkd` y `.mdwn` son lo mismo con un nombre más largo o más antiguo; se abren igual y no significan nada distinto. `.mdx` es Markdown con componentes de JavaScript mezclados, así que sigue siendo texto pero va a contener etiquetas que ningún visor simple renderiza. `.rmd` es R Markdown, con fragmentos de código ejecutable. Si tienes uno de esos, todo lo de más abajo sigue aplicando para leerlo — solo la sintaxis extra se va a ver rara.

Lo único que confunde a la gente es la cabecera. Los archivos exportados de un generador de sitios estáticos, un build de documentación o una app de notas suelen empezar con un bloque delimitado por tres guiones:

```markdown
---
title: Quarterly plan
author: Priya
date: 2026-08-14
---
```

Eso es front matter YAML: metadatos para la herramienta que construyó la página, no parte del documento. Algunos visores lo ocultan, algunos lo renderizan como un párrafo de líneas `clave: valor` arriba de todo, y unos pocos lo convierten en tabla. Nada de eso es un error. Vale la pena reconocerlo, porque un documento que empieza con algo que parece sin sentido suele ser solo un archivo que salió de un generador.

## Por qué el doble clic hace algo raro

Cada sistema operativo de escritorio elige el programa que abre un archivo según su extensión, y cada uno falla de manera distinta cuando nada reclamó esa extensión correctamente.

**Windows no trae nada que registre `.md`.** Así que gana lo que se haya instalado último y haya levantado la mano. En un portátil de trabajo suele ser un editor de código, un cliente de Git, o alguna herramienta que llegó con las herramientas de desarrollo — y si nada la reclamó, aparece el diálogo «¿Cómo quieres abrir este archivo?» con una lista de aplicaciones y ninguna pista sobre cuál es la correcta. Ninguno de los dos resultados dice nada sobre tu archivo.

**macOS recurre a TextEdit**, que lo abre sin problema y te muestra la fuente. Eso parece un fallo y no lo es: TextEdit está haciendo justo su trabajo, que es mostrar texto. Selecciona el archivo y pulsa la barra espaciadora para Vista Rápida y por lo general obtienes lo mismo — los caracteres, no el formato.

**Linux depende de tu escritorio.** El tipo MIME del archivo suele detectarse como `text/markdown`, y si hay algo registrado como manejador de ese tipo varía según la distribución. Puedes comprobar qué cree tu sistema que está sosteniendo:

```bash
xdg-mime query filetype notes.md
xdg-mime query default text/markdown
```

El primer comando imprime el tipo, el segundo imprime la entrada de escritorio que lo va a abrir, o nada en absoluto si ninguna aplicación lo reclamó.

**Los teléfonos son más estrictos que todos los anteriores.** iOS y Android también deciden qué hacer con un archivo según su tipo, y si ninguna app instalada declara soporte para Markdown, el panel de compartir simplemente no ofrece nada útil. Android a menudo dice directamente que ninguna app puede abrir el archivo. Este es el lugar más común donde la gente se rinde, y el más fácil de arreglar, porque en el teléfono el navegador casi siempre es la respuesta.

Que un editor de código abra tus notas de una reunión no es señal de que el archivo contenga código. Significa que ese editor fue lo último que reclamó la extensión. Notas así suelen venir de una exportación, y el id largo en el nombre del archivo o la carpeta de imágenes al lado del archivo son la pista: [lo que producen Notion, Obsidian y Confluence, cada uno por su lado](/blog/markdown-from-notion-obsidian-and-confluence) decide si esas imágenes siguen funcionando una vez que el archivo se mueve a cualquier parte.

## Leer la fuente, o leerlo renderizado

Antes de instalar nada, decide cuál de estas dos quieres. Son problemas distintos con herramientas distintas.

**Leer la fuente** significa mirar los caracteres tal como se escribieron: `## Heading`, `**bold**`, las barras de una tabla. Para un archivo corto esto está completamente bien, y a menudo es mejor — puedes ver exactamente qué hay, incluidos los destinos de los enlaces, que una vista renderizada oculta detrás del texto del enlace. Cualquier máquina que tengas ya sabe hacer esto y no hay nada que instalar.

**Leerlo renderizado** significa ver el formato aplicado: encabezados en letra más grande, negrita como negrita, listas con sangría, tablas como cuadrículas, código en un bloque monoespaciado. Esto es lo que quieres para un documento largo, porque más allá de un par de pantallas la puntuación empieza a competir con las palabras. Las listas anidadas son el caso más claro: tres niveles de sangría con viñetas y números mezclados son difíciles de retener como texto crudo y evidentes una vez renderizados.

Hay una tercera cosa que se confunde con las dos anteriores, y es la que la gente en realidad necesita sorprendentemente a menudo: **convertirlo en un archivo que otra persona pueda abrir**. Eso es conversión, no visualización, y se trata más abajo. Si tu problema real es que un colega no puede abrir el `.md` que le enviaste, ningún visor de esta página va a ayudar — necesita un archivo distinto, no una app distinta.

## Comparativa rápida: todas las formas de abrir un archivo .md

| Opción | Mejor para | Qué ves | Precio |
| --- | --- | --- | --- |
| Bloc de notas, TextEdit, cualquier editor de texto | Comprobar qué contiene realmente el archivo | La fuente, puntuación incluida | Gratis, ya instalado |
| TransformPipe en el navegador | Leerlo renderizado y obtener un archivo de salida | Un documento con formato, convertido en tu propia máquina | Gratis |
| Extensión de navegador para Markdown | Abrir archivos `.md` locales en el navegador a menudo | Una página renderizada en una URL `file://` | Gratis, MIT |
| VS Code | Desarrolladores con el archivo ya en el editor | Fuente y vista previa lado a lado | Gratis |
| Obsidian | Leer una carpeta entera de Markdown con regularidad | Notas renderizadas; los archivos siguen siendo texto plano en el disco | Gratis para uso personal, comercial y sin fines de lucro |
| MarkText | Un lector de escritorio simple sin cuenta | Renderizado mientras escribes | Gratis, MIT |
| Typora | Escribir y leer Markdown todos los días | El renderizado reemplaza a la fuente en el mismo lugar | 14,99 $ sin impuestos, hasta 3 dispositivos (comprobado en typora.io, el 8 de septiembre de 2026) |
| GitHub, GitLab, Gist | Archivos que ya viven en un repositorio | GFM renderizado en la interfaz web | Gratis |
| `less`, `bat`, `glow` | Una terminal, un servidor, sin escritorio | Texto, o un renderizado dibujado en la terminal | Gratis, código abierto |
| Markor, Obsidian, Working Copy | Android e iOS, sin conexión | Vista previa renderizada en el dispositivo | Markor y Obsidian gratis; algunos editores de iOS son de pago |
| Pandoc | Producir primero otro formato a partir de él | Nada — escribe un archivo que después abres tú | Gratis, GPL |

## Abrir un archivo .md, plataforma por plataforma

### Windows

Cualquier máquina con Windows puede mostrarte el texto sin instalar nada:

| Ruta | Haz esto | Resultado |
| --- | --- | --- |
| Bloc de notas | Clic derecho en el archivo, Abrir con, Bloc de notas | La fuente |
| Símbolo del sistema | `type notes.md` | La fuente, impresa |
| PowerShell | `Get-Content notes.md` | La fuente, impresa |
| Bloc de notas desde una consola | `notepad notes.md` | La fuente, en una ventana |

Para leerlo renderizado, el camino más corto sin instalar nada es un navegador: abre un visor basado en navegador y arrastra el archivo a la página. Si lees Markdown con la frecuencia suficiente como para que el doble clic importe, instala un editor con vista previa y luego fija la aplicación por defecto para que Windows deje de preguntar.

**Cambiar la app por defecto en Windows.** Clic derecho en el archivo, elige Abrir con, luego Elegir otra aplicación, selecciona el programa y marca la casilla que hace la elección permanente. Si la app que quieres no aparece en la lista, usa «Buscar otra aplicación en este PC» y apunta Windows hacia el ejecutable. También puedes hacerlo desde Configuración: Aplicaciones, luego Aplicaciones predeterminadas, y buscar el tipo de archivo `.md` para fijar ahí el manejador. La segunda ruta es la que hay que usar cuando la extensión la reclamó algo que después desinstalaste, lo que deja la asociación apuntando a la nada.

### macOS

TextEdit ya es la opción de respaldo, así que el doble clic normalmente te muestra la fuente. Desde una terminal:

| Ruta | Haz esto | Resultado |
| --- | --- | --- |
| TextEdit | Clic derecho, Abrir con, TextEdit | La fuente |
| Terminal | `open -e notes.md` | La fuente, en TextEdit |
| Terminal | `less notes.md` | La fuente, paginada |
| Vista Rápida | Selecciona el archivo, pulsa espacio | El texto, no el formato |

Una trampa específica de macOS: TextEdit se puede configurar para tratar los archivos como texto enriquecido, y si eso está activado, puede ofrecerse a convertir o reformatear lo que abre. Leer es seguro de cualquier forma, pero no guardes desde TextEdit a menos que estés seguro de que está en modo texto plano, porque un archivo `.md` guardado como RTF deja de ser un archivo `.md`.

**Cambiar la app por defecto en macOS.** Selecciona el archivo, pulsa Comando-I para Obtener información, abre la sección «Abrir con», elige la aplicación, y después haz clic en «Cambiar todos» para aplicarlo a cada archivo `.md` y no solo a este. El clic en «Cambiar todos» es lo que la gente se salta; sin él el ajuste se aplica a un solo archivo y la próxima descarga te vuelve a sorprender.

### Linux

El editor de escritorio lo va a abrir — GNOME Text Editor, Kate, Mousepad, lo que sea que traiga tu distribución — y también todo en la terminal:

| Ruta | Haz esto | Resultado |
| --- | --- | --- |
| Paginador | `less notes.md` | La fuente, paginada, buscable con `/` |
| Imprimir | `cat notes.md` | La fuente, de una sola vez |
| Coloreado de sintaxis | `bat notes.md` | La fuente con el Markdown resaltado |
| Renderizado en la terminal | `glow notes.md` | Encabezados, listas y tablas dibujados como texto |

`glow` es el interesante si vives en una terminal: renderiza Markdown dentro de la propia terminal, así que tienes formato sin ninguna aplicación gráfica. Es gratis y tiene licencia MIT. `bat` no renderiza, colorea la fuente, que es una ventaja menor pero útil en archivos largos.

**Cambiar la app por defecto en Linux.** Usa la pestaña Propiedades, Abrir con del gestor de archivos, o fíjalo desde la línea de comandos:

```bash
xdg-mime default org.gnome.TextEditor.desktop text/markdown
```

Sustituye la entrada de escritorio por la aplicación que quieras. Si `xdg-mime query filetype` reporta algo distinto de `text/markdown` — `text/plain` es común —, fija el valor por defecto para ese otro tipo, o tu ajuste va a parecer que no hace nada.

### iOS y iPadOS

No hay un sistema de archivos donde hacer clic derecho, así que las opciones son más estrechas y el orden importa. Pruébalas en esta secuencia:

1. **Toca el archivo en Archivos.** Vista Rápida a menudo muestra el texto. Eso responde la pregunta para un archivo corto y no cuesta nada.
2. **Ábrelo en un visor basado en navegador.** Safari y Chrome en iOS pueden tomar un archivo desde Archivos a través del selector de archivos de una página, lo que significa que un visor que corre en el navegador funciona en un teléfono exactamente igual que en un portátil. Esta es la única ruta que no necesita ninguna instalación y aun así te da formato.
3. **Instala una app que declare soporte para Markdown.** Obsidian es gratis y lee directamente una carpeta de archivos `.md`. Working Copy es un cliente de Git que navega repositorios y muestra una vista previa de Markdown; se instala gratis con un desbloqueo de pago cuyo precio está en la App Store.
4. **Renómbralo a `.txt`.** Tosco, eficaz, y hace que Vista Rápida y cualquier app de texto lo trate como texto. Guarda una copia con el nombre original si el archivo va a ir a algún otro sitio después.

### Android

Android es la plataforma más propensa a negarse directamente, y también la más fácil de arreglar:

1. **Prueba el visor de texto integrado de tu gestor de archivos.** Algunos traen uno, otros no.
2. **Instala Markor.** Es un editor de texto para Android, gratis y con licencia Apache 2.0, disponible en F-Droid y GitHub. Guarda los archivos como texto plano en el dispositivo, así que nada se convierte a un formato propietario a tus espaldas, y muestra el Markdown como una vista previa con formato.
3. **Usa un visor basado en navegador.** Chrome en Android puede entregarle un archivo local al selector de archivos de una página, lo que te da un documento renderizado sin instalar nada.
4. **Renómbralo a `.txt`.** El mismo truco, la misma advertencia.

Google Drive también muestra el contenido de un archivo de texto que tiene guardado, algo que vale la pena saber cuando el archivo llegó como un enlace de Drive en vez de como una descarga.

## Las opciones, una por una

### El editor de texto que ya tienes — el mejor para descubrir qué tienes entre manos

Bloc de notas, TextEdit, GNOME Text Editor, Kate, `less`, `nano`. Cada uno de ellos abre un archivo `.md` correctamente, ahora mismo, sin descargar nada.

| A favor | En contra |
| --- | --- |
| Ya está instalado en cualquier máquina | Sin formato: lees la puntuación |
| Muestra el archivo exactamente como es, incluidos los destinos de enlaces y el front matter | Los documentos largos con listas anidadas se vuelven difíciles de seguir |
| No puede estropear nada mientras no guardes | Sin renderizado de tablas, así que una tabla ancha es un muro de barras verticales |

**Precio:** gratis, ya instalado.

**Detalles técnicos y funciones**

- Soporta cualquier sabor de Markdown, porque no está interpretando nada
- Muestra el front matter YAML, los comentarios HTML y el HTML crudo que las vistas renderizadas pueden ocultar
- Búsqueda dentro del archivo: `Ctrl-F` en un editor, `/` en `less`
- Seguro para abrir cualquier cosa, porque nada del archivo se ejecuta ni se descarga

**¿Quién debería usarlo?** Todo el mundo, primero. Abre el archivo en un editor de texto antes de decidir que necesitas una herramienta. La mitad de las veces el archivo tiene cuarenta líneas y ya tienes tu respuesta en diez segundos.

### TransformPipe en el navegador — el mejor para leerlo renderizado sin instalar nada

Suelta el archivo `.md` sobre la página y léelo como un documento. Corre en el navegador: sin haber iniciado sesión, el archivo no se sube a ningún sitio, lo que importa cuando el documento es un borrador de contrato o un manual interno y no un README público.

| A favor | En contra |
| --- | --- |
| Sin instalar, sin cuenta, funciona en un teléfono igual que en un portátil | Necesita una pestaña del navegador, así que no es un manejador de doble clic |
| No se sube nada cuando no has iniciado sesión | Un documento a la vez, o varios encadenados en uno |
| Renderiza GitHub Flavored Markdown, así que las tablas y las listas de tareas aparecen como tablas y listas de tareas | No es un editor: lee y convierte, no te ayuda a escribir |
| Exporta un archivo HTML autocontenido si necesitas entregar el documento | |

**Precio:** gratis. Una cuenta añade historial, compartir y una API, también gratis.

**Detalles técnicos y funciones**

- GFM: tablas, listas de tareas, tachado, autoenlaces, bloques de código con cercas
- La exportación es un documento HTML completo con sus estilos incluidos y sin peticiones externas
- El HTML crudo de la fuente pasa por un saneador con una lista de permitidos fija antes de llegar a la página
- Se descarga como `.html`, `.md` o texto plano, o se imprime a PDF a través del propio diálogo del navegador
- También convierte HTML, Word, CSV y JSON de vuelta a Markdown, y la misma conversión está disponible desde una API REST, una CLI, una GitHub Action y un servidor MCP

**¿Quién debería usarlo?** Cualquiera con un solo archivo y ningún deseo de instalar software para él, y cualquiera cuyo siguiente paso sea enviarle el documento a otra persona.

### Una extensión de navegador para Markdown — la mejor para abrir archivos locales en el navegador repetidamente

Extensiones como Markdown Viewer renderizan los archivos `.md` en cuanto los abres en el navegador, así que una URL `file:///` se convierte en una página con formato.

| A favor | En contra |
| --- | --- |
| Convierte el navegador en un visor de `.md` para archivos locales | Requiere darle a la extensión acceso a las URLs de archivo |
| Renderiza en cuanto abres el archivo, sin arrastrar y soltar | Una extensión con acceso a archivos puede leer los archivos locales que abras |
| Sabores y temas configurables en las mejores | La calidad y el mantenimiento de las extensiones varía mucho |

**Precio:** gratis, con licencia MIT para Markdown Viewer.

**Detalles técnicos y funciones**

- Disponible para Chrome, Firefox, Edge, Opera, Brave, Chromium y Vivaldi
- Necesita «Permitir acceso a las URLs de archivos» activado explícitamente en la página de detalles de la extensión antes de que renderice archivos locales
- Renderiza dentro de la página, así que la búsqueda, el zoom y la impresión del navegador funcionan con normalidad

**¿Quién debería usarlo?** Quien abre archivos Markdown locales semanalmente y quiere que el navegador se encargue sin un rodeo. Lee primero los permisos: el interruptor de las URLs de archivo es todo el sentido de la extensión y también la razón para elegir una en la que confiarías con tu disco.

### VS Code — el mejor si ya lo tienes abierto

VS Code tiene una vista previa de Markdown integrada, sobre markdown-it. Abre el archivo y pulsa el botón de vista previa, o divide la ventana y obtén fuente y renderizado lado a lado.

| A favor | En contra |
| --- | --- |
| Ya instalado para la mayoría de quienes desarrollan | Una descarga grande si solo quieres leer un archivo |
| La vista previa sigue de cerca CommonMark, con los extras de GFM | El estilo de la vista previa es del editor, no del documento |
| La vista dividida muestra fuente y resultado juntos | No es un lector: es un editor de código con un panel de vista previa |

**Precio:** gratis.

**Detalles técnicos y funciones**

- Vista previa construida sobre markdown-it, así que su renderizado coincide con el comportamiento de ese analizador
- Las extensiones añaden exportación a HTML y PDF, y sintaxis adicional como diagramas
- Maneja una carpeta de archivos Markdown con búsqueda en todos ellos
- Muestra el front matter como fuente a menos que una extensión haga algo con él

**¿Quién debería usarlo?** Quien desarrolla y ya tiene el archivo en el editor. Si estás abriendo VS Code específicamente para leer un adjunto `.md`, una pestaña del navegador es más rápida. Y si el paso siguiente es un archivo `.html`, la vista previa no te lo va a dar: [Markdown a HTML en VS Code](/blog/markdown-to-html-in-vs-code) repasa las extensiones que exportan y por qué ninguna hereda por defecto el aspecto de la vista previa.

### Obsidian — el mejor para una carpeta de Markdown a la que vuelves siempre

Obsidian es una aplicación de notas cuyo almacén entero son archivos Markdown planos en una carpeta normal del disco. Apúntalo a un directorio y cada archivo `.md` dentro se convierte en una nota legible y enlazada.

| A favor | En contra |
| --- | --- |
| Los archivos se quedan como `.md` plano en disco, legibles por cualquier otra cosa | Quiere una carpeta, llamada bóveda, no un archivo suelto |
| Corre en Windows, macOS, Linux, iOS y Android | Su propia sintaxis de enlaces e incrustaciones no es portable a otros renderizadores |
| Lee y renderiza sin necesitar una cuenta | Toda una aplicación que aprender si solo quieres leer |

**Precio:** gratis para uso personal, comercial y sin fines de lucro; las licencias comerciales son opcionales y se venden anualmente como apoyo (comprobado en obsidian.md, el 8 de septiembre de 2026).

**Detalles técnicos y funciones**

- Local primero: la bóveda es un directorio, y no hay ningún requisito de iniciar sesión
- Renderiza GFM más sus propios `[[enlaces]]` e incrustaciones al estilo wiki
- Las aplicaciones móviles para iOS y Android leen los mismos archivos
- Como el almacén es texto plano, cualquier cosa que escribas en ella se mantiene abrible en el Bloc de notas después

**¿Quién debería usarlo?** Cualquiera que haya acumulado una carpeta de Markdown — notas exportadas, una copia de documentación, una wiki personal — y lea desde ahí con regularidad en vez de una sola vez.

### MarkText — el mejor lector de escritorio simple sin cuenta

MarkText es un editor de Markdown de escritorio y código abierto que renderiza mientras escribes, así que también sirve como lector.

| A favor | En contra |
| --- | --- |
| Gratis y con licencia MIT | El ritmo de desarrollo es más lento que el de los editores comerciales |
| Se instala en Windows 10 u 11, macOS 11 o posterior, y Linux | Menos funciones que Typora u Obsidian |
| Disponible por Homebrew, Chocolatey y Winget | Sigue siendo una instalación, para un trabajo que una pestaña del navegador puede hacer |

**Precio:** gratis, con licencia MIT.

**Detalles técnicos y funciones**

- Instaladores para Windows x64 y arm64, compilaciones para macOS arm64 y x64 sin binario universal, y binarios de Linux desde la página de lanzamientos (comprobado en github.com/marktext/marktext, el 8 de septiembre de 2026)
- Renderiza en el mismo lugar en vez de en un panel de vista previa aparte
- Exporta HTML y PDF desde el archivo que tiene abierto

**¿Quién debería usarlo?** Quien quiere una aplicación de escritorio que se quede con la extensión `.md`, en una máquina donde instalar un editor de pago no es una opción.

### Typora — el mejor si leés y escribís Markdown todos los días

Typora reemplaza el Markdown con su renderizado mientras escribes, así que no hay panel de vista previa ni vista de fuente a menos que la pidas. Es el más cómodo de todos para pasar horas dentro, y el único aquí que cuesta dinero.

| A favor | En contra |
| --- | --- |
| El renderizado es el documento: sin panel dividido que manejar | De pago, y solo de escritorio |
| Exporta HTML, PDF y Word | Ocultar la sintaxis molesta a algunas personas que escriben |
| Archivos locales, nada se sube | No vale la pena comprarlo para abrir un solo adjunto |

**Precio:** 14,99 $ sin impuestos, cubre hasta 3 dispositivos, con una prueba gratuita de 15 días (comprobado en typora.io, el 8 de septiembre de 2026).

**Detalles técnicos y funciones**

- Edición WYSIWYG, con un modo fuente disponible cuando necesitas ver las marcas
- Los temas son CSS, así que la exportación se puede estilizar con tu propio estilo
- Exporta a través de Pandoc para los formatos que no escribe por sí mismo

**¿Quién debería usarlo?** Quien tiene Markdown en su trabajo todos los días. Como lector de un solo `.md` puntual, es la compra equivocada.

### GitHub, GitLab y Gist — los mejores cuando el archivo ya vive en un repositorio

Ambos renderizan GitHub Flavored Markdown en la interfaz web, y ambos leen un archivo lo bastante bien como para no necesitar nada más. Ninguno es un visor para archivos de tu disco.

| A favor | En contra |
| --- | --- |
| Renderiza GFM de forma confiable, tablas y listas de tareas incluidas | El archivo tiene que subirse a algún sitio primero |
| Nada que instalar; un enlace que cualquiera puede abrir | No apropiado para un documento confidencial |
| Gist funciona para un solo archivo suelto | Sin botón de exportar: lo que guardas es su página, su marcado |

**Precio:** gratis.

**¿Quién debería usarlo?** Cualquiera cuyo archivo pertenezca de todas formas a un alojador de código. Pega un solo archivo en un Gist privado y tienes una vista renderizada en segundos — pero solo para contenido que estés dispuesto a poner ahí.

### less, bat y glow — los mejores en un servidor sin escritorio

A veces el archivo está en una máquina a la que llegaste por SSH, y no hay navegador ni interfaz gráfica. La terminal tiene tres niveles de respuesta.

| A favor | En contra |
| --- | --- |
| Funciona sin ningún entorno gráfico | El renderizado en la terminal tiene límites: sin imágenes, las tablas estrechas se envuelven |
| `less` está prácticamente en cualquier máquina Unix ya | `bat` y `glow` son instalaciones extra |
| `glow` renderiza encabezados, listas y tablas como texto con formato | No es una ruta que nadie elegiría en un portátil |

**Precio:** gratis, código abierto; `glow` tiene licencia MIT.

**Detalles técnicos y funciones**

- `less notes.md` pagina la fuente y la busca con `/`
- `bat notes.md` imprime la fuente con coloreado de sintaxis Markdown
- `glow notes.md` dibuja un renderizado en la terminal, con estilo oscuro o claro

**¿Quién debería usarlo?** Cualquiera que lea un README o un manual en un servidor, donde instalar una aplicación de escritorio es una frase que no significa nada.

### Markor, Obsidian móvil y Working Copy — los mejores en un teléfono

El móvil es donde «simplemente abre el archivo» falla más, así que vale la pena conocer una app por plataforma.

| A favor | En contra |
| --- | --- |
| Markor es gratis, Apache 2.0, y guarda los archivos como texto plano en el dispositivo | Cada una es una instalación por plataforma para un archivo que quizá leas una sola vez |
| Obsidian corre tanto en iOS como en Android y lee una carpeta de `.md` | El manejo de archivos en móvil es más engorroso que en escritorio |
| Working Copy muestra una vista previa de Markdown desde un repositorio de Git en iOS | Algunos editores de iOS son de pago, con el precio fijado en la App Store |

**Precio:** Markor gratis, Apache 2.0. Obsidian gratis. Working Copy se instala gratis con un desbloqueo de pago cuyo precio está en la App Store.

**Detalles técnicos y funciones**

- Markor: Android, desde F-Droid o GitHub, sin publicidad, archivos interoperables con cualquier otra herramienta de texto plano
- Obsidian móvil: abre la misma carpeta de bóveda que la aplicación de escritorio
- Working Copy: un cliente de Git, así que es la respuesta correcta cuando el archivo está en un repositorio y no en una descarga

**¿Quién debería usarlo?** Quien lee Markdown en el teléfono más de una vez. Para un solo adjunto, un visor basado en navegador no necesita instalación y funciona en las dos plataformas.

### Pandoc — el mejor cuando la respuesta es un archivo distinto

Pandoc es un conversor de documentos de línea de comandos escrito en Haskell. No muestra nada; escribe un archivo nuevo, que después abres en algo que sí muestra cosas.

| A favor | En contra |
| --- | --- |
| Convierte Markdown a HTML, PDF, Word, EPUB y más | Requiere instalación y una terminal |
| `--standalone` produce un documento completo en vez de un fragmento | No es un visor en absoluto: sin ventana, sin vista previa |
| Programable, así que maneja una carpeta con la misma facilidad que un archivo | Sus plantillas y dialectos tienen su propia curva de aprendizaje |

**Precio:** gratis, con licencia GPL.

**Detalles técnicos y funciones**

- Lee varios dialectos de Markdown, elegidos explícitamente, y escribe alrededor de cuarenta formatos de salida
- `--standalone` envuelve la salida; `--embed-resources` incluye imágenes y CSS en un solo archivo
- Corre sin interfaz, así que encaja en un build o en una tarea programada más que en una sesión de lectura

**¿Quién debería usarlo?** Quien necesita el documento en otro formato, de forma repetida, en una máquina que controla. Para un solo archivo y una sola lectura, es más herramienta de la que el trabajo necesita.

## Alguien te mandó un archivo .md por correo y no tienes nada instalado

Esta es la versión más común de la pregunta, y tiene una respuesta corta: no instales nada.

Descarga el adjunto, abre un visor basado en navegador, y arrastra el archivo a la página. Eso funciona en un portátil de trabajo con una política de software cerrada, en un teléfono, y en una máquina prestada. Comprueba qué dice la página que hace con el archivo antes de soltar ahí un documento confidencial — con una herramienta del lado del navegador nada se sube, y puedes confirmarlo abriendo la pestaña de red y viendo que no pasa nada.

Si tampoco puedes usar una pestaña del navegador, hay dos alternativas:

- **Renómbralo.** Cambia `notes.md` a `notes.txt` y cualquier visor de texto de la máquina, incluida la vista previa de adjuntos de tu propio webmail, te va a mostrar la fuente. Nada del archivo cambia salvo el nombre.
- **Abre la vista previa del adjunto.** La mayoría de los clientes de webmail muestran una vista previa de un adjunto de texto en línea en vez de descargarlo, y un archivo `.md` es un adjunto de texto.

Y si esto sigue pasando — si un colega te manda archivos `.md` con regularidad y sigues buscando cómo leerlos —, el arreglo está antes que tú en la cadena. Pídele que mande HTML o un enlace en su lugar. Un adjunto `.md` es un archivo que solo se abre bien para quien ya resolvió este problema.

## Leerlo y convertirlo son trabajos distintos

Un visor resuelve tu problema. No resuelve el problema de la siguiente persona.

Si tienes que mandar el documento por correo, imprimirlo, adjuntarlo a un ticket, ponerlo delante de un cliente, o seguir pudiendo abrirlo dentro de cinco años, convierte una vez a HTML. Un archivo `.html` se abre con doble clic en cualquier cosa con navegador, con el formato intacto, sin nada que instalar y nada que explicar. Esa es la propiedad que `.md` no tiene en ninguna plataforma, que es toda la razón por la que existe este artículo. [Qué pasa en realidad cuando Markdown se convierte en HTML](/blog/markdown-to-html-converter) vale la pena entenderlo antes de elegir una herramienta, y si quien lo lee no debería tener que lidiar con un adjunto en absoluto, puedes [publicarlo como un enlace de solo lectura](/blog/share-a-markdown-document-as-a-link) en su lugar.

La balanza se inclina al revés mientras todavía estás escribiendo. Un editor con vista previa en vivo se gana la descarga en ese momento, porque estás mirando el documento decenas de veces al día. Un conversor es para cuando ya terminaste y otra persona necesita leerlo. Elegir entre ambos es en realidad una pregunta sobre quién es el siguiente lector — y si esa pregunta sigue llegando antes de escribir el archivo en vez de después, la decisión de fondo es [si el documento debería haber sido Markdown o HTML desde el principio](/blog/markdown-vs-html).

## Dónde falla la opción obvia

El consejo obvio es «instala VS Code» o «simplemente ábrelo en el Bloc de notas», y los dos tienen razón más o menos la mitad de las veces. Aquí está dónde cada uno te cuesta algo.

**El texto crudo esconde la estructura justo cuando la necesitas.** Un archivo de cuarenta líneas está bien como fuente. Un manual de sesenta páginas con cuatro niveles de anidación, una docena de tablas y código en línea cada tres líneas no lo está: terminas analizando la puntuación en vez de leer las palabras, y se te va a pasar algo. El fallo es silencioso — no notas el elemento que te saltaste.

**Instalar un editor para un solo archivo es un mal intercambio, y difícil de deshacer.** Un editor de código es una descarga grande, un recorrido por ajustes que no pediste, y una nueva aplicación por defecto para una extensión que quizá no querías que fuera suya. También suele abrir Markdown con coloreado de sintaxis activado, que no es lo mismo que renderizarlo — los signos numerales siguen ahí, solo que ahora de otro color.

**Los visores online suelen significar subido.** «Online» y «en el navegador» suenan idénticos y no lo son. Algunas herramientas mandan tu archivo a un servidor para convertirlo; otras hacen el trabajo localmente y no mandan nada. Para un README público, la diferencia es irrelevante. Para un contrato, la nota de un paciente, un plan sin anunciar o un informe interno de un incidente, es la única pregunta que importa, y la respuesta está en la página o se puede verificar en la pestaña de red.

**Las extensiones de navegador quieren acceso a tu disco.** Una extensión que renderiza archivos `.md` locales solo puede hacerlo con permiso para leer URLs de archivo, y ese permiso no es estrecho. Es un intercambio razonable si lees Markdown constantemente y uno malo para un solo adjunto.

**Los visores no se ponen de acuerdo sobre Markdown.** Las tablas, las listas de tareas, el tachado y los autoenlaces vienen de GitHub Flavored Markdown y no de la sintaxis original, así que un visor de CommonMark estricto muestra barras verticales crudas donde esperabas una tabla. El archivo está bien; el visor implementa un sabor más pequeño. Este es el reporte de «mi Markdown está roto» más común de todos y casi nunca es culpa del archivo. Los sabores vale la pena conocerlos si manejas Markdown de más de una fuente.

**Las imágenes no van a estar en el archivo.** Markdown referencia imágenes por ruta; no las contiene. Abre un archivo `.md` que se exportó con una carpeta `images/` al lado, en un visor que solo recibió el `.md`, y cada imagen es un icono roto. Eso no es el visor fallando, es [lo que hacen las rutas relativas cuando un archivo se mueve](/blog/images-and-links-that-still-work).

**Cambiar la app por defecto arregla el doble clic y nada más.** Vale la pena hacerlo, y no vuelve portable el archivo. Tu máquina ahora abre `.md` bien. La persona a la que se lo envías está de vuelta donde empezaste.

## Cómo elegir

1. **Ábrelo primero en un editor de texto.** Tarda diez segundos, no necesita nada, y te dice exactamente qué tienes entre manos — la extensión, si hay front matter, si hay tablas, si de verdad es Markdown. Sáltate esto y quizá instales una aplicación para leer cuarenta líneas de texto.
2. **Cuenta cuántas veces va a pasar esto.** Una vez significa una pestaña del navegador. Cada semana significa una extensión de navegador o un editor que ya tienes. Todos los días significa una aplicación en la que te gusta estar, y ese es el único caso en el que pagar por una tiene sentido.
3. **Decide si el contenido puede salir de la máquina.** Si no puede, descarta cualquier cosa que suba algo antes de comparar nada más, porque no es una preferencia que puedas revisar después de los hechos.
4. **Comprueba el sabor contra el archivo.** Si el documento tiene tablas o listas de tareas, el visor tiene que soportar GFM. Abre un archivo representativo y mira las tablas antes de comprometerte; un visor que muestra barras verticales va a seguir mostrando barras verticales.
5. **Pregúntate quién lo lee después.** Si la respuesta es solo tú, cualquier visor de aquí sirve. Si la respuesta es un colega, un cliente o tu propio futuro yo en otro dispositivo, no quieres ningún visor — quieres un archivo convertido, y la elección de visor deja de importar.

## Conclusión

Abre el archivo primero en el Bloc de notas, TextEdit o `less`: es texto plano, se va a abrir, y te dice exactamente qué tienes. Si la fuente responde tu pregunta, para ahí. Si el documento es lo bastante largo como para que la puntuación moleste, léelo renderizado — una pestaña del navegador para un solo archivo, una extensión o un editor si esto es un hábito semanal, Markor u Obsidian en el teléfono. Y si el problema real es que el archivo tiene que llegar a alguien que nunca debería tener que ver un signo numeral, convierte una vez con [la conversión de Markdown a HTML de TransformPipe](/): corre en tu navegador, no se sube nada cuando no has iniciado sesión, y lo que recibes de vuelta es un solo archivo HTML autocontenido que se abre con doble clic en cualquier dispositivo al que probablemente se lo vayas a entregar.

## Preguntas frecuentes

### ¿Por qué mi archivo .md se abre en un editor de código?

Porque Windows y macOS eligen la aplicación según la extensión del archivo, y nada viene reclamando `.md` de fábrica. Gana el programa que registró la extensión más recientemente, y en una máquina con herramientas de desarrollo instaladas suele ser un editor de código. No dice nada sobre el contenido de tu archivo.

### ¿Puedo abrir un archivo .md en Word?

Word lo va a abrir si lo apuntas directamente al archivo, y lo trata como un documento de texto plano — vas a ver los signos numerales y los asteriscos, no encabezados ni negrita. Word no es un renderizador de Markdown, así que esto solo es útil para leer la fuente. Si necesitas el documento en formato Word correctamente, convierte en vez de abrir.

### ¿Cuál es la diferencia entre .md y .markdown?

Ninguna. Las dos extensiones significan el mismo texto plano siguiendo las mismas convenciones, y `.mdown`, `.mkd` y `.mdwn` son lo mismo otra vez. Las únicas extensiones que de verdad son distintas son `.mdx`, que mezcla componentes de JavaScript, y `.rmd`, que es R Markdown con fragmentos de código ejecutable.

### ¿Es seguro abrir un archivo .md que me mandaron?

Leerlo en un editor de texto es completamente seguro: nada del archivo se ejecuta ni se descarga. Renderizarlo es una pregunta ligeramente distinta, porque Markdown permite HTML crudo, así que un archivo `.md` puede llevar etiquetas `<script>` y URLs `javascript:` que un renderizador fiel le pasa a tu navegador. Usa un visor que saneé el HTML, y ten en cuenta que un editor de texto plano evita el problema por completo.

### ¿Cómo cambio el programa que abre los archivos .md?

En Windows: clic derecho, Abrir con, Elegir otra aplicación, selecciona el programa, marca la casilla que lo hace permanente — o fíjalo en Configuración, Aplicaciones, Aplicaciones predeterminadas buscando `.md`. En macOS: Obtener información, Abrir con, elige la app, y después haz clic en Cambiar todos. En Linux: la pestaña Abrir con del gestor de archivos, o `xdg-mime default <app>.desktop text/markdown`.

### ¿Puedo leer un archivo .md en el teléfono sin instalar nada?

Sí. Tócalo en Archivos en iOS o en tu gestor de archivos en Android y a menudo vas a obtener el texto en una vista previa. Para tener formato sin instalar nada, abre un visor basado en navegador en Safari o Chrome y elige el archivo con el selector de archivos de la página — los navegadores móviles pueden leer un archivo local de esa forma, que es la única ruta que funciona en las dos plataformas.

### ¿Tengo que convertir un archivo .md para leerlo?

No. La conversión es para cuando otra persona lo tiene que leer, o cuando necesitas el documento en otro formato. Para tu propia lectura, un editor de texto o un visor bastan, y ninguno de los dos cambia el archivo. Convierte cuando el destino sea una persona, una impresora o un archivo histórico y no tu propia pantalla.
