---
title: "Dove finiscono le immagini quando esporti un documento"
description: "Ogni esportazione mette le immagini da qualche parte e quasi ogni conversione ce le lascia — dove le tiene ciascun formato, le tre uscite e il conto dell'incorporare"
date: 2026-09-21
tag: Conversione
keywords: immagini mancanti in markdown, convertire documento mantenendo le immagini, esportazione notion immagini, immagini docx markdown, immagine base64 markdown, esportare documento con immagini
---

L'esportazione ha funzionato. Le intestazioni sono giuste, gli elenchi sono giusti, le tabelle sono passate, e ogni immagine è un rettangolo grigio con l'angolo piegato. È di gran lunga il modo più comune in cui una conversione di documenti delude qualcuno, e quasi mai vuol dire che il convertitore non abbia trovato le immagini. Le ha trovate, ha deciso che erano un problema di qualcun altro e ha scritto un riferimento a un file che sapeva non essere in tuo possesso.

### In breve

In qualsiasi formato documentale un'immagine è un file separato dentro il contenitore, e il documento vi rimanda tramite un percorso. Markdown è un unico file di testo, quindi i posti in cui un'immagine può finire sono esattamente tre: una cartella accanto al Markdown, un indirizzo da qualche parte in rete, oppure il Markdown stesso, come URI `data:`. La maggior parte dei convertitori ne sceglie una quarta per sbaglio — un percorso verso la cartella che sarebbe esistita se avessero scritto i file — ed è il rettangolo grigio. Incorporare è l'unica delle tre che sopravvive a una email, e costa circa un terzo di byte in più del file su disco, perché base64 scrive tre byte come quattro caratteri.

La regola pratica: dopo qualsiasi conversione, cerca `src="` e `](` nel risultato e guarda che cosa dicono davvero i percorsi. Sono dieci secondi e ti dicono quale delle quattro ti è capitata.

## Dove ciascun formato tiene le sue immagini

| Origine | Dove sono i byte | Come il documento vi rimanda |
| --- | --- | --- |
| `.docx` | `word/media/image1.png` dentro lo zip | Un identificatore di relazione, risolto tramite `word/_rels/document.xml.rels` |
| `.pptx` | `ppt/media/image1.png` | Lo stesso meccanismo, diapositiva per diapositiva |
| `.odt` | `Pictures/10000201000...png` | Un `xlink:href` su un `<draw:image>` |
| `.epub` | Dove dice il manifesto, di solito `OEBPS/images/` | Un percorso relativo dall'XHTML del capitolo |
| Esportazione Notion | Una cartella col nome della pagina e il suo identificatore di 32 caratteri | Un percorso relativo codificato, `%20` per ogni spazio |
| Esportazione HTML di Confluence | `attachments/<id pagina>/<file>` | Un `src` relativo dall'HTML della pagina |
| Vault di Obsidian | Dove le hai messe, spesso `assets/` | `![[immagine.png]]`, risolto sull'intero vault |
| Evernote `.enex` | In base64 dentro l'XML della nota | `<en-media hash="…">`, l'MD5 dei byte decodificati |
| Google Docs | Non nell'esportazione `.docx` finché non ne fai una | Scaricate nello zip quando esporti in HTML |

Due di quelle righe meritano un secondo sguardo, perché è lì che le conversioni sbagliano in un modo difficile da diagnosticare.

**Notion** scrive percorsi codificati. Una pagina chiamata `Q3 Plan` diventa una cartella `Q3 Plan 1f2a…`, e il Markdown rimanda a `Q3%20Plan%201f2a…/chart.png`. Un convertitore che non decodifica il percorso cerca una directory con un `%20` letterale nel nome, non trova niente ed emette il riferimento immutato. [Convertire un'esportazione Notion](/blog/convert-notion-export-to-markdown) passa in rassegna il resto di ciò che fanno quegli identificatori.

**Evernote** non memorizza nessun nome di file. Un'immagine è indirizzata dall'MD5 dei propri byte, e la risorsa che porta quei byte compare altrove nello stesso file, codificata in base64. Accoppiarle significa calcolare MD5 su ogni risorsa decodificata — motivo per cui una conversione o fa questa cosa per bene o perde tutte le immagini della nota. Una via di mezzo non c'è.

## I tre posti in cui un'immagine può andare

| Destinazione | Sopravvive all'email | Sopravvive allo spostamento della cartella | Sopravvive alla sparizione dell'origine | Costo |
| --- | --- | --- | --- | --- |
| Una cartella accanto al Markdown | No — arriva un file e l'altro no | No | Sì | Nessuno |
| Un indirizzo pubblico | Sì | Sì | No — link morti, e chi ospita vede chi guarda | Nessuno per te |
| Un URI `data:` nel file | Sì | Sì | Sì | Circa 4 byte di testo ogni 3 di immagine |

La cartella è l'impostazione predefinita di quasi ogni strumento da riga di comando, ed è la risposta giusta quando il Markdown va in un repository: la cartella viaggia con lui, git segue entrambi, e nessuno manda niente per email. Il `--extract-media` di Pandoc lo fa bene e riscrive i riferimenti di conseguenza, che è proprio ciò che lo separa dai convertitori che fanno solo metà del lavoro.

L'indirizzo pubblico è quello che succede quando un convertitore ospitato dice di aver conservato le tue immagini. Le ha conservate, sul suo server, e il riferimento nel tuo Markdown ora punta lì. È un documento funzionante e una dipendenza permanente: le immagini restano finché resta quell'account, e ogni lettore che apre il file fa una richiesta che l'host può registrare. Utile saperlo prima di mandare il documento a un cliente.

L'URI `data:` è l'unica opzione che produce un unico file autosufficiente, ed è l'impostazione predefinita giusta per un documento che leggerà qualcuno che non sei tu. [L'HTML autosufficiente](/blog/self-contained-html-explained) fa lo stesso ragionamento per la versione resa.

## Il conto dell'incorporare

Base64 trasforma ogni tre byte in quattro caratteri, quindi un'immagine incorporata è circa il 33 per cento più grande del file da cui viene, più un breve prefisso che ne nomina il tipo. Una schermata da 750 KB diventa all'incirca un megabyte di testo. Quella cifra è tutta la ragione per cui i convertitori esitano a incorporare, e vale la pena essere concreti:

- Una relazione di dieci pagine con sei schermate: forse 2 MB di testo. Si apre all'istante, si manda senza problemi, non si rompe mai.
- Una presentazione da convegno con quaranta fotografie: 30 MB di testo. Un editor la aprirà lentamente e un diff non dirà nulla di utile.
- Un documento scansionato: ogni pagina è un'immagine, il file è la scansione più un terzo, e dentro non c'è testo.

Il disegno sensato è un budget, non un interruttore: incorporare fino a un tetto e, oltre, lasciare stare i riferimenti perché il fallimento si veda, invece di produrre un file che nulla apre. Qui quel tetto è di due megabyte di immagini per documento e di un megabyte per una singola immagine — un megabyte codificato sono circa 750 KB su disco, cioè una schermata generosa e una piccola fotografia. Il limite per singola immagine esiste per un fallimento preciso: senza, una fotografia appena scattata col telefono si mangia l'intera dotazione e le dodici schermate successive, quelle che portavano il ragionamento, spariscono tutte.

## Sei modi di perdere le immagini che non sono colpa del convertitore

**L'immagine è un collegamento, non un file.** Un documento che rimanda a un'immagine su una intranet, a un indirizzo di Google Drive o a un link del CDN di Slack non contiene byte da estrarre. La conversione porta fedelmente un riferimento che si risolve solo dalla tua rete o dalla tua sessione.

**L'immagine è un metafile.** Un grafico incollato da Excel o uno schema incollato da Visio è spesso memorizzato come EMF o WMF, un formato vettoriale Windows che nessun browser disegna. I byte ci sono, il riferimento è giusto, e il lettore non vede niente. Reincollalo come immagine nel documento di origine prima di convertire; a valle non si aggiusta.

**L'immagine è un disegno, non un'immagine.** Le forme di Word, lo SmartArt di PowerPoint e tutto ciò che esce dagli strumenti di disegno sono istruzioni XML per il rendering, non un file di immagine. In `media/` non c'è niente da estrarre perché il documento non ha mai contenuto nulla.

**Due immagini hanno lo stesso nome.** Fondere una cartella di documenti in un unico file Markdown fa cadere `image1.png` di nove origini sullo stesso percorso. Il risultato mostra nove volte la stessa immagine, e sembra un difetto del convertitore anziché una collisione di nomi.

**Il testo alternativo non è mai stato scritto.** Il testo alternativo è l'unica cosa di un'immagine che Markdown porta alla perfezione, e in quasi tutti i documenti è vuoto, perché lo strumento di scrittura non l'ha chiesto. Quando un'immagine cade per uno dei motivi qui sopra, un buon testo alternativo è la differenza fra una frase che sta ancora in piedi e un buco.

**L'immagine è il testo.** La schermata di una tabella è l'immagine di una tabella. È il fallimento senza alcun rimedio tecnico, e l'unico momento utile per accorgersene è prima della conversione, nell'origine.

## Che cosa dovrebbe fare una conversione, e che cosa controllare

Una conversione che tratta bene le immagini fa quattro cose, e ognuna si verifica in meno di un minuto:

1. **Risolvere il riferimento con il meccanismo proprio del formato** — identificatori di relazione per OOXML, il manifesto per EPUB, MD5 per Evernote — invece di indovinare da un nome di file.
2. **Decodificare il percorso** prima di cercare il file, così che `%20` e `+` non diventino parte del nome di una directory.
3. **Dire che cosa ha fatto dei byte.** Incorporati, scritti accanto, o lasciati dov'erano: tutte e tre si difendono, il silenzio no.
4. **Tenere il testo alternativo**, anche quando scarta l'immagine.

E dal lato del risultato:

- Cerca `](` e leggi i percorsi. Tutto ciò che è relativo è una promessa su una cartella.
- Cerca `data:image` e conta. Ti dice quante sono state incorporate.
- Guarda la dimensione del file. Un documento Markdown con immagini incorporate si misura in megabyte; uno senza, in kilobyte, per quante immagini avesse l'originale.
- Aprilo altrove. La macchina dell'autore è l'unico posto in cui ogni percorso si risolve, ed è esattamente per questo che l'autore è l'ultimo ad accorgersene.

## Dove ti lascia tutto questo

Per un documento che va in un repository, una cartella accanto è la cosa giusta, e l'unico requisito è che il convertitore riscriva i riferimenti verso dove ha davvero scritto. Per un documento che va a una persona, incorporare è l'unica risposta che sopravvive al viaggio, e il prezzo è un terzo di byte in più e un tetto che conviene conoscere anziché scoprire. Per tutto quello che sta in mezzo, il controllo sono le stesse tre ricerche, e vale la pena farlo una volta su un documento a cui tieni prima di affidarne cinquanta a uno strumento.

Ogni conversione qui — [Word](/word-to-markdown), [PowerPoint](/powerpoint-to-markdown) e [le esportazioni di Notion, Confluence e Obsidian](/notion-to-markdown) fra le altre — incorpora le immagini che trova, nel browser, così niente viene caricato per essere ospitato e niente dipende da una cartella rimasta indietro. Per il problema vicino dei collegamenti che si risolvono solo dalla tua scrivania, [le immagini e i collegamenti che funzionano ancora](/blog/images-and-links-that-still-work) dice il necessario.
