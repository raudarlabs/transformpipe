---
title: "Conversor de documentos por MCP: convertir y compartir documentos desde una conversación"
description: "Cómo un conversor por MCP convierte el Markdown de un asistente en una página enviable: las ocho herramientas, el inicio de sesión sin clave y los riesgos reales"
date: 2026-09-09
tag: Automatización
keywords: conversor de documentos mcp, servidor mcp markdown a html, conector personalizado para un asistente, convertir markdown dentro de un chat, mcp con oauth, compartir un documento desde una conversación
---

Un asistente escribe Markdown todo el día. Pídele unas notas de versión, el resumen de una reunión, el primer borrador de una especificación, y lo que vuelve son almohadillas, asteriscos y barras verticales en una ventana de chat. Ahí se lee bien, porque la ventana de chat lo renderiza. En cualquier otro sitio no se lee de ninguna manera.

### Resumen rápido

Un conversor de documentos por MCP es un conector: un pequeño servidor que el asistente puede llamar, para que el Markdown que acaba de escribir se convierta en un archivo o en una página publicada sin que nadie tenga que mover texto entre dos pestañas. La forma útil son cinco verbos —convertir, guardar, compartir, listar, recuperar— y lo delicado no es la conversión sino la autorización, que debería ser un permiso que se puede revocar y no una clave de larga vida que pegaste en algún sitio. Es genuinamente cómodo y es genuinamente una concesión permanente para actuar en tu nombre, lo que significa que un documento que el modelo lee puede intentar convencerlo de usar tus herramientas. Usa un conector para el documento que ya existe dentro de una conversación, y una API, una CLI o un paso de compilación para todo lo demás.

El arreglo habitual es copiarlo fuera. Seleccionar la respuesta, copiar, buscar un conversor, pegar, esperar, descargar, renombrar el archivo, adjuntarlo, darte cuenta de que la tabla salió como un párrafo de barras verticales, volver atrás y repetir. Cada uno de esos pasos funciona. La secuencia es el problema, y es el paso que sigue rompiéndose —la copia que arrastra medio bloque de código, el pegado que llega con el formato del chat pegado encima, el archivo llamado `descarga (3).html`. Esa fricción tiene su propio artículo: [qué pasa en realidad cuando mueves la salida de un modelo a un documento](/blog/ai-output-to-a-shareable-page) cubre la vía manual y lo que cuesta, y esta pieza no lo repite.

Lo raro de la vía manual es que el asistente ya es un programa que llama a otros programas. Lee archivos, hace búsquedas, abre pull requests. Lo único que normalmente no puede hacer es entregarte el documento que acaba de escribir en una forma que una persona pueda abrir. No porque sea difícil, sino porque nadie conectó el conversor.

Ese es el hueco que cierra un conector, y el resto de este artículo trata sobre cómo es uno bueno, qué se le permite hacer en tu nombre, y los casos donde recurrir a él es el instinto equivocado.

## Qué es MCP, en llano

El Model Context Protocol es «un estándar de código abierto para conectar aplicaciones de IA con sistemas externos» (comprobado en modelcontextprotocol.io, el 9 de septiembre de 2026). Esa es toda la idea. Antes de esto, cada asistente tenía su propio formato de plugin, y cada proveedor de herramientas escribía la misma integración varias veces. Un protocolo compartido significa que una herramienta se construye una vez y se puede usar desde cualquier cosa que hable ese protocolo.

Tiene una forma cliente-servidor, con tres participantes con nombre en lugar de dos. El host es la aplicación de IA; crea un cliente por cada servidor, y cada cliente mantiene una conexión dedicada a su servidor, que es «un programa que da contexto a los clientes MCP» (comprobado en modelcontextprotocol.io, el 9 de septiembre de 2026). En la práctica, «host» se puede leer como el asistente en el que estás escribiendo, «cliente» como la parte de él que habla con una herramienta en concreto, y «servidor» como la herramienta.

| Participante | Qué es | En este artículo |
| --- | --- | --- |
| Host | La aplicación de IA, coordinando uno o varios clientes | El asistente con el que hablas |
| Cliente | Mantiene una conexión y obtiene contexto de un servidor | Creado por el host, no algo que configures tú directamente |
| Servidor | Un programa que da contexto y herramientas | El conversor |

Un servidor expone hasta tres tipos de cosas: herramientas, que son funciones ejecutables que la aplicación puede invocar para realizar acciones; recursos, que son fuentes de datos que dan contexto; y prompts, que son plantillas reutilizables (comprobado en modelcontextprotocol.io, el 9 de septiembre de 2026). Un conversor es casi todo herramientas. Convertir es una acción con un efecto sobre el mundo —existe un archivo que antes no existía—, que es justo para lo que sirve una herramienta.

Hay dos transportes. Stdio «usa flujos estándar de entrada y salida para comunicación directa entre procesos locales en la misma máquina», y Streamable HTTP «usa POST de HTTP para los mensajes de cliente a servidor, con eventos enviados por el servidor opcionales para funciones de streaming», lo que «permite comunicación con un servidor remoto y admite los métodos de autenticación HTTP habituales, incluidos tokens portador, claves de API y cabeceras personalizadas», recomendando OAuth para obtener esos tokens (comprobado en modelcontextprotocol.io, el 9 de septiembre de 2026).

Esa distinción decide cómo se siente instalar un conector. Un servidor stdio es un proceso en tu máquina: lo instalas, se ejecuta cuando el asistente lo arranca, y puede llegar a tu sistema de archivos porque está parado dentro de tu sistema de archivos. Un servidor HTTP es una URL: no se instala nada, es el mismo servidor para todo el que lo añade, y la pregunta interesante pasa a ser cómo sabe quién está preguntando. Un conversor de documentos alojado es del segundo tipo, que es por lo que la mayor parte de este artículo trata de esa pregunta.

Hay dos cosas que MCP deliberadamente no es. No es una forma de ejecutar un modelo — el protocolo «se centra únicamente en el protocolo de intercambio de contexto» y no dicta cómo las aplicaciones usan los modelos ni gestionan el contexto (comprobado en modelcontextprotocol.io, el 9 de septiembre de 2026). Y no es un sistema de permisos. Lleva autorización, pero no define nada sobre si el modelo debía haber llamado a la herramienta que acaba de llamar. Ese juicio sigue siendo del autor de la herramienta y tuyo.

## Cuánto vale un conversor como conector

El argumento a favor de conectar un conversor de documentos no es que convertir sea difícil. Es que el documento ya está dentro de la conversación, y todo lo que harías después es una aplicación distinta.

Cinco verbos cubren casi todo. Convertir, para que el Markdown se vuelva una página. Guardar, para que tenga una dirección en lugar de vivir en un búfer de scroll. Compartir, para que otra persona pueda abrirlo. Listar, para que el asistente pueda responder «qué tengo». Recuperar, para que un documento escrito hace tres semanas se pueda editar en lugar de reescribirse de memoria. Con esos cinco, el modelo termina el trabajo dentro de la conversación en lugar de entregarle al lector un muro de asteriscos y desearle suerte.

El conector de TransformPipe expone ocho herramientas, y el reparto es deliberado: dos hacen trabajo, cuatro responden preguntas, y dos cambian lo que otras personas pueden ver o si un documento existe siquiera.

| Herramienta | Para qué sirve | Qué puede causar |
| --- | --- | --- |
| `tp_help` | Responde preguntas sobre cómo funciona el producto, a partir de su documentación y no de memoria | Nada. Lee secciones de documentación y las devuelve |
| `tp_convert_markdown` | Markdown dentro, HTML saneado fuera; opcionalmente el documento completo autocontenido | No se guarda nada. La salida viaja de vuelta por la conversación, así que un documento largo cuesta contexto |
| `tp_save_document` | Guarda Markdown en la cuenta, y lo publica en la misma llamada si se le pide | Escribe un documento. Con un modo de compartir, publica una página en la web pública |
| `tp_list_documents` | Qué hay en la cuenta —nombres, tamaños, fechas, si cada uno está compartido— con el id que aceptan las demás herramientas | Lee. Revela la lista de documentos a la conversación |
| `tp_get_document` | Un documento, por id, como su fuente en Markdown o como HTML renderizado | Lee. Trae un documento entero a la conversación |
| `tp_share_document` | Cambia quién puede abrir un documento: un enlace, direcciones concretas, o nadie | Publica o retira. Revocar rompe una URL ya enviada |
| `tp_usage` | Qué está usando la cuenta contra sus límites | Lee. Merece preguntarse cuando se rechaza un guardado |
| `tp_delete_document` | Borra un documento, de forma permanente | Destruye datos. Exige una confirmación explícita, y elimina exactamente uno |

Dos detalles estructurales importan más que la lista en sí.

El primero es que las herramientas no son una segunda implementación de nada. Cada una llama a la propia API pública de la aplicación, en el mismo proceso, con la credencial de quien llama reenviada, así que una conversación y un script reciben la misma respuesta del mismo código. Suena a un detalle interno de limpieza y no lo es. Una herramienta que consultara la base de datos directamente sería una segunda implementación de «de quién son estos documentos», y esa es la pregunta a la que menos conviene tener dos respuestas. El mismo razonamiento se aplica a la conversión en sí: el HTML que devuelve una herramienta es el HTML que produce la página del navegador, saneado contra la misma lista de permitidos, porque es el mismo renderizador.

El segundo es `tp_help`. Un modelo al que se le pregunta cómo funciona un producto va a responder con lo que absorbió durante el entrenamiento, que para cualquier producto más joven que su fecha de corte es una descripción segura de algo que no existe. Una herramienta de documentación convierte eso en una consulta. Es la herramienta menos vistosa de la tabla y la que evita más respuestas equivocadas.

## Añadirlo, y el inicio de sesión que no lleva clave

La dirección es el despliegue más `/api/mcp`:

```
https://transformpipe.com/api/mcp
```

En claude.ai eso va en Ajustes → Conectores → Añadir conector personalizado. Desde una terminal:

```
claude mcp add --transport http transformpipe https://transformpipe.com/api/mcp
```

Eso es toda la configuración. No hay ninguna clave que pegar, y la ausencia es justo el punto.

Bajo esa dirección, el transporte es JSON-RPC sobre un único POST, sin flujo de eventos. Cada herramienta de aquí responde desde la base de datos o desde el almacenamiento de blobs en un único viaje de ida y vuelta, así que lo único que compraría un flujo sería informar del progreso de un trabajo que no tiene pasos intermedios que informar. Un `GET` recibe un 405, que es una manera conforme de decir que no hay flujo en esa dirección.

### Qué pasa en la primera llamada

La primera llamada no lleva token, y lo que vuelve es un 401. El estado es la señal del protocolo, y merece decirse con claridad porque es la forma más habitual en que falla un conector hecho a mano: un 200 que lleva dentro un error educadamente redactado se interpreta como una herramienta que falló, y nunca arranca un inicio de sesión. Solo el código de estado lo hace.

El 401 lleva una cabecera `WWW-Authenticate` que nombra un documento de recurso protegido y los ámbitos que pide —`documents:read documents:write`. A partir de ahí el cliente recorre una cadena de documentos bien conocidos para averiguar dónde iniciar sesión, se registra, y manda a la persona a una página del sitio.

El orden de los pasos, que no es obvio a partir de ninguna parte suelta:

1. El cliente hace POST al endpoint sin token y recibe un 401 más una cabecera `WWW-Authenticate` que nombra el documento de recurso protegido.
2. Lee `/.well-known/oauth-protected-resource` para encontrar el servidor de autorización, y luego `/.well-known/oauth-authorization-server` para encontrar los endpoints de ese servidor.
3. Se registra y recibe un `client_id`. No se emite ningún secreto: un cliente que corre en la máquina de otra persona no puede guardar uno, que es para lo que sirve PKCE.
4. Manda a la persona a `/authorize` con un desafío PKCE. Si no ha iniciado sesión, la deja aparcada y la hace pasar antes por el propio inicio de sesión de la aplicación.
5. La persona aprueba —con un POST desde una página que realmente leyó, así que un enlace suelto no autoriza nada.
6. El cliente intercambia el código y su verificador por un token de acceso y un token de refresco.

El sitio tiene que ser su propio servidor de autorización para esto, en lugar de entregar la sesión que ya tiene. La especificación de autorización prohíbe que un recurso acepte un token emitido por cualquier otra parte, así que la persona inicia sesión exactamente como siempre lo hace, aprueba un cliente con nombre en una página que miró, y el cliente se va con un token hecho por el propio sitio.

### Lo que el cliente consigue en realidad

Un token que actúa como esa persona, para sus documentos, y no llega a nada más. No a la cuenta. No al inicio de sesión al que está pegada la cuenta. No a las claves de API, que son una credencial aparte para un propósito aparte. Los tokens de acceso se emiten con una vida de treinta días y los de refresco con ciento ochenta, así que un conector que usas sigue funcionando y uno que olvidas termina por dejar de funcionar.

Revocar está en el menú de la cuenta, bajo claves de API, y hace efecto en la siguiente llamada en lugar de al final de alguna ventana de caché.

Dos detalles de la página de consentimiento existen por ataques concretos y no por buen gusto. La página nombra la dirección con la que el cliente está a punto de actuar, porque un «aprobar» sin sujeto no es consentimiento. Y el propio nombre del cliente se limpia de caracteres de control y de sobrescrituras bidireccionales antes de mostrarse, porque un cliente podría registrarse a sí mismo terminando en una sobrescritura de derecha a izquierda y hacer que la página muestre una mentira —un problema que escapar el HTML no resuelve en absoluto.

### Por qué esta forma y no una clave

Un conector que guarda una clave de API de larga vida que pegaste es una credencial en un sitio que vas a olvidar. Se queda en un archivo de configuración, o en los ajustes de un asistente alojado, y es tan fuerte como la clave que pegaste —que, si pegaste la que ya tenías, es la misma clave que usan tus scripts de despliegue. Rotarla rompe las dos cosas. Auditarla te dice que se usó una clave, no qué cliente la usó.

Un cliente aprobado es un objeto distinto. Tiene un nombre que puedes leer, un ámbito más estrecho que el de la cuenta, su propia caducidad, y un botón de revocar que no rompe nada más que sea tuyo. Cuando miras la lista en seis meses y no reconoces una entrada, puedes quitar solo esa entrada. Ese es todo el argumento, y merece el paso extra en el flujo.

## Las dos herramientas hechas a medida del problema que pueden causar

Seis de las ocho herramientas son normales. Dos no lo son, y están escritas de forma distinta a propósito.

**Compartir publica una página en la web pública.** Hay tres modos, y la transición entre ellos es la parte que la gente hace mal.

| Modo | Quién puede abrirlo | La consecuencia que conviene saber |
| --- | --- | --- |
| `private` | Solo el propietario | Revoca por completo un enlace existente, así que una URL ya enviada deja de funcionar |
| `link` | Cualquiera que tenga la URL | Está en la web pública. Una URL no es una contraseña, y los enlaces viajan |
| `people` | Solo las direcciones dadas | La lista de direcciones se sustituye, no se añade — envía la lista completa cada vez |

Guardar puede publicar en la misma llamada, lo cual es cómodo y es justo por lo que las propias instrucciones del servidor al modelo dicen que solo se comparta un documento cuando la persona lo pidió. Una herramienta que guarda y publica en un solo paso es una herramienta que puede convertir «guarda esto» en «publica esto» a través de una sola frase mal leída. La mitigación no es ingeniosa: la descripción dice lo que hace en la primera línea, el modo es una enumeración explícita y no un booleano llamado `public`, y la respuesta al modelo dice en qué modo quedó el documento y cuál es su URL, así que el resumen del asistente hacia ti es una frase que puedes comprobar.

**Borrar exige una confirmación explícita y elimina exactamente un documento.** `confirm: true` es obligatorio, y sin él la herramienta se niega y le dice al modelo que vaya a preguntar. No hay deshacer y no hay papelera. Y no hay ninguna herramienta que borre varios —ni comodín, ni «borra todos los compartidos», ni rango de fechas. Esa es una ausencia deliberada y no una función que falte. Un borrado masivo es la única herramienta donde una sola instrucción mal entendida destruye trabajo que no se puede recuperar, y un conector que no puede expresar la instrucción no puede llevarla a cabo.

La confirmación es una mitigación real y parcial, que es el tema de la siguiente sección. Detiene un borrado accidental, porque un accidente normalmente no incluye marcar una casilla de confirmación. No detiene un borrado al que el modelo fue convencido, porque un modelo al que se ha convencido de borrar algo va a pasar `confirm: true` con la misma facilidad con que pasa el id.

## Dónde falla un conector, y qué cuesta eso

Un conector es una concesión permanente para actuar en tu nombre. Eso no es una advertencia al pie de la página; es lo que es la cosa. Una vez añadido, el asistente puede llamar a esas herramientas cuando lo juzgue oportuno, en una conversación que no necesariamente estás leyendo con atención, sobre la base de un texto que no necesariamente escribiste tú.

**A un modelo se le puede convencer de usar tus herramientas mediante el documento que está leyendo.** Esto es inyección de instrucciones, y no es hipotético para un conversor de documentos, porque leer documentos es el trabajo entero. Alguien te manda un archivo Markdown. Le pides al asistente que lo convierta y lo publique. En algún punto en medio de ese archivo, en un comentario o un bloque de código o texto blanco sobre blanco, hay un párrafo dirigido al modelo en lugar de a ti. El modelo está ahora procesando instrucciones de un desconocido mientras sostiene un token que actúa como tú.

Las mitigaciones son reales, y son parciales. Enunciarlas con honestidad significa enunciar las dos mitades.

| Mitigación | Qué evita de verdad | Qué no evita |
| --- | --- | --- |
| Un token limitado a los datos de un producto | Llegar a tu correo, tus repositorios, tus otras cuentas, o las claves de API de la misma cuenta | Cualquier cosa dentro del ámbito: leer, publicar y borrar tus documentos |
| Una confirmación explícita en la herramienta destructiva | El borrado accidental, y el borrado casual que la persona nunca pidió | Un borrado al que el modelo fue persuadido y que él mismo confirma |
| Que compartir sea visible y revocable | Que una publicación se mantenga en secreto para ti, o que sea permanente | La ventana entre publicar y que te des cuenta. Una página copiada se queda copiada |
| Sin operaciones masivas | Que una sola instrucción destruya muchos documentos | Llamadas individuales repetidas, si nadie está mirando la transcripción |
| Que la persona lea lo que dice el asistente que hizo | La mayor parte, en la práctica, si la persona realmente lo lee | Cualquier cosa en una conversación que nadie revisó, que es la mayoría de las conversaciones largas |

Esa última fila hace más trabajo que las demás, y es la menos fiable. El resumen honesto es que la seguridad de un conector descansa hoy en un ámbito estrecho más una persona que presta atención, y la segunda mitad se degrada justo con la carga de trabajo que hace que un conector merezca la pena.

Hay tres costes más que no tienen nada que ver con la inyección.

**Es otro servicio guardando tus documentos.** Sin sesión iniciada, la conversión en el navegador de este sitio no envía nada a ningún sitio: el archivo se lee, convierte y renderiza en tu propia máquina, y puedes ver la pestaña de red quedarse vacía mientras pasa. Un conector es el arreglo opuesto por necesidad. Guardar un documento significa una cuenta, una cuenta significa almacenamiento, y almacenamiento significa una empresa guardando el texto que escribiste. Para un README, eso es irrelevante. Para un contrato, la nota de un paciente o un plan sin publicar, es la pregunta entera, y la respuesta correcta puede ser convertir en el navegador y no guardar nunca nada.

**El documento entra en la conversación.** `tp_convert_markdown` devuelve la salida convertida por el mismo canal que todo lo demás, lo que significa que un documento largo pasa a formar parte de una transcripción guardada por quien sea que alberga el asistente. La herramienta recorta el texto devuelto a cuarenta mil caracteres y dice cuánto quitó, en lugar de truncar en silencio —el truncado silencioso se lee como algo completo, que es peor que un hueco visible—, pero recortar es una gentileza para la ventana de contexto, no un control de privacidad. Para cualquier cosa larga, guardarla y compartir el enlace es más barato y menos expuesto.

**Sanear sigue siendo tu problema para entender, no para ejecutar.** El HTML sin procesar en una fuente Markdown pasa por un saneador con una lista fija de permitidos antes de llegar a una página, así que una etiqueta `<script>` en un archivo que te mandó alguien no sobrevive a la conversión. Eso es una propiedad del conversor y no del conector, y merece la pena leer [cómo funciona sanear y dónde tiene que pasar](/blog/sanitising-markdown-safely) si estás convirtiendo archivos que no escribiste. Lo que el saneador no puede hacer es decirte que la propia prosa iba dirigida a tu asistente.

## Los límites, y por qué uno de ellos es 4 MB

El conector no es un producto aparte con techos aparte. Las mismas cifras se aplican tanto si un documento llega desde una pestaña del navegador, un script o una conversación, que es el único arreglo que no produce tickets de soporte.

| Límite | Valor | Por qué es ese número |
| --- | --- | --- |
| Por conversión | 10 MB | La conversión corre en el navegador, así que esto es un juicio sobre la máquina de la persona y no una regla de la plataforma. Varios archivos soltados juntos cuentan como el único documento en que se convierten |
| Por documento guardado | 4 MB | No es una política. La plataforma rechaza una petición o una respuesta de más de 4,5 MB antes de que se ejecute ningún código de la aplicación, así que un documento más grande no podría ni guardarse ni recuperarse |
| Por cuenta | 100 MB, 500 documentos | Los bytes y las filas están limitados por separado: mil archivos diminutos cuestan filas reales |
| Por quien llama | 60 llamadas por minuto | Quien dispara esto está en bucle, no trabajando |
| Texto devuelto | 40.000 caracteres | La respuesta de una herramienta tiene que viajar por la conversación, y un documento no debería devorarla |

La cifra de 4 MB es la que merece entenderse, porque es el único límite que no es una elección. Está fijado por debajo de los 4,5 MB propios de la plataforma en lugar de en ese mismo punto, para que el rechazo llegue desde la aplicación con los dos tamaños nombrados dentro en lugar de como un rechazo desnudo desde más abajo —que es la diferencia entre un modelo que puede decirte qué hacer a continuación y uno que reporta un fallo que no puede explicar. Un documento por encima de ese tamaño sigue convirtiéndose, sigue previsualizándose y sigue descargándose —la conversión corre en tu navegador, donde no interviene ninguna petición—, solo se queda fuera del historial guardado, y la aplicación lo dice en lugar de reportar un guardado que no ocurrió. Un conector hereda eso exactamente: `tp_convert_markdown` va a manejar un archivo que `tp_save_document` rechaza.

Si un guardado se rechaza, `tp_usage` es la herramienta que dice por qué, en forma de bytes y documentos contados contra el techo de cada uno. Existe porque «no se guardó» es una frase que un modelo va a interpretar con creatividad si no se le da nada más.

Una propiedad más que es fácil pasar por alto: la exportación es un archivo completo y no un fragmento. Doctype, cabecera, estilos en línea, sin peticiones externas. Eso es lo que hace que un documento convertido sobreviva a que lo manden por correo, se abra sin conexión, o se lea en una máquina que nunca ha visto el sitio —y es [una propiedad concreta con contrapartidas concretas](/blog/self-contained-html-explained) y no una frase de marketing.

## Cuándo un conector es la herramienta equivocada

Un conector es para el documento que existe dentro de una conversación. Ese es un caso más estrecho de lo que parece a primera vista, y recurrir a él fuera de ese caso produce lo peor de los dos arreglos: una persona en el medio, más un paso no determinista en medio de todo.

| El trabajo | La herramienta correcta | Por qué no un conector |
| --- | --- | --- |
| Un script convierte documentos como parte de algo más grande | La [API REST](/blog/converting-documents-with-an-api) | Un script no necesita un modelo para decidir nada. Necesita un código de estado y un cuerpo |
| Una carpeta de archivos, para convertir ahora | La [línea de comandos](/blog/markdown-to-html-from-the-command-line) | Cien archivos son un bucle, no cien llamadas a herramientas. Es más rápido, más barato y repetible |
| Un repositorio publica en cada push | La [GitHub Action](/blog/publish-markdown-from-github-actions) | El disparador es un commit, y no hay nadie en la conversación a quien preguntar |
| Un documento que ya tienes en el disco, una sola vez | La página del navegador | Añadir un conector para convertir un archivo es más configuración que el propio trabajo |

La prueba es dónde está el documento en el momento en que quieres convertirlo. Si está en el disco, en un repositorio o en una variable, un programa debería convertirlo. Si solo existe como texto que un modelo acaba de producir, entonces sacarlo para convertirlo y volver a meterlo para hablar de él es otra vez el problema de copiar y pegar, con otro disfraz.

Como referencia, los servidores MCP publicados junto al protocolo muestran cómo es el caso local con forma de stdio: Filesystem, «operaciones de archivo seguras con controles de acceso configurables»; Git, «herramientas para leer, buscar y manipular repositorios Git»; Fetch, «obtención y conversión de contenido web para un uso eficiente por parte de LLM»; además de Memory, Time, Sequential Thinking y un servidor de pruebas Everything (comprobado en github.com/modelcontextprotocol/servers, el 9 de septiembre de 2026). Fíjate en el reparto de trabajo. Filesystem y Git ya llegan a tu disco y a tu repositorio, así que un documento que vive en cualquiera de los dos no necesita un conversor alojado para traerlo — necesita uno para convertir lo que esas herramientas ya entregaron, o nada en absoluto.

## Cómo juzgar un conector de documentos

1. **Comprueba si se puede revocar sin romper otra cosa.** Un conector que reutiliza tu clave de API ya existente significa que rotar esa clave también mata tus scripts de despliegue, y lo vas a descubrir en el peor momento; un conector que tiene su propia aprobación se puede quitar por una simple duda sin ninguna consecuencia.
2. **Lee la descripción de la herramienta destructiva antes de añadirla.** Si borrar no exige confirmación, o si hay una herramienta que borra más de una cosa a la vez, entonces una sola instrucción mal leída en una conversación larga es una pérdida de datos irrecuperable en lugar de un error molesto.
3. **Averigua si compartir es un paso aparte o una marca sobre guardar.** Cualquiera de las dos es defendible, pero un guardado que publica en la misma llamada necesita que el modo se nombre explícitamente en la respuesta, o «lo guardé» y «lo publiqué en internet» son la misma frase para quien lee el resumen.
4. **Pregunta qué devuelven las herramientas a través de la conversación.** Una herramienta que entrega documentos enteros va a llenar la ventana de contexto y va a poner tu texto en la transcripción, así que un conector que devuelve una URL para cualquier cosa larga te está haciendo un favor que se nota en menos coste y menos exposición.
5. **Confirma que los límites coinciden con el resto del producto.** Un conector con sus propios techos más bajos va a rechazar algo que el sitio web aceptó, y el fallo llega como una disculpa vaga del modelo en lugar de un error que puedas resolver.
6. **Decide, antes de añadirlo, qué documentos estás dispuesto a tener guardados.** Un conector que guarda es un servicio que guarda tu texto, y la única versión de esa decisión que sobrevive a una semana ocupada es la que tomaste de antemano, no la que tomas mientras pegas algo.

## Conclusión

Un conector se gana su lugar cuando el documento ya está dentro de la conversación y cualquier alternativa implica a una persona moviendo texto entre dos ventanas. Lo que lo hace valioso y no solo ingenioso es lo poco vistoso: un token que cubre los documentos de un solo producto y nada más, una aprobación con un nombre encima y un botón de revocar que no rompe nada, una herramienta destructiva que pregunta, y un compartir que dice en voz alta qué acaba de publicar. Esas son las propiedades que hay que comprobar en cualquier conector, no solo en este. Si prefieres mantener el documento en tu propia máquina, la misma conversión corre en el navegador y [no se sube nada cuando no has iniciado sesión](/) — y si el trabajo es un script, una carpeta o un repositorio, usa la API, la CLI o la Action en su lugar, y deja la conversación para los documentos que solo existen ahí.

## Preguntas frecuentes

### ¿Qué es un conversor de documentos por MCP?

Es un conversor de documentos expuesto como servidor MCP, para que un asistente pueda llamarlo como herramienta en lugar de que una persona convierta el archivo a mano. En la práctica significa que el modelo puede convertir el Markdown que acaba de escribir en HTML, guardarlo, publicarlo como página y recuperarlo más tarde, todo dentro de la conversación donde ya está el texto.

### ¿Necesito una clave de API para añadir el conector?

No. La primera llamada vuelve sin autorizar, el asistente sigue eso hasta una página del sitio, y tú inicias sesión con la cuenta que ya usas y apruebas un cliente con nombre. El cliente recibe un token válido para tus documentos y nada más, y lo revocas desde el menú de la cuenta, bajo claves de API.

### ¿Puede un asistente publicar mi documento sin preguntar?

Puede, y por eso las herramientas están hechas como están: guardar puede publicar en la misma llamada, y las instrucciones del servidor le dicen al modelo que solo comparta cuando la persona lo pidió. Compartir es visible en tu lista de documentos y revocable, y poner un documento de nuevo en privado detiene que un enlace ya enviado se pueda abrir — pero una página que se copió mientras era pública se queda copiada.

### ¿Qué pasa si mi documento es más grande que el límite?

La conversión tiene un tope de 10 MB y un documento guardado uno de 4 MB, así que un archivo entre esos dos tamaños se convierte y se descarga pero no se puede conservar en la cuenta. Ese segundo límite es de la plataforma y no una política: una función rechaza una petición o una respuesta de más de 4,5 MB antes de que corra nada del código de la aplicación, así que el documento no podría ni guardarse ni recuperarse.

### ¿Es un conector más seguro que pegar en un conversor online?

Fallan de maneras distintas. Pegar arriesga la copia en sí —medio bloque de código, una tabla estropeada, la pestaña equivocada—, mientras que un conector arriesga que se use una concesión permanente a partir de un texto que no escribiste tú, que es inyección de instrucciones. Convertir en el navegador sin haber iniciado sesión no sube nada en absoluto, y para un documento que no puedes permitirte guardar en ningún sitio, eso sigue siendo la opción más fuerte.

### ¿Un conector MCP solo funciona con un asistente?

No. MCP es un estándar abierto compatible con muchos clientes, así que un servidor remoto al que se llega por HTTP funciona con cualquier cosa que hable el protocolo y pueda completar el inicio de sesión. Lo que cambia entre aplicaciones es dónde pegas la dirección y cómo presentan el paso de aprobación, no el servidor.

### ¿Qué debería hacer si el conector deja de funcionar?

Comprueba primero la aprobación: un cliente revocado, o un token de refresco que ya cumplió su vida, produce exactamente la misma respuesta sin autorizar que un conector recién añadido, y volver a aprobarlo lo soluciona. Si autoriza y luego se niega a guardar, pídele al asistente que llame a la herramienta de uso, que reporta bytes y documentos contados contra el techo de la cuenta en lugar de dejar que el modelo adivine.

### ¿Convertir por un conector ahorra algo de verdad?

Tokens, y la cantidad es aritmética y no una afirmación. Una llamada de herramienta que devuelve un
enlace pone once tokens en la transcripción donde el documento mismo habría puesto miles — y la
transcripción se reenvía en cada turno posterior, así que la diferencia se acumula.
[Lo que un documento le cuesta a un asistente](/blog/what-a-document-costs-an-assistant) hace la
cuenta, incluido el caso en que el modelo sí tiene que leer el documento y el ahorro es cero.
