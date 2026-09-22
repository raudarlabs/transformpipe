---
title: "mammoth.js nel browser: convertToHtml con un arrayBuffer"
description: "Leggere un .docx nel browser o in Node: la chiamata con arrayBuffer, le style map verso il tuo HTML, le immagini in base64 e l’array di avvisi che nessuno legge."
date: 2026-08-20
tag: Codice
keywords: docx in html javascript, mammoth js, convertire docx in html con node, leggere docx in node, parser docx per javascript, docx4js, docxtemplater, docx in html nel browser, python-docx
---

Hai un `.docx` e del codice che ha bisogno di HTML. Su npm ci sono forse una dozzina di pacchetti il cui nome contiene “docx”, e tre dei più diffusi fanno un lavoro completamente diverso da quello che ti serve. Uno genera file Word da zero. Uno riempie segnaposto in un modello. Uno rende un documento in modo che assomigli a una pagina stampata. Solo alcuni leggono un file esistente e restituiscono markup.

Il termine di ricerca è “docx to html javascript” e la risposta onesta è breve: in JavaScript, quel lavoro è di mammoth. Quello che richiede più tempo da spiegare è perché l'output di mammoth è così più pulito di quanto ti aspetti, perché omette in silenzio cose che eri sicuro fossero nel documento, e perché questi due fatti sono lo stesso fatto.

L'attrito non è installare una libreria. È che un `.docx` conserva il significato per riferimento attraverso una dozzina di file XML, e ogni parser deve decidere quali di questi riferimenti seguirà e quali ignorerà. Un parser che li segue tutti produce HTML pieno di span inline che riproduce la pagina e non dice nulla. Un parser che ne segue pochi produce HTML semantico e pulito e scarta il resto in silenzio. Non c'è una terza opzione, e sapere quale hai scelto è la maggior parte del lavoro.

### In breve

Per leggere un `.docx` e ottenere HTML in JavaScript, usa **mammoth** — BSD-2-Clause, funziona in Node e nel browser tramite la build `mammoth.browser.js`, e si guida con una **style map** che traduce gli stili con nome di Word in elementi HTML invece di provare a riprodurre la formattazione. Leggi l'array `messages` su ogni risultato: è il solo elenco leggibile da una macchina di ciò che il convertitore non è riuscito a mappare. Decidi in modo esplicito cosa fare delle immagini, perché il default sono data URI base64 inline e `convertImage` è come lo cambi. E se le liste escono come paragrafi, la causa è quasi sempre `numbering.xml` — il file che le definisce non è nell'archivio, oppure non si risolve.

## Cos'è un .docx per un programma che deve leggerlo

Un `.docx` è un archivio zip di parti XML nel formato Office Open XML. [Come entrarci e cosa contiene ogni parte](/blog/convert-docx-to-markdown) vale la pena leggerlo se non ne hai mai decompresso uno, e il resto di questo articolo presume che tu l'abbia fatto. Quello che conta qui è la forma dei dati una volta superato lo zip, perché è a quella forma che ogni libreria di questa pagina reagisce.

Il corpo del documento è una sequenza di elementi paragrafo `w:p`. Ogni paragrafo contiene elementi run `w:r`. Ogni run contiene un elemento testo `w:t`. Quindi la frase “il resoconto trimestrale è in ritardo” non è memorizzata come una stringa. È memorizzata come un certo numero di run, e quanti dipende da fatti sul documento che non puoi prevedere.

Questa è la prima cosa che sorprende chi cerca di analizzare l'XML da sé. Word divide i run a ogni cambio di formattazione, il che è ragionevole, ma anche ai confini delle revisioni, allo stato del controllo ortografico e a varie contabilità interne, il che non lo è. Una singola parola può essere tre run. La parola “trimestrale” può essere `trime` + `stra` + `le` perché qualcuno ne ha modificato il centro nel 2019. Qualsiasi approccio basato sulla ricerca di una frase in `document.xml` fallisce sui documenti reali, e fallisce a intermittenza, il che è peggio.

La seconda sorpresa è che gli spazi bianchi sono condizionali. Un elemento `w:t` elimina gli spazi iniziali e finali a meno che non porti `xml:space="preserve"`. Unisci i run in modo ingenuo e ottieni “ilresocontotrimestrale”. Unisci con degli spazi e ottieni “trime stra le”.

La terza sorpresa, quella che decide tutto ciò che segue, è l'indirezione. Quasi nulla in `document.xml` dice cos'è:

| Cosa vedi in `document.xml` | Dove vive il significato | Cosa devi seguire |
| --- | --- | --- |
| `w:pStyle` che nomina uno stile | `styles.xml` | La definizione dello stile, più la sua catena `w:basedOn` |
| `w:numPr` con `w:numId` e `w:ilvl` | `numbering.xml` | Da `w:num` a `w:abstractNumId` a `w:abstractNum` fino al `w:lvl` giusto |
| `w:drawing` con un id `r:embed` | `word/_rels/document.xml.rels` | Id di relazione verso un percorso sotto `word/media/` |
| `w:hyperlink` con un `r:id` | la stessa parte rels | Id di relazione verso un URL |
| `w:footnoteReference` con un id | `footnotes.xml` | Il corpo della nota a piè di pagina per id |
| `w:commentRangeStart` e un riferimento | `comments.xml` | Il testo del commento, l'autore e la data |

Un titolo è un paragrafo il cui stile si risolve, a due file di distanza, in qualcosa chiamato Heading 1. Un elenco puntato è un paragrafo il cui `w:numId` si risolve, attraverso due livelli di indirezione, in una definizione di numerazione astratta il cui livello zero ha un `w:numFmt` uguale a `bullet`. Un'immagine è un id di relazione. Niente si descrive da solo.

E c'è uno strato sopra tutto questo. I controlli del contenuto — elementi `w:sdt` — racchiudono contenuto arbitrario, quindi i paragrafi non sono sempre figli diretti di `w:body`. Le tabelle si annidano, e le celle si uniscono tramite `w:gridSpan` e `w:vMerge` piuttosto che con qualcosa che ricordi `colspan`. Le immagini arrivano come `w:drawing` in DrawingML se sono state inserite in questo decennio, e come `w:pict` nel VML legacy se provengono da un file più vecchio o da un copia-incolla. Gli inserimenti tracciati sono normali run racchiusi in `w:ins`; le eliminazioni tracciate nascondono il testo in `w:delText` invece che in `w:t`, il che significa che un lettore che guarda solo `w:t` accetta in silenzio ogni modifica in sospeso come definitiva.

Quindi scrivere un parser proprio non è un weekend. Decomprimere con fflate e percorrere l'XML è il quarto facile del lavoro. Gli altri tre quarti sono la risoluzione dei riferimenti, ed è per questo che scegli una libreria.

## Confronto rapido: il bigliettino

| Libreria | Linguaggio | Legge o scrive | Output | Licenza |
| --- | --- | --- | --- | --- |
| mammoth | JavaScript (Node + browser) | Legge `.docx` | HTML semantico, guidato da una style map | Gratis, BSD-2-Clause |
| docx-preview | JavaScript (browser) | Legge `.docx` | HTML che imita la pagina stampata | Gratis, Apache-2.0 |
| docx4js | JavaScript | Legge `.docx`, `.pptx` | Quello che costruiscono le tue funzioni visitor | Gratis, MIT |
| docxtemplater | JavaScript | Scrive da un modello `.docx` | Un nuovo `.docx` con i segnaposto riempiti | Gratis, MIT o GPL-3.0; moduli a pagamento |
| docx (dolanmiu) | JavaScript / TypeScript | Genera `.docx` | Un file Word da un albero dichiarativo | Gratis, MIT |
| python-docx | Python | Legge e scrive | Un modello a oggetti che percorri tu stesso | Gratis, MIT |
| Pandoc come sottoprocesso | Qualsiasi (chiama una shell) | Legge `.docx` | HTML, Markdown, decine di altri formati | Gratis, GPL |
| LibreOffice headless | Qualsiasi (chiama una shell) | Legge `.doc`, `.docx`, e altro | HTML, o un `.docx` più pulito | Gratis, MPL-2.0 |
| Farsela da sé con fflate o JSZip | Qualsiasi | Legge quello che implementi | Esattamente ciò che scrivi | Il tuo tempo |

La colonna che conta di più è la terza. Metà della confusione in questo campo nasce dal prendere una libreria di scrittura per fare un lavoro di lettura, perché il nome del pacchetto non le distingueva.

## mammoth e la filosofia della style map

mammoth converte `.docx` in HTML. Non cerca di riprodurre il documento. Il suo obiettivo dichiarato è produrre HTML semplice e pulito usando l'informazione semantica nel file — gli stili con nome — e ignorando il resto.

Questa singola decisione spiega tutto quello che piace alle persone e tutto quello di cui si lamentano.

Prendi un paragrafo in Word che è 16pt, grassetto, blu scuro e centrato, con 12pt di spazio sopra. Un convertitore che punta prima di tutto alla fedeltà genera un `div` con sei stili inline. mammoth pone una domanda diversa: che stile è questo paragrafo? Se la risposta è Heading 2, genera `<h2>`. Se la risposta è Normal, genera `<p>` e butta via il grassetto, il blu, la centratura e lo spazio, perché nessuna di queste cose è ciò che il paragrafo *è*. Sono come appariva.

```js
const mammoth = require("mammoth");

const result = await mammoth.convertToHtml(
  { path: "quarterly.docx" },
  {
    styleMap: [
      "p[style-name='Report Title'] => h1:fresh",
      "p[style-name='Report Subhead'] => h2:fresh",
      "p[style-name='Callout'] => aside.callout:fresh",
      "p[style-name='Code Sample'] => pre:separator('\\n')",
      "highlight[color='yellow'] => mark",
      "u => em",
      "comment-reference => sup",
    ],
    includeDefaultStyleMap: true,
  }
);

console.log(result.value);
```

Sei cose in questo frammento vale la pena spiegarle per bene.

**Il matcher è un nome di stile, tra virgolette.** `p[style-name='Report Title']` corrisponde ai paragrafi il cui stile si chiama esattamente così. I nomi degli stili sono quello che l'utente vede nella galleria stili di Word. mammoth permette anche di far corrispondere l'**id** dello stile con la sintassi a punto — `p.ReportTitle` — che è più stabile, perché gli id non cambiano quando il documento viene aperto in una versione di Word in un'altra lingua, mentre i nomi a volte lo fanno.

**`:fresh` non è decorazione.** Senza di esso, mammoth unisce i paragrafi consecutivi che corrispondono in un unico elemento. È corretto per un blocco `pre` e sbagliato per un titolo. `:fresh` significa iniziare un nuovo elemento ogni volta. Dimenticarlo su una mappatura di titolo produce un `h2` enorme che contiene tre titoli, ed è l'errore più comune in assoluto nelle style map.

**`:separator()` gestisce il caso opposto.** Quando invece *vuoi* che i paragrafi consecutivi collassino in un unico elemento, `pre:separator('\n')` mette una nuova riga tra loro invece di incollare insieme il testo. È così che un esempio di codice multi-paragrafo in Word diventa un unico `pre` utilizzabile.

**Esistono anche matcher a livello di run.** Quelli documentati includono `b`, `i`, `u`, `strike`, `all-caps`, `small-caps` e `highlight`, e `highlight` accetta un colore opzionale: `highlight[color='yellow'] => mark`. È così che un documento in cui chi ha revisionato ha evidenziato le domande aperte diventa markup che puoi davvero interrogare.

**`comment-reference` è un matcher.** I commenti sono supportati, e mappare `comment-reference => sup` è come i segni di riferimento arrivano nell'output. Senza una mappatura per esso, i commenti di revisione sono tra le cose che non compaiono, in silenzio.

**`includeDefaultStyleMap` decide se stai estendendo o sostituendo.** Il default è true, quindi le tue regole si aggiungono alla mappa integrata di mammoth invece di sostituirla, e le tue hanno la priorità. Impostalo su false solo quando vuoi il controllo totale e sei pronto a mappare Heading 1 da solo.

C'è un'ulteriore opzione, `includeEmbeddedStyleMap`, e una funzione corrispondente, `mammoth.embedStyleMap(input, styleMap)`, che scrive una style map **dentro** una copia del `.docx`. Quando mammoth legge in seguito quel file, usa la mappa incorporata. Per un team che ti passa documenti costruiti su stili aziendali, è un'idea davvero buona: la mappatura viaggia con il modello invece di vivere nel tuo codice, e la persona che rinomina uno stile è la stessa che ha in mano il file che lo descrive.

### La build per il browser

mammoth distribuisce una build standalone per il browser, `mammoth.browser.js`, con le sue dipendenze incluse, e il repository ha un esempio funzionante in `browser-demo/index.html`. L'unica differenza nella API è l'input: invece di un percorso, gli passi un `arrayBuffer`.

```html
<input type="file" id="docx" accept=".docx">
<div id="out"></div>
<script src="mammoth.browser.js"></script>
<script>
  document.getElementById("docx").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
    document.getElementById("out").innerHTML = result.value;
    result.messages.forEach((m) => console.warn(m.type + ": " + m.message));
  });
</script>
```

Questo è l'intero meccanismo dietro ogni convertitore Word nel browser che hai usato, incluso quello di questo sito. Il file viene letto dalla pagina, convertito sulla macchina, e non viene mai inviato da nessuna parte — una proprietà che puoi verificare con la scheda rete aperta, non una promessa da accettare per fede.

Un avvertimento su questo frammento, e non è piccolo: usare `innerHTML` con markup derivato da un file che qualcuno ti ha mandato è una decisione, non un default. L'output di mammoth è generato dalla struttura del documento, quindi è molto più ristretto dell'HTML arbitrario, ma un `.docx` può portare un hyperlink il cui target è un URL `javascript:`, e un convertitore che riproduce fedelmente il link riprodurrà fedelmente anche quello. Se il file non arriva da te, [sanifica prima che raggiunga il DOM](/blog/sanitising-markdown-safely).

Un dettaglio collegato, da conoscere prima di distribuire: mammoth documenta un'opzione `externalFileAccess`, e l'accesso ai file esterni è **disattivato di default**, da attivare solo per documenti di cui ti fidi. Un `.docx` può fare riferimento a contenuto esterno a sé. Il default della libreria è quello sicuro; lascialo così a meno che tu non abbia una ragione specifica.

### mammoth in una tabella

| Pro | Contro |
| --- | --- |
| L'output è HTML semantico che avresti scritto a mano | Scarta di proposito la formattazione diretta, inclusi colore, dimensione e allineamento |
| Le style map gestiscono gli stili aziendali che nessun altro strumento conosce | Devi scrivere tu quelle mappe; niente le deduce |
| Funziona senza modifiche in Node e nel browser | Solo JavaScript |
| Segnala gli stili non mappati in un array `messages` | Il suo scrittore Markdown è deprecato dal suo stesso autore |
| Le immagini sono configurabili, non fisse | Nessuna geometria di pagina, perché l'HTML non ha pagine |
| È incluso un CLI per lavori occasionali | Caselle di testo, campi e costrutti di layout arrivano in modo irregolare |

**Prezzo:** gratis, licenza BSD-2-Clause.

**Per chi è.** Chiunque abbia come passo successivo dell'HTML in una pagina o in un editor, e chiunque converta documenti prodotti da un modello noto. È la scelta giusta di default nel browser perché lì non c'è una vera concorrenza per l'output semantico.

## Immagini e messages: le due parti del risultato che devi gestire

Ogni chiamata a mammoth restituisce un oggetto con due proprietà, e la maggior parte dei tutorial ne usa solo una.

### Immagini: base64 inline, una callback, o file su disco

Per default, le immagini sono incluse inline nell'HTML di output. In concreto, questo significa che viene eseguito `mammoth.images.dataUri` e ogni immagine diventa un `<img>` il cui `src` è un data URI base64. Per un documento con due logo questo è invisibile e comodo. Per un documento con quaranta screenshot produce un file HTML grande diverse volte il `.docx` originale, e la codifica base64 aggiunge circa un terzo sopra i byte grezzi prima ancora che tutto questo venga memorizzato o trasmesso.

L'opzione `convertImage` è come lo cambi, e `mammoth.images.imgElement` è l'helper che avvolge la tua funzione:

```js
const path = require("node:path");
const fs = require("node:fs/promises");

let index = 0;

const result = await mammoth.convertToHtml(
  { path: "quarterly.docx" },
  {
    convertImage: mammoth.images.imgElement(async (image) => {
      const extension = image.contentType.split("/")[1];
      const name = `image-${index++}.${extension}`;
      const buffer = await image.readAsBuffer();
      await fs.writeFile(path.join("media", name), buffer);
      return { src: `/media/${name}`, alt: image.altText ?? "" };
    }),
  }
);
```

L'oggetto immagine che mammoth ti passa esibisce `contentType` — `image/png`, `image/jpeg` e così via — e metodi di lettura per ogni ambiente: `readAsArrayBuffer()`, `readAsBuffer()` e `readAsBase64String()`. C'è anche un metodo più vecchio, `read([encoding])`, che la documentazione segna come deprecato; usa i tre espliciti.

Quale strada vuoi dipende da dove sta andando l'HTML:

| Destinazione | Strada | Perché |
| --- | --- | --- |
| Un file autonomo da mandare per email | Data URI di default | Il file si apre con la rete disattivata |
| Una pagina su un sito | `convertImage` che scrive file | Il browser mette in cache le immagini separatamente dal markup |
| Un CMS o un editor | `convertImage` che carica e restituisce l'URL del CDN | Le immagini appartengono al CMS, non al markup |
| Un lavoro occasionale dal terminale | Il CLI con `--output-dir` | Scrive le immagini come file separati per te |

Due dettagli mordono le persone. Il primo è che `image.contentType` non è un'estensione di file, e dividerlo sullo slash è una scorciatoia che produce `.jpeg` e `.svg+xml`; mappalo per bene se i nomi dei file contano. Il secondo è che il testo alternativo in Word vive in un campo descrizione che la maggior parte degli autori non riempie mai, quindi `alt` è spesso vuoto e il problema di accessibilità nel tuo output è ereditato, non introdotto.

### L'array messages: il solo registro di ciò che è stato scartato

La seconda proprietà sul risultato è `messages`, un array di oggetti con `type` — “warning” o “error” — una stringa `message`, e un `error` opzionale che contiene l'eccezione lanciata quando ce n'è stata una.

Questa è l'API più sottoutilizzata di tutta la categoria. Nessun altro convertitore di uso comune ti dice cosa non è riuscito a gestire. Pandoc non enumera cosa ha normalizzato in silenzio. Una conversione fatta con copia e incolla non ti dice nulla per definizione. mammoth ti passa una lista.

```js
const { value, messages } = await mammoth.convertToHtml({ path: file });

const unmapped = messages.filter((m) => m.type === "warning");

if (unmapped.length) {
  console.warn(`${unmapped.length} things were not mapped:`);
  for (const m of unmapped) console.warn("  " + m.message);
}
```

Un warning di stile non riconosciuto è un'istruzione, non una lamentela. Sta nominando uno stile che esiste nel documento e non ha una regola nella tua mappa, il che significa che quei paragrafi sono usciti come semplici elementi `p`. Aggiungi una riga alla style map e il warning scompare insieme al difetto. Fallo girare su un corpus di documenti reali e i warning diventano una lista di cose da fare ordinata per frequenza.

Il consiglio operativo è diretto: portali in superficie. Registrali in una build, mostrali in una UI, fai fallire un job CI quando ne compare uno nuovo. Una pipeline di conversione che butta via `messages` è una pipeline che non può distinguere una conversione pulita da una rotta, e nemmeno tu puoi.

## numbering.xml decide se le liste sopravvivono

Il fallimento più segnalato in questa categoria è una lista numerata che arriva come una sequenza di paragrafi semplici, e la diagnosi è quasi sempre la stessa.

Una voce di lista in `document.xml` si presenta così — un paragrafo con proprietà di numerazione e nessun altro indizio sulla sua natura:

```xml
<w:p>
  <w:pPr>
    <w:numPr>
      <w:ilvl w:val="0"/>
      <w:numId w:val="4"/>
    </w:numPr>
  </w:pPr>
  <w:r><w:t>Approve the budget</w:t></w:r>
</w:p>
```

`w:ilvl` è il livello di indentazione. `w:numId` punta a un elemento `w:num` in `numbering.xml`, che punta a un `w:abstractNumId`, che identifica un elemento `w:abstractNum`, che contiene un `w:lvl` per ogni livello, ed è *lì* che `w:numFmt` finalmente dice `bullet`, o `decimal`, o `lowerLetter`, o `upperRoman`. Solo alla fine di quella catena si sa se il paragrafo appartiene a un `ul` o a un `ol`.

Ogni anello della catena è un punto dove può rompersi:

| Fallimento | Causa | Cosa vedi |
| --- | --- | --- |
| `numbering.xml` è assente | Il documento non ha mai contenuto una lista reale | Paragrafi che iniziano con caratteri “1.” digitati |
| `numId` non si risolve in niente | La parte è stata rimossa, o il documento è malformato | Paragrafi, nessun markup di lista |
| L'autore ha digitato i numeri | “1.”, “2.”, “3.” manuali senza alcun `w:numPr` | Paragrafi il cui testo inizia con cifre |
| La lista è uno stile, non una numerazione | Uno stile “List Paragraph” con indentazione ma senza `numPr` | Paragrafi indentati |
| Riavvii di livello e `lvlOverride` | Word può riavviare la numerazione a metà documento | Markup di lista corretto, numeri visibili sbagliati |
| `lvlText` personalizzato | Formati come “Articolo 1.2 —” | Un `ol` che rinumera da 1 nel browser |

Gli ultimi due sono il limite onesto, non un bug. L'`ol` di HTML ha un attributo `start` e niente altro. Non può esprimere “riparti da 1 per ogni gruppo di secondo livello ma continua la sequenza di primo livello”, e non ha un equivalente di una stringa di formato personalizzata per il livello. Un convertitore che ottiene la struttura giusta perderà comunque i numeri visibili quando il documento usava la numerazione di Word come sistema di citazione legale. Se il tuo documento fa questo, i numeri sono contenuto e dovresti considerare di metterli nel testo.

Nota anche cosa la style map raggiunge e cosa non raggiunge. I matcher documentati di mammoth coprono i paragrafi e i loro stili, i run e le loro proprietà, le tabelle e i riferimenti ai commenti. La gestione delle liste è incorporata nel convertitore invece di essere qualcosa che configuri con una regola, quindi la correzione per una lista rotta è una correzione al documento — applica un vero stile di lista — non una riga nella tua mappa. Questa distinzione ti fa risparmiare un pomeriggio.

La stessa catena spiega perché [tabelle e liste si comportano in modo così diverso in uscita](/blog/markdown-tables-that-survive-conversion): la struttura di una tabella è proprio lì in `document.xml` come elementi annidati, mentre la struttura di una lista è una chiave esterna.

## Le altre librerie, e i lavori diversi che fanno

### docx-preview — fedeltà invece di semantica

docx-preview, dal repository docxjs, è la scommessa opposta a mammoth. Il suo obiettivo è rendere un `.docx` in HTML che assomigli al documento, mantenendo l'HTML quanto più semantico possibile mentre accetta che la priorità sia l'aspetto. Il punto di ingresso principale è `renderAsync()`, che prende il documento come blob e un elemento di destinazione e si risolve quando il rendering è finito. `parseAsync()` e `renderDocument()` sono disponibili per le due metà separatamente.

Le sue opzioni sono l'indizio: `breakPages`, `ignoreWidth`, `ignoreHeight`, `renderHeaders`, `renderFooters`, `renderComments`, `useBase64URL`, `debug`. Sono le preoccupazioni di qualcosa che disegna una pagina — intestazioni, piè di pagina, interruzioni di pagina, dimensioni fisiche — di cui mammoth non ha alcuna opinione, perché un titolo non ha altezza.

| Pro | Contro |
| --- | --- |
| L'output assomiglia al documento, intestazioni e interruzioni di pagina incluse | Il markup è presentazionale; non è contenuto che conserveresti |
| Rende commenti, intestazioni e piè di pagina | Orientato al browser; non è un passaggio di conversione per Node |
| Opzioni per ignorare la geometria di pagina quando vuoi che si riadatti | La libreria avvisa che i suoi interni possono cambiare; solo `renderAsync` è trattata come stabile |
| Nessun andata e ritorno dal server per un'anteprima | Non è una strada verso il Markdown o verso HTML pulito |

**Prezzo:** gratis, licenza Apache-2.0.

**Per chi è.** Un visualizzatore. Se chi usa la tua app deve *vedere* il file Word prima di decidere qualcosa, questa è la libreria giusta. Se devi *conservare* quello che il file dice, è quella sbagliata — il markup è un rendering, non un documento.

### docx4js — un parser che guidi tu

docx4js analizza file Office — principalmente `.docx`, `.pptx` dalla versione 3.1.30, con `.xlsx` ancora limitato (entrambi annotati nel suo README, verificato su github.com/lalalic/docx4js, l'8 settembre 2026) — e lascia la traversata a te. Invece di costruire un albero completo in memoria, percorre il documento, riconosce i modelli XML di Office e chiama i tuoi visitor, il che mantiene basso l'uso di memoria sui file grandi. Il rendering avviene tramite una funzione `createElement` che fornisci tu, quindi il formato di output è del tutto una tua decisione.

I modelli che riconosce coprono una superficie ampia: sezioni, intestazioni, piè di pagina, paragrafi, tabelle, forme, immagini, hyperlink, controlli del contenuto incluse checkbox e menu a discesa, campi, equazioni, segnalibri e grafici.

| Pro | Contro |
| --- | --- |
| Riconosce costrutti che mammoth ignora — campi, equazioni, grafici, controlli di modulo | Scrivi tu lo strato di output; non è incluso alcun convertitore HTML |
| Visitor in stile streaming invece di un albero completo analizzato | Partenza più ardua di un `convertToHtml` su una riga |
| Legge anche `.pptx` | La documentazione è scarsa rispetto a quella di mammoth |
| Licenza MIT | Le serie 2.x e 3.x portano breaking change |

**Prezzo:** gratis, licenza MIT.

**Per chi è.** Chiunque non abbia bisogno di HTML come requisito. Estrarre il valore di ogni controllo del contenuto, tirare fuori i grafici da un centinaio di report, costruire un renderer personalizzato per un modello specifico — questi sono lavori da docx4js, e usare mammoth per farli significa combattere contro una libreria progettata per buttare via proprio quel materiale.

### docxtemplater — un lavoro completamente diverso

docxtemplater compare in ogni ricerca di librerie docx e non legge documenti nel senso che intendi tu. È un motore di template che **genera** `.docx`, `.pptx` e `.xlsx` prendendo un file Word che contiene segnaposto come `{first_name}` e sostituendoli con i tuoi dati. Il flusso è: leggi il file modello, caricalo in PizZip, costruisci un `Docxtemplater`, esegui `render()` con i tuoi dati, e scrivi il buffer in uscita.

La sua stessa documentazione dice esplicitamente che docxtemplater e PizZip vengono dallo stesso team, e che le funzionalità aggiuntive arrivano tramite moduli a pagamento — un modulo immagini per `{%image}`, un modulo HTML per inserire testo formattato in un `.docx`, più moduli per grafici, XLSX, stile, note a piè di pagina, tabelle, codici QR e localizzazione degli errori, fra altri.

| Pro | Contro |
| --- | --- |
| Lo strumento giusto per produrre file Word da dati e un modello progettato | Non converte un documento esistente in niente |
| Conserva esattamente lo stile del modello, perché il modello *è* un `.docx` | Il core è gratis; diverse funzionalità vivono dietro moduli a pagamento |
| Doppia licenza MIT o GPL-3.0 | Il modello deve essere creato apposta |
| Mantenuto da tempo, con l'autore che lo descrive come il suo lavoro principale | I segnaposto dentro Word possono essere divisi tra run, il che è una classe di bug a sé |

**Prezzo:** gratis, doppia licenza MIT o GPL versione 3. I moduli a pagamento hanno un prezzo separato deciso dal fornitore; controlla la loro pagina per le cifre attuali.

**Per chi è.** Contratti, fatture, certificati, lettere di offerta — tutto ciò in cui una persona ha progettato il layout in Word e un programma fornisce i valori. Nessuno che converta un documento in HTML ne ha bisogno, e un numero sorprendente di persone lo installa prima di rendersene conto.

Quella nota sulla divisione dei run non è una frecciata. È lo stesso fatto della prima sezione, visto dal lato della scrittura: `{first_name}` può essere memorizzato come `{first_` + `name}` su due run per via di una modifica fatta mesi fa, e ogni motore di template docx deve farci i conti.

### docx di dolanmiu — generazione, in modo dichiarativo

Il pacchetto npm chiamato letteralmente `docx` genera e modifica file `.docx` a partire da una API TypeScript dichiarativa — `Document`, `Paragraph`, `TextRun`, `Table`, intestazioni, piè di pagina, immagini — e funziona in Node e nel browser. Ha licenza MIT.

**Per chi è.** Codice che deve consegnare a chi lo usa un file Word. Si trova sul lato opposto della conversione rispetto a mammoth, e i due sono spesso usati nella stessa applicazione: mammoth in entrata, `docx` in uscita.

### python-docx — il modello a oggetti di riferimento

Se la tua pipeline è in Python, python-docx è il punto di partenza equivalente, ed è uno strumento di un genere davvero diverso: invece di convertire, ti dà un modello a oggetti da percorrere e modificare. `Document`, `Paragraph`, `Run`, `Table` con `Row`, `Column` e `Cell`, `Section`, `Font` e `ParagraphFormat`, più stili, commenti e forme. La sua documentazione ha sezioni dedicate a intestazioni e piè di pagina e ai commenti (verificato su python-docx.readthedocs.io, l'8 settembre 2026), e ha licenza MIT.

| Pro | Contro |
| --- | --- |
| Legge e scrive con un solo modello a oggetti | Nessun output HTML; scrivi tu il serializzatore |
| API documentata per stili, sezioni, intestazioni, piè di pagina e commenti | Le modifiche tracciate non fanno parte della API documentata |
| Naturale in una build Python o in una pipeline dati | Solo Python |
| Licenza MIT | Più codice di un convertitore per un lavoro di conversione |

**Per chi è.** Estrazione e trasformazione più che conversione — tirare fuori ogni tabella da un insieme di report dentro un dataframe, riscrivere una clausola in duecento contratti, verificare quali documenti usano uno stile deprecato. Quando il requisito è “docx to HTML” e il linguaggio è Python, chiamare Pandoc da una shell è di solito meno codice che costruire un serializzatore sopra a questo.

### Pandoc come sottoprocesso — la scorciatoia pragmatica

L'opzione che le persone si scordano: non analizzare affatto il documento. Esegui Pandoc e leggi il suo output.

```js
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

const run = promisify(execFile);

const { stdout } = await run("pandoc", [
  "-f", "docx",
  "-t", "html",
  "--extract-media=./media",
  "--track-changes=all",
  "--sandbox",
  "quarterly.docx",
]);
```

Il lettore `.docx` di Pandoc gestisce note a piè di pagina, tabelle, modifiche tracciate e molto altro che una libreria JavaScript non gestisce, e `--extract-media` scrive le immagini per te. `--track-changes` è il flag la cui assenza causa più confusione: un documento revisionato ha inserimenti ed eliminazioni al suo interno, e dovresti scegliere deliberatamente se vuoi che siano accettati, rifiutati o annotati invece di prendere qualunque sia il default. `--sandbox` limita l'accesso al filesystem quando il documento non è tuo.

| Pro | Contro |
| --- | --- |
| Gestisce note a piè di pagina, modifiche tracciate e costrutti che nessuna libreria JS raggiunge | Un binario esterno su ogni macchina che esegue il tuo codice |
| Un solo comando, nessun parser da mantenere | Impossibile nel browser, e scomodo nella maggior parte dei runtime serverless |
| Converte anche verso decine di altri formati dalla stessa chiamata | Nessun equivalente di `messages`: non ti dice cosa ha normalizzato |
| Licenza GPL e vita lunga | L'HTML ha il sapore di Pandoc; farai comunque post-processing |

**Per chi è.** Lavoro batch lato server dove controlli l'ambiente. È la risposta giusta molto più spesso di quanto suggerisca la fedeltà a una libreria, e la risposta sbagliata nel momento in cui il codice deve girare in un browser o in un container che non hai costruito tu.

LibreOffice headless merita la stessa nota: `soffice --headless --convert-to html` legge file che nessun altro legge, incluso il vecchio `.doc` binario, ed è utile anche solo come preprocessore — convertire prima il file strano in un `.docx` pulito, e poi passarlo a mammoth.

## Dove mammoth è la risposta sbagliata, e cosa costa

La raccomandazione in testa a questo articolo ha limiti reali, e vale la pena dichiararli con chiarezza perché sono quelli che producono lamentele dopo la distribuzione.

**La formattazione diretta se ne va, ed è voluto.** Un documento dove l'autore non ha mai usato gli stili — tutto è Normal, con grassetto e 18pt applicati a mano — si converte in un muro di elementi `p`. mammoth si comporta correttamente: in quel file non c'è informazione semantica da usare. Il costo è che la correzione non è nel tuo codice. Qualcuno deve applicare stili reali al documento, oppure devi scrivere regole di style map contro le proprietà dei run e accettare le congetture. Metti in conto quella conversazione.

**Il layout non esiste nell'output.** Nessuna dimensione di pagina, nessun margine, nessuna colonna, nessuna intestazione, nessun piè di pagina, nessuna interruzione di pagina. Se il requisito coinvolge la parola “stampa”, mammoth non è lo strumento; lo sono docx-preview o una strada verso il PDF.

**Caselle di testo, forme e SmartArt arrivano in modo irregolare.** Il contenuto in una casella di testo fluttuante non è nel flusso del documento, e qualsiasi convertitore HTML deve decidere dove metterlo. Controlla un documento che le usa prima di promettere qualcosa.

**I campi sono valori, non formule.** Un campo numero di pagina, un riferimento incrociato, un campo indice, un campo calcolato — sono tutte istruzioni nel file, più un ultimo risultato noto messo in cache. L'HTML non ha campi. Quello che ottieni è nel migliore dei casi il testo in cache, e un indice si converte in una lista di link solo se il documento è stato costruito bene abbastanza da far esistere le ancore.

**Lo scrittore Markdown è deprecato.** mammoth ha un `convertToMarkdown` e la sua documentazione dice chiaramente che “Markdown support is deprecated”, raccomandando invece HTML più una libreria separata da HTML a Markdown, probabilmente capace di risultati migliori. Segui il consiglio. Converti in HTML, poi esegui un convertitore dedicato — la scelta tra [le librerie da HTML a Markdown](/blog/best-html-to-markdown-converters) conta più di quanto sembri, perché è lì che decidi cosa succede al markup che il Markdown non può esprimere.

**I file molto grandi sono una questione di memoria, specialmente nel browser.** Viene letto l'intero archivio, immagini comprese. Un documento da 30 MB con screenshot ad alta risoluzione si gonfia ancora di più come base64 nell'output, e una scheda del browser ha meno margine di un server. Questo è il motivo per cui i convertitori ospitati impongono un tetto alla dimensione di upload; TransformPipe pone un tetto di 10 MB per una conversione e di 4 MB per un documento salvato, quest'ultimo perché una Vercel Function rifiuta un corpo di richiesta o risposta oltre 4,5 MB. Qualunque cosa costruisci avrà bisogno anche lei di un limite, e scegliersene uno di proposito è meglio che scoprirlo per caso.

**Un documento solo non è un problema da libreria.** Se a qualcuno serve oggi un singolo `.docx` trasformato in HTML o Markdown, installare un parser e scrivere una style map è la strada costosa. [I convertitori che esistono già](/blog/best-word-to-markdown-converters) lo fanno in una scheda del browser. Prendi in mano una libreria quando la conversione è una funzionalità, non una commissione.

## Come scegliere una libreria docx

1. **Decidi se vuoi il significato o l'aspetto, prima di confrontare qualsiasi cosa.** Volerli entrambi è l'errore più costoso in questo campo, perché ti spinge verso un renderer di fedeltà per conservare contenuto, e il markup presentazionale che ottieni resterà nel tuo database per anni.
2. **Controlla dove gira il codice.** Un browser esclude ogni sottoprocesso e ti lascia con mammoth o docx-preview; un server controllato rende Pandoc un concorrente serio che costa quasi nessun codice.
3. **Guarda dieci documenti reali prima di scrivere la style map, e conta gli stili.** Se gli autori hanno usato veri stili con nome, mammoth produrrà un buon HTML al primo tentativo; se hanno formattato a mano, nessuna libreria ci riuscirà, e saperlo presto trasforma un problema di codice in un problema di modello.
4. **Conferma che la libreria legge invece di scrivere.** docxtemplater e `docx` sono entrambe eccellenti e nessuna delle due converte il tuo file, quindi leggere il primo paragrafo di un README ti risparmia un pomeriggio di confusione.
5. **Collega gli avvisi dal primo giorno.** Con mammoth è l'array `messages`; con qualsiasi altra cosa sono i controlli che scrivi tu sull'output, perché il silenzio di un convertitore non è la prova che qualcosa abbia funzionato.
6. **Testa un documento con una lista numerata, uno con immagini, e uno passato per una revisione.** Questi tre coprono le tre catene che si rompono — `numbering.xml`, la parte delle relazioni, e i segni di revisione — e se tutti e tre escono giusti, lo faranno anche i documenti ordinari.

## Conclusione

In JavaScript, leggere un `.docx` e ottenere HTML usabile significa mammoth, e usarlo bene significa accettare il suo patto: ottieni markup semantico pulito perché mappa gli stili con nome e scarta la presentazione, quindi la qualità del tuo output è fissata dalla qualità degli stili del documento e dalla style map che scrivi contro di loro. Leggi `messages` e la libreria ti dirà esattamente dove quella mappa è insufficiente. Scegli `convertImage` di proposito invece di spedire una pagina piena di base64. Se il lavoro è vedere un documento invece di conservare quello che dice, usa docx-preview; se è estrarre campi o grafici, usa docx4js; se è produrre un file Word, usa `docx` o docxtemplater; e se il codice gira su un server che controlli, Pandoc come sottoprocesso è meno lavoro di tutti loro. Per un singolo file, non serve affatto una libreria — [buttarlo dentro un convertitore da browser](/word-to-markdown) richiede circa dieci secondi e non carica nulla.

## FAQ

### Come convertire un .docx in HTML in JavaScript?

Usa mammoth: `mammoth.convertToHtml({path: "file.docx"})` in Node, oppure `mammoth.convertToHtml({arrayBuffer: buffer})` nel browser con la build `mammoth.browser.js`. Il risultato ha una proprietà `value` che contiene l'HTML e un array `messages` che elenca cosa non è stato possibile mappare. Aggiungi una `styleMap` per ogni stile Word personalizzato che i tuoi documenti usano.

### Perché nell'output di mammoth manca la mia formattazione?

Perché è voluto. mammoth mappa l'informazione semantica — gli stili con nome — in elementi HTML e scarta la formattazione diretta come colore, dimensione del font e allineamento. Se gli autori del documento hanno applicato grassetto e 18pt a mano invece di usare uno stile Heading, non c'è niente che mammoth possa mappare, e la correzione è dare uno stile corretto al documento oppure scrivere regole di style map contro le proprietà dei run.

### Perché le mie liste numerate si sono convertite in paragrafi semplici?

Quasi sempre perché la lista non è mai stata una lista reale. Word memorizza l'appartenenza a una lista come un `w:numId` che si risolve tramite `numbering.xml`, quindi se quella parte manca, l'id non si risolve, oppure l'autore ha digitato “1.” e “2.” a mano, il convertitore vede paragrafi ordinari. Applica un vero stile di lista in Word e converti di nuovo.

### Posso leggere un .docx nel browser senza caricarlo?

Sì. `mammoth.browser.js` legge l'`arrayBuffer()` di un oggetto `File` e converte interamente nella pagina, quindi non viene inviato niente a un server. È così che funzionano i convertitori Word basati sul browser, e puoi confermarlo su qualsiasi di essi guardando la scheda rete mentre un file si converte.

### Dovrei usare il convertToMarkdown di mammoth?

No. La sua stessa documentazione segna il supporto Markdown come deprecato e raccomanda invece di generare HTML e passarlo a una libreria dedicata da HTML a Markdown. L'HTML ha un elemento per la maggior parte delle cose che un `.docx` contiene, e il Markdown no, quindi la strada in due passaggi dà alla seconda libreria più materiale su cui lavorare.

### Qual è la differenza tra mammoth e docx-preview?

Ottimizzano per cose opposte. mammoth produce HTML semantico pulito dagli stili con nome e ignora l'aspetto; docx-preview rende il documento in modo che assomigli alla pagina stampata, con opzioni per interruzioni di pagina, intestazioni e piè di pagina. Usa mammoth quando vuoi contenuto da conservare, e docx-preview quando chi usa l'app deve guardare il file.

### Posso semplicemente decomprimere il .docx e analizzare l'XML da solo?

Puoi, e la decompressione è facile. La parte difficile è che il significato è memorizzato per riferimento: gli stili in `styles.xml`, le liste in `numbering.xml`, le immagini e i link nella parte delle relazioni, e il testo diviso arbitrariamente tra i run così che una singola parola può essere tre elementi. Quella risoluzione dei riferimenti è la maggior parte di cosa è una libreria, e reimplementarla è un progetto, non un compito.
