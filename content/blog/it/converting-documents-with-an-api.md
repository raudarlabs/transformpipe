---
title: "Convertire documenti con un’API: cosa la rende davvero usabile"
description: Cosa serve a un’API di conversione prima che uno script se ne possa fidare — un corpo di richiesta onesto, errori veri, limiti pubblicati e un documento recuperabile
date: 2026-08-13
tag: Automazione
keywords: api conversione documenti, api markdown html, convertire documenti rest api, api conversione file, limite dimensione richiesta serverless, idempotenza conversione file, upload file api
---

Una conversione che avviene in una scheda del browser è una conversione che una persona ha fatto una volta. La versione interessante è quella che avviene a ogni merge, a ogni release, per quattrocento file alle due di notte, senza nessuno a guardare. Quella versione è una richiesta, e le richieste falliscono in modi in cui una pagina non fallisce mai.

### In breve

Un’API di conversione documenti è usabile quando quattro cose sono vere: il corpo della richiesta è il documento stesso, non un involucro dentro un altro involucro; un file rotto torna come un codice di stato e una frase che una persona può leggere; i limiti sono pubblicati invece che scoperti in produzione; e il risultato ha un URL che puoi recuperare di nuovo domani. Manda il file grezzo come corpo quando la conversione è già nominata nel percorso o nella query, e tieni un involucro JSON solo per l’unico caso in cui il corpo sarebbe altrimenti ambiguo. Pianifica il tetto sulla dimensione della richiesta prima che un file da 6 MB lo trovi per te — su una piattaforma serverless quel tetto è intorno ai 4,5 MB, ed è imposto sopra il tuo codice, quindi l’errore non è tuo da formulare.

L’attrito raramente è la conversione in sé. Analizzare il Markdown e generare HTML è un problema risolto, con mezza dozzina di buone librerie dietro. Quello che si rompe è tutto ciò che circonda l’analisi: un passaggio di build che invia un file e riceve indietro un 200 con un corpo vuoto, un job notturno che tronca in silenzio a qualunque dimensione la piattaforma rifiuti, un ritentativo che trasforma un documento in tre perché il primo tentativo è scaduto dopo essere già riuscito.

I fallimenti hanno una forma. Un client non può distinguere un 500 da un 413 se la piattaforma risponde prima che il tuo gestore giri. Un client non può distinguere “il tuo file non è JSON valido” da “il nostro storage è caduto” se entrambi arrivano come la stessa stringa di errore piatta. E un client non può comportarsi bene contro limiti che deve dedurre da una serie di rifiuti, che è quello che significa in pratica “contattaci per i dettagli”.

Quindi questo pezzo riguarda il contratto piuttosto che l’analizzatore. Dove un esempio concreto aiuta, usa la nostra stessa `/api/v1`, perché è quella di cui posso citare esattamente il codice sorgente e i messaggi di rifiuto invece di indovinarli.

## La domanda sul corpo della richiesta, forma per forma

### Confronto rapido: il foglietto

Ogni API di conversione risponde prima a una domanda — dove va il file? Le sette risposte sotto sono tutto lo spazio possibile, e la scelta decide quanto grande può essere un documento, quanto buoni possono essere i tuoi messaggi di errore, e quanto codice scrive chi chiama prima che qualcosa si converta davvero.

| Forma | Il corpo assomiglia a | Ideale per | Dove si rompe |
| --- | --- | --- | --- |
| File grezzo come corpo | Il file, byte per byte, con `Content-Type` a nominarlo | Una conversione nominata: un file in ingresso, un documento in uscita | I metadati non hanno altro posto dove andare che la query string |
| Involucro JSON | `{"name": "…", "markdown": "…"}` | Chi chiama con più campi da inviare | Il documento deve essere fatto scappare dentro una stringa JSON; il corpo è ambiguo quando il documento è esso stesso JSON |
| `multipart/form-data` | Una parte file più parti testuali | Form del browser, più file insieme | Ogni client ha bisogno di un encoder multipart; l’analisi costa memoria sul server |
| Base64 dentro JSON | `{"file": "PGh0bWw+…"}` | Formati binari attraverso client solo-JSON | Circa un terzo più grande sul filo, contro un tetto fisso sul corpo |
| Un URL che il server recupera | `{"url": "https://…"}` | Documenti già presenti in rete | Il server diventa un client HTTP puntato dove tu lo mandi, il che è un rischio di request forgery |
| Upload diretto, poi un riferimento | `{"blob": "uploads/ab12…"}` | File oltre il tetto della richiesta | Due andate e ritorno, un URL firmato da generare, e upload orfani da spazzare via |
| Un array in batch | `{"documents": [ … ]}` | Centinaia di file piccoli | Un file rotto nell’array impone una forma di risposta a fallimento parziale che nessuno scrive volentieri |

Niente qui è sbagliato in astratto. L’errore è scegliere due di queste forme per lo stesso endpoint e lasciare che sia il content type a decidere quale, senza dirlo — chi chiama posta un file `.json` per la conversione, con l’onesto `Content-Type: application/json`, e viene letto come un involucro, trovato senza nessun campo documento dentro, e rifiutato per una ragione che da fuori non ha senso.

### Il file grezzo come corpo

Il documento è il corpo. Niente lo avvolge, niente lo fa scappare, e `curl --data-binary @file.md` è tutto il client. Il nome e le opzioni viaggiano nella query string, dove sono visibili in una riga di log e facili da cambiare a mano.

| Pro | Contro |
| --- | --- |
| Nessun escaping: un file con backtick, virgolette e righe CRLF arriva intatto | I metadati devono vivere nella query string, che ha i suoi limiti di lunghezza |
| Il corpo più piccolo possibile, che conta contro un tetto fisso | Solo un file per richiesta |
| Debuggabile da una persona con `curl` e niente altro | Il server non deve indovinare il formato dai byte e sbagliare |

**Per chi è.** Chiunque chiami un endpoint la cui conversione è già nominata — dalla rotta, o da un parametro di query come `?kind=html-to-markdown`. Se l’endpoint sa già cosa dovrebbe essere il corpo, il corpo non ha nessun motivo di spiegarsi.

Il nostro prende questa forma per primo. `POST /api/v1/documents` legge il corpo della richiesta come sorgente, prende il nome del file da `?name=`, e prende la conversione da `?kind=`, che accetta `html-to-markdown`, `csv-to-markdown` e `json-to-markdown`; senza nessun `kind` il corpo è Markdown, che è quello che era ogni documento prima che ci fosse più di una conversione.

```bash
curl -fsS \
  -H "Authorization: Bearer $TP_API_KEY" \
  -H "Content-Type: text/markdown" \
  --data-binary @README.md \
  "https://transformpipe.com/api/v1/documents?name=README.md&share=link"
```

### L’involucro JSON

Il documento diventa un campo stringa dentro un oggetto. È la forma che la maggior parte dei client API scelgono di default, perché è la forma che tutto il resto del loro codice usa già.

| Pro | Contro |
| --- | --- |
| Più campi senza toccare la query string | Il documento deve essere fatto scappare e ri-scappare attraverso ogni livello |
| Un content type familiare per tutta l’API | Un documento JSON come payload va in collisione con l’involucro |
| Facile estendere senza una modifica incompatibile | Più grande sul filo una volta che le nuove righe diventano `\n` |

**Per chi è.** Chi chiama inviando più di un file — un nome, un titolo, un tema, una destinazione — e genera la richiesta da un client tipizzato invece che da una shell.

La collisione merita di essere nominata, perché è il bug che abbiamo spedito e poi corretto. L’involucro veniva riconosciuto dal content type, quindi postare un file JSON per la conversione con `Content-Type: application/json` veniva letto come un involucro, trovato senza nessun campo `markdown`, e rifiutato. La regola che l’ha corretto è una regola che vale la pena copiare: una conversione nominata possiede il corpo. Solo la conversione predefinita legge un involucro, e qualunque richiesta che nomina cosa sta convertendo ha il proprio corpo trattato come il file sorgente, qualunque cosa dichiari il content type.

### `multipart/form-data`

La forma che un form del browser produce senza aiuto, e quindi la forma che un servizio di conversione con un front end web tende a esporre.

| Pro | Contro |
| --- | --- |
| File e campi insieme, senza escaping | Ogni client non-browser ha bisogno di un encoder |
| Più file in una richiesta | I parser a streaming sono delicati; quelli a buffer sono avidi di memoria |
| Content type e nome file arrivano per ogni parte | Difficile riprodurre a mano quando stai debuggando alle due di notte |

**Per chi è.** Endpoint chiamati direttamente da una pagina, e client che hanno davvero più file per richiesta. Per una conversione scriptata di un solo file è cerimonia senza ritorno.

### Base64 dentro JSON

La via di fuga per i formati binari quando il client può parlare solo JSON. Un `.docx` è un archivio zip, quindi non può entrare in una stringa JSON come testo — base64 è come ci entra comunque.

| Pro | Contro |
| --- | --- |
| Binario attraverso un client solo-JSON | La codifica gonfia il payload di circa un terzo |
| Un content type unico fra testo e formati binari | Il tetto arriva prima: un file da 3,3 MB fa un corpo da 4,4 MB |
| Banale da loggare e confrontare, se ti piacciono i log enormi | Il client non può distinguere i fallimenti di decodifica da quelli di conversione senza un buon errore |

**Per chi è.** Ingressi binari che devono attraversare un confine solo-JSON, con un limite di dimensione fissato abbastanza basso perché il rigonfiamento non morda.

### Un URL che il server recupera

Chi chiama invia un indirizzo; il server scarica il documento e lo converte. Tentante, e la forma con il bordo più affilato.

| Pro | Contro |
| --- | --- |
| Nessun upload per documenti già presenti sul web | Il server diventa un client HTTP puntato dove dice chi chiama |
| Evita del tutto il tetto sul corpo della richiesta | Server-side request forgery, a meno che il recupero non sia limitato rigidamente |
| Comodo per README pubblici e pagine pubblicate | I fallimenti si moltiplicano: DNS, TLS, redirect, 404, timeout, e poi la conversione stessa |

**Per chi è.** Servizi che ne hanno bisogno abbastanza da fare il lavoro: una lista consentita o bloccata che coprea gli intervalli di indirizzi privati, un tetto sui redirect, un tetto sui byte, un timeout, ed errori che distinguono “non sono riuscito a recuperarlo” da “non sono riuscito a convertirlo”. Qualunque cosa in meno è un buco nella tua rete con un’interfaccia JSON.

### Upload diretto, poi un riferimento

Il client chiede un URL di upload a breve scadenza, mette il file direttamente nello storage a oggetti, e posta la chiave risultante. Il documento non passa mai per la funzione API.

| Pro | Contro |
| --- | --- |
| Il tetto sul corpo della richiesta smette di valere | Due andate e ritorno e un endpoint che genera token |
| I file grandi smettono di essere un caso speciale | Gli upload senza richiesta successiva vanno spazzati via |
| Le letture possono redirigere a un URL firmato, quindi le risposte restano piccole | Più pezzi mobili da sbagliare, e più da spiegare |

**Per chi è.** Qualunque servizio i cui documenti superano regolarmente il limite di corpo della piattaforma. È la risposta onesta a “alza il limite” — ed è un cambiamento a come i documenti si spostano, non un numero più grande, che è il motivo per cui il nostro tetto resta dov’è finché quel lavoro non è fatto.

### Un array in batch

Molti documenti, una richiesta. Attraente contro un limite di frequenza per minuto e scomodo dappertutto altrove.

| Pro | Contro |
| --- | --- |
| Centinaia di file piccoli senza centinaia di richieste | Il fallimento parziale ha bisogno di una forma di risposta, e i client devono gestirla |
| Un’autenticazione e uno slot di rate limit | Tutto il batch condivide un solo tetto sul corpo |
| Meno andate e ritorno su una connessione lenta | Un batch lungo flirta con il timeout della funzione |

**Per chi è.** Chi chiama con molti documenti piccoli e la pazienza di gestire un array di risultati per elemento. L’alternativa, quando i documenti appartengono comunque insieme, è unirli in un unico documento prima di postare — [il che ha i suoi problemi, soprattutto livelli di intestazione e collisioni di ancore](/blog/merging-many-markdown-files), ma produce una cosa sola che un lettore può davvero leggere.

## Errori e limiti che un client non dovrebbe dover scoprire da solo

Due tabelle decidono se chi chiama può automatizzare contro di te. La prima è cosa significano i tuoi rifiuti. La seconda sono le tue soglie. Entrambe appartengono alla documentazione, e nessuna delle due dovrebbe dover essere decodificata a ritroso da una serie di fallimenti nel log CI di qualcuno.

Un errore è utile quando porta tre cose: un codice di stato che significa quello che dice la specifica, un messaggio su cui una persona può agire, e una forma del corpo che è sempre la stessa. Un messaggio non è una cortesia. È la differenza fra un fallimento di build che qualcuno corregge in un minuto e uno che viene fatto salire.

Ecco l’insieme completo dai nostri stessi endpoint, che è piccolo apposta:

| Stato | Quando | Cosa dice il corpo |
| --- | --- | --- |
| 201 | Il documento è stato creato | Il documento, con il suo id, dimensione, conteggio parole e URL di condivisione |
| 400 | Un `kind` sconosciuto, un corpo vuoto, un valore `share` che non è `link` né `people`, un CSV senza righe, JSON non valido | Il messaggio dell’analizzatore stesso, incluso dove si è fermato |
| 400 | `kind=word-to-markdown` | Rifiutato per nome, con la pagina che lo fa nel browser |
| 401 | Nessuna credenziale, o una sconosciuta o revocata | Due frasi diverse, secondo se un’intestazione `Authorization` è stata inviata o no |
| 403 | L’account è senza spazio, o la concessione è di sola lettura | Quale limite, e quanto ne stai usando |
| 404 | Il documento di qualcun altro, o un id che non è un UUID | `Not found`, per entrambi, deliberatamente |
| 410 | La riga esiste e la sua fonte no | La fonte di questo documento è mancante |
| 413 | Un documento oltre il tetto per singolo documento | La dimensione del documento e la dimensione del limite |
| 429 | Più di 60 richieste in un minuto | Il limite, i secondi da aspettare, e un’intestazione `Retry-After` |
| 502 | Lo storage dei documenti non è raggiungibile | Che è nostro, e la ragione sottostante |

Tre di quelle righe esistono a causa di un fallimento specifico che vale la pena copiare. Un id malformato raggiungeva Postgres, che lo rifiutava, il che risultava in un 500 — così ora gli id vengono controllati nella forma e uno sbagliato è semplicemente non trovato. Un file salvato mancante e uno storage irraggiungibile arrivavano come lo stesso 500 nudo; separarli in 410 e 502 dice a chi chiama se rinunciare a quel documento o ritentare la richiesta. E restituire `Not found` sia per “nessun documento così” sia per “non è tuo” non è pigrizia: l’alternativa confermerebbe l’esistenza dei documenti di altre persone a chiunque abbia un generatore di UUID.

I limiti sono la seconda metà del contratto:

| Limite | Valore | Perché è quel numero |
| --- | --- | --- |
| Per conversione | 10 MB | La conversione gira nel browser, quindi è un giudizio sulla macchina davanti alla persona, non una regola di piattaforma |
| Per documento salvato | 4 MB | La piattaforma rifiuta una richiesta o un corpo di risposta oltre 4,5 MB; 4 MB lascia spazio per il nome e il JSON attorno |
| Per account | 100 MB e 500 documenti | Mille file minuscoli costano righe vere, quindi entrambi sono limitati |
| Per chiamante | 60 richieste al minuto | Contato per credenziale, così uno script fuori controllo non può spendere il budget di una sessione da browser |

Due proprietà di quella tabella contano più dei numeri stessi. Primo, ogni tetto nomina la cosa che lo impone, il che è come chi chiama sa se chiedere gentilmente aiuterebbe. Secondo, raggiungere un limite è un rifiuto piuttosto che uno sfratto silenzioso. Questa app cancellava il documento più vecchio per stare sotto il proprio tetto, il che distruggeva qualcosa che il proprietario aveva deliberatamente conservato; un rifiuto che dice cosa cancellare invece è peggio da ricevere e migliore da avere ricevuto.

## Autenticazione, e cosa una chiave non deve poter raggiungere

Un’API di conversione ha bisogno di una credenziale per una ragione sopra tutte le altre: i documenti sono di qualcuno. Il rate limiting, le quote e la gestione degli abusi discendono tutti dal sapere di chi sono.

La chiave bearer è la base, e ci sono cinque proprietà da fare bene.

**Un prefisso riconoscibile.** Le nostre iniziano con `tp_live_`, il che significa che il server può distinguere la propria chiave dal token di qualcun altro senza un controllo sul database, e gli scanner di segreti possono individuarne una in un commit. Una stringa opaca casuale non fa nessuna delle due cose.

**Con hash a riposo, mostrata una sola volta.** La chiave viene mostrata alla creazione e conservata solo come hash. Se si può rileggere da una pagina dell’account, si può leggere da un ticket di supporto, uno screenshot e un backup.

**Revocabile in un’azione.** Una chiave che non puoi uccidere in dieci secondi è una chiave che non ruoterai.

**Più stretta dell’account.** Una nostra chiave raggiunge documenti e condivisioni, e mai l’account, l’accesso o le chiavi stesse. È la proprietà che rende una fuga di dati sopravvivibile: una chiave rubata non può generare il proprio rimpiazzo né bloccare fuori il proprietario.

**Imposta sulla credenziale, non su una sola porta.** Questa è quella che ci ha morso. Una concessione di sola lettura da un assistente collegato — il tipo di token [che il connettore di un assistente riceve quando accede](/blog/converting-documents-from-an-assistant), invece di una chiave che qualcuno ha incollato — veniva controllata nel dispatcher degli strumenti piuttosto che sulla credenziale, quindi la promessa fatta sulla pagina di consenso — che non può salvare, condividere o eliminare — era vera per gli strumenti e falsa per l’API che quegli strumenti chiamano. Il controllo ora sta davanti a ogni rotta, come una lista dei metodi sicuri invece che una lista di quelli insicuri, così una rotta aggiunta l’anno prossimo è coperta di default. Un rifiuto torna come un 403 con `WWW-Authenticate: Bearer error="insufficient_scope"`, che è il modo standard di dire “autenticato, ma non per questo”.

Due decisioni più piccole risparmiano vero tempo di debug. Accettare un cookie di sessione oltre a una chiave significa che gli stessi endpoint si possono provare da un browser autenticato, così la documentazione è testabile senza generare una credenziale. E rispondere in modo diverso a una richiesta non autenticata secondo se un’intestazione `Authorization` è arrivata o no trasforma i due errori di configurazione più comuni — nessuna intestazione, e un’intestazione che il proxy ha rimosso — in due messaggi diversi invece di una sola scrollata di spalle.

## Limiti di frequenza, ritentativi e idempotenza

Un limite di frequenza è una promessa sul caso peggiore, e un client può cooperare solo con una promessa che può leggere. Il nostro è 60 richieste al minuto per credenziale, e il 429 porta sia il numero sia un’intestazione `Retry-After`, così un client non deve indovinare quanto dormire.

Essere onesti sul meccanismo conta anche. Il contatore è una riga per chiamante per minuto in Postgres, incrementata con un upsert. Non è precisa sotto concorrenza pesante — due chiamate possono leggere lo stesso conteggio — e a questa scala è il compromesso giusto rispetto a far girare una cache accanto al database. Chi chiama e ha bisogno di un budget esatto dovrebbe saperlo; chi ha solo bisogno di non martellare la cosa ha già tutto quello che gli serve.

Sul lato client, quattro regole coprono quasi ogni caso:

- Ritenta 429, 408 e 5xx. Non ritentare nessun altro 4xx: la richiesta è sbagliata e resterà sbagliata.
- Aspetta con backoff esponenziale e jitter, e rispetta `Retry-After` quando è presente — è un’informazione migliore della tua formula.
- Metti un tetto ai tentativi totali. Una build che ritenta all’infinito è una build che si blocca invece di fallire.
- Fai rumore quando fallisce. `curl` esce con codice zero su un 401 o un 429 a meno che tu passi `-f`, il che significa che una pipeline può scrivere un corpo di errore nel file che avrebbe dovuto convertire e continuare allegramente. È il modo più comune in cui una conversione guidata da API si rompe in silenzio, e non ha niente a che fare con l’API.

Il che porta all’idempotenza, e a un’ammissione onesta. `POST /api/v1/documents` non è idempotente. Posta lo stesso file due volte e ottieni due documenti, con due id e due URL di condivisione. Niente li deduplica.

È una scelta deliberata in un posto e un problema non risolto in un altro. È deliberata per la pubblicazione: [la nostra GitHub Action crea un nuovo documento a ogni push](/blog/publish-markdown-from-github-actions) esattamente perché un link in un vecchio commento di pull request continui a mostrare quello che quel commit diceva, invece di mutare sotto un revisore che l’ha aperto la settimana scorsa. Sovrascrivere sarebbe più ordinato e riscriverebbe silenziosamente una storia che qualcuno sta leggendo.

È un problema non risolto per i ritentativi. Se una richiesta scade dopo che la riga è stata scritta ma prima che la risposta sia arrivata, il client non può distinguere il successo dal fallimento, e il ritentativo prudente crea un duplicato. Ci sono tre vie d’uscita, e vale la pena sapere quale ha preso un’API che stai valutando:

1. **Una chiave di idempotenza.** Il client invia un valore univoco in un’intestazione — `Idempotency-Key` è la convenzione che le API di pagamento hanno reso familiare — e il server conserva la prima risposta contro quel valore per una certa finestra, riproponendo quella risposta per qualunque ripetizione. È la risposta giusta e costa una tabella, una politica di scadenza, e una decisione su cosa succede quando la stessa chiave arriva con un corpo diverso.
2. **Un id fornito da chi chiama.** Il client scegli l’id del documento, così una ripetizione è un conflitto piuttosto che un duplicato. Semplice, e passa la generazione dell’id a chi chiama, che magari non la vuole.
3. **Riconciliazione lato client.** Chi chiama elenca i documenti recenti e li confronta per nome e dimensione prima di postare. È quello che stai facendo che tu lo voglia o no, quando l’API non offre nessuna delle due opzioni sopra.

Un’API che dichiara idempotenza senza dire per quanto tempo, o quali campi formano la chiave, ti ha detto quasi niente. Chiedi la finestra.

## File troppo grandi per un corpo di richiesta

Ogni API di conversione ospitata ha un tetto di dimensione, e il tetto di solito non è un’opinione del servizio stesso. Su una piattaforma serverless, la richiesta e la risposta passano entrambe attraverso infrastruttura con i propri limiti, e su Vercel quel limite è 4,5 MB per un corpo di richiesta o di risposta, rifiutato come un 413 `FUNCTION_PAYLOAD_TOO_LARGE` (verificato su vercel.com/docs/functions/limitations, 8 settembre 2026).

La parte importante non è il numero. È che il rifiuto avviene sopra il tuo gestore. Un post da 6 MB non raggiunge mai il codice che avrebbe detto qualcosa di utile, quindi chi chiama riceve il 413 nudo della piattaforma e una pagina di errore scritta da nessuno in particolare. Da fuori sembra che la tua API si sia rotta.

È per questo che il nostro tetto per singolo documento è 4 MB piuttosto che 4,5 MB: l’app deve rifiutare la richiesta da sola, con una frase che nomina la dimensione del documento e la dimensione del limite, prima che la piattaforma la rifiuti senza parole. Il mezzo megabyte di margine è per il nome del file e il JSON attorno al Markdown. Ed è per questo che il tetto di conversione e il tetto di conservazione sono due numeri diversi invece di uno: convertire avviene nel browser e può permettersi 10 MB, conservare il risultato richiede una richiesta e non può.

Il lato risposta del tetto è facile da dimenticare. Recuperare un documento restituisce la sua fonte, e renderizzarne uno restituisce un intero file HTML; entrambi sono corpi di risposta, ed entrambi sono legati allo stesso limite. Un servizio che ti lascia caricare un documento più grande di quello che può restituirti ha una trappola dentro.

Se i tuoi documenti sono davvero più grandi del tetto, ci sono quattro opzioni oneste:

| Opzione | Cosa costa | Quando è giusta |
| --- | --- | --- |
| Dividere il documento | Più richieste, più output, e una decisione su cosa li collega | Documenti che erano già più documenti |
| Unire e convertire una volta | Un corpo grande, quindi aiuta solo se unire riduce il totale | Molti file piccoli che appartengono insieme |
| Convertire in locale, postare il risultato | Una dipendenza nella tua pipeline, e deriva di versione da gestire | Passaggi di build che hanno già un runtime disponibile |
| Upload diretto allo storage | URL firmati, uno spazzino di orfani, e letture che redirigono | Un servizio dove i documenti grandi sono normali piuttosto che eccezionali |

La terza opzione vale la pena prenderla sul serio piuttosto che trattarla come una resa. [Un convertitore locale a riga di comando](/blog/markdown-to-html-from-the-command-line) non ha tetto di dimensione, nessuna rete, nessuna chiave da ruotare e nessun limite di frequenza; quello che ha invece è un’installazione da mantenere e una versione il cui comportamento va fissato o andrà alla deriva. Un’API di conversione non è automaticamente la metà migliore di quel compromesso.

Un caso non è affatto un problema di dimensione. Un `.docx` è un archivio zip pieno di XML, e leggerne uno richiede un lettore zip e un mappatore di elementi — un peso che la nostra funzione non porta, quindi `kind=word-to-markdown` è rifiutato per nome con un puntatore alla pagina che lo fa nel browser. È un vincolo reale dichiarato onestamente, e la soluzione è [convertire prima il `.docx` e postare il Markdown che ne è uscito](/blog/convert-docx-to-markdown). Un’API che accettasse tranquillamente il file e lo conservasse senza convertirlo sarebbe peggiore in ogni modo.

## Recuperare fuori il documento

L’ultima cosa che separa un endpoint di conversione da un’API di conversione è se il risultato ha un indirizzo. Un endpoint che converte, restituisce byte e se ne dimentica ha reso chi chiama responsabile di storage, denominazione e condivisione — il che va bene se chi chiama voleva una libreria e non aiuta se voleva un servizio.

Tre rappresentazioni dello stesso documento coprono quasi ogni uso:

| Richiesta | Cosa torna | Usata da |
| --- | --- | --- |
| `GET /api/v1/documents/:id` | JSON: nome, tipo, dimensione, conteggio parole, stato di condivisione, e la fonte Markdown | Uno script che decide cosa fare dopo |
| `GET /api/v1/documents/:id.html` | Il file HTML autonomo, `?theme=dark` opzionale | Una build che scrive un file su disco |
| `GET /api/v1/documents` | I 500 più recenti, come elenco | Riconciliazione, pulizia, dashboard |

L’HTML autonomo merita una nota, perché “HTML” non è una cosa sola. Quello che torna è un documento completo — doctype, head, stili in linea — invece di un frammento, ed è lo stesso file che l’app stessa scarica, così uno script e una persona ottengono lo stesso identico output dallo stesso identico codice. Un’API di conversione che restituisce un frammento ti ha consegnato un lavoro, non un documento: aperto in un browser è testo non stilizzato alla piena larghezza della finestra.

Pubblicare è l’altra metà. `?share=link` sulla chiamata di creazione pubblica il documento e restituisce il suo URL nella stessa risposta, che è tutto il punto di un’API per uno strumento come questo — pubblicare un documento dovrebbe essere una richiesta piuttosto che tre. La revoca deve essere reale, ed è la parte che le persone sbagliano: riportare un documento a privato fa cadere il suo token, così un link già inviato smette di funzionare. Una condivisione che non puoi annullare non è una condivisione, è una pubblicazione.

E un documento sul web pubblico porta il contenuto di qualcun altro sul tuo dominio, che è una domanda di sicurezza piuttosto che una domanda sull’API. Le pagine condivise qui sono servite con `script-src 'self'` e `frame-ancestors 'none'`, quindi un’injection che fosse in qualche modo sopravvissuta [al sanitizzatore](/blog/sanitising-markdown-safely) non può comunque girare, e la pagina non può essere incorniciata come se fosse di qualcun altro. Se un’API di conversione ospiterà l’output per te, chiedi cosa manda nelle intestazioni prima di puntarla su documenti che non hai scritto tu.

Infine, un endpoint di utilizzo sembra un ripensamento e non lo è. `GET /api/v1/usage` risponde a “quanto sono vicino?” in una richiesta, che è la differenza fra un client che frena prima di essere rifiutato e uno che scopre ogni tetto sbattendoci contro.

## Dove un’API è la risposta sbagliata, e cosa costa

La risposta ovvia a “convertilo su un programma” è una chiamata API, e ci sono quattro casi in cui è quella sbagliata.

**Un file, una volta.** Una chiave da generare, un segreto da conservare e un client da scrivere, per un lavoro che una pagina fa in dieci secondi. L’API si guadagna il suo posto alla seconda occasione, non alla prima.

**Documenti che non devono lasciare la macchina.** Un contratto, una nota su un paziente, un piano non ancora pubblico — per questi la domanda non è se un servizio sia fidato ma se il file abbia mai attraversato la rete. La conversione lato browser risponde con la scheda di rete; una libreria locale risponde con un vero e proprio isolamento fisico. Un’API non può rispondere per niente, qualunque cosa dica la privacy policy.

**Una build che deve essere riproducibile.** Un servizio migliora, e migliorare è deriva. Se il tuo output deve essere identico byte per byte a quello dell’anno scorso, vuoi una versione fissata della libreria nel tuo stesso lockfile, non l’ultimo deploy di qualcun altro.

**Migliaia di file in un’unica esecuzione.** Sessanta richieste al minuto sono quaranta README senza nemmeno notarlo e quattromila pagine mai. A quel volume la risposta è un convertitore locale, o un documento unito, o un endpoint batch se il servizio ne ha uno.

I costi di scegliere un’API vale la pena dichiararli con chiarezza, perché sono tutti lo stesso tipo di costo: una dipendenza che non controlli.

- **Un salto di rete nella tua build.** Ogni conversione può ora fallire per ragioni che non hanno niente a che fare con il tuo documento — DNS, TLS, un deploy andato male dall’altra parte.
- **Un segreto con un ciclo di vita.** Le chiavi si perdono, scadono e vanno ruotate, in ogni ambiente in cui girano, e una rotazione dimenticata è un’interruzione programmata mesi fa.
- **Le soglie di qualcun altro.** Il loro limite di dimensione, il loro limite di frequenza e la loro quota diventano fatti della tua pipeline, e possono cambiare senza chiederti niente.
- **Una superficie di audit.** Dove è andato il documento, chi poteva leggerlo, per quanto tempo è stato conservato: tutte ora domande con risposte che devi andare a cercare invece che risposte che hai scritto tu.
- **Latenza che non puoi ottimizzare via.** Un’analisi locale è millisecondi. Un’andata e ritorno sono decine o centinaia, moltiplicate per il numero di file.

Niente di tutto questo argomenta contro un’API di conversione. Argomenta a favore di scegliere quella giusta perché l’alternativa era peggiore per quel lavoro, e sapere quali di questi costi hai accettato.

## Come giudicare un’API di conversione documenti

1. **Leggi il catalogo degli errori prima dell’elenco delle funzioni.** Se un file rotto torna come un 500 senza messaggio, ogni fallimento nella tua pipeline costerà un’ora del pomeriggio di qualcuno, perché l’API non ti ha detto niente su cui agire.
2. **Trova i limiti di dimensione nella documentazione, non in produzione.** Un limite che scopri da una richiesta rifiutata è un limite che hai scoperto durante una release, e su una piattaforma serverless il rifiuto può non arrivare nemmeno dal servizio.
3. **Controlla se un ritentativo può duplicare.** Senza una chiave di idempotenza o un id fornito da chi chiama, ogni timeout ti lascia a riconciliare a mano — quindi decidi ora se il tuo client deduplica, o accetta i duplicati deliberatamente come una scelta di pubblicazione.
4. **Controlla cosa può raggiungere la credenziale.** Una chiave che può creare chiavi, cambiare la fatturazione o eliminare l’account trasforma una variabile d’ambiente trapelata in un incidente piuttosto che in una rotazione.
5. **Chiedi cosa è davvero il corpo della risposta.** Un frammento significa che devi ancora scrivere l’involucro; un file completo e autonomo significa che puoi consegnare l’output direttamente a una persona.
6. **Prova ad annullare una condivisione.** Se revocare un link lascia il vecchio URL funzionante, l’idea di privato del servizio e la tua sono diverse, e lo scoprirai nel modo peggiore.
7. **Converti un documento vero, poi recuperalo di nuovo.** Non l’esempio della documentazione — il tuo file, con le sue tabelle, il suo frontmatter e i suoi caratteri strani, recuperato con una seconda richiesta. Quel singolo ciclo esercita la forma della richiesta, i limiti, i percorsi di errore e lo storage in un solo colpo, e richiede circa cinque minuti.

## Conclusione

Un’API di conversione documenti è un piccolo pezzo di infrastruttura che dice cosa sta facendo, oppure no. Le parti che lo decidono sono poco affascinanti: dove va il file nella richiesta, cosa torna per un file rotto, quale soglia appartiene al servizio e quale alla piattaforma sotto, se un ritentativo è sicuro, e se il risultato ha un URL. Fai bene quelle e la conversione stessa è la parte facile. Se vuoi vedere la stessa conversione a mano prima di automatizzarla, [il convertitore che sta davanti a questa API](/) gira nel browser, non converte niente altrove, e restituisce lo stesso file autonomo che restituisce l’API — il che lo rende un modo ragionevole di controllare cosa produrrà il tuo script prima di puntarlo su quattrocento file. E quando il documento che vuoi convertire non ha nessun file e nessun repository dietro perché un assistente l’ha appena scritto, [un connettore piuttosto che un client è la strada più corta](/blog/converting-documents-from-an-assistant).

## Domande frequenti

### Cos’è un’api di conversione documenti?

Un endpoint HTTP che prende un documento in un formato e lo restituisce in un altro, così la conversione può avvenire dentro uno script, un passaggio di build o un job pianificato invece che in una scheda del browser. Quelli utili conservano anche il risultato e gli danno un URL, così l’output si può recuperare di nuovo invece di rigenerarlo.

### Il file deve andare nel corpo della richiesta o in un campo JSON?

Mandalo come corpo grezzo quando l’endpoint sa già qual è la conversione, dalla rotta o da un parametro di query — niente deve essere fatto scappare e il corpo resta il più piccolo possibile. Usa un involucro JSON quando hai più campi da inviare, e assicurati che l’API dica quale forma vince quando il documento stesso è JSON.

### Qual è la dimensione massima del file per un’API di conversione ospitata?

Dipende più dalla piattaforma che dal servizio: su un host serverless, i corpi di richiesta e risposta sono limitati, e su Vercel il tetto è 4,5 MB, imposto prima che giri il codice dell’applicazione. I servizi che devono accettare documenti più grandi spostano del tutto il file fuori dalla richiesta, con un upload diretto allo storage e un riferimento postato dopo.

### Come evito che un ritentativo crei due documenti?

Preferisci un’API che accetta una chiave di idempotenza, così una richiesta ripetuta riproduce la prima risposta invece di creare un secondo documento. Dove non c’è nessuna delle due, fai generare al client un proprio marcatore e controlla l’elenco dei documenti recenti prima di postare, oppure trattare ogni post come una nuova versione deliberatamente — che è la risposta giusta quando i vecchi link devono continuare a mostrare quello che mostravano.

### Serve una chiave API separata per ogni ambiente?

Sì, per due ragioni: una chiave per ambiente si può revocare senza fermare tutto il resto, e un conteggio della frequenza per chiave significa che un job fuori controllo in staging non può spendere il budget della produzione. Tieni le chiavi nel gestore di segreti che la tua piattaforma offre già, mai nel repository, e ruotale a una data che hai scritto da qualche parte.

### Cosa dovrebbe restituire un’api di conversione quando il file è rotto?

Un 400 con il messaggio dell’analizzatore stesso, incluso dove nel file si è fermato — è l’unica informazione su cui chi chiama può agire, e un piatto “impossibile convertire” manda qualcuno a caccia in un megabyte a occhio. Riserva i 5xx ai fallimenti che sono del servizio stesso, e dai ai due casi codici diversi così un client sa se ritentare potrebbe servire a qualcosa.

### Posso convertire un documento Word tramite un’API?

A volte, e vale la pena verificarlo piuttosto che darlo per scontato. Un `.docx` è un archivio zip di XML, quindi un servizio deve portare un lettore zip e un mappatore per accettarne uno; dove quel peso non è nella funzione, la conversione è offerta nel browser e l’API prende il Markdown che ne è uscito.
