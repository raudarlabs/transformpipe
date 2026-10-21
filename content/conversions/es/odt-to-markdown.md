## Lo que se conserva

Un `.odt` declara por sí mismo qué es cada una de sus partes. Al convertir ODT a Markdown, la estructura llega tal como se escribió, sin tener que adivinar nada.

| En el archivo OpenDocument | En el Markdown |
| --- | --- |
| Los encabezados, y los estilos de párrafo basados en uno | `#` a `######`, los niveles más profundos como `######` |
| Negrita, cursiva y tachado en palabras | `**bold**`, `*italic*`, `~~struck~~` |
| Listas con viñetas y numeradas | Listas con `-` y `1.`, dos espacios de sangría por nivel |
| Una tabla | Una tabla Markdown, con la primera fila con texto como encabezado |
| Celdas combinadas | El texto una vez y luego celdas vacías, para que las columnas sigan alineadas |
| Notas al pie y notas al final | `[^1]` en el texto, las notas al final, en una sola numeración |
| Un hipervínculo | Un enlace a la misma dirección |
| Una imagen | Incrustada en el documento, con su título (no su descripción) como texto alternativo |
| Un salto de línea (Mayús+Intro) | Una línea que termina en una barra invertida |

Cada elemento numerado se escribe `1.`, así que una lista que empezaba en 5 empieza en 1. Si el documento no abre con un Encabezado 1, se añade uno arriba: el título indicado en Archivo, Propiedades, o si no, el nombre del archivo.

## Lo que se pierde

- **El aspecto.** Subrayado, superíndice y subíndice, colores, fuentes y tamaños. También se pierden la negrita o la cursiva que pertenecen al estilo de todo el párrafo y no a palabras concretas dentro de él.
- **Los estilos que no son encabezados.** Título, Subtítulo, Citas y Texto preformateado se convierten en párrafos normales.
- **Las cabeceras y los pies de página,** con sus números de página: solo se lee el cuerpo del documento.
- **Los marcos.** El texto de un marco desaparece, salvo que el marco esté anclado a la página; el de un cuadro de texto se mezcla con la frase que lo rodea.

## Un ejemplo

Un `.odt` que abre con un Encabezado 1, seguido de un párrafo con una palabra en negrita, otra en cursiva, una nota al pie y un enlace, una lista anidada, una tabla y una foto con título, queda así, con el base64 de la imagen acortado:

```markdown
# Findings

The north gutter is **blocked** and two tiles are *cracked*.[^1] Prices are on the [supplier’s page](https://example.com/tiles).

- Clear the gutter
  - North side only
- Replace two tiles

| Job | Cost |
| --- | --- |
| Gutter | £80 |
| Tiles | £240 |

![The blocked north gutter](data:image/png;base64,iVBORw0KGgo…)

[^1]: Seen from the scaffold on 3 March.
```

Si `roof-survey.odt` hubiera empezado con una línea en el estilo Título, esa línea seguiría siendo un párrafo normal, debajo de `# roof-survey`.

## Límites

- Solo `.odt`, hasta 50 MB; ni `.ods`, ni `.odp`, ni `.fodt` plano. Varios archivos soltados a la vez cuentan juntos y forman un único documento.
- El archivo se lee en el navegador y no se sube. Nada llega a una cuenta salvo que haya iniciado sesión y pulse Guardar, y un documento guardado puede ocupar como máximo 4 MB.
- Las imágenes viajan dentro del Markdown, alrededor de 1 MB cada una una vez codificada y 2 MB por archivo. La que no cabe, o la que está en WMF o EMF, conserva su ruta dentro del `.odt` y llega como imagen rota.
- **Los comentarios se mezclan con el texto:** el autor, la fecha y el comentario caen en mitad de la frase a la que estaban unidos. Conviene borrarlos antes de convertir.
- **Los cambios que siguen registrados** colocan al principio del documento el nombre y la fecha de cada cambio, además de cada pasaje eliminado. Antes hay que aceptarlos o rechazarlos todos en Writer.
- **Un índice de contenido** llega como su título dos veces y después sus entradas como enlaces con número de página.
- Las listas anidadas bajo un elemento numerado se salen de él al mostrarse: dos espacios de sangría bajo `1.` no bastan.
- Un `.odt` protegido con contraseña no se puede leer; conviene guardar una copia sin contraseña.

## Preguntas

### ¿Cómo se abre un archivo .odt?

LibreOffice Writer lo abre gratis en cualquier sistema de escritorio, y también Word y Google Docs. Para leerlo sin instalar nada, basta con soltarlo aquí y leer la vista previa; [cómo abrir un archivo .odt](/how-to/open-odt) recoge las demás opciones.

### ¿Cómo se convierte ODT a Markdown?

Se suelta el `.odt` en esta página, se revisa la vista previa y se pulsa Descargar .md. El archivo conserva su nombre, así que `notes.odt` se descarga como `notes.md`, y Copiar Markdown pone el texto en el portapapeles en su lugar.

### ¿Se conservan las notas al pie?

Sí, como notas al pie de Markdown, que la vista previa muestra como notas numeradas. No todas las herramientas de Markdown las muestran: [notas al pie en Markdown](/blog/markdown-footnotes-support) indica cuáles lo hacen.

### ¿Por qué aparece el nombre del archivo arriba como encabezado?

El documento no empezaba con un Encabezado 1, o había cambios registrados delante. Si se indica un título en Archivo, Propiedades, será ese el que aparezca arriba; si el documento empieza con un Encabezado 1, no se añade nada.

### ¿Se pueden convertir archivos .ods u .odp?

No, solo documentos de texto. Una hoja de cálculo puede guardarse como `.xlsx` en LibreOffice Calc para usar «Excel a una tabla Markdown», y una presentación como `.pptx` en Impress para usar «PowerPoint a Markdown».
