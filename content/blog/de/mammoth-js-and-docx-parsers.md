---
title: "mammoth.js im Browser: convertToHtml mit einem arrayBuffer"
description: "Eine .docx im Browser oder in Node lesen: der arrayBuffer-Aufruf, Style-Maps auf Ihr eigenes HTML, Bilder als base64 und das Meldungs-Array, das niemand liest."
date: 2026-08-20
tag: Code
keywords: docx nach html javascript, mammoth js, mammoth docx nach html, docx in node lesen, docx parser javascript, docx4js, docxtemplater, docx nach html browser, python-docx
---

Sie haben eine `.docx` und Code, der HTML braucht. Auf npm gibt es vielleicht ein Dutzend Pakete, deren Name „docx“ enthält, und drei der beliebtesten machen eine völlig andere Aufgabe als die, die Sie wollen. Eines erzeugt Word-Dateien von Grund auf. Eines füllt Platzhalter in einer Vorlage. Eines stellt ein Dokument so dar, dass es wie eine gedruckte Seite aussieht. Nur manche lesen eine bestehende Datei und geben Ihnen Markup.

Der Suchbegriff ist „docx to html javascript“, und die ehrliche Antwort ist kurz: In JavaScript gehört diese Aufgabe mammoth. Länger zu erklären ist, warum mammoths Ausgabe so viel sauberer ist, als Sie erwarten, warum es lautlos Dinge weglässt, von denen Sie sicher waren, dass sie im Dokument standen, und warum das zwei Seiten derselben Tatsache sind.

Die Reibung ist nicht, eine Bibliothek zu installieren. Sie ist, dass eine `.docx` Bedeutung über Verweise verteilt auf ein Dutzend XML-Dateien speichert, und jeder Parser muss entscheiden, welchen dieser Verweise er folgt und welchen er ignoriert. Ein Parser, der allen folgt, erzeugt HTML voller Inline-Spans, das die Seite reproduziert und Ihnen nichts sagt. Ein Parser, der wenigen folgt, erzeugt sauberes semantisches HTML und verwirft still den Rest. Es gibt keine dritte Option, und zu wissen, welche Sie gewählt haben, ist der größte Teil der Arbeit.

### Kurzfassung

Um eine `.docx` zu lesen und in JavaScript HTML zu bekommen, nehmen Sie **mammoth** — BSD-2-Clause, läuft in Node und im Browser über den `mammoth.browser.js`-Build, und gesteuert von einer **Style-Map**, die Words benannte Styles auf HTML-Elemente überträgt, statt zu versuchen, Formatierung zu reproduzieren. Lesen Sie das `messages`-Array bei jedem Ergebnis: Es ist die einzige maschinenlesbare Liste dessen, was der Konverter nicht abbilden konnte. Entscheiden Sie sich bewusst über Bilder, denn der Standard ist Inline-Base64-Daten-URIs, und `convertImage` ist, wie Sie das ändern. Und kommen Listen als Absätze heraus, ist die Ursache fast immer `numbering.xml` — die Datei, die sie definiert, ist entweder nicht im Archiv oder löst nicht auf.

## Was eine .docx für ein Programm ist, das eine lesen muss

Eine `.docx` ist ein Zip-Archiv aus XML-Teilen im Office-Open-XML-Format. [Wie man in eine hineinkommt und was jeder Teil enthält](/blog/convert-docx-to-markdown) lohnt sich zu lesen, wenn Sie noch nie eine entzippt haben, und der Rest dieses Artikels setzt das voraus. Was hier zählt, ist die Form der Daten, sobald man am Zip vorbei ist, denn diese Form ist es, worauf jede Bibliothek auf dieser Seite reagiert.

Der Dokumentkörper ist eine Abfolge von `w:p`-Absatzelementen. Jeder Absatz enthält `w:r`-Run-Elemente. Jeder Run enthält ein `w:t`-Textelement. Der Satz „the quarterly report is late“ ist also nicht als String gespeichert. Er ist als eine gewisse Anzahl Runs gespeichert, und wie viele, hängt von Fakten über das Dokument ab, die Sie nicht vorhersagen können.

Das ist das Erste, das Leute überrascht, die versuchen, das XML selbst zu parsen. Word teilt Runs bei jeder Formatierungsänderung, was vernünftig ist, und auch an Revisionsgrenzen, Rechtschreibprüfungszuständen und diversem internem Buchhaltungskram, was es nicht ist. Ein einzelnes Wort kann drei Runs sein. Das Wort „quarterly“ kann `qua` + `rter` + `ly` sein, weil jemand 2019 in der Mitte davon editiert hat. Jeder Ansatz, der `document.xml` nach einer Formulierung durchsucht, scheitert an echten Dokumenten, und er scheitert unregelmäßig, was schlimmer ist.

Die zweite Überraschung ist, dass Whitespace bedingt ist. Ein `w:t`-Element lässt führenden und abschließenden Whitespace fallen, es sei denn, es trägt `xml:space="preserve"`. Fügen Sie Runs naiv zusammen, bekommen Sie „thequarterlyreport“. Fügen Sie sie mit Leerzeichen zusammen, bekommen Sie „qua rter ly“.

Die dritte Überraschung, und die, die alles Folgende entscheidet, ist Indirektion. Fast nichts in `document.xml` sagt, was es ist:

| Was Sie in `document.xml` sehen | Wo die Bedeutung lebt | Wem Sie folgen müssen |
| --- | --- | --- |
| `w:pStyle`, das einen Style benennt | `styles.xml` | Die Style-Definition, plus ihre `w:basedOn`-Kette |
| `w:numPr` mit `w:numId` und `w:ilvl` | `numbering.xml` | `w:num` zu `w:abstractNumId` zu `w:abstractNum` zum richtigen `w:lvl` |
| `w:drawing` mit einer `r:embed`-ID | `word/_rels/document.xml.rels` | Beziehungs-ID zu einem Pfad unter `word/media/` |
| `w:hyperlink` mit einer `r:id` | derselbe Rels-Teil | Beziehungs-ID zu einer URL |
| `w:footnoteReference` mit einer ID | `footnotes.xml` | Der Fußnotentext nach ID |
| `w:commentRangeStart` und eine Referenz | `comments.xml` | Der Kommentartext, Autor und Datum |

Eine Überschrift ist ein Absatz, dessen Style, zwei Dateien entfernt, zu etwas namens Heading 1 auflöst. Ein Aufzählungspunkt ist ein Absatz, dessen `w:numId`, über zwei Ebenen Indirektion, zu einer abstrakten Nummerierungsdefinition auflöst, deren Ebene null einen `w:numFmt` von `bullet` hat. Ein Bild ist eine Beziehungs-ID. Nichts beschreibt sich selbst.

Und es gibt eine Ebene über alldem. Content-Controls — `w:sdt`-Elemente — umschließen beliebigen Inhalt, Absätze sind also nicht immer direkte Kinder von `w:body`. Tabellen verschachteln sich, und Zellen verbinden sich über `w:gridSpan` und `w:vMerge` statt über etwas, das `colspan` ähnelt. Bilder kommen als `w:drawing` in DrawingML, wenn sie in diesem Jahrzehnt eingefügt wurden, und als `w:pict` im alten VML, wenn sie aus einer älteren Datei oder einem Einfügevorgang stammen. Nachverfolgte Einfügungen sind gewöhnliche Runs, umschlossen von `w:ins`; nachverfolgte Löschungen verstecken ihren Text in `w:delText` statt in `w:t`, was heißt, dass ein Reader, der nur auf `w:t` schaut, jede anstehende Änderung stillschweigend als endgültig akzeptiert.

Einen eigenen Parser zu schreiben ist also keine Wochenendarbeit. Mit fflate entzippen und XML durchlaufen ist das leichte Viertel der Aufgabe. Die anderen drei Viertel sind die Verweisauflösung, und dafür wählen Sie eine Bibliothek.

## Kurzvergleich: die Übersichtstabelle

| Bibliothek | Sprache | Liest oder schreibt | Ausgabe | Lizenz |
| --- | --- | --- | --- | --- |
| mammoth | JavaScript (Node + Browser) | Liest `.docx` | Semantisches HTML, gesteuert von einer Style-Map | Kostenlos, BSD-2-Clause |
| docx-preview | JavaScript (Browser) | Liest `.docx` | HTML, das die gedruckte Seite nachahmt | Kostenlos, Apache-2.0 |
| docx4js | JavaScript | Liest `.docx`, `.pptx` | Was auch immer Ihre Visitor-Funktionen bauen | Kostenlos, MIT |
| docxtemplater | JavaScript | Schreibt aus einer `.docx`-Vorlage | Eine neue `.docx` mit gefüllten Platzhaltern | Kostenlos, MIT oder GPL-3.0; kostenpflichtige Module |
| docx (dolanmiu) | JavaScript / TypeScript | Erzeugt `.docx` | Eine Word-Datei aus einem deklarativen Baum | Kostenlos, MIT |
| python-docx | Python | Liest und schreibt | Ein Objektmodell, das Sie selbst durchlaufen | Kostenlos, MIT |
| Pandoc als Subprozess | Beliebig (shellt aus) | Liest `.docx` | HTML, Markdown, Dutzende andere Formate | Kostenlos, GPL |
| LibreOffice headless | Beliebig (shellt aus) | Liest `.doc`, `.docx`, mehr | HTML, oder eine sauberere `.docx` | Kostenlos, MPL-2.0 |
| Selbst gebaut auf fflate oder JSZip | Beliebig | Liest, was Sie implementieren | Genau das, was Sie schreiben | Ihre Zeit |

Die Spalte, die am meisten zählt, ist die dritte. Die halbe Verwirrung in diesem Bereich kommt daher, nach einer schreibenden Bibliothek für eine lesende Aufgabe zu greifen, weil der Paketname die beiden nicht unterschieden hat.

## mammoth und die Style-Map-Philosophie

mammoth konvertiert `.docx` zu HTML. Es versucht nicht, Ihr Dokument zu reproduzieren. Sein erklärtes Ziel ist, einfaches, sauberes HTML zu erzeugen, indem es die semantische Information in der Datei benutzt — die benannten Styles — und den Rest ignoriert.

Diese eine Entscheidung erklärt alles, was Leute daran mögen, und alles, worüber sie sich beschweren.

Nehmen Sie einen Absatz in Word, der 16pt, fett, dunkelblau und zentriert ist, mit 12pt Abstand darüber. Ein treue-zuerst-Konverter gibt ein `div` mit sechs Inline-Styles aus. mammoth stellt eine andere Frage: Welchen Style hat dieser Absatz? Lautet die Antwort Heading 2, gibt es `<h2>` aus. Lautet sie Normal, gibt es `<p>` aus und wirft das Fett, das Blau, die Zentrierung und den Abstand weg, denn keines dieser Dinge ist, was der Absatz *ist*. Sie sind, wie er aussah.

```js
const mammoth = require("mammoth");

const result = await mammoth.convertToHtml(
  { path: "quarterly.docx" },
  {
    styleMap: [
      "p[style-name='Report Title'] => h1:fresh",
      "p[style-name='Report Subhead'] => h2:fresh",
      "p[style-name='Callout'] => aside.callout:fresh",
      "p[style-name='Code Sample'] => pre:separator('\\n')",
      "highlight[color='yellow'] => mark",
      "u => em",
      "comment-reference => sup",
    ],
    includeDefaultStyleMap: true,
  }
);

console.log(result.value);
```

Sechs Dinge in diesem Ausschnitt sind es wert, ausbuchstabiert zu werden.

**Der Matcher ist ein Style-Name, in Anführungszeichen.** `p[style-name='Report Title']` matcht Absätze, deren Style genau so heißt. Style-Namen sind das, was der Nutzer in Words Formatvorlagengalerie sieht. mammoth lässt Sie auch mit Punktnotation auf die Style-**ID** matchen — `p.ReportTitle` —, was stabiler ist, denn IDs ändern sich nicht, wenn das Dokument in einer anderssprachigen Word-Version geöffnet wird, während Namen das manchmal tun.

**`:fresh` ist keine Dekoration.** Ohne es fügt mammoth aufeinanderfolgende passende Absätze zu einem Element zusammen. Das ist korrekt für einen `pre`-Block und falsch für eine Überschrift. `:fresh` heißt, jedes Mal ein neues Element zu beginnen. Es bei einer Überschriften-Zuordnung zu vergessen erzeugt eine riesige `h2`, die drei Überschriften enthält, und es ist der mit Abstand häufigste Style-Map-Fehler.

**`:separator()` behandelt den umgekehrten Fall.** Wenn Sie *wollen*, dass aufeinanderfolgende Absätze zu einem Element zusammenfallen, setzt `pre:separator('\n')` einen Zeilenumbruch zwischen sie, statt den Text zusammenzukleben. So wird ein mehrabsätziges Codebeispiel in Word zu einem brauchbaren `pre`.

**Matcher auf Run-Ebene existieren auch.** Die dokumentierten umfassen `b`, `i`, `u`, `strike`, `all-caps`, `small-caps` und `highlight`, und `highlight` nimmt eine optionale Farbe: `highlight[color='yellow'] => mark`. So wird ein Dokument, in dem der Prüfer offene Fragen markiert hat, zu Markup, das Sie tatsächlich abfragen können.

**`comment-reference` ist ein Matcher.** Kommentare werden unterstützt, und `comment-reference => sup` zuzuordnen ist, wie die Referenzmarken die Ausgabe erreichen. Ohne eine Zuordnung dafür sind Review-Kommentare unter den Dingen, die still nicht erscheinen.

**`includeDefaultStyleMap` entscheidet, ob Sie erweitern oder ersetzen.** Es ist standardmäßig true, Ihre Regeln werden also zu mammoths eingebauter Map hinzugefügt statt sie zu ersetzen, und Ihre haben Vorrang. Setzen Sie es nur auf false, wenn Sie totale Kontrolle wollen und bereit sind, Heading 1 selbst zuzuordnen.

Es gibt eine weitere Option, `includeEmbeddedStyleMap`, und eine entsprechende `mammoth.embedStyleMap(input, styleMap)`-Funktion, die eine Style-Map **in** eine Kopie der `.docx` schreibt. Liest mammoth diese Datei später, benutzt es die eingebettete Map. Für ein Team, das Ihnen Dokumente übergibt, die auf Haus-Styles aufbauen, ist das eine echt gute Idee: Die Zuordnung reist mit der Vorlage statt in Ihrem Code zu leben, und die Person, die einen Style umbenennt, ist die Person, die die Datei hält, die ihn beschreibt.

### Der Browser-Build

mammoth liefert einen eigenständigen Browser-Build, `mammoth.browser.js`, mit eingeschlossenen Abhängigkeiten, und das Repository hat ein funktionierendes Beispiel unter `browser-demo/index.html`. Der einzige API-Unterschied ist die Eingabe: Statt eines Pfades übergeben Sie ein `arrayBuffer`.

```html
<input type="file" id="docx" accept=".docx">
<div id="out"></div>
<script src="mammoth.browser.js"></script>
<script>
  document.getElementById("docx").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
    document.getElementById("out").innerHTML = result.value;
    result.messages.forEach((m) => console.warn(m.type + ": " + m.message));
  });
</script>
```

Das ist der gesamte Mechanismus hinter jedem im Browser laufenden Word-Konverter, den Sie je benutzt haben, einschließlich dem auf dieser Site. Die Datei wird von der Seite gelesen, auf der Maschine konvertiert und nirgendwohin gepostet — eine Eigenschaft, die Sie mit offenem Netzwerk-Tab überprüfen können, statt ein Versprechen, das Sie akzeptieren müssen.

Eine Warnung zu diesem Ausschnitt, und sie ist nicht klein: `innerHTML` mit Markup, das aus einer Ihnen zugesandten Datei stammt, ist eine Entscheidung, kein Standard. mammoths Ausgabe wird aus der Struktur des Dokuments erzeugt, ist also weit enger gefasst als beliebiges HTML, aber eine `.docx` kann einen Hyperlink tragen, dessen Ziel eine `javascript:`-URL ist, und ein Konverter, der den Link treu reproduziert, reproduziert das treu mit. Kam die Datei nicht von Ihnen, [sanitisieren Sie, bevor es das DOM erreicht](/blog/sanitising-markdown-safely).

Verwandt und wissenswert, bevor Sie deployen: mammoth dokumentiert eine Option `externalFileAccess`, und der Zugriff auf externe Dateien ist **standardmäßig deaktiviert**, nur für Dokumente zu aktivieren, denen Sie vertrauen. Eine `.docx` kann Inhalt außerhalb ihrer selbst referenzieren. Der Standard der Bibliothek ist der sichere; lassen Sie ihn dort, es sei denn, Sie haben einen bestimmten Grund.

### mammoth in einer Tabelle

| Vorteile | Nachteile |
| --- | --- |
| Die Ausgabe ist semantisches HTML, das Sie selbst so geschrieben hätten | Verwirft absichtlich direkte Formatierung, einschließlich Farbe, Größe und Ausrichtung |
| Style-Maps behandeln Haus-Styles, die kein anderes Werkzeug kennt | Sie müssen diese Maps schreiben; nichts leitet sie ab |
| Läuft unverändert in Node und im Browser | Nur JavaScript |
| Meldet nicht zugeordnete Styles in einem `messages`-Array | Der eigene Markdown-Writer ist von seinem Autor als veraltet markiert |
| Bilder sind konfigurierbar, nicht fest | Keine Seitengeometrie, denn HTML kennt keine Seiten |
| Eine CLI ist für einmalige Jobs enthalten | Textfelder, Formularfelder und Layout-Konstrukte landen ungleichmäßig |

**Preis:** kostenlos, BSD-2-Clause lizenziert.

**Für wen es ist.** Für jeden, dessen nächster Schritt HTML auf einer Seite oder in einem Editor ist, und für jeden, der Dokumente konvertiert, die aus einer bekannten Vorlage erzeugt wurden. Es ist im Browser der richtige Standard, weil es dort keine ernsthafte Konkurrenz für semantische Ausgabe gibt.

## Bilder und Messages: die zwei Teile des Ergebnisses, die Sie behandeln müssen

Jeder mammoth-Aufruf gibt ein Objekt mit zwei Eigenschaften zurück, und die meisten Anleitungen nutzen nur eine davon.

### Bilder: Inline-Base64, ein Callback, oder Dateien auf der Platte

Standardmäßig werden Bilder inline in das Ausgabe-HTML eingefügt. Konkret heißt das, `mammoth.images.dataUri` läuft, und jedes Bild wird ein `<img>`, dessen `src` eine Base64-Daten-URI ist. Für ein Dokument mit zwei Logos ist das unsichtbar und bequem. Für ein Dokument mit vierzig Screenshots erzeugt es eine HTML-Datei mehrfach so groß wie die ursprüngliche `.docx`, und Base64-Kodierung fügt noch etwa ein Drittel zu den rohen Bytes hinzu, bevor irgendetwas davon gespeichert oder übertragen wird.

Die Option `convertImage` ist, wie Sie das ändern, und `mammoth.images.imgElement` ist der Helfer, der Ihre Funktion umhüllt:

```js
const path = require("node:path");
const fs = require("node:fs/promises");

let index = 0;

const result = await mammoth.convertToHtml(
  { path: "quarterly.docx" },
  {
    convertImage: mammoth.images.imgElement(async (image) => {
      const extension = image.contentType.split("/")[1];
      const name = `image-${index++}.${extension}`;
      const buffer = await image.readAsBuffer();
      await fs.writeFile(path.join("media", name), buffer);
      return { src: `/media/${name}`, alt: image.altText ?? "" };
    }),
  }
);
```

Das Bildobjekt, das mammoth Ihnen übergibt, stellt `contentType` bereit — `image/png`, `image/jpeg` und so weiter — und Lesemethoden für jede Umgebung: `readAsArrayBuffer()`, `readAsBuffer()` und `readAsBase64String()`. Es gibt auch eine ältere `read([encoding])`-Methode, die die Dokumentation als veraltet markiert; benutzen Sie die drei expliziten.

Welche Route Sie wollen, folgt daraus, wohin das HTML geht:

| Ziel | Route | Warum |
| --- | --- | --- |
| Eine eigenständige Datei zum Mailen | Standard-Daten-URIs | Die Datei öffnet mit ausgeschaltetem Netzwerk |
| Eine Seite auf einer Site | `convertImage`, das Dateien schreibt | Der Browser cacht Bilder separat vom Markup |
| Ein CMS oder ein Editor | `convertImage`, das hochlädt und die CDN-URL zurückgibt | Die Bilder gehören dem CMS, nicht dem Markup |
| Ein Einzelfall vom Terminal aus | Die CLI mit `--output-dir` | Sie schreibt die Bilder für Sie als separate Dateien aus |

Zwei Details beißen Leute. Das erste ist, dass `image.contentType` keine Dateiendung ist, und am Slash zu teilen ist eine Abkürzung, die `.jpeg` und `.svg+xml` erzeugt; bilden Sie das richtig ab, wenn die Dateinamen wichtig sind. Das zweite ist, dass Alt-Text in Word in einem Beschreibungsfeld lebt, das die meisten Autoren nie ausfüllen, `alt` ist also häufig leer, und das Barrierefreiheitsproblem in Ihrer Ausgabe ist geerbt, nicht eingeführt.

### Das messages-Array: der einzige Nachweis dessen, was verloren ging

Die zweite Eigenschaft am Ergebnis ist `messages`, ein Array von Objekten mit `type` — „warning“ oder „error“ —, einem `message`-String und einem optionalen `error`, das die geworfene Ausnahme hält, wenn es eine gab.

Das ist die am wenigsten genutzte API in der ganzen Kategorie. Kein anderer verbreiteter Konverter sagt Ihnen, was er nicht behandeln konnte. Pandoc zählt nicht auf, was es still normalisiert hat. Eine Kopieren-und-Einfügen-Konvertierung sagt Ihnen per Definition nichts. mammoth gibt Ihnen eine Liste.

```js
const { value, messages } = await mammoth.convertToHtml({ path: file });

const unmapped = messages.filter((m) => m.type === "warning");

if (unmapped.length) {
  console.warn(`${unmapped.length} things were not mapped:`);
  for (const m of unmapped) console.warn("  " + m.message);
}
```

Eine Warnung über einen unerkannten Style ist eine Anweisung, keine Beschwerde. Sie benennt einen Style, der im Dokument existiert und keine Regel in Ihrer Map hat, was heißt, dass diese Absätze als reine `p`-Elemente herauskamen. Fügen Sie der Style-Map eine Zeile hinzu, und die Warnung verschwindet zusammen mit dem Fehler. Lassen Sie es über einen Korpus echter Dokumente laufen, und die Warnungen werden eine nach Häufigkeit sortierte To-do-Liste.

Der operative Rat ist unverblümt: Machen Sie sie sichtbar. Loggen Sie sie in einem Build, zeigen Sie sie in einer Oberfläche, lassen Sie einen CI-Job fehlschlagen, wenn eine neue erscheint. Eine Konvertierungs-Pipeline, die `messages` wegwirft, ist eine Pipeline, die eine saubere Konvertierung nicht von einer kaputten unterscheiden kann, und Sie auch nicht.

## numbering.xml entscheidet, ob die Listen überhaupt überleben

Der am häufigsten gemeldete Fehler in dieser Kategorie ist eine nummerierte Liste, die als Folge reiner Absätze ankommt, und die Diagnose ist fast immer dieselbe.

Ein Listeneintrag in `document.xml` sieht so aus — ein Absatz mit Nummerierungseigenschaften und keinem anderen Hinweis auf seine Natur:

```xml
<w:p>
  <w:pPr>
    <w:numPr>
      <w:ilvl w:val="0"/>
      <w:numId w:val="4"/>
    </w:numPr>
  </w:pPr>
  <w:r><w:t>Approve the budget</w:t></w:r>
</w:p>
```

`w:ilvl` ist die Einrückungsebene. `w:numId` zeigt auf ein `w:num`-Element in `numbering.xml`, das auf eine `w:abstractNumId` zeigt, die ein `w:abstractNum`-Element identifiziert, das für jede Ebene ein `w:lvl` enthält, und *dort* sagt `w:numFmt` schließlich `bullet`, oder `decimal`, oder `lowerLetter`, oder `upperRoman`. Erst am Ende dieser Kette weiß irgendjemand, ob der Absatz in ein `ul` oder ein `ol` gehört.

Jedes Glied der Kette ist eine Stelle, an der sie brechen kann:

| Fehler | Ursache | Was Sie sehen |
| --- | --- | --- |
| `numbering.xml` fehlt | Das Dokument enthielt nie eine echte Liste | Absätze, die mit getippten „1.“-Zeichen beginnen |
| `numId` löst zu nichts auf | Der Teil wurde entfernt, oder das Dokument ist fehlerhaft | Absätze, kein Listen-Markup |
| Der Autor hat die Nummern getippt | Manuelles „1.“, „2.“, „3.“ ganz ohne `w:numPr` | Absätze, deren Text mit Ziffern beginnt |
| Die Liste ist ein Style, keine Nummerierung | Ein Style „List Paragraph“ mit Einrückung, aber ohne `numPr` | Eingerückte Absätze |
| Ebenen-Neustarts und `lvlOverride` | Word kann die Nummerierung mitten im Dokument neu starten | Korrektes Listen-Markup, falsche sichtbare Nummern |
| Benutzerdefinierter `lvlText` | Formate wie „Article 1.2 —“ | Ein `ol`, das im Browser ab 1 neu nummeriert |

Die letzten beiden sind die ehrliche Grenze statt eines Fehlers. HTMLs `ol` hat ein `start`-Attribut und sonst nichts. Es kann nicht ausdrücken „bei jeder Ebene-zwei-Gruppe bei 1 neu starten, aber die Ebene-eins-Folge fortsetzen“, und es hat kein Äquivalent zu einem benutzerdefinierten Ebenenformat-String. Ein Konverter, der die Struktur richtig hinbekommt, verliert trotzdem die sichtbaren Nummern, wenn das Dokument Words Nummerierung als Gesetzeszitationssystem benutzt hat. Tut Ihr Dokument das, sind die Nummern Inhalt, und Sie sollten erwägen, sie in den Text zu setzen.

Beachten Sie auch, was die Style-Map erreicht und was nicht. mammoths dokumentierte Matcher decken Absätze und ihre Styles, Runs und ihre Eigenschaften, Tabellen und Kommentarreferenzen ab. Listenbehandlung ist in den Konverter eingebaut statt etwas, das Sie mit einer Regel konfigurieren, die Abhilfe für eine kaputte Liste ist also eine Reparatur am Dokument — einen echten Listenstil anwenden — nicht eine Zeile in Ihrer Map. Diese Unterscheidung spart einen Nachmittag.

Dieselbe Kette erklärt, warum [sich Tabellen und Listen auf dem Weg hinaus so unterschiedlich verhalten](/blog/markdown-tables-that-survive-conversion): Die Struktur einer Tabelle steht direkt in `document.xml` als verschachtelte Elemente, während die Struktur einer Liste ein Fremdschlüssel ist.

## Die anderen Bibliotheken, und die verschiedenen Aufgaben, die sie erledigen

### docx-preview — Treue statt Semantik

docx-preview, aus dem docxjs-Repository, ist die entgegengesetzte Wette zu mammoth. Sein Ziel ist, eine `.docx` zu HTML darzustellen, das wie das Dokument aussieht, wobei das HTML so semantisch wie möglich bleibt, während akzeptiert wird, dass die Priorität das Erscheinungsbild ist. Der Haupteinstiegspunkt ist `renderAsync()`, das das Dokument als Blob und ein Zielelement nimmt und auflöst, wenn das Rendern fertig ist. `parseAsync()` und `renderDocument()` sind für die zwei Hälften getrennt verfügbar.

Seine Optionen sind der Verräter: `breakPages`, `ignoreWidth`, `ignoreHeight`, `renderHeaders`, `renderFooters`, `renderComments`, `useBase64URL`, `debug`. Das sind die Anliegen von etwas, das eine Seite zeichnet — Kopfzeilen, Fußzeilen, Seitenumbrüche, physische Abmessungen —, wovon nichts mammoth interessiert, denn eine Überschrift hat keine Höhe.

| Vorteile | Nachteile |
| --- | --- |
| Die Ausgabe ähnelt dem Dokument, Kopfzeilen und Seitenumbrüche eingeschlossen | Das Markup ist präsentativ; es ist kein Inhalt, den Sie speichern würden |
| Stellt Kommentare, Kopf- und Fußzeilen dar | Browser-orientiert; kein Node-Konvertierungsschritt |
| Optionen, um Seitengeometrie zu ignorieren, wenn Sie einen Reflow wollen | Die Bibliothek warnt, ihre Interna könnten sich ändern; nur `renderAsync` gilt als stabil |
| Kein Server-Roundtrip für eine Vorschau | Kein Weg zu Markdown oder zu sauberem HTML |

**Preis:** kostenlos, Apache-2.0 lizenziert.

**Für wen es ist.** Ein Viewer. Muss der Nutzer die Word-Datei in Ihrer App *sehen*, bevor er etwas entscheidet, ist das die Bibliothek. Müssen Sie *speichern*, was die Datei sagt, ist es die falsche — das Markup ist eine Darstellung, kein Dokument.

### docx4js — ein Parser, den Sie selbst steuern

docx4js parst Office-Dateien — primär `.docx`, `.pptx` seit Version 3.1.30, mit noch eingeschränktem `.xlsx` (beides in seiner README vermerkt, geprüft auf github.com/lalalic/docx4js, 8. September 2026) — und übergibt den Durchlauf Ihnen. Statt einen vollständigen Baum im Speicher zu bauen, läuft es durch das Dokument, erkennt Office-XML-Modelle und ruft Ihre Visitors auf, was den Speicherverbrauch bei großen Dateien niedrig hält. Das Rendern passiert über eine `createElement`-Funktion, die Sie bereitstellen, das Ausgabeformat ist also ganz Ihre Entscheidung.

Seine erkannten Modelle decken eine breite Fläche ab: Abschnitte, Kopfzeilen, Fußzeilen, Absätze, Tabellen, Formen, Bilder, Hyperlinks, Content-Controls einschließlich Checkboxen und Dropdowns, Felder, Formeln, Lesezeichen und Diagramme.

| Vorteile | Nachteile |
| --- | --- |
| Erkennt Konstrukte, die mammoth ignoriert — Felder, Formeln, Diagramme, Formularsteuerelemente | Sie schreiben die Ausgabeschicht selbst; kein HTML-Konverter ist enthalten |
| Streaming-artige Visitors statt eines vollständig geparsten Baums | Steilerer Einstieg als ein Einzeiler `convertToHtml` |
| Liest auch `.pptx` | Dokumentation ist dünn neben mammoths |
| MIT lizenziert | Die 2.x- und 3.x-Linien tragen Breaking Changes |

**Preis:** kostenlos, MIT lizenziert.

**Für wen es ist.** Für jeden, dessen Anforderung nicht HTML ist. Den Wert jedes Content-Controls zu extrahieren, die Diagramme aus hundert Berichten zu ziehen, einen eigenen Renderer für eine bestimmte Vorlage zu bauen — das sind docx4js-Aufgaben, und mammoth dafür zu nehmen heißt, gegen eine Bibliothek zu kämpfen, die genau dafür gebaut ist, dieses Material wegzuwerfen.

### docxtemplater — eine ganz andere Aufgabe

docxtemplater taucht bei jeder Suche nach docx-Bibliotheken auf, und es liest Dokumente nicht in dem Sinn, den Sie meinen. Es ist eine Template-Engine, die `.docx`, `.pptx` und `.xlsx` **erzeugt**, indem sie eine Word-Datei mit Platzhaltern wie `{first_name}` nimmt und diese durch Ihre Daten ersetzt. Der Ablauf ist: die Vorlagendatei lesen, in PizZip laden, einen `Docxtemplater` konstruieren, mit Ihren Daten `render()` aufrufen, und den Puffer herausschreiben.

Die eigene Dokumentation ist ausdrücklich, dass sowohl docxtemplater als auch PizZip vom selben Team kommen, und dass zusätzliche Fähigkeiten über kostenpflichtige Module ankommen — ein Bildmodul für `{%image}`, ein HTML-Modul zum Einfügen formatierten Texts in eine `.docx`, dazu Diagramm-, XLSX-, Styling-, Fußnoten-, Tabellen-, QR-Code- und Fehlerort-Module unter anderem.

| Vorteile | Nachteile |
| --- | --- |
| Das richtige Werkzeug, um Word-Dateien aus Daten und einer entworfenen Vorlage zu erzeugen | Konvertiert kein bestehendes Dokument in irgendetwas |
| Erhält den Style der Vorlage exakt, weil die Vorlage *eine* `.docx` ist | Kern ist kostenlos; mehrere Fähigkeiten liegen hinter kostenpflichtigen Modulen |
| Dual lizenziert MIT oder GPL-3.0 | Die Vorlage muss dafür verfasst werden |
| Langfristig gepflegt, der Autor beschreibt es als sein Hauptwerk | Platzhalter in Word können über Runs verteilt sein, eine eigene Fehlerklasse |

**Preis:** kostenlos, dual lizenziert unter MIT oder GPL Version 3. Kostenpflichtige Module werden vom Anbieter separat bepreist; die eigene Seite für aktuelle Zahlen prüfen.

**Für wen es ist.** Verträge, Rechnungen, Zertifikate, Angebotsschreiben — alles, wo ein Mensch das Layout in Word entworfen hat und ein Programm die Werte liefert. Niemand, der ein Dokument nach HTML konvertiert, braucht es, und eine überraschende Zahl von Leuten installiert es, bevor sie das merken.

Diese Fußnote zum Run-Splitting ist kein Seitenhieb. Es ist dieselbe Tatsache aus dem ersten Abschnitt, von der schreibenden Seite gesehen: `{first_name}` kann als `{first_` + `name}` über zwei Runs verteilt gespeichert sein, wegen einer Bearbeitung vor Monaten, und jede docx-Template-Engine muss damit umgehen.

### docx von dolanmiu — Erzeugung, deklarativ

Das npm-Paket, das wörtlich `docx` heißt, erzeugt und ändert `.docx`-Dateien aus einer deklarativen TypeScript-API — `Document`, `Paragraph`, `TextRun`, `Table`, Kopf- und Fußzeilen, Bilder — und läuft in Node und im Browser. Es ist MIT lizenziert.

**Für wen es ist.** Code, der einem Nutzer eine Word-Datei aushändigen muss. Es sitzt auf der anderen Seite der Konvertierung von mammoth, und die zwei werden oft in derselben Anwendung benutzt: mammoth rein, `docx` raus.

### python-docx — das Referenz-Objektmodell

Ist Ihre Pipeline Python, ist python-docx der entsprechende Ausgangspunkt, und es ist eine wirklich andere Art Werkzeug: Statt zu konvertieren, gibt es Ihnen ein Objektmodell zum Durchlaufen und Bearbeiten. `Document`, `Paragraph`, `Run`, `Table` mit `Row`, `Column` und `Cell`, `Section`, `Font` und `ParagraphFormat`, dazu Styles, Kommentare und Formen. Seine Dokumentation trägt eigene Abschnitte für Kopf- und Fußzeilen und für Kommentare (geprüft auf python-docx.readthedocs.io, 8. September 2026), und es ist MIT lizenziert.

| Vorteile | Nachteile |
| --- | --- |
| Liest und schreibt mit einem Objektmodell | Keine HTML-Ausgabe; Sie schreiben den Serialisierer |
| Dokumentierte API für Styles, Abschnitte, Kopf- und Fußzeilen und Kommentare | Nachverfolgte Änderungen sind nicht Teil der dokumentierten API |
| Natürlich in einem Python-Build oder einer Datenpipeline | Nur Python |
| MIT lizenziert | Mehr Code als ein Konverter für eine Konvertierungsaufgabe |

**Für wen es ist.** Extraktion und Transformation statt Konvertierung — jede Tabelle aus einer Reihe von Berichten in einen Dataframe ziehen, eine Klausel in zweihundert Verträgen umschreiben, prüfen, welche Dokumente einen veralteten Style benutzen. Ist die Anforderung „docx nach HTML“ und die Sprache Python, ist zu Pandoc auszushellen meist weniger Code, als einen Serialisierer darauf zu bauen.

### Pandoc als Subprozess — der pragmatische Trick

Die Option, die Leute vergessen: Das Dokument gar nicht selbst parsen. Pandoc ausführen und die Ausgabe lesen.

```js
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

const run = promisify(execFile);

const { stdout } = await run("pandoc", [
  "-f", "docx",
  "-t", "html",
  "--extract-media=./media",
  "--track-changes=all",
  "--sandbox",
  "quarterly.docx",
]);
```

Pandocs `.docx`-Reader behandelt Fußnoten, Tabellen, nachverfolgte Änderungen und vieles mehr, was eine JavaScript-Bibliothek nicht tut, und `--extract-media` schreibt die Bilder für Sie aus. `--track-changes` ist das Flag, dessen Fehlen die meiste Verwirrung stiftet: Ein durchgesehenes Dokument hat Einfügungen und Löschungen darin, und Sie sollten bewusst wählen, ob Sie sie angenommen, abgelehnt oder annotiert wollen, statt zu nehmen, was auch immer der Standard ist. `--sandbox` beschränkt Dateisystemzugriff, wenn das Dokument nicht Ihres ist.

| Vorteile | Nachteile |
| --- | --- |
| Behandelt Fußnoten, nachverfolgte Änderungen und Konstrukte, die keine JS-Bibliothek erreicht | Ein externes Binary auf jeder Maschine, die Ihren Code ausführt |
| Ein Befehl, kein Parser zu pflegen | Im Browser unmöglich, und in den meisten Serverless-Laufzeiten unbequem |
| Konvertiert vom selben Aufruf aus weiter zu Dutzenden anderer Formate | Kein `messages`-Äquivalent: sagt Ihnen nicht, was es normalisiert hat |
| GPL lizenziert und langlebig | HTML ist Pandoc-eigen; Sie werden trotzdem nachbearbeiten |

**Für wen es ist.** Server-seitige Stapelarbeit, wo Sie die Umgebung kontrollieren. Es ist weit häufiger die richtige Antwort, als Bibliothekstreue nahelegt, und die falsche in dem Moment, in dem der Code in einem Browser oder einem Container laufen muss, den Sie nicht gebaut haben.

LibreOffice headless verdient dieselbe Fußnote: `soffice --headless --convert-to html` liest Dateien, die nichts anderes liest, einschließlich altes binäres `.doc`, und ist auch rein als Vorverarbeiter nützlich — die seltsame Datei zuerst zu sauberer `.docx` konvertieren, dann das an mammoth übergeben.

## Wo mammoth die falsche Antwort ist, und was das kostet

Die Empfehlung am Anfang dieses Artikels hat echte Grenzen, und es lohnt sich, sie klar zu benennen, denn sie sind die, die nach dem Deployment Beschwerden erzeugen.

**Direkte Formatierung ist weg, und das ist Absicht.** Ein Dokument, in dem der Autor nie Styles benutzt hat — alles ist Normal, mit von Hand angewendetem Fett und 18pt — konvertiert zu einer Wand aus `p`-Elementen. mammoth verhält sich korrekt: Es gibt keine semantische Information in dieser Datei zu nutzen. Die Kosten sind, dass die Reparatur nicht in Ihrem Code liegt. Jemand muss echte Styles auf das Dokument anwenden, oder Sie müssen Style-Map-Regeln gegen Run-Eigenschaften schreiben und das Rätselraten akzeptieren. Planen Sie das Gespräch ein.

**Layout existiert nicht in der Ausgabe.** Keine Seitengröße, keine Ränder, keine Spalten, keine Kopfzeilen, keine Fußzeilen, keine Seitenumbrüche. Enthält die Anforderung das Wort „drucken“, ist mammoth nicht das Werkzeug; docx-preview oder ein PDF-Weg ist es.

**Textfelder, Formen und SmartArt landen ungleichmäßig.** Inhalt in einem schwebenden Textfeld ist nicht im Fluss des Dokuments, und jeder HTML-Konverter muss entscheiden, wohin damit. Prüfen Sie ein Dokument, das solche benutzt, bevor Sie irgendetwas versprechen.

**Felder sind Werte, keine Formeln.** Ein Seitenzahlfeld, eine Querverweis, ein Inhaltsverzeichnisfeld, ein berechnetes Feld — all das sind Anweisungen in der Datei, plus ein gecachtes letztes Ergebnis. HTML kennt keine Felder. Was Sie bekommen, ist bestenfalls der gecachte Text, und ein Inhaltsverzeichnis konvertiert nur dann zu einer Linkliste, wenn das Dokument gut genug gebaut wurde, dass die Anker existieren.

**Der Markdown-Writer ist veraltet.** mammoth hat ein `convertToMarkdown`, und seine Dokumentation sagt unverblümt, „Markdown-Unterstützung ist veraltet“, und empfiehlt stattdessen HTML plus eine separate HTML-zu-Markdown-Bibliothek als voraussichtlich bessere Ergebnisse. Nehmen Sie den Rat an. Konvertieren Sie nach HTML, und lassen Sie dann einen eigenen Konverter laufen — die Wahl unter [den HTML-zu-Markdown-Bibliotheken](/blog/best-html-to-markdown-converters) zählt mehr, als es klingt, denn dort entscheiden Sie, was mit Markup passiert, das Markdown nicht ausdrücken kann.

**Sehr große Dateien sind eine Speicherfrage, besonders im Browser.** Das ganze Archiv wird gelesen, Bilder eingeschlossen. Ein 30-MB-Dokument mit hochauflösenden Screenshots bläht sich in der Ausgabe als Base64 weiter auf, und ein Tab hat weniger Spielraum als ein Server. Deshalb begrenzen gehostete Konverter die Upload-Größe; TransformPipe begrenzt eine Konvertierung auf 10 MB und ein gespeichertes Dokument auf 4 MB, Letzteres, weil eine Vercel-Function eine Anfrage oder Antwort über 4,5 MB ablehnt. Was auch immer Sie bauen, wird ebenfalls eine Grenze brauchen, und sie bewusst zu wählen ist besser, als sie zu entdecken.

**Ein einzelnes Dokument ist kein Bibliotheksproblem.** Braucht jemand heute eine einzelne `.docx` als HTML oder Markdown, ist ein Parser zu installieren und eine Style-Map zu schreiben der teure Weg. [Die Konverter, die es schon gibt](/blog/best-word-to-markdown-converters), erledigen es in einem Browser-Tab. Greifen Sie zu einer Bibliothek, wenn die Konvertierung eine Funktion ist, keine Besorgung.

## Wie Sie eine docx-Bibliothek wählen

1. **Entscheiden Sie, ob Sie die Bedeutung oder das Erscheinungsbild wollen, bevor Sie irgendetwas vergleichen.** Beides zu wollen ist der teuerste Fehler hier, denn er schickt Sie zu einem Treue-Renderer für Inhaltsspeicherung, und das präsentative Markup, das Sie zurückbekommen, wird jahrelang in Ihrer Datenbank sitzen.
2. **Prüfen Sie, wo der Code läuft.** Ein Browser schließt jeden Subprozess aus und lässt Ihnen mammoth oder docx-preview; ein kontrollierter Server macht Pandoc zu einem ernsthaften Kandidaten, der Sie fast keinen Code kostet.
3. **Sehen Sie sich zehn echte Dokumente an, bevor Sie die Style-Map schreiben, und zählen Sie die Styles.** Haben die Autoren echte benannte Styles benutzt, erzeugt mammoth beim ersten Durchlauf gutes HTML; haben sie von Hand formatiert, wird das keine Bibliothek, und das früh zu wissen macht aus einem Code-Problem ein Vorlagen-Problem.
4. **Bestätigen Sie, dass die Bibliothek liest statt schreibt.** docxtemplater und `docx` sind beide exzellent, und keines konvertiert Ihre Datei, den ersten Absatz einer README zu lesen erspart also einen Nachmittag Verwirrung.
5. **Verdrahten Sie die Warnungen am ersten Tag.** Bei mammoth ist das das `messages`-Array; bei allem anderen sind es Ihre eigenen Prüfungen der Ausgabe, denn Schweigen von einem Konverter ist kein Beweis, dass etwas funktioniert hat.
6. **Testen Sie ein Dokument mit einer nummerierten Liste, eins mit Bildern, und eins, das eine Durchsicht durchlaufen hat.** Diese drei decken die drei Ketten ab, die brechen — `numbering.xml`, den Beziehungsteil, und Revisionsmarkierungen — und kommen alle drei richtig heraus, tun es die gewöhnlichen Dokumente auch.

## Fazit

In JavaScript heißt, eine `.docx` zu lesen und brauchbares HTML zu bekommen, mammoth, und es gut zu benutzen heißt, seinen Handel zu akzeptieren: Sie bekommen sauberes semantisches Markup, weil es benannte Styles abbildet und Präsentation verwirft, die Qualität Ihrer Ausgabe wird also von der Qualität der Styles des Dokuments bestimmt und von der Style-Map, die Sie dagegen schreiben. Lesen Sie `messages`, und die Bibliothek sagt Ihnen genau, wo diese Map zu kurz greift. Wählen Sie `convertImage` bewusst, statt eine Seite voller Base64 auszuliefern. Ist die Aufgabe, ein Dokument anzusehen statt zu speichern, was es sagt, nehmen Sie docx-preview; ist sie, Felder oder Diagramme zu extrahieren, nehmen Sie docx4js; ist sie, eine Word-Datei zu erzeugen, nehmen Sie `docx` oder docxtemplater; und läuft der Code auf einem Server, den Sie kontrollieren, ist Pandoc als Subprozess weniger Arbeit als alle davon. Für eine einzelne Datei ist gar keine Bibliothek nötig — [sie in einen Browser-Konverter zu ziehen](/word-to-markdown) dauert etwa zehn Sekunden und lädt nichts hoch.

## FAQ

### Wie konvertiere ich eine .docx in JavaScript zu HTML?

Benutzen Sie mammoth: `mammoth.convertToHtml({path: "file.docx"})` in Node, oder `mammoth.convertToHtml({arrayBuffer: buffer})` im Browser mit dem `mammoth.browser.js`-Build. Das Ergebnis hat eine `value`-Eigenschaft mit dem HTML und ein `messages`-Array, das auflistet, was nicht abgebildet werden konnte. Fügen Sie eine `styleMap` für benutzerdefinierte Word-Styles hinzu, die Ihre Dokumente verwenden.

### Warum fehlt in mammoths Ausgabe meine Formatierung?

Weil das Absicht ist. mammoth bildet semantische Information — benannte Styles — auf HTML-Elemente ab und verwirft direkte Formatierung wie Farbe, Schriftgröße und Ausrichtung. Haben die Autoren des Dokuments Fett und 18pt von Hand angewendet statt einen Heading-Style zu nutzen, gibt es nichts für mammoth abzubilden, und die Abhilfe ist, das Dokument richtig zu stylen oder stattdessen Style-Map-Regeln gegen Run-Eigenschaften zu schreiben.

### Warum haben sich meine nummerierten Listen zu reinen Absätzen konvertiert?

Fast immer, weil die Liste nie eine echte Liste war. Word speichert Listenzugehörigkeit als `w:numId`, das über `numbering.xml` aufgelöst wird, fehlt dieser Teil also, löst die ID nicht auf, oder hat der Autor „1.“ und „2.“ von Hand getippt, sieht der Konverter gewöhnliche Absätze. Wenden Sie in Word einen echten Listenstil an und konvertieren Sie erneut.

### Kann ich eine .docx im Browser lesen, ohne sie hochzuladen?

Ja. `mammoth.browser.js` liest die `arrayBuffer()` eines `File`-Objekts und konvertiert vollständig auf der Seite, nichts wird also an einen Server gesendet. So funktionieren browserbasierte Word-Konverter, und Sie können das bei jedem von ihnen bestätigen, indem Sie während einer Konvertierung den Netzwerk-Tab beobachten.

### Sollte ich mammoths convertToMarkdown benutzen?

Nein. Die eigene Dokumentation markiert Markdown-Unterstützung als veraltet und empfiehlt, HTML zu erzeugen und das an eine eigene HTML-zu-Markdown-Bibliothek zu übergeben. HTML hat für die meisten Dinge, die eine `.docx` enthält, ein Element, Markdown nicht, der zweistufige Weg gibt der zweiten Bibliothek also mehr, womit sie arbeiten kann.

### Was ist der Unterschied zwischen mammoth und docx-preview?

Sie optimieren für Gegensätzliches. mammoth erzeugt sauberes semantisches HTML aus benannten Styles und ignoriert das Erscheinungsbild; docx-preview stellt das Dokument dar, sodass es der gedruckten Seite ähnelt, mit Optionen für Seitenumbrüche, Kopf- und Fußzeilen. Nehmen Sie mammoth, wenn Sie Inhalt behalten wollen, und docx-preview, wenn ein Nutzer die Datei ansehen muss.

### Kann ich die .docx einfach selbst entzippen und das XML parsen?

Sie können, und das Entzippen ist einfach. Der schwere Teil ist, dass Bedeutung über Verweise gespeichert ist: Styles in `styles.xml`, Listen in `numbering.xml`, Bilder und Links im Beziehungsteil, und Text beliebig über Runs verteilt, sodass ein einzelnes Wort drei Elemente sein kann. Diese Verweisauflösung ist das meiste von dem, was eine Bibliothek ausmacht, und sie neu zu implementieren ist ein Projekt, keine Aufgabe.
