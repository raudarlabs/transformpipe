import type { Content } from '../../content';

/*
 * Die Worte der fünf Seiten, die nur aus Worten bestehen: Über, Kontakt und die drei rechtlichen.
 *
 * `src/lib/pages.ts` hält, was eine Seite *ist* — ihre id, ihre Adresse und das Datum, das die
 * drei rechtlichen nennen —, und diese Datei hält, was eine Seite *sagt*. Aus demselben Grund, aus
 * dem die Trennung hier überall besteht: ein Pfad ist in fünf Sprachen derselbe, ein Absatz nicht,
 * also kann eine Übersetzung, die einen Satz ändert, keine Route zerstören.
 *
 * Geschlüsselt nach `StaticPageId`, sodass eine Seite, die der Union ohne ihre Worte hinzugefügt
 * wird, den Build stoppt, statt einen leeren Bildschirm zu rendern. Reine Strings statt React: der
 * Prerenderer läuft in Node ohne React, und diese Seiten sind die, die ein Crawler vollständig
 * liest.
 *
 * Die drei rechtlichen sind Richtlinien. Sie hierher zu verschieben hat kein Wort an ihnen
 * geändert, und sie zu übersetzen ist Arbeit für jemanden, der sagen kann, was sie in der anderen
 * Sprache bedeuten — keine Umschreibung.
 */

export const pages: Content['pages'] = {
  about: {
    label: 'Über',
    title: 'Über TransformPipe',
    lede: 'Ein Konverter, der die Arbeit im Browser tut und sonst nicht im Weg steht.',
    sections: [
      {
        heading: 'Was es ist',
        body: [
          'TransformPipe macht aus Dokumenten andere Dokumente. Markdown zu einer fertigen HTML-Seite, und HTML, Word-Dateien, Tabellen und JSON zu Markdown. Eine Datei ablegen, sehen, was daraus wurde, und sie als Markdown, HTML, reinen Text oder PDF mitnehmen.',
          'Alles wird auf Markdown normalisiert, denn Markdown ist ein Format, das man lesen, im Diff vergleichen und zwanzig Jahre aufbewahren kann, ohne das Werkzeug zu besitzen, das es gemacht hat.',
        ],
      },
      {
        heading: 'Warum es so funktioniert',
        body: [
          'Die Umwandlung läuft im Browser. Abgemeldet wird keine Datei irgendwohin gesendet — es gibt keinen Upload, dem man vertrauen müsste, weil es keinen Upload gibt. Angemeldet liegt das Markdown im Konto, sodass ein Dokument einem auf einen anderen Rechner folgt, und es bleibt privat, bis es geteilt wird.',
          'Das exportierte HTML ist eine Datei mit ihren Stilen inline. Sie verlangt nichts vom Netz, was heißt: sie öffnet sich in fünf Jahren auf einem Laptop ohne Verbindung genauso wie heute.',
        ],
      },
      {
        heading: 'Jenseits der App',
        body: [
          'Dieselben Umwandlungen sind aus einem Terminal, aus einem Pull Request und aus einem Assistenten erreichbar: es gibt eine öffentliche API, einen abhängigkeitsfreien Kommandozeilen-Client, eine GitHub Action, die das von einem Pull Request geänderte Markdown veröffentlicht, und einen MCP-Server, damit ein Modell Dokumente in Ihrem Namen umwandeln und teilen kann. Die Dokumentation deckt das alles ab.',
        ],
      },
      {
        heading: 'Wer es baut',
        body: [
          'TransformPipe wird von Raudar Labs gebaut.',
        ],
      },
    ],
    seo: {
      title: 'Über TransformPipe',
      description:
        'TransformPipe wandelt Dokumente in Markdown um und zurück — zehn Formate, im Browser, mit API, CLI, GitHub Action und MCP-Server. Gebaut von Raudar Labs.',
    },
  },
  support: {
    label: 'Support',
    title: 'Support',
    lede: 'Ein Fehler, ein Format, das Ihnen fehlt, oder etwas, das nicht veröffentlicht sein sollte.',
    sections: [
      {
        heading: 'Eine Datei, die falsch umgewandelt wurde',
        body: [
          'Das ist das Nützlichste, was Sie schicken können. Hängen Sie sie an den Issue an, wenn Sie sie teilen dürfen, sagen Sie, was Sie stattdessen erwartet haben, und nennen Sie den Browser, falls es woanders richtig aussah. Eine Umwandlung, die bei einer Datei falsch ist, ist meist bei einer Form falsch — und die Datei ist der Weg zu dieser Form.',
          'Ein Format, das wir noch nicht umwandeln, ist eine Bitte, die sich lohnt. Mehrere der hiesigen haben so angefangen.',
        ],
      },
      {
        heading: 'Etwas Geteiltes, das nicht geteilt sein sollte',
        body: [
          'Jedes geteilte Dokument trägt am Fuß der Seite, die es öffnet, einen Link „Report this document“. Das ist der schnellste Weg: Er benennt das Dokument, ohne dass Sie es beschreiben müssen, und braucht kein Konto.',
        ],
      },
      {
        heading: 'Datenschutz und Rechtliches',
        body: [
          'Fragen dazu, was gespeichert wird, oder die Bitte, ein Konto samt allem darin zu löschen, gehen an dieselben Issues. Angemeldet können Sie jedes Dokument auch selbst löschen — das entfernt den Eintrag und die gespeicherte Quelle zusammen.',
        ],
      },
    ],
    seo: {
      title: 'Support — TransformPipe',
      description:
        'Einen Fehler melden, ein Format wünschen, ein geteiltes Dokument melden oder fragen, was gespeichert ist, und es löschen lassen. Ein Issue in zwei Feldern.',
    },
  },
  extension: {
    label: 'Browser-Erweiterung',
    title: 'Die Browser-Erweiterung',
    lede: 'Die Seite, auf der Sie sind, als Markdown — ohne sie zu verlassen.',
    sections: [
      {
        heading: 'Ein Klick, und die Seite ist ein Dokument',
        body: [
          'Drücken Sie die Schaltfläche in der Symbolleiste: Die Erweiterung liest die Seite, die Sie ansehen, holt den Artikel aus Navigation und Cookie-Hinweisen heraus, macht jede Link- und Bildadresse absolut und gibt Markdown zurück. Kopieren, herunterladen — oder die Seite als eigenständige `.html`-Datei sichern, mit ihrem Design und ihren Bildern in der Datei und ohne einen einzigen Netzwerkaufruf.',
        ],
      },
      {
        heading: 'Die Seiten, die keinen Export haben',
        body: [
          'Dokumentation, ein Wiki, ein Ticket, ein Verlauf — alles, was nur gerendert existiert. Gelesen wird, was Ihr Browser ohnehin auf dem Schirm hat, also wird auch eine Seite umgewandelt, die nur Sie sehen, ohne dass jemand ein Passwort herausgibt: Confluence, Jira und Notion brauchen weder Administrator noch Export noch API-Token.',
        ],
      },
      {
        heading: 'Zwei Arten, sie offen zu halten',
        body: [
          'Die Schaltfläche öffnet ein kompaktes Panel über der Seite. Die Seitenleiste ist dasselbe, daneben offen gehalten: Sie folgt Ihnen von Tab zu Tab und wandelt jede Seite um, sobald Sie ankommen — was Sie wollen, wenn Sie eine ganze Reihe durcharbeiten statt eine einzelne umzuwandeln. Das Kontextmenü wandelt eine Auswahl um.',
        ],
      },
      {
        heading: 'Auch Dateien, ohne sie hochzuladen',
        body: [
          'Dieselben zehn Umwandlungen wie auf der Website — Word, PDF, Tabellen, HTML, CSV, JSON, EPUB und der Rest — laufen in der Erweiterung. Nichts wird hochgeladen, nichts braucht eine Verbindung, und mehrere auf einmal gewählte Dateien werden ein Dokument, in der Reihenfolge, in der Sie sie gewählt haben.',
        ],
      },
      {
        heading: 'Was sie nicht tut',
        body: [
          'Die Berechtigungen sind der kleinste Satz, der die Arbeit erledigt, und der größte davon ist optional:',
        ],
        items: [
          'Abgemeldet spricht sie überhaupt nicht mit uns. Die Umwandlung passiert in der Seite, auf Ihrem Rechner.',
          'Es steckt keine Analyse darin, keine Telemetrie und keine Aufzeichnung darüber, welche Seiten Sie umgewandelt haben.',
          'Sie liest eine Seite nur, wenn Sie ihre Schaltfläche drücken oder die Seitenleiste darauf öffnen, und sie schreibt nie in eine Seite.',
          'Den aktuellen Tab zu lesen wird beim Einschalten der Seitenleiste erteilt; wer es verweigert, verliert die Leiste und sonst nichts.',
        ],
      },
      {
        heading: 'Mit einem Konto',
        body: [
          'Melden Sie sich an — dasselbe Konto wie auf der Website, ein Klick, kein Schlüssel zum Einfügen — und Speichern legt das Dokument dorthin, wo die anderen liegen. Teilen veröffentlicht einen Link oder benennt die Personen, die lesen dürfen; sie werden per E-Mail benachrichtigt und lesen angemeldet als sie selbst.',
        ],
      },
      {
        heading: 'Installieren',
        body: [
          'Chrome holt sie aus dem Chrome Web Store, und die Chromium-Browser ebenso: Edge, Brave, Opera, Arc. Bei der Installation verlangt sie keine Host-Berechtigung — bis Sie ein Konto verbinden, hat sie keinen Grund, mit uns zu sprechen — und die Seitenleiste fragt in dem Moment nach, in dem Sie sie einschalten.',
        ],
      },
    ],
    action: 'Zu Chrome hinzufügen',
    seo: {
      title: 'Browser-Erweiterung — TransformPipe',
      description:
        'Wandeln Sie die geöffnete Seite mit einem Klick in Markdown um, oder eine Datei auf Ihrem Rechner — im Browser, offline und ohne Konto.',
    },
  },
  privacy: {
    label: 'Datenschutz',
    title: 'Datenschutz',
    lede: 'Was gespeichert wird, wo, und was überhaupt nie erhoben wird.',
    sections: [
      {
        heading: 'Abgemeldet erreicht uns nichts',
        body: [
          'Die Umwandlung geschieht im Browser. Die Datei wird auf dem eigenen Rechner gelesen, umgewandelt und gerendert, und kein Teil davon wird an einen Server gesendet. Der Verlauf, der zu sehen ist, ist der Speicher des Browsers, kein Konto.',
        ],
      },
      {
        heading: 'Angemeldet so viel und nicht mehr',
        body: [
          'Ein Konto besteht, damit Dokumente einem von Gerät zu Gerät folgen und geteilt werden können. Es enthält:',
        ],
        items: [
          'Ihre Identität, über unseren Authentifizierungsanbieter: eine E-Mail-Adresse, einen Namen, wo einer angegeben wurde, und eine Konto-id. Bei der Anmeldung mit Google kommen sie von Google; bei der Registrierung mit Adresse und Passwort bleibt das Passwort beim Authentifizierungsanbieter, als Hash. So oder so sehen und speichern wir ein Passwort nie.',
          'Zu jedem behaltenen Dokument: seinen Namen, welche Umwandlung es gemacht hat, seine Größe, die Zahl der Wörter, Überschriften, Links, Codeblöcke, Tabellen und Bilder und den Zeitpunkt seiner Erstellung.',
          'Das Markdown selbst, in einem privaten Blob-Speicher — privat heißt: er hat keine öffentliche URL und wird nur über eine Anfrage gelesen, die wir autorisieren.',
          'API-Schlüssel als Hashes, nie den Schlüssel. Ein Schlüssel wird einmal gezeigt, bei der Erstellung, und ist danach nicht wiederherstellbar — nicht durch Sie und nicht durch uns.',
          'Freigabe-Einstellungen: ob ein Dokument privat, per Link offen oder an bestimmte E-Mail-Adressen gerichtet ist, und das Token, das ein Link trägt.',
        ],
      },
      {
        heading: 'Die Browser-Erweiterung',
        body: [
          'Die Erweiterung wandelt die Seite um, auf der Sie gerade sind – in dieser Seite, auf Ihrem eigenen Rechner. Sie liest eine Seite erst, wenn Sie ihre Schaltfläche drücken oder die Seitenleiste darauf öffnen, sie schreibt nie in eine Seite, und nichts aus einer Seite geht irgendwohin, bevor Sie Speichern oder Teilen drücken – abgemeldet spricht sie überhaupt nicht mit uns.',
        ],
        items: [
          'Aus Ihrem Surfen wird nichts erhoben. In der Erweiterung steckt keine Analyse, keine Telemetrie und nirgends eine Aufzeichnung darüber, welche Seiten Sie umgewandelt haben.',
          'Angemeldet liegt ein OAuth-Token im Erweiterungsspeicher des Browsers – dieselbe Freigabe, die auf Ihrer Kontoseite steht und dort widerrufbar ist. Es ist die einzige Anmeldeinformation der Erweiterung, ein Passwort steckt nicht darin.',
          'Ein umgewandeltes Dokument geht über den Sitzungsspeicher von der Leiste in den Tab, der es zeigt; der Browser leert ihn beim Schließen und schreibt ihn nie auf die Festplatte.',
          'Den Tab zu lesen, auf dem Sie sind, wird beim Einschalten der Seitenleiste erfragt, weil eine Leiste, die Ihnen von Tab zu Tab folgt, nicht bei jedem erneut fragen kann. Die Schaltfläche in der Symbolleiste braucht das nicht: Sie liest genau den einen Tab, auf dem Sie sie gedrückt haben.',
          'Speichern und Teilen senden dieses eine Dokument an Ihr Konto, genau wie die App. Sonst verlässt nichts den Browser.',
        ],
      },
      {
        heading: 'Was wir nicht tun',
        body: [
          'Es gibt keine Werbung, kein Tracking-Pixel und nichts wird verkauft. Genau ein Skript von Dritten lädt überhaupt — der Google Tag Manager — und es bringt Google Analytics nur mit, wenn Sie im Cookie-Banner zugestimmt haben; bei Ablehnung oder ohne Antwort schreiben Googles Tags nichts in Ihren Browser. Nichts wird mit irgendjemandem geteilt außer mit der Infrastruktur, die den Dienst betreibt: der Datenbank, dem Blob-Speicher, dem Authentifizierungsanbieter, dem E-Mail-Anbieter und dem Hoster.',
          'Ihre Dokumente werden von uns nicht gelesen, und sie werden nicht dazu benutzt, irgendetwas zu trainieren.',
        ],
      },
      {
        heading: 'E-Mail',
        body: [
          'E-Mails gehen in vier Fällen hinaus und in keinem anderen: zur Bestätigung Ihrer Adresse, zum Zurücksetzen eines Passworts, zur einmaligen Begrüßung nach der Registrierung und um jemandem mitzuteilen, dass ein Dokument mit ihm geteilt wurde. Die ersten beiden kommen vom Authentifizierungsanbieter, die anderen beiden vom E-Mail-Anbieter. Es gibt keinen Newsletter, und es gibt nichts abzubestellen.',
          'Der E-Mail-Anbieter erhält die Adresse des Empfängers, die Adresse der teilenden Person, wo es eine gibt, und die Nachricht selbst. Ein Dokument erhält er nie.',
        ],
      },
      {
        heading: 'Cookies und Browser-Speicher',
        body: [
          'Ein Sitzungscookie, gesetzt von unserem Authentifizierungsanbieter bei der Anmeldung, First-Party und HttpOnly. Ein kurzlebiges Cookie besteht während des Hin und Her der Anmeldung und läuft nach zehn Minuten ab. Das sind alle — es gibt nichts Optionales zum Abschalten. Die Cookie-Seite hat die Einzelheiten.',
          'Ihr Design und, abgemeldet, Ihr Verlauf liegen im lokalen Speicher Ihres Browsers. Sie verlassen ihn nie.',
        ],
      },
      {
        heading: 'Dinge löschen',
        body: [
          'Ein Dokument zu löschen löscht die Zeile und das gespeicherte Markdown zusammen, sofort, nicht nach einem Zeitplan. Ein Widerruf einer Freigabe verwirft das Token, ein schon verschickter Link hört also auf zu funktionieren.',
          'Um ein Konto samt allem darin zu entfernen, fragen Sie nach — siehe die Support-Seite. Eine erreichte Speichergrenze weist den Schreibvorgang ab; sie löscht nie etwas, das Sie behalten wollten, um Platz zu machen.',
        ],
      },
      {
        heading: 'Kinder',
        body: [
          'Das ist ein Werkzeug für die Arbeit, kein Dienst für Kinder, und es richtet sich an niemanden unter 16.',
        ],
      },
      {
        heading: 'Änderungen',
        body: [
          'Ändert sich diese Seite in einer Weise, die betrifft, was erhoben wird, ändert sich das Datum darüber mit.',
        ],
      },
    ],
    seo: {
      title: 'Datenschutz — TransformPipe',
      description:
        'Abgemeldet verlässt keine Datei den Browser. Angemeldet speichern wir Dokument, Metadaten und Konto-Identität — Analyse nur mit Ihrer Zustimmung, keine Tracking-Pixel, nichts wird verkauft.',
    },
  },
  terms: {
    label: 'Bedingungen',
    title: 'Nutzungsbedingungen',
    lede: 'Die kurze Fassung, weil eine lange nicht gelesen würde.',
    sections: [
      {
        heading: 'Den Dienst nutzen',
        body: [
          'TransformPipe wird kostenlos angeboten, so wie es ist. Nutzen Sie es für alles, was Sie umzuwandeln berechtigt sind, aus der App, der API, der Kommandozeile oder einem Assistenten.',
          'Ein Konto gehört Ihnen, zum Behalten oder Löschen. Sie sind verantwortlich für das, was Sie mit einem API-Schlüssel tun, behandeln Sie einen also wie ein Passwort: wer ihn hat, kann Ihre Dokumente lesen und schreiben.',
        ],
      },
      {
        heading: 'Ihre Dokumente bleiben Ihre',
        body: [
          'Sie behalten an einem Dokument jedes Recht, das Sie vor der Umwandlung daran hatten. Wir beanspruchen kein Eigentum und keine Lizenz über das hinaus, was der Betrieb des Dienstes verlangt: es zu speichern, damit Sie es wieder öffnen können, und es dem auszuliefern, mit dem Sie es bewusst geteilt haben.',
        ],
      },
      {
        heading: 'Was hier nicht hingehört',
        body: [
          'Nutzen Sie den Dienst nicht für Inhalte, die rechtswidrig sind, zu deren Verbreitung Sie nicht berechtigt sind oder die dazu da sind, jemandem zu schaden — Schadsoftware, Material, das Kinder sexuell ausbeutet, gezielte Belästigung. Nutzen Sie keinen Freigabelink, um eine Phishing-Seite zu betreiben.',
          'Geteilte Dokumente können von jedem gemeldet werden, der sie öffnet. Ein Dokument, das gegen diesen Abschnitt verstößt, kann zurückgezogen oder gelöscht werden, und ein wiederholt auffälliges Konto geschlossen.',
        ],
      },
      {
        heading: 'Grenzen und Verfügbarkeit',
        body: [
          'Es gelten Grenzen für Rate und Speicher, und sie sind in der Dokumentation veröffentlicht. Sie bestehen, um den Dienst am Laufen zu halten, und können sich ändern.',
          'Es gibt kein Verfügbarkeitsversprechen. Der Dienst kann unterbrochen werden, und Funktionen können sich ändern oder wegfallen. Behalten Sie von allem, was Sie nicht verlieren dürfen, eine eigene Kopie — genau dafür gibt es den Download, und zum Öffnen braucht er nichts von uns.',
        ],
      },
      {
        heading: 'Keine Garantie, und die Grenze unserer Haftung',
        body: [
          'Der Dienst wird ohne jede Gewährleistung bereitgestellt, ausdrücklich oder stillschweigend. Soweit das Gesetz es zulässt, haftet Raudar Labs nicht für verlorene Daten, entgangenen Gewinn oder mittelbare Schäden und Folgeschäden aus der Nutzung.',
          'Nichts hier begrenzt ein Recht, das Sie haben und das durch Vereinbarung nicht begrenzt werden kann.',
        ],
      },
      {
        heading: 'Änderungen und Beenden',
        body: [
          'Diese Bedingungen können sich ändern; das Datum darüber sagt, wann sie es zuletzt getan haben, und die weitere Nutzung des Dienstes ist ihre Annahme. Sie können jederzeit aufhören, indem Sie Ihre Dokumente und Ihr Konto löschen.',
        ],
      },
    ],
    seo: {
      title: 'Nutzungsbedingungen — TransformPipe',
      description:
        'TransformPipe ist kostenlos und wird so bereitgestellt, wie es ist. Die Dokumente bleiben Ihre, die Grenzen sind veröffentlicht, eine Garantie gibt es nicht.',
    },
  },
  cookies: {
    label: 'Cookies',
    title: 'Cookies',
    lede: 'Zwei sind zum Anmelden nötig. Eines ist optional — die Analyse — und es bleibt aus, bis Sie zustimmen.',
    sections: [
      {
        heading: 'Das eine, das Sie wählen',
        body: [
          'Die meisten Cookie-Seiten bestehen, damit man Analyse und Werbung ablehnen kann. Werbung gibt es hier überhaupt nicht. Die Analyse ist Google Analytics, geladen über den Google Tag Manager, und sie ist der einzige Schalter dieser Seite: Beim ersten Besuch fragt das Banner, der Knopf am Fuß dieser Seite öffnet die Antwort wieder, und bis Sie zustimmen schreiben Googles Tags nichts in Ihren Browser und senden höchstens cookielose Pings.',
          'Abgemeldet und mit abgelehnter oder unbeantworteter Analyse setzt diese Seite überhaupt keine Cookies.',
        ],
      },
      {
        heading: 'Die zwei, die es gibt',
        body: [
          'Beide werden von unserem Authentifizierungsanbieter gesetzt, sind First-Party und als HttpOnly und Secure markiert — ein Skript auf der Seite kann sie nicht lesen:',
        ],
        items: [
          '__Secure-neon-auth.session_token — hält Sie angemeldet. Ohne es würde jeder Seitenaufruf erneut eine Anmeldung verlangen. Es geht, wenn Sie sich abmelden.',
          '__Secure-neon-auth.session_challenge — besteht für die zehn Minuten des Hin und Her einer Anmeldung, damit die Antwort von Google der Anfrage zugeordnet werden kann, die sie ausgelöst hat. Es ist das, was verhindert, dass die Anmeldung eines anderen in Ihrer Sitzung landet.',
        ],
      },
      {
        heading: 'Browser-Speicher, der kein Cookie ist',
        body: [
          'Zwei Dinge liegen im lokalen Speicher Ihres Browsers und werden nie irgendwohin gesendet: das gewählte Design und — solange Sie abgemeldet sind — Ihre letzten Umwandlungen, damit im Verlauf etwas steht. Das Löschen der Websitedaten im Browser entfernt beides, und die App läuft ohne sie weiter.',
        ],
      },
      {
        heading: 'Wenn sich das ändert',
        body: [
          'Sollte je etwas Optionales hinzukommen, bekommt diese Seite eine echte Steuerung, bevor es gesetzt wird, nicht danach. Das Datum darüber wird sagen, wann.',
        ],
      },
    ],
    seo: {
      title: 'Cookies — TransformPipe',
      description:
        'Zwei First-Party-Sitzungscookies, beide zum Anmelden nötig. Keine Analyse, keine Werbung, nichts Optionales zum Einstellen.',
    },
  },

  /*
   * Die Anleitungsseiten: eine je Endung, die die Ablagefläche annimmt.
   *
   * Sie antworten, statt zu argumentieren, und genau das trennt sie vom Blog. Jemand hat eine Datei
   * und keine Ahnung, was sie öffnet; er hat nach der Endung gesucht; er will die Antwort im ersten
   * Absatz und unten einen Weg aus dem Problem heraus. Also: was das Ding ist, was es auf welcher
   * Art von Rechner öffnet, was schiefgeht, und die Umwandlung, die die Frage beendet.
   */
  'how-to-md': {
    label: 'Eine .md-Datei öffnen',
    title: 'Wie man eine .md-Datei öffnet',
    lede: 'Eine Markdown-Datei ist reiner Text. Alles, was Text öffnet, öffnet sie — die Frage ist, was sie wie ein Dokument aussehen lässt.',
    sections: [
      {
        heading: 'Was es ist',
        body: [
          'Eine `.md`-Datei ist eine Textdatei mit ein paar Konventionen darin: eine Raute für eine Überschrift, Sternchen für Betonung, Bindestriche für eine Liste. Nichts in der Datei ist binär und nichts ist komprimiert, ein Texteditor zeigt also sofort die ganze Wahrheit über sie.',
          'Genau deshalb sieht sie unfertig aus. Die Konventionen sind Anweisungen für einen Renderer, und bis etwas sie rendert, liest man die Anweisungen statt des Dokuments.',
        ],
      },
      {
        heading: 'Auf einem Computer',
        body: [
          'Unter Windows öffnet Notepad sie und zeigt den rohen Text. Auf einem Mac tut TextEdit dasselbe, fragt aber unter Umständen zuerst, ob es die Datei umwandeln soll — ablehnen, dann bleibt sie reiner Text. Auf beiden rendert VS Code eine Live-Vorschau neben der Quelle, und das kommt der fertigen Seite am nächsten, ohne den Editor zu verlassen.',
          'Die Datei auf ein Browserfenster zu ziehen funktioniert nicht so, wie man es erwartet: der Browser zeigt den rohen Text oder bietet an, ihn herunterzuladen, denn kein Browser rendert Markdown von sich aus.',
        ],
      },
      {
        heading: 'Auf einem Telefon',
        body: [
          'Auf den meisten Telefonen ist kein Markdown-Reader installiert, und sie bieten an, die Datei in einer Notizen- oder Dateien-App zu öffnen, die den Text so zeigt, wie er geschrieben ist. Unter iOS zeigt Dateien eine Vorschau als reinen Text; unter Android hängt das Verhalten davon ab, welcher Texteditor installiert ist.',
          'Sie vorher in HTML umzuwandeln geht meist schneller, als einen Reader zu suchen, denn jedes Telefon hat schon einen Browser, und jeder Browser öffnet HTML.',
        ],
      },
      {
        heading: 'Was üblicherweise schiefgeht',
        body: [
          'Eine Datei, die ein Texteditor mit seiner eigenen Endung als `notes.md.txt` gespeichert hat, wird von nichts erkannt, das nach Markdown sucht. Umbenennen, und das Problem ist weg.',
          'Tabellen, Fußnoten und Aufgabenlisten stehen nicht in der ursprünglichen Markdown-Spezifikation, ein Reader, der die Pipe-Zeichen und Klammern wörtlich anzeigt, ist also nicht kaputt — er setzt den Kern um und nicht die Erweiterungen.',
        ],
      },
    ],
    action: 'Eine .md-Datei in HTML umwandeln',
    seo: {
      title: 'Wie man eine .md-Datei öffnet — TransformPipe',
      description:
        'Was eine Markdown-Datei ist, was sie unter Windows, macOS und am Telefon öffnet, warum der Browser rohen Text zeigt und wie daraus eine Seite wird.',
    },
  },
  'how-to-html': {
    label: 'Eine .html-Datei öffnen',
    title: 'Wie man eine .html-Datei öffnet',
    lede: 'Jeder Browser öffnet sie. Die interessante Frage ist, was man tut, wenn man die Worte daraus haben will und nicht die Seite.',
    sections: [
      {
        heading: 'Was es ist',
        body: [
          'Eine `.html`-Datei ist die Seite selbst: der Text und das Markup, das sagt, welcher Teil eine Überschrift, ein Link, eine Tabelle ist. Sie kann außerdem auf Stile, Bilder und Skripte verweisen, die anderswo liegen, und deshalb sieht eine gespeicherte Seite manchmal nach gar nichts aus.',
        ],
      },
      {
        heading: 'Sie öffnen',
        body: [
          'Ein Doppelklick öffnet sie auf jedem Desktop-System im Standardbrowser. Öffnet sie sich stattdessen in einem Editor, per Rechtsklick „Öffnen mit“ wählen und dann einen Browser.',
          'Auf einem Telefon reicht ein Dateimanager sie meist an den Browser weiter. Weigert er sich, hilft es normalerweise, sich die Datei selbst zu mailen und den Anhang zu öffnen, denn Mail-Programme geben HTML an eine Web-Ansicht.',
        ],
      },
      {
        heading: 'Wenn sie leer oder ohne Gestaltung öffnet',
        body: [
          'Eine Seite, die mit „Speichern unter, Webseite, komplett“ gesichert wurde, behält ihre Stile und Bilder in einem Ordner neben der Datei. Verschiebt man die Datei ohne den Ordner, verliert die Seite alles außer ihrem Text.',
          'Eine Seite, die als einzelne Datei gespeichert wurde, hat alles in sich und öffnet überall gleich. Deshalb ist ein Export, der sich zu behalten lohnt, ein in sich geschlossener.',
        ],
      },
      {
        heading: 'Den Text herausbekommen',
        body: [
          'Aus dem Browser zu kopieren gibt einem die Worte und verliert die Struktur: Überschriften werden zu gewöhnlichen Zeilen, Tabellen zu aneinandergereihtem Text. Die Datei in Markdown umzuwandeln behält die Struktur als etwas, das man lesen und bearbeiten kann — und das ist meist, was eigentlich gemeint war.',
        ],
      },
    ],
    action: 'Eine .html-Datei in Markdown umwandeln',
    seo: {
      title: 'Wie man eine .html-Datei öffnet — TransformPipe',
      description:
        'Wie man eine HTML-Datei am Computer oder am Telefon öffnet, warum eine gespeicherte Seite ihre Gestaltung verliert und wie der Text samt Struktur herauskommt.',
    },
  },
  'how-to-docx': {
    label: 'Eine .docx-Datei öffnen',
    title: 'Wie man eine .docx-Datei öffnet',
    lede: 'Eine .docx ist ein Zip-Archiv aus XML. Word öffnet sie, und einiges Kostenlose tut es auch.',
    sections: [
      {
        heading: 'Was es ist',
        body: [
          'Eine `.docx` ist kein einzelnes Dokument, sondern ein komprimierter Ordner: benennt man sie in `.zip` um, lässt sie sich öffnen, und darin liegen der Text, die Stile und die Bilder als getrennte Dateien. Das ist das Format, und deshalb lässt sich eine `.docx` in einem Texteditor nicht sinnvoll lesen.',
        ],
      },
      {
        heading: 'Ohne Word zu kaufen',
        body: [
          'Google Docs öffnet eine `.docx`, indem man sie in Drive hochlädt, LibreOffice Writer öffnet sie auf jedem Desktop-System und ist kostenlos, und sowohl Apple Pages als auch Microsofts eigene Web-Version von Word öffnen eine ohne bezahlte Lizenz.',
          'Auf einem Telefon öffnet die Word-App `.docx`-Dateien zum Lesen ohne Abonnement; beim Bearbeiten fängt die Bezahlschranke an.',
        ],
      },
      {
        heading: 'Wenn sie sich nicht öffnen lässt',
        body: [
          'Eine Datei, die als `document.docx` ankommt, sich aber in nichts öffnen lässt, ist oft eine `.doc` — das ältere Format — mit der falschen Endung, oder eine Datei, deren Download nicht fertig wurde. Zuerst die Größe prüfen: ein abgebrochener Download ist meist offensichtlich zu klein.',
          'Eine passwortgeschützte `.docx` öffnet den Dialog und sonst nichts. Daran kommt kein Konverter vorbei, was eine Eigenschaft der Datei ist und keine Grenze des Werkzeugs.',
        ],
      },
      {
        heading: 'Die Worte behalten, das Layout fallen lassen',
        body: [
          'Die Umwandlung in Markdown behält die Überschriften, Listen, Links und Tabellen und wirft Schriften, Ränder und Seitenumbrüche weg. Für Text, der in einem Repository, einem Wiki oder einem Diff leben muss, ist dieser Tausch der Sinn der Sache und kein Verlust.',
        ],
      },
    ],
    action: 'Eine .docx-Datei in Markdown umwandeln',
    seo: {
      title: 'Wie man eine .docx-Datei öffnet — TransformPipe',
      description:
        'Was eine .docx wirklich ist, wie man eine ohne Word öffnet, was zu tun ist, wenn sie sich nicht öffnen lässt, und wie der Text bleibt und das Layout geht.',
    },
  },
  'how-to-csv': {
    label: 'Eine .csv-Datei öffnen',
    title: 'Wie man eine .csv-Datei öffnet',
    lede: 'Eine Tabellenkalkulation öffnet sie, ein Texteditor zeigt, was wirklich darin steht, und der Unterschied wiegt schwerer, als es klingt.',
    sections: [
      {
        heading: 'Was es ist',
        body: [
          'Eine `.csv` sind Zeilen aus Text mit einem Trennzeichen zwischen den Feldern — meist ein Komma, manchmal ein Semikolon oder ein Tabulator. Es gibt keine Typen, keine Formeln und keine Formatierung: jeder Wert ist eine Zeichenkette, und alles, was wie ein Datum oder eine Zahl aussieht, ist eine Vermutung Ihrer Software.',
        ],
      },
      {
        heading: 'Sie öffnen',
        body: [
          'Ein Doppelklick öffnet sie auf den meisten Rechnern in Excel oder Numbers, und in LibreOffice Calc, wenn das installiert ist. Google Sheets importiert eine über „Datei, Importieren“.',
          'Sie zuerst in einem Texteditor zu öffnen ist die zehn Sekunden wert: er zeigt das tatsächliche Trennzeichen, ob die erste Zeile eine Kopfzeile ist und ob die Felder in Anführungszeichen stehen — drei Dinge, die eine Tabellenkalkulation stillschweigend für Sie entscheidet.',
        ],
      },
      {
        heading: 'Wenn die Spalten falsch herauskommen',
        body: [
          'Landet alles in einer Spalte, ist das Trennzeichen Ihrer Datei nicht das, was Ihre Tabellenkalkulation erwartet hat. Nehmen Sie in Excel „Daten, Aus Text/CSV“ statt des Doppelklicks und setzen Sie das Trennzeichen selbst.',
          'Kommen Akzentzeichen als Unsinn heraus, passen die Kodierungen nicht zusammen: die Datei ist UTF-8, und das Programm hat etwas anderes angenommen. Derselbe Import-Dialog lässt Sie das sagen.',
          'Führende Nullen, die aus Postleitzahlen oder Teilenummern verschwinden, sind hinterher nicht wiederherstellbar — die Tabellenkalkulation hat den Wert beim Öffnen in eine Zahl verwandelt. Importieren Sie die Spalte stattdessen als Text.',
        ],
      },
      {
        heading: 'Sie in ein Dokument bringen',
        body: [
          'Einen Tabellenbereich in ein Dokument zu kopieren gibt einem entweder ein Bild einer Tabelle oder ein Durcheinander, je nachdem, wohin man es einfügt. Die Datei in eine Markdown-Tabelle umzuwandeln gibt einem Zeilen, die ein Kopieren, einen Diff und einen Pull Request überstehen.',
        ],
      },
    ],
    action: 'Eine .csv-Datei in eine Markdown-Tabelle umwandeln',
    seo: {
      title: 'Wie man eine .csv-Datei öffnet — TransformPipe',
      description:
        'Wie man eine CSV öffnet, warum die Spalten manchmal in einer einzigen landen, was führende Nullen und Akzentzeichen zerstört und wie eine Tabelle daraus wird.',
    },
  },
  'how-to-json': {
    label: 'Eine .json-Datei öffnen',
    title: 'Wie man eine .json-Datei öffnet',
    lede: 'Es ist Text, also öffnet alles sie. Das Lesen ist der Teil, der Hilfe braucht.',
    sections: [
      {
        heading: 'Was es ist',
        body: [
          'Eine `.json`-Datei enthält strukturierte Daten: Objekte mit benannten Feldern, Listen von Dingen, Zahlen und Zeichenketten. Es ist das Format, in dem eine API antwortet, und das, in das die meisten Programme ihre Einstellungen exportieren — deshalb taucht eine ohne Erklärung im Download-Ordner auf.',
        ],
      },
      {
        heading: 'Sie öffnen',
        body: [
          'Sie in ein Browserfenster zu ziehen funktioniert gut: Firefox und Chrome zeigen beide eine aufklappbare, durchsuchbare Ansicht statt rohen Textes. VS Code öffnet sie mit Faltung und formatiert eine einzeilige Datei mit einem Befehl neu.',
          'Ein sehr großer Export — zig Megabyte — bringt einen Editor ins Straucheln. Ein Kommandozeilen-Werkzeug wie `jq` liest solche Dateien, ohne die ganze Datei in ein Fenster zu laden.',
        ],
      },
      {
        heading: 'Wenn sie sich nicht parsen lässt',
        body: [
          'Die drei üblichen Fehler sind ein Komma hinter dem letzten Eintrag, einfache Anführungszeichen, wo das Format doppelte verlangt, und ein Kommentar — JSON hat keine Kommentare, wie auch immer die Datei ausgesehen hat, aus der es kam.',
          'Einer Fehlermeldung, die Zeile und Spalte nennt, kann man trauen: der Parser hat genau dort aufgehört, und der Fehler liegt meist ein Zeichen davor.',
        ],
      },
      {
        heading: 'Sie für einen Menschen lesbar machen',
        body: [
          'Eine aufklappbare Ansicht ist zum Prüfen von Daten da. Geht es darum, sie jemandem zu zeigen, macht die Umwandlung in Markdown aus einer Liste von Datensätzen eine Tabelle und aus verschachtelten Objekten Abschnitte mit Überschriften — dieselbe Information, in einer Form, die das Einfügen in ein Dokument übersteht.',
        ],
      },
    ],
    action: 'Eine .json-Datei in Markdown umwandeln',
    seo: {
      title: 'Wie man eine .json-Datei öffnet — TransformPipe',
      description:
        'Wie man eine JSON-Datei im Browser oder im Editor öffnet und liest, die drei Dinge, die das Parsen meist zerstören, und wie etwas Lesbares daraus wird.',
    },
  },
  'how-to-txt': {
    label: 'Eine .txt-Datei öffnen',
    title: 'Wie man eine .txt-Datei öffnet',
    lede: 'Nichts öffnet sich leichter. Die Probleme fangen an, wenn der Text auf einer anderen Art von Rechner geschrieben wurde.',
    sections: [
      {
        heading: 'Was es ist',
        body: [
          'Eine `.txt`-Datei besteht aus Zeichen und Zeilenumbrüchen, und nichts darin beschreibt, wie das aussehen soll. Das ist ihre Stärke: sie öffnet sich auf jedem je gebauten System und wird sich auch in dreißig Jahren noch öffnen.',
        ],
      },
      {
        heading: 'Sie öffnen',
        body: [
          'Jedes Betriebssystem hat einen Editor, der sie per Doppelklick öffnet — Notepad, TextEdit, gedit. Ein Browser öffnet eine, die man auf sein Fenster zieht. Ein Telefon zeigt sie in seiner Dateien-App als Vorschau.',
        ],
      },
      {
        heading: 'Wenn sie als eine lange Zeile oder als Kästchen öffnet',
        body: [
          'Unter Windows geschriebener Text beendet seine Zeilen mit zwei Zeichen, unter Unix geschriebener mit einem. Ältere Editoren, die die jeweils andere Konvention erwarten, zeigen die Datei als eine einzige durchlaufende Zeile oder zeichnen an jedem Umbruch ein kleines Kästchen. Jeder moderne Editor kommt mit beidem zurecht; Notepad seit 2018.',
          'Unsinnige Zeichen dort, wo Akzente oder Anführungszeichen stehen sollten, sind eine nicht passende Kodierung — die Datei ist UTF-8, und der Editor hat eine ältere Ein-Byte-Kodierung geraten. Die meisten Editoren lassen einen die Datei mit einer selbst genannten Kodierung erneut öffnen.',
        ],
      },
      {
        heading: 'Wenn daraus ein Dokument werden soll',
        body: [
          'Reinen Text als Markdown zu behandeln sieht so lange nach einer guten Idee aus, bis eine Zeile, die mit einem Bindestrich beginnt, zum Aufzählungspunkt wird, ein Sternchen mitten im Satz den halben Absatz kursiv setzt und eine Jahreszahl am Zeilenanfang zur nummerierten Liste. Eine ordentliche Umwandlung maskiert diese Zeichen zuerst, sodass die Seite sagt, was die Datei gesagt hat.',
        ],
      },
    ],
    action: 'Eine .txt-Datei in Markdown umwandeln',
    seo: {
      title: 'Wie man eine .txt-Datei öffnet — TransformPipe',
      description:
        'Wie man eine Textdatei öffnet, warum sie manchmal als eine lange Zeile oder als Kästchen erscheint und wie daraus ein Dokument ohne neue Formatierung wird.',
    },
  },
  'how-to-xlsx': {
    label: 'Eine .xlsx-Datei öffnen',
    title: 'Wie man eine .xlsx-Datei öffnet',
    lede: 'Excel ist nicht das Einzige, was eine öffnet, und zum Lesen einer Tabelle ist es selten das Schnellste.',
    sections: [
      {
        heading: 'Was es ist',
        body: [
          'Eine `.xlsx` ist ein Zip-Archiv aus XML, gebaut wie eine `.docx`: Blätter, Stile und gemeinsam genutzte Zeichenketten als getrennte Dateien in einem komprimierten Ordner. Sie hält Typen, Formeln, Formatierung und mehrere Blätter auf einmal, also alles, was eine CSV nicht kann.',
        ],
      },
      {
        heading: 'Ohne Excel zu kaufen',
        body: [
          'Google Sheets importiert eine über „Datei, Importieren“. LibreOffice Calc öffnet sie auf jedem Desktop-System und ist kostenlos. Apple Numbers öffnet eine auf einem Mac, und Microsofts eigene Web-Version von Excel liest eine ohne bezahlte Lizenz.',
        ],
      },
      {
        heading: 'Was zu prüfen ist, bevor man den Zahlen traut',
        body: [
          'Eine Zelle, die `####` zeigt, ist eine zu schmale Spalte und keine kaputte Datei. Ein Datum, das als fünfstellige Zahl dasteht, ist der zugrunde liegende Serienwert, dem die Formatierung abhandengekommen ist.',
          'Formeln werden neben ihrem zuletzt berechneten Ergebnis gespeichert. Eine Datei, die in etwas geöffnet wird, das sie nicht auswertet, zeigt die Ergebnisse, und die stimmen für den Zeitpunkt, an dem die Datei zuletzt gespeichert wurde, nicht unbedingt für jetzt.',
        ],
      },
      {
        heading: 'Ein Blatt in ein Dokument bekommen',
        body: [
          'Der übliche Weg ist, jedes Blatt nach CSV zu exportieren und das umzuwandeln, wobei alles außer dem aktiven Blatt verloren geht. Die Arbeitsmappe direkt umzuwandeln gibt einem eine Markdown-Tabelle je Blatt, mit einem Inhaltsverzeichnis, wenn es mehr als eines gibt.',
        ],
      },
    ],
    action: 'Eine .xlsx-Datei in Markdown-Tabellen umwandeln',
    seo: {
      title: 'Wie man eine .xlsx-Datei öffnet — TransformPipe',
      description:
        'Wie man eine Excel-Arbeitsmappe ohne Excel öffnet, was #### und fünfstellige Datumswerte bedeuten und wie aus jedem Blatt eine Markdown-Tabelle wird.',
    },
  },
  'how-to-pptx': {
    label: 'Eine .pptx öffnen',
    title: 'Wie man eine .pptx-Datei öffnet',
    lede: 'Das Öffnen ist einfach. Sie zu lesen, ohne den Vortrag zu besuchen, ist der Teil, bei dem nichts hilft.',
    sections: [
      {
        heading: 'Was sie ist',
        body: [
          'Eine `.pptx` ist ein Zip-Archiv aus XML, genauso gebaut wie eine `.docx` oder eine `.xlsx`: eine Datei je Folie, eine je Notizenseite, die Bilder daneben. Das ältere `.ppt` ist etwas ganz anderes — ein Binärformat von vor 2007, das die meisten Programme, die eine `.pptx` öffnen, ebenfalls umwandeln können.',
        ],
      },
      {
        heading: 'Ohne PowerPoint zu kaufen',
        body: [
          'Google Slides importiert sie über Datei, Öffnen. LibreOffice Impress öffnet sie auf jedem Desktop-System und ist kostenlos. Keynote öffnet sie auf dem Mac, und Microsofts eigene Web-Version von PowerPoint liest sie ohne bezahlte Lizenz.',
          'Auf dem Mac genügt die Leertaste im Finder, um alle Folien zu sehen, ohne überhaupt etwas zu öffnen.',
        ],
      },
      {
        heading: 'Wo die Notizen stecken',
        body: [
          'Unter der Folie, in einem Bereich, den die meisten Programme zunächst ausblenden: Ansicht, dann Notizen — in PowerPoint wie in Google Slides. Dort steht der Gedankengang üblicherweise in ganzen Sätzen, während die Folie darüber nur die Zusammenfassung ist, die jemand vorgelesen hat.',
          'Beim Export als PDF gehen sie verloren, sofern man nicht das Layout mit Notizenseiten wählt — weshalb einem als PDF herumgereichten Foliensatz so oft die Hälfte fehlt, die ihn erklärt hat.',
        ],
      },
      {
        heading: 'Vom Foliensatz zum Dokument',
        body: [
          'Der übliche Weg ist, den Text jeder Folie von Hand herauszukopieren — dabei gehen die Notizen verloren, weil sie währenddessen gar nicht zu sehen sind. Wandelt man die Datei direkt um, entsteht ein Abschnitt je Folie in der Reihenfolge der Präsentation, mit Aufzählungen, Tabellen und Notizen weiterhin bei der Folie, zu der sie gehören.',
        ],
      },
    ],
    action: 'Eine .pptx in Markdown umwandeln',
    seo: {
      title: 'Wie man eine .pptx-Datei öffnet — TransformPipe',
      description:
        'Wie man eine PowerPoint-Datei ohne PowerPoint öffnet, wo sich die Notizen verstecken und wie aus einem ganzen Foliensatz ein lesbares Dokument wird.',
    },
  },
  'how-to-epub': {
    label: 'Eine .epub öffnen',
    title: 'Wie man eine .epub-Datei öffnet',
    lede: 'Öffnen kann sie jedes Lesegerät. Umständlich wird es erst, wenn man den Text herausbekommen will.',
    sections: [
      {
        heading: 'Was sie ist',
        body: [
          'Eine `.epub` ist ein Zip-Archiv aus XHTML — eine Webseite je Kapitel, ein Stylesheet, die Bilder und eine Paketdatei, die alles auflistet und die Lesereihenfolge festlegt. Es ist das offene Format, auf das sich die ganze Branche geeinigt hat; `.azw3` und `.mobi` vom Kindle sind die Ausnahme, nicht der Standard.',
        ],
      },
      {
        heading: 'Zum Lesen',
        body: [
          'Apple Books öffnet sie auf dem Mac, dem iPhone und dem iPad, Microsoft Edge unter Windows ganz ohne Installation. Calibre ist das kostenlose Desktop-Programm, das zusätzlich zwischen Formaten umwandelt, und Thorium empfiehlt sich, wenn man ein Leseprogramm will, das sich eng an die Spezifikation hält.',
          'Ein Kindle liest `.epub` nicht direkt, aber Amazons „An Kindle senden“ nimmt eine an und wandelt sie unterwegs um.',
        ],
      },
      {
        heading: 'Warum Umbenennen in .zip fast funktioniert',
        body: [
          'Weil sie eine ist. Entpackt man eine `.epub`, liegt jedes Kapitel als Datei da, die sich im Browser öffnen lässt. Was fehlt, ist die Reihenfolge: die Dateien heißen häufig `index_split_030.xhtml`, `index_split_002.xhtml` und so weiter, und diese Zahlen sind nur das, was das erzeugende Programm gerade geschrieben hat. Die Lesereihenfolge steht in der Spine der Paketdatei und sonst nirgends.',
        ],
      },
      {
        heading: 'Vom Buch zum Dokument',
        body: [
          'Wandelt man sie direkt um, entsteht ein Markdown-Dokument: die Kapitel in der Reihenfolge der Spine, unter den Titeln aus dem Inhaltsverzeichnis des Buchs, mit den Bildern in der Datei und mit Querverweisen, von denen nur die Worte bleiben — denn in einem zusammengeführten Dokument haben sie kein Ziel mehr.',
        ],
      },
    ],
    action: 'Eine .epub in Markdown umwandeln',
    seo: {
      title: 'Wie man eine .epub-Datei öffnet — TransformPipe',
      description:
        'Wie man ein EPUB auf jedem Gerät öffnet, warum beim Entpacken die Kapitelreihenfolge verlorengeht und wie aus einem Buch ein durchsuchbares Dokument wird.',
    },
  },
  'how-to-odt': {
    label: 'Eine .odt öffnen',
    title: 'Wie man eine .odt-Datei öffnet',
    lede: 'Der internationale Standard für ein Textdokument — und Word öffnet ihn ebenfalls.',
    sections: [
      {
        heading: 'Was sie ist',
        body: [
          'Eine `.odt` ist ein Zip aus XML — `content.xml` für die Worte, `styles.xml` für ihr Aussehen, ein `Pictures`-Ordner — und sie ist OpenDocument Text, ein ISO-Standard und nicht das Format einer einzelnen Firma. LibreOffice und OpenOffice schreiben sie standardmäßig, und Google Docs gibt sie unter Datei, Herunterladen heraus.',
        ],
      },
      {
        heading: 'Zum Öffnen',
        body: [
          'LibreOffice ist die naheliegende Antwort und auf jedem Desktop-System kostenlos. Microsoft Word öffnet und speichert `.odt` seit 2007, ebenso Word im Web; Google Docs importiert sie über Datei, Öffnen. Apple Pages öffnet sie auch, will sie aber als etwas anderes zurückspeichern.',
          'Wenn Sie sie nur lesen wollen, steht Ihnen das Zip offen: entpacken, und `content.xml` ist das Dokument, Tags inklusive.',
        ],
      },
      {
        heading: 'Was meistens schiefgeht',
        body: [
          'Der Umweg über Word. Eine in Word geöffnete und wieder gespeicherte `.odt` behält ihre Worte und verliert einen Teil ihrer Formatierung, weil sich die beiden Programme nicht über jede Formatvorlage einig sind — ein Problem nur dann, wenn sie danach wieder jemand in LibreOffice öffnet.',
          'Schriften, wie bei jedem Dokumentformat. Eine Datei, die eine Schrift nennt, die es auf Ihrem Rechner nicht gibt, wird mit dem Ersatz gesetzt, den das Programm wählt — und eine Seitenzahl, auf die es ankam, ist nicht mehr dieselbe.',
        ],
      },
      {
        heading: 'Vom Dokument zum Markdown',
        body: [
          'Dieses Format wandelt sich am treuesten von allen um, weil es benennt, was etwas ist, statt wie es aussieht: eine Überschrift kennt ihre Ebene, eine Liste ihre Verschachtelung, eine Tabelle ist eine Tabelle und eine Fußnote eine Fußnote. Beim Umwandeln bleibt all das erhalten, die Bilder inbegriffen.',
        ],
      },
    ],
    action: 'Eine .odt in Markdown umwandeln',
    seo: {
      title: 'Wie man eine .odt-Datei öffnet — TransformPipe',
      description:
        'Wie man eine OpenDocument-Datei öffnet, welche Programme das außer LibreOffice können, was der Umweg über Word kostet und wie daraus Markdown wird.',
    },
  },
  'how-to-rtf': {
    label: 'Eine .rtf öffnen',
    title: 'Wie man eine .rtf-Datei öffnet',
    lede: 'Alles öffnet sie. Genau dafür ist sie da, und deshalb gibt es sie noch.',
    sections: [
      {
        heading: 'Was sie ist',
        body: [
          'Das Rich Text Format ist reiner Text mit Anweisungen darin: `{\\rtf1` am Anfang, dann Steuerwörter wie `\\b` für fett und `\\par` für einen neuen Absatz, bis zum Schluss. Microsoft veröffentlichte es 1987 und stellte die Entwicklung 2008 ein — genau deshalb liest es jede seither geschriebene Textverarbeitung.',
        ],
      },
      {
        heading: 'Zum Öffnen',
        body: [
          'TextEdit auf dem Mac und WordPad unter Windows öffnen sie ohne Installation, ebenso Word, LibreOffice, Google Docs und Pages. Auf dem Mac genügt die Leertaste im Finder.',
          'Sie ist auch so lesbar: in einem Texteditor geöffnet, stehen die Worte zwischen den Steuerwörtern — mehr, als sich über eine `.docx` sagen lässt.',
        ],
      },
      {
        heading: 'Warum sie so oft auftaucht',
        body: [
          'Weil sie das ist, was ein Mac erzeugt, wenn Text eine Anwendung verlässt. Ziehen Sie eine Auswahl aus einem Fenster in ein anderes, und macOS übergibt RTF; dasselbe gilt für sehr viel Kopieren und Einfügen zwischen Programmen und für alles, was ein älteres System exportiert hat, das fett und kursiv behalten wollte, ohne sich auf ein Format festzulegen.',
          'Sie trägt fast keine Metadaten und keine Makros — auch deshalb ist sie die sichere Wahl, wenn ein Dokument nach außen geht.',
        ],
      },
      {
        heading: 'Und in Markdown',
        body: [
          'Fett, kursiv, durchgestrichen, Links, Listen und Tabellen werden umgewandelt. Unklar ist das Format nur bei Überschriften: Word schreibt eine Gliederungsebene und meint sie, ein Mac schreibt nichts als eine größere fette Zeile — also wird die Gliederungsebene genommen, wo es eine gibt, und sonst ein fetter Absatz, der größer gesetzt ist als der Fließtext.',
        ],
      },
    ],
    action: 'Eine .rtf in Markdown umwandeln',
    seo: {
      title: 'Wie man eine .rtf-Datei öffnet — TransformPipe',
      description:
        'Wie man eine Rich-Text-Datei öffnet, warum ein Mac beim Ziehen von Text zwischen Programmen eine erzeugt, was darin steht und wie daraus Markdown wird.',
    },
  },
  'how-to-zip': {
    label: 'Einen .zip-Export öffnen',
    title: 'Wie man einen .zip-Export aus Notion, Confluence oder Obsidian öffnet',
    lede: 'Das Entpacken ist die leichte Hälfte. Darin liegt ein Ordner voller Dateien, die alle aufeinander zeigen.',
    sections: [
      {
        heading: 'Was darin ist',
        body: [
          'Ein Notion-Export ist eine Markdown-Datei je Seite, mit einer langen Kennung an jedem Dateinamen, dazu eine CSV je Datenbank. Ein Confluence-Export eines Bereichs ist eine HTML-Datei je Seite mit den Anhängen daneben. Ein Obsidian-Vault ist bereits Markdown, in den Ordnern, die Sie angelegt haben.',
          'Alle drei lassen sich mit den Werkzeugen entpacken, die schon auf dem Rechner sind: Doppelklick unter Windows oder macOS, `unzip` im Terminal.',
        ],
      },
      {
        heading: 'Warum die Links kaputt sind',
        body: [
          'Notion schreibt Links gegen genau den Dateinamen, den es erzeugt hat, Kennung inklusive. Benennt man die Dateien in etwas Lesbares um, löst kein Link zwischen den Seiten mehr auf, und das ist die mit Abstand häufigste Art, wie eine Migration schiefgeht.',
          'Confluence-Links zeigen auf seine eigenen Seiten-ids, und Anhänge auf eine Download-URL, die erwartet, dass man angemeldet ist. Obsidian benutzt `[[wikilinks]]`, die nur seine eigene App auflöst.',
        ],
      },
      {
        heading: 'Es lesen, ohne es zu reparieren',
        body: [
          'Hundert Dateien einzeln zu öffnen, um herauszufinden, was ein Arbeitsbereich enthielt, ist die falsche Art von Arbeit. Den Export zu einem Dokument zusammenzuführen — jede Seite der Reihe nach, mit einem Inhaltsverzeichnis — ergibt etwas, das sich in einem Durchgang lesen lässt, und genau dafür ist ein archivierter Export meist da.',
        ],
      },
      {
        heading: 'Wenn man die Dateien doch einzeln braucht',
        body: [
          'Müssen die Seiten getrennte Dateien mit funktionierenden Links bleiben, müssen das Umbenennen und das Umschreiben der Links zusammen geschehen, aus einer einzigen Zuordnung von altem zu neuem Namen. In zwei Durchgängen bleibt ein Ordner voller Dokumente zurück, die alle auf Namen zeigen, die es nicht mehr gibt.',
        ],
      },
    ],
    action: 'Einen .zip-Export in Markdown umwandeln',
    seo: {
      title: 'Wie man einen .zip-Export aus Notion oder Confluence öffnet — TransformPipe',
      description:
        'Was in einem Export aus Notion, Confluence oder Obsidian steckt, warum die Links zwischen den Seiten brechen und wie sich alles als ein Dokument lesen lässt.',
    },
  },
  'how-to-assistant': {
    label: 'Aus einem Assistenten teilen',
    title: 'Wie man ein Dokument aus einem KI-Assistenten umwandelt und teilt',
    lede: 'Ein Assistent schreibt den ganzen Tag Markdown und kann Ihnen trotzdem keine Seite geben. Verbindet man diesen hier, kann er beides — ohne dass jemand Text zwischen Tabs kopiert.',
    sections: [
      {
        heading: 'Was ein Connector ist',
        body: [
          'TransformPipe betreibt unter `/api/mcp` einen MCP-Server. MCP ist das Protokoll, über das Assistenten Werkzeuge aufrufen; die Adresse als Connector einzutragen gibt dem Assistenten also eine Reihe von Verben, die er in Ihrem Namen benutzen kann: das hier umwandeln, es speichern, es teilen, auflisten, was da ist.',
          'Es gibt keinen Schlüssel einzufügen. Beim Hinzufügen des Connectors werden Sie durch eine normale Anmeldung geschickt, und der Assistent erhält Zugriff auf dieses Konto, bis Sie ihn wieder trennen — dieselbe Form wie bei der Anmeldung an irgendeiner anderen Anwendung mit Ihrem Konto.',
        ],
      },
      {
        heading: 'Ihn hinzufügen',
        body: [
          'Auf claude.ai: „Settings“, dann „Connectors“, dann „Add custom connector“, und dort `https://transformpipe.com/api/mcp` angeben. Melden Sie sich an, wenn danach gefragt wird, und im nächsten Gespräch sind die Werkzeuge da.',
          'Aus einem Terminal erledigt ein einziger Befehl dasselbe: `claude mcp add --transport http transformpipe https://transformpipe.com/api/mcp`.',
          'Mehr ist nicht einzurichten. Der Connector lässt sich auf demselben Bildschirm wieder entfernen, und das Entfernen widerruft den Zugriff sofort.',
        ],
      },
      {
        heading: 'Was er dann kann',
        body: [
          'Elf Werkzeuge, alle mit `tp_` benannt. Die, auf die es in einem Gespräch ankommt, sind `tp_convert_markdown`, das aus Markdown ein fertiges HTML-Dokument macht, `tp_convert_to_markdown` für eine Datei in die andere Richtung, `tp_save_document`, das das Ergebnis in Ihrem Konto behält, und `tp_share_document`, das es veröffentlicht und einen Link zurückgibt, den Sie verschicken können.',
          'Der Rest sind die, nach denen ein Assistent von sich aus greift: `tp_list_documents` und `tp_get_document`, um etwas wiederzufinden, das Sie früher gemacht haben, `tp_summarize_document`, um zu sagen, was in einem langen steht, `tp_document_versions`, um zu zeigen, was was ersetzt hat, `tp_usage`, um zu prüfen, wie viel Platz noch bleibt, und `tp_delete_document`.',
          'In der Praxis ist der nützliche Satz kurz. Bitten Sie ihn, die Release Notes zu schreiben, und dann, sie zu veröffentlichen — der Assistent wandelt um, speichert und teilt und antwortet mit der Adresse.',
        ],
      },
      {
        heading: 'Woran er kommt und woran nicht',
        body: [
          'Der Connector handelt als Sie, in Ihrem Konto, an Dokumenten, die Ihnen gehören. Er kann das Konto nicht ändern, Ihr Passwort nicht lesen, keine API-Schlüssel erstellen und an die Dokumente anderer nicht heran.',
          'Eine Berechtigung kann auch nur lesend sein; dann kann der Assistent auflisten, abrufen und zusammenfassen, aber nicht speichern, teilen oder löschen — und diese Einschränkung wird an der Berechtigung selbst durchgesetzt, nicht an den Werkzeugen, sie hält also, ganz gleich, wonach der Assistent fragt.',
          'Zu wissen, nicht zu fürchten: ein Assistent mit einem Connector ist eine dauerhafte Vollmacht zu handeln, und ein Dokument, das er liest, kann Anweisungen enthalten, die an ihn gerichtet sind. Das ist der ehrliche Preis der Bequemlichkeit und der Grund, warum eine nur lesende Berechtigung für alles, was Sie nicht selbst geschrieben haben, die richtige Voreinstellung ist.',
        ],
      },
      {
        heading: 'Wann man ihn nicht nimmt',
        body: [
          'Ein Connector passt zu dem Dokument, das in einem Gespräch existiert und sonst nirgends. Für eine Datei, die schon auf der Platte liegt, geht es schneller, sie auf den Konverter zu ziehen; für etwas, das bei jedem Merge passiert, sind die API oder die GitHub Action die richtige Form; und für einen Ordner mit vierhundert Dateien schlägt ein lokaler Konverter jedes Gespräch.',
        ],
      },
    ],
    action: 'Die Dokumentation lesen',
    seo: {
      title: 'Ein Dokument aus einem KI-Assistenten umwandeln und teilen — TransformPipe',
      description:
        'Wie man TransformPipe als MCP-Connector zu Claude hinzufügt, was die elf Werkzeuge tun und woran ein Assistent in Ihrem Konto kommt und woran nicht.',
    },
  },
};
