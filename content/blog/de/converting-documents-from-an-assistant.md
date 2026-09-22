---
title: "MCP-Dokumentkonverter: Dokumente aus einer Unterhaltung konvertieren und teilen"
description: "Wie ein MCP-Dokumentkonverter Markdown aus einer Unterhaltung in eine Seite verwandelt — die acht Werkzeuge, die Anmeldung ohne Schlüssel und die echten Risiken"
date: 2026-09-09
tag: Automatisierung
keywords: mcp dokumentkonverter, mcp server markdown zu html, custom connector claude, markdown in einem assistenten konvertieren, mcp oauth connector, dokument aus einer unterhaltung teilen
---

Ein Assistent schreibt den ganzen Tag Markdown. Bitten Sie ihn um Release Notes, eine Zusammenfassung eines Meetings, einen ersten Entwurf einer Spezifikation, und was zurückkommt, sind Rauten, Sternchen und Pipe-Zeichen in einem Chatfenster. Dort liest es sich richtig, weil das Chatfenster es darstellt. Überall sonst liest es sich wie nichts.

### Kurzfassung

Ein MCP-Dokumentkonverter ist ein Connector: ein kleiner Server, den der Assistent aufrufen kann, damit das gerade geschriebene Markdown zu einer konvertierten Datei oder einer veröffentlichten Seite wird, ohne dass eine Person Text zwischen zwei Tabs hin- und herbewegt. Die nützliche Form sind fünf Verben — konvertieren, speichern, teilen, auflisten, zurückholen — und der unbequeme Teil ist nicht die Konvertierung, sondern die Autorisierung, die eine widerrufbare Genehmigung sein sollte statt eines eingefügten langlebigen Schlüssels. Es ist wirklich praktisch, und es ist wirklich eine stehende Vollmacht, in Ihrem Namen zu handeln, was bedeutet, dass ein Dokument, das das Modell liest, versuchen kann, es zur Nutzung Ihrer Werkzeuge zu überreden. Nutzen Sie einen Connector für das Dokument, das innerhalb einer Unterhaltung existiert, und eine API, ein CLI oder einen Build-Schritt für alles andere.

Die übliche Abhilfe ist, es herauszukopieren. Antwort markieren, kopieren, einen Konverter finden, einfügen, warten, herunterladen, die Datei umbenennen, anhängen, bemerken, dass die Tabelle als Absatz aus Pipes herauskam, zurückgehen und es noch einmal machen. Jeder dieser Schritte funktioniert. Die Abfolge ist das Problem, und es ist der Schritt, der immer wieder bricht — das Kopieren, das die halbe Codezaun-Umrandung erwischt, das Einfügen, das mit der eigenen Formatierung des Chats ankommt, die Datei namens `download (3).html`. Diese Reibung hat ihren eigenen Artikel: [was tatsächlich passiert, wenn man Modellausgaben in ein Dokument überführt](/blog/ai-output-to-a-shareable-page) behandelt den manuellen Weg und was er kostet, und dieser Beitrag wiederholt das nicht.

Seltsam am manuellen Weg ist, dass der Assistent schon ein Programm ist, das andere Programme aufruft. Er liest Dateien, führt Suchen aus, öffnet Pull Requests. Das eine, was er meist nicht kann, ist, Ihnen das Dokument, das er gerade geschrieben hat, in einer Form auszuhändigen, die ein Mensch öffnen kann. Nicht weil das schwer wäre, sondern weil niemand den Konverter angeschlossen hat.

Das ist die Lücke, die ein Connector schließt, und der Rest dieses Artikels handelt davon, wie ein guter aussieht, was er in Ihrem Namen tun darf, und die Fälle, in denen der Griff danach der falsche Reflex ist.

## Was MCP schlicht ist

Das Model Context Protocol ist „ein Open-Source-Standard, um KI-Anwendungen mit externen Systemen zu verbinden“ (geprüft auf modelcontextprotocol.io, 9. September 2026). Das ist die ganze Idee. Davor hatte jeder Assistent sein eigenes Plugin-Format, und jeder Werkzeuganbieter schrieb dieselbe Integration mehrfach. Ein gemeinsames Protokoll heißt, ein Werkzeug wird einmal gebaut und ist von allem erreichbar, was es spricht.

Es hat eine Client-Server-Form, mit drei benannten Beteiligten statt zwei. Der Host ist die KI-Anwendung; er erzeugt einen Client pro Server, und jeder Client hält eine dedizierte Verbindung zu seinem Server, der „ein Programm ist, das MCP-Clients Kontext liefert“ (geprüft auf modelcontextprotocol.io, 9. September 2026). In der Praxis können Sie „Host“ als den Assistenten lesen, in den Sie tippen, „Client“ als den Teil davon, der mit einem bestimmten Werkzeug spricht, und „Server“ als das Werkzeug.

| Beteiligter | Was er ist | In diesem Artikel |
| --- | --- | --- |
| Host | Die KI-Anwendung, die einen oder mehrere Clients koordiniert | Der Assistent, mit dem Sie sprechen |
| Client | Hält eine Verbindung und bezieht Kontext von einem Server | Vom Host erzeugt, nichts, das Sie direkt konfigurieren |
| Server | Ein Programm, das Kontext und Werkzeuge liefert | Der Konverter |

Ein Server stellt bis zu drei Arten von Dingen bereit: Werkzeuge, ausführbare Funktionen, die die Anwendung aufrufen kann, um Aktionen durchzuführen; Ressourcen, Datenquellen, die Kontext liefern; und Prompts, wiederverwendbare Vorlagen (geprüft auf modelcontextprotocol.io, 9. September 2026). Ein Konverter besteht fast ausschließlich aus Werkzeugen. Konvertieren ist eine Aktion mit einem Seiteneffekt auf die Welt — eine Datei existiert, die vorher nicht existierte —, und dafür sind Werkzeuge da.

Es gibt zwei Transportarten. Stdio „nutzt Standard-Ein-/Ausgabeströme für direkte Prozesskommunikation zwischen lokalen Prozessen auf derselben Maschine“, und Streamable HTTP „nutzt HTTP POST für Client-zu-Server-Nachrichten mit optionalen Server-Sent Events für Streaming-Fähigkeiten“, was „Kommunikation mit entfernten Servern ermöglicht und Standard-HTTP-Authentifizierungsmethoden unterstützt, einschließlich Bearer-Token, API-Schlüssel und eigener Header“, wobei OAuth zum Beziehen dieser Token empfohlen wird (geprüft auf modelcontextprotocol.io, 9. September 2026).

Diese Unterscheidung entscheidet, wie sich das Einrichten eines Connectors anfühlt. Ein Stdio-Server ist ein Prozess auf Ihrer Maschine: Sie installieren ihn, er läuft, wenn der Assistent ihn startet, und er kann Ihr Dateisystem erreichen, weil er in Ihrem Dateisystem steht. Ein HTTP-Server ist eine URL: nichts wird installiert, es ist derselbe Server für jeden, der ihn hinzufügt, und die interessante Frage wird, woher er weiß, welche Person gerade fragt. Ein gehosteter Dokumentkonverter ist die zweite Art, weshalb sich der Großteil dieses Artikels um diese Frage dreht.

Zwei Dinge, die MCP absichtlich nicht ist. Es ist keine Art, ein Modell laufen zu lassen — das Protokoll „konzentriert sich ausschließlich auf das Protokoll für den Kontextaustausch“ und schreibt nicht vor, wie Anwendungen Modelle nutzen oder Kontext verwalten (geprüft auf modelcontextprotocol.io, 9. September 2026). Und es ist kein Berechtigungssystem. Es trägt Autorisierung, definiert aber nichts darüber, ob das Modell das gerade aufgerufene Werkzeug hätte aufrufen sollen. Dieses Urteil bleibt beim Autor des Werkzeugs und bei Ihnen.

## Was ein Konverter als Connector wert ist

Das Argument, einen Dokumentkonverter anzuschließen, ist nicht, dass Konvertieren schwierig wäre. Es ist, dass das Dokument bereits in der Unterhaltung ist und alles, was Sie als Nächstes tun würden, eine separate Anwendung ist.

Fünf Verben decken fast alles ab. Konvertieren, damit das Markdown zu einer Seite wird. Speichern, damit es eine Adresse hat statt in einem Scroll-Puffer zu leben. Teilen, damit jemand anderes es öffnen kann. Auflisten, damit der Assistent „was habe ich“ beantworten kann. Zurückholen, damit ein vor drei Wochen geschriebenes Dokument bearbeitet statt aus dem Gedächtnis neu geschrieben werden kann. Mit diesen fünf beendet das Modell die Aufgabe innerhalb der Unterhaltung, statt dem Leser eine Wand aus Sternchen zu übergeben und ihm Glück zu wünschen.

TransformPipes Connector stellt acht Werkzeuge bereit, und die Aufteilung ist bewusst: zwei erledigen Arbeit, vier beantworten Fragen, und zwei ändern, was andere Leute sehen können oder ob ein Dokument überhaupt existiert.

| Werkzeug | Wofür es da ist | Was es bewirken kann |
| --- | --- | --- |
| `tp_help` | Beantwortet Fragen dazu, wie das Produkt funktioniert, aus seiner Dokumentation statt aus dem Gedächtnis | Nichts. Es liest Dokumentationsabschnitte und gibt sie zurück |
| `tp_convert_markdown` | Markdown rein, bereinigtes HTML raus; optional das ganze eigenständige Dokument | Nichts wird gespeichert. Die Ausgabe reist durch die Unterhaltung zurück, ein langes Dokument kostet also Kontext |
| `tp_save_document` | Speichert Markdown im Konto und veröffentlicht es im selben Aufruf, wenn danach gefragt wird | Schreibt ein Dokument. Mit einem Freigabemodus wird eine Seite im öffentlichen Web veröffentlicht |
| `tp_list_documents` | Was im Konto liegt — Namen, Größen, Daten, ob jedes geteilt ist — mit der ID, die die anderen Werkzeuge nehmen | Liest. Zeigt die Dokumentliste der Unterhaltung |
| `tp_get_document` | Ein Dokument, per ID, als Markdown-Quelle oder als dargestelltes HTML | Liest. Zieht ein ganzes Dokument in die Unterhaltung |
| `tp_share_document` | Ändert, wer ein Dokument öffnen darf: ein Link, benannte Adressen oder niemand | Veröffentlicht oder hebt die Veröffentlichung auf. Ein Widerruf bricht eine bereits verschickte URL |
| `tp_usage` | Was das Konto gegen seine Grenzen verbraucht | Liest. Lohnt sich zu fragen, wenn ein Speichern abgelehnt wurde |
| `tp_delete_document` | Löscht ein Dokument, dauerhaft | Zerstört Daten. Braucht eine ausdrückliche Bestätigung und entfernt genau eines |

Zwei strukturelle Details zählen mehr als die Liste selbst.

Das erste ist, dass die Werkzeuge keine zweite Implementierung von irgendetwas sind. Jedes ruft die eigene öffentliche API der Anwendung im selben Prozess auf, mit weitergereichter Anmeldeinformation des Aufrufers, sodass eine Unterhaltung und ein Skript dieselbe Antwort vom selben Code bekommen. Das klingt nach einem internen Ordnungspunkt und ist keiner. Ein Werkzeug, das die Datenbank direkt abfragte, wäre eine zweite Implementierung von „wessen Dokumente sind das“, und das ist die Frage, bei der Sie am wenigsten zwei Antworten wollen. Dieselbe Überlegung gilt für die Konvertierung selbst: Das HTML, das ein Werkzeug zurückgibt, ist das HTML, das die Browserseite erzeugt, bereinigt gegen dieselbe Positivliste, weil es derselbe Renderer ist.

Das zweite ist `tp_help`. Ein Modell, das gefragt wird, wie ein Produkt funktioniert, antwortet aus dem, was es im Training aufgenommen hat, was für jedes Produkt, das jünger ist als sein Wissensstichtag, eine selbstsichere Beschreibung von etwas Nichtexistierendem ist. Ein Dokumentationswerkzeug macht daraus ein Nachschlagen. Es ist das am wenigsten glanzvolle Werkzeug in der Tabelle und das, das die meisten falschen Antworten verhindert.

## Es hinzufügen, und die Anmeldung ohne Schlüssel darin

Die Adresse ist das Deployment plus `/api/mcp`:

```
https://transformpipe.com/api/mcp
```

Bei claude.ai geht das unter Einstellungen → Connectors → Benutzerdefinierten Connector hinzufügen. Aus einem Terminal:

```
claude mcp add --transport http transformpipe https://transformpipe.com/api/mcp
```

Das ist die ganze Konfiguration. Es gibt keinen Schlüssel zum Einfügen, und das Fehlen ist der Punkt.

Unter der Adresse ist der Transport JSON-RPC über einen einzelnen POST, ohne Event-Stream. Jedes Werkzeug hier antwortet in einem einzigen Umlauf aus der Datenbank oder aus Blob-Speicher, das Einzige, was ein Stream also kaufen würde, wäre Fortschrittsmeldung für Arbeit ohne Zwischenschritte zu melden. Ein `GET` bekommt eine 405, was eine konforme Art ist zu sagen, dass es an dieser Adresse keinen Stream gibt.

### Was beim ersten Aufruf passiert

Der erste Aufruf trägt kein Token, und was zurückkommt, ist eine 401. Der Status ist das Protokollsignal, und das ist es wert, klar gesagt zu werden, denn es ist die häufigste Art, wie ein selbstgebauter Connector scheitert: eine 200 mit einer höflich formulierten Fehlermeldung wird als gescheitertes Werkzeug gelesen und startet nie eine Anmeldung. Nur der Statuscode tut das.

Die 401 trägt einen `WWW-Authenticate`-Header, der ein geschütztes-Ressource-Dokument und die gewünschten Scopes nennt — `documents:read documents:write`. Von dort läuft der Client eine Kette von Well-Known-Dokumenten ab, um herauszufinden, wo man sich anmeldet, registriert sich selbst und schickt die Person auf eine Seite auf der Website.

Der Ablauf, der aus keinem einzelnen Teil davon offensichtlich ist:

1. Der Client sendet einen POST an den Endpunkt ohne Token und bekommt eine 401 plus einen `WWW-Authenticate`-Header, der das geschützte-Ressource-Dokument nennt.
2. Er liest `/.well-known/oauth-protected-resource`, um den Autorisierungsserver zu finden, dann `/.well-known/oauth-authorization-server`, um dessen Endpunkte zu finden.
3. Er registriert sich selbst und erhält eine `client_id`. Kein Secret wird ausgestellt: ein auf der Maschine einer anderen Person laufender Client kann keines aufbewahren, wofür PKCE da ist.
4. Er schickt die Person zu `/authorize` mit einer PKCE-Challenge. Nicht angemeldet, werden sie geparkt und zuerst durch die eigene Anmeldung der Anwendung geleitet.
5. Sie genehmigen — mit einem POST von einer Seite, die sie tatsächlich gelesen haben, ein bloßer Link autorisiert also nichts.
6. Der Client tauscht den Code und seinen Verifier gegen ein Zugriffstoken und ein Refresh-Token.

Die Website muss dafür ihr eigener Autorisierungsserver sein, statt die Sitzung weiterzugeben, die sie schon hat. Die Autorisierungsspezifikation verbietet einer Ressource, ein von jemand anderem ausgestelltes Token zu akzeptieren, die Person meldet sich also genau so an wie immer, genehmigt einen benannten Client auf einer Seite, die sie angesehen hat, und der Client geht mit einem Token davon, das die Website selbst geprägt hat.

### Was der Client tatsächlich bekommt

Ein Token, das als diese Person handelt, für ihre Dokumente, und nichts anderes erreicht. Nicht das Konto. Nicht die Anmeldung, an der das Konto hängt. Nicht die API-Schlüssel, die eine separate Anmeldeinformation für einen separaten Zweck sind. Zugriffstoken werden mit dreißig Tagen Lebensdauer geprägt und Refresh-Token mit hundertachtzig, ein genutzter Connector funktioniert also weiter, und ein vergessener hört irgendwann auf.

Widerrufen geht im Kontomenü, unter API-Schlüssel, und wirkt beim nächsten Aufruf, nicht am Ende irgendeines Cache-Fensters.

Zwei Details auf der Zustimmungsseite existieren wegen bestimmter Angriffe statt aus gutem Geschmack. Die Seite nennt die Adresse, als die der Client gleich handeln wird, denn „genehmigen“ ohne Subjekt ist keine Zustimmung. Und der eigene Name des Clients wird von Steuerzeichen und Bidi-Überschreibungen bereinigt, bevor er angezeigt wird, denn ein Client könnte sich sonst selbst als etwas registrieren, das auf eine Rechts-nach-Links-Überschreibung endet, und die Seite eine Lüge darstellen lassen — ein Problem, gegen das HTML-Escaping nichts ausrichtet.

### Warum diese Form statt eines Schlüssels

Ein Connector, der einen eingefügten langlebigen API-Schlüssel hält, ist eine Anmeldeinformation an einem Ort, den Sie vergessen werden. Er sitzt in einer Konfigurationsdatei oder in den Einstellungen eines gehosteten Assistenten, und er ist so stark wie der Schlüssel, den Sie zufällig eingefügt haben — was, falls Sie den einfügten, den Sie schon hatten, derselbe Schlüssel ist, den Ihre Deployment-Skripte nutzen. Ihn zu rotieren bricht beides. Ihn zu prüfen sagt Ihnen, dass ein Schlüssel benutzt wurde, nicht welcher Client.

Ein genehmigter Client ist ein anderes Objekt. Er hat einen lesbaren Namen, einen engeren Scope als das Konto, eine eigene Ablaufzeit und einen Widerrufsknopf, der nichts anderes bricht, das Ihnen gehört. Wenn Sie sich in sechs Monaten die Liste ansehen und einen Eintrag nicht erkennen, können Sie genau diesen entfernen. Das ist das ganze Argument, und es ist die zusätzliche Seite im Ablauf wert.

## Die zwei Werkzeuge, die für den Ärger, den sie anrichten können, extra geformt sind

Sechs der acht Werkzeuge sind gewöhnlich. Zwei sind es nicht, und sie sind absichtlich anders geschrieben.

**Teilen veröffentlicht eine Seite im öffentlichen Web.** Es gibt drei Modi, und der Übergang zwischen ihnen ist der Teil, den Leute falsch machen.

| Modus | Wer es öffnen kann | Die Konsequenz, die es zu kennen lohnt |
| --- | --- | --- |
| `private` | Nur der Eigentümer | Widerruft einen bestehenden Link vollständig, eine bereits verschickte URL funktioniert also nicht mehr |
| `link` | Jeder mit der URL | Es ist im öffentlichen Web. Eine URL ist kein Passwort, und Links reisen |
| `people` | Nur die angegebenen Adressen | Die Adressliste wird ersetzt, nicht ergänzt — schicken Sie jedes Mal die ganze Liste |

Speichern kann im selben Aufruf veröffentlichen, was praktisch ist und genau der Grund, warum die eigenen Anweisungen des Servers ans Modell sagen, ein Dokument nur zu teilen, wenn die Person danach gefragt hat. Ein Werkzeug, das im selben Schritt speichert und veröffentlicht, kann durch einen einzigen missverstandenen Satz „behalte das“ in „poste das“ verwandeln. Die Abhilfe ist nicht raffiniert: Die Beschreibung sagt in der ersten Zeile, was es tut, der Modus ist eine ausdrückliche Aufzählung statt eines Booleans namens `public`, und die Antwort ans Modell sagt, in welchem Modus das Dokument jetzt ist und wie seine URL lautet, sodass die Zusammenfassung des Assistenten für Sie eine überprüfbare Aussage ist.

**Löschen braucht eine ausdrückliche Bestätigung und entfernt genau ein Dokument.** `confirm: true` ist erforderlich, und ohne das lehnt das Werkzeug ab und sagt dem Modell, es solle nachfragen. Es gibt kein Rückgängig und keinen Papierkorb. Und es gibt kein Werkzeug, das mehrere löscht — kein Glob, kein „alle geteilten Dokumente löschen“, keinen Datumsbereich. Das ist eine bewusste Abwesenheit, kein fehlendes Feature. Ein Massenlöschen ist das eine Werkzeug, bei dem ein einziges missverstandenes Anweisung Arbeit zerstört, die nicht wiederherzustellen ist, und ein Connector, der die Anweisung nicht ausdrücken kann, kann sie auch nicht ausführen.

Die Bestätigung ist eine echte Abmilderung und eine teilweise, was das Thema des nächsten Abschnitts ist. Sie verhindert ein versehentliches Löschen, denn ein Versehen enthält meist kein Bestätigungs-Flag. Sie verhindert kein Löschen, zu dem das Modell überredet wurde, denn ein Modell, das überzeugt wurde, etwas zu löschen, gibt `confirm: true` genauso bereitwillig weiter wie die ID.

## Wo ein Connector scheitert, und was das kostet

Ein Connector ist eine stehende Vollmacht, in Ihrem Namen zu handeln. Das ist keine Randbemerkung am Fuß der Seite; es ist, was das Ding ist. Einmal hinzugefügt, kann der Assistent diese Werkzeuge aufrufen, wann immer er sie für relevant hält, in einer Unterhaltung, die Sie nicht unbedingt genau lesen, auf Grundlage von Text, den Sie nicht unbedingt selbst geschrieben haben.

**Ein Modell kann von dem Dokument, das es liest, dazu überredet werden, Ihre Werkzeuge zu nutzen.** Das ist Prompt Injection, und für einen Dokumentkonverter ist es nicht hypothetisch, denn Dokumente zu lesen ist der gesamte Job. Jemand schickt Ihnen eine Markdown-Datei. Sie bitten den Assistenten, sie zu konvertieren und zu veröffentlichen. Irgendwo in der Mitte dieser Datei, in einem Kommentar oder einem Codeblock oder weißem Text auf weißem Grund, steckt ein Absatz, der ans Modell adressiert ist statt an Sie. Das Modell verarbeitet jetzt Anweisungen von einem Fremden, während es ein Token hält, das als Sie handelt.

Die Abmilderungen sind echt, und sie sind teilweise. Sie ehrlich zu benennen heißt, beide Hälften zu benennen.

| Abmilderung | Was sie wirklich verhindert | Was sie nicht verhindert |
| --- | --- | --- |
| Ein auf die Daten eines Produkts begrenztes Token | Das Erreichen Ihrer E-Mail, Ihrer Repositories, Ihrer anderen Konten oder der API-Schlüssel im selben Konto | Alles innerhalb des Scopes: Ihre Dokumente lesen, veröffentlichen und löschen |
| Eine ausdrückliche Bestätigung beim destruktiven Werkzeug | Versehentliches Löschen, und beiläufiges Löschen, nach dem die Person nie gefragt hat | Ein Löschen, zu dem das Modell überredet wurde und das es selbst bestätigt |
| Sichtbares und widerrufbares Teilen | Eine Veröffentlichung, die vor Ihnen geheim bleibt, oder die dauerhaft ist | Das Zeitfenster zwischen dem Veröffentlichen und Ihrem Bemerken. Eine kopierte Seite bleibt kopiert |
| Keine Massenoperationen | Eine Anweisung, die viele Dokumente zerstört | Wiederholte einzelne Aufrufe, wenn niemand das Transkript beobachtet |
| Die Person liest, was der Assistent sagt, getan zu haben | Das meiste davon, in der Praxis, wenn die Person tatsächlich liest | Alles in einer Unterhaltung, die niemand überprüft hat, was die meisten langen Unterhaltungen sind |

Diese letzte Zeile leistet mehr Arbeit als die anderen, und sie ist die am wenigsten verlässliche. Die ehrliche Zusammenfassung ist, dass die Sicherheit eines Connectors derzeit auf einem engen Scope plus einer aufmerksamen Person ruht, und die zweite Hälfte davon verfällt genau bei der Arbeitslast, die einen Connector überhaupt lohnenswert macht.

Es gibt drei weitere Kosten, die nichts mit Injection zu tun haben.

**Es ist ein weiterer Dienst, der Ihre Dokumente hält.** Abgemeldet sendet die Browser-Konvertierung auf dieser Website nichts irgendwohin: Die Datei wird auf Ihrer eigenen Maschine gelesen, konvertiert und dargestellt, und Sie können beobachten, wie das Netzwerktab dabei leer bleibt. Ein Connector ist die entgegengesetzte Anordnung, notwendigerweise. Ein Dokument zu speichern bedeutet ein Konto, ein Konto bedeutet Speicher, und Speicher bedeutet eine Firma, die von Ihnen geschriebenen Text hält. Für ein README ist das irrelevant. Für einen Vertrag, eine Patientennotiz oder einen unveröffentlichten Plan ist es die ganze Frage, und die richtige Antwort mag sein, im Browser zu konvertieren und nie zu speichern.

**Das Dokument geht in die Unterhaltung.** `tp_convert_markdown` gibt die konvertierte Ausgabe über denselben Kanal wie alles andere zurück, was heißt, ein langes Dokument ist jetzt Teil eines Transkripts, das gehalten wird von wem auch immer den Assistenten hostet. Das Werkzeug kappt zurückgegebenen Text bei vierzigtausend Zeichen und sagt, wie viel es weggelassen hat, statt still zu kürzen — stilles Kürzen liest sich als Vollständigkeit, was schlimmer ist als eine sichtbare Lücke —, aber Kappen ist eine Gnade für das Kontextfenster, keine Datenschutzkontrolle. Für alles Lange ist es sowohl billiger als auch weniger exponiert, es zu speichern und den Link zu teilen.

**Bereinigen ist immer noch Ihre Sache, zu verstehen, nicht durchzuführen.** Rohes HTML in einer Markdown-Quelle durchläuft einen Bereiniger mit einer festen Positivliste, bevor es eine Seite erreicht, ein `<script>`-Tag in einer Datei, die Ihnen jemand geschickt hat, übersteht die Konvertierung also nicht. Das ist eine Eigenschaft des Konverters statt des Connectors, und es lohnt sich, [wie Bereinigung funktioniert und wo sie passieren muss](/blog/sanitising-markdown-safely) zu lesen, wenn Sie Dateien konvertieren, die Sie nicht selbst geschrieben haben. Was der Bereiniger nicht kann, ist Ihnen zu sagen, dass die Prosa selbst an Ihren Assistenten adressiert war.

## Die Grenzen, und warum eine davon 4 MB ist

Der Connector ist kein separates Produkt mit separaten Obergrenzen. Dieselben Zahlen gelten, ob ein Dokument aus einem Browsertab, einem Skript oder einer Unterhaltung kommt, was die einzige Anordnung ist, die keine Support-Tickets erzeugt.

| Grenze | Wert | Warum diese Zahl |
| --- | --- | --- |
| Pro Konvertierung | 10 MB | Die Konvertierung läuft im Browser, das ist also ein Urteil über die Maschine vor der Person, keine Plattformregel. Mehrere zusammen abgelegte Dateien zählen als das eine Dokument, das sie werden |
| Pro gespeichertem Dokument | 4 MB | Keine Richtlinie. Die Plattform lehnt eine Anfrage oder einen Antwortkörper über 4,5 MB ab, bevor irgendein Code der Anwendung läuft, ein größeres Dokument könnte also weder gespeichert noch zurückgelesen werden |
| Pro Konto | 100 MB, 500 Dokumente | Bytes und Zeilen sind getrennt gedeckelt: tausend winzige Dateien kosten echte Zeilen |
| Pro Aufrufer | 60 Aufrufe pro Minute | Ein Aufrufer, der das auslöst, dreht sich im Kreis, statt zu arbeiten |
| Zurückgegebener Text | 40.000 Zeichen | Eine Werkzeugantwort muss durch die Unterhaltung reisen, ein Dokument sollte sie nicht auffressen |

Die 4-MB-Zahl ist die, die es zu verstehen lohnt, denn sie ist die einzige Grenze, die keine Entscheidung ist. Sie liegt unter den eigenen 4,5 MB der Plattform statt genau darauf, sodass die Ablehnung von der Anwendung kommt, mit beiden Größen darin genannt, statt als nackte Ablehnung von unten — was der Unterschied ist zwischen einem Modell, das Ihnen sagen kann, was als Nächstes zu tun ist, und einem Modell, das einen Fehler meldet, den es nicht erklären kann. Ein Dokument über dieser Größe konvertiert trotzdem, zeigt trotzdem die Vorschau und lädt trotzdem herunter — die Konvertierung läuft in Ihrem Browser, wo keine Anfragekörper beteiligt sind —, es bleibt nur außerhalb der gespeicherten Historie, und die Anwendung sagt das, statt ein Speichern zu melden, das nicht stattfand. Ein Connector erbt das genau: `tp_convert_markdown` verarbeitet eine Datei, die `tp_save_document` ablehnt.

Wird ein Speichern abgelehnt, ist `tp_usage` das Werkzeug, das sagt, warum, in Form von Bytes und Dokumenten, die gegen die jeweilige Obergrenze gehalten werden. Es existiert, weil „es hat nicht gespeichert“ ein Satz ist, den ein Modell sonst kreativ interpretieren wird.

Eine weitere Eigenschaft, die leicht übersehen wird: Der Export ist eine vollständige Datei statt eines Fragments. Doctype, Head, Stile inline, keine externen Anfragen. Das macht ein konvertiertes Dokument fähig, per E-Mail verschickt, offline geöffnet oder auf einer Maschine gelesen zu werden, die die Website nie gesehen hat — und es ist [eine konkrete Eigenschaft mit konkreten Kompromissen](/blog/self-contained-html-explained), keine Marketingzeile.

## Wenn ein Connector das falsche Werkzeug ist

Ein Connector ist für das Dokument, das innerhalb einer Unterhaltung existiert. Das ist ein engerer Fall, als es zunächst scheint, und außerhalb dieses Falls danach zu greifen erzeugt das Schlechteste beider Anordnungen: eine Person in der Schleife, plus einen nichtdeterministischen Schritt in der Mitte.

| Die Aufgabe | Das richtige Werkzeug | Warum kein Connector |
| --- | --- | --- |
| Ein Skript konvertiert Dokumente als Teil von etwas Größerem | Die [REST-API](/blog/converting-documents-with-an-api) | Ein Skript braucht kein Modell, das etwas entscheidet. Es braucht einen Statuscode und einen Body |
| Ein Ordner voller Dateien, jetzt konvertiert | Die [Kommandozeile](/blog/markdown-to-html-from-the-command-line) | Hundert Dateien sind eine Schleife, keine hundert Werkzeugaufrufe. Das ist schneller, billiger und wiederholbar |
| Ein Repository veröffentlicht bei jedem Push | Die [GitHub Action](/blog/publish-markdown-from-github-actions) | Der Auslöser ist ein Commit, und niemand ist in der Unterhaltung, um zu fragen |
| Ein Dokument, das schon auf der Platte liegt, einmal | Die Browserseite | Einen Connector hinzuzufügen, um eine Datei zu konvertieren, ist mehr Konfiguration als die Aufgabe |

Der Test ist, wo das Dokument in dem Moment liegt, in dem Sie es konvertiert haben wollen. Liegt es auf der Platte, in einem Repository oder in einer Variable, sollte ein Programm es konvertieren. Existiert es nur als Text, den ein Modell gerade erzeugt hat, dann ist es wieder das Kopieren-Einfügen-Problem, es herauszuholen, um es zu konvertieren und wieder hineinzubringen, um es zu besprechen, nur mit anderem Hut.

Als Referenz zeigen die zusammen mit dem Protokoll veröffentlichten Referenz-MCP-Server, wie der lokale, stdio-förmige Fall aussieht: Filesystem, „sichere Dateioperationen mit konfigurierbaren Zugriffskontrollen“; Git, „Werkzeuge, um Git-Repositories zu lesen, zu durchsuchen und zu bearbeiten“; Fetch, „Abrufen und Konvertieren von Webinhalten für effiziente LLM-Nutzung“; dazu Memory, Time, Sequential Thinking und ein Everything-Testserver (geprüft auf github.com/modelcontextprotocol/servers, 9. September 2026). Beachten Sie die Arbeitsteilung. Filesystem und Git erreichen schon Ihre Platte und Ihr Repository, ein Dokument, das in einem von beiden liegt, braucht also keinen gehosteten Konverter, um es zu holen — es braucht einen, um zu konvertieren, was diese Werkzeuge übergeben haben, oder gar nichts.

## Wie Sie einen Dokument-Connector beurteilen

1. **Prüfen Sie, ob er widerrufen werden kann, ohne etwas anderes zu brechen.** Ein Connector, der Ihren bestehenden API-Schlüssel wiederverwendet, heißt, dass das Rotieren dieses Schlüssels auch Ihre Deploy-Skripte tötet, und Sie werden das im ungünstigsten Moment herausfinden; ein Connector mit einer eigenen Genehmigung kann auf einen Verdacht hin entfernt werden, ohne Folgen.
2. **Lesen Sie die Beschreibung des destruktiven Werkzeugs, bevor Sie es hinzufügen.** Braucht Löschen keine Bestätigung, oder gibt es ein Werkzeug, das mehr als eines auf einmal löscht, dann ist eine einzige missverstandene Anweisung in einer langen Unterhaltung ein nicht wiederherstellbarer Datenverlust statt eines ärgerlichen Fehlers.
3. **Finden Sie heraus, ob Teilen ein separater Schritt ist oder ein Flag beim Speichern.** Beides ist vertretbar, aber ein Speichern, das im selben Aufruf veröffentlicht, braucht den Modus ausdrücklich in der Antwort genannt, sonst sind „gespeichert“ und „im Internet gepostet“ für die Person, die die Zusammenfassung liest, derselbe Satz.
4. **Fragen Sie, was die Werkzeuge durch die Unterhaltung zurückgeben.** Ein Werkzeug, das ganze Dokumente zurückgibt, füllt das Kontextfenster und bringt Ihren Text ins Transkript, ein Connector, der bei allem Langen eine URL zurückgibt, tut Ihnen also einen Gefallen, der sich als niedrigere Kosten und geringere Exposition zeigt.
5. **Bestätigen Sie, dass die Grenzen mit dem Rest des Produkts übereinstimmen.** Ein Connector mit eigenen, leiseren Obergrenzen lehnt etwas ab, das die Website akzeptiert hätte, und der Fehler kommt an als ein vage sich entschuldigendes Modell statt als Fehler, den Sie beheben können.
6. **Entscheiden Sie, bevor Sie ihn hinzufügen, welche Dokumente Sie bereit sind, gespeichert zu haben.** Ein Connector, der speichert, ist ein Dienst, der Ihren Text hält, und die einzige Version dieser Entscheidung, die eine geschäftige Woche übersteht, ist eine, die Sie im Voraus getroffen haben, nicht eine, die Sie beim Einfügen treffen.

## Fazit

Ein Connector verdient seinen Platz, wenn das Dokument bereits in der Unterhaltung ist und jede Alternative eine Person erfordert, die Text zwischen zwei Fenstern hin- und herbewegt. Was ihn eher lohnenswert macht als bloß clever, ist der langweilige Teil: ein Token, das genau die Dokumente eines Produkts abdeckt und nichts sonst, eine Genehmigung mit einem Namen darauf und ein Widerrufsknopf, der nichts anderes bricht, ein destruktives Werkzeug, das nachfragt, und ein Teilen, das laut sagt, was es gerade veröffentlicht hat. Das sind die Eigenschaften, die Sie bei jedem Connector prüfen sollten, nicht nur bei diesem. Wenn Sie das Dokument lieber auf Ihrer eigenen Maschine behalten, läuft dieselbe Konvertierung im Browser, wobei [abgemeldet nichts hochgeladen wird](/) — und wenn die Aufgabe ein Skript, ein Ordner oder ein Repository ist, nutzen Sie stattdessen die API, das CLI oder die Action, und lassen Sie die Unterhaltung für die Dokumente, die nur dort existieren.

## FAQ

### Was ist ein MCP-Dokumentkonverter?

Es ist ein Dokumentkonverter, der als MCP-Server bereitgestellt wird, sodass ein Assistent ihn als Werkzeug aufrufen kann, statt dass eine Person die Datei von Hand konvertiert. In der Praxis heißt das, das Modell kann gerade geschriebenes Markdown in HTML verwandeln, es speichern, als Seite veröffentlichen und später zurücklesen, alles innerhalb der Unterhaltung, in der der Text schon steht.

### Brauche ich einen API-Schlüssel, um den Connector hinzuzufügen?

Nein. Der erste Aufruf kommt unautorisiert zurück, der Assistent folgt dem zu einer Seite auf der Website, und Sie melden sich mit dem Konto an, das Sie schon nutzen, und genehmigen einen benannten Client. Der Client erhält ein Token, das für Ihre Dokumente und nichts sonst gut ist, und Sie widerrufen es im Kontomenü unter API-Schlüssel.

### Kann ein Assistent mein Dokument veröffentlichen, ohne zu fragen?

Er kann, weshalb die Werkzeuge so geformt sind, wie sie sind: Speichern kann im selben Aufruf veröffentlichen, und die Anweisungen des Servers sagen dem Modell, nur zu teilen, wenn die Person danach gefragt hat. Teilen ist in Ihrer Dokumentliste sichtbar und widerrufbar, und ein Dokument wieder auf privat zu setzen stoppt einen bereits verschickten Link — aber eine Seite, die kopiert wurde, während sie öffentlich war, bleibt kopiert.

### Was passiert, wenn mein Dokument größer ist als die Grenze?

Konvertierung ist bei 10 MB gedeckelt und ein gespeichertes Dokument bei 4 MB, eine Datei zwischen diesen Größen konvertiert und lädt also herunter, kann aber nicht im Konto behalten werden. Diese zweite Grenze ist die der Plattform, keine Richtlinie: Eine Funktion lehnt eine Anfrage oder einen Antwortkörper über 4,5 MB ab, bevor irgendein Code der Anwendung läuft, das Dokument könnte also weder gespeichert noch zurückgelesen werden.

### Ist ein Connector sicherer als das Einfügen in einen Online-Konverter?

Sie scheitern auf unterschiedliche Weise. Einfügen riskiert das Kopieren selbst — die halbe Codezaun-Umrandung, eine verstümmelte Tabelle, der falsche Tab —, während ein Connector riskiert, dass eine stehende Vollmacht auf Grundlage von Text genutzt wird, den Sie nicht selbst geschrieben haben, was Prompt Injection ist. Im Browser abgemeldet zu konvertieren lädt überhaupt nichts hoch, und für ein Dokument, das Sie sich nirgends zu speichern leisten können, bleibt das die stärkste Option.

### Funktioniert ein MCP-Connector nur mit einem Assistenten?

Nein. MCP ist ein offener Standard, der von vielen Clients unterstützt wird, ein per HTTP erreichter entfernter Server funktioniert also mit allem, was das Protokoll spricht und die Anmeldung abschließen kann. Was zwischen Anwendungen unterschiedlich ist, ist, wo Sie die Adresse einfügen und wie sie den Genehmigungsschritt darstellen, nicht der Server.

### Was soll ich tun, wenn der Connector aufhört zu funktionieren?

Prüfen Sie zuerst die Genehmigung: ein widerrufener Client, oder ein Refresh-Token nach Ablauf seiner Lebensdauer, erzeugt genau dieselbe unautorisierte Antwort wie ein brandneuer Connector, und erneutes Genehmigen behebt es. Autorisiert er, weigert sich dann aber zu speichern, bitten Sie den Assistenten, das Nutzungswerkzeug aufzurufen, das Bytes und Dokumente gegen die Kontoobergrenze meldet, statt das Modell raten zu lassen.

### Spart die Umwandlung über einen Connector tatsächlich etwas?

Token, und die Menge ist Arithmetik und keine Behauptung. Ein Werkzeugaufruf, der einen Link zurückgibt, legt elf Token ins Protokoll, wo das Dokument selbst Tausende gelegt hätte — und das Protokoll wird bei jeder weiteren Runde erneut geschickt, der Unterschied summiert sich also. [Was ein Dokument einen Assistenten kostet](/blog/what-a-document-costs-an-assistant) rechnet es durch, einschließlich des Falls, in dem das Modell das Dokument wirklich lesen muss und die Ersparnis null ist.
