## Cosa viene conservato

Si comprime in .zip la cartella del vault, o ciò che ha prodotto un plugin di esportazione, e la si carica. Ogni file `.md` non vuoto diventa una nota, nella cartella in cui si trovava.

| Nel vault | Nel Markdown |
| --- | --- |
| `Projects/Website.md` | Una nota «Website» in una cartella Projects |
| Le proprietà, il blocco `---` in cima | Rimosse |
| `[[Pricing]]`, `[[Pricing#Plans]]` | `Pricing` |
| `[[Pricing\|the plan list]]` | `the plan list` |
| `![[sketch.png]]` | L’immagine, incorporata, trovata per nome in qualunque punto dello .zip |
| `![[brief.pdf]]` | `*brief.pdf*` |

Il titolo di una nota è il nome del suo file, messo come titolo di primo livello; un titolo iniziale che si limita a ripeterlo viene tolto.

Titoli, elenchi, attività, tabelle, codice, formule, `==evidenziazioni==` e callout restano come sono scritti; l’anteprima mostra `> [!warning]` come un riquadro di avviso. I wikilink dentro il codice non vengono toccati.

Per impostazione predefinita il vault diventa **Una cartella di pagine** con le sue cartelle, e una nota di cartella, `Projects.md` accanto a `Projects/`, diventa il primo documento di quella cartella. L’opzione **Un solo documento**, sotto l’area di rilascio, produce un unico file: un indice, poi ogni nota sotto il proprio titolo, separate da linee orizzontali.

## Cosa si perde

- **La destinazione dei wikilink.** Fuori da un vault restano solo le parole. Un link interno alla stessa nota, `[[#Tasks]]`, rimane com’è scritto.
- **Le note incorporate.** `![[Pricing]]` dà il nome, non il testo di Pricing.
- **Gli altri allegati.** Un PDF, MP3, WAV, MP4 o MOV incorporato diventa il suo nome di file in corsivo.
- **Gli incorporamenti con una cartella.** Si cerca solo un nome di file senza percorso, quindi `![[assets/plan.png]]` diventa `*assets/plan.png*` anche quando il file è nello .zip.
- **Gli incorporamenti con uno spazio nel nome**, come i file `Pasted image …` di Obsidian, che appaiono come testo.
- **I link Markdown tra note**, che restano come sono scritti.
- **Canvas, impostazioni e dati dei plugin.** Vengono lette solo note e immagini.

Gli identificativi di blocco come `^a1b2c3` e i `%%commenti%%` restano visibili nel testo.

## Un esempio

La cartella My vault, compressa, contiene `Pricing.md`, `attachments/sketch.png` e questa nota, `Projects/Website.md`:

```markdown
---
tags: [work]
status: active
---
# Website

Ship the new pricing page: see [[Pricing#Plans|the plan list]] and [[Roadmap]].

![[sketch.png]]
![[brief.pdf]]

> [!warning] Deadline
> Friday, not Monday.
```

Come **Una cartella di pagine**, l’importazione è una cartella My vault con Pricing e una cartella Projects che contiene questo documento (base64 accorciato):

```markdown
# Website


Ship the new pricing page: see the plan list and Roadmap.

![sketch.png](data:image/png;base64,iVBORw0KGgo…)
*brief.pdf*

> [!warning] Deadline
> Friday, not Monday.
```

## Limiti

- **250 MB per .zip**, elaborato nel Suo browser. Senza accesso non viene caricato nulla; con l’accesso, nulla arriva nell’account finché non lo salva.
- **Le immagini condividono una quota**: 2 MB codificati in un documento unico, circa 4 MB meno il testo per ogni nota di una cartella, e 1 MB (circa 750 KB su disco) per immagine. Un PNG, JPEG, WebP o BMP oltre i 120 KB viene prima ridisegnato, al massimo a 1600 pixel sul lato lungo, e tenuto solo se così diventa più leggero. Quella che comunque non ci sta conserva il suo link.
- **4 MB per documento salvato.** Una nota più grande viene indicata per nome e lasciata fuori quando si salva la cartella.
- **Viene letto ogni file `.md`**, anche nelle cartelle nascoste come `.trash`: conviene togliere ciò che non serve prima di comprimere.
- **Niente dimensioni.** In `![[sketch.png|300]]`, il 300 diventa il testo alternativo dell’immagine.

## Domande

### Come esportare un vault di Obsidian in Markdown?

Un vault è già una cartella di file `.md`, quindi non c’è nulla da esportare: si comprime la cartella del vault e la si carica.

### Che fine fanno i wikilink?

Un link a una nota diventa le sue parole: il testo dopo la barra verticale, se c’è, altrimenti il nome della nota. Il titolo o il blocco a cui puntava si perde insieme all’indirizzo.

### Le mie immagini vengono conservate?

Sì, se il file è nello .zip, rientra nella quota e, se incorporato, non ha spazi nel nome. Un incorporamento viene trovato per nome, un’immagine Markdown per percorso e poi per nome. [Convertire un vault di Obsidian](/blog/convert-obsidian-vault-to-markdown) tratta il resto della sintassi di Obsidian.

### Proprietà e tag vengono conservati?

Come proprietà, no: il blocco `---` viene rimosso, insieme a tag e alias, perché le sue chiavi hanno senso solo dentro il vault. Un `#tag` nel testo resta. [Che cosa fanno i convertitori con il front matter](/blog/front-matter-and-what-converters-do-with-it) spiega la scelta.

### Si possono portare note da Obsidian a Confluence?

Non direttamente: da qui non si pubblica nulla su Confluence. Si converte il vault con **Un solo documento** e poi si sceglie «Confluence storage format» dal menu accanto al pulsante di download.

### È un convertitore generale di formati Obsidian?

Legge un vault, riduce i wikilink alle loro parole e toglie le proprietà; con **Un solo documento**, lo stesso menu offre anche HTML, testo semplice, Word, EPUB, markup di Jira o Slack e **Stampa o salva come PDF**. Della sintassi propria di Obsidian scrive solo i link ai titoli, nel download «Markdown for Obsidian».
