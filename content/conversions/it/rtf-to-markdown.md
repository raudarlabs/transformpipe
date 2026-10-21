## Cosa viene conservato

Per convertire un RTF in Markdown, il convertitore lo legge nello stesso modo in cui lo ripercorre un programma di videoscrittura: conserva la formattazione che in Markdown ha un equivalente e salta la tabella dei caratteri, la tabella dei colori e il foglio di stile, che spesso occupano metà del file.

| Nel file | Nel Markdown |
| --- | --- |
| Grassetto, corsivo, barrato | `**grassetto**`, `*corsivo*`, `~~barrato~~` |
| Un paragrafo con livello di struttura (Word) | Un’intestazione di quel livello, da `#` a `######` |
| Una riga in grassetto più grande del corpo del testo (TextEdit, Pages) | Un’intestazione; la dimensione più grande diventa `#` |
| Elenchi puntati e numerati | Elenchi con `-` e con `1.`, rientrati secondo il livello |
| Collegamenti ipertestuali | `[testo](https://…)` |
| Tabelle | Tabelle Markdown, con la prima riga come riga di intestazione |
| Un a capo all’interno di un paragrafo (Word) | Un a capo forzato, una barra rovesciata a fine riga |

Word segna un’intestazione con un livello di struttura, che viene usato dove c’è. Un Mac scrive solo una riga in grassetto più grande, perciò un paragrafo in grassetto dall’inizio alla fine e più grande del corpo del testo viene letto come intestazione, con il livello stabilito dalla dimensione. La dimensione del corpo è quella in cui è composta la maggior parte del testo. Una riga in grassetto alla dimensione del corpo resta un paragrafo in grassetto, e un’intestazione perde il grassetto: `# Titolo`, non `# **Titolo**`.

I caratteri vengono decodificati con la tabella codici indicata dal file, o con Windows-1252 se non ne indica nessuna, e anche le sequenze Unicode vengono lette: «caffè», «café» e il testo cirillico arrivano intatti. Il testo cinese e giapponese arriva intatto solo dove il file lo scrive come sequenze Unicode. Fa eccezione anche il testo di un collegamento: lì le lettere accentate e i caratteri non latini vanno persi, e a volte al loro posto resta un punto interrogativo. Un asterisco o un trattino basso digitati nel testo vengono preceduti da un carattere di escape, così restano caratteri e non diventano formattazione. Se il documento non si apre con un’intestazione, il nome del file viene aggiunto come intestazione.

## Cosa resta fuori

- **Le immagini.** Vengono saltate. Un `.rtfd` del Mac, cioè ciò che TextEdit salva quando un documento contiene immagini, non viene accettato affatto.
- **Caratteri tipografici, colori, dimensioni e allineamento.** La dimensione del carattere serve solo a riconoscere le intestazioni.
- **Sottolineato, apice e pedice.** Le parole restano e la formattazione se ne va, quindi un 2 in apice dopo una x arriva come `x2`.
- **Intestazioni e piè di pagina, e proprietà del documento.** Il titolo e l’autore salvati nelle proprietà del file non vengono letti. Fa eccezione un’intestazione o un piè di pagina a parte per la prima pagina: le sue parole arrivano come testo normale.
- **I commenti.** Vengono saltati, mentre il testo formattato come nascosto arriva come testo normale.
- **I richiami di nota.** Il richiamo sparisce, e il testo della nota viene inserito nel paragrafo a cui apparteneva.
- **Le tabulazioni**, che diventano spazi singoli.

## Un esempio

Una breve lista di controllo salvata da TextEdit, con un titolo più grande in grassetto, una parola in corsivo, un elenco numerato, un collegamento e un orario barrato:

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

Diventa:

```markdown
# Café opening checklist

Before the doors open on *Monday*:

1. Count the **float**
1. Check the [rota](https://example.com/rota)

Old opening time: ~~7:30~~ 8:00
```

Le voci numerate vengono scritte tutte come `1.`; è Markdown a numerarle quando l’elenco viene mostrato.

## Limiti

- **10 MB per caricamento.** Più file trascinati insieme vengono concatenati in un unico documento, e il limite vale per il loro totale.
- **La conversione avviene nel browser.** Il file non viene caricato. Il Markdown arriva in un account solo se si accede e si preme Salva.
- **Deve essere un RTF.** Un file che non comincia con `{\rtf` viene rifiutato, anche se il suo nome finisce in `.rtf`.

## Domande frequenti

### File RTF: cos’è?

Rich Text Format, cioè formato di testo arricchito: un file di testo in cui la formattazione è scritta come parole di controllo in mezzo alle parole stesse. Quasi tutti i programmi di videoscrittura lo leggono e lo scrivono.

### Come aprire un file RTF?

TextEdit sul Mac, Word, LibreOffice e la maggior parte degli altri programmi di videoscrittura lo aprono direttamente; [Come aprire un file .rtf](/how-to/open-rtf) li passa in rassegna. Senza un programma di videoscrittura, lo si può convertire qui e leggere nel browser.

### Le mie intestazioni resteranno intestazioni?

Da Word sì, purché usino gli stili di titolo di Word, perché quegli stili portano un livello di struttura. Da TextEdit o da Pages vengono recuperate solo se la riga dell’intestazione è in grassetto dall’inizio alla fine e più grande del corpo del testo.

### Le immagini vengono conservate?

No. Le immagini dentro un `.rtf` vengono saltate, e i pacchetti `.rtfd` non vengono accettati. Per conservare le immagini conviene salvare il documento come `.docx` o `.odt` e convertire quel file.

### Si può trasformare un file RTF in Word o in PDF?

Sì, passando dal Markdown: dopo la conversione, il menu accanto al pulsante di download offre tra l’altro Word e «Stampa o salva come PDF». Questi formati contengono ciò che contiene il Markdown, quindi i caratteri e i colori dell’originale non tornano.
