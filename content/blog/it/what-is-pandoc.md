---
title: "Che cos'è Pandoc, e quando non ti serve"
description: "Pandoc è un programma con cinquanta lettori, sessantasei scrittori e un modello di documento in mezzo. Che cosa ti dà, e per quali lavori è troppo."
date: 2026-09-22
tag: Conversione
keywords: che cos'è pandoc, pandoc, pandoc online, applicazione pandoc, usare pandoc, installare pandoc, alternativa a pandoc
---

Quasi tutto ciò che si scrive su Pandoc parte da un comando che qualcuno vuole lanciare. Questo testo comincia un passo prima, perché il comando ha senso solo quando sai che cos’è il programma: un unico binario che legge cinquanta formati, ne scrive sessantasei e non converte mai l’uno nell’altro in modo diretto.

### In breve

Pandoc è un programma a riga di comando e una libreria Haskell. Legge un documento in una rappresentazione interna e poi riscrive quella rappresentazione in un altro formato. È software libero sotto GPL, scritto da John MacFarlane e pubblicato dal 2006. Non esiste un’applicazione, né un account, né un servizio online ufficiale: una dimostrazione su `pandoc.org/try` e nient’altro. Lo vuoi quando il lavoro è una matrice di formati, le citazioni bibliografiche, un Word con il modello di un altro reparto o la stessa conversione mille volte. Non lo vuoi quando il lavoro è un file, una volta sola, su una macchina dove non puoi installare nulla, oppure quando il documento è una scheda che stai guardando e non un file che possiedi.

## Un programma, due elenchi e un documento in mezzo

Il progetto è una sola idea e tutto il resto ne discende. Pandoc non converte Markdown in HTML. **Legge** il Markdown in un albero sintattico astratto — un documento fatto di titoli, paragrafi, elenchi, tabelle, collegamenti e note — e poi **scrive** quell’albero come HTML. La metà che legge e la metà che scrive non sanno nulla l’una dell’altra.

Ecco perché l’elenco dei formati è così lungo senza che nessuno abbia scritto mille convertitori. Cinquanta lettori e sessantasei scrittori non sono 116 lavori: sono 116 lavori che producono 3.300 conversioni. Nessuno ha scritto un convertitore da quaderno Jupyter a wiki di Jira. Esce dall’incrocio.

Spiega anche le due proprietà che sorprendono:

**Un formato è un lettore o uno scrittore, e non automaticamente entrambi.** LaTeX, DocBook e Word sono entrambi. Beamer, ICML e reveal.js sono solo scrittori. RIS ed EndNote XML sono solo lettori. Chiedere una conversione per cui non esiste un lettore dà un errore invece di un risultato scadente, ed è il comportamento onesto.

**Ciò che Pandoc non sa rappresentare è perso in lettura, non in scrittura.** Se i commenti di un file Word non entrano nell’albero, nessun formato di uscita potrà stamparli. Per questo “Pandoc mi ha perso la tal cosa” è quasi sempre una domanda rivolta al lettore.

## L’elenco cambia, e quello che ricordi è scaduto

Il 1º dicembre 2025 la versione 3.8.3 ha aggiunto `pptx` e `xlsx` come formati **di ingresso**. Per diciannove anni una presentazione di PowerPoint è stata una cosa che Pandoc scriveva e non sapeva leggere, e i consigli che girano — compresi, fino a stamattina, quattro articoli di questo sito — lo dicono ancora.

L’abitudine utile quindi non è memorizzare la matrice, ma chiedere al programma:

```bash
pandoc --list-input-formats
pandoc --list-output-formats
pandoc --version
```

Tre comandi, e la risposta vale per la versione che hai davvero. Gli stessi elenchi stanno nei menu di `pandoc.org/try`, il modo più rapido di verificare senza installare niente: `pptx` e `xlsx` compaiono lì nell’elenco “from” (verificato il 22 settembre 2026).

Un avvertimento, se accetti quell’offerta per una presentazione: il lettore di PowerPoint apre le diapositive, le loro tabelle, le loro immagini e la loro SmartArt, e non apre affatto la parte delle note. [Che cosa succede a una presentazione e alle sue note del relatore](/blog/convert-powerpoint-to-markdown) è raccontato altrove per esteso; entrambi i lettori nuovi si dichiarano alpha nel proprio sorgente.

## Non esiste un’applicazione Pandoc, né Pandoc online

Si cercano entrambe le cose, quindi la risposta va data chiara: Pandoc è un programma a riga di comando. Non esiste un’applicazione grafica ufficiale né un servizio ospitato ufficiale.

Quello che c’è su `pandoc.org/try` è una dimostrazione: una casella di testo, due menu e un pulsante, per provare una conversione su un frammento. Non è un convertitore di file e non pretende di esserlo.

Qualunque altra cosa si chiami “Pandoc online” è il server di qualcuno con Pandoc installato sopra. Costruirlo è legittimo, e noi costruiamo qualcosa di vicino, ma la domanda cambia del tutto: il tuo documento diventa un file su una macchina che non controlli, con una politica di conservazione che non hai letto. [Come verificare dove un convertitore manda davvero il tuo file](/blog/is-an-online-converter-safe) vale per tutti.

## I quattro comandi che coprono quasi tutto

```bash
# Markdown verso una vera pagina HTML, tutto dentro un file
pandoc notes.md -o notes.html --standalone --embed-resources

# Un file Word verso Markdown, con le immagini scritte accanto
pandoc report.docx -t gfm -o report.md --extract-media=media

# Markdown verso Word, con il modello di qualcun altro
pandoc paper.md -o paper.docx --reference-doc=template.docx

# Markdown con citazioni verso un PDF
pandoc paper.md --citeproc --bibliography=refs.bib -o paper.pdf
```

Due note. `--self-contained` era il nome della seconda opzione della prima riga; oggi è un sinonimo deprecato di `--embed-resources --standalone`, quindi una risposta di quattro anni fa funziona ancora e ti avvisa mentre lo fa.

E l’ultima riga nasconde un’installazione. **Markdown verso PDF non è uno degli scrittori di Pandoc.** Il PDF nasce passando il documento a un motore separato, e il valore predefinito è un motore TeX: di solito uno scaricamento molto più grande di Pandoc stesso, e il motivo più comune per cui qualcuno conclude che Pandoc sia più di quanto volesse. `--pdf-engine` può puntare a `weasyprint`, `wkhtmltopdf`, `typst`, `prince`, `pagedjs-cli` o `context`, molti dei quali assai più leggeri. [Le strade da Markdown a PDF](/blog/markdown-to-pdf) le mette a confronto.

## Quando non va bene nient’altro

- **Una matrice di formati.** Una sorgente, più uscite, tenute allo stesso passo: HTML per il sito, DOCX per chi revisiona, EPUB per il treno. Tutto ciò che è più leggero fa bene una sola uscita.
- **Le citazioni.** `--citeproc` con BibTeX, BibLaTeX o CSL JSON e centinaia di stili CSL. Nient’altro in questa categoria ha un processore di citazioni.
- **Un modello aziendale per Word.** `--reference-doc` prende caratteri, stili dei titoli e spaziature da un `.docx` esistente. Se il modello è arrivato dall’ufficio legale o dal marketing, quell’opzione è da sola il motivo per installarlo.
- **I filtri.** Un filtro Lua o JSON riscrive il documento finché è ancora un albero: rinumerare ogni tabella, alzare di livello ogni titolo, riscrivere ogni collegamento interno. La versione a colpi di espressioni regolari funziona fino al giorno in cui non funziona più.
- **Il volume.** È un binario che legge dallo standard input e scrive sullo standard output. Mille file sono un ciclo `for`.

## Quando è più di quanto il lavoro richieda

- **Un file, una volta.** Portare un singolo documento fino a HTML significa `--standalone`, poi un foglio di stile, poi magari un modello scritto nel linguaggio di modelli di Pandoc. È una preparazione reale e non si accorcia perché il compito è piccolo. [Le alternative più leggere](/blog/pandoc-alternatives-for-markdown-to-html) sono ordinate in base alla parte che stai cercando di evitare.
- **Una macchina su cui non puoi installare.** Un portatile gestito, un telefono, la scrivania di un altro.
- **Un documento che non è un file.** Una pagina wiki, un ticket, una discussione: tutto ciò che esiste solo renderizzato nel browser va prima salvato perché Pandoc lo veda, e salvarlo è la metà difficile.
- **Una conversione di cui vuoi vedere il risultato prima di fidarti.** Pandoc è uno strumento da pipeline: ottimo quando sai già che cosa vuoi, costoso mentre lo stai ancora scoprendo.

## Dove si colloca questo sito

TransformPipe converte nel browser: quindici formati in ingresso, Markdown e un file HTML autonomo in uscita, e il file non lascia la macchina. Questo copre il centro dell’ultimo elenco — un documento, nessuna installazione, un risultato che vedi — e niente del primo. Qui non c’è un processore di citazioni, né un linguaggio di modelli, né una matrice di formati, né il PDF in alcuna direzione.

Il riassunto onesto è che sono strumenti diversi per due metà dello stesso problema, e il confine si dice facilmente: se la conversione si ripeterà la settimana prossima, scrivila con Pandoc. Se avviene una volta sola, nei prossimi due minuti, non dovresti dover installare nulla per farla.
