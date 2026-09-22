---
title: Alternative a MarkItDown, ordinate per il motivo che ti porta qui
description: MarkItDown è una libreria Python pensata per pipeline LLM, e lo dice il suo stesso README. Che cosa usare quando il tuo problema ha un’altra forma.
date: 2026-09-22
tag: Conversione
keywords: alternativa a markitdown, markitdown vs docling, markitdown senza python, convertire documenti in markdown per llm, microsoft markitdown, markitdown pdf
---

Nessuno cerca un’alternativa a MarkItDown perché MarkItDown sia scadente. Si cerca perché il file è aperto in una scheda, su una macchina dove Python non c’è; perché il PDF è uscito come una colonna di parole appiccicate; oppure perché il Markdown doveva leggerlo una persona e non si legge come qualcosa scritto da una persona. Lo strumento va bene. È stato costruito per una forma precisa di problema, e quella forma è dichiarata con chiarezza nella sua documentazione, il che è più di quanto facciano quasi tutti i progetti.

### In breve

MarkItDown è un’utilità Python che converte file in Markdown **per pipeline di analisi del testo**, e il README avverte che l’output “potrebbe non essere la scelta migliore per conversioni fedeli destinate alla lettura umana”. Se la tua pipeline è in Python, i file stanno sul disco lì accanto e il Markdown va verso un modello, è la scelta giusta e qui niente la batte. Guarda altrove quando dove sta il documento non c’è Python, quando l’ingresso è un PDF scansionato, quando il Markdown deve uscire come qualcos’altro, o quando il documento non deve lasciare la macchina. Quest’ultimo punto va verificato invece che dato per scontato: alcune delle sue opzioni migliori sono chiamate cloud a pagamento.

## Che cos’è davvero MarkItDown

Un involucro sottile e scelto bene. Il documento interessante non è il README ma `pyproject.toml`, perché le dipendenze opzionali sono la scheda tecnica onesta (verificato su github.com/microsoft/markitdown, 22 settembre 2026):

| Formato | Che cosa lo legge |
| --- | --- |
| `.docx` | `mammoth` |
| `.pptx` | `python-pptx` |
| `.xlsx` / `.xls` | `pandas` con `openpyxl` o `xlrd` |
| `.pdf` | `pdfminer.six` e `pdfplumber` |
| Audio | `pydub` con `SpeechRecognition` |
| YouTube | `youtube-transcript-api` |
| HTML | `beautifulsoup4` e `markdownify` |

Python dalla 3.10 alla 3.14, `pip install 'markitdown[all]'`, oppure un extra alla volta — `pip install 'markitdown[pdf, docx, pptx]'` —, che è l’installazione sensata una volta che sai quali tre ti servono.

Conoscere quella lista significa conoscere il soffitto prima di sbatterci contro. Il lettore di Word è Mammoth, quindi MarkItDown eredita esattamente [ciò che Mammoth porta con sé e ciò che lascia](/blog/mammoth-js-and-docx-parsers). I lettori di PDF sono estrattori di testo: recuperano gli oggetti testuali che il PDF dichiara. Non modellano la pagina, perciò una scansione su due colonne esce intrecciata e una pagina scansionata esce vuota, perché non c’è alcun testo da estrarre. L’OCR esiste, tramite un plugin che manda la pagina a un modello di visione per cui la chiave la metti tu, oppure tramite Azure Document Intelligence: in entrambi i casi sono chiamate di rete.

E poi c’è la nota sul perimetro, che decide gran parte di questo articolo:

> Non possiamo accettare ulteriori applicazioni, servizi o server. Questo comprende: server web, API REST o HTTP e servizi di conversione ospitati; frontend web e interfacce utente nel browser; applicazioni desktop e mobili.

Non è una lacuna. È un confine deliberato, scritto nella guida ai contributi, e significa che il progetto non avrà mai la cosa che metà di chi cerca un’alternativa vuole davvero.

## I quattro motivi per cui si cerca

### 1. Dove sta il documento non c’è Python

È il motivo più comune e non è un’obiezione tecnica. Il documento è una pagina di Confluence, un ticket, un Google Doc, una discussione — oppure è un `.docx` sul portatile di qualcuno che non ha un terminale e non lo avrà. Una pipeline che comincia con `pip install` per quella persona ha già fallito.

Quello che funziona invece è un convertitore che gira dove il documento già si trova: una scheda del browser, un’estensione nella barra degli strumenti, un telefono. La conversione in sé non è la parte difficile — `mammoth` esiste in versione JavaScript e `turndown` lo è sempre stato —, così convertire Word, HTML, fogli di calcolo e presentazioni nel browser è ormai ordinario, e non viene caricato nulla quando accade dentro la pagina.

### 2. L’ingresso è un PDF, e il PDF è un’immagine

`pdfminer.six` e `pdfplumber` sono bravi in quello che fanno: leggere il testo che un file PDF dichiara. Un contratto scansionato non ne dichiara. Un articolo accademico su due colonne dichiara il testo nell’ordine in cui viene disegnato, non in quello in cui si legge.

Se il PDF è l’ingresso vero, lo strumento costruito per questo si chiama **Docling**, di IBM Research e oggi ospitato dalla LF AI & Data Foundation: impaginazione, ordine di lettura, struttura delle tabelle, formule, OCR per le scansioni e, sotto, un modello di documento invece di un buffer di testo. È molto più pesante — al primo avvio scarica i pesi dei modelli — e quel peso è la funzionalità. [Il confronto fra dieci convertitori](/blog/ten-markdown-converters-compared) mette entrambi nella stessa tabella, se vuoi vedere accanto il resto del campo.

### 3. Il Markdown deve uscire di nuovo

MarkItDown converte *verso* Markdown. È tutto il suo disegno, e “l’unica destinazione” gli si addice in un modo che a Pandoc non si addice.

Nel momento in cui il compito diventa “abbiamo il Markdown e ora deve essere un file Word su cui l’ufficio legale segna le modifiche”, stai guardando un altro strumento. [Pandoc](/blog/pandoc-alternatives-for-markdown-to-html) è la risposta di riferimento per quella direzione e per la matrice dei formati in generale: una sorgente, più uscite, tenute allo stesso passo.

### 4. Il documento non deve lasciare la macchina

Questo punto va letto con attenzione, perché “gira in locale” e “senza rete” non sono la stessa frase.

I convertitori integrati di MarkItDown sono locali. I suoi risultati migliori sugli ingressi difficili non lo sono: Azure Document Intelligence e Azure Content Understanding sono servizi cloud, ogni chiamata è a pagamento, e le descrizioni delle immagini funzionano mandando l’immagine a un LLM attraverso un client che costruisci tu. Tutte e tre le cose si attivano apposta e nessuna è una sorpresa — la documentazione è chiara —, ma una risposta di conformità che dice “gira in locale” mentre la pipeline passa un flag che carica la pagina è esattamente ciò che si scopre solo durante un audit. [Come verificare dove un convertitore manda il tuo file](/blog/is-an-online-converter-safe) è una domanda che merita ogni strumento di questa pagina, il nostro compreso.

## Che cosa qui non sostituisce nulla

Essere onesti è anche la parte utile, perché ti dice quando smettere di leggere.

- **Trascrizioni di YouTube e audio.** Nient’altro in questo articolo trasforma l’indirizzo di un video o un `.wav` in testo. Se è nella lista, MarkItDown è nella lista.
- **File `.msg` di Outlook.** Un formato davvero scomodo, e lo legge.
- **Archivi ZIP, percorsi.** Attraversa il contenuto e converte ogni pezzo.
- **Il sistema di plugin.** Un formato che ti serve e che nessuno supporta è un pacchetto che pubblichi, non un fork che mantieni.
- **Un server MCP.** `markitdown-mcp` mette l’insieme davanti a un assistente, ed è [il modo più economico di far entrare un documento in una conversazione](/blog/what-a-document-costs-an-assistant) quando il file sta già sulla macchina che l’assistente raggiunge.

## Dove si colloca questo sito

TransformPipe è la risposta lato browser al primo motivo. Quindici conversioni — Word, PowerPoint, EPUB, fogli di calcolo, HTML, CSV, JSON e le esportazioni di Notion, Confluence, Obsidian ed Evernote — girano nella pagina, senza caricare nulla, e gli stessi convertitori stanno dietro un’API, uno strumento a riga di comando, un’estensione per il browser dedicata alla pagina che stai leggendo e un server MCP per un assistente.

I limiti onesti, nello spirito della nota sul perimetro citata sopra: **qui il PDF non c’è affatto**, in nessuna direzione, e non ci sarà — leggere un PDF in modo accettabile richiede modelli di impaginazione e OCR, quindi un server, e questo toglierebbe l’unica proprietà per cui vale la pena avere un convertitore nel browser. Niente audio, niente video, niente YouTube. E l’uscita è Markdown e HTML invece di una matrice di formati; un `.docx` esce, ma la portata di Pandoc no.

Se la risposta a “dove gira” è “in un processo Python accanto ai file”, installa MarkItDown. Se è “nella scheda che sto guardando”, niente di tutto questo fa per te, ed è proprio per questo che la lista esiste.
