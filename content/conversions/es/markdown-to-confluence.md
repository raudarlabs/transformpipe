## Lo que se conserva

Para convertir Markdown a Confluence, el texto se escribe en el formato de almacenamiento de Confluence, el XHTML en el que se guarda una página, y se muestra en la pestaña **Confluence** junto a la vista previa:

| En el Markdown | En Confluence |
| --- | --- |
| `#` a `######` | `<h1>` a `<h6>` |
| Un bloque de código delimitado | La macro de código, con su lenguaje cuando la lista de la macro lo incluye |
| `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]` | Las macros `info`, `tip`, `info`, `note` y `warning` |
| Una lista de tareas, cada elemento `- [ ]` o `- [x]` | La lista de tareas propia de Confluence, con casillas que se pueden marcar |
| Un enlace a `#un-encabezado` | Un enlace a una macro de ancla colocada al principio de ese encabezado |
| Una tabla | Una tabla con fila de encabezado y la alineación de las columnas |
| Notas al pie | Números en superíndice y las notas en una lista al final |
| Una imagen en una dirección `https://` | Una imagen que apunta a esa dirección |
| `==resaltado==`, `H~2~O`, `x^2^` | Resaltado, subíndice, superíndice |

Los paneles se asignan por color, no por nombre: en Confluence `note` es amarillo y `warning` rojo, así que el Warning de GitHub pasa a `note` y su Caution a `warning`. Un título escrito tras el marcador, como `> [!TIP] Antes de empezar`, se convierte en el título del panel. Se mantienen las listas anidadas y el número inicial de una lista numerada.

## Lo que se pierde

- **Diagramas y fórmulas.** Un bloque Mermaid queda como su código fuente en una macro de código titulada «Mermaid diagram», una fórmula destacada como su TeX en otra titulada «LaTeX» y una fórmula en línea como código.
- **Las imágenes sin dirección web.** Una ruta relativa o una imagen incrustada en el archivo no puede llegar a una página sin subirla antes, así que se escribe como su texto alternativo en cursiva, `[Screenshot]`, o se omite si no lo tiene.
- **El HTML sin procesar.** Las etiquetas desaparecen y sus palabras se quedan; un `<br>` sigue siendo un salto de línea.
- **El front matter** se elimina, y los **wikilinks** conservan solo sus palabras.
- **Una lista que mezcla tareas y elementos normales** pasa a ser una lista corriente, con las casillas dibujadas como ☑ y ☐.
- **Los lenguajes que la macro de código no incluye**, como Go o Rust: el bloque sale sin lenguaje.

## Un ejemplo

````markdown
## Before you deploy

- [x] Tests pass on `main`
- [ ] Changelog updated

> [!WARNING]
> Deploys are frozen after **Thursday**.

```bash
npm run build
```

Back to [the checklist](#before-you-deploy).
````

se convierte en:

```xml
<h2><ac:structured-macro ac:name="anchor" ac:schema-version="1"><ac:parameter ac:name="">before-you-deploy</ac:parameter></ac:structured-macro>Before you deploy</h2>
<ac:task-list><ac:task><ac:task-id>1</ac:task-id><ac:task-status>complete</ac:task-status><ac:task-body>Tests pass on <code>main</code></ac:task-body></ac:task><ac:task><ac:task-id>2</ac:task-id><ac:task-status>incomplete</ac:task-status><ac:task-body>Changelog updated</ac:task-body></ac:task></ac:task-list>
<ac:structured-macro ac:name="note" ac:schema-version="1"><ac:rich-text-body><p>Deploys are frozen after <strong>Thursday</strong>.</p></ac:rich-text-body></ac:structured-macro>
<ac:structured-macro ac:name="code" ac:schema-version="1"><ac:parameter ac:name="language">bash</ac:parameter><ac:plain-text-body><![CDATA[npm run build]]></ac:plain-text-body></ac:structured-macro>
<p>Back to <ac:link ac:anchor="before-you-deploy"><ac:link-body>the checklist</ac:link-body></ac:link>.</p>
```

## Límites

Un archivo puede pesar hasta 10 MB, o se puede pegar el Markdown directamente. La conversión se hace en su navegador; sin iniciar sesión no se sube nada. **Descargar .confluence.xml** guarda el formato de almacenamiento en un archivo.

Nada de esto se conecta a Confluence: el resultado lo pega o lo envía usted, y su destino decide qué mitad de **Copiar para Confluence** se usa, porque el botón deja dos versiones en el portapapeles.

- **Confluence Cloud.** El editor toma la versión con formato, el HTML de la vista previa, y la convierte en página con sus propias reglas de pegado. Para tener la macro de código, los paneles y la lista de tareas tal como se escribieron, envíe el formato de almacenamiento a `body.storage` de la API REST.
- **Data Center.** El editor de código fuente y la API REST aceptan el formato de almacenamiento. La macro de código solo recibe lenguajes de su propia lista, porque Data Center muestra un recuadro de error con cualquier otro.
- **Ambos.** Los enlaces a encabezados usan macros de ancla, porque Confluence escribe sus propios identificadores de encabezado de forma distinta en Cloud y en Data Center.

El resultado es el cuerpo de una página: un `# Título` al principio se queda dentro como encabezado.

## Preguntas

### ¿Cómo se pega Markdown en Confluence?

Convierta el archivo, pulse **Copiar para Confluence** y pegue. El editor de Cloud toma la versión con formato y un campo que espera marcado toma el formato de almacenamiento; [pegar Markdown en Confluence, Jira o Slack](/how-to/paste-markdown) explica los dos casos.

### ¿Se puede importar o subir Markdown a Confluence directamente?

No. No hay ninguna conexión con Confluence, así que desde aquí no se puede crear, actualizar ni subir una página. Lo que se obtiene es el formato de almacenamiento, para pegarlo o para que un script lo envíe a la API REST.

### ¿Genera Atlassian Document Format (ADF)?

No. La única salida para Confluence es el formato de almacenamiento, el XHTML que acepta `body.storage`. El ADF es un formato JSON distinto, y nada de aquí lo escribe.

### ¿Cómo llegan las tablas Markdown a Confluence?

Como tablas de Confluence: la primera fila como celdas de encabezado, y la alineación que marcan los dos puntos de la fila separadora se mantiene en cada celda. Markdown no tiene celdas combinadas, así que no se crea ninguna; [tablas Markdown que sobreviven a la conversión](/blog/markdown-tables-that-survive-conversion) muestra cómo escribir una tabla para que se reconozca.

### ¿Hay aquí un conversor de HTML a Confluence?

No, y tampoco un plugin: esta página acepta Markdown. Un archivo HTML tiene que pasar primero por la conversión de HTML a Markdown y volver después aquí.
