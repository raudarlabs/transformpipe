## Lo que se conserva

Cada hoja con al menos una fila rellena se convierte en una tabla Markdown, en el orden del libro y con las hojas ocultas incluidas. Si el libro tiene una sola hoja así, sale una tabla bajo un título tomado del nombre del archivo. Con dos o más, tras ese mismo título viene la lista de los nombres de las hojas y después cada hoja bajo su propio título, separada de la siguiente por una línea horizontal.

La primera fila de cada hoja pasa a ser la fila de encabezado, y las filas más cortas se completan con celdas vacías.

| En el libro | En el Markdown |
| --- | --- |
| Texto | El mismo texto, sin espacios al principio ni al final |
| Un número | El valor guardado: `1250`, no `£1,250.00` |
| Una fecha | Una fecha ISO como `2026-07-14` |
| VERDADERO y FALSO | `true` y `false` |
| Una fórmula | El resultado guardado con el archivo |
| Un salto de línea dentro de una celda | `<br>` |
| Una barra vertical | Escapada, para que no cierre la celda |
| Una fila vacía entre filas | Una fila de celdas vacías |

## Lo que se pierde

Todo lo que no sea un valor. Primero, los formatos de número: símbolos de moneda, separadores de miles, decimales elegidos y porcentajes, de modo que una celda que muestra 10 % sale como `0.1`. Una fecha con hora conserva solo la fecha, y una hora sola sale como la fecha `1899-12-30`. No se leen fuentes, colores, bordes, anchos de columna, formato condicional, comentarios, gráficos ni imágenes.

Una celda combinada conserva su valor en la primera celda, y las celdas que cubría salen vacías. Un vínculo conserva su texto y pierde la dirección. Una fórmula que termina en un error como `#¡DIV/0!` da una celda vacía.

Los asteriscos y guiones bajos escritos en una celda no se escapan: `**borrador**` en una celda aparece en negrita al mostrar el Markdown.

## Un ejemplo

`q3-budget.xlsx` tiene tres hojas. «Q3 budget» recoge dos compras con fecha, un coste con formato de libras y una columna de VERDADERO o FALSO, un nombre partido en dos líneas y una fila de total con `=SUM(D2:D3)`. «Suppliers» tiene un nombre con una barra vertical y un descuento con formato de porcentaje. La tercera hoja está vacía.

  ```markdown
  # q3-budget

  - Q3 budget
  - Suppliers

  ---

  # Q3 budget

  | Item | Owner | Due | Cost | Approved |
  | --- | --- | --- | --- | --- |
  | Laptop stands | Priya | 2026-07-14 | 1250 | true |
  | Monitor arms<br>(pair) | Sam | 2026-08-01 | 480.5 | false |
  | Total |  |  | 1730.5 |  |

  ---

  # Suppliers

  | Supplier | Lead time | Discount |
  | --- | --- | --- |
  | Ergodesk \| UK | 5 days | 0.1 |
  | Northlight | 2 weeks |  |
  ```

La hoja vacía no aparece, tampoco los símbolos de libra ni el porcentaje, y el total es la cifra que Excel guardó.

## Límites

Un archivo puede ocupar hasta 50 MB. Varios libros soltados a la vez se reparten esos 50 MB y se convierten en un solo documento.

La página solo acepta `.xlsx`: los archivos `.xls`, `.xlsm` y `.ods` se rechazan, así que conviene guardar antes una copia como `.xlsx`. Un `.csv` soltado aquí pasa al conversor de CSV. Una hoja de gráfico, es decir, un gráfico movido a una hoja propia, hace que por ahora la conversión falle con un error, así que conviene borrarla antes en una copia. Un gráfico colocado en una hoja de cálculo normal simplemente se omite.

Un título o una fila vacía encima de los nombres de columna se convierte en el encabezado, y los datos que empiezan más abajo o más a la derecha conservan las filas y columnas vacías que tienen delante. Conviene borrarlas antes de convertir; las filas y columnas vacías posteriores a los datos se descartan.

Con la sesión iniciada, un documento guardado puede ocupar hasta 4 MB de Markdown. Cómo abrir un `.xlsx` sin Excel se explica en [cómo abrir un archivo .xlsx](/how-to/open-xlsx), y lo que pierden la exportación a CSV o el copiar y pegar, en [Excel a tabla Markdown: todas las vías](/blog/convert-excel-to-markdown-table).

## Preguntas

### ¿Cómo se convierte un archivo de Excel a Markdown?

Suelte el `.xlsx` en esta página o selecciónelo con «Elegir archivos». Las tablas aparecen en pantalla, listas para copiarlas o descargarlas como archivo `.md` con el nombre del libro.

### ¿Se convierten todas las hojas, también las ocultas?

Sí, todas las que tienen alguna fila rellena, en el orden del libro. No se puede elegir una sola hoja, así que, si solo necesita una, borre las demás en una copia del archivo.

### ¿Se conservan las fórmulas?

No, solo sus resultados: cada celda con fórmula da el valor que Excel almacenó al guardar el archivo por última vez. Un libro generado por un script que nunca calculó sus fórmulas da celdas vacías en su lugar.

### ¿Se puede convertir una tabla Markdown a Excel?

No. Aquí nada genera `.xlsx` ni `.csv`: las descargas son Markdown, HTML, texto sin formato, Word, EPUB y los formatos de Confluence, Jira y Slack.

### ¿Se sube el libro a algún servidor?

No. Se descomprime y se convierte en el navegador, y el archivo no sale del equipo. No se envía nada de su contenido salvo que haya iniciado sesión y pulse Guardar, y entonces lo que se guarda es el Markdown, no el libro.
