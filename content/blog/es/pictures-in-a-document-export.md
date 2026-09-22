---
title: "Adónde van las imágenes cuando exportas un documento"
description: "Cada exportación deja sus imágenes en algún sitio y casi toda conversión las deja ahí — dónde las guarda cada formato, las tres salidas y la cuenta de incrustar"
date: 2026-09-21
tag: Conversión
keywords: faltan las imágenes en markdown, convertir documento conservando imágenes, exportación de notion imágenes, imágenes docx markdown, imagen base64 markdown, exportar documento con imágenes
---

La exportación funcionó. Los encabezados están bien, las listas están bien, las tablas pasaron, y cada imagen es un rectángulo gris con la esquina doblada. Esta es con diferencia la manera más común en que una conversión de documentos decepciona a alguien, y casi nunca significa que el conversor no encontrara las imágenes. Las encontró, decidió que eran problema de otro, y escribió una referencia a un archivo que sabía que tú no tenías.

### En resumen

En cualquier formato documental una imagen es un archivo aparte dentro del contenedor, y el documento se refiere a ella por una ruta. Markdown es un único archivo de texto, así que hay exactamente tres sitios donde puede acabar una imagen: una carpeta junto al Markdown, una dirección en algún lugar de internet, o el propio Markdown, como URI `data:`. La mayoría de los conversores elige una cuarta por accidente — una ruta a la carpeta que habría existido si hubieran escrito los archivos — y eso es el rectángulo gris. Incrustar es la única de las tres que sobrevive a un correo, y cuesta cerca de un tercio más de bytes que el archivo en disco, porque base64 escribe tres bytes como cuatro caracteres.

La regla práctica: después de cualquier conversión, busca `src="` y `](` en el resultado y mira qué dicen de verdad las rutas. Eso lleva diez segundos y te dice cuál de las cuatro te ha tocado.

## Dónde guarda sus imágenes cada formato

| Origen | Dónde están los bytes | Cómo se refiere a ellos el documento |
| --- | --- | --- |
| `.docx` | `word/media/image1.png` dentro del zip | Un identificador de relación, resuelto vía `word/_rels/document.xml.rels` |
| `.pptx` | `ppt/media/image1.png` | El mismo mecanismo, diapositiva a diapositiva |
| `.odt` | `Pictures/10000201000...png` | Un `xlink:href` en un `<draw:image>` |
| `.epub` | Donde diga el manifiesto, normalmente `OEBPS/images/` | Una ruta relativa desde el XHTML del capítulo |
| Exportación de Notion | Una carpeta con el nombre de la página y su identificador de 32 caracteres | Una ruta relativa codificada, con `%20` por cada espacio |
| Exportación HTML de Confluence | `attachments/<id de página>/<archivo>` | Un `src` relativo desde el HTML de la página |
| Bóveda de Obsidian | Donde tú las pusieras, a menudo `assets/` | `![[imagen.png]]`, resuelto contra toda la bóveda |
| Evernote `.enex` | En base64 dentro del XML de la nota | `<en-media hash="…">`, el MD5 de los bytes decodificados |
| Google Docs | No en la exportación `.docx` hasta que hagas una | Descargadas al zip al exportar como HTML |

Dos de esas filas merecen una segunda mirada, porque ahí es donde las conversiones fallan de una forma difícil de diagnosticar.

**Notion** escribe rutas codificadas. Una página llamada `Q3 Plan` pasa a ser una carpeta `Q3 Plan 1f2a…`, y el Markdown se refiere a `Q3%20Plan%201f2a…/chart.png`. Un conversor que no decodifica la ruta busca un directorio con un `%20` literal en el nombre, no encuentra nada, y emite la referencia sin tocarla. [Convertir una exportación de Notion](/blog/convert-notion-export-to-markdown) repasa lo demás que hacen esos identificadores.

**Evernote** no guarda ningún nombre de archivo. Una imagen se direcciona por el MD5 de sus propios bytes, y el recurso que lleva esos bytes aparece en otra parte del mismo archivo, en base64. Emparejarlos significa calcular MD5 sobre cada recurso decodificado — motivo por el cual una conversión o hace esto bien o pierde todas las imágenes de la nota. No hay término medio.

## Los tres sitios a los que puede ir una imagen

| Destino | Sobrevive al correo | Sobrevive a mover la carpeta | Sobrevive a que el origen desaparezca | Coste |
| --- | --- | --- | --- | --- |
| Una carpeta junto al Markdown | No — llega un archivo y el otro no | No | Sí | Ninguno |
| Una dirección pública | Sí | Sí | No — enlaces muertos, y quien aloja ve quién mira | Ninguno para ti |
| Una URI `data:` en el archivo | Sí | Sí | Sí | Unos 4 bytes de texto por cada 3 de imagen |

La carpeta es el valor por omisión de casi toda herramienta de línea de comandos, y es la respuesta correcta cuando el Markdown va a un repositorio: la carpeta viaja con él, git sigue a los dos, y nadie envía nada por correo. El `--extract-media` de Pandoc lo hace bien y reescribe las referencias en consecuencia, que es justo lo que lo separa de los conversores que hacen solo la mitad.

La dirección pública es lo que ocurre cuando un conversor alojado dice que conservó tus imágenes. Las conservó, en su servidor, y la referencia en tu Markdown apunta ahora allí. Eso es un documento que funciona y una dependencia permanente: las imágenes siguen mientras siga esa cuenta, y cada lector que abre el archivo hace una petición que el anfitrión puede registrar. Conviene saberlo antes de mandarle el documento a un cliente.

La URI `data:` es la única opción que produce un solo archivo autosuficiente, y el valor por omisión correcto para un documento que va a leer alguien que no eres tú. [El HTML autosuficiente](/blog/self-contained-html-explained) hace el mismo razonamiento para la versión renderizada.

## La cuenta de incrustar

Base64 convierte cada tres bytes en cuatro caracteres, así que una imagen incrustada es un 33 por ciento mayor que el archivo del que salió, más un prefijo corto que nombra el tipo. Una captura de 750 KB se vuelve aproximadamente un megabyte de texto. Esa cifra es toda la razón por la que los conversores dudan en incrustar, y vale la pena ser concreto:

- Un informe de diez páginas con seis capturas: quizá 2 MB de texto. Abre al instante, se envía sin problemas, nunca se rompe.
- Una presentación de congreso con cuarenta fotos: 30 MB de texto. Un editor la abrirá despacio y un diff no dirá nada útil.
- Un documento escaneado: cada página es una imagen, el archivo es el escaneo más un tercio, y no hay texto dentro.

El diseño sensato es un presupuesto y no un interruptor: incrustar hasta cierto techo y, por encima, dejar las referencias intactas para que el fallo se vea, en lugar de producir un archivo que nada abre. Aquí ese techo son dos megabytes de imágenes por documento y un megabyte para una sola imagen — un megabyte codificado son unos 750 KB en disco, o sea una captura generosa y una foto pequeña. El tope por imagen existe por un fallo concreto: sin él, una foto recién sacada del móvil se come toda la asignación y las doce capturas siguientes, las que llevaban el argumento, caen todas.

## Seis maneras de perder imágenes que no son culpa del conversor

**La imagen es un enlace, no un archivo.** Un documento que remite a una imagen en una intranet, a una dirección de Google Drive o a un enlace del CDN de Slack no contiene bytes que extraer. La conversión lleva fielmente una referencia que solo se resuelve desde tu red o tu sesión.

**La imagen es un metarchivo.** Un gráfico pegado desde Excel o un diagrama pegado desde Visio se guarda con frecuencia como EMF o WMF, un formato vectorial de Windows que ningún navegador dibuja. Los bytes están, la referencia es correcta, y el lector no ve nada. Vuelve a pegarlo como imagen en el documento de origen antes de convertir; aguas abajo no hay arreglo.

**La imagen es un dibujo, no una imagen.** Las formas de Word, el SmartArt de PowerPoint y todo lo salido de las herramientas de dibujo son instrucciones XML de renderizado, no un archivo de imagen. No hay nada que extraer en `media/` porque el documento nunca contuvo nada.

**Dos imágenes se llaman igual.** Fundir una carpeta de documentos en un único archivo Markdown hace caer `image1.png` de nueve orígenes sobre una misma ruta. El resultado muestra nueve veces la misma imagen, y parece un fallo del conversor y no una colisión de nombres.

**El texto alternativo nunca se escribió.** El texto alternativo es lo único de una imagen que Markdown lleva a la perfección, y en casi todos los documentos está vacío, porque la herramienta de redacción no lo pidió. Cuando una imagen cae por cualquiera de los motivos de arriba, un buen texto alternativo es la diferencia entre una frase que se sostiene y un agujero.

**La imagen es el texto.** Una captura de una tabla es una imagen de una tabla. Ese es el fallo sin ninguna solución técnica, y el único momento útil para detectarlo es antes de convertir, en el origen.

## Qué debería hacer una conversión, y qué comprobar

Una conversión que trata bien las imágenes hace cuatro cosas, y cada una se verifica en menos de un minuto:

1. **Resolver la referencia por el mecanismo propio del formato** — identificadores de relación en OOXML, el manifiesto en EPUB, MD5 en Evernote — en vez de adivinar por un nombre de archivo.
2. **Decodificar la ruta** antes de buscar el archivo, para que `%20` y `+` no acaben formando parte del nombre de un directorio.
3. **Decir qué hizo con los bytes.** Incrustados, escritos al lado, o dejados donde estaban: las tres cosas se defienden, el silencio no.
4. **Conservar el texto alternativo**, incluso cuando descarta la imagen.

Y en el lado del resultado:

- Busca `](` y lee las rutas. Todo lo relativo es una promesa sobre una carpeta.
- Busca `data:image` y cuenta. Eso te dice cuántas se incrustaron.
- Mira el tamaño del archivo. Un documento Markdown con imágenes incrustadas se mide en megabytes; uno sin ellas, en kilobytes, por muchas imágenes que tuviera el original.
- Ábrelo en otro sitio. La máquina del autor es el único lugar donde todas las rutas se resuelven, que es justamente por lo que el autor es el último en darse cuenta.

## Dónde te deja todo esto

Para un documento que va a un repositorio, una carpeta al lado es lo correcto, y el único requisito es que el conversor reescriba las referencias hacia donde realmente escribió. Para un documento que va a una persona, incrustar es la única respuesta que sobrevive al viaje, y el precio es un tercio más de bytes y un techo que conviene conocer y no descubrir. Para todo lo intermedio, la comprobación son las mismas tres búsquedas, y merece hacerse una vez sobre un documento que te importe antes de confiarle cincuenta a una herramienta.

Todas las conversiones de aquí — [Word](/word-to-markdown), [PowerPoint](/powerpoint-to-markdown) y [las exportaciones de Notion, Confluence y Obsidian](/notion-to-markdown) entre ellas — incrustan las imágenes que encuentran, en el navegador, así que nada se sube para alojarse y nada depende de una carpeta que se quedó atrás. Para el problema vecino de los enlaces que solo se resuelven desde tu escritorio, [las imágenes y los enlaces que siguen funcionando](/blog/images-and-links-that-still-work) dice lo que hace falta.
