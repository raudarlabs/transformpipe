---
title: "Convertir una bóveda de Obsidian a Markdown: wikilinks, embebidos y qué se queda"
description: "Una bóveda de Obsidian ya son archivos Markdown — qué arregla de verdad pasarla a Markdown estándar, desde wikilinks y embebidos hasta callouts y Dataview"
date: 2026-09-14
tag: Conversión
keywords: obsidian a markdown, convertir bóveda de obsidian, wikilinks de obsidian a markdown, exportar obsidian a markdown, vault de obsidian a markdown, dialecto markdown de obsidian
---

Una bóveda de Obsidian es una carpeta de archivos `.md` que vive en el disco, lo cual hace que «convertirla a Markdown» suene a contradicción — ya es Markdown. La trampa está en el «ya»: Obsidian escribe su propio dialecto encima del núcleo CommonMark, y cuatro construcciones propias —wikilinks, embebidos, referencias a bloque y callouts— se leen como sintaxis rota o texto plano en cualquier cosa que no sea Obsidian. No hay nada que exportar, porque no existe un botón de exportar ni una conversión de formato en el sentido habitual. Lo que hay es una reescritura, y tiene que pasar antes de que la bóveda salga de Obsidian para siempre.

### Resumen rápido

La bóveda no necesita ningún paso de exportación —los archivos ya están en el disco—, pero cuatro convenciones propias de Obsidian no sobreviven al contacto con un analizador de Markdown estándar: `[[wikilinks]]`, `![[embebidos]]`, las referencias a bloque `[[Nota#^id-de-bloque]]`, y los callouts `> [!note]`. Un `[[wikilink]]` no es un enlace a nada fuera de Obsidian hasta que se reescribe como una ruta relativa real; un embebido no tiene equivalente de transclusión en Markdown estándar en absoluto, y se convierte en una copia insertada del contenido o en un enlace normal; una referencia a bloque no tiene literalmente nada a lo que apuntar en cuanto desaparece el id a nivel de bloque; y un callout es una cita en bloque que lleva puesto un marcador que la mayoría de renderizadores muestra como texto plano. Desactiva «Use \[\[Wikilinks\]\]» en Ajustes, Archivos y enlaces, para que los enlaces nuevos se escriban como Markdown estándar de ahí en adelante — el ajuste solo se aplica a los enlaces escritos después de cambiarlo, así que una bóveda ya existente necesita de todos modos reescribir los que ya tiene. Para una bóveda entera convertida en un solo documento con los wikilinks ya resueltos, [la conversión de Obsidian a Markdown de TransformPipe](/obsidian-to-markdown) lee directamente una bóveda comprimida en zip y hace la reescritura en la misma pasada.

Lo que esto no arregla, porque nada puede: una consulta de Dataview solo pintaba una tabla dentro de Obsidian, en el momento de mostrarse, desde un plugin — el texto de la consulta se convierte bien, como bloque de código, y la tabla que solía producir simplemente no está ahí para que la vea un lector fuera de Obsidian.

## Por qué una bóveda de archivos Markdown sigue necesitando conversión

CommonMark y GitHub Flavored Markdown, los dos dialectos que espera casi cualquier herramienta fuera de Obsidian, no tienen concepto de wikilink, de embebido, de referencia a bloque ni de bloque de callout. Obsidian añadió las cuatro cosas como extensiones propias sobre la sintaxis estándar, porque son genuinamente útiles dentro de una base de conocimiento personal que ya conoce cada archivo que contiene — un wikilink puede resolverse a una nota por su título sin que especifiques una ruta, porque Obsidian indexa toda la bóveda. En el momento en que un archivo sale de ese entorno indexado —pegado en un README de GitHub, abierto en un editor de texto plano, pasado a un generador de sitios estáticos—, el índice desaparece y esos atajos dejan de resolverse a nada.

## Comparativa rápida: qué necesita reescritura, y qué la hace

| Construcción de Obsidian | Lo que ve un analizador estándar | Arreglo |
| --- | --- | --- |
| `[[Nota]]` | Texto literal: dos corchetes de apertura, la palabra Nota, dos de cierre | Reescribir como `[Nota](nota.md)`, resolviendo la ruta relativa dentro de la bóveda |
| `[[Nota\|Texto mostrado]]` | Lo mismo, literal | Reescribir como `[Texto mostrado](nota.md)` |
| `![[Nota]]` (embebido de nota) | Texto literal | Insertar el contenido de la nota, o dejar un enlace normal — la transclusión no tiene equivalente estándar |
| `![[imagen.png]]` (embebido de archivo) | Texto literal | Reescribir como `![](imagen.png)`, sintaxis de imagen estándar |
| `[[Nota#Encabezado]]` | Texto literal | Reescribir como `nota.md#encabezado`, comprobando la propia regla de slug del renderizador de destino |
| `[[Nota#^id-de-bloque]]` | Texto literal | No hay destino al que enlazar fuera de Obsidian — insertar el texto citado en su lugar |
| `^id-de-bloque` al final de una línea | Un acento circunflejo y una palabra sueltos, impresos tal cual | Borrarlo en cuanto nada lo referencie |
| Callout `> [!note]` | Una cita en bloque con el texto literal `[!note]` en su primera línea | Quitar el marcador, conservar la cita, y anotar el tipo de otra manera si importa |
| Un bloque ` ```dataview ` | Un bloque de código mostrando el texto de la consulta | Nada que convertir — la tabla nunca estuvo en el archivo |
| `%%comentario%%` | El propio texto, visible, porque la sintaxis de comentario en línea de Obsidian tampoco es estándar | Borrarlo antes de convertir |
| Frontmatter YAML (bloque `---`) | Normalmente bien, pero un analizador que no lo reconozca renderiza el `---` de apertura como una línea horizontal | Quitarlo, o convertirlo a la propia convención de frontmatter del formato de destino |

## Desactivar los wikilinks, y qué arregla y qué no

El ajuste vive en Ajustes, Archivos y enlaces, «Use \[\[Wikilinks\]\]» — desactívalo y Obsidian escribe enlaces Markdown estándar, `[texto](ruta)`, para cada enlace creado desde ese momento (comprobado en obsidian.md y en la propia documentación de ajustes de Obsidian, el 14 de septiembre de 2026). El autocompletado sigue funcionando exactamente igual — escribe `[[`, elige una nota entre las sugerencias— el único cambio es lo que se escribe en el disco una vez confirmada la elección.

| A favor | En contra |
| --- | --- |
| Coste de migración cero para los enlaces escritos después del cambio | Cada enlace escrito antes del cambio queda intacto — una bóveda ya existente necesita de todos modos una pasada de reescritura aparte |
| Hace la bóveda inmediatamente más interoperable de cara al futuro | Los embebidos, las referencias a bloque y los callouts no se ven afectados — este ajuste solo toca los enlaces normales |
| Sin plugin, sin exportación, sin dependencia nueva | El enlazado automático por título sigue asumiendo que el archivo existe en la ruta que Obsidian resolvió al crear el enlace |

**¿Para quién es?** Para cualquiera que planee seguir escribiendo en Obsidian mientras hace la bóveda progresivamente más portátil. No es una herramienta de migración por sí sola — detiene el crecimiento del problema, y el conjunto de wikilinks ya existente sigue necesitando una pasada.

## Reescribir wikilinks y embebidos en una bóveda ya existente

Para una bóveda que ya lleva meses o años de wikilinks dentro, el arreglo práctico es un script: recorrer cada archivo `.md`, encontrar los patrones de wikilink y embebido, resolver cada destino contra el propio índice de archivos de la bóveda, y reescribir en el sitio.

```text
WIKILINK = /!?\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/

for file in vault:
    text = read(file)
    text = replace_all(text, WIKILINK, (whole, target, shown) => {
        path = resolve_in_vault(target)      # match by filename, vault-wide
        text_shown = shown ?? target
        if whole starts with "!" and target looks like an image or attachment:
            return "![](" + path + ")"
        if path exists:
            return "[" + text_shown + "](" + path + ")"
        return text_shown                     # nothing to link to; keep the words
    })
    write(file, text)
```

El detalle que suele pillar en el primer intento: `resolve_in_vault` tiene que buscar en toda la bóveda por nombre de archivo, no solo en la carpeta actual, porque la propia resolución de enlaces de Obsidian hace exactamente eso — un wikilink escrito como `[[Meeting Notes]]` desde cualquier nota de la bóveda encuentra un archivo llamado `Meeting Notes.md` estuviera donde estuviera, y un script que solo mire la carpeta de la nota que enlaza producirá en silencio enlaces muertos para cualquier cosa que no esté guardada al lado.

**Una nota sobre la ambigüedad.** Dos archivos con el mismo nombre en carpetas distintas son indistinguibles para un `[[Meeting Notes]]` a secas — Obsidian resuelve al que encuentre primero según su propia regla interna, y un script de reescritura hereda la misma ambigüedad. Si una bóveda tiene nombres de archivo duplicados entre carpetas, resuelve eso antes de confiar en cualquier reescritura automática de los enlaces entre ellos.

## Callouts, Dataview, y el ecosistema de plugins en general

Un callout —`> [!note]`, `> [!warning]`, y Obsidian trae de serie alrededor de una docena de tipos— es una cita en bloque con un marcador entre corchetes en su primera línea. Un renderizador de Markdown estándar muestra ese marcador como texto literal en lugar de dar estilo al bloque, así que el arreglo es quitar el marcador (perdiendo la distinción visual entre una nota y una advertencia) o mapear cada tipo a una convención propia del formato de destino, si es que ese destino admite callouts con estilo.

Dataview es el caso que la gente interpreta peor. Una consulta de Dataview se escribe como un bloque de código con `dataview` como cadena informativa — ese bloque se convierte perfectamente bien, en un bloque de código normal que muestra el texto de la consulta. Lo que no se convierte es la tabla que Dataview generaba, porque esa tabla nunca se escribió en el archivo: el plugin Dataview de Obsidian ejecuta la consulta y renderiza el resultado en el momento de mostrarse, cada vez que se abre la nota, y el archivo de origen solo contuvo siempre la pregunta, nunca la respuesta.

La misma lógica se aplica a cualquier plugin que renderice algo que el propio archivo no contiene: una vista de mapa mental, una vista de grafo, un canvas. Si el valor de una nota depende del renderizado de un plugin en lugar de su texto sin procesar, convertir solo el texto siempre se sentirá como una pérdida, porque lo es — el renderizado nunca se guardó, para empezar.

## Los alias: la otra forma en que un destino de wikilink es ambiguo

El frontmatter YAML de una nota puede llevar una lista `aliases`, y Obsidian resuelve un `[[wikilink]]` contra cualquiera de los alias de una nota de destino con la misma facilidad que contra su nombre de archivo real. Eso resulta conveniente dentro de la bóveda —renombrar una nota sin romper cada enlace a su título antiguo, siempre que ese título antiguo se conserve como alias—, y es una cosa más de la que un script de reescritura tiene que ocuparse: `resolve_in_vault` necesita revisar también el frontmatter `aliases` de cada archivo, además de su nombre de archivo, o un enlace escrito contra un alias se resuelve a nada y cae de vuelta a texto plano, sin enlazar.

## Un plugin de la comunidad, si prefieres no escribir el script

El propio directorio de plugins de Obsidian trae plugins de exportación construidos por la comunidad —[obsidian-markdown-export-plugin](https://github.com/bingryan/obsidian-markdown-export-plugin) es uno— que exportan una nota o una carpeta entera como un paquete con sus imágenes enlazadas empaquetadas junto a ella y los enlaces internos reescritos para que se resuelvan fuera de la bóveda. Es una opción real para quien prefiera instalar un plugin a escribir el resolutor de arriba, al precio de añadir un plugin de la comunidad a tu bóveda y confiar en su propia lógica de reescritura en lugar de una que puedas leer línea a línea.

| A favor | En contra |
| --- | --- |
| No hay que escribir ni mantener ningún script propio | Una dependencia del propio ritmo de publicación y decisiones de un plugin de la comunidad |
| Empaqueta los archivos de imagen junto al Markdown exportado | El comportamiento con referencias a bloque, callouts y Dataview es decisión del plugin, no tuya |
| Funciona desde dentro de la propia interfaz de Obsidian, sin herramienta aparte | Comprueba la ficha actual del plugin para ver su licencia y estado de mantenimiento antes de confiar en él para algo que no puedas rehacer a mano |

**¿Para quién es?** Para quien exporte unas pocas notas a la vez desde dentro de Obsidian, en lugar de programar la migración de toda una bóveda o recurrir a una fusión en el navegador.

## Hacer una bóveda portátil antes de necesitarlo

Cuatro costumbres mantienen una bóveda convertible sin cambiar cómo escribes cada día:

- **Desactiva los wikilinks** para que los enlaces nuevos sean estándar de aquí en adelante.
- **Mantén los adjuntos dentro de la carpeta de la bóveda**, no referenciados desde fuera, para que las rutas relativas se sostengan cuando la carpeta se copie o se comprima.
- **Prefiere un enlace a un embebido** donde cualquiera de los dos sirva — un enlace se degrada con elegancia a un enlace; un embebido se degrada a una copia duplicada de contenido o a un simple par de corchetes, según el conversor.
- **Trata las referencias a bloque como una ayuda de navegación personal**, no como una manera de construir un argumento con piezas sueltas, porque una referencia a bloque no tiene ninguna vía de degradación en Markdown estándar — fuera de Obsidian no es un enlace roto, es nada.

## Subir la bóveda directamente, fusionada en un solo documento

La reescritura de arriba merece la pena para una bóveda que se va a quedar como carpeta de archivos separados. Si el destino siempre fue un solo documento —una entrega, un archivo de las notas de un proyecto—, [la conversión de Obsidian a Markdown de TransformPipe](/obsidian-to-markdown) se salta la reescritura archivo por archivo: comprime la carpeta de la bóveda y súbela, y cada nota se convierte en una sección de un solo documento, en su orden original, con un índice generado. Los wikilinks, los alias y los anclajes de encabezado se resuelven a las palabras que mostraban en vez de a una ruta, por la misma razón que un enlace entre páginas en una exportación fusionada de Notion o Confluence conserva sus palabras en lugar de su dirección — una vez que cada nota es una sección del mismo documento, ya no queda ningún sitio al que un enlace pueda apuntar.

| A favor | En contra |
| --- | --- |
| Sin script, sin índice de nombres de archivo que construir tú mismo por toda la bóveda | Produce un solo documento — la forma equivocada si las notas necesitan seguir siendo archivos separados con su propia ruta |
| El frontmatter se elimina automáticamente, y un embebido `![[imagen.png]]` pasa a ser la imagen misma, llevada dentro del documento | El techo son dos megabytes de imágenes por documento; un adjunto que no sea imagen — un PDF, una nota de audio — sigue quedando como texto en cursiva |
| Se ejecuta en el navegador; la bóveda nunca se sube si no has iniciado sesión | Las tablas de Dataview y demás contenido renderizado por plugins siguen ausentes, igual que en cualquier otra vía, porque el archivo de origen nunca las tuvo |

**Precio:** gratis, se ejecuta en local.

**¿Para quién es?** Para una bóveda, o parte de ella, que se entrega o se archiva como un solo documento legible en vez de conservarse como un conjunto vivo de archivos enlazados por separado.

## Cómo elegir

1. **Decide si la bóveda se queda como carpeta de archivos o pasa a ser un solo documento.** Archivos separados con enlaces relativos que funcionen quiere el script de reescritura en el sitio. Un solo documento quiere la vía de fusión — resuelve el mismo problema de wikilinks de otra manera, quitando la necesidad de que exista un destino aparte al que resolverse.
2. **Comprueba si hay bloques de Dataview y otro contenido renderizado por plugins antes de convertir nada.** Se convierten correctamente como texto de consulta, y la tabla o vista que solían producir no se puede recuperar del archivo — anota dónde importaban esas tablas mientras todavía las puedes ver renderizadas.
3. **Vigila los nombres de archivo duplicados entre carpetas.** Un wikilink hacia un nombre no único es ambiguo incluso dentro de Obsidian; un script de reescritura hereda esa ambigüedad en lugar de resolvértela.
4. **Desactiva los wikilinks de cara al futuro sea cual sea la vía que elijas para lo que ya existe.** No cuesta nada y detiene el crecimiento del problema mientras te ocupas de lo que ya hay.

Si la pregunta es qué herramienta y no qué vía —todas las opciones aquí son gratis, y se diferencian por el coste de configuración y por cuánto control te dan sobre los casos ambiguos—, [la comparativa de conversores gratuitos de Obsidian](/blog/free-obsidian-to-markdown-converter) es la respuesta más corta.

## Conclusión

Una bóveda de Obsidian no necesita tanto exportarse como traducirse: los archivos ya son Markdown, y el trabajo está enteramente en los cuatro sitios donde Obsidian escribió su propia sintaxis encima —wikilinks, embebidos, referencias a bloque y callouts. Reescribirlos en el sitio mantiene la bóveda como una carpeta de archivos separados que funcionan; fusionar toda la bóveda en un solo documento resuelve el mismo problema de wikilinks quitando por completo la necesidad de que exista un destino aparte. De cualquier manera, nada recupera una tabla de Dataview ni la vista renderizada de un plugin, porque ninguna de las dos se guardó nunca en el archivo — compruébalo mientras la bóveda todavía está abierta en Obsidian, no después. [Cómo se comparan Notion y Confluence](/blog/markdown-from-notion-obsidian-and-confluence) en el mismo problema de exportar y luego reparar merece leerse si Obsidian no es la única fuente en juego.

## Preguntas frecuentes

### ¿Tiene Obsidian una función de exportar a Markdown?

No, y no la necesita — una bóveda ya es una carpeta de archivos `.md` en el disco. Lo que necesita conversión es la propia sintaxis de Obsidian montada sobre el Markdown estándar: wikilinks, embebidos, referencias a bloque y callouts, ninguno de los cuales lee bien un analizador estándar.

### ¿Cómo convierto los `[[wikilinks]]` de Obsidian a enlaces Markdown estándar?

Desactiva «Use \[\[Wikilinks\]\]» en Ajustes, Archivos y enlaces, para todo lo escrito de ahí en adelante. Para los enlaces que ya están en la bóveda, un script necesita encontrar cada `[[wikilink]]`, resolver el nombre de archivo de destino contra toda la bóveda, y reescribirlo como un enlace estándar `[texto](ruta)`.

### ¿Qué pasa con las consultas de Dataview cuando convierto una bóveda?

La consulta en sí se convierte bien, como un bloque de código que muestra el texto de la consulta. La tabla que solía renderizar no se convierte, porque nunca se guardó en el archivo — Dataview la genera en el momento de mostrarse, dentro de Obsidian, desde un plugin.

### ¿Puedo conservar los callouts de Obsidian al convertir a Markdown estándar?

No como callouts con estilo, ya que `> [!note]` es sintaxis propia de Obsidian. El arreglo seguro es quitar el marcador entre corchetes y conservar la cita en bloque; si el tipo importa, anótalo en el propio texto, porque un renderizador estándar no va a diferenciar por sí solo el estilo de los distintos tipos de callout.

### ¿En qué se convierte un embebido como `![[Nota]]` fuera de Obsidian?

En texto literal —dos signos de exclamación pegados a corchetes, el nombre de la nota, dos corchetes de cierre— salvo que algo lo reescriba. No existe una sintaxis de transclusión en Markdown estándar, así que los arreglos honestos son insertar directamente el contenido de la nota referenciada, o convertir el embebido en un enlace normal, según si el formato de destino tiene algún equivalente.

### ¿Puedo convertir una bóveda sin subirla a ninguna parte?

Sí, si el conversor se ejecuta en local en tu navegador en lugar de enviar los archivos a un servidor — merece la pena comprobarlo para una bóveda con algo sensible dentro, vigilando el panel de red mientras conviertes y confirmando que no sale nada.

### Mi wikilink apunta al título antiguo de una nota. ¿Por qué sigue funcionando en Obsidian pero no después de convertir?

Porque el título antiguo probablemente está guardado en el frontmatter `aliases` de esa nota, y Obsidian resuelve los wikilinks contra los alias igual que contra los nombres de archivo reales. Un script de reescritura o un conversor necesita revisar esa misma lista de alias, o un enlace escrito contra el título antiguo de una nota renombrada se resuelve a nada en cuanto sale de Obsidian.

### ¿Necesito convertir las referencias a bloque antes de compartir una bóveda fuera de Obsidian?

Sí, en el sentido de que nada más las va a renderizar de forma útil — `[[Nota#^id-de-bloque]]` no tiene ningún equivalente fuera de Obsidian. El único arreglo honesto es insertar directamente el texto citado donde estaba la referencia, ya que no hay ningún destino externo al que pueda apuntar.
