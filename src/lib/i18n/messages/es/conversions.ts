import type { Content } from '../../content';

/*
 * Cómo se llama cada conversión y qué dice su página.
 *
 * Qué conversiones existen sigue estando en `shared/conversions.ts`, y tiene que seguir ahí: el
 * servidor importa ese archivo para el parámetro `kind` de la API, y el servidor no tiene locale,
 * así que una lista que él lee no puede llevar idioma. Allí queda solo lo que es igual en todas
 * las lenguas — el id, el destino, la dirección, las extensiones.
 *
 * `seo` no es prosa traducida: es lo que la página prerrenderizada dice a un rastreador y lo que
 * se lee en un resultado de búsqueda, así que está escrito alrededor de la frase que alguien
 * teclea de verdad en español.
 */

export const conversions: Content['conversions'] = {
  'markdown-to-html': {
    label: 'Markdown → HTML',
    short: 'MD → HTML',
    title: 'Markdown a HTML',
    blurb:
      'Sube un archivo Markdown — mira el HTML renderizado al instante y descárgalo como un documento listo para usar. Todo se convierte en tu navegador y, con la sesión iniciada, tus documentos llegan a Claude y a ChatGPT a través del conector MCP.',
    hint: 'Sube un archivo .md y mira exactamente cómo va a quedar en HTML. Suelta varios y se enlazan en un solo documento, en el orden en que los elijas.',
    seo: {
      title: 'TransformPipe — convertir Markdown a HTML',
      description:
        'Markdown a HTML en tu navegador: el documento renderizado y un .html autónomo. Y 14 conversiones más a Markdown, con un conector MCP para Claude.',
    },
  },
  'html-to-markdown': {
    label: 'HTML → Markdown',
    short: 'HTML → MD',
    title: 'HTML a Markdown',
    blurb:
      'Sube un archivo HTML —o una página que hayas guardado— y recibe Markdown, con los encabezados, los enlaces, las listas y las tablas intactos.',
    hint: 'Sube un archivo .html y obtén Markdown. Las tablas, las listas de tareas y los bloques de código sobreviven; los estilos no, porque Markdown no tiene ninguno.',
    seo: {
      title: 'Convertir HTML a Markdown — TransformPipe',
      description:
        'Convierte un archivo HTML o una página guardada en Markdown limpio, con tablas y bloques de código. Todo en tu navegador: el archivo no se envía a ningún sitio.',
    },
  },
  'word-to-markdown': {
    label: 'Word → Markdown',
    short: 'DOCX → MD',
    title: 'Word a Markdown',
    blurb:
      'Sube un .docx y obtén Markdown: los encabezados, las listas, los enlaces y las tablas llegan; las fuentes y los márgenes no.',
    hint: 'Sube un .docx de Word, Google Docs o LibreOffice. Lo que vuelve es la estructura del documento en Markdown, no su maquetación.',
    seo: {
      title: 'Convertir Word a Markdown — TransformPipe',
      description:
        'Convierte un documento de Word (.docx) a Markdown en el navegador: encabezados, listas, enlaces y tablas se conservan y el formato se descarta. Nada se sube.',
    },
  },
  'csv-to-markdown': {
    label: 'CSV → tabla Markdown',
    short: 'CSV → MD',
    title: 'CSV a tabla Markdown',
    blurb:
      'Sube un CSV o un TSV y obtén una tabla Markdown, con la primera fila como encabezado y las columnas alineadas.',
    hint: 'Sube un .csv o un .tsv. Los campos entre comillas, las comas que llevan dentro y los saltos de línea dentro de una celda se resuelven todos.',
    seo: {
      title: 'Convertir CSV a tabla Markdown — TransformPipe',
      description:
        'Convierte un archivo CSV o TSV en una tabla Markdown, con los campos entre comillas y las comas de dentro resueltos. Convierte en tu navegador; nada se sube.',
    },
  },
  'json-to-markdown': {
    label: 'JSON → Markdown',
    short: 'JSON → MD',
    title: 'JSON a Markdown',
    blurb:
      'Sube un archivo JSON y léelo como un documento: una lista de registros se vuelve una tabla; un objeto, secciones con sus campos encima.',
    hint: 'Sube un archivo .json. Una lista de registros se vuelve una tabla; los objetos anidados se vuelven encabezados. Un valor por línea —un volcado de log— también se entiende.',
    seo: {
      title: 'Convertir JSON a Markdown — TransformPipe',
      description:
        'Convierte un archivo JSON en Markdown legible: los arrays de registros se vuelven tablas y los objetos, secciones. Convierte en tu navegador; nada se sube.',
    },
  },
  'notion-to-markdown': {
    label: 'Notion → Markdown',
    short: 'Notion → MD',
    title: 'Exportación de Notion a Markdown',
    blurb:
      'Sube el .zip de "Export as Markdown & CSV" de Notion y obtén cada página como un documento propio, en carpetas anidadas como en Notion; las bases de datos como tablas. O todo en un solo documento.',
    hint: 'Sube el .zip que exporta Notion. Cada página se vuelve una sección con su propio encabezado, en el orden original; una base de datos se vuelve una tabla.',
    seo: {
      title: 'Convertir exportación de Notion a Markdown — TransformPipe',
      description:
        'Convierte un .zip de "Export as Markdown & CSV" de Notion en un documento Markdown, páginas en orden con índice. Convierte en tu navegador; nada se sube.',
    },
  },
  'confluence-to-markdown': {
    label: 'Confluence → Markdown',
    short: 'Confluence → MD',
    title: 'Exportación de Confluence a Markdown',
    blurb:
      'Sube el .zip del "Export → HTML" de un espacio de Confluence y obtén cada página en su propio Markdown, en carpetas que siguen el árbol de páginas del espacio, con los enlaces entre páginas funcionando. O todo en un solo documento.',
    hint: 'Sube el .zip que produce la exportación de un espacio de Confluence. Cada página se vuelve una sección con su propio encabezado, en el orden original.',
    seo: {
      title: 'Convertir exportación de Confluence a Markdown — TransformPipe',
      description:
        'Convierte un .zip de exportación HTML de un espacio de Confluence en un documento Markdown, páginas en orden con índice. Convierte en tu navegador; nada se sube.',
    },
  },
  'obsidian-to-markdown': {
    label: 'Obsidian → Markdown',
    short: 'Obsidian → MD',
    title: 'Vault de Obsidian a Markdown',
    blurb:
      'Sube un vault de Obsidian comprimido y obtén cada nota como un documento propio, en las carpetas del vault, los wikilinks conservados como texto. O todo en un solo documento.',
    hint: 'Sube el .zip de la carpeta de un vault de Obsidian. Cada nota se vuelve una sección con su propio encabezado, en el orden original.',
    seo: {
      title: 'Convertir vault de Obsidian a Markdown — TransformPipe',
      description:
        'Convierte un vault de Obsidian comprimido en un documento Markdown, notas en orden con índice, wikilinks conservados como texto. Convierte en tu navegador; nada se sube.',
    },
  },
  'text-to-markdown': {
    label: 'Texto plano → Markdown',
    short: 'TXT → MD',
    title: 'Texto plano a Markdown',
    blurb:
      'Sube un archivo .txt que nunca fue pensado como Markdown, y obtén Markdown que dice exactamente lo mismo — un asterisco o un guion bajo suelto no se convierte en énfasis.',
    hint: 'Sube un archivo .txt. Los propios caracteres de Markdown — *, _, #, un guion al inicio — se escapan para que el texto se muestre tal cual se escribió.',
    seo: {
      title: 'Convertir texto plano a Markdown — TransformPipe',
      description:
        'Convierte texto plano en Markdown sin que sus propios caracteres se interpreten como formato — asteriscos, guiones bajos y saltos de línea se conservan. Convierte en tu navegador; nada se sube.',
    },
  },
  'powerpoint-to-markdown': {
    label: 'PowerPoint → Markdown',
    short: 'PPTX → MD',
    title: 'PowerPoint a Markdown',
    blurb:
      'Sube un .pptx y obtén una sección por diapositiva, en el orden en que se presentan — con las notas del orador, que son la mitad de una presentación que nadie llega a leer fuera de la sala.',
    hint: 'Sube un .pptx. Cada diapositiva pasa a ser una sección con su propio título, las viñetas siguen siendo viñetas y las tablas, tablas; las notas acompañan a cada una.',
    seo: {
      title: 'Convertir PowerPoint a Markdown — TransformPipe',
      description:
        'Convierte un .pptx de PowerPoint en Markdown: una sección por diapositiva, con viñetas, tablas y las notas del orador. Convierte en tu navegador; nada se sube.',
    },
  },
  'epub-to-markdown': {
    label: 'EPUB → Markdown',
    short: 'EPUB → MD',
    title: 'Un libro EPUB a Markdown',
    blurb:
      'Sube un .epub y obtén el libro entero en un documento: los capítulos en el orden en que se leen, con los títulos del índice y las imágenes dentro.',
    hint: 'Sube un .epub. El orden de lectura sale de la propia spine del libro y no de los nombres de archivo; cada capítulo pasa a ser una sección.',
    seo: {
      title: 'Convertir EPUB a Markdown — TransformPipe',
      description:
        'Convierte un libro EPUB en un documento Markdown: capítulos en orden de lectura, índice conservado e imágenes incluidas. Convierte en tu navegador; nada se sube.',
    },
  },
  'odt-to-markdown': {
    label: 'ODT → Markdown',
    short: 'ODT → MD',
    title: 'Un archivo OpenDocument a Markdown',
    blurb:
      'Sube un .odt — el formato de LibreOffice, de OpenOffice y de una descarga de Google Docs — y obtén Markdown con sus encabezados, listas, tablas, notas al pie e imágenes.',
    hint: 'Sube un .odt. Este formato declara sus propios niveles de encabezado, así que no se adivina nada: las listas conservan su anidamiento, las tablas siguen siendo tablas y las notas, notas.',
    seo: {
      title: 'Convertir ODT a Markdown — TransformPipe',
      description:
        'Convierte un .odt de LibreOffice u OpenDocument en Markdown con encabezados, listas, tablas, notas e imágenes. Convierte en tu navegador; nada se sube.',
    },
  },
  'rtf-to-markdown': {
    label: 'Texto RTF → Markdown',
    short: 'RTF → MD',
    title: 'Texto enriquecido a Markdown',
    blurb:
      'Sube un .rtf — lo que escriben TextEdit, WordPad y casi todo cuando arrastras texto fuera de ellos — y obtén Markdown en lugar de un muro de palabras de control.',
    hint: 'Sube un .rtf. Negrita, cursiva, enlaces, listas y tablas pasan; un encabezado se lee del nivel de esquema donde alguien lo puso, y del tamaño de letra donde nadie lo hizo.',
    seo: {
      title: 'Convertir RTF a Markdown — TransformPipe',
      description:
        'Convierte un archivo .rtf en Markdown: negrita, cursiva, enlaces, listas y tablas conservados, y encabezados recuperados. Convierte en tu navegador; nada se sube.',
    },
  },
  'evernote-to-markdown': {
    label: 'Evernote → Markdown',
    short: 'ENEX → MD',
    title: 'Una exportación de Evernote a Markdown',
    blurb:
      'Sube un .enex y obtén cada nota como una sección de un solo documento — con sus etiquetas, su fecha, sus casillas y sus imágenes.',
    hint: 'Sube un .enex de Archivo, Exportar notas. Las etiquetas van bajo el título de cada nota, las casillas pasan a ser una lista de tareas, y una imagen se empareja con su nota por el hash con el que el formato las enlaza.',
    seo: {
      title: 'Convertir ENEX de Evernote a Markdown — TransformPipe',
      description:
        'Convierte una exportación .enex de Evernote en un documento Markdown: cada nota una sección, con etiquetas, fechas, casillas e imágenes. Convierte en tu navegador.',
    },
  },
  'excel-to-markdown': {
    label: 'Excel → tabla Markdown',
    short: 'XLSX → MD',
    title: 'Excel a una tabla Markdown',
    blurb:
      'Sube un .xlsx y obtén una tabla Markdown por cada hoja con filas — si hay más de una, se añade un índice.',
    hint: 'Sube un libro .xlsx. La primera fila de cada hoja se vuelve el encabezado de la tabla; las fechas salen como fechas ISO simples en lugar de los números de serie propios de Excel.',
    seo: {
      title: 'Convertir Excel a tabla Markdown — TransformPipe',
      description:
        'Convierte un libro Excel .xlsx en tablas Markdown, una por hoja con índice. Convierte en tu navegador; nada se sube.',
    },
  },
  'markdown-to-confluence': {
    label: 'Markdown → Confluence',
    short: 'MD → Confluence',
    title: 'Markdown a Confluence',
    blurb:
      'Sube un archivo Markdown y obtén el formato de almacenamiento de Confluence: bloques de código como macro de código, alertas como paneles de información y advertencia, listas de tareas con casillas reales y enlaces que saltan a su encabezado.',
    hint: 'Sube un archivo .md. «Copiar para Confluence» pega con formato en el editor de Cloud y como formato de almacenamiento en un editor de código fuente o en la API REST.',
    seo: {
      title: 'Convertir Markdown a formato de almacenamiento de Confluence — TransformPipe',
      description:
        'Convierte Markdown al formato de almacenamiento de Confluence: macros de código, paneles de información y aviso, tareas y enlaces a encabezados. En el navegador.',
    },
  },
  'markdown-to-jira': {
    label: 'Markdown → Jira',
    short: 'MD → Jira',
    title: 'Markdown a marcado wiki de Jira',
    blurb:
      'Sube un archivo Markdown y obtén el marcado wiki de Jira: encabezados h2., *negrita*, bloques {code} con su lenguaje, ||tablas|| y paneles para las alertas, escapado para que nada se convierta en formato por accidente.',
    hint: 'Sube un archivo .md. El marcado va al modo texto de Jira, a una llamada REST v2 o a una regla de automatización; «Copiar para Jira» también pega con formato en Jira Cloud.',
    seo: {
      title: 'Convertir Markdown a marcado wiki de Jira — TransformPipe',
      description:
        'Convierte Markdown a marcado wiki de Jira: encabezados, negrita, bloques de código con lenguaje, tablas y paneles, bien escapados. En tu navegador, sin subir nada.',
    },
  },
  'markdown-to-slack': {
    label: 'Markdown → Slack',
    short: 'MD → Slack',
    title: 'Markdown a mrkdwn de Slack',
    blurb:
      'Sube un archivo Markdown y obtén el mrkdwn de Slack: negrita con un asterisco, <enlaces|con palabras>, viñetas por nivel y tablas como bloques de código alineados, listo para un bot, un webhook o un flujo de trabajo.',
    hint: 'Sube un archivo .md. El mrkdwn es lo que envía una llamada a la API o un webhook; «Copiar para Slack» también pega con formato en el cuadro de mensaje de Slack.',
    seo: {
      title: 'Convertir Markdown a mrkdwn de Slack — TransformPipe',
      description:
        'Convierte Markdown a mrkdwn de Slack para bots, webhooks y flujos: negrita, enlaces, listas y tablas como bloques de código. En tu navegador, sin subir nada.',
    },
  },
  'markdown-to-epub': {
    label: 'Markdown → EPUB',
    short: 'MD → EPUB',
    title: 'Markdown a un libro EPUB',
    blurb:
      'Sube un archivo Markdown y obtén un .epub que abre cualquier lector electrónico: un capítulo por encabezado principal, un índice, y las imágenes, fórmulas y diagramas dentro del libro.',
    hint: 'Sube un archivo .md. Los capítulos se cortan en los encabezados que se repiten; una imagen incrustada en el documento viaja dentro del libro.',
    seo: {
      title: 'Convertir Markdown a EPUB — TransformPipe',
      description:
        'Convierte un archivo Markdown en un libro EPUB 3: capítulos a partir de los encabezados, índice, imágenes, fórmulas y diagramas incluidos. Hecho en tu navegador.',
    },
  },
  'markdown-to-word': {
    label: 'Markdown → Word',
    short: 'MD → Word',
    title: 'Markdown a un documento de Word',
    blurb:
      'Sube un archivo Markdown y obtén un .docx hecho con las piezas de Word: estilos de título que lista el panel de navegación, listas numeradas y con viñetas de verdad, notas al pie de página y tablas que un usuario de Word puede seguir editando.',
    hint: 'Sube un archivo .md. Los encabezados pasan a ser Título 1 a 6, así que un índice y una plantilla de la casa funcionan sobre él de inmediato.',
    seo: {
      title: 'Convertir Markdown a Word (.docx) — TransformPipe',
      description:
        'Convierte Markdown en un .docx de Word con estilos de título reales, listas numeradas, notas al pie, tablas e imágenes: editable, no HTML convertido.',
    },
  },
};
