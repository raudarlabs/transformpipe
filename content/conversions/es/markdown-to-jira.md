## Lo que se conserva

El marcado wiki de Jira se parece a Markdown, pero se lee de otra manera: un solo asterisco pone negrita, un guion tacha el texto, una lista es una serie de `*` o `#`, y un salto de línea dentro de un párrafo sigue siendo un salto. Al convertir Markdown a marcado de Jira, cada elemento se reescribe en la forma que Jira entiende:

| En el Markdown | En el marcado de Jira |
| --- | --- |
| `## Heading` | `h2. Heading` |
| `**bold**`, `*italic*`, `~~struck~~` | `*bold*`, `_italic_`, `-struck-` |
| `[words](https://example.com)` | `[words\|https://example.com]` |
| `![chart](https://example.com/a.png)` | `!https://example.com/a.png\|alt=chart!` |
| Un bloque de código en un lenguaje que Jira conoce | `{code:python}` |
| Cualquier otro bloque de código | `{noformat}` |
| Una tabla | `\|\|head\|\|` y `\|cell\|` |
| Una cita | `{quote}` |
| Una alerta como `> [!WARNING]` | `{panel}` con el color que Atlassian usa para ese tipo |
| Una lista de tareas | `(/)` para lo hecho, `☐` para lo pendiente |

Las listas anidadas repiten el marcador, de modo que una viñeta bajo un elemento numerado pasa a ser `#*`. Las líneas cortadas dentro de un párrafo se unen, para que Jira no las parta donde las partió el editor. Un enlace a un encabezado del propio documento sigue llevando a su sitio, a un `{anchor}` escrito al principio de ese encabezado, y las notas al pie se convierten en números en superíndice.

Los corchetes, las llaves y las barras verticales se escapan siempre con una barra invertida, porque cada uno abre un enlace, una macro o una celda. Un signo como `*` o `-` solo se escapa en el borde de una palabra, que es donde Jira lo interpretaría: `e-mail` se queda igual y `-flag` pasa a ser `\-flag`. Los emoticonos como `(i)` se escapan para que sigan siendo texto, y la negrita en mitad de una palabra usa la forma entre llaves, `{*}un{*}believable`. Las reglas del propio Markdown están en [la referencia sobre el escape](/blog/markdown-escaping).

## Lo que se pierde

- **El front matter** al principio de una nota se elimina, y los **wikienlaces** conservan solo sus palabras.
- **Las imágenes sin dirección web**, con una ruta relativa o incrustadas en el archivo, se convierten en su descripción en cursiva, `_\[diagram\]_`, o desaparecen si no la tienen, porque Jira no puede cargarlas; más detalles en [imágenes y enlaces que siguen funcionando](/blog/images-and-links-that-still-work).
- **El HTML en bruto** conserva su texto y pierde las etiquetas y los comentarios.
- **Una cita dentro de otra** se integra en la exterior, porque `{quote}` no admite anidamiento.
- **La alineación de las columnas** de las tablas.
- **Los diagramas y las fórmulas** llegan como código fuente, en `{noformat}` o `{{ }}`.

## Un ejemplo

Un informe de error escrito en Markdown:

````markdown
## Steps to reproduce

1. Open **Billing** and pick a plan
2. Run `sync --force`, then check the [log](https://example.com/log)

> [!WARNING]
> The retry deletes the draft invoice.

| Field | Before | After |
| --- | --- | --- |
| Status | *open* | ~~paid~~ |

```ts
await retry(invoice);
```

- [x] Reproduced on staging
- [ ] Fixed
````

El marcado de Jira que resulta:

```text
h2. Steps to reproduce

# Open *Billing* and pick a plan
# Run {{sync \-\-force}}, then check the [log|https://example.com/log]

{panel:title=Warning|bgColor=#FFFAE6}
The retry deletes the draft invoice.
{panel}

||Field||Before||After||
|Status|_open_|-paid-|

{code:javascript}
await retry(invoice);
{code}

* (/) Reproduced on staging
* ☐ Fixed
```

Los guiones dentro de `{{ }}` se escapan porque Jira sigue leyendo ahí los signos de formato, y TypeScript se escribe como `javascript`, el lenguaje más cercano que conoce la macro `{code}`.

## Límites

- Archivos `.md`, `.markdown`, `.mdown` y `.mkd` de hasta 10 MB, o Markdown pegado en la página. Varios archivos soltados a la vez forman un solo documento, y los 10 MB cuentan para el conjunto.
- La conversión se hace en el navegador. No se sube nada salvo que se inicie sesión y se pulse Guardar; una cuenta guarda documentos de hasta 4 MB.
- La descarga es un archivo de texto, `<name>.jira.txt`.
- Una lista numerada empieza en 1 en Jira, sea cual sea el número con el que empezaba el Markdown. Un bloque de código o una tabla dentro de un elemento de lista se escribe después de la línea de ese elemento, y la numeración vuelve a empezar debajo.

## Preguntas

### ¿Jira admite Markdown?

En parte. El editor de Jira Cloud da formato al Markdown mientras se escribe, pero el modo texto de Jira Data Center, la versión 2 de la API REST y las reglas de automatización leen marcado wiki, y el Markdown pegado tal cual resalta las palabras equivocadas.

### ¿Cómo pego Markdown en Jira Cloud sin perder el formato?

Basta con convertirlo aquí y pulsar «Copiar para Jira». El portapapeles recibe el marcado wiki como texto plano y el documento ya formateado como HTML, y el editor de Jira Cloud toma la versión con formato. Hay más detalles en [la guía para pegar](/how-to/paste-markdown).

### ¿Se puede convertir el marcado de Jira a Markdown?

No. La conversión va en un solo sentido, de Markdown a marcado wiki.

### ¿Por qué mi bloque de código ha salido como {noformat}?

El bloque no tenía lenguaje, o tenía uno que la macro `{code}` no conoce. Un bloque `{code}` sin lenguaje se resalta como Java, así que `{noformat}` lo muestra tal cual. Las abreviaturas como `sh` y `yml` se traducen a `bash` y `yaml`.

### ¿Genera el JSON de la versión 3 de la API REST?

No. La versión 3 de la API REST de Jira Cloud espera Atlassian Document Format, que esta herramienta no escribe; el marcado wiki lo acepta la versión 2.

### ¿Es el mismo formato que usa Confluence?

No. Confluence guarda cada página en su formato de almacenamiento, XHTML con macros propias, y ese formato es el que escribe el conversor de Markdown a Confluence.
