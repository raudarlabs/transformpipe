---
title: "Eine Confluence-Seite nach Markdown konvertieren: jeder Export, und das HTML darunter"
description: "Wie Sie eine Confluence-Seite nach Markdown bekommen — warum es keinen nativen Export gibt und was jedes Makro dabei verliert"
date: 2026-09-14
tag: Konvertieren
keywords: confluence nach markdown, confluence seite nach markdown konvertieren, confluence export markdown, confluence html nach markdown, confluence seite exportieren, confluence space html export
---

Confluence hat einen Export-Knopf, dahinter mehrere Formate, und keines davon ist Markdown. Das ist kein Versehen: Eine Confluence-Seite wird nicht als Markdown gespeichert, oder auch nur als etwas, das dem nahekommt. Sie liegt in Confluences eigenem Speicherformat — XHTML-basiertem Markup mit zwei eigenen Namensräumen obendrauf, für Makros und für Ressourcenverweise —, und jedes Exportformat, das Confluence anbietet, ist eine Darstellung dieses Speicherformats in etwas anderes. Zu Markdown zu kommen heißt, eine dieser Darstellungen zu wählen und sie ein zweites Mal zu konvertieren.

Die praktische Folge: „Confluence nach Markdown konvertieren“ ist immer eine Arbeit in zwei Schritten — erst in einem Format exportieren, das genug Struktur behält, um das Konvertieren zu lohnen, dann eine echte HTML-zu-Markdown-Konvertierung über das laufen lassen, was herauskam. Direkt zu Word oder PDF zu springen wirft die Struktur weg, bevor der zweite Schritt überhaupt etwas hat, womit er arbeiten kann.

### Kurzfassung

**HTML ist der einzige Export, den zu konvertieren sich lohnt.** Confluences Speicherformat ist XHTML-basiert, der HTML-Export eines Space behält Überschriften, Listen, Tabellen und Links also als echtes Markup, das ein Konverter lesen kann — Word- und PDF-Exporte desselben Inhalts stauchen das in Formatierung, die sich schlechter zurückgewinnen lässt. Der Space-Export braucht Space-Admin-Rechte und exportiert nur, was Ihr eigenes Konto ohnehin schon sehen kann, es sei denn, ein Site-Admin führt ihn aus — dann wird alles exportiert, unabhängig von der Sichtbarkeit (geprüft auf support.atlassian.com, 14. September 2026). Was auch herauskommt, konvertieren Sie es mit [einer HTML-zu-Markdown-Konvertierung](/html-to-markdown) statt mit einem Skript, das Tags mit regulären Ausdrücken entfernt — Confluences HTML steckt voller `mso`-artiger Attribute und Makro-Wrapper-`div`s, die ein naiver Stripper als sichtbaren Ballast zurücklässt. Für einen ganzen Space, zusammengeführt in ein einziges lesbares Dokument, nimmt [TransformPipes Confluence-→-Markdown-Konvertierung](/confluence-to-markdown) das HTML-Export-Zip direkt entgegen und erzeugt ein Dokument mit Inhaltsverzeichnis, ganz ohne Verzeichnisdurchlauf.

Was keiner der folgenden Wege zurückgewinnt: Ein Makro, das eine lebende Abfrage ausführte — ein Jira-Vorgangs-Makro, eine eingebundene Seite — kommt als das zurück, was es zufällig am Exporttag zeigte, nicht als Abfrage. Seitenkommentare schaffen es nie in einen HTML- oder PDF-Export. Und seiteninterne Anker ändern sich, denn Confluence erzeugt Überschriften-IDs, die den Seitentitel enthalten, ein Link gegen das alte ID-Format hört also auf aufzulösen, sobald ein anderer Renderer IDs auf seine eigene Art schreibt.

## Warum es keinen nativen Markdown-Export gibt

Der Inhalt einer Confluence-Seite liegt in dem, was Atlassian Speicherformat nennt: technisch XML statt striktem XHTML, mit Confluences eigenen Elementen in einem `ac:`-Namensraum und Ressourcenverweisen — Anhängen, Seitenlinks — in einem `ri:`-Namensraum. Ein Makro ist ein `ac:structured-macro` mit einem Namensattribut; ein Bild ist ein `ac:image`, das ein `ri:attachment` umschließt; ein Link auf eine andere Seite ist ein `ac:link`, das ein `ri:page` umschließt. Nichts davon hat ein Markdown-Äquivalent, denn Markdown kennt das Konzept eines Makros überhaupt nicht — ein Makro ist ein benanntes, parametrisiertes Stück Verhalten, und Markdowns gesamter Funktionsumfang ist statische Textformatierung.

Confluences Export-Menü bietet also stattdessen Darstellungen des Speicherformats an: Word, PDF, HTML, XML und CSV für einen Space. Jede davon ist, wie das Speicherformat aussieht, einmal dargestellt, in welcher Genauigkeit auch immer dieses Exportformat erlaubt, und Markdown erreichen Sie, indem Sie eine dieser Darstellungen ein zweites Mal konvertieren.

## Kurzvergleich: die Exportformate, und was jedes davon übersteht

| Export | Umfang | Nötige Berechtigung | Was herauskommt | Lohnt sich die Konvertierung nach Markdown? |
| --- | --- | --- | --- | --- |
| Export to Word | Eine Seite | Jeder mit Seitenzugriff | Eine `.docx`, die viele andere Editoren unvollkommen darstellen | Nur über eine Word-zu-Markdown-Konvertierung; Struktur übersteht, vorgetäuschte Überschriften nicht |
| Export to PDF | Eine Seite | Jeder mit Seitenzugriff | Eine dargestellte, statische Seite; Kommentare nie enthalten | Nein — einer dargestellten Seite bleibt keine Struktur mehr zu entnehmen |
| Space-Export, HTML | Ganzer Space | Space-Admin | Zip aus dargestellten HTML-Dateien, eine pro Seite, plus Anhänge | Ja — das ist der Weg |
| Space-Export, XML | Ganzer Space | Space-Admin | Confluences eigenes Speicherformat-XML, zum Re-Import in Confluence | Nicht direkt — es ist für Confluence gebaut, nicht für einen Konverter |
| Space-Export, CSV | Ganzer Space | Space-Admin | Inhalt als CSV-Zeilen, Anhänge und Kommentare standardmäßig dabei | Nein — flacht Struktur ab, die eine Markdown-Konvertierung braucht |
| Eine Marketplace-App | Seite, Baum oder Space, je nach App | Was die App verlangt | Markdown direkt, in der eigenen Form der App | Manchmal — die aktuelle Liste prüfen; mehrere kostenlose Optionen existieren |

Jede Angabe zu Umfang und Berechtigung in dieser Tabelle stammt aus Atlassians eigener Dokumentation: HTML, XML und CSV existieren nur als Space-Level-Exporte und brauchen Space-Admin-Rechte, und „nur Inhalt, der für Sie sichtbar ist, wird exportiert“ gilt für den eigenen Export eines Space-Admins — ein Site-Admin, der denselben CSV- oder XML-Export ausführt, bekommt alles, Sichtbarkeitsbeschränkungen eingeschlossen (geprüft auf support.atlassian.com, 14. September 2026). Blogbeiträge werden aus dem PDF- und HTML-Export eines Space ausgelassen, und Kommentare sind in einem PDF-Export nie enthalten, beides laut derselben Seite.

## Space-Export nach HTML — der Weg, der die Struktur behält

Von der Space-Seitenleiste aus: More actions, Space settings, General, Export space, dann HTML wählen. Was zurückkommt, ist ein Zip: eine HTML-Datei pro Seite, ein Anhangsordner und eine Indexdatei, die die Seiten auflistet.

| Vorteile | Nachteile |
| --- | --- |
| Echtes Markup — Überschriften, Listen, Tabellen und Links überleben als Elemente, nicht als dargestellte Pixel | Braucht Space-Admin-Rechte; ein Seitenautor ohne diese kann diesen Export nicht selbst ausführen |
| Anhänge sind zusammen mit den Seiten verpackt, die sie verwenden | Die Seitenhierarchie lebt nur in der Indexdatei — Dateinamen sind flach, Ordner müssen also aus ihr rekonstruiert werden, wenn Sie welche wollen |
| Funktioniert offline, sobald heruntergeladen — keine fortlaufende Abhängigkeit davon, dass Confluence erreichbar ist | Makros stellen sich als das HTML dar, das sie am Exporttag erzeugten, nicht als etwas, das Markdown versteht |

**Preis:** kostenlos — der Export ist Teil von Confluence selbst, und jeder Konverter, der auf der anderen Seite etwas taugt, ist ebenfalls kostenlos.

**Technische Details.** Die exportierten Dateinamen sind maschinell erzeugt und nicht für Menschen lesbar, herauszufinden, welche Datei welche Seite ist, heißt also, den Index zu lesen statt die Verzeichnisliste. Überschriftenanker sind Confluences eigene erzeugte IDs, die den Seitentitel als Teil der ID-Zeichenkette enthalten — ein Link, geschrieben gegen `#PageTitle-Heading`, bricht in dem Moment, in dem ein anderer HTML-zu-Markdown-Konverter stattdessen einen einfachen `#heading`-Slug erzeugt, denn die beiden ID-Schemata passen nicht zusammen.

**Für wen ist das?** Für jeden, der mehr als ein paar Seiten konvertiert, und besonders für jeden, der mehr als eine Momentaufnahme braucht — HTML ist das einzige Exportformat, das dicht genug ist, dass eine echte Konvertierung Tabellen, Links und Listen zurückgewinnen kann, statt eines Absatzes aus zusammengelaufenem Text.

## Das HTML konvertieren: ein echter Parser, kein Regex

Sobald das HTML draußen ist, ist der zweite Schritt eine gewöhnliche HTML-zu-Markdown-Konvertierung — [dieselbe Arbeit](/html-to-markdown) wie bei jeder gespeicherten Webseite —, mit einer Confluence-spezifischen Eigenheit: Das Markup steckt voller `mso-`-präfigierter Inline-Stile und Makro-Wrapper-`div`s, die ein naives Tag-Entfernungsskript als sichtbaren Müll in der Ausgabe zurücklässt. Ein echter HTML-Parser, der einen Baum aufbaut und ihn durchläuft, statt einer Folge von Zeichenkettenersetzungen, ist der Unterschied zwischen sauberem Markdown und einem Absatz voller verirrter Klassennamen.

| Wozu das Makro dargestellt wurde | Was ein Konverter sieht | Nach der Konvertierung |
| --- | --- | --- |
| Info-, Hinweis-, Warn-, Tipp-Panel | Ein `div` mit einem Klassennamen und einem Symbolbild | Ein einfacher Absatz — geben Sie ihm von Hand eine Blockquote-Konvention |
| Codeblock-Makro | Ein `pre`-Element, oft mit Spans für Syntaxhervorhebung | Ein eingezäunter Codeblock, meist ohne das Sprachattribut |
| Inhaltsverzeichnis-Makro | Eine dargestellte Liste von Ankerlinks | Eine Liste von Links auf Anker, die nach der Konvertierung womöglich nicht mehr auflösen |
| Seitenbaum- oder Unterseiten-Anzeige-Makro | Eine dargestellte Liste von Links zurück auf die lebende Confluence-Site | Links, die auf Confluence zeigen, nicht auf die konvertierten Dateien |
| Excerpt- oder Include-Makro | Der eingebundene Text, schon zum Exportzeitpunkt eingefügt | Duplizierter Text, einmal pro Seite, die ihn einband — nicht vom Original zu unterscheiden |
| Jira-Vorgang- oder -Filter-Makro | Eine Momentaufnahme-Tabelle, oder ein einfacher Link, je nach eigener Darstellung des Makros | Eine Tabelle, eingefroren auf den Exporttag, oder ein toter Link, falls es als Referenz dargestellt wurde |
| Expand-Makro | Der Inhalt, im statischen Export schon ausgeklappt | Einfacher Inhalt — das Ein-/Ausklappverhalten existiert in Markdown nicht |
| Attachments-Makro | Eine Liste von Links auf `/download/attachments/...` | Links, die eine aktive Confluence-Sitzung zum Auflösen brauchen |

Die Anhänge-Zeile ist die, die es sich zu prüfen lohnt, bevor Sie etwas veröffentlichen. Diese Links zeigen auf Confluences eigenen Download-Endpunkt, der erwartet, dass Sie angemeldet sind — eine Seite, die vollständig aussieht, während Sie in Confluence eingeloggt sind, hat für jeden, der es nicht ist, kaputte Bildkästen, und ein Space-Export packt die eigentlichen Dateien genau deshalb ins Zip, damit der Konverter diese Links auf die lokalen Kopien umschreiben kann, statt sie auf eine sitzungsgebundene URL zeigen zu lassen.

**Wie das rohe HTML tatsächlich aussieht.** Ein Hinweis-Panel ist kein `<blockquote>` — es ist eher so etwas, von den Attributen befreit, die ein naiver Stripper zurücklässt:

```html
<div class="confluence-information-macro confluence-information-macro-note">
  <span class="aui-icon aui-icon-small aui-iconfont-warning"></span>
  <div class="confluence-information-macro-body">
    <p>Deploys are frozen after Thursday.</p>
  </div>
</div>
```

Eine Tag-Entfernungs-Regex über diesem Code erzeugt einen Absatz plus eine verirrte Leerzeile dort, wo der Symbol-`span` stand. Ein echter Parser erkennt die Klasse des umschließenden `div`, verwirft das Symbolelement vollständig und behält nur den Text — das ist das ganze Argument für einen Konverter, der einen Baum aufbaut, statt einen, der spitze Klammern löscht.

### Überschriftenanker: warum ein seiteninterner Link bricht, auch wenn die Seite es nicht tut

Confluence erzeugt die ID einer Überschrift aus Seitentitel und Überschriftentext zusammen, damit zwei Seiten mit einer wortgleichen Überschrift nicht kollidieren, und ein seiteninterner Link ist gegen genau diese vollständige ID geschrieben. Ein Konverter, der IDs auf die gewöhnliche Art erzeugt — Überschriftentext klein geschrieben, Leerzeichen zu Bindestrichen, sonst nichts —, erzeugt für dieselbe Überschrift eine andere ID, jeder Link, geschrieben als `#PageTitle-SectionName`, hört also auf aufzulösen, obwohl der Abschnitt selbst einwandfrei konvertiert wurde. Die Abhilfe ist mechanisch, sobald man weiß, wonach man sucht: Nach der Konvertierung die seiteninternen Links gegen die neu erzeugte ID der Überschrift umschreiben, statt anzunehmen, die alte hätte überlebt.

## Das Export-Zip direkt hochladen, zusammengeführt in ein Dokument

Für einen Space, bei dem das Ziel immer ein einziges lesbares Dokument war statt eines Verzeichnisses aus Dateien mit einer funktionierenden Seitenbaumstruktur, nimmt [TransformPipes Confluence-→-Markdown-Konvertierung](/confluence-to-markdown) das HTML-Export-Zip des Space entgegen, so wie es aus Confluence herauskommt, konvertiert das HTML jeder Seite mit demselben Konverter, der hinter der HTML-zu-Markdown-Seite steckt, und führt jede Seite der Reihe nach zu einem Dokument mit erzeugtem Inhaltsverzeichnis zusammen.

| Vorteile | Nachteile |
| --- | --- |
| Kein Verzeichnisdurchlauf, keine Indexdatei, die von Hand zu lesen ist | Erzeugt ein Dokument — nicht die richtige Form, wenn jede Seite ihre eigene Datei mit eigener URL bleiben muss |
| Jede Seite in Reihenfolge, mit einem für Sie erzeugten Inhaltsverzeichnis, und ein Anhang, der ein Bild ist, wird ins Dokument übernommen, statt auf `/download/attachments/` zu zeigen | Rekonstruiert den Seitenbaum nicht — nichts tut das, ohne zu entscheiden, wo die Dateien landen sollen — und ein Anhang, der kein Bild ist, behält den Link, den er hatte |
| Läuft im Browser; das Zip wird nicht hochgeladen, wenn Sie abgemeldet sind | Makro-Verluste sind identisch mit jedem anderen HTML-zu-Markdown-Weg, denn das Quell-HTML ist so oder so dasselbe |

**Preis:** kostenlos, läuft lokal.

**Für wen ist das?** Für einen Space, der archiviert wird, ein Wiki, das als einzelnes Dokument übergeben wird, oder jeden Fall, in dem einer Person, die das Ergebnis liest, der Inhalt in Reihenfolge wichtiger ist als eine eigene URL je Seite.

## Eine Marketplace-App, wenn ein Markdown-Export besser zu Ihrem Ablauf passt

Mehrere Apps im Atlassian Marketplace exportieren eine Seite, einen Seitenbaum oder einen ganzen Space direkt nach Markdown, mit kostenlosen Optionen neben kostenpflichtigen (geprüft auf marketplace.atlassian.com, 14. September 2026) — die Kategorie existiert und ändert sich oft genug, dass es hier veraltet wäre, eine bestimmte App zu nennen, was genau der Grund ist, warum der Weg „exportieren, dann konvertieren“ oben trotzdem einen Blick wert bleibt: Er hängt von nichts ab außer Confluences eigenem eingebautem Export und einem Konverter, von denen keiner ein Abonnement ist, das seine Preise ändern oder aus einer Marketplace-Liste verschwinden kann.

| Vorteile | Nachteile |
| --- | --- |
| Direktes Markdown, kein separater HTML-Konvertierungsschritt | Fügt der Site eine Marketplace-App hinzu, die jemand genehmigen und pflegen muss |
| Manche erhalten die Ordnerhierarchie automatisch in der Ausgabe | Kostenlose Stufen und Funktionsumfänge ändern sich; die aktuelle Liste prüfen statt einer alten Bewertung zu vertrauen |
| Kann für einen einmaligen Export einer einzelnen Seite schneller sein | Für einen ganzen Space statt einer einzelnen Seite ist oft eine kostenpflichtige Stufe nötig |

**Für wen ist das?** Für ein Team, das ohnehin bereitwillig Marketplace-Apps installiert und Markdown in einem Schritt will, statt eine Export-und-Konvertier-Pipeline selbst zu pflegen.

## Der Unterschied zwischen Confluence Server und Data Center

Alles zum Export-Dialog oben beschreibt Confluence Cloud. Server- und Data-Center-Instanzen haben dasselbe zugrunde liegende Speicherformat und dieselbe Art HTML-Space-Export, aber der genaue Menüpfad und das genaue Berechtigungsmodell unterscheiden sich je nach Version — und da es auf diesen Instanzen standardmäßig kein skriptgesteuertes API-Push-Äquivalent zu Jiras Automation gibt, ist der Griff zu einer Marketplace-App (ScriptRunner ist eine verbreitete Wahl speziell auf Server/Data Center) häufiger der praktische Weg zu allem jenseits des eingebauten Export-Dialogs. Ist Ihre Instanz Server oder Data Center, prüfen Sie die Exportoptionen in Ihrer eigenen Admin-Konsole, statt anzunehmen, der Cloud-Menüpfad gelte unverändert.

## Wie Sie wählen

1. **Bestätigen Sie, dass Ihnen der HTML-Export überhaupt zur Verfügung steht, bevor Sie darauf planen.** Er braucht Space-Admin-Rechte; haben Sie diese nicht, ist der praktische erste Schritt, jemanden zu fragen, der sie hat, nicht nach einem Workaround zu suchen.
2. **Entscheiden Sie, ob das Ziel getrennte Dateien oder ein Dokument ist.** Getrennte Dateien mit eigenen URLs wollen die Export-dann-Konvertier-Pipeline, eine Datei pro Seite behalten. Ein Dokument will den Zusammenführungsweg.
3. **Prüfen Sie vor dem Konvertieren, welche Makros lebende Abfragen waren.** Ein Jira-Vorgangs-Makro oder ein Seitenbaum-Makro stellt sich als Momentaufnahme dar; ist die lebende Version wichtig, notieren Sie sie separat, bevor der Export eine eingefrorene Kopie festhält.
4. **Lesen Sie eine konvertierte Seite vollständig, bevor Sie dem Rest vertrauen.** Anhangslinks, Überschriftenanker und makrodargestellte `div`s sind die drei Dinge, die in einem Diff gut aussehen und beim tatsächlichen Lesen falsch sind.

## Fazit

Confluence nach Markdown ist eine Konvertierung in zwei Schritten, die den Namen eines einstufigen Exports trägt: Wählen Sie die HTML-Ausgabe, denn sie ist die einzige, die dicht genug ist, um sich gut konvertieren zu lassen, und lassen Sie dann einen echten HTML-zu-Markdown-Durchgang darüber laufen statt eines Skripts aus Zeichenkettenersetzungen. Was überlebt, ist alles, was das Speicherformat als statische Struktur ausdrückte — Überschriften, Listen, Tabellen, Links; was nicht überlebt, ist alles, was das lebende Verhalten eines Makros war statt seiner dargestellten Ausgabe am Tag des Exports. Für einen ganzen Space, der ein Dokument werden soll, überspringen Sie den Verzeichnisdurchlauf und geben Sie das Export-Zip einem Konverter, der es direkt zusammenführt. [Wie Notion und Obsidian im Vergleich abschneiden](/blog/markdown-from-notion-obsidian-and-confluence) beim selben Export-dann-Reparatur-Problem lohnt sich zu lesen, wenn Confluence nicht die einzige Quelle im Spiel ist.

## FAQ

### Kann ich eine Confluence-Seite direkt nach Markdown exportieren?

Nicht mit etwas, das in Confluence eingebaut ist. Jeder native Export — Word, PDF, HTML, XML, CSV — ist eine andere Darstellung des eigenen Speicherformats der Seite, und keiner davon ist Markdown; dorthin zu kommen heißt, einen dieser Exporte ein zweites Mal zu konvertieren, oder eine Marketplace-App zu installieren, die beide Schritte für Sie erledigt.

### Welches Confluence-Exportformat sollte ich konvertieren?

HTML. Es ist der einzige Export, der dicht genug ist, um Überschriften, Listen, Tabellen und Links als echtes Markup zu behalten statt als abgeflachten Text oder dargestellte Pixel, und genau das braucht ein HTML-zu-Markdown-Konverter, um gute Arbeit zu leisten.

### Muss ich Space-Admin sein, um einen Confluence-Space zu exportieren?

Ja, speziell für HTML-, XML- und CSV-Exporte auf Space-Ebene — der Word- oder PDF-Export einer einzelnen Seite braucht nur den Zugriff, den Sie schon haben, um diese Seite zu lesen. Sind Sie kein Space-Admin, heißt einen ganzen Space zu exportieren, jemanden zu fragen, der es ist.

### Was passiert mit Jira-Vorgangs-Makros und anderem lebendem Inhalt beim Export?

Sie frieren ein. Ein Jira-Vorgangs-Makro, eine Seitenbaum-Anzeige, ein eingebundenes Excerpt — jedes davon exportiert als das, was es zufällig am Exporttag darstellte, eine Momentaufnahme statt einer Abfrage, und nichts am Exportformat hält es lebendig.

### Warum zeigen meine konvertierten Bilder als kaputte Links?

Weil Confluences interne Anhangslinks auf `/download/attachments/...`-URLs zeigen, die eine aktive, angemeldete Sitzung erwarten. Ein Space-Export packt genau deshalb die eigentlichen Anhangsdateien in sein Zip — die Abhilfe ist, die Links auf diese lokalen Dateien umzuschreiben, nicht auf die ursprünglichen Confluence-URLs.

### Kann ich eine Confluence-Seite konvertieren, ohne sie irgendwohin hochzuladen?

Ja, wenn der Konverter in Ihrem Browser läuft statt die Datei an einen Server zu schicken — es lohnt sich, das für alles zu bestätigen, was Ihre Maschine nicht verlassen sollte, indem Sie während der Konvertierung das Netzwerk-Panel im Blick behalten.

### Warum brechen seiteninterne Links, wenn ich eine Confluence-Seite konvertiere?

Weil Confluence Überschriften-IDs aus Seitentitel und Überschriftentext zusammen erzeugt, und ein Standard-HTML-zu-Markdown-Konverter eine einfachere ID allein aus dem Überschriftentext erzeugt. Der Abschnitt selbst wurde korrekt konvertiert — nur die ID hat sich geändert —, die Abhilfe ist also, den Link gegen die neue ID umzuschreiben, nicht den Inhalt erneut zu konvertieren.

### Ist Confluence Server oder Data Center hierbei anders als Cloud?

Das Speicherformat und der HTML-Export folgen auf beiden derselben Idee, aber der genaue Menüpfad, das Berechtigungsmodell und die verfügbaren Marketplace-Apps unterscheiden sich je nach Version und Edition. Server und Data Center stützen sich für alles jenseits des eingebauten Export-Dialogs häufiger auf eine Marketplace-App wie ScriptRunner, da es keine Cloud-artige Automation-Regel gibt, auf die man zurückgreifen könnte.
