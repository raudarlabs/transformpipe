---
title: "Convertitore Obsidian-Markdown gratuito: tutte le opzioni a confronto"
description: "Un vault Obsidian è già Markdown, quindi non c’è niente da comprare: ecco gli strumenti gratuiti che sistemano wikilink, embed, riferimenti ai blocchi e callout"
date: 2026-09-14
tag: Conversione
keywords: convertitore obsidian markdown gratis, esportare vault obsidian gratis, convertire obsidian in markdown, da obsidian a markdown gratuito, convertitore obsidian markdown online, plugin export obsidian gratuito
---

Chi cerca un convertitore da Obsidian a Markdown gratuito di solito ha già scoperto la parte imbarazzante: non c’è niente da comprare, perché non c’è niente da convertire. Un vault Obsidian è una cartella di file `.md` su disco. Puoi aprirne uno con il Blocco note, o mettere tutto quanto in un repository, senza toccare nessun convertitore. Il formato di partenza è il formato di destinazione.

Eppure quella ricerca si ripete di continuo, perché quei file smettono di funzionare appena escono. Una nota che dentro Obsidian si legge alla perfezione arriva altrove portandosi dietro `[[Project Brief]]` fra doppie parentesi quadre, un marcatore `> [!warning]` stampato come testo letterale in cima a una citazione, e un `![[diagram.png]]` che non mostra niente. Quello che la gente sta cercando non è un cambio di formato. È un lavoro di riparazione su quattro costrutti che Obsidian si è inventato, e ogni strumento che valga la pena confrontare è una risposta diversa a come si riparano quei quattro.

Il che riformula la questione del prezzo in modo utile. Quando il formato di base è gratuito e i file di partenza sono già tuoi, “gratis” smette di essere uno sconto e diventa la condizione normale. Quello che le opzioni costano davvero è configurazione, controllo e quanta struttura del vault sei disposto a perdere nello scambio.

### In breve

Ogni opzione seria qui è gratuita, quindi si sceglie sulla forma invece che sul prezzo. **Il convertitore nel browser su [/obsidian-to-markdown](/obsidian-to-markdown)** prende un vault compresso in zip e restituisce un unico documento con un indice, i wikilink ridotti alle parole che mostravano e il frontmatter rimosso — nessuna installazione, niente caricato quando non hai fatto l’accesso, e la risposta giusta quando la destinazione è un unico documento leggibile. **[obsidian-export](https://github.com/zoni/obsidian-export)** è una CLI gratuita scritta in Rust (BSD-2-Clause-Patent, verificato su github.com/zoni/obsidian-export, 14 settembre 2026) che percorre un vault e scrive dall’altra parte file CommonMark con link ed embed risolti — quello che vuoi quando il vault deve restare una cartella di file separati. **L’impostazione “Use \[\[Wikilinks\]\]” di Obsidian** non costa niente e non sistema niente all’indietro. **Un plugin di export della community** esporta una nota o una cartella con le sue immagini al seguito, da dentro Obsidian stesso. **Pandoc** è gratuito e GPL, e legge i wikilink solo dietro un’estensione non attiva di default — senza un indice del vault non può risolvere `[[Note]]` in un percorso come fa Obsidian. **Uno script scritto da te** è l’unica strada che ti lascia decidere che cosa succede a un nome di file duplicato. Per il dettaglio della sintassi dietro a tutto questo, [la guida completa copre il dialetto nota per nota](/blog/convert-obsidian-vault-to-markdown).

## Perché una cartella di file Markdown ha comunque bisogno di un convertitore

Il motivo per cui questo lavoro esiste è che il dialetto di Obsidian è un sovrainsieme, e le aggiunte non sono segnalate come aggiunte da nessuna parte nel file. Non c’è un indicatore, non c’è un namespace, non c’è una regione delimitata che dica “questo pezzo è nostro”. Un wikilink sembra identico a del testo normale con delle parentesi dentro, che è precisamente il motivo per cui un parser standard lo tratta come testo normale con delle parentesi dentro.

Quattro costrutti causano quasi tutto il danno, e sono l’intera base su cui gli strumenti qui sotto si differenziano:

**I wikilink** — `[[Note]]`, `[[Note|Testo mostrato]]`, `[[Note#Intestazione]]` — si risolvono dentro Obsidian contro un indice dell’intero vault, trovando un file per nome ovunque si trovi e anche contro il frontmatter `aliases`. Fuori dal vault quell’indice non c’è più, quindi non resta niente contro cui risolvere.

**Gli embed.** `![[Note]]` inserisce un’altra nota in linea al momento della visualizzazione; `![[image.png]]` mostra un allegato. Il Markdown standard ha una sintassi per le immagini e nessuna sintassi per la transclusione, quindi l’embed di una nota non ha nessun equivalente in cui convertirsi — solo una scelta fra inserire una copia e scendere a un link semplice.

**I riferimenti ai blocchi.** `[[Note#^block-id]]` punta a un paragrafo tramite un id aggiunto alla riga di quel paragrafo. Quando l’id sparisce, il riferimento non si rompe: smette di riferirsi a qualcosa.

**I callout.** `> [!note]`, `> [!warning]` e compagnia sono citazioni a blocchi con un marcatore tipizzato sulla prima riga. Ovunque altro, il marcatore è testo.

Un quinto elemento non è un costrutto ma un errore di categoria che vale la pena nominare subito: tutto ciò che un plugin rendeva invece di scrivere. Una query Dataview è salvata come blocco di codice delimitato che contiene la domanda, e la tabella che produceva veniva generata all’apertura, ogni volta. Nessun convertitore, gratuito o meno, la recupera, perché non c’è niente da recuperare. Il frontmatter e i `%%commenti in linea%%` completano l’elenco, entrambi facili da gestire se lo strumento si prende la briga — [quello che i convertitori fanno con il front matter](/blog/front-matter-and-what-converters-do-with-it) in generale si applica qui senza modifiche.

## Che cosa costa il gratis, in ogni direzione

Visto che la colonna del prezzo qui sotto dice “gratis” in ogni riga, conviene essere espliciti su che cosa varia al suo posto.

**Il costo di configurazione.** Una pagina nel browser è zero. Un binario Rust è uno scaricamento o un `cargo install`. Un plugin della community è un plugin che adesso mantieni tu. Uno script è un pomeriggio, e poi per sempre.

**Il controllo sull’ambiguità.** Due note chiamate `Meeting Notes.md` in cartelle diverse sono ambigue per un `[[Meeting Notes]]` nudo anche dentro Obsidian, che risolve con una regola interna sua. Ogni strumento automatico eredita quell’ambiguità invece di risolverla; solo il codice scritto da te ti lascia decidere quale delle due vince.

**La forma dell’output.** Il vero bivio, e non una differenza di qualità: alcuni strumenti producono una cartella di file con link relativi funzionanti fra di loro, altri producono un documento solo, il che elimina del tutto il bisogno di una destinazione per i link.

**Dove va a finire il vault.** Un vault è spesso la cosa più personale che una persona possieda in forma di testo, quindi un convertitore che gira in locale e uno che carica hanno lo stesso prezzo e non sono la stessa transazione — la versione generale di questa domanda è [se un convertitore online sia sicuro](/blog/is-an-online-converter-safe).

## Confronto rapido: il bigliettino

| Strumento | Ideale per | Capacità principale | Prezzo |
| --- | --- | --- | --- |
| TransformPipe | Un vault, o una sua parte, che deve diventare un unico documento leggibile | Vault in zip in ingresso, un documento con indice in uscita, wikilink e frontmatter gestiti nello stesso passaggio | Gratis |
| obsidian-export | Un vault che deve restare una cartella di file separati e collegati | Export ricorsivo da vault a CommonMark, con i link `[[note]]` e gli embed `![[note]]` risolti | Gratis, BSD-2-Clause-Patent |
| L’impostazione “Use \[\[Wikilinks\]\]” di Obsidian | Impedire che l’arretrato cresca | Scrive link standard `[testo](percorso)` per tutto ciò che crei dopo la modifica | Gratis, integrata |
| Un plugin di export della community | Esportare una nota o una cartella da dentro Obsidian | Impacchetta le immagini collegate insieme al Markdown esportato | Gratis |
| Pandoc | Un vault che è uno degli input di una build documentale che già esegui | Supporto ai wikilink dietro un’estensione non predefinita, verso qualunque formato Pandoc sappia scrivere | Gratis, GPL |
| Uno script scritto da te | Nomi di file duplicati, alias e regole che conosci solo tu | Controllo esatto su ogni caso ambiguo, e niente altro di cui fidarsi | Gratis, costa tempo |

## Le opzioni, una alla volta

### TransformPipe — ideale quando il vault deve diventare un documento solo

Comprimi la cartella del vault in zip, lascia cadere l’archivio su [/obsidian-to-markdown](/obsidian-to-markdown) e ogni nota torna indietro come sezione di un unico documento Markdown, in ordine di percorso, sotto un indice generato. Non c’è nessuna installazione, non serve nessun account, e senza aver fatto l’accesso l’archivio viene letto dalla pagina direttamente dal tuo disco invece che spedito da qualche parte.

La scelta progettuale che sta sotto fa sparire il problema dei wikilink invece di risolverlo: quando ogni nota è una sezione dello stesso documento, non c’è nessun file separato a cui un link possa puntare. Così `[[Project Brief]]` diventa le parole *Project Brief*, `[[Project Brief|il brief]]` diventa *il brief*, e `[[Project Brief#Scope]]` diventa *Project Brief* — in ogni caso il testo che il lettore stava già vedendo. Una perdita se volevi link navigabili; esattamente giusto se volevi qualcosa che una persona possa leggere dall’inizio alla fine.

| Pro | Contro |
| --- | --- |
| Nessuna installazione, nessun binario, nessun plugin — uno zip e una scheda del browser | Un documento solo, non una cartella di file: la forma sbagliata se le note devono restare indirizzabili separatamente |
| Wikilink, etichette con `\|` in stile alias e ancore `#intestazione` si riducono tutti alle parole mostrate in un unico passaggio | I link diventano testo semplice invece che link funzionanti, perché non resta nessuna destinazione esterna |
| Il frontmatter viene rimosso invece di essere reso come una linea orizzontale vagante e un blocco di rumore chiave-valore, e un embed di immagine diventa l’immagine stessa | Il tetto è di due megabyte di immagini per documento, e un allegato che non è un’immagine resta testo segnaposto in corsivo |
| Un indice generato, così un vault da cento note è navigabile dall’alto | Le tabelle Dataview e le altre viste rese dai plugin sono assenti, come lo sono per qualunque strada |
| Gira nel browser; il vault non viene caricato se non hai fatto l’accesso | Un vault molto grande è limitato dalla macchina che fa il lavoro |

**Prezzo:** gratis. Un account aggiunge cronologia e condivisione, anche questi gratis.

**Dettagli tecnici e funzioni**

- Dell’archivio vengono lette solo le voci `.md`, ordinate per percorso completo dentro lo zip, che è ciò che fissa l’ordine delle sezioni nell’output — rinomina una cartella e l’ordine cambia con lei
- Il titolo di una nota viene dal nome del file invece che da qualcosa scritto al suo interno, in linea con il modo in cui Obsidian stesso identifica le note; se la prima riga di quella nota ripete il titolo come H1, il doppione viene eliminato invece di essere stampato due volte
- La riscrittura dei wikilink copre `[[Target]]`, `[[Target|Mostrato]]`, `[[Target#Intestazione]]` e `[[Target#Intestazione|Mostrato]]`, più la forma con embed `![[...]]` di ciascuno
- Un embed la cui destinazione è un’immagine presente nello zip diventa quell’immagine, portata dentro il documento; uno la cui destinazione è un altro file di documento o media riconosciuto diventa testo in corsivo che lo nomina, invece di un riferimento rotto a un file che non c’è
- Il blocco di frontmatter YAML in cima a una nota viene rimosso prima che parta qualunque altra cosa
- Le sezioni sono unite con una linea orizzontale in mezzo, la stessa convenzione che l’app usa per [unire più file Markdown in uno](/blog/merging-many-markdown-files)

**Per chi è?** Per chi consegna un vault, o le note di un progetto ricavate da uno, a una persona che Obsidian non lo usa — un cliente, un archivio, un passaggio di consegne, un documento che va letto invece che navigato. Non è lo strumento per un vault che dall’altra parte deve continuare a funzionare come grafo collegato.

### obsidian-export — ideale quando il vault resta una cartella di file

obsidian-export è un programma da riga di comando e una libreria Rust che percorre un vault e scrive dall’altra parte CommonMark semplice, un file in ingresso per un file in uscita. È la cosa più vicina a un convertitore gratuito costruito apposta per questo lavoro senza essere un plugin, e la sua documentazione precisa con cura che non è approvato ufficialmente da Obsidian e che supporta gran parte del dialetto ma non tutto.

| Pro | Contro |
| --- | --- |
| Conserva la forma delle cartelle: file separati con i link fra loro risolti, non appiattiti | Uno strumento da riga di comando, quindi un terminale è un prerequisito |
| Gestisce sia i riferimenti `[[note]]` sia le inclusioni di file `![[note]]`, non solo i link semplici | Non approvato da Obsidian, e il suo stesso README dice che la copertura del dialetto è parziale |
| I pattern di esclusione usano la sintassi di gitignore, e i file già ignorati da git sono saltati di default | Assume UTF-8 per il testo delle note e per i nomi dei file, con conversione con perdita altrimenti |
| Il comportamento sul frontmatter è un’opzione invece di una decisione fissa | Un altro binario da installare e tenere aggiornato |
| Scriptabile, quindi l’export è ripetibile invece di essere una cosa che qualcuno si ricorda | Un export parziale ha regole che conviene leggere prima |

**Prezzo:** gratis, BSD-2-Clause-Patent secondo il `Cargo.toml` del progetto stesso (verificato su github.com/zoni/obsidian-export, 14 settembre 2026).

**Dettagli tecnici e funzioni**

- `obsidian-export /path/to/vault /path/to/output` è tutta l’invocazione di base; la cartella di destinazione deve esistere già
- `--start-at` esporta un sottoinsieme del vault continuando però a trattare l’intero vault come contesto di risoluzione, così i link che escono dal sottoinsieme esportato restano intatti. Indicare invece un singolo file come sorgente non risolve deliberatamente nulla — la documentazione lo definisce voluto
- `--frontmatter=never` rimuove del tutto il frontmatter, `--frontmatter=always` inserisce un blocco vuoto per i generatori di siti statici che ne pretendono uno, e il comportamento predefinito lo copia così com’è
- I file nascosti, i percorsi che corrispondono a un file `.export-ignore` e tutto ciò che git già ignora sono esclusi di default, ognuno regolabile con la sua opzione
- `--skip-tags` e `--only-tags` filtrano le note in base ai tag del frontmatter, che è un modo davvero utile per esportare la metà pubblica di un vault
- Una nota che punta a una nota esclusa viene slegata invece di restare a puntare nel vuoto — il testo del link sopravvive, il link no
- Due note che si incorporano a vicenda sono un errore per impostazione predefinita, con `--no-recursive-embeds` che spezza il ciclo inserendo un link al secondo incontro

**Per chi è?** Per chiunque esporti un vault dentro un sito statico, un repository di documentazione, o qualunque posto in cui le note debbano conservare la propria identità individuale e i propri link reciproci. È lo strumento gratuito che corrisponde più da vicino al modello mentale di “esporta il mio vault” come lo intende la maggior parte delle persone.

### L’impostazione “Use \[\[Wikilinks\]\]” di Obsidian — gratuita, integrata, e solo metà soluzione

L’impostazione sta sotto Settings, Files and links: disattiva “Use \[\[Wikilinks\]\]” e Obsidian scrive link Markdown standard `[testo](percorso)` per tutto ciò che crei da quel momento in poi (verificato su obsidian.md e tramite la documentazione delle impostazioni di Obsidian, 14 settembre 2026). Il completamento automatico non cambia — scrivi `[[`, scegli la nota — cambia solo la sintassi scritta su disco.

| Pro | Contro |
| --- | --- |
| Non costa niente e non aggiunge nessuno strumento, plugin o dipendenza | Guarda solo in avanti: ogni link scritto prima della modifica resta intoccato |
| L’esperienza di scrittura non cambia per niente — stesso completamento, stesso flusso | Riguarda solo i link semplici; embed, riferimenti ai blocchi e callout non sono toccati |
| Rende il vault progressivamente più portabile senza nessun evento di migrazione | Non è una conversione in nessun senso — un vault già avviato ha comunque bisogno di una passata di riscrittura |

**Prezzo:** gratis, fa parte dell’app. Obsidian stesso è gratuito per uso personale, con una licenza commerciale a $50 per utente all’anno per l’uso professionale in un’organizzazione, e i componenti aggiuntivi opzionali Sync e Publish a prezzo separato (verificato su obsidian.md, 14 settembre 2026).

**Per chi è?** Per tutti, indipendentemente da quale altra opzione scegli per l’arretrato. È l’unica voce di questa pagina priva di compromessi, perché non prova nemmeno ad affrontare la parte difficile.

### Un plugin di export della community — ideale per una nota o una cartella, da dentro Obsidian

La directory dei plugin della community di Obsidian contiene plugin di export, e [obsidian-markdown-export-plugin](https://github.com/bingryan/obsidian-markdown-export-plugin) è un esempio reale e attivamente aggiornato: esporta una singola nota o un’intera cartella come pacchetto con le immagini collegate insieme al Markdown, da un comando dentro Obsidian invece che da uno strumento separato.

| Pro | Contro |
| --- | --- |
| Gira da dentro l’app, sulla nota che stai guardando | Il repository non contiene nessun file di licenza, cosa che conta se intendi fare un fork o incorporarne il codice (verificato su github.com/bingryan/obsidian-markdown-export-plugin, 14 settembre 2026) |
| Tiene le immagini come file accanto al Markdown esportato, mentre la strada dell’unione in un documento le mette dentro il documento | Un plugin della community è una dipendenza con il suo ritmo di rilascio e le sue decisioni |
| Ha un’opzione per l’output in GitHub Flavored Markdown, la variante su cui quasi tutte le destinazioni concordano | Come gestisce riferimenti ai blocchi, callout e contenuti resi dai plugin è una scelta del plugin, non tua |
| Esporta cartelle oltre che singoli file, e può anche produrre HTML | L’export via plugin scala male su un vault intero rispetto a una CLI che puoi scriptare |

**Prezzo:** gratis, installato dal browser dei plugin della community di Obsidian.

**Dettagli tecnici e funzioni**

- Le capacità documentate sono l’export di cartelle e di singoli file, l’inclusione degli allegati immagine, un’opzione per l’output in GitHub Flavored Markdown, la gestione dei contenuti incorporati e l’output come `md` oppure `html` (verificato su github.com/bingryan/obsidian-markdown-export-plugin, 14 settembre 2026)
- L’installazione è il solito percorso dei plugin della community: Settings, community plugins, browse, cerca “markdown export”
- Siccome gira dentro Obsidian, ha accesso allo stesso indice del vault che Obsidian stesso usa per risolvere un link — il vantaggio strutturale che i plugin hanno su ogni strumento esterno qui elencato

La solita cautela sui plugin della community vale senza bisogno di farne un dramma: prima di affidarti a uno per qualcosa che non potresti rifare a mano, controlla la sua scheda attuale per lo stato di manutenzione e leggi che cosa fa con i costrutti che hai davvero. Un plugin che elimina i callout in silenzio va benissimo se di callout non ne hai.

**Per chi è?** Per chi esporta una manciata di note alla volta, con le immagini, e preferisce restare dentro Obsidian invece di imparare uno strumento da terminale. Gli allegati sono la funzione decisiva — è l’unica opzione di questa pagina che li porta fuori insieme al testo.

### Pandoc — ideale quando il vault è uno degli input

Pandoc è il convertitore di documenti generalista, gratuito e con licenza GPL (verificato su pandoc.org, 14 settembre 2026), e si guadagna una riga qui per chi lo ha già dentro una build. I wikilink li conosce, ma a condizioni che conviene capire prima di ricorrervi.

| Pro | Contro |
| --- | --- |
| Già installato su moltissime macchine che costruiscono documentazione | Nessun indice del vault: non può risolvere `[[Note]]` in `cartella/Note.md` come fa Obsidian |
| L’analisi dei wikilink è disponibile tramite un’estensione documentata | Le estensioni non sono predefinite, quindi un semplice `-f markdown` lascia i wikilink come testo letterale |
| Scrive verso ogni formato di output che Pandoc supporta, dallo stesso input | Non sa niente di callout, riferimenti ai blocchi o Dataview — passano attraverso per quello che testualmente sono |
| Si combina con i filtri, quindi una riscrittura personalizzata può girare dentro la conversione | Per natura lavora file per file; un vault è un ciclo che scrivi tu attorno a lui |

**Prezzo:** gratis, licenza GPL.

**Dettagli tecnici e funzioni**

- `--from=markdown+wikilinks_title_after_pipe` abilita l’analisi di `[[Wiki]]` e `[[URL|titolo]]`; `wikilinks_title_before_pipe` è l’immagine speculare, `[[titolo|URL]]` (verificato nel manuale di Pandoc su pandoc.org, 14 settembre 2026)
- Entrambe compaiono nella sezione delle estensioni non predefinite del manuale, quindi nessuna delle due è attiva se non la nomini. Obsidian mette prima la destinazione e dopo la barra verticale il testo mostrato, il che rende `wikilinks_title_after_pipe` quella che corrisponde a un vault
- Quello che l’estensione ti dà è un link la cui destinazione è il testo letterale dentro le parentesi — utile, e non la stessa cosa di un percorso relativo risolto verso un file altrove nel vault
- Un filtro Lua è il modo onesto di colmare quella distanza: analizzi la destinazione del link, la cerchi in un indice che hai costruito tu dal vault, e riscrivi la destinazione

**Per chi è?** Per chi ha le note come uno degli input di una build che già esegue Pandoc per altri motivi. Come convertitore Obsidian a sé stante è l’opzione più debole qui, perché la parte difficile — la risoluzione su tutto il vault — è precisamente quella che non fa.

### Uno script scritto da te — ideale per i casi che nessun altro può decidere

L’ultima opzione gratuita è quella senza nessuno strumento dentro. Percorri il vault, costruisci un indice di ogni nome di file e di ogni alias, individua i pattern dei wikilink e degli embed, risolvi ogni destinazione contro quell’indice, riscrivi sul posto.

| Pro | Contro |
| --- | --- |
| L’unica strada in cui decidi tu a che cosa si risolve un nome di file duplicato | Adesso stai mantenendo un convertitore |
| Alias, regole sui tag e convenzioni di cartelle specifiche del tuo vault si possono codificare tutte | Ogni caso limite del dialetto tocca a te scoprirlo, di solito dopo l’export |
| Nessuna dipendenza, nessun plugin, nessun binario, e niente di cui fidarsi se non codice che puoi leggere | Più lento di ogni altra opzione qui ad arrivare al primo risultato, e i fallimenti interessanti sono silenziosi |

**Prezzo:** gratis, pagato in tempo.

**Dettagli tecnici e funzioni**

- Una sola espressione regolare su `!?\[\[target(#heading)?(\|shown)?\]\]` cattura tutta la famiglia, embed compresi; la guida linkata sopra passa attraverso una versione funzionante con il suo risolutore
- La risoluzione deve cercare per nome di file in tutto il vault, non nella cartella della nota che linka, perché è quello che fa Obsidian; un risolutore limitato alla cartella produce link morti per ogni nota conservata altrove e non segnala niente
- L’indice ha bisogno del frontmatter `aliases` di ogni nota accanto al suo nome di file, altrimenti un link scritto verso il vecchio titolo di una nota rinominata scivola giù a testo semplice
- Tieni un vault di prova con uno di ogni costrutto dentro — un callout, un embed, un riferimento a un blocco, un link con alias, un nome di file duplicato — e prova ogni modifica contro quello

**Per chi è?** Per chiunque stia spostando un vault grande e di lunga vita in un posto in cui deve continuare a funzionare, dove un link morto silenzioso è peggio di un pomeriggio passato a scrivere codice. E anche per chi ha provato uno degli strumenti qui sopra e ha trovato una regola con cui non è d’accordo.

## Dove la scelta gratuita e ovvia non regge

La scelta gratuita ovvia, per quasi tutti, è “basta copiare la cartella” — il vault è Markdown, quindi spostalo e amen. Dove questo fallisce vale la pena dirlo con precisione, perché i fallimenti sono silenziosi e arrivano dopo.

**I link sembrano a posto finché qualcuno non ci clicca.** In un editor di testo semplice `[[Project Brief]]` è leggibile e un lettore lo capisce. In un README di GitHub reso o in un sito statico è leggibile e morto. Non dà nessun errore; la pagina si porta dietro un pezzo di testo che sembra volere essere un link, e il lettore pensa che sia rotto il sito e non la sorgente.

**I callout perdono l’enfasi e conservano le parole.** Una citazione `> [!warning]` perde lo stile e conserva il testo, quindi una nota che usava il colore del callout per distinguere “fai questo” da “non farlo mai” adesso si legge come due citazioni identiche. È peggio che perdere il contenuto, perché il contenuto è lì e il suo peso è sparito.

**Gli allegati si rompono in un modo che il testo non mostra.** Le immagini vivono in una cartella di allegati citata da un embed. Copia i file `.md` senza quella cartella e ogni immagine sparisce; copia la cartella in una posizione relativa diversa e ogni immagine sparisce in un modo identico a vedersi. Il Markdown è invariato e corretto in entrambi i casi.

**Un riferimento a un blocco non è un link rotto, è il nulla.** `[[Note#^a1b2c3]]` fuori da Obsidian punta a un id che non esiste più da nessuna parte in nessun file. Non c’è nessuna destinazione da sistemare e nessun ripiego da rendere. L’unica riparazione onesta è inserire in linea il testo a cui si puntava, il che vuol dire avere ancora il vault aperto in Obsidian per vedere qual era.

**Il contenuto reso dai plugin non lascia traccia di essere mai esistito.** Una nota il cui valore era interamente una tabella Dataview si converte in un blocco di codice che contiene una query. Per un lettore che il vault non l’ha mai usato, quella nota adesso sembra essere sempre stata un frammento. Controlla dove stanno queste cose mentre il vault le rende ancora.

**E il frontmatter a volte regge il peso.** Può essere l’unico posto in cui una nota abbia registrato da dove venisse o di chi parlasse. La strada dell’unione lo rimuove automaticamente, il che è giusto per la leggibilità e merita un’occhiata prima, se quelle proprietà contavano.

## Come scegliere

1. **Decidi per prima cosa la forma dell’output, perché non si torna indietro a poco prezzo.** Una cartella di file separati con link funzionanti fra loro punta a obsidian-export o a uno script tuo; un documento solo da far leggere a una persona punta alla strada dell’unione. Convertire nel verso sbagliato e rimettere a posto a mano dopo è la versione più lenta di questo lavoro.
2. **Cerca i quattro costrutti nel vault prima di scegliere.** Un `grep` per `![[`, per `> [!`, per `#^` e per ```` ```dataview ````. Un vault senza embed e senza callout può usare quasi tutto quello che c’è qui; un vault costruito su di essi ha bisogno di uno strumento di cui hai davvero letto come li gestisce.
3. **Controlla se gli allegati devono venire dietro.** Se devono, la strada del plugin o un export da CLI file-per-file sono le uniche opzioni che li portano. Un’unione di soli Markdown non può, per costruzione, e nessuna configurazione cambia questo.
4. **Conta quante volte succederà.** Una volta è una scheda del browser. Ogni settimana, o a ogni commit, è una CLI dentro uno script — una persona che si ricorda di trascinare uno zip su una pagina è il passaggio che prima o poi smette di succedere.
5. **Cerca i nomi di file duplicati prima di fidarti di qualunque riscrittura automatica.** `find . -name '*.md' | xargs -n1 basename | sort | uniq -d` richiede un secondo. Se non torna niente, ogni strumento qui è sicuro su quel fronte; se tornano delle righe, solo uno script che controlli tu le risolve come intendevi.

## Conclusione

Non c’è nessun piano a pagamento da confrontare, il che rende questo un confronto insolitamente onesto: ogni strada è gratuita, e la decisione riguarda interamente la forma dell’output e quanto ciascuna capisca del dialetto di Obsidian. Per un vault che deve restare una cartella funzionante di file collegati, obsidian-export è lo strumento gratuito costruito esattamente per questo. Per una nota o una cartella le cui immagini devono viaggiare con lei, un plugin della community è l’unica strada che porta con sé i file binari. Per un vault che diventa un documento che leggerà qualcuno fuori da Obsidian, [la conversione da Obsidian a Markdown](/obsidian-to-markdown) di TransformPipe fa l’unione, l’indice, la riduzione dei wikilink e la rimozione del frontmatter in un unico passaggio, nel browser, senza caricare niente. Qualunque cosa tu scelga, disattiva “Use \[\[Wikilinks\]\]” lo stesso giorno così che l’arretrato smetta di crescere, e cerca i blocchi Dataview finché il vault è ancora aperto — quella è l’unica cosa che nessun convertitore qui, a nessun prezzo, recupera. Se Obsidian non è l’unica origine in gioco, [il confronto fra i tre export](/blog/markdown-from-notion-obsidian-and-confluence) copre che cosa fanno di diverso Notion e Confluence.

## Domande frequenti

### Esiste un convertitore da Obsidian a Markdown davvero gratuito?

Lo sono tutti. I file di Obsidian sono già Markdown e ogni strumento di questa pagina è gratuito da usare, quindi non c’è nessun piano a pagamento con cui fare il confronto. Le opzioni si distinguono per il fatto di produrre file separati o un documento solo, e per quanto completamente gestiscono wikilink, embed, riferimenti ai blocchi e callout.

### Obsidian ha un export integrato in Markdown?

No, e non gli serve — il vault è già una cartella di file `.md`. Obsidian ha però un’impostazione “Use \[\[Wikilinks\]\]” che rende i nuovi link Markdown standard, ma vale solo per i link scritti dopo la modifica, quindi è una misura preventiva più che un export.

### Qual è il modo gratuito più veloce di trasformare un intero vault in un unico file?

Comprimi in zip la cartella del vault e lasciala cadere su un convertitore nel browser che legge l’archivio direttamente — restituisce un documento solo con ogni nota come sezione sotto un indice generato. Niente da installare, e il problema dei wikilink si risolve da sé, perché un documento unito non ha file separati a cui i link possano puntare.

### Un convertitore gratuito conserva le mie immagini?

Solo alcuni. Un plugin che esporta una nota o una cartella con i suoi allegati impacchettati lo fa; uno strumento che produce un unico documento Markdown non può, perché un file Markdown contiene testo e un riferimento a un’immagine, mai l’immagine stessa. Controlla quale dei due comportamenti stai ottenendo prima di convertire un vault in cui il significato lo portano i diagrammi.

### Pandoc può convertire gratis un vault Obsidian?

Pandoc è gratuito e con licenza GPL, e analizza i wikilink tramite l’estensione non predefinita `wikilinks_title_after_pipe`. Quello che non può fare è risolvere un wikilink verso un file altrove nel vault, perché un indice non ce l’ha — quindi oltre le note più semplici ha bisogno di un filtro o di uno script attorno che faccia la risoluzione al posto suo.

### Che fine fanno le tabelle Dataview e gli altri contenuti dei plugin?

Niente se li porta dietro, perché nel file non ci sono mai stati. Dataview conserva la query e rende la tabella al momento della visualizzazione dentro Obsidian, quindi una nota convertita mostra la query come blocco di codice e nessuna tabella. Annota dove quelle tabelle contavano prima di convertire, finché sono ancora visibili.

### È sicuro convertire un vault dentro un browser?

Dipende interamente dal fatto che la pagina carichi il file o lo legga in locale. Un convertitore che fa il lavoro nel tuo browser non spedisce mai l’archivio da nessuna parte, cosa che puoi verificare aprendo il pannello di rete e guardando che non succede niente — vale la pena farlo una volta per un vault che contenga qualcosa di privato.
