## Was übernommen wird

Jedes Zeichen und jede Zeile, ergänzt um einen Backslash oder eine Zeichenreferenz fast überall dort, wo Markdown in reinen Text eine Formatierung hineinlesen würde:

| In der Datei | Im Markdown |
| --- | --- |
| `*`, `_`, `` ` ``, `[`, `]`, `~` an beliebiger Stelle | `\*`, `\_`, `` \` ``, `\[`, `\]`, `\~` |
| Ein Backslash, etwa in `C:\Users` | Zwei: `C:\\Users` |
| `#` oder `>` am Zeilenanfang | `\#`, `\>` |
| `-`, `+`, `1.` oder `1)` mit Leerzeichen am Zeilenanfang | `\-`, `\+`, `1\.`, `1\)` |
| `<` vor einem Buchstaben, `/`, `!` oder `?` | `&lt;` |
| `&` am Beginn einer Zeichenreferenz wie `&amp;` | `&amp;amp;` |

Jeder Zeilenumbruch bekommt einen Backslash, den sichtbaren harten Zeilenumbruch von CommonMark, weil Markdown die Zeilen sonst zusammenfügen würde. Mehrere Leerzeilen hintereinander werden zu einem einzigen Absatzwechsel, Windows-Zeilenenden werden vereinheitlicht, und eine Byte-Order-Mark wird entfernt.

Alles Übrige bleibt, wie es getippt wurde, `AT&T` und `a < b` eingeschlossen.

## Was zurückbleibt

Kein Wort geht verloren. Zurück bleibt die Struktur, die der Text nur andeutet:

- **Überschriften.** Ein Titel in Großbuchstaben bleibt eine gewöhnliche Zeile.
- **Listen.** Eine Zeile, die mit einem Bindestrich oder einer Zahl beginnt, bleibt eine Zeile.
- **Ausrichtung.** Führende Leerzeichen und Tabulatoren bleiben im Markdown stehen, beim Rendern fallen sie aber zusammen.

## Ein Beispiel

Eine Textdatei mit Besprechungsnotizen:

```text
Standup notes, 14 October
Owner: priya_k

- deploy moved to *Thursday*
1. fix the login bug first
# of open tickets: 12
Wrap key names in <kbd> in the docs

> 3 failing tests, see C:\ci\log.txt
```

wird zu:

```markdown
Standup notes, 14 October\
Owner: priya\_k

\- deploy moved to \*Thursday\*\
1\. fix the login bug first\
\# of open tickets: 12\
Wrap key names in &lt;kbd> in the docs

\> 3 failing tests, see C:\\ci\\log.txt\
```

Gerendert liest es sich Zeile für Zeile wie die Datei, `<kbd>` eingeschlossen; nur der letzte Backslash ist überzählig. Als Markdown gelesen, ergäbe dieselbe Datei einen Aufzählungspunkt, Kursivschrift, eine nummerierte Liste, eine Überschrift und ein Zitat.

## Grenzen

- `.txt`-Dateien oder eingefügter Text, bis zu 10 MB auf einmal. Mehrere Dateien werden zu einem Dokument, getrennt durch ein `---`.
- Die Datei wird in Ihrem Browser umgewandelt und nicht hochgeladen. In Ihr Konto gelangt sie nur, wenn Sie angemeldet sind und auf Speichern klicken, und ein gespeichertes Dokument darf höchstens 4 MB groß sein.
- Die Datei wird als UTF-8 gelesen: Text, der als Windows-1252 gespeichert wurde, zeigt Ersatzzeichen statt Umlauten, und [Wie man eine .txt-Datei öffnet](/how-to/open-txt) erklärt, wie Sie ihn mit der richtigen Kodierung neu öffnen.
- Endet die Datei mit genau einem Zeilenumbruch, wie die meisten Editoren sie speichern, behält ihre letzte Zeile einen Backslash, den die Vorschau anzeigt – das ist der am Ende des Beispiels.
- `$`, `=` und `^` werden nicht maskiert. Die Vorschau zeigt deshalb `$x+1$` als Formel, `==Wort==` markiert und `x^2^` hochgestellt. Auch eine Summe in eckigen Klammern wie `[a+b]` wird zur Formel, denn maskierte eckige Klammern sind die Begrenzer von LaTeX.
- Eine Zeile aus drei oder mehr Bindestrichen, die für sich steht, wird zur thematischen Trennlinie, und eine Zeile aus `=` oder `-` am Ende eines Absatzes macht ihn zur Überschrift. Eine mit Pipes getippte Tabelle bleibt Text.
- Ein Absatz, der mit vier Leerzeichen oder einem Tabulator eingerückt ist, wird zum Codeblock, sofern er nicht der erste ist – und die Backslashes darin sind sichtbar.
- Eine Webadresse, die einen Unterstrich enthält oder am Zeilenende steht, zeigt einen überzähligen Backslash, wenn die Vorschau sie verlinkt.

## Fragen

### Warum nicht einfach die .txt in .md umbenennen?

Wenn die Datei als Markdown geschrieben wurde, ja: Eine `.md` landet auf der Seite „Markdown in HTML“, die sie so nimmt, wie sie ist. Wenn nicht, macht das Umbenennen aus einem Bindestrich einen Aufzählungspunkt und aus einem Sternchen Kursivschrift.

### Kann der Konverter formatierten Text in Markdown umwandeln?

Dieser nicht. Eine `.txt` enthält keine Formatierung, und das Einfügefeld nimmt reinen Text an, sodass Fettdruck und Überschriften, die Sie von einer Seite kopieren, als bloße Wörter ankommen. Eine `.rtf` hat ihren eigenen Konverter „Rich Text in Markdown“; eine gespeicherte Webseite gehört zu „HTML in Markdown“.

### Macht er aus meinen Überschriften und Listen Markdown?

Nein. Er kann eine Überschrift nicht von einem kurzen Satz unterscheiden und einen Aufzählungspunkt nicht von einem Minuszeichen, und ein falscher Tipp würde verändern, was der Text sagt.

### Warum stehen überall Backslashes?

Es sind Maskierungen, und ein Renderer blendet sie aus: `\*` erscheint als Sternchen, ein Backslash am Zeilenende als Zeilenumbruch. [Markdown-Escape-Zeichen](/blog/markdown-escaping) listet auf, was jedes davon schützt; [Zeilenumbrüche und Listen](/blog/markdown-line-breaks-and-lists) erklärt den Umbruch.

### Kann ich Reintext per Skript in Markdown umwandeln?

Ja, mit einem Konto: Senden Sie den Text als Anfragekörper an `/api/v1/documents?kind=text-to-markdown`, zusammen mit einem API-Schlüssel aus Ihrem Kontomenü. Auf dem Server läuft derselbe Konverter und speichert ein Dokument.
