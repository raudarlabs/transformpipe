## Was übernommen wird

Das Markdown wird als GitHub Flavored Markdown gelesen, ergänzt um die Erweiterungen, die in Notizen und Dokumentation üblich sind:

| Im Markdown | Im HTML |
| --- | --- |
| Überschriften | `<h1>` bis `<h6>`, jede mit einer ID wie `doc-setup` |
| Ein Link auf `#setup` | Auf diese Überschrift gerichtet, ob in GitHubs oder in Obsidians Schreibweise |
| Aufgabenlisten, Tabellen | Kästchen, die sich nicht anklicken lassen; Tabellen, die auf schmalen Bildschirmen seitlich scrollen |
| Eingezäunte Codeblöcke | Syntaxhervorhebung für Python, JavaScript, SQL, Bash, YAML und rund zwanzig weitere Sprachen |
| Ein `mermaid`-Block | Das Diagramm, als SVG in die heruntergeladene Datei gezeichnet |
| `$…$`-Formeln, Fußnoten | MathML; Fußnoten nummeriert und am Ende gesammelt |
| `> [!NOTE]`, `==mark==`, `H~2~O` | Ein Hinweisblock, `<mark>`, `<sub>` |

„.html herunterladen“ speichert eine einzige Datei: das Dokument samt Stylesheet, ohne Skript und ohne Webschrift, in der hellen oder dunklen Palette, die die App gerade zeigt, und beim Drucken hell. Eine Zeile am Fuß nennt das Dokument und den Zeitpunkt der Umwandlung und verlinkt auf TransformPipe. Das Menü neben der Schaltfläche bietet außerdem Markdown, Markdown für Obsidian, reinen Text, Word, EPUB, Confluence, Jira, Slack und ein PDF über den Druckdialog.

## Was zurückbleibt

- **Frontmatter.** Ein YAML-Block zwischen zwei `---`-Zeilen am Anfang wird entfernt.
- **Wikilinks.** Aus `[[Install guide]]` werden die Wörter „Install guide“, aus `![[diagram.png]]` der Dateiname in Kursivschrift.
- **HTML außerhalb der Positivliste.** `<script>`, `<style>` und `<iframe>` verschwinden samt Inhalt, die Attribute `style` und `onclick` werden entfernt, und ein Tag wie `<details>` geht verloren, sein Text aber bleibt.
- **Einfache Zeilenumbrüche.** Ein Zeilenumbruch innerhalb eines Absatzes wird zum Leerzeichen, wie bei GitHub. Für einen harten Zeilenumbruch, also ein `<br>`, endet die Zeile mit zwei Leerzeichen oder einem Backslash.
- **Bilder als Dateien.** Ein Bild bleibt ein `<img>`, das auf seine Adresse verweist. Ein relativer Pfad wie `img/chart.png` funktioniert nur, wenn dieser Ordner neben der heruntergeladenen Datei liegt, denn zum Konverter gelangt nur die `.md`.

## Ein Beispiel

Die Eingabe:

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

Im `<article>` der heruntergeladenen Datei steht:

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

Das Frontmatter ist verschwunden, der Link erreicht die tatsächliche ID der Überschrift, und die Fußnote ist ans Ende gewandert.

## Grenzen

- **10 MB pro Umwandlung**, gezählt über alle Dateien, die Sie gemeinsam ablegen. Mehrere Dateien werden zu einem Dokument, jeweils durch eine horizontale Linie getrennt.
- **.md, .markdown, .mdown und .mkd** oder als Text eingefügtes Markdown. Eine `.txt` geht stattdessen an den Konverter für reinen Text.
- **Alles läuft in Ihrem Browser**, die Umwandlung ebenso wie der Download. Ohne Anmeldung wird die Datei nicht hochgeladen; mit Anmeldung erreicht das Dokument Ihr Konto erst, wenn Sie auf Speichern klicken, und zwar bis 4 MB.
- **Ein Diagramm muss fehlerfrei sein.** Ein Mermaid-Block mit einem Fehler bleibt als Quelltext stehen.
- **Ein einziges Stylesheet.** Eigenes CSS oder eine Vorlage lassen sich nicht einstellen.

## Fragen

### Wie kann ich Markdown in HTML umwandeln?

Ziehen Sie eine `.md`-Datei auf diese Seite oder fügen Sie das Markdown als Text ein. Die Vorschau zeigt die fertige Seite, und „.html herunterladen“ speichert sie unter demselben Namen. Ein Konto ist nicht nötig. Wer eine Datei nur lesen will, findet in [Wie man eine .md-Datei öffnet](/how-to/open-md) die passenden Programme.

### Ist die HTML-Datei eigenständig?

Ja, abgesehen von Bildern, die über eine Adresse eingebunden sind. Das Stylesheet steckt in der Datei, für Schriften oder Skripte wird nichts nachgeladen, und Diagramme und Formeln sind eingezeichnet. So öffnet sie sich aus einer E-Mail oder von einer Festplatte ohne Netz genauso. [Eigenständiges HTML erklärt](/blog/self-contained-html-explained) geht weiter ins Detail.

### Kann ich das HTML auch kopieren?

Ja. Der Reiter „HTML-Quelltext“ zeigt die ganze Datei, Diagramme allerdings noch als Mermaid-Quelltext, und „HTML kopieren“ legt sie so in die Zwischenablage. Für ein Fragment, das in ein CMS soll, nehmen Sie den Inhalt von `<article>`.

### Wird GitHub Flavored Markdown unterstützt?

Ja: Tabellen, Aufgabenlisten, `~~Durchgestrichenes~~`, eingezäunte Codeblöcke und nackte Links werden so gelesen, wie GitHub sie liest, dazu kommen Fußnoten, Hinweisblöcke, Formeln und Mermaid.

### Wird mein Markdown hochgeladen?

Nein. Es wird in Ihrem Browser umgewandelt und im Speicher dieses Browsers aufbewahrt; einen Server erreicht es nur, wenn Sie sich anmelden und auf Speichern klicken. [Markdown online in HTML umwandeln, ohne etwas zu installieren](/blog/convert-markdown-to-html-online) zeigt, wie Sie das bei jedem Konverter prüfen.

### Kann ich eigenes CSS verwenden?

Nein. Die Datei bringt das Stylesheet des Dokuments mit. Sie ist aber reines HTML, und der `<style>`-Block lässt sich nachträglich ersetzen.
