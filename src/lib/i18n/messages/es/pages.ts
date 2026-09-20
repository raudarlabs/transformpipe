import type { Content } from '../../content';

/*
 * Las palabras de las cinco páginas que solo son palabras: about, contact y las tres legales.
 *
 * `src/lib/pages.ts` guarda lo que una página *es* —su id, su dirección y la fecha que declaran
 * las tres legales— y este archivo guarda lo que una página *dice*. La misma razón por la que el
 * reparto existe en todo lo demás: una ruta es igual en cinco lenguas y un párrafo no.
 *
 * Con la clave de `StaticPageId`, así que una página añadida a la unión sin sus palabras rompe la
 * compilación en vez de renderizar una pantalla en blanco.
 *
 * Las tres legales son política. Aquí están traducidas y no reescritas: ni un párrafo más, ni un
 * párrafo menos, ni una excepción que el inglés no haga.
 */

export const pages: Content['pages'] = {
  about: {
    label: 'Acerca de',
    title: 'Acerca de TransformPipe',
    lede: 'Un conversor que hace el trabajo en tu navegador y no se pone en medio.',
    sections: [
      {
        heading: 'Qué es',
        body: [
          'TransformPipe convierte documentos en otros documentos. Markdown en una página HTML terminada, y HTML, archivos de Word, hojas de cálculo y JSON en Markdown. Suelta un archivo, mira en qué se ha convertido y llévatelo como Markdown, HTML, texto plano o PDF.',
          'Todo se normaliza a Markdown, porque Markdown es un formato que se puede leer, comparar y conservar veinte años sin tener el programa que lo hizo.',
        ],
      },
      {
        heading: 'Por qué funciona así',
        body: [
          'La conversión ocurre en tu navegador. Sin la sesión iniciada no se envía ningún archivo a ningún sitio — no hay una subida en la que confiar, porque no hay subida. Inicia sesión y el Markdown se guarda en tu cuenta para que un documento te siga a otra máquina, y sigue siendo privado hasta que lo compartas.',
          'El HTML exportado es un solo archivo con los estilos incrustados. No le pide nada a la red, lo que significa que dentro de cinco años se abrirá en un portátil sin conexión igual que hoy.',
        ],
      },
      {
        heading: 'Más allá de la aplicación',
        body: [
          'Las mismas conversiones están al alcance desde un terminal, desde un pull request y desde un asistente: hay una API pública, un cliente de línea de comandos sin dependencias, una GitHub Action que publica el Markdown que ha cambiado un pull request y un servidor MCP para que un modelo pueda convertir y compartir documentos en tu nombre. La documentación lo cubre todo.',
        ],
      },
      {
        heading: 'Quién lo hace',
        body: [
          'TransformPipe está hecho por Raudar Labs.',
        ],
      },
    ],
    seo: {
      title: 'Acerca de TransformPipe',
      description:
        'TransformPipe convierte documentos a Markdown y de vuelta — diez formatos, en tu navegador, con API, CLI, GitHub Action y servidor MCP. Hecho por Raudar Labs.',
    },
  },
  support: {
    label: 'Soporte',
    title: 'Soporte',
    lede: 'Un fallo, un formato que te falta o algo que no debería estar publicado.',
    sections: [
      {
        heading: 'Un archivo que se convirtió mal',
        body: [
          'Es lo más útil que puedes enviar. Adjúntalo a la incidencia si puedes compartirlo, di qué esperabas en su lugar y nombra el navegador si en otro sitio salía bien. Una conversión que falla en un archivo suele fallar en una forma, y el archivo es como llegamos a esa forma.',
          'Un formato que todavía no convertimos es una petición que merece la pena. Varios de los que hay aquí empezaron así.',
        ],
      },
      {
        heading: 'Algo compartido que no debería estarlo',
        body: [
          'Cada documento compartido lleva un enlace «Report this document» al pie de la página que abre. Es la vía más rápida: identifica el documento sin que tengas que describirlo y no necesita cuenta.',
        ],
      },
      {
        heading: 'Privacidad y cuestiones legales',
        body: [
          'Las preguntas sobre qué se guarda, o la petición de borrar una cuenta y todo lo que contiene, van a las mismas incidencias. Con la sesión iniciada también puedes borrar cualquier documento tú mismo: eso elimina la fila y la fuente guardada a la vez.',
        ],
      },
    ],
    seo: {
      title: 'Soporte — TransformPipe',
      description:
        'Informa de un fallo, pide un formato, señala un documento compartido o pregunta qué se guarda y haz que se borre. Una incidencia en dos campos.',
    },
  },
  extension: {
    label: 'Extensión del navegador',
    title: 'La extensión del navegador',
    lede: 'La página en la que estás, en Markdown, sin salir de ella.',
    sections: [
      {
        heading: 'Un clic y la página es un documento',
        body: [
          'Pulsa el botón de la barra de herramientas: la extensión lee la página que estás viendo, saca el artículo de entre la navegación y los avisos de cookies, convierte en absoluta cada dirección de enlace e imagen y devuelve Markdown. Cópialo, descárgalo o guarda la página como un archivo `.html` autónomo, con su diseño y sus imágenes dentro del archivo y sin una sola petición.',
        ],
      },
      {
        heading: 'Las páginas que no tienen exportación',
        body: [
          'Documentación, un wiki, un ticket, un hilo: cualquier cosa que solo existe renderizada. Lee lo que tu navegador ya tiene en pantalla, así que una página que solo ves tú se convierte sin que nadie entregue una contraseña: Confluence, Jira y Notion no necesitan administrador, ni exportación, ni token de API.',
        ],
      },
      {
        heading: 'Dos maneras de tenerla abierta',
        body: [
          'El botón abre un panel compacto sobre la página. El panel lateral es lo mismo mantenido abierto al lado: te sigue de pestaña en pestaña y convierte cada página según llegas, que es lo que quieres cuando recorres un conjunto de ellas en lugar de convertir una. El menú contextual convierte una selección.',
        ],
      },
      {
        heading: 'También archivos, sin subirlos',
        body: [
          'Las mismas diez conversiones del sitio —Word, PDF, hojas de cálculo, HTML, CSV, JSON, EPUB y las demás— se ejecutan dentro de la extensión. Nada se sube y nada necesita conexión, y varios archivos elegidos a la vez se convierten en un solo documento, en el orden en que los elegiste.',
        ],
      },
      {
        heading: 'Lo que no hace',
        body: [
          'Los permisos que pide son el conjunto más pequeño que hace el trabajo, y el mayor de ellos es opcional:',
        ],
        items: [
          'Sin sesión iniciada no habla con nosotros en absoluto. La conversión ocurre en la página, en tu equipo.',
          'No lleva analítica, ni telemetría, ni registro de qué páginas has convertido.',
          'Solo lee una página cuando pulsas su botón o abres el panel lateral sobre ella, y nunca escribe en la página.',
          'Leer la pestaña actual se concede al activar el panel lateral; negarlo te cuesta el panel y nada más.',
        ],
      },
      {
        heading: 'Con una cuenta',
        body: [
          'Inicia sesión —la misma cuenta que el sitio, un clic, ninguna clave que pegar— y Guardar deja el documento donde están los demás. Compartir publica un enlace, o nombra a las personas que pueden leerlo; se les avisa por correo y lo leen con su propia sesión iniciada.',
        ],
      },
      {
        heading: 'Instalarla',
        body: [
          'Chrome la toma de la Chrome Web Store, y los navegadores construidos sobre Chromium también: Edge, Brave, Opera, Arc. Al instalarse no pide ningún permiso de sitio —hasta que conectas una cuenta no tiene motivo para hablar con nosotros— y el panel lateral pide lo que necesita en el momento en que lo activas.',
        ],
      },
    ],
    action: 'Añadirla a Chrome',
    seo: {
      title: 'Extensión del navegador — TransformPipe',
      description:
        'Convierte en un clic a Markdown la página en la que estás, o un archivo de tu equipo: en tu navegador, sin conexión y sin cuenta.',
    },
  },
  privacy: {
    label: 'Privacidad',
    title: 'Privacidad',
    lede: 'Qué se guarda, dónde, y qué no se recoge en absoluto.',
    sections: [
      {
        heading: 'Sin la sesión iniciada, no nos llega nada',
        body: [
          'Convertir ocurre en tu navegador. El archivo se lee, se convierte y se muestra en tu propia máquina, y no se envía ninguna parte de él a un servidor. El historial que ves es el almacenamiento del propio navegador, no una cuenta.',
        ],
      },
      {
        heading: 'Con la sesión iniciada, esto y nada más',
        body: [
          'Una cuenta existe para que los documentos puedan seguirte entre dispositivos y compartirse. Contiene:',
        ],
        items: [
          'Tu identidad, a través de nuestro proveedor de autenticación: una dirección de correo, un nombre cuando se ha dado uno y un identificador de cuenta. Al entrar con Google vienen de Google; al registrarte con una dirección y una contraseña, la contraseña queda en el proveedor de autenticación, como hash. En ninguno de los dos casos vemos ni guardamos una contraseña.',
          'De cada documento que conservas: su nombre, qué conversión lo hizo, su tamaño, los recuentos de palabras, encabezados, enlaces, bloques de código, tablas e imágenes, y cuándo se creó.',
          'El Markdown en sí, en un almacén de blobs privado — privado quiere decir que no tiene ninguna URL pública y solo se lee mediante una petición que autorizamos.',
          'Las claves API como hashes, nunca la clave. Una clave se muestra una vez, al crearla, y después no se puede recuperar — ni tú ni nosotros.',
          'Los ajustes de compartición: si un documento es privado, abierto por enlace o dirigido a direcciones de correo concretas, y el token que lleva un enlace.',
        ],
      },
      {
        heading: 'La extensión del navegador',
        body: [
          'La extensión convierte la página en la que estás, dentro de esa página y en tu propio equipo. Solo lee una página después de que pulses su botón o abras el panel lateral sobre ella, nunca escribe en la página, y nada de ella sale a ninguna parte hasta que pulsas Guardar o Compartir: sin sesión iniciada no habla con nosotros en absoluto.',
        ],
        items: [
          'De tu navegación no se recoge nada. La extensión no lleva analítica ni telemetría, y en ningún sitio queda registro de qué páginas has convertido.',
          'Con sesión iniciada, un token de OAuth queda en el almacenamiento de extensiones del navegador: la misma autorización que aparece en tu página de cuenta y que allí se revoca. Es la única credencial que guarda la extensión, y no contiene ninguna contraseña.',
          'Un documento convertido pasa del panel a la pestaña que lo muestra a través del almacenamiento de sesión, que el navegador vacía al cerrarse y nunca escribe en disco.',
          'Leer la pestaña en la que estás se pide cuando activas el panel lateral, porque un panel que te sigue de pestaña en pestaña no puede volver a preguntar en cada una. El botón de la barra de herramientas no lo necesita: lee la única pestaña en la que lo pulsaste.',
          'Guardar y Compartir envían ese único documento a tu cuenta, igual que la aplicación. Nada más sale del navegador.',
        ],
      },
      {
        heading: 'Lo que no hacemos',
        body: [
          'No hay publicidad, ni píxel de seguimiento, y nada se vende. Se carga un único script de terceros — Google Tag Manager — y solo trae Google Analytics si lo permitiste en el aviso de cookies; si lo rechazas o no respondes, las etiquetas de Google no escriben nada en tu navegador. Nada se comparte con nadie salvo con la infraestructura que hace funcionar el servicio: la base de datos, el almacén de blobs, el proveedor de autenticación, el proveedor de correo y el alojamiento.',
          'Nosotros no leemos tus documentos, y no se usan para entrenar nada.',
        ],
      },
      {
        heading: 'El correo electrónico',
        body: [
          'Se envía correo en cuatro casos y en ninguno más: para confirmar tu dirección, para restablecer una contraseña, para darte la bienvenida una vez tras el registro y para avisar a alguien de que se ha compartido un documento con él. Los dos primeros los envía el proveedor de autenticación; los otros dos, el proveedor de correo. No hay boletín, y no hay nada de lo que darse de baja.',
          'Al proveedor de correo se le da la dirección de quien recibe el mensaje, la de quien comparte cuando la hay, y el mensaje mismo. Nunca se le da un documento.',
        ],
      },
      {
        heading: 'Cookies y almacenamiento del navegador',
        body: [
          'Una cookie de sesión, que pone nuestro proveedor de autenticación cuando inicias sesión, propia y HttpOnly. Existe otra de vida corta durante el ida y vuelta del inicio de sesión, que caduca en diez minutos. Esas son todas — no hay nada opcional que desactivar. La página de cookies tiene el detalle.',
          'Tu tema y, sin la sesión iniciada, tu historial viven en el almacenamiento local de tu navegador. Nunca salen de ahí.',
        ],
      },
      {
        heading: 'Eliminar cosas',
        body: [
          'Eliminar un documento elimina la fila y el Markdown guardado a la vez, en el momento y no según un calendario. Revocar una compartición descarta el token, así que un enlace ya enviado deja de funcionar.',
          'Para eliminar una cuenta y todo lo que contiene, pídelo — mira la página de soporte. Llegar a un límite de almacenamiento rechaza la escritura; nunca elimina algo que decidiste conservar para hacer sitio.',
        ],
      },
      {
        heading: 'Menores',
        body: [
          'Esto es una herramienta de trabajo, no un servicio para niños, y no está dirigido a nadie menor de 16 años.',
        ],
      },
      {
        heading: 'Cambios',
        body: [
          'Si esta página cambia de una forma que afecte a lo que se recoge, la fecha de arriba cambia con ella.',
        ],
      },
    ],
    seo: {
      title: 'Privacidad — TransformPipe',
      description:
        'Sin sesión iniciada, ningún archivo sale de tu navegador. Con sesión guardamos el documento, sus metadatos y tu identidad de cuenta: analítica solo si la permites, sin píxeles de seguimiento y sin vender nada.',
    },
  },
  terms: {
    label: 'Términos',
    title: 'Términos de uso',
    lede: 'La versión corta, porque una larga no se leería.',
    sections: [
      {
        heading: 'Usar el servicio',
        body: [
          'TransformPipe se ofrece gratis, tal cual está. Úsalo para cualquier cosa que tengas derecho a convertir, desde la aplicación, la API, la línea de comandos o un asistente.',
          'Una cuenta es tuya para conservarla o eliminarla. Eres responsable de lo que hagas con una clave API, así que trátala como una contraseña: cualquiera que la tenga puede leer y escribir tus documentos.',
        ],
      },
      {
        heading: 'Tus documentos siguen siendo tuyos',
        body: [
          'Conservas todos los derechos que tenías sobre un documento antes de convertirlo. No reclamamos ninguna propiedad ni ninguna licencia más allá de lo que exige hacer funcionar el servicio: guardarlo para que puedas volver a abrirlo y servirlo a las personas con las que lo hayas compartido deliberadamente.',
        ],
      },
      {
        heading: 'Qué no poner aquí',
        body: [
          'No uses el servicio para contenido ilícito, que no tengas derecho a distribuir o que exista para hacer daño a alguien: malware, material que explote sexualmente a menores, acoso dirigido. No uses un enlace compartido para montar una página de phishing.',
          'Cualquiera que abra un documento compartido puede denunciarlo. Un documento que incumpla esta sección puede dejar de publicarse o eliminarse, y una cuenta reincidente cerrarse.',
        ],
      },
      {
        heading: 'Límites y disponibilidad',
        body: [
          'Se aplican límites de ritmo y de almacenamiento, publicados en la documentación. Existen para mantener el servicio en pie y pueden cambiar.',
          'No hay ninguna promesa de disponibilidad. El servicio puede interrumpirse, y las funciones pueden cambiar o retirarse. Guarda tu propia copia de todo lo que no puedas perder — la descarga existe exactamente para eso, y no necesita nada nuestro para abrirse.',
        ],
      },
      {
        heading: 'Sin garantía, y el límite de lo que debemos',
        body: [
          'El servicio se presta sin garantía de ningún tipo, expresa o implícita. En la mayor medida que permita la ley, Raudar Labs no responde por la pérdida de datos, por el lucro cesante ni por ningún daño indirecto o consecuente derivado de su uso.',
          'Nada de lo que aquí se dice limita un derecho que tengas y que no pueda limitarse por acuerdo.',
        ],
      },
      {
        heading: 'Cambios y fin',
        body: [
          'Estos términos pueden cambiar; la fecha de arriba dice cuándo lo hicieron por última vez, y seguir usando el servicio es la forma de aceptarlos. Puedes dejarlo en cualquier momento eliminando tus documentos y tu cuenta.',
        ],
      },
    ],
    seo: {
      title: 'Términos de uso — TransformPipe',
      description:
        'TransformPipe es gratis y se ofrece tal cual está. Tus documentos siguen siendo tuyos, los límites están publicados y no hay ninguna garantía.',
    },
  },
  cookies: {
    label: 'Cookies',
    title: 'Cookies',
    lede: 'Dos son necesarias para iniciar sesión. Una cosa es opcional — la analítica — y está desactivada hasta que la permitas.',
    sections: [
      {
        heading: 'Lo único que eliges',
        body: [
          'La mayoría de las páginas de cookies existen para que puedas rechazar la analítica y la publicidad. Aquí no hay publicidad ninguna. La analítica es Google Analytics, cargado mediante Google Tag Manager, y es el único interruptor del sitio: el aviso pregunta en la primera visita, el botón al pie de esta página reabre la respuesta, y hasta que la permitas las etiquetas de Google no escriben nada en tu navegador y envían como mucho pings sin cookies.',
          'Sin la sesión iniciada, y con la analítica rechazada o sin responder, este sitio no pone ninguna cookie.',
        ],
      },
      {
        heading: 'Las dos que existen',
        body: [
          'Las dos las pone nuestro proveedor de autenticación, son propias y están marcadas como HttpOnly y Secure, de modo que ningún script de la página puede leerlas:',
        ],
        items: [
          '__Secure-neon-auth.session_token — mantiene la sesión iniciada. Sin ella, cada carga de página volvería a pedirte que inicies sesión. Desaparece al cerrar sesión.',
          '__Secure-neon-auth.session_challenge — existe durante los diez minutos del ida y vuelta del inicio de sesión, para que la respuesta de Google pueda emparejarse con la petición que la originó. Es lo que evita que el inicio de sesión de otra persona acabe en tu sesión.',
        ],
      },
      {
        heading: 'Almacenamiento del navegador, que no es una cookie',
        body: [
          'Dos cosas viven en el almacenamiento local de tu navegador y nunca se envían a ningún sitio: el tema que elegiste y —cuando no tienes la sesión iniciada— tus conversiones recientes, para que el historial tenga algo dentro. Borrar los datos del sitio en el navegador elimina las dos, y la aplicación sigue funcionando sin ellas.',
        ],
      },
      {
        heading: 'Si eso cambia',
        body: [
          'Si alguna vez se añade algo opcional, esta página tendrá un control de verdad antes de que se ponga, no después. La fecha de arriba dirá cuándo.',
        ],
      },
    ],
    seo: {
      title: 'Cookies — TransformPipe',
      description:
        'Dos cookies de sesión propias, las dos necesarias para iniciar sesión. Sin analítica, sin publicidad y sin nada opcional que configurar.',
    },
  },

  /*
   * Las páginas de «cómo abrir»: una por cada extensión que acepta la zona de arrastre.
   *
   * Responden en vez de argumentar, y eso es lo que las separa del blog. Alguien tiene un archivo y
   * ni idea de qué lo abre; ha buscado la extensión; quiere la respuesta en el primer párrafo y
   * abajo una salida del problema. Así que: qué es la cosa, qué la abre en cada clase de máquina,
   * qué sale mal, y la conversión que termina la pregunta.
   */
  'how-to-md': {
    label: 'Abrir un archivo .md',
    title: 'Cómo abrir un archivo .md',
    lede: 'Un archivo Markdown es texto plano. Todo lo que abre texto lo abre — la pregunta es qué hace que parezca un documento.',
    sections: [
      {
        heading: 'Qué es',
        body: [
          'Un archivo `.md` es un archivo de texto con unas cuantas convenciones dentro: una almohadilla para un encabezado, asteriscos para el énfasis, guiones para una lista. Nada en el archivo es binario y nada está comprimido, así que un editor de texto te enseña toda su verdad de inmediato.',
          'Por eso mismo parece inacabado. Las convenciones son instrucciones para un renderizador, y hasta que algo las procesa estás leyendo las instrucciones en vez del documento.',
        ],
      },
      {
        heading: 'En un ordenador',
        body: [
          'En Windows, Notepad lo abre y muestra el texto tal cual. En un Mac, TextEdit hace lo mismo, aunque puede que primero pida convertir el archivo — recházalo y seguirá siendo texto plano. En los dos, VS Code renderiza una vista previa en vivo junto al original, que es lo más cerca de la página terminada sin salir del editor.',
          'Arrastrar el archivo a una ventana del navegador no funciona como la gente espera: el navegador muestra el texto tal cual u ofrece descargarlo, porque ningún navegador renderiza Markdown por su cuenta.',
        ],
      },
      {
        heading: 'En un teléfono',
        body: [
          'La mayoría de los teléfonos no tienen ningún lector de Markdown instalado y ofrecerán abrir el archivo en una aplicación de notas o de archivos, que muestra el texto tal como está escrito. En iOS, Archivos lo previsualiza como texto plano; en Android, el comportamiento depende de qué editor de texto haya instalado.',
          'Convertirlo antes a HTML suele ser más rápido que buscar un lector, porque todos los teléfonos ya tienen un navegador y todos los navegadores abren HTML.',
        ],
      },
      {
        heading: 'Lo que suele salir mal',
        body: [
          'Un archivo guardado como `notes.md.txt` por un editor de texto que añadió su propia extensión no lo reconocerá nada que busque Markdown. Renómbralo y el problema desaparece.',
          'Las tablas, las notas al pie y las listas de tareas no están en la especificación original de Markdown, así que un lector que muestra las barras verticales y los corchetes de forma literal no está roto — implementa el núcleo y no las extensiones.',
        ],
      },
    ],
    action: 'Convertir un archivo .md a HTML',
    seo: {
      title: 'Cómo abrir un archivo .md — TransformPipe',
      description:
        'Qué es un archivo Markdown, qué lo abre en Windows, macOS y un teléfono, por qué el navegador muestra texto plano y cómo convertirlo en una página legible.',
    },
  },
  'how-to-html': {
    label: 'Abrir un archivo .html',
    title: 'Cómo abrir un archivo .html',
    lede: 'Todos los navegadores lo abren. La pregunta interesante es qué hacer cuando lo que quieres es el texto y no la página.',
    sections: [
      {
        heading: 'Qué es',
        body: [
          'Un archivo `.html` es la página misma: el texto, y el marcado que dice qué parte es un encabezado, un enlace, una tabla. También puede hacer referencia a estilos, imágenes y scripts que viven en otro sitio, y por eso una página guardada a veces se abre sin aspecto de nada.',
        ],
      },
      {
        heading: 'Abrirlo',
        body: [
          'Un doble clic lo abre en el navegador predeterminado en todos los sistemas de escritorio. Si se abre en un editor, haz clic con el botón derecho, elige «Abrir con» y luego un navegador.',
          'En un teléfono, un gestor de archivos suele pasárselo al navegador. Si se niega, enviarte el archivo por correo y abrir el adjunto funciona casi siempre, porque los clientes de correo entregan el HTML a una vista web.',
        ],
      },
      {
        heading: 'Cuando se abre en blanco o sin estilos',
        body: [
          'Una página guardada con «Guardar como, Página web, completa» conserva sus estilos y sus imágenes en una carpeta junto al archivo. Mueve el archivo sin la carpeta y la página lo pierde todo menos el texto.',
          'Una página guardada como un solo archivo lo lleva todo dentro y se abre igual en cualquier sitio. Por eso una exportación que merece la pena conservar es una autocontenida.',
        ],
      },
      {
        heading: 'Sacar el texto',
        body: [
          'Copiar desde el navegador te da las palabras y pierde la estructura: los encabezados se vuelven líneas corrientes y las tablas, chorros de texto. Convertir el archivo a Markdown conserva la estructura como algo que se puede leer y editar, que suele ser lo que la gente quería en realidad.',
        ],
      },
    ],
    action: 'Convertir un archivo .html a Markdown',
    seo: {
      title: 'Cómo abrir un archivo .html — TransformPipe',
      description:
        'Cómo abrir un archivo HTML en un ordenador o en un teléfono, por qué una página guardada pierde a veces sus estilos y cómo sacar el texto con su estructura.',
    },
  },
  'how-to-docx': {
    label: 'Abrir un archivo .docx',
    title: 'Cómo abrir un archivo .docx',
    lede: 'Un .docx es un archivo zip lleno de XML. Word lo abre, y también varias cosas que son gratis.',
    sections: [
      {
        heading: 'Qué es',
        body: [
          'Un `.docx` no es un único documento sino una carpeta comprimida: renómbralo a `.zip` y podrás abrirlo para encontrar dentro el texto, los estilos y las imágenes como archivos separados. Ese es el formato, y por eso un `.docx` no se puede leer de forma útil en un editor de texto.',
        ],
      },
      {
        heading: 'Sin comprar Word',
        body: [
          'Google Docs abre un `.docx` subiéndolo a Drive, LibreOffice Writer lo abre en cualquier sistema de escritorio y es gratis, y tanto Apple Pages como la versión web del propio Word de Microsoft abren uno sin licencia de pago.',
          'En un teléfono, la aplicación de Word abre archivos `.docx` para leerlos sin suscripción; editar es donde empieza el muro de pago.',
        ],
      },
      {
        heading: 'Cuando no se abre',
        body: [
          'Un archivo que llega como `document.docx` pero se niega a abrirse en nada suele ser un `.doc` — el formato antiguo — con la extensión equivocada, o un archivo cuya descarga no terminó. Mira primero el tamaño: una descarga truncada suele ser demasiado pequeña de forma evidente.',
          'Un `.docx` protegido con contraseña abrirá el cuadro de diálogo y nada más. Ningún conversor puede pasar de ahí, y eso es una propiedad del archivo y no una limitación de la herramienta.',
        ],
      },
      {
        heading: 'Conservar las palabras, soltar el diseño',
        body: [
          'Convertir a Markdown conserva los encabezados, las listas, los enlaces y las tablas, y tira las fuentes, los márgenes y los saltos de página. Para un texto que tiene que vivir en un repositorio, en un wiki o en un diff, ese cambio es justo el objetivo y no una pérdida.',
        ],
      },
    ],
    action: 'Convertir un archivo .docx a Markdown',
    seo: {
      title: 'Cómo abrir un archivo .docx — TransformPipe',
      description:
        'Qué es en realidad un .docx, cómo abrir uno sin comprar Word, qué hacer cuando se niega a abrirse y cómo quedarte con el texto y soltar el diseño.',
    },
  },
  'how-to-csv': {
    label: 'Abrir un archivo .csv',
    title: 'Cómo abrir un archivo .csv',
    lede: 'Una hoja de cálculo lo abre, un editor de texto te enseña lo que hay de verdad dentro, y la diferencia importa más de lo que parece.',
    sections: [
      {
        heading: 'Qué es',
        body: [
          'Un `.csv` son filas de texto con un separador entre los campos — normalmente una coma, a veces un punto y coma o un tabulador. No hay tipos, ni fórmulas, ni formato: cada valor es una cadena, y todo lo que parece una fecha o un número es una suposición de tu programa.',
        ],
      },
      {
        heading: 'Abrirlo',
        body: [
          'Un doble clic lo abre en Excel o en Numbers en la mayoría de las máquinas, y en LibreOffice Calc si está instalado. Google Sheets importa uno con «Archivo, Importar».',
          'Abrirlo primero en un editor de texto vale esos diez segundos: enseña el separador real, si la primera fila es una cabecera y si los campos están entrecomillados — tres cosas que una hoja de cálculo decide por ti en silencio.',
        ],
      },
      {
        heading: 'Cuando las columnas salen mal',
        body: [
          'Que todo caiga en una sola columna significa que el separador que usa tu archivo no es el que esperaba tu hoja de cálculo. En Excel, usa «Datos, Desde texto/CSV» en vez del doble clic, y pon tú mismo el delimitador.',
          'Que los caracteres acentuados salgan como disparates es un desajuste de codificación: el archivo es UTF-8 y el programa supuso otra cosa. El mismo cuadro de importación te deja decirlo.',
          'Los ceros a la izquierda que desaparecen de códigos postales o números de pieza no se recuperan después — la hoja de cálculo convirtió el valor en un número al abrirlo. Importa esa columna como texto en su lugar.',
        ],
      },
      {
        heading: 'Ponerlo en un documento',
        body: [
          'Pegar un rango de una hoja de cálculo en un documento te da o una imagen de una tabla o un desastre, según dónde lo pegues. Convertir el archivo en una tabla de Markdown te da filas que sobreviven a una copia, a un diff y a un pull request.',
        ],
      },
    ],
    action: 'Convertir un archivo .csv en una tabla de Markdown',
    seo: {
      title: 'Cómo abrir un archivo .csv — TransformPipe',
      description:
        'Cómo abrir un CSV, por qué las columnas a veces se juntan en una sola, qué rompe los ceros a la izquierda y los acentos, y cómo convertirlo en una tabla.',
    },
  },
  'how-to-json': {
    label: 'Abrir un archivo .json',
    title: 'Cómo abrir un archivo .json',
    lede: 'Es texto, así que lo abre todo. Leerlo es la parte que necesita ayuda.',
    sections: [
      {
        heading: 'Qué es',
        body: [
          'Un archivo `.json` guarda datos estructurados: objetos con campos con nombre, listas de cosas, números y cadenas. Es el formato en el que responde una API y al que la mayoría de las aplicaciones exportan sus ajustes, y por eso aparece uno en la carpeta de descargas sin explicación.',
        ],
      },
      {
        heading: 'Abrirlo',
        body: [
          'Arrastrarlo a una ventana del navegador funciona bien: Firefox y Chrome muestran los dos una vista plegable en la que se puede buscar, en vez del texto tal cual. VS Code lo abre con plegado y reformatea con una sola orden un archivo escrito en una única línea.',
          'Una exportación muy grande — decenas de megabytes — hará sufrir a un editor. Una herramienta de línea de comandos como `jq` lee esas sin cargar el archivo entero en una ventana.',
        ],
      },
      {
        heading: 'Cuando no se puede analizar',
        body: [
          'Los tres fallos habituales son una coma sobrante después del último elemento, comillas simples donde el formato exige dobles, y un comentario — JSON no tiene comentarios, tuviera el aspecto que tuviera el archivo del que salió.',
          'Un error que nombra una línea y una columna merece confianza: el analizador se detuvo exactamente ahí, y el fallo suele estar un carácter antes.',
        ],
      },
      {
        heading: 'Hacerlo legible para una persona',
        body: [
          'Una vista plegable sirve para inspeccionar datos. Cuando lo que se busca es enseñárselo a alguien, convertirlo a Markdown vuelve tabla una lista de registros y secciones con encabezado los objetos anidados — la misma información, con una forma que sobrevive a pegarla en un documento.',
        ],
      },
    ],
    action: 'Convertir un archivo .json a Markdown',
    seo: {
      title: 'Cómo abrir un archivo .json — TransformPipe',
      description:
        'Cómo abrir y leer un archivo JSON en un navegador o en un editor, las tres cosas que suelen romper el análisis y cómo convertirlo en algo legible.',
    },
  },
  'how-to-txt': {
    label: 'Abrir un archivo .txt',
    title: 'Cómo abrir un archivo .txt',
    lede: 'Nada se abre con más facilidad. Los problemas empiezan cuando el texto se escribió en otra clase de máquina.',
    sections: [
      {
        heading: 'Qué es',
        body: [
          'Un archivo `.txt` son caracteres y saltos de línea, sin nada que describa qué aspecto debe tener. Esa es su virtud: se abre en todos los sistemas que se han hecho jamás y seguirá abriéndose dentro de treinta años.',
        ],
      },
      {
        heading: 'Abrirlo',
        body: [
          'Todos los sistemas operativos tienen un editor que lo abre con un doble clic — Notepad, TextEdit, gedit. Un navegador abre uno que se suelte sobre su ventana. Un teléfono lo previsualiza en su aplicación de archivos.',
        ],
      },
      {
        heading: 'Cuando se abre como una sola línea larga, o como cuadraditos',
        body: [
          'El texto escrito en Windows termina sus líneas con dos caracteres y el escrito en Unix con uno. Los editores antiguos que esperan la otra convención muestran el archivo como una única línea corrida, o dibujan un cuadradito en cada salto. Cualquier editor moderno maneja los dos; Notepad desde 2018.',
          'Caracteres sin sentido donde deberían ir acentos o comillas es un desajuste de codificación — el archivo es UTF-8 y el editor supuso una codificación antigua de un solo byte. La mayoría de los editores dejan volver a abrirlo con una codificación que tú indiques.',
        ],
      },
      {
        heading: 'Cuando tiene que volverse un documento',
        body: [
          'Tratar el texto plano como Markdown parece que funciona hasta que una línea que empieza por un guion se vuelve una viñeta, un asterisco en mitad de una frase pone medio párrafo en cursiva y un año al principio de una línea se convierte en una lista numerada. Convertirlo como es debido escapa antes esos caracteres, así que lo que decía el archivo es lo que dice la página.',
        ],
      },
    ],
    action: 'Convertir un archivo .txt a Markdown',
    seo: {
      title: 'Cómo abrir un archivo .txt — TransformPipe',
      description:
        'Cómo abrir un archivo de texto en cualquier sitio, por qué a veces sale como una línea larga o como cuadraditos y cómo volverlo documento sin formato añadido.',
    },
  },
  'how-to-xlsx': {
    label: 'Abrir un archivo .xlsx',
    title: 'Cómo abrir un archivo .xlsx',
    lede: 'Excel no es lo único que abre uno, y para leer una hoja rara vez es lo más rápido.',
    sections: [
      {
        heading: 'Qué es',
        body: [
          'Un `.xlsx` es un archivo zip lleno de XML, con la misma construcción que un `.docx`: las hojas, los estilos y las cadenas compartidas como archivos separados dentro de una carpeta comprimida. Guarda tipos, fórmulas, formato y varias hojas a la vez, que es todo lo que un CSV no puede.',
        ],
      },
      {
        heading: 'Sin comprar Excel',
        body: [
          'Google Sheets importa uno con «Archivo, Importar». LibreOffice Calc lo abre en cualquier sistema de escritorio y es gratis. Apple Numbers abre uno en un Mac, y la versión web del propio Excel de Microsoft lee uno sin licencia de pago.',
        ],
      },
      {
        heading: 'Qué comprobar antes de fiarse de los números',
        body: [
          'Una celda que muestra `####` es una columna demasiado estrecha para mostrar el valor, no un archivo roto. Una fecha que se lee como un número de cinco cifras es el valor de serie subyacente al que se le ha perdido el formato.',
          'Las fórmulas se guardan junto a su último resultado calculado. Un archivo abierto en algo que no las evalúa muestra esos resultados, que son correctos a fecha de cuando se guardó por última vez y no necesariamente ahora.',
        ],
      },
      {
        heading: 'Llevar una hoja a un documento',
        body: [
          'La vía habitual es exportar cada hoja a CSV y convertir eso, que pierde todo menos la hoja activa. Convertir el libro directamente te da una tabla de Markdown por hoja, con un índice cuando hay más de una.',
        ],
      },
    ],
    action: 'Convertir un archivo .xlsx en tablas de Markdown',
    seo: {
      title: 'Cómo abrir un archivo .xlsx — TransformPipe',
      description:
        'Cómo abrir un libro de Excel sin comprar Excel, qué significan de verdad #### y las fechas de cinco cifras, y cómo volver tabla de Markdown cada hoja.',
    },
  },
  'how-to-pptx': {
    label: 'Abrir un archivo .pptx',
    title: 'Cómo abrir un archivo .pptx',
    lede: 'Abrirlo es fácil. Leerlo sin haber asistido a la presentación es la parte en la que nada ayuda.',
    sections: [
      {
        heading: 'Qué es',
        body: [
          'Un `.pptx` es un archivo zip de XML, con la misma construcción que un `.docx` o un `.xlsx`: un archivo por diapositiva, uno por página de notas y las imágenes al lado. El antiguo `.ppt` es otra cosa — un formato binario anterior a 2007, que casi todo lo que abre un `.pptx` también sabe convertir.',
        ],
      },
      {
        heading: 'Sin comprar PowerPoint',
        body: [
          'Google Slides lo importa desde Archivo, Abrir. LibreOffice Impress lo abre en cualquier sistema de escritorio y es gratuito. Keynote lo abre en un Mac, y la versión web de PowerPoint lo lee sin licencia de pago.',
          'En un Mac, pulsar la barra espaciadora sobre el archivo en el Finder muestra todas las diapositivas sin abrir nada.',
        ],
      },
      {
        heading: 'Dónde están las notas del orador',
        body: [
          'Debajo de la diapositiva, en un panel que la mayoría de los programas ocultan de entrada: Ver y luego Notas, tanto en PowerPoint como en Google Slides. Ahí suele estar el razonamiento escrito en frases completas, mientras que la diapositiva de arriba es solo el resumen que alguien leyó en voz alta.',
          'Exportar a PDF las descarta salvo que se elija el diseño de páginas de notas, y por eso a una presentación que circula en PDF le falta tan a menudo la mitad que la explicaba.',
        ],
      },
      {
        heading: 'De la presentación al documento',
        body: [
          'Lo habitual es copiar a mano el texto de cada diapositiva, con lo que se pierden las notas porque no están en pantalla mientras se hace. Convertir el archivo directamente da una sección por diapositiva, en el orden en que se presentan, con viñetas, tablas y notas todavía unidas a la diapositiva de la que salieron.',
        ],
      },
    ],
    action: 'Convertir un .pptx a Markdown',
    seo: {
      title: 'Cómo abrir un archivo .pptx — TransformPipe',
      description:
        'Cómo abrir un archivo de PowerPoint sin PowerPoint, dónde se esconden las notas del orador y cómo convertir una presentación entera en un documento legible.',
    },
  },
  'how-to-zip': {
    label: 'Abrir un .zip de exportación',
    title: 'Cómo abrir un .zip exportado de Notion, Confluence u Obsidian',
    lede: 'Descomprimirlo es la mitad fácil. Lo que hay dentro es una carpeta de archivos que se apuntan unos a otros.',
    sections: [
      {
        heading: 'Qué hay dentro',
        body: [
          'Una exportación de Notion es un archivo Markdown por página, con un identificador largo añadido a cada nombre de archivo, más un CSV por cada base de datos. La exportación de un espacio de Confluence es un archivo HTML por página con sus adjuntos al lado. Una bóveda de Obsidian ya es Markdown, en las carpetas que hiciste tú.',
          'Las tres se descomprimen con las herramientas que ya tienes en la máquina: doble clic en Windows o macOS, `unzip` en un terminal.',
        ],
      },
      {
        heading: 'Por qué los enlaces están rotos',
        body: [
          'Notion escribe los enlaces contra el nombre de archivo exacto que generó, identificador incluido. Renombra los archivos a algo legible y todos los enlaces entre páginas dejan de resolverse, que es con diferencia la forma más común de que una migración salga mal.',
          'Los enlaces de Confluence apuntan a sus propios ids de página, y los adjuntos a una URL de descarga que espera que hayas iniciado sesión. Obsidian usa `[[wikilinks]]`, que solo resuelve su propia aplicación.',
        ],
      },
      {
        heading: 'Leerlo sin repararlo',
        body: [
          'Abrir cien archivos de uno en uno para averiguar qué contenía un espacio de trabajo es la forma equivocada de trabajar. Fusionar la exportación en un solo documento — cada página en orden, con un índice — te da algo legible de una sentada, que suele ser para lo que sirve una exportación archivada.',
        ],
      },
      {
        heading: 'Cuando sí necesitas los archivos por separado',
        body: [
          'Si las páginas tienen que seguir siendo archivos separados con enlaces que funcionen, el renombrado y la reescritura de los enlaces tienen que ocurrir a la vez, desde un único mapa de nombre antiguo a nombre nuevo. Hacerlo en dos pasadas deja una carpeta de documentos que apuntan todos a nombres que ya no existen.',
        ],
      },
    ],
    action: 'Convertir un .zip de exportación a Markdown',
    seo: {
      title: 'Cómo abrir un .zip exportado de Notion o Confluence — TransformPipe',
      description:
        'Qué hay dentro de una exportación de Notion, Confluence u Obsidian, por qué se rompen los enlaces entre páginas y cómo leerlo todo como un solo documento.',
    },
  },
  'how-to-assistant': {
    label: 'Compartir desde un asistente',
    title: 'Cómo convertir y compartir un documento desde un asistente de IA',
    lede: 'Un asistente escribe Markdown todo el día y no puede entregarte una página. Conectar este le deja hacer las dos cosas, sin que nadie copie texto de una pestaña a otra.',
    sections: [
      {
        heading: 'Qué es un conector',
        body: [
          'TransformPipe tiene un servidor MCP en `/api/mcp`. MCP es el protocolo con el que los asistentes llaman a herramientas, así que añadir la dirección como conector le da al asistente un juego de verbos que puede usar en tu nombre: convierte esto, guárdalo, compártelo, dime qué hay.',
          'No hay ninguna clave que pegar. Añadir el conector te lleva por un inicio de sesión normal, y el asistente queda autorizado sobre esa cuenta hasta que lo desconectes — la misma forma que tiene iniciar sesión con tu cuenta en cualquier otra aplicación.',
        ],
      },
      {
        heading: 'Añadirlo',
        body: [
          'En claude.ai: «Settings», luego «Connectors», luego «Add custom connector», y darle `https://transformpipe.com/api/mcp`. Inicia sesión cuando te lo pida, y las herramientas aparecen en la siguiente conversación.',
          'Desde un terminal, un solo comando hace lo mismo: `claude mcp add --transport http transformpipe https://transformpipe.com/api/mcp`.',
          'No se configura nada más. El conector se quita desde esa misma pantalla, y quitarlo revoca el acceso de inmediato.',
        ],
      },
      {
        heading: 'Qué puede hacer entonces',
        body: [
          'Once herramientas, todas con nombre `tp_`. Las que importan en una conversación son `tp_convert_markdown`, que vuelve documento HTML terminado un texto en Markdown, `tp_convert_to_markdown` para un archivo que va en sentido contrario, `tp_save_document`, que guarda el resultado en tu cuenta, y `tp_share_document`, que lo publica y devuelve un enlace que puedes enviar.',
          'Las demás son a las que un asistente recurre por su cuenta: `tp_list_documents` y `tp_get_document` para encontrar algo que hiciste antes, `tp_summarize_document` para decir qué contiene uno largo, `tp_document_versions` para enseñar qué sustituyó a qué, `tp_usage` para comprobar cuánto sitio queda, y `tp_delete_document`.',
          'En la práctica la frase útil es corta. Pídele que escriba las notas de la versión y luego pídele que las publique — el asistente convierte, guarda y comparte, y responde con la dirección.',
        ],
      },
      {
        heading: 'Hasta dónde llega, y hasta dónde no',
        body: [
          'El conector actúa como tú, en tu cuenta, sobre documentos que son tuyos. No puede cambiar la cuenta, leer tu contraseña, crear claves API ni llegar a los documentos de nadie más.',
          'Una autorización también puede ser de solo lectura, en cuyo caso el asistente puede listar, recuperar y resumir pero no guardar, compartir ni borrar — y esa restricción se aplica sobre la credencial misma y no sobre las herramientas, así que se mantiene pida lo que pida el asistente.',
          'Conviene saberlo, más que preocuparse por ello: un asistente con un conector es una autorización permanente para actuar, y un documento que lee puede contener instrucciones dirigidas a él. Ese es el coste honesto de la comodidad, y la razón de que una autorización de solo lectura sea el valor por defecto correcto para cualquier cosa que no hayas escrito tú.',
        ],
      },
      {
        heading: 'Cuándo no usarlo',
        body: [
          'Un conector le va bien al documento que existe dentro de una conversación y en ningún otro sitio. Para un archivo que ya está en el disco, soltarlo sobre el conversor es más rápido; para algo que ocurre en cada merge, la API o la GitHub Action tienen la forma adecuada; y para una carpeta de cuatrocientos archivos, un conversor local le gana a una conversación.',
        ],
      },
    ],
    action: 'Leer la documentación',
    seo: {
      title: 'Convertir y compartir un documento desde un asistente de IA — TransformPipe',
      description:
        'Cómo añadir TransformPipe a Claude como conector MCP, qué hacen las once herramientas y hasta dónde puede llegar un asistente dentro de tu cuenta.',
    },
  },
};
