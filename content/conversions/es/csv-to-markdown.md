## Lo que se conserva

La primera fila del archivo pasa a ser el encabezado de la tabla, y cada fila siguiente, una fila de la tabla. El nombre del archivo, sin la extensión, queda encima como título: `orders.csv` se abre como `# orders`.

Un `.tsv` se divide siempre por tabulaciones. En cualquier otro archivo se usa como separador el carácter que más se repite en la primera línea, fuera de las comillas, entre la coma, la tabulación, el punto y coma y la barra vertical; si no aparece ninguno, la coma. Por eso una exportación de un Excel configurado para España, que separa los campos con punto y coma, no necesita ningún ajuste, y una coma decimal como la de `3,50` se queda en su celda.

Las comillas siguen la RFC 4180:

| En el archivo | En el Markdown |
| --- | --- |
| Una coma dentro de un campo entre comillas | Se queda en la celda |
| Unas comillas duplicadas dentro de ese campo | Una sola comilla literal |
| Un salto de línea dentro de ese campo | `<br>`, porque una fila de tabla no puede ocupar dos líneas |
| Una barra vertical en un valor | Escapada con una barra invertida, para que no cierre la celda |
| Una barra invertida en un valor | Duplicada, para que se muestre y no se lea como escape |
| Líneas en blanco, una marca de orden de bytes (BOM) | Se eliminan |

Los valores siguen siendo texto, tal como están escritos: `42.50` conserva el cero final y `007` los ceros iniciales. Lo único que se recorta son los espacios al principio y al final de cada celda.

## Lo que se pierde

- **La alineación.** Cada columna recibe un `---` sin más, así que los números no quedan alineados a la derecha. Si lo necesita, cambie a mano el `---` de esa columna por `---:`.
- **El escape más allá de las barras verticales.** Los asteriscos, guiones bajos y acentos graves de un valor se dejan tal cual, de modo que una celda con `*urgent*` se muestra en cursiva.
- **Todo lo que añade una hoja de cálculo.** Un CSV solo contiene valores: ni fórmulas, ni colores, ni una segunda hoja. Si se trata de un libro de Excel, arrastre el propio `.xlsx` a esta página y lo leerá el conversor de Excel.

## Un ejemplo

Una exportación de pedidos con una coma, un salto de línea y comillas duplicadas dentro de campos entre comillas, y una barra vertical en un campo sin ellas:

```csv
id,customer,note,total
1001,"Smith, Jane","Leave at the door
Ring twice",42.50
1002,"Acme ""North"" Ltd",,19.99
1003,Brown | Co,*urgent*,7.00
```

Guardada como `orders.csv`, se convierte en un título `# orders` y esta tabla:

```markdown
| id | customer | note | total |
| --- | --- | --- | --- |
| 1001 | Smith, Jane | Leave at the door<br>Ring twice | 42.50 |
| 1002 | Acme "North" Ltd |  | 19.99 |
| 1003 | Brown \| Co | *urgent* | 7.00 |
```

## Límites

- Un archivo puede ocupar hasta 10 MB. Si se sueltan varios a la vez, cuentan juntos para ese límite y se convierten en un solo documento, cada tabla bajo su propio título.
- El archivo se convierte en su navegador y no se sube a ningún sitio. Si tiene la sesión iniciada, la tabla llega a su cuenta solo cuando pulsa «Guardar», y un documento guardado puede ocupar como máximo 4 MB.
- Las filas más cortas se completan con celdas vacías. Una fila más larga que el encabezado, a menudo por una coma de más al final, añade una columna con el encabezado vacío.
- Un archivo vacío se rechaza con el mensaje «Ese archivo no tiene ninguna fila.»

## Preguntas

### ¿Cómo se convierte un CSV a una tabla Markdown?

Suba el archivo o pegue su texto: las celdas copiadas de una hoja de cálculo llegan separadas por tabulaciones, y esas tabulaciones se detectan. El botón principal descarga un archivo `.md`, y el menú que tiene al lado ofrece HTML, Word y texto sin formato. [Cómo convertir un CSV en una tabla Markdown sin romper los datos](/blog/convert-csv-to-markdown-table) repasa los archivos que suelen dar problemas.

### ¿Cómo se escribe una tabla Markdown?

Una fila de encabezado, una fila separadora de guiones y después una línea por registro, con barras verticales entre las celdas. Las tablas vienen de GitHub Flavored Markdown, no del núcleo de CommonMark, así que un renderizador que siga CommonMark al pie de la letra muestra las barras como texto. [Tablas Markdown que sobreviven la conversión](/blog/markdown-tables-that-survive-conversion) recoge todas las formas en que se rompen.

### ¿Funciona con punto y coma, tabulaciones y comas entre comillas?

Sí. El separador se detecta en la primera línea, un `.tsv` se lee siempre como separado por tabulaciones, y todo lo que está dentro de un campo entre comillas se queda en su celda.

### ¿Qué pasa si el archivo no tiene fila de encabezado?

La primera fila es siempre el encabezado, y no hay ningún ajuste que lo cambie. Añada arriba una línea con los nombres de las columnas antes de convertir; si no, el primer registro acabará en el encabezado.

### ¿Por qué las tildes y las eñes salen mal?

El archivo se lee como UTF-8, así que un CSV guardado en una codificación más antigua, como Windows-1252, pierde las letras acentuadas. Vuelva a guardarlo en UTF-8, que Excel ofrece como «CSV UTF-8». [Cómo abrir un archivo .csv](/how-to/open-csv) trata el resto de problemas de importación.

### ¿Se puede convertir una tabla Markdown de vuelta a CSV?

No. Las descargas disponibles son Markdown, HTML, Word, texto sin formato, EPUB y formatos para Confluence, Jira y Slack; CSV no está entre ellas.
