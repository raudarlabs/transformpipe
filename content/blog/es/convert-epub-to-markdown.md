---
title: "Convertir un EPUB a Markdown: orden del spine, títulos de capítulo y notas"
description: "Un EPUB es un sitio web dentro de un zip — qué dan Pandoc, calibre y una lectura directa, y las cuatro cosas que se rompen cuando un libro pasa a ser un archivo"
date: 2026-09-21
tag: Conversión
keywords: epub a markdown, convertir epub a markdown, libro electrónico a texto, extraer texto de un epub, calibre epub markdown, pandoc epub markdown
---

Un EPUB es un pequeño sitio web que resulta que se vende como libro: archivos XHTML, una hoja de estilos, imágenes y un índice que dice en qué orden leerlos. Eso lo convierte en el más hospitalario de los formatos documentales, y es también la razón de que los problemas interesantes no tengan que ver con el análisis sintáctico. Tienen que ver con lo que pasa cuando ciento ochenta archivos separados se vuelven un único documento Markdown y cada enlace entre ellos deja de apuntar a nada.

### En resumen

Renombra un `.epub` a `.zip` y podrás leerlo entero. `META-INF/container.xml` señala el documento de paquete, y el spine de ese documento es el orden de lectura — que, como en todo formato comprimido, no es el orden de los nombres de archivo (comprobado en w3.org, 21 de septiembre de 2026). Pandoc lee EPUB directamente y lo lee bien: `pandoc -f epub -t gfm book.epub -o book.md --extract-media=media`. calibre también sabe producir Markdown, a través de su salida TXT: `ebook-convert book.epub book.txt --txt-output-formatting=markdown`, pero quita los enlaces y las referencias de imagen salvo que pases `--keep-links` y `--keep-image-references` (comprobado en manual.calibre-ebook.com, 21 de septiembre de 2026). Un convertidor que lee las partes directamente, como [EPUB → Markdown](/epub-to-markdown), resuelve el spine, toma los títulos de capítulo del documento de navegación y convierte los enlaces entre capítulos en algo que sigue funcionando dentro de un solo archivo.

Lo que se rompe en cualquier caso: los enlaces entre capítulos, las notas marcadas con `epub:type`, las listas de páginas y todo lo que haya en un libro de maquetación fija, que son imágenes con el texto dibujado dentro.

## Qué hay dentro de un .epub

| Ruta | Qué es |
| --- | --- |
| `mimetype` | La primera entrada del zip, sin comprimir, que declara que esto es un EPUB |
| `META-INF/container.xml` | El único archivo en una ruta fija — nombra el documento de paquete |
| `OEBPS/content.opf` | El documento de paquete: metadatos, un manifiesto de cada archivo y el spine |
| `OEBPS/nav.xhtml` | El documento de navegación de EPUB 3 — el índice, como lista anidada |
| `OEBPS/toc.ncx` | Su equivalente en EPUB 2, todavía presente en casi todos los libros por compatibilidad |
| `OEBPS/chapter-12.xhtml` | Un capítulo, en XHTML corriente |
| `OEBPS/images/` | Las imágenes, portada incluida |

Dos reglas hacen esto fácil de leer y una lo hace fácil de equivocar. Las fáciles: `META-INF/container.xml` es la única ruta que hay que conocer, porque todo lo demás se descubre a partir de ella, y el contenido es XHTML, que cualquier analizador de HTML ya maneja. La difícil es la misma de todo formato comprimido: el spine define la secuencia de lectura, y no lo hace nada más. `chapter-12.xhtml` puede ser el tercer capítulo, el apéndice, o un archivo sin usar que quedó en el manifiesto. Ordenar por nombre de archivo produce un libro en un orden que nadie escribió.

## Los tres caminos

| Camino | Orden | Títulos de capítulo | Imágenes | Enlaces entre capítulos | Notas |
| --- | --- | --- | --- | --- | --- |
| Pandoc | Del spine | De los encabezados | `--extract-media` | Quedan, apuntando a lo que ya no está | Quedan como enlaces |
| calibre TXT/Markdown | Del spine | De los encabezados | Desactivadas por omisión | Desactivados por omisión | Quedan si quedan los enlaces |
| Leer las partes directamente | Del spine | Navegación primero, encabezados después | Incrustadas | Reescribibles a anclas internas | Resolubles hasta el texto de la nota |
| Copiar desde un lector | Lo que seleccionaste | No | No | No | No |

## Pandoc, que sí lee EPUB

A diferencia de PowerPoint, donde `pptx` es solo formato de salida, `epub` está en la lista de Pandoc por ambos lados (comprobado en pandoc.org, 21 de septiembre de 2026). Esta es la mejor respuesta breve para un libro que quieres como un archivo:

```bash
pandoc -f epub -t gfm book.epub -o book.md --extract-media=media
```

`--extract-media` escribe cada imagen en la carpeta que le indiques y reescribe los enlaces de imagen hacia ella, que es lo que quieres, porque la alternativa es un Markdown que remite a archivos aún sellados dentro del zip. Añade `--wrap=none` si el ajuste de línea duro te molesta en los diffs.

Lo que obtienes es un documento fiel y plano: los encabezados de cada capítulo al nivel que usaba el XHTML, los párrafos en orden de spine, las imágenes al lado del archivo. Lo que no obtienes es ningún reconocimiento de que los capítulos fueron documentos separados. Cada `<a href="chapter-13.xhtml#note-4">` del libro es ahora un enlace a un archivo que no existe, dentro de un documento Markdown que contiene justo aquello a lo que apuntaba, unos cientos de líneas más abajo.

| Ventajas | Inconvenientes |
| --- | --- |
| Un comando, sin configuración, mucha fidelidad | Los enlaces entre capítulos sobreviven como rutas relativas rotas |
| El orden del spine se trata bien | Los títulos salen de los encabezados: un libro con aperturas de capítulo en imagen se queda con capítulos sin nombre |
| `--extract-media` resuelve bien las imágenes | Preliminares, créditos e índice pasan todos como capítulos |

**¿Para quién es?** Para quien ya tiene Pandoc y un libro de estructura convencional. Es el valor por omisión correcto, y el problema de los enlaces está a un buscar y reemplazar.

## calibre, y las dos opciones que importan

`ebook-convert`, de calibre, es la otra herramienta que casi todo el mundo ya tiene, y llega al Markdown por su salida TXT:

```bash
ebook-convert book.epub book.txt \
  --txt-output-formatting=markdown \
  --keep-links \
  --keep-image-references
```

La opción de formato acepta `plain`, `markdown` o `textile`. Las dos opciones `--keep` son la parte que conviene saber, porque su ausencia es silenciosa: la documentación dice que los enlaces siempre se eliminan en la salida de texto plano, y que conservarlos solo tiene sentido una vez elegida una opción de formato (comprobado en manual.calibre-ebook.com, 21 de septiembre de 2026). Ejecuta el comando sin ellas y obtienes un libro limpio, legible y sin enlaces, y nada te avisa de que llevaba cuatrocientos.

`--keep-image-references` tiene el defecto especular al de Pandoc: conserva las referencias y no extrae los archivos, así que acabas con `![](../images/fig-3.png)` apuntando dentro de un zip que ya no tienes abierto. calibre también produce de buena gana una salida HTMLZ con las imágenes — momento en el cual estás haciendo la extracción a mano de todos modos.

| Ventajas | Inconvenientes |
| --- | --- |
| Ya instalado allí donde se gestiona una biblioteca | Dos opciones poco evidentes te separan de una conversión sin pérdidas |
| Aguanta muchos más libros mal formados que Pandoc | Las referencias de imagen se quedan; los archivos, no |
| Convertir una biblioteca entera en lote es una línea | El Markdown es un subproducto de un exportador de texto, no un formato de destino |

**¿Para quién es?** Para quien convierte muchos libros de una vez, o uno que Pandoc rechaza. Es además el más indulgente de los dos lectores, lo cual importa más de lo que debería: una proporción sorprendente de los EPUB reales no son válidos.

## Leer las partes uno mismo

El formato entero son cuatro pasos, lo bastante cortos como para merecer conocerlos aunque nunca los escribas:

```text
1. unzip the file
2. read META-INF/container.xml → <rootfile full-path="OEBPS/content.opf">
3. read the opf:
     <manifest> → id → href, media-type
     <spine>    → ordered list of idrefs
4. for each idref in spine order: parse the XHTML, convert it, append
```

Hacerlo así compensa por una sola razón: tienes el spine y el documento de navegación en la mano a la vez, y eso es lo que hace que los títulos de capítulo y los enlaces salgan bien. Ni Pandoc ni calibre usan el documento de navegación para los títulos: ambos toman lo que dicen los encabezados del XHTML, que suele ser lo mismo y a veces no lo es.

## Las cuatro cosas que se rompen, y qué hacer

### Títulos de capítulo que no están en el capítulo

La apertura de capítulo de un libro es a menudo una imagen diseñada — el número compuesto en una tipografía de titulares, exportado como PNG — y el texto no aparece en ninguna parte del XHTML. El documento de navegación sí sabe que el capítulo se llama «El segundo invierno», porque esa es la cadena que el lector muestra en su índice. Una conversión que lee solo los archivos de capítulo produce un documento sin ningún encabezado, y sin explicación aparente.

El arreglo es tomar el título del documento de navegación, indexado por el archivo al que apunta, y recurrir al primer encabezado solo cuando la navegación no tiene nada. [EPUB → Markdown aquí](/epub-to-markdown) lee tanto `nav.xhtml` como `toc.ncx` exactamente por esto, porque abundan los EPUB 3 que llevan un NCX con mejores etiquetas que su nav.

### Los enlaces entre capítulos

Esto es lo que diferencia un libro de un documento. Dentro del EPUB, `<a href="ch13.xhtml#fn4">` es un enlace que funciona hacia otro archivo. En un único documento Markdown, origen y destino están en el mismo archivo, y el enlace es una ruta relativa a un archivo que no existe.

Hay tres respuestas defendibles, y la equivocada es no hacer nada:

- **Reescribir a un ancla interna.** `ch13.xhtml#fn4` pasa a `#fn4`, que funciona si el identificador de destino sobrevivió al Markdown y el renderizador emite identificadores para los encabezados. El mejor resultado, el mayor trabajo.
- **Quitar el enlace y dejar el texto.** La frase se lee bien y no hay nada roto. Esto es lo que una conversión debería hacer por omisión.
- **Dejar el href tal cual.** El documento contiene ahora enlaces que fallan en silencio. Esto es lo que hacen casi todas las conversiones.

### Las notas

EPUB 3 marca las notas con `epub:type="noteref"` en el enlace y `epub:type="footnote"` en el destino, que suele vivir al final del capítulo o en un archivo de notas propio. Markdown tiene sintaxis de nota al pie en casi todos sus dialectos, y es un destino genuinamente bueno: `[^4]` en el texto, `[^4]: la nota` abajo. Casi nada hace esa correspondencia, porque exige leer los atributos `epub:type` y emparejar los identificadores entre archivos en vez de convertir cada archivo por su cuenta. [Qué hace Markdown con las notas al pie](/blog/markdown-footnotes-support) explica qué renderizadores admiten la sintaxis una vez la tienes.

### Los libros de maquetación fija

Cómics, álbumes infantiles, libros de cocina y casi toda la no ficción ilustrada salen como EPUB de maquetación fija: una imagen por página, posicionada en absoluto, con el texto horneado dentro de la imagen. No hay texto que convertir. La conversión de un libro así produce una lista de imágenes y un puñado de números de página, y no es un fallo de la herramienta — las palabras nunca fueron caracteres. Busca `<meta property="rendition:layout">pre-paginated</meta>` en el documento de paquete antes de invertir tiempo.

## Lo que no va a funcionar

**Un libro con DRM.** Sus archivos de contenido están cifrados y listados en `META-INF/encryption.xml`, y cada una de las herramientas de arriba lee el zip, encuentra cifrado y falla. Ese es el comportamiento pretendido del formato, y nada en este artículo es una manera de rodearlo. Los libros vendidos sin DRM, los publicados bajo una licencia que lo permite y tus propios manuscritos son todos EPUB corrientes.

**La tipografía de verdad.** Capitulares, versalitas, puntuación colgada, titulares con interletraje cuidado y el control de viudas y huérfanas son todos decisiones de la hoja de estilos. Markdown no tiene forma de expresar ninguna y, en general, no debería tenerla. Lo que eso cuesta merece decirse en voz alta cuando lo que se convierte es un libro diseñado y no un manuscrito.

**La semántica de la hoja de estilos.** Un libro que distingue un epígrafe de un destacado y de una cita en bloque lo hace con tres clases CSS sobre tres blockquotes. Markdown tiene uno. Algo se va a perder, y cuál de los tres importa más es una decisión que solo tú puedes tomar — antes de convertir, cambiando el marcado, no después.

## Una lista para un libro que te importa

1. **Comprueba la propiedad de maquetación** buscando `pre-paginated` antes que nada. Si es de maquetación fija, para.
2. **Cuenta las entradas del spine** y los capítulos del Markdown final. Una diferencia suele significar que se fundieron preliminares o se saltó una sección.
3. **Busca `.xhtml` en la salida.** Cada aparición es un enlace que antes funcionaba.
4. **Mira el primer encabezado de cada capítulo.** Si varios empiezan con una imagen y sin encabezado, los títulos vinieron del sitio equivocado.
5. **Decide sobre preliminares y finales.** Créditos, dedicatoria, índice y colofón se convierten todos y, en un documento que vas a editar, son ruido. También son lo más fácil de quitar de una vez, al principio.
6. **Si el libro tiene notas, sigue una de punta a punta** — la llamada en el texto, la nota misma, y si algo las sigue conectando.

## Dónde te deja todo esto

Para un libro, `pandoc -f epub -t gfm --extract-media=media` y diez minutos arreglando enlaces es el camino honesto más corto. Para una estantería entera, calibre con las dos opciones `--keep` procesa el lote sin problemas. Para un libro en el que las notas y los títulos importan — una obra de referencia, un manuscrito que vuelve de la editorial, cualquier cosa que pienses seguir editando — la diferencia está en las partes que las herramientas generalistas no leen, y [la conversión EPUB → Markdown de aquí](/epub-to-markdown) toma los títulos del documento de navegación e incrusta las imágenes para que el resultado sea un solo archivo. Una vez que es Markdown, [unirlo y partirlo](/blog/merging-many-markdown-files) es un problema distinto y mucho más sencillo.
