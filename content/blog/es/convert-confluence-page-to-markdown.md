---
title: "Convertir una página de Confluence a Markdown: cada exportación, y el HTML de debajo"
description: "Cómo llevar una página o un espacio de Confluence a Markdown: por qué no hay exportación nativa, qué conserva el HTML y qué pierde cada macro por el camino"
date: 2026-09-14
tag: Conversión
keywords: confluence a markdown, convertir página de confluence a markdown, exportar confluence a markdown, confluence html a markdown, exportar página de confluence, exportar espacio de confluence html
---

Confluence tiene un botón de exportar, varios formatos detrás de él, y ninguno es Markdown. Eso no
es un descuido: una página de Confluence no se guarda como Markdown, ni como nada parecido. Se
guarda en el formato de almacenamiento propio de Confluence —marcado basado en XHTML con dos
espacios de nombres personalizados encima para macros y referencias a recursos— y cada formato de
exportación que ofrece Confluence es un renderizado de ese formato de almacenamiento hacia otra
cosa. Llegar a Markdown significa elegir uno de esos renderizados y convertirlo una segunda vez.

La consecuencia práctica es que «convertir Confluence a Markdown» siempre es un trabajo de dos
pasos: exportar en un formato que conserve suficiente estructura como para merecer la pena
convertirlo, y luego pasar una conversión real de HTML a Markdown sobre lo que salió. Saltar
directamente a Word o PDF tira la estructura antes de que el segundo paso tenga algo con lo que
trabajar.

### Resumen

**El HTML es la única exportación que merece la pena convertir.** El formato de almacenamiento de
Confluence está basado en XHTML, así que la exportación HTML de un espacio conserva cabeceras,
listas, tablas y enlaces como marcado real que un conversor puede leer — las exportaciones a Word y
PDF del mismo contenido lo comprimen en estilos que se recuperan peor. La exportación de un espacio
necesita permiso de administrador del espacio y solo exporta lo que tu propia cuenta ya puede ver,
a menos que la ejecute un administrador del sitio, en cuyo caso exporta todo sin importar la
visibilidad (comprobado en support.atlassian.com, el 14 de septiembre de 2026). Sea lo que sea que
salga, convértelo con [una conversión de HTML a Markdown](/html-to-markdown) en lugar de con un
script que quita etiquetas con expresiones regulares — el HTML de Confluence está lleno de
atributos al estilo `mso` y `div` envolventes de macro que un extractor ingenuo deja atrás como
ruido visible. Para un espacio entero fusionado en un solo documento legible,
[la conversión de Confluence a Markdown de TransformPipe](/confluence-to-markdown) toma directamente
el zip de la exportación HTML y produce un documento con índice, sin necesidad de recorrer ningún
directorio.

Lo que ninguna de las rutas de abajo recupera: una macro que ejecutaba una consulta en vivo —una
macro de issue de Jira, una página incluida— vuelve como lo que mostraba el día de la exportación,
no como una consulta. Los comentarios de página nunca llegan a una exportación HTML o PDF. Y los
anclajes dentro de la página cambian, porque Confluence genera ids de cabecera que incluyen el
título de la página, así que un enlace escrito contra el formato de id antiguo deja de resolverse
en el momento en que otro renderizador escribe los ids a su manera.

## Por qué no hay una exportación nativa a Markdown

El contenido de una página de Confluence vive en lo que Atlassian llama formato de almacenamiento:
técnicamente XML en lugar de XHTML estricto, con los elementos propios de Confluence en un espacio
de nombres `ac:` y las referencias a recursos —adjuntos, enlaces entre páginas— en un espacio de
nombres `ri:`. Una macro es un `ac:structured-macro` con un atributo de nombre; una imagen es un
`ac:image` que envuelve un `ri:attachment`; un enlace a otra página es un `ac:link` que envuelve un
`ri:page`. Nada de eso tiene equivalente en Markdown, porque Markdown no tiene ningún concepto de
macro — una macro es un fragmento de comportamiento con nombre y parametrizado, y todo el conjunto
de funciones de Markdown es formato de texto estático.

Así que el menú de exportación de Confluence ofrece en su lugar renderizados del formato de
almacenamiento: Word, PDF, HTML, XML y CSV para un espacio. Cada uno de ellos es el aspecto que
tiene el formato de almacenamiento una vez renderizado, con la fidelidad que admita ese formato de
exportación, y se llega a Markdown convirtiendo uno de esos renderizados una segunda vez.

## Comparativa rápida: los formatos de exportación, y qué sobrevive a cada uno

| Exportación | Alcance | Permiso necesario | Qué sale | ¿Merece la pena convertir a Markdown? |
| --- | --- | --- | --- | --- |
| Exportar a Word | Una página | Cualquiera con acceso a la página | Un `.docx` que muchos otros editores renderizan de forma imperfecta | Solo vía una conversión de Word a Markdown; la estructura sobrevive, las cabeceras falsas no |
| Exportar a PDF | Una página | Cualquiera con acceso a la página | Una página renderizada y estática; los comentarios nunca se incluyen | No — a una página renderizada no le queda estructura que extraer |
| Exportación de espacio, HTML | Espacio entero | Administrador del espacio | Zip de archivos HTML renderizados, uno por página, más adjuntos | Sí — esta es la ruta |
| Exportación de espacio, XML | Espacio entero | Administrador del espacio | El propio XML del formato de almacenamiento de Confluence, para reimportar en Confluence | No directamente — está pensado para Confluence, no para un conversor |
| Exportación de espacio, CSV | Espacio entero | Administrador del espacio | Contenido como filas CSV, adjuntos y comentarios incluidos por defecto | No — aplana la estructura que necesita una conversión a Markdown |
| Una app del Marketplace | Página, árbol o espacio, según la app | Lo que exija la app | Markdown directamente, con la forma propia de la app | A veces — comprueba el listado actual; hay varias opciones gratuitas |

Cada afirmación de alcance y permiso de esa tabla viene de la propia documentación de Atlassian:
HTML, XML y CSV solo existen como exportaciones a nivel de espacio y necesitan permiso de
administrador del espacio, y «solo se exportará el contenido visible para ti» en la exportación de
un administrador de espacio — un administrador del sitio que ejecute la misma exportación CSV o XML
lo obtiene todo, restricciones de visibilidad incluidas (comprobado en support.atlassian.com, el 14
de septiembre de 2026). Las entradas de blog se dejan fuera de la exportación PDF y HTML de un
espacio, y los comentarios nunca se incluyen en una exportación PDF, ambas cosas según la misma
página.

## La exportación de un espacio a HTML — la ruta que conserva la estructura

Desde la barra lateral del espacio, Más acciones, Configuración del espacio, General, Exportar
espacio, elige HTML. Lo que vuelve es un zip: un archivo HTML por página, una carpeta de adjuntos,
y un archivo índice que lista las páginas.

| A favor | En contra |
| --- | --- |
| Marcado real — cabeceras, listas, tablas y enlaces sobreviven como elementos, no como píxeles renderizados | Exige permiso de administrador del espacio; un autor de página sin él no puede ejecutar esta exportación por su cuenta |
| Los adjuntos van empaquetados junto a las páginas que los usan | La jerarquía de páginas solo vive en el archivo índice — los nombres de archivo son planos, así que hay que reconstruir las carpetas a partir de él si las quieres |
| Funciona sin conexión una vez descargado — sin dependencia continua de que Confluence esté accesible | Las macros se renderizan en lo que sea que produjeron el día de la exportación, no en nada que Markdown entienda |

**Precio:** gratis — la exportación es parte del propio Confluence, y todo conversor que merezca la
pena ejecutar en el otro extremo también es gratis.

**Detalles técnicos.** Los nombres de archivo exportados están generados por máquina y no son
legibles, así que identificar qué archivo es qué página significa leer el índice en vez de la
lista de directorios. Los anclajes de cabecera son ids propios generados por Confluence, que
incluyen el título de la página como parte de la cadena del id — un enlace escrito contra
`#TituloDePagina-Cabecera` se rompe en el momento en que otro conversor de HTML a Markdown genera
en su lugar un slug plano `#cabecera`, porque los dos esquemas de id no coinciden.

**¿Para quién es esto?** Para cualquiera que convierta más de un par de páginas, y en concreto para
quien necesite que el resultado sea más que una instantánea — HTML es el único formato de
exportación lo bastante denso como para que una conversión real recupere tablas, enlaces y listas
en lugar de un párrafo de texto pegado.

## Convertir el HTML: un analizador real, no una expresión regular

Una vez fuera el HTML, el segundo paso es una conversión ordinaria de HTML a Markdown —
[el mismo trabajo](/html-to-markdown) que convertir cualquier página web guardada— con una
peculiaridad propia de Confluence: el marcado está lleno de estilos en línea con prefijo `mso-` y
`div` envolventes de macro que un script de eliminación de etiquetas ingenuo deja atrás como basura
visible en la salida. Un analizador HTML real que construye un árbol y lo recorre, en vez de una
secuencia de sustituciones de cadenas, es la diferencia entre Markdown limpio y un párrafo lleno de
nombres de clase sueltos.

| En qué se renderizó la macro | Qué ve un conversor | Después de convertir |
| --- | --- | --- |
| Panel de información, nota, aviso, consejo | Un `div` con un nombre de clase y una imagen de icono | Un párrafo normal — dale a mano una convención de cita |
| Macro de bloque de código | Un elemento `pre`, a menudo con tramos de resaltado de sintaxis | Un bloque de código delimitado, normalmente sin el atributo de lenguaje |
| Macro de índice | Una lista renderizada de enlaces de anclaje | Una lista de enlaces a anclas que puede que ya no se resuelvan tras la conversión |
| Macro de árbol de páginas o de hijos | Una lista renderizada de enlaces de vuelta al sitio de Confluence en vivo | Enlaces que apuntan a Confluence, no a los archivos convertidos |
| Macro de extracto o de inclusión | El texto incluido, ya insertado en el momento de la exportación | Texto duplicado, una vez por cada página que lo incluía — sin forma de distinguirlo del contenido original |
| Macro de issue o filtro de Jira | Una tabla congelada, o un enlace llano, según cómo se renderizara la propia macro | Una tabla congelada el día de la exportación, o un enlace muerto si se renderizó como referencia |
| Macro de expandir | El contenido, ya expandido en la exportación estática | Contenido normal — el comportamiento de plegar/expandir no existe en Markdown |
| Macro de adjuntos | Una lista de enlaces a `/download/attachments/...` | Enlaces que necesitan una sesión activa en Confluence para resolverse |

La fila de los adjuntos es la que merece la pena comprobar antes de publicar nada. Esos enlaces
apuntan al propio punto de descarga de Confluence, que espera que hayas iniciado sesión — una
página que parece completa mientras estás conectado a Confluence tiene cajas de imagen rotas para
cualquiera que no lo esté, y una exportación de espacio empaqueta los archivos reales dentro del
zip precisamente para que el conversor pueda reescribir esos enlaces de forma que apunten a las
copias locales en lugar de dejarlos apuntando a una URL que exige sesión.

**Cómo se ve en realidad el HTML crudo.** Un panel de nota no es un `<blockquote>` — se parece más
a esto, recortado de los atributos que un extractor ingenuo deja atrás:

```html
<div class="confluence-information-macro confluence-information-macro-note">
  <span class="aui-icon aui-icon-small aui-iconfont-warning"></span>
  <div class="confluence-information-macro-body">
    <p>Deploys are frozen after Thursday.</p>
  </div>
</div>
```

Una expresión regular que quita etiquetas sobre eso produce un párrafo más una línea vacía suelta
donde estaba el `span` del icono. Un analizador real reconoce la clase del `div` envolvente,
descarta el elemento del icono por completo, y conserva solo el texto — que es todo el argumento a
favor de un conversor que construye un árbol frente a uno que borra corchetes angulares.

### Los anclajes de cabecera: por qué se rompe un enlace dentro de la página aunque la página no cambie

Confluence genera el id de una cabecera combinando el título de la página y el texto de la
cabecera, para que dos páginas con una cabecera redactada de forma idéntica no colisionen, y un
enlace dentro de la página se escribe contra ese id completo. Un conversor que genera ids de la
forma habitual —texto de cabecera en minúsculas, espacios convertidos en guiones, nada más—
produce un id distinto para la misma cabecera, así que cualquier enlace escrito como
`#TituloDePagina-NombreDeSeccion` deja de resolverse aunque la propia sección se haya convertido a
la perfección. La solución es mecánica en cuanto sabes que hay que buscarla: después de convertir,
reescribe los enlaces dentro de la página contra el id que genera de verdad la nueva cabecera, en
vez de suponer que sobrevivió el antiguo.

## Sube el zip de la exportación directamente, fusionado en un solo documento

Para un espacio cuyo destino siempre fue un único documento legible en vez de un directorio de
archivos con una estructura de árbol de páginas que funcione,
[la conversión de Confluence a Markdown de TransformPipe](/confluence-to-markdown) toma el zip de la
exportación HTML del espacio tal como sale de Confluence, convierte el HTML de cada página con el
mismo conversor que está detrás de la página de HTML a Markdown, y fusiona todas las páginas en
orden en un solo documento con un índice generado.

| A favor | En contra |
| --- | --- |
| Sin recorrer directorios, sin leer un archivo índice a mano | Produce un solo documento — no es la forma que quieres si cada página necesita seguir siendo su propio archivo con su propia URL |
| Todas las páginas en orden, con un índice construido para ti, y un adjunto que sea imagen llevado dentro del documento en lugar de seguir apuntando a `/download/attachments/` | No reconstruye el árbol de páginas — nada hace eso sin decidir primero dónde van a vivir los archivos — y un adjunto que no sea imagen conserva el enlace que tenía |
| Corre en el navegador; el zip no se sube cuando no has iniciado sesión | Las pérdidas de macros son idénticas a cualquier otra ruta de HTML a Markdown, porque el HTML de origen es el mismo en ambos casos |

**Precio:** gratis, corre en local.

**¿Para quién es esto?** Para un espacio que se está archivando, una wiki entregada como un solo
documento, o cualquier caso donde a quien lea el resultado le importe más el contenido en orden que
que cada página conserve su propia URL.

## Una app del Marketplace, si la exportación a Markdown se ajusta mejor a tu flujo de trabajo

Varias apps del Marketplace de Atlassian exportan una página, un árbol de páginas o un espacio
entero directamente a Markdown, con opciones gratuitas disponibles junto a las de pago (comprobado
en marketplace.atlassian.com, el 14 de septiembre de 2026) — la categoría existe y cambia con la
frecuencia suficiente como para que nombrar una app concreta aquí quedara desactualizado en menos
de un año, que es exactamente por lo que merece la pena conocer la ruta de exportar-y-luego-convertir
de arriba de todos modos: no depende de nada más que de la propia exportación incorporada de
Confluence y de un conversor, ninguno de los dos una suscripción que pueda cambiar de precio o
desaparecer de un listado del Marketplace.

| A favor | En contra |
| --- | --- |
| Markdown directo, sin un paso de conversión de HTML aparte | Añade una app del Marketplace al sitio, que alguien tiene que aprobar y mantener |
| Algunas conservan la jerarquía de carpetas en la salida automáticamente | Los niveles gratuitos y las funciones cambian; comprueba el listado actual en vez de fiarte de una reseña vieja |
| Puede ser más rápida para una exportación puntual de una sola página | A menudo se necesita un nivel de pago para un espacio entero en vez de una página |

**¿Para quién es esto?** Para un equipo que ya instala apps del Marketplace sin problema y quiere
Markdown en un solo paso, en lugar de mantener por su cuenta un proceso de exportar y convertir.

## La diferencia entre Confluence Server y Data Center

Todo lo dicho arriba sobre el diálogo de exportación describe Confluence Cloud. Las instancias
Server y Data Center tienen el mismo formato de almacenamiento subyacente y la misma categoría de
exportación de espacio a HTML, pero la ruta exacta de menú y el modelo exacto de permisos difieren
según la versión, y —como no hay por defecto en estas instancias un equivalente con API programable
a la Automation de Jira— recurrir a una app del Marketplace (ScriptRunner es una elección habitual
específicamente en Server/Data Center) suele ser la ruta práctica para cualquier cosa que vaya más
allá del diálogo de exportación incorporado. Si tu instancia es Server o Data Center, comprueba las
opciones de exportación en tu propia consola de administración en vez de suponer que la ruta de
menú de Cloud se aplica sin cambios.

## Cómo elegir

1. **Confirma que la exportación HTML está disponible para ti antes de planificar en torno a
   ella.** Necesita permiso de administrador del espacio; si no lo tienes, el primer paso práctico
   es pedírselo a quien sí lo tenga, no buscar un atajo.
2. **Decide si el destino son archivos separados o un solo documento.** Archivos separados con su
   propia URL quiere el proceso de exportar-y-luego-convertir, guardado como un archivo por página.
   Un solo documento quiere la ruta de fusión.
3. **Comprueba antes de convertir nada si había macros que eran consultas en vivo.** Una macro de
   issue de Jira o una macro de árbol de páginas se renderiza como una instantánea; si la versión en
   vivo importa, anótala por separado antes de que la exportación capture una copia congelada.
4. **Lee una página convertida entera antes de fiarte del resto.** Los enlaces de adjuntos, los
   anclajes de cabecera y los `div` renderizados por macros son las tres cosas que se ven bien en un
   diff y mal cuando de verdad se leen.

Si el obstáculo resulta ser el coste y no la mecánica —qué listados del Marketplace son de verdad
gratuitos y no solo de prueba gratuita, y qué rutas necesitan siquiera un administrador—,
[la comparativa de conversores gratuitos de Confluence](/blog/free-confluence-to-markdown-converter)
responde eso por separado.

## Conclusión

Confluence a Markdown es una conversión de dos pasos que lleva puesto el nombre de una exportación
de un paso: elige la salida HTML, porque es la única lo bastante densa como para convertirse bien,
y luego pasa por encima una conversión real de HTML a Markdown en vez de un script de sustituciones
de cadenas. Lo que sobrevive es todo lo que el formato de almacenamiento expresaba como estructura
estática —cabeceras, listas, tablas, enlaces—; lo que no sobrevive es cualquier cosa que fuera el
comportamiento en vivo de una macro en lugar de su salida renderizada el día en que exportaste. Para
un espacio entero pensado para convertirse en un solo documento, sáltate el recorrido de directorios
y entrégale el zip de la exportación a un conversor que lo fusione directamente.
[Cómo se comparan Notion y Obsidian](/blog/markdown-from-notion-obsidian-and-confluence) en el mismo
problema de exportar y luego reparar merece la pena leerlo si Confluence no es la única fuente en
juego.

## Preguntas frecuentes

### ¿Puedo exportar una página de Confluence directamente a Markdown?

No con nada incorporado en Confluence. Toda exportación nativa —Word, PDF, HTML, XML, CSV— es un
renderizado distinto del propio formato de almacenamiento de la página, y ninguno es Markdown;
llegar hasta ahí significa convertir una de esas exportaciones una segunda vez, o instalar una app
del Marketplace que haga los dos pasos por ti.

### ¿Qué formato de exportación de Confluence debería convertir?

HTML. Es la única exportación lo bastante densa como para conservar cabeceras, listas, tablas y
enlaces como marcado real en lugar de texto aplanado o píxeles renderizados, que es lo que necesita
hacer bien su trabajo un conversor de HTML a Markdown.

### ¿Necesito ser administrador del espacio para exportar un espacio de Confluence?

Sí, específicamente para las exportaciones a nivel de espacio en HTML, XML y CSV — la exportación a
Word o PDF de una sola página solo necesita el acceso que ya tienes para leer esa página. Si no eres
administrador del espacio, exportar un espacio entero significa pedírselo a alguien que lo sea.

### ¿Qué pasa con las macros de issues de Jira y otro contenido en vivo al exportar?

Se congelan. Una macro de issue de Jira, una vista de árbol de páginas, un extracto incluido — cada
uno se exporta como lo que sea que se renderizó el día de la exportación, una instantánea en vez de
una consulta, y nada del formato de exportación lo mantiene en vivo.

### ¿Por qué mis imágenes convertidas aparecen como enlaces rotos?

Porque los enlaces de adjunto en línea de Confluence apuntan a URLs `/download/attachments/...` que
esperan una sesión activa e iniciada. Una exportación de espacio empaqueta los archivos de adjunto
reales dentro de su zip precisamente por eso — la solución es reescribir los enlaces para que
apunten a esos archivos locales, no a las URLs originales de Confluence.

### ¿Puedo convertir una página de Confluence sin subirla a ningún sitio?

Sí, si el conversor corre en tu navegador en lugar de enviar el archivo a un servidor — algo que
merece la pena confirmar para cualquier cosa que no debería salir de tu máquina, vigilando el panel
de red mientras conviertes.

### ¿Por qué se rompen los enlaces dentro de la página después de convertir una página de Confluence?

Porque Confluence genera los ids de cabecera combinando el título de la página y el texto de la
cabecera, y un conversor de HTML a Markdown estándar genera un id más simple solo a partir del texto
de la cabecera. La sección en sí se convirtió correctamente — solo cambió el id— así que la
solución es reescribir el enlace contra el id nuevo, no volver a convertir el contenido.

### ¿Confluence Server o Data Center son distintos de Cloud en esto?

El formato de almacenamiento y la exportación HTML son la misma idea en los dos, pero la ruta exacta
de menú, el modelo de permisos y las apps del Marketplace disponibles difieren según la versión y la
edición. Server y Data Center recurren más a menudo a una app del Marketplace como ScriptRunner para
cualquier cosa que vaya más allá del diálogo de exportación incorporado, ya que no hay una regla de
Automation al estilo Cloud a la que recurrir.
