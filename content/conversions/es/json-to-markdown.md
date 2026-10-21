## Lo que se conserva

JSON no tiene títulos ni párrafos, así que el conversor decide según la forma de los datos. El nombre del archivo, sin la extensión, pasa a ser el título del documento: `users.json` se abre como `# users`.

| En el archivo | En el Markdown |
| --- | --- |
| Un array de objetos cuyos valores son todos simples | Una tabla, una fila por objeto y las claves como columnas |
| Un array de valores simples | Una lista con viñetas |
| Un objeto | Sus campos simples como etiquetas en negrita (`**Status:** shipped`) y después un título por cada campo anidado (`## Customer`) |
| Un array de elementos mezclados o anidados | Una sección numerada por elemento: `## 1`, `## 2` |
| Un objeto o una lista mezclada a tres niveles por debajo del título | Un bloque de código `json` delimitado, bien sangrado |
| `null` | `_null_`, escrito en lugar de omitido |
| Un array o un objeto vacío | `_Empty list._` o `_Empty object._` |

Las columnas se recogen de todos los registros, en el orden en que aparecen por primera vez: un campo que solo tiene el décimo registro recibe igualmente su columna, y los demás registros dejan ahí una celda vacía. Las claves se convierten en palabras: los guiones bajos y los guiones pasan a ser espacios, el camelCase se separa y la primera letra va en mayúscula, de modo que `first_name` se lee «First name» y `lastLogin`, «Last Login».

## Lo que se pierde

- **Las claves tal como están escritas.** Fuera de un bloque de código solo aparece la forma reescrita.
- **El formato de los números.** Los números se leen como números: `42.50` sale como `42.5`, `1e3` como `1000`, y un entero de más de unas 15 cifras puede perder las últimas. Los valores entre comillas no se tocan: `"007"` sigue siendo `007`.
- **La tabla, en cuanto un registro está anidado.** Basta con que un solo registro contenga una lista, aunque esté vacía, para que todo el array se convierta en secciones numeradas. Nada se aplana en nombres de columna con puntos.
- **El escape.** Las cadenas se escriben tal cual, así que los asteriscos o guiones bajos de un valor se leen como Markdown. Dentro de una tabla, la barra vertical se escapa y un salto de línea se convierte en `<br>`.

## Un ejemplo

Una lista de usuarios devuelta por una API, guardada como `users.json`:

```json
[
  { "id": 1, "first_name": "Ana", "isActive": true, "lastLogin": "2026-10-01" },
  { "id": 2, "first_name": "Ben", "isActive": false, "lastLogin": null },
  { "id": 3, "first_name": "Chloé", "isActive": true, "team": "Docs | Web" }
]
```

Se convierte en un título `# users` y esta tabla:

```markdown
| Id | First name | Is Active | Last Login | Team |
| --- | --- | --- | --- | --- |
| 1 | Ana | true | 2026-10-01 |  |
| 2 | Ben | false | _null_ |  |
| 3 | Chloé | true |  | Docs \| Web |
```

## Límites

- Un archivo puede ocupar hasta 10 MB, y la página solo acepta `.json`, así que un archivo `.jsonl` o `.ndjson` hay que renombrarlo antes. También puede pegar el texto.
- El archivo se convierte en su navegador y no se sube a ningún sitio. Si tiene la sesión iniciada, el documento llega a su cuenta solo cuando pulsa «Guardar», y un documento guardado puede ocupar como máximo 4 MB.
- El JSON tiene que ser estricto. Un archivo que no se puede leer se rechaza con «That is not valid JSON» y el mensaje del propio navegador, que suele indicar la posición del error.

## Preguntas

### ¿Cómo se convierte JSON a una tabla Markdown?

Un array de objetos cuyos valores sean todos cadenas, números, booleanos o `null` se convierte en una sola tabla. Aplane antes los registros anidados, por ejemplo con `jq`, o acepte secciones en su lugar. [JSON a tabla Markdown](/blog/convert-json-to-markdown-table) explica qué se convierte con limpieza y qué no.

### ¿Qué pasa con el JSON anidado?

Cada campo anidado recibe un título, hasta tres niveles por debajo del título del documento. En ese nivel, un objeto o una lista mezclada se convierte en un bloque de código `json`, mientras que una tabla o una lista simple se sigue mostrando como tal.

### ¿Se puede convertir JSON a Markdown con Python?

No hay un paquete de Python: la página convierte en el navegador. Con una cuenta, la API ejecuta el mismo código: envíe el archivo a `POST /api/v1/documents?kind=json-to-markdown&name=users.json` con una clave de API, desde `requests` o cualquier cliente HTTP, y el resultado se guarda en su cuenta con el título `# users`.

### ¿Lee JSON Lines?

Sí, siempre que el archivo termine en `.json`. Si el archivo completo no se puede leer, cada línea no vacía se lee como un valor propio, de modo que un log con un objeto plano por línea se convierte en una tabla. Si alguna línea falla, se informa del error del primer intento.

### ¿Por qué dice que mi archivo no es un JSON válido?

Las causas habituales son una coma después del último elemento, comillas simples en lugar de dobles y comentarios, que JSON no admite. [Cómo abrir un archivo .json](/how-to/open-json) explica cómo localizar el fallo a partir de la posición que indica el mensaje.

### ¿Se puede convertir Markdown de vuelta a JSON?

No. Las descargas disponibles son Markdown, HTML, Word, texto sin formato, EPUB y formatos para Confluence, Jira y Slack; JSON no está entre ellas.
