---
title: "Wohin die Bilder gehen, wenn Sie ein Dokument exportieren"
description: "Jeder Export legt seine Bilder irgendwo ab, und die meisten Umwandlungen lassen sie dort — wo jedes Format sie hält, die drei Auswege und die Rechnung des Einbettens"
date: 2026-09-21
tag: Konvertieren
keywords: markdown bilder fehlen, dokument konvertieren bilder behalten, notion export bilder, docx bilder markdown, base64 bild markdown, dokument mit bildern exportieren
---

Der Export hat funktioniert. Die Überschriften stimmen, die Listen stimmen, die Tabellen sind durchgekommen — und jedes Bild ist ein graues Rechteck mit umgeknickter Ecke. Das ist die mit Abstand häufigste Art, wie eine Dokumentumwandlung enttäuscht, und fast nie heißt es, dass der Konverter die Bilder nicht gefunden hätte. Er hat sie gefunden, für das Problem eines anderen erklärt und einen Verweis auf eine Datei geschrieben, von der er wusste, dass Sie sie nicht haben.

### Kurz gefasst

Ein Bild ist in jedem Dokumentformat eine eigene Datei im Container, und das Dokument verweist über einen Pfad darauf. Markdown ist eine einzige Textdatei, also gibt es genau drei Orte, an denen ein Bild landen kann: ein Ordner neben dem Markdown, eine Adresse irgendwo im Netz oder das Markdown selbst, als `data:`-URI. Die meisten Konverter wählen versehentlich eine vierte Möglichkeit — einen Pfad auf den Ordner, den es gäbe, wenn sie die Dateien geschrieben hätten — und das ist das graue Rechteck. Einbetten ist von den dreien das einzige, was einen E-Mail-Versand übersteht, und es kostet rund ein Drittel mehr Bytes als die Datei auf der Festplatte, weil base64 drei Bytes als vier Zeichen schreibt.

Die praktische Regel: Suchen Sie nach jeder Umwandlung im Ergebnis nach `src="` und `](` und sehen Sie sich an, was die Pfade tatsächlich sagen. Das dauert zehn Sekunden und verrät, welche der vier Möglichkeiten Sie bekommen haben.

## Wo jedes Format seine Bilder hält

| Quelle | Wo die Bytes liegen | Wie das Dokument darauf verweist |
| --- | --- | --- |
| `.docx` | `word/media/image1.png` im ZIP | Eine Beziehungs-Id, aufgelöst über `word/_rels/document.xml.rels` |
| `.pptx` | `ppt/media/image1.png` | Derselbe Mechanismus, je Folie |
| `.odt` | `Pictures/10000201000...png` | `xlink:href` an einem `<draw:image>` |
| `.epub` | Wo das Manifest sagt, meist `OEBPS/images/` | Ein relativer Pfad aus dem XHTML des Kapitels |
| Notion-Export | Ein Ordner mit dem Seitennamen und der 32-stelligen Id | Ein URL-kodierter relativer Pfad, `%20` für jedes Leerzeichen |
| Confluence-HTML-Export | `attachments/<Seiten-Id>/<Datei>` | Ein relatives `src` aus dem HTML der Seite |
| Obsidian-Vault | Wo Sie sie hingelegt haben, oft `assets/` | `![[bild.png]]`, gegen den ganzen Vault aufgelöst |
| Evernote `.enex` | Base64 im XML der Notiz | `<en-media hash="…">`, die MD5 der dekodierten Bytes |
| Google Docs | Nicht im `.docx`-Export, bis Sie einen erzeugen | Beim HTML-Export ins ZIP heruntergeladen |

Zwei dieser Zeilen verdienen einen zweiten Blick, weil dort Umwandlungen auf schwer diagnostizierbare Weise scheitern.

**Notion** schreibt URL-kodierte Pfade. Aus einer Seite namens `Q3 Plan` wird ein Ordner `Q3 Plan 1f2a…`, und das Markdown verweist auf `Q3%20Plan%201f2a…/chart.png`. Ein Konverter, der den Pfad nicht dekodiert, sucht ein Verzeichnis mit einem buchstäblichen `%20` im Namen, findet nichts und gibt den Verweis unverändert aus. [Einen Notion-Export umwandeln](/blog/convert-notion-export-to-markdown) geht durch, was diese Ids sonst noch anrichten.

**Evernote** speichert überhaupt keinen Dateinamen. Ein Bild wird über die MD5-Prüfsumme seiner eigenen Bytes adressiert, und die Ressource mit diesen Bytes steht anderswo in derselben Datei, base64-kodiert. Sie einander zuzuordnen heißt, über jede dekodierte Ressource MD5 zu rechnen — weshalb eine Umwandlung das entweder richtig macht oder jedes Bild der Notiz fallen lässt. Ein Dazwischen gibt es nicht.

## Die drei Orte, an die ein Bild gehen kann

| Ziel | Übersteht E-Mail | Übersteht einen Ordnerumzug | Übersteht das Verschwinden der Quelle | Kosten |
| --- | --- | --- | --- | --- |
| Ein Ordner neben dem Markdown | Nein — eine Datei kommt an, die andere nicht | Nein | Ja | Keine |
| Eine öffentliche Adresse | Ja | Ja | Nein — Linkfäule, und der Hoster sieht, wer hinsieht | Für Sie keine |
| Ein `data:`-URI in der Datei | Ja | Ja | Ja | Etwa 4 Byte Text je 3 Byte Bild |

Der Ordner ist die Voreinstellung fast jedes Kommandozeilenwerkzeugs und die richtige Antwort, wenn das Markdown in ein Repository geht: Der Ordner reist mit, git verfolgt beides, und niemand verschickt etwas per Mail. Pandocs `--extract-media` macht das gut und passt die Verweise entsprechend an — genau der Teil, der es von den Konvertern unterscheidet, die nur die Hälfte tun.

Die öffentliche Adresse ist das, was passiert, wenn ein gehosteter Konverter sagt, er habe Ihre Bilder behalten. Hat er, auf seinem Server, und der Verweis in Ihrem Markdown zeigt jetzt dorthin. Das ist ein funktionierendes Dokument und eine dauerhafte Abhängigkeit: Die Bilder bleiben, solange das Konto bleibt, und jeder Leser, der die Datei öffnet, stellt eine Anfrage, die der Hoster protokollieren kann. Gut zu wissen, bevor Sie das Dokument an einen Kunden schicken.

Der `data:`-URI ist die einzige Möglichkeit, die eine einzige in sich geschlossene Datei ergibt, und die richtige Voreinstellung für ein Dokument, das jemand anderes lesen wird. [In sich geschlossenes HTML](/blog/self-contained-html-explained) führt dasselbe Argument für die gerenderte Fassung.

## Die Rechnung des Einbettens

Base64 macht aus je drei Bytes vier Zeichen, ein eingebettetes Bild ist also rund 33 Prozent größer als die Datei, aus der es kam, plus ein kurzes Präfix für den Typ. Aus einem Screenshot von 750 KB wird etwa ein Megabyte Text. Diese Zahl ist der ganze Grund, warum Konverter vor dem Einbetten zurückschrecken, und es lohnt, konkret zu werden:

- Ein zehnseitiger Bericht mit sechs Screenshots: vielleicht 2 MB Text. Öffnet sofort, lässt sich mailen, geht nie kaputt.
- Eine Konferenzpräsentation mit vierzig Fotos: 30 MB Text. Ein Editor öffnet das langsam, und ein Diff davon ist nutzlos.
- Ein gescanntes Dokument: Jede Seite ist ein Bild, die Datei ist der Scan plus ein Drittel, und Text ist überhaupt keiner darin.

Sinnvoll ist ein Budget statt eines Schalters: einbetten bis zu einer Grenze, darüber hinaus die Verweise lassen, damit das Scheitern sichtbar wird, statt eine Datei zu erzeugen, die nichts öffnet. Hier liegt diese Grenze bei zwei Megabyte Bildern je Dokument und einem Megabyte für ein einzelnes Bild — ein Megabyte kodiert sind etwa 750 KB auf der Festplatte, also ein großzügiger Screenshot und ein kleines Foto. Die Grenze je Bild gibt es wegen eines bestimmten Fehlers: Ohne sie verbraucht ein Foto direkt vom Telefon die ganze Zuteilung, und die zwölf Screenshots danach — die, die das Argument tragen — fallen alle weg.

## Sechs Arten, wie Bilder verschwinden, ohne dass der Konverter schuld ist

**Das Bild ist ein Verweis, keine Datei.** Ein Dokument, das ein Bild im Intranet, eine Google-Drive-Adresse oder einen Slack-CDN-Link nennt, enthält keine Bytes zum Auspacken. Die Umwandlung trägt getreulich einen Verweis weiter, der nur aus Ihrem Netz oder Ihrer Sitzung heraus auflöst.

**Das Bild ist eine Metadatei.** Ein aus Excel eingefügtes Diagramm oder eine aus Visio eingefügte Zeichnung liegt häufig als EMF oder WMF vor, einem Windows-Vektorformat, das kein Browser darstellt. Die Bytes sind da, der Verweis stimmt, und der Leser sieht nichts. Fügen Sie es im Quelldokument erneut als Bild ein, bevor Sie umwandeln; weiter unten kann das nichts mehr richten.

**Das Bild ist eine Zeichnung, kein Bild.** Word-Formen, PowerPoint-SmartArt und alles aus den Zeichenwerkzeugen sind XML-Anweisungen zum Rendern, keine Bilddatei. In `media/` ist nichts auszupacken, weil das Dokument nie etwas enthielt.

**Zwei Bilder heißen gleich.** Wer einen Ordner voller Dokumente zu einer Markdown-Datei verschmilzt, legt `image1.png` aus neun Quellen auf einen Pfad. Das Ergebnis zeigt neunmal dasselbe Bild, und es sieht nach einem Fehler des Konverters aus statt nach einer Namenskollision.

**Der Alternativtext wurde nie geschrieben.** Alternativtext ist das eine, was Markdown an einem Bild vollständig tragen kann, und in den meisten Dokumenten ist er leer, weil das Autorenwerkzeug nicht danach gefragt hat. Wenn ein Bild aus einem der obigen Gründe wegfällt, ist guter Alternativtext der Unterschied zwischen einem Satz, der noch Sinn ergibt, und einem Loch.

**Das Bild ist der Text.** Ein Screenshot einer Tabelle ist ein Bild einer Tabelle. Das ist der Fehler ohne jede technische Lösung, und der einzige nützliche Zeitpunkt, ihn zu bemerken, ist vor der Umwandlung, in der Quelle.

## Was eine Umwandlung tun sollte und was zu prüfen ist

Eine Umwandlung, die mit Bildern richtig umgeht, tut vier Dinge, und jedes davon lässt sich in unter einer Minute nachprüfen:

1. **Den Verweis über den Mechanismus des Formats auflösen** — Beziehungs-Ids bei OOXML, das Manifest bei EPUB, MD5 bei Evernote — statt aus einem Dateinamen zu raten.
2. **Den Pfad dekodieren**, bevor sie die Datei sucht, damit `%20` und `+` nicht Teil eines Verzeichnisnamens werden.
3. **Sagen, was sie mit den Bytes getan hat.** Eingebettet, daneben geschrieben oder liegen gelassen: Alle drei sind vertretbar, Schweigen nicht.
4. **Den Alternativtext behalten**, auch dann, wenn sie das Bild fallen lässt.

Und auf der Ergebnisseite:

- Nach `](` suchen und die Pfade lesen. Alles Relative ist ein Versprechen über einen Ordner.
- Nach `data:image` suchen und zählen. Das sagt Ihnen, wie viele eingebettet wurden.
- Auf die Dateigröße sehen. Ein Markdown-Dokument mit eingebetteten Bildern misst sich in Megabyte, eines ohne in Kilobyte — ganz gleich, wie viele Bilder das Original hatte.
- Woanders öffnen. Der Rechner des Autors ist der eine Ort, an dem jeder Pfad auflöst, und genau deshalb ist der Autor der Letzte, der es merkt.

## Was daraus folgt

Für ein Dokument, das in ein Repository geht, ist ein Ordner daneben richtig, und die einzige Bedingung ist, dass der Konverter die Verweise dorthin anpasst, wo er tatsächlich geschrieben hat. Für ein Dokument, das an einen Menschen geht, ist Einbetten die einzige Antwort, die den Weg übersteht, und der Preis sind ein Drittel mehr Bytes und eine Grenze, die man kennen statt entdecken sollte. Für alles dazwischen bleibt die Prüfung dieselben drei Suchen, und die lohnen sich einmal an einem Dokument, an dem Ihnen liegt, bevor Sie einem Werkzeug fünfzig anvertrauen.

Jede Umwandlung hier — [Word](/word-to-markdown), [PowerPoint](/powerpoint-to-markdown), [Notion-, Confluence- und Obsidian-Exporte](/notion-to-markdown) unter ihnen — bettet die gefundenen Bilder ein, im Browser, sodass nichts zum Hosten hochgeladen wird und nichts von einem Ordner abhängt, der nicht mitgereist ist. Zum Nachbarproblem der Verweise, die nur vom eigenen Schreibtisch aus auflösen, sagt [Bilder und Links, die weiterhin funktionieren](/blog/images-and-links-that-still-work) das Nötige.
