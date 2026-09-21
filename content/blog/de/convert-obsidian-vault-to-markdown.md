---
title: "Obsidian-Vault zu Markdown konvertieren: Wikilinks, Embeds und was bleibt"
description: "Ein Obsidian-Vault ist schon Markdown-Dateien — was die Umwandlung in Standard-Markdown wirklich behebt, von Wikilinks und Embeds bis zu Callouts und Dataview"
date: 2026-09-14
tag: Konvertieren
keywords: obsidian zu markdown, obsidian vault konvertieren, obsidian wikilinks markdown, obsidian markdown exportieren, obsidian vault export, obsidian markdown dialekt
---

Ein Obsidian-Vault ist ein Ordner mit `.md`-Dateien auf der Festplatte, was „in Markdown umwandeln“ wie einen Kategorienfehler klingen lässt — es ist schon Markdown. Der Haken steckt im Wort „schon“: Obsidian schreibt seinen eigenen Dialekt auf den CommonMark-Kern, und vier seiner eigenen Konstrukte — Wikilinks, Embeds, Blockreferenzen und Callouts — lesen sich für alles, was nicht Obsidian selbst ist, als kaputte Syntax oder einfacher Text. Es gibt nichts zu exportieren, denn es gibt keinen Export-Knopf und keine Formatumwandlung im üblichen Sinn. Es gibt ein Umschreiben, und das muss passieren, bevor der Vault Obsidian endgültig verlässt.

### Kurzfassung

Der Vault braucht keinen Exportschritt — die Dateien liegen schon auf der Platte —, aber vier von Obsidians eigenen Konventionen überstehen den Kontakt mit einem Standard-Markdown-Parser nicht: `[[Wikilinks]]`, `![[Embeds]]`, `[[Notiz#^block-id]]`-Blockreferenzen und `> [!note]`-Callouts. Ein `[[Wikilink]]` ist kein Link auf irgendetwas außerhalb von Obsidian, bis er zu einem echten relativen Pfad umgeschrieben wird; für einen Embed gibt es in Standard-Markdown überhaupt kein Transklusions-Äquivalent, er wird entweder eine eingefügte Kopie des Inhalts oder ein einfacher Link; eine Blockreferenz hat buchstäblich nichts mehr, worauf sie zeigen kann, sobald die Block-ID verschwindet; und ein Callout ist ein Blockquote mit einem Marker, den die meisten Renderer als reinen Text anzeigen. Schalten Sie „Use \[\[Wikilinks\]\]“ unter Einstellungen, Dateien und Links aus, damit neue Links ab sofort als Standard-Markdown geschrieben werden — die Einstellung gilt nur für Links, die nach der Umstellung geschrieben werden, ein etablierter Vault braucht die bestehenden also trotzdem umgeschrieben. Für einen ganzen Vault, der zu einem Dokument mit bereits aufgelösten Wikilinks wird, liest [TransformPipes Obsidian-→-Markdown-Konvertierung](/obsidian-to-markdown) einen gezippten Vault direkt und erledigt das Umschreiben im selben Durchgang.

Was das nicht behebt, weil nichts es kann: Eine Dataview-Query hat eine Tabelle nur innerhalb von Obsidian dargestellt, zur Anzeigezeit, von einem Plugin — der Query-Text konvertiert einwandfrei, in einen Codeblock, und die Tabelle, die er früher erzeugte, ist für einen Leser außerhalb von Obsidian schlicht nicht da.

## Warum ein Vault aus Markdown-Dateien trotzdem konvertiert werden muss

CommonMark und GitHub Flavored Markdown, die zwei Dialekte, die fast jedes Werkzeug außerhalb von Obsidian erwartet, kennen weder Wikilink noch Embed, weder Blockreferenz noch Callout-Block. Obsidian hat alle vier als eigene Erweiterungen über der Standardsyntax hinzugefügt, weil sie innerhalb einer persönlichen Wissensdatenbank, die bereits jede Datei darin kennt, echten Nutzen haben — ein Wikilink kann sich zu einer Notiz per Titel auflösen, ohne dass Sie einen Pfad angeben, weil Obsidian den ganzen Vault indiziert. In dem Moment, in dem eine Datei diese indizierte Umgebung verlässt — eingefügt in ein GitHub-README, geöffnet in einem reinen Texteditor, in einen statischen Seitengenerator gefüttert —, ist der Index weg, und die Abkürzungen lösen sich zu nichts mehr auf.

## Kurzvergleich: Was umgeschrieben werden muss, und was das Umschreiben übernimmt

| Obsidian-Konstrukt | Was ein Standardparser sieht | Abhilfe |
| --- | --- | --- |
| `[[Notiz]]` | Wörtlicher Text: zwei öffnende Klammern, das Wort Notiz, zwei schließende Klammern | Umschreiben zu `[Notiz](notiz.md)`, den vault-relativen Pfad auflösend |
| `[[Notiz\|Angezeigter Text]]` | Dasselbe, wörtlich | Umschreiben zu `[Angezeigter Text](notiz.md)` |
| `![[Notiz]]` (Notiz-Embed) | Wörtlicher Text | Den Inhalt der Notiz einfügen, oder ein einfacher Link — für Transklusion gibt es kein Standard-Äquivalent |
| `![[bild.png]]` (Datei-Embed) | Wörtlicher Text | Umschreiben zu `![](bild.png)`, Standard-Bildsyntax |
| `[[Notiz#Überschrift]]` | Wörtlicher Text | Umschreiben zu `notiz.md#ueberschrift`, dabei die Slug-Regel des Ziel-Renderers prüfen |
| `[[Notiz#^block-id]]` | Wörtlicher Text | Kein Ziel zum Verlinken außerhalb von Obsidian — stattdessen den zitierten Text einfügen |
| `^block-id` am Zeilenende | Ein verirrtes Caret-Zeichen und ein Wort, gedruckt | Löschen, sobald nichts mehr darauf verweist |
| `> [!note]`-Callout | Ein Blockquote mit dem wörtlichen Text `[!note]` in der ersten Zeile | Den Marker entfernen, das Blockquote behalten, den Typ anderweitig vermerken, falls er zählt |
| Ein ` ```dataview `-Block | Ein Codeblock, der den Query-Text zeigt | Nichts zu konvertieren — die Tabelle stand nie in der Datei |
| `%%kommentar%%` | Der Text selbst, sichtbar, da Obsidians Inline-Kommentarsyntax ebenfalls nicht Standard ist | Vor der Konvertierung löschen |
| YAML-Frontmatter (`---`-Block) | Meist in Ordnung, aber ein Parser, der es nicht erkennt, stellt die öffnenden `---` als Trennlinie dar | Entfernen, oder in die eigene Frontmatter-Konvention des Zielformats umwandeln |

## Wikilinks abschalten, und was das behebt und was nicht

Die Einstellung liegt unter Einstellungen, Dateien und Links, „Use \[\[Wikilinks\]\]“ — schalten Sie sie aus, und Obsidian schreibt ab diesem Zeitpunkt für jeden neu erstellten Link Standard-Markdown-Links, `[Text](Pfad)` (geprüft auf obsidian.md und über Obsidians eigene Einstellungsdokumentation, 14. September 2026). Die Autovervollständigung funktioniert genauso wie zuvor — `[[` tippen, eine Notiz aus den Vorschlägen wählen — die einzige Änderung ist, was nach Ihrer Bestätigung auf die Platte geschrieben wird.

| Vorteile | Nachteile |
| --- | --- |
| Keine Migrationskosten für nach der Änderung geschriebene Links | Jeder vor der Änderung geschriebene Link bleibt unangetastet — ein etablierter Vault braucht trotzdem einen eigenen Umschreibedurchgang |
| Macht den Vault ab sofort schrittweise interoperabler | Embeds, Blockreferenzen und Callouts sind unberührt — diese Einstellung betrifft nur einfache Links |
| Kein Plugin, kein Export, keine neue Abhängigkeit | Die Autoverlinkung per Titel setzt weiterhin voraus, dass die Datei an dem Pfad existiert, den Obsidian beim Erstellen des Links aufgelöst hat |

**Für wen ist das?** Für jeden, der weiter in Obsidian schreiben will, während der Vault schrittweise portabler wird. Es ist für sich genommen kein Migrationswerkzeug — es hält das Problem davon ab zu wachsen, und der bestehende Rückstau an Wikilinks braucht trotzdem einen Durchgang.

## Wikilinks und Embeds in einem bestehenden Vault umschreiben

Für einen Vault, der schon Monate oder Jahre an Wikilinks enthält, ist die praktische Abhilfe ein Skript: jede `.md`-Datei durchlaufen, die Wikilink- und Embed-Muster finden, jedes Ziel gegen den eigenen Dateiindex des Vaults auflösen und an Ort und Stelle umschreiben.

```text
WIKILINK = /!?\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/

for file in vault:
    text = read(file)
    text = replace_all(text, WIKILINK, (whole, target, shown) => {
        path = resolve_in_vault(target)      # per Dateiname suchen, im ganzen Vault
        text_shown = shown ?? target
        if whole starts with "!" and target looks like an image or attachment:
            return "![](" + path + ")"
        if path exists:
            return "[" + text_shown + "](" + path + ")"
        return text_shown                     # kein Ziel zum Verlinken; die Worte behalten
    })
    write(file, text)
```

Das Detail, das einen ersten Versuch erwischt: `resolve_in_vault` muss den ganzen Vault nach Dateinamen durchsuchen, nicht nur den aktuellen Ordner, denn genau das tut Obsidians eigene Link-Auflösung — ein als `[[Meeting Notes]]` geschriebener Wikilink findet, von welcher Notiz im Vault auch immer aus, eine Datei namens `Meeting Notes.md`, wo auch immer sie liegt, und ein Skript, das nur das eigene Verzeichnis der verlinkenden Notiz prüft, erzeugt still tote Links für alles, was nicht daneben gespeichert ist.

**Eine Anmerkung zur Mehrdeutigkeit.** Zwei Dateien mit demselben Namen in unterschiedlichen Ordnern sind für einen bloßen `[[Meeting Notes]]`-Link nicht zu unterscheiden — Obsidian löst nach seiner eigenen internen Regel zu der auf, die es zuerst findet, und ein Umschreibeskript erbt dieselbe Mehrdeutigkeit. Hat ein Vault doppelte Dateinamen über Ordner hinweg, klären Sie das, bevor Sie einem automatisierten Umschreiben der Links dazwischen vertrauen.

## Callouts, Dataview und das Plugin-Ökosystem im Allgemeinen

Ein Callout — `> [!note]`, `> [!warning]`, Obsidian liefert etwa ein Dutzend Typen — ist ein Blockquote mit einem geklammerten Typ-Marker in der ersten Zeile. Ein Standard-Markdown-Renderer zeigt den Marker als wörtlichen Text, statt den Block zu gestalten, die Abhilfe ist also entweder den Marker zu entfernen (was den visuellen Unterschied zwischen einer Notiz und einer Warnung verliert) oder jeden Typ auf eine eigene Konvention des Zielformats abzubilden, sofern das Ziel gestaltete Callouts überhaupt unterstützt.

Dataview ist der Fall, den Leute am häufigsten falsch lesen. Eine Dataview-Query wird als eingezäunter Codeblock mit `dataview` als Info-String geschrieben — dieser Block konvertiert einwandfrei, in einen gewöhnlichen Codeblock, der den Query-Text zeigt. Was nicht konvertiert, ist die Tabelle, die Dataview erzeugte, denn diese Tabelle wurde nie in die Datei geschrieben: Obsidians Dataview-Plugin führt die Query aus und stellt das Ergebnis zur Anzeigezeit dar, jedes Mal, wenn die Notiz geöffnet wird, und die Quelldatei enthielt immer nur die Frage, nie die Antwort.

Dieselbe Logik gilt für jedes Plugin, das etwas darstellt, das die Datei selbst nicht enthält: eine Mindmap-Ansicht, eine Graph-Ansicht, eine Canvas. Wenn der Wert einer Notiz von der Darstellung eines Plugins abhängt statt von ihrem Rohtext, wird die Konvertierung des Textes allein sich immer anfühlen, als hätte sie etwas verloren, weil sie es hat — die Darstellung wurde von Anfang an nie gespeichert.

## Aliase: die andere Art, wie ein Wikilink-Ziel mehrdeutig ist

Die YAML-Frontmatter einer Notiz kann eine `aliases`-Liste tragen, und Obsidian löst einen `[[Wikilink]]` genauso bereitwillig gegen jeden Alias eines Zielnotiz auf wie gegen ihren echten Dateinamen. Das ist innerhalb des Vaults praktisch — eine Notiz umbenennen, ohne jeden Link auf ihren alten Titel zu brechen, solange der alte Titel als Alias erhalten bleibt — und es ist eine weitere Sache, die ein Umschreibeskript berücksichtigen muss: `resolve_in_vault` muss die `aliases`-Frontmatter jeder Datei genauso prüfen wie ihren Dateinamen, sonst löst sich ein gegen einen Alias geschriebener Link zu nichts auf und fällt auf einfachen, unverlinkten Text zurück.

## Ein Community-Plugin, wenn Sie das Skript lieber nicht schreiben wollen

Obsidians eigenes Plugin-Verzeichnis führt von der Community gebaute Export-Plugins — [obsidian-markdown-export-plugin](https://github.com/bingryan/obsidian-markdown-export-plugin) ist eines davon, es exportiert eine Notiz oder einen ganzen Ordner als Paket mit den verlinkten Bildern gebündelt daneben und internen Links, die umgeschrieben sind, damit sie sich außerhalb des Vaults auflösen. Das ist eine echte Option für jemanden, der lieber ein Plugin installiert, als den obigen Resolver zu schreiben, um den Preis, dass ein Community-Plugin zum Vault hinzukommt und man dessen eigener Umschreibelogik vertraut statt einer, die man Zeile für Zeile lesen kann.

| Vorteile | Nachteile |
| --- | --- |
| Kein Skript, das man selbst schreiben oder pflegen muss | Eine Abhängigkeit vom eigenen Release-Rhythmus und den eigenen Entscheidungen eines Community-Plugins |
| Bündelt Bildanhänge neben dem exportierten Markdown | Das Verhalten bei Blockreferenzen, Callouts und Dataview ist die eigene Entscheidung des Plugins, nicht Ihre |
| Funktioniert direkt aus Obsidians eigener Oberfläche, kein separates Werkzeug | Vor dem Verlassen auf etwas, das Sie nicht von Hand wiederholen können, den aktuellen Eintrag des Plugins auf Lizenz und Pflegestatus prüfen |

**Für wen ist das?** Für jemanden, der eine Handvoll Notizen auf einmal aus Obsidian heraus exportiert, statt eine Migration des ganzen Vaults zu skripten oder zu einer browserbasierten Zusammenführung zu greifen.

## Einen Vault portabel machen, bevor Sie es brauchen

Vier Gewohnheiten halten einen Vault konvertierbar, ohne den Alltag beim Schreiben zu ändern:

- **Wikilinks abschalten**, damit neue Links ab sofort Standard sind.
- **Anhänge im Vault-Ordner behalten**, nicht von außerhalb referenziert, damit relative Pfade halten, wenn der Ordner kopiert oder gezippt wird.
- **Einen Link einem Embed vorziehen**, wo beides ginge — ein Link verfällt anmutig zu einem Link; ein Embed verfällt entweder zu einer doppelten Kopie des Inhalts oder zu bloßen Klammern, je nach Konverter.
- **Blockreferenzen als persönliche Navigationshilfe behandeln**, nicht als Weg, aus verstreuten Teilen eine Argumentation zu bauen, denn eine Blockreferenz hat überhaupt keinen Standard-Markdown-Abstiegspfad — außerhalb von Obsidian ist sie kein kaputter Link, sie ist nichts.

## Den Vault direkt hochladen, zusammengeführt zu einem Dokument

Das obige Umschreiben lohnt sich für einen Vault, der ein Ordner separater Dateien bleibt. War das Ziel immer schon ein einzelnes Dokument — eine Übergabe-Exportdatei, ein Archiv der Notizen eines Projekts —, überspringt [TransformPipes Obsidian-→-Markdown-Konvertierung](/obsidian-to-markdown) das Umschreiben Datei für Datei: den Vault-Ordner zippen und hochladen, und jede Notiz wird ein Abschnitt eines Dokuments, in ursprünglicher Reihenfolge, mit einem erzeugten Inhaltsverzeichnis. Wikilinks, Aliase und Überschriftenanker lösen sich zu den Worten auf, die sie zeigten, statt zu einem Pfad — aus demselben Grund, aus dem ein Seiten-übergreifender Link in einem zusammengeführten Notion- oder Confluence-Export seine Worte statt seiner Adresse behält: Sobald jede Notiz ein Abschnitt desselben Dokuments ist, gibt es nirgends mehr hin, wo ein Link zeigen könnte.

| Vorteile | Nachteile |
| --- | --- |
| Kein Skript, kein selbst zu bauender vault-weiter Dateinamenindex | Erzeugt ein Dokument — die falsche Form, wenn Notizen separate Dateien mit eigenen Pfaden bleiben müssen |
| Frontmatter wird automatisch entfernt, und aus einer `![[bild.png]]`-Einbettung wird das Bild selbst, mitgetragen im Dokument | Zwei Megabyte Bilder je Dokument sind die Obergrenze; ein Anhang, der kein Bild ist — ein PDF, eine Sprachnotiz — wird weiterhin zu kursivem Text |
| Läuft im Browser; der Vault wird abgemeldet nie hochgeladen | Dataview-Tabellen und anderer plugin-dargestellter Inhalt fehlen, wie bei jedem anderen Weg, weil die Quelldatei sie nie hatte |

**Preis:** kostenlos, läuft lokal.

**Für wen ist das?** Für einen Vault, oder einen Teil davon, der als einzelnes lesbares Dokument übergeben oder archiviert wird, statt als lebendiger, separat verlinkter Dateisatz erhalten zu bleiben.

## Wie Sie wählen

1. **Entscheiden Sie, ob der Vault ein Ordner mit Dateien bleibt oder ein Dokument wird.** Separate Dateien mit funktionierenden relativen Links wollen das Umschreiben-vor-Ort-Skript. Ein Dokument will den Zusammenführungsweg — er löst dasselbe Wikilink-Problem auf andere Weise, indem er die Notwendigkeit eines separaten aufzulösenden Ziels entfernt.
2. **Prüfen Sie auf Dataview-Blöcke und anderen plugin-dargestellten Inhalt, bevor Sie irgendetwas konvertieren.** Sie konvertieren korrekt als Query-Text, und die Tabelle oder Ansicht, die sie früher erzeugten, ist aus der Datei nicht wiederherzustellen — notieren Sie sich, wo diese Tabellen wichtig waren, solange Sie sie noch dargestellt sehen können.
3. **Achten Sie auf doppelte Dateinamen über Ordner hinweg.** Ein Wikilink auf einen nicht eindeutigen Namen ist selbst innerhalb von Obsidian mehrdeutig; ein Umschreibeskript erbt diese Mehrdeutigkeit, statt sie für Sie aufzulösen.
4. **Schalten Sie Wikilinks für die Zukunft ab, unabhängig davon, welchen Weg Sie für den Rückstau wählen.** Es kostet nichts und hält das Problem davon ab zu wachsen, während Sie sich um das bereits Bestehende kümmern.

## Fazit

Ein Obsidian-Vault braucht weniger einen Export als eine Übersetzung: Die Dateien sind schon Markdown, und die Arbeit steckt vollständig in den vier Stellen, an denen Obsidian seine eigene Syntax über die Standardsyntax gelegt hat — Wikilinks, Embeds, Blockreferenzen und Callouts. Sie an Ort und Stelle umzuschreiben hält den Vault als Ordner separater, funktionierender Dateien; den ganzen Vault zu einem Dokument zusammenzuführen löst dasselbe Wikilink-Problem, indem es die Notwendigkeit eines separaten aufzulösenden Ziels ganz entfernt. So oder so stellt nichts eine Dataview-Tabelle oder die dargestellte Ansicht eines Plugins wieder her, denn keines von beiden wurde je in der Datei gespeichert — prüfen Sie das, solange der Vault noch in Obsidian offen ist, nicht danach. [Wie Notion und Confluence im Vergleich abschneiden](/blog/markdown-from-notion-obsidian-and-confluence) beim selben Export-dann-reparieren-Problem lohnt sich zu lesen, wenn Obsidian nicht die einzige Quelle im Spiel ist.

## FAQ

### Hat Obsidian eine Export-nach-Markdown-Funktion?

Nein, und es braucht auch keine — ein Vault ist schon ein Ordner mit `.md`-Dateien auf der Platte. Was konvertiert werden muss, ist Obsidians eigene Syntax, die über Standard-Markdown gelegt ist: Wikilinks, Embeds, Blockreferenzen und Callouts, von denen keines ein Standardparser richtig liest.

### Wie konvertiere ich Obsidians `[[Wikilinks]]` zu Standard-Markdown-Links?

Schalten Sie „Use \[\[Wikilinks\]\]“ unter Einstellungen, Dateien und Links aus, für alles, was ab diesem Zeitpunkt geschrieben wird. Für bereits im Vault vorhandene Links muss ein Skript jeden `[[Wikilink]]` finden, den Zieldateinamen gegen den ganzen Vault auflösen und ihn als Standard-`[Text](Pfad)`-Link umschreiben.

### Was passiert mit Dataview-Queries, wenn ich einen Vault konvertiere?

Die Query selbst konvertiert einwandfrei, als eingezäunter Codeblock, der den Query-Text zeigt. Die Tabelle, die sie früher darstellte, konvertiert nicht, denn sie wurde nie in der Datei gespeichert — Dataview erzeugt sie zur Anzeigezeit, innerhalb von Obsidian, aus einem Plugin.

### Kann ich Obsidian-Callouts beim Konvertieren zu Standard-Markdown behalten?

Nicht als gestaltete Callouts, da `> [!note]` Obsidian-spezifische Syntax ist. Der sichere Rückfall ist, den geklammerten Marker zu entfernen und das Blockquote zu behalten; zählt der Typ, vermerken Sie ihn im Text selbst, denn ein Standardrenderer wird unterschiedliche Callout-Typen von sich aus nicht unterschiedlich gestalten.

### Was wird aus einem Embed wie `![[Notiz]]` außerhalb von Obsidian?

Wörtlicher Text — zwei an ein Ausrufezeichen angrenzende Klammern, der Name der Notiz, zwei schließende Klammern — sofern nichts ihn umschreibt. Es gibt keine Standard-Markdown-Transklusionssyntax, die ehrlichen Abhilfen sind also, den Inhalt der referenzierten Notiz direkt einzufügen, oder den Embed in einen einfachen Link umzuwandeln, je nachdem, ob das Zielformat überhaupt ein Äquivalent hat.

### Kann ich einen Vault konvertieren, ohne ihn irgendwohin hochzuladen?

Ja, wenn der Konverter lokal in Ihrem Browser läuft, statt die Dateien an einen Server zu senden — bei einem Vault mit irgendetwas Sensiblem darin lohnt es sich, das zu prüfen, indem Sie während der Konvertierung das Netzwerkpanel beobachten und bestätigen, dass nichts das Gerät verlässt.

### Mein Wikilink zeigt auf den alten Titel einer Notiz. Warum funktioniert er in Obsidian noch, aber nicht nach der Konvertierung?

Weil der alte Titel wahrscheinlich in der `aliases`-Frontmatter dieser Notiz gespeichert ist, und Obsidian Wikilinks gegen Aliase genauso auflöst wie gegen echte Dateinamen. Ein Umschreibeskript oder Konverter muss dieselbe Aliase-Liste prüfen, sonst löst sich ein gegen den alten Titel einer umbenannten Notiz geschriebener Link zu nichts auf, sobald er Obsidian verlässt.

### Muss ich Blockreferenzen konvertieren, bevor ich einen Vault außerhalb von Obsidian teile?

Ja, in dem Sinn, dass nichts anderes sie brauchbar darstellen wird — `[[Notiz#^block-id]]` hat außerhalb von Obsidian überhaupt kein Äquivalent. Die einzige ehrliche Abhilfe ist, den zitierten Text direkt dort einzufügen, wo die Referenz stand, denn es gibt kein externes Ziel, auf das sie zeigen könnte.
