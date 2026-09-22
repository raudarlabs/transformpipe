---
title: Alternativas a MarkItDown, ordenadas por el motivo de tu búsqueda
description: MarkItDown es una biblioteca de Python pensada para pipelines de LLM, y su propio README lo dice. Qué usar cuando tu problema tiene otra forma.
date: 2026-09-22
tag: Conversión
keywords: alternativa a markitdown, markitdown vs docling, markitdown sin python, convertir documentos a markdown para llm, microsoft markitdown, markitdown pdf
---

Nadie busca una alternativa a MarkItDown porque MarkItDown sea malo. Se busca porque el archivo está abierto en una pestaña, en una máquina sin Python; porque el PDF salió como una columna de palabras pegadas; o porque el Markdown era para que lo leyera una persona y no se lee como algo que haya escrito una persona. La herramienta está bien. Se construyó para una forma concreta de problema, y esa forma está dicha con claridad en su propia documentación, que es más de lo que hacen casi todos los proyectos.

### En resumen

MarkItDown es una utilidad de Python que convierte archivos a Markdown **para pipelines de análisis de texto**, y su README avisa de que la salida «puede no ser la mejor opción para conversiones fieles destinadas a la lectura humana». Si tu pipeline es Python, los archivos están en el disco al lado y el Markdown va hacia un modelo, es la opción correcta por defecto y nada de aquí la supera. Mira en otra parte cuando no haya Python donde está el documento, cuando la entrada sea un PDF escaneado, cuando el Markdown tenga que volver a salir como otra cosa, o cuando el documento no pueda salir de la máquina. Esto último conviene comprobarlo en vez de darlo por hecho: algunas de sus mejores opciones son llamadas a la nube que se facturan.

## Qué es MarkItDown en realidad

Una envoltura fina y bien elegida. El documento interesante no es el README, sino `pyproject.toml`, porque las dependencias opcionales son la ficha técnica honesta (comprobado en github.com/microsoft/markitdown, 22 de septiembre de 2026):

| Formato | Qué lo lee |
| --- | --- |
| `.docx` | `mammoth` |
| `.pptx` | `python-pptx` |
| `.xlsx` / `.xls` | `pandas` con `openpyxl` o `xlrd` |
| `.pdf` | `pdfminer.six` y `pdfplumber` |
| Audio | `pydub` con `SpeechRecognition` |
| YouTube | `youtube-transcript-api` |
| HTML | `beautifulsoup4` y `markdownify` |

Python de 3.10 a 3.14, `pip install 'markitdown[all]'`, o un extra cada vez — `pip install 'markitdown[pdf, docx, pptx]'` —, que es la instalación sensata en cuanto sabes qué tres necesitas.

Conocer esa lista es conocer el techo antes de darte con él. El lector de Word es Mammoth, así que MarkItDown hereda exactamente [lo que Mammoth se lleva y lo que deja](/blog/mammoth-js-and-docx-parsers). Los lectores de PDF son extractores de texto: sacan los objetos de texto que el PDF declara. No modelan la página, de modo que un escaneo a dos columnas sale entrelazado y una página escaneada sale vacía, porque no hay texto alguno que extraer. Hay OCR, mediante un complemento que envía la página a un modelo de visión cuya clave pones tú, o mediante Azure Document Intelligence; ambas cosas son llamadas de red.

Y está la nota de alcance, que decide la mayor parte de este artículo:

> No podemos aceptar aplicaciones, servicios ni servidores adicionales. Esto incluye: servidores web, API REST o HTTP y servicios de conversión alojados; interfaces web e interfaces de usuario en el navegador; aplicaciones de escritorio y móviles.

No es una carencia. Es una frontera deliberada, escrita en la guía de contribución, y significa que el proyecto nunca tendrá aquello que quiere de verdad la mitad de quienes buscan una alternativa.

## Los cuatro motivos por los que se busca

### 1. Donde está el documento no hay Python

Este es el motivo habitual y no es una objeción técnica. El documento es una página de Confluence, un ticket, un Google Doc, un hilo — o es un `.docx` en el portátil de alguien que no tiene terminal ni lo va a tener. Un pipeline que empieza por `pip install` ya ha fallado para esa persona.

Lo que funciona en su lugar es un convertidor que se ejecuta donde ya está el documento: una pestaña, una extensión en la barra de herramientas, un teléfono. La conversión en sí no es lo difícil — `mammoth` tiene versión en JavaScript y `turndown` siempre lo fue —, así que convertir Word, HTML, hojas de cálculo y presentaciones en el navegador es hoy algo corriente, y no se sube nada cuando ocurre dentro de la página.

### 2. La entrada es un PDF, y el PDF es una imagen

`pdfminer.six` y `pdfplumber` son buenos en lo suyo: leer el texto que un archivo PDF declara. Un contrato escaneado no declara ninguno. Un artículo académico a dos columnas declara su texto en el orden en que se dibuja, no en el que se lee.

Si el PDF es la entrada real, la herramienta construida para eso se llama **Docling**, de IBM Research y hoy alojada en la LF AI & Data Foundation: composición de la página, orden de lectura, estructura de tablas, fórmulas, OCR para escaneos y, debajo, un modelo de documento en lugar de un búfer de texto. Es mucho más pesada — en la primera ejecución se descargan pesos de modelos — y ese peso es la función. [La comparación de diez convertidores](/blog/ten-markdown-converters-compared) pone a ambos en la misma tabla si quieres ver el resto del campo al lado.

### 3. El Markdown tiene que volver a salir

MarkItDown convierte *hacia* Markdown. Ese es todo su diseño, y «el único destino» le encaja de un modo que no le encaja a Pandoc.

En cuanto la tarea pasa a ser «tenemos el Markdown y ahora hace falta que sea un archivo de Word en el que jurídico marque cambios», estás mirando otra herramienta. [Pandoc](/blog/pandoc-alternatives-for-markdown-to-html) es la respuesta de referencia para ese sentido y para la matriz de formatos en general: una fuente, varias salidas, mantenidas al mismo paso.

### 4. El documento no puede salir de la máquina

Este punto conviene leerlo despacio, porque «se ejecuta en local» y «sin red» no son la misma frase.

Los convertidores integrados de MarkItDown son locales. Sus mejores resultados con entradas difíciles no lo son: Azure Document Intelligence y Azure Content Understanding son servicios en la nube, cada llamada se factura, y las descripciones de imágenes funcionan enviando la imagen a un LLM a través de un cliente que montas tú. Las tres cosas se activan a propósito y ninguna es una sorpresa — la documentación es clara —, pero una respuesta de cumplimiento que dice «se ejecuta en local» mientras el pipeline pasa una bandera que sube la página es justo lo que solo se descubre en una auditoría. [Cómo comprobar adónde envía tu archivo un convertidor](/blog/is-an-online-converter-safe) es una pregunta que merece cada herramienta de esta página, la nuestra incluida.

## Lo que aquí no sustituye nada

Ser justo es también la parte útil, porque te dice cuándo dejar de leer.

- **Transcripciones de YouTube y audio.** Nada más en este artículo convierte una dirección de vídeo o un `.wav` en texto. Si eso está en la lista, MarkItDown está en la lista.
- **Archivos `.msg` de Outlook.** Un formato de verdad incómodo, y lo lee.
- **Archivos ZIP, recorridos.** Va por el contenido y convierte cada pieza.
- **El sistema de complementos.** Un formato que necesitas y que nadie admite es un paquete que publicas, no un fork que mantienes.
- **Un servidor MCP.** `markitdown-mcp` pone todo el conjunto delante de un asistente, que es [la forma más barata de meter un documento en una conversación](/blog/what-a-document-costs-an-assistant) cuando el archivo ya está en la máquina que el asistente alcanza.

## Dónde encaja este sitio

TransformPipe es la respuesta del lado del navegador al primer motivo. Quince conversiones — Word, PowerPoint, EPUB, hojas de cálculo, HTML, CSV, JSON y las exportaciones de Notion, Confluence, Obsidian y Evernote — se ejecutan en la página, sin subir nada, y los mismos convertidores están detrás de una API, una herramienta de línea de comandos, una extensión de navegador para la página que estás leyendo y un servidor MCP para un asistente.

Los límites honestos, en el mismo espíritu que la nota de alcance de arriba: **aquí no hay PDF en absoluto**, en ningún sentido, y no lo habrá — leer un PDF de forma aceptable exige modelos de composición y OCR, es decir, un servidor, y eso quitaría la única propiedad por la que merece la pena un convertidor de navegador. Nada de audio, de vídeo ni de YouTube. Y la salida es Markdown y HTML en vez de una matriz de formatos; un `.docx` sí vuelve a salir, pero el alcance de Pandoc no.

Si la respuesta a «dónde se ejecuta esto» es «en un proceso de Python junto a los archivos», instala MarkItDown. Si es «en la pestaña que estoy mirando», nada de esto es para ti, y por eso existe esta lista.
