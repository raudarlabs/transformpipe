---
title: "Was Pandoc ist — und wann Sie es nicht brauchen"
description: "Pandoc ist ein Programm mit fünfzig Lesern, sechsundsechzig Schreibern und einem Dokumentmodell dazwischen. Was das bringt, und wofür es zu viel ist."
date: 2026-09-22
tag: Konvertieren
keywords: was ist pandoc, pandoc, pandoc online, pandoc app, pandoc benutzen, pandoc installieren, pandoc alternative
---

Fast alles, was über Pandoc geschrieben wird, beginnt bei einem Befehl, den jemand ausführen möchte. Dieser Text beginnt einen Schritt früher, denn der Befehl ergibt erst Sinn, wenn klar ist, was das Programm überhaupt ist: eine einzige Binärdatei, die fünfzig Formate liest, sechsundsechzig schreibt — und nie eines direkt in ein anderes überführt.

### Kurzfassung

Pandoc ist ein Kommandozeilenprogramm und eine Haskell-Bibliothek. Es liest ein Dokument in eine interne Darstellung ein und schreibt diese Darstellung anschließend in einem anderen Format wieder heraus. Es ist freie Software unter der GPL, geschrieben von John MacFarlane und seit 2006 veröffentlicht. Es gibt keine App, kein Konto und keinen offiziellen Onlinedienst — nur eine Demo unter `pandoc.org/try`. Sie wollen es, wenn die Aufgabe eine Formatmatrix ist, Zitate, Word im Hausstil einer anderen Abteilung oder dieselbe Umwandlung tausendmal. Sie wollen es nicht, wenn die Aufgabe eine Datei ist, einmal, auf einem Rechner, auf dem Sie nichts installieren dürfen — oder wenn das Dokument ein Tab ist, den Sie ansehen, und keine Datei, die Sie haben.

## Ein Programm, zwei Listen und ein Dokument dazwischen

Der Entwurf ist eine einzige Idee, alles Weitere folgt daraus. Pandoc wandelt nicht Markdown in HTML um. Es **liest** Markdown in einen abstrakten Syntaxbaum — ein Dokument aus Überschriften, Absätzen, Listen, Tabellen, Links, Fußnoten — und **schreibt** diesen Baum dann als HTML. Die lesende und die schreibende Hälfte wissen nichts voneinander.

Deshalb ist die Formatliste so lang, ohne dass jemand tausend Konverter geschrieben hätte. Fünfzig Leser und sechsundsechzig Schreiber sind nicht 116 Arbeitspakete, sondern 116 Arbeitspakete, die 3.300 Umwandlungen ergeben. Niemand hat einen Konverter von Jupyter-Notebook nach Jira-Wiki geschrieben. Er fällt aus der Kreuzung heraus.

Es erklärt auch die beiden Eigenschaften, die überraschen:

**Ein Format ist ein Leser oder ein Schreiber und nicht automatisch beides.** LaTeX, DocBook und Word sind beides. Beamer, ICML und reveal.js sind reine Schreiber. RIS und EndNote XML sind reine Leser. Eine Umwandlung zu verlangen, für die es keinen Leser gibt, ergibt einen Fehler statt eines schlechten Ergebnisses — und das ist das ehrliche Verhalten.

**Was Pandoc nicht darstellen kann, ist beim Lesen verloren, nicht beim Schreiben.** Wenn die Kommentare einer Word-Datei nicht in den Baum gelangen, kann kein Ausgabeformat sie drucken. Deshalb ist „Pandoc hat mein X verloren“ fast immer eine Frage an den Leser.

## Die Liste ändert sich, und was Sie erinnern, ist veraltet

Am 1. Dezember 2025 nahm Version 3.8.3 `pptx` und `xlsx` als **Eingabeformate** auf. Neunzehn Jahre lang war eine PowerPoint-Präsentation etwas, das Pandoc schreiben und nicht lesen konnte, und die Ratschläge im Netz — bis heute Vormittag auch vier Artikel auf dieser Seite — sagen das noch immer.

Die nützliche Gewohnheit ist also nicht, sich die Matrix zu merken, sondern das Programm zu fragen:

```bash
pandoc --list-input-formats
pandoc --list-output-formats
pandoc --version
```

Drei Befehle, und die Antwort gilt für die Version, die Sie tatsächlich haben. Dieselben Listen stehen in den Auswahlfeldern unter `pandoc.org/try` — der schnellste Weg, ohne Installation nachzusehen. `pptx` und `xlsx` stehen dort inzwischen beide in der Liste „from“ (geprüft am 22. September 2026).

Ein Vorbehalt, falls Sie dieses Angebot für Präsentationen annehmen: Der PowerPoint-Leser öffnet die Folien, ihre Tabellen, ihre Bilder und ihr SmartArt — den Notizenteil öffnet er gar nicht. [Was aus einer Präsentation und ihren Sprechernotizen wird](/blog/convert-powerpoint-to-markdown), steht ausführlich an anderer Stelle; beide neuen Leser bezeichnen sich im eigenen Quelltext als alpha.

## Es gibt keine Pandoc-App und kein Pandoc online

Beides wird gesucht, also sei die Antwort deutlich: Pandoc ist ein Kommandozeilenprogramm. Es gibt keine offizielle grafische Anwendung und keinen offiziellen gehosteten Dienst.

Unter `pandoc.org/try` liegt eine Demo — ein Textfeld, zwei Auswahllisten und eine Schaltfläche, um eine Umwandlung an einem Schnipsel auszuprobieren. Ein Dateikonverter ist das nicht und soll es nicht sein.

Alles andere, was sich „Pandoc online“ nennt, ist der Server von jemandem, auf dem Pandoc installiert ist. Das zu bauen ist legitim, und wir bauen selbst etwas Verwandtes, aber es verschiebt die Frage vollständig: Ihr Dokument ist jetzt eine Datei auf einer Maschine, die Sie nicht kontrollieren, mit einer Aufbewahrungsfrist, die Sie nicht gelesen haben. [Wie man prüft, wohin ein Konverter Ihre Datei wirklich schickt](/blog/is-an-online-converter-safe), gilt für sie alle.

## Die vier Befehle, die das meiste abdecken

```bash
# Markdown zu einer echten HTML-Seite, alles in einer Datei
pandoc notes.md -o notes.html --standalone --embed-resources

# Eine Word-Datei zu Markdown, mit den Bildern daneben geschrieben
pandoc report.docx -t gfm -o report.md --extract-media=media

# Markdown zu Word, im Hausstil einer anderen Abteilung
pandoc paper.md -o paper.docx --reference-doc=template.docx

# Markdown mit Zitaten zu einem PDF
pandoc paper.md --citeproc --bibliography=refs.bib -o paper.pdf
```

Zwei Fußnoten dazu. `--self-contained` hieß der zweite Schalter der ersten Zeile früher; heute ist er ein veraltetes Synonym für `--embed-resources --standalone`, eine Antwort von vor vier Jahren funktioniert also weiterhin und warnt dabei.

Und die letzte Zeile verbirgt eine Installation. **Markdown zu PDF ist keiner von Pandocs Schreibern.** Das PDF entsteht, indem das Dokument an eine separate Engine übergeben wird, und die Vorgabe ist eine TeX-Engine — meist ein deutlich größerer Download als Pandoc selbst und der häufigste Grund, warum jemand entscheidet, Pandoc sei mehr als gewollt. `--pdf-engine` kann stattdessen auf `weasyprint`, `wkhtmltopdf`, `typst`, `prince`, `pagedjs-cli` oder `context` zeigen, von denen mehrere erheblich leichter sind. [Die Wege von Markdown zu PDF](/blog/markdown-to-pdf) vergleicht sie.

## Wenn nichts anderes reicht

- **Eine Formatmatrix.** Eine Quelle, mehrere Ausgaben, im Gleichschritt: HTML für die Website, DOCX für die Korrektur, EPUB für die Lektüre im Zug. Alles Leichtere kann eine Ausgabe gut.
- **Zitate.** `--citeproc` mit BibTeX, BibLaTeX oder CSL JSON und Hunderten von CSL-Stilen. Nichts sonst in dieser Klasse hat überhaupt eine Zitatverarbeitung.
- **Ein Hausstil für Word.** `--reference-doc` übernimmt Schriften, Überschriftenformate und Abstände aus einer vorhandenen `.docx`. Kam die Vorlage aus der Rechts- oder Marketingabteilung, ist dieser Schalter der ganze Grund zu installieren.
- **Filter.** Ein Lua- oder JSON-Filter schreibt das Dokument um, solange es noch ein Baum ist: jede Tabelle neu nummerieren, jede Überschrift hochstufen, jeden internen Link ersetzen. Die Variante mit regulären Ausdrücken funktioniert bis zu dem Tag, an dem sie es nicht mehr tut.
- **Menge.** Es ist eine Binärdatei, die von der Standardeingabe liest und auf die Standardausgabe schreibt. Tausend Dateien sind eine `for`-Schleife.

## Wenn es mehr ist, als die Aufgabe braucht

- **Eine Datei, einmal.** Ein einzelnes Dokument nach HTML zu bringen heißt `--standalone`, dann ein Stylesheet, dann womöglich eine Vorlage in Pandocs eigener Vorlagensprache. Das ist ein realer Aufwand, und er schrumpft nicht, wenn die Aufgabe klein ist. [Die leichteren Alternativen](/blog/pandoc-alternatives-for-markdown-to-html) sind danach sortiert, welchen Teil davon Sie vermeiden wollen.
- **Ein Rechner, auf dem Sie nichts installieren dürfen.** Ein verwaltetes Notebook, ein Telefon, der Schreibtisch einer anderen Person.
- **Ein Dokument, das keine Datei ist.** Eine Wiki-Seite, ein Ticket, ein Diskussionsfaden — alles, was nur gerendert im Browser existiert, muss erst gespeichert werden, damit Pandoc es sieht, und das Speichern ist die schwierige Hälfte.
- **Eine Umwandlung, deren Ergebnis Sie sehen wollen, bevor Sie ihm trauen.** Pandoc ist ein Werkzeug für Pipelines: hervorragend, sobald Sie wissen, was Sie wollen, und teuer, solange Sie es noch herausfinden.

## Wo diese Seite steht

TransformPipe konvertiert im Browser: fünfzehn Formate hinein, Markdown und eine eigenständige HTML-Datei hinaus, und die Datei verlässt den Rechner nicht. Das deckt die Mitte der letzten Liste ab — ein Dokument, keine Installation, ein Ergebnis, das Sie sehen — und nichts aus der ersten. Es gibt hier keine Zitatverarbeitung, keine Vorlagensprache, keine Formatmatrix und kein PDF in irgendeine Richtung.

Die ehrliche Zusammenfassung: zwei verschiedene Werkzeuge für zwei Hälften desselben Problems, und die Grenze lässt sich leicht benennen. Passiert die Umwandlung nächste Woche wieder, schreiben Sie ein Skript mit Pandoc. Passiert sie einmal, in den nächsten zwei Minuten, sollten Sie dafür nichts installieren müssen.
