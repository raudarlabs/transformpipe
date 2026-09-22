---
title: "Imágenes y enlaces que siguen funcionando después de enviar el archivo"
description: "Rutas relativas, URLs raw de GitHub, data URIs, texto alternativo, SVG y anclas: por qué se rompe una imagen o un enlace al mover el archivo"
updated: 2026-09-09
date: 2026-08-01
tag: Sintaxis
keywords: imagen markdown no se muestra, enlace relativo markdown roto, ancla markdown a un encabezado, imagen base64 markdown, html autocontenido, html de un solo archivo, tamaño de imagen en markdown, texto alternativo markdown, url raw de imagen en github, imagen svg en markdown, verificador de enlaces rotos markdown
---

Un archivo Markdown se escribe dentro de una carpeta, y la mitad de él depende de esa carpeta en silencio. `![Flow](img/flow.png)` se ve bien en el editor, se ve bien en el repositorio, y muestra un icono de imagen rota en el momento en que un colega abre el HTML convertido desde su carpeta de descargas. Nada del archivo cambió. Sus vecinos sí.

### Resumen rápido

Las imágenes y los enlaces cruzados se resuelven contra el lugar donde termina la página renderizada, no contra la carpeta en la que escribiste, así que mover el archivo mueve la respuesta. Las URLs públicas absolutas y los data URIs sobreviven el viaje; las rutas relativas y las relativas a la raíz solo sobreviven si la carpeta o el sitio viaja con ellas. Las anclas de encabezado se rompen por otra razón — GitHub, Pandoc, markdown-it y marked convierten cada uno un encabezado en un id de forma distinta, así que un enlace que funciona en el repositorio puede fallar en la exportación. Convierte una vez, lee los valores de `src` y `href` que el conversor produjo de verdad, y arregla los que solo se resuelven desde tu propio escritorio.

El fallo tiene una firma: quien lo escribió nunca lo ve. En la máquina donde se escribió el documento cada ruta se resuelve, porque esa máquina es para la que se escribieron las rutas. El lector recibe cuadros grises con iconos de esquina rota, decide que el documento está a medio terminar, y por lo general no dice nada.

Hay dos sistemas separados en juego y fallan por razones distintas. Una imagen es una referencia a bytes guardados en otro lugar, y se rompe cuando ese otro lugar se mueve. Un ancla es una referencia a un id que el renderizador inventó al convertir, y se rompe cuando un renderizador distinto inventa un id distinto. Ambos son promesas sobre un lugar, y ambos se comprueban en el momento en que otra persona abre el archivo — que es el peor momento posible para descubrirlo.

## Los tres tipos de ruta, y qué sobrevive cada uno

Una URL en Markdown viene en unas pocas formas, y cada una asume algo distinto sobre dónde va a terminar el documento.

| Escrita como | Tipo | Se resuelve contra | ¿Sobrevive al envío? |
| --- | --- | --- | --- |
| `img/flow.png` | relativa | la carpeta desde la que se sirve la página | solo si esa carpeta viaja también |
| `../assets/flow.png` | relativa | la carpeta de arriba | igual, y un nivel más frágil |
| `/assets/flow.png` | relativa a la raíz | la raíz del sitio actual | solo dentro de ese mismo sitio |
| `https://example.com/flow.png` | absoluta | nada, ya está completa | sí, mientras el host la siga sirviendo |
| `data:image/png;base64,…` | ninguna — los bytes están aquí | nada en absoluto | sí, a costa del tamaño |

El detalle que atrapa a la gente: un enlace relativo de Markdown se resuelve contra la URL de la *página renderizada*, no contra la carpeta donde vivía el archivo `.md`. Convierte `docs/guide.md`, abre el HTML desde tu escritorio, y `img/flow.png` ahora significa una carpeta `img` en tu escritorio. La ruta nunca estuvo mal; estaba respondiendo una pregunta que ya nadie hace.

Lo relativo a la raíz es la forma que la gente juzga peor. Una barra inicial no significa «la cima de mi proyecto» — significa la raíz de cualquier origen que esté sirviendo la página. Despliega el mismo archivo en un sitio donde los recursos viven en `/assets/`, y es la más estable de las formas relativas. Ábrelo como archivo local, y el navegador lee la barra como la raíz del disco: `/assets/flow.png` se vuelve `C:\assets\flow.png` en Windows y `/assets/flow.png` en un Mac, ninguno de los cuales existe. Las rutas relativas a la raíz son para sitios. Son activamente peores que las rutas relativas simples para un archivo que alguien descarga.

Las URLs absolutas sobreviven a todo salvo al host. Son la única forma que funciona idénticamente en un repositorio, una exportación, una wiki y un correo — siempre que el host sea público, se mantenga en pie, y no le importe que lo enlacen desde otro lado. Esa última condición hace más trabajo del que parece: las imágenes servidas desde un bucket privado, la CDN de una herramienta de chat, un adjunto de Confluence o una URL firmada todas devuelven una dirección con apariencia absoluta que solo funciona mientras el lector lleve tu sesión encima o antes de que caduque la firma.

### Adónde termina el archivo, y qué rutas siguen resolviendo

El mismo documento va a cinco lugares distintos durante su vida. Esto es lo que le pasa a cada tipo de ruta en cada parada.

| Destino | `img/flow.png` | `../assets/flow.png` | `/assets/flow.png` | `https://…/flow.png` | Data URI |
| --- | --- | --- | --- | --- | --- |
| El `.md` renderizado en una página de repositorio | funciona | funciona, si la carpeta superior está en el repositorio | falla — se resuelve contra la raíz del alojador de código | funciona | funciona |
| Un HTML convertido en la carpeta de descargas de alguien | falla salvo que también copiaras `img/` | falla | apunta a la raíz de su disco | funciona, con conexión | funciona |
| El cuerpo de un correo | falla | falla | falla | solo si el cliente acepta buscar imágenes remotas | funciona |
| Un sitio estático con los recursos desplegados al lado | funciona | funciona, hasta que mueves la página | funciona | funciona | funciona |
| Un PDF impreso desde el navegador | se incrusta solo si resolvía en el momento de imprimir | igual | igual | igual | funciona |
| Pegado en una wiki o un ticket | falla | falla | falla | funciona si el host es público | normalmente el saneador de la wiki lo elimina |

La fila del PDF es la que vale la pena mirar fijamente. Imprimir no arregla una ruta rota, la fotografía: lo que el navegador tenía en ese momento es lo que termina en el archivo, así que un documento impreso en la máquina de quien lo escribió se ve perfecto y uno impreso por el destinatario tiene huecos en exactamente los mismos lugares que tenía su pantalla. Si el destino es un PDF, arregla primero las imágenes: imprimir asume que la página ya renderiza bien.

### GitHub: una URL de blob es una página, no una imagen

Abre una imagen dentro de un repositorio, copia lo que hay en la barra de dirección, y obtienes algo como `https://github.com/acme/docs/blob/main/assets/flow.png`. Pégalo dentro de `![Flow](…)` y el lector recibe una imagen rota, porque esa URL no devuelve un PNG. Devuelve una página HTML — el visor de archivos, con la cabecera, la ruta de navegación, la barra lateral y la imagen adentro. El navegador pidió una imagen y le entregaron una página web, así que dibujó el icono de imagen rota.

| Forma de la URL | Qué devuelve el servidor | ¿Se puede usar en `![]()`? |
| --- | --- | --- |
| `https://github.com/o/r/blob/main/a/flow.png` | una página HTML que muestra la imagen | no |
| `https://github.com/o/r/blob/main/a/flow.png?raw=true` | una redirección a los bytes del archivo | sí |
| `https://raw.githubusercontent.com/o/r/main/a/flow.png` | los bytes del archivo | sí |
| `assets/flow.png`, relativa, dentro de un `.md` en el repositorio | se resuelve contra la carpeta del propio archivo | sí, en la página del repositorio |

La propia guía de GitHub recomienda preferir enlaces relativos para imágenes que viven en el repositorio, y da `../blob/main/assets/images/electrocat.png?raw=true` como la forma a usar dentro de issues, pull requests y comentarios — con la advertencia de que esas formas solo funcionan en un repositorio privado para quien ya tiene acceso de lectura a él (comprobado en docs.github.com, el 9 de septiembre de 2026).

Esas URLs guardan dos trampas más. El nombre de la rama es parte de la dirección, así que `…/blob/main/…` sigue a `main` y se mueve cuando `main` se mueve, mientras que `…/blob/a1b2c3d/…` se ancla a un commit y nunca cambia — elige a propósito, porque un diagrama que se actualiza en silencio es exactamente lo que querías o un documento citando una imagen que ya no coincide con su prosa. Y una URL raw de un repositorio privado no es una URL pública; necesita la sesión de quien la lee de la misma forma que un adjunto de chat, que es por lo que una captura pegada desde Slack se renderiza para ti y para nadie más.

## Por qué no se muestra una imagen de Markdown

Cuando una imagen de Markdown no aparece, la causa casi siempre es una de estas.

- **La ruta apunta a la ubicación antigua.** Mueve el archivo, mueve las imágenes, o cambia a URLs absolutas.
- **No coincide el uso de mayúsculas.** `Diagram.PNG` y `diagram.png` son un solo archivo en un disco de Mac o Windows, que ignora las mayúsculas por defecto, y dos en la máquina Linux que sirve tu sitio.
- **Hay un espacio en el nombre del archivo.** Envuelve el destino en corchetes angulares, `![Flow](<my diagram.png>)`, o codifícalo con porcentajes como `my%20diagram.png`.
- **La imagen está detrás de un inicio de sesión.** Las URLs pegadas de una herramienta de chat, un repositorio privado o una wiki suelen necesitar la sesión de quien lee; a un desconocido no le llega nada.
- **Enlazaste una página en vez de un archivo.** El caso de la URL de blob de arriba, y el mismo error pasa con las nubes de almacenamiento, que entregan una URL de visor en vez de los bytes.
- **La página es HTTPS y la imagen es HTTP.** Los navegadores bloquean el contenido mixto, en silencio, y la consola es el único lugar donde lo dice.
- **Un saneador quitó la etiqueta.** Una lista de permitidos que acepta `img` puede seguir rechazando una fuente `data:` o un elemento `svg`, y lo que rechaza lo elimina.
- **La etiqueta nunca fue una etiqueta.** Un `\!` escapado, una imagen dentro de un bloque de código con cercas, o una comilla invertida suelta, y el renderizador emitió texto que parece una etiqueta de imagen porque lo es.

La forma más rápida de distinguir estos casos es dejar de adivinar y preguntarle al navegador. Abre la página, abre la pestaña de red, recarga, y lee el código de estado de la imagen que falló.

| Qué ves | Qué dice la pestaña de red | Suele significar |
| --- | --- | --- |
| Icono roto, texto alternativo visible | 404 | la ruta está mal para donde se sirve la página |
| Icono roto | 403 | repositorio privado, URL firmada caducada, o protección contra hotlinking |
| Icono roto | 200 con `text/html` | enlazaste una página, no un archivo |
| Nada, ninguna petición | sin entrada | escapado, saneado, o dentro de un bloque de código |
| Bien para ti, roto para ellos | 200 para ti | la imagen está detrás de tu sesión |

Esa tabla es también la razón para revisar el archivo *convertido* en vez de la vista previa del editor. Una vista previa resuelve las rutas contra la carpeta donde vive la fuente, que es exactamente la suposición que deja de sostenerse en el momento en que el documento viaja.

## Los data URIs, y la aritmética detrás de ellos

Un data URI mete los bytes en el propio documento: una imagen base64 en Markdown es una imagen normal con el archivo codificado donde iría la ruta.

```markdown
![Company logo](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...)
```

El intercambio honesto: base64 codifica tres bytes como cuatro caracteres, así que la imagen crece alrededor de un tercio antes de contar el resto del documento. Una captura de 2 MB llega como unos 2,7 MB de texto sentados en medio de tu prosa, imposible de comparar en un diff, y reenviada con cada copia. Los navegadores tampoco la pueden cachear por separado.

Haz la aritmética antes de decidir, porque el multiplicador es fijo y los números se vuelven incómodos rápido. Base64 lee tres bytes y escribe cuatro caracteres, así que 4/3 es el mínimo — más o menos un aumento del 33% — y el relleno más cualquier salto de línea lo empuja un poco más allá.

| La imagen en disco | Codificada en base64 | Qué significa en la práctica |
| --- | --- | --- |
| Icono de 12 KB | unos 16 KB | gratis; incrusta docenas sin notarlo |
| Diagrama de 120 KB | unos 160 KB | cómodo |
| Captura de 800 KB | aproximadamente 1,1 MB | tres de estas dominan el documento |
| Fotografía de 2 MB | aproximadamente 2,7 MB | una sola imagen es ya casi todo el archivo |
| Fotografía de 4 MB | aproximadamente 5,4 MB | más allá de casi cualquier límite razonable por sí sola |

Esos límites son reales, no teóricos. El conversor detrás de este sitio limita una sola conversión a 10 MB y un documento guardado en una cuenta a 4 MB, porque la función de Vercel que hay debajo rechaza cualquier petición o respuesta con un cuerpo mayor de 4,5 MB con un 413 (comprobado en vercel.com, el 9 de septiembre de 2026). Cada arreglo de alojamiento tiene un número como ese en algún lugar, y base64 es la forma más rápida de encontrarlo.

Los demás costes no se miden en bytes. Una imagen incrustada no se puede cachear por separado, así que quien abre el documento dos veces la descarga dos veces. No se puede comparar en un diff: cambia un píxel y el historial de control de versiones registra un cambio de mil líneas sin ningún contenido legible. No se puede reemplazar sin editar el archivo de prosa. Y cada reenvío, cada respuesta, cada copia carga con todo otra vez.

Eso vuelve a los data URIs correctos para un conjunto estrecho de casos: un icono, un logo, un diagrama pequeño, una firma, un gráfico en un documento que tiene que viajar solo y llegar completo. Para documentos llenos de capturas, aloja las imágenes y usa URLs absolutas — o acepta que el documento ya es un archivo de 15 MB y envíalo a propósito en vez de por accidente.

El intercambio vale la pena hacerlo más a menudo de lo que la gente espera, porque lo que se obtiene a cambio es un archivo sin dependencias. [Lo que realmente promete «autocontenido»](/blog/self-contained-html-explained) es una página cuyos estilos ya están dentro; mete las imágenes también dentro y tienes un documento que se renderiza igual en un portátil dentro de un hotel sin conexión, en una máquina corporativa bloqueada que rechaza hosts desconocidos, y dentro de tres años cuando el bucket donde vivían las imágenes ya se borró. Nada más en esta página te da eso.

## Texto alternativo, tamaño, SVG y tema: los atributos que Markdown no tiene

La sintaxis de imagen de Markdown tiene exactamente tres espacios — una URL, texto alternativo, y un título opcional — y todo lo demás que la gente quiere de una imagen vive fuera de ellos. Ese hueco es por donde entra el HTML crudo a un archivo Markdown, y el HTML crudo es donde los conversores empiezan a no coincidir entre sí.

### El texto alternativo es lo que lee un lector de pantalla

El texto alternativo no es un pie de foto. Un pie de foto es visible para todos y se sienta al lado de la imagen; el texto alternativo reemplaza la imagen para quien no la está recibiendo. MDN lo dice sin rodeos: el atributo «guarda un reemplazo textual para la imagen», y los lectores de pantalla leen ese valor en voz alta para que sus usuarios sepan qué significa la imagen (comprobado en developer.mozilla.org, el 9 de septiembre de 2026). Es también lo que el navegador dibuja en el hueco cuando la ruta está mal, lo que lo vuelve la cosa más útil de un documento cuyas imágenes se rompieron.

Así que escribe lo que la imagen *dice*, no lo que *es*. «Diagrama de arquitectura» no le dice nada a quien escucha. «Las peticiones llegan a la cola, un worker escribe en el almacén, la API lee de ahí» es la misma información que quien ve la imagen obtiene en dos segundos.

La excepción es una imagen que no dice nada: un divisor, un espaciador, un adorno decorativo. Para esas, una cadena vacía es correcta y deliberada. MDN: poner `alt=""` «indica que esta imagen no es una parte clave del contenido (es decoración o un píxel de rastreo), y que los navegadores no visuales pueden omitirla» — y los navegadores visuales también ocultan el icono de imagen rota cuando el texto alternativo está vacío y la imagen falló al mostrarse (comprobado en developer.mozilla.org, el 9 de septiembre de 2026). Un texto alternativo vacío es doble victoria a la vez: el lector de pantalla se queda callado, y una imagen decorativa rota no deja ninguna marca en la página.

El tercer espacio de Markdown es el título. `![Flow](img/flow.png "Figure 3: the ingest path")` pone esa cadena entre comillas en un atributo `title`, y la mayoría de los conversores lo respetan sin cambios. Casi nada útil pasa después. Un `title` se muestra como una ayuda emergente al pasar el ratón, así que es invisible en cualquier dispositivo táctil, poco fiable con tecnología de asistencia, y desaparece por completo si la lista de permitidos del saneador no incluye el atributo. Trátalo como decoración. Si las palabras importan, ponlas en la prosa de abajo, donde todos los lectores las reciben.

| Escribes | Qué sale | Quién lo recibe de verdad |
| --- | --- | --- |
| `![Ingest path](flow.png)` | `alt="Ingest path"` | quien usa lector de pantalla, y cualquiera cuya imagen falló |
| `![](rule.png)` | `alt=""` | nadie, a propósito — sin anuncio, sin icono roto |
| `![Ingest path](flow.png "Figure 3")` | `alt="Ingest path" title="Figure 3"` | quien pase el ratón por encima, si el atributo sobrevivió |
| Una línea en cursiva bajo la imagen | un párrafo normal | todo el mundo, siempre |

### El tamaño: no hay sintaxis, así que la gente recurre a HTML

Ni CommonMark ni GitHub Flavored Markdown tienen un ancho. No existe `![Flow](flow.png){width=400}`, ni un porcentaje, ni `=400x`. Algunos editores implementan su propia extensión de tamaño, y una extensión no es una especificación: donde no está implementada, el lector ve los caracteres literales en medio de la frase.

Así que el recurso habitual es HTML crudo, `<img src="flow.png" width="400" alt="Ingest path">`, y eso tiene tres finales posibles según el conversor.

| El conversor | Qué le pasa a `<img … width="400">` |
| --- | --- |
| Deja pasar el HTML crudo | funciona, y también cualquier otra cosa del archivo |
| Escapa el HTML crudo por defecto | el lector ve la etiqueta como texto visible |
| Sanea contra una lista de permitidos | el `img` sobrevive, el `width` puede no hacerlo, y la imagen se renderiza a tamaño completo |

El tercero es el confuso, porque funciona a medias. La imagen aparece, al tamaño con el que se guardó, y nada en ninguna parte dice que se eliminó un atributo. Una lista de permitidos es una lista de lo que está permitido, así que un atributo que a nadie se le ocurrió añadir simplemente está ausente — que es el comportamiento correcto para un control de seguridad y uno desconcertante para quien escribe. Es el caso más claro para [escribir el fragmento directamente en HTML](/blog/markdown-vs-html) cuando un documento de verdad depende del maquetado.

La respuesta duradera es redimensionar el archivo. Un diagrama que se va a mostrar a 400 píxeles, guardado a 400 píxeles, no necesita ningún atributo, no puede perder uno, pesa menos al enviarlo, y se ve más nítido que la misma imagen reducida por un navegador. Arreglarlo en la imagen es un arreglo que sobrevive a cualquier conversor.

### SVG: en línea contra enlazado, y por dónde entra el script

Un SVG no es un archivo de imagen en el sentido en que lo son los demás. Es XML, y el formato incluye su propio elemento `<script>` — MDN lo describe como el equivalente en SVG del de HTML, usando `href` en vez de `src` (comprobado en developer.mozilla.org, el 9 de septiembre de 2026) —, además de atributos de evento y la capacidad de referenciar recursos externos.

Que eso importe depende enteramente de cómo entra el archivo al documento.

Referenciado como imagen, es una imagen y el navegador lo trata como tal. La propia lista de restricciones de MDN sobre un SVG usado como imagen es explícita: JavaScript está desactivado, no se pueden cargar recursos externos como imágenes u hojas de estilo, los estilos de enlace `:visited` no se renderizan, y el estilo nativo de widgets de la plataforma está apagado. Esas restricciones aplican cuando el SVG se carga a través de `<img>`, un `background-image` de CSS, un `drawImage()` de canvas y contextos similares — y no aplican cuando el archivo se abre directamente o se incrusta con `<iframe>`, `<object>` o `<embed>` (comprobado en developer.mozilla.org, el 9 de septiembre de 2026).

En línea, no es una imagen en absoluto. Pegar el marcado `<svg>…</svg>` dentro de tu Markdown pone esos elementos en el propio DOM de la página, donde sus scripts son los scripts de la página y sus ids pueden colisionar con los ids de la página. E incrustarlo en línea es justo lo que la gente hace, porque es la única forma de estilizar un diagrama con el propio CSS de la página para que siga el tema.

| | `<svg>…</svg>` en línea | `<img src="chart.svg">` |
| --- | --- | --- |
| Viaja dentro del archivo | sí | no, salvo que la fuente sea un data URI |
| Se puede estilizar con el CSS de la página | sí | no |
| Los scripts de dentro pueden ejecutarse | sí | no — desactivado para SVG usado como imagen |
| Sobrevive a un saneador | depende de la lista de permitidos | normalmente, es un `img` normal |
| Seguro aceptarlo de un desconocido | no | trátalo como una imagen |

La regla que se desprende de esto es corta: un SVG que dibujaste tú está bien de cualquier forma; un SVG de otro lado — una insignia, un set de iconos, un gráfico que generó una herramienta, un diagrama que envió un cliente — debería referenciarse, no incrustarse en línea. Si tienes que incrustarlo, ábrelo primero en un editor de texto y léelo. Es XML. Puedes ver todo lo que hace.

### Imágenes que siguen el tema del lector

Un diagrama con líneas negras sobre fondo transparente desaparece en una página oscura, y más o menos la mitad de tus lectores tiene ahora una página oscura. La respuesta de los estándares es el elemento `<picture>`: cero o más elementos `<source>` seguidos de exactamente un `<img>`, donde cada fuente lleva una condición `media`, el navegador toma la primera que coincida, y el `<img>` es el respaldo cuando ninguna coincide. El texto alternativo va en el `<img>`, no en el `<picture>` (comprobado en developer.mozilla.org, el 9 de septiembre de 2026).

```html
<picture>
  <source srcset="flow-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="flow-light.png" media="(prefers-color-scheme: light)">
  <img src="flow-light.png" alt="Requests hit the queue, a worker writes to the store">
</picture>
```

GitHub soporta esta forma para imágenes específicas de tema, y ha marcado como obsoleto su enfoque anterior de añadir `#gh-dark-mode-only` o `#gh-light-mode-only` a la URL de la imagen a favor de esta (comprobado en github.blog, el 9 de septiembre de 2026). Si tienes esa sintaxis de fragmento en un README viejo, tiene los días contados.

Dos advertencias, las dos de más arriba en esta sección. Es HTML crudo, así que se enfrenta a los mismos tres destinos que un atributo `width`: pasa sin cambios, se escapa, o se sanea a medias. Y un saneador que permite `img` puede no permitir `picture` y `source`, en cuyo caso lo que recibe tu lector es el respaldo — que es un buen argumento para que ese respaldo sea la versión de fondo claro, la legible sobre blanco, y para poner el texto alternativo donde corresponde.

También hay un arreglo que no necesita HTML en absoluto: dale al diagrama un fondo explícito y una tinta de tono medio, para que se lea igual sobre blanco y sobre gris oscuro. Una imagen que no necesita saber el tema no puede equivocarse de tema, y sobrevive a cualquier conversor, a cualquier saneador y a cualquier cliente de correo de esta página.

## Los enlaces ancla, y cómo se fabrica el slug

Un ancla de Markdown es un enlace a un encabezado del mismo documento: `[see below](#installing-the-cli)`. El id al que apunta se genera a partir del texto del encabezado, y la receta es más o menos la misma en todas partes. Poner en minúscula el texto, quitar la puntuación, convertir las secuencias de espacios en guiones, y añadir un número cuando dos encabezados colisionan.

Más o menos lo mismo no es lo mismo, y esa es la razón por la que un índice que funciona perfecto en el repositorio le llega al lector con la mitad de sus entradas sin hacer nada. Cada renderizador implementa su propia función de slug, y las diferencias son lo bastante pequeñas como para que la mayoría de los enlaces sobrevivan y lo bastante grandes como para que algunos no.

GitHub documenta su regla en una sola frase: las letras se convierten a minúscula, los espacios se reemplazan por guiones, y cualquier otro carácter de espacio en blanco o puntuación se elimina (comprobado en docs.github.com, el 9 de septiembre de 2026). Pandoc documenta una receta más larga, y uno de sus pasos no se parece al de nadie más — elimina todo hasta la primera letra, porque un identificador no puede empezar con un número ni un signo de puntuación, así que `## 3. Applications` se convierte en `applications` en vez de `3-applications`. Los encabezados duplicados reciben `-1`, después `-2`, y si no queda nada tras la eliminación el identificador es `section` (comprobado en pandoc.org, el 9 de septiembre de 2026). Activar `gfm_auto_identifiers` cambia Pandoc al método de GitHub: espacios a guiones, mayúsculas a minúscula, puntuación distinta de `-` y `_` eliminada, emojis reemplazados por sus nombres.

Las bibliotecas de JavaScript son más raras, porque dos de las más usadas no producen ids en absoluto salvo que se lo pidas. marked eliminó sus opciones `headerIds` y `headerPrefix` en la v8.0.0 y señala hacia el paquete separado `marked-gfm-heading-id` para quien los quiera (comprobado en marked.js.org, el 9 de septiembre de 2026). markdown-it tampoco emite ids de encabezado por sí solo; la respuesta habitual es markdown-it-anchor, que se describe como un plugin que «añade un atributo `id` a los encabezados y opcionalmente enlaces permanentes», desambigua los duplicados con un sufijo numérico que empieza en 1, y te deja reemplazar la función de slug entera; es gratis, publicado bajo la licencia Unlicense (comprobado en github.com, el 9 de septiembre de 2026).

| Encabezado en la fuente | GitHub | Pandoc, por defecto | Pandoc + `gfm_auto_identifiers` | markdown-it + markdown-it-anchor | marked, sin extender |
| --- | --- | --- | --- | --- | --- |
| `## Installing the CLI` | `installing-the-cli` | `installing-the-cli` | `installing-the-cli` | `installing-the-cli` | ningún id emitido |
| `## 3. Applications` | `3-applications` | `applications` | `3-applications` | lo que haga la función de slug | ningún id emitido |
| `## Maître d'hôtel` | `maître-dhôtel` | `maître-dhôtel`, o `maitre-dhotel` con `ascii_identifiers` | `maître-dhôtel` | depende de la función de slug | ningún id emitido |
| `## Notes` que aparece dos veces | un sufijo numérico | `notes`, después `notes-1` | un sufijo numérico | `notes`, después `notes-1` | ningún id emitido |
| Puntuación, en general | eliminada salvo los guiones | eliminada salvo `_`, `-` y `.` | eliminada salvo `-` y `_` | configurable | — |

La fila que le cuesta más caro a la gente es la numerada. La documentación está llena de `## 1. Prerequisites` y `## 2. Installing`, y un índice construido para GitHub apunta a `#1-prerequisites` mientras que un build con Pandoc produce `#prerequisites`. Cada enlace del índice falla. Nada da error: un fragmento que no coincide con ningún id no es un fallo en HTML, es una petición de desplazarse hasta ninguna parte, y el navegador cumple quedándose exactamente donde está. El lector hace clic, nada se mueve, y concluye que la página está rota de alguna forma vaga que no sabe describir.

La otra divergencia silenciosa es el prefijo. TransformPipe le añade el prefijo `doc-` a cada id de encabezado, así que `## Installing the CLI` se convierte en `id="doc-installing-the-cli"` y el enlace tiene que ser `#doc-installing-the-cli`. El prefijo existe para mantener los ids fuera del territorio de DOM clobbering, que es el mismo razonamiento detrás de [sanear la salida siquiera](/blog/sanitising-markdown-safely). Otras herramientas añaden prefijo por sus propias razones, y un prefijo anula de golpe cada ancla escrita a mano.

Así que convierte primero y lee los ids que produjo el conversor en vez de adivinarlos. Abre la salida, búscale `id="`, búscale `href="#`, y compara las dos listas — cualquier cosa en la segunda que falte en la primera es un enlace muerto, y comprobarlo tarda menos que lo que tardó escribir el índice. Hay también un arreglo estructural: dale al encabezado un id explícito donde el renderizador lo soporte, o enlaza a un encabezado estable en vez de a uno numerado. Renombrar un encabezado rompe en silencio cada ancla que apuntaba a él, que es una razón para mantener el índice corto en [la documentación que vive en el repositorio](/blog/documentation-that-lives-in-the-repo).

## Enlaces de estilo referencia, y comprobar cada destino automáticamente

Los enlaces en línea saturan la frase. El estilo referencia mueve cada URL al final y deja atrás una etiqueta corta.

```markdown
The [style guide][guide] changed, and so did the [API reference][api].
Read the [style guide][guide] again before you file anything.

[guide]: https://example.com/style
[api]: https://example.com/api/v1
```

La etiqueta se reutiliza cuantas veces quieras, la URL se escribe una sola vez, así que un dominio que se mueve es una sola edición en vez de una búsqueda por todos los párrafos. También te da un solo bloque para auditar antes de enviar: cada destino al que apunta el documento. Un bloque largo en base64 también pertenece ahí abajo, y también las imágenes — `![Flow][flow]` con `[flow]: assets/flow.png` al pie del archivo mantiene un data URI de 40 KB fuera de la mitad de una frase.

Ese bloque es también algo que una máquina puede leer. En cuanto cada destino está en un solo lugar, comprobarlos deja de ser trabajo para una persona.

### Un verificador que de verdad puedes comprobar

lychee es un verificador de enlaces escrito en Rust, descrito por su propio repositorio como un «verificador de enlaces rápido, asíncrono y basado en streams» que «encuentra URLs y direcciones de correo rotas dentro de Markdown, HTML, reStructuredText, sitios web y más». Es gratis y tiene doble licencia Apache 2.0 o MIT, y hay una GitHub Action oficial, `lycheeverse/lychee-action` (comprobado en github.com, el 9 de septiembre de 2026). Apúntalo a tus archivos `.md` y reporta qué ya no resuelve.

Su lugar son dos sitios, no uno.

| Cuándo corre | Qué atrapa | Qué debería hacer al fallar |
| --- | --- | --- |
| En cada pull request que toque `.md` | el enlace que escribiste mal hace diez minutos | hacer fallar la comprobación — quien lo escribió está ahí mismo |
| Según un calendario, semanal o nocturno | el enlace que se pudrió el mes pasado | abrir un issue, no hacer fallar un build |

La división importa porque los dos fallos tienen dueños distintos. Una ejecución en un pull request solo mira lo que ese pull request cambió, así que nunca va a notar que un proveedor reorganizó su documentación en junio. Una ejecución programada sí lo nota, pero bloquear un despliegue porque el sitio web de otra persona está caído durante diez minutos castiga a quien no corresponde. Conecta la ejecución programada para que abra un issue en vez de eso, junto con lo que sea que ya [publicas desde un flujo de trabajo](/blog/publish-markdown-from-github-actions).

Y ten claro qué no puede hacer por ti ningún verificador. Resuelve las rutas relativas contra el repositorio, porque el repositorio es donde está parado — así que `img/flow.png` pasa, siempre, incluso en la ejecución inmediatamente anterior a enviarle la exportación a alguien cuya carpeta de descargas no tiene ningún `img` dentro. El fallo exacto del que trata este artículo es invisible para la herramienta que revisa la fuente. Revisa la salida.

## La parte honesta: un documento enviado por correo o lleva sus imágenes o no tiene ninguna

Todo lo anterior asume que el software del lector va a buscar una imagen cuando se le pida. El correo electrónico es el lugar donde esa suposición es simplemente falsa, y falsa a propósito.

Outlook «está configurado por defecto para bloquear las descargas automáticas de imágenes de internet», y Microsoft da cuatro razones: contenido enlazado potencialmente ofensivo, código malicioso, el coste de ancho de banda de descargar imágenes que el lector no pidió, y píxeles de rastreo — imágenes invisibles que le dicen a quien envió el correo que el mensaje se leyó (comprobado en support.microsoft.com, el 9 de septiembre de 2026). Cualquier otro cliente de correo se comporta más o menos igual, porque el problema del píxel de rastreo es el mismo para todos ellos.

Así que un documento HTML pegado en el cuerpo de un correo, con imágenes referenciadas por URL, llega como prosa y rectángulos grises con una barra arriba que ofrece descargar las imágenes. Algunos lectores le hacen clic. Muchos no, y unos cuantos trabajan en algún sitio que eliminó esa opción del todo. Esto no es un fallo de tu lado y no hay cabecera, atributo ni truco que lo arregle: el cliente está protegiendo a su usuario justo del mecanismo en el que estabas confiando.

Eso deja dos opciones honestas y ninguna tercera.

**El documento lleva sus imágenes.** Cada imagen se convierte en un data URI, y el mensaje contiene los bytes en vez de una petición de ellos. Nada se bloquea porque nada se busca. El coste es la aritmética de antes: un documento con seis capturas es un mensaje de varios megabytes de ancho, reenviado por completo cada vez, sentado en bandejas de entrada con cuotas, y pasando por pasarelas que a veces reescriben el correo HTML en el camino. Algunos filtros corporativos eliminan las fuentes `data:` por la misma razón que lo hace el saneador de una wiki.

**El documento no tiene imágenes.** El diagrama se convierte en una frase, la captura se convierte en una tabla, el gráfico se convierte en tres números, y el mensaje es pequeño, rápido y legible en todas partes, incluido el teléfono en el tren. El coste es que tienes que hacer tú la traducción, y algunas cosas de verdad no se traducen — un flame graph no es una frase.

Hay un camino intermedio que cambia un fallo por otro. Adjunta el archivo HTML convertido en vez de pegarlo en el cuerpo: quien lo lee lo descarga y lo abre en un navegador, que sí busca imágenes con normalidad, así que las URLs remotas vuelven a funcionar. A cambio, cada ruta relativa se resuelve ahora contra su carpeta de descargas, que es por donde empezó este artículo. No hay ningún arreglo sin ningún problema. Solo hay elegir cuál preferirías explicar.

## Qué comprobar antes de enviar el archivo

El HTML autocontenido es una promesa sobre la presentación, casi nunca sobre el contenido. En un documento HTML de un solo archivo los estilos están en línea, no hay scripts y no se busca nada para que la página se vea bien — la descarga de TransformPipe funciona así. Lo que eso nunca cubre es una imagen que apuntaste a otro lugar. `<img src="diagram.png">` sigue significando `diagram.png`, al lado de donde sea que el lector puso el archivo.

Los criterios de abajo son lo que hay que decidir, en orden, antes de que el archivo salga de tu máquina.

1. **Decide el destino antes de escribir la ruta.** Un documento que se va a abrir desde una carpeta de descargas no puede usar ni una ruta relativa ni una relativa a la raíz: `../assets/flow.png` escapa de la carpeta que estás enviando, y una barra inicial apunta a la raíz del disco de quien lo lee. Decide primero y escribes cada ruta una sola vez en vez de tener que encontrarlas todas otra vez después.
2. **Incrusta lo pequeño, aloja lo grande.** Base64 añade alrededor de un tercio a los bytes, así que un icono no cuesta nada y una captura cuesta un megabyte de texto ilegible metido en la prosa, reenviado con cada copia e invisible para cualquier diff.
3. **Dale a cada imagen significativa un texto alternativo y a cada una decorativa un `alt` vacío.** El primero es lo que anuncia un lector de pantalla y lo que llena el hueco cuando la imagen falla; el segundo evita que se lea en voz alta un espaciador y oculta el icono de imagen rota cuando no carga.
4. **Nunca incrustes en línea un SVG que no dibujaste tú.** En línea, se une al DOM de la página y sus scripts se vuelven los scripts de la página; referenciado desde un `img`, el navegador desactiva su capacidad de ejecutar scripts y lo trata como la imagen que pensabas que estabas recibiendo.
5. **Asume que cualquier atributo HTML crudo es opcional.** Width, height, `picture`, `source`, `title` y `class` viven todos a merced de una lista de permitidos, así que cualquier maquetado que solo funciona cuando el atributo sobrevive, tarde o temprano se va a ver sin él.
6. **Lee los ids que produjo el conversor, no los que esperabas.** Los algoritmos de slug difieren entre renderizadores, y un ancla que no coincide con nada falla en silencio — sin error, sin aviso en la consola, solo una página que se niega a desplazarse.
7. **Corre un verificador de enlaces en los pull requests y según un calendario.** El primero atrapa el enlace que escribiste mal hoy; solo el segundo atrapa el que se pudrió mientras nadie editaba ese archivo.
8. **Abre la exportación desde otra carpeta, en otra máquina, con la red apagada.** Esa sola prueba atrapa a la vez los archivos que faltan, las rutas relativas a la raíz, las dependencias de CDN y los bloqueos por hotlinking, y tarda alrededor de un minuto.

Después haz la pasada que cuesta un minuto. Convierte tu archivo, abre la pestaña de la fuente HTML, y búscale `src="` y `href="`. Lee cada valor y pregúntate desde dónde se resuelve en la máquina de quien lo lee, no en la tuya. Arregla los que respondan mal, y después envía el archivo — o salta el adjunto y [compártelo como un enlace](/blog/share-a-markdown-document-as-a-link), que le ahorra al lector una descarga pero no una ruta relativa: eso sigue resolviéndose contra la página desde la que se sirve, donde las imágenes nunca se pusieron.

## Conclusión

Cada imagen rota y cada ancla muerta en un documento convertido viene del mismo error, cometido dos veces: una referencia se escribió estando parado en un lugar y se lee estando parado en otro. Las URLs absolutas y los data URIs son las dos formas a las que no les importa dónde esté parado el lector, el texto alternativo es lo que queda cuando la imagen no llega, y los ids de encabezado vale la pena leerlos en vez de predecirlos porque cuatro renderizadores te van a dar cuatro respuestas. Nada de esto es difícil; todo es invisible desde la máquina donde se escribió el documento. Así que [convierte el archivo](/), abre la salida, lee cada `src` y cada `href` que produjo, y pregúntate desde el escritorio de otra persona hacia dónde apunta cada uno — esa sola pasada es la diferencia entre un documento que sobrevive el envío y uno que llega lleno de cuadros grises.

## Preguntas frecuentes

### ¿Por qué no se muestra mi imagen de Markdown?

Nueve de cada diez veces la ruta es relativa y el archivo se movió, así que ahora se resuelve contra una carpeta que no tiene ninguna imagen dentro. Abre la pestaña de red del navegador y lee el estado: 404 es una ruta equivocada, 403 son permisos o protección contra hotlinking, y un 200 que devuelve HTML significa que enlazaste una página en vez de un archivo.

### ¿Cómo enlazo una imagen guardada en un repositorio de GitHub?

Usa una ruta relativa si el Markdown se lee en la página del repositorio, que es lo que GitHub mismo recomienda. Si necesitas una URL absoluta, usa `raw.githubusercontent.com` o añade `?raw=true` a la URL de blob — la dirección `…/blob/…` simple devuelve una página HTML, no una imagen, y siempre va a renderizarse rota.

### ¿Debería codificar en base64 las imágenes en Markdown?

Para iconos, logos y diagramas pequeños en un documento que tiene que viajar solo, sí. Base64 hace que los datos pesen un tercio más que el archivo, así que una captura de 2 MB se vuelve unos 2,7 MB de texto en medio de tu prosa que no se puede cachear, comparar en un diff ni reemplazar por separado — por encima de unos cientos de kilobytes, aloja la imagen en su lugar.

### ¿Puedo fijar el ancho de una imagen en Markdown?

No en CommonMark ni en GitHub Flavored Markdown, que te dan una URL, texto alternativo y un título opcional y nada más. La gente recurre al `<img width="400">` crudo, pero un conversor puede escapar el HTML crudo o sanear el atributo, así que redimensionar el propio archivo de imagen es el único arreglo que funciona en todas partes.

### ¿Por qué mi enlace a un encabezado funciona en GitHub pero se rompe en el HTML exportado?

Porque los dos renderizadores generan el slug de los encabezados de forma distinta. GitHub pone en minúscula, convierte los espacios en guiones y elimina la puntuación; Pandoc además elimina todo hasta la primera letra, así que `## 3. Applications` se vuelve `#applications` en vez de `#3-applications`; marked y markdown-it no emiten ningún id sin un plugin. Lee los ids en la salida en vez de suponerlos.

### ¿Mis imágenes se van a ver si envío por correo el HTML convertido?

Solo si están incrustadas. Outlook bloquea las descargas automáticas de imágenes de internet por defecto, en buena parte para frenar los píxeles de rastreo, y otros clientes hacen lo mismo, así que un documento enviado por correo con URLs de imagen remotas llega como prosa y cuadros grises hasta que quien lo lee decide cargarlas.

### ¿Cuál es la diferencia entre el texto alternativo y un pie de foto?

Un pie de foto es visible para todos y se sienta cerca de la imagen, añadiendo algo que la imagen no dice por sí sola. El texto alternativo reemplaza la imagen para quien no la está recibiendo — quien usa lector de pantalla, o cualquiera cuya imagen falló al cargar — así que debería decir lo que comunica la imagen, y estar vacío cuando la imagen no comunica nada.

### ¿Por qué desaparecieron las imágenes al convertir el documento?

Porque el conversor las encontró y escribió una referencia en lugar de los bytes. Una imagen dentro
de un `.docx`, un `.pptx` o una exportación de Notion es un archivo aparte dentro del contenedor, y
una conversión tiene que incrustarla, escribirla junto al Markdown y reescribir la referencia, o
decir que no hizo ninguna de las dos cosas.
[Adónde van las imágenes cuando exportas un documento](/blog/pictures-in-a-document-export) explica
dónde las guarda cada formato y qué cuestan las tres opciones.
