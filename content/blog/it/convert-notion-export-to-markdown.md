---
title: "Convertire un export di Notion in Markdown: ogni strada, id compresi"
description: Come pulire lo zip “Export as Markdown & CSV” di Notion — il suffisso id nei file, cosa risolve uno script e cosa risolve solo unire le pagine in un documento
date: 2026-09-14
tag: Conversione
keywords: convertire export notion in markdown, notion in markdown con id, rimuovere id notion dai file, notion to md, api notion markdown, esportare notion senza id, unire pagine notion in un documento
---

Il pulsante di export di Notion dice “Markdown & CSV” e consegna uno zip che, in senso tecnico, dice la verità. Apri l’archivio e ogni file è Markdown vero: intestazioni, elenchi, link, tutto leggibile in qualunque editor. Quello che non dice è che ogni nome di file e ogni link fra pagine porta ora con sé un id esadecimale di 32 caratteri, che un database è uscito come CSV separato che i tuoi file Markdown non richiamano, e che l’export è una fotografia di un istante, non una copia viva di niente.

Niente di tutto questo è un difetto. Notion identifica una pagina con il suo id e tratta il titolo come un’etichetta che può cambiare, quindi l’export deve piazzare l’id da qualche parte stabile — ed è nel nome del file che finisce. Il problema sta tutto a valle: una cartella di file che si puntano a vicenda per id va benissimo dentro Notion e diventa illeggibile come destinazione di una migrazione finché qualcosa non riscrive quei riferimenti.

### In breve

Tre strade funzionano davvero. **Esportare come Markdown & CSV, poi riscrivere gli id** è la strada generale: scompatta, costruisci una mappa dal suffisso id di ogni file al nome che vuoi davvero, riscrivi ogni link e ogni nome di file a partire da quella mappa. È lavoro manuale a dieci pagine e uno script a mille. **`notion-to-md`**, un pacchetto Node open source che legge le pagine attraverso l’API di Notion, si adatta meglio a una pipeline scriptata o alla build di un sito statico, perché non produce mai per prima cosa nomi con l’id in coda — il nome dell’output lo scegli tu. **Caricare lo zip dell’export direttamente su un convertitore che lo unisce** — [la conversione da Notion a Markdown di TransformPipe](/notion-to-markdown) è uno di questi — evita il problema dell’id in un terzo modo: ogni pagina diventa una sezione di un unico documento, nell’ordine originale, con un indice, e un link fra pagine mantiene le parole che mostrava invece di puntare a un file che non esisterà più. Scegli la prima per una cartella di file separati che continuerai a manutenere, la seconda per l’automazione, la terza per un documento solo da leggere o condividere.

Qualunque strada tu prenda, tre cose non sopravvivono a nessuna delle tre: i commenti, perché sono una discussione attaccata alla pagina e non contenuto della pagina; le viste non predefinite di un database, perché Notion esporta solo la vista che stai guardando; e i blocchi sincronizzati, che escono come il loro contenuto duplicato in ogni punto in cui erano mostrati, senza nessun segno che fossero mai lo stesso blocco.

## Perché l’id è lì, e perché non sparisce da solo

Una pagina in Notion riceve un UUID nel momento in cui viene creata. Il titolo è un metadato attaccato a quell’id, modificabile in qualsiasi momento, e non è mai il modo in cui l’export deve rintracciare una pagina. Così, quando l’export scrive `Meeting notes.md`, non ha nessuna garanzia che quel nome sia univoco — due pagine chiamate “Meeting notes” esistono nella maggior parte degli spazi di lavoro più vecchi di un anno — e risolve il problema scrivendo l’id dentro ogni nome di file che produce.

```text
Meeting notes 21f4c8a1b2c34d5e8f90123456789abc.md    the file on disk
Meeting%20notes%2021f4c8a1b2c34d5e8f90123456789abc.md    the link another page uses to reach it
meeting-notes.md    what you actually want to keep
```

Un link da una pagina a un’altra è scritto contro il nome esatto del file, con lo spazio codificato in percentuale. Rinomina il file per togliere l’id e ogni link che puntava al vecchio nome si rompe — in silenzio, perché un link relativo morto in una cartella di file Markdown non produce nessun errore finché qualcuno non ci clicca sopra. È tutto il problema della migrazione: la rinomina e la riscrittura dei link devono avvenire insieme, da un’unica mappa, in un solo passaggio.

## La finestra di export, e i limiti che non annuncia

L’export di Notion sta nel menu della pagina o dello spazio di lavoro sotto “Export”, con una scelta di formato fra PDF, HTML o Markdown & CSV, un menu “Include content” che può escludere file e immagini, un interruttore “Include subpages” e un interruttore “Create folders for subpages” (verificato su notion.com, 9 settembre 2026). Tre limiti dalla stessa schermata contano prima di pianificarci sopra una migrazione:

- Solo la vista corrente o predefinita di un database viene esportata. Tutte le viste insieme non sono supportate, e una vista modulo non si può esportare per niente — esce invece la vista tabella.
- Un export grande arriva via email come link di download invece di partire subito, il link scade dopo sette giorni e l’elaborazione può arrivare a trenta ore.
- Le sottopagine escono come cartelle annidate quando l’interruttore è attivo, il che è il motivo per cui la struttura di cartelle dello zip vale la pena di conservarla invece di appiattirla.

Quel tempo di elaborazione è un dato di programmazione, non una nota a margine. “Esporta lo spazio di lavoro venerdì pomeriggio, convertilo venerdì sera” presume un export che finisce in pochi minuti; per uno spazio di lavoro grande potrebbe non essere così.

## Confronto rapido: tre strade e quanto costa ciascuna

| Strada | Ideale per | Conserva | Perde | Installazione |
| --- | --- | --- | --- | --- |
| Export come Markdown & CSV, riscrittura degli id a mano o con uno script | Una cartella di file separati che continuerai a modificare | Ogni pagina, la struttura esatta, le righe dei database come CSV | Commenti, viste non predefinite, identità dei blocchi sincronizzati | Nessuna, o un breve script |
| `notion-to-md` tramite l’API di Notion | Un passaggio di build, un sito statico, una sincronizzazione pianificata | Quello che scrivi tu nel tuo renderer | Come sopra, più tutto ciò che il tuo renderer non implementa | Node, un token di integrazione |
| Caricare lo zip dell’export direttamente (TransformPipe) | Un documento solo da leggere o condividere | Ogni pagina in ordine, un indice, le righe dei database come tabella | Gli indirizzi dei link fra pagine, i commenti, le viste non predefinite | Nessuna |
| Copiare una pagina, incollarla in un editor | Una manciata di pagine, una volta | La formattazione che la destinazione capisce | Tutto ciò che riguarda la scala — non va oltre poche pagine | Nessuna |

## Esportare come Markdown & CSV, poi sistemare gli id

Questo è l’export descritto sopra, e il modo onesto di usarlo è trattare l’id come un dato utile invece che come rumore: è l’unica cosa nello zip che identifica una pagina in modo univoco e permanente, quindi è la chiave di join per la rinomina.

```text
1. Unzip the export.
2. Walk every .md and .csv filename, split off the trailing id, build id -> new-name.
3. Rewrite every filename using the map.
4. Walk every file's content, find links matching the export's own href pattern,
   look up the id in the same map, rewrite the href to the new name.
5. Flatten or keep the folder structure, depending on where the files are going.
```

| Pro | Contro |
| --- | --- |
| Nessuna nuova dipendenza, nessun account, nessun token API | La rinomina e la riscrittura dei link devono essere un solo passaggio su un’unica mappa, o metà dei link si rompe |
| Funziona offline, sui file che hai già | Il `.csv` di un database non viene ricongiunto automaticamente alla pagina a cui apparteneva |
| La strada più sicura quando la destinazione è una cartella di file che devono mantenere il proprio nome | Dieci pagine a mano costano una serata; mille a mano non sono realistiche |

**Dettagli tecnici.** L’id è di 32 caratteri esadecimali minuscoli, separato dal titolo da uno spazio (a volte un trattino basso, a seconda della versione del client che ha prodotto l’export). Un’espressione regolare ancorata alla fine del nome del file — togli prima l’estensione, poi individua l’id in coda — separa i due in modo affidabile. I link dentro il Markdown sono relativi e codificati in percentuale esattamente come il nome del file, quindi la stessa espressione regolare, applicata dopo la decodifica dell’URL, trova l’id anche dentro un link. Il `.csv` di un database sta accanto alla cartella della pagina che lo conteneva, con lo stesso schema di nome e il proprio suffisso id; ricongiungerlo alla pagina a cui appartiene è una corrispondenza sui nomi dei file, non qualcosa che l’export registri altrove.

**Per chi è?** Per chiunque abbia come destinazione una cartella di file Markdown che devono continuare a funzionare come file separati — un sito di documentazione con una pagina per URL, un import in un wiki dove ogni pagina diventa una voce a sé. L’output sono file veri con nomi veri; quello che costa è fare la riscrittura una volta, correttamente.

**Una versione minima dello script**, in schema piuttosto che come programma completo, perché conta di più la forma del linguaggio:

```text
map = {}
for file in list(export_folder, recursive=true):
    id = extract_trailing_hex(file.name_without_extension)
    map[id] = slugify(file.name_without_extension_or_id)

for file in list(export_folder, recursive=true):
    text = read(file)
    text = replace_all(text, LINK_PATTERN, (id) => map[id] ?? id)
    write(new_path_for(file, map), text)
```

`LINK_PATTERN` è un’espressione regolare sulla forma stessa dei link dell’export — un href relativo che finisce in `.md` o `.csv`, codificato in percentuale, con lo stesso id esadecimale in coda che porta il nome del file. Il dettaglio che fa cadere in errore al primo tentativo: esegui l’estrazione dell’id sull’href *decodificato*, non su quello grezzo con la codifica percentuale, perché `%20` non corrisponderà a un pattern scritto per uno spazio letterale.

**I database meritano un passaggio a parte.** Un database a pagina intera esce come `.csv` accanto a una cartella con un `.md` per ogni riga che aveva un corpo di pagina, e ogni file di riga porta il proprio suffisso id come fa una pagina. Ricostruire “la tabella, con un link alla pagina estesa per ogni riga che ne aveva una” è un join fra le righe del CSV e i nomi dei file della cartella, associati sulla colonna che Notion usava come titolo della pagina — cosa che né il CSV né i file per riga registrano esplicitamente come relazione.

## `notion-to-md`: evita il problema dell’id non scrivendolo mai

Notion pubblica anche un’API ufficiale, e leggere le pagine attraverso quella invece che dal pulsante di export evita del tutto il problema dei nomi dei file — niente nell’API costringe un id dentro un nome, perché sei tu a chiamare `writeFileSync` alla fine. [`notion-to-md`](https://github.com/souvikinator/notion-to-md) è il pacchetto open source più usato per questo: Node, open source, legge l’albero dei blocchi di una pagina tramite l’API e lo converte in Markdown, MDX o una manciata di altri formati. Scegli tu il nome del file di output, quindi non c’è niente da riscrivere dopo.

| Pro | Contro |
| --- | --- |
| Nessun suffisso id nell’output, mai — ogni file lo chiami tu | Richiede un token di integrazione e l’accesso all’API, un passaggio di configurazione che il pulsante di export non chiede |
| Si incastra naturalmente in uno script di build o in una sincronizzazione pianificata | Una pagina o una query di database alla volta; percorrere un intero spazio di lavoro è ricorsione tua da scrivere |
| Gira in CI senza browser e senza il clic manuale sull’export | Renderizza i blocchi che devi gestire tu oltre l’insieme comune — una vista di database, un blocco sincronizzato — con le stesse perdite dell’export |

**Prezzo:** gratis, open source — la licenza vale la pena controllarla da sé prima di dipenderne, perché i metadati del pacchetto pubblicato e il file `LICENSE` del repository al momento non coincidono (verificato su npmjs.com e github.com, 14 settembre 2026).

**Dettagli tecnici:** il pacchetto richiede i figli di una pagina come blocchi dall’API di Notion e converte l’albero dei blocchi in Markdown, con punti di aggancio per gestire i tipi di blocco che non copre di default. Serve un’integrazione creata nelle impostazioni di Notion e condivisa sulle pagine o sui database da leggere — un passaggio di permessi, non di codice, ed è il punto in cui questa strada parte più lenta di un clic su Export.

L’API stessa è limitata a una media di tre richieste al secondo per integrazione, con sopra un limite condiviso a livello di spazio di lavoro (verificato su developers.notion.com, 14 settembre 2026); una richiesta oltre il limite torna con un 429 e un’intestazione `Retry-After` invece dei dati, quindi uno script che percorre più di qualche decina di pagine ha bisogno del ciclo di attesa e ritentativo scritto fin dall’inizio, non aggiunto dopo il primo fallimento. Per una pagina sola o un piccolo database non conta mai; per un intero spazio di lavoro è la differenza fra uno script che finisce e uno che sembra bloccato.

**Per chi è?** Un sito statico che prende i contenuti da Notion a ogni build, un job pianificato che rispecchia uno spazio di lavoro dentro un repository git, o qualunque caso in cui “esporta a mano periodicamente” sia la forma sbagliata per come il contenuto cambia davvero.

## Cosa succede a immagini, file e allegati

Ogni strada gestisce i contenuti multimediali in modo diverso, e vale la pena controllarlo prima di affidare a una qualunque di esse una pagina con più immagini che testo.

L’export Markdown & CSV scrive le immagini di ogni pagina in una cartella accanto al suo `.md`, con nomi generati, raggiunte dal Markdown con percorsi relativi codificati in percentuale — validi solo per quanto la cartella delle immagini viaggi insieme al file a cui appartiene (la stessa fragilità che [i percorsi relativi portano sempre con sé](/blog/images-and-links-that-still-work)). Sposta il `.md` da solo e ogni riferimento a un’immagine si rompe senza nessun avviso, perché niente controlla che la cartella sia venuta insieme.

`notion-to-md` restituisce i blocchi immagine come sintassi Markdown ordinaria che punta agli URL temporanei di Notion, che scadono — il pacchetto non scarica il file per te, quindi uno script su questa strada ha bisogno di un passaggio proprio per recuperare ogni URL di immagine prima che scada e riscrivere il Markdown perché punti a una copia locale.

Una strada di unione e caricamento prima vedeva soltanto quello che diceva il testo dello zip, e un percorso relativo rotto restava rotto uguale. Ora anche le immagini vengono lette dall’archivio e portate dentro il documento stesso, così non resta più nessun percorso da rompere: l’immagine viaggia dentro il Markdown, dentro l’esportazione in HTML e dentro tutto ciò che viene condiviso da lì. Il tetto è di due megabyte di immagini per documento e uno per immagine — un documento salvato deve stare in quattro — e un’immagine oltre quel limite mantiene il link che aveva, il che non è peggio di prima.

## Caricare lo zip dell’export direttamente, unito in un unico documento

Il problema dell’id dell’export sparisce in un terzo modo se la destinazione non è mai stata una cartella di file separati: [la conversione da Notion a Markdown di TransformPipe](/notion-to-markdown) prende lo zip “Export as Markdown & CSV” senza modificarlo, unisce ogni pagina in un unico documento nel suo ordine originale con un indice generato, e trasforma un link fra pagine nelle parole che mostrava invece che in un nome di file che non si risolverà più una volta che le pagine sono sezioni dello stesso documento. Un database torna come tabella, nello stesso documento.

| Pro | Contro |
| --- | --- |
| Nessuna rinomina, nessuna mappa di id, nessuno script | Produce un documento solo — non la forma giusta se le pagine devono restare file separati con un proprio URL |
| Ogni pagina in ordine, con un indice costruito per te | I link fra pagine mantengono il testo, non l’indirizzo — non c’è più nessun posto dove puntare una volta uniti |
| Gira nel browser; lo zip non viene caricato da nessuna parte quando non hai fatto l’accesso | Le viste non predefinite dei database e i commenti restano assenti, perché l’export non li aveva mai |

**Prezzo:** gratis, gira in locale nel browser.

**Per chi è?** Per chiunque avesse come obiettivo reale un documento solo leggibile — un export di wiki trasformato in un unico file di consegna, uno spazio di lavoro archiviato come una cosa sola da leggere più avanti — invece di una cartella di pagine che hanno ciascuna bisogno del proprio indirizzo.

## Dove tutte e tre le strade falliscono nello stesso modo

**I commenti.** Un thread di commenti è attaccato a una pagina, non scritto nel suo contenuto, quindi nessuna delle tre strade sopra lo vede. Se una decisione esiste solo come risposta in un thread di commenti, copiala nel corpo della pagina prima di esportare qualunque cosa — dopo è sparita, non semplicemente non convertita.

**Le viste non predefinite dei database.** Notion esporta la vista che hai aperta, non tutte le viste che un database possiede. Un database filtrato in tre modi diversi per tre pubblici diversi esporta come una di quelle tre, e le altre due non sono recuperabili dall’export in nessun modo — vanno ricostruite dalle righe di partenza.

**I blocchi sincronizzati.** Un blocco sincronizzato mostra lo stesso contenuto in più punti alla volta dentro Notion. L’export non ha nessun concetto di “lo stesso blocco, mostrato due volte” — ogni punto in cui appariva riceve la sua copia del contenuto, quindi modificarne una dopo la migrazione non aggiorna più l’altra, e niente nel file segna che fossero mai collegati.

## Come scegliere

1. **Decidi prima la forma della destinazione.** File separati con un proprio URL vuole la strada della riscrittura o `notion-to-md`. Un documento solo vuole la strada dell’unione. Scegliere dopo aver convertito significa rifare il lavoro.
2. **Chiediti quanto spesso succederà.** Una volta sola, e l’export manuale più riscrittura è finito prima che un’integrazione API venga approvata. Ogni settimana o a ogni deploy, e `notion-to-md` in un passaggio di build si ripaga da solo entro un mese.
3. **Controlla commenti e viste non predefinite prima di esportare, non dopo.** Entrambi sono invisibili nell’output senza nessun errore che li segnali, quindi l’unico controllo affidabile è guardare la fonte dentro Notion per primo.
4. **Conta le pagine.** Dieci pagine tollerano una riscrittura manuale degli id. Cento vogliono uno script. Mille vogliono la strada dell’API, perché nemmeno cliccare Export e aspettare fino a trenta ore scala bene.

Se la domanda è quale strumento piuttosto che quale strada — sono tutti gratuiti, e quello che li separa è il costo di configurazione più che il prezzo — [il confronto fra i convertitori Notion gratuiti](/blog/free-notion-to-markdown-converter) è la risposta più breve.

## Conclusione

L’export di Notion è Markdown onesto che porta un id che non riesce a togliersi da solo. Riscrivere quell’id da una mappa lo risolve per una cartella di file che devono restare file; leggere lo spazio di lavoro tramite l’API e scegliere tu il nome dell’output lo risolve per qualunque cosa scriptata; unire l’export in un documento solo lo risolve in un terzo modo, togliendo del tutto il bisogno che l’id si risolva in qualcosa. Quello che nessuna delle tre strade recupera è quello che l’export non ha mai avuto — un thread di commenti, una vista di database che non stavi guardando, o l’identità di un blocco sincronizzato — quindi l’unico controllo che vale la pena fare prima di esportare qualunque cosa è confermare che quelle cose non contino per quello che stai per perdere. [Continua a leggere](/blog/markdown-from-notion-obsidian-and-confluence) su come Confluence e Obsidian si confrontano sullo stesso problema.

## Domande frequenti

### Notion può esportare direttamente in Markdown pulito, senza id nel nome del file?

Non tramite il pulsante di export — Markdown & CSV aggiunge sempre l’id, perché il titolo da solo non è un nome di file affidabile. La strada `notion-to-md`, che legge le pagine tramite l’API, è il modo per avere nomi di file scelti da te, perché li scrivi tu stesso invece di accettare quello che produce un export.

### Perché i link esportati puntano a nomi di file con codici lunghi dentro?

Perché Notion identifica le pagine con un id, il titolo è solo un’etichetta, e l’export scrive l’id nel nome del file per mantenere i nomi univoci. Il link e il nome del file usano lo stesso id, il che è quello che rende possibile una riscrittura: costruisci una mappa dall’id al nome che preferisci, poi riscrivi entrambi insieme.

### L’export include le viste di database diverse da quella che avevo aperto?

No. Viene esportata solo la vista corrente o predefinita, e la finestra di export di Notion non offre “tutte le viste” come opzione. Una vista modulo in particolare non si può esportare per niente — esporta invece la vista tabella dello stesso database.

### I commenti di Notion sono inclusi in un export?

No, in nessuno dei formati che Notion offre. Un commento è attaccato a una pagina come discussione, non conservato come contenuto della pagina, quindi non raggiunge mai PDF, HTML o Markdown & CSV. Copia nel corpo della pagina qualunque cosa rilevante per una decisione prima di esportare.

### Cosa succede a un blocco sincronizzato quando lo esporto?

Esce come contenuto ordinario in ogni punto in cui era mostrato, senza nessuna indicazione che le copie fossero mai lo stesso blocco. Modificare una copia dopo la migrazione non aggiornerà le altre, perché la relazione sincronizzata esisteva solo dentro Notion.

### Posso convertire un export di Notion senza caricare da nessuna parte il mio spazio di lavoro?

Sì, se il convertitore gira nel browser invece che su un server — vale la pena verificarlo per uno spazio di lavoro che contiene qualcosa di sensibile, aprendo il pannello di rete e controllando che non esca niente durante la conversione.

### Quanto tempo richiede un export di Notion?

Gli export piccoli finiscono subito come download diretto. Uno grande arriva via email come link invece di scaricarsi immediatamente, quel link scade dopo sette giorni, e la documentazione di Notion stessa prevede fino a trenta ore di elaborazione — pianifica l’export ben prima della scadenza che ne dipende, non lo stesso pomeriggio.

### C’è un limite di frequenza se leggo uno spazio di lavoro tramite l’API invece di esportarlo?

Sì: una media di tre richieste al secondo per integrazione, più un limite separato condiviso su tutto lo spazio di lavoro. Uno script che legge più di una manciata di pagine dovrebbe gestire una risposta `429` aspettando la durata indicata nella sua intestazione `Retry-After` e ritentando, invece di trattare l’errore come un fallimento.
