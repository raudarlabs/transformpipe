## Cosa viene conservato

Il markup wiki di Jira somiglia a Markdown, ma si legge in un altro modo: un solo asterisco indica il grassetto, un trattino barra il testo, un elenco è una sequenza di `*` o `#`, e un a capo dentro un paragrafo resta un a capo. Per convertire Markdown nel markup di Jira, il convertitore riscrive ogni elemento nella forma che Jira legge:

| Nel Markdown | Nel markup di Jira |
| --- | --- |
| `## Heading` | `h2. Heading` |
| `**bold**`, `*italic*`, `~~struck~~` | `*bold*`, `_italic_`, `-struck-` |
| `[words](https://example.com)` | `[words\|https://example.com]` |
| `![chart](https://example.com/a.png)` | `!https://example.com/a.png\|alt=chart!` |
| Un blocco di codice in un linguaggio che Jira conosce | `{code:python}` |
| Qualsiasi altro blocco di codice | `{noformat}` |
| Una tabella | `\|\|head\|\|` e `\|cell\|` |
| Una citazione | `{quote}` |
| Un avviso come `> [!WARNING]` | `{panel}` nel colore che Atlassian usa per quel tipo |
| Un elenco di attività | `(/)` per le attività fatte, `☐` per quelle aperte |

Gli elenchi annidati ripetono il segno, quindi un punto sotto una voce numerata diventa `#*`. Le righe spezzate all’interno di un paragrafo vengono riunite, così Jira non le interrompe dove le aveva mandate a capo l’editor. Un link a un titolo del documento continua a funzionare, verso un `{anchor}` scritto all’inizio di quel titolo, e le note a piè di pagina diventano numeri in apice.

Parentesi quadre, parentesi graffe e barre verticali ricevono sempre l’escape con una barra rovesciata, perché ognuna apre un link, una macro o una cella. Un segno come `*` o `-` riceve l’escape solo al bordo di una parola, dove Jira lo interpreterebbe: `e-mail` resta com’è, `-flag` diventa `\-flag`. Le emoticon come `(i)` ricevono l’escape per restare testo, e il grassetto a metà parola usa la forma tra graffe, `{*}un{*}believable`. Le regole di Markdown stesso sono nella [guida ai caratteri di escape](/blog/markdown-escaping).

## Cosa si perde

- **Il front matter** in cima a una nota viene rimosso, e i **wikilink** conservano solo le parole.
- **Le immagini senza indirizzo web**, con un percorso relativo o incorporate nel file, diventano la loro descrizione in corsivo, `_\[diagram\]_`, oppure spariscono se non ne hanno una, perché Jira non può caricarle; maggiori dettagli in [immagini e link che funzionano ancora](/blog/images-and-links-that-still-work).
- **L’HTML grezzo** conserva il testo e perde tag e commenti.
- **Una citazione dentro un’altra** confluisce in quella esterna, perché `{quote}` non si annida.
- **L’allineamento delle colonne** nelle tabelle.
- **Diagrammi e formule** arrivano come sorgente, in `{noformat}` o `{{ }}`.

## Un esempio

Una segnalazione di bug scritta in Markdown:

````markdown
## Steps to reproduce

1. Open **Billing** and pick a plan
2. Run `sync --force`, then check the [log](https://example.com/log)

> [!WARNING]
> The retry deletes the draft invoice.

| Field | Before | After |
| --- | --- | --- |
| Status | *open* | ~~paid~~ |

```ts
await retry(invoice);
```

- [x] Reproduced on staging
- [ ] Fixed
````

Il markup di Jira che ne risulta:

```text
h2. Steps to reproduce

# Open *Billing* and pick a plan
# Run {{sync \-\-force}}, then check the [log|https://example.com/log]

{panel:title=Warning|bgColor=#FFFAE6}
The retry deletes the draft invoice.
{panel}

||Field||Before||After||
|Status|_open_|-paid-|

{code:javascript}
await retry(invoice);
{code}

* (/) Reproduced on staging
* ☐ Fixed
```

I trattini dentro `{{ }}` ricevono l’escape perché Jira continua a leggere lì i segni di formattazione, e TypeScript diventa `javascript`, il linguaggio più vicino che la macro `{code}` conosce.

## Limiti

- File `.md`, `.markdown`, `.mdown` e `.mkd` fino a 10 MB, oppure Markdown incollato nella pagina. Più file trascinati insieme diventano un unico documento, e i 10 MB valgono per il totale.
- La conversione avviene nel browser. Non viene caricato nulla, a meno di accedere e premere Salva; un account conserva documenti fino a 4 MB.
- Il download è un file di testo, `<name>.jira.txt`.
- In Jira un elenco numerato parte da 1, qualunque fosse il primo numero nel Markdown. Un blocco di codice o una tabella dentro una voce di elenco viene scritto dopo la riga della voce, e la numerazione ricomincia sotto.

## Domande

### Jira supporta Markdown?

In parte. L’editor di Jira Cloud formatta il Markdown mentre si scrive, ma la modalità testo di Jira Data Center, la versione 2 dell’API REST e le regole di automazione leggono il markup wiki, e il Markdown incollato così com’è mette in risalto le parole sbagliate.

### Come si incolla Markdown in Jira Cloud senza perdere la formattazione?

Basta convertirlo qui e premere “Copia per Jira”. Negli appunti finiscono il markup wiki come testo semplice e il documento formattato come HTML, e l’editor di Jira Cloud prende la versione formattata. Maggiori dettagli nella [guida per incollare](/how-to/paste-markdown).

### Si può convertire il markup di Jira in Markdown?

No. La conversione va in una sola direzione, da Markdown al markup wiki.

### Perché il mio blocco di codice è uscito come {noformat}?

Il blocco non aveva un linguaggio, oppure ne aveva uno che la macro `{code}` non conosce. Un blocco `{code}` senza linguaggio viene evidenziato come Java, quindi `{noformat}` lo mostra invece così com’è. Le abbreviazioni come `sh` e `yml` vengono ricondotte a `bash` e `yaml`.

### Produce il JSON per la versione 3 dell’API REST?

No. La versione 3 dell’API REST di Jira Cloud richiede l’Atlassian Document Format, che questo strumento non scrive; il markup wiki lo accetta la versione 2.

### È lo stesso formato che usa Confluence?

No. Confluence salva una pagina nel suo formato di archiviazione, XHTML con macro proprie, ed è quel formato che scrive il convertitore da Markdown a Confluence.
