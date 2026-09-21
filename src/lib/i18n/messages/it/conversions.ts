import type { Content } from '../../content';

/*
 * What each conversion is called in Italian, and what its page says.
 *
 * `seo` is not a translation of the English sentence: it is written around the phrase an Italian
 * reader actually types — "convertire markdown in html", "convertire word in markdown", "da csv a
 * tabella markdown" — while making the same promise the English makes and no other.
 */

export const conversions: Content['conversions'] = {
  'markdown-to-html': {
    label: 'Markdown → HTML',
    short: 'MD → HTML',
    title: 'Da Markdown a HTML',
    blurb:
      'Carica un file Markdown: l’HTML reso si vede subito e si scarica come documento pronto all’uso.',
    hint: 'Carica un file .md e vedi esattamente come apparirà in HTML. Trascinandone più di uno, vengono concatenati in un unico documento, nell’ordine in cui li scegli.',
    seo: {
      title: 'Convertire Markdown in HTML — TransformPipe',
      description:
        'Converti Markdown in HTML nel browser: il documento reso e un .html autosufficiente da scaricare. Con l’accesso: cronologia, condivisione e pubblicazione.',
    },
  },
  'html-to-markdown': {
    label: 'HTML → Markdown',
    short: 'HTML → MD',
    title: 'Da HTML a Markdown',
    blurb:
      'Carica un file HTML — o una pagina salvata — e riavrai Markdown, con titoli, link, elenchi e tabelle intatti.',
    hint: 'Carica un file .html e ottieni Markdown. Tabelle, elenchi di attività e blocchi di codice sopravvivono; lo stile no, perché il Markdown non ne ha.',
    seo: {
      title: 'Convertire HTML in Markdown — TransformPipe',
      description:
        'Trasforma un file HTML o una pagina salvata in Markdown pulito, tabelle e blocchi di codice compresi. Converte nel browser: il file non viene mai inviato.',
    },
  },
  'word-to-markdown': {
    label: 'Word → Markdown',
    short: 'DOCX → MD',
    title: 'Da Word a Markdown',
    blurb:
      'Carica un .docx e ottieni Markdown: titoli, elenchi, link e tabelle arrivano, i caratteri e i margini no.',
    hint: 'Carica un .docx da Word, Google Docs o LibreOffice. Quello che torna è la struttura del documento in Markdown, non il suo impaginato.',
    seo: {
      title: 'Convertire Word (.docx) in Markdown — TransformPipe',
      description:
        'Converti un documento Word in Markdown nel browser: titoli, elenchi, link e tabelle restano, la formattazione no. Niente viene caricato online.',
    },
  },
  'csv-to-markdown': {
    label: 'CSV → tabella Markdown',
    short: 'CSV → MD',
    title: 'Da CSV a tabella Markdown',
    blurb:
      'Carica un CSV o un TSV e ottieni una tabella Markdown, con la prima riga come intestazione e le colonne allineate.',
    hint: 'Carica un .csv o un .tsv. Campi tra virgolette, virgole al loro interno e interruzioni di riga dentro le celle sono tutti gestiti.',
    seo: {
      title: 'Da CSV a tabella Markdown — TransformPipe',
      description:
        'Trasforma un file CSV o TSV in una tabella Markdown, con campi tra virgolette e virgole gestiti. Converte nel browser: niente viene caricato online.',
    },
  },
  'json-to-markdown': {
    label: 'JSON → Markdown',
    short: 'JSON → MD',
    title: 'Da JSON a Markdown',
    blurb:
      'Carica un file JSON e leggilo come un documento: un elenco di record diventa una tabella, un oggetto diventa sezioni con i suoi campi in testa.',
    hint: 'Carica un file .json. Un elenco di record diventa una tabella; gli oggetti annidati diventano titoli. Anche un valore per riga — l’export di un log — viene capito.',
    seo: {
      title: 'Da JSON a Markdown — TransformPipe',
      description:
        'Trasforma un file JSON in Markdown leggibile: gli array di record diventano tabelle, gli oggetti diventano sezioni. Converte nel browser, senza caricare nulla.',
    },
  },
  'notion-to-markdown': {
    label: 'Notion → Markdown',
    short: 'Notion → MD',
    title: 'Da export Notion a Markdown',
    blurb:
      'Carica lo .zip dell’"Export as Markdown & CSV" di Notion e ottieni un documento unico: ogni pagina in ordine, con un indice, i database come tabelle.',
    hint: 'Carica lo .zip che Notion esporta. Ogni pagina diventa una sezione con il proprio titolo, nell’ordine originale; un database diventa una tabella.',
    seo: {
      title: 'Da export Notion a Markdown — TransformPipe',
      description:
        'Trasforma uno .zip "Export as Markdown & CSV" di Notion in un documento Markdown, pagine in ordine con indice. Converte nel browser, senza caricare nulla.',
    },
  },
  'confluence-to-markdown': {
    label: 'Confluence → Markdown',
    short: 'Confluence → MD',
    title: 'Da export Confluence a Markdown',
    blurb:
      'Carica lo .zip dell’"Export → HTML" di uno spazio Confluence e ottieni un documento Markdown: ogni pagina in ordine, con un indice.',
    hint: 'Carica lo .zip prodotto dall’export di uno spazio Confluence. Ogni pagina diventa una sezione con il proprio titolo, nell’ordine originale.',
    seo: {
      title: 'Da export Confluence a Markdown — TransformPipe',
      description:
        'Trasforma uno .zip di export HTML di uno spazio Confluence in un documento Markdown, pagine in ordine con indice. Converte nel browser, senza caricare nulla.',
    },
  },
  'obsidian-to-markdown': {
    label: 'Obsidian → Markdown',
    short: 'Obsidian → MD',
    title: 'Da vault Obsidian a Markdown',
    blurb:
      'Carica un vault Obsidian compresso e ottieni un documento: ogni nota in ordine, con un indice, i wikilink conservati come testo.',
    hint: 'Carica lo .zip della cartella di un vault Obsidian. Ogni nota diventa una sezione con il proprio titolo, nell’ordine originale.',
    seo: {
      title: 'Da vault Obsidian a Markdown — TransformPipe',
      description:
        'Trasforma un vault Obsidian compresso in un documento Markdown, note in ordine con indice, wikilink conservati come testo. Converte nel browser, senza caricare nulla.',
    },
  },
  'text-to-markdown': {
    label: 'Solo testo → Markdown',
    short: 'TXT → MD',
    title: 'Da testo semplice a Markdown',
    blurb:
      'Carica un file .txt che non è mai stato pensato come Markdown, e ottieni Markdown che dice esattamente la stessa cosa — un asterisco o un trattino basso capitati per caso non diventano un’enfasi.',
    hint: 'Carica un file .txt. I caratteri propri di Markdown — *, _, #, un trattino a inizio riga — vengono escapati così il testo appare esattamente com’è stato scritto.',
    seo: {
      title: 'Da testo semplice a Markdown — TransformPipe',
      description:
        'Trasforma testo semplice in Markdown senza che i suoi caratteri vengano letti come formattazione — asterischi, trattini bassi e a capo conservati. Converte nel browser, senza caricare nulla.',
    },
  },
  'powerpoint-to-markdown': {
    label: 'PowerPoint → Markdown',
    short: 'PPTX → MD',
    title: 'Da PowerPoint a Markdown',
    blurb:
      'Carica un .pptx e ottieni una sezione per diapositiva, nell’ordine in cui vengono presentate — con le note del relatore, cioè la metà di una presentazione che fuori dalla sala nessuno legge.',
    hint: 'Carica un .pptx. Ogni diapositiva diventa una sezione sotto il proprio titolo, gli elenchi restano elenchi e le tabelle restano tabelle; le note seguono ciascuna di esse.',
    seo: {
      title: 'Da PowerPoint a Markdown — TransformPipe',
      description:
        'Trasforma un .pptx di PowerPoint in Markdown: una sezione per diapositiva, con elenchi, tabelle e note del relatore. Converte nel browser, senza caricare nulla.',
    },
  },
  'epub-to-markdown': {
    label: 'EPUB → Markdown',
    short: 'EPUB → MD',
    title: 'Da un libro EPUB a Markdown',
    blurb:
      'Carica un .epub e ottieni tutto il libro in un documento: i capitoli nell’ordine in cui si leggono, con i titoli dell’indice e le immagini dentro.',
    hint: 'Carica un .epub. L’ordine di lettura viene dalla spine del libro e non dai nomi dei file; ogni capitolo diventa una sezione.',
    seo: {
      title: 'Da EPUB a Markdown — TransformPipe',
      description:
        'Trasforma un libro EPUB in un documento Markdown: capitoli in ordine di lettura, indice conservato e immagini incluse. Converte nel browser, senza caricare nulla.',
    },
  },
  'odt-to-markdown': {
    label: 'OpenDocument → Markdown',
    short: 'ODT → MD',
    title: 'Da un file OpenDocument a Markdown',
    blurb:
      'Carica un .odt — il formato di LibreOffice, di OpenOffice e di un download da Google Docs — e ottieni Markdown con le sue intestazioni, elenchi, tabelle, note a piè di pagina e immagini.',
    hint: 'Carica un .odt. Questo formato dichiara da solo i livelli delle intestazioni, quindi non si indovina nulla: gli elenchi mantengono l’annidamento, le tabelle restano tabelle e le note restano note.',
    seo: {
      title: 'Da ODT a Markdown — TransformPipe',
      description:
        'Trasforma un .odt di LibreOffice o OpenDocument in Markdown con intestazioni, elenchi, tabelle, note e immagini. Converte nel browser, senza caricare nulla.',
    },
  },
  'rtf-to-markdown': {
    label: 'Testo RTF → Markdown',
    short: 'RTF → MD',
    title: 'Da testo formattato a Markdown',
    blurb:
      'Carica un .rtf — quello che scrivono TextEdit, WordPad e quasi tutto quando ne trascini fuori del testo — e ottieni Markdown invece di un muro di parole di controllo.',
    hint: 'Carica un .rtf. Grassetto, corsivo, collegamenti, elenchi e tabelle passano; un’intestazione si legge dal livello di struttura dove qualcuno l’ha impostato e dal corpo del carattere dove nessuno l’ha fatto.',
    seo: {
      title: 'Da RTF a Markdown — TransformPipe',
      description:
        'Trasforma un file .rtf in Markdown: grassetto, corsivo, collegamenti, elenchi e tabelle conservati, intestazioni recuperate. Converte nel browser, senza caricare nulla.',
    },
  },
  'excel-to-markdown': {
    label: 'Excel → tabella Markdown',
    short: 'XLSX → MD',
    title: 'Da Excel a una tabella Markdown',
    blurb:
      'Carica un .xlsx e ottieni una tabella Markdown per ogni foglio con righe — più di uno, e arrivano con un indice.',
    hint: 'Carica una cartella di lavoro .xlsx. La prima riga di ogni foglio diventa l’intestazione della tabella; le date escono come date ISO semplici invece dei numeri seriali propri di Excel.',
    seo: {
      title: 'Da Excel a tabella Markdown — TransformPipe',
      description:
        'Trasforma una cartella di lavoro Excel .xlsx in tabelle Markdown, una per foglio con indice. Converte nel browser, senza caricare nulla.',
    },
  },
};
