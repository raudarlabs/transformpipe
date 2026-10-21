## Cosa viene conservato

Un `.odt` dichiara da sé che cosa è ciascuna delle sue parti. Convertire un ODT in Markdown restituisce quindi la struttura così come è stata scritta, senza dover indovinare nulla.

| Nel file OpenDocument | Nel Markdown |
| --- | --- |
| I titoli (Titolo 1, Titolo 2…) e gli stili di paragrafo basati su di essi | Da `#` a `######`, i livelli più profondi come `######` |
| Grassetto, corsivo e barrato sulle parole | `**bold**`, `*italic*`, `~~struck~~` |
| Elenchi puntati e numerati | Elenchi con `-` e `1.`, due spazi di rientro per livello |
| Una tabella | Una tabella Markdown, con la prima riga che contiene testo come intestazione |
| Celle unite | Il testo una volta, poi celle vuote, così le colonne restano allineate |
| Note a piè di pagina e note di chiusura | `[^1]` nel testo, le note in fondo, in un’unica numerazione |
| Un collegamento ipertestuale | Un link allo stesso indirizzo |
| Un’immagine | Incorporata nel documento, con il suo titolo (non la sua descrizione) come testo alternativo |
| Un’interruzione di riga (Maiusc+Invio) | Una riga che termina con una barra rovesciata |

Ogni voce numerata viene scritta `1.`, quindi un elenco che partiva da 5 riparte da 1. Se il documento non si apre con un Titolo 1, ne viene aggiunto uno in cima: il titolo impostato in File, Proprietà, oppure il nome del file.

## Cosa si perde

- **L’aspetto.** Sottolineatura, apice e pedice, colori, caratteri e dimensioni. Si perdono anche il grassetto o il corsivo che appartengono allo stile dell’intero paragrafo, anziché a parole al suo interno.
- **Gli stili che non sono titoli di livello.** Gli stili del titolo del documento e del sottotitolo, le citazioni e il testo preformattato diventano paragrafi normali.
- **Intestazioni e piè di pagina,** con i numeri di pagina: viene letto solo il corpo del documento.
- **Le cornici.** Il testo in una cornice scompare, a meno che la cornice non sia ancorata alla pagina; quello di una casella di testo finisce dentro la frase che la circonda.

## Un esempio

Un `.odt` che si apre con un Titolo 1, seguito da un paragrafo con una parola in grassetto, una in corsivo, una nota a piè di pagina e un link, da un elenco annidato, da una tabella e da una foto con titolo, diventa questo, con il base64 dell’immagine accorciato:

```markdown
# Findings

The north gutter is **blocked** and two tiles are *cracked*.[^1] Prices are on the [supplier’s page](https://example.com/tiles).

- Clear the gutter
  - North side only
- Replace two tiles

| Job | Cost |
| --- | --- |
| Gutter | £80 |
| Tiles | £240 |

![The blocked north gutter](data:image/png;base64,iVBORw0KGgo…)

[^1]: Seen from the scaffold on 3 March.
```

Se `roof-survey.odt` fosse cominciato con una riga nello stile del titolo del documento, quella riga resterebbe un paragrafo normale, sotto `# roof-survey`.

## Limiti

- Solo `.odt`, fino a 50 MB; non `.ods`, `.odp` né `.fodt` piatti. Più file rilasciati insieme contano insieme e diventano un unico documento.
- Il file viene letto nel browser, non caricato. Nulla arriva a un account se non si è effettuato l’accesso e non si preme Salva, e un documento salvato può pesare al massimo 4 MB.
- Le immagini viaggiano dentro il Markdown, circa 1 MB ciascuna una volta codificata e 2 MB per file. Un’immagine che non ci sta più, o che è in formato WMF o EMF, conserva il suo percorso all’interno dell’`.odt` e arriva come immagine non visualizzabile.
- **I commenti finiscono nel testo:** autore, data e commento cadono nel mezzo della frase a cui erano legati. Conviene eliminarli prima della conversione.
- **Le modifiche ancora registrate** portano in cima al documento il nome e la data di ogni modifica, insieme a ogni passaggio eliminato. Prima occorre accettarle o rifiutarle tutte in Writer.
- **Un indice** arriva come il suo titolo ripetuto due volte, seguito dalle voci come link con il numero di pagina.
- Gli elenchi annidati sotto una voce numerata, una volta visualizzati, escono da quella voce: due spazi di rientro sotto `1.` non bastano.
- Un `.odt` protetto da password non si può leggere; occorre salvarne una copia senza password.

## Domande

### Come si apre un file .odt?

LibreOffice Writer lo apre gratuitamente su qualsiasi sistema desktop, e lo aprono anche Word e Google Docs. Per leggerlo senza installare nulla basta rilasciarlo qui e leggere l’anteprima; [come aprire un file .odt](/how-to/open-odt) raccoglie le altre strade.

### Come si converte un ODT in Markdown?

Si rilascia l’`.odt` su questa pagina, si controlla l’anteprima e si preme Scarica .md. Il file mantiene il suo nome, quindi `notes.odt` viene scaricato come `notes.md`, e Copia Markdown mette invece il testo negli appunti.

### Le note a piè di pagina vengono mantenute?

Sì, come note a piè di pagina Markdown, che qui l’anteprima mostra come note numerate. Non tutti gli strumenti Markdown le visualizzano: [le note a piè di pagina in Markdown](/blog/markdown-footnotes-support) indica quali lo fanno.

### Perché in cima compare il nome del file come titolo?

Il documento non cominciava con un Titolo 1, oppure prima c’erano modifiche registrate. Impostando un titolo in File, Proprietà, in cima compare quello; aprendo il documento con un Titolo 1, non viene aggiunto nulla.

### Si possono convertire file .ods o .odp?

No, solo documenti di testo. Un foglio di calcolo si può salvare come `.xlsx` in LibreOffice Calc e convertire con «Da Excel a una tabella Markdown», una presentazione come `.pptx` in Impress e convertire con «Da PowerPoint a Markdown».
