---
title: "A capo e liste in Markdown: 14 sintomi, 14 regole"
description: "Un a capo diventato spazio, una lista diventata blocco di codice, numeri che si rinumerano da soli: il sintomo, la regola che lo causa e che cosa scrivere invece."
updated: 2026-09-09
date: 2026-07-11
tag: Sintassi
keywords: a capo markdown, nuova riga markdown, markdown due spazi, lista annidata markdown, lista numerata markdown, checkbox markdown, lista di attività markdown, carattere di escape markdown, rientro lista markdown, liste compatte e ariose, interruzione di riga forzata commonmark, tag br markdown, a capo debole markdown, a capo con barra rovesciata, lista markdown che non si annida, opzione breaks markdown, numerazione lista markdown
---

Markdown è piccolo abbastanza che la maggior parte delle persone lo impara per imitazione e non legge mai le regole. Funziona finché una riga si rifiuta di andare a capo, una lista arriva come un unico paragrafo lunghissimo, o un asterisco che intendevi in modo letterale si mangia mezza frase. Niente di tutto questo è un bug. Ogni caso è una regola che fa esattamente quello che dice, in un punto dove il file sorgente non lascia nessun indizio visivo che stia succedendo qualcosa.

### In breve

Un singolo a capo è uno spazio, non un'interruzione di riga: CommonMark lo chiama a capo debole (soft line break) e lascia ai motori di rendering la libertà di stamparlo come spazio bianco, che è quello che fa un file `.md` quasi ovunque. Per interrompere una riga dentro un paragrafo, chiudila con **due spazi** o con una **barra rovesciata**; per iniziarne una nuova, lascia una **riga vuota**. Una lista annidata rientra della larghezza del marcatore del genitore più gli spazi che lo seguono — **due sotto `- `, tre sotto `1. `** — e una sola riga vuota in un punto qualsiasi della lista rende ogni elemento arioso e ne avvolge il testo in un `<p>`. Tutto il resto di questa pagina è una di queste due regole applicata in un punto dove non stavi guardando.

Le regole sono scritte nero su bianco. CommonMark è la specifica che le stabilisce, e la versione 0.31.2 è quella attuale (verificato su spec.commonmark.org, il 9 settembre 2026). Ogni caso qui sotto è una regola numerata al suo interno, non la stranezza di uno strumento in particolare. Quello con cui una specifica non può aiutare è che nessuna di queste regole lascia un segno nella fonte. Uno spazio a fine riga sembra niente. Due spazi di rientro sembrano tre. Una riga vuota dentro una lista sembra solo ordine.

A capo e liste finiscono nello stesso articolo perché condividono un'aritmetica. Se una riga va a capo dipende da cosa c'è alla sua fine; se un elemento annidato si annida davvero dipende da quanto la sua riga comincia lontano dalla colonna di contenuto del genitore. Entrambe si contano in caratteri che non vedi, ed entrambe falliscono in silenzio — nessun errore, nessun avviso, solo un output diverso da quello che intendevi, notato di solito da qualcun altro.

## Il prontuario: il sintomo, e la regola che lo produce

| Symptom | The rule doing it | What to write instead |
| --- | --- | --- |
| Due righe sono diventate una | Un singolo a capo è un a capo debole, stampato come spazio | Due spazi finali, una barra rovesciata, o una riga vuota |
| Va a capo in un campo commenti e non in un file | Alcuni motori trasformano ogni a capo in `<br>`; un file `.md` no | Scrivi l'interruzione in modo esplicito e sopravvive a entrambi |
| Il primo elemento della lista è finito dentro il paragrafo sopra | Una lista numerata può interrompere un paragrafo solo se parte da `1` | Lascia una riga vuota sopra la lista |
| Tutta la lista è uscita in monospaziato | Quattro spazi al livello più alto sono un blocco di codice rientrato | Fai partire la lista entro tre spazi dal margine |
| L'elemento annidato è diventato un fratello | Il rientro del contenuto è la larghezza del marcatore più gli spazi dopo | Due spazi sotto `- `, tre sotto `1. ` |
| L'elemento annidato è diventato un blocco di codice | Il contenuto sta quattro o più colonne oltre la colonna di contenuto del genitore | Conta dalla colonna di contenuto, non dal margine |
| La lista ha guadagnato spazio verticale che nessuno voleva | Una riga vuota in un punto qualsiasi rende tutta la lista ariosa | Rimuovila, o accetta un `<p>` in ogni elemento |
| I numeri si sono rinumerati da soli | Solo il primo marcatore viene letto; il browser conta il resto | Scrivi `1.` per ogni elemento, deliberatamente |
| Una lista è diventata due, in silenzio | Cambiare il carattere del punto elenco o il delimitatore inizia una nuova lista | Un solo punto elenco e un solo delimitatore per file |
| Un anno a inizio riga è diventato l'elemento uno | `1986. ` è un marcatore valido per una lista numerata | `1986\. ` |
| Gli asterischi sono svaniti e le parole sono diventate corsive | `*` apre l'enfasi ovunque, anche dentro una parola | `\*stella\*`, oppure uno span di codice |
| La checkbox è stata stampata come `[ ]` | Le liste di attività sono un'estensione GFM, non CommonMark | Un convertitore che parla GFM |
| Una barra rovesciata è stata stampata a fine riga | Nessuna delle due sintassi di interruzione funziona a fine blocco | Metti l'interruzione tra due righe, mai dopo l'ultima |
| Il secondo paragrafo dell'elemento è caduto fuori dalla lista | Una riga di continuazione deve raggiungere la colonna di contenuto dell'elemento | Rientrala dove comincia il testo dell'elemento stesso |
| La sottolista sotto l'elemento dieci ha perso il rientro | `10. ` è una colonna più largo di `9. ` | Riconta il marcatore a dieci, o rientra tutto di quattro |
| Il marcatore dell'elemento annidato è stato stampato come trattino a metà frase | Testo rientrato troppo, senza riga vuota sopra, è continuazione di paragrafo | Rientra fino alla colonna di contenuto, non oltre |

Ogni riga è una regola della specifica CommonMark e non l'opinione di uno strumento, e il resto di
questa pagina è quelle regole con l'aritmetica scritta per intero.

## Tre modi per terminare una riga

Comincia dal paragrafo, perché ogni domanda sull'interruzione di riga è una domanda sui paragrafi travestita. Un paragrafo è una sequenza di righe consecutive non vuote. Finisce a una riga vuota e in nessun altro punto. Le terminazioni di riga al suo interno non sono contenuto: CommonMark chiama una fine riga dentro un paragrafo "a capo debole" e dice che un motore di rendering può presentarlo in vari modi. Il comportamento predefinito schiacciante, quello che fa un file `.md` ovunque venga rappresentato, è un singolo spazio.

Quindi questo:

```markdown
Roses are red
Violets are blue
```

è un solo paragrafo, due righe nella fonte e una riga nell'output. L'a capo sopravvive nell'HTML come spazio bianco, e il browser lo comprime come comprime qualsiasi sequenza di spazio bianco. Non si è perso niente e niente si è rotto. Il file semplicemente non è d'accordo con te su dove finisce una riga.

Due dettagli di questa definizione contano più avanti. Le righe di un paragrafo possono ciascuna iniziare
con fino a tre spazi di rientro senza cambiare nulla, motivo per cui una riga leggermente rientrata si
unisce ancora al paragrafo sopra invece di diventare qualcosa di nuovo. E lo spazio bianco su entrambi i
lati di una fine riga interna viene scartato: la specifica dice che gli spazi alla fine di una riga e
all'inizio della successiva vengono rimossi (verificato su spec.commonmark.org, il 9 settembre 2026).
Allineare la seconda riga di un paragrafo non cambia nulla nell'output, e disallinearla nemmeno.

Tre cose cambiano questo comportamento, e una quarta evita del tutto il problema.

| What you write | What the parser does with it | What you get |
| :--- | :--- | :--- |
| Una riga vuota | Termina il paragrafo | Un nuovo paragrafo, `<p>` |
| Due o più spazi a fine riga | Un'interruzione di riga forzata | `<br>` dentro lo stesso paragrafo |
| Una barra rovesciata a fine riga | Un'interruzione di riga forzata | `<br>` dentro lo stesso paragrafo |
| Un `<br>` letterale | HTML grezzo, passato o escapato | `<br>`, se il convertitore ammette HTML grezzo |

### Due spazi finali, l'interruzione che nessuno vede

La regola dei due spazi è l'interruzione forzata originale, ed è quella fragile. Lo spazio bianco a fine riga è invisibile, molti editor lo rimuovono al salvataggio, i linter lo segnalano, e chi legge un diff non può vedere cosa è cambiato.

Due dettagli che la specifica aggiunge e che la maggior parte delle guide omette. La regola dice due spazi *o più*, quindi una riga che finisce con cinque spazi va a capo esattamente come una che finisce con due — il che è parte del motivo per cui nessuno se ne accorge guardando, e per cui "aggiungi un altro spazio" non è mai la soluzione. E nessuna delle due forme fa nulla a fine blocco: un'interruzione forzata ha bisogno di una riga dopo di sé nello stesso paragrafo, quindi gli spazi finali sull'ultima riga di un paragrafo sono solo spazi finali.

Un terzo dettaglio chiude una discussione che le persone hanno con i propri file. Un'interruzione forzata
non può avvenire dentro uno span di codice né dentro un tag HTML. Racchiudi due righe in backtick, con due
spazi finali sulla prima, e il motore di rendering ti restituisce un unico elemento `<code>` che porta
quegli spazi come contenuto e l'a capo come spazio bianco — nessuna interruzione da nessuna parte. Se ciò
che vuoi interrompere si trova dentro uno span di codice, la sintassi di cui hai bisogno è un blocco
delimitato da recinzioni, non un'interruzione di riga.

### La barra rovesciata, e l'unico punto dove si stampa da sola

La forma con la barra rovesciata fa lo stesso lavoro alla luce del sole. La specifica la introduce come
l'alternativa più visibile a due o più spazi. È un'aggiunta di CommonMark: il documento originale della
sintassi Markdown descrive solo la forma con due spazi e tratta una barra rovesciata unicamente come modo
per stampare un carattere letterale (verificato su daringfireball.net, il 9 settembre 2026), quindi un
parser scritto prima di CommonMark stampa la barra rovesciata invece di interrompere la riga.

Il suo modo di fallire è l'opposto di quello a due spazi, e la differenza vale la pena scegliersela
deliberatamente. Entrambe sono inerti a fine blocco, ma solo la barra rovesciata te lo dice. Un paragrafo
la cui ultima riga è `foo\` viene reso come `<p>foo\</p>`, barra rovesciata compresa; un titolo scritto
`### foo\` viene reso come `<h3>foo\</h3>`. Le stesse posizioni scritte con due spazi finali rendono
`<p>foo</p>` e `<h3>foo</h3>` — niente si è rotto, e niente lo ha detto. Una sintassi fallisce
rumorosamente sulla pagina; l'altra fallisce in silenzio e aspetta che un lettore noti una riga troppo
lunga.

### `<br>`, e l'opinione del convertitore su di esso

La quarta opzione è smettere di usare Markdown per quella singola riga e scrivere tu stesso `<br>`. Markdown permette HTML grezzo per progetto, quindi un `<br>` letterale nella fonte arriva nell'output come `<br>`. È la sola delle quattro forme visibile in un diff, che sopravvive a un formattatore e che nessuna impostazione dell'editor può eliminare. Dipende però dal fatto che il convertitore lasci passare l'HTML grezzo, e non è automatico: markdown-it distribuisce `html: false` nella sua configurazione predefinita, commentato "Enable HTML tags in source" (verificato su cdn.jsdelivr.net, il 9 settembre 2026), quindi i tag grezzi vengono escapati e il tuo `<br>` arriva sulla pagina come testo visibile a meno che qualcuno non abbia acceso quell'opzione. Un convertitore che sanifica un file che non ha scritto lui può anche scartare tag che non riconosce. `<br>` è in ogni lista di elementi ammessi sensata, quindi in pratica arriva — ma è una decisione del convertitore, non tua.

### Cosa fa un singolo a capo, motore per motore

Prima di scegliere tra le quattro, vale la pena vedere cosa fanno davvero i motori di rendering, perché il motivo per cui la domanda non si esaurisce mai è che le stesse due righe di Markdown producono documenti diversi in base a dove vengono rese, e ognuno di questi motori si comporta correttamente. La licenza della specifica a differire è esplicita — un a capo debole può essere presentato in vari modi, e trasformarlo in un `<br>` è uno di questi. Quello che segue è lo stesso input contro i motori che le persone incontrano davvero, ogni riga verificata contro la documentazione ufficiale di quel progetto.

| Where the text is rendered | A single newline becomes | How it is documented |
| --- | --- | --- |
| Un file `.md`, qualsiasi motore CommonMark o GFM | Uno spazio | Il trattamento predefinito della specifica per un a capo debole |
| Un file `.md` su GitHub | Uno spazio | La guida di scrittura di GitHub dice che un'interruzione in un file `.md` richiede due spazi finali, una barra rovesciata o un `<br/>` (verificato su docs.github.com, il 9 settembre 2026) |
| Un commento GitHub, una issue, una pull request o una review | `<br>` | La stessa guida dice che i campi commento rendono l'interruzione di riga per te (verificato su docs.github.com, il 9 settembre 2026) |
| marked, di base | Uno spazio | La sua opzione `breaks` è `false` di default (verificato su marked.js.org, il 9 settembre 2026) |
| marked con `gfm: true` e `breaks: true` | `<br>` | Documentato come copia del comportamento dei commenti GitHub, esplicitamente non del comportamento sui file Markdown resi; `breaks` richiede `gfm` (verificato su marked.js.org, il 9 settembre 2026) |
| markdown-it, di base | Uno spazio | La sua configurazione predefinita imposta `breaks: false`, commentato "Convert '\n' in paragraphs into `<br>`" (verificato su cdn.jsdelivr.net, il 9 settembre 2026) |
| markdown-it con `breaks: true` | `<br>` | Lo stesso nome di opzione, lo stesso lavoro |
| Python-Markdown, di base | Uno spazio | Gli a capo dentro un paragrafo sono spazio bianco salvo che un'estensione dica altrimenti |
| Python-Markdown con l'estensione `nl2br` | `<br />` | L'estensione tratta ogni a capo come interruzione forzata; attivata con `extensions=['nl2br']` (verificato su python-markdown.github.io, il 9 settembre 2026) |
| Pandoc che legge `markdown`, `gfm` o `commonmark` | Uno spazio | La sua estensione `hard_line_breaks` è disattivata di default per tutti e tre (verificato su pandoc.org, il 9 settembre 2026) |
| Pandoc con `+hard_line_breaks` | `<br />` | L'estensione legge ogni a capo dentro un paragrafo come interruzione forzata invece che come spazio (verificato su pandoc.org, il 9 settembre 2026) |

Ne derivano due conseguenze, ed entrambe riguardano il passaggio di consegne. Un testo scritto in un campo commenti e incollato in un file collassa; un testo scritto in un file e incollato in un campo commenti guadagna interruzioni che non aveva mai avuto. Nessun motore di rendering ha torto, perché il documento non portava l'informazione in nessuna delle due direzioni.

La seconda conseguenza è più netta. `breaks: true` è un'impostazione del motore di rendering, non una proprietà del documento, quindi un file che ne dipende viene reso correttamente in esattamente un posto — il tuo. Mandalo a un repository, a un client di posta, a una build per un sito statico o al convertitore di chiunque altro, e le interruzioni sono sparite. Se l'interruzione conta davvero, metti l'informazione nel documento: due spazi, una barra rovesciata o un `<br>` sopravvivono a ogni riga di questa tabella. [Le opzioni che cambiano il comportamento di un motore JavaScript](/blog/markdown-to-html-in-javascript) vanno molto oltre questa sola, e `breaks` è quella che si attiva senza pensare a chi leggerà l'output.

C'è un uso onorevole per questa opzione, e vale la pena nominarlo perché è il caso in cui le persone si
trovano di solito quando la scoprono. Se la tua applicazione possiede entrambi gli estremi — il campo in
cui qualcuno digita, e la pagina dove appare il suo testo, e il testo non esce mai come file `.md` —
allora `breaks: true` corrisponde a quello che si aspetta chi digita in un campo, e nulla più avanti ne
risente. Un campo commenti, un messaggio di chat, un riquadro per appunti. Nel momento in cui quel testo
può essere esportato, versionato o copiato in un repository, l'opzione smette di essere una comodità e
diventa un documento che si rende correttamente solo a casa sua.

### Quale delle quattro usare, e dove

Per la prosa corrente la riga vuota è quasi sempre quello che volevi. Tieni l'interruzione forzata per i casi in cui la nuova riga è parte del contenuto: un indirizzo, un verso, una firma di due righe.

| The document is going to | Use | Because |
| :--- | :--- | :--- |
| Un repository, letto su GitHub e in un editor | Una barra rovesciata | Visibile in un diff, sopravvive a una pulizia degli spazi, e si stampa da sola se la metti in un posto inutile |
| Un convertitore che non controlli | `<br>` | HTML grezzo, soggetto solo alla sanificazione, non alle opzioni di interruzione riga |
| Un file che un linter o un formattatore tocca al salvataggio | Una barra rovesciata o `<br>` | Due spazi sono l'unica forma che una toolchain elimina senza dirtelo |
| Un campo commenti, una issue, un messaggio di chat | Niente del tutto | Quei motori vanno già a capo a ogni a capo |
| Prosa dove l'interruzione è solo visiva | Una riga vuota | È un nuovo paragrafo, e i paragrafi sono ciò per cui si scrivono i fogli di stile |

Nessuna delle cinque risposte è un'impostazione del motore di rendering, e questo è il punto: un documento che porta con sé le proprie interruzioni si rende uguale ovunque venga aperto. Le liste hanno la stessa forma di problema misurata in un'unità diversa — cosa fa una riga lì dipende da quanto lontano dal margine comincia.

## Perché la lista non è una lista

Una lista ha bisogno di una riga vuota sopra di sé. Scritta subito sotto una riga di prosa, il primo elemento può essere assorbito in quel paragrafo e uscire come un trattino smarrito a metà frase.

Le regole qui divergono tra i parser. CommonMark permette a una lista con punti elenco di interrompere un paragrafo, e a una lista numerata solo se comincia da `1`. I parser più vecchi non permettono nessuno dei due casi. Lascia la riga vuota e smette di importare quale convertitore usi — la stessa difesa che mantiene intatta [una tabella](/blog/markdown-tables-that-survive-conversion), e una differenza che [l'articolo sui dialetti](/blog/commonmark-gfm-and-the-flavours) copre per intero.

### Interrompere un paragrafo, e la frase che ha fatto la regola

La posizione di CommonMark è che una lista può interrompere un paragrafo, con due eccezioni legate al
primo elemento: quando comincia su una riga che altrimenti sarebbe testo di continuazione del paragrafo,
l'elemento non deve iniziare con una riga vuota, e se è numerata il suo numero di partenza deve essere `1`
(verificato su spec.commonmark.org, il 9 settembre 2026). La specifica lo spiega nel modo più semplice
possibile — stampando la frase che altrimenti si romperebbe:

```markdown
The number of windows in my house is
14.  The number of doors is 6.
```

Questo resta un solo paragrafo. Sotto una regola che permettesse a qualunque numero di interrompere,
`14.` apriría una lista numerata che parte da quattordici, e una frase mandata a capo dall'impaginazione si
sfalderebbe per il punto in cui la riga è capitata a finire. Restringere l'interruzione a `1` ricompra
quasi ogni numero mandato a capo per caso nella prosa ordinaria, ed è il motivo per cui la regola è
asimmetrica invece che ordinata.

La lettura pratica è breve. Una lista con punti elenco può seguire un paragrafo senza riga vuota e
funziona. Una lista numerata può farlo anche lei, ma solo partendo da `1`, e solo sotto CommonMark.
Qualsiasi cosa più vecchia vuole la riga vuota. Scrivi la riga vuota e nulla di tutto questo è più un
problema tuo.

### Quattro spazi dal margine non sono una lista

Il fallimento opposto è rientrare la lista. Fino a tre spazi di rientro prima del marcatore non cambiano niente — la lista viene resa come se quegli spazi non ci fossero. Il quarto spazio è quello che cambia il blocco: un punto elenco a quattro spazi dal margine sinistro non è una lista, perché al livello più alto quattro spazi significano ancora un blocco di codice rientrato, quindi la lista arriva come testo monospaziato con i suoi trattini intatti.

Questo è un fallimento economico da diagnosticare e facile da causare. Incollare una lista fuori da un
contesto annidato, un editor che rientra alla pressione di Invio, o una copia da un campo commenti già
rientrato: tutti lo producono. L'indizio è che nella fonte niente sembra sbagliato; l'output è un riquadro
grigio.

### I numeri che scrivi vengono per lo più ignorati

In una lista numerata viene letto solo il primo numero. Il numero di partenza della lista viene preso dal suo primo elemento, e i numeri su ogni elemento successivo vengono ignorati — il motore emette `<ol>`, oppure `<ol start="5">`, e il browser conta da lì. I marcatori devono avere nove cifre o meno: `123456789.` apre una lista, `1234567890.` è un paragrafo che comincia con un numero molto grande (verificato su spec.commonmark.org, il 9 settembre 2026). `1)` funziona in CommonMark quanto `1.`.

| What you write | What renders | The rule |
| :--- | :--- | :--- |
| `1.` `2.` `3.` | 1, 2, 3 | Il primo marcatore fissa la partenza; il resto viene ignorato |
| `1.` `1.` `1.` | 1, 2, 3 | Stessa regola, con un file che smette di contraddire sé stesso |
| `1.` `7.` `3.` | 1, 2, 3 | Ancora la stessa regola — i numeri sbagliati non costano nulla |
| `5.` `6.` `7.` | 5, 6, 7 | `<ol start="5">`, e il browser conta avanti da cinque |
| `5.` `1.` `1.` | 5, 6, 7 | È stato letto solo il `5` |
| `0.` `0.` `0.` | 0, 1, 2 | Zero è un numero di partenza legale |
| `1234567890.` | Un paragrafo | Dieci cifre sono una di troppo per essere un marcatore |

Scrivere ogni elemento come `1.` mantiene piccoli i diff: la rinumerazione avviene al momento del rendering invece che su venti righe del file, quindi inserire un elemento in mezzo tocca una riga invece di tutte. Il contro-argomento è che la fonte non si legge più in ordine, il che conta se le persone leggono il file `.md` direttamente. Entrambe le scelte sono difendibili; quello che non è difendibile è un file in cui alcune liste fanno una cosa e altre l'altra, perché allora un `7.` fuori posto sembra un errore che qualcuno dovrebbe correggere.

### Cambia il marcatore e hai due liste

Cambiare il carattere del punto elenco o il delimitatore ordinato inizia una nuova lista. Questa è una
regola, non una tolleranza, ed è invisibile nella pagina resa:

```markdown
- foo
- bar
+ baz
```

è un `<ul>` di due elementi seguito da un `<ul>` di un elemento, non una lista di tre. Lo stesso succede
tra `1.` e `1)`, e il caso numerato è più rumoroso al riguardo, perché la seconda lista comincia una
numerazione propria. Le cause abituali sono un file modificato da due persone con abitudini diverse, o un
blocco incollato da un posto che usava `*` mentre il tuo file usa `-`.

In un browser due liste a punti adiacenti sembrano quasi esattamente una, quindi questo spesso finisce in produzione. Quello che lo tradisce è la spaziatura: se una delle due liste contiene una riga vuota diventa ariosa mentre la vicina resta compatta, e all'improvviso metà lista ha più aria intorno dell'altra metà. Un solo carattere di punto elenco e un solo delimitatore per documento elimina tutta la categoria.

## Quanto rientrare una lista markdown annidata

Il rientro si misura dalla colonna di contenuto dell'elemento genitore, non dal margine sinistro. Questa è tutta la regola, e spiega ogni lista che si rifiuta di annidarsi.

```markdown
- Bullet: content starts at column 2
  - so two spaces nests under it
1. Ordered: `1. ` is three characters wide
   - so three spaces nests under it
10. At ten the marker is four wide
    - and four spaces is what nests
```

Quattro spazi sono l'abitudine che la maggior parte delle persone porta con sé, e il rientro extra è consentito, quindi di solito funziona. Fallisce in entrambe le direzioni: troppo poco, e la lista annidata diventa un fratello del suo genitore; quattro o più colonne oltre la colonna di contenuto, ed è di nuovo codice.

### L'aritmetica, scritta per intero

La specifica costruisce un elemento di lista da un marcatore di larghezza W seguito da N spazi, dove N è
tra uno e quattro, e poi rientra ogni riga successiva di quell'elemento di W + N (verificato su
spec.commonmark.org, il 9 settembre 2026). W + N è la colonna di contenuto, ed è l'unico numero in gioco.
La guida di scrittura di GitHub dà la stessa regola senza l'algebra: digita spazi davanti all'elemento
annidato finché il suo marcatore non si trova esattamente sotto il primo carattere del testo sopra, e in
un carattere proporzionale, conta i caratteri che appaiono prima del contenuto dell'elemento (verificato
su docs.github.com, il 9 settembre 2026).

Quindi la larghezza del marcatore è la larghezza del marcatore come scritto, e ogni sua parte conta:

| Parent marker | Marker width | Spaces after it | Content column | Nest a child at |
| :--- | :--- | :--- | :--- | :--- |
| `- ` | 1 | 1 | 2 | 2 spazi |
| `* ` | 1 | 1 | 2 | 2 spazi |
| `-   ` | 1 | 3 | 4 | 4 spazi |
| `1. ` | 2 | 1 | 3 | 3 spazi |
| `1) ` | 2 | 1 | 3 | 3 spazi |
| `10. ` | 3 | 1 | 4 | 4 spazi |
| `100. ` | 4 | 1 | 5 | 5 spazi |

La riga che coglie in fallo è `10. `. Una lista che si annidava correttamente per nove elementi smette di
annidarsi correttamente al decimo, perché il marcatore è cresciuto di un carattere e la colonna di
contenuto si è spostata con lui. Nessuno lo cerca lì, perché il file che si è rotto è il file che
funzionava ieri con un elemento di meno.

### Due spazi sotto un punto elenco, e cosa produce gli altri rientri

Prendi un genitore a punto elenco, colonna di contenuto 2. Corretto:

```markdown
- Parent item
  - Nested, because two spaces reach the content column
```

Un spazio troppo poco, e il figlio non è un figlio affatto — è un altro elemento della stessa lista,
perché un marcatore di lista può avere fino a tre spazi di rientro proprio:

```markdown
- Parent item
 - One space: a sibling, rendered flush with its parent
```

Quattro colonne oltre la colonna di contenuto, con una riga vuota sopra, e il parser legge un blocco di
codice rientrato dentro l'elemento genitore:

```markdown
- Parent item

      - Six spaces: this is code now
```

che viene reso come `<li><p>Parent item</p><pre><code>- Six spaces: this is code now</code></pre></li>`
— un riquadro grigio sotto il punto elenco, trattino e tutto. Togli la riga vuota e gli stessi sei spazi
producono di nuovo qualcosa diverso: senza riga vuota, il testo rientrato troppo è continuazione di
paragrafo, quindi si unisce al paragrafo proprio del genitore, e il marcatore viene stampato come trattino
letterale a metà frase.

### Tre spazi sotto un elemento numerato

Un genitore numerato sposta la colonna di uno, e l'abitudine dei due spazi fallisce in un modo che sembra
un bug del convertitore:

```markdown
1. Parent item
  - Two spaces: not nested, and not even in the list
```

Due spazi sono troppo pochi rispetto alla colonna di contenuto a 3, quindi il figlio non fa parte
dell'elemento; e poiché il suo marcatore è un punto elenco invece di un numero, non può nemmeno essere un
fratello. La lista numerata si chiude e una nuova lista a punti si apre a fianco. La pagina resa mostra un
`<ol>` con un elemento seguito da un `<ul>` con un elemento — che, nella maggior parte dei fogli di stile,
sembra una lista annidata che ha perso il rientro.

Tre spazi sono la soluzione:

```markdown
1. Parent item
   - Three spaces: nested, as intended
```

| Indent under a `- ` parent | Indent under a `1. ` parent | What the parser makes of it |
| :--- | :--- | :--- |
| 0–1 spazi | 0–2 spazi | Non fa parte dell'elemento: un fratello se il tipo di marcatore coincide, una lista del tutto nuova se non coincide |
| 2–5 spazi | 3–6 spazi | Una lista annidata — la colonna di contenuto, più fino a tre spazi di margine |
| 6+ spazi dopo una riga vuota | 7+ spazi dopo una riga vuota | Un blocco di codice rientrato dentro l'elemento genitore |
| 6+ spazi senza riga vuota | 7+ spazi senza riga vuota | Continuazione di paragrafo: il marcatore viene stampato come testo |

Il margine nella riga centrale è il motivo per cui quattro spazi funzionano quasi sempre e restano
comunque l'abitudine sbagliata. Quattro oggi rientra nell'intervallo per entrambi i marcatori. Smette di
rientrarci nel momento in cui un marcatore si allarga, e nasconde l'aritmetica a chiunque modifichi il
file dopo di te.

### Cosa può andare dentro un elemento di lista

Tutto ciò che puoi scrivere al livello più alto può andare dentro un elemento di lista, purché cominci
alla colonna di contenuto dell'elemento. Questa è tutta l'estensione della regola, e copre quattro cose
su cui le persone chiedono separatamente:

- **Un secondo paragrafo.** Riga vuota, poi il paragrafo rientrato alla colonna di contenuto. Sotto `- item`
  sono due spazi. Rientralo di uno spazio in meno e cade fuori dalla lista del tutto: la lista si chiude e
  il testo diventa un paragrafo per sé, che siede sotto una lista in cui doveva stare.
- **Un blocco di codice.** Una recinzione che comincia alla colonna di contenuto appartiene all'elemento;
  quattro colonne più in là, la recinzione smette di essere una recinzione e diventa backtick letterali in
  un blocco di codice rientrato. Quel caso ha [la sua aritmetica e i suoi esempi lavorati](/blog/code-blocks-in-markdown),
  incluso cosa succede quando la lista supera l'elemento dieci.
- **Una citazione a blocchi.** Un `> ` alla colonna di contenuto, su ogni riga della citazione, righe vuote
  incluse. Lascia cadere il marcatore su una riga e la citazione finisce lì.
- **Un'altra lista.** Che è la regola di annidamento vista sopra, applicata di nuovo dalla nuova colonna
  di contenuto.

Ne derivano due conseguenze, scrivendola in questo modo. Un elemento di lista è un contenitore di blocco e
non una riga di testo, quindi tutto ciò che lo riguarda — spaziatura, codice, citazioni — è una questione
di colonne e non una questione di liste. E più annidi in profondità, più colonne stai contando, il che è
l'argomento pratico contro tre livelli di annidamento in un documento che altre persone modificheranno.

## Liste compatte, liste ariose, e la riga vuota che passa dall'una all'altra

Poi c'è lo spazio che appare dal nulla. Una lista è compatta quando i suoi elementi stanno l'uno addosso all'altro, e il loro testo entra dritto in ogni `<li>`. Metti una riga vuota tra due elementi qualsiasi, o dai a un elemento due paragrafi, e tutta la lista diventa ariosa: ogni elemento, compresi quelli che non hai toccato, ottiene il proprio testo avvolto in un paragrafo, che nel browser si vede come spazio verticale extra. Una riga vuota ha cambiato il tipo della lista.

La specifica enuncia la condizione e la conseguenza in un solo punto: una lista è ariosa se qualcuno dei
suoi elementi è separato da righe vuote, o se qualche elemento contiene direttamente due elementi a
livello di blocco con una riga vuota tra loro; altrimenti è compatta. La differenza nell'HTML è che i
paragrafi in una lista ariosa sono avvolti in tag `<p>` e i paragrafi in una lista compatta non lo sono
(verificato su spec.commonmark.org, il 9 settembre 2026).

Questo è tutto il meccanismo. Ecco la coppia, fianco a fianco. Compatta:

```markdown
- a
- b
- c
```

```html
<ul>
<li>a</li>
<li>b</li>
<li>c</li>
</ul>
```

Ariosa, per una sola riga vuota prima dell'ultimo elemento:

```markdown
- a
- b

- c
```

```html
<ul>
<li><p>a</p></li>
<li><p>b</p></li>
<li><p>c</p></li>
</ul>
```

Tre cose su questo output vale la pena dirle chiaramente, perché ognuna è una domanda di supporto che
qualcuno ha posto.

**Il cambiamento riguarda la lista, non l'elemento.** Gli elementi `a` e `b` non sono stati toccati e
hanno entrambi guadagnato un `<p>`. Essere ariosa è una proprietà della lista nel suo insieme, quindi una
riga vuota in un punto qualsiasi al suo interno rende di nuovo ogni elemento.

**La spaziatura viene dal tuo foglio di stile, non da Markdown.** Un `<p>` dentro un `<li>` eredita
qualsiasi margine superiore e inferiore che la pagina dà ai paragrafi. Ecco perché lo stesso file appare
compatto su GitHub e arioso su un sito di documentazione, o il contrario: la quantità di spazio extra è
una decisione CSS che il Markdown ha soltanto innescato.

**Una lista annidata dopo una riga vuota rende ariosa anche la lista esterna.** Questa è la regola che
colpisce chi non ha fatto niente di male:

```markdown
- a

  - a nested item
- b
```

Il primo elemento adesso contiene direttamente un paragrafo e una lista con una riga vuota tra loro,
quindi tutta la lista esterna è ariosa e l'elemento `b` ottiene un `<p>` che non ha chiesto. Togli la riga
vuota e la lista torna compatta.

Niente di questo è un defetto da correggere. Le liste ariose sono la forma giusta quando gli elementi sono
frasi o contengono più blocchi; le liste compatte sono giuste per etichette brevi. Il problema è farle
entrambe per caso in un unico documento, così che alcune liste respirano e altre no per ragioni che
nessuno vede nella fonte. Scegli per lista, deliberatamente, e mantieni coerenti le righe vuote all'interno
di ciascuna.

## Checkbox e liste di attività

Una checkbox è un elemento di lista il cui testo inizia con parentesi quadre:

- [x] Marcatore, spazio, parentesi, spazio, poi il testo
- [ ] Le parentesi vengono prima — testo davanti a loro e diventa un elemento ordinario
- [ ] `x` o `X` la spunta, un singolo spazio la lascia vuota, e quello spazio è obbligatorio

Una lista di attività è un'estensione di GitHub Flavored Markdown, non CommonMark puro, quindi un convertitore strettamente CommonMark ti restituisce parentesi quadre letterali. TransformPipe parla GFM, quindi liste di attività, tabelle, testo barrato e autolink arrivano come sé stessi. La checkbox nell'output è un'immagine dello stato nel tuo file, non un controllo: GFM la rende come un input disabilitato, quindi non c'è niente da cliccare.

La specifica GFM è precisa su cosa conta. Un elemento di lista di attività è un elemento di lista il cui
primo blocco è un paragrafo che comincia con un marcatore di lista di attività seguito da almeno un
carattere di spazio bianco prima di qualsiasi altro contenuto, e il marcatore stesso è una parentesi
quadra sinistra, poi un carattere di spazio bianco oppure la lettera `x` in un caso qualsiasi, poi una
parentesi quadra destra. Nel rendering, il marcatore viene sostituito da un elemento checkbox, spuntato
quando il carattere tra le parentesi è qualcosa diverso da spazio bianco (verificato su github.github.com,
il 9 settembre 2026).

Letta contro un file reale, produce quattro regole e una sorpresa:

| What you write | What you get | Why |
| :--- | :--- | :--- |
| `- [ ] Task` | Una checkbox non spuntata | Spazio bianco tra le parentesi |
| `- [x] Task` o `- [X] Task` | Una checkbox spuntata | Entrambe le forme di `x` la spuntano |
| `- []Task` | Un elemento di lista ordinario, parentesi visibili | Nessuno spazio bianco dentro, e nessuno dopo |
| `- Task [ ] later` | Un elemento di lista ordinario, parentesi visibili | Il marcatore deve iniziare il primo paragrafo dell'elemento |
| `- [ ] Parent` con un `- [ ] Child` rientrato | Checkbox annidate | Le liste di attività si annidano come qualsiasi altra lista |

La sorpresa è l'output stesso. Il rendering di riferimento è `<input disabled="" type="checkbox">` — un
elemento input, già disabilitato, seduto dentro il `<li>`. GitHub sovrappone un proprio comportamento
dentro issue e pull request, dove le caselle possono essere selezionate e deselezionate mentre il lavoro
procede (verificato su docs.github.com, il 9 settembre 2026); un documento HTML convertito non ha dove
registrare un clic, quindi la checkbox è un'immagine statica dello stato nella fonte. Se hai bisogno di
una checkbox che qualcuno possa spuntare e che se lo ricordi, hai bisogno di un'applicazione, non di un
documento.

La modalità di fallimento con un convertitore che non parla GFM è più silenziosa di quanto suoni. Non
ottieni un errore; ottieni `<li>[ ] Task</li>`, che è una lista di elementi che iniziano con due parentesi
quadre. Su una pagina con uno stile decente si legge come errore di formattazione piuttosto che come
funzione mancante, motivo per cui "le mie checkbox hanno smesso di funzionare" è di solito un problema di
dialetto — lo stesso che sta dietro alla scomparsa contemporanea di tabelle e testo barrato.

## Fare l'escape di un carattere che significa qualcosa

Il carattere di escape è la barra rovesciata. In CommonMark funziona prima di qualsiasi segno di punteggiatura ASCII e in nessun altro punto, quindi una barra rovesciata prima di una lettera resta sulla pagina come una barra rovesciata.

```markdown
1986\. The year, not the first item of a list.
The shape is a \*star\*, and I mean the asterisks.
A literal backslash is written \\.
```

La data è il caso classico: una riga che inizia con un numero, un punto e uno spazio è una lista numerata, quindi un paragrafo che comincia con un anno diventa silenziosamente l'elemento uno. Titoli (`#`), citazioni a blocchi (`>`) e punti elenco (`-`) fanno lo stesso a inizio riga, e le pipe vanno protette con l'escape dentro una tabella.

Due cose che ti fanno risparmiare barre rovesciate. I trattini bassi dentro una parola vengono lasciati in
pace, quindi `snake_case_name` sopravvive intatto; gli asterischi no, quindi `a*b*c` continua a mettere in
enfasi. E una barra rovesciata non fa nulla dentro uno span di codice, che è la risposta migliore comunque
per un nome di file, un flag o un pattern glob — il caso che apre [la guida completa sull'escape](/blog/markdown-escaping),
che continua attraverso le entità di carattere che una barra rovesciata non può sostituire e i casi con
template, percorsi Windows e `__init__` che generano la maggior parte delle lamentele.

### Ogni carattere che ne ha bisogno, e dove

L'insieme è fisso. CommonMark ammette una barra rovesciata prima di qualsiasi carattere di punteggiatura
ASCII e in nessun altro punto, e questi sono i trentadue: ``!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~`` (verificato
su spec.commonmark.org, il 9 settembre 2026). Una barra rovesciata prima di una lettera, una cifra o uno
spazio è una barra rovesciata letterale, stampata.

La maggior parte di quei trentadue non fa mai nulla e non ha mai bisogno dell'escape. Questi sono quelli
che lo fanno:

| Character | What it means unescaped | Where it bites | Write instead |
| :--- | :--- | :--- | :--- |
| `\` | Il carattere di escape stesso | Ovunque nel testo | `\\` |
| `` ` `` | Apre uno span di codice | Ovunque inline | ``\` ``, oppure racchiudi il testo in una sequenza più lunga di backtick |
| `*` | Enfasi, e un marcatore di punto elenco | Ovunque inline, anche a metà parola; a inizio riga | `\*` |
| `_` | Enfasi | Solo a un confine di parola — i trattini bassi a metà parola sono sicuri | `\_` |
| `#` | Un titolo ATX | Solo a inizio riga | `\#` |
| `>` | Una citazione a blocchi | Solo a inizio riga | `\>` |
| `-` | Un punto elenco, una sottolineatura setext, un'interruzione tematica | Solo a inizio riga | `\-` |
| `+` | Un punto elenco | Solo a inizio riga | `\+` |
| `.` | Un marcatore di lista numerata, dopo cifre | Solo a inizio riga | `1986\.` |
| `)` | Un marcatore di lista numerata, dopo cifre | Solo a inizio riga | `1986\)` |
| `[` `]` | Un link, un'immagine, una nota, un marcatore di attività | Ovunque inline | `\[` `\]` |
| `!` | Un'immagine, quando seguita da `[` | Ovunque inline | `\!` |
| `<` | HTML grezzo, o un autolink | Ovunque inline | `\<`, oppure l'entità `&lt;` |
| `&` | L'inizio di un riferimento a entità | Ovunque inline | `&amp;` |
| Una pipe | Un confine di cella in una tabella GFM | Solo dentro una riga di tabella | Una barra rovesciata davanti, anche dentro uno span di codice |
| `~` | Testo barrato, in GFM | Ovunque inline, in coppie | `\~` |
| `=` | Una sottolineatura setext, che trasforma la riga sopra in un `<h1>` | A inizio riga, subito sotto un paragrafo | `\=` |

La colonna che fa risparmiare più lavoro è la terza. `#`, `>`, `-`, `+`, `.` e `)` portano significato solo
a inizio riga, quindi un cancelletto a metà frase è solo un cancelletto e non ha bisogno di nulla.
Proteggerli sempre con l'escape è un'abitudine presa da strumenti che lo fanno per prudenza, e lascia
barre rovesciate sparse per tutta la prosa che un lettore alla fine vedrà, perché una barra rovesciata
davanti a un carattere che non significava nulla sparisce comunque dall'output ma resta nel file, così che
la prossima persona se lo chieda.

### Dove una barra rovesciata non fa proprio nulla

Gli escape non funzionano dentro span di codice, blocchi di codice, autolink o HTML grezzo (verificato su
spec.commonmark.org, il 9 settembre 2026). Dentro i backtick, `\*` è una barra rovesciata e un asterisco,
entrambi stampati — che è esattamente quello che vuoi per un pattern glob o un percorso Windows, ed
esattamente quello che sorprende chi ha fatto l'escape prima e ha aggiunto i backtick dopo.

Funzionano in tre posti che potresti non aspettarti: destinazioni di link, titoli di link, e la stringa
informativa dopo una recinzione. Una parentesi dentro un URL può essere protetta con l'escape invece che
codificata in percentuale, e un titolo che contiene una virgoletta può portarla.

### Gli escape che un convertitore scrive per te

Andando nell'altra direzione — HTML, un `.docx` o un foglio di calcolo verso Markdown — ognuno di questi
caratteri è il problema del convertitore, non il tuo, ed è un modo ragionevole per giudicarne uno. Un
paragrafo Word che inizia "1986. L'anno" deve arrivare come `1986\. L'anno` o il documento guadagna una
lista che nessuno ha scritto. Un titolo il cui testo contiene un `#`, una frase con un trattino basso o un
asterisco, una cella di tabella con una pipe: ciascuno ha bisogno di una barra rovesciata inserita durante
la conversione, e un convertitore che salta questo passo produce un file Markdown che si rende come
qualcosa di diverso dal documento da cui è nato. Vale la pena testarlo con un paragrafo apposta ostico
prima di affidare a un convertitore cento pagine.

Nell'altra direzione l'escape è il problema del browser e il convertitore lo gestisce in silenzio: `<` e
`&` nel tuo testo arrivano nell'HTML come `&lt;` e `&amp;`, motivo per cui un `<div>` letterale scritto
nella prosa appare come testo sulla pagina invece di sparire dentro il markup.

## La parte onesta: la sintassi che la tua toolchain elimina

Tutto quanto sopra presuppone che il file che hai salvato sia il file che il convertitore legge. Per
l'interruzione forzata a due spazi, quella supposizione è di solito falsa, ed è falsa in un modo che
nessuno può vedere.

Lo spazio bianco a fine riga è la cosa che ogni parte di una toolchain moderna è configurata per
rimuovere. È una proprietà EditorConfig standard: `trim_trailing_whitespace` impostato a `true` rimuove i
caratteri di spazio bianco prima dell'a capo, ed è supportato in molti editor (verificato su
editorconfig.org, il 9 settembre 2026). Un repository con un `.editorconfig` che lo imposta per `[*]`
elimina le tue interruzioni di riga al prossimo salvataggio, in ogni file, per chiunque. Nulla ti avvisa,
perché dal punto di vista dell'editor non ha rimosso nulla di valore, e [l'editor in cui scrivi](/blog/best-markdown-editors)
è di solito proprio quello che lo impone — un'impostazione che qualcuno ha attivato anni fa per un
linguaggio dove lo spazio bianco a fine riga è davvero rumore.

Il linter è d'accordo con l'editor e in disaccordo con la specifica. La regola MD009 di markdownlint,
alias `no-trailing-spaces`, segnala righe che finiscono con spazio bianco inaspettato, con un parametro
`br_spaces` che permette un'eccezione per un numero specifico di spazi finali usati come interruzione
esplicita; il suo valore predefinito è `2` (verificato su github.com, il 9 settembre 2026). Quindi
un'interruzione a due spazi passa, e una a tre viene segnalata — anche se entrambe si rendono
identicamente, perché la regola è "due o più". La sintassi è legale a qualsiasi larghezza sopra uno e
pulita per il linter a esattamente una larghezza.

Aggiungi gli ultimi due fatti e il quadro è completo. Una revisione del codice non mostra nulla: gli spazi
finali non appaiono in un diff come contenuto, quindi il commit che ha rimosso le tue interruzioni di riga
sembra il commit che ha corretto un rientro. E chi se ne accorge è il lettore, settimane dopo, che guarda
un indirizzo finito su una sola riga.

Questo è il punto più delicato di tutto l'argomento. Il modo documentato, originale, supportato ovunque
per interrompere una riga è una sequenza di caratteri invisibili che gli strumenti attorno al tuo file
sono configurati per eliminare, che il tuo linter ammette a esattamente una larghezza, e la cui scomparsa
è invisibile in revisione. Non è un difetto di Markdown e non è un difetto degli strumenti; sono due
posizioni ragionevoli che si incontrano in un file.

## Conclusione: le regole che sopravvivono a un giro completo

Dieci regole coprono ogni fallimento di questa pagina, e sotto sotto sono tutte la stessa regola: metti il
significato nel documento e non nello strumento che lo rende.

1. **Scrivi le interruzioni forzate come barra rovesciata, non come due spazi.** Una pulizia degli spazi
   non può eliminarla, un diff la mostra, e se la metti in un punto inutile si stampa da sola invece di
   fallire in silenzio.
2. **Usa un `<br>` letterale quando il convertitore non è tuo.** L'unica cosa che può rimuoverlo è la
   lista di elementi ammessi di un sanificatore, che è una lista di possibilità più corta dell'opzione di
   interruzione riga di ogni motore.
3. **Prima di entrambe, ricorri a una riga vuota.** Un nuovo paragrafo è un blocco che un foglio di stile
   può spaziare, e un `<br>` no — quindi la maggior parte delle interruzioni per cui la gente combatte
   avrebbero dovuto essere paragrafi.
4. **Lascia una riga vuota sopra ogni lista.** Costa una riga e elimina ogni differenza tra dialetti
   sull'interruzione di un paragrafo, inclusa la regola per cui una lista numerata deve iniziare da 1.
5. **Conta il marcatore invece dell'abitudine: due sotto `- `, tre sotto `1. `, quattro dall'elemento
   dieci.** Quattro spazi funzionano finché un marcatore non si allarga, e la lista che si rompe è quella
   che non hai modificato.
6. **Decidi compatta o ariosa per ogni lista, e mantieni coerenti le righe vuote al suo interno.**
   Altrimenti la spaziatura nel tuo documento cambia per ragioni invisibili nella fonte e non attribuibili
   in revisione.
7. **Mantieni un solo carattere di punto elenco e un solo delimitatore numerato per documento.** Un
   singolo `+` o `1)` fuori posto divide silenziosamente una lista in due, e due liste adiacenti sembrano
   quasi esattamente una.
8. **Fai l'escape di un carattere solo dove porta significato.** `#`, `>`, `-` e `.` significano qualcosa
   a inizio riga e nulla altrove, quindi l'escape ovunque lascia barre rovesciate in una prosa che
   qualcuno alla fine leggerà nella fonte.
9. **Tratta l'opzione `breaks` di un motore come una proprietà della tua applicazione, mai dei tuoi
   documenti.** Il giorno in cui il testo viene esportato, versionato o incollato altrove, ogni
   interruzione su cui contava è sparita.
10. **Leggi l'HTML, non l'anteprima.** Un `<p>` dove ti aspettavi un `<br>`, un `<pre>` dove ti aspettavi
    un elemento annidato, un secondo `<ul>` dove ti aspettavi una lista: l'output nomina la regola che si
    è attivata.

Niente di tutto questo ha bisogno di uno strumento che lo faccia rispettare. Ha bisogno che il file
sorgente dica quello che intendevi, così che il file lo intenda ancora dopo che un formattatore, un
revisore e il convertitore di qualcun altro hanno avuto il loro turno. Quando un documento continua a
rendersi male e non riesci a capire perché, convertilo e leggi l'HTML accanto all'anteprima —
[TransformPipe lo fa nel browser](/), con la fonte e l'output fianco a fianco — perché i tag rispondono
alla domanda che la fonte non può rispondere: un `<p>` significa che l'interruzione non è mai avvenuta, un
`<pre>` significa che hai rientrato troppo, e una lista che ha guadagnato paragrafi significa che una riga
vuota si è infilata da qualche parte dove non stavi guardando. Ogni sintomo di questa pagina si risolve in
uno di questi tre, e ciascuno è una regola che fa esattamente quello che dice.

## FAQ

### Come faccio un a capo in Markdown?

Chiudi la riga con due spazi o una barra rovesciata, e l'interruzione avviene dentro lo stesso paragrafo,
come `<br>`. Lascia invece una riga vuota e ottieni un nuovo paragrafo, che è quello che vuoi per la
prosa. La barra rovesciata è la migliore delle due interruzioni forzate, perché gli spazi finali sono
invisibili e la maggior parte delle toolchain li elimina.

### Perché il mio a capo non funziona su GitHub?

Perché un file `.md` e un campo commenti sono due motori diversi. La guida di GitHub dice che un campo
commenti rende l'interruzione per te, mentre un'interruzione in un file `.md` richiede due spazi finali,
una barra rovesciata o un `<br/>` (verificato su docs.github.com, il 9 settembre 2026). Un testo scritto
in un commento e incollato in un file collassa esattamente per questo motivo.

### Di quanti spazi devo rientrare una lista markdown annidata?

Due sotto `- `, tre sotto `1. `, e quattro una volta che la numerazione arriva a `10. ` — la larghezza del
marcatore più gli spazi dopo. Troppo pochi e l'elemento diventa un fratello invece di un figlio; quattro o
più colonne oltre quel punto e diventa un blocco di codice o si unisce al paragrafo del genitore.

### Perché la mia lista ha guadagnato improvvisamente spazio extra tra gli elementi?

Una riga vuota da qualche parte al suo interno ha reso ariosa tutta la lista, quindi il testo di ogni
elemento è ora avvolto in un `<p>` ed eredita i margini di paragrafo del tuo foglio di stile. La riga
vuota non deve stare tra due elementi — una prima di una lista annidata ha lo stesso effetto. Toglila e la
lista torna compatta.

### Perché i numeri della mia lista si rinumerano da soli?

Viene letto solo il primo marcatore; i numeri sugli elementi successivi vengono ignorati e il browser
conta dal numero di partenza. Ecco perché `1. 7. 3.` si rende come 1, 2, 3, e perché scrivere ogni
elemento come `1.` è uno stile legittimo e non un errore.

### Perché la mia checkbox si rende come `[ ]`?

Le liste di attività sono un'estensione di GitHub Flavored Markdown e non parte di CommonMark, quindi un
convertitore strettamente CommonMark rende le parentesi come testo ordinario. Ti serve un convertitore che
parli GFM — lo stesso che ti serve per tabelle, testo barrato e autolink, motivo per cui di solito si
rompono insieme.

### Come impedisco che un anno a inizio riga diventi una lista?

Fai l'escape del punto: `1986\. L'anno`. Una cifra seguita da `.` o `)` e uno spazio è un marcatore
valido di lista numerata a inizio riga, quindi il paragrafo diventa l'elemento uno di una lista che parte
da 1986. La barra rovesciata è invisibile nell'output e non costa nulla.
