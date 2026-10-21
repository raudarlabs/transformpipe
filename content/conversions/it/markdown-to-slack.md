## Cosa viene conservato

Il formato di Slack si chiama mrkdwn, e non è Markdown: un solo asterisco indica il grassetto, un trattino basso il corsivo, una sola tilde barra il testo, un link si scrive `<address|words>` e non ha né titoli né tabelle. Per convertire Markdown nel mrkdwn di Slack, il convertitore scrive ogni elemento come la cosa più vicina che un messaggio consente:

| Nel Markdown | Nel mrkdwn |
| --- | --- |
| `## Heading` | `*Heading*`, una riga in grassetto a sé |
| `**bold**`, `*italic*`, `~~struck~~` | `*bold*`, `_italic_`, `~struck~` |
| `[words](https://example.com)` | `<https://example.com\|words>` |
| `![chart](https://example.com/a.png)` | `<https://example.com/a.png\|chart>` |
| Elenchi puntati annidati | `•`, poi `◦`, poi `▪`, quattro spazi più in dentro a ogni livello |
| `3. item` | `3. item`, contando dal primo numero del Markdown |
| Un elenco di attività | `☑` per le attività fatte, `☐` per quelle aperte |
| Un blocco di codice delimitato | un blocco di codice, senza il linguaggio |
| Una tabella | un blocco di codice con le colonne riempite di spazi |
| Una citazione | `>` all’inizio di ogni riga |
| Un avviso come `> [!TIP]` | una citazione aperta da `:bulb:` e dal titolo in grassetto |
| Una nota a piè di pagina | `[1]`, con le note alla fine |

Un’immagine con un indirizzo web diventa un link a essa, che Slack espande mostrando l’immagine. Il testo evidenziato passa in grassetto. Il grassetto a metà parola, come in `**un**believable`, riceve uno spazio a larghezza zero accanto all’asterisco, così Slack lo legge comunque. Gli altri avvisi si aprono con la propria emoji, come `:warning:`.

Ogni colonna di una tabella viene riempita fino alla cella più larga, con una riga di `─` sotto l’intestazione, e una colonna allineata a destra resta allineata a destra.

`&`, `<` e `>` vengono scritti come `&amp;`, `&lt;` e `&gt;`, le entità che l’API di Slack richiede.

## Cosa si perde

- **La formattazione dentro titoli, testi dei link e celle delle tabelle.** Le parole restano, i segni spariscono.
- **I link ai titoli del documento** conservano le parole e perdono l’indirizzo, perché un messaggio non ha titoli a cui saltare.
- **Il linguaggio di un blocco di codice**, per cui i blocchi di codice di Slack non hanno posto.
- **Pedici ed esponenti**: `H~2~O` arriva come H2O.
- **Le immagini senza indirizzo web** diventano `_[description]_`, oppure `_[picture]_` se non hanno descrizione; maggiori dettagli in [immagini e link che funzionano ancora](/blog/images-and-links-that-still-work).
- **Il front matter** viene rimosso, i **wikilink** conservano le parole e **l’HTML grezzo** conserva solo il testo.
- **Diagrammi e formule** arrivano come sorgente, in carattere da codice.

## Un esempio

Una nota di rilascio scritta in Markdown:

```markdown
## Release 4.2

Exports are **twice as fast**. Details in the [changelog](https://example.com/changes).

- Word export
  - tables keep their widths
- [ ] Update the docs

| Plan | Price |
| :--- | ---: |
| Team | 8 |
| Business | 15 |

> [!TIP]
> Restart the app to pick it up.
```

Il mrkdwn che ne risulta:

````text
*Release 4.2*

Exports are *twice as fast*. Details in the <https://example.com/changes|changelog>.

• Word export
    ◦ tables keep their widths
☐ Update the docs

```
Plan      Price
────────  ─────
Team          8
Business     15
```

> :bulb: *Tip*
> Restart the app to pick it up.
````

## Limiti

- File `.md`, `.markdown`, `.mdown` e `.mkd` fino a 10 MB, oppure Markdown incollato nella pagina. Più file trascinati insieme diventano un unico documento, e i 10 MB valgono per il totale.
- La conversione avviene nel browser. Non viene caricato nulla, a meno di accedere e premere Salva; un account conserva documenti fino a 4 MB.
- Il download è un file di testo, `<name>.slack.txt`.
- Il risultato è testo mrkdwn, non JSON di Block Kit.

## Domande

### Slack supporta Markdown?

Non nel `text` di un messaggio, che Slack legge come mrkdwn: segni singoli, link tra parentesi angolari, niente titoli né tabelle. Per questo il Markdown inviato lì tramite l’API o un webhook arriva con asterischi doppi, cancelletti a inizio riga e una tabella disegnata con barre verticali.

### Come si incolla Markdown in Slack senza perdere la formattazione?

Basta convertirlo qui e premere “Copia per Slack”. Negli appunti finiscono il mrkdwn come testo semplice e il documento formattato come HTML, e la casella dei messaggi di Slack prende la versione formattata. Maggiori dettagli nella [guida per incollare](/how-to/paste-markdown).

### Un messaggio di Slack può mostrare una tabella?

Non in mrkdwn, che non ne ha. La tabella viene scritta come blocco di codice con le colonne riempite di spazi, che risulta allineato perché un blocco di codice usa un carattere a spaziatura fissa. La formattazione nelle celle viene scartata, perché un blocco di codice mostrerebbe gli asterischi invece di interpretarli.

### Perché nel risultato compare `&amp;` invece di `&`?

Slack tratta `&`, `<` e `>` come caratteri di controllo, e la sua API si aspetta che arrivino scritti come entità. Un messaggio inviato tramite l’API o un webhook li mostra come i caratteri stessi.

### Produce JSON di Block Kit?

No. Scrive il testo mrkdwn, che va nel campo `text` di una chiamata a `chat.postMessage` o di un webhook in entrata, oppure in un blocco di sezione. Il JSON intorno resta da scrivere a parte.
