## Cosa viene conservato

Un `.epub` è un archivio zip di pagine XHTML. Quando qui si converte un EPUB in Markdown, l’intero libro diventa un unico documento: il titolo come intestazione, il primo autore in corsivo subito sotto, l’elenco dei capitoli e poi ogni capitolo nella propria sezione, sotto un’intestazione `# Titolo del capitolo`, separata dalla successiva da una linea orizzontale.

L’ordine è quello di lettura che il libro stesso dichiara nella spine del suo file di pacchetto, non l’ordine dei nomi dei file. I titoli vengono dall’indice del libro (il documento di navigazione di EPUB 3 o il più vecchio `toc.ncx`). Per un capitolo che lì non compare si usa il suo primo `<h1>` o, se manca, il primo `<h2>` o `<h3>`; poi il suo `<title>` e, in mancanza di tutto questo, il capitolo prende il nome «Chapter 4», in inglese, dalla sua posizione.

| Nel libro | Nel Markdown |
| --- | --- |
| Intestazioni dentro un capitolo | `##`, `###` e così via, al livello scelto dal libro |
| Grassetto, corsivo, elenchi, tabelle | `**grassetto**`, `*corsivo*`, elenchi e tabelle Markdown |
| Collegamenti a siti web | Conservati, con il loro indirizzo |
| Collegamenti tra capitoli, richiami di nota | Solo il loro testo, per esempio `\[1\]` |
| Immagini nell’archivio | Incorporate nel documento |
| La pagina dell’indice di un EPUB 3 | Omessa, perché il documento scrive il proprio elenco |

Quando un capitolo si apre con il proprio titolo, quell’intestazione viene tolta perché il titolo non compaia due volte. Un titolo che comincia con un numero seguito da un punto, come «1. The Light», o che contiene parentesi quadre, trattini bassi, asterischi o altri caratteri che Markdown protegge con un escape, non viene riconosciuto come ripetizione e compare due volte.

## Cosa resta fuori

- **L’immagine di copertina.** È la sovraccoperta, non una pagina, quindi l’immagine che il libro indica come copertina non viene mai incorporata. Una pagina di copertina disegnata in SVG sparisce insieme all’immagine; una pagina di copertina fatta con un semplice `<img>` lascia una breve sezione con un collegamento a un’immagine che non c’è.
- **La formattazione.** Il foglio di stile e i caratteri incorporati non vengono letti: tipi di carattere, capilettera, colori e sottolineature si perdono, e così tutto ciò che una pagina disegna come SVG incorporato, compresa un’immagine racchiusa al suo interno. Le immagini inserite con `<img>`, file SVG compresi, vengono invece conservate.
- **Gran parte dei metadati.** Si leggono solo il titolo e il primo autore; editore, ISBN, lingua e data no.
- **L’annidamento dell’indice.** Una parte con dei capitoli al suo interno diventa un elenco piatto, con una sezione per ogni file della spine, e una pagina che contiene solo il proprio titolo viene omessa.

## Un esempio

*The Lighthouse Keeper* di Mary Hale è un libro EPUB 3 con una copertina in SVG, due capitoli salvati come `index_split_030.xhtml` e `index_split_002.xhtml` (letti in quest’ordine) e una pagina di note, più una cartina, un richiamo di nota, una tabella e un collegamento che torna al primo capitolo. Il risultato è questo, con il base64 accorciato:

```markdown
# The Lighthouse Keeper

*Mary Hale*

- The Light
- The Storm
- Notes

---

# The Light


The lamp was lit at *dusk*, as it had been for forty years.\[1\]

![Map of the headland](data:image/png;base64,iVBORw0KGgo…)

See [the register](https://example.org/lighthouses).

---

# The Storm


| Night | Wind |
| --- | --- |
| Monday | Force 9 |

Back to the first chapter.

---

# Notes

\[1\] Since 1884.
```

## Limiti

- **50 MB per caricamento.** Più libri trascinati insieme vengono concatenati in un unico documento, e il limite vale per il loro totale.
- **Le immagini condividono un budget.** Ognuna viene incorporata solo se pesa meno di circa 750 KB, e quelle di uno stesso libro dispongono in tutto di circa 1,5 MB, spesi in ordine di lettura. Oltre quella soglia un’immagine conserva il suo percorso nell’archivio, che fuori dall’archivio non mostra nulla.
- **La conversione avviene nel browser.** Il libro non viene caricato. Il Markdown arriva in un account solo se si accede e si preme Salva, e un documento salvato può arrivare a 4 MB.
- **Solo `.epub`.** Un file Kindle `.mobi` o `.azw3` viene rifiutato.

## Domande frequenti

### Come aprire un file EPUB?

Per leggerlo basta un’app di lettura come Apple Books o Calibre; [Come aprire un file .epub](/how-to/open-epub) passa in rassegna le alternative. Per estrarne il testo lo si può convertire qui: il libro compare come un’unica pagina da leggere nel browser, copiare o scaricare in formato `.md`.

### I capitoli saranno nell’ordine giusto?

Sì. L’ordine viene dalla spine, l’unico punto in cui un EPUB lo dichiara, e i nomi dei file vengono ignorati. [Convertire un EPUB in Markdown](/blog/convert-epub-to-markdown) spiega perché di quei nomi non ci si può fidare.

### Che fine fanno le note a piè di pagina?

Il richiamo conserva il suo testo, `[1]`, ma non rimanda più da nessuna parte, e la nota resta dove l’aveva messa il libro, di solito in un capitolo di note alla fine. Le note non vengono trasformate in note Markdown del tipo `[^1]`.

### Si può convertire un libro Kindle o un libro con DRM?

No. Si accettano solo file `.epub`, e qui nessun capitolo viene decifrato. I capitoli di un libro protetto, quindi, escono come caratteri illeggibili.

### Posso ottenere ogni capitolo in un file separato?

No. Un libro diventa sempre un unico documento, ma ogni capitolo comincia, dopo una linea orizzontale, con la propria intestazione `# `, quindi dividerlo a mano è semplice.
