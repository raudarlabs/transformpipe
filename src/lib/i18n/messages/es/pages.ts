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
    title: 'Qué es TransformPipe',
    lede: 'Un conversor de documentos que hace el trabajo en tu navegador y no se mete en medio.',
    sections: [
      {
        heading: 'El problema',
        body: [
          'Un documento llega como .docx, como presentación, como hoja de cálculo o como zip de exportación, y lo que quieres de él son las palabras. No las tipografías, no los saltos de página, no doce años de control de cambios — las palabras, en una forma que puedas pegar en una pull request, entregar a un generador de sitios estáticos, comparar, buscar o leer en una máquina que no tiene el programa que lo creó.',
          'Llegar ahí suele significar subir el archivo a desconocidos, instalar algo, o pegar el texto y perder las tablas. TransformPipe es la cuarta respuesta: la conversión ocurre en la página que ya tienes abierta.',
        ],
      },
      {
        heading: 'Qué hace',
        body: [
          'Quince conversiones. Un archivo de Word, una presentación, una hoja de cálculo, un libro EPUB, un archivo OpenDocument o RTF, una exportación de Evernote, una página HTML guardada, un CSV, una respuesta JSON, o el zip que Notion, Confluence y Obsidian te entregan al exportar — cada uno se convierte en Markdown. Y el Markdown se convierte en una página HTML terminada, un archivo de Word, texto plano, o algo que puedes imprimir.',
          'Todo se normaliza a Markdown, porque Markdown es un formato que puedes leer sin la herramienta que lo hizo, comparar en una pull request y seguir abriendo dentro de veinte años.',
          'Las imágenes vienen con él. Una conversión que encuentra una imagen dentro del archivo la lleva al resultado en vez de dejar una referencia a una carpeta que no tienes, así que lo que obtienes es un solo archivo que sigue mostrando lo que mostraba.',
        ],
      },
      {
        heading: 'Para quién es',
        body: [
          'Para quien saca documentación de un wiki y la lleva a un repositorio, donde la siguiente persona podrá cambiarla en una pull request en lugar de en un editor de texto enriquecido.',
          'Para quien trabaja todo el día con un asistente y quiere que lo que escribe quede en un sitio real — una página con dirección, y no el historial de una conversación que termina.',
          'Para quien recibe un archivo en un formato para el que no quiere instalar un programa, y necesita el contenido ahora y no después de una descarga.',
          'Y para cualquiera cuyos documentos no son suyos como para subirlos: un contrato, una nota clínica, unas cifras sin publicar, cualquier cosa cubierta por un acuerdo que nombre quién puede tratarla.',
        ],
      },
      {
        heading: 'Se ejecuta en tu navegador',
        body: [
          'Sin sesión iniciada, ningún archivo se envía a ninguna parte. No hay una subida en la que confiar porque no hay subida: la conversión ocurre en tu propia máquina, y por eso una página tras el inicio de sesión de tu empresa se convierte con la misma facilidad que una pública.',
          'Es una afirmación que puedes comprobar en lugar de creer. Abre la pestaña de red, convierte un archivo y observa que no sale nada que lo lleve — y después desconecta la red y convierte otro.',
          'Con sesión iniciada, el Markdown se guarda en tu cuenta, así que un documento te sigue a otra máquina. Sigue siendo privado hasta que lo compartas, y un enlace compartido se puede revocar.',
        ],
      },
      {
        heading: 'Lo que sale es un solo archivo',
        body: [
          'El HTML exportado lleva dentro sus estilos, sus imágenes, sus diagramas y sus fórmulas. No le pide nada a la red, que es lo que hace que dentro de cinco años se abra igual en un portátil sin conexión que hoy — y lo que hace seguro enviárselo a alguien que lo abrirá una vez y no volverá a pensar en ello.',
        ],
      },
      {
        heading: 'En qué se diferencia',
        body: [
          'Casi todos los conversores son un servidor: subes, trabaja, descargas, y una copia de tu documento existe en una máquina que no controlas durante el tiempo que diga su política. Para algunos documentos es el trato correcto y para otros el equivocado, y la cuestión es que debería ser una decisión y no un valor por omisión.',
          'Casi todos los conversores, además, leen el texto y paran. Un .pptx es un zip de partes XML, y las notas del orador — normalmente la prosa más útil de una presentación — están en una parte distinta de las diapositivas. Un EPUB guarda su orden de lectura en un spine que no tiene nada que ver con los nombres de archivo. Una exportación de Evernote direcciona sus imágenes por una suma de verificación de sus propios bytes. Leer el contenedor en vez del texto es casi todo lo que separa una conversión que puedes usar de una que tienes que reparar.',
          'Y lo que no hace también merece decirse: no lee PDF, ni LaTeX, ni los formatos de Office anteriores a 2007, no convertirá quinientos archivos mientras te haces un té, y un documento guardado se detiene en cuatro megabytes. Para eso, Pandoc y los servicios alojados son la mejor herramienta, y la comparativa de diez conversores del blog dice cuál para qué trabajo.',
        ],
      },
      {
        heading: 'Y no solo en el navegador',
        body: [
          'Las mismas conversiones llegan a un terminal, a una pull request, a una pestaña del navegador y a una conversación: una API pública, un cliente de línea de comandos sin dependencias, una GitHub Action que publica el Markdown que cambió una pull request, una extensión de navegador que convierte la página que estás leyendo, y un servidor MCP para que un asistente convierta y comparta en tu nombre. El mismo conjunto de conversores detrás de todos ellos, así que una tabla sale igual donde sea que la pidas.',
        ],
      },
      {
        heading: 'Quién lo construye',
        body: [
          'TransformPipe lo construye Raudar Labs. El código es público y tiene licencia MIT, lo que significa que la conversión en la que confías es una que puedes leer.',
        ],
      },
    ],
    faq: {
      heading: 'Preguntas sobre TransformPipe',
      intro: 'Las respuestas cortas. La documentación tiene el resto.',
      items: [
        {
          question: '¿Es gratis?',
          answer: 'Sí, sin plan que elegir ni tarjeta que introducir. Iniciar sesión es opcional y solo te compra un sitio donde guardar cosas: una cuenta admite 500 documentos y 100 MB de Markdown, y un documento suelto puede llegar a 4 MB. Alcanzar un límite rechaza el guardado y lo dice, en vez de descartar en silencio un documento antiguo para hacer hueco.',
        },
        {
          question: '¿Subís mi archivo?',
          answer: 'Sin sesión iniciada, no. La conversión corre en tu navegador y el archivo nunca sale de la máquina, lo que puedes comprobar en la pestaña de red o desconectándote. Con sesión iniciada se guarda el Markdown — no el archivo original — en tu cuenta para que esté en tus otros dispositivos, y puedes borrarlo, lo que elimina la fila y la fuente guardada a la vez.',
        },
        {
          question: '¿Qué formatos lee?',
          answer: 'Word, PowerPoint, Excel, EPUB, texto OpenDocument, RTF, exportaciones de Evernote, HTML, CSV, TSV, JSON, texto plano, y los zips de exportación de Notion, Confluence y Obsidian. Por el otro lado: HTML, Word, texto plano e impresión. El PDF es la ausencia notable — reconstruir estructura a partir de glifos en coordenadas es una disciplina distinta de leer un contenedor.',
        },
        {
          question: '¿Qué pasa con tablas, imágenes y código?',
          answer: 'Las tablas se convierten donde el origen tiene tablas de verdad; las celdas combinadas son el caso incómodo, porque Markdown no tiene sintaxis para ellas. Las imágenes se llevan al resultado en vez de referenciarse, hasta dos megabytes por documento. Los bloques de código conservan su lenguaje donde el origen anotó uno, y las fórmulas y los diagramas sobreviven hasta el HTML exportado.',
        },
        {
          question: '¿Puede usarlo mi asistente de IA?',
          answer: 'Sí. TransformPipe está en el directorio de conectores de Claude, en claude.ai/directory/tp: abre la ficha, pulsa Conectar, inicia sesión, y el asistente podrá convertir, guardar, buscar y compartir en tu cuenta. Todo lo que pone un documento delante de otras personas te pregunta antes.',
        },
        {
          question: '¿Por qué Markdown y no algo más rico?',
          answer: 'Porque el valor de un formato documental está en cuántas cosas podrán leerlo dentro de diez años. Markdown es texto plano con convenciones: un diff muestra qué cambió, una búsqueda lo encuentra, una persona puede leer el archivo mismo, y todos los generadores de sitios, wikis y asistentes ya lo entienden. Lo que cuesta es el control tipográfico fino — un trato justo para un documento pensado para trabajarse y no para imprimirse.',
        },
        {
          question: '¿Es de código abierto?',
          answer: 'Sí, con licencia MIT, en github.com/raudarlabs/transformpipe. Las conversiones, la API y el servidor MCP están todos en ese repositorio, así que una afirmación hecha en esta página es una que puedes ir a comprobar contra el código que la sostiene.',
        },
      ],
    },
    seo: {
      title: 'Qué es TransformPipe — un conversor de documentos que corre en el navegador',
      description:
        'TransformPipe convierte quince formatos a Markdown y de vuelta, en tu navegador y sin subir nada. También API, CLI, GitHub Action, extensión y servidor MCP.',
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
          'Las conversiones del sitio —Word, PowerPoint, hojas de cálculo, EPUB, HTML, CSV, JSON y las demás— se ejecutan dentro de la extensión. Nada se sube y nada necesita conexión, y varios archivos elegidos a la vez se convierten en un solo documento, en el orden en que los elegiste.',
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
          'Firefox la toma de Mozilla Add-ons, en el escritorio y en Android. La misma compilación desde el mismo código; donde Chrome pide un permiso para el panel lateral, Firefox concede el suyo en el manifiesto, así que allí no pide nada.',
        ],
      },
    ],
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
        heading: 'Sin la sesión iniciada, no nos llega ningún archivo',
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
          'Los ajustes de compartición: si un documento es privado, abierto por enlace o dirigido a direcciones de correo concretas, y el token que lleva un enlace, el día en que deja de funcionar si se fijó uno, y cuándo se ha abierto, y — si tiene contraseña — un hash de ella, nunca la contraseña.',
        ],
      },
      {
        heading: 'Contar, sin saber quién',
        body: [
          'Contamos las visitas y unas pocas acciones — una página abierta, una conversión, una descarga, un guardado, un documento compartido — como totales diarios anónimos, en nuestro propio servidor y en nuestra propia base de datos. Contar no crea ninguna cookie ni guarda nada en tu navegador; los totales no conservan ningún identificador ni dirección IP, y de un documento nada más que la conversión o el formato. De dónde llegó una visita se registra solo como el nombre del sitio de procedencia — Product Hunt, Google, «directo» — o como la etiqueta de campaña del enlace que seguiste.',
          'Un enlace compartido también registra sus aperturas, para que las vea su propietario: la hora de cada una, y si fue la página compartida o la app — nada sobre quién lo abrió. La página pide a nuestro servidor una imagen de un píxel, y esa petición es todo lo que se registra; no se crea ninguna cookie. Para que una misma máquina no pueda inflar la cuenta, se guarda un hash de un solo sentido de su dirección junto a un recuento por minuto, y se borra en menos de un día. Las aperturas se van con el enlace cuando se revoca, y ninguna se guarda más de un año. La única excepción es un documento compartido con personas concretas: quien lo lee ha iniciado sesión con una de las direcciones que nombró el propietario, así que cada apertura registra también cuál de esas direcciones fue — y la página le dice al lector que el propietario puede verlo.',
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
          'Una cookie de sesión, que pone nuestro proveedor de autenticación cuando inicias sesión, propia y HttpOnly. Existe otra de vida corta durante el ida y vuelta del inicio de sesión, que caduca en diez minutos. Otra solo se pone si abres un enlace compartido con contraseña y la escribes: recuerda, durante un día, que lo hiciste. Esas son todas — no hay nada opcional que desactivar. La página de cookies tiene el detalle.',
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
        'Sin sesión iniciada, ningún archivo sale de tu navegador. Con sesión guardamos el documento, sus metadatos y tu identidad de cuenta: Google Analytics solo si lo permites, sin píxeles de seguimiento y sin vender nada.',
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
          'Sin la sesión iniciada, y con la analítica rechazada o sin responder, este sitio no pone ninguna cookie — salvo si escribes la contraseña de un enlace compartido, que pone la que se describe abajo.',
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
        heading: 'Una para un enlace con contraseña',
        body: [
          'tp_unlock_ seguido de un código del enlace — se pone cuando escribes la contraseña de un enlace compartido, para que la siguiente carga de página no vuelva a pedirla. Es propia y HttpOnly, y dura un día. Guarda una firma que demuestra que se escribió la contraseña, nunca la contraseña, y una contraseña nueva en el enlace la deja sin valor.',
        ],
      },
      {
        heading: 'Almacenamiento del navegador, que no es una cookie',
        body: [
          'Dos cosas viven en el almacenamiento local de tu navegador y nunca se envían a ningún sitio: el tema que elegiste y —cuando no tienes la sesión iniciada— tus conversiones recientes, para que el historial tenga algo dentro. Borrar los datos del sitio en el navegador elimina las dos, y la aplicación sigue funcionando sin ellas.',
        ],
      },
      {
        heading: 'Contar sin cookies ni almacenamiento',
        body: [
          'Las visitas y unas pocas acciones se cuentan en nuestro propio servidor como totales diarios anónimos. Eso no crea ninguna cookie ni guarda nada en tu navegador, así que aquí no hay nada que permitir ni rechazar: la página de privacidad dice exactamente qué se cuenta.',
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
  'how-to-epub': {
    label: 'Abrir un archivo .epub',
    title: 'Cómo abrir un archivo .epub',
    lede: 'Cualquier lector lo abre. Lo incómodo es sacarle el texto.',
    sections: [
      {
        heading: 'Qué es',
        body: [
          'Un `.epub` es un archivo zip de XHTML: una página web por capítulo, una hoja de estilos, las imágenes y un archivo de paquete que los enumera y fija el orden de lectura. Es el formato abierto en el que coincidió toda la industria; los `.azw3` y `.mobi` del Kindle son la excepción, no el estándar.',
        ],
      },
      {
        heading: 'Para leerlo',
        body: [
          'Apple Books lo abre en Mac, iPhone y iPad, y Microsoft Edge lo abre en Windows sin instalar nada. Calibre es el lector de escritorio gratuito que además convierte entre formatos, y Thorium es el indicado si quieres un sistema de lectura que siga la especificación de cerca.',
          'Un Kindle no lee `.epub` directamente, pero el servicio «Enviar a Kindle» de Amazon lo acepta y lo convierte por el camino.',
        ],
      },
      {
        heading: 'Por qué renombrarlo a .zip casi funciona',
        body: [
          'Porque lo es. Descomprime un `.epub` y cada capítulo está ahí, abrible en un navegador. Lo que no tendrás es el orden: los archivos suelen llamarse `index_split_030.xhtml`, `index_split_002.xhtml`, y esos números son lo que escribió la herramienta que hizo el libro. El orden de lectura vive en la spine del archivo de paquete, y no lo declara nada más.',
        ],
      },
      {
        heading: 'Del libro al documento',
        body: [
          'Convertirlo directamente da un documento Markdown: los capítulos en el orden de la spine, con los títulos del índice del propio libro, las imágenes dentro del archivo y los enlaces entre capítulos reducidos a sus palabras, porque en un documento unido no tienen dónde aterrizar.',
        ],
      },
    ],
    action: 'Convertir un .epub a Markdown',
    seo: {
      title: 'Cómo abrir un archivo .epub — TransformPipe',
      description:
        'Cómo abrir un EPUB en cualquier dispositivo, por qué al descomprimirlo se pierde el orden de los capítulos y cómo convertir un libro en un documento.',
    },
  },
  'how-to-odt': {
    label: 'Abrir un archivo .odt',
    title: 'Cómo abrir un archivo .odt',
    lede: 'Es la norma internacional del documento de procesador de textos, y Word también lo abre.',
    sections: [
      {
        heading: 'Qué es',
        body: [
          'Un `.odt` es un zip de XML — `content.xml` para las palabras, `styles.xml` para su aspecto, una carpeta `Pictures` — y es OpenDocument Text, una norma ISO y no el formato de una sola empresa. LibreOffice y OpenOffice lo escriben por defecto, y Google Docs lo devuelve en Archivo, Descargar.',
        ],
      },
      {
        heading: 'Para abrirlo',
        body: [
          'LibreOffice es la respuesta obvia y es gratuito en cualquier sistema de escritorio. Microsoft Word abre y guarda `.odt` desde 2007, y Word en la web también; Google Docs lo importa desde Archivo, Abrir. Apple Pages también lo abre, aunque querrá volver a guardarlo en otro formato.',
          'Si solo quieres leerlo, el zip está a tu disposición: descomprímelo y `content.xml` es el documento, etiquetas incluidas.',
        ],
      },
      {
        heading: 'Qué suele salir mal',
        body: [
          'La ida y vuelta por Word. Un `.odt` abierto en Word y vuelto a guardar conserva sus palabras y pierde parte de su formato, porque los dos programas no coinciden en qué significa cada estilo — un problema solo si después alguien lo abre en LibreOffice.',
          'Las fuentes, como en cualquier formato de documento. Un archivo que nombra una fuente que no tienes se compone con la que el lector sustituya, y un recuento de páginas que importaba deja de ser el mismo.',
        ],
      },
      {
        heading: 'Del documento al Markdown',
        body: [
          'Es el formato que se convierte con más fidelidad de todos, porque dice qué son las cosas en lugar de cómo se ven: un encabezado conoce su nivel, una lista su anidamiento, una tabla es una tabla y una nota una nota. Al convertirlo se conserva todo eso, con las imágenes dentro del archivo.',
        ],
      },
    ],
    action: 'Convertir un .odt a Markdown',
    seo: {
      title: 'Cómo abrir un archivo .odt — TransformPipe',
      description:
        'Cómo abrir un archivo OpenDocument, qué programas lo leen además de LibreOffice, qué se pierde al pasar por Word y cómo convertirlo en Markdown.',
    },
  },
  'how-to-rtf': {
    label: 'Abrir un archivo .rtf',
    title: 'Cómo abrir un archivo .rtf',
    lede: 'Lo abre todo. Esa es justamente su razón de ser, y por eso sigue existiendo.',
    sections: [
      {
        heading: 'Qué es',
        body: [
          'El Rich Text Format es texto plano con instrucciones dentro: `{\\rtf1` al principio y luego palabras de control como `\\b` para negrita y `\\par` para un párrafo nuevo, hasta el final. Microsoft lo publicó en 1987 y dejó de desarrollarlo en 2008, que es exactamente por lo que todo procesador de textos escrito desde entonces lo lee.',
        ],
      },
      {
        heading: 'Para abrirlo',
        body: [
          'TextEdit en un Mac y WordPad en Windows lo abren sin instalar nada, igual que Word, LibreOffice, Google Docs y Pages. En un Mac, la barra espaciadora en el Finder lo muestra.',
          'También se lee tal cual: ábrelo en un editor de texto y las palabras están ahí entre las palabras de control, que es más de lo que puede decirse de un `.docx`.',
        ],
      },
      {
        heading: 'Por qué aparece tan a menudo',
        body: [
          'Porque es lo que produce un Mac cuando el texto sale de una aplicación. Arrastra una selección de una ventana a otra y macOS entrega RTF; lo mismo vale para buena parte del copiar y pegar entre programas, y para todo lo exportado por un sistema antiguo que quería conservar negrita y cursiva sin comprometerse con un formato.',
          'No lleva casi metadatos ni macros, y por eso también es la opción prudente para mandar un documento fuera de la organización.',
        ],
      },
      {
        heading: 'Y en Markdown',
        body: [
          'Negrita, cursiva, tachado, enlaces, listas y tablas se convierten. Los encabezados son lo único en lo que el formato es vago: Word escribe un nivel de esquema y lo dice en serio, y un Mac no escribe más que una línea en negrita más grande — así que se usa el nivel de esquema donde lo hay, y donde no, un párrafo en negrita compuesto más grande que el cuerpo.',
        ],
      },
    ],
    action: 'Convertir un .rtf a Markdown',
    seo: {
      title: 'Cómo abrir un archivo .rtf — TransformPipe',
      description:
        'Cómo abrir un archivo de texto enriquecido, por qué un Mac genera uno al arrastrar texto entre apps, qué lleva dentro y cómo convertirlo en Markdown.',
    },
  },
  'how-to-enex': {
    label: 'Abrir un archivo .enex',
    title: 'Cómo abrir un archivo .enex',
    lede: 'Es la única salida que tienen las notas de Evernote, y casi nada lo abre directamente.',
    sections: [
      {
        heading: 'Qué es',
        body: [
          'Un `.enex` es un único archivo XML con todas las notas exportadas: el título, las etiquetas, las fechas y la nota misma en ENML — la variante restringida de XHTML propia de Evernote — incrustada dentro del XML. Los adjuntos viajan en el mismo archivo, codificados en base64, enlazados a la nota por el MD5 de su contenido y no por un nombre.',
        ],
      },
      {
        heading: 'Cómo sacar uno de Evernote',
        body: [
          'Selecciona las notas, o una libreta entera, y luego Archivo, Exportar notas. La aplicación de escritorio escribe `.enex`; la versión web no ofrece exportación, así que es una operación solo de escritorio.',
          'Exporta una libreta cada vez en lugar de todo a la vez. Un único archivo de diez mil notas es una cosa que puede salir mal en lugar de veinte.',
        ],
      },
      {
        heading: 'Qué lo lee',
        body: [
          'El plugin Importer de Obsidian, la importación de Notion, Notas de Apple, Joplin y Bear aceptan todos el `.enex` — porque es el formato para el que todo el mundo escribió un importador cuando cambiaron los precios de Evernote. Lo que no lo lee es un editor de texto: ábrelo y verás XML con tus notas en base64 y CDATA.',
        ],
      },
      {
        heading: 'Qué comprobar tras cualquier importación',
        body: [
          'Las etiquetas, lo primero. Son la organización de una biblioteca de Evernote y varios importadores las descartan, y entonces diez mil notas son un montón y no una biblioteca.',
          'Después los adjuntos. Una nota que llevaba un PDF o una fotografía debería seguir diciéndolo; el formato enlaza ambas cosas por un hash y no por un nombre de archivo, y ahí es donde se nota un importador que tomó un atajo.',
        ],
      },
    ],
    action: 'Convertir un .enex a Markdown',
    seo: {
      title: 'Cómo abrir un archivo .enex — TransformPipe',
      description:
        'Cómo exportar un .enex desde Evernote, qué lleva dentro, qué aplicaciones lo importan y qué comprobar después: etiquetas y adjuntos sobre todo.',
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
          'En claude.ai, TransformPipe figura en el directorio de conectores, en `claude.ai/directory/tp`: ábrelo, pulsa «Connect» e inicia sesión cuando te lo pida — las herramientas aparecen en la siguiente conversación. Donde el directorio está desactivado, «Settings», luego «Connectors», luego «Add custom connector» acepta el mismo servidor por su dirección, `https://transformpipe.com/api/mcp`.',
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

  /*
   * Las páginas de los asistentes. `sections` está vacío a propósito: se dibujan a partir de
   * `landing`, y el prerenderizador imprime ese mismo objeto como prosa.
   */
  agents: {
    label: 'Asistentes de IA',
    title: 'Comparte como enlace todo lo que escribe tu asistente',
    lede: 'Tu asistente escribe Markdown todo el día —notas de versión, especificaciones, resúmenes— y todo se queda en el chat. Conecta TransformPipe con un clic y pide a Claude o a cualquier asistente MCP que comparta un documento: te da la dirección de una página terminada que cualquiera puede abrir, sin cuenta. O simplemente guárdalo y encuéntralo después desde cualquier dispositivo.',
    sections: [],
    landing: {
      eyebrow: 'Para asistentes de IA',
      demo: {
        from: 'En el chat',
        to: 'En tu cuenta',
        title: 'Plan del T3',
        lines: [
          'Lanzar el importador antes del cambio de precios.',
          'Pasar la facturación al nuevo proveedor',
          'Escribir la guía de migración',
        ],
        shared: 'Compartido con anna@acme.com',
        meta: 'v2 · guardado desde Claude',
      },
      useCases: {
        heading: 'Para qué sirve',
        intro: 'Cuatro cosas que dejan de ser un engorro en cuanto el asistente puede llegar a tu cuenta.',
        items: [
          {
            title: 'Conserva lo que escribe el asistente',
            body: 'Unas notas de versión, una especificación, el resumen de un hilo larguísimo: pide que lo guarde y va a tu cuenta con un título que puedes buscar. Mañana lo tienes en otro portátil o en el móvil, mucho después de que el chat haya quedado atrás.',
            ask: '«Guarda esto como el plan del T3.»',
            result: 'Guardado · Plan del T3',
          },
          {
            title: 'Envía una página, no un texto pegado',
            body: 'El asistente guarda el documento, lo comparte y te responde con la dirección. Quien lo abre ve una página terminada —títulos, tablas, código— sin necesidad de cuenta. Compártelo con quien tenga el enlace o solo con las personas que indiques, y revócalo cuando quieras.',
            ask: '«Publícalo y dame el enlace.»',
            result: 'Enlace creado · transformpipe.com/s/…',
          },
          {
            title: 'Encuéntralo otra vez, desde cualquier asistente',
            body: 'Cada documento guardado está en una sola lista, venga de la conversación y del asistente que venga. Pídelo por su nombre o por algo que diga dentro, y el asistente lo busca, en lugar de que tú repases cuarenta chats para encontrarlo.',
            ask: '«Busca la especificación de la migración de la semana pasada.»',
            result: 'Encontrado · Especificación de migración, 16 sep',
          },
          {
            title: 'Reescribe sin perder el primer borrador',
            body: 'Cuando el asistente actualiza un documento, el texto nuevo se guarda como una versión junto a la anterior, en vez de encima. Puedes ver qué sustituyó a qué, preguntar qué cambió entre dos versiones y volver a abrir el primer borrador cuando quieras.',
            ask: '«Actualiza la especificación y conserva la versión anterior.»',
            result: 'v1 → v2 · se conservan las dos',
          },
        ],
      },
      compare: {
        heading: 'Copiarlo del chat, o conectar una sola vez',
        intro: 'Qué le pasa a un documento que ha escrito un asistente, tal como lo resuelve hoy casi todo el mundo y tal como va con el conector.',
        left: 'Copiar y pegar',
        right: 'Con TransformPipe',
        rows: [
          { label: 'Dónde acaba', left: 'En el chat, o en una nota donde lo pegaste', right: 'En tu cuenta, con un título' },
          { label: 'Encontrarlo después', left: 'Volver atrás por las conversaciones', right: 'Buscarlo, o pedírselo al asistente' },
          { label: 'Desde otro asistente', left: 'Otra aplicación, otro historial', right: 'La misma lista, lo escribiera la herramienta que lo escribiera' },
          { label: 'Enviárselo a alguien', left: 'Markdown pegado, con asteriscos y todo', right: 'Un enlace a una página terminada' },
          { label: 'Quién puede abrirlo', left: 'Cualquiera a quien se lo reenviaste', right: 'Cualquiera con el enlace, o solo las direcciones que indiques' },
          { label: 'Después de reescribirlo', left: 'El texto anterior está donde lo dejaras', right: 'Las dos versiones guardadas, una al lado de la otra' },
        ],
      },
      steps: {
        heading: 'Conectado en tres pasos',
        items: [
          {
            title: 'Búscalo o copia la dirección',
            body: 'TransformPipe figura en el directorio de conectores de Claude. En todos los demás sitios es una sola dirección, sin ninguna clave ni nada que generar.',
          },
          {
            title: 'Añádela a tu asistente',
            body: 'En Claude, abre TransformPipe en el directorio de conectores y pulsa «Connect». Inicia sesión con Google cuando te lo pida.',
          },
          {
            title: 'Pídelo con palabras normales',
            body: 'Guardar, publicar, buscar, actualizar. El documento queda en tu cuenta y se abre en cualquier dispositivo.',
          },
        ],
      },
      trust: {
        heading: 'A qué puede llegar el asistente, y a qué no',
        can: [
          'Guardar un documento en tu cuenta',
          'Listar, abrir y resumir tus documentos',
          'Compartir uno por enlace o con direcciones concretas',
          'Guardar una versión nueva junto a la anterior',
        ],
        cannot: [
          'Cambiar tu cuenta ni su configuración',
          'Ver tu contraseña ni crear claves API',
          'Llegar a los documentos de nadie más',
          'Borrar nada sin tu confirmación explícita',
        ],
        notes: [
          {
            title: 'Solo lectura cuando quieras',
            body: 'Una autorización puede limitarse a la lectura. Eso se aplica sobre la credencial misma, así que se mantiene diga lo que diga un documento que lea el asistente.',
          },
          {
            title: 'Gratis, con los límites por escrito',
            body: '500 documentos y 100 MB por cuenta, 4 MB por documento. Al llegar a un límite se rechaza el guardado; no se borra nada para hacer sitio.',
          },
        ],
      },
      clients: {
        heading: 'Qué asistentes se conectan',
        intro: 'Una cuenta y una lista de documentos, sea cual sea de estos el que los escribió. Claude y ChatGPT se conectan hoy; los demás se están probando.',
        items: [
          {
            name: 'Claude',
            how: 'Directorio de conectores · un clic',
            body: 'claude.ai, Claude Desktop y Claude Code. TransformPipe figura en el directorio de conectores de Claude: ábrelo, pulsa «Connect», inicia sesión y pídele a Claude que guarde, publique o busque un documento.',
          },
          {
            name: 'ChatGPT',
            how: 'App MCP · añadida por dirección',
            body: 'En ChatGPT, abre Plugins, pulsa Add, elige Create MCP App e indica https://transformpipe.com/api/mcp. Tras iniciar sesión, los documentos aparecen como tarjetas en el chat. Aún no está en el directorio de ChatGPT.',
          },
          {
            name: 'Cursor',
            how: 'Servidor MCP remoto',
            body: 'Cursor añade servidores MCP remotos con inicio de sesión, pero vuelve de él al editor mediante su propio esquema de enlaces, que este servidor todavía no acepta. Esa es la parte en la que se está trabajando.',
          },
          {
            name: 'Gemini',
            how: 'Gemini CLI, MCP remoto',
            body: 'Gemini CLI añade servidores MCP remotos con un inicio de sesión en el navegador, igual que Claude Code, y es el siguiente que se va a probar.',
          },
          {
            name: 'VS Code',
            how: 'Modo agente de Copilot, MCP remoto',
            body: 'El modo agente de GitHub Copilot en VS Code se conecta a servidores MCP remotos e inicia sesión en el navegador. En pruebas.',
          },
          {
            name: 'Windsurf',
            how: 'Servidor MCP remoto',
            body: 'El asistente de Windsurf también admite servidores MCP remotos. Queda por comprobar si su inicio de sesión se completa contra este servidor.',
          },
        ],
      },
      faq: {
        heading: 'Preguntas sobre conectar un asistente',
        intro: 'Las respuestas cortas. La guía de configuración completa tiene el resto.',
        items: [
          {
            question: '¿Qué es un conector MCP?',
            answer:
              'MCP, el Model Context Protocol, es la forma en que un asistente de IA llama a herramientas fuera del chat. TransformPipe tiene un servidor MCP en `/api/mcp`; añadirlo a tu asistente como conector personalizado le da un puñado de herramientas —guardar un documento, compartirlo como enlace, listar y abrir lo que guardaste, conservar versiones— que usa cuando se lo pides con palabras normales.',
          },
          {
            question: '¿Es gratis?',
            answer:
              'Sí, sin plan que elegir ni tarjeta que introducir. Una cuenta admite 500 documentos y 100 MB de Markdown, y un solo documento puede ocupar hasta 4 MB. Al llegar a un límite se rechaza el guardado y se te avisa, en lugar de borrar a escondidas un documento antiguo para hacer sitio.',
          },
          {
            question: '¿Tengo que registrarme antes?',
            answer:
              'No. Al añadir el conector en tu asistente pasas por un inicio de sesión normal, y ese inicio de sesión es la cuenta: no hay registro aparte, ni clave API que generar, ni nada que pegar. La misma cuenta funciona en la web, así que los documentos que guarda tu asistente están ahí cuando inicias sesión en otro dispositivo.',
          },
          {
            question: '¿Cómo guardo como documento lo que ha escrito un asistente?',
            answer:
              'Pídelo en la misma conversación: «guarda esto», o «guarda esto como el plan del T3». El asistente envía el Markdown que escribió a tu cuenta, donde recibe un título, un lugar en una lista con búsqueda y un historial de versiones, en vez de quedarse en un chat que tendrías que repasar hacia atrás o copiar a mano.',
          },
          {
            question: '¿Cómo comparto como enlace lo que genera un asistente?',
            answer:
              'Pídele al asistente que lo publique. Guarda el documento, lo comparte y te responde con la dirección: una página terminada con los títulos, las tablas y el código ya renderizados, no Markdown en bruto con sus asteriscos. Compártelo con cualquiera que tenga el enlace, o conviértelo en un enlace de solo lectura que solo puedan abrir las direcciones de correo que indiques, y revócalo en cualquier momento.',
          },
          {
            question: '¿Se usan mis documentos para entrenar IA?',
            answer:
              'No. Nosotros no leemos los documentos que guardas y no se usan para entrenar ningún modelo. Se almacenan en tu cuenta, a tu alcance y al de los asistentes que conectaste, hasta que los borres, y borrar uno lo elimina en lugar de ocultarlo.',
          },
          {
            question: '¿Puede el asistente borrar mis documentos?',
            answer:
              'Solo un documento cada vez, y solo con una confirmación explícita en la misma petición, así que una instrucción vaga no puede vaciar una cuenta. Una autorización de solo lectura puede listar, abrir y resumir tus documentos, pero no guardar, compartir ni borrar nada, y ese límite se aplica sobre la credencial misma y no sobre lo que se le diga al asistente.',
          },
          {
            question: '¿Qué pasa si lo desconecto?',
            answer:
              'El asistente pierde el acceso de inmediato: quitar el conector revoca la autorización. Tus documentos se quedan en tu cuenta, y los enlaces que ya compartiste siguen funcionando hasta que tú mismo los revoques. Si vuelves a conectarlo más adelante, recuperas la misma cuenta y la misma lista de documentos.',
          },
          {
            question: '¿Puede editar el documento alguien con quien lo compartí?',
            answer:
              'No. Un documento compartido es de solo lectura para quien lo abre: puede leer la página y descargarla, pero no cambiarla, borrarla ni volver a compartirla. Los documentos que otras personas comparten con tu dirección aparecen en tu propia lista, marcados como compartidos contigo.',
          },
          {
            question: '¿Es una integración oficial de alguno de estos asistentes?',
            answer:
              'No. TransformPipe es un servidor MCP independiente creado por Raudar Labs, no un producto de Anthropic, OpenAI, Google ni de ningún fabricante de editores. Figura en el directorio de conectores de Claude; todos los demás asistentes se conectan a él por su dirección, igual que a cualquier conector personalizado, con el inicio de sesión estándar que define el protocolo.',
          },
        ],
      },
      middle: {
        title: 'Pruébalo con lo próximo que escriba tu asistente',
        text: 'Añádelo desde el directorio de conectores de Claude —o dale la dirección a cualquier otro asistente— y pide que guarde la respuesta. Es cosa de un minuto.',
      },
      bottom: {
        title: 'Tu próximo documento se está escribiendo ahora mismo en un chat',
        text: 'Ponlo en un sitio donde siga estando la semana que viene.',
      },
    },
    action: 'Copiar la dirección',
    seo: {
      title: 'Guarda y comparte lo que escribe tu asistente de IA — TransformPipe',
      description:
        'Tu asistente de IA escribe Markdown y lo deja en el chat. Conecta TransformPipe: guarda, versiona y comparte cada documento, a mano desde cualquier dispositivo.',
    },
  },

  'agents-claude': {
    label: 'Claude',
    title: 'Guarda y comparte lo que escribe Claude',
    lede: 'Claude redacta las notas de versión, la especificación, el resumen de la reunión… y todo se queda en esa conversación. Añade TransformPipe como conector y Claude guarda cada documento en tu cuenta, conserva sus versiones y te da un enlace que se abre como una página terminada.',
    sections: [],
    landing: {
      eyebrow: 'Para Claude',
      demo: {
        from: 'En el chat',
        to: 'En tu cuenta',
        title: 'Plan del T3',
        lines: [
          'Lanzar el importador antes del cambio de precios.',
          'Pasar la facturación al nuevo proveedor',
          'Escribir la guía de migración',
        ],
        shared: 'Compartido con anna@acme.com',
        meta: 'v2 · guardado desde Claude',
      },
      useCases: {
        heading: 'Qué pedirle a Claude',
        intro: 'Cuatro frases que hacen algo en cuanto añades el conector, igual en claude.ai que en Claude Desktop y en Claude Code.',
        items: [
          {
            title: 'Conserva lo que escribe Claude',
            body: 'El documento va a tu cuenta con un título que elige Claude, y puedes cambiarle el nombre después. Mañana sigue ahí, en otro dispositivo, aunque la conversación quede muy lejos, y no depende de que recuerdes en qué chat estaba.',
            ask: '«Guarda esto como el plan del T3.»',
            result: 'Guardado · Plan del T3',
          },
          {
            title: 'Envía una página, no un texto pegado',
            body: 'Claude guarda el documento, lo comparte y te responde con la dirección. Quien lo abre ve una página terminada y no necesita cuenta de Claude. Compártelo con cualquiera que tenga el enlace o solo con las direcciones que indiques; si lo revocas, el enlace deja de funcionar, incluso uno que ya hayas enviado.',
            ask: '«Publícalo y dame el enlace.»',
            result: 'Enlace creado · transformpipe.com/s/…',
          },
          {
            title: 'Encuéntralo otra vez, en cualquier conversación',
            body: 'Claude lista tus documentos y abre el que buscabas, incluso uno escrito en otra conversación, en Claude Code o directamente por otro asistente.',
            ask: '«Busca la especificación de la migración de la semana pasada.»',
            result: 'Encontrado · Especificación de migración, 16 sep',
          },
          {
            title: 'Reescribe sin perder el primer borrador',
            body: 'Una actualización se guarda como versión nueva junto a la anterior, y Claude puede leer las dos y decirte qué ha cambiado.',
            ask: '«Actualiza la especificación y conserva la versión anterior.»',
            result: 'v1 → v2 · se conservan las dos',
          },
        ],
      },
      compare: {
        heading: 'Por qué no basta con un artifact',
        intro: 'Un artifact es una buena forma de ver algo mientras la conversación está abierta. Un documento aquí es para todo lo que viene después.',
        left: 'Artifact de Claude',
        right: 'TransformPipe',
        rows: [
          { label: 'Dónde vive', left: 'En la conversación que lo creó', right: 'En tu cuenta, fuera de cualquier chat' },
          { label: 'Encontrarlo después', left: 'Recordar en qué chat estaba', right: 'Buscarlo, o pedírselo a Claude en cualquier conversación' },
          { label: 'Documentos de otras herramientas', left: 'Solo Claude', right: 'Una lista, lo escribiera el asistente que lo escribiera' },
          { label: 'Compartir', left: 'Publicado como página pública', right: 'Un enlace, o solo direcciones concretas; revocable cuando quieras' },
          { label: 'Versiones', left: 'Dentro de esa conversación', right: 'Guardadas entre conversaciones y herramientas' },
          { label: 'Llevarlo a otra parte', left: 'Copiar el contenido', right: 'Descargarlo en Markdown o como archivo HTML terminado' },
        ],
      },
      steps: {
        heading: 'Conectado en tres pasos',
        items: [
          {
            title: 'Ábrelo en el directorio',
            body: 'TransformPipe figura en el directorio de conectores de Claude: el botón de esta página abre la ficha, o búscalo en «Settings», «Connectors», «Browse connectors».',
          },
          {
            title: 'Conéctalo',
            body: 'Pulsa «Connect», en claude.ai o en Claude Desktop. No hay ninguna clave que pegar ni dirección que escribir — o añade `https://transformpipe.com/api/mcp` como conector personalizado si tu organización mantiene el directorio desactivado.',
          },
          {
            title: 'Inicia sesión y pídelo',
            body: 'Inicia sesión con Google cuando Claude te lo pida. Desde la siguiente conversación, «guarda esto» hace justo lo que dice.',
          },
        ],
      },
      command: {
        heading: 'En Claude Code',
        body: 'Un solo comando, en cualquier terminal. La primera vez que se usa una herramienta, Claude Code abre el mismo inicio de sesión en tu navegador.',
        code: 'claude mcp add --transport http transformpipe https://transformpipe.com/api/mcp',
      },
      trust: {
        heading: 'A qué puede llegar Claude, y a qué no',
        can: [
          'Guardar un documento en tu cuenta',
          'Listar, abrir y resumir tus documentos',
          'Compartir uno por enlace o con direcciones concretas',
          'Guardar una versión nueva junto a la anterior',
        ],
        cannot: [
          'Cambiar tu cuenta ni su configuración',
          'Ver tu contraseña ni crear claves API',
          'Llegar a los documentos de nadie más',
          'Borrar nada sin tu confirmación explícita',
        ],
        notes: [
          {
            title: 'Solo lectura cuando quieras',
            body: 'Una autorización puede limitarse a la lectura. Eso se aplica sobre la credencial misma, así que se mantiene diga lo que diga un documento que lea el asistente.',
          },
          {
            title: 'Desconexión en un clic',
            body: 'Quitar el conector en la configuración de Claude revoca su acceso al momento. Tus documentos se quedan hasta que los borres.',
          },
          {
            title: 'Gratis, con los límites por escrito',
            body: '500 documentos y 100 MB por cuenta, 4 MB por documento. Al llegar a un límite se rechaza el guardado; no se borra nada para hacer sitio.',
          },
        ],
      },
      clients: {
        heading: 'Otros asistentes, los mismos documentos',
        intro: 'Lo que guarde Claude, ChatGPT también lo encuentra, y los demás podrán hacerlo: una sola cuenta, sea cual sea la herramienta que pregunte.',
        items: [
          {
            name: 'Claude',
            how: 'Directorio de conectores · un clic',
            body: 'claude.ai, Claude Desktop y Claude Code: figura en el directorio de conectores de Claude, con los pasos de esta página.',
          },
          {
            name: 'ChatGPT',
            how: 'App MCP · añadida por dirección',
            body: 'En ChatGPT, abre Plugins, pulsa Add, elige Create MCP App e indica https://transformpipe.com/api/mcp. Tras iniciar sesión, los documentos aparecen como tarjetas en el chat. Aún no está en el directorio de ChatGPT.',
          },
          {
            name: 'Cursor',
            how: 'Servidor MCP remoto',
            body: 'Cursor añade servidores MCP remotos con inicio de sesión, pero vuelve de él al editor mediante su propio esquema de enlaces, que este servidor todavía no acepta. Esa es la parte en la que se está trabajando.',
          },
          {
            name: 'Gemini',
            how: 'Gemini CLI, MCP remoto',
            body: 'Gemini CLI añade servidores MCP remotos con un inicio de sesión en el navegador, igual que Claude Code, y es el siguiente que se va a probar.',
          },
          {
            name: 'VS Code',
            how: 'Modo agente de Copilot, MCP remoto',
            body: 'El modo agente de GitHub Copilot en VS Code se conecta a servidores MCP remotos e inicia sesión en el navegador. En pruebas.',
          },
          {
            name: 'Windsurf',
            how: 'Servidor MCP remoto',
            body: 'El asistente de Windsurf también admite servidores MCP remotos. Queda por comprobar si su inicio de sesión se completa contra este servidor.',
          },
        ],
      },
      faq: {
        heading: 'Preguntas sobre Claude y TransformPipe',
        intro: 'Las respuestas cortas. La guía de configuración completa tiene el resto.',
        items: [
          {
            question: '¿Está TransformPipe en el directorio de conectores de Claude?',
            answer:
              'Sí. Figura en `claude.ai/directory/tp`: abre la ficha, pulsa «Connect» e inicia sesión, en claude.ai o en Claude Desktop. Un conector es la forma en que Claude llega a una herramienta fuera de la conversación, mediante MCP, el Model Context Protocol; si tu organización mantiene el directorio desactivado, el mismo servidor se puede añadir por su dirección como conector personalizado — `https://transformpipe.com/api/mcp`.',
          },
          {
            question: '¿Es gratis?',
            answer:
              'Sí, sin plan que elegir ni tarjeta que introducir. Una cuenta admite 500 documentos y 100 MB de Markdown, y un solo documento puede ocupar hasta 4 MB. Al llegar a un límite se rechaza el guardado y se te avisa, en lugar de borrar a escondidas un documento antiguo para hacer sitio.',
          },
          {
            question: '¿Tengo que registrarme antes?',
            answer:
              'No. Al añadir el conector en Claude pasas por un inicio de sesión normal, y ese inicio de sesión es la cuenta: no hay registro aparte, ni clave API que generar, ni nada que pegar. La misma cuenta funciona en la web, así que lo que guarda Claude está ahí cuando inicias sesión en otro dispositivo.',
          },
          {
            question: '¿Cómo exporto como documento lo que ha escrito Claude?',
            answer:
              'Pídele a Claude que lo guarde: «guarda esto», o «guarda esto como las notas de versión». En lugar de copiar el Markdown del chat, Claude lo envía a tu cuenta, donde recibe un título, un lugar en una lista con búsqueda y un historial de versiones, y se puede descargar como archivo Markdown o como página HTML terminada y autónoma.',
          },
          {
            question: '¿Cómo comparto como enlace lo que genera Claude?',
            answer:
              'Pídele a Claude que lo publique. Guarda el documento, lo comparte y te responde con la dirección: una página terminada con los títulos, las tablas y el código ya renderizados, no Markdown en bruto. Compártelo con cualquiera que tenga el enlace, o conviértelo en un enlace de solo lectura que solo puedan abrir las direcciones de correo que indiques, y revócalo en cualquier momento.',
          },
          {
            question: '¿Se usan mis documentos para entrenar IA?',
            answer:
              'No. Nosotros no leemos los documentos que guardas y no se usan para entrenar ningún modelo. Se almacenan en tu cuenta, a tu alcance y al de los asistentes que conectaste, hasta que los borres, y borrar uno lo elimina en lugar de ocultarlo.',
          },
          {
            question: '¿Puede Claude borrar mis documentos?',
            answer:
              'Solo un documento cada vez, y solo con una confirmación explícita en la misma petición, así que una instrucción vaga no puede vaciar una cuenta. Una autorización de solo lectura puede listar, abrir y resumir tus documentos, pero no guardar, compartir ni borrar nada, y ese límite se aplica sobre la credencial misma y no sobre lo que se le diga a Claude.',
          },
          {
            question: '¿Qué pasa si lo desconecto?',
            answer:
              'Claude pierde el acceso de inmediato: quitar el conector en la configuración de Claude revoca la autorización. Tus documentos se quedan en tu cuenta, y los enlaces que ya compartiste siguen funcionando hasta que tú mismo los revoques. Si vuelves a conectarlo más adelante, recuperas la misma cuenta y los mismos documentos.',
          },
          {
            question: '¿Puede editar el documento alguien con quien lo compartí?',
            answer:
              'No. Un documento compartido es de solo lectura para quien lo abre: puede leer la página y descargarla, pero no cambiarla, borrarla ni volver a compartirla, y no necesita cuenta de Claude para abrirlo.',
          },
          {
            question: '¿Funciona también en Claude Code?',
            answer:
              'Sí. Un solo comando lo añade —`claude mcp add --transport http transformpipe https://transformpipe.com/api/mcp`— y la primera llamada a una herramienta abre el mismo inicio de sesión en tu navegador. Es la misma cuenta, así que un documento guardado desde Claude Code está en claude.ai y en Claude Desktop, y al revés.',
          },
          {
            question: '¿Lo ha hecho Anthropic?',
            answer:
              'No. TransformPipe es un servidor MCP independiente creado por Raudar Labs, no un producto de Anthropic. Figura en el directorio de conectores de Claude, y Claude se conecta a él igual que a cualquier conector, con el inicio de sesión estándar que define el Model Context Protocol.',
          },
        ],
      },
      middle: {
        title: 'Pruébalo con lo próximo que escriba Claude',
        text: 'Añádelo desde el directorio de conectores de Claude y pídele a Claude que guarde su respuesta. Es cosa de un minuto.',
      },
      bottom: {
        title: 'Tu próximo documento se está escribiendo ahora mismo en un chat',
        text: 'Ponlo en un sitio donde siga estando la semana que viene.',
      },
    },
    action: 'Copiar la dirección',
    seo: {
      title: 'Guarda lo que escribe Claude y compártelo por enlace — TransformPipe',
      description:
        'Añade TransformPipe a Claude como conector: guarda las respuestas de Claude en tu cuenta, con versiones, y comparte cada documento como página que cualquiera abre.',
    },
  },
  'agents-chatgpt': {
    label: 'ChatGPT',
    title: 'Guarda y comparte lo que escribe ChatGPT',
    lede: 'ChatGPT redacta el informe, el plan, el correo al equipo — y todo se queda en ese chat. Añade TransformPipe como app MCP y ChatGPT guarda cada texto en tu cuenta, conserva sus versiones y te da un enlace que se abre como una página terminada.',
    sections: [],
    landing: {
      eyebrow: 'Para ChatGPT',
      demo: {
        from: 'En el chat',
        to: 'En tu cuenta',
        title: 'Plan de lanzamiento',
        lines: [
          'Congelar la rama el viernes.',
          'Pasar las comprobaciones',
          'Publicar el lunes',
        ],
        shared: 'Compartido por enlace',
        meta: 'v1 · guardado desde ChatGPT',
      },
      useCases: {
        heading: 'Qué pedirle a ChatGPT',
        intro: 'Cuatro frases que hacen algo en cuanto añades la app. Elige TransformPipe en el menú + de un chat, o simplemente nómbralo.',
        items: [
          {
            title: 'Conserva lo que escribe ChatGPT',
            body: 'El documento entra en tu cuenta con un título que elige ChatGPT, y puedes cambiarlo después. Sigue ahí mañana, en otro dispositivo, mucho después de que el chat haya quedado atrás — y aparece como tarjeta en el chat en cuanto se guarda.',
            ask: '«Guarda esto como el plan de lanzamiento.»',
            result: 'Guardado · Plan de lanzamiento',
          },
          {
            title: 'Envía una página, no un texto pegado',
            body: 'ChatGPT pregunta antes de publicar y luego responde con la dirección. Quien la abre ve una página terminada y no necesita cuenta de ChatGPT. Compártelo por enlace o solo con las direcciones que indiques; revócalo y el enlace deja de funcionar.',
            ask: '«Compártelo por enlace para que lo lea mi equipo.»',
            result: 'Enlace creado · transformpipe.com/s/…',
          },
          {
            title: 'Encuéntralo de nuevo, en cualquier chat',
            body: 'ChatGPT muestra tus documentos en una tarjeta en la que puedes hacer clic y abre el que querías — también uno de otro chat, guardado desde Claude o convertido en la web. Pídelo por su nombre, o por algo que diga dentro del texto.',
            ask: '«¿Qué documentos tengo?»',
            result: 'Encontrados · 3 documentos',
          },
          {
            title: 'Reescribe sin perder el primer borrador',
            body: 'Una actualización se guarda como versión nueva junto a la anterior, así que el primer borrador nunca se pierde. ChatGPT puede leer las dos y decirte qué ha cambiado antes de que compartas la nueva, y el enlace antiguo sigue abriendo la antigua.',
            ask: '«Actualiza el plan y conserva la versión anterior.»',
            result: 'v1 → v2 · ambas guardadas',
          },
        ],
      },
      compare: {
        heading: 'Por qué no copiarlo sin más del chat',
        intro: 'Copiar funciona una vez. Un documento aquí sirve para todo lo que viene después.',
        left: 'Copiado del chat',
        right: 'TransformPipe',
        rows: [
          { label: 'Dónde está', left: 'Donde se pegó', right: 'En tu cuenta, fuera de cualquier chat' },
          { label: 'Encontrarlo después', left: 'Volver a recorrer chats antiguos', right: 'Buscar, o preguntar a ChatGPT en cualquier chat' },
          { label: 'Documentos de otras herramientas', left: 'Pegado otra vez en cada una', right: 'Una sola lista, lo haya escrito el asistente que sea' },
          { label: 'Compartir', left: 'Pegado en un correo o un documento', right: 'Un enlace, o solo direcciones concretas; revocable cuando quieras' },
          { label: 'Versiones', left: 'Copias guardadas a mano', right: 'Guardadas para ti, y comparadas cuando lo pides' },
          { label: 'Formato', left: 'Lo que sobrevive al pegar', right: 'Títulos, tablas y código como página terminada' },
        ],
      },
      steps: {
        heading: 'Conectado en tres pasos',
        items: [
          {
            title: 'Abre Plugins en ChatGPT',
            body: 'En la barra lateral, abre Plugins, pulsa Add y elige Create MCP App. El botón de esta página abre esa pantalla.',
          },
          {
            title: 'Dale la dirección',
            body: 'Llámala TransformPipe, pega `https://transformpipe.com/api/mcp` como Server URL y deja OAuth como autenticación. Marca que lo entiendes y pulsa Create.',
          },
          {
            title: 'Inicia sesión y pide',
            body: 'Inicia sesión en TransformPipe y permite la conexión. En un chat, elige TransformPipe en el menú +, y «guarda esto» hace lo que dice.',
          },
        ],
      },
      trust: {
        heading: 'A qué llega ChatGPT y a qué no',
        can: [
          'Guardar un documento en tu cuenta',
          'Listar, abrir y resumir tus documentos',
          'Compartir uno por enlace o con direcciones concretas',
          'Guardar una versión nueva junto a la anterior',
        ],
        cannot: [
          'Cambiar tu cuenta ni su configuración',
          'Ver tu contraseña ni crear claves API',
          'Llegar a los documentos de nadie más',
          'Borrar nada sin tu confirmación explícita',
        ],
        notes: [
          {
            title: 'Pregunta antes de actuar',
            body: 'Publicar, compartir por correo y borrar están marcados como cambios fuera del chat, así que ChatGPT te pregunta antes de cada uno; un borrado necesita además tu confirmación en el propio TransformPipe.',
          },
          {
            title: 'Desconecta con un clic',
            body: 'Desconecta ChatGPT en MCP connector, en el menú de tu cuenta de TransformPipe, y deja de actuar en tu nombre al instante. Tus documentos se quedan hasta que los borres.',
          },
          {
            title: 'Gratis, con los límites por escrito',
            body: '500 documentos y 100 MB por cuenta, 4 MB por documento. Al llegar a un límite se rechaza el guardado; no se borra nada para hacer sitio.',
          },
        ],
      },
      clients: {
        heading: 'Otros asistentes, los mismos documentos',
        intro: 'Lo que guarda ChatGPT, Claude también lo encuentra, y los demás podrán hacerlo: una sola cuenta, sea cual sea la herramienta que pregunte.',
        items: [
          {
            name: 'Claude',
            how: 'Directorio de conectores · un clic',
            body: 'claude.ai, Claude Desktop y Claude Code. TransformPipe figura en el directorio de conectores de Claude: ábrelo, pulsa «Connect», inicia sesión y pídele a Claude que guarde, publique o busque un documento.',
          },
          {
            name: 'ChatGPT',
            how: 'App MCP · añadida por dirección',
            body: 'En ChatGPT, abre Plugins, pulsa Add, elige Create MCP App e indica https://transformpipe.com/api/mcp. Tras iniciar sesión, los documentos aparecen como tarjetas en el chat. Aún no está en el directorio de ChatGPT.',
          },
          {
            name: 'Cursor',
            how: 'Servidor MCP remoto',
            body: 'Cursor añade servidores MCP remotos con inicio de sesión, pero vuelve de él al editor mediante su propio esquema de enlaces, que este servidor todavía no acepta. Esa es la parte en la que se está trabajando.',
          },
          {
            name: 'Gemini',
            how: 'Gemini CLI, MCP remoto',
            body: 'Gemini CLI añade servidores MCP remotos con un inicio de sesión en el navegador, igual que Claude Code, y es el siguiente que se va a probar.',
          },
          {
            name: 'VS Code',
            how: 'Modo agente de Copilot, MCP remoto',
            body: 'El modo agente de GitHub Copilot en VS Code se conecta a servidores MCP remotos e inicia sesión en el navegador. En pruebas.',
          },
          {
            name: 'Windsurf',
            how: 'Servidor MCP remoto',
            body: 'El asistente de Windsurf también admite servidores MCP remotos. Queda por comprobar si su inicio de sesión se completa contra este servidor.',
          },
        ],
      },
      faq: {
        heading: 'Preguntas sobre ChatGPT y TransformPipe',
        intro: 'Las respuestas cortas. La guía de configuración completa tiene el resto.',
        items: [
          {
            question: '¿Está TransformPipe en el directorio de plugins de ChatGPT?',
            answer:
              'Todavía no. Mientras tanto, añádelo tú como app MCP: abre Plugins, pulsa Add, elige Create MCP App y pega `https://transformpipe.com/api/mcp`. Tarda un minuto, y los documentos, las tarjetas y el inicio de sesión son los mismos que tendrá desde el directorio.',
          },
          {
            question: '¿Qué planes de ChatGPT pueden añadirlo?',
            answer:
              'Añadir tu propia app MCP depende de tu plan de ChatGPT y, en un espacio de trabajo, de lo que permita su administrador. Si el menú Add de Plugins no ofrece Create MCP App, tu plan o tu espacio aún no lo permite; TransformPipe no cuesta nada en ningún caso.',
          },
          {
            question: '¿Es gratis?',
            answer:
              'Sí, sin plan que elegir ni tarjeta que introducir. Una cuenta guarda 500 documentos y 100 MB de Markdown, y un documento puede ocupar hasta 4 MB. Al llegar a un límite se rechaza el guardado y se dice, en lugar de borrar en silencio un documento antiguo.',
          },
          {
            question: '¿Tengo que registrarme antes?',
            answer:
              'No. Crear la app en ChatGPT te lleva por un inicio de sesión normal, y ese inicio de sesión es la cuenta: sin registro aparte, sin clave de API y sin nada que pegar salvo la dirección. La misma cuenta funciona en la web y en Claude.',
          },
          {
            question: '¿Por qué ChatGPT pregunta antes de publicar o borrar?',
            answer:
              'Porque TransformPipe indica que esas herramientas cambian algo fuera del chat: publicar pone una página en la web, compartir con personas envía un correo y borrar no se puede deshacer. ChatGPT te pregunta antes de cada una de esas llamadas. Guardar un documento privado, listar y leer no publican nada.',
          },
          {
            question: '¿Cómo comparto lo que escribe ChatGPT como enlace?',
            answer:
              'Pídele a ChatGPT que lo comparta. Primero pregunta, luego guarda el documento, lo comparte y responde con la dirección: una página terminada con títulos, tablas y código ya formateados, no Markdown en bruto. Compártelo con quien tenga el enlace, o solo con las direcciones de correo que indiques, y revócalo cuando quieras.',
          },
          {
            question: '¿Se usan mis documentos para entrenar IA?',
            answer:
              'No por parte de TransformPipe. No leemos los documentos que guardas y no entrenan ningún modelo; se quedan en tu cuenta, al alcance tuyo y de los asistentes que conectaste, hasta que los borres. Lo que ChatGPT haga con el propio chat depende de tus controles de datos en ChatGPT.',
          },
          {
            question: '¿Qué pasa si lo desconecto?',
            answer:
              'ChatGPT pierde el acceso al instante cuando lo desconectas en MCP connector, en el menú de tu cuenta de TransformPipe. Tus documentos se quedan, y los enlaces que ya compartiste siguen funcionando hasta que los revoques. Si vuelves a añadir la app, entras en la misma cuenta.',
          },
          {
            question: '¿Funciona también con Claude?',
            answer:
              'Sí, con la misma cuenta. TransformPipe está en el directorio de conectores de Claude, y un documento guardado desde ChatGPT aparece cuando Claude lista tus documentos, y al revés.',
          },
          {
            question: '¿Lo ha hecho OpenAI?',
            answer:
              'No. TransformPipe es un servidor MCP independiente de Raudar Labs, no un producto de OpenAI. ChatGPT se conecta a él como a cualquier app MCP, con el inicio de sesión estándar que define el Model Context Protocol.',
          },
        ],
      },
      middle: {
        title: 'Pruébalo con lo próximo que escriba ChatGPT',
        text: 'Añádelo en Plugins con la dirección de abajo y pide a ChatGPT que guarde su respuesta. Tarda un minuto.',
      },
      bottom: {
        title: 'Tu próximo documento se está escribiendo ahora mismo en un chat',
        text: 'Ponlo en un sitio donde siga estando la semana que viene.',
      },
    },
    action: 'Copiar la dirección',
    seo: {
      title: 'Guarda y comparte lo que escribe ChatGPT, como enlace — TransformPipe',
      description:
        'Añade TransformPipe a ChatGPT como app MCP: guarda lo que escribe ChatGPT en tu cuenta, conserva versiones y comparte cada documento como una página.',
    },
  },
};
