## Cosa viene conservato

Per convertire Markdown in Confluence, il testo viene scritto nel formato di archiviazione di Confluence, l’XHTML in cui è salvata una pagina, e mostrato nella scheda **Confluence** accanto all’anteprima:

| Nel Markdown | In Confluence |
| --- | --- |
| Da `#` a `######` | Da `<h1>` a `<h6>` |
| Un blocco di codice delimitato | La macro di codice, con il suo linguaggio quando l’elenco della macro lo prevede |
| `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]` | Le macro `info`, `tip`, `info`, `note` e `warning` |
| Un elenco di attività, ogni voce `- [ ]` o `- [x]` | L’elenco di attività di Confluence, con caselle da spuntare |
| Un link a `#un-titolo` | Un link a una macro di ancoraggio posta all’inizio di quel titolo |
| Una tabella | Una tabella con riga di intestazione, allineamento delle colonne mantenuto |
| Note a piè di pagina | Numeri in apice, con le note elencate alla fine |
| Un’immagine a un indirizzo `https://` | Un’immagine che punta a quell’indirizzo |
| `==evidenziato==`, `H~2~O`, `x^2^` | Evidenziazione, pedice, apice |

I pannelli vengono abbinati per colore, non per nome: in Confluence `note` è giallo e `warning` rosso, quindi il Warning di GitHub diventa `note` e il suo Caution `warning`. Un titolo scritto dopo il marcatore, come `> [!TIP] Prima di iniziare`, diventa il titolo del pannello. Gli elenchi annidati e il numero iniziale di un elenco numerato vengono mantenuti.

## Cosa si perde

- **Diagrammi e formule.** Un blocco Mermaid resta il suo sorgente in una macro di codice intitolata «Mermaid diagram», una formula in evidenza il suo TeX in una macro intitolata «LaTeX», una formula nel testo diventa codice.
- **Le immagini senza indirizzo web.** Un percorso relativo o un’immagine incorporata nel file non può arrivare in una pagina senza un caricamento, quindi viene scritta come il suo testo alternativo in corsivo, `[Screenshot]`, oppure omessa se non ne ha.
- **L’HTML grezzo.** I tag spariscono, le loro parole restano; un `<br>` resta un a capo.
- **Il front matter** viene rimosso, e i **wikilink** conservano solo le loro parole.
- **Un elenco che mescola attività e voci normali** diventa un elenco comune, con le caselle disegnate come ☑ e ☐.
- **I linguaggi che la macro di codice non prevede**, come Go o Rust: il blocco esce senza linguaggio.

## Un esempio

````markdown
## Before you deploy

- [x] Tests pass on `main`
- [ ] Changelog updated

> [!WARNING]
> Deploys are frozen after **Thursday**.

```bash
npm run build
```

Back to [the checklist](#before-you-deploy).
````

diventa:

```xml
<h2><ac:structured-macro ac:name="anchor" ac:schema-version="1"><ac:parameter ac:name="">before-you-deploy</ac:parameter></ac:structured-macro>Before you deploy</h2>
<ac:task-list><ac:task><ac:task-id>1</ac:task-id><ac:task-status>complete</ac:task-status><ac:task-body>Tests pass on <code>main</code></ac:task-body></ac:task><ac:task><ac:task-id>2</ac:task-id><ac:task-status>incomplete</ac:task-status><ac:task-body>Changelog updated</ac:task-body></ac:task></ac:task-list>
<ac:structured-macro ac:name="note" ac:schema-version="1"><ac:rich-text-body><p>Deploys are frozen after <strong>Thursday</strong>.</p></ac:rich-text-body></ac:structured-macro>
<ac:structured-macro ac:name="code" ac:schema-version="1"><ac:parameter ac:name="language">bash</ac:parameter><ac:plain-text-body><![CDATA[npm run build]]></ac:plain-text-body></ac:structured-macro>
<p>Back to <ac:link ac:anchor="before-you-deploy"><ac:link-body>the checklist</ac:link-body></ac:link>.</p>
```

## Limiti

Un file può arrivare a 10 MB, oppure il Markdown si può incollare direttamente. La conversione avviene nel browser; senza accesso non viene caricato nulla. **Scarica .confluence.xml** salva il formato di archiviazione in un file.

Nulla qui si collega a Confluence: il risultato lo si incolla o lo si invia da sé, e la destinazione decide quale metà di **Copia per Confluence** conta, perché il pulsante mette negli appunti due versioni.

- **Confluence Cloud.** L’editor prende la versione formattata, l’HTML dell’anteprima, e la ricostruisce come pagina con le proprie regole di incollaggio. Per avere la macro di codice, i pannelli e l’elenco di attività esattamente come scritti, si invia il formato di archiviazione a `body.storage` dell’API REST.
- **Data Center.** L’editor sorgente e l’API REST accettano il formato di archiviazione. La macro di codice riceve solo linguaggi del proprio elenco, perché con qualsiasi altro Data Center mostra un riquadro di errore.
- **Entrambi.** I link ai titoli usano macro di ancoraggio, perché Confluence scrive i propri identificativi dei titoli in modo diverso in Cloud e in Data Center.

Il risultato è il corpo di una pagina: un `# Titolo` in cima vi resta come titolo.

## Domande

### Come si incolla Markdown in Confluence?

Si converte il file, si preme **Copia per Confluence** e si incolla. L’editor di Cloud prende la versione formattata e un campo che si aspetta markup prende il formato di archiviazione; [incollare Markdown in Confluence, Jira o Slack](/how-to/paste-markdown) spiega entrambi i casi.

### Si può importare o caricare Markdown in Confluence direttamente?

No. Non c’è alcun collegamento con Confluence, quindi da qui non si può creare, aggiornare o caricare una pagina. Si ottiene il formato di archiviazione da incollare, o da far inviare all’API REST da uno script.

### Produce Atlassian Document Format (ADF)?

No. L’unico output per Confluence è il formato di archiviazione, l’XHTML che `body.storage` accetta. L’ADF è un formato JSON diverso, e niente qui lo scrive.

### Come arrivano le tabelle Markdown in Confluence?

Come tabelle di Confluence: la prima riga come celle di intestazione, e l’allineamento fissato dai due punti della riga di separazione resta su ogni cella. Markdown non ha celle unite, quindi non ne crea; [tabelle Markdown che sopravvivono alla conversione](/blog/markdown-tables-that-survive-conversion) mostra come va scritta una tabella perché venga riconosciuta.

### C’è qui un convertitore da HTML a Confluence?

No, e nemmeno un plugin: questa pagina accetta Markdown. Un file HTML deve prima passare per la conversione da HTML a Markdown e poi tornare qui.
