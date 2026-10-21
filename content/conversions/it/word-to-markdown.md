## Cosa viene conservato

Convertire Word in Markdown significa tenere la struttura del documento e lasciare l’impaginazione: un `.docx` viene letto per ciò che è ogni sua parte, non per l’aspetto che ha sulla pagina.

| Nel file Word | Nel Markdown |
| --- | --- |
| Da Titolo 1 a Titolo 6 | Da `#` a `######` |
| Grassetto, corsivo, barrato | `**bold**`, `*italic*`, `~~struck~~` |
| Elenchi puntati e numerati | Elenchi con `-` e `1.`, due spazi di rientro per livello |
| Caselle di controllo spuntate e vuote in un elenco | `- [x]` e `- [ ]` |
| Una tabella | Una tabella Markdown, con la prima riga come riga di intestazione |
| Un collegamento ipertestuale | Un link allo stesso indirizzo |
| Un’immagine | Incorporata nel documento, con il suo testo alternativo |
| Note a piè di pagina e note di chiusura | Un elenco numerato in fondo, con `[1]` nel testo |
| Un’interruzione di riga (Maiusc+Invio) | Una riga che termina con due spazi |
| Una casella di testo | Il suo testo, dopo il paragrafo a cui era ancorata |

`report.docx` diventa `report.md`. Un asterisco o un trattino basso scritto nel testo viene preceduto da una barra rovesciata, così resta un carattere e non diventa enfasi.

## Cosa si perde

- **Gli stili che non sono titoli.** Titolo, Sottotitolo, Citazione, da Titolo 7 a Titolo 9 e gli stili personalizzati diventano paragrafi normali.
- **L’aspetto.** Caratteri, dimensioni, colori, evidenziazione e sottolineatura. Apice e pedice perdono la loro posizione, quindi H₂O arriva come H2O, e un carattere a spaziatura fissa non trasforma il testo in codice.
- **I commenti,** senza alcun segno nel punto in cui si trovavano.
- **Gli elementi di pagina.** Intestazioni, piè di pagina, numeri di pagina e interruzioni di pagina.
- **Le equazioni.** Tutto ciò che viene dall’editor di equazioni scompare, e la frase si richiude attorno al vuoto.
- **Le celle unite.** Una cella unita viene scritta una sola volta e le celle successive si spostano a sinistra, nello spazio che occupava. Due paragrafi nella stessa cella si attaccano, senza spazio.
- **Note che funzionano.** I link `[1]` e `↑` puntano ad ancore che il Markdown non contiene; non sono note Markdown con `[^1]`.
- **Un sommario che funziona.** Le sue voci arrivano come link seguiti dal numero di pagina, verso segnalibri che non esistono più.

## Un esempio

Un `.docx` con una riga in stile Titolo, un Titolo 1, un paragrafo con una parola in grassetto, una in corsivo, una nota a piè di pagina e un link, un elenco annidato, una tabella e una foto diventa questo, con il base64 dell’immagine accorciato:

```markdown
Roof survey

# Findings

The north gutter is **blocked** and two tiles are *cracked*.[\[1\]](#footnote-1) Prices are on the [supplier’s page](https://example.com/tiles).

- Clear the gutter
  - North side only
- Replace two tiles

| Job | Cost |
| --- | --- |
| Gutter | £80 |
| Tiles | £240 |

![The blocked north gutter](data:image/png;base64,iVBORw0KGgo…)

1. Seen from the scaffold on 3 March. [↑](#footnote-ref-1)
```

«Roof survey» resta un paragrafo normale perché la riga aveva lo stile Titolo.

## Limiti

- Solo `.docx`, fino a 50 MB. Più file rilasciati insieme contano insieme e diventano un unico documento, separati da linee orizzontali.
- Il file viene letto nel browser, non caricato. Nulla arriva a un account se non si è effettuato l’accesso e non si preme Salva, e un documento salvato può pesare al massimo 4 MB.
- Le immagini viaggiano dentro il Markdown: circa 1 MB ciascuna una volta codificata (un file di circa 750 KB) e 2 MB in tutto per ciascun `.docx`. Un’immagine che non ci sta più viene sostituita dal suo testo alternativo in corsivo, o da nulla se non ne aveva.
- Gli elenchi annidati sotto una voce numerata hanno due spazi di rientro, e al Markdown non bastano: una volta visualizzate, le sottovoci escono dalla loro voce. Sotto i punti elenco l’annidamento funziona.
- Un `.docx` protetto da password non si può leggere; occorre togliere prima la password in Word.

## Domande

### Come si converte un documento Word (.docx) in Markdown (.md)?

Si rilascia il `.docx` su questa pagina, si controlla l’anteprima e si preme Scarica .md. [Come convertire un DOCX in Markdown](/blog/convert-docx-to-markdown) mette a confronto questa strada con Pandoc e con mammoth nel proprio codice.

### Si può convertire un vecchio file .doc?

No, solo `.docx`. Prima occorre salvare il `.doc` come `.docx` in Word o in LibreOffice; [come aprire un file .docx](/how-to/open-docx) spiega anche cosa fare con un `.doc` arrivato con l’estensione sbagliata.

### Si può convertire un documento di Google Docs?

Sì, passando dal formato di Word. In Google Docs si sceglie File, Scarica, Microsoft Word, e poi si rilascia qui quel `.docx`.

### Perché il titolo non è diventato un’intestazione?

Lo stile Titolo di Word non è uno degli stili da Titolo 1 a Titolo 6, gli unici che diventano intestazioni. Basta assegnare Titolo 1 alla riga prima di convertire, oppure aggiungere `# ` davanti dopo.

### Che fine fanno i commenti e le revisioni?

I commenti vengono eliminati. Le revisioni escono come se fossero state accettate tutte: il testo inserito resta e quello eliminato sparisce, ma il testo spostato con le revisioni attive manca in entrambi i punti. Conviene accettare o rifiutare ogni modifica in Word prima della conversione.

### Quale formattazione vale la pena conservare?

Meno di quanto sembri. [Cosa non conservare da un .docx](/blog/what-not-to-keep-from-a-docx) passa in rassegna ciò che il Markdown non sa esprimere e quali perdite contano davvero.
