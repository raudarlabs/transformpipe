---
title: "Il tuo assistente IA scrive Markdown. I tuoi colleghi non lo leggono."
description: "Perché gli assistenti scrivono in Markdown, cosa sopravvive incollandolo in email, Slack, Word o Notion, e la via meno elegante che funziona: salva, converti, invia"
updated: 2026-10-21
date: 2026-07-21
tag: Workflow
keywords: copiare testo da chatgpt in word, convertire risposta ai in html, esportare markdown da claude, incollare markdown in slack, asterischi e cancelletti nel testo, formule con dollari markdown, condividere una risposta di chatgpt
---

La risposta nella finestra della chat sembra un documento. Titoli, una tabella breve, un elenco numerato, il grassetto nei punti giusti. La copi in un'email e ottieni un muro di asterischi e cancelletti. Oppure ottieni un documento a metà: i titoli sono passati, la tabella è arrivata come una fila di barre verticali, e chi legge deve indovinare quali caratteri erano voluti alla lettera.

Non è andato storto niente. L'assistente ha scritto Markdown, perché è quello che questi strumenti scrivono.

Il problema non è una questione di gusto. Quello che vedi sullo schermo e quello che finisce negli appunti sono due documenti diversi, e ogni posto in cui incolli fa una sua ipotesi su quale dei due ha ricevuto. Alcune destinazioni indovinano bene. Le altre indovinano in modo diverso l'una dall'altra, e per questo la stessa risposta appare a posto in una finestra e rotta nella successiva.

### In breve

Gli assistenti rispondono in Markdown perché è il modo più economico di segnare un titolo dentro un flusso di testo semplice, e la finestra della chat quel codice sorgente te lo mostra già impaginato. Gli appunti, invece, prendono il codice sorgente. Email, Slack, Word, Google Docs, Notion, i tracker e i sistemi di pubblicazione lo interpretano ognuno a modo suo, per cui tabelle, blocchi di codice, elenchi annidati, note e qualunque cosa matematica si rompono in un punto diverso in ognuno. La strada che resiste è poco brillante: salva la risposta come file `.md`, leggila contro una lista di controllo prima che ci metta la firma il tuo nome, convertila una volta in una pagina HTML autosufficiente, e invia la pagina invece del testo incollato.

## Perché la risposta arriva come Markdown

Un modello genera testo un pezzo alla volta. Per segnare un titolo deve usare caratteri nello stesso flusso delle parole, e Markdown è il modo più economico per farlo: testo semplice, qualche segno di punteggiatura, nessun formato da negoziare. L'interfaccia della chat lo ricostruisce dalla tua parte. Quella ricostruzione è l'illusione — quello che hai in mano è il codice sorgente.

Non è una stranezza di un solo prodotto. ChatGPT, Claude, Gemini e Copilot rispondono tutti così, e lo stesso fanno gli assistenti dentro editor e tracker. Chiedere testo semplice a volte funziona, ma a quel punto stai negoziando con un modello invece di convertire un file.

## Cosa fa davvero copiare la risposta

La maggior parte delle finestre di chat tiene due copie della risposta. Il pulsante di copia ti dà il codice sorgente, asterischi compresi. Una selezione col mouse ti dà la versione già impaginata come testo formattato, che la destinazione poi reinterpreta a modo suo. Nessuna delle due è affidabile, e falliscono in punti diversi.

| Dove incolli | Pulsante copia (codice sorgente) | Selezione col mouse (testo formattato) |
| --- | --- | --- |
| Email in testo semplice | Ogni cancelletto, asterisco e barra | Appiattito di nuovo in testo semplice |
| Word o Google Docs | Sintassi grezza, niente impaginato | Titoli, grassetto e di solito le tabelle sopravvivono; il codice perde il suo blocco |
| Slack o Teams | Un po' di sintassi viene resa, un po' resta letterale | Varia per client; liste e blocchi di codice ci perdono più di tutto |
| Un wiki che parla Markdown | Quasi giusto, se il dialetto coincide | Testo formattato, quindi il Markdown è già andato |

Il caso a metà è quello che costa di più. Chi legge titoli puliti sopra un pasticcio di barre verticali pensa che tu l'abbia inviato con poca cura, non che due strumenti non si siano capiti sulle tabelle. Le tabelle sono comunque la vittima più affidabile, per [motivi che vale la pena conoscere](/blog/markdown-tables-that-survive-conversion) se le incolli spesso.

Quello che il pulsante di copia consegna vale la pena descriverlo con precisione, perché è la stessa cosa dappertutto anche se le interfacce non lo sono: una stringa di testo Markdown. Non un documento, non un formato con un nome, non qualcosa che un programma di posta possa aprire — una sequenza di caratteri in cui `##` significa titolo solo per chi già lo sa. Niente dentro gli appunti lo dice.

Una selezione col mouse è diversa per natura. I browser mettono due rappresentazioni negli appunti nello stesso momento: una versione in testo semplice e una versione HTML della stessa selezione, e l'applicazione che riceve sceglie quella che preferisce. Incolla in un campo di testo semplice e ottieni il testo appiattito. Incolla in un campo di testo formattato e ottieni la marcatura della finestra di chat stessa — i suoi tag `<h2>`, la sua struttura di elenchi, e a volte le sue classi CSS e i suoi colori, motivo per cui una risposta incollata arriva ogni tanto in un carattere che nessuno ha scelto. Nessuna delle due strade è un errore, e nessuna si può riparare dal lato della destinazione.

### Dove finisce, destinazione per destinazione

Questo è il bigliettino da consultare. Descrive cosa succede al testo Markdown del pulsante di copia, perché è quella la copia che la gente prende, e l'ultima colonna dice cosa fare invece. Il comportamento cambia tra client e versioni, quindi leggi la tabella come la forma del problema, non come una garanzia sulla versione che hai davanti.

| Destinazione | Cosa sopravvive all'incollare | Cosa non sopravvive | Cosa fare invece |
| --- | --- | --- | --- |
| Email in testo semplice | Niente viene interpretato; il testo appare esattamente come è stato digitato | Ogni titolo, ogni marcatore di elenco, ogni riga di tabella si legge come punteggiatura | Allega o metti un link a una pagina convertita |
| Email HTML | Interruzioni di riga e paragrafi, più o meno | Titoli, grassetto, tabelle, codice — tutta sintassi letterale | Manda un link, o un allegato `.html` autosufficiente |
| Slack | Grassetto, corsivo e codice in linea, una volta che il compositore li ha interpretati | Titoli e tabelle non hanno alcun equivalente in un messaggio | Metti il link alla pagina; scrivi sopra due righe di riassunto |
| Word | Paragrafi, e quello che il correttore automatico decide di cambiare | I titoli restano cancelletti; i blocchi restano backtick; le tabelle restano barre | Converti, o incolla una selezione formattata e ripara i danni |
| Google Docs | Paragrafi, e un comportamento che dipende da un'impostazione del documento | Lo stesso insieme, a meno che l'impostazione non dica il contrario | Verifica l'impostazione una volta, oppure converti e metti un link |
| Notion | Quasi tutto: Notion legge il Markdown incollato come Markdown | Annidamento profondo, e tutto ciò per cui Notion non ha un blocco | Incolla, poi controlla liste e blocchi di codice |
| Un ticket o issue | Tutto, se la casella di commento del tracker parla Markdown | Tutto, se parla invece la sua marcatura | Scopri una volta per tutte in che schieramento sta il tuo tracker |
| Un CMS | Paragrafi, come paragrafi | Struttura, a meno che l'editor non importi Markdown apposta | Importa come Markdown se l'opzione c'è; altrimenti converti |
| Un wiki che parla Markdown | Quasi tutto, se il dialetto coincide | Estensioni che il wiki non ha mai implementato | Incolla e leggi il risultato prima di pubblicare |

### Email

L'email sono due prodotti sotto un solo nome. Un messaggio in testo semplice non ha nessun analizzatore, quindi cancelletti e asterischi vengono mostrati a chi legge come caratteri, il che è il muro di punteggiatura che tutti hanno già visto. Un messaggio in testo formattato o in HTML ha un analizzatore, ma è un analizzatore HTML, e Markdown non è HTML. Vede un paragrafo che comincia con due cancelletti e mostra un paragrafo che comincia con due cancelletti.

La strada della selezione col mouse va meglio qui e porta con sé un problema tutto suo: il blocco incollato si porta dietro lo stile dell'applicazione di chat, quindi il tuo messaggio ha due font al suo interno e la catena di risposte citate sotto ne ha un terzo. Nel lungo periodo, la soluzione è non incollare affatto. Manda un link o un unico file autosufficiente per email, e lascia che il documento resti un documento.

### Slack e Teams

Un compositore di messaggi non è un editor di documenti, e non finge di esserlo. C'è l'enfasi in linea e il codice in linea, e questo è quasi tutto il vocabolario disponibile. Non c'è nessun titolo, quindi `## Risultati` è il testo letterale "## Risultati". Non c'è nessuna tabella, quindi una tabella diventa una pila di righe separate da barre che va a capo ai margini della finestra e perde l'allineamento delle colonne sul primo schermo stretto.

Questa è la destinazione dove la gente più spesso decide che la risposta va bene perché sembrava a posto nel compositore, ed è la destinazione dove il client di chi legge ha più probabilità di differire da quello di chi scrive. La forma sicura per la chat è un breve riassunto nel messaggio con un link al documento sotto. Due righe di prosa battono una tabella storpiata, e sopravvivono alla lettura su un telefono.

### Word

Word fa due cose poco utili insieme. Prende il testo Markdown alla lettera, e poi lo modifica. Il correttore automatico trasforma le virgolette dritte in virgolette curve, trasforma un doppio trattino in un tratto lungo, mette la maiuscola dopo quello che considera un punto, e converte una riga che comincia con un trattino in un elenco di Word con la numerazione di Word. Ognuna di queste cose ha senso da sola, e insieme significano che il testo che incolli non è il testo che hai copiato.

Per il codice questo non è solo disordinato, è fatale: un comando con una virgoletta curva dentro non funziona, e chi lo prova riceve un errore che non ha niente a che fare con il comando. Se qualcuno ha davvero bisogno di un file Word alla fine di tutto questo, è un lavoro di conversione e non un lavoro di copia e incolla, e gli strumenti che lo fanno bene sono i convertitori di documenti, non gli appunti.

### Google Docs

Docs si comporta molto come Word, con una variabile in più: c'è una preferenza a livello di documento che governa come viene trattata la sintassi Markdown, e lo stesso incollare quindi si comporta diversamente in due documenti della stessa persona. È peggio di un fallimento coerente, perché insegna una regola in un documento che è falsa nel successivo.

Verifica l'impostazione una volta su un documento usa e getta, incolla una risposta rappresentativa con una tabella e un blocco di codice dentro, e scrivi cosa è successo. Poi affidati a quel comportamento, oppure ignoralo di proposito. Quello che non dovresti fare è supporre che il comportamento visto il mese scorso sia quello che otterrai oggi.

### Notion

Notion è l'eccezione, e quella buona: il Markdown incollato viene generalmente letto come Markdown e convertito in blocchi, quindi i titoli diventano titoli e una tabella diventa una tabella. Se la destinazione è Notion, l'incollare è spesso la risposta giusta e il resto di questo articolo non serve.

Restano due cose da controllare. Notion è basato su blocchi e non su testo, quindi un annidamento più profondo di quello che la sua struttura permette viene appiattito, e l'indicazione di linguaggio di un blocco di codice può sopravvivere come linguaggio del blocco oppure no. Incolla, poi leggi i blocchi di codice e la lista più profonda, che sono i due punti dove la conversione perde informazione.

### Un ticket

I tracker si dividono in due schieramenti e la divisione non è ovvia da fuori. Uno schieramento tratta la casella di commento come Markdown, e in quel caso l'incollato è quasi corretto e solo le estensioni usate dal tuo testo falliranno. L'altro schieramento ha una sua marcatura che precede il dominio di Markdown, e in quello schieramento i tuoi asterischi e cancelletti non significano niente, o peggio, significano qualcos'altro.

Scopri una volta per tutte in quale schieramento sta il tuo, con un commento di prova su un ticket che nessuno sta guardando. Metti dentro una tabella, un blocco di codice e una lista annidata, perché sono le tre cose che separano gli schieramenti. Dopo saprai se incollare la risposta di un modello in un ticket è un lavoro di due secondi o una riscrittura di dieci minuti.

### Un CMS

Un sistema di pubblicazione è il posto dove un incollare andato male fa il danno più pubblico, perché il fallimento viene pubblicato invece che inviato. Gli editor a blocchi di solito fanno un paragrafo per riga e lasciano la sintassi visibile, il che è almeno evidente. Il caso peggiore è un editor che interpreta a metà: parte dell'enfasi in linea viene convertita, i titoli no, e l'articolo va online con tre cancelletti sopra la seconda sezione.

La maggior parte dei sistemi che pubblicano Markdown ha una via di importazione separata da quella dell'incollare, e quasi sempre è meglio. Se il tuo non ce l'ha, converti in HTML e incolla l'HTML nella vista sorgente dell'editor, dove la struttura è esplicita e puoi vedere esattamente cosa verrà mostrato.

## Cosa si rompe, costrutto per costrutto

La destinazione decide come appare un fallimento. Il costrutto decide se ce ne sarà uno. Questi sono gli otto che si rompono, nell'ordine approssimativo con cui compaiono in una risposta di chat. Ognuno ha una breve sezione qui sotto, tranne la matematica, che ha abbastanza da dire da meritare una sezione propria dopo le altre.

| Costrutto | Cosa ha scritto il modello | Cosa arriva | Perché |
| --- | --- | --- | --- |
| Tabella | Righe separate da barre verticali | Righe di barre, o una pila di linee non allineate | Le tabelle sono un'estensione GFM, non Markdown di base |
| Blocco di codice | Tre backtick e un'indicazione di linguaggio | Backtick come testo, indentazione persa, virgolette incurvate | La destinazione non ha uno stile di codice a livello di blocco su cui mappare |
| Lista annidata | Elementi `-` e `1.` indentati | Una lista piatta, o marcatori letterali | L'indentazione ha significato in Markdown ed è decorazione nel testo formattato |
| Enfasi dentro una parola | `mia_variabile_nome` | *mia variabile nome*, corsivo nel mezzo | I parser più vecchi enfatizzano i trattini bassi dentro le parole |
| Matematica | `$x^2$` | Due simboli di dollaro e un accento circonflesso | La matematica non è in nessuna specifica Markdown |
| Marcatore di nota | `[^1]` e la sua definizione | Parentesi letterali, due volte | Le note non sono nel nucleo né di CommonMark né di GFM |
| Marcatore di citazione | `[3]` o `[fonte]` | Parentesi letterali senza niente dietro | La definizione del riferimento non è mai stata generata |
| Emoji e virgolette tipografiche | Codepoint, virgolette curve, tratti | Riquadri, o caratteri che rompono i comandi | Copertura dei font e correttore automatico, non riguarda affatto Markdown |

### Tabelle

Una tabella Markdown è una riga di intestazione, una riga separatrice di trattini e due punti, e righe di corpo, tutte tenute insieme da barre verticali. Non fa parte della specifica originale e non fa parte di CommonMark; è arrivata con GitHub Flavored Markdown, il che significa che un parser può essere del tutto corretto e mostrare comunque la tua tabella come un paragrafo pieno di barre.

Il costo è peggiore di una tabella mancante, perché il ripiego non è vuoto. Sono i tuoi dati, non allineati, nell'ordine di lettura, con la punteggiatura tra le celle. Chi legge tenta di interpretarlo e sbaglia, e le colonne con celle vuote spostano il significato di una posizione senza avvisare. Se la risposta contiene una tabella, nessun incollare la manterrà ovunque, e il passaggio di conversione smette di essere opzionale.

### Blocchi di codice

Un blocco di codice sono tre backtick, un'indicazione opzionale di linguaggio, il codice, e di nuovo tre backtick. Sulla via d'uscita gli succedono tre cose separate. I caratteri della recinzione diventano testo visibile. L'indentazione iniziale viene normalizzata dalle regole di paragrafo della destinazione, quindi Python smette di essere valido. E il correttore automatico arriva alle virgolette, quindi anche il codice che ha mantenuto la sua forma può non funzionare più.

L'ultima di queste è quella che costa a qualcuno un pomeriggio, perché il codice sembra giusto. Una virgoletta curva e una dritta sono indistinguibili a colpo d'occhio in un font proporzionale, e il messaggio d'errore indica un problema di sintassi e non un problema di carattere. Se stai inviando codice, invia una pagina o un file, mai un testo incollato.

### Liste annidate

Markdown costruisce l'annidamento dall'indentazione, e il numero di spazi conta. Una destinazione per testo formattato non ha concetto di "due spazi di indentazione significano un elemento figlio" — ha livelli di lista, e li ricava di nuovo da qualunque struttura pensi di aver ricevuto. Un piano a tre livelli arriva spesso come una lista piatta con la gerarchia persa, il che è un cambiamento di significato e non solo di aspetto.

La strada del testo semplice fallisce in modo più visibile e meno pericoloso: i marcatori restano `-` e `1.` e chi legge può vedere cosa si intendeva. Il caso a metà successo è di nuovo la trappola, e vale la pena leggere la lista più profonda di qualunque risposta prima di inviarla da qualche parte.

### Enfasi dentro una parola

I modelli scrivono `**Nota:**` all'inizio di una riga di continuo, e di solito va bene. Il fallimento è il caso opposto: testo che non doveva mai essere enfatizzato e lo diventa. Gli identificatori scritti in snake case sono il classico — `mia_variabile_nome` ha due trattini bassi attorno a una parola, e i parser più vecchi ne mettono volentieri in corsivo il mezzo.

CommonMark ha stretto la maglia con regole di fiancheggiamento, quindi `_` dentro una parola non apre più l'enfasi in un parser conforme. Non tutte le destinazioni sono conformi, e quelle che interpretano a metà un testo incollato sono le meno probabili a esserlo. Il sintomo è un documento tecnico in cui ad alcuni identificatori mancano silenziosamente dei caratteri, un difetto difficile da individuare e costoso da consegnare.

### Marcatori di nota e di citazione

Le note non sono nel nucleo né di CommonMark né di GFM, quindi `[^1]` è un'estensione che un dato renderer implementa oppure stampa così com'è. Quando la stampa così com'è, ottieni il marcatore nel corpo e la definizione bloccata in fondo, entrambi tra parentesi, e il collegamento tra loro esiste solo nella testa di chi legge. [Cosa fa davvero ogni implementazione con le note](/blog/markdown-footnotes-support) vale la pena saperlo prima di farci affidamento.

I marcatori di citazione sono un problema diverso con lo stesso aspetto. Un modello a cui vengono chieste le fonti spesso genera `[1]`, `[2]`, `[fonte]` in linea senza mai generare le definizioni di riferimento di cui quelle parentesi hanno bisogno. Non è un fallimento di conversione — è un documento incompleto, e appare come parentesi letterali in ogni strumento, incluso quelli che supportano le note come si deve. Controlla che dietro ogni parentesi ci sia qualcosa prima di decidere che la colpa è del convertitore.

### Emoji

Le emoji arrivano come caratteri veri, quindi sopravvivono agli appunti intatte. Quello che non sopravvivono è il font della destinazione. Una macchina senza il glifo mostra un riquadro, un client di posta più vecchio può mostrare un punto interrogativo, e un font monocromatico mostra un pallino dove chi scrive intendeva uno stato. Convertire in HTML non risolve questo: un file autosufficiente può portarsi dietro i suoi stili, ma non il font emoji del sistema di chi legge.

Dove il carattere è decorazione, questo non costa niente. Dove porta significato — un segno di spunta contro una riga di una tabella e una croce contro un'altra — un riquadro al posto del glifo fa perdere l'unica informazione nella colonna. Sostituisci quei casi con parole. "Sì" e "No" si mostrano in ogni font che sia mai esistito.

### Virgolette tipografiche e tratti

I modelli generano caratteri tipografici: virgolette curve, apostrofi, tratti medi, puntini di sospensione. Nella prosa sono corretti e leggermente più eleganti delle alternative. In qualunque cosa che una macchina leggerà sono un difetto, e i due si incontrano ogni volta che una risposta contiene un comando shell, un frammento JSON o un percorso di file.

Il correttore automatico della destinazione aggiunge un secondo livello dello stesso problema, quindi testo che è uscito dritto dal modello può arrivare incurvato. La regola che ti tiene fuori dai guai è semplice: la prosa può avere caratteri tipografici, il codice no, e l'unico modo affidabile per tenerli separati è far passare il codice attraverso un convertitore che conserva un blocco di codice come elemento `<pre>` invece che attraverso un campo di testo che crede di essere d'aiuto.

## La matematica è un problema a parte

Niente in Markdown definisce la matematica. Non la sintassi originale, non CommonMark, non GFM. La matematica delimitata dal dollaro è una convenzione presa in prestito da TeX che i singoli renderer hanno aggiunto sopra, uno alla volta, con regole leggermente diverse. Questa è tutta la spiegazione del perché `$x^2$` sembra un'equazione nella finestra di chat e sembra due simboli di dollaro e un accento circonflesso ovunque altro.

La finestra di chat lo mostra impaginato perché una libreria di matematica è caricata nella pagina insieme al renderer Markdown. KaTeX, una delle scelte comuni, si descrive come la libreria di composizione matematica più rapida per il web ed è concessa in licenza MIT (verificato su katex.org, il 9 settembre 2026). GitHub lo mostra perché GitHub ha aggiunto la funzione di proposito: accetta `$…$` e `$$…$$` così come un blocco di codice `math`, e la sua documentazione dice che la resa è affidata a MathJax (verificato su docs.github.com, il 9 settembre 2026).

Un semplice convertitore da Markdown a HTML non ha nessun motivo per saperlo. Il suo compito è trasformare Markdown in HTML, e i simboli di dollaro non sono Markdown. Quindi fa l'unica cosa corretta a sua disposizione e li lascia passare come testo. Non è un limite da compensare cercando un convertitore generico migliore; è un compito diverso che richiede uno strumento fatto apposta.

C'è una trappola di secondo ordine nella stessa funzione. In un renderer che *supporta* davvero la matematica col dollaro, un normale simbolo di dollaro nella prosa può aprire un'espressione che non si chiude mai, o peggio, chiuderne una. Un paragrafo che menziona `$PATH` e un prezzo nelle stesse poche righe può ingoiare silenziosamente tutto quello che sta in mezzo. Lo stesso file quindi si mostra in modo diverso nella finestra di chat, su GitHub e nel tuo convertitore, e solo una di queste tre versioni è quella che intendevi.

| Se ti serve | Fai questo | Cosa costa |
| --- | --- | --- |
| Una o due espressioni semplici | Chiedile a parole, o in notazione semplice come `x^2` | Niente, e si legge bene in ogni destinazione |
| Notazione vera in un documento | Converti con Pandoc, che ha `--math-method=mathml` e `--math-method=katex` tra le sue opzioni (verificato su pandoc.org, il 9 settembre 2026) | Un'installazione e una riga di comando |
| Notazione vera in un file autosufficiente | Prerenderizza le espressioni in HTML con KaTeX in Node, poi converti il risultato | Un passaggio di build, e nessuna libreria matematica dal lato di chi legge |
| Matematica in una pagina che non deve caricare nulla | MathML, o immagini | Il supporto a MathML varia; le immagini non si riadattano né si scalano col testo |
| Consegnarlo oggi | Metti le espressioni in un blocco di codice ed etichettale | Onesto, brutto, e senza ambiguità — nessuno lo scambia per un errore di rendering |

La risposta pragmatica per la maggior parte dei documenti aziendali è la prima riga. Se la matematica è una formula che chi legge deve applicare piuttosto che una derivazione da seguire, la notazione semplice in uno span di codice la comunica perfettamente e viaggia ovunque. Riserva la composizione tipografica ai documenti dove la notazione è il punto centrale.

## Leggila prima che ci metta la firma il tuo nome

La documentazione generata dall'IA è documentazione. Esce con la tua firma, e chi legge riterrà responsabile te, non il modello.

Fallo prima di convertire, non dopo. Una pagina impaginata sembra finita, e le cose che sembrano finite vengono lette come se qualcuno le avesse controllate. Leggere è la parte che un modello non può fare per te qui — [un riassunto IA del documento](/blog/free-ai-document-summarizer) ti dice cosa sostiene di dire, che è una domanda diversa da se qualcosa di tutto ciò sia vero.

- [ ] Ogni numero: sai dire da dove viene?
- [ ] Ogni link: aprilo. URL plausibili che non portano da nessuna parte sono un fallimento comune.
- [ ] Ogni citazione, riferimento e nome di prodotto: conferma che esista e sia scritto correttamente.
- [ ] Qualunque codice: eseguilo, oppure dichiara chiaramente che non è stato testato.
- [ ] I passaggi sicuri di sé: il tono è identico sia che il modello sappia sia che stia indovinando.
- [ ] Qualunque cosa hai incollato nel prompt: controlla che nessuna parte sia stata ripetuta dentro la risposta.

Quella lista è il riassunto. I cinque controlli qui sotto sono quelli che vanno davvero storti, nell'ordine in cui vanno storti, e vale la pena farli uno per uno invece che con una sola scorsa veloce.

| Cosa controllare | Come si legge quando è sbagliato | Cosa costa saltarlo |
| --- | --- | --- |
| Affermazioni che non puoi far risalire a una fonte | Sicuro di sé, generico, e non attribuibile | Qualcuno ci pianifica sopra |
| Link | Un URL plausibile che non porta da nessuna parte | La tua credibilità, al primo clic |
| Citazioni attribuite a persone | Un nome reale accanto a parole che non hanno mai detto | Una persona nominata, travisata per scritto |
| Numeri senza origine | Una cifra precisa senza anno e senza fonte | Una decisione presa su un numero inventato |
| Affermazioni su un'azienda in attività | Un prezzo, una funzione, un limite, dichiarato senza esitazione | Un'affermazione pubblica sul prodotto di qualcun altro |

### Affermazioni che non puoi far risalire a una fonte

La regola non è "è plausibile" — l'output di un modello è uniformemente plausibile, ed è esattamente questo il problema. La regola è: sai dire da dove viene? Se la risposta è un documento, una pagina o una persona, tienilo. Se la risposta è "suona giusto", verificalo oppure taglia la frase.

Fai attenzione al centro sicuro di sé di un paragrafo più che agli estremi. Aperture e conclusioni vengono lette con attenzione perché portano l'argomentazione. L'invenzione che sostiene il resto è di solito una proposizione subordinata a metà, presentata come sfondo, che nessuno pensa di contestare perché non è il punto della frase.

### Link che non si risolvono

Aprili tutti. Non passarci sopra col mouse, aprili. Un modello che ha imparato come sono fatti gli URL di documentazione può produrre una stringa a forma di URL per una pagina che non è mai esistita, e la forma è convincente: il dominio giusto, un percorso plausibile, a volte un'ancora plausibile.

Qui si nascondono due fallimenti. Il link morto è quello ovvio e fallisce ad alta voce, il che è il caso buono. Il caso peggiore è un link vivo alla pagina sbagliata — il dominio giusto, un documento vero, e non quello che sostiene l'affermazione accanto. Controlla che la pagina su cui arrivi dica quello che la frase sostiene che dica.

### Citazioni attribuite a persone

Tratta ogni virgoletta attorno alle parole di una persona nominata come un difetto finché non è dimostrato il contrario. Una citazione attribuita male è la cosa più dannosa di questa lista, perché è un'affermazione scritta su cosa una persona identificabile ha detto, viaggia bene, ed è facilmente smontabile dalla persona in questione.

Trova l'originale. Se non riesci a trovare l'originale, rimuovi le virgolette e il nome insieme, e scrivi il punto con le tue parole. Una parafrasi di cui puoi rispondere vale più di una citazione di cui non puoi.

### Numeri senza origine

Ogni cifra ha bisogno di tre cose: un valore, un'unità e una data. L'output di un modello fornisce regolarmente la prima e lascia cadere le altre due, e una percentuale senza un anno accanto non è informazione. Fai particolare attenzione ai numeri che sembrano troppo rotondi, e a quelli che sembrano troppo precisi — entrambi sono pattern, non misurazioni.

Dove il numero conta e non puoi farlo risalire a una fonte, dillo nel documento. "Circa un terzo, dall'export del secondo trimestre, non verificato in modo indipendente" è utile per chi legge. Un nudo "34%" che nessuno può ricostruire è peggio di niente, perché verrà citato più avanti senza l'avvertenza che non hai mai scritto.

### Qualunque cosa su un'azienda in attività

Prezzi, limiti dei piani, disponibilità delle funzioni, termini di licenza, se un prodotto esiste ancora — tutte queste cose cambiano, tutte vengono affermate con sicurezza, e tutte sono affermazioni sul business di qualcun altro che escono con la tua firma sopra. Un prezzo sbagliato in un documento che circola internamente diventa un prezzo sbagliato in un budget.

Il controllo consiste nell'aprire la pagina del fornitore stesso e leggerla. Non un sito di comparazione, non un riassunto, non quello che ricordi dell'anno scorso — la pagina che l'azienda pubblica. Se mantieni l'affermazione, mantieni la data accanto, così chi legge dopo sa quanto è vecchia.

### Il riempimento, e la forma predefinita dei modelli

Taglia anche il riempimento. I modelli imbottiscono: un'apertura che ripete la domanda, un paragrafo di chiusura che riassume quello che chi legge ha appena letto. Elimina entrambi.

Lo stesso istinto vale per la struttura. Una risposta in tre punti non ha bisogno di tre titoli, un elenco a punti e una tabella riassuntiva che dicono le stesse tre cose in tre forme diverse. Questa stratificazione è ciò che fa sembrare sostanziale un contenuto breve, e togliere quello strato è di solito la differenza tra una pagina che si legge come ponderata e una che si legge come generata.

## Salva, converti, invia la pagina

La strada che resiste è poco brillante e richiede un minuto.

**Salva la risposta come file.** Premi copia, incolla in un qualsiasi editor di testo, salva come `handover.md`. Un file .md è testo semplice: niente da installare, niente che possa andare storto. Quello che non puoi fare è inviarlo — sul computer di un collega si apre nel programma che si è appropriato dell'estensione, o in niente del tutto.

**Convertila in HTML.** [La conversione da Markdown a HTML](/) lo fa nel browser: butta dentro il file e il lavoro avviene sul tuo computer. Da disconnesso, il file non lo lascia mai, il che conta quando la risposta contiene qualcosa di interno. Ottieni un'anteprima, il codice sorgente HTML esatto, e un download — un unico file .html autosufficiente con gli stili incorporati, senza script e senza richieste di rete. Diverse risposte, diversi file: buttali dentro tutti insieme e vengono concatenati in un unico documento, nell'ordine, separati da una linea. Una risposta di chat sono pochi kilobyte di testo, quindi qui niente si avvicina al limite di 10 MB per la conversione; quel tetto esiste per i documenti scansionati, non per la prosa.

**Invia la pagina, non il file.** L'.html si apre con un doppio clic su qualunque macchina. Se un allegato è ancora la forma sbagliata, accedi e pubblica invece un link di sola lettura: leggibile da chiunque abbia l'indirizzo, oppure solo dagli indirizzi che nomini. Revocalo e un link già inviato smette di funzionare. [I quattro modi per inviare un documento](/blog/share-a-markdown-document-as-a-link) tratta quale si adatta a quale lettore.

```bash
# with a key already remembered by `tp login`, publishing is one line
node cli/tp.mjs push handover.md --share link
```

I tre passaggi richiedono in tutto circa un minuto, e quel minuto compra qualcosa di specifico: un solo artefatto con un solo indirizzo, invece di un incollato per destinatario e nessun modo di correggerne uno. Quando trovi un errore in una pagina, ripari la pagina. Quando trovi un errore in sei testi incollati, scrivi sei scuse.

### La domanda sulla privacy che nessuno si fa

C'è un passaggio nel mezzo di tutto questo che la gente fa senza pensarci, e merita una riflessione. Incollare una bozza in un convertitore online è un caricamento. La maggior parte dei convertitori lavora lato server, il che significa che il testo lascia il tuo computer, attraversa la rete, e viene interpretato su hardware che non controlli, da un'azienda la cui politica di conservazione non hai letto.

Il contenuto peggiora la cosa invece di alleggerirla. Il documento che stai convertendo è una risposta di chat, e una risposta di chat contiene qualunque cosa tu abbia messo nel prompt: il nome del cliente, la data non ancora annunciata, la fascia salariale, il paragrafo che hai incollato da un documento interno per farlo riassumere. È esattamente il tipo di testo che non dovrebbe finire a un fornitore in più come sottoprodotto della formattazione.

La controargomentazione è che l'assistente ha già il testo, quindi cosa cambia una copia in più. Cambia qualcosa perché è un'azienda diversa, un periodo di conservazione diverso, una giurisdizione diversa e una superficie di attacco diversa, e perché la tua organizzazione ha approvato la prima e non sa niente della seconda. Un fornitore è una decisione. Due sono un incidente.

Il controllo richiede dieci secondi e non è una questione di fiducia. Apri la scheda di rete del browser, converti un file, e guarda. Un convertitore che gira nel browser non fa nessuna richiesta quando butti dentro il file — puoi vedere l'assenza. Un convertitore che carica ti mostra la richiesta, con il file dentro. È un fatto sullo strumento, non un'affermazione nel suo marketing, e [la domanda più ampia su cosa fa un convertitore online con il tuo file](/blog/is-an-online-converter-safe) vale la pena leggerla una volta e saperla per sempre.

La conversione lato browser è il motivo per cui TransformPipe può dire che non viene caricato niente quando non hai fatto l'accesso: non c'è nessun caricamento da descrivere. Accedere cambia questo di proposito, perché salvare un documento e pubblicare un link richiedono entrambi un server che li conservi — che è uno scambio che fai consapevolmente, per documento, invece che di default.

### Saltare del tutto la copia

Gli appunti sono l'anello debole di tutto questo, e si può eliminare. Un assistente con [un connettore](/agents) verso un servizio di conversione fa l'intera sequenza dentro la conversazione: prende il testo che ha appena scritto, lo converte, e ti restituisce un file o un link senza che niente di tutto ciò passi per un campo di testo. Niente ha la possibilità di subire una correzione automatica, perché niente è mai stato incollato.

Il meccanismo è un server MCP, oppure una chiamata a un'API, oppure un'invocazione da riga di comando da qualunque cosa l'assistente sia autorizzato a eseguire — la stessa conversione in ogni caso, raggiunta da una direzione diversa. [Convertire documenti dall'interno di un assistente](/blog/converting-documents-from-an-assistant) tratta cosa ogni strada può e non può fare. È la risposta giusta quando questo capita abbastanza spesso da diventare un'abitudine piuttosto che una commissione, e non cambia il passaggio di controllo qui sopra, che resta comunque tuo.

## Dove una pagina che sembra finita fallisce, e cosa costa

Ecco la parte scomoda, ed è il motivo per cui la sezione sul controllo sta prima della sezione sulla conversione e non dopo.

La formattazione è un segnale di credibilità, e chi legge lo applica senza accorgersene. Un muro di testo non formattato viene letto con scetticismo; chi legge presume che sia una bozza e tratta le affermazioni come provvisorie. Lo stesso contenuto con titoli, una tabella e una spaziatura coerente viene letto come un documento — qualcosa che è passato per un processo, che qualcuno ha controllato, che ha un livello di cura dietro. Niente di tutto ciò è vero per una risposta di chat convertita, ed è esattamente la conversione a fornire quell'impressione.

Quindi l'output di un modello è più pericoloso quando è ben formattato. Non quando è sbagliato — sbaglia alla stessa frequenza in entrambi i casi — ma quando la presentazione prende in prestito un'autorità che il contenuto non si è guadagnato. La citazione inventata che sarebbe stata messa in dubbio in un incollato grezzo viene inoltrata due volte in una pagina stilizzata. Questo è un costo reale del flusso di lavoro che questo articolo raccomanda, e l'unica cosa che lo compensa è la lista di controllo qui sopra, fatta come si deve, ogni volta.

Due abitudini aiutano. Dì cosa è il documento: una riga in alto che dice "redatto con un assistente, cifre verificate contro l'export del secondo trimestre, link controllati" non costa niente e viaggia insieme al file. E tieni il file `.md` di partenza accanto alla pagina, così chi verrà dopo può vedere cosa è cambiato tra la risposta del modello e quello che hai inviato.

Convertire non vale sempre la pena, per giunta. Certe volte un altro strumento vince nettamente.

Se chi riceve deve modificare il testo, invia qualcosa di modificabile: incollalo in un documento, accetta che il blocco di codice ne soffrirà, e lascialo lavorare. Se serve un vero .docx, Pandoc converte tra formati che un convertitore da browser non tocca, e [è lo strumento migliore per quel compito](/blog/pandoc-alternatives-for-markdown-to-html).

Se la risposta è tre frasi, digitale nel messaggio. Un passaggio di conversione per un paragrafo è pura cerimonia.

Se il contenuto appartiene al wiki del team, mettilo lì. Notion, Confluence e la maggior parte dei tracker accettano Markdown all'importazione o all'incollare, ognuno con le sue stranezze. Una pagina condivisa serve per documenti senza una casa, non per contenuti che ne hanno già una.

E se la risposta sarà sbagliata entro quindici giorni — uno stato, una serie di numeri che si muovono ogni settimana — una pagina è il contenitore sbagliato, indipendentemente da quanto bene si convertirà. I documenti sopravvivono alla loro accuratezza, e una pagina fatta bene le sopravvive più a lungo, perché continua a sembrare autorevole dopo che ha smesso di essere vera.

## Come scegliere cosa inviare

1. **Parti da cosa farà chi legge con il documento.** Leggere richiede una pagina, modificare richiede un file modificabile, e approvare richiede che i numeri siano verificati prima che succeda qualunque altra cosa. Scegliere il formato prima di sapere il verbo è il modo in cui un documento finisce nella forma sbagliata per tutti.
2. **Conta i costrutti prima di contare le parole.** Una tabella, un blocco di codice o un'espressione tra simboli di dollaro bastano a garantire che qualche destinazione la storpierà, e a quel punto convertire smette di essere una preferenza e diventa l'unica strada che resiste.
3. **Decidi se il testo può lasciare il tuo computer.** Se non può, il convertitore deve girare nel browser o su hardware che controlli, e la strada più breve — incollare nel primo strumento che una ricerca restituisce — diventa quella che non puoi prendere.
4. **Metti in conto il controllo prima della conversione.** Convertire richiede un minuto; verificare cinque numeri e aprire nove link richiede venti. Metterne in conto solo uno è il modo in cui un output non controllato acquisisce un foglio di stile e comincia a sembrare un lavoro fatto sul serio.
5. **Produci un solo artefatto invece di un incollato per persona.** L'elenco dei destinatari cresce dopo che hai inviato — qualcuno lo reinvia, qualcuno lo richiede una settimana dopo — e una pagina si può passare avanti senza cambiarla. I testi incollati no: ognuno è una copia separata che invecchia per conto suo.
6. **Testa ogni destinazione una volta, poi smetti di indovinare.** Incolla una risposta rappresentativa — tabella, blocco di codice, lista annidata — nello strumento che usi di più, conserva il risultato, e fidati. Il comportamento è stabile per ogni destinazione anche se varia moltissimo tra una e l'altra.

## Conclusione

La risposta nella finestra di chat è una resa visiva, e quello che copi è il codice sorgente che l'ha prodotta. Ogni destinazione in cui incolli decide di nuovo cosa significa quel codice sorgente, ed è per questo che lo stesso testo è pulito in una finestra e pieno di barre e asterischi nella successiva, e perché discutere con l'assistente sulla formattazione non risolve mai niente. La prossima volta che una risposta vale la pena di essere conservata, salvala come `.md` prima di fare qualunque altra cosa. Leggila contro la lista di controllo, correggi quello che il modello ha indovinato, taglia il riempimento, poi convertila una volta e invia la pagina — un file, un indirizzo, e lo stesso documento per chiunque lo apra.

## Domande frequenti

### Perché l'output di ChatGPT mostra asterischi e cancelletti quando lo incollo?

Perché l'assistente ha scritto Markdown e la finestra di chat lo ha impaginato per la visualizzazione. Il pulsante di copia ti dà il codice sorgente sottostante, e una destinazione senza un analizzatore Markdown mostra quei caratteri esattamente come sono. Non è rotto niente; stai guardando il testo che ha prodotto la formattazione che avevi visto.

### Come incollo una risposta IA in Word senza perdere la tabella?

Seleziona la risposta impaginata con il mouse invece di usare il pulsante di copia, e il browser metterà negli appunti una versione in testo formattato che Word di solito accetta, tabelle incluse. Controlla dopo i blocchi di codice e le virgolette, perché il correttore automatico di Word modifica quello che incolli. Per qualunque cosa debba essere esatta, converti il file invece di incollarlo.

### Qual è il modo migliore per inviare a qualcuno un documento generato dall'IA?

Salvalo come file `.md`, controllalo, e convertilo in un unico file HTML autosufficiente o in un link di sola lettura. Entrambi si aprono con un doppio clic o con un clic, su qualunque macchina, senza installazione e senza che chi legge debba sapere niente di Markdown. L'incollare è affidabile solo quando la destinazione è uno strumento nativo per Markdown come Notion o una casella di commento che parla Markdown.

### Perché i simboli di dollaro attorno alle mie equazioni non diventano matematica?

Perché la matematica delimitata dal dollaro non fa parte di nessuna specifica Markdown. È una convenzione che alcuni renderer hanno aggiunto sopra, quindi la finestra di chat e GitHub la mostrano mentre un convertitore generico lascia passare i caratteri tali e quali. Usa un convertitore con una modalità matematica, prerenderizza le espressioni, oppure scrivi formule semplici in notazione piana.

### È sicuro incollare una bozza IA in un convertitore online?

Solo se sai dove avviene la conversione. Un convertitore lato server riceve il caricamento di un documento che probabilmente contiene qualunque cosa tu abbia messo nel prompt, spesso il testo più sensibile che maneggi in tutta la settimana. Apri la scheda di rete e guarda: un convertitore lato browser non fa nessuna richiesta.

### Devo dire alle persone che un documento è stato redatto da un modello?

Sì, in una riga, insieme a quello che hai controllato. Non costa niente, imposta lo scetticismo di chi legge al livello giusto, e ti protegge quando una cifra che avevi verificato risulta sbagliata già alla fonte. Un output di un modello non dichiarato che poi fallisce è una conversazione molto peggiore di un output dichiarato che poi fallisce.

### Posso ottenere la risposta senza copiarla per niente?

Sì, se l'assistente può raggiungere direttamente un servizio di conversione tramite un connettore, un'API o un comando che è autorizzato a eseguire. Il testo va dal modello al convertitore senza toccare gli appunti, il che elimina del tutto la correzione automatica e i testi incollati interpretati a metà. Il passaggio di controllo resta esattamente dove era.
