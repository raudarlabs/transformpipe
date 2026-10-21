## Cosa viene conservato

JSON non conosce titoli né paragrafi, quindi il convertitore decide in base alla forma dei dati. Il nome del file, senza estensione, diventa il titolo del documento: `users.json` si apre come `# users`.

| Nel file | Nel Markdown |
| --- | --- |
| Un array di oggetti con valori tutti semplici | Una tabella, una riga per oggetto e le chiavi come colonne |
| Un array di valori semplici | Un elenco puntato |
| Un oggetto | I suoi campi semplici come etichette in grassetto (`**Status:** shipped`), poi un titolo per ogni campo annidato (`## Customer`) |
| Un array di elementi misti o annidati | Una sezione numerata per elemento: `## 1`, `## 2` |
| Un oggetto o un elenco misto a tre livelli sotto il titolo | Un blocco di codice `json` delimitato, con un’indentazione ordinata |
| `null` | `_null_`, scritto invece di essere omesso |
| Un array o un oggetto vuoto | `_Empty list._` oppure `_Empty object._` |

Le colonne vengono raccolte da tutti i record, nell’ordine in cui compaiono per la prima volta: un campo presente solo nel decimo record ottiene comunque la sua colonna, e gli altri record vi lasciano una cella vuota. Le chiavi diventano parole: trattini bassi e trattini diventano spazi, il camelCase viene separato e la prima lettera diventa maiuscola, così `first_name` si legge «First name» e `lastLogin` «Last Login».

## Cosa si perde

- **Le chiavi così come sono scritte.** Fuori da un blocco di codice compare solo la forma riformulata.
- **Il formato dei numeri.** I numeri vengono letti come numeri: `42.50` diventa `42.5`, `1e3` diventa `1000`, e un intero di oltre 15 cifre circa può perdere le ultime. I valori tra virgolette restano intatti: `"007"` rimane `007`.
- **La tabella, appena un record è annidato.** Basta che un solo record contenga un elenco, anche vuoto, perché l’intero array diventi una serie di sezioni numerate. Niente viene appiattito in nomi di colonna con i punti.
- **L’escape.** Le stringhe vengono scritte così come sono, quindi asterischi o trattini bassi in un valore vengono letti come Markdown. Dentro una tabella, la barra verticale viene protetta con l’escape e un a capo diventa `<br>`.

## Un esempio

Un elenco di utenti restituito da un’API, salvato come `users.json`:

```json
[
  { "id": 1, "first_name": "Ana", "isActive": true, "lastLogin": "2026-10-01" },
  { "id": 2, "first_name": "Ben", "isActive": false, "lastLogin": null },
  { "id": 3, "first_name": "Chloé", "isActive": true, "team": "Docs | Web" }
]
```

Diventa un titolo `# users` seguito da questa tabella:

```markdown
| Id | First name | Is Active | Last Login | Team |
| --- | --- | --- | --- | --- |
| 1 | Ana | true | 2026-10-01 |  |
| 2 | Ben | false | _null_ |  |
| 3 | Chloé | true |  | Docs \| Web |
```

## Limiti

- Un file può pesare fino a 10 MB, e la pagina accetta solo `.json`: un file `.jsonl` o `.ndjson` va quindi rinominato prima. Si può anche incollare il testo.
- Il file viene convertito nel browser e non viene caricato da nessuna parte. Se ha effettuato l’accesso, il documento arriva nel Suo account solo quando preme «Salva», e un documento salvato può pesare al massimo 4 MB.
- Il JSON deve essere rigorosamente valido. Un file che non si riesce a leggere viene rifiutato con «That is not valid JSON» e il messaggio del browser, che di solito indica la posizione dell’errore.

## Domande

### Come si converte un JSON in una tabella Markdown?

Un array di oggetti i cui valori sono tutti stringhe, numeri, booleani o `null` diventa un’unica tabella. I record annidati vanno appiattiti prima, per esempio con `jq`, oppure si accettano le sezioni al posto della tabella. [JSON in tabella Markdown](/blog/convert-json-to-markdown-table) spiega cosa converte in modo netto e cosa no.

### Che cosa succede a un JSON annidato?

Ogni campo annidato riceve un titolo, fino a tre livelli sotto il titolo del documento. A quel livello, un oggetto o un elenco misto diventa un blocco di codice `json`, mentre una tabella o un elenco semplice vengono comunque resi come tali.

### Si può convertire JSON in Markdown con Python?

Non esiste un pacchetto Python: la pagina converte nel browser. Con un account, l’API esegue lo stesso codice: si invia il file a `POST /api/v1/documents?kind=json-to-markdown&name=users.json` con una chiave API, da `requests` o da qualsiasi client HTTP, e il risultato viene salvato nell’account con il titolo `# users`.

### Legge il formato JSON Lines?

Sì, purché il file termini in `.json`. Se il file intero non si riesce a leggere, ogni riga non vuota viene letta come un valore a sé, così un log con un oggetto piatto per riga diventa una tabella. Se una riga non va a buon fine, viene segnalato l’errore del primo tentativo.

### Perché il file viene rifiutato come JSON non valido?

Le cause più comuni sono una virgola dopo l’ultimo elemento, apici singoli al posto delle virgolette doppie e i commenti, che JSON non ammette. [Come aprire un file .json](/how-to/open-json) spiega come trovare l’errore partendo dalla posizione indicata nel messaggio.

### Si può riconvertire Markdown in JSON?

No. I download disponibili sono Markdown, HTML, Word, testo semplice, EPUB e formati per Confluence, Jira e Slack; il JSON non è tra questi.
