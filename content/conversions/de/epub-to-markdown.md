## Was übernommen wird

Eine `.epub` ist ein Zip-Archiv aus XHTML-Seiten, und wer EPUB in Markdown umwandeln will, bekommt hier das ganze Buch als ein einziges Dokument: den Titel als Überschrift, den ersten Autor kursiv darunter, eine Liste der Kapitel und danach jedes Kapitel als eigenen Abschnitt unter einer Überschrift `# Kapiteltitel`, jeweils durch eine horizontale Linie getrennt.

Die Reihenfolge ist die Lesereihenfolge, die das Buch selbst in der Spine seiner Paketdatei festlegt, nicht die Reihenfolge der Dateinamen. Die Titel stammen aus dem Inhaltsverzeichnis des Buchs (dem Navigationsdokument von EPUB 3 oder der älteren `toc.ncx`). Steht ein Kapitel dort nicht, wird seine erste Überschrift `<h1>` verwendet, ersatzweise `<h2>` oder `<h3>`, dann sein `<title>`; fehlt all das, heißt es nach seiner Position „Chapter 4“, auf Englisch.

| Im Buch | Im Markdown |
| --- | --- |
| Überschriften innerhalb eines Kapitels | `##`, `###` und so weiter, auf der Ebene, die das Buch vorgibt |
| Fett, kursiv, Listen, Tabellen | `**fett**`, `*kursiv*`, Markdown-Listen und -Tabellen |
| Links auf Websites | Bleiben erhalten, mit ihrer Adresse |
| Links zwischen Kapiteln, Fußnotenzeichen | Nur ihr Text, etwa `\[1\]` |
| Bilder im Archiv | In das Dokument eingebettet |
| Die Inhaltsseite eines EPUB 3 | Entfällt, weil das Dokument eine eigene Liste schreibt |

Beginnt ein Kapitel mit seinem eigenen Titel, entfällt diese Überschrift, damit der Titel nicht zweimal erscheint. Ein Titel, der mit einer Zahl und einem Punkt beginnt, etwa „1. The Light“, oder der eckige Klammern, Unterstriche, Sternchen oder andere Zeichen enthält, die Markdown maskiert, wird nicht als Wiederholung erkannt und steht dann doppelt da.

## Was verloren geht

- **Das Titelbild.** Es ist der Umschlag und keine Seite, deshalb wird das Bild, das das Buch als Umschlag ausweist, nie eingebettet. Eine Umschlagseite, die als SVG gezeichnet ist, verschwindet mit ihm; eine Umschlagseite mit einem einfachen `<img>` hinterlässt einen kurzen Abschnitt mit einem Link auf ein Bild, das nicht vorhanden ist.
- **Die Gestaltung.** Stylesheet und eingebettete Schriften werden nicht gelesen: Schriftarten, Initialen, Farben und Unterstreichungen gehen verloren, ebenso alles, was als Inline-SVG in einer Seite steht, auch ein darin eingerahmtes Bild. Bilder, die über `<img>` eingebunden sind, SVG-Dateien eingeschlossen, kommen mit.
- **Die meisten Metadaten.** Gelesen werden nur der Titel und der erste Autor; Verlag, ISBN, Sprache und Erscheinungsdatum nicht.
- **Die Verschachtelung im Inhaltsverzeichnis.** Ein Teil mit Kapiteln darunter wird zu einer flachen Liste, mit einem Abschnitt pro Datei in der Spine; eine Seite, die nur ihren Titel enthält, entfällt.

## Ein Beispiel

*The Lighthouse Keeper* von Mary Hale ist ein Buch im Format EPUB 3 mit einem SVG-Umschlag, zwei Kapiteln, die als `index_split_030.xhtml` und `index_split_002.xhtml` gespeichert sind (und in dieser Reihenfolge gelesen werden), und einer Seite mit Anmerkungen, dazu eine Karte, ein Fußnotenzeichen, eine Tabelle und ein Link zurück zu Kapitel eins. Daraus wird Folgendes, das Base64 hier gekürzt:

```markdown
# The Lighthouse Keeper

*Mary Hale*

- The Light
- The Storm
- Notes

---

# The Light


The lamp was lit at *dusk*, as it had been for forty years.\[1\]

![Map of the headland](data:image/png;base64,iVBORw0KGgo…)

See [the register](https://example.org/lighthouses).

---

# The Storm


| Night | Wind |
| --- | --- |
| Monday | Force 9 |

Back to the first chapter.

---

# Notes

\[1\] Since 1884.
```

## Grenzen

- **50 MB pro Upload.** Mehrere gleichzeitig abgelegte Bücher werden zu einem Dokument verkettet, und die Grenze gilt für ihre Summe.
- **Bilder teilen sich ein Kontingent.** Jedes Bild wird nur eingebettet, wenn es kleiner als etwa 750 KB ist, und die Bilder eines Buchs haben zusammen etwa 1,5 MB, die in Lesereihenfolge verbraucht werden. Darüber hinaus behält ein Bild seinen Pfad im Archiv, der außerhalb davon nichts anzeigt.
- **Die Umwandlung läuft in Ihrem Browser.** Das Buch wird nicht hochgeladen. Das Markdown gelangt nur dann in ein Konto, wenn Sie sich anmelden und auf Speichern klicken; ein gespeichertes Dokument darf bis zu 4 MB groß sein.
- **Nur `.epub`.** Eine Kindle-Datei im Format `.mobi` oder `.azw3` wird abgelehnt.

## Häufige Fragen

### Wie öffne ich eine EPUB-Datei?

Zum Lesen eignet sich eine Lese-App wie Apple Books oder Calibre; [Wie man eine .epub-Datei öffnet](/how-to/open-epub) stellt die Möglichkeiten vor. Wenn Sie den Text herausholen möchten, wandeln Sie die Datei hier um: Das Buch erscheint als eine Seite, die Sie im Browser lesen, kopieren oder als `.md` herunterladen können.

### Stimmt die Reihenfolge der Kapitel?

Ja. Die Reihenfolge kommt aus der Spine, der einzigen Stelle, an der ein EPUB sie festlegt, und die Dateinamen werden ignoriert. [EPUB in Markdown umwandeln](/blog/convert-epub-to-markdown) erklärt, warum man sich auf die Namen nicht verlassen kann.

### Was passiert mit Fußnoten?

Das Fußnotenzeichen behält seinen Text, `[1]`, verweist aber nirgendwohin mehr, und die Anmerkung bleibt dort, wo das Buch sie hatte, meist in einem Anmerkungskapitel am Ende. In Markdown-Fußnoten der Form `[^1]` werden sie nicht umgewandelt.

### Lässt sich ein Kindle-Buch oder ein Buch mit DRM umwandeln?

Nein. Angenommen werden nur `.epub`-Dateien, und hier wird kein Kapitel entschlüsselt. Die Kapitel eines geschützten Buchs kommen daher als unlesbarer Zeichensalat heraus.

### Kann ich jedes Kapitel als eigene Datei bekommen?

Nein. Ein Buch wird immer zu einem einzigen Dokument, aber jedes Kapitel beginnt nach einer horizontalen Linie mit seiner eigenen Überschrift `# `, sodass es sich leicht von Hand aufteilen lässt.
