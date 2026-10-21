## Was übernommen wird

Um Markdown in Confluence zu bringen, wird es in das Confluence-Speicherformat umgewandelt – das XHTML, in dem eine Seite gespeichert ist – und im Tab **Confluence** neben der Vorschau angezeigt:

| Im Markdown | In Confluence |
| --- | --- |
| `#` bis `######` | `<h1>` bis `<h6>` |
| Ein eingezäunter Codeblock | Das Code-Makro, mit Sprache, sofern die Liste des Makros sie kennt |
| `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]` | Die Makros `info`, `tip`, `info`, `note` und `warning` |
| Eine Aufgabenliste, jeder Eintrag `- [ ]` oder `- [x]` | Die Aufgabenliste von Confluence, mit Kästchen zum Abhaken |
| Ein Link auf `#eine-ueberschrift` | Ein Link auf ein Anker-Makro am Anfang dieser Überschrift |
| Eine Tabelle | Eine Tabelle mit Kopfzeile, die Spaltenausrichtung bleibt |
| Fußnoten | Hochgestellte Zahlen, die Anmerkungen am Ende aufgelistet |
| Ein Bild unter einer `https://`-Adresse | Ein Bild, das auf diese Adresse verweist |
| `==markiert==`, `H~2~O`, `x^2^` | Hervorhebung, tiefgestellt, hochgestellt |

Die Hinweisblöcke werden nach Farbe zugeordnet, nicht nach Namen: Bei Confluence ist `note` gelb und `warning` rot, also wird GitHubs Warning zu `note` und Caution zu `warning`. Ein Titel hinter der Markierung, etwa `> [!TIP] Bevor Sie anfangen`, wird zum Titel des Bereichs. Verschachtelte Listen und die Startnummer einer nummerierten Liste bleiben erhalten.

## Was zurückbleibt

- **Diagramme und Formeln.** Ein Mermaid-Block bleibt sein Quelltext in einem Code-Makro mit dem Titel „Mermaid diagram“, eine abgesetzte Formel ihr TeX in einem Makro mit dem Titel „LaTeX“, eine Formel im Text wird zu Code.
- **Bilder ohne Webadresse.** Ein relativer Pfad oder ein in die Datei eingebettetes Bild erreicht eine Seite nicht ohne Upload; es wird deshalb als sein Alt-Text in Kursivschrift geschrieben, `[Screenshot]`, oder entfällt, wenn es keinen hat.
- **Rohes HTML.** Die Tags fallen weg, ihre Wörter bleiben; ein `<br>` bleibt ein Zeilenumbruch.
- **Frontmatter** wird entfernt, und **Wikilinks** behalten nur ihre Wörter.
- **Eine Liste, die Aufgaben und normale Einträge mischt**, wird eine gewöhnliche Liste, die Kästchen als ☑ und ☐ gezeichnet.
- **Sprachen, die das Code-Makro nicht kennt**, etwa Go oder Rust: Der Block geht ohne Sprache hinaus.

## Ein Beispiel

````markdown
## Before you deploy

- [x] Tests pass on `main`
- [ ] Changelog updated

> [!WARNING]
> Deploys are frozen after **Thursday**.

```bash
npm run build
```

Back to [the checklist](#before-you-deploy).
````

wird zu:

```xml
<h2><ac:structured-macro ac:name="anchor" ac:schema-version="1"><ac:parameter ac:name="">before-you-deploy</ac:parameter></ac:structured-macro>Before you deploy</h2>
<ac:task-list><ac:task><ac:task-id>1</ac:task-id><ac:task-status>complete</ac:task-status><ac:task-body>Tests pass on <code>main</code></ac:task-body></ac:task><ac:task><ac:task-id>2</ac:task-id><ac:task-status>incomplete</ac:task-status><ac:task-body>Changelog updated</ac:task-body></ac:task></ac:task-list>
<ac:structured-macro ac:name="note" ac:schema-version="1"><ac:rich-text-body><p>Deploys are frozen after <strong>Thursday</strong>.</p></ac:rich-text-body></ac:structured-macro>
<ac:structured-macro ac:name="code" ac:schema-version="1"><ac:parameter ac:name="language">bash</ac:parameter><ac:plain-text-body><![CDATA[npm run build]]></ac:plain-text-body></ac:structured-macro>
<p>Back to <ac:link ac:anchor="before-you-deploy"><ac:link-body>the checklist</ac:link-body></ac:link>.</p>
```

## Grenzen

Eine Datei darf bis zu 10 MB groß sein, oder Sie fügen das Markdown direkt ein. Die Umwandlung läuft in Ihrem Browser; ohne Anmeldung wird nichts hochgeladen. **.confluence.xml herunterladen** speichert das Speicherformat als Datei.

Nichts hier verbindet sich mit Confluence: Das Ergebnis fügen Sie selbst ein oder senden es selbst, und wohin es geht, entscheidet, welche Hälfte von **Für Confluence kopieren** zählt – die Schaltfläche legt zwei Fassungen in die Zwischenablage.

- **Confluence Cloud.** Der Editor nimmt die formatierte Fassung, das HTML der Vorschau, und baut daraus nach seinen eigenen Einfügeregeln eine Seite. Für Code-Makro, Bereiche und Aufgabenliste genau wie geschrieben senden Sie das Speicherformat an `body.storage` der REST-API.
- **Data Center.** Der Quelltext-Editor und die REST-API nehmen das Speicherformat. Das Code-Makro erhält nur Sprachen aus seiner eigenen Liste, weil Data Center bei jeder anderen ein Fehlerfeld anzeigt.
- **Beide.** Links auf Überschriften nutzen Anker-Makros, weil Confluence die eigenen IDs von Überschriften in Cloud und Data Center unterschiedlich schreibt.

Das Ergebnis ist der Inhalt einer Seite: Ein `# Titel` am Anfang bleibt darin als Überschrift stehen.

## Fragen

### Wie füge ich Markdown in Confluence ein?

Wandeln Sie die Datei um, drücken Sie **Für Confluence kopieren** und fügen Sie ein. Der Cloud-Editor nimmt die formatierte Fassung, ein Feld, das Markup erwartet, das Speicherformat; [Markdown in Confluence, Jira oder Slack einfügen](/how-to/paste-markdown) erklärt beides.

### Kann ich Markdown damit direkt in Confluence importieren oder hochladen?

Nein. Es gibt keine Verbindung zu Confluence, also kann hier keine Seite angelegt, geändert oder hochgeladen werden. Sie erhalten das Speicherformat zum Einfügen oder für ein Skript, das es an die REST-API sendet.

### Entsteht Atlassian Document Format (ADF)?

Nein. Die einzige Ausgabe für Confluence ist das Speicherformat, das XHTML, das `body.storage` annimmt. ADF ist ein eigenes JSON-Format, und nichts hier schreibt es.

### Wie kommen Markdown-Tabellen in Confluence an?

Als Confluence-Tabellen: die erste Zeile als Kopfzellen, und die Ausrichtung, die die Doppelpunkte der Trennzeile festlegen, bleibt an jeder Zelle erhalten. Markdown kennt keine verbundenen Zellen, also entstehen auch keine; [Markdown-Tabellen, die eine Umwandlung überstehen](/blog/markdown-tables-that-survive-conversion) zeigt, wie eine Tabelle geschrieben sein muss, damit sie überhaupt erkannt wird.

### Gibt es hier einen Konverter von HTML nach Confluence?

Nein, und auch kein Plugin: Diese Seite nimmt Markdown an. Eine HTML-Datei muss zuerst die Umwandlung von HTML in Markdown durchlaufen und kommt danach hierher.
