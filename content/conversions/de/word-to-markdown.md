## Was übernommen wird

Wer Word in Markdown umwandelt, bekommt die Struktur des Dokuments, nicht sein Layout: Eine `.docx` wird danach gelesen, was jeder Teil ist, und nicht danach, wie er auf der Seite aussieht.

| In der Word-Datei | Im Markdown |
| --- | --- |
| Überschrift 1 bis Überschrift 6 | `#` bis `######` |
| Fett, kursiv, Durchgestrichenes | `**bold**`, `*italic*`, `~~struck~~` |
| Aufzählungen und nummerierte Listen | Listen mit `-` und `1.`, zwei Leerzeichen Einzug je Ebene |
| Angekreuzte und leere Kontrollkästchen in einer Liste | `- [x]` und `- [ ]` |
| Eine Tabelle | Eine Markdown-Tabelle, die erste Zeile als Kopfzeile |
| Ein Hyperlink | Ein Link auf dieselbe Adresse |
| Ein Bild | Im Dokument eingebettet, mit seinem Alt-Text |
| Fußnoten und Endnoten | Eine nummerierte Liste am Ende, `[1]` im Text |
| Ein Zeilenumbruch (Umschalt+Eingabe) | Eine Zeile, die auf zwei Leerzeichen endet |
| Ein Textfeld | Sein Text, hinter dem Absatz, an dem es verankert war |

Aus `report.docx` wird `report.md`. Ein Sternchen oder Unterstrich im Text wird maskiert, damit es ein Zeichen bleibt und nicht zur Betonung wird.

## Was zurückbleibt

- **Formatvorlagen, die keine Überschriften sind.** Titel, Untertitel, Zitat, Überschrift 7 bis 9 und eigene Formatvorlagen werden zu gewöhnlichen Absätzen.
- **Das Aussehen.** Schriftarten, Größen, Farben, Textmarker und Unterstreichungen. Hoch- und Tiefstellung gehen verloren, aus H₂O wird H2O, und eine Schrift mit fester Zeichenbreite macht noch keinen Code.
- **Kommentare,** ohne eine Spur an der Stelle, an der sie standen.
- **Seitenmobiliar.** Kopf- und Fußzeilen, Seitenzahlen und Seitenumbrüche.
- **Formeln.** Alles aus dem Formel-Editor verschwindet, und der Satz schließt sich um die Lücke.
- **Verbundene Zellen.** Eine verbundene Zelle wird einmal geschrieben, und die Zellen danach rücken nach links in den Platz, den sie überdeckt hat. Zwei Absätze in einer Zelle laufen ohne Leerzeichen ineinander.
- **Funktionierende Fußnoten.** Die Links `[1]` und `↑` zeigen auf Anker, die es im Markdown nicht gibt; es sind keine Markdown-Fußnoten mit `[^1]`.
- **Ein funktionierendes Inhaltsverzeichnis.** Seine Einträge kommen als Links mit Seitenzahlen an, die auf Textmarken zeigen, die es nicht mehr gibt.

## Ein Beispiel

Eine `.docx` mit einer Zeile in der Formatvorlage Titel, einer Überschrift 1, einem Absatz mit einem fetten und einem kursiven Wort, einer Fußnote und einem Link, einer verschachtelten Liste, einer Tabelle und einem Foto wird zu diesem Markdown, das Base64 des Bildes gekürzt:

```markdown
Roof survey

# Findings

The north gutter is **blocked** and two tiles are *cracked*.[\[1\]](#footnote-1) Prices are on the [supplier’s page](https://example.com/tiles).

- Clear the gutter
  - North side only
- Replace two tiles

| Job | Cost |
| --- | --- |
| Gutter | £80 |
| Tiles | £240 |

![The blocked north gutter](data:image/png;base64,iVBORw0KGgo…)

1. Seen from the scaffold on 3 March. [↑](#footnote-ref-1)
```

„Roof survey“ bleibt ein gewöhnlicher Absatz, weil die Zeile die Formatvorlage Titel hatte.

## Grenzen

- Nur `.docx`, bis 50 MB. Mehrere gleichzeitig abgelegte Dateien zählen zusammen und werden zu einem Dokument, getrennt durch Linien.
- Die Datei wird in Ihrem Browser gelesen, nicht hochgeladen. Nichts geht an ein Konto, solange Sie sich nicht anmelden und auf Speichern klicken; ein gespeichertes Dokument darf höchstens 4 MB groß sein.
- Bilder reisen im Markdown mit: etwa 1 MB je Bild in kodierter Form (eine Datei von rund 750 KB) und 2 MB insgesamt je `.docx`. Ein Bild, das nicht mehr passt, wird zu seinem Alt-Text in Kursivschrift oder verschwindet, wenn es keinen hatte.
- Listen unter einem nummerierten Punkt werden um zwei Leerzeichen eingerückt, und das reicht Markdown nicht: In der Darstellung stehen die Unterpunkte nicht mehr in ihrem Punkt. Unter Aufzählungszeichen funktioniert die Verschachtelung.
- Eine kennwortgeschützte `.docx` lässt sich nicht lesen; entfernen Sie das Kennwort zuerst in Word.

## Fragen

### Wie wandle ich ein Word-Dokument (.docx) in Markdown (.md) um?

Legen Sie die `.docx` hier ab, prüfen Sie die Vorschau und klicken Sie auf „.md herunterladen“. [DOCX in Markdown umwandeln](/blog/convert-docx-to-markdown) vergleicht diesen Weg mit Pandoc und mit mammoth im eigenen Code.

### Lässt sich eine alte .doc-Datei umwandeln?

Nein, nur `.docx`. Speichern Sie eine `.doc` zuerst in Word oder LibreOffice als `.docx`; [wie man eine .docx-Datei öffnet](/how-to/open-docx) erklärt auch den Fall einer `.doc` mit falscher Endung.

### Lässt sich ein Google-Docs-Dokument umwandeln?

Ja, auf dem Umweg über das Word-Format. Wählen Sie in Google Docs Datei, Herunterladen, Microsoft Word, und legen Sie die `.docx` dann hier ab.

### Warum ist mein Titel keine Überschrift geworden?

Die Formatvorlage Titel gehört in Word nicht zu den Überschriften. Weisen Sie der Zeile vor dem Umwandeln Überschrift 1 zu, oder setzen Sie danach `# ` davor.

### Was passiert mit Kommentaren und verfolgten Änderungen?

Kommentare fallen weg. Verfolgte Änderungen kommen heraus, als wären sie alle angenommen: Eingefügtes bleibt und Gelöschtes ist fort, aber Text, der bei aktiver Nachverfolgung verschoben wurde, fehlt an beiden Stellen. Nehmen Sie vor dem Umwandeln jede Änderung in Word an oder lehnen Sie sie ab.

### Welche Formatierung lohnt es sich zu behalten?

Weniger, als es scheint. [Was von einer .docx nicht bleibt](/blog/what-not-to-keep-from-a-docx) geht durch, was Markdown nicht ausdrücken kann und welche Verluste wirklich zählen.
