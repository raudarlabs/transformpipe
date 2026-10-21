## Lo que se conserva

Para convertir RTF a Markdown, el conversor lo lee igual que lo reproduce un procesador de textos: conserva el formato que tiene equivalente en Markdown y se salta la tabla de fuentes, la tabla de colores y la hoja de estilos, que a menudo ocupan la mitad del archivo.

| En el archivo | En el Markdown |
| --- | --- |
| Negrita, cursiva, tachado | `**negrita**`, `*cursiva*`, `~~tachado~~` |
| Un párrafo con nivel de esquema (Word) | Un encabezado de ese nivel, de `#` a `######` |
| Una línea en negrita más grande que el cuerpo del texto (TextEdit, Pages) | Un encabezado; el tamaño más grande pasa a ser `#` |
| Listas con viñetas y listas numeradas | Listas con `-` y con `1.`, sangradas según el nivel |
| Hipervínculos | `[texto](https://…)` |
| Tablas | Tablas de Markdown, con la primera fila como fila de encabezado |
| Un salto de línea dentro de un párrafo (Word) | Un salto de línea forzado, una barra invertida al final de la línea |

Word marca un encabezado con un nivel de esquema, que se aprovecha cuando existe. Un Mac solo escribe una línea en negrita más grande, de modo que un párrafo en negrita de principio a fin y más grande que el cuerpo del texto se lee como encabezado, ordenado por tamaño. El tamaño del cuerpo es aquel en el que está compuesta la mayor parte del texto. Una línea en negrita al tamaño del cuerpo sigue siendo un párrafo en negrita, y un encabezado pierde la negrita: `# Título`, no `# **Título**`.

Los caracteres se descodifican con la página de códigos que indica el archivo, o con Windows-1252 si no indica ninguna, y también se leen las secuencias Unicode, así que «café» y el texto cirílico llegan intactos. El texto chino y japonés solo llega bien cuando el archivo lo escribe como secuencias Unicode. El texto de un enlace es otra excepción: en él se pierden las letras acentuadas y los caracteres no latinos, y a veces queda un signo de interrogación en su lugar. Un asterisco o un guion bajo escritos en el texto se escapan, para que sigan siendo caracteres y no se conviertan en formato. Si el documento no empieza con un encabezado, se añade el nombre del archivo como encabezado.

## Lo que se pierde

- **Las imágenes.** Se omiten. Un `.rtfd` de Mac, que es lo que guarda TextEdit cuando un documento contiene imágenes, no se acepta en absoluto.
- **Las fuentes, los colores, los tamaños y la alineación.** El tamaño de letra solo se usa para encontrar los encabezados.
- **El subrayado, el superíndice y el subíndice.** Las palabras se quedan y el formato se va, así que un 2 en superíndice detrás de una x llega como `x2`.
- **Los encabezados y pies de página, y las propiedades del documento.** No se leen el título ni el autor guardados en las propiedades del archivo. La excepción es un encabezado o pie de página propio de la primera página: sus palabras llegan como texto normal.
- **Los comentarios.** Se omiten, aunque el texto con formato oculto llega como texto normal.
- **Las llamadas de nota.** La llamada desaparece, y el texto de la nota se une al párrafo al que pertenecía.
- **Los tabuladores**, que se convierten en espacios simples.

## Un ejemplo

Una lista de comprobación breve guardada desde TextEdit, con un título más grande en negrita, una palabra en cursiva, una lista numerada, un enlace y una hora tachada:

```rtf
{\rtf1\ansi\ansicpg1252\cocoartf2761
{\fonttbl\f0\fswiss\fcharset0 Helvetica-Bold;\f1\fswiss\fcharset0 Helvetica;\f2\fswiss\fcharset0 Helvetica-Oblique;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx566\pardirnatural\partightenfactor0

\f0\b\fs36 \cf0 Caf\'e9 opening checklist\
\f1\b0\fs24 Before the doors open on 
\f2\i Monday
\f1\i0 :\
\pard\tx220\tx720\li720\fi-720\pardirnatural\partightenfactor0
\ls1\ilvl0\cf0 {\listtext	1.	}Count the 
\f0\b float
\f1\b0 \
{\listtext	2.	}Check the {\field{\*\fldinst{HYPERLINK "https://example.com/rota"}}{\fldrslt rota}}\
\pard\tx566\pardirnatural\partightenfactor0
\cf0 Old opening time: \strike \strikec0 7:30\strike0\striked0  8:00\
}
```

Se convierte en:

```markdown
# Café opening checklist

Before the doors open on *Monday*:

1. Count the **float**
1. Check the [rota](https://example.com/rota)

Old opening time: ~~7:30~~ 8:00
```

Todos los elementos numerados se escriben como `1.`; Markdown los numera al mostrar la lista.

## Límites

- **10 MB por subida.** Varios archivos soltados a la vez se encadenan en un único documento, y el límite se aplica a su suma.
- **La conversión se hace en el navegador.** El archivo no se sube. El Markdown solo llega a una cuenta si se inicia sesión y se pulsa Guardar.
- **Tiene que ser RTF.** Un archivo que no empiece por `{\rtf` se rechaza, aunque su nombre termine en `.rtf`.

## Preguntas frecuentes

### ¿Qué es un archivo RTF?

Rich Text Format, o formato de texto enriquecido: un archivo de texto en el que el formato se escribe como palabras de control entre las propias palabras. Casi todos los procesadores de textos lo leen y lo escriben.

### ¿Cómo abrir un archivo RTF?

TextEdit en el Mac, Word, LibreOffice y la mayoría de los procesadores de textos lo abren directamente; [Cómo abrir un archivo .rtf](/how-to/open-rtf) los repasa uno por uno. Sin un procesador de textos, basta con convertirlo aquí y leerlo en el navegador.

### ¿Mis encabezados seguirán siendo encabezados?

Si vienen de Word, sí, siempre que usen los estilos de título de Word, porque esos estilos llevan un nivel de esquema. Si vienen de TextEdit o de Pages, solo se recuperan cuando la línea del encabezado está en negrita de principio a fin y es más grande que el cuerpo del texto.

### ¿Se conservan las imágenes?

No. Las imágenes dentro de un `.rtf` se omiten, y los paquetes `.rtfd` no se aceptan. Para conservar las imágenes, conviene guardar el documento como `.docx` u `.odt` y convertir ese archivo.

### ¿Se puede pasar un archivo RTF a Word o a PDF?

Sí, a través del Markdown: una vez convertido, el menú junto al botón de descarga ofrece, entre otros, Word e «Imprimir o guardar como PDF». Esos formatos contienen lo que contiene el Markdown, así que las fuentes y los colores del original no vuelven.
