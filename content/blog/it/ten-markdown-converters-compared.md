---
title: "Dieci convertitori Markdown a confronto per ciò che non leggono"
description: "Ogni confronto conta i formati supportati. Il conto utile è l'altro — che cosa rifiuta ciascuno di dieci convertitori, e se lo dice prima o dopo"
date: 2026-09-22
tag: Conversione
keywords: confronto convertitori markdown, miglior convertitore markdown, pandoc o markitdown, docling confronto, confronto convertitori di documenti, convertire in markdown strumento
---

La pagina iniziale di ogni convertitore conta verso l'alto: trecento formati, venticinquemila conversioni. Il numero è vero e quasi inutile, perché un elenco di formati è un elenco di cose che non daranno errore subito. Ciò che separa questi strumenti è l'altro elenco — quello che nessuno pubblica — di ciò che ciascuno non legge affatto, di ciò che legge e scarta in silenzio, e di quando lo scopri: prima di fidarti del risultato, o tre documenti dopo.

### In breve

Dieci strumenti, verificati sulla loro documentazione il 22 settembre 2026. Pandoc legge `docx` ed `epub`, e dalla 3.8.3 anche `pptx` e `xlsx`, benché il lettore di presentazioni sia alpha e non porti via alcuna nota del relatore. calibre arriva a Markdown attraverso il suo esportatore di testo e rimuove ogni collegamento se non passi due opzioni. LibreOffice Writer sa ormai salvare Markdown direttamente, come CommonMark. Google Docs sa esportarlo, con la metà copia-e-incolla disattivata per impostazione. MarkItDown legge PowerPoint, note del relatore comprese. Docling legge l'elenco di ingressi più ampio che ci sia qui. CloudConvert converte una presentazione in Markdown e non elenca l'EPUB come origine. Turndown legge HTML e nient'altro, di proposito. Mammoth legge il `.docx` e produce HTML, non Markdown. python-pptx ti dà i pezzi e nessun formato di uscita.

Nessuno è cattivo. Ciascuno è stato costruito per una forma di problema diversa, e lo scarto fra quella forma e la tua è il punto in cui le conversioni vanno male.

## Le sette domande che separano davvero

Contare i formati nasconde le differenze. Queste sette no:

1. **Il file lascia la tua macchina?**
2. **Legge il contenitore o solo il testo?** Un `.pptx` è uno zip di parti XML; leggere `ppt/slides/*.xml` e fermarsi fa uno strumento diverso da uno che apre anche `ppt/notesSlides/` e `ppt/media/`.
3. **Che ne è delle immagini** — incorporate, scritte accanto al file, o riferite a una cartella che non esiste?
4. **Dice che cosa ha scartato?** Il silenzio è la proprietà costosa.
5. **Markdown è una destinazione o un sottoprodotto?** Un esportatore di testo a cui è cresciuta una modalità Markdown non si comporta come un convertitore che punta a Markdown.
6. **Sa leggere una cartella come un solo documento?** Un'esportazione da Notion, Confluence o Obsidian sono molti file e un documento.
7. **Bisogna installare, accedere, o nessuna delle due?**

## La tabella

Verificata sulla documentazione di ciascun progetto, 22 settembre 2026.

| Strumento | Gira | Legge pptx | Legge epub | Markdown è | Immagini |
| --- | --- | --- | --- | --- | --- |
| Pandoc | In locale | Sì, dalla 3.8.3; senza note | Sì | Una destinazione a pieno titolo | `--extract-media` le scrive |
| calibre | In locale | No | Sì | Una modalità di uscita TXT | Riferimenti solo con un'opzione |
| LibreOffice Writer | In locale | Apre la presentazione, salva da Writer | Sì | Un filtro di salvataggio, CommonMark | Non trattate nella documentazione |
| Google Docs | Ospitato | La apre, esporta da Docs | No | Scaricamento e importazione | Non trattate nella documentazione |
| MarkItDown | In locale | Sì, con le note | Sì | L'unica destinazione | Nomi di file, o URI data su richiesta |
| Docling | In locale | Sì | Sì | Una uscita fra diverse | Incorporate o riferite |
| CloudConvert | Ospitato | Sì | Non elencato per md | Una uscita fra centinaia | Lato server, secondo il servizio |
| Turndown | Una libreria | No | No | L'unica destinazione | Portate dentro dall'HTML |
| Mammoth | Una libreria | No | No | Non prodotto — l'HTML sì | Una richiamata che scrivi tu |
| python-pptx | Una libreria | Sì, note comprese | No | Non viene prodotto niente | `shape.image.blob`, tocca a te |

## Che cos'è ciascuno, in un paragrafo

**Pandoc** è l'implementazione di riferimento dell'idea che i documenti abbiano una struttura comune. Il suo elenco di formati è asimmetrico in un modo che conviene verificare invece che ricordare: `docx` ed `epub` sono lettori e scrittori, e `pptx` è stato solo uno scrittore finché la versione 3.8.3 non gli ha aggiunto un lettore il 1º dicembre 2025, insieme a uno per `xlsx`. Quel lettore è marcato alpha e non apre alcuna parte di note: la presentazione si converte, le sue note del relatore no. Per tutto ciò che legge è lo strumento più fedele qui presente e il più adatto agli script. [Alternative più leggere](/blog/pandoc-alternatives-for-markdown-to-html) esistono per il caso del file singolo.

**calibre** converte libri elettronici, e a Markdown si arriva attraverso la sua uscita di testo: `--txt-output-formatting=markdown`. Il trucco è documentato e in pratica muto — con l'uscita in testo semplice i collegamenti vengono sempre rimossi, quindi senza `--keep-links` e `--keep-image-references` ottieni un libro pulito, leggibile, privo di collegamenti, e nessun avviso che ne contenesse quattrocento. È anche il lettore più indulgente di EPUB malformati, cosa che conta più di quanto dovrebbe.

**LibreOffice Writer** salva ormai Markdown direttamente: File, Salva con nome, Documento Markdown (.md), e la documentazione dichiara che implementa la specifica CommonMark. È un cambiamento di peso — per anni il consiglio corrente è stato di passare per l'HTML — e la documentazione non dice che ne sia di immagini e tabelle, che è esattamente il genere di lacuna da provare sul proprio documento prima di affidargliene cinquanta.

**Google Docs** importa ed esporta Markdown, con l'esportazione attiva per impostazione; “Copia come Markdown” e “Incolla da Markdown” sono separati e spenti finché non li accendi in Strumenti, Preferenze, Abilita Markdown. È il convertitore che quasi tutti hanno già, e i suoi limiti sono quelli ovvi: il documento è già sul server di qualcuno, e ciò che Docs non ha saputo rappresentare è andato perso all'ingresso, non all'uscita.

**MarkItDown**, di Microsoft, punta direttamente a Markdown e legge PowerPoint come si deve — compreso `slide.has_notes_slide`, che scrive sotto un'intestazione `### Notes:`. Le immagini escono per impostazione come riferimenti a nomi di file, e come URI data su richiesta; i grafici diventano tabelle dove riesce a leggerli e un esplicito `[unsupported chart]` dove non riesce. Quest'ultimo dettaglio è la buona abitudine: dice ciò che non ha potuto fare.

**Docling**, di IBM, legge l'elenco più ampio qui — formati Office, OpenDocument, PDF, EPUB, HTML, immagini e altro — e scrive Markdown fra diverse uscite. È il più pesante degli strumenti locali, e quello da cercare quando l'ingresso è un mucchio di formati mescolati anziché uno noto.

**CloudConvert** converte una presentazione in Markdown, cosa che quasi nessuno qui sa fare, oltre a `docx`, `odt`, `rtf`, `pdf` e una ventina di altri. L'EPUB non è fra le origini che annuncia per l'uscita Markdown. È un server, quindi il documento viene caricato, e quella è la prima domanda e non l'ultima. [Se un convertitore online è sicuro](/blog/is-an-online-converter-safe) parla di come verificarlo invece di darlo per fatto.

**Turndown** converte HTML in Markdown e non accetta altro. Non è un limite, è il progetto, ed è per questo che quasi ogni altro strumento JavaScript del settore finisce con Turndown o un parente sotto. [Le librerie da HTML a Markdown](/blog/turndown-and-html-to-markdown-libraries) si distinguono soprattutto nei casi scomodi.

**Mammoth** legge il `.docx` e produce HTML, deliberatamente: proietta gli stili di Word su elementi semantici e ignora il dettaglio visivo. Non produce Markdown, quindi è metà di una catena, e la sua documentazione è chiara: lo scarto fra la struttura di un `.docx` e quella dell'HTML fa sì che i documenti complicati non si convertano perfettamente. [In che cosa mammoth e i parser docx differiscono](/blog/mammoth-js-and-docx-parsers) dice il resto.

**python-pptx** legge una presentazione come si deve — ordine delle diapositive risolto tramite l'elenco degli identificatori, `Slide.notes_slide.notes_text_frame` per le note, `shape.image.blob` per le immagini — e non produce niente. È una libreria per costruirsi un convertitore, e se compare in un confronto fra convertitori è perché per un lavoro ricorrente su PowerPoint è spesso la risposta giusta. [Convertire PowerPoint in Markdown](/blog/convert-powerpoint-to-markdown) contiene uno script che gira.

## Dove sta lo strumento dietro questo sito, compreso ciò che non fa

TransformPipe converte quindici cose da e verso Markdown nel browser, il che risponde alle domande uno, tre e sette: il file non viene caricato, le immagini sono incorporate come URI data perché il risultato sia un file solo, e non c'è niente da installare. Legge i contenitori anziché il testo — ordine delle diapositive da `<p:sldIdLst>`, titoli dei capitoli dal documento di navigazione di un EPUB, risorse Evernote accoppiate per MD5 — e legge una cartella di esportazione come un documento unico con indice, il che risponde alla domanda sei.

L'altra metà, onestamente:

- **Nessun PDF in ingresso.** Un PDF sono glifi a certe coordinate e ricostruirne la struttura è un'altra disciplina. CloudConvert, Docling e MarkItDown leggono tutti il PDF; questo no.
- **Nessun LaTeX, nessun reStructuredText, nessun `.doc` o `.ppt` vecchio.** Pandoc copre i primi due, LibreOffice gli altri due.
- **Un tetto di quattro megabyte** su un documento salvato, che deriva da un limite di piattaforma e non da una scelta, di cui due megabyte per le immagini.
- **Non è uno strumento per lotti.** Convertire cinquecento file appartiene a uno script con Pandoc o Docling dentro, non a una scheda del browser.
- **Lato browser significa che lavora la tua macchina,** quindi un file molto grande è limitato dalla memoria della scheda e non dalla pazienza di un server.

Un confronto in cui lo strumento che si vende vince ogni riga non è un confronto. Quelle cinque righe sono quelle in cui lo strumento di qualcun altro è la risposta giusta, e sapere su quale riga ti trovi è tutto l'esercizio.

## Come scegliere in una passata

- **Il documento è riservato.** Lato browser o fuori rete. Questo elimina i servizi ospitati prima di ogni domanda sulle funzioni, e non è questione di fidarsi di una politica: si osserva nella scheda di rete.
- **La conversione si ripete.** Pandoc o Docling in uno script. Una pagina web che una persona deve aprire non è una catena di lavorazione.
- **L'ingresso è un mucchio di formati mescolati, PDF compresi.** Docling.
- **È una presentazione e le note contano.** MarkItDown, python-pptx, o un convertitore che apra le parti delle note.
- **È un libro.** Pandoc con `--extract-media`, o calibre con entrambe le opzioni `--keep`.
- **È un file, adesso, e vuoi vedere il risultato.** Un convertitore lato browser, perché il giro fra caricamento, coda e scaricamento dura più della conversione.
- **Lo stai integrando in un software.** Una libreria — Turndown, Mammoth, python-pptx — accettando che ora mantieni un convertitore.

## Il documento di prova da conservare

Qualunque cosa scegli, il confronto onesto richiede dieci minuti. Costruisci un documento che contenga le sei cose che si rompono: un'intestazione venuta da testo in grassetto anziché da uno stile di titolo, una tabella con una cella unita, un'immagine, una nota a piè di pagina, un elenco annidato e un collegamento a un altro file della stessa esportazione. Passalo per due o tre candidati e leggi l'uscita.

Ogni differenza della tabella qui sopra si presenterà in quel solo documento, e si presenterà per i tuoi documenti anziché per quelli di un recensore. Il conteggio dei formati sulla pagina iniziale non te ne avrebbe detto niente. Per il campo più ampio — i servizi ospitati, le suite per ufficio e il Salva con nome del browser stesso — [la panoramica dei convertitori di documenti online](/blog/best-online-document-converters) li ordina invece per dove finisce il file.
