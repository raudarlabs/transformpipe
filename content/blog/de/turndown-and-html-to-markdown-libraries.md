---
title: "Turndown gegen fünf HTML-zu-Markdown-Bibliotheken: was jede verliert"
description: "Sechs Bibliotheken nebeneinander bei Tabellen, verschachtelten Listen, Codeblöcken und Leerraum — mit addRule, keep und remove an dem HTML gezeigt, das sie braucht."
date: 2026-08-21
tag: Code
keywords: html zu markdown bibliothek, turndown, turndown addrule, node-html-markdown, html-to-md, html2text python, pandoc html zu markdown
---

Das HTML, das Sie konvertieren müssen, ist nie das HTML aus der README. Es hat ein `<div class="callout">`, das etwas bedeutet, einen Codeblock aus zweihundert `<span>`-Elementen, eine Tabelle mit einer verbundenen Kopfzelle und alle drei Elemente einen leeren Absatz, weil ein CMS ihn dort hingesetzt hat. Jede Bibliothek auf dieser Seite konvertiert diese Seite in Markdown. Sie erzeugen fünf verschiedene Dateien, und die Unterschiede sind nicht kosmetisch.

### Kurzfassung

Wählen Sie nach der Form der Eingabe und danach, wo der Code läuft. **Turndown** ist der Standard für JavaScript, weil seine Regeln pro Element ersetzbar sind, was das Einzige ist, das ungewöhnliches HTML handhabbar macht — aber Tabellen brauchen `turndown-plugin-gfm`. **node-html-markdown** bringt seinen eigenen Parser mit (`node-html-parser`), läuft also dort, wo es kein DOM gibt, und behandelt Tabellen ohne Plugin. **html-to-md** ist die kleine, abhängigkeitsfreie Option, und ihr `skipTags`-Standard entfernt bereits Seitenmobiliar. **html2text** ist die Python-Antwort, wenn die Ausgabe zum Lesen gedacht ist statt zum Zurückkonvertieren. **Pandoc** als Subprozess ist die Antwort, wenn Markdown nicht das letzte Format ist, zu dem das Dokument werden muss.

Der Fehler, der Leute erwischt, ist keine fehlende Funktion. Es ist die Annahme, diese Bibliotheken seien austauschbar, die Wahl könne also spät getroffen und billig geändert werden. Das kann sie nicht: Konfiguration ist in diesem Bereich Code, keine Flags, und der Code ist pro Bibliothek verschieden. Eine Regel, die `<div class="warning">` auf eine Blockquote abbildet, sind dreißig Zeilen gegen Turndowns API und dreißig andere Zeilen gegen die API von node-html-markdown.

Das Zweite, das man wissen sollte, bevor man irgendetwas installiert, ist, welche dieser Bibliotheken ein DOM braucht. Turndown arbeitet über eines — in Node bringt es `@mixmark-io/domino` als Abhängigkeit mit, um es zu liefern. Das ist praktisch, und es ist auch eine Einschränkung dafür, wo der Code laufen kann und wie viel Speicher ein großes Dokument kostet. Die parser-eigenen Bibliotheken gehen den entgegengesetzten Tausch ein. Wenn Sie zwischen Werkzeugen statt zwischen Bibliotheken wählen, behandelt [der breitere Vergleich der HTML-zu-Markdown-Konverter](/blog/best-html-to-markdown-converters) die Erweiterungen, die CLIs und die gehosteten Optionen; dieser Text handelt von dem Code, den Sie importieren.

## Sechs Bibliotheken, und was jede davon ist

Vier davon sind Bibliotheken, die Sie aufrufen, eine ist ein Python-Paket mit angehängter CLI, und eine ist ein Binary, zu dem Sie shellen. Diese Unterscheidung zählt mehr als jede Funktion in der Tabelle, denn sie entscheidet, was passiert, wenn die Konvertierung fehlschlägt: Eine Bibliothek wirft einen Fehler, ein Subprozess gibt einen Exit-Code und eine Zeile auf Standard-Error zurück, die jemand lesen muss.

| Bibliothek | Sprache | Am besten für | Schlüsselfähigkeit | Lizenz |
| --- | --- | --- | --- | --- |
| Turndown | JavaScript | Kontrolle pro Element bei ungewöhnlichem HTML | `addRule`, `keep`, `remove`, und drei Ersetzungsoptionen | Kostenlos, MIT |
| turndown-plugin-gfm | JavaScript | Tabellen, Durchgestrichenes und Aufgabenlisten in Turndown | `gfm`, `tables`, `strikethrough`, `taskListItems` | Kostenlos, MIT |
| node-html-markdown | TypeScript | Durchsatz, und Umgebungen ohne DOM | Bündelt `node-html-parser`; ein Übersetzer pro Element | Kostenlos, MIT |
| html-to-md | JavaScript | Ein Konverter, der ein Detail in einem Bundle ist | Keine Abhängigkeiten; `skipTags` und `aliasTags` | Kostenlos, MIT |
| html2text | Python | Lesbare Textausgabe aus einem Skript oder einer Shell | CLI und Bibliothek; `--backquote-code-style`, `--body-width` | Kostenlos, GPLv3 |
| Pandoc | Haskell-Binary | HTML, das mehr werden muss als Markdown | `-f html -t gfm`, liest Standardeingabe | Kostenlos, GPL |

Zwei der sechs konkurrieren nicht wirklich. `turndown-plugin-gfm` gehört bei jeder realistischen Eingabe zu Turndown, denn HTML ohne Tabellen ist selten genug, dass Tabellenunterstützung als optional zu behandeln eine Entscheidung ist, die Sie rückgängig machen werden. Pandoc ist in diesem Zusammenhang überhaupt keine Bibliothek; es ist ein Prozess, und die Kosten seiner Nutzung werden in Prozessstarts gemessen, nicht in Bundle-Bytes.

## Turndown im Detail: Rules, keep, remove und die besonderen Ersetzungen

Turndown konvertiert einen HTML-String oder einen DOM-Knoten — ein Element, ein Dokument, oder ein Dokumentfragment — in Markdown. Diese Eingabeflexibilität ist das erste praktische Detail: In einer Browsererweiterung können Sie ihm ein lebendes Element übergeben, statt die Seite zu serialisieren und neu zu parsen, was eine Kopie des Dokuments spart und erhält, was die eigenen Skripte der Seite bereits geändert haben.

Alles andere an Turndown ist das Regelsystem, es lohnt sich also zu verstehen, wie eine Regel gewählt wird, bevor man eine schreibt.

### Wie Turndown eine Regel wählt

Regeln werden in fester Reihenfolge probiert, und die Reihenfolge erklärt die meisten überraschenden Ausgaben:

1. Die **Blank-Regel**, die alles andere überstimmt.
2. **Hinzugefügte Regeln**, in der Reihenfolge, in der Sie sie hinzugefügt haben.
3. Die eingebauten **CommonMark-Regeln**.
4. **Keep-Regeln**.
5. **Remove-Regeln**.
6. Die **Standardregel**.

Zwei Folgen ergeben sich sofort. Erstens schlagen Ihre eigenen Regeln die eingebauten, Sie müssen also nie etwas forken, um zu ändern, wie `<a>` oder `<pre>` ausgegeben wird — Sie fügen eine Regel mit demselben Filter hinzu, und sie gewinnt. Zweitens schlägt die Blank-Regel Ihre. Ein Knoten ist leer, wenn er nur Whitespace enthält und kein `<a>`, `<td>`, `<th>` oder ein Void-Element ist. Zielt Ihre Regel also auf `<div class="spacer">` und das Div ist leer, läuft Ihre Regel nie, und der Grund steht nicht in Ihrem Code.

### addRule mit einem Tag-Namen, einer Liste, oder einer Filterfunktion

`addRule(key, rule)` nimmt einen Namen — nur benutzt, damit ein späterer Aufruf ihn ersetzen kann — und ein Objekt mit einem `filter` und einer `replacement`. Es gibt den Dienst zurück, Aufrufe verketten sich also.

Der Filter hat drei Formen. Ein String matcht einen Tag-Namen. Ein Array matcht mehrere Tag-Namen. Eine Funktion erhält den Knoten und die Optionen und gibt einen Boolean zurück, und dort passiert die eigentliche Arbeit.

```js
import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
  strongDelimiter: '**',
  linkStyle: 'inlined',
});

// A string filter: one tag.
turndown.addRule('figcaption', {
  filter: 'figcaption',
  replacement: (content) => `\n\n_${content.trim()}_\n\n`,
});

// An array filter: several tags, one handler.
turndown.addRule('smallprint', {
  filter: ['small', 'cite'],
  replacement: (content) => content,
});

// A function filter: the only form that can see attributes.
turndown.addRule('warning', {
  filter: (node) =>
    node.nodeName === 'DIV' &&
    (node.getAttribute('class') || '').includes('warning'),
  replacement: (content) =>
    `\n\n> **Warning**\n>\n> ${content.trim().replace(/\n/g, '\n> ')}\n\n`,
});
```

Die `replacement`-Signatur ist `(content, node, options)`. `content` ist das schon konvertierte Markdown der Kinder, was der Teil ist, den Leute falsch verstehen: Sie bekommen nicht das innere HTML, sondern das Ergebnis, es zu konvertieren, Sie können also nicht in Ihrer eigenen Ersetzung die Struktur darin erneut untersuchen. Brauchen Sie die Struktur, sehen Sie sich `node` an; brauchen Sie den Text, sehen Sie sich `content` an.

Die Funktions-Filter sind auch die Antwort auf die häufigste reale Anforderung überhaupt: dass ein Klassenname eine Bedeutung trägt, für die Markdown kein Vokabular hat. Ein `<div class="warning">` wird unter jedem Standard in diesem Artikel zu einem gewöhnlichen Absatz, und der Leser verliert das einzige Signal, dass dieser Absatz der ist, der zählt. Turndown kann angewiesen werden, ihn auf eine Blockquote abzubilden. Das ist eine Regel pro Klasse, von Ihnen geschrieben, pro Site — und immer noch die billigste verfügbare Lösung.

### Die Optionen, und die zwei, die die Ausgabe tatsächlich ändern

Das Optionsobjekt deckt `headingStyle` (`setext` oder `atx`), `hr`, `bulletListMarker` (`-`, `+` oder `*`), `codeBlockStyle` (`indented` oder `fenced`), `fence` (dreifache Backticks oder `~~~`), `emDelimiter` (`_` oder `*`), `strongDelimiter` (`**` oder `__`), `linkStyle` (`inlined` oder `referenced`), `linkReferenceStyle` (`full`, `collapsed` oder `shortcut`) und `preformattedCode` ab.

Die meisten davon sind Hausstil und nichts bricht so oder so. Zwei sind es nicht:

- `codeBlockStyle: 'fenced'` ist die, die man bewusst setzen sollte. Eingerückte Codeblöcke können keine Sprache tragen, ein eingerückter Block verliert also die Hervorhebung am anderen Ende und lässt sich von einem tief eingerückten Listeneintrag nicht durch einen nachlässigen Parser unterscheiden.
- `linkStyle: 'referenced'` verschiebt jede URL ans Ende des Dokuments. Für eine Seite mit vierzig Inline-Links ist das der Unterschied zwischen lesbarer Prosa und einer Wand aus Klammern — und für eine Datei, die in die Versionskontrolle geht, ist es der Unterschied zwischen einem lesbaren Diff und einem, das es nicht ist.

`preformattedCode` ist der leise. Es steuert, ob Whitespace innerhalb von `code`-Elementen erhalten bleibt statt zusammengefaltet zu werden, und wenn Sie HTML konvertieren, in dem Einrückung innerhalb von Inline-Code bedeutungsvoll ist, wird der Standard Sie überraschen.

### keep, remove, und warum sie keine Gegensätze sind

`keep(filter)` und `remove(filter)` nehmen beide dieselben drei Filterformen wie eine Regel, und sie tun sehr unterschiedliche Dinge.

```js
// Emit these as raw HTML, because Markdown has no equivalent.
turndown.keep(['iframe', 'sup', 'sub', 'kbd']);

// Delete these and everything inside them.
turndown.remove(['script', 'style', 'noscript', 'nav', 'footer']);
```

`keep` heißt „setze das originale HTML ins Markdown“. Block-Level-Elemente, die behalten werden, sind durch Leerzeilen vom umgebenden Inhalt getrennt, die Ausgabe bleibt also strukturell gültiges Markdown. Was es nicht ist: portabel. Rohes HTML in einer Markdown-Datei übersteht nur, wenn der nächste Renderer rohes HTML erlaubt, und wird zu sichtbarer Tag-Suppe maskiert, wenn nicht. Ein `<iframe>` zu behalten ist eine Wette auf das Ziel.

`remove` heißt, das Element und sein Inhalt sind weg. Standardmäßig wird nichts entfernt — das ist der Teil, den man sich auf einen Klebezettel schreiben sollte. Turndown entfernt `<script>` nicht für Sie. Geben Sie ihm eine gespeicherte Webseite, und der Skriptinhalt landet als Text in Ihrem Markdown, was an sich kein Sicherheitsproblem ist, aber sicher ein Ausgabeproblem, und es ist der Grund, warum es so viele Bugreports zu „warum ist JavaScript in meinem Markdown“ gibt. Kam das HTML von irgendwo, das Sie nicht kontrollieren, ist das Entfernen von Script und Style das Minimum, und [was Sanitisieren tatsächlich abdecken muss](/blog/sanitising-markdown-safely) lohnt sich zu lesen, bevor Sie dem Ergebnis einer Konvertierung so oder so vertrauen.

Der Anpassungshaken für `keep` ist `keepReplacement`, eine Ersetzungsfunktion wie jede andere, Sie können also entscheiden, dass ein behaltenes Element eingepackt, eingerückt oder annotiert wird statt wortwörtlich ausgegeben.

### blankReplacement, und das Problem des leeren Absatzes

`blankReplacement` ist die Option, die die nervigste Kategorie schlechten HTMLs löst: das leere Element, das ein Content-Management-System zur Abstandshaltung einfügt. Die Blank-Regel fängt diese Knoten vor jeder anderen Regel ab, und ihre Ersetzung entscheidet, was aus ihnen wird.

Der Standard behält die Blocktrennung — ein leerer Block-Level-Knoten erzeugt trotzdem einen Absatzumbruch, ein leerer Inline-Knoten erzeugt nichts. Das ist meist richtig und gelegentlich genau die Ursache eines Dokuments voller Lücken.

```js
const turndown = new TurndownService({
  // Drop empty blocks entirely instead of leaving a paragraph break.
  blankReplacement: () => '',
});
```

Die Kosten sind real, und Sie sollten sie kennen, bevor Sie das setzen: Sie haben gerade den Mechanismus entfernt, der zwei Blöcke trennt, deren einziger Trenner ein leerer Knoten war. Bei HTML mit sauberer Struktur ändert das nichts. Bei HTML, in dem ein `<p>&nbsp;</p>` die Arbeit eines Absatzumbruchs erledigte, bekommen Sie zwei Absätze, die zusammenlaufen. Konvertieren Sie ein repräsentatives Dokument auf beide Arten und lesen Sie das Ergebnis, statt darüber nachzudenken.

`defaultReplacement` ist die dritte der Sonderoptionen und die am wenigsten benutzte. Sie greift bei Elementen, auf die keine Regel passte, und der Standard gibt den Textinhalt des Knotens aus, getrennt durch Leerzeilen, wenn der Knoten Block-Level ist. Sie zu überschreiben ist, wie Sie herausfinden, was Ihr HTML tatsächlich enthält: Geben Sie einen Markierungsstring statt des Inhalts zurück, konvertieren Sie, und greppen Sie nach der Markierung. Jeder Treffer ist ein Element, das keine Ihrer Regeln behandelt hat.

### Das GFM-Plugin: Tabellen, Durchgestrichenes, Aufgabenlisten

Turndowns Kern setzt CommonMark um, und CommonMark hat keine Tabellen. `turndown-plugin-gfm` liefert den Rest.

```js
import TurndownService from 'turndown';
import { gfm, tables, strikethrough, taskListItems } from 'turndown-plugin-gfm';

const turndown = new TurndownService();

// Everything the plugin provides:
turndown.use(gfm);

// Or only what you want:
// turndown.use([tables, strikethrough, taskListItems]);
```

`use` akzeptiert ein Plugin oder ein Array davon und gibt den Dienst zurück, verkettet sich also mit `addRule`. Die selektive Form zählt mehr, als es aussieht: `tables` ist die aufwendige Regel im Satz, und wissen Sie, dass die Eingabe keine Tabellen hat — Chat-Nachrichten, Kommentartexte, Editor-Paste-Handler —, entfernt das Weglassen eine ganze Klasse von Randfällen aus der Ausgabe.

Was das Plugin nicht kann, ist Ausdruckskraft erfinden, die Markdown fehlt. GFM-Tabellen sind ein flaches Gitter aus reinen Zellen: kein `rowspan`, kein `colspan`, kein Blockinhalt, keine Tabelle in einer Zelle. [Was tatsächlich übersteht, wenn eine Tabelle den Format wechselt](/blog/markdown-tables-that-survive-conversion) ist die Form des Problems, und sie gilt für jede Bibliothek hier gleichermaßen.

### Maskieren, und die eine Überschreibung, bei der Vorsicht geboten ist

Turndown maskiert Markdown-Syntaxzeichen in Text mit Backslashes, damit ein wörtliches Sternchen in der Quelle nicht zu Betonung in der Ausgabe wird. Text innerhalb von `code`-Elementen ist davon ausgenommen, was korrekt ist und auch die Grenze, an der die meisten Beschwerden leben: ein Dateiname wie `my_file_name.txt` in gewöhnlicher Prosa kommt als `my\_file\_name.txt` heraus, was korrekt gerendert wird und in der rohen Datei falsch aussieht.

`escape` ist eine dokumentierte, ersetzbare Methode, die Versuchung liegt also nahe:

```js
// Do this only if you own both ends of the pipeline.
turndown.escape = (text) => text;
```

Das erzeugt sauber aussehendes Markdown, das etwas anderes bedeutet als das HTML, mit dem Sie begonnen haben. Unterstriche werden zu Betonung, führende Bindestriche werden zu Listeneinträgen, eine Zeile, die mit `#` beginnt, wird zu einer Überschrift. Geht das Markdown direkt in ein Diff für einen Menschen zum Lesen und nie zurück durch einen Renderer, kann das vertretbar sein. Wird es gerendert, ist es Datenkorruption mit ordentlichem Aussehen. Die engere Lösung — eine Zeichenklasse vom Standard-Maskieren abzuziehen statt alle — ist fast immer die richtige Größe der Änderung.

**Für wen Turndown ist.** JavaScript-Entwickler, die die Ausgabe pro Element kontrollieren müssen: Editor-Paste-Handler, Browsererweiterungen, Importer, die ein altes CMS lesen. Seine Verbreitung ist eine echte Funktion, denn wenn eine Seite schlecht konvertiert, hat meist schon jemand die Regel dafür veröffentlicht.

## node-html-markdown: kein DOM, ein Übersetzer pro Element

node-html-markdown ist ein TypeScript-Konverter, dessen erklärter Zweck Durchsatz ist. Er hängt von `node-html-parser` ab und benutzt den nativen `DOMParser`, wenn einer verfügbar ist, gesteuert über die Option `preferNativeParser`. Das ist der ganze architektonische Unterschied zu Turndown, und er entscheidet drei Dinge: Er läuft in einem Worker oder einer Serverless-Funktion ohne DOM-Shim, sein Speicherprofil bei einem großen Dokument ist ein Parse-Baum statt ein volles DOM, und seine Erweiterungs-API ist seine eigene statt Turndowns.

```js
import { NodeHtmlMarkdown } from 'node-html-markdown';

// One-off:
const md = NodeHtmlMarkdown.translate(html);

// Reused — build the instance once, translate many times:
const nhm = new NodeHtmlMarkdown(
  {
    bulletMarker: '-',
    codeBlockStyle: 'fenced',
    strongDelimiter: '**',
    emDelimiter: '_',
    strikeDelimiter: '~~',
    maxConsecutiveNewlines: 2,
    keepDataImages: false,
    useInlineLinks: true,
  },
  {
    aside: { prefix: '> ', surroundingNewlines: 2 },
    button: { ignore: true },
    figcaption: { prefix: '_', postfix: '_' },
  }
);

const markdown = nhm.translate(html);
```

Das statische `translate(html, options?, customTranslators?, customCodeBlockTranslators?)` ist praktisch und baut bei jedem Aufruf alles neu. Konvertieren Sie mehr als eine Handvoll Dokumente, bauen Sie die Instanz einmal — das ist der Unterschied, für den die Bibliothek existiert.

Das Übersetzer-Objekt ist, wo node-html-markdown am nützlichsten von Turndown abweicht. Statt eines Filters und einer Ersetzung ist ein Übersetzer eine Erklärung von Feldern, jedes mit einer Aufgabe: `prefix` und `postfix` setzen sich zu beiden Seiten des Inhalts, `content` setzt feste Ausgabe, `surroundingNewlines` fügt Zeilenumbrüche davor und danach hinzu (ein Boolean, oder eine Zahl pro Seite), `recurse: false` stoppt, dass Kindelemente überhaupt gescannt werden, `ignore` überspringt den Knoten vollständig, `noEscape` schaltet Maskieren für dieses Element ab, `preserveWhitespace` behält Whitespace wie er ist, `preserveIfEmpty` besucht den Übersetzer auch, wenn das Element leer ist, `spaceIfRepeatingChar` fügt ein Leerzeichen ein, wenn das erste Zeichen mit dem zuletzt geschriebenen kollidieren würde, `childTranslators` tauscht für Kinder eine andere Übersetzersammlung ein, und `postprocess` läuft, nachdem die inneren Knoten gerendert wurden.

Das letzte Paar ist, wo die API sich verdient macht. `postprocess` kann `PostProcessResult.RemoveNode` zurückgeben, um einen Knoten zu entfernen, nachdem gesehen wurde, wozu er gerendert hat — was die Antwort auf „lösche dieses Element, falls es sich als leer herausstellte“ ist, eine Entscheidung, die Sie mit einem Filter, der vor der Konvertierung läuft, nicht treffen können. `childTranslators` lässt eine `<table>` ihre Nachfahren unter anderen Regeln behandeln als den Rest des Dokuments, ohne die globale Konfiguration anzufassen.

Die zwei Optionen, die man bewusst setzen sollte, sind `maxConsecutiveNewlines`, was die Whitespace-Kontrolle ist, die die anderen JavaScript-Bibliotheken nicht direkt anbieten, und `keepDataImages`. Eine Seite mit eingebetteten Base64-Bildern erzeugt sonst eine Markdown-Datei, in der eine einzige Bildzeile länger ist als der Rest des Dokuments zusammen.

**Für wen es ist.** Massenkonvertierung, und jede Laufzeitumgebung ohne DOM: ein Worker, eine Edge-Funktion, ein Queue-Consumer, der sich durch einen Crawl frisst. Es ist auch das, worauf der Konverter dieser Site selbst läuft, aus genau diesem Grund — derselbe Codepfad in einem Browser-Tab und auf einem Server.

## html-to-md: das kleine, und die Optionen, die die Arbeit machen

html-to-md ist ein abhängigkeitsfreier JavaScript-Konverter mit einer einzigen exportierten Funktion. Seine API sind drei Argumente und keine Instanz:

```js
import html2md from 'html-to-md';

const markdown = html2md(html, {
  skipTags: ['div', 'section', 'nav', 'footer', 'aside', 'header', 'main'],
  ignoreTags: ['script', 'style', 'svg', 'noscript', 'head', 'meta', 'form'],
  aliasTags: { figure: 'p', figcaption: 'p', dl: 'p', dt: 'p', dd: 'p' },
});
```

Die zwei Optionen, die man verstehen muss, sind `skipTags` und `ignoreTags`, denn sie klingen ähnlich und tun das Gegenteil mit Ihrem Inhalt. `skipTags` lässt das Tag bei der Konvertierung aus und behält, was darin steht — was Sie für `<div>` und `<section>` wollen, Elemente, die Layout und keine Bedeutung tragen. `ignoreTags` verwirft das Tag und seinen gesamten Inhalt, was Sie für `<script>`, `<style>` und `<svg>` wollen. Verwechseln Sie sie, löschen Sie entweder den Artikel oder fügen ein Stylesheet hinein.

Die Standards sind auf eine Art ungewöhnlich meinungsstark, die Arbeit spart: `skipTags` enthält bereits die strukturellen Elemente — `div`, `html`, `body`, `nav`, `section`, `footer`, `main`, `aside`, `article`, `header` —, und `ignoreTags` enthält bereits `style`, `head`, `script`, `meta`, `svg`, `noscript` und `form`. Von Haus aus ist es näher an einer lesbaren gespeicherten Seite als die anderen JavaScript-Bibliotheken, was der umgekehrte Tausch zum üblichen bei einer kleinen Abhängigkeit ist.

`aliasTags` bildet ein Tag auf einen bereits existierenden Handler ab, und es ist die Ausweichlösung für eine Liste unterstützter Tags statt eines Regelsystems. Die Bibliothek dokumentiert, was sie behandelt: `a`, `b`, `blockquote`, `code`, `del`, `em`, `h1` bis `h6`, `hr`, `i`, `img`, `input`, `li`, `ol`, `p`, `pre`, `s`, `strong`, `table`, `tbody`, `td`, `th`, `thead`, `tr`, `ul`. Alles außerhalb dieser Liste braucht einen Alias, ein Skip, oder `renderCustomTags`, um zu entscheiden, was mit unbekannten Elementen passiert. `tagListener` gibt Ihnen ein einzelnes Tag zum selbst Behandeln, und die dokumentierte Optionsreihenfolge ist `skipTags` vor `emptyTags` vor `ignoreTags` vor `aliasTags`, was die Reihenfolge ist, in der zu denken ist, wenn zwei Ihrer Listen dasselbe Element erwähnen.

Das dritte Argument von `html2md` entscheidet, ob Ihre Arrays die eingebauten Standards vollständig ersetzen, statt mit ihnen zusammengeführt zu werden. Das ist ein größerer Schalter, als es aussieht: Übergeben Sie `skipTags: ['div']` ohne es, verlassen Sie sich womöglich weiter auf neun andere Standards, die Sie nie gelesen haben.

**Für wen es ist.** Frontend-Code, wo Bundle-Größe eine echte Einschränkung ist, und HTML, das sich einigermaßen benimmt. Es ist ausdrücklich nicht das Werkzeug für schlecht verschachteltes oder fehlerhaftes Markup — die eigene Anleitung der Bibliothek sagt, sie erwartet gültiges HTML, und sie hat keinen DOM-Parser hinter sich, der das Durcheinander repariert.

## Außerhalb von JavaScript: html2text und Pandoc

### html2text, für Python und für Ausgabe, die Menschen lesen

html2text ist eine Python-Bibliothek mit einer Kommandozeilen-Frontend. Ihr Zweck ist lesbarer Text, der zufällig gültiges Markdown ist, und ihre Standards spiegeln diese Priorität statt Treue.

```bash
html2text --backquote-code-style --body-width=0 --pad-tables page.html > page.md
```

```python
import html2text

h = html2text.HTML2Text()
h.body_width = 0             # no hard wrapping
h.backquote_code_style = True  # fenced code blocks
h.ignore_images = True
h.escape_snob = False

markdown = h.handle(html)
```

Drei Flags tragen den größten Teil des Unterschieds zwischen brauchbarer und unbrauchbarer Ausgabe.

`--backquote-code-style` ist die wichtige für alle, die technische Dokumente konvertieren: Sie erzeugt mehrzeilige Codeblöcke im Dreifach-Backtick-Stil. Ohne sie verlassen Sie sich auf eingerückte Blöcke, oder auf `--mark-code`, was Programmcode-Blöcke mit wörtlichen `[code]`- und `[/code]`-Markierungen kennzeichnet — nützlich, wenn Sie nachbearbeiten, falsch, wenn ein Mensch die Datei lesen soll.

`--body-width` setzt die Zeichen pro Ausgabezeile und nimmt `0` für keinen Umbruch. Dieses Flag entscheidet, ob das Markdown diffbar ist. Hart umgebrochene Prosa heißt, eine Ein-Wort-Bearbeitung bricht einen Absatz neu um, und das Diff zeigt fünf geänderte Zeilen. Setzen Sie es für alles, was in ein Repository geht, auf null.

Für Tabellen gibt es drei getrennte Positionen: `--pad-tables` polstert Zellen auf gleiche Spaltenbreite, `--bypass-tables` formatiert Tabellen in HTML statt Markdown-Syntax, und `--ignore-tables` ignoriert die tabellenbezogenen Tags, behält aber die Zeilen. Die letzte lohnt sich zu kennen, weil sie die ehrliche Antwort für Tabellen ist, die für Layout statt für Daten benutzt werden — Sie behalten den Inhalt und geben das Raster auf.

Zwei weitere lohnen eine Zeile. `--reference-links` benutzt Referenz-Links statt Inline-Links. `--protect-links` umgibt Links mit spitzen Klammern, damit der Zeilenumbruch sie nicht bricht. `--escape-all` maskiert alle Sonderzeichen: weniger lesbar, und es vermeidet die Formatierungsfehler in Randfällen.

Die Lizenz ist das, was Sie zuerst prüfen sollten, nicht zuletzt. html2text ist GPLv3, was manche Projekte nicht nehmen können.

**Für wen es ist.** Python-Code, der Text für Menschen oder für einen Index produziert: Digests, Benachrichtigungstexte, Klartext-Teile von E-Mails, ein Korpus für eine Suchmaschine. Brauchen Sie eine treue strukturelle Kopie statt einer lesbaren, ist es die falsche Seite des Tauschs.

### Pandoc als Subprozess

Pandoc ist keine Bibliothek, die Sie importieren; es ist ein Binary, das Sie starten. In der HTML-zu-Markdown-Richtung ist der Aufruf kurz:

```bash
pandoc -f html -t gfm --wrap=none input.html -o output.md

# or read standard input, which is what you want from code
cat input.html | pandoc -f html -t gfm --wrap=none
```

Übergeben Sie von Node aus die Argumente als Array, damit keine Shell beteiligt ist und das HTML nie zitiert werden muss:

```js
import { execFileSync } from 'node:child_process';

const markdown = execFileSync(
  'pandoc',
  ['-f', 'html', '-t', 'gfm', '--wrap=none'],
  { input: html, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }
);
```

Von Python aus:

```python
import subprocess

markdown = subprocess.run(
    ["pandoc", "-f", "html", "-t", "gfm", "--wrap=none"],
    input=html,
    capture_output=True,
    text=True,
    check=True,
).stdout
```

Vier Dinge an diesem Muster sind es wert, bewusst zu sein.

**Der Prozess ist die Kosten.** Eine Konvertierung ist frei. Zehntausend Konvertierungen sind zehntausend Prozessstarts, jeder mit eigenem Anlauf, und an diesem Punkt gewinnt eine In-Process-Bibliothek unabhängig davon, wie gut Pandocs Ausgabe ist. Bündeln Sie die Arbeit in weniger Aufrufe, oder nehmen Sie eine Bibliothek.

**`maxBuffer` und die Pipe sind echte Grenzen.** Ein großes Dokument, zurückgegeben über eine Pipe, muss in den erlaubten Puffer passen. Der Standard in Node ist nicht großzügig, und der Fehlerfall ist ein abgeschnittenes Dokument statt einer Ausnahme, die Sie beim Testen bemerkt hätten.

**Bauen Sie den Befehl nie als String.** Ein Array zu übergeben, wie oben, bedeutet, das HTML reist über die Standardeingabe, und keine Shell interpretiert irgendetwas davon. `pandoc ... "${html}"` mit Interpolation zu bauen ist eine Command-Injection, die auf das erste Dokument mit einem Backtick wartet.

**Prüfen Sie den Exit-Code.** `check=True` in Python und das Werfen-bei-ungleich-null-Verhalten von `execFileSync` erledigen notwendige Arbeit. Ein Subprozess, der still fehlschlägt, gibt Ihnen eine leere Datei, und eine leere Datei sieht aus wie ein Dokument ohne Inhalt statt wie ein Fehler.

Der Grund, all das zu akzeptieren, ist `-t gfm` und alles, was danach kommt. Pandoc liest HTML und schreibt in eine lange Liste anderer Formate, dieselbe Pipeline, die Markdown erzeugt, kann also DOCX, LaTeX oder EPUB aus derselben Quelle erzeugen, und `--sandbox` beschränkt Dateisystemzugriff, wenn die Eingabe nicht Ihre ist. `--wrap=none` zählt aus demselben Grund wie `--body-width=0` bei html2text.

**Für wen es ist.** Build-Pipelines, geplante Jobs, und jedes Projekt, in dem Markdown eines von mehreren Ausgabeformaten ist. Nicht für eine Konvertierung pro Anfrage in einem Webdienst.

## Tabellen, Codeblöcke, verschachtelte Listen und Whitespace

Das ist der Vergleich, der echte Projekte entscheidet, und es ist nicht der, mit dem READMEs anfangen.

| Belang | Turndown | node-html-markdown | html-to-md | html2text | Pandoc |
| --- | --- | --- | --- | --- | --- |
| Tabellen | Plugin nötig (`tables` oder `gfm`) | Von den Standardübersetzern behandelt | `table`, `thead`, `tbody`, `tr`, `th`, `td` unterstützt | Markdown-Tabellen, plus `--pad-tables`, `--bypass-tables`, `--ignore-tables` | Pipe-Tabellen mit `-t gfm` |
| Codeblöcke | `codeBlockStyle: 'fenced'`, Sprache aus einer `language-*`-Klasse gelesen | `codeBlockStyle`, plus codeblockspezifische Übersetzer | `pre` und `code` in der unterstützten Tag-Liste | Standardmäßig eingerückt; `--backquote-code-style` für Zäune | Eingezäunt, mit Sprache, wenn die Klasse sie nennt |
| Verschachtelte Listen | Rückt verschachtelten Inhalt ein, einschließlich Marker-Versatz | Von den Listenübersetzern behandelt | `ul`, `ol`, `li` unterstützt | Behandelt, mit Umbruch gesteuert durch `--wrap-list-items` | Behandelt |
| Whitespace | Zusammengefaltet; `preformattedCode` für `code` | `maxConsecutiveNewlines`, `preserveWhitespace` pro Übersetzer | Nicht direkt zugänglich | `--body-width`, `--single-line-break` | `--wrap=none` |
| Läuft im Browser | Ja, und akzeptiert einen lebenden DOM-Knoten | Ja, nativer `DOMParser`, wenn verfügbar | Ja, über einen Bundler | Nein | Nein |
| Parser | Ein DOM (`@mixmark-io/domino` in Node) | `node-html-parser` | Eigener, abhängigkeitsfrei | Pythons eigener | Pandocs HTML-Reader |

Vier Anmerkungen zum Lesen dieser Tabelle.

**Tabellen sind eine Plugin-Entscheidung, keine Funktions-Checkbox.** Turndown ohne `turndown-plugin-gfm` degradiert eine Tabelle nicht still zu etwas Lesbarem — Sie bekommen den Zellentext, zusammengelaufen mit der umgebenden Prosa, was aussieht, als hätte der Konverter Ihre Daten verloren, weil genau das passiert ist. Das ist die häufigste Turndown-Überraschung und vollständig vermeidbar in einer Zeile.

**Codeblöcke hängen vom Klassennamen ab, nicht vom Tag.** Jeder Syntax-Highlighter gibt einen Codeblock als `<pre><code class="language-python">` aus, umgeben von einem Nest aus `<span>`-Elementen pro Token. Ein Konverter, der die Klasse liest, gibt Ihnen einen annotierten Zaun und Hervorhebung am anderen Ende; einer, der es nicht tut, gibt Ihnen einen nackten Zaun und einen Verlust, den Sie erst bemerken, wenn die Seite veröffentlicht ist. [Was ein Codeblock braucht, um eine Konvertierung zu überstehen](/blog/code-blocks-in-markdown) ist eine kurze Liste, und die Sprachklasse steht oben darauf.

**Verschachtelte Listeneinrückung ist, wo Dateien aufhören, portabel zu sein.** Markdown-Parser sind uneins darüber, wie viel Einrückung eine Unterliste statt eines Codeblocks macht, und ein Konverter, der verschachtelten Inhalt um einen anderen Betrag einrückt, als Ihr Renderer erwartet, erzeugt ein Dokument, das an einer Stelle richtig und an einer anderen falsch aussieht. Konvertieren Sie eine dreistufige Liste und öffnen Sie das Ergebnis in dem Renderer, der tatsächlich veröffentlichen wird.

**Whitespace ist ein Diff-Problem, bevor es ein Erscheinungsproblem ist.** Alle fünf erzeugen etwas, das ein Browser identisch darstellt. Nur manche erzeugen etwas, wo eine Ein-Satz-Bearbeitung als Ein-Zeilen-Diff erscheint. Geht das Markdown in ein Repository, ist die Whitespace-Kontrolle — `--wrap=none`, `--body-width=0`, `maxConsecutiveNewlines` — keine kosmetische Konfiguration.

## Wo die naheliegende Bibliotheks-Antwort scheitert

Die naheliegende Antwort in JavaScript ist Turndown, und sie ist der richtige Standard. Hier hört sie, und die ganze Kategorie, auf, genug zu sein.

**Eine Bibliothek konvertiert, was Sie ihr geben, und eine gespeicherte Seite ist meist nicht der Artikel.** Keines dieser Werkzeuge hat eine Extraktionsstufe. Geben Sie einem von ihnen eine gespeicherte Nachrichtenseite, und Sie bekommen den Kopfbereich, die Navigation, den Cookie-Hinweis, die Abo-Aufforderung, die Liste verwandter Artikel und eine Fußzeile mit sechzig Links, alles treu nach Markdown übersetzt, mit dem Artikel irgendwo in der Mitte. `remove` und `skipTags` helfen; sie sind kein Inhalts-Extraktor. Ist die Eingabe ganze Seiten, brauchen Sie etwas, das zuerst den Artikel findet, und [eine Webseite als Markdown zu speichern](/blog/save-a-web-page-as-markdown) ist eine andere Aufgabe mit anderen Werkzeugen.

**Konfiguration ist Code, und Code ist Wartungskosten.** Dreißig Regeln, die die Klassennamen einer Site auf Markdown-Konstrukte abbilden, sind ein kleines Programm. Es funktioniert, bis die Site neu gestaltet wird, an welchem Punkt sich die Klassennamen ändern und Ihr Konverter still aufhört, Callouts zu erkennen. Niemand merkt es, weil die Ausgabe weiterhin gültiges Markdown ist. Regelsätze, die an fremdes Markup gebunden sind, haben ein Verfallsdatum, das nirgends steht.

**Das DOM ist eine Speicherkosten, die Sie nicht eingeplant haben.** Turndowns Parse eines großen Dokuments ist ein vollständiges DOM, was einen Knotenobjekt pro Element und pro Textlauf bedeutet statt der Bytes, die Sie ihm gegeben haben. Das ist auf einem Laptop in Ordnung, und es ist genau die Art Ding, die in einer beschränkten Funktionslaufzeit scheitert — und es scheitert bei den größten Dokumenten im Korpus statt bei den ersten, ein Import kann also lange glücklich laufen, bevor er bricht. Messen Sie mit Ihrer größten echten Eingabe, nicht mit einer repräsentativen.

**Maskieren erzeugt Ausgabe, die korrekt ist und falsch aussieht.** Jede Bibliothek maskiert Markdown-Zeichensetzung in Text, weil sie muss. Das Ergebnis ist `my\_file\_name.txt` und `1\. Introduction`, was korrekt gerendert wird und für jeden, der die rohe Datei öffnet, schlecht liest. Soll ein Mensch das Markdown überprüfen, wird er das wiederholt als Bug gegen Ihren Konverter melden. Es ist keiner, und ihm das zu sagen hilft nicht.

**Nichts hier sanitisiert.** Turndown entfernt standardmäßig kein Element. Die Aufgabe eines Konverters ist Übersetzung, keine Sicherheit, und Markdown, das rohes HTML durchträgt — weil Sie `keep` benutzt haben, oder weil die Bibliothek rohes HTML für das ausgibt, was Markdown nicht ausdrücken kann — ist Markdown, das ein `<script>`-Tag zum nächsten Renderer tragen kann. Die Kosten, das falsch zu machen, sind keine schlecht aussehende Datei.

**Und der Rundweg ist kein Rundweg.** HTML nach Markdown und zurück zu konvertieren gibt in keiner dieser Bibliotheken je das HTML zurück, mit dem Sie begonnen haben. Layout, Klassen, IDs, Inline-Stile, überspannende Zellen, Formulare und Einbettungen haben keine Markdown-Darstellung. Erwartet jemand HTML rein und äquivalentes HTML raus, korrigieren Sie diese Erwartung, bevor Sie Code schreiben, denn keine Konfiguration erreicht das.

## Wie Sie eine Bibliothek wählen

1. **Beginnen Sie damit, wo der Code läuft, denn das schließt Optionen aus, bevor irgendeine Funktion es tut.** Ein Worker oder eine Edge-Funktion ohne DOM schließt den DOM-basierten Pfad aus; ein Browser-Bundle mit Größenbudget schließt alles aus, das einen Parse-Baum hinter sich herzieht; ein Build-Skript schließt nichts aus und kann zu Pandoc shellen.
2. **Entscheiden Sie, ob Sie Pro-Element-Regeln brauchen, und seien Sie ehrlich dabei.** Wird das HTML von einem System erzeugt, das Sie kontrollieren, reichen die Standards wahrscheinlich, und Turndowns Rules-API ist Komplexität, die Sie nicht benutzen werden. Kommt das HTML aus vielen Quellen mit bedeutungsvollen Klassennamen, ist diese API der ganze Grund, es zu wählen.
3. **Konvertieren Sie Ihr schwierigstes Dokument, bevor Sie sich festlegen, nicht Ihr einfachstes.** Nehmen Sie die Seite mit einer Tabelle, einem hervorgehobenen Codeblock, einer dreistufigen Liste und einem Callout. Was diese vier behält, behält fast alles andere, und Sie wissen es in zehn Minuten statt nach zweihundert Dokumenten.
4. **Setzen Sie die Umbruch- und Whitespace-Optionen am ersten Tag.** `--wrap=none`, `--body-width=0`, `maxConsecutiveNewlines`: Diese erst zu setzen, nachdem der Korpus konvertiert ist, heißt, ihn zweimal zu konvertieren, denn Neu-Umbrechen ändert jede Zeile jeder Datei und begräbt die echten Änderungen.
5. **Prüfen Sie die Lizenz gegen Ihr Projekt, bevor Sie die Funktionen prüfen.** html2text ist GPLv3 und Pandoc ist GPL; Turndown, node-html-markdown und html-to-md sind MIT. Für eine Bibliothek, die Sie in einem Produkt ausliefern, entscheidet dieser Unterschied die Shortlist, unabhängig von der Ausgabequalität.
6. **Schreiben Sie auf, was mit dem passiert, was Markdown nicht ausdrücken kann.** Fallengelassen, als rohes HTML behalten, oder durch eine selbstgeschriebene Regel angenähert — wählen Sie es pro Elementklasse bewusst. Unentschieden gelassen, wählt es die Bibliothek für Sie, und sie wählt bei jeder der fünf anders.

## Fazit

Es gibt keine beste HTML-zu-Markdown-Bibliothek, nur die kürzeste Distanz zwischen Ihrer Eingabe und der Datei, die Sie brauchen. In JavaScript beginnen Sie mit Turndown und dem GFM-Plugin, und greifen zu seiner Rules-API nur, wenn ein Klassenname Bedeutung trägt; wechseln Sie zu node-html-markdown, wenn es kein DOM gibt oder das Volumen echt ist; wählen Sie html-to-md, wenn der Konverter ein Detail in einem Bundle ist. In Python: html2text, wenn die Ausgabe zum Lesen ist und die GPLv3-Lizenz akzeptabel ist. Shellen Sie zu Pandoc, wenn Markdown nicht das letzte Format ist, zu dem das Dokument wird. Und ist die Aufgabe eine Datei statt einer Pipeline, ist eine Bibliothek die falsche Form der Antwort überhaupt — [TransformPipes HTML-zu-Markdown-Konvertierung](/html-to-markdown) läuft im Browser, nichts wird hochgeladen und nichts installiert, was ein schnellerer Weg zum selben Markdown ist als jedes `npm install`.

## FAQ

### Was ist die beste HTML-zu-Markdown-Bibliothek für JavaScript?

Turndown, für die meisten Projekte: Es läuft im Browser und in Node, und seine Rules-API lässt Sie den Handler für jedes Element überschreiben, ohne die Bibliothek zu forken. Fügen Sie `turndown-plugin-gfm` hinzu, es sei denn, Sie sind sicher, dass die Eingabe keine Tabellen hat. Wählen Sie stattdessen node-html-markdown, wenn kein DOM verfügbar ist oder Sie in großen Mengen konvertieren.

### Unterstützt Turndown Tabellen?

Nicht im Kern, der CommonMark umsetzt, und CommonMark hat keine Tabellen. `turndown-plugin-gfm` fügt sie hinzu, zusammen mit Durchgestrichenem und Aufgabenlisteneinträgen; `turndownService.use(gfm)` schaltet alle drei ein, oder Sie importieren `tables` allein. Ohne das Plugin läuft der Zellentext einer Tabelle mit der umgebenden Prosa zusammen.

### Wie bringe ich Turndown dazu, ein Element zu ignorieren?

`remove(filter)` löscht das Element und seinen Inhalt und nimmt einen Tag-Namen, ein Array von Tag-Namen oder eine Filterfunktion. Standardmäßig wird nichts entfernt, `remove(['script', 'style', 'noscript'])` lohnt sich also für jeden Konverter, der HTML behandelt, das Sie nicht geschrieben haben. Nehmen Sie stattdessen `keep(filter)`, wenn Sie das originale HTML in der Ausgabe wollen statt nichts.

### Was macht blankReplacement in Turndown?

Es entscheidet, was mit Knoten passiert, die nur Whitespace enthalten — den leeren Absätzen, die ein Content-Management-System hinterlässt. Die Blank-Regel läuft vor jeder anderen Regel, auch Ihrer, ein leeres Element erreicht also nie eine von Ihnen geschriebene Regel. `blankReplacement: () => ''` zu setzen entfernt diese Lücken, auf Kosten der Blocktrennung dort, wo ein leerer Knoten das Einzige war, das sie lieferte.

### Welche HTML-zu-Markdown-Bibliotheken laufen im Browser?

Turndown, node-html-markdown und html-to-md tun das alle. Turndown akzeptiert ein lebendes DOM-Element statt eines Strings, weshalb Browsererweiterungen es benutzen. html2text ist Python und Pandoc ist ein Binary, keins von beiden läuft also clientseitig; im Browser ohne Build-Schritt zu konvertieren heißt, eine der drei JavaScript-Bibliotheken zu nehmen, oder [eine Konverterseite, die bereits eine bündelt](/blog/best-html-to-markdown-converters).

### Was macht --backquote-code-style in html2text?

Es lässt mehrzeilige Codeblöcke Dreifach-Backtick-Zäune benutzen statt Einrückung. Ohne es bekommen Sie eingerückte Blöcke, die keine Sprachangabe tragen können, oder `[code]`-Markierungen, wenn Sie `--mark-code` übergeben haben. Kombinieren Sie es mit `--body-width=0`, damit der Code nicht bei der Standardzeilenlänge hart umgebrochen wird.

### Lohnt es sich, Pandoc aus Code aufzurufen statt eine Bibliothek zu benutzen?

Ja, wenn Markdown nicht die einzige Ausgabe ist — derselbe Aufruf kann DOCX, LaTeX oder EPUB aus demselben HTML erzeugen —, und nein, wenn Sie pro Anfrage konvertieren. Jede Konvertierung ist ein Prozessstart, der Durchsatz ist also schlecht verglichen mit einer In-Process-Bibliothek. Übergeben Sie Argumente als Array und das HTML auf der Standardeingabe, nie als interpolierten Shell-String.
