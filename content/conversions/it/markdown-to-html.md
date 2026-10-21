## Cosa viene conservato

Il Markdown viene letto come GitHub Flavored Markdown, con in più le estensioni comuni nelle note e nella documentazione:

| Nel Markdown | Nell’HTML |
| --- | --- |
| Titoli | Da `<h1>` a `<h6>`, ognuno con un id come `doc-setup` |
| Un link a `#setup` | Puntato su quel titolo, che sia scritto alla maniera di GitHub o di Obsidian |
| Elenchi di attività, tabelle | Caselle che non si possono spuntare; tabelle che scorrono sugli schermi stretti |
| Blocchi di codice delimitati | Evidenziazione della sintassi per Python, JavaScript, SQL, Bash, YAML e una ventina di altri linguaggi |
| Un blocco `mermaid` | Il diagramma, disegnato in SVG nel file scaricato |
| Formule `$…$`, note a piè di pagina | MathML; note numerate e raccolte alla fine |
| `> [!NOTE]`, `==mark==`, `H~2~O` | Un riquadro di avviso, `<mark>`, `<sub>` |

«Scarica .html» salva un unico file: il documento con il suo foglio di stile al proprio interno, senza script né font web, nella tavolozza chiara o scura mostrata dall’app, e chiara in stampa. Una riga a piè di pagina riporta il nome del documento e l’ora della conversione, con un link a TransformPipe. Il menu accanto al pulsante offre anche Markdown, Markdown per Obsidian, testo semplice, Word, EPUB, Confluence, Jira, Slack e un PDF tramite la finestra di stampa.

## Cosa si perde

- **Il front matter.** Un blocco YAML tra due righe `---` all’inizio del file viene rimosso.
- **I wikilink.** `[[Install guide]]` diventa le parole «Install guide», e `![[diagram.png]]` il nome del file in corsivo.
- **L’HTML fuori dall’elenco consentito.** `<script>`, `<style>` e `<iframe>` spariscono con il loro contenuto, gli attributi `style` e `onclick` vengono eliminati, e un tag come `<details>` si perde, mentre il suo testo resta.
- **Gli a capo semplici.** Un a capo all’interno di un paragrafo diventa uno spazio, come su GitHub. Per ottenere un `<br>` la riga deve finire con due spazi o con una barra rovesciata.
- **Le immagini come file.** Un’immagine resta un `<img>` che punta al suo indirizzo. Un percorso relativo come `img/chart.png` si vede solo se quella cartella si trova accanto al file scaricato, perché al convertitore arriva soltanto il `.md`.

## Un esempio

L’input:

```markdown
---
title: Release notes
---

# Release 2.4

Read the [setup notes][setup] first.

- [x] Faster export
- [ ] Print in dark mode

| Format | Size |
| --- | ---: |
| HTML | 48 KB |

## Setup

Run `npm ci`.[^1]

[setup]: #setup
[^1]: Node 20 or later.
```

Dentro l’`<article>` del file scaricato:

```html
<h1 id="doc-release-24">Release 2.4</h1>
<p>Read the <a href="#doc-setup">setup notes</a> first.</p>
<ul>
<li><input checked="" disabled="" type="checkbox"> Faster export</li>
<li><input disabled="" type="checkbox"> Print in dark mode</li>
</ul>
<div class="md-table"><table>
<thead>
<tr>
<th>Format</th>
<th align="right">Size</th>
</tr>
</thead>
<tbody><tr>
<td>HTML</td>
<td align="right">48 KB</td>
</tr>
</tbody></table>
</div>
<h2 id="doc-setup">Setup</h2>
<p>Run <code>npm ci</code>.<sup class="md-fnref" id="doc-fnref-1"><a href="#doc-fn-1">1</a></sup></p>
<hr class="md-fnrule">
<ol class="md-footnotes">
<li id="doc-fn-1">Node 20 or later. <a href="#doc-fnref-1" class="md-fnback">↩</a></li>
</ol>
```

Il front matter è sparito, il link raggiunge l’id reale del titolo, e la nota a piè di pagina si è spostata alla fine.

## Limiti

- **10 MB per conversione**, contando tutti i file trascinati insieme. Più file diventano un solo documento, separati da una linea orizzontale.
- **.md, .markdown, .mdown e .mkd**, oppure Markdown incollato come testo. Un `.txt` va invece al convertitore di testo semplice.
- **Tutto avviene nel browser**, sia la conversione sia il download. Senza accesso il file non viene caricato; con l’accesso, il documento raggiunge l’account solo quando si preme Salva, fino a 4 MB.
- **Un diagramma deve essere valido.** Un blocco Mermaid con un errore resta come codice sorgente.
- **Un solo foglio di stile.** Non c’è un’impostazione per usare un CSS proprio o un modello.

## Domande

### Come convertire Markdown in HTML?

Basta trascinare un file `.md` su questa pagina, oppure incollare il Markdown come testo. L’anteprima mostra la pagina, e «Scarica .html» la salva con lo stesso nome. Non serve un account. Per leggere un file senza convertirlo, [Come aprire un file .md](/how-to/open-md) indica i programmi che lo aprono.

### Il file HTML è autosufficiente?

Sì, tranne le immagini collegate tramite un indirizzo. Il foglio di stile è dentro il file, non si scarica nulla per font o script, e diagrammi e formule sono già disegnati, quindi si apre allo stesso modo da un’email o da un disco senza rete. [HTML autosufficiente: cos'è davvero un documento HTML in un unico file](/blog/self-contained-html-explained) approfondisce il tema.

### Si può copiare l’HTML invece di scaricarlo?

Sì. La scheda «Sorgente HTML» mostra il file intero, con i diagrammi ancora come sorgente Mermaid, e «Copia HTML» lo mette così negli appunti. Per incollare un frammento in un CMS basta prendere ciò che sta dentro `<article>`.

### È supportato il GitHub Flavored Markdown?

Sì: tabelle, elenchi di attività, `~~barrato~~`, blocchi di codice delimitati e link semplici vengono letti come li legge GitHub, con in più note a piè di pagina, avvisi, formule e Mermaid.

### Il mio Markdown viene caricato su un server?

No. Viene convertito nel browser e conservato nella memoria di quel browser; raggiunge un server solo se si accede e si preme Salva. [Come convertire Markdown in HTML online, senza installare niente](/blog/convert-markdown-to-html-online) spiega come verificarlo con qualsiasi convertitore.

### Posso usare un mio CSS?

No. Il file contiene il foglio di stile del documento. È HTML semplice, quindi il blocco `<style>` si può sostituire in seguito.
