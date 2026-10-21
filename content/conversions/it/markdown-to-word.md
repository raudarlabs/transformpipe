## Cosa viene conservato

Convertire Markdown in Word qui dà la struttura propria di Word: stili con un nome, una numerazione vera e note a piè di pagina vere, non una formattazione stesa a mano sopra il testo Normale.

| Nel Markdown | Nel documento Word |
| --- | --- |
| da `#` a `######` | da Titolo 1 a Titolo 6, elencati nel riquadro di spostamento |
| elenchi `-` e `1.`, annidati | la numerazione di Word, fino a nove livelli; un elenco numerato di primo livello mantiene il proprio numero iniziale |
| `- [ ]` e `- [x]` | ☐ e ☑ |
| `**bold**`, `*italic*`, `~~struck~~`, `==marked==`, `H~2~O`, `x^2^` | grassetto, corsivo, barrato, evidenziazione gialla, pedice, apice |
| `` `code` `` e blocchi di codice delimitati | lo stile di carattere Inline Code; un paragrafo Code ombreggiato per blocco, in Consolas |
| citazioni `>` e riquadri del tipo `[!NOTE]` | lo stile Citazione; uno stile Note, Tip, Important, Warning o Caution |
| una tabella | Griglia tabella, con la riga di intestazione in grassetto e ripetuta su ogni pagina, e l’allineamento mantenuto |
| `[^1]` | una nota a piè di pagina, numerata da Word |
| link a indirizzi web, `mailto:` e titoli | collegamenti ipertestuali; link a un segnalibro posto sul titolo |
| immagini | dentro il file, ridotte alla larghezza della pagina se più larghe, con il testo alternativo come descrizione |

Il titolo nelle proprietà del documento è il primo titolo del testo o, in mancanza, il nome del file. Le pagine sono in formato A4, in Calibri 11 pt.

## Cosa si perde

- **Il blocco di metadati (front matter).** Il blocco YAML tra righe `---` in cima al file viene rimosso; il suo `title:` non viene usato.
- **Evidenziazione, diagrammi e formule.** Il codice resta in un solo colore, senza evidenziazione della sintassi. Un blocco `mermaid` non viene disegnato: il sorgente resta, sotto la didascalia «Mermaid diagram». `$…$` e `$$…$$` mantengono il loro TeX, formattati come codice e non come equazioni di Word.
- **Alcune immagini.** Nel file entrano solo PNG, JPEG e GIF, e uno incorporato come indirizzo `data:` entra sempre. Un WebP o un SVG, un percorso sul disco o un indirizzo web il cui server non consente a un browser di leggerlo diventa la sua descrizione tra parentesi quadre, come link o in corsivo.
- **I link senza destinazione.** Un link a un altro file, o a un titolo che il documento non ha, conserva solo le parole. Lo stesso vale per un wikilink come `[[Page|text]]`.
- **L’HTML grezzo.** I tag spariscono e le parole che racchiudono restano. Un commento viene eliminato del tutto, e così uno script o uno stile scritto come blocco a sé.
- **Gli elementi di pagina.** Non vengono aggiunti sommario, intestazione, piè di pagina né numeri di pagina; Word costruisce un sommario dai titoli quando lo si inserisce. Le colonne delle tabelle escono tutte della stessa larghezza, e la proprietà Autore riporta TransformPipe.

## Un esempio

```markdown
---
title: Release 2.4
---

# Release checklist

Before tagging, read [the build notes](#build-notes) and the
[runbook](https://example.com/runbook).[^1] The ==date== goes in
[the plan](../plans/q3.md).

1. Run the tests
2. Update `CHANGELOG.md`
   - [x] version bumped
   - [ ] date set

> [!WARNING]
> Do not tag on a Friday.

| Step  | Owner |
|:------|------:|
| Build | Ana   |

## Build notes

![Pipeline](pipeline.png)

[^1]: The runbook is internal.
```

Il .docx contiene questi paragrafi, con i loro stili:

```text
Heading 1       Release checklist
Normal          Before tagging, read the build notes and the runbook.¹ The date goes in the plan.
List Paragraph  1. Run the tests
List Paragraph  2. Update CHANGELOG.md
List Paragraph       ☑ version bumped
List Paragraph       ☐ date set
Warning         Warning
Warning         Do not tag on a Friday.
Table Grid      Step  | Owner
                Build |   Ana
Heading 2       Build notes
Normal          [Pipeline]
Footnote Text   ¹ The runbook is internal.
```

In un Word in italiano gli stili predefiniti si chiamano «Titolo 1», «Normale», «Paragrafo elenco», «Griglia tabella» e «Testo nota a piè di pagina». «the build notes» porta al suo titolo. «the plan» puntava a un file sul disco, quindi resta solo testo; `[Pipeline]` sta al posto di un’immagine che il documento non ha mai contenuto.

## Limiti

- File `.md`, `.markdown`, `.mdown` e `.mkd` fino a 10 MB, oppure Markdown incollato. Più file trascinati insieme si dividono i 10 MB e diventano un unico documento, separati da linee.
- Il .docx viene creato nel browser. Nulla arriva a un account finché non si accede e si preme Salva; un documento salvato può occupare al massimo 4 MB.
- Le immagini a un indirizzo web vengono richieste dal browser, al massimo dieci secondi ciascuna.

## Domande

### Come convertire Markdown in Word?

Si trascina qui il file .md oppure si incolla il Markdown, si controlla l’anteprima e si preme Scarica .docx. Per aprire il risultato senza Word si veda [Come aprire un file .docx](/how-to/open-docx).

### Si può importare Markdown in un documento Word già esistente?

Prima lo si converte qui, poi si inserisce il .docx con Inserisci › Oggetto › Testo da file. I titoli arrivano come stili da Titolo 1 a Titolo 6.

### È la stessa cosa di Pandoc per passare da Markdown a Word?

No. Pandoc è un programma da installare, che riprende gli stili da un .docx di riferimento. Qui non c’è un modello, ma titoli, testo, elenchi, citazioni, tabelle e note portano i nomi di stile predefiniti di Word, quindi applicare in Word il modello aziendale ne cambia l’aspetto in un colpo solo. [Da Markdown a Word](/blog/markdown-to-word) mette a confronto Pandoc con il documento di riferimento e le altre strade.

### La fonte deve essere Markdown o .docx?

Conviene tenere il Markdown come originale se vive in un repository o cambia spesso, e mandare il .docx a chi lavora in Word. Le loro modifiche tornano solo convertendo di nuovo il .docx. [Markdown o Word per la documentazione](/blog/markdown-vs-docx-for-documentation) ripercorre la scelta.
