---
title: "PowerPoint in Markdown umwandeln: Folien, Notizen und die Lesereihenfolge"
description: "Was beim Umwandeln einer .pptx in Markdown übrig bleibt, warum Pandoc PowerPoint nicht lesen kann und wohin die Sprechernotizen verschwinden — sechs Wege"
date: 2026-09-21
tag: Konvertieren
keywords: powerpoint in markdown umwandeln, pptx in markdown konvertieren, powerpoint notizen exportieren, präsentation als text speichern, pptx konverter, folien in markdown
---

Eine Präsentation ist die kürzeste Fassung einer Argumentation, die jemand bereits ausformuliert hat. Genau deshalb lohnt sich die Umwandlung: Die Folien tragen die Struktur, die Sprechernotizen tragen die Sätze, die auf den Folien weggekürzt wurden. Beides liegt in der `.pptx`-Datei, als schlichtes XML — und fast jeder Weg aus PowerPoint heraus wirft eines davon weg, in aller Regel die Notizen, weil sie nie auf dem Bildschirm standen.

### Kurz gefasst

Eine `.pptx` ist ein ZIP-Archiv aus XML-Teilen: ein Teil je Folie, ein eigener Teil je Notizenseite, die Bilder in einem Ordner `ppt/media/`. Wie gut die Umwandlung ausfällt, hängt fast ausschließlich davon ab, welche dieser Teile ein Werkzeug überhaupt öffnet. Pandoc hilft hier nicht: Es schreibt `pptx`, liest es aber nicht, weshalb der verbreitete Rat „nimm einfach Pandoc“ schon am ersten Befehl scheitert (geprüft auf pandoc.org, 21. September 2026). Der eingebaute Export als Gliederung/RTF erfasst den Text in Titel- und Inhaltsplatzhaltern und lässt alles andere liegen, die Notizen eingeschlossen. Der Umweg über PDF verwandelt ein strukturiertes Dokument in positionierten Text und verliert dabei genau die Struktur, wegen der die Präsentation erhaltenswert war. `python-pptx` liest Folien und Notizen und gibt Ihnen die Bestandteile — das Markdown schreiben Sie selbst. Ein Konverter, der die Teile direkt öffnet, etwa [PowerPoint → Markdown bei TransformPipe](/powerpoint-to-markdown), liefert in einem Durchgang je Folie eine Überschrift, die Notizen darunter und die Bilder eingebettet.

Was kein Weg rettet: Animationen, Übergänge, die Einblendreihenfolge, SmartArt als Diagramm und Diagramme als etwas anderes als ein Bild. Das war nie Text.

## Was tatsächlich in einer .pptx steckt

Benennen Sie eine Datei in `.zip` um und öffnen Sie sie. Die interessanten Teile:

| Teil | Inhalt |
| --- | --- |
| `ppt/slides/slide1.xml` | Die Formen einer Folie, in der Reihenfolge, in der PowerPoint sie ablegt |
| `ppt/slides/_rels/slide1.xml.rels` | Die Verweise dieser Folie: auf Bilder, Hyperlinks und die zugehörige Notizenseite |
| `ppt/notesSlides/notesSlide1.xml` | Die Sprechernotizen einer Folie, als eigenes Dokument |
| `ppt/media/image1.png` | Jedes Bild, in voller Größe, unter eigenem Namen |
| `ppt/presentation.xml` | `<p:sldIdLst>` — die Foliensortierung, die nicht der Dateinamenssortierung entspricht |

Zwei dieser Zeilen sind die Stellen, an denen die meisten Umwandlungen scheitern.

Die erste ist die Reihenfolge. `slide1.xml` ist nicht zwangsläufig die erste Folie. Die Nummern sind Kennungen, die beim Anlegen vergeben werden; wer Folien im Editor verschiebt, nummeriert sie nicht neu. Die wirkliche Reihenfolge steht in `<p:sldIdLst>` in `presentation.xml`, als Liste von Beziehungskennungen, die erst über `ppt/_rels/presentation.xml.rels` zu Dateinamen aufgelöst werden müssen. Wer nach Dateinamen sortiert, erhält eine umsortierte Präsentation — und die ist schlimmer als gar keine Umwandlung, weil sie unauffällig aussieht.

Die zweite sind die Notizen. Sie stehen überhaupt nicht im Folienteil. Jede Notizenseite ist ein eigenes XML-Dokument und nur über die Beziehungsdatei mit ihrer Folie verbunden. Ein Werkzeug, das `ppt/slides/*.xml` liest und sonst nichts, verliert die Notizen nicht durch einen Fehler — es hat nie nachgesehen.

## Sechs Wege im Vergleich

| Weg | Folien | Notizen | Bilder | Lesereihenfolge | Aufwand |
| --- | --- | --- | --- | --- | --- |
| Kopieren und Einfügen | Nur Text | Nein — nicht sichtbar | Nein | Wie geklickt | Hoch, je Folie |
| PowerPoint → Gliederung/RTF | Nur Platzhalter | Nein | Nein | Platzhalterfolge | Gering |
| PowerPoint → PDF → Markdown | Als positionierter Text | Nur über Notizenseiten | Teilweise | Aus der Geometrie geraten | Mittel |
| Skript mit `python-pptx` | Ja | Ja | Mit Arbeit | Selbst bestimmt | Hoch, einmalig |
| Pandoc | Kann `.pptx` nicht lesen | — | — | — | — |
| Konverter, der die Teile liest | Ja | Ja | Eingebettet | Dokumentreihenfolge | Gering |

## Pandoc liest docx und epub — pptx nicht

Das gehört deutlich gesagt, weil der Rat so häufig fällt. Pandocs Formatliste ist unsymmetrisch: `docx` steht als Eingabe- und als Ausgabeformat, `epub` ebenfalls, `pptx` dagegen ausschließlich als Ausgabeformat (geprüft auf pandoc.org, 21. September 2026). `pandoc -f pptx deck.pptx -t markdown` liefert also keine schlechtere Umwandlung, sondern einen Fehler, weil es keinen pptx-Leser zum Auswählen gibt.

Diese Unsymmetrie ist weniger ein Versäumnis als eine Aussage über das Format. Ein Word-Dokument ist ein Strom von Absätzen mit Formatvorlagen und bildet sich fast unmittelbar auf Pandocs internes Dokumentmodell ab. Eine Folie ist eine Fläche mit positionierten Formen ohne festgelegte Lesereihenfolge; sie zu linearisieren verlangt Annahmen, die Pandoc bewusst nicht trifft. Jedes Werkzeug, das Präsentationen umwandelt, trifft diese Annahmen — die Frage ist nur, ob es das sagt.

Wer eine Präsentation hat und einen auf Pandoc zugeschnittenen Arbeitsablauf, geht den ehrlichen Weg in zwei Schritten: erst auf anderem Weg Markdown aus der `.pptx` holen, dann dieses Markdown an Pandoc übergeben. Die zweite Hälfte behandelt [Alternativen zu Pandoc](/blog/pandoc-alternatives-for-markdown-to-html).

## Der eingebaute Gliederungsexport

PowerPoint kann eine Gliederung speichern: Datei, Speichern unter, und in der Formatliste Gliederung/RTF wählen. Unter Windows ist das eine gewöhnliche Speicheroption; auf dem Mac arbeitet die Importseite mit RTF, die Exportauswahl unterscheidet sich jedoch je nach Version — prüfen Sie die Liste, die vor Ihnen steht (geprüft auf support.microsoft.com, 21. September 2026).

Heraus kommt der Text aus Titel- und Inhaltsplatzhaltern, nach Gliederungsebene eingerückt. Nicht heraus kommt alles andere: Text, den Sie in eine Form oder ein frei gesetztes Textfeld geschrieben haben statt in einen Platzhalter, Tabellen, Bilder und die Sprechernotizen.

| Vorteile | Nachteile |
| --- | --- |
| Eingebaut, kein Werkzeug, kein Upload, kein Skript | Nur Platzhalter — eine aus Textfeldern gebaute Präsentation kommt fast leer heraus |
| Behält die Gliederungsebenen als Einrückung | Keine Notizen, keine Tabellen, keine Bilder, keine Links |
| RTF lässt sich sauber weiterverarbeiten | Schweigt darüber, was verloren ging |

**Für wen ist das?** Für eine textlastige Präsentation, die streng aus den Standardlayouts gebaut wurde und bei der die Aufzählungsstruktur genügt. Wer diesen Weg geht, braucht für die entstandene RTF-Datei einen zweiten Schritt — [RTF → Markdown](/rtf-to-markdown) übernimmt ihn.

## Erst PDF, dann PDF umwandeln

Naheliegend, denn jede Präsentation lässt sich als PDF ausgeben, und PDF-Konverter gibt es reichlich. Das Problem liegt in dem, was der Export tut: PDF kennt keine Überschriften, keine Listen und keine Tabellen, nur Zeichen an Koordinaten. Eine Überschrift ist eine Überschrift, weil sie groß ist und oben steht. Eine Aufzählung ist eine Aufzählung, weil mehrere Zeilen mit demselben Zeichen auf derselben Einrückung beginnen. Jeder Konverter, der dieses PDF liest, rekonstruiert eine Struktur, die die `.pptx` ausdrücklich benannt und das PDF weggeworfen hat.

Eines kann dieser Weg allerdings, was die anderen ohne Skript nicht können: Wählen Sie unter Drucken das Layout Notizenseiten, und Sie erhalten die Notizen unter einem Abbild jeder Folie. Das ist ein PDF der Notizen, nicht der Notizentext — aber es ist der einzige Weg ohne Programmierung, der sie überhaupt mitnimmt.

| Vorteile | Nachteile |
| --- | --- |
| Funktioniert mit jeder Version, auf jeder Plattform | Struktur wird aus der Geometrie erschlossen, nicht gelesen |
| Notizenseiten sind der einzige eingebaute Weg mit Notizen | Die Notizen stehen unter einem gerasterten Folienbild |
| Die optische Treue stimmt genau | Tabellen kommen meist als loser Text; zweispaltige Folien verschränken sich |

**Für wen ist das?** Für eine Präsentation, die sich nur noch in dem Betrachter öffnen lässt, der das PDF erzeugt hat. Sonst verwandelt man eine strukturierte Datei absichtlich in eine unstrukturierte, was ein merkwürdiger erster Schritt ist.

## Ein Skript mit python-pptx

Wenn die Präsentationen Ihre eigenen sind und weitere folgen werden, zahlt sich der direkte Zugriff auf die Datei aus. `python-pptx` öffnet jede `.pptx` ab PowerPoint 2007, und die Notizen sind zugänglich: `Slide.has_notes_slide` und `Slide.notes_slide.notes_text_frame` gehören zur dokumentierten Schnittstelle (geprüft auf python-pptx.readthedocs.io, 21. September 2026).

```python
from pptx import Presentation

deck = Presentation('deck.pptx')
out = []

for number, slide in enumerate(deck.slides, start=1):
    title = slide.shapes.title
    out.append(f'## {title.text}' if title and title.text else f'## Slide {number}')

    for shape in slide.shapes:
        if shape == slide.shapes.title or not shape.has_text_frame:
            continue
        for paragraph in shape.text_frame.paragraphs:
            text = ''.join(run.text for run in paragraph.runs).strip()
            if text:
                out.append(('  ' * paragraph.level) + f'- {text}')

    if slide.has_notes_slide:
        notes = slide.notes_slide.notes_text_frame.text.strip()
        if notes:
            out.append('> **Notes**')
            out.extend(f'> {line}' for line in notes.splitlines())

    out.append('')

print('\n'.join(out))
```

Achten Sie darauf, worüber die Schleife läuft: `deck.slides`, und python-pptx löst das über die Folienkennungsliste auf. Die Reihenfolge ist damit die der Präsentation und nicht die der Dateinamen — der eine schwierige Teil ist also erledigt.

Was das Skript noch nicht tut, ist der lange Rest: Bilder (über `shape.shape_type` auf `PICTURE` prüfen, `shape.image.blob` ablegen, einen Verweis ausgeben), Tabellen (`shape.has_table`, dann Zeilen und Zellen in eine Markdown-Tabelle), gruppierte Formen (eine Gruppe ist eine Form aus Formen, die Schleife muss also rekursiv werden) und Hyperlinks (`run.hyperlink.address`, ein anderes Objekt als der Text des Runs). Jedes davon sind zwanzig Zeilen. Zusammen sind sie der Grund, warum das ein Projekt ist und kein Schnipsel.

| Vorteile | Nachteile |
| --- | --- |
| Liest die echte Struktur samt Notizen | Sie schreiben und pflegen einen Konverter |
| Wiederholbar über einen ganzen Ordner | Gruppen, Tabellen, Bilder und Links sind je ein eigener Durchgang |
| Nichts verlässt den Rechner | Python-Abhängigkeit überall, wo es läuft |

**Für wen ist das?** Für wiederkehrende Abläufe mit einer klaren Zielform — Release-Präsentationen ins Repository, Wochenberichte ins Wiki.

## Die Lesereihenfolge ist der Punkt, den niemand erwähnt

Die Formen einer Folie liegen in der Reihenfolge des Formbaums, also ungefähr in der Reihenfolge, in der sie angelegt wurden, und genau in der Reihenfolge, in der sie sich überlagern. Das ist nicht die Reihenfolge, in der jemand liest. Eine Folie mit Überschrift, zwei Spalten und einer Bildunterschrift hat eine völlig klare visuelle Lesereihenfolge und womöglich einen Formbaum, der Unterschrift, rechte Spalte, Überschrift, linke Spalte lautet — weil sie über drei Überarbeitungen so entstanden ist.

Jeder Konverter wählt eine Strategie, und sie unterscheiden sich:

- **Dokumentreihenfolge** — Formen so ausgeben, wie die Datei sie auflistet. Vorhersagbar, gelegentlich falsch, nie auf unsichtbare Weise überraschend.
- **Geometrische Reihenfolge** — nach oben, dann links sortieren. Trifft häufiger zu und zerlegt jene Folie, deren Seitenleiste über der Hauptspalte beginnt.
- **Platzhalter zuerst** — Titel, dann Inhaltsplatzhalter, dann der Rest. Gut bei Standardlayouts, schlecht bei gestalteten Folien.

Eine richtige Antwort gibt es nicht, nur eine ausgesprochene. Wenn sich eine umgewandelte Präsentation seltsam liest, liegt es fast immer daran, und die Lösung liegt in der Präsentation: die Formen im Auswahlbereich von PowerPoint in Lesereihenfolge bringen und erneut umwandeln.

## Bilder, Tabellen und alles, was kein Text ist

**Bilder** sind der leichte Gewinn und werden von den meisten Konvertern trotzdem übergangen. Sie sind bereits ausgepackt: Sie liegen in `ppt/media/` als gewöhnliche PNG- und JPEG-Dateien, in voller Auflösung. Eine Umwandlung, die `![](image3.png)` ausgibt und Sie image3 suchen lässt, hat die halbe Arbeit getan; eine, die die Bytes einbettet, gibt Ihnen eine Datei, die Sie verschieben können. [Bilder und Links, die eine Umwandlung überstehen](/blog/images-and-links-that-still-work) geht die Abwägungen durch.

**Tabellen** kommen durch, wenn das Werkzeug `<a:tbl>` liest — dasselbe Tabellenmodell, das Word verwendet. Der Haken sind verbundene Zellen: Eine Folientabelle mit verbundener Kopfzeile hat keine Entsprechung in Markdown, und jedes Werkzeug löst das anders auf, indem es den Wert wiederholt, die Folgezellen leert oder die Zeile fallen lässt. [Tabellen, die eine Umwandlung überstehen](/blog/markdown-tables-that-survive-conversion) sagt, worauf zu achten ist.

**Diagramme** sind eine Datentabelle plus eine Darstellung, abgelegt in einem eigenen Teil mit eingebetteter Arbeitsmappe. Die Darstellung ist ein Bild, die Zahlen dahinter sind echte Daten. Die meisten Konverter nehmen das Bild. Wenn es Ihnen um die Zahlen ging: Sie liegen als kleine `.xlsx` in `ppt/embeddings/`, und eine [Excel → Markdown](/excel-to-markdown) liest sie.

**SmartArt** ist eine Zeichnung, die aus einem kleinen XML-Datenmodell erzeugt wird. Der Text darin ist zu retten, die Grafik nicht — außer in einem Zielformat, das selbst ein Diagrammformat ist.

**Animationen, Übergänge und Einblendreihenfolge** tragen in manchen Präsentationen echte Bedeutung; der ganze Sinn einer Folie kann darin bestehen, dass drei Punkte nacheinander erscheinen. Nichts davon hat eine Markdown-Form. Wenn es zählt, gehört es vor der Umwandlung in die Notizen, nicht danach.

## Eine kurze Prüfliste vor der Umwandlung

1. **Auswahlbereich öffnen** und bei jeder Folie mit ungewöhnlichem Layout die Formreihenfolge prüfen. Das kostet eine Minute und behebt die mit Abstand häufigste Beschwerde über das Ergebnis.
2. **Klären, ob es um die Notizen geht.** Wenn ja, scheiden Gliederungsexport und Kopieren sofort aus — beide kommen nicht an sie heran.
3. **Auf Text in Bildern achten.** Eine Folie, deren Inhalt ein Screenshot einer Tabelle ist, wird zum Bild einer Tabelle. Nichts weiter unten kann das lesen.
4. **Prüfen, wozu die Diagramme da sind.** Geht es um den Verlauf der Linie, nehmen Sie das Bild. Geht es um die Zahlen, holen Sie die eingebettete Arbeitsmappe.
5. **Zuerst eine Folie umwandeln** und lesen. Lesereihenfolge und Notizenbehandlung zeigen sich beide schon auf den ersten zwei Folien, und beides ist früh billig zu entdecken.

## Was daraus folgt

Für eine einzelne Präsentation, aus der Sie den Text einmal brauchen, genügt der Gliederungsexport in dreißig Sekunden — sofern sie aus Platzhaltern gebaut wurde und die Notizen keine Rolle spielen. Überall dort, wo die Notizen zählen, und das sind die meisten erhaltenswerten Präsentationen, steht die Wahl zwischen einem eigenen `python-pptx`-Skript und etwas, das die Teile bereits liest. [Die Umwandlung PowerPoint → Markdown hier](/powerpoint-to-markdown) löst die Foliensortierung über `<p:sldIdLst>` auf, setzt die Notizen jeder Folie als Zitatblock darunter und bettet die Bilder ein, sodass am Ende eine Datei steht — im Browser, die Präsentation wird also nirgendwohin hochgeladen. Beim Nachbarformat stellen sich andere Fragen: [eine .docx umwandeln](/blog/convert-docx-to-markdown) scheitert eher an Formatvorlagen als an der Reihenfolge.
