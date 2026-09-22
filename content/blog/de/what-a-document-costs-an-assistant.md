---
title: "Was ein Dokument einen Assistenten kostet — und wie man es nicht ausgibt"
description: "Ein Token sind etwa 3,5 Zeichen, also landet ein Dokument im Kontextfenster oder nicht — die Rechnung des Umwandelns außerhalb eines Gesprächs"
date: 2026-09-22
tag: Automatisierung
keywords: tokens sparen ki, dokument tokens kontextfenster, dokument ohne ki konvertieren, tokenverbrauch senken claude, markdown tokens, günstiger ki arbeitsablauf
---

Es gibt eine Gewohnheit, die eine Prüfung verdient. Sie haben eine `.docx`, wollen sie als Markdown sehen, und der Assistent ist gerade da — also hängen Sie die Datei an und fragen. Es funktioniert, und es kostet Sie das ganze Dokument zweimal: einmal hinein, einmal heraus. Nichts an dieser Umwandlung brauchte ein Sprachmodell. OOXML zu lesen und Markdown zu schreiben ist Parsen, und Parsen ist ein gelöstes Problem, seit lange bevor es all dies gab.

### Kurz gefasst

Bei Claude entspricht ein Token etwa 3,5 englischen Zeichen (geprüft auf platform.claude.com, 22. September 2026). Diese eine Zahl macht die ganze Frage zu Arithmetik statt zu Meinung. Ein Artikel mit 2.500 Wörtern hat rund 15.000 Zeichen, also etwa 4.300 Token; einen Assistenten um die Umwandlung zu bitten gibt das beim Hineingeben aus und noch einmal beim Zurückschreiben, sagen wir 8.500 für eine Arbeit, die ein Parser umsonst leistet. Ein Dokument mit einem eingebetteten Bild ist um zwei Größenordnungen schlimmer: Ein Megabyte base64 sind etwa 300.000 Token, was in die meisten Kontextfenster überhaupt nicht passt. Ein Verweis auf dasselbe Dokument sind elf.

Die ehrliche Fassung der Behauptung: Ein Dokument außerhalb des Gesprächs umzuwandeln macht kein Modell um irgendeinen Prozentsatz billiger. Es nimmt das Dokument vollständig aus dem Kontextfenster, und was das wert ist, hängt davon ab, wie viel Ihres Gesprächs aus Dokumenttext besteht. Die Formel steht weiter unten, damit Sie Ihre eigene Zahl rechnen können statt meiner zu glauben.

## Die eine Zahl, aus der alles folgt

Anthropics Glossar sagt es unmissverständlich: Ein Token entspricht bei Claude ungefähr 3,5 englischen Zeichen, wobei die genaue Zahl mit der verwendeten Sprache schwankt (geprüft auf platform.claude.com, 22. September 2026). Teilen Sie eine Zeichenzahl durch 3,5 und Sie haben eine brauchbare Schätzung. Verdoppeln Sie sie, wenn der Text nicht englisch ist — die meisten Tokenizer wurden auf Englisch angepasst und geben für alles andere mehr Token je Zeichen aus, was diese Rechnung für ein deutsches Dokument schlechter macht, nicht besser.

Hier sind echte Dateien, gemessen statt geraten:

| Dokument | Wörter | Zeichen | Token, etwa |
| --- | --- | --- | --- |
| Ein langer Blogartikel | 2.513 | 14.921 | 4.300 |
| Eine umfangreiche Projekt-README | 4.654 | 30.138 | 8.600 |
| Ein Megabyte base64-Bild | — | 1.048.576 | 300.000 |
| Ein Verweis auf ein geteiltes Dokument | 5 | 40 | 11 |

Die letzten beiden Zeilen sind die interessanten, und sie sind kein rhetorischer Trick. Ein Bild, das als `data:`-URI in einer Markdown-Datei steckt, ist Text, und Text wird tokenisiert. Wenn Sie ein solches Dokument in ein Gespräch einfügen, liest das Modell jedes Zeichen dieser Kodierung. [Wohin die Bilder gehen, wenn Sie ein Dokument exportieren](/blog/pictures-in-a-document-export) erklärt, warum die Kodierung ein Drittel größer ist als die Datei auf der Festplatte; hier ist die Folge, dass ein einzelner Screenshot mehr Token kosten kann als der gesamte Rest eines langen Berichts.

## Drei Gewohnheiten und was jede ausgibt

### Den Assistenten um die Umwandlung bitten

Das Modell liest das Dokument und schreibt es zurück. Beide Hälften werden berechnet, und bei jeder großen Schnittstelle liegt die Ausgabehälfte über der Eingabehälfte, weil Erzeugen mehr Arbeit ist als Lesen. Für den Artikel von oben sind das etwa 4.300 hinein und 4.300 hinaus.

Was Sie dafür bekommen: eine Umwandlung von etwas, das rät. Ein Modell, das eine `.docx` liest, löst keine Beziehungs-Ids auf, um die Bilder zu finden, liest kein `<w:numPr>`, um zu ermitteln, zu welcher Liste ein Absatz gehört, und sieht die Bytes in `word/media/` überhaupt nicht. Es erzeugt plausibles Markdown, was etwas anderes ist als korrektes Markdown, und die Fehler sind die stillen: eine Überschriftsebene, die verrutscht ist, eine Tabelle, deren verbundene Zelle zu einer zusätzlichen Spalte wurde.

Was ein Parser umsonst liefert: die tatsächliche Antwort, deterministisch, zweimal gleich.

### Ein Dokument einfügen, um es anzusehen

Das ist der Fall, den die Arithmetik wirklich bestraft, und er ist außerordentlich häufig. Sie wollen ein Dokument mitten im Vorgang prüfen — sind die Tabellen erhalten, sieht die Titelei richtig aus, ist Abschnitt vier noch da. Also bitten Sie den Assistenten, es zu zeigen, und er schreibt das Dokument zurück. Das ist die volle Länge des Dokuments als Ausgabe-Token, ausgegeben für einen Akt des Lesens, den ein Browser umsonst leistet.

Eine gerenderte Vorschau kostet nichts. Ein geteilter Verweis kostet elf Token und lässt sich von jemandem öffnen, der überhaupt nicht am Gespräch beteiligt ist. [Ein Markdown-Dokument als Link teilen](/blog/share-a-markdown-document-as-a-link) ist der Mechanismus; hier zählt nur, dass „zeig mir das Dokument“ die mit Abstand teuerste Art ist, ein Dokument anzusehen.

### Das Dokument im Gespräch behalten, während Sie an etwas anderem arbeiten

Kontext wird nicht einmal bezahlt. Jede weitere Runde eines Gesprächs schickt die ganze Vorgeschichte erneut, ein oben eingefügtes Dokument wird also bei jeder folgenden Nachricht wieder bezahlt — und das macht aus einmalig 8.600 Token eine laufende Belastung für den Rest der Sitzung. Zwischenspeicherung verändert bei manchen Schnittstellen den Preis dieser Wiederholung, nicht ihre Tatsache.

Das Dokument stattdessen über einen Verweis zu halten — irgendwo gespeichert, über einen Link adressiert — heißt, dass das Gespräch elf Token trägt, wo es Tausende trug. Das ist der größte Teil des Arguments dafür, [Dokumente über einen Connector umzuwandeln](/blog/converting-documents-from-an-assistant) statt im Chatfenster: Der Werkzeugaufruf gibt eine Adresse zurück, und das Dokument selbst gelangt nie in das Protokoll.

## Die Formel, damit Sie niemandem glauben müssen

Sei **D** die Zeichenzahl des Dokumenttextes in einem Gespräch und **C** die Zeichenzahl von allem anderen — Ihre Fragen, die Überlegungen des Modells, der Code, die Diskussion. Dann ist der Anteil der Token, für die Dokumenttext verantwortlich ist:

```text
document share = D / (D + C)
```

Und die Ersparnis durch Umwandeln außerhalb des Gesprächs ist dieser Anteil, abzüglich dessen, was das Modell tatsächlich lesen muss.

Drei ehrliche Rechenbeispiele:

- **Sie hängen eine Spezifikation mit 30.000 Zeichen an und stellen drei kurze Fragen dazu.** D ist 30.000, C vielleicht 3.000. Dokumenttext macht 91 Prozent des Gesprächs aus — aber Sie brauchten das Modell, um die Spezifikation zu lesen, die Ersparnis ist also null. Sie vorher anderswo umzuwandeln bringt überhaupt nichts.
- **Sie wandeln in einer Sitzung sechs Dokumente um, sehen jedes an und besprechen keines.** D ist alles und C fast nichts. Die Ersparnis geht gegen hundert Prozent, weil nichts davon je im Kontext sein musste.
- **Sie arbeiten wirklich mit einem Assistenten und wandeln nebenbei vier Dateien um, zwei davon sehen Sie an.** Das ist der realistische Fall. Sind diese Dateien zusammen 20.000 Zeichen und das Arbeitsgespräch 60.000, dann ist der Dokumenttext ein Viertel des Ganzen, und die Umwandlungen nach außen zu verlegen entfernt davon fast alles.

In diesem Mittelfeld lebt die ehrliche Behauptung. Dass ein Fünftel bis ein Viertel der Token einer Arbeitssitzung auf Dokumenttext geht, über den niemand das Modell nachdenken lassen wollte, ist völlig gewöhnlich — und hängt ebenso völlig von Ihren Gewohnheiten ab, weshalb ein einzelner beworbener Prozentsatz eine Zahl wäre, die gut klingen soll. Rechnen Sie `D / (D + C)` auf Ihrem eigenen Protokoll und Sie haben eine Zahl, die für Sie stimmt.

## Wenn das Modell es wirklich lesen muss

Das verdient einen eigenen Abschnitt, denn der Rest des Textes ließe sich als „halte Dokumente von Assistenten fern“ missverstehen, und das wäre falsch.

Wenn Sie den Inhalt zusammengefasst, kritisiert, übersetzt, mit einem anderen Dokument verglichen, auf Widersprüche geprüft oder in irgendeiner Weise durchdacht haben wollen — dann muss das Dokument ins Kontextfenster. Das ist keine Verschwendung, das ist die Arbeit. Kein Konverter verringert sie, und wer etwas anderes behauptet, will Ihnen etwas verkaufen. Die einzige sinnvolle Sparsamkeit dort ist, das Dokument in seiner kompaktesten ehrlichen Form zu schicken: Markdown statt HTML, den Text statt der base64-Fassung eines Scans des Textes, die vier einschlägigen Abschnitte statt des ganzen Handbuchs.

Die Unterscheidung ist einfach und lohnt sich zu behalten: **eine Umwandlung ist mechanisch, eine Deutung nicht.** Bezahlen Sie das Modell für die Deutung. Bezahlen Sie es nicht dafür, ein Parser zu sein.

## Wie das in der Praxis aussieht

Vier Änderungen, grob nach Ersparnis geordnet:

1. **Die Datei dort umwandeln, wo die Datei ist.** In einem Browser steckt ein Parser. Eine Umwandlung, die in der Seite passiert, kostet null Token und schickt das Dokument nirgendwohin — was eine Antwort auf die Vertraulichkeit ebenso ist wie auf die Kosten.
2. **Dokumente in einer Anzeige ansehen, nicht in einem Protokoll.** „Schreib es zurück, damit ich nachsehen kann“ ist die teure Gewohnheit. Rendern ist umsonst.
3. **Dokumente über eine Adresse übergeben.** Ein Werkzeug, das einen Link zurückgibt, hält das Dokument aus der Vorgeschichte heraus — und aus jeder Runde danach.
4. **Vor dem Senden entfernen, was niemand braucht.** Titelei, Navigation, wiederkehrende Textbausteine und eingebettete Bilder sind alle Token, und für die meisten Fragen trägt keines davon die Antwort.

Fünfzehn Umwandlungen hier laufen im Browser, und ein Connector stellt einem Assistenten dieselben Umwandlungen als Werkzeugaufrufe bereit, die einen Link zurückgeben und kein Dokument. Gebaut ist es so wegen der Arithmetik von oben und nicht umgekehrt: Ein Dokument, das nie ins Protokoll gelangt, ist das einzige, für das Sie sicher nicht zweimal bezahlen. Für die Variante über eine Schnittstelle sagt [Dokumente mit einer API umwandeln](/blog/converting-documents-with-an-api), wie das aus einem Skript geht, wo die Tokenzahl von Bauart null ist.
