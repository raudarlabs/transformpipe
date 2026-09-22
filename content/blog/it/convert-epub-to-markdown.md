---
title: "Convertire un EPUB in Markdown: ordine dello spine, titoli e note"
description: "Un EPUB è un sito web dentro uno zip — che cosa danno Pandoc, calibre e una lettura diretta, e le quattro cose che si rompono quando un libro diventa un file"
date: 2026-09-21
tag: Conversione
keywords: epub in markdown, convertire epub in markdown, libro elettronico in testo, estrarre il testo da un epub, calibre epub markdown, pandoc epub markdown
---

Un EPUB è un piccolo sito web che si dà il caso venga venduto come libro: file XHTML, un foglio di stile, immagini e un indice che dice in quale ordine leggerli. Questo ne fa il più ospitale dei formati documentali, ed è anche il motivo per cui i problemi interessanti non riguardano affatto l'analisi sintattica. Riguardano quello che succede quando centottanta file distinti diventano un unico documento Markdown e ogni collegamento fra loro smette di puntare a qualcosa.

### In breve

Rinomina un `.epub` in `.zip` e puoi leggere tutto. `META-INF/container.xml` indica il documento di pacchetto, e lo spine di quel documento è l'ordine di lettura — che, come in ogni formato zippato, non è l'ordine dei nomi di file (verificato su w3.org, 21 settembre 2026). Pandoc legge l'EPUB direttamente, e lo legge bene: `pandoc -f epub -t gfm book.epub -o book.md --extract-media=media`. Anche calibre sa produrre Markdown, attraverso l'uscita TXT: `ebook-convert book.epub book.txt --txt-output-formatting=markdown`, ma toglie collegamenti e riferimenti alle immagini se non passi `--keep-links` e `--keep-image-references` (verificato su manual.calibre-ebook.com, 21 settembre 2026). Un convertitore che legge le parti direttamente, come [EPUB → Markdown](/epub-to-markdown), risolve lo spine, prende i titoli dei capitoli dal documento di navigazione e trasforma i rimandi fra capitoli in qualcosa che funziona ancora dentro un file solo.

Quello che si rompe comunque: i collegamenti fra capitoli, le note marcate con `epub:type`, gli elenchi di pagine e tutto ciò che sta in un libro a impaginazione fissa, cioè immagini con il testo disegnato dentro.

## Che cosa c'è dentro un .epub

| Percorso | Che cos'è |
| --- | --- |
| `mimetype` | La prima voce dello zip, non compressa, che dichiara un EPUB |
| `META-INF/container.xml` | L'unico file a percorso fisso — nomina il documento di pacchetto |
| `OEBPS/content.opf` | Il documento di pacchetto: metadati, un manifesto di ogni file e lo spine |
| `OEBPS/nav.xhtml` | Il documento di navigazione di EPUB 3 — l'indice, come elenco annidato |
| `OEBPS/toc.ncx` | L'equivalente di EPUB 2, ancora presente in quasi tutti i libri per compatibilità |
| `OEBPS/chapter-12.xhtml` | Un capitolo, in comune XHTML |
| `OEBPS/images/` | Le immagini, copertina compresa |

Due regole rendono tutto questo facile da leggere e una lo rende facile da sbagliare. Le facili: `META-INF/container.xml` è l'unico percorso da conoscere, perché tutto il resto si scopre a partire da lì, e il contenuto è XHTML, che qualsiasi parser HTML già gestisce. La difficile è la stessa di ogni formato zippato: lo spine definisce la sequenza di lettura, e nient'altro lo fa. `chapter-12.xhtml` può essere il terzo capitolo, l'appendice, o un file inutilizzato rimasto nel manifesto. Ordinare per nome di file produce un libro in un ordine che nessuno ha scritto.

## Le tre strade

| Strada | Ordine | Titoli dei capitoli | Immagini | Collegamenti fra capitoli | Note |
| --- | --- | --- | --- | --- | --- |
| Pandoc | Dallo spine | Dalle intestazioni | `--extract-media` | Restano, puntando al nulla | Restano come collegamenti |
| calibre TXT/Markdown | Dallo spine | Dalle intestazioni | Disattivate per impostazione | Disattivati per impostazione | Restano se restano i collegamenti |
| Leggere le parti direttamente | Dallo spine | Prima la navigazione, poi le intestazioni | Incorporate | Riscrivibili in ancore interne | Risolvibili fino al testo della nota |
| Copiare da un lettore | Quello che hai selezionato | No | No | No | No |

## Pandoc, che l'EPUB lo legge davvero

`epub` compare da anni su entrambi i lati dell'elenco di Pandoc, cosa che non vale per ogni formato che scrive: `pptx` è stato solo un formato di uscita fino al lettore arrivato nella 3.8.3 (verificato su pandoc.org, 22 settembre 2026). È la migliore risposta breve per un libro che vuoi come file unico:

```bash
pandoc -f epub -t gfm book.epub -o book.md --extract-media=media
```

`--extract-media` scrive ogni immagine nella cartella che indichi e riscrive i collegamenti alle immagini verso di essa, che è quello che vuoi, perché l'alternativa è un Markdown che rimanda a file ancora sigillati dentro lo zip. Aggiungi `--wrap=none` se l'andata a capo forzata disturba i tuoi diff.

Quello che ottieni è un documento fedele e piatto: le intestazioni di ogni capitolo al livello che l'XHTML usava, i paragrafi in ordine di spine, le immagini accanto al file. Quello che non ottieni è un qualunque riconoscimento del fatto che i capitoli erano documenti separati. Ogni `<a href="chapter-13.xhtml#note-4">` del libro è ora un collegamento a un file che non esiste, dentro un documento Markdown che contiene proprio la cosa a cui puntava, qualche centinaio di righe più sotto.

| Vantaggi | Svantaggi |
| --- | --- |
| Un comando, nessuna configurazione, alta fedeltà | I collegamenti fra capitoli sopravvivono come percorsi relativi rotti |
| L'ordine dello spine è trattato correttamente | I titoli vengono dalle intestazioni: un libro con aperture di capitolo in immagine resta con capitoli senza nome |
| `--extract-media` risolve bene la questione immagini | Pagine preliminari, colophon e indice passano tutti come capitoli |

**Per chi va bene?** Per chi ha già Pandoc e un libro di struttura convenzionale. È l'impostazione predefinita giusta, e il problema dei collegamenti è a un cerca-e-sostituisci di distanza.

## calibre, e le due opzioni che contano

`ebook-convert` di calibre è l'altro strumento che quasi tutti hanno già, e arriva al Markdown attraverso la sua uscita TXT:

```bash
ebook-convert book.epub book.txt \
  --txt-output-formatting=markdown \
  --keep-links \
  --keep-image-references
```

L'opzione di formattazione accetta `plain`, `markdown` o `textile`. Le due opzioni `--keep` sono la parte da conoscere, perché la loro assenza è silenziosa: la documentazione dice che i collegamenti vengono sempre rimossi con l'uscita in testo semplice, e che conservarli ha senso solo una volta scelta un'opzione di formattazione (verificato su manual.calibre-ebook.com, 21 settembre 2026). Esegui il comando senza di esse e ottieni un libro pulito, leggibile e privo di collegamenti, e niente ti dice che ne conteneva quattrocento.

`--keep-image-references` ha il difetto speculare a quello di Pandoc: tiene i riferimenti e non estrae i file, così finisci con `![](../images/fig-3.png)` che punta dentro uno zip che non hai più aperto. calibre produce volentieri anche un'uscita HTMLZ con le immagini — momento in cui l'estrazione la stai facendo a mano comunque.

| Vantaggi | Svantaggi |
| --- | --- |
| Già installato ovunque si gestisca una biblioteca | Due opzioni poco evidenti ti separano da una conversione senza perdite |
| Regge molti più libri malformati di Pandoc | I riferimenti alle immagini restano, i file no |
| Convertire in blocco un'intera biblioteca è una riga | Il Markdown è un sottoprodotto di un esportatore di testo, non un formato di destinazione |

**Per chi va bene?** Per chi converte molti libri in una volta, o uno che Pandoc rifiuta. È anche il più indulgente dei due lettori, il che conta più di quanto dovrebbe: una quota sorprendente degli EPUB reali non è valida.

## Leggere le parti da sé

L'intero formato sono quattro passaggi, abbastanza brevi da valere la pena di conoscerli anche se non li scriverai mai:

```text
1. unzip the file
2. read META-INF/container.xml → <rootfile full-path="OEBPS/content.opf">
3. read the opf:
     <manifest> → id → href, media-type
     <spine>    → ordered list of idrefs
4. for each idref in spine order: parse the XHTML, convert it, append
```

Farlo così vale la fatica per un motivo solo: hai lo spine e il documento di navigazione in mano nello stesso momento, ed è questo a far uscire bene i titoli dei capitoli e i collegamenti. Né Pandoc né calibre usa il documento di navigazione per i titoli: entrambi prendono quello che dicono le intestazioni dell'XHTML, che di solito è la stessa cosa e a volte no.

## Le quattro cose che si rompono, e che cosa farci

### Titoli di capitolo che nel capitolo non ci sono

L'apertura di capitolo di un libro è spesso un'immagine disegnata — il numero composto in un carattere da titolo, esportato in PNG — con il testo vero che nell'XHTML non compare da nessuna parte. Il documento di navigazione sa comunque che il capitolo si chiama “Il secondo inverno”, perché è la stringa che il lettore mostra nel suo indice. Una conversione che legge solo i file dei capitoli produce un documento senza nessuna intestazione, e senza una spiegazione evidente.

Il rimedio è prendere il titolo dal documento di navigazione, indicizzato per il file a cui punta, e ripiegare sulla prima intestazione solo quando la navigazione non ha nulla. [EPUB → Markdown qui](/epub-to-markdown) legge sia `nav.xhtml` sia `toc.ncx` proprio per questo, perché moltissimi file EPUB 3 portano un NCX con etichette migliori del loro nav.

### I collegamenti fra capitoli

È questo a distinguere un libro da un documento. Dentro l'EPUB, `<a href="ch13.xhtml#fn4">` è un collegamento funzionante verso un altro file. In un unico documento Markdown, origine e destinazione stanno nello stesso file, e il collegamento è un percorso relativo verso un file che non esiste.

Ci sono tre risposte difendibili, e quella sbagliata è non fare niente:

- **Riscrivere in un'ancora interna.** `ch13.xhtml#fn4` diventa `#fn4`, che funziona se l'identificatore di destinazione è sopravvissuto nel Markdown e il renderizzatore emette identificatori per le intestazioni. Risultato migliore, lavoro maggiore.
- **Togliere il collegamento e tenere il testo.** La frase si legge bene e niente è rotto. È quello che una conversione dovrebbe fare per impostazione predefinita.
- **Lasciare l'href com'è.** Il documento contiene ora collegamenti che falliscono in silenzio. È quello che fanno quasi tutte le conversioni.

### Le note

EPUB 3 marca le note con `epub:type="noteref"` sul collegamento e `epub:type="footnote"` sulla destinazione, che di solito vive a fine capitolo o in un file di note a sé. Markdown ha una sintassi per le note nella maggior parte dei suoi dialetti, ed è una destinazione davvero buona: `[^4]` nel testo, `[^4]: la nota` in fondo. Quasi nulla stabilisce quella corrispondenza, perché richiede di leggere gli attributi `epub:type` e di accoppiare gli identificatori fra file invece di convertire ogni file per conto suo. [Che cosa fa Markdown con le note a piè di pagina](/blog/markdown-footnotes-support) dice quali renderizzatori sostengono la sintassi una volta che ce l'hai.

### I libri a impaginazione fissa

Fumetti, libri per bambini, libri di cucina e quasi tutta la saggistica illustrata escono come EPUB a impaginazione fissa: un'immagine per pagina, posizionata in modo assoluto, con il testo cotto dentro l'immagine. Non c'è testo da convertire. La conversione di un libro simile produce un elenco di immagini e una manciata di numeri di pagina, e non è un difetto dello strumento — le parole non sono mai state caratteri. Cerca `<meta property="rendition:layout">pre-paginated</meta>` nel documento di pacchetto prima di spenderci tempo.

## Quello che non funzionerà

**Un libro protetto da DRM.** I suoi file di contenuto sono cifrati ed elencati in `META-INF/encryption.xml`, e ognuno degli strumenti qui sopra legge lo zip, trova testo cifrato e fallisce. È il comportamento voluto del formato, e niente in questo articolo è un modo per aggirarlo. I libri venduti senza DRM, quelli pubblicati con una licenza che lo consente e i tuoi manoscritti sono tutti EPUB ordinari.

**La tipografia vera.** Capilettera, maiuscoletto, punteggiatura sporgente, titoli con crenatura curata e il controllo attento di righe vedove e orfane sono tutte decisioni del foglio di stile. Markdown non ha modo di esprimerne nessuna e, nel complesso, non dovrebbe averlo. Quello che ciò costa va detto ad alta voce quando la cosa da convertire è un libro progettato e non un manoscritto.

**La semantica del foglio di stile.** Un libro che distingue un'epigrafe da una citazione in rilievo e da una citazione in blocco lo fa con tre classi CSS su tre blockquote. Markdown ne ha uno. Qualcosa andrà perso, e quale dei tre conti di più è una decisione che puoi prendere solo tu — prima della conversione, cambiando il markup, non dopo.

## Un elenco per un libro a cui tieni

1. **Controlla la proprietà di impaginazione** cercando `pre-paginated` prima di ogni altra cosa. Se l'impaginazione è fissa, fermati.
2. **Conta le voci dello spine** e i capitoli nel Markdown finito. Una differenza di solito vuol dire che le pagine preliminari si sono fuse o che una sezione è saltata.
3. **Cerca `.xhtml` nell'uscita.** Ogni occorrenza è un collegamento che prima funzionava.
4. **Guarda la prima intestazione di ogni capitolo.** Se più capitoli cominciano con un'immagine e senza intestazione, i titoli sono venuti dal posto sbagliato.
5. **Decidi su preliminari e finali.** Colophon, dedica, indice analitico e nota tipografica si convertono tutti e, in un documento che andrai a modificare, sono rumore. Sono anche la cosa più facile da togliere una volta sola, all'inizio.
6. **Se il libro ha note, seguine una da capo a fondo** — il richiamo nel testo, la nota stessa, e se qualcosa le lega ancora.

## Dove ti lascia tutto questo

Per un libro, `pandoc -f epub -t gfm --extract-media=media` più dieci minuti a sistemare i collegamenti è la strada onesta più breve. Per uno scaffale intero, calibre con le due opzioni `--keep` lavora il blocco in modo pulito. Per un libro in cui le note e i titoli contano — un'opera di consultazione, un manoscritto che torna dall'editore, qualsiasi cosa tu intenda continuare a lavorare — la differenza sta nelle parti che gli strumenti generalisti non leggono, e [la conversione EPUB → Markdown di qui](/epub-to-markdown) prende i titoli dal documento di navigazione e incorpora le immagini, così il risultato è un file solo. Una volta che è Markdown, [unirlo e dividerlo](/blog/merging-many-markdown-files) è un problema diverso e molto più semplice.
