---
title: "Markdown zu Word: wie man eine .docx bekommt, die jemand bearbeiten kann"
description: "Markdown in eine .docx bringen, die man bearbeiten kann: Pandoc mit Referenzdokument, der HTML-Weg, Google Docs, und was die Rückreise zu Markdown verliert"
updated: 2026-10-21
date: 2026-08-24
tag: Veröffentlichen
keywords: markdown zu word, markdown zu docx, markdown in word dokument umwandeln, pandoc referenz docx, md zu docx, markdown zu word online, pandoc markdown word vorlage
---

Niemand konvertiert Markdown zu Word zum eigenen Vergnügen. Es passiert, weil jemand anderes — eine Anwältin, eine Kundin, eine Abteilungsleiterin, eine Aufsichtsbehörde — in Word arbeitet, Änderungen in Word nachverfolgt, und keine Datei lesen wird, die als Text mit Doppelkreuzen ankommt. Die Konvertierung ist ein Zugeständnis, und die Frage ist, welches Zugeständnis am wenigsten kostet.

### Kurzfassung

Nutzen Sie Pandoc mit einem Referenzdokument: `pandoc report.md --reference-doc=house.docx -o report.docx`. Das Referenzdokument ist eine gewöhnliche `.docx`, deren Stile Pandoc in die Ausgabe kopiert, die Datei, die Ihre Reviewerin öffnet, trägt also die Überschriften, Ränder und den Fließtext Ihrer Organisation statt Pandocs Standardwerte. Der Weg über HTML-konvertieren-dann-in-Word-öffnen ist schneller und erzeugt ein Dokument ohne brauchbaren Stilsatz, was für ein Memo in Ordnung ist und für alles falsch, das neu gestaltet wird. Und wissen Sie, bevor Sie anfangen, dass die Rückreise verlustbehaftet ist: nachverfolgte Änderungen können aus der zurückgegebenen `.docx` ausgelesen werden, aber sie kommen als Inline-Anmerkungen an, die Sie nicht annehmen oder ablehnen können, behandeln Sie die Änderungen der Reviewerin also als Ratschlag, den Sie von Hand nachtragen.

Markdown und `.docx` sind nicht zwei Kodierungen derselben Sache. Markdown ist eine kleine Menge struktureller Markierungen — das ist eine Überschrift, das ist eine Liste, das ist ein Link — und sonst nichts. Eine `.docx` ist ein Zip-Archiv aus XML, in dem jeder Absatz auf einen benannten Stil zeigt, die Stile in einem Stylesheet leben, Nummerierung in ihrem eigenen Teil lebt, und das Ganze Seitengröße, Ränder, Kopfzeilen, Fußzeilen und eine Revisionshistorie trägt. Vom Ersten zum Zweiten zu kommen heißt, alles zu erfinden, was das Zweite hat und das Erste nicht.

Diese Erfindung ist der ganze Job, und dort unterscheiden sich die Wege. Pandoc erfindet aus einem Template, das Sie kontrollieren. Word, das eine HTML-Datei öffnet, erfindet aus CSS und seinen eigenen webbezogenen Stilen. Google Docs erfindet aus Googles Stilen. Der Exportknopf eines Editors erfindet meist aus Pandocs Standardwerten, weil die meisten von ihnen Pandoc mit einem Menüpunkt davor sind.

Die zweite Sache, die man vorab wissen sollte: Wenn die Reviewerin das Dokument nur lesen muss, betrifft sie das alles nicht. Ein PDF oder eine selbstständige HTML-Seite ist ein besseres Artefakt als eine `.docx`, und [Markdown zu PDF zu konvertieren](/blog/markdown-to-pdf) ist ein kürzerer Weg mit weniger, was schiefgehen kann. Word verdient seine Komplexität erst, wenn jemand bearbeiten wird.

## Warum das überhaupt aufkommt: die Reviewerin arbeitet mit nachverfolgten Änderungen

Die Bitte ist fast nie „bitte im Word-Format schicken“. Es ist „ich muss das kommentieren“, und in den meisten Organisationen heißt kommentieren Words Überprüfen-Menüband: Einfügungen in farbiger Unterstreichung, Löschungen durchgestrichen, ein Rand voller Kommentarblasen mit Namen darauf, und ein Annehmen/Ablehnen-Knopf für jede. Dieser Workflow ist Jahrzehnte alt, es ist das, worauf Rechts- und Compliance-Teams geschult sind, und er hat keine Entsprechung in einer Markdown-Datei.

Git hat natürlich eine Entsprechung. Ein Pull Request mit Zeilenkommentaren macht denselben Job besser und behält die Historie. Aber man kann der Chefjustiziarin von jemandem keinen Pull Request schicken, und das Meeting, in dem Sie erklären, sie solle einen lernen, ist ein Meeting, das Sie verlieren. Also verlässt das Dokument das Repository als `.docx` und kommt als `.docx` mit den Änderungen einer anderen Person zurück, und die interessante technische Frage ist, was Sie in diesem Moment tun.

Das auf eine bestimmte und teure Art falsch zu machen ist üblich. Ein Team exportiert nach Word, die Reviewerin verbringt zwei Tage mit Markierungen, die Datei kommt zurück, und das Team entdeckt, dass vierzig nachverfolgte Einfügungen gegen eine Markdown-Quelle abzugleichen manuelle Arbeit ist, die niemand eingeplant hat — oder schlimmer, dass jemand alle Änderungen angenommen, zurückkonvertiert und einen Commit erzeugt hat, der jede Zeile in der Datei umschreibt, weil der Konverter Absätze anders umbricht. Den Rückweg zu entscheiden, bevor Sie irgendetwas verschicken, ist der Unterschied zwischen einem Review und einem Zwischenfall.

## Kurzvergleich: das Cheat Sheet

| Weg | Am besten für | Was er braucht | Was er Sie kostet |
| --- | --- | --- | --- |
| Pandoc mit `--reference-doc` | Jedes Dokument, das wie das Ihrer Organisation aussehen muss | Pandoc installiert, eine bearbeitete `.docx`-Vorlage | Ein Nachmittag, die Vorlage einmal zu bauen |
| Pandoc ohne Referenzdokument | Ein Entwurf, bei dem das Aussehen egal ist | Pandoc installiert | Pandocs Standardstile, die wie nichts Bestimmtes aussehen |
| Zu HTML konvertieren, in Word öffnen | Ein kurzes Memo, das niemand neu stylt | Ein Markdown-zu-HTML-Konverter und Word | Kein brauchbarer Stilsatz; CSS kommt als direkte Formatierung an |
| Selbstständiges HTML, dann LibreOffice headless | Das Obige auf einem Server automatisieren | LibreOffice installiert, keine Word-Lizenz | LibreOffices Interpretation Ihres CSS |
| Google Docs als Vermittler | Teams, die schon in Google Workspace sind | Ein Google-Konto | Das Dokument liegt auf Googles Servern; Sie bekommen Googles Stile |
| Typora, VS Code und ähnliche Editoren | Eine Datei, aus der App, in der Sie schon sind | Der Editor, plus Pandoc für `.docx` | Meist kein Weg, ein Referenzdokument zu übergeben |
| Writage, innerhalb von Word | Reviewerinnen, die Word nie verlassen werden | Ein bezahltes Word-Plugin auf ihrer Maschine | Eine Installation pro Maschine und eine Lizenz |
| Gerendertes Markdown in Word einfügen | Zwei Absätze, sofort | Eine gerenderte Vorschau und eine Zwischenablage | Durchgehend direkte Formatierung; Bilder können fehlen |
| Stattdessen Markdown zu PDF | Eine Reviewerin, die liest, aber nicht bearbeitet | Jeder der PDF-Wege | Kein Bearbeiten, keine Kommentare in der Datei selbst |
| python-docx, die Datei selbst bauen | Ein generiertes Dokument mit exakten Anforderungen | Python, und eine Spezifikation | Sie schreiben jetzt einen Word-Writer |

## Pandoc und das Referenzdokument, richtig erklärt

Pandoc ist die echte Antwort hier, und das Referenzdokument ist der Teil, den Leute überspringen. Ohne eines zu konvertieren funktioniert — `pandoc report.md -o report.docx` erzeugt eine gültige Word-Datei — und es erzeugt ein Dokument, das wie ein Pandoc-Dokument aussieht: Calibri-artig, großzügig durchschossen, Überschriften in einem Blau, das niemand gewählt hat. Reviewerinnen lesen das als Entwurf von außerhalb der Organisation, was es ist.

### Was eine .docx behält, das Markdown nicht hat

Benennen Sie eine `.docx` in `.zip` um und öffnen Sie sie. Innen hält `word/document.xml` den Text, und fast jeder Absatz darin trägt ein `w:pStyle`-Element, das einen Stil benennt: `Heading 1`, `Body Text`, `Source Code`. Der Stil selbst — Schrift, Größe, Abstand, Farbe, Keep-with-next, Gliederungsebene — lebt in `word/styles.xml`. Nummerierungsdefinitionen für Listen leben in `word/numbering.xml`. Seitengröße, Ränder, Kopf- und Fußzeilen leben in den Abschnittseigenschaften.

Diese Indirektion ist, warum Word-Dokumente auf eine Art bearbeitbar sind, wie ein PDF es nicht ist. Eine Reviewerin, die den `Heading 2`-Stil ändert, ändert jede Überschrift zweiter Ebene auf einmal. Ein Dokument, dessen Formatierung direkt angewendet wurde — hier fett, dort 14pt — sieht identisch aus und kann überhaupt nicht neu gestylt werden, und jeder Weg in diesem Artikel außer Pandoc-mit-Template erzeugt eine gewisse Menge dieser direkten Formatierung.

### Wie --reference-doc funktioniert

`--reference-doc=DATEI` ist dokumentiert als: „Nutzt die angegebene Datei als Stilreferenz beim Erzeugen einer docx- oder ODT-Datei.“ Was Pandoc aus dieser Datei nimmt, sind ihre Stylesheets und ihre Dokumenteigenschaften, einschließlich Ränder, Seitengröße, Kopf- und Fußzeile (geprüft auf pandoc.org, 8. September 2026). Ihr Inhalt wird in diese Hülle geschrieben.

Der Mechanismus ist unverblümt, und das ist seine Stärke. Pandoc schreibt einen Absatz, markiert ihn mit `Heading 1`, und Word schaut `Heading 1` in dem Stylesheet nach, das aus Ihrer Referenzdatei kam. Es gibt keine Zuordnungsebene zum Konfigurieren und keine Template-Sprache zum Lernen. Existiert der Stil im Referenzdokument, nutzt Ihre Ausgabe ihn. Existiert er nicht, rendert Word eine Referenz auf einen nicht gefundenen Stil als schlichten `Normal`-Text — genau deshalb sehen Codeblöcke wie Fließtext aus, wenn jemand den Firmenbriefkopf als Referenzdokument nutzt, ohne einen `Source Code`-Stil hinzuzufügen.

### Die Stilnamen, nach denen Pandoc sucht

Das ist die Liste, die es sich lohnt, an die Wand zu pinnen, denn ein Referenzdokument ist nur so gut wie seine Abdeckung davon. Die Absatzstile, die Pandoc im docx-Writer nutzt, sind `Normal`, `Body Text`, `First Paragraph`, `Compact`, `Title`, `Subtitle`, `Author`, `Date`, `Abstract`, `AbstractTitle`, `Bibliography`, `Heading 1` bis `Heading 9`, `Block Text`, `Footnote Block Text`, `Source Code`, `Footnote Text`, `Definition Term`, `Definition`, `Caption`, `Table Caption`, `Image Caption`, `Figure`, `Captioned Figure` und `TOC Heading`. Die Zeichenstile sind `Default Paragraph Font`, `Verbatim Char`, `Footnote Reference`, `Hyperlink` und `Section Number`. Es gibt einen Tabellenstil, genannt `Table` (geprüft auf pandoc.org, 8. September 2026).

Lesen Sie diese Liste als Karte dessen, was Pandoc ausdrücken kann. `Source Code` und `Verbatim Char` sind, warum Fenced Blocks und Inline-Code wie Code aussehen können. `Block Text` ist Ihr Blockzitat. `Image Caption` und `Captioned Figure` sind, was aus `![Eine Bildunterschrift](diagramm.png)` wird. `Definition Term` und `Definition` zählen nur, wenn Sie Pandocs Definitionslisten-Syntax nutzen. Definiert Ihre Hausvorlage keines davon, ist das die Arbeit des Nachmittags.

### Ein Referenzdokument bauen, Schritt für Schritt

1. **Beginnen Sie mit Pandocs eigenem Standard statt einer leeren Datei**, mit `pandoc -o custom-reference.docx --print-default-data-file reference.docx`. Es enthält bereits jeden Stil aus der Liste oben, korrekt verdrahtet, einschließlich der Nummerierungsdefinitionen für Listen — Sie gestalten also ein funktionierendes Dokument um, statt drei Tage später zu entdecken, dass nummerierte Listen als schlichte Absätze herauskommen.
2. **Öffnen Sie es in Word und ändern Sie die Stile, nie den Text.** Rechtsklicken Sie einen Stil in der Formatvorlagen-Galerie, wählen Sie Ändern, und ändern Sie dort Schrift, Größe, Abstand und Farbe. Direkt auf den Beispieltext angewendete Formatierung bringt nichts, weil Ihr Inhalt ihn ersetzt.
3. **Machen Sie zuerst die Überschriften und prüfen Sie die Gliederungsebene jeder einzelnen.** Words Navigationsbereich, das Inhaltsverzeichnis und jeder PDF-Export, den Sie später machen, lesen alle Gliederungsebenen, eine `Heading 2`, die wie eine Überschrift gestylt, aber auf Fließtext-Ebene belassen wurde, erzeugt also ein Dokument, das nicht navigiert werden kann.
4. **Setzen Sie Seitengröße, Ränder, Kopf- und Fußzeile im Referenzdokument, nicht pro Konvertierung.** Das sind Dokumenteigenschaften, und Pandoc trägt sie mit, was heißt, das Referenzdokument ist auch, wo Ihr Seitenmobiliar lebt — eine Fußzeile mit einer Dokumentnummer etwa erscheint bei jeder Konvertierung, ohne in irgendeinem Befehl erwähnt zu werden.
5. **Wenn Sie von einer Hausvorlage statt ausgehen müssen, fügen Sie die fehlenden Stile bei genau diesem Namen hinzu.** Firmenvorlagen haben fast immer `Heading 1` bis `Heading 4` und sonst nichts aus der Liste; `Source Code`, `Verbatim Char`, `Block Text`, `Image Caption`, `Table Caption` und der Tabellenstil `Table` sind die üblichen Lücken, und jeder fehlende Stil ist eine Inhaltskategorie, die unformatiert ankommt.
6. **Testen Sie mit einem Dokument, das alles nutzt.** Eine Datei mit neun Überschriftenebenen, einer nummerierten Liste, verschachtelt in einer unnummerierten, einem Blockzitat, einem Fenced Code Block mit einer Sprache, Inline-Code, einer Fußnote, einem Link, einem Bild mit Bildunterschrift und einer dreispaltigen Tabelle. Konvertieren, öffnen, hinschauen. Diese Datei gehört ins Repository neben die Vorlage.
7. **Committen Sie das Referenzdokument neben dem Markdown.** Es ist eine Build-Eingabe, es wird driften, wenn jemand ein Rebranding macht, und eine Vorlage, die im Downloads-Ordner einer Person lebt, ist eine Vorlage, die aufhört zu existieren, wenn diese Person geht.

### Die Flags, die für den docx-Writer zählen

| Flag | Was er tut |
| --- | --- |
| `--reference-doc=DATEI` | Stile und Dokumenteigenschaften kommen aus `DATEI` |
| `--toc` | Fügt ein aus den Überschriften gebautes Inhaltsverzeichnis ein |
| `-N`, `--number-sections` | Nummeriert Abschnittsüberschriften; das Handbuch nennt Docx unter den unterstützten Ausgaben |
| `--highlight-style=NAME` | Wählt das Syntaxhervorhebungsthema für Codeblöcke; `--list-highlight-styles` druckt die Optionen |
| `--resource-path=VERZEICHNISSE` | Wo nach über relative Pfade referenzierten Bildern zu suchen ist |
| `--dpi=ZAHL` | Pixel-zu-Zoll-Umrechnung für Bildgröße; der Standard ist 96 |
| `--lua-filter=DATEI` | Schreibt das Dokument mitten in der Konvertierung um, bevor der Writer es sieht |
| `--metadata-file=DATEI` | Liefert Titel, Autor und Datum, ohne das Markdown anzufassen |

Alle das sind aktuelle Pandoc-Optionen (geprüft auf pandoc.org, 8. September 2026). Zwei weitere Dinge lohnt es sich, über den Writer zu wissen. Bilder werden in das `.docx`-Paket gezogen, die Ausgabe ist also eine selbstständige Datei statt eines Dokuments mit Links auf Ihr Dateisystem — aber nur, wenn Pandoc sie finden kann, wofür `--resource-path` da ist, und weshalb [Bilder und Links, die weiter funktionieren](/blog/images-and-links-that-still-work) sich lohnt zu lesen, bevor Sie einen Ordner verschieben. Und rohes HTML in Ihrem Markdown wird fallen gelassen: ein `<div>` oder ein `<br>` erreicht den HTML-Writer und nicht den docx-Writer, eine Markdown-Datei, die sich auf Inline-HTML für Layout verlässt, verliert dieses Layout also still.

Zwei Pandoc-Extras sind wirklich nützlich, sobald die Grundlagen funktionieren. Ein Fenced Div mit einem `custom-style`-Attribut wendet jeden beliebigen Word-Stil auf seinen Inhalt an — `::: {custom-style="Warning"}` packt einen Block in den `Warning`-Absatzstil Ihrer Vorlage — und das Bracketed-Span-Äquivalent tut dasselbe für Zeichenstile. Und [Tabellen](/blog/markdown-tables-that-survive-conversion) bekommen den `Table`-Tabellenstil, was die einzige Tabellenformatierung ist, die Sie bekommen, definieren Sie ihn also ordentlich und erwarten Sie nichts Cleveres bei Spaltenbreiten.

**Für wen ist das?** Für jeden, der diese Konvertierung mehr als zweimal macht. Die Vorlage ist ein fester Preis, einmal gezahlt und über jedes Dokument danach amortisiert, und es ist der einzige Weg hier, der eine `.docx` gleich in den Stilen Ihrer Organisation erzeugt, die eine Word-Nutzerin dann aus der Formatvorlagen-Galerie weiter neu stylen kann.

## Der HTML-Weg: zu HTML konvertieren, dann in Word öffnen

Word öffnet `.html`-Dateien. Das ist kein Trick und nicht neu; es funktioniert, seit Word gelernt hat, Webseiten zu speichern. Konvertieren Sie Ihr Markdown zu HTML, doppelklicken Sie das Ergebnis, und Word rendert es als Dokument, das Sie dann über Datei, Speichern unter als `.docx` speichern können.

Es ist wirklich der schnellste Weg, braucht keine Installation über einen browserbasierten Konverter hinaus, und für ein kurzes Dokument ist es in Ordnung. Es ist auch der Weg, der die am wenigsten bearbeitbare Datei erzeugt, und es lohnt sich, präzise zu sein, warum.

**Word bildet importiertes HTML auf seine eigenen webbezogenen eingebauten Stile ab**, nicht auf die Ihrer Vorlage. Textabsätze kommen tendenziell als `Normal (Web)` an, vorformatierte Blöcke als `HTML Preformatted`. Der `Body Text` Ihrer Organisation ist nicht beteiligt. Das Dokument sieht vernünftig aus und gehört zu keiner Vorlage.

**CSS wird direkte Formatierung.** Ein Stylesheet, das `h2 { color: #1a4f7a; font-size: 20px }` sagt, wird nicht zu einer `Heading 2`-Stildefinition; es wird zu Formatierung, die auf diese Absätze angewendet wird. Die Reviewerin, die die Formatvorlagen-Galerie öffnet, um die Überschriftfarbe zu ändern, findet nichts zu ändern, und die Person, die das Dokument später erbt, kann es überhaupt nicht neu stylen.

**Tabellen kommen ohne Tabellenstil an.** Rahmen und Innenabstand kommen aus Ihrem CSS als direkte Zellformatierung, den Haus-Tabellenlook anzuwenden heißt also, jede Tabelle auszuwählen und von Hand einen Stil zu wählen — was auch verwirft, was Ihr CSS getan hat.

**Bilder überleben nur, wenn sie in der Datei sind.** Eine HTML-Datei, die auf `diagramm.png` daneben verweist, funktioniert, bis die Datei allein per E-Mail verschickt wird, an welchem Punkt die Reviewerin einen Platzhalter bekommt. Ein selbstständiger HTML-Export, mit Bildern als Data-URIs eingebettet und Styles in einem `<style>`-Block, ist die Version dieses Wegs, die tatsächlich reist.

**Die Datei ist noch HTML, bis jemand sie konvertiert.** Wenn Sie die `.html` schicken und die Reviewerin bearbeitet und speichert, bearbeitet sie noch HTML, und Words HTML-Ausgabe hat ihre eigenen Eigenheiten. Speichern Sie selbst als `.docx`, bevor Sie es verschicken, und prüfen Sie das Ergebnis, statt es anzunehmen.

**Die Seiteneinrichtung kommt von nirgendwo.** Keine Seitengröße, keine Ränder, keine Kopf- oder Fußzeile, weil das HTML keine hatte. Für ein Dokument, das gedruckt oder paginiert wird, sind das Entscheidungen, die jetzt jemand von Hand treffen muss.

Für Automatisierung läuft derselbe Weg ganz ohne Word: erzeugen Sie selbstständiges HTML, dann `soffice --headless --convert-to docx report.html`. LibreOffice macht eine kompetente Arbeit, und seine Interpretation Ihres CSS ist seine eigene, testen Sie es also einmal, statt ihm zu vertrauen.

**Für wen ist das?** Einzelne Dokumente, bei denen die Reviewerin kommentiert und nicht neu stylt — ein zweiseitiges Memo, eine für eine einzige Kommentarrunde verschickte Spezifikation. Nicht für etwas, das in eine vorlagengesteuerte Dokumentmenge eintritt.

Die direkte Formatierung stammt vom HTML in der Mitte, nicht davon, dass im Browser konvertiert wird. Die [Markdown-zu-Word-Konvertierung](/markdown-to-word) dieser Website schreibt die `.docx` im Browser direkt aus dem Markdown, ohne Zwischenschritt über HTML: Überschriften tragen Words eingebaute Stile Heading 1 bis 6 (im deutschen Word Überschrift 1 bis 6), Listen nutzen Words eigene Nummerierung, Fußnoten stehen am Fuß der Seite, und Tabellen haben den Tabellenstil Table Grid (Tabellenraster) mit einer Kopfzeile, die sich auf jeder Seite wiederholt. Ein Referenzdokument nimmt sie nicht entgegen, die Datei kommt also in ihrem eigenen Standardaussehen an statt in dem Ihrer Organisation; da die Stile Words eingebaute Namen tragen, kann eine danach in Word angewendete Hausvorlage sie neu gestalten, doch für ein Dokument, das Sie jede Woche erzeugen, bleibt Pandoc mit einem Referenzdokument die geringere Arbeit.

## Google Docs als Vermittler

Google Docs liest und schreibt Markdown nativ. In Docs nimmt Datei, Öffnen, Hochladen eine `.md`-Datei und öffnet sie als Dokument; von Drive aus, Rechtsklick auf die hochgeladene Datei und Öffnen mit Google Docs. Der umgekehrte Weg ist Datei, Herunterladen, Markdown (.md). Es gibt auch eine Einstellung unter Tools, Einstellungen, namens Enable Markdown, die Copy as Markdown und Paste from Markdown einschaltet, um Fragmente herumzubewegen (geprüft auf support.google.com, 8. September 2026).

Das macht Docs zu einem Zwei-Schritt-Weg zu Word: das Markdown importieren, dann Datei, Herunterladen, Microsoft Word (.docx). Es braucht nichts installiert und kein Terminal, weshalb es immer wieder empfohlen wird.

| Vorteile | Nachteile |
| --- | --- |
| Keine Installation, keine Kommandozeile, funktioniert von jeder Maschine | Das Dokument wird auf Googles Server hochgeladen |
| Import und Export sind beide Erstanbieter-Funktionen | Sie bekommen Googles Stile — Title, Heading 1 bis 6, Normal text — nicht die Ihrer Vorlage |
| Die Reviewerin kann in Docs kommentieren und `.docx` ganz umgehen | Kein `Source Code`-Äquivalent, Codeblöcke kommen also als direkt formatierter Monospace an |
| Der Vorschlagsmodus ist ein echter Review-Workflow mit echtem Prüfpfad | Vorschläge überleben den Markdown-Export nicht; Sie bekommen den aktuellen Text |

Das wirklich Interessante an diesem Weg ist, dass er die Notwendigkeit von Word entfernen kann. Wenn der Einwand der Reviewerin ist „ich muss kommentieren und Änderungen vorschlagen“, tut Docs' Vorschlagsmodus das, mit Namen und Daten und einer Annehmen/Ablehnen-Kontrolle, in einem Browser, ohne Datei, die hin- und hergeht. Es ist eine bessere Antwort als eine `.docx`-Rundreise, wann immer die Organisation es akzeptiert — und dasselbe Abgleichproblem wartet am Ende, weil der Markdown-Export Ihnen den aufgelösten Text gibt und nicht die Vorschläge.

Der Preis ist, wohin das Dokument geht. Für eine öffentliche README spielt es keine Rolle. Für einen unveröffentlichten Plan, einen Vertrag oder alles unter einer Vertraulichkeitspflicht ist es hochzuladen, um es zu konvertieren, die ganze Frage, und dass die Konvertierung bequem ist, ändert die Antwort nicht.

**Für wen ist das?** Teams, die schon in Google Workspace sind, die Dokumente konvertieren, die nicht sensibel sind, wo die Reviewerin sich in Docs wohlfühlt.

## Editoren, die `.docx` exportieren, und was sie wirklich tun

Mehrere Markdown-Editoren haben Word in ihrem Exportmenü. Es lohnt sich zu wissen, was hinter diesem Menüpunkt steckt, denn in den meisten Fällen ist es Pandoc.

**Typora** exportiert zu Word, ODT, RTF, EPUB, LaTeX und mehr — und die eigene Dokumentation sagt, dass Typora für Formate außer HTML, PDF und Bildern Pandoc für den Export nutzt, das Sie selbst installieren müssen (geprüft auf support.typora.io, 8. September 2026). Typoras Word-Export ist also Pandocs Word-Export mit einem Dialog davor, und er trägt Pandocs Standardstile, außer der Editor lässt Sie zusätzliche Argumente übergeben. Typora kostet 14,99 $ ohne Steuer, ein einmaliger Kauf für bis zu drei Geräte, mit einer 15-tägigen kostenlosen Testphase (geprüft auf typora.io, 8. September 2026).

**VS Code** hat keinen eingebauten `.docx`-Export; Erweiterungen fügen ihn hinzu, und die, die es tun, rufen im Allgemeinen auch Pandoc auf. Wenn Sie aus einem Editor konvertieren, sagt Ihnen zu wissen, dass die echte Engine Pandoc ist, wo Sie nachschauen müssen, wenn die Ausgabe falsch ist: beim Referenzdokument, nicht beim Editor.

**Obsidian** exportiert PDF aus der Kernanwendung. Word-Export kommt von einem Community-Plugin, das Pandoc aufruft, mit derselben Folge — die Stile sind Pandocs, bis Sie es auf eine Vorlage lenken.

**Writage** dreht das Problem um. Es ist ein Markdown-Plugin für Microsoft Word selbst, verfügbar für Windows und macOS, das `.md`-Dateien innerhalb von Word öffnet und speichert und in beide Richtungen konvertiert. Es ist ein bezahltes Plugin, das für eine einmalige Gebühr verkauft wird, mit einer kostenlosen Testphase (geprüft auf writage.com, 8. September 2026). Sein Punkt ist Platzierung: die Konvertierung geschieht auf der Maschine der Reviewerin, in der Anwendung, die sie schon offen hat, was die ganze Frage umgeht, wer was wann konvertiert.

**Kopieren und Einfügen** verdient eine Erwähnung, weil Leute es trotzdem tun. Die gerenderte Ausgabe aus einem Vorschau-Bereich oder einem Browser kopieren, in Word einfügen, und das HTML-Zwischenablagenformat trägt Überschriften, Fett, Listen, Links und Tabellenstruktur überraschend gut hinüber. Alles kommt als direkte Formatierung an, Bilder sind Glückssache, je nachdem, wie sie referenziert wurden, und Codeblöcke verlieren meist ihren Hintergrund. Für zwei Absätze ist es der richtige Aufwand. Für ein Dokument ist es ein Weg zu einer Datei, die niemand warten kann.

Der breitere Punkt zu Editoren: Sie sind die richtige Wahl, wenn die Konvertierung gelegentlich ist und das Aussehen nicht sehr zählt, und die falsche, wenn es Teil eines wiederholbaren Prozesses ist, denn das, was Sie am meisten kontrollieren müssen, ist das, was sie am häufigsten verstecken. Welcher Editor zu Ihnen passt, ist eine eigene Frage, und [der Editor-Vergleich](/blog/best-markdown-editors) beantwortet sie besser als ein Exportmenü.

**Für wen ist das?** Autorinnen, die ihre eigenen Dokumente konvertieren, eines nach dem anderen, die schon im Editor leben.

## Wo die Rückreise zu Markdown scheitert, und was es kostet

Hier der ehrliche Teil. Markdown in Word zu bringen ist ein gelöstes Problem — Pandoc plus eine Vorlage, fertig. Das überprüfte Word-Dokument zurück nach Markdown zu bringen ist es nicht, und das Gegenteil vorzutäuschen ist, wie Teams am Ende mit einem Repository dastehen, das nicht mehr mit dem Dokument übereinstimmt, über das alle diskutieren.

Beginnen Sie mit dem, was Pandoc kann, denn es ist mehr, als die meisten erwarten. Beim Lesen einer `.docx` nimmt `--track-changes` drei Werte an. `accept` ist der Standard und verarbeitet alle Einfügungen und Löschungen. `reject` ignoriert sie. `all` schließt Einfügungen, Löschungen und Kommentare ein, verpackt in Spans mit den Klassen `insertion`, `deletion`, `comment-start` und `comment-end`, und Autor und Zeitpunkt jeder Änderung sind eingeschlossen; ein ganzer eingefügter oder gelöschter Absatz erzeugt einen Span mit der Klasse `paragraph-insertion` oder `paragraph-deletion` vor dem betroffenen Absatzumbruch. Die Option betrifft nur den docx-Reader (geprüft auf pandoc.org, 8. September 2026).

Das Review ist also als Daten wiederherstellbar:

```
pandoc --track-changes=all -f docx -t markdown review.docx -o review.md
```

Jetzt die Kosten, in der Reihenfolge, wie viel Ärger sie verursachen.

**Die Änderungen hören auf, Änderungen zu sein.** In Word ist eine Einfügung ein Vorschlag mit einem angehängten Knopf. Im konvertierten Markdown ist es ein geklammerter Span mit einem Autor-Attribut — Text über eine Änderung, sitzend in der Prosa, den kein Markdown-Werkzeug annehmen oder ablehnen kann. Sie lesen ihn und tippen die Entscheidung neu. Für ein Dokument mit einem Dutzend Änderungen sind das zwanzig Minuten. Für ein zeilenweise markiertes Dokument ist es ein Tag, und es ist ein Tag der Transkription ohne Test, der Ihnen sagt, wann Sie es falsch gemacht haben.

**Kommentare verlieren ihre Verankerung.** Ein Kommentar in Word haftet an einem Bereich. Konvertiert wird er zu einem `comment-start`- und einem `comment-end`-Span, und während das für eine Phrase innerhalb eines Absatzes funktioniert, kommen Kommentarbereiche, die mehrere Absätze überspannen oder sich mit einer nachverfolgten Löschung überschneiden, verzerrt oder abgetrennt zurück. Ein Kommentar, dessen Ziel Sie nicht identifizieren können, ist ein Kommentar, den jemand nachjagen muss, indem er die ursprüngliche `.docx` doch öffnet.

**`accept` und `reject` werfen jeweils die Hälfte der Information weg.** `accept` gibt Ihnen sauberen Text und keine Aufzeichnung, wer was warum geändert hat, was genau das war, wofür das Review da war. `reject` gibt Ihnen Ihr eigenes Dokument zurück. Keines ist eine schlechte Option — sie sind einfach kein Review; sie sind eine Art, eines zu beenden.

**Der Diff ist wertlos, außer Sie normalisieren zuerst.** Das ist der Fehler, der Leute überrascht. Konvertieren Sie eine `.docx` nach Markdown, und die Ausgabe ist Pandocs Markdown: sein Zeilenumbruch, sein Escaping, sein Überschriftenstil, seine Tabellenausrichtung. Jede Zeile unterscheidet sich von Ihrem Original, `git diff` zeigt also die ganze Datei als geändert, und die tatsächlichen Änderungen der Reviewerin sind darin unsichtbar. Die Abhilfe ist, beide Seiten denselben Dialekt sprechen zu lassen. Konvertieren Sie Ihr eigenes Markdown einmal durch dieselbe Pipeline, committen Sie diese normalisierte Version als Quelle, und pinnen Sie die Ausgabeeinstellungen auf dem Rückweg fest:

```
pandoc --track-changes=all -f docx -t gfm \
  --wrap=none --markdown-headings=atx \
  review.docx -o review.md
```

Mit denselben Flags auf beiden Seiten zeigt der Diff das Review und sonst nichts. Ohne sie zeigt er eine Neuschreibung.

**Alles, was Word ausdrücken kann und Markdown nicht, ist weg, egal welche Flags.** Eine Hervorhebung der Reviewerin, eine Farbe, die etwas bedeutete, ein Kommentarthread mit drei Antworten, eine umstrukturierte Tabelle, eine vorgeschlagene Abbildungsplatzierung, eine durch Umstylen statt Neutippen ausgedrückte umgeschriebene Überschriftenhierarchie — nichts davon hat irgendwo einen Platz zu landen. Das Abgleichproblem in der anderen Richtung, und was eine `.docx` trägt, das keine Markdown-Datei halten kann, wird ordentlich behandelt in [eine `.docx` zurück zu Markdown zu konvertieren](/blog/convert-docx-to-markdown).

**Was es klar ausgedrückt kostet:** die Rundreise ist in der Praxis eine Einbahnstraße. Markdown raus, `.docx` zurück, Kommentare von einem Menschen gelesen, Änderungen von Hand ins Markdown nachgetragen, das die einzige Quelle bleibt. Jeder Prozess, der die zurückgegebene `.docx` als automatisch mergbare Eingabe behandelt, erzeugt entweder ein verlorenes Review oder einen Commit, den niemand lesen kann. Vereinbaren Sie das mit der Reviewerin, bevor Sie die Datei schicken — „schicken Sie mir Ihre Kommentare, und ich trage sie nach, und die Version im Repository ist die, die zählt“ — und die Reibung wird zu einem Schritt in einem Prozess statt zu einem Streit darüber, welche Datei aktuell ist.

## Wie man wählt

1. **Entscheiden Sie, ob die Reviewerin bearbeitet oder nur liest.** Wenn sie nur liest, erzeugen Sie ein PDF oder eine selbstständige HTML-Seite und hören auf; Sie vermeiden das ganze Rundreiseproblem, und ein Dokument, das niemand bearbeiten kann, kann nicht in zwei Versionen abzweigen.
2. **Zählen Sie, wie oft Sie das tun werden.** Einmal, aus dem Exportmenü eines Editors, ist vernünftig. Wöchentlich heißt, ein Referenzdokument zu bauen, denn die Alternative ist, den Hauslook jede Woche von Hand nachzubauen und ihn jedes Mal etwas anders zu bekommen.
3. **Fragen Sie, ob die Ausgabe neu gestylt wird.** Tritt sie in eine vorlagengesteuerte Dokumentmenge ein, ist der HTML-Weg disqualifiziert — seine Formatierung ist direkt statt gestylt, und ein Dokument, das nicht neu gestylt werden kann, wird neu getippt statt umgestylt.
4. **Prüfen Sie, wohin die Datei gehen darf.** Ein Weg über einen gehosteten Dienst bedeutet, das Dokument liegt auf dem Server einer anderen Person; für alles Vertrauliche schließt das die bequemen Optionen aus und lässt Ihnen Pandoc auf Ihrer eigenen Maschine.
5. **Vereinbaren Sie den Rückweg, bevor Sie irgendetwas verschicken.** Schreiben Sie auf, wer die überprüfte Datei mit welchen Flags konvertiert, und wer die Änderungen ins Markdown einträgt. Der Preis, das zu überspringen, erscheint im schlechtestmöglichen Moment, nämlich wenn das Review zurückkommt und die Deadline Freitag ist.
6. **Testen Sie mit einem Dokument, das alles durchspielt, auf der tatsächlichen Word-Kopie der Reviewerin.** Neun Überschriftenebenen, verschachtelte Listen, ein Codeblock, eine Fußnote, ein Bild mit Bildunterschrift und eine breite Tabelle. Versions- und Plattformunterschiede in Word zeigen sich genau daran, und es von der Reviewerin zu erfahren ist teuer.

## Fazit

Der Weg, der funktioniert, ist Pandoc mit einem Referenzdokument, das Sie einmal gebaut und neben Ihr Markdown committet haben, denn es ist der einzige, der eine Word-Datei erzeugt, die Ihre eigenen Stile trägt statt eingefrorener Formatierung oder fremder Voreinstellungen — und Stile sind, was eine `.docx` es wert macht, an jemanden zu schicken, der sie bearbeiten wird. Der HTML-Weg ist eine vernünftige Abkürzung für ein kurzes Dokument, und er verbessert sich erheblich, wenn das HTML, mit dem Sie beginnen, eine vollständige, selbstständige Datei ist statt eines Fragments, was [TransformPipes Markdown-zu-HTML-Konvertierung](/) im Browser erzeugt, ohne irgendetwas hochzuladen. Braucht das Dokument echte Word-Überschriften und -Listen, aber nicht die Vorlage Ihrer Organisation, überspringt die [Markdown-zu-Word-Konvertierung](/markdown-to-word) derselben Website das HTML ganz und schreibt im Browser eine `.docx`, die aus Stilen aufgebaut ist. Google Docs ist die pragmatische Wahl innerhalb von Workspace und die falsche Wahl für alles Vertrauliche. Was auch immer Sie wählen, entscheiden Sie zuerst den Rückweg: die Konvertierung raus ist ein Befehl, und die Konvertierung zurück ist ein Gespräch mit einer Person darüber, wer ihre Änderungen nachträgt und welche Datei die Wahrheit ist.

## FAQ

### Wie konvertiere ich Markdown zu Word, ohne etwas zu installieren?

Laden Sie die `.md`-Datei zu Google Docs hoch — Datei, Öffnen, Hochladen — dann Datei, Herunterladen, Microsoft Word (.docx). Es braucht keine Installation und kein Terminal, zum Preis, dass das Dokument durch Googles Server läuft und mit Googles Stilen ankommt statt denen Ihrer Organisation. Die anderen Wege ohne Installation laufen im Browser: zu HTML zu konvertieren und das Ergebnis in Word zu öffnen geht noch schneller und erzeugt eine Datei ohne brauchbaren Stilsatz, während ein Konverter, der die `.docx` direkt schreibt, wie der dieser Website, Ihnen Words eingebaute Stile für Überschriften und Listen gibt, wenn auch nicht Ihre Vorlage.

### Was ist der beste Pandoc-Befehl für Markdown zu Word?

`pandoc report.md --reference-doc=house.docx -o report.docx`, wobei `house.docx` ein Referenzdokument ist, das Sie bearbeitet haben. Fügen Sie `--toc` für ein Inhaltsverzeichnis hinzu und `--highlight-style=NAME`, wenn Ihnen wichtig ist, wie Codeblöcke aussehen. Ohne `--reference-doc` funktioniert der Befehl trotzdem und gibt Ihnen Pandocs Standardaussehen.

### Wie bringe ich Word dazu, meine Firmenvorlage zu nutzen?

Bauen Sie ein Referenzdokument aus Pandocs Standard mit `pandoc -o custom-reference.docx --print-default-data-file reference.docx`, und stylen Sie es dann in Word passend zur Vorlage um. Von Pandocs Datei statt von der Firmenvorlage auszugehen zählt, weil Pandocs Kopie schon jeden Stil definiert, auf den der docx-Writer verweist — einschließlich `Source Code`, `Block Text` und `Image Caption`, die Firmenvorlagen fast nie haben.

### Warum sieht mein Codeblock in der Word-Datei wie Fließtext aus?

Weil das Referenzdokument keinen `Source Code`-Absatzstil hat, Word rendert also eine Referenz auf einen Stil, den es nicht finden kann. Fügen Sie `Source Code` für Fenced Blocks und den Zeichenstil `Verbatim Char` für Inline-Code hinzu, beide unter genau diesen Namen, und die Formatierung erscheint.

### Kann ich nachverfolgte Änderungen behalten, wenn ich Word zurück zu Markdown konvertiere?

Sie können sie lesen, nicht behalten. `pandoc --track-changes=all` verpackt Einfügungen, Löschungen und Kommentare in Spans mit Autor- und Zeitattributen, was genug ist, um zu sehen, wer was vorgeschlagen hat — aber sie kommen als Anmerkungen in der Prosa an, und kein Markdown-Werkzeug kann sie annehmen oder ablehnen. Planen Sie, die Änderungen von Hand nachzutragen.

### Warum zeigt mein Diff nach einer Rundreise die ganze Datei als geändert?

Weil der Markdown-Dialekt des Konverters nicht Ihrer ist: anderer Zeilenumbruch, anderes Escaping, anderer Überschriftenstil. Normalisieren Sie beide Seiten, indem Sie Ihre eigene Quelle einmal durch dieselbe Pipeline laufen lassen und die Ausgabeflags festpinnen — `--wrap=none --markdown-headings=atx`, zum Beispiel —, sodass der Diff nur noch die Änderungen der Reviewerin zeigt.

### Soll ich Word oder PDF zum Review schicken?

PDF, wenn sie lesen, Word, wenn sie bearbeiten. Ein PDF ist kleiner, sieht überall gleich aus und kann nicht in eine zweite Version des Dokuments abzweigen; eine `.docx` existiert, damit jemand sie ändern kann, und jeder Preis in diesem Artikel ist der Preis dieser Fähigkeit. Word an jemanden zu schicken, der nur lesen wollte, lädt zu Änderungen ein, die Sie dann abgleichen müssen.
