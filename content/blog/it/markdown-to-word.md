---
title: "Da Markdown a Word: come ottenere un .docx che si può modificare"
description: "Portare Markdown in un .docx che un revisore può modificare: Pandoc con un documento di riferimento, la strada HTML, Google Docs, e cosa si perde tornando a Markdown"
updated: 2026-10-21
date: 2026-08-24
tag: Pubblicazione
keywords: markdown in word, markdown in docx, convertire markdown in documento word, pandoc reference docx, da md a docx, markdown in word online, template pandoc markdown word
---

Nessuno converte Markdown in Word per piacere proprio. Succede perché qualcun altro — un avvocato, un cliente, un capo reparto, un ente regolatore — lavora in Word, traccia le modifiche in Word, e non leggerà un file che arriva come testo pieno di cancelletti. La conversione è una concessione, e la domanda è quale concessione costi meno.

### In breve

Usa Pandoc con un documento di riferimento: `pandoc report.md --reference-doc=house.docx -o report.docx`. Il documento di riferimento è un `.docx` qualunque i cui stili Pandoc copia nell'output, così il file che il revisore apre porta le intestazioni, i margini e il corpo testo della tua organizzazione invece dei default di Pandoc. La strada converti-in-HTML-e-apri-in-Word è più rapida e produce un documento senza un set di stili utilizzabile, il che va bene per un memo e male per qualunque cosa dovrà essere ristilizzata. E sappi prima di cominciare che il viaggio di ritorno è con perdita: le modifiche tracciate si possono leggere dal `.docx` restituito, ma arrivano come annotazioni in linea che nessuno strumento Markdown può accettare o rifiutare, quindi trattale come consigli da riapplicare a mano.

Markdown e `.docx` non sono due codifiche della stessa cosa. Markdown è un piccolo insieme di marcature strutturali — questo è un titolo, questo è un elenco, questo è un link — e nient'altro. Un `.docx` è un archivio zip di XML in cui ogni paragrafo punta a uno stile con un nome, gli stili vivono in un foglio di stile, la numerazione vive nella sua parte, e il tutto porta dimensione della pagina, margini, intestazioni, piè di pagina e una cronologia delle revisioni. Andare dal primo al secondo significa inventare tutto ciò che il secondo ha e il primo no.

Quell'invenzione è l'intero lavoro, ed è dove le strade divergono. Pandoc inventa a partire da un template che controlli tu. Word, aprendo un file HTML, inventa a partire dal CSS e dai suoi stili orientati al web. Google Docs inventa a partire dagli stili di Google. Il pulsante di export di un editor di solito inventa a partire dai default di Pandoc, perché la maggior parte di questi editor è Pandoc con un menu davanti.

La seconda cosa da sapere subito: se il revisore deve solo leggere il documento, niente di tutto questo si applica. Un PDF o una pagina HTML autonoma sono un artefatto migliore di un `.docx`, e [convertire Markdown in PDF](/blog/markdown-to-pdf) è una strada più corta con meno cose che possono andare storte. Word guadagna la sua complessità solo quando qualcuno deve modificare.

## Perché questo tema salta fuori: il revisore lavora con le modifiche tracciate

La richiesta quasi mai è "per favore manda il formato Word". È "devo poter commentare questo", e nella maggior parte delle organizzazioni commentare significa la scheda Revisione di Word: inserimenti con sottolineatura colorata, cancellazioni barrate, un margine pieno di palloncini di commento con dei nomi sopra, e un pulsante Accetta/Rifiuta per ciascuno. Questo flusso di lavoro ha decenni, è quello su cui sono formati i team legali e di conformità, e non ha equivalente in un file Markdown.

Git ha un equivalente, ovviamente. Una pull request con commenti sulle righe fa lo stesso lavoro meglio e conserva la cronologia. Ma non puoi mandare una pull request all'ufficio legale di qualcuno, e la riunione in cui spieghi che dovrebbero impararne una è una riunione che perderai. Quindi il documento lascia il repository come `.docx` e torna come `.docx` con le modifiche di qualcun altro dentro, e la domanda tecnica interessante è cosa fare in quel momento.

Sbagliare questo passaggio in un modo specifico e costoso è comune. Un team esporta in Word, il revisore passa due giorni a segnarlo, il file torna indietro, e il team scopre che riconciliare quaranta inserimenti tracciati con una fonte Markdown è lavoro manuale che nessuno aveva messo in conto — o peggio, che qualcuno ha accettato tutte le modifiche, ha riconvertito, e ha prodotto un commit che riscrive ogni riga del file perché il convertitore va a capo in modo diverso. Decidere il percorso di ritorno prima di inviare qualcosa è la differenza fra una revisione e un incidente.

## Confronto rapido: il bigliettino

| Strada | Ideale per | Di cosa ha bisogno | Cosa costa |
| --- | --- | --- | --- |
| Pandoc con `--reference-doc` | Qualunque documento che deve somigliare a quelli della tua organizzazione | Pandoc installato, un template `.docx` modificato da te | Un pomeriggio per costruire il template, una volta sola |
| Pandoc senza documento di riferimento | Una bozza dove l'aspetto non conta | Pandoc installato | Gli stili di default di Pandoc, che non somigliano a niente in particolare |
| Convertire in HTML, aprire in Word | Un breve memo che nessuno ristilizzerà | Un convertitore da Markdown a HTML e Word | Nessun set di stili utilizzabile; il CSS arriva come formattazione diretta |
| HTML autonomo, poi LibreOffice headless | Automatizzare quanto sopra su un server | LibreOffice installato, nessuna licenza Word | L'interpretazione di LibreOffice del tuo CSS |
| Google Docs come intermediario | Team già dentro Google Workspace | Un account Google | Il documento sta sui server di Google; ottieni gli stili di Google |
| Typora, VS Code ed editor simili | Un file solo, dall'app che già usi | L'editor, più Pandoc per il `.docx` | Di solito nessun modo di passare un documento di riferimento |
| Writage, dentro Word | Revisori che non lasceranno mai Word | Un plugin Word a pagamento sulla loro macchina | Un'installazione per macchina e una licenza |
| Incollare il Markdown renderizzato in Word | Due paragrafi, subito | Un'anteprima renderizzata e gli appunti | Formattazione diretta ovunque; le immagini possono sparire |
| Markdown in PDF invece | Un revisore che legge ma non modifica | Una qualunque delle strade PDF | Nessuna modifica, nessun commento nel file stesso |
| python-docx, costruendo il file da soli | Un documento generato con requisiti esatti | Python, e una specifica | Ora si sta scrivendo un writer per Word |

## Pandoc e il documento di riferimento, spiegato per bene

Pandoc è la vera risposta qui, e il documento di riferimento è la parte che la gente salta. Convertire senza uno funziona — `pandoc report.md -o report.docx` produce un file Word valido — e produce un documento che sembra un documento di Pandoc: un Calibri-simile, spaziato generosamente, titoli in un blu che nessuno ha scelto. I revisori lo leggono come una bozza arrivata da fuori l'organizzazione, il che è vero.

### Cosa conserva un .docx che Markdown non ha

Rinomina un `.docx` in `.zip` e aprilo. Dentro, `word/document.xml` contiene il testo, e quasi ogni paragrafo al suo interno porta un elemento `w:pStyle` che nomina uno stile: `Heading 1`, `Body Text`, `Source Code`. Lo stile in sé — font, dimensione, spaziatura, colore, keep-with-next, livello di struttura — vive in `word/styles.xml`. Le definizioni di numerazione per gli elenchi vivono in `word/numbering.xml`. Dimensione della pagina, margini, intestazioni e piè di pagina vivono nelle proprietà di sezione.

Questa indirezione è il motivo per cui i documenti Word sono modificabili in un modo in cui un PDF non lo è. Un revisore che cambia lo stile `Heading 2` cambia in un colpo solo ogni titolo di secondo livello. Un documento la cui formattazione è stata applicata direttamente — grassetto qui, 14pt lì — sembra identico e non si può ristilizzare affatto, e ogni strada di questo articolo eccetto Pandoc-con-un-template produce una certa quantità di quella formattazione diretta.

### Come funziona --reference-doc

`--reference-doc=FILE` è documentato così: "Usa il file specificato come riferimento di stile nel produrre un file docx o ODT." Quello che Pandoc prende da quel file sono i suoi fogli di stile e le sue proprietà del documento, inclusi margini, dimensione della pagina, intestazione e piè di pagina (verificato su pandoc.org, l'8 settembre 2026). Il tuo contenuto viene scritto dentro quel guscio.

Il meccanismo è diretto, ed è questo il suo pregio. Pandoc scrive un paragrafo, lo etichetta `Heading 1`, e Word cerca `Heading 1` nel foglio di stile arrivato dal tuo file di riferimento. Non c'è nessuno strato di mappatura da configurare e nessun linguaggio di template da imparare. Se lo stile esiste nel documento di riferimento, il tuo output lo usa. Se non esiste, Word rende un riferimento a uno stile che non trova come testo `Normal` semplice — motivo esatto per cui i blocchi di codice escono come testo del corpo quando qualcuno usa la carta intestata aziendale come documento di riferimento senza aggiungerci uno stile `Source Code`.

### I nomi di stile che Pandoc cerca

Questo è l'elenco che vale la pena appendere al muro, perché un documento di riferimento vale quanto la sua copertura di questa lista. Gli stili di paragrafo che Pandoc usa nel writer docx sono `Normal`, `Body Text`, `First Paragraph`, `Compact`, `Title`, `Subtitle`, `Author`, `Date`, `Abstract`, `AbstractTitle`, `Bibliography`, da `Heading 1` a `Heading 9`, `Block Text`, `Footnote Block Text`, `Source Code`, `Footnote Text`, `Definition Term`, `Definition`, `Caption`, `Table Caption`, `Image Caption`, `Figure`, `Captioned Figure` e `TOC Heading`. Gli stili di carattere sono `Default Paragraph Font`, `Verbatim Char`, `Footnote Reference`, `Hyperlink` e `Section Number`. C'è un solo stile di tabella, chiamato `Table` (verificato su pandoc.org, l'8 settembre 2026).

Leggi quell'elenco come una mappa di ciò che Pandoc può esprimere. `Source Code` e `Verbatim Char` sono il motivo per cui i blocchi tra fence e il codice inline possono sembrare codice. `Block Text` è la tua citazione. `Image Caption` e `Captioned Figure` sono ciò che diventa `![Una didascalia](diagram.png)`. `Definition Term` e `Definition` contano solo se usi la sintassi degli elenchi di definizione di Pandoc. Se il tuo template aziendale non definisce nessuno di questi, quello è il lavoro di un pomeriggio.

### Costruire un documento di riferimento, passo per passo

1. **Parti dal default di Pandoc invece che da un file vuoto**, con `pandoc -o custom-reference.docx --print-default-data-file reference.docx`. Contiene già ogni stile dell'elenco sopra, cablato correttamente, comprese le definizioni di numerazione degli elenchi — quindi stai ristilizzando un documento che funziona invece di scoprire tre giorni dopo che gli elenchi numerati escono come paragrafi semplici.
2. **Aprilo in Word e modifica gli stili, mai il testo.** Fai clic destro su uno stile nella galleria Stili, scegli Modifica, e cambia lì font, dimensione, spaziatura e colore. La formattazione applicata direttamente al testo di esempio non serve a niente, perché il tuo contenuto lo sostituisce.
3. **Fai prima i titoli e controlla il livello di struttura su ciascuno.** Il riquadro di navigazione di Word, il sommario e ogni esportazione PDF che farai in seguito leggono tutti i livelli di struttura, quindi un `Heading 2` stilizzato per sembrare un titolo ma lasciato al livello del testo del corpo produrrà un documento che non si può navigare.
4. **Imposta dimensione della pagina, margini, intestazione e piè di pagina nel documento di riferimento, non a ogni conversione.** Sono proprietà del documento e Pandoc le trasporta, il che significa che il documento di riferimento è anche dove vive l'arredamento delle tue pagine — un piè di pagina con un numero di documento, per dire, compare su ogni conversione senza essere menzionato in nessun comando.
5. **Se devi partire da un template aziendale invece, aggiungi gli stili che gli mancano, con lo stesso nome.** I template aziendali hanno quasi sempre `Heading 1` fino a `Heading 4` e niente altro dell'elenco; `Source Code`, `Verbatim Char`, `Block Text`, `Image Caption`, `Table Caption` e lo stile di tabella `Table` sono le lacune abituali, e ogni stile mancante è una categoria di contenuto che arriva senza formattazione.
6. **Prova con un documento che usa tutto.** Un file con nove livelli di titolo, un elenco numerato annidato dentro uno puntato, una citazione, un blocco di codice tra fence con un linguaggio, codice inline, una nota a piè di pagina, un link, un'immagine con didascalia e una tabella a tre colonne. Convertilo, aprilo, e guarda. Quel file appartiene al repository accanto al template.
7. **Metti il documento di riferimento nel repository insieme al Markdown.** È un input di build, andrà alla deriva quando qualcuno cambia il marchio, e un template che vive nella cartella Download di una persona sola è un template che smette di esistere quando quella persona se ne va.

### I flag che contano per il writer docx

| Flag | Cosa fa |
| --- | --- |
| `--reference-doc=FILE` | Stili e proprietà del documento arrivano da `FILE` |
| `--toc` | Inserisce un sommario costruito dalle intestazioni |
| `-N`, `--number-sections` | Numera i titoli di sezione; il manuale cita Docx fra gli output supportati |
| `--highlight-style=NAME` | Sceglie il tema di evidenziazione della sintassi per i blocchi di codice; `--list-highlight-styles` stampa le opzioni |
| `--resource-path=DIRS` | Dove cercare le immagini richiamate con un percorso relativo |
| `--dpi=NUMBER` | Conversione pixel-pollici per il dimensionamento delle immagini; il default è 96 |
| `--lua-filter=FILE` | Riscrive il documento a metà conversione, prima che lo veda il writer |
| `--metadata-file=FILE` | Fornisce titolo, autore e data senza toccare il Markdown |

Tutte queste sono opzioni Pandoc attuali (verificato su pandoc.org, l'8 settembre 2026). Vale la pena sapere altre due cose sul writer. Le immagini vengono portate dentro il pacchetto `.docx`, quindi l'output è un file autonomo invece di un documento con link al tuo filesystem — ma solo se Pandoc riesce a trovarle, ed è a questo che serve `--resource-path`, motivo per cui vale la pena leggere [immagini e link che continuano a funzionare](/blog/images-and-links-that-still-work) prima di spostare una cartella. E l'HTML grezzo nel tuo Markdown viene scartato: un `<div>` o un `<br>` arriva al writer HTML e non a quello docx, quindi un file Markdown che si appoggia all'HTML inline per il layout perde quel layout in silenzio.

Due extra di Pandoc sono davvero utili una volta che le basi funzionano. Un div tra fence con un attributo `custom-style` applica al suo contenuto qualunque stile Word tu voglia — `::: {custom-style="Warning"}` avvolge un blocco nello stile di paragrafo `Warning` del tuo template — e l'equivalente per gli span tra parentesi quadre fa lo stesso per gli stili di carattere. E [le tabelle](/blog/markdown-tables-that-survive-conversion) ottengono lo stile di tabella `Table`, che è l'unica formattazione tabellare che avrai, quindi definiscilo bene e non aspettarti niente di elaborato sulla larghezza delle colonne.

**Per chi è?** Per chiunque farà questa conversione più di due volte. Il template è un costo fisso pagato una volta e ammortizzato su ogni documento successivo, ed è la sola strada qui che produce un `.docx` già negli stili della tua organizzazione, che un utente Word può poi continuare a ristilizzare dalla galleria Stili.

## La strada HTML: converti in HTML, poi aprilo in Word

Word apre file `.html`. Non è un trucco e non è nuovo; funziona da quando Word ha imparato a salvare pagine web. Converti il tuo Markdown in HTML, fai doppio clic sul risultato, e Word lo renderizza come un documento che puoi poi salvare come `.docx` da File, Salva con nome.

È davvero la strada più veloce, non richiede installazioni oltre a un convertitore basato su browser, e per un documento breve va bene. È anche la strada che produce il file meno modificabile, e vale la pena essere precisi sul perché.

**Word mappa l'HTML importato sui suoi stili integrati orientati al web**, non su quelli del tuo template. I paragrafi del corpo tendono ad arrivare come `Normal (Web)`, i blocchi preformattati come `HTML Preformatted`. Il `Body Text` della tua organizzazione non è coinvolto. Il documento sembra ragionevole e non appartiene a nessun template.

**Il CSS diventa formattazione diretta.** Un foglio di stile che dice `h2 { color: #1a4f7a; font-size: 20px }` non diventa una definizione di stile `Heading 2`; diventa formattazione applicata a quei paragrafi. Il revisore che apre la galleria Stili per cambiare il colore del titolo non trova niente da cambiare, e chi eredita il documento più avanti non può ristilizzarlo affatto.

**Le tabelle arrivano senza uno stile di tabella.** I bordi e la spaziatura arrivano dal tuo CSS come formattazione diretta delle celle, quindi applicare l'aspetto tabellare aziendale significa selezionare ogni tabella e scegliere uno stile a mano — il che scarta anche tutto quello che il tuo CSS aveva fatto.

**Le immagini sopravvivono solo se sono dentro il file.** Un file HTML che richiama `diagram.png` accanto a sé funziona finché il file non viene spedito per email da solo, a quel punto il revisore ottiene un segnaposto. Un export HTML autonomo, con le immagini incorporate come data URI e gli stili in un blocco `<style>`, è la versione di questa strada che viaggia davvero.

**Il file resta HTML finché qualcuno non lo converte.** Se mandi l'`.html` e il revisore lo modifica e lo salva, sta ancora modificando HTML, e l'output HTML di Word ha le sue abitudini. Salva come `.docx` tu stesso prima di inviare, e controlla il risultato invece di darlo per scontato.

**L'impostazione della pagina viene dal nulla.** Nessuna dimensione della pagina, nessun margine, nessuna intestazione o piè di pagina, perché l'HTML non ne aveva. Per un documento che verrà stampato o impaginato, quelle sono decisioni che ora qualcuno deve prendere a mano.

Per l'automazione, la stessa strada funziona senza Word del tutto: produci HTML autonomo, poi `soffice --headless --convert-to docx report.html`. LibreOffice fa un lavoro dignitoso e la sua interpretazione del tuo CSS è la sua propria, quindi provala una volta invece di fidartene.

**Per chi è?** Per documenti occasionali dove il revisore commenterà e non ristilizzerà — un memo di due pagine, una specifica inviata per un singolo giro di osservazioni. Non per niente che entri in un insieme di documenti governato da un template.

La formattazione diretta viene dall'HTML che sta in mezzo, non dal fatto di convertire in un browser. La [conversione da Markdown a Word](/markdown-to-word) di questo sito scrive il `.docx` nel browser direttamente dal Markdown, senza passare per l'HTML: i titoli usano gli stili integrati di Word da Heading 1 a Heading 6 (da Titolo 1 a Titolo 6 in un Word italiano), gli elenchi la numerazione di Word, le note stanno a piè di pagina, e le tabelle hanno lo stile Table Grid (Griglia tabella) con una riga di intestazione che si ripete su ogni pagina. Non accetta un documento di riferimento, quindi il file arriva con un aspetto predefinito suo e non con quello della tua organizzazione; dato che gli stili portano i nomi integrati di Word, un template aziendale applicato dopo in Word può ristilizzarli, ma per un documento che produci ogni settimana Pandoc con un documento di riferimento resta meno lavoro.

## Google Docs come intermediario

Google Docs legge e scrive Markdown in modo nativo. In Docs, File, Apri, Carica prende un file `.md` e lo apre come documento; da Drive, clic destro sul file caricato e Apri con Google Docs. Il percorso inverso è File, Scarica, Microsoft Word (.docx). C'è anche un'impostazione in Strumenti, Preferenze chiamata Attiva Markdown che accende Copia come Markdown e Incolla da Markdown per spostare frammenti in giro (verificato su support.google.com, l'8 settembre 2026).

Questo rende Docs una strada a due passi verso Word: importa il Markdown, poi File, Scarica, Microsoft Word (.docx). Non richiede niente da installare né un terminale, motivo per cui continua a essere raccomandato.

| Pro | Contro |
| --- | --- |
| Nessuna installazione, nessuna riga di comando, funziona da qualunque macchina | Il documento viene caricato sui server di Google |
| Importazione ed esportazione sono entrambe funzioni native | Si ottengono gli stili di Google — Title, Heading da 1 a 6, Normal text — non quelli del tuo template |
| Il revisore può commentare in Docs e saltare del tutto il `.docx` | Nessun equivalente di `Source Code`, quindi i blocchi di codice arrivano come formattazione diretta monospaziata |
| La modalità Suggerimenti è un vero flusso di revisione con una vera traccia di controllo | I suggerimenti non sopravvivono all'export in Markdown; si ottiene il testo attuale |

La cosa davvero interessante di questa strada è che può eliminare del tutto il bisogno di Word. Se l'obiezione del revisore è "devo poter commentare e suggerire modifiche", la modalità Suggerimenti di Docs fa esattamente questo, con nomi, date e un controllo accetta/rifiuta, in un browser, senza nessun file che va avanti e indietro. È una risposta migliore di un viaggio di andata e ritorno in `.docx` ogni volta che l'organizzazione lo accetta — e alla fine attende lo stesso problema di riconciliazione, perché l'export in Markdown restituisce il testo risolto e non i suggerimenti.

Il costo sta in dove finisce il documento. Per un README pubblico non conta. Per un piano non ancora pubblicato, un contratto o qualunque cosa soggetta a un obbligo di riservatezza, caricarlo per convertirlo è l'intera domanda, e il fatto che la conversione sia comoda non cambia la risposta.

**Per chi è?** Per team già dentro Google Workspace, che convertono documenti non sensibili, dove il revisore è a suo agio in Docs.

## Gli editor che esportano .docx, e cosa fanno davvero

Diversi editor Markdown hanno Word nel loro menu di export. Vale la pena sapere cosa si nasconde dietro quella voce di menu, perché nella maggior parte dei casi è Pandoc.

**Typora** esporta in Word, ODT, RTF, EPUB, LaTeX e altro — e la sua stessa documentazione dice che per i formati diversi da HTML, PDF e immagini, Typora usa Pandoc per l'export, che devi installare tu stesso (verificato su support.typora.io, l'8 settembre 2026). Quindi l'export Word di Typora è l'export Word di Pandoc con una finestra di dialogo davanti, e porta gli stili di default di Pandoc a meno che l'editor non ti lasci passare argomenti extra. Typora costa 14,99 dollari senza tasse, un acquisto una tantum che copre fino a tre dispositivi, con una prova gratuita di 15 giorni (verificato su typora.io, l'8 settembre 2026).

**VS Code** non ha un export `.docx` integrato; sono le estensioni ad aggiungerlo, e quelle che lo fanno di solito richiamano anch'esse Pandoc. Se stai convertendo da un editor, sapere che il vero motore è Pandoc ti dice dove guardare quando l'output è sbagliato: nel documento di riferimento, non nell'editor.

**Obsidian** esporta il PDF dall'applicazione principale. L'export Word arriva da un plugin della comunità che chiama Pandoc, con la stessa conseguenza — gli stili sono quelli di Pandoc finché non lo punti verso un template.

**Writage** capovolge il problema. È un plugin Markdown per Microsoft Word stesso, disponibile per Windows e macOS, che apre e salva file `.md` da dentro Word e converte in entrambe le direzioni. È un plugin a pagamento venduto con una tariffa una tantum, con una prova gratuita (verificato su writage.com, l'8 settembre 2026). Il suo punto di forza è la collocazione: la conversione avviene sulla macchina del revisore, nell'applicazione che ha già aperta, il che aggira l'intera questione di chi converte cosa e quando.

**Copia e incolla** merita una menzione perché la gente lo fa comunque. Copia l'output renderizzato da un riquadro di anteprima o da un browser, incolla in Word, e il formato clipboard HTML porta titoli, grassetto, elenchi, link e struttura delle tabelle sorprendentemente bene. Tutto arriva come formattazione diretta, le immagini sono un colpo di fortuna a seconda di come erano richiamate, e i blocchi di codice di solito perdono lo sfondo. Per due paragrafi è la quantità giusta di sforzo. Per un documento, è una strada verso un file che nessuno può mantenere.

Il punto più generale sugli editor: sono la scelta giusta quando la conversione è occasionale e l'aspetto non conta molto, e la scelta sbagliata quando fa parte di un processo ripetibile, perché la cosa che serve controllare di più è quella che nascondono più spesso. Quale editor ti convenga è una domanda a parte, e [il confronto fra editor](/blog/best-markdown-editors) risponde meglio di quanto faccia un menu di export.

**Per chi è?** Per chi scrive e converte i propri documenti, uno alla volta, e vive già dentro l'editor.

## Dove fallisce il viaggio di ritorno verso Markdown, e quanto costa

Ecco la parte onesta. Portare Markdown in Word è un problema risolto — Pandoc più un template, fatto. Riportare il documento Word rivisto dentro Markdown non è risolto, e fingere il contrario è come i team finiscono con un repository che non corrisponde più al documento di cui tutti stanno discutendo.

Si parte da quello che Pandoc può fare, perché è più di quanto la maggior parte si aspetti. Leggendo un `.docx`, `--track-changes` accetta tre valori. `accept` è il default e processa tutti gli inserimenti e le cancellazioni. `reject` li ignora. `all` include inserimenti, cancellazioni e commenti, avvolti in span con le classi `insertion`, `deletion`, `comment-start` e `comment-end`, e l'autore e l'orario di ogni modifica sono inclusi; un intero paragrafo inserito o cancellato produce uno span con classe `paragraph-insertion` o `paragraph-deletion` prima dell'interruzione di paragrafo interessata. L'opzione riguarda solo il reader docx (verificato su pandoc.org, l'8 settembre 2026).

Quindi la revisione è recuperabile come dati:

```
pandoc --track-changes=all -f docx -t markdown review.docx -o review.md
```

Ora i costi, nell'ordine in cui creano problemi.

**Le modifiche smettono di essere modifiche.** In Word, un inserimento è una proposta con un pulsante attaccato. Nel Markdown convertito è uno span tra parentesi con un attributo autore — testo su una modifica, seduto nella prosa, che nessuno strumento Markdown può accettare o rifiutare. Lo leggi e riscrivi tu la decisione. Per un documento con una dozzina di modifiche sono venti minuti. Per un documento segnato riga per riga è una giornata, ed è una giornata di trascrizione senza nessun test che ti dica quando hai sbagliato.

**I commenti perdono i loro ancoraggi.** Un commento in Word si aggancia a un intervallo. Convertito, diventa uno span `comment-start` e `comment-end`, e mentre questo funziona per una frase dentro un paragrafo, gli intervalli di commento che coprono più paragrafi o che si sovrappongono a una cancellazione tracciata tornano distorti o staccati. Un commento di cui non riesci a identificare il bersaglio è un commento che qualcuno dovrà comunque rincorrere aprendo il `.docx` originale.

**`accept` e `reject` buttano via ciascuno metà dell'informazione.** `accept` restituisce testo pulito e nessuna traccia di chi ha cambiato cosa o perché, che è esattamente ciò per cui serviva la revisione. `reject` restituisce il tuo stesso documento. Nessuna delle due è una cattiva opzione — semplicemente non sono una revisione; sono un modo di chiuderne una.

**Il diff non vale niente a meno di normalizzare prima.** Questo è il fallimento che sorprende la gente. Converti un `.docx` in Markdown e l'output è il Markdown di Pandoc: i suoi a capo, i suoi escape, il suo stile di titolo, il suo allineamento delle tabelle. Ogni riga differisce dal tuo originale, quindi `git diff` mostra l'intero file come cambiato e le modifiche vere del revisore sono invisibili al suo interno. La correzione è far parlare a entrambe le parti lo stesso dialetto. Fai passare il tuo stesso Markdown attraverso la stessa pipeline una volta, metti in versione quel risultato normalizzato come fonte, e fissa le impostazioni di output al ritorno:

```
pandoc --track-changes=all -f docx -t gfm \
  --wrap=none --markdown-headings=atx \
  review.docx -o review.md
```

Con gli stessi flag su entrambi i lati, il diff mostra la revisione e nient'altro. Senza, mostra una riscrittura.

**Tutto quello che Word può esprimere e Markdown no è perso a prescindere dai flag.** L'evidenziazione di un revisore, un colore usato per significare qualcosa, un thread di commenti con tre risposte, una tabella ristrutturata, un posizionamento suggerito per una figura, una gerarchia di titoli riscritta ristilizzando invece che riscrivendo — niente di tutto questo ha dove atterrare. Il problema di riconciliazione nella direzione opposta, e le cose che un `.docx` porta e nessun file Markdown può contenere, sono trattate per bene in [riconvertire un .docx in Markdown](/blog/convert-docx-to-markdown).

**Cosa costa, detto chiaramente:** il viaggio di andata e ritorno è in pratica a senso unico. Markdown in uscita, `.docx` di ritorno, commenti letti da una persona, modifiche riapplicate a mano al Markdown, che resta l'unica fonte. Qualunque processo che tratti il `.docx` restituito come un input da unire automaticamente produrrà o una revisione persa o un commit che nessuno può leggere. Concorda questo con il revisore prima di inviare il file — "mandami i tuoi commenti e li applicherò io, e la versione nel repository è quella che conta" — e l'attrito diventa un passo di un processo invece di una discussione su quale file sia quello attuale.

## Come scegliere

1. **Decidi se il revisore modifica o solo legge.** Se legge soltanto, produci un PDF o una pagina HTML autonoma e fermati; eviterai l'intero problema del viaggio di ritorno, e un documento che nessuno può modificare non può biforcarsi in due versioni.
2. **Conta quante volte lo farai.** Una volta sola, dal menu di export di un editor, è ragionevole. Ogni settimana significa costruire un documento di riferimento, perché l'alternativa è riapplicare a mano l'aspetto aziendale ogni settimana e ottenerlo leggermente diverso ogni volta.
3. **Chiediti se l'output verrà ristilizzato.** Se entra in un insieme di documenti governato da un template, la strada HTML è squalificata — la sua formattazione è diretta invece che stilizzata, e un documento che non si può ristilizzare verrà riscritto da capo invece.
4. **Controlla dove il file può andare.** Una strada che passa per un servizio ospitato significa che il documento è sul server di qualcun altro; per qualunque cosa riservata questo esclude le opzioni comode e lascia Pandoc sulla tua macchina.
5. **Concorda il percorso di ritorno prima di inviare qualunque cosa.** Scrivi chi converte il file rivisto, con quali flag, e chi applica le modifiche al Markdown. Il costo di saltare questo passaggio si presenta nel momento peggiore possibile, cioè quando la revisione torna e la scadenza è venerdì.
6. **Prova con un documento che mette alla prova tutto, sulla copia di Word del vero revisore.** Nove livelli di titolo, elenchi annidati, un blocco di codice, una nota a piè di pagina, un'immagine con didascalia e una tabella larga. Le differenze di versione e piattaforma di Word emergono esattamente su questi elementi, e scoprirlo dal revisore è costoso.

## Conclusione

La strada che funziona è Pandoc con un documento di riferimento costruito una volta e messo in versione accanto al tuo Markdown, perché è la sola che produce un file Word con i tuoi stili invece che formattazione congelata o le impostazioni predefinite di qualcun altro — e sono gli stili a rendere un `.docx` degno di essere inviato a chi lo modificherà. La strada HTML è una scorciatoia ragionevole per un documento breve, e migliora molto se l'HTML da cui parti è un file completo e autonomo invece che un frammento, che è quello che [la conversione da Markdown a HTML di TransformPipe](/) produce nel browser senza caricare niente. Quando al documento servono titoli ed elenchi Word veri ma non il template della tua organizzazione, la [conversione da Markdown a Word](/markdown-to-word) dello stesso sito salta del tutto l'HTML e scrive nel browser un `.docx` fatto di stili. Google Docs è la scelta pragmatica dentro Workspace e quella sbagliata per qualunque cosa riservata. Qualunque tu scelga, decidi prima il percorso di ritorno: la conversione in uscita è un comando, quella di ritorno è una conversazione con una persona su chi applica le sue modifiche e quale file sia la verità.

## Domande frequenti

### Come converto Markdown in Word senza installare niente?

Carica il file `.md` su Google Docs — File, Apri, Carica — poi File, Scarica, Microsoft Word (.docx). Non serve installare niente né un terminale, al costo che il documento passa per i server di Google e arriva con gli stili di Google invece che quelli della tua organizzazione. Le altre strade senza installazione passano dal browser: convertire in HTML e aprire il risultato in Word è ancora più veloce e produce un file senza un set di stili utilizzabile, mentre un convertitore che scrive direttamente il `.docx`, come quello di questo sito, ti dà gli stili integrati di Word per titoli ed elenchi, anche se non il tuo template.

### Qual è il miglior comando Pandoc per Markdown in Word?

`pandoc report.md --reference-doc=house.docx -o report.docx`, dove `house.docx` è un documento di riferimento che hai modificato. Aggiungi `--toc` per un sommario e `--highlight-style=NAME` se ti interessa l'aspetto dei blocchi di codice. Senza `--reference-doc` il comando funziona comunque e dà l'aspetto di default di Pandoc.

### Come faccio usare a Word il template della mia azienda?

Costruisci un documento di riferimento dal default di Pandoc con `pandoc -o custom-reference.docx --print-default-data-file reference.docx`, poi ristilizzalo in Word per farlo somigliare al template. Partire dal file di Pandoc invece che dal template aziendale conta, perché la copia di Pandoc definisce già ogni stile a cui il writer docx fa riferimento — compresi `Source Code`, `Block Text` e `Image Caption`, che i template aziendali quasi mai hanno.

### Perché il mio blocco di codice sembra testo normale nel file Word?

Perché il documento di riferimento non ha uno stile di paragrafo `Source Code`, quindi Word sta rendendo un riferimento a uno stile che non trova. Aggiungi `Source Code` per i blocchi tra fence e lo stile di carattere `Verbatim Char` per il codice inline, entrambi con esattamente quei nomi, e la formattazione appare.

### Posso mantenere le modifiche tracciate convertendo Word di nuovo in Markdown?

Puoi leggerle, non mantenerle. `pandoc --track-changes=all` avvolge inserimenti, cancellazioni e commenti in span con attributi di autore e orario, il che basta per vedere chi ha proposto cosa — ma arrivano come annotazioni nella prosa, e nessuno strumento Markdown può accettarle o rifiutarle. Metti in conto di applicare le modifiche a mano.

### Perché il mio diff mostra l'intero file cambiato dopo un viaggio di andata e ritorno?

Perché il dialetto Markdown del convertitore non è il tuo: a capo diversi, escape diversi, stile di titolo diverso. Normalizza entrambi i lati facendo passare la tua fonte attraverso la stessa pipeline una volta e fissando i flag di output — `--wrap=none --markdown-headings=atx`, per esempio — così l'unica differenza che il diff mostra sono le modifiche del revisore.

### Devo mandare Word o PDF per la revisione?

PDF se leggono, Word se modificano. Un PDF è più piccolo, sembra uguale ovunque e non può biforcarsi in una seconda versione del documento; un `.docx` esiste perché qualcuno possa cambiarlo, e ogni costo di questo articolo è il costo di quella capacità. Mandare Word a chi voleva solo leggere invita modifiche che poi devi riconciliare.
