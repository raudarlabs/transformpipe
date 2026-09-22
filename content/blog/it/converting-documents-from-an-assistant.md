---
title: "Convertitore di documenti MCP: convertire e condividere documenti da una conversazione"
description: Come un convertitore di documenti MCP trasforma il Markdown di un assistente in una pagina da inviare — gli otto strumenti, l’accesso senza chiave e i rischi reali
date: 2026-09-09
tag: Automazione
keywords: convertitore documenti mcp, server mcp markdown html, connettore personalizzato claude, convertire markdown da un assistente, connettore oauth mcp, condividere un documento da una conversazione
---

Un assistente scrive Markdown tutto il giorno. Chiedigli delle note di rilascio, il riassunto di una riunione, la prima bozza di una specifica, e quello che torna indietro sono cancelletti, asterischi e barre verticali in una finestra di chat. Lì si legge correttamente, perché è la finestra di chat a renderlo. Da qualunque altra parte si legge come niente.

### In breve

Un convertitore di documenti MCP è un connettore: un piccolo server che l’assistente può chiamare, così il Markdown che ha appena scritto diventa un file convertito o una pagina pubblicata senza che una persona sposti testo fra due schede. La forma utile sono cinque verbi — convertire, salvare, condividere, elencare, recuperare — e la parte scomoda non è la conversione ma l’autorizzazione, che dovrebbe essere un’approvazione revocabile invece di una chiave a lunga vita incollata da qualche parte. È genuinamente comodo ed è genuinamente una concessione permanente ad agire per tuo conto, il che significa che un documento letto dal modello può cercare di convincerlo a usare i tuoi strumenti. Usa un connettore per il documento che esiste dentro una conversazione, e un’API, una CLI o un passaggio di build per tutto il resto.

La riparazione abituale è copiarlo fuori. Selezioni la risposta, copi, trovi un convertitore, incolli, aspetti, scarichi, rinomini il file, lo alleghi, noti che la tabella è uscita come un paragrafo di barre verticali, torni indietro e lo rifai. Ogni singolo passaggio funziona. Il problema è la sequenza, ed è il punto che continua a rompersi — la copia che prende metà di un blocco di codice, l’incolla che arriva con la formattazione della chat attaccata, il file chiamato `download (3).html`. Quell’attrito ha un articolo tutto suo: [cosa succede davvero quando sposti l’output di un modello in un documento](/blog/ai-output-to-a-shareable-page) copre la strada manuale e cosa costa, e questo pezzo non la ripete.

Quello che è strano nella strada manuale è che l’assistente è già un programma che chiama altri programmi. Legge file, esegue ricerche, apre pull request. L’unica cosa che di solito non può fare è darti il documento che ha appena scritto in una forma che una persona può aprire. Non perché sia difficile, ma perché nessuno ha collegato il convertitore.

Quel vuoto è quello che chiude un connettore, e il resto di questo articolo riguarda com’è fatto uno buono, cosa può fare per tuo conto, e i casi in cui usarlo è l’istinto sbagliato.

## Cos’è MCP, in parole semplici

Il Model Context Protocol è “uno standard open source per collegare applicazioni di intelligenza artificiale a sistemi esterni” (verificato su modelcontextprotocol.io, 9 settembre 2026). È tutta l’idea. Prima di questo, ogni assistente aveva il proprio formato di plugin, e ogni fornitore di strumenti scriveva la stessa integrazione più volte. Un protocollo condiviso significa che uno strumento si costruisce una volta e si raggiunge da qualunque cosa lo parli.

Ha una forma client-server, con tre partecipanti nominati invece di due. L’host è l’applicazione di intelligenza artificiale; crea un client per ogni server, e ogni client mantiene una connessione dedicata al proprio server, che è “un programma che fornisce contesto ai client MCP” (verificato su modelcontextprotocol.io, 9 settembre 2026). In pratica puoi leggere “host” come l’assistente in cui digiti, “client” come la parte che parla con un particolare strumento, e “server” come lo strumento stesso.

| Partecipante | Cos’è | In questo articolo |
| --- | --- | --- |
| Host | L’applicazione di intelligenza artificiale, che coordina uno o più client | L’assistente con cui stai parlando |
| Client | Mantiene una connessione e ottiene contesto da un server | Creato dall’host, non qualcosa che configuri direttamente |
| Server | Un programma che fornisce contesto e strumenti | Il convertitore |

Un server esporta fino a tre tipi di cose: strumenti, funzioni eseguibili che l’applicazione può invocare per compiere azioni; risorse, fonti di dati che forniscono contesto; e prompt, modelli riutilizzabili (verificato su modelcontextprotocol.io, 9 settembre 2026). Un convertitore è quasi interamente strumenti. Convertire è un’azione con un effetto sul mondo — un file esiste dove prima non c’era — che è esattamente a cosa serve uno strumento.

Ci sono due trasporti. Stdio “usa i flussi standard di input e output per la comunicazione diretta tra processi locali sulla stessa macchina”, e Streamable HTTP “usa richieste HTTP POST per i messaggi dal client al server, con eventi lato server opzionali per lo streaming”, che “consente la comunicazione con server remoti e supporta i metodi standard di autenticazione HTTP inclusi i bearer token, le chiavi API e le intestazioni personalizzate”, con OAuth raccomandato per ottenere quei token (verificato su modelcontextprotocol.io, 9 settembre 2026).

Quella distinzione decide come si sente installare un connettore. Un server stdio è un processo sulla tua macchina: lo installi, gira quando l’assistente lo avvia, e può raggiungere il tuo filesystem perché sta dentro il tuo filesystem. Un server HTTP è un URL: niente da installare, è lo stesso server per chiunque lo aggiunga, e la domanda interessante diventa come sa quale persona lo sta chiedendo. Un convertitore di documenti ospitato è del secondo tipo, il che è il motivo per cui gran parte di questo articolo riguarda proprio quella domanda.

Due cose che MCP deliberatamente non è. Non è un modo di far girare un modello — il protocollo “si concentra unicamente sul protocollo per lo scambio di contesto” e non impone come le applicazioni usano i modelli o gestiscono il contesto (verificato su modelcontextprotocol.io, 9 settembre 2026). E non è un sistema di permessi. Porta l’autorizzazione, ma non definisce niente su se il modello avrebbe dovuto chiamare lo strumento che ha appena chiamato. Quel giudizio resta a chi ha scritto lo strumento e a te.

## Quanto vale un convertitore come connettore

L’argomento per collegare un convertitore di documenti non è che convertire sia difficile. È che il documento è già dentro la conversazione, e tutto quello che faresti dopo è un’applicazione separata.

Cinque verbi coprono quasi tutto. Convertire, così il Markdown diventa una pagina. Salvare, così ha un indirizzo invece di vivere in un buffer di scroll-back. Condividere, così qualcun altro può aprirlo. Elencare, così l’assistente può rispondere a “cosa ho”. Recuperare, così un documento scritto tre settimane fa si può modificare invece di riscriverlo a memoria. Con questi cinque, il modello finisce il lavoro dentro la conversazione invece di consegnare al lettore un muro di asterischi e augurargli buona fortuna.

Il connettore di TransformPipe espone otto strumenti, e la divisione è deliberata: due lavorano, quattro rispondono a domande, e due cambiano cosa possono vedere altre persone o se un documento esiste.

| Strumento | A cosa serve | Cosa può causare |
| --- | --- | --- |
| `tp_help` | Risponde a domande su come funziona il prodotto, dalla sua documentazione invece che dalla memoria | Niente. Legge sezioni di documentazione e le restituisce |
| `tp_convert_markdown` | Markdown in ingresso, HTML sanitizzato in uscita; opzionalmente il documento completo autonomo | Niente viene salvato. L’output torna indietro attraverso la conversazione, quindi un documento lungo costa contesto |
| `tp_save_document` | Salva il Markdown sull’account, e lo pubblica nella stessa chiamata se richiesto | Scrive un documento. Con una modalità di condivisione, pubblica una pagina sul web pubblico |
| `tp_list_documents` | Cosa c’è sull’account — nomi, dimensioni, date, se ognuno è condiviso — con l’id che gli altri strumenti usano | Legge. Rivela l’elenco dei documenti alla conversazione |
| `tp_get_document` | Un documento, per id, come sorgente Markdown o come HTML renderizzato | Legge. Porta un intero documento dentro la conversazione |
| `tp_share_document` | Cambia chi può aprire un documento: un link, indirizzi nominati, o nessuno | Pubblica o annulla la pubblicazione. Revocare rompe un URL già inviato |
| `tp_usage` | Cosa sta usando l’account rispetto ai suoi limiti | Legge. Vale la pena chiederlo quando un salvataggio è stato rifiutato |
| `tp_delete_document` | Elimina un documento, in modo permanente | Distrugge dati. Richiede una conferma esplicita, e rimuove esattamente uno |

Due dettagli strutturali contano più della lista in sé.

Il primo è che gli strumenti non sono una seconda implementazione di niente. Ognuno chiama l’API pubblica dell’applicazione stessa, in processo, con la credenziale di chi chiama passata avanti, così una conversazione e uno script ottengono la stessa risposta dallo stesso codice. Sembra un dettaglio di pulizia interna e non lo è. Uno strumento che interrogasse direttamente il database sarebbe una seconda implementazione di “di chi sono questi documenti”, ed è la domanda a cui vuoi meno di tutte due risposte diverse. Lo stesso ragionamento vale per la conversione stessa: l’HTML che uno strumento restituisce è l’HTML che produce la pagina del browser, sanitizzato contro la stessa lista consentita, perché è lo stesso motore di rendering.

Il secondo è `tp_help`. Un modello a cui si chiede come funziona un prodotto risponderà con quello che ha assorbito durante l’addestramento, che per qualunque prodotto più giovane del suo taglio di conoscenza è una descrizione sicura di qualcosa che non esiste. Uno strumento di documentazione trasforma questo in una consultazione. È lo strumento meno affascinante della tabella e quello che previene il maggior numero di risposte sbagliate.

## Aggiungerlo, e l’accesso che non ha nessuna chiave dentro

L’indirizzo è il deployment più `/api/mcp`:

```
https://transformpipe.com/api/mcp
```

Su claude.ai va in Impostazioni → Connettori → Aggiungi connettore personalizzato. Da un terminale:

```
claude mcp add --transport http transformpipe https://transformpipe.com/api/mcp
```

È tutta la configurazione. Non c’è nessuna chiave da incollare, e l’assenza è il punto.

Sotto l’indirizzo, il trasporto è JSON-RPC su un singolo POST, senza flusso di eventi. Ogni strumento qui risponde dal database o dallo storage in un solo giro, quindi la sola cosa che comprerebbe un flusso è la segnalazione di avanzamento su un lavoro che non ha passaggi intermedi da segnalare. Un `GET` riceve un 405, che è un modo conforme al protocollo per dire che non c’è nessun flusso a quell’indirizzo.

### Cosa succede alla prima chiamata

La prima chiamata non porta nessun token, e quello che torna è un 401. Lo stato è il segnale del protocollo, e vale la pena dirlo chiaramente perché è il modo più comune con cui un connettore fatto in casa fallisce: un 200 che porta un errore scritto educatamente viene letto come uno strumento che ha fallito, e non fa mai partire un accesso. Solo il codice di stato lo fa.

Il 401 porta un’intestazione `WWW-Authenticate` che nomina un documento sulla risorsa protetta e gli ambiti che vuole — `documents:read documents:write`. Da lì il client percorre una catena di documenti “well-known” per scoprire dove accedere, si registra da solo, e manda la persona su una pagina del sito.

L’ordine degli eventi, che non è ovvio da nessuna singola parte di esso:

1. Il client fa un POST all’endpoint senza token e riceve un 401 più un’intestazione `WWW-Authenticate` che nomina il documento sulla risorsa protetta.
2. Legge `/.well-known/oauth-protected-resource` per trovare il server di autorizzazione, poi `/.well-known/oauth-authorization-server` per trovare gli endpoint di quel server.
3. Si registra e riceve un `client_id`. Nessun segreto viene rilasciato: un client che gira sulla macchina di qualcun altro non può conservarne uno, che è a cosa serve PKCE.
4. Manda la persona a `/authorize` con una challenge PKCE. Se non ha fatto l’accesso, viene parcheggiata e fatta passare prima dall’accesso dell’applicazione stessa.
5. Approva — con un POST da una pagina che ha davvero letto, così un link da solo non autorizza niente.
6. Il client scambia il codice e il suo verificatore con un access token e un refresh token.

Il sito deve essere il proprio server di autorizzazione per questo, invece di consegnare la sessione che ha già. La specifica di autorizzazione proibisce a una risorsa di accettare un token emesso da qualcun altro, quindi la persona accede esattamente come fa sempre, approva un client nominato su una pagina che ha guardato, e il client se ne va con un token fatto dal sito stesso.

### Cosa ottiene davvero il client

Un token che agisce come quella persona, per i suoi documenti, e non raggiunge niente altro. Non l’account. Non l’accesso a cui l’account è collegato. Non le chiavi API, che sono una credenziale separata per uno scopo separato. Gli access token sono emessi con una vita di trenta giorni e i refresh token con centottanta, così un connettore che usi continua a funzionare e un connettore che dimentichi finisce prima o poi.

Revocare sta nel menu dell’account, sotto le chiavi API, e ha effetto dalla chiamata successiva invece che alla fine di qualche finestra di cache.

Due dettagli nella pagina di consenso esistono a causa di attacchi specifici piuttosto che di buon gusto. La pagina nomina l’indirizzo per cui il client sta per agire, perché “approva” senza soggetto non è consenso. E il nome del client stesso viene spogliato dei caratteri di controllo e degli override bidirezionali prima di essere mostrato, perché un client potrebbe altrimenti registrarsi con qualcosa che termina in un override da destra a sinistra e far mostrare alla pagina una bugia — un problema che l’escaping dell’HTML non risolve in nessun modo.

### Perché questa forma invece di una chiave

Un connettore che tiene una chiave API a lunga vita che hai incollato è una credenziale in un posto che dimenticherai. Sta in un file di configurazione, o nelle impostazioni di un assistente ospitato, ed è forte come la chiave che hai incollato — che, se hai incollato quella che avevi già, è la stessa chiave che usano i tuoi script di deploy. Ruotarla rompe entrambi. Verificarla ti dice che una chiave è stata usata, non quale client l’ha usata.

Un client approvato è un oggetto diverso. Ha un nome che puoi leggere, un ambito più stretto dell’account, una propria scadenza, e un pulsante di revoca che non rompe niente altro che possiedi. Quando guardi l’elenco in sei mesi e non riconosci una voce, puoi rimuovere solo quella voce. È tutto l’argomento, e vale la pagina in più nel flusso.

## I due strumenti fatti apposta per i guai che possono causare

Sei degli otto strumenti sono ordinari. Due non lo sono, e sono scritti diversamente apposta.

**Condividere pubblica una pagina sul web pubblico.** Ci sono tre modalità, e la transizione fra loro è la parte che le persone sbagliano.

| Modalità | Chi può aprirlo | La conseguenza che vale la pena sapere |
| --- | --- | --- |
| `private` | Solo il proprietario | Revoca del tutto un link esistente, quindi un URL già inviato smette di funzionare |
| `link` | Chiunque abbia l’URL | È sul web pubblico. Un URL non è una password, e i link viaggiano |
| `people` | Solo gli indirizzi indicati | L’elenco degli indirizzi viene sostituito, non aggiunto — invia sempre l’elenco completo |

Salvare può pubblicare nella stessa chiamata, il che è comodo ed è esattamente il motivo per cui le istruzioni del server al modello dicono di condividere un documento solo quando la persona lo ha chiesto. Uno strumento che sia salva sia pubblica in un solo passaggio è uno strumento che può trasformare “tienilo” in “pubblicalo” con una singola frase letta male. Il rimedio non è sofisticato: la descrizione dice cosa fa nella prima riga, la modalità è un’enumerazione esplicita invece di un booleano chiamato `public`, e la risposta al modello dice in quale modalità è ora il documento e qual è il suo URL, così il riassunto dell’assistente per te è un’affermazione che puoi verificare.

**Eliminare richiede una conferma esplicita e rimuove esattamente un documento.** `confirm: true` è obbligatorio, e senza di esso lo strumento si rifiuta e dice al modello di andare a chiedere. Non c’è annullamento e non c’è cestino. E non c’è nessuno strumento che ne elimina più di uno — nessun pattern generico, nessun “elimina tutti i documenti condivisi”, nessun intervallo di date. È un’assenza deliberata, non una funzione mancante. Un’eliminazione in massa è l’unico strumento in cui un singolo fraintendimento distrugge lavoro che non si può recuperare, e un connettore che non può esprimere l’istruzione non può eseguirla.

La conferma è un rimedio reale e parziale, che è il tema della sezione successiva. Impedisce un’eliminazione accidentale, perché un incidente di solito non include un flag di conferma. Non impedisce un’eliminazione a cui il modello è stato convinto, perché un modello che è stato persuaso a eliminare qualcosa passerà `confirm: true` con la stessa facilità con cui passa l’id.

## Dove un connettore fallisce, e cosa costa

Un connettore è una concessione permanente ad agire per tuo conto. Non è un avviso in fondo alla pagina; è cosa è la cosa. Una volta aggiunto, l’assistente può chiamare quegli strumenti ogni volta che li giudica rilevanti, in una conversazione che non stai necessariamente leggendo con attenzione, sulla base di un testo che non hai necessariamente scritto tu.

**Un modello può essere convinto a usare i tuoi strumenti dal documento che sta leggendo.** Questo è il prompt injection, e non è un’ipotesi per un convertitore di documenti, perché leggere documenti è tutto il lavoro. Qualcuno ti manda un file Markdown. Chiedi all’assistente di convertirlo e pubblicarlo. Da qualche parte in mezzo a quel file, in un commento o in un blocco di codice o in testo bianco su bianco, c’è un paragrafo rivolto al modello invece che a te. Il modello sta ora elaborando istruzioni da uno straniero mentre tiene un token che agisce come te.

I rimedi sono reali, e sono parziali. Dichiararli onestamente vuol dire dichiarare entrambe le metà.

| Rimedio | Cosa impedisce davvero | Cosa non impedisce |
| --- | --- | --- |
| Un token limitato ai dati di un solo prodotto | Raggiungere la tua email, i tuoi repository, i tuoi altri account, o le chiavi API dello stesso account | Qualunque cosa dentro l’ambito: leggere, pubblicare ed eliminare i tuoi documenti |
| Una conferma esplicita sullo strumento distruttivo | L’eliminazione accidentale, e l’eliminazione casuale di cui la persona non ha mai chiesto | Un’eliminazione a cui il modello è stato persuaso e che conferma da solo |
| La condivisione visibile e revocabile | Una pubblicazione che resta segreta per te, o che è permanente | La finestra tra la pubblicazione e il tuo accorgertene. Una pagina copiata resta copiata |
| Nessuna operazione in massa | Un’istruzione sola che distrugge molti documenti | Chiamate singole ripetute, se nessuno guarda la trascrizione |
| La persona che legge cosa dice di aver fatto l’assistente | Gran parte, in pratica, se la persona legge davvero | Qualunque cosa in una conversazione che nessuno ha rivisto, che è la maggior parte delle conversazioni lunghe |

Quest’ultima riga fa più lavoro delle altre, ed è la meno affidabile. Il riassunto onesto è che la sicurezza di un connettore riposa oggi su un ambito ristretto più una persona che presta attenzione, e la seconda metà si degrada esattamente con il carico di lavoro che rende un connettore utile davvero.

Ci sono altri tre costi che non riguardano affatto l’injection.

**È un altro servizio che tiene i tuoi documenti.** Senza aver fatto l’accesso, la conversione nel browser di questo sito non invia niente a nessuna parte: il file viene letto, convertito e renderizzato sulla tua macchina, e puoi guardare la scheda di rete restare vuota mentre succede. Un connettore è l’opposto per necessità. Salvare un documento significa un account, un account significa spazio di archiviazione, e lo spazio di archiviazione significa un’azienda che tiene testo che hai scritto tu. Per un README è irrilevante. Per un contratto, una nota su un paziente o un piano non ancora pubblico è tutta la domanda, e la risposta giusta potrebbe essere convertire nel browser e non salvare mai.

**Il documento entra nella conversazione.** `tp_convert_markdown` restituisce l’output convertito attraverso lo stesso canale di tutto il resto, il che significa che un documento lungo diventa parte di una trascrizione tenuta da chiunque ospiti l’assistente. Lo strumento taglia il testo restituito a quarantamila caratteri e dice quanto ha tagliato, invece di troncare in silenzio — il troncamento silenzioso si legge come completezza, che è peggio di un vuoto visibile — ma tagliare è una gentilezza per la finestra di contesto, non un controllo di privacy. Per qualunque cosa lunga, salvarla e condividere il link è sia più economico sia meno esposto.

**Sanitizzare resta un problema tuo da capire, non da eseguire.** L’HTML grezzo in una fonte Markdown passa attraverso un sanitizzatore con una lista consentita fissa prima di raggiungere una pagina, quindi un tag `<script>` in un file che qualcuno ti ha inviato non sopravvive alla conversione. È una proprietà del convertitore piuttosto che del connettore, e vale la pena leggere [come funziona la sanitizzazione e dove deve avvenire](/blog/sanitising-markdown-safely) se stai convertendo file che non hai scritto tu. Quello che il sanitizzatore non può fare è dirti che la prosa stessa era rivolta al tuo assistente.

## I limiti, e perché uno di essi è 4 MB

Il connettore non è un prodotto separato con soglie separate. Gli stessi numeri valgono che un documento arrivi da una scheda del browser, uno script o una conversazione, che è l’unica disposizione che non produce ticket di supporto.

| Limite | Valore | Perché è quel numero |
| --- | --- | --- |
| Per conversione | 10 MB | La conversione gira nel browser, quindi è un giudizio sulla macchina davanti alla persona piuttosto che una regola di piattaforma. Più file caricati insieme contano come l’unico documento che diventano |
| Per documento salvato | 4 MB | Non è una scelta di politica. La piattaforma rifiuta una richiesta o un corpo di risposta oltre 4,5 MB prima che qualunque codice dell’applicazione giri, quindi un documento più grande non potrebbe essere né salvato né letto di nuovo |
| Per account | 100 MB, 500 documenti | Byte e righe sono limitati separatamente: mille file minuscoli costano righe vere |
| Per chiamante | 60 chiamate al minuto | Chi supera questo limite sta girando a vuoto, non lavorando |
| Testo restituito | 40.000 caratteri | Una risposta di uno strumento deve viaggiare attraverso la conversazione, e un documento non dovrebbe mangiarsela tutta |

La cifra di 4 MB è quella che vale la pena capire, perché è l’unico limite che non è una scelta. È fissata sotto i 4,5 MB della piattaforma stessa piuttosto che al livello esatto, così che il rifiuto arrivi dall’applicazione con entrambe le dimensioni nominate invece che come un rigetto secco da sotto — che è la differenza fra un modello che può dirti cosa fare dopo e un modello che segnala un fallimento che non sa spiegare. Un documento oltre quella dimensione si convertirà comunque, avrà comunque un’anteprima e si scaricherà comunque — la conversione gira nel tuo browser, dove non è coinvolto nessun corpo di richiesta — resta solo fuori dallo storico salvato, e l’applicazione lo dice invece di segnalare un salvataggio che non è avvenuto. Un connettore eredita esattamente questo: `tp_convert_markdown` gestirà un file che `tp_save_document` rifiuta.

Se un salvataggio viene rifiutato, `tp_usage` è lo strumento che dice perché, in forma di byte e documenti tenuti contro il tetto di ciascuno. Esiste perché “non si è salvato” è una frase che un modello altrimenti interpreterà in modo creativo.

Un’altra proprietà facile da perdere: l’export è un file completo invece di un frammento. Doctype, head, stili in linea, nessuna richiesta esterna. È quello che fa sopravvivere un documento convertito all’invio per email, all’apertura offline, o alla lettura su una macchina che non ha mai visto il sito — ed è [una proprietà specifica con compromessi specifici](/blog/self-contained-html-explained) piuttosto che una frase di marketing.

## Quando un connettore è lo strumento sbagliato

Un connettore serve per il documento che esiste dentro una conversazione. È un caso più stretto di quanto sembri a prima vista, e usarlo fuori da quel caso produce il peggio di entrambe le disposizioni: una persona nel ciclo, più un passaggio non deterministico nel mezzo.

| Il lavoro | Lo strumento giusto | Perché non un connettore |
| --- | --- | --- |
| Uno script converte documenti come parte di qualcosa più grande | La [REST API](/blog/converting-documents-with-an-api) | Uno script non ha bisogno di un modello che decida niente. Ha bisogno di un codice di stato e di un corpo |
| Una cartella di file, convertiti adesso | La [riga di comando](/blog/markdown-to-html-from-the-command-line) | Cento file sono un ciclo, non cento chiamate a uno strumento. È più veloce, più economico e ripetibile |
| Un repository che pubblica a ogni push | La [GitHub Action](/blog/publish-markdown-from-github-actions) | Il trigger è un commit, e non c’è nessuno nella conversazione da consultare |
| Un documento che hai già sul disco, una volta | La pagina del browser | Aggiungere un connettore per convertire un file è più configurazione del compito stesso |

Il test è dove sta il documento nel momento in cui vuoi che sia convertito. Se è sul disco, in un repository, o in una variabile, dovrebbe convertirlo un programma. Se esiste solo come testo che un modello ha appena prodotto, allora portarlo fuori per farlo convertire e riportarlo dentro per discuterne è di nuovo il problema del copia-incolla, con un cappello diverso.

Per contesto, i server MCP di riferimento pubblicati insieme al protocollo mostrano com’è il caso locale, in forma stdio: Filesystem, “operazioni sicure sui file con controlli di accesso configurabili”; Git, “strumenti per leggere, cercare e manipolare repository Git”; Fetch, “recupero e conversione di contenuti web per un uso efficiente da parte di un LLM”; più Memory, Time, Sequential Thinking e un server di test Everything (verificato su github.com/modelcontextprotocol/servers, 9 settembre 2026). Nota la divisione del lavoro. Filesystem e Git raggiungono già il tuo disco e il tuo repository, quindi un documento che vive in uno dei due non ha bisogno di un convertitore ospitato per essere recuperato — ha bisogno di uno che converta quello che quegli strumenti hanno consegnato, o di niente.

## Come giudicare un connettore di documenti

1. **Controlla se si può revocare senza rompere qualcosa altro.** Un connettore che riusa la tua chiave API esistente significa che ruotare quella chiave uccide anche i tuoi script di deploy, e lo scoprirai nel momento peggiore; un connettore che ha una propria approvazione si può rimuovere per un sospetto senza conseguenze.
2. **Leggi la descrizione dello strumento distruttivo prima di aggiungerlo.** Se eliminare non richiede conferma, o se c’è uno strumento che elimina più di una cosa alla volta, allora un’istruzione fraintesa in una conversazione lunga è una perdita di dati irrecuperabile invece di un errore fastidioso.
3. **Scopri se condividere è un passaggio separato o un flag su salvare.** Entrambi sono difendibili, ma un salvataggio che pubblica nella stessa chiamata ha bisogno che la modalità sia nominata esplicitamente nella risposta, altrimenti “l’ho salvato” e “l’ho pubblicato su internet” sono la stessa frase per chi legge il riassunto.
4. **Chiedi cosa restituiscono gli strumenti attraverso la conversazione.** Uno strumento che restituisce documenti interi riempirà la finestra di contesto e metterà il tuo testo nella trascrizione, quindi un connettore che restituisce un URL per qualunque cosa lunga ti sta facendo un favore che si traduce in costo più basso e minore esposizione.
5. **Conferma che i limiti corrispondano al resto del prodotto.** Un connettore con soglie proprie più silenziose rifiuterà qualcosa che il sito web accetterebbe, e il fallimento arriva come un modello che si scusa vagamente invece che come un errore su cui puoi agire.
6. **Decidi, prima di aggiungerlo, quali documenti sei disposto a far conservare.** Un connettore che salva è un servizio che tiene il tuo testo, e la sola versione di questa decisione che sopravvive a una settimana impegnata è quella presa in anticipo, non quella presa mentre incolli.

## Conclusione

Un connettore si guadagna il suo posto quando il documento è già dentro la conversazione e ogni alternativa comporta una persona che sposta testo fra due finestre. Quello che lo rende degno di essere aggiunto piuttosto che semplicemente ingegnoso è la parte noiosa: un token che copre i documenti di un solo prodotto e niente altro, un’approvazione con un nome sopra e un pulsante di revoca che non rompe niente altro, uno strumento distruttivo che chiede il permesso, e una condivisione che dice ad alta voce cosa ha appena pubblicato. Sono le proprietà da controllare su qualunque connettore, non solo su questo. Se preferisci tenere il documento sulla tua macchina, la stessa conversione gira nel browser con [niente caricato quando non hai fatto l’accesso](/) — e se il lavoro è uno script, una cartella o un repository, usa l’API, la CLI o l’Action invece, e lascia la conversazione ai documenti che esistono solo lì.

## Domande frequenti

### Cos’è un convertitore di documenti MCP?

È un convertitore di documenti esposto come server MCP, così un assistente può chiamarlo come strumento invece che una persona convertisse il file a mano. In pratica significa che il modello può trasformare il Markdown che ha appena scritto in HTML, salvarlo, pubblicarlo come pagina e recuperarlo più avanti, tutto dentro la conversazione dove il testo è già.

### Serve una chiave API per aggiungere il connettore?

No. La prima chiamata torna non autorizzata, l’assistente segue quella traccia verso una pagina del sito, e accedi con l’account che usi già e approvi un client nominato. Il client riceve un token valido per i tuoi documenti e niente altro, e lo revochi dal menu dell’account sotto le chiavi API.

### Un assistente può pubblicare il mio documento senza chiedere?

Può, ed è per questo che gli strumenti sono fatti così: salvare può pubblicare nella stessa chiamata, e le istruzioni del server dicono al modello di condividere solo quando la persona lo ha chiesto. La condivisione è visibile nel tuo elenco di documenti e revocabile, e riportare un documento a privato blocca un link già inviato dall’apertura — ma una pagina che è stata copiata mentre era pubblica resta copiata.

### Cosa succede se il mio documento è più grande del limite?

La conversione è limitata a 10 MB e un documento salvato a 4 MB, quindi un file fra queste due dimensioni si convertirà e si scaricherà ma non potrà essere tenuto sull’account. Quel secondo limite è della piattaforma piuttosto che una scelta di politica: una funzione rifiuta una richiesta o un corpo di risposta oltre 4,5 MB prima che qualunque codice dell’applicazione giri, quindi il documento non potrebbe essere né salvato né letto di nuovo.

### Un connettore è più sicuro che incollare in un convertitore online?

Falliscono in modi diversi. Incollare rischia la copia stessa — metà di un blocco di codice, una tabella rovinata, la scheda sbagliata — mentre un connettore rischia che una concessione permanente venga usata sulla base di un testo che non hai scritto tu, che è il prompt injection. Convertire nel browser senza aver fatto l’accesso non carica proprio niente, e per un documento che non puoi permetterti di conservare da nessuna parte, resta l’opzione più forte.

### Un connettore MCP funziona con un solo assistente?

No. MCP è uno standard aperto supportato da molti client, quindi un server remoto raggiunto via HTTP funziona con qualunque cosa parli il protocollo e possa completare l’accesso. Quello che differisce fra le applicazioni è dove incolli l’indirizzo e come presentano il passaggio di approvazione, non il server.

### Cosa dovrei fare se il connettore smette di funzionare?

Controlla prima l’approvazione: un client revocato, o un refresh token oltre la sua vita, produce esattamente la stessa risposta non autorizzata di un connettore appena nuovo, e riapprovare lo risolve. Se autorizza e poi si rifiuta di salvare, chiedi all’assistente di chiamare lo strumento di utilizzo, che riporta byte e documenti tenuti contro il tetto dell’account invece di lasciare che il modello indovini.

### Convertire tramite un connettore fa davvero risparmiare qualcosa?

Token, e la quantità è aritmetica e non un'affermazione. Una chiamata a uno strumento che restituisce un collegamento mette undici token nella trascrizione dove il documento stesso ne avrebbe messi migliaia — e la trascrizione viene rimandata a ogni turno successivo, quindi la differenza si somma. [Quanto costa un documento a un assistente](/blog/what-a-document-costs-an-assistant) fa il conto, compreso il caso in cui il modello deve davvero leggere il documento e il risparmio è zero.
