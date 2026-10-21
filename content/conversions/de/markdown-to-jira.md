## Was übernommen wird

Das Wiki-Markup von Jira sieht aus wie Markdown, wird aber anders gelesen: Ein einzelnes Sternchen macht fett, ein Bindestrich streicht durch, eine Liste ist eine Folge von `*` oder `#`, und ein Zeilenumbruch innerhalb eines Absatzes bleibt ein Umbruch. Wer Markdown in Jira umwandeln will, bekommt jedes Element in der Form, die Jira liest:

| Im Markdown | Im Jira-Markup |
| --- | --- |
| `## Heading` | `h2. Heading` |
| `**bold**`, `*italic*`, `~~struck~~` | `*bold*`, `_italic_`, `-struck-` |
| `[words](https://example.com)` | `[words\|https://example.com]` |
| `![chart](https://example.com/a.png)` | `!https://example.com/a.png\|alt=chart!` |
| Ein eingezäunter Codeblock in einer Sprache, die Jira kennt | `{code:python}` |
| Jeder andere Codeblock | `{noformat}` |
| Eine Tabelle | `\|\|head\|\|` und `\|cell\|` |
| Ein Zitat | `{quote}` |
| Ein Hinweisblock wie `> [!WARNING]` | `{panel}` in der Farbe, die Atlassian dafür vorsieht |
| Eine Aufgabenliste | `(/)` für erledigt, `☐` für offen |

Verschachtelte Listen wiederholen das Zeichen, ein Aufzählungspunkt unter einem nummerierten Eintrag wird also zu `#*`. Zeilen, die innerhalb eines Absatzes umbrochen sind, werden zusammengeführt, damit Jira sie nicht dort trennt, wo Ihr Editor umgebrochen hat. Ein Link auf eine Überschrift im Dokument springt weiterhin, und zwar zu einem `{anchor}`, der an den Anfang der Überschrift gesetzt wird; Fußnoten werden zu hochgestellten Zahlen.

Eckige und geschweifte Klammern sowie Pipes werden immer mit einem Backslash maskiert, weil jedes dieser Zeichen in Jira einen Link, ein Makro oder eine Zelle öffnet. Ein Zeichen wie `*` oder `-` wird nur am Wortrand maskiert, wo Jira es tatsächlich auswerten würde: `e-mail` bleibt, wie es ist, aus `-flag` wird `\-flag`. Emoticons wie `(i)` werden maskiert, damit sie Text bleiben, und Fettdruck mitten im Wort verwendet die Form mit geschweiften Klammern, `{*}un{*}believable`. Die Regeln von Markdown selbst stehen in [der Referenz zur Maskierung](/blog/markdown-escaping).

## Was zurückbleibt

- **Frontmatter** am Anfang einer Notiz wird entfernt, und **Wikilinks** behalten nur ihre Worte.
- **Bilder ohne Webadresse**, also mit relativem Pfad oder in die Datei eingebettet, werden zu ihrer Beschreibung in Kursivschrift, `_\[diagram\]_`, oder entfallen, wenn sie keine haben, denn Jira kann sie nicht laden; mehr dazu unter [Bilder und Links, die noch funktionieren](/blog/images-and-links-that-still-work).
- **Rohes HTML** behält seinen Text und verliert Tags und Kommentare.
- **Ein Zitat im Zitat** geht im äußeren auf, weil sich `{quote}` nicht verschachteln lässt.
- **Die Spaltenausrichtung** von Tabellen.
- **Diagramme und Formeln** kommen als Quelltext an, in `{noformat}` oder `{{ }}`.

## Ein Beispiel

Ein Fehlerbericht in Markdown:

````markdown
## Steps to reproduce

1. Open **Billing** and pick a plan
2. Run `sync --force`, then check the [log](https://example.com/log)

> [!WARNING]
> The retry deletes the draft invoice.

| Field | Before | After |
| --- | --- | --- |
| Status | *open* | ~~paid~~ |

```ts
await retry(invoice);
```

- [x] Reproduced on staging
- [ ] Fixed
````

Daraus wird dieses Jira-Markup:

```text
h2. Steps to reproduce

# Open *Billing* and pick a plan
# Run {{sync \-\-force}}, then check the [log|https://example.com/log]

{panel:title=Warning|bgColor=#FFFAE6}
The retry deletes the draft invoice.
{panel}

||Field||Before||After||
|Status|_open_|-paid-|

{code:javascript}
await retry(invoice);
{code}

* (/) Reproduced on staging
* ☐ Fixed
```

Die Bindestriche in `{{ }}` werden maskiert, weil Jira dort weiterhin Formatierungszeichen liest; TypeScript wird als `javascript` ausgegeben, die nächstliegende Sprache, die das `{code}`-Makro kennt.

## Grenzen

- Dateien mit `.md`, `.markdown`, `.mdown` und `.mkd` bis 10 MB oder eingefügtes Markdown. Mehrere zusammen abgelegte Dateien werden zu einem Dokument, und die 10 MB gelten für alle gemeinsam.
- Die Umwandlung läuft in Ihrem Browser. Hochgeladen wird nichts, solange Sie sich nicht anmelden und auf Speichern klicken; ein Konto bewahrt Dokumente bis 4 MB auf.
- Der Download ist eine Textdatei, `<name>.jira.txt`.
- Eine nummerierte Liste beginnt in Jira bei 1, gleich mit welcher Zahl das Markdown anfing. Ein Codeblock oder eine Tabelle in einem Listeneintrag steht nach dessen Zeile, und die Zählung beginnt darunter von vorn.

## Fragen

### Unterstützt Jira Markdown?

Teilweise. Der Editor von Jira Cloud formatiert Markdown schon beim Tippen, aber der Textmodus von Jira Data Center, Version 2 der REST-API und Automatisierungsregeln lesen Wiki-Markup, und Markdown, das dort eingefügt wird, betont die falschen Wörter.

### Wie füge ich Markdown in Jira Cloud ein, ohne die Formatierung zu verlieren?

Wandeln Sie es hier um und klicken Sie auf „Für Jira kopieren“. In der Zwischenablage liegen dann das Wiki-Markup als reiner Text und das gerenderte Dokument als HTML, und der Editor von Jira Cloud übernimmt die formatierte Fassung. Mehr dazu in [der Anleitung zum Einfügen](/how-to/paste-markdown).

### Lässt sich Jira-Markup zurück in Markdown umwandeln?

Nein. Die Umwandlung geht nur in eine Richtung, von Markdown zu Wiki-Markup.

### Warum ist mein Codeblock als {noformat} herausgekommen?

Der Codeblock hatte keine Sprache oder eine, die das `{code}`-Makro nicht kennt. Ein `{code}`-Block ohne Sprache wird als Java hervorgehoben, deshalb zeigt `{noformat}` ihn stattdessen unverändert an. Abkürzungen wie `sh` und `yml` werden auf `bash` und `yaml` abgebildet.

### Erzeugt es das JSON für Version 3 der REST-API?

Nein. Version 3 der REST-API von Jira Cloud erwartet das Atlassian Document Format, das hier nicht entsteht; das Wiki-Markup nimmt Version 2 an.

### Ist das dasselbe Format, das Confluence verwendet?

Nein. Confluence speichert eine Seite im Speicherformat, XHTML mit eigenen Makros, und genau das schreibt der Konverter von Markdown in Confluence.
