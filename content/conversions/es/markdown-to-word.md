## Lo que se conserva

Al convertir Markdown a Word aquí se obtiene la estructura propia de Word: estilos con nombre, numeración real y notas al pie reales, no un formato aplicado a mano sobre texto Normal.

| En el Markdown | En el documento de Word |
| --- | --- |
| `#` a `######` | Título 1 a Título 6, que aparecen en el panel de navegación |
| listas `-` y `1.`, anidadas | la numeración de Word, hasta nueve niveles; una lista numerada de primer nivel conserva su número inicial |
| `- [ ]` y `- [x]` | ☐ y ☑ |
| `**bold**`, `*italic*`, `~~struck~~`, `==marked==`, `H~2~O`, `x^2^` | negrita, cursiva, tachado, resaltado amarillo, subíndice, superíndice |
| `` `code` `` y bloques de código delimitados | el estilo de carácter Inline Code; un párrafo Code sombreado por bloque, en Consolas |
| citas `>` y avisos del tipo `[!NOTE]` | el estilo Cita; un estilo Note, Tip, Important, Warning o Caution |
| una tabla | Tabla con cuadrícula, con la fila de encabezado en negrita y repetida en cada página, y la alineación conservada |
| `[^1]` | una nota al pie de página, numerada por Word |
| enlaces a direcciones web, `mailto:` y encabezados | hipervínculos; vínculos a un marcador colocado en el encabezado |
| imágenes | dentro del archivo, reducidas al ancho de la página si son más anchas, con el texto alternativo como descripción |

El título en las propiedades del documento es el primer encabezado o, si no lo hay, el nombre del archivo. Las páginas son A4, en Calibri de 11 pt.

## Lo que se pierde

- **El bloque de metadatos (front matter).** El bloque YAML entre líneas `---` al principio se elimina; su `title:` no se usa.
- **Resaltado, diagramas y fórmulas.** El código queda en un solo color, sin resaltado de sintaxis. Un bloque `mermaid` no se dibuja: su código fuente se queda, bajo el rótulo «Mermaid diagram». `$…$` y `$$…$$` conservan su TeX, con formato de código y no como ecuaciones de Word.
- **Algunas imágenes.** Solo entran PNG, JPEG y GIF, y uno incrustado como dirección `data:` entra siempre. Un WebP o un SVG, una ruta de su disco o una dirección web cuyo servidor no deja que un navegador la lea se convierte en su descripción entre corchetes, como enlace o en cursiva.
- **Enlaces sin destino.** Un enlace a otro archivo, o a un encabezado que el documento no tiene, conserva solo sus palabras. Lo mismo ocurre con un wikienlace como `[[Page|text]]`.
- **El HTML en bruto.** Las etiquetas desaparecen y las palabras que encierran se quedan. Un comentario se elimina por completo, igual que un script o un estilo escrito como bloque propio.
- **Los elementos de página.** No se añaden tabla de contenido, encabezado, pie de página ni números de página; Word genera la tabla a partir de los títulos cuando se le pide. Las columnas de las tablas salen todas del mismo ancho, y la propiedad Autor dice TransformPipe.

## Un ejemplo

```markdown
---
title: Release 2.4
---

# Release checklist

Before tagging, read [the build notes](#build-notes) and the
[runbook](https://example.com/runbook).[^1] The ==date== goes in
[the plan](../plans/q3.md).

1. Run the tests
2. Update `CHANGELOG.md`
   - [x] version bumped
   - [ ] date set

> [!WARNING]
> Do not tag on a Friday.

| Step  | Owner |
|:------|------:|
| Build | Ana   |

## Build notes

![Pipeline](pipeline.png)

[^1]: The runbook is internal.
```

El .docx contiene estos párrafos, con sus estilos:

```text
Heading 1       Release checklist
Normal          Before tagging, read the build notes and the runbook.¹ The date goes in the plan.
List Paragraph  1. Run the tests
List Paragraph  2. Update CHANGELOG.md
List Paragraph       ☑ version bumped
List Paragraph       ☐ date set
Warning         Warning
Warning         Do not tag on a Friday.
Table Grid      Step  | Owner
                Build |   Ana
Heading 2       Build notes
Normal          [Pipeline]
Footnote Text   ¹ The runbook is internal.
```

En un Word en español, los estilos integrados se llaman «Título 1», «Normal», «Párrafo de lista», «Tabla con cuadrícula» y «Texto nota pie». «the build notes» lleva a su encabezado. «the plan» apuntaba a un archivo del disco, así que queda como texto; `[Pipeline]` ocupa el lugar de una imagen que el documento nunca contuvo.

## Límites

- Archivos `.md`, `.markdown`, `.mdown` y `.mkd` de hasta 10 MB, o Markdown pegado. Varios archivos soltados a la vez comparten los 10 MB y se convierten en un solo documento, separados por líneas.
- El .docx se genera en su navegador. Nada llega a una cuenta a menos que inicie sesión y pulse Guardar; un documento guardado puede ocupar como máximo 4 MB.
- Las imágenes en direcciones web las solicita su navegador, con un máximo de diez segundos cada una.

## Preguntas

### ¿Cómo convertir Markdown a Word?

Suelte aquí el archivo .md o pegue el Markdown, revise la vista previa y pulse Descargar .docx. Para abrir el resultado sin Word, consulte [Cómo abrir un archivo .docx](/how-to/open-docx).

### ¿Se puede importar Markdown en un documento de Word que ya existe?

Conviértalo primero aquí y después incorpore el .docx con Insertar › Objeto › Texto de archivo. Los encabezados llegan como Título 1 a 6.

### ¿Es lo mismo que convertir Markdown a Word con Pandoc?

No. Pandoc es un programa que hay que instalar, y toma los estilos de un .docx de referencia. Aquí no hay plantilla, pero los encabezados, el texto, las listas, las citas, las tablas y las notas al pie llevan los nombres de estilo integrados de Word, así que aplicar en Word la plantilla de su organización les cambia el aspecto a todos de una vez. [Markdown a Word](/blog/markdown-to-word) compara Pandoc con documento de referencia y las demás vías.

### ¿La fuente debe ser Markdown o .docx?

Conserve el Markdown como original si vive en un repositorio o cambia a menudo, y envíe el .docx a quienes trabajan en Word. Sus cambios solo vuelven si se convierte de nuevo el .docx. [Markdown o Word para la documentación](/blog/markdown-vs-docx-for-documentation) recorre la decisión.
