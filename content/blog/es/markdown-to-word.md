---
title: "Markdown a Word: cómo conseguir un .docx que alguien pueda editar"
description: Pasar Markdown a un .docx editable por un revisor - Pandoc con documento de referencia, la vía HTML, Google Docs, y qué se pierde al volver a Markdown.
updated: 2026-10-21
date: 2026-08-24
tag: Publicación
keywords: markdown a word, markdown a docx, convertir markdown a documento word, pandoc reference docx, md a docx, markdown a word online, plantilla pandoc markdown a word
---

Nadie convierte Markdown a Word por su propio beneficio. Pasa porque otra persona —un abogado, un cliente, un jefe de departamento, un regulador— trabaja en Word, controla cambios en Word, y no va a leer un archivo que llega como texto con almohadillas dentro. La conversión es una concesión, y la pregunta es cuál concesión cuesta menos.

### Resumen rápido

Usa Pandoc con un documento de referencia: `pandoc informe.md --reference-doc=casa.docx -o informe.docx`. El documento de referencia es un `.docx` normal cuyos estilos Pandoc copia a la salida, así que el archivo que abre tu revisor lleva los títulos, márgenes y texto de cuerpo de tu organización en vez de los valores por defecto de Pandoc. La vía de convertir a HTML y abrir en Word es más rápida y produce un documento sin ningún conjunto de estilos utilizable, lo cual está bien para una nota y mal para cualquier cosa que se vaya a restilizar. Y sabe antes de empezar que el viaje de vuelta tiene pérdidas: los cambios controlados se pueden leer del `.docx` devuelto, pero llegan como anotaciones en línea que no puedes aceptar ni rechazar, así que trata las ediciones del revisor como consejos que hay que volver a aplicar a mano.

Markdown y `.docx` no son dos codificaciones de lo mismo. Markdown es un pequeño conjunto de marcas estructurales —esto es un título, esto es una lista, esto es un enlace— y nada más. Un `.docx` es un archivo zip de XML en el que cada párrafo apunta a un estilo con nombre, los estilos viven en una hoja de estilos, la numeración vive en su propia parte, y el conjunto lleva tamaño de página, márgenes, cabeceras, pies y un historial de revisiones. Pasar de lo primero a lo segundo significa inventar todo lo que tiene lo segundo y no tiene lo primero.

Esa invención es todo el trabajo, y es donde las vías se diferencian. Pandoc inventa a partir de una plantilla que controlas. Word, al abrir un archivo HTML, inventa a partir de CSS y sus propios estilos orientados a la web. Google Docs inventa a partir de los estilos de Google. El botón de exportar de un editor suele inventar a partir de los valores por defecto de Pandoc, porque casi todos son Pandoc con un elemento de menú delante.

Lo segundo que conviene saber de entrada: si el revisor solo necesita leer el documento, nada de esto aplica. Un PDF o una página HTML autónoma es un mejor artefacto que un `.docx`, y [convertir Markdown a PDF](/blog/markdown-to-pdf) es un camino más corto con menos cosas que puedan salir mal. Word solo se gana su complejidad cuando alguien va a editar.

## Por qué surge esto: el revisor trabaja con cambios controlados

La petición casi nunca es «mándame formato Word». Es «necesito comentar esto», y en la mayoría de organizaciones comentar significa la cinta de Revisar de Word: inserciones en subrayado de color, eliminaciones tachadas, un margen lleno de globos de comentario con nombres, y un botón de aceptar o rechazar por cada uno. Ese flujo de trabajo tiene décadas, es en lo que se forman los equipos legales y de cumplimiento, y no tiene equivalente en un archivo Markdown.

Git tiene un equivalente, claro. Una pull request con comentarios de línea hace el mismo trabajo mejor y conserva el historial. Pero no le puedes enviar una pull request al asesor jurídico de alguien, y la reunión donde explicas que debería aprender una es una reunión que vas a perder. Así que el documento sale del repositorio como `.docx` y vuelve como un `.docx` con las ediciones de otra persona dentro, y la pregunta técnica interesante es qué haces en ese momento.

Es habitual equivocarse en esto de una forma específica y cara. Un equipo exporta a Word, el revisor pasa dos días marcándolo, el archivo vuelve, y el equipo descubre que reconciliar cuarenta inserciones controladas contra una fuente Markdown es trabajo manual que nadie presupuestó — o peor, que alguien ha aceptado todos los cambios, convertido de vuelta, y producido un commit que reescribe cada línea del archivo porque el conversor envuelve los párrafos de otra manera. Decidir la ruta de vuelta antes de enviar nada es la diferencia entre una revisión y un incidente.

## Comparativa rápida: la chuleta

| Vía | Mejor para | Qué necesita | Qué te cuesta |
| --- | --- | --- | --- |
| Pandoc con `--reference-doc` | Cualquier documento que deba parecer de tu organización | Pandoc instalado, una plantilla `.docx` que hayas editado | Una tarde construyendo la plantilla, una sola vez |
| Pandoc sin documento de referencia | Un borrador donde el aspecto es irrelevante | Pandoc instalado | Los estilos por defecto de Pandoc, que no se parecen a nada en concreto |
| Convertir a HTML, abrir en Word | Una nota corta que nadie va a restilizar | Un conversor de Markdown a HTML y Word | Ningún conjunto de estilos usable; el CSS llega como formato directo |
| HTML autónomo, luego LibreOffice sin interfaz | Automatizar lo anterior en un servidor | LibreOffice instalado, sin licencia de Word | La interpretación de LibreOffice de tu CSS |
| Google Docs como intermediario | Equipos ya en Google Workspace | Una cuenta de Google | El documento vive en los servidores de Google; obtienes los estilos de Google |
| Typora, VS Code y editores similares | Un archivo, desde la aplicación en la que ya estás | El editor, más Pandoc para el `.docx` | Normalmente no hay forma de pasar un documento de referencia |
| Writage, dentro de Word | Revisores que nunca van a salir de Word | Un plugin de pago para Word en su máquina | Una instalación y una licencia por máquina |
| Pegar Markdown renderizado en Word | Dos párrafos, ahora mismo | Una vista previa renderizada y un portapapeles | Formato directo en todo; las imágenes pueden desaparecer |
| Markdown a PDF en su lugar | Un revisor que lee pero no edita | Cualquiera de las vías de PDF | Sin edición, sin comentarios en el propio archivo |
| python-docx, construyendo el archivo tú mismo | Un documento generado con requisitos exactos | Python, y una especificación | Ahora estás escribiendo un escritor de Word |

## Pandoc y el documento de referencia, explicado a fondo

Pandoc es la respuesta de verdad aquí, y el documento de referencia es la parte que la gente se salta. Convertir sin uno funciona —`pandoc informe.md -o informe.docx` produce un archivo Word válido— y produce un documento que se ve como un documento de Pandoc: en un Calibri aproximado, generosamente espaciado, con títulos en un azul que nadie eligió. Los revisores leen eso como un borrador de fuera de la organización, que es lo que es.

### Lo que un .docx conserva y Markdown no tiene

Renombra un `.docx` a `.zip` y ábrelo. Dentro, `word/document.xml` guarda el texto, y casi cada párrafo lleva un elemento `w:pStyle` que nombra un estilo: `Heading 1`, `Body Text`, `Source Code`. El estilo mismo —tipografía, tamaño, espaciado, color, mantener con el siguiente, nivel de esquema— vive en `word/styles.xml`. Las definiciones de numeración para las listas viven en `word/numbering.xml`. El tamaño de página, los márgenes, las cabeceras y los pies viven en las propiedades de sección.

Esta indirección es por lo que los documentos de Word son editables de una forma en que un PDF no lo es. Un revisor que cambia el estilo `Heading 2` cambia todos los títulos de segundo nivel a la vez. Un documento cuyo formato se aplicó directamente —negrita aquí, 14pt allí— se ve idéntico y no se puede restilizar en absoluto, y cada vía de este artículo salvo Pandoc con una plantilla produce cierta cantidad de ese formato directo.

### Cómo funciona --reference-doc

`--reference-doc=ARCHIVO` está documentado como: «Use the specified file as a style reference in producing a docx or ODT file». Lo que Pandoc toma de ese archivo son sus hojas de estilos y sus propiedades de documento, incluidos márgenes, tamaño de página, cabecera y pie (comprobado en pandoc.org, el 8 de septiembre de 2026). Tu contenido se escribe dentro de esa carcasa.

El mecanismo es contundente y esa es su virtud. Pandoc escribe un párrafo, lo etiqueta `Heading 1`, y Word busca `Heading 1` en la hoja de estilos que vino de tu archivo de referencia. No hay capa de mapeo que configurar ni lenguaje de plantillas que aprender. Si el estilo existe en el documento de referencia, tu salida lo usa. Si no existe, Word renderiza una referencia a un estilo que no encuentra como texto `Normal` llano — que es exactamente por qué los bloques de código salen pareciendo texto de cuerpo cuando alguien usa el papel con membrete de la empresa como documento de referencia sin añadirle un estilo `Source Code`.

### Los nombres de estilo que busca Pandoc

Esta es la lista que merece la pena pegar en la pared, porque un documento de referencia solo es tan bueno como su cobertura de ella. Los estilos de párrafo que usa el escritor de docx son `Normal`, `Body Text`, `First Paragraph`, `Compact`, `Title`, `Subtitle`, `Author`, `Date`, `Abstract`, `AbstractTitle`, `Bibliography`, `Heading 1` hasta `Heading 9`, `Block Text`, `Footnote Block Text`, `Source Code`, `Footnote Text`, `Definition Term`, `Definition`, `Caption`, `Table Caption`, `Image Caption`, `Figure`, `Captioned Figure` y `TOC Heading`. Los estilos de carácter son `Default Paragraph Font`, `Verbatim Char`, `Footnote Reference`, `Hyperlink` y `Section Number`. Hay un estilo de tabla, llamado `Table` (comprobado en pandoc.org, el 8 de septiembre de 2026).

Lee esa lista como un mapa de lo que Pandoc puede expresar. `Source Code` y `Verbatim Char` son por lo que los bloques delimitados y el código en línea pueden parecer código. `Block Text` es tu cita. `Image Caption` y `Captioned Figure` son en lo que se convierte `![Un pie](diagrama.png)`. `Definition Term` y `Definition` solo importan si usas la sintaxis de listas de definición de Pandoc. Si tu plantilla de casa no define ninguno de estos, esa es la tarea de la tarde.

### Construir un documento de referencia, paso a paso

1. **Empieza desde el propio valor por defecto de Pandoc en vez de un archivo en blanco**, con `pandoc -o referencia-propia.docx --print-default-data-file reference.docx`. Ya contiene cada estilo de la lista de arriba, correctamente conectado, incluidas las definiciones de numeración de listas — así que estás restilizando un documento que funciona en vez de descubrir tres días después que las listas numeradas salen como párrafos llanos.
2. **Ábrelo en Word y modifica los estilos, nunca el texto.** Haz clic derecho en un estilo en la galería de estilos, elige Modificar, y cambia ahí la tipografía, el tamaño, el espaciado y el color. El formato aplicado directamente al texto de muestra no logra nada, porque tu contenido lo sustituye.
3. **Haz primero los títulos y comprueba el nivel de esquema de cada uno.** El panel de navegación de Word, el índice y cada exportación a PDF que hagas después leen todos los niveles de esquema, así que un `Heading 2` que parece un título pero se queda al nivel de texto de cuerpo va a producir un documento que no se puede navegar.
4. **Fija el tamaño de página, los márgenes, la cabecera y el pie en el documento de referencia, no por conversión.** Son propiedades del documento y Pandoc las traslada, lo que significa que el documento de referencia es también donde vive el mobiliario de tu página — un pie con un número de documento, digamos, aparece en cada conversión sin que se mencione en ningún comando.
5. **Si tienes que empezar desde una plantilla de casa en vez de esto, añade por nombre los estilos que le faltan.** Las plantillas corporativas casi siempre tienen `Heading 1` a `Heading 4` y nada más de la lista; `Source Code`, `Verbatim Char`, `Block Text`, `Image Caption`, `Table Caption` y el estilo de tabla `Table` son los huecos habituales, y cada estilo que falta es una categoría de contenido que llega sin formato.
6. **Prueba con un documento que use todo.** Un archivo con nueve niveles de título, una lista numerada anidada dentro de una sin numerar, una cita, un bloque de código delimitado con un idioma, código en línea, una nota al pie, un enlace, una imagen con pie de foto y una tabla de tres columnas. Convierte ese archivo, ábrelo, y mira. Ese archivo pertenece al repositorio, junto a la plantilla.
7. **Sube el documento de referencia al repositorio junto al Markdown.** Es una entrada del build, va a quedarse desactualizado cuando alguien rehaga la marca, y una plantilla que vive en la carpeta de Descargas de una persona es una plantilla que deja de existir cuando esa persona se marcha.

### Los parámetros que importan para el escritor de docx

| Parámetro | Qué hace |
| --- | --- |
| `--reference-doc=ARCHIVO` | Los estilos y las propiedades de documento vienen de `ARCHIVO` |
| `--toc` | Inserta un índice construido a partir de los títulos |
| `-N`, `--number-sections` | Numera los títulos de sección; el manual nombra Docx entre las salidas soportadas |
| `--highlight-style=NOMBRE` | Elige el tema de resaltado de sintaxis para bloques de código; `--list-highlight-styles` imprime las opciones |
| `--resource-path=DIRS` | Dónde buscar las imágenes referenciadas por ruta relativa |
| `--dpi=NÚMERO` | Conversión de píxeles a pulgadas para el tamaño de imagen; el valor por defecto es 96 |
| `--lua-filter=ARCHIVO` | Reescribe el documento a mitad de la conversión, antes de que lo vea el escritor |
| `--metadata-file=ARCHIVO` | Aporta título, autor y fecha sin tocar el Markdown |

Todas estas son opciones actuales de Pandoc (comprobado en pandoc.org, el 8 de septiembre de 2026). Hay dos cosas más que conviene saber sobre el escritor. Las imágenes se meten dentro del paquete `.docx`, así que la salida es un archivo autónomo en vez de un documento con enlaces a tu sistema de archivos — pero solo si Pandoc puede encontrarlas, que es para lo que sirve `--resource-path`, y por lo que [las rutas e imágenes que siguen funcionando](/blog/images-and-links-that-still-work) merece leerse antes de mover una carpeta. Y el HTML en crudo de tu Markdown se descarta: un `<div>` o un `<br>` llega al escritor de HTML y no al de docx, así que un archivo Markdown que se apoya en HTML en línea para la maquetación pierde esa maquetación en silencio.

Dos extras de Pandoc son genuinamente útiles una vez que lo básico funciona. Un `div` delimitado con un atributo `custom-style` aplica cualquier estilo de Word que quieras a su contenido —`::: {custom-style="Warning"}` envuelve un bloque en el estilo de párrafo `Warning` de tu plantilla— y el equivalente de span entre corchetes hace lo mismo para estilos de carácter. Y [las tablas](/blog/markdown-tables-that-survive-conversion) reciben el estilo de tabla `Table`, que es el único formato de tabla que consigues, así que defínelo bien y no esperes nada elegante sobre el ancho de las columnas.

**¿Para quién es?** Para cualquiera que vaya a hacer esta conversión más de dos veces. La plantilla es un coste fijo pagado una vez y amortizado en cada documento después, y es la única vía de aquí que produce un `.docx` ya con los estilos de tu organización, que un usuario de Word puede seguir restilizando desde la galería de estilos.

## La vía HTML: convertir a HTML, y luego abrirlo en Word

Word abre archivos `.html`. Esto no es un truco ni es nuevo; funciona desde que Word aprendió a guardar páginas web. Convierte tu Markdown a HTML, haz doble clic en el resultado, y Word lo renderiza como un documento que luego puedes guardar como `.docx` desde Archivo, Guardar como.

Es de verdad la vía más rápida, no necesita más instalación que un conversor basado en navegador, y para un documento corto está bien. También es la vía que produce el archivo menos editable, y merece la pena ser preciso sobre por qué.

**Word asigna el HTML importado a sus propios estilos integrados orientados a la web**, no a los de tu plantilla. Los párrafos de cuerpo tienden a llegar como `Normal (Web)`, los bloques preformateados como `HTML Preformatted`. El `Body Text` de tu organización no interviene. El documento se ve razonable y no pertenece a ninguna plantilla.

**El CSS se convierte en formato directo.** Una hoja de estilos que dice `h2 { color: #1a4f7a; font-size: 20px }` no se convierte en una definición del estilo `Heading 2`; se convierte en formato aplicado a esos párrafos. El revisor que abre la galería de estilos para cambiar el color del título no encuentra nada que cambiar, y quien herede el documento después no puede restilizarlo en absoluto.

**Las tablas llegan sin estilo de tabla.** Los bordes y el relleno vienen de tu CSS como formato de celda directo, así que aplicar el aspecto de tabla de la casa significa seleccionar cada tabla y elegir un estilo a mano — lo cual también descarta lo que hacía tu CSS.

**Las imágenes solo sobreviven si están dentro del archivo.** Un archivo HTML que referencia `diagrama.png` junto a él funciona hasta que se envía el archivo solo por correo, momento en el que el revisor recibe un marcador de posición. Una exportación HTML autónoma, con las imágenes incrustadas como URIs de datos y los estilos en un bloque `<style>`, es la versión de esta vía que de verdad viaja.

**El archivo sigue siendo HTML hasta que alguien lo convierte.** Si envías el `.html` y el revisor edita y guarda, sigue editando HTML, y la salida HTML de Word tiene sus propias costumbres. Guarda como `.docx` tú mismo antes de enviarlo, y comprueba el resultado en vez de asumirlo.

**La configuración de página viene de la nada.** Sin tamaño de página, sin márgenes, sin cabecera ni pie, porque el HTML no tenía nada de eso. Para un documento que se va a imprimir o paginar, eso es un conjunto de decisiones que alguien ahora tiene que tomar a mano.

Para automatizar, la misma vía corre sin Word en absoluto: produce HTML autónomo, y luego `soffice --headless --convert-to docx informe.html`. LibreOffice hace un trabajo competente y su interpretación de tu CSS es la suya, así que pruébala una vez en vez de confiar en ella.

**¿Para quién es?** Documentos puntuales donde el revisor va a comentar y no a restilizar — una nota de dos páginas, una especificación enviada para una sola ronda de observaciones. No para nada que entre en un conjunto de documentos gobernado por plantilla.

El formato directo viene del HTML que queda en medio, no de convertir en un navegador. La [conversión de Markdown a Word](/markdown-to-word) de este mismo sitio escribe el `.docx` en el navegador directamente a partir del Markdown, sin paso por HTML: los títulos usan los estilos integrados de Word Heading 1 a 6 (Título 1 a 6 en un Word en español), las listas usan la numeración propia de Word, las notas quedan al pie de la página, y las tablas llevan el estilo Table Grid (Tabla con cuadrícula) con una fila de encabezado que se repite en cada página. No admite documento de referencia, así que el archivo llega con su propio aspecto por defecto y no con el de tu organización; como los estilos llevan los nombres integrados de Word, una plantilla de la casa aplicada después en Word puede restilizarlos, pero para un documento que produces cada semana Pandoc con un documento de referencia sigue siendo menos trabajo.

## Google Docs como intermediario

Google Docs lee y escribe Markdown de forma nativa. En Docs, Archivo, Abrir, Subir archivo toma un archivo `.md` y lo abre como documento; desde Drive, haz clic derecho en el archivo subido y Abrir con Google Docs. El proceso inverso es Archivo, Descargar, Markdown (.md). Hay también un ajuste en Herramientas, Preferencias llamado Activar Markdown que enciende Copiar como Markdown y Pegar desde Markdown para mover fragmentos (comprobado en support.google.com, el 8 de septiembre de 2026).

Eso convierte a Docs en una vía de dos pasos hacia Word: importa el Markdown, y luego Archivo, Descargar, Microsoft Word (.docx). No requiere instalar nada ni usar terminal, que es por lo que sigue recomendándose.

| A favor | En contra |
| --- | --- |
| Sin instalar, sin línea de comandos, funciona desde cualquier máquina | El documento se sube a los servidores de Google |
| Importar y exportar son ambas funciones propias de primera parte | Obtienes los estilos de Google — Title, Heading 1 a 6, Normal text— no los de tu plantilla |
| El revisor puede comentar en Docs y saltarse el `.docx` por completo | Sin equivalente a `Source Code`, así que los bloques de código llegan como formato directo monoespaciado |
| El modo de sugerencias es un flujo de revisión real con un registro de auditoría real | Las sugerencias no sobreviven a la exportación a Markdown; obtienes el texto actual |

Lo genuinamente interesante de esta vía es que puede eliminar la necesidad de Word. Si la objeción del revisor es «necesito comentar y sugerir cambios», el modo de sugerencias de Docs hace eso, con nombres, fechas y un control de aceptar o rechazar, en un navegador, sin ningún archivo yendo y viniendo. Es mejor respuesta que un viaje de ida y vuelta con `.docx` siempre que la organización lo acepte — y el mismo problema de reconciliación espera al final, porque la exportación a Markdown te da el texto resuelto y no las sugerencias.

El coste está en a dónde va el documento. Para un README público no importa. Para un plan no publicado, un contrato o cualquier cosa bajo una obligación de confidencialidad, subirlo para convertirlo es toda la cuestión, y el hecho de que la conversión sea cómoda no cambia la respuesta.

**¿Para quién es?** Equipos ya dentro de Google Workspace, convirtiendo documentos que no son sensibles, donde el revisor se sienta cómodo en Docs.

## Editores que exportan a .docx, y qué hacen en realidad

Varios editores de Markdown tienen Word en su menú de exportar. Conviene saber qué hay detrás de ese elemento de menú, porque en la mayoría de casos es Pandoc.

**Typora** exporta a Word, ODT, RTF, EPUB, LaTeX y más — y su propia documentación dice que para formatos distintos de HTML, PDF e imágenes, Typora usa Pandoc para exportar, que hay que instalar por separado (comprobado en support.typora.io, el 8 de septiembre de 2026). Así que la exportación a Word de Typora es la exportación a Word de Pandoc con un diálogo delante, y lleva los estilos por defecto de Pandoc salvo que el editor te deje pasar argumentos adicionales. Typora cuesta 14,99 $ sin impuestos, una compra única que cubre hasta tres dispositivos, con una prueba gratis de 15 días (comprobado en typora.io, el 8 de septiembre de 2026).

**VS Code** no tiene exportación a `.docx` integrada; las extensiones la añaden, y las que lo hacen normalmente delegan también en Pandoc. Si conviertes desde un editor, saber que el motor real es Pandoc te dice dónde mirar cuando la salida está mal: en el documento de referencia, no en el editor.

**Obsidian** exporta PDF desde la propia aplicación. La exportación a Word viene de un plugin de la comunidad que llama a Pandoc, con la misma consecuencia — los estilos son los de Pandoc hasta que lo apuntas a una plantilla.

**Writage** invierte el problema. Es un plugin de Markdown para el propio Microsoft Word, disponible para Windows y macOS, que abre y guarda archivos `.md` desde dentro de Word y convierte en ambas direcciones. Es un plugin de pago vendido por una cuota única, con una prueba gratis (comprobado en writage.com, el 8 de septiembre de 2026). Su punto fuerte es la ubicación: la conversión ocurre en la máquina del revisor, en la aplicación que ya tiene abierta, lo que evita toda la pregunta de quién convierte qué y cuándo.

**Copiar y pegar** merece una mención porque la gente lo hace de todas formas. Copia la salida renderizada de un panel de vista previa o un navegador, pégala en Word, y el formato de portapapeles HTML lleva títulos, negrita, listas, enlaces y estructura de tabla razonablemente bien. Todo llega como formato directo, las imágenes son un poco de todo según cómo se referenciaran, y los bloques de código suelen perder el fondo. Para dos párrafos es el esfuerzo correcto. Para un documento, es una vía hacia un archivo que nadie puede mantener.

El punto más amplio sobre los editores: son la elección correcta cuando la conversión es ocasional y el aspecto no importa mucho, y la elección equivocada cuando forma parte de un proceso repetible, porque lo que más necesitas controlar es lo que más suelen ocultar. Qué editor te conviene es una pregunta aparte, y [la comparativa de editores](/blog/best-markdown-editors) la responde mejor que un menú de exportar.

**¿Para quién es?** Escritores que convierten sus propios documentos, uno a la vez, y ya viven en el editor.

## Dónde falla el viaje de vuelta a Markdown, y qué cuesta

Aquí va la parte honesta. Meter Markdown en Word es un problema resuelto — Pandoc más una plantilla, listo. Conseguir que el documento Word revisado vuelva a Markdown no está resuelto, y fingir lo contrario es como los equipos terminan con un repositorio que ya no coincide con el documento que todo el mundo discute.

Empieza por lo que Pandoc puede hacer, porque es más de lo que la mayoría espera. Al leer un `.docx`, `--track-changes` acepta tres valores. `accept` es el predeterminado y procesa todas las inserciones y eliminaciones. `reject` las ignora. `all` incluye inserciones, eliminaciones y comentarios, envueltos en spans con las clases `insertion`, `deletion`, `comment-start` y `comment-end`, y se incluyen el autor y la hora de cada cambio; un párrafo entero insertado o eliminado produce un span con clase `paragraph-insertion` o `paragraph-deletion` antes del salto de párrafo afectado. La opción solo afecta al lector de docx (comprobado en pandoc.org, el 8 de septiembre de 2026).

Así que la revisión se puede recuperar como datos:

```
pandoc --track-changes=all -f docx -t markdown revision.docx -o revision.md
```

Ahora los costes, en el orden en que causan más problemas.

**Los cambios dejan de ser cambios.** En Word, una inserción es una propuesta con un botón adjunto. En el Markdown convertido es un span entre corchetes con un atributo de autor — texto sobre un cambio, sentado en la prosa, que ninguna herramienta de Markdown puede aceptar ni rechazar. Lo lees y vuelves a escribir la decisión. Para un documento con una docena de ediciones son veinte minutos. Para un documento marcado línea por línea es un día, y es un día de transcripción sin ninguna prueba que te avise de cuándo te equivocaste.

**Los comentarios pierden sus anclas.** Un comentario en Word se ancla a un rango. Convertido, se vuelve un span `comment-start` y uno `comment-end`, y aunque eso funciona para una frase dentro de un párrafo, los rangos de comentario que abarcan varios párrafos o que se solapan con una eliminación controlada vuelven distorsionados o separados. Un comentario cuyo objetivo no puedes identificar es un comentario que alguien va a tener que rastrear abriendo el `.docx` original de todas formas.

**`accept` y `reject` descartan cada uno la mitad de la información.** `accept` te da texto limpio y ningún registro de quién cambió qué o por qué, que era precisamente para lo que era la revisión. `reject` te devuelve tu propio documento. Ninguna es una mala opción — sencillamente no son una revisión; son una forma de terminar una.

**El diff no vale nada salvo que normalices primero.** Este es el fallo que sorprende a la gente. Convierte un `.docx` a Markdown y la salida es el Markdown de Pandoc: su ajuste de línea, su escapado, su estilo de título, su alineación de tabla. Cada línea difiere de tu original, así que `git diff` muestra el archivo entero como cambiado y las ediciones reales del revisor quedan invisibles dentro de él. El arreglo es hacer que los dos lados hablen el mismo dialecto. Convierte tu propio Markdown por la misma cadena una vez, sube esa versión normalizada como fuente, y fija los ajustes de salida en el camino de vuelta:

```
pandoc --track-changes=all -f docx -t gfm \
  --wrap=none --markdown-headings=atx \
  revision.docx -o revision.md
```

Con los mismos parámetros en los dos lados, el diff muestra la revisión y nada más. Sin ellos, muestra una reescritura.

**Todo lo que Word puede expresar y Markdown no, se pierde sin importar los parámetros.** El resaltado de un revisor, un color usado para significar algo, un hilo de comentarios con tres respuestas, una tabla reestructurada, una colocación sugerida para una figura, una jerarquía de títulos reescrita mediante restilizado en vez de reescritura — nada de eso tiene dónde caer. El problema de reconciliación en la otra dirección, y lo que un `.docx` lleva que ningún archivo Markdown puede contener, se cubren bien en [convertir un .docx de vuelta a Markdown](/blog/convert-docx-to-markdown).

**Lo que cuesta, dicho sin rodeos:** el viaje de ida y vuelta es de un solo sentido en la práctica. Markdown sale, `.docx` vuelve, los comentarios los lee una persona, las ediciones se vuelven a aplicar a mano al Markdown, que sigue siendo la única fuente. Cualquier proceso que trate el `.docx` devuelto como una entrada para fusionar automáticamente va a producir una revisión perdida o un commit que nadie puede leer. Acuerda eso con el revisor antes de enviar el archivo — «mándame tus comentarios y yo los aplico, y la versión del repositorio es la que cuenta»— y la fricción se convierte en un paso de un proceso en vez de una discusión sobre qué archivo es el vigente.

## Cómo elegir

1. **Decide si el revisor edita o solo lee.** Si solo lee, produce un PDF o una página HTML autónoma y detente ahí; evitarás todo el problema del viaje de ida y vuelta, y un documento que nadie puede editar no puede bifurcarse en dos versiones.
2. **Cuenta cuántas veces vas a hacer esto.** Una vez, desde el menú de exportar de un editor, es razonable. Cada semana significa construir un documento de referencia, porque la alternativa es volver a aplicar a mano el aspecto de la casa cada semana y que salga un poco distinto cada vez.
3. **Pregúntate si la salida se va a restilizar.** Si entra en un conjunto de documentos gobernado por plantilla, la vía HTML queda descartada — su formato es directo en vez de con estilo, y un documento que no se puede restilizar se va a volver a escribir en su lugar.
4. **Comprueba a dónde puede ir el archivo.** Una vía a través de un servicio alojado significa que el documento está en el servidor de otro; para cualquier cosa confidencial eso descarta las opciones cómodas y te deja con Pandoc en tu propia máquina.
5. **Acuerda la ruta de vuelta antes de enviar nada.** Escribe quién convierte el archivo revisado, con qué parámetros, y quién aplica los cambios al Markdown. El coste de saltarse esto aparece en el peor momento posible, que es cuando vuelve la revisión y el plazo es el viernes.
6. **Prueba con un documento que ejercite todo, en la copia de Word real del revisor.** Nueve niveles de título, listas anidadas, un bloque de código, una nota al pie, una imagen con pie de foto y una tabla ancha. Las diferencias de versión y plataforma en Word aparecen justo en esto, y descubrirlo por boca del revisor sale caro.

## Conclusión

La vía que funciona es Pandoc con un documento de referencia que construiste una vez y subiste al repositorio junto a tu Markdown, porque es la única que produce un archivo de Word con tus propios estilos en vez de formato congelado o los valores por defecto de otro — y los estilos son lo que hace que valga la pena enviarle un `.docx` a alguien que va a editar. La vía HTML es un atajo razonable para un documento corto, y mejora bastante si el HTML del que partes es un archivo completo y autónomo en vez de un fragmento, que es lo que produce [la conversión de Markdown a HTML de TransformPipe](/) en el navegador sin subir nada. Cuando el documento necesita títulos y listas de Word de verdad pero no la plantilla de tu organización, la [conversión de Markdown a Word](/markdown-to-word) del mismo sitio prescinde del HTML por completo y escribe en el navegador un `.docx` construido con estilos. Google Docs es la opción pragmática dentro de Workspace y la equivocada para cualquier cosa confidencial. Sea cual sea la que elijas, decide primero la ruta de vuelta: la conversión de ida es un comando, y la conversión de vuelta es una conversación con una persona sobre quién aplica sus ediciones y qué archivo es la verdad.

## Preguntas frecuentes

### ¿Cómo convierto Markdown a Word sin instalar nada?

Sube el archivo `.md` a Google Docs — Archivo, Abrir, Subir archivo— y luego Archivo, Descargar, Microsoft Word (.docx). No necesita instalación ni terminal, al coste de que el documento pase por los servidores de Google y llegue con los estilos de Google en vez de los de tu organización. Las otras vías sin instalar nada pasan por el navegador: convertir a HTML y abrir el resultado en Word es todavía más rápido y produce un archivo sin ningún conjunto de estilos usable, mientras que un conversor que escribe el `.docx` directamente, como el de este sitio, te da los estilos integrados de Word para títulos y listas, aunque no tu plantilla.

### ¿Cuál es el mejor comando de Pandoc para Markdown a Word?

`pandoc informe.md --reference-doc=casa.docx -o informe.docx`, donde `casa.docx` es un documento de referencia que has editado. Añade `--toc` para un índice y `--highlight-style=NOMBRE` si te importa el aspecto de los bloques de código. Sin `--reference-doc` el comando sigue funcionando y te da el aspecto por defecto de Pandoc.

### ¿Cómo hago que Word use la plantilla de mi empresa?

Construye un documento de referencia a partir del valor por defecto de Pandoc con `pandoc -o referencia-propia.docx --print-default-data-file reference.docx`, y luego restilízalo en Word para que coincida con la plantilla. Empezar desde el archivo de Pandoc en vez de la plantilla de la empresa importa, porque la copia de Pandoc ya define cada estilo que referencia el escritor de docx — incluidos `Source Code`, `Block Text` e `Image Caption`, que las plantillas corporativas casi nunca tienen.

### ¿Por qué mi bloque de código se ve como texto de cuerpo en el archivo de Word?

Porque el documento de referencia no tiene un estilo de párrafo `Source Code`, así que Word está renderizando una referencia a un estilo que no encuentra. Añade `Source Code` para los bloques delimitados y el estilo de carácter `Verbatim Char` para el código en línea, ambos con esos nombres exactos, y el formato aparece.

### ¿Puedo conservar los cambios controlados al convertir Word de vuelta a Markdown?

Puedes leerlos, no conservarlos. `pandoc --track-changes=all` envuelve inserciones, eliminaciones y comentarios en spans con atributos de autor y hora, que es suficiente para ver quién propuso qué — pero llegan como anotaciones en la prosa, y ninguna herramienta de Markdown puede aceptarlas ni rechazarlas. Planea aplicar los cambios a mano.

### ¿Por qué mi diff muestra el archivo entero cambiado después de un viaje de ida y vuelta?

Porque el dialecto de Markdown del conversor no es el tuyo: distinto ajuste de línea, distinto escapado, distinto estilo de título. Normaliza los dos lados pasando tu propia fuente por la misma cadena una vez y fijando los parámetros de salida — `--wrap=none --markdown-headings=atx`, por ejemplo— para que la única diferencia que muestre el diff sean las ediciones del revisor.

### ¿Debería enviar Word o PDF para revisión?

PDF si están leyendo, Word si están editando. Un PDF es más pequeño, se ve igual en todas partes y no puede bifurcarse en una segunda versión del documento; un `.docx` existe para que alguien lo pueda cambiar, y cada coste de este artículo es el coste de esa capacidad. Enviar Word a alguien que solo quería leer invita a ediciones que luego tienes que reconciliar.
