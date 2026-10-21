## Was übernommen wird

Packen Sie den Vault-Ordner oder die Ausgabe eines Export-Plugins als .zip und laden Sie diese hoch. Jede nicht leere `.md`-Datei wird zu einer Notiz, in dem Ordner, in dem sie lag.

| Im Vault | Im Markdown |
| --- | --- |
| `Projects/Website.md` | Eine Notiz „Website“ in einem Ordner Projects |
| Eigenschaften, der `---`-Block ganz oben | Entfernt |
| `[[Pricing]]`, `[[Pricing#Plans]]` | `Pricing` |
| `[[Pricing\|the plan list]]` | `the plan list` |
| `![[sketch.png]]` | Eingebettet, über den Namen irgendwo in der .zip gefunden |
| `![[brief.pdf]]` | `*brief.pdf*` |

Der Titel einer Notiz ist ihr Dateiname, gesetzt als Überschrift erster Ebene; eine Überschrift gleich am Anfang, die ihn nur wiederholt, entfällt.

Überschriften, Listen, Aufgaben, Tabellen, Code, Formeln, `==Markierungen==` und Callouts bleiben, wie sie geschrieben sind; die Vorschau zeigt `> [!warning]` als Warnkasten. Wikilinks in Code bleiben unberührt.

Standardmäßig wird der Vault **zu einem Ordner mit Seiten** in seinen eigenen Ordnern, und eine Ordnernotiz, `Projects.md` neben `Projects/`, steht als erstes Dokument in ihrem Ordner. Mit der Option **Einem Dokument** unter der Ablagefläche entsteht eine einzige Datei: ein Inhaltsverzeichnis, dann jede Notiz unter ihrer Überschrift, getrennt durch waagerechte Linien.

## Was zurückbleibt

- **Wohin Wikilinks zeigen.** Ohne Vault bleibt nur der Text. Ein Link innerhalb derselben Notiz, `[[#Tasks]]`, bleibt, wie er ist.
- **Eingebettete Notizen.** `![[Pricing]]` ergibt den Namen, nicht den Text von Pricing.
- **Andere Anhänge.** Ein eingebettetes PDF, MP3, WAV, MP4 oder MOV wird zu seinem Dateinamen in Kursivschrift.
- **Einbettungen mit Ordnerangabe.** Gesucht wird nur ein reiner Dateiname, daher wird `![[assets/plan.png]]` zu `*assets/plan.png*`, auch wenn die Datei in der .zip liegt.
- **Einbettungen mit einem Leerzeichen im Namen**, etwa Obsidians eigene `Pasted image …`-Dateien: Sie erscheinen als Text.
- **Markdown-Links zwischen Notizen** bleiben, wie sie geschrieben sind.
- **Canvas-Dateien, Einstellungen und Plugin-Daten.** Gelesen werden nur Notizen und Bilder.

Block-IDs wie `^a1b2c3` und `%%Kommentare%%` bleiben sichtbar im Text.

## Ein Beispiel

Der Ordner My vault, gezippt, enthält `Pricing.md`, `attachments/sketch.png` und diese Notiz, `Projects/Website.md`:

```markdown
---
tags: [work]
status: active
---
# Website

Ship the new pricing page: see [[Pricing#Plans|the plan list]] and [[Roadmap]].

![[sketch.png]]
![[brief.pdf]]

> [!warning] Deadline
> Friday, not Monday.
```

Als **Ordner mit Seiten** ist der Import ein Ordner My vault mit Pricing und einem Ordner Projects, der dieses Dokument enthält (Base64 gekürzt):

```markdown
# Website


Ship the new pricing page: see the plan list and Roadmap.

![sketch.png](data:image/png;base64,iVBORw0KGgo…)
*brief.pdf*

> [!warning] Deadline
> Friday, not Monday.
```

## Grenzen

- **250 MB je .zip**, verarbeitet in Ihrem Browser. Ohne Anmeldung wird nichts hochgeladen; angemeldet gelangt nichts in Ihr Konto, bevor Sie speichern.
- **Bilder teilen sich ein Kontingent**: 2 MB kodiert in einem Dokument, rund 4 MB abzüglich des Textes je Notiz eines Ordners, 1 MB (etwa 750 KB auf der Festplatte) pro Bild. Ein PNG, JPEG, WebP oder BMP über 120 KB wird vorher neu gezeichnet, mit höchstens 1.600 Pixeln an der langen Seite, und nur übernommen, wenn es dadurch kleiner wird. Ein Bild, das trotzdem nicht passt, behält seinen Link.
- **4 MB je gespeichertem Dokument.** Eine größere Notiz wird beim Speichern des Ordners genannt und ausgelassen.
- **Jede `.md`-Datei wird gelesen**, auch in versteckten Ordnern wie `.trash`. Nehmen Sie vor dem Zippen heraus, was Sie nicht brauchen.
- **Keine Größenangaben.** In `![[sketch.png|300]]` wird die 300 zum Alt-Text des Bildes.

## Fragen

### Wie exportiere ich einen Obsidian-Vault als Markdown?

Ein Vault ist bereits ein Ordner voller `.md`-Dateien, es gibt also nichts zu exportieren: Zippen Sie den Vault-Ordner und laden Sie ihn hoch.

### Was passiert mit Wikilinks?

Ein Link auf eine Notiz wird zu seinem Text: zu dem nach dem senkrechten Strich, falls vorhanden, sonst zum Namen der Notiz. Die Überschrift oder der Block, auf den er zeigte, entfällt mit der Adresse.

### Bleiben meine Bilder erhalten?

Ja, wenn die Datei in der .zip liegt, ins Kontingent passt und, falls eingebettet, kein Leerzeichen im Namen hat. Eine Einbettung wird über den Namen gefunden, ein Markdown-Bild über seinen Pfad, dann über den Namen. [Einen Obsidian-Vault umwandeln](/blog/convert-obsidian-vault-to-markdown) behandelt den Rest von Obsidians Syntax.

### Bleiben Eigenschaften und Tags erhalten?

Als Eigenschaften nicht: Der `---`-Block wird entfernt, samt Tags und Aliasen, weil seine Schlüssel nur innerhalb des Vaults etwas bedeuten. Ein `#tag` im Text bleibt stehen. [Was Konverter mit Frontmatter machen](/blog/front-matter-and-what-converters-do-with-it) erklärt die Entscheidung.

### Kann ich Notizen von Obsidian nach Confluence übertragen?

Nicht direkt: Von hier aus wird nichts in Confluence veröffentlicht. Wandeln Sie den Vault mit der Option **Einem Dokument** um und wählen Sie dann im Menü neben der Download-Schaltfläche „Confluence storage format“.

### Ist das ein allgemeiner Konverter für Obsidian-Formate?

Er liest einen Vault, macht aus Wikilinks reinen Text und entfernt die Eigenschaften; mit der Option **Einem Dokument** bietet dasselbe Menü außerdem HTML, reinen Text, Word, EPUB, Jira- und Slack-Markup sowie **Drucken oder als PDF speichern**. Von Obsidians eigener Syntax schreibt er nur Überschriften-Links, im Download „Markdown for Obsidian“.
