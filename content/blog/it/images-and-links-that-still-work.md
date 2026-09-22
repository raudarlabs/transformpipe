---
title: "Immagini e link che funzionano ancora dopo aver inviato il file"
description: "Percorsi relativi, URL raw di GitHub, data URI, alt text, SVG e ancore: perché un link o un’immagine si rompe quando il file si sposta, e come risolverlo."
updated: 2026-09-09
date: 2026-08-01
tag: Sintassi
keywords: immagine markdown non si vede, link relativo markdown, ancora markdown a un'intestazione, immagine base64 markdown, html autonomo, html in un unico file, dimensione immagine markdown, alt text markdown, url raw immagine github, immagine svg markdown, controllo link rotti markdown
---

Un file Markdown viene scritto dentro una cartella, e metà del suo contenuto dipende silenziosamente da quella cartella. `![Flow](img/flow.png)` sembra giusto nell'editor, sembra giusto nel repository, e mostra un'icona di immagine rotta nel momento in cui un collega apre l'HTML convertito dalla sua cartella Download. Niente nel file è cambiato. Sono cambiati i suoi vicini.

### In breve

Le immagini e i link incrociati si risolvono contro il posto dove finisce la pagina renderizzata, non contro la cartella in cui hai scritto, quindi spostare il file sposta la risposta. Gli URL pubblici assoluti e i data URI sopravvivono al viaggio; i percorsi relativi e quelli root-relative sopravvivono solo se la cartella o il sito viaggiano con loro. Le ancore di intestazione si rompono per un motivo diverso — GitHub, Pandoc, markdown-it e marked trasformano ognuno un'intestazione in un id in modo diverso, quindi un link che funziona nel repository può mancare nell'esportazione. Converti una volta, leggi i valori `src` e `href` che il convertitore ha effettivamente prodotto, e correggi quelli che si risolvono solo dalla tua scrivania.

Il fallimento ha una firma: chi lo ha scritto non lo vede mai. Sulla macchina dove il documento è stato scritto ogni percorso si risolve, perché è quella la macchina per cui i percorsi sono stati scritti. Il lettore ottiene riquadri grigi con icone d'angolo strappato, decide che il documento è a metà, e di solito non dice niente.

Sono coinvolti due sistemi separati e falliscono per motivi che non hanno niente in comune. Un'immagine è un riferimento a byte memorizzati altrove, e si rompe quando quell'altrove si sposta. Un'ancora è un riferimento a un id che il renderer ha inventato durante la conversione, e si rompe quando un renderer diverso inventa un id diverso. Entrambi sono promesse su un posto, ed entrambi vengono verificati nel momento in cui qualcun altro apre il file — il momento peggiore possibile per scoprirlo.

## I tre tipi di percorso, e cosa sopravvive a ciascuno

Un URL in Markdown arriva in poche forme, ognuna presumendo qualcosa di diverso su dove finirà il documento.

| Scritto come | Tipo | Risolto contro | Sopravvive all'invio? |
| --- | --- | --- | --- |
| `img/flow.png` | relativo | la cartella da cui viene servita la pagina | solo se quella cartella viaggia insieme |
| `../assets/flow.png` | relativo | la cartella sopra di essa | lo stesso, e ancora più fragile |
| `/assets/flow.png` | root-relative | la radice del sito attuale | solo dentro lo stesso sito |
| `https://example.com/flow.png` | assoluto | niente, è già completo | sì, finché l'host lo serve |
| `data:image/png;base64,…` | nessuno — i byte sono qui | niente affatto | sì, a un costo in dimensione |

Il dettaglio che coglie la gente di sorpresa: un link relativo markdown si risolve contro l'URL della *pagina renderizzata*, non contro la cartella dove viveva il file `.md`. Converti `docs/guide.md`, apri l'HTML dal tuo desktop, e `img/flow.png` significa ora una cartella `img` sul tuo desktop. Il percorso non è mai stato sbagliato; stava rispondendo a una domanda che nessuno fa più.

Root-relative è la forma che le persone giudicano peggio. Una barra iniziale non significa “la cima del mio progetto” — significa la radice di qualunque origine stia servendo la pagina. Fai il deploy dello stesso file su un sito dove le risorse vivono in `/assets/`, ed è la più stabile delle forme relative. Aprilo come file locale, e il browser legge la barra come la radice del disco: `/assets/flow.png` diventa `C:\assets\flow.png` su Windows e `/assets/flow.png` su un Mac, nessuno dei quali esiste. I percorsi root-relative sono per i siti. Sono attivamente peggiori dei semplici percorsi relativi per un file che qualcuno scarica.

Gli URL assoluti sopravvivono a tutto tranne all'host. Sono la sola forma che funziona identicamente in un repository, un'esportazione, un wiki e un'email — a patto che l'host sia pubblico, resti online, e non abbia niente in contrario a essere collegato da altrove. Quest'ultima clausola fa più lavoro di quanto sembri: immagini servite da un bucket privato, dal CDN di uno strumento di chat, da un allegato Confluence o da un URL firmato tornano tutte come indirizzi che sembrano assoluti e funzionano solo mentre il lettore porta la tua sessione o prima che la firma scada.

### Dove finisce il file, e quali percorsi si risolvono ancora

Lo stesso documento va in cinque posti nel corso della sua vita. Ecco cosa succede a ogni tipo di percorso in ogni tappa.

| Destinazione | `img/flow.png` | `../assets/flow.png` | `/assets/flow.png` | `https://…/flow.png` | Data URI |
| --- | --- | --- | --- | --- | --- |
| Il `.md` renderizzato su una pagina del repository | funziona | funziona, se la cartella superiore è nel repository | fallisce — si risolve contro la radice del code host | funziona | funziona |
| Un file HTML convertito nella cartella Download di qualcuno | fallisce a meno che non copi anche `img/` | fallisce | punta alla radice del suo disco | funziona, con una connessione | funziona |
| Il corpo di un'email | fallisce | fallisce | fallisce | solo se il client accetta di scaricare immagini remote | funziona |
| Un sito statico con le risorse pubblicate insieme | funziona | funziona, finché non sposti la pagina | funziona | funziona | funziona |
| Un PDF stampato dal browser | integrato solo se si risolveva al momento della stampa | uguale | uguale | uguale | funziona |
| Incollato in un wiki o in un ticket | fallisce | fallisce | fallisce | funziona se l'host è pubblico | di solito rimosso dal sanitizzatore del wiki |

La riga del PDF è quella su cui vale la pena fermarsi. Stampare non corregge un percorso rotto, lo fotografa: quello che il browser aveva in quel momento è quello che finisce nel file, quindi un documento stampato sulla macchina di chi lo ha scritto sembra perfetto e un documento stampato da chi lo riceve ha buchi esattamente negli stessi punti in cui li aveva il suo schermo. Se un PDF è la destinazione, sistema prima le immagini: stampare presume che la pagina si renderizzi già.

### GitHub: un URL blob è una pagina, non un'immagine

Apri un'immagine in un repository, copia quello che c'è nella barra degli indirizzi, e ottieni qualcosa come `https://github.com/acme/docs/blob/main/assets/flow.png`. Incollalo in `![Flow](…)` e il lettore ottiene un'immagine rotta, perché quell'URL non restituisce un PNG. Restituisce una pagina HTML — il visualizzatore di file, con l'intestazione, il breadcrumb, la barra laterale e l'immagine dentro. Il browser ha chiesto un'immagine e ha ricevuto una pagina web, quindi ha disegnato l'icona di immagine rotta.

| Forma dell'URL | Cosa restituisce il server | Usabile in `![]()`? |
| --- | --- | --- |
| `https://github.com/o/r/blob/main/a/flow.png` | una pagina HTML che mostra l'immagine | no |
| `https://github.com/o/r/blob/main/a/flow.png?raw=true` | un redirect ai byte del file | sì |
| `https://raw.githubusercontent.com/o/r/main/a/flow.png` | i byte del file | sì |
| `assets/flow.png`, relativo, dentro un `.md` nel repository | risolto contro la cartella del file stesso | sì, sulla pagina del repository |

La guida ufficiale di GitHub è di preferire i link relativi per le immagini che vivono nel repository, e dà `../blob/main/assets/images/electrocat.png?raw=true` come forma da usare dentro issue, pull request e commenti — con l'avvertenza che quelle forme funzionano in un repository privato solo per chi ha già accesso in lettura (verificato su docs.github.com, il 9 settembre 2026).

Due ulteriori trappole vivono in quegli URL. Il nome del branch fa parte dell'indirizzo, quindi `…/blob/main/…` segue `main` e si sposta quando `main` si sposta, mentre `…/blob/a1b2c3d/…` è fissato a un commit e non cambia mai — scegli deliberatamente, perché un diagramma che si aggiorna in silenzio è o esattamente quello che volevi o un documento che cita un'immagine che non corrisponde più alla sua prosa. E un URL raw da un repository privato non è un URL pubblico; ha bisogno della sessione del lettore nello stesso modo di un allegato di chat, motivo per cui uno screenshot incollato da Slack si renderizza per te e per nessun altro.

## Perché un'immagine Markdown non si vede

Quando un'immagine markdown non appare, la causa è quasi sempre una di queste.

- **Il percorso punta alla vecchia posizione.** Sposti il file, sposti le immagini, oppure passa agli URL assoluti.
- **Il maiuscolo/minuscolo non corrisponde.** `Diagram.PNG` e `diagram.png` sono un solo file su un disco Mac o Windows, che ignora il maiuscolo/minuscolo per default, e due sulla macchina Linux che serve il tuo sito.
- **C'è uno spazio nel nome del file.** Racchiudi la destinazione in parentesi angolari, `![Flow](<my diagram.png>)`, oppure codificala in percentuale come `my%20diagram.png`.
- **L'immagine è dietro un login.** Gli URL incollati da uno strumento di chat, un repository privato o un wiki di solito richiedono la sessione del lettore; un estraneo non ottiene niente.
- **Hai collegato una pagina invece di un file.** Il caso dell'URL blob visto sopra, e lo stesso errore succede con i drive cloud, che distribuiscono un URL di visualizzazione invece dei byte.
- **La pagina è HTTPS e l'immagine è HTTP.** I browser bloccano i contenuti misti, in silenzio, e la console è il solo posto in cui lo dice.
- **Un sanitizzatore ha rimosso il tag.** Una lista di elementi permessi che consente `img` può ancora rifiutare una sorgente `data:` o un elemento `svg`, e quello che rifiuta lo elimina.
- **Il tag non è mai stato un tag.** Un `\!` con escape, un'immagine dentro un blocco di codice delimitato, o un apice inverso vagante, e il renderer ha emesso testo che sembra un tag immagine perché lo è.

Il modo più rapido per distinguere questi casi è smettere di indovinare e chiedere al browser. Apri la pagina, apri il pannello di rete, ricarica, e leggi il codice di stato dell'immagine fallita.

| Cosa vedi | Cosa dice il pannello di rete | Di solito significa |
| --- | --- | --- |
| Icona rotta, alt text visibile | 404 | il percorso è sbagliato per dove la pagina viene servita |
| Icona rotta | 403 | repository privato, URL firmato scaduto, o protezione anti-hotlink |
| Icona rotta | 200 con `text/html` | hai collegato una pagina, non un file |
| Niente, nessuna richiesta affatto | nessuna voce | escaped, rimosso dal sanitizzatore, o dentro un blocco di codice |
| A posto per te, rotto per loro | 200 per te | l'immagine è dietro la tua sessione |

Quella tabella è anche il motivo per controllare il file *convertito* piuttosto che l'anteprima dell'editor. Un'anteprima risolve i percorsi contro la cartella dove sta la fonte, che è esattamente l'assunzione che smette di valere nel momento in cui il documento viaggia.

## Data URI, e l'aritmetica dietro di essi

Un data URI mette i byte nel documento: un'immagine base64 markdown è un'immagine ordinaria con il file codificato dove starebbe il percorso.

```markdown
![Company logo](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...)
```

Il compromesso onesto: base64 codifica tre byte come quattro caratteri, quindi l'immagine cresce di circa un terzo prima ancora di contare il resto del documento. Uno screenshot di 2 MB arriva come circa 2,7 MB di testo seduto in mezzo alla tua prosa, impossibile da diffare, e rimandato con ogni copia. I browser non possono nemmeno metterlo in cache separatamente.

Fai l'aritmetica prima di decidere, perché il moltiplicatore è fisso e i numeri diventano scomodi in fretta. Base64 legge tre byte e scrive quattro caratteri, quindi 4/3 è il minimo — circa un aumento del 33% — e il padding più eventuali interruzioni di riga lo spingono un po' oltre.

| L'immagine sul disco | Codificata in base64 | Cosa significa in pratica |
| --- | --- | --- |
| Icona di 12 KB | circa 16 KB | gratis; ne incorpori decine senza notarlo |
| Diagramma di 120 KB | circa 160 KB | comodo |
| Screenshot di 800 KB | circa 1,1 MB | tre di questi dominano il documento |
| Fotografia di 2 MB | circa 2,7 MB | un'immagine è ora gran parte del file |
| Fotografia di 4 MB | circa 5,4 MB | oltre la maggior parte dei limiti sensati per conto suo |

Quei limiti sono reali, non teorici. Il convertitore dietro questo sito limita una singola conversione a 10 MB e un documento tenuto in un account a 4 MB, perché la funzione Vercel sottostante rifiuta qualunque richiesta o risposta con un corpo oltre i 4,5 MB con un 413 (verificato su vercel.com, il 9 settembre 2026). Ogni impostazione di hosting ha da qualche parte un numero come questo, e base64 è il modo più veloce per trovarlo.

Gli altri costi non si misurano in byte. Un'immagine incorporata non può essere messa in cache separatamente, quindi chi apre il documento due volte lo scarica due volte. Non può essere diffata: cambia un pixel e la cronologia del controllo versione registra una modifica di mille righe senza contenuto leggibile. Non può essere sostituita senza modificare il file di prosa. E ogni forward, ogni risposta, ogni copia porta tutto di nuovo.

Questo rende i data URI giusti per un insieme ristretto di casi: un'icona, un logo, un piccolo diagramma, una firma, un grafico in un documento che deve viaggiare da solo e arrivare completo. Per documenti pieni di screenshot, ospita le immagini e usa URL assoluti — oppure accetta che il documento è ora un file di 15 MB e mandalo di proposito invece che per caso.

Il compromesso vale la pena farlo più spesso di quanto le persone si aspettino, perché quello che ottieni indietro è un file senza dipendenze. [Cosa promette davvero “autonomo”](/blog/self-contained-html-explained) è una pagina i cui stili sono già dentro di essa; metti dentro anche le immagini e hai un documento che si renderizza identicamente su un portatile in un hotel senza connessione, su una macchina aziendale bloccata che rifiuta host sconosciuti, e in tre anni quando il bucket dove vivevano le immagini è stato cancellato. Niente altro in questa pagina ti dà questo.

## Alt text, dimensionamento, SVG e tema: gli attributi che Markdown non ha

La sintassi delle immagini di Markdown ha esattamente tre slot — un URL, un alt text, e un titolo opzionale — e tutto il resto che le persone vogliono da un'immagine vive fuori da essi. Quel vuoto è dove l'HTML grezzo entra in un file Markdown, ed è dove i convertitori cominciano a non essere d'accordo tra loro.

### L'alt text è ciò che uno screen reader legge

L'alt text non è una didascalia. Una didascalia è visibile a tutti e sta accanto all'immagine; l'alt text sostituisce l'immagine per un lettore che non la sta ricevendo. MDN lo dice chiaramente: l'attributo “contiene un testo sostitutivo per l'immagine”, e gli screen reader leggono il valore ad alta voce così i loro utenti sanno cosa significa l'immagine (verificato su developer.mozilla.org, il 9 settembre 2026). È anche quello che il browser disegna nel vuoto quando il percorso è sbagliato, il che lo rende la cosa più utile in un documento le cui immagini si sono rotte.

Quindi scrivi quello che l'immagine *dice*, non quello che *è*. “Diagramma di architettura” non dice niente a chi ascolta. “Le richieste arrivano alla coda, un worker scrive sullo store, l'API legge da esso” è la stessa informazione che un lettore vedente prende dal diagramma in due secondi.

L'eccezione è un'immagine che non dice niente: un divisore, uno spazio vuoto, un fregio decorativo. Per quelle, una stringa vuota è corretta e deliberata. MDN: impostare `alt=""` “indica che questa immagine non è una parte essenziale del contenuto (è decorazione o un pixel di tracciamento), e che i browser non visivi possono ometterla” — e anche i browser visivi nascondono l'icona di immagine rotta quando l'alt è vuoto e l'immagine non si è mostrata (verificato su developer.mozilla.org, il 9 settembre 2026). Un alt vuoto è una doppia vittoria: lo screen reader resta in silenzio, e un'immagine decorativa rotta non lascia nessuna cicatrice sulla pagina.

Il terzo slot di Markdown è il titolo. `![Flow](img/flow.png "Figure 3: the ingest path")` mette quella stringa tra virgolette in un attributo `title`, e la maggior parte dei convertitori la emette fedelmente. Quasi niente di utile succede dopo. Un `title` appare come un suggerimento al passaggio del mouse, quindi è invisibile su qualunque dispositivo touch, non affidabile con le tecnologie assistive, e sparisce del tutto se la lista di elementi permessi del sanitizzatore non include l'attributo. Trattalo come decorazione. Se le parole contano, mettile nella prosa sotto, dove ogni lettore le riceve.

| Scrivi | Cosa esce | Chi lo riceve davvero |
| --- | --- | --- |
| `![Ingest path](flow.png)` | `alt="Ingest path"` | gli utenti di screen reader, e chiunque la cui immagine sia fallita |
| `![](rule.png)` | `alt=""` | nessuno, di proposito — nessun annuncio, nessuna icona rotta |
| `![Ingest path](flow.png "Figure 3")` | `alt="Ingest path" title="Figure 3"` | un passaggio del mouse, se l'attributo è sopravvissuto |
| Una riga in corsivo sotto l'immagine | un paragrafo ordinario | tutti, sempre |

### Il dimensionamento: non c'è sintassi, quindi le persone ricorrono all'HTML

Né CommonMark né GitHub Flavored Markdown hanno una larghezza. Non c'è `![Flow](flow.png){width=400}`, nessuna percentuale, nessun `=400x`. Alcuni editor implementano un'estensione propria per la dimensione, e un'estensione non è una specifica: dove non è implementata, il lettore vede i caratteri letterali in mezzo alla frase.

Quindi la mossa abituale è HTML grezzo, `<img src="flow.png" width="400" alt="Ingest path">`, e questo ha tre possibili esiti secondo il convertitore.

| Il convertitore | Cosa succede a `<img … width="400">` |
| --- | --- |
| Fa passare l'HTML grezzo | funziona, e così tutto il resto nel file |
| Fa l'escape dell'HTML grezzo per default | il lettore vede il tag come testo visibile |
| Sanitizza contro una lista di elementi permessi | l'`img` sopravvive, il `width` forse no, e l'immagine si renderizza a piena dimensione |

Il terzo è quello che confonde, perché funziona a metà. L'immagine appare, alla dimensione con cui è stata salvata, e niente da nessuna parte dice che un attributo è stato scartato. Una lista di elementi permessi è un elenco di ciò che è consentito, quindi un attributo a cui nessuno ha pensato di aggiungere è semplicemente assente — che è il comportamento corretto per un controllo di sicurezza e uno sconcertante per chi scrive. È il caso più chiaro per [scrivere il frammento direttamente in HTML](/blog/markdown-vs-html) quando un documento dipende davvero dal layout.

La risposta durevole è ridimensionare il file. Un diagramma che verrà mostrato a 400 pixel, salvato a 400 pixel, non ha bisogno di nessun attributo, non può perderne uno, è più piccolo da inviare, ed è più nitido della stessa immagine ridotta da un browser. Correggerlo nell'immagine è una correzione che sopravvive a ogni convertitore.

### SVG: inline contro collegato, e dove entra lo script

Un SVG non è un file immagine nel senso in cui lo sono gli altri. È XML, e il formato include un proprio elemento `<script>` — MDN lo descrive come l'equivalente SVG di quello HTML, che usa `href` invece di `src` (verificato su developer.mozilla.org, il 9 settembre 2026) — insieme ad attributi di evento e alla capacità di fare riferimento a risorse esterne.

Se questo conta dipende interamente da come il file entra nel documento.

Referenziato come immagine, è un'immagine e il browser lo tratta come tale. L'elenco di MDN delle restrizioni su SVG usato come immagine è esplicito: JavaScript è disabilitato, risorse esterne come immagini e foglio di stile non possono essere caricate, gli stili dei link `:visited` non vengono renderizzati, e lo stile nativo dei widget della piattaforma è disattivato. Quelle restrizioni si applicano quando l'SVG è caricato tramite `<img>`, un `background-image` CSS, un `drawImage()` di canvas e contesti simili — e non si applicano quando il file viene aperto direttamente o incorporato tramite `<iframe>`, `<object>` o `<embed>` (verificato su developer.mozilla.org, il 9 settembre 2026).

Inline, non è affatto un'immagine. Incollare markup `<svg>…</svg>` nel tuo Markdown mette quegli elementi nel DOM proprio della pagina, dove i suoi script sono gli script della pagina e i suoi id possono collidere con quelli della pagina. E l'inline è esattamente ciò che le persone fanno, perché è il solo modo per stilizzare un diagramma con il CSS della pagina così segua il tema.

| | `<svg>…</svg>` inline | `<img src="chart.svg">` |
| --- | --- | --- |
| Viaggia dentro il file | sì | no, a meno che la fonte sia un data URI |
| Stilizzabile dal CSS della pagina | sì | no |
| Gli script al suo interno possono eseguire | sì | no — disabilitato per SVG-come-immagine |
| Sopravvive a un sanitizzatore | dipende dalla lista di elementi permessi | di solito sì, è un `img` ordinario |
| Sicuro da accettare da uno straniero | no | trattalo come un'immagine |

La regola che ne emerge è corta: un SVG che hai disegnato tu va bene in entrambi i modi; un SVG che viene da altrove — un badge, un set di icone, un grafico generato da uno strumento, un diagramma mandato da un cliente — dovrebbe essere referenziato, non messo inline. Se devi metterlo inline, aprilo prima in un editor di testo e leggilo. È XML. Puoi vedere tutto quello che fa.

### Immagini che seguono il tema del lettore

Un diagramma con linee nere su fondo trasparente svanisce su una pagina scura, e circa metà dei tuoi lettori ha ora una pagina scura. La risposta degli standard è l'elemento `<picture>`: zero o più elementi `<source>` seguiti da esattamente un `<img>`, dove ogni source porta una condizione `media`, il browser prende il primo che corrisponde, e l'`<img>` è il ripiego quando nessuno corrisponde. L'alt text va sull'`<img>`, non sul `<picture>` (verificato su developer.mozilla.org, il 9 settembre 2026).

```html
<picture>
  <source srcset="flow-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="flow-light.png" media="(prefers-color-scheme: light)">
  <img src="flow-light.png" alt="Requests hit the queue, a worker writes to the store">
</picture>
```

GitHub supporta questa forma per le immagini specifiche di tema, e ha deprecato il suo approccio precedente di aggiungere `#gh-dark-mode-only` o `#gh-light-mode-only` all'URL dell'immagine a favore di questa (verificato su github.blog, il 9 settembre 2026). Se hai quella sintassi a fragment in un vecchio README, è a tempo determinato.

Due avvertenze, entrambe già viste in questa sezione. È HTML grezzo, quindi incontra i medesimi tre destini di un attributo `width`: passato, con escape, o parzialmente sanitizzato. E un sanitizzatore che permette `img` potrebbe non permettere `picture` e `source`, nel qual caso quello che il lettore riceve è il ripiego — che è un buon argomento per rendere il ripiego la versione a sfondo chiaro, quella leggibile su bianco, e per metter l'alt text dove appartiene.

C'è anche una correzione che non richiede nessun HTML. Dai al diagramma uno sfondo esplicito e un inchiostro a tono medio, così si legga su bianco e su antracite allo stesso modo. Un'immagine che non ha bisogno di sapere il tema non può sbagliare il tema, e sopravvive a ogni convertitore, ogni sanitizzatore e ogni client email di questa pagina.

## Link di ancora, e come viene creato lo slug

Un link di ancora markdown è un link a un'intestazione nello stesso documento: `[see below](#installing-the-cli)`. L'id a cui punta viene generato dal testo dell'intestazione, e la ricetta è più o meno la stessa ovunque. Metti in minuscolo il testo, elimina la punteggiatura, trasforma sequenze di spazi bianchi in trattini, e aggiungi un numero quando due intestazioni collidono.

Più o meno la stessa non è la stessa, e questo è il motivo per cui un indice che funziona perfettamente nel repository arriva al lettore con metà delle sue voci che non fanno niente. Ogni renderer implementa la propria funzione di slug, e le differenze sono abbastanza piccole che la maggior parte dei link sopravvive e abbastanza grandi che alcuni no.

GitHub documenta la sua regola in una frase: le lettere vengono convertite in minuscolo, gli spazi sono sostituiti da trattini, e ogni altro spazio bianco o carattere di punteggiatura viene rimosso (verificato su docs.github.com, il 9 settembre 2026). Pandoc documenta una ricetta più lunga, e uno dei suoi passi è diverso da quello di chiunque altro — rimuove tutto fino alla prima lettera, perché un identificatore non può iniziare con un numero o un segno di punteggiatura, quindi `## 3. Applications` diventa `applications` invece di `3-applications`. Le intestazioni duplicate ottengono `-1`, poi `-2`, e se non resta niente dopo l'eliminazione l'identificatore è `section` (verificato su pandoc.org, il 9 settembre 2026). Attivare `gfm_auto_identifiers` fa passare Pandoc al metodo di GitHub: spazi in trattini, maiuscole in minuscole, punteggiatura diversa da `-` e `_` rimossa, emoji sostituite dai loro nomi.

Le librerie JavaScript sono più strane, perché due delle più usate non producono affatto id a meno che tu non lo chieda. marked ha rimosso le sue opzioni `headerIds` e `headerPrefix` nella v8.0.0 e indica il pacchetto separato `marked-gfm-heading-id` per chiunque le voglia (verificato su marked.js.org, il 9 settembre 2026). Anche markdown-it non emette id di intestazione per conto suo; la risposta abituale è markdown-it-anchor, che si descrive come un plugin che “aggiunge un attributo `id` alle intestazioni e opzionalmente dei permalink”, disambigua i duplicati con un suffisso numerico che parte da 1, e ti lascia sostituire del tutto la funzione di slug; è gratis, rilasciato sotto la Unlicense (verificato su github.com, il 9 settembre 2026).

| Intestazione nella fonte | GitHub | Pandoc, predefinito | Pandoc + `gfm_auto_identifiers` | markdown-it + markdown-it-anchor | marked, senza estensioni |
| --- | --- | --- | --- | --- | --- |
| `## Installing the CLI` | `installing-the-cli` | `installing-the-cli` | `installing-the-cli` | `installing-the-cli` | nessun id emesso |
| `## 3. Applications` | `3-applications` | `applications` | `3-applications` | quello che fa la funzione di slug | nessun id emesso |
| `## Maître d'hôtel` | `maître-dhôtel` | `maître-dhôtel`, oppure `maitre-dhotel` con `ascii_identifiers` | `maître-dhôtel` | dipende dalla funzione di slug | nessun id emesso |
| `## Notes` che appare due volte | un suffisso numerico | `notes`, poi `notes-1` | un suffisso numerico | `notes`, poi `notes-1` | nessun id emesso |
| Punteggiatura, in generale | rimossa tranne i trattini | rimossa tranne `_`, `-` e `.` | rimossa tranne `-` e `_` | configurabile | — |

La riga che costa più cara alle persone è quella numerata. La documentazione è piena di `## 1. Prerequisites` e `## 2. Installing`, e un indice costruito per GitHub punta a `#1-prerequisites` mentre una build Pandoc produce `#prerequisites`. Ogni link dell'indice manca il colpo. Niente segnala un errore: un fragment che non corrisponde a nessun id non è un fallimento in HTML, è una richiesta di scorrere fino a niente, e il browser obbedisce restando esattamente dov'è. Il lettore clicca, niente si muove, e conclude che la pagina è rotta in qualche modo vago che non sa descrivere.

L'altra divergenza silenziosa è il prefisso. TransformPipe prefissa ogni id di intestazione con `doc-`, quindi `## Installing the CLI` diventa `id="doc-installing-the-cli"` e il link deve essere `#doc-installing-the-cli`. Il prefisso esiste per tenere gli id fuori dal territorio del DOM-clobbering, che è lo stesso ragionamento dietro [il sanitizzare del tutto l'output](/blog/sanitising-markdown-safely). Altri strumenti prefissano per motivi propri, e un prefisso rende inutile ogni ancora scritta a mano in un colpo.

Quindi converti prima e leggi gli id che il convertitore ha prodotto invece di indovinare. Apri l'output, cercaci `id="`, cercaci `href="#`, e confronta le due liste — qualunque cosa nella seconda che manchi dalla prima è un link morto, e il controllo richiede meno tempo di quanto ne abbia richiesto scrivere l'indice. C'è anche una correzione strutturale: dai all'intestazione un id esplicito dove il renderer lo supporta, oppure collega un'intestazione stabile piuttosto che una numerata. Rinominare un'intestazione rompe in silenzio ogni ancora che la punta, motivo per cui vale la pena tenere corto l'indice in [la documentazione che vive nel repository](/blog/documentation-that-lives-in-the-repo).

## Link in stile riferimento, e controllare ogni destinazione automaticamente

I link inline affollano la frase. Lo stile riferimento sposta ogni URL in fondo e lascia dietro un'etichetta corta.

```markdown
The [style guide][guide] changed, and so did the [API reference][api].
Read the [style guide][guide] again before you file anything.

[guide]: https://example.com/style
[api]: https://example.com/api/v1
```

L'etichetta viene riusata quante volte vuoi, l'URL scritto una sola volta, quindi un dominio spostato è una sola modifica invece di una caccia tra i paragrafi. Ti dà anche un solo blocco da controllare prima di inviare: ogni destinazione a cui punta il documento. Anche una lunga stringa base64 appartiene lì sotto, e così le immagini — `![Flow][flow]` con `[flow]: assets/flow.png` in fondo al file tiene un data URI di 40 KB fuori dal mezzo di una frase.

Quel blocco è anche la cosa che una macchina può leggere. Una volta che ogni destinazione è in un unico posto, controllarle smette di essere un lavoro per una persona.

### Un controllore che puoi davvero verificare

lychee è un controllore di link scritto in Rust, descritto dal proprio repository come un “controllore di link veloce, asincrono, basato su stream” che “trova URL rotti e indirizzi email dentro Markdown, HTML, reStructuredText, siti web e altro”. È gratis e con doppia licenza Apache 2.0 o MIT, e c'è una GitHub Action ufficiale, `lycheeverse/lychee-action` (verificato su github.com, il 9 settembre 2026). Puntalo sui tuoi file `.md` e segnala cosa non si risolve più.

Dove appartiene sono due posti, non uno.

| Quando gira | Cosa intercetta | Cosa dovrebbe fare in caso di fallimento |
| --- | --- | --- |
| A ogni pull request che tocca `.md` | il link che hai digitato male dieci minuti fa | far fallire il controllo — chi lo ha scritto è proprio lì |
| Secondo una pianificazione, settimanale o notturna | il link che è marcito il mese scorso | apre una issue, non fa fallire una build |

La divisione conta perché i due fallimenti hanno proprietari diversi. Un'esecuzione su pull request guarda solo a quello che la pull request ha cambiato, quindi non noterà mai che un venditore ha riorganizzato la sua documentazione a giugno. Un'esecuzione pianificata lo nota, ma bloccare un deploy perché il sito web di qualcun altro è giù per dieci minuti punisce la persona sbagliata. Collega l'esecuzione pianificata all'apertura di una issue invece, insieme a qualunque altra cosa tu già [pubblichi da un workflow](/blog/publish-markdown-from-github-actions).

E sii chiaro su cosa nessun controllore possa fare per te. Risolve i percorsi relativi contro il repository, perché è lì che sta in piedi — quindi `img/flow.png` passa, ogni volta, incluso il tentativo immediatamente prima di inviare l'esportazione a qualcuno la cui cartella Download non ha nessun `img` dentro. Il fallimento esatto di cui parla questo articolo è invisibile allo strumento che controlla la fonte. Controlla l'output.

## La parte onesta: un documento inviato per email o porta le sue immagini o non ne ha nessuna

Tutto quanto sopra presume che il software del lettore scaricherà un'immagine quando gli viene detto. L'email è il posto dove quell'assunzione è semplicemente falsa, ed è falsa di proposito.

Outlook “è configurato di default per bloccare i download automatici di immagini da Internet”, e Microsoft dà quattro motivi: contenuto collegato potenzialmente offensivo, codice malevolo, il costo di banda di scaricare immagini che il lettore non ha chiesto, e pixel di tracciamento — immagini invisibili che dicono a chi manda il messaggio che è stato letto (verificato su support.microsoft.com, il 9 settembre 2026). Ogni altro client email si comporta più o meno allo stesso modo, perché il problema del pixel di tracciamento è lo stesso per tutti.

Quindi un documento HTML incollato nel corpo di un'email, con immagini referenziate per URL, arriva come prosa e rettangoli grigi con una barra in cima che offre di scaricare le immagini. Alcuni lettori ci clicano. Molti no, e alcuni lavorano dove quell'opzione è stata rimossa del tutto. Non è un bug da parte tua e non c'è nessuna intestazione, attributo o trucco che lo corregga: il client sta proteggendo il suo utente esattamente dal meccanismo su cui stai contando.

Questo lascia due opzioni oneste e nessuna terza.

**Il documento porta le sue immagini.** Ogni immagine diventa un data URI, e il messaggio contiene i byte piuttosto che una richiesta per essi. Niente viene bloccato perché niente viene scaricato. Il costo è l'aritmetica di prima: un documento con sei screenshot è un messaggio largo diversi megabyte, inoltrato per intero ogni volta, seduto in caselle con quote, e che passa attraverso gateway che a volte riscrivono la posta HTML lungo la strada. Alcuni filtri aziendali eliminano le sorgenti `data:` per lo stesso motivo per cui lo fa il sanitizzatore di un wiki.

**Il documento non ha immagini.** Il diagramma diventa una frase, lo screenshot diventa una tabella, il grafico diventa tre numeri, e il messaggio è piccolo, veloce e leggibile ovunque, incluso sul telefono in treno. Il costo è che devi fare tu la traduzione, e alcune cose davvero non si traducono — un flame graph non è una frase.

C'è una via di mezzo che scambia un fallimento con l'altro. Allega il file HTML convertito invece di incollarlo nel corpo: il lettore lo scarica e lo apre in un browser, che scarica le immagini normalmente, quindi gli URL remoti tornano a funzionare. In cambio, ogni percorso relativo si risolve ora contro la loro cartella Download, che è da dove è partito questo articolo. Non c'è nessuna disposizione senza nessuno dei due problemi. C'è solo scegliere quale preferisci spiegare.

## Cosa controllare prima di inviare il file

L'HTML autonomo è un'affermazione sulla presentazione, raramente sul contenuto. In un documento HTML a file unico gli stili sono inline, non ci sono script e niente viene scaricato per far sembrare giusta la pagina — il download di TransformPipe funziona così. Quello che non copre mai è un'immagine che hai puntato altrove. `<img src="diagram.png">` significa ancora `diagram.png`, accanto a dovunque il lettore abbia messo il file.

I criteri sotto sono cosa decidere, in ordine, prima che il file lasci la tua macchina.

1. **Decidi la destinazione prima di scrivere il percorso.** Un documento che verrà aperto da una cartella Download non può usare né un percorso relativo né uno root-relative: `../assets/flow.png` scappa dalla cartella che stai inviando, e una barra iniziale punta alla radice del disco del lettore. Decidi prima e scrivi ogni percorso una volta invece di ritrovarli tutti dopo.
2. **Incorpora quello che è piccolo, ospita quello che è grande.** Base64 aggiunge circa un terzo ai byte, quindi un'icona non costa niente e uno screenshot costa un megabyte di testo illeggibile incuneato nella prosa, rimandato con ogni copia e invisibile a ogni diff.
3. **Dai a ogni immagine significativa un alt text e a ogni immagine decorativa un `alt` vuoto.** Il primo è ciò che uno screen reader annuncia e ciò che riempie il vuoto quando l'immagine fallisce; il secondo evita che uno spazio vuoto venga letto ad alta voce e nasconde l'icona rotta quando non si carica.
4. **Non mettere mai inline un SVG che non hai disegnato tu.** Inline, entra nel DOM della pagina e i suoi script diventano gli script della pagina; referenziato da un `img`, il browser disabilita il suo scripting e lo tratta come l'immagine che pensavi di ricevere.
5. **Presumi che ogni attributo HTML grezzo sia opzionale.** Larghezza, altezza, `picture`, `source`, `title` e `class` vivono tutti alla mercé di una lista di elementi permessi, quindi qualunque layout che funzioni solo se l'attributo sopravvive verrà prima o poi visto senza di esso.
6. **Leggi gli id che il convertitore ha prodotto, non quelli che ti aspettavi.** Gli algoritmi di slug differiscono tra i renderer, e un'ancora che non corrisponde a niente fallisce in silenzio — nessun errore, nessun avviso in console, solo una pagina che si rifiuta di scorrere.
7. **Fai girare un controllore di link sulle pull request e secondo una pianificazione.** Il primo intercetta il link che hai sbagliato oggi; solo il secondo intercetta quello che è marcito mentre nessuno modificava quel file.
8. **Apri l'esportazione da una cartella diversa, su una macchina diversa, con la rete spenta.** Quel singolo test intercetta insieme file mancanti, percorsi root-relative, dipendenze da CDN e blocchi anti-hotlink, e richiede circa un minuto.

Poi fai il passaggio che costa un minuto. Converti il tuo file, apri la scheda della fonte HTML, e cercaci `src="` e `href="`. Leggi ogni valore e chiediti da dove si risolve sulla macchina del lettore, non sulla tua. Correggi quelli che rispondono male, poi invia il file — oppure salta l'allegato e [condividilo come link](/blog/share-a-markdown-document-as-a-link), il che fa risparmiare al lettore un download ma non un percorso relativo: quello si risolve ancora contro la pagina da cui viene servito, dove le immagini non sono mai state messe.

## Conclusione

Ogni immagine rotta e ogni ancora morta in un documento convertito viene dallo stesso errore, fatto due volte: un riferimento è stato scritto stando in un posto e letto stando in un altro. Gli URL assoluti e i data URI sono le due forme a cui non importa dove sta il lettore, l'alt text è ciò che resta quando l'immagine non arriva, e gli id delle intestazioni vale la pena leggerli piuttosto che prevederli perché quattro renderer ti daranno quattro risposte. Niente di tutto questo è difficile; tutto è invisibile dalla macchina su cui il documento è stato scritto. Quindi [converti il file](/), apri l'output, leggi ogni `src` e `href` che ha prodotto, e chiediti dove punta ognuno dalla scrivania di qualcun altro — quel singolo passaggio è la differenza tra un documento che sopravvive all'invio e uno che arriva pieno di riquadri grigi.

## FAQ

### Perché la mia immagine Markdown non si vede?

Nove volte su dieci il percorso è relativo e il file si è spostato, quindi ora si risolve contro una cartella che non ha nessuna immagine dentro. Apri il pannello di rete del browser e leggi lo stato: 404 è un percorso sbagliato, 403 sono permessi o protezione anti-hotlink, e un 200 che restituisce HTML significa che hai collegato una pagina invece di un file.

### Come collego un'immagine memorizzata in un repository GitHub?

Usa un percorso relativo se il Markdown viene letto sulla pagina del repository, che è ciò che GitHub stesso raccomanda. Se ti serve un URL assoluto, usa `raw.githubusercontent.com` oppure aggiungi `?raw=true` all'URL blob — il semplice indirizzo `…/blob/…` restituisce una pagina HTML, non un'immagine, e si renderizzerà sempre rotto.

### Dovrei codificare le immagini in base64 in Markdown?

Per icone, loghi e piccoli diagrammi in un documento che deve viaggiare da solo, sì. Base64 rende i dati circa un terzo più grandi del file, quindi uno screenshot di 2 MB diventa circa 2,7 MB di testo in mezzo alla tua prosa che non può essere messo in cache, diffato o sostituito separatamente — sopra qualche centinaio di kilobyte, ospita l'immagine invece.

### Posso impostare una larghezza per un'immagine in Markdown?

Non in CommonMark o in GitHub Flavored Markdown, che ti danno un URL, un alt text e un titolo opzionale e niente altro. Le persone ricorrono a `<img width="400">` grezzo, ma un convertitore potrebbe fare l'escape dell'HTML grezzo o sanitizzare via l'attributo, quindi ridimensionare il file immagine effettivo è la sola correzione che funziona ovunque.

### Perché il mio link a un'intestazione funziona su GitHub ma si rompe nell'HTML esportato?

Perché i due renderer creano lo slug delle intestazioni in modo diverso. GitHub mette in minuscolo, trasforma gli spazi in trattini e rimuove la punteggiatura; Pandoc rimuove anche tutto fino alla prima lettera, quindi `## 3. Applications` diventa `#applications` invece di `#3-applications`; marked e markdown-it non emettono nessun id senza un plugin. Leggi gli id nell'output invece di presumerli.

### Le mie immagini si vedranno se mando per email l'HTML convertito?

Solo se sono incorporate. Outlook blocca i download automatici di immagini da internet per default, in gran parte per sconfiggere i pixel di tracciamento, e altri client fanno lo stesso, quindi un documento inviato per email con URL di immagini remote arriva come prosa e riquadri grigi finché il lettore non sceglie di caricarle.

### Qual è la differenza tra alt text e una didascalia?

Una didascalia è visibile a tutti e sta vicino all'immagine, aggiungendo qualcosa che l'immagine non dice da sola. L'alt text sostituisce l'immagine per un lettore che non la sta ricevendo — un utente di screen reader, o chiunque la cui immagine sia fallita nel caricamento — quindi dovrebbe dire cosa comunica l'immagine, ed essere vuoto quando l'immagine non comunica niente.

### Perché le immagini sono sparite dopo la conversione?

Perché il convertitore le ha trovate e ha scritto un riferimento invece dei byte. Un'immagine dentro un `.docx`, un `.pptx` o un'esportazione Notion è un file separato dentro il contenitore, e una conversione deve o incorporarla, o scriverla accanto al Markdown riscrivendo il riferimento, o dire che non ha fatto né l'una né l'altra cosa. [Dove finiscono le immagini quando esporti un documento](/blog/pictures-in-a-document-export) dice dove le tiene ciascun formato e quanto costano le tre opzioni.
