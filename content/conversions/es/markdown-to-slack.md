## Lo que se conserva

El formato de Slack se llama mrkdwn, y no es Markdown: un solo asterisco pone negrita, un guion bajo pone cursiva, una sola virgulilla tacha el texto, un enlace se escribe `<address|words>` y no tiene encabezados ni tablas. Al convertir Markdown a mrkdwn de Slack, cada elemento se escribe como lo más parecido que admite un mensaje:

| En el Markdown | En el mrkdwn |
| --- | --- |
| `## Heading` | `*Heading*`, una línea en negrita aparte |
| `**bold**`, `*italic*`, `~~struck~~` | `*bold*`, `_italic_`, `~struck~` |
| `[words](https://example.com)` | `<https://example.com\|words>` |
| `![chart](https://example.com/a.png)` | `<https://example.com/a.png\|chart>` |
| Viñetas anidadas | `•`, luego `◦`, luego `▪`, cuatro espacios más adentro en cada nivel |
| `3. item` | `3. item`, contando desde el primer número del Markdown |
| Una lista de tareas | `☑` para lo hecho, `☐` para lo pendiente |
| Un bloque de código delimitado | un bloque de código, sin su lenguaje |
| Una tabla | un bloque de código con las columnas rellenadas |
| Una cita | `>` al principio de cada línea |
| Una alerta como `> [!TIP]` | una cita encabezada por `:bulb:` y el título en negrita |
| Una nota al pie | `[1]`, con las notas al final |

Una imagen con dirección web se convierte en un enlace a ella, que Slack despliega para mostrar la imagen. El texto resaltado pasa a negrita. La negrita en mitad de una palabra, como en `**un**believable`, lleva un espacio de ancho cero junto al asterisco para que Slack la siga leyendo. Las demás alertas empiezan con su propio emoji, como `:warning:`.

Cada columna de una tabla se rellena hasta su celda más ancha, con una línea de `─` bajo la fila de encabezado, y una columna alineada a la derecha sigue alineada a la derecha.

`&`, `<` y `>` se escriben como `&amp;`, `&lt;` y `&gt;`, las entidades que pide la API de Slack.

## Lo que se pierde

- **El formato dentro de encabezados, textos de enlace y celdas de tabla.** Las palabras se quedan y las marcas se van.
- **Los enlaces a encabezados del propio documento** conservan sus palabras y pierden la dirección, porque un mensaje no tiene encabezados a los que saltar.
- **El lenguaje de un bloque de código**, para el que los bloques de código de Slack no tienen sitio.
- **Subíndices y superíndices**: `H~2~O` llega como H2O.
- **Las imágenes sin dirección web** pasan a ser `_[description]_`, o `_[picture]_` si no tienen descripción; más detalles en [imágenes y enlaces que siguen funcionando](/blog/images-and-links-that-still-work).
- **El front matter** se elimina, los **wikienlaces** conservan sus palabras y **el HTML en bruto** conserva solo su texto.
- **Los diagramas y las fórmulas** llegan como código fuente, con letra de código.

## Un ejemplo

Una nota de versión escrita en Markdown:

```markdown
## Release 4.2

Exports are **twice as fast**. Details in the [changelog](https://example.com/changes).

- Word export
  - tables keep their widths
- [ ] Update the docs

| Plan | Price |
| :--- | ---: |
| Team | 8 |
| Business | 15 |

> [!TIP]
> Restart the app to pick it up.
```

El mrkdwn que resulta:

````text
*Release 4.2*

Exports are *twice as fast*. Details in the <https://example.com/changes|changelog>.

• Word export
    ◦ tables keep their widths
☐ Update the docs

```
Plan      Price
────────  ─────
Team          8
Business     15
```

> :bulb: *Tip*
> Restart the app to pick it up.
````

## Límites

- Archivos `.md`, `.markdown`, `.mdown` y `.mkd` de hasta 10 MB, o Markdown pegado en la página. Varios archivos soltados a la vez forman un solo documento, y los 10 MB cuentan para el conjunto.
- La conversión se hace en el navegador. No se sube nada salvo que se inicie sesión y se pulse Guardar; una cuenta guarda documentos de hasta 4 MB.
- La descarga es un archivo de texto, `<name>.slack.txt`.
- El resultado es texto mrkdwn, no JSON de Block Kit.

## Preguntas

### ¿Slack admite Markdown?

No en el `text` de un mensaje, que Slack lee como mrkdwn: marcas simples, enlaces entre corchetes angulares, sin encabezados ni tablas. Por eso el Markdown enviado ahí por la API o por un webhook llega con asteriscos dobles, almohadillas al principio de las líneas y una tabla dibujada con barras verticales.

### ¿Cómo pego Markdown en Slack sin perder el formato?

Basta con convertirlo aquí y pulsar «Copiar para Slack». El portapapeles recibe el mrkdwn como texto plano y el documento ya formateado como HTML, y el cuadro de mensaje de Slack toma la versión con formato. Hay más detalles en [la guía para pegar](/how-to/paste-markdown).

### ¿Puede un mensaje de Slack mostrar una tabla?

No en mrkdwn, que no las tiene. La tabla se escribe como un bloque de código con las columnas rellenadas, que queda alineado porque un bloque de código usa letra de ancho fijo. El formato de las celdas se descarta, ya que un bloque de código mostraría los asteriscos en lugar de interpretarlos.

### ¿Por qué el resultado dice `&amp;` en lugar de `&`?

Slack trata `&`, `<` y `>` como caracteres de control, y su API espera que lleguen escritos como entidades. Un mensaje enviado por la API o por un webhook los muestra como los propios caracteres.

### ¿Genera JSON de Block Kit?

No. Escribe el texto mrkdwn, que va en el campo `text` de una llamada a `chat.postMessage` o de un webhook entrante, o en un bloque de sección. El JSON que lo rodea queda por cuenta de quien lo envía.
