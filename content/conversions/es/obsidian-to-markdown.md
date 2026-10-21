## Lo que se conserva

Comprima en .zip la carpeta del vault, o lo que haya generado un plugin de exportación, y súbalo. Cada archivo `.md` no vacío se convierte en una nota, en la carpeta en la que estaba.

| En el vault | En el Markdown |
| --- | --- |
| `Projects/Website.md` | Una nota «Website» en una carpeta Projects |
| Las propiedades, el bloque `---` del principio | Eliminadas |
| `[[Pricing]]`, `[[Pricing#Plans]]` | `Pricing` |
| `[[Pricing\|the plan list]]` | `the plan list` |
| `![[sketch.png]]` | La imagen, incrustada, localizada por su nombre en cualquier lugar del .zip |
| `![[brief.pdf]]` | `*brief.pdf*` |

El título de una nota es su nombre de archivo, puesto como encabezado de primer nivel; un encabezado inicial que solo lo repite se elimina.

Encabezados, listas, tareas, tablas, código, fórmulas, `==resaltados==` y callouts quedan tal como están escritos; la vista previa muestra `> [!warning]` como un recuadro de advertencia. Los wikilinks dentro de código no se tocan.

Por defecto, el vault se convierte en **Una carpeta de páginas** con sus propias carpetas, y una nota de carpeta, `Projects.md` junto a `Projects/`, pasa a ser el primer documento de esa carpeta. La opción **Un solo documento**, bajo la zona para soltar archivos, da un único archivo: un índice y después cada nota bajo su encabezado, separadas por líneas horizontales.

## Lo que se pierde

- **El destino de los wikilinks.** Fuera de un vault solo quedan las palabras. Un enlace dentro de la misma nota, `[[#Tasks]]`, se deja tal cual.
- **Las notas incrustadas.** `![[Pricing]]` da el nombre, no el texto de Pricing.
- **Otros adjuntos.** Un PDF, MP3, WAV, MP4 o MOV incrustado se convierte en su nombre de archivo en cursiva.
- **Las incrustaciones con carpeta.** Solo se busca un nombre de archivo sin ruta, así que `![[assets/plan.png]]` se convierte en `*assets/plan.png*` aunque el archivo esté en el .zip.
- **Las incrustaciones con un espacio en el nombre**, como los archivos `Pasted image …` de Obsidian, que se muestran como texto.
- **Los enlaces Markdown entre notas**, que quedan tal como están escritos.
- **Los lienzos, los ajustes y los datos de los plugins.** Solo se leen notas e imágenes.

Los identificadores de bloque como `^a1b2c3` y los `%%comentarios%%` se quedan en el texto, visibles.

## Un ejemplo

La carpeta My vault, comprimida, contiene `Pricing.md`, `attachments/sketch.png` y esta nota, `Projects/Website.md`:

```markdown
---
tags: [work]
status: active
---
# Website

Ship the new pricing page: see [[Pricing#Plans|the plan list]] and [[Roadmap]].

![[sketch.png]]
![[brief.pdf]]

> [!warning] Deadline
> Friday, not Monday.
```

Como **Una carpeta de páginas**, la importación es una carpeta My vault con Pricing y una carpeta Projects que contiene este documento (con el base64 abreviado):

```markdown
# Website


Ship the new pricing page: see the plan list and Roadmap.

![sketch.png](data:image/png;base64,iVBORw0KGgo…)
*brief.pdf*

> [!warning] Deadline
> Friday, not Monday.
```

## Límites

- **250 MB por .zip**, procesado en su navegador. Sin iniciar sesión no se sube nada; con sesión iniciada, nada llega a su cuenta hasta que lo guarde.
- **Las imágenes comparten una cuota**: 2 MB codificados en un documento único, unos 4 MB menos el texto por cada nota de una carpeta, y 1 MB (unos 750 KB en disco) por imagen. Un PNG, JPEG, WebP o BMP de más de 120 KB se redibuja antes, a 1600 píxeles como máximo en su lado largo, y solo se conserva si así ocupa menos. La que aun así no cabe conserva su enlace.
- **4 MB por documento guardado.** Una nota mayor se nombra y se deja fuera al guardar la carpeta.
- **Se lee cada archivo `.md`**, también en carpetas ocultas como `.trash`, así que conviene quitar lo que no se quiera antes de comprimir.
- **Sin tamaños.** En `![[sketch.png|300]]`, el 300 pasa a ser el texto alternativo de la imagen.

## Preguntas

### ¿Cómo exportar un vault de Obsidian a Markdown?

Un vault ya es una carpeta de archivos `.md`, así que no hay nada que exportar: comprima la carpeta del vault y súbala.

### ¿Qué pasa con los wikilinks?

Un enlace a una nota se convierte en sus palabras: el texto tras la barra vertical si lo hay, o si no el nombre de la nota. El encabezado o el bloque al que apuntaba se pierde junto con la dirección.

### ¿Se conservan mis imágenes?

Sí, si el archivo está en el .zip, cabe en la cuota y, si va incrustado, no tiene espacios en el nombre. Una incrustación se localiza por su nombre, y una imagen Markdown por su ruta y después por su nombre. [Convertir un vault de Obsidian](/blog/convert-obsidian-vault-to-markdown) trata el resto de la sintaxis de Obsidian.

### ¿Se conservan las propiedades y las etiquetas?

Como propiedades, no: el bloque `---` se elimina, con las etiquetas y los alias, porque sus claves solo significan algo dentro del vault. Un `#tag` en el texto se queda. [Qué hacen los conversores con el front matter](/blog/front-matter-and-what-converters-do-with-it) explica la decisión.

### ¿Se pueden pasar notas de Obsidian a Confluence?

No directamente: desde aquí no se publica nada en Confluence. Convierta el vault con **Un solo documento** y elija después «Confluence storage format» en el menú junto al botón de descarga.

### ¿Es un conversor general de formatos de Obsidian?

Lee un vault, reduce los wikilinks a sus palabras y quita las propiedades; con **Un solo documento**, el mismo menú ofrece además HTML, texto sin formato, Word, EPUB, marcado de Jira o Slack e **Imprimir o guardar como PDF**. De la sintaxis propia de Obsidian solo escribe los enlaces a encabezados, en la descarga «Markdown for Obsidian».
