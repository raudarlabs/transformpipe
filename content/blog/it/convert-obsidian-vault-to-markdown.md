---
title: "Convertire un vault Obsidian in Markdown: wikilink, embed e cosa resta"
description: Un vault Obsidian è già fatto di file Markdown — cosa sistema davvero portarlo al Markdown standard, dai wikilink agli embed, dai callout a Dataview
date: 2026-09-14
tag: Conversione
keywords: convertire vault obsidian in markdown, wikilink obsidian markdown, esportare vault obsidian, obsidian markdown standard, rimuovere wikilink obsidian, dataview obsidian conversione
---

Un vault Obsidian è una cartella di file `.md` che sta sul disco, il che fa sembrare “convertirlo in Markdown” un controsenso — è già Markdown. Il problema sta nella parola “già”: Obsidian scrive un proprio dialetto sopra il nucleo CommonMark, e quattro delle sue costruzioni — wikilink, embed, riferimenti a blocco e callout — vengono letti come sintassi rotta o semplice testo da qualunque cosa non sia Obsidian stesso. Non c’è niente da esportare, perché non c’è un pulsante di export né una conversione di formato nel senso comune. C’è una riscrittura, e deve avvenire prima che il vault lasci Obsidian per sempre.

### In breve

Il vault non ha bisogno di nessun passaggio di export — i file sono già sul disco — ma quattro convenzioni proprie di Obsidian non sopravvivono al contatto con un parser Markdown standard: `[[wikilink]]`, `![[embed]]`, i riferimenti a blocco `[[Nota#^id-blocco]]` e i callout `> [!note]`. Un `[[wikilink]]` non è un link a niente fuori da Obsidian finché non viene riscritto come un vero percorso relativo; un embed non ha nessun equivalente di transclusione nel Markdown standard, e diventa una copia in linea del contenuto oppure un semplice link; un riferimento a blocco non ha letteralmente niente a cui puntare una volta che l’id a livello di blocco scompare; e un callout è una citazione che porta un marcatore che la maggior parte dei renderer mostra come testo semplice. Disattiva “Use \[\[Wikilinks\]\]” sotto Impostazioni, File e link, così i nuovi link vengono scritti come Markdown standard da quel momento in poi — l’impostazione riguarda solo i link scritti dopo che l’hai cambiata, quindi un vault già avviato ha comunque bisogno che quelli esistenti vengano riscritti. Per un vault intero trasformato in un unico documento con i wikilink già risolti, [la conversione da Obsidian a Markdown di TransformPipe](/obsidian-to-markdown) legge direttamente un vault compresso in zip e fa la riscrittura nello stesso passaggio.

Quello che questo non sistema, perché niente può sistemarlo: una query Dataview produceva una tabella solo dentro Obsidian, al momento della visualizzazione, da un plugin — il testo della query si converte bene, in un blocco di codice, ma la tabella che generava semplicemente non c’è per un lettore fuori da Obsidian.

## Perché un vault già in Markdown ha comunque bisogno di essere convertito

CommonMark e GitHub Flavored Markdown, i due dialetti che quasi ogni strumento fuori da Obsidian si aspetta, non hanno nessun concetto di wikilink, embed, riferimento a blocco o blocco callout. Obsidian ha aggiunto tutti e quattro come proprie estensioni sopra la sintassi standard, perché sono genuinamente utili dentro una base di conoscenza personale che sa già di ogni file al suo interno — un wikilink può risolversi in una nota per titolo senza che tu specifichi un percorso, perché Obsidian indicizza tutto il vault. Nel momento in cui un file lascia quell’ambiente indicizzato — incollato in un README di GitHub, aperto in un editor di testo semplice, dato in pasto a un generatore di siti statici — l’indice sparisce e le scorciatoie smettono di risolversi in qualcosa.

## Confronto rapido: cosa va riscritto, e chi fa la riscrittura

| Costrutto di Obsidian | Cosa vede un parser standard | Come si sistema |
| --- | --- | --- |
| `[[Nota]]` | Testo letterale: due parentesi quadre aperte, la parola Nota, due chiuse | Riscrivi come `[Nota](nota.md)`, risolvendo il percorso relativo al vault |
| `[[Nota\|Testo mostrato]]` | Lo stesso, letterale | Riscrivi come `[Testo mostrato](nota.md)` |
| `![[Nota]]` (embed di nota) | Testo letterale | Inserisci in linea il contenuto della nota, oppure un semplice link — la transclusione non ha un equivalente standard |
| `![[immagine.png]]` (embed di file) | Testo letterale | Riscrivi come `![](immagine.png)`, sintassi standard per le immagini |
| `[[Nota#Titolo]]` | Testo letterale | Riscrivi come `nota.md#titolo`, verificando la regola di slug del renderer di destinazione |
| `[[Nota#^id-blocco]]` | Testo letterale | Nessuna destinazione a cui collegarsi fuori da Obsidian — inserisci in linea il testo citato |
| `^id-blocco` a fine riga | Un accento circonflesso isolato e una parola, stampati | Elimina una volta che niente lo referenzia più |
| Callout `> [!note]` | Una citazione con il testo letterale `[!note]` sulla prima riga | Togli il marcatore, mantieni la citazione, annota il tipo in un altro modo se conta |
| Un blocco con delimitatore ` ```dataview ` | Un blocco di codice che mostra il testo della query | Niente da convertire — la tabella non era mai nel file |
| `%%commento%%` | Il testo stesso, visibile, perché la sintassi dei commenti in linea di Obsidian non è standard | Elimina prima di convertire |
| Frontmatter YAML (blocco `---`) | Di solito va bene, ma un parser che non lo riconosce mostra il `---` iniziale come una linea orizzontale | Toglilo, o convertilo nella convenzione di frontmatter del formato di destinazione |

## Disattivare i wikilink, e cosa sistema e cosa no

L’impostazione sta sotto Impostazioni, File e link, “Use \[\[Wikilinks\]\]” — disattivala e Obsidian scrive link Markdown standard, `[testo](percorso)`, per ogni link creato da quel momento in poi (verificato su obsidian.md e sulla documentazione delle impostazioni di Obsidian, 14 settembre 2026). Il completamento automatico funziona esattamente come prima — scrivi `[[`, scegli una nota dai suggerimenti — l’unica cosa che cambia è cosa viene scritto sul disco una volta confermata la scelta.

| Pro | Contro |
| --- | --- |
| Costo di migrazione zero per i link scritti dopo il cambiamento | Ogni link scritto prima del cambiamento resta intoccato — un vault già avviato ha comunque bisogno di un passaggio di riscrittura a parte |
| Rende il vault subito più interoperabile per il futuro | Embed, riferimenti a blocco e callout non sono toccati — questa impostazione riguarda solo i link semplici |
| Nessun plugin, nessun export, nessuna nuova dipendenza | Il collegamento automatico per titolo presume ancora che il file esista al percorso che Obsidian aveva risolto quando il link è stato creato |

**Per chi è?** Per chiunque abbia intenzione di continuare a scrivere in Obsidian rendendo il vault progressivamente più portabile. Non è uno strumento di migrazione da solo — impedisce al problema di crescere, e l’arretrato di wikilink già esistenti ha comunque bisogno di un passaggio.

## Riscrivere wikilink ed embed in un vault già esistente

Per un vault che ha già mesi o anni di wikilink dentro, la soluzione pratica è uno script: percorri ogni file `.md`, trova i pattern di wikilink ed embed, risolvi ogni destinazione contro l’indice dei file del vault, e riscrivi sul posto.

```text
WIKILINK = /!?\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/

for file in vault:
    text = read(file)
    text = replace_all(text, WIKILINK, (whole, target, shown) => {
        path = resolve_in_vault(target)      # match by filename, vault-wide
        text_shown = shown ?? target
        if whole starts with "!" and target looks like an image or attachment:
            return "![](" + path + ")"
        if path exists:
            return "[" + text_shown + "](" + path + ")"
        return text_shown                     # nothing to link to; keep the words
    })
    write(file, text)
```

Il dettaglio che fa cadere un primo tentativo: `resolve_in_vault` deve cercare in tutto il vault per nome di file, non solo nella cartella corrente, perché la risoluzione dei link di Obsidian fa esattamente questo — un wikilink scritto come `[[Meeting Notes]]` da qualunque nota nel vault trova un file chiamato `Meeting Notes.md` ovunque si trovi, e uno script che controlla solo la cartella della nota che collega produrrà in silenzio link morti per qualunque cosa non stia allo stesso posto.

**Una nota sull’ambiguità.** Due file con lo stesso nome in cartelle diverse sono indistinguibili per un semplice link `[[Meeting Notes]]` — Obsidian risolve verso quello che trova prima secondo una propria regola interna, e uno script di riscrittura eredita la stessa ambiguità. Se un vault ha nomi di file duplicati fra le cartelle, risolvi quel problema prima di fidarti di qualunque riscrittura automatica dei link fra di essi.

## Callout, Dataview e l’ecosistema dei plugin in generale

Un callout — `> [!note]`, `> [!warning]`, e Obsidian ne include circa una dozzina di tipi — è una citazione con un marcatore tipizzato tra parentesi sulla prima riga. Un renderer Markdown standard mostra il marcatore come testo letterale invece di stilizzare il blocco, quindi la soluzione è togliere il marcatore (perdendo la distinzione visiva fra una nota e un avviso) oppure mappare ogni tipo su una convenzione propria del formato di destinazione, se la destinazione supporta callout stilizzati.

Dataview è il caso che si fraintende più spesso. Una query Dataview è scritta come blocco di codice delimitato con `dataview` come stringa informativa — quel blocco si converte perfettamente, in un normale blocco di codice che mostra il testo della query. Quello che non si converte è la tabella che Dataview generava, perché quella tabella non è mai stata scritta nel file: il plugin Dataview di Obsidian esegue la query e mostra il risultato al momento della visualizzazione, ogni volta che la nota viene aperta, e il file sorgente ha sempre contenuto solo la domanda, mai la risposta.

Vale la stessa logica per qualunque plugin che mostri qualcosa che il file stesso non contiene: una vista a mappa mentale, una vista a grafo, una canvas. Se il valore di una nota dipende da come un plugin la mostra invece che dal suo testo grezzo, convertire solo il testo darà sempre la sensazione di aver perso qualcosa, perché è davvero così — quella visualizzazione non è mai stata salvata.

## Gli alias: l’altro modo in cui la destinazione di un wikilink è ambigua

Il frontmatter YAML di una nota può portare una lista `aliases`, e Obsidian risolve un `[[wikilink]]` verso uno qualunque degli alias di una nota di destinazione con la stessa disponibilità con cui lo risolve verso il suo vero nome di file. È comodo dentro il vault — rinomini una nota senza rompere ogni link al suo vecchio titolo, purché il vecchio titolo resti come alias — ed è un’altra cosa di cui uno script di riscrittura deve tenere conto: `resolve_in_vault` deve controllare anche il frontmatter `aliases` di ogni file, oltre al suo nome, o un link scritto contro un alias si risolve nel nulla e ricade su testo semplice, senza link.

## Un plugin della community, se preferisci non scrivere lo script

La directory dei plugin di Obsidian stessa include plugin di export costruiti dalla community — [obsidian-markdown-export-plugin](https://github.com/bingryan/obsidian-markdown-export-plugin) è uno di questi, esporta una nota o un’intera cartella come pacchetto con le immagini collegate incluse e i link interni riscritti per risolversi fuori dal vault. È un’opzione reale per chi preferisce installare un plugin invece di scrivere il resolver descritto sopra, al costo di aggiungere un plugin della community al proprio vault e fidarsi della sua logica di riscrittura invece di una che puoi leggere riga per riga.

| Pro | Contro |
| --- | --- |
| Nessuno script da scrivere o manutenere | Una dipendenza dal ritmo di rilascio e dalle scelte di un plugin della community |
| Include gli allegati immagine insieme al Markdown esportato | Il comportamento per riferimenti a blocco, callout e Dataview è una decisione del plugin, non tua |
| Funziona dall’interno dell’interfaccia di Obsidian, nessuno strumento separato | Controlla la licenza e lo stato di manutenzione attuali del plugin prima di affidargli qualcosa che non puoi rifare a mano |

**Per chi è?** Per chi esporta poche note alla volta dall’interno di Obsidian, invece di scriptare la migrazione di un intero vault o affidarsi a un’unione basata su browser.

## Rendere un vault portabile prima che ti serva

Quattro abitudini mantengono un vault convertibile senza cambiare come scrivi ogni giorno:

- **Disattiva i wikilink** così i nuovi link sono standard da qui in avanti.
- **Tieni gli allegati dentro la cartella del vault**, non riferiti da fuori, così i percorsi relativi restano validi quando la cartella viene copiata o compressa.
- **Preferisci un link a un embed** dove entrambi andrebbero bene — un link degrada in modo pulito in un link; un embed degrada in una copia duplicata del contenuto o in una semplice coppia di parentesi, secondo il convertitore.
- **Tratta i riferimenti a blocco come un aiuto personale alla navigazione**, non come un modo di costruire un ragionamento a partire da pezzi sparsi, perché un riferimento a blocco non ha nessun percorso di ripiego in Markdown standard — fuori da Obsidian non è un link rotto, è niente.

## Caricare il vault direttamente, unito in un unico documento

La riscrittura descritta sopra vale la pena se il vault resta una cartella di file separati. Se la destinazione è sempre stata un documento solo — una consegna da fare, un archivio delle note di un progetto — [la conversione da Obsidian a Markdown di TransformPipe](/obsidian-to-markdown) salta la riscrittura file per file: comprimi la cartella del vault e caricala, e ogni nota diventa una sezione di un unico documento, nel suo ordine originale, con un indice generato. Wikilink, alias e ancore alle intestazioni si risolvono nelle parole che mostravano invece che in un percorso, per la stessa ragione per cui un link fra pagine in un export unito di Notion o Confluence mantiene le sue parole invece del suo indirizzo — una volta che ogni nota è una sezione dello stesso documento, non c’è più nessun posto dove un link possa puntare.

| Pro | Contro |
| --- | --- |
| Nessuno script, nessun indice di nomi di file da costruire a livello di vault | Produce un documento solo — la forma sbagliata se le note devono restare file separati con un proprio percorso |
| Il frontmatter viene rimosso in automatico, e un embed `![[immagine.png]]` diventa l’immagine stessa, portata dentro il documento | Il tetto è di due megabyte di immagini per documento; un allegato che non è un’immagine — un PDF, una nota audio — resta comunque testo in corsivo |
| Gira nel browser; il vault non viene mai caricato quando non hai fatto l’accesso | Le tabelle Dataview e altri contenuti generati da plugin sono assenti, come su qualunque altra strada, perché il file sorgente non li aveva mai |

**Prezzo:** gratis, gira in locale.

**Per chi è?** Per un vault, o una sua parte, che viene consegnato o archiviato come un unico documento leggibile invece di essere mantenuto come un insieme vivo di file collegati separatamente.

## Come scegliere

1. **Decidi se il vault resta una cartella di file o diventa un documento solo.** File separati con link relativi funzionanti vogliono lo script di riscrittura sul posto. Un documento solo vuole la strada dell’unione — risolve lo stesso problema dei wikilink in un modo diverso, togliendo il bisogno di una destinazione separata da risolvere.
2. **Controlla i blocchi Dataview e altri contenuti generati da plugin prima di convertire qualunque cosa.** Si convertono come testo di query, correttamente, e la tabella o vista che generavano non è recuperabile dal file — annota dove quelle tabelle contavano mentre puoi ancora vederle visualizzate.
3. **Fai attenzione ai nomi di file duplicati tra cartelle.** Un wikilink verso un nome non univoco è ambiguo già dentro Obsidian; uno script di riscrittura eredita quell’ambiguità invece di risolverla per te.
4. **Disattiva i wikilink per il futuro, indipendentemente dalla strada scelta per l’arretrato.** Non costa niente e impedisce al problema di crescere mentre gestisci quello che esiste già.

Se la domanda è quale strumento piuttosto che quale strada — ogni opzione qui è gratuita, e differiscono per costo di configurazione e per quanto controllo ti danno sui casi ambigui — [il confronto fra i convertitori Obsidian gratuiti](/blog/free-obsidian-to-markdown-converter) è la risposta più breve.

## Conclusione

Un vault Obsidian non ha bisogno tanto di essere esportato quanto di essere tradotto: i file sono già Markdown, e il lavoro sta interamente nei quattro punti in cui Obsidian ha scritto una propria sintassi sopra — wikilink, embed, riferimenti a blocco e callout. Riscriverli sul posto mantiene il vault come una cartella di file separati che funzionano; unire tutto il vault in un documento solo risolve lo stesso problema dei wikilink togliendo del tutto il bisogno di una destinazione separata da risolvere. In entrambi i casi, niente recupera una tabella Dataview o la vista di un plugin, perché nessuna delle due è mai stata salvata nel file — controllalo mentre il vault è ancora aperto in Obsidian, non dopo. [Come si confrontano Notion e Confluence](/blog/markdown-from-notion-obsidian-and-confluence) sullo stesso problema di export-e-poi-riparazione vale la pena leggerlo se Obsidian non è l’unica fonte in gioco.

## Domande frequenti

### Obsidian ha una funzione di export verso Markdown?

No, e non gliene serve una — un vault è già una cartella di file `.md` sul disco. Quello che va convertito è la sintassi propria di Obsidian sopra il Markdown standard: wikilink, embed, riferimenti a blocco e callout, nessuno dei quali un parser standard legge correttamente.

### Come convertire i `[[wikilink]]` di Obsidian in link Markdown standard?

Disattiva “Use \[\[Wikilinks\]\]” sotto Impostazioni, File e link, per tutto ciò che scrivi da quel momento in poi. Per i link già presenti nel vault, uno script deve trovare ogni `[[wikilink]]`, risolvere il nome di file di destinazione contro tutto il vault, e riscriverlo come un normale link `[testo](percorso)`.

### Cosa succede alle query Dataview quando converto un vault?

La query stessa si converte bene, come blocco di codice delimitato che mostra il testo della query. La tabella che generava non si converte, perché non è mai stata salvata nel file — Dataview la genera al momento della visualizzazione, dentro Obsidian, tramite un plugin.

### Posso mantenere i callout di Obsidian quando converto verso Markdown standard?

Non come callout stilizzati, perché `> [!note]` è sintassi propria di Obsidian. La soluzione sicura è togliere il marcatore tra parentesi e mantenere la citazione; se il tipo conta, annotalo nel testo stesso, perché un renderer standard non stilizzerà da sé tipi di callout diversi in modo diverso.

### Cosa diventa un embed come `![[Nota]]` fuori da Obsidian?

Testo letterale — due parentesi quadre precedute dal punto esclamativo, il nome della nota, due parentesi di chiusura — a meno che qualcosa lo riscriva. Non esiste una sintassi standard di transclusione in Markdown, quindi le soluzioni oneste sono inserire in linea il contenuto della nota richiamata, o convertire l’embed in un semplice link, secondo se il formato di destinazione ha un equivalente qualunque.

### Posso convertire un vault senza caricarlo da nessuna parte?

Sì, se il convertitore gira in locale nel tuo browser invece di inviare i file a un server — vale la pena verificarlo per un vault con qualcosa di sensibile dentro, guardando il pannello di rete durante la conversione e confermando che non esce niente.

### Il mio wikilink punta al vecchio titolo di una nota. Perché funziona ancora in Obsidian ma non dopo la conversione?

Perché il vecchio titolo è probabilmente conservato nel frontmatter `aliases` di quella nota, e Obsidian risolve i wikilink contro gli alias con la stessa disponibilità con cui li risolve contro i nomi di file reali. Uno script di riscrittura o un convertitore deve controllare la stessa lista di alias, o un link scritto contro il vecchio titolo di una nota rinominata si risolve nel nulla una volta fuori da Obsidian.

### Devo convertire i riferimenti a blocco prima di condividere un vault fuori da Obsidian?

Sì, nel senso che niente altro li renderà in modo utile — `[[Nota#^id-blocco]]` non ha nessun equivalente fuori da Obsidian. L’unica soluzione onesta è inserire in linea il testo citato esattamente dove stava il riferimento, perché non c’è nessuna destinazione esterna a cui possa puntare.
