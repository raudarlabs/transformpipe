---
title: "Il miglior convertitore Confluence-Markdown gratuito del 2026: tutte le opzioni a confronto"
description: "Quale convertitore Confluence-Markdown gratuito lo è davvero: dove finiscono le prove, perché l’export integrato vuole i permessi di admin e cosa usare al suo posto"
date: 2026-09-14
tag: Conversione
keywords: convertitore confluence markdown, convertire confluence in markdown gratis, esportare confluence in markdown, da confluence a markdown, export confluence markdown gratuito, app markdown confluence, esportare spazio confluence in markdown
---

Cerca un convertitore da Confluence a Markdown gratuito e ogni risultato dice gratis. Poi li provi. Uno è una prova di trenta giorni che sulla scheda si chiama gratuita. Uno è davvero gratuito e fa una pagina alla volta, che non è quello che volevi quando la cosa da convertire è un wiki di quattrocento pagine. Uno è gratuito e già integrato in Confluence, e ti ferma davanti a un permesso che non puoi concederti da solo. E uno funzionerebbe benissimo se riuscissi a tirare fuori i contenuti da Confluence in una forma che riesca a leggere, che è poi tutto il problema.

È una quantità di asterischi insolita per un lavoro dall’aria semplice, e non è un caso. Confluence non ha un export in Markdown, quindi ogni strada passa o per un formato di export pensato per altro o per un’app che qualcuno con diritti di amministratore deve installare. Gratis, in questa nicchia, di solito significa gratis-per-te-se-qualcun-altro-dice-di-sì.

Questo pezzo parla di quale di quelle strade sia davvero gratuita, per chi e a quale scala. Per la meccanica — quale formato di export conserva cosa, in che cosa si trasforma ogni macro, perché i link interni si rompono — [come convertire una pagina Confluence in Markdown](/blog/convert-confluence-page-to-markdown) passa in rassegna i formati di export uno per uno e i danni che ciascuno provoca. Questo invece è la lista della spesa.

### In breve

**La strada gratuita alla scala di un intero spazio è un export più una conversione.** L’export HTML di uno spazio, quello di Confluence, non costa niente, ma richiede il permesso di amministratore dello spazio, e l’export fatto da un admin di spazio contiene solo ciò che il suo account può vedere, a meno che non lo esegua un admin del sito, che esporta tutto indipendentemente dalla visibilità (verificato su support.atlassian.com, 14 settembre 2026). Una volta che hai quello zip, convertirlo è gratis da qualunque direzione: lascialo cadere su [un convertitore nel browser](/confluence-to-markdown) per ottenere un unico documento unito con un elenco dei contenuti, oppure punta Pandoc o uno script turndown sui file HTML per avere un file Markdown per pagina.

**Sull’Atlassian Marketplace, leggi la parola sopra il pulsante.** Una scheda intestata **Free app** è gratuita; una intestata **Try it free** è una prova con un prezzo dietro. Oggi in questa categoria ci sono entrambe, e la sezione qui sotto dice quale è quale (verificato su marketplace.atlassian.com, 14 settembre 2026). In ogni caso qualcuno con diritti di amministratore deve installarla, che è lo stesso cancello dell’export.

**L’export in Word e in PDF è gratuito e non è una strada.** Sono i due export che chiunque può eseguire senza permessi, che è esattamente il motivo per cui la gente li usa, e sono i due che buttano via la struttura di cui una conversione in Markdown ha bisogno.

## Perché in questa conversione la parte difficile è il “gratis”

Per la maggior parte delle conversioni il gratis è una domanda noiosa. Un CSV è un file sul tuo disco; un convertitore lo legge; nessuno approva niente. Confluence è diverso in due modi, ed entrambi si trasformano in denaro o in permessi.

**Non esiste un export in Markdown, quindi ogni opzione gratuita fa due lavori.** Una pagina è salvata nel formato di storage di Confluence, basato su XHTML, e il menu di export offre rese di quel formato — Word, PDF, HTML, XML, CSV — nessuna delle quali è Markdown. Un convertitore deve quindi essere o un’app che vive dentro Confluence e legge quel formato tramite l’API, oppure un secondo passaggio dopo un export. Le app costano perché sono software mantenuto contro un’API che si muove; i secondi passaggi sono gratuiti perché i pezzi esistono già. È l’economia di tutta questa categoria.

**Gli export utili sono chiusi da permessi, non da pagamenti.** L’export di una singola pagina in Word e in PDF è disponibile a chiunque possa leggere la pagina. Tutto ciò che è alla scala dello spazio — HTML, XML, CSV — richiede il permesso di amministratore dello spazio. La strada gratuita e integrata non costa denaro e può costare una settimana di attesa su un ticket. La maggior parte di chi cerca un convertitore gratuito non è amministratore di spazio: è uno sviluppatore, una technical writer o una persona appena arrivata a cui è stato consegnato un wiki con la richiesta di portarlo in un repository.

Su quel secondo punto vale la pena essere schietti, perché nessuna pagina di prodotto te lo dirà: **se non sei amministratore dello spazio e non puoi diventarlo, la scelta del convertitore non è il tuo collo di bottiglia.** La domanda a cui stai davvero rispondendo è quale delle due richieste sia più piccola — chiedere a un admin di spazio di eseguire un export e mandarti lo zip, oppure chiedere a un admin del sito di installare un’app. La prima è un favore una tantum; la seconda è una decisione permanente su quale software gira sul Confluence dell’azienda, ed è il motivo per cui la strada esporta-e-converti vince più spesso di quanto la sua ergonomia meriterebbe.

Un’altra cosa su quell’export gratuito e integrato: l’export fatto da un admin di spazio contiene solo ciò che quell’admin può già vedere. Le pagine con restrizioni che lo escludono sono silenziosamente assenti dallo zip, e niente a valle può parlarti di una pagina che nell’archivio non c’è mai stata. Un admin del sito che esegue lo stesso export ottiene tutto (verificato su support.atlassian.com, 14 settembre 2026). I post del blog non compaiono affatto nell’export HTML o PDF di uno spazio, e i commenti non sono mai in un export PDF, secondo la stessa documentazione.

## Confronto rapido: il bigliettino

| Strumento | Ideale per | Capacità principale | Prezzo |
| --- | --- | --- | --- |
| L’export HTML di uno spazio Confluence | Tirare fuori i contenuti, prima di tutto | Un file HTML per pagina, più gli allegati, in uno zip | Gratis, richiede i permessi di admin dello spazio |
| Il convertitore nel browser su /confluence-to-markdown | Trasformare quello zip in un documento leggibile | Lasci cadere lo zip dell’export, ottieni un documento con l’elenco dei contenuti | Gratis; niente viene caricato se non hai fatto l’accesso |
| Pandoc | Una migrazione di massa via script | `html` in ingresso, `gfm` o `commonmark` in uscita, un comando per file | Gratis, GPL |
| Uno script turndown | Regole che devi controllare tu | Regole personalizzate per la marcatura di contorno che Confluence produce | Gratis, MIT |
| App del Marketplace, scheda Free app | Export in Markdown da dentro Confluence | Esporti senza uscire dalla pagina | Gratis come da scheda; la installa un admin |
| App del Marketplace, scheda Try it free | Valutare prima di una decisione d’acquisto | La stessa cosa, con albero delle pagine e allegati gestiti per te | Una prova; il prezzo sta nella scheda dei prezzi |
| Export in Word | Una pagina che ti serve dentro un editor | Un `.docx` di una singola pagina | Gratis, nessun permesso richiesto |
| Export in PDF | Mandare una pagina a qualcuno | Una pagina resa e statica | Gratis, nessun permesso richiesto, nessuna strada verso Markdown |

## Le opzioni, una alla volta

### L’export HTML di uno spazio Confluence, poi un qualunque convertitore da HTML a Markdown

Questo è il termine di paragone con cui si misurano tutte le altre opzioni gratuite, ed è due cose gratuite in fila invece di un solo strumento. Dalla barra laterale dello spazio: More actions, Space settings, General, Export space, HTML. Torna indietro uno zip con un file HTML reso per pagina, una cartella di allegati e un indice che elenca le pagine. Convertirlo è una normalissima [conversione da HTML a Markdown](/blog/convert-html-to-markdown), senza nessun passaggio specifico di Confluence.

| Pro | Contro |
| --- | --- |
| Gratis, senza account, senza installazioni e senza app da approvare | Permesso di admin dello spazio, che è il cancello contro cui sbatte la maggior parte delle persone |
| Marcatura vera: intestazioni, elenchi, tabelle e link sopravvivono come elementi | Lo zip contiene solo ciò che l’account che esporta può vedere |
| Gli allegati sono impacchettati accanto alle pagine che li citano | I nomi dei file sono generati da una macchina; l’albero delle pagine vive solo nel file indice |
| Non dipende da niente che possa cambiare prezzo o sparire dal Marketplace | I post del blog non sono inclusi nell’export HTML |

**Prezzo:** gratis. L’export fa parte di Confluence, e ogni convertitore che valga la pena puntare sul risultato è a sua volta gratuito.

**Dettagli tecnici.** L’HTML esportato è denso — stili in linea, `div` di contorno delle macro, `span` di icone che non portano testo — motivo per cui il secondo passaggio vuole un parser HTML vero e non uno script che cancella parentesi angolari. Il file indice è l’unico posto in cui esiste la gerarchia delle pagine, perché i nomi dei file sono piatti e portano id generati invece dei titoli. Se la tua destinazione ha bisogno di cartelle che rispecchino l’albero del wiki, quella corrispondenza tocca a te costruirla a partire dall’indice.

**Per chi è?** Per chiunque abbia i diritti di admin sullo spazio o conosca qualcuno che li ha, e per chiunque voglia una strada senza dipendenze permanenti.

### Il convertitore nel browser — lasci cadere lo zip dell’export, ottieni un documento

Una volta che hai quello zip, la strada gratuita più corta è consegnare l’intero archivio a un convertitore che lo legge direttamente. [La conversione da Confluence a Markdown di TransformPipe](/confluence-to-markdown) prende lo zip dell’export così come esce da Confluence, converte l’HTML di ogni pagina con lo stesso convertitore che sta dietro alla sua pagina da HTML a Markdown, e unisce tutto in un unico documento con un elenco dei contenuti in cima.

| Pro | Contro |
| --- | --- |
| Niente da decomprimere, nessuna cartella da percorrere, nessun file indice da leggere a mano | Un documento solo in uscita, non un file per pagina — la forma sbagliata per un sito di documentazione |
| Un elenco dei contenuti viene generato dal titolo di ogni pagina | L’elenco dei contenuti è fatto di titoli semplici, non di link |
| Gira nel browser; se non hai fatto l’accesso, lo zip non viene caricato da nessuna parte, e un allegato che è un’immagine viene portato dentro il documento | Un allegato che non è un’immagine mantiene il suo link, che continua a richiedere una sessione Confluence |
| Gratis, senza account, senza installazioni, senza niente da far approvare a un admin | L’ordine delle pagine segue i percorsi dell’archivio, non la gerarchia del wiki |

**Prezzo:** gratis. Un account aggiunge cronologia, condivisione e un’API, anche questi gratis.

**Dettagli tecnici e funzioni**

- Ogni voce `.html` viene letta, le cartelle e le voci vuote saltate, e le voci sono ordinate per percorso, così due export dello stesso spazio producono lo stesso documento nello stesso ordine
- Il titolo di ogni pagina viene dal suo elemento `<title>`, con ripiego sul nome del file privato dell’id numerico finale e con i separatori ritrasformati in spazi, così che anche una pagina il cui export non ha conservato il titolo finisca nell’elenco dei contenuti in modo leggibile
- Una pagina che si apre già con il proprio titolo come intestazione non se lo ritrova due volte; il doppione viene eliminato prima dell’unione
- Le pagine sono unite con una linea orizzontale, la stessa convenzione usata per unire a mano più file caricati
- La decompressione è `fflate`, puro JavaScript senza binding nativi, il che permette allo stesso codice di girare in una scheda del browser e sul server per chi chiama l’API

**Per chi è?** Per uno spazio che viene archiviato, per un wiki consegnato a una nuova squadra come documento unico, o per il caso in cui qualcuno ti abbia mandato uno zip di export e tu voglia leggerlo senza installare niente. Non è lo strumento giusto se ogni pagina deve restare un file suo con un URL suo.

### Pandoc — gratuito, e la risposta giusta per una migrazione di massa

Pandoc legge `html` e scrive `gfm`, `commonmark` e `markdown_strict` fra molti altri, il che rende la seconda metà della strada esporta-e-converti un ciclo di shell (verificato su pandoc.org, 14 settembre 2026). È l’opzione gratuita che scala, per quando l’output deve essere fatto di centinaia di file con una struttura che decidi tu.

| Pro | Contro |
| --- | --- |
| Gratuito e con licenza GPL, senza account e senza nessun servizio dietro | Un’installazione, e per giunta grossa |
| `-t gfm` ti dà la variante di Markdown che GitHub e quasi tutti i generatori di siti statici si aspettano | Nessuna conoscenza di Confluence: i `div` di contorno arrivano per quello che erano come HTML |
| `--extract-media` tira fuori i media collegati in una cartella e riscrive i riferimenti | Il ciclo, i nomi e la struttura delle cartelle li scrivi tu |
| Ha anche un lettore `jira` per la marcatura wiki di Jira e Confluence | Quella marcatura wiki non è ciò in cui è salvata una pagina Cloud moderna |

**Prezzo:** gratis, licenza GPL.

**Dettagli tecnici e funzioni**

- `pandoc -f html -t gfm page.html -o page.md` è l’intera conversione di una pagina; un ciclo sulla cartella dell’export è l’intera conversione di uno spazio
- `--wrap=none` impedisce a Pandoc di mandare a capo l’output a una larghezza fissa, cosa che conta se il risultato finisce in un repository dove i diff dovrebbero essere per frase
- `--extract-media=media` estrae i media citati dalla sorgente e aggiusta i riferimenti verso i file estratti — la cosa gratuita più vicina a una soluzione per gli URL degli allegati di Confluence legati alla sessione
- Il formato `jira` è elencato sia in ingresso sia in uscita, descritto come marcatura wiki di Jira e Confluence — utile per vecchie pagine Server scritte così, e non una strada per le pagine Cloud, che sono invece salvate nel formato di storage basato su XHTML
- `gfm` è la variante da chiedere se contano le tabelle; `markdown_strict` non ha proprio una sintassi per le tabelle

**Per chi è?** Per chiunque sposti un wiki dentro un repository una volta sola e fatta bene — dove il risultato è un albero di cartelle, uno schema di nomi e una build che si rigenera in modo pulito. Una migrazione che eseguirai due volte dovrebbe essere uno script, e questo è lo script.

### Uno script turndown — gratuito, quando le regole devono essere tue

Turndown è una libreria JavaScript che converte HTML in Markdown, con licenza MIT, e accetta stringhe HTML o nodi DOM (verificato su github.com/mixmark-io/turndown, 14 settembre 2026). Il motivo per scriverci attorno uno script invece di lanciare Pandoc è che l’HTML esportato da Confluence ha dentro forme riconoscibili — pannelli di macro, involucri dei blocchi di codice, macro expand — e turndown ti permette di aggiungere una regola per forma.

| Pro | Contro |
| --- | --- |
| Gratuito, MIT, e una dipendenza invece di un’installazione | Stai scrivendo un programma, con tutto quel che comporta |
| Le regole possono agganciarsi ai nomi di classe di Confluence e produrre esattamente quello che vuoi | Ogni regola è un debito di manutenzione quando la resa di Confluence cambia |
| `turndown-plugin-gfm` aggiunge tabelle e testo barrato sopra alle regole di base | Turndown senza quel plugin non produce tabelle |
| Gira ovunque giri Node, CI compresa | Ha bisogno di un DOM: in Node vuol dire fornirgliene uno |

**Prezzo:** gratis, licenza MIT.

**Dettagli tecnici e funzioni**

- Una regola è un filtro più una funzione di sostituzione, quindi far diventare `div.confluence-information-macro-note` una citazione a blocchi sono poche righe invece di una passata di post-elaborazione su tutto l’output
- Siccome turndown accetta nodi DOM, uno script può potare prima di convertire — eliminando gli `span` delle icone e gli arredi di navigazione che un convertitore generico trasforma fedelmente in righe vuote sparse
- Il plugin GFM è il pezzo da aggiungere per primo: le tabelle sono la cosa più comune in un wiki esportato, e la libreria di base le lascia come HTML

**Per chi è?** Per una migrazione in cui l’output deve rispettare una guida di stile esistente, o in cui una macro compare su duecento pagine e deve uscire sempre allo stesso modo. Per una conversione una tantum è più lavoro di quanto il risultato giustifichi.

### Le app dell’Atlassian Marketplace — leggi la parola sopra il pulsante

Diverse app esportano le pagine di Confluence in Markdown da dentro Confluence, senza un export HTML intermedio. È qui che il “gratis” richiede più attenzione, perché il Marketplace mostra due cose diverse quasi nello stesso posto: una scheda intestata **Free app** è gratuita, e una intestata **Try it free** è una prova con un prezzo nella scheda dei prezzi.

Oggi ci sono entrambe. Elencate come app gratuite: “Markdown Exporter for Confluence (API, Bulk & Attachments)” di Yamuno Software US, e “Markdown | Source Editor | Markdown Exporter (FREE)” di Agilva Solutions. Elencate come Try it free: “Easy Markdown Exporter for Confluence” di AppLiger, “Markdown Exporter for Confluence” di Narva Software, “Export to Markdown for Confluence Cloud” di Atly Apps, e “Instant Markdown Exporter for Confluence” di Philip Lindner, che dichiara una prova gratuita di 30 giorni (tutte verificate su marketplace.atlassian.com, 14 settembre 2026).

| Pro | Contro |
| --- | --- |
| Markdown direttamente, senza un passaggio separato di export e conversione | Installare un’app è una decisione di un amministratore, non di chi scrive le pagine |
| Alcune riscrivono i link in percorsi relativi e conservano l’albero delle pagine, cosa che la strada gratuita non fa | Una scheda che dice Try it free è una prova, e il prezzo è a una scheda di distanza |
| Girano sui contenuti dal vivo, quindi niente è l’istantanea del giorno di un export | Schede, fornitori e prezzi in questa categoria cambiano spesso |
| Le app Forge girano dentro il tuo ambiente Atlassian | Un’app è una dipendenza permanente che qualcuno deve mantenere |

**Prezzo:** varia, e l’intestazione della scheda è il segnale più rapido — Free app oppure Try it free (verificato su marketplace.atlassian.com, 14 settembre 2026). Controlla la scheda attuale invece di fidarti di un articolo, questo compreso: è la parte più probabilmente superata nel momento in cui la leggi.

**Dettagli tecnici.** Le differenze che vale la pena confrontare sono quelle che la strada gratuita non sa proprio fare: se la gerarchia delle pagine venga conservata come cartelle, se gli allegati scendano insieme alle pagine, e se i link interni vengano riscritti in percorsi relativi così che il risultato si possa navigare offline. Quelle tre cose sono il prodotto vero; convertire HTML in Markdown è la parte di base, ed è il motivo per cui esistono così tante di queste app con così poco a distinguerle.

**Per chi è?** Per squadre che installano app dal Marketplace di routine e vogliono l’export in Markdown come capacità permanente. Per una singola migrazione, la strada esporta-e-converti ti porta a destinazione senza una conversazione con gli acquisti.

### Export in Word o in PDF — gratis, senza permessi, e senza uscita

Sono i due export disponibili a chiunque possa leggere una pagina, motivo per cui sono la prima cosa che la gente prova quando l’export HTML è disattivato. Stanno qui per onestà, non come raccomandazione.

| Pro | Contro |
| --- | --- |
| Nessun permesso oltre alla lettura della pagina | Una pagina alla volta; non esiste una versione alla scala dello spazio che aiuti |
| Gratis, integrato, due clic | Il PDF è output reso — la struttura è già sparita prima che un convertitore la veda |
| Un `.docx` almeno conserva intestazioni, elenchi e tabelle come struttura | Le intestazioni di Word valgono quanto l’uso che l’export ha fatto dei veri stili di intestazione |
| Va bene quando la destinazione era Word o PDF fin dall’inizio | I commenti non sono mai inclusi in un export PDF |

**Prezzo:** gratis.

**Dettagli tecnici.** La strada del `.docx` non è disperata — un documento Word ha un modello di documento vero, e [convertirlo in Markdown](/blog/best-word-to-markdown-converters) recupera intestazioni, elenchi e tabelle. È la strada lunga: dal formato di storage a Word a Markdown, perdendo qualcosa a ogni salto, mentre da HTML a Markdown è un salto solo con meno perdite. Il PDF è davvero un vicolo cieco, perché un PDF descrive dove va l’inchiostro su una pagina e la struttura delle intestazioni di cui Markdown ha bisogno lì dentro non esiste più.

**Per chi è?** Per chi ha una pagina sola, nessun diritto di admin sullo spazio e nessuna voglia di aprire un ticket. Per quella persona l’export in Word più una conversione da Word a Markdown è una strada gratuita legittima, e vale la pena dirlo invece di far finta che l’unica risposta corretta richieda permessi che non ha.

## Dove la scelta gratuita ovvia non regge

La strada esporta-e-converti è la raccomandazione di questo articolo, quindi merita una sezione su dove non regge. Ci sono quattro punti, e tre non sono colpa del convertitore.

**Produce file, e i file non sono un wiki.** Uno spazio Confluence è un albero con link incrociati. L’export HTML appiattisce quell’albero in una cartella di nomi di file generati, e ogni convertitore a valle eredita l’appiattimento. Ottieni i contenuti e perdi la navigazione, a meno che tu non la ricostruisca dall’indice. Le app del Marketplace che pubblicizzano “conserva la gerarchia” stanno pubblicizzando l’unica cosa che la strada gratuita non fa.

**I link fra pagine non sopravvivono allo spostamento.** Un link da una pagina all’altra era un URL di Confluence, e dopo la conversione lo è ancora — giusto se Confluence resta, sbagliato se questa è una migrazione via da lì. Riscrivere quei link richiede una corrispondenza fra pagina e nuovo percorso del file, e quella corrispondenza non esiste finché non hai deciso la disposizione dei file. È il singolo pezzo di lavoro manuale più grosso di una migrazione vera.

**Gli allegati puntano a una sessione.** I link agli allegati in linea di Confluence puntano al suo endpoint di download, che si aspetta che tu abbia fatto l’accesso, quindi una pagina che nel tuo browser sembra completa ha immagini rotte per tutti gli altri. L’export dello spazio impacchetta i file nello zip proprio per questo; la soluzione è ripuntare i link a quelle copie locali. `--extract-media` di Pandoc ti porta a metà strada; il resto è un cerca-e-sostituisci che scrivi tu.

**Quella che era una macro adesso è un’istantanea.** Tutto ciò che era una query dal vivo — una macro di un ticket Jira, una pagina inclusa, un albero di pagine — è stato esportato come quello che rendeva quel giorno, e nessun convertitore può ripristinare un comportamento che nel file non c’è mai stato. [L’articolo guida](/blog/convert-confluence-page-to-markdown) ha la tabella macro per macro, se ti serve prima di impegnarti.

E una che riguarda il “gratis” più che la struttura: **un convertitore gratuito che carica il tuo wiki è un convertitore gratuito che adesso ha il tuo wiki.** La documentazione interna contiene nomi di clienti, architettura e resoconti di incidenti — metà delle cose che un’azienda preferirebbe non consegnare a un servizio che nessuno ha valutato. La conversione lato browser e gli strumenti locali da riga di comando sono le due forme in cui la domanda non si pone, e la differenza non compare in nessuna tabella di funzioni; la verifichi guardando il pannello di rete. [Se un convertitore online sia sicuro](/blog/is-an-online-converter-safe) vale dieci minuti prima di lasciar cadere l’export di uno spazio su qualsiasi cosa.

## Come scegliere

1. **Risolvi la questione dei permessi prima di confrontare qualunque cosa.** Senza i diritti di admin sullo spazio l’export HTML non è disponibile per te, e un’app del Marketplace richiede un admin del sito che la installi. Entrambe le strade cominciano chiedendo a qualcuno, e quale persona sia più facile da raggiungere decide il tuo percorso più di qualunque funzione.
2. **Decidi prima la forma dell’output.** Un documento da leggere o una cartella di file? Un documento è un file lasciato cadere su un convertitore che unisce. Una cartella è Pandoc o uno script, e una decisione sulla disposizione delle cartelle prima di cominciare.
3. **Conta le pagine.** Sotto le dieci, il lavoro manuale costa meno dell’automazione, e l’export in Word di una singola pagina è una risposta gratuita legittima. Oltre il centinaio, sopravvive solo una strada scriptata, perché le correzioni a mano dopo consumeranno già tutta la tua pazienza.
4. **Controlla se il contenuto può lasciare la macchina.** La documentazione interna di solito non può, cosa che esclude qualunque convertitore ospitato che carichi i file e lascia in piedi la conversione lato browser, uno strumento locale o un’app Forge che gira nel tuo ambiente Atlassian.
5. **Sul Marketplace, leggi l’intestazione e poi la scheda dei prezzi.** Free app e Try it free stanno nello stesso punto e significano cose diverse. Verifica anche la portata: un’app che esporta una pagina gratis è un prodotto diverso da una che esporta uno spazio.
6. **Converti una pagina difficile prima di convertirne quattrocento.** Scegli la pagina con più macro, la tabella più larga e più allegati, e leggi il risultato per bene. Tutto ciò che andrà storto sull’intero spazio è già visibile in quell’unico file.

## Conclusione

Il convertitore da Confluence a Markdown gratuito che funziona per quasi tutti non è uno strumento: è l’export HTML di uno spazio fatto da Confluence stesso, seguito da una conversione gratuita a tua scelta. Quella strada non costa niente, non dipende da niente che possa cambiare prezzo, e funziona allo stesso modo su Cloud, Server e Data Center. Il suo prezzo è un permesso — admin dello spazio — e dirlo chiaramente è più utile di qualunque confronto di funzioni, perché per una fetta consistente delle persone che cercano questa frase il permesso è tutto il problema e nessun convertitore lo risolve.

Da lì la scelta è facile. Un documento leggibile ricavato dallo zip dell’export di uno spazio è un file lasciato cadere su [la conversione Confluence che trovi qui](/confluence-to-markdown), gratis, con lo zip che resta sulla tua macchina quando non hai fatto l’accesso. Un repository pieno di file è Pandoc in un ciclo, oppure turndown con le regole che hai scritto tu. E sul Marketplace, gratis significa quello che dice l’intestazione della scheda e niente di più — meglio controllarlo oggi che fidarsi di un articolo, questo compreso.

## Domande frequenti

### Esiste un convertitore da Confluence a Markdown davvero gratuito?

Sì, più d’uno, ma la parte gratuita raramente è il convertitore in sé. L’export HTML di uno spazio Confluence è gratuito e richiede il permesso di admin dello spazio; convertire quell’export è gratuito con Pandoc, con uno script turndown o con un convertitore nel browser che prende lo zip direttamente. Sul Marketplace alcune app sono elencate come gratuite e altre mostrano Try it free, che è una prova.

### Posso convertire Confluence in Markdown senza essere amministratore?

Non alla scala di uno spazio. Gli export HTML, XML e CSV sono operazioni a livello di spazio che richiedono il permesso di admin dello spazio, e anche installare un’app del Marketplace richiede un amministratore. Per una singola pagina che puoi già leggere, l’export in Word più una conversione da Word a Markdown è una strada gratuita che non richiede nessun permesso in più.

### Perché l’export gratuito non include tutte le pagine?

Perché l’export di un admin di spazio contiene solo ciò che il suo account può vedere — le pagine con restrizioni sono assenti dallo zip, senza nessun avviso. Un admin del sito che esegue lo stesso export ottiene tutto, indipendentemente dalla visibilità (verificato su support.atlassian.com, 14 settembre 2026). Se una migrazione risulta incompleta, controlla prima quello.

### Un’app gratuita da Confluence a Markdown conserva la gerarchia delle pagine?

Alcune sì, ed è la cosa principale da confrontare fra di loro, perché la strada esporta-e-converti non lo fa: l’export HTML appiattisce le pagine in nomi di file generati e conserva l’albero solo in un file indice. Controlla su ogni scheda la gerarchia, gli allegati e la riscrittura dei link relativi — quelle tre cose sono ciò che distingue queste app.

### Qual è il modo gratuito più veloce di leggere uno spazio Confluence offline?

Esporta lo spazio in HTML e consegna lo zip a un convertitore che lo unisce in un unico documento con un elenco dei contenuti. Salti la decompressione, il file indice e ogni decisione sulla struttura delle cartelle, al prezzo dei confini fra le pagine, che non contano se l’obiettivo è leggere.

### Meglio Pandoc o un convertitore nel browser?

Pandoc se l’output sono tanti file con una disposizione che controlli tu, perché scala e si scripta. Un convertitore nel browser se l’output è un documento solo e lo vuoi senza installare niente. Sono entrambi gratuiti ed entrambi girano in locale; la differenza è la forma che ti serve alla fine, non la qualità della conversione.

### I nomi delle app del Marketplace qui sopra sono aggiornati?

Sono quello che mostravano le schede il 14 settembre 2026, e questa categoria cambia più in fretta di quasi tutte le altre. I fornitori arrivano e se ne vanno, i piani gratuiti compaiono e chiudono, e le schede dei prezzi si muovono indipendentemente dalle intestazioni. Prendi i nomi come punto di partenza e leggi la scheda attuale prima di decidere qualunque cosa.
