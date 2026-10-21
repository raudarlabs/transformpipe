## Cosa si conserva

Tutto ciò che dentro `<body>` ha una forma in Markdown la ottiene. Un asterisco o un trattino basso isolato nel testo viene escapato. Le entità vengono decodificate: `&copy;` arriva come ©, e `&lt;b&gt;` come un vero tag `<b>`.

| Nell’HTML | Nel Markdown |
| --- | --- |
| Da `<h1>` a `<h6>` | Da `#` a `######` |
| `<strong>`, `<em>`, `<del>` e le loro forme brevi | `**grassetto**`, `*corsivo*`, `~~barrato~~` |
| `<a href>` | `[testo](indirizzo)`, oppure `<indirizzo>` quando il testo è l’indirizzo stesso |
| `<img>` | `![alt](src)`, con il `src` così com’è scritto |
| `<ul>`, `<ol>` | Elenchi con `-` e `1.`, ogni livello rientrato di due spazi |
| Una casella di spunta in una voce di `<ul>` | `- [x]` oppure `- [ ]` |
| `<table>` | Una tabella, con la prima riga come intestazione |
| `<pre><code class="language-js">` | Un blocco di codice delimitato, marcato `js` |
| `<code>`, `<blockquote>`, `<hr>`, `<br>` | `` `codice` ``, `>`, `---`, un a capo |

Le tabelle vengono anche riordinate: una colonna vuota in tutte le righe viene eliminata, e le celle non vengono riempite di spazi. Una `<caption>` diventa una riga in grassetto sopra la tabella.

## Cosa si perde

- **L’`<head>`**: titolo, meta tag, fogli di stile e script, quindi una pagina il cui titolo esiste solo nel `<title>` arriva senza.
- **`<script>`, `<style>`, `<noscript>`, `<template>`, `<svg>` e `<iframe>`**, con tutto il loro contenuto: un video o una mappa incorporati non lasciano nulla.
- **`<nav>` e `<footer>`**, contenuto compreso, ovunque si trovino. `<header>` e `<aside>` restano.
- **I commenti, e ogni `class`, `id` e `style`.** `<u>`, `<mark>`, `<sub>` e `<sup>` mantengono le parole e perdono il segno: `H<sub>2</sub>O` arriva come H2O.
- **Le immagini incorporate come indirizzi `data:`**, testo alternativo compreso, per cui una pagina autonoma, salvata in un solo file, perde le sue immagini.

## Un esempio

Una pagina di note di rilascio salvata:

```html
<!DOCTYPE html>
<html>
<head><title>Release 2.4</title><style>h1 { color: navy; }</style></head>
<body>
<nav><a href="/">Home</a> <a href="/blog">Blog</a></nav>
<h1>Release 2.4</h1>
<p>Adds <strong>offline mode</strong> and fixes the <em>sync</em> bug.
See <a href="https://example.com/changes">the changelog</a>.</p>
<ul>
  <li><input type="checkbox" checked> Update the docs</li>
  <li><input type="checkbox"> Tell support</li>
</ul>
<table>
  <tr><th>Platform</th><th>Status</th></tr>
  <tr><td>macOS</td><td>Shipped</td></tr>
  <tr><td>Windows</td><td><del>Beta</del> Shipped</td></tr>
</table>
<pre><code class="language-bash">npm install app@2.4</code></pre>
<footer>© 2026 Example Ltd</footer>
</body>
</html>
```

diventa:

````markdown
# Release 2.4

Adds **offline mode** and fixes the *sync* bug. See [the changelog](https://example.com/changes).

- [x] Update the docs
- [ ] Tell support

| Platform | Status |
| --- | --- |
| macOS | Shipped |
| Windows | ~~Beta~~ Shipped |

```bash
npm install app@2.4
```
````

Il menu, il piè di pagina, il foglio di stile e il titolo sono spariti, e la riga spezzata a metà paragrafo viene ricongiunta.

## Limiti

- File `.html`, `.htm` o `.xhtml`, oppure sorgente HTML incollato, fino a 10 MB alla volta. Più file contano insieme e diventano un unico documento, separati da `---`.
- Il file viene convertito nel browser e non viene caricato. Arriva nell’account solo se si è effettuato l’accesso e si preme Salva, e un documento salvato può pesare al massimo 4 MB.
- Il file viene letto come UTF-8, qualunque cosa dica il suo `<meta charset>`: una pagina salvata in Windows-1252 mostra caratteri sostitutivi al posto delle lettere accentate.
- Non c’è riconoscimento dell’articolo: anche avvisi sui cookie e barre laterali passano. [Come convertire HTML in Markdown](/blog/convert-html-to-markdown) spiega come toglierli prima.
- Un blocco di codice richiede un `<code>` da solo nel suo `<pre>`, senza alcuno spazio bianco intorno, e il linguaggio viene preso solo da una classe `language-…`. Un `<pre>` senza `<code>` diventa testo senza nulla di escapato, i cui a capo spariscono quando viene visualizzato.
- Le celle unite non vengono ridistribuite: una cella con `colspan` o `rowspan` occupa un solo posto e il resto della riga scorre a sinistra. Le tabelle annidate vengono appiattite, e un `<br>` dentro una cella fa unire le parole.
- Un elenco dentro una voce numerata viene rientrato di due spazi, meno di quanti ne chieda CommonMark, e quindi non risulta più annidato.

## Domande

### Si può convertire una pagina web in Markdown partendo dall’URL?

No: questa pagina ha bisogno del file o del suo sorgente. Salvi la pagina come HTML e trascini qui il file, oppure usi l’estensione per il browser, che converte la pagina aperta e prima ne individua l’articolo.

### Esiste un’API per convertire HTML in Markdown?

Sì. Si invia l’HTML come corpo della richiesta a `/api/v1/documents?kind=html-to-markdown`, con una chiave API presa dal menu dell’account. Sul server gira lo stesso convertitore, che salva un documento; `GET /api/v1/documents/:id` ne restituisce il Markdown.

```bash
curl -H "Authorization: Bearer tp_live_…" \
     --data-binary @page.html \
     "https://transformpipe.com/api/v1/documents?kind=html-to-markdown&name=page.md"
```

### Come convertire HTML in Markdown con Python?

Non esiste un pacchetto Python. Uno script può chiamare l’API con `requests`; per convertire direttamente in Python, [questo confronto tra librerie](/blog/turndown-and-html-to-markdown-libraries) tratta html2text e Pandoc.

### Una tabella HTML diventa una tabella Markdown?

Sì, con la prima riga come intestazione, perché una tabella Markdown ne ha bisogno. Grassetto, corsivo, barrato, link e immagini dentro una cella sopravvivono; il codice inline perde i backtick.

### Perché mancano le immagini?

O erano indirizzi `data:`, che vengono scartati, oppure si trovano nella cartella che il browser salva accanto alla pagina. I percorsi restano com’erano, quindi le immagini compaiono solo se quella cartella si trova accanto al Markdown: [Come aprire un file .html](/how-to/open-html) spiega la cartella.
