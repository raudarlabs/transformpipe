## Was übernommen wird

Die erste Zeile der Datei wird zur Kopfzeile der Tabelle, jede weitere zu einer Datenzeile. Der Dateiname ohne Endung steht als Überschrift darüber: `orders.csv` öffnet sich als `# orders`.

Eine `.tsv` wird immer an Tabulatoren getrennt. Bei jeder anderen Datei entscheidet das Zeichen, das in der ersten Zeile außerhalb von Anführungszeichen am häufigsten vorkommt – Komma, Tabulator, Semikolon oder Pipe –, und wenn keines davon vorkommt, das Komma. Ein Export aus einem deutschen Excel, das Felder mit Semikolon trennt, braucht also keine Einstellung, und ein Dezimalkomma wie in `3,50` bleibt in seiner Zelle.

Für Anführungszeichen gilt RFC 4180:

| In der Datei | Im Markdown |
| --- | --- |
| Ein Komma in einem Feld in Anführungszeichen | Bleibt in der Zelle |
| Ein verdoppeltes Anführungszeichen in einem solchen Feld | Ein einzelnes Anführungszeichen |
| Ein Zeilenumbruch in einem solchen Feld | `<br>`, weil eine Tabellenzeile nicht über zwei Zeilen laufen kann |
| Eine Pipe in einem Wert | Mit einem Backslash maskiert, damit sie die Zelle nicht beendet |
| Ein Backslash in einem Wert | Verdoppelt, damit er angezeigt und nicht als Maskierung gelesen wird |
| Leerzeilen, eine Byte Order Mark | Entfernt |

Werte bleiben Text, genau so, wie sie in der Datei stehen: `42.50` behält die Null am Ende und `007` die Nullen am Anfang. Entfernt werden nur Leerzeichen am Anfang und am Ende einer Zelle.

## Was zurückbleibt

- **Ausrichtung.** Jede Spalte bekommt ein schlichtes `---`, Zahlen stehen also nicht rechtsbündig. Wer das möchte, ändert das `---` der Spalte von Hand in `---:`.
- **Maskierung über Pipes hinaus.** Sternchen, Unterstriche und Backticks in einem Wert bleiben, wie sie sind; eine Zelle mit `*urgent*` erscheint deshalb kursiv.
- **Alles, was eine Tabellenkalkulation hinzufügt.** Eine CSV enthält nur Werte – keine Formeln, keine Farben, kein zweites Tabellenblatt. Für eine Arbeitsmappe ziehen Sie die `.xlsx` selbst auf diese Seite; dann liest sie der Excel-Konverter.

## Ein Beispiel

Ein Bestellexport mit einem Komma, einem Zeilenumbruch und verdoppelten Anführungszeichen in Feldern mit Anführungszeichen sowie einer Pipe in einem Feld ohne:

```csv
id,customer,note,total
1001,"Smith, Jane","Leave at the door
Ring twice",42.50
1002,"Acme ""North"" Ltd",,19.99
1003,Brown | Co,*urgent*,7.00
```

Als `orders.csv` gespeichert, wird daraus die Überschrift `# orders` und diese Tabelle:

```markdown
| id | customer | note | total |
| --- | --- | --- | --- |
| 1001 | Smith, Jane | Leave at the door<br>Ring twice | 42.50 |
| 1002 | Acme "North" Ltd |  | 19.99 |
| 1003 | Brown \| Co | *urgent* | 7.00 |
```

## Grenzen

- Eine Datei darf bis zu 10 MB groß sein. Mehrere auf einmal abgelegte Dateien zählen gemeinsam gegen diese Grenze und werden zu einem Dokument, jede Tabelle unter ihrer eigenen Überschrift.
- Die Datei wird in Ihrem Browser umgewandelt und nicht hochgeladen. Wenn Sie angemeldet sind, gelangt die Tabelle erst in Ihr Konto, wenn Sie auf „Speichern“ klicken, und ein gespeichertes Dokument darf höchstens 4 MB groß sein.
- Kürzere Zeilen werden mit leeren Zellen aufgefüllt. Eine Zeile, die länger ist als die Kopfzeile – oft wegen eines überzähligen Kommas am Ende –, fügt eine Spalte mit leerem Kopf hinzu.
- Eine leere Datei wird mit „Diese Datei enthält keine Zeilen.“ abgelehnt.

## Fragen

### Wie kann ich CSV in eine Markdown-Tabelle umwandeln?

Laden Sie die Datei hoch oder fügen Sie ihren Text ein: Aus einer Tabellenkalkulation kopierte Zellen kommen durch Tabulatoren getrennt an, und die Tabulatoren werden erkannt. Die Hauptschaltfläche lädt eine `.md`-Datei herunter, das Menü daneben bietet HTML, Word und reinen Text. [CSV in eine Markdown-Tabelle umwandeln](/blog/convert-csv-to-markdown-table) geht die Dateien durch, bei denen meistens etwas schiefgeht.

### Wie sieht eine Markdown-Tabelle aus?

Eine Kopfzeile, eine Trennzeile aus Bindestrichen und danach eine Zeile je Datensatz, mit Pipes zwischen den Zellen. Tabellen stammen aus GitHub Flavored Markdown, nicht aus dem Kern von CommonMark; ein streng an CommonMark gebundener Renderer zeigt die Pipes deshalb als Text. [Markdown-Tabellen, die eine Konvertierung überstehen](/blog/markdown-tables-that-survive-conversion) beschreibt jede Art, auf die eine Tabelle bricht.

### Kommt der Konverter mit Semikolons, Tabulatoren und Kommas in Anführungszeichen zurecht?

Ja. Das Trennzeichen wird aus der ersten Zeile erkannt, eine `.tsv` gilt immer als tabulatorgetrennt, und alles innerhalb eines Feldes in Anführungszeichen bleibt in seiner Zelle.

### Meine Datei hat keine Kopfzeile. Was passiert?

Die erste Zeile ist immer die Kopfzeile, und keine Einstellung ändert das. Ergänzen Sie vor dem Umwandeln oben eine Zeile mit Spaltennamen, sonst landet der erste Datensatz im Tabellenkopf.

### Warum erscheinen Umlaute als unlesbare Zeichen?

Die Datei wird als UTF-8 gelesen; eine CSV in einer älteren Kodierung wie Windows-1252 verliert dabei ihre Umlaute und Akzente. Speichern Sie sie erneut als UTF-8 – Excel bietet dafür „CSV UTF-8“ an. [Wie man eine .csv-Datei öffnet](/how-to/open-csv) behandelt die übrigen Importprobleme.

### Lässt sich eine Markdown-Tabelle zurück in CSV umwandeln?

Nein. Zum Herunterladen gibt es Markdown, HTML, Word, reinen Text, EPUB und Formate für Confluence, Jira und Slack; CSV gehört nicht dazu.
