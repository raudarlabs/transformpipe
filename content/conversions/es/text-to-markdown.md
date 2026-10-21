## Lo que se conserva

Cada carácter y cada línea, con una barra invertida o una entidad añadida casi en cualquier sitio donde Markdown leería formato en un texto plano:

| En el archivo | En el Markdown |
| --- | --- |
| `*`, `_`, `` ` ``, `[`, `]`, `~` en cualquier posición | `\*`, `\_`, `` \` ``, `\[`, `\]`, `\~` |
| Una barra invertida, como en `C:\Users` | Dos: `C:\\Users` |
| `#` o `>` al principio de una línea | `\#`, `\>` |
| `-`, `+`, `1.` o `1)` y un espacio al principio de una línea | `\-`, `\+`, `1\.`, `1\)` |
| `<` antes de una letra, `/`, `!` o `?` | `&lt;` |
| `&` que inicia una entidad, como `&amp;` | `&amp;amp;` |

Cada salto de línea recibe una barra invertida, el salto de línea forzado y visible de CommonMark, porque de lo contrario Markdown uniría las líneas. Varias líneas en blanco seguidas pasan a ser un solo cambio de párrafo, los finales de línea de Windows se normalizan y se elimina la marca de orden de bytes (BOM).

Todo lo demás se copia tal como se escribió, `AT&T` y `a < b` incluidos.

## Lo que se pierde

No se pierde ninguna palabra. Lo que no pasa es la estructura que el texto solo sugiere:

- **Títulos.** Un título en mayúsculas sigue siendo una línea normal.
- **Listas.** Una línea que empieza con un guion o un número sigue siendo una línea.
- **Alineación.** Los espacios y tabuladores iniciales se quedan en el Markdown, pero al mostrarse se colapsan.

## Un ejemplo

Un archivo de texto con las notas de una reunión:

```text
Standup notes, 14 October
Owner: priya_k

- deploy moved to *Thursday*
1. fix the login bug first
# of open tickets: 12
Wrap key names in <kbd> in the docs

> 3 failing tests, see C:\ci\log.txt
```

se convierte en:

```markdown
Standup notes, 14 October\
Owner: priya\_k

\- deploy moved to \*Thursday\*\
1\. fix the login bug first\
\# of open tickets: 12\
Wrap key names in &lt;kbd> in the docs

\> 3 failing tests, see C:\\ci\\log.txt\
```

Una vez mostrado, se lee línea por línea igual que el archivo, `<kbd>` incluido; solo sobra la última barra invertida. Leído como Markdown, el mismo archivo daría una viñeta, cursiva, una lista numerada, un título y una cita.

## Límites

- Archivos `.txt`, o texto pegado, hasta 10 MB de una vez. Varios archivos forman un solo documento, separados por `---`.
- El archivo se convierte en su navegador y no se sube. Solo llega a su cuenta si ha iniciado sesión y pulsa Guardar, y un documento guardado puede ocupar como máximo 4 MB.
- El archivo se lee como UTF-8: un texto guardado en Windows-1252 muestra caracteres de sustitución en lugar de sus letras acentuadas, y [Cómo abrir un archivo .txt](/how-to/open-txt) explica cómo volver a abrirlo con la codificación correcta.
- Un archivo que termina con un único salto de línea, como lo guardan casi todos los editores, conserva una barra invertida tras su última línea, y la vista previa la muestra: es la que cierra el ejemplo.
- `$`, `=` y `^` no se escapan, así que la vista previa muestra `$x+1$` como una fórmula, `==palabra==` resaltado y `x^2^` como superíndice. Una suma entre corchetes como `[a+b]` también se convierte en fórmula, porque los corchetes escapados son los delimitadores de LaTeX.
- Una línea suelta de tres o más guiones se convierte en una línea horizontal, y una línea de `=` o de `-` que cierra un párrafo lo convierte en título. Una tabla escrita con barras verticales se queda en texto.
- Un párrafo sangrado con cuatro espacios o un tabulador, salvo el primero, se convierte en un bloque de código en el que se ven las barras invertidas.
- Una dirección web que contiene un guion bajo, o que termina una línea, muestra una barra invertida de más cuando la vista previa la convierte en enlace.

## Preguntas

### ¿Por qué no basta con cambiar la extensión de .txt a .md?

Si el archivo se escribió en Markdown, basta: un `.md` va a la página Markdown a HTML, que lo toma tal cual. Si no, cambiar la extensión convierte un guion en viñeta y un asterisco en cursiva.

### ¿Se puede convertir texto enriquecido a Markdown?

Con este conversor no. Un `.txt` no guarda formato, y el cuadro para pegar admite texto plano, así que la negrita y los títulos copiados de una página llegan como palabras sin más. Un `.rtf` tiene su propio conversor, Texto enriquecido a Markdown; una página web guardada va a HTML a Markdown.

### ¿Convertirá mis títulos y listas en Markdown?

No. No puede distinguir un título de una frase corta, ni una viñeta de un signo menos, y una suposición equivocada cambiaría lo que dice el texto.

### ¿Por qué hay barras invertidas por todas partes?

Son caracteres de escape, y al mostrarse quedan ocultos: `\*` aparece como un asterisco, y una barra invertida al final de una línea como un salto de línea. [Caracteres de escape en Markdown](/blog/markdown-escaping) explica qué protege cada uno; [Saltos de línea y listas en Markdown](/blog/markdown-line-breaks-and-lists) explica el salto.

### ¿Puedo convertir texto a Markdown desde un script?

Sí, con una cuenta: envíe el texto como cuerpo de la petición a `/api/v1/documents?kind=text-to-markdown`, con una clave de API del menú de su cuenta. En el servidor se ejecuta el mismo conversor, que guarda un documento.
