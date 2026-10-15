import type { Content } from '../../content';

/*
 * Wie jede Umwandlung heißt und was ihre Seite sagt.
 *
 * Welche Umwandlungen es gibt, steht weiterhin in `shared/conversions.ts` und muss dort stehen:
 * der Server importiert diese Datei für den Parameter `kind` der API, und der Server hat kein
 * Locale, eine Liste, die er liest, kann also keine Sprache tragen. Dort bleibt nur, was in jeder
 * Sprache gleich ist — die id, das Ziel, die Adresse, die Endungen. Alles, was ein Leser wirklich
 * sieht, steht hier, geschlüsselt nach derselben `ConversionId`, sodass eine fünfte Sprache eine
 * sechste Datei ist und nicht eine sechste Kopie der Liste.
 *
 * `seo` ist, was die vorgerenderte Seite einem Crawler und in einem Suchergebnis sagt — darum
 * Worte und nicht Identität: die Adresse, an der es steht, ist fest, der Satz an dieser Adresse
 * nicht.
 */

export const conversions: Content['conversions'] = {
  'markdown-to-html': {
    label: 'Markdown → HTML',
    short: 'MD → HTML',
    title: 'Markdown in HTML',
    blurb:
      'Eine Markdown-Datei hochladen — das gerenderte HTML sofort sehen und als fertiges Dokument herunterladen. Umgewandelt wird im Browser, und sobald Sie angemeldet sind, erreichen Ihre Dokumente Claude und ChatGPT über den MCP-Connector.',
    hint: 'Eine .md-Datei hochladen und genau sehen, wie sie in HTML aussehen wird. Mehrere zugleich ablegen, und sie werden in der gewählten Reihenfolge zu einem Dokument verkettet.',
    seo: {
      title: 'TransformPipe — Markdown in HTML umwandeln',
      description:
        'Markdown in HTML umwandeln, direkt im Browser: gerendertes Dokument und eigenständige .html. Dazu 14 weitere Formate nach Markdown und ein MCP-Connector für Claude.',
    },
  },
  'html-to-markdown': {
    label: 'HTML → Markdown',
    short: 'HTML → MD',
    title: 'HTML in Markdown',
    blurb:
      'Eine HTML-Datei hochladen — oder eine gespeicherte Seite — und Markdown zurückbekommen, mit Überschriften, Links, Listen und Tabellen intakt.',
    hint: 'Eine .html-Datei hochladen und Markdown bekommen. Tabellen, Aufgabenlisten und Codeblöcke überleben; die Gestaltung nicht, denn Markdown hat keine.',
    seo: {
      title: 'HTML in Markdown umwandeln — TransformPipe',
      description:
        'HTML in Markdown umwandeln: aus einer HTML-Datei oder gespeicherten Seite wird sauberes Markdown, mit Tabellen und Codeblöcken. Im Browser, nichts wird gesendet.',
    },
  },
  'word-to-markdown': {
    label: 'Word → Markdown',
    short: 'DOCX → MD',
    title: 'Word in Markdown',
    blurb:
      'Eine .docx hochladen und Markdown bekommen: Überschriften, Listen, Links und Tabellen kommen mit, Schriften und Ränder nicht.',
    hint: 'Eine .docx aus Word, Google Docs oder LibreOffice hochladen. Zurück kommt die Struktur des Dokuments als Markdown — nicht sein Layout.',
    seo: {
      title: 'Word (.docx) in Markdown umwandeln — TransformPipe',
      description:
        'Word in Markdown umwandeln, direkt im Browser: Überschriften, Listen, Links und Tabellen bleiben, die Formatierung nicht. Es wird nichts hochgeladen.',
    },
  },
  'csv-to-markdown': {
    label: 'CSV → Markdown-Tabelle',
    short: 'CSV → MD',
    title: 'CSV in eine Markdown-Tabelle',
    blurb:
      'Eine CSV oder TSV hochladen und eine Markdown-Tabelle bekommen, mit der ersten Zeile als Kopf und ausgerichteten Spalten.',
    hint: 'Eine .csv oder .tsv hochladen. Felder in Anführungszeichen, Kommas darin und Zeilenumbrüche in Zellen werden alle beherrscht.',
    seo: {
      title: 'CSV in Markdown-Tabelle umwandeln — TransformPipe',
      description:
        'Eine CSV- oder TSV-Datei in eine Markdown-Tabelle umwandeln, mit Feldern in Anführungszeichen und Kommas darin. Läuft im Browser; nichts wird hochgeladen.',
    },
  },
  'json-to-markdown': {
    label: 'JSON → Markdown',
    short: 'JSON → MD',
    title: 'JSON in Markdown',
    blurb:
      'Eine JSON-Datei hochladen und als Dokument lesen: eine Liste von Datensätzen wird eine Tabelle, ein Objekt wird zu Abschnitten mit seinen Feldern darüber.',
    hint: 'Eine .json-Datei hochladen. Eine Liste von Datensätzen wird eine Tabelle, verschachtelte Objekte werden Überschriften. Ein Wert je Zeile — ein Log-Export — wird ebenfalls verstanden.',
    seo: {
      title: 'JSON in Markdown umwandeln — TransformPipe',
      description:
        'JSON in lesbares Markdown umwandeln: Arrays von Datensätzen werden Tabellen, Objekte werden Abschnitte. Läuft im Browser; nichts wird hochgeladen.',
    },
  },
  'notion-to-markdown': {
    label: 'Notion → Markdown',
    short: 'Notion → MD',
    title: 'Notion-Export in Markdown',
    blurb:
      'Die .zip aus Notions „Export as Markdown & CSV“ hochladen und jede Seite als eigenes Dokument erhalten, in Ordnern so verschachtelt wie in Notion — Datenbanken als Tabellen. Oder alles als ein Dokument.',
    hint: 'Die .zip aus Notion hochladen. Jede Seite wird ein Abschnitt mit eigener Überschrift, in der ursprünglichen Reihenfolge; eine Datenbank wird eine Tabelle.',
    seo: {
      title: 'Notion-Export in Markdown umwandeln — TransformPipe',
      description:
        'Eine .zip aus Notions „Export as Markdown & CSV“ in ein Markdown-Dokument umwandeln, Seiten der Reihe nach mit Inhaltsverzeichnis. Läuft im Browser; nichts wird hochgeladen.',
    },
  },
  'confluence-to-markdown': {
    label: 'Confluence → Markdown',
    short: 'Confluence → MD',
    title: 'Confluence-Export in Markdown',
    blurb:
      'Die .zip aus dem „Export → HTML“ eines Confluence-Space hochladen und jede Seite als eigenes Markdown erhalten, in Ordnern nach dem Seitenbaum des Space, Links zwischen den Seiten funktionieren weiter. Oder alles als ein Dokument.',
    hint: 'Die .zip eines Confluence-Space-Exports hochladen. Jede Seite wird ein Abschnitt mit eigener Überschrift, in der ursprünglichen Reihenfolge.',
    seo: {
      title: 'Confluence-Export in Markdown umwandeln — TransformPipe',
      description:
        'Eine .zip aus einem Confluence-HTML-Export in ein Markdown-Dokument umwandeln, Seiten der Reihe nach mit Inhaltsverzeichnis. Läuft im Browser; nichts wird hochgeladen.',
    },
  },
  'obsidian-to-markdown': {
    label: 'Obsidian → Markdown',
    short: 'Obsidian → MD',
    title: 'Obsidian-Vault in Markdown',
    blurb:
      'Einen gezippten Obsidian-Vault hochladen und jede Notiz als eigenes Dokument erhalten, in den Ordnern des Vaults, Wikilinks als reiner Text. Oder alles als ein Dokument.',
    hint: 'Die .zip eines Obsidian-Vault-Ordners hochladen. Jede Notiz wird ein Abschnitt mit eigener Überschrift, in der ursprünglichen Reihenfolge.',
    seo: {
      title: 'Obsidian-Vault in Markdown umwandeln — TransformPipe',
      description:
        'Einen gezippten Obsidian-Vault in ein Markdown-Dokument umwandeln, Notizen der Reihe nach mit Inhaltsverzeichnis, Wikilinks als Text erhalten. Läuft im Browser; nichts wird hochgeladen.',
    },
  },
  'text-to-markdown': {
    label: 'Reintext → Markdown',
    short: 'TXT → MD',
    title: 'Reintext in Markdown',
    blurb:
      'Eine .txt-Datei hochladen, die nie als Markdown gedacht war, und Markdown erhalten, das genau das sagt, was dastand — ein zufälliges Sternchen oder ein Unterstrich wird nicht zu einer Hervorhebung.',
    hint: 'Eine .txt-Datei hochladen. Markdowns eigene Zeichen — *, _, #, ein führender Bindestrich — werden maskiert, damit der Text genau so erscheint, wie er geschrieben wurde.',
    seo: {
      title: 'Reintext in Markdown umwandeln — TransformPipe',
      description:
        'Reintext in Markdown umwandeln, ohne dass eigene Zeichen als Formatierung missverstanden werden — Sternchen, Unterstriche und Zeilenumbrüche bleiben erhalten. Läuft im Browser; nichts wird hochgeladen.',
    },
  },
  'powerpoint-to-markdown': {
    label: 'PowerPoint → Markdown',
    short: 'PPTX → MD',
    title: 'PowerPoint in Markdown',
    blurb:
      'Eine .pptx hochladen und pro Folie einen Abschnitt erhalten, in der Reihenfolge der Präsentation — samt Notizen, also der Hälfte eines Foliensatzes, die außerhalb des Raums niemand zu lesen bekommt.',
    hint: 'Eine .pptx hochladen. Jede Folie wird ein Abschnitt unter ihrem eigenen Titel, Aufzählungen bleiben Aufzählungen und Tabellen bleiben Tabellen — die Notizen kommen zu jeder Folie mit.',
    seo: {
      title: 'PowerPoint in Markdown umwandeln — TransformPipe',
      description:
        'Eine PowerPoint-.pptx in Markdown umwandeln: ein Abschnitt je Folie, mit Aufzählungen, Tabellen und Notizen. Läuft im Browser; nichts wird hochgeladen.',
    },
  },
  'epub-to-markdown': {
    label: 'EPUB → Markdown',
    short: 'EPUB → MD',
    title: 'Ein EPUB-Buch in Markdown',
    blurb:
      'Eine .epub hochladen und das ganze Buch als ein Dokument erhalten — die Kapitel in Lesereihenfolge, unter den Titeln aus dem Inhaltsverzeichnis, mit den Bildern darin.',
    hint: 'Eine .epub hochladen. Die Lesereihenfolge stammt aus der Spine des Buchs und nicht aus den Dateinamen; jedes Kapitel wird ein Abschnitt.',
    seo: {
      title: 'EPUB in Markdown umwandeln — TransformPipe',
      description:
        'Ein EPUB-Buch in ein Markdown-Dokument umwandeln: Kapitel in Lesereihenfolge, Inhaltsverzeichnis und Bilder inbegriffen. Läuft im Browser; nichts wird hochgeladen.',
    },
  },
  'odt-to-markdown': {
    label: 'ODT → Markdown',
    short: 'ODT → MD',
    title: 'Eine OpenDocument-Datei in Markdown',
    blurb:
      'Eine .odt hochladen — das Format von LibreOffice, OpenOffice und eines Google-Docs-Downloads — und Markdown mit ihren Überschriften, Listen, Tabellen, Fußnoten und Bildern erhalten.',
    hint: 'Eine .odt hochladen. Dieses Format nennt seine Überschriftenebenen selbst, es wird also nichts geraten: Listen behalten ihre Verschachtelung, Tabellen bleiben Tabellen, Fußnoten bleiben Fußnoten.',
    seo: {
      title: 'ODT in Markdown umwandeln — TransformPipe',
      description:
        'Eine LibreOffice- oder OpenDocument-.odt in Markdown umwandeln, mit Überschriften, Listen, Tabellen, Fußnoten und Bildern. Läuft im Browser; nichts wird hochgeladen.',
    },
  },
  'rtf-to-markdown': {
    label: 'Rich Text → Markdown',
    short: 'RTF → MD',
    title: 'Rich Text in Markdown',
    blurb:
      'Eine .rtf hochladen — was TextEdit, WordPad und die meisten Programme schreiben, wenn man Text aus ihnen herauszieht — und Markdown statt einer Wand aus Steuerwörtern erhalten.',
    hint: 'Eine .rtf hochladen. Fett, kursiv, Links, Listen und Tabellen kommen mit; eine Überschrift wird aus der Gliederungsebene gelesen, wo eine gesetzt wurde, und sonst aus der Schriftgröße.',
    seo: {
      title: 'RTF in Markdown umwandeln — TransformPipe',
      description:
        'Eine Rich-Text-.rtf in Markdown umwandeln: fett, kursiv, Links, Listen und Tabellen bleiben, Überschriften werden erkannt. Läuft im Browser; nichts wird hochgeladen.',
    },
  },
  'evernote-to-markdown': {
    label: 'Evernote → Markdown',
    short: 'ENEX → MD',
    title: 'Ein Evernote-Export in Markdown',
    blurb:
      'Eine .enex hochladen und jede Notiz als Abschnitt eines einzigen Dokuments erhalten — mit ihren Schlagwörtern, ihrem Datum, ihren Kästchen und ihren Bildern.',
    hint: 'Eine .enex aus Datei, Notizen exportieren hochladen. Schlagwörter stehen unter dem Titel jeder Notiz, Kästchen werden eine Aufgabenliste, und ein Bild wird über den Hash zugeordnet, mit dem das Format die beiden verbindet.',
    seo: {
      title: 'Evernote-ENEX in Markdown umwandeln — TransformPipe',
      description:
        'Einen Evernote-.enex-Export in ein Markdown-Dokument umwandeln: jede Notiz ein Abschnitt, mit Schlagwörtern, Daten, Kästchen und Bildern. Läuft im Browser.',
    },
  },
  'excel-to-markdown': {
    label: 'Excel → Markdown-Tabelle',
    short: 'XLSX → MD',
    title: 'Excel in eine Markdown-Tabelle',
    blurb:
      'Eine .xlsx hochladen und für jedes Tabellenblatt mit Zeilen eine Markdown-Tabelle erhalten — bei mehreren kommt ein Inhaltsverzeichnis dazu.',
    hint: 'Eine .xlsx-Arbeitsmappe hochladen. Die erste Zeile jedes Blatts wird zur Tabellenüberschrift; Datumswerte erscheinen als reine ISO-Daten statt als Excels eigene Seriennummern.',
    seo: {
      title: 'Excel in Markdown-Tabelle umwandeln — TransformPipe',
      description:
        'Eine Excel-.xlsx-Arbeitsmappe in Markdown-Tabellen umwandeln, eine pro Blatt mit Inhaltsverzeichnis. Läuft im Browser; nichts wird hochgeladen.',
    },
  },
  'markdown-to-confluence': {
    label: 'Markdown → Confluence',
    short: 'MD → Confluence',
    title: 'Markdown in Confluence',
    blurb:
      'Eine Markdown-Datei hochladen und Confluence-Speicherformat erhalten — Codeblöcke als Code-Makro, Hinweise als Info- und Warnungsbereiche, Aufgabenlisten mit echten Kästchen und Links, die zu ihrer Überschrift springen.',
    hint: 'Eine .md-Datei hochladen. „Für Confluence kopieren“ fügt im Cloud-Editor formatiert ein und als Speicherformat im Quelltext-Editor oder über die REST-API.',
    seo: {
      title: 'Markdown in Confluence-Speicherformat umwandeln — TransformPipe',
      description:
        'Markdown in Confluence-Speicherformat umwandeln: Code-Makros, Info- und Warnungsbereiche, Aufgabenlisten und Überschriften-Links. Direkt im Browser, ohne Upload.',
    },
  },
  'markdown-to-jira': {
    label: 'Markdown → Jira',
    short: 'MD → Jira',
    title: 'Markdown in Jira-Wiki-Markup',
    blurb:
      'Eine Markdown-Datei hochladen und Jira-Wiki-Markup erhalten — h2.-Überschriften, *fett*, {code}-Blöcke mit ihrer Sprache, ||Tabellen|| und Bereiche für Hinweise — so maskiert, dass nichts versehentlich zur Formatierung wird.',
    hint: 'Eine .md-Datei hochladen. Das Markup gehört in den Textmodus von Jira, einen v2-REST-Aufruf oder eine Automatisierungsregel; „Für Jira kopieren“ fügt in Jira Cloud auch formatiert ein.',
    seo: {
      title: 'Markdown in Jira-Wiki-Markup umwandeln — TransformPipe',
      description:
        'Markdown in Jira-Wiki-Markup umwandeln: Überschriften, Fettdruck, Codeblöcke mit Sprache, Tabellen und Bereiche, sauber maskiert. Direkt im Browser, ohne Upload.',
    },
  },
  'markdown-to-slack': {
    label: 'Markdown → Slack',
    short: 'MD → Slack',
    title: 'Markdown in Slack-mrkdwn',
    blurb:
      'Eine Markdown-Datei hochladen und Slacks mrkdwn erhalten — Fettdruck mit einem Sternchen, <Links|mit Worten>, Aufzählungen nach Ebene und Tabellen als ausgerichtete Codeblöcke — bereit für einen Bot, einen Webhook oder einen Workflow.',
    hint: 'Eine .md-Datei hochladen. Das mrkdwn ist, was ein API-Aufruf oder ein Webhook sendet; „Für Slack kopieren“ fügt auch formatiert in Slacks Nachrichtenfeld ein.',
    seo: {
      title: 'Markdown in Slack-mrkdwn umwandeln — TransformPipe',
      description:
        'Markdown in Slack-mrkdwn für Bots, Webhooks und Workflows umwandeln: Fettdruck, Links, Listen und Tabellen als Codeblöcke. Direkt im Browser, ohne Upload.',
    },
  },
  'markdown-to-epub': {
    label: 'Markdown → EPUB',
    short: 'MD → EPUB',
    title: 'Markdown in ein EPUB-Buch',
    blurb:
      'Eine Markdown-Datei hochladen und eine .epub erhalten, die jeder E-Reader öffnet — ein Kapitel pro oberster Überschrift, ein Inhaltsverzeichnis, und Bilder, Formeln und Diagramme im Buch.',
    hint: 'Eine .md-Datei hochladen. Kapitel entstehen an den Überschriften, die sich wiederholen; ein im Dokument eingebettetes Bild reist im Buch mit.',
    seo: {
      title: 'Markdown in EPUB umwandeln — TransformPipe',
      description:
        'Eine Markdown-Datei in ein EPUB-3-Buch umwandeln: Kapitel aus den Überschriften, Inhaltsverzeichnis, Bilder, Formeln und Diagramme. Direkt im Browser erstellt.',
    },
  },
  'markdown-to-word': {
    label: 'Markdown → Word',
    short: 'MD → Word',
    title: 'Markdown in ein Word-Dokument',
    blurb:
      'Eine Markdown-Datei hochladen und eine .docx aus Words eigenen Bausteinen erhalten — Überschriftenformatvorlagen, die der Navigationsbereich auflistet, echte nummerierte Listen und Aufzählungen, Fußnoten am Seitenende und Tabellen, die ein Word-Nutzer weiterbearbeiten kann.',
    hint: 'Eine .md-Datei hochladen. Überschriften werden zu „Überschrift 1“ bis 6, sodass ein Inhaltsverzeichnis und eine Hausvorlage sofort darauf greifen.',
    seo: {
      title: 'Markdown in Word (.docx) umwandeln — TransformPipe',
      description:
        'Markdown in eine Word-.docx umwandeln: echte Überschriftenformate, nummerierte Listen, Fußnoten, Tabellen und Bilder — bearbeitbar statt umgewandeltes HTML.',
    },
  },
};
