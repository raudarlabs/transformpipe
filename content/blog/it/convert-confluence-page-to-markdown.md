---
title: "Convertire una pagina Confluence in Markdown: ogni export, e l'HTML che c'è sotto"
description: "Come portare una pagina o uno spazio Confluence in Markdown, perché non esiste un export nativo, cosa conserva l'export HTML e cosa perde ogni macro"
date: 2026-09-14
tag: Conversione
keywords: convertire confluence in markdown, esportare confluence in markdown, confluence html in markdown, export pagina confluence, export spazio confluence, confluence markdown online
---

Confluence ha un pulsante Export, diversi formati dietro a quel pulsante, e nessuno di quelli è Markdown. Non è una svista: una pagina Confluence non è salvata come Markdown, né come niente che ci si avvicini. È salvata nel formato di archiviazione proprio di Confluence — una marcatura basata su XHTML con due namespace personalizzati sovrapposti per le macro e i riferimenti alle risorse — e ogni formato di export che Confluence offre è una resa di quel formato di archiviazione in qualcosa d'altro. Arrivare a Markdown vuol dire scegliere una di quelle rese e convertirla una seconda volta.

La conseguenza pratica è che "convertire Confluence in Markdown" è sempre un lavoro in due passaggi: esportare in un formato che conserva abbastanza struttura da valere la conversione, poi far girare una vera conversione da HTML a Markdown su quello che è uscito. Saltare dritti a Word o PDF butta via la struttura prima che il secondo passaggio abbia qualcosa su cui lavorare.

### In breve

**L'HTML è il solo export che vale la pena convertire.** Il formato di archiviazione di Confluence è basato su XHTML, quindi l'export HTML di uno spazio conserva intestazioni, elenchi, tabelle e link come marcatura vera che un convertitore può leggere — gli export in Word e PDF dello stesso contenuto si comprimono in una formattazione che si recupera peggio. L'export di uno spazio richiede il permesso di amministratore dello spazio ed esporta solo ciò che il tuo account può già vedere, a meno che non lo lanci un amministratore del sito, nel qual caso esporta tutto indipendentemente dalla visibilità (verificato su support.atlassian.com, il 14 settembre 2026). Qualunque cosa esca, convertila con [una conversione da HTML a Markdown](/html-to-markdown) invece che con uno script che spoglia i tag con espressioni regolari — l'HTML di Confluence è pieno di attributi in stile `mso` e di `div` involucro delle macro che uno spoliatore ingenuo lascia lì come rumore visibile. Per uno spazio intero unito in un unico documento leggibile, [la conversione da Confluence a Markdown di TransformPipe](/confluence-to-markdown) prende direttamente lo zip dell'export HTML e produce un documento solo con un indice, senza dover girare a mano tra le cartelle.

Quello che nessuna delle strade qui sotto recupera: una macro che eseguiva una query dal vivo — una macro di problemi Jira, una pagina inclusa — torna com'era al momento dell'export, non come query. I commenti alla pagina non arrivano mai in un export HTML o PDF. E le ancore interne alla pagina cambiano, perché Confluence genera gli id delle intestazioni includendo il titolo della pagina, quindi un link scritto contro il vecchio formato di id smette di funzionare nel momento in cui un renderer diverso scrive gli id a modo suo.

## Perché non esiste un export nativo in Markdown

Il contenuto di una pagina Confluence vive in quello che Atlassian chiama formato di archiviazione: tecnicamente XML più che XHTML in senso stretto, con gli elementi propri di Confluence in un namespace `ac:` e i riferimenti alle risorse — allegati, link fra pagine — in un namespace `ri:`. Una macro è un `ac:structured-macro` con un attributo che ne indica il nome; un'immagine è un `ac:image` che avvolge un `ri:attachment`; un link a un'altra pagina è un `ac:link` che avvolge un `ri:page`. Niente di tutto questo ha un equivalente in Markdown, perché Markdown non ha alcun concetto di macro — una macro è un pezzo di comportamento con un nome e dei parametri, e l'intero repertorio di Markdown è formattazione statica del testo.

Così il menu di export di Confluence offre invece rese del formato di archiviazione: Word, PDF, HTML, XML e CSV per uno spazio. Ognuna è ciò che il formato di archiviazione appare una volta reso, alla fedeltà che quel formato di export permette, e Markdown si raggiunge convertendo una di quelle rese una seconda volta.

## Confronto rapido: i formati di export, e cosa sopravvive a ognuno

| Export | Ambito | Permesso richiesto | Cosa esce | Vale convertirlo in Markdown? |
| --- | --- | --- | --- | --- |
| Export in Word | Una pagina | Chiunque abbia accesso alla pagina | Un `.docx` che molti altri editor rendono in modo imperfetto | Solo tramite una conversione da Word a Markdown; la struttura sopravvive, le intestazioni finte no |
| Export in PDF | Una pagina | Chiunque abbia accesso alla pagina | Una pagina resa, statica; i commenti non sono mai inclusi | No — una pagina resa non ha più struttura da estrarre |
| Export dello spazio, HTML | Intero spazio | Amministratore dello spazio | Zip di file HTML resi, uno per pagina, più gli allegati | Sì — è questa la strada |
| Export dello spazio, XML | Intero spazio | Amministratore dello spazio | L'XML nel formato di archiviazione proprio di Confluence, pensato per essere reimportato in Confluence | Non direttamente — è costruito per Confluence, non per un convertitore |
| Export dello spazio, CSV | Intero spazio | Amministratore dello spazio | Il contenuto come righe CSV, allegati e commenti inclusi di default | No — appiattisce una struttura che una conversione in Markdown richiede |
| Un'app del Marketplace | Pagina, albero o spazio, secondo l'app | Quello che l'app richiede | Markdown direttamente, nella forma propria dell'app | A volte — controlla la scheda attuale; esistono diverse opzioni gratuite |

Ogni affermazione su ambito e permessi in quella tabella viene dalla documentazione ufficiale di Atlassian: HTML, XML e CSV esistono solo come export a livello di spazio e richiedono il permesso di amministratore dello spazio, e "solo il contenuto visibile a te verrà esportato" quando è un amministratore dello spazio a lanciare il proprio export — un amministratore del sito che lancia lo stesso export CSV o XML ottiene tutto, restrizioni di visibilità comprese (verificato su support.atlassian.com, il 14 settembre 2026). I post del blog restano fuori dall'export PDF e HTML di uno spazio, e i commenti non sono mai inclusi in un export PDF, secondo la stessa pagina.

## L'export dello spazio in HTML — la strada che conserva la struttura

Dalla barra laterale dello spazio: Altre azioni, Impostazioni spazio, Generale, Esporta spazio, scegli HTML. Quello che torna è uno zip: un file HTML per pagina, una cartella di allegati e un file indice che elenca le pagine.

| Pro | Contro |
| --- | --- |
| Marcatura vera — intestazioni, elenchi, tabelle e link sopravvivono come elementi, non come pixel resi | Richiede il permesso di amministratore dello spazio; chi scrive la pagina senza averlo non può lanciare questo export da solo |
| Gli allegati arrivano confezionati insieme alle pagine che li usano | La gerarchia delle pagine vive solo nel file indice — i nomi dei file sono piatti, quindi le cartelle vanno ricostruite a partire da quello se le vuoi |
| Funziona offline una volta scaricato — nessuna dipendenza continua dal fatto che Confluence sia raggiungibile | Le macro vengono rese in qualunque HTML abbiano prodotto il giorno dell'export, non in qualcosa che Markdown capisce |

**Prezzo:** gratis — l'export fa parte di Confluence stesso, e anche ogni convertitore che valga la pena far girare dall'altra parte è gratuito.

**Dettagli tecnici.** I nomi dei file esportati sono generati dalla macchina e non leggibili, quindi capire quale file corrisponde a quale pagina significa leggere l'indice invece dell'elenco della cartella. Le ancore delle intestazioni sono id generati da Confluence stesso, che includono il titolo della pagina come parte della stringa dell'id — un link scritto contro `#PageTitle-Heading` si rompe nel momento in cui un altro convertitore da HTML a Markdown genera invece uno slug semplice come `#heading`, perché i due schemi di id non coincidono.

**Per chi è?** Per chiunque converta più di un paio di pagine, e in particolare per chi ha bisogno che il risultato sia più di un'istantanea — l'HTML è il solo formato di export denso abbastanza da permettere a una conversione vera di recuperare tabelle, link ed elenchi invece di un paragrafo di testo incollato insieme.

## Convertire l'HTML: un vero parser, non un'espressione regolare

Una volta uscito l'HTML, il secondo passaggio è una normale conversione da HTML a Markdown — [lo stesso lavoro](/html-to-markdown) che convertire una qualunque pagina web salvata — con una particolarità tipica di Confluence: la marcatura è densa di stili inline con il prefisso `mso-` e di `div` involucro delle macro, che uno script di spoliazione dei tag ingenuo lascia come spazzatura visibile nell'output. Un vero parser HTML che costruisce un albero e lo percorre, invece di una sequenza di sostituzioni di stringhe, è la differenza tra un Markdown pulito e un paragrafo pieno di nomi di classe randagi.

| In cosa era resa la macro | Cosa vede un convertitore | Dopo la conversione |
| --- | --- | --- |
| Pannello info, nota, avviso, suggerimento | Un `div` con un nome di classe e un'immagine icona | Un paragrafo semplice — la convenzione della citazione va aggiunta a mano |
| Macro blocco di codice | Un elemento `pre`, spesso con span di syntax highlighting | Un blocco di codice con fence, di solito senza l'attributo di linguaggio |
| Macro indice (table of contents) | Un elenco reso di link ad ancora | Un elenco di link ad ancore che potrebbero non risolversi più dopo la conversione |
| Macro albero pagine o children-display | Un elenco reso di link verso il sito Confluence vivo | Link che puntano a Confluence, non ai file convertiti |
| Macro excerpt o include | Il testo incluso, già inserito al momento dell'export | Testo duplicato, una volta per ogni pagina che lo includeva — nessun modo per distinguerlo dal contenuto originale |
| Macro problema Jira o filtro | Una tabella istantanea, oppure un link semplice, secondo come la macro stessa rendeva | Una tabella congelata al giorno dell'export, o un link morto se era resa come riferimento |
| Macro expand | Il contenuto, già espanso nell'export statico | Contenuto semplice — il comportamento di apri/chiudi non esiste in Markdown |
| Macro allegati | Un elenco di link a `/download/attachments/...` | Link che richiedono una sessione Confluence attiva per risolversi |

La riga degli allegati è quella da controllare prima di pubblicare qualcosa. Quei link puntano all'endpoint di download proprio di Confluence, che si aspetta che tu abbia fatto l'accesso — una pagina che sembra completa mentre sei loggato in Confluence ha caselle immagine rotte per chiunque non lo sia, e un export di spazio confeziona i file allegati veri dentro lo zip esattamente perché il convertitore possa riscrivere quei link verso la copia locale invece di lasciarli puntati a un URL protetto da sessione.

**Come è fatto davvero l'HTML grezzo.** Un pannello nota non è un `<blockquote>` — è più vicino a questo, ripulito degli attributi che uno spoliatore ingenuo lascerebbe:

```html
<div class="confluence-information-macro confluence-information-macro-note">
  <span class="aui-icon aui-icon-small aui-iconfont-warning"></span>
  <div class="confluence-information-macro-body">
    <p>Deploys are frozen after Thursday.</p>
  </div>
</div>
```

Un'espressione regolare che spoglia i tag su quel codice produce un paragrafo più una riga vuota randagia dove stava lo `span` dell'icona. Un vero parser riconosce la classe del `div` involucro, scarta del tutto l'elemento icona e tiene solo il testo — che è tutto l'argomento a favore di un convertitore che costruisce un albero invece di uno che cancella parentesi angolari.

### Le ancore delle intestazioni: perché un link interno si rompe anche quando la pagina non si rompe

Confluence genera l'id di un'intestazione combinando il titolo della pagina e il testo dell'intestazione, così due pagine con un'intestazione scritta in modo identico non collidono, e un link interno alla pagina è scritto contro quell'id completo. Un convertitore che genera gli id nel modo comune — testo dell'intestazione in minuscolo, spazi trasformati in trattini, niente altro — produce un id diverso per la stessa intestazione, quindi qualunque link scritto come `#PageTitle-SectionName` smette di risolversi anche se la sezione stessa si è convertita perfettamente. Il rimedio è meccanico, una volta che sai dove guardare: dopo la conversione, riscrivi i link interni contro il nuovo id generato dall'intestazione, invece di assumere che il vecchio sia sopravvissuto.

## Caricare lo zip dell'export direttamente, unito in un unico documento

Per uno spazio dove la destinazione era sempre stata un unico documento leggibile invece di una cartella di file con una struttura ad albero funzionante, [la conversione da Confluence a Markdown di TransformPipe](/confluence-to-markdown) prende lo zip dell'export HTML dello spazio esattamente com'è uscito da Confluence, convertendo l'HTML di ogni pagina con lo stesso convertitore che sta dietro alla pagina di conversione da HTML a Markdown, e unisce ogni pagina in ordine in un solo documento con un indice generato automaticamente.

| Pro | Contro |
| --- | --- |
| Nessuna cartella da esplorare a mano, nessun file indice da leggere | Produce un documento solo — non la forma giusta se ogni pagina deve restare un file proprio con un URL proprio |
| Ogni pagina in ordine, con un indice costruito per te, e un allegato che è un’immagine portato dentro il documento invece di restare puntato a `/download/attachments/` | Non ricostruisce l'albero delle pagine — nessuno lo fa senza decidere dove vivranno i file — e un allegato che non è un’immagine mantiene il link che aveva |
| Gira nel browser; lo zip non viene caricato quando non hai fatto l'accesso | Le perdite delle macro sono identiche a qualunque altra strada da HTML a Markdown, perché l'HTML di partenza è lo stesso in ogni caso |

**Prezzo:** gratis, gira in locale.

**Per chi è?** Per uno spazio in via di archiviazione, per un wiki consegnato come documento unico, o per qualunque caso in cui chi legge il risultato tiene più al contenuto in ordine che al fatto che ogni pagina conservi un URL proprio.

## Un'app del Marketplace, se un export diretto in Markdown si adatta meglio al tuo flusso

Diverse app sull'Atlassian Marketplace esportano una pagina, un albero di pagine o uno spazio intero direttamente in Markdown, con opzioni gratuite disponibili accanto a quelle a pagamento (verificato su marketplace.atlassian.com, il 14 settembre 2026) — la categoria esiste e cambia abbastanza spesso che nominare un'app specifica qui sarebbe superato in un anno, il che è esattamente il motivo per cui la strada export-poi-convertire descritta sopra vale la pena di conoscerla comunque: non dipende da niente oltre all'export integrato di Confluence e a un convertitore, nessuno dei due un abbonamento che possa cambiare prezzo o essere ritirato da una scheda del Marketplace.

| Pro | Contro |
| --- | --- |
| Markdown diretto, senza un passaggio separato di conversione dall'HTML | Aggiunge un'app del Marketplace al sito, che qualcuno deve approvare e mantenere |
| Alcune conservano la gerarchia delle cartelle nell'output automaticamente | I piani gratuiti e le funzioni cambiano; controlla la scheda attuale invece di fidarti di una recensione vecchia |
| Può essere più rapida per un export singolo, una volta sola | Un piano a pagamento serve spesso per uno spazio intero invece che per una sola pagina |

**Per chi è?** Per una squadra che già installa app del Marketplace senza problemi e vuole Markdown in un solo passaggio, invece di una pipeline export-e-conversione che deve mantenere da sola.

## La differenza tra Confluence Server, Data Center e Cloud

Tutto quello che riguarda la finestra di export sopra descrive Confluence Cloud. Le istanze Server e Data Center hanno lo stesso formato di archiviazione di base e la stessa categoria di export HTML dello spazio, ma il percorso esatto nel menu e il modello di permessi esatto cambiano a seconda della versione, e — dato che su queste istanze non esiste di default un equivalente scriptato dell'Automation di Jira per spingere l'export — ricorrere a un'app del Marketplace (ScriptRunner è una scelta comune proprio su Server/Data Center) è più spesso la strada pratica per qualunque cosa oltre la finestra di export integrata. Se la tua istanza è Server o Data Center, controlla le opzioni di export nella tua console di amministrazione invece di assumere che il percorso di menu di Cloud valga senza modifiche.

## Come scegliere

1. **Verifica che l'export HTML sia disponibile per te prima di pianificare tutto attorno ad esso.** Richiede il permesso di amministratore dello spazio; se non lo hai, il primo passo pratico è chiederlo a chi lo ha, non cercare un modo per aggirarlo.
2. **Decidi se la destinazione sono file separati o un documento unico.** File separati con URL propri vogliono la pipeline export-poi-convertire, mantenuta un file per pagina. Un documento unico vuole la strada dell'unione.
3. **Controlla le macro che erano query dal vivo prima di convertire qualcosa.** Una macro di problemi Jira o una macro albero pagine si rende come istantanea; se la versione dal vivo conta, annotala separatamente prima che l'export ne catturi una copia congelata.
4. **Leggi una pagina convertita per intero prima di fidarti del resto.** Link agli allegati, ancore delle intestazioni e `div` resi dalle macro sono le tre cose che sembrano a posto in un diff e sbagliate quando le leggi davvero.

Se l'ostacolo si rivela essere il costo più che la meccanica — quali schede del Marketplace sono davvero gratuite invece che gratuite solo per provarle, e quali strade richiedono un amministratore — [il confronto tra i convertitori gratuiti da Confluence](/blog/free-confluence-to-markdown-converter) risponde separatamente a quella domanda.

## Conclusione

Confluence in Markdown è una conversione in due passaggi che porta il nome di un export in uno solo: scegli l'output HTML, perché è il solo denso abbastanza da convertirsi bene, poi fai girare un vero passaggio da HTML a Markdown invece di uno script di sostituzioni di stringhe. Quello che sopravvive è tutto ciò che il formato di archiviazione esprimeva come struttura statica — intestazioni, elenchi, tabelle, link; quello che non sopravvive è tutto ciò che era comportamento dal vivo di una macro invece del suo output reso il giorno in cui hai fatto l'export. Per uno spazio intero destinato a diventare un documento solo, salta l'esplorazione delle cartelle e consegna lo zip dell'export a un convertitore che lo unisce direttamente. [Come si comportano Notion e Obsidian](/blog/markdown-from-notion-obsidian-and-confluence) sullo stesso problema export-poi-riparazione vale la pena leggerlo se Confluence non è l'unica fonte in gioco.

## Domande frequenti

### Posso esportare una pagina Confluence direttamente in Markdown?

Non con niente di integrato in Confluence. Ogni export nativo — Word, PDF, HTML, XML, CSV — è una resa diversa del formato di archiviazione proprio della pagina, e nessuno è Markdown; arrivarci significa convertire uno di quegli export una seconda volta, oppure installare un'app del Marketplace che fa i due passaggi per te.

### Quale formato di export Confluence dovrei convertire?

HTML. È il solo export denso abbastanza da conservare intestazioni, elenchi, tabelle e link come marcatura vera invece che testo appiattito o pixel resi, che è quello che serve a un convertitore da HTML a Markdown per fare un buon lavoro.

### Devo essere amministratore dello spazio per esportare uno spazio Confluence?

Sì, per gli export a livello di spazio in HTML, XML e CSV in particolare — l'export in Word o PDF di una singola pagina richiede solo l'accesso che hai già per leggere quella pagina. Se non sei amministratore dello spazio, esportare uno spazio intero significa chiederlo a chi lo è.

### Cosa succede alle macro di problemi Jira e ad altri contenuti dal vivo quando esporto?

Si congelano. Una macro di problemi Jira, la vista di un albero di pagine, un excerpt incluso — ognuna esporta come qualunque cosa abbia reso il giorno dell'export, un'istantanea invece di una query, e niente nel formato di export la mantiene viva.

### Perché le mie immagini convertite mostrano link rotti?

Perché i link agli allegati inline di Confluence puntano a URL `/download/attachments/...` che si aspettano una sessione attiva, con accesso già effettuato. Un export di spazio confeziona i file allegati veri dentro il proprio zip proprio per questo — il rimedio è riscrivere i link verso quei file locali, non verso gli URL originali di Confluence.

### Posso convertire una pagina Confluence senza caricarla da nessuna parte?

Sì, se il convertitore gira nel tuo browser invece di inviare il file a un server — vale la pena confermarlo per qualunque cosa non dovrebbe lasciare la tua macchina, guardando il pannello di rete mentre converti.

### Perché i link interni si rompono dopo che convertono una pagina Confluence?

Perché Confluence genera gli id delle intestazioni combinando il titolo della pagina e il testo dell'intestazione, mentre un normale convertitore da HTML a Markdown genera un id più semplice a partire dal solo testo dell'intestazione. La sezione si è convertita correttamente — è cambiato solo l'id — quindi il rimedio è riscrivere il link contro il nuovo id, non riconvertire il contenuto.

### Confluence Server o Data Center sono diversi da Cloud per questo?

Il formato di archiviazione e l'export HTML sono la stessa idea su entrambi, ma il percorso esatto nel menu, il modello di permessi e le app del Marketplace disponibili cambiano a seconda della versione e dell'edizione. Server e Data Center si appoggiano più spesso a un'app del Marketplace come ScriptRunner per qualunque cosa oltre la finestra di export integrata, dato che non esiste una regola di Automation in stile Cloud a cui ricorrere.
