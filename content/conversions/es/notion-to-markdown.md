## Lo que se conserva

Suba el .zip que genera Notion al exportar en formato «Markdown & CSV». Cada archivo `.md` no vacío que contiene se convierte en una página, y cada `.csv`, en una tabla, estén a la profundidad que estén dentro de las carpetas.

| En la exportación | En el Markdown |
| --- | --- |
| `Project plan 0f1e…e1f0.md` | Una página titulada «Project plan», sin el identificador |
| La línea `# Project plan` de la propia página | Un solo encabezado de título, no dos |
| Una carpeta de subpáginas | Una carpeta con el mismo nombre, con la página madre primero |
| Una base de datos, `Tasks 9f8e…b1a0.csv` | Una tabla bajo «Tasks», con la primera fila como encabezado |
| Una imagen en la carpeta de la página | Incrustada en la página |

Los encabezados, listas, casillas de tareas, citas, código, énfasis, enlaces a sitios web y HTML como un bloque `<aside>` quedan tal como los escribió Notion. En la tabla de una base de datos, un salto de línea dentro de una celda se convierte en `<br>`.

Por defecto, la exportación se convierte en **Una carpeta de páginas**: un documento por página, en las carpetas de la exportación. La opción **Un solo documento**, bajo la zona para soltar archivos, da en su lugar un único archivo: un índice y después cada página bajo su encabezado, separadas por líneas horizontales, con las bases de datos al final.

Una imagen se localiza por su ruta relativa o, si no, por su nombre de archivo en cualquier lugar del archivo comprimido, y se escribe en la página como dirección `data:`.

## Lo que se pierde

- **El destino de los enlaces entre páginas.** Notion enlaza las páginas por sus nombres de archivo exportados, y una vez que las páginas son documentos ya no hay nada con esos nombres. El enlace conserva sus palabras y pierde la dirección, en los dos modos; también el enlace al `.csv` de una base de datos.
- **Los identificadores**, de títulos y nombres de carpeta. Si todo está dentro de la carpeta `Export-…` de Notion, la carpeta de la importación toma el nombre de su .zip.
- **Otros archivos.** Los PDF y demás adjuntos no se leen, y un .zip dentro del .zip no se abre.
- **Las imágenes que exceden la cuota**, que conservan su dirección anterior en lugar de incrustarse.

## Un ejemplo

Una exportación de Notion contiene una página Project plan y, en su carpeta, una imagen, una base de datos Tasks y una subpágina Meeting notes con una lista breve. El Markdown de la página dice:

```markdown
# Project plan

Launch is planned for **March**. Notes from the kick-off are in [Meeting notes](Project%20plan%200f1e2d3c4b5a69788796a5b4c3d2e1f0/Meeting%20notes%20a1b2c3d4e5f60718293a4b5c6d7e8f90.md); wording follows the [style guide](https://example.com/style).

![Timeline](Project%20plan%200f1e2d3c4b5a69788796a5b4c3d2e1f0/timeline.png)
```

Con **Un solo documento**, la exportación queda así (con el base64 de la imagen abreviado):

```markdown
# Contents

- Project plan
- Meeting notes
- Tasks

---

# Project plan


Launch is planned for **March**. Notes from the kick-off are in Meeting notes; wording follows the [style guide](https://example.com/style).

![Timeline](data:image/png;base64,iVBORw0KGgo…)

---

# Meeting notes


- Scope agreed
- [ ] Book the room

---

# Tasks

| Name | Status | Owner |
| --- | --- | --- |
| Draft brief | Done | Ana |
| Review, round 2 | In progress | Tom |
```

Como **Una carpeta de páginas**, la importación contiene una carpeta Project plan con tres documentos, en este orden: Project plan, Meeting notes, Tasks.

## Límites

- **250 MB por .zip**, procesado en su navegador. Sin iniciar sesión no se sube nada; con sesión iniciada, nada llega a su cuenta hasta que lo guarde.
- **Las imágenes comparten una cuota**: 2 MB codificados en un documento único, unos 4 MB menos el texto por cada página de una carpeta, y 1 MB (unos 750 KB en disco) por imagen. Un PNG, JPEG, WebP o BMP de más de 120 KB se redibuja antes, a 1600 píxeles como máximo en su lado largo, y solo se conserva si así ocupa menos.
- **4 MB por documento guardado.** Una página mayor se nombra y se deja fuera al guardar la carpeta; un documento único mayor puede descargarse igualmente.
- **Orden por ruta**: alfabético, con «Page 2» antes de «Page 10».

## Preguntas

### ¿Cómo convertir Notion a Markdown?

Exporte la página o el espacio de trabajo desde Notion en formato «Markdown & CSV» y suba aquí el .zip. Las páginas llegan bajo sus títulos y las bases de datos, como tablas.

### ¿Qué son los códigos de 32 caracteres de los nombres de archivo exportados?

Cada uno es el identificador de una página en Notion, añadido a sus nombres de archivo y de carpeta y usado en cada enlace hacia ella. La conversión los quita; [Cómo abrir un .zip de exportación](/how-to/open-zip) explica por qué renombrar los archivos a mano rompe los enlaces.

### ¿Conviene exportar también las subpáginas?

Sí, si quiere las páginas que cuelgan de la que exporta: solo se convierte lo que hay en el .zip. Si además está activado «Create folders for subpages», una página y sus subpáginas se convierten aquí en una carpeta, con la página primero.

### ¿Siguen funcionando los enlaces entre páginas?

No: sus palabras se quedan y sus direcciones se pierden. Para obtener archivos separados que sigan enlazándose entre sí, [Convertir una exportación de Notion](/blog/convert-notion-export-to-markdown) explica la reescritura que hace falta.

### ¿Es lo mismo que notion-to-md?

No. notion-to-md es un paquete de Node que lee las páginas a través de la API de Notion con un token de integración; esta página lee el .zip exportado y nunca se conecta a su espacio de trabajo.

### ¿Se puede llevar una exportación de Notion a Obsidian?

En parte. Con **Una carpeta de páginas**, elija **Descargar .zip** y luego **Para Obsidian**: las mismas carpetas, un archivo `.md` por página y los enlaces a encabezados escritos como los lee Obsidian. Los enlaces entre páginas llegan como texto simple.
