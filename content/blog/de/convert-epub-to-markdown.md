---
title: "EPUB in Markdown umwandeln: Spine-Reihenfolge, Kapiteltitel und Fußnoten"
description: "Ein EPUB ist eine Website im ZIP — was Pandoc, calibre und das direkte Lesen jeweils liefern, und die vier Dinge, die zerbrechen, wenn ein Buch eine Datei wird"
date: 2026-09-21
tag: Konvertieren
keywords: epub in markdown umwandeln, epub zu markdown konvertieren, ebook in text umwandeln, epub text extrahieren, calibre epub markdown, pandoc epub markdown
---

Ein EPUB ist eine kleine Website, die zufällig als Buch verkauft wird: XHTML-Dateien, ein Stylesheet, Bilder und ein Verzeichnis, das die Lesereihenfolge festlegt. Das macht es zum freundlichsten aller Dokumentformate — und genau deshalb liegen die interessanten Probleme gar nicht beim Parsen. Sie liegen darin, was geschieht, wenn hundertachtzig getrennte Dateien zu einem Markdown-Dokument werden und jeder Verweis zwischen ihnen ins Leere zeigt.

### Kurz gefasst

Benennen Sie eine `.epub` in `.zip` um, und Sie können alles lesen. `META-INF/container.xml` verweist auf das Package-Dokument, und dessen Spine ist die Lesereihenfolge — die, wie bei jedem ZIP-Format, nicht der Dateinamensfolge entspricht (geprüft auf w3.org, 21. September 2026). Pandoc liest EPUB direkt und liest es gut: `pandoc -f epub -t gfm book.epub -o book.md --extract-media=media`. Auch calibre kann Markdown erzeugen, über die TXT-Ausgabe: `ebook-convert book.epub book.txt --txt-output-formatting=markdown` — entfernt allerdings Links und Bildverweise, sofern Sie nicht `--keep-links` und `--keep-image-references` mitgeben (geprüft auf manual.calibre-ebook.com, 21. September 2026). Ein Konverter, der die Teile direkt liest, etwa [EPUB → Markdown](/epub-to-markdown), löst den Spine auf, nimmt die Kapiteltitel aus dem Navigationsdokument und macht aus den kapitelübergreifenden Verweisen etwas, das innerhalb einer Datei weiterhin funktioniert.

Was in jedem Fall zerbricht: Verweise zwischen Kapiteln, Fußnoten über `epub:type`, Seitenverzeichnisse und alles in einem Fixed-Layout-Buch, das aus Bildern mit hineingezeichnetem Text besteht.

## Was in einer .epub steckt

| Pfad | Bedeutung |
| --- | --- |
| `mimetype` | Der erste, unkomprimierte Eintrag im ZIP, der sagt: Dies ist ein EPUB |
| `META-INF/container.xml` | Die einzige Datei an festem Pfad — sie benennt das Package-Dokument |
| `OEBPS/content.opf` | Das Package-Dokument: Metadaten, ein Manifest aller Dateien und der Spine |
| `OEBPS/nav.xhtml` | Das Navigationsdokument von EPUB 3 — das Inhaltsverzeichnis als verschachtelte Liste |
| `OEBPS/toc.ncx` | Die Entsprechung aus EPUB 2, aus Kompatibilitätsgründen in den meisten Büchern noch vorhanden |
| `OEBPS/chapter-12.xhtml` | Ein Kapitel, als gewöhnliches XHTML |
| `OEBPS/images/` | Die Bilder, das Titelbild eingeschlossen |

Zwei Regeln machen das leicht lesbar, eine macht es leicht falsch. Das Leichte: `META-INF/container.xml` ist der einzige Pfad, den Sie kennen müssen, weil sich alles Weitere daraus ergibt, und der Inhalt ist XHTML, womit jeder HTML-Parser bereits umgeht. Das Schwere ist dasselbe wie bei jedem ZIP-Format: Der Spine legt die Lesereihenfolge fest, und sonst nichts. `chapter-12.xhtml` kann das dritte Kapitel sein, der Anhang oder eine ungenutzte Datei, die im Manifest stehen geblieben ist. Wer nach Dateinamen sortiert, erhält ein Buch in einer Reihenfolge, die niemand geschrieben hat.

## Die drei Wege

| Weg | Reihenfolge | Kapiteltitel | Bilder | Kapitelübergreifende Links | Fußnoten |
| --- | --- | --- | --- | --- | --- |
| Pandoc | Aus dem Spine | Aus den Überschriften | `--extract-media` | Bleiben, zeigen auf Verschwundenes | Bleiben als Links |
| calibre TXT/Markdown | Aus dem Spine | Aus den Überschriften | Standardmäßig aus | Standardmäßig aus | Bleiben, wenn Links bleiben |
| Die Teile direkt lesen | Aus dem Spine | Erst Navigationsdokument, dann Überschriften | Eingebettet | Zu Ankern im Dokument umschreibbar | Auf den Notentext auflösbar |
| Aus einer Lese-App kopieren | Was Sie markiert haben | Nein | Nein | Nein | Nein |

## Pandoc, das EPUB tatsächlich liest

`epub` steht bei Pandoc seit Jahren auf beiden Seiten, was nicht für jedes Format gilt, das es schreibt: `pptx` war bis zum Leser in 3.8.3 ein reines Ausgabeformat (geprüft auf pandoc.org, 22. September 2026). Das ist die kürzeste gute Antwort für ein Buch, das Sie als eine Datei wollen:

```bash
pandoc -f epub -t gfm book.epub -o book.md --extract-media=media
```

`--extract-media` schreibt jedes Bild in den genannten Ordner und passt die Bildverweise darauf an — genau das, was Sie wollen, denn sonst verweist das Markdown auf Dateien, die weiterhin im ZIP eingeschlossen sind. Ergänzen Sie `--wrap=none`, wenn der harte Zeilenumbruch Ihre Diffs stört.

Heraus kommt ein getreues, flaches Dokument: die Überschriften jedes Kapitels auf der Ebene, die das XHTML benutzt hat, die Absätze in Spine-Reihenfolge, die Bilder daneben. Was Sie nicht bekommen, ist irgendeine Berücksichtigung der Tatsache, dass die Kapitel einmal getrennte Dokumente waren. Jedes `<a href="chapter-13.xhtml#note-4">` im Buch ist jetzt ein Verweis auf eine Datei, die es nicht gibt, in einem Markdown-Dokument, das den Zielinhalt enthält — ein paar hundert Zeilen weiter unten.

| Vorteile | Nachteile |
| --- | --- |
| Ein Befehl, keine Konfiguration, hohe Treue | Kapitelübergreifende Links überleben als kaputte relative Pfade |
| Spine-Reihenfolge wird korrekt behandelt | Kapiteltitel stammen aus den Überschriften; ein Buch mit Bild-Kapitelanfängen bekommt namenlose Kapitel |
| `--extract-media` löst die Bildfrage sauber | Titelei, Impressum und Register kommen alle als Kapitel durch |

**Für wen ist das?** Für alle, die Pandoc ohnehin installiert haben und ein Buch mit gewöhnlicher Struktur vor sich haben. Das ist die richtige Voreinstellung, und das Linkproblem ist ein Suchen-und-Ersetzen entfernt.

## calibre und die zwei Schalter, auf die es ankommt

`ebook-convert` aus calibre ist das andere Werkzeug, das die meisten schon haben, und es erreicht Markdown über seine TXT-Ausgabe:

```bash
ebook-convert book.epub book.txt \
  --txt-output-formatting=markdown \
  --keep-links \
  --keep-image-references
```

Die Formatoption nimmt `plain`, `markdown` oder `textile`. Die beiden `--keep`-Schalter sind der Teil, den man kennen sollte, denn ihr Fehlen bleibt stumm: Die Dokumentation sagt, dass Links bei reiner Textausgabe immer entfernt werden und dass ihr Erhalt erst sinnvoll ist, sobald eine Formatoption gesetzt ist (geprüft auf manual.calibre-ebook.com, 21. September 2026). Ohne sie erhalten Sie ein sauberes, lesbares, linkfreies Buch — und nichts sagt Ihnen, dass vierhundert Links darin waren.

`--keep-image-references` hat den spiegelbildlichen Haken zu Pandoc: Es behält die Verweise und packt die Dateien nicht aus, sodass am Ende `![](../images/fig-3.png)` in ein ZIP zeigt, das Sie nicht mehr offen haben. calibre erzeugt bereitwillig auch eine HTMLZ-Ausgabe samt Bildern — womit Sie das Auspacken dann doch von Hand machen.

| Vorteile | Nachteile |
| --- | --- |
| Überall installiert, wo eine Bibliothek verwaltet wird | Zwei unauffällige Schalter stehen zwischen Ihnen und einem verlustfreien Lauf |
| Verkraftet weit mehr fehlerhafte Bücher als Pandoc | Bildverweise bleiben, Bilddateien nicht |
| Stapelverarbeitung über eine Bibliothek ist ein Einzeiler | Das Markdown ist Nebenprodukt eines Textexporters, kein Zielformat |

**Für wen ist das?** Für alle, die viele Bücher auf einmal umwandeln — oder eines, das Pandoc verweigert. Es ist außerdem der nachsichtigere Leser von beiden, was mehr zählt, als es sollte: Erstaunlich viele reale EPUBs sind nicht valide.

## Die Teile selbst lesen

Das ganze Format sind vier Schritte, und die sind kurz genug, dass es sich lohnt, sie zu kennen, auch wenn Sie sie nie schreiben:

```text
1. unzip the file
2. read META-INF/container.xml → <rootfile full-path="OEBPS/content.opf">
3. read the opf:
     <manifest> → id → href, media-type
     <spine>    → ordered list of idrefs
4. for each idref in spine order: parse the XHTML, convert it, append
```

Diesen Weg zu gehen lohnt aus genau einem Grund: Sie haben Spine und Navigationsdokument gleichzeitig in der Hand, und das ist es, was Kapiteltitel und Verweise richtig werden lässt. Weder Pandoc noch calibre zieht die Titel aus dem Navigationsdokument — beide nehmen, was die XHTML-Überschriften sagen, was meistens dasselbe ist und manchmal eben nicht.

## Die vier Dinge, die zerbrechen, und was dagegen hilft

### Kapiteltitel, die nicht im Kapitel stehen

Der Kapitelanfang eines Buches ist häufig ein gestaltetes Bild — die Kapitelnummer in einer Auszeichnungsschrift, als PNG exportiert — während der eigentliche Text im XHTML nirgends vorkommt. Das Navigationsdokument weiß trotzdem, dass das Kapitel „Der zweite Winter“ heißt, denn das ist die Zeichenkette, die die Lese-App in ihrem Inhaltsverzeichnis zeigt. Eine Umwandlung, die nur die Kapiteldateien liest, erzeugt ein Dokument ganz ohne Überschriften — und keine erkennbare Erklärung dafür.

Die Lösung: den Titel aus dem Navigationsdokument nehmen, über die Datei zugeordnet, auf die es zeigt, und erst dann auf die erste Überschrift zurückfallen, wenn die Navigation nichts hergibt. [EPUB → Markdown hier](/epub-to-markdown) liest dafür sowohl `nav.xhtml` als auch `toc.ncx`, denn reichlich EPUB-3-Dateien führen ein NCX mit besseren Bezeichnungen als ihr Nav.

### Verweise zwischen Kapiteln

Das ist der Punkt, der ein Buch von einem Dokument unterscheidet. Innerhalb des EPUB ist `<a href="ch13.xhtml#fn4">` ein funktionierender Verweis auf eine andere Datei. In einem einzelnen Markdown-Dokument liegen Quelle und Ziel in derselben Datei, und der Verweis ist ein relativer Pfad auf eine Datei, die es nicht gibt.

Es gibt drei vertretbare Antworten, und die falsche ist, nichts zu tun:

- **Zu einem Anker im Dokument umschreiben.** Aus `ch13.xhtml#fn4` wird `#fn4`, was funktioniert, sofern die Ziel-Id ins Markdown übernommen wurde und der Renderer Ids für Überschriften erzeugt. Bestes Ergebnis, meiste Arbeit.
- **Den Verweis fallen lassen, den Text behalten.** Der Satz liest sich richtig, und nichts ist kaputt. So sollte eine Umwandlung es standardmäßig halten.
- **Das href unangetastet lassen.** Das Dokument enthält nun Verweise, die stumm scheitern. So halten es die meisten Umwandlungen.

### Fußnoten

EPUB 3 kennzeichnet Fußnoten mit `epub:type="noteref"` am Verweis und `epub:type="footnote"` am Ziel, das meist am Kapitelende oder in einer eigenen Notendatei steht. Markdown hat in den meisten Dialekten eine Fußnotensyntax, und sie ist ein wirklich gutes Ziel: `[^4]` im Text, `[^4]: die Note` unten. Fast nichts nimmt diese Zuordnung vor, weil sie verlangt, die `epub:type`-Attribute zu lesen und die Ids über Dateigrenzen hinweg zuzuordnen, statt jede Datei für sich zu konvertieren. [Was Markdown mit Fußnoten macht und was nicht](/blog/markdown-footnotes-support) sagt, welche Renderer die Syntax unterstützen, wenn Sie sie erst einmal haben.

### Fixed-Layout-Bücher

Comics, Kinderbücher, Kochbücher und die meisten illustrierten Sachbücher erscheinen als Fixed-Layout-EPUB: ein Bild je Seite, absolut positioniert, mit dem Text ins Bild eingebrannt. Es gibt keinen Text zum Umwandeln. Die Umwandlung eines solchen Buches ergibt eine Liste von Bildern und eine Handvoll Seitenzahlen, und das ist kein Werkzeugfehler — die Wörter waren nie Zeichen. Prüfen Sie vorher `<meta property="rendition:layout">pre-paginated</meta>` im Package-Dokument, bevor Sie Zeit investieren.

## Was nicht funktionieren wird

**Ein DRM-geschütztes Buch.** Seine Inhaltsdateien sind verschlüsselt und in `META-INF/encryption.xml` aufgeführt; jedes der obigen Werkzeuge liest das ZIP, findet Chiffrat und scheitert. Das ist das beabsichtigte Verhalten des Formats, und nichts in diesem Text ist ein Weg daran vorbei. Bücher, die ohne DRM verkauft werden, Bücher unter einer Lizenz, die es erlaubt, und eigene Manuskripte sind alle gewöhnliche EPUBs.

**Echte Typografie.** Initialen, Kapitälchen, hängende Interpunktion, gesperrte Auszeichnungsschrift und die sorgfältige Kontrolle von Hurenkindern und Schusterjungen sind allesamt Stylesheet-Entscheidungen. Markdown kann nichts davon ausdrücken und sollte es im Großen und Ganzen auch nicht. Was Sie das kostet, gehört dann ausgesprochen, wenn das Umzuwandelnde ein gestaltetes Buch ist und kein Manuskript.

**Die Semantik des Stylesheets.** Ein Buch, das Epigraf, Herausstellung und Blockzitat unterscheidet, tut das mit drei CSS-Klassen an drei Blockquotes. Markdown hat ein Blockquote. Etwas geht verloren, und welches der drei am meisten zählt, können nur Sie entscheiden — vor der Umwandlung, durch Ändern des Markups, nicht danach.

## Eine Prüfliste für ein Buch, an dem Ihnen liegt

1. **Die Layout-Eigenschaft** auf `pre-paginated` prüfen, noch vor allem anderen. Ist es Fixed Layout, hören Sie auf.
2. **Die Spine-Einträge zählen** und die Kapitel im fertigen Markdown. Eine Abweichung heißt meist, dass Titelei verschmolzen oder ein Abschnitt übersprungen wurde.
3. **Im Ergebnis nach `.xhtml` suchen.** Jeder Treffer ist ein Verweis, der einmal funktioniert hat.
4. **Die erste Überschrift jedes Kapitels ansehen.** Beginnen mehrere Kapitel mit einem Bild und ohne Überschrift, kamen die Titel aus der falschen Quelle.
5. **Über Titelei und Anhang entscheiden.** Impressum, Widmung, Register und Kolophon konvertieren alle mit und sind in einem Dokument, das Sie bearbeiten wollen, meist Rauschen. Sie sind auch am leichtesten einmal am Anfang zu entfernen.
6. **Hat das Buch Noten, eine davon ganz durchgehen** — die Marke im Text, die Note selbst und die Frage, ob noch irgendetwas beides verbindet.

## Was daraus folgt

Für ein Buch ist `pandoc -f epub -t gfm --extract-media=media` plus zehn Minuten Linkreparatur der kürzeste ehrliche Weg. Für ein ganzes Regal stapelt calibre mit den beiden `--keep`-Schaltern sauber durch. Für ein Buch, bei dem Noten und Kapiteltitel zählen — ein Nachschlagewerk, ein Manuskript zurück vom Verlag, alles, was Sie weiter bearbeiten wollen — liegt der Unterschied in den Teilen, die die Allzweckwerkzeuge nicht lesen; [die Umwandlung EPUB → Markdown hier](/epub-to-markdown) nimmt die Titel aus dem Navigationsdokument und bettet die Bilder ein, sodass am Ende eine einzige Datei steht. Sobald es Markdown ist, ist [Zusammenführen und Teilen](/blog/merging-many-markdown-files) ein anderes und sehr viel leichteres Problem.
