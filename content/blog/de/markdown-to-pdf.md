---
title: "Markdown zu PDF: jeder Weg und was er kostet"
description: "Jeder Weg von Markdown zu PDF im Vergleich - Drucken aus dem Browser, Pandoc mit LaTeX, wkhtmltopdf, WeasyPrint, headless Chrome - und was dabei bricht"
updated: 2026-10-21
date: 2026-09-01
tag: Veröffentlichen
keywords: markdown zu pdf, md in pdf umwandeln, markdown pdf konverter, pandoc markdown zu pdf, markdown zu pdf kommandozeile, markdown als pdf drucken, md zu pdf ohne installation
---

### Kurzfassung

Es gibt keine direkte Markdown-zu-PDF-Konvertierung; jedes Werkzeug geht über ein Zwischenformat, und welches es wählt, entscheidet, wie Ihr PDF aussieht. Für ein einzelnes Dokument, das Sie jetzt brauchen, konvertieren Sie zu einer vollständigen HTML-Datei und drucken Sie sie aus dem Browser: das ist die beste Typografie, die es kostenlos gibt, und der Druckdialog ist, wo Sie Papiergröße und Ränder festlegen. Für ein langes Dokument mit nummerierten Abschnitten, laufenden Kopfzeilen und einem Inhaltsverzeichnis mit Seitenzahlen installieren Sie Pandoc und eine LaTeX-Engine und akzeptieren die Größe der Installation. Für einen Build, der ohne eine Person darin läuft, nutzen Sie headless Chrome oder WeasyPrint, und setzen Sie die Seitenregeln in CSS statt in einem Dialog, den niemand da sein wird zu klicken.

Markdown hat keine Seiten. Es hat Überschriften, Absätze, Listen und Code, und es sagt nichts darüber, wo ein Blatt Papier endet und das nächste beginnt. PDF ist das Gegenteil: eine feste Seitengröße, ein fester Rand, ein Umbruch zwischen Seite vier und Seite fünf, und jede Schriftart, die es nutzt, in der Datei mitgeführt. Zwischen den beiden zu konvertieren ist keine Übersetzung, es ist eine Erfindung. Irgendetwas muss die Papiergröße entscheiden, die Ränder, wo die Tabelle sich teilt und welche Schrift eingebettet wird, und wenn Sie es nicht entscheiden, entscheidet das Werkzeug für Sie.

Deshalb erzeugt dieselbe `.md`-Datei vier verschiedene PDFs aus vier verschiedenen Werkzeugen, und die Unterschiede sind nicht kosmetisch. Eines setzt Ihre Codeblöcke auf einen grauen Hintergrund, ein anderes druckt sie auf Weiß mit den langen Zeilen, die am Rand abgeschnitten sind. Eines nummeriert die Seiten, ein anderes druckt die URL der Datei und das gestrige Datum quer über den Kopf. Eines bettet die von Ihnen gewählte Schrift ein, ein anderes ersetzt sie durch eine Ausweichschrift und sagt es Ihnen nicht.

Es gibt vier Wege, und nur vier. Zu HTML konvertieren und aus einem Browser drucken. Zu LaTeX konvertieren und setzen. Zu HTML konvertieren und einer eigenen HTML-zu-PDF-Engine übergeben. Oder die Datei in einem Editor mit einem Exportmenü öffnen. Alles andere ist eine dieser vier mit einer anderen Verpackung darum, jeder Online-Konverter eingeschlossen, der ein PDF mit einem Klick verspricht.

## Kurzvergleich: das Cheat Sheet

| Weg | Am besten für | Was er braucht | Kontrolle über die Seite | Lizenz und Preis |
| --- | --- | --- | --- | --- |
| HTML, dann aus dem Browser drucken | Ein Dokument, jetzt gleich | Ein Browser, den Sie schon haben | Papier, Ränder, Skalierung, Hintergründe - aus einem Dialog | Kostenlos |
| Pandoc + pdflatex | Reine Prosa, keine ungewöhnlichen Glyphen | Pandoc plus eine TeX-Installation | Total, über Template-Variablen | Kostenlos, GPL; TeX Live kostenlos |
| Pandoc + xelatex oder lualatex | Systemschriften, nicht-lateinische Schriften, Mathematik | Dasselbe, plus die Schriften | Total | Kostenlos, GPL |
| Pandoc + Typst | Eine LaTeX-Qualität ohne TeX-Installation | Pandoc plus die Typst-Binärdatei | Total, über Typsts eigene Syntax | Kostenlos; Typst ist Apache 2.0 |
| Pandoc + WeasyPrint | CSS, das Sie schon können, mit echten Seitenregeln | Python plus WeasyPrint | Total, über CSS Paged Media | Kostenlos, BSD |
| WeasyPrint auf Ihrem eigenen HTML | Laufende Kopfzeilen, Seitenzähler, PDF-Lesezeichen | Python plus WeasyPrint | Total, über CSS | Kostenlos, BSD |
| wkhtmltopdf | Ein Skript, das es schon aufruft | Eine einzelne Binärdatei | Gut, über Kommandozeilen-Flags | Kostenlos, LGPLv3; Repository archiviert |
| Headless Chrome | Ein Build-Schritt, oder viele Dateien auf einmal | Chrome oder Chromium installiert | Über Print-CSS im Dokument | Kostenlos |
| Puppeteer | Dasselbe, skriptgesteuert, mit Rändern im Code | Node plus ein Chromium-Download | Total, über die API | Kostenlos, Apache 2.0 |
| Typora | Schreiben und Exportieren in einer Anwendung | Eine bezahlte Desktop-Installation | Die des Themes, plus eine Seiteneinrichtung | 14,99 $ einmalig, bis zu drei Geräte |
| Obsidian | Ein Vault, in dem Sie schon schreiben | Eine Desktop-Installation | Die des Themes | Kostenlos; optionale kommerzielle Lizenz |
| VS-Code-Erweiterung | Die Datei ist schon in Ihrem Editor offen | Eine Erweiterung, oft ein Chromium | Was die Erweiterung offenlegt | Kostenlos, erweiterungsabhängig |
| Markdown zu `.docx`, dann Word oder LibreOffice | Jemand muss es danach bearbeiten | Pandoc plus eine Office-Suite | Die Seiteneinrichtung der Office-Suite | Kostenlos mit LibreOffice |

Preise geprüft auf typora.io und obsidian.md, 8. September 2026. Der Hinweis zum wkhtmltopdf-Repository wurde auf github.com geprüft, 8. September 2026.

## Zu HTML konvertieren, dann aus dem Browser drucken

Das ist der Weg, den die meisten Menschen für ein einzelnes Dokument nehmen sollten, und der, dem sie misstrauen, weil er sich zu einfach anfühlt. Konvertieren Sie das Markdown zu einer vollständigen HTML-Datei - kein Fragment, ein Dokument mit einem Doctype, einem Head und seinen Styles inline -, öffnen Sie es, und drücken Sie das Drucken-Tastenkürzel. Wählen Sie „Als PDF speichern“ als Ziel.

Die Typografie ist der Grund, es so zu tun. Die Druckausgabe eines Browsers kommt aus derselben Layout-Engine, die jede Seite rendert, die Sie sich ansehen: echtes Kerning, Ligaturen, korrekter Zeilenumbruch, Vektortext bei jedem Zoom, und Schriftsubsets, eingebettet in das entstehende PDF. Nichts Kostenloses macht es besser, und manches Kostenpflichtige macht es schlechter. Wenn das Dokument `lang` am Wurzelelement setzt und `hyphens: auto` in seinem Stylesheet, bekommen Sie auch Silbentrennung, was der Unterschied zwischen einem Blocksatzabsatz ist, der sich gut liest, und einem voller Flussstellen.

Der Tausch ist, dass Ihre gesamte Kontrolle in einer Dialogbox lebt, und die Dialogbox lohnt sich zu verstehen, denn vier ihrer Regler ändern still Ihr Dokument.

| Regler | Was er tatsächlich tut | Warum es zählt |
| --- | --- | --- |
| Ziel | Wählt einen physischen Drucker oder „Als PDF speichern“ | Nur „Als PDF speichern“ erzeugt eine Datei; das PDF eines Druckertreibers kann Text rastern |
| Papierformat | A4, Letter, Legal und der Rest | A4 ist 210 mal 297mm, Letter ist 8,5 mal 11 Zoll; ein auf eines abgestimmtes Layout fließt auf dem anderen anders |
| Ränder | Standard, Keine, Minimum, Benutzerdefiniert | „Keine“ lässt Inhalt bis an den Papierrand laufen, was die meisten physischen Drucker nicht reproduzieren können |
| Skalierung | „An druckbaren Bereich anpassen“, oder ein Prozentsatz | Anpassen schrumpft alles, eine zu breite Tabelle macht den Fließtext also kleiner als eingestellt |
| Hintergrundgrafiken | Standardmäßig aus | Das ist der Regler, der Ihre Codeblock-Schattierung und Tabellenstreifung entfernt |
| Kopf- und Fußzeilen | Aus oder an | An druckt den Seitentitel, den Speicherort der Datei, das Datum und eine Seitenzahl, in der eigenen Schrift des Browsers |

Zwei dieser Standardwerte verursachen die meisten Beschwerden über browsergedruckte PDFs. Hintergrundgrafiken sind aus, weil Druckertinte teuer ist, und der Effekt bei einem technischen Dokument ist, dass jeder schattierte Codeblock, jeder farbige Hinweiskasten und jede gestreifte Tabelle flach weiß herauskommt. Schalten Sie es ein. Kopf- und Fußzeilen sind eine Annehmlichkeit zum Drucken einer Webseite und ein Fehler bei allem, was Sie jemandem sonst schicken: es stempelt einen `file:///Users/sie/Downloads/…`-Pfad quer über die erste Seite. Schalten Sie es aus.

Das eigene CSS des Dokuments kann davon etwas zurücknehmen. Ein Stylesheet, das `@page { size: A4; margin: 20mm; }` deklariert, gibt dem Dialog einen vernünftigen Ausgangspunkt, und `@media print`-Regeln lassen Sie Navigation weglassen, eingeklappte Abschnitte ausklappen und Farben erzwingen, die einen Schwarzweißdrucker überleben. Dort setzen Sie auch `break-inside: avoid`, damit eine Tabelle oder Abbildung aufhört, über eine Seitengrenze zu brechen.

| Vorteile | Nachteile |
| --- | --- |
| Die beste kostenlose Typografie, die es gibt | Eine Person muss sich durch einen Dialog klicken, es ist also kein Build-Schritt |
| Keine Installation, und kein Upload, wenn die Konvertierung im Browser läuft | Keine laufenden Kopf- oder Fußzeilen eigenen Designs |
| Das PDF entsteht aus einer Datei, die Sie behalten und erneut drucken können | Kein Inhaltsverzeichnis mit Seitenzahlen, und keine Querverweise |
| Zwei Regler von korrekt entfernt, sobald Sie wissen, welche zwei | Ein Dokument auf einmal |

**Wer sollte das nutzen?** Jeder mit einem Dokument und einer Empfängerin. Ein Konverter, der Ihnen selbstständiges HTML mit inline gesetzten Styles gibt, macht das zu einer Zwei-Schritt-Sache, und [was mit Ihrer Datei auf dem Weg passiert](/blog/markdown-to-html-converter) lohnt sich zu lesen, bevor Sie der Ausgabe eines davon vertrauen. TransformPipe macht die Konvertierung in Ihrem Browser und druckt durch denselben Dialog, weshalb es auf dieser Liste steht statt darin: das PDF ist die Arbeit des Browsers, nicht die des Konverters.

## Pandoc mit einer LaTeX-Engine

`pandoc report.md -o report.pdf` ist der Befehl, den alle zitieren, und er ist auf eine bestimmte Art irreführend: Pandoc macht keine PDFs. Es konvertiert Ihr Markdown zu LaTeX und ruft dann eine externe Satz-Engine auf, die das ist, was tatsächlich die Datei erzeugt. Ist diese Engine nicht installiert, schlägt der Befehl fehl, und der Fehler benennt eine Binärdatei, von der Sie noch nie gehört haben.

Diese Umleitung ist auch die Quelle der Qualität. TeX setzt seit den 1980ern Mathematik und lange Prosa, und sein Zeilenumbruch-Algorithmus optimiert ganze Absätze statt einer Zeile nach der anderen. Für eine Abschlussarbeit, ein Handbuch, einen Vertrag oder alles mit nummerierten Abschnitten und Gleichungen bleibt es die beste Ausgabe auf dieser Seite.

### Welche Engine, und was ihre Installation kostet

| Engine | Ausgewählt mit | Nutzen Sie sie, wenn | Kosten |
| --- | --- | --- | --- |
| pdflatex | Der Standard | Reine englische Prosa, keine ungewöhnlichen Glyphen | Eine TeX-Installation |
| xelatex | `--pdf-engine=xelatex` | Sie Systemschriften wollen, oder nicht-lateinische Schriften | Dasselbe, plus die Schriften |
| lualatex | `--pdf-engine=lualatex` | Dasselbe, mit Lua-Scripting im Template | Dasselbe |
| Typst | `--pdf-engine=typst` in aktuellem Pandoc | Sie eine schnelle, kleine Installation statt TeX wollen | Eine Binärdatei, Apache 2.0 |
| WeasyPrint | `--pdf-engine=weasyprint` | Sie lieber CSS als LaTeX schreiben | Python und eine pip-Installation |
| wkhtmltopdf | `--pdf-engine=wkhtmltopdf` | Eine bestehende Pipeline erwartet es | Eine Binärdatei, unbetreut |

Die Installation ist der echte Preis, und man sollte offen darüber sein. Eine vollständige TeX-Distribution ist bei weitem die größte Abhängigkeit in jeder Dokument-Toolchain, die die meisten Menschen zusammenstellen; sie wird in Gigabyte gemessen und braucht eine Weile. Die kleinen Distributionen - BasicTeX, TinyTeX - installieren in einem Bruchteil des Platzes und scheitern dann beim ersten Mal, wenn Ihr Dokument ein Paket braucht, das sie ausgelassen haben. Der Fehler ist immerhin lesbar: LaTeX stoppt und benennt die fehlende `.sty`-Datei, und `tlmgr install <paket>` holt sie. Sie werden das vier- oder fünfmal tun, bevor ein erstes Dokument baut, und dann nie wieder auf dieser Maschine.

### Die Flags, die die Arbeit machen

| Flag | Wirkung |
| --- | --- |
| `-V geometry:margin=25mm` | Setzt den Seitenrand über das geometry-Paket |
| `-V mainfont="Source Serif 4"` | Wählt eine Systemschrift; braucht xelatex oder lualatex |
| `-V fontsize=11pt` | Textgröße, für die der Standard von 10pt selten passt |
| `-V documentclass=report` | Kapitel und eine Titelseite statt eines Artikels |
| `--toc` | Ein Inhaltsverzeichnis mit Seitenzahlen, aus Ihren Überschriften erzeugt |
| `--number-sections` | Nummeriert die Überschriften passend |
| `-V colorlinks=true` | Farbige Links statt der eingerahmten Standardkästen |
| `--highlight-style=tango` | Wählt das Syntaxhervorhebungsthema |
| `--include-in-header=head.tex` | Fügt rohes LaTeX ein, wie Sie zu echten laufenden Kopfzeilen kommen |

`--toc` und `--number-sections` zusammen sind der ehrliche Grund, den Browser hinter sich zu lassen. Ein Inhaltsverzeichnis, das „Migrationsschritte ... 14“ auflistet, kann ein Browser überhaupt nicht erzeugen, weil ein Browser nicht weiß, auf welcher Seite irgendetwas landet, bevor er es schon gedruckt hat.

### Was bricht

Lange Code-Zeilen sind das Erste, was verloren geht. LaTeX bricht wörtlichen Text nicht um, ein Shell-Befehl, breiter als der Textblock, läuft also über den rechten Rand des Papiers hinaus und ist einfach weg. Die Abhilfe ist eine Hervorhebungseinrichtung, die Zeilen umbricht, oder kürzere Zeilen in der Quelle; so oder so müssen Sie es bemerken, denn nichts warnt Sie. [Wie Codeblöcke zwischen Formaten reisen](/blog/code-blocks-in-markdown) behandelt die breitere Version dieses Problems.

Breite Tabellen scheitern genauso und sichtbarer. Unicode ist die zweite Falle: pdflatex stammt aus der Zeit vor Unicode, ein Dokument mit einem geschwungenen Anführungszeichen aus einer Textverarbeitung, einem griechischen Buchstaben, einem chinesischen Namen oder einem Emoji stoppt also mit einem Fehler über ein undefiniertes Zeichen. Der Wechsel zu xelatex behebt das meiste davon; Emojis erscheinen trotzdem nicht, weil es keine einfarbige Kontur dafür in einer normalen Textschrift gibt.

| Vorteile | Nachteile |
| --- | --- |
| Die beste kostenlose Ausgabe für lange Dokumente | Die größte Installation aller Wege hier |
| Ein Inhaltsverzeichnis mit Seitenzahlen, und Querverweise | LaTeX-Fehler sind berühmt schwer zu lesen |
| Wiederholbar: derselbe Befehl gibt dieselbe Datei | Template-Anpassung heißt, LaTeX zu lernen |
| Ein Befehl konvertiert auch zu HTML, DOCX und EPUB | Rohes HTML im Markdown wird ignoriert, nicht gerendert |

**Wer sollte das nutzen?** Jeder, der ein Dokument produziert, das auf Papier gelesen, gebunden oder irgendwo mit Formatierungsregeln eingereicht wird. Auch jeder, der jede Woche dasselbe PDF baut, weil der Befehl die Spezifikation ist und nicht driftet.

## HTML-zu-PDF-Engines: wkhtmltopdf, headless Chrome und WeasyPrint

Diese sitzen zwischen den zwei Wegen oben. Sie konvertieren noch zu HTML, aber ein Programm druckt es statt einer Person, was heißt, es kann in einem Build laufen. Sie unterscheiden sich darin, welche Layout-Engine sie nutzen, und diese eine Tatsache bestimmt, was Ihr CSS enthalten darf.

| Engine | Layout-Engine | Kopf- und Fußzeilen | Modernes CSS | Betreut |
| --- | --- | --- | --- | --- |
| wkhtmltopdf | Qt WebKit, ein alter Fork | Ja, über Flags, mit Seitenvariablen | Unzuverlässig | Repository archiviert, Januar 2023 |
| Headless Chrome | Aktuelles Chromium | Nur das eigene Band des Browsers, oder über Puppeteer-Templates | Alles, was ein Browser tut | Ja |
| WeasyPrint | Eigene, in Python geschrieben für Paginierung | Ja, über CSS-Margin-Boxen | Teilweise: Flexbox und Grid sind eingeschränkt | Ja |

### wkhtmltopdf

wkhtmltopdf ist ein Kommandozeilenwerkzeug, das HTML mit der Qt-WebKit-Rendering-Engine rendert und unter LGPLv3 veröffentlicht wird (geprüft auf wkhtmltopdf.org, 8. September 2026). Sein GitHub-Repository trägt den Hinweis „This repository was archived by the owner on Jan 2, 2023. It is now read-only“ (geprüft auf github.com, 8. September 2026).

Seine Kommandozeilenoberfläche ist wirklich gut, und besser als die eines Browsers für diesen Job: `--margin-top` und seine Geschwister setzen Ränder in echten Einheiten, `--header-html` und `--footer-html` nehmen HTML-Dateien, `--footer-center "[page]/[topage]"` gibt Ihnen „3/12“ unten auf jeder Seite, `--print-media-type` lässt es Ihre `@media print`-Regeln beachten, und `--enable-local-file-access` ist nötig, bevor es Bilder und Stylesheets von der Platte liest. Wenn Sie ein Skript haben, das mit diesen Flags schon akzeptable PDFs erzeugt, gibt es keine Dringlichkeit, es zu ersetzen.

Das Problem ist die Engine darunter. Es ist ein Fork eines WebKit, das seit Jahren stillsteht, ein in diesem Jahrzehnt geschriebenes Stylesheet - Custom Properties, Grid, modernes Flexbox-Verhalten - kann also als etwas rendern, das Sie nicht entworfen haben, ohne Fehler. Beginnen Sie hier keine neue Arbeit.

### Headless Chrome

`chrome --headless --print-to-pdf=out.pdf report.html` nutzt genau die Engine, die der Druckdialog nutzt, die Ausgabe stimmt also mit dem überein, was Sie am Bildschirm sahen. Das ist sein ganzes Argument, und es ist ein starkes.

Der Haken ist, dass die Kästchen des Dialogs nicht auf der Kommandozeile sind. Chrome wendet seine eigenen Standardränder an, und ob es das URL- und Seitenzahlband stempelt, hängt von einem Flag ab, dessen Name sich zwischen Versionen geändert hat - führen Sie `chrome --help` auf der Version aus, die Sie haben, statt ein Flag aus einem Blogpost zu kopieren. Alles andere, was Sie wollen, muss im eigenen Print-CSS des Dokuments stehen, was ohnehin der richtige Ort dafür ist.

Puppeteer nimmt das Raten weg. Sein `page.pdf()`-Aufruf nimmt `format`, `margin`, `printBackground`, `displayHeaderFooter`, `headerTemplate` und `footerTemplate`, Papiergröße, Ränder und eine laufende Fußzeile leben also im Code neben allem anderen in Ihrem Build. `printBackground: true` ist die Abhilfe für die fehlende Codeblock-Schattierung, die jeden beim ersten Mal erwischt. Puppeteer ist kostenlos und Apache-2.0-lizenziert; es lädt sein eigenes Chromium herunter, was ein großer einmaliger Preis in einem CI-Cache ist.

### WeasyPrint

WeasyPrint ist eine Python-Bibliothek und ein Kommandozeilenwerkzeug, BSD-lizenziert, und es ist kein Browser. Seine Dokumentation sagt, es sei „basierend auf verschiedenen Bibliotheken, aber nicht auf einer vollständigen Rendering-Engine wie WebKit oder Gecko“, mit einer in Python geschriebenen CSS-Layout-Engine, entworfen für Paginierung (geprüft auf doc.courtbouillon.org, 8. September 2026).

Diese Design-Entscheidung ist der Punkt. Es unterstützt die `@page`-Regel mit den Selektoren `:left`, `:right`, `:first` und `:blank`, Seiten-Margin-Boxen, seitenbasierte Zähler, und die Eigenschaften `bookmark-level`, `bookmark-label` und `bookmark-state`, die das Inhaltsverzeichnis des PDF bauen - Überschriften werden standardmäßig zu Lesezeichen. Interne Anker und externe URLs kommen beide als klickbare Links heraus (alles geprüft auf doc.courtbouillon.org, 8. September 2026). Browser implementieren keine der Margin-Box-Mechanismen, das ist also der einzige Weg auf dieser Seite, der Ihnen eine echte laufende Kopfzeile in CSS gibt statt in LaTeX.

Der Preis ist die andere Hälfte derselben Entscheidung. Die eigene Dokumentation beschreibt Flexbox als funktionierend „für einfache Anwendungsfälle, aber nicht tiefgehend getestet“ und Grid als funktionierend „für einfache Fälle, aber mit einigen Einschränkungen“ (geprüft auf doc.courtbouillon.org, 8. September 2026). Geben Sie ihm ein Dokument, kein Anwendungslayout, und es ist ausgezeichnet.

**Wer sollte diese nutzen?** Jeder, dessen PDF von einer Maschine nach Zeitplan produziert werden muss: ein nächtlicher Bericht, eine erzeugte Rechnung, ein PDF, das jeder Veröffentlichung angehängt wird. Wählen Sie Chrome oder Puppeteer, wenn das Dokument schon eine Webseite ist, die Ihnen gefällt; wählen Sie WeasyPrint, wenn Sie laufende Kopfzeilen, Seitenzähler und Lesezeichen brauchen und lieber CSS als LaTeX schreiben würden.

## Editoren, die ein PDF direkt exportieren

Der kürzeste Weg von allen, wenn die Datei schon vor Ihnen offen ist. Jeder dieser ist einer der Wege oben mit einem Menüpunkt obendrauf - die meisten von ihnen sind eine gebündelte Browser-Engine - die Frage ist also nur, ob der Export gut genug ist und ob Sie ihn wiederholen können.

| Editor | Wie er exportiert | Preis und Lizenz |
| --- | --- | --- |
| Typora | „Export to PDF with bookmarks“, plus docx, LaTeX, EPUB und andere | 14,99 $ ohne Steuer, eine Lizenz für bis zu 3 Geräte, 15-tägige kostenlose Testphase (geprüft auf typora.io, 8. September 2026) |
| Obsidian | Eingebauter Export nach PDF aus der Notiz | Kostenlos für jeden Zweck, kommerzielle Nutzung eingeschlossen; eine kommerzielle Lizenz ist optional für 50 $ pro Nutzer und Jahr (geprüft auf obsidian.md/pricing, 8. September 2026) |
| VS Code | Eine Erweiterung; die meisten bündeln oder laden ein Chromium und drucken damit | Kostenlos, aber die Qualität der Erweiterung ist die der Erweiterung |
| Word oder LibreOffice | Markdown mit Pandoc zu `.docx` konvertieren, dann aus der Suite exportieren | Kostenlos mit LibreOffice |

Preise und Bedingungen geprüft auf typora.io und obsidian.md, 8. September 2026.

VS Code ist der einzige Editor in der Tabelle ohne eigenen PDF-Export. Markdown PDF ist eine Erweiterung, die ihn nachrüstet: Sie steuert einen Chromium-basierten Browser über Puppeteer und schreibt aus denselben Einstellungen auch HTML, PNG oder JPEG, und das Stylesheet der Vorschau ist nicht das, mit dem sie druckt — [Markdown zu HTML in VS Code](/blog/markdown-to-html-in-vs-code) geht diese Einstellungen durch und zeigt, was jeder Exportweg um die Seite legt.

| Vorteile | Nachteile |
| --- | --- |
| Ein Menüpunkt, kein Terminal, keine Dialog-Archäologie | Die Gestaltung ist das Thema des Editors, nicht Ihres Dokuments |
| Das Thema ist meist fürs Lesen entworfen, der Standard sieht also gut aus | Nicht skriptbar, kann also nicht Teil eines Builds sein |
| Lesezeichen und eine klickbare Gliederung bei den besseren | An diese Anwendung gebunden, auf dieser Maschine |
| Der `.docx`-Umweg hinterlässt eine Datei, die jemand bearbeiten kann | Jeder Sprung durch ein weiteres Format verliert etwas |

Der `.docx`-Umweg verdient eine eigene Anmerkung, denn er löst ein Problem, das kein anderer Weg löst. Wenn die Person, die das Dokument bekommt, es ändern will, ist ein PDF eine Sackgasse und eine Word-Datei nicht. `pandoc report.md -o report.docx --reference-doc=house-style.docx` wendet Ihre eigenen Stile an, und LibreOffice konvertiert das Ergebnis auf einem Server mit `soffice --headless --convert-to pdf report.docx`. Zwei Konvertierungen sind eine mehr als ideal, und es ist der Preis, jemandem etwas zu geben, das er bearbeiten kann — und wenn die `.docx` das Endprodukt ist statt eines Zwischenstopps, [Markdown in eine Word-Datei zu bringen, die jemand bearbeiten kann](/blog/markdown-to-word) ist, wo das Referenzdokument, die Stile, nach denen Pandoc sucht, und der Preis der Rückreise sauber durchgearbeitet werden.

**Wer sollte das nutzen?** Autoren, für Entwürfe und für alles, wo „sieht vernünftig aus“ die Messlatte ist. Nicht Builds, und nicht Dokumente mit einem Corporate Design, das eingehalten werden muss.

## Die Teile, die Leute falsch machen

Fünf Dinge brechen in aus Markdown gemachten PDFs, und sie brechen gleich, egal welchen Weg Sie genommen haben.

| Symptom | Ursache | Abhilfe |
| --- | --- | --- |
| Codeblöcke und Tabellen haben ihre Schattierung verloren | „Hintergrundgrafiken“ ist standardmäßig aus im Druckdialog | Einschalten, oder `printBackground: true` in Puppeteer übergeben |
| Eine Überschrift sitzt allein am Ende einer Seite | Nichts hat der Engine gesagt, sie bei ihrem Text zu halten | `break-after: avoid` auf Überschriften, `break-inside: avoid` auf Tabellen und Abbildungen |
| Der Fließtext kam kleiner heraus als erwartet | „An druckbaren Bereich anpassen“ hat das ganze Dokument geschrumpft, um ein breites Element einzupassen | Das zu breite Element finden und beheben, dann bei 100% drucken |
| Die erste Seite hat einen Dateipfad quer oben | „Kopf- und Fußzeilen“ ist an | Ausschalten, oder eine Engine nutzen, bei der Sie die Fußzeile kontrollieren |
| Lange Code-Zeilen sind am Rand abgeschnitten | LaTeX bricht wörtlichen Text nicht um | Zeilen in der Quelle brechen, oder einen Weg mit weichem Umbruch nutzen |
| Bilder fehlen komplett | Relative Pfade, die dort nicht mehr auflösen, wo das HTML sitzt | Bilder einbetten, oder mit der Datei an Ort und Stelle konvertieren |
| Ein Zeichen kam als Kästchen heraus, oder gar nicht | Die eingebettete Schrift hat kein Glyph dafür | Die Schrift wechseln, oder die Engine, und beim Drucken keine Emojis nutzen |
| Jede Seite ist A4 auf Ihrer Maschine und Letter auf der anderen | Keine Seitengröße im Dokument, die Engine nutzte also einen Locale-Standard | `@page { size: A4 }` deklarieren, oder die Größe ausdrücklich übergeben |

### Seitenumbrüche

Markdown hat keinen Seitenumbruch. Es gibt keine Syntax dafür, keine Erweiterung, die einen portabel hinzufügt, und keine Menge Leerzeilen wird es tun. Sie erzwingen einen Umbruch, indem Sie rohes HTML in die Markdown-Datei setzen:

```markdown
Text vor dem Umbruch.

<div style="break-after: page"></div>

Text auf der nächsten Seite.
```

`break-after: page` ist die aktuelle CSS-Eigenschaft; `page-break-after: always` ist der ältere Alias, den ältere Engines noch wollen, und beide anzugeben ist harmlos. Zwei Dinge gehen dann schief. Das Erste ist, dass ein Konverter, der rohes HTML ignoriert - Pandocs LaTeX-Weg darunter - Ihr `div` fallen lässt und den Umbruch damit; unter LaTeX wollen Sie stattdessen `\newpage` in einem Raw-Block. Das Zweite ist, dass ein Konverter, der sanitisiert, das `style`-Attribut entfernt, weil Inline-Styles genau das sind, was eine Allow-Liste entfernt, und Ihr Umbruch verschwindet ohne Warnung. [Warum Sanitisieren mehr entfernt als Skripte](/blog/sanitising-markdown-safely) erklärt, was üblicherweise überlebt und was nicht.

### Ränder

Drei Parteien setzen Ihre Ränder, und nur eine davon gewinnt: der Druckdialog, die `@page`-Regel des Dokuments, und der nicht bedruckbare Rand des physischen Druckers. Entscheiden Sie, welche maßgeblich ist, und lassen Sie die anderen in Ruhe. Für ein PDF, das am Bildschirm gelesen wird, setzen Sie den Rand ins CSS und den Dialog auf Standard. Für ein PDF, das auf einem bestimmten Gerät gedruckt wird, lassen Sie mindestens 10mm und testen Sie auf diesem Gerät, denn „Ränder: Keine“ erzeugt eine Datei, deren Ränder ein Laserdrucker beschneiden wird.

### Kopf- und Fußzeilen

Das ist die klarste Trennlinie zwischen den Wegen. Der Browser gibt Ihnen ein Band, mit für Sie gewähltem Inhalt und Schriftart, an oder aus. Alles andere - ein Dokumenttitel links, eine Seitenzahl rechts, nichts auf der ersten Seite - braucht CSS-Margin-Boxen, die Browser nicht implementieren, oder LaTeX, das es über ein Paket macht. Wenn Ihr Dokument eine laufende Kopfzeile tragen muss, haben Sie sich für WeasyPrint oder LaTeX entschieden, ob Sie wollten oder nicht.

### Überlebende Links

Klickbare Links in einem PDF sind Annotationen, die über den Text gelegt werden, und ob sie geschrieben werden, hängt von der Engine ab, die einzig zuverlässige Prüfung ist also, das fertige PDF zu öffnen und einen anzuklicken. Interne Links - ein Inhaltsverzeichnis zu einer Überschrift - hängen davon ab, dass das HTML den Überschriften IDs gegeben hat, was nicht jeder Konverter tut. Für ein Dokument, das auf Papier gedruckt wird, sind Links unsichtbar, und eine Druckregel behebt es:

```css
@media print {
  a[href^="http"]::after {
    content: " (" attr(href) ")";
  }
}
```

Das druckt die URL in Klammern hinter dem Linktext, was am Bildschirm hässlich ist und auf Papier die einzige lesbare Option. Relative Links und Bilder haben ihren eigenen Fehlermodus, denn ein PDF kann `../images/diagram.png` im Nachhinein nicht auflösen: [Pfade, die weiter funktionieren, wenn die Datei sich bewegt](/blog/images-and-links-that-still-work) ist die Version dieses Problems, der Sie zuerst begegnen.

### Schrift-Einbettung

Ein PDF trägt eine Teilmenge jeder Schrift, die es tatsächlich nutzt, was es überall gleich aussehen lässt - und es kann nur eine Schrift tragen, die verfügbar war, als die Datei entstand. Zwei Fehlermodi folgen daraus. Ein Dokument, das eine Webschrift über das Netzwerk anfordert, konvertiert ohne verfügbares Netzwerk, fällt still auf etwas anderes zurück und bettet das stattdessen ein; das PDF ist nicht kaputt, es ist nur nicht Ihr Design. Ein Dokument, das einen Font-Stack aus Systemschriften nennt, bettet ein, was auch immer diese bestimmte Maschine hatte, Sie und eine Kollegin erzeugen also optisch unterschiedliche PDFs aus demselben Markdown und demselben Befehl.

Die Abhilfe ist, ausdrücklich zu sein. Nennen Sie eine Schrift, liefern Sie sie mit dem Dokument aus oder installieren Sie sie auf der Build-Maschine, und lassen Sie den Stack auf eine generische Serife zurückfallen, die vorhersehbar ersetzt wird. Prüfen Sie das Ergebnis: jeder PDF-Reader listet die eingebetteten Schriften in seinen Dokumenteigenschaften, und eine als „Type 3“ oder als nicht eingebettet gelistete Schrift ist eine Schrift, die Ihre Leserin nicht sehen wird.

## Wo der Browser-Weg scheitert, und was es kostet, ihn zu verlassen

Aus dem Browser zu drucken ist der richtige Standard, und er hat eine harte Obergrenze. Es lohnt sich, die Obergrenze genau zu benennen, denn die meisten Menschen müssen nicht darüber hinaus, und die, die es müssen, sollten wissen, was sie kaufen.

| Was Sie in einem Browser nicht können | Warum | Was es kostet, es zu beheben |
| --- | --- | --- |
| Eine laufende Kopf- oder Fußzeile eigenen Designs | Browser implementieren keine CSS-Margin-Boxen | WeasyPrint, oder LaTeX über Pandoc |
| Ein Inhaltsverzeichnis mit Seitenzahlen | Die Seite, auf der eine Überschrift landet, ist erst nach dem Layout bekannt | Pandocs `--toc`, oder eine Engine mit Seitenzählern |
| Ein Querverweis wie „siehe Seite 14“ | Derselbe Grund | LaTeX, oder WeasyPrints Zähler |
| Die Datei unbeaufsichtigt erzeugen | Ein Dialog braucht eine Person | Headless Chrome, Puppeteer, oder WeasyPrint |
| Ein PDF aus zwölf Kapiteldateien | Der Browser druckt ein Dokument | Erst das Markdown zusammenführen, oder danach die PDFs |
| Garantieren, dass keine Überschrift verwaist | Kontrolle über Umbrüche ist über Engines hinweg approximativ | Manuelle Umbrüche, und eine Leserin, die prüft |

Jede Abhilfe hat einen Preis, und die Preise sind nicht gleichwertig. LaTeX kauft Ihnen die beste Seite auf dieser Liste für den Preis der größten Installation und einer Template-Sprache zum Lernen; das Template ist eine Einmalarbeit, aber eine echte, und jemand muss sie besitzen. WeasyPrint kauft Ihnen Seitenregeln in CSS für den Preis einer Python-Abhängigkeit und einer Layout-Engine, die kein Browser ist, ein um Grid herum gebautes Stylesheet muss also umgeschrieben werden. Headless Chrome kauft Ihnen Wiederholbarkeit für den Preis eines Browsers in Ihrem Build-Image, was nicht klein ist und aus denselben Sicherheitsgründen aktualisiert werden muss wie der Ihres Laptops. wkhtmltopdf kauft Ihnen bequeme Flags und übergibt Ihnen eine archivierte Abhängigkeit, was eine Schuld mit Fälligkeitsdatum ist.

Der Mehrdatei-Fall ist der, den Leute am schnellsten treffen und am wenigsten erwarten. Ein zwölfkapitliges Handbuch sind zwölf `.md`-Dateien, und ein PDF ist ein Dokument, etwas muss sie also verbinden - in der richtigen Reihenfolge, mit verschobenen Überschriftenebenen, damit das `#` von Kapitel zwei nicht mit dem Dokumenttitel konkurriert. [Viele Markdown-Dateien in ein Dokument zu verwandeln](/blog/merging-many-markdown-files) ist eine eigene Aufgabe, getrennt von der Konvertierung, und es in der falschen Reihenfolge zu tun ist, wie ein Inhaltsverzeichnis mit drei „Einleitung“-Einträgen endet.

## Wie man wählt

1. **Beginnen Sie damit, wer die Datei erzeugt.** Wenn eine Person das PDF macht, wenn es gebraucht wird, drucken Sie aus dem Browser und hören auf zu lesen; wenn eine Maschine es nach Zeitplan macht, brauchen Sie headless Chrome, Puppeteer oder WeasyPrint, denn eine Dialogbox lässt sich nicht automatisieren.
2. **Fragen Sie, ob das Dokument Seitenmobiliar braucht.** Laufende Kopfzeilen, nummerierte Kapitel und ein Inhaltsverzeichnis mit Seitenzahlen schließen den Browser ganz aus, und genau diese Anforderung rechtfertigt, LaTeX oder WeasyPrint zu installieren.
3. **Zählen Sie die Glyphen, bevor Sie die Funktionen zählen.** Ein Dokument mit Chinesisch, Griechisch, Kyrillisch oder mathematischer Notation scheitert unter pdflatex und funktioniert unter xelatex, und das beim ersten Build herauszufinden ist billiger, als es an der Deadline herauszufinden.
4. **Passen Sie die Engine an das CSS an, das Sie schon geschrieben haben.** Wenn Ihr Stylesheet Grid nutzt, wird nur eine Browser-Engine es korrekt anordnen; wenn es ein Dokument-Stylesheet mit `@page`-Regeln ist, macht WeasyPrint mehr damit als ein Browser kann.
5. **Entscheiden Sie, ob jemand es danach bearbeiten muss.** Ein PDF ist final, und wenn die Antwort ja ist, wollen Sie `.docx` in der Mitte der Pipeline, was das Werkzeug und den Aufwand ändert.
6. **Drucken Sie eine echte Seite und schauen Sie sie sich an.** Nicht die Vorschau - das fertige PDF, in einem anderen Reader geöffnet, mit geprüftem Schriftenpanel und einem angeklickten Link. Dieser eine Test fängt fehlende Hintergründe, ersetzte Schriften, tote Links und abgeschnittene Code-Zeilen auf einmal ab, und er dauert zwei Minuten.

## Fazit

PDF aus Markdown ist immer ein zweistufiger Job, und die ehrliche Frage ist, mit welchem Zwischenformat Sie streiten wollen. Für ein Dokument mit einer Empfängerin konvertieren Sie das Markdown zu einer vollständigen, selbstständigen HTML-Datei und drucken sie aus Ihrem Browser mit eingeschalteten Hintergründen und ausgeschalteten Kopfzeilen — wofür [TransformPipes Markdown-zu-HTML-Konvertierung](/) da ist, kostenlos, im Browser, ohne Upload, wenn Sie abgemeldet sind. Für ein langes Dokument mit Seitenmobiliar installieren Sie Pandoc und xelatex, schreiben das Template einmal und denken nie wieder daran. Für ein PDF, das ohne jemanden dabei entstehen muss, setzen Sie die Seitenregeln in CSS und lassen headless Chrome oder WeasyPrint das Drucken erledigen. Alle drei sind kostenlos; der Unterschied liegt ganz darin, was Sie bereit sind zu installieren und zu warten.

## FAQ

### Wie konvertiere ich Markdown zu PDF, ohne etwas zu installieren?

Konvertieren Sie das Markdown in einem browserbasierten Konverter zu einer vollständigen HTML-Datei, öffnen Sie die Datei, und drucken Sie sie mit dem eigenen Druckdialog Ihres Browsers zu PDF. Kein Paketmanager, kein Terminal, und mit einem Konverter, der clientseitig arbeitet, wird das Dokument nie hochgeladen. Denken Sie daran, Hintergrundgrafiken einzuschalten und Kopf- und Fußzeilen auszuschalten, bevor Sie speichern.

### Warum verliert mein PDF die Codeblock-Hintergründe?

Weil „Hintergrundgrafiken“ standardmäßig im Druckdialog aus ist, um Tinte bei physischen Druckern zu sparen. Es entfernt auch Tabellenstreifung und farbige Hinweiskästen, ein technisches Dokument sieht also flach und blass aus. Schalten Sie es im Dialog ein, oder übergeben Sie `printBackground: true`, wenn Sie über Puppeteer drucken.

### Wie erzwinge ich einen Seitenumbruch in Markdown?

Es gibt keine Markdown-Syntax dafür. Sie fügen rohes HTML ein - `<div style="break-after: page"></div>` - und hoffen, dass der Konverter es durchreicht, oder Sie fügen `\newpage` in einem rohen LaTeX-Block hinzu, wenn Sie über Pandoc konvertieren. Konverter, die sanitisieren, entfernen den Inline-Style, testen Sie den Umbruch also, statt anzunehmen, er habe überlebt.

### Ist Pandoc der beste Weg, Markdown zu PDF zu konvertieren?

Es erzeugt die besten langen Dokumente, und es ist die schwerste Option: `pandoc file.md -o file.pdf` braucht eine installierte LaTeX-Engine, und eine vollständige TeX-Distribution ist die größte Abhängigkeit in den meisten Dokument-Toolchains. Für einen Bericht mit nummerierten Abschnitten und einem Inhaltsverzeichnis lohnt es jedes Gigabyte. Für ein einseitiges Memo ist es mehr Werkzeug, als der Job braucht.

### Funktionieren Hyperlinks noch in einem aus Markdown erzeugten PDF?

Meist, aber es hängt von der Engine ab, öffnen Sie also die fertige Datei und klicken Sie einen an. Interne Links zu Überschriften funktionieren nur, wenn das Zwischen-HTML diesen Überschriften IDs gegeben hat, was nicht jeder Konverter tut. Für ein Dokument, das gedruckt wird, fügen Sie eine Druckregel hinzu, die die URL in Klammern nach jedem Link anhängt, denn ein klickbarer Link auf Papier ist nur unterstrichener Text.

### Warum sehen die Schriften im PDF anders aus als am Bildschirm?

Ein PDF bettet nur die Schriften ein, die im Moment seiner Entstehung verfügbar waren. Wenn das Dokument eine Schrift über das Netzwerk anforderte und das Netzwerk nicht da war, oder eine Systemschrift nannte, die Ihre Maschine hat und der Build-Server nicht, hat die Engine etwas ersetzt und es Ihnen nicht gesagt. Prüfen Sie die eingebetteten Schriften in den Dokumenteigenschaften Ihres PDF-Readers und nennen Sie eine Schrift, die Sie tatsächlich mitliefern.

### Kann ich ein PDF aus Markdown in einem CI-Job erzeugen?

Ja, und es gibt drei vernünftige Wege: Pandoc mit einem TeX-Image, headless Chrome oder Puppeteer gegen Ihr konvertiertes HTML, oder WeasyPrint. Chrome gibt eine mit einem Browser identische Ausgabe und braucht einen Browser im Image; WeasyPrint ist eine kleine Python-Abhängigkeit und gibt Ihnen echte Seitenregeln in CSS. Was auch immer Sie wählen, setzen Sie Papiergröße und Ränder ins Dokument statt in Flags, damit dieselbe Datei von Hand gleich druckt.
