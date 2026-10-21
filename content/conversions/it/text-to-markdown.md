## Cosa si conserva

Ogni carattere e ogni riga, con una barra rovesciata o un’entità aggiunta quasi ovunque Markdown leggerebbe una formattazione nel testo semplice:

| Nel file | Nel Markdown |
| --- | --- |
| `*`, `_`, `` ` ``, `[`, `]`, `~` in qualsiasi punto | `\*`, `\_`, `` \` ``, `\[`, `\]`, `\~` |
| Una barra rovesciata, come in `C:\Users` | Due: `C:\\Users` |
| `#` o `>` a inizio riga | `\#`, `\>` |
| `-`, `+`, `1.` o `1)` seguito da uno spazio a inizio riga | `\-`, `\+`, `1\.`, `1\)` |
| `<` prima di una lettera, `/`, `!` o `?` | `&lt;` |
| `&` che apre un’entità, come `&amp;` | `&amp;amp;` |

Ogni a capo riceve una barra rovesciata, l’interruzione di riga esplicita e visibile di CommonMark, perché altrimenti Markdown unirebbe le righe. Più righe vuote di seguito diventano un solo cambio di paragrafo, i fine riga di Windows vengono normalizzati e il byte order mark (BOM) viene eliminato.

Tutto il resto viene copiato così com’è stato digitato, `AT&T` e `a < b` compresi.

## Cosa si perde

Nessuna parola va persa. Ciò che resta indietro è la struttura che il testo si limita a suggerire:

- **Titoli.** Un titolo in maiuscolo resta una riga normale.
- **Elenchi.** Una riga che inizia con un trattino o un numero resta una riga.
- **Allineamento.** Spazi e tabulazioni iniziali restano nel Markdown, ma in visualizzazione vengono compressi.

## Un esempio

Un file di testo con gli appunti di una riunione:

```text
Standup notes, 14 October
Owner: priya_k

- deploy moved to *Thursday*
1. fix the login bug first
# of open tickets: 12
Wrap key names in <kbd> in the docs

> 3 failing tests, see C:\ci\log.txt
```

diventa:

```markdown
Standup notes, 14 October\
Owner: priya\_k

\- deploy moved to \*Thursday\*\
1\. fix the login bug first\
\# of open tickets: 12\
Wrap key names in &lt;kbd> in the docs

\> 3 failing tests, see C:\\ci\\log.txt\
```

Una volta visualizzato, si legge riga per riga come il file, `<kbd>` compreso; solo l’ultima barra rovesciata è di troppo. Letto come Markdown, lo stesso file darebbe un punto elenco, un corsivo, un elenco numerato, un titolo e una citazione.

## Limiti

- File `.txt`, oppure testo incollato, fino a 10 MB alla volta. Più file diventano un unico documento, separati da `---`.
- Il file viene convertito nel browser e non viene caricato. Arriva nell’account solo se si è effettuato l’accesso e si preme Salva, e un documento salvato può pesare al massimo 4 MB.
- Il file viene letto come UTF-8: un testo salvato in Windows-1252 mostra caratteri sostitutivi al posto delle lettere accentate, e [Come aprire un file .txt](/how-to/open-txt) spiega come riaprirlo con la codifica giusta.
- Un file che termina con un solo a capo, come lo salva la maggior parte degli editor, conserva una barra rovesciata dopo l’ultima riga, e l’anteprima la mostra: è quella che chiude l’esempio.
- `$`, `=` e `^` non vengono escapati, quindi l’anteprima mostra `$x+1$` come formula, `==parola==` evidenziato e `x^2^` in apice. Anche una somma tra parentesi quadre come `[a+b]` diventa una formula, perché le parentesi quadre escapate sono i delimitatori di LaTeX.
- Una riga isolata di tre o più trattini diventa una linea orizzontale, e una riga di `=` o di `-` che chiude un paragrafo lo trasforma in titolo. Una tabella scritta con le barre verticali resta testo.
- Un paragrafo rientrato di quattro spazi o di una tabulazione, tranne il primo, diventa un blocco di codice in cui le barre rovesciate restano visibili.
- Un indirizzo web che contiene un trattino basso, o che chiude una riga, mostra una barra rovesciata di troppo quando l’anteprima lo trasforma in link.

## Domande

### Perché non rinominare semplicemente il .txt in .md?

Se il file è stato scritto in Markdown, sì: un `.md` finisce nella pagina Da Markdown a HTML, che lo prende così com’è. Altrimenti la rinomina trasforma un trattino in un punto elenco e un asterisco in corsivo.

### Si può convertire testo formattato in Markdown?

Non con questo convertitore. Un `.txt` non contiene formattazione, e il riquadro per incollare accetta testo semplice, quindi grassetti e titoli copiati da una pagina arrivano come semplici parole. Un `.rtf` ha il suo convertitore, Da testo formattato a Markdown; per una pagina web salvata c’è Da HTML a Markdown.

### Trasformerà titoli ed elenchi in Markdown?

No. Non sa distinguere un titolo da una frase breve, né un punto elenco da un segno meno, e un’ipotesi sbagliata cambierebbe ciò che il testo dice.

### Perché ci sono barre rovesciate dappertutto?

Sono caratteri di escape, che in visualizzazione non si vedono: `\*` appare come un asterisco, e una barra rovesciata a fine riga come un a capo. [I caratteri di escape in Markdown](/blog/markdown-escaping) spiega che cosa protegge ciascuno; [A capo e liste in Markdown](/blog/markdown-line-breaks-and-lists) spiega l’a capo.

### Si può convertire testo in Markdown da uno script?

Sì, con un account: si invia il testo come corpo della richiesta a `/api/v1/documents?kind=text-to-markdown`, con una chiave API presa dal menu dell’account. Sul server gira lo stesso convertitore, che salva un documento.
