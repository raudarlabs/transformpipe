---
title: "Come aprire un file .md su Windows, macOS, Linux, iOS e Android"
description: "Un file .md è testo semplice, ecco perché il doppio clic apre un editor di codice o niente: come leggerlo come testo, come formattato, e impostare l’app predefinita."
updated: 2026-10-21
date: 2026-09-02
tag: Conversione
keywords: come aprire un file md, cos'è un file md, visualizzatore file md, markdown viewer online, aprire md nel browser, lettore file markdown, estensione file markdown
---

Hai scaricato un file chiamato `README.md`, ci hai fatto doppio clic, ed è successo qualcosa di poco utile. Si è aperto un editor di codice. Oppure Windows ti ha offerto un elenco di programmi che non hai mai sentito nominare. Oppure hai ottenuto una finestra piena di cancelletti e asterischi. Oppure non è successo niente, e il telefono ha detto che nessuna app può aprire quel file.

Il file non è rotto e non è corrotto. Nessun sistema operativo viene con un'applicazione che mostra il Markdown come Markdown, e questo unico fatto spiega ogni versione del problema — l'app sbagliata, nessuna app, e l'app che lo apre e ti mostra punteggiatura invece che formattazione.

Ci sono due cose separate che potresti volere, e la maggior parte dei consigli online le confonde. Potresti voler vedere cosa c'è nel file, cosa che ogni computer che possiedi sa già fare. Oppure potresti voler leggerlo come un documento, con intestazioni vere, grassetto vero e tabelle, cosa che richiede qualcosa in più. La strada è diversa secondo quale delle due cerchi, ed è diversa ancora su un telefono.

### In breve

Un file `.md` è testo semplice, quindi qualunque cosa apra un file di testo lo aprirà: Blocco note su Windows, TextEdit su macOS, `less` su Linux. Se leggi e scrivi questi file regolarmente, [un editor Markdown](/blog/best-markdown-editors) è la risposta migliore. Quello ti mostra la fonte, punteggiatura compresa. Per leggerlo come documento formattato invece, lascialo cadere in un visualizzatore che gira nel browser, installa un editor con anteprima come VS Code o Obsidian, o mandalo su GitHub. Se devi inviarlo a qualcun altro, smetti di cercare un visualizzatore e convertilo in HTML una volta — un file `.html` si apre con un doppio clic su ogni dispositivo con un browser, cosa che non vale per `.md` da nessuna parte.

## Cos'è un file .md?

Testo semplice. Questa è tutta la risposta.

Aprine uno in Blocco note e vedi ogni carattere che contiene. Non c'è nessuna formattazione nascosta, nessun dato binario, nessuna compressione, niente che un programma speciale debba decodificare. Un file `.docx` è un archivio zip pieno di XML e sarebbe illeggibile in un editor di testo; un file `.md` è esattamente quello che sembra. L'estensione del file markdown ti dice solo quale convenzione segue il testo: Markdown, un piccolo insieme di regole per scrivere la formattazione con la punteggiatura ordinaria.

```markdown
## Release notes

**Version 2** fixes the login timeout.

- Faster start-up
- New export button

| Platform | Status |
| --- | --- |
| Windows | Shipped |
| macOS | In review |
```

Ogni `#` segna un'intestazione, e più ne metti più piccola diventa. Gli asterischi rendono il testo in grassetto. I trattini fanno una lista. Le barre verticali fanno una tabella. Gli apici inversi delimitano il codice. Qualcuno l'ha scritto così perché un programma potesse trasformarlo in un documento formattato più avanti, ma il testo grezzo resta leggibile di per sé — gran parte del senso di Markdown, e il motivo per cui compare nei README, nei changelog, nelle app per appunti e nell'output di ogni assistente IA.

Vedrai lo stesso contenuto sotto altre estensioni. `.markdown`, `.mdown`, `.mkd` e `.mdwn` sono la stessa cosa con un nome più lungo o più vecchio; si aprono nello stesso modo e non significano niente di diverso. `.mdx` è Markdown con componenti JavaScript mescolati dentro, quindi è ancora testo ma conterrà tag che nessun visualizzatore semplice renderizza. `.rmd` è R Markdown, con blocchi di codice eseguibile. Se ne hai uno di questi, tutto quello che segue vale ancora per leggerlo — solo la sintassi extra sembrerà strana.

L'unica cosa che confonde le persone è l'intestazione. I file esportati da un sito statico, una build di documentazione o un'app di appunti spesso iniziano con un blocco delimitato da tre trattini:

```markdown
---
title: Quarterly plan
author: Priya
date: 2026-08-14
---
```

Quello è front matter YAML: metadati per lo strumento che ha costruito la pagina, non parte del documento. Alcuni visualizzatori lo nascondono, alcuni lo renderizzano come un paragrafo di righe `chiave: valore` in cima, e pochi lo trasformano in una tabella. Nessuno di questi è un difetto. Vale la pena riconoscerlo, perché un documento che inizia con quello che sembra nonsenso è di solito solo un file uscito da un generatore.

## Perché il doppio clic fa qualcosa di strano

Ogni sistema operativo desktop sceglie il programma per aprire un file dalla sua estensione, e ognuno fallisce diversamente quando niente ha reclamato correttamente quell'estensione.

**Windows non viene con niente che registri `.md`.** Quindi vince qualunque cosa si sia installata per ultima e abbia alzato la mano. Su un portatile di lavoro di solito è un editor di codice, un client Git, o qualche strumento arrivato con la toolchain dello sviluppatore — e se niente l'ha reclamato, ottieni la finestra “Come vuoi aprire questo file?” con un elenco di applicazioni e nessuna indicazione su quale sia giusta. Nessuno dei due esiti dice niente sul tuo file.

**macOS ripiega su TextEdit**, che lo apre volentieri e ti mostra la fonte. Sembra un fallimento e non lo è: TextEdit sta facendo esattamente il suo lavoro, che è mostrare testo. Seleziona il file e premi spazio per Quick Look e in genere ottieni la stessa cosa — i caratteri, non la formattazione.

**Linux dipende dal tuo desktop.** Il tipo MIME del file viene di solito rilevato come `text/markdown`, e se qualcosa è registrato come gestore per quel tipo varia per distribuzione. Puoi controllare cosa pensa il tuo sistema di avere in mano:

```bash
xdg-mime query filetype notes.md
xdg-mime query default text/markdown
```

Il primo stampa il tipo, il secondo stampa la voce desktop che lo aprirà, o niente affatto se nessuna applicazione l'ha reclamato.

**I telefoni sono più rigidi di tutti gli altri.** iOS e Android decidono anche loro cosa fare con un file dal suo tipo, e se nessuna app installata dichiara supporto per il Markdown, il foglio di condivisione semplicemente non offre niente di utile. Android spesso dice apertamente che nessuna app può aprire il file. È il punto in cui le persone rinunciano più spesso, e il più facile da risolvere, perché su un telefono il browser è quasi sempre la risposta.

Un editor di codice che apre le tue note di riunione non è un segno che il file contenga codice. Significa che quell'editor è stato l'ultima cosa a reclamare l'estensione. Note così di solito arrivano da un'esportazione, e l'id lungo nel nome del file o la cartella di immagini accanto al file sono il segnale rivelatore: [cosa produce ciascuno tra Notion, Obsidian e Confluence](/blog/markdown-from-notion-obsidian-and-confluence) decide se quelle immagini funzionano ancora una volta spostato il file da qualche parte.

## Leggere la fonte, o leggerlo formattato

Prima di installare qualcosa, decidi quale di queste due vuoi. Sono problemi diversi con strumenti diversi.

**Leggere la fonte** significa guardare i caratteri come sono scritti: `## Heading`, `**bold**`, le barre verticali di una tabella. Per un file corto va benissimo, e spesso è meglio — vedi esattamente cosa c'è, incluse le destinazioni dei link, che una vista formattata nasconde dietro il testo del link. Ogni macchina che possiedi sa già farlo e non c'è niente da installare.

**Leggerlo formattato** significa vedere la formattazione applicata: intestazioni in un carattere più grande, il grassetto come grassetto, le liste indentate, le tabelle come griglie, il codice in un blocco monospaziato. È quello che vuoi per un documento lungo, perché oltre un paio di schermate la punteggiatura comincia a competere con le parole. Le liste annidate sono il caso più chiaro: tre livelli di indentazione con punti elenco e numeri misti sono difficili da tenere a mente come testo grezzo e ovvi una volta formattati.

C'è una terza cosa che si confonde con entrambe, ed è quella di cui le persone hanno davvero bisogno sorprendentemente spesso: **trasformarlo in un file che qualcun altro può aprire**. Quella è conversione, non visualizzazione, ed è trattata più avanti. Se il tuo problema reale è che un collega non riesce ad aprire il `.md` che gli hai inviato, nessun visualizzatore di questa pagina ti aiuterà — ha bisogno di un file diverso, non di un'app diversa.

## Confronto rapido: ogni modo di aprire un file .md

| Opzione | Ideale per | Cosa vedi | Prezzo |
| --- | --- | --- | --- |
| Blocco note, TextEdit, qualunque editor di testo | Controllare cosa contiene davvero il file | La fonte, punteggiatura compresa | Gratis, già installato |
| TransformPipe nel browser | Leggerlo formattato e ottenere un file in uscita | Un documento formattato, convertito sulla tua stessa macchina | Gratis |
| Estensione del browser per Markdown | Aprire spesso file `.md` locali nel browser | Una pagina formattata a un URL `file://` | Gratis, MIT |
| VS Code | Sviluppatori con il file già nell'editor | Fonte e anteprima affiancate | Gratis |
| Obsidian | Leggere regolarmente un'intera cartella di Markdown | Note formattate; i file restano testo semplice sul disco | Gratis per uso personale, commerciale e non profit |
| MarkText | Un lettore desktop semplice senza account | Formattato mentre digiti | Gratis, MIT |
| Typora | Scrivere e leggere Markdown ogni giorno | La formattazione sostituisce la fonte al suo posto | 14,99 $ senza tasse, fino a 3 dispositivi (verificato su typora.io, l'8 settembre 2026) |
| GitHub, GitLab, Gist | File che vivono già in un repository | GFM renderizzato nell'interfaccia web | Gratis |
| `less`, `bat`, `glow` | Un terminale, un server, nessun desktop affatto | Testo, o una formattazione disegnata nel terminale | Gratis, open source |
| Markor, Obsidian, Working Copy | Android e iOS, offline | Anteprima formattata sul dispositivo | Markor e Obsidian gratuiti; alcuni editor iOS sono pagati |
| Pandoc | Produrne prima un altro formato | Niente — scrive un file che poi apri | Gratis, GPL |

## Aprire un file .md, piattaforma per piattaforma

### Windows

Ogni macchina Windows può mostrarti il testo senza nessuna installazione:

| Strada | Fai questo | Risultato |
| --- | --- | --- |
| Blocco note | Tasto destro sul file, Apri con, Blocco note | La fonte |
| Prompt dei comandi | `type notes.md` | La fonte, stampata |
| PowerShell | `Get-Content notes.md` | La fonte, stampata |
| Blocco note da un prompt | `notepad notes.md` | La fonte, in una finestra |

Per leggerlo formattato, la strada più corta senza niente installato è un browser: apri un visualizzatore che gira nel browser e lascia cadere il file sulla pagina. Se leggi Markdown abbastanza spesso perché il doppio clic conti, installa un editor con anteprima e poi imposta l'applicazione predefinita così Windows smette di chiedere.

**Cambiare l'app predefinita su Windows.** Tasto destro sul file, scegli Apri con, poi Scegli un'altra app, seleziona il programma e spunta la casella che rende la scelta permanente. Se l'app che vuoi non è nell'elenco, usa “Cerca un'altra app in questo PC” e punta Windows all'eseguibile. Puoi farlo anche da Impostazioni: App, poi App predefinite, cerca il tipo di file `.md` e imposta lì il gestore. La seconda strada è quella da usare quando l'estensione è stata reclamata da qualcosa che hai da allora disinstallato, il che lascia l'associazione a puntare sul niente.

### macOS

TextEdit è già il ripiego, quindi il doppio clic di solito mostra la fonte. Da un terminale:

| Strada | Fai questo | Risultato |
| --- | --- | --- |
| TextEdit | Tasto destro, Apri con, TextEdit | La fonte |
| Terminale | `open -e notes.md` | La fonte, in TextEdit |
| Terminale | `less notes.md` | La fonte, paginata |
| Quick Look | Seleziona il file, premi spazio | Il testo, non la formattazione |

Una trappola specifica di macOS: TextEdit può essere configurato per trattare i file come rich text, e se lo è stato, potrebbe offrirsi di convertire o riformattare quello che apre. Leggere è sicuro in entrambi i casi, ma non salvare da TextEdit a meno che tu sia certo che sia in modalità testo semplice, perché un file `.md` salvato come RTF non è più un file `.md`.

**Cambiare l'app predefinita su macOS.** Seleziona il file, premi Command-I per Ottieni informazioni, apri la sezione “Apri con”, scegli l'applicazione, poi clicca “Cambia tutti” per applicarlo a ogni file `.md` invece che solo a questo. Il clic su “Cambia tutti” è la parte che le persone perdono; senza quello l'impostazione si applica a un solo file e il prossimo download ti sorprende di nuovo.

### Linux

L'editor del desktop lo apre — GNOME Text Editor, Kate, Mousepad, quello che la tua distribuzione fornisce — e così farà tutto nel terminale:

| Strada | Fai questo | Risultato |
| --- | --- | --- |
| Pager | `less notes.md` | La fonte, paginata, cercabile con `/` |
| Stampa | `cat notes.md` | La fonte, tutta insieme |
| Colorazione sintattica | `bat notes.md` | La fonte con il Markdown evidenziato |
| Formattato nel terminale | `glow notes.md` | Intestazioni, liste e tabelle disegnate come testo |

`glow` è quello interessante se vivi in un terminale: renderizza il Markdown dentro il terminale stesso, quindi ottieni la formattazione senza nessuna applicazione grafica da nessuna parte. È gratis e con licenza MIT. `bat` non renderizza, colora la fonte, il che è una vittoria più piccola ma utile sui file lunghi.

**Cambiare l'app predefinita su Linux.** Usa la scheda Proprietà, Apri con del file manager, oppure impostala dalla riga di comando:

```bash
xdg-mime default org.gnome.TextEditor.desktop text/markdown
```

Sostituisci la voce desktop con quella dell'applicazione che vuoi. Se `xdg-mime query filetype` segnala qualcosa diverso da `text/markdown` — `text/plain` è comune — imposta il predefinito per quel tipo invece, o la tua impostazione sembrerà non fare niente.

### iOS e iPadOS

Non c'è nessun filesystem su cui fare tasto destro, quindi le opzioni sono più ristrette e l'ordine conta. Provale in questa sequenza:

1. **Tocca il file in File.** Quick Look spesso mostra il testo. Questo risponde alla domanda per un file corto e non costa niente.
2. **Apri un visualizzatore che gira nel browser.** Safari e Chrome su iOS possono entrambi scegliere un file da File tramite il selettore di file di una pagina, il che significa che un visualizzatore che gira nel browser funziona su un telefono esattamente come su un portatile. È la sola strada che non richiede nessuna installazione e ti dà comunque la formattazione.
3. **Installa un'app che dichiara il Markdown.** Obsidian è gratis e legge direttamente una cartella di file `.md`. Working Copy è un client Git che sfoglia i repository e vede in anteprima il Markdown; si installa gratis con uno sblocco pagato il cui prezzo è nell'App Store.
4. **Rinominalo in `.txt`.** Rozzo, efficace, e fa trattare il file come testo da Quick Look e da ogni app di testo. Tieni una copia con il nome originale se il file deve andare altrove dopo.

### Android

Android è la piattaforma più incline a rifiutare del tutto, e anche la più facile da risolvere:

1. **Prova il visualizzatore di testo integrato del tuo file manager.** Alcuni ne includono uno, altri no.
2. **Installa Markor.** È un editor di testo per Android, gratis e con licenza Apache 2.0, disponibile su F-Droid e GitHub. Salva i file come testo semplice sul dispositivo, quindi niente viene convertito in un formato proprietario dietro le tue spalle, e mostra in anteprima il Markdown come output formattato.
3. **Usa un visualizzatore che gira nel browser.** Chrome su Android può passare un file locale al selettore di file di una pagina, cosa che ti dà un documento formattato senza installare niente.
4. **Rinominalo in `.txt`.** Stesso trucco, stessa cautela.

Google Drive mostrerà anche il contenuto di un file di testo che tiene, cosa che vale la pena sapere quando il file è arrivato come link Drive invece che come download.

## Le opzioni, una alla volta

### L'editor di testo che hai già — ideale per scoprire cosa hai in mano

Blocco note, TextEdit, GNOME Text Editor, Kate, `less`, `nano`. Ognuno di loro apre un file `.md` correttamente, subito, senza niente da scaricare.

| Pro | Contro |
| --- | --- |
| Già installato su ogni macchina | Nessuna formattazione: leggi la punteggiatura |
| Mostra il file esattamente com'è, comprese le destinazioni dei link e il front matter | I documenti lunghi con liste annidate diventano difficili da seguire |
| Non può rovinare niente finché non salvi | Nessun rendering di tabelle, quindi una tabella larga è un muro di barre verticali |

**Prezzo:** gratis, già installato.

**Dettagli tecnici e funzioni**

- Gestisce qualunque variante di Markdown, perché non ne sta interpretando nessuna
- Mostra front matter YAML, commenti HTML e HTML grezzo che le vista formattate potrebbero nascondere
- Ricerca nel file: `Ctrl-F` in un editor, `/` in `less`
- Sicuro da aprire qualunque cosa, perché niente nel file viene eseguito o scaricato

**Chi dovrebbe usarlo?** Tutti, per primo. Apri il file in un editor di testo prima di decidere che ti serve uno strumento. Metà delle volte il file è lungo quaranta righe e hai la tua risposta in dieci secondi.

### TransformPipe nel browser — ideale per leggerlo formattato senza installare niente

Lascia cadere il file `.md` sulla pagina e leggilo come un documento. Gira nel browser: da disconnesso, il file non viene caricato da nessuna parte, il che conta quando il documento è un contratto in bozza o un runbook interno invece che un README pubblico.

| Pro | Contro |
| --- | --- |
| Nessuna installazione, nessun account, funziona su un telefono come su un portatile | Serve una scheda del browser, quindi non è un gestore da doppio clic |
| Niente viene caricato quando sei disconnesso | Un documento alla volta, o più uniti insieme in uno |
| Renderizza GitHub Flavored Markdown, quindi tabelle e liste di attività appaiono come tabelle e liste di attività | Non è un editor: legge e converte, non ti aiuta a scrivere |
| Esporta un file HTML autonomo se devi far avanzare il documento | |

**Prezzo:** gratis. Un account aggiunge cronologia, condivisione e un'API, anche questi gratis.

**Dettagli tecnici e funzioni**

- GFM: tabelle, liste di attività, testo barrato, autolink, blocchi di codice delimitati
- L'esportazione è un documento HTML completo con gli stili incorporati e nessuna richiesta esterna
- L'HTML grezzo nella fonte passa attraverso un sanitizzatore con una lista di elementi permessi fissa prima di raggiungere la pagina
- Si scarica come `.html`, `.md` o testo semplice, oppure si stampa in PDF tramite la finestra di dialogo del browser
- Convertisce anche HTML, Word, CSV e JSON in Markdown, e la stessa conversione è disponibile da un'API REST, una CLI, una GitHub Action e un server MCP

**Chi dovrebbe usarlo?** Chiunque abbia un file e nessuna voglia di installare software per esso, e chiunque il cui passo successivo sia mandare il documento a qualcun altro.

### Un'estensione del browser per Markdown — ideale per aprire ripetutamente file locali nel browser

Estensioni come Markdown Viewer renderizzano i file `.md` non appena li apri nel browser, quindi un URL `file:///` diventa una pagina formattata.

| Pro | Contro |
| --- | --- |
| Trasforma il browser in un visualizzatore `.md` per i file locali | Richiede di concedere all'estensione l'accesso agli URL di file |
| Renderizza appena apri il file, nessun trascina-e-lascia | Un'estensione con accesso ai file può leggere i file locali che apri |
| Varianti e temi configurabili in quelle migliori | La qualità e la manutenzione delle estensioni varia molto |

**Prezzo:** gratis, con licenza MIT per Markdown Viewer.

**Dettagli tecnici e funzioni**

- Disponibile per Chrome, Firefox, Edge, Opera, Brave, Chromium e Vivaldi
- Richiede di attivare esplicitamente “Consenti accesso agli URL dei file” nella pagina dei dettagli dell'estensione prima che i file locali si renderizzino
- Renderizza nella pagina, quindi la ricerca, lo zoom e la stampa del browser funzionano normalmente

**Chi dovrebbe usarlo?** Chi apre file Markdown locali ogni settimana e vuole che il browser li gestisca senza una deviazione. Leggi prima i permessi: l'interruttore per gli URL di file è tutto il senso dell'estensione e anche il motivo per scegliere una di cui ti fidi con il tuo disco.

### VS Code — ideale se è già aperto

VS Code ha un'anteprima Markdown integrata, su markdown-it. Apri il file e premi il bottone di anteprima, oppure dividi la finestra e ottieni fonte e rendering affiancati.

| Pro | Contro |
| --- | --- |
| Già installato per la maggior parte degli sviluppatori | Un grande download se vuoi solo leggere un file |
| L'anteprima segue da vicino CommonMark, con gli extra di GFM | Lo stile dell'anteprima è quello dell'editor, non del documento |
| La vista divisa mostra fonte e risultato insieme | Non è un lettore: è un editor di codice con un riquadro di anteprima |

**Prezzo:** gratis.

**Dettagli tecnici e funzioni**

- Anteprima costruita su markdown-it, quindi il suo rendering corrisponde al comportamento di quel parser
- Le estensioni aggiungono l'esportazione in HTML e PDF, e sintassi aggiuntive come i diagrammi
- Gestisce una cartella di file Markdown con ricerca su tutti
- Mostra il front matter come fonte a meno che un'estensione non ci faccia qualcosa

**Chi dovrebbe usarlo?** Gli sviluppatori il cui file è già nell'editor. Se stai aprendo VS Code apposta per leggere un allegato `.md`, una scheda del browser è più rapida. E se il passo successivo è un file `.html`, l'anteprima non te lo dà: [Markdown in HTML in VS Code](/blog/markdown-to-html-in-vs-code) passa in rassegna le estensioni che esportano e spiega perché nessuna eredita di default l'aspetto dell'anteprima.

### Obsidian — ideale per una cartella di Markdown a cui torni spesso

Obsidian è un'app per appunti il cui intero archivio è file Markdown semplici in una cartella ordinaria sul disco. Puntala su una directory e ogni file `.md` al suo interno diventa una nota leggibile e collegata.

| Pro | Contro |
| --- | --- |
| I file restano `.md` semplice sul disco, leggibili da qualunque altra cosa | Vuole una cartella, chiamata vault, non un singolo file sciolto |
| Gira su Windows, macOS, Linux, iOS e Android | La sua sintassi di link e incorporamento è propria e non portabile ad altri renderer |
| Legge e renderizza senza account | Un'intera applicazione da imparare se vuoi solo leggere |

**Prezzo:** gratis per uso personale, commerciale e non profit; le licenze commerciali sono opzionali e vendute annualmente come supporto (verificato su obsidian.md, l'8 settembre 2026).

**Dettagli tecnici e funzioni**

- Local-first: il vault è una directory, e non c'è nessun obbligo di accedere
- Renderizza GFM più i propri link stile wiki `[[link]]` e incorporamenti
- Le app mobili per iOS e Android leggono gli stessi file
- Siccome l'archivio è testo semplice, qualunque cosa scrivi al suo interno resta apribile in Blocco note dopo

**Chi dovrebbe usarlo?** Chiunque abbia accumulato una cartella di Markdown — note esportate, un checkout di documentazione, un wiki personale — e la legga regolarmente invece che una sola volta.

### MarkText — ideale come lettore desktop semplice senza account

MarkText è un editor Markdown desktop open source che renderizza mentre digiti, quindi funziona anche come lettore.

| Pro | Contro |
| --- | --- |
| Gratis e con licenza MIT | Il ritmo di sviluppo è più lento degli editor commerciali |
| Si installa su Windows 10 o 11, macOS 11 o successivo, e Linux | Meno funzioni di Typora o Obsidian |
| Disponibile tramite Homebrew, Chocolatey e Winget | È comunque un'installazione, per un compito che una scheda del browser può fare |

**Prezzo:** gratis, con licenza MIT.

**Dettagli tecnici e funzioni**

- Installer Windows x64 e arm64, build macOS arm64 e x64 senza binario universale, e binari Linux dalla pagina dei rilasci (verificato su github.com/marktext/marktext, l'8 settembre 2026)
- Renderizza sul posto invece che in un riquadro di anteprima separato
- Esporta HTML e PDF dal file che ha aperto

**Chi dovrebbe usarlo?** Chi vuole un'applicazione desktop che possieda l'estensione `.md`, su una macchina dove installare un editor pagato non è un'opzione sul tavolo.

### Typora — ideale se leggi e scrivi Markdown ogni giorno

Typora sostituisce il Markdown con il suo rendering mentre digiti, quindi non c'è nessun riquadro di anteprima e nessuna vista della fonte a meno che tu non la chieda. È il più comodo di questi in cui stare per ore, e il solo qui che costa denaro.

| Pro | Contro |
| --- | --- |
| Il rendering è il documento: nessun riquadro diviso da gestire | Pagato, e solo desktop |
| Esporta HTML, PDF e Word | Nascondere la sintassi infastidisce alcuni scrittori |
| File locali, niente caricato | Non vale la pena comprarlo per aprire un allegato |

**Prezzo:** 14,99 $ senza tasse, fino a 3 dispositivi, con una prova gratuita di 15 giorni (verificato su typora.io, l'8 settembre 2026).

**Dettagli tecnici e funzioni**

- Editing WYSIWYG, con una modalità fonte disponibile quando serve vedere i segni
- I temi sono CSS, quindi l'esportazione può essere stilizzata secondo il tuo stile
- Esporta tramite Pandoc per i formati che non scrive da sé

**Chi dovrebbe usarlo?** Chi lavora con il Markdown ogni giorno. Come lettore `.md` occasionale è l'acquisto sbagliato.

### GitHub, GitLab e Gist — ideale quando il file vive già in un repository

Entrambi renderizzano GitHub Flavored Markdown nell'interfaccia web, ed entrambi leggono un file bene abbastanza da non aver bisogno di niente altro. Nessuno dei due è un visualizzatore per i file sul tuo disco.

| Pro | Contro |
| --- | --- |
| Renderizza GFM in modo affidabile, comprese tabelle e liste di attività | Il file deve prima essere pubblicato da qualche parte |
| Niente da installare; un link che chiunque può aprire | Non appropriato per un documento confidenziale |
| Gist funziona per un singolo file sciolto | Nessun bottone di esportazione: quello che salvi è la loro pagina, il loro markup |

**Prezzo:** gratis.

**Chi dovrebbe usarlo?** Chiunque il cui file appartenga comunque a un code host. Incolla un singolo file in un Gist privato e hai una vista formattata in pochi secondi — ma solo per un contenuto che sei contento di metterci.

### less, bat e glow — ideale su un server senza desktop

A volte il file è su una macchina raggiunta via SSH, e non c'è nessun browser e nessuna GUI. Il terminale ha tre livelli di risposta.

| Pro | Contro |
| --- | --- |
| Funziona senza nessun ambiente grafico | Renderizzare in un terminale ha dei limiti: nessuna immagine, le tabelle strette vanno a capo |
| `less` è praticamente su ogni macchina Unix già | `bat` e `glow` sono installazioni extra |
| `glow` renderizza intestazioni, liste e tabelle come testo formattato | Non una strada che qualcuno scegliesse su un portatile |

**Prezzo:** gratis, open source; `glow` ha licenza MIT.

**Dettagli tecnici e funzioni**

- `less notes.md` pagina la fonte e la cerca con `/`
- `bat notes.md` stampa la fonte con la colorazione sintattica di Markdown
- `glow notes.md` disegna un rendering nel terminale, stilizzato per tema scuro o chiaro

**Chi dovrebbe usarlo?** Chiunque legga un README o un runbook su un server, dove installare un'applicazione desktop non è una frase che significhi niente.

### Markor, Obsidian mobile e Working Copy — ideale su un telefono

Il mobile è dove “apri semplicemente il file” fallisce di più, quindi vale la pena conoscere un'app per piattaforma.

| Pro | Contro |
| --- | --- |
| Markor è gratis, Apache 2.0, e tiene i file come testo semplice sul dispositivo | Ognuna è un'installazione per piattaforma per un file che forse leggi una volta |
| Obsidian gira sia su iOS che su Android e legge una cartella di `.md` | La gestione dei file mobile è più macchinosa di quella desktop |
| Working Copy vede in anteprima il Markdown da un repository Git su iOS | Alcuni editor iOS sono pagati, con la cifra fissata nell'App Store |

**Prezzo:** Markor gratis, Apache 2.0. Obsidian gratis. Working Copy si installa gratis con uno sblocco pagato fissato nell'App Store.

**Dettagli tecnici e funzioni**

- Markor: Android, da F-Droid o GitHub, senza pubblicità, file interoperabili con qualunque altro strumento di testo semplice
- Obsidian mobile: apre lo stesso vault della cartella dell'applicazione desktop
- Working Copy: un client Git, quindi è la risposta giusta quando il file è in un repository invece che in un download

**Chi dovrebbe usarlo?** Chi legge Markdown su un telefono più di una volta. Per un singolo allegato, un visualizzatore che gira nel browser non richiede installazione e funziona su entrambe le piattaforme.

### Pandoc — ideale quando la risposta è un file diverso

Pandoc è un convertitore di documenti da riga di comando scritto in Haskell. Non mostra niente; scrive un nuovo file, che poi apri in qualcosa che mostra le cose.

| Pro | Contro |
| --- | --- |
| Convertisce Markdown in HTML, PDF, Word, EPUB e altro | Richiede un'installazione e un terminale |
| `--standalone` produce un documento completo invece di un frammento | Non è affatto un visualizzatore: nessuna finestra, nessuna anteprima |
| Scriptabile, quindi gestisce una cartella con la stessa facilità di un file | I suoi template e dialetti sono una curva di apprendimento propria |

**Prezzo:** gratis, con licenza GPL.

**Dettagli tecnici e funzioni**

- Legge diversi dialetti Markdown, selezionati esplicitamente, e scrive circa quaranta formati di output
- `--standalone` incapsula l'output; `--embed-resources` incorpora immagini e CSS in un unico file
- Gira senza interfaccia, quindi si adatta a una build o a un cron job più che a una sessione di lettura

**Chi dovrebbe usarlo?** Chi ha bisogno del documento in un altro formato, ripetutamente, su una macchina che controlla. Per un file e una lettura, è più strumento di quanto il compito richieda.

## Qualcuno ti ha mandato per email un file .md e non hai niente installato

Questa è la versione più comune della domanda, e ha una risposta corta: non installare niente.

Scarica l'allegato, apri un visualizzatore che gira nel browser, e lascia cadere il file sulla pagina. Funziona su un portatile di lavoro con una politica software bloccata, su un telefono, e su una macchina presa in prestito. Controlla cosa dice la pagina di fare con il file prima di lasciarci cadere un documento confidenziale — con uno strumento lato browser niente viene caricato, e puoi confermarlo aprendo il pannello di rete e osservando che non succede niente.

Se non puoi usare nemmeno una scheda del browser, due ripieghi:

- **Rinominalo.** Cambia `notes.md` in `notes.txt` e ogni visualizzatore di testo sulla macchina, inclusa l'anteprima degli allegati della tua webmail, ti mostrerà la fonte. Niente del file cambia tranne il nome.
- **Apri l'anteprima dell'allegato.** La maggior parte dei client webmail vede in anteprima un allegato di testo inline invece di scaricarlo, e un file `.md` è un allegato di testo.

E se questo continua a succedere — se un collega ti manda file `.md` regolarmente e continui a cercare un modo per leggerli — la correzione è a monte di te. Chiedigli di mandare HTML o un link invece. Un allegato `.md` è un file che si apre correttamente solo per chi ha già risolto questo problema.

## Leggerlo e convertirlo sono compiti diversi

Un visualizzatore risolve il tuo problema. Non risolve il problema della prossima persona.

Se devi mandare il documento per email, stamparlo, allegarlo a un ticket, metterlo davanti a un cliente, o poterlo ancora aprire in cinque anni, convertilo una volta in HTML. Un file `.html` si apre con un doppio clic su qualunque cosa abbia un browser, formattazione intatta, senza niente da installare e niente da spiegare. È la proprietà che `.md` non ha su nessuna piattaforma, che è l'intero motivo per cui questo articolo esiste. [Cosa succede davvero quando il Markdown diventa HTML](/blog/markdown-to-html-converter) vale la pena capirlo prima di scegliere uno strumento, e se il lettore non dovrebbe doversi occupare per niente di un allegato, puoi [pubblicarlo come link di sola lettura](/blog/share-a-markdown-document-as-a-link) invece.

Il compromesso va nell'altra direzione mentre stai ancora scrivendo. Un editor con anteprima dal vivo guadagna il suo download allora, perché stai guardando il documento decine di volte al giorno. Un convertitore serve per quando hai finito e qualcun altro deve leggerlo. Scegliere tra i due è in realtà una domanda su chi sia il prossimo lettore — e se quella domanda continua ad arrivare prima che il file sia scritto piuttosto che dopo, la decisione sottostante è [se il documento dovesse essere Markdown o HTML fin dall'inizio](/blog/markdown-vs-html).

## Dove fallisce la scelta ovvia

Il consiglio ovvio è “installa VS Code” o “apri semplicemente in Blocco note”, ed entrambi hanno ragione circa metà delle volte. Ecco dove ciascuno ti costa qualcosa.

**Il testo grezzo nasconde la struttura esattamente quando ti serve.** Un file di quaranta righe va bene come fonte. Un runbook di sessanta pagine con quattro livelli di annidamento, una dozzina di tabelle e codice inline ogni tre righe no: finisci per interpretare la punteggiatura invece che leggere le parole, e ti perderai delle cose. Il fallimento è silenzioso — non noti la voce che hai saltato.

**Installare un editor per un file è un pessimo scambio, e difficile da annullare.** Un editor di codice è un grande download, un giro di impostazioni che non hai chiesto, e una nuova applicazione predefinita per un'estensione che forse non vuoi che possieda. Tende anche ad aprire il Markdown con la colorazione sintattica attiva, che non è la stessa cosa che renderizzarlo — i cancelletti ci sono ancora, sono solo di un colore diverso adesso.

**I visualizzatori online di solito significano caricati.** “Online” e “nel browser” sembrano identici e non lo sono. Alcuni strumenti mandano il tuo file a un server per convertirlo; alcuni fanno il lavoro in locale e non mandano niente. Per un README pubblico la differenza è irrilevante. Per un contratto, una nota di un paziente, un piano non annunciato o un rapporto di incidente interno è la sola domanda che conta, e la risposta è sulla pagina o verificabile nel pannello di rete.

**Le estensioni del browser vogliono l'accesso al tuo disco.** Un'estensione che renderizza file `.md` locali può farlo solo con il permesso di leggere gli URL di file, e quel permesso non è ristretto. È uno scambio ragionevole se leggi Markdown di continuo e uno scarso per un singolo allegato.

**I visualizzatori non sono d'accordo sul Markdown.** Tabelle, liste di attività, testo barrato e autolink vengono da GitHub Flavored Markdown piuttosto che dalla sintassi originale, quindi un visualizzatore CommonMark rigoroso mostra barre verticali grezze dove ti aspettavi una tabella. Il file va bene; il visualizzatore implementa una variante più piccola. È la segnalazione “il mio Markdown è rotto” più comune di tutte e quasi mai è il file. Le varianti vale la pena conoscerle se gestisci Markdown da più di una fonte.

**Le immagini non saranno nel file.** Markdown fa riferimento alle immagini per percorso; non le contiene. Apri un file `.md` esportato con una cartella `images/` accanto, in un visualizzatore che ha ricevuto solo il `.md`, e ogni immagine è un'icona rotta. Non è il visualizzatore che fallisce, è [cosa fanno i percorsi relativi quando un file si sposta](/blog/images-and-links-that-still-work).

**Cambiare l'app predefinita risolve il doppio clic e niente altro.** Vale la pena farlo, e non rende il file portabile. La tua macchina ora apre `.md` bene. La persona a cui lo mandi è di nuovo al punto di partenza.

## Come scegliere

1. **Aprilo prima in un editor di testo.** Ci vogliono dieci secondi, non serve niente, e ti dice esattamente cosa hai in mano — la lunghezza, il front matter, se ci sono tabelle, se è davvero Markdown. Saltalo e potresti installare un'applicazione per leggere quaranta righe di testo.
2. **Conta quante volte succederà.** Una volta significa una scheda del browser. Ogni settimana significa un'estensione del browser o un editor che hai già. Ogni giorno significa un'applicazione in cui ti piace stare, e quello è il solo caso in cui pagarne una ha senso.
3. **Decidi se il contenuto può lasciare la macchina.** Se non può, escludi qualunque cosa carichi prima di confrontare altro, perché non è una preferenza che puoi rivedere dopo il fatto.
4. **Controlla la variante rispetto al file.** Se il documento ha tabelle o liste di attività, il visualizzatore deve fare GFM. Apri un file rappresentativo e guarda le tabelle prima di impegnarti; un visualizzatore che mostra barre verticali continuerà a mostrare barre verticali.
5. **Chiediti chi lo legge dopo.** Se la risposta è solo tu, qualunque visualizzatore qui va bene. Se la risposta è un collega, un cliente o il tuo futuro te su un altro dispositivo, non vuoi affatto un visualizzatore — vuoi un file convertito, e la scelta del visualizzatore smette di contare.

## Conclusione

Apri il file in Blocco note, TextEdit o `less` prima di tutto: è testo semplice, si aprirà, e ti dice esattamente cosa hai. Se la fonte risponde alla tua domanda, fermati lì. Se il documento è lungo abbastanza che la punteggiatura sia d'ostacolo, leggilo formattato — una scheda del browser per un file, un'estensione o un editor se è un'abitudine settimanale, Markor o Obsidian su un telefono. E se il problema reale è che il file deve raggiungere qualcuno che non dovrebbe mai dover vedere un cancelletto, convertilo una volta con [la conversione da Markdown a HTML di TransformPipe](/): gira nel tuo browser, niente viene caricato quando sei disconnesso, e quello che riprendi è un unico file HTML autonomo che si apre con un doppio clic su ogni dispositivo a cui è probabile che tu lo dia.

## FAQ

### Perché il mio file .md si apre in un editor di codice?

Perché Windows e macOS scelgono l'applicazione dall'estensione del file, e niente viene con il reclamo di `.md`. Vince qualunque programma abbia registrato l'estensione più di recente, e su una macchina con strumenti per sviluppatori installati è di solito un editor di codice. Non dice niente sul contenuto del tuo file.

### Posso aprire un file .md in Word?

Word lo aprirà se lo punti direttamente al file, e lo tratterà come un documento di testo semplice — vedrai i cancelletti e gli asterischi, non intestazioni e grassetto. Word non è un renderer Markdown, quindi questo è utile solo per leggere la fonte. Se hai bisogno del documento in formato Word vero e proprio, convertilo invece di aprirlo.

### Qual è la differenza tra .md e .markdown?

Nessuna. Entrambe le estensioni significano lo stesso testo semplice che segue le stesse convenzioni, e `.mdown`, `.mkd` e `.mdwn` sono di nuovo la stessa cosa. Le sole estensioni che differiscono davvero sono `.mdx`, che mescola dentro componenti JavaScript, e `.rmd`, che è R Markdown con blocchi di codice eseguibile.

### È sicuro aprire un file .md che qualcuno mi ha mandato?

Leggerlo in un editor di testo è completamente sicuro: niente nel file viene eseguito e niente viene scaricato. Renderizzarlo è una domanda leggermente diversa, perché Markdown permette HTML grezzo, quindi un file `.md` può portare tag `<script>` e URL `javascript:` che un renderer fedele passa al tuo browser. Usa un visualizzatore che sanitizza l'HTML, e sappi che un editor di testo semplice evita del tutto il problema.

### Come cambio il programma che apre i file .md?

Su Windows: tasto destro, Apri con, Scegli un'altra app, seleziona il programma, spunta la casella che lo rende permanente — oppure impostalo da Impostazioni, App, App predefinite cercando `.md`. Su macOS: Ottieni informazioni, Apri con, scegli l'app, poi clicca Cambia tutti. Su Linux: la scheda Apri con del file manager, oppure `xdg-mime default <app>.desktop text/markdown`.

### Posso leggere un file .md sul telefono senza installare niente?

Sì. Toccalo in File su iOS o nel tuo file manager su Android e spesso otterrai il testo in un'anteprima. Per la formattazione senza installazione, apri un visualizzatore che gira nel browser in Safari o Chrome e scegli il file tramite il selettore della pagina — i browser mobili possono leggere un file locale in quel modo, che è la sola strada che funziona su entrambe le piattaforme.

### Devo convertire un file .md per leggerlo?

No. La conversione serve per quando qualcun altro deve leggerlo, o quando ti serve il documento in un altro formato. Per la tua lettura personale, un editor di testo o un visualizzatore bastano, e nessuno dei due cambia il file. Convertilo quando la destinazione è una persona, una stampante o un archivio piuttosto che il tuo stesso schermo.
