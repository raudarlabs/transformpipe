## Was übernommen wird

Wer RTF in Markdown umwandeln will, bekommt hier eine Lesart, die der eines Textverarbeitungsprogramms folgt: Erhalten bleibt die Formatierung, für die es in Markdown eine Form gibt, übersprungen werden Schrifttabelle, Farbtabelle und Formatvorlagen, die oft die halbe Datei füllen.

| In der Datei | Im Markdown |
| --- | --- |
| Fett, kursiv, Durchgestrichenes | `**fett**`, `*kursiv*`, `~~durchgestrichen~~` |
| Ein Absatz mit Gliederungsebene (Word) | Eine Überschrift auf dieser Ebene, `#` bis `######` |
| Eine fette Zeile, größer gesetzt als der Fließtext (TextEdit, Pages) | Eine Überschrift, die größte Schrift als `#` |
| Aufzählungen und nummerierte Listen | Listen mit `-` und `1.`, nach Ebene eingerückt |
| Hyperlinks | `[Text](https://…)` |
| Tabellen | Markdown-Tabellen, die erste Zeile als Kopfzeile |
| Ein Zeilenumbruch innerhalb eines Absatzes (Word) | Ein harter Zeilenumbruch, ein Backslash am Zeilenende |

Word kennzeichnet eine Überschrift mit einer Gliederungsebene; wo es eine gibt, wird sie verwendet. Ein Mac schreibt nur eine größere fette Zeile, deshalb gilt ein Absatz, der von Anfang bis Ende fett und größer als der Fließtext ist, als Überschrift, gestuft nach Größe. Als Größe des Fließtexts zählt die, in der der größte Teil des Textes gesetzt ist. Eine fette Zeile in Fließtextgröße bleibt ein fetter Absatz, und eine Überschrift verliert ihr Fett: `# Titel`, nicht `# **Titel**`.

Zeichen werden in der Codepage dekodiert, die die Datei angibt, und in Windows-1252, wenn sie keine nennt; Unicode-Escapes werden ebenfalls gelesen, sodass „Café“ und kyrillischer Text unversehrt ankommen. Chinesischer und japanischer Text kommt nur dort unversehrt an, wo die Datei ihn als Unicode-Escapes schreibt. Eine weitere Ausnahme ist der Text eines Links: Akzentbuchstaben und nichtlateinische Zeichen darin gehen verloren, mitunter bleibt an ihrer Stelle ein Fragezeichen stehen. Ein Sternchen oder Unterstrich im Text wird maskiert und bleibt ein Zeichen, statt zur Formatierung zu werden. Beginnt das Dokument nicht mit einer Überschrift, wird der Dateiname als Überschrift ergänzt.

## Was verloren geht

- **Bilder.** Sie werden übersprungen. Eine `.rtfd` vom Mac, die TextEdit speichert, sobald ein Dokument Bilder enthält, wird gar nicht angenommen.
- **Schriften, Farben, Größen und Ausrichtung.** Die Schriftgröße dient nur dazu, Überschriften zu erkennen.
- **Unterstreichung, Hoch- und Tiefstellung.** Der Text bleibt, die Formatierung geht: Eine hochgestellte 2 hinter einem x wird zu `x2`.
- **Kopf- und Fußzeilen der Seiten sowie die Dokumenteigenschaften.** Titel und Autor aus den Eigenschaften der Datei werden nicht gelesen. Eine Ausnahme ist eine eigene Kopf- oder Fußzeile für die erste Seite: Ihr Text kommt als gewöhnlicher Text an.
- **Kommentare.** Sie werden übersprungen; als verborgen formatierter Text kommt dagegen als gewöhnlicher Text an.
- **Fußnotenzeichen.** Das Zeichen entfällt, und der Text der Fußnote wird in den Absatz eingefügt, zu dem sie gehörte.
- **Tabulatoren**, die zu einfachen Leerzeichen werden.

## Ein Beispiel

Eine kurze Checkliste, gespeichert in TextEdit, mit einem größeren fetten Titel, einem kursiven Wort, einer nummerierten Liste, einem Link und einer durchgestrichenen Uhrzeit:

```rtf
{\rtf1\ansi\ansicpg1252\cocoartf2761
{\fonttbl\f0\fswiss\fcharset0 Helvetica-Bold;\f1\fswiss\fcharset0 Helvetica;\f2\fswiss\fcharset0 Helvetica-Oblique;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx566\pardirnatural\partightenfactor0

\f0\b\fs36 \cf0 Caf\'e9 opening checklist\
\f1\b0\fs24 Before the doors open on 
\f2\i Monday
\f1\i0 :\
\pard\tx220\tx720\li720\fi-720\pardirnatural\partightenfactor0
\ls1\ilvl0\cf0 {\listtext	1.	}Count the 
\f0\b float
\f1\b0 \
{\listtext	2.	}Check the {\field{\*\fldinst{HYPERLINK "https://example.com/rota"}}{\fldrslt rota}}\
\pard\tx566\pardirnatural\partightenfactor0
\cf0 Old opening time: \strike \strikec0 7:30\strike0\striked0  8:00\
}
```

Daraus wird:

```markdown
# Café opening checklist

Before the doors open on *Monday*:

1. Count the **float**
1. Check the [rota](https://example.com/rota)

Old opening time: ~~7:30~~ 8:00
```

Nummerierte Einträge werden alle als `1.` geschrieben; Markdown zählt sie, wenn die Liste angezeigt wird.

## Grenzen

- **10 MB pro Upload.** Mehrere gleichzeitig abgelegte Dateien werden zu einem Dokument verkettet, und die Grenze gilt für ihre Summe.
- **Die Umwandlung läuft in Ihrem Browser.** Die Datei wird nicht hochgeladen. Das Markdown gelangt nur dann in ein Konto, wenn Sie sich anmelden und auf Speichern klicken.
- **Es muss RTF sein.** Eine Datei, die nicht mit `{\rtf` beginnt, wird abgelehnt, auch wenn sie auf `.rtf` endet.

## Häufige Fragen

### Was ist eine RTF-Datei?

Rich Text Format: eine Textdatei, in der die Formatierung als Steuerwörter zwischen den eigentlichen Wörtern steht. Fast jedes Textverarbeitungsprogramm liest und schreibt das Format.

### Wie öffne ich eine RTF-Datei?

TextEdit auf dem Mac, Word, LibreOffice und die meisten anderen Textverarbeitungen öffnen eine RTF-Datei direkt; [Wie man eine .rtf-Datei öffnet](/how-to/open-rtf) geht sie der Reihe nach durch. Ohne Textverarbeitung wandeln Sie die Datei hier um und lesen sie im Browser.

### Werden meine Überschriften zu Überschriften?

Aus Word ja, sofern sie die Überschriften-Formatvorlagen von Word verwenden, denn diese tragen eine Gliederungsebene. Aus TextEdit oder Pages werden sie nur erkannt, wenn die Überschriftzeile durchgehend fett und größer als der Fließtext ist.

### Bleiben Bilder erhalten?

Nein. Bilder in einer `.rtf` werden übersprungen, und `.rtfd`-Pakete werden nicht angenommen. Um Bilder zu behalten, speichern Sie das Dokument als `.docx` oder `.odt` und wandeln stattdessen diese Datei um.

### Kann ich eine RTF-Datei in Word oder PDF umwandeln?

Ja, auf dem Weg über Markdown: Nach der Umwandlung bietet das Menü neben der Download-Schaltfläche unter anderem Word und „Drucken oder als PDF speichern“ an. Beide enthalten, was das Markdown enthält; Schriften und Farben des Originals kommen also nicht zurück.
