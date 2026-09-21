---
title: "Notion-Export nach Markdown konvertieren: jeder Weg, IDs inklusive"
description: "Ein Notion-Export-Zip in sauberes Markdown verwandeln: das ID-Suffix an jedem Dateinamen, was ein Skript repariert und was nur Zusammenführen löst"
date: 2026-09-14
tag: Konvertieren
keywords: notion export nach markdown, notion zu markdown konvertieren, notion markdown exportieren, notion api markdown, notion seite als markdown, notion zip nach markdown, notion export ids entfernen
---

Notions Export-Knopf sagt „Markdown & CSV“ und gibt Ihnen ein Zip, das, technisch gesehen, die Wahrheit sagt. Öffnen Sie es, und jede Datei ist echtes Markdown: Überschriften, Listen, Links, alles in jedem Editor lesbar. Was er Ihnen nicht sagt: Jeder Dateiname und jeder Link zwischen Seiten trägt jetzt eine 32-stellige hexadezimale ID, eine Datenbank kam als separate CSV heraus, auf die Ihre Markdown-Dateien nicht verweisen, und der Export ist eine Momentaufnahme eines Augenblicks, keine lebende Kopie von irgendetwas.

Nichts davon ist ein Fehler. Notion identifiziert eine Seite über ihre ID und behandelt den Titel als Etikett, das sich ändern kann, der Export muss die ID also irgendwo dauerhaft unterbringen — der Dateiname ist die Stelle, an der sie landet. Das Problem liegt vollständig weiter unten in der Kette: Ein Ordner voller Dateien, die alle per ID aufeinander zeigen, ist für Notion in Ordnung und als Migrationsziel unlesbar, bis etwas diese Zeiger umschreibt.

### Kurzfassung

Drei Wege funktionieren tatsächlich. **Als Markdown & CSV exportieren und dann die IDs umschreiben** ist der allgemeine Weg: entpacken, eine Abbildung vom ID-Suffix jeder Datei auf den Namen bauen, den Sie eigentlich wollen, jeden Link und jeden Dateinamen aus genau dieser einen Abbildung umschreiben. Bei zehn Seiten ist das Handarbeit, bei tausend ein Skript. **`notion-to-md`**, ein Open-Source-Node-Paket (ISC-Lizenz), das Seiten über Notions eigene API liest, passt besser zu einer skriptgesteuerten Pipeline oder einem Static-Site-Build, weil es die ID-behafteten Dateinamen von vornherein nie erzeugt — Sie benennen die Ausgabe selbst. **Das Export-Zip direkt bei einem Konverter hochladen, der es zusammenführt** — [TransformPipes Notion-→-Markdown-Konvertierung](/notion-to-markdown) ist eine davon — umgeht das ID-Problem auf eine dritte Art: Jede Seite wird zu einem Abschnitt eines einzigen Dokuments, in Reihenfolge, mit einem Inhaltsverzeichnis, und ein seitenübergreifender Link behält seinen Text, statt auf eine Datei zu zeigen, die es nicht geben wird. Wählen Sie den ersten für einen Ordner separater Dateien, den Sie pflegen werden, den zweiten für Automatisierung, den dritten für ein Dokument zum Lesen oder Teilen.

Bei welchem Weg auch immer: Drei Dinge überleben keinen davon: Kommentare, weil sie eine an eine Seite angehängte Diskussion sind und kein Seiteninhalt; die Nicht-Standardansichten einer Datenbank, weil Notion nur die Ansicht exportiert, die Sie gerade offen haben; und Synced Blocks, die als ihr Inhalt an jeder Stelle erscheinen, an der sie gezeigt wurden, dupliziert, ohne jede Markierung, dass sie je derselbe Block waren.

## Warum die ID da ist, und warum sie nicht von selbst verschwindet

Eine Seite in Notion wird in dem Moment, in dem sie erstellt wird, durch eine UUID identifiziert. Der Titel ist ein Metadatum, das an diese ID angehängt ist, jederzeit editierbar, und erscheint nirgends dort, wo der Export eine Seite darüber nachschlagen müsste. Wenn der Export also `Meeting notes.md` schreibt, hat er keine Garantie, dass dieser Name eindeutig ist — zwei Seiten namens „Meeting notes“ existieren in den meisten Workspaces, die älter als ein Jahr sind —, und er löst das, indem er die ID in jeden Dateinamen schreibt, den er erzeugt.

```text
Meeting notes 21f4c8a1b2c34d5e8f90123456789abc.md    the file on disk
Meeting%20notes%2021f4c8a1b2c34d5e8f90123456789abc.md    the link another page uses to reach it
meeting-notes.md    what you actually want to keep
```

Ein Link von einer Seite zu einer anderen ist gegen den exakten Dateinamen geschrieben, prozentkodiert für das Leerzeichen. Benennen Sie die Datei um, um die ID loszuwerden, und jeder Link, der auf den alten Namen zeigte, bricht — lautlos, denn ein toter relativer Link in einem Ordner voller Markdown-Dateien erzeugt keinen Fehler, bis jemand darauf klickt. Das ist das gesamte Migrationsproblem: Die Umbenennung und das Umschreiben der Links müssen zusammen passieren, aus einer Abbildung, in einem Durchgang.

## Der Export-Dialog, und die Grenzen, die er nicht ankündigt

Notions Export liegt unter dem Seiten- oder Workspace-Menü als „Export“, mit einer Formatwahl zwischen PDF, HTML oder Markdown & CSV, einem Dropdown „Include content“, das Dateien und Bilder ausschließen kann, einem Schalter „Include subpages“ und einem Schalter „Create folders for subpages“ (geprüft auf notion.com, 9. September 2026). Drei Grenzen von derselben Oberfläche zählen, bevor eine Migration darauf aufgebaut wird:

- Exportiert wird nur die aktuelle oder die Standardansicht einer Datenbank. Alle Ansichten auf einmal wird nicht unterstützt, und eine Formularansicht lässt sich überhaupt nicht exportieren — stattdessen geht die Tabellenansicht raus.
- Ein großer Export wird als Download-Link per E-Mail verschickt statt sofort gestartet, der Link verfällt nach sieben Tagen, und die Verarbeitung kann bis zu dreißig Stunden dauern.
- Unterseiten werden bei eingeschaltetem Schalter als verschachtelte Ordner exportiert, weshalb es sich lohnt, die Verzeichnisstruktur des Zips zu behalten, statt sie abzuflachen.

Diese Verarbeitungszeit ist eine Planungstatsache, keine Fußnote. „Den Workspace Freitagnachmittag exportieren, Freitagabend konvertieren“ setzt einen Export voraus, der in Minuten fertig ist; bei einem großen Workspace ist das womöglich nicht der Fall.

## Kurzvergleich: drei Wege und was jeder kostet

| Weg | Am besten für | Behält | Verliert | Installation |
| --- | --- | --- | --- | --- |
| Als Markdown & CSV exportieren, IDs von Hand oder per Skript umschreiben | Einen Ordner separater Dateien, den Sie weiter bearbeiten werden | Jede Seite, exakte Struktur, Datenbankzeilen als CSV | Kommentare, Nicht-Standardansichten, Synced-Block-Identität | Keine, oder ein kurzes Skript |
| `notion-to-md` über die Notion-API | Einen Build-Schritt, eine statische Website, geplante Synchronisierung | Was auch immer Sie in Ihren eigenen Renderer schreiben | Dasselbe wie oben, plus alles, was Ihr Renderer nicht umsetzt | Node, ein Integrationstoken |
| Das Export-Zip direkt hochladen (TransformPipe) | Ein Dokument zum Lesen oder Teilen | Jede Seite in Reihenfolge, ein Inhaltsverzeichnis, Datenbankzeilen als Tabelle | Seitenübergreifende Linkadressen, Kommentare, Nicht-Standardansichten | Keine |
| Eine Seite kopieren, in einen Editor einfügen | Eine Handvoll Seiten, einmalig | Formatierung, die das Einfügeziel versteht | Alles, was Skalierung angeht — das geht über ein paar Seiten nicht hinaus | Keine |

## Als Markdown & CSV exportieren, dann die IDs reparieren

Das ist der oben beschriebene Export, und der ehrliche Weg, ihn zu nutzen, ist, die ID als Daten zu behandeln statt als Rauschen: Sie ist das eine Ding im Zip, das eine Seite eindeutig und dauerhaft identifiziert, und damit der Verknüpfungsschlüssel für die Umbenennung.

```text
1. Unzip the export.
2. Walk every .md and .csv filename, split off the trailing id, build id -> new-name.
3. Rewrite every filename using the map.
4. Walk every file's content, find links matching the export's own href pattern,
   look up the id in the same map, rewrite the href to the new name.
5. Flatten or keep the folder structure, depending on where the files are going.
```

| Vorteile | Nachteile |
| --- | --- |
| Keine neue Abhängigkeit, kein Konto, kein API-Token | Die Umbenennung und das Umschreiben der Links müssen ein Durchgang über eine Abbildung sein, sonst bricht die Hälfte der Links |
| Funktioniert offline, mit Dateien, die Sie schon haben | Die `.csv` einer Datenbank wird nicht automatisch wieder mit der Seite verknüpft, zu der sie gehörte |
| Der sicherste Weg, wenn das Ziel ein Ordner von Dateien ist, die ihre eigenen Dateinamen behalten müssen | Zehn Seiten von Hand kosten einen Abend; tausend Seiten von Hand sind nicht realistisch |

**Technische Details.** Die ID besteht aus 32 hexadezimalen Kleinbuchstaben, vom Titel durch ein Leerzeichen getrennt (manchmal einen Unterstrich, je nach Client-Version, die den Export erzeugt hat). Ein am Dateinamensende verankerter regulärer Ausdruck — zuerst die Endung entfernen, dann die abschließende ID abgleichen — trennt die beiden zuverlässig. Links innerhalb des Markdown sind relativ und genauso prozentkodiert wie der Dateiname, derselbe reguläre Ausdruck findet also, nach dem URL-Dekodieren angewendet, die ID auch innerhalb eines Links. Die `.csv` einer Datenbank liegt neben dem Ordner für die Seite, die sie enthielt, genauso benannt mit ihrem eigenen ID-Suffix; sie mit der Seite zu verknüpfen, zu der sie gehört, ist ein Dateinamensabgleich, etwas, das der Export sonst nirgends festhält.

**Für wen ist das?** Für jeden, dessen Ziel ein Ordner mit Markdown-Dateien ist, die als separate Dateien weiter funktionieren müssen — eine Doku-Website mit einer Seite pro URL, ein Wiki-Import, bei dem jede Seite ein eigener Eintrag wird. Die Ausgabe sind echte Dateien mit echten Namen; was es kostet, ist, die Umschreibung einmal korrekt zu machen.

**Eine minimale Version des Skripts**, als Skizze statt als vollständiges Programm, denn die Form zählt mehr als die Sprache:

```text
map = {}
for file in list(export_folder, recursive=true):
    id = extract_trailing_hex(file.name_without_extension)
    map[id] = slugify(file.name_without_extension_or_id)

for file in list(export_folder, recursive=true):
    text = read(file)
    text = replace_all(text, LINK_PATTERN, (id) => map[id] ?? id)
    write(new_path_for(file, map), text)
```

`LINK_PATTERN` ist ein regulärer Ausdruck über die eigene Link-Form des Exports — ein relativer href, der auf `.md` oder `.csv` endet, prozentkodiert, mit derselben abschließenden hexadezimalen ID wie der Dateiname. Das eine Detail, das Leuten zum Verhängnis wird: Die ID-Extraktion über den *dekodierten* href laufen lassen, nicht über den rohen prozentkodierten, denn `%20` wird nicht zu einem Muster passen, das für ein wörtliches Leerzeichen geschrieben wurde.

**Datenbanken verdienen einen eigenen Durchgang.** Eine Vollseiten-Datenbank exportiert als `.csv` neben einem Ordner mit je einer `.md` pro Zeile, die einen Seitenkörper hatte, jede Zeilendatei trägt ihr eigenes ID-Suffix genau wie eine Seite. „Die Tabelle wiederherzustellen, mit einem Link zur ausführlicheren Seite für jede Zeile, die eine hatte“ ist eine Verknüpfung zwischen den Zeilen der CSV und den Dateinamen des Ordners, abgeglichen über welche Spalte auch immer Notion als Seitentitel benutzt hat — etwas, das weder die CSV noch die Zeilendateien irgendwo explizit als Beziehung festhalten.

## `notion-to-md`: das ID-Problem umgehen, indem man sie nie schreibt

Notion veröffentlicht außerdem eine offizielle API, und Seiten darüber statt über den Export-Knopf zu lesen umgeht das Dateinamensproblem vollständig — nichts an der API zwingt eine ID in einen Namen, denn Sie sind es, der am Ende `writeFileSync` aufruft. [`notion-to-md`](https://github.com/souvikinator/notion-to-md) ist das gebräuchliche Open-Source-Paket dafür: Node, ISC-Lizenz, liest den Blockbaum einer Seite über die API und konvertiert ihn nach Markdown, MDX oder eine Handvoll anderer Ziele. Sie wählen den Ausgabedateinamen selbst, es gibt also hinterher nichts umzuschreiben.

| Vorteile | Nachteile |
| --- | --- |
| Nie ein ID-Suffix in der Ausgabe — Sie benennen jede Datei selbst | Braucht ein Integrationstoken und API-Zugriff, ein Einrichtungsschritt, den der Export-Knopf nicht verlangt |
| Passt natürlich in ein Build-Skript oder eine geplante Synchronisierung | Jeweils eine Seite über ID oder Datenbank-Query; einen ganzen Workspace zu durchlaufen ist Ihre eigene Rekursion, die Sie schreiben müssen |
| Läuft in CI ohne Browser oder manuellen Export-Klick | Rendert Blöcke, die Sie für alles jenseits der gängigen Menge selbst abbilden müssen — eine Datenbankansicht, ein Synced Block — dieselben Verluste wie beim Export |

**Preis:** kostenlos, Open Source, ISC-Lizenz.

**Technische Details:** Das Paket fragt die Kinder einer Seite als Blöcke von der Notion-API ab und konvertiert den Blockbaum nach Markdown, mit Hooks für Blocktypen, die es nicht standardmäßig abdeckt. Es braucht eine Integration, die in Notions eigenen Einstellungen angelegt und für die gelesenen Seiten oder Datenbanken freigegeben wird — ein Berechtigungsschritt, kein Codeschritt, und die eine Stelle, an der dieser Weg langsamer startet als ein Klick auf Export.

Die API selbst ist auf durchschnittlich drei Anfragen pro Sekunde pro Integration begrenzt, dazu kommt noch eine für den ganzen Workspace gemeinsam geltende Grenze (geprüft auf developers.notion.com, 14. September 2026); eine Anfrage über dem Limit bekommt einen 429 mit einem `Retry-After`-Header zurück statt der Daten, ein Skript, das mehr als ein paar Dutzend Seiten durchläuft, braucht die Warte-und-Wiederhol-Schleife also von Anfang an eingebaut, nicht erst nach dem ersten Fehlschlag nachgerüstet. Für eine einzelne Seite oder eine kleine Datenbank spielt das nie eine Rolle; für einen ganzen Workspace ist es der Unterschied zwischen einem Skript, das fertig wird, und einem, das scheinbar hängen bleibt.

**Für wen ist das?** Für eine statische Website, die ihren Inhalt bei jedem Build aus Notion zieht, einen geplanten Job, der einen Workspace in ein Git-Repository spiegelt, oder alles, wo „von Hand regelmäßig exportieren“ die falsche Form dafür ist, wie sich der Inhalt tatsächlich ändert.

## Was mit Bildern, Dateien und Anhängen passiert

Jeder Weg behandelt Medien unterschiedlich, und es lohnt sich, das zu prüfen, bevor Sie einem davon eine Seite mit mehr Bildern als Text anvertrauen.

Der Markdown-&-CSV-Export schreibt die Bilder jeder Seite in einen Ordner neben ihrer `.md`-Datei, unter generierten Namen, erreicht vom Markdown aus über relative, prozentkodierte Pfade — die nur halten, solange der Bilderordner mit der Datei reist, zu der er gehört (dieselbe Zerbrechlichkeit, die [relative Pfade immer tragen](/blog/images-and-links-that-still-work)). Verschieben Sie die `.md`-Datei allein, und jede Bildreferenz bricht ohne Warnung, denn nichts prüft, ob der Ordner mitgekommen ist.

`notion-to-md` gibt Bildblöcke als gewöhnliche Markdown-Bildsyntax zurück, die auf Notions eigene temporäre Datei-URLs zeigt, die verfallen — das Paket lädt die Datei nicht für Sie herunter, ein Skript, das diesen Weg nimmt, braucht also einen eigenen Schritt, um jede Bild-URL abzurufen, bevor sie ungültig wird, und das Markdown umzuschreiben, damit es auf eine lokale Kopie zeigt.

Ein Zusammenführen-und-Hochladen-Weg sah früher nur, was der Text im Zip sagte, und ein kaputter relativer Pfad blieb genau so kaputt. Inzwischen werden auch die Bilder aus dem Archiv gelesen und ins Dokument selbst übernommen, sodass kein Pfad mehr übrig ist, der brechen könnte: Das Bild reist im Markdown mit, im HTML-Export und in allem, was daraus geteilt wird. Die Obergrenze liegt bei zwei Megabyte Bildern je Dokument und einem je Bild — ein gespeichertes Dokument muss in vier passen — und ein Bild darüber behält den Link, den es hatte, also nicht schlechter als vorher.

## Das Export-Zip direkt hochladen, zusammengeführt zu einem Dokument

Das ID-Problem des Exports verschwindet auf eine dritte Art, wenn das Ziel nie ein Ordner separater Dateien war: [TransformPipes Notion-→-Markdown-Konvertierung](/notion-to-markdown) nimmt das „Export as Markdown & CSV“-Zip unverändert, führt jede Seite in ihrer ursprünglichen Reihenfolge zu einem Dokument zusammen, mit einem erzeugten Inhaltsverzeichnis, und macht aus einem seitenübergreifenden Link die Worte, die er zeigte, statt einen Dateinamen, der nicht mehr auflöst, sobald die Seiten Abschnitte desselben Dokuments sind. Eine Datenbank kommt als Tabelle zurück, im selben Dokument.

| Vorteile | Nachteile |
| --- | --- |
| Keine Umbenennung, keine ID-Abbildung, kein Skript | Erzeugt ein einziges Dokument — nicht die richtige Form, wenn Seiten separate Dateien mit eigenen URLs bleiben müssen |
| Jede Seite in Reihenfolge, mit einem für Sie erzeugten Inhaltsverzeichnis | Seitenübergreifende Links behalten ihren Text, nicht ihre Adresse — nach dem Zusammenführen gibt es nichts mehr, worauf sie zeigen könnten |
| Läuft im Browser; das Zip wird nirgendwohin hochgeladen, solange Sie abgemeldet sind | Nicht-Standard-Datenbankansichten und Kommentare fehlen weiterhin, denn der Export hatte sie nie |

**Preis:** kostenlos, läuft lokal im Browser.

**Für wen ist das?** Für jeden, dessen eigentliches Ziel ein einziges lesbares Dokument war — ein Wiki-Export, der zu einer einzigen Übergabedatei wird, ein Workspace, der als eine Sache archiviert wird, die man später liest — statt eines Ordners von Seiten, die jeweils ihre eigene Adresse brauchen.

## Wo alle drei Wege gleich scheitern

**Kommentare.** Ein Kommentarfaden ist an eine Seite angehängt, nicht in ihren Inhalt geschrieben, keiner der drei Wege oben sieht ihn also. Wenn eine Entscheidung nur als Antwort in einem Kommentarfaden existiert, kopieren Sie sie in den Text der Seite, bevor Sie irgendetwas exportieren — danach ist sie weg, nicht bloß unkonvertiert.

**Nicht-Standard-Datenbankansichten.** Notion exportiert die Ansicht, die Sie geöffnet haben, nicht jede Ansicht, die eine Datenbank hat. Eine Datenbank, auf drei verschiedene Arten für drei verschiedene Zielgruppen gefiltert, exportiert als eine dieser drei, und die anderen zwei sind aus dem Export überhaupt nicht wiederherstellbar — sie müssen aus den zugrunde liegenden Zeilen neu aufgebaut werden.

**Synced Blocks.** Ein Synced Block zeigt innerhalb von Notion denselben Inhalt an mehreren Stellen gleichzeitig. Der Export kennt kein Konzept von „derselbe Block, zweimal gezeigt“ — jede Stelle, an der er erschien, bekommt ihre eigene Kopie des Inhalts, das Bearbeiten der einen nach der Migration aktualisiert die andere also nicht mehr, und nichts in der Datei markiert, dass sie je verbunden waren.

## Wie Sie wählen

1. **Entscheiden Sie zuerst die Form des Ziels.** Separate Dateien mit eigenen URLs wollen den Umschreibe-Weg oder `notion-to-md`. Ein Dokument will den Zusammenführungs-Weg. Erst nach dem Konvertieren zu entscheiden bedeutet, die Arbeit noch einmal zu machen.
2. **Fragen Sie, wie oft das passiert.** Einmalig, und der manuelle Export-und-Umschreiben ist fertig, bevor eine API-Integration überhaupt genehmigt wäre. Wöchentlich oder bei jedem Deploy, und `notion-to-md` in einem Build-Schritt zahlt sich innerhalb eines Monats aus.
3. **Prüfen Sie vor dem Exportieren auf Kommentare und Nicht-Standardansichten, nicht danach.** Beide sind in der Ausgabe unsichtbar, ohne jeden Fehler, der sie meldet, die einzige zuverlässige Prüfung ist also, sich zuerst die Quelle in Notion anzusehen.
4. **Zählen Sie die Seiten.** Zehn Seiten vertragen ein manuelles ID-Umschreiben. Hundert wollen ein Skript. Tausend wollen den API-Weg, denn Export klicken und bis zu dreißig Stunden warten skaliert auch nicht.

## Fazit

Der Notion-Export ist ehrliches Markdown, das eine ID trägt, die es nicht von selbst ablegen kann. Diese ID aus einer Abbildung umzuschreiben löst es für einen Ordner von Dateien, die Dateien bleiben müssen; den Workspace über die API zu lesen und die eigene Ausgabe zu benennen löst es für alles Skriptgesteuerte; und den Export zu einem Dokument zusammenzuführen löst es auf eine dritte Art, indem die Notwendigkeit entfällt, dass die ID überhaupt zu irgendetwas auflösen muss. Was keiner der drei Wege zurückholt, ist, was der Export nie hatte — ein Kommentarfaden, eine Datenbankansicht, die Sie nicht offen hatten, oder die Identität eines Synced Blocks —, die eine Prüfung, die sich vor jedem Export lohnt, ist also zu bestätigen, dass diese für das, was Sie gleich verlieren, keine Rolle spielen. [Mehr dazu](/blog/markdown-from-notion-obsidian-and-confluence), wie Confluence und Obsidian bei demselben Problem abschneiden.

## FAQ

### Kann Notion direkt zu sauberem Markdown exportieren, ohne die ID im Dateinamen?

Nicht über den Export-Knopf — Markdown & CSV hängt immer die ID an, weil der Titel allein kein zuverlässiger Dateiname ist. Der `notion-to-md`-Weg, der Seiten über die API liest, ist die Art, an selbst gewählte Dateinamen zu kommen, denn Sie schreiben sie selbst, statt zu akzeptieren, was ein Export erzeugt.

### Warum zeigen meine exportierten Links auf Dateinamen mit langen Codes darin?

Weil Notion Seiten über IDs identifiziert, der Titel nur ein Etikett ist, und der Export die ID in den Dateinamen schreibt, um Namen eindeutig zu halten. Der Link und der Dateiname benutzen dieselbe ID, was ein Umschreiben überhaupt möglich macht: Bauen Sie eine Abbildung von ID auf Ihren bevorzugten Namen, und schreiben Sie dann beide gemeinsam um.

### Enthält der Export auch andere Datenbankansichten als die, die ich geöffnet hatte?

Nein. Nur die aktuelle oder die Standardansicht wird exportiert, und Notions eigener Export-Dialog bietet „jede Ansicht“ nicht als Option an. Eine Formularansicht lässt sich speziell überhaupt nicht exportieren — exportieren Sie stattdessen die Tabellenansicht derselben Datenbank.

### Sind Notion-Kommentare in einem Export enthalten?

Nein, in keinem der Formate, die Notion anbietet. Ein Kommentar ist als Diskussion an eine Seite angehängt, nicht als Seiteninhalt gespeichert, er erreicht also nie PDF, HTML oder Markdown & CSV. Kopieren Sie alles Entscheidungsrelevante in den Seitentext, bevor Sie exportieren.

### Was passiert mit einem Synced Block, wenn ich ihn exportiere?

Er exportiert als gewöhnlicher Inhalt an jeder Stelle, an der er gezeigt wurde, ohne jeden Hinweis, dass die Kopien je derselbe Block waren. Eine Kopie nach der Migration zu bearbeiten aktualisiert die anderen nicht, denn die Synced-Beziehung existierte nur innerhalb von Notion.

### Kann ich einen Notion-Export konvertieren, ohne meinen Workspace irgendwohin hochzuladen?

Ja, wenn der Konverter im Browser läuft statt auf einem Server — für einen Workspace mit sensiblen Inhalten lohnt es sich, das zu bestätigen, indem Sie das Netzwerk-Panel öffnen und prüfen, dass beim Konvertieren nichts das Gerät verlässt.

### Wie lange dauert ein Notion-Export?

Kleine Exporte sind sofort als direkter Download fertig. Ein großer wird statt eines sofortigen Downloads als Link per E-Mail verschickt, dieser Link verfällt nach sieben Tagen, und Notions eigene Dokumentation räumt der Verarbeitung bis zu dreißig Stunden ein — planen Sie den Export deutlich vor der Frist, die davon abhängt, nicht am selben Nachmittag.

### Gibt es ein Ratenlimit, wenn ich einen Workspace über die API lese statt ihn zu exportieren?

Ja: durchschnittlich drei Anfragen pro Sekunde pro Integration, dazu eine separate, für den ganzen Workspace gemeinsam geltende Grenze. Ein Skript, das mehr als eine Handvoll Seiten liest, sollte auf eine `429`-Antwort reagieren, indem es die im `Retry-After`-Header genannte Dauer abwartet und es erneut versucht, statt den Fehler als Fehlschlag zu behandeln.
