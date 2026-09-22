---
title: "I migliori convertitori di documenti online nel 2026: dove finisce davvero il tuo file"
description: Confronta i convertitori di documenti online per dove finisce il tuo file: strumenti lato browser senza caricamenti, servizi ospitati e la loro conservazione.
date: 2026-09-07
tag: Conversione
keywords: convertitore documenti online, miglior convertitore documenti online, convertire documenti online senza caricare, convertitore documenti nel browser, convertitore file gratis online, api conversione documenti, convertitore documenti offline, quanto tengono i file i convertitori
---

Scegliere un convertitore di documenti online sembra un confronto di funzioni, ed è in realtà una domanda di geografia. Il tuo file resta sulla tua macchina, oppure va da qualcun altro. Tutto il resto — l'elenco dei formati, l'area per trascinare i file, la barra di avanzamento ordinata — sta sopra quell'unica differenza, e nessuna pagina dei prezzi la mette in tabella.

### In breve

Scegli in base a dove va il file, non a quanti formati sono elencati. Un convertitore che gira nel tuo browser elabora il file sulla tua stessa macchina, non carica niente, e ti lascia dimostrarlo guardando una scheda di rete vuota — è l'opzione di default giusta per qualunque cosa tu non abbia scritto per il pubblico. Un servizio lato server come CloudConvert, Convertio, Zamzar o FreeConvert gestisce formati che un browser non può toccare, al costo di caricare il documento e accettare una politica di conservazione. Pandoc è la risposta offline quando la conversione deve ripetersi, girare in una pipeline, o toccare formati che nessuna pagina web supporta.

## La domanda che nessuno mette nella pagina dei prezzi



La home page di ogni convertitore compete sulle stesse tre affermazioni: è veloce, è gratis, supporta centinaia di formati. Nessuna delle tre ti dice se il documento che stai per convertire esce dall'edificio. È l'unica affermazione con una conseguenza attaccata, e di solito è a quattro clic di distanza in una pagina sulla privacy, formulata come rassicurazione piuttosto che come fatto.

Ci sono tre posizioni oneste che un convertitore può tenere. Può fare il lavoro nel tuo browser, nel qual caso niente viene caricato e non c'è niente da conservare. Può caricare il file su un server, convertirlo lì ed eliminarlo secondo una scadenza, nel qual caso quella scadenza è il prodotto. Oppure può girare sulla tua stessa macchina fuori dal browser, nel qual caso la rete non è coinvolta per niente e tu ti fai carico del costo di un'installazione. La maggior parte degli strumenti sta nel secondo gruppo. La maggior parte delle persone presume di stare nel primo.

La seconda cosa che nessuno pubblicizza è cosa ottieni in cambio. “Convertito” non è un unico risultato. Un convertitore può darti un file completo che si apre da solo, un frammento che ha bisogno di un contenitore che devi scrivere tu, oppure uno zip che contiene il documento più una cartella di immagini e un foglio di stile che si aspetta di trovare accanto a sé. Tutti e tre vengono descritti allo stesso modo dal pulsante. Solo il primo sopravvive a essere mandato per email a qualcuno.

E la terza è più sottile: un convertitore può produrre un output che sembra giusto sulla pagina su cui l'hai convertito, e sbagliato ovunque altro, perché il risultato dipende silenziosamente da un font o da un foglio di stile scaricato da una rete che chi lo riceve potrebbe non avere. Un file che ha bisogno della rete per sembrare sé stesso non è autonomo, qualunque cosa suggerisse il pulsante di scaricamento.

## Confronto rapido: il bigliettino

| Strumento | Ideale per | Capacità principale | Prezzo |
| --- | --- | --- | --- |
| TransformPipe | Convertire un documento senza caricarlo | Conversione lato browser, esportazione HTML autonoma, API e CLI | Gratis |
| Pandoc | Conversione ripetibile fra molti formati | Formati di markup, HTML, office, TeX ed ebook, modelli, `--standalone`, `--embed-resources` | Gratis, GPL |
| LibreOffice (headless) | Formati office offline, in blocco | `--convert-to` per Word, Excel, PowerPoint, ODF, PDF | Gratis, MPL 2.0 |
| CloudConvert | Un'API su cui costruire | Ampiezza dei formati, selezione della regione, file eliminati dopo l'elaborazione | Piano gratuito: 10 conversioni al giorno |
| Convertio | Conversione occasionale di un formato inusuale | Elenco di formati molto ampio, web e API | Piano gratuito, poi da 11,99 $/mese |
| Zamzar | Conversione occasionale in stile desktop | Servizio di lunga data, web e API | Gratis: 2 file/24h, poi da 12 $/mese |
| FreeConvert | Conversione di media e documenti al minuto | Misurato in minuti di conversione invece che in file | Gratis: 20 minuti/giorno, poi da 12,99 $/mese |
| Adobe Acrobat online | Qualunque cosa dove il PDF è l'origine o la destinazione | Esportazione e importazione PDF che corrisponde al motore di Acrobat | Strumenti gratis con limiti; il resto in un abbonamento |
| Google Docs / Microsoft 365 | Una conversione che paghi già | Importa `.docx`, esporta HTML, PDF, testo semplice | Incluso con l'account |
| Gotenberg | Conversione lato server che ospiti tu stesso | API Docker senza stato che avvolge LibreOffice e Chromium | Gratis, MIT |
| Librerie nel tuo codice | Una conversione dentro un'applicazione | marked, Turndown, mammoth, Papa Parse e i loro equivalenti | Gratis, open source |
| Salva come / Stampa in PDF del browser | La conversione che hai già installata | Salva una pagina come PDF o come HTML più una cartella di risorse | Gratis |

## I migliori convertitori di documenti online nel 2026

### TransformPipe — il migliore per convertire un documento senza caricarlo

TransformPipe convertisce Markdown in HTML, e HTML, Word `.docx`, CSV, TSV e JSON in Markdown, nel browser. Da disconnesso, il file viene letto, analizzato e renderizzato sulla tua stessa macchina e non viene mai mandato da nessuna parte. L'esportazione HTML è un unico file completo con gli stili incorporati, il che significa che si apre allo stesso modo su un portatile senza connessione come sul tuo.

| Pro | Contro |
| --- | --- |
| Niente viene caricato quando non hai fatto l'accesso, e la scheda di rete lo dimostra | È il browser a fare il lavoro, quindi un file molto grande è limitato dalla macchina |
| L'esportazione HTML è un unico file che non chiede niente alla rete | Non è un convertitore universale: nessun video, audio, immagini o PDF-verso-Word |
| L'HTML grezzo passa attraverso un sanificatore con un'allow-list fissa | Un documento alla volta, o diversi uniti in uno — non una build di sito |
| La stessa conversione è disponibile come API REST, CLI, GitHub Action e server MCP | Nessun linguaggio di template per layout su misura |

**Prezzo:** gratis. Un account aggiunge cronologia, condivisione e accesso API, anche questi gratis.

**Dettagli tecnici e funzioni**

- Markdown in HTML con GitHub Flavored Markdown: tabelle, elenchi di attività, testo barrato, autolink, codice recintato
- HTML, `.docx`, CSV, TSV e JSON in Markdown nella stessa pagina, senza installazione e senza account
- L'output è un documento completo — doctype, head, `<style>` incorporato — oppure `.md` semplice, oppure stampa in PDF tramite la finestra di dialogo del browser
- L'HTML grezzo in ingresso è filtrato contro un'unica allow-list, nel browser e sul server allo stesso modo
- Una CLI senza dipendenze e una GitHub Action per la stessa conversione in una pipeline

**Per chi è?** Per chiunque converta un documento che non è già pubblico — un contratto, la bozza di un cliente, un piano interno, un'esportazione da un'app per prendere note. È anche la strada più corta per il lavoro specifico di trasformare Markdown in una pagina che puoi mandare, [confrontato nel dettaglio con le librerie e gli strumenti desktop altrove](/blog/best-markdown-to-html-converters).

### Pandoc — il migliore per conversioni ripetibili fra molti formati

Pandoc è un convertitore di documenti da riga di comando scritto in Haskell che legge e scrive circa quaranta formati, Markdown, HTML, LaTeX, EPUB, Word e OpenDocument compresi. Gira sulla tua macchina, quindi nessun file la lascia, ed è l'unico strumento qui la cui matrice di formati compete davvero con i servizi ospitati.

| Pro | Contro |
| --- | --- |
| Converte fra formati che nessun servizio web si preoccupa di trattare | Richiede un'installazione e un terminale |
| Gira interamente offline, quindi la rete non fa parte della questione di fiducia | Modelli, filtri e flag di dialetto sono una vera curva di apprendimento |
| `--standalone` e `--embed-resources` producono un unico file completo | Nessuna sanificazione: l'HTML grezzo passa dritto |
| Scriptabile, quindi la stessa conversione si ripete identica il mese prossimo | I suoi dialetti Markdown differiscono da GFM in modi che sorprendono |

**Prezzo:** gratis, licenza GPL.

**Dettagli tecnici e funzioni**

- Lettori e scrittori selezionati esplicitamente, `commonmark`, `gfm`, `html`, `docx` e `latex` compresi
- `--standalone` avvolge l'output in un documento completo; `--embed-resources` incorpora immagini e CSS
- `--template` e filtri Lua per riscrivere il documento a metà conversione
- `--sandbox` limita l'accesso al filesystem quando converti un file di cui non ti fidi
- `--reference-doc` porta lo stile Word nell'output `.docx`
- L'elenco dei formati è asimmetrico: legge l'[EPUB](/blog/convert-epub-to-markdown) ma scrive PowerPoint senza leggerlo, quindi [una presentazione chiede un'altra strada](/blog/convert-powerpoint-to-markdown)

**Per chi è?** Per chi ha una conversione che succede più di una volta: una build di documentazione, una pipeline di manoscritti, un processo di rilascio. Per un file solo e una persona che aspetta, Pandoc è più strumento di quanto il lavoro richieda, e [le opzioni più leggere meritano di essere conosciute](/blog/pandoc-alternatives-for-markdown-to-html) prima di installare un binario Haskell.

### LibreOffice headless — il migliore per formati office offline

LibreOffice è una suite office desktop, e la sua modalità da riga di comando è un convertitore di documenti che la maggior parte delle persone ha già installato senza saperlo. `soffice --headless --convert-to` legge e scrive file Word, Excel, PowerPoint e OpenDocument, ed esporta PDF, sulla tua stessa macchina.

| Pro | Contro |
| --- | --- |
| Gestisce i formati Microsoft nativamente, offline, in blocco | Un'installazione molto grande per uno strumento di conversione |
| Gratuito e open source, senza account e senza caricamento | Un layout Word complesso non sempre sopravvive al viaggio di andata e ritorno |
| Scriptabile su una directory di file | La sua esportazione HTML è datata e non un documento che manderesti |
| Lo stesso motore che molti servizi ospitati fanno girare dietro la propria API | Un processo alla volta, a meno di gestire i profili utente con attenzione |

**Prezzo:** gratis, licenza MPL 2.0.

**Dettagli tecnici e funzioni**

- `--convert-to` con un filtro di destinazione, e `--outdir` per la cartella di uscita
- Legge e scrive `.docx`, `.xlsx`, `.pptx`, formati ODF e CSV
- Esportazione PDF con opzioni proprie, PDF/A compreso
- Gira su Windows, macOS e Linux, e in un container

**Per chi è?** Per le squadre che convertono documenti office in volume dove i documenti non devono lasciare la rete. Se hai mai incollato un `.docx` in un convertitore web perché ti serviva tirarne fuori il testo, questa è la versione di quella cosa senza niente caricato.

### CloudConvert — il miglior convertitore lato server su cui costruire

CloudConvert è un servizio di conversione ospitato con un'API come centro di gravità piuttosto che un ripensamento. Il tuo file viene caricato, convertito in un container e restituito. È l'opzione lato server più chiara su cosa succede al file mentre è lì.

| Pro | Contro |
| --- | --- |
| Un'API documentata, con l'interfaccia web come suo client | Il file viene caricato — è il modello, non un'impostazione |
| Dichiara che i file sono conservati solo per l'elaborazione ed eliminati subito dopo | Il piano gratuito è piccolo abbastanza da essere una prova piuttosto che un piano |
| La regione di elaborazione si può scegliere | I crediti sono un'unità che devi tradurre nel tuo carico di lavoro |
| Ogni task gira in un container isolato separato | Nessuna modalità offline, per definizione |

**Prezzo:** il piano gratuito è 10 conversioni al giorno. Limita il file a 1 GB, l'elaborazione a cinque minuti e i task simultanei a cinque. L'uso a pagamento è venduto come pacchetti di crediti o un abbonamento, con prezzo per volume su un cursore, e prezzi personalizzati per le imprese sopra quello (verificato su cloudconvert.com/pricing, l'8 settembre 2026).

**Dettagli tecnici e funzioni**

- API REST con job composti da task di importazione, conversione ed esportazione
- Documenti, foglio di calcolo, presentazioni, immagini, audio, video e archivi
- Selezione della regione in cui gira la conversione (verificato su cloudconvert.com/security, l'8 settembre 2026)
- SSL per i trasferimenti, e una politica dichiarata di nessuna conservazione permanente

**Per chi è?** Per gli sviluppatori che hanno bisogno di un unico endpoint di conversione che copra formati che un browser non può toccare, e possono accettare un caricamento per i documenti in questione. La chiarezza della dichiarazione sulla conservazione è il motivo per preferirlo rispetto all'estremo del mercato sostenuto dalla pubblicità.

### Convertio — il migliore per conversioni occasionali di un formato inusuale

Convertio è un servizio basato su browser con uno degli elenchi di formati più ampi ovunque. Carichi un file, viene caricato, viene convertito sul server, scarichi il risultato. È lo strumento che con più affidabilità ha già sentito parlare di qualunque estensione tu abbia in mano.

| Pro | Contro |
| --- | --- |
| Coperta di formati che va ben oltre i documenti | Ogni conversione è un caricamento, anche quelle private |
| Nessuna installazione, funziona su un telefono come su un portatile | I file convertiti restano sul servizio per 24 ore per sua stessa politica |
| Le stesse conversioni disponibili tramite un'API | L'uso gratuito è limitato dalla dimensione del file piuttosto che chiaramente dal conteggio |
| Lo stile e la struttura dell'output sono scelte dello strumento, non tue | I piani a pagamento sono pensati per un volume che potresti non avere |

**Prezzo:** l'uso non registrato è limitato a un file massimo di 1 GB. I piani a pagamento partono da 11,99 $ al mese per Lite, 22,99 $ per Basic e 44,99 $ per Pro con fatturazione mensile. Le tariffe annuali sono più basse, e c'è un piano personalizzato sopra quello (verificato su convertio.co/pricing, l'8 settembre 2026).

**Dettagli tecnici e funzioni**

- Conversioni di documenti, immagini, audio, video, archivi, ebook, font e presentazioni
- Interfaccia da browser più un'API REST con lo stesso catalogo
- Dichiara: i file caricati eliminati istantaneamente, quelli convertiti dopo 24 ore (verificato su convertio.co, l'8 settembre 2026)
- Le conversioni si accodano lato server, quindi un file grande non è limitato dalla tua macchina

**Per chi è?** Per chiunque abbia un file in un formato che niente altro legge, e nessun problema di confidenzialità — un dataset pubblico, un font, un video, un documento già in rete. È lo strumento sbagliato per un documento non ancora pubblicato.

### Zamzar — il migliore per conversioni occasionali con un limite gratuito chiaro

Zamzar è uno dei convertitori online di più lunga data e uno dei pochi che dichiara il proprio limite gratuito come un numero piuttosto che una sensazione. Il modello è lo stesso di Convertio: caricamento, conversione sul server, scaricamento.

| Pro | Contro |
| --- | --- |
| Il limite gratuito è un conteggio dichiarato di file, non una vaga linea di uso corretto | Due file al giorno è un'indennità genuinamente piccola |
| La conservazione è documentata in frasi semplici | Una conversione fallita significa che il tuo originale viene tenuto più a lungo |
| API disponibile insieme all'interfaccia web | Il caricamento è inevitabile |
| Semplice, stabile e prevedibile | Il limite gratuito di dimensione del file esclude molti documenti reali |

**Prezzo:** il servizio gratuito converte fino a 2 file in 24 ore, con un limite di caricamento di 50 MB. I piani a pagamento sono 12 $ al mese per Basic (50 conversioni desktop al giorno, file da 200 MB), 19 $ per Pro (100 al giorno, 400 MB) e 39 $ per Business (500 al giorno, 2 GB). Verificato su zamzar.com e secure.zamzar.com, l'8 settembre 2026.

**Dettagli tecnici e funzioni**

- Documenti, immagini, audio, video, ebook e archivi
- Un file convertito è conservato per un massimo di 24 ore così puoi scaricarlo; se una conversione fallisce, l'originale viene tenuto fino a sette giorni per l'assistenza (verificato su zamzar.com/faq, l'8 settembre 2026)
- API di conversione con lo stesso catalogo di formati
- Limiti di dimensione del file per piano piuttosto che un unico limite globale

**Per chi è?** Per chi converte qualche file occasionale e vuole sapere esattamente cosa permette il piano gratuito. I sette giorni di attesa per le conversioni fallite sono il dettaglio da pesare prima di caricare qualcosa di sensibile.

### FreeConvert — il migliore quando il tuo lavoro si misura in minuti

FreeConvert copre lo stesso territorio di Convertio e Zamzar, e misura in modo diverso: l'unità sono i minuti di conversione piuttosto che i file. Questo si adatta ai media grandi e penalizza le conversioni singole lunghe.

| Pro | Contro |
| --- | --- |
| Un'indennità gratuita giornaliera misurata in minuti, non in file | Un limite di tempo per file sull'uso gratuito interromperà una grande conversione a metà |
| L'uso web e API si appoggia alla stessa indennità | Lato server, quindi il file viene caricato |
| I piani più alti alzano di molto il limite di dimensione del file | I minuti sono difficili da stimare prima di iniziare |
| Nessuna installazione, nessuna dipendenza desktop | I termini sulla conservazione richiedono lettura per essere trovati |

**Prezzo:** l'uso gratuito è 20 minuti di conversione al giorno fra web e API, con un limite di 5 minuti di conversione per file. I piani a pagamento sono 12,99 $ al mese per Basic, 24,99 $ per Standard e 29,99 $ per Pro, con prezzi a richiesta sopra quello (verificato su freeconvert.com/pricing, l'8 settembre 2026).

**Dettagli tecnici e funzioni**

- Documenti, immagini, audio, video, archivi ed ebook
- Dimensioni massime del file per piano, da 1,5 GB su Basic fino a 20 GB sul piano a richiesta (verificato su freeconvert.com/pricing, l'8 settembre 2026)
- Un'unica API per tutto il catalogo
- Il tempo di conversione, non il conteggio dei file, come unità di fatturazione

**Per chi è?** Per chi ha conversioni lunghe piuttosto che numerose — video, audio, foglio di calcolo grandi — ed è a suo agio con il caricamento.

### Adobe Acrobat online — il migliore quando il PDF è una delle due estremità

Gli strumenti online di Adobe convertono da e verso PDF usando lo stesso motore di Acrobat, il che conta perché il PDF è il formato più a rischio di essere mal riprodotto da una reimplementazione di terzi. Gli strumenti girano in un browser ed elaborano il file sui server di Adobe.

| Pro | Contro |
| --- | --- |
| La conversione PDF più fedele, perché è quella di Adobe stessa | L'accesso richiesto arriva presto una volta usati gli strumenti gratuiti più che leggermente |
| Gestisce PDF verso Word, Word verso PDF e le coppie consuete | Carica il documento ad Adobe |
| Coerente con l'output dell'applicazione desktop | Non un convertitore di documenti generico — il PDF è sempre una delle due estremità |
| Nessuna installazione per gli strumenti online | Prezzato come parte di un abbonamento, non a conversione |

**Prezzo:** diversi strumenti online sono gratuiti con limiti di uso, e l'accesso completo è incluso in un abbonamento Acrobat il cui prezzo dipende dal piano, dalla regione e dalla durata — controlla adobe.com per la cifra che ti riguarda invece di fidarti di un numero in un articolo.

**Dettagli tecnici e funzioni**

- Creazione, esportazione, unione e compressione PDF da browser
- Conversione da e verso Word, Excel, PowerPoint e immagini
- Accesso richiesto per qualunque cosa oltre un uso gratuito leggero
- Le stesse conversioni disponibili nell'applicazione desktop e nelle sue API

**Per chi è?** Per chiunque la fedeltà del PDF sia l'intero punto — un modulo, un documento firmato, un file pronto per la stampa. Non lo strumento per tirare fuori il testo da un documento che preferiresti Adobe non avesse.

### Google Docs e Microsoft 365 — il convertitore che paghi già

Se hai uno dei due account, possiedi già un convertitore di documenti. Carica un `.docx`, aprilo, ed esportalo come HTML, PDF o testo semplice. Nessuno li vende come convertitori, e per moltissimi lavori occasionali sono la strada più corta.

| Pro | Contro |
| --- | --- |
| Già disponibile, già fidato con i tuoi documenti | Il file viene caricato per definizione — è quello che l'account è |
| Gestisce la formattazione Word meglio della maggior parte dei terzi | L'esportazione HTML di Google Docs arriva come zip, con le immagini come file separati |
| Nessun nuovo fornitore da valutare | L'HTML esportato porta la marcatura e i nomi di classe propri dell'editor |
| Gratis con l'account che già hai | Scomodo per più di una manciata di file |

**Prezzo:** incluso con l'account Google o Microsoft che già hai.

**Dettagli tecnici e funzioni**

- Importazione ed esportazione di `.docx`, `.xlsx`, `.pptx`, PDF, testo semplice e HTML
- Scelte di esportazione fatte per documento tramite un menu, non scriptate
- Il documento resta nello storage dell'account dopo la conversione a meno che tu non lo rimuova
- Disponibile su mobile oltre che su desktop

**Per chi è?** Per chiunque converta un documento che vive già in quell'account. Se non ci vive ancora, caricarlo per tirarne fuori HTML è un passo grande per un lavoro piccolo.

### Gotenberg — il migliore per conversione lato server che ospiti tu stesso

Gotenberg è un'API di conversione senza stato distribuita come immagine Docker, che avvolge LibreOffice e Chromium dietro endpoint HTTP. È la via di mezzo fra un servizio ospitato e un'installazione locale: un'API modellata come quella di CloudConvert, che gira su hardware che controlli tu.

| Pro | Contro |
| --- | --- |
| Un'API HTTP con nessuno dei documenti che lascia la tua infrastruttura | Sei tu a farla girare, monitorarla e aggiornarla |
| Senza stato per progetto, quindi non c'è politica di conservazione da leggere | Elenco di formati più stretto dei servizi ospitati |
| Gratuito e open source | Richiede Docker e un posto dove metterlo |
| Costo prevedibile: la tua stessa infrastruttura | Non uno strumento per una persona con un file |

**Prezzo:** gratis, licenza MIT.

**Dettagli tecnici e funzioni**

- Endpoint HTTP per conversione di documenti office, HTML in PDF e operazioni su PDF
- LibreOffice per i formati office, Chromium per il rendering HTML
- Distribuito come container, configurato con flag e variabili d'ambiente
- Nessuna persistenza fra richieste

**Per chi è?** Per squadre di ingegneria che hanno bisogno della conversione come servizio dentro un prodotto o un'intranet, con una risposta di conformità che non dipende dalla programmazione di eliminazione di qualcun altro.

### Librerie nel tuo codice — quando la conversione è una funzione

Se la conversione avviene dentro il software che stai scrivendo, la risposta onesta è di solito una libreria piuttosto che uno dei convertitori di questa pagina: marked o markdown-it per Markdown verso HTML, Turndown per HTML verso Markdown, mammoth per `.docx` verso HTML, un parser CSV per dati tabellari.

| Pro | Contro |
| --- | --- |
| Niente lascia il processo, figuriamoci la macchina | Scrivi tu il contenitore, la gestione degli errori e lo stile |
| Nessun costo per conversione e nessun limite di frequenza | La sanificazione è tua responsabilità nella maggior parte di esse |
| Versionate nel tuo lockfile, quindi il comportamento non cambia sotto di te | Una libreria per direzione, quindi una matrice diventa diverse dipendenze |
| Gratuite e open source | Nessun aiuto con PDF, video o formati esotici |

**Prezzo:** gratis, open source — marked e Turndown hanno licenza MIT.

**Dettagli tecnici e funzioni**

- Markdown verso HTML: marked, markdown-it, remark in JavaScript; equivalenti in ogni altro linguaggio
- HTML verso Markdown: Turndown, con regole che puoi sovrascrivere per elemento
- `.docx` verso HTML: mammoth, che mappa deliberatamente gli stili invece di riprodurre la marcatura di Word
- La sanificazione è un passaggio separato che aggiungi tu, non un default che eredita

**Per chi è?** Per gli sviluppatori il cui prodotto convertisce documenti come parte di quello che fa. Leggi [cosa può portare con sé l'HTML grezzo attraverso una conversione](/blog/sanitising-markdown-safely) prima di renderizzare il risultato di una di queste nel browser di qualcuno.

### Salva come e Stampa in PDF del browser — il convertitore già installato

Ogni browser convertisce documenti. `Ctrl+P` verso un PDF, o Salva pagina come, ti darà un artefatto leggibile di quasi qualunque cosa tu possa aprire. Non costa niente, non carica niente e non richiede nessuna decisione.

| Pro | Contro |
| --- | --- |
| Gratis, installato, offline e istantaneo | Il PDF perde la struttura — le intestazioni diventano visive, non semantiche |
| Niente viene caricato | “Salva pagina come, completa” produce un file più una cartella di risorse |
| Funziona per qualunque cosa il browser possa renderizzare | I salti di pagina cadono dove cadono |
| Nessun account, nessun limite | Non scriptabile come parte di una build |

**Prezzo:** gratis.

**Per chi è?** Per chiunque abbia bisogno di una copia fissa di qualcosa di leggibile, subito, e non abbia bisogno che l'output sia modificabile o strutturato dopo.

## Cosa lasciano fuori le pagine dei prezzi

Le tabelle di confronto sono costruite dai campi che i fornitori accettano di pubblicare. Le cose che decidono se una conversione è stata una buona idea per lo più non sono tra questi.

**Se il file viene caricato per niente.** È la prima domanda e quasi non è mai in tabella. “Online” è arrivato a significare “sul server di qualcuno”, ma un browser è un runtime, e un convertitore scritto per girarci fa il lavoro sulla tua macchina. La differenza non è una promessa da prendere per fede: apri gli strumenti per sviluppatori, guarda la scheda di rete, converti il file, e vedi se esce qualcosa. Un convertitore lato browser non ti mostra niente oltre alla pagina che ha già caricato. Uno lato server ti mostra il tuo documento che esce, e la stessa abitudine di osservare piuttosto che credere è [come si stabilisce se un convertitore online è sicuro](/blog/is-an-online-converter-safe) per il file che hai davanti, tanto quanto lo strumento in sé.

**Per quanto tempo viene conservato una volta caricato.** La conservazione è una politica, il che significa che è una frase che qualcuno ha scritto e può riscrivere. I servizi buoni la dichiarano chiaramente. CloudConvert dice che i file sono conservati solo per l'elaborazione ed eliminati subito dopo. Convertio dice che i file caricati sono eliminati istantaneamente e quelli convertiti dopo 24 ore. Zamzar conserva un file convertito per un massimo di 24 ore, e tiene l'originale fino a sette giorni quando una conversione fallisce così l'assistenza può guardarlo. Ognuna di queste è ragionevole e nessuna è zero. La conversione lato browser non ha politica di conservazione perché non c'è niente da conservare, il che è una categoria di risposta diversa.

**Se quello che ottieni in cambio è un file completo.** Tre cose arrivano sotto lo stesso pulsante di scaricamento. Un documento completo si apre da solo e sembra sé stesso. Un frammento — intestazioni e paragrafi senza `<html>`, `<head>` o stili intorno — si renderizza come testo nero alla larghezza predefinita del browser e sembra rotto a chiunque tu l'abbia mandato. Uno zip che contiene un file HTML, un foglio di stile e una cartella di immagini è un sito web in una busta: sposta l'HTML da solo e le immagini svaniscono. Se l'output deve viaggiare per email o un messaggio di chat, solo il primo dei tre funziona.

**Se il risultato ha bisogno della rete per sembrare giusto.** Un convertitore che collega un font o un foglio di stile da una rete di distribuzione di contenuti ha prodotto un file che si renderizza correttamente sulla tua scrivania e peggiora su un treno. Dice anche a chi lo apre qualcosa su dove è stato il file. Un'esportazione autonoma porta i suoi stili incorporati e non richiede niente. È un file più grande ed è l'unica versione che si comporta identica ovunque. Un convertitore il cui output ha bisogno della rete per aprirsi correttamente non offre un file autonomo, qualunque cosa si chiami la finestra di esportazione — questo è esattamente [perché un link e un file non sono la stessa cosa da consegnare](/blog/share-a-markdown-document-as-a-link).

**Cosa misura davvero il piano gratuito.** I piani gratuiti qui contano quattro cose diverse. Zamzar conta i file: 2 in 24 ore. CloudConvert conta le conversioni: 10 al giorno, con cinque task simultanei. FreeConvert conta i minuti: 20 al giorno, e non più di 5 su un singolo file. Convertio limita la dimensione del file per l'uso non registrato. Nessuna di queste è comparabile a nessun'altra, e quella che conta è qualunque cosa il tuo carico di lavoro reale incontri per prima. Venti minuti al giorno sono generosi per i documenti e magri per il video; due file al giorno vanno bene per una persona e non servono a una squadra.

**Cosa il formato non riesce a portare oltre.** Ogni conversione è lossy in una direzione. I commenti di Word, le modifiche tracciate e le caselle di testo non hanno equivalente in Markdown. Le celle unite e le formule di un foglio di calcolo non sopravvivono a diventare una tabella. Il PDF rinuncia del tutto alla sua struttura e deve farsela indovinare di nuovo. Un convertitore non può risolvere questo, e quelli buoni non fanno finta di poterlo: prendono una decisione defendibile e te la lasciano vedere. Le tabelle sono dove si vede prima e più visibilmente, e [cosa sopravvive a una conversione di tabelle](/blog/markdown-tables-that-survive-conversion) vale la pena controllarlo su un file rappresentativo prima di impegnarne cento.

**Chi altro è nella pipeline.** Un convertitore ospitato gira su un'infrastruttura che affitta, in una regione che scegli lui, con subprocessori che elenca da qualche parte. È normale, ed è anche una lista più lunga di soggetti di “io e una pagina web”. Per un README pubblico non conta. Per un contratto non firmato, la nota di un paziente o un piano di prodotto non annunciato, è l'intera decisione, e non è una decisione che una tabella di funzioni possa aiutarti a prendere.

## Come scegliere

1. **Parti da come suonerebbe il documento in caso di fuga.** Se sarebbe imbarazzante, contrattuale o regolamentato, la conversione deve avvenire sulla tua macchina — lato browser o offline — e l'elenco dei formati è irrilevante finché questo non è deciso. Ordinare prima questa cosa elimina la maggior parte del mercato in un colpo e ti risparmia il confronto di piani che non userai.
2. **Leggi la frase sulla conservazione, non il titolo sulla privacy.** “Prendiamo sul serio la tua privacy” non è una politica; “i file convertiti sono eliminati dopo 24 ore” lo è. Se non trovi una frase con una durata dentro, presumi che la durata sia ignota e tratta il caricamento di conseguenza.
3. **Controlla cosa conta il piano gratuito prima di fidartene.** File, conversioni, minuti e megabyte sono quattro contatori diversi, e il piano che sembra generoso su uno è restrittivo sul tuo. Converti prima il tuo file più grande realistico sul piano gratuito; è lì che emergono i limiti di tempo per file e i tetti di dimensione.
4. **Apri l'output su una macchina che non ha mai visto lo strumento.** Browser diverso, computer diverso, rete spenta. Quell'unico test intercetta insieme frammenti, immagini mancanti, foglio di stile da CDN ed esportazioni a forma di zip, e richiede un minuto — mentre scoprirlo dopo aver mandato il file a un cliente costa una scusa.
5. **Conta le installazioni e gli account.** Una conversione occasionale non dovrebbe richiedere un gestore di pacchetti; un job notturno non dovrebbe richiedere una scheda del browser con una persona davanti. Scegli in base alla frequenza, perché il disallineamento è quello che fa abbandonare un buon strumento dopo due settimane.
6. **Presumi che lo rifarai.** Se la conversione si ripete, vuoi un'API, una CLI o un binario scriptabile, non una pagina che visiti. Scegliere uno strumento manuale per un lavoro ricorrente è la versione più comune di questo errore, e costa un po' di tempo ogni settimana piuttosto che molto una volta sola — motivo per cui sopravvive tanto a lungo.

## Conclusione

Il miglior convertitore di documenti online è quello la cui risposta a “dove è andato il mio file?” è “da nessuna parte”. Per documenti non ancora pubblici, questo significa conversione lato browser. È quello che fa [TransformPipe](/): Markdown verso un file HTML autonomo, e HTML, Word, CSV, TSV e JSON verso Markdown, sulla tua stessa macchina, gratis. Niente viene caricato quando non hai fatto l'accesso, e la scheda di rete lo mostra. Quando il formato è oltre quello che un browser può analizzare, un servizio lato server è lo strumento giusto e la politica di conservazione è quello che stai davvero scegliendo tra: CloudConvert, Convertio, Zamzar e FreeConvert dichiarano tutti la propria, e le differenze sono reali. E quando la conversione deve ripetersi, installa Pandoc oppure ospita Gotenberg, e smetti di pensarci.

## Domande frequenti

### Qual è il miglior convertitore di documenti online gratuito?

Per documenti che preferiresti non caricare, un convertitore lato browser è la migliore opzione gratuita, perché non c'è un piano da superare e nessun file da eliminare dopo. Il convertitore lato browser qui sopra è gratuito per Markdown, HTML, Word, CSV, TSV e JSON. Per formati che un browser non può leggere, i piani gratuiti di CloudConvert, Zamzar e FreeConvert funzionano tutti per un uso occasionale, purché tu abbia letto cosa conta ognuno.

### È sicuro caricare documenti su un convertitore online?

Dipende interamente dal documento e dalla politica. Per qualunque cosa già pubblica, il rischio è trascurabile. Per un contratto, una nota medica o un piano non annunciato, la posizione sicura è un convertitore che non carica per niente — uno che gira nel tuo browser o uno strumento installato sulla tua macchina. Una politica di conservazione è una promessa su una copia che esiste, non l'assenza di una copia.

### Come posso convertire un documento senza caricarlo?

Usa un convertitore che gira nel browser, o uno che gira offline. Uno strumento lato browser carica il suo codice una volta e poi fa l'analisi in locale, quindi puoi aprire gli strumenti per sviluppatori, convertire il file e guardare la scheda di rete restare vuota. Offline, la modalità `--convert-to` di Pandoc e di LibreOffice non toccano affatto la rete.

### Quanto tempo tengono i miei file i convertitori online?

Le risposte pubblicate variano da minuti a una settimana. CloudConvert dichiara che i file sono conservati solo per l'elaborazione ed eliminati subito dopo; Convertio elimina i caricamenti istantaneamente e i file convertiti dopo 24 ore; Zamzar tiene un file convertito fino a 24 ore, e un originale fino a sette giorni se la conversione è fallita. Controlla la formulazione attuale sulla pagina del fornitore, perché queste sono politiche e le politiche cambiano.

### Posso convertire documenti offline?

Sì, e di solito è la risposta migliore per qualunque cosa ripetuta o sensibile. Pandoc converte fra circa quaranta formati da riga di comando, LibreOffice converte documenti office e PDF con `--headless --convert-to`, e un convertitore lato browser continua a funzionare una volta caricata la pagina. Tutti e tre lasciano la rete fuori dalla questione.

### Un convertitore di documenti online funziona su un telefono?

I convertitori lato server sì, dato che il telefono deve solo caricare e scaricare. Funzionano anche quelli lato browser, ma la conversione gira sul processore e sulla memoria del telefono, quindi un documento molto grande sarà più lento lì che su un portatile. Per un documento normale — un rapporto, un README, un'esportazione da foglio di calcolo — entrambi vanno bene.

### Qual è la differenza tra un convertitore di documenti e un editor di documenti?

Un convertitore prende un file in un formato e te ne dà lo stesso contenuto in un altro; un editor è dove lo scrivi. Gli editor hanno spesso un menu di esportazione, il che li rende convertitori per caso, e l'esportazione è stilizzata a modo dell'editor piuttosto che a modo tuo. Se hai già il file e ti serve solo un formato diverso, un convertitore è meno passaggi e meno sorprese.

### Con quale convertitore dovrei confrontarlo?

Con quello che fallisce sul tuo documento, non con quello dall'elenco di formati più lungo. Gli strumenti locali si dividono su ciò che rifiutano di netto: Pandoc legge le presentazioni solo dalla 3.8.3 e non porta via alcuna loro nota, calibre arriva a Markdown solo attraverso il suo esportatore di testo, e Docling legge l'elenco di ingressi più ampio di tutti. [Dieci convertitori Markdown a confronto per ciò che non leggono](/blog/ten-markdown-converters-compared) mette quei rifiuti in una tabella datata, con ogni affermazione presa dalla documentazione dello strumento stesso.
