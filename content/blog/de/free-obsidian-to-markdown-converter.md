---
title: "Kostenloser Obsidian-zu-Markdown-Konverter: alle Optionen im Vergleich"
description: "Ein Obsidian-Vault ist schon Markdown, es gibt also nichts zu kaufen — die kostenlosen Werkzeuge für Wikilinks, Embeds, Blockreferenzen und Callouts im Vergleich"
date: 2026-09-14
tag: Konvertieren
keywords: kostenloser obsidian markdown konverter, obsidian vault exportieren kostenlos, obsidian nach markdown konvertieren, obsidian markdown export werkzeug, obsidian wikilinks umschreiben, obsidian export plugin kostenlos
---

Wer nach einem kostenlosen Konverter von Obsidian nach Markdown sucht, hat den unangenehmen Teil meist schon gefunden: Es gibt nichts zu kaufen, weil es nichts zu konvertieren gibt. Ein Obsidian-Vault ist ein Ordner mit `.md`-Dateien auf der Platte. Sie können eine davon in Notepad öffnen oder das Ganze in ein Repository committen, ohne je einen Konverter anzufassen. Das Format ist das Zielformat.

Und doch wird ständig danach gesucht, denn die Dateien funktionieren nicht mehr, sobald sie draußen sind. Eine Notiz, die sich in Obsidian perfekt liest, kommt anderswo mit `[[Project Brief]]` in doppelten Klammern an, mit einem `> [!warning]`-Marker, der als wörtlicher Text über einem Blockquote steht, und mit einem `![[diagram.png]]`, das nichts zeigt. Wonach Leute suchen, ist kein Formatwechsel. Es ist eine Reparatur an vier Konstrukten, die Obsidian erfunden hat, und jedes Werkzeug, dessen Vergleich sich lohnt, ist eine andere Antwort darauf, wie diese vier repariert werden.

Das rückt die Preisfrage nützlich zurecht. Wenn das Grundformat kostenlos ist und die Quelldateien ohnehin Ihnen gehören, ist „kostenlos“ kein Rabatt mehr, sondern der Normalfall. Was die Optionen tatsächlich kosten, sind Einrichtung, Kontrolle und wie viel von der Struktur des Vaults Sie im Tausch aufzugeben bereit sind.

### Kurzfassung

Jede ernstzunehmende Option hier ist kostenlos, wählen Sie also nach Form statt nach Preis. **Der Browser-Konverter unter [/obsidian-to-markdown](/obsidian-to-markdown)** nimmt einen gezippten Vault und gibt ein Dokument mit Inhaltsverzeichnis zurück, Wikilinks auf die Worte reduziert, die sie zeigten, und Frontmatter entfernt — keine Installation, nichts hochgeladen, solange Sie abgemeldet sind, und die richtige Antwort, wenn das Ziel ein einzelnes lesbares Dokument ist. **[obsidian-export](https://github.com/zoni/obsidian-export)** ist eine kostenlose Rust-CLI (BSD-2-Clause-Patent, geprüft auf github.com/zoni/obsidian-export, 14. September 2026), die einen Vault durchläuft und auf der anderen Seite CommonMark-Dateien mit aufgelösten Links und Embeds herausschreibt — genau das, was Sie wollen, wenn der Vault ein Ordner separater Dateien bleiben muss. **Obsidians eigene Einstellung „Use \[\[Wikilinks\]\]“** kostet nichts und repariert rückwirkend nichts. **Ein Community-Export-Plugin** exportiert eine Notiz oder einen Ordner samt Bildern, aus Obsidian selbst heraus. **Pandoc** ist kostenlos und GPL und liest Wikilinks nur hinter einer nicht standardmäßig aktiven Erweiterung — ohne Vault-Index kann es `[[Notiz]]` nicht so auf einen Pfad auflösen, wie Obsidian es tut. **Ein Skript, das Sie selbst schreiben**, ist der einzige Weg, auf dem Sie entscheiden, was mit einem doppelten Dateinamen passiert. Für das Syntaxdetail hinter alldem geht [die vollständige Anleitung den Dialekt Notiz für Notiz durch](/blog/convert-obsidian-vault-to-markdown).

## Warum ein Ordner voller Markdown-Dateien trotzdem einen Konverter braucht

Der Grund, warum es diese Aufgabe überhaupt gibt, ist, dass Obsidians Dialekt eine Obermenge ist und die Extras nirgends in der Datei als Extras markiert sind. Es gibt kein Flag, keinen Namensraum, keinen eingezäunten Bereich, der sagt „dieses Stück gehört uns“. Ein Wikilink sieht aus wie ganz gewöhnlicher Text mit Klammern darin, und genau deshalb behandelt ein Standardparser ihn als gewöhnlichen Text mit Klammern darin.

Vier Konstrukte tragen fast den gesamten Schaden, und sie sind die vollständige Grundlage, auf der sich die Werkzeuge unten unterscheiden:

**Wikilinks** — `[[Notiz]]`, `[[Notiz|Angezeigter Text]]`, `[[Notiz#Überschrift]]` — lösen sich innerhalb von Obsidian gegen einen Index des ganzen Vaults auf, finden eine Datei über ihren Namen, wo immer sie liegt, und ebenso über ihre `aliases`-Frontmatter. Außerhalb des Vaults ist dieser Index weg, es bleibt also nichts mehr, wogegen aufgelöst werden könnte.

**Embeds.** `![[Notiz]]` bindet eine andere Notiz zur Anzeigezeit ein; `![[bild.png]]` zeigt einen Anhang. Standard-Markdown hat eine Bildsyntax und überhaupt keine Transklusionssyntax, ein Notiz-Embed hat also kein Gegenstück, in das es sich konvertieren ließe — nur die Wahl zwischen einer eingefügten Kopie und einem einfachen Link.

**Blockreferenzen.** `[[Notiz#^block-id]]` zeigt über eine an die Zeile angehängte ID auf einen Absatz. Wenn die ID verschwindet, bricht die Referenz nicht; sie hört auf, sich auf irgendetwas zu beziehen.

**Callouts.** `> [!note]`, `> [!warning]` und der Rest sind Blockquotes mit einem typisierten Marker in der ersten Zeile. Überall sonst ist der Marker Text.

Ein fünfter Punkt ist kein Konstrukt, sondern ein Kategorienfehler, den man früh benennen sollte: alles, was ein Plugin dargestellt statt geschrieben hat. Eine Dataview-Abfrage liegt als eingezäunter Codeblock mit der Frage darin, und die Tabelle, die sie erzeugte, entstand beim Öffnen, jedes Mal neu. Kein Konverter, kostenlos oder nicht, holt sie zurück, denn es gibt nichts zurückzuholen. Frontmatter und `%%Inline-Kommentare%%` runden die Liste ab, beides billig zu behandeln, wenn das Werkzeug sich die Mühe macht — [was Konverter allgemein mit Frontmatter tun](/blog/front-matter-and-what-converters-do-with-it), gilt hier unverändert.

## Was „kostenlos“ in jeder Richtung kostet

Da die Preisspalte unten in jeder Zeile „kostenlos“ lautet, lohnt es sich, ausdrücklich zu sagen, was stattdessen variiert.

**Einrichtungsaufwand.** Eine Browser-Seite ist null. Ein Rust-Binary ist ein Download oder ein `cargo install`. Ein Community-Plugin ist ein Plugin, das Sie jetzt pflegen. Ein Skript ist ein Nachmittag und danach für immer.

**Kontrolle über Mehrdeutigkeit.** Zwei Notizen namens `Meeting Notes.md` in verschiedenen Ordnern sind für ein bloßes `[[Meeting Notes]]` selbst innerhalb von Obsidian mehrdeutig, das nach seiner eigenen internen Regel auflöst. Jedes automatisierte Werkzeug erbt diese Mehrdeutigkeit, statt sie aufzulösen; nur Code, den Sie geschrieben haben, lässt Sie entscheiden, welche gewinnt.

**Form der Ausgabe.** Die eigentliche Weggabelung, und kein Qualitätsunterschied: Manche Werkzeuge erzeugen einen Ordner mit Dateien und funktionierenden relativen Links dazwischen, andere erzeugen ein Dokument, was die Notwendigkeit eines Linkziels ganz beseitigt.

**Wohin der Vault geht.** Ein Vault ist oft das Persönlichste, was ein Mensch in Textform besitzt, ein Konverter, der lokal läuft, und einer, der hochlädt, haben also denselben Preis und sind nicht dasselbe Geschäft — die allgemeine Fassung dieser Frage ist, [ob ein Online-Konverter sicher ist](/blog/is-an-online-converter-safe).

## Kurzvergleich: der Spickzettel

| Werkzeug | Am besten für | Kernfähigkeit | Preis |
| --- | --- | --- | --- |
| TransformPipe | Einen Vault oder einen Teil davon, der ein lesbares Dokument werden soll | Gezippter Vault rein, ein Dokument mit Inhaltsverzeichnis raus, Wikilinks und Frontmatter im selben Durchgang erledigt | Kostenlos |
| obsidian-export | Einen Vault, der ein Ordner separater, verlinkter Dateien bleiben muss | Rekursiver Vault-zu-CommonMark-Export, der `[[notiz]]`-Links und `![[notiz]]`-Embeds auflöst | Kostenlos, BSD-2-Clause-Patent |
| Obsidians Einstellung „Use \[\[Wikilinks\]\]“ | Den Rückstau am Wachsen zu hindern | Schreibt für alles nach der Umstellung Erstellte Standard-`[Text](Pfad)`-Links | Kostenlos, eingebaut |
| Ein Community-Export-Plugin | Eine Notiz oder einen Ordner aus Obsidian heraus zu exportieren | Bündelt verlinkte Bildanhänge neben dem exportierten Markdown | Kostenlos |
| Pandoc | Einen Vault, der eine von mehreren Eingaben in einem ohnehin laufenden Dokument-Build ist | Wikilink-Unterstützung hinter einer nicht standardmäßigen Erweiterung, in jedes Format, das Pandoc schreibt | Kostenlos, GPL |
| Ein Skript, das Sie selbst schreiben | Doppelte Dateinamen, Aliase und Regeln, die nur Sie kennen | Genaue Kontrolle über jeden mehrdeutigen Fall, und sonst nichts, dem zu trauen wäre | Kostenlos, kostet Zeit |

## Die Optionen, eine nach der anderen

### TransformPipe — am besten, wenn der Vault ein Dokument werden soll

Zippen Sie den Vault-Ordner, werfen Sie das Archiv auf [/obsidian-to-markdown](/obsidian-to-markdown), und jede Notiz kommt als Abschnitt eines einzelnen Markdown-Dokuments zurück, in Pfadreihenfolge, unter einem erzeugten Inhaltsverzeichnis. Es gibt keine Installation, kein Konto ist nötig, und abgemeldet wird das Archiv von der Seite von Ihrer eigenen Platte gelesen, statt irgendwohin geschickt zu werden.

Die Entwurfsentscheidung darunter lässt das Wikilink-Problem verschwinden, statt es zu lösen: Wenn jede Notiz ein Abschnitt desselben Dokuments ist, gibt es keine separate Datei mehr, auf die ein Link zeigen könnte. Also wird `[[Project Brief]]` zu den Worten *Project Brief*, `[[Project Brief|the brief]]` zu *the brief* und `[[Project Brief#Scope]]` zu *Project Brief* — jedes Mal der Text, den die Leserin ohnehin sah. Ein Verlust, wenn Sie navigierbare Links wollten; genau richtig, wenn Sie etwas wollten, das jemand von vorn bis hinten lesen kann.

| Dafür | Dagegen |
| --- | --- |
| Keine Installation, kein Binary, kein Plugin — ein Zip und ein Browser-Tab | Ein Dokument, kein Ordner voller Dateien: die falsche Form, wenn die Notizen einzeln adressierbar bleiben müssen |
| Wikilinks, Alias-Beschriftungen per `\|` und `#Überschrift`-Anker fallen in einem Durchgang auf ihre angezeigten Worte zusammen | Links werden reiner Text statt funktionierender Links, weil kein externes Ziel mehr übrig ist |
| Frontmatter wird entfernt, statt als verirrte horizontale Linie und Block aus Schlüssel-Wert-Lärm dargestellt zu werden, und aus einem Bild-Embed wird das Bild selbst | Zwei Megabyte Bilder je Dokument sind die Obergrenze, und ein Anhang, der kein Bild ist, wird weiterhin kursiver Platzhaltertext |
| Ein erzeugtes Inhaltsverzeichnis, ein Vault mit hundert Notizen ist also von oben navigierbar | Dataview-Tabellen und andere von Plugins dargestellte Ansichten fehlen, wie auf jedem Weg |
| Läuft im Browser; abgemeldet wird der Vault nicht hochgeladen | Ein sehr großer Vault ist durch den Rechner begrenzt, der die Arbeit macht |

**Preis:** kostenlos. Ein Konto ergänzt Verlauf und Freigabe, ebenfalls kostenlos.

**Technische Details und Funktionen**

- Aus dem Archiv werden nur `.md`-Einträge gelesen, sortiert nach ihrem vollen Pfad im Zip, und das legt die Reihenfolge der Abschnitte in der Ausgabe fest — benennen Sie einen Ordner um, und die Reihenfolge ändert sich mit
- Der Titel einer Notiz stammt aus ihrem Dateinamen statt aus irgendetwas, das darin steht, passend dazu, wie Obsidian selbst Notizen identifiziert; wiederholt die erste Zeile dieser Notiz den Titel als H1, fällt das Duplikat weg, statt zweimal gedruckt zu werden
- Das Umschreiben der Wikilinks deckt `[[Ziel]]`, `[[Ziel|Angezeigt]]`, `[[Ziel#Überschrift]]` und `[[Ziel#Überschrift|Angezeigt]]` ab, dazu die `![[...]]`-Embed-Form von jedem
- Ein Embed, dessen Ziel ein Bild im Zip ist, wird zu diesem Bild, mitgetragen im Dokument; eines, dessen Ziel eine andere erkannte Dokument- oder Mediendatei ist, wird kursiver Text mit dem Dateinamen, statt einer kaputten Referenz auf eine Datei, die nicht da ist
- Der YAML-Frontmatter-Block am Anfang einer Notiz wird entfernt, bevor irgendetwas anderes läuft
- Abschnitte werden durch eine horizontale Linie verbunden, dieselbe Konvention, die die App auch beim [Zusammenführen mehrerer Markdown-Dateien zu einer](/blog/merging-many-markdown-files) verwendet

**Für wen ist das?** Für jemanden, der einen Vault oder die Notizen eines Projekts daraus an eine Person übergibt, die Obsidian nicht benutzt — eine Kundin, ein Archiv, eine Übergabe, ein Dokument, das gelesen und nicht navigiert werden soll. Nicht das Werkzeug für einen Vault, der auf der anderen Seite als verlinkter Graph weiterfunktionieren muss.

### obsidian-export — am besten, wenn der Vault ein Ordner voller Dateien bleibt

obsidian-export ist ein Kommandozeilenprogramm und eine Rust-Bibliothek, die einen Vault durchläuft und auf der anderen Seite schlichtes CommonMark herausschreibt, eine Datei rein für eine Datei raus. Es ist das, was einem eigens für diese Aufgabe gebauten kostenlosen Konverter am nächsten kommt, ohne ein Plugin zu sein, und seine eigene Dokumentation sagt sorgfältig, dass es von Obsidian nicht offiziell unterstützt wird und den Dialekt größtenteils, aber nicht vollständig abdeckt.

| Dafür | Dagegen |
| --- | --- |
| Erhält die Ordnerform: separate Dateien mit aufgelösten Links dazwischen, nicht abgeflacht | Ein Kommandozeilenwerkzeug, ein Terminal ist also Voraussetzung |
| Behandelt sowohl `[[notiz]]`-Referenzen als auch `![[notiz]]`-Dateieinbindungen statt nur einfacher Links | Nicht von Obsidian unterstützt, und die eigene README sagt, dass die Abdeckung des Dialekts teilweise ist |
| Ausschlussmuster verwenden gitignore-Syntax, und von git ohnehin ignorierte Dateien werden standardmäßig übersprungen | Nimmt UTF-8 für Notiztext und Dateinamen an, sonst verlustbehaftete Umwandlung |
| Das Verhalten bei Frontmatter ist ein Flag statt einer festen Entscheidung | Noch ein Binary, das zu installieren und aktuell zu halten ist |
| Skriptbar, der Export ist also wiederholbar statt etwas, woran jemand denkt | Ein Teilexport hat Regeln, die man vorher lesen sollte |

**Preis:** kostenlos, BSD-2-Clause-Patent laut der projekteigenen `Cargo.toml` (geprüft auf github.com/zoni/obsidian-export, 14. September 2026).

**Technische Details und Funktionen**

- `obsidian-export /pfad/zum/vault /pfad/zur/ausgabe` ist der ganze Grundaufruf; das Zielverzeichnis muss bereits existieren
- `--start-at` exportiert einen Ausschnitt des Vaults und behandelt dabei weiterhin den ganzen Vault als Auflösungskontext, Links aus dem exportierten Ausschnitt heraus bleiben also intakt. Stattdessen eine einzelne Datei als Quelle zu nennen löst absichtlich nichts auf — die Dokumentation nennt das eine bewusste Entscheidung
- `--frontmatter=never` entfernt Frontmatter vollständig, `--frontmatter=always` fügt für statische Seitengeneratoren, die einen verlangen, einen leeren Block ein, und die Voreinstellung übernimmt sie unverändert
- Versteckte Dateien, von einer `.export-ignore`-Datei erfasste Pfade und alles, was git ohnehin ignoriert, sind standardmäßig ausgeschlossen, jeweils über ein eigenes Flag anpassbar
- `--skip-tags` und `--only-tags` filtern Notizen nach Frontmatter-Tags, was eine wirklich brauchbare Art ist, die öffentliche Hälfte eines Vaults zu exportieren
- Eine Notiz, die auf eine ausgeschlossene Notiz verlinkt, wird entlinkt statt ins Leere zeigen gelassen — der Linktext überlebt, der Link nicht
- Zwei Notizen, die sich gegenseitig einbetten, sind standardmäßig ein Fehler, wobei `--no-recursive-embeds` den Kreis bricht, indem es beim zweiten Antreffen stattdessen einen Link einfügt

**Für wen ist das?** Für alle, die einen Vault in eine statische Seite, ein Dokumentations-Repository oder irgendwohin exportieren, wo die Notizen ihre eigene Identität und ihre Links untereinander behalten müssen. Das ist das kostenlose Werkzeug, das dem gedanklichen Modell von „meinen Vault exportieren“ am direktesten entspricht, so wie die meisten es meinen.

### Obsidians eigene Einstellung „Use \[\[Wikilinks\]\]“ — kostenlos, eingebaut und nur eine halbe Abhilfe

Die Einstellung liegt unter Einstellungen, Dateien und Links: Schalten Sie „Use \[\[Wikilinks\]\]“ aus, und Obsidian schreibt ab diesem Moment für alles, was Sie erstellen, Standard-Markdown-Links `[Text](Pfad)` (geprüft auf obsidian.md und über Obsidians eigene Einstellungsdokumentation, 14. September 2026). Die Autovervollständigung bleibt unverändert — `[[` tippen, Notiz auswählen — nur die auf die Platte geschriebene Syntax unterscheidet sich.

| Dafür | Dagegen |
| --- | --- |
| Kostet nichts und fügt kein Werkzeug, Plugin oder Abhängigkeit hinzu | Rein vorwärtsgerichtet: Jeder vor der Umstellung geschriebene Link bleibt unberührt |
| Das Schreiberlebnis ändert sich überhaupt nicht — dieselbe Autovervollständigung, derselbe Fluss | Betrifft nur einfache Links; Embeds, Blockreferenzen und Callouts bleiben unberührt |
| Macht den Vault ohne Migrationsereignis schrittweise portabler | In keinem Sinn eine Konvertierung — ein etablierter Vault braucht trotzdem einen Umschreibedurchgang |

**Preis:** kostenlos, Teil der App. Obsidian selbst ist für die private Nutzung kostenlos, mit einer kommerziellen Lizenz zu 50 $ pro Nutzer und Jahr für die berufliche Nutzung in einer Organisation und optionalen Sync- und Publish-Erweiterungen, die separat bepreist sind (geprüft auf obsidian.md, 14. September 2026).

**Für wen ist das?** Für alle, unabhängig davon, welche andere Option Sie für den Rückstau wählen. Es ist der einzige Punkt auf dieser Seite ohne Zielkonflikte, weil er den schweren Teil gar nicht erst versucht.

### Ein Community-Export-Plugin — am besten für eine Notiz oder einen Ordner, aus Obsidian heraus

Obsidians Verzeichnis der Community-Plugins führt Export-Plugins, und [obsidian-markdown-export-plugin](https://github.com/bingryan/obsidian-markdown-export-plugin) ist ein echtes, aktiv weiterentwickeltes Beispiel: Es exportiert eine einzelne Notiz oder einen ganzen Ordner als Paket mit den verlinkten Bildern neben dem Markdown, über einen Befehl in Obsidian statt über ein separates Werkzeug.

| Dafür | Dagegen |
| --- | --- |
| Läuft aus der App heraus, an der Notiz, die Sie gerade ansehen | Das Repository trägt keine Lizenzdatei, was zählt, wenn Sie den Code forken oder mitliefern wollen (geprüft auf github.com/bingryan/obsidian-markdown-export-plugin, 14. September 2026) |
| Behält die Bilder als Dateien neben dem exportierten Markdown, während der Weg über die Zusammenführung sie stattdessen ins Dokument legt | Ein Community-Plugin ist eine Abhängigkeit mit eigenem Veröffentlichungstakt und eigenen Entscheidungen |
| Hat eine Option für Ausgabe in GitHub Flavored Markdown, dem Dialekt, auf den sich die meisten Ziele einigen | Wie es mit Blockreferenzen, Callouts und von Plugins dargestellten Inhalten umgeht, ist die Entscheidung des Plugins, nicht Ihre |
| Exportiert Ordner ebenso wie einzelne Dateien und kann auch HTML ausgeben | Export per Plugin skaliert für einen ganzen Vault schlecht, verglichen mit einer CLI, die Sie skripten können |

**Preis:** kostenlos, installiert aus Obsidians Browser für Community-Plugins.

**Technische Details und Funktionen**

- Dokumentierte Fähigkeiten sind Ordner- und Einzeldateiexport, das Einbeziehen von Bildanhängen, eine Option für Ausgabe in GitHub Flavored Markdown, die Behandlung eingebetteter Inhalte und Ausgabe wahlweise als `md` oder `html` (geprüft auf github.com/bingryan/obsidian-markdown-export-plugin, 14. September 2026)
- Die Installation ist der gewöhnliche Weg für Community-Plugins: Einstellungen, Community-Plugins, durchsuchen, nach „markdown export“ suchen
- Weil es innerhalb von Obsidian läuft, hat es Zugriff auf denselben Vault-Index, den Obsidian selbst beim Auflösen eines Links verwendet — der strukturelle Vorteil, den Plugins gegenüber jedem externen Werkzeug hier haben

Die übliche Vorsicht gegenüber Community-Plugins gilt, ohne dass man zimperlich werden müsste: Bevor Sie sich für etwas auf eines verlassen, das Sie nicht von Hand wiederholen können, prüfen Sie den aktuellen Eintrag auf den Wartungsstand und lesen Sie nach, was es mit den Konstrukten tut, die Sie tatsächlich haben. Ein Plugin, das Callouts still fallen lässt, ist in Ordnung, wenn Sie keine Callouts haben.

**Für wen ist das?** Für jemanden, der eine Handvoll Notizen auf einmal exportiert, mit Bildern, und dabei lieber in Obsidian bleibt, als ein Terminalwerkzeug zu lernen. Die Anhänge sind das entscheidende Merkmal — das ist die einzige Option auf dieser Seite, die sie mit dem Text hinausträgt.

### Pandoc — am besten, wenn der Vault eine Eingabe unter mehreren ist

Pandoc ist der allgemeine Dokumentkonverter, kostenlos und GPL-lizenziert (geprüft auf pandoc.org, 14. September 2026), und es verdient hier eine Zeile für Leute, die es ohnehin in einem Build haben. Es kennt Wikilinks durchaus, aber zu Bedingungen, die man verstehen sollte, bevor man danach greift.

| Dafür | Dagegen |
| --- | --- |
| Auf sehr vielen Dokumentations-Build-Maschinen ohnehin schon installiert | Kein Vault-Index: Es kann `[[Notiz]]` nicht so auf `ordner/Notiz.md` auflösen, wie Obsidian es tut |
| Wikilink-Parsing ist über eine dokumentierte Erweiterung verfügbar | Die Erweiterungen sind nicht standardmäßig aktiv, ein schlichter `-f markdown`-Lauf lässt Wikilinks also als wörtlichen Text stehen |
| Schreibt aus derselben Eingabe in jedes Ausgabeformat, das Pandoc unterstützt | Weiß nichts über Callouts, Blockreferenzen oder Dataview — sie gehen als das durch, was sie textuell sind |
| Lässt sich mit Filtern kombinieren, ein eigenes Umschreiben kann also innerhalb der Konvertierung laufen | Von Natur aus pro Datei; ein Vault ist eine Schleife, die Sie darum herum schreiben |

**Preis:** kostenlos, GPL-lizenziert.

**Technische Details und Funktionen**

- `--from=markdown+wikilinks_title_after_pipe` aktiviert das Parsen von `[[Wiki]]` und `[[URL|Titel]]`; `wikilinks_title_before_pipe` ist das Spiegelbild, `[[Titel|URL]]` (geprüft im Pandoc-Handbuch auf pandoc.org, 14. September 2026)
- Beide stehen im Abschnitt des Handbuchs über nicht standardmäßig aktive Erweiterungen, keine ist also aktiv, sofern Sie sie nicht nennen. Obsidian setzt das Ziel zuerst und den angezeigten Text nach den Pipe-Strich, was `wikilinks_title_after_pipe` zu der macht, die zu einem Vault passt
- Was die Erweiterung Ihnen gibt, ist ein Link, dessen Ziel der wörtliche Text in den Klammern ist — nützlich und nicht dasselbe wie ein aufgelöster relativer Pfad auf eine Datei anderswo im Vault
- Ein Lua-Filter ist der ehrliche Weg, diese Lücke zu schließen: das Linkziel parsen, es in einem Index nachschlagen, den Sie selbst aus dem Vault gebaut haben, und das Ziel umschreiben

**Für wen ist das?** Für jemanden, dessen Notizen eine Eingabe in einen Build sind, der aus anderen Gründen ohnehin Pandoc ausführt. Als eigenständiger Obsidian-Konverter ist es die schwächste Option hier, denn der schwere Teil — die vaultweite Auflösung — ist genau der Teil, den es nicht leistet.

### Ein Skript, das Sie selbst schreiben — am besten für die Fälle, die niemand sonst entscheiden kann

Die letzte kostenlose Option ist die ohne Werkzeug darin. Den Vault durchlaufen, einen Index aus jedem Dateinamen und jedem Alias bauen, die Wikilink- und Embed-Muster finden, jedes Ziel gegen diesen Index auflösen, an Ort und Stelle umschreiben.

| Dafür | Dagegen |
| --- | --- |
| Der einzige Weg, auf dem Sie entscheiden, worauf ein doppelter Dateiname auflöst | Sie pflegen jetzt einen Konverter |
| Aliase, Tag-Regeln und Ordnerkonventionen, die für Ihren Vault gelten, lassen sich alle kodieren | Jeder Sonderfall des Dialekts ist Ihrer zu entdecken, meist nach dem Export |
| Keine Abhängigkeit, kein Plugin, kein Binary, und nichts, dem zu trauen wäre außer Code, den Sie lesen können | Langsamer bis zum ersten Ergebnis als jede andere Option hier, und die interessanten Fehlschläge sind still |

**Preis:** kostenlos, in Zeit bezahlt.

**Technische Details und Funktionen**

- Ein regulärer Ausdruck über `!?\[\[ziel(#überschrift)?(\|angezeigt)?\]\]` erfasst die ganze Familie, Embeds eingeschlossen; die oben verlinkte Anleitung geht eine funktionierende Fassung samt Resolver durch
- Die Auflösung muss den ganzen Vault nach Dateinamen durchsuchen, nicht das eigene Verzeichnis der verlinkenden Notiz, denn genau das tut Obsidian; ein verzeichnislokaler Resolver erzeugt tote Links für jede anderswo gespeicherte Notiz und meldet nichts
- Der Index braucht die `aliases`-Frontmatter jeder Notiz neben ihrem Dateinamen, sonst fällt ein Link, der gegen den alten Titel einer umbenannten Notiz geschrieben wurde, auf reinen Text zurück
- Halten Sie einen Test-Vault mit je einem Exemplar jedes Konstrukts bereit — einem Callout, einem Embed, einer Blockreferenz, einem Alias-Link, einem doppelten Dateinamen — und lassen Sie jede Änderung dagegen laufen

**Für wen ist das?** Für alle, die einen großen, lange gewachsenen Vault irgendwohin bewegen, wo er weiterfunktionieren muss und wo ein stiller toter Link schlimmer ist als ein Nachmittag Programmieren. Außerdem für alle, die eines der Werkzeuge oben probiert und eine Regel gefunden haben, mit der sie nicht einverstanden sind.

## Wo die kostenlose und naheliegende Wahl nicht trägt

Die naheliegende kostenlose Wahl ist für die meisten „einfach den Ordner kopieren“ — der Vault ist Markdown, also verschieben und fertig. Wo das scheitert, verdient Genauigkeit, denn die Fehlschläge sind leise und kommen später.

**Links sehen gut aus, bis jemand auf einen klickt.** In einem reinen Texteditor ist `[[Project Brief]]` lesbar, und eine Leserin versteht es. In einer dargestellten GitHub-README oder auf einer statischen Seite ist es lesbar und tot. Nichts meldet einen Fehler; die Seite trägt nur ein Stück Text, das aussieht, als wollte es ein Link sein, und die Leserin nimmt an, die Seite sei kaputt, nicht die Quelle.

**Callouts verlieren ihre Betonung und behalten ihre Worte.** Ein `> [!warning]`-Blockquote verliert seine Gestaltung und behält seinen Text, eine Notiz, die Callout-Farbe nutzte, um „tun Sie das“ von „tun Sie das nie“ zu unterscheiden, liest sich jetzt also als zwei identische Blockquotes. Das ist schlimmer, als den Inhalt zu verlieren, denn der Inhalt ist da und seine Gewichtung ist weg.

**Anhänge brechen auf eine Art, die der Text nicht zeigt.** Bilder liegen in einem Anhangsordner, auf den ein Embed verweist. Kopieren Sie die `.md`-Dateien ohne den Ordner, und jedes Bild ist weg; kopieren Sie den Ordner an eine andere relative Position, und jedes Bild ist weg, und zwar auf eine Art, die identisch aussieht. Das Markdown ist in beiden Fällen unverändert und korrekt.

**Eine Blockreferenz ist kein kaputter Link, sie ist nichts.** `[[Notiz#^a1b2c3]]` zeigt außerhalb von Obsidian auf eine ID, die in keiner Datei mehr existiert. Es gibt kein Ziel zu reparieren und keinen Ersatz darzustellen. Die einzige ehrliche Abhilfe ist, den Text einzufügen, auf den gezeigt wurde, was heißt, dass Sie den Vault dafür noch in Obsidian offen haben müssen.

**Von Plugins dargestellte Inhalte hinterlassen keine Spur ihrer Existenz.** Eine Notiz, deren ganzer Wert eine Dataview-Tabelle war, konvertiert zu einem Codeblock mit einer Abfrage darin. Für eine Leserin, die den Vault nie benutzt hat, sieht diese Notiz jetzt aus, als wäre sie immer ein Fragment gewesen. Prüfen Sie darauf, solange der Vault sie noch darstellt.

**Und Frontmatter ist manchmal tragend.** Sie kann die einzige Stelle sein, an der eine Notiz festhielt, woher sie kam oder um wen es ging. Der Weg über die Zusammenführung entfernt sie automatisch, was für die Lesbarkeit richtig ist und einen Blick vorher wert, falls diese Eigenschaften zählten.

## Wie Sie wählen

1. **Entscheiden Sie zuerst die Form der Ausgabe, denn sie ist nicht billig umkehrbar.** Ein Ordner separater Dateien mit funktionierenden Links dazwischen zeigt auf obsidian-export oder Ihr eigenes Skript; ein Dokument für einen Menschen zum Lesen zeigt auf den Weg über die Zusammenführung. In die falsche Richtung zu konvertieren und danach von Hand umzuformen ist die langsamste Fassung dieser Aufgabe.
2. **Durchsuchen Sie den Vault nach den vier Konstrukten, bevor Sie wählen.** `grep` nach `![[`, nach `> [!`, nach `#^` und nach ```` ```dataview ````. Ein Vault ohne Embeds und ohne Callouts kann fast alles hier verwenden; ein darauf gebauter Vault braucht ein Werkzeug, dessen Umgang damit Sie tatsächlich nachgelesen haben.
3. **Prüfen Sie, ob die Anhänge mitkommen müssen.** Wenn ja, sind der Weg über das Plugin oder ein Datei-zu-Datei-CLI-Export die einzigen Optionen, die sie tragen. Eine reine Markdown-Zusammenführung kann es bauartbedingt nicht, und keine Einstellung ändert das.
4. **Zählen Sie, wie oft das passieren wird.** Einmal ist ein Browser-Tab. Jede Woche oder bei jedem Commit ist eine CLI in einem Skript — dass ein Mensch daran denkt, ein Zip auf eine Seite zu ziehen, ist der Schritt, der irgendwann aufhört zu passieren.
5. **Suchen Sie nach doppelten Dateinamen, bevor Sie irgendeinem automatischen Umschreiben trauen.** `find . -name '*.md' | xargs -n1 basename | sort | uniq -d` dauert eine Sekunde. Nichts zurück heißt, dass jedes Werkzeug hier auf dieser Achse sicher ist; zurückgegebene Zeilen heißen, dass nur ein Skript unter Ihrer Kontrolle sie so auflöst, wie Sie es meinten.

## Fazit

Es gibt hier keine kostenpflichtige Stufe zu vergleichen, was diesen Vergleich ungewöhnlich ehrlich macht: Jeder Weg ist kostenlos, und die Entscheidung dreht sich ganz um die Form der Ausgabe und darum, wie viel von Obsidians Dialekt jeder Weg versteht. Für einen Vault, der ein funktionierender Ordner verlinkter Dateien bleiben muss, ist obsidian-export das kostenlose Werkzeug, das genau dafür gebaut wurde. Für eine Notiz oder einen Ordner, deren Bilder mitreisen müssen, ist ein Community-Plugin der einzige Weg, der Binärdateien trägt. Für einen Vault, der ein Dokument wird, das jemand außerhalb von Obsidian lesen soll, erledigt TransformPipes [Obsidian-→-Markdown-Konvertierung](/obsidian-to-markdown) die Zusammenführung, das Inhaltsverzeichnis, das Auflösen der Wikilinks und das Entfernen der Frontmatter in einem Durchgang, im Browser, ohne dass etwas hochgeladen wird. Was Sie auch wählen: Schalten Sie „Use \[\[Wikilinks\]\]“ am selben Tag aus, damit der Rückstau aufhört zu wachsen, und suchen Sie nach Dataview-Blöcken, solange der Vault noch offen ist — das ist das eine, was kein Konverter hier zu keinem Preis zurückholt. Falls Obsidian nicht die einzige Quelle im Spiel ist, deckt [der Vergleich der drei Exporte](/blog/markdown-from-notion-obsidian-and-confluence) ab, was Notion und Confluence anders machen.

## FAQ

### Gibt es einen wirklich kostenlosen Konverter von Obsidian nach Markdown?

Alle sind es. Obsidians Dateien sind schon Markdown, und jedes Werkzeug auf dieser Seite ist kostenlos nutzbar, es gibt also keine kostenpflichtige Stufe zum Vergleich. Die Optionen unterscheiden sich darin, ob sie separate Dateien oder ein Dokument erzeugen, und darin, wie vollständig sie Wikilinks, Embeds, Blockreferenzen und Callouts behandeln.

### Hat Obsidian einen eingebauten Export nach Markdown?

Nein, und es braucht keinen — der Vault ist bereits ein Ordner mit `.md`-Dateien. Obsidian hat eine Einstellung „Use \[\[Wikilinks\]\]“, die neue Links zu Standard-Markdown macht, sie gilt aber nur für Links, die nach der Umstellung geschrieben werden, es ist also eine Vorbeugung und kein Export.

### Was ist der schnellste kostenlose Weg, einen ganzen Vault in eine Datei zu verwandeln?

Zippen Sie den Vault-Ordner und werfen Sie ihn auf einen Browser-Konverter, der das Archiv direkt liest — er gibt ein Dokument zurück, in dem jede Notiz ein Abschnitt unter einem erzeugten Inhaltsverzeichnis ist. Nichts zu installieren, und das Wikilink-Problem löst sich von selbst, denn ein zusammengeführtes Dokument hat keine separaten Dateien, auf die Links zeigen könnten.

### Erhält ein kostenloser Konverter meine Bilder?

Nur manche. Ein Plugin, das eine Notiz oder einen Ordner samt Anhängen exportiert, tut es; ein Werkzeug, das ein einzelnes Markdown-Dokument erzeugt, kann es nicht, denn eine Markdown-Datei enthält Text und einen Verweis auf ein Bild, nie das Bild selbst. Prüfen Sie, welches Verhalten Sie bekommen, bevor Sie einen Vault konvertieren, in dem die Diagramme die Bedeutung tragen.

### Kann Pandoc einen Obsidian-Vault kostenlos konvertieren?

Pandoc ist kostenlos und GPL-lizenziert, und es parst Wikilinks über die nicht standardmäßig aktive Erweiterung `wikilinks_title_after_pipe`. Was es nicht kann, ist einen Wikilink auf eine Datei anderswo im Vault aufzulösen, denn es hat keinen Index davon — jenseits der einfachsten Notizen braucht es also einen Filter oder ein Wrapper-Skript, das die Auflösung selbst übernimmt.

### Was passiert mit Dataview-Tabellen und anderen Plugin-Inhalten?

Nichts trägt sie hinüber, denn sie waren nie in der Datei. Dataview speichert die Abfrage und stellt die Tabelle innerhalb von Obsidian zur Anzeigezeit dar, eine konvertierte Notiz zeigt also die Abfrage als Codeblock und überhaupt keine Tabelle. Halten Sie fest, wo diese Tabellen zählten, bevor Sie konvertieren, solange sie noch sichtbar sind.

### Ist es sicher, einen Vault im Browser zu konvertieren?

Das hängt vollständig davon ab, ob die Seite die Datei hochlädt oder sie lokal liest. Ein Konverter, der die Arbeit in Ihrem eigenen Browser macht, sendet das Archiv nie irgendwohin, was Sie prüfen können, indem Sie das Netzwerkpanel öffnen und zusehen, wie nichts passiert — bei einem Vault mit irgendetwas Privatem darin lohnt sich das einmal.
