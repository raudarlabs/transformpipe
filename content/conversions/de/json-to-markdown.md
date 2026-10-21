## Was übernommen wird

JSON kennt weder Überschriften noch Absätze, also entscheidet der Konverter nach der Form der Daten. Der Dateiname ohne Endung wird zur Überschrift des Dokuments: `users.json` öffnet sich als `# users`.

| In der Datei | Im Markdown |
| --- | --- |
| Ein Array von Objekten, deren Werte alle einfach sind | Eine Tabelle, eine Zeile je Objekt, die Schlüssel als Spalten |
| Ein Array einfacher Werte | Eine Aufzählung |
| Ein Objekt | Seine einfachen Felder als fette Bezeichnungen (`**Status:** shipped`), danach eine Überschrift je verschachteltem Feld (`## Customer`) |
| Ein Array gemischter oder verschachtelter Einträge | Ein nummerierter Abschnitt je Eintrag: `## 1`, `## 2` |
| Ein Objekt oder eine gemischte Liste drei Ebenen unter dem Titel | Ein eingezäunter `json`-Codeblock, sauber eingerückt |
| `null` | `_null_` – ausgeschrieben, nicht übergangen |
| Ein leeres Array oder Objekt | `_Empty list._` oder `_Empty object._` |

Die Spalten werden aus allen Datensätzen gesammelt, in der Reihenfolge ihres ersten Auftretens: Ein Feld, das nur der zehnte Datensatz hat, bekommt trotzdem eine Spalte, und die übrigen Datensätze bekommen dort eine leere Zelle. Schlüssel werden zu Wörtern: Unterstriche und Bindestriche werden zu Leerzeichen, camelCase wird getrennt und der erste Buchstabe großgeschrieben, sodass `first_name` als „First name“ und `lastLogin` als „Last Login“ erscheint.

## Was zurückbleibt

- **Die Schlüssel, wie sie geschrieben sind.** Außerhalb eines Codeblocks erscheint nur die umformulierte Fassung.
- **Die Zahlenschreibweise.** Zahlen werden als Zahlen gelesen: `42.50` wird zu `42.5`, `1e3` zu `1000`, und eine Ganzzahl mit mehr als etwa 15 Stellen kann ihre letzten Ziffern verlieren. Werte in Anführungszeichen bleiben unberührt: `"007"` bleibt `007`.
- **Die Tabelle, sobald ein Datensatz verschachtelt ist.** Enthält ein einziger Datensatz eine Liste, selbst eine leere, wird das ganze Array zu nummerierten Abschnitten. Nichts wird zu Spaltennamen mit Punkten abgeflacht.
- **Maskierung.** Zeichenketten werden unverändert geschrieben, Sternchen oder Unterstriche in einem Wert werden also als Markdown gelesen. In einer Tabelle wird eine Pipe maskiert, und ein Zeilenumbruch wird zu `<br>`.

## Ein Beispiel

Eine Benutzerliste aus einer API, gespeichert als `users.json`:

```json
[
  { "id": 1, "first_name": "Ana", "isActive": true, "lastLogin": "2026-10-01" },
  { "id": 2, "first_name": "Ben", "isActive": false, "lastLogin": null },
  { "id": 3, "first_name": "Chloé", "isActive": true, "team": "Docs | Web" }
]
```

Daraus werden die Überschrift `# users` und diese Tabelle:

```markdown
| Id | First name | Is Active | Last Login | Team |
| --- | --- | --- | --- | --- |
| 1 | Ana | true | 2026-10-01 |  |
| 2 | Ben | false | _null_ |  |
| 3 | Chloé | true |  | Docs \| Web |
```

## Grenzen

- Eine Datei darf bis zu 10 MB groß sein, und die Seite nimmt nur `.json` an; eine `.jsonl`- oder `.ndjson`-Datei muss also zuerst umbenannt werden. Sie können den Text auch einfügen.
- Die Datei wird in Ihrem Browser umgewandelt und nicht hochgeladen. Wenn Sie angemeldet sind, gelangt das Dokument erst in Ihr Konto, wenn Sie auf „Speichern“ klicken, und ein gespeichertes Dokument darf höchstens 4 MB groß sein.
- Das JSON muss streng gültig sein. Eine Datei, die sich nicht lesen lässt, wird mit „That is not valid JSON“ und der Meldung des Browsers abgelehnt, die meist die Stelle nennt.

## Fragen

### Wie kann ich JSON in eine Markdown-Tabelle umwandeln?

Ein Array von Objekten, deren Werte alle Zeichenketten, Zahlen, Wahrheitswerte oder `null` sind, wird zu einer einzigen Tabelle. Verschachtelte Datensätze sollten Sie vorher abflachen, etwa mit `jq` – oder Abschnitte statt einer Tabelle akzeptieren. [JSON zu Markdown-Tabelle](/blog/convert-json-to-markdown-table) zeigt, was sauber konvertiert und was nicht.

### Was passiert mit verschachteltem JSON?

Jedes verschachtelte Feld bekommt eine Überschrift, bis zu drei Ebenen unter dem Titel. Auf dieser Ebene wird ein Objekt oder eine gemischte Liste zu einem eingezäunten `json`-Codeblock, eine Tabelle oder einfache Liste dagegen wird weiterhin als solche dargestellt.

### Kann ich JSON mit Python in Markdown umwandeln?

Ein Python-Paket gibt es nicht; die Seite wandelt im Browser um. Mit einem Konto führt die API denselben Code aus: Schicken Sie die Datei mit einem API-Schlüssel an `POST /api/v1/documents?kind=json-to-markdown&name=users.json`, etwa mit `requests` oder einem anderen HTTP-Client, und das Ergebnis wird mit der Überschrift `# users` in Ihrem Konto gespeichert.

### Wird JSON Lines gelesen?

Ja, sobald die Datei auf `.json` endet. Lässt sich die Datei als Ganzes nicht lesen, wird jede nicht leere Zeile als eigener Wert gelesen, sodass ein Log mit einem flachen Objekt pro Zeile zur Tabelle wird. Scheitert eine Zeile, wird der Fehler des ersten Versuchs gemeldet.

### Warum heißt es, meine Datei sei kein gültiges JSON?

Die üblichen Ursachen sind ein Komma nach dem letzten Eintrag, einfache statt doppelter Anführungszeichen und Kommentare, die JSON nicht erlaubt. [Wie man eine .json-Datei öffnet](/how-to/open-json) erklärt, wie Sie den Fehler anhand der Stelle in der Meldung finden.

### Lässt sich Markdown zurück in JSON umwandeln?

Nein. Zum Herunterladen gibt es Markdown, HTML, Word, reinen Text, EPUB und Formate für Confluence, Jira und Slack; JSON gehört nicht dazu.
