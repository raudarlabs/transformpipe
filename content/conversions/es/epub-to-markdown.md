## Lo que se conserva

Un `.epub` es un archivo zip de páginas XHTML. Al convertir un EPUB a Markdown, el libro entero se convierte aquí en un único documento: el título como encabezado, el primer autor en cursiva debajo, una lista de los capítulos y, a continuación, cada capítulo en su propia sección bajo un encabezado `# Título del capítulo`, separada de la siguiente por una línea horizontal.

El orden es el orden de lectura que el propio libro indica en la spine de su archivo de paquete, no el orden de los nombres de archivo. Los títulos salen de la tabla de contenidos del libro (el documento de navegación de EPUB 3 o el antiguo `toc.ncx`). Para un capítulo que no aparece allí se usa su primer `<h1>` o, si no lo tiene, su primer `<h2>` o `<h3>`; después su `<title>` y, si no tiene nada de eso, se le llama «Chapter 4», en inglés, según su posición.

| En el libro | En el Markdown |
| --- | --- |
| Encabezados dentro de un capítulo | `##`, `###` y así sucesivamente, en el nivel que fijó el libro |
| Negrita, cursiva, listas, tablas | `**negrita**`, `*cursiva*`, listas y tablas de Markdown |
| Enlaces a sitios web | Se conservan, con su dirección |
| Enlaces entre capítulos, llamadas de nota | Solo su texto, por ejemplo `\[1\]` |
| Imágenes dentro del archivo | Incrustadas en el documento |
| La página de índice de un EPUB 3 | Se omite, porque el documento escribe su propia lista |

Cuando un capítulo empieza con su propio título, ese encabezado se elimina para que el título no aparezca dos veces. Un título que empieza por un número seguido de punto, como «1. The Light», o que lleva corchetes, guiones bajos, asteriscos u otros caracteres que Markdown escapa, no se reconoce como repetido y aparece dos veces.

## Lo que se pierde

- **La imagen de cubierta.** Es la sobrecubierta, no una página, así que la imagen que el libro señala como cubierta nunca se incrusta. Una página de cubierta dibujada en SVG desaparece con ella; una página de cubierta hecha con un simple `<img>` deja una sección breve con un enlace a una imagen que no está.
- **El estilo.** No se leen la hoja de estilos ni las fuentes incrustadas: se pierden tipografías, capitulares, colores y subrayados, y también todo lo que una página dibuja como SVG incrustado, incluida una imagen enmarcada en él. Las imágenes insertadas con `<img>`, archivos SVG incluidos, sí se conservan.
- **La mayor parte de los metadatos.** Solo se leen el título y el primer autor; la editorial, el ISBN, el idioma y la fecha no.
- **El anidamiento del índice.** Una parte con capítulos dentro se convierte en una lista plana, con una sección por cada archivo de la spine, y una página que solo contiene su título se omite.

## Un ejemplo

*The Lighthouse Keeper*, de Mary Hale, es un libro EPUB 3 con una cubierta en SVG, dos capítulos guardados como `index_split_030.xhtml` e `index_split_002.xhtml` (que se leen en ese orden) y una página de notas, además de un mapa, una llamada de nota, una tabla y un enlace de vuelta al primer capítulo. El resultado es este, con el base64 acortado:

```markdown
# The Lighthouse Keeper

*Mary Hale*

- The Light
- The Storm
- Notes

---

# The Light


The lamp was lit at *dusk*, as it had been for forty years.\[1\]

![Map of the headland](data:image/png;base64,iVBORw0KGgo…)

See [the register](https://example.org/lighthouses).

---

# The Storm


| Night | Wind |
| --- | --- |
| Monday | Force 9 |

Back to the first chapter.

---

# Notes

\[1\] Since 1884.
```

## Límites

- **50 MB por subida.** Varios libros soltados a la vez se encadenan en un único documento, y el límite se aplica a su suma.
- **Las imágenes comparten un cupo.** Cada una se incrusta solo si pesa menos de unos 750 KB, y las de un mismo libro disponen entre todas de unos 1,5 MB, que se gastan en orden de lectura. Pasado ese punto, una imagen conserva su ruta dentro del archivo, que fuera de él no muestra nada.
- **La conversión se hace en el navegador.** El libro no se sube. El Markdown solo llega a una cuenta si se inicia sesión y se pulsa Guardar, y un documento guardado puede ocupar hasta 4 MB.
- **Solo `.epub`.** Un archivo de Kindle `.mobi` o `.azw3` se rechaza.

## Preguntas frecuentes

### ¿Cómo abrir un archivo EPUB?

Para leerlo, sirve una aplicación de lectura como Apple Books o Calibre; [Cómo abrir un archivo .epub](/how-to/open-epub) repasa las opciones. Para sacar el texto, basta con convertirlo aquí: el libro aparece como una sola página que se puede leer en el navegador, copiar o descargar como `.md`.

### ¿Quedarán los capítulos en el orden correcto?

Sí. El orden sale de la spine, el único lugar donde un EPUB lo indica, y los nombres de archivo se ignoran. [Convertir un EPUB a Markdown](/blog/convert-epub-to-markdown) explica por qué no se puede confiar en esos nombres.

### ¿Qué pasa con las notas al pie?

La llamada de nota conserva su texto, `[1]`, pero ya no enlaza a ninguna parte, y la nota se queda donde la tenía el libro, normalmente en un capítulo de notas al final. Las notas no se convierten en notas de Markdown del tipo `[^1]`.

### ¿Se puede convertir un libro de Kindle o un libro con DRM?

No. Solo se aceptan archivos `.epub`, y aquí no se descifra ningún capítulo. Por eso los capítulos de un libro protegido salen como caracteres ilegibles.

### ¿Puedo obtener cada capítulo en un archivo aparte?

No. Un libro se convierte siempre en un único documento, pero cada capítulo empieza, después de una línea horizontal, con su propio encabezado `# `, así que dividirlo a mano es sencillo.
