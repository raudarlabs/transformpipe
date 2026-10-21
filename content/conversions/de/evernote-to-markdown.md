## Was übernommen wird

Jede Notiz der `.enex` wird zu einem Abschnitt eines einzigen Markdown-Dokuments. Es beginnt mit einer Überschrift, die den Namen der Datei trägt, und einer Liste der Notiztitel; danach folgt jede Notiz unter ihrer eigenen Überschrift, von der nächsten durch eine horizontale Linie getrennt.

| In der Notiz | Im Markdown |
| --- | --- |
| Titel | `# Titel`; eine Notiz ohne Titel heißt `# Note 3`, nach ihrer Position in der Datei |
| Erstellungsdatum und Schlagwörter | Eine kursive Zeile unter dem Titel: `*2026-09-14 · travel, 2026*` |
| Fett, kursiv, durchgestrichen, Links, Listen, Tabellen | Ihre Markdown-Form; die erste Zeile einer Tabelle wird zur Kopfzeile |
| Kontrollkästchen | Eine Aufgabenliste: `- [x]` und `- [ ]` |
| Bilder (PNG, JPEG, GIF, WebP, BMP, AVIF, TIFF) | Eingebettet, mit dem Dateinamen als Alt-Text |
| Andere Anhänge | Der Dateiname kursiv, an der Stelle des Anhangs |
| Verschlüsselter Text | Ein englischer Satz, der auf die fehlende Passphrase hinweist |

Eine Notiz verweist auf ihre Bilder nicht über deren Namen, sondern über den MD5-Hash ihrer Bytes. Der Konverter berechnet diesen Hash für jeden Anhang, und so landet jedes Bild in seiner eigenen Notiz, an der Stelle, an der es stand.

## Was zurückbleibt

- **Weitere Angaben zur Notiz.** Änderungsdatum, Autor, Quell-URL und Ort werden nicht gelesen.
- **Gestaltung.** Unterstreichungen, Textfarben, Textmarker und Schriftarten haben in Markdown keine Entsprechung. Die Wörter bleiben, die Gestaltung geht.
- **Evernotes Codeblöcke.** Sie kommen als gewöhnliche Absätze an, einer pro Zeile, nicht als eingezäunter Codeblock.
- **Die Dateien der Anhänge.** Ein PDF oder eine Sprachaufnahme behält ihren Namen in der Notiz; die Datei selbst bleibt in Evernote.
- **Links zwischen Notizen.** Sie behalten ihre `evernote:///`-Adresse, die außerhalb von Evernote nichts öffnet.
- **Leere Notizen.** Eine Notiz ohne Inhalt, Datum und Schlagwörter wird übersprungen und fehlt auch in der Liste der Titel.

## Ein Beispiel

`Travel.enex` enthält zwei Notizen: „Lisbon trip“ mit den Schlagwörtern travel und 2026, einer Zeile, die fett beginnt, zwei Kontrollkästchen (eines davon abgehakt) und einer Bordkarte als PDF-Anhang; und „Where to eat“ mit dem Schlagwort travel und einer Aufzählung. Daraus wird:

```markdown
# Travel

- Lisbon trip
- Where to eat

---

# Lisbon trip

*2026-09-14 · travel, 2026*

**Flight:** TP 1351, 07:40 from Heathrow

- [x] Book the hotel
- [ ] Renew the travel insurance

*boarding-pass.pdf*

---

# Where to eat

*2026-09-16 · travel*

Recommended by Ana:

- Cervejaria Ramiro
- Taberna da Rua das Flores
```

Wäre statt der Bordkarte ein Foto angehängt, stünde an derselben Stelle ein Bild, das seine eigenen Bytes in einer Data-URI mitbringt.

## Grenzen

- **50 MB pro Umwandlung**, gezählt über alle Dateien, die Sie gemeinsam ablegen. Mehrere `.enex`-Dateien auf einmal ergeben ein Dokument, ein Export nach dem anderen.
- **Bilder haben ein Budget**, weil sie im Dokument selbst reisen: höchstens 1 MB pro Bild in kodierter Form (etwa 750 KB auf der Festplatte) und 2 MB für alle Bilder eines Exports zusammen. Sie werden der Reihe nach übernommen; ein Bild jenseits des Budgets wird durch seinen Dateinamen in Kursivschrift ersetzt.
- **Ein Dokument, keine Datei pro Notiz.** Einen Export in einzelne Notizen aufzuteilen, ist nicht vorgesehen.
- **Gespeichert werden bis zu 4 MB Markdown.** Ein größeres Dokument bleibt auf dem Bildschirm und lässt sich weiterhin herunterladen.
- **Alles läuft in Ihrem Browser.** Ohne Anmeldung wird die Datei nicht hochgeladen. Mit Anmeldung erreicht das Dokument Ihr Konto erst, wenn Sie auf Speichern klicken.

## Fragen

### Was ist eine .enex-Datei?

Die Datei, die Evernote beim Exportieren von Notizen schreibt: eine einzige XML-Datei mit allen Notizen, der Inhalt jeder Notiz in ENML, Evernotes eingeschränktem XHTML, und die Anhänge als Base64. [Wie man eine .enex-Datei öffnet](/how-to/open-enex) zeigt, was darin steckt.

### Wie kann ich Evernote in Markdown umwandeln?

Exportieren Sie die Notizen in Evernote über Datei, Notizen exportieren, und ziehen Sie die `.enex` auf diese Seite. Das Markdown erscheint auf dem Bildschirm, und die Download-Schaltfläche speichert es als `.md`-Datei mit demselben Namen.

### Bleiben die Schlagwörter erhalten?

Ja, kursiv unter dem Titel jeder Notiz, nach dem Erstellungsdatum. Im Markdown sind sie allerdings einfacher Text und keine Schlagwörter, die eine andere App als solche erkennt.

### Bekomme ich eine Markdown-Datei pro Notiz?

Mit diesem Konverter nicht. Jede Notiz wird zu einem Abschnitt eines einzigen Dokuments, unter ihrer eigenen Überschrift, und jeder Download ist genau eine Datei.

### Was geschieht mit Bildern und Anhängen?

Bilder werden als Data-URIs eingebettet; das Dokument braucht also keinen Ordner daneben. Jeder andere Anhang schrumpft auf seinen Namen in Kursivschrift. [Wohin die Bilder gehen, wenn Sie ein Dokument exportieren](/blog/pictures-in-a-document-export) erklärt, was das Einbetten kostet.

### Was passiert mit verschlüsseltem Text?

Ohne die Passphrase lässt er sich nicht lesen, und der Konverter fragt nicht danach. An seiner Stelle steht in der Notiz der englische Satz „Encrypted text, which needs the passphrase it was written with“.
