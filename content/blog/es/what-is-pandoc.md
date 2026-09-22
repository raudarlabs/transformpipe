---
title: "Qué es Pandoc, y cuándo no te hace falta"
description: "Pandoc es un programa con cincuenta lectores, sesenta y seis escritores y un modelo de documento en medio. Qué te da eso, y para qué trabajos sobra."
date: 2026-09-22
tag: Conversión
keywords: qué es pandoc, pandoc, pandoc online, aplicación pandoc, usar pandoc, instalar pandoc, alternativa a pandoc
---

Casi todo lo que se escribe sobre Pandoc arranca en un comando que alguien quiere ejecutar. Esto empieza un paso antes, porque el comando solo tiene sentido cuando sabes qué es el programa: un único binario que lee cincuenta formatos, escribe sesenta y seis y nunca convierte uno en otro de forma directa.

### En resumen

Pandoc es un programa de línea de comandos y una biblioteca de Haskell. Lee un documento hacia una representación interna y luego vuelve a escribir esa representación en otro formato. Es software libre bajo la GPL, escrito por John MacFarlane y publicado desde 2006. No hay aplicación, ni cuenta, ni servicio en línea oficial: una demostración en `pandoc.org/try` y nada más. Lo quieres cuando el trabajo es una matriz de formatos, citas bibliográficas, Word con la plantilla de otro equipo, o la misma conversión mil veces. No lo quieres cuando el trabajo es un archivo, una vez, en una máquina donde no puedes instalar nada, o cuando el documento es una pestaña que estás mirando y no un archivo que tienes.

## Un programa, dos listas y un documento en medio

El diseño es una sola idea y todo lo demás se deriva de ella. Pandoc no convierte Markdown en HTML. **Lee** Markdown hacia un árbol de sintaxis abstracta —un documento de títulos, párrafos, listas, tablas, enlaces y notas— y luego **escribe** ese árbol como HTML. La mitad que lee y la mitad que escribe no saben nada la una de la otra.

Por eso la lista de formatos es tan larga sin que nadie haya escrito mil convertidores. Cincuenta lectores y sesenta y seis escritores no son 116 trabajos: son 116 trabajos que producen 3.300 conversiones. Nadie escribió un convertidor de cuaderno Jupyter a wiki de Jira. Sale del cruce.

También explica las dos propiedades que sorprenden:

**Un formato es lector o escritor, y no automáticamente las dos cosas.** LaTeX, DocBook y Word son ambas. Beamer, ICML y reveal.js son solo escritores. RIS y EndNote XML son solo lectores. Pedir una conversión para la que no hay lector da un error en vez de un resultado pobre, y ese es el comportamiento honesto.

**Lo que Pandoc no sabe representar se pierde al leer, no al escribir.** Si los comentarios de un archivo de Word no entran en el árbol, ningún formato de salida podrá imprimirlos. Por eso «Pandoc me perdió X» es casi siempre una pregunta dirigida al lector.

## La lista cambia, y lo que recuerdas está caducado

El 1 de diciembre de 2025, la versión 3.8.3 añadió `pptx` y `xlsx` como formatos **de entrada**. Durante diecinueve años, una presentación de PowerPoint fue algo que Pandoc escribía y no sabía leer, y los consejos que circulan —incluidos, hasta esta mañana, cuatro artículos de este sitio— lo siguen diciendo.

Así que la costumbre útil no es memorizar la matriz, sino preguntarle al programa:

```bash
pandoc --list-input-formats
pandoc --list-output-formats
pandoc --version
```

Tres comandos, y la respuesta vale para la versión que de verdad tienes. Las mismas listas están en los desplegables de `pandoc.org/try`, que es la forma más rápida de comprobarlo sin instalar nada: `pptx` y `xlsx` aparecen allí en la lista «from» (comprobado el 22 de septiembre de 2026).

Un aviso, si aceptas esa oferta para una presentación: el lector de PowerPoint abre las diapositivas, sus tablas, sus imágenes y su SmartArt, y no abre en absoluto la parte de notas. [Qué le pasa a una presentación y a sus notas del orador](/blog/convert-powerpoint-to-markdown) está contado con detalle en otro sitio; los dos lectores nuevos se declaran alpha en su propio código.

## No hay aplicación de Pandoc, ni Pandoc en línea

Se buscan las dos cosas, así que conviene decirlo claro: Pandoc es un programa de línea de comandos. No existe una aplicación gráfica oficial ni un servicio alojado oficial.

Lo que hay en `pandoc.org/try` es una demostración: un cuadro de texto, dos desplegables y un botón para probar una conversión sobre un fragmento. No es un convertidor de archivos ni pretende serlo.

Cualquier otra cosa que se llame «Pandoc online» es el servidor de alguien con Pandoc instalado. Construir eso es legítimo, y nosotros construimos algo vecino, pero cambia la pregunta por completo: tu documento pasa a ser un archivo en una máquina que no controlas, con un plazo de conservación que no has leído. [Cómo comprobar adónde envía de verdad tu archivo un convertidor](/blog/is-an-online-converter-safe) vale para todos ellos.

## Los cuatro comandos que cubren casi todo

```bash
# Markdown a una página HTML de verdad, todo dentro de un archivo
pandoc notes.md -o notes.html --standalone --embed-resources

# Un archivo de Word a Markdown, con sus imágenes escritas al lado
pandoc report.docx -t gfm -o report.md --extract-media=media

# Markdown a Word, con la plantilla de otro equipo
pandoc paper.md -o paper.docx --reference-doc=template.docx

# Markdown con citas a un PDF
pandoc paper.md --citeproc --bibliography=refs.bib -o paper.pdf
```

Dos notas al pie. `--self-contained` es como se llamaba la segunda opción de la primera línea; hoy es un sinónimo obsoleto de `--embed-resources --standalone`, así que una respuesta de hace cuatro años sigue funcionando y te avisa por el camino.

Y la última línea esconde una instalación. **Markdown a PDF no es uno de los escritores de Pandoc.** El PDF sale de entregarle el documento a un motor aparte, y el valor por omisión es un motor de TeX: normalmente una descarga bastante mayor que Pandoc, y el motivo más habitual por el que alguien concluye que Pandoc es más de lo que quería. `--pdf-engine` puede apuntar a `weasyprint`, `wkhtmltopdf`, `typst`, `prince`, `pagedjs-cli` o `context`, varios de ellos mucho más ligeros. [Las rutas de Markdown a PDF](/blog/markdown-to-pdf) las compara.

## Cuando no vale otra cosa

- **Una matriz de formatos.** Una fuente, varias salidas, al mismo paso: HTML para el sitio, DOCX para quien revisa, EPUB para leer en el tren. Todo lo más ligero hace bien una salida.
- **Citas bibliográficas.** `--citeproc` con BibTeX, BibLaTeX o CSL JSON, y cientos de estilos CSL. Nada más de esta categoría tiene siquiera un procesador de citas.
- **Una plantilla de empresa para Word.** `--reference-doc` toma tipografías, estilos de título y espaciados de un `.docx` existente. Si la plantilla llegó de jurídico o de marketing, esa opción es toda la razón para instalarlo.
- **Filtros.** Un filtro en Lua o JSON reescribe el documento mientras todavía es un árbol: renumerar cada tabla, subir de nivel cada título, reescribir cada enlace interno. La versión con expresiones regulares funciona hasta el día en que deja de hacerlo.
- **Volumen.** Es un binario que lee de la entrada estándar y escribe en la salida estándar. Mil archivos son un bucle `for`.

## Cuando sobra para lo que necesitas

- **Un archivo, una vez.** Llevar un documento suelto a HTML significa `--standalone`, luego una hoja de estilos y quizá una plantilla escrita en el lenguaje de plantillas de Pandoc. Es un trabajo de preparación real y no encoge porque la tarea sea pequeña. [Las alternativas más ligeras](/blog/pandoc-alternatives-for-markdown-to-html) están ordenadas por la parte que intentas evitar.
- **Una máquina donde no puedes instalar.** Un portátil gestionado, un teléfono, el escritorio de otra persona.
- **Un documento que no es un archivo.** Una página de wiki, un ticket, un hilo: todo lo que solo existe renderizado en un navegador hay que guardarlo antes de que Pandoc lo vea, y guardarlo es la mitad difícil.
- **Una conversión cuyo resultado quieres ver antes de fiarte.** Pandoc es una herramienta de tubería: excelente cuando ya sabes qué quieres, cara mientras lo estás averiguando.

## Dónde encaja este sitio

TransformPipe convierte en el navegador: quince formatos de entrada, Markdown y un archivo HTML autónomo de salida, y el archivo no sale de la máquina. Eso cubre el centro de la última lista —un documento, ninguna instalación, un resultado que ves— y nada de la primera. Aquí no hay procesador de citas, ni lenguaje de plantillas, ni matriz de formatos, ni PDF en ninguna dirección.

El resumen honesto es que son herramientas distintas para dos mitades del mismo problema, y la frontera se dice fácil: si la conversión va a repetirse la semana que viene, escríbela con Pandoc. Si va a pasar una vez, en los próximos dos minutos, no deberías tener que instalar nada para hacerla.
