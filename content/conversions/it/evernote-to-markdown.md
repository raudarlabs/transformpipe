## Cosa viene conservato

Ogni nota del file `.enex` diventa una sezione di un unico documento Markdown. Il documento si apre con un titolo che porta il nome del file e con l’elenco dei titoli delle note; poi ogni nota segue sotto il proprio titolo, separata dalla successiva da una linea orizzontale.

| Nella nota | Nel Markdown |
| --- | --- |
| Titolo | `# Titolo`; una nota senza titolo diventa `# Note 3`, secondo la sua posizione nel file |
| Data di creazione e tag | Una riga in corsivo sotto il titolo: `*2026-09-14 · travel, 2026*` |
| Grassetto, corsivo, barrato, link, elenchi, tabelle | La loro forma Markdown; la prima riga di una tabella diventa l’intestazione |
| Caselle di controllo | Un elenco di attività: `- [x]` e `- [ ]` |
| Immagini (PNG, JPEG, GIF, WebP, BMP, AVIF, TIFF) | Incorporate, con il nome del file come testo alternativo |
| Altri allegati | Il nome del file in corsivo, dove si trovava l’allegato |
| Testo cifrato | Una frase in inglese che segnala la passphrase mancante |

Una nota non indica le proprie immagini per nome, ma con l’hash MD5 dei loro byte. Il convertitore calcola questo hash per ogni allegato, così ogni immagine finisce nella sua nota, nel punto in cui si trovava.

## Cosa si perde

- **Gli altri dati della nota.** La data di modifica, l’autore, l’URL di origine e la posizione non vengono letti.
- **La formattazione.** Sottolineato, colore del testo, evidenziazione e caratteri non hanno un equivalente in Markdown. Le parole restano, la formattazione no.
- **I blocchi di codice di Evernote.** Arrivano come paragrafi normali, uno per riga, e non come blocco di codice delimitato.
- **I file allegati veri e propri.** Un PDF o una registrazione conserva il proprio nome nella nota; il file resta in Evernote.
- **I link tra le note.** Mantengono il loro indirizzo `evernote:///`, che fuori da Evernote non apre nulla.
- **Le note vuote.** Una nota senza contenuto, senza data e senza tag viene saltata e non compare nemmeno nell’elenco dei titoli.

## Un esempio

`Travel.enex` contiene due note: «Lisbon trip», con i tag travel e 2026, una riga che inizia in grassetto, due caselle di controllo (una spuntata) e una carta d’imbarco in PDF allegata; e «Where to eat», con il tag travel e un elenco puntato. Il risultato è:

```markdown
# Travel

- Lisbon trip
- Where to eat

---

# Lisbon trip

*2026-09-14 · travel, 2026*

**Flight:** TP 1351, 07:40 from Heathrow

- [x] Book the hotel
- [ ] Renew the travel insurance

*boarding-pass.pdf*

---

# Where to eat

*2026-09-16 · travel*

Recommended by Ana:

- Cervejaria Ramiro
- Taberna da Rua das Flores
```

Se al posto della carta d’imbarco fosse allegata una foto, comparirebbe nello stesso punto, come immagine che porta con sé i propri byte in un URI data.

## Limiti

- **50 MB per conversione**, contando tutti i file trascinati insieme. Più file `.enex` trascinati insieme diventano un solo documento, un’esportazione dopo l’altra.
- **Le immagini hanno un budget**, perché viaggiano dentro il documento: al massimo 1 MB per immagine una volta codificata (circa 750 KB su disco) e 2 MB per tutte quelle di una stessa esportazione. Vengono incluse in ordine, e quella che supera il budget è sostituita dal suo nome di file in corsivo.
- **Un documento, non un file per nota.** Non esiste un’opzione per dividere un’esportazione in note separate.
- **Il salvataggio accetta fino a 4 MB di Markdown.** Un documento più grande resta sullo schermo e si può comunque scaricare.
- **Tutto avviene nel browser.** Senza accesso il file non viene caricato. Con l’accesso, il documento raggiunge l’account solo quando si preme Salva.

## Domande

### Cos’è un file .enex di Evernote?

È il file che Evernote scrive quando si esportano le note: un unico file XML con tutte le note, il contenuto di ciascuna in ENML, la versione ristretta di XHTML propria di Evernote, e gli allegati in base64. [Come aprire un file .enex](/how-to/open-enex) spiega cosa contiene.

### Come convertire Evernote in Markdown?

Si esportano le note da Evernote con File, Esporta note, e si trascina il file `.enex` su questa pagina. Il Markdown compare sullo schermo, e il pulsante di download lo salva come file `.md` con lo stesso nome.

### I tag vengono conservati?

Sì, in corsivo sotto il titolo di ogni nota, dopo la data di creazione. Nel Markdown sono però testo semplice, non tag che un’altra applicazione riconosca come tali.

### Si può avere un file Markdown per ogni nota?

Non con questo convertitore. Ogni nota diventa una sezione di un unico documento, sotto il proprio titolo, e ogni download è un solo file.

### Cosa succede alle immagini e agli allegati?

Le immagini vengono incorporate come URI data, quindi il documento non ha bisogno di una cartella accanto. Ogni altro allegato si riduce al suo nome in corsivo. [Dove finiscono le immagini quando esporti un documento](/blog/pictures-in-a-document-export) spiega quanto costa incorporarle.

### E il testo cifrato?

Senza la passphrase non si può leggere, e il convertitore non la chiede. Al suo posto la nota riporta la frase in inglese «Encrypted text, which needs the passphrase it was written with».
