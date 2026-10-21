## Was übernommen wird

Wer hier Markdown in Word umwandelt, bekommt Words eigene Struktur: benannte Formatvorlagen, echte Nummerierung und echte Fußnoten statt Formatierung, die über den Standardtext gelegt wurde.

| Im Markdown | Im Word-Dokument |
| --- | --- |
| `#` bis `######` | Überschrift 1 bis Überschrift 6, aufgeführt im Navigationsbereich |
| Listen mit `-` und `1.`, verschachtelt | Word-Nummerierung über neun Ebenen; eine nummerierte Liste auf oberster Ebene behält ihre Startnummer |
| `- [ ]` und `- [x]` | ☐ und ☑ |
| `**bold**`, `*italic*`, `~~struck~~`, `==marked==`, `H~2~O`, `x^2^` | fett, kursiv, Durchgestrichenes, gelb markiert, tiefgestellt, hochgestellt |
| `` `code` `` und eingezäunte Codeblöcke | die Zeichenformatvorlage Inline Code; ein grau hinterlegter Code-Absatz pro Block, in Consolas |
| `>`-Zitate und Hinweisblöcke wie `[!NOTE]` | die Formatvorlage Zitat; eine Formatvorlage Note, Tip, Important, Warning oder Caution |
| eine Tabelle | Tabellenraster, die Kopfzeile fett und auf jeder Seite wiederholt, die Ausrichtung erhalten |
| `[^1]` | eine Fußnote am Seitenende, von Word nummeriert |
| Links auf Webadressen, `mailto:` und Überschriften | Hyperlinks; Links auf eine Textmarke an der Überschrift |
| Bilder | in der Datei, auf Seitenbreite verkleinert, wenn sie breiter sind, mit dem Alt-Text als Beschreibung |

Als Titel in den Dokumenteigenschaften steht die erste Überschrift, sonst der Dateiname. Die Seiten sind A4, die Schrift ist Calibri 11 pt.

## Was zurückbleibt

- **Frontmatter.** Der YAML-Block zwischen `---`-Zeilen am Anfang wird entfernt; sein `title:` wird nicht verwendet.
- **Syntaxhervorhebung, Diagramme und Formeln.** Code bleibt einfarbig. Ein `mermaid`-Block wird nicht gezeichnet; sein Quelltext bleibt stehen, unter der Beschriftung „Mermaid diagram“. `$…$` und `$$…$$` behalten ihr TeX und stehen als Code da, nicht als Word-Formeln.
- **Manche Bilder.** In die Datei kommen nur PNG, JPEG und GIF, und eines, das als `data:`-Adresse eingebettet ist, kommt immer hinein. Ein WebP oder SVG, ein Pfad auf Ihrer Festplatte oder eine Webadresse, deren Server einem Browser das Lesen verweigert, wird zur Beschreibung in eckigen Klammern – als Link oder kursiv.
- **Links ins Leere.** Ein Link auf eine andere Datei oder auf eine Überschrift, die das Dokument nicht hat, behält nur seine Wörter. Ebenso ein Wikilink wie `[[Page|text]]`.
- **Rohes HTML.** Die Tags fallen weg, die Wörter dazwischen bleiben. Ein Kommentar verschwindet ganz, ebenso ein Skript oder eine Stilangabe, die als eigener Block dasteht.
- **Seitenmobiliar.** Es werden weder Inhaltsverzeichnis noch Kopf- oder Fußzeile noch Seitenzahlen eingefügt; ein Inhaltsverzeichnis baut Word auf Wunsch aus den Überschriften. Alle Tabellenspalten sind gleich breit, und als Autor steht TransformPipe in den Eigenschaften.

## Ein Beispiel

```markdown
---
title: Release 2.4
---

# Release checklist

Before tagging, read [the build notes](#build-notes) and the
[runbook](https://example.com/runbook).[^1] The ==date== goes in
[the plan](../plans/q3.md).

1. Run the tests
2. Update `CHANGELOG.md`
   - [x] version bumped
   - [ ] date set

> [!WARNING]
> Do not tag on a Friday.

| Step  | Owner |
|:------|------:|
| Build | Ana   |

## Build notes

![Pipeline](pipeline.png)

[^1]: The runbook is internal.
```

Die .docx enthält diese Absätze, mit ihren Formatvorlagen:

```text
Heading 1       Release checklist
Normal          Before tagging, read the build notes and the runbook.¹ The date goes in the plan.
List Paragraph  1. Run the tests
List Paragraph  2. Update CHANGELOG.md
List Paragraph       ☑ version bumped
List Paragraph       ☐ date set
Warning         Warning
Warning         Do not tag on a Friday.
Table Grid      Step  | Owner
                Build |   Ana
Heading 2       Build notes
Normal          [Pipeline]
Footnote Text   ¹ The runbook is internal.
```

In einem deutschen Word heißen die eingebauten Vorlagen „Überschrift 1“, „Standard“, „Listenabsatz“, „Tabellenraster“ und „Fußnotentext“. „the build notes“ springt zur zugehörigen Überschrift. „the plan“ zeigte auf eine Datei auf der Festplatte und ist deshalb nur Text; `[Pipeline]` steht für ein Bild, das nie im Dokument war.

## Grenzen

- Dateien mit `.md`, `.markdown`, `.mdown` und `.mkd` bis 10 MB, oder eingefügtes Markdown. Mehrere gleichzeitig abgelegte Dateien teilen sich die 10 MB und werden zu einem Dokument, getrennt durch Linien.
- Die .docx entsteht in Ihrem Browser. Nichts geht an ein Konto, solange Sie sich nicht anmelden und auf Speichern drücken; ein gespeichertes Dokument darf höchstens 4 MB groß sein.
- Bilder unter Webadressen fragt Ihr Browser an, jedes höchstens zehn Sekunden lang.

## Fragen

### Wie kann ich Markdown in Word umwandeln?

Legen Sie die .md-Datei hier ab oder fügen Sie das Markdown ein, prüfen Sie die Vorschau und drücken Sie auf „.docx herunterladen“. Wie Sie das Ergebnis ohne Word öffnen, steht unter [Wie man eine .docx-Datei öffnet](/how-to/open-docx).

### Kann ich Markdown in ein vorhandenes Word-Dokument importieren?

Wandeln Sie es zuerst hier um und holen Sie die .docx dann mit Einfügen › Objekt › Text aus Datei in Word hinein. Die Überschriften kommen dort als Überschrift 1 bis 6 an.

### Ist das dasselbe wie Markdown in Word mit Pandoc?

Nein. Pandoc ist ein Programm, das Sie installieren, und übernimmt die Formatvorlagen aus einer Referenz-.docx. Hier gibt es keine Vorlage, doch Überschriften, Text, Listen, Zitate, Tabellen und Fußnoten tragen die eingebauten Namen der Word-Formatvorlagen, sodass eine in Word angewandte Hausvorlage sie alle auf einmal umgestaltet. [Markdown zu Word](/blog/markdown-to-word) vergleicht Pandoc mit Referenzdokument und die anderen Wege.

### Sollte die Quelle Markdown oder .docx sein?

Behalten Sie das Markdown als Original, wenn es in einem Repository liegt oder sich oft ändert, und schicken Sie die .docx an Leser, die in Word arbeiten. Deren Änderungen kommen nur zurück, wenn die .docx wieder umgewandelt wird. [Markdown oder Word für Dokumentation](/blog/markdown-vs-docx-for-documentation) geht die Entscheidung durch.
