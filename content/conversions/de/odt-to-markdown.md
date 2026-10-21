## Was übernommen wird

Eine `.odt` sagt selbst, was jeder ihrer Teile ist. Wer ODT in Markdown umwandelt, bekommt deshalb die Struktur so, wie sie geschrieben wurde, ohne dass etwas erraten werden muss.

| In der OpenDocument-Datei | Im Markdown |
| --- | --- |
| Überschriften und Absatzvorlagen, die auf einer beruhen | `#` bis `######`, tiefere Ebenen als `######` |
| Fett, kursiv, Durchgestrichenes an einzelnen Wörtern | `**bold**`, `*italic*`, `~~struck~~` |
| Aufzählungen und nummerierte Listen | Listen mit `-` und `1.`, zwei Leerzeichen Einzug je Ebene |
| Eine Tabelle | Eine Markdown-Tabelle, die erste Zeile mit Text als Kopfzeile |
| Verbundene Zellen | Der Text einmal, dann leere Zellen, sodass die Spalten in der Flucht bleiben |
| Fußnoten und Endnoten | `[^1]` im Text, die Anmerkungen am Ende, in einer gemeinsamen Zählung |
| Ein Hyperlink | Ein Link auf dieselbe Adresse |
| Ein Bild | Im Dokument eingebettet, mit seinem Titel (nicht seiner Beschreibung) als Alt-Text |
| Ein Zeilenumbruch (Umschalt+Eingabe) | Eine Zeile, die auf einen Backslash endet |

Jeder nummerierte Punkt wird als `1.` geschrieben; eine Liste, die bei 5 begann, beginnt deshalb bei 1. Beginnt das Dokument nicht mit einer Überschrift 1, wird oben eine ergänzt: der Titel aus Datei, Eigenschaften, sonst der Dateiname.

## Was zurückbleibt

- **Das Aussehen.** Unterstreichung, Hoch- und Tiefstellung, Farben, Schriftarten und Größen. Auch Fett oder Kursiv, das zur Absatzvorlage gehört statt zu Wörtern im Absatz, geht verloren.
- **Vorlagen, die keine Überschriften sind.** Titel, Untertitel, Zitat und Vorformatierter Text werden zu gewöhnlichen Absätzen.
- **Kopf- und Fußzeilen** samt Seitenzahlen: Gelesen wird nur der Textkörper.
- **Rahmen.** Text in einem Rahmen fällt weg, es sei denn, der Rahmen ist an der Seite verankert; der Text eines Textfelds läuft in den Satz hinein, der es umgibt.

## Ein Beispiel

Eine `.odt`, die mit einer Überschrift 1 beginnt, gefolgt von einem Absatz mit einem fetten und einem kursiven Wort, einer Fußnote und einem Link, einer verschachtelten Liste, einer Tabelle und einem Foto mit Titel, wird zu diesem Markdown, das Base64 des Bildes gekürzt:

```markdown
# Findings

The north gutter is **blocked** and two tiles are *cracked*.[^1] Prices are on the [supplier’s page](https://example.com/tiles).

- Clear the gutter
  - North side only
- Replace two tiles

| Job | Cost |
| --- | --- |
| Gutter | £80 |
| Tiles | £240 |

![The blocked north gutter](data:image/png;base64,iVBORw0KGgo…)

[^1]: Seen from the scaffold on 3 March.
```

Hätte `roof-survey.odt` stattdessen mit einer Zeile in der Vorlage Titel begonnen, bliebe diese Zeile ein gewöhnlicher Absatz, und darüber stünde `# roof-survey`.

## Grenzen

- Nur `.odt`, bis 50 MB; keine `.ods`, `.odp` oder flachen `.fodt`. Mehrere gleichzeitig abgelegte Dateien zählen zusammen und werden zu einem Dokument.
- Die Datei wird in Ihrem Browser gelesen, nicht hochgeladen. Nichts geht an ein Konto, solange Sie sich nicht anmelden und auf Speichern klicken; ein gespeichertes Dokument darf höchstens 4 MB groß sein.
- Bilder reisen im Markdown mit, etwa 1 MB je Bild in kodierter Form und 2 MB je Datei. Ein Bild, das nicht mehr passt oder als WMF oder EMF vorliegt, behält seinen Pfad innerhalb der `.odt` und kommt als defektes Bild an.
- **Kommentare laufen in den Text:** Autor, Datum und Kommentar landen mitten in dem Satz, an dem sie hingen. Löschen Sie sie vor dem Umwandeln.
- **Aufgezeichnete Änderungen** setzen Namen und Datum jeder Änderung sowie jede gelöschte Passage an den Anfang des Dokuments. Nehmen Sie in Writer vorher alle an oder lehnen Sie sie ab.
- **Ein Inhaltsverzeichnis** kommt mit doppelter Überschrift an, danach folgen die Einträge als Links mit Seitenzahlen.
- Listen unter einem nummerierten Punkt fallen in der Darstellung aus diesem Punkt heraus: Zwei Leerzeichen sind unter `1.` zu wenig Einzug.
- Eine kennwortgeschützte `.odt` lässt sich nicht lesen; speichern Sie eine Kopie ohne Kennwort.

## Fragen

### Wie öffne ich eine ODT-Datei?

LibreOffice Writer öffnet sie kostenlos auf jedem Desktop-System, Word und Google Docs ebenfalls. Wer nichts installieren möchte, legt sie hier ab und liest die Vorschau; [wie man eine .odt-Datei öffnet](/how-to/open-odt) zeigt die übrigen Wege.

### Wie wandle ich ODT in Markdown um?

Legen Sie die `.odt` hier ab, prüfen Sie die Vorschau und klicken Sie auf „.md herunterladen“. Die Datei behält ihren Namen, aus `notes.odt` wird also `notes.md`, und „Markdown kopieren“ legt den Text stattdessen in die Zwischenablage.

### Bleiben die Fußnoten erhalten?

Ja, als Markdown-Fußnoten, die die Vorschau hier als nummerierte Anmerkungen darstellt. Nicht jedes Markdown-Werkzeug zeigt sie an: [Markdown-Fußnoten](/blog/markdown-footnotes-support) sagt, welche es tun.

### Warum steht mein Dateiname oben als Überschrift?

Das Dokument begann nicht mit einer Überschrift 1, oder aufgezeichnete Änderungen standen davor. Tragen Sie unter Datei, Eigenschaften einen Titel ein, dann steht dieser oben, oder beginnen Sie mit einer Überschrift 1, dann wird nichts ergänzt.

### Lassen sich .ods- oder .odp-Dateien umwandeln?

Nein, nur Textdokumente. Speichern Sie eine Tabelle in LibreOffice Calc als `.xlsx` und nutzen Sie „Excel in eine Markdown-Tabelle“, oder eine Präsentation in Impress als `.pptx` und nutzen Sie „PowerPoint in Markdown“.
