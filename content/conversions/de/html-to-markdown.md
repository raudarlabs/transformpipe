## Was übernommen wird

Alles innerhalb von `<body>`, wofür Markdown eine Form hat, bekommt diese Form. Ein vereinzeltes Sternchen oder ein Unterstrich im Text wird maskiert. Zeichenreferenzen werden aufgelöst: Aus `&copy;` wird ©, aus `&lt;b&gt;` aber auch ein echtes `<b>`-Tag.

| Im HTML | Im Markdown |
| --- | --- |
| `<h1>` bis `<h6>` | `#` bis `######` |
| `<strong>`, `<em>`, `<del>` und ihre Kurzformen | `**fett**`, `*kursiv*`, `~~durchgestrichen~~` |
| `<a href>` | `[Text](Adresse)`, oder `<Adresse>`, wenn der Text die Adresse selbst ist |
| `<img>` | `![Alt-Text](src)`, das `src` genau so, wie es dasteht |
| `<ul>`, `<ol>` | Listen mit `-` und `1.`, jede Ebene um zwei Leerzeichen eingerückt |
| Ein Kontrollkästchen in einem Listenpunkt einer `<ul>` | `- [x]` oder `- [ ]` |
| `<table>` | Eine Tabelle, die erste Zeile als Kopfzeile |
| `<pre><code class="language-js">` | Ein eingezäunter Codeblock mit dem Info-String `js` |
| `<code>`, `<blockquote>`, `<hr>`, `<br>` | `` `Code` ``, `>`, `---`, ein Zeilenumbruch |

Tabellen werden dabei aufgeräumt: Spalten, die in jeder Zeile leer sind, fallen weg, und Zellen werden nicht mit Leerzeichen aufgefüllt. Eine `<caption>` wird zu einer fetten Zeile über der Tabelle.

## Was zurückbleibt

- **Der `<head>`**: Titel, Meta-Tags, Stylesheets und Skripte – eine Seite, deren Titel nur im `<title>` steht, kommt ohne Titel an.
- **`<script>`, `<style>`, `<noscript>`, `<template>`, `<svg>` und `<iframe>`** samt Inhalt – ein eingebettetes Video oder eine eingebettete Karte hinterlässt nichts.
- **`<nav>` und `<footer>`**, ebenfalls mit Inhalt, wo immer sie stehen. `<header>` und `<aside>` bleiben erhalten.
- **Kommentare und jedes `class`, `id` und `style`.** `<u>`, `<mark>`, `<sub>` und `<sup>` behalten ihre Wörter und verlieren die Auszeichnung: Aus `H<sub>2</sub>O` wird H2O.
- **Bilder, die als `data:`-Adresse eingebettet sind**, samt Alt-Text – eine eigenständige Seite verliert also ihre Bilder.

## Ein Beispiel

Eine gespeicherte Release-Seite:

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

wird zu:

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

Menü, Fußzeile, Stylesheet und Titel sind verschwunden, und die mitten im Absatz umbrochene Zeile ist wieder eine.

## Grenzen

- `.html`-, `.htm`- oder `.xhtml`-Dateien oder eingefügter HTML-Quelltext, bis zu 10 MB auf einmal. Mehrere Dateien zählen zusammen und werden zu einem Dokument, getrennt durch ein `---`.
- Die Datei wird in Ihrem Browser umgewandelt und nicht hochgeladen. In Ihr Konto gelangt sie nur, wenn Sie angemeldet sind und auf Speichern klicken, und ein gespeichertes Dokument darf höchstens 4 MB groß sein.
- Die Datei wird als UTF-8 gelesen, gleich was ihr `<meta charset>` angibt: Eine als Windows-1252 gespeicherte Seite zeigt Ersatzzeichen statt ihrer Umlaute.
- Eine Artikelerkennung gibt es nicht: Cookie-Hinweise und Seitenleisten kommen mit. [HTML in Markdown umwandeln](/blog/convert-html-to-markdown) zeigt, wie Sie dieses Seitenmobiliar vorher entfernen.
- Ein Codeblock braucht ein `<code>`, das allein in seinem `<pre>` steht, ohne Leerraum davor oder danach, und die Sprache stammt nur aus einer Klasse `language-…`. Ein `<pre>` ohne `<code>` wird zu Text, in dem nichts maskiert ist und dessen Zeilenumbrüche beim Rendern verschwinden.
- Verbundene Zellen werden nicht aufgeteilt: Eine Zelle mit `colspan` oder `rowspan` belegt einen einzigen Platz, und der Rest der Zeile rückt nach links. Verschachtelte Tabellen werden flachgedrückt, und ein `<br>` in einer Zelle lässt deren Wörter zusammenlaufen.
- Eine Liste innerhalb eines nummerierten Listenpunkts wird um zwei Leerzeichen eingerückt, weniger als CommonMark verlangt, und ist deshalb nicht mehr verschachtelt.

## Fragen

### Kann ich eine Webseite über ihre URL in Markdown umwandeln?

Nein, diese Seite braucht die Datei oder ihren Quelltext. Speichern Sie die Seite als HTML und legen Sie die Datei hier ab, oder verwenden Sie die Browsererweiterung, die die geöffnete Seite umwandelt und vorher den eigentlichen Artikel darin findet.

### Gibt es eine API für HTML zu Markdown?

Ja. Senden Sie das HTML als Anfragekörper an `/api/v1/documents?kind=html-to-markdown`, zusammen mit einem API-Schlüssel aus Ihrem Kontomenü. Auf dem Server läuft derselbe Konverter und speichert ein Dokument; `GET /api/v1/documents/:id` liefert dessen Markdown.

```bash
curl -H "Authorization: Bearer tp_live_…" \
     --data-binary @page.html \
     "https://transformpipe.com/api/v1/documents?kind=html-to-markdown&name=page.md"
```

### Wie wandle ich HTML mit Python in Markdown um?

Ein Python-Paket gibt es nicht. Ein Skript kann die API mit `requests` aufrufen; für eine Umwandlung in Python selbst stellt [dieser Vergleich der Bibliotheken](/blog/turndown-and-html-to-markdown-libraries) html2text und Pandoc vor.

### Wird aus einer HTML-Tabelle eine Markdown-Tabelle?

Ja, mit der ersten Zeile als Kopfzeile, denn eine Markdown-Tabelle braucht eine. Fett, kursiv, Durchgestrichenes, Links und Bilder überstehen den Weg in die Zelle; eine Code-Spanne verliert ihre Backticks.

### Warum fehlen die Bilder?

Entweder waren sie `data:`-Adressen, die verworfen werden, oder sie liegen in dem Ordner, den ein Browser neben der Seite ablegt. Die Pfade bleiben, wie sie waren, also erscheinen die Bilder nur, wenn dieser Ordner neben dem Markdown liegt; [Wie man eine .html-Datei öffnet](/how-to/open-html) erklärt diesen Ordner.
