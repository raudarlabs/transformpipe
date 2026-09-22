---
title: "Turndown e cinque librerie da HTML a Markdown: che cosa perdono"
description: "Sei librerie a confronto su tabelle, liste annidate, blocchi di codice e spazi, con addRule, keep e remove di Turndown mostrati sull’HTML che li richiede."
date: 2026-08-21
tag: Codice
keywords: libreria html markdown, turndown npm, turndown addrule, node-html-markdown, html-to-md, html2text python, pandoc html in markdown
---

L'HTML che devi convertire non è mai l'HTML del README. Ha un `<div class="callout">` che significa qualcosa, un blocco di codice fatto di duecento elementi `<span>`, una tabella con una cella di intestazione unita, e un paragrafo vuoto ogni tre elementi perché un CMS ce l'ha messo. Ogni libreria di questa pagina convertirà quella pagina in Markdown. Produrranno cinque file diversi, e le differenze non sono cosmetiche.

### In breve

Scegli in base alla forma dell'input e a dove gira il codice. **Turndown** è la scelta predefinita in JavaScript perché le sue regole sono sostituibili elemento per elemento, il che è l'unica cosa che rende trattabile un HTML fuori dal comune — ma le tabelle richiedono `turndown-plugin-gfm`. **node-html-markdown** porta con sé il proprio parser (`node-html-parser`), quindi gira dove non c'è un DOM e gestisce le tabelle senza plugin. **html-to-md** è l'opzione piccola, senza dipendenze, e il suo `skipTags` predefinito già elimina l'arredamento della pagina. **html2text** è la risposta Python quando l'output è per la lettura invece che per il round-trip. **Pandoc** come sottoprocesso è la risposta quando Markdown non è l'ultimo formato che il documento deve diventare.

L'errore che frega la gente non è una funzione mancante. È l'idea che queste librerie siano intercambiabili, quindi la scelta si può fare tardi e cambiare a poco prezzo. Non è così: la configurazione in questo campo è codice, non flag, e il codice è diverso per ogni libreria. Una regola che mappa `<div class="warning">` su una citazione è trenta righe contro l'API di Turndown e trenta righe diverse contro quella di node-html-markdown.

La seconda cosa da sapere prima di installare qualunque cosa è quale di queste librerie ha bisogno di un DOM. Turndown lavora attraverso uno — in Node porta `@mixmark-io/domino` come dipendenza per fornirglielo. È comodo, ed è anche un vincolo su dove il codice può girare e quanta memoria costa un documento grande. Le librerie che possiedono il proprio parser fanno lo scambio opposto. Se stai scegliendo fra strumenti invece che fra librerie, [il confronto più ampio dei convertitori da HTML a Markdown](/blog/best-html-to-markdown-converters) copre le estensioni, le CLI e le opzioni ospitate; questo articolo riguarda il codice che importi.

## Sei librerie, e cosa sono

Quattro di queste sono librerie che chiami, una è un pacchetto Python con una CLI attaccata, e una è un binario a cui ti rivolgi con uno shell out. Quella distinzione conta più di qualunque funzione nella tabella, perché decide cosa succede quando la conversione fallisce: una libreria lancia un'eccezione, un sottoprocesso restituisce un codice di uscita e una riga su standard error che qualcuno deve leggere.

| Libreria | Linguaggio | Ideale per | Capacità principale | Licenza |
| --- | --- | --- | --- | --- |
| Turndown | JavaScript | Controllo elemento per elemento su HTML fuori dal comune | `addRule`, `keep`, `remove`, e tre opzioni di sostituzione | Gratis, MIT |
| turndown-plugin-gfm | JavaScript | Tabelle, barrato e liste di attività dentro Turndown | `gfm`, `tables`, `strikethrough`, `taskListItems` | Gratis, MIT |
| node-html-markdown | TypeScript | Volume, e ambienti senza DOM | Include `node-html-parser`; un traduttore per elemento | Gratis, MIT |
| html-to-md | JavaScript | Un convertitore che è un dettaglio dentro un bundle | Zero dipendenze; `skipTags` e `aliasTags` | Gratis, MIT |
| html2text | Python | Output di testo leggibile da uno script o da una shell | CLI e libreria; `--backquote-code-style`, `--body-width` | Gratis, GPLv3 |
| Pandoc | Binario Haskell | HTML che deve diventare più di Markdown | `-f html -t gfm`, legge da standard input | Gratis, GPL |

Due delle sei non sono davvero in competizione fra loro. `turndown-plugin-gfm` fa parte di Turndown per qualunque input realistico, perché l'HTML senza tabelle è raro abbastanza che trattare il supporto delle tabelle come opzionale sia una decisione che finirai per ribaltare. Pandoc non è affatto una libreria in questo contesto; è un processo, e il costo di usarlo si misura in lanci di processo invece che in byte di bundle.

## Turndown in profondità: rules, keep, remove e le sostituzioni speciali

Turndown converte una stringa HTML o un nodo DOM — un elemento, un documento, o un frammento di documento — in Markdown. Quella flessibilità in ingresso è il primo dettaglio pratico: in un'estensione del browser puoi passargli un elemento vivo invece di serializzare la pagina e riparsarla, il che risparmia una copia del documento e conserva tutto ciò che gli script della pagina stessa hanno già cambiato.

Tutto il resto di Turndown è il sistema di regole, quindi vale la pena capire come viene scelta una regola prima di scriverne una.

### Come Turndown sceglie una regola

Le regole vengono provate in un ordine fisso, e l'ordine spiega la maggior parte dell'output sorprendente:

1. La **regola blank**, che sovrasta tutto il resto.
2. Le **regole aggiunte**, nell'ordine in cui le hai aggiunte.
3. Le **regole CommonMark** integrate.
4. Le **regole keep**.
5. Le **regole remove**.
6. La **regola predefinita**.

Ne seguono due conseguenze immediate. Primo, le tue regole battono quelle integrate, quindi non devi mai forkare niente per cambiare come viene emesso `<a>` o `<pre>` — aggiungi una regola con lo stesso filtro e vince lei. Secondo, la regola blank batte le tue. Un nodo è blank se contiene solo spazi bianchi e non è un `<a>`, `<td>`, `<th>` o un elemento void. Quindi se la tua regola punta a `<div class="spacer">` e il div è vuoto, la tua regola non gira mai, e il motivo non è nel tuo codice.

### addRule con un nome di tag, una lista, o una funzione filtro

`addRule(key, rule)` prende un nome — usato solo perché una chiamata successiva possa sostituirla — e un oggetto con un `filter` e una `replacement`. Restituisce il servizio, quindi le chiamate si concatenano.

Il filtro ha tre forme. Una stringa corrisponde a un nome di tag. Un array corrisponde a diversi nomi di tag. Una funzione riceve il nodo e le opzioni e restituisce un booleano, ed è lì che sta il lavoro vero.

```js
import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
  strongDelimiter: '**',
  linkStyle: 'inlined',
});

// Un filtro stringa: un tag solo.
turndown.addRule('figcaption', {
  filter: 'figcaption',
  replacement: (content) => `\n\n_${content.trim()}_\n\n`,
});

// Un filtro array: più tag, un gestore solo.
turndown.addRule('smallprint', {
  filter: ['small', 'cite'],
  replacement: (content) => content,
});

// Un filtro funzione: l'unica forma che può vedere gli attributi.
turndown.addRule('warning', {
  filter: (node) =>
    node.nodeName === 'DIV' &&
    (node.getAttribute('class') || '').includes('warning'),
  replacement: (content) =>
    `\n\n> **Warning**\n>\n> ${content.trim().replace(/\n/g, '\n> ')}\n\n`,
});
```

La firma di `replacement` è `(content, node, options)`. `content` è il Markdown già convertito dei figli, ed è la parte che la gente sbaglia: non ricevi l'HTML interno, ricevi il risultato della sua conversione, quindi non puoi riesaminare la struttura dentro la tua stessa sostituzione. Se ti serve la struttura, guarda `node`; se ti serve il testo, guarda `content`.

Il filtro funzione è anche la risposta al requisito reale più comune, cioè che un nome di classe porta un significato per cui Markdown non ha vocabolario. Un `<div class="warning">` diventa un paragrafo ordinario sotto ogni impostazione predefinita di questo articolo, e il lettore perde l'unico segnale che quel paragrafo è quello che conta. Turndown si può istruire a mapparlo su una citazione. È una regola per classe, scritta da te, per sito — ed è comunque il rimedio più economico disponibile.

### Le opzioni, e le due che cambiano davvero l'output

L'oggetto delle opzioni copre `headingStyle` (`setext` o `atx`), `hr`, `bulletListMarker` (`-`, `+` o `*`), `codeBlockStyle` (`indented` o `fenced`), `fence` (tre backtick o `~~~`), `emDelimiter` (`_` o `*`), `strongDelimiter` (`**` o `__`), `linkStyle` (`inlined` o `referenced`), `linkReferenceStyle` (`full`, `collapsed` o `shortcut`) e `preformattedCode`.

La maggior parte di queste sono stile di casa e niente si rompe in un modo o nell'altro. Due non lo sono:

- `codeBlockStyle: 'fenced'` è quella da impostare deliberatamente. I blocchi di codice indentati non possono portare una lingua, quindi un blocco indentato perde l'evidenziazione all'arrivo e non si distingue da una voce di lista molto indentata agli occhi di un parser poco attento.
- `linkStyle: 'referenced'` sposta ogni URL in fondo al documento. Per una pagina con quaranta link inline è la differenza fra prosa leggibile e un muro di parentesi quadre — e per un file che va nel controllo di versione è la differenza fra un diff leggibile e uno che non lo è.

`preformattedCode` è quella silenziosa. Governa se lo spazio bianco dentro gli elementi `code` viene conservato invece che collassato, e se stai convertendo HTML dove l'indentazione dentro il codice inline ha un significato, il predefinito ti sorprenderà.

### keep, remove, e perché non sono opposti

`keep(filter)` e `remove(filter)` prendono entrambi le stesse tre forme di filtro di una regola, e fanno cose molto diverse.

```js
// Emetti questi come HTML grezzo, perché Markdown non ha un equivalente.
turndown.keep(['iframe', 'sup', 'sub', 'kbd']);

// Cancella questi e tutto ciò che contengono.
turndown.remove(['script', 'style', 'noscript', 'nav', 'footer']);
```

`keep` significa "metti l'HTML originale nel Markdown". Gli elementi block-level tenuti sono separati dal contenuto circostante da righe vuote, quindi l'output resta Markdown valido dal punto di vista strutturale. Quello che non è, è portabile: l'HTML grezzo dentro un file Markdown sopravvive solo se il prossimo renderer permette HTML grezzo, ed è trasformato in una zuppa di tag visibile se non lo permette. Tenere un `<iframe>` è una scommessa sulla destinazione.

`remove` significa che l'elemento e il suo contenuto sono spariti. Niente viene rimosso di default — questa è la parte da scrivere su un post-it. Turndown non elimina `<script>` per te. Dagli in pasto una pagina web salvata e il contenuto degli script arriva nel tuo Markdown come testo, il che non è di per sé un problema di sicurezza ma è certamente un problema di output, ed è il motivo per cui esistono tante segnalazioni di bug del tipo "perché c'è JavaScript nel mio Markdown". Se l'HTML viene da un posto che non controlli, rimuovere script e style è il minimo, e [cosa deve coprire davvero la sanificazione](/blog/sanitising-markdown-safely) vale la pena leggerlo prima di fidarti del risultato di una conversione in entrambi i casi.

Il punto di aggancio per personalizzare `keep` è `keepReplacement`, una funzione di sostituzione come qualunque altra, quindi puoi decidere che un elemento tenuto venga avvolto, indentato o annotato invece che emesso alla lettera.

### blankReplacement, e il problema del paragrafo vuoto

`blankReplacement` è l'opzione che risolve la categoria più fastidiosa di HTML scadente: l'elemento vuoto che un sistema di gestione contenuti inserisce per la spaziatura. La regola blank cattura quei nodi prima di qualunque altra regola, e la sua sostituzione decide cosa diventano.

Il predefinito mantiene la separazione dei blocchi — un nodo block-level vuoto produce comunque un'interruzione di paragrafo, un nodo inline vuoto non produce niente. Di solito è giusto e occasionalmente è l'esatta causa di un documento pieno di vuoti.

```js
const turndown = new TurndownService({
  // Elimina del tutto i blocchi vuoti invece di lasciare un'interruzione di paragrafo.
  blankReplacement: () => '',
});
```

Il costo è reale e va conosciuto prima di impostare questa opzione: hai appena rimosso il meccanismo che separava due blocchi il cui unico separatore era un nodo vuoto. Su un HTML con struttura ordinata non cambia niente. Su un HTML dove un `<p>&nbsp;</p>` faceva il lavoro di un'interruzione di paragrafo, ottieni due paragrafi fusi insieme. Converti un documento rappresentativo in entrambi i modi e leggi il risultato invece di ragionarci sopra.

`defaultReplacement` è la terza delle opzioni speciali e la meno usata. Scatta per gli elementi che nessuna regola ha intercettato, e il predefinito emette il contenuto testuale del nodo, separato da righe vuote se il nodo è block-level. Sovrascriverla è come scopri cosa contiene davvero il tuo HTML: restituisci una stringa marcatore invece del contenuto, converti, e cerca il marcatore con grep. Ogni corrispondenza è un elemento che nessuna delle tue regole ha gestito.

### Il plugin GFM: tabelle, barrato, liste di attività

Il nucleo di Turndown implementa CommonMark, e CommonMark non ha tabelle. `turndown-plugin-gfm` fornisce il resto.

```js
import TurndownService from 'turndown';
import { gfm, tables, strikethrough, taskListItems } from 'turndown-plugin-gfm';

const turndown = new TurndownService();

// Tutto ciò che il plugin fornisce:
turndown.use(gfm);

// Oppure solo quello che vuoi:
// turndown.use([tables, strikethrough, taskListItems]);
```

`use` accetta un plugin o un array di plugin, e restituisce il servizio, quindi si concatena con `addRule`. La forma selettiva conta più di quanto sembri: `tables` è la regola più costosa dell'insieme, e se sai che l'input non ha tabelle — messaggi di chat, corpi di commenti, gestori di incolla di un editor — lasciarla fuori rimuove un'intera classe di casi limite dall'output.

Quello che il plugin non può fare è inventare l'espressività che a Markdown manca. Le tabelle GFM sono una griglia piatta di celle semplici: niente `rowspan`, niente `colspan`, niente contenuto a blocchi, niente tabella dentro una cella. [Cosa sopravvive davvero quando una tabella attraversa i formati](/blog/markdown-tables-that-survive-conversion) è la forma del problema, e vale allo stesso modo per ogni libreria di questa pagina.

### L'escaping, e l'unica sovrascrittura da maneggiare con cura

Turndown mette in escape con backslash i caratteri di sintassi Markdown dentro il testo, così che un asterisco letterale nel sorgente non diventi enfasi nell'output. Il testo dentro gli elementi `code` è esente, il che è corretto ed è anche il confine dove vivono la maggior parte delle lamentele: un nome di file come `my_file_name.txt` in prosa ordinaria esce come `my\_file\_name.txt`, che si visualizza correttamente e sembra sbagliato a chi apre il file grezzo.

`escape` è un metodo documentato e sostituibile, quindi la tentazione è ovvia:

```js
// Fallo solo se possiedi entrambi i capi della pipeline.
turndown.escape = (text) => text;
```

Questo produce Markdown dall'aspetto pulito che significa qualcosa di diverso dall'HTML da cui sei partito. I trattini bassi diventano enfasi, i trattini all'inizio riga diventano voci di lista, una riga che comincia con `#` diventa un titolo. Se il Markdown finisce dritto in un diff che una persona deve leggere e non torna mai attraverso un renderer, può essere difendibile. Se verrà visualizzato, è corruzione dei dati con un aspetto ordinato. Il rimedio più stretto — sottrarre una sola classe di caratteri dall'escaping predefinito invece di tutte — è quasi sempre la modifica della dimensione giusta.

**Per chi è Turndown.** Sviluppatori JavaScript che devono controllare l'output elemento per elemento: gestori di incolla di un editor, estensioni del browser, importer che leggono un CMS legacy. La sua diffusione è una funzione autentica, perché quando una pagina converte male qualcuno di solito ha già pubblicato la regola.

## node-html-markdown: niente DOM, un traduttore per elemento

node-html-markdown è un convertitore TypeScript il cui scopo dichiarato è il throughput. Dipende da `node-html-parser` e usa il `DOMParser` nativo quando ne è disponibile uno, controllato dall'opzione `preferNativeParser`. Questa è l'intera differenza architetturale rispetto a Turndown, e decide tre cose: gira in un worker o in una funzione serverless senza nessun shim del DOM, il suo profilo di memoria su un documento grande è un albero di parsing invece di un DOM completo, e la sua API di estensione è propria invece di quella di Turndown.

```js
import { NodeHtmlMarkdown } from 'node-html-markdown';

// Una tantum:
const md = NodeHtmlMarkdown.translate(html);

// Riusata — costruisci l'istanza una volta, traduci molte volte:
const nhm = new NodeHtmlMarkdown(
  {
    bulletMarker: '-',
    codeBlockStyle: 'fenced',
    strongDelimiter: '**',
    emDelimiter: '_',
    strikeDelimiter: '~~',
    maxConsecutiveNewlines: 2,
    keepDataImages: false,
    useInlineLinks: true,
  },
  {
    aside: { prefix: '> ', surroundingNewlines: 2 },
    button: { ignore: true },
    figcaption: { prefix: '_', postfix: '_' },
  }
);

const markdown = nhm.translate(html);
```

Il metodo statico `translate(html, options?, customTranslators?, customCodeBlockTranslators?)` è comodo e ricostruisce tutto a ogni chiamata. Se stai convertendo più di una manciata di documenti, costruisci l'istanza una volta — è la differenza per cui la libreria esiste.

L'oggetto traduttore è dove node-html-markdown si distacca più utilmente da Turndown. Invece di un filtro e una sostituzione, un traduttore è una dichiarazione di campi, ognuno con un solo compito: `prefix` e `postfix` stanno ai due lati del contenuto, `content` fissa un output fisso, `surroundingNewlines` aggiunge a capo prima e dopo (un booleano, o un numero per lato), `recurse: false` blocca del tutto la scansione degli elementi figli, `ignore` salta completamente il nodo, `noEscape` disattiva l'escaping per quell'elemento, `preserveWhitespace` mantiene lo spazio bianco così com'è, `preserveIfEmpty` visita il traduttore anche quando l'elemento è vuoto, `spaceIfRepeatingChar` inserisce uno spazio quando il primo carattere collide con l'ultimo scritto, `childTranslators` scambia una diversa raccolta di traduttori per i figli, e `postprocess` gira dopo che i nodi interni sono stati resi.

Quest'ultima coppia è dove l'API si guadagna il suo posto. `postprocess` può restituire `PostProcessResult.RemoveNode` per eliminare un nodo dopo aver visto in cosa si è tradotto — che è la risposta a "cancella questo elemento se alla fine è risultato vuoto", una decisione che non puoi prendere con un filtro che gira prima della conversione. `childTranslators` permette a una `<table>` di trattare i propri discendenti con regole diverse dal resto del documento, senza toccare la configurazione globale.

Le due opzioni da impostare deliberatamente sono `maxConsecutiveNewlines`, che è il controllo sugli spazi bianchi che le altre librerie JavaScript non espongono direttamente, e `keepDataImages`. Una pagina con immagini base64 incorporate produrrebbe altrimenti un file Markdown dove una singola riga di immagine è più lunga del resto del documento messo insieme.

**Per chi è.** Conversione in blocco, e qualunque runtime senza DOM: un worker, una edge function, un consumatore di coda che macina un crawl. È anche ciò su cui gira il convertitore di questo stesso sito, esattamente per quel motivo — lo stesso percorso di codice in una scheda del browser e su un server.

## html-to-md: la piccola, e le opzioni che fanno il lavoro

html-to-md è un convertitore JavaScript a zero dipendenze con una singola funzione esportata. La sua API è tre argomenti e nessuna istanza:

```js
import html2md from 'html-to-md';

const markdown = html2md(html, {
  skipTags: ['div', 'section', 'nav', 'footer', 'aside', 'header', 'main'],
  ignoreTags: ['script', 'style', 'svg', 'noscript', 'head', 'meta', 'form'],
  aliasTags: { figure: 'p', figcaption: 'p', dl: 'p', dt: 'p', dd: 'p' },
});
```

Le due opzioni da capire sono `skipTags` e `ignoreTags`, perché suonano simili e fanno cose opposte al tuo contenuto. `skipTags` omette il tag dalla conversione e conserva ciò che c'è dentro — che è quello che vuoi per `<div>` e `<section>`, elementi che portano layout e nessun significato. `ignoreTags` scarta il tag e tutto il suo contenuto interno, che è quello che vuoi per `<script>`, `<style>` e `<svg>`. Scambiale e o cancelli l'articolo o incolli un foglio di stile dentro di esso.

I valori predefiniti sono insolitamente opinati in un modo che risparmia lavoro: `skipTags` contiene già gli elementi strutturali — `div`, `html`, `body`, `nav`, `section`, `footer`, `main`, `aside`, `article`, `header` — e `ignoreTags` contiene già `style`, `head`, `script`, `meta`, `svg`, `noscript` e `form`. Fuori dalla scatola è più vicino a rendere leggibile una pagina salvata di quanto lo siano le altre librerie JavaScript, il che è l'opposto dello scambio abituale per una piccola dipendenza.

`aliasTags` mappa un tag su un gestore che esiste già, ed è la via di fuga per una lista di tag supportati invece che un sistema di regole. La libreria documenta cosa gestisce: `a`, `b`, `blockquote`, `code`, `del`, `em`, da `h1` a `h6`, `hr`, `i`, `img`, `input`, `li`, `ol`, `p`, `pre`, `s`, `strong`, `table`, `tbody`, `td`, `th`, `thead`, `tr`, `ul`. Qualunque cosa fuori da quella lista ha bisogno di un alias, di uno skip, o di `renderCustomTags` per decidere cosa succede agli elementi sconosciuti. `tagListener` ti passa un singolo tag da gestire tu, e la precedenza delle opzioni è documentata come `skipTags` prima di `emptyTags` prima di `ignoreTags` prima di `aliasTags`, che è l'ordine in cui ragionare quando due delle tue liste nominano lo stesso elemento.

Il terzo argomento di `html2md` decide se i tuoi array sostituiscono del tutto i predefiniti invece di essere uniti a essi. È un interruttore più grande di quanto sembri: passa `skipTags: ['div']` senza di esso e potresti ancora dipendere da altri nove predefiniti che non hai mai letto.

**Per chi è.** Codice front-end dove la dimensione del bundle è un vincolo reale, e HTML ragionevolmente ben formato. Non è esplicitamente lo strumento per markup malformato o annidato male — la guida della libreria stessa dice che si aspetta HTML valido, e non ha un parser DOM alle spalle a riparare il disastro.

## Fuori da JavaScript: html2text e Pandoc

### html2text, per Python e per output che le persone leggono

html2text è una libreria Python con un front end da riga di comando. Il suo scopo è testo leggibile che risulta essere Markdown valido, e i suoi predefiniti riflettono quella priorità invece della fedeltà.

```bash
html2text --backquote-code-style --body-width=0 --pad-tables page.html > page.md
```

```python
import html2text

h = html2text.HTML2Text()
h.body_width = 0             # nessun a capo forzato
h.backquote_code_style = True  # blocchi di codice con fence
h.ignore_images = True
h.escape_snob = False

markdown = h.handle(html)
```

Tre flag portano la maggior parte della differenza fra output usabile e output che non lo è.

`--backquote-code-style` è quella importante per chi converte documenti tecnici: produce blocchi di codice multiriga in stile triplo backtick. Senza di essa dipendi da blocchi indentati, oppure da `--mark-code`, che marca i blocchi di codice del programma con delimitatori letterali `[code]` e `[/code]` — utile se stai post-processando, sbagliato se sarà una persona a leggere il file.

`--body-width` imposta il numero di caratteri per riga di output e prende `0` per nessun a capo forzato. Questo è il flag che decide se il Markdown è diffabile. La prosa con a capo forzato significa che una modifica di una parola riavvolge un intero paragrafo e il diff mostra cinque righe cambiate. Impostalo a zero per qualunque cosa vada nel controllo di versione.

Per le tabelle ci sono tre posizioni separate: `--pad-tables` imbottisce le celle a larghezza di colonna uguale, `--bypass-tables` formatta le tabelle in HTML invece che in sintassi Markdown, e `--ignore-tables` ignora i tag relativi alle tabelle mantenendo le righe. L'ultima vale la pena conoscerla perché è la risposta onesta per le tabelle usate per il layout invece che per i dati — mantieni il contenuto e abbandoni la griglia.

Altre due meritano una riga. `--reference-links` usa link in stile riferimento invece che inline, e `--protect-links` circonda i link con parentesi angolari così l'a capo non può romperli. `--escape-all` mette in escape tutti i caratteri speciali: meno leggibile, ma evita i fallimenti di formattazione dei casi limite.

La licenza è la cosa da controllare per prima, non per ultima. html2text è GPLv3, che alcuni progetti non possono prendere.

**Per chi è.** Codice Python che produce testo per persone o per un indice: digest, corpi di notifica, parti in testo semplice di un'email, un corpus per un motore di ricerca. Se ti serve una copia strutturale fedele invece che leggibile, è lo scambio sbagliato.

### Pandoc come sottoprocesso

Pandoc non è una libreria che importi; è un binario che lanci. Nella direzione da HTML a Markdown l'invocazione è breve:

```bash
pandoc -f html -t gfm --wrap=none input.html -o output.md

# oppure leggi da standard input, che è quello che vuoi dal codice
cat input.html | pandoc -f html -t gfm --wrap=none
```

Da Node, passa gli argomenti come array così nessuna shell è coinvolta e l'HTML non deve mai essere messo tra virgolette:

```js
import { execFileSync } from 'node:child_process';

const markdown = execFileSync(
  'pandoc',
  ['-f', 'html', '-t', 'gfm', '--wrap=none'],
  { input: html, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }
);
```

Da Python:

```python
import subprocess

markdown = subprocess.run(
    ["pandoc", "-f", "html", "-t", "gfm", "--wrap=none"],
    input=html,
    capture_output=True,
    text=True,
    check=True,
).stdout
```

Quattro cose su questo schema vale la pena tenerle a mente.

**Il processo è il costo.** Una conversione è gratis. Diecimila conversioni sono diecimila lanci di processo, ognuno con il proprio avvio, ed è il punto in cui una libreria in-process vince a prescindere da quanto buono sia l'output di Pandoc. Raggruppa il lavoro in meno chiamate oppure usa una libreria.

**`maxBuffer` e la pipe sono limiti reali.** Un documento grande restituito attraverso una pipe deve entrare nel buffer che hai permesso. Il predefinito in Node non è generoso, e il fallimento è un documento troncato invece di un'eccezione che noteresti in fase di test.

**Non costruire mai il comando come stringa.** Passare un array, come sopra, significa che l'HTML viaggia su standard input e nessuna shell lo interpreta. Costruire `pandoc ... "${html}"` con interpolazione è un'iniezione di comandi in attesa del primo documento che contiene un backtick.

**Controlla il codice di uscita.** `check=True` in Python e il comportamento di lancio-su-non-zero di `execFileSync` fanno un lavoro necessario. Un sottoprocesso che fallisce in silenzio ti dà un file vuoto, e un file vuoto sembra un documento senza contenuto invece che un errore.

Il motivo per accettare tutto questo è `-t gfm` e tutto ciò che sta a valle. Pandoc legge HTML e scrive verso una lunga lista di altri formati, quindi la stessa pipeline che produce Markdown può produrre DOCX, LaTeX o EPUB dalla stessa fonte identica, e `--sandbox` limita l'accesso al filesystem quando l'input non è tuo. `--wrap=none` conta per lo stesso motivo per cui conta `--body-width=0` in html2text.

**Per chi è.** Pipeline di build, job pianificati, e qualunque progetto dove Markdown è uno fra diversi output. Non per una conversione per richiesta in un servizio web.

## Tabelle, blocchi di codice, liste annidate e spazi bianchi

Questo è il confronto che decide i progetti reali, e non è quello con cui i README delle librerie aprono.

| Aspetto | Turndown | node-html-markdown | html-to-md | html2text | Pandoc |
| --- | --- | --- | --- | --- | --- |
| Tabelle | Serve un plugin (`tables` o `gfm`) | Gestite dai traduttori predefiniti | `table`, `thead`, `tbody`, `tr`, `th`, `td` supportati | Tabelle Markdown, più `--pad-tables`, `--bypass-tables`, `--ignore-tables` | Tabelle a pipe con `-t gfm` |
| Blocchi di codice | `codeBlockStyle: 'fenced'`, lingua letta da una classe `language-*` | `codeBlockStyle`, più traduttori dedicati ai blocchi di codice | `pre` e `code` nella lista dei tag supportati | Indentati di default; `--backquote-code-style` per i fence | Con fence, con la lingua quando la classe lo dice |
| Liste annidate | Indenta il contenuto annidato, incluso lo scarto del marcatore | Gestite dai traduttori delle liste | `ul`, `ol`, `li` supportati | Gestite, con l'a capo controllato da `--wrap-list-items` | Gestite |
| Spazi bianchi | Collassati; `preformattedCode` per `code` | `maxConsecutiveNewlines`, `preserveWhitespace` per traduttore | Non esposto direttamente | `--body-width`, `--single-line-break` | `--wrap=none` |
| Gira nel browser | Sì, e accetta un nodo DOM vivo | Sì, `DOMParser` nativo quando disponibile | Sì, attraverso un bundler | No | No |
| Parser | Un DOM (`@mixmark-io/domino` in Node) | `node-html-parser` | Il proprio, senza dipendenze | Quello proprio di Python | Il lettore HTML di Pandoc |

Quattro note sulla lettura di quella tabella.

**Le tabelle sono una decisione da plugin, non una casella da funzione.** Turndown senza `turndown-plugin-gfm` non degrada silenziosamente una tabella in qualcosa di leggibile — ottieni il testo delle celle fuso con la prosa circostante, il che sembra il convertitore che perde i tuoi dati perché è esattamente ciò che sta succedendo. Questa è la sorpresa di Turndown più comune, ed è del tutto evitabile in una riga.

**I blocchi di codice dipendono dal nome della classe, non dal tag.** Ogni evidenziatore di sintassi emette un blocco di codice come `<pre><code class="language-python">` avvolto intorno a un nido di elementi `<span>` per ogni token. Un convertitore che legge la classe ti dà un fence annotato e l'evidenziazione all'altro capo; uno che non lo fa ti dà un fence nudo e una perdita che noterai solo quando la pagina è pubblicata. [Cosa serve a un blocco di codice per sopravvivere alla conversione](/blog/code-blocks-in-markdown) è una lista breve, e la classe della lingua è in cima.

**L'indentazione delle liste annidate è dove i file smettono di essere portabili.** I parser Markdown non concordano su quanta indentazione fa una lista figlia invece di un blocco di codice, e un convertitore che indenta il contenuto annidato con una quantità diversa da quella attesa dal tuo renderer produce un documento che sembra giusto in un posto e sbagliato in un altro. Converti una lista a tre livelli e apri il risultato nel renderer che pubblicherà davvero.

**Gli spazi bianchi sono un problema di diff prima che di aspetto.** Tutte e cinque produrranno qualcosa che un browser visualizza in modo identico. Solo alcune producono qualcosa dove una modifica di una frase appare come un diff di una riga sola. Se il Markdown finisce in un repository, il controllo degli spazi bianchi — `--wrap=none`, `--body-width=0`, `maxConsecutiveNewlines` — non è configurazione cosmetica.

## Dove la risposta ovvia della libreria fallisce

La risposta ovvia in JavaScript è Turndown, ed è la scelta predefinita giusta. Ecco dove lei, e l'intera categoria, smettono di bastare.

**Una libreria converte quello che le dai, e una pagina salvata per lo più non è l'articolo.** Nessuno di questi strumenti ha una fase di estrazione. Passa a uno qualunque di loro una pagina di notizie salvata e ottieni la testata, la navigazione, l'avviso sui cookie, l'invito all'abbonamento, l'elenco di articoli correlati e un piè di pagina di sessanta link, tradotti fedelmente in Markdown, con l'articolo da qualche parte in mezzo. `remove` e `skipTags` aiutano; non sono un estrattore di contenuto. Se l'input sono pagine intere, ti serve qualcosa che trovi prima l'articolo, e [salvare una pagina web come Markdown](/blog/save-a-web-page-as-markdown) è un lavoro diverso con strumenti diversi.

**La configurazione è codice, e il codice è un costo di manutenzione.** Trenta regole che mappano i nomi di classe di un sito su costrutti Markdown sono un piccolo programma. Funziona finché il sito non viene ridisegnato, momento in cui i nomi delle classi cambiano e il tuo convertitore smette silenziosamente di riconoscere i callout. Nessuno se ne accorge, perché l'output è ancora Markdown valido. I set di regole legati al markup di qualcun altro hanno una data di scadenza che non è scritta da nessuna parte.

**Il DOM è un costo di memoria che non avevi messo a budget.** Il parsing di Turndown su un documento grande è un DOM completo, il che significa un oggetto nodo per ogni elemento e ogni riga di testo invece dei byte che gli hai dato. Va bene su un portatile ed è esattamente il tipo di cosa che fallisce in un runtime di funzione con vincoli — e fallisce sui documenti più grandi del corpus invece che sui primi, quindi un'importazione può girare felicemente per molto tempo prima di rompersi. Misura con l'input reale più grande che hai invece che con uno rappresentativo.

**L'escaping produce un output che è corretto e sembra sbagliato.** Ogni libreria mette in escape la punteggiatura Markdown nel testo, perché deve. Il risultato è `my\_file\_name.txt` e `1\. Introduzione`, che si visualizzano correttamente e si leggono male per chiunque apra il file grezzo. Se una persona revisionerà il Markdown, lo segnalerà come un bug del tuo convertitore, ripetutamente. Non lo è, e dirglielo non aiuta.

**Niente qui sanifica.** Turndown non rimuove nessun elemento di default. Il lavoro di un convertitore è tradurre, non mettere in sicurezza, e Markdown che porta HTML grezzo attraverso — perché hai usato `keep`, o perché la libreria emette HTML grezzo per ciò che Markdown non può esprimere — è Markdown che può portare un tag `<script>` al prossimo renderer. Il costo di sbagliare questo non è un file dall'aspetto brutto.

**E il round trip non è un round trip.** Convertire da HTML a Markdown e ritorno non restituisce l'HTML da cui sei partito, in nessuna di queste librerie, mai. Layout, classi, id, stili inline, celle che si estendono, form e embed non hanno una rappresentazione Markdown. Se qualcuno si aspetta HTML in entrata ed HTML equivalente in uscita, correggi quell'aspettativa prima di scrivere codice, perché nessuna configurazione ci arriva.

## Come scegliere una libreria

1. **Parti da dove gira il codice, perché elimina opzioni prima di qualunque funzione.** Un worker o una edge function senza DOM esclude il percorso basato su DOM; un bundle da browser con un budget di dimensione esclude qualunque cosa trascini dietro un albero di parsing; uno script di build non esclude niente e può appoggiarsi a Pandoc con uno shell out.
2. **Decidi se ti servono regole per elemento, ed è onesto con te stesso.** Se l'HTML è generato da un sistema solo che controlli tu, i predefiniti probabilmente bastano e l'API delle regole di Turndown è complessità che non userai. Se l'HTML viene da molte fonti con nomi di classe significativi, quell'API è l'intera ragione per scegliere Turndown.
3. **Converti il tuo documento peggiore prima di impegnarti, non quello più semplice.** Scegli la pagina con una tabella, un blocco di codice evidenziato, una lista a tre livelli e un callout. Qualunque cosa mantenga quei quattro mantiene quasi tutto il resto, e lo saprai in dieci minuti invece che dopo duecento documenti.
4. **Imposta le opzioni di a capo e spazi bianchi il primo giorno.** `--wrap=none`, `--body-width=0`, `maxConsecutiveNewlines`: sceglierle dopo aver convertito il corpus significa convertirlo due volte, perché riavvolgere cambia ogni riga di ogni file e seppellisce le modifiche vere.
5. **Controlla la licenza contro il tuo progetto prima di controllare le funzioni.** html2text è GPLv3 e Pandoc è GPL; Turndown, node-html-markdown e html-to-md sono MIT. Per una libreria che spedisci dentro un prodotto, quella differenza decide la rosa a prescindere dalla qualità dell'output.
6. **Scrivi cosa succede a quello che Markdown non può esprimere.** Scartato, tenuto come HTML grezzo, o approssimato da una regola che hai scritto tu — scegli deliberatamente per ogni classe di elemento. Lasciato indeciso, la libreria decide al posto tuo, e decide diversamente in ognuna delle cinque.

## Conclusione

Non esiste la migliore libreria da HTML a Markdown, solo la distanza più corta fra il tuo input e il file che ti serve. In JavaScript, parti da Turndown e dal plugin GFM, e rivolgiti alla sua API delle regole solo quando un nome di classe porta un significato; passa a node-html-markdown quando non c'è DOM o il volume è reale; scegli html-to-md quando il convertitore è un dettaglio dentro un bundle. In Python, html2text se l'output è per la lettura e la sua licenza GPLv3 è accettabile. Rivolgiti a Pandoc con uno shell out quando Markdown non è l'ultimo formato che il documento diventa. E quando il compito è un file solo invece di una pipeline, una libreria è la forma sbagliata di risposta del tutto — [la conversione da HTML a Markdown di TransformPipe](/html-to-markdown) gira nel browser senza niente caricato e niente installato, il che è una strada più veloce verso lo stesso Markdown di qualunque `npm install`.

## FAQ

### Qual è la migliore libreria da HTML a Markdown per JavaScript?

Turndown, per la maggior parte dei progetti: gira nel browser e in Node, e la sua API delle regole ti permette di sovrascrivere il gestore per qualunque elemento senza forkare la libreria. Aggiungi `turndown-plugin-gfm` a meno che tu non sia certo che l'input non abbia tabelle. Scegli node-html-markdown invece quando non c'è nessun DOM disponibile o stai convertendo in blocco.

### Turndown supporta le tabelle?

Non nel nucleo, che implementa CommonMark, e CommonMark non ha tabelle. `turndown-plugin-gfm` le aggiunge, insieme a barrato e voci di lista di attività; `turndownService.use(gfm)` abilita tutte e tre, oppure puoi importare `tables` da sola. Senza il plugin, il testo di una cella viene fuso con la prosa circostante.

### Come faccio ignorare un elemento a Turndown?

`remove(filter)` cancella l'elemento e il suo contenuto, e prende un nome di tag, un array di nomi di tag o una funzione filtro. Niente viene rimosso di default, quindi `remove(['script', 'style', 'noscript'])` vale la pena aggiungerlo a qualunque convertitore che gestisce HTML che non hai scritto tu. Usa `keep(filter)` invece quando vuoi l'HTML originale nell'output invece di niente.

### Cosa fa blankReplacement in Turndown?

Decide cosa succede ai nodi che contengono solo spazi bianchi — i paragrafi vuoti che un sistema di gestione contenuti lascia indietro. La regola blank gira prima di ogni altra regola, incluse le tue, quindi un elemento vuoto non arriva mai a una regola che hai scritto tu. Impostare `blankReplacement: () => ''` elimina quei vuoti, al costo di perdere la separazione dei blocchi dove un nodo vuoto era l'unica cosa a fornirla.

### Quali librerie da HTML a Markdown girano in un browser?

Turndown, node-html-markdown e html-to-md lo fanno tutte. Turndown accetta un elemento DOM vivo invece di una stringa, motivo per cui le estensioni del browser lo usano. html2text è Python e Pandoc è un binario, quindi nessuno dei due gira lato client; convertire nel browser senza una build significa una delle tre JavaScript, oppure [una pagina convertitore che ne include già una](/blog/best-html-to-markdown-converters).

### Cosa fa --backquote-code-style in html2text?

Fa sì che i blocchi di codice multiriga usino fence a triplo backtick invece dell'indentazione. Senza di esso ottieni blocchi indentati, che non possono portare un'annotazione di lingua, oppure marcatori `[code]` se hai passato `--mark-code`. Abbinalo a `--body-width=0` così il codice non viene forzatamente riavvolto alla lunghezza di riga predefinita.

### Vale la pena chiamare Pandoc dal codice invece di usare una libreria?

Sì quando Markdown non è l'unico output — la stessa chiamata può produrre DOCX, LaTeX o EPUB dallo stesso HTML — e no quando converti per richiesta. Ogni conversione è un lancio di processo, quindi il throughput è scarso rispetto a una libreria in-process. Passa gli argomenti come array e l'HTML su standard input, mai come stringa shell interpolata.
