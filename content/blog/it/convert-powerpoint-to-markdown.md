---
title: "Convertire PowerPoint in Markdown: diapositive, note e ordine di lettura"
description: "Che cosa sopravvive alla conversione di un .pptx in Markdown, dove finiscono le note del relatore e che cosa lascia ancora indietro il nuovo lettore di Pandoc"
date: 2026-09-21
tag: Conversione
keywords: powerpoint in markdown, convertire pptx in markdown, note del relatore powerpoint, convertitore pptx markdown, diapositive in markdown, presentazione in testo
---

Una presentazione è la versione più breve di un ragionamento che qualcuno ha già svolto per intero. È proprio questo a renderla degna di conversione: le diapositive portano la struttura, le note del relatore portano le frasi che le diapositive hanno compresso. Entrambe stanno dentro il file `.pptx`, in XML leggibile, e quasi tutte le uscite da PowerPoint ne buttano via una — quasi sempre le note, perché non sono mai state sullo schermo.

### In breve

Un `.pptx` è uno zip di parti XML: una parte per diapositiva, una parte separata per pagina di note e le immagini in una cartella `ppt/media/`. Quanto bene riesca la conversione dipende quasi interamente da quali di quelle parti lo strumento si prenda la briga di aprire. Pandoc legge una presentazione dalla versione 3.8.3, uscita il 1º dicembre 2025 — il consiglio ricorrente secondo cui non può è vecchio di un anno — ma il suo lettore è marcato alpha e non apre alcuna parte di note, quindi “usa Pandoc” ti costa proprio la metà che non è mai stata proiettata (verificato sul registro delle modifiche e sul sorgente del lettore, 22 settembre 2026). L'esportazione in Struttura/RTF inclusa in PowerPoint raccoglie il testo dei segnaposto di titolo e corpo e lascia fuori tutto il resto, note comprese. Passare per un PDF trasforma un documento strutturato in testo posizionato e perde esattamente la struttura per cui valeva la pena conservare la presentazione. `python-pptx` legge diapositive e note e consegna i pezzi — il Markdown lo scrivi tu. Un convertitore che apre le parti direttamente, come [PowerPoint → Markdown su TransformPipe](/powerpoint-to-markdown), restituisce in una sola passata un titolo per diapositiva, le sue note sotto e le immagini incorporate.

Quello che nessuna strada recupera: animazioni, transizioni, ordine di comparsa, SmartArt come schema e i grafici come qualcosa di diverso da un'immagine. Niente di tutto ciò è mai stato testo.

## Che cosa c'è davvero dentro un .pptx

Rinominane uno in `.zip` e aprilo. Le parti che contano:

| Parte | Contenuto |
| --- | --- |
| `ppt/slides/slide1.xml` | Le forme di una diapositiva, nell'ordine in cui PowerPoint le memorizza |
| `ppt/slides/_rels/slide1.xml.rels` | I suoi rimandi: immagini, collegamenti ipertestuali e la sua pagina di note |
| `ppt/notesSlides/notesSlide1.xml` | Le note del relatore di una diapositiva, come documento a sé |
| `ppt/media/image1.png` | Ogni immagine, a dimensione piena, con un nome proprio |
| `ppt/presentation.xml` | `<p:sldIdLst>` — l'ordine delle diapositive, che non è quello dei nomi di file |

Due di quelle righe sono il punto in cui la maggior parte delle conversioni va storta.

La prima è l'ordine. `slide1.xml` non è necessariamente la prima diapositiva. I numeri sono identificatori assegnati alla creazione, e spostare le diapositive nell'editor non li rinumera. L'ordine vero sta in `<p:sldIdLst>`, dentro `presentation.xml`, come elenco di identificatori di relazione da risolvere attraverso `ppt/_rels/presentation.xml.rels` per arrivare ai nomi di file. Un convertitore che ordina per nome di file restituisce una presentazione riordinata, ed è peggio di nessuna conversione, perché il risultato sembra a posto.

La seconda sono le note. Non stanno affatto nella parte della diapositiva. Ogni pagina di note è un documento XML a sé, legato alla sua diapositiva solo dal file delle relazioni. Uno strumento che legge `ppt/slides/*.xml` e nient'altro non perde le note per un difetto — non ha mai guardato.

## Le sei strade, a confronto

| Strada | Diapositive | Note | Immagini | Ordine di lettura | Impegno |
| --- | --- | --- | --- | --- | --- |
| Copia e incolla dall'editor | Solo testo | No — non sono a schermo | No | Quello dei tuoi clic | Alto, per diapositiva |
| PowerPoint → Struttura/RTF | Solo segnaposto | No | No | Quello dei segnaposto | Basso |
| PowerPoint → PDF → Markdown | Come testo posizionato | Solo stampando le pagine note | A volte | Indovinato dalla geometria | Medio |
| Script con `python-pptx` | Sì | Sì | Con lavoro | Quello che decidi tu | Alto, una volta |
| Pandoc, dalla 3.8.3 | Sì | No — non apre alcuna parte di note | Estratte | Ordine delle diapositive | Basso |
| Un convertitore che legge le parti | Sì | Sì | Incorporate | Quello del documento | Basso |

## Pandoc ora legge una presentazione, e le note ancora no

Qui c’era scritto che Pandoc non sa leggere PowerPoint. È stato vero per diciannove anni e ha smesso di esserlo il 1º dicembre 2025: la versione 3.8.3 ha aggiunto `pptx` come formato di ingresso, e `xlsx` nello stesso rilascio. `pandoc -f pptx deck.pptx -t markdown` funziona.

Quello che esce: le forme di una diapositiva come blocchi, le sue tabelle come tabelle e la sua SmartArt appiattita in testo, nell’ordine delle diapositive. Quello che non esce: le note. Il lettore è fatto di quattro moduli — l’archivio, le forme, le diapositive e SmartArt — e nessuno apre `ppt/notesSlides/`; ogni frase scritta sotto la diapositiva cade senza un avviso. I due nuovi lettori portano inoltre `Stability : alpha` nella loro intestazione, il che è onesto da parte degli autori (verificato sul sorgente, github.com/jgm/pandoc, 22 settembre 2026).

La differenza è tutta qui. Il vecchio consiglio falliva ad alta voce, al primo comando; il comportamento nuovo fallisce in silenzio, nella metà del file che non è mai stata proiettata. Se le note sono il motivo della conversione — e di solito lo sono — la strada deve aprire quella parte. Che cosa fare del testo dopo è trattato in [le alternative a Pandoc](/blog/pandoc-alternatives-for-markdown-to-html).

## L'esportazione in struttura inclusa in PowerPoint

PowerPoint sa salvare una struttura: File, Salva con nome, e scegliere Struttura/RTF nell'elenco dei formati. Su Windows è una normale opzione di salvataggio; su Mac l'importazione lavora con l'RTF, ma le opzioni di esportazione cambiano con la versione, quindi affidati all'elenco che hai davanti (verificato su support.microsoft.com, 21 settembre 2026).

Quello che esce è il testo dei segnaposto di titolo e corpo, rientrato per livello di struttura. Quello che non esce è tutto il resto: il testo scritto dentro una forma o una casella di testo libera anziché in un segnaposto, le tabelle, le immagini e le note del relatore.

| Vantaggi | Svantaggi |
| --- | --- |
| È incluso: nessuno strumento, nessun caricamento, nessuno script | Solo segnaposto — una presentazione fatta di caselle di testo esce quasi vuota |
| Conserva i livelli di titolo come rientro | Niente note, niente tabelle, niente immagini, niente collegamenti |
| L'RTF si converte poi senza problemi | Tace su quello che ha lasciato indietro |

**Per chi va bene?** Per una presentazione ricca di testo, costruita rigorosamente sui layout standard, di cui vuoi solo la struttura a elenco. Se prendi questa strada, l'RTF che ne esce chiede una seconda conversione — [RTF → Markdown](/rtf-to-markdown) copre quella metà.

## Esportare in PDF e convertire il PDF

Allettante, perché ogni presentazione si esporta in PDF e di convertitori di PDF ce ne sono cento. Il problema sta in ciò che fa l'esportazione: il PDF non conosce titoli, elenchi né tabelle, solo glifi a certe coordinate. Un titolo è un titolo perché è grande e sta in alto. Un elenco puntato lo è perché più righe iniziano con lo stesso carattere allo stesso rientro. Ogni convertitore che legge quel PDF ricostruisce una struttura che il `.pptx` dichiarava apertamente e che il PDF ha buttato.

Una cosa però questa strada la sa fare, e le altre no senza scrivere codice: in Stampa, scegli il layout Pagine note e ottieni le note sotto un'immagine di ciascuna diapositiva. È un PDF delle note, non le note come testo, ma è l'unica uscita senza programmazione che se le porta dietro.

| Vantaggi | Svantaggi |
| --- | --- |
| Funziona da qualsiasi versione, su qualsiasi piattaforma | La struttura è dedotta dalla geometria, non letta |
| Le pagine note sono l'unica via inclusa che comprenda le note | Le note arrivano sotto un'immagine rasterizzata della diapositiva |
| La fedeltà visiva è esatta | Le tabelle di solito arrivano come testo sparso; le diapositive a due colonne si intrecciano |

**Per chi va bene?** Per una presentazione che ormai non apre più niente tranne il visualizzatore che ha prodotto il PDF. Altrimenti è trasformare di proposito un file strutturato in uno che non lo è più, il che come prima mossa è strano.

## Uno script, con python-pptx

Se le presentazioni sono tue e ce ne saranno altre, leggere il file direttamente è la strada che ripaga. `python-pptx` apre qualsiasi `.pptx` da PowerPoint 2007 in poi, e le note sono raggiungibili: `Slide.has_notes_slide` e `Slide.notes_slide.notes_text_frame` fanno parte dell'interfaccia documentata (verificato su python-pptx.readthedocs.io, 21 settembre 2026).

```python
from pptx import Presentation

deck = Presentation('deck.pptx')
out = []

for number, slide in enumerate(deck.slides, start=1):
    title = slide.shapes.title
    out.append(f'## {title.text}' if title and title.text else f'## Slide {number}')

    for shape in slide.shapes:
        if shape == slide.shapes.title or not shape.has_text_frame:
            continue
        for paragraph in shape.text_frame.paragraphs:
            text = ''.join(run.text for run in paragraph.runs).strip()
            if text:
                out.append(('  ' * paragraph.level) + f'- {text}')

    if slide.has_notes_slide:
        notes = slide.notes_slide.notes_text_frame.text.strip()
        if notes:
            out.append('> **Notes**')
            out.extend(f'> {line}' for line in notes.splitlines())

    out.append('')

print('\n'.join(out))
```

Guarda su che cosa gira il ciclo: `deck.slides`, che python-pptx risolve attraverso l'elenco degli identificatori di diapositiva. L'ordine è dunque quello della presentazione e non quello dei nomi di file — l'unica parte difficile è già fatta.

Quello che lo script ancora non fa è la coda lunga: le immagini (controllare `shape.shape_type` per `PICTURE`, prendere `shape.image.blob`, scriverlo da qualche parte, emettere un collegamento), le tabelle (`shape.has_table`, poi righe e celle verso una tabella Markdown), le forme raggruppate (un gruppo è una forma che contiene forme, quindi il ciclo deve diventare ricorsivo) e i collegamenti ipertestuali (`run.hyperlink.address`, un oggetto diverso dal testo del run). Ognuno vale venti righe. Insieme sono il motivo per cui questo è un progetto e non un frammento.

| Vantaggi | Svantaggi |
| --- | --- |
| Legge la struttura vera, note comprese | Scrivi e mantieni un convertitore |
| Ripetibile su un'intera cartella | Gruppi, tabelle, immagini e collegamenti: una passata ciascuno |
| Niente lascia la macchina | Dipendenza da Python ovunque giri |

**Per chi va bene?** Per chi ha un flusso ricorrente e una forma di uscita precisa in mente: presentazioni di rilascio verso un repository, resoconti settimanali verso un wiki.

## L'ordine di lettura è la parte di cui nessuno parla

Le forme di una diapositiva sono memorizzate nell'ordine dell'albero delle forme, cioè più o meno l'ordine in cui sono state aggiunte ed esattamente l'ordine in cui si sovrappongono. Non è l'ordine in cui qualcuno legge. Una diapositiva con un titolo, due colonne e una didascalia sotto ha un ordine di lettura visivo perfettamente chiaro e magari un albero delle forme che recita didascalia, colonna destra, titolo, colonna sinistra — perché è nata così nel corso di tre revisioni.

Ogni convertitore sceglie una strategia, e non coincidono:

- **Ordine del documento** — emettere le forme come il file le elenca. Prevedibile, a volte sbagliato, mai sorprendente in un modo che non puoi vedere.
- **Ordine geometrico** — ordinare per alto, poi per sinistra. Ci prende più spesso, e rovina la diapositiva la cui barra laterale a tutta altezza comincia sopra la colonna principale.
- **Prima i segnaposto** — titolo, poi corpo, poi il resto. Buono sui layout standard, debole sulle diapositive disegnate a mano.

Non esiste una risposta giusta, solo una risposta dichiarata. Quando una presentazione convertita si legge male, quasi sempre è questo, e il rimedio sta nella presentazione: rimettere le forme in ordine di lettura dal riquadro Selezione di PowerPoint e convertire di nuovo.

## Immagini, tabelle e ciò che non è testo

**Le immagini** sono la vittoria facile, e quella che la maggior parte dei convertitori salta. Sono già estratte: stanno in `ppt/media/` come normali PNG e JPEG, a piena risoluzione. Una conversione che emette `![](image3.png)` e ti lascia a cercare image3 ha fatto metà del lavoro; una che incorpora i byte ti dà un file solo, che puoi spostare. [Immagini e collegamenti che sopravvivono](/blog/images-and-links-that-still-work) passa in rassegna i compromessi.

**Le tabelle** passano se lo strumento legge `<a:tbl>`, lo stesso modello di tabella che usa Word. L'inghippo sono le celle unite: una tabella di diapositiva con un'intestazione unita non ha equivalente in Markdown, e ogni strumento la risolve diversamente — ripetendo il valore, svuotando le celle di continuazione o scartando la riga. [Le tabelle che sopravvivono a una conversione](/blog/markdown-tables-that-survive-conversion) dice che cosa controllare.

**I grafici** sono una tabella di dati più una resa, conservati in una parte separata con una cartella di lavoro incorporata. La resa è un'immagine; i numeri dietro sono dati veri. La maggior parte dei convertitori prende l'immagine. Se erano i numeri a interessarti, stanno in `ppt/embeddings/` come un piccolo `.xlsx`, e una conversione [Excel → Markdown](/excel-to-markdown) li legge.

**SmartArt** è un disegno generato da un piccolo modello di dati XML. Il testo è recuperabile; lo schema no, se non verso un formato che sia a sua volta un formato per schemi.

**Animazioni, transizioni e ordine di comparsa** portano un significato reale in certe presentazioni: tutto il senso di una diapositiva può stare nel fatto che tre punti compaiano uno alla volta. Niente di ciò ha una forma in Markdown. Se conta, va scritto nelle note prima della conversione, non dopo.

## Un breve elenco prima di convertire

1. **Apri il riquadro Selezione** e controlla l'ordine delle forme su ogni diapositiva con un layout non standard. Costa un minuto e risolve di gran lunga la lamentela più frequente sul risultato.
2. **Decidi se le note sono il punto.** Se lo sono, escludi subito l'esportazione in struttura e il copia e incolla: nessuno dei due ci arriva.
3. **Cerca il testo dentro le immagini.** Una diapositiva il cui contenuto è la schermata di una tabella diventa l'immagine di una tabella. Niente a valle sa leggerla.
4. **Guarda a che cosa servono i grafici.** Se è l'andamento della linea, tieni l'immagine. Se sono i numeri, vai a prendere la cartella di lavoro incorporata.
5. **Converti prima una diapositiva** e leggila. L'ordine di lettura e il trattamento delle note si vedono entrambi già nelle prime due, e scoprirli presto costa poco.

## Dove ti lascia tutto questo

Per una presentazione singola da cui ti serve il testo una volta sola, l'esportazione in struttura sono trenta secondi e bastano — a patto che sia costruita sui segnaposto e che le note non contino. Ovunque le note contino, e sono la maggior parte delle presentazioni che meritano una conversione, la scelta è tra scrivere uno script `python-pptx` e usare qualcosa che le parti le legge già. [La conversione PowerPoint → Markdown di qui](/powerpoint-to-markdown) risolve l'ordine delle diapositive tramite `<p:sldIdLst>`, mette le note di ciascuna subito sotto come citazione e incorpora le immagini, così il risultato è un file solo — nel browser, quindi la presentazione non viene caricata da nessuna parte. Per il formato vicino, [convertire un .docx](/blog/convert-docx-to-markdown) incontra problemi diversi, quasi tutti di stili e non di ordine.
