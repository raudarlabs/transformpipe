---
title: "Lo que un documento le cuesta a un asistente, y cómo no gastarlo"
description: "Un token son unos 3,5 caracteres: un documento entra en la ventana de contexto o no entra — la aritmética de convertir fuera de una conversación"
date: 2026-09-22
tag: Automatización
keywords: ahorrar tokens ia, documento tokens ventana de contexto, convertir documento sin ia, reducir consumo de tokens claude, tokens markdown, flujo de trabajo ia más barato
---

Hay una costumbre que merece examen. Tienes un `.docx`, quieres verlo como Markdown, y el asistente está ahí mismo — así que adjuntas el archivo y preguntas. Funciona, y te cuesta el documento entero dos veces: una al entrar y otra al salir. Nada de esa conversión necesitaba un modelo de lenguaje. Leer OOXML y escribir Markdown es análisis sintáctico, y el análisis sintáctico es un problema resuelto desde mucho antes de todo esto.

### En resumen

Para Claude, un token representa aproximadamente 3,5 caracteres en inglés (comprobado en platform.claude.com, 22 de septiembre de 2026). Ese único número convierte toda la cuestión en aritmética y no en opinión. Un artículo de 2.500 palabras son unos 15.000 caracteres, o sea unos 4.300 tokens; pedirle la conversión a un asistente gasta eso al entrar y otro tanto al salir, digamos 8.500 por un trabajo que un analizador hace gratis. Un documento con una imagen incrustada es peor en dos órdenes de magnitud: un megabyte de base64 son unos 300.000 tokens, que no caben en la mayoría de las ventanas de contexto. Un enlace al mismo documento son once.

La versión honesta de la afirmación: convertir un documento fuera de la conversación no abarata el modelo en un porcentaje. Saca el documento de la ventana de contexto por completo, y lo que eso valga depende de cuánto de tu conversación sea texto de documento. La fórmula está más abajo, para que calcules tu propia cifra en lugar de creerte la mía.

## El único número del que se deduce todo

El glosario de Anthropic lo dice sin rodeos: en Claude un token representa aproximadamente 3,5 caracteres en inglés, y el número exacto varía según el idioma empleado (comprobado en platform.claude.com, 22 de septiembre de 2026). Divide un recuento de caracteres por 3,5 y tienes una estimación utilizable. Duplícala si el texto no es inglés: casi todos los tokenizadores se ajustaron sobre el inglés y gastan más tokens por carácter en todo lo demás, lo que empeora esta cuenta para un documento en español, no la mejora.

Aquí hay archivos reales, medidos y no supuestos:

| Documento | Palabras | Caracteres | Tokens, aprox. |
| --- | --- | --- | --- |
| Un artículo de blog largo | 2.513 | 14.921 | 4.300 |
| Un README de proyecto sustancial | 4.654 | 30.138 | 8.600 |
| Un megabyte de imagen en base64 | — | 1.048.576 | 300.000 |
| Un enlace a un documento compartido | 5 | 40 | 11 |

Las dos últimas filas son las interesantes, y no son un truco retórico. Una imagen llevada dentro de un archivo Markdown como URI `data:` es texto, y el texto se tokeniza. Si pegas un documento así en una conversación, el modelo lee cada carácter de esa codificación. [Adónde van las imágenes cuando exportas un documento](/blog/pictures-in-a-document-export) explica por qué la codificación es un tercio mayor que el archivo en disco; aquí la consecuencia es que una sola captura puede costar más tokens que todo el resto de un informe largo.

## Tres costumbres y lo que gasta cada una

### Pedirle la conversión al asistente

El modelo lee el documento y lo vuelve a escribir. Se cobran las dos mitades, y en toda interfaz grande la mitad de salida se tarifa por encima de la de entrada, porque generar es más trabajo que leer. Para el artículo de arriba son unos 4.300 al entrar y 4.300 al salir.

Lo que obtienes a cambio: una conversión hecha por algo que adivina. Un modelo que lee un `.docx` no resuelve los identificadores de relación para encontrar las imágenes, no lee `<w:numPr>` para averiguar a qué lista pertenece un párrafo, y no ve en absoluto los bytes de `word/media/`. Produce Markdown plausible, que es cosa distinta de Markdown correcto, y los errores son del tipo callado: un nivel de encabezado que se desvió, una tabla cuya celda combinada se volvió una columna de más.

Lo que un analizador entrega gratis: la respuesta real, de forma determinista, igual dos veces.

### Pegar un documento para mirarlo

Este es el caso que la aritmética castiga de verdad, y es extremadamente común. Quieres revisar un documento a mitad del proceso: si las tablas aguantaron, si los preliminares se ven bien, si la sección cuatro sigue ahí. Así que le pides al asistente que lo muestre, y él reescribe el documento. Eso es la longitud íntegra del documento en tokens de salida, gastada en un acto de lectura que un navegador hace gratis.

Una vista previa renderizada no cuesta nada. Un enlace compartido cuesta once tokens y puede abrirlo alguien que no está en la conversación. [Compartir un documento Markdown como enlace](/blog/share-a-markdown-document-as-a-link) es el mecanismo; aquí lo único que importa es que «muéstrame el documento» es con diferencia la forma más cara de mirar un documento.

### Dejar el documento en la conversación mientras trabajas en otra cosa

El contexto no se paga una vez. Cada turno siguiente vuelve a enviar todo el historial, así que un documento pegado arriba se paga de nuevo en cada mensaje posterior — y eso convierte 8.600 tokens puntuales en un coste permanente durante el resto de la sesión. El almacenamiento en caché cambia el precio de esa repetición en algunas interfaces, no el hecho de que ocurra.

Sostener el documento por referencia — guardado en algún sitio, direccionado por un enlace — significa que la conversación lleva once tokens donde llevaba miles. Ese es casi todo el argumento a favor de [convertir documentos por un conector](/blog/converting-documents-from-an-assistant) en vez de en la ventana de chat: la llamada de herramienta devuelve una dirección, y el documento en sí nunca entra en la transcripción.

## La fórmula, para no tener que creer a nadie

Sea **D** los caracteres de texto de documento en una conversación, y **C** los caracteres de todo lo demás: tus preguntas, el razonamiento del modelo, el código, la discusión. Entonces la proporción de tokens de la que responde el texto de documento es:

```text
document share = D / (D + C)
```

Y el ahorro por convertir fuera de la conversación es esa proporción, menos lo que de verdad necesitas que el modelo lea.

Tres ejemplos honestos:

- **Adjuntas una especificación de 30.000 caracteres y haces tres preguntas cortas.** D es 30.000 y C quizá 3.000. El texto de documento es el 91 por ciento de la conversación — pero necesitabas que el modelo leyera la especificación, así que el ahorro es cero. Convertirla antes en otro sitio no aporta nada.
- **Conviertes seis documentos en una sesión, miras cada uno y no comentas ninguno.** D es todo y C casi nada. El ahorro se acerca al cien por cien, porque nada de eso tenía que estar en el contexto.
- **Trabajas de verdad con un asistente y de paso conviertes cuatro archivos, de los que miras dos.** Este es el caso realista. Si esos archivos suman 20.000 caracteres y la conversación de trabajo son 60.000, el texto de documento es la cuarta parte del total, y sacar las conversiones fuera retira casi todo.

En esa banda intermedia vive la afirmación honesta. Que entre un quinto y un cuarto de los tokens de una sesión de trabajo se vayan en texto de documento sobre el que nadie quería que el modelo pensara es completamente ordinario — y depende por completo de tus costumbres, razón por la cual un único porcentaje anunciado sería una cifra inventada para sonar bien. Calcula `D / (D + C)` sobre tu propia transcripción y tendrás una cifra que es cierta para ti.

## Cuando el modelo sí tiene que leerlo

Esto merece su propia sección, porque el resto del artículo podría leerse como «mantén los documentos lejos de los asistentes», y eso sería falso.

Si quieres que el contenido se resuma, se critique, se traduzca, se compare con otro documento, se revise en busca de contradicciones o se piense de cualquier manera, entonces el documento tiene que estar en la ventana de contexto. Eso no es desperdicio: eso es el trabajo. Ningún conversor lo reduce, y quien afirme lo contrario te está vendiendo algo. El único ahorro sensato ahí es enviar el documento en su forma honesta más compacta: Markdown antes que HTML, el texto antes que el base64 de un escaneo del texto, las cuatro secciones pertinentes antes que el manual completo.

La distinción es simple y conviene retenerla: **una conversión es mecánica, una interpretación no.** Págale al modelo por la interpretación. No le pagues por ser un analizador sintáctico.

## Cómo se ve esto en la práctica

Cuatro cambios, más o menos por orden de ahorro:

1. **Convertir el archivo donde está el archivo.** Un navegador lleva un analizador dentro. Una conversión que ocurre en la página cuesta cero tokens y no manda el documento a ninguna parte, lo que es tanto una respuesta de privacidad como de coste.
2. **Mirar los documentos en un visor, no en una transcripción.** «Reescríbelo para que lo revise» es la costumbre cara. Renderizar es gratis.
3. **Pasar los documentos por una dirección.** Una herramienta que devuelve un enlace mantiene el documento fuera del historial, y fuera de cada turno posterior.
4. **Quitar antes de enviar lo que nadie necesita.** Preliminares, navegación, fórmulas repetidas e imágenes incrustadas son todos tokens, y para casi cualquier pregunta ninguno lleva la respuesta.

Las quince conversiones de aquí se ejecutan en el navegador, y un conector ofrece a un asistente esas mismas conversiones como llamadas de herramienta que devuelven un enlace y no un documento. Está construido así por la aritmética de arriba, y no al revés: un documento que nunca entra en la transcripción es el único por el que tienes garantizado no pagar dos veces. Para la variante por interfaz, [convertir documentos con una API](/blog/converting-documents-with-an-api) muestra cómo hacerlo desde un script, donde el recuento de tokens es cero por construcción.
