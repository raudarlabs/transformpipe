---
title: "Da Markdown a HTML: cosa succede davvero al tuo file"
description: Cosa fa un convertitore da Markdown a HTML al tuo file — parsing, rendering, sanificazione, wrapping — e come appare un fallimento in ciascuna fase
updated: 2026-10-21
date: 2026-09-08
tag: Conversione
keywords: markdown in html, md in html, convertire markdown in html, convertitore markdown html online, generatore html da markdown, renderizzare markdown come html
---

Convertire un file Markdown in HTML sembra un'unica azione. Sono quattro lavori eseguiti in ordine, e uno strumento può essere accurato su uno e trascurato sul successivo. Sapere quale è quale spiega perché due convertitori producono HTML diverso dallo stesso file, perché una tabella a volte arriva come un paragrafo pieno di caratteri pipe, e perché il risultato a volte si apre come un muro di testo senza stile con i trattini lunghi trasformati in caratteri incomprensibili.

Le quattro fasi sono parsing, rendering, sanificazione e wrapping. Ognuna butta via informazione oppure inventa informazione che non era mai nel tuo sorgente, e ognuna fallisce in un modo che puoi riconoscere sullo schermo una volta che sai cosa cercare. Nessuna delle quattro è opzionale se il file deve aprirsi da qualche parte diversa dallo strumento che l'ha prodotto.

Questo è il resoconto meccanico: cosa costruisce davvero il parser, cosa decide il renderer per conto tuo, cosa contiene la allow-list di un sanificatore e cosa cancella, e cosa serve a un browser nel `<head>` prima che renderizzi il tuo documento come l'hai visto nell'anteprima.

### In breve

Un convertitore da Markdown a HTML analizza il tuo testo in un **albero sintattico** di nodi tipizzati, percorre quell'albero per **renderizzare** i tag, **sanifica** il frammento risultante contro una allow-list di tag, attributi e schemi URL, e poi **avvolge** il frammento in un documento completo con un doctype, un charset e degli stili. Il dialetto viene deciso alla fase uno, quindi un parser CommonMark puro trasforma le tue tabelle in stile GitHub in paragrafi e non c'è alcun messaggio d'errore. La sanificazione viene decisa alla fase tre, e conta nel momento in cui il Markdown viene da qualsiasi posto che non hai scritto tu stesso. Se il file si apre correttamente per la persona a cui lo mandi si decide quasi interamente alla fase quattro, con quattro righe nella head che la maggior parte delle librerie non scrive mai perché scriverle non è compito di una libreria.

## Le quattro fasi, a colpo d'occhio

| Fase | Input | Output | Cosa si decide qui |
| --- | --- | --- | --- |
| Parsing | Caratteri | Un albero di nodi tipizzati | Dialetto: tabelle, liste di attività, note a piè di pagina, regole di interruzione di riga |
| Rendering | L'albero | Un frammento HTML | Id dei titoli, classi dei blocchi di codice, markup delle checkbox, codifica degli URL |
| Sanificazione | Il frammento | Un frammento senza le parti pericolose | Quali tag, attributi e schemi URL sopravvivono |
| Wrapping | Il frammento | Un documento completo | Doctype, charset, titolo, viewport, stili, se serve la rete |

Leggi quella tabella come una catena. Un file che esce sbagliato è uscito sbagliato esattamente in uno di quei quattro punti, e il sintomo ti dice quale. Le tabelle mancanti sono un problema di parsing e nessuna quantità di restyling lo risolverà. Il testo senza stile è un problema di wrapping e non ha niente a che fare con il parser. Un tag `<script>` sopravvissuto è un problema di sanificazione, ed è l'unico dei quattro che può fare del male a qualcuno.

## Fase uno: il parsing, e cosa contiene davvero un albero sintattico

Un parser legge i caratteri e costruisce un albero. Non HTML — un albero di nodi tipizzati, ognuno con una manciata di campi, e nessun tag da nessuna parte al suo interno. Prendi quattro righe di Markdown:

```markdown
## Release 2.1

- [x] Tighten the allow-list
- [ ] Document the API

See the [changelog](CHANGELOG.md) for the rest.
```

Quello che il parser produce è più vicino a questo, scritto come schema:

```text
document
  heading (level: 2)
    text "Release 2.1"
  list (ordered: false, tight: true, marker: "-")
    item (checked: true)
      paragraph
        text "Tighten the allow-list"
    item (checked: false)
      paragraph
        text "Document the API"
  paragraph
    text "See the "
    link (destination: "CHANGELOG.md", title: null)
      text "changelog"
    text " for the rest."
```

Ci sono diverse cose in questo schema che vale la pena nominare, perché ognuna diventa una differenza visibile nell'HTML più avanti.

**I nodi sono o di blocco o inline.** I blocchi sono la forma del documento: `document`, `heading`, `paragraph`, `list`, `item`, `block_quote`, `code_block`, `thematic_break`, `html_block`. Gli inline sono il contenuto di un blocco: `text`, `emphasis`, `strong`, `code`, `link`, `image`, `softbreak`, `linebreak`, `html_inline`. La struttura a blocchi viene determinata per prima, in un solo passaggio sulle righe; il contenuto inline viene analizzato dopo, dentro ogni blocco. Questo design a due fasi è il motivo per cui un `*` vagante alla fine di un paragrafo non può trasformare in corsivo il titolo che segue, e per cui una riga di tabella non può contenere una lista.

**Ogni nodo porta con sé le posizioni nel sorgente.** Riga di inizio e fine, colonna di inizio e fine. Nessuno le vede nell'output, ma sono quello che fa scorrere l'anteprima di un editor in sincronia col testo, quello che permette a un linter di dire “riga 47, colonna 3”, e quello che permette a uno strumento di segnalare su quale riga stava un link rotto. Un convertitore che scarta le posizioni non può dirti dove è andato storto qualcosa.

**Alcuni nodi portano attributi strutturali che cambiano il rendering.** Un nodo `list` registra se è ordinata, da che numero inizia, e se è *tight* o *loose*. La compattezza è decisa dalle righe vuote nel tuo sorgente: punti elenco senza riga vuota tra loro fanno una lista tight, e gli elementi di una lista tight si renderizzano senza involucri `<p>`. Metti una riga vuota tra due punti elenco e ogni elemento della lista diventa loose, guadagna un paragrafo, e l'intera lista diventa più alta. Questo è il più comune “perché è cambiata la spaziatura” del Markdown, e succede nell'albero, prima che esista qualsiasi HTML.

Un nodo `code_block` registra il carattere di delimitazione, la sua lunghezza e la *info string* — il `js` in ` ```js `. La info string è testo libero; il parser non sa che è il nome di un linguaggio. Un nodo `item` in un parser in stile GitHub registra se la sua checkbox era spuntata. Un nodo `link` registra una destinazione e un titolo opzionale, già senza escape.

**Le definizioni di link per riferimento non sopravvivono come nodi.** Scrivi `[changelog][cl]` in un paragrafo e `[cl]: https://example.com/log` in fondo al file, e il parser consuma del tutto la riga di definizione e risolve la destinazione dentro il nodo `link`. Niente nell'albero ricorda che il link era scritto in stile riferimento. Ne seguono due conseguenze: una definizione che nessuno referenzia scompare senza lasciare traccia, e un riferimento con un errore di battitura nell'etichetta non è un errore — è testo letterale, e `[changelog][cl2]` si renderizza esattamente con quei caratteri, parentesi comprese.

**L'HTML grezzo è una stringa opaca.** Un `<div>` o uno `<script>` nel tuo Markdown diventa un nodo `html_block` il cui contenuto è il testo grezzo. Il parser Markdown non lo analizza in elementi, non controlla che i tag siano bilanciati, e non sa cosa dica. È una scatola sigillata portata fino all'output, che è esattamente il motivo per cui il sanificatore alla fase tre deve fare il proprio parsing HTML invece di ispezionare l'albero.

## Dove i dialetti del Markdown divergono

Il dialetto è una proprietà del parser, e si decide qui. Ogni differenza sotto è una divergenza reale ed elencabile tra specifiche nominate e implementazioni.

**Il CommonMark puro non ha tabelle.** Nessuna lista di attività, nessun barrato, nessun collegamento automatico degli URL nudi. Ha titoli ATX, titoli setext, codice delimitato e indentato, liste, blockquote, interruzioni tematiche, enfasi, link, immagini e HTML grezzo. Questa è la specifica. Dai una tabella a pipe a un parser strettamente conforme e ottieni un paragrafo che contiene caratteri pipe, disposto come un'unica sequenza di testo, senza alcun avviso.

**GitHub Flavored Markdown aggiunge cinque estensioni sopra CommonMark:** tabelle, voci di lista di attività, barrato con `~~`, autolink letterali, e HTML grezzo non permesso, che filtra una breve lista di tag alla fase di parsing. È una specifica a pieno titolo, pubblicata come delta rispetto a CommonMark, che è il motivo per cui “supporta GFM” è una domanda con una risposta sensata di sì o no. Nota che la quinta estensione non sostituisce la fase tre: nomina una manciata di tag, non una allow-list.

**Le note a piè di pagina non sono in nessuna delle due specifiche.** Un convertitore che supporta `[^1]` lo fa come estensione, e le estensioni non sono d'accordo tra loro su dove può vivere il testo della nota, se una nota può contenere una lista, o che aspetto ha il link di ritorno. Le note a piè di pagina sono la funzionalità più probabile che sopravviva a una conversione e sparisca nella successiva.

**L'enfasi dentro una parola differisce.** CommonMark deliberatamente non tratta il `_` dentro una parola come enfasi, quindi `snake_case_name` resta intatto. I convertitori più vecchi, inclusi quelli JavaScript precedenti a CommonMark, mettono in corsivo il centro di quell'identificatore. Se il tuo documento è pieno di nomi di variabili, il parser che scegli è la differenza tra leggibile e rovinato.

**Le interruzioni di riga morbide sono un'opzione, non una regola.** Un singolo a capo dentro un paragrafo è un nodo `softbreak`. CommonMark lo renderizza come un a capo nell'HTML, che il browser comprime in uno spazio. Sia marked che markdown-it espongono un'opzione `breaks` che lo renderizza invece come `<br>`; Python-Markdown fa lo stesso tramite la sua estensione `nl2br`. Lo stesso file, due impostazioni, due documenti — uno dove il tuo blocco indirizzo è di tre righe e uno dove è di una sola.

**I dialetti estesi vanno ancora oltre.** Il Markdown proprio di Pandoc aggiunge liste di definizioni, div delimitati, citazioni e formule matematiche in linea. L'estensione `attr_list` di Python-Markdown ti permette di attaccare classi e id agli elementi dal sorgente. PHP Markdown Extra e MultiMarkdown hanno ciascuno le proprie varianti di sintassi delle tabelle. Tutti questi si analizzano correttamente nello strumento che li definisce e degradano a punteggiatura letterale ovunque altro, il che è quello che si intende quando si dice che un file Markdown non è portabile. Vale la pena capire bene la questione dei dialetti, perché [i dialetti differiscono in modi specifici ed elencabili](/blog/commonmark-gfm-and-the-flavours) e le differenze sono tutte silenziose.

## Fase due: il rendering, e le scelte che nessuno ti ha chiesto

Il renderer percorre l'albero e scrive i tag. È qui che il convertitore inizia a inventare, perché l'HTML ha bisogno di dettagli che il Markdown non ha mai espresso. Dall'albero sopra, un renderer in stile GitHub potrebbe scrivere:

```html
<h2 id="doc-release-21">Release 2.1</h2>
<ul class="contains-task-list">
  <li class="task-list-item"><input type="checkbox" checked disabled> Tighten the allow-list</li>
  <li class="task-list-item"><input type="checkbox" disabled> Document the API</li>
</ul>
<p>See the <a href="CHANGELOG.md">changelog</a> for the rest.</p>
```

Nessuno degli id, delle classi o degli elementi input esisteva nel tuo sorgente. Sono scelte della casa, ed è per questo che due convertitori possono essere entrambi corretti e comunque in disaccordo.

**Gli id dei titoli sono lo spigolo più tagliente.** Nessuna specifica dice che i titoli ottengono un `id`, e nessuna definisce come il testo diventa uno slug. Le implementazioni mettono il testo in minuscolo, tolgono la punteggiatura, sostituiscono gli spazi con trattini e aggiungono un contatore ai duplicati — ma non sono d'accordo su quale punteggiatura togliere e che aspetto ha il contatore. Un renderer toglie il punto e produce `release-21`; un altro lo tiene e produce `release-2.1`; un terzo mette un prefisso a tutto, come `doc-release-21` sopra, per evitare che l'id collida con il markup della pagina stessa. I link ancora scritti a mano contro uno schema si rompono in silenzio contro un altro, e “in silenzio” qui significa che il browser non scorre da nessuna parte e non mostra alcun errore.

**I blocchi di codice ottengono una classe, e la convenzione non è universale.** L'output usuale è `<pre><code class="language-js">`, prendendo la prima parola della info string. Alcuni renderer scrivono `class="js"`, alcuni aggiungono un attributo `data-lang`, alcuni emettono un `<div>` involucro con dentro il linguaggio. L'evidenziazione è di nuovo una decisione separata: o il convertitore esegue un evidenziatore al momento della conversione ed emette span con nomi di classe, oppure emette un elemento code semplice e si aspetta che uno script lo colori nel browser. Il primo produce un file che funziona offline; il secondo produce un file che ha bisogno della rete e di un tag script. Questa scelta, e [la gestione dei blocchi di codice in generale](/blog/code-blocks-in-markdown), decide se i tuoi esempi di codice sopravvivono a essere mandati per email.

**Il testo e gli URL vengono sottoposti a escape, e l'escape differisce.** Nei nodi di testo, `&`, `<` e `>` vengono sostituiti con entità. Nei valori degli attributi vengono sostituite le virgolette. Le destinazioni dei link vengono codificate con percent-encoding, e le implementazioni differiscono su se una destinazione che contiene già un `%` viene lasciata stare o codificata di nuovo — la seconda trasforma un URL funzionante in un 404. I renderer differiscono anche su se normalizzano il case degli escape esadecimali e se codificano caratteri che sono legali in un URL ma brutti.

**La tipografia è opzionale.** L'opzione `typographer` di markdown-it e l'estensione `smart` di Pandoc convertono le virgolette dritte in virgolette curve, `--` in un trattino medio e `...` in un'ellissi. Piacevole nella prosa, sbagliato in un documento pieno di righe di comando, dove una virgoletta curva incollata in un terminale fallisce con un messaggio che non menziona le virgolette.

**Il markup delle liste di attività varia.** Alcuni renderer emettono un vero `<input type="checkbox" disabled>`, alcuni emettono uno `<span>` con stile, alcuni lasciano il testo letterale `[x]` al suo posto perché non hanno mai implementato l'estensione. Questo conta due volte: una per come appare, e di nuovo alla fase tre, perché un elemento input è esattamente il tipo di cosa che la allow-list di un sanificatore è incline a cancellare.

**Le tabelle ottengono attributi di allineamento o classi.** I due punti nella riga di delimitazione di una tabella GFM diventano o attributi `align="left"` sulle celle, o una classe per colonna, o stili inline — tre modi di esprimere la stessa intenzione, ciascuno trattato diversamente da un sanificatore. Le tabelle portano più di questo per riga di qualsiasi altra cosa nel Markdown, il che è il motivo per cui [le tabelle sono la cosa più comune a rompersi nell'attraversamento](/blog/markdown-tables-that-survive-conversion).

Quello che il renderer restituisce è un frammento. Titoli, paragrafi e liste, senza doctype, senza head, senza stili, e senza alcuna garanzia che qualcosa di tutto ciò sia sicuro.

## Fase tre: la sanificazione, il lavoro che le persone dimenticano

Il Markdown lascia passare l'HTML grezzo per progetto. Un tag `<script>` in un file .md non è un errore; è contenuto, e un renderer fedele lo copia nell'output. Lo stesso vale per un attributo `onerror` su un'immagine, e per un URL `javascript:` in un link. Se il Markdown viene da un posto che non controlli — una pull request, un issue, un cliente, l'output di un modello — il frammento che hai appena prodotto è HTML non fidato, e aprirlo in un browser lo esegue.

La sanificazione fa passare quel frammento attraverso una allow-list e scarta tutto il resto. Deve essere una allow-list. Una blocklist di tag noti per essere cattivi perde contro il prossimo trucco di codifica, la prossima variante in maiuscolo, il prossimo namespace dove un attributo significa qualcosa di diverso.

## Che aspetto ha davvero una allow-list di un sanificatore

Una allow-list sono tre liste e una regola, non un'unica lista di tag.

**La lista dei tag.** Tutto quello che il Markdown può legittimamente produrre, e niente di più: `p`, da `h1` a `h6`, `ul`, `ol`, `li`, `blockquote`, `pre`, `code`, `em`, `strong`, `del`, `a`, `img`, `hr`, `br`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `sup`, `sub`. Aggiungi `input` se vuoi le checkbox delle liste di attività, `details` e `summary` se i tuoi documenti li usano, `span` e `div` se permetti affatto contenitori HTML grezzi.

**La lista degli attributi, per tag.** Questa è la parte che le persone sbagliano scrivendo un'unica lista globale. `a` ottiene `href`, `title`, `rel` ed eventualmente `target`. `img` ottiene `src`, `alt`, `title`, `width` e `height`. `th` e `td` ottengono `colspan`, `rowspan` e `align`. `code` ottiene `class`, ristretto al prefisso `language-` se sei attento. `input` ottiene `type`, `checked` e `disabled`, e `type` è fissato a `checkbox`. I titoli ottengono `id`. Nient'altro ottiene niente.

**La lista degli schemi URL.** `http`, `https` e `mailto` per i link; aggiungi `data:` per le immagini solo se hai deciso di volere immagini incorporate, e in tal caso limitalo ai tipi media immagine. Tutto il resto se ne va: `javascript:`, `vbscript:`, `file:`, e `data:text/html`, che è un intero documento che finge di essere un URL. Gli schemi vanno controllati dopo aver rimosso l'escape e dopo aver eliminato spazi bianchi e caratteri di controllo, perché `java&#09;script:` è un URL che un browser seguirà volentieri.

**La regola per tutto il resto.** Un tag sconosciuto viene o scartato interamente, o scartato solo lui — il tag rimosso e i suoi figli tenuti. Il secondo tiene più del tuo testo; il primo è più sicuro per i contenitori il cui contenuto non era mai destinato a essere letto come prosa. Scegline uno di proposito, perché la differenza si manifesta come contenuto duplicato o contenuto mancante la prima volta che il documento di qualcuno contiene un `<template>`.

## Cosa scarta un sanificatore, e perché ognuno

| Scartato | Perché |
| --- | --- |
| `<script>` | Si esegue all'apertura. L'intera ragione per cui esiste questa fase |
| Attributi `on*` | `onerror`, `onload`, `onmouseover` si eseguono senza alcun tag script da nessuna parte |
| URL `javascript:` e `data:text/html` | Un link o una sorgente immagine che esegue codice invece di recuperare una risorsa |
| `<iframe>`, `<object>`, `<embed>` | Caricano ed eseguono contenuto di terze parti dentro il tuo documento |
| `srcdoc` | Un intero documento HTML contrabbandato dentro un attributo |
| `<style>` e attributi `style` | Possono riposizionare e mascherare elementi; spesso rimossi, a volte permessi con una allow-list di proprietà |
| `<form>`, `<button>`, `formaction` | Chiedono un input al lettore e lo inviano da qualche parte |
| `<base>` | Un solo tag che riscrive in silenzio ogni URL relativo nel documento |
| `<meta http-equiv="refresh">` | Reindirizza il lettore fuori dal tuo documento |
| `<svg>` e `<math>` | Le regole di parsing per contenuto estraneo differiscono da quelle dell'HTML, ed entrambi possono portare script e una propria sintassi di link |
| `id` e `name` senza prefisso | DOM clobbering: `id="attributes"` fa ombra a una vera proprietà del DOM e rompe gli script che la leggono |

Due dettagli decidono se un sanificatore regge nella pratica.

**Dove gira.** Un sanificatore nel browser si appoggia al parser stesso del browser, che è lo stesso parser che renderizzerà poi il documento — un vantaggio vero, perché vede il markup come lo vedrà il browser. Uno su un server deve analizzare l'HTML da sé, con una propria idea di come si annidano i tag malformati. Se uno strumento converte in entrambi i posti, i due devono essere d'accordo, altrimenti lo stesso documento si renderizza diversamente a seconda di chi lo ha richiesto. È anche qui che vivono i problemi di mutazione: se il parsing del sanificatore e quello del browser non sono d'accordo su un caso limite di annidamento, pulire il markup può produrre qualcosa che, ri-analizzato nel browser, risulta un markup diverso da quello approvato.

**Di nuovo gli id dei titoli.** Un `id="title"` nudo fa ombra a una proprietà del DOM, quindi un sanificatore nel browser lo rimuove mentre un parser lato server lo tiene: un documento, due forme, e link ancora che funzionano in una e non nell'altra. Mettere un prefisso agli id risponde a entrambi i problemi insieme. TransformPipe sanifica con DOMPurify nel browser e il pacchetto `xss` sul server contro un'unica allow-list condivisa, e i suoi id dei titoli portano un prefisso `doc-`.

Un'ultima cosa su questa fase: la sanificazione è visibile. Rimuove cose. Le checkbox spariscono se `input` non è nella lista, un blocco `<details>` si appiattisce nel suo contenuto, un diagramma incorporato diventa niente del tutto. Non è un bug — è la allow-list che fa il suo lavoro — ma significa che l'output va letto, non dato per scontato.

## Fase quattro: il wrapping, perché un frammento non è una pagina

Quello che il renderer e il sanificatore restituiscono è un frammento: `<h1>Title</h1><p>Text</p>` e niente intorno. Incollalo in una pagina già esistente e funziona perfettamente. Salvalo come .html, mandalo a qualcuno, e il browser fa del suo meglio con un documento che non si è mai dichiarato.

Un documento completo ha bisogno di un piccolo insieme fisso di cose, e ognuna ha attaccato un fallimento specifico.

**`<!doctype html>`, prima riga.** Senza di esso il browser entra in quirks mode, che è un motore di rendering diverso con un box model diverso, un'ereditarietà delle celle di tabella diversa e una gestione dell'altezza di riga diversa. Il tuo documento non sarà rotto, esattamente — sarà spaziato in modo sottilmente e inspiegabilmente diverso dall'anteprima che avevi approvato.

**`<html lang="en">`.** L'attributo lingua è ciò che uno screen reader usa per scegliere una voce e la pronuncia, e ciò che il browser usa per la sillabazione e le virgolette. Omettilo e un documento in inglese potrebbe essere letto ad alta voce con la fonetica di qualunque sia il default del lettore.

**`<meta charset="utf-8">`, entro i primi 1024 byte.** Questo è quello che produce il sintomo classico. Il tuo file è UTF-8; senza una dichiarazione, un browser indovina, e un'ipotesi sbagliata renderizza ogni trattino lungo come `â€"`, ogni apostrofo curvo come `â€™` e ogni nome accentato come due caratteri di rumore. La dichiarazione deve arrivare presto, prima di qualsiasi contenuto sostanziale, perché il browser smette di indagare una volta iniziato.

**`<title>`.** Dà il nome alla scheda del browser, è quello che una finestra “salva con nome” suggerisce come nome file, ed è quello che un'anteprima di link mostra in un client di chat. Un documento senza titolo arriva nella cartella download di qualcuno con il suo stesso percorso come nome.

**`<meta name="viewport" content="width=device-width, initial-scale=1">`.** Senza di esso, un telefono dispone la pagina a una larghezza più o meno da desktop e poi rimpicciolisce per adattarla, quindi il tuo documento si apre leggibile-solo-se-zoomi. Metà delle persone a cui mandi un documento lo apriranno prima sul telefono.

**Un foglio di stile.** Questa è la differenza tra convertito e sembrare convertito. Quello che serve è poco appariscente: una misura leggibile così che le righe non corrano per l'intera larghezza di un monitor, un'altezza di riga, bordi e padding sulle celle delle tabelle, `overflow-x: auto` su `pre` così che una riga di codice lunga scorra invece di allungare la pagina, `max-width: 100%` sulle immagini così che uno screenshot non spinga il layout di lato, e un blocco `@media print` se qualcuno lo stamperà.

**Metti gli stili inline se il file deve viaggiare.** Un `<link>` a un foglio di stile o a un font su un CDN significa che il documento appare giusto solo dove c'è connessione, e significa che aprire il file dice a terzi che è stato aperto. Un file autonomo porta i suoi stili in un elemento `<style>` e non richiede nulla. È un file più grande, ed è l'unica versione che si renderizza identica offline, su un laptop bloccato, e tra cinque anni quando l'URL del CDN si sarà spostato.

**I percorsi relativi si risolvono contro la nuova posizione del file.** Un'immagine scritta come `images/diagram.png` si risolve relativamente a dove sta ora il file .html, quindi si rompe nel momento in cui il file si sposta o viene allegato a un'email. Solo un URL assoluto o un data URI viaggia con il documento. Lo stesso vale per `[changelog](CHANGELOG.md)`: diventa un `href` verso un file .md, e un browser a cui viene dato un file .md di solito lo scarica invece di renderizzarlo, a meno che tu non abbia convertito anche quel file e riscritto l'estensione.

## Come appare sullo schermo un fallimento in ogni fase

Il sintomo identifica la fase. Questa è la tabella da tenere a portata di mano.

| Fase | Cosa vedi | Cosa è successo davvero | Come controllare |
| --- | --- | --- | --- |
| Parsing | Un paragrafo pieno di caratteri `\|` dove dovrebbe esserci una tabella | Il parser sta girando in CommonMark, non GFM; le tabelle non sono mai state riconosciute | Guarda il sorgente HTML cercando `<table>`. Se non c'è un elemento table, nessuno stile aiuterà |
| Parsing | `[x]` e `[ ]` letterali all'inizio delle voci di lista | Estensione delle liste di attività non abilitata | Cerca nell'output `type="checkbox"` |
| Parsing | `[^1]` letterale nel testo e nessuna nota in fondo | Le note a piè di pagina sono un'estensione e questo parser non ce l'ha | Controlla il dialetto o l'elenco delle estensioni dello strumento |
| Parsing | Un indirizzo di tre righe collassato in una sola riga | Gli a capo singoli sono interruzioni morbide; l'opzione `breaks` è disattivata | Cerca `<br>` nel sorgente; non ce ne sarà nessuno |
| Parsing | Una lista annidata renderizzata piatta, o come blocco di codice | L'indentazione di continuazione non corrispondeva a quello che il parser si aspetta | Conta gli spazi; è l'albero, non il CSS, a essere sbagliato |
| Rendering | I link ancora non scorrono da nessuna parte | Gli slug degli id dei titoli differiscono da quelli contro cui erano scritti i tuoi link | Confronta un `href="#..."` con l'`id` sul titolo |
| Rendering | Blocchi di codice presenti ma senza colore | Il renderer ha emesso una classe e ha lasciato l'evidenziazione a uno script che non è nel file | Cerca `class="language-…"` e un tag script |
| Rendering | Virgolette curve in una riga di comando che ora fallisce | La sostituzione tipografica era attiva | Cerca nell'output `’` e `“` |
| Rendering | Un URL che dà 404 anche se funzionava nel sorgente | La destinazione è stata codificata due volte con percent-encoding | Confronta l'`href` con la destinazione Markdown carattere per carattere |
| Sanificazione | Una finestra di alert, o qualsiasi cosa in esecuzione | Niente ha sanificato il frammento. Il documento sta eseguendo codice del suo autore | Cerca nel sorgente `<script` e gestori `on` prima di aprirlo |
| Sanificazione | Checkbox sparite, blocchi `<details>` appiattiti, un embed mancante | La allow-list ha fatto il suo lavoro e quei tag non c'erano | Confronta i frammenti prima e dopo la sanificazione se lo strumento li mostra entrambi |
| Sanificazione | Lo stesso documento si renderizza diversamente su due macchine | I sanificatori lato browser e lato server stanno girando con allow-list diverse | Converti lo stesso file in entrambi i posti e confronta l'HTML |
| Wrapping | Un muro di testo serif a piena larghezza della finestra | Ti è stato dato un frammento, non un documento. Nessun doctype, nessuna head, nessuno stile | Guarda la prima riga del file per `<!doctype html>` |
| Wrapping | `â€"` e `â€™` sparsi nella prosa | Nessuna dichiarazione di charset, quindi il browser ha indovinato male | Controlla che ci sia `<meta charset="utf-8">` nella head |
| Wrapping | Leggibile solo dopo aver zoomato con due dita su un telefono | Nessun meta tag viewport | Controlla la head; poi aprilo su un telefono, non in un emulatore di dispositivo |
| Wrapping | Icone di immagine rotte dopo che il file è stato mandato per email | Percorsi relativi delle immagini che non si risolvono più | Guarda i valori `src`; qualsiasi cosa non assoluta o non un data URI si romperà |
| Wrapping | Corretto con la rete accesa, spoglio con la rete spenta | Gli stili o i font sono collegati da un CDN invece che inline | Spegni la rete e riapri il file |

## Confronto rapido: dove possono girare le quattro fasi

Le quattro fasi succedono ovunque tu le metta. Quello che cambia è quali delle quattro fa lo strumento per te, e quali lascia sulla tua scrivania.

| Dove converti | Ideale per | Fasi che gestisce | Prezzo |
| --- | --- | --- | --- |
| Convertitore nel browser | Un file, adesso, con una persona a cui mandarlo | Tutte e quattro, incluso un wrapper autonomo | Gratis |
| Una libreria nel tuo codice | Rendering dentro un'applicazione che stai costruendo | Parsing e rendering; sanificazione e wrapping sono tuoi | Gratis, MIT o BSD a seconda della libreria |
| Convertitore da riga di comando | Conversione scriptata e ripetibile di file sul disco | Parsing, rendering e opzionalmente wrapping; sanificazione raramente | Gratis, open source; Pandoc è GPL |
| Generatore di siti statici | Un insieme di documenti che si collegano tra loro | Tutte e quattro, più la navigazione, su un'intera directory | Gratis, open source |
| API, CLI o azione CI | Conversione dentro una build senza browser presente | Tutte e quattro, se lo fa il servizio; il punto è nessuna installazione sul runner | Gratis con TransformPipe; varia altrove |
| L'esportazione di un editor | Il file che capita di avere aperto | Parsing e rendering, il wrapping dipende del tutto dall'estensione | Gratis per VS Code; gli editor desktop variano, controlla il fornitore |

## Dove far girare la conversione

### Un convertitore nel browser — tutte e quattro le fasi, un file, niente caricato

Un convertitore che gira nel browser fa il parsing, il rendering, la sanificazione e il wrapping sulla tua stessa macchina e ti consegna un file .html finito. Da disconnesso, il file non viene mai mandato da nessuna parte: viene letto, convertito e renderizzato localmente, cosa che puoi verificare guardando la scheda rete non fare nulla mentre lavora.

| Pro | Contro |
| --- | --- |
| Produce un documento completo, non un frammento | Un documento alla volta, oppure diversi concatenati in uno |
| Niente viene caricato, quindi il sorgente resta sulla tua macchina | Un file molto grande è limitato dalla memoria della macchina |
| Sanifica contro una allow-list fissa prima ancora che tu apra l'output | Nessun linguaggio di template, quindi il wrapper è dello strumento, non tuo |
| Nessuna installazione e niente da configurare | Non è un passaggio di build: qualcuno deve essere lì seduto |

**Prezzo:** gratis. Un account aggiunge cronologia, condivisione e una API, gratis anch'essi.

**Dettagli tecnici e funzionalità**

- GitHub Flavored Markdown alla fase di parsing: tabelle, liste di attività, barrato, autolink, codice delimitato
- Gli id dei titoli portano un prefisso `doc-`, così sopravvivono sia alla sanificazione lato browser sia a quella lato server
- L'esportazione è autonoma: doctype, head, charset, viewport, `<style>` inline, nessuna richiesta esterna
- Una vista “sorgente HTML”, così puoi leggere il wrapper e vedere cosa è successo a qualsiasi HTML grezzo prima di mandarlo
- Si scarica come `.html`, `.md` o testo semplice, oppure stampa in PDF tramite la finestra di stampa del browser stesso — e il download in testo fa le sue proprie scelte su titoli, link e tabelle, il che è [cosa costa appiattire il Markdown in testo semplice](/blog/markdown-to-plain-text)

**Per chi è.** Chiunque abbia come passo successivo “manda questo a una persona”, e chiunque converta un documento che preferirebbe non caricare — un contratto, una nota di un paziente, un piano non ancora reso pubblico.

### Una libreria nel tuo codice — due fasi, e due lasciate a te

marked e markdown-it in JavaScript, Python-Markdown e markdown-it-py in Python, Goldmark in Go, commonmark.js quando ti serve il comportamento di riferimento. Questi fanno il parsing e il rendering per bene e si fermano lì, per progetto: una libreria non sa se il suo output andrà dentro una pagina già esistente o un file autonomo, quindi non può scrivere il tuo wrapper, e non sa se l'input è fidato, quindi la maggior parte di esse non sanifica in silenzio.

| Pro | Contro |
| --- | --- |
| Controllo completo delle opzioni: dialetto, breaks, tipografia, id dei titoli | La sanificazione è compito tuo, e l'omissione è silenziosa |
| Abbastanza veloce da girare per ogni richiesta | Il wrapping è compito tuo, e il frammento sembra rotto senza |
| Punti di estensione per il rendering di nodi personalizzati | Due librerie, due dialetti di default, due insiemi di bug |
| Testabile nella tua suite | Ora possiedi tu la decisione sulla sicurezza |

**Prezzo:** gratis, open source. marked e markdown-it hanno licenza MIT; Python-Markdown e commonmark.js hanno licenza BSD.

**Dettagli tecnici e funzionalità**

- markdown-it fa escape dell'HTML grezzo di default, che è il default sicuro; marked lo lascia passare e documenta che dovresti abbinarlo a DOMPurify
- Entrambi espongono un'opzione `breaks` per le interruzioni di riga morbide e opzioni per gli id dei titoli
- markdown-it ti dà un flusso di token e marked un lexer, così puoi ispezionare l'albero prima del rendering
- Le estensioni di Python-Markdown coprono tabelle, note a piè di pagina e liste di attributi

**Per chi è.** Sviluppatori che renderizzano Markdown dentro un'applicazione dove il documento circostante esiste già — una casella commenti, un pannello di anteprima, una build di documentazione con un proprio template.

### La riga di comando — ripetibile, scriptabile, e silenziosa sulla sicurezza

Pandoc è la risposta generale, e la maggior parte dei linguaggi distribuisce un wrapper CLI attorno alla propria libreria. Un convertitore da riga di comando è lo strumento giusto quando la stessa conversione deve ripetersi la settimana prossima, su file che vivono sul disco, senza una persona in una scheda del browser.

| Pro | Contro |
| --- | --- |
| Ripetibile e scriptabile su molti file | Richiede un'installazione e un terminale |
| `--standalone` di Pandoc scrive un documento vero, e `--embed-resources` mette gli asset inline | L'HTML grezzo passa attraverso: la sanificazione non fa parte del lavoro |
| I template danno un controllo esatto sul wrapper | I suoi dialetti Markdown differiscono da GFM in modi che sorprendono le persone |
| Gira dove non c'è alcun browser | Più strumento di quanto di solito serva per un singolo file |

**Prezzo:** gratis, open source. Pandoc ha licenza GPL.

**Dettagli tecnici e funzionalità**

- Selezione esplicita del reader, così puoi chiedere `commonmark`, `gfm` o il dialetto proprio di Pandoc invece di indovinare
- `--standalone` per il wrapper, `--template` per il tuo, `--embed-resources` per un output a file singolo
- `--sandbox` limita l'accesso al filesystem quando converti file di cui non ti fidi
- Scrive formati diversi dall'HTML dalla stessa sorgente, il che è il vero motivo per installarlo

**Per chi è.** Chiunque converta secondo un programma, in massa, o verso formati oltre l'HTML.

### Un generatore di siti statici — tutte e quattro le fasi, su una directory

Hugo, Eleventy, MkDocs, Docusaurus e Jekyll convertono tutti Markdown in HTML, e nessuno di loro è un convertitore. Sono sistemi di build: si aspettano una directory, un file di configurazione, dei template e una destinazione di deployment, e restituiscono navigazione, ricerca e link incrociati.

| Pro | Contro |
| --- | --- |
| Un wrapper coerente su ogni pagina | Un sovraccarico enorme per un solo file |
| Navigazione, feed e link tra documenti | Un file di configurazione e un passaggio di build da mantenere per sempre |
| Temi, così la questione del foglio di stile è risolta | L'output è un sito da distribuire, non un documento da mandare per email |
| Il parser è fissato e conosciuto | Il suo dialetto Markdown è la scelta del generatore, non la tua |

**Prezzo:** gratis, open source.

**Dettagli tecnici e funzionalità**

- Il generatore possiede del tutto la fase quattro, ed è per questo che ogni pagina appare uguale
- Qui il front matter è dato, non contenuto: alimenta il template invece di apparire nel testo
- La maggior parte fissa un parser specifico — Hugo usa Goldmark, MkDocs usa Python-Markdown — quindi il dialetto è una proprietà del generatore

**Per chi è.** Chiunque pubblichi un insieme di documenti che si collegano tra loro. Per un file e un destinatario, è del tutto la forma sbagliata.

### Una API, una CLI o un'azione CI — conversione senza un browser nel ciclo

Quando la conversione deve avvenire dentro una pull request, una build notturna o la chiamata a uno strumento di un assistente, non c'è nessuno che clicchi niente. Quello che serve sono le stesse quattro fasi disponibili su un filo o come un binario di cui il runner già si fida.

| Pro | Contro |
| --- | --- |
| Nessuna installazione sul runner di build | Un salto di rete, a meno che tu non usi la CLI |
| La stessa allow-list e lo stesso wrapper dello strumento interattivo, quindi l'output corrisponde | Dipendi dal fatto che un servizio sia attivo |
| Si adatta a un controllo di pull request o a un job di release | Non interattivo: leggi l'output dopo, in un artefatto |

**Prezzo:** gratis con la API, la CLI, la GitHub Action e il server MCP di TransformPipe; varia altrove.

**Dettagli tecnici e funzionalità**

- La CLI non ha dipendenze, quindi un runner non ha bisogno di un passaggio di installazione pacchetti
- La stessa conversione è raggiungibile da una chiamata REST, una shell, un passaggio di workflow o un assistente
- Poiché tutte e quattro le fasi girano lato server, l'output è il documento avvolto e sanificato invece di un frammento

**Per chi è.** Team che convertono come parte di una build — note di rilascio, documentazione generata, un'anteprima renderizzata allegata a una pull request.

### L'esportazione di un editor — comoda, e il wrapper è una lotteria

VS Code distribuisce un'anteprima Markdown costruita su markdown-it, e le estensioni aggiungono l'esportazione; [Markdown in HTML in VS Code](/blog/markdown-to-html-in-vs-code) spiega cosa scrive ciascuna attorno al frammento. Anche gli editor desktop esportano HTML. Se il file è già aperto davanti a te, questa è la strada più corta dal testo alla pagina.

| Pro | Contro |
| --- | --- |
| Già installato e già guarda il file | Lo stile dell'anteprima di solito non è lo stile esportato |
| Il dialetto dell'anteprima è conoscibile, perché il parser è nominato | La qualità dell'esportazione dipende del tutto dall'estensione che hai scelto |
| Nessun caricamento | La sanificazione di solito non ne fa parte |
| Va bene per un README o una nota | Non è una pipeline: converte quello che è aperto |

**Prezzo:** gratis per VS Code e le sue estensioni; gli editor desktop hanno un prezzo deciso dai loro fornitori, quindi controlla la pagina del fornitore.

**Dettagli tecnici e funzionalità**

- L'anteprima di VS Code usa markdown-it, quindi segue CommonMark con sopra le estensioni proprie dell'editor
- Le estensioni di esportazione differiscono su se mettono gli stili inline, li collegano, o scrivono un frammento
- Quello che mostra l'anteprima è stilizzato dal tema dell'editor, che non viene distribuito con il file

**Per chi è.** Sviluppatori che convertono un file di passaggio, che apriranno il risultato altrove prima di mandarlo.

## Dove la scelta ovvia fallisce, e cosa costa

La scelta ovvia per un file è un convertitore nel browser, ed è quella giusta abbastanza spesso da rendere i fallimenti degni di essere nominati.

**Converte un documento, non un progetto.** Concatena più file in uno e ottieni un unico documento lungo; non ottieni un sito con una barra laterale. Se la risposta ha bisogno di navigazione, il convertitore è solo la prima fase di un generatore di siti statici, e far finta che non sia così costa una ricostruzione più avanti.

**La macchina è il limite.** La conversione lato browser significa che il parsing, il rendering e la sanificazione avvengono tutti in una scheda. Un file lungo come un libro con centinaia di immagini è limitato dalla memoria di quella scheda, e il fallimento è una rotellina che gira, non un messaggio d'errore. La conversione lato server o da riga di comando non ha un tetto simile.

**Non c'è niente da confrontare con un diff.** Una conversione che qualcuno esegue a mano non è nel controllo di versione, non può essere rieseguita in modo identico il mese prossimo, e non può far fallire una build. Se lo stesso documento viene pubblicato ripetutamente, il clic è una passività e la API, la CLI o l'azione sono la correzione.

**Un file autonomo è un file grande.** Mettere inline gli stili, e le immagini come data URI, può moltiplicare la dimensione diverse volte. In cambio si renderizza identico offline e non richiede nulla. È uno scambio, e per una pagina servita da un sito web — dove un foglio di stile condiviso e in cache è tutto il punto — è il lato sbagliato dello scambio.

**La sanificazione toglie cose che volevi.** Una allow-list fissa non ha modo di sapere che l'embed nel tuo documento era tuo. Diagrammi, player incorporati e contenitori HTML scritti a mano escono come buchi. Il flusso di lavoro onesto è convertire, leggere l'output, e rimettere deliberatamente qualunque cosa la allow-list abbia rimosso.

**Il wrapper è il gusto di qualcun altro.** Nessun linguaggio di template significa nessun font della casa, nessun logo, nessuna copertina. Per un documento che va a un cliente sotto un marchio, è una limitazione vera, e un generatore con i template è la risposta anche per una sola pagina.

**Il front matter è una decisione del parser che nessuno documenta.** Un file da un sito statico o da un'app di note di solito inizia con un'intestazione YAML, e nessuna specifica Markdown dice cosa sia un'intestazione. Quindi viene gestita alla fase uno, da qualunque cosa faccia il parser: consumarla, oppure trattarla come testo ordinario. Il secondo esito è quello che vedi, perché l'intestazione arriva nel documento renderizzato come contenuto — il che è il motivo per cui dovresti convertire un file da una directory prima di convertire la directory intera.

**Gli id dei titoli potrebbero non corrispondere a quelli che i tuoi link assumono.** Mettere un prefisso agli id è la risposta giusta per la sicurezza e quella sbagliata per i link ancora copiati da GitHub. Converti un documento e clicca i tuoi link interni prima di fidarti su un centinaio.

## Come scegliere

1. **Parti dalla destinazione, non dal formato.** Un documento per una persona ha bisogno di tutte e quattro le fasi incluso il wrapper; un pannello di anteprima dentro la tua app ne ha bisogno solo di due, perché la pagina esiste già. Scegli per la destinazione sbagliata e finirai a scrivere a mano una `<head>` alla fine.
2. **Fai corrispondere il dialetto al file prima di ogni altra cosa.** Se il documento ha tabelle, liste di attività o note a piè di pagina, conferma che il parser le implementi, perché un'estensione mancante produce prosa dall'aspetto plausibile invece di un errore, e non te ne accorgerai finché non se ne accorgerà un lettore.
3. **Decidi sulla sanificazione prima di convertire un file che non hai scritto tu.** Per le tue proprie note non è un problema. Per un README dalla rete, il documento di un cliente o l'output di un modello, o sanifica il convertitore o lo fai tu — e se non lo fa nessuno dei due, aprire il risultato equivale a eseguirlo.
4. **Insisti su un wrapper che puoi leggere.** Apri il sorgente HTML e cerca il doctype, il charset, il tag viewport e dove vivono gli stili. Quelle quattro righe predicono quasi ogni lamentela del tipo “sulla mia macchina sembrava a posto” che altrimenti riceverai più avanti.
5. **Decidi se il file potrebbe avere bisogno della rete.** Se verrà mandato per email, archiviato o aperto su un laptop bloccato, metti tutto inline; un solo font collegato da un CDN basta a farlo renderizzare diversamente per la persona a cui l'hai mandato.
6. **Conta le installazioni rispetto alla frequenza.** Una conversione una tantum non dovrebbe richiedere un gestore di pacchetti; una build notturna non dovrebbe richiedere una scheda del browser e una persona dentro. Sbagliare questo al contrario costa o un pomeriggio o una faccenda ricorrente.
7. **Testa aprendo l'output da qualche altra parte.** Non nell'anteprima dello strumento — un browser diverso, una macchina diversa, la rete spenta, una volta su un telefono. Quel singolo test coglie frammenti, charset mancanti, link CDN e percorsi immagine rotti allo stesso tempo, e richiede un minuto. Se stai ancora scegliendo tra strumenti, [il confronto onesto è un pezzo a parte](/blog/best-markdown-to-html-converters).

## Conclusione

Un convertitore da Markdown a HTML è una pipeline a quattro fasi, e ogni conversione deludente è una fase identificabile che fa qualcosa di ragionevole che non volevi: un parser che gira su un dialetto più piccolo, un renderer che inventa id che non corrispondono ai tuoi link, un sanificatore che rimuove un embed, o un wrapper che non è mai stato scritto perché una libreria giustamente ha rifiutato di indovinare. Leggi l'output invece dell'elenco delle funzionalità, e leggilo nella vista sorgente HTML dove il doctype, il charset e l'HTML grezzo sopravvissuto sono tutti visibili insieme. Se vuoi tutte e quattro le fasi fatte in un solo passaggio, sulla tua stessa macchina, con un file autonomo alla fine, [la conversione da Markdown a HTML di TransformPipe](/) è gratis, non ha bisogno di installazione, e non carica niente mentre sei disconnesso.

## FAQ

### Cosa fa davvero un convertitore da Markdown a HTML al mio file?

Analizza il testo in un albero di nodi tipizzati, percorre quell'albero per scrivere i tag HTML, filtra il risultato contro una allow-list di tag e attributi, e avvolge il frammento in un documento completo. La prima fase decide quale sintassi esiste affatto, e l'ultima decide se il file si apre correttamente per qualcun altro. Uno strumento può fare un qualsiasi sottoinsieme delle quattro e chiamarsi comunque convertitore.

### Perché lo stesso file Markdown produce HTML diverso in due strumenti?

Perché due delle fasi comportano scelte che nessuna specifica fa. I parser potrebbero girare su dialetti diversi, quindi uno vede una tabella dove l'altro vede un paragrafo, e i renderer inventano id dei titoli, classi dei blocchi di codice e markup delle checkbox secondo le proprie convenzioni. Entrambi gli output possono essere HTML corretto e comunque essere in disaccordo riga per riga.

### Devo sanificare il Markdown che ho scritto io stesso?

Per un file che hai scritto tu e che aprirai solo tu, no — non c'è niente dentro che non ci hai messo tu. Sanifica nel momento in cui il documento viene da qualcun altro, è assemblato da più fonti, oppure verrà servito ad altre persone, perché il Markdown permette l'HTML grezzo e l'HTML grezzo permette gli script. Il costo di sanificare un file sicuro è zero; il costo di non sanificare uno non sicuro è eseguire il codice del suo autore.

### Perché le mie checkbox delle liste di attività sono sparite dopo la conversione?

Quasi sempre perché la allow-list del sanificatore non include `input`. GFM renderizza una voce spuntata come `<input type="checkbox" checked disabled>`, e una allow-list prudente scarta in blocco gli elementi di modulo. Un convertitore che supporta le liste di attività per bene permette `input` con `type` fissato a `checkbox` e nient'altro.

### Cosa deve esserci nella head prima che un file HTML si apra correttamente?

Un doctype sulla prima riga, così il browser non cade in quirks mode; `<meta charset="utf-8">` abbastanza presto da essere visto, così i caratteri accentati e i trattini non si trasformano in rumore; un titolo, perché nomina la scheda e il file salvato; un meta tag viewport, così è leggibile su un telefono; e degli stili, inline se il file deve viaggiare. Mancane uno qualsiasi e il file si apre comunque — solo non nel modo in cui l'hai visto tu.

### Perché i miei link ancora smettono di funzionare dopo la conversione?

Perché gli id dei titoli sono un'invenzione del renderer, non tua, e le regole degli slug differiscono. Uno strumento trasforma “Release 2.1” in `release-21`, un altro in `release-2.1`, e uno strumento che mette un prefisso agli id per sicurezza produce qualcos'altro ancora. Converti un documento e clicca ogni link interno prima di fidarti dello schema.

### Convertire Markdown in HTML cambia le parole?

Può succedere. Le opzioni tipografiche riscrivono le virgolette dritte come curve e `--` come un trattino medio, un'opzione `breaks` trasforma gli a capo singoli in `<br>`, e le definizioni di link non referenziate spariscono del tutto. Il testo è lo stesso per un lettore e non lo stesso per un terminale, il che è il motivo per cui le righe di comando in un documento convertito vale la pena controllarle carattere per carattere.
