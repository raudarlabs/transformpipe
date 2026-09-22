---
title: "Quanto costa un documento a un assistente, e come non spenderlo"
description: "Un token vale circa 3,5 caratteri: un documento entra nella finestra di contesto o non entra — l'aritmetica del convertire fuori da una conversazione"
date: 2026-09-22
tag: Automazione
keywords: risparmiare token ia, documento token finestra di contesto, convertire un documento senza ia, ridurre il consumo di token claude, token markdown, flusso di lavoro ia più economico
---

C'è un'abitudine che merita un esame. Hai un `.docx`, lo vuoi vedere come Markdown, e l'assistente è lì — quindi alleghi il file e chiedi. Funziona, e ti costa l'intero documento due volte: una all'andata e una al ritorno. Niente di quella conversione aveva bisogno di un modello linguistico. Leggere OOXML e scrivere Markdown è analisi sintattica, e l'analisi sintattica è un problema risolto da molto prima di tutto questo.

### In breve

Per Claude un token rappresenta approssimativamente 3,5 caratteri inglesi (verificato su platform.claude.com, 22 settembre 2026). Quel singolo numero rende l'intera questione una faccenda di aritmetica e non di opinione. Un articolo di 2.500 parole sono circa 15.000 caratteri, quindi più o meno 4.300 token; chiedere la conversione a un assistente li spende all'andata e altrettanti al ritorno, diciamo 8.500 per un lavoro che un parser fa gratis. Un documento con un'immagine incorporata è peggiore di due ordini di grandezza: un megabyte di base64 vale circa 300.000 token, che in gran parte delle finestre di contesto non entra affatto. Un collegamento allo stesso documento ne vale undici.

La versione onesta dell'affermazione: convertire un documento fuori dalla conversazione non rende un modello più economico di una certa percentuale. Toglie il documento dalla finestra di contesto del tutto, e quanto valga dipende da quanta parte della tua conversazione è testo di documento. La formula sta più sotto, così calcoli il tuo numero invece di credere al mio.

## L'unico numero da cui segue tutto

Il glossario di Anthropic lo dice senza giri di parole: in Claude un token rappresenta approssimativamente 3,5 caratteri inglesi, e il numero esatto varia con la lingua usata (verificato su platform.claude.com, 22 settembre 2026). Dividi un conteggio di caratteri per 3,5 e hai una stima utilizzabile. Raddoppiala se il testo non è inglese: quasi tutti i tokenizzatori sono stati tarati sull'inglese e spendono più token per carattere su tutto il resto, il che rende questo conto peggiore, non migliore, per un documento italiano.

Ecco file veri, misurati e non indovinati:

| Documento | Parole | Caratteri | Token, circa |
| --- | --- | --- | --- |
| Un lungo articolo di blog | 2.513 | 14.921 | 4.300 |
| Un README di progetto consistente | 4.654 | 30.138 | 8.600 |
| Un megabyte di immagine in base64 | — | 1.048.576 | 300.000 |
| Un collegamento a un documento condiviso | 5 | 40 | 11 |

Le ultime due righe sono quelle interessanti, e non sono un trucco retorico. Un'immagine portata dentro un file Markdown come URI `data:` è testo, e il testo viene tokenizzato. Se incolli un documento così in una conversazione, il modello legge ogni carattere di quella codifica. [Dove finiscono le immagini quando esporti un documento](/blog/pictures-in-a-document-export) spiega perché la codifica pesa un terzo più del file su disco; qui la conseguenza è che una sola schermata può costare più token di tutto il resto di una relazione lunga.

## Tre abitudini e quanto spende ciascuna

### Chiedere la conversione all'assistente

Il modello legge il documento e lo riscrive. Entrambe le metà sono conteggiate, e su ogni grande interfaccia la metà in uscita è tariffata più di quella in entrata, perché generare è più lavoro che leggere. Per l'articolo di sopra fanno circa 4.300 all'andata e 4.300 al ritorno.

Quello che ottieni in cambio: una conversione fatta da qualcosa che indovina. Un modello che legge un `.docx` non risolve gli identificatori di relazione per trovare le immagini, non legge `<w:numPr>` per capire a quale elenco appartiene un paragrafo, e i byte in `word/media/` non li vede affatto. Produce Markdown plausibile, che è cosa diversa da Markdown corretto, e gli errori sono di quelli silenziosi: un livello di intestazione che è slittato, una tabella la cui cella unita è diventata una colonna in più.

Quello che un parser consegna gratis: la risposta vera, in modo deterministico, uguale due volte.

### Incollare un documento per guardarlo

È il caso che l'aritmetica punisce davvero, ed è estremamente comune. Vuoi controllare un documento a metà del percorso: le tabelle hanno tenuto, le pagine preliminari sembrano giuste, la sezione quattro c'è ancora. Così chiedi all'assistente di mostrarlo, e lui riscrive il documento. È l'intera lunghezza del documento in token di uscita, spesa per un atto di lettura che un browser compie gratis.

Un'anteprima resa non costa niente. Un collegamento condiviso costa undici token e può essere aperto da qualcuno che nella conversazione non c'è. [Condividere un documento Markdown come link](/blog/share-a-markdown-document-as-a-link) è il meccanismo; qui conta solo che “mostrami il documento” è di gran lunga il modo più caro di guardare un documento.

### Tenere il documento nella conversazione mentre lavori ad altro

Il contesto non si paga una volta sola. Ogni turno successivo rimanda l'intera cronologia, quindi un documento incollato in cima viene ripagato a ogni messaggio successivo — ed è questo a trasformare 8.600 token una volta tanto in un costo permanente per il resto della sessione. La memorizzazione in cache cambia il prezzo di quella ripetizione su alcune interfacce, non il fatto che avvenga.

Tenere il documento per riferimento — salvato da qualche parte, indirizzato da un collegamento — significa che la conversazione porta undici token dove ne portava migliaia. È quasi tutto l'argomento in favore del [convertire documenti tramite un connettore](/blog/converting-documents-from-an-assistant) invece che nella finestra di chat: la chiamata allo strumento restituisce un indirizzo, e il documento stesso non entra mai nella trascrizione.

## La formula, per non dover credere a nessuno

Sia **D** il numero di caratteri di testo di documento in una conversazione, e **C** quello di tutto il resto: le tue domande, il ragionamento del modello, il codice, la discussione. Allora la quota di token di cui risponde il testo di documento è:

```text
document share = D / (D + C)
```

E il risparmio del convertire fuori dalla conversazione è quella quota, meno ciò che il modello deve davvero leggere.

Tre esempi onesti:

- **Alleghi una specifica da 30.000 caratteri e fai tre domande brevi.** D è 30.000, C forse 3.000. Il testo di documento è il 91 per cento della conversazione — ma ti serviva che il modello leggesse la specifica, quindi il risparmio è zero. Convertirla prima altrove non porta nulla.
- **Converti sei documenti in una sessione, guardi ciascuno e non ne discuti nessuno.** D è tutto e C quasi niente. Il risparmio si avvicina al cento per cento, perché niente di quello doveva stare nel contesto.
- **Lavori per davvero con un assistente e per strada converti quattro file, di cui ne guardi due.** È il caso realistico. Se quei file fanno 20.000 caratteri in tutto e la conversazione di lavoro 60.000, il testo di documento è un quarto del totale, e portare fuori le conversioni ne toglie quasi tutto.

È in quella fascia intermedia che vive l'affermazione onesta. Che un quinto o un quarto dei token di una sessione di lavoro finisca in testo di documento su cui nessuno voleva far pensare il modello è del tutto ordinario — e dipende del tutto dalle tue abitudini, ragione per cui una singola percentuale pubblicizzata sarebbe un numero inventato per suonare bene. Calcola `D / (D + C)` sulla tua trascrizione e avrai una cifra vera per te.

## Quando il modello deve leggerlo per davvero

Merita una sezione a sé, perché il resto dell'articolo si potrebbe leggere come “tieni i documenti lontani dagli assistenti”, e sarebbe sbagliato.

Se vuoi che il contenuto venga riassunto, criticato, tradotto, confrontato con un altro documento, controllato per contraddizioni o pensato in qualunque modo, allora il documento deve entrare nella finestra di contesto. Non è spreco: è il lavoro. Nessun convertitore lo riduce, e chi sostiene il contrario ti sta vendendo qualcosa. La sola economia sensata lì è mandare il documento nella sua forma onesta più compatta: Markdown anziché HTML, il testo anziché il base64 di una scansione del testo, le quattro sezioni pertinenti anziché l'intero manuale.

La distinzione è semplice e vale la pena tenerla: **una conversione è meccanica, un'interpretazione no.** Paga il modello per l'interpretazione. Non pagarlo per fare il parser.

## Come si presenta in pratica

Quattro cambiamenti, più o meno in ordine di risparmio:

1. **Convertire il file dove sta il file.** Un browser ha un parser dentro. Una conversione che avviene nella pagina costa zero token e non manda il documento da nessuna parte, che è una risposta sulla riservatezza tanto quanto sul costo.
2. **Guardare i documenti in un visualizzatore, non in una trascrizione.** “Riscrivilo che controllo” è l'abitudine cara. Il rendering è gratis.
3. **Passare i documenti per indirizzo.** Uno strumento che restituisce un collegamento tiene il documento fuori dalla cronologia, e fuori da ogni turno successivo.
4. **Togliere prima di inviare quello che non serve a nessuno.** Pagine preliminari, navigazione, formule ripetute e immagini incorporate sono tutti token, e per quasi ogni domanda nessuno di essi porta la risposta.

Le quindici conversioni di qui girano nel browser, e un connettore offre a un assistente le stesse conversioni come chiamate a strumenti che restituiscono un collegamento e non un documento. È costruito così per l'aritmetica di sopra, non il contrario: un documento che non entra mai nella trascrizione è il solo per cui hai la certezza di non pagare due volte. Per la variante via interfaccia, [convertire documenti con un'API](/blog/converting-documents-with-an-api) mostra come farlo da uno script, dove il conteggio dei token è zero per costruzione.
