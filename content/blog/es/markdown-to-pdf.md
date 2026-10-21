---
title: "Markdown a PDF: todas las vías y lo que cuesta cada una"
description: Comparamos las vías de Markdown a PDF - imprimir desde el navegador, Pandoc con LaTeX, wkhtmltopdf, WeasyPrint, Chrome sin interfaz - y qué se rompe en cada una.
updated: 2026-10-21
date: 2026-09-01
tag: Publicación
keywords: markdown a pdf, convertir md a pdf, conversor de markdown a pdf, pandoc markdown a pdf, markdown a pdf linea de comandos, imprimir markdown a pdf, md a pdf sin instalar nada
---

### Resumen rápido

No existe una conversión directa de Markdown a PDF; toda herramienta pasa por un formato intermedio, y el que elija decide el aspecto de tu PDF. Para un documento único que necesitas ya, convierte a un archivo HTML completo e imprímelo desde el navegador: es la mejor tipografía disponible gratis, y el diálogo de impresión es donde fijas el tamaño de papel y los márgenes. Para un documento largo con secciones numeradas, cabeceras que se repiten y un índice con números de página, instala Pandoc y un motor LaTeX y acepta el tamaño de la instalación. Para un build que corre sin nadie delante, usa Chrome sin interfaz o WeasyPrint, y pon las reglas de página en CSS en lugar de en un diálogo que nadie va a estar ahí para pulsar.

Markdown no tiene páginas. Tiene títulos, párrafos, listas y código, y no dice nada sobre dónde termina una hoja de papel y empieza la siguiente. El PDF es lo contrario: un tamaño de página fijo, un margen fijo, un salto entre la página cuatro y la cinco, y cada tipografía que usa va dentro del propio archivo. Convertir entre los dos no es una traducción, es una invención. Algo tiene que decidir el tamaño del papel, los márgenes, dónde se corta la tabla y qué tipografía se incrusta, y si tú no lo decides, lo decide la herramienta por ti.

Por eso el mismo archivo `.md` produce cuatro PDF distintos con cuatro herramientas distintas, y por eso las diferencias no son cosméticas. Una pone tus bloques de código sobre un fondo gris, otra los imprime en blanco con las líneas largas cortadas en el margen. Una numera las páginas, otra imprime la URL del archivo y la fecha de ayer en la parte de arriba. Una incrusta la tipografía que elegiste, otra sustituye una alternativa y no te lo dice.

Hay cuatro vías, y solo cuatro. Convertir a HTML e imprimirlo desde un navegador. Convertir a LaTeX y componerlo. Convertir a HTML y entregárselo a un motor dedicado de HTML a PDF. O abrir el archivo en un editor que tenga un menú de exportar. Todo lo demás es una de esas cuatro con un envoltorio distinto alrededor, incluido cualquier conversor online que promete un PDF en un clic.

## Comparativa rápida: la chuleta

| Vía | Mejor para | Qué necesita | Control sobre la página | Licencia y precio |
| --- | --- | --- | --- | --- |
| HTML, y luego imprimir desde el navegador | Un documento, ahora mismo | Un navegador que ya tienes | Papel, márgenes, escala, fondos - desde un diálogo | Gratis |
| Pandoc + pdflatex | Prosa sencilla, sin glifos raros | Pandoc más una instalación de TeX | Total, mediante variables de plantilla | Gratis, GPL; TeX Live gratis |
| Pandoc + xelatex o lualatex | Tipografías del sistema, escrituras no latinas, matemáticas | Lo mismo, más las tipografías | Total | Gratis, GPL |
| Pandoc + Typst | Una página de calidad LaTeX sin instalar TeX | Pandoc más el binario de Typst | Total, mediante la propia sintaxis de Typst | Gratis; Typst es Apache 2.0 |
| Pandoc + WeasyPrint | CSS que ya conoces, con reglas de página reales | Python más WeasyPrint | Total, mediante CSS de medios paginados | Gratis, BSD |
| WeasyPrint sobre tu propio HTML | Cabeceras que se repiten, contadores de página, marcadores en el PDF | Python más WeasyPrint | Total, mediante CSS | Gratis, BSD |
| wkhtmltopdf | Un script que ya lo llama | Un único binario | Bueno, mediante parámetros de línea de comandos | Gratis, LGPLv3; repositorio archivado |
| Chrome sin interfaz | Un paso de build, o muchos archivos a la vez | Chrome o Chromium instalado | Mediante el CSS de impresión del documento | Gratis |
| Puppeteer | Lo mismo, con guion, con márgenes en código | Node más una descarga de Chromium | Total, mediante la API | Gratis, Apache 2.0 |
| Typora | Escribir y exportar en una sola aplicación | Una instalación de escritorio, de pago | La del tema, más una configuración de página | 14,99 $ de pago único, hasta 3 dispositivos |
| Obsidian | Una bóveda en la que ya escribes | Una instalación de escritorio | La del tema | Gratis; licencia comercial opcional |
| Extensión de VS Code | El archivo ya está abierto en tu editor | Una extensión, a menudo con un Chromium | Lo que la extensión exponga | Gratis, depende de la extensión |
| Markdown a `.docx`, y luego Word o LibreOffice | Alguien tiene que editarlo después de ti | Pandoc más una suite de ofimática | La configuración de página de la suite | Gratis con LibreOffice |

Precios comprobados en typora.io y obsidian.md, el 8 de septiembre de 2026. El aviso del repositorio de wkhtmltopdf se comprobó en github.com, el 8 de septiembre de 2026.

## Convertir a HTML y luego imprimir desde el navegador

Esta es la vía que debería tomar la mayoría para un documento único, y la que desconfían por parecer demasiado simple. Convierte el Markdown a un archivo HTML completo — no un fragmento, un documento con doctype, cabecera y sus estilos en línea— ábrelo, y pulsa el atajo de imprimir. Elige «Guardar como PDF» como destino.

La tipografía es la razón para hacerlo así. La salida de impresión de un navegador viene del mismo motor de renderizado que dibuja cada página que miras: interletraje real, ligaduras, salto de línea correcto, texto vectorial a cualquier zoom, y subconjuntos de tipografía incrustados en el PDF resultante. Nada gratis lo hace mejor, y varias cosas de pago lo hacen peor. Si el documento fija `lang` en el elemento raíz y `hyphens: auto` en su hoja de estilos, obtienes también la separación silábica, que es la diferencia entre un párrafo justificado que se lee bien y uno lleno de callejones.

El precio es que todo tu control vive en un cuadro de diálogo, y ese cuadro de diálogo merece entenderse, porque cuatro de sus controles cambian tu documento en silencio.

| Control | Qué hace en realidad | Por qué importa |
| --- | --- | --- |
| Destino | Elige una impresora física o «Guardar como PDF» | Solo «Guardar como PDF» produce un archivo; el PDF de un controlador de impresora puede rasterizar el texto |
| Tamaño de papel | A4, Carta, Legal y el resto | A4 mide 210 por 297mm, Carta 8,5 por 11in; una maquetación pensada para uno se reajusta mal en el otro |
| Márgenes | Predeterminado, Ninguno, Mínimo, Personalizado | «Ninguno» lleva el contenido hasta el borde del papel, algo que la mayoría de impresoras físicas no puede reproducir |
| Escala | «Ajustar al área imprimible», o un porcentaje | Ajustar reduce todo, así que una tabla demasiado ancha hace el cuerpo del texto más pequeño de lo que fijaste |
| Gráficos de fondo | Desactivado por defecto | Este es el control que te quita el sombreado de los bloques de código y las rayas de las tablas |
| Cabeceras y pies | Desactivado o activado | Activado imprime el título de la página, la ubicación del archivo, la fecha y un número de página, con la tipografía del navegador |

Dos de esos valores por defecto causan la mayoría de las quejas sobre los PDF impresos desde el navegador. Los gráficos de fondo están desactivados porque la tinta de impresora es cara, y el efecto en un documento técnico es que cada bloque de código sombreado, cada aviso con color y cada tabla con rayas sale en blanco liso. Actívalo. Las cabeceras y pies son una comodidad para imprimir una página web y un defecto para cualquier cosa que le envíes a otra persona: estampa una ruta `file:///Users/tu/Descargas/…` en la parte de arriba de la primera página. Desactívalo.

El propio CSS del documento puede recuperar parte de esto. Una hoja de estilos que declara `@page { size: A4; margin: 20mm; }` le da al diálogo un punto de partida sensato, y las reglas `@media print` te dejan quitar la navegación, expandir secciones plegadas y forzar colores que sobreviven a una impresora en blanco y negro. Ahí también es donde pones `break-inside: avoid` para que una tabla o una figura deje de partirse por un salto de página.

| A favor | En contra |
| --- | --- |
| La mejor tipografía disponible sin coste | Una persona tiene que pasar por un diálogo, así que no es un paso de build |
| Sin instalar nada, y sin subida si la conversión corre en el navegador | Sin cabeceras ni pies de tu propio diseño |
| El PDF se produce a partir de un archivo que puedes guardar y volver a imprimir | Sin índice con números de página, y sin referencias cruzadas |
| A dos controles de estar correcto, una vez sabes cuáles son | Un documento a la vez |

**¿Quién debería usarlo?** Cualquiera con un documento y un destinatario. Un conversor que te entrega HTML autónomo con sus estilos en línea convierte esto en un trabajo de dos pasos, y [lo que le pasa a tu archivo por el camino](/blog/markdown-to-html-converter) merece leerse antes de fiarte de la salida de cualquiera de ellos. TransformPipe hace la conversión en tu navegador e imprime a través del mismo diálogo, por lo que aparece en esta lista y no dentro de ella: el PDF es obra del navegador, no del conversor.

## Pandoc con un motor LaTeX

`pandoc report.md -o report.pdf` es el comando que todo el mundo cita, y engaña de una manera concreta: Pandoc no hace PDF. Convierte tu Markdown a LaTeX y luego ejecuta un motor de composición externo, que es lo que produce el archivo de verdad. Si ese motor no está instalado, el comando falla, y el error nombra un binario del que nunca has oído hablar.

Esa indirección es también el origen de la calidad. TeX lleva componiendo matemáticas y prosa larga desde los años ochenta, y su algoritmo de salto de línea optimiza párrafos enteros en vez de una línea a la vez. Para una tesis, un manual, un contrato o cualquier cosa con secciones numeradas y ecuaciones, sigue siendo la mejor salida de esta página.

### Qué motor, y qué cuesta instalarlo

| Motor | Se elige con | Úsalo cuando | Coste |
| --- | --- | --- | --- |
| pdflatex | El predeterminado | Prosa en inglés llana, sin glifos raros | Una instalación de TeX |
| xelatex | `--pdf-engine=xelatex` | Quieres tipografías del sistema, o escrituras no latinas | Lo mismo, más las tipografías |
| lualatex | `--pdf-engine=lualatex` | Lo mismo, con scripting Lua en la plantilla | Lo mismo |
| Typst | `--pdf-engine=typst` en Pandoc reciente | Quieres una instalación rápida y pequeña en vez de TeX | Un binario, Apache 2.0 |
| WeasyPrint | `--pdf-engine=weasyprint` | Prefieres escribir CSS antes que LaTeX | Python y una instalación con pip |
| wkhtmltopdf | `--pdf-engine=wkhtmltopdf` | Una cadena heredada lo espera | Un binario, sin mantenimiento |

La instalación es el coste real, y conviene decirlo sin rodeos. Una distribución completa de TeX es, con diferencia, la dependencia más grande de cualquier cadena de herramientas documental que la mayoría monta; se mide en gigabytes y tarda un rato. Las distribuciones pequeñas —BasicTeX, TinyTeX— se instalan en una fracción del espacio y luego fallan la primera vez que tu documento necesita un paquete que se dejaron fuera. El fallo al menos es legible: LaTeX se detiene y nombra el archivo `.sty` que falta, y `tlmgr install <paquete>` lo trae. Vas a hacer eso cuatro o cinco veces antes de que se construya un primer documento, y luego nunca más en esa máquina.

### Los parámetros que hacen el trabajo

| Parámetro | Efecto |
| --- | --- |
| `-V geometry:margin=25mm` | Fija el margen de página mediante el paquete geometry |
| `-V mainfont="Source Serif 4"` | Elige una tipografía del sistema; necesita xelatex o lualatex |
| `-V fontsize=11pt` | Tamaño del cuerpo, que el 10pt por defecto rara vez conviene |
| `-V documentclass=report` | Capítulos y una portada en vez de un artículo |
| `--toc` | Un índice, con números de página, generado a partir de tus títulos |
| `--number-sections` | Numera los títulos para que coincidan |
| `-V colorlinks=true` | Enlaces en color en vez de las cajas enmarcadas por defecto |
| `--highlight-style=tango` | Elige el tema de resaltado de código |
| `--include-in-header=head.tex` | Inyecta LaTeX en crudo, que es como se consiguen cabeceras que se repiten de verdad |

`--toc` y `--number-sections` juntos son la razón honesta para dejar atrás el navegador. Un índice que dice «Pasos de la migración ... 14» no lo puede producir un navegador en absoluto, porque un navegador no sabe en qué página cae nada hasta que ya lo ha impreso.

### Lo que se rompe

Las líneas de código largas son lo primero que falla. LaTeX no envuelve el texto verbatim, así que un comando de shell más ancho que el bloque de texto se sale por el borde derecho del papel y sencillamente desaparece. El arreglo es una configuración de resaltado que corte líneas, o líneas más cortas en la fuente; en cualquier caso tienes que darte cuenta, porque nada te avisa. [Cómo viajan los bloques de código entre formatos](/blog/code-blocks-in-markdown) cubre la versión más amplia de este problema.

Las tablas anchas fallan igual y de forma más visible. Unicode es la segunda trampa: pdflatex es anterior a él, así que un documento con una comilla curva de un procesador de texto, una letra griega, un nombre chino o un emoji se detiene con un error sobre un carácter sin definir. Cambiar a xelatex arregla casi todo; los emoji seguirán sin aparecer, porque no hay un trazo monocromo para ellos en una tipografía de texto normal.

| A favor | En contra |
| --- | --- |
| La mejor salida de documento largo disponible gratis | La instalación más grande de cualquier vía de aquí |
| Un índice con números de página, y referencias cruzadas | Los errores de LaTeX son famosamente difíciles de leer |
| Repetible: el mismo comando da el mismo archivo | Personalizar la plantilla significa aprender LaTeX |
| Un comando convierte también a HTML, DOCX y EPUB | El HTML sin filtrar dentro del Markdown se ignora, no se renderiza |

**¿Quién debería usarlo?** Cualquiera que produzca un documento que se leerá en papel, se encuadernará, o se enviará a algún sitio con reglas de formato. También cualquiera que construya el mismo PDF cada semana, porque el comando es la especificación y no se desvía.

## Motores de HTML a PDF: wkhtmltopdf, Chrome sin interfaz y WeasyPrint

Estos se sitúan entre las dos vías anteriores. Sigues convirtiendo a HTML, pero un programa lo imprime en lugar de una persona, lo que significa que puede correr dentro de un build. Se diferencian en qué motor de maquetación usan, y ese único hecho determina qué puede contener tu CSS.

| Motor | Motor de maquetación | Cabeceras y pies | CSS moderno | Mantenido |
| --- | --- | --- | --- | --- |
| wkhtmltopdf | Qt WebKit, una bifurcación antigua | Sí, mediante parámetros, con variables de página | Poco fiable | Repositorio archivado, enero de 2023 |
| Chrome sin interfaz | Chromium actual | Solo la propia banda del navegador, o vía plantillas de Puppeteer | Todo lo que hace un navegador | Sí |
| WeasyPrint | Propio, escrito en Python para paginación | Sí, mediante cajas de margen de CSS | Parcial: flexbox y grid son limitados | Sí |

### wkhtmltopdf

wkhtmltopdf es una herramienta de línea de comandos que renderiza HTML con el motor de renderizado Qt WebKit y se publica bajo LGPLv3 (comprobado en wkhtmltopdf.org, el 8 de septiembre de 2026). Su repositorio de GitHub lleva el aviso «This repository was archived by the owner on Jan 2, 2023. It is now read-only» (comprobado en github.com, el 8 de septiembre de 2026).

Su superficie de línea de comandos es genuinamente buena, y mejor que la de un navegador para este trabajo: `--margin-top` y sus hermanos fijan márgenes en unidades reales, `--header-html` y `--footer-html` aceptan archivos HTML, `--footer-center "[page]/[topage]"` te da «3/12» al pie de cada página, `--print-media-type` hace que respete tus reglas `@media print`, y `--enable-local-file-access` es obligatorio antes de que lea imágenes y hojas de estilos desde disco. Si tienes un script que ya produce PDF aceptables con esos parámetros, no hay urgencia por sustituirlo.

El problema es el motor de debajo. Es una bifurcación de un WebKit que dejó de moverse hace años, así que una hoja de estilos escrita esta década —propiedades personalizadas, grid, comportamiento moderno de flexbox— puede renderizarse como algo que no diseñaste, sin ningún error. No empieces trabajo nuevo aquí.

### Chrome sin interfaz

`chrome --headless --print-to-pdf=out.pdf report.html` usa exactamente el motor que usa el diálogo de impresión, así que la salida coincide con lo que viste en pantalla. Ese es todo su argumento, y es sólido.

La pega es que las casillas del diálogo no están en la línea de comandos. Chrome aplica sus propios márgenes por defecto, y si estampa la banda de URL y número de página depende de un parámetro cuyo nombre ha cambiado entre versiones — ejecuta `chrome --help` en la versión que tengas en vez de copiar un parámetro de una entrada de blog. Todo lo demás que quieras tiene que estar en el propio CSS de impresión del documento, que es de todos modos el lugar correcto para ello.

Puppeteer elimina esa incertidumbre. Su llamada `page.pdf()` acepta `format`, `margin`, `printBackground`, `displayHeaderFooter`, `headerTemplate` y `footerTemplate`, así que el tamaño de papel, los márgenes y un pie que se repite viven en código junto a todo lo demás de tu build. `printBackground: true` es el arreglo para el sombreado de bloque de código que falta y que atrapa a todo el mundo la primera vez. Puppeteer es gratis y tiene licencia Apache 2.0; descarga su propio Chromium, lo que es un coste grande de una sola vez en una caché de CI.

### WeasyPrint

WeasyPrint es una biblioteca de Python y herramienta de línea de comandos, con licencia BSD, y no es un navegador. Su documentación dice que está «based on various libraries but not on a full rendering engine like WebKit or Gecko», con un motor de maquetación CSS escrito en Python y diseñado para paginación (comprobado en doc.courtbouillon.org, el 8 de septiembre de 2026).

Esa decisión de diseño es lo importante. Soporta la regla `@page` con los selectores `:left`, `:right`, `:first` y `:blank`, cajas de margen de página, contadores basados en página, y las propiedades `bookmark-level`, `bookmark-label` y `bookmark-state` que construyen el esquema del PDF — los títulos se convierten en marcadores por defecto. Tanto los anclajes internos como las URLs externas salen como enlaces pulsables (todo comprobado en doc.courtbouillon.org, el 8 de septiembre de 2026). Los navegadores no implementan ninguna de las cajas de margen, así que esta es la única vía de esta página que te da una cabecera que se repite de verdad en CSS en lugar de en LaTeX.

El coste es la otra mitad de la misma decisión. Su propia documentación describe flexbox como funcionando «for simple use cases but not deeply tested» y grid como funcionando «for simple cases, but has some limitations» (comprobado en doc.courtbouillon.org, el 8 de septiembre de 2026). Dale un documento, no la maqueta de una aplicación, y es excelente.

**¿Quién debería usarlos?** Cualquiera cuyo PDF tenga que producirlo una máquina en un horario: un informe cada noche, una factura generada, un PDF adjunto a cada versión. Elige Chrome o Puppeteer si el documento ya es una página web que te gusta; elige WeasyPrint si necesitas cabeceras que se repiten, contadores de página y marcadores, y prefieres escribir CSS antes que LaTeX.

## Editores que exportan un PDF directamente

La vía más corta de todas, cuando el archivo ya está abierto delante de ti. Cada una de estas es una de las vías de arriba con un elemento de menú encima —la mayoría llevan un motor de navegador integrado— así que la pregunta es solo si la exportación es lo bastante buena y si puedes repetirla.

| Editor | Cómo exporta | Precio y licencia |
| --- | --- | --- |
| Typora | «Exportar a PDF con marcadores», más docx, LaTeX, EPUB y otros | 14,99 $ sin impuestos, una licencia que cubre hasta 3 dispositivos, prueba gratis de 15 días (comprobado en typora.io, el 8 de septiembre de 2026) |
| Obsidian | Exportar a PDF integrado desde la nota | Gratis para cualquier uso, incluido el comercial; una licencia comercial es opcional a 50 $ por usuario al año (comprobado en obsidian.md/pricing, el 8 de septiembre de 2026) |
| VS Code | Una extensión; la mayoría incluye o descarga un Chromium e imprime con él | Gratis, pero la calidad de la extensión es cosa de la extensión |
| Word o LibreOffice | Convierte Markdown a `.docx` con Pandoc, y luego exporta desde la suite | Gratis con LibreOffice |

Precios y condiciones comprobados en typora.io y obsidian.md, el 8 de septiembre de 2026.

VS Code es el único editor de la tabla sin exportación a PDF propia. Markdown PDF es una de las extensiones que la añaden: maneja un navegador basado en Chromium a través de Puppeteer y escribe también HTML, PNG o JPEG con los mismos ajustes, y la hoja de estilos de la vista previa no es la que usa para imprimir — [Markdown a HTML en VS Code](/blog/markdown-to-html-in-vs-code) repasa esos ajustes y lo que cada vía de exportación pone alrededor de la página.

| A favor | En contra |
| --- | --- |
| Un elemento de menú, sin terminal, sin arqueología de diálogos | El estilo es el del tema del editor, no el de tu documento |
| El tema suele estar pensado para leer, así que el aspecto por defecto vale | No es programable, así que no puede formar parte de un build |
| Marcadores y un esquema pulsable en los mejores | Atado a esa aplicación, en esa máquina |
| El desvío por `.docx` deja un archivo que alguien puede editar | Cada salto a otro formato pierde algo |

El desvío por `.docx` merece su propia nota, porque resuelve un problema que ninguna otra vía resuelve. Si la persona que recibe el documento va a querer cambiarlo, un PDF es un callejón sin salida y un archivo de Word no lo es. `pandoc report.md -o report.docx --reference-doc=house-style.docx` aplica tus propios estilos, y LibreOffice convertirá el resultado en un servidor con `soffice --headless --convert-to pdf report.docx`. Dos conversiones es una más de lo ideal, y es el precio de entregarle a alguien algo que puede editar — y si el `.docx` es el entregable en vez de una escala, [conseguir un archivo de Word que alguien pueda editar a partir de Markdown](/blog/markdown-to-word) es donde se trabaja bien el documento de referencia, los estilos que Pandoc busca y el coste del viaje de vuelta.

**¿Quién debería usarlo?** Escritores, para borradores y para cualquier cosa donde «se ve razonable» sea la vara de medir. No para builds, y no para documentos con un estilo corporativo que respetar.

## Lo que la gente hace mal

Cinco cosas se rompen en los PDF hechos a partir de Markdown, y se rompen igual sin importar la vía que hayas tomado.

| Síntoma | Causa | Arreglo |
| --- | --- | --- |
| Los bloques de código y las tablas perdieron su sombreado | «Gráficos de fondo» está desactivado por defecto en el diálogo de impresión | Actívalo, o pasa `printBackground: true` en Puppeteer |
| Un título se queda solo al final de una página | Nada le dijo al motor que lo mantuviera con su texto | `break-after: avoid` en los títulos, `break-inside: avoid` en tablas y figuras |
| El cuerpo del texto salió más pequeño de lo esperado | «Ajustar al área imprimible» redujo todo el documento para que cupiera un elemento ancho | Encuentra la tabla o la línea de código demasiado ancha y arréglala, luego imprime al 100% |
| La primera página tiene una ruta de archivo en la parte de arriba | «Cabeceras y pies» está activado | Desactívalo, o usa un motor donde controles el pie |
| Las líneas de código largas se cortan en el margen | LaTeX no envuelve el texto verbatim | Corta las líneas en la fuente, o usa una vía con ajuste de línea suave |
| Faltan imágenes por completo | Rutas relativas que ya no resuelven desde donde está el HTML | Incrusta las imágenes, o convierte con el archivo en su sitio |
| Un carácter salió como una caja, o no salió | La tipografía incrustada no tiene glifo para él | Cambia la tipografía, o el motor, y deja de usar emoji en impresión |
| Cada página es A4 en tu máquina y Carta en la de ellos | Ningún tamaño de página en el documento, así que el motor usó el valor por defecto de la configuración regional | Declara `@page { size: A4 }` o pasa el tamaño explícitamente |

### Saltos de página

Markdown no tiene salto de página. No hay sintaxis para ello, ninguna extensión que lo añada de forma portátil, y ninguna cantidad de líneas en blanco lo va a lograr. Fuerzas un salto poniendo HTML en crudo dentro del archivo Markdown:

```markdown
Texto antes del salto.

<div style="break-after: page"></div>

Texto en la página siguiente.
```

`break-after: page` es la propiedad CSS actual; `page-break-after: always` es el alias antiguo que los motores viejos todavía quieren, e incluir los dos es inofensivo. Entonces pueden pasar dos cosas malas. La primera es que un conversor que ignora el HTML en crudo —la vía LaTeX de Pandoc entre ellos— descarta tu `div` y el salto con él; bajo LaTeX quieres un `\newpage` en un bloque crudo en su lugar. La segunda es que un conversor que limpia el contenido eliminará el atributo `style`, porque los estilos en línea son exactamente el tipo de cosa que una lista de permitidos elimina, y tu salto desaparece sin ningún aviso. [Por qué limpiar quita más que scripts](/blog/sanitising-markdown-safely) explica qué suele sobrevivir y qué no.

### Márgenes

Tres partes fijan tus márgenes y solo una de ellas gana: el diálogo de impresión, la regla `@page` del documento, y el borde no imprimible de la impresora física. Decide cuál es la autoridad y deja las otras en paz. Para un PDF que se leerá en pantalla, pon el margen en el CSS y deja el diálogo en el valor predeterminado. Para un PDF que se imprimirá en un dispositivo concreto, deja al menos 10mm y pruébalo en ese dispositivo, porque «Márgenes: Ninguno» produce un archivo cuyos bordes una impresora láser recortará.

### Cabeceras y pies

Esta es la línea divisoria más clara entre las vías. El navegador te da una única banda, con su contenido y su tipografía elegidos por él, encendida o apagada. Cualquier otra cosa —un título de documento a la izquierda, un número de página a la derecha, nada en absoluto en la primera página— necesita cajas de margen de CSS, que los navegadores no implementan, o LaTeX, que lo hace mediante un paquete. Si tu documento tiene que llevar una cabecera que se repite, has elegido WeasyPrint o LaTeX, lo quisieras o no.

### Que los enlaces sobrevivan

Los enlaces pulsables en un PDF son anotaciones colocadas sobre el texto, y si se escriben o no depende del motor, así que la única comprobación fiable es abrir el PDF terminado y pulsar uno. Los enlaces internos —un índice a un título— dependen de que el HTML intermedio le dé ids a esos títulos, cosa que un conversor puede generar o no. Para un documento que se imprimirá en papel, los enlaces son invisibles, y una regla de impresión lo arregla:

```css
@media print {
  a[href^="http"]::after {
    content: " (" attr(href) ")";
  }
}
```

Eso imprime la URL entre paréntesis después del texto del enlace, lo cual es feo en pantalla y la única opción legible en papel. Los enlaces relativos y las imágenes tienen su propio modo de fallo, ya que un PDF no puede resolver `../imagenes/diagrama.png` después del hecho: [las rutas que siguen funcionando cuando el archivo se mueve](/blog/images-and-links-that-still-work) es la versión de este problema que encuentras primero.

### Incrustación de tipografías

Un PDF lleva un subconjunto de cada tipografía que usa de verdad, que es lo que hace que se vea igual en todas partes — y solo puede llevar una tipografía que estuviera disponible en el momento en que se hizo el archivo. Se siguen dos modos de fallo. Un documento que pide una tipografía web por red, convertido con la red no disponible, cae en silencio a otra y la incrusta en su lugar; el PDF no está roto, sencillamente no es tu diseño. Un documento que nombra una pila de tipografías del sistema incrusta lo que tuviera esa máquina en concreto, así que tú y un colega producís PDF visualmente distintos a partir del mismo Markdown y el mismo comando.

El arreglo es ser explícito. Nombra una tipografía, distribúyela junto al documento o instálala en la máquina de build, y deja que la pila caiga a una serif genérica que se sustituirá de forma predecible. Comprueba el resultado: cualquier lector de PDF listará las tipografías incrustadas en sus propiedades de documento, y una tipografía listada como «Type 3» o como no incrustada es una tipografía que tu lector no verá.

## Dónde falla la vía del navegador, y qué cuesta dejarla atrás

Imprimir desde el navegador es la opción correcta por defecto y tiene un techo duro. Merece la pena nombrar ese techo con precisión, porque la mayoría no necesita pasarlo, y quienes sí deberían saber qué están comprando.

| Lo que no puedes hacer en un navegador | Por qué | Qué cuesta arreglarlo |
| --- | --- | --- |
| Una cabecera o pie de tu propio diseño | Los navegadores no implementan las cajas de margen de CSS | WeasyPrint, o LaTeX vía Pandoc |
| Un índice con números de página | La página en la que cae un título no se sabe hasta que la maquetación termina | `--toc` de Pandoc, o un motor con contadores de página |
| Una referencia cruzada como «ver página 14» | Por el mismo motivo | LaTeX, o los contadores de WeasyPrint |
| Producir el archivo sin nadie presente | Un diálogo necesita a una persona | Chrome sin interfaz, Puppeteer, o WeasyPrint |
| Un solo PDF a partir de doce archivos de capítulo | El navegador imprime un documento | Fusiona el Markdown primero, o fusiona los PDF después |
| Garantizar que no quede ningún título huérfano | El control de saltos entre motores es aproximado | Saltos manuales, y un lector que revise |

Cada arreglo tiene un precio, y los precios no son equivalentes. LaTeX te compra la mejor página de esta lista al coste de la instalación más grande y un lenguaje de plantillas que aprender; la plantilla es un coste único, pero es un coste único de verdad y alguien tiene que ser su dueño. WeasyPrint te compra reglas de página en CSS al coste de una dependencia de Python y un motor de maquetación que no es un navegador, así que una hoja de estilos construida sobre grid necesitará reescribirse. Chrome sin interfaz te compra repetibilidad al coste de un navegador en tu imagen de build, que no es poco y necesita actualizarse por las mismas razones de seguridad que tu portátil. wkhtmltopdf te compra parámetros cómodos y te entrega una dependencia archivada, que es una deuda con fecha de vencimiento.

El caso de múltiples archivos es el que la gente encuentra antes y espera menos. Un manual de doce capítulos son doce archivos `.md`, y un PDF es un documento, así que algo tiene que unirlos —en el orden correcto, con los niveles de título desplazados para que el `#` del capítulo dos no compita con el título del documento. [Convertir muchos archivos Markdown en uno solo](/blog/merging-many-markdown-files) es un trabajo separado de convertirlo, y hacerlo en el orden equivocado es como un índice termina con tres entradas de «Introducción».

## Cómo elegir

1. **Empieza por quién produce el archivo.** Si una persona hace el PDF cuando se necesita, imprime desde el navegador y deja de leer; si una máquina lo hace con un horario, necesitas Chrome sin interfaz, Puppeteer o WeasyPrint, porque un cuadro de diálogo no se puede automatizar.
2. **Pregúntate si el documento necesita mobiliario de página.** Cabeceras que se repiten, capítulos numerados y un índice con números de página descartan el navegador por completo, y ese único requisito es lo que justifica instalar LaTeX o WeasyPrint.
3. **Cuenta los glifos antes de contar las funciones.** Un documento con chino, griego, cirílico o notación matemática fallará con pdflatex y funcionará con xelatex, y descubrirlo en el primer build es más barato que descubrirlo en la fecha límite.
4. **Empareja el motor con el CSS que ya has escrito.** Si tu hoja de estilos usa grid, solo un motor de navegador la maquetará correctamente; si es una hoja de estilos de documento con reglas `@page`, WeasyPrint hará más con ella que un navegador.
5. **Decide si alguien tiene que editarlo después.** Un PDF es definitivo, y si la respuesta es sí quieres `.docx` en medio de la cadena, lo que cambia la herramienta y el esfuerzo.
6. **Imprime una página real y mírala.** No la vista previa — el PDF terminado, abierto en un lector distinto, con el panel de tipografías revisado y un enlace pulsado. Esa única prueba atrapa a la vez fondos que faltan, tipografías sustituidas, enlaces muertos y líneas de código recortadas, y tarda dos minutos.

## Conclusión

PDF a partir de Markdown es siempre un trabajo de dos pasos, y la pregunta honesta es con qué formato intermedio quieres discutir. Para un documento con un destinatario, convierte el Markdown a un archivo HTML completo y autónomo e imprímelo desde tu navegador con los fondos activados y las cabeceras desactivadas — que es para lo que sirve [la conversión de Markdown a HTML de TransformPipe](/), gratis, en el navegador, sin que se suba nada mientras no has iniciado sesión. Para un documento largo con mobiliario de página, instala Pandoc y xelatex, escribe la plantilla una vez y no vuelvas a pensar en ella. Para un PDF que tiene que aparecer sin nadie presente, pon las reglas de página en CSS y deja que Chrome sin interfaz o WeasyPrint hagan la impresión. Las tres son gratis; la diferencia está enteramente en lo que estás dispuesto a instalar y mantener.

## Preguntas frecuentes

### ¿Cómo convierto Markdown a PDF sin instalar nada?

Convierte el Markdown a un archivo HTML completo en un conversor basado en navegador, abre el archivo, e imprímelo a PDF con el propio diálogo de impresión de tu navegador. Sin gestor de paquetes, sin terminal, y con un conversor que funciona en el propio cliente el documento nunca se sube. Recuerda activar los gráficos de fondo y desactivar cabeceras y pies antes de guardar.

### ¿Por qué mi PDF pierde los fondos de los bloques de código?

Porque «Gráficos de fondo» está desactivado por defecto en el diálogo de impresión, para ahorrar tinta en las impresoras físicas. También quita las rayas de las tablas y los avisos con color, así que un documento técnico se ve plano y deslavado. Actívalo en el diálogo, o pasa `printBackground: true` si imprimes con Puppeteer.

### ¿Cómo fuerzo un salto de página en Markdown?

No hay sintaxis de Markdown para ello. Insertas HTML en crudo —`<div style="break-after: page"></div>`— y esperas que el conversor lo deje pasar, o añades `\newpage` en un bloque LaTeX crudo si conviertes con Pandoc. Los conversores que limpian el contenido eliminarán el estilo en línea, así que prueba el salto en vez de asumir que sobrevivió.

### ¿Pandoc es la mejor forma de convertir Markdown a PDF?

Produce los mejores documentos largos, y es la opción más pesada: `pandoc file.md -o file.pdf` necesita un motor LaTeX instalado, y una distribución completa de TeX es la dependencia más grande de la mayoría de cadenas documentales. Para un informe con secciones numeradas y un índice merece cada gigabyte. Para una nota de una página es más herramienta de la que el trabajo necesita.

### ¿Los hiperenlaces siguen funcionando en un PDF generado desde Markdown?

Normalmente, pero depende del motor, así que abre el archivo terminado y pulsa uno. Los enlaces internos a títulos solo funcionan si el HTML intermedio le dio ids a esos títulos, cosa que no todos los conversores hacen. Para un documento que se va a imprimir, añade una regla de impresión que agregue la URL entre paréntesis después de cada enlace, porque un enlace pulsable en papel es solo texto subrayado.

### ¿Por qué las tipografías se ven distintas en el PDF que en pantalla?

Un PDF incrusta solo las tipografías disponibles en el momento en que se hizo. Si el documento pedía una tipografía por red y la red no estaba, o nombraba una tipografía del sistema que tiene tu máquina y el servidor de build no, el motor sustituyó algo y no te lo dijo. Comprueba las tipografías incrustadas en las propiedades del documento de tu lector de PDF y nombra una tipografía que de verdad distribuyas.

### ¿Puedo generar un PDF desde Markdown en un trabajo de CI?

Sí, y hay tres formas sensatas: Pandoc con una imagen de TeX, Chrome sin interfaz o Puppeteer contra tu HTML convertido, o WeasyPrint. Chrome da una salida idéntica a la de un navegador y necesita un navegador en la imagen; WeasyPrint es una dependencia pequeña de Python y te da reglas de página reales en CSS. Cualquiera que elijas, pon el tamaño de papel y los márgenes en el documento en vez de en parámetros, para que el mismo archivo se imprima igual a mano.
