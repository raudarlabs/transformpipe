## Lo que se conserva

Cada nota del archivo `.enex` se convierte en una sección de un único documento Markdown. El documento empieza con un encabezado que lleva el nombre del archivo y una lista con los títulos de las notas; después aparece cada nota bajo su propio encabezado, separada de la siguiente por una línea horizontal.

| En la nota | En el Markdown |
| --- | --- |
| Título | `# Título`; una nota sin título pasa a ser `# Note 3`, según su posición en el archivo |
| Fecha de creación y etiquetas | Una línea en cursiva bajo el título: `*2026-09-14 · travel, 2026*` |
| Negrita, cursiva, tachado, enlaces, listas, tablas | Su forma en Markdown; la primera fila de una tabla pasa a ser la cabecera |
| Casillas de verificación | Una lista de tareas: `- [x]` y `- [ ]` |
| Imágenes (PNG, JPEG, GIF, WebP, BMP, AVIF, TIFF) | Incrustadas, con el nombre del archivo como texto alternativo |
| Otros adjuntos | El nombre del archivo en cursiva, donde estaba el adjunto |
| Texto cifrado | Una frase en inglés que indica que hace falta su contraseña |

Una nota no se refiere a sus imágenes por el nombre, sino por el hash MD5 de sus bytes. El conversor calcula ese hash para cada adjunto, de modo que cada imagen llega a su propia nota y al lugar donde estaba.

## Lo que se pierde

- **Otros datos de la nota.** La fecha de modificación, el autor, la URL de origen y la ubicación no se leen.
- **El formato visual.** El subrayado, el color del texto, el resaltado y las fuentes no tienen equivalente en Markdown. Las palabras se quedan; el formato, no.
- **Los bloques de código de Evernote.** Llegan como párrafos normales, uno por línea, y no como un bloque de código delimitado.
- **Los archivos adjuntos en sí.** Un PDF o una grabación conserva su nombre en la nota; el archivo se queda en Evernote.
- **Los enlaces entre notas.** Mantienen su dirección `evernote:///`, que fuera de Evernote no abre nada.
- **Las notas vacías.** Una nota sin contenido, sin fecha y sin etiquetas se omite y tampoco aparece en la lista de títulos.

## Un ejemplo

`Travel.enex` contiene dos notas: «Lisbon trip», con las etiquetas travel y 2026, una línea que empieza en negrita, dos casillas (una marcada) y una tarjeta de embarque en PDF adjunta; y «Where to eat», con la etiqueta travel y una lista con viñetas. El resultado es:

```markdown
# Travel

- Lisbon trip
- Where to eat

---

# Lisbon trip

*2026-09-14 · travel, 2026*

**Flight:** TP 1351, 07:40 from Heathrow

- [x] Book the hotel
- [ ] Renew the travel insurance

*boarding-pass.pdf*

---

# Where to eat

*2026-09-16 · travel*

Recommended by Ana:

- Cervejaria Ramiro
- Taberna da Rua das Flores
```

Si en lugar de la tarjeta de embarque se hubiera adjuntado una foto, aparecería en el mismo sitio, como una imagen que lleva sus propios bytes en un URI de datos.

## Límites

- **50 MB por conversión**, contando todos los archivos que se sueltan a la vez. Varios archivos `.enex` soltados juntos forman un solo documento, una exportación tras otra.
- **Las imágenes tienen un presupuesto**, porque viajan dentro del documento: como máximo 1 MB por imagen una vez codificada (unos 750 KB en disco) y 2 MB para todas las de una misma exportación. Se incorporan por orden, y la que supera el presupuesto se sustituye por su nombre de archivo en cursiva.
- **Un documento, no un archivo por nota.** No hay ninguna opción para dividir una exportación en notas separadas.
- **Guardar admite hasta 4 MB de Markdown.** Un documento mayor sigue en pantalla y se puede descargar igualmente.
- **Todo ocurre en el navegador.** Sin iniciar sesión, el archivo no se sube. Con la sesión iniciada, el documento llega a su cuenta solo al pulsar Guardar.

## Preguntas

### ¿Qué es un archivo .enex?

Es el archivo que escribe Evernote al exportar notas: un único archivo XML con todas las notas, el contenido de cada una en ENML, la versión restringida de XHTML propia de Evernote, y los adjuntos en base64. [Cómo abrir un archivo .enex](/how-to/open-enex) explica qué hay dentro.

### ¿Cómo convertir Evernote a Markdown?

Exporte las notas desde Evernote con Archivo, Exportar notas, y suelte el archivo `.enex` en esta página. El Markdown aparece en pantalla, y el botón de descarga lo guarda como un archivo `.md` con el mismo nombre.

### ¿Se conservan las etiquetas?

Sí, en cursiva bajo el título de cada nota, después de la fecha de creación. En el Markdown son texto normal, no etiquetas que otra aplicación vaya a reconocer como tales.

### ¿Se puede obtener un archivo Markdown por nota?

Con este conversor, no. Cada nota se convierte en una sección de un único documento, bajo su propio encabezado, y cada descarga es un solo archivo.

### ¿Qué pasa con las imágenes y los adjuntos?

Las imágenes se incrustan como URI de datos, así que el documento no necesita ninguna carpeta al lado. Cualquier otro adjunto se reduce a su nombre en cursiva. [Adónde van las imágenes cuando exportas un documento](/blog/pictures-in-a-document-export) explica lo que cuesta incrustarlas.

### ¿Y el texto cifrado?

No se puede leer sin la contraseña, y el conversor no la pide. En su lugar, la nota muestra la frase en inglés «Encrypted text, which needs the passphrase it was written with».
