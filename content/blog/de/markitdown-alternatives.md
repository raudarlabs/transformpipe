---
title: MarkItDown-Alternativen, sortiert nach dem Grund Ihrer Suche
description: MarkItDown ist eine Python-Bibliothek für LLM-Pipelines, und die eigene README sagt das auch. Was zu nehmen ist, wenn Ihr Problem anders aussieht.
date: 2026-09-22
tag: Konvertieren
keywords: markitdown alternative, markitdown vs docling, markitdown ohne python, dokumente in markdown für llm, microsoft markitdown, markitdown pdf
---

Niemand sucht eine MarkItDown-Alternative, weil MarkItDown schlecht wäre. Gesucht wird, weil die Datei in einem Browser-Tab auf einem Rechner ohne Python liegt, weil das PDF als Spalte ineinandergelaufener Wörter herauskam, oder weil das Markdown für einen Menschen gedacht war und sich nicht liest, als hätte ein Mensch es geschrieben. Das Werkzeug ist in Ordnung. Es wurde für eine bestimmte Art von Problem gebaut, und diese Art steht klar in seiner eigenen Dokumentation — was mehr ist, als die meisten Projekte tun.

### Kurzfassung

MarkItDown ist ein Python-Werkzeug, das Dateien **für Textanalyse-Pipelines** nach Markdown konvertiert, und die README sagt, die Ausgabe sei „möglicherweise nicht die beste Wahl für originalgetreue Konvertierungen zum menschlichen Lesen“. Wenn Ihre Pipeline aus Python besteht, die Dateien daneben auf der Platte liegen und das Markdown in ein Modell geht, ist es die richtige Vorgabe, und nichts hier schlägt es. Anderswo suchen Sie, wenn dort, wo das Dokument liegt, kein Python ist, wenn die Eingabe ein gescanntes PDF ist, wenn das Markdown wieder als etwas anderes hinausmuss, oder wenn das Dokument den Rechner gar nicht verlassen darf. Den letzten Punkt sollte man prüfen statt annehmen: Einige der besten Optionen sind kostenpflichtige Cloud-Aufrufe.

## Was MarkItDown tatsächlich ist

Eine dünne, gut gewählte Hülle. Das interessante Dokument ist nicht die README, sondern `pyproject.toml`, denn die optionalen Abhängigkeiten sind das ehrliche Datenblatt (geprüft auf github.com/microsoft/markitdown, 22. September 2026):

| Format | Was es liest |
| --- | --- |
| `.docx` | `mammoth` |
| `.pptx` | `python-pptx` |
| `.xlsx` / `.xls` | `pandas` mit `openpyxl` oder `xlrd` |
| `.pdf` | `pdfminer.six` und `pdfplumber` |
| Audio | `pydub` mit `SpeechRecognition` |
| YouTube | `youtube-transcript-api` |
| HTML | `beautifulsoup4` und `markdownify` |

Python 3.10 bis 3.14, `pip install 'markitdown[all]'`, oder ein Extra nach dem anderen — `pip install 'markitdown[pdf, docx, pptx]'` —, was die vernünftige Installation ist, sobald Sie wissen, welche drei Sie brauchen.

Diese Liste zu kennen heißt, die Obergrenze zu kennen, bevor man an sie stößt. Der Word-Leser ist Mammoth, also erbt MarkItDown genau das, [was Mammoth mitnimmt und was nicht](/blog/mammoth-js-and-docx-parsers). Die PDF-Leser sind Textextraktoren: Sie holen die Textobjekte heraus, die ein PDF deklariert. Sie modellieren die Seite nicht, also kommt ein zweispaltiger Scan ineinandergeschoben heraus und eine eingescannte Seite kommt leer heraus, weil überhaupt kein Text darin steht, den man extrahieren könnte. OCR gibt es — über ein Plugin, das die Seite an ein Vision-Modell schickt, für das Sie den Schlüssel stellen, oder über Azure Document Intelligence. Beides sind Netzwerkaufrufe.

Und dann ist da die Bereichsnotiz, die den größten Teil dieses Artikels entscheidet:

> Wir können keine weiteren Anwendungen, Dienste oder Server annehmen. Dazu gehören: Webserver, REST- oder HTTP-APIs und gehostete Konvertierungsdienste; Web-Oberflächen und browserbasierte Benutzeroberflächen; Desktop- und Mobilanwendungen.

Das ist keine Lücke. Das ist eine bewusste Grenze, festgehalten im Beitragsleitfaden, und sie bedeutet: Das Projekt wird nie das bekommen, was die Hälfte der Suchenden eigentlich will.

## Die vier Gründe, aus denen gesucht wird

### 1. Dort, wo das Dokument liegt, ist kein Python

Das ist der häufige Grund, und er ist kein technischer Einwand. Das Dokument ist eine Confluence-Seite, ein Ticket, ein Google-Dokument, ein Diskussionsfaden — oder es ist eine `.docx` auf dem Laptop von jemandem, der kein Terminal hat und auch keines bekommen wird. Eine Pipeline, die mit `pip install` beginnt, ist für diese Person bereits gescheitert.

Was stattdessen funktioniert, ist ein Konverter, der dort läuft, wo das Dokument ohnehin schon ist: in einem Browser-Tab, in einer Erweiterung in der Symbolleiste, auf einem Telefon. Die Konvertierung selbst ist nicht das Schwere — `mammoth` gibt es als JavaScript-Build, `turndown` war immer JavaScript —, also ist browserseitiges Konvertieren von Word, HTML, Tabellen und Präsentationen heute gewöhnlich, und es wird nichts hochgeladen, wenn es in der Seite geschieht.

### 2. Die Eingabe ist ein PDF, und das PDF ist ein Bild

`pdfminer.six` und `pdfplumber` sind gut in dem, was sie tun: Sie lesen den Text, den eine PDF-Datei angibt. Ein eingescannter Vertrag gibt keinen Text an. Ein zweispaltiges wissenschaftliches Papier gibt seinen Text in einer Reihenfolge an, die zum Zeichnen passt, nicht zum Lesen.

Ist PDF die eigentliche Eingabe, heißt das dafür gebaute Werkzeug **Docling**, von IBM Research und inzwischen in der LF AI & Data Foundation: Seitenlayout, Lesereihenfolge, Tabellenstruktur, Formeln, OCR für Scans und darunter ein Dokumentmodell statt eines Textpuffers. Es ist deutlich schwerer — beim ersten Lauf werden Modellgewichte heruntergeladen —, und dieses Gewicht ist die Funktion. [Der Vergleich von zehn Konvertern](/blog/ten-markdown-converters-compared) stellt beide in dieselbe Tabelle, wenn Sie das übrige Feld daneben sehen wollen.

### 3. Das Markdown muss wieder hinaus

MarkItDown konvertiert *nach* Markdown. Das ist der ganze Entwurf, und „das einzige Ziel“ trifft darauf in einer Weise zu, wie es auf Pandoc nicht zutrifft.

Sobald die Aufgabe lautet „wir haben das Markdown und jetzt muss es eine Word-Datei sein, in der die Rechtsabteilung Änderungen markiert“, sehen Sie sich ein anderes Werkzeug an. [Pandoc](/blog/pandoc-alternatives-for-markdown-to-html) ist die Referenzantwort für diese Richtung und für die Formatmatrix überhaupt — eine Quelle, mehrere Ausgaben, im Gleichschritt gehalten.

### 4. Das Dokument darf den Rechner nicht verlassen

Diesen Punkt bitte genau lesen, denn „läuft lokal“ und „kein Netzwerk“ sind nicht derselbe Satz.

MarkItDowns eingebaute Konverter sind lokal. Seine besten Ergebnisse bei schwierigen Eingaben sind es nicht: Azure Document Intelligence und Azure Content Understanding sind Cloud-Dienste, jeder Aufruf ist kostenpflichtig, und Bildbeschreibungen entstehen, indem das Bild über einen Client, den Sie selbst bauen, an ein LLM geschickt wird. Alle drei sind ausdrücklich zu aktivieren und keines ist eine Überraschung — die Dokumentation ist klar —, aber eine Compliance-Antwort, die „läuft lokal“ sagt, während die Pipeline ein Flag setzt, das die Seite hochlädt, ist genau die Sorte Sache, die erst bei einer Prüfung auffällt. [Wie man prüft, wohin ein Konverter Ihre Datei schickt](/blog/is-an-online-converter-safe), ist eine Frage, die jedes Werkzeug auf dieser Seite verdient, unseres eingeschlossen.

## Was hier nichts ersetzt

Fair zu sein ist auch der nützliche Teil, denn es sagt Ihnen, wann Sie aufhören können zu lesen.

- **YouTube-Transkripte und Audio.** Nichts anderes in diesem Artikel macht aus einer Video-Adresse oder einer `.wav` Text. Steht das auf der Liste, steht MarkItDown auf der Liste.
- **Outlook-`.msg`-Dateien.** Ein wirklich sperriges Format, und es wird gelesen.
- **ZIP-Archive, durchlaufen.** Es geht den Inhalt durch und konvertiert jedes Stück.
- **Das Plugin-System.** Ein Format, das Sie brauchen und das niemand unterstützt, ist ein Paket, das Sie veröffentlichen, kein Fork, den Sie pflegen.
- **Ein MCP-Server.** `markitdown-mcp` stellt das Ganze vor einen Assistenten, und das ist [der billigste Weg, ein Dokument in ein Gespräch zu bekommen](/blog/what-a-document-costs-an-assistant), wenn die Datei schon auf dem Rechner liegt, den der Assistent erreicht.

## Wo diese Seite steht

TransformPipe ist die browserseitige Antwort auf Grund eins. Fünfzehn Konvertierungen — Word, PowerPoint, EPUB, Tabellen, HTML, CSV, JSON sowie Notion-, Confluence-, Obsidian- und Evernote-Exporte — laufen in der Seite, ohne dass etwas hochgeladen wird, und dieselben Konverter stehen hinter einer API, einem CLI, einer Browser-Erweiterung für die Seite, die Sie gerade lesen, und einem MCP-Server für einen Assistenten.

Die ehrlichen Grenzen, im Geist derselben Bereichsnotiz von oben: **PDF gibt es hier gar nicht**, in keiner Richtung, und es wird es nicht geben — ein PDF annehmbar zu lesen heißt Layout-Modelle und OCR, das heißt einen Server, und das nähme genau die eine Eigenschaft weg, für die sich ein Browser-Konverter lohnt. Kein Audio, kein Video, kein YouTube. Und die Ausgabe ist Markdown und HTML statt einer Formatmatrix; eine `.docx` kommt wieder heraus, aber Pandocs Umfang nicht.

Lautet die Antwort auf „wo läuft das“ „in einem Python-Prozess neben den Dateien“, installieren Sie MarkItDown. Lautet sie „in dem Tab, den ich gerade ansehe“, ist nichts davon für Sie — und genau dafür gibt es diese Liste.
