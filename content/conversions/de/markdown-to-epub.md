## Was übernommen wird

Wer hier Markdown in EPUB umwandelt, bekommt ein Buch aus genau der Seite, die die Vorschau zeigt – in Kapitel geschnitten und als EPUB 3 gepackt.

| Im Markdown | Im Buch |
| --- | --- |
| Überschriften | Kapitel, geschnitten bei `#`, wenn es mindestens zweimal vorkommt, sonst nach derselben Regel bei `##` |
| `$…$`, `$$…$$` und `mermaid`-Blöcke | Formeln als MathML; Diagramme als SVG gezeichnet, in hellen Farben |
| eingezäunte Codeblöcke in einer bekannten Sprache | Festbreitenschrift, Schlüsselwörter fett, Kommentare kursiv |
| Tabellen, Zitate, Hinweisblöcke wie `[!NOTE]` | Tabellen mit Linien, Zitate mit einer Linie links, Hinweisblöcke mit farbigem Rand und Titel |
| `==marked==`, `- [ ]`, `- [x]` | eine Markierung, ☐, ☑ |
| `[^1]` | eine nummerierte Anmerkung am Ende des Buchs, in beide Richtungen verlinkt |
| Links auf Überschriften, Webadressen und `mailto:` | Links; einer auf eine Überschrift findet das Kapitel, in dem sie gelandet ist |
| als `data:` eingebettete Bilder | Dateien im Buch: PNG, JPEG, GIF, WebP oder SVG |
| Bilder unter Webadressen | von Ihrem Browser geholt und ins Buch gelegt, sofern der Server es erlaubt |

Das Inhaltsverzeichnis führt jedes Kapitel unter seiner ersten Überschrift, bei mehreren Kapiteln darunter die nächste Ebene, einmal als EPUB-3-Navigationsseite und einmal als ältere `toc.ncx`. Der Titel ist die erste Überschrift der Ebenen 1 bis 3, sonst der Dateiname; die Sprache ist die dieser Website, auf dieser Seite also `de`. Für den Fließtext sind weder Schrift noch Textfarbe festgelegt, damit Schrift, Größe und Nachtmodus des Readers gelten.

## Was zurückbleibt

- **Frontmatter.** Der YAML-Block am Anfang wird entfernt; `title:` und `author:` darin werden nicht gelesen ([mehr zum Frontmatter](/blog/front-matter-and-what-converters-do-with-it)).
- **Autor und Cover.** Beides fehlt: Das Buch verzeichnet nur einen Titel, eine Sprache, ein Datum und eine Kennung, die bei jedem Herunterladen neu ist.
- **Manche Bilder.** Eines auf Ihrer Festplatte oder eines, das in einem anderen Format eingebettet ist, wird zu seiner Beschreibung in eckigen Klammern, kursiv; eines unter einer Webadresse, die der Browser nicht holen oder ein Buch nicht zeigen kann, wird zu einem Link unter dieser Beschreibung.
- **Links aus dem Dokument hinaus.** Ein Link auf eine andere Datei oder auf eine Überschrift, die es nicht gibt, behält nur seine Wörter. Ebenso ein Wikilink.
- **Farbe.** Die Syntaxhervorhebung erscheint fett und kursiv, nie farbig.
- **Rohes HTML.** Ein `<details>`-Block wird aufgeklappt, seine Zusammenfassung bleibt als schlichter Text stehen.

## Ein Beispiel

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

Ein `#` und zwei `##` legen den Schnitt auf `##`. Ein Titel ohne Text darunter würde das erste Kapitel eröffnen; dieser hat einen Absatz, also bilden beide ein eigenes Kapitel:

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

Das Inhaltsverzeichnis lautet Field notes, Spring, Summer. Angenommen ist hier, dass der Server des Bildes den Browser abweist; deshalb verlinkt Kapitel 2 es als `[North gate]`, sonst läge es als `OEBPS/images/picture-1.jpg` im Buch. Kapitel 3 lautet:

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

## Grenzen

- Dateien mit `.md`, `.markdown`, `.mdown` und `.mkd` bis 10 MB, oder eingefügtes Markdown. Mehrere gleichzeitig abgelegte Dateien teilen sich die 10 MB und werden zu einem Buch, getrennt durch Linien.
- Das Buch entsteht in Ihrem Browser und nur dort: Es braucht den HTML-Parser des Browsers, deshalb erzeugt die API kein EPUB. Nichts geht an ein Konto, solange Sie sich nicht anmelden und auf Speichern drücken; ein gespeichertes Dokument darf höchstens 4 MB groß sein.
- Bilder unter Webadressen fragt Ihr Browser an, jedes höchstens zehn Sekunden lang.

## Fragen

### Wie kann ich Markdown in EPUB umwandeln?

Legen Sie die .md-Datei hier ab oder fügen Sie das Markdown ein, prüfen Sie die Vorschau und drücken Sie auf „.epub herunterladen“. [Wie man aus Markdown ein EPUB macht](/how-to/make-epub) erklärt, welche Reader es öffnen und wie Sie es prüfen.

### Warum ist mein Buch ein einziges langes Kapitel?

Kapitel werden nur bei `#` oder `##` geschnitten, und nur auf einer Ebene, die mindestens zweimal vorkommt. Ein Dokument, das durchgehend `###` verwendet oder nur ein `#` und ein `##` hat, bleibt ein Kapitel.

### Kann ich Autor, Cover oder Sprache festlegen?

Hier nicht. Der Titel kommt aus der ersten Überschrift und die Sprache von der Website: Auf der deutschen Seite wird das Buch als `de` gekennzeichnet, auf der englischen als `en`. Autor und Cover, die ein Shop verlangt, lassen sich danach in Calibre ergänzen.

### Lässt es sich auf einem Kindle öffnen?

Send to Kindle nimmt EPUB seit 2022 an, und Apple Books, Google Play Books und Kobo öffnen es direkt. Formeln und Diagramme reisen als MathML und SVG mit, die manche ältere E-Ink-Reader nicht darstellen.
