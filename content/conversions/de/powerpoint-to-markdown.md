## Was übernommen wird

Aus der Präsentation wird ein Dokument: zuerst eine Liste der Folientitel, dann ein Abschnitt pro Folie, getrennt durch Trennlinien. Die Folien kommen in der Reihenfolge, in der die Präsentation abläuft – eine nach vorn gezogene Folie steht also auch vorn. Innerhalb einer Folie werden die Formen in der Reihenfolge gelesen, in der die Datei sie speichert.

| Auf der Folie | Im Markdown |
| --- | --- |
| Der Titel | Die Überschrift, sonst eine kurze erste Zeile, sonst „Slide 4“ |
| Auf der Folie gesetzte Aufzählungszeichen und Nummern | Eine Liste, `-` oder `1.`, nach Ebene eingerückt |
| Anderer Text | Absätze |
| Fette und kursive Wörter | `**fett**` und `*kursiv*`, außer die ganze Zeile ist so gesetzt |
| Ein Weblink | Ein Markdown-Link auf dieselbe Adresse |
| Eine Tabelle | Eine Markdown-Tabelle, erste Zeile als Kopfzeile |
| Ein Bild | Ein eingebettetes Bild mit seinem Alt-Text |
| Sprechernotizen | Ein Zitat unter der Folie mit der englischen Überschrift **Notes** |

Außerhalb von Tabellen werden ein Sternchen oder eine Raute auf einer Folie maskiert und erscheinen so, wie sie getippt wurden. Ein Bild, das auf einer späteren Folie erneut vorkommt, etwa ein Logo, wird nur beim ersten Mal übernommen.

## Was zurückbleibt

Diagramme und SmartArt werden nicht gelesen; eine Folie, die nur ein Diagramm enthält, behält Titel und Notizen. Foliennummern, Datum und Fußzeilen fallen weg, ebenso alles, was zur Gestaltung gehört: Design, Farben, Schriften, Positionen, Animationen und Übergänge. Was auf dem Folienmaster oder einem Layout liegt, wird nicht gelesen, Kommentare aus der Überprüfung ebenfalls nicht. Ein Link auf eine andere Folie zeigt auf einen Pfad innerhalb der Datei, etwa `ppt/slides/slide3.xml`, und führt ins Leere.

In einer Tabelle wird eine verbundene Zelle weggelassen statt leer übernommen, sodass der Rest ihrer Zeile um eine Spalte nach links rückt: Eine Überschrift über zwei Spalten steht über der ersten davon. Eine Spalte, die in jeder Zeile leer ist, wird entfernt.

## Ein Beispiel

`hiring-plan.pptx` hat zwei Folien. „Where the gaps are“ hat drei auf der Folie gesetzte Stichpunkte, der zweite eingerückt, ein fettes Wort und zwei Absätze Sprechernotizen. „Budget“ hat eine Tabelle mit drei Zeilen und ein Diagramm. Beide tragen eine Fußzeile und eine Foliennummer.

  ```markdown
  # hiring-plan

  - Where the gaps are
  - Budget

  ---

  # Where the gaps are

  - Two backend engineers by September
    - One for search, one for payments
  - A designer shared with **Growth**

  > **Notes**
  >
  > We lost two people in June. **Search** is the hire that matters, because the index rebuild is blocked on it.
  >
  > Ask Finance about the designer before Thursday.

  ---

  # Budget

  | Role | Start | Cost |
  | --- | --- | --- |
  | Backend (search) | September | £78k |
  | Backend (payments) | October | £74k |
  ```

Diagramm, Fußzeile und Foliennummern sind verschwunden; die Notizen stehen unter der Folie, die sie erklären.

## Grenzen

Eine Datei darf bis zu 50 MB groß sein. Mehrere gleichzeitig abgelegte Präsentationen teilen sich diese 50 MB und werden zu einem Dokument. Gelesen wird nur `.pptx`; das ältere binäre `.ppt` wird abgelehnt.

Aufzählungszeichen werden von der Folie selbst gelesen. Erbt eine Folie sie vom Layout, wie es das Inhaltsfeld im PowerPoint-Layout „Titel und Inhalt“ meist tut, kommen die Punkte als einzelne Absätze an, ohne Aufzählungszeichen und ohne Ebenen. Aus demselben Grund kann der Untertitel einer Titelfolie als Liste mit einem Eintrag erscheinen.

Bilder werden im Markdown selbst mitgeführt, bis etwa 750 KB pro Bild und 1,5 MB für die ganze Präsentation. Ein Bild über einer der Grenzen oder in einem Format, das sich nicht mitführen lässt, etwa EMF, wird zu einer kursiven Zeile, mit seinem Alt-Text, falls es einen hat.

Ausgeblendete Folien werden mit umgewandelt. Angemeldet kann ein gespeichertes Dokument bis zu 4 MB Markdown umfassen, Bilder eingeschlossen.

## Fragen

### Wie kann ich PowerPoint in Markdown umwandeln?

Legen Sie die `.pptx` auf dieser Seite ab oder wählen Sie sie über „Dateien auswählen“ aus. Das Dokument erscheint auf dem Bildschirm und lässt sich kopieren oder als `.md`-Datei mit dem Namen der Präsentation herunterladen.

### Werden die Sprechernotizen übernommen?

Ja, nach dem Inhalt jeder Folie, als Zitat mit der Überschrift **Notes**. Ein PDF-Export verliert sie meist. Wo sich der Notizbereich versteckt, steht in [So öffnen Sie eine .pptx-Datei](/how-to/open-pptx).

### Lässt sich auch eine alte .ppt-Datei umwandeln?

Nein. `.ppt` ist das binäre Format aus der Zeit vor 2007, und diese Seite liest nur das ZIP-basierte `.pptx`. Speichern Sie die Präsentation in dem Programm, das sie öffnet, als `.pptx` und wandeln Sie dann diese Datei um.

### Kann ich Markdown in PowerPoint umwandeln?

Nein. Nichts hier schreibt eine `.pptx`: Ein Dokument lässt sich als Markdown, HTML, reiner Text, Word, EPUB oder in den Formaten für Confluence, Jira und Slack herunterladen. Auch die Wege, die [PowerPoint in Markdown umwandeln](/blog/convert-powerpoint-to-markdown) vergleicht, gehen alle von einer Präsentation aus.

### Wird die Präsentation hochgeladen?

Nein. Sie wird in Ihrem Browser entpackt und umgewandelt, und die Datei verlässt Ihren Rechner nicht. Davon wird nur dann etwas gesendet, wenn Sie angemeldet sind und auf Speichern klicken – und dann das Markdown, nicht die Präsentation.
