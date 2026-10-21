---
title: "Come salvare una pagina web come Markdown che possiedi davvero"
description: "Quattro modi per salvare una pagina web come Markdown — modalità lettura, HTML salvato, clipper e riga di comando — cosa conserva ognuno e cosa succede alle immagini"
updated: 2026-10-21
date: 2026-09-05
tag: Conversione
keywords: pagina web in markdown, salvare una pagina web come markdown, da url a markdown, convertire pagina web in markdown, salvare un articolo come markdown, web clipper markdown, readability markdown, scaricare pagina web come testo
---

Una pagina che vuoi tenere è una pagina che qualcun altro può cambiare. L'articolo letto lo scorso marzo ora sta dietro un muro di registrazione, oppure il sito è stato ridisegnato e l'URL è un 404, oppure il paragrafo che ricordi è stato modificato in silenzio e non c'è modo di saperlo. Un segnalibro è una promessa fatta da uno sconosciuto. Il Markdown sul tuo disco è un file.

La conversione in sé è la parte facile. Ogni strada qui sotto finisce con l'HTML che diventa Markdown, e quel passaggio è ben risolto da una mezza dozzina di strumenti. Quello che separa le strade è tutto il resto: quale parte della pagina finisci per avere, se le immagini seguono, se il file si apre ancora fra cinque anni, e quanto del tuo pomeriggio costa per un articolo.

### In breve

Per un articolo che stai leggendo proprio ora, attiva la modalità lettura del browser, salva o copia la pagina ripulita, e converti quella — la modalità lettura è un passaggio di estrazione che ottieni gratis, e rimuove la navigazione, il riquadro della newsletter e la fascia di articoli correlati prima che qualunque convertitore li veda. Per una pagina che vuoi per intero, salvala prima come HTML e converti il file, perché un file salvato può essere riconvertito quando cambi idea e un copia-incolla no. Per qualunque cosa di routine, un'estensione clipper mette il Markdown direttamente nelle tue note con un clic e nasconde entrambi i passaggi. E qualunque strada tu prenda, decidi deliberatamente sulle immagini: un file Markdown che punta agli URL delle immagini di qualcun altro è un file che sbiadirà lentamente.

## Le strade, a confronto

Ogni riga è uno scambio diverso fra sforzo e fedeltà. Nessuna è sbagliata; falliscono in punti diversi.

| Strada | Ideale per | Cosa conserva | Cosa costa | Prezzo |
| --- | --- | --- | --- | --- |
| Modalità lettura, poi converti | Un articolo, letto adesso, tenuto come prosa | Titoli, paragrafi, link nel corpo, di solito le tabelle | Qualunque cosa l'estrattore abbia giudicato arredamento, comprese figure vere | Gratis |
| Salva come HTML, poi converti il file | Una pagina che vuoi per intero, o vuoi due volte | Tutto quello che la pagina conteneva, arredamento incluso | L'arredamento lo togli tu | Gratis |
| Convertitore lato browser | Un file convertito senza caricarlo | Tabelle, liste di attività, codice, titoli | Un documento alla volta | Gratis |
| Estensione MarkDownload | Ritagliare la pagina che hai davanti | Articolo estratto, più front matter con l'URL | Un'estensione con il permesso di leggere le pagine | Gratis, Apache 2.0 |
| Obsidian Web Clipper | Markdown che finisce in un vault | Estrazione, template, proprietà della pagina | Legato alla cartella di Obsidian | Gratis, MIT |
| Notion Web Clipper | Leggere più tardi dentro Notion | La pagina come blocchi Notion | Non è Markdown — serve un secondo export per arrivarci | Gratis |
| SingleFile | Conservare la pagina come appariva | Immagini, CSS e font incorporati in un file HTML solo | Un file grande, e la conversione resta da fare | Gratis, open source |
| monolith | Archiviare pagine da uno script | Asset incorporati come data URI, nessuna cartella | Un'installazione Rust; nessuna estrazione dell'articolo | Gratis, open source |
| Pandoc | Conversione dentro una build o uno script | Struttura, e immagini via `--extract-media` | Nessuna estrazione: dagli HTML pulito o ottieni il menu | Gratis, GPL |
| Turndown | Uno strumento o un'estensione che stai scrivendo | Esattamente le regole che definisci | Fornisci tu il DOM, l'estrazione e il wrapper | Gratis, MIT |
| Mozilla Readability | Trovare l'articolo dentro una pagina | Titolo, autore, HTML dell'articolo ripulito | Restituisce HTML, non Markdown | Gratis, Apache 2.0 |
| `wget` / `curl` | Molte pagine, nessun accesso, da un terminale | I byte come li ha mandati il server | Nessuna estrazione, e un dovere di educazione a riguardo | Gratis |
| Un archivio web pubblico | Provare cosa diceva la pagina | Un'istantanea citabile e datata | Non è un file tuo, e non è Markdown | Gratis |
| Stampa in PDF | Un layout che non deve muoversi | La pagina come immagine di se stessa | Il testo strutturato è sparito; riconvertire è un lavoro nuovo | Gratis |

## Prima strada: salva l'HTML, poi converti il file

Questa è la strada che vale la pena imparare per prima, perché separa la cattura dalla conversione. Una volta che l'HTML è su disco puoi convertirlo in quattro modi diversi, confrontare i risultati, e rifare tutto l'anno prossimo con uno strumento migliore. Copia-incolla ti dà un solo tentativo.

| Pro | Contro |
| --- | --- |
| La cattura è permanente e riconvertibile | Due passaggi invece di uno |
| Funziona su qualunque pagina, comprese quelle che nessun estrattore gestisce bene | Ottieni la navigazione e il piè di pagina insieme all'articolo |
| Il file salvato è una prova: è quello che diceva la pagina quel giorno | I formati che offrono i browser non sono tutti ugualmente utili |
| Niente va caricato per convertirlo dopo | Gli asset finiscono in una cartella vicina facile da perdere |

**Per chi è.** Per chiunque conservi una pagina come riferimento invece che per leggerla — documentazione che potrebbe sparire, una specifica, un thread di supporto che dovrai citare, la pagina prezzi di un concorrente nel giorno in cui l'hai guardata.

### Il formato nella finestra di salvataggio decide cosa ottieni

Premere la scorciatoia di salvataggio non è un'unica azione. Il menu a tendina nella finestra offre formati che si comportano in modo molto diverso, e scegliere quello sbagliato è il motivo più comune per cui una conversione non produce niente di utile.

| Formato | Dove si trova | Cosa finisce su disco | Si converte bene? |
| --- | --- | --- | --- |
| Pagina web, completa | Chrome, Edge, Firefox ("Pagina web, completa") | Un file `.html` più una cartella `_files` di immagini, CSS e script | Sì, e le immagini sono già locali |
| Pagina web, solo HTML | Chrome, Edge, Firefox ("Pagina web, solo HTML") | Un file `.html` solo, gli asset restano remoti | Sì, anche se le immagini restano URL remoti |
| Pagina web, file singolo | Chrome, Edge | Un file `.mhtml` solo: un archivio MIME multipart della pagina e delle sue parti | Raramente — la maggior parte dei convertitori Markdown non legge MHTML |
| Web Archive | Safari | Un file `.webarchive` solo, una property list binaria | No: è il formato di Apple, non HTML |
| Codice sorgente della pagina | Safari | L'HTML che ha mandato il server | Sì, ma vedi la nota su JavaScript sotto |
| File di testo | Firefox | La pagina come testo semplice | Nessuna struttura sopravvive, quindi non c'è niente da convertire |

MHTML merita un avvertimento a parte, perché "File singolo" suona esattamente come quello che volevi. È un contenitore MIME — lo stesso formato busta di un'email con allegati, standardizzato nell'RFC 2557 — con l'HTML e ogni asset come parti codificate in base64. I browser lo aprono. I convertitori Markdown di solito no, e il file non dà nessun indizio di essere il problema: ottieni un errore, oppure un'unica riga enorme di base64.

### Quando la pagina è costruita da JavaScript, salva il DOM renderizzato

Moltissime pagine mandano un documento quasi vuoto e lo riempiono con uno script. Salva il sorgente di una di queste e hai salvato un'animazione di caricamento. La risposta affidabile è prendere il DOM che il browser ha davvero costruito: apri gli strumenti per sviluppatori, trova l'elemento `<html>` in cima al pannello elementi, fai clic destro e scegli Copia, poi Copia outerHTML. Incolla quello in un file con estensione `.html` e converti quello invece. È la pagina renderizzata, tabelle comprese, nello stato in cui la stavi guardando.

Lo stesso trucco restringe il lavoro. Invece dell'elemento `<html>`, copia l'outerHTML dell'`<article>` o del contenitore principale del contenuto. Hai così fatto l'estrazione a mano, con precisione, in circa quattro secondi, e il convertitore non ha più niente da indovinare.

### Lo stesso lavoro in uno script

Per più di una pagina, il terminale è più corto. `curl -sL <url> -o page.html` recupera il documento e segue i reindirizzamenti. `wget --page-requisites --convert-links <url>` recupera la pagina più le immagini e i fogli di stile che richiama e riscrive i riferimenti perché puntino alle copie locali, che è la cosa più vicina a "Pagina web, completa" da un terminale.

Pandoc legge HTML e scrive Markdown direttamente, e accetta un URL come input oltre a un file, quindi `pandoc -f html -t gfm <url> -o page.md` è un comando solo per una pagina semplice. Non fa nessuna estrazione — otterrai il menu, il piè di pagina e ogni link nella barra laterale — quindi appartiene alla fine di una pipeline dove qualcos'altro ha già trovato l'articolo. La sua opzione `--extract-media` è la parte utile per conservare una pagina: scrive le immagini in una directory e riscrive i link nel Markdown perché corrispondano, il che trasforma un file pieno di URL remoti in una cartella autonoma.

Se quello che vuoi è la pagina invece del suo testo, `monolith` è un piccolo strumento a riga di comando in Rust che impacchetta una pagina e i suoi asset in un unico file HTML con tutto incorporato come data URI. Non c'è nessun server e nessuna cartella da perdere. È gratis e open source. Convertilo più avanti se vuoi Markdown; tienilo comunque nel caso la pagina sparisca.

## Seconda strada: modalità lettura ed estrazione in stile Readability

La modalità lettura è lo strumento di conversione più sottoutilizzato del browser, perché nessuno la pensa come tale. Quello che fa è esattamente la metà difficile del lavoro: guarda il documento, capisce quale blocco sia l'articolo, e butta via il resto. La Reader View di Firefox è costruita sulla libreria Readability di Mozilla. Safari ha Reader, Chrome ha una modalità di lettura nel suo pannello laterale, ed Edge ha Immersive Reader. Non sono identiche, ma stanno tutte facendo lo stesso tipo di punteggio — quanto testo c'è in questo elemento, quanti link, quanto è annidato, quali nomi di classe porta.

Attivala, poi salva o copia dalla vista ripulita. Poiché la vista lettura è a sua volta un documento vero nel browser, il trucco degli strumenti per sviluppatori sopra funziona anche su di essa: copia l'outerHTML del contenitore della vista lettura e hai l'articolo senza nessun arredamento del tutto. Convertilo e il Markdown parte dal titolo.

| Pro | Contro |
| --- | --- |
| L'estrazione è fatta, gratis, da software che ha visto milioni di pagine | Decide cosa sia una "figura", e a volte sbaglia |
| Funziona sulla pagina che stai già leggendo, senza installare niente | Fallisce sulle pagine che non sono articoli: dashboard, documentazione con barre laterali, forum |
| Rimuove pixel di tracciamento, spazi pubblicitari e riquadri newsletter come effetto collaterale | Citazioni evidenziate, didascalie e note inline vengono spesso scartate |
| Dà titolo e autore come campi separati e puliti | Nessun controllo sulle regole a meno di far girare tu stesso la libreria |

**Per chi è.** Per i lettori che conservano articoli: giornalismo, saggi, post di blog, qualunque cosa con una colonna di prosa e un titolo. È lo strumento sbagliato per la documentazione di riferimento, dove la navigazione laterale e le tabelle a margine sono metà del valore.

Far girare la libreria direttamente vale la pena saperlo se lo fai con un certo volume. Readability di Mozilla è JavaScript, licenza Apache 2.0, e prende un documento DOM; `new Readability(document).parse()` restituisce un oggetto con il titolo, l'autore, un estratto, il nome del sito e l'articolo ripulito come HTML. Si ferma lì — l'estrazione è tutto il suo ambito, e trasformare quell'HTML in Markdown è il lavoro dello strumento successivo. Postlight Parser fa lo stesso tipo di estrazione e può emettere Markdown lui stesso. Il confronto fra questi e le librerie semplici è [esposto strumento per strumento altrove](/blog/best-html-to-markdown-converters); il punto qui è l'ordine delle operazioni. Estrai, poi converti. Farlo al contrario produce un rendering Markdown ordinato di un menu di navigazione.

## Terza strada: estensioni clipper, e cosa rovina ciascuna

Un clipper è estrazione e conversione unite dietro un pulsante solo della barra degli strumenti, e per la conservazione quotidiana quella è la forma giusta. Il costo è un'estensione del browser con il permesso di leggere le pagine che visiti, e un'opinione — incorporata da qualcun altro — su cosa valga la pena conservare di una pagina.

| Clipper | Cosa produce | Dove va | Cosa tende a rovinare |
| --- | --- | --- | --- |
| MarkDownload | Un file `.md`, opzionalmente con front matter YAML che porta URL e titolo | La tua cartella download, o gli appunti | Qualunque cosa l'estrattore abbia scartato; le immagini restano link remoti a meno di chiedere altrimenti |
| Obsidian Web Clipper | Markdown più proprietà della pagina, plasmate da un template che scrivi tu | Direttamente in una cartella del vault | Evidenziazioni e callout sono convenzioni proprie di Obsidian, quindi viaggiano male verso altri strumenti |
| Notion Web Clipper | Blocchi Notion, non Markdown | Un database o una pagina Notion | Tutto ciò per cui Notion non ha un blocco; riottenere Markdown richiede un secondo export |
| Estensione TransformPipe | Markdown dell'articolo estratto, oppure la pagina come un unico file `.html` autonomo | Gli appunti, la tua cartella download, o un account se accedi | Qualunque cosa l'estrattore abbia scartato; le immagini nel Markdown restano link remoti, riscritti come indirizzi assoluti |
| Un'estensione generica "salva come Markdown" | Varia moltissimo | Download | Sconosciuto, che è il problema: non puoi verificare quello che non puoi leggere |

MarkDownload è il cavallo da tiro onesto: fa girare Readability sulla pagina e poi Turndown sul risultato, che è la stessa pipeline a due stadi descritta sopra, già collegata per te. È gratis e open source sotto licenza Apache 2.0, il che significa che la pipeline è ispezionabile — puoi leggere esattamente quali regole hanno prodotto il file che hai ottenuto.

Il Web Clipper di Obsidian è quello da usare se la destinazione è un vault, perché scrive la nota dove il vault se l'aspetta, con le proprietà su cui contano i tuoi template. È gratis e con licenza MIT. Due cose da tenere a mente. Primo, i suoi template sono una funzione vera e vale la pena configurarli una volta: una nota ritagliata con l'URL sorgente, l'autore e la data di recupero nelle sue proprietà è una nota che puoi ancora citare fra due anni. Secondo, il dialetto di Obsidian ha estensioni proprie — wikilink, callout, embed — e una nota piena di queste non è una nota che un altro strumento renderizzerà. [Cosa fa ognuna di queste applicazioni al Markdown in uscita](/blog/markdown-from-notion-obsidian-and-confluence) è una storia più lunga, e si applica alle pagine ritagliate tanto quanto a quelle scritte.

Il clipper di Notion è l'eccezione e quello che coglie di sorpresa. Non salva Markdown. Salva la pagina in Notion come blocchi Notion, il che è genuinamente utile se Notion è dove leggi le cose, e un vicolo cieco se volevi un file. Per ottenere Markdown esporti la pagina da Notion in seguito, il che produce uno zip con id esadecimali aggiunti a ogni nome di file e i database come file CSV separati. Sono due conversioni con perdita dove ne avevi chiesta una.

Il convertitore descritto più sotto esiste anche come [estensione del browser](/extension), ed è la stessa pipeline a due stadi: Readability trova l'articolo nella pagina in cui sei, il convertitore da HTML a Markdown del sito scrive il Markdown, e ogni indirizzo di link e di immagine viene riscritto come assoluto, così il file punta ancora a qualcosa quando esce dalla scheda — le immagini restano link al sito originale, non copie. Può anche salvare la pagina come un unico file `.html` con fogli di stile, immagini e font incorporati come URI data, e il suo menu contestuale converte una selezione invece dell'intera pagina. All'installazione non chiede alcun permesso sugli host, legge una pagina solo quando premi il suo pulsante o apri su di essa il suo pannello laterale, e da disconnesso non parla mai con i server del sito; si installa in Chrome e nei browser basati su Chromium, e in Firefox su desktop e su Android.

**Per chi sono i clipper.** Per chi ritaglia pagine ogni giorno e vuole che la decisione sia già presa. Se ritagli due volte all'anno, il permesso dell'estensione non vale la pena e la strada in due passi va bene.

### L'opzione lato browser, se preferisci non installare niente

Fra "incolla in un sito web" e "installa un'estensione" c'è una terza posizione: un convertitore che gira nella scheda del browser ma non fa parte del browser. Trascina il file `.html` salvato sulla pagina, oppure incolla l'HTML che hai copiato dagli strumenti per sviluppatori, e la conversione avviene sulla tua stessa macchina. Da disconnesso, [la conversione da HTML a Markdown](/html-to-markdown) di TransformPipe non carica proprio niente — il file viene letto, analizzato e convertito in locale, cosa che puoi verificare aprendo la scheda di rete e guardando che non succede niente. La conversione è limitata a 10 MB, e un documento che scegli di tenere in un account è limitato a 4 MB, perché la funzione che lo salva rifiuta un corpo di richiesta più grande.

| Pro | Contro |
| --- | --- |
| Niente da installare, nessun permesso di estensione, niente caricato da disconnesso | Devi comunque catturare tu stesso l'HTML |
| Mantiene tabelle GFM, liste di attività, codice tra fence e titoli | Un documento alla volta, non una scansione |
| Converte anche nella direzione opposta, e da Word, CSV e JSON | Il lavoro lo fa il browser, quindi una pagina enorme dipende dalla macchina |

**Per chi è.** Per chi ha una pagina salvata e una conversione da fare, su una macchina dove installare cose è o lento o non permesso.

## Le immagini: scaricale, oppure accetta il degrado

Questa è la parte che ogni guida salta, ed è la parte che decide se il tuo archivio varrà qualcosa fra tre anni.

Markdown ha una sola sintassi per le immagini e contiene una posizione: `![alt](url)`. Converti una pagina web e quell'URL è quello che la pagina usava — di solito un indirizzo assoluto sull'origine o su un CDN. Il Markdown è corretto nel momento in cui lo crei e non è una copia di niente. È una copia del testo e un puntatore alle immagini di qualcun altro, e i puntatori si degradano in almeno cinque modi:

- Il sito viene ridisegnato e i percorsi dei media cambiano.
- Il CDN viene sostituito, il bucket viene rinominato, o il vecchio prefisso smette di risolvere.
- L'URL portava una query string firmata con una scadenza, e la firma ora è vecchia.
- La protezione anti-hotlink comincia a rifiutare le richieste che non vengono dalle pagine del sito stesso.
- Il sito sparisce del tutto, il che di solito è il motivo per cui avevi salvato la pagina.

Ci sono tre scelte oneste e non una quarta.

| Scelta | Cosa ottieni | Cosa si rompe | Sforzo |
| --- | --- | --- | --- |
| Lascia gli URL remoti | Un file di testo piccolo, immagini finché durano | Ognuno dei fallimenti sopra, in silenzio e uno alla volta | Nessuno |
| Scarica le immagini accanto al file | Una cartella che è davvero una copia | I percorsi relativi si rompono se il file si sposta senza la cartella | Un flag, o un'impostazione del clipper |
| Incorpora le immagini come data URI | Un file solo che non ha bisogno di rete affatto | Un file molto più grande, e alcuni strumenti rifiutano URI molto lunghi | Un passaggio di conversione |

Scaricare è quello che la maggior parte delle persone dovrebbe fare, e gli strumenti per farlo esistono: `--extract-media` di Pandoc scrive i media e riscrive i link, `wget --page-requisites --convert-links` fa l'equivalente al momento della cattura, e sia SingleFile che monolith incorporano tutto nell'HTML prima ancora che la conversione venga considerata. Il problema con una cartella è che un file Markdown e la sua directory `images/` sono ora un'unità sola, e il legame fra loro è un percorso relativo — che è esattamente [l'assunzione che si rompe la prima volta che qualcuno sposta il file](/blog/images-and-links-that-still-work) e non la cartella.

Due problemi più piccoli con le immagini vale la pena conoscerli prima di dare la colpa al convertitore. Il caricamento lazy fa sì che l'indirizzo reale dell'immagine spesso viva in un attributo `data-src` o `srcset` mentre `src` contiene un segnaposto, quindi un convertitore che lavora sull'HTML sorgente cattura il segnaposto — un quadrato grigio o un GIF trasparente da un pixel. Copiare il DOM renderizzato dopo aver scorso la pagina di solito lo risolve, perché a quel punto il browser ha già sostituito l'indirizzo reale. E `<figure>` con un `<figcaption>` non ha equivalente Markdown, quindi la didascalia arriva come un paragrafo staccato sotto l'immagine, indistinguibile dal testo del corpo.

## Dove salvare una pagina come Markdown fallisce

La risposta onesta è che Markdown è un formato con perdita per il web, e per alcune pagine la perdita è l'intero punto della pagina.

**Applicazioni che fingono di essere documenti.** Una dashboard, una mappa, una calcolatrice, una tabella ordinabile con filtri — non c'è niente da salvare. Quello che puoi conservare è uno screenshot o un PDF, che preserva l'immagine e abbandona il testo.

**Qualunque cosa abbia bisogno della rete per esistere.** Video incorporati, tweet, frame CodePen, thread di commenti caricati scorrendo, grafici interattivi disegnati da un feed JSON. Un convertitore trasforma un `<iframe>` in niente, o in un link a un URL che potrebbe non sopravvivere alla pagina.

**Scorrimento infinito e paginazione.** Ottieni quello che era caricato quando hai catturato. Un thread con duecento risposte ti dà le prime venti, e niente nel file lo dice.

**Contenuto dietro un accesso.** Un clipper funziona perché il browser è già autenticato; `curl` no, e recupererà invece la pagina di accesso e la convertirà perfettamente.

**HTML strutturale senza equivalente Markdown.** Tabelle con `rowspan` o `colspan`, elenchi di definizione, tabelle annidate, note a margine, blocchi `<details>`, matematica renderizzata da KaTeX o MathJax, codice con evidenziazione della sintassi dove il linguaggio vive in un nome di classe che il convertitore non legge. Alcuni convertitori emettono HTML grezzo per questi casi, il che conserva l'informazione al costo della portabilità; altri approssimano; altri li scartano. Le tabelle sono la vittima più comune e più visibile, e [cosa fa sopravvivere una tabella al viaggio](/blog/markdown-tables-that-survive-conversion) vale la pena leggerlo se le tue pagine sono documentazione.

**La questione della sicurezza, se il file va da qualche parte.** Markdown permette HTML grezzo, e l'HTML convertito da una pagina web può portare HTML grezzo attraverso — inclusi `<script>`, gestori `onerror=` e URL `javascript:` dalla pagina che hai salvato. Questo è inerte in un editor di testo e vivo nel momento in cui lo riconverti in HTML e lo apri in un browser. Se una pagina salvata diventerà di nuovo una pagina, [sanificare è il passaggio che non si può saltare](/blog/sanitising-markdown-safely).

**E il costo che nessuno dichiara.** Una copia Markdown è un'istantanea con il layout, lo stile e l'identità della fonte tolti. È più piccola, ricercabile, grep-abile, confrontabile con un diff e tua. Non è più però una prova di niente, perché avresti potuto scriverla tu. Se devi dimostrare cosa diceva la pagina, tieni l'HTML — o l'istantanea d'archivio — oltre al Markdown, e registra l'URL e la data in cui l'hai recuperata nel front matter del file. Quell'abitudine costa una riga e risolve le discussioni.

## La tua lettura, non la ripubblicazione

Salvare una pagina per te stesso e pubblicare quello che hai salvato sono atti diversi, e il secondo non è coperto dal primo.

Il testo e le immagini di una pagina web sono il lavoro di qualcuno, e il copyright si applica che ci sia o no un avviso. Tenere una copia personale per leggere, annotare, cercare e citare è uso ordinario, e le eccezioni che la maggior parte delle giurisdizioni prevede — fair dealing per la ricerca non commerciale e lo studio privato nel Regno Unito, fair use negli Stati Uniti — esistono più o meno per questo. Prendere il Markdown che hai prodotto e pubblicarlo sul tuo sito, farlo confluire in un prodotto, o farlo circolare come documento con il tuo nome in cima è una domanda diversa, e la risposta dipende da quanto hai preso, cosa ne hai fatto, e se ci fai pagare. Niente di tutto questo è consulenza legale; la versione pratica è sotto.

| Cosa stai facendo | Come si legge di solito | Cosa fare |
| --- | --- | --- |
| Tenere un articolo per leggerlo offline | Uso personale | Niente. Registra l'URL e la data |
| Citare un paragrafo con attribuzione | Citazione ordinaria | Collega all'originale, nomina l'autore |
| Ripubblicare l'intero articolo sul tuo sito | Ripubblicazione | Chiedi, oppure collega invece di copiare |
| Costruire un corpus ricercabile per un team | Dipende interamente da scala e licenza | Controlla i termini; chiedi il permesso per iscritto |
| Alimentare un prodotto commerciale con pagine | Non è uso personale in nessuna lettura | Chiedi consiglio prima, non dopo |

Poi c'è la metà dell'educazione, che è tecnica e non facoltativa. `robots.txt` è una richiesta e non una licenza, e uno script che recupera mille pagine è un crawler comunque tu lo pensi. Recupera lentamente, una pagina alla volta, con una pausa fra le richieste. Manda uno User-Agent che dica chi sei e come raggiungerti. Rispetta un `429` e qualunque header `Retry-After` lo accompagni invece di riprovare subito. Metti in cache quello che hai già recuperato così che una riesecuzione non colpisca di nuovo il sito. E leggi i termini di servizio prima di automatizzare qualunque cosa contro un sito che non possiedi, in particolare dove il contenuto sta dietro un accesso o un paywall — aggirare un controllo di accesso è una questione separata dal copyright, e peggiore.

Una pagina sola, salvata a mano, da un sito che leggi: a nessuno importa, ed è per questo che i browser hanno un pulsante di salvataggio fin dall'inizio. Una scansione automatizzata di un'intera pubblicazione: chiedi prima.

## Come scegliere

1. **Parti da cosa farai con il file.** Leggerlo più tardi significa che un estrattore è tuo amico e l'arredamento è rumore. Citarlo in una discussione significa tenere anche l'HTML, perché il Markdown da solo non prova niente.
2. **Cattura prima di convertire.** Salva l'HTML, o copia il DOM renderizzato, e conservalo. Gli strumenti di conversione migliorano e i tuoi requisiti cambiano, e un file su disco si può far passare attraverso uno strumento migliore l'anno prossimo — un incolla in una casella di testo no.
3. **Decidi sulle immagini al momento della cattura, non dopo.** Scaricarle costa un flag mentre hai la pagina davanti, e costa un archivio rotto se lo rimandi a quando gli URL sono già degradati.
4. **Controlla le tabelle prima di fidarti dello strumento.** Le tabelle non sono nella specifica CommonMark, quindi un convertitore deve implementare le tabelle GFM deliberatamente. Converti una pagina che ha una tabella e guardala; quel singolo test cattura la maggior parte delle opzioni scadenti.
5. **Sanifica qualunque cosa tornerà a essere HTML.** Una pagina che hai salvato può portare script, e un viaggio di andata e ritorno fedele li riporta a un browser. Se il Markdown verrà letto solo come testo questo non conta; nel momento in cui viene pubblicato è l'unica cosa che conta.
6. **Conta le installazioni rispetto alla frequenza.** Ritagliare ogni giorno giustifica un'estensione e un template. Due pagine all'anno no: usa la modalità lettura, salva l'HTML, convertilo in una scheda del browser, e tieni i tuoi permessi per te.

## Conclusione

Il modo affidabile di conservare una pagina web sono due passaggi che sembrano uno: tira fuori l'articolo dalla pagina, poi tira fuori il Markdown dall'articolo. La modalità lettura o un estrattore fa il primo, qualunque convertitore competente fa il secondo, e un clipper fa entrambi insieme in cambio di un permesso di estensione. Qualunque strada tu prenda, salva le immagini o accetta consapevolmente che sbiadiranno, scrivi l'URL sorgente e la data nel file, e ricorda che la copia è per te — la pagina appartiene comunque a chi l'ha scritta.

## Domande frequenti

### Qual è il modo più veloce di salvare una pagina web come Markdown?

Attiva la modalità lettura del browser, copia l'articolo ripulito, e incollalo in un convertitore — è questione di meno di un minuto e nessuna installazione. Se lo fai spesso, un'estensione clipper lo riduce a un clic al costo di concedere a un'estensione l'accesso alle pagine che visiti.

### Quale formato di salvataggio del browser dovrei scegliere?

"Pagina web, completa" se vuoi le immagini su disco, oppure "Pagina web, solo HTML" se ti interessa solo il testo. Evita "Pagina web, file singolo" (`.mhtml`) e il Web Archive di Safari quando l'obiettivo è Markdown, perché la maggior parte dei convertitori non riesce a leggere nessuno dei due formati.

### Perché la mia pagina salvata si converte in quasi niente?

Molto probabilmente la pagina renderizza il suo contenuto con JavaScript, quindi il sorgente salvato è un guscio vuoto. Apri gli strumenti per sviluppatori, clic destro sull'elemento `<html>`, scegli Copia poi Copia outerHTML, salvalo come file `.html`, e converti quello invece — è la pagina come l'ha costruita il browser.

### Le immagini arrivano insieme al Markdown?

Non di default. Un convertitore scrive gli URL delle immagini che ha trovato, che puntano al sito originale e continuano a funzionare solo finché funziona quel sito. Usa `--extract-media` di Pandoc, `wget --page-requisites --convert-links`, oppure uno strumento che incorpora gli asset, se vuoi una copia invece di un puntatore.

### Posso convertire un URL direttamente in Markdown senza installare niente?

Sì, per pagine semplici: Pandoc accetta un URL come input, e diversi strumenti online ne prendono uno. Entrambi gli approcci saltano l'estrazione, quindi aspettati la navigazione e il piè di pagina nell'output a meno che lo strumento non faccia girare prima un proprio estrattore.

### È legale salvare una pagina web come Markdown?

Tenere una copia personale per leggere è uso ordinario, ed è a questo che serve il pulsante di salvataggio di un browser. Ripubblicare quello che hai salvato, o costruire un corpus commerciale da molte pagine, è una domanda diversa che dipende da scala, licenza e termini di servizio — chiedi prima di automatizzare un sito che non possiedi.

### Posso convertire un intero sito in una volta?

Tecnicamente sì, con `wget` e un convertitore in un ciclo, ed è la richiesta più probabile a infastidire il proprietario di un sito o a far bloccare il tuo indirizzo. Limita la frequenza, identificati nello User-Agent, rispetta le risposte `429`, e considera se un'istantanea d'archivio o una richiesta diretta della fonte non ti servirebbero meglio.
