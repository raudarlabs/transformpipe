---
title: "Die besten Online-Dokumentkonverter 2026: wohin Ihre Datei wirklich geht"
description: "Online-Dokumentkonverter danach verglichen, was mit Ihrer Datei geschieht: Werkzeuge im Browser, die nichts hochladen, gehostete Dienste und ihre Aufbewahrung"
date: 2026-09-07
tag: Konvertieren
keywords: online dokumentkonverter, bester online dokumentkonverter, dokumente online konvertieren ohne upload, dokumentkonverter im browser, kostenloser dateikonverter online, api für dokumentkonvertierung, dokumente offline konvertieren, wie lange speichern konverter meine dateien
---

Die Wahl eines Online-Dokumentkonverters sieht nach einem Funktionsvergleich aus und ist in Wahrheit eine Frage der Geografie. Ihre Datei bleibt entweder auf Ihrer Maschine, oder sie geht auf die von jemand anderem. Alles Übrige — die Formatliste, das Feld zum Hineinziehen, der ordentliche Fortschrittsbalken — sitzt auf diesem einen Unterschied auf, und keine Preisseite schreibt ihn in die Tabelle.

### Kurzfassung

Wählen Sie danach, wohin die Datei geht, nicht danach, wie viele Formate aufgezählt werden. Ein Konverter, der in Ihrem Browser läuft, verarbeitet die Datei auf Ihrer eigenen Maschine, lädt nichts hoch und lässt Sie das beweisen, indem Sie einem leeren Netzwerk-Tab zusehen — das ist die richtige Voreinstellung für alles, was Sie nicht für die Öffentlichkeit geschrieben haben. Ein serverseitiger Dienst wie CloudConvert, Convertio, Zamzar oder FreeConvert bewältigt Formate, die ein Browser nicht kann, zum Preis eines Uploads und einer Aufbewahrungsrichtlinie, der Sie zustimmen. Pandoc ist die Offline-Antwort, wenn die Konvertierung sich wiederholen, in einer Pipeline laufen oder Formate berühren muss, die niemandes Webseite unterstützt.

## Die Frage, die niemand auf die Preisseite schreibt

Die Startseite jedes Konverters wirbt mit denselben drei Versprechen: schnell, kostenlos, Hunderte von Formaten. Keines dieser drei sagt Ihnen, ob das Dokument, das Sie gleich konvertieren, das Haus verlässt. Das ist das einzige Versprechen, an dem eine Folge hängt, und es liegt meist vier Klicks tief in einer Datenschutzseite, formuliert als Beruhigung statt als Tatsache.

Es gibt drei ehrliche Positionen, die ein Konverter einnehmen kann. Er kann die Arbeit in Ihrem Browser erledigen, dann wird nichts hochgeladen und es gibt nichts aufzubewahren. Er kann die Datei auf einen Server laden, sie dort konvertieren und sie nach einem Zeitplan löschen — dann ist der Zeitplan das Produkt. Oder er kann auf Ihrer eigenen Maschine außerhalb des Browsers laufen, dann ist das Netz überhaupt nicht beteiligt und Sie tragen die Kosten einer Installation. Die meisten Werkzeuge gehören zur zweiten Gruppe. Die meisten Menschen nehmen an, sie gehörten zur ersten.

Das Zweite, womit niemand wirbt, ist, was Sie zurückbekommen. „Konvertiert“ ist kein einzelnes Ergebnis. Ein Konverter kann Ihnen eine vollständige Datei aushändigen, die sich von allein öffnet, ein Fragment, das eine Hülle braucht, die Sie selbst schreiben müssen, oder ein ZIP mit dem Dokument, einem Ordner voller Bilder und einem Stylesheet, das es daneben zu finden erwartet. Alle drei werden auf der Schaltfläche gleich beschrieben. Nur das erste übersteht es, per E-Mail verschickt zu werden.

Und das Dritte ist feiner: Ein Konverter kann eine Ausgabe erzeugen, die auf der Seite, auf der Sie konvertiert haben, richtig aussieht und überall sonst falsch, weil das Ergebnis still von einer Schrift oder einem Stylesheet abhängt, das aus einem Netz geholt wird, das der Empfänger vielleicht nicht hat. Eine Datei, die das Netz braucht, um wie sie selbst auszusehen, ist nicht eigenständig, gleichgültig was die Schaltfläche zum Herunterladen angedeutet hat.

## Der schnelle Vergleich: der Spickzettel

| Werkzeug | Am besten für | Entscheidende Fähigkeit | Preis |
| --- | --- | --- | --- |
| TransformPipe | Ein Dokument konvertieren, ohne es hochzuladen | Konvertierung im Browser, eigenständiger HTML-Export, API und CLI | Kostenlos |
| Pandoc | Wiederholbare Konvertierung zwischen vielen Formaten | Markup-, HTML-, Office-, TeX- und E-Book-Formate, Vorlagen, `--standalone`, `--embed-resources` | Kostenlos, GPL |
| LibreOffice (headless) | Office-Formate offline, in großer Zahl | `--convert-to` für Word, Excel, PowerPoint, ODF, PDF | Kostenlos, MPL 2.0 |
| CloudConvert | Eine API, auf der Sie bauen können | Formatbreite, Regionsauswahl, Dateien nach der Verarbeitung gelöscht | Kostenlose Stufe: 10 Konvertierungen/Tag |
| Convertio | Einmalige Konvertierung eines ungewöhnlichen Formats | Sehr breite Formatliste, Web und API | Kostenlose Stufe, danach ab 11,99 $/Monat |
| Zamzar | Gelegentliche Konvertierung im Stil eines Desktop-Programms | Seit langem laufender Dienst, Web und API | Kostenlos: 2 Dateien/24 h, danach ab 12 $/Monat |
| FreeConvert | Medien- und Dokumentkonvertierung nach Minuten | Abgerechnet in Konvertierungsminuten statt in Dateien | Kostenlos: 20 Minuten/Tag, danach ab 12,99 $/Monat |
| Adobe Acrobat online | Alles, wo PDF die Quelle oder das Ziel ist | PDF-Export und -Import mit Acrobats eigener Engine | Kostenlose Werkzeuge mit Grenzen; der Rest im Abonnement |
| Google Docs / Microsoft 365 | Eine Konvertierung, für die Sie schon zahlen | `.docx` importieren, HTML, PDF, reinen Text exportieren | Im Konto enthalten |
| Gotenberg | Serverseitige Konvertierung, die Sie selbst betreiben | Zustandslose Docker-API um LibreOffice und Chromium | Kostenlos, MIT |
| Bibliotheken im eigenen Code | Eine Konvertierung innerhalb einer Anwendung | marked, Turndown, mammoth, Papa Parse und ihre Entsprechungen | Kostenlos, quelloffen |
| Browser „Speichern unter“ / „Als PDF drucken“ | Die Konvertierung, die Sie schon installiert haben | Speichert eine Seite als PDF oder als HTML plus Ressourcenordner | Kostenlos |

## Die besten Online-Dokumentkonverter 2026

### TransformPipe — am besten, um ein Dokument ohne Upload zu konvertieren

TransformPipe konvertiert Markdown zu HTML sowie HTML, Word-`.docx`, CSV, TSV und JSON zu Markdown, und zwar im Browser. Abgemeldet wird die Datei auf Ihrer eigenen Maschine gelesen, geparst und dargestellt und nie irgendwohin gesendet. Der HTML-Export ist eine einzige vollständige Datei mit eingebetteten Stilen, was bedeutet, dass sie sich auf einem Laptop ohne Verbindung genauso öffnet wie auf Ihrem.

| Vorteile | Nachteile |
| --- | --- |
| Abgemeldet wird nichts hochgeladen, und der Netzwerk-Tab beweist es | Der Browser macht die Arbeit, eine sehr große Datei ist also von der Maschine begrenzt |
| Der HTML-Export ist eine einzelne Datei, die nichts aus dem Netz anfordert | Kein Universalkonverter: kein Video, kein Audio, keine Bilder, kein PDF zu Word |
| Rohes HTML läuft durch einen Filter mit einer festen Positivliste | Ein Dokument zur Zeit, oder mehrere zu einem zusammengeführt — kein Seiten-Build |
| Dieselbe Konvertierung gibt es als REST-API, als CLI, als GitHub Action und als MCP-Server | Keine Vorlagensprache für maßgeschneiderte Layouts |

**Preis:** kostenlos. Ein Konto bringt Verlauf, Freigaben und API-Zugang, ebenfalls kostenlos.

**Technische Details und Funktionen**

- Markdown zu HTML mit GitHub Flavored Markdown: Tabellen, Aufgabenlisten, Durchstreichung, Autolinks, eingezäunter Code
- HTML, `.docx`, CSV, TSV und JSON zu Markdown auf derselben Seite, ohne Installation und ohne Konto
- Die Ausgabe ist ein vollständiges Dokument — Doctype, Head, eingebettetes `<style>` — oder schlichtes `.md`, oder ein PDF über den Druckdialog des Browsers
- Rohes HTML in der Eingabe wird gegen eine einzige Positivliste gefiltert, im Browser wie auf dem Server
- Eine abhängigkeitsfreie CLI und eine GitHub Action für dieselbe Konvertierung in einer Pipeline

**Wer sollte es verwenden?** Jeden, der ein Dokument konvertiert, das nicht bereits öffentlich ist — einen Vertrag, den Entwurf eines Kunden, einen internen Plan, einen Export aus einer Notiz-App. Es ist außerdem der kürzere Weg für die bestimmte Aufgabe, aus Markdown eine Seite zu machen, die Sie verschicken können, was [an anderer Stelle ausführlich gegen die Bibliotheken und Desktop-Werkzeuge abgewogen wird](/blog/best-markdown-to-html-converters).

### Pandoc — am besten für wiederholbare Konvertierung zwischen vielen Formaten

Pandoc ist ein Dokumentkonverter für die Kommandozeile, geschrieben in Haskell, der rund vierzig Formate liest und schreibt, darunter Markdown, HTML, LaTeX, EPUB, Word und OpenDocument. Er läuft auf Ihrer Maschine, es verlässt sie also keine Datei, und er ist das einzige Werkzeug hier, dessen Formatmatrix es ernsthaft mit den gehosteten Diensten aufnimmt.

| Vorteile | Nachteile |
| --- | --- |
| Konvertiert zwischen Formaten, um die sich kein Webdienst kümmert | Verlangt eine Installation und ein Terminal |
| Läuft vollständig offline, das Netz ist also nicht Teil der Vertrauensfrage | Vorlagen, Filter und Dialekt-Flags sind eine echte Lernkurve |
| `--standalone` und `--embed-resources` erzeugen eine vollständige Datei | Kein Filtern: rohes HTML geht unverändert hindurch |
| Skriptfähig, dieselbe Konvertierung wiederholt sich also nächsten Monat identisch | Seine Markdown-Dialekte weichen von GFM auf Weisen ab, die Leute überraschen |

**Preis:** kostenlos, GPL-lizenziert.

**Technische Details und Funktionen**

- Leser und Schreiber werden ausdrücklich gewählt, darunter `commonmark`, `gfm`, `html`, `docx` und `latex`
- `--standalone` packt die Ausgabe in ein vollständiges Dokument; `--embed-resources` bettet Bilder und CSS ein
- `--template` und Lua-Filter, um das Dokument mitten in der Konvertierung umzuschreiben
- `--sandbox` beschränkt den Zugriff auf das Dateisystem, wenn Sie eine Datei konvertieren, der Sie nicht trauen
- `--reference-doc` trägt Word-Formatierung in die `.docx`-Ausgabe
- Die Formatliste ist unsymmetrisch: [EPUB](/blog/convert-epub-to-markdown) wird gelesen, PowerPoint dagegen nur geschrieben — [eine Präsentation braucht einen anderen Weg](/blog/convert-powerpoint-to-markdown)

**Wer sollte es verwenden?** Jeden, dessen Konvertierung mehr als einmal passiert: ein Dokumentations-Build, eine Manuskript-Pipeline, ein Veröffentlichungsprozess. Für eine einzelne Datei und einen wartenden Menschen ist Pandoc mehr Werkzeug, als die Aufgabe braucht, und [die leichteren Möglichkeiten sind es wert, sie zu kennen](/blog/pandoc-alternatives-for-markdown-to-html), bevor Sie ein Haskell-Binary installieren.

### LibreOffice headless — am besten für Office-Formate offline

LibreOffice ist ein Büropaket für den Desktop, und sein Kommandozeilenmodus ist ein Dokumentkonverter, den die meisten Menschen bereits installiert haben, ohne es zu bemerken. `soffice --headless --convert-to` liest und schreibt Word-, Excel-, PowerPoint- und OpenDocument-Dateien und exportiert PDF, auf Ihrer eigenen Maschine.

| Vorteile | Nachteile |
| --- | --- |
| Beherrscht die Microsoft-Formate nativ, offline, in großer Zahl | Eine sehr große Installation für ein Konvertierungswerkzeug |
| Kostenlos und quelloffen, ohne Konto und ohne Upload | Komplexes Word-Layout übersteht den Hin- und Rückweg nicht immer |
| Skriptfähig über ein ganzes Verzeichnis | Der HTML-Export ist angestaubt und kein Dokument, das Sie verschicken würden |
| Dieselbe Engine, die viele gehostete Dienste hinter ihrer API betreiben | Ein Prozess zur Zeit, sofern Sie die Benutzerprofile nicht sorgfältig verwalten |

**Preis:** kostenlos, MPL-2.0-lizenziert.

**Technische Details und Funktionen**

- `--convert-to` mit einem Zielfilter und `--outdir` für das Ausgabeverzeichnis
- Liest und schreibt `.docx`, `.xlsx`, `.pptx`, ODF-Formate und CSV
- PDF-Export mit eigenen Optionen, darunter PDF/A
- Läuft unter Windows, macOS und Linux und in einem Container

**Wer sollte es verwenden?** Teams, die Bürodokumente in größerer Zahl konvertieren und bei denen die Dokumente das Netz nicht verlassen dürfen. Wenn Sie je eine `.docx` in einen Web-Konverter eingefügt haben, weil Sie den Text daraus brauchten, ist das die Fassung davon, bei der nichts hochgeladen wird.

### CloudConvert — bester serverseitiger Konverter, auf dem man bauen kann

CloudConvert ist ein gehosteter Konvertierungsdienst, dessen Schwerpunkt eine API ist statt ein nachträglicher Einfall. Ihre Datei wird hochgeladen, in einem Container konvertiert und zurückgegeben. Es ist die serverseitige Möglichkeit, die am klarsten sagt, was mit der Datei geschieht, während sie dort liegt.

| Vorteile | Nachteile |
| --- | --- |
| Eine dokumentierte API, mit der Weboberfläche als deren Client | Die Datei wird hochgeladen — das ist das Modell, keine Einstellung |
| Erklärt, dass Dateien nur zur Verarbeitung gehalten und danach sofort gelöscht werden | Die kostenlose Stufe ist klein genug, um eher ein Test als ein Tarif zu sein |
| Die Region der Verarbeitung lässt sich wählen | Credits sind eine Einheit, die Sie erst in Ihre eigene Arbeitslast übersetzen müssen |
| Jede Aufgabe läuft in einem eigenen, isolierten Container | Kein Offline-Modus, schon per Definition |

**Preis:** die kostenlose Stufe umfasst 10 Konvertierungen am Tag. Sie begrenzt die Datei auf 1 GB, die Verarbeitung auf fünf Minuten und die gleichzeitigen Aufgaben auf fünf. Bezahlte Nutzung wird als Credit-Paket oder als Abonnement verkauft, über einen Schieberegler nach Volumen bepreist, mit individuellen Enterprise-Preisen darüber (geprüft auf cloudconvert.com/pricing, 8. September 2026).

**Technische Details und Funktionen**

- REST-API mit Aufträgen, die sich aus Import-, Konvertierungs- und Export-Aufgaben zusammensetzen
- Dokumente, Tabellen, Präsentationen, Bilder, Audio, Video und Archive
- Auswahl der Region, in der die Konvertierung läuft (geprüft auf cloudconvert.com/security, 8. September 2026)
- SSL für die Übertragung und eine erklärte Richtlinie, nichts dauerhaft zu speichern

**Wer sollte es verwenden?** Entwickler, die einen einzigen Konvertierungs-Endpunkt für Formate brauchen, die ein Browser nicht anfassen kann, und die für die betreffenden Dokumente einen Upload hinnehmen können. Die Klarheit der Aussage zur Aufbewahrung ist der Grund, es dem werbefinanzierten Ende des Marktes vorzuziehen.

### Convertio — am besten für die einmalige Konvertierung eines ungewöhnlichen Formats

Convertio ist ein browsergestützter Dienst mit einer der breitesten Formatlisten überhaupt. Sie legen eine Datei ab, sie wird hochgeladen, auf dem Server konvertiert, Sie laden das Ergebnis herunter. Es ist das Werkzeug, das am verlässlichsten von der Endung gehört hat, die Sie gerade in der Hand halten.

| Vorteile | Nachteile |
| --- | --- |
| Formatabdeckung, die weit über Dokumente hinausgeht | Jede Konvertierung ist ein Upload, auch die vertraulichen |
| Keine Installation, funktioniert auf dem Telefon so gut wie auf dem Laptop | Konvertierte Dateien liegen nach der eigenen Richtlinie 24 Stunden beim Dienst |
| Dieselben Konvertierungen auch über eine API verfügbar | Die kostenlose Nutzung ist über die Dateigröße gedeckelt statt klar über eine Anzahl |
| Formatierung und Struktur der Ausgabe sind die Entscheidungen des Werkzeugs, nicht Ihre | Die bezahlten Stufen sind auf ein Volumen bepreist, das Sie vielleicht nicht haben |

**Preis:** die nicht registrierte Nutzung ist auf eine maximale Dateigröße von 1 GB gedeckelt. Bezahlte Tarife beginnen bei monatlicher Abrechnung mit 11,99 $ im Monat für Lite, 22,99 $ für Basic und 44,99 $ für Pro. Die Jahresraten liegen darunter, und darüber gibt es eine individuelle Stufe (geprüft auf convertio.co/pricing, 8. September 2026).

**Technische Details und Funktionen**

- Konvertierungen für Dokumente, Bilder, Audio, Video, Archive, E-Books, Schriften und Präsentationen
- Weboberfläche plus eine REST-API mit demselben Katalog
- Erklärt: hochgeladene Dateien werden sofort gelöscht, konvertierte nach 24 Stunden (geprüft auf convertio.co, 8. September 2026)
- Konvertierungen werden serverseitig in eine Warteschlange gestellt, eine große Datei ist also nicht von Ihrer Maschine begrenzt

**Wer sollte es verwenden?** Jeden mit einer Datei in einem Format, das sonst nichts liest, und ohne ein Vertraulichkeitsproblem — ein öffentlicher Datensatz, eine Schrift, ein Video, ein Dokument, das ohnehin schon im Netz steht. Es ist das falsche Werkzeug für ein Dokument, das noch nicht veröffentlicht ist.

### Zamzar — am besten für gelegentliche Konvertierung mit einer klaren kostenlosen Grenze

Zamzar ist einer der am längsten laufenden Online-Konverter und einer der wenigen, die ihr kostenloses Kontingent als Zahl nennen statt als Gefühl. Das Modell ist dasselbe wie bei Convertio: hochladen, auf dem Server konvertieren, herunterladen.

| Vorteile | Nachteile |
| --- | --- |
| Die kostenlose Grenze ist eine genannte Dateianzahl, keine vage Fair-Use-Linie | Zwei Dateien am Tag sind ein wirklich kleines Kontingent |
| Die Aufbewahrung ist in schlichten Sätzen dokumentiert | Eine gescheiterte Konvertierung bedeutet, dass Ihr Original länger gehalten wird |
| API neben der Weboberfläche verfügbar | Der Upload ist unvermeidlich |
| Einfach, stabil und berechenbar | Die kostenlose Obergrenze für die Dateigröße schließt viele echte Dokumente aus |

**Preis:** der kostenlose Dienst konvertiert bis zu 2 Dateien in einem beliebigen Zeitraum von 24 Stunden, mit einer Upload-Grenze von 50 MB. Bezahlte Tarife sind 12 $ im Monat für Basic (50 Desktop-Konvertierungen am Tag, 200-MB-Dateien), 19 $ für Pro (100 am Tag, 400 MB) und 39 $ für Business (500 am Tag, 2 GB). Geprüft auf zamzar.com und secure.zamzar.com, 8. September 2026.

**Technische Details und Funktionen**

- Dokumente, Bilder, Audio, Video, E-Books und Archive
- Eine konvertierte Datei wird höchstens 24 Stunden gespeichert, damit Sie sie herunterladen können; scheitert eine Konvertierung, wird das Original für den Support bis zu sieben Tage gehalten (geprüft auf zamzar.com/faq, 8. September 2026)
- Konvertierungs-API mit demselben Formatkatalog
- Obergrenzen für die Dateigröße pro Tarif statt einer einzigen globalen Grenze

**Wer sollte es verwenden?** Leute, die hin und wieder eine Datei konvertieren und genau wissen wollen, was die kostenlose Stufe erlaubt. Das Halten gescheiterter Konvertierungen über sieben Tage ist die Einzelheit, die man abwägen sollte, bevor man etwas Sensibles hochlädt.

### FreeConvert — am besten, wenn Ihre Arbeit in Minuten gemessen wird

FreeConvert deckt dasselbe Gebiet ab wie Convertio und Zamzar und rechnet anders ab: Die Einheit sind Konvertierungsminuten statt Dateien. Das passt zu großen Medien und bestraft lange Einzelkonvertierungen.

| Vorteile | Nachteile |
| --- | --- |
| Ein tägliches kostenloses Kontingent, gemessen in Minuten statt in Dateien | Eine Zeitgrenze pro Datei in der kostenlosen Nutzung stoppt eine große Konvertierung auf halbem Weg |
| Web und API schöpfen aus demselben Kontingent | Serverseitig, die Datei wird also hochgeladen |
| Höhere Stufen heben die Obergrenze für die Dateigröße deutlich an | Minuten lassen sich vorher schwer abschätzen |
| Keine Installation, keine Abhängigkeit vom Desktop | Die Bedingungen zur Aufbewahrung muss man erst suchen |

**Preis:** die kostenlose Nutzung umfasst 20 Konvertierungsminuten am Tag über Web und API zusammen, mit einer Grenze von 5 Konvertierungsminuten je Datei. Bezahlte Tarife sind 12,99 $ im Monat für Basic, 24,99 $ für Standard und 29,99 $ für Pro, mit On-Demand-Preisen darüber (geprüft auf freeconvert.com/pricing, 8. September 2026).

**Technische Details und Funktionen**

- Dokumente, Bilder, Audio, Video, Archive und E-Books
- Maximale Dateigrößen je Tarif von 1,5 GB bei Basic bis zu 20 GB auf der On-Demand-Stufe (geprüft auf freeconvert.com/pricing, 8. September 2026)
- Eine API für den gesamten Katalog
- Konvertierungszeit statt Dateianzahl als Abrechnungseinheit

**Wer sollte es verwenden?** Jeden, dessen Konvertierungen eher lang als zahlreich sind — Video, Audio, große Tabellen — und dem der Upload nichts ausmacht.

### Adobe Acrobat online — am besten, wenn PDF ein Ende der Aufgabe ist

Adobes Online-Werkzeuge konvertieren von und zu PDF mit derselben Engine wie Acrobat selbst, was zählt, weil PDF das Format ist, das am ehesten von der Neuimplementierung eines Dritten verstümmelt wird. Die Werkzeuge laufen in einem Browser und verarbeiten die Datei auf Adobes Servern.

| Vorteile | Nachteile |
| --- | --- |
| Die treueste PDF-Konvertierung, weil sie Adobes eigene ist | Die Anmeldung taucht schnell auf, sobald Sie die kostenlosen Werkzeuge mehr als beiläufig nutzen |
| Beherrscht PDF zu Word, Word zu PDF und die üblichen Paarungen | Lädt das Dokument zu Adobe hoch |
| Übereinstimmend mit der Ausgabe der Desktop-Anwendung | Kein allgemeiner Dokumentkonverter — PDF ist immer ein Ende |
| Keine Installation für die Online-Werkzeuge | Bepreist als Teil eines Abonnements, nicht pro Konvertierung |

**Preis:** mehrere Online-Werkzeuge sind mit Nutzungsgrenzen kostenlos, und der vollere Zugang ist in ein Acrobat-Abonnement gebündelt, dessen Preis von Tarif, Region und Laufzeit abhängt — sehen Sie für die Zahl, die für Sie gilt, auf adobe.com nach, statt einer Zahl in einem Artikel zu vertrauen.

**Technische Details und Funktionen**

- PDF-Erzeugung, -Export, -Zusammenführung und -Komprimierung im Browser
- Konvertierung von und zu Word, Excel, PowerPoint und Bildern
- Anmeldung nötig für alles jenseits einer geringen kostenlosen Nutzung
- Dieselben Konvertierungen in der Desktop-Anwendung und ihren APIs verfügbar

**Wer sollte es verwenden?** Jeden, für den PDF-Treue der ganze Punkt ist — ein Formular, ein unterschriebenes Dokument, eine druckfertige Datei. Nicht das Werkzeug, um Text aus einem Dokument zu holen, das Adobe lieber nicht haben sollte.

### Google Docs und Microsoft 365 — der Konverter, für den Sie schon zahlen

Wenn Sie eines der beiden Konten haben, besitzen Sie bereits einen Dokumentkonverter. Laden Sie eine `.docx` hoch, öffnen Sie sie und exportieren Sie sie als HTML, PDF oder reinen Text. Niemand bewirbt diese als Konverter, und für sehr viele einmalige Aufgaben sind sie der kürzeste Weg.

| Vorteile | Nachteile |
| --- | --- |
| Schon vorhanden, Ihren Dokumenten gegenüber schon im Vertrauen | Die Datei wird per Definition hochgeladen — genau das ist das Konto |
| Behandelt Word-Formatierung besser als die meisten Dritten | Der HTML-Export von Google Docs kommt als ZIP, mit Bildern als eigenen Dateien |
| Kein neuer Anbieter, den man bewerten müsste | Das exportierte HTML trägt das eigene Markup und die Klassennamen des Editors |
| Kostenlos mit dem Konto, das Sie haben | Unhandlich für mehr als eine Handvoll Dateien |

**Preis:** im Google- oder Microsoft-Konto enthalten, das Sie ohnehin haben.

**Technische Details und Funktionen**

- Import und Export von `.docx`, `.xlsx`, `.pptx`, PDF, reinem Text und HTML
- Exportentscheidungen werden je Dokument über ein Menü getroffen, nicht per Skript
- Das Dokument bleibt nach der Konvertierung im Speicher des Kontos, bis Sie es entfernen
- Verfügbar auf dem Telefon wie auf dem Desktop

**Wer sollte es verwenden?** Jeden, der ein Dokument konvertiert, das ohnehin schon in diesem Konto liegt. Wenn es noch nicht dort liegt, ist es ein großer Schritt für eine kleine Aufgabe, es hochzuladen, nur um HTML herauszubekommen.

### Gotenberg — beste serverseitige Konvertierung, die Sie selbst betreiben

Gotenberg ist eine zustandslose Konvertierungs-API, verteilt als Docker-Image, das LibreOffice und Chromium hinter HTTP-Endpunkten einpackt. Es ist der Mittelweg zwischen einem gehosteten Dienst und einer lokalen Installation: eine API in der Form von CloudConverts, laufend auf Hardware, die Sie kontrollieren.

| Vorteile | Nachteile |
| --- | --- |
| Eine HTTP-API, bei der keines der Dokumente Ihre Infrastruktur verlässt | Sie betreiben, überwachen und patchen es |
| Zustandslos von Entwurf her, es gibt also keine Aufbewahrungsrichtlinie zu lesen | Schmalere Formatliste als bei den gehosteten Diensten |
| Kostenlos und quelloffen | Braucht Docker und einen Ort, an den es kann |
| Berechenbare Kosten: Ihre eigene Rechenzeit | Kein Werkzeug für einen Menschen mit einer Datei |

**Preis:** kostenlos, MIT-lizenziert.

**Technische Details und Funktionen**

- HTTP-Endpunkte für die Konvertierung von Bürodokumenten, HTML zu PDF und PDF-Operationen
- LibreOffice für Office-Formate, Chromium für die HTML-Darstellung
- Als Container verteilt, konfiguriert über Flags und Umgebungsvariablen
- Keine Persistenz zwischen Anfragen

**Wer sollte es verwenden?** Entwicklungsteams, die Konvertierung als Dienst innerhalb eines Produkts oder eines Intranets brauchen, mit einer Compliance-Antwort, die nicht vom Löschzeitplan eines anderen abhängt.

### Bibliotheken im eigenen Code — wenn die Konvertierung eine Funktion ist

Wenn die Konvertierung innerhalb von Software passiert, die Sie schreiben, ist die ehrliche Antwort meist eine Bibliothek statt irgendeines Konverters auf dieser Seite: marked oder markdown-it für Markdown zu HTML, Turndown für HTML zu Markdown, mammoth für `.docx` zu HTML, ein CSV-Parser für tabellarische Daten.

| Vorteile | Nachteile |
| --- | --- |
| Nichts verlässt den Prozess, geschweige denn die Maschine | Sie schreiben die Hülle, die Fehlerbehandlung und die Formatierung |
| Keine Kosten je Konvertierung und kein Ratenlimit | Das Filtern liegt in den meisten davon in Ihrer Verantwortung |
| In Ihrer Lockfile versioniert, das Verhalten ändert sich also nicht unter Ihnen | Eine Bibliothek je Richtung, aus einer Matrix werden also mehrere Abhängigkeiten |
| Kostenlos und quelloffen | Überhaupt keine Hilfe bei PDF, Video oder exotischen Formaten |

**Preis:** kostenlos, quelloffen — marked und Turndown sind MIT-lizenziert.

**Technische Details und Funktionen**

- Markdown zu HTML: marked, markdown-it, remark in JavaScript; Entsprechungen in jeder anderen Sprache
- HTML zu Markdown: Turndown, mit Regeln, die Sie je Element überschreiben können
- `.docx` zu HTML: mammoth, das Stile bewusst abbildet, statt Words Markup nachzubauen
- Filtern ist ein eigener Schritt, den Sie hinzufügen, keine Voreinstellung, die Sie erben

**Wer sollte es verwenden?** Entwickler, deren Produkt Dokumente als Teil seiner Aufgabe konvertiert. Lesen Sie unbedingt, [was rohes HTML durch eine Konvertierung tragen kann](/blog/sanitising-markdown-safely), bevor Sie das Ergebnis eines dieser Werkzeuge im Browser eines anderen darstellen.

### „Speichern unter“ und „Als PDF drucken“ im Browser — der schon installierte Konverter

Jeder Browser konvertiert Dokumente. `Strg+P` in ein PDF oder „Seite speichern unter“ verschafft Ihnen ein lesbares Artefakt von beinahe allem, was Sie öffnen können. Es kostet nichts, lädt nichts hoch und verlangt keine Entscheidung.

| Vorteile | Nachteile |
| --- | --- |
| Kostenlos, installiert, offline und sofort | PDF verliert die Struktur — Überschriften werden visuell, nicht semantisch |
| Nichts wird hochgeladen | „Seite speichern unter, vollständig“ erzeugt eine Datei plus einen Ressourcenordner |
| Funktioniert für alles, was der Browser darstellen kann | Seitenumbrüche landen, wo sie eben landen |
| Kein Konto, keine Grenzen | Nicht skriptfähig als Teil eines Builds |

**Preis:** kostenlos.

**Wer sollte es verwenden?** Jeden, der jetzt sofort eine feste Kopie von etwas Lesbarem braucht und die Ausgabe hinterher weder bearbeitbar noch strukturiert benötigt.

## Was die Preisseiten weglassen

Vergleichstabellen bestehen aus den Feldern, die Anbieter zu veröffentlichen bereit sind. Was darüber entscheidet, ob eine Konvertierung eine gute Idee war, ist meist nicht darunter.

**Ob die Datei überhaupt hochgeladen wird.** Das ist die erste Frage, und sie steht fast nie in der Tabelle. „Online“ ist zu „auf irgendjemandes Server“ geworden, aber ein Browser ist eine Laufzeitumgebung, und ein Konverter, der für sie geschrieben ist, erledigt die Arbeit auf Ihrer Maschine. Der Unterschied ist kein Versprechen, das Sie glauben müssen: Öffnen Sie die Entwicklerwerkzeuge, sehen Sie den Netzwerk-Tab an, konvertieren Sie die Datei und schauen Sie, ob etwas hinausgeht. Ein Konverter auf der Browser-Seite zeigt Ihnen nichts als die Seite, die er ohnehin geladen hat. Ein serverseitiger zeigt Ihnen Ihr Dokument beim Verlassen, und dieselbe Gewohnheit, zu beobachten statt zu glauben, ist [die Art, zu klären, ob ein Online-Konverter für das Dokument vor Ihnen sicher ist](/blog/is-an-online-converter-safe), statt das Schlosssymbol als Antwort zu lesen.

**Wie lange sie aufbewahrt wird, sobald sie hochgeladen ist.** Aufbewahrung ist eine Richtlinie, und das heißt: ein Satz, den jemand geschrieben hat und umschreiben kann. Die guten Dienste sagen ihn klar. CloudConvert sagt, Dateien würden nur zur Verarbeitung gehalten und danach sofort gelöscht. Convertio sagt, hochgeladene Dateien würden sofort gelöscht und konvertierte nach 24 Stunden. Zamzar speichert eine konvertierte Datei höchstens 24 Stunden und hält das Original bis zu sieben Tage, wenn eine Konvertierung scheitert, damit der Support hineinsehen kann. Jede dieser Regeln ist vernünftig, und keine davon ist null. Konvertierung im Browser hat keine Aufbewahrungsrichtlinie, weil es nichts aufzubewahren gibt, und das ist eine Antwort einer anderen Kategorie.

**Ob das, was Sie zurückbekommen, eine vollständige Datei ist.** Unter derselben Schaltfläche zum Herunterladen kommen drei Dinge an. Ein vollständiges Dokument öffnet sich von allein und sieht aus wie es selbst. Ein Fragment — Überschriften und Absätze ohne `<html>`, `<head>` oder Stile darum herum — erscheint als schwarzer Text in der Standardbreite des Browsers und liest sich für den Empfänger als kaputt. Ein ZIP mit einer HTML-Datei, einem Stylesheet und einem Bilderordner ist eine Website in einer Tüte: Verschieben Sie das HTML allein, und die Bilder verschwinden. Wenn die Ausgabe per E-Mail oder Chat reisen muss, funktioniert von den dreien nur das erste.

**Ob das Ergebnis das Netz braucht, um richtig auszusehen.** Ein Konverter, der eine Schrift oder ein Stylesheet aus einem Content Delivery Network verlinkt, hat eine Datei erzeugt, die auf Ihrem Schreibtisch korrekt dargestellt wird und im Zug zerfällt. Sie verrät demjenigen, der sie öffnet, außerdem etwas darüber, wo die Datei gewesen ist. Ein eigenständiger Export trägt seine Stile eingebettet und fordert nichts an. Er ist eine größere Datei und die einzige Fassung, die sich überall gleich verhält. Ein Konverter, dessen Ausgabe das Netz braucht, um sich richtig zu öffnen, bietet keine eigenständige Datei an, wie auch immer der Exportdialog heißt — das ist genau [der Grund, warum ein Link und eine Datei nicht dasselbe Ergebnis sind](/blog/share-a-markdown-document-as-a-link).

**Was die kostenlose Stufe tatsächlich misst.** Die kostenlosen Stufen hier zählen vier verschiedene Dinge. Zamzar zählt Dateien: 2 in 24 Stunden. CloudConvert zählt Konvertierungen: 10 am Tag, bei fünf gleichzeitigen Aufgaben. FreeConvert zählt Minuten: 20 am Tag und nicht mehr als 5 auf einer einzelnen Datei. Convertio deckelt für die nicht registrierte Nutzung die Dateigröße. Keines davon ist mit einem anderen vergleichbar, und das entscheidende ist dasjenige, über das Ihre tatsächliche Arbeitslast stolpert. Zwanzig Minuten am Tag sind großzügig für Dokumente und dünn für Video; zwei Dateien am Tag sind für einen Menschen in Ordnung und für ein Team nutzlos.

**Was das Format nicht mit hinübertragen kann.** Jede Konvertierung ist in einer Richtung verlustbehaftet. Word-Kommentare, Änderungsverfolgung und Textfelder haben in Markdown keine Entsprechung. Die verbundenen Zellen und Formeln einer Tabelle überleben es nicht, eine Tabelle zu werden. PDF gibt seine Struktur vollständig auf und muss sie zurückerraten bekommen. Ein Konverter kann das nicht beheben, und die guten tun auch nicht so; sie treffen eine vertretbare Wahl und lassen Sie sie sehen. Bei Tabellen zeigt es sich zuerst und am sichtbarsten, und [was eine Tabellenkonvertierung übersteht](/blog/markdown-tables-that-survive-conversion), lohnt eine Prüfung an einer repräsentativen Datei, bevor Sie hundert übergeben.

**Wer sonst noch in der Kette steht.** Ein gehosteter Konverter läuft auf Infrastruktur, die er mietet, in einer Region, die er wählt, mit Unterauftragsverarbeitern, die er irgendwo auflistet. Das ist normal, und es ist auch eine längere Liste von Beteiligten als „ich und eine Webseite“. Für eine öffentliche README spielt es keine Rolle. Für einen nicht unterschriebenen Vertrag, eine Patientennotiz oder einen unangekündigten Produktplan ist es die ganze Entscheidung, und es ist keine Entscheidung, bei der eine Funktionstabelle helfen kann.

## Wie man wählt

1. **Beginnen Sie damit, wie sich das Dokument in einem Leck lesen würde.** Wäre es peinlich, vertraglich oder reguliert, muss die Konvertierung auf Ihrer Maschine passieren — im Browser oder offline —, und die Formatliste ist irrelevant, bis das geklärt ist. Das zuerst zu sortieren schließt in einem Schritt den größten Teil des Marktes aus und erspart Ihnen, Tarife zu vergleichen, die Sie nicht nutzen werden.
2. **Lesen Sie den Satz über die Aufbewahrung, nicht die Überschrift über den Datenschutz.** „Wir nehmen Ihre Privatsphäre ernst“ ist keine Richtlinie; „konvertierte Dateien werden nach 24 Stunden gelöscht“ ist eine. Wenn Sie keinen Satz mit einer Dauer darin finden, nehmen Sie an, die Dauer sei unbekannt, und behandeln Sie den Upload entsprechend.
3. **Prüfen Sie, was die kostenlose Stufe zählt, bevor Sie sich auf sie verlassen.** Dateien, Konvertierungen, Minuten und Megabyte sind vier verschiedene Maße, und der Tarif, der auf einem großzügig aussieht, ist auf Ihrem einschränkend. Konvertieren Sie zuerst Ihre größte realistische Datei auf der kostenlosen Stufe; dort kommen die Zeitgrenzen je Datei und die Größenobergrenzen ans Licht.
4. **Öffnen Sie die Ausgabe auf einer Maschine, die das Werkzeug nie gesehen hat.** Anderer Browser, anderer Rechner, Netz aus. Dieser eine Test fängt Fragmente, fehlende Bilder, aus einem CDN verlinkte Stylesheets und ZIP-förmige Exporte auf einmal ab, und er dauert eine Minute — während es eine Entschuldigung kostet, das erst zu entdecken, nachdem Sie die Datei einem Kunden geschickt haben.
5. **Zählen Sie die Installationen und die Konten.** Eine einmalige Konvertierung sollte keinen Paketmanager brauchen; ein nächtlicher Lauf sollte keinen Browser-Tab mit einem Menschen davor brauchen. Wählen Sie nach der Häufigkeit, denn das Missverhältnis ist das, was Leute ein gutes Werkzeug nach vierzehn Tagen wieder aufgeben lässt.
6. **Nehmen Sie an, dass Sie das noch einmal tun werden.** Wenn sich die Konvertierung wiederholt, wollen Sie eine API, eine CLI oder ein skriptfähiges Binary, keine Seite, die Sie besuchen. Ein manuelles Werkzeug für eine wiederkehrende Aufgabe zu wählen ist die häufigste Fassung dieses Fehlers, und er kostet jede Woche ein wenig Zeit statt einmal viel — weshalb er sich so lange hält.

## Fazit

Der beste Online-Dokumentkonverter ist der, dessen Antwort auf „Wohin ist meine Datei gegangen?“ „Nirgendwohin“ lautet. Für Dokumente, die nicht schon öffentlich sind, heißt das Konvertierung im Browser. Genau das [tut TransformPipe](/): Markdown in eine eigenständige HTML-Datei, und HTML, Word, CSV, TSV und JSON zurück nach Markdown, auf Ihrer eigenen Maschine, kostenlos. Abgemeldet wird nichts hochgeladen, und der Netzwerk-Tab zeigt es. Wenn das Format jenseits dessen liegt, was ein Browser parsen kann, ist ein serverseitiger Dienst das richtige Werkzeug, und die Aufbewahrungsrichtlinie ist das, wozwischen Sie eigentlich wählen: CloudConvert, Convertio, Zamzar und FreeConvert nennen alle ihre, und die Unterschiede sind real. Und wenn sich die Konvertierung wiederholen muss, installieren Sie Pandoc oder betreiben Sie Gotenberg selbst und hören Sie auf, darüber nachzudenken.

## FAQ

### Was ist der beste kostenlose Online-Dokumentkonverter?

Für Dokumente, die Sie lieber nicht hochladen würden, ist ein Konverter auf der Browser-Seite die beste kostenlose Möglichkeit, weil es keine Stufe zu überschreiten und danach keine Datei zu löschen gibt. Der oben genannte Browser-Konverter ist für Markdown, HTML, Word, CSV, TSV und JSON kostenlos. Für Formate, die ein Browser nicht lesen kann, funktionieren die kostenlosen Stufen von CloudConvert, Zamzar und FreeConvert alle für gelegentliche Nutzung, solange Sie gelesen haben, was jede von ihnen zählt.

### Ist es sicher, Dokumente zu einem Online-Konverter hochzuladen?

Das hängt vollständig vom Dokument und von der Richtlinie ab. Für alles, was ohnehin öffentlich ist, ist das Risiko vernachlässigbar. Für einen Vertrag, eine ärztliche Notiz oder einen unveröffentlichten Plan ist die sichere Position ein Konverter, der überhaupt nicht hochlädt — entweder einer, der in Ihrem Browser läuft, oder ein Werkzeug, das auf Ihrer Maschine installiert ist. Eine Aufbewahrungsrichtlinie ist ein Versprechen über eine Kopie, die existiert, nicht die Abwesenheit einer Kopie.

### Wie konvertiere ich ein Dokument, ohne es hochzuladen?

Nehmen Sie einen Konverter, der im Browser läuft, oder einen, der offline läuft. Ein Werkzeug auf der Browser-Seite lädt seinen Code einmal und parst danach lokal, Sie können also die Entwicklerwerkzeuge öffnen, die Datei konvertieren und dem Netzwerk-Tab dabei zusehen, wie er leer bleibt. Offline berühren Pandoc und LibreOffices `--convert-to`-Modus das Netz überhaupt nicht.

### Wie lange behalten Online-Konverter meine Dateien?

Die veröffentlichten Antworten reichen von Minuten bis zu einer Woche. CloudConvert erklärt, Dateien würden nur zur Verarbeitung gehalten und danach sofort gelöscht; Convertio löscht Uploads sofort und konvertierte Dateien nach 24 Stunden; Zamzar behält eine konvertierte Datei bis zu 24 Stunden und ein Original bis zu sieben Tage, wenn die Konvertierung gescheitert ist. Prüfen Sie den aktuellen Wortlaut auf der Seite des jeweiligen Anbieters, denn das sind Richtlinien, und Richtlinien ändern sich.

### Kann ich Dokumente offline konvertieren?

Ja, und es ist meist die bessere Antwort für alles, was sich wiederholt oder sensibel ist. Pandoc konvertiert von der Kommandozeile aus zwischen rund vierzig Formaten, LibreOffice konvertiert Bürodokumente und PDFs mit `--headless --convert-to`, und ein Konverter im Browser arbeitet weiter, sobald die Seite geladen ist. Alle drei lassen das Netz aus dem Spiel.

### Funktioniert ein Online-Dokumentkonverter auf einem Telefon?

Serverseitige Konverter tun es, denn das Telefon muss nur hoch- und herunterladen. Konverter im Browser funktionieren ebenfalls, aber die Konvertierung läuft auf dem Prozessor und dem Speicher des Telefons, ein sehr großes Dokument ist dort also langsamer als auf einem Laptop. Für ein normales Dokument — einen Bericht, eine README, einen Tabellenexport — ist beides in Ordnung.

### Was ist der Unterschied zwischen einem Dokumentkonverter und einem Dokumenteditor?

Ein Konverter nimmt eine Datei in einem Format und gibt Ihnen denselben Inhalt in einem anderen; ein Editor ist der Ort, an dem Sie ihn schreiben. Editoren haben oft ein Exportmenü, was sie versehentlich zu Konvertern macht, und der Export ist auf die Art des Editors formatiert statt auf Ihre. Wenn Sie die Datei schon haben und nur ein anderes Format brauchen, ist ein Konverter weniger Schritte und weniger Überraschungen.

### Womit sollte ich vergleichen?

Mit dem, was an Ihrem Dokument scheitert, nicht mit dem, das die längste Formatliste hat. Die lokalen Werkzeuge unterscheiden sich darin, was sie glatt verweigern — Pandoc liest PowerPoint überhaupt nicht, calibre erreicht Markdown nur über seinen Textexporter, und Docling liest die breiteste Eingabeliste von allen. [Zehn Markdown-Konverter, verglichen nach dem, was sie nicht lesen](/blog/ten-markdown-converters-compared) stellt diese Verweigerungen in eine Tabelle, mit Datum und mit jedem Punkt aus der Dokumentation des jeweiligen Werkzeugs.
