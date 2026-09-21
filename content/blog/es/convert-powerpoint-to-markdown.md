---
title: "Convertir PowerPoint a Markdown: diapositivas, notas y orden de lectura"
description: "Qué sobrevive al convertir un .pptx a Markdown, por qué Pandoc no sabe leer PowerPoint y dónde acaban las notas del orador — seis caminos comparados"
date: 2026-09-21
tag: Conversión
keywords: powerpoint a markdown, convertir pptx a markdown, notas del orador powerpoint, convertidor pptx markdown, diapositivas a markdown, presentación a texto
---

Una presentación es la versión más corta de un razonamiento que alguien ya desarrolló entero. Eso es justamente lo que hace que valga la pena convertirla: las diapositivas llevan la estructura y las notas del orador llevan las frases que las diapositivas comprimieron. Las dos cosas están dentro del archivo `.pptx`, en XML legible, y casi todas las salidas de PowerPoint tiran una de ellas — casi siempre las notas, porque nunca estuvieron en pantalla.

### En resumen

Un `.pptx` es un zip de partes XML: una parte por diapositiva, una parte aparte por página de notas y las imágenes en una carpeta `ppt/media/`. Lo bien que salga la conversión depende casi por completo de cuáles de esas partes se molesta en abrir la herramienta. Pandoc no ayuda: escribe `pptx` y no lo lee, así que el consejo habitual de «usa Pandoc» falla en el primer comando (comprobado en pandoc.org, 21 de septiembre de 2026). La exportación a Esquema/RTF que trae PowerPoint recoge el texto de los marcadores de título y cuerpo y deja fuera todo lo demás, notas incluidas. Pasar por PDF convierte un documento estructurado en texto colocado por coordenadas y pierde precisamente la estructura por la que valía la pena conservar la presentación. `python-pptx` lee diapositivas y notas y te entrega las piezas — el Markdown lo escribes tú. Un convertidor que abre las partes directamente, como [PowerPoint → Markdown en TransformPipe](/powerpoint-to-markdown), da en una sola pasada un encabezado por diapositiva, sus notas debajo y sus imágenes incrustadas.

Lo que no recupera ningún camino: animaciones, transiciones, orden de aparición, SmartArt como diagrama y los gráficos como algo que no sea una imagen. Nada de eso fue nunca texto.

## Qué hay de verdad dentro de un .pptx

Renombra uno a `.zip` y ábrelo. Las partes que importan:

| Parte | Qué contiene |
| --- | --- |
| `ppt/slides/slide1.xml` | Las formas de una diapositiva, en el orden en que PowerPoint las guarda |
| `ppt/slides/_rels/slide1.xml.rels` | Sus enlaces hacia fuera: imágenes, hipervínculos y su página de notas |
| `ppt/notesSlides/notesSlide1.xml` | Las notas del orador de una diapositiva, como documento aparte |
| `ppt/media/image1.png` | Cada imagen, a tamaño completo, con su propio nombre |
| `ppt/presentation.xml` | `<p:sldIdLst>` — el orden de las diapositivas, que no es el de los nombres de archivo |

Dos de esas filas son donde se tuercen la mayoría de las conversiones.

La primera es el orden. `slide1.xml` no es necesariamente la primera diapositiva. Los números son identificadores asignados al crearla, y mover diapositivas en el editor no las renumera. El orden real vive en `<p:sldIdLst>`, dentro de `presentation.xml`, como una lista de identificadores de relación que hay que resolver a través de `ppt/_rels/presentation.xml.rels` para llegar a los nombres de archivo. Un convertidor que ordene por nombre de archivo entrega una presentación reordenada, y eso es peor que no convertir nada, porque el resultado parece correcto.

La segunda son las notas. No están en la parte de la diapositiva. Cada página de notas es su propio documento XML, unido a su diapositiva únicamente por el archivo de relaciones. Una herramienta que lee `ppt/slides/*.xml` y nada más no pierde las notas por un fallo — nunca miró.

## Los seis caminos, comparados

| Camino | Diapositivas | Notas | Imágenes | Orden de lectura | Esfuerzo |
| --- | --- | --- | --- | --- | --- |
| Copiar y pegar desde el editor | Solo texto | No — no están en pantalla | No | El de tus clics | Alto, por diapositiva |
| PowerPoint → Esquema/RTF | Solo marcadores | No | No | El de los marcadores | Bajo |
| PowerPoint → PDF → Markdown | Como texto colocado | Solo imprimiendo páginas de notas | A veces | Adivinado por geometría | Medio |
| Script con `python-pptx` | Sí | Sí | Con trabajo | El que tú decidas | Alto, una vez |
| Pandoc | No lee `.pptx` | — | — | — | — |
| Un convertidor que lee las partes | Sí | Sí | Incrustadas | El del documento | Bajo |

## Pandoc lee docx y epub, y no lee pptx

Conviene decirlo sin rodeos, porque el consejo circula mucho. La lista de formatos de Pandoc es asimétrica: `docx` aparece como entrada y como salida, `epub` también, y `pptx` figura solo como formato de salida (comprobado en pandoc.org, 21 de septiembre de 2026). `pandoc -f pptx deck.pptx -t markdown` no produce una conversión peor: produce un error, porque no hay ningún lector de pptx que seleccionar.

Esa asimetría es menos un descuido que una afirmación sobre el formato. Un documento de Word es un flujo de párrafos con estilos y se proyecta casi directamente sobre el modelo interno de Pandoc. Una diapositiva es un lienzo de formas colocadas sin ningún orden de lectura propio, y linealizarla exige suposiciones que Pandoc ha decidido no hacer. Cualquier cosa que sí convierta una presentación está haciendo esas suposiciones; la única pregunta es si lo dice.

Si tienes una presentación y un flujo de trabajo montado alrededor de Pandoc, el camino honesto son dos pasos: sacar Markdown del `.pptx` por otra vía y luego entregarle ese Markdown a Pandoc para lo que quisieras que hiciera. La segunda mitad la cubren [las alternativas a Pandoc](/blog/pandoc-alternatives-for-markdown-to-html).

## La exportación a esquema que trae PowerPoint

PowerPoint sabe guardar un esquema: Archivo, Guardar como, y elegir Esquema/RTF en la lista de formatos. En Windows es una opción de guardado normal; en Mac la importación trabaja con RTF, pero las opciones de exportación cambian según la versión, así que revisa la lista que tengas delante (comprobado en support.microsoft.com, 21 de septiembre de 2026).

Lo que sale es el texto de los marcadores de título y cuerpo, sangrado por nivel de esquema. Lo que no sale es todo lo demás: el texto escrito en una forma o en un cuadro de texto suelto en vez de en un marcador, las tablas, las imágenes y las notas del orador.

| Ventajas | Inconvenientes |
| --- | --- |
| Viene incluido: ninguna herramienta, ninguna subida, ningún script | Solo marcadores — una presentación hecha de cuadros de texto sale casi vacía |
| Conserva los niveles de título como sangría | Sin notas, sin tablas, sin imágenes, sin enlaces |
| El RTF se convierte después sin problemas | Calla lo que ha dejado por el camino |

**¿Para quién es?** Para una presentación con mucho texto, construida estrictamente sobre los diseños estándar, de la que solo quieras la estructura de viñetas. Si tomas ese camino, el RTF resultante necesita una segunda conversión — [RTF → Markdown](/rtf-to-markdown) se encarga de esa mitad.

## Exportar a PDF y convertir el PDF

Tentador, porque toda presentación se exporta a PDF y convertidores de PDF hay cien. El problema está en lo que hace la exportación: el PDF no tiene encabezados, ni listas, ni tablas, solo glifos en coordenadas. Un título es un título porque es grande y está arriba. Una lista es una lista porque varias líneas empiezan con el mismo carácter a la misma sangría. Todo convertidor que lea ese PDF reconstruye una estructura que el `.pptx` declaraba y el PDF tiró.

Hay algo, eso sí, que este camino hace y los demás no sin escribir código: en Imprimir, elige el diseño Páginas de notas y obtendrás las notas bajo una imagen de cada diapositiva. Es un PDF de las notas, no las notas como texto, pero es la única salida sin programar que las lleva consigo.

| Ventajas | Inconvenientes |
| --- | --- |
| Funciona desde cualquier versión y plataforma | La estructura se deduce de la geometría, no se lee |
| Páginas de notas es la única vía incluida que trae las notas | Las notas llegan bajo una imagen rasterizada de la diapositiva |
| La fidelidad visual es exacta | Las tablas suelen llegar como texto suelto; las diapositivas a dos columnas se entrelazan |

**¿Para quién es?** Para una presentación que ya no abre nada salvo el visor que produjo el PDF. Si no, es convertir a propósito un archivo estructurado en uno que ha dejado de serlo, lo cual es un primer movimiento extraño.

## Un script, con python-pptx

Si las presentaciones son tuyas y habrá más, leer el archivo directamente es el camino que compensa. `python-pptx` abre cualquier `.pptx` desde PowerPoint 2007, y las notas están a la vista: `Slide.has_notes_slide` y `Slide.notes_slide.notes_text_frame` forman parte de la interfaz documentada (comprobado en python-pptx.readthedocs.io, 21 de septiembre de 2026).

```python
from pptx import Presentation

deck = Presentation('deck.pptx')
out = []

for number, slide in enumerate(deck.slides, start=1):
    title = slide.shapes.title
    out.append(f'## {title.text}' if title and title.text else f'## Slide {number}')

    for shape in slide.shapes:
        if shape == slide.shapes.title or not shape.has_text_frame:
            continue
        for paragraph in shape.text_frame.paragraphs:
            text = ''.join(run.text for run in paragraph.runs).strip()
            if text:
                out.append(('  ' * paragraph.level) + f'- {text}')

    if slide.has_notes_slide:
        notes = slide.notes_slide.notes_text_frame.text.strip()
        if notes:
            out.append('> **Notes**')
            out.extend(f'> {line}' for line in notes.splitlines())

    out.append('')

print('\n'.join(out))
```

Fíjate en qué recorre el bucle: `deck.slides`, que python-pptx resuelve a través de la lista de identificadores de diapositiva. El orden es entonces el de la presentación y no el de los nombres de archivo — la única parte difícil ya está hecha.

Lo que ese script todavía no hace es la cola larga: imágenes (mirar `shape.shape_type` buscando `PICTURE`, sacar `shape.image.blob`, escribirlo en algún sitio y emitir un enlace), tablas (`shape.has_table`, y después filas y celdas hacia una tabla Markdown), formas agrupadas (un grupo es una forma que contiene formas, así que el bucle tiene que ser recursivo) e hipervínculos (`run.hyperlink.address`, un objeto distinto del texto del run). Cada uno son veinte líneas. Juntos son la razón de que esto sea un proyecto y no un fragmento.

| Ventajas | Inconvenientes |
| --- | --- |
| Lee la estructura real, notas incluidas | Escribes y mantienes un convertidor |
| Repetible sobre una carpeta entera | Grupos, tablas, imágenes y enlaces: una pasada cada uno |
| Nada sale de la máquina | Dependencia de Python allí donde se ejecute |

**¿Para quién es?** Para alguien con un flujo recurrente y una forma de salida concreta en mente: presentaciones de versión hacia un repositorio, informes semanales hacia un wiki.

## El orden de lectura es la parte de la que nadie habla

Las formas de una diapositiva se guardan en el orden del árbol de formas, que es más o menos el orden en que se añadieron y exactamente el orden en que se apilan. Ese no es el orden en que alguien las lee. Una diapositiva con un título, dos columnas y un pie debajo tiene un orden de lectura visual perfectamente claro y quizá un árbol de formas que diga pie, columna derecha, título, columna izquierda — porque así se fue construyendo a lo largo de tres revisiones.

Cada convertidor elige una estrategia, y no coinciden:

- **Orden del documento** — emitir las formas tal como las lista el archivo. Predecible, a veces equivocado, nunca sorprendente de una manera que no puedas ver.
- **Orden geométrico** — ordenar por arriba y luego por izquierda. Acierta más a menudo y destroza la diapositiva cuya barra lateral a toda altura empieza por encima de la columna principal.
- **Marcadores primero** — título, luego cuerpo, luego el resto. Bueno en diseños estándar, pobre en diapositivas diseñadas a mano.

No hay respuesta correcta, solo una respuesta declarada. Cuando una presentación convertida se lee rara, casi siempre es por esto, y el arreglo está en la presentación: poner las formas en orden de lectura desde el panel de Selección de PowerPoint y convertir otra vez.

## Imágenes, tablas y lo que no es texto

**Las imágenes** son la victoria fácil, y la que más convertidores se saltan. Ya vienen extraídas: están en `ppt/media/` como PNG y JPEG corrientes, a resolución completa. Una conversión que emite `![](image3.png)` y te deja buscando image3 ha hecho medio trabajo; una que incrusta los bytes te da un archivo único que puedes mover. [Las imágenes y los enlaces que sobreviven](/blog/images-and-links-that-still-work) repasa los compromisos.

**Las tablas** pasan si la herramienta lee `<a:tbl>`, el mismo modelo de tabla que usa Word. La trampa son las celdas combinadas: una tabla de diapositiva con un encabezado combinado no tiene equivalente en Markdown, y cada herramienta lo resuelve distinto — repitiendo el valor, vaciando las celdas de continuación o descartando la fila. [Las tablas que sobreviven a una conversión](/blog/markdown-tables-that-survive-conversion) explica qué comprobar.

**Los gráficos** son una tabla de datos más una representación, guardados en una parte aparte con un libro incrustado. La representación es una imagen; los números de detrás son datos de verdad. La mayoría de los convertidores se quedan con la imagen. Si lo que querías eran los números, están en `ppt/embeddings/` como un `.xlsx` pequeño, y una conversión [Excel → Markdown](/excel-to-markdown) los leerá.

**SmartArt** es un dibujo generado a partir de un pequeño modelo de datos XML. El texto se puede recuperar; el diagrama no, salvo hacia un formato que sea a su vez un formato de diagramas.

**Animaciones, transiciones y orden de aparición** significan algo real en algunas presentaciones: todo el sentido de una diapositiva puede estar en que tres puntos aparezcan de uno en uno. Nada de eso tiene forma en Markdown. Si importa, su sitio son las notas antes de convertir, no después.

## Una lista corta antes de convertir

1. **Abre el panel de Selección** y revisa el orden de las formas en cualquier diapositiva con un diseño no estándar. Cuesta un minuto y resuelve la queja más frecuente sobre el resultado.
2. **Decide si las notas son el objetivo.** Si lo son, descarta de inmediato la exportación a esquema y el copiar y pegar: ninguno de los dos llega hasta ellas.
3. **Busca texto dentro de imágenes.** Una diapositiva cuyo contenido es una captura de una tabla se convierte en una imagen de una tabla. Nada aguas abajo puede leerla.
4. **Mira para qué están los gráficos.** Si es la forma de la línea, quédate con la imagen. Si son los números, ve a por el libro incrustado.
5. **Convierte primero una diapositiva** y léela. El orden de lectura y el trato que reciben las notas se ven ya en las dos primeras, y las dos cosas salen baratas si se descubren pronto.

## Dónde te deja todo esto

Para una presentación suelta de la que necesitas el texto una vez, la exportación a esquema son treinta segundos y basta — siempre que esté hecha con marcadores y las notas den igual. Allí donde las notas importan, que es la mayoría de las presentaciones que merecen conversión, la elección está entre escribir un script con `python-pptx` y usar algo que ya lea las partes. [La conversión PowerPoint → Markdown de aquí](/powerpoint-to-markdown) resuelve el orden de las diapositivas por `<p:sldIdLst>`, pone las notas de cada una justo debajo como cita e incrusta las imágenes, de modo que el resultado es un solo archivo — en el navegador, así que la presentación no se sube a ninguna parte. Para el formato vecino, [convertir un .docx](/blog/convert-docx-to-markdown) tropieza con otros problemas, casi todos de estilos y no de orden.
