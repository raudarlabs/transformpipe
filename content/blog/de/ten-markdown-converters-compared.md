---
title: "Zehn Markdown-Konverter, verglichen nach dem, was sie nicht lesen"
description: "Jeder Vergleich zählt unterstützte Formate. Nützlich ist die andere Zahl — was zehn Konverter verweigern und ob sie es vorher sagen oder erst hinterher"
date: 2026-09-22
tag: Konvertieren
keywords: markdown konverter vergleich, bester markdown konverter, pandoc vs markitdown, docling vergleich, dokumentkonverter vergleich, dokument in markdown umwandeln werkzeug
---

Die Startseite jedes Konverters zählt nach oben: dreihundert Formate, fünfundzwanzigtausend Umwandlungen. Die Zahl stimmt und nützt fast nichts, denn eine Formatliste ist eine Liste von Dingen, die nicht sofort einen Fehler werfen. Was diese Werkzeuge unterscheidet, ist die andere Liste — die niemand veröffentlicht — dessen, was jedes überhaupt nicht liest, was es liest und still verwirft, und ob Sie es erfahren, bevor Sie sich auf das Ergebnis verlassen, oder drei Dokumente später.

### Kurz gefasst

Zehn Werkzeuge, geprüft an ihrer eigenen Dokumentation am 22. September 2026. Pandoc liest `docx` und `epub` und seit 3.8.3 auch `pptx` und `xlsx` — wobei der Folien-Leser alpha ist und keine Sprechernotizen mitnimmt. calibre erreicht Markdown über seinen Textexporter und entfernt jeden Link, sofern Sie nicht zwei Schalter setzen. LibreOffice Writer kann Markdown inzwischen direkt speichern, als CommonMark. Google Docs kann es exportieren, wobei die Kopieren-und-Einfügen-Hälfte standardmäßig aus ist. MarkItDown liest PowerPoint einschließlich der Sprechernotizen. Docling liest die breiteste Eingabeliste von allen hier. CloudConvert wandelt eine Präsentation nach Markdown und führt EPUB nicht als Quelle. Turndown liest HTML und sonst nichts, mit Absicht. Mammoth liest `.docx` und erzeugt HTML, kein Markdown. python-pptx gibt Ihnen die Bestandteile und überhaupt kein Ausgabeformat.

Keines davon ist schlecht. Jedes wurde für eine andere Problemform gebaut, und die Abweichung zwischen dieser Form und Ihrer ist der Ort, an dem Umwandlungen schiefgehen.

## Die sieben Fragen, die tatsächlich unterscheiden

Formate zu zählen verdeckt die Unterschiede. Diese sieben nicht:

1. **Verlässt die Datei Ihren Rechner?**
2. **Liest es den Container oder nur den Text?** Eine `.pptx` ist ein ZIP aus XML-Teilen; wer `ppt/slides/*.xml` liest und aufhört, ist ein anderes Werkzeug als eines, das auch `ppt/notesSlides/` und `ppt/media/` öffnet.
3. **Was passiert mit den Bildern** — eingebettet, neben die Datei geschrieben oder in einen Ordner verwiesen, den es nicht gibt?
4. **Sagt es, was es fallen gelassen hat?** Schweigen ist die teure Eigenschaft.
5. **Ist Markdown Ziel oder Nebenprodukt?** Ein Textexporter, dem ein Markdown-Modus gewachsen ist, verhält sich anders als ein Konverter, der auf Markdown zielt.
6. **Kann es einen Ordner als ein Dokument lesen?** Ein Export aus Notion, Confluence oder Obsidian ist viele Dateien und ein Dokument.
7. **Muss man installieren, sich anmelden, oder keines von beidem?**

## Die Tabelle

Geprüft an der jeweils eigenen Dokumentation, 22. September 2026.

| Werkzeug | Läuft | Liest pptx | Liest epub | Markdown ist | Bilder |
| --- | --- | --- | --- | --- | --- |
| Pandoc | Lokal | Ja, seit 3.8.3; keine Notizen | Ja | Ein vollwertiges Ziel | `--extract-media` schreibt sie aus |
| calibre | Lokal | Nein | Ja | Ein TXT-Ausgabemodus | Verweise nur mit Schalter |
| LibreOffice Writer | Lokal | Öffnet die Präsentation, speichert aus Writer | Ja | Ein Speichern-unter-Filter, CommonMark | In den Docs nicht behandelt |
| Google Docs | Gehostet | Öffnet sie, exportiert aus Docs | Nein | Herunterladen und Importieren | In den Docs nicht behandelt |
| MarkItDown | Lokal | Ja, mit Notizen | Ja | Das einzige Ziel | Dateinamen, auf Wunsch data-URIs |
| Docling | Lokal | Ja | Ja | Eine von mehreren Ausgaben | Eingebettet oder verwiesen |
| CloudConvert | Gehostet | Ja | Für md nicht gelistet | Eine Ausgabe unter Hunderten | Serverseitig, laut Dienst |
| Turndown | Eine Bibliothek | Nein | Nein | Das einzige Ziel | Aus dem HTML durchgereicht |
| Mammoth | Eine Bibliothek | Nein | Nein | Wird nicht erzeugt — HTML schon | Ein Rückruf, den Sie schreiben |
| python-pptx | Eine Bibliothek | Ja, samt Notizen | Nein | Es wird nichts erzeugt | `shape.image.blob`, Ihre Sache |

## Was jedes ist, in einem Absatz

**Pandoc** ist die Referenzumsetzung der Idee, dass Dokumente eine gemeinsame Struktur haben. Seine Formatliste ist auf eine Weise unsymmetrisch, die man nachschlagen statt erinnern sollte: `docx` und `epub` stehen als Leser wie als Schreiber, und `pptx` war nur ein Schreiber, bis Version 3.8.3 am 1. Dezember 2025 einen Leser dafür brachte, zusammen mit einem für `xlsx`. Dieser Leser ist als alpha gekennzeichnet und öffnet keinen Notizenteil: Die Präsentation wird umgewandelt, ihre Sprechernotizen nicht. Für alles, was es liest, ist es das getreueste und am besten skriptbare Werkzeug hier. [Leichtere Alternativen](/blog/pandoc-alternatives-for-markdown-to-html) gibt es für den Einzeldateifall.

**calibre** wandelt E-Books um, und Markdown ist über seine Textausgabe erreichbar: `--txt-output-formatting=markdown`. Der Haken ist dokumentiert und in der Praxis stumm — bei reiner Textausgabe werden Links immer entfernt, ohne `--keep-links` und `--keep-image-references` erhalten Sie also ein sauberes, lesbares, linkfreies Buch und keinen Hinweis darauf, dass vierhundert Links darin waren. Es ist außerdem der nachsichtigste Leser fehlerhafter EPUBs, was mehr zählt, als es sollte.

**LibreOffice Writer** speichert Markdown inzwischen direkt: Datei, Speichern unter, Markdown-Dokument (.md), und die Dokumentation sagt, dass die CommonMark-Spezifikation umgesetzt ist. Das ist eine bedeutsame Änderung — jahrelang lautete der Standardrat, über HTML zu gehen — und die Dokumentation sagt nicht, was aus Bildern und Tabellen wird, was genau die Lücke ist, die man am eigenen Dokument prüft, bevor man ihr fünfzig anvertraut.

**Google Docs** importiert und exportiert Markdown, der Export standardmäßig eingeschaltet; „Als Markdown kopieren“ und „Aus Markdown einfügen“ sind getrennt und aus, bis Sie sie unter Extras, Einstellungen, Markdown aktivieren einschalten. Es ist der Konverter, den die meisten ohnehin haben, und seine Grenzen sind die naheliegenden: Ihr Dokument liegt bereits auf einem fremden Server, und was Docs nicht darstellen konnte, ging beim Hineingehen verloren, nicht beim Herausgehen.

**MarkItDown** von Microsoft zielt geradewegs auf Markdown und liest PowerPoint richtig — einschließlich `slide.has_notes_slide`, das es unter einer Überschrift `### Notes:` ausschreibt. Bilder kommen standardmäßig als Dateinamensverweise heraus und auf Wunsch als data-URIs; Diagramme werden zu Tabellen, wo es sie lesen kann, und zu einem ausdrücklichen `[unsupported chart]`, wo nicht. Dieses letzte Detail ist die gute Gewohnheit: Es sagt, was es nicht konnte.

**Docling** von IBM liest die breiteste Liste hier — Office-Formate, OpenDocument, PDF, EPUB, HTML, Bilder und mehr — und schreibt Markdown unter mehreren Ausgaben. Es ist das schwerste der lokalen Werkzeuge und dasjenige, zu dem man greift, wenn die Eingabe ein Haufen gemischter Formate ist und nicht ein bekanntes.

**CloudConvert** wandelt eine Präsentation nach Markdown, was die meisten hier nicht können, dazu `docx`, `odt`, `rtf`, `pdf` und rund zwanzig weitere. EPUB gehört nicht zu den Quellen, die es für Markdown-Ausgabe nennt. Es ist ein Server, das Dokument wird also hochgeladen, und das ist die erste Frage und nicht die letzte. [Ob ein Online-Konverter sicher ist](/blog/is-an-online-converter-safe) handelt davon, wie man das prüft, statt es anzunehmen.

**Turndown** wandelt HTML in Markdown und nimmt sonst nichts. Das ist keine Beschränkung, sondern die Konstruktion, und deshalb hat fast jedes andere JavaScript-Werkzeug in diesem Feld am Ende Turndown oder einen Verwandten darunter. [Die HTML-nach-Markdown-Bibliotheken](/blog/turndown-and-html-to-markdown-libraries) unterscheiden sich vor allem in den unangenehmen Fällen.

**Mammoth** liest `.docx` und erzeugt HTML, und zwar absichtlich: Es bildet Words Formatvorlagen auf semantische Elemente ab und ignoriert das Optische. Markdown erzeugt es nicht, es ist also eine halbe Kette, und seine eigene Dokumentation ist deutlich, dass die Abweichung zwischen `.docx`-Struktur und HTML-Struktur bedeutet, dass komplizierte Dokumente nicht perfekt konvertieren. [Wie sich mammoth und die docx-Parser unterscheiden](/blog/mammoth-js-and-docx-parsers) sagt den Rest.

**python-pptx** liest eine Präsentation richtig — Foliensortierung über die Id-Liste aufgelöst, `Slide.notes_slide.notes_text_frame` für die Notizen, `shape.image.blob` für die Bilder — und erzeugt nichts. Es ist eine Bibliothek zum Bauen eines eigenen Konverters, und der Grund, warum es in einem Konvertervergleich auftaucht, ist, dass es bei wiederkehrender PowerPoint-Arbeit häufig die richtige Antwort ist. [PowerPoint in Markdown umwandeln](/blog/convert-powerpoint-to-markdown) enthält ein lauffähiges Skript.

## Wo das Werkzeug hinter dieser Seite steht, einschließlich dessen, was es nicht kann

TransformPipe wandelt fünfzehn Dinge von und nach Markdown im Browser, was die Fragen eins, drei und sieben beantwortet: Die Datei wird nicht hochgeladen, die Bilder werden als data-URIs eingebettet, sodass das Ergebnis eine Datei ist, und es gibt nichts zu installieren. Es liest die Container statt des Textes — Foliensortierung aus `<p:sldIdLst>`, Kapiteltitel aus dem Navigationsdokument eines EPUB, Evernote-Ressourcen über MD5 zugeordnet — und es liest einen Exportordner als ein Dokument mit Inhaltsverzeichnis, was Frage sechs beantwortet.

Die ehrliche andere Hälfte:

- **Kein PDF als Eingabe.** Ein PDF sind Zeichen an Koordinaten, und daraus Struktur zu rekonstruieren ist ein anderes Handwerk. CloudConvert, Docling und MarkItDown lesen alle PDF; dies nicht.
- **Kein LaTeX, kein reStructuredText, kein altes `.doc` oder `.ppt`.** Pandoc deckt die ersten beiden ab, LibreOffice die letzten beiden.
- **Eine Grenze von vier Megabyte** für ein gespeichertes Dokument, die aus einer Plattformgrenze folgt und nicht aus einer Wahl, davon zwei Megabyte für Bilder.
- **Kein Stapelwerkzeug.** Fünfhundert Dateien umzuwandeln gehört in ein Skript mit Pandoc oder Docling darin, nicht in einen Browsertab.
- **Browserseitig heißt, Ihr Rechner arbeitet,** eine sehr große Datei ist also durch den Speicher des Tabs begrenzt und nicht durch die Geduld eines Servers.

Ein Vergleich, in dem das verkaufte Werkzeug jede Zeile gewinnt, ist kein Vergleich. Diese fünf Zeilen sind die, in denen ein fremdes Werkzeug die richtige Antwort ist, und zu wissen, auf welcher Zeile Sie stehen, ist die ganze Übung.

## Wie man in einem Durchgang wählt

- **Das Dokument ist vertraulich.** Browserseitig oder offline. Das scheidet die gehosteten Dienste vor jeder Funktionsfrage aus, und es ist keine Frage des Vertrauens in eine Richtlinie — es ist im Netzwerk-Tab beobachtbar.
- **Die Umwandlung wiederholt sich.** Pandoc oder Docling in einem Skript. Eine Webseite, die ein Mensch öffnen muss, ist keine Pipeline.
- **Die Eingabe ist ein Haufen gemischter Formate, PDFs eingeschlossen.** Docling.
- **Es ist eine Präsentation und die Notizen zählen.** MarkItDown, python-pptx oder ein Konverter, der die Notizenteile öffnet.
- **Es ist ein Buch.** Pandoc mit `--extract-media` oder calibre mit beiden `--keep`-Schaltern.
- **Es ist eine Datei, jetzt, und Sie wollen das Ergebnis ansehen.** Ein browserseitiger Konverter, denn der Umweg über Hochladen, Warteschlange und Herunterladen dauert länger als die Umwandlung.
- **Sie bauen das in Software ein.** Eine Bibliothek — Turndown, Mammoth, python-pptx — und die Einsicht, dass Sie jetzt einen Konverter pflegen.

## Das Testdokument, das man behält

Was immer Sie wählen: Der ehrliche Vergleich dauert zehn Minuten. Bauen Sie ein Dokument mit den sechs Dingen, die brechen: eine Überschrift, die aus fettem Text statt aus einer Überschriftenvorlage kam, eine Tabelle mit verbundener Zelle, ein Bild, eine Fußnote, eine verschachtelte Liste und ein Verweis auf eine andere Datei desselben Exports. Lassen Sie es durch zwei oder drei Kandidaten laufen und lesen Sie das Ergebnis.

Jeder Unterschied aus der Tabelle oben zeigt sich in diesem einen Dokument — und zwar für Ihre Dokumente statt für die eines Rezensenten. Die Formatzahl auf der Startseite hätte Ihnen nichts davon gesagt. Für das weitere Feld, einschließlich der gehosteten Dienste, der Office-Pakete und des browsereigenen Speichern unter, sortiert [die Übersicht der Online-Dokumentkonverter](/blog/best-online-document-converters) stattdessen danach, wohin die Datei geht.
