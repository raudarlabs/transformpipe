## Was übernommen wird

Slacks Format heißt mrkdwn, und es ist kein Markdown: Ein einzelnes Sternchen macht fett, ein Unterstrich kursiv, eine einzelne Tilde streicht durch, ein Link lautet `<address|words>`, und Überschriften oder Tabellen kennt es nicht. Wer Markdown in Slack umwandeln will, bekommt jedes Element als das Nächstliegende, was eine Nachricht hergibt:

| Im Markdown | Im mrkdwn |
| --- | --- |
| `## Heading` | `*Heading*`, eine fette Zeile für sich |
| `**bold**`, `*italic*`, `~~struck~~` | `*bold*`, `_italic_`, `~struck~` |
| `[words](https://example.com)` | `<https://example.com\|words>` |
| `![chart](https://example.com/a.png)` | `<https://example.com/a.png\|chart>` |
| Verschachtelte Aufzählungen | `•`, dann `◦`, dann `▪`, je Ebene vier Leerzeichen tiefer |
| `3. item` | `3. item`, weitergezählt ab der ersten Zahl im Markdown |
| Eine Aufgabenliste | `☑` für erledigt, `☐` für offen |
| Ein eingezäunter Codeblock | ein Codeblock, ohne Sprachangabe |
| Eine Tabelle | ein Codeblock mit aufgefüllten Spalten |
| Ein Zitat | `>` vor jeder Zeile |
| Ein Hinweisblock wie `> [!TIP]` | ein Zitat, angeführt von `:bulb:` und dem Titel in Fettdruck |
| Eine Fußnote | `[1]`, die Anmerkungen stehen am Ende |

Ein Bild mit Webadresse wird zu einem Link darauf, den Slack zum Bild aufklappt. Markierter Text wird fett. Fettdruck mitten im Wort, etwa `**un**believable`, erhält ein Leerzeichen ohne Breite neben dem Sternchen, damit Slack ihn trotzdem erkennt. Andere Hinweisblöcke beginnen mit ihrem eigenen Emoji, etwa `:warning:`.

Eine Tabelle wird in jeder Spalte auf die breiteste Zelle aufgefüllt, mit einer Linie aus `─` unter der Kopfzeile, und eine rechtsbündige Spalte bleibt rechtsbündig.

`&`, `<` und `>` werden als `&amp;`, `&lt;` und `&gt;` geschrieben, so wie es Slacks API verlangt.

## Was zurückbleibt

- **Formatierung in Überschriften, Linktexten und Tabellenzellen.** Die Worte bleiben, die Zeichen verschwinden.
- **Links auf Überschriften im Dokument** behalten ihre Worte und verlieren die Adresse, denn eine Nachricht hat keine Überschriften, zu denen man springen könnte.
- **Die Sprache eines Codeblocks**, für die Slacks Codeblöcke keinen Platz haben.
- **Tief- und Hochgestelltes**: `H~2~O` kommt als H2O an.
- **Bilder ohne Webadresse** werden zu `_[description]_` oder, ohne Beschreibung, zu `_[picture]_`; mehr dazu unter [Bilder und Links, die noch funktionieren](/blog/images-and-links-that-still-work).
- **Frontmatter** wird entfernt, **Wikilinks** behalten ihre Worte, und **rohes HTML** behält nur seinen Text.
- **Diagramme und Formeln** kommen als Quelltext an, als Code gesetzt.

## Ein Beispiel

Eine Release-Notiz in Markdown:

```markdown
## Release 4.2

Exports are **twice as fast**. Details in the [changelog](https://example.com/changes).

- Word export
  - tables keep their widths
- [ ] Update the docs

| Plan | Price |
| :--- | ---: |
| Team | 8 |
| Business | 15 |

> [!TIP]
> Restart the app to pick it up.
```

Daraus wird dieses mrkdwn:

````text
*Release 4.2*

Exports are *twice as fast*. Details in the <https://example.com/changes|changelog>.

• Word export
    ◦ tables keep their widths
☐ Update the docs

```
Plan      Price
────────  ─────
Team          8
Business     15
```

> :bulb: *Tip*
> Restart the app to pick it up.
````

## Grenzen

- Dateien mit `.md`, `.markdown`, `.mdown` und `.mkd` bis 10 MB oder eingefügtes Markdown. Mehrere zusammen abgelegte Dateien werden zu einem Dokument, und die 10 MB gelten für alle gemeinsam.
- Die Umwandlung läuft in Ihrem Browser. Hochgeladen wird nichts, solange Sie sich nicht anmelden und auf Speichern klicken; ein Konto bewahrt Dokumente bis 4 MB auf.
- Der Download ist eine Textdatei, `<name>.slack.txt`.
- Das Ergebnis ist mrkdwn als Text, kein Block-Kit-JSON.

## Fragen

### Unterstützt Slack Markdown?

Nicht im `text` einer Nachricht, den Slack als mrkdwn liest: einfache Zeichen, Links in spitzen Klammern, keine Überschriften und keine Tabellen. Markdown, das dort über die API oder einen Webhook gesendet wird, kommt deshalb mit doppelten Sternchen, Rautezeichen am Zeilenanfang und einer aus Pipes gezeichneten Tabelle an.

### Wie füge ich Markdown in Slack ein, ohne die Formatierung zu verlieren?

Wandeln Sie es hier um und klicken Sie auf „Für Slack kopieren“. In der Zwischenablage liegen dann das mrkdwn als reiner Text und das gerenderte Dokument als HTML, und Slacks Nachrichtenfeld übernimmt die formatierte Fassung. Mehr dazu in [der Anleitung zum Einfügen](/how-to/paste-markdown).

### Kann eine Slack-Nachricht eine Tabelle zeigen?

Nicht in mrkdwn, das keine kennt. Die Tabelle wird als Codeblock mit aufgefüllten Spalten geschrieben, der sich ausrichtet, weil ein Codeblock eine Schrift mit fester Breite verwendet. Formatierung in den Zellen entfällt, da ein Codeblock die Sternchen anzeigen würde, statt sie zu lesen.

### Warum steht in der Ausgabe `&amp;` statt `&`?

Slack behandelt `&`, `<` und `>` als Steuerzeichen, und seine API erwartet sie als Zeichenreferenzen. Eine Nachricht, die über die API oder einen Webhook gesendet wird, zeigt sie als die Zeichen selbst.

### Erzeugt es Block-Kit-JSON?

Nein. Es schreibt den mrkdwn-Text, der in das Feld `text` eines Aufrufs von `chat.postMessage` oder eines eingehenden Webhooks gehört, oder in einen Abschnittsblock. Das JSON darum herum schreiben Sie selbst.
