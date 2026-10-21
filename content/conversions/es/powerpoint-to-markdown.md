## Lo que se conserva

La presentación se convierte en un solo documento: la lista de títulos de las diapositivas y después una sección por diapositiva, separadas por líneas horizontales. Las diapositivas llegan en el orden en que se proyectan, de modo que una diapositiva arrastrada al principio sigue al principio. Dentro de cada diapositiva, las formas se leen en el orden en que las guarda el archivo.

| En la diapositiva | En el Markdown |
| --- | --- |
| El título | El título de la sección, o una primera línea corta, o «Slide 4» |
| Viñetas y números definidos en la diapositiva | Una lista, `-` o `1.`, con sangría según el nivel |
| El resto del texto | Párrafos |
| Palabras en negrita y cursiva | `**negrita**` y `*cursiva*`, salvo que lo esté toda la línea |
| Un vínculo web | Un enlace Markdown a la misma dirección |
| Una tabla | Una tabla Markdown, con la primera fila como encabezado |
| Una imagen | Una imagen incrustada en el documento, con su texto alternativo |
| Las notas del orador | Una cita bajo la diapositiva, con el rótulo **Notes** |

Fuera de las tablas, un asterisco o una almohadilla escritos en una diapositiva se escapan y aparecen tal como se escribieron. Una imagen que vuelve a aparecer en una diapositiva posterior, como un logotipo, solo se incluye la primera vez.

## Lo que se pierde

Los gráficos y los SmartArt no se leen; una diapositiva que solo contiene un diagrama conserva su título y sus notas. Los números de diapositiva, las fechas y los pies de página desaparecen, igual que todo lo que pertenece al diseño: tema, colores, fuentes, posiciones, animaciones y transiciones. Lo que está en el patrón de diapositivas o en un diseño no se lee, ni tampoco los comentarios de revisión. Un vínculo a otra diapositiva apunta a una ruta dentro del archivo, como `ppt/slides/slide3.xml`, y no lleva a ninguna parte.

En una tabla, una celda combinada se descarta en lugar de quedar vacía, así que el resto de su fila se desplaza una columna a la izquierda: un título que abarca dos columnas queda sobre la primera de ellas. Una columna vacía en todas las filas se elimina.

## Un ejemplo

`hiring-plan.pptx` tiene dos diapositivas. «Where the gaps are» tiene tres viñetas definidas en la diapositiva, la segunda con sangría, una palabra en negrita y dos párrafos de notas del orador. «Budget» tiene una tabla de tres filas y un gráfico. Las dos llevan pie de página y número de diapositiva.

  ```markdown
  # hiring-plan

  - Where the gaps are
  - Budget

  ---

  # Where the gaps are

  - Two backend engineers by September
    - One for search, one for payments
  - A designer shared with **Growth**

  > **Notes**
  >
  > We lost two people in June. **Search** is the hire that matters, because the index rebuild is blocked on it.
  >
  > Ask Finance about the designer before Thursday.

  ---

  # Budget

  | Role | Start | Cost |
  | --- | --- | --- |
  | Backend (search) | September | £78k |
  | Backend (payments) | October | £74k |
  ```

El gráfico, el pie de página y los números han desaparecido; las notas están bajo la diapositiva que explican.

## Límites

Un archivo puede ocupar hasta 50 MB. Varias presentaciones soltadas a la vez se reparten esos 50 MB y se convierten en un solo documento. Solo se lee `.pptx`; el antiguo formato binario `.ppt` se rechaza.

Las viñetas se leen de la propia diapositiva. Cuando una diapositiva las hereda de su diseño, como suele hacer el cuadro de contenido del diseño «Título y objetos» de PowerPoint, los puntos llegan como párrafos sueltos, sin viñetas ni niveles. Por la misma razón, el subtítulo de una diapositiva de título puede aparecer como una lista de un solo elemento.

Las imágenes viajan dentro del Markdown, hasta unos 750 KB cada una y 1,5 MB para toda la presentación. Una imagen que supere cualquiera de los dos límites, o que esté en un formato que no se puede incrustar, como EMF, se sustituye por una línea en cursiva, con su texto alternativo si lo tiene.

Las diapositivas ocultas también se convierten. Con la sesión iniciada, un documento guardado puede ocupar hasta 4 MB de Markdown, imágenes incluidas.

## Preguntas

### ¿Cómo se convierte un PowerPoint a Markdown?

Suelte el `.pptx` en esta página o selecciónelo con «Elegir archivos». El documento aparece en pantalla, listo para copiarlo o descargarlo como archivo `.md` con el nombre de la presentación.

### ¿Se incluyen las notas del orador?

Sí, después del contenido de cada diapositiva, como una cita con el rótulo **Notes**. Una exportación a PDF suele perderlas. Dónde se esconde el panel de notas se explica en [cómo abrir un archivo .pptx](/how-to/open-pptx).

### ¿Se puede convertir un archivo .ppt antiguo?

No. El `.ppt` es el formato binario anterior a 2007, y esta página solo lee el `.pptx`, que es un archivo zip. Guarde la presentación como `.pptx` en el programa que la abra y convierta después ese archivo.

### ¿Se puede convertir Markdown a PowerPoint?

No. Aquí nada genera un `.pptx`: un documento se descarga como Markdown, HTML, texto sin formato, Word, EPUB o en los formatos de Confluence, Jira y Slack. Las vías que compara [convertir PowerPoint a Markdown](/blog/convert-powerpoint-to-markdown) parten todas de una presentación.

### ¿Se sube la presentación a algún servidor?

No. Se descomprime y se convierte en el navegador, y el archivo no sale del equipo. No se envía nada de su contenido salvo que haya iniciado sesión y pulse Guardar, y entonces lo que se guarda es el Markdown, no la presentación.
