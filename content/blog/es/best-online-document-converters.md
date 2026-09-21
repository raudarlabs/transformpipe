---
title: "Los mejores conversores de documentos online en 2026: adónde va tu archivo en realidad"
description: Comparamos conversores de documentos online por lo que le pasa a tu archivo -herramientas de navegador que no suben nada, frente a servicios alojados y su retención.
date: 2026-09-07
tag: Conversión
keywords: conversor de documentos online, mejor conversor de documentos online, convertir documentos online sin subirlos, conversor de documentos en el navegador, convertidor de archivos gratis online, api de conversion de documentos, conversor de documentos sin conexion, cuanto tiempo guardan mis archivos los conversores
---

Elegir un conversor de documentos online parece una comparativa de funciones y en realidad es una pregunta de geografía. Tu archivo se queda en tu máquina, o va a la de otra persona. Todo lo demás — la lista de formatos, el área para arrastrar y soltar, la barra de progreso bien cuidada— se apoya en esa única diferencia, y ninguna página de precios la pone en la tabla.

### Resumen rápido

Elige según adónde va el archivo, no según cuántos formatos aparecen en la lista. Un conversor que corre en tu navegador procesa el archivo en tu propia máquina, no sube nada, y te deja comprobarlo con una pestaña de red vacía — esa es la opción correcta por defecto para cualquier cosa que no escribiste para el público. Un servicio del lado del servidor como CloudConvert, Convertio, Zamzar o FreeConvert gestiona formatos que un navegador no puede tocar, a cambio de subir el documento y aceptar una política de retención. Pandoc es la respuesta sin conexión cuando la conversión tiene que repetirse, correr en una tubería, o tocar formatos que ninguna página web soporta.

## La pregunta que nadie pone en la página de precios

La portada de todo conversor compite con las mismas tres afirmaciones: es rápido, es gratis, soporta cientos de formatos. Ninguna de las tres te dice si el documento que vas a convertir sale del edificio. Esa es la única afirmación con una consecuencia real, y suele estar a cuatro clics de distancia, en una página de privacidad, formulada como tranquilidad más que como hecho.

Un conversor puede sostener tres posturas honestas. Puede hacer el trabajo en tu navegador, en cuyo caso no se sube nada y no hay nada que retener. Puede subir el archivo a un servidor, convertirlo ahí y borrarlo según un calendario, en cuyo caso ese calendario es el producto. O puede correr en tu propia máquina fuera del navegador, en cuyo caso la red no interviene en absoluto y tú asumes el coste de una instalación. La mayoría de las herramientas está en el segundo grupo. La mayoría de la gente asume que está en el primero.

La segunda cosa que nadie anuncia es qué recibes de vuelta. «Convertido» no es un único resultado. Un conversor puede darte un archivo completo que se abre solo, un fragmento que necesita un envoltorio que tienes que escribir tú, o un zip con el documento más una carpeta de imágenes y una hoja de estilos que espera encontrar al lado. Las tres cosas se describen igual en el botón. Solo la primera sobrevive a que la mandes por correo.

Y la tercera es más sutil: un conversor puede producir una salida que se ve bien en la página donde la convertiste, y mal en cualquier otro sitio, porque el resultado depende en silencio de una fuente o una hoja de estilos que se pide a una red que quien lo reciba puede no tener. Un archivo que necesita la red para parecerse a sí mismo no es autocontenido, diga lo que diga el botón de descarga.

## Comparativa rápida: la chuleta

| Herramienta | Mejor para | Capacidad principal | Precio |
| --- | --- | --- | --- |
| TransformPipe | Convertir un documento sin subirlo | Conversión en el navegador, exportación HTML autocontenida, API y CLI | Gratis |
| Pandoc | Conversión repetible entre muchos formatos | Formatos de marcado, HTML, ofimática, TeX y libro electrónico, plantillas, `--standalone`, `--embed-resources` | Gratis, GPL |
| LibreOffice (sin interfaz) | Formatos de oficina sin conexión, en volumen | `--convert-to` para Word, Excel, PowerPoint, ODF, PDF | Gratis, MPL 2.0 |
| CloudConvert | Una API sobre la que construir | Amplitud de formatos, elección de región, archivos borrados tras procesarse | Nivel gratis: 10 conversiones/día |
| Convertio | Conversión puntual de un formato poco común | Lista de formatos muy amplia, web y API | Nivel gratis, luego desde 11,99 $/mes |
| Zamzar | Conversión ocasional al estilo de escritorio | Servicio veterano, web y API | Gratis: 2 archivos/24h, luego desde 12 $/mes |
| FreeConvert | Conversión de media y documentos por minutos | Medido en minutos de conversión y no en archivos | Gratis: 20 minutos/día, luego desde 12,99 $/mes |
| Adobe Acrobat online | Cualquier cosa donde el PDF sea origen o destino | Exportación e importación de PDF con el mismo motor que Acrobat | Herramientas gratis con límites; el resto en una suscripción |
| Google Docs / Microsoft 365 | Una conversión que ya pagas | Importa `.docx`, exporta HTML, PDF, texto plano | Incluido con la cuenta |
| Gotenberg | Conversión del lado del servidor que alojas tú | API en Docker sin estado, sobre LibreOffice y Chromium | Gratis, MIT |
| Librerías en tu propio código | Una conversión dentro de una aplicación | marked, Turndown, mammoth, Papa Parse y sus equivalentes | Gratis, código abierto |
| Guardar como / Imprimir a PDF del navegador | La conversión que ya tienes instalada | Guarda una página como PDF o como HTML más una carpeta de recursos | Gratis |

## Los mejores conversores de documentos online en 2026

### TransformPipe — el mejor para convertir un documento sin subirlo

TransformPipe convierte Markdown a HTML, y HTML, Word `.docx`, CSV, TSV y JSON a Markdown, en el navegador. Sin sesión iniciada, el archivo se lee, se analiza y se renderiza en tu propia máquina y nunca se envía a ningún sitio. La exportación a HTML es un solo archivo completo con los estilos en línea, lo que significa que se abre igual en un portátil sin conexión que en el tuyo.

| A favor | En contra |
| --- | --- |
| Nada se sube cuando no has iniciado sesión, y la pestaña de red lo demuestra | El navegador hace el trabajo, así que un archivo muy grande está limitado por la máquina |
| La exportación HTML es un solo archivo que no pide nada a la red | No es un conversor universal: sin vídeo, audio, imágenes ni PDF a Word |
| El HTML crudo pasa por un saneador con una lista de permitidos fija | Un documento a la vez, o varios fusionados en uno — no es una compilación de sitio |
| La misma conversión está disponible como API REST, CLI, GitHub Action y servidor MCP | Sin lenguaje de plantillas para maquetas a medida |

**Precio:** gratis. Una cuenta añade historial, compartir y acceso a la API, también gratis.

**Detalles técnicos y funciones**

- Markdown a HTML con GitHub Flavored Markdown: tablas, listas de tareas, tachado, autoenlaces, código con cercas
- HTML, `.docx`, CSV, TSV y JSON a Markdown en la misma página, sin instalación ni cuenta
- La salida es un documento completo — doctype, head, `<style>` en línea— o `.md` plano, o se imprime a PDF con el propio diálogo del navegador
- El HTML crudo de la entrada se filtra contra una lista de permitidos, tanto en el navegador como en el servidor
- Una CLI sin dependencias y una GitHub Action para la misma conversión dentro de una tubería

**¿Para quién es?** Para cualquiera que convierta un documento que todavía no es público — un contrato, el borrador de un cliente, un plan interno, una exportación de una app de notas. Es también el camino más corto para el trabajo concreto de convertir Markdown en una página que puedas enviar, [comparado en detalle contra librerías y herramientas de escritorio en otro artículo](/blog/best-markdown-to-html-converters).

### Pandoc — el mejor para conversión repetible entre muchos formatos

Pandoc es un conversor de documentos de línea de comandos escrito en Haskell que lee y escribe alrededor de cuarenta formatos, incluidos Markdown, HTML, LaTeX, EPUB, Word y OpenDocument. Corre en tu máquina, así que ningún archivo sale de ella, y es la única herramienta de esta lista cuya matriz de formatos compite de verdad con los servicios alojados.

| A favor | En contra |
| --- | --- |
| Convierte entre formatos a los que ningún servicio web se molesta en llegar | Necesita instalación y una terminal |
| Corre por completo sin conexión, así que la red no forma parte de la pregunta de confianza | Plantillas, filtros y banderas de dialecto son una curva de aprendizaje real |
| `--standalone` y `--embed-resources` producen un archivo completo | Sin saneado: el HTML crudo pasa directo |
| Programable, así que la misma conversión se repite igual el mes que viene | Sus dialectos de Markdown difieren de GFM de formas que sorprenden |

**Precio:** gratis, con licencia GPL.

**Detalles técnicos y funciones**

- Lectores y escritores que se eligen explícitamente, incluidos `commonmark`, `gfm`, `html`, `docx` y `latex`
- `--standalone` envuelve la salida en un documento completo; `--embed-resources` incrusta imágenes y CSS
- `--template` y filtros Lua para reescribir el documento a mitad de la conversión
- `--sandbox` restringe el acceso al sistema de archivos al convertir un archivo en el que no confías
- `--reference-doc` traslada el estilo de Word a la salida `.docx`
- La lista de formatos es asimétrica: lee [EPUB](/blog/convert-epub-to-markdown) pero escribe PowerPoint sin leerlo, así que [una presentación pide otro camino](/blog/convert-powerpoint-to-markdown)

**¿Para quién es?** Para cualquiera cuya conversión pasa más de una vez: una compilación de documentación, una cadena de manuscritos, un proceso de publicación. Para un solo archivo y una persona esperándolo, Pandoc es más herramienta de la que el trabajo pide, y [merece la pena conocer las opciones más ligeras](/blog/pandoc-alternatives-for-markdown-to-html) antes de instalar un binario en Haskell.

### LibreOffice sin interfaz — el mejor para formatos de oficina sin conexión

LibreOffice es una suite ofimática de escritorio, y su modo de línea de comandos es un conversor de documentos que la mayoría ya tiene instalado sin saberlo. `soffice --headless --convert-to` lee y escribe archivos de Word, Excel, PowerPoint y OpenDocument, y exporta PDF, en tu propia máquina.

| A favor | En contra |
| --- | --- |
| Gestiona los formatos de Microsoft de forma nativa, sin conexión, en volumen | Una instalación muy grande para una herramienta de conversión |
| Gratis y de código abierto, sin cuenta ni subida | Un diseño de Word complejo no siempre sobrevive el viaje |
| Programable sobre un directorio de archivos | Su exportación a HTML es anticuada y no es un documento para enviar |
| El mismo motor que corre detrás de muchos servicios alojados | Un proceso a la vez, salvo que gestiones perfiles de usuario con cuidado |

**Precio:** gratis, con licencia MPL 2.0.

**Detalles técnicos y funciones**

- `--convert-to` con un filtro de destino, y `--outdir` para el destino de los archivos
- Lee y escribe `.docx`, `.xlsx`, `.pptx`, formatos ODF y CSV
- Exportación a PDF con sus propias opciones, incluido PDF/A
- Corre en Windows, macOS y Linux, y dentro de un contenedor

**¿Para quién es?** Para equipos que convierten documentos de oficina en volumen y no pueden dejar que salgan de la red. Si alguna vez pegaste un `.docx` en un conversor web solo para sacarle el texto, esta es la versión de eso sin nada que se suba.

### CloudConvert — el mejor conversor del lado del servidor sobre el que construir

CloudConvert es un servicio de conversión alojado con una API como centro de gravedad y no como añadido tardío. Tu archivo se sube, se convierte en un contenedor y se te devuelve. Es la opción del lado del servidor más clara sobre lo que le pasa al archivo mientras está ahí.

| A favor | En contra |
| --- | --- |
| Una API documentada, con la interfaz web como cliente de ella | El archivo se sube — es el modelo, no una opción |
| Afirma que los archivos se guardan solo para procesarlos y se borran justo después | El nivel gratis es lo bastante pequeño como para ser una prueba y no un plan |
| Se puede elegir la región de procesamiento | Los créditos son una unidad que hay que traducir a tu propia carga de trabajo |
| Cada tarea corre en un contenedor aislado propio | Sin modo sin conexión, por definición |

**Precio:** el nivel gratis son 10 conversiones al día. Limita el archivo a 1 GB, el procesamiento a cinco minutos y las tareas simultáneas a cinco. El uso de pago se vende como paquetes de crédito o suscripción, tarifado por volumen con un deslizador, y con precios de empresa a medida por encima (comprobado en cloudconvert.com/pricing, el 8 de septiembre de 2026).

**Detalles técnicos y funciones**

- API REST con tareas compuestas de importación, conversión y exportación
- Documentos, hojas de cálculo, presentaciones, imágenes, audio, vídeo y archivos comprimidos
- Selección de región para dónde corre la conversión (comprobado en cloudconvert.com/security, el 8 de septiembre de 2026)
- SSL para las transferencias, y una política declarada de sin almacenamiento permanente

**¿Para quién es?** Para desarrolladores que necesitan un único endpoint de conversión que cubra formatos que un navegador no puede tocar, y que pueden aceptar subir esos documentos. La claridad de su política de retención es la razón para preferirlo sobre la parte del mercado sostenida por publicidad.

### Convertio — el mejor para conversión puntual de un formato poco común

Convertio es un servicio basado en navegador con una de las listas de formatos más amplias que existen. Sueltas un archivo, se sube, se convierte en el servidor, descargas el resultado. Es la herramienta que con más fiabilidad ya ha oído hablar de la extensión que tengas entre manos.

| A favor | En contra |
| --- | --- |
| Cobertura de formatos que va mucho más allá de los documentos | Cada conversión es una subida, incluidas las privadas |
| Sin instalación, funciona en un móvil igual que en un portátil | Los archivos convertidos quedan en el servicio 24 horas, según su propia política |
| Las mismas conversiones disponibles por API | El uso gratis está limitado por tamaño de archivo más que por un contador claro |
| El estilo y la estructura de salida son decisión de la herramienta, no la tuya | Los niveles de pago están tarifados para un volumen que quizá no tengas |

**Precio:** el uso sin registrarse tiene un tope de 1 GB por archivo. Los planes de pago empiezan en 11,99 $ al mes para Lite, 22,99 $ para Basic y 44,99 $ para Pro con facturación mensual. Las tarifas anuales son más bajas, y hay un nivel a medida por encima (comprobado en convertio.co/pricing, el 8 de septiembre de 2026).

**Detalles técnicos y funciones**

- Conversiones de documentos, imágenes, audio, vídeo, archivos comprimidos, libros electrónicos, fuentes y presentaciones
- Interfaz web más una API REST con el mismo catálogo
- Declara: archivos subidos borrados al instante, archivos convertidos a las 24 horas (comprobado en convertio.co, el 8 de septiembre de 2026)
- Las conversiones se encolan en el servidor, así que un archivo grande no está limitado por tu máquina

**¿Para quién es?** Para cualquiera con un archivo en un formato que nada más lee, y sin problema de confidencialidad — un dataset público, una fuente, un vídeo, un documento ya publicado en internet. Es la herramienta equivocada para un documento que todavía no se ha hecho público.

### Zamzar — el mejor para conversión ocasional con un límite gratis claro

Zamzar es uno de los conversores online más veteranos y uno de los pocos que expresa su cuota gratis como un número y no como una sensación. El modelo es el mismo que el de Convertio: subir, convertir en el servidor, descargar.

| A favor | En contra |
| --- | --- |
| El límite gratis es un número de archivos declarado, no una línea vaga de «uso justo» | Dos archivos al día es una cuota genuinamente pequeña |
| La retención está documentada en frases claras | Una conversión fallida mantiene tu original retenido más tiempo |
| API disponible junto a la interfaz web | Subir el archivo es inevitable |
| Simple, estable y predecible | El límite de tamaño gratis descarta muchos documentos reales |

**Precio:** el servicio gratis convierte hasta 2 archivos en cualquier periodo de 24 horas, con un límite de subida de 50 MB. Los planes de pago son 12 $ al mes para Basic (50 conversiones de escritorio al día, archivos de 200 MB), 19 $ para Pro (100 al día, 400 MB) y 39 $ para Business (500 al día, 2 GB). Comprobado en zamzar.com y secure.zamzar.com, el 8 de septiembre de 2026.

**Detalles técnicos y funciones**

- Documentos, imágenes, audio, vídeo, libros electrónicos y archivos comprimidos
- Un archivo convertido se guarda un máximo de 24 horas para que lo descargues; si una conversión falla, el original se retiene hasta siete días para soporte (comprobado en zamzar.com/faq, el 8 de septiembre de 2026)
- API de conversión con el mismo catálogo de formatos
- Topes de tamaño de archivo por plan en vez de un límite global único

**¿Para quién es?** Para quien convierte algún archivo suelto y quiere saber exactamente qué permite el nivel gratis. La retención de siete días para las conversiones fallidas es el detalle a sopesar antes de subir algo sensible.

### FreeConvert — el mejor cuando tu trabajo se mide en minutos

FreeConvert cubre el mismo terreno que Convertio y Zamzar, y mide de otra forma: la unidad son minutos de conversión y no archivos. Eso favorece a los medios grandes y penaliza las conversiones largas de un solo archivo.

| A favor | En contra |
| --- | --- |
| Una cuota gratis diaria medida en minutos, no en archivos | Un tope de tiempo por archivo en el uso gratis detiene una conversión grande a mitad de camino |
| El uso web y por API consume la misma cuota | Del lado del servidor, así que el archivo se sube |
| Los niveles superiores elevan bastante el tope de tamaño | Los minutos son difíciles de estimar antes de empezar |
| Sin instalación, sin dependencia de escritorio | Los términos de retención hay que leerlos para encontrarlos |

**Precio:** el uso gratis son 20 minutos de conversión al día entre web y API, con un límite de 5 minutos de conversión por archivo. Los planes de pago son 12,99 $ al mes para Basic, 24,99 $ para Standard y 29,99 $ para Pro, con tarifa a demanda por encima (comprobado en freeconvert.com/pricing, el 8 de septiembre de 2026).

**Detalles técnicos y funciones**

- Documentos, imágenes, audio, vídeo, archivos comprimidos y libros electrónicos
- Tamaños máximos de archivo por plan, desde 1,5 GB en Basic hasta 20 GB en el nivel a demanda (comprobado en freeconvert.com/pricing, el 8 de septiembre de 2026)
- Una sola API para todo el catálogo
- El tiempo de conversión, y no el número de archivos, como unidad de facturación

**¿Para quién es?** Para quien tiene conversiones largas en vez de numerosas — vídeo, audio, hojas de cálculo grandes— y está cómodo con la subida.

### Adobe Acrobat online — el mejor cuando el PDF es uno de los extremos

Las herramientas online de Adobe convierten hacia y desde PDF con el mismo motor que el propio Acrobat, algo que importa porque el PDF es el formato con más papeletas de salir maltrecho por la reimplementación de un tercero. Las herramientas corren en el navegador y procesan el archivo en los servidores de Adobe.

| A favor | En contra |
| --- | --- |
| La conversión de PDF más fiel, por ser la de Adobe | El inicio de sesión aparece rápido en cuanto usas las herramientas gratis algo más que superficialmente |
| Gestiona PDF a Word, Word a PDF y las combinaciones habituales | Sube el documento a Adobe |
| Consistente con la salida de la aplicación de escritorio | No es un conversor de documentos general — el PDF siempre es un extremo |
| Sin instalación para las herramientas online | Tarifado como parte de una suscripción, no por conversión |

**Precio:** varias herramientas online son gratis con límites de uso, y el acceso completo viene incluido en una suscripción de Acrobat cuyo precio depende del plan, la región y el plazo — consulta adobe.com para la cifra que te corresponde en vez de fiarte de un número en un artículo.

**Detalles técnicos y funciones**

- Creación, exportación, fusión y compresión de PDF en el navegador
- Conversión hacia y desde Word, Excel, PowerPoint e imágenes
- Se pide iniciar sesión para cualquier cosa más allá de un uso gratis ligero
- Las mismas conversiones disponibles en la aplicación de escritorio y sus APIs

**¿Para quién es?** Para cualquiera para quien la fidelidad del PDF sea todo el objetivo — un formulario, un documento firmado, un archivo listo para imprimir. No es la herramienta para sacar el texto de un documento que preferirías que Adobe no tuviera.

### Google Docs y Microsoft 365 — el conversor que ya pagas

Si tienes cualquiera de las dos cuentas, ya tienes un conversor de documentos. Sube un `.docx`, ábrelo, y expórtalo como HTML, PDF o texto plano. Nadie los vende como conversores, y para muchísimos trabajos puntuales son el camino más corto.

| A favor | En contra |
| --- | --- |
| Ya disponible, y ya confías en él con tus documentos | El archivo se sube por definición — eso es lo que es la cuenta |
| Gestiona el formato de Word mejor que la mayoría de terceros | La exportación HTML de Google Docs llega como un zip, con las imágenes como archivos separados |
| Ningún proveedor nuevo que evaluar | El HTML exportado lleva la marcación y los nombres de clase propios del editor |
| Gratis con la cuenta que ya tienes | Incómodo para más de un puñado de archivos |

**Precio:** incluido con la cuenta de Google o Microsoft que ya tienes.

**Detalles técnicos y funciones**

- Importación y exportación de `.docx`, `.xlsx`, `.pptx`, PDF, texto plano y HTML
- Las opciones de exportación se eligen por documento desde un menú, no por script
- El documento se queda en el almacenamiento de la cuenta tras la conversión salvo que lo quites
- Disponible en móvil además de en escritorio

**¿Para quién es?** Para cualquiera que convierta un documento que ya vive en esa cuenta. Si todavía no vive ahí, subirlo solo para sacarle HTML es un paso grande para un trabajo pequeño.

### Gotenberg — el mejor para conversión del lado del servidor que alojas tú

Gotenberg es una API de conversión sin estado distribuida como imagen de Docker, que envuelve LibreOffice y Chromium detrás de endpoints HTTP. Es el término medio entre un servicio alojado y una instalación local: una API con la forma de la de CloudConvert, corriendo sobre hardware que controlas tú.

| A favor | En contra |
| --- | --- |
| Una API HTTP con ninguno de los documentos saliendo de tu infraestructura | Tienes que correrla, vigilarla y parchearla |
| Sin estado por diseño, así que no hay política de retención que leer | Lista de formatos más estrecha que los servicios alojados |
| Gratis y de código abierto | Necesita Docker y un sitio donde ponerla |
| Coste predecible: tu propio cómputo | No es una herramienta para una persona con un archivo |

**Precio:** gratis, con licencia MIT.

**Detalles técnicos y funciones**

- Endpoints HTTP para conversión de documentos de oficina, HTML a PDF y operaciones sobre PDF
- LibreOffice para formatos de oficina, Chromium para renderizar HTML
- Distribuido como contenedor, configurado con banderas y variables de entorno
- Sin persistencia entre peticiones

**¿Para quién es?** Para equipos de ingeniería que necesitan la conversión como un servicio dentro de un producto o una intranet, con una respuesta de cumplimiento que no depende del calendario de borrado de otro.

### Librerías en tu propio código — cuando la conversión es una función más

Si la conversión pasa dentro de software que estás escribiendo, la respuesta honesta suele ser una librería y no ningún conversor de esta página: marked o markdown-it para Markdown a HTML, Turndown para HTML a Markdown, mammoth para `.docx` a HTML, un parser de CSV para datos tabulares.

| A favor | En contra |
| --- | --- |
| Nada sale del proceso, y menos aún de la máquina | Escribes tú el envoltorio, el manejo de errores y el estilo |
| Sin coste por conversión ni límite de tasa | El saneado es responsabilidad tuya en la mayoría de ellas |
| Con versión fija en tu lockfile, así el comportamiento no cambia bajo tus pies | Una librería por dirección, así que una matriz se vuelve varias dependencias |
| Gratis y de código abierto | Ninguna ayuda con PDF, vídeo ni formatos exóticos |

**Precio:** gratis, código abierto — marked y Turndown tienen licencia MIT.

**Detalles técnicos y funciones**

- Markdown a HTML: marked, markdown-it, remark en JavaScript; equivalentes en cualquier otro lenguaje
- HTML a Markdown: Turndown, con reglas que puedes sobrescribir por elemento
- `.docx` a HTML: mammoth, que deliberadamente mapea estilos en vez de reproducir la marcación de Word
- El saneado es un paso separado que añades tú, no algo que venga por defecto

**¿Para quién es?** Para desarrolladores cuyo producto convierte documentos como parte de lo que hace. Lee [qué puede llevar el HTML crudo a través de una conversión](/blog/sanitising-markdown-safely) antes de renderizar el resultado de una de estas librerías en el navegador de alguien.

### Guardar como e Imprimir a PDF del navegador — el conversor que ya tienes instalado

Todo navegador convierte documentos. `Ctrl+P` a un PDF, o Guardar página como, te da un artefacto legible de casi cualquier cosa que puedas abrir. No cuesta nada, no sube nada y no exige ninguna decisión.

| A favor | En contra |
| --- | --- |
| Gratis, instalado, sin conexión e instantáneo | El PDF pierde la estructura — los encabezados se vuelven visuales, no semánticos |
| Nada se sube | «Guardar página como, completa» produce un archivo más una carpeta de recursos |
| Funciona para cualquier cosa que el navegador pueda renderizar | Los saltos de página caen donde caen |
| Sin cuenta, sin límites | No es programable como parte de una compilación |

**Precio:** gratis.

**¿Para quién es?** Para quien necesita una copia fija de algo legible, ahora mismo, y no necesita que la salida sea editable ni estructurada después.

## Lo que las páginas de precios dejan fuera

Las tablas comparativas se construyen con los campos que los proveedores acceden a publicar. Las cosas que de verdad decantan si una conversión fue buena idea casi nunca están entre ellos.

**Si el archivo se sube en absoluto.** Esta es la primera pregunta y casi nunca está en la tabla. «Online» ha pasado a significar «en el servidor de otro», pero un navegador es un entorno de ejecución, y un conversor escrito para correr en él hace el trabajo en tu máquina. La diferencia no es una promesa que tengas que creerte: abre las herramientas de desarrollador, mira la pestaña de red, convierte el archivo, y comprueba si sale algo. Un conversor de navegador no te muestra nada más que la página que ya había cargado. Uno del lado del servidor te muestra tu documento saliendo, y esa misma costumbre de observar en vez de creer es [cómo se resuelve si un conversor online es seguro](/blog/is-an-online-converter-safe) para el archivo que tienes delante, en vez de leer el candado como una respuesta.

**Cuánto tiempo lo guarda una vez subido.** La retención es una política, lo que significa que es una frase que alguien escribió y puede reescribir. Los buenos servicios la dicen con claridad. CloudConvert afirma que los archivos se guardan solo para procesarlos y se borran justo después. Convertio dice que los subidos se borran al instante y los convertidos a las 24 horas. Zamzar guarda un archivo convertido un máximo de 24 horas, y retiene el original hasta siete días cuando la conversión falla, para que soporte pueda mirarlo. Cada una de esas es razonable y ninguna es cero. La conversión en el navegador no tiene política de retención porque no hay nada que retener, que es una categoría de respuesta distinta.

**Si lo que recibes de vuelta es un archivo completo.** Bajo el mismo botón de descarga llegan tres cosas distintas. Un documento completo se abre solo y se parece a sí mismo. Un fragmento — encabezados y párrafos sin `<html>`, `<head>` ni estilos alrededor— se renderiza como texto negro con el ancho por defecto del navegador y se lee como roto para quien lo recibió. Un zip con un HTML, una hoja de estilos y una carpeta de imágenes es un sitio web metido en una bolsa: mueve el HTML solo y las imágenes desaparecen. Si el resultado tiene que viajar por correo o un chat, solo la primera de las tres funciona.

**Si el resultado necesita la red para verse bien.** Un conversor que enlaza una fuente o una hoja de estilos desde una red de distribución de contenido ha producido un archivo que se ve correcto en tu escritorio y se degrada en un tren. También le dice a quien lo abre algo sobre por dónde ha pasado el archivo. Una exportación autocontenida lleva sus estilos en línea y no pide nada. Es un archivo más grande y es la única versión que se comporta igual en todas partes. Un conversor cuya salida necesita la red para abrirse bien no está ofreciendo un archivo autocontenido, sin importar cómo se llame su diálogo de exportación — esto es exactamente [por qué un enlace y un archivo no son el mismo entregable](/blog/share-a-markdown-document-as-a-link).

**Qué mide en realidad el nivel gratis.** Los niveles gratis de aquí cuentan cuatro cosas distintas. Zamzar cuenta archivos: 2 en 24 horas. CloudConvert cuenta conversiones: 10 al día, con cinco tareas simultáneas. FreeConvert cuenta minutos: 20 al día, y no más de 5 en un solo archivo. Convertio limita el tamaño de archivo para uso sin registrarse. Ninguna es comparable con las otras, y la que importa es la que tu carga de trabajo real hace saltar. Veinte minutos diarios es generoso para documentos y escaso para vídeo; dos archivos al día está bien para una persona e inútil para un equipo.

**Qué no puede llevarse el formato consigo.** Toda conversión es lossy en una dirección. Los comentarios de Word, los cambios rastreados y los cuadros de texto no tienen equivalente en Markdown. Las celdas combinadas y las fórmulas de una hoja de cálculo no sobreviven al convertirse en tabla. El PDF cede su estructura por completo y hay que adivinársela de vuelta. Un conversor no puede arreglar esto y los buenos no fingen que pueden; toman una decisión defendible y te dejan verla. Las tablas son donde esto se nota primero y con más claridad, y [qué sobrevive a la conversión de una tabla](/blog/markdown-tables-that-survive-conversion) merece comprobarse en un archivo representativo antes de comprometer un centenar.

**Quién más está en la tubería.** Un conversor alojado corre sobre infraestructura que alquila, en una región que elige, con subprocesadores que enumera en algún sitio. Eso es normal y también es una lista más larga de partes que «yo y una página web». Para un README público no importa. Para un contrato sin firmar, una nota de paciente o el plan de un producto sin anunciar, es la decisión entera, y no es una decisión que te pueda resolver una tabla de funciones.

## Cómo elegir

1. **Empieza por cómo se leería el documento en una filtración.** Si sería embarazoso, contractual o regulado, la conversión tiene que pasar en tu máquina — en el navegador o sin conexión— y la lista de formatos es irrelevante hasta que eso esté decidido. Resolver esto primero elimina la mayor parte del mercado de un solo golpe y te ahorra comparar niveles que no vas a usar.
2. **Lee la frase de retención, no el titular de privacidad.** «Nos tomamos tu privacidad en serio» no es una política; «los archivos convertidos se borran a las 24 horas» sí lo es. Si no encuentras una frase con una duración, asume que la duración es desconocida y trata la subida en consecuencia.
3. **Comprueba qué mide el nivel gratis antes de confiar en él.** Archivos, conversiones, minutos y megabytes son cuatro medidores distintos, y el plan que parece generoso en uno es restrictivo en el tuyo. Convierte primero tu archivo más grande realista en el nivel gratis; ahí es donde salen a la luz los topes de tiempo por archivo y los límites de tamaño.
4. **Abre el resultado en una máquina que nunca ha visto la herramienta.** Otro navegador, otro ordenador, red apagada. Esa única prueba atrapa a la vez fragmentos, imágenes que faltan, hojas de estilo enlazadas a un CDN y exportaciones con forma de zip, y lleva un minuto — mientras que descubrirlo después de haberle enviado el archivo a un cliente cuesta una disculpa.
5. **Cuenta las instalaciones y las cuentas.** Una conversión puntual no debería necesitar un gestor de paquetes; un trabajo nocturno no debería necesitar una pestaña del navegador con una persona delante. Elige según la frecuencia, porque ese desajuste es lo que hace que la gente abandone una buena herramienta al cabo de una quincena.
6. **Asume que vas a hacer esto otra vez.** Si la conversión se repite, quieres una API, una CLI o un binario programable, no una página que visitas. Elegir una herramienta manual para un trabajo recurrente es la versión más común de este error, y cuesta un poco de tiempo cada semana en vez de mucho de una vez — por lo que sobrevive tanto tiempo.

## Conclusión

El mejor conversor de documentos online es aquel cuya respuesta a «¿adónde fue mi archivo?» es «a ningún sitio». Para documentos que todavía no son públicos, eso significa conversión en el navegador. Eso es lo que [hace TransformPipe](/): Markdown a un archivo HTML autocontenido, y HTML, Word, CSV, TSV y JSON de vuelta a Markdown, en tu propia máquina, gratis. Nada se sube cuando no has iniciado sesión, y la pestaña de red lo demuestra. Cuando el formato está más allá de lo que un navegador puede analizar, un servicio del lado del servidor es la herramienta correcta y la política de retención es lo que realmente estás eligiendo entre opciones: CloudConvert, Convertio, Zamzar y FreeConvert declaran todas la suya, y las diferencias son reales. Y cuando la conversión tiene que repetirse, instala Pandoc o aloja Gotenberg, y deja de pensar en ello.

## Preguntas frecuentes

### ¿Cuál es el mejor conversor de documentos online gratis?

Para documentos que preferirías no subir, un conversor que corre en el navegador es la mejor opción gratis, porque no hay nivel que superar ni archivo que borrar después. El conversor de navegador de arriba es gratis para Markdown, HTML, Word, CSV, TSV y JSON. Para formatos que un navegador no puede leer, los niveles gratis de CloudConvert, Zamzar y FreeConvert funcionan para uso ocasional, siempre que hayas leído qué cuenta cada uno.

### ¿Es seguro subir documentos a un conversor online?

Depende por completo del documento y de la política. Para cualquier cosa ya pública, el riesgo es insignificante. Para un contrato, una nota médica o un plan sin publicar, la postura segura es un conversor que no suba nada en absoluto — o uno que corra en tu navegador, o una herramienta instalada en tu máquina. Una política de retención es una promesa sobre una copia que existe, no la ausencia de una copia.

### ¿Cómo puedo convertir un documento sin subirlo?

Usa un conversor que corra en el navegador, o uno que corra sin conexión. Una herramienta de navegador carga su código una vez y luego analiza en local, así que puedes abrir las herramientas de desarrollador, convertir el archivo y ver que la pestaña de red se mantiene vacía. Sin conexión, Pandoc y el modo `--convert-to` de LibreOffice no tocan la red en absoluto.

### ¿Cuánto tiempo guardan mis archivos los conversores online?

Las respuestas publicadas van de minutos a una semana. CloudConvert afirma que los archivos se guardan solo para procesarlos y se borran justo después; Convertio borra las subidas al instante y los convertidos a las 24 horas; Zamzar guarda un archivo convertido hasta 24 horas, y un original hasta siete días si la conversión falló. Comprueba la redacción actual en la propia página del proveedor, porque son políticas, y las políticas cambian.

### ¿Puedo convertir documentos sin conexión?

Sí, y suele ser la mejor respuesta para cualquier cosa repetida o sensible. Pandoc convierte entre unos cuarenta formatos desde la línea de comandos, LibreOffice convierte documentos de oficina y PDFs con `--headless --convert-to`, y un conversor de navegador sigue funcionando una vez cargada la página. Los tres dejan la red fuera de la ecuación.

### ¿Un conversor de documentos online funciona en un móvil?

Los del lado del servidor sí, porque el móvil solo tiene que subir y descargar. Los del navegador también funcionan, pero la conversión corre con el procesador y la memoria del propio móvil, así que un documento muy grande irá más lento ahí que en un portátil. Para un documento normal — un informe, un README, una exportación de hoja de cálculo— cualquiera de los dos vale.

### ¿Cuál es la diferencia entre un conversor de documentos y un editor de documentos?

Un conversor toma un archivo en un formato y te da el mismo contenido en otro; un editor es donde lo escribes. Los editores suelen tener un menú de exportación, lo que los convierte en conversores por accidente, y la exportación sigue el estilo del editor y no el tuyo. Si ya tienes el archivo y solo necesitas otro formato, un conversor son menos pasos y menos sorpresas.
