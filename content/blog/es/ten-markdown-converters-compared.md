---
title: "Diez conversores a Markdown comparados por lo que no leen"
description: "Toda comparación cuenta formatos admitidos. La cuenta útil es la otra — qué rechaza cada uno de diez conversores, y si te lo dice antes o después"
date: 2026-09-22
tag: Conversión
keywords: comparación conversores markdown, mejor conversor a markdown, pandoc o markitdown, docling comparación, comparativa conversores de documentos, convertir a markdown herramienta
---

La portada de todo conversor cuenta hacia arriba: trescientos formatos, veinticinco mil conversiones. La cifra es real y casi inútil, porque una lista de formatos es una lista de cosas que no darán error de inmediato. Lo que separa a estas herramientas es la otra lista — la que nadie publica — de lo que cada una no lee en absoluto, de lo que lee y descarta en silencio, y de cuándo te enteras: antes de fiarte del resultado, o tres documentos después.

### En resumen

Diez herramientas, comprobadas contra su propia documentación el 22 de septiembre de 2026. Pandoc lee `docx` y `epub`, y desde la 3.8.3 también `pptx` y `xlsx`, aunque su lector de presentaciones es alpha y no se lleva ninguna nota del orador. calibre llega a Markdown por su exportador de texto y elimina todos los enlaces si no pasas dos opciones. LibreOffice Writer ya puede guardar Markdown directamente, como CommonMark. Google Docs sabe exportarlo, con la mitad de copiar y pegar desactivada por omisión. MarkItDown lee PowerPoint, notas del orador incluidas. Docling lee la lista de entradas más amplia de las que hay aquí. CloudConvert convierte una presentación a Markdown y no lista EPUB como origen. Turndown lee HTML y nada más, a propósito. Mammoth lee `.docx` y produce HTML, no Markdown. python-pptx te da las piezas y ningún formato de salida.

Ninguna es mala. Cada una se construyó para una forma distinta de problema, y el desajuste entre esa forma y la tuya es donde las conversiones se estropean.

## Las siete preguntas que de verdad separan

Contar formatos oculta las diferencias. Estas siete no:

1. **¿El archivo sale de tu máquina?**
2. **¿Lee el contenedor o solo el texto?** Un `.pptx` es un zip de partes XML; leer `ppt/slides/*.xml` y parar hace una herramienta distinta de la que también abre `ppt/notesSlides/` y `ppt/media/`.
3. **¿Qué pasa con las imágenes** — incrustadas, escritas junto al archivo, o referidas a una carpeta que no existe?
4. **¿Dice qué descartó?** El silencio es la propiedad cara.
5. **¿Markdown es destino o subproducto?** Un exportador de texto al que le creció un modo Markdown no se comporta como un conversor que apunta a Markdown.
6. **¿Sabe leer una carpeta como un documento?** Una exportación de Notion, Confluence u Obsidian son muchos archivos y un documento.
7. **¿Hay que instalar, iniciar sesión, o ninguna de las dos?**

## La tabla

Comprobada contra la documentación de cada proyecto, 22 de septiembre de 2026.

| Herramienta | Se ejecuta | Lee pptx | Lee epub | Markdown es | Imágenes |
| --- | --- | --- | --- | --- | --- |
| Pandoc | En local | Sí, desde la 3.8.3; sin notas | Sí | Un destino de pleno derecho | `--extract-media` las escribe |
| calibre | En local | No | Sí | Un modo de salida TXT | Referencias solo con una opción |
| LibreOffice Writer | En local | Abre la presentación, guarda desde Writer | Sí | Un filtro de guardado, CommonMark | No tratado en la documentación |
| Google Docs | Alojado | La abre, exporta desde Docs | No | Descarga e importación | No tratado en la documentación |
| MarkItDown | En local | Sí, con notas | Sí | El único destino | Nombres de archivo, o URI data si se pide |
| Docling | En local | Sí | Sí | Una salida entre varias | Incrustadas o referidas |
| CloudConvert | Alojado | Sí | No listado para md | Una salida entre cientos | En el servidor, según el servicio |
| Turndown | Una biblioteca | No | No | El único destino | Se arrastran del HTML |
| Mammoth | Una biblioteca | No | No | No se produce — el HTML sí | Una llamada que tú escribes |
| python-pptx | Una biblioteca | Sí, con notas | No | No se produce nada | `shape.image.blob`, tú lo escribes |

## Qué es cada una, en un párrafo

**Pandoc** es la implementación de referencia de la idea de que los documentos tienen una estructura común. Su lista de formatos es asimétrica de una manera que conviene comprobar en lugar de recordar: `docx` y `epub` son lectores y escritores, y `pptx` fue solo escritor hasta que la versión 3.8.3 le añadió un lector el 1 de diciembre de 2025, junto con otro para `xlsx`. Ese lector está marcado como alpha y no abre ninguna parte de notas: la presentación se convierte y sus notas del orador no. Para todo lo que sí lee, es la herramienta más fiel de aquí y la más apta para guiones. [Hay alternativas más ligeras](/blog/pandoc-alternatives-for-markdown-to-html) para el caso de un solo archivo.

**calibre** convierte libros electrónicos, y a Markdown se llega por su salida de texto: `--txt-output-formatting=markdown`. La trampa está documentada y en la práctica es muda — con salida de texto plano los enlaces se eliminan siempre, así que sin `--keep-links` y `--keep-image-references` obtienes un libro limpio, legible y sin enlaces, y ningún aviso de que llevaba cuatrocientos. Es además el lector más indulgente de EPUB mal formados, lo que importa más de lo que debería.

**LibreOffice Writer** ya guarda Markdown directamente: Archivo, Guardar como, Documento Markdown (.md), y la documentación indica que implementa la especificación CommonMark. Es un cambio con peso — durante años el consejo estándar fue pasar por HTML — y la documentación no dice qué ocurre con imágenes y tablas, que es justo la clase de hueco que se prueba en tu propio documento antes de confiarle cincuenta.

**Google Docs** importa y exporta Markdown, con la exportación activada por omisión; «Copiar como Markdown» y «Pegar desde Markdown» van aparte y están apagados hasta que los enciendes en Herramientas, Preferencias, Habilitar Markdown. Es el conversor que casi todo el mundo ya tiene, y sus límites son los obvios: tu documento ya está en el servidor de alguien, y lo que Docs no supo representar se perdió al entrar, no al salir.

**MarkItDown**, de Microsoft, apunta de lleno a Markdown y lee PowerPoint como se debe — incluido `slide.has_notes_slide`, que escribe bajo un encabezado `### Notes:`. Las imágenes salen por omisión como referencias de nombre de archivo, y como URI data si se piden; los gráficos se vuelven tablas donde sabe leerlos y un `[unsupported chart]` explícito donde no. Ese último detalle es la buena costumbre: dice lo que no pudo hacer.

**Docling**, de IBM, lee la lista más amplia de aquí — formatos de Office, OpenDocument, PDF, EPUB, HTML, imágenes y más — y escribe Markdown entre varias salidas. Es la más pesada de las herramientas locales, y la que hay que buscar cuando la entrada es un montón de formatos mezclados y no uno conocido.

**CloudConvert** convierte una presentación a Markdown, algo que casi ninguna de aquí sabe hacer, además de `docx`, `odt`, `rtf`, `pdf` y una veintena más. EPUB no está entre los orígenes que anuncia para salida Markdown. Es un servidor, así que el documento se sube, y esa es la primera pregunta y no la última. [Si un conversor en línea es seguro](/blog/is-an-online-converter-safe) trata de cómo comprobarlo en vez de suponerlo.

**Turndown** convierte HTML en Markdown y no acepta nada más. No es una limitación, es el diseño, y por eso casi cualquier otra herramienta de JavaScript del área acaba con Turndown o un pariente por debajo. [Las bibliotecas de HTML a Markdown](/blog/turndown-and-html-to-markdown-libraries) se diferencian sobre todo en los casos incómodos.

**Mammoth** lee `.docx` y produce HTML, a propósito: proyecta los estilos de Word sobre elementos semánticos e ignora el detalle visual. No produce Markdown, así que es media cadena, y su propia documentación es clara: el desajuste entre la estructura de un `.docx` y la del HTML hace que los documentos complicados no se conviertan a la perfección. [En qué se diferencian mammoth y los analizadores de docx](/blog/mammoth-js-and-docx-parsers) cuenta el resto.

**python-pptx** lee una presentación como se debe — orden de diapositivas resuelto por la lista de identificadores, `Slide.notes_slide.notes_text_frame` para las notas, `shape.image.blob` para las imágenes — y no produce nada. Es una biblioteca para construir tu propio conversor, y si aparece en una comparativa de conversores es porque para un trabajo recurrente con PowerPoint suele ser la respuesta correcta. [Convertir PowerPoint a Markdown](/blog/convert-powerpoint-to-markdown) trae un guion que funciona.

## Dónde encaja la herramienta detrás de este sitio, incluido lo que no hace

TransformPipe convierte quince cosas desde y hacia Markdown en el navegador, lo que responde a las preguntas uno, tres y siete: el archivo no se sube, las imágenes se incrustan como URI data para que el resultado sea un solo archivo, y no hay nada que instalar. Lee los contenedores y no el texto — orden de diapositivas desde `<p:sldIdLst>`, títulos de capítulo desde el documento de navegación de un EPUB, recursos de Evernote emparejados por MD5 — y lee una carpeta de exportación como un documento con índice, lo que responde a la pregunta seis.

La otra mitad, con honestidad:

- **Sin PDF de entrada.** Un PDF son glifos en coordenadas y reconstruir su estructura es otra disciplina. CloudConvert, Docling y MarkItDown leen PDF; esto no.
- **Sin LaTeX, sin reStructuredText, sin `.doc` ni `.ppt` antiguos.** Pandoc cubre los dos primeros; LibreOffice, los dos segundos.
- **Un techo de cuatro megabytes** para un documento guardado, que se deduce de un límite de plataforma y no de una elección, con dos megabytes de ellos para imágenes.
- **No es una herramienta de lotes.** Convertir quinientos archivos pertenece a un guion con Pandoc o Docling dentro, no a una pestaña del navegador.
- **Del lado del navegador significa que trabaja tu máquina,** así que un archivo muy grande está limitado por la memoria de la pestaña y no por la paciencia de un servidor.

Una comparación en la que la herramienta que se vende gana todas las filas no es una comparación. Esas cinco filas son donde la herramienta de otro es la respuesta correcta, y saber en qué fila estás es todo el ejercicio.

## Cómo elegir en una pasada

- **El documento es confidencial.** Del lado del navegador o sin conexión. Eso elimina los servicios alojados antes de cualquier pregunta de funciones, y no es cuestión de confiar en una política: se observa en la pestaña de red.
- **La conversión se repite.** Pandoc o Docling en un guion. Una página web que una persona tiene que abrir no es una tubería.
- **La entrada es un montón de formatos mezclados, PDF incluidos.** Docling.
- **Es una presentación y las notas importan.** MarkItDown, python-pptx, o un conversor que abra las partes de notas.
- **Es un libro.** Pandoc con `--extract-media`, o calibre con las dos opciones `--keep`.
- **Es un archivo, ahora, y quieres ver el resultado.** Un conversor del lado del navegador, porque el viaje de subida, cola y descarga dura más que la conversión.
- **Vas a integrar esto en software.** Una biblioteca — Turndown, Mammoth, python-pptx — y la aceptación de que ahora mantienes un conversor.

## El documento de prueba que conviene guardar

Elijas lo que elijas, la comparación honesta lleva diez minutos. Construye un documento con las seis cosas que se rompen: un encabezado que vino de texto en negrita y no de un estilo de título, una tabla con una celda combinada, una imagen, una nota al pie, una lista anidada, y un enlace a otro archivo de la misma exportación. Pásalo por dos o tres candidatos y lee la salida.

Cada diferencia de la tabla de arriba aparecerá en ese único documento, y aparecerá para tus documentos y no para los de un reseñista. La cuenta de formatos de la portada no te habría dicho nada de esto. Para el campo más amplio — los servicios alojados, las suites de oficina y el Guardar como del propio navegador — [el repaso de conversores de documentos en línea](/blog/best-online-document-converters) los ordena por dónde va el archivo.
