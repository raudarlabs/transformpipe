---
title: "Da Markdown a PDF: ogni strada e cosa costa ciascuna"
description: Confronto tra tutte le strade da Markdown a PDF - stampare dal browser, Pandoc con LaTeX, wkhtmltopdf, WeasyPrint, Chrome headless - e le parti che si rompono
updated: 2026-10-21
date: 2026-09-01
tag: Pubblicazione
keywords: markdown in pdf, convertire md in pdf, convertitore markdown pdf, pandoc markdown in pdf, markdown in pdf da riga di comando, stampare markdown in pdf, md in pdf senza installare
---

### In breve

Non esiste una conversione diretta da Markdown a PDF; ogni strumento passa per un formato intermedio, e quello che sceglie decide l'aspetto del tuo PDF. Per un singolo documento che ti serve adesso, converti in un file HTML completo e stampalo dal browser: è la migliore tipografia disponibile gratis, e la finestra di stampa è dove imposti dimensione della carta e margini. Per un documento lungo con sezioni numerate, intestazioni ricorrenti e un indice con i numeri di pagina, installa Pandoc e un motore LaTeX e accetta la dimensione dell'installazione. Per una build che gira senza una persona dentro, usa Chrome headless o WeasyPrint, e imposta le regole di pagina in CSS invece che in una finestra che nessuno sarà lì a cliccare.

Il Markdown non ha pagine. Ha titoli, paragrafi, liste e codice, e non dice niente su dove finisce un foglio di carta e inizia il successivo. Il PDF è l'opposto: una dimensione di pagina fissa, un margine fisso, un'interruzione tra pagina quattro e pagina cinque, e ogni font che usa portato dentro il file. Convertire tra i due non è una traduzione, è un'invenzione. Qualcosa deve decidere la dimensione della carta, i margini, dove si divide la tabella e quale font viene incorporato, e se non decidi tu, decide lo strumento al posto tuo.

Questo è il motivo per cui lo stesso file `.md` produce quattro PDF diversi da quattro strumenti diversi, e perché le differenze non sono cosmetiche. Uno mette i tuoi blocchi di codice su uno sfondo grigio, un altro li stampa su bianco con le righe lunghe tagliate al margine. Uno numera le pagine, un altro stampa l'URL del file e la data di ieri in cima. Uno incorpora il font che hai scelto, un altro sostituisce un fallback e non te lo dice.

Ci sono quattro strade, e solo quattro. Converti in HTML e stampalo da un browser. Converti in LaTeX e componilo. Converti in HTML e passalo a un motore dedicato da HTML a PDF. Oppure apri il file in un editor che ha un menu di esportazione. Tutto il resto è una di queste quattro con un wrapper diverso attorno, incluso ogni convertitore online che promette un PDF in un clic.

## Confronto rapido: il bigliettino

| Strada | Ideale per | Cosa serve | Controllo sulla pagina | Licenza e prezzo |
| --- | --- | --- | --- | --- |
| HTML, poi stampa dal browser | Un documento, adesso | Un browser che hai già | Carta, margini, scala, sfondi - da una finestra | Gratis |
| Pandoc + pdflatex | Prosa semplice, nessun glifo insolito | Pandoc più un'installazione TeX | Totale, tramite variabili di template | Gratis, GPL; TeX Live gratis |
| Pandoc + xelatex o lualatex | Font di sistema, scritture non latine, matematica | Lo stesso, più i font | Totale | Gratis, GPL |
| Pandoc + Typst | Una pagina di qualità LaTeX senza installare TeX | Pandoc più il binario Typst | Totale, tramite la sintassi propria di Typst | Gratis; Typst è Apache 2.0 |
| Pandoc + WeasyPrint | CSS che conosci già, con vere regole di pagina | Python più WeasyPrint | Totale, tramite i paged media del CSS | Gratis, BSD |
| WeasyPrint sul tuo proprio HTML | Intestazioni ricorrenti, contatori di pagina, segnalibri PDF | Python più WeasyPrint | Totale, tramite CSS | Gratis, BSD |
| wkhtmltopdf | Uno script che lo chiama già | Un binario solo | Buono, tramite flag da riga di comando | Gratis, LGPLv3; repository archiviato |
| Chrome headless | Un passaggio di build, o molti file insieme | Chrome o Chromium installato | Tramite il CSS di stampa nel documento | Gratis |
| Puppeteer | Lo stesso, scriptato, con i margini nel codice | Node più uno scaricamento di Chromium | Totale, tramite la API | Gratis, Apache 2.0 |
| Typora | Scrivere ed esportare in un'unica applicazione | Un'installazione desktop, a pagamento | Quello del tema, più un'impostazione pagina | $14,99 una tantum, fino a 3 dispositivi |
| Obsidian | Un vault in cui già scrivi | Un'installazione desktop | Quello del tema | Gratis; licenza commerciale opzionale |
| Estensione VS Code | Il file è già aperto nel tuo editor | Un'estensione, spesso un Chromium | Quello che espone l'estensione | Gratis, dipende dall'estensione |
| Markdown in `.docx`, poi Word o LibreOffice | Qualcuno deve modificarlo dopo di te | Pandoc più una suite per ufficio | L'impostazione pagina della suite | Gratis con LibreOffice |

Prezzi verificati su typora.io e obsidian.md, l'8 settembre 2026. L'avviso del repository wkhtmltopdf è stato verificato su github.com, l'8 settembre 2026.

## Converti in HTML, poi stampa dal browser

Questa è la strada che la maggior parte delle persone dovrebbe prendere per un singolo documento, ed è quella di cui diffidano perché sembra troppo semplice. Converti il Markdown in un file HTML completo - non un frammento, un documento con un doctype, una head e i suoi stili inline - aprilo, e premi la scorciatoia di stampa. Scegli “Salva come PDF” come destinazione.

La tipografia è la ragione per farlo in questo modo. L'output di stampa di un browser viene dallo stesso motore di layout che renderizza ogni pagina che guardi: crenatura vera, legature, interruzione di riga corretta, testo vettoriale a qualsiasi zoom, e sottoinsiemi di font incorporati nel PDF risultante. Niente di gratuito fa di meglio, e diverse cose a pagamento fanno di peggio. Se il documento imposta `lang` sull'elemento radice e `hyphens: auto` nel suo foglio di stile, ottieni anche la sillabazione, che è la differenza tra un paragrafo giustificato che si legge bene e uno pieno di fiumi bianchi.

Il compromesso è che tutto il tuo controllo vive in una finestra di dialogo, e vale la pena capire quella finestra, perché quattro dei suoi controlli cambiano il tuo documento in silenzio.

| Controllo | Cosa fa davvero | Perché conta |
| --- | --- | --- |
| Destinazione | Sceglie una stampante fisica o “Salva come PDF” | Solo “Salva come PDF” produce un file; il PDF di un driver di stampante può rasterizzare il testo |
| Dimensione carta | A4, Letter, Legal e il resto | A4 è 210 per 297mm, Letter è 8,5 per 11in; un layout tarato per una si riadatta sull'altra |
| Margini | Predefiniti, Nessuno, Minimi, Personalizzati | “Nessuno” porta il contenuto fino al bordo della carta, cosa che la maggior parte delle stampanti fisiche non può riprodurre |
| Scala | “Adatta all'area stampabile”, oppure una percentuale | Adattare rimpicciolisce tutto, quindi una tabella troppo larga rende il testo del corpo più piccolo di quanto hai impostato |
| Grafica di sfondo | Disattivata di default | Questo è il controllo che rimuove l'ombreggiatura dei tuoi blocchi di codice e la striatura delle tabelle |
| Intestazioni e piè di pagina | Disattivate o attivate | Attivate stampano il titolo della pagina, la posizione del file, la data e un numero di pagina, nel carattere proprio del browser |

Due di questi default causano la maggior parte delle lamentele sui PDF stampati dal browser. La grafica di sfondo è disattivata perché l'inchiostro della stampante costa, e l'effetto su un documento tecnico è che ogni blocco di codice ombreggiato, ogni callout colorato e ogni tabella striata escono bianco piatto. Attivala. Intestazioni e piè di pagina sono una comodità per stampare una pagina web e un difetto per qualsiasi cosa mandi a qualcun altro: stampano un percorso `file:///Users/tu/Downloads/…` in cima alla prima pagina. Disattivali.

Il CSS proprio del documento può riprendersi indietro parte di questo. Un foglio di stile che dichiara `@page { size: A4; margin: 20mm; }` dà alla finestra un punto di partenza sensato, e le regole `@media print` ti permettono di togliere la navigazione, espandere le sezioni chiuse e forzare colori che sopravvivono a una stampante monocromatica. È anche dove metti `break-inside: avoid` così una tabella o una figura smette di dividersi lungo un confine di pagina.

| Pro | Contro |
| --- | --- |
| La migliore tipografia disponibile gratis | Una persona deve passare per una finestra di dialogo, quindi non è un passaggio di build |
| Nessuna installazione, e nessun caricamento se la conversione gira nel browser | Nessuna intestazione o piè di pagina ricorrente di tuo disegno |
| Il PDF è prodotto da un file che puoi conservare e ristampare | Nessun indice con numeri di pagina, e nessun riferimento incrociato |
| A due controlli dal risultato corretto una volta che sai quali due | Un documento alla volta |

**Per chi è.** Chiunque abbia un documento e un destinatario. Un convertitore che ti consegna HTML autonomo con gli stili inline rende questo un lavoro in due passaggi, e [cosa succede al tuo file lungo la strada](/blog/markdown-to-html-converter) vale la pena leggerlo prima di fidarti dell'output di uno qualsiasi di essi. TransformPipe fa la conversione nel tuo browser e stampa attraverso la stessa finestra, il che è il motivo per cui è su questa lista invece che dentro di essa: il PDF è opera del browser, non del convertitore.

## Pandoc con un motore LaTeX

`pandoc report.md -o report.pdf` è il comando che tutti citano, ed è fuorviante in un modo specifico: Pandoc non crea PDF. Converte il tuo Markdown in LaTeX e poi esegue un motore di composizione esterno, che è quello che produce davvero il file. Se quel motore non è installato, il comando fallisce, e l'errore nomina un binario di cui non hai mai sentito parlare.

Quell'indirezione è anche la fonte della qualità. TeX compone matematica e prosa lunga dagli anni '80, e il suo algoritmo di interruzione di riga ottimizza interi paragrafi invece di una riga alla volta. Per una tesi, un manuale, un contratto o qualsiasi cosa con sezioni numerate ed equazioni, resta il miglior output su questa pagina.

### Quale motore, e cosa costa installarlo

| Motore | Selezionato con | Usalo quando | Costo |
| --- | --- | --- | --- |
| pdflatex | Il default | Prosa inglese semplice, nessun glifo insolito | Un'installazione TeX |
| xelatex | `--pdf-engine=xelatex` | Vuoi font di sistema, o scritture non latine | La stessa, più i font |
| lualatex | `--pdf-engine=lualatex` | La stessa cosa, con scripting Lua nel template | La stessa |
| Typst | `--pdf-engine=typst` nei Pandoc recenti | Vuoi un'installazione veloce e piccola invece di TeX | Un binario, Apache 2.0 |
| WeasyPrint | `--pdf-engine=weasyprint` | Preferisci scrivere CSS piuttosto che LaTeX | Python e un'installazione pip |
| wkhtmltopdf | `--pdf-engine=wkhtmltopdf` | Una pipeline legacy se lo aspetta | Un binario, non più mantenuto |

L'installazione è il costo vero, e vale la pena essere diretti al riguardo. Una distribuzione TeX completa è di gran lunga la dipendenza più grande in qualsiasi toolchain di documenti che la maggior parte delle persone assembla; si misura in gigabyte e ci vuole un po'. Le distribuzioni piccole - BasicTeX, TinyTeX - si installano in una frazione dello spazio e poi falliscono la prima volta che il tuo documento ha bisogno di un pacchetto che hanno lasciato fuori. Il fallimento è almeno leggibile: LaTeX si ferma e nomina il file `.sty` mancante, e `tlmgr install <pacchetto>` lo recupera. Lo farai quattro o cinque volte prima che un primo documento si compili, e poi mai più su quella macchina.

### I flag che fanno il lavoro

| Flag | Effetto |
| --- | --- |
| `-V geometry:margin=25mm` | Imposta il margine di pagina tramite il pacchetto geometry |
| `-V mainfont="Source Serif 4"` | Sceglie un font di sistema; richiede xelatex o lualatex |
| `-V fontsize=11pt` | Dimensione del corpo del testo, che il 10pt di default raramente si addice |
| `-V documentclass=report` | Capitoli e una pagina di titolo invece di un articolo |
| `--toc` | Un indice, con numeri di pagina, generato dai tuoi titoli |
| `--number-sections` | Numera i titoli in corrispondenza |
| `-V colorlinks=true` | Link colorati invece delle caselle incorniciate di default |
| `--highlight-style=tango` | Sceglie il tema di evidenziazione del codice |
| `--include-in-header=head.tex` | Inietta LaTeX grezzo, che è come ottieni vere intestazioni ricorrenti |

`--toc` e `--number-sections` insieme sono la ragione onesta per lasciarsi il browser alle spalle. Un indice che elenca “Passi della migrazione ... 14” non può essere prodotto affatto da un browser, perché un browser non sa su quale pagina finisce qualcosa finché non l'ha già stampato.

### Cosa si rompe

Le righe di codice lunghe sono la prima cosa a saltare. LaTeX non va a capo nel testo verbatim, quindi un comando shell più largo del blocco di testo esce fuori dal bordo destro della carta e sparisce semplicemente. La correzione è un'impostazione di evidenziazione che spezza le righe, oppure righe più corte nel sorgente; in entrambi i casi devi accorgertene tu, perché niente ti avvisa. [Come i blocchi di codice viaggiano tra i formati](/blog/code-blocks-in-markdown) copre la versione più ampia di questo problema.

Le tabelle larghe falliscono allo stesso modo e più visibilmente. Unicode è la seconda trappola: pdflatex è precedente a esso, quindi un documento con una virgoletta curva da un elaboratore di testi, una lettera greca, un nome cinese o un'emoji si ferma con un errore su un carattere non definito. Passare a xelatex risolve la maggior parte del problema; le emoji continueranno comunque a non apparire, perché non c'è un contorno monocromatico per loro in un normale font di testo.

| Pro | Contro |
| --- | --- |
| Il miglior output per documenti lunghi disponibile gratis | L'installazione più grande di ogni strada qui |
| Un indice con numeri di pagina, e riferimenti incrociati | Gli errori di LaTeX sono notoriamente difficili da leggere |
| Ripetibile: lo stesso comando dà lo stesso file | Personalizzare il template significa imparare LaTeX |
| Un comando solo converte anche in HTML, DOCX ed EPUB | L'HTML grezzo nel Markdown viene ignorato, non renderizzato |

**Per chi è.** Chiunque produca un documento che verrà letto su carta, rilegato, o inviato da qualche parte con regole di formattazione. Anche chiunque costruisca lo stesso PDF ogni settimana, perché il comando è la specifica e non deraglia.

## Motori da HTML a PDF: wkhtmltopdf, Chrome headless e WeasyPrint

Questi stanno tra le due strade sopra. Converti ancora in HTML, ma un programma lo stampa invece di una persona, il che significa che può girare in una build. Differiscono per quale motore di layout usano, e questo unico fatto determina cosa il tuo CSS può contenere.

| Motore | Motore di layout | Intestazioni e piè di pagina | CSS moderno | Mantenuto |
| --- | --- | --- | --- | --- |
| wkhtmltopdf | Qt WebKit, un vecchio fork | Sì, tramite flag, con variabili di pagina | Inaffidabile | Repository archiviato, gennaio 2023 |
| Chrome headless | Chromium attuale | Solo la fascia propria del browser, o tramite i template di Puppeteer | Tutto quello che fa un browser | Sì |
| WeasyPrint | Il suo proprio, scritto in Python per l'impaginazione | Sì, tramite margin box del CSS | Parziale: flexbox e grid sono limitati | Sì |

### wkhtmltopdf

wkhtmltopdf è uno strumento da riga di comando che renderizza HTML con il motore di rendering Qt WebKit ed è rilasciato sotto LGPLv3 (verificato su wkhtmltopdf.org, l'8 settembre 2026). Il suo repository GitHub porta l'avviso “This repository was archived by the owner on Jan 2, 2023. It is now read-only” (verificato su github.com, l'8 settembre 2026).

La sua superficie a riga di comando è davvero buona, e migliore di quella di un browser per questo lavoro: `--margin-top` e i suoi fratelli impostano i margini in unità reali, `--header-html` e `--footer-html` prendono file HTML, `--footer-center "[page]/[topage]"` ti dà “3/12” in fondo a ogni pagina, `--print-media-type` lo fa rispettare le tue regole `@media print`, e `--enable-local-file-access` è richiesto prima che legga immagini e fogli di stile dal disco. Se hai uno script che già produce PDF accettabili con quei flag, non c'è urgenza di sostituirlo.

Il problema è il motore sotto. È un fork di un WebKit che ha smesso di muoversi anni fa, quindi un foglio di stile scritto in questo decennio - proprietà personalizzate, grid, comportamento flexbox moderno - può renderizzarsi come qualcosa che non hai progettato, senza alcun errore. Non iniziare lavoro nuovo qui.

### Chrome headless

`chrome --headless --print-to-pdf=out.pdf report.html` usa esattamente il motore che usa la finestra di stampa, quindi l'output corrisponde a quello che hai visto sullo schermo. Questo è tutto il suo argomento, ed è un argomento forte.

La trappola è che le checkbox della finestra non sono sulla riga di comando. Chrome applica i suoi propri margini di default, e se stampa la fascia con URL e numero di pagina dipende da un flag il cui nome è cambiato tra le versioni - esegui `chrome --help` sulla versione che hai invece di copiare un flag da un post di blog. Tutto il resto che vuoi deve stare nel CSS di stampa proprio del documento, che comunque è il posto giusto per averlo.

Puppeteer rimuove le congetture. La sua chiamata `page.pdf()` prende `format`, `margin`, `printBackground`, `displayHeaderFooter`, `headerTemplate` e `footerTemplate`, così dimensione della carta, margini e un piè di pagina ricorrente vivono nel codice accanto a tutto il resto della tua build. `printBackground: true` è la correzione per l'ombreggiatura mancante dei blocchi di codice che coglie tutti alla prima volta. Puppeteer è gratis e con licenza Apache 2.0; scarica il suo proprio Chromium, il che è un costo grande una tantum in una cache CI.

### WeasyPrint

WeasyPrint è una libreria Python e uno strumento da riga di comando, con licenza BSD, e non è un browser. La sua documentazione dice che è “based on various libraries but not on a full rendering engine like WebKit or Gecko”, con un motore di layout CSS scritto in Python e progettato per l'impaginazione (verificato su doc.courtbouillon.org, l'8 settembre 2026).

Quella scelta di design è il punto. Supporta la regola `@page` con i selettori `:left`, `:right`, `:first` e `:blank`, i margin box di pagina, i contatori basati sulla pagina, e le proprietà `bookmark-level`, `bookmark-label` e `bookmark-state` che costruiscono l'indice del PDF - i titoli diventano segnalibri di default. Sia le ancore interne che gli URL esterni escono come link cliccabili (tutto verificato su doc.courtbouillon.org, l'8 settembre 2026). I browser non implementano nessuno dei meccanismi dei margin box, quindi questa è l'unica strada in questa pagina che ti dà un'intestazione ricorrente vera in CSS invece che in LaTeX.

Il costo è l'altra metà della stessa scelta. La sua stessa documentazione descrive flexbox come funzionante “for simple use cases but not deeply tested” e grid come funzionante “for simple cases, but has some limitations” (verificato su doc.courtbouillon.org, l'8 settembre 2026). Dagli un documento, non il layout di un'applicazione, ed è eccellente.

**Per chi sono questi.** Chiunque abbia bisogno che il suo PDF venga prodotto da una macchina secondo un programma: un report notturno, una fattura generata, un PDF allegato a ogni release. Scegli Chrome o Puppeteer se il documento è già una pagina web che ti piace; scegli WeasyPrint se hai bisogno di intestazioni ricorrenti, contatori di pagina e segnalibri e preferisci scrivere CSS piuttosto che LaTeX.

## Editor che esportano un PDF direttamente

La strada più corta di tutte, quando il file è già aperto davanti a te. Ognuna di queste è una delle strade sopra con una voce di menu sopra - la maggior parte di esse è un motore browser impacchettato - quindi la domanda è solo se l'esportazione è abbastanza buona e se puoi ripeterla.

| Editor | Come esporta | Prezzo e licenza |
| --- | --- | --- |
| Typora | “Export to PDF with bookmarks”, più docx, LaTeX, EPUB e altri | $14,99 senza tasse, una licenza che copre fino a 3 dispositivi, prova gratuita di 15 giorni (verificato su typora.io, l'8 settembre 2026) |
| Obsidian | Export to PDF integrato dalla nota | Gratis per ogni scopo, uso commerciale incluso; una licenza commerciale è opzionale a $50 per utente all'anno (verificato su obsidian.md/pricing, l'8 settembre 2026) |
| VS Code | Un'estensione; la maggior parte impacchetta o scarica un Chromium e stampa con esso | Gratis, ma la qualità è quella dell'estensione |
| Word o LibreOffice | Converti Markdown in `.docx` con Pandoc, poi esporta dalla suite | Gratis con LibreOffice |

Prezzi e termini verificati su typora.io e obsidian.md, l'8 settembre 2026.

VS Code è l'unico editor della tabella senza un'esportazione PDF propria. Markdown PDF è una delle estensioni che la aggiungono: pilota un browser basato su Chromium tramite Puppeteer e scrive anche HTML, PNG o JPEG con le stesse impostazioni, e il foglio di stile dell'anteprima non è quello con cui stampa — [Markdown in HTML in VS Code](/blog/markdown-to-html-in-vs-code) passa in rassegna quelle impostazioni e cosa mette attorno alla pagina ogni strada di esportazione.

| Pro | Contro |
| --- | --- |
| Una voce di menu, nessun terminale, nessuna archeologia di finestre | Lo stile è quello del tema dell'editor, non del tuo documento |
| Il tema di solito è progettato per la lettura, quindi il default appare a posto | Non scriptabile, quindi non può far parte di una build |
| Segnalibri e un indice cliccabile nei migliori | Vincolato a quell'applicazione, su quella macchina |
| La deviazione tramite `.docx` lascia un file che qualcuno può modificare | Ogni passaggio attraverso un altro formato perde qualcosa |

La deviazione tramite `.docx` merita una nota a sé, perché risolve un problema che nessun'altra strada risolve. Se la persona che riceve il documento vorrà modificarlo, un PDF è un vicolo cieco e un file Word no. `pandoc report.md -o report.docx --reference-doc=house-style.docx` applica i tuoi propri stili, e LibreOffice convertirà il risultato su un server con `soffice --headless --convert-to pdf report.docx`. Due conversioni sono una in più dell'ideale, ed è il prezzo di dare a qualcuno qualcosa che può modificare — e se il `.docx` è il risultato finale invece di una tappa, [portare il Markdown in un file Word che qualcuno può modificare](/blog/markdown-to-word) è dove il documento di riferimento, gli stili che Pandoc cerca e il costo del viaggio di ritorno vengono affrontati per bene.

**Per chi è.** Chi scrive, per le bozze e per qualsiasi cosa dove “sembra ragionevole” è l'asticella. Non le build, e non i documenti con uno stile aziendale da rispettare.

## Le parti che le persone sbagliano

Cinque cose si rompono nei PDF fatti da Markdown, e si rompono allo stesso modo indipendentemente da quale strada hai preso.

| Sintomo | Causa | Correzione |
| --- | --- | --- |
| Blocchi di codice e tabelle hanno perso l'ombreggiatura | “Grafica di sfondo” è disattivata di default nella finestra di stampa | Attivala, oppure passa `printBackground: true` in Puppeteer |
| Un titolo sta da solo in fondo a una pagina | Niente ha detto al motore di tenerlo con il suo testo | `break-after: avoid` sui titoli, `break-inside: avoid` su tabelle e figure |
| Il testo del corpo è uscito più piccolo del previsto | “Adatta all'area stampabile” ha rimpicciolito l'intero documento per far stare un elemento largo | Trova la tabella o riga di codice troppo larga e correggila, poi stampa al 100% |
| La prima pagina ha un percorso di file in cima | “Intestazioni e piè di pagina” è attivo | Disattivalo, oppure usa un motore dove controlli il piè di pagina |
| Le righe di codice lunghe sono tagliate al margine | LaTeX non va a capo nel testo verbatim | Spezza le righe nel sorgente, oppure usa una strada con a capo morbido |
| Le immagini mancano del tutto | Percorsi relativi che non si risolvono più da dove sta l'HTML | Incorpora le immagini, oppure converti con il file al suo posto |
| Un carattere è uscito come una casella, o per niente | Il font incorporato non ha un glifo per esso | Cambia il font, o il motore, e smetti di usare le emoji in stampa |
| Ogni pagina è A4 sulla tua macchina e Letter sulla loro | Nessuna dimensione di pagina nel documento, quindi il motore ha usato un default della locale | Dichiara `@page { size: A4 }` o passa la dimensione esplicitamente |

### Interruzioni di pagina

Il Markdown non ha un'interruzione di pagina. Non c'è sintassi per essa, nessuna estensione che ne aggiunga una in modo portabile, e nessuna quantità di righe vuote la farà. Forzi un'interruzione mettendo HTML grezzo nel file Markdown:

```markdown
Text before the break.

<div style="break-after: page"></div>

Text on the next page.
```

`break-after: page` è la proprietà CSS attuale; `page-break-after: always` è l'alias più vecchio che i motori più vecchi ancora vogliono, e includerli entrambi è innocuo. Poi vanno storte due cose. La prima è che un convertitore che ignora l'HTML grezzo - la strada LaTeX di Pandoc tra questi - scarta il tuo `div` e l'interruzione con esso; sotto LaTeX vuoi invece `\newpage` in un blocco grezzo. La seconda è che un convertitore che sanifica toglierà l'attributo `style`, perché gli stili inline sono esattamente il tipo di cosa che una allow-list rimuove, e la tua interruzione sparisce senza alcun avviso. [Perché sanificare toglie più degli script](/blog/sanitising-markdown-safely) spiega cosa di solito sopravvive e cosa no.

### Margini

Tre parti impostano i tuoi margini e solo una di esse vince: la finestra di stampa, la regola `@page` del documento, e il bordo non stampabile della stampante fisica. Decidi quale delle tre è autorevole e lascia stare le altre. Per un PDF che verrà letto a schermo, metti il margine nel CSS e imposta la finestra su Predefinito. Per un PDF che verrà stampato su un dispositivo specifico, lascia almeno 10mm e testa su quel dispositivo, perché “Margini: Nessuno” produce un file i cui bordi una stampante laser taglierà.

### Intestazioni e piè di pagina

Questa è la linea di divisione più netta tra le strade. Il browser ti dà una fascia, con il suo contenuto e il suo carattere scelti per te, accesa o spenta. Qualsiasi altra cosa - un titolo di documento a sinistra, un numero di pagina a destra, niente del tutto sulla prima pagina - richiede i margin box del CSS, che i browser non implementano, oppure LaTeX, che lo fa tramite un pacchetto. Se il tuo documento deve portare un'intestazione ricorrente, hai scelto WeasyPrint o LaTeX che tu lo volessi o no.

### I link che sopravvivono

I link cliccabili in un PDF sono annotazioni posate sopra il testo, e se vengono scritte dipende dal motore, quindi l'unico controllo affidabile è aprire il PDF finito e cliccarne uno. I link interni - un indice verso un titolo - dipendono dal fatto che l'HTML abbia id sui titoli, cosa che un convertitore può generare o no. Per un documento che verrà stampato su carta, i link sono invisibili, e una regola di stampa lo risolve:

```css
@media print {
  a[href^="http"]::after {
    content: " (" attr(href) ")";
  }
}
```

Questo stampa l'URL tra parentesi dopo il testo del link, il che è brutto a schermo e l'unica opzione leggibile su carta. I link e le immagini relative hanno la loro propria modalità di fallimento, dato che un PDF non può risolvere `../images/diagram.png` a posteriori: [i percorsi che continuano a funzionare quando il file si sposta](/blog/images-and-links-that-still-work) è la versione di questo problema che incontri per prima.

### Incorporazione dei font

Un PDF porta un sottoinsieme di ogni font che usa davvero, ed è quello che lo fa apparire uguale ovunque - e può portare solo un font che era disponibile quando il file è stato creato. Ne seguono due modalità di fallimento. Un documento che richiede un web font tramite la rete, convertito con la rete non disponibile, ricade in silenzio su qualcos'altro e incorpora quello invece; il PDF non è rotto, semplicemente non è il tuo design. Un documento che nomina uno stack di font di sistema incorpora qualunque cosa avesse quella particolare macchina, quindi tu e un collega producete PDF visivamente diversi dallo stesso Markdown e dallo stesso comando.

La correzione è essere espliciti. Nomina un font, spediscilo insieme al documento o installalo sulla macchina di build, e lascia che lo stack ricada su un serif generico che verrà sostituito in modo prevedibile. Controlla il risultato: qualsiasi lettore di PDF elencherà i font incorporati nelle sue proprietà del documento, e un font elencato come “Type 3” o come non incorporato è un font che il tuo lettore non vedrà.

## Dove la strada del browser fallisce, e cosa costa abbandonarla

Stampare dal browser è il default giusto e ha un soffitto rigido. Vale la pena nominare quel soffitto con precisione, perché la maggior parte delle persone non ha bisogno di andarci oltre e quelle che lo fanno dovrebbero sapere cosa stanno comprando.

| Cosa non puoi fare in un browser | Perché | Cosa costa correggerlo |
| --- | --- | --- |
| Un'intestazione o un piè di pagina ricorrente di tuo disegno | I browser non implementano i margin box del CSS | WeasyPrint, o LaTeX tramite Pandoc |
| Un indice con numeri di pagina | La pagina su cui finisce un titolo non si conosce finché il layout non è fatto | `--toc` di Pandoc, o un motore con contatori di pagina |
| Un riferimento incrociato come “vedi pagina 14” | La stessa ragione | LaTeX, o i contatori di WeasyPrint |
| Produrre il file senza supervisione | Una finestra di dialogo ha bisogno di una persona | Chrome headless, Puppeteer, o WeasyPrint |
| Un PDF da dodici file capitolo | Il browser stampa un documento | Unisci prima il Markdown, oppure unisci i PDF dopo |
| Garantire nessun titolo orfano da nessuna parte | Il controllo delle interruzioni tra i motori è approssimativo | Interruzioni manuali, e un lettore che controlla |

Ogni correzione ha un prezzo, e i prezzi non sono equivalenti. LaTeX ti compra la migliore pagina di questa lista per il costo dell'installazione più grande e un linguaggio di template da imparare; il template è una tantum, ma è una tantum vera e qualcuno deve possederlo. WeasyPrint ti compra regole di pagina in CSS per il costo di una dipendenza Python e un motore di layout che non è un browser, quindi un foglio di stile costruito intorno a grid avrà bisogno di essere riscritto. Chrome headless ti compra la ripetibilità per il costo di un browser nella tua immagine di build, che non è piccolo e ha bisogno di aggiornamenti per le stesse ragioni di sicurezza del tuo laptop. wkhtmltopdf ti compra flag comodi e ti consegna una dipendenza archiviata, che è un debito con una scadenza.

Il caso multi-file è quello in cui le persone incappano prima e meno se lo aspettano. Un manuale di dodici capitoli è dodici file `.md`, e un PDF è un documento, quindi qualcosa deve unirli - nell'ordine giusto, con i livelli dei titoli spostati così che il `#` del capitolo due non competa con il titolo del documento. [Trasformare molti file Markdown in un unico documento](/blog/merging-many-markdown-files) è un lavoro separato dal convertirlo, e farlo nell'ordine sbagliato è come un indice finisce con tre voci “Introduzione”.

## Come scegliere

1. **Parti da chi produce il file.** Se una persona fa il PDF quando serve, stampa dal browser e smetti di leggere; se una macchina lo fa secondo un programma, ti servono Chrome headless, Puppeteer o WeasyPrint, perché una finestra di dialogo non può essere automatizzata.
2. **Chiediti se il documento ha bisogno di elementi di pagina.** Intestazioni ricorrenti, capitoli numerati e un indice con numeri di pagina escludono del tutto il browser, e quel singolo requisito è quello che giustifica installare LaTeX o WeasyPrint.
3. **Conta i glifi prima di contare le funzionalità.** Un documento con caratteri cinesi, greci, cirillici o notazione matematica fallirà sotto pdflatex e funzionerà sotto xelatex, e scoprirlo alla prima build è più economico che scoprirlo alla scadenza.
4. **Fai corrispondere il motore al CSS che hai già scritto.** Se il tuo foglio di stile usa grid, solo un motore browser lo disporrà correttamente; se è un foglio di stile da documento con regole `@page`, WeasyPrint ne farà di più di quanto possa un browser.
5. **Decidi se qualcuno dovrà modificarlo dopo.** Un PDF è definitivo, e se la risposta è sì vuoi `.docx` nel mezzo della pipeline, il che cambia lo strumento e lo sforzo.
6. **Stampa una pagina vera e guardala.** Non l'anteprima - il PDF finito, aperto in un lettore diverso, con il pannello dei font controllato e un link cliccato. Quel singolo test coglie sfondi mancanti, font sostituiti, link morti e righe di codice tagliate tutto insieme, e richiede due minuti.

## Conclusione

Il PDF da Markdown è sempre un lavoro in due passaggi, e la domanda onesta è con quale formato intermedio vuoi discutere. Per un documento con un destinatario, converti il Markdown in un file HTML completo e autonomo e stampalo dal tuo browser con gli sfondi accesi e le intestazioni spente - che è a cosa serve [la conversione da Markdown a HTML di TransformPipe](/), gratis, nel browser, senza niente caricato quando sei disconnesso. Per un documento lungo con elementi di pagina, installa Pandoc e xelatex, scrivi il template una volta e non pensarci mai più. Per un PDF che deve apparire senza nessuno presente, metti le regole di pagina in CSS e lascia che Chrome headless o WeasyPrint facciano la stampa. Tutti e tre sono gratis; la differenza sta interamente in cosa sei disposto a installare e mantenere.

## FAQ

### Come converto Markdown in PDF senza installare niente?

Converti il Markdown in un file HTML completo in un convertitore basato su browser, apri il file, e stampalo in PDF con la finestra di stampa propria del tuo browser. Nessun gestore di pacchetti, nessun terminale, e con un convertitore che funziona lato client il documento non viene mai caricato. Ricordati di attivare la grafica di sfondo e disattivare intestazioni e piè di pagina prima di salvare.

### Perché il mio PDF perde gli sfondi dei blocchi di codice?

Perché “Grafica di sfondo” è disattivata di default nella finestra di stampa, per risparmiare inchiostro sulle stampanti fisiche. Rimuove anche la striatura delle tabelle e i callout colorati, quindi un documento tecnico appare piatto e sbiadito. Attivala nella finestra, oppure passa `printBackground: true` se stai stampando tramite Puppeteer.

### Come forzo un'interruzione di pagina in Markdown?

Non c'è sintassi Markdown per questo. Inserisci HTML grezzo - `<div style="break-after: page"></div>` - e speri che il convertitore lo lasci passare, oppure aggiungi `\newpage` in un blocco LaTeX grezzo se stai convertendo tramite Pandoc. I convertitori che sanificano toglieranno lo stile inline, quindi testa l'interruzione invece di assumere che sia sopravvissuta.

### Pandoc è il modo migliore di convertire Markdown in PDF?

Produce i migliori documenti lunghi, ed è l'opzione più pesante: `pandoc file.md -o file.pdf` ha bisogno di un motore LaTeX installato, e una distribuzione TeX completa è la dipendenza più grande nella maggior parte delle toolchain di documenti. Per un report con sezioni numerate e un indice vale ogni gigabyte. Per un memo di una pagina è più strumento di quanto il lavoro richieda.

### I link ipertestuali funzionano ancora in un PDF generato da Markdown?

Di solito sì, ma dipende dal motore, quindi apri il file finito e cliccane uno. I link interni verso i titoli funzionano solo se l'HTML intermedio ha dato a quei titoli degli id, cosa che non ogni convertitore fa. Per un documento che verrà stampato, aggiungi una regola di stampa che aggiunge l'URL tra parentesi dopo ogni link, perché un link cliccabile su carta è solo testo sottolineato.

### Perché i font appaiono diversi nel PDF rispetto allo schermo?

Un PDF incorpora solo i font disponibili nel momento in cui è stato creato. Se il documento richiedeva un font tramite la rete e la rete non c'era, oppure nominava un font di sistema che la tua macchina ha e il server di build no, il motore ha sostituito qualcosa e non te l'ha detto. Controlla i font incorporati nelle proprietà del documento del tuo lettore PDF e nomina un font che spedisci davvero.

### Posso generare un PDF da Markdown in un job CI?

Sì, e ci sono tre modi sensati: Pandoc con un'immagine TeX, Chrome headless o Puppeteer contro il tuo HTML convertito, oppure WeasyPrint. Chrome dà un output identico a un browser e ha bisogno di un browser nell'immagine; WeasyPrint è una piccola dipendenza Python e ti dà vere regole di pagina in CSS. Qualunque tu scelga, metti la dimensione della carta e i margini nel documento invece che nei flag, così lo stesso file si stampa allo stesso modo anche a mano.
