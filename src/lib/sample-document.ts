import type { Locale } from './i18n/locales';

/*
 * The document "Open a sample" puts on screen for somebody who has not converted anything yet.
 *
 * It is the product's own short guide, and written so that the guide is also the demonstration:
 * a table, a callout, a Mermaid diagram, a task list and a link to one of its own headings, each
 * showing on the page the thing the sentence beside it describes. Converted like a pasted file, so
 * Save, Share, the book view and Word work on it exactly as on anything of the person's own.
 *
 * One per language the interface speaks, because the first document anybody sees here should be in
 * the language they chose.
 */
const SAMPLES: Record<Locale, { name: string; markdown: string }> = {
  en: {
    name: 'How TransformPipe works.md',
    markdown: `# How TransformPipe works

Everything on this page is Markdown, drawn the way it will look when you share it. Try the buttons above it: **Share**, the book view, **Download → Word**.

> [!TIP]
> Saved documents keep their link after every edit. Update the text and the people you sent it to see the new version.

## What goes in, what comes out

| You have | You get |
| --- | --- |
| Word, PowerPoint, Excel | Markdown, ready for an assistant or a wiki |
| A Confluence, Notion or Obsidian export | A folder of pages, links between them kept |
| Markdown | A page with a link, Word, PDF, Confluence, Jira |

## How a document travels

\`\`\`mermaid
flowchart LR
  A[A file or a chat answer] --> B[TransformPipe]
  B --> C[A shared page]
  B --> D[Word or PDF]
  B --> E[Claude or ChatGPT]
\`\`\`

## Three things to try

- [ ] Press **Save**, then **Share → Anyone with the link**
- [ ] Turn on the book view, the icon beside full screen
- [ ] Connect Claude or ChatGPT and ask it to "save this answer to TransformPipe"

Links to a heading work too: [back to the table](#what-goes-in-what-comes-out).
`,
  },
  de: {
    name: 'So funktioniert TransformPipe.md',
    markdown: `# So funktioniert TransformPipe

Alles auf dieser Seite ist Markdown, so dargestellt, wie es beim Teilen aussieht. Probieren Sie die Schaltflächen darüber aus: **Teilen**, die Buchansicht, **Herunterladen → Word**.

> [!TIP]
> Gespeicherte Dokumente behalten ihren Link nach jeder Änderung. Wer den Link hat, sieht die neue Fassung.

## Was hineingeht, was herauskommt

| Sie haben | Sie bekommen |
| --- | --- |
| Word, PowerPoint, Excel | Markdown für einen Assistenten oder ein Wiki |
| Einen Export aus Confluence, Notion oder Obsidian | Einen Ordner mit Seiten, die Links bleiben erhalten |
| Markdown | Eine Seite mit Link, Word, PDF, Confluence, Jira |

## Wie ein Dokument unterwegs ist

\`\`\`mermaid
flowchart LR
  A[Eine Datei oder eine Chat-Antwort] --> B[TransformPipe]
  B --> C[Eine geteilte Seite]
  B --> D[Word oder PDF]
  B --> E[Claude oder ChatGPT]
\`\`\`

## Drei Dinge zum Ausprobieren

- [ ] **Speichern** drücken, dann **Teilen → Jeder mit dem Link**
- [ ] Die Buchansicht einschalten, das Symbol neben dem Vollbild
- [ ] Claude oder ChatGPT verbinden und bitten: „Speichere diese Antwort in TransformPipe“

Auch Links auf eine Überschrift funktionieren: [zurück zur Tabelle](#was-hineingeht-was-herauskommt).
`,
  },
  fr: {
    name: 'Comment fonctionne TransformPipe.md',
    markdown: `# Comment fonctionne TransformPipe

Tout sur cette page est du Markdown, affiché tel qu’il apparaîtra une fois partagé. Essayez les boutons au-dessus : **Partager**, la vue livre, **Télécharger → Word**.

> [!TIP]
> Un document enregistré garde son lien après chaque modification. Ceux qui l’ont reçu voient la nouvelle version.

## Ce qui entre, ce qui sort

| Vous avez | Vous obtenez |
| --- | --- |
| Word, PowerPoint, Excel | Du Markdown pour un assistant ou un wiki |
| Un export Confluence, Notion ou Obsidian | Un dossier de pages, liens conservés |
| Du Markdown | Une page avec un lien, Word, PDF, Confluence, Jira |

## Le trajet d’un document

\`\`\`mermaid
flowchart LR
  A[Un fichier ou une réponse de chat] --> B[TransformPipe]
  B --> C[Une page partagée]
  B --> D[Word ou PDF]
  B --> E[Claude ou ChatGPT]
\`\`\`

## Trois choses à essayer

- [ ] Appuyez sur **Enregistrer**, puis **Partager → Toute personne disposant du lien**
- [ ] Activez la vue livre, l’icône à côté du plein écran
- [ ] Connectez Claude ou ChatGPT et demandez-lui « enregistre cette réponse dans TransformPipe »

Les liens vers un titre fonctionnent aussi : [retour au tableau](#ce-qui-entre-ce-qui-sort).
`,
  },
  es: {
    name: 'Cómo funciona TransformPipe.md',
    markdown: `# Cómo funciona TransformPipe

Todo en esta página es Markdown, mostrado tal como se verá al compartirlo. Prueba los botones de arriba: **Compartir**, la vista de libro, **Descargar → Word**.

> [!TIP]
> Un documento guardado conserva su enlace tras cada cambio. Quien lo recibió ve la versión nueva.

## Qué entra, qué sale

| Tienes | Obtienes |
| --- | --- |
| Word, PowerPoint, Excel | Markdown listo para un asistente o una wiki |
| Una exportación de Confluence, Notion u Obsidian | Una carpeta de páginas con sus enlaces |
| Markdown | Una página con enlace, Word, PDF, Confluence, Jira |

## El recorrido de un documento

\`\`\`mermaid
flowchart LR
  A[Un archivo o una respuesta de chat] --> B[TransformPipe]
  B --> C[Una página compartida]
  B --> D[Word o PDF]
  B --> E[Claude o ChatGPT]
\`\`\`

## Tres cosas para probar

- [ ] Pulsa **Guardar** y luego **Compartir → Cualquiera con el enlace**
- [ ] Activa la vista de libro, el icono junto a pantalla completa
- [ ] Conecta Claude o ChatGPT y pídele «guarda esta respuesta en TransformPipe»

Los enlaces a un título también funcionan: [volver a la tabla](#qué-entra-qué-sale).
`,
  },
  it: {
    name: 'Come funziona TransformPipe.md',
    markdown: `# Come funziona TransformPipe

Tutto in questa pagina è Markdown, mostrato come apparirà una volta condiviso. Prova i pulsanti qui sopra: **Condividi**, la vista libro, **Scarica → Word**.

> [!TIP]
> Un documento salvato mantiene il suo link dopo ogni modifica. Chi lo ha ricevuto vede la nuova versione.

## Cosa entra, cosa esce

| Hai | Ottieni |
| --- | --- |
| Word, PowerPoint, Excel | Markdown pronto per un assistente o un wiki |
| Un'esportazione da Confluence, Notion o Obsidian | Una cartella di pagine, con i link conservati |
| Markdown | Una pagina con un link, Word, PDF, Confluence, Jira |

## Il percorso di un documento

\`\`\`mermaid
flowchart LR
  A[Un file o una risposta in chat] --> B[TransformPipe]
  B --> C[Una pagina condivisa]
  B --> D[Word o PDF]
  B --> E[Claude o ChatGPT]
\`\`\`

## Tre cose da provare

- [ ] Premi **Salva**, poi **Condividi → Chiunque abbia il link**
- [ ] Attiva la vista libro, l'icona accanto allo schermo intero
- [ ] Collega Claude o ChatGPT e chiedigli «salva questa risposta in TransformPipe»

Anche i link a un titolo funzionano: [torna alla tabella](#cosa-entra-cosa-esce).
`,
  },
};

/** The sample, as the file "Open a sample" converts. */
export function sampleFile(locale: Locale): File {
  const sample = SAMPLES[locale] ?? SAMPLES.en;

  return new File([sample.markdown], sample.name, { type: 'text/markdown' });
}
