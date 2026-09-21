---
title: "Come convertire un DOCX in Markdown: le strade browser, Pandoc e mammoth"
description: "Converti un .docx in Markdown in tre modi, scopri perché è l'archivio a decidere cosa sopravvive, e la lista per trovare cosa la conversione ha perso"
date: 2026-09-04
tag: Conversione
keywords: docx in markdown, convertire docx in markdown, docx in md online, pandoc docx markdown, mammoth docx markdown, docx markdown da riga di comando, docx markdown senza caricare file, docx markdown numerazione elenchi
---

Hai un file Word e ti serve Markdown. Prima mossa ragionevole: apri il `.docx` in un editor di testo e guarda cosa c'è dentro. Quello che ottieni è una schermata di macerie binarie con le lettere `PK` in testa e qualche nome di file riconoscibile sepolto in mezzo. Niente in quella schermata suggerisce un documento.

Quella schermata è la cosa più utile che vedrai oggi, perché ti dice cos'è davvero la conversione. Un `.docx` non è un file con del testo dentro. È un archivio zip che contiene una dozzina di file XML, le parole stanno in uno di questi mentre il significato delle parole è sparso negli altri. Convertirlo in Markdown significa spacchettare l'archivio, risolvere quei riferimenti incrociati, e buttare via tutto quello per cui Markdown non ha sintassi.

Ecco perché lo stesso documento si converte in modo diverso in strumenti diversi, e perché i guasti sono così specifici. Le intestazioni arrivano ma l'elenco numerato è uscito come paragrafi semplici. La tabella è arrivata senza la sua riga di intestazione. Le immagini sono assenti, o presenti come un'unica riga di base64 lunga quarantamila caratteri. Le note a piè di pagina semplicemente non ci sono, e niente te l'ha detto. Ognuno di questi ha una causa che puoi trovare in circa due minuti, sapendo dove guardare.

Questo è il come-si-fa: cosa c'è dentro il file, tre strade per uscirne, e poi la parte che quasi nessuna guida tratta — come leggere il risultato e capire cosa ha perso.

### In breve

Per un solo documento, usa un convertitore che gira nel browser: trascina il `.docx` dentro, leggi il Markdown, senza installare niente e senza caricare niente. Per più di un documento, per immagini che ti servono su disco, o per un file passato per una revisione, installa **Pandoc** e usa `pandoc -f docx -t gfm --wrap=none --extract-media=./media`. Per la conversione dentro il tuo codice, usa **mammoth** per produrre HTML e un passaggio separato da HTML a Markdown dopo — è esattamente quello che raccomandano gli autori di mammoth stessi. Poi controlla tre cose nell'output prima di buttare via il `.docx`: se gli elenchi numerati sono ancora elenchi, dove sono finite le immagini, e se le note a piè di pagina esistono affatto.

## Cos'è davvero un .docx, e perché un editor di testo mostra nonsenso

Un `.docx` è un archivio zip nel formato Office Open XML, standardizzato come ECMA-376 e ISO/IEC 29500. Ogni file zip al mondo inizia con i due byte `PK`, le iniziali di Phil Katz, che scrisse il formato originale — quindi è la prima cosa che il tuo editor di testo ti mostra, seguita da dati compressi che non ha modo di visualizzare.

Rinomina una copia in `.zip`, spacchettala, e il documento diventa una cartella:

```
$ cp report.docx report-copy.zip
$ unzip -l report-copy.zip
  [Content_Types].xml
  _rels/.rels
  word/document.xml
  word/styles.xml
  word/numbering.xml
  word/settings.xml
  word/fontTable.xml
  word/footnotes.xml
  word/media/image1.png
  word/media/image2.jpeg
  word/_rels/document.xml.rels
  docProps/core.xml
  docProps/app.xml
```

L'elenco esatto varia, e la variazione è la parte interessante. `word/numbering.xml` c'è solo se il documento ha mai avuto un elenco. `word/footnotes.xml` c'è solo se ha note a piè di pagina. `word/media/` esiste solo se ci sono immagini. `word/header1.xml` appare se qualcuno ha impostato un'intestazione di pagina ricorrente. Un archivio a cui manca una di queste parti è mancante della funzione corrispondente, e nessun convertitore può inventarla.

Su Windows, PowerShell non espande un archivio la cui estensione non è `.zip`, quindi copialo prima:

```powershell
Copy-Item report.docx report-copy.zip
Expand-Archive report-copy.zip -DestinationPath .\report-unzipped
```

`word/document.xml` è di solito una riga enorme, perché Word non ha motivo di renderlo leggibile. Passalo attraverso un formattatore prima di provare:

```
$ xmllint --format report-unzipped/word/document.xml | head -60
```

Ora il punto importante. In quell'XML, **il significato è memorizzato per riferimento**. Un'intestazione non è etichettata come intestazione. È un paragrafo che porta un elemento `w:pStyle` che nomina uno stile, e la definizione di quello stile — dentro `styles.xml` — è quella che dice che è Heading 1. Un elemento di elenco è un paragrafo con un elemento `w:numPr` con un `w:numId` e un `w:ilvl`, e se quello sia un punto elenco o un numero decimale vive in `numbering.xml`. Un'immagine è un attributo `r:embed` che contiene un id di relazione, e `word/_rels/document.xml.rels` è quello che trasforma quell'id in `word/media/image1.png`.

Quindi un convertitore da `.docx` a Markdown è un programma che fa quattro cose in ordine: spacchetta il pacchetto, percorre `document.xml`, risolve i riferimenti di ogni elemento contro le altre parti, e serializza il risultato come Markdown. Ogni differenza tra strumenti è una differenza nel terzo o nel quarto passaggio. Quando il terzo passaggio non riesce a risolvere qualcosa, il convertitore non ha idea di cosa stesse guardando, e quello che ottieni è un paragrafo semplice.

| Parte dell'archivio | Cosa contiene | Cosa si rompe senza di essa |
| --- | --- | --- |
| `word/document.xml` | I paragrafi, i run e le tabelle | Niente si converte affatto |
| `word/styles.xml` | Le definizioni degli stili con nome | Le intestazioni arrivano come paragrafi in grassetto |
| `word/numbering.xml` | Formati, livelli e riavvii degli elenchi | Gli elenchi numerati e puntati arrivano come paragrafi |
| `word/_rels/document.xml.rels` | Gli id di relazione verso i percorsi dei file | Le immagini non si trovano più |
| `word/media/` | I file immagine stessi | I riferimenti alle immagini puntano al nulla |
| `word/footnotes.xml` | Il testo delle note a piè di pagina | Marcatori di nota senza testo, o nessuna nota |
| `word/comments.xml` | I commenti di revisione | Commenti persi, di solito in silenzio |

## Quale strada per quale lavoro

| Strada | Ideale per | Installazione richiesta | Cosa fa con le immagini | Prezzo |
| --- | --- | --- | --- | --- |
| Convertitore nel browser | Un documento solo, subito, senza caricarlo | Nessuna | Le inserisce in linea, o lascia i riferimenti | Gratis |
| Pandoc | Lotti di file, revisioni tracciate, immagini su disco | Pandoc | `--extract-media` le scrive in una cartella | Gratis, GPL |
| mammoth (Node o browser) | Conversione dentro la tua applicazione | npm | Data URI di default, o una tua funzione di richiamo | Gratis, BSD-2-Clause |
| mammoth CLI | Un lavoro singolo con le immagini come file | npm | `--output-dir` le scrive vicino all'HTML | Gratis, BSD-2-Clause |
| MarkItDown | Dare testo in pasto a una pipeline, non a una persona | Python | Estratte dove il formato lo permette | Gratis, MIT |
| Word, Salva come pagina web | Un documento che altri convertitori maltrattano | Word | Scritte in una cartella vicino all'HTML | Con Word |
| Export da Google Docs | Un documento già in Drive | Nessuna | Incluse nel download | Gratis con un account |
| Copia e incolla | Pochi paragrafi, subito | Nessuna | Perse | Gratis |
| LibreOffice, senza interfaccia | Vecchi `.doc`, `.rtf` e formati insoliti | LibreOffice | Portate nel `.docx` che scrive | Gratis, MPL 2.0 |
| python-docx e uno scrittore tuo | Una regola aziendale che nessun convertitore implementa | Python | Quello che scrivi tu | Gratis, MIT |
| Spacchettare e leggere l'XML | Capire perché una conversione è fallita | Nessuna | Le guardi direttamente | Gratis |

Tre di quelle righe sono le strade che quasi tutti usano davvero, e il resto di questo articolo parla soprattutto di loro. Se vuoi le strade confrontate come prodotti invece che come procedure — prezzi, licenze, a chi conviene ognuna — [il confronto completo degli strumenti da Word a Markdown](/blog/best-word-to-markdown-converters) copre quelle che questa pagina si limita a elencare.

## La strada del browser: trascina il file dentro, leggi il Markdown

Un convertitore nel browser legge il `.docx` con JavaScript sulla tua stessa macchina. L'archivio viene spacchettato nella pagina, l'XML viene percorso nella pagina, e il Markdown appare nella pagina. Senza aver fatto l'accesso, nessuna parte del file viene inviata da nessuna parte, e questo è verificabile invece che una promessa: apri il pannello di rete, converti, e guarda che non succede niente.

La procedura è di quattro passaggi e non c'è niente da configurare.

1. Apri la pagina di conversione.
2. Trascina il `.docx` sopra, oppure scegli lo dalla finestra di dialogo dei file.
3. Leggi il Markdown che appare, e modificalo sul posto se serve.
4. Scarica il `.md`, o copialo fuori.

| Pro | Contro |
| --- | --- |
| Nessuna installazione, nessun terminale, nessun account | Un documento alla volta, non una cartella |
| Niente viene caricato quando non hai fatto l'accesso | Il lavoro lo fa il browser, quindi un file molto grande è limitato dalla macchina |
| Intestazioni, elenchi, tabelle, link, grassetto e corsivo arrivano bene | Nessuna opzione per estrarre le immagini in una cartella a tua scelta |
| Il risultato è modificabile prima di portarlo via | Le revisioni tracciate diventano testo accettato; i commenti non arrivano |

C'è un tetto di dimensione che vale la pena conoscere in anticipo, perché è la sola cosa che ti fermerà. Su TransformPipe, la conversione stessa è limitata a 10 MB, e un documento che tieni nella tua cronologia è limitato a 4 MB, perché la funzione che lo salva rifiuta un corpo di richiesta più grande. Un `.docx` diventa grande per un solo motivo — le fotografie — quindi se un file supera il limite, la risposta di solito è controllare cosa c'è in `word/media/` invece di dare per scontato che il documento sia enorme.

Sotto il cofano, la strada del browser è di solito mammoth più un passaggio da HTML a Markdown, che è esattamente la disposizione che la documentazione di mammoth stesso raccomanda. Conta più di quanto sembri: significa che la strada del browser e quella di mammoth più avanti hanno gli stessi punti forti e gli stessi punti ciechi, e un documento che si converte male in una si converte male anche nell'altra.

**Per chi è.** Per chiunque abbia un documento solo e un motivo per non pubblicarlo sul server di uno sconosciuto — un contratto, una nota di un paziente, un report interno, un piano non ancora annunciato. Anche per chi vuole semplicemente il Markdown nei prossimi trenta secondi senza imparare un flag.

## La strada Pandoc: un comando, e i quattro flag che contano

Pandoc è un convertitore di documenti da riga di comando scritto in Haskell che legge e scrive circa quaranta formati. Il suo lettore di `.docx` è il più configurabile che esista, ed è la sola strada in questa pagina con una risposta documentata per le revisioni tracciate.

Il comando nella sua forma più breve e utile:

```
$ pandoc -f docx -t gfm --wrap=none -o report.md report.docx
```

Che vuol dire: leggi `docx`, scrivi GitHub Flavored Markdown, non ridistribuire i paragrafi, output in `report.md`. Lascia via `--wrap=none` e Pandoc ti manderà a capo forzatamente la prosa a 72 colonne, il che produce un file ostile ai diff ed è la prima cosa che quasi tutti vogliono disfare.

Con le immagini estratte:

```
$ pandoc -f docx -t gfm --wrap=none \
    --extract-media=./media \
    -o report.md report.docx
```

E per un documento passato per una revisione:

```
$ pandoc -f docx -t gfm --wrap=none \
    --track-changes=all \
    -o report.md report.docx
```

Una cartella intera, in bash:

```
$ for f in *.docx; do
    pandoc -f docx -t gfm --wrap=none -o "${f%.docx}.md" "$f"
  done
```

La stessa cosa in PowerShell:

```powershell
Get-ChildItem *.docx | ForEach-Object {
  pandoc -f docx -t gfm --wrap=none -o "$($_.BaseName).md" $_.Name
}
```

| Flag | Cosa fa | Perché lo vuoi |
| --- | --- | --- |
| `-t gfm` | Seleziona GitHub Flavored Markdown come output | Le tabelle e il testo depennato sono GFM, non CommonMark. Il dialetto di default di Pandoc è la sua propria estensione di Markdown, che non è la stessa cosa |
| `--wrap=none` | Smette di ridistribuire i paragrafi a una colonna limite | Un paragrafo per riga significa diff leggibili |
| `--extract-media=DIR` | Scrive le immagini incorporate in una cartella | Altrimenti le immagini rimangono nell'archivio che stai per abbandonare |
| `--track-changes=accept\|reject\|all` | Decide cosa succede alle inserzioni, alle cancellazioni e ai commenti | `accept` è il default e scarta in silenzio la revisione; `all` tiene tutto avvolto in span |
| `--markdown-headings=atx` | Forza intestazioni in stile `#` | Lo scrittore `markdown` proprio di Pandoc usa altrimenti intestazioni sottolineate per i primi due livelli |

| Pro | Contro |
| --- | --- |
| Scriptabile, quindi duecento file costano lo stesso sforzo di uno | Un'installazione, e un terminale |
| Il solo controllo documentato sulle revisioni tracciate e i commenti | Il suo dialetto di output di default non è GFM se non lo chiedi |
| Immagini in una cartella con un solo flag | Gli stili Word personalizzati richiedono una mappa che devi scrivere tu |
| Legge e scrive `.docx`, quindi i round trip sono possibili | Il manuale è lungo e i flag sono molti |

**Prezzo:** gratis, licenza GPL.

**Per chi è.** Per chiunque converta più di un file, chiunque abbia bisogno delle immagini come file, e chiunque tenga in mano un documento passato per una revisione legale o editoriale. Se un `.docx` ha revisioni tracciate dentro, questa è la sola strada in questa pagina che non te le risolverà in silenzio.

## La strada mammoth: convertire un .docx dentro il tuo codice

mammoth è una libreria JavaScript che convertere `.docx` in HTML, con build per Node e per il browser. Un gran numero di strumenti "Word in Markdown" si rivelano essere mammoth con un secondo passaggio incollato sopra, e se stai scrivendo il tuo convertitore è la base sensata da cui partire.

L'idea che lo distingue è la mappa degli stili. Invece di indovinare cos'è un paragrafo, mammoth fa corrispondere gli stili con nome di Word a elementi HTML, e quella mappa è una configurazione che controlli tu:

```js
const mammoth = require("mammoth");
const TurndownService = require("turndown");

const { value: html, messages } = await mammoth.convertToHtml(
  { path: "report.docx" },
  {
    styleMap: [
      "p[style-name='Chapter Title'] => h1:fresh",
      "p[style-name='Section Heading'] => h2:fresh",
      "p[style-name='Intense Quote'] => blockquote:fresh",
    ],
  }
);

const markdown = new TurndownService().turndown(html);

for (const message of messages) {
  console.warn(message.message);
}
```

Due cose in quello snippet sono l'intero motivo per usare la libreria.

La prima è `styleMap`. Un'organizzazione con stili propri — "Chapter Title" invece di "Heading 1" — otterrà paragrafi semplici da ogni altro strumento in questa pagina, perché non c'è nessuna regola da nessuna parte che dica che uno stile chiamato "Chapter Title" è un'intestazione. Qui quella regola la scrivi tu. Il suffisso `:fresh` dice a mammoth di iniziare un nuovo elemento invece di unirsi al precedente, che è quello che vuoi per le intestazioni e non quello che vuoi per uno stile che continua un paragrafo.

La seconda è `messages`. Ogni risultato di mammoth porta un array di avvisi che elenca gli stili che non ha riconosciuto e gli elementi che non ha gestito. È il solo rendiconto leggibile da una macchina di cosa un convertitore ha perso che qualunque strada in questa pagina fornisce. Stampalo, registralo, mostralo ai tuoi utenti. Un avviso di stile non riconosciuto è il momento esatto in cui aggiungere una riga alla mappa degli stili.

Il README di mammoth segna il proprio scrittore Markdown come deprecato e raccomanda di generare HTML e convertire quello in Markdown invece. Segui il consiglio — HTML ha un elemento per quasi tutto quello che un `.docx` contiene, Markdown no, e passare per HTML dà al secondo passaggio qualcosa su cui lavorare. La scelta di quella seconda libreria è una piccola decisione a sé, e [i convertitori da HTML a Markdown che vale la pena considerare](/blog/best-html-to-markdown-converters) differiscono soprattutto in cosa fanno con la marcatura che Markdown non può esprimere.

Nel browser, l'input è un `ArrayBuffer` invece che un percorso:

```js
const buffer = await file.arrayBuffer();
const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buffer });
```

E dalla riga di comando, per un lavoro singolo, il pacchetto porta con sé una CLI che scrive le immagini come file separati invece di inserirle in linea:

```
$ npx mammoth report.docx --output-dir=out
```

| Pro | Contro |
| --- | --- |
| Gira in Node e nel browser | Produce HTML; il passaggio a Markdown è tuo |
| Le mappe di stile gestiscono correttamente gli stili Word personalizzati | Il suo stesso scrittore Markdown è deprecato dai suoi autori |
| Riporta cosa non ha potuto mappare, in `messages` | Solo JavaScript |
| Una CLI è incluso per lavori singoli | Nessun layout di pagina, perché HTML non ha una pagina |

**Prezzo:** gratis, licenza BSD-2-Clause.

**Per chi è.** Per gli sviluppatori che integrano la conversione in un'applicazione, e per chiunque i cui documenti usino stili aziendali propri invece di quelli integrati di Word. Nel browser è di fatto la sola opzione vera.

## Dove la conversione fallisce, e cosa costa

Tutto quanto sopra funziona. Quello che segue è quello che succede comunque, perché un `.docx` ha centinaia di costrutti e Markdown ne ha circa una dozzina. Le perdite sono strutturali, non bug, e la domanda utile è a quali stai accettando di rinunciare.

### La numerazione sopravvive solo quando numbering.xml risolve l'elenco

Questa è la lamentela più comune sulla conversione dei `.docx`, e ha una causa precisa.

Un elenco numerato in Word è un insieme di paragrafi, ognuno con un `w:numPr` con un `w:numId` e un `w:ilvl`. Tutto qui. Il paragrafo non sa di essere numerato, non sa quale numero sia, e non sa se sia un punto elenco o un decimale. Tutto questo vive in `numbering.xml`, dove un elemento `w:num` mappa il `w:numId` a una definizione astratta, e quella definizione porta un `w:lvl` per ogni livello di indentazione con un `w:numFmt` che dice `bullet`, `decimal`, `lowerRoman` e così via.

Quindi un convertitore che incontra un paragrafo di elenco deve seguire due salti: da `w:numId` alla definizione della numerazione, poi da `w:ilvl` al livello dentro quella definizione. Se uno dei due salti fallisce — la parte è assente, oppure c'è ma non contiene la definizione a cui si fa riferimento — il convertitore non ha niente su cui basarsi. Non sa affatto che quel paragrafo fosse un elemento di elenco. Quello che emette è un paragrafo ordinario, e lo emette senza protestare, perché dal suo punto di vista niente è andato storto.

Leggi il codice di mammoth e il meccanismo è visibile direttamente: un livello conta come ordinato quando il suo formato numerico è qualunque cosa diversa da `bullet`, e quando la parte di numerazione non si trova la libreria ricade su un insieme vuoto di definizioni. Con un insieme vuoto, la ricerca della numerazione di un paragrafo non torna niente, il paragrafo smette di corrispondere alla regola che l'avrebbe reso un elemento di elenco, ed esce come prosa.

Ecco perché gli elenchi di un documento si convertono perfettamente e quelli del documento successivo collassano. Non è lo strumento a essere incoerente. Un archivio aveva una parte di numerazione utilizzabile e l'altro no — cosa che succede ai file assemblati da script, esportati da altre applicazioni, generati da strumenti di reportistica, o riparati da Word dopo un crash. Prima di dare la colpa al convertitore, spacchetta il file e guarda:

```
$ unzip -l report-copy.zip | grep numbering
```

Nessun `word/numbering.xml` nell'elenco significa che nessuna strada in questa pagina ti darà gli elenchi, e il rimedio sta più a monte: apri il documento in Word o LibreOffice, applica una vera formattazione a elenco, salva, e convertilo di nuovo. E controlla la nidificazione di quello che sopravvive, perché i sottolivelli che si appiattiscono nel livello superiore sono un guasto separato con cause proprie — [l'indentazione degli elenchi e gli a capo](/blog/markdown-line-breaks-and-lists) si comportano male in Markdown per motivi che non hanno niente a che fare con Word.

### Le immagini finiscono come file separati, come base64, o in nessun posto

Markdown non contiene mai un'immagine. Contiene un riferimento a una — `![caption](path/to/image.png)` — e il file deve esistere a quel percorso quando qualcosa rende il Markdown. Un `.docx`, al contrario, contiene i byte veri dell'immagine dentro `word/media/`. Colmare quel divario è una decisione, e ogni strada la prende in modo diverso.

| Strada | Cosa ottieni | Cosa devi poi fare |
| --- | --- | --- |
| Pandoc con `--extract-media=./media` | File immagine in `./media`, riferimenti che puntano lì | Tieni la cartella accanto al Markdown, e fai commit di entrambi |
| Pandoc senza | Riferimenti verso un percorso che non esiste su disco | Rilancia con il flag |
| mammoth, default | `<img src="data:image/png;base64,...">` nell'HTML | Decidi se vuoi un file enorme o file separati |
| mammoth con una funzione `convertImage` | Quello che scrivi tu | Scrivi i file e restituisci lo `src` che vuoi |
| mammoth CLI con `--output-dir` | Immagini come file accanto all'HTML | Convertilo in Markdown, percorsi intatti |
| Copia e incolla | Niente | Salva ogni immagine da Word a mano |

Il caso base64 sorprende le persone più di ogni altro. Un data URI è legale, autonomo, e si rende correttamente — e una singola fotografia diventa una riga di Markdown lunga decine di migliaia di caratteri, il che rende il file illeggibile in un editor, non revisionabile in un diff, e lento in qualunque cosa faccia syntax highlighting. È la risposta giusta quando il Markdown deve viaggiare da solo senza una cartella accanto, ed è la risposta sbagliata in un repository.

Il default di mammoth è il data URI, e sovrascriverlo è un'opzione documentata invece di un ripiego:

```js
const options = {
  convertImage: mammoth.images.imgElement(function (image) {
    return image.read("base64").then(function (data) {
      return { src: "data:" + image.contentType + ";base64," + data };
    });
  }),
};
```

Quell'esempio riproduce il default; sostituisci il corpo con codice che scrive i byte in un file e restituisce uno `src` relativo, e hai le immagini su disco con i percorsi che hai scelto tu. Qualunque strada tu prenda, le immagini sono la parte della conversione più probabile a rompersi più avanti invece che adesso, quando il Markdown si sposta e la cartella no — [cosa mantiene davvero funzionante un riferimento a un'immagine](/blog/images-and-links-that-still-work) vale la pena leggerlo prima di fare commit di cento file convertiti.

### Intestazioni che non erano mai intestazioni

Se qualcuno ha costruito le proprie intestazioni selezionando una riga, impostandola a 18pt e premendo grassetto, non c'è nessun `w:pStyle` da risolvere, e nessun convertitore può distinguere quella riga da una frase enfatica. Otterrai `**Chapter Two**` come paragrafo, oppure testo semplice, a seconda dello strumento.

Questo non si può correggere nel convertitore, solo a monte. Apri il documento, applica veri stili di intestazione dalla galleria degli stili, salva, converti di nuovo. Se il documento usa stili con nome personalizzati invece, `styleMap` di mammoth è la risposta e Pandoc richiede una mappa di stili che devi scrivere tu. Il costo di non correggerlo è che il tuo Markdown non ha nessuna struttura di documento — nessun indice, nessuna ancora, nessuno schema — e la struttura è la maggior parte di quello per cui Markdown esiste.

### Tabelle che perdono l'intestazione, o la forma

La sintassi delle tabelle di Markdown è una griglia di celle singole, con una riga di intestazione, nessuna unione, e nessun contenuto a blocco. Una tabella `.docx` è una struttura annidata di righe e celle con unioni, allineamento verticale, tabelle annidate e paragrafi dentro le celle.

Una griglia semplice si converte bene. Tutto il resto si degrada: una cella di intestazione unita diventa una cella sola e le colonne si spostano, una cella con un elenco puntato dentro diventa una cella con il testo dell'elenco fuso insieme, una tabella annidata viene appiattita o eliminata. Peggio, il risultato di solito sembra plausibile. Il guasto non è un disordine sulla pagina, è una tabella che si legge correttamente e ha i dati sbagliati nella colonna sbagliata. Conta le colonne nell'output confrontandole con quelle in Word, sulla tabella più larga del documento, prima di fidarti di una qualunque — [le tabelle sono la cosa più comune a rompersi in entrambe le direzioni](/blog/markdown-tables-that-survive-conversion).

Le righe di intestazione svaniscono per un motivo specifico che vale la pena sapere: Word segna una riga di intestazione con una proprietà di riga di tabella, e un convertitore che la ignora produce una tabella la cui prima riga è una riga di dati ordinaria. Markdown richiede una riga di intestazione, quindi quello che ottieni è o una tabella con la prima riga di dati promossa a intestazione, oppure una tabella con l'intestazione vuota e tutto spostato in basso di una riga.

### Note a piè di pagina, commenti e caselle di testo

Le **note a piè di pagina** vivono in `word/footnotes.xml` e sono richiamate dal testo con un `w:footnoteReference`. Hanno un posto dove atterrare solo in alcune varianti: le note a piè di pagina non sono né in CommonMark né in GFM, quindi esistono come estensioni. Il dialetto Markdown proprio di Pandoc ha sintassi per le note; un convertitore che punta a CommonMark stretto deve inserirle in linea, aggiungerle come paragrafi ordinari alla fine, oppure eliminarle. Scorri in fondo all'output e guarda prima di assumere.

I **commenti** sono una conversazione attaccata a un intervallo di testo, e Markdown non ha nessuna ancora a cui attaccarne uno. Il manuale di Pandoc afferma che sia `accept` sia `reject` ignorano i commenti e solo `--track-changes=all` li include. mammoth li lascia fuori a meno che non aggiungi tu una mappa di riferimento ai commenti. Tutto il resto li elimina senza dirlo. Il filo della revisione è spesso la cosa più preziosa in un documento ed è la prima a sparire.

Le **caselle di testo e le forme** sono oggetti di disegno, non parte del flusso del documento. Il testo dentro una di queste può stare quasi ovunque nell'XML rispetto a dove appare sulla pagina, e spesso semplicemente svanisce. Questa è la perdita più difficile da credere, perché la citazione in evidenza era proprio lì sullo schermo. Cerca nell'output una frase che sai stava in una casella di testo; se manca, non era mai stata nel flusso.

E poi le cose senza nessun equivalente Markdown affatto: font, dimensioni del testo, colori, margini, dimensione della pagina, interruzioni di pagina, intestazioni di pagina, piè di pagina e numeri di pagina. Non "poco supportati" — assenti dalla sintassi. Uno strumento che sembra conservarli sta emettendo HTML grezzo con attributi `style`, che è un documento diverso che indossa un'estensione di Markdown.

## La lista di controllo: cosa leggere nel file convertito

Fallo una volta, su un documento rappresentativo, prima di convertirne duecento. Ci vogliono circa dieci minuti e vale più di ogni tabella di confronto compresa quella qui sopra, perché i tuoi documenti non sono uguali a quelli di nessun altro.

1. **Leggi le intestazioni come un elenco.** `grep -n "^#" report.md` ti dà lo schema del documento in una schermata. Se è corto, le intestazioni sono diventate paragrafi — cerca `**Riga in grassetto**` da sola su una riga, che è quello in cui si trasforma un'intestazione formattata a mano.
2. **Trova gli elenchi.** Cerca righe che iniziano con `1.`, `-` o `*`. Se il documento aveva procedure numerate e l'output non ne ha nessuna, vai a controllare `word/numbering.xml` prima di fare altro.
3. **Controlla la nidificazione degli elenchi.** I sottoelementi dovrebbero essere indentati sotto i genitori. I sottolivelli appiattiti sono comuni e cambiano il significato di una procedura.
4. **Conta le colonne nella tabella più larga.** Confronta con Word. Poi controlla se la riga di intestazione è davvero quella, e non la prima riga di dati promossa.
5. **Cerca i riferimenti alle immagini.** `grep -n "!\[" report.md` te li elenca. Poi conferma che i file esistano a quei percorsi, oppure conferma che i data URI ci siano — un riferimento a un file mai estratto si rende come immagine rotta e niente te lo dice.
6. **Scorri in fondo alla pagina.** Le note a piè di pagina e le note finali appaiono lì, appaiono in linea, oppure non appaiono. Qualunque di queste può essere accettabile; non sapere quale hai ottenuto no.
7. **Cerca una frase che sai stava in una casella di testo, una didascalia o un richiamo.** Questo è il test per le perdite che niente segnala.
8. **Cerca una frase che sai era stata eliminata durante la revisione.** Se è presente, le revisioni tracciate sono state mantenute come testo. Se una frase eliminata è sparita e ti serviva la cronologia, hai convertito con l'impostazione sbagliata.
9. **Guarda in cima al file.** L'indice basato su campo di Word si converte in qualunque testo fosse memorizzato l'ultima volta che Word l'ha aggiornato, con numeri di pagina che puntano a pagine che non esistono più. Eliminalo e lascia che il tuo renderer ne costruisca uno nuovo.
10. **Apri il Markdown in un renderer, non in un editor.** L'editor ti mostra la sintassi; il renderer ti mostra cosa ottiene chi legge. Sono in disaccordo più spesso di quanto ti aspetteresti.

In PowerShell, il primo, il secondo e il quinto di questi sono:

```powershell
Select-String -Path report.md -Pattern '^#'
Select-String -Path report.md -Pattern '^\s*(\d+\.|[-*])\s'
Select-String -Path report.md -Pattern '!\['
```

| Sintomo nell'output | Cosa è successo davvero | Cosa fare |
| --- | --- | --- |
| Le intestazioni sono paragrafi in grassetto | Il documento non aveva stili di intestazione, o ne aveva di personalizzati | Applica veri stili in Word, oppure scrivi una mappa di stili |
| Gli elenchi numerati sono paragrafi semplici | `numbering.xml` mancante o irrisolvibile | Controlla l'archivio; risalva da un elaboratore di testi |
| I sottoelementi stanno al livello principale | Livelli di indentazione persi o appiattiti | Correggilo a mano; non c'è un flag per questo |
| La riga di intestazione della tabella è una riga di dati | La proprietà di riga di intestazione è stata ignorata | Correggilo a mano, oppure convertilo passando per HTML |
| Le colonne non si allineano | Celle unite o annidate appiattite | Ristruttura la tabella; Markdown non può esprimere le unioni |
| Icone di immagine rotte | Riferimenti estratti, file no | Rilancia con `--extract-media` o una cartella di output |
| Una riga del file è di 40.000 caratteri | Immagini inserite in linea come data URI | Passa a una strada che scrive file |
| Testo delle note a piè di pagina mancante | La variante di destinazione non ha sintassi per le note | Usa una variante che le ha, oppure accetta l'inserimento in linea |
| Commenti spariti | Ogni strada tranne una li elimina | `--track-changes=all`, e conserva l'originale |
| Una citazione in evidenza manca del tutto | Era in una casella di testo | Copiala a mano |

## Come scegliere una strada

1. **Decidi dove il file può andare prima di scegliere uno strumento.** Un README può essere caricato ovunque. Un contratto firmato, un risultato non ancora annunciato, o qualunque cosa con i dati medici di una persona no, e scegliere un convertitore ospitato per uno di questi è una divulgazione, non una conversione. La conversione lato browser tiene il file sulla macchina e puoi verificarlo nel pannello di rete.
2. **Conta i documenti, poi conta i clic.** Un file non giustifica l'installazione di un binario Haskell. Duecento file non giustificano una scheda del browser e una persona che ci clicca dentro. L'installazione si paga una volta; il clic si paga ogni volta, e questo fa cambiare la risposta tra i cinque file e i cinquanta.
3. **Stabilisci se il documento è stato revisionato.** Le revisioni tracciate e i commenti sono scartati di default in quasi ogni strada. Se la revisione conta, `--track-changes=all` è il modo documentato per conservarla, e se non stai usando Pandoc allora accetta che sia persa invece di scoprirlo più avanti.
4. **Decidi cosa vuoi succeda alle immagini prima di convertire, non dopo.** File in una cartella, oppure base64 dentro il Markdown. Entrambe sono difendibili; nessuna è quello che ottieni per caso, e l'incidente sono di solito riferimenti che puntano al nulla.
5. **Scopri se il documento usa stili veri.** Aprilo in Word e clicca un'intestazione: se la casella dello stile dice Heading 1, ogni strada funzionerà. Se dice Normale, nessuna funzionerà, e il rimedio è nel documento, non nello strumento.
6. **Conserva il `.docx`.** Tutto nella sezione qui sopra è a senso unico. Archivia l'originale dove lo puoi ritrovare, perché il giorno in cui qualcuno chiede cosa diceva il paragrafo eliminato è il giorno in cui scopri che la risposta stava solo nel file che hai cancellato.

## Conclusione

Convertire un `.docx` in Markdown non è traduzione, è triage. Se il documento vive in Google Docs invece che su disco, [quell'export ha una risposta propria](/blog/convert-google-docs-to-markdown). Il lavoro è triage: spacchetta l'archivio, risolvi quello che si può risolvere, e accetta la perdita di tutto quello per cui Markdown non ha sintassi. Sapere che l'archivio è dove vivono le risposte trasforma quasi ogni guasto misterioso in un controllo di due minuti — nessun `numbering.xml`, nessun elenco; nessuno stile di intestazione, nessuna intestazione; nessun `--extract-media`, nessuna immagine. Per un documento solo, la strada onesta più corta è un convertitore che gira nel tuo browser, che è quello che fa [la conversione da Word a Markdown di TransformPipe](/word-to-markdown), gratis, senza installare niente e senza caricare niente quando non hai fatto l'accesso. Per una cartella, per immagini su disco o per un documento revisionato, installa Pandoc. Per la conversione dentro il tuo codice, usa mammoth, leggi i suoi `messages`, e converti il suo HTML invece del suo Markdown. Poi fai passare la lista di controllo, perché le perdite che contano sono quelle silenziose — e [un inventario di ognuna di loro, con un verdetto su quali rimpiangere e quali no](/blog/what-not-to-keep-from-a-docx) è quello da leggere prima di decidere se ne valesse la pena.

## Domande frequenti

### Come convertire un .docx in Markdown senza installare niente?

Usa un convertitore che gira nel browser: spacchetta e legge l'archivio con JavaScript sulla tua stessa macchina, quindi non c'è niente da installare e, senza aver fatto l'accesso, niente da caricare. Conferma quest'ultimo punto apri il pannello di rete mentre converte. L'altra strada senza installazione è copia e incolla, che porta intestazioni, elenchi e link attraverso la clipboard HTML ma perde ogni immagine.

### Perché i miei elenchi numerati sono usciti come paragrafi semplici?

Perché la ricerca a due salti dentro `numbering.xml` è fallita. Un paragrafo di elenco in Word porta solo un id di numerazione e un livello di indentazione; il formato vive in quella parte separata dell'archivio, e se manca o fa riferimento a definizioni che non contiene, il convertitore non può sapere che il paragrafo fosse mai un elemento di elenco. Spacchetta il `.docx` e controlla `word/numbering.xml` prima di dare la colpa allo strumento.

### Qual è il miglior comando per convertire docx in Markdown?

`pandoc -f docx -t gfm --wrap=none --extract-media=./media -o out.md in.docx` copre la maggior parte dei casi: GitHub Flavored Markdown così le tabelle sopravvivono, nessuna ridistribuzione dei paragrafi così i diff restano leggibili, e le immagini scritte in una cartella invece di restare nell'archivio. Aggiungi `--track-changes=all` se il documento è stato revisionato.

### Posso convertire un .doc invece di un .docx?

Non direttamente con nessuna di queste strade — il vecchio formato binario `.doc` è un formato completamente diverso, senza zip e senza XML. Convertilo prima con LibreOffice in modalità senza interfaccia, `soffice --headless --convert-to docx old.doc`, poi converti il `.docx` che ne esce. Aspettati che le sorprese arrivino proprio in quel primo passaggio, dato che è una conversione a sé.

### Le immagini arriveranno automaticamente?

No, perché Markdown fa sempre riferimento a un file immagine invece di contenerne uno. `--extract-media` di Pandoc le scrive in una cartella, mammoth le inserisce come data URI di default o le passa a una funzione di richiamo che scrivi tu, e copia e incolla le perde del tutto. Controlla le immagini prima di eliminare il documento fonte.

### Perché le intestazioni funzionano in un documento e non nell'altro?

Perché l'essere-intestazione è memorizzato come riferimento a uno stile, non come proprietà del testo. Un documento le cui intestazioni vengono dalla galleria degli stili si converte in modo pulito; un documento le cui intestazioni sono testo in grassetto a 18pt non ha nessun riferimento di stile da risolvere, quindi non c'è niente che un convertitore possa trovare. Lo strumento si comporta in modo identico in entrambi i casi — sono i documenti a essere diversi.

### Passare per HTML è meglio che convertire direttamente in Markdown?

Di solito sì, ed è quello che raccomandano gli autori di mammoth. HTML ha un elemento per quasi tutto quello che un `.docx` contiene, quindi il primo passaggio non perde quasi niente, e il secondo passaggio prende poi una decisione chiara su cosa Markdown non può esprimere. Convertire in un solo salto significa che quelle decisioni vengono prese in silenzio, in profondità dentro il lettore, dove non puoi vederle né cambiarle.

### Qualcosa di tutto questo vale per una presentazione PowerPoint?

Solo in parte. Un `.pptx` è lo stesso tipo di zip di parti XML, ma una diapositiva è una superficie di forme posizionate e non un flusso di paragrafi con stili: la domanda difficile passa da “quale stile era questo” a “in che ordine va letto tutto ciò” — e le note del relatore, che sono una parte a sé del file, sono ciò che quasi tutte le strade perdono. [Convertire PowerPoint in Markdown](/blog/convert-powerpoint-to-markdown) percorre le sei strade e dice che cosa lascia indietro ciascuna.
