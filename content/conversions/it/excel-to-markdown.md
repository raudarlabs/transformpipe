## Cosa viene conservato

Ogni foglio con almeno una riga compilata diventa una tabella Markdown, nell'ordine della cartella di lavoro e compresi i fogli nascosti. Se la cartella ha un solo foglio di questo tipo, si ottiene una tabella sotto un titolo ricavato dal nome del file. Con due o più fogli, a quel titolo segue l'elenco dei nomi dei fogli, poi ogni foglio compare sotto il proprio titolo, separato dal successivo da una linea orizzontale.

La prima riga di ogni foglio diventa la riga di intestazione, e le righe più corte vengono completate con celle vuote.

| Nella cartella di lavoro | Nel Markdown |
| --- | --- |
| Testo | Lo stesso testo, senza spazi all'inizio e alla fine |
| Un numero | Il valore memorizzato: `1250`, non `£1,250.00` |
| Una data | Una data ISO come `2026-07-14` |
| VERO e FALSO | `true` e `false` |
| Una formula | Il risultato salvato con il file |
| Un a capo dentro una cella | `<br>` |
| Una barra verticale | Preceduta da una barra rovesciata, così non chiude la cella |
| Una riga vuota tra due righe | Una riga di celle vuote |

## Cosa si perde

Tutto ciò che non è un valore. Prima di tutto i formati numerici: simboli di valuta, separatori delle migliaia, numero di decimali scelto e percentuali, per cui una cella che mostra 10% diventa `0.1`. Una data con ora conserva soltanto la data, e un orario da solo diventa la data `1899-12-30`. Caratteri, colori, bordi, larghezze delle colonne, formattazione condizionale, commenti, grafici e immagini non vengono letti.

Una cella unita conserva il valore nella prima cella, e le celle che copriva risultano vuote. Un collegamento mantiene il testo e perde l'indirizzo. Una formula che termina con un errore come `#DIV/0!` dà una cella vuota.

Asterischi e trattini bassi digitati in una cella non vengono protetti: `**bozza**` in una cella appare in grassetto quando il Markdown viene visualizzato.

## Un esempio

`q3-budget.xlsx` ha tre fogli. «Q3 budget» contiene due acquisti con data, un costo in formato sterline e una colonna VERO o FALSO, un nome spezzato su due righe e una riga di totale con `=SUM(D2:D3)`. «Suppliers» ha un nome con una barra verticale e uno sconto in formato percentuale. Il terzo foglio è vuoto.

  ```markdown
  # q3-budget

  - Q3 budget
  - Suppliers

  ---

  # Q3 budget

  | Item | Owner | Due | Cost | Approved |
  | --- | --- | --- | --- | --- |
  | Laptop stands | Priya | 2026-07-14 | 1250 | true |
  | Monitor arms<br>(pair) | Sam | 2026-08-01 | 480.5 | false |
  | Total |  |  | 1730.5 |  |

  ---

  # Suppliers

  | Supplier | Lead time | Discount |
  | --- | --- | --- |
  | Ergodesk \| UK | 5 days | 0.1 |
  | Northlight | 2 weeks |  |
  ```

Il foglio vuoto non c'è, come non ci sono i simboli della sterlina e la percentuale, e il totale è il valore che Excel aveva salvato.

## Limiti

Un file può arrivare a 50 MB. Più cartelle di lavoro trascinate insieme si dividono quei 50 MB e diventano un unico documento.

La pagina accetta solo `.xlsx`: i file `.xls`, `.xlsm` e `.ods` vengono rifiutati, quindi conviene salvarne prima una copia in `.xlsx`. Un `.csv` trascinato qui passa al convertitore CSV. Un foglio grafico, cioè un grafico spostato in un foglio a sé, per ora fa fallire la conversione con un errore: conviene prima eliminarlo in una copia. Un grafico collocato su un normale foglio di lavoro viene semplicemente ignorato.

Un titolo o una riga vuota sopra i nomi delle colonne diventa l'intestazione, e i dati che iniziano più in basso o più a destra conservano le righe e le colonne vuote che li precedono. Conviene eliminarle prima della conversione; righe e colonne vuote dopo i dati vengono scartate.

Con l'accesso effettuato, un documento salvato può contenere fino a 4 MB di Markdown. Come aprire un `.xlsx` senza Excel è spiegato in [come aprire un file .xlsx](/how-to/open-xlsx), e cosa perdono l'esportazione in CSV o il copia e incolla in [Da Excel a tabella Markdown: tutte le strade](/blog/convert-excel-to-markdown-table).

## Domande

### Come si converte un file Excel in Markdown?

Trascini il `.xlsx` su questa pagina oppure lo selezioni con «Scegli i file». Le tabelle compaiono sullo schermo, pronte da copiare o da scaricare come file `.md` con il nome della cartella di lavoro.

### Vengono convertiti tutti i fogli, anche quelli nascosti?

Sì, tutti quelli con almeno una riga compilata, nell'ordine della cartella. Non è possibile scegliere un solo foglio: se ne serve uno soltanto, elimini gli altri in una copia del file.

### Le formule vengono conservate?

No, solo i loro risultati: ogni cella con formula dà il valore che Excel ha memorizzato all'ultimo salvataggio del file. Una cartella generata da uno script che non ha mai calcolato le formule dà celle vuote al loro posto.

### Si può convertire una tabella Markdown in Excel?

No. Qui nulla produce `.xlsx` o `.csv`: i download disponibili sono Markdown, HTML, testo semplice, Word, EPUB e i formati di Confluence, Jira e Slack.

### La cartella di lavoro viene caricata su un server?

No. Viene decompressa e convertita nel browser, e il file non lascia il computer. Non viene inviato nulla del suo contenuto, a meno che non abbia effettuato l'accesso e prema Salva, e in quel caso si salva il Markdown, non la cartella di lavoro.
