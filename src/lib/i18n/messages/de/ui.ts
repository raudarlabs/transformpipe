import type { Content } from '../../content';

/*
 * Jeder Satz, den die Oberfläche selbst sagt, nach dem Ort geschlüsselt, an dem er steht.
 *
 * Das ist der Teil, den die Komponenten über `useT()` lesen. Nicht hier steht alles, was eher ein
 * Ding als ein Wort ist: eine id, ein Pfad, eine Dateiendung, ein Slug, ein Datum, eine URL. Die
 * bleiben im Code, dem sie gehören — `shared/conversions.ts`, `src/lib/pages.ts`,
 * `src/lib/blog.ts` —, damit eine Übersetzung, die einen Satz ändert, keine Route zerstören kann.
 *
 * Die Schlüssel folgen der Konvention aus `./index.ts`: `bereich.ding`, klein geschrieben, mit
 * Punkten getrennt, benannt nach dem Ort, an dem der Text erscheint, nicht nach seinem Inhalt.
 * `page.` ist das eine Präfix, das jene Liste nicht nennt — es sind die fünf Seiten, die nur aus
 * Worten bestehen, `src/features/StaticPage.tsx`, ein Bildschirm wie die anderen.
 *
 * Ein Text, der aus einem Wert gebaut wird, trägt einen `{name}`-Platzhalter und wird an der
 * Aufrufstelle gefüllt. Die Alternative — ein übersetztes Fragment, in JSX an eine Zahl geklebt —
 * lässt sich nicht umstellen, und Deutsch setzt die Teile in eine andere Reihenfolge. Also ist
 * `history.row.stats.many` ein Satz mit zwei Löchern und nicht drei Kinder eines `<span>`.
 *
 * Singular und Plural sind eigene Schlüssel, `.one` und `.many`, die der Aufrufer wählt. Englisch
 * braucht zwei Formen und die vier Sprachen hier ebenso; eine Sprache, die mehr braucht, bekommt
 * mehr Schlüssel — eine Änderung an dieser Datei, nicht an den Komponenten.
 */

export const ui: Content['ui'] = {
  /* Worte, die zu keinem Bildschirm gehören. */
  'common.copy': 'Kopieren',
  'common.copied': 'Kopiert',
  'common.loading': 'Wird geladen…',
  'common.clipboard.error': 'Kein Zugriff auf die Zwischenablage',
  'common.selectall': 'Alle auswählen',
  'common.deselectall': 'Auswahl aufheben',
  'common.selected': '{count} ausgewählt',
  'common.exitselection': 'Auswahl beenden',
  'common.scrolltotop': 'Nach oben',
  /* Sagt der Konverter nach einer Ablage und der Verlauf nach dem Zusammenfügen — derselbe Satz. */
  'common.chained': '{count} Dateien zu einem Dokument verkettet',
  /*
   * Wie mehrere verkettete Dateien zusammen heißen: der erste Name, und wie viele ihm folgten.
   *
   * Ein Name statt einer Beschriftung, und dennoch ein Satz — „weitere“ ist ein Wort. Der Name
   * eines Dokuments mit einer Quelle ist der Name jener Datei, und `merged.md` für keine davon ist
   * ein Dateiname; beide bleiben also in `src/lib/merge.ts`, wo die übrige Benennung liegt.
   */
  'common.merged.name': '{first} + {count} weitere',

  /*
   * Die Anmeldung, die auf mehr Weisen scheitert als sie gelingt und sagen muss, auf welche.
   *
   * Die vier `auth.error`-Sätze nach dem ersten sind die Ergebnisse, die `/api/auth/finish` im
   * Query-String zurückgeben kann — eine geschlossene Menge, denn der Grund kommt in einem Link,
   * und einen Link kann jeder schreiben. `auth.incomplete` ist der Toast, der den jeweiligen trägt.
   */
  'dialog.mcp.lede':
    'TransformPipe in einem Assistenten hinzufügen: er kann dann Dokumente in diesem Konto umwandeln, speichern und teilen.',
  'dialog.mcp.address': 'Konnektor-Adresse',
  'dialog.mcp.nokey':
    'Auf claude.ai: Einstellungen → Konnektoren → Eigenen Konnektor hinzufügen. Kein Schlüssel zum Einfügen — die Anmeldung läuft über Ihr Konto, und die Verbindung lässt sich hier trennen.',
  'dialog.mcp.command': 'Im Terminal',
  'header.connector': 'MCP-Konnektor',
  'header.webhooks': 'Webhooks',

  /* The sign-in dialog: three views — in, up, and asking for a reset link. */
  'auth.dialog.signin.title': 'Anmelden',
  'auth.dialog.signup.title': 'Konto erstellen',
  'auth.dialog.reset.title': 'Passwort zurücksetzen',
  'auth.dialog.reset.lede':
    'Geben Sie die E-Mail-Adresse des Kontos ein; ein Link zum Zurücksetzen wird zugeschickt.',
  'auth.dialog.email': 'E-Mail',
  'auth.dialog.password': 'Passwort',
  'auth.dialog.forgot': 'Passwort vergessen?',
  'auth.dialog.submit.signin': 'Anmelden',
  'auth.dialog.submit.signup': 'Weiter',
  'auth.dialog.submit.reset': 'Link zusenden',
  'auth.dialog.tonew': 'Noch kein Konto?',
  'auth.dialog.tonew.action': 'Registrieren',
  'auth.dialog.toexisting': 'Sie haben schon ein Konto?',
  'auth.dialog.toexisting.action': 'Anmelden',
  'auth.dialog.back': 'Zurück zur Anmeldung',
  'auth.dialog.or': 'oder',
  'auth.dialog.google': 'Mit Google fortfahren',
  'auth.dialog.aside.lede': 'Nicht das Konto ist der Punkt, sondern was darin liegt.',
  'auth.dialog.aside.history': 'Verlauf',
  'auth.dialog.aside.history.detail': 'jedes konvertierte Dokument bleibt erhalten und lässt sich erneut öffnen',
  'auth.dialog.aside.links': 'Links',
  'auth.dialog.aside.links.detail': 'ein Dokument für alle freigeben oder für bestimmte Personen',
  'auth.dialog.aside.api': 'API und MCP',
  'auth.dialog.aside.api.detail': 'ein Schlüssel für die CLI, die GitHub Action und Ihren Assistenten',
  'auth.dialog.aside.extension': 'Die Erweiterung',
  'auth.dialog.aside.extension.detail': 'dasselbe Konto, angemeldet aus Ihrem Browser',
  'auth.dialog.terms': 'Ich akzeptiere die {terms}',
  'auth.dialog.terms.link': 'Nutzungsbedingungen',
  'auth.dialog.terms.required':
    'Die Nutzungsbedingungen müssen für ein Konto akzeptiert werden.',
  'auth.dialog.verify.title': 'E-Mail bestätigen',
  'auth.dialog.verify.lede':
    'Ein sechsstelliger Code ist an {email} unterwegs. Er läuft in zehn Minuten ab.',
  'auth.dialog.verify.code': 'Sechsstelliger Code',
  'auth.dialog.verify.submit': 'Bestätigen',
  'auth.dialog.verify.resend': 'Neuen Code senden',
  'auth.dialog.verify.resent': 'Ein neuer Code ist unterwegs.',
  'auth.dialog.verify.done': 'Die Adresse ist bestätigt.',
  'auth.dialog.verify.later': 'Später',
  'header.verify': 'E-Mail bestätigen',
  'auth.dialog.reset.sent': 'Falls zu dieser Adresse ein Konto gehört, ist ein Link unterwegs.',
  'auth.verify.sent':
    'Das Konto ist angelegt. Der Link zur Bestätigung der Adresse liegt im Postfach.',

  'auth.incomplete': 'Anmeldung nicht abgeschlossen',
  'auth.error.unfinished':
    'Die Anmeldung wurde nicht beendet. Versuchen Sie es erneut.',
  'auth.error.link':
    'Der Anmeldelink war unvollständig. Versuchen Sie es erneut.',
  'auth.error.unreachable': 'Der Anmeldedienst war nicht erreichbar.',
  'auth.error.rejected': 'Der Anmeldedienst hat die Anfrage abgelehnt.',
  'auth.error.nosession': 'Der Anmeldedienst hat keine Sitzung zurückgegeben.',
  'auth.error.start': 'Die Anmeldung ließ sich nicht starten',
  'auth.error.signout': 'Abmelden fehlgeschlagen',

  /* Die Leiste am Kopf, auf breitem Bildschirm und im Menü des Telefons. */
  'header.home': 'Neue Datei',
  'header.nav.converter': 'Konverter',
  'header.nav.history': 'Verlauf',
  'header.nav.docs': 'Doku',
  'header.nav.documentation': 'Dokumentation',
  'header.nav.blog': 'Blog',
  'header.menu.open': 'Menü',
  'header.menu.title': 'Menü',
  'header.menu.close': 'Menü schließen',
  'header.menu.convert': 'Umwandeln',
  'header.menu.goto': 'Wechseln zu',
  'docs.webhooks.intro':
    'Im Konto-Menü gibt es den Eintrag {webhooks}: Sie hinterlegen eine URL, und sie erhält einen signierten POST, sobald ein Dokument angelegt oder mit benannten Personen geteilt wird. Das liegt bewusst hinter einer Sitzung und nicht unter {api} — ein Schlüssel, der Webhooks anlegen könnte, würde aus einem Leck einen dauerhaften Strom aller künftigen Dokumente machen statt des punktuellen Zugriffs von heute.',
  'docs.webhooks.signature':
    'Der Rumpf wird per HMAC-SHA256 über {payload} signiert und im Header {header} gesendet — dieselbe Form, die Stripe und GitHub verwenden, sodass vorhandener Prüfcode meist nur ein anderes Geheimnis braucht.',
  'docs.webhooks.secret':
    'Das Geheimnis wird beim Anlegen gezeigt und lässt sich im Dialog erneut anzeigen. Anders als ein API-Schlüssel wird es von dieser App vorgezeigt und nicht ihr gegenüber, also darf der Kontoinhaber es beim Einrichten eines Empfängers noch einmal lesen.',
  'docs.webhooks.delivery':
    'Die Zustellung ist ein Versuch: eine Anfrage, fünf Sekunden Zeitlimit, kein erneuter Versuch und keine Warteschlange. Ein Empfänger, der gerade nicht läuft, verpasst diese Zustellung, und der Dialog nennt den Zeitpunkt des letzten Fehlschlags.',
  /* The browser extension — see extension/ and content/extension-plan.md. */
  'ext.panel': 'In der Seitenleiste öffnen',
  'ext.refresh': 'Diese Seite erneut umwandeln',
  'ext.panel.permission':
    'Die Seitenleiste bleibt beim Surfen offen und braucht deshalb die Erlaubnis, die geöffneten Seiten zu lesen — die Schaltfläche in der Leiste brauchte das nie, denn sie zu drücken ist die Erlaubnis.',
  'ext.panel.allow': 'Lesen erlauben',
  'ext.panel.close': 'Seitenleiste schließen',
  'ext.panel.detail':
    'Sie bleibt neben der Seite und folgt Ihnen von Tab zu Tab, statt sich zu schließen, sobald Sie wegsehen.',
  'ext.account': 'Konto',
  'ext.signin': 'Mit TransformPipe anmelden',
  'ext.signout': 'Abmelden',
  'ext.signedout': 'Nicht angemeldet',
  'ext.settings': 'Einstellungen',
  'ext.share.failed': 'Konnte nicht gespeichert werden — melden Sie sich neu an',
  'ext.shared.link': 'Link in die Zwischenablage kopiert',
  'ext.signin.hint':
    'Melden Sie sich an, dann kann diese Erweiterung eine umgewandelte Seite in Ihrem Konto speichern und einen Link veröffentlichen. Sie fragt um dieselbe Zustimmung wie ein Assistent, und Sie können sie jederzeit auf der Kontoseite zurücknehmen.',
  'ext.signin.refused': 'Die Anmeldung wurde nicht abgeschlossen.',
  'ext.key.connect': 'Verbinden',
  'ext.key.connected': 'Verbunden',
  'ext.key.disconnect': 'Trennen',
  'ext.save': 'Speichern',
  'ext.saved': 'Gespeichert',
  'ext.share': 'Teilen',
  'ext.shared': 'Link kopiert',
  'ext.connect': 'Konto verbinden, um zu speichern und zu teilen',
  'ext.converting': 'Wird umgewandelt…',
  'ext.failed': 'Diese Seite lässt sich nicht lesen',
  'ext.restricted': 'Chrome lässt keine Erweiterung seine eigenen Seiten lesen. Öffnen Sie eine normale Seite und drücken Sie erneut — oder wandeln Sie stattdessen eine Datei um.',
  'ext.wholepage': 'Ganze Seite',
  'ext.selection': 'Auswahl',
  'ext.stats': '{words} Wörter · {size}',
  'ext.copy': 'Markdown kopieren',
  'ext.copied': 'Kopiert',
  'ext.download': '.md herunterladen',
  'ext.download.html': '.html herunterladen',
  'ext.generating': 'HTML wird erstellt …',
  'ext.html.page': 'Die Seite, wie sie aussieht',
  'ext.html.page.detail': 'Eigenes Design, Bilder und Styles in der Datei',
  'ext.html.text': 'Nur der Artikel',
  'ext.html.text.detail': 'Umgewandelt und aufgeräumt, wie es die Website herunterlädt',
  'ext.open': 'In einem Tab öffnen',
  'ext.files': 'Dateien öffnen…',
  'ext.viewer.empty': 'Dateien zum Umwandeln wählen — zehn Formate, alles in diesem Browser',
  'ext.viewer.hint':
    'Datei hierher ziehen oder auswählen — Word, Excel, CSV, JSON, HTML, reiner Text oder ein Notion-, Confluence- oder Obsidian-Export. Mehrere Dateien werden zu einem Dokument verkettet. Nichts verlässt diesen Browser.',
  'palette.title': 'Suche',
  'palette.placeholder': 'Dokumente, Konvertierungen und Seiten durchsuchen',
  'palette.empty': 'Dazu gibt es nichts',
  'palette.group.recent': 'Zuletzt',
  'palette.seeall': 'Alle Dokumente ansehen',
  'palette.group.read': 'Lesen',

  /* The consent banner and its switches. See src/lib/consent.tsx for what each one turns on. */
  'cookies.banner.title': 'Cookies auf dieser Seite',
  'cookies.banner.body': 'Zum Anmelden braucht es zwei Cookies, die immer aktiv sind. Die Analyse ist optional und bleibt aus, bis Sie zustimmen — vor Ihrer Antwort wird nichts in Ihrem Browser gespeichert.',
  'cookies.banner.more': 'Was jedes davon tut',
  'cookies.banner.accept': 'Alle akzeptieren',
  'cookies.banner.reject': 'Nur notwendige',
  'cookies.banner.customise': 'Anpassen',
  'cookies.settings.title': 'Cookie-Einstellungen',
  'cookies.settings.lede': 'Zwei Kategorien, und eine davon ist eine Entscheidung. Sie lässt sich jederzeit auf der Cookie-Seite ändern.',
  'cookies.settings.necessary': 'Notwendig',
  'cookies.settings.necessary.detail': 'Die Anmeldesitzung und das gewählte Design. Sie abzulehnen hieße, sich nicht anzumelden — deshalb lassen sie sich nicht abschalten.',
  'cookies.settings.analytics': 'Analyse',
  'cookies.settings.analytics.detail': 'Google Analytics über den Google Tag Manager: wie viele Menschen kommen und welche Seiten sie lesen. Aus, solange Sie nicht zustimmen — und solange schreiben Googles Tags nichts in Ihren Browser.',
  'cookies.settings.save': 'Auswahl speichern',
  'cookies.settings.open': 'Cookie-Einstellungen',
  'header.account': 'Konto',
  'header.signin': 'Anmelden',
  'header.logout': 'Abmelden',
  'header.apikeys': 'API-Schlüssel',
  'header.theme.label': 'Design',
  'header.theme.dark': 'Dunkel',
  'header.theme.light': 'Hell',
  'header.theme.toggle': 'Design wechseln',
  'header.theme.tolight': 'Auf hell umstellen',
  'header.theme.todark': 'Auf dunkel umstellen',

  /* Der Konverter: die Ablagefläche, das Dokument daraus und die Bänder darunter. */
  'converter.dropzone.title': '{extension}-Dateien hier ablegen',
  'converter.dropzone.choose': 'Dateien auswählen',
  'converter.dropzone.limits':
    '{extensions} · bis 10 MB · im Browser verarbeitet',
  /*
   * Dieselbe Tatsache wie `converter.dropzone.limits`, als Satz statt als Reihe von Gliedern:
   * dieser gehört der vorgerenderten Seite, gelesen von einem Crawler und von allen, deren Bundle
   * noch nicht da ist, und dort ist eine Zeile aus Mittelpunkten keine Prosa. `scripts/prerender.ts`
   * füllt sie aus.
   */
  'converter.accepts': 'Nimmt {extensions}, bis 10 MB, umgewandelt im Browser.',
  'converter.picker.label': 'Oder etwas anderes umwandeln',
  'converter.picker.soon': 'Bald',
  'converter.picker.soon.title': 'Noch nicht da — steht auf der Roadmap',
  'converter.howto': 'Zum ersten Mal mit diesem Format?',
  'converter.blog.eyebrow': 'Blog',
  'converter.blog.title': 'Markdown im Zaum halten',
  'converter.blog.blurb':
    'Syntax, die bricht, Dokumente, die andere erreichen müssen, und wie das Ganze ohne einen selbst läuft.',
  'converter.blog.all': 'Alle Artikel',
  'converter.faq.eyebrow': 'FAQ',
  'converter.faq.title': 'Fragen, mit denen Leute herkommen',
  'converter.faq.blurb':
    'Was mit der Datei passiert, was im Download steckt und was ein Konto dazugibt.',
  'converter.badge.converted': 'umgewandelt',
  'converter.badge.merged': '{count} Dateien zusammengefügt',
  'converter.newfile': 'Neue Datei',
  'converter.share': 'Teilen',
  'converter.share.hint': 'Einen Link zu diesem Dokument teilen',
  'converter.share.hint.signedout':
    'Zum Teilen anmelden — geteilt wird nur, was im Konto liegt',
  'converter.copy': '{format} kopieren',
  'converter.copy.done': '{format} in die Zwischenablage kopiert',
  'converter.download': '.{format} herunterladen',
  'converter.download.more': 'Andere Formate',
  'converter.download.done': '{format} heruntergeladen',
  'converter.print': 'Drucken oder als PDF speichern',
  'converter.print.error': 'Der Druckdialog ließ sich nicht öffnen',
  'converter.print.error.hint': 'Laden Sie es stattdessen herunter.',
  'converter.download.docx': 'Word (.docx)',
  'converter.download.docx.needsSave': 'Word (.docx) — zuerst das Dokument speichern',
  'converter.download.docx.error': 'Das Word-Dokument konnte nicht erstellt werden',
  'converter.tab.preview': 'Vorschau',
  'converter.tab.html': 'HTML-Quelltext',
  'converter.tab.markdown': 'Markdown',
  'converter.tab.check': 'Prüfung',
  'check.clean': 'Nichts zu beheben',
  'check.clean.detail': 'Keine toten Anker, leeren Überschriften oder Bilder ohne Alternativtext.',
  'check.lede': 'Worüber ein Mensch oder ein Screenreader stolpern würde. Nichts davon wird für Sie geändert — jeder Punkt ist eine einzelne Änderung in der Quelle.',
  'check.line': 'Zeile {line}',
  'check.suggestion': 'Meinten Sie {anchor}?',
  'check.dead-anchor': 'Link auf einen Abschnitt, den es nicht gibt',
  'check.duplicate-anchor': 'Zwei Überschriften mit demselben Namen',
  'check.empty-heading': 'Eine Überschrift ohne Worte',
  'check.missing-alt': 'Ein Bild ohne Alternativtext',
  'check.empty-link': 'Ein Link ohne Beschriftung',
  'check.empty-href': 'Ein Link, der nirgendwohin führt',
  'converter.tab.summary': 'KI-Zusammenfassung',
  'converter.fullscreen.enter': 'Im Vollbild lesen',
  'converter.fullscreen.exit': 'Vollbild beenden',
  'converter.summary.needsSave':
    'Speichern Sie dieses Dokument in Ihrem Konto, um es zusammenzufassen.',
  'converter.summary.loading': 'Dokument wird gelesen…',
  'converter.summary.error': 'Dieses Dokument konnte nicht zusammengefasst werden.',
  'converter.summary.retry': 'Erneut versuchen',
  'converter.summary.regenerate': 'Neu erstellen',

  /*
   * Wenn eine Datei nicht durchkommt: was abgelegt wurde, was zu groß war, was die Umwandlung
   * selbst zu sagen hatte, und was ein Dokument ist, das umgewandelt wurde, aber nicht hineinpasst.
   *
   * Der Grund ist immer ein zweiter Satz und nie ein an den ersten geschraubtes Nebensatzglied,
   * denn der Toast hat zwei Zeilen und ein Grund ist das, womit jemand etwas anfangen kann.
   * `{conversion}` ist der Name aus `content.conversions`, also sagt der Fehlschlag in jeder
   * Sprache „Word → Markdown hat nicht funktioniert“.
   */
  'converter.reject.title': 'Diese Datei lässt sich hier nicht umwandeln',
  'converter.reject.extension': '{name} — diese Seite nimmt {extensions}.',
  'converter.reject.mixed':
    'Das sind {count} verschiedene Dateiarten. Wandeln Sie immer nur eine Art um.',
  'converter.toolarge.one': 'Datei ist zu groß',
  'converter.toolarge.many': 'Diese Dateien sind zu groß',
  'converter.toolarge.detail':
    '{size} — die Grenze für ein Dokument liegt bei {limit}.',
  'converter.converted': 'In {format} umgewandelt',
  'converter.notkept.title': 'Umgewandelt, aber nicht im Konto gespeichert',
  'converter.notkept.detail':
    'Gespeichert wird ein Dokument bis {limit}; dieses hat {size}. Laden Sie es herunter — es ist fertig.',
  'converter.failed': '{conversion} hat nicht funktioniert',
  'converter.failed.detail': 'Die Datei ließ sich nicht lesen.',
  'converter.error.norows': 'Diese Datei enthält keine Zeilen.',
  /* `{why}` ist die Auskunft des Konverters selbst, bei einer Word-Datei die von mammoth. */
  'converter.error.empty': 'Aus diesem Dokument kam nichts heraus — {why}.',
  'converter.error.empty.why': 'die Datei enthält keinen Text',
  /* Der Rahmen, aus dem ein PDF gedruckt wird: nie zu sehen, von einem Screenreader vorgelesen. */
  'converter.print.frame': '{name} zum Drucken',
  'converter.print.unprepared':
    'Das Dokument ließ sich nicht zum Drucken vorbereiten.',

  /*
   * Woraus das Dokument besteht, ein Substantiv je Anzahl. Die Zahl ist ein eigenes Element in der
   * Zeile — sie steht in schwererem Schnitt —, deshalb wird das Wort für sich übersetzt und nicht
   * als Teil eines Satzes mit einem Loch darin.
   */
  'converter.stats.word': 'Wort',
  'converter.stats.words': 'Wörter',
  'converter.stats.heading': 'Überschrift',
  'converter.stats.headings': 'Überschriften',
  'converter.stats.table': 'Tabelle',
  'converter.stats.tables': 'Tabellen',
  'converter.stats.codeblock': 'Codeblock',
  'converter.stats.codeblocks': 'Codeblöcke',
  'converter.stats.link': 'Link',
  'converter.stats.links': 'Links',
  'converter.stats.image': 'Bild',
  'converter.stats.images': 'Bilder',

  /* Die Liste aller Umwandlungen: ihr Kopf, ihre Filter, ihre Zeilen und ihre Spalten. */
  'history.title': 'Verlauf',
  /*
   * Saving, which is now something a person does rather than something that happens to them.
   *
   * A conversion stays in this browser; the account gets a document when the button is pressed. So
   * the list has two kinds of row, and `history.mixed` is what the page says when it holds both.
   */
  'converter.save': 'Speichern',
  'converter.saved': 'Gespeichert',
  'converter.save.hint': 'Bleibt in deinem Konto, auf jedem Gerät.',
  'converter.save.hint.signedout':
    'Melde dich an, um es im Konto zu behalten. Bis dahin bleibt es in diesem Browser.',
  'converter.save.done': 'Im Konto gespeichert',
  'converter.share.hint.unsaved': 'Erst speichern — ein Link braucht das Dokument im Konto.',
  'history.row.unsaved': 'Nicht gespeichert',
  'history.mixed': 'Gespeicherte Dokumente, und was dieser Browser umgewandelt hat',

  'history.synced': 'Im Konto gespeichert',
  'history.local': 'Nur in diesem Browser — angemeldet überall erreichbar',
  'history.usage':
    '· {bytes} von {maxBytes} · {documents} von {maxDocuments} Dokumenten',
  'history.empty.title': 'Noch keine Umwandlungen',
  'history.empty.synced':
    'Jede umgewandelte Datei wird im Konto gespeichert — von jedem Gerät aus zu öffnen.',
  'history.empty.local':
    'Jede umgewandelte Datei erscheint hier. Angemeldet bleibt die Liste über Geräte hinweg erhalten.',
  'history.empty.action': 'Datei umwandeln',
  'history.drop.title': 'Dateien ablegen',
  'history.drop.hint':
    'oder klicken zum Auswählen — mehrere Dateien werden zu einem Dokument verkettet',
  'history.search.placeholder': 'Nach Namen suchen',
  'history.search.label': 'Verlauf nach Dateinamen durchsuchen',
  'history.search.clear': 'Suche zurücksetzen',
  'history.chip.all': 'Alle Formate',
  'history.chip.shared': 'Für mich geteilt',
  'history.shared.one': '{count} Dokument für Sie geteilt',
  'history.shared.many': '{count} Dokumente für Sie geteilt',
  'history.count.one': '{count} Datei',
  'history.count.many': '{count} Dateien',
  'history.count.filtered.one': '{found} von {total} Datei',
  'history.count.filtered.many': '{found} von {total} Dateien',
  'history.merge': 'Zusammenfügen',
  'history.merge.hint':
    'Die ausgewählten Dateien zu einem Dokument verketten, älteste zuerst',
  'history.merge.hint.few': 'Mindestens zwei Dateien zum Verketten auswählen',
  'history.download': 'Herunterladen',
  'history.delete': 'Löschen',
  'history.clear': 'Verlauf löschen',
  'history.column.file': 'Datei',
  'history.column.type': 'Typ',
  'history.column.sharedby': 'Geteilt von',
  'history.column.size': 'Quellgröße',
  'history.column.content': 'Inhalt',
  'history.column.converted': 'Umgewandelt',
  'history.column.actions': 'Aktionen',
  'history.row.someone': 'jemand',
  'history.row.select': '{name} auswählen',
  'history.row.open': 'Vorschau öffnen',
  'history.row.open.label': '{name} öffnen',
  'history.row.unavailable': 'Quelle war zu groß, um sie lokal zu behalten',
  'history.row.share': 'Teilen',
  'history.row.share.label': '{name} teilen',
  'history.row.versions': 'Versionen',
  'history.row.versions.label': 'Versionen von {name} ansehen',
  'history.row.download.label': '{name} herunterladen',
  'history.row.remove': 'Aus dem Verlauf entfernen',
  'history.row.stats.one': '{words} Wörter · {headings} Überschrift',
  'history.row.stats.many': '{words} Wörter · {headings} Überschriften',

  /*
   * Was die Liste sagt, wenn sie etwas getan hat — oder nicht konnte.
   *
   * `history.error.*` gehören `useHistory`: der Hook hat keine eigenen Worte, also gibt ihm der
   * Bildschirm ein `t` und er meldet in der Sprache des Lesers. Die Weigerung eines Servers wird
   * als `{reason}` eines dieser Sätze weitergegeben und nicht für sich gezeigt, denn sie kommt auf
   * Englisch an, was der Leser auch spricht — und `history.error.delete.reason` steht ein, wenn sie
   * nichts sagt.
   */
  'history.error.load': 'Der Verlauf ließ sich nicht laden',
  'history.error.save': 'Die Datei ließ sich nicht speichern',
  'history.error.delete': 'Löschen nicht möglich: {reason}',
  'history.error.delete.reason': 'Server hat abgelehnt',
  'history.error.delete.some':
    '{failed} von {total} Dateien ließen sich nicht löschen',
  'history.error.clear': 'Der Verlauf ließ sich nicht löschen',
  'history.source.missing': 'Die Quelle dieser Datei ist nicht mehr verfügbar',
  'history.download.done': 'Datei heruntergeladen',
  'history.download.none': 'Es ließ sich nichts herunterladen',
  'history.download.one': '{format}-Datei heruntergeladen',
  'history.download.many': '{count} {format}-Dateien heruntergeladen',
  'history.merge.none': 'Nichts zum Zusammenfügen',
  'history.merge.none.detail':
    'Die Quellen dieser Dateien sind nicht mehr verfügbar.',
  'history.removed.one': 'Datei entfernt',
  'history.removed.many': '{count} Dateien entfernt',
  'history.cleared': 'Verlauf gelöscht',

  /*
   * Die Blog-Übersicht. Die Artikel selbst stehen nicht im Katalog — siehe `content.ts` —, also
   * sind Titel, Beschreibung und Schlagwort einer Karte das Englische, in dem der Text geschrieben
   * wurde; nur das Beiwerk darum herum steht hier.
   */
  'blog.eyebrow': 'Blog',
  'blog.title': 'Markdown, und was man damit macht',
  'blog.blurb':
    'Umwandeln, Syntax, die bricht, Veröffentlichen, und wie das Ganze ohne einen selbst läuft.',
  'blog.chip.all': 'Alle',
  'blog.empty': 'Zu diesem Schlagwort gibt es noch nichts.',
  'blog.card.meta': '{date} · {minutes} Min. Lesezeit',

  /* Ein Artikel: das Beiwerk um Prosa, die englisch bleibt. */
  'article.toc': 'In diesem Artikel',
  'article.meta': '{date} · {minutes} Min. Lesezeit',
  'article.meta.updated':
    '{date} · aktualisiert {updated} · {minutes} Min. Lesezeit',
  'article.share': 'Teilen',
  'article.cta.text':
    'Diese Seite wurde in Markdown geschrieben und von dem Konverter gerendert, den sie beschreibt.',
  'article.cta.button': 'Datei umwandeln',
  'article.more.eyebrow': 'Weiter',
  'article.more.title': 'Weiterlesen',
  'article.more.meta': '{minutes} Min. Lesezeit',
  'article.missing.title': 'Diesen Artikel gibt es nicht',
  'article.missing.blurb':
    'Vielleicht wurde er umbenannt. In der Übersicht steht alles, was es gibt.',
  'article.missing.back': 'Zurück zum Blog',

  /*
   * Die fünf Seiten, die nur aus Worten bestehen. Ihr eigener Text steht in `pages.ts`, nach Seite
   * geschlüsselt; diese zwei sind, was der Renderer darum herum sagt.
   *
   * Die Schlusszeile ist geteilt, weil ein Link darin sitzt: `page.questions` ist der Satz bis zum
   * Link und `page.questions.link` sind die Worte, die der Anker trägt. Wer den Link weiter vorn im
   * Satz braucht, bekommt ihn hier nicht — das ist der Preis des Ankers.
   */
  'page.updated': 'Zuletzt aktualisiert {date}',
  'page.questions': 'Fragen dazu gehen an',
  'page.questions.link': 'die Issues des Repositorys',

  /*
   * Ein Dokument, das jemand Ihnen geschickt hat, unter /open/<token>.
   *
   * Der eigene Bildschirm der App, also folgt er der Sprache des Lesers wie jeder andere. Der Text,
   * den der Server unter /s/<token> ausliefert, ist eine andere Seite für einen Leser, über den wir
   * nichts wissen; seine Worte stehen nicht hier — siehe `src/lib/i18n/content.ts`.
   *
   * Ihr Download-Knopf und ihr Anmelde-Knopf sagen, was diese Knöpfe überall sonst sagen, lesen
   * also `converter.download` und `header.signin` statt eigener Schlüssel.
   */
  'shared.loading': 'Dokument wird geöffnet…',
  'shared.meta': 'geteilt · umgewandelt {date}',
  'shared.badge': 'Mit Ihnen geteilt',
  'shared.save': 'Kopie speichern',
  'shared.saved': 'In Ihrem Konto gespeichert',
  'shared.save.done': 'Eine Kopie liegt in Ihrem Konto',
  'shared.save.error': 'Die Kopie konnte nicht gespeichert werden',
  'shared.cta.title': 'Dieses Dokument ist mit TransformPipe entstanden',
  'shared.cta.body': 'Eine Webseite, eine Word-Datei, ein PDF oder eine Tabelle wird zu einem sauberen Dokument – umgewandelt in Ihrem Browser, die Datei verlässt ihn nicht. Ein Konto bewahrt Ihre Dokumente auf und teilt sie so, wie dieses mit Ihnen geteilt wurde.',
  'shared.cta.primary': 'Datei umwandeln – kostenlos',
  'shared.cta.secondary': 'Konto anlegen',

  /* Das Formular der Support-Seite. Es füllt einen GitHub-Issue aus und sendet selbst nichts. */
  'support.form.title': 'Etwas melden',
  'support.form.blurb':
    'Zwei Felder, und der Issue öffnet sich auf GitHub mit beidem schon darin.',
  'support.form.summary': 'Was passiert ist, in einer Zeile',
  'support.form.summary.placeholder': 'Tabellen kommen leer an, wenn ich eine .docx umwandle',
  'support.form.details': 'Was Sie erwartet haben und was kam',
  'support.form.details.placeholder':
    'Ich habe eine Word-Datei mit einer dreispaltigen Tabelle umgewandelt. Die Überschriften kamen an, die Zeilen nicht. Chrome 140 unter macOS.',
  'support.form.open': 'Issue auf GitHub öffnen',
  'support.form.note':
    'Von dieser Seite geht nichts weg: Sie öffnet GitHub, dort drücken Sie Absenden. Ein GitHub-Konto wird gebraucht.',
  'shared.signin.title': 'Dieses Dokument wurde für bestimmte Personen geteilt',
  'shared.signin.detail':
    'Melden Sie sich mit der Adresse an, für die es geteilt wurde.',
  'shared.missing.title': 'Dieser Link öffnet kein Dokument',
  'shared.missing.action': 'Eigene Datei umwandeln',

  /* Ein Dokument teilen. */
  'dialog.share.title': 'Teilen',
  'dialog.share.mode.private': 'Privat',
  'dialog.share.mode.link': 'Alle mit dem Link',
  'dialog.share.mode.people': 'Bestimmte Personen',
  'dialog.share.private.note':
    'Nur Sie können dieses Dokument öffnen. Wählen Sie oben einen Modus, um es zu teilen.',
  'dialog.share.link': 'Link',
  'dialog.share.link.field': 'Freigabelink',
  'dialog.share.link.note':
    'Alle mit diesem Link können das Dokument lesen.',
  'dialog.share.people.note':
    'Nur die unten genannten Personen können es öffnen, nach der Anmeldung mit dieser Adresse. Jede erhält den Link per E-Mail, sobald Sie sie hinzufügen.',
  'dialog.share.people.empty':
    'Noch niemand — der Link öffnet sich nur für Sie.',
  'dialog.share.email.label': 'E-Mail des Empfängers',
  'dialog.share.add': 'Hinzufügen',
  'dialog.share.remove.label': '{email} entfernen',
  'dialog.share.error': 'Teilen fehlgeschlagen',

  /* API-Schlüssel und die Assistenten, die hereingelassen wurden. */
  'dialog.keys.title': 'API-Schlüssel',
  'dialog.keys.blurb':
    'Dokumente aus einem Skript, einem Terminal oder aus CI umwandeln und teilen — und die verbundenen Assistenten.',
  'dialog.keys.name.placeholder': 'Wofür er ist — „CI“, „mein Laptop“',
  'dialog.keys.name.label': 'Schlüsselname',
  'dialog.keys.create': 'Erstellen',
  'dialog.keys.create.error': 'Der Schlüssel ließ sich nicht erstellen',
  'dialog.keys.fresh': 'Jetzt kopieren — er wird nicht wieder angezeigt',
  'dialog.keys.empty':
    'Noch keine Schlüssel. Ein Schlüssel kann Ihre Dokumente lesen, schreiben und teilen — an das Konto und an diese Schlüssel kommt er nicht.',
  'dialog.keys.revoked': '{name} · widerrufen',
  'dialog.keys.meta': '{prefix}… · {used}',
  'dialog.keys.used': 'verwendet {when}',
  'dialog.keys.never': 'nie verwendet',
  'dialog.keys.forget': 'Aus der Liste entfernen',
  'dialog.keys.forget.label': '{name} entfernen',
  'dialog.keys.revoke': 'Widerrufen — wirkt sofort',
  'dialog.keys.revoke.label': '{name} widerrufen',
  'dialog.keys.grants': 'Verbundene Assistenten',
  'dialog.keys.grant.meta': 'verbunden {since} · {used}',
  'dialog.keys.disconnect':
    'Trennen — handelt sofort nicht mehr in Ihrem Namen',
  'dialog.keys.disconnect.label': '{name} trennen',

  /* Die Versionskette eines Dokuments und der Unterschied zwischen zwei Versionen. */
  'dialog.versions.title': 'Versionen',
  'dialog.versions.blurb':
    'Dokumente, die als Versionen desselben Inhalts miteinander verknüpft sind.',
  'dialog.versions.back': 'Zurück zur Liste',
  'dialog.versions.compare': 'Mit vorheriger vergleichen',
  'dialog.versions.error': 'Dieser Vergleich konnte nicht geladen werden',

  /* Ausgehende Webhooks: ein Dokument wurde erstellt oder geteilt. */
  'dialog.webhooks.title': 'Webhooks',
  'dialog.webhooks.blurb':
    'Ein signierter POST an eine URL von Ihnen, wenn ein Dokument erstellt oder geteilt wird.',
  'dialog.webhooks.url.placeholder': 'https://ihr-server.example/webhook',
  'dialog.webhooks.url.label': 'Webhook-URL',
  'dialog.webhooks.url.error': 'Die URL muss mit https:// beginnen',
  'dialog.webhooks.create': 'Hinzufügen',
  'dialog.webhooks.create.error': 'Der Webhook konnte nicht erstellt werden',
  'dialog.webhooks.fresh':
    'Das Signaturgeheimnis — damit Zustellungen prüfen. Sie können es unten über das Augensymbol erneut anzeigen.',
  'dialog.webhooks.empty':
    'Noch keine Webhooks. Fügen Sie einen hinzu, um bei einem erstellten oder geteilten Dokument benachrichtigt zu werden.',
  'dialog.webhooks.status.never': 'Noch keine Zustellungen',
  'dialog.webhooks.status.ok': 'Zugestellt {when}',
  'dialog.webhooks.status.failed': 'Letzte Zustellung fehlgeschlagen, {when}',
  'dialog.webhooks.reveal': 'Signaturgeheimnis anzeigen',
  'dialog.webhooks.reveal.label': 'Signaturgeheimnis für {url} anzeigen',
  'dialog.webhooks.reveal.error': 'Das Geheimnis konnte nicht gelesen werden',
  'dialog.webhooks.revoke': 'Diesen Webhook entfernen',
  'dialog.webhooks.revoke.label': 'Webhook für {url} entfernen',

  /* Der Fuß der Seite. Die Spalte der Umwandlungen und die Rechtslinks holen ihre Worte anderswo. */
  'footer.tagline':
    'Dokumentkonvertierung für Menschen, Anwendungen und KI-Agenten.',
  /*
   * The live preview at /markdown-live-preview, and the paste box on the converter.
   *
   * `live.sample` is what the page opens with, so it is words rather than lorem: an empty editor
   * shows nothing of what the page does, to a reader or to a search result.
   */
  'converter.paste.open': 'Oder {extension}-Text einfügen',
  'converter.paste.open.disabled': 'Text einfügen',
  'converter.paste.unavailable':
    'Für {extension} gibt es keinen Text zum Einfügen — die Datei selbst hochladen',
  'converter.paste.label': '{extension}-Text einfügen',
  'converter.paste.close': 'Schließen',
  'converter.paste.placeholder': 'Hier einfügen oder tippen, dann umwandeln.',
  'converter.paste.convert': 'Umwandeln',
  'converter.paste.count': '{count} Zeichen',
  'footer.live': 'Live-Vorschau',
  'live.menu.hint': 'Tippen und beim Rendern zusehen',
  'converter.paste.live': 'Lieber die Live-Vorschau',
  'live.eyebrow': 'Live-Vorschau',
  'live.title': 'Markdown-Live-Vorschau',
  'live.lede':
    'Links Markdown tippen oder einfügen und rechts zusehen, wie sich das Dokument aufbaut — samt Tabellen, hervorgehobenem Code, Mermaid-Diagrammen und LaTeX-Mathematik. Nichts wird hochgeladen: Der Text bleibt in diesem Tab.',
  'live.renders': 'Was hier gerendert wird',
  'live.renders.gfm': 'GitHub Flavored Markdown',
  'live.renders.tables': 'Tabellen und Aufgabenlisten',
  'live.renders.code': 'Hervorgehobener Code',
  'live.renders.mermaid': 'Mermaid-Diagramme',
  'live.renders.math': 'LaTeX-Mathematik',
  'live.bare': 'Das sieht nach einem Mermaid-Diagramm ohne Umgebung aus. Markdown zeichnet es erst in einem Codeblock.',
  'live.bare.action': 'In einen Codeblock setzen',
  'live.save': 'Umwandeln und behalten',
  'live.save.hint':
    'Öffnet es als Dokument: im Verlauf, bereit zum Teilen oder als anderes Format zu laden.',
  'live.editor': 'Markdown',
  'live.preview': 'Vorschau',
  'live.copy': 'HTML kopieren',
  'live.download': '.html herunterladen',
  'live.filename': 'vorschau',
  'live.note':
    'Derselbe Konverter wie im Rest der Seite: Was hier steht, enthält auch die heruntergeladene Datei — Diagramme und Formeln reisen darin mit, ohne Stylesheet oder Schrift von außen. Rohes HTML in der Quelle wird bereinigt.',
  'live.seo.title': 'Markdown-Live-Vorschau',
  'live.seo.description':
    'Markdown einfügen und daneben gerendert sehen: GitHub Flavored Markdown, hervorgehobener Code, Mermaid-Diagramme und KaTeX-Mathematik. HTML kopieren oder eine eigenständige Datei laden.',
  'live.sample':
    '# Markdown-Live-Vorschau\n\nLinks tippen. Das Dokument rechts folgt, und die Stile sind die, die eine heruntergeladene Datei **mitbringt**.\n\n- GitHub Flavored Markdown, bereinigt.\n- Tabellen, Aufgabenlisten, Zitate und Code.\n\n| Format | Wird zu |\n| --- | --- |\n| Markdown | HTML |\n\nCode wird nach Sprache hervorgehoben:\n\n```ts\nexport const render = (md: string) => toHtml(md); // one converter everywhere\n```\n\nMathematik zwischen Dollarzeichen: $E = mc^2$, $\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$\n\nUnd ein Diagramm aus einem Codeblock:\n\n```mermaid\nflowchart LR\n  MD[Markdown] --> TP[TransformPipe]\n  TP --> HTML\n  TP --> Word\n```\n',

  /*
   * The changelog page, at /changelog and linked from the footer's Resources.
   *
   * Only the chrome is here. The entries are `src/lib/changelog.ts`, in English, for the reason
   * `ChangelogPage` gives: a changelog grows by an entry per release, and five translations per
   * entry is a cost that gets skipped after the second one.
   */
  'changelog.eyebrow': 'Changelog',
  'changelog.title': 'Was ausgeliefert wurde',
  'changelog.lede':
    'Jede Version und die Änderungen darunter, die jemandem auffallen würden. Neueste zuerst; die Versionen sind die Tags im Repository.',
  'changelog.years': 'Nach Jahr',
  'changelog.scope':
    'Nur Änderungen, die im Produkt auffallen. Interner Umbau und Infrastrukturarbeit stehen nicht hier, und die Einträge selbst sind auf Englisch.',
  'changelog.seo.title': 'Changelog',
  'changelog.seo.description':
    'Jede Version von TransformPipe und die Änderungen darunter, neueste zuerst.',
  'changelog.more': 'Die ganze Geschichte lesen',
  'changelog.back': 'Das gesamte Changelog',
  'changelog.entry.eyebrow': 'Release-Notiz',
  'changelog.entry.missing.title': 'Diese Release-Notiz gibt es nicht',
  'changelog.entry.missing.body': 'Unter dieser Adresse wurde nichts veröffentlicht. Das Changelog führt alles auf, was veröffentlicht wurde.',
  'footer.changelog': 'Changelog',

  /*
   * The page for an address that is not a page.
   *
   * `notfound.note` is the one line here that is not navigation: a reader who mistyped something
   * knows they did, and a reader who followed a link from these pages has found a defect and is
   * the only person who can say so.
   */
  'notfound.eyebrow': '404',
  'notfound.title': 'Diese Adresse ist keine Seite',
  'notfound.lede':
    'Auf dieser Website antwortet nichts darauf. Entweder ist ein Zeichen falsch, oder ein Link woanders zeigt auf etwas, das umgezogen ist.',
  'notfound.converter': 'Eine Datei konvertieren',
  'notfound.docs': 'Die Dokumentation lesen',
  'notfound.blog': 'Im Blog stöbern',
  'notfound.note':
    'Wenn ein Link auf dieser Website Sie hierher geschickt hat, ist das ein Fehler und kein Tippfehler.',
  'notfound.seo.title': 'Seite nicht gefunden',
  'notfound.seo.description':
    'Diese Adresse passt zu keiner Seite dieser Website. Der Konverter, die Dokumentation und der Blog sind einen Klick entfernt.',

  'footer.note': '© Raudar Labs {year}',
  'footer.converter': 'Konverter',
  'footer.resources': 'Ressourcen',
  'footer.howto': 'Anleitungen',
  'footer.company': 'Unternehmen',
  'footer.legal': 'Rechtliches',
  'footer.docs': 'Dokumentation',
  'footer.blog': 'Blog',
  'footer.faq': 'FAQ',
  /* Wird nach dem eigenen Namen des Links vorgelesen, beginnt also mit dem trennenden Leerzeichen. */
  'footer.external': ' (öffnet in einem neuen Tab)',
};
