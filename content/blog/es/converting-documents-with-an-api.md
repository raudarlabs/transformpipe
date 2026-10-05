---
title: "Convertir documentos con una API: qué hace que una sea utilizable"
description: "Qué exige una API de conversión de documentos para que un script confíe en ella: cuerpo honesto, errores reales, límites publicados y un documento recuperable"
date: 2026-08-13
tag: Automatización
keywords: api de conversión de documentos, api markdown a html, convertir documentos por api rest, api de conversión de archivos, subir archivos en el cuerpo de una petición, idempotencia en conversión de archivos, límite de tamaño en funciones serverless
---

Una conversión que pasa en una pestaña del navegador es una conversión que hizo una persona una vez. La versión interesante es la que pasa en cada fusión, en cada versión publicada, con cuatrocientos archivos a las dos de la madrugada, sin que nadie mire. Esa versión es una petición, y las peticiones fallan de maneras que una página nunca falla.

### Resumen rápido

Una API de conversión de documentos es utilizable cuando se cumplen cuatro cosas: el cuerpo de la petición es el documento y no un envoltorio dentro de otro envoltorio, un archivo roto vuelve como un código de estado y una frase que una persona puede leer, los límites están publicados en lugar de descubrirse en producción, y el resultado tiene una URL que se puede volver a pedir mañana. Envía el archivo en crudo como cuerpo cuando la conversión ya está nombrada en la ruta o en la consulta, y reserva un sobre JSON para el único caso en que el cuerpo sería ambiguo de otra manera. Prevé el techo de tamaño de la petición antes de que un archivo de 6 MB lo descubra por ti — en una plataforma serverless ese techo está alrededor de 4,5 MB, y se aplica por encima de tu código, así que el error no es cosa tuya redactarlo.

La fricción casi nunca es la conversión en sí. Analizar Markdown y sacar HTML es un problema resuelto con media docena de buenas librerías detrás. Lo que se rompe es todo lo que rodea al análisis: un paso de compilación que envía un archivo y recibe un 200 con el cuerpo vacío, una tarea nocturna que trunca en silencio a cualquier tamaño que la plataforma decida rechazar, un reintento que convierte un documento en tres porque el primer intento agotó el tiempo después de haber tenido éxito.

Los fallos tienen una forma. Un cliente no puede distinguir un 500 de un 413 si la plataforma responde antes de que se ejecute tu propio código. Un cliente no puede distinguir «tu archivo no es JSON válido» de «nuestro almacenamiento está caído» si las dos llegan como la misma cadena de error plana. Y un cliente no puede comportarse bien frente a unos límites que tiene que inferir de una serie de rechazos, que es lo que significa «contáctanos para más detalles» en la práctica.

Así que esta pieza trata sobre el contrato y no sobre el analizador. Donde ayuda un ejemplo concreto, usa nuestra propia `/api/v1`, porque es la única cuyo código y cuyos mensajes de rechazo puedo citar exactamente en lugar de suponerlos.

## La pregunta del cuerpo de la petición, forma por forma

### Comparativa rápida: la chuleta

Toda API de conversión responde primero a una pregunta: ¿adónde va el archivo? Las siete respuestas de abajo son todo el espacio posible, y la elección decide cuán grande puede ser un documento, cuán buenos pueden ser tus mensajes de error, y cuánto código escribe quien llama antes de que se convierta nada.

| Forma | El cuerpo se parece a | Mejor para | Dónde se rompe |
| --- | --- | --- | --- |
| El archivo en crudo como cuerpo | El archivo, byte a byte, con `Content-Type` nombrándolo | Una conversión con nombre: un archivo entra, un documento sale | Los metadatos no tienen dónde ir salvo la cadena de consulta |
| Sobre JSON | `{"name": "…", "markdown": "…"}` | Quien llama tiene varios campos que enviar | El documento hay que escaparlo dentro de una cadena JSON; el cuerpo es ambiguo cuando el propio documento es JSON |
| `multipart/form-data` | Una parte de archivo más partes de texto | Formularios de navegador, varios archivos a la vez | Cada cliente necesita un codificador multipart; analizarlo cuesta memoria en el servidor |
| Base64 dentro de JSON | `{"file": "PGh0bWw+…"}` | Formatos binarios a través de clientes que solo hablan JSON | Aproximadamente un tercio más grande en el cable, contra un techo de cuerpo fijo |
| Una URL para que el servidor la busque | `{"url": "https://…"}` | Documentos que ya están en la red | El servidor se convierte en un cliente HTTP apuntado adonde tú digas, lo cual es un riesgo de falsificación de peticiones |
| Subida directa, y luego una referencia | `{"blob": "uploads/ab12…"}` | Archivos por encima del techo de la petición | Dos viajes de ida y vuelta, una URL firmada que emitir, y subidas huérfanas que limpiar |
| Un lote en forma de array | `{"documents": [ … ]}` | Cientos de archivos pequeños | Un archivo malo en el array obliga a una forma de respuesta de fallo parcial que nadie disfruta escribiendo |

Nada de esto está mal en abstracto. El error es elegir dos de estas formas para el mismo endpoint y dejar que decida el tipo de contenido, sin decirlo — alguien que envía un `.json` para convertir, con el honesto `Content-Type: application/json`, se lee entonces como un sobre, se descubre que no tiene ningún campo de documento, y se rechaza por una razón que no tiene sentido desde fuera.

### El archivo en crudo como cuerpo

El documento es el cuerpo. Nada lo envuelve, nada lo escapa, y `curl --data-binary @archivo.md` es el cliente entero. El nombre y las opciones viajan en la cadena de consulta, donde son visibles en una línea de registro y fáciles de cambiar a mano.

| A favor | En contra |
| --- | --- |
| Sin escapado: un archivo con comillas, acentos graves y líneas CRLF llega intacto | Los metadatos tienen que vivir en la cadena de consulta, que tiene sus propios límites de longitud |
| El cuerpo más pequeño posible, lo cual importa contra un techo fijo | Solo un archivo por petición |
| Depurable por una persona con `curl` y sin SDK | El servidor no debe adivinar el formato a partir de los bytes y equivocarse |

**¿Para quién es?** Para cualquiera cuya conversión ya está nombrada — por la ruta, o por un parámetro de consulta como `?kind=html-to-markdown`. Si el endpoint ya sabe qué se supone que es el cuerpo, el cuerpo no tiene por qué explicarse a sí mismo.

La nuestra usa esta forma primero. `POST /api/v1/documents` lee el cuerpo de la petición como el origen, toma el nombre del archivo de `?name=`, y toma la conversión de `?kind=`, que acepta `html-to-markdown`, `csv-to-markdown` y `json-to-markdown`; sin ningún `kind`, el cuerpo es Markdown, que es lo que era cada documento antes de que hubiera más de una conversión.

```bash
curl -fsS \
  -H "Authorization: Bearer $TP_API_KEY" \
  -H "Content-Type: text/markdown" \
  --data-binary @README.md \
  "https://transformpipe.com/api/v1/documents?name=README.md&share=link"
```

### El sobre JSON

El documento se convierte en un campo de cadena dentro de un objeto. Es la forma a la que recurre casi todo cliente de API por defecto, porque es la forma que ya usa el resto de su propio código.

| A favor | En contra |
| --- | --- |
| Varios campos sin tocar la cadena de consulta | El documento hay que escaparlo y volverlo a escapar en cada capa |
| Un único tipo de contenido familiar para toda la API | Un documento JSON como carga colisiona con el propio sobre |
| Fácil de extender sin un cambio incompatible | Más grande en el cable en cuanto los saltos de línea se vuelven `\n` |

**¿Para quién es?** Para quien envía algo más que un archivo — un nombre, un título, un tema, un destino — y genera la petición desde un cliente tipado en lugar de una terminal.

La colisión merece nombrarse, porque es el fallo que enviamos y luego arreglamos. El sobre se reconocía por el tipo de contenido, así que enviar un archivo JSON para convertir con `Content-Type: application/json` se leía como un sobre, se encontraba sin ningún campo `markdown`, y se rechazaba. La regla que lo arregló merece copiarse: una conversión nombrada es dueña del cuerpo. Solo la conversión por defecto lee un sobre, y cualquier petición que nombra qué está convirtiendo trata su cuerpo como el archivo de origen, sea lo que sea que diga el tipo de contenido.

### `multipart/form-data`

La forma que produce un formulario de navegador sin ayuda, y por lo tanto la forma que tiende a exponer un servicio de conversión con un frontend web.

| A favor | En contra |
| --- | --- |
| Archivos y campos juntos, sin escapado | Cada cliente que no es un navegador necesita un codificador |
| Varios archivos en una petición | Los analizadores en streaming son delicados; los que almacenan en búfer consumen mucha memoria |
| El tipo de contenido y el nombre de archivo llegan por parte | Difícil de reproducir a mano cuando estás depurando a las dos de la madrugada |

**¿Para quién es?** Para endpoints llamados directamente por una página, y clientes que de verdad tienen varios archivos por petición. Para una conversión de un solo archivo por script, es ceremonia sin recompensa.

### Base64 dentro de JSON

La válvula de escape para formatos binarios cuando el cliente solo puede hablar JSON. Un `.docx` es un archivo zip, así que no puede entrar en una cadena JSON como texto en absoluto — base64 es cómo entra igualmente.

| A favor | En contra |
| --- | --- |
| Binario a través de un cliente solo-JSON | La codificación infla la carga en aproximadamente un tercio |
| Un único tipo de contenido para formatos de texto y binarios | El techo llega antes: un archivo de 3,3 MB produce un cuerpo de 4,4 MB |
| Trivial de registrar y comparar, si te gustan los registros enormes | El cliente no puede distinguir un fallo de decodificación de un fallo de conversión sin un buen error |

**¿Para quién es?** Para entradas binarias que tienen que cruzar una frontera solo-JSON, con un límite de tamaño fijado lo bastante bajo como para que la inflación no muerda.

### Una URL para que el servidor la busque

Quien llama envía una dirección; el servidor descarga el documento y lo convierte. Tentador, y la forma con el filo más afilado.

| A favor | En contra |
| --- | --- |
| Ninguna subida para documentos que ya están en la web | El servidor se convierte en un cliente HTTP apuntado adonde diga quien llama |
| Evita por completo el techo del cuerpo de la petición | Falsificación de peticiones del lado del servidor, salvo que la búsqueda esté restringida con firmeza |
| Cómodo para READMEs públicos y páginas ya publicadas | Los fallos se multiplican: DNS, TLS, redirecciones, 404, tiempos de espera, y la propia conversión |

**¿Para quién es?** Para servicios que lo necesitan lo bastante como para hacer el trabajo: una lista blanca o negra que cubra rangos de direcciones privadas, un tope de redirecciones, un tope de bytes, un tiempo de espera, y errores que distingan «no se pudo buscar» de «no se pudo convertir». Cualquier cosa menos que eso es un agujero en tu red con una interfaz JSON.

### Subida directa, y luego una referencia

El cliente pide una URL de subida de corta duración, pone el archivo directamente en el almacenamiento de objetos, y envía la clave resultante. El documento nunca pasa por la función de la API.

| A favor | En contra |
| --- | --- |
| El techo del cuerpo de la petición deja de aplicarse | Dos viajes de ida y vuelta y un endpoint que emite tokens |
| Los archivos grandes dejan de ser un caso especial | Las subidas sin una petición de seguimiento necesitan limpieza |
| Las lecturas pueden redirigir a una URL firmada, así que las respuestas se quedan pequeñas | Más piezas en movimiento que se pueden equivocar, y más que explicar |

**¿Para quién es?** Para cualquier servicio cuyos documentos superen habitualmente el límite del cuerpo de la plataforma. Es la respuesta honesta a «sube el límite» — y es un cambio en cómo se mueven los documentos, no un número más grande, que es por lo que nuestro propio techo se queda donde lo puso la plataforma hasta que se haga ese trabajo.

### Un lote en forma de array

Muchos documentos, una petición. Atractivo frente a un límite de peticiones por minuto e incómodo en todo lo demás.

| A favor | En contra |
| --- | --- |
| Cientos de archivos pequeños sin cientos de peticiones | El fallo parcial necesita una forma de respuesta, y los clientes tienen que tratarla |
| Una autenticación y un hueco de límite de peticiones | Todo el lote comparte un único techo de cuerpo |
| Menos viajes de ida y vuelta en una conexión lenta | Un lote largo se acerca al tiempo de espera de la función |

**¿Para quién es?** Para quien llama con muchos documentos pequeños y la paciencia para tratar un array de resultados por elemento. La alternativa, cuando los documentos pertenecen juntos de todas formas, es fusionarlos en un solo documento antes de enviarlo — [lo cual tiene sus propios problemas, sobre todo niveles de encabezado y colisiones de anclaje](/blog/merging-many-markdown-files), pero produce una sola cosa que un lector puede realmente leer.

## Errores y límites que un cliente no debería tener que descubrir

Dos tablas decidan si quien llama puede automatizar contra ti. La primera es qué significan tus rechazos. La segunda es cuáles son tus techos. Las dos pertenecen a la documentación, y ninguna debería tener que deducirse a la inversa de una serie de fallos en el registro de CI de alguien.

Un error es útil cuando lleva tres cosas: un código de estado que significa lo que dice la especificación, un mensaje que una persona puede usar para actuar, y una forma de cuerpo que es la misma cada vez. Un mensaje no es una cortesía. Es la diferencia entre un fallo de compilación que alguien arregla en un minuto y uno que escala.

Aquí está el conjunto completo de nuestros propios endpoints, pequeño a propósito:

| Estado | Cuándo | Qué dice el cuerpo |
| --- | --- | --- |
| 201 | Se creó el documento | El documento, con su id, tamaño, recuento de palabras y URL de compartir |
| 400 | Un `kind` desconocido, un cuerpo vacío, un valor de `share` que no es `link` ni `people`, un CSV sin filas, JSON inválido | El propio mensaje del analizador, incluido dónde se detuvo |
| 400 | `kind=word-to-markdown` | Rechazado por nombre, con la página que lo hace en el navegador |
| 401 | Ninguna credencial, o una desconocida o revocada | Dos frases distintas, según si se envió una cabecera `Authorization` siquiera |
| 403 | La cuenta se quedó sin espacio, o la concesión es de solo lectura | Qué límite, y cuánto estás usando de él |
| 404 | El documento de otra persona, o un id que no es un UUID | `Not found`, para ambos, a propósito |
| 410 | La fila existe y su origen no | El origen de este documento falta |
| 413 | Un documento por encima del tope por documento | El tamaño del documento y el tamaño del límite |
| 429 | Más de 60 peticiones en un minuto | El límite, los segundos que esperar, y una cabecera `Retry-After` |
| 502 | No se pudo llegar al almacén de documentos | Que es nuestro, y la razón de fondo |

Tres de esas filas existen por un fallo concreto que merece copiarse. Un id con forma incorrecta llegaba a Postgres, que lo rechazaba, y eso salía como un 500 — así que ahora la forma de los ids se comprueba antes, y uno incorrecto simplemente no se encuentra. Un archivo guardado que falta y un almacén al que no se puede llegar solían llegar como el mismo 500 desnudo; separarlos en 410 y 502 le dice a quien llama si debe rendirse con ese documento o reintentar la petición. Y devolver `Not found` tanto para «no existe tal documento» como para «no es tuyo» no es pereza: la alternativa confirma la existencia de documentos de otras personas a cualquiera con un generador de UUID.

Los límites son la segunda mitad del contrato:

| Límite | Valor | Por qué es ese número |
| --- | --- | --- |
| Por conversión | 10 MB | La conversión corre en el navegador, así que esto es un juicio sobre la máquina de la persona, no una regla de la plataforma |
| Por documento guardado | 4 MB | La plataforma rechaza una petición o una respuesta de más de 4,5 MB; 4 MB deja sitio para el nombre y el JSON alrededor |
| Por cuenta | 100 MB y 500 documentos | Mil archivos diminutos cuestan filas reales, así que los dos están limitados |
| Por quien llama | 60 peticiones por minuto | Contado por credencial, así que un script descontrolado no puede gastarse la cuota de una sesión de navegador |

Dos propiedades de esa tabla importan más que las cifras. Primero, cada techo nombra lo que lo impone, que es cómo sabe quien llama si preguntar amablemente ayudaría. Segundo, llegar a un límite es un rechazo y no un desalojo silencioso. Esta aplicación solía borrar el documento más antiguo para quedarse bajo su tope, lo cual destruía algo que su propietario había guardado deliberadamente; un rechazo que dice qué borrar en su lugar es peor de recibir y mejor de haber recibido.

## Autenticación, y a qué no debe llegar una clave

Una API de conversión necesita una credencial por una razón por encima de todas: los documentos son de alguien. Limitar peticiones, las cuotas y el manejo de abusos se derivan todos de saber de quién son.

La clave portador es la base, y hay cinco propiedades que hay que hacer bien.

**Un prefijo reconocible.** Las nuestras empiezan con `tp_live_`, lo que significa que el servidor puede distinguir su propia clave de un token de otra persona sin consultar la base de datos, y los escáneres de secretos pueden detectar una en un commit. Una cadena opaca al azar no hace ninguna de las dos cosas.

**Con hash en reposo, mostrada una sola vez.** La clave se muestra al crearla y se guarda solo como hash. Si se puede volver a leer desde una página de la cuenta, se puede leer desde un ticket de soporte, una captura de pantalla y una copia de seguridad.

**Revocable en una acción.** Una clave que no puedes matar en diez segundos es una clave que no vas a rotar.

**Más estrecha que la cuenta.** Una clave nuestra llega a documentos y a compartir, y nunca a la cuenta, al inicio de sesión ni a las propias claves. Esa es la propiedad que hace sobrevivible una filtración: una clave robada no puede acuñar su reemplazo ni dejar fuera a su propietario.

**Aplicada sobre la credencial, no sobre una sola puerta.** Este es el que nos mordió a nosotros. Una concesión de solo lectura de un asistente conectado —del tipo de token [que recoge el conector de un asistente al iniciar sesión](/blog/converting-documents-from-an-assistant), en lugar de una clave que alguien pegó a mano— se comprobaba en el despachador de herramientas en lugar de en la credencial, así que la promesa de la página de consentimiento —que no puede guardar, compartir ni borrar— era verdadera para las herramientas y falsa para la API a la que esas herramientas llaman. La comprobación ahora está delante de cada ruta, como una lista blanca de métodos seguros en lugar de una lista de métodos inseguros, así que una ruta añadida el año que viene queda cubierta por defecto. Un rechazo vuelve como un 403 con `WWW-Authenticate: Bearer error="insufficient_scope"`, que es la forma estándar de decir «autenticado, pero no para esto».

Dos decisiones más pequeñas ahorran tiempo real de depuración. Aceptar una cookie de sesión además de una clave significa que los mismos endpoints se pueden probar desde un navegador con sesión iniciada, así que la documentación se puede comprobar sin acuñar una credencial. Y responder distinto a una petición sin autenticar según si llegó siquiera una cabecera `Authorization` convierte los dos errores de configuración más comunes —ninguna cabecera, y una cabecera que el proxy eliminó— en dos mensajes distintos en lugar de un encogimiento de hombros.

## Límites de peticiones, reintentos e idempotencia

Un límite de peticiones es una promesa sobre el peor caso, y un cliente solo puede cooperar con una promesa que puede leer. El nuestro es 60 peticiones por minuto por credencial, y el 429 lleva tanto el número como una cabecera `Retry-After`, así que un cliente no tiene que adivinar cuánto tiempo dormir.

Ser honesto sobre el mecanismo también importa. El contador es una fila por quien llama y por minuto en Postgres, incrementada con un upsert. No es preciso bajo concurrencia alta —dos llamadas pueden leer el mismo recuento— y a esta escala esa es la contrapartida correcta frente a correr una caché al lado de la base de datos. Quien necesita una cuota exacta debería saberlo; quien solo necesita no martillear la cosa tiene todo lo que necesita.

Del lado del cliente, cuatro reglas cubren casi todos los casos:

- Reintenta 429, 408 y 5xx. No reintentes ningún otro 4xx: la petición está mal y va a seguir estando mal.
- Retrocede de forma exponencial con variación aleatoria, y respeta `Retry-After` cuando está presente — es mejor información que tu propia fórmula.
- Pon un tope al número total de intentos. Una compilación que reintenta para siempre es una compilación que se cuelga en lugar de fallar.
- Haz el fallo ruidoso. `curl` sale con código cero ante un 401 o un 429 a menos que pases `-f`, lo que significa que una tubería puede escribir un cuerpo de error dentro del archivo que se supone que estaba convirtiendo, y seguir alegremente. Esta es la forma más común de que una conversión guiada por API se rompa en silencio, y no tiene nada que ver con la API.

Lo cual trae a colación la idempotencia, y una confesión honesta. `POST /api/v1/documents` no es idempotente. Envía el mismo archivo dos veces y obtienes dos documentos, con dos ids y dos URLs de compartir. Nada los deduplica.

Eso es una elección deliberada en un sitio y un problema sin resolver en otro. Es deliberada para publicar: [nuestra GitHub Action crea un documento nuevo por cada push](/blog/publish-markdown-from-github-actions) precisamente para que un enlace en un comentario antiguo de un pull request siga mostrando lo que decía ese commit, en lugar de mutar bajo un revisor que lo abrió la semana pasada. Sobrescribir sería más ordenado y reescribiría en silencio una historia que alguien está leyendo.

Es un problema sin resolver para los reintentos. Si una petición agota el tiempo después de que se escribiera la fila pero antes de que llegara la respuesta, el cliente no puede distinguir el éxito del fallo, y el reintento seguro crea un duplicado. Hay tres salidas, y merece la pena saber cuál ha tomado una API que estás evaluando:

1. **Una clave de idempotencia.** El cliente envía un valor único en una cabecera —`Idempotency-Key` es la convención que hicieron familiar las APIs de pago— y el servidor guarda la primera respuesta contra ella durante una ventana, repitiendo esa respuesta ante cualquier repetición. Esta es la respuesta correcta y cuesta una tabla, una política de caducidad, y una decisión sobre qué pasa cuando llega la misma clave con un cuerpo distinto.
2. **Un id proporcionado por quien llama.** El cliente elige el id del documento, así que una repetición es un conflicto en lugar de un duplicado. Simple, y le entrega la generación de ids a quien llama, que puede no querer eso.
3. **Reconciliación del lado del cliente.** Quien llama lista los documentos recientes y compara por nombre y tamaño antes de enviar. Esto es lo que estás haciendo lo quisieras o no, cuando la API no ofrece ninguna de las dos opciones anteriores.

Una API que afirma idempotencia sin decir durante cuánto tiempo, o qué campos forman la clave, no te ha dicho casi nada. Pregunta por la ventana.

## Archivos demasiado grandes para un cuerpo de petición

Toda API de conversión alojada tiene un techo de tamaño, y ese techo normalmente no es una opinión propia del servicio. En una plataforma serverless, tanto la petición como la respuesta pasan por infraestructura con sus propios límites, y en Vercel ese límite son 4,5 MB para el cuerpo de una petición o una respuesta, rechazado como un 413 `FUNCTION_PAYLOAD_TOO_LARGE` (comprobado en vercel.com/docs/functions/limitations, el 8 de septiembre de 2026).

La parte importante no es el número. Es que el rechazo pasa por encima de tu propio manejador. Un envío de 6 MB nunca llega al código que habría dicho algo útil, así que quien llama recibe el 413 desnudo de la plataforma y una página de error que no escribió nadie en particular. Desde fuera, parece que tu API se rompió.

Por eso nuestro tope por documento es 4 MB y no 4,5 MB: la aplicación tiene que rechazar la petición ella misma, con una frase que nombra el tamaño del documento y el tamaño del límite, antes de que la plataforma la rechace sin palabras. El medio megabyte de margen es para el nombre del archivo y el JSON alrededor del Markdown. Y por eso el tope de conversión y el tope de almacenamiento son dos números distintos y no uno: convertir pasa en el navegador y puede permitirse 10 MB, guardar el resultado exige una petición y no puede.

El lado de la respuesta del techo es fácil de olvidar. Recuperar un documento devuelve su origen, y renderizar uno devuelve un archivo HTML entero; ambos son cuerpos de respuesta, y ambos están sujetos al mismo límite. Un servicio que te deja subir un documento más grande de lo que puede devolverte tiene una trampa dentro.

Si tus documentos son de verdad más grandes que el techo, hay cuatro opciones honestas:

| Opción | Qué cuesta | Cuándo es la correcta |
| --- | --- | --- |
| Dividir el documento | Varias peticiones, varias salidas, y una decisión sobre qué las enlaza | Documentos que ya eran varios documentos |
| Fusionar y convertir una vez | Un cuerpo grande, así que solo ayuda si fusionar reduce el total | Muchos archivos pequeños que pertenecen juntos |
| Convertir en local, enviar el resultado | Una dependencia en tu pipeline, y desviación de versión que gestionar | Pasos de compilación que ya tienen un runtime disponible |
| Subida directa a almacenamiento | URLs firmadas, una limpieza de huérfanos, y lecturas que redirigen | Un servicio donde los documentos grandes son lo normal y no la excepción |

La tercera opción merece tomarse en serio y no como una derrota. [Un conversor local en la línea de comandos](/blog/markdown-to-html-from-the-command-line) no tiene techo de tamaño, ni red, ni clave que rotar ni límite de peticiones; lo que tiene en su lugar es una instalación que mantener y una versión cuyo comportamiento hay que fijar o va a ir cambiando. Una API de conversión no es automáticamente la mitad mejor de ese cambio.

Un caso no es en absoluto un problema de tamaño. Un `.docx` es un archivo zip lleno de XML, y leer uno necesita un lector de zip y un mapeador de elementos —peso que nuestra función no lleva, así que `kind=word-to-markdown` se rechaza por nombre con un enlace a la página que lo hace en el navegador. Eso es una limitación real dicha con honestidad, y el rodeo es [convertir el `.docx` primero y enviar el Markdown que produjo](/blog/convert-docx-to-markdown). Una API que aceptara el archivo en silencio y lo guardara sin convertir sería peor en todos los sentidos.

## Recuperar el documento

Lo último que separa un endpoint de conversión de una API de conversión es si el resultado tiene una dirección. Un endpoint que convierte, devuelve bytes, y se olvida ha dejado a quien llama a cargo del almacenamiento, el nombre y el compartir — lo cual está bien si querían una librería y no ayuda si querían un servicio.

Tres representaciones del mismo documento cubren casi todo uso:

| Petición | Qué vuelve | Usado por |
| --- | --- | --- |
| `GET /api/v1/documents/:id` | JSON: nombre, tipo, tamaño, recuento de palabras, estado de compartir, y la fuente en Markdown | Un script decidiendo qué hacer a continuación |
| `GET /api/v1/documents/:id.html` | El archivo HTML autónomo, `?theme=dark` opcional | Una compilación escribiendo un archivo al disco |
| `GET /api/v1/documents` | Los 500 más recientes, como lista | Reconciliación, limpieza, paneles |

El HTML autónomo merece una nota, porque «HTML» no es una sola cosa. Lo que vuelve es un documento completo —doctype, cabecera, estilos en línea— en lugar de un fragmento, y es el mismo archivo que la propia aplicación descarga, así que un script y una persona obtienen la misma salida a partir del mismo código. Una API de conversión que devuelve un fragmento te ha entregado un trabajo, no un documento: abierto en un navegador es texto sin estilo a todo el ancho de la ventana.

Publicar es la otra mitad. `?share=link` en la llamada de creación publica el documento y devuelve su URL en la misma respuesta, que es todo el sentido de una API para una herramienta como esta — publicar un documento debería ser una petición y no tres. La revocación tiene que ser real, y es la parte que la gente hace mal: poner un documento de nuevo en privado le quita su token, así que un enlace ya enviado deja de funcionar. Un compartir que no se puede cancelar no es un compartir, es una publicación.

Y un documento en la web pública lleva el contenido de otra persona en tu propio dominio, que es una pregunta de seguridad y no una pregunta de API. Las páginas compartidas aquí se sirven con `script-src 'self'` y `frame-ancestors 'none'`, así que una inyección que de alguna manera sobreviviera [al saneador](/blog/sanitising-markdown-safely) aun así no puede ejecutarse, y la página no se puede enmarcar como si fuera de otra persona. Si una API de conversión va a alojar el resultado por ti, pregunta qué manda en las cabeceras antes de apuntarla a documentos que no escribiste.

Por último, un endpoint de uso suena como algo secundario y no lo es. `GET /api/v1/usage` responde «cuán cerca estoy» en una petición, que es la diferencia entre un cliente que se frena antes de ser rechazado y uno que descubre cada techo golpeándolo.

## Dónde una API es la respuesta equivocada, y qué cuesta

La respuesta obvia a «convierte esto según un calendario» es una llamada a una API, y hay cuatro casos donde es la equivocada.

**Un archivo, una vez.** Una clave que acuñar, un secreto que guardar y un cliente que escribir, para un trabajo que una página hace en diez segundos. La API se gana su lugar en la segunda vez, no en la primera.

**Documentos que no deben salir de la máquina.** Un contrato, la nota de un paciente, un plan sin publicar — para estos la pregunta no es si un servicio es de confianza sino si el archivo cruzó la red siquiera. La conversión en el navegador responde eso con la pestaña de red; una librería local lo responde con un vacío de aire. Una API no puede responderlo en absoluto, sea lo que sea que diga la política de privacidad.

**Una compilación que tiene que ser reproducible.** Un servicio mejora, y mejorar es desviación. Si tu salida tiene que ser idéntica byte a byte a la del año pasado, quieres una versión fijada de una librería en tu propio lockfile, no el último despliegue de otra persona.

**Miles de archivos en una sola ejecución.** Sesenta peticiones por minuto son cuarenta archivos README sin darte cuenta y cuatro mil páginas nunca. A ese volumen la respuesta es un conversor local, o un documento fusionado, o un endpoint de lote si el servicio tiene uno.

Los costes de elegir una API merecen decirse con claridad, porque son todos el mismo tipo de coste: una dependencia que no controlas.

- **Un salto de red en tu compilación.** Cada conversión ahora puede fallar por razones que no tienen nada que ver con tu documento — DNS, TLS, un mal despliegue al otro lado.
- **Un secreto con un ciclo de vida.** Las claves se filtran, caducan y necesitan rotarse, en cada entorno que ejecutas, y una rotación que olvidas es una interrupción que programaste con meses de antelación.
- **Los techos de otra persona.** Su límite de tamaño, su límite de peticiones y su cuota se vuelven hechos sobre tu pipeline, y pueden cambiar sin preguntarte.
- **Una superficie de auditoría.** Adónde fue el documento, quién pudo leerlo, cuánto tiempo se retuvo: todas ahora preguntas con respuestas que tienes que buscar en lugar de respuestas que escribiste tú.
- **Latencia que no puedes optimizar.** Un análisis local son milisegundos. Un viaje de ida y vuelta son decenas o cientos, multiplicados por el número de archivos.

Nada de esto argumenta contra una API de conversión. Argumenta a favor de elegir una porque la alternativa era peor para ese trabajo, y de saber cuál de estas cosas aceptaste.

## Cómo juzgar una API de conversión de documentos

1. **Lee el catálogo de errores antes de la lista de funciones.** Si un archivo roto vuelve como un 500 sin mensaje, cada fallo en tu pipeline va a costar una hora de la tarde de alguien, porque la API no te ha dicho nada que puedas usar.
2. **Encuentra los límites de tamaño en la documentación, no en producción.** Un límite que descubres a partir de una petición rechazada es un límite que descubriste durante un lanzamiento, y en una plataforma serverless el rechazo puede ni siquiera venir del servicio.
3. **Comprueba si un reintento puede duplicar.** Sin una clave de idempotencia ni un id proporcionado por quien llama, cada tiempo de espera te deja reconciliando a mano — así que decide ahora si tu cliente deduplica, o acepta los duplicados de forma deliberada como una elección de publicación.
4. **Comprueba a qué puede llegar la credencial.** Una clave que puede crear claves, cambiar la facturación o borrar la cuenta convierte una variable de entorno filtrada en un incidente en lugar de una rotación.
5. **Pregunta qué es en realidad el cuerpo de la respuesta.** Un fragmento significa que todavía tienes que escribir el envoltorio; un archivo completo autónomo significa que puedes entregar la salida directamente a una persona.
6. **Intenta cancelar un compartir.** Si revocar un enlace deja funcionando la URL vieja, la idea de privado del servicio y la tuya son distintas, y lo vas a descubrir de la peor manera.
7. **Convierte un documento real, y luego recupéralo.** No el ejemplo de la documentación — tu archivo, con sus tablas, su frontmatter y sus caracteres raros, recuperado con una segunda petición. Ese único ciclo ejercita la forma de la petición, los límites, las rutas de error y el almacenamiento de una sola vez, y tarda unos cinco minutos.

## Conclusión

Una API de conversión de documentos es una pequeña pieza de infraestructura que dice lo que hace o no lo dice. Las partes que lo decidan son poco vistosas: adónde va el archivo en la petición, en qué se convierte un archivo malo, qué techo pertenece al servicio y cuál a la plataforma de debajo, si un reintento es seguro, y si el resultado tiene una URL. Consigue eso bien y la conversión en sí es la parte fácil. Si quieres ver la misma conversión a mano antes de automatizarla, [el conversor que está delante de esta API](/) corre en el navegador, no convierte nada en ningún otro sitio, y entrega el mismo archivo autónomo que la API — lo cual lo convierte en una forma razonable de comprobar qué va a producir tu script antes de apuntarlo a cuatrocientos archivos. Y cuando el documento que quieres convertir no tiene archivo ni repositorio detrás porque un asistente acaba de escribirlo, [un conector en lugar de un cliente es el camino más corto](/blog/converting-documents-from-an-assistant).

## Preguntas frecuentes

### ¿Qué es una api de conversión de documentos?

Un endpoint HTTP que toma un documento en un formato y lo devuelve en otro, para que la conversión pueda pasar dentro de un script, un paso de compilación o una tarea programada en lugar de una pestaña del navegador. Las útiles también guardan el resultado y le dan una URL, así que la salida se puede volver a pedir en lugar de regenerarla.

### ¿El archivo debería ir en el cuerpo de la petición o en un campo JSON?

Envíalo como cuerpo en crudo cuando el endpoint ya sabe cuál es la conversión, por la ruta o por un parámetro de consulta — no hay nada que escapar y el cuerpo se queda tan pequeño como puede. Usa un sobre JSON cuando tienes varios campos que enviar, y asegúrate de que la API dice qué forma gana cuando el propio documento es JSON.

### ¿Cuál es el tamaño máximo de archivo para una api de conversión alojada?

Depende más de la plataforma que del servicio: en un host serverless, los cuerpos de petición y de respuesta están limitados, y en Vercel el tope son 4,5 MB, aplicado antes de que corra el propio código de la aplicación. Los servicios que necesitan aceptar documentos más grandes sacan el archivo de la petición por completo, con una subida directa a almacenamiento y una referencia enviada después.

### ¿Cómo evito que un reintento cree dos documentos?

Prefiere una API que acepte una clave de idempotencia, para que una petición repetida repita la primera respuesta en lugar de crear un segundo documento. Donde no hay ninguna, haz que el cliente genere su propia marca y compruebe la lista de documentos recientes antes de enviar, o trata cada envío como una versión nueva de forma deliberada — que es la respuesta correcta cuando los enlaces antiguos deben seguir mostrando lo que mostraban.

### ¿Necesito una clave de API distinta para cada entorno?

Sí, por dos razones: una clave por entorno se puede revocar sin detener todo lo demás, y contar peticiones por clave significa que una tarea descontrolada en pruebas no puede gastarse la cuota de producción. Guarda las claves en el almacén de secretos que tu plataforma ya ofrece, nunca en el repositorio, y rótalas en una fecha que hayas anotado.

### ¿Qué debería devolver una api de conversión cuando el archivo está roto?

Un 400 con el propio mensaje del analizador, incluido dónde se detuvo dentro del archivo — esa es la única información que quien llama puede usar para actuar, y un «no se pudo convertir» plano manda a alguien a buscar a ojo dentro de un megabyte. Reserva los 5xx para fallos que son del propio servicio, y da a los dos casos códigos distintos para que un cliente sepa si reintentar podría servir de algo.

### ¿Puedo convertir un documento de Word a través de una api?

A veces, y merece la pena comprobarlo en lugar de suponerlo. Un `.docx` es un archivo zip de XML, así que un servicio tiene que llevar un lector de zip y un mapeador para aceptar uno; donde ese peso no está en la función, la conversión se ofrece en el navegador en su lugar y la API toma el Markdown que salió de ahí.
