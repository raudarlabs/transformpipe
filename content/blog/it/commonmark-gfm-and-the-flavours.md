---
title: "CommonMark contro GFM: che cosa supporta ogni motore, in tabella"
description: "Che cosa ha fissato CommonMark, le cinque estensioni aggiunte da GFM, che cosa non c’è in nessuno dei due, e dieci motori allineati per prevedere dove si rompe."
date: 2026-08-18
tag: Sintassi
keywords: commonmark, commonmark contro markdown, github flavored markdown, cos'è gfm, differenza gfm commonmark, varianti markdown, specifica markdown, estensioni markdown
---

Incolla lo stesso file in tre strumenti e puoi ottenere tre documenti diversi. Uno disegna una tabella, un altro mostra una riga di caratteri pipe. Uno trasforma un singolo a capo in un'interruzione di riga, un altro ripiega le righe in un unico paragrafo. Niente è rotto e niente è configurato male. Gli strumenti parlano dialetti diversi, "Markdown" nomina la famiglia più che un singolo membro, e sapere quale membro stai scrivendo è già gran parte del rimedio.

### In breve

CommonMark è una specifica con una suite di test: risolve le discussioni sulla sintassi originale e si ferma deliberatamente a un nucleo, senza tabelle, senza elenchi di attività, senza testo depennato e senza autolink su URL nudi. GFM è quella specifica più esattamente cinque estensioni con nome — tabelle, elementi di elenco con casella, testo depennato, autolink, e un filtro che maschera nove tag HTML grezzi — ed è il dialetto che la maggior parte delle persone intende quando dice Markdown. Tutto il resto che hai visto in un file `.md` — note a piè di pagina, elenchi di definizioni, liste di attributi, formule matematiche, avvisi, front matter — non è in nessuna delle due specifiche e viaggia solo finché arriva l'elenco di estensioni dello strumento successivo. Scrivi per il lettore più severo della catena, e verifica con un file sonda invece che con un'ipotesi.

## Tre specifiche, e gli anni fra loro

John Gruber ha pubblicato Markdown nel 2004: una descrizione della sintassi su una pagina web, e `Markdown.pl`, uno script Perl che trasformava quella sintassi in HTML. L'ultima versione è stata la 1.0.1, datata 17 dicembre 2004 (verificato su daringfireball.net/projects/markdown, l'8 settembre 2026). La pagina e lo script insieme erano la definizione, e ovunque la prosa restasse in silenzio — cosa che succedeva spesso — quello che lo script faceva per caso diventava la risposta.

Va bene per un blog e diventa doloroso per la seconda implementazione. La descrizione non dice mai quanti spazi indentano un elenco annidato, cosa succede quando l'enfasi si apre dentro una parola, come un elenco interagisce con la citazione in cui è inserito, o se un'interruzione forzata sopravvive alla fine di un paragrafo. Ogni implementatore ha indovinato, e le ipotesi differivano. In pochi anni c'erano dozzine di librerie, tutte chiamate Markdown, nessuna d'accordo sui casi scomodi e tutte d'accordo su quelli facili. Quindi il confronto che la gente cerca come *commonmark contro markdown* è in realtà un confronto fra una specifica e una descrizione più uno script.

CommonMark, pubblicata per la prima volta nel 2014, è quella specifica mancante scritta per intero. Definisce le regole di parsing nel dettaglio e porta con sé centinaia di casi di test, ognuno uno snippet di Markdown accanto all'HTML esatto che deve produrre. Non esiste una cosa come CommonMark-ish: un'implementazione supera la suite oppure no.

GFM ha affrontato il problema dall'altra estremità. GitHub aveva un renderer con milioni di file puntati contro e una lista di aggiunte da cui i suoi utenti dipendevano, così ha scritto la specifica GitHub Flavored Markdown come superset stretto di CommonMark — lo stesso documento, con cinque sezioni di estensione aggiunte. Ecco perché *commonmark contro gfm* ha una risposta breve: lo stesso nucleo, cinque aggiunte con nome, nessun'altra differenza. Tutto quello che sta oltre quelle cinque è l'estensione di qualcuno, ed è lì che i file smettono di viaggiare.

## Cosa ha davvero risolto CommonMark

È facile leggere CommonMark come un Markdown più corto per quello che lascia fuori. Il valore sta in quello che fissa. Ognuno di questi era un vero disaccordo fra implementazioni prima che la specifica esistesse, e ognuno è ora risolvibile indicando un esempio numerato.

- **L'indentazione degli elenchi.** Quanto deve essere indentato un elenco figlio è definito in termini della colonna del contenuto del genitore, non un numero fisso di spazi. Ecco perché i marcatori `-` e `1.` si comportano diversamente quando annidi sotto di loro: sono larghezze diverse.
- **Elenchi larghi e compatti.** Una riga vuota fra elementi rende l'intero elenco largo, il che avvolge il testo di ogni elemento in un `<p>`. Una singola riga vuota fuori posto cambia la spaziatura di un elenco che non hai toccato — la sorpresa più comune in tutta la specifica, e ha [i suoi modi di fallire su cui vale la pena leggere](/blog/markdown-line-breaks-and-lists).
- **L'enfasi.** Le regole delle sequenze di delimitatori "left-flanking" e "right-flanking" sostituiscono il vecchio "dipende" per `snake_case_words`, `**bold**dentro`, e ogni mescolanza di asterischi e underscore.
- **I blocchi di codice con fence.** Fence a backtick e a tilde, le regole del fence di chiusura, e l'info string. La parola dopo il fence è un'etichetta e niente di più: [ogni convertitore la trasforma in un nome di classe e si ferma lì](/blog/code-blocks-in-markdown).
- **Le interruzioni forzate.** Due spazi finali o una barra rovesciata a fine riga. Un singolo a capo è uno spazio. Questa è una regola della specifica, non una preferenza, ed è la regola che più strumenti offrono un'opzione per rompere.
- **I blocchi HTML.** Sette tipi distinti, ognuno con le sue condizioni di inizio e fine, motivo per cui un `<div>` a volte inghiotte il Markdown che segue e a volte no.
- **Le definizioni di riferimento dei link**, i riferimenti a entità, l'espansione delle tabulazioni a quattro colonne, le interruzioni tematiche, le intestazioni ATX e setext, e la continuazione pigra delle citazioni.

CommonMark si ferma a quel nucleo apposta. Nessuna tabella, nessuna nota a piè di pagina, nessun testo depennato, nessun elenco di attività, nessun autolink su URL nudi. Il ragionamento è difendibile: il nucleo è quello che tutti già avevano in comune, e congelare le discussioni su di esso era il compito. La conseguenza è che un parser strettamente conforme rende la tua tabella come un paragrafo pieno di pipe, in silenzio e correttamente.

## Cosa aggiunge GFM, regola per regola

La specifica GFM nomina cinque estensioni. Quattro aggiungono sintassi; una toglie qualcosa. Ognuna ha regole abbastanza specifiche da far cadere in errore, e i guasti sono sempre silenziosi — una tabella non riconosciuta è solo testo.

**Tabelle.** Una riga di intestazione, una riga di separazione, poi zero o più righe di corpo. La riga di separazione è trattini con due punti opzionali: `:---` sinistra, `:---:` centro, `---:` destra. La regola che fa cadere in errore è che la riga di intestazione e quella di separazione devono contenere lo stesso numero di celle; se non lo fanno, il blocco non è affatto una tabella e ottieni pipe sulla pagina (verificato su github.github.com/gfm, l'8 settembre 2026). Le pipe iniziali e finali sono opzionali. Le righe di corpo con troppe poche celle vengono riempite con celle vuote e quelle con troppe vengono troncate. Le celle portano solo contenuto inline — nessun elenco, nessun blocco con fence, nessun secondo paragrafo dentro una cella — e una pipe letterale va scritta `\|`, anche dentro uno span di codice. La tabella finisce alla prima riga vuota o all'inizio di un altro blocco. La maggior parte di quello che va storto con le tabelle in conversione viene da queste ultime tre regole, e [le tabelle meritano una lettura a parte](/blog/markdown-tables-that-survive-conversion).

**Elementi di elenco con casella.** `[ ]`, `[x]` o `[X]` come prima cosa nel primo paragrafo di un elemento di elenco, seguiti da uno spazio. Deve essere un elemento di elenco: le stesse parentesi su una riga propria sono parentesi letterali. L'output è un `<input>` casella marcato `disabled`, motivo per cui una checklist convertita sembra disattivata nel browser — è il rendering specificato, non un bug nel convertitore. Le viste di issue e pull request di GitHub le rendono cliccabili attraverso la loro propria applicazione, il che non fa parte della sintassi.

**Testo depennato.** `~~text~~`. Un'interruzione di paragrafo chiude lo span, allo stesso modo in cui chiude l'enfasi. GitHub rende anche una singola tilde, e non ogni implementazione GFM la segue lì, quindi scrivi due tilde se il file andrà da qualche altra parte.

**Autolink.** Un URL nudo `http://`, `https://` o `www.`, e un indirizzo email nudo, diventano link senza parentesi angolari. Le regole sono più stringenti di quanto sembrino. L'URL deve iniziare all'inizio di una riga o seguire uno spazio o uno tra `*`, `_`, `~` e `(`. La punteggiatura finale viene tagliata dalla fine del link invece che inclusa. Una parentesi di chiusura è inclusa solo se le parentesi si bilanciano, motivo per cui un URL di Wikipedia che finisce con `(disambiguation)` di solito sopravvive e un URL dentro una parentetica di solito perde il suo ultimo carattere. Un underscore ovunque negli ultimi due segmenti del dominio annulla del tutto l'autolink. Gli autolink con parentesi angolari, `<https://example.com>`, sono CommonMark puro e funzionano sempre — l'estensione riguarda solo la forma nuda.

**HTML grezzo non permesso.** La sottrazione. GFM maschera la `<` di apertura di nove nomi di tag così che arrivino sulla pagina come testo visibile invece che come marcatura: `title`, `textarea`, `style`, `xmp`, `iframe`, `noembed`, `noframes`, `script` e `plaintext` (verificato su github.com/github/cmark-gfm, l'8 settembre 2026). È una regola di sicurezza di rendering che appartiene a GFM più che a Markdown, e vale la pena essere precisi su cosa non sia. Non è un sanitizzatore. Filtra nove nomi di tag per lista; non fa niente contro `onerror=` su un `<img>`, niente contro `javascript:` in un `<a href>`, e niente contro un `<svg>` con un handler sopra. Se stai convertendo un file scritto da qualcun altro, [ti serve ancora un vero sanitizzatore ad allow-list](/blog/sanitising-markdown-safely) dopo il parser.

Due cose sono comunemente credute parte di GFM e non lo sono. Le note a piè di pagina non sono nella specifica, anche se il sito di GitHub le rende. Nemmeno gli avvisi `> [!NOTE]`. Entrambi sono comportamenti di un solo renderer, aggiunti dopo che la specifica era stata scritta, e un parser che dichiara conformità GFM non ha torto a ignorarli.

## Cosa non è in nessuna delle due specifiche

Oltre quelle cinque estensioni il terreno smette di essere comune. Tutto quello che segue è comune, utile e non portabile — ognuno esiste in diverse sintassi, o in un solo strumento.

- **Note a piè di pagina** — `[^1]` nel testo, `[^1]:` in fondo. GitHub le rende, Pandoc le rende, remark-gfm le rende, e un parser CommonMark puro stampa le parentesi esattamente come sono state digitate.
- **Elenchi di definizioni** — un termine, poi righe che iniziano con `:`. Ereditati da PHP Markdown Extra. Pandoc, Python-Markdown, Goldmark e kramdown lo hanno, il mondo JavaScript perlopiù no.
- **Liste di attributi** — `{#my-id .warning}` dopo un'intestazione o uno span, per impostare un id, una classe o un attributo arbitrario. Integrato in Pandoc e kramdown, un'estensione ufficiale in Python-Markdown, un plugin in markdown-it, e assente in marked.
- **Formule matematiche** — `$...$` inline e `$$...$$` a blocco, passate a KaTeX o MathJax sulla pagina. Ogni implementazione la scrive diversamente, e parecchie hanno bisogno di un'opzione di passthrough perché il parser lasci stare il TeX invece di mangiare gli underscore come enfasi.
- **Avvisi** — `> [!NOTE]` su GitHub, `:::note` in Docusaurus e diversi altri framework, `!!! note` in MkDocs, una lista di attributi `{: .note}` in Jekyll. Quattro sintassi per un'idea, e nessuna specifica per nessuna di esse.
- **Front matter** — un blocco YAML delimitato da `---` in cima al file. I generatori di siti lo rimuovono e lo leggono come metadato. Un convertitore che non ne ha mai sentito parlare lo rende come contenuto, e il risultato è una riga orizzontale seguita dal tuo metadato come intestazione, perché `---` sotto una riga di testo è sintassi di intestazione setext.
- **Ancore delle intestazioni** — gli id `#section-title` che fanno funzionare un indice. Generati a tempo di rendering da GitHub, da ogni generatore, e da un plugin o un'opzione nella maggior parte delle librerie. Non è sintassi affatto, e l'algoritmo di slug differisce fra strumenti, quindi un collegamento scritto a mano può rompersi quando il renderer cambia.
- **Le più piccole** — abbreviazioni, apice e pedice, scorciatoie emoji come `:tada:`, wiki link `[[Page]]`, mermaid trattato come diagramma invece che come blocco di codice, e punteggiatura intelligente che trasforma le tue virgolette in curve che tu lo volessi o no.

## Confronto rapido: le varianti e i motori che le parlano

| Nome | Ideale per | Capacità principale | Prezzo |
| --- | --- | --- | --- |
| Markdown originale 1.0.1 | Riferimento storico | La pagina di sintassi del 2004 più `Markdown.pl` | Gratis, licenza in stile BSD |
| CommonMark | Risolvere una discussione sul parsing | Una specifica con una suite di test eseguibile | Gratis, specifica aperta |
| GitHub Flavored Markdown | L'obiettivo di default per qualunque cosa condivisa | CommonMark più cinque estensioni con nome | Gratis, specifica aperta |
| markdown-it (JS) | Correttezza con spazio per estendere | Conforme a CommonMark, maschera l'HTML grezzo di default | Gratis, MIT |
| marked (JS) | GFM senza decisioni da prendere | GFM attivo di default, una sola chiamata di funzione | Gratis, MIT |
| remark / unified (JS) | Riscrivere il documento, non solo renderlo | Un AST più remark-gfm e un ampio insieme di plugin | Gratis, MIT |
| Il Markdown di Pandoc | Documenti che hanno bisogno di note e formule | Estensioni con nome che attivi singolarmente | Gratis, GPL |
| Python-Markdown | Build Python e siti MkDocs | API di estensione ufficiale: tabelle, note, attr_list | Gratis, BSD |
| Goldmark (Go) | Programmi Go e siti Hugo | CommonMark più un pacchetto di estensioni GFM incluso | Gratis, MIT |
| kramdown (Ruby) | Jekyll e GitHub Pages | Un superset di Markdown con liste di attributi inline | Gratis, MIT |
| MDX | Siti di documentazione con componenti | JSX dentro Markdown, compilato invece che renderizzato | Gratis, MIT |

## Le varianti e le implementazioni, una alla volta

Quello che segue riguarda solo la variante — quali costrutti ognuna riconosce e come lo cambi. Quale scegliere come convertitore è [un confronto diverso](/blog/best-markdown-to-html-converters), su criteri diversi.

### Markdown originale 1.0.1 — l'antenato, non un obiettivo

La pagina di sintassi e lo script Perl di Gruber. È ancora il motivo per cui un file `.md` permette HTML grezzo affatto, e ancora la fonte di comportamenti che sopravvivono in strumenti scritti molto dopo di esso.

| Pro | Contro |
| --- | --- |
| La descrizione più corta della sintassi mai scritta | Ambigua esattamente nei punti dove le implementazioni non sono d'accordo |
| Spiega perché l'HTML grezzo passa attraverso di default | Nessuna tabella, nessun blocco di codice con fence, nessuna suite di test |
| Ancora la base per `markdown_strict` in Pandoc | Non mantenuto dalla 1.0.1 |

**Prezzo:** gratis, licenza in stile BSD.

**Dettagli tecnici e funzioni**

- Solo blocchi di codice indentati — il codice con fence è arrivato con varianti successive
- I tag HTML grezzi a livello di blocco passano attraverso intatti, e il Markdown al loro interno non viene analizzato
- Enfasi, link, immagini, citazioni, intestazioni ATX e setext, elenchi, righe orizzontali
- Nessuna specifica sull'indentazione degli elenchi annidati, che è l'ambiguità che tutto il resto ha ereditato

**Per chi conviene?** Per nessuno, come obiettivo. Leggila per capire perché un costrutto si comporta nel modo in cui si comporta, e scegli `markdown_strict` in Pandoc se hai davvero bisogno di sapere come un file si sarebbe reso nel 2004.

### CommonMark — il nucleo contro cui tutto il resto viene misurato

CommonMark è la specifica più `cmark`, la sua implementazione di riferimento in C. Il suo scopo è la conformità, non le funzioni, e la sua moderazione è la funzione.

| Pro | Contro |
| --- | --- |
| Ogni caso scomodo ha un esempio numerato e un output previsto | Nessuna tabella, elenco di attività, testo depennato o autolink nudi |
| Centinaia di casi di test, quindi la conformità è un fatto e non una dichiarazione | Una tabella si rende come paragrafo di pipe, in silenzio |
| Esistono implementazioni per la maggior parte dei linguaggi e puntano alla stessa suite | Nessun meccanismo di estensione, deliberatamente, nella specifica stessa |
| Il pavimento più sicuro contro cui scrivere | La maggior parte dei documenti reali ha bisogno di almeno un'estensione |

**Prezzo:** gratis, specifica aperta; `cmark` è gratuito con licenza BSD-2-Clause.

**Dettagli tecnici e funzioni**

- Definisce l'indentazione degli elenchi relativa alla colonna del contenuto del genitore, chiudendo la discussione sugli spazi
- Le sequenze di delimitatori left-flanking e right-flanking definiscono l'enfasi con precisione
- Sette tipi di blocco HTML, ognuno con condizioni di inizio e fine esplicite
- Le interruzioni forzate sono due spazi finali o una barra rovesciata finale; un a capo solitario è uno spazio
- L'HTML grezzo passa di default, che è una decisione della specifica e non una di sicurezza
- Implementazioni compagne includono comrak in Rust, e markdown-it e Goldmark puntano alla stessa suite

**Per chi conviene?** Per chiunque abbia bisogno di sapere cosa significa la sintassi invece di cosa fa uno strumento. Quando due renderer non sono d'accordo, gli esempi della specifica decidono chi ha il bug — e ricorrere a essa è più spesso la mossa giusta di quanto la gente si aspetti.

### GitHub Flavored Markdown — il default pratico

GFM è CommonMark più tabelle, elenchi di attività, testo depennato, autolink e il filtro HTML grezzo. È come si rende un README, e quello che la maggior parte dei tracker di issue e delle chat hanno copiato.

| Pro | Contro |
| --- | --- |
| Una specifica scritta, non solo il comportamento di un renderer | Ancora nessuna nota a piè di pagina, elenco di definizioni, formula matematica o attributo |
| Copre i costrutti che la maggior parte dei documenti usa davvero | Il filtro dei tag viene spesso confuso con un sanitizzatore |
| Ampiamente implementato, quindi un file GFM di solito viaggia | Il sito di GitHub rende cose che la specifica non definisce |
| Un superset stretto di CommonMark, quindi niente del nucleo cambia | Le regole degli autolink nudi sono più capricciose di quanto sembrino |

**Prezzo:** gratis, specifica aperta.

**Dettagli tecnici e funzioni**

- Tabelle con allineamento per colonna, solo contenuto inline, e una riga di separazione corrispondente richiesta
- Elementi di elenco con casella resi come input checkbox `disabled`
- Testo depennato con `~~`; GitHub accetta anche una singola tilde
- Autolink su URL e email nudi, con regole di punteggiatura finale e di parentesi bilanciate
- Nove nomi di tag HTML grezzi mascherati invece che passati attraverso
- Le note a piè di pagina e gli avvisi `> [!NOTE]` funzionano su GitHub e non sono nella specifica

**Per chi conviene?** A quasi tutti, per quasi ogni file condiviso. Se un documento deve rendersi su GitHub, in un sito di documentazione e come HTML convertito, GFM è l'intersezione che tutti e tre capiscono.

### markdown-it — CommonMark prima, estensioni su richiesta

Un parser JavaScript che segue la specifica CommonMark e aggiunge una piccola quantità sopra. La sua stessa descrizione è che "aggiunge estensioni di sintassi e zucchero (autolink su URL, typographer)" (verificato su github.com/markdown-it/markdown-it, l'8 settembre 2026).

| Pro | Contro |
| --- | --- |
| Supera la suite CommonMark, e spedisce un preset `commonmark` stretto | Gli elenchi di attività e le note a piè di pagina richiedono plugin |
| Maschera l'HTML grezzo di default, quindi il comportamento sicuro è il default | La qualità dei plugin varia nell'ecosistema |
| Le regole possono essere aggiunte, sostituite o riordinate a livello di blocco e inline | L'autolinking è disattivato finché non lo attivi |

**Prezzo:** gratis, licenza MIT.

**Dettagli tecnici e funzioni**

- Tre preset: `commonmark` per conformità stretta, `default`, e `zero` per costruire da zero
- Tabelle e testo depennato sono attivi nel preset di default; `linkify` e `breaks` sono disattivati
- `html: false` di default — l'HTML grezzo nella fonte viene mascherato, non passato attraverso
- I plugin coprono note a piè di pagina, contenitori per avvisi, attributi, ancore, elenchi di attività e formule matematiche
- La superficie dei plugin è documentata, quindi un'estensione può essere scritta invece che trovata

**Per chi conviene?** Squadre che vogliono la specifica seguita di default e ogni estensione attivata deliberatamente. È anche la variante che un gran numero di strumenti eredita, l'anteprima Markdown integrata di VS Code tra questi.

### marked — GFM senza una decisione da prendere

Un piccolo parser e compilatore JavaScript la cui variante di default è già quella che la maggior parte delle persone vuole.

| Pro | Contro |
| --- | --- |
| GFM attivo di default: tabelle, testo depennato, elenchi di attività, autolink | Nessun ecosistema di plugin di cui parlare; le estensioni sono tue da scrivere |
| Una funzione, un oggetto di opzioni | L'HTML grezzo passa attraverso, per design |
| Gira nel browser e in Node | Note a piè di pagina, elenchi di definizioni e formule matematiche non sono disponibili |

**Prezzo:** gratis, licenza MIT.

**Dettagli tecnici e funzioni**

- `gfm: true` di default; `breaks: false` di default, quindi un singolo a capo è uno spazio
- `breaks: true` riproduce il comportamento delle caselle di commento di GitHub invece del comportamento del README
- Un lexer che puoi chiamare separatamente per ispezionare i token invece dell'HTML
- I renderer personalizzati sovrascrivono come viene emesso qualunque tipo di nodo, che è come la maggior parte delle estensioni viene fatta
- Nessuna sanitizzazione: la risposta documentata è passare l'output attraverso DOMPurify

**Per chi conviene?** Chiunque abbia come variante di destinazione GFM puro e non abbia bisogno di niente oltre. È la strada più corta da un file GFM a HTML a forma di GFM, e il motivo per cui tanto software si comporta come GitHub con `breaks` impostato sbagliato.

### remark e unified — la variante come lista di plugin

remark analizza il Markdown in un albero di sintassi astratto. La variante non è un'impostazione; è quali estensioni hai aggiunto alla pipeline.

| Pro | Contro |
| --- | --- |
| remark-gfm copre tutte le cinque estensioni GFM, più le note a piè di pagina | L'opzione più pesante qui per un ampio margine |
| Front matter, formule matematiche e direttive hanno ognuno un plugin di prima classe | La pipeline unified richiede un vero apprendimento |
| L'HTML grezzo viene eliminato a meno che tu non lo permetta esplicitamente | Ogni estensione è una dipendenza da mantenere aggiornata |

**Prezzo:** gratis, licenza MIT.

**Dettagli tecnici e funzioni**

- mdast per Markdown, hast per HTML, con plugin per muoversi fra i due
- remark-gfm aggiunge tabelle, elenchi di attività, testo depennato, autolink e note a piè di pagina insieme
- remark-frontmatter analizza l'intestazione YAML invece di renderla come intestazione
- remark-directive dà contenitori `:::note`, che è come la maggior parte delle sintassi di avviso viene implementata
- Far passare l'HTML grezzo richiede `allowDangerousHtml`, quindi la scelta non sicura è esplicita

**Per chi conviene?** Squadre che hanno bisogno di una variante che nessuno spedisce — GFM più note a piè di pagina più direttive più una regola aziendale sul testo dei link — e sono disposte ad assemblarla e mantenerla.

### Il Markdown di Pandoc — una variante con un quadro di comando

Pandoc legge diversi dialetti Markdown e il proprio esteso, e ogni costrutto è un'estensione con nome che puoi attivare o disattivare singolarmente.

| Pro | Contro |
| --- | --- |
| Note a piè di pagina, elenchi di definizioni, attributi e formule matematiche sono integrati | Il suo dialetto non è quello che GitHub rende, il che sorprende la gente |
| Diverse sintassi di tabella, incluse tabelle a griglia con celle multi-riga | I nomi delle estensioni sono un vocabolario da imparare |
| Le varianti di lettura e scrittura si scelgono separatamente | L'HTML grezzo passa attraverso senza sanitizzazione |
| `markdown_strict`, `commonmark`, `gfm` e `commonmark_x` sono tutti disponibili | Richiede un'installazione e un terminale |

**Prezzo:** gratis, licenza GPL.

**Dettagli tecnici e funzioni**

- Varianti scelte per nome: `markdown`, `markdown_strict`, `markdown_phpextra`, `markdown_mmd`, `commonmark`, `commonmark_x`, `gfm`
- Estensioni attivate con `+nome` e `-nome` sul formato, per esempio `gfm+footnotes`
- Sintassi di attributo `{#id .class key=value}` su intestazioni, blocchi di codice, link e immagini
- `tex_math_dollars` per le formule matematiche, `fenced_divs` per contenitori in stile avviso, `definition_lists`, `footnotes`
- Le tabelle a griglia e multi-riga portano contenuto a blocco dentro le celle, cosa che le tabelle a pipe non possono fare

**Per chi conviene?** Chiunque scriva documenti invece che pagine: qualcosa con note a piè di pagina, citazioni, equazioni o un formato di output diverso da HTML. Ricorri a `gfm` esplicitamente quando il file deve anche rendersi su GitHub, perché il dialetto proprio di Pandoc accetterà volentieri sintassi che GitHub non può disegnare.

### Python-Markdown — le estensioni come API

L'implementazione Python di lunga data. La sua variante di base è più vicina al Markdown originale che a CommonMark, e la sua API di estensione è quella su cui è costruita una grande quantità di strumenti di documentazione.

| Pro | Contro |
| --- | --- |
| Estensioni ufficiali per tabelle, note a piè di pagina, elenchi di definizioni e liste di attributi | Non conforme a CommonMark in ogni dettaglio |
| `md_in_html` analizza Markdown dentro blocchi HTML grezzi, cosa che la maggior parte dei parser non fa | Gli elenchi di attività e il testo depennato richiedono estensioni di terze parti |
| L'estensione `admonition` è l'implementazione di riferimento di `!!! note` | Le differenze da GFM emergono nei casi limite degli elenchi e dell'enfasi |

**Prezzo:** gratis, licenza BSD.

**Dettagli tecnici e funzioni**

- Il pacchetto `extra` raggruppa tabelle, note a piè di pagina, elenchi di definizioni, abbreviazioni, liste di attributi, codice con fence e `md_in_html`
- `toc` genera id delle intestazioni e un indice; `smarty` fa la punteggiatura intelligente
- `nl2br` trasforma i singoli a capo in `<br>`, lo stesso interruttore che altri strumenti chiamano `breaks`
- `meta` legge un'intestazione di metadati, e MkDocs gestisce il front matter YAML sopra di essa
- Testo depennato, elenchi di attività e formule matematiche `$...$` vengono dalle PyMdown Extensions di terze parti

**Per chi conviene?** Script di build Python, e chiunque estenda MkDocs, dove è già il motore. Sii deliberato su quali estensioni sono attive: la variante è esattamente la lista nel tuo file di configurazione, e un file scritto contro una lista più piena perderà cose in silenzio.

### Goldmark — CommonMark con un interruttore GFM

Un parser conforme a CommonMark in Go, e il motore dentro Hugo. Le sue estensioni sono valori Go che componi invece di stringhe che configuri.

| Pro | Contro |
| --- | --- |
| Conforme a CommonMark, con un unico pacchetto `extension.GFM` per tutte le quattro aggiunte GFM | Solo Go |
| Elenchi di definizioni, note a piè di pagina e typographer sono di serie | Meno estensioni pronte all'uso rispetto all'ecosistema JavaScript |
| Il comportamento di attributi e passthrough è esplicito invece che implicito | Alcune scelte di variante arrivano attraverso la configurazione di Hugo, non quella di Goldmark |

**Prezzo:** gratis, licenza MIT.

**Dettagli tecnici e funzioni**

- `extension.GFM` raggruppa Table, Strikethrough, Linkify e TaskList (verificato su github.com/yuin/goldmark, l'8 settembre 2026)
- `extension.DefinitionList` e `extension.Footnote` implementano le sintassi di PHP Markdown Extra
- `html.WithHardWraps()` rende un a capo come `<br>`, la stessa opzione sotto un terzo nome
- `html.WithUnsafe()` è richiesto prima che l'HTML grezzo passi attraverso, quindi la maschera è il default
- I livelli di Hugo aggiungono hook di rendering e la propria configurazione sopra, che è dove vivono la maggior parte delle domande sulla variante di Hugo

**Per chi conviene?** Programmi Go, e utenti Hugo che cercano di capire perché un costrutto si rende su GitHub e non sul loro sito. La risposta è di solito un'estensione disponibile e non attivata.

### kramdown — un superset, non una variante di CommonMark

Un convertitore superset Markdown in puro Ruby, e il motore di default di Jekyll. Ha una sua sintassi per diverse cose che gli altri strumenti fanno in modo diverso, il che è un vero vantaggio dentro Jekyll e un vero problema fuori.

| Pro | Contro |
| --- | --- |
| Liste di attributi inline — `{: .warning}` — su quasi ogni blocco | Non conforme a CommonMark, e non dichiara di esserlo |
| Elenchi di definizioni, note a piè di pagina, abbreviazioni e formule matematiche integrate | Nessun elenco di attività o testo depennato nella sintassi principale |
| Le tabelle supportano un'intestazione e un separatore di piè di pagina | La sua sintassi propria non sopravvive alla lettura da parte di un altro strumento |
| Già installato se usi Jekyll o GitHub Pages | La gestione degli a capo è configurabile e non è il default di CommonMark |

**Prezzo:** gratis, licenza MIT (verificato su github.com/gettalong/kramdown, l'8 settembre 2026).

**Dettagli tecnici e funzioni**

- Scritto in Ruby, senza dipendenze obbligatorie per il parser Markdown
- Le liste di attributi inline impostano id, classi e attributi arbitrari senza scendere a HTML
- Le formule `$$...$$`, le note a piè di pagina e le definizioni di abbreviazione sono sintassi principale invece che plugin
- Un parser GFM separato è disponibile ed è quello che usa GitHub Pages, che non è lo stesso del dialetto proprio di kramdown
- Convertitore in HTML, LaTeX e ritorno a kramdown

**Per chi conviene?** Siti Jekyll, e solo per contenuto che resta lì dentro. Se una pagina scritta in kramdown deve essere letta altrove, le sue liste di attributi diventano parentesi graffe visibili.

### MDX — un linguaggio diverso che indossa una superficie familiare

MDX metteva componenti JSX dentro Markdown. Viene compilato in un componente invece che renderizzato in HTML, ed è costruito su remark, quindi la metà Markdown è la variante di remark.

| Pro | Contro |
| --- | --- |
| Un componente React in mezzo a un documento, con props | Non è Markdown: nessuno strumento Markdown semplice può leggerlo |
| La metà Markdown è CommonMark più qualunque plugin remark aggiungi | Richiede un passaggio di build e un framework JavaScript |
| Alimenta siti di documentazione dove prosa ed esempi interattivi si mescolano | Una `<` o una `{` vagante nella prosa diventa un errore di sintassi |

**Prezzo:** gratis, licenza MIT.

**Dettagli tecnici e funzioni**

- Compila in JavaScript, quindi l'output è un componente e non un file HTML
- Usa remark per Markdown e può prendere remark-gfm e il resto dell'insieme di plugin
- Le parentesi graffe sono espressioni, il che significa che una `{` letterale nella prosa deve essere mascherata
- Il front matter richiede un plugin, come dovunque altrove

**Per chi conviene?** Siti di documentazione che hanno bisogno di esempi dal vivo dentro la prosa, e nessuno che abbia bisogno che il file sia portabile. Un file MDX è codice sorgente che assomiglia a un documento.

## Le funzioni contro le implementazioni

Leggi in basso nella colonna per uno strumento, e attraverso la riga per una funzione. "Plugin" significa disponibile e non integrato; "estensione" significa spedita con il progetto ma disattivata finché non la attivi; "opzione" significa un booleano da qualche parte nella configurazione.

| Funzione | CommonMark | GFM | markdown-it | marked | remark | Pandoc | Python-Markdown | Goldmark | kramdown |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tabelle | No | Sì | Attivo di default | Attivo di default | remark-gfm | Integrato, diverse sintassi | Estensione `tables` | `extension.Table` | Integrato |
| Elementi di elenco con casella | No | Sì | Plugin | Attivo di default | remark-gfm | Estensione `task_lists` | Estensione di terze parti | `extension.TaskList` | No |
| Testo depennato | No | Sì | Attivo di default | Attivo di default | remark-gfm | Estensione `strikeout` | Estensione di terze parti | `extension.Strikethrough` | No |
| Autolink su URL nudi | No | Sì | Opzione `linkify` | Attivo di default | remark-gfm | `autolink_bare_uris` | Estensione di terze parti | `extension.Linkify` | No |
| HTML grezzo di default | Passato attraverso | Nove tag mascherati | Mascherato | Passato attraverso | Eliminato a meno che permesso | Passato attraverso | Passato attraverso | Mascherato a meno di unsafe | Passato attraverso |
| Note a piè di pagina | No | Non nella specifica; GitHub le rende | Plugin | No | remark-gfm | Estensione `footnotes` | Estensione `footnotes` | `extension.Footnote` | Integrato |
| Elenchi di definizioni | No | No | Plugin | No | Plugin | `definition_lists` | Estensione `def_list` | `extension.DefinitionList` | Integrato |
| Liste di attributi | No | No | Plugin | No | Plugin | Integrato | Estensione `attr_list` | Di terze parti | Integrato |
| Formule matematiche | No | No | Plugin | No | remark-math | `tex_math_dollars` | Estensione di terze parti | Passthrough o di terze parti | Integrato |
| Contenitori di avviso | No | No | Plugin | No | remark-directive | `fenced_divs` | Estensione `admonition` | Di terze parti | Liste di attributi |
| Front matter | No | No | Plugin | No | remark-frontmatter | Integrato per il proprio formato | Estensione `meta` | Gestito da Hugo | Gestito da Jekyll |
| Id delle intestazioni | No | Aggiunti da GitHub a tempo di rendering | Plugin | Estensione | Plugin | Integrato | Estensione `toc` | Di terze parti | Integrato |
| A capo come `<br>` | No | No | Opzione `breaks` | Opzione `breaks` | remark-breaks | `hard_line_breaks` | Estensione `nl2br` | `WithHardWraps` | Opzione |

Due schemi in quella tabella valgono più delle singole celle. Il primo è che gli strumenti JavaScript non sono d'accordo soprattutto sui default, non sulle capacità: markdown-it e marked possono entrambi rendere un file GFM, ma di serie uno maschera il tuo HTML grezzo e l'altro no. Il secondo è che gli strumenti con la sintassi più ricca — Pandoc, Python-Markdown, kramdown — sono quelli i cui file viaggiano peggio, perché la ricchezza sta tutta in estensioni che niente altro implementa.

## Come capire quale variante parla uno strumento

Non leggere la documentazione. Tieni un file sonda, incollalo, e leggi cosa torna.

```markdown
| Feature | Renders |
| --- | --- |
| tables | yes? |

- [x] a checkbox
- [ ] or literal brackets

~~Strikethrough~~ and a bare URL: https://example.com

Term
: A definition, or a paragraph starting with a colon.

A footnote reference.[^1]

Heading with an attribute
{: .probe}

Line one
line two

[^1]: Only some tools render this.
```

Nove risposte da un solo incolla, nell'ordine che conta. Una tabella disegnata, delle caselle, testo depennato e un link vivo coprono le quattro estensioni di sintassi GFM — se compaiono tutte e quattro, hai almeno GFM. Una definizione indentata significa che lo strumento va oltre GFM nel territorio di PHP Markdown Extra. Una nota a piè di pagina resa significa la stessa cosa. Delle parentesi graffe `{: .probe}` visibili significano nessuna lista di attributi, il caso della maggior parte degli strumenti. E se "line two" sta sulla sua riga propria, `breaks` è attivo, cosa che vale la pena sapere prima di scrivere dieci pagine contro l'assunzione sbagliata.

Aggiungi un `$x^2$` e una riga `> [!NOTE]` se ti interessano le formule matematiche o gli avvisi. Il punto del file è che ci vogliono dieci secondi e sostituisce un pomeriggio di ipotesi.

## Dove GFM — la scelta ovvia — fallisce, e cosa costa

GFM è la scelta giusta di default, e vale la pena essere onesti sui quattro punti in cui finisce la corda.

**Non ha note a piè di pagina, e nemmeno tu.** GitHub rende le note a piè di pagina, quindi la gente le scrive, e non sono nella specifica. Un parser GFM che ignora `[^1]` è conforme. Se il tuo documento ha davvero bisogno di note, hai lasciato GFM che tu lo volessi o no, e il costo è che il tuo file dipende ora dall'elenco di estensioni di uno strumento specifico invece che da una specifica — [quali strumenti rendono la sintassi delle note e quali stampano le parentesi](/blog/markdown-footnotes-support) è la lista da controllare prima di scrivere cento note.

**Non ha attributi, quindi la stilizzazione significa HTML grezzo.** Non c'è modo in GFM di metter una classe su un paragrafo. O scendi a un `<div>` — che ti mette in mano al comportamento del renderer riguardo all'HTML grezzo, e al filtro dei tag se è un renderer GFM — oppure accetti la stilizzazione di default. Pandoc e kramdown hanno risolto questo da anni, e le loro soluzioni non viaggiano.

**Il filtro dei tag non è sicurezza.** Nove nomi di tag mascherati sono una lista, non una politica. Chiunque converta Markdown di terze parti pensando che la conformità GFM lo protegga è a un `<img onerror=>` dal scoprire il contrario. La sanitizzazione avviene dopo il parsing, contro un allow-list, ed è un lavoro separato dalla scelta di una variante.

**La questione degli a capo non ha una risposta giusta.** Le caselle di commento di GitHub trasformano un singolo a capo in un `<br>`; la specifica dice che un singolo a capo è uno spazio; il rendering dei README segue la specifica. Quindi lo stesso testo può rendersi in due modi sullo stesso sito, e ogni strumento a valle deve scegliere uno. TransformPipe converte con GFM attivo e `breaks` disattivato, il che corrisponde alla specifica e al rendering dei README più che alla casella di commento, perché un documento è più vicino a un README che a un commento. Qualunque cosa scelga uno strumento, i paragrafi di qualcuno vengono fuori sbagliati, ed è il problema di variante segnalato più spesso che esista.

Il costo di tutti e quattro, insieme, è che "GFM" ti dice cosa si renderà e non cosa avrà un aspetto giusto. È un pavimento, non un rifinito.

## Come scegliere una variante

1. **Scrivi per il lettore più severo della catena.** Se un file deve rendersi su GitHub, in un sito di documentazione e come HTML convertito, usa solo quello che tutti e tre supportano, perché il parser più debole decide cosa vede chi legge e non ti avviserà.
2. **Scegli la variante prima dello strumento, non dopo.** Decidere che hai bisogno di note a piè di pagina e formule matematiche ti dice di installare Pandoc; decidere che hai bisogno che un README si renda ti dice che GFM basta. Farlo nell'ordine sbagliato significa scoprire il limite a metà di un documento.
3. **Tieni ogni estensione vicino allo strumento che la possiede.** Il front matter appartiene a un repository che un generatore legge, non a un file che consegni a un convertitore che lo renderà come intestazione. Una lista di attributi appartiene al sito Jekyll, non al file che mandi per email.
4. **Tratta i default come parte della variante.** Due librerie possono entrambe dichiarare GFM e differire su HTML grezzo, autolinking e a capo, il che sono tre occasioni per un file di rendersi diversamente senza che nessuno abbia cambiato una parola.
5. **Converti un file rappresentativo prima di impegnarti.** Non un file hello-world: quello con la tabella, la checklist, l'URL lungo tra parentesi e la nota a piè di pagina. Dieci secondi di sonda battono una riscrittura, ed è il solo modo per vedere un guasto silenzioso mentre è ancora economico.

## Conclusione

CommonMark è il nucleo, GFM è il nucleo più cinque estensioni con nome, e tutto il resto che hai mai digitato in un file `.md` è l'estensione di qualcuno che si ferma al confine del suo strumento. Questa è tutta la mappa, ed è abbastanza per prevedere quasi ogni differenza di rendering che incontrerai. Scrivi GFM di default, ricorri a Pandoc quando il documento ha bisogno di note a piè di pagina o equazioni, tieni il front matter e le liste di attributi nei progetti che le capiscono, e verifica prima di impegnarti. Se GFM è dove ti fermi, [convertirlo in HTML](/) nel browser ti mostrerà esattamente in cosa è diventato ogni costrutto — la fonte HTML è proprio lì accanto all'anteprima, così puoi controllare la tabella invece di sperarci.

## Domande frequenti

### Qual è la differenza tra CommonMark e GFM?

GFM è la specifica CommonMark più cinque estensioni con nome: tabelle, elementi di elenco con casella, testo depennato, autolink su URL nudi, e un filtro che maschera nove nomi di tag HTML grezzi. Le regole di parsing del nucleo sono identiche, perché GFM è definito come superset stretto. Qualunque altra cosa differisca fra due renderer non è una differenza CommonMark-contro-GFM — è un'estensione che uno dei due ha e l'altro no.

### GFM è un superset di CommonMark?

Sì, e la specifica lo dice esplicitamente. Ogni documento CommonMark valido è un documento GFM valido che si rende allo stesso modo, con la sola eccezione dei nove tag HTML grezzi filtrati, che GFM maschera e CommonMark passa attraverso. Ecco perché scrivere CommonMark puro è il modo più sicuro di rendere un file portabile.

### CommonMark supporta le tabelle?

No. Le tabelle non sono nella specifica CommonMark, e un parser strettamente conforme rende una tabella a pipe come un normale paragrafo contenente caratteri pipe. Il guasto è silenzioso, quindi se una tabella è uscita come testo il tuo parser probabilmente sta facendo esattamente quello che gli è stato detto di fare. Le tabelle arrivano con GFM o con un'estensione specifica dello strumento.

### Le note a piè di pagina fanno parte di GitHub Flavored Markdown?

Non nella specifica, nonostante il sito di GitHub le renda. Le note a piè di pagina sono un'estensione che Pandoc, remark-gfm, Python-Markdown, Goldmark e kramdown implementano tutti in modi che sembrano compatibili, e che un parser GFM puro ha il diritto di ignorare. Se il tuo documento ne ha bisogno, scegli uno strumento in base a quel requisito invece che alla conformità GFM.

### Perché il mio Markdown si rende diversamente su GitHub e nel mio convertitore?

Tre cause solite, in ordine di probabilità. L'impostazione degli a capo: le caselle di commento di GitHub trattano un singolo a capo come `<br>` e la specifica no. Un'estensione: note a piè di pagina, front matter, avvisi e formule matematiche si rendono tutte su GitHub o in un generatore e non sono in nessuna delle due specifiche. Oppure un costrutto non del tutto valido — una tabella la cui riga di separazione ha il numero sbagliato di celle, per esempio — da cui GitHub e il tuo convertitore possono recuperare in modo diverso.

### In quale variante di Markdown dovrei scrivere?

GFM, a meno che qualcosa non ti ci costringa fuori. È specificato, ampiamente implementato, e copre tabelle, checklist e testo depennato, che è la maggior parte di quello che un documento reale usa. Passa al dialetto di Pandoc quando hai bisogno di note a piè di pagina, elenchi di definizioni o equazioni, e accetta che il file resti allora legato a Pandoc.

### Cosa fa un convertitore Markdown con il front matter YAML?

Dipende interamente da se lo strumento ne ha mai sentito parlare, perché il front matter non è in nessuna delle due specifiche. Un generatore lo rimuove e lo legge come metadato; un convertitore semplice lo rende come contenuto, il che produce una riga orizzontale seguita dal tuo metadato come intestazione setext. Se stai consegnando file a un convertitore, elimina prima l'intestazione oppure scegli uno strumento con un'opzione per il front matter.
