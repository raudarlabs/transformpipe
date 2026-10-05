---
title: "Dokumente über eine API konvertieren: Was eine API brauchbar macht"
description: "Was eine Dokumentkonvertierungs-API braucht, bevor ein Skript ihr traut: ehrlicher Request-Body, echte Fehler, veröffentlichte Limits, abrufbare Dokumente"
date: 2026-08-13
tag: Automatisierung
keywords: dokumentkonvertierung api, markdown zu html api, dokumente per rest api konvertieren, datei konvertierung api, api request body datei upload, idempotenz dateikonvertierung, serverless request limit
---

Eine Konvertierung, die in einem Browser-Tab passiert, ist eine Konvertierung, die eine Person einmal gemacht hat. Die interessante Version ist die, die bei jedem Merge passiert, bei jedem Release, für vierhundert Dateien um zwei Uhr nachts, ohne dass jemand zusieht. Diese Version ist ein Request, und Requests scheitern auf Arten, wie es eine Seite nie tut.

### Kurzfassung

Eine Dokumentkonvertierungs-API ist brauchbar, wenn vier Dinge stimmen: Der Request-Body ist das Dokument selbst statt eine Hülle um eine Hülle, eine defekte Datei kommt als Statuscode und ein Satz zurück, den ein Mensch lesen kann, die Limits sind veröffentlicht statt in der Produktion entdeckt zu werden, und das Ergebnis hat eine URL, die man morgen wieder abrufen kann. Senden Sie die rohe Datei als Body, wenn die Konvertierung im Pfad oder in der Query benannt ist, und heben Sie sich eine JSON-Hülle für den einen Fall auf, in dem der Body sonst mehrdeutig wäre. Planen Sie die Obergrenze für die Request-Größe ein, bevor eine 6-MB-Datei sie für Sie findet — auf einer Serverless-Plattform liegt diese Grenze bei etwa 4,5 MB, und sie wird oberhalb Ihres Codes durchgesetzt, sodass der Fehler nicht Ihrer ist, den Sie formulieren könnten.

Die Reibung liegt selten in der Konvertierung selbst. Markdown zu parsen und HTML auszugeben ist ein gelöstes Problem mit einem halben Dutzend guter Bibliotheken dahinter. Was bricht, ist alles rund um das Parsen: ein Build-Schritt, der eine Datei postet und einen 200 mit leerem Body zurückbekommt, ein nächtlicher Job, der still bei welcher Größe auch immer die Plattform gerade ablehnt abschneidet, ein Retry, der aus einem Dokument drei macht, weil der erste Versuch nach dem Timeout bereits erfolgreich gewesen war.

Die Fehler haben eine Form. Ein Client kann einen 500 nicht von einem 413 unterscheiden, wenn die Plattform antwortet, bevor Ihr Handler läuft. Ein Client kann „Ihre Datei ist kein gültiges JSON“ nicht von „unser Speicher ist down“ unterscheiden, wenn beides als derselbe flache Fehlerstring ankommt. Und ein Client kann sich gegenüber Limits nicht vernünftig verhalten, die er aus einer Reihe von Ablehnungen erschließen muss, was in der Praxis „für Details kontaktieren Sie uns“ bedeutet.

Dieser Beitrag handelt also vom Vertrag, nicht vom Parser. Wo ein durchgerechnetes Beispiel hilft, nutzt er unsere eigene `/api/v1`, weil es die einzige ist, deren Quellcode und Ablehnungsmeldungen ich exakt zitieren kann, statt sie zu erraten.

## Die Frage nach dem Request-Body, Form für Form

### Kurzübersicht: die Spickzettel-Tabelle

Jede Konvertierungs-API beantwortet zuerst eine Frage — wohin geht die Datei? Die sieben Antworten unten sind der gesamte Raum, und die Wahl entscheidet, wie groß ein Dokument sein darf, wie gut Ihre Fehlermeldungen sein können, und wie viel Code der Aufrufer schreiben muss, bevor überhaupt etwas konvertiert wird.

| Form | So sieht der Body aus | Am besten für | Wo es bricht |
| --- | --- | --- | --- |
| Rohdatei als Body | Die Datei, Byte für Byte, mit `Content-Type`, der sie benennt | Eine benannte Konvertierung: eine Datei rein, ein Dokument raus | Metadaten haben nirgendwo hin außer in den Query-String |
| JSON-Hülle | `{"name": "…", "markdown": "…"}` | Aufrufer mit mehreren zu sendenden Feldern | Das Dokument muss in einen JSON-String escaped werden; der Body ist mehrdeutig, wenn das Dokument selbst JSON ist |
| `multipart/form-data` | Ein Dateiteil plus Textteile | Browser-Formulare, mehrere Dateien gleichzeitig | Jeder Client braucht einen Multipart-Encoder; das Parsen kostet Speicher auf dem Server |
| Base64 innerhalb von JSON | `{"file": "PGh0bWw+…"}` | Binärformate durch reine JSON-Clients | Etwa ein Drittel größer auf der Leitung, gegen eine feste Body-Obergrenze |
| Eine URL, die der Server abruft | `{"url": "https://…"}` | Dokumente, die bereits im Netz liegen | Der Server wird zu einem HTTP-Client, der auf alles zeigt, was Sie nennen — eine Gefahr für Request-Fälschung |
| Direkter Upload, dann eine Referenz | `{"blob": "uploads/ab12…"}` | Dateien über der Request-Obergrenze | Zwei Round-Trips, eine signierte URL zum Ausstellen und verwaiste Uploads zum Aufräumen |
| Ein Batch-Array | `{"documents": [ … ]}` | Hunderte kleiner Dateien | Eine schlechte Datei im Array erzwingt eine Teilfehler-Antwortform, die niemand gern schreibt |

Nichts davon ist an sich falsch. Der Fehler ist, zwei davon für denselben Endpoint zu wählen und den Content-Type entscheiden zu lassen, welches gemeint ist, ohne es zu sagen — ein Aufrufer, der eine `.json`-Datei mit dem ehrlichen `Content-Type: application/json` zur Konvertierung postet, wird dann als Hülle gelesen, es wird festgestellt, dass kein Dokumentfeld darin ist, und aus einem Grund abgelehnt, der von außen keinen Sinn ergibt.

### Die Rohdatei als Body

Das Dokument ist der Body. Nichts umhüllt es, nichts escaped es, und `curl --data-binary @file.md` ist der ganze Client. Name und Optionen reisen im Query-String, wo sie in einer Logzeile sichtbar und von Hand leicht zu ändern sind.

| Vorteile | Nachteile |
| --- | --- |
| Kein Escaping: Eine Datei mit Backticks, Anführungszeichen und CRLF-Zeilen kommt unverändert an | Metadaten müssen im Query-String leben, der seine eigenen Längenlimits hat |
| Der kleinstmögliche Body, was gegen eine feste Obergrenze zählt | Nur eine Datei pro Request |
| Von einer Person mit `curl` und ohne SDK debugbar | Der Server darf das Format nicht aus den Bytes raten und dabei falsch liegen |

**Für wen das ist.** Jeder Aufrufer, dessen Konvertierung bereits benannt ist — durch die Route oder durch einen Query-Parameter wie `?kind=html-to-markdown`. Wenn der Endpoint weiß, was der Body sein soll, hat der Body keinen Grund, sich selbst zu erklären.

Unsere eigene nimmt zuerst diese Form an. `POST /api/v1/documents` liest den Request-Body als Quelle, nimmt den Dateinamen aus `?name=` und die Konvertierung aus `?kind=`, das `html-to-markdown`, `csv-to-markdown` und `json-to-markdown` akzeptiert; ganz ohne `kind` ist der Body Markdown, was jedes Dokument war, bevor es mehr als eine Konvertierung gab.

```bash
curl -fsS \
  -H "Authorization: Bearer $TP_API_KEY" \
  -H "Content-Type: text/markdown" \
  --data-binary @README.md \
  "https://transformpipe.com/api/v1/documents?name=README.md&share=link"
```

### Die JSON-Hülle

Das Dokument wird zu einem String-Feld innerhalb eines Objekts. Das ist die Form, zu der API-Clients standardmäßig greifen, weil es die Form ist, die alles andere im eigenen Code bereits verwendet.

| Vorteile | Nachteile |
| --- | --- |
| Mehrere Felder, ohne den Query-String anzufassen | Das Dokument muss durch jede Schicht escaped und re-escaped werden |
| Ein vertrauter Content-Type für die ganze API | Ein JSON-Dokument als Payload kollidiert mit der Hülle |
| Leicht erweiterbar, ohne einen Breaking Change | Größer auf der Leitung, sobald Zeilenumbrüche zu `\n` werden |

**Für wen das ist.** Aufrufer, die mehr als eine Datei senden — einen Namen, einen Titel, ein Theme, ein Ziel — und den Request aus einem typisierten Client statt einer Shell erzeugen.

Die Kollision ist es wert, benannt zu werden, denn sie ist der Bug, den wir ausgeliefert und dann behoben haben. Die Hülle wurde am Content-Type erkannt, sodass das Posten einer JSON-Datei zur Konvertierung mit `Content-Type: application/json` als Hülle gelesen wurde, kein `markdown`-Feld darin gefunden und abgelehnt wurde. Die Regel, die das behoben hat, lohnt sich zu kopieren: Eine benannte Konvertierung besitzt den Body. Nur die Standardkonvertierung liest eine Hülle, und jeder Request, der benennt, was er konvertiert, behandelt seinen Body als Quelldatei, egal was der Content-Type behauptet.

### `multipart/form-data`

Die Form, die ein Browser-Formular ohne Hilfe erzeugt, und deshalb die Form, zu der ein Konvertierungsdienst mit Web-Frontend tendiert.

| Vorteile | Nachteile |
| --- | --- |
| Dateien und Felder zusammen, ohne Escaping | Jeder Nicht-Browser-Client braucht einen Encoder |
| Mehrere Dateien in einem Request | Streaming-Parser sind fummelig; puffernde sind speicherhungrig |
| Content-Type und Dateiname kommen pro Teil an | Um zwei Uhr nachts beim Debuggen von Hand kaum nachzustellen |

**Für wen das ist.** Endpoints, die direkt von einer Seite aufgerufen werden, und Clients, die tatsächlich mehrere Dateien pro Request haben. Für eine skriptgesteuerte Einzeldatei-Konvertierung ist es Zeremonie ohne Nutzen.

### Base64 innerhalb von JSON

Der Notausgang für Binärformate, wenn der Client nur JSON sprechen kann. Eine `.docx` ist ein Zip-Archiv, kann also gar nicht als Text in einen JSON-String — Base64 ist, wie es trotzdem hineinkommt.

| Vorteile | Nachteile |
| --- | --- |
| Binärdaten durch einen reinen JSON-Client | Die Kodierung bläht die Payload um etwa ein Drittel auf |
| Ein Content-Type für Text- und Binärformate zugleich | Die Obergrenze kommt früher: Eine 3,3-MB-Datei ergibt einen 4,4-MB-Body |
| Trivial zu loggen und zu diffen, wenn man riesige Logs mag | Der Client kann Dekodierfehler ohne guten Fehler nicht von Konvertierungsfehlern unterscheiden |

**Für wen das ist.** Binäre Eingaben, die eine reine JSON-Grenze überqueren müssen, mit einem Größenlimit, das niedrig genug gesetzt ist, dass die Aufblähung nicht zubeißen kann.

### Eine URL, die der Server abruft

Der Aufrufer sendet eine Adresse; der Server lädt das Dokument herunter und konvertiert es. Verlockend, und die Form mit der schärfsten Kante.

| Vorteile | Nachteile |
| --- | --- |
| Gar kein Upload für Dokumente, die bereits im Web liegen | Der Server wird zu einem HTTP-Client, der hinzeigt, wohin der Aufrufer sagt |
| Umgeht die Request-Body-Obergrenze vollständig | Server-seitige Request-Fälschung, sofern der Abruf nicht hart eingeschränkt ist |
| Praktisch für öffentliche READMEs und veröffentlichte Seiten | Fehler vervielfachen sich: DNS, TLS, Weiterleitungen, 404er, Timeouts, und die Konvertierung selbst |

**Für wen das ist.** Dienste, die es genug brauchen, um die Arbeit zu machen: eine Allowlist oder Blocklist, die private Adressbereiche abdeckt, eine Obergrenze für Weiterleitungen, eine Byte-Obergrenze, ein Timeout, und Fehler, die „konnte nicht abrufen“ von „konnte nicht konvertieren“ unterscheiden. Alles weniger ist ein Loch in Ihrem Netzwerk mit einer JSON-Schnittstelle.

### Direkter Upload, dann eine Referenz

Der Client fragt nach einer kurzlebigen Upload-URL, legt die Datei direkt in den Objektspeicher und postet den entstandenen Schlüssel. Das Dokument reist nie durch die API-Funktion.

| Vorteile | Nachteile |
| --- | --- |
| Die Request-Body-Obergrenze gilt nicht mehr | Zwei Round-Trips und ein Endpoint zum Ausstellen von Tokens |
| Große Dateien hören auf, ein Sonderfall zu sein | Uploads ohne Folge-Request müssen aufgeräumt werden |
| Lesezugriffe können auf eine signierte URL umleiten, sodass Antworten klein bleiben | Mehr bewegliche Teile, die schiefgehen können, und mehr zu erklären |

**Für wen das ist.** Jeder Dienst, dessen Dokumente routinemäßig das Body-Limit der Plattform überschreiten. Es ist die ehrliche Antwort auf „das Limit anheben“ — und es ist eine Änderung daran, wie Dokumente sich bewegen, keine größere Zahl, weshalb unsere eigene Obergrenze dort bleibt, wo die Plattform sie gesetzt hat, bis diese Arbeit erledigt ist.

### Ein Batch-Array

Viele Dokumente, ein Request. Attraktiv gegen ein Rate-Limit pro Minute und überall sonst unbequem.

| Vorteile | Nachteile |
| --- | --- |
| Hunderte kleiner Dateien ohne hunderte Requests | Teilausfall braucht eine Antwortform, und Clients müssen sie handhaben |
| Eine Authentifizierung und ein Rate-Limit-Slot | Der ganze Batch teilt sich eine Body-Obergrenze |
| Weniger Round-Trips bei einer langsamen Verbindung | Ein langer Batch flirtet mit dem Funktions-Timeout |

**Für wen das ist.** Aufrufer mit vielen kleinen Dokumenten und der Geduld, ein Ergebnis-Array pro Element zu handhaben. Die Alternative, wenn die Dokumente sowieso zusammengehören, ist, sie vor dem Posten zu einem Dokument zusammenzuführen — [was seine eigenen Probleme hat, meist Überschriftenebenen und Anker-Kollisionen](/blog/merging-many-markdown-files), aber es erzeugt ein Ding, das ein Leser tatsächlich lesen kann.

## Fehler und Limits, die ein Client nicht selbst entdecken sollte

Zwei Tabellen entscheiden, ob ein Aufrufer gegen Sie automatisieren kann. Die erste ist, was Ihre Ablehnungen bedeuten. Die zweite ist, wo Ihre Obergrenzen liegen. Beide gehören in die Dokumentation, und keine sollte aus einer Reihe von Fehlschlägen in jemandes CI-Log rückentwickelt werden müssen.

Ein Fehler ist nützlich, wenn er drei Dinge trägt: einen Statuscode, der bedeutet, was die Spezifikation sagt, dass er bedeutet, eine Nachricht, nach der eine Person handeln kann, und eine Body-Form, die jedes Mal dieselbe ist. Eine Nachricht ist keine Höflichkeit. Sie ist der Unterschied zwischen einem Build-Fehler, den jemand in einer Minute behebt, und einem, den er eskaliert.

Hier ist der vollständige Satz von unseren eigenen Endpoints, der absichtlich klein ist:

| Status | Wann | Was der Body sagt |
| --- | --- | --- |
| 201 | Das Dokument wurde erstellt | Das Dokument, mit seiner ID, Größe, Wortanzahl und Freigabe-URL |
| 400 | Ein unbekanntes `kind`, ein leerer Body, ein `share`-Wert, der weder `link` noch `people` ist, ein CSV ohne Zeilen, ungültiges JSON | Die eigene Nachricht des Parsers, einschließlich wo er gestoppt hat |
| 400 | `kind=word-to-markdown` | Namentlich abgelehnt, mit der Seite, die es im Browser tut |
| 401 | Kein Credential, oder eines, das unbekannt oder widerrufen ist | Zwei verschiedene Sätze, je nachdem, ob überhaupt ein `Authorization`-Header gesendet wurde |
| 403 | Der Account hat keinen Platz mehr, oder die Berechtigung ist nur lesend | Welches Limit, und was Sie dagegen verbrauchen |
| 404 | Das Dokument einer anderen Person, oder eine ID, die keine UUID ist | `Not found`, für beides, absichtlich |
| 410 | Die Zeile existiert und ihre Quelle nicht | Die Quelle dieses Dokuments fehlt |
| 413 | Ein Dokument über der Obergrenze pro Dokument | Die Größe des Dokuments und die Größe des Limits |
| 429 | Mehr als 60 Requests in einer Minute | Das Limit, die Sekunden bis zum nächsten Versuch, und ein `Retry-After`-Header |
| 502 | Der Dokumentspeicher war nicht erreichbar | Dass es unserer ist, und der zugrunde liegende Grund |

Drei dieser Zeilen existieren wegen eines konkreten Fehlschlags, der es wert ist, kopiert zu werden. Eine fehlgeformte ID erreichte früher Postgres, das sie ablehnte, was als 500 auftauchte — deshalb werden IDs jetzt auf ihre Form geprüft, und eine schlechte ist schlicht nicht gefunden. Eine fehlende gespeicherte Datei und ein unerreichbarer Speicher kamen früher als derselbe nackte 500 an; sie in 410 und 502 aufzuteilen sagt dem Aufrufer, ob er dieses Dokument aufgeben oder den Request wiederholen sollte. Und für beides — „kein solches Dokument“ und „nicht Ihres“ — `Not found` zurückzugeben ist keine Faulheit: Die Alternative bestätigt die Existenz fremder Dokumente gegenüber jedem mit einem UUID-Generator.

Die Limits sind die zweite Hälfte des Vertrags:

| Limit | Wert | Warum diese Zahl |
| --- | --- | --- |
| Pro Konvertierung | 10 MB | Die Konvertierung läuft im Browser, das ist also ein Urteil über die Maschine vor der Person, keine Plattformregel |
| Pro gespeichertem Dokument | 4 MB | Die Plattform lehnt einen Request- oder Response-Body über 4,5 MB ab; 4 MB lassen Platz für den Namen und das JSON drumherum |
| Pro Account | 100 MB und 500 Dokumente | Tausend winzige Dateien kosten echte Zeilen, also sind beide gedeckelt |
| Pro Aufrufer | 60 Requests pro Minute | Gezählt pro Credential, sodass ein außer Kontrolle geratenes Skript nicht das Kontingent einer ganzen Browser-Sitzung verbraucht |

Zwei Eigenschaften dieser Tabelle zählen mehr als die Zahlen. Erstens nennt jede Obergrenze das, was sie auferlegt, woran ein Aufrufer erkennt, ob höflich fragen helfen würde. Zweitens ist das Erreichen eines Limits eine Ablehnung statt einer stillen Räumung. Diese App löschte früher das älteste Dokument, um unter ihrer Obergrenze zu bleiben, was etwas zerstörte, das der Besitzer absichtlich behalten hatte; eine Ablehnung, die stattdessen sagt, was zu löschen wäre, ist schlimmer zu bekommen und besser, bekommen zu haben.

## Authentifizierung, und was ein Schlüssel nicht erreichen darf

Eine Konvertierungs-API braucht ein Credential aus einem Grund über allen anderen: Die Dokumente gehören jemandem. Rate Limiting, Kontingente und Missbrauchsbehandlung folgen alle daraus, zu wissen, wessen sie sind.

Der Bearer-Schlüssel ist die Grundlage, und es gibt fünf Eigenschaften, die man richtig machen muss.

**Ein erkennbares Präfix.** Unsere beginnen mit `tp_live_`, was bedeutet, dass der Server seinen eigenen Schlüssel von jemand anderes Token unterscheiden kann, ohne eine Datenbankabfrage, und dass Secret-Scanner einen in einem Commit erkennen können. Ein zufälliger, undurchsichtiger String tut keines von beidem.

**Gehasht gespeichert, einmal angezeigt.** Der Schlüssel wird bei der Erstellung angezeigt und nur als Hash gespeichert. Wenn er von einer Account-Seite zurückgelesen werden kann, kann er aus einem Support-Ticket, einem Screenshot und einem Backup gelesen werden.

**Mit einer Aktion widerrufbar.** Ein Schlüssel, den Sie nicht in zehn Sekunden töten können, ist ein Schlüssel, den Sie nicht rotieren werden.

**Enger als der Account.** Ein Schlüssel von uns erreicht Dokumente und Freigaben, nie den Account, die Anmeldung oder die Schlüssel selbst. Das ist die Eigenschaft, die ein Leck überlebbar macht: Ein gestohlener Schlüssel kann nicht seinen eigenen Ersatz ausstellen oder den Besitzer aussperren.

**Am Credential durchgesetzt, nicht an einer Tür.** Das ist die, die uns gebissen hat. Eine schreibgeschützte Berechtigung eines verbundenen Assistenten — die Art Token, [die ein Connector eines Assistenten beim Anmelden sammelt](/blog/converting-documents-from-an-assistant), statt eines eingefügten Schlüssels — wurde im Werkzeug-Dispatcher geprüft statt am Credential, sodass das Versprechen auf der Zustimmungsseite — dass sie nicht speichern, teilen oder löschen kann — für die Werkzeuge wahr war und für die API, die diese Werkzeuge aufrufen, falsch. Die Prüfung sitzt jetzt vor jeder Route, als Allowlist sicherer Methoden statt einer Liste unsicherer, sodass eine im nächsten Jahr hinzugefügte Route standardmäßig abgedeckt ist. Eine Ablehnung kommt als 403 mit `WWW-Authenticate: Bearer error="insufficient_scope"` zurück, die Standardart zu sagen: „authentifiziert, aber nicht dafür“.

Zwei kleinere Entscheidungen sparen echte Debugging-Zeit. Ein Session-Cookie ebenso wie einen Schlüssel zu akzeptieren bedeutet, dass dieselben Endpoints aus einem angemeldeten Browser ausprobiert werden können, sodass die Dokumentation testbar ist, ohne ein Credential auszustellen. Und einen nicht authentifizierten Request unterschiedlich zu beantworten, je nachdem, ob überhaupt ein `Authorization`-Header ankam, macht aus den zwei häufigsten Einrichtungsfehlern — kein Header, und ein Header, den der Proxy entfernt hat — zwei verschiedene Nachrichten statt eines Schulterzuckens.

## Rate Limits, Retries und Idempotenz

Ein Rate Limit ist ein Versprechen über den schlechtesten Fall, und ein Client kann nur mit einem Versprechen kooperieren, das er lesen kann. Unseres liegt bei 60 Requests pro Minute und Credential, und der 429 trägt sowohl die Zahl als auch einen `Retry-After`-Header, sodass ein Client nicht raten muss, wie lange er warten soll.

Auch ehrlich über den Mechanismus zu sein zählt. Der Zähler ist eine Zeile pro Aufrufer pro Minute in Postgres, per Upsert erhöht. Er ist unter starker Nebenläufigkeit nicht exakt — zwei Aufrufe können denselben Zählerstand lesen — und bei dieser Größe ist das der richtige Kompromiss gegen den Betrieb eines Caches neben der Datenbank. Ein Aufrufer, der ein exaktes Kontingent braucht, sollte das wissen; ein Aufrufer, der die Sache nur nicht überlasten muss, hat alles, was er braucht.

Auf der Client-Seite decken vier Regeln fast jeden Fall ab:

- Wiederholen Sie 429, 408 und 5xx. Wiederholen Sie keinen anderen 4xx: Der Request ist falsch und bleibt falsch.
- Erhöhen Sie die Wartezeit exponentiell mit Jitter, und respektieren Sie `Retry-After`, wenn vorhanden — es ist eine bessere Information als Ihre Formel.
- Begrenzen Sie die Gesamtzahl der Versuche. Ein Build, der ewig wiederholt, ist ein Build, der hängt, statt zu scheitern.
- Machen Sie den Fehlschlag laut. `curl` beendet sich bei einem 401 oder 429 mit Code null, sofern Sie nicht `-f` übergeben, was bedeutet, dass eine Pipeline einen Fehler-Body in die Datei schreiben kann, die eigentlich konvertiert werden sollte, und fröhlich weitermacht. Das ist die häufigste Art, wie eine API-gesteuerte Konvertierung still zerbricht, und sie hat nichts mit der API zu tun.

Was zur Idempotenz führt, und einem ehrlichen Eingeständnis. `POST /api/v1/documents` ist nicht idempotent. Posten Sie dieselbe Datei zweimal, und Sie bekommen zwei Dokumente, mit zwei IDs und zwei Freigabe-URLs. Nichts dedupliziert sie.

Das ist an einer Stelle eine bewusste Entscheidung und an einer anderen ein ungelöstes Problem. Bewusst ist es für das Veröffentlichen: [Unsere GitHub Action erstellt pro Push ein neues Dokument](/blog/publish-markdown-from-github-actions), genau damit ein Link in einem alten Pull-Request-Kommentar weiter zeigt, was dieser Commit sagte, statt sich unter einem Reviewer zu verändern, der ihn letzte Woche geöffnet hat. Überschreiben wäre ordentlicher und würde still Geschichte umschreiben, die jemand gerade liest.

Ungelöst ist es für Retries. Wenn ein Request nach dem Schreiben der Zeile, aber vor der Rückkehr der Antwort einen Timeout hat, kann der Client Erfolg nicht von Fehlschlag unterscheiden, und der sichere Retry erzeugt ein Duplikat. Es gibt drei Auswege, und es lohnt sich zu wissen, welchen eine API, die Sie bewerten, gewählt hat:

1. **Ein Idempotenzschlüssel.** Der Client sendet einen eindeutigen Wert in einem Header — `Idempotency-Key` ist die Konvention, die Zahlungs-APIs bekannt gemacht haben — und der Server speichert die erste Antwort dagegen für ein bestimmtes Fenster, und spielt diese Antwort für jede Wiederholung ab. Das ist die richtige Antwort, und sie kostet eine Tabelle, eine Ablaufrichtlinie und eine Entscheidung darüber, was passiert, wenn derselbe Schlüssel mit einem anderen Body ankommt.
2. **Eine vom Aufrufer vorgegebene ID.** Der Client wählt die Dokument-ID, sodass eine Wiederholung ein Konflikt statt eines Duplikats ist. Einfach, und es gibt die ID-Erzeugung an Aufrufer weiter, die sie vielleicht nicht wollen.
3. **Client-seitiger Abgleich.** Der Aufrufer listet aktuelle Dokumente auf und gleicht nach Name und Größe ab, bevor er postet. Das machen Sie, ob Sie es beabsichtigt haben oder nicht, wenn die API keine der beiden obigen Optionen anbietet.

Eine API, die Idempotenz behauptet, ohne zu sagen, für wie lange, oder welche Felder den Schlüssel bilden, hat Ihnen fast nichts gesagt. Fragen Sie nach dem Fenster.

## Dateien, die zu groß für einen Request-Body sind

Jede gehostete Konvertierungs-API hat eine Größenobergrenze, und die Obergrenze ist meist nicht die eigene Meinung des Dienstes. Auf einer Serverless-Plattform laufen Request und Response beide durch Infrastruktur mit eigenen Limits, und auf Vercel liegt dieses Limit bei 4,5 MB für einen Request- oder Response-Body, abgelehnt als 413 `FUNCTION_PAYLOAD_TOO_LARGE` (geprüft auf vercel.com/docs/functions/limitations, 8. September 2026).

Der wichtige Teil ist nicht die Zahl. Es ist, dass die Ablehnung oberhalb Ihres Handlers passiert. Ein 6-MB-Post erreicht nie den Code, der etwas Nützliches gesagt hätte, also bekommt der Aufrufer den nackten 413 der Plattform und eine Fehlerseite, die niemand Bestimmtes geschrieben hat. Von außen sieht es so aus, als sei Ihre API kaputt.

Deshalb liegt unsere Obergrenze pro Dokument bei 4 MB statt 4,5 MB: Die App muss den Request selbst ablehnen, mit einem Satz, der die Größe des Dokuments und die Größe des Limits nennt, bevor die Plattform ihn wortlos ablehnt. Das halbe Megabyte Spielraum ist für den Dateinamen und das JSON rund um das Markdown. Und deshalb sind die Konvertierungs-Obergrenze und die Speicher-Obergrenze zwei verschiedene Zahlen statt einer: Konvertieren passiert im Browser und kann sich 10 MB leisten, das Behalten des Ergebnisses braucht einen Request und kann das nicht.

Die Antwortseite der Obergrenze wird leicht vergessen. Ein Dokument zurückzuholen gibt seine Quelle zurück, und eines zu rendern gibt eine ganze HTML-Datei zurück; beides sind Response-Bodys, und beide unterliegen demselben Limit. Ein Dienst, der Sie ein größeres Dokument hochladen lässt, als er zurückgeben kann, hat eine Falle eingebaut.

Wenn Ihre Dokumente tatsächlich größer als die Obergrenze sind, gibt es vier ehrliche Optionen:

| Option | Was es kostet | Wann es richtig ist |
| --- | --- | --- |
| Das Dokument aufteilen | Mehrere Requests, mehrere Ausgaben, und eine Entscheidung, was sie verbindet | Dokumente, die ohnehin schon mehrere Dokumente waren |
| Zusammenführen und einmal konvertieren | Ein großer Body, hilft also nur, wenn das Zusammenführen die Gesamtgröße verringert | Viele kleine Dateien, die zusammengehören |
| Lokal konvertieren, das Ergebnis posten | Eine Abhängigkeit in Ihrer Pipeline, und Versionsdrift zum Verwalten | Build-Schritte, die bereits eine Laufzeitumgebung haben |
| Direkter Upload in den Speicher | Signierte URLs, ein Aufräumen von Waisen, und Lesezugriffe, die umleiten | Ein Dienst, bei dem große Dokumente normal statt außergewöhnlich sind |

Die dritte Option ist es wert, ernst genommen zu werden, statt als Niederlage behandelt zu werden. [Ein lokaler Konverter auf der Kommandozeile](/blog/markdown-to-html-from-the-command-line) hat keine Größenobergrenze, kein Netzwerk, keinen zu rotierenden Schlüssel und kein Rate Limit; was er stattdessen hat, ist eine zu pflegende Installation und eine Version, deren Verhalten festgenagelt werden muss, sonst driftet sie. Eine Konvertierungs-API ist nicht automatisch die bessere Hälfte dieses Kompromisses.

Ein Fall ist überhaupt kein Größenproblem. Eine `.docx` ist ein Zip-Archiv voller XML, und eine zu lesen braucht einen Zip-Reader und einen Element-Mapper — Gewicht, das unsere Funktion nicht trägt, weshalb `kind=word-to-markdown` namentlich abgelehnt wird, mit einem Verweis auf die Seite, die es im Browser tut. Das ist eine echte, ehrlich benannte Einschränkung, und die Umgehung ist, [die `.docx` zuerst zu konvertieren und das entstandene Markdown zu posten](/blog/convert-docx-to-markdown). Eine API, die die Datei still annehmen und unkonvertiert speichern würde, wäre in jeder Hinsicht schlechter.

## Das Dokument zurückholen

Das Letzte, was einen Konvertierungs-Endpoint von einer Konvertierungs-API unterscheidet, ist, ob das Ergebnis eine Adresse hat. Ein Endpoint, der konvertiert, Bytes zurückgibt und vergisst, hat den Aufrufer für Speicherung, Benennung und Teilen verantwortlich gemacht — was in Ordnung ist, wenn der Aufrufer eine Bibliothek wollte, und unpraktisch, wenn er einen Dienst wollte.

Drei Darstellungen desselben Dokuments decken fast jeden Anwendungsfall ab:

| Request | Was zurückkommt | Verwendet von |
| --- | --- | --- |
| `GET /api/v1/documents/:id` | JSON: Name, Art, Größe, Wortanzahl, Freigabestatus und die Markdown-Quelle | Ein Skript, das entscheidet, was als Nächstes zu tun ist |
| `GET /api/v1/documents/:id.html` | Die eigenständige HTML-Datei, `?theme=dark` optional | Ein Build, der eine Datei auf die Festplatte schreibt |
| `GET /api/v1/documents` | Die neuesten 500, als Liste | Abgleich, Aufräumen, Dashboards |

Das eigenständige HTML verdient eine Anmerkung, denn „HTML“ ist nicht eine Sache. Was zurückkommt, ist ein vollständiges Dokument — Doctype, Head, Styles inline — statt ein Fragment, und es ist dieselbe Datei, die die App selbst herunterlädt, sodass ein Skript und eine Person identische Ausgabe aus identischem Code bekommen. Eine Konvertierungs-API, die ein Fragment zurückgibt, hat Ihnen einen Job übergeben, kein Dokument: in einem Browser geöffnet ist es unformatierter Text in voller Fensterbreite.

Veröffentlichen ist die andere Hälfte. `?share=link` beim Erstellen veröffentlicht das Dokument und gibt seine URL in derselben Antwort zurück, was der ganze Sinn einer API für ein solches Werkzeug ist — ein Dokument zu veröffentlichen sollte ein Request sein, nicht drei. Widerruf muss echt sein, und das ist der Teil, den Leute falsch machen: Ein Dokument auf privat zurückzusetzen entfernt sein Token, sodass ein bereits verschickter Link aufhört zu funktionieren. Eine Freigabe, die man nicht zurücknehmen kann, ist keine Freigabe, sondern eine Veröffentlichung.

Und ein Dokument im öffentlichen Web trägt fremden Inhalt auf Ihrer Domain, was eine Sicherheitsfrage ist, keine API-Frage. Geteilte Seiten werden hier mit `script-src 'self'` und `frame-ancestors 'none'` ausgeliefert, sodass eine Injektion, die [den Sanitizer](/blog/sanitising-markdown-safely) irgendwie überlebt hat, trotzdem nicht laufen kann, und die Seite nicht als fremde eingebettet werden kann. Wenn eine Konvertierungs-API die Ausgabe für Sie hosten wird, fragen Sie, was sie in den Headern sendet, bevor Sie sie auf Dokumente ansetzen, die Sie nicht selbst geschrieben haben.

Schließlich klingt ein Nutzungs-Endpoint wie ein Nachgedanke und ist keiner. `GET /api/v1/usage` beantwortet „wie nah bin ich dran?“ in einem Request, was den Unterschied ausmacht zwischen einem Client, der zurückrudert, bevor er abgelehnt wird, und einem, der jede Obergrenze entdeckt, indem er dagegen läuft.

## Wo eine API die falsche Antwort ist, und was es kostet

Die naheliegende Antwort auf „das nach Zeitplan konvertieren“ ist ein API-Aufruf, und es gibt vier Fälle, in denen das die falsche ist.

**Eine Datei, einmal.** Ein Schlüssel zum Ausstellen, ein Secret zum Speichern und ein Client zum Schreiben, für einen Job, den eine Seite in zehn Sekunden erledigt. Die API verdient sich ihren Wert beim zweiten Vorkommen, nicht beim ersten.

**Dokumente, die die Maschine nicht verlassen dürfen.** Ein Vertrag, eine Patientennotiz, ein unveröffentlichter Plan — für diese ist die Frage nicht, ob ein Dienst vertrauenswürdig ist, sondern ob die Datei überhaupt das Netzwerk überquert hat. Browserseitige Konvertierung beantwortet das mit dem Netzwerk-Tab; eine lokale Bibliothek beantwortet es mit einer Luftlücke. Eine API kann es überhaupt nicht beantworten, was auch immer die Datenschutzerklärung sagt.

**Ein Build, der reproduzierbar sein muss.** Ein Dienst verbessert sich, und Verbesserung ist Drift. Wenn Ihre Ausgabe byte-identisch mit der des letzten Jahres sein muss, wollen Sie eine festgenagelte Bibliotheksversion in Ihrer eigenen Lockfile, nicht das neueste Deployment von jemand anderem.

**Tausende Dateien in einem Durchlauf.** Sechzig Requests pro Minute sind vierzig README-Dateien, ohne es zu merken, und viertausend Seiten nie. Bei diesem Volumen ist die Antwort ein lokaler Konverter, oder ein zusammengeführtes Dokument, oder ein Batch-Endpoint, falls der Dienst einen hat.

Die Kosten, sich für eine API zu entscheiden, sind es wert, klar benannt zu werden, denn sie sind alle dieselbe Art von Kosten: eine Abhängigkeit, die Sie nicht kontrollieren.

- **Ein Netzwerk-Hop in Ihrem Build.** Jede Konvertierung kann jetzt aus Gründen scheitern, die nichts mit Ihrem Dokument zu tun haben — DNS, TLS, ein schlechtes Deployment am anderen Ende.
- **Ein Secret mit einem Lebenszyklus.** Schlüssel lecken, laufen ab und müssen rotiert werden, in jeder Umgebung, die Sie betreiben, und eine vergessene Rotation ist ein Ausfall, den Sie vor Monaten geplant haben.
- **Fremde Obergrenzen.** Deren Größenlimit, deren Rate Limit und deren Kontingent werden zu Fakten über Ihre Pipeline, und sie können sich ändern, ohne Sie zu fragen.
- **Eine Audit-Fläche.** Wohin das Dokument ging, wer es lesen konnte, wie lange es aufbewahrt wurde: alles jetzt Fragen mit Antworten, die Sie nachschlagen müssen, statt Antworten, die Sie selbst geschrieben haben.
- **Latenz, die Sie nicht wegoptimieren können.** Ein lokales Parsen dauert Millisekunden. Ein Round-Trip dauert zehn oder hundert, mal Anzahl der Dateien.

Nichts davon spricht gegen eine Konvertierungs-API. Es spricht dafür, eine zu wählen, weil die Alternative für diesen Job schlechter war, und zu wissen, welchen dieser Punkte Sie akzeptiert haben.

## Wie man eine Dokumentkonvertierungs-API beurteilt

1. **Lesen Sie den Fehlerkatalog vor der Featureliste.** Wenn eine defekte Datei als 500 ohne Nachricht zurückkommt, wird jeder Fehlschlag in Ihrer Pipeline eine Stunde von jemandes Nachmittag kosten, weil die API Ihnen nichts gesagt hat, wonach Sie handeln können.
2. **Finden Sie die Größenlimits in der Dokumentation, nicht in der Produktion.** Ein Limit, das Sie aus einem abgelehnten Request entdecken, ist ein Limit, das Sie während eines Releases entdeckt haben, und auf einer Serverless-Plattform kommt die Ablehnung möglicherweise nicht einmal vom Dienst.
3. **Prüfen Sie, ob ein Retry duplizieren kann.** Ohne Idempotenzschlüssel oder eine vom Aufrufer vorgegebene ID lässt Sie jeder Timeout von Hand abgleichen — entscheiden Sie also jetzt, ob Ihr Client dedupliziert, oder akzeptieren Sie die Duplikate bewusst als Veröffentlichungsentscheidung.
4. **Prüfen Sie, was das Credential erreichen kann.** Ein Schlüssel, der Schlüssel erstellen, die Abrechnung ändern oder den Account löschen kann, macht aus einer geleakten Umgebungsvariable einen Vorfall statt einer Rotation.
5. **Fragen Sie, was der Response-Body tatsächlich ist.** Ein Fragment bedeutet, Sie müssen noch die Hülle schreiben; eine vollständige, eigenständige Datei bedeutet, Sie können die Ausgabe direkt an eine Person weiterreichen.
6. **Versuchen Sie, eine Freigabe abzubrechen.** Wenn ein Link nach dem Widerruf weiter funktioniert, unterscheidet sich die Vorstellung des Dienstes von „privat“ von Ihrer, und Sie werden es auf die schlimmste Art herausfinden.
7. **Konvertieren Sie ein echtes Dokument, dann holen Sie es zurück.** Nicht das Beispiel aus der Dokumentation — Ihre Datei, mit ihren Tabellen, ihrem Front Matter und ihren seltsamen Zeichen, abgerufen über einen zweiten Request. Diese eine Schleife übt Request-Form, Limits, Fehlerpfade und Speicherung in einem Zug aus, und sie dauert etwa fünf Minuten.

## Fazit

Eine Dokumentkonvertierungs-API ist ein kleines Stück Infrastruktur, das entweder sagt, was es tut, oder es nicht tut. Die Teile, die darüber entscheiden, sind unglamourös: wohin die Datei im Request geht, was eine schlechte Datei zurückgibt, welche Obergrenze zum Dienst gehört und welche zur Plattform darunter, ob ein Retry sicher ist, und ob das Ergebnis eine URL hat. Bekommen Sie das richtig, ist die Konvertierung selbst der leichte Teil. Wenn Sie dieselbe Konvertierung von Hand sehen wollen, bevor Sie sie automatisieren, [der Konverter, der vor dieser API sitzt](/) läuft im Browser, konvertiert nirgendwo sonst etwas, und gibt dieselbe eigenständige Datei zurück, die auch die API liefert — was ihn zu einer vernünftigen Art macht, zu prüfen, was Ihr Skript produzieren wird, bevor Sie es auf vierhundert Dateien loslassen. Und wenn das zu konvertierende Dokument keine Datei und kein Repository dahinter hat, weil ein Assistent es gerade erst geschrieben hat, [ist ein Connector statt eines Clients der kürzere Weg](/blog/converting-documents-from-an-assistant).

## FAQ

### Was ist eine Dokumentkonvertierungs-API?

Ein HTTP-Endpoint, der ein Dokument in einem Format entgegennimmt und es in einem anderen zurückgibt, sodass die Konvertierung innerhalb eines Skripts, eines Build-Schritts oder eines geplanten Jobs passieren kann statt in einem Browser-Tab. Die nützlichen speichern das Ergebnis auch und geben ihm eine URL, sodass die Ausgabe wieder abgerufen statt neu erzeugt werden kann.

### Sollte die Datei in den Request-Body oder in ein JSON-Feld?

Senden Sie sie als rohen Body, wenn der Endpoint bereits weiß, was die Konvertierung ist, aus der Route oder einem Query-Parameter — nichts muss escaped werden, und der Body bleibt so klein wie möglich. Nutzen Sie eine JSON-Hülle, wenn Sie mehrere Felder zu senden haben, und stellen Sie sicher, dass die API sagt, welche Form gewinnt, wenn das Dokument selbst JSON ist.

### Was ist die maximale Dateigröße für eine gehostete Konvertierungs-API?

Das hängt mehr von der Plattform ab als vom Dienst: Auf einem Serverless-Host sind Request- und Response-Bodys gedeckelt, und auf Vercel liegt die Obergrenze bei 4,5 MB, durchgesetzt bevor der eigene Code der Anwendung läuft. Dienste, die größere Dokumente akzeptieren müssen, holen die Datei ganz aus dem Request heraus, mit einem direkten Upload in den Speicher und einer danach gesendeten Referenz.

### Wie verhindere ich, dass ein Retry zwei Dokumente erzeugt?

Bevorzugen Sie eine API, die einen Idempotenzschlüssel akzeptiert, sodass ein wiederholter Request die erste Antwort abspielt statt ein zweites Dokument zu erzeugen. Wo es keinen gibt, lassen Sie den Client eine eigene Markierung erzeugen und die Liste aktueller Dokumente vor dem Posten prüfen, oder behandeln Sie jeden Post bewusst als neue Version — was die richtige Antwort ist, wenn alte Links weiter zeigen sollen, was sie zeigten.

### Brauche ich für jede Umgebung einen eigenen API-Schlüssel?

Ja, aus zwei Gründen: Ein Schlüssel pro Umgebung kann widerrufen werden, ohne alles andere zu stoppen, und Rate-Zählung pro Schlüssel bedeutet, dass ein außer Kontrolle geratener Job in Staging nicht das Kontingent von Produktion verbraucht. Bewahren Sie Schlüssel im Secret-Speicher auf, den Ihre Plattform bereits bietet, niemals im Repository, und rotieren Sie sie zu einem Datum, das Sie sich notiert haben.

### Was sollte eine Konvertierungs-API zurückgeben, wenn die Datei defekt ist?

Einen 400 mit der eigenen Nachricht des Parsers, einschließlich wo in der Datei er gestoppt hat — das ist die einzige Information, nach der ein Aufrufer handeln kann, und ein flaches „konnte nicht konvertieren“ schickt jemanden dazu, ein Megabyte mit den Augen zu durchsuchen. Reservieren Sie 5xx für Fehlschläge, die die eigenen des Dienstes sind, und geben Sie den zwei Fällen verschiedene Codes, damit ein Client weiß, ob ein Retry überhaupt helfen könnte.

### Kann ich ein Word-Dokument über eine API konvertieren?

Manchmal, und es lohnt sich zu prüfen statt anzunehmen. Eine `.docx` ist ein Zip-Archiv aus XML, ein Dienst muss also einen Zip-Reader und einen Mapper tragen, um eine anzunehmen; wo dieses Gewicht nicht in der Funktion steckt, wird die Konvertierung stattdessen im Browser angeboten, und die API nimmt das Markdown, das dabei herauskam.
