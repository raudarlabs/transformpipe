## Cosa viene conservato

Convertire Markdown in EPUB qui significa partire dalla stessa pagina che disegna l’anteprima, tagliarla in capitoli e impacchettarla come EPUB 3.

| Nel Markdown | Nel libro |
| --- | --- |
| titoli | capitoli, tagliati a `#` se compare almeno due volte, altrimenti a `##` con la stessa regola |
| `$…$`, `$$…$$` e blocchi `mermaid` | formule in MathML; diagrammi disegnati in SVG, a colori chiari |
| blocchi di codice delimitati in un linguaggio riconosciuto | carattere a spaziatura fissa, parole chiave in grassetto, commenti in corsivo |
| tabelle, citazioni, riquadri del tipo `[!NOTE]` | tabelle con filetti, citazioni con una linea a sinistra, riquadri con un bordo colorato e il loro titolo |
| `==marked==`, `- [ ]`, `- [x]` | un’evidenziazione, ☐, ☑ |
| `[^1]` | una nota numerata alla fine del libro, collegata nei due sensi |
| link a titoli, indirizzi web e `mailto:` | link; quello verso un titolo trova il capitolo in cui il titolo è finito |
| immagini incorporate come `data:` | file dentro il libro: PNG, JPEG, GIF, WebP o SVG |
| immagini a indirizzi web | scaricate dal browser e messe dentro il libro, se il server lo consente |

L’indice elenca ogni capitolo con il suo primo titolo e, se i capitoli sono più d’uno, sotto il livello successivo, sia come pagina di navigazione EPUB 3 sia come `toc.ncx`, il formato più vecchio. Il titolo del libro è il primo titolo di livello da 1 a 3 o, in mancanza, il nome del file; la lingua è quella del sito, quindi `it` su questa pagina. Per il testo non si impone né un carattere né un colore, così valgono il carattere, la dimensione e la modalità notturna del lettore.

## Cosa si perde

- **Il blocco di metadati (front matter).** Il blocco YAML in cima al file viene rimosso; `title:` e `author:` al suo interno non vengono letti ([di più sul front matter](/blog/front-matter-and-what-converters-do-with-it)).
- **Autore e copertina.** Nessuno dei due viene registrato: il libro porta solo un titolo, una lingua, una data e un identificatore, nuovo a ogni download.
- **Alcune immagini.** Un’immagine sul disco, o incorporata in un altro formato, diventa la sua descrizione tra parentesi quadre, in corsivo; un’immagine a un indirizzo web che il browser non riesce a scaricare, o che un libro non può mostrare, diventa un link sotto quella descrizione.
- **I link che escono dal documento.** Un link a un altro file, o a un titolo che non esiste, conserva solo le parole. Lo stesso vale per un wikilink.
- **Il colore.** L’evidenziazione della sintassi diventa grassetto e corsivo, mai colore.
- **L’HTML grezzo.** Un blocco `<details>` viene aperto, e il sommario resta come testo semplice.

## Un esempio

```markdown
---
title: Field notes
author: J. Hale
---

# Field notes

A year of walks round the reservoir.

## Spring

Snowdrops by the north gate.[^1]

![North gate](https://example.com/gate.jpg)

## Summer

The path floods in June; take [the dry route](#spring) instead.

- [x] Boots
- [ ] Map

[^1]: Counted on 4 March.
```

Un `#` e due `##` mettono il taglio a `##`. Un titolo senza nulla sotto aprirebbe il primo capitolo; questo ha un paragrafo, quindi i due formano un capitolo a sé:

```text
mimetype
META-INF/container.xml
OEBPS/content.opf
OEBPS/toc.ncx
OEBPS/style.css
OEBPS/nav.xhtml
OEBPS/chapter-1.xhtml
OEBPS/chapter-2.xhtml
OEBPS/chapter-3.xhtml
```

L’indice riporta Field notes, Spring, Summer. Qui si suppone che il server dell’immagine respinga il browser, perciò il capitolo 2 la collega come `[North gate]`; altrimenti sarebbe nel libro come `OEBPS/images/picture-1.jpg`. Il capitolo 3 è questo:

```html
<h2 id="doc-summer">Summer</h2>
<p>The path floods in June; take <a href="chapter-2.xhtml#doc-spring">the dry route</a> instead.</p>
<ul>
<li>☑ Boots</li>
<li>☐ Map</li>
</ul>
<hr class="md-fnrule" />
<ol class="md-footnotes">
<li id="doc-fn-1">Counted on 4 March. <a href="chapter-2.xhtml#doc-fnref-1" class="md-fnback">↩</a></li>
</ol>
```

## Limiti

- File `.md`, `.markdown`, `.mdown` e `.mkd` fino a 10 MB, oppure Markdown incollato. Più file trascinati insieme si dividono i 10 MB e diventano un unico libro, separati da linee.
- Il libro viene creato nel browser, e solo lì: serve l’analizzatore HTML del browser, perciò l’API non produce EPUB. Nulla arriva a un account finché non si accede e si preme Salva; un documento salvato può occupare al massimo 4 MB.
- Le immagini a un indirizzo web vengono richieste dal browser, al massimo dieci secondi ciascuna.

## Domande

### Come convertire Markdown in EPUB?

Si trascina qui il file .md oppure si incolla il Markdown, si controlla l’anteprima e si preme Scarica .epub. [Come creare un EPUB da Markdown](/how-to/make-epub) spiega quali lettori lo aprono e come verificarlo.

### Perché il libro è un unico lungo capitolo?

I capitoli si tagliano solo a `#` o `##`, e solo a un livello usato almeno due volte. Un documento che usa `###` dall’inizio alla fine, o che ha un solo `#` e un solo `##`, resta un capitolo unico.

### Si possono impostare l’autore, la copertina o la lingua?

Qui no. Il titolo viene dal primo titolo e la lingua dal sito: nella versione italiana il libro è marcato `it`, in quella inglese `en`. Con Calibre si possono aggiungere in seguito l’autore e la copertina che uno store richiederà.

### Si apre su un Kindle?

Send to Kindle accetta EPUB dal 2022, e Apple Books, Google Play Libri e Kobo lo aprono direttamente. Formule e diagrammi viaggiano come MathML e SVG, che alcuni lettori a inchiostro elettronico più vecchi non visualizzano.
