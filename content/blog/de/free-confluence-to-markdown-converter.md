---
title: "Der beste kostenlose Confluence-zu-Markdown-Konverter 2026: alle Optionen im Vergleich"
description: "Welcher kostenlose Confluence-zu-Markdown-Konverter in der Praxis kostenlos ist: wo die Testphasen enden, warum der eingebaute Export Space-Admin-Rechte verlangt"
date: 2026-09-14
tag: Konvertieren
keywords: confluence markdown export kostenlos, confluence nach markdown konvertieren, kostenloser confluence konverter, confluence space export markdown, confluence markdown app, confluence html export konvertieren, confluence wiki nach markdown
---

Suchen Sie nach einem kostenlosen Konverter von Confluence nach Markdown, und jedes Ergebnis sagt kostenlos. Dann probieren Sie sie aus. Eines ist eine dreißigtägige Testphase, die sich im Eintrag kostenlos nennt. Eines ist wirklich kostenlos und schafft eine Seite auf einmal, was nicht das war, was Sie wollten, als das zu Konvertierende ein vierhundertseitiges Wiki ist. Eines ist kostenlos und ohnehin schon in Confluence eingebaut und hält Sie bei einer Berechtigung auf, die Sie sich nicht selbst erteilen können. Und eines würde perfekt funktionieren, wenn Sie die Inhalte in einer Form aus Confluence herausbekämen, die es lesen könnte, und genau darin besteht das ganze Problem.

Das ist ein ungewöhnlich dichtes Feld an Sternchen für eine einfach klingende Aufgabe, und es ist kein Zufall. Confluence hat keinen Markdown-Export, jeder Weg führt also entweder über ein Exportformat, das für etwas anderes gedacht war, oder über eine App, die jemand mit Administratorrechten installieren muss. Kostenlos heißt in dieser Nische meist: kostenlos für Sie, falls jemand anders Ja sagt.

In diesem Text geht es darum, welcher dieser Wege tatsächlich kostenlos ist, für wen und in welchem Umfang. Für die Mechanik — welches Exportformat was behält, was aus jedem Makro wird, warum seiteninterne Links brechen — geht [wie Sie eine Confluence-Seite nach Markdown konvertieren](/blog/convert-confluence-page-to-markdown) die Exportformate einzeln durch und den Schaden, den jedes anrichtet. Dieser Text hier ist die Einkaufsliste.

### Kurzfassung

**Der kostenlose Weg im Umfang eines ganzen Space ist ein Export plus eine Konvertierung.** Confluences eigener HTML-Space-Export kostet nichts, braucht aber Space-Admin-Rechte, und der Export eines Space-Admins enthält nur, was sein eigenes Konto sehen kann — es sei denn, ein Site-Admin führt ihn aus, dann wird alles exportiert, unabhängig von der Sichtbarkeit (geprüft auf support.atlassian.com, 14. September 2026). Sobald Sie dieses Zip haben, ist die Konvertierung aus jeder Richtung kostenlos: Werfen Sie es auf [einen Browser-Konverter](/confluence-to-markdown) für ein zusammengeführtes Dokument mit Inhaltsliste, oder richten Sie Pandoc beziehungsweise ein turndown-Skript auf die HTML-Dateien für eine Markdown-Datei pro Seite.

**Lesen Sie im Atlassian Marketplace das Wort über dem Knopf.** Ein Eintrag mit der Überschrift **Free app** ist kostenlos; einer mit der Überschrift **Try it free** ist eine Testphase mit einem Preis dahinter. Beides ist in dieser Kategorie heute vertreten, und der Abschnitt unten nennt, was was ist (geprüft auf marketplace.atlassian.com, 14. September 2026). So oder so muss jemand mit Administratorrechten sie installieren, und das ist dieselbe Hürde wie beim Export.

**Word- und PDF-Export sind kostenlos und sind kein Weg.** Es sind die beiden Exporte, die jeder ohne Berechtigung ausführen kann, und genau deshalb greifen Leute danach, und es sind die beiden, die die Struktur wegwerfen, die eine Markdown-Konvertierung braucht.

## Warum „kostenlos“ bei genau dieser Konvertierung der schwierige Teil ist

Bei den meisten Konvertierungen ist kostenlos eine langweilige Frage. Eine CSV ist eine Datei auf Ihrer Platte; ein Konverter liest sie; niemand genehmigt irgendetwas. Confluence ist in zwei Punkten anders, und beide werden zu Geld oder zu Berechtigung.

**Es gibt keinen Markdown-Export, also erledigt jede kostenlose Option zwei Aufgaben.** Eine Seite liegt in Confluences eigenem, XHTML-basiertem Speicherformat, und das Exportmenü bietet Darstellungen davon an — Word, PDF, HTML, XML, CSV —, keine davon Markdown. Ein Konverter muss deshalb entweder eine App sein, die in Confluence lebt und dieses Format über die API liest, oder ein zweiter Schritt nach einem Export. Apps kosten Geld, weil sie Software sind, die gegen eine sich bewegende API gepflegt wird; zweite Schritte sind kostenlos, weil die Teile bereits existieren. Das ist die Ökonomie dieser ganzen Kategorie.

**Die brauchbaren Exporte hängen an Berechtigung statt an Bezahlung.** Word- und PDF-Export einer einzelnen Seite stehen jedem offen, der die Seite lesen kann. Alles im Umfang eines Space — HTML, XML, CSV — braucht Space-Admin-Rechte. Der kostenlose eingebaute Weg kostet kein Geld und kostet vielleicht eine Woche Warten auf ein Ticket. Die meisten, die nach einem kostenlosen Konverter suchen, sind keine Space-Admins; sie sind Entwicklerin, technische Redakteurin oder neu und bekommen ein Wiki mit der Bitte in die Hand, es in ein Repository zu bringen.

Der zweite Punkt verdient Deutlichkeit, weil keine Produktseite ihn Ihnen sagen wird: **Wenn Sie kein Space-Admin sind und keiner werden können, ist die Wahl des Konverters nicht Ihr Engpass.** Die Frage, die Sie in Wahrheit beantworten, ist, welche von zwei Bitten die kleinere ist — einen Space-Admin zu bitten, einen Export auszuführen und Ihnen ein Zip zu schicken, oder einen Site-Admin zu bitten, eine App zu installieren. Das erste ist ein einmaliger Gefallen; das zweite ist eine dauerhafte Entscheidung darüber, welche Software auf dem Confluence der Firma läuft, und deshalb gewinnt der Weg aus Export und Konvertierung öfter, als seine Ergonomie verdient.

Noch etwas zu diesem kostenlosen eingebauten Export: Der eigene Export eines Space-Admins enthält nur, was dieser Admin ohnehin schon sehen kann. Seiten, die vor ihm beschränkt sind, fehlen still im Zip, und nichts weiter unten in der Kette kann Ihnen von einer Seite erzählen, die nie im Archiv war. Ein Site-Admin, der ihn ausführt, bekommt alles (geprüft auf support.atlassian.com, 14. September 2026). Blogbeiträge sind im HTML- oder PDF-Export eines Space überhaupt nicht enthalten, und Kommentare sind in einem PDF-Export nie enthalten, laut derselben Dokumentation.

## Kurzvergleich: der Spickzettel

| Werkzeug | Am besten für | Kernfähigkeit | Preis |
| --- | --- | --- | --- |
| Confluences HTML-Space-Export | Die Inhalte überhaupt herauszubekommen | Eine HTML-Datei pro Seite plus Anhänge, in einem Zip | Kostenlos, braucht Space-Admin-Rechte |
| Der Browser-Konverter unter /confluence-to-markdown | Dieses Zip in ein lesbares Dokument zu verwandeln | Export-Zip abwerfen, ein Dokument mit Inhaltsliste bekommen | Kostenlos; abgemeldet wird nichts hochgeladen |
| Pandoc | Eine skriptgesteuerte Massenmigration | `html` rein, `gfm` oder `commonmark` raus, ein Befehl pro Datei | Kostenlos, GPL |
| Ein turndown-Skript | Regeln, die Sie selbst kontrollieren müssen | Eigene Regeln für das Wrapper-Markup, das Confluence ausgibt | Kostenlos, MIT |
| Marketplace-App, gelistet als Free app | Markdown-Export aus Confluence heraus | Exportieren, ohne die Seite zu verlassen | Kostenlos laut Eintrag; ein Admin installiert sie |
| Marketplace-App, gelistet als Try it free | Eine Bewertung vor der Kaufentscheidung | Dasselbe, mit Seitenbaum und Anhängen für Sie erledigt | Eine Testphase; der Preis steht im Preis-Tab |
| Export nach Word | Eine Seite, die Sie in einem Editor brauchen | Eine `.docx` einer einzelnen Seite | Kostenlos, keine Berechtigung nötig |
| Export nach PDF | Eine Seite, die Sie jemandem schicken | Eine dargestellte, statische Seite | Kostenlos, keine Berechtigung nötig, kein Weg zu Markdown |

## Die Optionen, eine nach der anderen

### Confluences HTML-Space-Export, dann ein beliebiger HTML-zu-Markdown-Konverter

Das ist die Grundlinie, an der jede andere kostenlose Option gemessen wird, und es sind zwei kostenlose Dinge hintereinander statt eines Werkzeugs. Aus der Space-Seitenleiste: Weitere Aktionen, Space-Einstellungen, Allgemein, Space exportieren, HTML. Zurück kommt ein Zip mit einer dargestellten HTML-Datei pro Seite, einem Anhangsordner und einem Index, der die Seiten auflistet. Das zu konvertieren ist eine gewöhnliche [HTML-zu-Markdown-Konvertierung](/blog/convert-html-to-markdown), ohne einen Confluence-spezifischen Schritt.

| Dafür | Dagegen |
| --- | --- |
| Kostenlos, ohne Konto, ohne Installation und ohne App, die genehmigt werden muss | Space-Admin-Rechte, und das ist die Hürde, an die die meisten stoßen |
| Echtes Markup: Überschriften, Listen, Tabellen und Links überleben als Elemente | Das Zip enthält nur, was das exportierende Konto sehen kann |
| Anhänge sind neben den Seiten verpackt, die sie verwenden | Dateinamen sind maschinenerzeugt; der Seitenbaum lebt nur in der Indexdatei |
| Hängt an nichts, das seinen Preis ändern oder den Marketplace verlassen kann | Blogbeiträge sind im HTML-Export nicht enthalten |

**Preis:** kostenlos. Der Export ist Teil von Confluence, und jeder Konverter, auf den zu zeigen sich lohnt, ist ebenfalls kostenlos.

**Technische Details.** Das exportierte HTML ist dicht — Inline-Stile, Makro-Wrapper-`div`s, Icon-`span`s ohne Text —, und deshalb will der zweite Schritt einen echten HTML-Parser statt eines Skripts, das spitze Klammern löscht. Die Indexdatei ist der einzige Ort, an dem die Seitenhierarchie existiert, denn die Dateinamen sind flach und tragen erzeugte IDs statt Titel. Wenn Ihr Ziel Ordner braucht, die den Baum des Wikis spiegeln, ist diese Zuordnung Ihre Aufgabe, aus dem Index heraus.

**Für wen ist das?** Für alle, die Space-Admin-Rechte haben oder jemanden kennen, der sie hat, und für alle, die einen Weg ohne fortlaufende Abhängigkeit wollen.

### Der Browser-Konverter — Export-Zip abwerfen, ein Dokument bekommen

Sobald Sie dieses Zip haben, ist der kürzeste kostenlose Weg, das ganze Archiv einem Konverter zu geben, der es direkt liest. [TransformPipes Confluence-→-Markdown-Konvertierung](/confluence-to-markdown) nimmt das Export-Zip so, wie es aus Confluence kommt, konvertiert das HTML jeder Seite mit demselben Konverter, der hinter der HTML-zu-Markdown-Seite steckt, und führt alles zu einem Dokument mit einer Inhaltsliste oben zusammen.

| Dafür | Dagegen |
| --- | --- |
| Kein Entpacken, kein Verzeichnisdurchlauf, keine Indexdatei, die von Hand zu lesen wäre | Ein Dokument heraus, nicht eine Datei pro Seite — die falsche Form für eine Doku-Site |
| Eine Inhaltsliste wird aus dem Titel jeder Seite erzeugt | Die Inhaltsliste besteht aus reinen Titeln, nicht aus Links |
| Läuft im Browser; abgemeldet wird das Zip nirgendwohin hochgeladen, und ein Anhang, der ein Bild ist, wird ins Dokument übernommen | Ein Anhang, der kein Bild ist, behält seinen Link, der weiterhin eine Confluence-Sitzung verlangt |
| Kostenlos, kein Konto, keine Installation, nichts, was ein Admin genehmigen müsste | Die Seitenreihenfolge folgt den Pfaden des Archivs, nicht der Hierarchie des Wikis |

**Preis:** kostenlos. Ein Konto ergänzt Verlauf, Freigabe und eine API, ebenfalls kostenlos.

**Technische Details und Funktionen**

- Jeder `.html`-Eintrag wird gelesen, Verzeichnisse und leere Einträge werden übersprungen, und die Einträge werden nach Pfad sortiert, sodass zwei Exporte desselben Space dasselbe Dokument in derselben Reihenfolge ergeben
- Der Titel jeder Seite stammt aus ihrem eigenen `<title>`-Element, ersatzweise aus dem Dateinamen mit abgeschnittener Seiten-ID am Ende und Trennzeichen, die wieder zu Leerzeichen werden, sodass auch eine Seite, deren Export keinen Titel behielt, lesbar in der Inhaltsliste landet
- Eine Seite, die ohnehin mit ihrem eigenen Titel als Überschrift beginnt, bekommt ihn nicht zweimal; das Duplikat fällt vor dem Zusammenführen weg
- Seiten werden mit einer horizontalen Linie verbunden, derselben Konvention wie beim Zusammenführen mehrerer von Hand hochgeladener Dateien
- Das Entpacken übernimmt `fflate`, reines JavaScript ohne native Bindings, was denselben Code in einem Browser-Tab und auf dem Server für API-Aufrufer laufen lässt

**Für wen ist das?** Für einen Space, der archiviert wird, ein Wiki, das einem neuen Team als ein Dokument übergeben wird, oder den Fall, dass Ihnen jemand ein Export-Zip geschickt hat und Sie es lesen wollen, ohne etwas zu installieren. Nicht das Werkzeug, wenn jede Seite ihre eigene Datei mit ihrer eigenen URL bleiben muss.

### Pandoc — kostenlos und die richtige Antwort für eine Massenmigration

Pandoc liest `html` und schreibt unter vielem anderem `gfm`, `commonmark` und `markdown_strict`, was die zweite Hälfte des Weges aus Export und Konvertierung zu einer Shell-Schleife macht (geprüft auf pandoc.org, 14. September 2026). Es ist die kostenlose Option, die skaliert, für den Fall, dass die Ausgabe Hunderte von Dateien mit einer Struktur sein muss, die Sie kontrollieren.

| Dafür | Dagegen |
| --- | --- |
| Kostenlos und GPL-lizenziert, ohne Konto und ohne Dienst dahinter | Eine Installation, und eine große |
| `-t gfm` gibt Ihnen den Markdown-Dialekt, den GitHub und die meisten statischen Seitengeneratoren erwarten | Kein Wissen über Confluence: Wrapper-`div`s kommen als das durch, was sie an HTML waren |
| `--extract-media` zieht verlinkte Medien in ein Verzeichnis und schreibt die Verweise um | Die Schleife, die Benennung und die Ordnerstruktur schreiben Sie selbst |
| Hat außerdem einen `jira`-Reader für Jira- und Confluence-Wiki-Markup | Dieses Wiki-Markup ist nicht das, worin eine moderne Cloud-Seite gespeichert wird |

**Preis:** kostenlos, GPL-lizenziert.

**Technische Details und Funktionen**

- `pandoc -f html -t gfm page.html -o page.md` ist die ganze Konvertierung für eine Seite; eine Schleife über das Exportverzeichnis ist die ganze Konvertierung für einen Space
- `--wrap=none` hindert Pandoc daran, die Ausgabe hart an einer Spaltenbreite umzubrechen, was zählt, wenn das Ergebnis in einem Repository landet, wo Diffs satzweise sein sollten
- `--extract-media=media` extrahiert die von der Quelle referenzierten Medien und passt die Verweise auf die extrahierten Dateien an — das Nächstliegende, was es kostenlos als Abhilfe für Confluences sitzungsgebundene Anhangs-URLs gibt
- Das Format `jira` ist als Ein- und Ausgabe gelistet und als Jira- und Confluence-Wiki-Markup beschrieben — nützlich für alte Server-Seiten, die so verfasst wurden, und kein Weg für Cloud-Seiten, die stattdessen im XHTML-basierten Speicherformat liegen
- `gfm` ist die Variante, nach der Sie fragen sollten, wenn Tabellen zählen; `markdown_strict` hat überhaupt keine Tabellensyntax

**Für wen ist das?** Für alle, die ein Wiki einmal und ordentlich in ein Repository bewegen — wo das Ergebnis ein Verzeichnisbaum, ein Benennungsschema und ein Build ist, der sauber neu erzeugt. Eine Migration, die Sie zweimal ausführen werden, sollte ein Skript sein, und das hier ist das Skript.

### Ein turndown-Skript — kostenlos, wenn die Regeln Ihre sein müssen

Turndown ist eine JavaScript-Bibliothek, die HTML nach Markdown konvertiert, MIT-lizenziert, und HTML-Zeichenketten oder DOM-Knoten entgegennimmt (geprüft auf github.com/mixmark-io/turndown, 14. September 2026). Der Grund, darum herum zu skripten statt Pandoc laufen zu lassen, ist, dass Confluences exportiertes HTML wiedererkennbare Formen enthält — Makro-Panels, Codeblock-Wrapper, Expand-Makros — und turndown Sie pro Form eine Regel ergänzen lässt.

| Dafür | Dagegen |
| --- | --- |
| Kostenlos, MIT, und eine Abhängigkeit statt einer Installation | Sie schreiben ein Programm, mit allem, was das bedeutet |
| Regeln können auf Confluences eigene Klassennamen passen und genau das ausgeben, was Sie wollen | Jede Regel ist eine Wartungslast, wenn Confluences Darstellung sich ändert |
| `turndown-plugin-gfm` ergänzt Tabellen und Durchstreichung über den Kernregeln | Turndown ohne dieses Plugin gibt keine Tabellen aus |
| Läuft überall dort, wo Node läuft, auch in CI | Braucht ein DOM: in Node heißt das, eines bereitzustellen |

**Preis:** kostenlos, MIT-lizenziert.

**Technische Details und Funktionen**

- Eine Regel ist ein Filter plus eine Ersetzungsfunktion, `div.confluence-information-macro-note` zu einem Blockquote zu machen ist also ein paar Zeilen statt eines Nachbearbeitungsdurchgangs über die Ausgabe
- Weil turndown DOM-Knoten entgegennimmt, kann ein Skript vor dem Konvertieren beschneiden — die Icon-`span`s und das Navigationsmobiliar entfernen, die ein generischer Konverter treu in verirrte Leerzeilen verwandelt
- Das GFM-Plugin ist das Stück, das zuerst dazugehört: Tabellen sind das Häufigste in einem exportierten Wiki, und die Kernbibliothek lässt sie als HTML stehen

**Für wen ist das?** Für eine Migration, deren Ausgabe einem bestehenden Styleguide entsprechen muss, oder wo ein Makro auf zweihundert Seiten vorkommt und jedes Mal gleich herauskommen muss. Für eine einmalige Konvertierung ist es mehr Arbeit, als das Ergebnis rechtfertigt.

### Apps im Atlassian Marketplace — lesen Sie das Wort über dem Knopf

Mehrere Apps exportieren Confluence-Seiten aus Confluence heraus nach Markdown, ohne HTML-Zwischenexport. Hier braucht „kostenlos“ die meiste Sorgfalt, denn der Marketplace zeigt zwei verschiedene Dinge an fast derselben Stelle: Ein Eintrag mit der Überschrift **Free app** ist kostenlos, und einer mit der Überschrift **Try it free** ist eine Testphase mit einem Preis im Preis-Tab.

Beides ist heute vertreten. Als kostenlose Apps gelistet: „Markdown Exporter for Confluence (API, Bulk & Attachments)“ von Yamuno Software US und „Markdown | Source Editor | Markdown Exporter (FREE)“ von Agilva Solutions. Als Try it free gelistet: „Easy Markdown Exporter for Confluence“ von AppLiger, „Markdown Exporter for Confluence“ von Narva Software, „Export to Markdown for Confluence Cloud“ von Atly Apps und „Instant Markdown Exporter for Confluence“ von Philip Lindner, die eine 30-tägige kostenlose Testphase angibt (alles geprüft auf marketplace.atlassian.com, 14. September 2026).

| Dafür | Dagegen |
| --- | --- |
| Markdown direkt, ohne getrennten Schritt aus Export und Konvertierung | Eine App zu installieren ist die Entscheidung eines Administrators, nicht die einer Seitenautorin |
| Manche schreiben Links auf relative Pfade um und erhalten den Seitenbaum, was der kostenlose Weg nicht tut | Ein Eintrag, der Try it free sagt, ist eine Testphase, und der Preis ist einen Tab entfernt |
| Läuft gegen die lebenden Inhalte, nichts ist also eine Momentaufnahme eines Exporttags | Einträge, Anbieter und Preise ändern sich in dieser Kategorie oft |
| Forge-Apps laufen innerhalb Ihrer eigenen Atlassian-Umgebung | Eine App ist eine dauerhafte Abhängigkeit, die jemand pflegen muss |

**Preis:** unterschiedlich, und die Überschrift des Eintrags ist das schnellste Signal — Free app oder Try it free (geprüft auf marketplace.atlassian.com, 14. September 2026). Prüfen Sie den aktuellen Eintrag statt irgendeines Artikels, diesen eingeschlossen: Das ist der Teil, der am ehesten veraltet ist, wenn Sie das hier lesen.

**Technische Details.** Die Unterschiede, deren Vergleich sich lohnt, sind die, die der kostenlose Weg überhaupt nicht leisten kann: ob die Seitenhierarchie als Ordner erhalten bleibt, ob Anhänge mit den Seiten mitkommen und ob interne Links auf relative Pfade umgeschrieben werden, sodass sich das Ergebnis offline navigieren lässt. Diese drei sind das eigentliche Produkt; HTML nach Markdown zu konvertieren ist der Massenteil und der Grund, warum es so viele dieser Apps mit so wenig dazwischen gibt.

**Für wen ist das?** Für Teams, die Marketplace-Apps routinemäßig installieren und Markdown-Export als dauerhafte Fähigkeit wollen. Für eine einzelne Migration bringt Sie der Weg aus Export und Konvertierung ohne ein Beschaffungsgespräch ans Ziel.

### Word- oder PDF-Export — kostenlos, ohne Berechtigung, und eine Sackgasse

Das sind die beiden Exporte, die jedem offenstehen, der eine Seite lesen kann, und deshalb ist es das Erste, was Leute probieren, wenn der HTML-Export ausgegraut ist. Sie stehen hier der Ehrlichkeit halber, nicht als Empfehlung.

| Dafür | Dagegen |
| --- | --- |
| Keine Berechtigung über das Lesen der Seite hinaus | Eine Seite auf einmal; es gibt von beidem keine Variante im Umfang eines Space, die hilft |
| Kostenlos, eingebaut, zwei Klicks | PDF ist dargestellte Ausgabe — die Struktur ist weg, bevor ein Konverter sie sieht |
| Eine `.docx` behält immerhin Überschriften, Listen und Tabellen als Struktur | Words Überschriften sind nur so gut, wie der Export echte Überschriftenformate verwendet hat |
| In Ordnung, wenn das Ziel ohnehin immer Word oder PDF war | Kommentare sind in einem PDF-Export nie enthalten |

**Preis:** kostenlos.

**Technische Details.** Der `.docx`-Weg ist nicht hoffnungslos — ein Word-Dokument hat ein echtes Dokumentmodell, und [es nach Markdown zu konvertieren](/blog/best-word-to-markdown-converters) holt Überschriften, Listen und Tabellen zurück. Es ist der weite Weg: Speicherformat zu Word zu Markdown, mit Verlust an jeder Station, während HTML zu Markdown eine Station mit weniger Verlust ist. PDF ist wirklich eine Sackgasse, denn ein PDF beschreibt, wo Farbe auf eine Seite kommt, und die Überschriftenstruktur, die Markdown braucht, existiert darin nicht mehr.

**Für wen ist das?** Für jemanden mit einer Seite, ohne Space-Admin-Rechte und ohne Lust auf ein Ticket. Für diese Person ist der Word-Export plus eine Word-zu-Markdown-Konvertierung ein legitimer kostenloser Weg, und das zu sagen ist besser, als so zu tun, als bräuchte die einzig richtige Antwort eine Berechtigung, die sie nicht hat.

## Wo die naheliegende kostenlose Wahl nicht trägt

Der Weg aus Export und anschließender Konvertierung ist die Empfehlung dieses Artikels, er verdient also einen Abschnitt darüber, wo er nicht trägt. Es gibt vier Stellen, und drei sind nicht die Schuld des Konverters.

**Er erzeugt Dateien, und Dateien sind kein Wiki.** Ein Confluence-Space ist ein Baum mit Querverweisen. Der HTML-Export flacht diesen Baum in ein Verzeichnis erzeugter Dateinamen ab, und jeder Konverter weiter unten erbt diese Abflachung. Sie bekommen die Inhalte und verlieren die Navigation, es sei denn, Sie bauen sie selbst aus dem Index neu auf. Marketplace-Apps, die mit „erhält die Hierarchie“ werben, werben mit dem einen, was der kostenlose Weg nicht tut.

**Seitenübergreifende Links überstehen den Umzug nicht.** Ein Link von einer Seite auf eine andere war eine Confluence-URL, und nach der Konvertierung ist er das immer noch — richtig, wenn Confluence bleibt, falsch, wenn dies eine Migration davon weg ist. Diese Links umzuschreiben braucht eine Zuordnung von Seite auf neuen Dateipfad, und diese Zuordnung existiert erst, wenn Sie das Dateilayout entschieden haben. Es ist das größte Einzelstück Handarbeit in einer echten Migration.

**Anhänge zeigen auf eine Sitzung.** Confluences Inline-Anhangslinks zielen auf seinen eigenen Download-Endpunkt, der erwartet, dass Sie angemeldet sind, eine Seite, die in Ihrem Browser vollständig aussieht, hat für alle anderen also kaputte Bilder. Der Space-Export packt die Dateien genau deshalb ins Zip; die Abhilfe ist, die Links auf diese lokalen Kopien umzubiegen. Pandocs `--extract-media` kommt einen Teil des Weges; der Rest ist ein Suchen und Ersetzen, das Sie schreiben.

**Was ein Makro war, ist jetzt eine Momentaufnahme.** Alles, was eine lebende Abfrage war — ein Jira-Vorgangs-Makro, eine eingebundene Seite, ein Seitenbaum —, wurde als das exportiert, was es an diesem Tag darstellte, und kein Konverter kann Verhalten wiederherstellen, das nie in der Datei war. [Der Anleitungsartikel](/blog/convert-confluence-page-to-markdown) hat die Tabelle Makro für Makro, falls Sie die brauchen, bevor Sie sich festlegen.

Und eines zu „kostenlos“ statt zur Struktur: **Ein kostenloser Konverter, der Ihr Wiki hochlädt, ist ein kostenloser Konverter, der jetzt Ihr Wiki hat.** Interne Dokumentation enthält Kundennamen, Architektur und Vorfallberichte — die Hälfte der Dinge, die eine Firma lieber nicht einem Dienst gibt, den niemand geprüft hat. Konvertierung im Browser und lokale Kommandozeilenwerkzeuge sind die beiden Formen, bei denen sich die Frage nicht stellt, und der Unterschied taucht in keiner Funktionstabelle auf; Sie prüfen ihn, indem Sie den Netzwerk-Tab beobachten. [Ob ein Online-Konverter sicher ist](/blog/is-an-online-converter-safe), sind zehn Minuten wert, bevor Sie einen Space-Export auf irgendetwas werfen.

## Wie Sie wählen

1. **Klären Sie die Berechtigungsfrage, bevor Sie irgendetwas vergleichen.** Ohne Space-Admin-Rechte steht Ihnen der HTML-Export nicht zur Verfügung, und eine Marketplace-App braucht einen Site-Admin, der sie installiert. Beide Wege beginnen damit, jemanden zu fragen, und wer leichter erreichbar ist, entscheidet Ihren Weg mehr als jede Funktion.
2. **Entscheiden Sie zuerst die Form der Ausgabe.** Ein Dokument zum Lesen oder ein Verzeichnis voller Dateien? Ein Dokument ist ein Dateiabwurf auf einen zusammenführenden Konverter. Ein Verzeichnis ist Pandoc oder ein Skript und eine Entscheidung über das Ordnerlayout, bevor Sie beginnen.
3. **Zählen Sie die Seiten.** Unter zehn ist Handarbeit billiger als Automatisierung, und der Word-Export einer einzelnen Seite ist eine legitime kostenlose Antwort. Über hundert überlebt nur ein skriptgesteuerter Weg, denn das Nachbessern von Hand wird Ihre Geduld schon vorher aufbrauchen.
4. **Prüfen Sie, ob die Inhalte den Rechner verlassen dürfen.** Interne Dokumentation darf das meist nicht, was jeden gehosteten Konverter ausschließt, der hochlädt, und Konvertierung im Browser, ein lokales Werkzeug oder eine Forge-App in Ihrer eigenen Atlassian-Umgebung übrig lässt.
5. **Lesen Sie im Marketplace die Überschrift und dann den Preis-Tab.** Free app und Try it free stehen an derselben Stelle und bedeuten Verschiedenes. Bestätigen Sie auch den Umfang: Eine App, die eine Seite kostenlos exportiert, ist ein anderes Produkt als eine, die einen Space exportiert.
6. **Konvertieren Sie eine schwierige Seite, bevor Sie vierhundert konvertieren.** Nehmen Sie die Seite mit den meisten Makros, der breitesten Tabelle und den meisten Anhängen und lesen Sie das Ergebnis richtig. Alles, was im ganzen Space schiefgehen wird, ist in dieser einen Datei bereits sichtbar.

## Fazit

Der kostenlose Konverter von Confluence nach Markdown, der für fast alle funktioniert, ist kein Werkzeug: Es ist Confluences eigener HTML-Space-Export, gefolgt von einer kostenlosen Konvertierung Ihrer Wahl. Dieser Weg kostet nichts, hängt an nichts, das seinen Preis ändern kann, und funktioniert auf Cloud, Server und Data Center gleich. Sein Preis ist eine Berechtigung — Space-Admin —, und das klar zu sagen ist nützlicher als jeder Funktionsvergleich, denn für einen großen Teil derer, die nach diesem Begriff suchen, ist die Berechtigung das ganze Problem, und kein Konverter löst es.

Von da an ist die Wahl leicht. Ein lesbares Dokument aus einem Space-Export-Zip ist ein Dateiabwurf auf [die Confluence-Konvertierung hier](/confluence-to-markdown), kostenlos, wobei das Zip auf Ihrem Rechner bleibt, solange Sie abgemeldet sind. Ein Repository voller Dateien ist Pandoc in einer Schleife oder turndown mit Regeln, die Sie geschrieben haben. Und im Marketplace bedeutet kostenlos das, was die Überschrift des Eintrags sagt, und nichts weiter — heute nachzusehen lohnt sich mehr, als einem Artikel zu vertrauen, diesem eingeschlossen.

## FAQ

### Gibt es einen wirklich kostenlosen Konverter von Confluence nach Markdown?

Ja, mehr als einen, aber der kostenlose Teil ist selten der Konverter selbst. Confluences HTML-Space-Export ist kostenlos und braucht Space-Admin-Rechte; diesen Export zu konvertieren ist kostenlos mit Pandoc, einem turndown-Skript oder einem Browser-Konverter, der das Zip direkt nimmt. Im Marketplace sind manche Apps als kostenlose Apps gelistet und andere zeigen Try it free, was eine Testphase ist.

### Kann ich Confluence nach Markdown konvertieren, ohne Admin zu sein?

Nicht im Umfang eines Space. HTML-, XML- und CSV-Exporte sind Vorgänge auf Space-Ebene und brauchen Space-Admin-Rechte, und eine Marketplace-App zu installieren braucht ebenfalls einen Administrator. Für eine einzelne Seite, die Sie ohnehin lesen können, ist der Word-Export plus eine Word-zu-Markdown-Konvertierung ein kostenloser Weg, der keine zusätzliche Berechtigung verlangt.

### Warum enthält der kostenlose Export nicht jede Seite?

Weil der eigene Export eines Space-Admins nur enthält, was sein Konto sehen kann — beschränkte Seiten fehlen im Zip, ohne Warnung. Ein Site-Admin, der denselben Export ausführt, bekommt alles, unabhängig von der Sichtbarkeit (geprüft auf support.atlassian.com, 14. September 2026). Wenn eine Migration zu kurz kommt, prüfen Sie das zuerst.

### Erhält eine kostenlose Confluence-nach-Markdown-App die Seitenhierarchie?

Manche tun es, und das ist das Wichtigste, dessen Vergleich sich zwischen ihnen lohnt, denn der Weg aus Export und Konvertierung tut es nicht: Der HTML-Export flacht Seiten in erzeugte Dateinamen ab und behält den Baum nur in einer Indexdatei. Prüfen Sie jeden Eintrag auf Hierarchie, Anhänge und das Umschreiben relativer Links — diese drei sind es, was diese Apps trennt.

### Was ist der schnellste kostenlose Weg, einen Confluence-Space offline zu lesen?

Exportieren Sie den Space nach HTML und geben Sie das Zip einem Konverter, der es zu einem Dokument mit Inhaltsliste zusammenführt. Das erspart das Entpacken, die Indexdatei und jede Entscheidung über die Ordnerstruktur, zum Preis der Dateigrenzen pro Seite, die keine Rolle spielen, wenn Lesen das Ziel ist.

### Soll ich dafür Pandoc oder einen Browser-Konverter nehmen?

Pandoc, wenn die Ausgabe viele Dateien mit einem Layout ist, das Sie kontrollieren, denn es skaliert und lässt sich skripten. Einen Browser-Konverter, wenn die Ausgabe ein Dokument ist und Sie es ohne Installation wollen. Beide sind kostenlos und beide laufen lokal; der Unterschied ist die Form, die Sie am Ende brauchen, nicht die Qualität der Konvertierung.

### Sind die hier genannten Marketplace-App-Namen aktuell?

Sie sind das, was die Einträge am 14. September 2026 zeigten, und diese Kategorie ändert sich schneller als die meisten. Anbieter kommen und gehen, kostenlose Stufen erscheinen und schließen, und Preis-Tabs bewegen sich unabhängig von den Überschriften der Einträge. Behandeln Sie die Namen als Ausgangspunkt und lesen Sie den aktuellen Eintrag, bevor Sie irgendetwas entscheiden.
