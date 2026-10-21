## Lo que se conserva

Al convertir Word a Markdown se conserva la estructura del documento, no su maquetación: un `.docx` se lee por lo que es cada parte, no por el aspecto que tiene en la página.

| En el archivo de Word | En el Markdown |
| --- | --- |
| De Título 1 a Título 6 | De `#` a `######` |
| Negrita, cursiva, tachado | `**bold**`, `*italic*`, `~~struck~~` |
| Listas con viñetas y numeradas | Listas con `-` y `1.`, dos espacios de sangría por nivel |
| Casillas marcadas y vacías dentro de una lista | `- [x]` y `- [ ]` |
| Una tabla | Una tabla Markdown, con la primera fila como fila de encabezado |
| Un hipervínculo | Un enlace a la misma dirección |
| Una imagen | Incrustada en el documento, con su texto alternativo |
| Notas al pie y notas al final | Una lista numerada al final, con `[1]` en el texto |
| Un salto de línea (Mayús+Intro) | Una línea que termina en dos espacios |
| Un cuadro de texto | Su texto, detrás del párrafo en el que estaba anclado |

`report.docx` pasa a ser `report.md`. Un asterisco o un guion bajo escrito en el texto se escapa con una barra invertida, para que siga siendo un carácter y no se convierta en énfasis.

## Lo que se pierde

- **Los estilos que no son encabezados.** Título, Subtítulo, Cita, de Título 7 a Título 9 y los estilos propios se convierten en párrafos normales.
- **El aspecto.** Fuentes, tamaños, colores, resaltado y subrayado. El superíndice y el subíndice pierden su posición, de modo que H₂O llega como H2O, y una fuente monoespaciada no convierte el texto en código.
- **Los comentarios,** sin ninguna marca en el lugar donde estaban.
- **Los elementos de página.** Encabezados y pies de página, números de página y saltos de página.
- **Las ecuaciones.** Todo lo que viene del editor de ecuaciones desaparece, y la frase se cierra alrededor del hueco.
- **Las celdas combinadas.** Una celda combinada se escribe una sola vez y las celdas siguientes se desplazan a la izquierda, al espacio que ocupaba. Dos párrafos en una misma celda quedan pegados, sin espacio.
- **Unas notas que funcionen.** Los enlaces `[1]` y `↑` apuntan a anclas que el Markdown no contiene; no son notas al pie de Markdown con `[^1]`.
- **Una tabla de contenido que funcione.** Sus entradas llegan como enlaces con su número de página, hacia marcadores que ya no existen.

## Un ejemplo

Un `.docx` con una línea en el estilo Título, un Título 1, un párrafo con una palabra en negrita, otra en cursiva, una nota al pie y un enlace, una lista anidada, una tabla y una foto queda así, con el base64 de la imagen acortado:

```markdown
Roof survey

# Findings

The north gutter is **blocked** and two tiles are *cracked*.[\[1\]](#footnote-1) Prices are on the [supplier’s page](https://example.com/tiles).

- Clear the gutter
  - North side only
- Replace two tiles

| Job | Cost |
| --- | --- |
| Gutter | £80 |
| Tiles | £240 |

![The blocked north gutter](data:image/png;base64,iVBORw0KGgo…)

1. Seen from the scaffold on 3 March. [↑](#footnote-ref-1)
```

«Roof survey» queda como párrafo normal porque la línea tenía el estilo Título.

## Límites

- Solo `.docx`, hasta 50 MB. Varios archivos soltados a la vez cuentan juntos y forman un único documento, separados por líneas horizontales.
- El archivo se lee en el navegador y no se sube. Nada llega a una cuenta salvo que haya iniciado sesión y pulse Guardar, y un documento guardado puede ocupar como máximo 4 MB.
- Las imágenes viajan dentro del Markdown: alrededor de 1 MB cada una una vez codificada (un archivo de unos 750 KB) y 2 MB en total por cada `.docx`. La imagen que ya no cabe se sustituye por su texto alternativo en cursiva, o por nada si no tenía.
- Las listas anidadas bajo un elemento numerado llevan dos espacios de sangría, y eso no le basta a Markdown: al mostrarse, los subelementos salen de su elemento. Bajo viñetas, el anidamiento funciona.
- Un `.docx` protegido con contraseña no se puede leer; conviene quitar la contraseña en Word antes.

## Preguntas

### ¿Cómo se convierte un documento de Word (.docx) a Markdown (.md)?

Se suelta el `.docx` en esta página, se revisa la vista previa y se pulsa Descargar .md. [Cómo convertir DOCX a Markdown](/blog/convert-docx-to-markdown) compara esta vía con Pandoc y con mammoth en código propio.

### ¿Se puede convertir un archivo .doc antiguo?

No, solo `.docx`. Primero hay que guardar el `.doc` como `.docx` en Word o LibreOffice; [cómo abrir un archivo .docx](/how-to/open-docx) explica también qué hacer con un `.doc` que llega con la extensión equivocada.

### ¿Se puede convertir un documento de Google Docs?

Sí, pasando por el formato de Word. En Google Docs se elige Archivo, Descargar, Microsoft Word, y después se suelta aquí ese `.docx`.

### ¿Por qué el título no se ha convertido en encabezado?

El estilo Título de Word no es uno de los estilos Título 1 a Título 6, que son los únicos que se convierten en encabezados. Basta con aplicar Título 1 a la línea antes de convertir, o con añadir `# ` delante después.

### ¿Qué pasa con los comentarios y el control de cambios?

Los comentarios se eliminan. Los cambios registrados salen como si se hubieran aceptado todos: el texto insertado se queda y el eliminado desaparece, pero el texto movido con el control de cambios activado falta en los dos sitios. Conviene aceptar o rechazar cada cambio en Word antes de convertir.

### ¿Qué formato merece la pena conservar?

Menos del que parece. [Qué no sobrevive de una .docx](/blog/what-not-to-keep-from-a-docx) repasa lo que Markdown no puede expresar y qué pérdidas importan de verdad.
