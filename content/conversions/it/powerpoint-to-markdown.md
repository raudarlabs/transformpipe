## Cosa viene conservato

La presentazione diventa un unico documento: l'elenco dei titoli delle diapositive, poi una sezione per diapositiva, separate da linee orizzontali. Le diapositive arrivano nell'ordine di proiezione, per cui una diapositiva trascinata in testa resta in testa. All'interno di una diapositiva, le forme vengono lette nell'ordine in cui il file le memorizza.

| Sulla diapositiva | Nel Markdown |
| --- | --- |
| Il titolo | Il titolo della sezione, altrimenti una prima riga breve, altrimenti «Slide 4» |
| Elenchi puntati e numerati impostati sulla diapositiva | Un elenco, `-` o `1.`, rientrato secondo il livello |
| Altro testo | Paragrafi |
| Parole in grassetto e corsivo | `**grassetto**` e `*corsivo*`, a meno che lo sia tutta la riga |
| Un collegamento web | Un link Markdown allo stesso indirizzo |
| Una tabella | Una tabella Markdown, con la prima riga come intestazione |
| Un'immagine | Un'immagine incorporata nel documento, con il suo testo alternativo |
| Le note del relatore | Una citazione sotto la diapositiva, con l'etichetta **Notes** |

Fuori dalle tabelle, un asterisco o un cancelletto digitati su una diapositiva vengono protetti e compaiono come sono stati scritti. Un'immagine che ricompare su una diapositiva successiva, come un logo, viene inclusa solo la prima volta.

## Cosa si perde

Grafici e SmartArt non vengono letti; una diapositiva che contiene solo un diagramma conserva titolo e note. Numeri di diapositiva, date e piè di pagina vengono eliminati, e così tutto ciò che riguarda l'aspetto: tema, colori, caratteri, posizioni, animazioni e transizioni. Ciò che si trova nello schema diapositiva o in un layout non viene letto, e nemmeno i commenti di revisione. Un collegamento a un'altra diapositiva punta a un percorso all'interno del file, ad esempio `ppt/slides/slide3.xml`, e non porta da nessuna parte.

In una tabella, una cella unita viene tolta invece di restare vuota, quindi il resto della sua riga scala di una colonna a sinistra: un titolo che copre due colonne finisce sopra la prima. Una colonna vuota in ogni riga viene rimossa.

## Un esempio

`hiring-plan.pptx` ha due diapositive. «Where the gaps are» ha tre punti elenco impostati sulla diapositiva, il secondo rientrato, una parola in grassetto e due paragrafi di note del relatore. «Budget» ha una tabella di tre righe e un grafico. Entrambe hanno un piè di pagina e un numero di diapositiva.

  ```markdown
  # hiring-plan

  - Where the gaps are
  - Budget

  ---

  # Where the gaps are

  - Two backend engineers by September
    - One for search, one for payments
  - A designer shared with **Growth**

  > **Notes**
  >
  > We lost two people in June. **Search** is the hire that matters, because the index rebuild is blocked on it.
  >
  > Ask Finance about the designer before Thursday.

  ---

  # Budget

  | Role | Start | Cost |
  | --- | --- | --- |
  | Backend (search) | September | £78k |
  | Backend (payments) | October | £74k |
  ```

Il grafico, il piè di pagina e i numeri sono spariti; le note stanno sotto la diapositiva che spiegano.

## Limiti

Un file può arrivare a 50 MB. Più presentazioni trascinate insieme si dividono quei 50 MB e diventano un unico documento. Viene letto solo `.pptx`; il vecchio formato binario `.ppt` viene rifiutato.

I punti elenco vengono letti dalla diapositiva stessa. Quando una diapositiva li eredita dal layout, come fa di solito la casella del contenuto nel layout «Titolo e contenuto» di PowerPoint, i punti arrivano come paragrafi separati, senza punti elenco e senza livelli. Per lo stesso motivo il sottotitolo di una diapositiva titolo può comparire come elenco di un solo elemento.

Le immagini viaggiano dentro il Markdown, fino a circa 750 KB ciascuna e 1,5 MB per l'intera presentazione. Un'immagine che supera uno dei due limiti, o in un formato che non può essere incorporato, come EMF, diventa una riga in corsivo, con il suo testo alternativo se ne ha uno.

Anche le diapositive nascoste vengono convertite. Con l'accesso effettuato, un documento salvato può contenere fino a 4 MB di Markdown, immagini comprese.

## Domande

### Come si converte un PowerPoint in Markdown?

Trascini il `.pptx` su questa pagina oppure lo selezioni con «Scegli i file». Il documento compare sullo schermo, pronto da copiare o da scaricare come file `.md` con il nome della presentazione.

### Le note del relatore vengono incluse?

Sì, dopo il contenuto di ogni diapositiva, come citazione con l'etichetta **Notes**. Un'esportazione in PDF di solito le perde. Dove si nasconde il riquadro delle note è spiegato in [come aprire un file .pptx](/how-to/open-pptx).

### Si può convertire un vecchio file .ppt?

No. Il `.ppt` è il formato binario precedente al 2007, e questa pagina legge solo il `.pptx`, che è un archivio zip. Salvi la presentazione in `.pptx` con il programma che la apre, poi converta quel file.

### Si può convertire Markdown in PowerPoint?

No. Qui nulla produce un `.pptx`: un documento si scarica come Markdown, HTML, testo semplice, Word, EPUB o nei formati di Confluence, Jira e Slack. Le strade messe a confronto in [convertire PowerPoint in Markdown](/blog/convert-powerpoint-to-markdown) partono tutte da una presentazione.

### La presentazione viene caricata su un server?

No. Viene decompressa e convertita nel browser, e il file non lascia il computer. Non viene inviato nulla del suo contenuto, a meno che non abbia effettuato l'accesso e prema Salva, e in quel caso si salva il Markdown, non la presentazione.
