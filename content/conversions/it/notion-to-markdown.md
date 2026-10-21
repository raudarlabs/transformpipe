## Cosa viene conservato

Si carica lo .zip che Notion produce esportando nel formato «Markdown & CSV». Ogni file `.md` non vuoto al suo interno diventa una pagina e ogni `.csv` una tabella, a qualunque profondità si trovino nelle cartelle.

| Nell’export | Nel Markdown |
| --- | --- |
| `Project plan 0f1e…e1f0.md` | Una pagina intitolata «Project plan», senza l’identificativo |
| La riga `# Project plan` della pagina | Un solo titolo, non due |
| Una cartella di sottopagine | Una cartella con lo stesso nome, con la pagina madre per prima |
| Un database, `Tasks 9f8e…b1a0.csv` | Una tabella sotto «Tasks», con la prima riga come intestazione |
| Un’immagine nella cartella della pagina | Incorporata nella pagina |

Titoli, elenchi, caselle da spuntare, citazioni, codice, enfasi, link a siti web e HTML come un blocco `<aside>` restano come li ha scritti Notion. Nella tabella di un database, un a capo all’interno di una cella diventa `<br>`.

Per impostazione predefinita l’export diventa **Una cartella di pagine**: un documento per pagina, nelle cartelle dell’export. L’opzione **Un solo documento**, sotto l’area di rilascio, produce invece un unico file: un indice, poi ogni pagina sotto il proprio titolo, separate da linee orizzontali, con i database in fondo.

Un’immagine viene trovata tramite il suo percorso relativo, altrimenti tramite il nome del file in qualunque punto dell’archivio, e viene scritta nella pagina come indirizzo `data:`.

## Cosa si perde

- **La destinazione dei link tra pagine.** Notion collega le pagine con i nomi dei file esportati, e una volta che le pagine sono documenti a quei nomi non corrisponde più nulla. Il link conserva le parole e perde l’indirizzo, in entrambe le modalità; lo stesso vale per un link al `.csv` di un database.
- **Gli identificativi**, tolti da titoli e nomi di cartella. Se tutto si trova nella cartella `Export-…` di Notion, la cartella dell’importazione prende il nome del Suo .zip.
- **Gli altri file.** PDF e altri allegati non vengono letti, e uno .zip dentro lo .zip non viene aperto.
- **Le immagini oltre la quota**, che mantengono il vecchio indirizzo invece di essere incorporate.

## Un esempio

Un export di Notion contiene una pagina Project plan e, nella sua cartella, un’immagine, un database Tasks e una sottopagina Meeting notes con un breve elenco. Il Markdown della pagina è questo:

```markdown
# Project plan

Launch is planned for **March**. Notes from the kick-off are in [Meeting notes](Project%20plan%200f1e2d3c4b5a69788796a5b4c3d2e1f0/Meeting%20notes%20a1b2c3d4e5f60718293a4b5c6d7e8f90.md); wording follows the [style guide](https://example.com/style).

![Timeline](Project%20plan%200f1e2d3c4b5a69788796a5b4c3d2e1f0/timeline.png)
```

Con **Un solo documento**, l’export diventa così (con il base64 dell’immagine accorciato):

```markdown
# Contents

- Project plan
- Meeting notes
- Tasks

---

# Project plan


Launch is planned for **March**. Notes from the kick-off are in Meeting notes; wording follows the [style guide](https://example.com/style).

![Timeline](data:image/png;base64,iVBORw0KGgo…)

---

# Meeting notes


- Scope agreed
- [ ] Book the room

---

# Tasks

| Name | Status | Owner |
| --- | --- | --- |
| Draft brief | Done | Ana |
| Review, round 2 | In progress | Tom |
```

Come **Una cartella di pagine**, l’importazione contiene una cartella Project plan con tre documenti, in quest’ordine: Project plan, Meeting notes, Tasks.

## Limiti

- **250 MB per .zip**, elaborato nel Suo browser. Senza accesso non viene caricato nulla; con l’accesso, nulla arriva nell’account finché non lo salva.
- **Le immagini condividono una quota**: 2 MB codificati in un documento unico, circa 4 MB meno il testo per ogni pagina di una cartella, e 1 MB (circa 750 KB su disco) per immagine. Un PNG, JPEG, WebP o BMP oltre i 120 KB viene prima ridisegnato, al massimo a 1600 pixel sul lato lungo, e tenuto solo se così diventa più leggero.
- **4 MB per documento salvato.** Una pagina più grande viene indicata per nome e lasciata fuori quando si salva la cartella; un documento unico più grande si può comunque scaricare.
- **Ordine per percorso**: alfabetico, con «Page 2» prima di «Page 10».

## Domande

### Come convertire Notion in Markdown?

Si esporta la pagina o lo spazio di lavoro da Notion nel formato «Markdown & CSV» e si carica qui lo .zip. Le pagine arrivano sotto i loro titoli, i database come tabelle.

### Che cosa sono i codici di 32 caratteri nei nomi dei file esportati?

Ognuno è l’identificativo di una pagina in Notion, aggiunto ai suoi nomi di file e di cartella e usato in ogni link che la raggiunge. La conversione li toglie; [Come aprire uno .zip di export](/how-to/open-zip) spiega perché rinominare i file a mano rompe i link.

### Conviene esportare anche le sottopagine?

Sì, se servono le pagine sotto quella esportata: viene convertito solo ciò che si trova nello .zip. Se è attivo anche «Create folders for subpages», una pagina e le sue sottopagine diventano qui una cartella, con la pagina per prima.

### I link tra le pagine funzionano ancora?

No: le parole restano, gli indirizzi si perdono. Per ottenere file separati che continuino a collegarsi fra loro, [Convertire un export di Notion](/blog/convert-notion-export-to-markdown) descrive la riscrittura necessaria.

### È la stessa cosa di notion-to-md?

No. notion-to-md è un pacchetto Node che legge le pagine attraverso l’API di Notion con un token di integrazione; questa pagina legge lo .zip esportato e non si collega mai al Suo spazio di lavoro.

### Si può portare un export di Notion in Obsidian?

In parte. Con **Una cartella di pagine** si sceglie **Scarica .zip** e poi **Per Obsidian**: le stesse cartelle, un file `.md` per pagina, i link ai titoli scritti come li legge Obsidian. I link tra pagine arrivano come semplice testo.
