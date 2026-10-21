## Cosa viene conservato

La prima riga del file diventa l’intestazione della tabella, e ogni riga successiva una riga della tabella. Il nome del file, senza estensione, compare sopra come titolo: `orders.csv` si apre come `# orders`.

Un `.tsv` viene sempre diviso sulle tabulazioni. Per qualsiasi altro file il separatore è il carattere che compare più spesso nella prima riga, fuori dalle virgolette, tra virgola, tabulazione, punto e virgola e barra verticale; in mancanza di tutti, la virgola. Un’esportazione da un Excel in italiano, che separa i campi con il punto e virgola, non richiede quindi alcuna impostazione, e una virgola decimale come quella di `3,50` resta nella sua cella.

Le virgolette seguono la RFC 4180:

| Nel file | Nel Markdown |
| --- | --- |
| Una virgola in un campo tra virgolette | Resta nella cella |
| Virgolette raddoppiate in un campo di questo tipo | Un solo segno di virgolette |
| Un a capo in un campo di questo tipo | `<br>`, perché una riga di tabella non può occupare due righe |
| Una barra verticale in un valore | Preceduta da una barra rovesciata, così non chiude la cella |
| Una barra rovesciata in un valore | Raddoppiata, così viene mostrata e non letta come carattere di escape |
| Righe vuote, un indicatore di ordine dei byte (BOM) | Eliminati |

I valori restano testo, esattamente come sono scritti: `42.50` mantiene lo zero finale e `007` gli zeri iniziali. Vengono tolti soltanto gli spazi all’inizio e alla fine di ogni cella.

## Cosa si perde

- **L’allineamento.** Ogni colonna riceve un semplice `---`, quindi i numeri non sono allineati a destra. Per ottenerlo basta sostituire a mano il `---` della colonna con `---:`.
- **L’escape oltre le barre verticali.** Asterischi, trattini bassi e apici inversi in un valore restano come sono: una cella che contiene `*urgent*` appare quindi in corsivo.
- **Tutto ciò che aggiunge un foglio di calcolo.** Un CSV contiene solo valori, senza formule, colori o un secondo foglio. Per una cartella di lavoro si può trascinare direttamente il `.xlsx` su questa pagina: lo leggerà il convertitore Excel.

## Un esempio

Un’esportazione di ordini con una virgola, un a capo e virgolette raddoppiate in campi tra virgolette, più una barra verticale in un campo senza:

```csv
id,customer,note,total
1001,"Smith, Jane","Leave at the door
Ring twice",42.50
1002,"Acme ""North"" Ltd",,19.99
1003,Brown | Co,*urgent*,7.00
```

Salvata come `orders.csv`, diventa un titolo `# orders` seguito da questa tabella:

```markdown
| id | customer | note | total |
| --- | --- | --- | --- |
| 1001 | Smith, Jane | Leave at the door<br>Ring twice | 42.50 |
| 1002 | Acme "North" Ltd |  | 19.99 |
| 1003 | Brown \| Co | *urgent* | 7.00 |
```

## Limiti

- Un file può pesare fino a 10 MB. Più file trascinati insieme contano insieme per questo limite e diventano un unico documento, ogni tabella sotto il proprio titolo.
- Il file viene convertito nel browser e non viene caricato da nessuna parte. Se ha effettuato l’accesso, la tabella arriva nel Suo account solo quando preme «Salva», e un documento salvato può pesare al massimo 4 MB.
- Le righe più corte vengono completate con celle vuote. Una riga più lunga dell’intestazione, spesso per una virgola di troppo in fondo, aggiunge una colonna con l’intestazione vuota.
- Un file vuoto viene rifiutato con il messaggio «Questo file non contiene righe.»

## Domande

### Come si converte un CSV in una tabella Markdown?

Si carica il file oppure se ne incolla il testo: le celle copiate da un foglio di calcolo arrivano separate da tabulazioni, e le tabulazioni vengono riconosciute. Il pulsante principale scarica un file `.md`, mentre il menu accanto offre HTML, Word e testo semplice. [Come convertire un CSV in una tabella Markdown senza rovinare i dati](/blog/convert-csv-to-markdown-table) esamina i file che più spesso creano problemi.

### Com’è fatta una tabella Markdown?

Una riga di intestazione, una riga di separazione fatta di trattini e poi una riga per ogni record, con barre verticali tra le celle. Le tabelle vengono da GitHub Flavored Markdown, non dal nucleo di CommonMark, quindi un renderer che segue CommonMark alla lettera mostra le barre come testo. [Tabelle Markdown che sopravvivono alla conversione](/blog/markdown-tables-that-survive-conversion) raccoglie tutti i modi in cui una tabella si rompe.

### Gestisce punto e virgola, tabulazioni e virgole tra virgolette?

Sì. Il separatore viene riconosciuto dalla prima riga, un `.tsv` è sempre letto come separato da tabulazioni, e tutto ciò che sta in un campo tra virgolette resta nella sua cella.

### Che cosa succede se il file non ha una riga di intestazione?

La prima riga è sempre l’intestazione, e nessuna impostazione lo cambia. Conviene aggiungere in cima una riga con i nomi delle colonne prima di convertire, altrimenti il primo record finisce nell’intestazione.

### Perché le lettere accentate appaiono illeggibili?

Il file viene letto come UTF-8, quindi un CSV salvato in una codifica più vecchia, come Windows-1252, perde le lettere accentate. Basta salvarlo di nuovo in UTF-8, che Excel offre come «CSV UTF-8». [Come aprire un file .csv](/how-to/open-csv) tratta gli altri problemi di importazione.

### Si può riconvertire una tabella Markdown in CSV?

No. I download disponibili sono Markdown, HTML, Word, testo semplice, EPUB e formati per Confluence, Jira e Slack; il CSV non è tra questi.
