## Was übernommen wird

Jedes Tabellenblatt mit mindestens einer gefüllten Zeile wird zu einer Markdown-Tabelle, in der Reihenfolge der Arbeitsmappe und ausgeblendete Blätter eingeschlossen. Enthält die Mappe nur ein solches Blatt, steht die Tabelle unter einer Überschrift aus dem Dateinamen. Bei zwei oder mehr Blättern folgt auf diese Überschrift eine Liste der Blattnamen, dann jedes Blatt unter seiner eigenen Überschrift, getrennt durch Trennlinien.

Die erste Zeile jedes Blatts wird zur Kopfzeile, und kürzere Zeilen werden mit leeren Zellen aufgefüllt.

| In der Arbeitsmappe | Im Markdown |
| --- | --- |
| Text | Der Text, an beiden Enden um Leerzeichen gekürzt |
| Eine Zahl | Der gespeicherte Wert: `1250`, nicht `£1,250.00` |
| Ein Datum | Ein ISO-Datum wie `2026-07-14` |
| WAHR und FALSCH | `true` und `false` |
| Eine Formel | Das Ergebnis, das mit der Datei gespeichert wurde |
| Ein Zeilenumbruch in einer Zelle | `<br>` |
| Ein Pipe-Zeichen | Maskiert, damit es die Zelle nicht beendet |
| Eine leere Zeile zwischen Zeilen | Eine Zeile aus leeren Zellen |

## Was zurückbleibt

Alles, was kein Wert ist. Zuerst die Zahlenformate: Währungssymbole, Tausendertrennzeichen, gewählte Nachkommastellen und Prozentangaben – aus 10 % wird `0.1`. Ein Datum mit Uhrzeit behält nur das Datum, und eine Uhrzeit allein wird zum Datum `1899-12-30`. Schriften, Farben, Rahmen, Spaltenbreiten, bedingte Formatierung, Kommentare, Diagramme und Bilder werden nicht gelesen.

Eine verbundene Zelle behält ihren Wert in der ersten Zelle, die übrigen Zellen des Verbunds bleiben leer. Ein Link behält seinen Text und verliert seine Adresse. Eine Formel, die mit einem Fehler wie `#DIV/0!` endet, ergibt eine leere Zelle.

Sternchen und Unterstriche, die in einer Zelle stehen, werden nicht maskiert: `**Entwurf**` in einer Zelle erscheint nach dem Rendern fett.

## Ein Beispiel

`q3-budget.xlsx` hat drei Blätter. „Q3 budget“ enthält zwei Anschaffungen mit Datum, Kosten im Pfund-Format und eine Spalte mit WAHR oder FALSCH, einen Namen mit Zeilenumbruch und eine Summenzeile mit `=SUM(D2:D3)`. „Suppliers“ hat einen Namen mit Pipe-Zeichen und einen Rabatt im Prozentformat. Das dritte Blatt ist leer.

  ```markdown
  # q3-budget

  - Q3 budget
  - Suppliers

  ---

  # Q3 budget

  | Item | Owner | Due | Cost | Approved |
  | --- | --- | --- | --- | --- |
  | Laptop stands | Priya | 2026-07-14 | 1250 | true |
  | Monitor arms<br>(pair) | Sam | 2026-08-01 | 480.5 | false |
  | Total |  |  | 1730.5 |  |

  ---

  # Suppliers

  | Supplier | Lead time | Discount |
  | --- | --- | --- |
  | Ergodesk \| UK | 5 days | 0.1 |
  | Northlight | 2 weeks |  |
  ```

Das leere Blatt, die Pfundzeichen und das Prozentzeichen fehlen, und die Summe ist der Wert, den Excel zuletzt gespeichert hat.

## Grenzen

Eine Datei darf bis zu 50 MB groß sein. Mehrere gleichzeitig abgelegte Arbeitsmappen teilen sich diese 50 MB und werden zu einem Dokument.

Die Seite nimmt nur `.xlsx` an: `.xls`, `.xlsm` und `.ods` werden abgelehnt, speichern Sie also zuerst eine Kopie als `.xlsx`. Eine hier abgelegte `.csv` geht stattdessen an den CSV-Konverter. Ein Diagrammblatt, also ein auf ein eigenes Blatt verschobenes Diagramm, lässt die Umwandlung derzeit mit einer Fehlermeldung scheitern; löschen Sie es deshalb zuerst in einer Kopie. Ein Diagramm auf einem gewöhnlichen Tabellenblatt wird einfach übersprungen.

Steht über den Spaltennamen ein Titel oder eine leere Zeile, wird diese zur Kopfzeile, und Daten, die weiter unten oder weiter rechts beginnen, behalten die leeren Zeilen und Spalten davor. Löschen Sie diese vor dem Umwandeln; leere Zeilen und Spalten nach den Daten fallen weg.

Angemeldet kann ein gespeichertes Dokument bis zu 4 MB Markdown umfassen. Wie Sie eine `.xlsx` ohne Excel öffnen, steht in [So öffnen Sie eine .xlsx-Datei](/how-to/open-xlsx), und was CSV-Export oder Kopieren und Einfügen unterwegs verlieren, in [Excel als Markdown-Tabelle: alle Wege](/blog/convert-excel-to-markdown-table).

## Fragen

### Wie kann ich Excel in Markdown umwandeln?

Legen Sie die `.xlsx` auf dieser Seite ab oder wählen Sie sie über „Dateien auswählen“ aus. Die Tabellen erscheinen auf dem Bildschirm und lassen sich kopieren oder als `.md`-Datei mit dem Namen der Arbeitsmappe herunterladen.

### Werden alle Tabellenblätter umgewandelt, auch ausgeblendete?

Ja, jedes Blatt mit einer gefüllten Zeile, in der Reihenfolge der Arbeitsmappe. Ein einzelnes Blatt lässt sich nicht auswählen; löschen Sie also die anderen in einer Kopie der Datei, wenn Sie nur eines brauchen.

### Bleiben Formeln erhalten?

Nein, nur ihre Ergebnisse: Jede Formelzelle liefert den Wert, den Excel beim letzten Speichern abgelegt hat. Eine Arbeitsmappe, die ein Skript geschrieben hat, ohne die Formeln je zu berechnen, ergibt an diesen Stellen leere Zellen.

### Lässt sich eine Markdown-Tabelle in Excel umwandeln?

Nein. Nichts hier schreibt `.xlsx` oder `.csv`; heruntergeladen wird als Markdown, HTML, reiner Text, Word, EPUB oder in den Formaten für Confluence, Jira und Slack.

### Wird die Arbeitsmappe hochgeladen?

Nein. Sie wird in Ihrem Browser entpackt und umgewandelt, und die Datei verlässt Ihren Rechner nicht. Davon wird nur dann etwas gesendet, wenn Sie angemeldet sind und auf Speichern klicken – und dann das Markdown, nicht die Arbeitsmappe.
