## Was übernommen wird

Laden Sie die .zip hoch, die Notion beim Export im Format „Markdown & CSV“ erzeugt. Jede nicht leere `.md`-Datei darin wird zu einer Seite, jede `.csv` zu einer Tabelle, gleich wie tief sie in den Ordnern liegt.

| Im Export | Im Markdown |
| --- | --- |
| `Project plan 0f1e…e1f0.md` | Eine Seite mit dem Titel „Project plan“, ohne die ID |
| Die eigene Zeile `# Project plan` der Seite | Eine Titelüberschrift statt zwei |
| Ein Ordner mit Unterseiten | Ein Ordner gleichen Namens, die übergeordnete Seite zuerst |
| Eine Datenbank, `Tasks 9f8e…b1a0.csv` | Eine Tabelle unter „Tasks“, die erste Zeile als Kopfzeile |
| Ein Bild im Ordner der Seite | In die Seite eingebettet |

Überschriften, Listen, To-dos, Zitate, Code, Betonung, Links auf Websites und HTML wie ein `<aside>`-Block bleiben so, wie Notion sie geschrieben hat. In einer Datenbanktabelle wird ein Zeilenumbruch innerhalb einer Zelle zu `<br>`.

Standardmäßig wird der Export **zu einem Ordner mit Seiten**: ein Dokument je Seite, in den Ordnern des Exports. Mit der Option **Einem Dokument** unter der Ablagefläche entsteht stattdessen eine einzige Datei: ein Inhaltsverzeichnis, dann jede Seite unter ihrer Überschrift, getrennt durch waagerechte Linien, die Datenbanken am Schluss.

Ein Bild wird über seinen relativen Pfad gefunden, sonst über seinen Dateinamen irgendwo im Archiv, und als `data:`-Adresse in die Seite geschrieben.

## Was zurückbleibt

- **Wohin Links zwischen Seiten zeigen.** Notion verknüpft Seiten über ihre exportierten Dateinamen, und sobald die Seiten Dokumente sind, liegt unter diesen Namen nichts mehr. Ein solcher Link behält seinen Text und verliert seine Adresse, in beiden Modi; ebenso ein Link auf die `.csv` einer Datenbank.
- **Die IDs**, aus Titeln und Ordnernamen. Liegt alles in Notions Ordner `Export-…`, trägt der Ordner des Imports stattdessen den Namen Ihrer .zip.
- **Andere Dateien.** PDFs und sonstige Anhänge werden nicht gelesen, und eine .zip innerhalb der .zip wird nicht geöffnet.
- **Bilder jenseits des Kontingents.** Sie behalten ihre alte Adresse, statt eingebettet zu werden.

## Ein Beispiel

Ein Notion-Export enthält eine Seite namens Project plan und in deren Ordner ein Bild, eine Datenbank Tasks und eine Unterseite Meeting notes mit einer kurzen Liste. Das Markdown der Seite lautet:

```markdown
# Project plan

Launch is planned for **March**. Notes from the kick-off are in [Meeting notes](Project%20plan%200f1e2d3c4b5a69788796a5b4c3d2e1f0/Meeting%20notes%20a1b2c3d4e5f60718293a4b5c6d7e8f90.md); wording follows the [style guide](https://example.com/style).

![Timeline](Project%20plan%200f1e2d3c4b5a69788796a5b4c3d2e1f0/timeline.png)
```

Mit der Wahl **Einem Dokument** wird daraus (das Base64 des Bildes gekürzt):

```markdown
# Contents

- Project plan
- Meeting notes
- Tasks

---

# Project plan


Launch is planned for **March**. Notes from the kick-off are in Meeting notes; wording follows the [style guide](https://example.com/style).

![Timeline](data:image/png;base64,iVBORw0KGgo…)

---

# Meeting notes


- Scope agreed
- [ ] Book the room

---

# Tasks

| Name | Status | Owner |
| --- | --- | --- |
| Draft brief | Done | Ana |
| Review, round 2 | In progress | Tom |
```

Als **Ordner mit Seiten** enthält der Import einen Ordner Project plan mit drei Dokumenten in dieser Reihenfolge: Project plan, Meeting notes, Tasks.

## Grenzen

- **250 MB je .zip**, verarbeitet in Ihrem Browser. Ohne Anmeldung wird nichts hochgeladen; angemeldet gelangt nichts in Ihr Konto, bevor Sie speichern.
- **Bilder teilen sich ein Kontingent**: 2 MB kodiert in einem Dokument, rund 4 MB abzüglich des Textes je Seite eines Ordners, 1 MB (etwa 750 KB auf der Festplatte) pro Bild. Ein PNG, JPEG, WebP oder BMP über 120 KB wird vorher neu gezeichnet, mit höchstens 1.600 Pixeln an der langen Seite, und nur übernommen, wenn es dadurch kleiner wird.
- **4 MB je gespeichertem Dokument.** Eine größere Seite wird beim Speichern des Ordners genannt und ausgelassen; ein größeres Einzeldokument lässt sich trotzdem herunterladen.
- **Reihenfolge nach Pfad**: alphabetisch, „Page 2“ vor „Page 10“.

## Fragen

### Wie wandle ich Notion in Markdown um?

Exportieren Sie die Seite oder den Workspace in Notion im Format „Markdown & CSV“ und laden Sie die .zip hier hoch. Die Seiten erscheinen unter ihren Titeln, Datenbanken als Tabellen.

### Was bedeuten die 32 Zeichen langen Codes in den Dateinamen?

Jeder ist die ID einer Seite in Notion, angehängt an ihre Datei- und Ordnernamen und in jedem Link auf sie verwendet. Die Umwandlung entfernt sie; [Wie man eine Export-.zip öffnet](/how-to/open-zip) erklärt, warum Umbenennen von Hand die Links zerstört.

### Sollte ich die Unterseiten mit exportieren?

Ja, wenn Sie die Seiten unter der exportierten Seite brauchen: Umgewandelt wird nur, was in der .zip steckt. Ist auch „Create folders for subpages“ eingeschaltet, werden eine Seite und ihre Unterseiten hier zu einem Ordner, die Seite zuerst.

### Funktionieren die Links zwischen den Seiten noch?

Nein: Ihr Text bleibt, ihre Adresse geht verloren. Wie man getrennte Dateien erhält, die weiterhin aufeinander verweisen, beschreibt [Einen Notion-Export umwandeln](/blog/convert-notion-export-to-markdown).

### Ist das dasselbe wie notion-to-md?

Nein. notion-to-md ist ein Node-Paket, das Seiten mit einem Integrations-Token über die API von Notion liest; diese Seite liest die exportierte .zip und verbindet sich nie mit Ihrem Workspace.

### Kann ich einen Notion-Export nach Obsidian übernehmen?

Teilweise. Wählen Sie beim **Ordner mit Seiten** erst **.zip herunterladen**, dann **Für Obsidian**: dieselben Ordner, eine `.md`-Datei je Seite, Überschriften-Links in Obsidians Schreibweise. Links zwischen Seiten kommen als reiner Text an.
