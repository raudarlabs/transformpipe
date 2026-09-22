import type { Locale } from './i18n/locales';

/*
 * What has shipped, one entry per thing a reader would notice.
 *
 * A typed array rather than the Markdown file this replaced. The file read well in the repository
 * and could not carry what a card needs: an entry has a date that has to sort and be handed to
 * `Intl`, and a version only when it shipped in a tagged release. Both were prose in the headings
 * — "9 September 2026" — so the page could not order entries without parsing an English month
 * name, and the sitemap got no date at all.
 *
 * The body stays Markdown and is rendered by the product's own converter, which was the good half
 * of the file and is kept: a release note that breaks the renderer breaks a customer's document
 * too, and this is a better place to find that out.
 *
 * The rule that keeps this file true is in CLAUDE.md: a tagged release is not shipped until its
 * entry is here, and anything a person using the product would notice gets an entry between tags.
 * Nothing enforces it — a missing entry breaks no build, which is exactly why it is written down.
 *
 * English, deliberately. The chrome around these is translated; five translations per entry is a
 * cost that gets skipped after the second release, and `src/lib/i18n/content.ts` draws the same
 * line for the blog.
 */
export interface ChangelogEntry {
  /** ISO, and the only order that matters: the page sorts on it rather than trusting this list. */
  date: string;
  /** The tag it shipped in, where there is one. Most entries shipped between tags. */
  version?: string;
  title: string;
  /** Markdown. Kept to a few sentences — a card that needs scrolling is an article. */
  body: string;
  /**
   * The address of this entry's own page, when it has earned one.
   *
   * Optional, and most entries will never have it. A slug means there is more to say than a card
   * should hold — what the thing does, why it works the way it does, what it replaced — and that
   * the words are worth a page a search engine can land somebody on. An entry with no slug is a
   * card and nothing else, which is what a changelog mostly is.
   *
   * Kebab-case, unique, and permanent once shipped: it is a URL from the day it deploys.
   */
  slug?: string;
  /**
   * The long version, by language. Required wherever there is a slug and meaningless without one.
   *
   * English is not optional and the rest are: this is the one place the English-only rule bends,
   * because a release note that somebody searched for is worth having in their language, and there
   * are a handful of these rather than one per release. A language with nothing written falls back
   * to English, which is what the reader would have got anyway.
   */
  detail?: ChangelogDetail;
}

/** One entry's page, in English and in whatever else somebody has written. */
export type ChangelogDetail = { en: ChangelogDetailText } & Partial<
  Record<Locale, ChangelogDetailText>
>;

export interface ChangelogDetailText {
  /**
   * The page's heading and its `<title>`, when this language has one of its own.
   *
   * Absent on `en`, where the entry's own title is already it. Present on a translation, because a
   * German page indexed under an English headline and a German description is the mismatch this
   * whole feature exists to avoid: somebody searching in German finds a result that reads as the
   * wrong language and does not click it.
   */
  title?: string;
  /**
   * The card's summary in this language, shown above the piece.
   *
   * The entry's own `body` stays English — that is the rule, and the list is built from it. This is
   * the same sentence for the one page where an English paragraph between a German heading and a
   * German piece would read as a mistake.
   */
  summary?: string;
  /**
   * Markdown, capped at DETAIL_LIMIT characters, and the cap is the point: this is the piece a
   * reader arrives at from a search, and the question it answers is "what is this and does it help
   * me". Past three thousand characters it stops answering that and starts being an article, which
   * is what content/blog is for.
   */
  body: string;
  /** 100-165 characters, like the blog's, and checked at build time for the same reason. */
  description: string;
  /** Comma-separated. The phrases somebody would have typed, not the words. */
  keywords: string;
}

/** What a detail page may weigh. See `detail` — past this it is an article, not a release note. */
export const DETAIL_LIMIT = 3000;

const ENTRIES: ChangelogEntry[] = [
  {
    date: '2026-09-22',
    title: 'Pandoc reads PowerPoint now, and four articles said it could not',
    body:
      'Version 3.8.3 added `pptx` and `xlsx` readers on 1 December 2025, and four articles here '
      + 'still said a deck could not be read at all \u2014 one of them published this morning '
      + 'with the date it was checked printed next to the claim. Corrected in five languages, '
      + 'and the correction is not simply that it works: the reader opens no notes part, so a '
      + 'deck converts and every sentence under the slides is dropped without a warning. Its own '
      + 'source says `Stability : alpha`, which is more than the advice repeating the old answer '
      + 'ever said.',
  },
  {
    date: '2026-09-22',
    title: 'What Microsoft\u2019s converter is for, and when it is not',
    body:
      'MarkItDown is the default answer to \u201cconvert this document for a model to read\u201d, and '
      + 'its own documentation says what it is for: text analysis pipelines, in Python, beside the '
      + 'files. The new article reads the dependency list rather than the front page \u2014 Mammoth '
      + 'for Word, python-pptx for decks, pdfminer for PDF \u2014 because that list is where the '
      + 'ceiling is, and it names the four reasons somebody goes looking for something else. In '
      + 'five languages, with the limits of this site stated in the same paragraph.',
  },
  {
    date: '2026-09-22',
    title: 'The extension is in both stores',
    slug: 'browser-extension-in-both-stores',
    body:
      'Chrome and Firefox both publish it now, at 2.2.0 and from the same source tree. The page '
      + 'you are looking at becomes Markdown from the button in the toolbar, a side panel follows '
      + 'you from tab to tab, and the fifteen conversions this site has run inside the extension, '
      + 'on your own machine. Signed out it never talks to us at all.',
    detail: {
      en: {
        description:
          'The browser extension is published in the Chrome Web Store and on Mozilla Add-ons, version 2.2.0, one build from one source tree.',
        keywords:
          'markdown browser extension, chrome extension web page to markdown, firefox add-on markdown, save a web page as markdown, convert a page without uploading it',
        body: `Two stores, one extension, and the same build in both.

## Where it is

Chrome takes it from the Chrome Web Store, and so do the browsers built on Chromium: Edge, Brave, Opera, Arc. Firefox takes it from Mozilla Add-ons, on the desktop and on Android. Both stores are at 2.2.0, which is the version this repository is at — the same source tree built twice, with three manifest keys and one file between the two.

## What it does

Press the button in the toolbar and the page you are looking at comes back as Markdown: the article picked out of the navigation and the cookie notices, every link and picture address made absolute. Copy it, download it, or save the page as a self-contained \`.html\` file, its own design and its pictures inside it.

The side panel is the same thing kept open beside the page, following you from tab to tab and converting each page as you arrive. The right-click menu converts a selection. And the fifteen conversions this site has run inside the extension too, so a file on your machine converts without being uploaded.

The pages this is for are the ones with no export: a wiki, a ticket, a thread, documentation — anything that exists only rendered. It reads what your browser already has on screen, so a page only you can see converts without anybody handing over a password.

## What it asks for

No host permission at install. Signed out it never talks to us at all — the conversion happens in the page, on your own machine — and there is no analytics in it and no record anywhere of which pages you converted. Permission to read the tab you are on is asked for when you turn Chrome's side panel on, and refusing it costs the panel and nothing else; in Firefox the sidebar is a manifest key and asks for nothing.

Signed in, an OAuth token sits in the browser's extension storage — the same grant listed on your account page and revocable there. Save puts a document where the rest of them are, and Share publishes a link or names the people who may read it.`,
      },
      de: {
        title: 'Die Erweiterung steht in beiden Stores',
        summary: `Chrome und Firefox veröffentlichen sie jetzt beide, als 2.2.0 und aus demselben Quellbaum. Die Seite, die Sie gerade ansehen, wird per Knopf in der Symbolleiste zu Markdown, eine Seitenleiste folgt Ihnen von Tab zu Tab, und die fünfzehn Konvertierungen dieser Seite laufen in der Erweiterung, auf Ihrem eigenen Rechner. Abgemeldet spricht sie gar nicht mit uns.`,
        description:
          'Die Browser-Erweiterung ist im Chrome Web Store und bei Mozilla Add-ons veröffentlicht, Version 2.2.0, ein Build aus einem Quellbaum.',
        keywords:
          'markdown erweiterung browser, chrome erweiterung webseite in markdown, firefox add-on markdown, webseite als markdown speichern, seite konvertieren ohne hochladen',
        body: `Zwei Stores, eine Erweiterung, in beiden derselbe Build.

## Wo sie liegt

Chrome holt sie aus dem Chrome Web Store, und die Chromium-Browser ebenso: Edge, Brave, Opera, Arc. Firefox holt sie von Mozilla Add-ons, auf dem Desktop und unter Android. Beide Stores stehen auf 2.2.0, dem Stand dieses Repositorys — derselbe Quellbaum, zweimal gebaut, mit drei Manifest-Schlüsseln und einer Datei Unterschied.

## Was sie tut

Ein Druck auf den Knopf in der Symbolleiste, und die Seite, die Sie gerade ansehen, kommt als Markdown zurück: der Artikel aus Navigation und Cookie-Hinweisen herausgelöst, jede Link- und Bildadresse absolut gemacht. Kopieren, herunterladen, oder die Seite als eigenständige \`.html\`-Datei sichern — mit ihrem eigenen Design und ihren Bildern darin.

Die Seitenleiste ist dasselbe, nur dauerhaft neben der Seite geöffnet: Sie folgt Ihnen von Tab zu Tab und konvertiert jede Seite, sobald Sie ankommen. Das Kontextmenü konvertiert eine Auswahl. Und die fünfzehn Konvertierungen dieser Website laufen ebenfalls in der Erweiterung, sodass eine Datei auf Ihrem Rechner konvertiert wird, ohne hochgeladen zu werden.

Gedacht ist das für die Seiten, die keinen Export haben: ein Wiki, ein Ticket, ein Thread, eine Dokumentation — alles, was nur gerendert existiert. Gelesen wird, was Ihr Browser bereits auf dem Bildschirm hat, also konvertiert auch eine Seite, die nur Sie sehen können, ohne dass jemand ein Passwort herausgeben muss.

## Was sie verlangt

Bei der Installation keine Host-Berechtigung. Abgemeldet spricht sie gar nicht mit uns — die Konvertierung geschieht in der Seite, auf Ihrem eigenen Rechner —, es gibt keine Analyse darin und nirgends eine Aufzeichnung, welche Seiten Sie konvertiert haben. Die Erlaubnis, den aktuellen Tab zu lesen, wird in dem Moment erfragt, in dem Sie Chromes Seitenleiste einschalten; wer ablehnt, verliert die Seitenleiste und sonst nichts. In Firefox ist die Sidebar ein Manifest-Eintrag und fragt gar nichts.

Angemeldet liegt ein OAuth-Token im Erweiterungsspeicher des Browsers — dieselbe Freigabe, die auf Ihrer Kontoseite steht und dort widerrufbar ist. Speichern legt ein Dokument zu den übrigen, und Teilen veröffentlicht einen Link oder nennt die Personen, die ihn lesen dürfen.`,
      },
      fr: {
        title: 'L’extension est dans les deux boutiques',
        summary: `Chrome et Firefox la publient désormais tous les deux, en 2.2.0 et depuis le même arbre de sources. La page que vous regardez devient du Markdown depuis le bouton de la barre d’outils, un panneau latéral vous suit d’onglet en onglet, et les quinze conversions de ce site tournent dans l’extension, sur votre propre machine. Déconnectée, elle ne nous parle pas du tout.`,
        description:
          'L’extension de navigateur est publiée sur le Chrome Web Store et sur Mozilla Add-ons, en version 2.2.0, une compilation depuis une source.',
        keywords:
          'extension markdown navigateur, extension chrome page web en markdown, module firefox markdown, enregistrer une page web en markdown, convertir une page sans la téléverser',
        body: `Deux boutiques, une extension, et la même compilation dans les deux.

## Où elle se trouve

Chrome la prend sur le Chrome Web Store, et les navigateurs bâtis sur Chromium aussi : Edge, Brave, Opera, Arc. Firefox la prend sur Mozilla Add-ons, sur le bureau comme sur Android. Les deux boutiques sont en 2.2.0, la version de ce dépôt — le même arbre de sources compilé deux fois, à trois clés de manifeste et un fichier près.

## Ce qu’elle fait

Appuyez sur le bouton de la barre d’outils et la page que vous regardez revient en Markdown : l’article extrait de la navigation et des bandeaux de cookies, chaque adresse de lien et d’image rendue absolue. Copiez-la, téléchargez-la, ou enregistrez la page en un fichier \`.html\` autonome, avec son propre design et ses images à l’intérieur.

Le panneau latéral, c’est la même chose gardée ouverte à côté de la page : il vous suit d’onglet en onglet et convertit chaque page dès que vous y arrivez. Le menu contextuel convertit une sélection. Et les quinze conversions de ce site tournent également dans l’extension, si bien qu’un fichier de votre machine se convertit sans être téléversé.

Ce sont les pages sans export qui justifient tout cela : un wiki, un ticket, un fil de discussion, une documentation — tout ce qui n’existe que rendu. Elle lit ce que votre navigateur affiche déjà, donc une page que vous seul pouvez voir se convertit sans que personne ait à céder un mot de passe.

## Ce qu’elle demande

Aucune autorisation de site à l’installation. Déconnectée, elle ne nous parle pas du tout — la conversion a lieu dans la page, sur votre machine — et elle ne contient aucune mesure d’audience ni trace nulle part des pages que vous avez converties. L’autorisation de lire l’onglet courant est demandée au moment où vous activez le panneau latéral de Chrome, et la refuser coûte le panneau et rien d’autre ; dans Firefox, la barre latérale est une clé du manifeste et ne demande rien.

Connecté, un jeton OAuth réside dans le stockage d’extension du navigateur — la même autorisation que celle listée sur votre page de compte, révocable depuis là. Enregistrer range un document avec les autres, et Partager publie un lien ou nomme les personnes qui peuvent le lire.`,
      },
      es: {
        title: 'La extensión está en las dos tiendas',
        summary: `Chrome y Firefox ya la publican los dos, en 2.2.0 y desde el mismo árbol de código. La página que estás mirando se vuelve Markdown desde el botón de la barra, un panel lateral te sigue de pestaña en pestaña, y las quince conversiones de este sitio se ejecutan dentro de la extensión, en tu propia máquina. Sin sesión iniciada no habla con nosotros en absoluto.`,
        description:
          'La extensión de navegador está publicada en la Chrome Web Store y en Mozilla Add-ons, versión 2.2.0, una compilación desde un código.',
        keywords:
          'extensión markdown navegador, extensión chrome página web a markdown, complemento firefox markdown, guardar una página web como markdown, convertir una página sin subirla',
        body: `Dos tiendas, una extensión y la misma compilación en ambas.

## Dónde está

Chrome la toma de la Chrome Web Store, y los navegadores construidos sobre Chromium también: Edge, Brave, Opera, Arc. Firefox la toma de Mozilla Add-ons, en el escritorio y en Android. Las dos tiendas están en 2.2.0, la versión de este repositorio: el mismo árbol de código compilado dos veces, con tres claves de manifiesto y un archivo de diferencia.

## Qué hace

Pulsa el botón de la barra de herramientas y la página que estás mirando vuelve como Markdown: el artículo separado de la navegación y de los avisos de cookies, cada dirección de enlace y de imagen convertida en absoluta. Cópialo, descárgalo o guarda la página como un archivo \`.html\` autónomo, con su propio diseño y sus imágenes dentro.

El panel lateral es lo mismo mantenido abierto junto a la página: te sigue de pestaña en pestaña y convierte cada página según llegas. El menú contextual convierte una selección. Y las quince conversiones de este sitio también se ejecutan dentro de la extensión, así que un archivo de tu máquina se convierte sin subirlo.

Las páginas que justifican todo esto son las que no tienen exportación: un wiki, un ticket, un hilo, una documentación, cualquier cosa que solo exista renderizada. Lee lo que tu navegador ya tiene en pantalla, de modo que una página que solo tú puedes ver se convierte sin que nadie entregue una contraseña.

## Qué pide

Ningún permiso de sitio al instalarse. Sin sesión iniciada no habla con nosotros en absoluto —la conversión ocurre en la página, en tu propia máquina— y no lleva analítica ni deja registro en ninguna parte de qué páginas convertiste. El permiso para leer la pestaña en la que estás se pide en el momento en que activas el panel lateral de Chrome, y negarlo cuesta el panel y nada más; en Firefox la barra lateral es una clave del manifiesto y no pide nada.

Con la sesión iniciada, un token OAuth vive en el almacenamiento de extensiones del navegador: la misma concesión que aparece en tu página de cuenta y que se revoca ahí. Guardar pone un documento donde están los demás, y Compartir publica un enlace o nombra a las personas que pueden leerlo.`,
      },
      it: {
        title: 'L’estensione è in entrambi gli store',
        summary: `Chrome e Firefox ora la pubblicano entrambi, in 2.2.0 e dallo stesso albero di sorgenti. La pagina che stai guardando diventa Markdown dal pulsante nella barra, un pannello laterale ti segue di scheda in scheda, e le quindici conversioni di questo sito girano dentro l’estensione, sulla tua macchina. Senza accesso non parla affatto con noi.`,
        description:
          'L’estensione per browser è pubblicata sul Chrome Web Store e su Mozilla Add-ons, versione 2.2.0, una build da un solo sorgente.',
        keywords:
          'estensione markdown browser, estensione chrome pagina web in markdown, componente firefox markdown, salvare una pagina web in markdown, convertire una pagina senza caricarla',
        body: `Due store, una estensione, la stessa build in entrambi.

## Dove si trova

Chrome la prende dal Chrome Web Store, e così i browser costruiti su Chromium: Edge, Brave, Opera, Arc. Firefox la prende da Mozilla Add-ons, sul desktop e su Android. Entrambi gli store sono alla 2.2.0, la versione di questo repository: lo stesso albero di sorgenti compilato due volte, a tre chiavi di manifest e un file di distanza.

## Che cosa fa

Premi il pulsante nella barra degli strumenti e la pagina che stai guardando torna in Markdown: l’articolo estratto dalla navigazione e dagli avvisi sui cookie, ogni indirizzo di link e di immagine reso assoluto. Copialo, scaricalo, oppure salva la pagina come file \`.html\` autonomo, con il suo design e le sue immagini dentro.

Il pannello laterale è la stessa cosa tenuta aperta accanto alla pagina: ti segue di scheda in scheda e converte ogni pagina appena arrivi. Il menu contestuale converte una selezione. E le quindici conversioni di questo sito girano anche dentro l’estensione, così un file sulla tua macchina si converte senza essere caricato.

Le pagine per cui tutto questo esiste sono quelle senza esportazione: un wiki, un ticket, una discussione, una documentazione — tutto ciò che esiste solo renderizzato. Legge quello che il browser ha già a schermo, quindi anche una pagina che puoi vedere solo tu si converte senza che nessuno consegni una password.

## Che cosa chiede

Nessun permesso sui siti all’installazione. Senza accesso non parla affatto con noi — la conversione avviene nella pagina, sulla tua macchina — e non contiene analytics né lascia da nessuna parte traccia di quali pagine hai convertito. Il permesso di leggere la scheda in cui ti trovi viene chiesto nel momento in cui attivi il pannello laterale di Chrome, e rifiutarlo costa il pannello e nulla più; in Firefox la barra laterale è una chiave del manifest e non chiede nulla.

Con l’accesso fatto, un token OAuth sta nell’archivio estensioni del browser: la stessa concessione elencata sulla pagina del tuo account e revocabile da lì. Salva mette un documento insieme agli altri, e Condividi pubblica un link o indica le persone che possono leggerlo.`,
      },
    },
  },
  {
    date: '2026-09-22',
    title: 'Ten converters, and what each one will not read',
    body:
      'A comparison that counts what the front pages leave out. Pandoc reads a deck only since '
      + '3.8.3 and takes none of its speaker notes, calibre reaches Markdown only through its '
      + 'text exporter and drops every link '
      + 'unless told otherwise, LibreOffice Writer now saves CommonMark directly, and Docling '
      + 'reads the widest input list of the ten. Every claim comes from the tool\u2019s own '
      + 'documentation with the date it was checked \u2014 and the section on this one lists the '
      + 'five things it does not do, because a comparison the seller wins outright is not one.',
  },
  {
    date: '2026-09-22',
    title: 'What a document costs an assistant',
    body:
      'A token is about 3.5 English characters, which turns the question into arithmetic: a long '
      + 'article is 4,300 tokens, asking an assistant to convert it spends that going in and '
      + 'again coming back, and a megabyte of embedded picture is 300,000 — more than most '
      + 'context windows hold. A link to the same document is eleven. The article gives the '
      + 'formula rather than a percentage, including the case where the model has to read the '
      + 'document and the saving is nothing at all.',
  },
  {
    date: '2026-09-22',
    title: 'Three of the new conversions are written up',
    body:
      'PowerPoint, EPUB and the question of where the pictures go each have an article now, in '
      + 'all five languages. The load-bearing facts were checked rather than remembered: Pandoc '
      + 'writes PowerPoint and does not read it, so the usual advice fails at the first command; '
      + 'calibre reaches Markdown through its text output and drops every link unless you ask it '
      + 'not to; and a picture carried inside the file costs a third more bytes than the one on '
      + 'disk, which is the whole reason most converters leave it behind.',
  },
  {
    date: '2026-09-21',
    title: 'There is a page that says what this is',
    body:
      'There was not one. `/about` was a permanent redirect to the support page, and what it '
      + 'redirected to sat underneath a form about a broken file — so the page that says what '
      + 'TransformPipe is, how it works and who builds it did not exist at the address anybody '
      + 'would type. It does now, in five languages, and it describes fifteen conversions rather '
      + 'than the five it still claimed.',
  },
  {
    date: '2026-09-21',
    title: 'A conversion’s name no longer breaks after its arrow',
    body:
      'The blocks under the dropzone, and the list of conversions in the footer, put the arrow at '
      + 'the end of one line and what it pointed at on the next. The arrow is bound to its word '
      + 'now, so a name that has to wrap wraps in front of it; the cards keep room for a second '
      + 'line so a row stays level either way; and the “Soon” badge moved off the name’s line, '
      + 'where it had been taking a third of the width.',
  },
  {
    date: '2026-09-21',
    title: 'An assistant can convert three more things',
    body:
      'The connector offered HTML, CSV, TSV and JSON, and had done since before plain text '
      + 'shipped. It now also takes plain text, rich text and an Evernote export — the formats '
      + 'that are text, and so the ones a tool can carry at all. A file that is bytes still '
      + 'cannot come through a conversation, and the refusal now says where to take it instead.',
  },
  {
    date: '2026-09-21',
    title: 'Evernote, tags and all',
    slug: 'evernote-to-markdown',
    body:
      'An .enex export becomes one document with a note per section — and the tags come with it. '
      + 'They are how an Evernote library is organised, the reason ten thousand notes are '
      + 'findable at all, and several importers drop them without saying so. Checkboxes become a '
      + 'task list, and a picture is matched to its note by the hash the format links them with.',
    detail: {
      en: {
        description:
          'An Evernote .enex export converts to one Markdown document: a note per section, with tags, dates, checkboxes and pictures kept.',
        keywords:
          'evernote to markdown, enex to markdown, export evernote notes, evernote alternative migration, enex converter',
        body: `The fifteenth conversion, and the one with a queue of people at the door.

## Tags are the point

An Evernote library is not organised by folders. It is organised by tags, and that is how somebody with ten thousand notes finds one — so an import that quietly drops them turns a library into a pile. They come across here as a line under each note's title, beside the date it was created.

## What the format actually is

One XML file holding every note, with each note's content as ENML — Evernote's own restricted XHTML — wrapped in a CDATA section so that one XML document can carry another. Two parsers deep before there is a word to convert.

Three tags in it are Evernote's own. A checkbox becomes a Markdown task list. Encrypted text says that it is encrypted rather than vanishing. And a picture is the interesting one: a note does not name its pictures, it names the **MD5 of their contents**, with the bytes further down the file. There is no id and no filename linking the two, so reading the format means computing the hash — which is why this release added an MD5 to a codebase that had no use for one.

## What comes through

Bold, italic, links, lists, tables, checkboxes, pictures and non-picture attachments named where they were. The pictures ride inside the document, as everything else here does, so a converted notebook is one file with nothing beside it.

It runs in the browser. Nothing is uploaded.`,
      },
      de: {
        description:
          'Ein Evernote-.enex-Export wird zu einem Markdown-Dokument: eine Notiz je Abschnitt, mit Schlagwörtern, Daten, Kästchen und Bildern.',
        keywords:
          'evernote in markdown, enex in markdown, evernote notizen exportieren, evernote alternative umzug, enex konverter',
        body: `Die fünfzehnte Konvertierung, und die mit einer Warteschlange vor der Tür.

## Die Schlagwörter sind der Punkt

Eine Evernote-Sammlung ist nicht nach Ordnern organisiert, sondern nach Schlagwörtern — und genau so findet jemand mit zehntausend Notizen eine davon wieder. Ein Import, der sie stillschweigend fallen lässt, macht aus einer Sammlung einen Haufen. Hier stehen sie in einer Zeile unter dem Titel jeder Notiz, neben dem Datum ihrer Erstellung.

## Was das Format tatsächlich ist

Eine XML-Datei mit allen Notizen, und der Inhalt jeder Notiz als ENML — Evernotes eigene eingeschränkte XHTML-Variante —, eingewickelt in einen CDATA-Abschnitt, damit ein XML-Dokument ein zweites tragen kann. Zwei Parser tief, bevor es ein Wort zu konvertieren gibt.

Drei Tags darin gehören Evernote allein. Ein Kästchen wird eine Markdown-Aufgabenliste. Verschlüsselter Text sagt, dass er verschlüsselt ist, statt zu verschwinden. Und die Bilder sind der interessante Fall: eine Notiz benennt ihre Bilder nicht, sie benennt den **MD5 ihres Inhalts**, während die Bytes weiter unten in der Datei stehen. Es gibt keine ID und keinen Dateinamen, der beides verbindet — das Format zu lesen heißt also, den Hash zu berechnen. Deshalb hat dieses Release einer Codebasis ein MD5 hinzugefügt, die keines brauchte.

## Was ankommt

Fett, kursiv, Links, Listen, Tabellen, Kästchen, Bilder und benannte Anhänge, die keine Bilder sind. Die Bilder reisen im Dokument mit, wie alles andere hier, sodass ein konvertiertes Notizbuch eine einzige Datei ist, ohne etwas daneben.

Läuft im Browser. Nichts wird hochgeladen.`,
      },
      fr: {
        description:
          'Un export Evernote .enex devient un document Markdown : une note par section, avec étiquettes, dates, cases à cocher et images.',
        keywords:
          'evernote vers markdown, enex vers markdown, exporter les notes evernote, migration evernote, convertisseur enex',
        body: `La quinzième conversion, et celle qui a une file d’attente à la porte.

## Les étiquettes sont l’essentiel

Une bibliothèque Evernote n’est pas organisée en dossiers. Elle est organisée en étiquettes, et c’est ainsi que quelqu’un avec dix mille notes en retrouve une — donc un import qui les laisse tomber en silence transforme une bibliothèque en tas. Elles arrivent ici sur une ligne sous le titre de chaque note, à côté de sa date de création.

## Ce qu’est réellement le format

Un seul fichier XML contenant toutes les notes, le contenu de chacune en ENML — la variante restreinte de XHTML propre à Evernote — enveloppé dans une section CDATA pour qu’un document XML puisse en porter un autre. Deux analyseurs de profondeur avant d’avoir un mot à convertir.

Trois balises y appartiennent en propre à Evernote. Une case à cocher devient une liste de tâches Markdown. Un texte chiffré dit qu’il est chiffré plutôt que de disparaître. Et les images sont le cas intéressant : une note ne nomme pas ses images, elle nomme l’**empreinte MD5 de leur contenu**, les octets se trouvant plus bas dans le fichier. Aucun identifiant, aucun nom de fichier ne relie les deux — lire le format, c’est donc calculer l’empreinte. C’est pourquoi cette version ajoute un MD5 à une base de code qui n’en avait aucun usage.

## Ce qui passe

Gras, italique, liens, listes, tableaux, cases, images et pièces jointes non images nommées là où elles étaient. Les images voyagent dans le document, comme tout le reste ici, si bien qu’un carnet converti est un seul fichier, sans rien à côté.

Cela tourne dans le navigateur. Rien n’est téléversé.`,
      },
      es: {
        description:
          'Una exportación .enex de Evernote se convierte en un documento Markdown: una nota por sección, con etiquetas, fechas, casillas e imágenes.',
        keywords:
          'evernote a markdown, enex a markdown, exportar notas de evernote, migrar desde evernote, conversor enex',
        body: `La decimoquinta conversión, y la que tiene cola en la puerta.

## Las etiquetas son lo importante

Una biblioteca de Evernote no se organiza por carpetas. Se organiza por etiquetas, y así es como alguien con diez mil notas encuentra una — de modo que una importación que las descarta en silencio convierte una biblioteca en un montón. Aquí llegan en una línea bajo el título de cada nota, junto a la fecha en que se creó.

## Qué es el formato en realidad

Un único archivo XML con todas las notas, y el contenido de cada una en ENML — la variante restringida de XHTML propia de Evernote — envuelto en una sección CDATA para que un documento XML pueda transportar otro. Dos analizadores de profundidad antes de que haya una palabra que convertir.

Tres etiquetas dentro son propias de Evernote. Una casilla pasa a ser una lista de tareas de Markdown. El texto cifrado dice que está cifrado en vez de desaparecer. Y las imágenes son el caso interesante: una nota no nombra sus imágenes, nombra el **MD5 de su contenido**, con los bytes más abajo en el archivo. No hay identificador ni nombre de archivo que enlace ambos, así que leer el formato significa calcular el hash. Por eso esta versión añade un MD5 a una base de código que no lo necesitaba para nada.

## Qué pasa entero

Negrita, cursiva, enlaces, listas, tablas, casillas, imágenes y adjuntos que no son imágenes, nombrados donde estaban. Las imágenes viajan dentro del documento, como todo lo demás aquí, así que una libreta convertida es un solo archivo sin nada al lado.

Funciona en el navegador. No se sube nada.`,
      },
      it: {
        description:
          'Un export .enex di Evernote diventa un documento Markdown: una nota per sezione, con tag, date, caselle e immagini.',
        keywords:
          'evernote in markdown, enex in markdown, esportare note evernote, migrare da evernote, convertitore enex',
        body: `La quindicesima conversione, e quella con la fila alla porta.

## I tag sono il punto

Una raccolta Evernote non è organizzata in cartelle. È organizzata in tag, ed è così che chi ha diecimila note ne ritrova una — perciò un’importazione che li lascia cadere in silenzio trasforma una raccolta in un mucchio. Qui arrivano su una riga sotto il titolo di ogni nota, accanto alla data in cui è stata creata.

## Che cos’è davvero il formato

Un unico file XML con tutte le note, e il contenuto di ciascuna in ENML — la variante ristretta di XHTML propria di Evernote — avvolto in una sezione CDATA perché un documento XML possa trasportarne un altro. Due parser di profondità prima che ci sia una parola da convertire.

Tre tag lì dentro sono solo di Evernote. Una casella diventa un elenco di attività Markdown. Il testo cifrato dice di essere cifrato invece di sparire. E le immagini sono il caso interessante: una nota non nomina le proprie immagini, nomina l’**MD5 del loro contenuto**, con i byte più in basso nel file. Non c’è identificatore né nome di file che colleghi i due, quindi leggere il formato significa calcolare l’hash. Ecco perché questa versione aggiunge un MD5 a una base di codice che non ne aveva alcun uso.

## Che cosa arriva

Grassetto, corsivo, collegamenti, elenchi, tabelle, caselle, immagini e allegati non immagine nominati dov’erano. Le immagini viaggiano dentro il documento, come tutto il resto qui, così un taccuino convertito è un unico file senza nulla accanto.

Gira nel browser. Non viene caricato nulla.`,
      },
    },
  },
  {
    date: '2026-09-21',
    title: 'LibreOffice and rich text, both read',
    slug: 'odt-and-rtf-to-markdown',
    body:
      'Two conversions rather than one. An .odt — what LibreOffice, OpenOffice and a Google Docs '
      + 'download are — converts with its headings, lists, tables, footnotes and pictures intact, '
      + 'because that format says what things are. An .rtf converts too, which is harder than it '
      + 'sounds: it says only what a writer did, so a heading has to be recognised rather than '
      + 'read.',
    detail: {
      en: {
        description:
          'OpenDocument .odt and rich text .rtf both convert to Markdown, with headings, lists, tables, footnotes and pictures kept where the format records them.',
        keywords:
          'odt to markdown, rtf to markdown, libreoffice to markdown, convert rich text to markdown, opendocument converter',
        body: `Two formats in one week because they are opposite problems, and the second one is the interesting half.

## OpenDocument says what things are

An \`.odt\` is a zip of XML, and its XML describes a document rather than a page: \`<text:h text:outline-level="2">\` is a second-level heading and says so, a list nests by nesting, a table is a table, a footnote is a footnote. Nothing has to be inferred, which makes it the most faithful conversion here.

The one indirection is emphasis. Bold is not on the word — it is a style name on the word, defined elsewhere, possibly inheriting from another style, possibly in a different file inside the zip. So the styles are read from both files and resolved through their parents before a single word is converted, which is also how a paragraph styled *Heading 2* is recognised as a heading in the documents that use one instead of a real heading element.

## Rich text says only what somebody did

An \`.rtf\` has no document tree at all. It is a stream of control words that a word processor replays: \`\\b\` and the text after it is bold, \`\\par\` and a paragraph ended. So this reads it the same way — a cursor, a stack of formatting states that a brace copies and restores, paragraphs collected as they end.

What the format does not record has to be worked out:

- **A heading.** Word writes an outline level and means it. TextEdit, Pages and everything else on a Mac write nothing but a bold line set larger than the body, and mean exactly the same thing. So the outline level is used where there is one, and where there is not, a paragraph that is bold end to end and larger than the body is a heading, ranked by size.
- **A numbered list against a bulleted one.** The file says which list and how deep, and never which kind. What does say is the marker the writer drew: a digit is a number, anything else is a bullet.
- **Which bytes are even text.** Half the file is the font table, the colour table, the stylesheet and the revision history, and every one of those has to be skipped whole — the words inside them read exactly like content.

Characters come back properly either way: \`\\u1055\` and \`\\'e9\` both decode, the second through whichever codepage the file names.

Both run in the browser. Neither file is uploaded.`,
      },
      de: {
        description:
          'OpenDocument-.odt und Rich-Text-.rtf werden beide zu Markdown, mit Überschriften, Listen, Tabellen, Fußnoten und Bildern, soweit das Format sie festhält.',
        keywords:
          'odt in markdown, rtf in markdown, libreoffice in markdown, rich text umwandeln, opendocument konverter',
        body: `Zwei Formate in einer Woche, weil sie entgegengesetzte Probleme sind — und das zweite ist die interessante Hälfte.

## OpenDocument sagt, was die Dinge sind

Eine \`.odt\` ist ein Zip aus XML, und ihr XML beschreibt ein Dokument und keine Seite: \`<text:h text:outline-level="2">\` ist eine Überschrift zweiter Ebene und sagt das auch, eine Liste verschachtelt sich durch Verschachtelung, eine Tabelle ist eine Tabelle, eine Fußnote eine Fußnote. Nichts muss erschlossen werden, was dies zur treuesten Konvertierung hier macht.

Die eine Umleitung ist die Auszeichnung. Fett steht nicht am Wort — es steht als Formatname am Wort, anderswo definiert, womöglich von einer weiteren Vorlage geerbt, womöglich in einer anderen Datei im Zip. Also werden die Vorlagen aus beiden Dateien gelesen und über ihre Eltern aufgelöst, bevor ein einziges Wort umgewandelt wird. Auf demselben Weg wird ein als *Überschrift 2* formatierter Absatz in den Dokumenten erkannt, die statt eines echten Überschriftenelements eine Formatvorlage benutzen.

## Rich Text sagt nur, was jemand getan hat

Eine \`.rtf\` hat überhaupt keinen Dokumentbaum. Sie ist ein Strom von Steuerwörtern, den eine Textverarbeitung abspielt: \`\\b\`, und was folgt, ist fett; \`\\par\`, und ein Absatz ist zu Ende. Genauso wird sie hier gelesen — ein Cursor, ein Stapel von Formatzuständen, den eine Klammer kopiert und wiederherstellt, Absätze, die beim Enden gesammelt werden.

Was das Format nicht festhält, muss erschlossen werden:

- **Eine Überschrift.** Word schreibt eine Gliederungsebene und meint sie. TextEdit, Pages und alles andere auf dem Mac schreiben nichts als eine fette, größer gesetzte Zeile und meinen genau dasselbe. Also gilt die Gliederungsebene, wo es eine gibt, und sonst ein durchgehend fetter Absatz, der größer ist als der Fließtext, eingestuft nach seiner Größe.
- **Nummerierte gegen ungeordnete Liste.** Die Datei sagt, welche Liste und wie tief, und nie welche Art. Was es sagt, ist die Marke, die der Schreiber gezeichnet hat: eine Ziffer ist eine Nummer, alles andere ein Aufzählungszeichen.
- **Welche Bytes überhaupt Text sind.** Die halbe Datei ist Schrifttabelle, Farbtabelle, Formatvorlagen und Änderungsverlauf, und jedes davon muss als Ganzes übersprungen werden — der Text darin liest sich genau wie Inhalt.

Zeichen kommen in beiden Fällen richtig an: \`\\u1055\` und \`\\'e9\` werden dekodiert, das zweite über die Codepage, die die Datei nennt.

Beides läuft im Browser. Keine der Dateien wird hochgeladen.`,
      },
      fr: {
        description:
          'Les .odt OpenDocument et les .rtf de texte enrichi se convertissent en Markdown, titres, listes, tableaux, notes et images conservés.',
        keywords:
          'odt vers markdown, rtf vers markdown, libreoffice vers markdown, convertir texte enrichi, convertisseur opendocument',
        body: `Deux formats en une semaine parce qu’ils posent des problèmes opposés — et le second est la moitié intéressante.

## OpenDocument dit ce que les choses sont

Un \`.odt\` est une archive zip de XML, et son XML décrit un document et non une page : \`<text:h text:outline-level="2">\` est un titre de deuxième niveau et le dit, une liste s’imbrique en s’imbriquant, un tableau est un tableau, une note est une note. Rien n’est à deviner, ce qui en fait la conversion la plus fidèle d’ici.

La seule indirection est la mise en valeur. Le gras n’est pas sur le mot : c’est un nom de style sur le mot, défini ailleurs, héritant peut-être d’un autre style, peut-être dans un autre fichier de l’archive. Les styles sont donc lus dans les deux fichiers et résolus par leurs parents avant qu’un seul mot ne soit converti — c’est aussi ainsi qu’un paragraphe en style *Titre 2* est reconnu comme un titre dans les documents qui en utilisent un plutôt qu’un véritable élément de titre.

## Le texte enrichi ne dit que ce que quelqu’un a fait

Un \`.rtf\` n’a aucun arbre de document. C’est un flux de mots de contrôle qu’un traitement de texte rejoue : \`\\b\`, et ce qui suit est gras ; \`\\par\`, et un paragraphe s’achève. Il est donc lu de la même façon — un curseur, une pile d’états de mise en forme qu’une accolade copie et restaure, des paragraphes récoltés à mesure qu’ils finissent.

Ce que le format n’enregistre pas doit être déduit :

- **Un titre.** Word écrit un niveau de plan et le pense. TextEdit, Pages et tout le reste sur Mac n’écrivent qu’une ligne grasse composée plus grande, et veulent dire exactement la même chose. On prend donc le niveau de plan là où il existe, et sinon un paragraphe gras de bout en bout et plus grand que le corps, classé par sa taille.
- **Une liste numérotée contre une liste à puces.** Le fichier dit quelle liste et à quelle profondeur, jamais laquelle des deux. Ce qui le dit, c’est la marque dessinée par l’auteur : un chiffre est un numéro, tout le reste est une puce.
- **Quels octets sont même du texte.** La moitié du fichier est la table des polices, celle des couleurs, la feuille de styles et l’historique des révisions, et chacune doit être sautée en bloc — le texte à l’intérieur se lit exactement comme du contenu.

Les caractères reviennent correctement dans les deux cas : \`\\u1055\` et \`\\'e9\` se décodent, le second via la page de codes que le fichier nomme.

Les deux tournent dans le navigateur. Aucun des fichiers n’est téléversé.`,
      },
      es: {
        description:
          'Los .odt de OpenDocument y los .rtf de texto enriquecido se convierten en Markdown, con encabezados, listas, tablas, notas e imágenes.',
        keywords:
          'odt a markdown, rtf a markdown, libreoffice a markdown, convertir texto enriquecido, conversor opendocument',
        body: `Dos formatos en una semana porque plantean problemas opuestos, y el segundo es la mitad interesante.

## OpenDocument dice qué son las cosas

Un \`.odt\` es un zip de XML, y su XML describe un documento y no una página: \`<text:h text:outline-level="2">\` es un encabezado de segundo nivel y lo dice, una lista se anida anidándose, una tabla es una tabla, una nota es una nota. No hay nada que inferir, lo que la convierte en la conversión más fiel de todas.

La única indirección es el énfasis. La negrita no está en la palabra: es un nombre de estilo sobre la palabra, definido en otro sitio, quizá heredando de otro estilo, quizá en otro archivo del zip. Así que los estilos se leen de ambos archivos y se resuelven por sus padres antes de convertir una sola palabra — y así también se reconoce como encabezado un párrafo con estilo *Título 2* en los documentos que usan uno en vez de un elemento de encabezado real.

## El texto enriquecido solo dice lo que alguien hizo

Un \`.rtf\` no tiene árbol de documento. Es un flujo de palabras de control que un procesador de textos reproduce: \`\\b\`, y lo que sigue va en negrita; \`\\par\`, y un párrafo termina. Se lee igual — un cursor, una pila de estados de formato que una llave copia y restaura, y párrafos recogidos según terminan.

Lo que el formato no registra hay que deducirlo:

- **Un encabezado.** Word escribe un nivel de esquema y lo dice en serio. TextEdit, Pages y todo lo demás en un Mac no escriben más que una línea en negrita compuesta más grande, y quieren decir exactamente lo mismo. Se usa el nivel de esquema donde lo hay, y donde no, un párrafo en negrita de principio a fin y más grande que el cuerpo, ordenado por su tamaño.
- **Una lista numerada frente a una de viñetas.** El archivo dice qué lista y a qué profundidad, y nunca de cuál de las dos se trata. Lo que sí lo dice es la marca que dibujó el autor: un dígito es un número, cualquier otra cosa es una viñeta.
- **Qué bytes son siquiera texto.** La mitad del archivo es la tabla de fuentes, la de colores, la hoja de estilos y el historial de revisiones, y cada una hay que saltarla entera: el texto que hay dentro se lee exactamente como contenido.

Los caracteres vuelven bien en ambos casos: \`\\u1055\` y \`\\'e9\` se decodifican, el segundo con la página de códigos que el archivo nombra.

Los dos funcionan en el navegador. Ninguno de los archivos se sube.`,
      },
      it: {
        description:
          'Gli .odt di OpenDocument e gli .rtf di testo formattato diventano Markdown, con intestazioni, elenchi, tabelle, note e immagini.',
        keywords:
          'odt in markdown, rtf in markdown, libreoffice in markdown, convertire testo formattato, convertitore opendocument',
        body: `Due formati in una settimana perché pongono problemi opposti, e il secondo è la metà interessante.

## OpenDocument dice che cosa sono le cose

Un \`.odt\` è uno zip di XML, e il suo XML descrive un documento e non una pagina: \`<text:h text:outline-level="2">\` è un’intestazione di secondo livello e lo dichiara, un elenco si annida annidandosi, una tabella è una tabella, una nota è una nota. Non c’è nulla da dedurre, il che ne fa la conversione più fedele fra quelle qui.

L’unica indirezione è l’enfasi. Il grassetto non sta sulla parola: è un nome di stile sulla parola, definito altrove, magari ereditato da un altro stile, magari in un altro file dentro lo zip. Gli stili vengono quindi letti da entrambi i file e risolti attraverso i loro genitori prima che una sola parola venga convertita — ed è così che viene riconosciuto come intestazione anche un paragrafo con stile *Titolo 2* nei documenti che ne usano uno invece di un vero elemento di intestazione.

## Il testo formattato dice solo che cosa ha fatto qualcuno

Un \`.rtf\` non ha alcun albero del documento. È un flusso di parole di controllo che un programma di videoscrittura riproduce: \`\\b\`, e ciò che segue è in grassetto; \`\\par\`, e un paragrafo finisce. Viene letto allo stesso modo — un cursore, una pila di stati di formattazione che una graffa copia e ripristina, paragrafi raccolti man mano che finiscono.

Quello che il formato non registra va ricavato:

- **Un’intestazione.** Word scrive un livello di struttura e lo intende davvero. TextEdit, Pages e tutto il resto su Mac non scrivono altro che una riga in grassetto composta più grande, e intendono esattamente la stessa cosa. Si usa il livello di struttura dove c’è, e dove non c’è un paragrafo in grassetto da cima a fondo e più grande del corpo, ordinato per dimensione.
- **Un elenco numerato contro uno puntato.** Il file dice quale elenco e a che profondità, e mai quale dei due. A dirlo è il segno che ha disegnato chi scriveva: una cifra è un numero, qualsiasi altra cosa è un punto elenco.
- **Quali byte siano perfino testo.** Metà del file è la tabella dei caratteri, quella dei colori, il foglio di stili e la cronologia delle revisioni, e ognuna va saltata per intero: il testo che contengono si legge esattamente come contenuto.

I caratteri tornano corretti in entrambi i casi: \`\\u1055\` e \`\\'e9\` si decodificano, il secondo tramite la codepage che il file dichiara.

Entrambi girano nel browser. Nessuno dei due file viene caricato.`,
      },
    },
  },
  {
    date: '2026-09-21',
    version: '2.2.0',
    title: 'EPUB, and a phone that works',
    body:
      'A book is the twelfth conversion: a chapter is a section, in the order the book is read '
      + 'rather than the order its files are numbered. Reading a document full screen now works '
      + 'on an iPhone, where it had never worked at all; the tabs above a converted document stop '
      + 'taking the page sideways; and a dialog taller than a phone held sideways can be '
      + 'scrolled. For the extension, a saved page keeps the site’s own stylesheets — 2.1.0 was '
      + 'replaced in the store rather than left to clear review, because it did not.',
  },
  {
    date: '2026-09-21',
    title: 'A saved page keeps the site’s own stylesheets',
    body:
      'Saving a page as it looks could produce a file with none of the site’s styling in it — the '
      + 'text and the pictures all there, laid out as though the stylesheet had never existed. '
      + 'Every linked stylesheet was being inlined correctly and then overwritten, one by one, '
      + 'with the contents of an unrelated `<style>` from elsewhere in the page.',
  },
  {
    date: '2026-09-21',
    title: 'Three things that only went wrong on a phone',
    body:
      'Reading a document full screen did nothing at all on an iPhone — Safari has no such API '
      + 'there, so the button threw instead of working, silently, since the day it shipped. The '
      + 'tabs above a converted document ran off the side of the screen once there were four of '
      + 'them. And a dialog taller than a phone held sideways could not be scrolled, so the '
      + 'bottom of the sign-in form was simply unreachable. All three are fixed.',
  },
  {
    date: '2026-09-21',
    title: 'A book, as one document',
    slug: 'epub-to-markdown',
    body:
      'EPUB is the twelfth conversion. A .epub goes in and the whole book comes out as one '
      + 'document: a section per chapter, in the order the book is read rather than the order its '
      + 'files are numbered, under the titles the contents gives them, with the pictures inside '
      + 'and the links between chapters reduced to their words.',
    detail: {
      en: {
        description:
          'An EPUB book converts to one Markdown document: a section per chapter, in the order the spine gives, with the contents, the pictures and the author kept.',
        keywords:
          'epub to markdown, convert epub to text, extract text from epub, epub converter online, ebook to markdown',
        body: `Renaming an \`.epub\` to \`.zip\` almost works. It is a zip, and every chapter is inside it as XHTML you can open in a browser. What you do not get is the book.

## The order is not in the file names

Open a real one and the chapters are called \`index_split_030.xhtml\`, \`index_split_002.xhtml\`, \`index_split_017.xhtml\`, in that order inside the archive. Those numbers are whatever the tool that built the book happened to write; sorting them shuffles a novel.

The reading order is stated once, in the package document's spine, and nothing else states it. That is where this reads it from — the same lesson a slide deck taught, where a slide dragged to the front keeps the file name it was made with.

## The titles are the ones the book gives

A chapter's name comes from the book's own table of contents: the \`nav\` document in EPUB 3, the NCX in EPUB 2, both still in the wild. That label is what a reader sees in their own reading system, and it beats anything derived from the markup. Where a book gives none, the chapter's first heading is used, and its \`<title>\` after that.

## What is dropped, and why

**The cover.** It is the jacket, not a page, and it would spend a quarter of the picture allowance saying what the title already says.

**The address half of every internal link.** A footnote marker, a cross-reference, a return arrow — each points at a file that is a section of this document now. The words survive; there is nowhere for the address to land. Notion and Confluence exports have been treated the same way since they arrived.

## What comes through

The prose, the headings, the verse and the block quotes, the tables, and the pictures — carried inside the document as their own bytes rather than left in the archive. The author's name goes under the title, out of the book's own metadata.

A trilogy of about two and a half million characters converts in under half a second, in the browser. The book is not uploaded.`,
      },
      de: {
        description:
          'Ein EPUB wird zu einem Markdown-Dokument: ein Abschnitt je Kapitel, in der Reihenfolge der Spine, mit Inhaltsverzeichnis, Bildern und Autor.',
        keywords:
          'epub in markdown, epub in text umwandeln, text aus epub extrahieren, epub konverter online, ebook in markdown',
        body: `Eine \`.epub\` in \`.zip\` umzubenennen funktioniert fast. Sie ist eine, und jedes Kapitel liegt darin als XHTML, das sich im Browser öffnen lässt. Was man nicht bekommt, ist das Buch.

## Die Reihenfolge steht nicht in den Dateinamen

Öffnet man ein echtes, heißen die Kapitel \`index_split_030.xhtml\`, \`index_split_002.xhtml\`, \`index_split_017.xhtml\`, in genau dieser Reihenfolge im Archiv. Diese Zahlen sind nur das, was das erzeugende Programm geschrieben hat; sortiert man danach, ist der Roman durcheinander.

Die Lesereihenfolge wird genau einmal festgelegt, in der Spine der Paketdatei, und sonst nirgends. Von dort wird sie hier gelesen — dieselbe Lehre wie beim Foliensatz, wo eine nach vorn gezogene Folie den Namen behält, unter dem sie entstand.

## Die Titel sind die des Buchs

Der Name eines Kapitels kommt aus dem Inhaltsverzeichnis des Buchs: dem \`nav\`-Dokument bei EPUB 3, der NCX bei EPUB 2 — beides ist weiterhin verbreitet. Diese Beschriftung sieht der Leser auch in seinem eigenen Leseprogramm, und sie ist besser als alles aus dem Markup Abgeleitete. Fehlt sie, wird die erste Überschrift des Kapitels genommen, danach sein \`<title>\`.

## Was wegfällt, und warum

**Das Cover.** Es ist der Schutzumschlag und keine Seite, und es würde ein Viertel des Bildbudgets dafür ausgeben, das zu sagen, was der Titel schon sagt.

**Die Adresshälfte jedes internen Links.** Eine Fußnotenmarke, ein Querverweis, ein Rücksprungpfeil — jeder zeigt auf eine Datei, die jetzt ein Abschnitt dieses Dokuments ist. Die Worte bleiben; für die Adresse gibt es kein Ziel mehr. Notion- und Confluence-Exporte werden seit jeher genauso behandelt.

## Was ankommt

Der Text, die Überschriften, Verse und Zitatblöcke, die Tabellen und die Bilder — als eigene Bytes im Dokument statt im Archiv zurückgelassen. Der Name des Autors steht unter dem Titel, aus den Metadaten des Buchs.

Eine Trilogie von rund zweieinhalb Millionen Zeichen wird in weniger als einer halben Sekunde umgewandelt, im Browser. Das Buch wird nicht hochgeladen.`,
      },
      fr: {
        description:
          'Un livre EPUB devient un document Markdown : une section par chapitre, dans l’ordre de la spine, avec le sommaire, les images et l’auteur.',
        keywords:
          'epub vers markdown, convertir epub en texte, extraire le texte d’un epub, convertisseur epub en ligne, ebook vers markdown',
        body: `Renommer un \`.epub\` en \`.zip\` marche presque. C’en est un, et chaque chapitre s’y trouve en XHTML ouvrable dans un navigateur. Ce que vous n’obtenez pas, c’est le livre.

## L’ordre n’est pas dans les noms de fichiers

Ouvrez-en un vrai : les chapitres s’appellent \`index_split_030.xhtml\`, \`index_split_002.xhtml\`, \`index_split_017.xhtml\`, dans cet ordre à l’intérieur de l’archive. Ces numéros sont ce que l’outil de fabrication a écrit ; trier dessus mélange un roman.

L’ordre de lecture est énoncé une fois, dans la spine du fichier de paquet, et nulle part ailleurs. C’est là qu’il est lu ici — la leçon qu’avait déjà donnée un diaporama, où une diapositive déplacée en tête garde le nom reçu à sa création.

## Les titres sont ceux du livre

Le nom d’un chapitre vient du sommaire du livre : le document \`nav\` en EPUB 3, le NCX en EPUB 2, tous deux encore courants. Cette étiquette est celle que le lecteur voit dans sa propre liseuse, et elle vaut mieux que tout ce qu’on pourrait déduire du balisage. À défaut, on prend le premier titre du chapitre, puis son \`<title>\`.

## Ce qui est écarté, et pourquoi

**La couverture.** C’est la jaquette et non une page, et elle dépenserait un quart de l’allocation d’images pour dire ce que le titre dit déjà.

**La moitié « adresse » de chaque lien interne.** Un appel de note, un renvoi, une flèche de retour : chacun pointe vers un fichier qui est désormais une section de ce document. Les mots survivent ; l’adresse n’a plus où atterrir. Les exports Notion et Confluence sont traités ainsi depuis leur arrivée.

## Ce qui passe

La prose, les titres, les vers et les citations, les tableaux et les images — portées dans le document comme leurs propres octets plutôt que laissées dans l’archive. Le nom de l’auteur se place sous le titre, depuis les métadonnées du livre.

Une trilogie d’environ deux millions et demi de caractères se convertit en moins d’une demi-seconde, dans le navigateur. Le livre n’est pas téléversé.`,
      },
      es: {
        description:
          'Un libro EPUB se convierte en un documento Markdown: una sección por capítulo, en el orden de la spine, con índice, imágenes y autor.',
        keywords:
          'epub a markdown, convertir epub a texto, extraer texto de un epub, conversor epub en línea, ebook a markdown',
        body: `Renombrar un \`.epub\` a \`.zip\` casi funciona. Lo es, y cada capítulo está dentro como XHTML que se abre en un navegador. Lo que no obtienes es el libro.

## El orden no está en los nombres de archivo

Abre uno de verdad: los capítulos se llaman \`index_split_030.xhtml\`, \`index_split_002.xhtml\`, \`index_split_017.xhtml\`, en ese orden dentro del archivo. Esos números son lo que escribió la herramienta que hizo el libro; ordenar por ellos baraja una novela.

El orden de lectura se declara una sola vez, en la spine del archivo de paquete, y en ningún otro sitio. De ahí se lee aquí, la misma lección que dejó una presentación, donde una diapositiva arrastrada al principio conserva el nombre con el que se creó.

## Los títulos son los del libro

El nombre de un capítulo sale del índice del propio libro: el documento \`nav\` en EPUB 3, el NCX en EPUB 2, ambos todavía en circulación. Esa etiqueta es la que el lector ve en su propio lector, y vale más que cualquier cosa deducida del marcado. Si no la hay, se usa el primer encabezado del capítulo y después su \`<title>\`.

## Qué se descarta, y por qué

**La portada.** Es la sobrecubierta, no una página, y gastaría una cuarta parte de la asignación de imágenes en decir lo que el título ya dice.

**La mitad «dirección» de cada enlace interno.** Una llamada de nota, una referencia cruzada, una flecha de vuelta: cada una apunta a un archivo que ahora es una sección de este documento. Las palabras sobreviven; la dirección no tiene dónde aterrizar. Las exportaciones de Notion y Confluence se tratan así desde que llegaron.

## Qué pasa entero

La prosa, los encabezados, los versos y las citas, las tablas y las imágenes, llevadas dentro del documento como sus propios bytes en lugar de quedarse en el archivo. El nombre del autor va bajo el título, sacado de los metadatos del libro.

Una trilogía de unos dos millones y medio de caracteres se convierte en menos de medio segundo, en el navegador. El libro no se sube.`,
      },
      it: {
        description:
          'Un libro EPUB diventa un documento Markdown: una sezione per capitolo, nell’ordine della spine, con indice, immagini e autore.',
        keywords:
          'epub in markdown, convertire epub in testo, estrarre testo da un epub, convertitore epub online, ebook in markdown',
        body: `Rinominare un \`.epub\` in \`.zip\` quasi funziona. Lo è, e ogni capitolo è lì dentro come XHTML apribile in un browser. Quello che non ottieni è il libro.

## L’ordine non sta nei nomi dei file

Aprine uno vero: i capitoli si chiamano \`index_split_030.xhtml\`, \`index_split_002.xhtml\`, \`index_split_017.xhtml\`, in quest’ordine dentro l’archivio. Quei numeri sono ciò che ha scritto lo strumento che ha prodotto il libro; ordinarli mescola un romanzo.

L’ordine di lettura è dichiarato una volta sola, nella spine del file di pacchetto, e da nessun’altra parte. È da lì che viene letto qui — la stessa lezione di una presentazione, dove una diapositiva trascinata in testa mantiene il nome con cui è nata.

## I titoli sono quelli del libro

Il nome di un capitolo viene dall’indice del libro stesso: il documento \`nav\` in EPUB 3, l’NCX in EPUB 2, entrambi ancora diffusi. Quell’etichetta è ciò che il lettore vede nel proprio lettore, e vale più di qualsiasi cosa dedotta dal markup. Dove manca, si usa la prima intestazione del capitolo e poi il suo \`<title>\`.

## Che cosa viene lasciato fuori, e perché

**La copertina.** È la sovraccoperta, non una pagina, e spenderebbe un quarto dell’assegnazione per le immagini per dire ciò che il titolo dice già.

**La metà «indirizzo» di ogni collegamento interno.** Un richiamo di nota, un rimando, una freccia di ritorno: ognuno punta a un file che ora è una sezione di questo documento. Le parole restano; l’indirizzo non ha più dove atterrare. Le esportazioni di Notion e Confluence sono trattate così da quando sono arrivate.

## Che cosa arriva

La prosa, le intestazioni, i versi e le citazioni, le tabelle e le immagini — portate dentro il documento come byte propri invece che lasciate nell’archivio. Il nome dell’autore va sotto il titolo, dai metadati del libro.

Una trilogia di circa due milioni e mezzo di caratteri si converte in meno di mezzo secondo, nel browser. Il libro non viene caricato.`,
      },
    },
  },
  {
    date: '2026-09-21',
    version: '2.1.0',
    title: 'Everything a document is made of',
    body:
      'A release about fidelity rather than reach. Diagrams are drawn, formulas are typeset, code '
      + 'is coloured, and six things people routinely write in Markdown stopped being printed as '
      + 'punctuation. PowerPoint became the tenth conversion, speaker notes included, and the '
      + 'pictures inside an export stopped being left behind in the .zip. A document says what is '
      + 'wrong with it. The extension reads what the screen shows rather than what the page '
      + 'claims. Each of those has a page of its own below; this card is the list.',
  },
  {
    date: '2026-09-21',
    title: 'Pictures survive an export',
    slug: 'pictures-survive-an-export',
    body:
      'A Notion, Confluence or Obsidian export kept its pictures in the .zip and never unpacked '
      + 'them, so the document arrived with every image pointing at a file that was not there. A '
      + 'PowerPoint deck lost its slides’ pictures. A Word file lost its pictures having already '
      + 'handed every one of them over. All four now carry them, inside the document itself.',
    detail: {
      en: {
        description:
          'Images in a Notion, Confluence, Obsidian or PowerPoint archive, and in a Word file, are now carried into the document instead of left behind.',
        keywords:
          'notion export broken images, confluence export images markdown, obsidian embed images, word document images to markdown, powerpoint images markdown',
        body: `This was the loudest complaint about two of these formats, and this converter had it too.

## What was happening

An export writes its pictures into folders and links to them relatively: Notion beside each page,
Confluence under \`attachments/\`, Obsidian wherever you filed them. Only the text was ever read
out of the archive, so the Markdown came out still saying \`![](some/path.png)\` about files that
were never unpacked — twenty broken images in a converted wiki, which reads as something this
lost rather than something it never had.

PowerPoint was worse in a quieter way: a slide that was only a diagram said so and moved on. And
Word was the strangest of the four, because \`mammoth\` reads a \`.docx\`'s own pictures out of the
file and hands over every one of them — and a single line, set years ago and never commented,
threw them away.

## They are carried, not uploaded

A picture becomes part of the document, as its own bytes. That is the constraint rather than a
shortcut: every conversion here promises the file stays in your browser, and putting the images
in storage on the way through would make that untrue. It also means they travel — into the
downloaded Markdown, into the standalone HTML, into the Word export, into a shared link.

## There is a ceiling, and it is not ours

A document has to fit in 4 MB to be saved to an account, so pictures have half of that between
them and a megabyte each. Past it, a picture from an archive keeps the link it already had —
nothing is lost that was not lost before — and one with no file behind it is replaced by its own
description.

## The part that changed the design

The obvious way to keep Word's pictures was to stop discarding them. Measured on a 3.5 MB
document holding three photographs, that produced 4.7 MB of HTML in 224 ms and then did not
finish: an \`<img>\` whose address is two million characters long is not what an HTML parser is
built for. So the bytes never go near it now — each picture is weighed as it is read, held aside
under a number, and put back once the Markdown is small again. Sixty milliseconds.`,
      },
      de: {
        description:
          'Bilder aus einem Notion-, Confluence-, Obsidian- oder PowerPoint-Archiv und aus einer Word-Datei landen jetzt im Dokument statt im Archiv.',
        keywords:
          'notion export bilder fehlen, confluence export bilder markdown, obsidian bilder einbetten, word bilder nach markdown, powerpoint bilder markdown',
        body: `Das war die lauteste Beschwerde über zwei dieser Formate — und dieser Konverter hatte sie auch.

## Was passiert ist

Ein Export legt seine Bilder in Ordner und verlinkt sie relativ: Notion neben jeder Seite,
Confluence unter \`attachments/\`, Obsidian dort, wo Sie sie abgelegt haben. Aus dem Archiv wurde
nur der Text gelesen, also stand im Markdown weiterhin \`![](irgendein/pfad.png)\` über Dateien,
die nie entpackt wurden — zwanzig kaputte Bilder in einem konvertierten Wiki, was so aussieht,
als hätte dieses Werkzeug sie verloren, statt sie nie gehabt zu haben.

Bei PowerPoint war es auf stillere Weise schlimmer: eine Folie, die nur ein Diagramm war, sagte
das und ging weiter. Word war der seltsamste der vier Fälle, denn \`mammoth\` liest die Bilder
einer \`.docx\` aus der Datei und übergibt jedes einzelne — und eine vor Jahren gesetzte,
nirgends kommentierte Zeile warf sie weg.

## Getragen, nicht hochgeladen

Ein Bild wird Teil des Dokuments, mit seinen eigenen Bytes. Das ist die Randbedingung und keine
Abkürzung: jede Konvertierung hier verspricht, dass die Datei im Browser bleibt, und die Bilder
unterwegs in einen Speicher zu legen, würde das unwahr machen. Es heißt auch, dass sie mitreisen
— in das heruntergeladene Markdown, in das eigenständige HTML, in den Word-Export, in einen
geteilten Link.

## Es gibt eine Obergrenze, und sie ist nicht unsere

Ein Dokument muss in 4 MB passen, um in einem Konto gespeichert zu werden; die Bilder teilen
sich die Hälfte davon und dürfen einzeln ein Megabyte wiegen. Darüber behält ein Bild aus einem
Archiv den Link, den es ohnehin hatte — verloren geht nichts, was nicht vorher schon verloren war
— und eines ohne Datei dahinter wird durch seine eigene Beschreibung ersetzt.

## Was den Entwurf verändert hat

Der naheliegende Weg für Words Bilder war, sie einfach nicht mehr zu verwerfen. Gemessen an einem
3,5-MB-Dokument mit drei Fotos ergab das 4,7 MB HTML in 224 ms — und lief dann nicht zu Ende: ein
\`<img>\`, dessen Adresse zwei Millionen Zeichen lang ist, ist nicht das, wofür ein HTML-Parser
gebaut ist. Die Bytes kommen ihm jetzt gar nicht mehr nahe: jedes Bild wird beim Lesen gewogen,
unter einer Nummer beiseitegelegt und wieder eingesetzt, wenn das Markdown klein ist. Sechzig
Millisekunden.`,
      },
      fr: {
        description:
          'Les images d’une archive Notion, Confluence, Obsidian ou PowerPoint, et celles d’un fichier Word, arrivent maintenant dans le document.',
        keywords:
          'export notion images cassées, export confluence images markdown, obsidian intégrer images, images word vers markdown, images powerpoint markdown',
        body: `C’était la plainte la plus fréquente à propos de deux de ces formats, et ce convertisseur l’avait aussi.

## Ce qui se passait

Un export range ses images dans des dossiers et les lie relativement : Notion à côté de chaque
page, Confluence sous \`attachments/\`, Obsidian là où vous les avez mises. Seul le texte était lu
dans l’archive, si bien que le Markdown continuait d’écrire \`![](un/chemin.png)\` à propos de
fichiers jamais décompressés — vingt images cassées dans un wiki converti, ce qui donne
l’impression que l’outil les a perdues plutôt qu’il ne les a jamais eues.

PowerPoint était pire en plus discret : une diapositive qui n’était qu’un schéma le disait et
passait. Word était le plus étrange des quatre, car \`mammoth\` lit les images d’un \`.docx\` dans
le fichier et les remet toutes — et une ligne posée il y a des années, jamais commentée, les
jetait.

## Portées, pas téléversées

Une image devient une partie du document, avec ses propres octets. C’est la contrainte et non un
raccourci : chaque conversion ici promet que le fichier reste dans le navigateur, et mettre les
images dans un stockage au passage rendrait cette promesse fausse. Cela veut dire aussi qu’elles
voyagent — dans le Markdown téléchargé, dans le HTML autonome, dans l’export Word, dans un lien
partagé.

## Il y a un plafond, et il n’est pas de nous

Un document doit tenir dans 4 Mo pour être enregistré dans un compte ; les images se partagent la
moitié, un mégaoctet chacune au plus. Au-delà, une image venue d’une archive garde le lien
qu’elle avait déjà — rien n’est perdu qui ne l’était déjà — et celle qui n’a aucun fichier
derrière elle est remplacée par sa propre description.

## Ce qui a changé la conception

La façon évidente de garder les images de Word était de cesser de les jeter. Mesuré sur un
document de 3,5 Mo contenant trois photographies : 4,7 Mo de HTML en 224 ms, puis rien — un
\`<img>\` dont l’adresse fait deux millions de caractères n’est pas ce pour quoi un analyseur HTML
est fait. Les octets ne l’approchent plus : chaque image est pesée à la lecture, mise de côté
sous un numéro, et replacée une fois le Markdown redevenu petit. Soixante millisecondes.`,
      },
      es: {
        description:
          'Las imágenes de un archivo de Notion, Confluence, Obsidian o PowerPoint, y las de un archivo de Word, ahora llegan al documento.',
        keywords:
          'exportación notion imágenes rotas, exportación confluence imágenes markdown, obsidian incrustar imágenes, imágenes word a markdown, imágenes powerpoint markdown',
        body: `Era la queja más repetida sobre dos de estos formatos, y este conversor también la tenía.

## Qué pasaba

Una exportación guarda sus imágenes en carpetas y las enlaza de forma relativa: Notion junto a
cada página, Confluence bajo \`attachments/\`, Obsidian donde tú las dejaste. Del archivo solo se
leía el texto, así que el Markdown seguía diciendo \`![](alguna/ruta.png)\` sobre archivos que
nunca se descomprimieron — veinte imágenes rotas en un wiki convertido, lo que parece que la
herramienta las perdió en lugar de no haberlas tenido nunca.

Con PowerPoint era peor de forma más silenciosa: una diapositiva que era solo un esquema lo decía
y seguía adelante. Word era el más extraño de los cuatro, porque \`mammoth\` lee las imágenes de un
\`.docx\` del propio archivo y las entrega todas — y una línea puesta hace años, sin comentar en
ninguna parte, las tiraba.

## Se llevan, no se suben

Una imagen pasa a ser parte del documento, con sus propios bytes. Es la restricción y no un
atajo: cada conversión aquí promete que el archivo se queda en tu navegador, y poner las imágenes
en un almacenamiento por el camino haría falsa esa promesa. También significa que viajan — al
Markdown descargado, al HTML autónomo, a la exportación a Word, a un enlace compartido.

## Hay un techo, y no es nuestro

Un documento debe caber en 4 MB para guardarse en una cuenta; las imágenes se reparten la mitad,
con un megabyte como máximo cada una. Por encima de eso, una imagen venida de un archivo conserva
el enlace que ya tenía — no se pierde nada que no estuviera ya perdido — y la que no tiene
ningún archivo detrás se sustituye por su propia descripción.

## Lo que cambió el diseño

La forma obvia de conservar las imágenes de Word era dejar de descartarlas. Medido en un
documento de 3,5 MB con tres fotografías: 4,7 MB de HTML en 224 ms y después nada — un \`<img>\`
cuya dirección tiene dos millones de caracteres no es para lo que se construyó un analizador de
HTML. Ahora los bytes ni se le acercan: cada imagen se pesa al leerla, se aparta bajo un número y
se repone cuando el Markdown vuelve a ser pequeño. Sesenta milisegundos.`,
      },
      it: {
        description:
          'Le immagini di un archivio Notion, Confluence, Obsidian o PowerPoint, e quelle di un file Word, ora arrivano nel documento.',
        keywords:
          'esportazione notion immagini rotte, esportazione confluence immagini markdown, obsidian incorporare immagini, immagini word in markdown, immagini powerpoint markdown',
        body: `Era la lamentela più frequente su due di questi formati, e questo convertitore ce l’aveva anche lui.

## Che cosa succedeva

Un’esportazione mette le immagini in cartelle e le collega in modo relativo: Notion accanto a ogni
pagina, Confluence sotto \`attachments/\`, Obsidian dove le hai messe tu. Dall’archivio veniva
letto solo il testo, così il Markdown continuava a dire \`![](qualche/percorso.png)\` di file mai
estratti — venti immagini rotte in un wiki convertito, il che sembra che lo strumento le abbia
perse invece che non averle mai avute.

Con PowerPoint era peggio in modo più silenzioso: una diapositiva che era solo uno schema lo
diceva e passava oltre. Word era il più strano dei quattro, perché \`mammoth\` legge le immagini di
un \`.docx\` dal file stesso e le consegna tutte — e una riga scritta anni fa, mai commentata, le
buttava via.

## Portate, non caricate

Un’immagine diventa parte del documento, con i propri byte. È il vincolo, non una scorciatoia:
ogni conversione qui promette che il file resta nel browser, e mettere le immagini in un archivio
remoto lungo la strada renderebbe falsa quella promessa. Vuol dire anche che viaggiano — nel
Markdown scaricato, nell’HTML autonomo, nell’esportazione in Word, in un link condiviso.

## C’è un tetto, e non è nostro

Un documento deve stare in 4 MB per essere salvato in un account; le immagini si dividono la metà,
al massimo un megabyte ciascuna. Oltre, un’immagine che viene da un archivio mantiene il
collegamento che aveva già — non si perde nulla che non fosse già perso — e quella che non ha
alcun file dietro viene sostituita dalla propria descrizione.

## La parte che ha cambiato il progetto

Il modo ovvio di tenere le immagini di Word era smettere di scartarle. Misurato su un documento da
3,5 MB con tre fotografie: 4,7 MB di HTML in 224 ms, e poi più nulla — un \`<img>\` il cui
indirizzo è lungo due milioni di caratteri non è ciò per cui è fatto un parser HTML. Ora i byte
non gli si avvicinano: ogni immagine viene pesata mentre si legge, messa da parte sotto un numero
e rimessa quando il Markdown è tornato piccolo. Sessanta millisecondi.`,
      },
    },
  },
  {
    date: '2026-09-21',
    title: 'The formats that are coming say so',
    body:
      'The blocks under the dropzone now name what is on the way — EPUB, ODT, RTF and Evernote — '
      + 'marked as not here yet. Arriving with an .epub and learning only that this does not take '
      + 'one was a worse answer than "not yet", and the row of empty space beside the eleventh '
      + 'conversion read as something that had failed to load.',
  },
  {
    date: '2026-09-21',
    title: 'The German, French, Spanish and Italian sign-in panel reads properly again',
    body:
      'The panel added on 19 September went out with its accented characters mangled in four '
      + 'languages — "lässt" as "lÃ¤sst", and ten more like it. The text was right; the file it '
      + 'was written into was not.',
  },
  {
    date: '2026-09-20',
    title: 'Plain text that looks like markup stays plain text',
    body:
      'Two ways a converted .txt — and now a slide — could lose a word. `[XX] min` came out as a '
      + 'formula in italics with "min" stranded outside it, because `\\[` is both an escaped '
      + 'square bracket and LaTeX’s opening display delimiter; it now has to contain an operator '
      + 'or a command to be read as maths. And a word in angle brackets was read as an HTML tag '
      + 'and removed on the way through. Both are escaped now, so the text renders as it was '
      + 'typed.',
  },
  {
    date: '2026-09-20',
    title: 'A deck becomes a document, notes and all',
    slug: 'powerpoint-to-markdown',
    body:
      'PowerPoint is the tenth conversion. A .pptx goes in and one document comes out: a section '
      + 'per slide, in the order the deck plays, bullets still nested and tables still tables — '
      + 'and the speaker notes underneath each one, which are the half of a deck nobody outside '
      + 'the room has ever been able to read.',
    detail: {
      en: {
        description:
          'A PowerPoint deck converts to one document: a section per slide, in playing order, with bullets, tables and the speaker notes kept.',
        keywords:
          'powerpoint to markdown, pptx to markdown, convert a deck to text, extract speaker notes from powerpoint, pptx converter',
        body: `Nine conversions here read a document. This one reads a performance.

## A slide is a section

Every slide becomes a section under its own heading, and the sections come in the order the deck
plays. That is not the order the files inside it are numbered in: a slide dragged to the front
keeps the name it was given when it was made, so the running order is read from the
presentation's own list of slides instead.

Bullets keep their nesting, however deep it goes. A numbered list stays numbered. Tables stay
tables — with the merged cells that every slide-drawn table is full of unpicked, rather than left
behind as columns of nothing. Links keep the addresses behind them.

## The notes come with it

The notes pane is where the argument is usually written, in sentences, by somebody who knew the
slide above it was only the summary they were going to read out. It is also the first thing lost
when a deck is passed on: exporting to PDF drops it, copying the slides out by hand never sees
it, and every other converter treats a deck as the thing on screen.

Here each slide's notes follow that slide's own section, quoted and labelled, still attached to
the slide they belong to.

## When a slide has no title

A deck exported from Google Slides or Keynote often has no title placeholders at all — every
shape on the slide is just a text box somebody drew. Where that happens, a first line short
enough to be a heading is treated as one, which is the difference between a contents list of
forty real titles and one that reads "Slide 2, Slide 3, Slide 4".

## What it does not read

Charts and SmartArt. A chart's numbers live in a spreadsheet embedded in the file and SmartArt's
words in a separate diagram part, and both would arrive as a shapeless list with none of the
arrangement that made them worth drawing. A slide that is only a diagram keeps its heading and
its notes and says so plainly, which is honest about what was there.

It runs in the browser, like every other conversion here. The deck is not uploaded.`,
      },
      de: {
        description:
          'Ein PowerPoint-Foliensatz wird zu einem Dokument: ein Abschnitt je Folie, in Vortragsreihenfolge, mit Aufzählungen, Tabellen und Notizen.',
        keywords:
          'powerpoint in markdown, pptx in markdown umwandeln, foliensatz als text, notizen aus powerpoint extrahieren, pptx konverter',
        body: `Neun Konvertierungen hier lesen ein Dokument. Diese liest einen Vortrag.

## Eine Folie ist ein Abschnitt

Jede Folie wird ein Abschnitt unter ihrer eigenen Überschrift, und die Abschnitte stehen in der
Reihenfolge, in der der Foliensatz abläuft. Das ist nicht die Reihenfolge, in der die Dateien
darin nummeriert sind: eine nach vorn gezogene Folie behält den Namen, den sie bei ihrer
Entstehung bekam — die Vortragsreihenfolge wird deshalb aus der Folienliste der Präsentation
selbst gelesen.

Aufzählungen behalten ihre Verschachtelung, so tief sie auch geht. Eine nummerierte Liste bleibt
nummeriert. Tabellen bleiben Tabellen — mit den verbundenen Zellen, von denen jede auf einer
Folie gezeichnete Tabelle voll ist, aufgelöst statt als Spalten aus nichts zurückgelassen. Links
behalten ihre Adressen.

## Die Notizen kommen mit

Im Notizenbereich steht üblicherweise der Gedankengang, in ganzen Sätzen, von jemandem, der
wusste, dass die Folie darüber nur die Zusammenfassung zum Vorlesen war. Er ist zugleich das
Erste, was verlorengeht, wenn ein Foliensatz weitergereicht wird: der PDF-Export lässt ihn
fallen, beim Herauskopieren der Folien bekommt man ihn nie zu sehen, und jeder andere Konverter
hält einen Foliensatz für das, was auf dem Bildschirm steht.

Hier folgen die Notizen jeder Folie ihrem eigenen Abschnitt, zitiert und benannt, weiterhin bei
der Folie, zu der sie gehören.

## Wenn eine Folie keinen Titel hat

Ein aus Google Slides oder Keynote exportierter Foliensatz hat oft gar keine Titelplatzhalter —
jedes Element auf der Folie ist nur ein gezeichnetes Textfeld. Wo das der Fall ist, wird eine
erste Zeile, die kurz genug für eine Überschrift ist, als eine solche behandelt. Das ist der
Unterschied zwischen einem Inhaltsverzeichnis mit vierzig echten Titeln und einem, in dem
„Folie 2, Folie 3, Folie 4“ steht.

## Was nicht gelesen wird

Diagramme und SmartArt. Die Zahlen eines Diagramms liegen in einer in der Datei eingebetteten
Tabelle, die Worte von SmartArt in einem eigenen Diagrammteil, und beides käme als formlose
Liste an, ohne die Anordnung, die das Zeichnen überhaupt lohnend machte. Eine Folie, die nur
eine Grafik ist, behält ihre Überschrift und ihre Notizen und sagt es offen.

Läuft im Browser, wie jede andere Konvertierung hier. Der Foliensatz wird nicht hochgeladen.`,
      },
      fr: {
        description:
          'Un diaporama PowerPoint devient un document : une section par diapositive, dans l’ordre de présentation, puces, tableaux et notes conservés.',
        keywords:
          'powerpoint vers markdown, convertir pptx en markdown, diaporama en texte, extraire les notes du présentateur, convertisseur pptx',
        body: `Neuf conversions ici lisent un document. Celle-ci lit une présentation.

## Une diapositive est une section

Chaque diapositive devient une section sous son propre titre, et les sections arrivent dans
l’ordre où le diaporama se déroule. Ce n’est pas l’ordre de numérotation des fichiers qu’il
contient : une diapositive déplacée en tête garde le nom reçu à sa création, si bien que l’ordre
de passage est lu dans la liste des diapositives de la présentation elle-même.

Les puces gardent leur imbrication, aussi profonde soit-elle. Une liste numérotée reste
numérotée. Les tableaux restent des tableaux — les cellules fusionnées dont tout tableau dessiné
sur une diapositive est plein étant défusionnées plutôt que laissées en colonnes vides. Les liens
conservent leurs adresses.

## Les notes suivent

Le volet de notes est là où le raisonnement est généralement écrit, en phrases, par quelqu’un qui
savait que la diapositive au-dessus n’en était que le résumé lu à voix haute. C’est aussi la
première chose perdue quand un diaporama est transmis : l’export PDF la supprime, la recopie
manuelle des diapositives ne la voit jamais, et tous les autres convertisseurs prennent un
diaporama pour ce qui s’affiche à l’écran.

Ici, les notes de chaque diapositive suivent sa propre section, citées et annoncées, toujours
rattachées à la diapositive dont elles viennent.

## Quand une diapositive n’a pas de titre

Un diaporama exporté de Google Slides ou de Keynote n’a souvent aucun espace réservé au titre —
chaque élément de la diapositive n’est qu’une zone de texte dessinée. Dans ce cas, une première
ligne assez courte pour être un titre en devient un : c’est la différence entre un sommaire de
quarante vrais titres et un sommaire qui annonce « Diapositive 2, Diapositive 3 ».

## Ce qui n’est pas lu

Les graphiques et les SmartArt. Les chiffres d’un graphique vivent dans un classeur intégré au
fichier et les mots d’un SmartArt dans une partie séparée, et les deux arriveraient en liste
informe, privés de l’agencement qui justifiait de les dessiner. Une diapositive qui n’est qu’un
schéma garde son titre et ses notes, et le dit franchement.

La conversion a lieu dans le navigateur, comme toutes les autres. Le diaporama n’est pas
téléversé.`,
      },
      es: {
        description:
          'Una presentación de PowerPoint se convierte en un documento: una sección por diapositiva, en orden de presentación, con viñetas, tablas y notas.',
        keywords:
          'powerpoint a markdown, convertir pptx a markdown, presentación a texto, extraer notas del orador de powerpoint, conversor pptx',
        body: `Nueve conversiones aquí leen un documento. Esta lee una exposición.

## Una diapositiva es una sección

Cada diapositiva pasa a ser una sección con su propio título, y las secciones llegan en el orden
en que la presentación se expone. No es el orden en que están numerados los archivos que
contiene: una diapositiva arrastrada al principio conserva el nombre que recibió al crearse, de
modo que el orden de exposición se lee de la propia lista de diapositivas de la presentación.

Las viñetas conservan su anidamiento, por profundo que sea. Una lista numerada sigue numerada.
Las tablas siguen siendo tablas — con las celdas combinadas de las que está llena cualquier tabla
dibujada en una diapositiva deshechas, en lugar de quedar como columnas de nada. Los enlaces
mantienen sus direcciones.

## Las notas vienen con ella

El panel de notas es donde suele estar escrito el razonamiento, en frases, por alguien que sabía
que la diapositiva de arriba era solo el resumen que iba a leer en voz alta. Es también lo
primero que se pierde cuando una presentación se pasa a otros: exportar a PDF lo descarta, copiar
las diapositivas a mano nunca llega a verlo, y cualquier otro conversor toma una presentación por
lo que aparece en pantalla.

Aquí las notas de cada diapositiva siguen a su propia sección, citadas y anunciadas, todavía
unidas a la diapositiva de la que salieron.

## Cuando una diapositiva no tiene título

Una presentación exportada de Google Slides o de Keynote a menudo no tiene ningún marcador de
título: cada forma de la diapositiva es solo un cuadro de texto dibujado. Cuando ocurre, una
primera línea lo bastante corta para ser un título se trata como tal, que es la diferencia entre
un índice con cuarenta títulos reales y uno que dice «Diapositiva 2, Diapositiva 3».

## Lo que no lee

Los gráficos y los SmartArt. Los números de un gráfico viven en un libro incrustado en el archivo
y las palabras de un SmartArt en una parte de diagrama aparte, y ambos llegarían como una lista
informe, sin la disposición que justificaba dibujarlos. Una diapositiva que es solo un esquema
conserva su título y sus notas y lo dice sin rodeos.

Se convierte en el navegador, como todo lo demás aquí. La presentación no se sube.`,
      },
      it: {
        description:
          'Una presentazione PowerPoint diventa un documento: una sezione per diapositiva, nell’ordine di presentazione, con elenchi, tabelle e note.',
        keywords:
          'powerpoint in markdown, convertire pptx in markdown, presentazione in testo, estrarre le note del relatore da powerpoint, convertitore pptx',
        body: `Nove conversioni qui leggono un documento. Questa legge una presentazione.

## Una diapositiva è una sezione

Ogni diapositiva diventa una sezione sotto il proprio titolo, e le sezioni arrivano nell’ordine in
cui la presentazione si svolge. Non è l’ordine di numerazione dei file che contiene: una
diapositiva trascinata in testa mantiene il nome ricevuto alla creazione, e l’ordine di
esposizione viene quindi letto dall’elenco delle diapositive della presentazione stessa.

Gli elenchi puntati mantengono l’annidamento, per quanto profondo. Un elenco numerato resta
numerato. Le tabelle restano tabelle — con le celle unite di cui è piena ogni tabella disegnata su
una diapositiva sciolte, invece che lasciate come colonne di nulla. I collegamenti mantengono i
loro indirizzi.

## Le note vengono con lei

Il riquadro delle note è dove di solito il ragionamento è scritto per esteso, da qualcuno che
sapeva che la diapositiva sopra era solo il riassunto da leggere ad alta voce. È anche la prima
cosa che si perde quando una presentazione passa di mano: l’esportazione in PDF la elimina,
ricopiare le diapositive a mano non la vede mai, e ogni altro convertitore scambia una
presentazione per ciò che appare sullo schermo.

Qui le note di ciascuna diapositiva seguono la sua sezione, citate e annunciate, ancora attaccate
alla diapositiva da cui vengono.

## Quando una diapositiva non ha titolo

Una presentazione esportata da Google Slides o da Keynote spesso non ha alcun segnaposto per il
titolo: ogni forma sulla diapositiva è soltanto una casella di testo disegnata. In quel caso una
prima riga abbastanza breve da essere un titolo viene trattata come tale, ed è la differenza fra
un indice con quaranta titoli veri e uno che recita «Diapositiva 2, Diapositiva 3».

## Che cosa non legge

I grafici e gli SmartArt. I numeri di un grafico vivono in una cartella di lavoro incorporata nel
file e le parole di uno SmartArt in una parte a sé, ed entrambi arriverebbero come un elenco
informe, privi della disposizione che rendeva sensato disegnarli. Una diapositiva che è solo uno
schema conserva il titolo e le note e lo dice apertamente.

Converte nel browser, come tutto il resto qui. La presentazione non viene caricata.`,
      },
    },
  },
  {
    date: '2026-09-20',
    title: 'A document says what is wrong with it',
    slug: 'document-check',
    body:
      'A fourth tab beside the preview, with a count on it: links to sections that are not there, '
      + 'two headings competing for one anchor, a heading with no words, a picture with no alt '
      + 'text, a link with nothing to click. Each one carries the line it is on. Nothing is '
      + 'changed for you.',
    detail: {
      en: {
        description:
          'The converter now reports dead anchors, duplicate headings, empty headings and pictures '
          + 'without alt text, each with the line it is on.',
        keywords:
          'markdown link checker, check markdown anchors, missing alt text markdown, '
          + 'duplicate heading anchors, validate markdown document',
        body: `Converting a document faithfully is one question. Whether the document works is
another, and it is the one people ask next.

## What it looks for

- **A link to a section that is not here.** The commonest of them, because a heading gets
  reworded and the link that pointed at it does not.
- **Two headings with the same name.** The second quietly becomes \`…-1\`, so one of the two is
  unreachable by the anchor anybody would guess.
- **A heading with no words** — an entry in the contents that says nothing.
- **A picture with no alt text**, which is invisible to a screen reader and to anyone whose
  images did not load.
- **A link with nothing to click**, and **a link that goes nowhere**.

Each finding carries the line it is on, so the fix is one edit in the source you are looking at.

## Nothing is rewritten

Not as a limitation — as the point. A checker that quietly repairs what it finds is one nobody
can hand a document they care about, and every one of these is a single edit a person can make
better than a rule can. So it reports, and stops.

## The anchors it checks against are the real ones

The document is read through the same parser that renders it, which is the only way the list of
anchors is the list the document actually has. A link inside a code fence is not a link, and no
amount of pattern matching over the source can tell the difference.

Both spellings count. This renderer prefixes an anchor with \`doc-\`, because a bare
\`id="title"\` shadows \`document.title\` and a browser's sanitiser drops exactly those — but
nobody writes links that way. A document written anywhere else says \`[Setup](#setup)\`, and that
is treated as pointing at the heading it obviously points at.`,
      },
    },
  },
  {
    date: '2026-09-19',
    title: 'The things people actually write in Markdown',
    slug: 'markdown-people-write',
    body:
      'A note from Obsidian opened with a horizontal rule and its own YAML set as a heading. '
      + 'A GitHub alert showed the word [!WARNING]. A footnote marker stayed as [^1] and the note '
      + 'under it as a paragraph. Water came out with a line through the 2. All of that now reads '
      + 'the way it was written.',
    detail: {
      en: {
        description:
          'Front matter, GitHub alerts and Obsidian callouts, footnotes, wikilinks, highlights and '
          + 'subscripts are now read rather than printed as punctuation.',
        keywords:
          'obsidian to html, github alerts markdown, markdown footnotes html, '
          + 'yaml front matter converter, markdown callout rendering',
        body: `Six things a Markdown file routinely contains that this converter used to print as
punctuation.

## Front matter

The \`---\` block of properties at the top of every Obsidian note, every Jekyll page and most of
what a static site generator produces. It was being read as a horizontal rule followed by a
heading made of YAML, so a note opened with a line and its own tags set in bold.

It is dropped. The properties describe the vault or the site that defined them and mean nothing
in a converted document — which is the call the Obsidian importer already made, for a vault
uploaded as a zip. The same note pasted on its own kept them, so one file converted two ways came
out as two different documents. Both go through the same rule now.

## Alerts and callouts

\`> [!NOTE]\`, \`> [!TIP]\`, \`> [!IMPORTANT]\`, \`> [!WARNING]\` and \`> [!CAUTION]\` are boxes with
a coloured edge rather than quotes with a marker visible at the top. Obsidian's callouts use the
same shape with a dozen more names — \`success\`, \`danger\`, \`question\` — and those map onto the
five, including the title Obsidian lets you write after the marker.

## Footnotes

\`[^1]\` in a sentence becomes a numbered marker that links to the note, and the notes gather at
the foot of the document in the order they were referred to, each with a way back to where it was
cited. Numbering follows the reading order rather than the order the notes were written in.

## Wikilinks, highlights, subscripts

\`[[Another note]]\` keeps its words — there is no vault to resolve it against once a document has
left one. \`==highlighted==\` is highlighted. \`H~2~O\` is a subscript and \`r^2^\` a superscript;
the first of those is a correction, because a single tilde was being read as strikethrough and
putting a line through the 2.

## What is still not read

Definition lists, \`:emoji:\` shortcodes and abbreviation definitions. Each is one dialect's
extension rather than something a file arrives carrying, and an unread \`:rocket:\` is a word
where the others were visible punctuation.`,
      },
    },
  },
  {
    date: '2026-09-19',
    title: 'Code is highlighted, in the document\'s own colours',
    slug: 'syntax-highlighting',
    body:
      'A fenced block with a language on it — ```ts, ```python, ```bash and about forty more — is '
      + 'now coloured, in the preview, the downloaded file, a shared link and every article on '
      + 'this site. Six colours rather than twenty, drawn from the same palette as the rest of '
      + 'the document, and they follow the theme you are reading in.',
    detail: {
      en: {
        description:
          'Fenced code blocks are syntax highlighted everywhere a document is shown, in a palette '
          + 'taken from the document rather than from an editor theme.',
        keywords:
          'markdown syntax highlighting, highlight code in html export, '
          + 'convert markdown code blocks, code highlighting converter, fenced code block html',
        body: `Put a language after the backticks and the block is coloured.

## Six colours, not twenty

An editor theme paints twenty kinds of token because somebody is going to spend the afternoon in
that file. A reader is skimming a snippet in the middle of a document, and a block painted in
twenty colours reads as decoration rather than as code. So there are six roles — comments,
keywords, strings, numbers, names and everything else — and they are the document's own colours,
which is why the block does not look like a screenshot from somebody else's editor.

Switch between the light and dark theme and the colours move with it, in the preview and in the
file you download, because they are the same \`--md-*\` values the rest of the document is painted
with.

## Which languages

About forty spellings resolve: the ones documentation is written in — shell, JavaScript and
TypeScript, Python, JSON, YAML, HTML, CSS, SQL, Go, Rust, Java, Kotlin, Swift, C and its family,
PHP, Ruby, Dockerfiles, TOML, GraphQL, diffs — and the short forms people actually type, so
\`\`\`sh, \`\`\`yml and \`\`\`tsx all land where you would expect.

A language nobody registered, or a fence with no language at all, is the plain code block it has
always been. Nothing guesses: a highlighter asked to identify a three-line config file will
cheerfully decide it is Perl, and a wrong colour is worse than none.

## In the file, not in a stylesheet you have to keep

The colours ship inside the exported document like every other style it carries, so a saved file
opens coloured on a machine with no network.`,
      },
    },
  },
  {
    date: '2026-09-19',
    title: 'Maths between dollar signs',
    slug: 'math-in-markdown',
    body:
      'Write $E = mc^2$ in a sentence, put a formula between $$ on its own lines, or use LaTeX\'s '
      + 'own delimiters and environments, and it is set as maths — in the preview, in the file you '
      + 'download, in a shared link and in what the API returns. A price written as $5 to $10 is '
      + 'still a price.',
    detail: {
      en: {
        description:
          'TeX between dollar signs is now typeset wherever a document is shown, and it needs no '
          + 'stylesheet and no fonts to do it.',
        keywords:
          'markdown math to html, render latex in markdown, katex markdown converter, '
          + 'mathml export, convert equations markdown',
        body: `\`$…$\` in a line and \`$$…$$\` on lines of their own are read as TeX and typeset with
KaTeX.

## And LaTeX's own delimiters

\`\\( … \\)\` for a formula in a sentence, \`\\[ … \\]\` for one on a line of its own, and the
environments themselves — \`\\begin{equation}\`, \`\\begin{align}\`, \`gather\`, \`multline\`,
\`alignat\` and their starred forms — handed to KaTeX whole, so aligned equations line up on the
equals sign the way they were written to.

These are what a paper, a thesis or anything written near LaTeX actually uses, and they almost
never begin a paragraph: people write the sentence introducing the formula and the delimiter on
the next line, with no blank line between. Markdown reads that as one paragraph, so they are
found wherever they turn up in a line rather than only at the start of a block.

What is not read is the rest of LaTeX. \`\\section\`, \`\\textbf\`, \`\\begin{itemize}\` and the
preamble are a document format, not maths, and this converts Markdown. Paste a whole .tex file
and the formulas in it will set; the commands around them stay as text.

## Everywhere, not only on screen

This one renders the same in every place a document is built, because KaTeX runs in a server as
happily as in a browser. The preview, the downloaded .html, a shared link and the API's own HTML
all carry the same formula, worked out once, with no second pass anywhere.

## What travels inside the file

MathML — the maths vocabulary browsers lay out themselves — rather than KaTeX's own HTML. The
difference matters exactly once, and it is the moment somebody saves the file: KaTeX's HTML is a
stack of positioned boxes that means nothing without a stylesheet and the better part of a
megabyte of fonts, and a document that carries those has stopped being a document. MathML needs
neither. A formula in a saved file opens correctly on a machine with no network, which is what
every other part of that file already promised.

It is also text. The formula can be selected and copied, a screen reader reads it as maths rather
than as a picture, and the TeX you typed is kept alongside it inside the document.

## A price is not a formula

Two dollar signs in one line are how most tools decide something is maths, and it is why "it
costs $5 to $10" comes out of some of them as one long italic formula. Here the text between the
dollars has to look like maths — operators and short symbols once its commands are accounted for,
rather than words — or the dollars stay dollars. Three letters in a row that no command or brace
explains means a sentence.

Half-written TeX keeps its source too, rather than being replaced by an error.`,
      },
    },
  },
  {
    date: '2026-09-19',
    title: 'The sign-in dialog says what an account is for',
    body:
      'It was the shape every product ships — an envelope in one box, a padlock in the next, and '
      + 'a narrow column with no room in it. There is now a panel beside the form listing what '
      + 'signing in actually gets you: the history, shareable links, a key for the API and the '
      + 'extension. The form beside it has room to breathe, and on a phone it stands alone.',
  },
  {
    date: '2026-09-19',
    title: 'Mermaid diagrams are drawn, not printed as code',
    slug: 'mermaid-diagrams',
    body:
      'A ```mermaid fence used to come out of every conversion as a block of text. It is now a '
      + 'picture — in the preview, in the .html you download and in what you print — and the '
      + 'picture follows the theme you are reading in. A fence that does not parse keeps its '
      + 'source, which is the thing worth seeing when a diagram is wrong.',
    detail: {
      en: {
        description:
          'Flowcharts, sequence diagrams and the rest of Mermaid now render wherever a document is '
          + 'shown in a browser, and travel inside the file you download.',
        keywords:
          'mermaid to html, render mermaid diagrams, markdown flowchart converter, '
          + 'mermaid sequence diagram, export mermaid as html',
        body: `Anything written inside a \`\`\`mermaid fence — a flowchart, a sequence diagram, a
state machine, a Gantt chart, a pie — is now drawn.

## Where it is drawn

In the preview, as you convert. In the .html file you download, with the diagram inside the file
rather than fetched from anywhere — the same promise the rest of that file already made. And in
what the print button hands to your PDF writer, where the diagram is drawn on the light palette
the printed page uses, whatever the screen was set to.

Switch the theme and the diagram is drawn again in the other palette, rather than staying dark on
a white page.

## Where it is not

A diagram is laid out by measuring text, and measuring text needs a browser. A document rendered
by the API or opened through a shared link is built by a server that has none, so a fence there
still shows its source. That is the honest fallback and not a placeholder: the source of a
diagram is readable, which an empty box is not.

## When a fence is wrong

It keeps its source and nothing is replaced. Mermaid has an error graphic of its own for this and
it is switched off here, because a half-written diagram is something you are still editing, and
the text you are editing is more use on screen than a picture of the word "error".

## What is not carried across

Labels are drawn as text rather than as HTML laid inside the picture. Mermaid can do the latter,
and it buys richer labels, at the cost of a file that draws correctly in a browser and nowhere
else — not in an editor, not in most PDF tools, not in a word processor. A diagram that survives
being emailed is worth more here than a bold word in a box.`,
      },
    },
  },
  {
    date: '2026-09-19',
    title: 'The blog reads in all five languages',
    body:
      'All sixty-three articles now exist in English, German, French, Spanish and Italian — 315 in '
      + 'all. They are written rather than machine-translated: the prose is rebuilt, the search '
      + 'terms are the ones a reader of that language actually types, and each language keeps its '
      + 'own conventions, down to which quotation marks it uses.',
  },
  {
    date: '2026-09-18',
    title: 'The whole blog reads in French',
    slug: 'blog-in-french',
    detail: {
      en: {
        description:
          'Every article on the TransformPipe blog now has a French text of its own, written for French readers rather than machine-translated, with dates and links unchanged.',
        keywords:
          'markdown guides in french, french markdown blog, markdown documentation translated, markdown tutorials in french, multilingual markdown blog',
        body: `\`/fr/blog\` is now the whole index and not a shelf with four things on it: every piece that exists in English exists in French, at the same address with a \`/fr\` in front of it. German has the same. Spanish and Italian have four articles each, and are listed as four.

### What a translation is here

Not a pass through a machine. The register is French, sentences are rebuilt where a literal one would read as English wearing French words, and the search terms are the phrases somebody types in French rather than the English phrases translated. The description is written to length for French, which runs longer than English, instead of being trimmed out of the original.

What is identical: the date the piece was written, every link target, every code block, every table, and every "checked on" citation, which keeps the date it was actually checked on. A translation is not a new article and is not dated as one.

### The address does not change

\`/fr/blog/markdown-escaping\` is the French text of \`/blog/markdown-escaping\`. The language is the prefix and the slug after it is the same in every language, so a cross-reference between two articles does not depend on which language you happen to be reading. A link in the prose points at the French page when there is one and at the English page when there is not, which is why a half-finished language has no dead ends in it.

The tags are translated one word at a time and the same word every time — Conversion, Syntaxe, Publication, Sécurité, Automatisation, Code, Workflow. The filter chips on the index are built from whatever the articles say, so two spellings would make two chips.

### What is still English

The API and the connector answer in one language, and that language is English. So does the page a share link opens, which the server renders for a reader it knows nothing about — there is nothing to pick a language from there but \`Accept-Language\`, and guessing wrong is worse than English.

And Spanish and Italian, for fifty-nine of the sixty-three. An article a language does not have is not listed in that language, not linked to, and claims no \`hreflang\`: a crawler follows an alternate that was never written and finds nothing, which is worse than claiming nothing at all.

Related: [escaping characters in Markdown](/blog/markdown-escaping), and [CommonMark, GFM and the flavours](/blog/commonmark-gfm-and-the-flavours).`,
      },
      de: {
        title: 'Der ganze Blog liest sich auf Französisch',
        summary: `Alle dreiundsechzig Artikel liegen jetzt neben dem englischen und dem deutschen Text auch auf Französisch vor. Sie sind geschrieben und nicht maschinell übersetzt: Die Prosa ist neu gebaut statt übertragen, und die Suchbegriffe sind die, die ein französischer Leser wirklich eingibt — während Datum, Links, Code und jede Prüfangabe genau so bleiben, wie sie waren.`,
        description:
          'Jeder Artikel im TransformPipe-Blog hat jetzt einen französischen Text: für das Französische geschrieben statt maschinell übersetzt, Daten und Links unverändert.',
        keywords:
          'markdown blog auf französisch, markdown anleitungen französisch, mehrsprachige markdown dokumentation, markdown blog sprachen, übersetzte markdown artikel',
        body: `\`/fr/blog\` ist jetzt das vollständige Verzeichnis und kein Regal mit vier Stücken darauf: Was es auf Englisch gibt, gibt es auf Französisch, unter derselben Adresse mit einem \`/fr\` davor. Für Deutsch gilt dasselbe. Spanisch und Italienisch haben je vier Artikel und führen auch vier.

### Was hier eine Übersetzung ist

Kein Durchlauf durch eine Maschine. Das Register ist französisch, Sätze werden neu gebaut, wo ein wörtlicher wie Englisch in französischen Wörtern klingen würde, und die Suchbegriffe sind die Wendungen, die jemand auf Französisch eingibt, nicht die übersetzten englischen. Die Beschreibung wird für das Französische auf Länge geschrieben, das länger läuft als das Englische, und nicht aus dem Original gekürzt.

Gleich bleibt: das Datum, an dem das Stück entstand, jedes Linkziel, jeder Codeblock, jede Tabelle und jede Prüfangabe mit dem Tag, an dem tatsächlich nachgesehen wurde. Eine Übersetzung ist kein neuer Artikel und wird auch nicht als einer datiert.

### Die Adresse ändert sich nicht

\`/fr/blog/markdown-escaping\` ist der französische Text von \`/blog/markdown-escaping\`. Die Sprache steckt im Präfix, der Slug dahinter ist in jeder Sprache derselbe — ein Querverweis zwischen zwei Artikeln hängt also nicht daran, in welcher Sprache Sie gerade lesen. Ein Link in der Prosa zeigt auf die französische Seite, wo es eine gibt, und auf die englische, wo nicht; deshalb hat eine halb fertige Sprache keine toten Enden.

Die Tags werden Wort für Wort übersetzt und jedes Mal gleich — Conversion, Syntaxe, Publication, Sécurité, Automatisation, Code, Workflow. Die Filter-Chips im Verzeichnis entstehen aus dem, was die Artikel sagen; zwei Schreibweisen wären zwei Chips.

### Was weiterhin englisch ist

Die API und der Konnektor antworten in einer Sprache, und diese Sprache ist Englisch. Ebenso die Seite, die ein Freigabelink öffnet: Der Server baut sie für einen Leser, über den er nichts weiß, und dort gibt es außer \`Accept-Language\` nichts, woraus sich eine Sprache wählen ließe — falsch zu raten wäre schlechter als Englisch.

Und Spanisch und Italienisch, für neunundfünfzig der dreiundsechzig Stücke. Ein Artikel, den eine Sprache nicht hat, wird in ihr nicht geführt, nicht verlinkt und beansprucht kein \`hreflang\`: Ein Crawler folgt einer Alternative, die nie geschrieben wurde, und findet nichts — schlechter, als gar nichts zu behaupten.

Weiter: [Zeichen in Markdown maskieren](/blog/markdown-escaping) und [CommonMark, GFM und die Dialekte](/blog/commonmark-gfm-and-the-flavours).`,
      },
      fr: {
        title: 'Tout le blog se lit en français',
        summary: `Les soixante-trois articles existent désormais en français à côté de l’anglais et de l’allemand. Ils sont écrits et non traduits à la machine : la prose est rebâtie plutôt que transposée, et les termes de recherche sont ceux qu’un lecteur français tape vraiment — tandis que les dates, les liens, le code et chaque mention de vérification restent exactement ce qu’ils étaient.`,
        description:
          'Chaque article du blog TransformPipe possède désormais son propre texte français, écrit pour des lecteurs francophones plutôt que traduit à la machine.',
        keywords:
          'blog markdown en français, guides markdown en français, tutoriels markdown français, documentation markdown traduite, blog markdown multilingue',
        body: `\`/fr/blog\` est désormais l’index complet et non une étagère avec quatre choses dessus : tout ce qui existe en anglais existe en français, à la même adresse avec un \`/fr\` devant. L’allemand est dans le même cas. L’espagnol et l’italien comptent quatre articles chacun, et en affichent quatre.

### Ce qu’est une traduction ici

Pas un passage à la machine. Le registre est français, les phrases sont rebâties là où une version littérale se lirait comme de l’anglais habillé de mots français, et les termes de recherche sont les tournures que quelqu’un tape en français plutôt que les tournures anglaises traduites. La description est écrite à la longueur du français, qui court plus long que l’anglais, au lieu d’être rognée dans l’original.

Ce qui reste identique : la date à laquelle le texte a été écrit, chaque cible de lien, chaque bloc de code, chaque tableau et chaque mention de vérification, qui garde le jour où la vérification a réellement eu lieu. Une traduction n’est pas un nouvel article et n’est pas datée comme tel.

### L’adresse ne change pas

\`/fr/blog/markdown-escaping\` est le texte français de \`/blog/markdown-escaping\`. La langue tient dans le préfixe et le slug qui suit est le même dans toutes les langues : un renvoi d’un article à un autre ne dépend donc pas de la langue dans laquelle vous lisez. Un lien dans la prose pointe vers la page française quand elle existe et vers l’anglaise quand elle n’existe pas, et c’est pourquoi une langue à moitié faite n’a aucune impasse.

Les tags sont traduits mot à mot, et du même mot chaque fois — Conversion, Syntaxe, Publication, Sécurité, Automatisation, Code, Workflow. Les puces de filtre de l’index sont construites à partir de ce que disent les articles : deux orthographes feraient deux puces.

### Ce qui reste en anglais

L’API et le connecteur répondent dans une seule langue, et cette langue est l’anglais. De même la page qu’ouvre un lien de partage, que le serveur rend pour un lecteur dont il ne sait rien : il n’y a là que \`Accept-Language\` d’où tirer une langue, et se tromper vaut moins bien que l’anglais.

Et l’espagnol et l’italien, pour cinquante-neuf des soixante-trois textes. Un article qu’une langue n’a pas n’est pas listé dans cette langue, n’est pas lié et ne revendique aucun \`hreflang\` : un robot suit une alternative qui n’a jamais été écrite et ne trouve rien, ce qui est pire que de ne rien annoncer du tout.

Autres lectures : [échapper les caractères en Markdown](/blog/markdown-escaping) et [CommonMark, GFM et les dialectes](/blog/commonmark-gfm-and-the-flavours).`,
      },
      es: {
        title: 'Todo el blog se lee en francés',
        summary: `Los sesenta y tres artículos existen ya en francés junto al inglés y al alemán. Están escritos, no traducidos a máquina: la prosa se reconstruye en lugar de transponerse y los términos de búsqueda son los que un lector francés teclea de verdad, mientras que las fechas, los enlaces, el código y cada cita de comprobación quedan exactamente como estaban.`,
        description:
          'Cada artículo del blog de TransformPipe tiene ya su propio texto en francés, escrito para lectores franceses en vez de traducido a máquina.',
        keywords:
          'blog de markdown en francés, guías de markdown traducidas, tutoriales de markdown en francés, documentación de markdown multilingüe, blog de markdown en varios idiomas',
        body: `\`/fr/blog\` es ya el índice entero y no un estante con cuatro cosas encima: lo que existe en inglés existe en francés, en la misma dirección con un \`/fr\` delante. Con el alemán ocurre lo mismo. El español y el italiano tienen cuatro artículos cada uno, y listan cuatro.

### Qué es aquí una traducción

No un paso por una máquina. El registro es francés, las frases se reconstruyen allí donde una versión literal sonaría a inglés vestido de palabras francesas, y los términos de búsqueda son los que alguien teclea en francés, no los ingleses traducidos. La descripción se escribe a la medida del francés, que corre más largo que el inglés, en vez de recortarse del original.

Lo que no cambia: la fecha en que se escribió el texto, cada destino de enlace, cada bloque de código, cada tabla y cada cita de comprobación, que conserva el día en que de verdad se comprobó. Una traducción no es un artículo nuevo y no se fecha como tal.

### La dirección no cambia

\`/fr/blog/markdown-escaping\` es el texto francés de \`/blog/markdown-escaping\`. El idioma va en el prefijo y el slug que viene detrás es el mismo en todos los idiomas, así que una remisión de un artículo a otro no depende del idioma en el que se esté leyendo. Un enlace dentro del texto apunta a la página francesa cuando existe y a la inglesa cuando no, y por eso un idioma a medio hacer no tiene callejones sin salida.

Las etiquetas se traducen palabra por palabra, y con la misma palabra siempre: Conversion, Syntaxe, Publication, Sécurité, Automatisation, Code, Workflow. Los filtros del índice se construyen con lo que dicen los artículos, de modo que dos grafías darían dos filtros.

### Qué sigue en inglés

La API y el conector responden en un solo idioma, y ese idioma es el inglés. También la página que abre un enlace compartido, que el servidor compone para un lector del que no sabe nada: allí no hay más que \`Accept-Language\` de donde sacar un idioma, y equivocarse es peor que el inglés.

Y el español y el italiano, en cincuenta y nueve de los sesenta y tres textos. Un artículo que un idioma no tiene no se lista en ese idioma, no se enlaza y no reclama ningún \`hreflang\`: un rastreador sigue una alternativa que nunca se escribió y no encuentra nada, lo cual es peor que no afirmar nada.

Relacionado: [escapar caracteres en Markdown](/blog/markdown-escaping) y [CommonMark, GFM y los dialectos](/blog/commonmark-gfm-and-the-flavours).`,
      },
      it: {
        title: 'Tutto il blog si legge in francese',
        summary: `Tutti e sessantatré gli articoli esistono ora in francese accanto all’inglese e al tedesco. Sono scritti, non tradotti a macchina: la prosa è ricostruita anziché trasposta e i termini di ricerca sono quelli che un lettore francese digita davvero, mentre le date, i link, il codice e ogni citazione di verifica restano esattamente com’erano.`,
        description:
          'Ogni articolo del blog di TransformPipe ha ora un testo francese proprio, scritto per chi legge in francese anziché tradotto a macchina, con date e link invariati.',
        keywords:
          'blog markdown in francese, guide markdown tradotte, tutorial markdown in francese, documentazione markdown multilingue, blog markdown in più lingue',
        body: `\`/fr/blog\` è ormai l’indice intero e non uno scaffale con quattro cose sopra: ciò che esiste in inglese esiste in francese, allo stesso indirizzo con un \`/fr\` davanti. Per il tedesco vale lo stesso. Spagnolo e italiano hanno quattro articoli ciascuno, e quattro ne elencano.

### Che cosa è qui una traduzione

Non un passaggio in una macchina. Il registro è francese, le frasi vengono ricostruite dove una versione letterale suonerebbe come inglese vestito di parole francesi, e i termini di ricerca sono le espressioni che qualcuno digita in francese, non quelle inglesi tradotte. La descrizione è scritta sulla lunghezza del francese, che corre più lungo dell’inglese, invece di essere ritagliata dall’originale.

Quello che resta identico: la data in cui il pezzo è stato scritto, ogni destinazione di link, ogni blocco di codice, ogni tabella e ogni citazione di verifica, che conserva il giorno in cui la verifica è stata fatta davvero. Una traduzione non è un articolo nuovo e non viene datata come tale.

### L’indirizzo non cambia

\`/fr/blog/markdown-escaping\` è il testo francese di \`/blog/markdown-escaping\`. La lingua sta nel prefisso e lo slug che segue è lo stesso in ogni lingua, quindi un rimando da un articolo all’altro non dipende dalla lingua in cui stai leggendo. Un link nel testo punta alla pagina francese dove c’è e a quella inglese dove non c’è: per questo una lingua a metà non ha vicoli ciechi.

I tag sono tradotti parola per parola, e sempre con la stessa parola — Conversion, Syntaxe, Publication, Sécurité, Automatisation, Code, Workflow. I filtri dell’indice nascono da ciò che dicono gli articoli: due grafie farebbero due filtri.

### Che cosa resta in inglese

L’API e il connettore rispondono in una sola lingua, e quella lingua è l’inglese. Così anche la pagina che apre un link di condivisione, che il server costruisce per un lettore di cui non sa nulla: lì non c’è altro che \`Accept-Language\` da cui ricavare una lingua, e sbagliare è peggio dell’inglese.

E lo spagnolo e l’italiano, per cinquantanove dei sessantatré pezzi. Un articolo che una lingua non ha non viene elencato in quella lingua, non viene collegato e non rivendica alcun \`hreflang\`: un crawler segue un’alternativa mai scritta e non trova nulla, il che è peggio che non dichiarare niente.

Da leggere: [come si fa l’escape dei caratteri in Markdown](/blog/markdown-escaping) e [CommonMark, GFM e i dialetti](/blog/commonmark-gfm-and-the-flavours).`,
      },
    },
    body:
      'All sixty-three articles now exist in French alongside the English and German. They are '
      + 'written rather than machine-translated: the prose is rebuilt rather than transposed, and '
      + 'the search terms are the ones a French reader actually types — while the dates, the '
      + 'links, the code and every checked-on citation stay exactly as they were.',
  },
  {
    date: '2026-09-18',
    title: 'Publishing a public link waits for a confirmed address',
    slug: 'public-links-need-a-confirmed-address',
    detail: {
      en: {
        description:
          'Publishing a TransformPipe document to a link anybody can open now needs a confirmed email address, on all three routes. Sharing with named people does not.',
        keywords:
          'confirm email before sharing a link, public share link verification, why can i not publish a link, email confirmation required to share, share a document without verifying email',
        body: `Two kinds of sharing live behind one dialog and they are not the same act. Naming addresses publishes nothing: each reader has to sign in as the address you named, so the document is handed to people you chose. A link puts a page at \`/s/<token>\` on our domain that anybody holding the URL can read, and that is a page on the open internet with somebody else's content on it.

### Why the second one is held back

An address nobody has proved cannot be recovered, cannot be told anything, and costs nothing to make a hundred of. A hundred of them publishing pages under our domain is the shape of a phishing campaign, and the domain is shared with everybody else using the product.

So two things wait for a confirmation and everything else does not: publishing to a link, and accumulating storage — an unconfirmed account keeps ten documents. Converting, downloading, the API, the connector and sharing with named people all work from the first minute.

### Confirming it

A six-digit code from the account menu, good for ten minutes. Signed in through Google there was never anything to confirm: the provider asserts the address, so those accounts could always publish.

The check is read at the moment of the request rather than carried on your session, which means confirming takes effect on your very next request instead of your next sign-in — the behaviour anybody expects after typing a code.

### Three doors, and two of them were open

A link can be published three ways: \`PUT /api/v1/documents/:id/share\`, \`POST /api/v1/documents?share=link\`, and the app's own \`PUT /api/documents/:id/share\`. Only the first of them asked. That is the actual fix here — the rule existed and had two holes in it, because a rule written three times is a rule maintained in one of them.

It is one function now and all three call it. A refusal is a 403 that says what to do: confirm the address, and note that sharing with named addresses works either way.

Related: [sharing a document as a link](/blog/share-a-markdown-document-as-a-link), and [whether an online converter is safe](/blog/is-an-online-converter-safe).`,
      },
      de: {
        title: 'Ein öffentlicher Link wartet auf eine bestätigte Adresse',
        summary: `Ein Dokument mit benannten Personen zu teilen funktioniert wie immer, ob die Adresse des Kontos bestätigt ist oder nicht. Es als Link zu veröffentlichen, den jeder öffnen kann, verlangt jetzt zuerst die Bestätigung — auf jedem Weg, der das kann, und genau das war der Fehler: Zwei der drei haben nicht gefragt.`,
        description:
          'Ein Dokument als Link zu veröffentlichen, den jeder öffnen kann, verlangt jetzt eine bestätigte E-Mail-Adresse. Das Teilen mit benannten Personen verlangt sie nicht.',
        keywords:
          'e-mail bestätigen vor dem teilen, öffentlicher freigabelink bestätigung, warum kann ich keinen link veröffentlichen, dokument teilen ohne bestätigte adresse, freigabelink e-mail bestätigung',
        body: `Hinter einem Dialog stecken zwei Arten des Teilens, und sie sind nicht dieselbe Handlung. Adressen zu benennen veröffentlicht nichts: Jeder Leser muss sich mit genau der benannten Adresse anmelden, das Dokument geht also an Personen, die Sie gewählt haben. Ein Link legt unter \`/s/<token>\` eine Seite auf unsere Domain, die jeder lesen kann, der die URL hat — eine Seite im offenen Internet mit dem Inhalt einer anderen Person darauf.

### Warum das Zweite zurückgehalten wird

Eine Adresse, die niemand nachgewiesen hat, lässt sich nicht wiederherstellen, ihr lässt sich nichts mitteilen, und hundert davon anzulegen kostet nichts. Hundert solcher Konten, die Seiten unter unserer Domain veröffentlichen, sehen aus wie eine Phishing-Kampagne — und die Domain teilen alle, die das Produkt benutzen.

Zwei Dinge warten deshalb auf eine Bestätigung und alles andere nicht: einen Link zu veröffentlichen und Speicher anzusammeln — ein unbestätigtes Konto behält zehn Dokumente. Konvertieren, Herunterladen, die API, der Konnektor und das Teilen mit benannten Adressen gehen ab der ersten Minute.

### Wie Sie bestätigen

Ein sechsstelliger Code aus dem Kontomenü, zehn Minuten gültig. Wer sich über Google anmeldet, hatte nie etwas zu bestätigen: Der Anbieter versichert die Adresse, solche Konten konnten immer veröffentlichen.

Geprüft wird im Moment der Anfrage und nicht anhand Ihrer Sitzung. Eine Bestätigung wirkt deshalb bei der nächsten Anfrage und nicht erst bei der nächsten Anmeldung — was nach dem Eintippen eines Codes auch jeder erwartet.

### Drei Türen, und zwei davon standen offen

Ein Link lässt sich auf drei Wegen veröffentlichen: \`PUT /api/v1/documents/:id/share\`, \`POST /api/v1/documents?share=link\` und der eigene Weg der App, \`PUT /api/documents/:id/share\`. Gefragt hat nur der erste. Das ist die eigentliche Korrektur: Die Regel gab es, und sie hatte zwei Löcher, weil eine dreimal geschriebene Regel nur an einer Stelle gepflegt wird.

Jetzt ist es eine Funktion, und alle drei rufen sie auf. Eine Ablehnung ist ein 403, der sagt, was zu tun ist: die Adresse bestätigen — und dass das Teilen mit benannten Adressen so oder so funktioniert.

Weiter: [ein Dokument als Link teilen](/blog/share-a-markdown-document-as-a-link) und [ob ein Online-Konverter sicher ist](/blog/is-an-online-converter-safe).`,
      },
      fr: {
        title: 'Publier un lien public attend une adresse confirmée',
        summary: `Partager un document avec des personnes nommées fonctionne comme toujours, que l’adresse du compte ait été confirmée ou non. Le publier sous un lien que n’importe qui peut ouvrir demande désormais la confirmation d’abord — sur toutes les voies qui le permettent, et c’est là qu’était le vrai défaut : deux des trois ne demandaient rien.`,
        description:
          'Publier un document TransformPipe sous un lien ouvert à tous exige désormais une adresse confirmée, sur les trois voies. Le partage nominatif, non.',
        keywords:
          'confirmer son adresse e-mail avant de partager, vérification du lien de partage public, pourquoi je ne peux pas publier un lien, confirmation e-mail pour partager un document, partager un document sans adresse vérifiée',
        body: `Deux sortes de partage vivent derrière un même dialogue, et ce ne sont pas le même acte. Nommer des adresses ne publie rien : chaque lecteur doit se connecter avec l’adresse que vous avez nommée, le document est donc remis à des personnes que vous avez choisies. Un lien, lui, pose sous \`/s/<token>\` une page de notre domaine que quiconque détient l’URL peut lire — une page sur l’internet ouvert, avec le contenu de quelqu’un d’autre dessus.

### Pourquoi la seconde est retenue

Une adresse que personne n’a prouvée ne peut pas être récupérée, ne peut rien recevoir, et il n’en coûte rien d’en fabriquer cent. Cent comptes de ce genre qui publient des pages sous notre domaine ont la forme d’une campagne d’hameçonnage, et ce domaine est partagé avec tous ceux qui utilisent le produit.

Deux choses attendent donc une confirmation, et rien d’autre : publier un lien, et accumuler du stockage — un compte non confirmé garde dix documents. Convertir, télécharger, l’API, le connecteur et le partage avec des adresses nommées marchent dès la première minute.

### Comment confirmer

Un code à six chiffres depuis le menu du compte, valable dix minutes. Qui se connecte par Google n’a jamais eu rien à confirmer : le fournisseur atteste l’adresse, et ces comptes ont toujours pu publier.

La vérification se lit au moment de la requête et n’est pas portée par votre session : une confirmation prend donc effet dès la requête suivante, et non à la prochaine connexion — ce que tout le monde attend après avoir tapé un code.

### Trois portes, dont deux étaient ouvertes

Un lien se publie de trois façons : \`PUT /api/v1/documents/:id/share\`, \`POST /api/v1/documents?share=link\` et la voie propre à l’application, \`PUT /api/documents/:id/share\`. Seule la première demandait quelque chose. C’est là la vraie correction : la règle existait et avait deux trous, parce qu’une règle écrite trois fois n’est entretenue qu’à un seul endroit.

C’est une seule fonction désormais, et les trois l’appellent. Un refus est un 403 qui dit quoi faire : confirmer l’adresse, en précisant que le partage avec des adresses nommées fonctionne de toute façon.

Autres lectures : [partager un document sous forme de lien](/blog/share-a-markdown-document-as-a-link) et [si un convertisseur en ligne est sûr](/blog/is-an-online-converter-safe).`,
      },
      es: {
        title: 'Publicar un enlace público espera a una dirección confirmada',
        summary: `Compartir un documento con personas nombradas funciona como siempre, esté confirmada o no la dirección de la cuenta. Publicarlo en un enlace que cualquiera puede abrir pide ahora la confirmación primero, por todas las vías que lo permiten: ahí estaba el fallo real, porque dos de las tres no preguntaban nada.`,
        description:
          'Publicar un documento de TransformPipe en un enlace que cualquiera puede abrir exige ya una dirección confirmada, por las tres vías. Compartir por nombre, no.',
        keywords:
          'confirmar el correo antes de compartir, verificación del enlace público, por qué no puedo publicar un enlace, confirmación de correo para compartir un documento, compartir un documento sin verificar el correo',
        body: `Detrás de un mismo diálogo viven dos maneras de compartir, y no son el mismo acto. Nombrar direcciones no publica nada: cada lector tiene que entrar con la dirección que nombraste, así que el documento se entrega a personas elegidas. Un enlace, en cambio, deja en \`/s/<token>\` una página de nuestro dominio que puede leer cualquiera que tenga la URL: una página en la internet abierta con el contenido de otra persona encima.

### Por qué se retiene la segunda

Una dirección que nadie ha demostrado no se puede recuperar, no se le puede comunicar nada y fabricar cien no cuesta nada. Cien cuentas así publicando páginas bajo nuestro dominio tienen la forma de una campaña de phishing, y ese dominio lo comparten todos los que usan el producto.

Dos cosas esperan, por tanto, a una confirmación, y ninguna más: publicar un enlace y acumular almacenamiento, porque una cuenta sin confirmar guarda diez documentos. Convertir, descargar, la API, el conector y compartir con direcciones nombradas funcionan desde el primer minuto.

### Cómo se confirma

Un código de seis cifras desde el menú de la cuenta, válido diez minutos. Quien entra con Google nunca tuvo nada que confirmar: el proveedor da fe de la dirección, y esas cuentas siempre pudieron publicar.

La comprobación se lee en el momento de la petición y no viaja en tu sesión, de modo que confirmar surte efecto en la petición siguiente y no en el siguiente inicio de sesión, que es lo que cualquiera espera después de teclear un código.

### Tres puertas, y dos estaban abiertas

Un enlace se publica por tres caminos: \`PUT /api/v1/documents/:id/share\`, \`POST /api/v1/documents?share=link\` y el propio de la aplicación, \`PUT /api/documents/:id/share\`. Solo el primero preguntaba. Esa es la corrección de verdad: la regla existía y tenía dos agujeros, porque una regla escrita tres veces se mantiene en una sola.

Ahora es una función, y las tres la llaman. Un rechazo es un 403 que dice qué hacer: confirmar la dirección, y avisa de que compartir con direcciones nombradas funciona de cualquier modo.

Relacionado: [compartir un documento como enlace](/blog/share-a-markdown-document-as-a-link) y [si un conversor en línea es seguro](/blog/is-an-online-converter-safe).`,
      },
      it: {
        title: 'Pubblicare un link pubblico attende un indirizzo confermato',
        summary: `Condividere un documento con persone indicate per nome funziona come sempre, che l’indirizzo dell’account sia confermato o no. Pubblicarlo come link che chiunque può aprire ora chiede prima la conferma, su ogni via che lo consente: era proprio questo il difetto, perché due delle tre non chiedevano nulla.`,
        description:
          'Pubblicare un documento TransformPipe come link aperto a chiunque richiede ora un indirizzo confermato, su tutte e tre le vie. La condivisione per nome no.',
        keywords:
          'confermare l’email prima di condividere, verifica del link di condivisione pubblico, perché non riesco a pubblicare un link, conferma email per condividere un documento, condividere un documento senza email verificata',
        body: `Dietro un solo dialogo stanno due modi di condividere, e non sono lo stesso atto. Indicare degli indirizzi non pubblica niente: ogni lettore deve accedere con l’indirizzo che hai indicato, quindi il documento va a persone che hai scelto. Un link invece mette sotto \`/s/<token>\` una pagina del nostro dominio che chiunque abbia l’URL può leggere: una pagina sull’internet aperta, con sopra il contenuto di un’altra persona.

### Perché il secondo viene trattenuto

Un indirizzo che nessuno ha dimostrato non si può recuperare, non gli si può comunicare niente, e farne cento non costa nulla. Cento account così che pubblicano pagine sotto il nostro dominio hanno la forma di una campagna di phishing, e quel dominio è condiviso con chiunque usi il prodotto.

Due cose attendono dunque una conferma, e nient’altro: pubblicare un link e accumulare spazio, perché un account non confermato tiene dieci documenti. Convertire, scaricare, l’API, il connettore e la condivisione con indirizzi indicati funzionano dal primo minuto.

### Come si conferma

Un codice a sei cifre dal menu dell’account, valido dieci minuti. Chi accede con Google non ha mai avuto nulla da confermare: il fornitore attesta l’indirizzo, e quegli account hanno sempre potuto pubblicare.

Il controllo viene letto nel momento della richiesta e non è portato dalla tua sessione: una conferma ha effetto già dalla richiesta successiva e non dal prossimo accesso, che è ciò che chiunque si aspetta dopo aver digitato un codice.

### Tre porte, e due erano aperte

Un link si pubblica in tre modi: \`PUT /api/v1/documents/:id/share\`, \`POST /api/v1/documents?share=link\` e la via propria dell’applicazione, \`PUT /api/documents/:id/share\`. Chiedeva soltanto il primo. È questa la correzione vera: la regola c’era e aveva due buchi, perché una regola scritta tre volte viene mantenuta in un punto solo.

Ora è una funzione sola, e tutte e tre la chiamano. Un rifiuto è un 403 che dice che cosa fare: confermare l’indirizzo, e che la condivisione con indirizzi indicati funziona in ogni caso.

Da leggere: [condividere un documento come link](/blog/share-a-markdown-document-as-a-link) e [se un convertitore online sia sicuro](/blog/is-an-online-converter-safe).`,
      },
    },
    body:
      'Sharing a document with named people works as it always has, whether or not the address on '
      + 'the account has been confirmed. Publishing one to a link anybody can open now asks for '
      + 'the confirmation first — on every route that can do it, which was the actual bug: two of '
      + 'the three were not asking.',
  },
  {
    date: '2026-09-18',
    title: 'A daily limit on share notices, and a rate limit on the rest',
    slug: 'share-notice-limits',
    detail: {
      en: {
        description:
          'An account may send fifty share notices a day, and every endpoint here answers 429 past sixty requests a minute. Access is never held back with the mail.',
        keywords:
          'share notice email limit, api rate limit 429, how many documents can i share a day, too many requests document api, retry-after rate limit',
        body: `Two counters, counting two different things, and it is worth knowing which one you have met. One is about mail leaving our domain; the other is about how fast anybody may ask this application for anything.

### Fifty notices a day, and a notice is not access

Adding somebody to a document writes the access. The email telling them is a courtesy on top of it, and the two were always separate here. Past fifty in a day the notice is simply not sent: the person is still added, the document still opens for them, and the response says which addresses were actually written to rather than claiming all of them.

Fifty is far above what sharing a document looks like and far below what a mailing looks like. What is being protected is not the cost of a send — it is the domain. A burst of unwanted mail signed by our SPF and DKIM ends with the sending domain disabled, and the first thing that stops working after that is the confirmation code somebody needs to sign in.

### Sixty requests a minute, now on the app too

The public API and the connector have counted calls per caller per minute for as long as they have existed, and answer \`429\` with a \`retry-after\` saying how many seconds until the minute turns. The app's own endpoints were left out of it on the grounds that only our pages call them — true of the pages and false of the endpoints. A session cookie is a credential like any other, and those routes write to the database, send mail and make outbound requests.

They are counted by account where there is one and by address where there is not, so one runaway script cannot spend somebody else's allowance. An AI summary has its own smaller budget, twenty a day, because that call costs money in a way an ordinary one does not.

### What it does not do

It does not queue. A request over the limit is refused, with the seconds to wait, and retrying is yours to do. It is also not a precise limiter: a row per caller per minute in Postgres means two calls arriving together can read the same count, which at this size is the right trade against running a second system beside the database.

And a counter that cannot be reached counts as room to spare. A limiter that locks everybody out when its own table is unavailable is worse than the thing it was guarding against.

Related: [sharing a document as a link](/blog/share-a-markdown-document-as-a-link), and [converting documents with an API](/blog/converting-documents-with-an-api).`,
      },
      de: {
        title: 'Ein Tageslimit für Freigabe-Benachrichtigungen, ein Ratenlimit für den Rest',
        summary: `Ein Konto darf fünfzig Freigabe-Benachrichtigungen am Tag senden. Jemanden zu einem Dokument hinzuzufügen geht auch darüber hinaus weiterhin — es kommt nur keine E-Mail mehr darüber. Die eigenen Endpunkte der App sind jetzt so ratenbegrenzt, wie es die öffentliche API immer war: Ein Skript in einer Schleife bekommt eine 429 statt allem, wonach es fragt.`,
        description:
          'Ein Konto darf fünfzig Freigabe-Benachrichtigungen am Tag senden, und jeder Endpunkt antwortet ab sechzig Anfragen pro Minute mit 429. Der Zugriff bleibt frei.',
        keywords:
          'limit für freigabe e-mails, api ratenlimit 429, wie viele dokumente pro tag teilen, zu viele anfragen dokumenten api, retry-after ratenbegrenzung',
        body: `Zwei Zähler, die zwei verschiedene Dinge zählen — und es lohnt zu wissen, an welchen von beiden Sie gestoßen sind. Der eine betrifft Post, die unsere Domain verlässt; der andere, wie schnell überhaupt jemand diese Anwendung etwas fragen darf.

### Fünfzig Benachrichtigungen am Tag, und eine Benachrichtigung ist kein Zugriff

Jemanden zu einem Dokument hinzuzufügen schreibt den Zugriff. Die E-Mail, die es ihm sagt, ist eine Höflichkeit obendrauf, und beides war hier immer getrennt. Jenseits von fünfzig am Tag wird die Benachrichtigung einfach nicht gesendet: Die Person ist trotzdem hinzugefügt, das Dokument öffnet sich für sie, und die Antwort nennt die Adressen, die wirklich angeschrieben wurden, statt alle zu behaupten.

Fünfzig liegt weit über dem, wie das Teilen eines Dokuments aussieht, und weit unter dem, wie ein Rundschreiben aussieht. Geschützt wird nicht der Preis eines Versands, sondern die Domain: Ein Schub unerwünschter Post, signiert mit unserem SPF und DKIM, endet damit, dass die Absenderdomain abgeschaltet wird — und das Erste, was danach nicht mehr funktioniert, ist der Bestätigungscode, den jemand zum Anmelden braucht.

### Sechzig Anfragen pro Minute, jetzt auch in der App

Die öffentliche API und der Konnektor zählen Aufrufe pro Aufrufer und Minute, solange es sie gibt, und antworten mit \`429\` und einem \`retry-after\`, das die Sekunden bis zur nächsten Minute nennt. Die eigenen Endpunkte der App waren davon ausgenommen, weil nur unsere Seiten sie aufrufen — was für die Seiten stimmt und für die Endpunkte nicht. Ein Sitzungscookie ist eine Zugangsberechtigung wie jede andere, und diese Routen schreiben in die Datenbank, senden Post und rufen nach außen.

Gezählt wird nach Konto, wo es eines gibt, und sonst nach Adresse: Ein außer Kontrolle geratenes Skript kann so nicht das Guthaben einer anderen Person verbrauchen. Eine KI-Zusammenfassung hat ihr eigenes, kleineres Budget von zwanzig am Tag, weil dieser Aufruf auf eine Weise Geld kostet, wie ein gewöhnlicher es nicht tut.

### Was es nicht tut

Es stellt nichts in eine Warteschlange. Eine Anfrage über dem Limit wird abgelehnt, mit den Sekunden, die zu warten sind; der erneute Versuch liegt bei Ihnen. Es ist auch kein exakter Begrenzer: Eine Zeile pro Aufrufer und Minute in Postgres heißt, dass zwei gleichzeitige Aufrufe denselben Stand lesen können — in dieser Größe der richtige Handel dafür, kein zweites System neben der Datenbank zu betreiben.

Und ein Zähler, der nicht erreichbar ist, gilt als Luft nach oben. Ein Begrenzer, der alle aussperrt, sobald seine eigene Tabelle fehlt, ist schlimmer als das, wovor er schützen sollte.

Weiter: [ein Dokument als Link teilen](/blog/share-a-markdown-document-as-a-link) und [Dokumente über eine API konvertieren](/blog/converting-documents-with-an-api).`,
      },
      fr: {
        title: 'Une limite quotidienne sur les avis de partage, et une limite de débit pour le reste',
        summary: `Un compte peut envoyer cinquante avis de partage par jour. Ajouter quelqu’un à un document fonctionne encore au-delà — la personne ne reçoit simplement pas d’e-mail. Les points d’accès propres à l’application sont désormais limités en débit comme l’API publique l’a toujours été : un script en boucle reçoit un 429 au lieu de tout ce qu’il demande.`,
        description:
          'Un compte envoie cinquante avis de partage par jour, et chaque point d’accès répond 429 au-delà de soixante requêtes par minute. L’accès n’est jamais retenu.',
        keywords:
          'limite d’e-mails de partage, limite de débit api 429, combien de documents puis-je partager par jour, trop de requêtes api documents, retry-after limite de requêtes',
        body: `Deux compteurs, qui comptent deux choses différentes, et il vaut la peine de savoir lequel vous avez atteint. L’un concerne le courrier qui quitte notre domaine ; l’autre, la vitesse à laquelle quiconque peut demander quoi que ce soit à cette application.

### Cinquante avis par jour, et un avis n’est pas un accès

Ajouter quelqu’un à un document écrit l’accès. L’e-mail qui le lui annonce est une courtoisie par-dessus, et les deux ont toujours été séparés ici. Au-delà de cinquante dans la journée, l’avis n’est simplement pas envoyé : la personne est ajoutée quand même, le document s’ouvre pour elle, et la réponse nomme les adresses réellement écrites au lieu de les revendiquer toutes.

Cinquante est très au-dessus de ce à quoi ressemble le partage d’un document, et très au-dessous de ce à quoi ressemble un publipostage. Ce qui est protégé n’est pas le prix d’un envoi, c’est le domaine : une salve de courrier non désiré signée par notre SPF et notre DKIM finit par la désactivation du domaine expéditeur, et la première chose qui cesse alors de fonctionner est le code de confirmation dont quelqu’un a besoin pour se connecter.

### Soixante requêtes par minute, maintenant dans l’application aussi

L’API publique et le connecteur comptent les appels par appelant et par minute depuis qu’ils existent, et répondent \`429\` avec un \`retry-after\` qui dit combien de secondes jusqu’au tour de la minute. Les points d’accès de l’application en étaient exclus au motif que seules nos pages les appellent — vrai des pages, faux des points d’accès. Un cookie de session est une autorisation comme une autre, et ces routes écrivent en base, envoient du courrier et appellent au-dehors.

Ils sont comptés par compte lorsqu’il y en a un et par adresse sinon, de sorte qu’un script emballé ne peut pas dépenser le quota d’une autre personne. Un résumé par IA a son propre budget, plus petit, vingt par jour, parce que cet appel coûte de l’argent comme un appel ordinaire n’en coûte pas.

### Ce que cela ne fait pas

Cela ne met rien en file d’attente. Une requête au-dessus de la limite est refusée, avec les secondes à attendre, et le nouvel essai vous revient. Ce n’est pas non plus un limiteur exact : une ligne par appelant et par minute dans Postgres signifie que deux appels arrivés ensemble peuvent lire le même compte — à cette taille, le bon marché face à un second système tenu à côté de la base.

Et un compteur inatteignable vaut de la marge. Un limiteur qui met tout le monde dehors dès que sa propre table manque est pire que ce dont il devait protéger.

Autres lectures : [partager un document sous forme de lien](/blog/share-a-markdown-document-as-a-link) et [convertir des documents avec une API](/blog/converting-documents-with-an-api).`,
      },
      es: {
        title: 'Un límite diario de avisos de compartición y un límite de peticiones para lo demás',
        summary: `Una cuenta puede enviar cincuenta avisos de compartición al día. Añadir a alguien a un documento sigue funcionando más allá de esa cifra: sencillamente no le llega ningún correo. Los puntos de acceso propios de la aplicación están ya limitados como siempre lo estuvo la API pública, así que un script en bucle recibe un 429 en vez de todo lo que pide.`,
        description:
          'Una cuenta envía cincuenta avisos de compartición al día y cada punto de acceso responde 429 pasadas sesenta peticiones por minuto. El acceso nunca se retiene.',
        keywords:
          'límite de correos de compartición, límite de peticiones api 429, cuántos documentos puedo compartir al día, demasiadas peticiones api de documentos, retry-after límite de peticiones',
        body: `Dos contadores, que cuentan dos cosas distintas, y conviene saber con cuál de ellos se ha topado. Uno tiene que ver con el correo que sale de nuestro dominio; el otro, con la velocidad a la que cualquiera puede pedirle algo a esta aplicación.

### Cincuenta avisos al día, y un aviso no es un acceso

Añadir a alguien a un documento escribe el acceso. El correo que se lo cuenta es una cortesía encima, y aquí las dos cosas siempre estuvieron separadas. Pasados cincuenta en un día, el aviso sencillamente no se envía: la persona queda añadida igualmente, el documento se le abre y la respuesta nombra las direcciones a las que de verdad se escribió en lugar de reclamarlas todas.

Cincuenta está muy por encima de lo que parece compartir un documento y muy por debajo de lo que parece un envío masivo. Lo que se protege no es el precio de un envío, sino el dominio: una tanda de correo no deseado firmada por nuestro SPF y nuestro DKIM termina con el dominio remitente desactivado, y lo primero que deja de funcionar después es el código de confirmación que alguien necesita para entrar.

### Sesenta peticiones por minuto, ahora también en la aplicación

La API pública y el conector cuentan llamadas por llamante y por minuto desde que existen, y responden \`429\` con un \`retry-after\` que dice cuántos segundos faltan para que gire el minuto. Los puntos de acceso de la aplicación quedaban fuera con el argumento de que solo los llaman nuestras páginas: cierto de las páginas y falso de los puntos de acceso. Una cookie de sesión es una credencial como cualquier otra, y esas rutas escriben en la base de datos, mandan correo y hacen peticiones hacia fuera.

Se cuentan por cuenta cuando la hay y por dirección cuando no, de modo que un script desbocado no puede gastarse el cupo de otra persona. Un resumen por IA tiene su propio presupuesto, más pequeño, veinte al día, porque esa llamada cuesta dinero de una manera en que una corriente no lo cuesta.

### Lo que no hace

No pone nada en cola. Una petición por encima del límite se rechaza, con los segundos que hay que esperar, y reintentar corre de tu cuenta. Tampoco es un limitador exacto: una fila por llamante y minuto en Postgres significa que dos llamadas que llegan juntas pueden leer la misma cifra, lo cual a este tamaño es el cambio correcto frente a mantener un segundo sistema al lado de la base de datos.

Y un contador al que no se llega cuenta como margen de sobra. Un limitador que deja a todo el mundo fuera cuando falta su propia tabla es peor que aquello de lo que protegía.

Relacionado: [compartir un documento como enlace](/blog/share-a-markdown-document-as-a-link) y [convertir documentos con una API](/blog/converting-documents-with-an-api).`,
      },
      it: {
        title: 'Un limite giornaliero sugli avvisi di condivisione, e un limite di frequenza per il resto',
        summary: `Un account può inviare cinquanta avvisi di condivisione al giorno. Aggiungere qualcuno a un documento funziona anche oltre: semplicemente non parte nessuna email. Gli endpoint propri dell’applicazione sono ora limitati per frequenza come l’API pubblica lo è sempre stata, così uno script in ciclo riceve un 429 invece di tutto ciò che chiede.`,
        description:
          'Un account invia cinquanta avvisi di condivisione al giorno e ogni endpoint risponde 429 oltre sessanta richieste al minuto. L’accesso non viene mai trattenuto.',
        keywords:
          'limite email di condivisione, limite di frequenza api 429, quanti documenti posso condividere al giorno, troppe richieste api documenti, retry-after limite richieste',
        body: `Due contatori, che contano due cose diverse, e vale la pena sapere in quale dei due sei incappato. Uno riguarda la posta che lascia il nostro dominio; l’altro, la velocità con cui chiunque può chiedere qualcosa a questa applicazione.

### Cinquanta avvisi al giorno, e un avviso non è un accesso

Aggiungere qualcuno a un documento scrive l’accesso. L’email che glielo comunica è una cortesia in più, e qui le due cose sono sempre state separate. Oltre i cinquanta in un giorno l’avviso semplicemente non parte: la persona è aggiunta lo stesso, il documento si apre per lei, e la risposta indica gli indirizzi a cui si è davvero scritto invece di rivendicarli tutti.

Cinquanta sta molto sopra a ciò che somiglia alla condivisione di un documento e molto sotto a ciò che somiglia a un invio di massa. Quello che si protegge non è il costo di un invio, ma il dominio: una raffica di posta indesiderata firmata dal nostro SPF e dal nostro DKIM finisce con il dominio mittente disattivato, e la prima cosa a smettere di funzionare, dopo, è il codice di conferma che serve a qualcuno per accedere.

### Sessanta richieste al minuto, ora anche nell’applicazione

L’API pubblica e il connettore contano le chiamate per chiamante e per minuto da quando esistono, e rispondono \`429\` con un \`retry-after\` che dice quanti secondi mancano allo scoccare del minuto. Gli endpoint propri dell’applicazione ne erano esclusi perché solo le nostre pagine li chiamano: vero delle pagine, falso degli endpoint. Un cookie di sessione è una credenziale come un’altra, e quelle rotte scrivono nel database, mandano posta e chiamano all’esterno.

Vengono contati per account dove ce n’è uno e per indirizzo dove non c’è, così uno script impazzito non può spendere il credito di un’altra persona. Un riassunto con l’IA ha un budget proprio e più piccolo, venti al giorno, perché quella chiamata costa denaro in un modo in cui una ordinaria non lo costa.

### Che cosa non fa

Non mette nulla in coda. Una richiesta oltre il limite viene rifiutata, con i secondi da aspettare, e riprovare tocca a te. Non è nemmeno un limitatore esatto: una riga per chiamante e per minuto in Postgres significa che due chiamate arrivate insieme possono leggere lo stesso conteggio, che a questa scala è lo scambio giusto rispetto a tenere un secondo sistema accanto al database.

E un contatore irraggiungibile vale come margine disponibile. Un limitatore che chiude fuori tutti quando manca la sua stessa tabella è peggio di ciò da cui doveva proteggere.

Da leggere: [condividere un documento come link](/blog/share-a-markdown-document-as-a-link) e [convertire documenti con un’API](/blog/converting-documents-with-an-api).`,
      },
    },
    body:
      'An account may send fifty share notices a day. Adding somebody to a document still works '
      + 'past that — they simply get no email about it. The app\'s own endpoints are now rate '
      + 'limited the way the public API has always been, so a script in a loop gets a 429 instead '
      + 'of everything it asks for.',
  },
  {
    date: '2026-09-18',
    title: 'Install it, and it works without a network',
    slug: 'install-as-an-app',
    detail: {
      en: {
        description:
          'TransformPipe installs as an app in Chrome, Edge and Safari, opens in its own window, and converts documents with no connection at all.',
        keywords:
          'offline markdown converter, install markdown converter as an app, markdown to html without internet, progressive web app document converter, convert documents offline',
        body: `Most web apps that install are a shortcut with extra steps: the window is different and the offline behaviour is a spinner. This one is the opposite case — the thing that needed the network was never the conversion, it was fetching the page.

### Why it works with no connection

Every conversion here has always run in the browser — the Markdown parser, the HTML reader, the \`.docx\` and \`.xlsx\` readers, the zip reader for a Notion or Obsidian export. None of them ever needed a server, which is the same reason nothing you convert is uploaded. Installing simply removes the last thing that needed the network: fetching the page itself.

So an installed copy opened on a plane, on a train, or on a locked-down machine starts, accepts a file, converts it, and downloads the result. A page you visited before is cached at its own address, so the documentation and the articles you have read are there too.

### What still needs the network

Anything that involves the account: the saved document list, saving, sharing, the AI summary, and signing in. Those are asked for the moment you use them, and say so plainly when there is no connection rather than hanging.

Nothing about the account's data is cached — \`/api\` is never stored, and neither is a shared document at \`/s/\`. A cache that held somebody's documents on a shared machine would be a worse bargain than a slower page.

### It changes nothing if you do not install it

The site is the same site. Installing is an option the browser offers once the page says it is installable; ignoring it costs nothing, and uninstalling leaves no trace beyond the browser's own cache.

Related: [what a Markdown to HTML converter is for](/blog/markdown-to-html-converter), and [whether an online converter is safe](/blog/is-an-online-converter-safe).`,
      },
      de: {
        title: 'Installieren Sie es, und es arbeitet ohne Netz',
        summary: `Chrome, Edge und Safari bieten inzwischen an, TransformPipe als App zu installieren — eigenes Fenster, eigenes Symbol, keine Adresszeile. Ohne Verbindung geöffnet startet es trotzdem und konvertiert trotzdem: jede Konvertierung läuft ohnehin im Browser. Dokumente im Konto brauchen das Netz, wie eh und je.`,
        description:
          'TransformPipe lässt sich in Chrome, Edge und Safari als App installieren, öffnet ein eigenes Fenster und konvertiert Dokumente ganz ohne Verbindung.',
        keywords:
          'markdown konverter offline, markdown konverter als app installieren, markdown in html ohne internet, dokumente offline konvertieren, progressive web app dokumentenkonverter',
        body: `Die meisten Web-Apps, die sich installieren lassen, sind eine Verknüpfung mit Zusatzschritten: das Fenster sieht anders aus, und offline erscheint ein Ladekreis. Hier liegt es umgekehrt — was das Netz brauchte, war nie die Konvertierung, sondern das Laden der Seite selbst.

### Warum es ohne Verbindung funktioniert

Jede Konvertierung hier lief schon immer im Browser — der Markdown-Parser, der HTML-Leser, die Leser für \`.docx\` und \`.xlsx\`, der Zip-Leser für einen Notion- oder Obsidian-Export. Keiner von ihnen hat je einen Server gebraucht, und aus demselben Grund wird nichts hochgeladen, was Sie konvertieren. Die Installation nimmt nur noch das Letzte weg, das ein Netz brauchte: die Seite selbst zu laden.

Eine installierte Kopie startet also im Flugzeug, im Zug oder auf einem abgeschotteten Rechner, nimmt eine Datei an, konvertiert sie und lädt das Ergebnis herunter. Eine Seite, die Sie vorher besucht haben, liegt unter ihrer eigenen Adresse im Cache — die Dokumentation und die Artikel, die Sie gelesen haben, sind also ebenfalls da.

### Was weiterhin ein Netz braucht

Alles, was am Konto hängt: die Liste der gespeicherten Dokumente, das Speichern, das Teilen, die KI-Zusammenfassung und das Anmelden. Das wird in dem Moment angefragt, in dem Sie es benutzen, und sagt ohne Verbindung klar, dass es gerade nicht geht, statt hängen zu bleiben.

Nichts von den Daten des Kontos liegt im Cache — \`/api\` wird nie gespeichert, und ein geteiltes Dokument unter \`/s/\` ebenso wenig. Ein Cache, der auf einem gemeinsam genutzten Rechner die Dokumente einer Person aufbewahrt, wäre ein schlechteres Geschäft als eine langsamere Seite.

### Ohne Installation ändert sich nichts

Die Seite bleibt dieselbe Seite. Die Installation ist ein Angebot, das der Browser macht, sobald die Seite sich als installierbar meldet; sie zu ignorieren kostet nichts, und eine Deinstallation hinterlässt nichts außer dem Cache des Browsers selbst.

Weiter: [wozu ein Markdown-nach-HTML-Konverter da ist](/blog/markdown-to-html-converter) und [ob ein Online-Konverter sicher ist](/blog/is-an-online-converter-safe).`,
      },
      fr: {
        title: 'Installez-le, et il fonctionne sans réseau',
        summary: `Chrome, Edge et Safari proposent désormais d’installer TransformPipe comme une application — sa propre fenêtre, sa propre icône, pas de barre d’adresse. Ouvert sans connexion, il démarre quand même et convertit quand même : chaque conversion tourne de toute façon dans le navigateur. Les documents du compte, eux, demandent le réseau, comme toujours.`,
        description:
          'TransformPipe s’installe comme une application dans Chrome, Edge et Safari, s’ouvre dans sa propre fenêtre et convertit des documents sans aucune connexion.',
        keywords:
          'convertisseur markdown hors ligne, installer un convertisseur markdown comme application, markdown en html sans internet, convertir des documents hors connexion, application web progressive de conversion',
        body: `La plupart des applications web qui s’installent sont un raccourci avec des étapes en plus : la fenêtre change, et le comportement hors ligne est un rond qui tourne. Ici, c’est le cas inverse — ce qui demandait le réseau n’a jamais été la conversion, c’était le chargement de la page.

### Pourquoi cela fonctionne sans connexion

Chaque conversion faite ici a toujours tourné dans le navigateur : l’analyseur Markdown, le lecteur HTML, les lecteurs de \`.docx\` et de \`.xlsx\`, le lecteur d’archive pour un export Notion ou Obsidian. Aucun d’eux n’a jamais eu besoin d’un serveur, et c’est la même raison qui fait que rien de ce que vous convertissez n’est envoyé. L’installation retire simplement la dernière chose qui demandait le réseau : charger la page elle-même.

Une copie installée, ouverte dans un avion, dans un train ou sur une machine verrouillée, démarre donc, accepte un fichier, le convertit et télécharge le résultat. Une page déjà visitée est en cache à sa propre adresse : la documentation et les articles que vous avez lus sont là eux aussi.

### Ce qui demande encore le réseau

Tout ce qui touche au compte : la liste des documents enregistrés, l’enregistrement, le partage, le résumé par IA et la connexion. Ces choses-là sont demandées au moment où vous vous en servez, et disent clairement qu’il n’y a pas de connexion au lieu de rester suspendues.

Rien des données du compte n’est mis en cache — \`/api\` n’est jamais stocké, et un document partagé sous \`/s/\` pas davantage. Un cache qui garderait les documents de quelqu’un sur une machine partagée serait un marché plus mauvais qu’une page plus lente.

### Sans installation, rien ne change

Le site reste le même site. L’installation est une option que le navigateur propose dès que la page se déclare installable ; l’ignorer ne coûte rien, et la désinstallation ne laisse rien derrière elle, hormis le cache du navigateur lui-même.

Autres lectures : [à quoi sert un convertisseur Markdown vers HTML](/blog/markdown-to-html-converter) et [si un convertisseur en ligne est sûr](/blog/is-an-online-converter-safe).`,
      },
      es: {
        title: 'Instálalo y funciona sin red',
        summary: `Chrome, Edge y Safari ofrecen ya instalar TransformPipe como aplicación: ventana propia, icono propio, sin barra de direcciones. Abierto sin conexión arranca igualmente y convierte igualmente, porque cada conversión corre de todos modos en el navegador. Los documentos de la cuenta necesitan la red, como siempre.`,
        description:
          'TransformPipe se instala como aplicación en Chrome, Edge y Safari, se abre en su propia ventana y convierte documentos sin conexión de ninguna clase.',
        keywords:
          'conversor de markdown sin conexión, instalar un conversor de markdown como aplicación, markdown a html sin internet, convertir documentos sin conexión, aplicación web progresiva para convertir documentos',
        body: `Casi todas las aplicaciones web que se instalan son un acceso directo con pasos de más: la ventana cambia y el comportamiento sin conexión es una rueda girando. Aquí ocurre lo contrario: lo que necesitaba la red nunca fue la conversión, sino cargar la página.

### Por qué funciona sin conexión

Cada conversión de aquí ha corrido siempre en el navegador: el analizador de Markdown, el lector de HTML, los lectores de \`.docx\` y de \`.xlsx\`, el lector de zip para una exportación de Notion o de Obsidian. Ninguno necesitó jamás un servidor, que es la misma razón por la que nada de lo que conviertes se sube. Instalar solo quita lo último que pedía red: cargar la propia página.

Una copia instalada y abierta en un avión, en un tren o en una máquina cerrada arranca, acepta un archivo, lo convierte y descarga el resultado. Una página que visitaste antes queda en caché en su propia dirección, así que la documentación y los artículos que has leído también están ahí.

### Qué sigue necesitando red

Todo lo que toca a la cuenta: la lista de documentos guardados, guardar, compartir, el resumen por IA y el inicio de sesión. Esas cosas se piden en el momento en que las usas, y dicen con claridad que no hay conexión en lugar de quedarse colgadas.

Nada de los datos de la cuenta se guarda en caché: \`/api\` no se almacena nunca, y un documento compartido en \`/s/\` tampoco. Una caché que retuviera los documentos de alguien en una máquina compartida sería peor trato que una página más lenta.

### Si no lo instala, no cambia nada

El sitio es el mismo sitio. Instalar es una opción que el navegador ofrece en cuanto la página se declara instalable; ignorarla no cuesta nada, y desinstalar no deja rastro más allá de la caché del propio navegador.

Relacionado: [para qué sirve un conversor de Markdown a HTML](/blog/markdown-to-html-converter) y [si un conversor en línea es seguro](/blog/is-an-online-converter-safe).`,
      },
      it: {
        title: 'Installalo, e funziona senza rete',
        summary: `Chrome, Edge e Safari propongono ormai di installare TransformPipe come applicazione: finestra propria, icona propria, nessuna barra degli indirizzi. Aperto senza connessione parte lo stesso e converte lo stesso, perché ogni conversione gira comunque nel browser. I documenti sull’account hanno bisogno della rete, come sempre.`,
        description:
          'TransformPipe si installa come applicazione in Chrome, Edge e Safari, si apre in una finestra propria e converte documenti senza alcuna connessione.',
        keywords:
          'convertitore markdown offline, installare un convertitore markdown come app, da markdown a html senza internet, convertire documenti offline, applicazione web progressiva per convertire documenti',
        body: `Quasi tutte le applicazioni web che si installano sono una scorciatoia con passaggi in più: la finestra cambia e il comportamento offline è una rotella che gira. Qui vale il contrario: ciò che aveva bisogno della rete non è mai stata la conversione, ma il caricamento della pagina.

### Perché funziona senza connessione

Ogni conversione qui è sempre girata nel browser: il parser Markdown, il lettore HTML, i lettori di \`.docx\` e di \`.xlsx\`, il lettore zip per un export di Notion o di Obsidian. Nessuno di loro ha mai avuto bisogno di un server, ed è la stessa ragione per cui nulla di ciò che converti viene caricato. L’installazione toglie soltanto l’ultima cosa che chiedeva la rete: caricare la pagina stessa.

Una copia installata e aperta in aereo, in treno o su una macchina chiusa parte, accetta un file, lo converte e scarica il risultato. Una pagina già visitata è in cache al proprio indirizzo, quindi la documentazione e gli articoli che hai letto sono lì anche loro.

### Che cosa ha ancora bisogno della rete

Tutto ciò che riguarda l’account: l’elenco dei documenti salvati, il salvataggio, la condivisione, il riassunto con l’IA e l’accesso. Queste cose vengono richieste nel momento in cui le usi, e senza connessione lo dicono chiaramente invece di restare appese.

Nulla dei dati dell’account finisce in cache: \`/api\` non viene mai memorizzato, e nemmeno un documento condiviso sotto \`/s/\`. Una cache che tenesse i documenti di qualcuno su una macchina condivisa sarebbe un affare peggiore di una pagina più lenta.

### Se non lo installi, non cambia nulla

Il sito resta lo stesso sito. L’installazione è un’offerta che il browser fa non appena la pagina si dichiara installabile; ignorarla non costa niente, e disinstallare non lascia traccia oltre la cache del browser stesso.

Da leggere: [a che cosa serve un convertitore da Markdown a HTML](/blog/markdown-to-html-converter) e [se un convertitore online sia sicuro](/blog/is-an-online-converter-safe).`,
      },
    },
    body:
      'Chrome, Edge and Safari now offer to install TransformPipe as an app — its own window, its '
      + 'own icon, no address bar. Opened with no connection it still starts and still converts: '
      + 'every conversion runs in the browser anyway. Documents on the account need the network, '
      + 'as they always did.',
  },
  {
    date: '2026-09-18',
    title: 'A document in a chat looks like a document',
    slug: 'assistant-connector-cards',
    detail: {
      en: {
        description:
          'The TransformPipe connector draws a real card for a document an assistant saves or opens — name, size, counts, first lines, and a button that opens it.',
        keywords:
          'mcp connector document converter, claude markdown connector, convert documents from an assistant, mcp apps card, save a document from a chat',
        body: `A tool result is text, and text is what an assistant does with it: "Saved as report.md, 12 KB, id 3f1a…". Read once that is fine. Read five times in a row it is a wall you have to search for the one id you need.

### What changed

The connector always returned the facts; it returned them as sentences, which is what a tool result is. A chat full of "Saved as report.md, 12 KB, id 3f1a…" is a chat you have to read carefully to use. Now:

- Saving or converting a document draws the document.
- Asking what is on the account draws a list whose rows open, instead of printing an id per line.
- A delete that has not been confirmed draws the document it is about to remove, by name, with the button that removes it — which is the one place where "are you sure" should show you the thing rather than its id.

### It degrades to what it was

An assistant that does not draw these yet gets exactly the sentences it always did. The card is an extra payload alongside the text, not instead of it, so nothing breaks and nothing is missing — a host learns to draw it and the same connector starts looking different.

### What the connector can do

Convert in either direction, save, list, search, summarise, share — privately, by link, or to named addresses — read a document's version history, and report what the account is using. A read-only connection is genuinely read-only: it cannot save, share or delete, and that is enforced on the credential rather than on the tools.

Connect it at \`https://transformpipe.com/api/mcp\`. It signs in with your account; nothing is shared with the assistant's operator.

Related: [converting documents from an assistant](/blog/converting-documents-from-an-assistant), and [the same thing with an API](/blog/converting-documents-with-an-api).`,
      },
      de: {
        title: 'Ein Dokument im Chat sieht aus wie ein Dokument',
        summary: `Ein Assistent, der über den Connector ein Dokument speichert oder öffnet, kann dafür jetzt eine Karte zeichnen — den Namen, das Gewicht, die Zählungen, die ersten Zeilen und eine Schaltfläche, die es hier öffnet — statt eines Absatzes Text. Hosts, die noch keine Karten zeichnen, bekommen dieselben Sätze wie immer.`,
        description:
          'Der TransformPipe-Konnektor zeichnet für jedes Dokument, das ein Assistent speichert oder öffnet, eine Karte: Name, Größe, Zählwerte, erste Zeilen, Knopf.',
        keywords:
          'mcp konnektor dokumentenkonverter, claude markdown konnektor, dokumente aus dem chat konvertieren, mcp apps karte, dokument aus einem chat speichern',
        body: `Ein Werkzeugergebnis ist Text, und Text ist, was ein Assistent daraus macht: „Gespeichert als report.md, 12 KB, id 3f1a…". Einmal gelesen ist das in Ordnung. Fünfmal hintereinander ist es eine Wand, in der Sie die eine id suchen müssen, die Sie brauchen.

### Was sich geändert hat

Der Konnektor hat die Fakten immer geliefert; er hat sie als Sätze geliefert, was ein Werkzeugergebnis nun einmal ist. Ein Chat voller „Gespeichert als report.md, 12 KB, id 3f1a…" ist ein Chat, den man genau lesen muss, um ihn zu benutzen. Jetzt gilt:

- Wer ein Dokument speichert oder konvertiert, bekommt das Dokument gezeichnet.
- Die Frage, was auf dem Konto liegt, ergibt eine Liste, deren Zeilen sich öffnen lassen, statt einer id pro Zeile.
- Ein Löschen, das noch nicht bestätigt ist, zeichnet das Dokument, um das es geht, mit Namen und mit dem Knopf, der es entfernt — die eine Stelle, an der „Sind Sie sicher?" die Sache selbst zeigen sollte und nicht ihre id.

### Es fällt zurück auf das, was es war

Ein Assistent, der solche Karten noch nicht zeichnet, bekommt genau die Sätze, die er immer bekommen hat. Die Karte ist eine zusätzliche Nutzlast neben dem Text, nicht an seiner Stelle: es geht nichts kaputt und es fehlt nichts — ein Host lernt, sie zu zeichnen, und derselbe Konnektor sieht auf einmal anders aus.

### Was der Konnektor kann

In beide Richtungen konvertieren, speichern, auflisten, suchen, zusammenfassen, teilen — privat, per Link oder an benannte Adressen —, die Versionsgeschichte eines Dokuments lesen und melden, was das Konto verbraucht. Eine nur lesende Verbindung liest wirklich nur: sie kann nicht speichern, teilen oder löschen, und das wird an der Zugangsberechtigung durchgesetzt, nicht an den Werkzeugen.

Verbinden Sie ihn unter \`https://transformpipe.com/api/mcp\`. Er meldet sich mit Ihrem Konto an; mit dem Betreiber des Assistenten wird nichts geteilt.

Weiter: [Dokumente aus einem Assistenten heraus konvertieren](/blog/converting-documents-from-an-assistant) und [dasselbe über eine API](/blog/converting-documents-with-an-api).`,
      },
      fr: {
        title: 'Un document dans une conversation ressemble à un document',
        summary: `Un assistant qui enregistre ou ouvre un document par le connecteur peut désormais en dessiner une carte — le nom, le poids, les comptes, les premières lignes et un bouton qui l’ouvre ici — au lieu d’un paragraphe de texte. Demander ce qui se trouve sur le compte dessine une liste dont les lignes ouvrent le document plutôt qu’un identifiant par ligne, et une suppression non confirmée dessine le document qu’elle retirerait, par son nom, avec le bouton qui le retire. Les hôtes qui ne dessinent pas encore de cartes reçoivent les mêmes phrases qu’avant.`,
        description:
          'Le connecteur TransformPipe dessine une vraie carte pour un document qu’un assistant enregistre ou ouvre : nom, taille, comptes, premières lignes, bouton.',
        keywords:
          'connecteur mcp convertisseur de documents, connecteur markdown pour claude, convertir des documents depuis un assistant, carte mcp apps, enregistrer un document depuis une conversation',
        body: `Un résultat d’outil est du texte, et du texte est ce qu’un assistant en fait : « Enregistré sous report.md, 12 Ko, id 3f1a… ». Lu une fois, cela va. Lu cinq fois de suite, c’est un mur dans lequel il faut chercher le seul identifiant dont vous avez besoin.

### Ce qui a changé

Le connecteur a toujours renvoyé les faits ; il les renvoyait sous forme de phrases, ce qu’est un résultat d’outil. Une conversation pleine de « Enregistré sous report.md, 12 Ko, id 3f1a… » est une conversation qu’il faut lire attentivement pour s’en servir. Désormais :

- Enregistrer ou convertir un document dessine le document.
- Demander ce qui se trouve sur le compte dessine une liste dont les lignes s’ouvrent, au lieu d’imprimer un identifiant par ligne.
- Une suppression non encore confirmée dessine le document qu’elle s’apprête à retirer, par son nom, avec le bouton qui le retire — le seul endroit où « êtes-vous sûr » devrait vous montrer la chose et non son identifiant.

### Cela retombe sur ce qui existait

Un assistant qui ne dessine pas encore ces cartes reçoit exactement les phrases qu’il a toujours reçues. La carte est une charge utile en plus du texte, et non à sa place : rien ne casse et rien ne manque — un hôte apprend à la dessiner, et le même connecteur se met à ressembler à autre chose.

### Ce que le connecteur sait faire

Convertir dans les deux sens, enregistrer, lister, chercher, résumer, partager — en privé, par lien ou à des adresses nommées —, lire l’historique des versions d’un document et rapporter ce que le compte consomme. Une connexion en lecture seule est vraiment en lecture seule : elle ne peut ni enregistrer, ni partager, ni supprimer, et c’est appliqué sur l’autorisation plutôt que sur les outils.

Connectez-le à \`https://transformpipe.com/api/mcp\`. Il se connecte avec votre compte ; rien n’est partagé avec l’exploitant de l’assistant.

Autres lectures : [convertir des documents depuis un assistant](/blog/converting-documents-from-an-assistant) et [la même chose avec une API](/blog/converting-documents-with-an-api).`,
      },
      es: {
        title: 'Un documento en un chat parece un documento',
        summary: `Un asistente que guarda o abre un documento por el conector puede dibujar ahora una tarjeta para él —el nombre, lo que pesa, las cuentas, las primeras líneas y un botón que lo abre aquí— en vez de un párrafo de texto. Preguntar qué hay en la cuenta dibuja una lista cuyas filas abren el documento en lugar de imprimir un identificador por línea, y un borrado sin confirmar dibuja el documento que quitaría, por su nombre, con el botón que lo quita. Los anfitriones que todavía no dibujan tarjetas reciben las mismas frases de siempre.`,
        description:
          'El conector de TransformPipe dibuja una tarjeta real para el documento que un asistente guarda o abre: nombre, tamaño, cuentas, primeras líneas y un botón.',
        keywords:
          'conector mcp para convertir documentos, conector de markdown para claude, convertir documentos desde un asistente, tarjeta de mcp apps, guardar un documento desde un chat',
        body: `El resultado de una herramienta es texto, y texto es lo que un asistente hace con él: «Guardado como report.md, 12 KB, id 3f1a…». Leído una vez, está bien. Leído cinco veces seguidas es un muro en el que hay que buscar el único identificador que necesita.

### Qué ha cambiado

El conector siempre devolvió los datos; los devolvía como frases, que es lo que es el resultado de una herramienta. Un chat lleno de «Guardado como report.md, 12 KB, id 3f1a…» es un chat que hay que leer con cuidado para poder usarlo. Ahora:

- Guardar o convertir un documento dibuja el documento.
- Preguntar qué hay en la cuenta dibuja una lista cuyas filas se abren, en lugar de imprimir un identificador por línea.
- Un borrado aún sin confirmar dibuja el documento que va a quitar, por su nombre, con el botón que lo quita, que es el único sitio donde «¿está seguro?» debería enseñar la cosa y no el identificador.

### Degrada a lo que era

Un asistente que todavía no dibuja estas tarjetas recibe exactamente las frases que recibió siempre. La tarjeta es una carga añadida junto al texto, no en su lugar, así que nada se rompe y nada falta: un anfitrión aprende a dibujarla y el mismo conector empieza a verse distinto.

### Qué sabe hacer el conector

Convertir en los dos sentidos, guardar, listar, buscar, resumir, compartir —en privado, por enlace o con direcciones nombradas—, leer el historial de versiones de un documento e informar de lo que la cuenta consume. Una conexión de solo lectura es de verdad de solo lectura: no puede guardar, compartir ni borrar, y eso se impone sobre la credencial y no sobre las herramientas.

Conéctalo en \`https://transformpipe.com/api/mcp\`. Entra con tu cuenta; nada se comparte con quien opera el asistente.

Relacionado: [convertir documentos desde un asistente](/blog/converting-documents-from-an-assistant) y [lo mismo con una API](/blog/converting-documents-with-an-api).`,
      },
      it: {
        title: 'Un documento in una chat sembra un documento',
        summary: `Un assistente che salva o apre un documento tramite il connettore può ora disegnarne una scheda — il nome, quanto pesa, i conteggi, le prime righe e un pulsante che lo apre qui — invece di un paragrafo di testo. Chiedere che cosa c’è sull’account disegna un elenco le cui righe aprono il documento anziché stampare un identificatore per riga, e una cancellazione non ancora confermata disegna il documento che toglierebbe, per nome, con il pulsante che lo toglie. Gli host che ancora non disegnano schede ricevono le stesse frasi di sempre.`,
        description:
          'Il connettore TransformPipe disegna una scheda vera per il documento che un assistente salva o apre: nome, dimensione, conteggi, prime righe e un pulsante.',
        keywords:
          'connettore mcp per convertire documenti, connettore markdown per claude, convertire documenti da un assistente, scheda mcp apps, salvare un documento da una chat',
        body: `Il risultato di uno strumento è testo, e testo è ciò che un assistente ne fa: «Salvato come report.md, 12 KB, id 3f1a…». Letto una volta va bene. Letto cinque volte di fila è un muro in cui devi cercare l’unico identificatore che ti serve.

### Che cosa è cambiato

Il connettore ha sempre restituito i fatti; li restituiva come frasi, che è quello che il risultato di uno strumento è. Una chat piena di «Salvato come report.md, 12 KB, id 3f1a…» è una chat che bisogna leggere con attenzione per poterla usare. Ora:

- Salvare o convertire un documento disegna il documento.
- Chiedere che cosa c’è sull’account disegna un elenco le cui righe si aprono, invece di stampare un identificatore per riga.
- Una cancellazione non ancora confermata disegna il documento che sta per togliere, con il suo nome e con il pulsante che lo toglie: l’unico punto in cui «ne sei sicuro?» dovrebbe mostrarti la cosa e non il suo identificatore.

### Ricade su ciò che era

Un assistente che queste schede non le disegna ancora riceve esattamente le frasi che ha sempre ricevuto. La scheda è un carico in più accanto al testo, non al suo posto: non si rompe niente e non manca niente — un host impara a disegnarla e lo stesso connettore comincia ad apparire diverso.

### Che cosa sa fare il connettore

Convertire nei due sensi, salvare, elencare, cercare, riassumere, condividere — in privato, per link o verso indirizzi indicati —, leggere la cronologia delle versioni di un documento e riferire quanto consuma l’account. Una connessione in sola lettura è davvero in sola lettura: non può salvare, condividere o cancellare, e questo è imposto sulla credenziale e non sugli strumenti.

Collegalo a \`https://transformpipe.com/api/mcp\`. Accede con il tuo account; con chi gestisce l’assistente non viene condiviso nulla.

Da leggere: [convertire documenti da un assistente](/blog/converting-documents-from-an-assistant) e [la stessa cosa con un’API](/blog/converting-documents-with-an-api).`,
      },
    },
    body:
      'An assistant that saves or opens a document through the connector can now draw a card for '
      + 'it — the name, what it weighs, the counts, the first lines, and a button that opens it '
      + 'here — instead of a paragraph of text. Asking what is on the account draws a list whose '
      + 'rows open the document rather than printing an id per line, and a delete that has not been '
      + 'confirmed draws the document it would remove, by name, with the button that removes it. '
      + 'Hosts that do not draw cards yet get the same sentences they always did.',
  },
  {
    date: '2026-09-18',
    title: 'Contact is Support, and it opens on the form',
    slug: 'support-page',
    detail: {
      en: {
        description:
          'TransformPipe support is two fields that write a GitHub issue for you. Nothing is sent from the page, and the old /contact address still lands in the right place.',
        keywords:
          'transformpipe support, report a conversion bug, request a file format, markdown converter help, report a shared document',
        body: `A blank "New issue" page is where a bug report goes to die. It asks somebody who noticed that tables came out empty to invent a format for saying so — a title, a structure, what is worth mentioning — and most people close the tab instead. So the two questions that actually matter are asked here, on \`/support\`, above everything else on the page.

### What the button does

It opens GitHub's new-issue page with the title and the body already written from what you typed. Nothing is sent from this page: no request, no copy, no queue. The issue exists only once you press Submit on GitHub, where you can read exactly what is about to be public first — which also means a GitHub account is needed for that last step.

Embedding GitHub's own form was the first idea and is not possible. \`github.com\` answers with \`x-frame-options: deny\`, which is the correct answer to a site asking to put somebody's session in an iframe.

### Why an issue and not a mailbox

Because that is where the answers are. A public issue is findable by the next person with the same problem, a fix links back to the report that caused it, and nothing is lost in one person's inbox. The cost is that a report is public; the form exists so you can see what will be, before it is.

### What to send, and what to send elsewhere

A file that converted wrongly is the most useful thing there is — attach it if you can share it, say what you expected instead, and name the browser if it looked right somewhere else. A conversion that is wrong on one file is usually wrong on a shape, and the file is how the shape gets found. A format we do not convert yet is a request worth making; several of the ones here started as one.

A shared document that should not be published has a faster route: every page a share link opens carries a "Report this document" link at its foot, which identifies the document without your having to describe it and needs no account. Questions about what is stored, and requests to delete an account and everything in it, go to the issues like anything else.

The old \`/contact\` address redirects here permanently, so a link to it from anywhere still lands in the right place.

Related: [Markdown tables that survive conversion](/blog/markdown-tables-that-survive-conversion), and [what not to keep from a \`.docx\`](/blog/what-not-to-keep-from-a-docx).`,
      },
      de: {
        title: 'Kontakt heißt Support, und es beginnt mit dem Formular',
        summary: `\`/contact\` heißt jetzt \`/support\`, und das Erste darauf sind zwei Felder: was passiert ist und was Sie erwartet haben. Der Knopf öffnet einen GitHub-Issue, in dem beides schon steht — von der Seite selbst wird nichts gesendet, und der Issue entsteht erst, wenn Sie dort auf Absenden drücken. Die alte Adresse leitet weiter, ein Link darauf landet also weiterhin richtig.`,
        description:
          'Der Support von TransformPipe sind zwei Felder, die einen GitHub-Issue vorschreiben. Von der Seite geht nichts weg, und die alte Adresse /contact leitet weiter.',
        keywords:
          'transformpipe support, konvertierungsfehler melden, dateiformat vorschlagen, hilfe markdown konverter, geteiltes dokument melden',
        body: `Eine leere Seite „Neues Issue" ist der Ort, an dem Fehlermeldungen sterben. Sie verlangt von jemandem, dem gerade leere Tabellen aufgefallen sind, eine Form dafür zu erfinden — einen Titel, einen Aufbau, eine Vorstellung davon, was erwähnenswert ist —, und die meisten schließen stattdessen den Tab. Die zwei Fragen, auf die es wirklich ankommt, stehen deshalb hier, auf \`/support\`, über allem anderen.

### Was der Knopf tut

Er öffnet die Issue-Seite von GitHub, in der Titel und Text schon aus dem stehen, was Sie getippt haben. Von dieser Seite geht nichts weg: keine Anfrage, keine Kopie, keine Warteschlange. Der Issue entsteht erst, wenn Sie auf GitHub auf Absenden drücken — wo Sie vorher genau lesen können, was öffentlich wird. Für diesen letzten Schritt wird ein GitHub-Konto gebraucht.

Das echte Formular einzubetten war die erste Idee und ist nicht möglich: \`github.com\` antwortet mit \`x-frame-options: deny\`, was die richtige Antwort an eine Seite ist, die fremde Sitzungen in einen iframe holen will.

### Warum ein Issue und kein Postfach

Weil dort die Antworten liegen. Ein öffentlicher Issue ist für die nächste Person mit demselben Problem auffindbar, eine Korrektur verweist zurück auf die Meldung, die sie ausgelöst hat, und nichts versandet im Postfach einer einzelnen Person. Der Preis ist, dass eine Meldung öffentlich ist; das Formular gibt es, damit Sie vorher sehen, was das sein wird.

### Was hierher gehört und was woandershin

Eine Datei, die falsch konvertiert wurde, ist das Nützlichste überhaupt — hängen Sie sie an, wenn Sie sie weitergeben können, schreiben Sie, was Sie erwartet hatten, und nennen Sie den Browser, falls es woanders richtig aussah. Was bei einer Datei falsch ist, ist meist bei einer Form falsch, und die Datei ist der Weg zu dieser Form. Ein Format, das wir noch nicht konvertieren, ist ein Wunsch, der sich lohnt: Mehrere der vorhandenen haben so angefangen.

Für ein geteiltes Dokument, das nicht veröffentlicht sein sollte, gibt es einen schnelleren Weg: Jede Seite, die ein Freigabelink öffnet, trägt am Fuß einen Link „Dieses Dokument melden". Er benennt das Dokument, ohne dass Sie es beschreiben müssen, und braucht kein Konto. Fragen dazu, was gespeichert wird, und die Bitte, ein Konto samt allem darin zu löschen, gehen wie alles andere in die Issues.

Die alte Adresse \`/contact\` leitet dauerhaft hierher, ein Link darauf landet also weiterhin richtig.

Weiter: [Markdown-Tabellen, die eine Konvertierung überleben](/blog/markdown-tables-that-survive-conversion) und [was ein Konverter aus einer \`.docx\` nicht behalten sollte](/blog/what-not-to-keep-from-a-docx).`,
      },
      fr: {
        title: 'Contact devient Support, et la page s’ouvre sur le formulaire',
        summary: `\`/contact\` s’appelle désormais \`/support\`, et la première chose qui s’y trouve est deux champs : ce qui s’est passé, et ce que vous attendiez. Le bouton ouvre un ticket GitHub où les deux sont déjà écrits — rien n’est envoyé depuis la page, et le ticket n’existe qu’une fois que vous appuyez sur Envoyer là-bas. L’ancienne adresse redirige, un lien qui la vise tombe donc toujours au bon endroit.`,
        description:
          'Le support de TransformPipe, ce sont deux champs qui rédigent un ticket GitHub pour vous. Rien ne part de la page, et l’ancienne adresse /contact redirige ici.',
        keywords:
          'support transformpipe, signaler un bug de conversion, demander un format de fichier, aide convertisseur markdown, signaler un document partagé',
        body: `Une page « Nouveau ticket » vide est l’endroit où une remontée de bug va mourir. Elle demande à quelqu’un qui vient de voir des tableaux sortir vides d’inventer une forme pour le dire — un titre, une structure, une idée de ce qui mérite d’être mentionné — et la plupart des gens ferment l’onglet à la place. Les deux questions qui comptent vraiment sont donc posées ici, sur \`/support\`, au-dessus de tout le reste de la page.

### Ce que fait le bouton

Il ouvre la page de nouveau ticket de GitHub, titre et corps déjà rédigés à partir de ce que vous avez tapé. Rien n’est envoyé depuis cette page : aucune requête, aucune copie, aucune file d’attente. Le ticket n’existe qu’une fois que vous appuyez sur Envoyer chez GitHub, où vous pouvez d’abord lire exactement ce qui va devenir public — ce qui veut dire aussi qu’un compte GitHub est nécessaire pour cette dernière étape.

Intégrer le formulaire de GitHub était la première idée, et elle est impossible. \`github.com\` répond avec \`x-frame-options: deny\`, ce qui est la bonne réponse à un site qui demande à mettre la session de quelqu’un dans une iframe.

### Pourquoi un ticket et non une boîte aux lettres

Parce que c’est là que sont les réponses. Un ticket public se retrouve par la personne suivante qui a le même problème, une correction renvoie à la remontée qui l’a provoquée, et rien ne se perd dans la boîte d’une seule personne. Le prix à payer est qu’une remontée est publique ; le formulaire existe pour que vous voyiez ce que ce sera, avant que ça le soit.

### Ce qu’il faut envoyer, et ce qu’il faut envoyer ailleurs

Un fichier qui s’est mal converti est la chose la plus utile qui soit — joignez-le si vous pouvez le partager, dites ce que vous attendiez à la place, et nommez le navigateur si le résultat était correct ailleurs. Une conversion fausse sur un fichier est d’ordinaire fausse sur une forme, et le fichier est le moyen de trouver cette forme. Un format que nous ne convertissons pas encore est une demande qui vaut la peine : plusieurs de ceux présents ont commencé ainsi.

Un document partagé qui ne devrait pas être publié a une voie plus rapide : chaque page ouverte par un lien de partage porte en pied un lien « Signaler ce document », qui désigne le document sans que vous ayez à le décrire et ne demande aucun compte. Les questions sur ce qui est conservé, et les demandes de suppression d’un compte et de tout ce qu’il contient, passent par les tickets comme le reste.

L’ancienne adresse \`/contact\` redirige ici de façon permanente : un lien qui la vise, d’où qu’il vienne, tombe toujours au bon endroit.

Autres lectures : [des tableaux Markdown qui survivent à une conversion](/blog/markdown-tables-that-survive-conversion) et [ce qu’il ne faut pas garder d’un \`.docx\`](/blog/what-not-to-keep-from-a-docx).`,
      },
      es: {
        title: 'Contacto es Soporte, y abre por el formulario',
        summary: `\`/contact\` se llama ahora \`/support\`, y lo primero que hay en la página son dos campos: qué ocurrió y qué esperabas. El botón abre una incidencia de GitHub con ambas cosas ya escritas dentro; desde la página no se envía nada, y la incidencia existe cuando pulsas Enviar allí. La dirección antigua redirige, así que un enlace hacia ella sigue cayendo en el sitio correcto.`,
        description:
          'El soporte de TransformPipe son dos campos que redactan una incidencia de GitHub por ti. De la página no sale nada y /contact redirige hasta aquí.',
        keywords:
          'soporte de transformpipe, informar de un fallo de conversión, pedir un formato de archivo, ayuda con el conversor de markdown, denunciar un documento compartido',
        body: `Una página «Nueva incidencia» en blanco es donde va a morir un informe de error. Le pide a alguien que acaba de ver salir las tablas vacías que se invente una forma de contarlo —un título, una estructura, una idea de qué merece mencionarse— y la mayoría cierra la pestaña en su lugar. Por eso las dos preguntas que de verdad importan se hacen aquí, en \`/support\`, por encima de todo lo demás de la página.

### Qué hace el botón

Abre la página de nueva incidencia de GitHub con el título y el cuerpo ya redactados a partir de lo que escribiste. Desde esta página no se envía nada: ni una petición, ni una copia, ni una cola. La incidencia existe solo cuando pulsas Enviar en GitHub, donde antes puedes leer exactamente lo que va a ser público, lo cual significa también que para ese último paso hace falta una cuenta de GitHub.

Empotrar el propio formulario de GitHub fue la primera idea y no es posible. \`github.com\` responde con \`x-frame-options: deny\`, que es la respuesta correcta a un sitio que pide meter la sesión de alguien en un iframe.

### Por qué una incidencia y no un buzón

Porque ahí es donde están las respuestas. Una incidencia pública la encuentra la siguiente persona con el mismo problema, una corrección enlaza de vuelta al informe que la provocó, y nada se pierde en la bandeja de una sola persona. El precio es que un informe es público; el formulario existe para que veas qué va a serlo antes de que lo sea.

### Qué mandar aquí y qué mandar a otro sitio

Un archivo que se convirtió mal es lo más útil que hay: adjúntalo si puedes compartirlo, di qué esperabas en su lugar y nombra el navegador si en otro se veía bien. Una conversión que falla en un archivo suele fallar en una forma, y el archivo es el camino hasta esa forma. Un formato que todavía no convertimos es una petición que merece la pena: varios de los que hay empezaron así.

Un documento compartido que no debería estar publicado tiene una vía más rápida: cada página que abre un enlace compartido lleva al pie un enlace «Denunciar este documento», que identifica el documento sin que tengas que describirlo y no necesita cuenta. Las preguntas sobre qué se guarda, y las peticiones de borrar una cuenta con todo lo que contiene, van a las incidencias como cualquier otra cosa.

La dirección antigua \`/contact\` redirige aquí de forma permanente, así que un enlace hacia ella, venga de donde venga, sigue cayendo en el sitio correcto.

Relacionado: [tablas de Markdown que sobreviven a una conversión](/blog/markdown-tables-that-survive-conversion) y [qué no conviene conservar de un \`.docx\`](/blog/what-not-to-keep-from-a-docx).`,
      },
      it: {
        title: 'Contatti diventa Assistenza, e si apre sul modulo',
        summary: `\`/contact\` si chiama ora \`/support\`, e la prima cosa che trovi sono due campi: che cosa è successo e che cosa ti aspettavi. Il pulsante apre una issue su GitHub con entrambe le cose già scritte dentro; dalla pagina non parte nulla, e la issue esiste solo quando premi Invia là. Il vecchio indirizzo reindirizza, quindi un link che punta a quello arriva ancora nel posto giusto.`,
        description:
          'L’assistenza di TransformPipe sono due campi che scrivono per te una issue su GitHub. Dalla pagina non parte nulla e /contact reindirizza qui.',
        keywords:
          'assistenza transformpipe, segnalare un errore di conversione, chiedere un formato di file, aiuto convertitore markdown, segnalare un documento condiviso',
        body: `Una pagina «Nuova issue» vuota è il posto dove una segnalazione di bug va a morire. Chiede a qualcuno che ha appena visto uscire le tabelle vuote di inventarsi una forma per dirlo — un titolo, una struttura, un’idea di che cosa valga la pena menzionare — e la maggior parte delle persone chiude invece la scheda. Le due domande che contano davvero stanno perciò qui, su \`/support\`, sopra tutto il resto della pagina.

### Che cosa fa il pulsante

Apre la pagina della nuova issue di GitHub con titolo e testo già scritti a partire da quello che hai digitato. Da questa pagina non parte nulla: nessuna richiesta, nessuna copia, nessuna coda. La issue esiste solo quando premi Invia su GitHub, dove prima puoi leggere esattamente che cosa sta per diventare pubblico — il che significa anche che per quell’ultimo passo serve un account GitHub.

Incorporare il modulo di GitHub era la prima idea, e non è possibile: \`github.com\` risponde con \`x-frame-options: deny\`, che è la risposta giusta a un sito che chiede di mettere la sessione di qualcuno dentro un iframe.

### Perché una issue e non una casella di posta

Perché è lì che stanno le risposte. Una issue pubblica è trovabile dalla persona successiva con lo stesso problema, una correzione rimanda alla segnalazione che l’ha provocata, e niente si perde nella posta di una sola persona. Il prezzo è che una segnalazione è pubblica; il modulo esiste perché tu possa vedere che cosa lo sarà, prima che lo sia.

### Che cosa mandare qui e che cosa mandare altrove

Un file convertito male è la cosa più utile che ci sia: allegalo se puoi condividerlo, scrivi che cosa ti aspettavi al suo posto e indica il browser se altrove veniva giusto. Una conversione sbagliata su un file è di solito sbagliata su una forma, e il file è il modo per trovare quella forma. Un formato che ancora non convertiamo è una richiesta che vale la pena fare: parecchi di quelli presenti sono nati così.

Un documento condiviso che non dovrebbe essere pubblicato ha una via più rapida: ogni pagina aperta da un link di condivisione porta in fondo un link «Segnala questo documento», che identifica il documento senza che tu debba descriverlo e non richiede alcun account. Le domande su che cosa viene conservato, e le richieste di cancellare un account con tutto quello che contiene, vanno nelle issue come ogni altra cosa.

Il vecchio indirizzo \`/contact\` reindirizza qui in modo permanente, quindi un link che punta a quello, da qualunque parte arrivi, finisce ancora nel posto giusto.

Da leggere: [tabelle Markdown che sopravvivono a una conversione](/blog/markdown-tables-that-survive-conversion) e [che cosa non conservare da un \`.docx\`](/blog/what-not-to-keep-from-a-docx).`,
      },
    },
    body:
      '`/contact` is now `/support`, and the first thing on it is two fields: what happened, and '
      + 'what you expected. The button opens a GitHub issue with both already written into it — '
      + 'nothing is sent from the page, and the issue exists once you press Submit there. The old '
      + 'address redirects, so a link to it still lands in the right place.',
  },
  {
    date: '2026-09-18',
    title: 'Words that CSS held apart stay apart',
    slug: 'words-css-held-apart',
    detail: {
      en: {
        description:
          'A stats row laid out with flex or grid serialises as 39words in every clipper. The TransformPipe extension reads the layout inside the page and puts the spaces back.',
        keywords:
          'web clipper missing spaces, words run together html to markdown, flex gap no whitespace markdown, breadcrumbs converted without spaces, save web page as markdown correctly',
        body: `Open a page's markup and look at the row of counts under an article heading. Very often there is not a single space character in it: \`<span>39</span><span>words</span>\`, and the gap you see on screen is a \`gap\` property on a flex container. The space is in the stylesheet, not in the document.

Every converter that comes after that sees the string and not the page — ours included — so the words arrive glued together. It is not an exotic shape either. A row of stats, a tag list, a breadcrumb trail and a pagination strip all look like this in any current framework.

### Why this can only be fixed inside the page

The one place that can tell whether two elements are laid out side by side is the page itself, while \`getComputedStyle\` still exists. By the time HTML has been copied out to be converted, the layout is gone with the stylesheet and no amount of guessing recovers it: nothing in \`<span>39</span><span>words</span>\` says whether a space belongs there or not.

So the extension clones the document, walks the clone beside the living one, and wherever the real element lays its children out as flex or grid items, the copy gets a space after each of them. The copy is what gets converted. Your page is not touched, and this runs only in the moment you press the button — there is no content script sitting in your tabs.

A file you drop on the site gets none of this, because there is no layout to read. That is the difference between converting a page and converting a copy of its markup, and it is most of the reason the extension exists.

### What it does not cover

Flex and grid, and nothing else. Space made by a margin on an inline-block, by absolute positioning, or by generated content in a \`::before\` is still invisible in the markup, and still comes out closed up.

Converting a selection is also untouched: a selected range is cloned straight out of the document, so a stat row lifted as a selection can still arrive as \`39words\`. Press the button without selecting anything and the whole-page path gives you the spaces.

Related: [saving a web page as Markdown](/blog/save-a-web-page-as-markdown), and [Turndown and the HTML-to-Markdown libraries](/blog/turndown-and-html-to-markdown-libraries).`,
      },
      de: {
        title: 'Wörter, die das CSS auseinanderhielt, bleiben auseinander',
        summary: `Eine Zeile wie \`39 words · 1 heading · 1 table\` besteht meist aus getrennten Elementen, deren Abstand aus dem Layout kommt und nicht aus dem Markup — konvertiert wurde sie also als \`39words1heading1table\`. Die Erweiterung liest die Seite jetzt mit ihrem Layout in der Hand und setzt diese Leerzeichen vor der Konvertierung zurück. Kennzahlenzeilen, Tag-Listen und Brotkrumen kommen wieder als Sätze heraus.`,
        description:
          'Eine mit Flex oder Grid gesetzte Kennzahlenzeile wird in jedem Clipper zu 39words. Die TransformPipe-Erweiterung liest das Layout und setzt die Leerzeichen zurück.',
        keywords:
          'clipper verschluckt leerzeichen, wörter zusammengeklebt html in markdown, flex gap kein leerzeichen markdown, brotkrumen ohne leerzeichen konvertiert, webseite korrekt als markdown speichern',
        body: `Sehen Sie sich im Markup einer Seite die Zeile mit den Zählwerten unter einer Artikelüberschrift an. Sehr oft steht darin kein einziges Leerzeichen: \`<span>39</span><span>words</span>\` — und der Abstand, den Sie auf dem Schirm sehen, ist eine \`gap\`-Eigenschaft an einem Flex-Container. Das Leerzeichen steckt im Stylesheet, nicht im Dokument.

Jeder Konverter danach sieht die Zeichenkette und nicht die Seite, der unsere eingeschlossen; die Wörter kommen also aneinandergeklebt an. Und das ist keine exotische Form: Eine Kennzahlenzeile, eine Tag-Liste, eine Brotkrumenspur und eine Seitennummerierung sehen in jedem aktuellen Framework so aus.

### Warum das nur in der Seite selbst zu beheben ist

Die einzige Stelle, die erkennen kann, ob zwei Elemente nebeneinander gesetzt sind, ist die Seite selbst, solange es dort \`getComputedStyle\` gibt. Sobald das HTML zum Konvertieren herauskopiert ist, ist das Layout mit dem Stylesheet verschwunden, und kein Raten holt es zurück: An \`<span>39</span><span>words</span>\` steht nicht, ob dort ein Leerzeichen hingehört.

Die Erweiterung klont deshalb das Dokument, geht den Klon neben dem lebenden Original durch, und wo das echte Element seine Kinder als Flex- oder Grid-Elemente setzt, bekommt die Kopie nach jedem von ihnen ein Leerzeichen. Konvertiert wird die Kopie. Ihre Seite wird nicht verändert, und das alles läuft nur in dem Moment, in dem Sie den Knopf drücken — in Ihren Tabs sitzt kein Skript.

Eine Datei, die Sie auf der Seite ablegen, bekommt davon nichts, weil es dort kein Layout zu lesen gibt. Das ist der Unterschied zwischen einer Seite und einer Kopie ihres Markups, und er ist ein guter Teil des Grundes, warum es die Erweiterung gibt.

### Was nicht erfasst wird

Flex und Grid, und nichts weiter. Abstand, der von einem Margin an einem Inline-Block, von absoluter Positionierung oder von erzeugtem Inhalt in einem \`::before\` kommt, ist im Markup weiterhin unsichtbar und kommt weiterhin zusammengeschoben heraus.

Auch eine Markierung bleibt unberührt: Ein markierter Bereich wird direkt aus dem Dokument geklont, eine als Markierung gehobene Kennzahlenzeile kann also nach wie vor als \`39words\` ankommen. Drücken Sie den Knopf, ohne etwas zu markieren, dann geht es über den Weg für die ganze Seite — und die Leerzeichen sind da.

Weiter: [eine Webseite als Markdown sichern](/blog/save-a-web-page-as-markdown) und [Turndown und die HTML-nach-Markdown-Bibliotheken](/blog/turndown-and-html-to-markdown-libraries).`,
      },
      fr: {
        title: 'Les mots que le CSS tenait séparés le restent',
        summary: `Une ligne comme \`39 words · 1 heading · 1 table\` est d’ordinaire faite d’éléments distincts dont l’écart vient de la mise en page et non du balisage — elle se convertissait donc en \`39words1heading1table\`. L’extension lit désormais la page avec sa mise en page en main et remet ces espaces avant de convertir. Les lignes de statistiques, les listes d’étiquettes et les fils d’Ariane ressortent de nouveau comme des phrases.`,
        description:
          'Une ligne de statistiques posée en flex ou en grid se sérialise en 39words dans tout clipper. L’extension TransformPipe lit la mise en page et remet les espaces.',
        keywords:
          'clipper web qui perd les espaces, mots collés en convertissant html en markdown, flex gap sans espace markdown, fil d’ariane converti sans espaces, enregistrer une page web en markdown correctement',
        body: `Ouvrez le balisage d’une page et regardez la ligne de comptes sous un titre d’article. Très souvent, il n’y a pas un seul caractère d’espace dedans : \`<span>39</span><span>words</span>\`, et l’écart que vous voyez à l’écran est une propriété \`gap\` sur un conteneur flex. L’espace est dans la feuille de style, pas dans le document.

Tout convertisseur qui vient après voit la chaîne et non la page — le nôtre compris —, et les mots arrivent donc collés. Ce n’est pas non plus une forme exotique : une ligne de statistiques, une liste d’étiquettes, un fil d’Ariane et une barre de pagination ressemblent tous à cela dans n’importe quel framework actuel.

### Pourquoi cela ne peut se corriger que dans la page

Le seul endroit capable de dire si deux éléments sont posés côte à côte est la page elle-même, tant que \`getComputedStyle\` y existe encore. Une fois le HTML recopié au-dehors pour être converti, la mise en page est partie avec la feuille de style, et aucune supposition ne la récupère : rien dans \`<span>39</span><span>words</span>\` ne dit si un espace y a sa place ou non.

L’extension clone donc le document, parcourt le clone à côté du vivant, et partout où l’élément réel pose ses enfants comme éléments flex ou grid, la copie reçoit un espace après chacun d’eux. C’est la copie qui est convertie. Votre page n’est pas touchée, et tout cela ne tourne qu’au moment où vous appuyez sur le bouton : aucun script ne reste assis dans vos onglets.

Un fichier que vous déposez sur le site n’a rien de tout cela, parce qu’il n’y a pas de mise en page à lire. C’est la différence entre convertir une page et convertir une copie de son balisage, et c’est une bonne part de la raison d’être de l’extension.

### Ce qui n’est pas couvert

Flex et grid, et rien d’autre. Un écart produit par une marge sur un inline-block, par un positionnement absolu ou par du contenu généré dans un \`::before\` reste invisible dans le balisage, et ressort toujours refermé.

Convertir une sélection reste également intact : une plage sélectionnée est clonée directement depuis le document, une ligne de statistiques prise en sélection peut donc encore arriver en \`39words\`. Appuyez sur le bouton sans rien sélectionner et la voie page entière vous rend les espaces.

Autres lectures : [enregistrer une page web en Markdown](/blog/save-a-web-page-as-markdown) et [Turndown et les bibliothèques HTML vers Markdown](/blog/turndown-and-html-to-markdown-libraries).`,
      },
      es: {
        title: 'Las palabras que el CSS mantenía separadas siguen separadas',
        summary: `Una fila como \`39 words · 1 heading · 1 table\` suele estar hecha de elementos sueltos cuyo espacio viene de la maquetación y no del marcado, así que se convertía como \`39words1heading1table\`. La extensión lee ahora la página con su maquetación en la mano y devuelve esos espacios antes de convertir. Las filas de cifras, las listas de etiquetas y las migas de pan vuelven a salir como frases.`,
        description:
          'Una fila de cifras maquetada con flex o grid se serializa como 39words en cualquier clipper. La extensión de TransformPipe lee la maquetación y repone los espacios.',
        keywords:
          'clipper web que se come los espacios, palabras pegadas al pasar html a markdown, flex gap sin espacio en markdown, migas de pan convertidas sin espacios, guardar una página web como markdown correctamente',
        body: `Abre el marcado de una página y mira la fila de cifras que hay bajo el título de un artículo. Muy a menudo no contiene ni un solo carácter de espacio: \`<span>39</span><span>words</span>\`, y la separación que ves en pantalla es una propiedad \`gap\` en un contenedor flex. El espacio está en la hoja de estilos, no en el documento.

Todo conversor que venga después ve la cadena y no la página —el nuestro incluido—, así que las palabras llegan pegadas. Tampoco es una forma exótica: una fila de cifras, una lista de etiquetas, un rastro de migas de pan y una franja de paginación se ven así en cualquier framework actual.

### Por qué esto solo se arregla dentro de la página

El único sitio que puede saber si dos elementos están colocados uno al lado del otro es la propia página, mientras exista allí \`getComputedStyle\`. Una vez que el HTML se ha copiado fuera para convertirlo, la maquetación se ha ido con la hoja de estilos y ninguna conjetura la recupera: nada en \`<span>39</span><span>words</span>\` dice si ahí corresponde un espacio o no.

Por eso la extensión clona el documento, recorre el clon junto al original vivo y, allí donde el elemento real coloca a sus hijos como elementos flex o grid, la copia recibe un espacio detrás de cada uno. Lo que se convierte es la copia. Tu página no se toca, y esto corre solo en el instante en que pulsas el botón: no hay ningún script sentado en tus pestañas.

Un archivo que sueltas en el sitio no recibe nada de esto, porque allí no hay maquetación que leer. Esa es la diferencia entre convertir una página y convertir una copia de su marcado, y es buena parte de la razón por la que existe la extensión.

### Qué no cubre

Flex y grid, y nada más. El espacio que produce un margen en un inline-block, una posición absoluta o un contenido generado en un \`::before\` sigue siendo invisible en el marcado, y sigue saliendo cerrado.

Convertir una selección tampoco cambia: un rango seleccionado se clona directamente del documento, así que una fila de cifras levantada como selección todavía puede llegar como \`39words\`. Pulsa el botón sin seleccionar nada y la vía de página entera te devuelve los espacios.

Relacionado: [guardar una página web como Markdown](/blog/save-a-web-page-as-markdown) y [Turndown y las bibliotecas de HTML a Markdown](/blog/turndown-and-html-to-markdown-libraries).`,
      },
      it: {
        title: 'Le parole che il CSS teneva separate restano separate',
        summary: `Una riga come \`39 words · 1 heading · 1 table\` è di solito fatta di elementi distinti la cui distanza viene dal layout e non dal markup, così veniva convertita come \`39words1heading1table\`. L’estensione ora legge la pagina con il suo layout in mano e rimette quegli spazi prima di convertire. Righe di conteggi, liste di tag e briciole di pane tornano a uscire come frasi.`,
        description:
          'Una riga di conteggi disposta con flex o grid si serializza come 39words in ogni clipper. L’estensione TransformPipe legge il layout e rimette gli spazi.',
        keywords:
          'clipper che perde gli spazi, parole attaccate convertendo html in markdown, flex gap senza spazio markdown, briciole di pane convertite senza spazi, salvare una pagina web come markdown correttamente',
        body: `Apri il markup di una pagina e guarda la riga di conteggi sotto il titolo di un articolo. Molto spesso non contiene un solo carattere di spazio: \`<span>39</span><span>words</span>\`, e la distanza che vedi sullo schermo è una proprietà \`gap\` su un contenitore flex. Lo spazio sta nel foglio di stile, non nel documento.

Ogni convertitore che viene dopo vede la stringa e non la pagina — il nostro compreso — e le parole arrivano dunque appiccicate. Non è nemmeno una forma esotica: una riga di conteggi, una lista di tag, una traccia di briciole di pane e una barra di paginazione hanno tutte questo aspetto in qualsiasi framework attuale.

### Perché si può sistemare solo dentro la pagina

L’unico posto capace di dire se due elementi sono disposti fianco a fianco è la pagina stessa, finché lì esiste \`getComputedStyle\`. Una volta che l’HTML è stato copiato fuori per essere convertito, il layout se n’è andato con il foglio di stile e nessuna congettura lo recupera: in \`<span>39</span><span>words</span>\` non c’è nulla che dica se uno spazio ci vada o no.

L’estensione perciò clona il documento, percorre il clone accanto a quello vivo e, ovunque l’elemento vero disponga i suoi figli come elementi flex o grid, la copia riceve uno spazio dopo ciascuno di loro. A essere convertita è la copia. La tua pagina non viene toccata, e tutto questo gira solo nel momento in cui premi il pulsante: nelle tue schede non siede alcuno script.

Un file che lasci cadere sul sito non riceve niente di tutto ciò, perché lì non c’è layout da leggere. È la differenza fra convertire una pagina e convertire una copia del suo markup, ed è buona parte del motivo per cui l’estensione esiste.

### Che cosa non copre

Flex e grid, e nient’altro. Lo spazio prodotto da un margine su un inline-block, da un posizionamento assoluto o da contenuto generato in un \`::before\` resta invisibile nel markup, e continua a uscire chiuso.

Nemmeno la conversione di una selezione cambia: un intervallo selezionato viene clonato direttamente dal documento, quindi una riga di conteggi presa come selezione può ancora arrivare come \`39words\`. Premi il pulsante senza selezionare nulla e la via della pagina intera ti restituisce gli spazi.

Da leggere: [salvare una pagina web come Markdown](/blog/save-a-web-page-as-markdown) e [Turndown e le librerie da HTML a Markdown](/blog/turndown-and-html-to-markdown-libraries).`,
      },
    },
    body:
      'A row like `39 words · 1 heading · 1 table` is usually built as separate elements with the '
      + 'space between them coming from the layout rather than from the markup — so it converted as '
      + '`39words1heading1table`. The extension now reads the page with its layout in hand and puts '
      + 'those spaces back before converting. Stat rows, tag lists and breadcrumbs come out as '
      + 'sentences again.',
  },
  {
    date: '2026-09-18',
    title: 'A document somebody shared with you is a document',
    slug: 'documents-shared-with-you',
    detail: {
      en: {
        description:
          'A document shared with you on TransformPipe opens with the card every other screen gives it — name, size, counts — and buttons that keep a copy or take the text.',
        keywords:
          'open a shared markdown document, save a copy of a shared document, document shared with me, markdown share link, download a shared document as html',
        body: `A link handed to somebody should open the document, not the product. That is why this page has no history, no dropzone and no account of its own — and for a while it took the idea too far: what it put above the document was a line of small print, which read as a preview of something rather than as the thing itself.

### The same card as everywhere else

Above the document now: its name, a badge saying it was shared with you, what it weighs, when it was converted, and its word, heading and table counts. It is the card the converter puts above a document it has just made, because it is the same object, and a reader deciding whether to keep something wants the same facts an owner does.

### The verbs are what differ

**Save a copy** puts it on your own account, and it is a copy: the sender's document stays theirs and nothing you do here reaches it. **Share** is about that copy, so pressing it saves one first rather than offering to republish somebody else's document. **Copy Markdown** takes the text, and **Download** gives you a self-contained \`.html\` file that opens anywhere with no connection.

Signed out, none of those sit there disabled explaining themselves: they open the sign-in dialog, because somebody who has just pressed Save has already said what they want. The dialog, not straight to Google — whoever was sent the link was sent it at an address that may well not be a Google account.

### Two pages, and which one you get

A link that anybody may open is \`/s/<token>\`, rendered by the server, running no script, and cacheable — which is what keeps a popular document off the database. A document shared with named addresses cannot be handed to a reader nobody has identified, so that link sends you to \`/open/<token>\`, the app's own view, which knows how to ask you to sign in as the address it was shared with.

Neither is indexed. Both carry a "Report this document" link at the foot, and a link that was never shared or has since been revoked says so rather than showing a stale page.

Related: [sharing a document as a link](/blog/share-a-markdown-document-as-a-link), and [turning AI output into a shareable page](/blog/ai-output-to-a-shareable-page).`,
      },
      de: {
        title: 'Ein Dokument, das jemand mit Ihnen geteilt hat, ist ein Dokument',
        summary: `Die Seite, die ein Freigabelink öffnet, trägt jetzt dieselbe Karte, die jeder andere Bildschirm über ein Dokument setzt — Name, Gewicht, Entstehungszeit und die Zählwerte — statt einer Zeile Kleingedrucktem. **Kopie speichern** legt es in Ihr eigenes Konto, **Teilen** veröffentlicht diese Kopie, und **Markdown kopieren** nimmt den Text. Abgemeldet öffnen diese Knöpfe den Anmeldedialog, statt untätig ausgegraut dazustehen.`,
        description:
          'Ein mit Ihnen geteiltes Dokument öffnet jetzt mit derselben Karte wie überall sonst — Name, Größe, Zählwerte — und mit Knöpfen für eine Kopie oder den Text.',
        keywords:
          'geteiltes markdown dokument öffnen, kopie eines geteilten dokuments speichern, mit mir geteiltes dokument, markdown freigabelink, geteiltes dokument als html herunterladen',
        body: `Ein Link, den man jemandem gibt, sollte das Dokument öffnen und nicht das Produkt. Deshalb hat diese Seite keinen Verlauf, keine Ablagefläche und kein eigenes Konto — und eine Zeit lang trieb sie den Gedanken zu weit: Über dem Dokument stand eine Zeile Kleingedrucktes, die sich wie die Vorschau auf etwas las und nicht wie die Sache selbst.

### Dieselbe Karte wie überall sonst

Über dem Dokument steht jetzt: sein Name, ein Abzeichen, dass es mit Ihnen geteilt wurde, sein Gewicht, der Zeitpunkt der Umwandlung und die Zahl seiner Wörter, Überschriften und Tabellen. Es ist die Karte, die der Konverter über ein frisch erzeugtes Dokument setzt, denn es ist dasselbe Objekt — und wer entscheidet, ob er etwas behalten will, braucht dieselben Angaben wie ein Besitzer.

### Unterschiedlich sind die Verben

**Kopie speichern** legt es in Ihr eigenes Konto, und es ist eine Kopie: Das Dokument des Absenders bleibt sein Dokument, und nichts, was Sie hier tun, erreicht es. **Teilen** bezieht sich auf diese Kopie und speichert deshalb zuerst eine, statt anzubieten, das Dokument einer anderen Person neu zu veröffentlichen. **Markdown kopieren** nimmt den Text, und **Herunterladen** gibt Ihnen eine eigenständige \`.html\`-Datei, die sich überall ohne Verbindung öffnet.

Abgemeldet steht keiner dieser Knöpfe ausgegraut da und erklärt sich: Sie öffnen den Anmeldedialog, denn wer gerade Speichern gedrückt hat, hat schon gesagt, was er will. Der Dialog, nicht direkt Google — wer diesen Link bekommen hat, hat ihn an eine Adresse bekommen, die gut und gern kein Google-Konto sein kann.

### Zwei Seiten, und welche Sie bekommen

Ein Link, den jeder öffnen darf, ist \`/s/<token>\`: vom Server gebaut, ohne jedes Skript, und zwischenspeicherbar — was ein viel gelesenes Dokument von der Datenbank fernhält. Ein Dokument, das für benannte Adressen geteilt ist, lässt sich keinem unbekannten Leser aushändigen; dieser Link schickt Sie deshalb auf \`/open/<token>\`, die eigene Ansicht der App, die Sie mit der Adresse anmelden kann, für die geteilt wurde.

Indexiert wird keine der beiden. Beide tragen am Fuß einen Link „Dieses Dokument melden", und ein Link, der nie geteilt oder inzwischen widerrufen wurde, sagt das, statt eine veraltete Seite zu zeigen.

Weiter: [ein Dokument als Link teilen](/blog/share-a-markdown-document-as-a-link) und [aus einer KI-Ausgabe eine teilbare Seite machen](/blog/ai-output-to-a-shareable-page).`,
      },
      fr: {
        title: 'Un document que quelqu’un a partagé avec vous est un document',
        summary: `La page qu’ouvre un lien de partage porte désormais la même carte que tout autre écran place au-dessus d’un document — le nom, le poids, le moment de la conversion et les compteurs — plutôt qu’une ligne en petits caractères. **Enregistrer une copie** la place dans votre propre compte, **Partager** publie cette copie, et **Copier le Markdown** prend le texte. Déconnecté, ces boutons ouvrent la boîte de connexion plutôt que de rester là, désactivés.`,
        description:
          'Un document partagé avec vous sur TransformPipe s’ouvre avec la carte de chaque écran — nom, poids, compteurs — et des boutons pour le garder ou en prendre le texte.',
        keywords:
          'ouvrir un document markdown partagé, enregistrer une copie d’un document partagé, document partagé avec moi, lien de partage markdown, télécharger un document partagé en html',
        body: `Un lien qu’on donne à quelqu’un devrait ouvrir le document, pas le produit. C’est pourquoi cette page n’a ni historique, ni zone de dépôt, ni compte à elle — et pendant un temps, elle a poussé l’idée trop loin : ce qu’elle plaçait au-dessus du document était une ligne en petits caractères, qui se lisait comme l’aperçu de quelque chose plutôt que comme la chose elle-même.

### La même carte que partout ailleurs

Au-dessus du document se trouvent désormais : son nom, un badge indiquant qu’il a été partagé avec vous, son poids, le moment de sa conversion, et ses compteurs de mots, de titres et de tableaux. C’est la carte que le convertisseur place au-dessus d’un document qu’il vient de produire, car c’est le même objet — et un lecteur qui décide de garder quelque chose veut les mêmes informations qu’un propriétaire.

### Ce qui diffère, c’est les verbes

**Enregistrer une copie** la place dans votre propre compte, et c’en est une copie : le document de l’expéditeur reste le sien, et rien de ce que vous faites ici ne l’atteint. **Partager** concerne cette copie, donc l’appuyer l’enregistre d’abord plutôt que de proposer de republier le document de quelqu’un d’autre. **Copier le Markdown** prend le texte, et **Télécharger** vous donne un fichier \`.html\` autonome qui s’ouvre n’importe où, sans connexion.

Déconnecté, aucun de ces boutons ne reste là, désactivé, à s’expliquer : ils ouvrent la boîte de connexion, car quelqu’un qui vient d’appuyer sur Enregistrer a déjà dit ce qu’il voulait. La boîte, pas Google directement — la personne à qui le lien a été envoyé l’a reçu à une adresse qui n’est peut-être pas un compte Google.

### Deux pages, et celle que vous obtenez

Un lien que n’importe qui peut ouvrir est \`/s/<token>\`, produit par le serveur, sans aucun script, et mis en cache — ce qui tient un document populaire à l’écart de la base de données. Un document partagé avec des adresses nommées ne peut pas être remis à un lecteur que personne n’a identifié ; ce lien vous envoie donc vers \`/open/<token>\`, la vue propre de l’application, qui sait vous demander de vous connecter avec l’adresse à qui il a été partagé.

Ni l’une ni l’autre n’est indexée. Les deux portent en bas un lien « Signaler ce document », et un lien qui n’a jamais été partagé ou qui a depuis été révoqué le dit, plutôt que d’afficher une page obsolète.

Autres lectures : [partager un document sous forme de lien](/blog/share-a-markdown-document-as-a-link), et [transformer une sortie d’IA en page partageable](/blog/ai-output-to-a-shareable-page).`,
      },
      es: {
        title: 'Un documento que alguien ha compartido contigo es un documento',
        summary: `La página que abre un enlace compartido presenta ahora la misma ficha que cualquier otra pantalla pone sobre un documento — el nombre, el peso, el momento de creación y los recuentos — en lugar de una línea de letra pequeña. **Guardar una copia** lo coloca en tu propia cuenta, **Compartir** publica esa copia, y **Copiar Markdown** toma el texto. Sin haber iniciado sesión, esos botones abren el diálogo de acceso en vez de quedarse ahí deshabilitados.`,
        description:
          'Un documento compartido en TransformPipe se abre con la misma ficha de cualquier pantalla — nombre, tamaño, recuentos — y botones para guardar o copiar el texto.',
        keywords:
          'abrir un documento markdown compartido, guardar copia de un documento compartido, documento compartido conmigo, enlace para compartir markdown, descargar un documento compartido como html',
        body: `Un enlace que se le entrega a alguien debería abrir el documento, no el producto. Por eso esta página no tiene historial, no tiene zona para soltar archivos ni cuenta propia — y durante un tiempo llevó la idea demasiado lejos: lo que se mostraba sobre el documento era una línea de letra pequeña, que se leía como la vista previa de algo y no como la cosa misma.

### La misma ficha que en el resto de la aplicación

Sobre el documento aparece ahora: su nombre, una insignia que indica que se compartió contigo, cuánto pesa, cuándo se convirtió, y sus recuentos de palabras, encabezados y tablas. Es la misma ficha que el conversor coloca sobre un documento recién creado, porque es el mismo objeto, y quien decide si conservar algo necesita los mismos datos que su propietario.

### Lo que cambia son los verbos

**Guardar una copia** lo coloca en tu propia cuenta, y es una copia: el documento de quien lo envió sigue siendo suyo, y nada de lo que se haga aquí lo alcanza. **Compartir** se refiere a esa copia, así que al pulsarlo primero se guarda una en lugar de ofrecer republicar el documento de otra persona. **Copiar Markdown** toma el texto, y **Descargar** entrega un archivo \`.html\` autónomo que se abre en cualquier lugar sin conexión.

Sin haber iniciado sesión, ninguno de esos botones se queda ahí deshabilitado explicándose: abren el diálogo de acceso, porque quien ya ha pulsado Guardar ya ha dicho lo que quiere. El diálogo, no Google directamente — a quien se le envió el enlace se le envió a una dirección que bien podría no ser una cuenta de Google.

### Dos páginas, y cuál te toca

Un enlace que cualquiera puede abrir es \`/s/<token>\`, generado por el servidor, sin ejecutar ningún script y susceptible de almacenarse en caché — lo que mantiene fuera de la base de datos a un documento muy visitado. Un documento compartido con direcciones concretas no se le puede entregar a un lector no identificado, así que ese enlace lo envía a \`/open/<token>\`, la vista propia de la aplicación, que sabe pedirle que inicie sesión con la dirección con la que se compartió.

Ninguna de las dos se indexa. Ambas llevan al pie un enlace para informar de este documento, y un enlace que nunca se compartió o que ya se revocó lo dice, en lugar de mostrar una página obsoleta.

Relacionado: [compartir un documento como enlace](/blog/share-a-markdown-document-as-a-link) y [convertir una salida de IA en una página que se pueda compartir](/blog/ai-output-to-a-shareable-page).`,
      },
      it: {
        title: 'Un documento che qualcuno ha condiviso con te è un documento',
        summary: `La pagina aperta da un link di condivisione porta ora la stessa scheda che ogni altra schermata mette sopra un documento — il nome, il peso, il momento della conversione e i conteggi — invece di una riga in piccolo. «Salva una copia» lo mette nel tuo account, «Condividi» pubblica quella copia, e «Copia il Markdown» ne prende il testo. Da disconnesso, questi pulsanti aprono la finestra di accesso invece di restare lì disattivati.`,
        description:
          'Un documento condiviso con te su TransformPipe si apre con la stessa scheda di ogni schermata — nome, peso, conteggi — e pulsanti per salvarlo o copiarne il testo.',
        keywords:
          'aprire un documento markdown condiviso, salvare una copia di un documento condiviso, chi mi ha condiviso questo documento, link di condivisione markdown, scaricare un documento condiviso come html',
        body: `Un link dato a qualcuno dovrebbe aprire il documento, non il prodotto. È per questo che questa pagina non ha cronologia, non ha area di trascinamento e non ha un account proprio — e per un certo periodo ha portato l'idea troppo lontano: sopra il documento c'era una riga in piccolo, che si leggeva come l'anteprima di qualcosa piuttosto che come la cosa stessa.

### La stessa scheda di ovunque altro

Sopra il documento c'è ora: il suo nome, un distintivo che dice che è stato condiviso con te, quanto pesa, quando è stato convertito, e i conteggi di parole, titoli e tabelle. È la scheda che il convertitore mette sopra un documento appena creato, perché è lo stesso oggetto, e chi deve decidere se conservare qualcosa vuole le stesse informazioni di chi ne è proprietario.

### Sono i verbi a fare la differenza

**Salva una copia** lo mette nel tuo account, ed è una copia: il documento di chi lo ha inviato resta suo, e nulla di ciò che fai qui lo raggiunge. **Condividi** riguarda quella copia, quindi premerlo salva prima una copia invece di offrirsi di ripubblicare il documento di qualcun altro. **Copia il Markdown** prende il testo, e **Scarica** ti dà un file \`.html\` autonomo che si apre ovunque senza connessione.

Da disconnesso, nessuno di questi pulsanti resta lì disattivato a spiegarsi: aprono la finestra di accesso, perché chi ha appena premuto Salva ha già detto cosa vuole. La finestra di accesso, non direttamente Google — a chi è stato inviato il link è stato inviato a un indirizzo che potrebbe benissimo non essere un account Google.

### Due pagine, e quale delle due riceve

Un link che chiunque può aprire è \`/s/<token>\`, generato dal server, senza eseguire alcun script, e memorizzabile nella cache — il che è ciò che tiene un documento popolare fuori dal database. Un documento condiviso con indirizzi nominati non può essere dato a un lettore che nessuno ha identificato, quindi quel link ti manda a \`/open/<token>\`, la vista propria dell'app, che sa chiederti di accedere con l'indirizzo con cui è stato condiviso.

Nessuna delle due è indicizzata. Entrambe portano in fondo un link «Segnala questo documento», e un link che non è mai stato condiviso o che è stato revocato lo dice, invece di mostrare una pagina obsoleta.

Da leggere: [condividere un documento come link](/blog/share-a-markdown-document-as-a-link), e [trasformare l'output di un'AI in una pagina condivisibile](/blog/ai-output-to-a-shareable-page).`,
      },
    },
    body:
      'The page a share link opens now carries the same card every other screen puts above a '
      + 'document — the name, what it weighs, when it was made, and the counts — instead of a line '
      + 'of small print. **Save a copy** puts it on your own account, **Share** publishes that copy, '
      + 'and **Copy Markdown** takes the text. Signed out, those buttons open the sign-in dialog '
      + 'rather than sitting there disabled.',
  },
  {
    date: '2026-09-18',
    title: 'The connector says who it is',
    slug: 'connector-identity',
    detail: {
      en: {
        description:
          'The TransformPipe connector hands an assistant a title, a sentence about what its tools do, its website and its icons — the same mark as the favicon.',
        keywords:
          'mcp connector icon, mcp server identity, what a connector shows before you connect it, add a custom connector, transformpipe mcp connector',
        body: `A connector in an assistant is a row in a list — something a person picks before they know much about it. That row used to be one word and a version number, because a name and a version were all the protocol asked for when connectors were new.

### What the server says about itself

The handshake at \`/api/mcp\` now answers with a title, a sentence about what the tools do, the address of the site, and three icons. These are the protocol's own fields for a listing — the Implementation object in the 2025-11-25 schema — so a client that has never heard of them ignores what it does not recognise and still reads the name.

The same handshake hands over a short set of instructions, and every tool carries a readable title and says whether it changes anything, destroys anything, or reaches outside the account. \`tp_usage\` and \`tp_delete_document\` look identical to somebody holding only the names.

### Where the pictures come from

One drawing: \`brand/mark.svg\`, the same fused **T** and **p** as the favicon and the phone icon, rendered to 192 and 512 pixels and offered as the SVG as well. PNG is first in the list because a client that draws icons at all can draw a PNG.

Their addresses are built from the request rather than written down. The specification asks a client to check that an icon is served from the same origin as the server, and a hard-coded production address fails that check on every preview deployment.

### The token comes before the introduction

Every message to \`/api/mcp\` needs a token, the handshake included, so a client reads this identity once it is connected rather than while somebody is still choosing. It was tried the other way and undone the same night: an unauthenticated handshake made Claude's own **Add custom connector** dialogue conclude there was no sign-in here, warn that anybody with the URL could use the connector, and offer a field for an API key this server does not take.

So the 401 stays first. It is how a client learns there is an account behind the address at all — it names the discovery document and the scopes, and the sign-in starts from there. Nothing about anybody's documents is readable without that token, which is the part worth more than a picture in a directory.

Related: [converting documents from an assistant](/blog/converting-documents-from-an-assistant), and [converting documents with an API](/blog/converting-documents-with-an-api).`,
      },
      de: {
        title: 'Der Connector sagt, wer er ist',
        summary: `Ein Assistent, der TransformPipe als Connector hinzufügt, bekommt jetzt Symbol, Name und einen Satz darüber, was die Werkzeuge tun. Lesbar ist das, sobald verbunden ist: Ohne Anmeldung ist von einem Konto nichts zu sehen — und das bleibt so.`,
        description:
          'Der TransformPipe-Connector übergibt einem Assistenten Titel, einen Satz zu seinen Werkzeugen, Website und Symbole — dieselbe Marke wie das Favicon.',
        keywords:
          'mcp connector symbol, mcp server identität, eigenen connector hinzufügen, was zeigt ein connector vor dem verbinden, transformpipe connector einrichten',
        body: `Ein Connector ist in einem Assistenten eine Zeile in einer Liste — etwas, das man auswählt, bevor man viel darüber weiß. Diese Zeile war früher ein Wort und eine Versionsnummer, denn Name und Version waren alles, was das Protokoll in seinen Anfängen verlangte.

### Was der Server über sich selbst sagt

Der Handschlag unter \`/api/mcp\` antwortet jetzt mit einem Titel, einem Satz darüber, was die Werkzeuge tun, der Adresse der Seite und drei Symbolen. Das sind die Felder, die das Protokoll selbst für eine Auflistung vorsieht — das Implementation-Objekt im Schema vom 25.11.2025 —, und ein Client, der sie nicht kennt, überliest sie und findet trotzdem den Namen.

Derselbe Handschlag übergibt eine kurze Anleitung, und jedes Werkzeug trägt einen lesbaren Titel und sagt, ob es etwas ändert, etwas zerstört oder über das Konto hinausgreift. \`tp_usage\` und \`tp_delete_document\` sehen für jemanden, der nur die Namen hat, gleich aus.

### Woher die Bilder kommen

Aus einer Zeichnung: \`brand/mark.svg\`, dasselbe verschmolzene **T** und **p** wie im Favicon und im Symbol auf dem Telefon, gerendert auf 192 und 512 Pixel und zusätzlich als SVG angeboten. PNG steht zuerst in der Liste, denn ein Client, der überhaupt Symbole zeichnet, zeichnet PNG.

Die Adressen dazu werden aus der Anfrage gebaut, statt fest hinterlegt zu sein. Die Spezifikation verlangt, dass ein Client prüft, ob ein Symbol von derselben Herkunft wie der Server kommt — und eine fest eingetragene Produktionsadresse fällt bei dieser Prüfung in jeder Vorschau-Bereitstellung durch.

### Das Token kommt vor der Vorstellung

Jede Nachricht an \`/api/mcp\` braucht ein Token, der Handschlag eingeschlossen. Ein Client liest diese Identität also, sobald er verbunden ist, und nicht schon während der Auswahl. Der umgekehrte Weg war kurz in Betrieb und noch in derselben Nacht zurückgenommen: Ein Handschlag ohne Token brachte Claudes eigenen Dialog **Add custom connector** zu dem Schluss, hier gebe es keine Anmeldung — er warnte, jeder mit der URL könne den Connector benutzen, und bot ein Feld für einen API-Schlüssel an, den dieser Server nicht annimmt.

Der 401 bleibt deshalb vorne. Er ist der Weg, auf dem ein Client überhaupt erfährt, dass hinter der Adresse ein Konto steht: Er nennt das Discovery-Dokument und die Berechtigungen, und von dort beginnt die Anmeldung. Ohne dieses Token ist von den Dokumenten nichts lesbar — und das ist mehr wert als ein Bild in einem Verzeichnis.

Weiter: [Dokumente aus einem Assistenten konvertieren](/blog/converting-documents-from-an-assistant) und [Dokumente über eine API konvertieren](/blog/converting-documents-with-an-api).`,
      },
      fr: {
        title: 'Le connecteur dit qui il est',
        summary: `Le connecteur porte désormais une icône, un nom et une phrase sur ce qu’il fait, si bien qu’un assistant montre à quoi il est connecté plutôt qu’une simple URL. Cette identité se lit après la connexion, pas avant : chaque message a besoin d’un jeton, \`initialize\` compris, car un serveur qui répond à ce message sans jeton est un serveur qu’un client lit comme n’ayant aucune connexion du tout.`,
        description:
          'Le connecteur TransformPipe transmet à un assistant un titre, une phrase sur ses outils, l’adresse du site et ses icônes — la même marque que le favicon.',
        keywords:
          'icône du connecteur mcp, identité d’un serveur mcp, ce qu’affiche un connecteur avant de s’y connecter, ajouter un connecteur personnalisé, connecteur mcp transformpipe',
        body: `Un connecteur dans un assistant est une ligne dans une liste — quelque chose que l’on choisit avant d’en savoir grand-chose. Cette ligne se limitait autrefois à un mot et un numéro de version, car un nom et une version étaient tout ce que le protocole demandait à l’époque où les connecteurs étaient nouveaux.

### Ce que le serveur dit de lui-même

La poignée de main sur \`/api/mcp\` répond désormais avec un titre, une phrase sur ce que font les outils, l’adresse du site, et trois icônes. Ce sont les champs que le protocole prévoit lui-même pour une inscription — l’objet Implementation du schéma du 25 novembre 2025 — si bien qu’un client qui ne les connaît pas ignore ce qu’il ne reconnaît pas et lit tout de même le nom.

La même poignée de main transmet un court jeu d’instructions, et chaque outil porte un titre lisible et indique s’il change quelque chose, détruit quelque chose, ou sort du compte. \`tp_usage\` et \`tp_delete_document\` se ressemblent, pour qui n’a que les noms.

### D’où viennent les images

D’un seul dessin : \`brand/mark.svg\`, le même **T** et **p** fondus que le favicon et l’icône du téléphone, rendu en 192 et 512 pixels et proposé aussi en SVG. Le PNG vient en premier dans la liste, car un client capable de dessiner des icônes sait dessiner un PNG.

Leurs adresses sont construites à partir de la requête plutôt qu’écrites en dur. La spécification demande à un client de vérifier qu’une icône est servie depuis la même origine que le serveur, et une adresse de production écrite en dur échoue à cette vérification à chaque déploiement de prévisualisation.

### Le jeton vient avant la présentation

Chaque message vers \`/api/mcp\` a besoin d’un jeton, poignée de main comprise, si bien qu’un client lit cette identité une fois connecté plutôt que pendant qu’il choisit encore. L’inverse a été essayé et annulé la même nuit : une poignée de main sans authentification amenait la boîte de dialogue **Add custom connector** de Claude à conclure qu’il n’y avait ici aucune connexion, à avertir que n’importe qui muni de l’URL pourrait utiliser le connecteur, et à proposer un champ pour une clé d’API que ce serveur n’accepte pas.

Le 401 reste donc en premier. C’est ainsi qu’un client apprend qu’il existe un compte derrière cette adresse : il nomme le document de découverte et les autorisations, et la connexion commence à partir de là. Rien des documents de personne n’est lisible sans ce jeton — et cela vaut plus qu’une image dans un annuaire.

Autres lectures : [convertir des documents depuis un assistant](/blog/converting-documents-from-an-assistant), et [convertir des documents avec une API](/blog/converting-documents-with-an-api).`,
      },
      es: {
        title: 'El conector dice quién es',
        summary: `El conector ahora lleva un icono, un nombre y una frase sobre lo que hace, de modo que un asistente muestra a qué está conectado en lugar de una URL desnuda. Se lee después de iniciar sesión, no antes: cada mensaje necesita un token, \`initialize\` incluido, porque un servidor que responde a ese mensaje sin token es un servidor que un cliente interpreta como si no tuviera ningún inicio de sesión.`,
        description:
          'El conector de TransformPipe entrega a un asistente un título, una frase sobre sus herramientas, su web y sus iconos — la misma marca que el favicon.',
        keywords:
          'icono del conector mcp, identidad de un servidor mcp, qué muestra un conector antes de conectarlo, añadir un conector personalizado, conector mcp de transformpipe',
        body: `Un conector, dentro de un asistente, es una fila en una lista — algo que se elige antes de saber mucho sobre ello. Esa fila solía ser una palabra y un número de versión, porque un nombre y una versión eran todo lo que el protocolo pedía cuando los conectores eran nuevos.

### Lo que el servidor dice de sí mismo

El saludo inicial en \`/api/mcp\` responde ahora con un título, una frase sobre lo que hacen las herramientas, la dirección del sitio y tres iconos. Son los campos que el propio protocolo prevé para una ficha — el objeto Implementation del esquema del 25-11-2025 —, así que un cliente que no los conoce los ignora y aun así lee el nombre.

Ese mismo saludo entrega un breve conjunto de instrucciones, y cada herramienta lleva un título legible y dice si cambia algo, si destruye algo o si alcanza más allá de la cuenta. \`tp_usage\` y \`tp_delete_document\` parecen idénticos para quien solo tiene los nombres.

### De dónde vienen las imágenes

De un único dibujo: \`brand/mark.svg\`, la misma **T** y **p** fundidas que aparecen en el favicon y en el icono del teléfono, renderizadas a 192 y 512 píxeles y ofrecidas también como SVG. El PNG va primero en la lista porque un cliente capaz de dibujar iconos, sea cual sea, sabe dibujar un PNG.

Sus direcciones se construyen a partir de la petición en lugar de estar escritas de antemano. La especificación exige que un cliente compruebe que un icono se sirve desde el mismo origen que el servidor, y una dirección de producción fija no pasa esa comprobación en ningún despliegue de vista previa.

### El token llega antes que la presentación

Todo mensaje a \`/api/mcp\` necesita un token, saludo inicial incluido, así que un cliente lee esta identidad una vez conectado y no mientras alguien todavía está eligiendo. Se probó al revés y se deshizo la misma noche: un saludo sin autenticar hacía que el propio diálogo **Add custom connector** de Claude concluyera que aquí no había inicio de sesión, avisara de que cualquiera con la URL podría usar el conector, y ofreciera un campo para una clave de API que este servidor no acepta.

Por eso el 401 se mantiene primero. Es el modo en que un cliente se entera de que existe una cuenta detrás de la dirección: nombra el documento de descubrimiento y los permisos, y el inicio de sesión empieza desde ahí. Nada sobre los documentos de nadie se puede leer sin ese token, que vale más que una imagen en un directorio.

Relacionado: [convertir documentos desde un asistente](/blog/converting-documents-from-an-assistant) y [convertir documentos con una API](/blog/converting-documents-with-an-api).`,
      },
      it: {
        title: 'Il connettore dice chi è',
        summary: `Il connettore porta ora un'icona, un nome e una frase su ciò che fa, così un assistente mostra a cosa è collegato invece di un semplice URL. Viene letto dopo l'accesso, non prima: ogni messaggio richiede un token, \`initialize\` incluso, perché un server che risponde a questo senza un token è un server che un client legge come privo di qualsiasi accesso.`,
        description:
          'Il connettore TransformPipe fornisce a un assistente un titolo, una frase sui suoi strumenti, il sito web e le icone — lo stesso marchio del favicon dell\'app.',
        keywords:
          'icona del connettore mcp, identità di un server mcp, cosa vedi prima di collegare un connettore, aggiungere un connettore personalizzato, connettore mcp di transformpipe',
        body: `Un connettore in un assistente è una riga in un elenco — qualcosa che una persona scelga prima di saperne molto. Quella riga era prima una sola parola e un numero di versione, perché un nome e una versione erano tutto ciò che il protocollo chiedeva quando i connettori erano nuovi.

### Che cosa dice il server di se stesso

L'handshake su \`/api/mcp\` risponde ora con un titolo, una frase su ciò che fanno gli strumenti, l'indirizzo del sito e tre icone. Sono i campi che il protocollo stesso prevede per un elenco — l'oggetto Implementation nello schema del 25-11-2025 — quindi un client che non li conosce ignora ciò che non riconosce e legge comunque il nome.

Lo stesso handshake consegna una breve serie di istruzioni, e ogni strumento porta un titolo leggibile e dice se modifica qualcosa, distrugge qualcosa o raggiunge l'esterno dell'account. \`tp_usage\` e \`tp_delete_document\` appaiono identici a chi ha in mano solo i nomi.

### Da dove vengono le immagini

Da un solo disegno: \`brand/mark.svg\`, la stessa **T** e **p** fuse del favicon e dell'icona sul telefono, resa a 192 e 512 pixel e offerta anche come SVG. Il PNG è primo nell'elenco perché un client che disegna icone in qualche modo può sempre disegnare un PNG.

I loro indirizzi sono costruiti a partire dalla richiesta, non scritti in modo fisso. La specifica chiede a un client di verificare che un'icona provenga dalla stessa origine del server, e un indirizzo di produzione scritto in modo fisso fallisce quel controllo a ogni distribuzione di anteprima.

### Il token viene prima della presentazione

Ogni messaggio a \`/api/mcp\` richiede un token, handshake incluso, cosicché un client legge questa identità una volta collegato e non mentre qualcuno sta ancora scegliendo. Si è provato il contrario, e la scelta è stata annullata la notte stessa: un handshake senza autenticazione portava la finestra **Add custom connector** di Claude a concludere che qui non ci fosse alcun accesso, ad avvertire che chiunque avesse l'URL avrebbe potuto usare il connettore, e a offrire un campo per una chiave API che questo server non accetta.

Per questo il 401 resta al primo posto. È così che un client scopre che dietro quell'indirizzo c'è un account: nomina il documento di discovery e gli ambiti, e l'accesso comincia da lì. Senza quel token nulla dei documenti di chiunque è leggibile, e questo vale più di un'immagine in un elenco.

Da leggere: [convertire documenti da un assistente](/blog/converting-documents-from-an-assistant), e [convertire documenti con un'API](/blog/converting-documents-with-an-api).`,
      },
    },
    body:
      'The connector now carries an icon, a name and a sentence about what it does, so an assistant '
      + 'shows what it is connected to rather than a bare URL. It is read after signing in, not '
      + 'before: every message needs a token, `initialize` included, because a server that answers '
      + 'one without a token is a server a client reads as having no sign-in at all.',
  },
  {
    date: '2026-09-17',
    title: 'A browser extension',
    slug: 'browser-extension',
    detail: {
      en: {
        description:
          'The TransformPipe extension turns the page you are reading into Markdown from the toolbar — in Chrome, Edge and Firefox, with nothing uploaded.',
        keywords:
          'markdown converter chrome extension, save web page as markdown, html to markdown browser extension, convert article to markdown, web clipper markdown, firefox markdown extension',
        body: `The thing that makes this worth installing is not the button. It is that the conversion happens inside the page, where \`getComputedStyle\` still exists and the extension can see what a reader sees rather than what the markup says.

### What it does that a copy and paste does not

A web page is not a document. Selecting an article and pasting it into an editor brings the menus with it, loses the table structure, and turns every code block into prose. The extension reads the page the way a reader sees it: it finds the article, drops the furniture, keeps the headings, the tables, the lists and the code fences, and puts back the spaces that CSS was holding — a row of stats laid out as flex items serialises as \`39words\` in every other clipper, and arrives here as "39 words".

Selecting part of the page first converts the selection instead of the article, which is the fastest way to lift one table out of a documentation page.

### The side panel

The same thing, kept open beside the page. It converts each tab as you arrive at it, so moving through a set of search results means reading the Markdown of each one rather than pressing a button per page. It remembers whether you prefer the panel or the popup.

### All ten conversions, offline

The extension carries the site's converters rather than calling it: Markdown to HTML, HTML to Markdown, \`.docx\`, \`.csv\`, \`.xlsx\`, JSON, plain text, a Notion or Confluence export, an Obsidian vault. Nothing is uploaded, nothing needs a network, and none of it depends on an account.

### With an account

Signed in, **Save** puts the document on the account and **Share** opens the same dialogue the site has: private, anybody with the link, or named addresses who each sign in. The extension asks for no host permissions — it can only read a page at the moment you press the button, which is what \`activeTab\` means and why the permission list is as short as it is.

Chrome and Edge install it from the Web Store; Firefox from its own listing.

Related: [saving a web page as Markdown](/blog/save-a-web-page-as-markdown), and [what a converter should keep from a \`.docx\`](/blog/what-not-to-keep-from-a-docx).`,
      },
      de: {
        title: 'Eine Browser-Erweiterung',
        summary: `Die Seite, die Sie gerade lesen, als Markdown — ohne sie zu verlassen: ein Druck auf die Schaltfläche in der Symbolleiste, und der Artikel kommt ohne Navigation, Seitenleiste und Cookie-Hinweis zurück. Kopieren, herunterladen, oder die ganze Seite als eigenständige \`.html\`-Datei mit ihren Bildern darin speichern. Angemeldet legen **Speichern** und **Teilen** ein Dokument in Ihrem Konto ab.`,
        description:
          'Die TransformPipe-Erweiterung macht aus der Seite, die Sie gerade lesen, per Knopf in der Symbolleiste Markdown — in Chrome, Edge und Firefox, ohne Upload.',
        keywords:
          'markdown konverter chrome erweiterung, webseite als markdown speichern, html in markdown browser erweiterung, artikel in markdown umwandeln, web clipper markdown, firefox markdown erweiterung',
        body: `Was die Installation lohnend macht, ist nicht der Knopf. Es ist, dass die Konvertierung in der Seite selbst stattfindet, wo \`getComputedStyle\` noch existiert und die Erweiterung sehen kann, was ein Leser sieht, statt nur, was im Markup steht.

### Was es kann, was Kopieren und Einfügen nicht kann

Eine Webseite ist kein Dokument. Wer einen Artikel markiert und in einen Editor einfügt, nimmt die Menüs mit, verliert den Bau der Tabellen und macht aus jedem Codeblock Fließtext. Die Erweiterung liest die Seite so, wie ein Mensch sie sieht: sie findet den Artikel, lässt das Mobiliar weg, behält Überschriften, Tabellen, Listen und Code-Zäune und setzt die Leerzeichen zurück, die das CSS gehalten hat — eine Reihe von Kennzahlen, als Flex-Elemente gesetzt, wird in jedem anderen Clipper zu \`39words\` und kommt hier als "39 words" an.

Markieren Sie vorher einen Teil der Seite, wird die Markierung konvertiert statt des Artikels — der schnellste Weg, eine einzelne Tabelle aus einer Dokumentationsseite zu heben.

### Die Seitenleiste des Browsers

Dasselbe, offen neben der Seite. Sie konvertiert jeden Tab, sobald Sie ihn aufrufen: Wer sich durch eine Reihe von Suchtreffern bewegt, liest das Markdown jedes Treffers, statt pro Seite einen Knopf zu drücken. Sie merkt sich, ob Sie die Leiste oder das Popup bevorzugen.

### Alle zehn Konvertierungen, offline

Die Erweiterung bringt die Konverter der Seite mit, statt sie aufzurufen: Markdown zu HTML, HTML zu Markdown, \`.docx\`, \`.csv\`, \`.xlsx\`, JSON, reiner Text, ein Notion- oder Confluence-Export, ein Obsidian-Tresor. Nichts wird hochgeladen, nichts braucht ein Netz, und nichts davon hängt an einem Konto.

### Mit Konto

Angemeldet legt **Speichern** das Dokument auf das Konto, und **Teilen** öffnet denselben Dialog wie die Seite: privat, für alle mit dem Link, oder für benannte Adressen, die sich jeweils anmelden. Die Erweiterung verlangt keine Host-Berechtigungen — sie darf eine Seite nur in dem Moment lesen, in dem Sie den Knopf drücken, was \`activeTab\` bedeutet und warum die Liste der Berechtigungen so kurz ist.

Chrome und Edge installieren sie aus dem Web Store, Firefox aus dem eigenen Verzeichnis.

Weiter: [eine Webseite als Markdown sichern](/blog/save-a-web-page-as-markdown) und [was ein Konverter aus einer \`.docx\` behalten sollte](/blog/what-not-to-keep-from-a-docx).`,
      },
      fr: {
        title: 'Une extension de navigateur',
        summary: `La page où vous êtes, en Markdown, sans la quitter : appuyez sur le bouton de la barre d’outils, et l’article revient sans la navigation, la barre latérale ni l’avis sur les cookies. Copiez-le, téléchargez-le, ou enregistrez la page en fichier \`.html\` autonome avec ses images à l’intérieur. Le panneau latéral fait la même chose en restant ouvert à côté de la page, convertissant chaque onglet dès que vous l’ouvrez, et les dix conversions du site tournent aussi dans l’extension — rien n’est envoyé et rien n’a besoin de réseau. Connecté, Enregistrer et Partager placent un document sur votre compte et publient un lien, ou désignent les personnes autorisées à le lire. [Ce qu’elle est, et ce qu’elle ne fait jamais](/extension).`,
        description:
          'L’extension TransformPipe transforme en Markdown, depuis la barre d’outils, la page que vous lisez — sur Chrome, Edge et Firefox, sans rien envoyer sur un serveur.',
        keywords:
          'extension chrome convertisseur markdown, enregistrer une page web en markdown, extension navigateur html vers markdown, convertir un article en markdown, web clipper markdown, extension firefox markdown',
        body: `Ce qui rend l’installation utile n’est pas le bouton. C’est que la conversion a lieu dans la page elle-même, là où \`getComputedStyle\` existe encore et où l’extension voit ce qu’un lecteur voit, et non ce que dit le balisage.

### Ce qu’elle fait qu’un copier-coller ne fait pas

Une page web n’est pas un document. Sélectionner un article et le coller dans un éditeur emporte les menus avec lui, perd la structure des tableaux, et transforme chaque bloc de code en simple texte. L’extension lit la page comme la voit un lecteur : elle repère l’article, laisse le mobilier de côté, garde les titres, les tableaux, les listes et les blocs de code, et remet les espaces que le CSS retenait — une rangée de statistiques posée en éléments flex se sérialise en \`39words\` chez tout autre clipper, et arrive ici sous la forme « 39 words ».

Sélectionner d’abord une partie de la page convertit la sélection au lieu de l’article — le moyen le plus rapide d’extraire un seul tableau d’une page de documentation.

### Le panneau latéral

La même chose, laissée ouverte à côté de la page. Il convertit chaque onglet dès que vous l’ouvrez, si bien que parcourir une série de résultats de recherche revient à lire le Markdown de chacun plutôt qu’à appuyer sur un bouton par page. Il se souvient si vous préférez le panneau ou la fenêtre surgissante.

### Les dix conversions, hors ligne

L’extension embarque les convertisseurs du site plutôt que de les appeler : Markdown vers HTML, HTML vers Markdown, \`.docx\`, \`.csv\`, \`.xlsx\`, JSON, texte brut, un export Notion ou Confluence, un coffre Obsidian. Rien n’est envoyé, rien ne demande de réseau, et rien de tout cela ne dépend d’un compte.

### Avec un compte

Connecté, **Enregistrer** place le document sur le compte et **Partager** ouvre la même boîte de dialogue que le site : privé, toute personne ayant le lien, ou des adresses nommées qui se connectent chacune. L’extension ne demande aucune autorisation d’hôte : elle ne peut lire une page qu’au moment où vous appuyez sur le bouton, ce que signifie \`activeTab\`, et c’est pourquoi la liste des autorisations est aussi courte.

Chrome et Edge l’installent depuis leur boutique ; Firefox depuis sa propre liste.

Autres lectures : [enregistrer une page web en Markdown](/blog/save-a-web-page-as-markdown), et [ce qu’un convertisseur devrait garder d’un \`.docx\`](/blog/what-not-to-keep-from-a-docx).`,
      },
      es: {
        title: 'Una extensión de navegador',
        summary: `La página en la que está, convertida a Markdown, sin salir de ella: pulsa el botón de la barra de herramientas y el artículo vuelve sin la navegación, la barra lateral ni el aviso de cookies. Cópialo, descárgalo, o guarda la página como un archivo \`.html\` autónomo con sus imágenes dentro. El panel lateral es lo mismo, mantenido abierto junto a la página, convirtiendo cada pestaña en cuanto se llega a ella, y las diez conversiones del sitio también corren dentro de la extensión — nada se sube y nada de ello necesita red. Con la sesión iniciada, Guardar y Compartir colocan un documento en tu cuenta y publican un enlace o nombran a quienes pueden leerlo. [Qué es y qué no hace nunca](/extension).`,
        description:
          'La extensión de TransformPipe convierte la página que estás leyendo en Markdown desde la barra de herramientas — en Chrome, Edge y Firefox, sin subir nada.',
        keywords:
          'extensión de chrome para convertir a markdown, guardar una página web como markdown, extensión de navegador html a markdown, convertir un artículo a markdown, recortador web markdown, extensión de firefox para markdown',
        body: `Lo que hace que merezca la pena instalarla no es el botón. Es que la conversión ocurre dentro de la propia página, donde \`getComputedStyle\` todavía existe y la extensión puede ver lo que ve un lector y no lo que dice el marcado.

### Lo que hace que copiar y pegar no hace

Una página web no es un documento. Seleccionar un artículo y pegarlo en un editor arrastra los menús consigo, pierde la estructura de las tablas y convierte cada bloque de código en simple prosa. La extensión lee la página como la ve un lector: encuentra el artículo, descarta el mobiliario, conserva los encabezados, las tablas, las listas y los bloques de código, y repone los espacios que sostenía el CSS — una fila de estadísticas dispuesta con flexbox se serializa como \`39words\` en cualquier otro recortador, y aquí llega como «39 words».

Seleccionar antes una parte de la página convierte la selección en lugar del artículo, que es la forma más rápida de sacar una sola tabla de una página de documentación.

### El panel lateral

Lo mismo, mantenido abierto junto a la página. Convierte cada pestaña en cuanto se llega a ella, de modo que recorrer una serie de resultados de búsqueda significa leer el Markdown de cada uno en lugar de pulsar un botón por página. Recuerda si prefieres el panel o la ventana emergente.

### Las diez conversiones, sin conexión

La extensión lleva consigo los conversores del sitio en lugar de llamarlo: Markdown a HTML, HTML a Markdown, \`.docx\`, \`.csv\`, \`.xlsx\`, JSON, texto sin formato, una exportación de Notion o Confluence, un depósito de Obsidian. Nada se sube, nada necesita red, y nada de ello depende de una cuenta.

### Con una cuenta

Con la sesión iniciada, **Guardar** coloca el documento en la cuenta y **Compartir** abre el mismo diálogo que tiene el sitio: privado, cualquiera con el enlace, o direcciones concretas que inician sesión cada una por su lado. La extensión no pide permisos sobre los sitios — solo puede leer una página en el momento en que se pulsa el botón, que es lo que significa \`activeTab\` y por qué la lista de permisos es tan corta como es.

Chrome y Edge la instalan desde su tienda; Firefox, desde su propio listado.

Relacionado: [guardar una página web como Markdown](/blog/save-a-web-page-as-markdown) y [qué debería conservar un conversor de un \`.docx\`](/blog/what-not-to-keep-from-a-docx).`,
      },
      it: {
        title: 'Un\'estensione per il browser',
        summary: `La pagina che stai leggendo, in Markdown, senza doverla lasciare: premendo il pulsante nella barra degli strumenti, l'articolo ritorna senza la navigazione, la barra laterale o l'avviso sui cookie. Lo puoi copiare, scaricare, o salvare la pagina come file \`.html\` autonomo con le immagini incluse. Il pannello laterale è la stessa cosa tenuta aperta accanto alla pagina, e converte ogni scheda non appena vi arriva; le dieci conversioni del sito girano anche dentro l'estensione — nulla viene caricato e nulla richiede una rete. Con l'accesso effettuato, Salva e Condividi mettono un documento nel tuo account e pubblicano un link, oppure nominano le persone che possono leggerlo. [Che cosa fa e che cosa non fa mai](/extension).`,
        description:
          'L\'estensione TransformPipe trasforma in Markdown la pagina che leggi dalla barra degli strumenti — su Chrome, Edge e Firefox, senza caricare nulla.',
        keywords:
          'estensione chrome per convertire in markdown, salvare una pagina web come markdown, estensione browser da html a markdown, convertire un articolo in markdown, web clipper markdown, estensione firefox markdown',
        body: `La cosa che rende utile installarla non è il pulsante. È che la conversione avviene dentro la pagina stessa, dove \`getComputedStyle\` esiste ancora e l'estensione può vedere ciò che vede un lettore, non solo ciò che dice il markup.

### Che cosa fa che copiare e incollare non fa

Una pagina web non è un documento. Selezionare un articolo e incollarlo in un editor porta con sé i menu, perde la struttura delle tabelle e trasforma ogni blocco di codice in prosa. L'estensione legge la pagina come la vede un lettore: trova l'articolo, elimina gli elementi di contorno, mantiene i titoli, le tabelle, gli elenchi e i blocchi di codice, e rimette gli spazi che il CSS teneva in piedi — una riga di statistiche impaginata come elementi flex viene serializzata come \`39words\` in qualunque altro clipper, e arriva qui come «39 words».

Selezionare prima una parte della pagina converte la selezione invece dell'intero articolo, il modo più rapido per estrarre una sola tabella da una pagina di documentazione.

### Il pannello laterale

La stessa cosa, tenuta aperta accanto alla pagina. Converte ogni scheda non appena vi arriva, così scorrere una serie di risultati di ricerca significa leggere il Markdown di ognuno invece di premere un pulsante per pagina. Ricorda se preferisci il pannello o il popup.

### Tutte le dieci conversioni, offline

L'estensione porta con sé i convertitori del sito, invece di richiamarlo: Markdown in HTML, HTML in Markdown, \`.docx\`, \`.csv\`, \`.xlsx\`, JSON, testo semplice, un export da Notion o Confluence, un vault di Obsidian. Nulla viene caricato, nulla richiede una rete, e nulla di tutto ciò dipende da un account.

### Con un account

Con l'accesso effettuato, **Salva** mette il documento sull'account e **Condividi** apre la stessa finestra che ha il sito: privato, chiunque abbia il link, o indirizzi nominati che accedono ciascuno separatamente. L'estensione non richiede permessi sui siti — può leggere una pagina solo nel momento in cui si preme il pulsante, il che è ciò che significa \`activeTab\` e il motivo per cui l'elenco dei permessi è così breve.

Chrome ed Edge la installano dal Web Store; Firefox dal proprio elenco.

Da leggere: [salvare una pagina web come Markdown](/blog/save-a-web-page-as-markdown), e [che cosa dovrebbe mantenere un convertitore da un \`.docx\`](/blog/what-not-to-keep-from-a-docx).`,
      },
    },
    body:
      'The page you are on, as Markdown, without leaving it: press the button in the toolbar and '
      + 'the article comes back without the navigation, the sidebar or the cookie notice. Copy it, '
      + 'download it, or save the page as a self-contained `.html` file with its pictures inside. '
      + 'The side panel is the same thing kept open beside the page, converting each tab as you '
      + 'arrive at it, and the ten conversions the site has run inside the extension too — nothing '
      + 'is uploaded and none of it needs a network. Signed in, Save and Share put a document on '
      + 'your account and publish a link or name the people who may read it. '
      + '[What it is and what it never does](/extension).',
  },
  {
    date: '2026-09-17',
    title: 'A shared document says where it came from',
    slug: 'shared-document-provenance',
    detail: {
      en: {
        description:
          'A shared TransformPipe page says at its foot what made it and offers a way to convert a file of your own; the downloaded .html carries the same line.',
        keywords:
          'share a markdown document as a link, what made this page, shared document footer, self-contained html footer, convert a file like this one',
        body: `Somebody who opens a link you sent has no reason to know what made the page they are reading. It is a document at an address, with no menu and no product around it — which is deliberate, and left a reader with nowhere to go when what they wanted was to do the same thing with a file of their own.

### What is at the foot of a shared page

One line under the document: that it is a shared document, when it was converted, and a link to report it if it should not be public. Under that, a short block naming what made the page, what the site converts, and two links — one to the converter, one to the account that keeps documents.

Nothing above the document moved. The card at the top is the same card the app puts over any document — the name, what it weighs, when it was made, the counts — with **Save to your account** and **Download .html** where they were.

### The downloaded file carries the line too

The self-contained \`.html\` ends with the document's name, when it was converted, and *made with TransformPipe*. That file is the one that gets emailed and opened on a machine with no network, so the line is text and a link and nothing else: no script, no image, no web font. The shared page runs no script either — it is HTML rendered once on the way out.

### Why the foot and not the top

A shared link is somebody else's document, and the top of it belongs to them. A banner over the first paragraph would be an advertisement in the middle of something a colleague sent to be read, and the document is the reason the page exists.

### What it does not do

It does not change the document. The Markdown, the HTML and every heading, table and link in them are exactly what they were, so a link you shared last month renders the same today. The two links carry \`?from=shared\` and \`?from=file\` in the address, and that marker is the whole of what is added — no identifier for the reader, no request to anywhere, nothing written to their browser.

Related: [sharing a Markdown document as a link](/blog/share-a-markdown-document-as-a-link), and [what a self-contained HTML file is](/blog/self-contained-html-explained).`,
      },
      de: {
        title: 'Ein geteiltes Dokument sagt, woher es kommt',
        summary: `Wer einen von Ihnen geteilten Link öffnet, findet am Fuß der Seite eine Zeile darüber, was sie gemacht hat, und einen Weg, etwas Eigenes zu konvertieren. Die heruntergeladene \`.html\` trägt dieselbe Zeile leise in ihrer Fußzeile. Am Dokument selbst hat sich nichts geändert.`,
        description:
          'Eine geteilte TransformPipe-Seite nennt am Fuß, was sie gemacht hat, und bietet den Weg zur eigenen Konvertierung; die `.html` trägt dieselbe Zeile.',
        keywords:
          'markdown dokument als link teilen, wer hat diese seite gemacht, fußzeile eines geteilten dokuments, eigenständige html datei mit fußzeile, eigene datei konvertieren',
        body: `Wer einen Link öffnet, den Sie verschickt haben, hat keinen Anlass zu wissen, was die Seite gemacht hat, die er liest. Es ist ein Dokument unter einer Adresse, ohne Menü und ohne Produkt darum herum — das ist Absicht, und es ließ einen Leser ohne Weg zurück, wenn er dasselbe mit einer eigenen Datei tun wollte.

### Was am Fuß einer geteilten Seite steht

Eine Zeile unter dem Dokument: dass es ein geteiltes Dokument ist, wann es konvertiert wurde, und ein Link, um es zu melden, falls es nicht öffentlich sein sollte. Darunter ein kurzer Block, der nennt, was die Seite gemacht hat, was die Seite konvertiert, und zwei Links — einen zum Konverter, einen zum Konto, das Dokumente aufbewahrt.

Über dem Dokument hat sich nichts verschoben. Die Karte oben ist dieselbe, die die App über jedes Dokument setzt — Name, Gewicht, Entstehungszeit, die Kennzahlen — mit **Save to your account** und **Download .html** an ihrem Platz.

### Die heruntergeladene Datei trägt die Zeile ebenfalls

Die in sich geschlossene \`.html\` endet mit dem Namen des Dokuments, dem Zeitpunkt der Konvertierung und *made with TransformPipe*. Genau diese Datei wird per E-Mail verschickt und auf Rechnern ohne Netz geöffnet, deshalb ist die Zeile Text und ein Link und sonst nichts: kein Skript, kein Bild, keine Web-Schrift. Auch die geteilte Seite führt kein Skript aus — sie ist HTML, einmal beim Ausliefern erzeugt.

### Warum unten und nicht oben

Ein geteilter Link ist das Dokument eines anderen Menschen, und der Anfang gehört ihm. Ein Banner über dem ersten Absatz wäre Werbung mitten in etwas, das eine Kollegin zum Lesen geschickt hat — und das Dokument ist der Grund, warum die Seite existiert.

### Was es nicht tut

Es verändert das Dokument nicht. Das Markdown, das HTML und jede Überschrift, Tabelle und Verknüpfung darin sind unverändert, ein Link von letztem Monat sieht also heute genauso aus. Die beiden Links tragen \`?from=shared\` und \`?from=file\` in der Adresse, und dieser Vermerk ist alles, was hinzukommt — keine Kennung für den Leser, keine Anfrage irgendwohin, nichts, was in seinem Browser gespeichert wird.

Weiter: [ein Markdown-Dokument als Link teilen](/blog/share-a-markdown-document-as-a-link) und [was eine in sich geschlossene HTML-Datei ist](/blog/self-contained-html-explained).`,
      },
      fr: {
        title: 'Un document partagé dit d’où il vient',
        summary: `Quiconque ouvre un lien que vous avez partagé trouve désormais, en bas de la page, une ligne sur ce qui l’a produite, et un moyen de convertir quelque chose de son côté. Le \`.html\` téléchargé porte la même ligne, discrètement, dans son pied de page. Rien n’a changé dans le document lui-même.`,
        description:
          'Une page partagée de TransformPipe indique en bas ce qui l’a produite et propose de convertir un fichier à vous ; le `.html` téléchargé porte la même ligne.',
        keywords:
          'partager un document markdown sous forme de lien, qui a créé cette page, pied de page d’un document partagé, pied de page d’un fichier html autonome, convertir son propre fichier',
        body: `Quelqu’un qui ouvre un lien que vous avez envoyé n’a aucune raison de savoir ce qui a produit la page qu’il lit. C’est un document à une adresse, sans menu et sans produit autour — c’est voulu, et cela laissait un lecteur sans où aller quand il voulait faire la même chose avec un fichier à lui.

### Ce qu’il y a au bas d’une page partagée

Une ligne sous le document : qu’il s’agit d’un document partagé, le moment de sa conversion, et un lien pour le signaler s’il ne devrait pas être public. Sous cela, un court bloc nommant ce qui a produit la page, ce que le site convertit, et deux liens — l’un vers le convertisseur, l’autre vers le compte qui conserve les documents.

Rien au-dessus du document n’a changé de place. La carte du haut est la même carte que l’application place au-dessus de tout document — le nom, le poids, le moment de la création, les compteurs — avec **Enregistrer sur votre compte** et **Télécharger .html** à leur place.

### Le fichier téléchargé porte aussi la ligne

Le fichier \`.html\` autonome se termine par le nom du document, le moment de sa conversion, et *créé avec TransformPipe*. C’est ce fichier qui est envoyé par e-mail et ouvert sur une machine sans réseau, alors la ligne n’est que du texte et un lien, rien de plus : aucun script, aucune image, aucune police web. La page partagée n’exécute pas de script non plus — c’est du HTML produit une seule fois, à la sortie.

### Pourquoi en bas et pas en haut

Un lien partagé est le document de quelqu’un d’autre, et le haut lui appartient. Une bannière au-dessus du premier paragraphe serait une publicité au milieu de quelque chose qu’un collègue a envoyé pour être lu, et le document est la raison d’être de la page.

### Ce qu’elle ne fait pas

Elle ne change pas le document. Le Markdown, le HTML et chaque titre, tableau et lien qu’ils contiennent sont exactement ce qu’ils étaient, si bien qu’un lien partagé le mois dernier s’affiche de la même façon aujourd’hui. Les deux liens portent \`?from=shared\` et \`?from=file\` dans l’adresse, et ce repère est tout ce qui s’ajoute — aucun identifiant pour le lecteur, aucune requête vers où que ce soit, rien d’écrit dans son navigateur.

Autres lectures : [partager un document Markdown sous forme de lien](/blog/share-a-markdown-document-as-a-link), et [ce qu’est un fichier HTML autonome](/blog/self-contained-html-explained).`,
      },
      es: {
        title: 'Un documento compartido dice de dónde viene',
        summary: `Quien abre un enlace que has compartido encuentra ahora, al pie, una línea sobre qué hizo la página, y una forma de convertir algo propio. El \`.html\` descargado lleva la misma línea, discretamente, en su pie de página. Nada ha cambiado en el documento en sí.`,
        description:
          'Una página compartida de TransformPipe indica al pie qué la generó y ofrece cómo convertir un archivo propio; el .html descargado lleva la misma línea.',
        keywords:
          'compartir un documento markdown como enlace, qué generó esta página, pie de página de un documento compartido, pie de página en un html autónomo, convertir un archivo propio',
        body: `Quien abre un enlace que enviaste no tiene ningún motivo para saber qué generó la página que está leyendo. Es un documento en una dirección, sin menú y sin producto alrededor — eso es deliberado, y dejaba al lector sin ningún sitio adonde ir cuando lo que quería era hacer lo mismo con un archivo propio.

### Qué hay al pie de una página compartida

Una línea bajo el documento: que es un documento compartido, cuándo se convirtió, y un enlace para informar de él si no debería ser público. Debajo, un bloque breve que nombra qué generó la página, qué convierte el sitio, y dos enlaces — uno al conversor, otro a la cuenta que guarda documentos.

Nada por encima del documento se ha movido. La ficha de arriba es la misma que la aplicación pone sobre cualquier documento — el nombre, cuánto pesa, cuándo se creó, los recuentos — con **Save to your account** y **Download .html** en su lugar de siempre.

### El archivo descargado también lleva la línea

El \`.html\` autónomo termina con el nombre del documento, cuándo se convirtió, y *made with TransformPipe*. Ese es el archivo que se envía por correo y se abre en una máquina sin red, así que la línea es texto y un enlace y nada más: sin script, sin imagen, sin tipografía web. La página compartida tampoco ejecuta ningún script — es HTML generado una sola vez al entregarse.

### Por qué al pie y no arriba

Un enlace compartido es el documento de otra persona, y la parte de arriba le pertenece a ella. Un aviso sobre el primer párrafo sería publicidad en mitad de algo que un compañero envió para que se leyera, y el documento es la razón por la que existe la página.

### Lo que no hace

No cambia el documento. El Markdown, el HTML y cada encabezado, tabla y enlace en ellos son exactamente lo que eran, así que un enlace compartido el mes pasado se ve igual hoy. Los dos enlaces llevan \`?from=shared\` y \`?from=file\` en la dirección, y esa marca es todo lo que se añade — ningún identificador para el lector, ninguna petición a ningún sitio, nada escrito en tu navegador.

Relacionado: [compartir un documento Markdown como enlace](/blog/share-a-markdown-document-as-a-link) y [qué es un archivo HTML autónomo](/blog/self-contained-html-explained).`,
      },
      it: {
        title: 'Un documento condiviso dice da dove viene',
        summary: `Chi apre un link che hai condiviso trova ora, in fondo alla pagina, una riga su che cosa l'ha creata, e un modo per convertire qualcosa di proprio. Il file \`.html\` scaricato porta la stessa riga, in modo discreto, nel suo piè di pagina. Nulla è cambiato nel documento stesso.`,
        description:
          'Una pagina condivisa di TransformPipe indica in fondo che cosa l\'ha creata e offre un modo per convertire un proprio file; anche il file .html la riporta.',
        keywords:
          'condividere un documento markdown come link, chi ha creato questa pagina, piè di pagina di un documento condiviso, file html autonomo con piè di pagina, convertire un proprio file',
        body: `Chi apre un link che hai inviato non ha motivo di sapere che cosa ha creato la pagina che sta leggendo. È un documento a un indirizzo, senza menu e senza prodotto intorno — una scelta deliberata, che però lasciava chi legge senza una via d'uscita quando voleva fare la stessa cosa con un proprio file.

### Che cosa c'è in fondo a una pagina condivisa

Una riga sotto il documento: che si tratta di un documento condiviso, quando è stato convertito, e un link per segnalarlo se non dovesse essere pubblico. Sotto quella, un breve blocco che nomina che cosa ha creato la pagina, che cosa converte il sito, e due link — uno al convertitore, uno all'account che conserva i documenti.

Sopra il documento nulla si è spostato. La scheda in alto è la stessa che l'app mette sopra qualunque documento — il nome, il peso, quando è stato creato, i conteggi — con **Save to your account** e **Download .html** al loro posto.

### Anche il file scaricato porta la riga

Il file \`.html\` autonomo termina con il nome del documento, quando è stato convertito, e *made with TransformPipe*. È proprio quel file a essere inviato per email e aperto su una macchina senza rete, quindi la riga è testo e un link e nulla altro: nessuno script, nessuna immagine, nessun font web. Anche la pagina condivisa non esegue alcuno script — è HTML generato una sola volta in uscita.

### Perché in fondo e non in alto

Un link condiviso è il documento di qualcun altro, e l'inizio appartiene a lui. Un banner sopra il primo paragrafo sarebbe una pubblicità nel mezzo di qualcosa che un collega ha inviato per essere letto, e il documento è la ragione per cui la pagina esiste.

### Che cosa non fa

Non modifica il documento. Il Markdown, l'HTML e ogni titolo, tabella e link al loro interno sono esattamente quelli di prima, quindi un link condiviso il mese scorso si presenta oggi allo stesso modo. I due link portano \`?from=shared\` e \`?from=file\` nell'indirizzo, e quel segnale è tutto ciò che viene aggiunto — nessun identificativo per chi legge, nessuna richiesta verso alcun luogo, nulla scritto nel suo browser.

Da leggere: [condividere un documento Markdown come link](/blog/share-a-markdown-document-as-a-link), e [che cos'è un file HTML autonomo](/blog/self-contained-html-explained).`,
      },
    },
    body:
      'Somebody who opens a link you shared now finds a line at the foot of it about what made the '
      + 'page, and a way to convert something of their own. The downloaded `.html` carries the same '
      + 'line, quietly, in its footer. Nothing about the document itself changed.',
  },
  {
    date: '2026-09-17',
    title: 'Your documents, two letters away',
    slug: 'keyboard-shortcuts',
    detail: {
      en: {
        description:
          'Cmd K over TransformPipe opens your last five documents, every conversion and every page, and finds any of them by typing two letters.',
        keywords:
          'keyboard shortcuts document converter, cmd k command palette, find a saved document by name, jump to a converted document, keyboard navigation markdown converter',
        body: `There is one shortcut in this app, and everything else is reached through it: \`⌘K\`, or \`Ctrl K\` away from a Mac. It is bound once, on the bar that sits above every page, so it works on the converter, in the history, in the documentation and halfway down an article. Pressing it again closes what it opened.

### What is in the box before you type

The five documents you converted most recently, newest first, each with the conversion that made it. A palette that opens on an empty list makes you type before it tells you anything, and the answer most of the time is one of the last few things you were working on.

Which documents those are depends on where your documents are. Signed in, it is the account's history; signed out, it is what this browser has converted and not saved. When there are more than five, a sixth row goes to the history for the rest.

Under them: the ten conversions with the file extensions each one takes, the live preview, the places — history, documentation, blog, changelog — and every static page with its address.

### The keys

- \`↑\` and \`↓\` walk the list, and so do \`Ctrl P\` and \`Ctrl N\`. The list wraps at both ends.
- \`Return\` opens whatever is highlighted.
- \`Esc\` closes the box and leaves you where you were.
- The mouse works too: moving over a row highlights it, and clicking opens it.

Typing filters on the row's name, on the detail beside it and on the group it sits in, ignoring case and accents — so \`konvertieren\` finds itself whichever way it is capitalised, and a search reaches every document in the history rather than only the five on show.

### What it cannot find

Words inside your documents. That search asks the server, which takes a moment and needs somewhere to show what it found with the context around it, so it stays on the history page where it already lives. This box answers while you are still typing, which it can only do because the list is already in the browser — no request goes out when you open it.

Related: [what to look for in an online document converter](/blog/best-online-document-converters), and [sharing a Markdown document as a link](/blog/share-a-markdown-document-as-a-link).`,
      },
      de: {
        title: 'Ihre Dokumente, zwei Buchstaben entfernt',
        summary: `\`⌘K\` öffnet jetzt auf den fünf Dokumenten, die Sie zuletzt konvertiert haben, und wer tippt, durchsucht sie nach Namen — neben den Konvertierungen und den Seiten, und zwar jedes Dokument der Liste, nicht nur die fünf. \`Alle Dokumente ansehen\` führt zum Verlauf.`,
        description:
          'Cmd K öffnet über TransformPipe Ihre letzten fünf Dokumente, jede Konvertierung und jede Seite — gefunden mit zwei getippten Buchstaben.',
        keywords:
          'tastenkürzel dokumentenkonverter, cmd k befehlspalette, gespeichertes dokument nach namen finden, zu einem konvertierten dokument springen, markdown konverter mit tastatur bedienen',
        body: `Es gibt in dieser App ein Tastenkürzel, und alles andere ist darüber erreichbar: \`⌘K\`, abseits eines Macs \`Strg K\`. Es hängt einmal an der Leiste, die über jeder Seite steht, und funktioniert deshalb im Konverter, im Verlauf, in der Dokumentation und mitten in einem Artikel. Ein zweiter Druck schließt wieder, was der erste geöffnet hat.

### Was im Feld steht, bevor Sie tippen

Die fünf Dokumente, die Sie zuletzt konvertiert haben, das neueste zuerst, jedes mit der Konvertierung, aus der es kam. Eine Palette, die sich auf einer leeren Liste öffnet, verlangt erst das Tippen, bevor sie etwas verrät — und die Antwort ist meistens eines der letzten Dinge, an denen Sie gearbeitet haben.

Welche Dokumente das sind, hängt davon ab, wo Ihre Dokumente liegen. Angemeldet ist es der Verlauf des Kontos; abgemeldet das, was dieser Browser konvertiert und nicht gespeichert hat. Sind es mehr als fünf, führt eine sechste Zeile zum Verlauf mit dem Rest.

Darunter: die zehn Konvertierungen samt den Dateiendungen, die jede annimmt, die Live-Vorschau, die Ziele — Verlauf, Dokumentation, Blog, Changelog — und jede feste Seite mit ihrer Adresse.

### Die Tasten

- \`↑\` und \`↓\` gehen durch die Liste, \`Strg P\` und \`Strg N\` ebenso. Die Liste läuft an beiden Enden um.
- \`Eingabe\` öffnet, was hervorgehoben ist.
- \`Esc\` schließt das Feld und lässt Sie dort, wo Sie waren.
- Die Maus geht auch: Wer über eine Zeile fährt, hebt sie hervor, ein Klick öffnet sie.

Getippt wird nach dem Namen der Zeile, nach der Angabe daneben und nach der Gruppe gefiltert, ohne Rücksicht auf Groß- und Kleinschreibung und auf Akzente — \`konvertieren\` findet sich also in jeder Schreibweise, und eine Suche erreicht jedes Dokument im Verlauf, nicht nur die fünf sichtbaren.

### Was es nicht finden kann

Wörter innerhalb Ihrer Dokumente. Diese Suche fragt den Server, braucht einen Moment und einen Ort, an dem sich der Fund mit seinem Umfeld zeigen lässt — sie bleibt deshalb auf der Verlaufsseite, wo sie längst zu Hause ist. Dieses Feld antwortet, während Sie noch tippen, und das kann es nur, weil die Liste bereits im Browser liegt: Beim Öffnen geht keine Anfrage hinaus.

Weiter: [worauf es bei einem Online-Dokumentenkonverter ankommt](/blog/best-online-document-converters) und [ein Markdown-Dokument als Link teilen](/blog/share-a-markdown-document-as-a-link).`,
      },
      fr: {
        title: 'Vos documents, à deux lettres près',
        summary: `\`⌘K\` s’ouvre désormais sur les cinq documents que vous avez convertis en dernier, et taper les recherche par nom, aux côtés des conversions et des pages — dans tout l’historique, pas seulement les cinq. \`Voir tous les documents\` mène à l’historique.`,
        description:
          'Cmd K ouvre sur TransformPipe vos cinq derniers documents, chaque conversion et chaque page, et retrouve n’importe lequel avec deux lettres tapées.',
        keywords:
          'raccourcis clavier convertisseur de documents, palette de commandes cmd k, retrouver un document enregistré par son nom, revenir à un document converti, navigation au clavier convertisseur markdown',
        body: `Il n’y a qu’un seul raccourci dans cette application, et tout le reste s’atteint par lui : \`⌘K\`, ou \`Ctrl K\` en dehors d’un Mac. Il est rattaché une fois pour toutes à la barre posée au-dessus de chaque page, et fonctionne donc dans le convertisseur, dans l’historique, dans la documentation et au milieu d’un article. Un second appui referme ce que le premier avait ouvert.

### Ce qu’il y a dans le champ avant que vous ne tapiez

Les cinq documents que vous avez convertis le plus récemment, le plus récent d’abord, chacun avec la conversion qui l’a produit. Une palette qui s’ouvre sur une liste vide vous force à taper avant de rien dire, alors que la réponse est le plus souvent l’une des dernières choses sur lesquelles vous travailliez.

Quels documents ce sont dépend de l’endroit où se trouvent vos documents. Connecté, c’est l’historique du compte ; déconnecté, c’est ce que ce navigateur a converti sans l’enregistrer. Au-delà de cinq, une sixième ligne mène à l’historique pour le reste.

Sous eux : les dix conversions avec les extensions de fichier que chacune accepte, l’aperçu en direct, les destinations — historique, documentation, blog, journal des changements — et chaque page fixe avec son adresse.

### Les touches

- \`↑\` et \`↓\` parcourent la liste, tout comme \`Ctrl P\` et \`Ctrl N\`. La liste boucle aux deux extrémités.
- \`Entrée\` ouvre ce qui est en surbrillance.
- \`Échap\` referme la boîte et vous laisse où vous étiez.
- La souris fonctionne aussi : passer sur une ligne la met en surbrillance, et un clic l’ouvre.

Taper filtre sur le nom de la ligne, sur le détail à côté et sur le groupe où elle se trouve, sans tenir compte de la casse ni des accents — ainsi \`konvertieren\` se retrouve quelle que soit la façon dont il est capitalisé, et une recherche atteint chaque document de l’historique, pas seulement les cinq affichés.

### Ce qu’elle ne peut pas trouver

Les mots à l’intérieur de vos documents. Cette recherche interroge le serveur, prend un instant et a besoin d’un endroit pour montrer ce qu’elle a trouvé avec le contexte autour, alors elle reste sur la page d’historique, où elle vit déjà. Cette boîte répond pendant que vous tapez encore, ce qu’elle ne peut faire que parce que la liste est déjà dans le navigateur : aucune requête ne part quand vous l’ouvrez.

Autres lectures : [ce qu’il faut chercher dans un convertisseur de documents en ligne](/blog/best-online-document-converters), et [partager un document Markdown sous forme de lien](/blog/share-a-markdown-document-as-a-link).`,
      },
      es: {
        title: 'Tus documentos, a dos letras de distancia',
        summary: `\`⌘K\` se abre ahora sobre los cinco documentos que convertiste más recientemente, y escribir los busca por nombre junto con las conversiones y las páginas — cualquier documento de la lista, no solo esos cinco. \`Ver todos los documentos\` lleva al historial.`,
        description:
          'Cmd K sobre TransformPipe abre tus cinco últimos documentos, cada conversión y cada página, y encuentra cualquiera de ellos con solo escribir dos letras.',
        keywords:
          'atajos de teclado conversor de documentos, paleta de comandos cmd k, buscar un documento guardado por nombre, ir a un documento convertido, navegación con teclado en el conversor de markdown',
        body: `Hay un solo atajo en esta aplicación, y todo lo demás se alcanza a través de él: \`⌘K\`, o \`Ctrl K\` fuera de un Mac. Está asignado una sola vez, en la barra que aparece sobre cada página, así que funciona en el conversor, en el historial, en la documentación y a mitad de un artículo. Pulsarlo de nuevo cierra lo que abrió.

### Qué hay en el cuadro antes de escribir

Los cinco documentos que convertiste más recientemente, el más nuevo primero, cada uno con la conversión que lo generó. Una paleta que se abre sobre una lista vacía obliga a escribir antes de decir nada, y la respuesta, la mayoría de las veces, es una de las últimas cosas en las que estabas trabajando.

Cuáles sean esos documentos depende de dónde estén tus documentos. Con la sesión iniciada, es el historial de la cuenta; sin ella, es lo que este navegador ha convertido y no ha guardado. Cuando hay más de cinco, una sexta fila lleva al historial para el resto.

Debajo: las diez conversiones con las extensiones de archivo que acepta cada una, la vista previa en directo, los destinos — historial, documentación, blog, registro de cambios — y cada página fija con su dirección.

### Las teclas

- \`↑\` y \`↓\` recorren la lista, y también \`Ctrl P\` y \`Ctrl N\`. La lista da la vuelta en ambos extremos.
- \`Intro\` abre lo que está resaltado.
- \`Esc\` cierra el cuadro y lo deja donde estaba.
- El ratón también funciona: pasar por encima de una fila la resalta, y hacer clic la abre.

Escribir filtra por el nombre de la fila, por el detalle junto a ella y por el grupo en el que está, sin distinguir mayúsculas ni acentos — así \`convertir\` se encuentra a sí mismo con cualquier forma en que esté escrito, y una búsqueda alcanza cualquier documento del historial, no solo los cinco visibles.

### Lo que no puede encontrar

Palabras dentro de tus documentos. Esa búsqueda se dirige al servidor, que tarda un momento y necesita un lugar donde mostrar lo que encontró junto con su contexto, así que permanece en la página del historial, donde ya vive. Este cuadro responde mientras se sigue escribiendo, y solo puede hacerlo porque la lista ya está en el navegador — no sale ninguna petición al abrirlo.

Relacionado: [qué buscar en un conversor de documentos en línea](/blog/best-online-document-converters) y [compartir un documento Markdown como enlace](/blog/share-a-markdown-document-as-a-link).`,
      },
      it: {
        title: 'I tuoi documenti, a due lettere di distanza',
        summary: `\`⌘K\` si apre ora sui cinque documenti convertiti più di recente, e digitare li cerca per nome insieme alle conversioni e alle pagine — ogni documento dell'elenco, non solo i cinque mostrati. «Vedi tutti i documenti» porta alla cronologia.`,
        description:
          'Cmd K su TransformPipe apre i tuoi ultimi cinque documenti, ogni conversione e ogni pagina, e li trova tutti digitando anche solo due lettere.',
        keywords:
          'scorciatoie da tastiera convertitore di documenti, cmd k barra dei comandi, trovare un documento salvato per nome, saltare a un documento convertito, navigare il convertitore markdown con la tastiera',
        body: `In questa app c'è una sola scorciatoia, e tutto il resto si raggiunge passando da lì: \`⌘K\`, oppure \`Ctrl K\` lontano da un Mac. È collegata una sola volta, alla barra che sta sopra ogni pagina, quindi funziona nel convertitore, nella cronologia, nella documentazione e a metà di un articolo. Premerla di nuovo chiude ciò che aveva aperto.

### Che cosa c'è nel campo prima di digitare

I cinque documenti convertiti più di recente, dal più nuovo, ciascuno con la conversione che lo ha generato. Una barra dei comandi che si apre su un elenco vuoto costringe a digitare prima di dire qualcosa, e la risposta è quasi sempre una delle ultime cose su cui si stava lavorando.

Quali documenti siano dipende da dove si trovano i tuoi documenti. Con l'accesso effettuato, è la cronologia dell'account; da disconnesso, è ciò che questo browser ha convertito e non salvato. Quando sono più di cinque, una sesta riga porta alla cronologia per il resto.

Sotto di loro: le dieci conversioni con le estensioni di file che ciascuna accetta, l'anteprima dal vivo, le destinazioni — cronologia, documentazione, blog, changelog — e ogni pagina statica con il proprio indirizzo.

### I tasti

- \`↑\` e \`↓\` scorrono l'elenco, e così fanno \`Ctrl P\` e \`Ctrl N\`. L'elenco si richiude su entrambi gli estremi.
- \`Invio\` apre ciò che è evidenziato.
- \`Esc\` chiude il campo e lascia dove ci si trovava.
- Funziona anche il mouse: passare sopra una riga la evidenzia, e un clic la apre.

Digitare filtra sul nome della riga, sul dettaglio accanto e sul gruppo in cui si trova, ignorando maiuscole, minuscole e accenti — così \`konvertieren\` si trova comunque sia scritto, e una ricerca raggiunge ogni documento della cronologia, non solo i cinque mostrati.

### Che cosa non riesce a trovare

Le parole all'interno dei tuoi documenti. Quella ricerca interroga il server, richiede un momento e ha bisogno di un posto per mostrare ciò che ha trovato con il contesto intorno, quindi resta nella pagina della cronologia, dove vive già. Questo campo risponde mentre si sta ancora digitando, e può farlo solo perché l'elenco è già nel browser: aprendolo non parte nessuna richiesta.

Da leggere: [che cosa cercare in un convertitore di documenti online](/blog/best-online-document-converters), e [condividere un documento Markdown come link](/blog/share-a-markdown-document-as-a-link).`,
      },
    },
    body:
      '`⌘K` now opens on the five documents you converted last, and typing searches them by name '
      + 'alongside the conversions and the pages — every document in the list, not only the five. '
      + '`See all documents` goes to the history.',
  },
  {
    date: '2026-09-17',
    title: 'The cookie question, asked properly',
    slug: 'cookie-consent',
    detail: {
      en: {
        description:
          'What TransformPipe stores in your browser and when: two categories, analytics off until you allow it, and Google’s tags writing nothing before you answer.',
        keywords:
          'cookie banner document converter, what cookies does this site use, reject analytics cookies, google consent mode, change cookie settings',
        body: `There are two categories of storage on this site, and only one of them is a question. Necessary is the sign-in session and the look you picked; analytics is Google Analytics, through Google Tag Manager, counting how many people arrive and which pages they read. There is no third category, because there is no advertising here.

### What is stored, and when

Before you answer, nothing of ours. The page denies every storage category — analytics, and all three advertising ones — in the markup, before the tag manager loads, so Google's tags start in a state where they write no cookie and send cookieless pings at most. The switch for analytics turns that denial into permission, and nothing else does.

Your answer itself is kept in this browser's local storage, under \`m2h.consent\`, with the version of the question and the moment you answered it. That is why the banner appears once rather than on every visit, and it is read back on the next one so a granted category is granted again.

Three other things live in local storage and are not cookies and not optional: the theme, the language, and the conversions you have made in this browser and not saved. They never leave the machine.

### The three answers, one click each

**Accept all**, **Only necessary**, or **Customise** to see the switches. Refusing is a button of its own and the close cross in the corner as well — a banner where "no" costs more clicks than "yes" is not a question, and the regulators who write about this say so in as many words.

Inside the switches, Necessary is on and cannot be turned off: refusing the session cookie means refusing to sign in. Analytics is the one switch that moves.

### Changing your mind

The [cookies page](/cookies) has a button that reopens the same switches, and it shows what you chose and when. Choosing again replaces the answer; clearing the site's data in your browser removes it, and the question comes back on the next visit.

Nothing here has anything to do with converting a file. That runs in your browser either way, with or without analytics, signed in or not.

Related: [whether an online converter is safe](/blog/is-an-online-converter-safe), and [sanitising Markdown safely](/blog/sanitising-markdown-safely).`,
      },
      de: {
        title: 'Die Cookie-Frage, richtig gestellt',
        summary: `Ein Banner beim ersten Besuch, mit drei Antworten von je einem Klick: annehmen, nur notwendige, oder die Schalter öffnen. Die Analyse ist das einzige Optionale auf dieser Seite und bleibt aus, bis sie erlaubt ist — vor einer Antwort schreiben Googles Tags nichts in Ihren Browser. Die Antwort bleibt in diesem Browser, die Frage kommt also einmal; der Knopf am Fuß der [Cookie-Seite](/cookies) öffnet sie wieder, und die Seiten zu Datenschutz und Cookies sagen das alles jetzt auch.`,
        description:
          'Was TransformPipe wann in Ihrem Browser speichert: zwei Kategorien, Analyse aus bis zur Zustimmung, und Googles Tags schreiben vor Ihrer Antwort nichts.',
        keywords:
          'cookie banner dokumentenkonverter, welche cookies nutzt diese seite, analyse cookies ablehnen, google consent mode, cookie einstellungen ändern',
        body: `Auf dieser Seite gibt es zwei Kategorien von Speicherung, und nur eine davon ist eine Frage. Notwendig ist die Anmeldesitzung und das gewählte Erscheinungsbild; die Analyse ist Google Analytics über Google Tag Manager und zählt, wie viele Menschen ankommen und welche Seiten sie lesen. Eine dritte Kategorie gibt es nicht, denn hier wird nicht geworben.

### Was gespeichert wird, und wann

Vor Ihrer Antwort nichts von uns. Die Seite verweigert jede Speicherkategorie — die Analyse und alle drei Werbekategorien — bereits im Markup, bevor der Tag Manager lädt. Googles Tags starten damit in einem Zustand, in dem sie kein Cookie schreiben und höchstens cookielose Signale senden. Erst der Schalter für die Analyse macht aus dieser Verweigerung eine Erlaubnis, und sonst tut das nichts.

Ihre Antwort selbst liegt im lokalen Speicher dieses Browsers, unter \`m2h.consent\`, mit der Version der Frage und dem Zeitpunkt der Antwort. Deshalb erscheint das Banner einmal und nicht bei jedem Besuch; beim nächsten Mal wird die Antwort wieder eingelesen, damit eine erlaubte Kategorie erneut erlaubt ist.

Drei weitere Dinge liegen im lokalen Speicher, sind keine Cookies und nicht wählbar: das Erscheinungsbild, die Sprache und die Konvertierungen, die Sie in diesem Browser gemacht und nicht gespeichert haben. Sie verlassen den Rechner nie.

### Drei Antworten, je ein Klick

**Alle akzeptieren**, **Nur notwendige** — oder **Anpassen** für die Schalter. Das Ablehnen ist ein eigener Knopf und zusätzlich das Kreuz in der Ecke: Ein Banner, auf dem das Nein mehr Klicks kostet als das Ja, ist keine Frage, und die Aufsichtsbehörden schreiben genau das.

Hinter den Schaltern ist **Notwendig** an und nicht abschaltbar: Das Sitzungscookie abzulehnen hieße, sich nicht anzumelden. Die **Analyse** ist der eine Schalter, der sich bewegt.

### Wenn Sie es sich anders überlegen

Die [Cookie-Seite](/cookies) hat einen Knopf, der dieselben Schalter wieder öffnet, und sie zeigt, was Sie gewählt haben und wann. Eine neue Wahl ersetzt die alte; wer die Websitedaten im Browser löscht, entfernt sie, und beim nächsten Besuch steht die Frage wieder da.

Mit dem Konvertieren einer Datei hat alles das nichts zu tun. Das läuft ohnehin in Ihrem Browser — mit Analyse oder ohne, angemeldet oder nicht.

Weiter: [ob ein Online-Konverter sicher ist](/blog/is-an-online-converter-safe) und [Markdown sicher bereinigen](/blog/sanitising-markdown-safely).`,
      },
      fr: {
        title: 'La question des cookies, bien posée',
        summary: `Un bandeau à la première visite, avec trois réponses d’un clic chacune : accepter, nécessaires uniquement, ou ouvrir les commutateurs. Les statistiques sont la seule chose optionnelle sur ce site et restent désactivées jusqu’à leur autorisation — avant une réponse, les balises de Google n’écrivent rien dans votre navigateur. La réponse est conservée dans ce navigateur, la question n’est donc posée qu’une fois ; le bouton au bas de la [page Cookies](/cookies) la rouvre, et les pages de confidentialité et de cookies disent désormais tout cela.`,
        description:
          'Ce que TransformPipe enregistre dans votre navigateur : deux catégories, les statistiques désactivées et les balises Google inactives avant votre réponse.',
        keywords:
          'bandeau cookies convertisseur de documents, quels cookies utilise ce site, refuser les cookies statistiques, google consent mode, modifier les paramètres des cookies',
        body: `Il y a deux catégories de stockage sur ce site, et une seule d’entre elles est une question. Nécessaire, c’est la session de connexion et l’apparence choisie ; statistiques, c’est Google Analytics, via Google Tag Manager, qui compte combien de personnes arrivent et quelles pages elles lisent. Il n’y a pas de troisième catégorie, car il n’y a pas de publicité ici.

### Ce qui est stocké, et quand

Avant votre réponse, rien de notre fait. La page refuse chaque catégorie de stockage — les statistiques, et les trois catégories publicitaires — dans le balisage même, avant le chargement du gestionnaire de balises, si bien que les balises de Google démarrent dans un état où elles n’écrivent aucun cookie et envoient au plus des signaux sans cookie. Seul le commutateur des statistiques transforme ce refus en autorisation, et rien d’autre ne le fait.

Votre réponse elle-même est conservée dans le stockage local de ce navigateur, sous \`m2h.consent\`, avec la version de la question et le moment où vous avez répondu. C’est pourquoi le bandeau apparaît une fois plutôt qu’à chaque visite, et il est relu à la suivante pour qu’une catégorie autorisée le reste.

Trois autres choses vivent dans le stockage local, ne sont pas des cookies et ne sont pas facultatives : le thème, la langue, et les conversions que vous avez faites dans ce navigateur sans les enregistrer. Elles ne quittent jamais la machine.

### Les trois réponses, un clic chacune

**Tout accepter**, **Nécessaires uniquement**, ou **Personnaliser** pour voir les commutateurs. Refuser est un bouton à part entière, tout comme la croix de fermeture dans le coin — un bandeau où le « non » coûte plus de clics que le « oui » n’est pas une question, et les régulateurs qui écrivent sur le sujet le disent en ces termes.

Dans les commutateurs, **Nécessaires** est activé et ne peut pas être désactivé : refuser le cookie de session reviendrait à refuser de se connecter. **Statistiques** est le seul commutateur qui bouge.

### Si vous changez d’avis

La [page Cookies](/cookies) a un bouton qui rouvre les mêmes commutateurs, et elle montre ce que vous avez choisi et quand. Choisir à nouveau remplace la réponse ; effacer les données du site dans votre navigateur la supprime, et la question revient à la prochaine visite.

Rien ici n’a de rapport avec la conversion d’un fichier. Cela fonctionne dans votre navigateur de toute façon, avec ou sans statistiques, connecté ou non.

Autres lectures : [si un convertisseur en ligne est sûr](/blog/is-an-online-converter-safe), et [nettoyer du Markdown en toute sécurité](/blog/sanitising-markdown-safely).`,
      },
      es: {
        title: 'La pregunta de las cookies, bien planteada',
        summary: `Un aviso en la primera visita, con tres respuestas de un clic cada una: aceptar, solo las necesarias, o abrir los interruptores. La analítica es lo único opcional en este sitio y permanece desactivada hasta que se permite — antes de responder, las etiquetas de Google no escriben nada en tu navegador. La respuesta se guarda en este navegador, así que el aviso se pregunta una vez; el botón al pie de la [página de cookies](/cookies) lo vuelve a abrir, y las páginas de privacidad y cookies ahora dicen todo esto.`,
        description:
          'Qué guarda TransformPipe en tu navegador: dos categorías, analítica desactivada hasta que la permites, y Google sin escribir nada antes de tu respuesta.',
        keywords:
          'aviso de cookies conversor de documentos, qué cookies usa este sitio, rechazar cookies de analítica, modo de consentimiento de google, cambiar la configuración de cookies',
        body: `Hay dos categorías de almacenamiento en este sitio, y solo una de ellas es una pregunta. **Necesarias** es la sesión de acceso y el aspecto elegido; **Analítica** es Google Analytics, a través de Google Tag Manager, que cuenta cuánta gente llega y qué páginas lee. No hay una tercera categoría, porque aquí no hay publicidad.

### Qué se guarda, y cuándo

Antes de responder, nada por nuestra parte. La página deniega cada categoría de almacenamiento — la analítica y las tres de publicidad — en el propio marcado, antes de que cargue el gestor de etiquetas, de modo que las etiquetas de Google empiezan en un estado en el que no escriben ninguna cookie y como mucho envían señales sin cookies. El interruptor de analítica es lo único que convierte esa denegación en permiso.

La respuesta en sí se guarda en el almacenamiento local de este navegador, bajo \`m2h.consent\`, junto con la versión de la pregunta y el momento en que se respondió. Por eso el aviso aparece una vez y no en cada visita, y se vuelve a leer en la siguiente para que una categoría permitida siga permitida.

Otras tres cosas viven en el almacenamiento local y no son cookies ni opcionales: el tema visual, el idioma, y las conversiones hechas en este navegador y no guardadas. Nunca salen de la máquina.

### Las tres respuestas, un clic cada una

**Aceptar todo**, **Solo las necesarias**, o **Personalizar** para ver los interruptores. Rechazar es un botón propio, y también la cruz de la esquina — un aviso donde el «no» cuesta más clics que el «sí» no es una pregunta, y los reguladores que escriben sobre esto lo dicen con esas mismas palabras.

Dentro de los interruptores, **Necesarias** está activado y no se puede desactivar: rechazar la cookie de sesión sería rechazar iniciar sesión. **Analítica** es el único interruptor que se mueve.

### Cambiar de opinión

La [página de cookies](/cookies) tiene un botón que vuelve a abrir los mismos interruptores, y muestra qué se eligió y cuándo. Elegir de nuevo sustituye la respuesta anterior; borrar los datos del sitio en el navegador la elimina, y la pregunta vuelve a aparecer en la siguiente visita.

Nada de esto tiene que ver con convertir un archivo. Eso funciona igual en tu navegador, con analítica o sin ella, con la sesión iniciada o no.

Relacionado: [si un conversor en línea es seguro](/blog/is-an-online-converter-safe) y [depurar Markdown con seguridad](/blog/sanitising-markdown-safely).`,
      },
      it: {
        title: 'La domanda sui cookie, posta come si deve',
        summary: `Un banner alla prima visita, con tre risposte da un clic ciascuna: «Accetta tutto», «Solo necessari», oppure aprire gli interruttori con «Personalizza». Le statistiche sono l'unica cosa opzionale su questo sito e restano disattivate finché non vengono permesse — prima di una risposta, i tag di Google non scrivono nulla nel tuo browser. La risposta resta in questo browser, quindi il banner viene chiesto una sola volta; il pulsante in fondo alla [pagina dei cookie](/cookies) lo riapre, e le pagine sulla privacy e sui cookie ora spiegano tutto questo.`,
        description:
          'Che cosa memorizza TransformPipe nel tuo browser: due categorie, statistiche disattivate finché non le permetti, e nessun tag di Google prima della tua risposta.',
        keywords:
          'banner dei cookie convertitore di documenti, quali cookie usa questo sito, rifiutare i cookie di statistica, google consent mode, cambiare le impostazioni dei cookie',
        body: `Su questo sito ci sono due categorie di memorizzazione, e solo una delle due è una domanda. I cookie **Necessari** sono la sessione di accesso e il tema scelto; le **Statistiche** sono Google Analytics, tramite Google Tag Manager, che conta quante persone arrivano e quali pagine leggono. Non esiste una terza categoria, perché qui non c'è pubblicità.

### Che cosa viene memorizzato, e quando

Prima della tua risposta, nulla da parte nostra. La pagina nega ogni categoria di memorizzazione — le statistiche e tutte e tre le categorie pubblicitarie — già nel markup, prima che il tag manager si carichi, così i tag di Google partono in uno stato in cui non scrivono alcun cookie e inviano al massimo segnali senza cookie. È l'interruttore delle statistiche a trasformare quel diniego in permesso, e nulla altro lo fa.

La tua risposta è conservata nella memoria locale di questo browser, sotto \`m2h.consent\`, con la versione della domanda e il momento in cui hai risposto. È per questo che il banner appare una sola volta e non a ogni visita, e viene riletto alla visita successiva, così che una categoria permessa resta permessa.

Altre tre cose vivono nella memoria locale, non sono cookie e non sono opzionali: il tema, la lingua, e le conversioni fatte in questo browser e non salvate. Non lasciano mai la macchina.

### Le tre risposte, un clic ciascuna

**«Accetta tutto»**, **«Solo necessari»**, oppure **«Personalizza»** per vedere gli interruttori. Rifiutare è un pulsante a sé e anche la croce nell'angolo — un banner in cui il «no» costa più clic del «sì» non è una domanda, e le autorità di controllo che scrivono su questo lo dicono esplicitamente.

Dentro gli interruttori, **Necessari** è attivo e non si può disattivare: rifiutare il cookie di sessione significherebbe rifiutare di accedere. **Statistiche** è l'unico interruttore che si muove.

### Se cambi idea

La [pagina dei cookie](/cookies) ha un pulsante che riapre gli stessi interruttori, e mostra che cosa hai scelto e quando. Scegliere di nuovo sostituisce la risposta; svuotare i dati del sito nel tuo browser la rimuove, e la domanda ritorna alla visita successiva.

Nulla di tutto questo ha a che fare con la conversione di un file. Quella funziona nel tuo browser in ogni caso, con o senza statistiche, con o senza accesso effettuato.

Da leggere: [se un convertitore online è sicuro](/blog/is-an-online-converter-safe), e [pulire il Markdown in modo sicuro](/blog/sanitising-markdown-safely).`,
      },
    },
    body:
      'A banner on a first visit, with three answers of one click each: accept, only necessary, or '
      + 'open the switches. Analytics is the single optional thing on this site and it stays off '
      + 'until it is allowed — before an answer, Google’s tags write nothing to your browser. The '
      + 'answer is kept in this browser, so the banner is asked once; the button at the foot of the '
      + '[cookies page](/cookies) reopens it, and the privacy and cookies pages now say all of this.',
  },
  {
    date: '2026-09-16',
    title: 'A bar you can type into',
    slug: 'command-palette',
    detail: {
      en: {
        description:
          'The TransformPipe header is built around a search box: press Cmd K and every conversion, page and recent document is two letters and one Return away.',
        keywords:
          'command palette web app, cmd k search box, switch between conversions, document converter navigation, find a page without a menu',
        body: `Ten conversions, a handful of destinations and every page the footer lists is more than a row of links can carry. The old bar carried them anyway, so getting anywhere meant opening a menu, reading it, and picking — reasonable the first time and slow every time after, once you already know where you are going.

### The bar now holds four things

The wordmark, which goes home. A control naming the conversion you are on — not the word "Converter", but *Markdown to HTML* or *Excel to a Markdown table* — which opens the ten of them and the live preview. The search box. Then the destinations as glyphs with their names in the tooltip, and the account menu.

The control keeps the conversion's name everywhere in the app, including on pages that are not conversions, because that is the question it exists to answer: which one you are coming back to. All ten names are drawn into the same cell with nine of them invisible, so the control is as wide as the longest name in whatever language is on and stops resizing under your cursor as you switch between them.

### The box is a button

Nothing is typed into the bar itself. Clicking it, or pressing \`⌘K\` — \`Ctrl K\` away from a Mac — opens a box over the page with the whole app in one list: your recent documents, the ten conversions with the extensions each one takes, the destinations, and the static pages with their addresses. Two letters and \`Return\` is the shortest way through any of it. The hint on the right of the box shows \`⌘\` or \`Ctrl\` depending on the machine, read after the page loads, because the server has no keyboard.

### The trail moved out of the page

Where you are — the crumbs from the blog down to an article, or from the documentation down to a section — used to be printed by each page inside its own content. It now sits in a strip of its own directly under the bar, in the same place on every page, and the pages still decide what it says.

### What it is not

Not a command line. Every row in the box goes somewhere — a conversion, a page, a document — and nothing in it converts, saves, deletes or shares. It also does not search inside your documents; that lives in the history, which can show what it found.

Related: [what a Markdown to HTML converter is for](/blog/markdown-to-html-converter), and [Markdown editors worth using](/blog/best-markdown-editors).`,
      },
      de: {
        title: 'Eine Leiste, in die man tippen kann',
        summary: `Die Kopfzeile ist um ein Suchfeld herum neu gebaut: \`⌘K\` drücken — abseits eines Macs \`Strg K\` — und jede Konvertierung und jede Seite der App ist zwei Buchstaben entfernt. Die Leiste selbst liegt jetzt unter der Seite statt darüber, die Konvertierung, in der Sie sind, steht als Erstes darauf, und der Pfad, der sagt, wo Sie sind, ist aus der Seite in eine eigene Zeile darunter gezogen.`,
        description:
          'Die Kopfzeile von TransformPipe ist um ein Suchfeld gebaut: Strg K, und jede Konvertierung, jede Seite und jedes Dokument ist zwei Buchstaben entfernt.',
        keywords:
          'befehlspalette web app, cmd k suchfeld, zwischen konvertierungen wechseln, navigation im dokumentenkonverter, seite ohne menü finden',
        body: `Zehn Konvertierungen, eine Handvoll Ziele und jede Seite, die die Fußzeile aufführt: Das ist mehr, als eine Reihe von Links tragen kann. Die alte Leiste trug es trotzdem, und so hieß jeder Weg: Menü öffnen, lesen, auswählen — beim ersten Mal vernünftig und jedes weitere Mal langsam, wenn man sein Ziel längst kennt.

### Die Leiste hält jetzt vier Dinge

Die Wortmarke, die nach Hause führt. Ein Bedienelement, das die Konvertierung benennt, in der Sie gerade sind — nicht das Wort *Konverter*, sondern *Markdown zu HTML* oder *Excel zu einer Markdown-Tabelle* —, und das die zehn Konvertierungen und die Live-Vorschau öffnet. Das Suchfeld. Dahinter die Ziele als Zeichen, deren Namen im Tooltip stehen, und das Konto-Menü.

Das Bedienelement behält den Namen der Konvertierung überall in der App, auch auf Seiten, die keine Konvertierung sind — denn das ist die Frage, für die es da ist: zu welcher Sie zurückkehren. Alle zehn Namen liegen in derselben Zelle, neun davon unsichtbar, damit das Element so breit ist wie der längste Name in der eingestellten Sprache und beim Wechseln nicht unter dem Zeiger die Breite ändert.

### Das Feld ist ein Knopf

In die Leiste selbst wird nichts getippt. Ein Klick darauf oder \`⌘K\` — abseits eines Macs \`Strg K\` — öffnet über der Seite ein Feld mit der ganzen App in einer Liste: Ihre letzten Dokumente, die zehn Konvertierungen samt den Endungen, die jede annimmt, die Ziele und die festen Seiten mit ihren Adressen. Zwei Buchstaben und \`Eingabe\` sind der kürzeste Weg durch all das. Der Hinweis rechts im Feld zeigt \`⌘\` oder \`Strg\`, je nach Rechner, und wird erst nach dem Laden gelesen — der Server hat keine Tastatur.

### Der Pfad ist aus der Seite ausgezogen

Wo Sie sind — vom Blog hinunter zu einem Artikel, von der Dokumentation hinunter zu einem Abschnitt — druckte früher jede Seite selbst in ihren eigenen Inhalt. Jetzt steht der Pfad in einem eigenen Streifen direkt unter der Leiste, auf jeder Seite an derselben Stelle, und die Seiten entscheiden weiterhin, was darin steht.

### Was es nicht ist

Keine Kommandozeile. Jede Zeile im Feld führt irgendwohin — zu einer Konvertierung, einer Seite, einem Dokument —, und nichts darin konvertiert, speichert, löscht oder teilt. Es sucht auch nicht innerhalb Ihrer Dokumente; das liegt im Verlauf, der den Fund auch zeigen kann.

Weiter: [wozu ein Markdown-nach-HTML-Konverter da ist](/blog/markdown-to-html-converter) und [Markdown-Editoren, die sich lohnen](/blog/best-markdown-editors).`,
      },
      fr: {
        title: 'Une barre où l’on peut taper',
        summary: `L’en-tête est reconstruit autour d’un champ de recherche : appuyez sur \`⌘K\` — \`Ctrl K\` en dehors d’un Mac — et chaque conversion et chaque page de l’application est à deux lettres. La barre elle-même se trouve désormais sous la page plutôt que dessus, la conversion où vous êtes est la première chose qu’elle affiche, et le fil disant où vous êtes est sorti de la page pour tenir dans une ligne à part, juste en dessous.`,
        description:
          'L’en-tête de TransformPipe s’organise autour d’un champ de recherche : Cmd K, et chaque conversion, page et document récent est à deux lettres et une touche Entrée.',
        keywords:
          'palette de commandes application web, champ de recherche cmd k, changer de conversion, navigation dans un convertisseur de documents, trouver une page sans menu',
        body: `Dix conversions, une poignée de destinations et chaque page listée par le pied de page, c’est plus qu’une rangée de liens ne peut porter. L’ancienne barre les portait tout de même, si bien qu’aller quelque part signifiait ouvrir un menu, le lire, et choisir — raisonnable la première fois, et lent chaque fois après, une fois que l’on sait déjà où l’on va.

### La barre tient désormais quatre choses

Le logotype, qui ramène à l’accueil. Un contrôle nommant la conversion où vous êtes — pas le mot « Convertisseur », mais *Markdown vers HTML* ou *Excel vers un tableau Markdown* — qui ouvre les dix conversions et l’aperçu en direct. Le champ de recherche. Puis les destinations sous forme de glyphes, dont le nom apparaît dans l’infobulle, et le menu du compte.

Le contrôle garde le nom de la conversion partout dans l’application, y compris sur des pages qui ne sont pas des conversions, car c’est la question à laquelle il existe pour répondre : vers laquelle vous revenez. Les dix noms sont dessinés dans la même cellule, neuf d’entre eux invisibles, si bien que le contrôle est aussi large que le nom le plus long dans la langue active, et cesse de changer de largeur sous le curseur quand vous passez de l’un à l’autre.

### Le champ est un bouton

Rien ne se tape dans la barre elle-même. Cliquer sur elle, ou appuyer sur \`⌘K\` — \`Ctrl K\` en dehors d’un Mac — ouvre un champ au-dessus de la page avec toute l’application en une seule liste : vos documents récents, les dix conversions avec les extensions que chacune accepte, les destinations, et les pages fixes avec leurs adresses. Deux lettres et \`Entrée\` est le chemin le plus court à travers tout cela. L’indice à droite du champ affiche \`⌘\` ou \`Ctrl\` selon la machine, lu après le chargement de la page, car le serveur n’a pas de clavier.

### Le fil d’Ariane est sorti de la page

Où vous êtes — le chemin du blog jusqu’à un article, ou de la documentation jusqu’à une section — s’imprimait autrefois dans le contenu propre de chaque page. Il tient désormais dans une bande à part, directement sous la barre, au même endroit sur chaque page, et les pages décident toujours de ce qu’elle dit.

### Ce qu’il n’est pas

Pas une ligne de commande. Chaque ligne du champ mène quelque part — une conversion, une page, un document — et rien à l’intérieur ne convertit, n’enregistre, ne supprime ni ne partage. Il ne recherche pas non plus à l’intérieur de vos documents ; cela vit dans l’historique, qui peut montrer ce qu’il a trouvé.

Autres lectures : [à quoi sert un convertisseur Markdown vers HTML](/blog/markdown-to-html-converter), et [des éditeurs Markdown qui valent le détour](/blog/best-markdown-editors).`,
      },
      es: {
        title: 'Una barra en la que se puede escribir',
        summary: `La cabecera se ha reconstruido alrededor de un cuadro de búsqueda: pulsa \`⌘K\` — \`Ctrl K\` fuera de un Mac — y cada conversión y cada página de la aplicación está a dos letras de distancia. La propia barra se sitúa ahora bajo la página en lugar de sobre ella, la conversión en la que se encuentra es lo primero que aparece en ella, y el rastro que indica dónde está se ha sacado de la página hacia una línea propia justo debajo.`,
        description:
          'La cabecera de TransformPipe se construye alrededor de un cuadro de búsqueda: Cmd K y cada conversión, página y documento reciente está a dos letras.',
        keywords:
          'paleta de comandos en una aplicación web, cuadro de búsqueda cmd k, cambiar entre conversiones, navegación del conversor de documentos, encontrar una página sin usar un menú',
        body: `Diez conversiones, un puñado de destinos y cada página que enumera el pie son más de lo que una fila de enlaces puede llevar. La barra antigua los llevaba de todos modos, así que llegar a cualquier sitio significaba abrir un menú, leerlo y elegir — razonable la primera vez y lento todas las siguientes, en cuanto ya se sabe adónde se va.

### La barra sostiene ahora cuatro cosas

El logotipo, que lleva al inicio. Un control que nombra la conversión en la que se está — no la palabra «Conversor», sino *Markdown a HTML* o *Excel a una tabla Markdown* —, y que abre las diez conversiones y la vista previa en directo. El cuadro de búsqueda. Después, los destinos como iconos con sus nombres en el texto emergente, y el menú de la cuenta.

El control mantiene el nombre de la conversión en toda la aplicación, incluso en páginas que no son conversiones, porque esa es la pregunta que existe para responder: a cuál se está volviendo. Los diez nombres se dibujan en la misma celda, nueve de ellos invisibles, así que el control es tan ancho como el nombre más largo del idioma activo y deja de cambiar de tamaño bajo el cursor al pasar de uno a otro.

### El cuadro es un botón

En la barra misma no se escribe nada. Al hacer clic en ella, o al pulsar \`⌘K\` — \`Ctrl K\` fuera de un Mac —, se abre un cuadro sobre la página con toda la aplicación en una sola lista: tus documentos recientes, las diez conversiones con las extensiones que acepta cada una, los destinos, y las páginas fijas con sus direcciones. Dos letras e \`Intro\` son el camino más corto por cualquiera de ellas. La pista a la derecha del cuadro muestra \`⌘\` o \`Ctrl\` según la máquina, leída después de que la página cargue, porque el servidor no tiene teclado.

### El rastro salió de la página

Dónde estás — las migas desde el blog hasta un artículo, o desde la documentación hasta una sección — antes lo imprimía cada página dentro de su propio contenido. Ahora está en una franja propia justo debajo de la barra, en el mismo lugar en cada página, y las páginas siguen decidiendo qué dice.

### Lo que no es

No es una línea de comandos. Cada fila del cuadro lleva a algún sitio — una conversión, una página, un documento —, y nada en ella convierte, guarda, elimina ni comparte. Tampoco busca dentro de tus documentos; eso vive en el historial, que sí puede mostrar lo que encontró.

Relacionado: [para qué sirve un conversor de Markdown a HTML](/blog/markdown-to-html-converter) y [editores de Markdown que merecen la pena](/blog/best-markdown-editors).`,
      },
      it: {
        title: 'Una barra in cui si può digitare',
        summary: `L'intestazione è ricostruita attorno a un campo di ricerca: premendo \`⌘K\` — \`Ctrl K\` lontano da un Mac — ogni conversione e ogni pagina dell'app è a due lettere di distanza. La barra stessa sta ora sotto la pagina invece che sopra di essa, la conversione in cui ti trovi è la prima cosa che mostra, e il percorso che indica dove ti trovi si è spostato fuori dalla pagina, in una riga propria sottostante.`,
        description:
          'L\'intestazione di TransformPipe è costruita attorno a un campo di ricerca: con Cmd K ogni conversione, pagina e documento è a due lettere e un Invio di distanza.',
        keywords:
          'barra dei comandi per applicazioni web, campo di ricerca cmd k, passare da una conversione all\'altra, navigazione del convertitore di documenti, trovare una pagina senza menu',
        body: `Dieci conversioni, una manciata di destinazioni e ogni pagina che il piè di pagina elenca sono più di quanto una riga di link possa contenere. La vecchia barra le portava comunque, così raggiungere qualcosa significava aprire un menu, leggerlo e scegliere — ragionevole la prima volta e lento ogni volta dopo, una volta che si sa già dove si vuole andare.

### La barra ora contiene quattro cose

Il logotipo, che porta alla pagina principale. Un controllo che nomina la conversione in cui ti trovi — non la parola «Convertitore», ma *Markdown in HTML* o *Excel in una tabella Markdown* — che apre tutte le dieci conversioni e l'anteprima dal vivo. Il campo di ricerca. Poi le destinazioni come simboli, con i loro nomi nel suggerimento, e il menu dell'account.

Il controllo mantiene il nome della conversione ovunque nell'app, anche nelle pagine che non sono conversioni, perché è quella la domanda a cui deve rispondere: a quale si sta tornando. Tutti i dieci nomi sono disegnati nella stessa cella, con nove di essi invisibili, così il controllo è largo quanto il nome più lungo nella lingua impostata e non cambia larghezza sotto il cursore mentre si passa da una conversione all'altra.

### Il campo è un pulsante

Nella barra stessa non si digita nulla. Un clic su di essa, oppure \`⌘K\` — \`Ctrl K\` lontano da un Mac — apre un campo sopra la pagina con l'intera app in un unico elenco: i tuoi documenti recenti, le dieci conversioni con le estensioni che ciascuna accetta, le destinazioni e le pagine statiche con i loro indirizzi. Due lettere e \`Invio\` sono la via più breve attraverso tutto questo. Il suggerimento a destra del campo mostra \`⌘\` o \`Ctrl\` secondo la macchina, letto dopo il caricamento della pagina, perché il server non ha una tastiera.

### Il percorso si è spostato fuori dalla pagina

Dove ti trovi — le briciole dal blog fino a un articolo, o dalla documentazione fino a una sezione — veniva prima stampato da ciascuna pagina dentro il proprio contenuto. Ora sta in una striscia propria, subito sotto la barra, nello stesso punto su ogni pagina, e sono ancora le pagine a decidere che cosa contiene.

### Che cosa non è

Non è una riga di comando. Ogni riga del campo porta da qualche parte — una conversione, una pagina, un documento — e nulla al suo interno converte, salva, elimina o condivide. Non cerca nemmeno all'interno dei tuoi documenti; quella funzione vive nella cronologia, che può mostrare ciò che ha trovato.

Da leggere: [a cosa serve un convertitore da Markdown a HTML](/blog/markdown-to-html-converter), e [gli editor Markdown che vale la pena usare](/blog/best-markdown-editors).`,
      },
    },
    body:
      'The header is rebuilt around a search box: press `⌘K` — `Ctrl K` away from a Mac — and every '
      + 'conversion and every page in the app is two letters away. The bar itself now sits under the '
      + 'page rather than on top of it, the conversion you are on is the first thing on it, and the '
      + 'trail saying where you are moved out of the page and into a line of its own underneath.',
  },
  {
    date: '2026-09-16',
    title: 'A new mark',
    slug: 'new-logo',
    detail: {
      en: {
        description:
          'TransformPipe has a drawn wordmark — a T and a p sharing one stem — and the same two letters are the icon in the tab, on a phone and in the store.',
        keywords:
          'transformpipe logo, new favicon, wordmark and app icon, what the tp mark is, icon on a phone home screen',
        body: `The old mark was \`T>pipe\` set in whatever monospace the machine had, with the caret borrowed from a shell prompt. It cost nothing and looked like what it was: a typeface the browser happened to own, which meant the name was a slightly different shape on every screen it appeared on.

### What the mark is

A capital **T** and a lower-case **p** fused along the stem they share, with the rest of the word — *ipe* — beside them. The T is the colour of the text around it and the p is cyan. Because it is drawn rather than set, it is the same shape at any size, on any machine, and in a screenshot somebody takes of it.

It is inline SVG in the page rather than an image file, for the two things an image cannot do: take the colour of the text it sits next to, and arrive in the same breath as the markup instead of a request later, which is what leaves a hole in the corner a visitor looks at first.

### Where it appears

The two fused letters alone, on a dark rounded square, are the icon. At sixteen pixels a whole word is a smudge; two overlapping letters are still two letters.

One drawing produces all of it. The browser tab and the bookmark take the SVG; an iPhone home screen and an Android launcher take PNGs, the Android one drawn smaller inside its square so a launcher can crop it without cutting the letters; \`favicon.ico\` exists for the things that ask for it without reading the page first — a link unfurl, a feed reader, a connector list. The browser extension uses the same icon in the toolbar and on its Web Store listing, and an assistant adding the connector is handed the same file.

Nothing else changed: no colours on the site moved, and no page was redrawn around it.

Related: [saving a web page as Markdown](/blog/save-a-web-page-as-markdown), and [what to look for in an online document converter](/blog/best-online-document-converters).`,
      },
      de: {
        title: 'Ein neues Zeichen',
        summary: `Der Name ist jetzt eine Zeichnung und nicht mehr sechs Zeichen Festbreitenschrift: ein \`T\` und ein \`p\`, die einen Stamm teilen. Dasselbe Paar für sich allein ist das Symbol — Tab, Lesezeichen, Startbildschirm des Telefons und Android-Launcher bekommen also ein echtes Symbol statt eines Buchstabens, den der Browser geraten hat.`,
        description:
          'TransformPipe hat eine gezeichnete Wortmarke — ein T und ein p mit gemeinsamem Stamm — und dieselben zwei Buchstaben sind das Symbol im Tab und im Store.',
        keywords:
          'transformpipe logo, neues favicon, wortmarke und app symbol, was das tp zeichen ist, symbol auf dem home bildschirm',
        body: `Das alte Zeichen war \`T>pipe\`, gesetzt in der Festbreitenschrift, die der jeweilige Rechner gerade hatte, mit einem Größer-Zeichen aus der Eingabeaufforderung. Es kostete nichts und sah aus wie das, was es war: eine Schrift, die der Browser zufällig besaß — der Name hatte also auf jedem Bildschirm eine etwas andere Gestalt.

### Was das Zeichen ist

Ein großes **T** und ein kleines **p**, verschmolzen an dem Stamm, den beide teilen, und daneben der Rest des Wortes: *ipe*. Das T hat die Farbe des umgebenden Textes, das p ist türkis. Weil es gezeichnet und nicht gesetzt ist, hat es in jeder Größe, auf jedem Rechner und in jedem Bildschirmfoto dieselbe Gestalt.

Es liegt als SVG in der Seite und nicht als Bilddatei, wegen der zwei Dinge, die ein Bild nicht kann: die Farbe des Textes neben sich annehmen, und im selben Atemzug wie das Markup ankommen statt eine Anfrage später — was sonst ein Loch genau in der Ecke lässt, auf die ein Besucher zuerst schaut.

### Wo es auftaucht

Die beiden verschmolzenen Buchstaben allein, auf einem dunklen, abgerundeten Quadrat, sind das Symbol. Bei sechzehn Pixeln ist ein ganzes Wort ein Fleck; zwei überlappende Buchstaben sind noch zwei Buchstaben.

Alles entsteht aus einer Zeichnung. Browser-Tab und Lesezeichen nehmen das SVG; ein iPhone-Startbildschirm und ein Android-Launcher nehmen PNGs, das für Android kleiner in seinem Quadrat, damit der Launcher beschneiden kann, ohne die Buchstaben zu treffen; \`favicon.ico\` gibt es für alles, was danach fragt, ohne vorher die Seite zu lesen — eine Link-Vorschau, ein Feedreader, eine Connector-Liste. Die Browser-Erweiterung benutzt dasselbe Symbol in der Symbolleiste und im Web Store, und ein Assistent, der den Connector hinzufügt, bekommt dieselbe Datei.

Sonst hat sich nichts geändert: Keine Farbe der Seite ist verschoben, und keine Seite wurde darum herum neu gezeichnet.

Weiter: [eine Webseite als Markdown sichern](/blog/save-a-web-page-as-markdown) und [worauf es bei einem Online-Dokumentenkonverter ankommt](/blog/best-online-document-converters).`,
      },
      fr: {
        title: 'Une nouvelle marque',
        summary: `Le nom est désormais un dessin plutôt que six caractères de fonte à chasse fixe : un \`T\` et un \`p\` qui partagent une même hampe. La même paire, seule, fait l’icône — l’onglet, le signet, l’écran d’accueil du téléphone et le lanceur Android reçoivent donc une vraie icône au lieu d’une lettre devinée par le navigateur.`,
        description:
          'TransformPipe a un logotype dessiné — un T et un p partageant une hampe — et ces deux lettres font l’icône dans l’onglet, sur un téléphone et dans le store.',
        keywords:
          'logo transformpipe, nouveau favicon, logotype et icône d’application, icône sur l’écran d’accueil, que veut dire le sigle tp',
        body: `L’ancienne marque était \`T>pipe\`, composée dans la fonte à chasse fixe que la machine avait sous la main, avec un chevron emprunté à une invite de commande. Elle ne coûtait rien et avait l’air de ce qu’elle était : une police que le navigateur possédait par hasard, ce qui voulait dire que le nom prenait une forme légèrement différente sur chaque écran où il apparaissait.

### Ce qu’est la marque

Un **T** capitale et un **p** bas de casse fondus le long de la hampe qu’ils partagent, et le reste du mot — *ipe* — à côté. Le T prend la couleur du texte qui l’entoure, le p est cyan. Parce qu’elle est dessinée et non composée, elle garde la même forme à toutes les tailles, sur toutes les machines, et dans la capture d’écran que quelqu’un en fera.

C’est du SVG en ligne dans la page plutôt qu’un fichier image, pour les deux choses qu’une image ne sait pas faire : prendre la couleur du texte à côté duquel elle se trouve, et arriver dans le même souffle que le balisage au lieu d’une requête plus tard — ce qui laisse sinon un trou dans le coin que le visiteur regarde en premier.

### Où elle apparaît

Les deux lettres fondues seules, sur un carré sombre aux angles arrondis, font l’icône. À seize pixels, un mot entier est une tache ; deux lettres qui se chevauchent restent deux lettres.

Un seul dessin produit tout le reste. L’onglet du navigateur et le signet prennent le SVG ; un écran d’accueil d’iPhone et un lanceur Android prennent des PNG, celui d’Android dessiné plus petit dans son carré pour qu’un lanceur puisse le rogner sans couper les lettres ; \`favicon.ico\` existe pour tout ce qui le réclame sans lire la page d’abord — un aperçu de lien, un lecteur de flux, une liste de connecteurs. L’extension de navigateur utilise la même icône dans la barre d’outils et sur sa fiche du Web Store, et un assistant qui ajoute le connecteur reçoit le même fichier.

Rien d’autre n’a changé : aucune couleur du site n’a bougé, et aucune page n’a été redessinée autour.

Autres lectures : [enregistrer une page web en Markdown](/blog/save-a-web-page-as-markdown) et [ce qu’il faut regarder dans un convertisseur de documents en ligne](/blog/best-online-document-converters).`,
      },
      es: {
        title: 'Una marca nueva',
        summary: `El nombre ya es un dibujo y no seis caracteres de una tipografía monoespaciada: una \`T\` y una \`p\` que comparten un mismo trazo vertical. Ese mismo par, por sí solo, es el icono — así que la pestaña, el marcador, la pantalla de inicio del teléfono y el lanzador de Android reciben un icono de verdad en lugar de una letra que el navegador adivinó.`,
        description:
          'TransformPipe tiene un logotipo dibujado — una T y una p que comparten trazo — y esas dos letras son el icono en la pestaña, en el teléfono y en la tienda.',
        keywords:
          'logo de transformpipe, nuevo favicon, logotipo e icono de aplicación, icono en la pantalla de inicio, qué significa la marca tp',
        body: `La marca anterior era \`T>pipe\`, compuesta en la tipografía monoespaciada que tuviera a mano la máquina, con el signo de mayor que tomado prestado de un intérprete de comandos. No costaba nada y parecía lo que era: una fuente que el navegador resultaba tener, de modo que el nombre adoptaba una forma algo distinta en cada pantalla en la que aparecía.

### Qué es la marca

Una **T** mayúscula y una **p** minúscula fundidas por el trazo vertical que comparten, y el resto de la palabra — *ipe* — al lado. La T toma el color del texto que la rodea; la p es cian. Como está dibujada y no compuesta, mantiene la misma forma a cualquier tamaño, en cualquier máquina y en la captura de pantalla que alguien le haga.

Va como SVG dentro de la página y no como archivo de imagen, por las dos cosas que una imagen no puede hacer: tomar el color del texto junto al que se encuentra, y llegar en el mismo aliento que el marcado en lugar de en una petición posterior, que es lo que deja un hueco justo en la esquina que el visitante mira primero.

### Dónde aparece

Las dos letras fundidas, solas, sobre un cuadrado oscuro de esquinas redondeadas, son el icono. A dieciséis píxeles una palabra entera es un borrón; dos letras superpuestas siguen siendo dos letras.

Un único dibujo produce todo lo demás. La pestaña del navegador y el marcador toman el SVG; la pantalla de inicio de un iPhone y un lanzador de Android toman PNG, el de Android dibujado más pequeño dentro de su cuadrado para que el lanzador pueda recortarlo sin cortar las letras; \`favicon.ico\` existe para lo que lo pide sin leer antes la página — una vista previa de enlace, un lector de fuentes, una lista de conectores. La extensión de navegador usa el mismo icono en la barra de herramientas y en su ficha de la Web Store, y un asistente que añade el conector recibe el mismo archivo.

Nada más ha cambiado: ningún color del sitio se ha movido y ninguna página se ha redibujado alrededor.

Relacionado: [guardar una página web como Markdown](/blog/save-a-web-page-as-markdown) y [qué mirar en un conversor de documentos en línea](/blog/best-online-document-converters).`,
      },
      it: {
        title: 'Un nuovo segno',
        summary: `Il nome ora è un disegno e non più sei caratteri di un monospaziato qualsiasi: una \`T\` e una \`p\` che condividono la stessa asta. La stessa coppia, da sola, è l’icona — la scheda, il segnalibro, la schermata home del telefono e il launcher Android ricevono quindi un’icona vera invece di una lettera indovinata dal browser.`,
        description:
          'TransformPipe ha un logotipo disegnato — una T e una p che condividono l’asta — e quelle due lettere sono l’icona nella scheda, sul telefono e nello store.',
        keywords:
          'logo transformpipe, nuova favicon, logotipo e icona dell’app, icona sulla schermata home, che cos’è il segno tp',
        body: `Il vecchio segno era \`T>pipe\`, composto nel monospaziato che la macchina aveva a disposizione, con il segno di maggiore preso in prestito da un prompt dei comandi. Non costava nulla e sembrava ciò che era: un carattere che il browser possedeva per caso, il che significa che il nome assumeva una forma leggermente diversa su ogni schermo in cui compariva.

### Che cos’è il segno

Una **T** maiuscola e una **p** minuscola fuse lungo l’asta che hanno in comune, e accanto il resto della parola — *ipe*. La T prende il colore del testo che la circonda, la p è ciano. Poiché è disegnata e non composta, ha la stessa forma a ogni dimensione, su ogni macchina e in qualunque schermata qualcuno ne catturi.

Sta nella pagina come SVG e non come file immagine, per le due cose che un’immagine non sa fare: prendere il colore del testo accanto a cui si trova, e arrivare nello stesso respiro del markup invece che con una richiesta successiva — che è ciò che altrimenti lascia un buco proprio nell’angolo che un visitatore guarda per primo.

### Dove compare

Le due lettere fuse da sole, su un quadrato scuro dagli angoli arrotondati, sono l’icona. A sedici pixel una parola intera è una macchia; due lettere sovrapposte restano due lettere.

Tutto nasce da un solo disegno. La scheda del browser e il segnalibro prendono l’SVG; la schermata home di un iPhone e un launcher Android prendono dei PNG, quello Android disegnato più piccolo dentro il suo quadrato perché il launcher possa ritagliarlo senza tagliare le lettere; \`favicon.ico\` esiste per tutto ciò che lo chiede senza prima leggere la pagina — un’anteprima di link, un lettore di feed, un elenco di connettori. L’estensione per browser usa la stessa icona nella barra degli strumenti e nella sua scheda sul Web Store, e un assistente che aggiunge il connettore riceve lo stesso file.

Non è cambiato nient’altro: nessun colore del sito si è spostato e nessuna pagina è stata ridisegnata attorno.

Da leggere: [salvare una pagina web come Markdown](/blog/save-a-web-page-as-markdown) e [che cosa guardare in un convertitore di documenti online](/blog/best-online-document-converters).`,
      },
    },
    body:
      'The name is now a drawing rather than six characters of monospace: a `T` and a `p` sharing '
      + 'one stem. The same pair, on its own, is the icon — so the tab, the bookmark, the phone '
      + 'home screen and the Android launcher all get a real icon instead of a letter the browser '
      + 'guessed at.',
  },
  {
    date: '2026-09-14',
    title: 'An Obsidian vault, in one document',
    slug: 'obsidian-vault-to-markdown',
    detail: {
      en: {
        description:
          'Zip an Obsidian vault, drop it on TransformPipe, and get one Markdown document back — every note in order with a table of contents, converted in your browser.',
        keywords:
          'obsidian vault to markdown, export obsidian notes to one file, merge obsidian notes, obsidian to html, convert obsidian wikilinks',
        body: `A vault is a good place to write and an awkward thing to hand over. Two hundred files is not a document, and the person you are sending them to has no Obsidian and no interest in installing one.

### What it is for

A vault is a good place to write and an awkward place to hand something over. Sending somebody two hundred files is not sending them anything; this makes the readable object that a vault does not have — one document you can print, publish, attach, or read on a phone.

### Wikilinks

\`[[Some note]]\` keeps its words and drops its address. Once every note is one document there is nowhere for the link to point: the file it named is now a heading in the same page. Keeping a dead link that looks live is worse than keeping the phrase, so the phrase is what survives. An ordinary Markdown link to an outside address is untouched.

### What is skipped

Anything that is not a note: \`.obsidian/\` and its settings, attachments, templates that are not written as notes, and the plugins' own data. Nested folders keep their order, so a vault organised by folder reads in the order it was organised in.

### Nothing is uploaded

The archive is unpacked and converted in your browser. A vault is usually somebody's private notes, and the only safe way to convert private notes is not to send them anywhere — which is the same reason this site has no upload step for any of its ten conversions.

Related: [an Obsidian vault in detail](/blog/convert-obsidian-vault-to-markdown), and [Markdown out of Notion, Obsidian and Confluence](/blog/markdown-from-notion-obsidian-and-confluence).`,
      },
      de: {
        title: 'Ein Obsidian-Tresor, in einem Dokument',
        summary: `Eine zehnte Konvertierung: legen Sie einen gezippten Obsidian-Tresor ab und bekommen ein einziges Markdown-Dokument zurück — jede Notiz der Reihe nach, mit Inhaltsverzeichnis. \`[[Wikilinks]]\` behalten ihre Worte; in einem Dokument zusammengeführt gibt es nichts mehr, worauf sie zeigen könnten.`,
        description:
          'Obsidian-Tresor zippen, auf TransformPipe ablegen und ein einziges Markdown-Dokument bekommen: jede Notiz der Reihe nach, mit Inhaltsverzeichnis.',
        keywords:
          'obsidian tresor in markdown umwandeln, obsidian notizen in eine datei exportieren, obsidian notizen zusammenführen, obsidian in html umwandeln, obsidian wikilinks konvertieren',
        body: `Ein Tresor ist ein guter Ort zum Schreiben und ein unhandliches Ding zum Weitergeben. Zweihundert Dateien sind kein Dokument, und die Person, der Sie sie schicken, hat kein Obsidian und keine Lust, eines zu installieren.

### Wofür das gut ist

Ein Tresor ist ein guter Ort zum Schreiben und ein unhandlicher Ort zum Übergeben. Jemandem zweihundert Dateien zu schicken heißt, ihm nichts zu schicken; das hier macht das lesbare Objekt, das ein Tresor nicht hat — ein Dokument, das man drucken, veröffentlichen, anhängen oder auf dem Telefon lesen kann.

### Wikilinks

\`[[Some note]]\` behält seine Wörter und verliert seine Adresse. Sobald jede Notiz in einem Dokument steht, gibt es kein Ziel mehr: die Datei, die der Link benannt hat, ist jetzt eine Überschrift auf derselben Seite. Einen toten Link zu behalten, der lebendig aussieht, ist schlechter, als die Wörter zu behalten — also bleiben die Wörter. Ein gewöhnlicher Markdown-Link auf eine Adresse draußen bleibt unangetastet.

### Was übersprungen wird

Alles, was keine Notiz ist: \`.obsidian/\` samt seinen Einstellungen, Anhänge, Vorlagen, die nicht als Notizen geschrieben sind, und die Daten der Plugins. Verschachtelte Ordner behalten ihre Reihenfolge, ein nach Ordnern organisierter Tresor liest sich also in der Reihenfolge, in der er organisiert wurde.

### Nichts wird hochgeladen

Das Archiv wird in Ihrem Browser entpackt und konvertiert. Ein Tresor sind meist die privaten Notizen eines Menschen, und der einzige sichere Weg, private Notizen zu konvertieren, ist, sie nirgendwohin zu schicken — derselbe Grund, aus dem diese Seite für keine ihrer zehn Konvertierungen einen Upload hat.

Weiter: [ein Obsidian-Tresor im Detail](/blog/convert-obsidian-vault-to-markdown) und [Markdown aus Notion, Obsidian und Confluence](/blog/markdown-from-notion-obsidian-and-confluence).`,
      },
      fr: {
        title: 'Un coffre Obsidian, en un seul document',
        summary: `Une dixième conversion : déposez un coffre Obsidian compressé et récupérez un seul document Markdown — chaque note dans l’ordre, avec un sommaire. Les \`[[Wikilinks]]\` gardent leurs mots ; une fois tout fondu en un document, il ne leur reste rien à viser, l’adresse n’est donc pas reportée — la règle que cette application applique déjà à un export Notion ou Confluence.`,
        description:
          'Compressez un coffre Obsidian, déposez-le sur TransformPipe et récupérez un seul document Markdown : chaque note dans l’ordre, avec un sommaire.',
        keywords:
          'convertir un coffre obsidian en markdown, exporter des notes obsidian en un seul fichier, fusionner des notes obsidian, obsidian vers html, convertir les wikilinks obsidian',
        body: `Un coffre est un bon endroit pour écrire et un objet malcommode à transmettre. Deux cents fichiers ne font pas un document, et la personne à qui vous les envoyez n’a pas Obsidian et aucune envie de l’installer.

### À quoi cela sert

Un coffre est un bon endroit pour écrire et un mauvais endroit d’où remettre quelque chose. Envoyer deux cents fichiers à quelqu’un, ce n’est rien lui envoyer ; ceci fabrique l’objet lisible qu’un coffre n’a pas — un document qu’on peut imprimer, publier, joindre à un message ou lire sur un téléphone.

### Les wikilinks

\`[[Some note]]\` garde ses mots et perd son adresse. Dès que chaque note tient dans un même document, le lien n’a plus rien à viser : le fichier qu’il nommait est devenu un titre sur la même page. Garder un lien mort qui a l’air vivant est pire que garder la formule, c’est donc la formule qui survit. Un lien Markdown ordinaire vers une adresse extérieure n’est pas touché.

### Ce qui est laissé de côté

Tout ce qui n’est pas une note : \`.obsidian/\` et ses réglages, les pièces jointes, les gabarits qui ne sont pas écrits comme des notes, et les données propres aux greffons. Les dossiers imbriqués gardent leur ordre : un coffre organisé par dossiers se lit donc dans l’ordre où il a été organisé.

### Rien n’est téléversé

L’archive est décompressée et convertie dans votre navigateur. Un coffre, ce sont le plus souvent les notes privées de quelqu’un, et la seule façon sûre de convertir des notes privées est de ne les envoyer nulle part — la raison même pour laquelle ce site n’a aucune étape de téléversement pour aucune de ses dix conversions.

Autres lectures : [un coffre Obsidian en détail](/blog/convert-obsidian-vault-to-markdown) et [du Markdown depuis Notion, Obsidian et Confluence](/blog/markdown-from-notion-obsidian-and-confluence).`,
      },
      es: {
        title: 'Una bóveda de Obsidian, en un solo documento',
        summary: `Una décima conversión: suelta una bóveda de Obsidian comprimida y recupera un solo documento Markdown — cada nota en orden, con un índice. Los \`[[Wikilinks]]\` conservan sus palabras; fundidos en un único documento ya no les queda nada a lo que apuntar, así que la dirección no se traslada, la misma regla que esta aplicación aplica ya a una exportación de Notion o Confluence.`,
        description:
          'Comprime una bóveda de Obsidian, suéltala en TransformPipe y recibe un solo documento Markdown: cada nota en orden, con un índice, y todo en tu navegador.',
        keywords:
          'convertir bóveda de obsidian a markdown, exportar notas de obsidian a un solo archivo, unir notas de obsidian, obsidian a html, convertir wikilinks de obsidian',
        body: `Una bóveda es un buen sitio para escribir y una cosa incómoda de entregar. Doscientos archivos no son un documento, y la persona a la que se los manda no tiene Obsidian ni ningún interés en instalarlo.

### Para qué sirve

Una bóveda es un buen sitio para escribir y un mal sitio desde el que entregar algo. Mandarle a alguien doscientos archivos no es mandarle nada; esto fabrica el objeto legible que una bóveda no tiene — un documento que se puede imprimir, publicar, adjuntar o leer en el teléfono.

### Los wikilinks

\`[[Some note]]\` conserva sus palabras y pierde su dirección. En cuanto cada nota vive en un mismo documento, el enlace no tiene adónde apuntar: el archivo que nombraba es ahora un encabezado de esa misma página. Conservar un enlace muerto con aspecto de vivo es peor que conservar la frase, así que lo que sobrevive es la frase. Un enlace Markdown corriente a una dirección de fuera queda intacto.

### Qué se omite

Todo lo que no sea una nota: \`.obsidian/\` y sus ajustes, los adjuntos, las plantillas que no estén escritas como notas y los datos propios de los complementos. Las carpetas anidadas conservan su orden, de modo que una bóveda organizada por carpetas se lee en el orden en que se organizó.

### No se sube nada

El archivo comprimido se descomprime y se convierte en tu navegador. Una bóveda suele ser los apuntes privados de alguien, y la única manera segura de convertir apuntes privados es no enviarlos a ninguna parte — la misma razón por la que este sitio no tiene paso de subida en ninguna de sus diez conversiones.

Relacionado: [una bóveda de Obsidian en detalle](/blog/convert-obsidian-vault-to-markdown) y [Markdown desde Notion, Obsidian y Confluence](/blog/markdown-from-notion-obsidian-and-confluence).`,
      },
      it: {
        title: 'Un vault Obsidian, in un solo documento',
        summary: `Una decima conversione: rilascia un vault Obsidian compresso e ricevi un solo documento Markdown — ogni nota nell’ordine, con un indice. I \`[[Wikilinks]]\` mantengono le loro parole; fusi in un unico documento non resta più nulla da indicare, quindi l’indirizzo non viene riportato: la stessa regola che l’applicazione applica già a un export di Notion o Confluence.`,
        description:
          'Comprimi un vault Obsidian, rilascialo su TransformPipe e ricevi un solo documento Markdown: ogni nota nell’ordine, con un indice, tutto nel browser.',
        keywords:
          'convertire un vault obsidian in markdown, esportare note obsidian in un unico file, unire note obsidian, da obsidian a html, convertire wikilink obsidian',
        body: `Un vault è un buon posto per scrivere e una cosa scomoda da consegnare. Duecento file non sono un documento, e la persona a cui li mandi non ha Obsidian né alcuna voglia di installarlo.

### A che cosa serve

Un vault è un buon posto per scrivere e un pessimo posto da cui consegnare qualcosa. Mandare a qualcuno duecento file non è mandargli niente; questo costruisce l’oggetto leggibile che un vault non ha — un documento da stampare, pubblicare, allegare o leggere sul telefono.

### I wikilink

\`[[Some note]]\` mantiene le sue parole e perde il suo indirizzo. Una volta che ogni nota sta in un solo documento non c’è più nulla da indicare: il file che il link nominava adesso è un titolo nella stessa pagina. Tenere un link morto che sembra vivo è peggio che tenere la frase, quindi è la frase a sopravvivere. Un normale link Markdown verso un indirizzo esterno resta intatto.

### Che cosa viene saltato

Tutto ciò che non è una nota: \`.obsidian/\` con le sue impostazioni, gli allegati, i modelli non scritti come note e i dati dei plugin. Le cartelle annidate mantengono il loro ordine, quindi un vault organizzato per cartelle si legge nell’ordine in cui è stato organizzato.

### Non viene caricato nulla

L’archivio viene scompattato e convertito nel tuo browser. Un vault di solito sono gli appunti privati di qualcuno, e l’unico modo sicuro di convertire appunti privati è non mandarli da nessuna parte — lo stesso motivo per cui questo sito non ha un passaggio di caricamento per nessuna delle sue dieci conversioni.

Da leggere: [un vault Obsidian nel dettaglio](/blog/convert-obsidian-vault-to-markdown) e [Markdown da Notion, Obsidian e Confluence](/blog/markdown-from-notion-obsidian-and-confluence).`,
      },
    },
    body:
      'A tenth conversion: drop a zipped Obsidian vault and get one Markdown document back — every '
      + 'note in order, with a table of contents. `[[Wikilinks]]` keep their words; merged into one '
      + 'document there is nowhere left for them to point, so the address does not carry over, the '
      + 'same rule this app already applies to a Notion or Confluence export.',
  },
  {
    date: '2026-09-14',
    title: 'Plain text and Excel, converted honestly',
    slug: 'plain-text-and-excel',
    detail: {
      en: {
        description:
          'Two conversions for the files nobody calls documents: a .txt escaped so it says what it says, and an .xlsx as one Markdown table per sheet.',
        keywords:
          'txt to markdown, convert plain text to markdown, escape markdown characters, excel to markdown table, xlsx to markdown converter',
        body: `"Add *stars* next to failing tests." Typed into a \`.txt\` note to a colleague, that sentence means what it says. Handed to a Markdown renderer it means something else — "stars" comes out in italics — and a line about a review convention has been quietly reformatted. Two conversions exist for the two files nobody thinks of as documents, a text file and a workbook, and both are plain about what they can carry.

### Plain text → Markdown

\`/text-to-markdown\` takes a \`.txt\` and escapes every character Markdown would otherwise notice: \`*\`, \`_\`, a backtick, square brackets, a tilde, a leading \`#\`, \`>\`, \`-\` or \`1.\`, and the backslash itself. It also translates plain text's own conventions into Markdown's, since Markdown turns a single line break into a space: a wrapped line stays a break, a blank line stays a new paragraph.

\`.txt\` used to be accepted on Markdown → HTML as though it already were Markdown, and is not any more. That conversion takes \`.md\`, \`.markdown\`, \`.mdown\` and \`.mkd\` — the files somebody actually wrote as Markdown.

### Excel → Markdown table

\`/excel-to-markdown\` reads an \`.xlsx\` and gives back one Markdown table per sheet that has rows in it, with a table of contents once there is more than one. The first row of each sheet becomes the header row. Dates arrive as plain ISO dates rather than Excel's serial numbers.

### What a spreadsheet loses

A Markdown table is text in a grid and nothing else, so everything else a workbook is goes: a formula arrives as the last value Excel saved for it, merged cells flatten, number and currency formats become the raw text, and colours, conditional formatting, charts, pivot tables, images and cell comments have no representation at all. Empty sheets are skipped, and a workbook with no rows anywhere is refused rather than converted into nothing. \`.xls\`, the format before 2007, is not read — save it as \`.xlsx\` first.

If the grid was the document, this works. If the formatting was carrying meaning, a Markdown table is the wrong destination, and finding that out here is better than finding it out after you have pasted the result somewhere.

### Both run in your browser

The escaping and the workbook reader are JavaScript in your own tab, so neither file is uploaded. The API converts an \`.xlsx\` posted as the body too, which is the one case with no browser to run them in.

Related: [Excel to a Markdown table in full](/blog/convert-excel-to-markdown-table), and [what escaping is actually for](/blog/markdown-escaping).`,
      },
      de: {
        title: 'Reintext und Excel, ehrlich konvertiert',
        summary: `Zwei weitere Konvertierungen. Reintext → Markdown maskiert Markdowns eigene Zeichen vor der Umwandlung, sodass eine \`.txt\` mit einem wörtlich gemeinten Sternchen oder Unterstrich weiterhin dasselbe sagt, statt versehentlich hervorgehoben zu werden — bei Markdown → HTML wurde eine \`.txt\` früher angenommen, als wäre sie schon Markdown, und wird es nicht mehr. Excel → Markdown-Tabelle macht aus einer \`.xlsx\`-Arbeitsmappe eine Tabelle pro Blatt, mit Inhaltsverzeichnis, sobald es mehr als eine ist.`,
        description:
          'Zwei Konvertierungen für die Dateien, die niemand Dokument nennt: eine maskierte .txt, die sagt, was dasteht, und eine .xlsx als Tabelle pro Blatt.',
        keywords:
          'txt in markdown umwandeln, reintext in markdown, markdown zeichen maskieren, excel in markdown tabelle, xlsx in markdown konverter',
        body: `„Ein *Sternchen* neben jeden fehlgeschlagenen Test." In einer \`.txt\` an eine Kollegin getippt sagt dieser Satz genau das. Einem Markdown-Renderer übergeben sagt er etwas anderes — „Sternchen" steht dann kursiv da —, und aus einer Zeile über eine Konvention ist unbemerkt eine umformatierte geworden. Für die zwei Dateien, die niemand für Dokumente hält, eine Textdatei und eine Arbeitsmappe, gibt es je eine Konvertierung, und beide sagen offen, was sie tragen können.

### Reintext → Markdown

\`/text-to-markdown\` nimmt eine \`.txt\` und maskiert jedes Zeichen, das Markdown sonst bemerken würde: \`*\`, \`_\`, ein Backtick, eckige Klammern, eine Tilde, ein führendes \`#\`, \`>\`, \`-\` oder \`1.\` und den Backslash selbst. Außerdem übersetzt es die Gewohnheiten von Reintext in die von Markdown, denn Markdown macht aus einem einzelnen Zeilenumbruch ein Leerzeichen: Ein Umbruch bleibt ein Umbruch, eine leere Zeile bleibt ein neuer Absatz.

Eine \`.txt\` wurde früher bei Markdown → HTML angenommen, als wäre sie schon Markdown; das ist vorbei. Diese Konvertierung nimmt \`.md\`, \`.markdown\`, \`.mdown\` und \`.mkd\` — die Dateien, die wirklich als Markdown geschrieben wurden.

### Excel → Markdown-Tabelle

\`/excel-to-markdown\` liest eine \`.xlsx\` und gibt pro Tabellenblatt mit Zeilen eine Markdown-Tabelle zurück, bei mehreren zusätzlich ein Inhaltsverzeichnis. Die erste Zeile jedes Blatts wird zur Kopfzeile. Datumswerte erscheinen als reine ISO-Daten statt als Excels eigene Seriennummern.

### Was eine Tabellenkalkulation verliert

Eine Markdown-Tabelle ist Text in einem Raster und sonst nichts, also fällt alles Übrige weg: Eine Formel kommt als der Wert an, den Excel zuletzt gespeichert hat, verbundene Zellen werden flach, Zahlen- und Währungsformate werden zum rohen Text, und Farben, bedingte Formatierung, Diagramme, Pivot-Tabellen, Bilder und Zellkommentare haben überhaupt keine Entsprechung. Leere Blätter werden übersprungen, und eine Arbeitsmappe ohne jede Zeile wird abgelehnt, statt zu nichts konvertiert zu werden. \`.xls\`, das Format vor 2007, wird nicht gelesen — speichern Sie es vorher als \`.xlsx\`.

War das Raster das Dokument, funktioniert das hier. Trug die Formatierung die Bedeutung, ist eine Markdown-Tabelle das falsche Ziel, und das hier zu erfahren ist besser, als es zu erfahren, nachdem Sie das Ergebnis irgendwo eingefügt haben.

### Beides läuft in Ihrem Browser

Die Maskierung und der Leser für die Arbeitsmappe sind JavaScript in Ihrem eigenen Tab; keine der beiden Dateien wird hochgeladen. Die API konvertiert außerdem eine \`.xlsx\`, die als Rumpf gesendet wird — der eine Fall, in dem kein Browser da ist, der das täte.

Weiter: [Excel in eine Markdown-Tabelle, ausführlich](/blog/convert-excel-to-markdown-table) und [wozu Maskierung da ist](/blog/markdown-escaping).`,
      },
      fr: {
        title: 'Texte brut et Excel, convertis honnêtement',
        summary: `Deux conversions de plus. Texte brut → Markdown échappe les caractères propres à Markdown avant de convertir : un fichier \`.txt\` contenant un astérisque ou un tiret bas littéral dit donc toujours la même chose au lieu de gagner une emphase accidentelle — un \`.txt\` était jusqu’ici accepté par Markdown → HTML comme s’il était déjà du Markdown, ce n’est plus le cas. Excel → tableau Markdown transforme un classeur \`.xlsx\` en un tableau par feuille, avec un sommaire dès qu’il y en a plus d’une.`,
        description:
          'Deux conversions pour les fichiers que personne n’appelle des documents : un .txt échappé qui dit ce qu’il dit, et un .xlsx en un tableau Markdown par feuille.',
        keywords:
          'txt en markdown, convertir du texte brut en markdown, échapper les caractères markdown, excel en tableau markdown, convertisseur xlsx vers markdown',
        body: `« Mettez des *étoiles* à côté des tests en échec. » Tapée dans une note \`.txt\` à un collègue, cette phrase dit ce qu’elle dit. Remise à un moteur de rendu Markdown, elle dit autre chose — « étoiles » ressort en italique — et une ligne sur une convention de relecture s’est fait reformater en silence. Deux conversions existent pour les deux fichiers que personne ne prend pour des documents, un fichier texte et un classeur, et toutes deux annoncent franchement ce qu’elles savent porter.

### Texte brut → Markdown

\`/text-to-markdown\` prend un \`.txt\` et échappe chaque caractère que Markdown remarquerait autrement : \`*\`, \`_\`, un accent grave, les crochets, un tilde, un \`#\`, \`>\`, \`-\` ou \`1.\` en début de ligne, et la barre oblique inverse elle-même. Il traduit aussi les habitudes du texte brut dans celles de Markdown, puisque Markdown transforme un simple retour à la ligne en espace : une ligne repliée reste un retour, une ligne vide reste un nouveau paragraphe.

Un \`.txt\` était accepté par Markdown → HTML comme s’il était déjà du Markdown ; ce n’est plus le cas. Cette conversion prend \`.md\`, \`.markdown\`, \`.mdown\` et \`.mkd\` — les fichiers que quelqu’un a réellement écrits en Markdown.

### Excel → tableau Markdown

\`/excel-to-markdown\` lit un \`.xlsx\` et rend un tableau Markdown par feuille contenant des lignes, avec un sommaire dès qu’il y en a plus d’une. La première ligne de chaque feuille devient la ligne d’en-tête. Les dates arrivent en dates ISO ordinaires plutôt qu’en numéros de série d’Excel.

### Ce qu’un tableur perd

Un tableau Markdown est du texte dans une grille et rien d’autre : tout le reste de ce qu’est un classeur s’en va. Une formule arrive comme la dernière valeur qu’Excel lui a enregistrée, les cellules fusionnées s’aplatissent, les formats de nombre et de monnaie deviennent du texte brut, et les couleurs, la mise en forme conditionnelle, les graphiques, les tableaux croisés dynamiques, les images et les commentaires de cellule n’ont aucune représentation. Les feuilles vides sont sautées, et un classeur sans la moindre ligne est refusé plutôt que converti en rien. \`.xls\`, le format d’avant 2007, n’est pas lu — enregistrez-le d’abord en \`.xlsx\`.

Si la grille était le document, cela marche. Si la mise en forme portait le sens, un tableau Markdown est la mauvaise destination, et l’apprendre ici vaut mieux que l’apprendre après avoir collé le résultat quelque part.

### Les deux tournent dans votre navigateur

L’échappement et le lecteur de classeur sont du JavaScript dans votre propre onglet : aucun des deux fichiers n’est téléversé. L’API convertit aussi un \`.xlsx\` envoyé comme corps de requête, le seul cas où il n’y a pas de navigateur pour les exécuter.

Autres lectures : [Excel vers un tableau Markdown en détail](/blog/convert-excel-to-markdown-table) et [à quoi sert vraiment l’échappement](/blog/markdown-escaping).`,
      },
      es: {
        title: 'Texto plano y Excel, convertidos con honestidad',
        summary: `Dos conversiones más. Texto plano → Markdown escapa los caracteres propios de Markdown antes de convertir, de modo que un archivo \`.txt\` con un asterisco o un guion bajo literal sigue diciendo lo mismo en vez de ganar énfasis por accidente — un \`.txt\` se aceptaba hasta ahora en Markdown → HTML como si ya fuera Markdown, y ya no. Excel → tabla Markdown convierte un libro \`.xlsx\` en una tabla por hoja, con índice en cuanto hay más de una.`,
        description:
          'Dos conversiones para los archivos que nadie llama documentos: un .txt escapado que dice lo que dice, y un .xlsx como una tabla Markdown por cada hoja.',
        keywords:
          'txt a markdown, convertir texto plano a markdown, escapar caracteres de markdown, excel a tabla markdown, conversor xlsx a markdown',
        body: `«Pon *estrellas* junto a las pruebas que fallan.» Escrita en una nota \`.txt\` para un colega, esa frase dice lo que dice. Entregada a un renderizador de Markdown dice otra cosa — «estrellas» sale en cursiva — y una línea sobre una convención de revisión ha quedado reformateada sin que nadie lo pidiera. Existen dos conversiones para los dos archivos que nadie considera documentos, un archivo de texto y un libro de cálculo, y ambas son claras sobre lo que pueden llevar.

### Texto plano → Markdown

\`/text-to-markdown\` toma un \`.txt\` y escapa cada carácter que Markdown notaría de otro modo: \`*\`, \`_\`, un acento grave, los corchetes, una virgulilla, un \`#\`, \`>\`, \`-\` o \`1.\` al principio de la línea, y la propia barra invertida. También traduce las convenciones del texto plano a las de Markdown, ya que Markdown convierte un salto de línea suelto en un espacio: un salto sigue siendo un salto y una línea en blanco sigue siendo un párrafo nuevo.

Un \`.txt\` se aceptaba en Markdown → HTML como si ya fuera Markdown, y eso se acabó. Esa conversión toma \`.md\`, \`.markdown\`, \`.mdown\` y \`.mkd\` — los archivos que alguien escribió de verdad como Markdown.

### Excel → tabla Markdown

\`/excel-to-markdown\` lee un \`.xlsx\` y devuelve una tabla Markdown por cada hoja que tenga filas, con un índice en cuanto hay más de una. La primera fila de cada hoja pasa a ser la fila de encabezado. Las fechas llegan como fechas ISO normales y no como los números de serie de Excel.

### Qué pierde una hoja de cálculo

Una tabla Markdown es texto en una rejilla y nada más, así que se va todo lo demás que un libro es: una fórmula llega como el último valor que Excel le guardó, las celdas combinadas se aplanan, los formatos de número y moneda quedan en texto crudo, y los colores, el formato condicional, los gráficos, las tablas dinámicas, las imágenes y los comentarios de celda no tienen ninguna representación. Las hojas vacías se omiten, y un libro sin una sola fila se rechaza en lugar de convertirse en nada. \`.xls\`, el formato anterior a 2007, no se lee — guárdalo antes como \`.xlsx\`.

Si la rejilla era el documento, esto funciona. Si el formato llevaba el significado, una tabla Markdown es el destino equivocado, y enterarse aquí es mejor que enterarse después de haber pegado el resultado en algún sitio.

### Ambas corren en tu navegador

El escapado y el lector del libro son JavaScript en tu propia pestaña, así que ninguno de los dos archivos se sube. La API también convierte un \`.xlsx\` enviado como cuerpo de la petición, el único caso en el que no hay navegador donde ejecutarlos.

Relacionado: [Excel a una tabla Markdown al completo](/blog/convert-excel-to-markdown-table) y [para qué sirve realmente el escapado](/blog/markdown-escaping).`,
      },
      it: {
        title: 'Testo semplice ed Excel, convertiti onestamente',
        summary: `Altre due conversioni. Testo semplice → Markdown fa l’escape dei caratteri propri di Markdown prima di convertire, così un file \`.txt\` con un asterisco o un trattino basso letterale continua a dire la stessa cosa invece di guadagnare un’enfasi accidentale — un \`.txt\` finora veniva accettato da Markdown → HTML come se fosse già Markdown, e non lo è più. Excel → tabella Markdown trasforma una cartella di lavoro \`.xlsx\` in una tabella per foglio, con un indice non appena ce n’è più di una.`,
        description:
          'Due conversioni per i file che nessuno chiama documenti: un .txt con l’escape che dice quello che dice, e un .xlsx come una tabella Markdown per foglio.',
        keywords:
          'txt in markdown, convertire testo semplice in markdown, fare escape dei caratteri markdown, excel in tabella markdown, convertitore xlsx markdown',
        body: `«Metta degli *asterischi* accanto ai test che falliscono.» Scritta in un \`.txt\` per un collega, questa frase dice esattamente quello che dice. Consegnata a un renderer Markdown dice altro — «asterischi» esce in corsivo — e una riga su una convenzione di revisione è stata riformattata di nascosto. Per i due file che nessuno considera documenti, un file di testo e una cartella di lavoro, esiste una conversione ciascuno, ed entrambe sono oneste su ciò che riescono a portare.

### Testo semplice → Markdown

\`/text-to-markdown\` prende un \`.txt\` e fa l’escape di ogni carattere che Markdown noterebbe altrimenti: \`*\`, \`_\`, un backtick, le parentesi quadre, una tilde, un \`#\`, \`>\`, \`-\` o \`1.\` a inizio riga, e la barra rovesciata stessa. Traduce anche le abitudini del testo semplice in quelle di Markdown, dato che Markdown trasforma una singola interruzione di riga in uno spazio: un a capo resta un a capo, una riga vuota resta un nuovo paragrafo.

Un \`.txt\` veniva accettato da Markdown → HTML come se fosse già Markdown, e non lo è più. Quella conversione prende \`.md\`, \`.markdown\`, \`.mdown\` e \`.mkd\` — i file che qualcuno ha davvero scritto in Markdown.

### Excel → tabella Markdown

\`/excel-to-markdown\` legge un \`.xlsx\` e restituisce una tabella Markdown per ogni foglio che contiene righe, con un indice non appena ce n’è più di uno. La prima riga di ogni foglio diventa la riga di intestazione. Le date arrivano come normali date ISO invece che come i numeri seriali di Excel.

### Che cosa perde un foglio di calcolo

Una tabella Markdown è testo in una griglia e nient’altro, quindi tutto il resto se ne va: una formula arriva come l’ultimo valore che Excel le ha salvato, le celle unite si appiattiscono, i formati numerici e valutari diventano testo grezzo, e colori, formattazione condizionale, grafici, tabelle pivot, immagini e commenti di cella non hanno alcuna rappresentazione. I fogli vuoti vengono saltati, e una cartella di lavoro senza nemmeno una riga viene rifiutata invece di essere convertita in nulla. \`.xls\`, il formato precedente al 2007, non viene letto — salvalo prima come \`.xlsx\`.

Se la griglia era il documento, questo funziona. Se era la formattazione a portare il significato, una tabella Markdown è la destinazione sbagliata, e scoprirlo qui è meglio che scoprirlo dopo aver incollato il risultato da qualche parte.

### Entrambe girano nel tuo browser

L’escape e il lettore della cartella di lavoro sono JavaScript nella tua stessa scheda, quindi nessuno dei due file viene caricato. L’API converte anche un \`.xlsx\` inviato come corpo della richiesta, l’unico caso in cui non c’è un browser a eseguirli.

Da leggere: [da Excel a una tabella Markdown, per esteso](/blog/convert-excel-to-markdown-table) e [a che cosa serve davvero l’escape](/blog/markdown-escaping).`,
      },
    },
    body:
      'Two more conversions. Raw text → Markdown escapes Markdown\'s own characters before '
      + 'converting, so a `.txt` file with a literal asterisk or underscore in it comes out saying '
      + 'the same thing rather than gaining accidental emphasis — `.txt` used to be accepted on '
      + 'Markdown → HTML as though it already were Markdown, and no longer is. Excel → Markdown '
      + 'table turns an `.xlsx` workbook into one table per sheet, with a table of contents once '
      + 'there is more than one.',
  },
  {
    date: '2026-09-14',
    title: 'Notion and Confluence exports, in one document',
    slug: 'notion-and-confluence-exports',
    detail: {
      en: {
        description:
          'Drop a Notion or Confluence export .zip on TransformPipe and get one Markdown document back — every page in order, with a table of contents.',
        keywords:
          'notion export to markdown, confluence to markdown, convert notion zip to markdown, confluence space export html to markdown, merge notion pages into one document',
        body: `Both tools export a folder of files, one per page, with names nobody chose. Two conversions read that folder and give back a single Markdown document instead: every page in order, under its own heading, with a table of contents at the top.

### Notion

Export a page or a workspace with **Export as Markdown & CSV**, include subpages, and drop the \`.zip\` exactly as it downloaded. Notion appends a 32-character id to every file name; those come off. A database exported alongside a page arrives as a \`.csv\` and becomes a Markdown table in place, where the page referred to it.

### Confluence

Export a space with **Export → HTML** and drop that \`.zip\`. Confluence's HTML carries a great deal of furniture — breadcrumbs, the page tree, the footer with the export date, the attachment table — and none of it is content, so none of it survives. Macros that render to text keep their text; macros that render to a Confluence-only widget do not.

### Links between pages

A link from one exported page to another keeps its words and loses its address. Merged into one document there is nowhere left for it to point: the file it named does not exist any more, and a link to a missing file is worse than a phrase. The same rule applies to an Obsidian vault's \`[[Wikilinks]]\`, which are the same problem in a different syntax.

### It runs in your browser

The zip is read, unpacked and converted on your own machine. Nothing is uploaded, which matters more here than usual: a Confluence space export is a company's internal documentation, and the shortest safe path for it is the one that never leaves.

Related: [a Notion export in detail](/blog/convert-notion-export-to-markdown), and [one Confluence page](/blog/convert-confluence-page-to-markdown).`,
      },
      de: {
        title: 'Notion- und Confluence-Exporte, in einem Dokument',
        summary: `Zwei neue Konvertierungen: legen Sie die .zip aus Notions „Export as Markdown & CSV" oder aus dem „Export → HTML" eines Confluence-Bereichs ab, und Sie bekommen ein einziges Markdown-Dokument zurück — jede Seite der Reihe nach, mit Inhaltsverzeichnis, eine Notion-Datenbank als Tabelle darin.`,
        description:
          'Legen Sie die .zip aus einem Notion- oder Confluence-Export auf TransformPipe ab und bekommen Sie ein Markdown-Dokument: alle Seiten der Reihe nach.',
        keywords:
          'notion export in markdown umwandeln, confluence in markdown umwandeln, notion zip in markdown konvertieren, confluence space export html in markdown, notion seiten zu einem dokument zusammenführen',
        body: `Beide Werkzeuge exportieren einen Ordner voller Dateien, eine pro Seite, mit Namen, die niemand gewählt hat. Zwei Konvertierungen lesen diesen Ordner und geben stattdessen ein einziges Markdown-Dokument zurück: jede Seite der Reihe nach, unter ihrer eigenen Überschrift, mit einem Inhaltsverzeichnis oben.

### Notion

Exportieren Sie eine Seite oder einen Workspace mit **Export as Markdown & CSV**, schließen Sie die Unterseiten ein, und legen Sie die \`.zip\` genau so ab, wie sie heruntergeladen wurde. Notion hängt an jeden Dateinamen eine 32-stellige id; die fällt weg. Eine Datenbank, die neben einer Seite exportiert wurde, kommt als \`.csv\` an und wird an Ort und Stelle zu einer Markdown-Tabelle, dort, wo die Seite sich auf sie bezogen hat.

### Confluence

Exportieren Sie einen Space mit **Export → HTML** und legen Sie diese \`.zip\` ab. Das HTML von Confluence trägt eine Menge Mobiliar mit sich — Brotkrumen, den Seitenbaum, die Fußzeile mit dem Exportdatum, die Tabelle der Anhänge —, und nichts davon ist Inhalt, also überlebt nichts davon. Makros, die zu Text werden, behalten ihren Text; Makros, die zu einem Widget werden, das es nur in Confluence gibt, nicht.

### Links zwischen Seiten

Ein Link von einer exportierten Seite auf eine andere behält seine Wörter und verliert seine Adresse. In einem Dokument zusammengeführt gibt es kein Ziel mehr: die Datei, die er benannt hat, existiert nicht mehr, und ein Link auf eine fehlende Datei ist schlechter als eine Wortfolge. Dieselbe Regel gilt für die \`[[Wikilinks]]\` eines Obsidian-Tresors, die dasselbe Problem in einer anderen Syntax sind.

### Es läuft in Ihrem Browser

Die Zip-Datei wird auf Ihrem eigenen Rechner gelesen, entpackt und konvertiert. Nichts wird hochgeladen, was hier mehr zählt als sonst: Der Export eines Confluence-Space ist die interne Dokumentation eines Unternehmens, und der kürzeste sichere Weg für sie ist der, der nirgendwohin führt.

Weiter: [ein Notion-Export im Detail](/blog/convert-notion-export-to-markdown) und [eine einzelne Confluence-Seite](/blog/convert-confluence-page-to-markdown).`,
      },
      fr: {
        title: 'Exports Notion et Confluence, en un seul document',
        summary: `Deux nouvelles conversions : déposez le .zip issu de « Export as Markdown & CSV » dans Notion ou de « Export → HTML » pour un espace Confluence, et récupérez un seul document Markdown — chaque page dans l’ordre, avec un sommaire, une base Notion incluse sous forme de tableau. Un lien d’une page exportée vers une autre garde ses mots ; fondu en un document, il n’a plus rien à viser, l’adresse n’est donc pas reportée.`,
        description:
          'Déposez le .zip d’un export Notion ou Confluence sur TransformPipe et récupérez un seul document Markdown : chaque page dans l’ordre, avec un sommaire.',
        keywords:
          'export notion en markdown, confluence en markdown, convertir un zip notion en markdown, export html d’un espace confluence en markdown, fusionner des pages notion en un document',
        body: `Les deux outils exportent un dossier de fichiers, un par page, avec des noms que personne n’a choisis. Deux conversions lisent ce dossier et rendent à la place un seul document Markdown : chaque page dans l’ordre, sous son propre titre, avec un sommaire en tête.

### Notion

Exportez une page ou un espace de travail avec **Export as Markdown & CSV**, incluez les sous-pages, et déposez le \`.zip\` exactement tel qu’il a été téléchargé. Notion ajoute un identifiant de 32 caractères à chaque nom de fichier ; ceux-là sautent. Une base de données exportée à côté d’une page arrive en \`.csv\` et devient un tableau Markdown sur place, là où la page y renvoyait.

### Confluence

Exportez un espace avec **Export → HTML** et déposez ce \`.zip\`. Le HTML de Confluence transporte beaucoup de mobilier — le fil d’Ariane, l’arbre des pages, le pied de page avec la date d’export, le tableau des pièces jointes — et rien de tout cela n’est du contenu, donc rien n’en survit. Les macros qui se rendent en texte gardent leur texte ; celles qui se rendent en composant propre à Confluence, non.

### Les liens entre pages

Un lien d’une page exportée vers une autre garde ses mots et perd son adresse. Fondu en un seul document, il n’a plus rien à viser : le fichier qu’il nommait n’existe plus, et un lien vers un fichier absent vaut moins qu’une formule. La même règle s’applique aux \`[[Wikilinks]]\` d’un coffre Obsidian, qui sont le même problème dans une autre syntaxe.

### Cela tourne dans votre navigateur

Le zip est lu, décompressé et converti sur votre propre machine. Rien n’est téléversé, ce qui compte plus qu’ailleurs ici : l’export d’un espace Confluence, c’est la documentation interne d’une entreprise, et le chemin sûr le plus court est celui qui ne sort jamais.

Autres lectures : [un export Notion en détail](/blog/convert-notion-export-to-markdown) et [une seule page Confluence](/blog/convert-confluence-page-to-markdown).`,
      },
      es: {
        title: 'Exportaciones de Notion y Confluence, en un solo documento',
        summary: `Dos conversiones nuevas: suelta el .zip de «Export as Markdown & CSV» de Notion o del «Export → HTML» de un espacio de Confluence y recibe un solo documento Markdown — cada página en orden, con un índice, y una base de datos de Notion incluida como tabla. Un enlace de una página exportada a otra conserva sus palabras; fundido en un único documento ya no tiene adónde apuntar, así que la dirección no se traslada.`,
        description:
          'Suelta el .zip de una exportación de Notion o Confluence en TransformPipe y recibe un solo documento Markdown: cada página en orden, con un índice.',
        keywords:
          'exportar notion a markdown, confluence a markdown, convertir zip de notion a markdown, export html de espacio confluence a markdown, unir páginas de notion en un documento',
        body: `Las dos herramientas exportan una carpeta de archivos, uno por página, con nombres que no ha elegido nadie. Dos conversiones leen esa carpeta y devuelven en su lugar un único documento Markdown: cada página en orden, bajo su propio encabezado, con un índice arriba.

### Notion

Exporta una página o un espacio de trabajo con **Export as Markdown & CSV**, incluye las subpáginas y suelta el \`.zip\` tal cual se descargó. Notion añade un identificador de 32 caracteres a cada nombre de archivo; esos se quitan. Una base de datos exportada junto a una página llega como \`.csv\` y se convierte en una tabla Markdown ahí mismo, donde la página se refería a ella.

### Confluence

Exporta un espacio con **Export → HTML** y suelta ese \`.zip\`. El HTML de Confluence arrastra muchísimo mobiliario — migas de pan, el árbol de páginas, el pie con la fecha de exportación, la tabla de adjuntos — y nada de eso es contenido, así que nada de eso sobrevive. Las macros que se renderizan como texto conservan su texto; las que se renderizan como un widget que solo existe en Confluence, no.

### Los enlaces entre páginas

Un enlace de una página exportada a otra conserva sus palabras y pierde su dirección. Fundido en un solo documento ya no tiene adónde apuntar: el archivo que nombraba ha dejado de existir, y un enlace a un archivo ausente es peor que una frase. La misma regla vale para los \`[[Wikilinks]]\` de una bóveda de Obsidian, que son el mismo problema en otra sintaxis.

### Corre en tu navegador

El zip se lee, se descomprime y se convierte en tu propia máquina. No se sube nada, y aquí importa más que de costumbre: la exportación de un espacio de Confluence es la documentación interna de una empresa, y el camino seguro más corto es el que no sale nunca.

Relacionado: [una exportación de Notion en detalle](/blog/convert-notion-export-to-markdown) y [una sola página de Confluence](/blog/convert-confluence-page-to-markdown).`,
      },
      it: {
        title: 'Export di Notion e Confluence, in un solo documento',
        summary: `Due nuove conversioni: rilascia lo .zip di «Export as Markdown & CSV» di Notion o dell’«Export → HTML» di uno spazio Confluence e ricevi un solo documento Markdown — ogni pagina nell’ordine, con un indice, e un database Notion incluso come tabella. Un link da una pagina esportata a un’altra mantiene le sue parole; fuso in un unico documento non ha più nulla da indicare, quindi l’indirizzo non viene riportato.`,
        description:
          'Rilascia lo .zip di un export di Notion o Confluence su TransformPipe e ricevi un solo documento Markdown: ogni pagina nell’ordine, con un indice.',
        keywords:
          'export notion in markdown, confluence in markdown, convertire zip notion in markdown, export html spazio confluence in markdown, unire pagine notion in un documento',
        body: `Entrambi gli strumenti esportano una cartella di file, uno per pagina, con nomi che non ha scelto nessuno. Due conversioni leggono quella cartella e restituiscono invece un unico documento Markdown: ogni pagina nell’ordine, sotto il proprio titolo, con un indice in cima.

### Notion

Esporta una pagina o un intero spazio di lavoro con **Export as Markdown & CSV**, includi le sottopagine e rilascia lo \`.zip\` esattamente come è stato scaricato. Notion aggiunge a ogni nome di file un id di 32 caratteri; quello viene tolto. Un database esportato accanto a una pagina arriva come \`.csv\` e diventa una tabella Markdown sul posto, dove la pagina vi faceva riferimento.

### Confluence

Esporta uno spazio con **Export → HTML** e rilascia quello \`.zip\`. L’HTML di Confluence porta con sé moltissimo arredamento — le briciole di pane, l’albero delle pagine, il piè di pagina con la data dell’export, la tabella degli allegati — e niente di tutto ciò è contenuto, quindi niente sopravvive. Le macro che si rendono come testo mantengono il loro testo; quelle che si rendono in un widget che esiste solo dentro Confluence, no.

### I link tra le pagine

Un link da una pagina esportata a un’altra mantiene le sue parole e perde il suo indirizzo. Fuso in un unico documento non ha più nulla da indicare: il file che nominava non esiste più, e un link a un file mancante vale meno di una frase. La stessa regola si applica ai \`[[Wikilinks]]\` di un vault Obsidian, che sono lo stesso problema in un’altra sintassi.

### Gira nel tuo browser

Lo zip viene letto, scompattato e convertito sulla tua macchina. Non viene caricato nulla, e qui conta più del solito: l’export di uno spazio Confluence è la documentazione interna di un’azienda, e la strada sicura più breve è quella che non esce mai.

Da leggere: [un export di Notion nel dettaglio](/blog/convert-notion-export-to-markdown) e [una singola pagina Confluence](/blog/convert-confluence-page-to-markdown).`,
      },
    },
    body:
      'Two new conversions: drop the .zip from Notion\'s "Export as Markdown & CSV" or a '
      + 'Confluence space\'s "Export → HTML", and get one Markdown document back — every page in '
      + 'order, with a table of contents, a Notion database included as a table. A link from one '
      + 'page to another in the export keeps its words; merged into one document there is nowhere '
      + 'left for it to point, so the address does not carry over.',
  },
  {
    date: '2026-09-11',
    title: 'A PDF from the API, without a browser',
    slug: 'markdown-to-pdf-api',
    detail: {
      en: {
        description:
          'GET /api/v1/documents/:id.pdf turns a saved Markdown document into a PDF on the server — no headless Chrome, no build step, one authenticated request.',
        keywords:
          'markdown to pdf api, convert markdown to pdf without a browser, md to pdf command line, generate pdf in ci, markdown to pdf rest api',
        body: `\`GET /api/v1/documents/:id.pdf\`, with an API key, returns a laid-out PDF of a saved document. It is meant for the case that has no browser in it: a scheduled job, a CI step that attaches a report to a release, a script that mails a weekly summary.

### Why this exists separately from printing

Most Markdown-to-PDF tools are a headless Chrome in a trench coat. That gives an exact rendering and costs a browser: several hundred megabytes of dependency, a sandbox to keep it in, a start-up per request, and a memory ceiling that a long document reaches before a person does. None of that fits inside a serverless function, and a service that quietly starts a browser per request is a service that is slow and expensive for the one case that could have been neither.

This lays the document out directly — headings, paragraphs, lists, tables, code blocks and rules — with no browser anywhere in the path. It starts immediately and finishes in milliseconds.

### What it is not

It is not a pixel-for-pixel copy of the preview. The app's own **Print or save as PDF** still uses the browser's own rendering, which is exact, and that has not changed: if you want the page as you see it, print it. If you want a PDF from a machine, ask for one.

### Using it

    curl -H "Authorization: Bearer tp_live_…" \\
      https://transformpipe.com/api/v1/documents/<id>.pdf -o report.pdf

The same document is available as \`.docx\`, \`.html\` and \`.md\` by changing the extension, so one saved document is four formats without a second conversion.

Related: [the ways Markdown becomes a PDF](/blog/markdown-to-pdf), and [converting documents with an API](/blog/converting-documents-with-an-api).`,
      },
      de: {
        title: 'Ein PDF aus der API, ohne Browser',
        summary: `\`GET /api/v1/documents/:id.pdf\` setzt ein Dokument auf dem Server als PDF, für ein Skript oder einen CI-Lauf, der keinen Browser zum Drucken hat. Die App selbst nutzt dafür weiterhin „Drucken oder als PDF sichern" — das ist die exakte Darstellung des Browsers, und dies ersetzt sie nicht.`,
        description:
          'GET /api/v1/documents/:id.pdf macht aus einem gespeicherten Markdown-Dokument ein PDF auf dem Server — ohne Headless-Chrome, in einer einzigen Anfrage.',
        keywords:
          'markdown in pdf api, markdown ohne browser in pdf umwandeln, md in pdf kommandozeile, pdf in ci erzeugen, markdown in pdf rest api',
        body: `\`GET /api/v1/documents/:id.pdf\` liefert mit einem API-Schlüssel ein gesetztes PDF eines gespeicherten Dokuments. Gedacht ist es für den Fall, in dem kein Browser vorkommt: ein geplanter Job, ein CI-Schritt, der einem Release einen Bericht anhängt, ein Skript, das eine Wochenübersicht verschickt.

### Warum das getrennt vom Drucken existiert

Die meisten Werkzeuge von Markdown nach PDF sind ein Headless-Chrome im Trenchcoat. Das ergibt eine exakte Darstellung und kostet einen Browser: mehrere hundert Megabyte Abhängigkeit, eine Sandbox, in der er bleibt, ein Start pro Anfrage und eine Speichergrenze, die ein langes Dokument früher erreicht als ein Mensch. Nichts davon passt in eine Serverless-Funktion, und ein Dienst, der still pro Anfrage einen Browser startet, ist langsam und teuer für den einen Fall, der weder das eine noch das andere hätte sein müssen.

Hier wird das Dokument direkt gesetzt — Überschriften, Absätze, Listen, Tabellen, Codeblöcke und Linien —, ohne Browser irgendwo im Weg. Es startet sofort und ist in Millisekunden fertig.

### Was es nicht ist

Es ist keine pixelgenaue Kopie der Vorschau. **Drucken oder als PDF sichern** in der App benutzt weiterhin die Darstellung des Browsers selbst, die exakt ist, und daran ändert sich nichts: Wenn Sie die Seite so wollen, wie Sie sie sehen, drucken Sie sie. Wenn Sie ein PDF von einer Maschine wollen, fragen Sie danach.

### So benutzen Sie es

    curl -H "Authorization: Bearer tp_live_…" \\
      https://transformpipe.com/api/v1/documents/<id>.pdf -o report.pdf

Dasselbe Dokument gibt es als \`.docx\`, \`.html\` und \`.md\`, indem Sie die Endung ändern — ein gespeichertes Dokument sind also vier Formate ohne eine zweite Konvertierung.

Weiter: [die Wege von Markdown zum PDF](/blog/markdown-to-pdf) und [Dokumente über eine API konvertieren](/blog/converting-documents-with-an-api).`,
      },
      fr: {
        title: 'Un PDF depuis l’API, sans navigateur',
        summary: `\`GET /api/v1/documents/:id.pdf\` met un document en pages sous forme de PDF sur le serveur, pour un script ou un travail d’intégration continue qui n’a pas de navigateur d’où imprimer. L’application, elle, continue d’utiliser « Imprimer ou enregistrer en PDF » pour cela — c’est le rendu exact du navigateur lui-même, et ceci ne le remplace pas.`,
        description:
          'GET /api/v1/documents/:id.pdf transforme un document Markdown enregistré en PDF sur le serveur : pas de Chrome sans tête, une seule requête authentifiée.',
        keywords:
          'api markdown vers pdf, convertir du markdown en pdf sans navigateur, md en pdf en ligne de commande, générer un pdf dans la ci, api rest markdown pdf',
        body: `\`GET /api/v1/documents/:id.pdf\`, avec une clé d’API, renvoie un PDF mis en pages d’un document enregistré. C’est fait pour le cas où il n’y a aucun navigateur : une tâche planifiée, une étape d’intégration continue qui joint un rapport à une version, un script qui envoie un résumé hebdomadaire.

### Pourquoi cela existe à part de l’impression

La plupart des outils de Markdown vers PDF sont un Chrome sans tête déguisé. Cela donne un rendu exact et coûte un navigateur : plusieurs centaines de mégaoctets de dépendance, un bac à sable pour l’y tenir, un démarrage par requête, et un plafond de mémoire qu’un long document atteint avant un humain. Rien de tout cela n’entre dans une fonction serverless, et un service qui démarre discrètement un navigateur par requête est un service lent et cher pour le seul cas qui aurait pu n’être ni l’un ni l’autre.

Ici, le document est mis en pages directement — titres, paragraphes, listes, tableaux, blocs de code et filets — sans navigateur nulle part sur le chemin. Cela démarre tout de suite et se termine en quelques millisecondes.

### Ce que ce n’est pas

Ce n’est pas une copie au pixel près de l’aperçu. La commande **Imprimer ou enregistrer en PDF** de l’application utilise toujours le rendu propre du navigateur, qui est exact, et cela n’a pas changé : si vous voulez la page telle que vous la voyez, imprimez-la. Si vous voulez un PDF depuis une machine, demandez-en un.

### L’utiliser

    curl -H "Authorization: Bearer tp_live_…" \\
      https://transformpipe.com/api/v1/documents/<id>.pdf -o report.pdf

Le même document est disponible en \`.docx\`, \`.html\` et \`.md\` en changeant l’extension : un document enregistré fait donc quatre formats sans seconde conversion.

Autres lectures : [les chemins de Markdown vers le PDF](/blog/markdown-to-pdf) et [convertir des documents avec une API](/blog/converting-documents-with-an-api).`,
      },
      es: {
        title: 'Un PDF desde la API, sin navegador',
        summary: `\`GET /api/v1/documents/:id.pdf\` maqueta un documento como PDF en el servidor, para un script o un trabajo de integración continua que no tiene navegador desde el que imprimir. La propia aplicación sigue usando «Imprimir o guardar como PDF» para eso — es la representación exacta del navegador, y esto no la sustituye.`,
        description:
          'GET /api/v1/documents/:id.pdf convierte un documento Markdown guardado en un PDF en el servidor: sin Chrome sin cabeza, con una sola petición autenticada.',
        keywords:
          'api de markdown a pdf, convertir markdown a pdf sin navegador, md a pdf por línea de comandos, generar pdf en ci, api rest markdown pdf',
        body: `\`GET /api/v1/documents/:id.pdf\`, con una clave de API, devuelve un PDF maquetado de un documento guardado. Está pensado para el caso en el que no hay ningún navegador: una tarea programada, un paso de integración continua que adjunta un informe a una versión, un script que envía un resumen semanal.

### Por qué existe aparte de imprimir

La mayoría de las herramientas de Markdown a PDF son un Chrome sin cabeza con gabardina. Eso da una representación exacta y cuesta un navegador: varios cientos de megabytes de dependencia, un entorno aislado donde encerrarlo, un arranque por petición y un techo de memoria que un documento largo alcanza antes que una persona. Nada de eso cabe en una función serverless, y un servicio que arranca en silencio un navegador por petición es un servicio lento y caro para el único caso que podría no haber sido ninguna de las dos cosas.

Aquí el documento se maqueta directamente — encabezados, párrafos, listas, tablas, bloques de código y filetes — sin navegador en ninguna parte del camino. Arranca de inmediato y termina en milisegundos.

### Lo que no es

No es una copia píxel a píxel de la vista previa. La opción **Imprimir o guardar como PDF** de la aplicación sigue usando la representación propia del navegador, que es exacta, y eso no ha cambiado: si quieres la página tal como la ves, imprímela. Si quieres un PDF desde una máquina, pídelo.

### Cómo se usa

    curl -H "Authorization: Bearer tp_live_…" \\
      https://transformpipe.com/api/v1/documents/<id>.pdf -o report.pdf

El mismo documento está disponible como \`.docx\`, \`.html\` y \`.md\` cambiando la extensión, así que un documento guardado son cuatro formatos sin una segunda conversión.

Relacionado: [los caminos de Markdown al PDF](/blog/markdown-to-pdf) y [convertir documentos con una API](/blog/converting-documents-with-an-api).`,
      },
      it: {
        title: 'Un PDF dall’API, senza browser',
        summary: `\`GET /api/v1/documents/:id.pdf\` impagina un documento come PDF sul server, per uno script o un lavoro di integrazione continua che non ha un browser da cui stampare. L’applicazione continua a usare «Stampa o salva come PDF» per quello — è la resa esatta del browser, e questo non la sostituisce.`,
        description:
          'GET /api/v1/documents/:id.pdf trasforma un documento Markdown salvato in un PDF sul server: niente Chrome headless, una sola richiesta autenticata.',
        keywords:
          'api da markdown a pdf, convertire markdown in pdf senza browser, md in pdf da riga di comando, generare pdf in ci, api rest markdown pdf',
        body: `\`GET /api/v1/documents/:id.pdf\`, con una chiave API, restituisce un PDF impaginato di un documento salvato. È pensato per il caso in cui non c’è alcun browser: un lavoro pianificato, un passaggio di integrazione continua che allega un rapporto a una release, uno script che spedisce un riepilogo settimanale.

### Perché esiste separato dalla stampa

Gran parte degli strumenti da Markdown a PDF è un Chrome headless con il trench. Dà una resa esatta e costa un browser: diverse centinaia di megabyte di dipendenze, una sandbox in cui tenerlo, un avvio per ogni richiesta e un tetto di memoria che un documento lungo raggiunge prima di una persona. Niente di tutto questo entra in una funzione serverless, e un servizio che avvia in silenzio un browser per ogni richiesta è lento e costoso proprio nel caso che avrebbe potuto non essere né l’uno né l’altro.

Qui il documento viene impaginato direttamente — titoli, paragrafi, elenchi, tabelle, blocchi di codice e linee — senza alcun browser lungo il percorso. Parte subito e finisce in millisecondi.

### Che cosa non è

Non è una copia pixel per pixel dell’anteprima. Il comando **Stampa o salva come PDF** dell’applicazione usa ancora la resa propria del browser, che è esatta, e questo non è cambiato: se vuoi la pagina così come la vedi, stampala. Se vuoi un PDF da una macchina, chiedilo.

### Come si usa

    curl -H "Authorization: Bearer tp_live_…" \\
      https://transformpipe.com/api/v1/documents/<id>.pdf -o report.pdf

Lo stesso documento è disponibile come \`.docx\`, \`.html\` e \`.md\` cambiando l’estensione: un documento salvato è quindi quattro formati senza una seconda conversione.

Da leggere: [le strade da Markdown al PDF](/blog/markdown-to-pdf) e [convertire documenti con un’API](/blog/converting-documents-with-an-api).`,
      },
    },
    body:
      '`GET /api/v1/documents/:id.pdf` lays a document out as a PDF on the server, for a script '
      + 'or a CI job that has no browser to print from. The app itself still uses "Print or save '
      + 'as PDF" for that — it is the browser\'s own, exact rendering, and this does not replace it.',
  },
  {
    date: '2026-09-11',
    title: 'Download a saved document as Word',
    slug: 'markdown-to-word',
    detail: {
      en: {
        description:
          'Convert Markdown to a real .docx on TransformPipe: headings, tables, lists and code survive, and Word opens it without a plugin or a headless browser.',
        keywords:
          'markdown to word, convert md to docx, markdown to docx converter, download markdown as word document, markdown table to word',
        body: `A saved document can be downloaded as a \`.docx\`, built from the same HTML the preview already shows. Word, Pages, LibreOffice and Google Docs all open it as an ordinary document — headings are Word headings, tables are Word tables, lists nest, and code keeps its monospace.

### What survives the trip

Headings one to six, paragraphs, bold and italic, ordered and unordered lists with their nesting, tables with their header row, block quotes, horizontal rules, links with their text and their address, and fenced code. What does not: anything that only exists in a browser — a live embed, a collapsible section, a mermaid diagram that was never rendered to an image.

Remote images are deliberately left out. A converter that fetches every picture a document mentions is a converter that makes a request to any address the document's author chose, and the trade — a picture, for a server that follows strangers' links — is not worth making.

### Why it needs a save first

The conversion runs on the account's copy of the document, which is what the download endpoint reads. Converting a file you have only just dropped is the browser's job and does not involve the account at all; \`.docx\` is the one direction that does.

### The other direction

Dropping a \`.docx\` on the converter reads it back into Markdown — headings, tables, lists and all — which is the round trip most people actually want: a Word document out of a colleague's mailbox, into Markdown, into a repository.

### From a script

\`GET /api/v1/documents/:id.docx\` with an API key returns the same file, for a build that publishes documentation as Word for people who want it that way.

Related: [Markdown to Word, in full](/blog/markdown-to-word), and [reading a \`.docx\` back into Markdown](/blog/convert-docx-to-markdown).`,
      },
      de: {
        title: 'Ein gespeichertes Dokument als Word herunterladen',
        summary: `Das Download-Menü eines gespeicherten Dokuments bietet jetzt eine \`.docx\` an, an Ort und Stelle aus demselben HTML gebaut, das die Vorschau bereits anzeigt. Kein Browser im Hintergrund — es braucht vorher ein Speichern, denn die Konvertierung läuft auf der Kopie im Konto.`,
        description:
          'Markdown auf TransformPipe in eine echte .docx umwandeln: Überschriften, Tabellen, Listen und Code bleiben, und Word öffnet die Datei ohne Plug-in.',
        keywords:
          'markdown in word umwandeln, md in docx konvertieren, markdown docx konverter, markdown als word dokument herunterladen, markdown tabelle in word',
        body: `Ein gespeichertes Dokument lässt sich als \`.docx\` herunterladen, gebaut aus demselben HTML, das die Vorschau ohnehin zeigt. Word, Pages, LibreOffice und Google Docs öffnen es als gewöhnliches Dokument — Überschriften sind Word-Überschriften, Tabellen sind Word-Tabellen, Listen verschachteln sich, und Code behält seine Festbreitenschrift.

### Was die Reise übersteht

Überschriften eins bis sechs, Absätze, Fett und Kursiv, geordnete und ungeordnete Listen samt ihrer Verschachtelung, Tabellen mit ihrer Kopfzeile, Blockzitate, Trennlinien, Links mit ihrem Text und ihrer Adresse und eingezäunter Code. Was nicht: alles, was es nur in einem Browser gibt — eine lebende Einbettung, ein aufklappbarer Abschnitt, ein Mermaid-Diagramm, das nie zu einem Bild gerendert wurde.

Bilder von fremden Adressen bleiben absichtlich draußen. Ein Konverter, der jedes Bild holt, das ein Dokument erwähnt, ist ein Konverter, der eine Anfrage an jede Adresse stellt, die der Autor des Dokuments gewählt hat — und der Handel, ein Bild gegen einen Server, der Fremden hinterherläuft, lohnt sich nicht.

### Warum vorher gespeichert werden muss

Die Konvertierung läuft auf der Kopie des Dokuments im Konto, und die liest der Endpunkt für den Download. Eine Datei zu konvertieren, die Sie gerade erst abgelegt haben, ist Sache des Browsers und hat mit dem Konto überhaupt nichts zu tun; \`.docx\` ist die eine Richtung, die es doch hat.

### Die andere Richtung

Legen Sie eine \`.docx\` auf den Konverter, wird sie zurück nach Markdown gelesen — Überschriften, Tabellen, Listen und alles —, und das ist der Weg, den die meisten tatsächlich wollen: ein Word-Dokument aus dem Postfach einer Kollegin, nach Markdown, in ein Repository.

### Aus einem Skript

\`GET /api/v1/documents/:id.docx\` liefert mit einem API-Schlüssel dieselbe Datei — für einen Build, der Dokumentation als Word veröffentlicht, für Leute, die sie so haben wollen.

Weiter: [Markdown nach Word, ausführlich](/blog/markdown-to-word) und [eine \`.docx\` zurück nach Markdown lesen](/blog/convert-docx-to-markdown).`,
      },
      fr: {
        title: 'Télécharger un document enregistré au format Word',
        summary: `Le menu de téléchargement d’un document enregistré propose désormais un \`.docx\`, construit sur place à partir du même HTML que celui de l’aperçu. Aucun navigateur sans tête là-dedans — il faut enregistrer d’abord, puisque la conversion travaille sur la copie du compte.`,
        description:
          'Convertissez du Markdown en vrai .docx sur TransformPipe : titres, tableaux, listes et code survivent, et Word l’ouvre sans greffon ni navigateur sans tête.',
        keywords:
          'markdown en word, convertir md en docx, convertisseur markdown docx, télécharger du markdown en document word, tableau markdown vers word',
        body: `Un document enregistré peut être téléchargé en \`.docx\`, construit à partir du même HTML que celui que l’aperçu affiche déjà. Word, Pages, LibreOffice et Google Docs l’ouvrent tous comme un document ordinaire — les titres sont des titres Word, les tableaux des tableaux Word, les listes s’imbriquent, et le code garde sa chasse fixe.

### Ce qui survit au voyage

Les titres de un à six, les paragraphes, le gras et l’italique, les listes ordonnées et non ordonnées avec leur imbrication, les tableaux avec leur ligne d’en-tête, les citations, les filets horizontaux, les liens avec leur texte et leur adresse, et le code encadré. Ce qui ne survit pas : tout ce qui n’existe que dans un navigateur — une intégration vivante, une section repliable, un diagramme mermaid qui n’a jamais été rendu en image.

Les images distantes sont volontairement laissées de côté. Un convertisseur qui va chercher chaque image qu’un document mentionne est un convertisseur qui fait une requête vers toute adresse choisie par l’auteur du document, et le marché — une image contre un serveur qui suit les liens d’inconnus — ne vaut pas la peine.

### Pourquoi il faut enregistrer d’abord

La conversion travaille sur la copie du document dans le compte, et c’est elle que lit le point d’accès de téléchargement. Convertir un fichier que vous venez tout juste de déposer est l’affaire du navigateur et ne concerne pas le compte ; \`.docx\` est la seule direction qui le concerne.

### L’autre sens

Déposer un \`.docx\` sur le convertisseur le relit en Markdown — titres, tableaux, listes et le reste —, et c’est l’aller-retour que la plupart des gens veulent vraiment : un document Word sorti de la boîte aux lettres d’un collègue, vers Markdown, vers un dépôt.

### Depuis un script

\`GET /api/v1/documents/:id.docx\` avec une clé d’API renvoie le même fichier, pour une chaîne de construction qui publie sa documentation en Word à l’intention de ceux qui la veulent ainsi.

Autres lectures : [Markdown vers Word, en détail](/blog/markdown-to-word) et [relire un \`.docx\` en Markdown](/blog/convert-docx-to-markdown).`,
      },
      es: {
        title: 'Descargar un documento guardado como Word',
        summary: `El menú de descarga de un documento guardado ofrece ahora un \`.docx\`, construido en el momento a partir del mismo HTML que ya muestra la vista previa. Sin navegador sin cabeza de por medio — hace falta guardar antes, porque la conversión trabaja sobre la copia de la cuenta.`,
        description:
          'Convierte Markdown en un .docx de verdad en TransformPipe: encabezados, tablas, listas y código sobreviven, y Word lo abre sin complementos ni navegador.',
        keywords:
          'markdown a word, convertir md a docx, conversor markdown docx, descargar markdown como documento word, tabla markdown a word',
        body: `Un documento guardado se puede descargar como \`.docx\`, construido a partir del mismo HTML que ya muestra la vista previa. Word, Pages, LibreOffice y Google Docs lo abren como un documento corriente — los encabezados son encabezados de Word, las tablas son tablas de Word, las listas se anidan y el código conserva su tipografía monoespaciada.

### Qué sobrevive al viaje

Los encabezados del uno al seis, los párrafos, la negrita y la cursiva, las listas ordenadas y sin ordenar con su anidamiento, las tablas con su fila de encabezado, las citas en bloque, las líneas horizontales, los enlaces con su texto y su dirección, y el código en bloque cercado. Lo que no: todo lo que solo existe dentro de un navegador — una incrustación viva, una sección plegable, un diagrama mermaid que nunca se renderizó como imagen.

Las imágenes remotas se dejan fuera a propósito. Un conversor que va a buscar cada imagen que un documento menciona es un conversor que hace una petición a cualquier dirección que haya elegido el autor de ese documento, y el trato — una imagen a cambio de un servidor que sigue los enlaces de desconocidos — no compensa.

### Por qué hace falta guardar antes

La conversión trabaja sobre la copia del documento en la cuenta, que es lo que lee el punto de acceso de descarga. Convertir un archivo que acabas de soltar es cosa del navegador y no involucra a la cuenta en absoluto; \`.docx\` es la única dirección que sí.

### El sentido contrario

Soltar un \`.docx\` en el conversor lo vuelve a leer como Markdown — encabezados, tablas, listas y todo lo demás —, que es el viaje de ida y vuelta que la mayoría quiere de verdad: un documento de Word salido del buzón de un colega, a Markdown, a un repositorio.

### Desde un script

\`GET /api/v1/documents/:id.docx\` con una clave de API devuelve el mismo archivo, para una compilación que publica la documentación en Word para quien la quiere así.

Relacionado: [Markdown a Word, al completo](/blog/markdown-to-word) y [leer un \`.docx\` de vuelta a Markdown](/blog/convert-docx-to-markdown).`,
      },
      it: {
        title: 'Scaricare un documento salvato come Word',
        summary: `Il menu di download di un documento salvato offre ora un \`.docx\`, costruito sul posto a partire dallo stesso HTML che l’anteprima già mostra. Nessun browser headless di mezzo — serve prima un salvataggio, perché la conversione lavora sulla copia nell’account.`,
        description:
          'Converti Markdown in un vero .docx su TransformPipe: titoli, tabelle, elenchi e codice sopravvivono, e Word lo apre senza plugin né browser headless.',
        keywords:
          'markdown in word, convertire md in docx, convertitore markdown docx, scaricare markdown come documento word, tabella markdown in word',
        body: `Un documento salvato può essere scaricato come \`.docx\`, costruito a partire dallo stesso HTML che l’anteprima già mostra. Word, Pages, LibreOffice e Google Docs lo aprono come un documento qualsiasi — i titoli sono titoli di Word, le tabelle sono tabelle di Word, gli elenchi si annidano e il codice mantiene il suo monospaziato.

### Che cosa sopravvive al viaggio

I titoli da uno a sei, i paragrafi, il grassetto e il corsivo, gli elenchi numerati e puntati con la loro annidatura, le tabelle con la riga di intestazione, le citazioni, le linee orizzontali, i link con il loro testo e il loro indirizzo, e il codice recintato. Che cosa no: tutto ciò che esiste solo dentro un browser — un incorporamento vivo, una sezione richiudibile, un diagramma mermaid mai reso come immagine.

Le immagini remote restano fuori di proposito. Un convertitore che va a prendere ogni figura citata da un documento è un convertitore che fa una richiesta a qualunque indirizzo abbia scelto l’autore di quel documento, e lo scambio — una figura in cambio di un server che segue i link di sconosciuti — non conviene.

### Perché serve prima un salvataggio

La conversione lavora sulla copia del documento nell’account, ed è quella che l’endpoint di download legge. Convertire un file appena rilasciato è compito del browser e non coinvolge affatto l’account; \`.docx\` è l’unica direzione che lo fa.

### La direzione opposta

Rilasciare un \`.docx\` sul convertitore lo rilegge in Markdown — titoli, tabelle, elenchi e tutto il resto — ed è il giro di andata e ritorno che la maggior parte delle persone vuole davvero: un documento Word uscito dalla casella di posta di un collega, in Markdown, dentro un repository.

### Da uno script

\`GET /api/v1/documents/:id.docx\` con una chiave API restituisce lo stesso file, per una build che pubblica la documentazione in Word per chi la vuole così.

Da leggere: [da Markdown a Word, per esteso](/blog/markdown-to-word) e [rileggere un \`.docx\` in Markdown](/blog/convert-docx-to-markdown).`,
      },
    },
    body:
      'The download menu on a saved document now offers a `.docx`, built on the spot from the '
      + 'same HTML the preview already renders. No headless browser involved — it needs a save '
      + 'first, since the conversion runs on the account\'s copy.',
  },
  {
    date: '2026-09-11',
    title: 'Webhooks: a signed notice when a document is created or shared',
    slug: 'webhooks',
    detail: {
      en: {
        description:
          'Register a URL and TransformPipe posts a signed notice when a document is created or shared: HMAC-SHA256, in the header shape Stripe uses.',
        keywords:
          'document webhook, verify hmac sha256 webhook signature, webhook signature verification in node, x-transformpipe-signature header, webhook when a document is created',
        body: `Two things happen on an account that another program might want to know about the moment they happen: a document was created, and a document was shared. **Account menu → Webhooks** is where you name an \`https://\` URL that should hear about them, and read the secret its deliveries are signed with.

### What arrives

A \`POST\` whose JSON body has three keys — the event, the time, and the data:

\`\`\`json
{
  "event": "document.created",
  "created_at": "2026-09-11T09:12:44.000Z",
  "data": { "id": "…", "name": "release-notes.md", "kind": "markdown-to-html", "size": 4193 }
}
\`\`\`

\`document.shared\` carries the \`id\` and \`name\`, the \`mode\` the document is now in, the share \`url\`, and \`notified\`, the addresses a share notice actually went to. Neither event carries the document's text: a receiver that needs it has the id and an API key.

### Checking the signature

Each delivery has an \`x-transformpipe-signature\` header shaped \`t=<unix seconds>,v1=<hex>\`, where \`v1\` is HMAC-SHA256 over the string \`<t>.<body>\`, keyed with this webhook's secret — the shape Stripe and GitHub both use, so verification code you already have usually needs only a different secret.

\`\`\`js
import { createHmac, timingSafeEqual } from 'node:crypto';

// \`raw\` is the body as it arrived. A parsed and re-encoded copy will not hash the same.
export function verify(raw, header, secret) {
  const [t, v1] = header.split(',').map((part) => part.split('=')[1]);
  const want = createHmac('sha256', secret).update(\`\${t}.\${raw}\`).digest('hex');

  return (
    v1.length === want.length &&
    timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(want, 'hex'))
  );
}
\`\`\`

Reject a \`t\` more than a few minutes old and a captured delivery cannot be replayed at you later. The secret begins \`whsec_\` and can be read again from the dialog whenever you need it — unlike an API key, it is presented by us to you, so seeing it twice while setting a receiver up is legitimate rather than a leak.

### One attempt, no queue

A delivery is one request with a five-second timeout. There is no retry and no queue: a receiver that is down misses that event, and the next event tries again on its own. The dialog shows the last status, or the last error, for every URL. Redirects are not followed, and the address is checked as a public one again at the moment of posting rather than only when it was registered.

### Why an API key cannot register one

Webhooks are managed from a signed-in session only. A key that could register a webhook would turn a point-in-time leak into a standing feed of every document that came after it, which is a much worse thing to lose than a key.

Related: [converting documents with an API](/blog/converting-documents-with-an-api), and [publishing from GitHub Actions](/blog/publish-markdown-from-github-actions).`,
      },
      de: {
        title: 'Webhooks: eine signierte Nachricht, wenn ein Dokument erstellt oder geteilt wird',
        summary: `Im Konto-Menü → Webhooks hinterlegen Sie eine URL, die für zwei Ereignisse einen signierten POST erhält, \`document.created\` und \`document.shared\`. Verwaltet wird das absichtlich nur aus einer Sitzung — es bleibt außerhalb der skriptbaren API, damit ein geleakter API-Schlüssel nicht zu einem dauerhaften Strom aller folgenden Dokumente werden kann.`,
        description:
          'Hinterlegen Sie eine URL, und TransformPipe schickt einen signierten POST, sobald ein Dokument erstellt oder geteilt wird: HMAC-SHA256 im Header.',
        keywords:
          'webhook für dokumente, hmac sha256 webhook signatur prüfen, webhook signatur verifizieren node, x-transformpipe-signature header, webhook bei neuem dokument',
        body: `Zwei Dinge geschehen in einem Konto, von denen ein anderes Programm sofort erfahren möchte: Ein Dokument wurde erstellt, und ein Dokument wurde geteilt. Im **Konto-Menü → Webhooks** hinterlegen Sie eine \`https://\`-URL, die davon hören soll, und lesen das Geheimnis, mit dem signiert wird.

### Was ankommt

Ein \`POST\`, dessen JSON-Rumpf drei Schlüssel hat — das Ereignis, den Zeitpunkt und die Daten:

\`\`\`json
{
  "event": "document.created",
  "created_at": "2026-09-11T09:12:44.000Z",
  "data": { "id": "…", "name": "release-notes.md", "kind": "markdown-to-html", "size": 4193 }
}
\`\`\`

\`document.shared\` trägt \`id\` und \`name\`, den \`mode\`, in dem das Dokument jetzt ist, die \`url\` zum Teilen und \`notified\` — die Adressen, an die wirklich eine Nachricht ging. Den Text des Dokuments trägt keines der Ereignisse: Ein Empfänger, der ihn braucht, hat die id und einen API-Schlüssel.

### Die Signatur prüfen

Jede Zustellung hat einen Header \`x-transformpipe-signature\` in der Form \`t=<Unix-Sekunden>,v1=<hex>\`. \`v1\` ist HMAC-SHA256 über die Zeichenkette \`<t>.<Rumpf>\`, mit dem Geheimnis dieses Webhooks als Schlüssel — dieselbe Form, die Stripe und GitHub verwenden, sodass vorhandener Prüfcode meist nur ein anderes Geheimnis braucht.

\`\`\`js
import { createHmac, timingSafeEqual } from 'node:crypto';

// \`raw\` ist der Rumpf, wie er ankam. Neu kodiert ergibt er einen anderen Hash.
export function verify(raw, header, secret) {
  const [t, v1] = header.split(',').map((part) => part.split('=')[1]);
  const want = createHmac('sha256', secret).update(\`\${t}.\${raw}\`).digest('hex');

  return (
    v1.length === want.length &&
    timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(want, 'hex'))
  );
}
\`\`\`

Weisen Sie ein \`t\` zurück, das älter als ein paar Minuten ist, und eine mitgeschnittene Zustellung lässt sich später nicht wiederholen. Das Geheimnis beginnt mit \`whsec_\` und lässt sich im Dialog wieder anzeigen: Anders als ein API-Schlüssel wird es von uns Ihnen gegenüber vorgezeigt, es beim Einrichten zweimal zu lesen ist also legitim.

### Ein Versuch, keine Warteschlange

Eine Zustellung ist eine Anfrage mit fünf Sekunden Zeitlimit. Es gibt keinen zweiten Versuch und keine Warteschlange: Ein Empfänger, der gerade nicht läuft, verpasst dieses Ereignis, das nächste versucht es von sich aus wieder. Der Dialog nennt pro URL den letzten Status oder den letzten Fehler. Weiterleitungen werden nicht verfolgt, und die Adresse wird beim Senden erneut geprüft, nicht nur beim Anlegen.

### Warum ein API-Schlüssel keinen anlegen kann

Webhooks werden ausschließlich aus einer angemeldeten Sitzung verwaltet. Ein Schlüssel, der einen Webhook anlegen könnte, würde aus einem punktuellen Leck einen dauerhaften Strom aller künftigen Dokumente machen — ein schlimmerer Verlust als der eines Schlüssels.

Weiter: [Dokumente über eine API konvertieren](/blog/converting-documents-with-an-api) und [aus GitHub Actions veröffentlichen](/blog/publish-markdown-from-github-actions).`,
      },
      fr: {
        title: 'Webhooks : un avis signé quand un document est créé ou partagé',
        summary: `Menu du compte → Webhooks enregistre une URL qui reçoit un POST signé pour deux événements, \`document.created\` et \`document.shared\`. La gestion se fait uniquement depuis une session, et c’est voulu : cela reste en dehors de l’API scriptable, pour qu’une clé d’API fuitée ne se transforme pas en flux permanent de tous les documents qui suivront.`,
        description:
          'Enregistrez une URL et TransformPipe y poste un avis signé dès qu’un document est créé ou partagé : HMAC-SHA256, dans la forme d’en-tête qu’utilise Stripe.',
        keywords:
          'webhook de documents, vérifier une signature hmac sha256, vérification de signature webhook en node, en-tête x-transformpipe-signature, webhook à la création d’un document',
        body: `Deux choses se produisent dans un compte dont un autre programme peut vouloir être averti sur-le-champ : un document a été créé, et un document a été partagé. Dans **Menu du compte → Webhooks**, vous indiquez une URL en \`https://\` qui doit en entendre parler et lisez le secret dont ses livraisons sont signées.

### Ce qui arrive

Un \`POST\` dont le corps JSON a trois clés — l’événement, l’heure et les données :

\`\`\`json
{
  "event": "document.created",
  "created_at": "2026-09-11T09:12:44.000Z",
  "data": { "id": "…", "name": "release-notes.md", "kind": "markdown-to-html", "size": 4193 }
}
\`\`\`

\`document.shared\` porte l’\`id\` et le \`name\`, le \`mode\` dans lequel le document se trouve désormais, l’\`url\` de partage, et \`notified\`, les adresses auxquelles un avis est réellement parti. Aucun des deux événements ne porte le texte du document : un destinataire qui en a besoin a l’identifiant et une clé d’API.

### Vérifier la signature

Chaque livraison porte un en-tête \`x-transformpipe-signature\` de la forme \`t=<secondes unix>,v1=<hex>\`, où \`v1\` est un HMAC-SHA256 sur la chaîne \`<t>.<corps>\`, avec le secret de ce webhook pour clé — la forme qu’utilisent Stripe et GitHub, si bien qu’un code de vérification existant ne demande en général qu’un secret différent.

\`\`\`js
import { createHmac, timingSafeEqual } from 'node:crypto';

// \`raw\` est le corps tel qu’il est arrivé. Analysé puis ré-encodé, il ne donne pas le même condensé.
export function verify(raw, header, secret) {
  const [t, v1] = header.split(',').map((part) => part.split('=')[1]);
  const want = createHmac('sha256', secret).update(\`\${t}.\${raw}\`).digest('hex');

  return (
    v1.length === want.length &&
    timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(want, 'hex'))
  );
}
\`\`\`

Refusez un \`t\` vieux de plus de quelques minutes et une livraison interceptée ne pourra pas être rejouée plus tard. Le secret commence par \`whsec_\` et se relit dans la boîte de dialogue à volonté : contrairement à une clé d’API, c’est nous qui vous le présentons, le revoir en installant un destinataire est donc légitime plutôt qu’une fuite.

### Une tentative, pas de file d’attente

Une livraison est une requête unique avec un délai de cinq secondes. Il n’y a ni nouvelle tentative ni file d’attente : un destinataire à l’arrêt manque cet événement, et le suivant réessaie de lui-même. La boîte de dialogue montre le dernier statut par URL. Les redirections ne sont pas suivies, et l’adresse est revérifiée comme publique au moment de l’envoi.

### Pourquoi une clé d’API ne peut pas en enregistrer un

Les webhooks se gèrent uniquement depuis une session connectée. Une clé capable d’en enregistrer un transformerait une fuite ponctuelle en flux permanent de tous les documents suivants, ce qui se perd bien plus mal qu’une clé.

Autres lectures : [convertir des documents avec une API](/blog/converting-documents-with-an-api) et [publier depuis GitHub Actions](/blog/publish-markdown-from-github-actions).`,
      },
      es: {
        title: 'Webhooks: un aviso firmado cuando se crea o se comparte un documento',
        summary: `Menú de la cuenta → Webhooks registra una URL que recibe un POST firmado para dos eventos, \`document.created\` y \`document.shared\`. Se gestiona solo desde una sesión iniciada, y es a propósito: queda fuera de la API programable, de modo que una clave filtrada no puede convertirse en un flujo permanente de todos los documentos que vengan después.`,
        description:
          'Registra una URL y TransformPipe envía un aviso firmado en cuanto se crea o se comparte un documento: HMAC-SHA256, con la cabecera que usa Stripe.',
        keywords:
          'webhook de documentos, verificar firma hmac sha256 de un webhook, verificación de firma de webhook en node, cabecera x-transformpipe-signature, webhook al crear un documento',
        body: `En una cuenta ocurren dos cosas de las que otro programa puede querer enterarse en el momento mismo en que pasan: se ha creado un documento y se ha compartido un documento. En **Menú de la cuenta → Webhooks** es donde indicas una URL \`https://\` que debe oírlas, y donde lees el secreto con el que se firman sus entregas.

### Qué llega

Un \`POST\` cuyo cuerpo JSON tiene tres claves — el evento, la hora y los datos:

\`\`\`json
{
  "event": "document.created",
  "created_at": "2026-09-11T09:12:44.000Z",
  "data": { "id": "…", "name": "release-notes.md", "kind": "markdown-to-html", "size": 4193 }
}
\`\`\`

\`document.shared\` lleva el \`id\` y el \`name\`, el \`mode\` en el que queda el documento, la \`url\` para compartir y \`notified\`, las direcciones a las que realmente salió un aviso. Ninguno de los dos eventos lleva el texto del documento: un receptor que lo necesite tiene el identificador y una clave de API.

### Comprobar la firma

Cada entrega trae una cabecera \`x-transformpipe-signature\` con la forma \`t=<segundos unix>,v1=<hex>\`, donde \`v1\` es un HMAC-SHA256 sobre la cadena \`<t>.<cuerpo>\`, con el secreto de este webhook como clave — la misma forma que usan Stripe y GitHub, así que el código de verificación que ya tengas suele necesitar solo un secreto distinto.

\`\`\`js
import { createHmac, timingSafeEqual } from 'node:crypto';

// \`raw\` es el cuerpo tal como llegó. Una copia analizada y vuelta a codificar no da el mismo hash.
export function verify(raw, header, secret) {
  const [t, v1] = header.split(',').map((part) => part.split('=')[1]);
  const want = createHmac('sha256', secret).update(\`\${t}.\${raw}\`).digest('hex');

  return (
    v1.length === want.length &&
    timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(want, 'hex'))
  );
}
\`\`\`

Rechaza una \`t\` de hace más de unos minutos y una entrega capturada no podrá reproducírsete más tarde. El secreto empieza por \`whsec_\` y puede volver a leerse en el diálogo cuando lo necesites: a diferencia de una clave de API, te lo mostramos nosotros, así que verlo dos veces mientras configuras un receptor es legítimo y no una filtración.

### Un intento, sin cola

Una entrega es una única petición con cinco segundos de espera. No hay reintento ni cola: un receptor que esté caído se pierde ese evento, y el siguiente lo intenta de nuevo por su cuenta. El diálogo muestra el último estado, o el último error, de cada URL. No se siguen redirecciones, y la dirección se vuelve a comprobar como dirección pública en el momento del envío, no solo cuando se registró.

### Por qué una clave de API no puede registrar uno

Los webhooks se gestionan únicamente desde una sesión iniciada. Una clave capaz de registrar uno convertiría una filtración puntual en un flujo permanente de todos los documentos posteriores, que es algo mucho peor de perder que una clave.

Relacionado: [convertir documentos con una API](/blog/converting-documents-with-an-api) y [publicar desde GitHub Actions](/blog/publish-markdown-from-github-actions).`,
      },
      it: {
        title: 'Webhook: un avviso firmato quando un documento viene creato o condiviso',
        summary: `Menu dell’account → Webhooks registra una URL che riceve un POST firmato per due eventi, \`document.created\` e \`document.shared\`. Si gestisce solo da una sessione autenticata, di proposito: resta fuori dall’API scriptabile, così una chiave API trapelata non può diventare un flusso permanente di tutti i documenti successivi.`,
        description:
          'Registra una URL e TransformPipe invia un avviso firmato appena un documento viene creato o condiviso: HMAC-SHA256, nella forma di header usata da Stripe.',
        keywords:
          'webhook per documenti, verificare la firma hmac sha256 di un webhook, verifica firma webhook in node, header x-transformpipe-signature, webhook alla creazione di un documento',
        body: `In un account succedono due cose di cui un altro programma potrebbe voler sapere nell’istante in cui accadono: un documento è stato creato e un documento è stato condiviso. In **Menu dell’account → Webhooks** indichi una URL \`https://\` che deve venirne a conoscenza e leggi il segreto con cui le consegne vengono firmate.

### Che cosa arriva

Un \`POST\` il cui corpo JSON ha tre chiavi — l’evento, l’ora e i dati:

\`\`\`json
{
  "event": "document.created",
  "created_at": "2026-09-11T09:12:44.000Z",
  "data": { "id": "…", "name": "release-notes.md", "kind": "markdown-to-html", "size": 4193 }
}
\`\`\`

\`document.shared\` porta \`id\` e \`name\`, il \`mode\` in cui il documento si trova ora, la \`url\` di condivisione e \`notified\`, gli indirizzi a cui un avviso è davvero partito. Nessuno dei due eventi porta il testo del documento: un destinatario che ne ha bisogno ha l’id e una chiave API.

### Verificare la firma

Ogni consegna ha un header \`x-transformpipe-signature\` nella forma \`t=<secondi unix>,v1=<hex>\`, dove \`v1\` è un HMAC-SHA256 sulla stringa \`<t>.<corpo>\`, con il segreto di questo webhook come chiave — la stessa forma usata da Stripe e GitHub, quindi al codice di verifica che hai già di solito basta un segreto diverso.

\`\`\`js
import { createHmac, timingSafeEqual } from 'node:crypto';

// \`raw\` è il corpo così come è arrivato. Una copia analizzata e ricodificata non dà lo stesso hash.
export function verify(raw, header, secret) {
  const [t, v1] = header.split(',').map((part) => part.split('=')[1]);
  const want = createHmac('sha256', secret).update(\`\${t}.\${raw}\`).digest('hex');

  return (
    v1.length === want.length &&
    timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(want, 'hex'))
  );
}
\`\`\`

Rifiuta una \`t\` più vecchia di qualche minuto e una consegna intercettata non potrà esserti riproposta in seguito. Il segreto inizia con \`whsec_\` e si può rileggere dalla finestra ogni volta che serve: a differenza di una chiave API, è mostrato da noi a te, quindi vederlo due volte mentre configuri un destinatario è legittimo e non una fuga.

### Un tentativo, nessuna coda

Una consegna è una sola richiesta con cinque secondi di timeout. Non c’è un secondo tentativo né una coda: un destinatario fermo perde quell’evento, e l’evento successivo riprova da sé. La finestra mostra l’ultimo stato, o l’ultimo errore, per ogni URL. I reindirizzamenti non vengono seguiti, e l’indirizzo viene ricontrollato come indirizzo pubblico al momento dell’invio, non solo alla registrazione.

### Perché una chiave API non può registrarne uno

I webhook si gestiscono solo da una sessione autenticata. Una chiave in grado di registrarne uno trasformerebbe una fuga puntuale in un flusso permanente di tutti i documenti successivi, cosa ben peggiore da perdere di una chiave.

Da leggere: [convertire documenti con un’API](/blog/converting-documents-with-an-api) e [pubblicare da GitHub Actions](/blog/publish-markdown-from-github-actions).`,
      },
    },
    body:
      'Account menu → Webhooks registers a URL that gets a signed POST for two events, '
      + '`document.created` and `document.shared`. Session-only to manage, on purpose — it stays '
      + 'off the scriptable API, so a leaked API key cannot turn into a standing feed of every '
      + 'document that comes after it.',
  },
  {
    date: '2026-09-11',
    title: 'Link a document to an earlier one, and see what changed',
    slug: 'document-versions',
    detail: {
      en: {
        description:
          'Push with ?replaces= and two documents become versions of one thing: a chain in the history, a line-level diff, and one endpoint that reads it.',
        keywords:
          'markdown document versions, diff two markdown documents, version history for converted documents, replaces parameter api, compare two versions of a document',
        body: `Every push here makes a brand-new document, and that is not an accident to be fixed: a link somebody pasted into a comment three weeks ago has to keep showing what that commit said. But a release note pushed every Friday really is the same document seven times, and nothing could say so. Now something can.

### Saying it

One parameter, on the push that creates the newer document:

    curl -H "Authorization: Bearer tp_live_…" --data-binary @v2.md \\
      "https://transformpipe.com/api/v1/documents?name=notes.md&replaces=<id>"

The CLI spells it \`--replaces <id>\`, and the GitHub Action takes a \`replaces\` input. The id of the earlier document is what \`tp list\` prints, and what the Action's \`documents\` output carries. It has to be a document on the same account, or the request comes back 404 rather than linking to something you cannot see.

### What you get

In the history, a linked document carries a chain icon. Opening it lists the whole chain oldest first, and any entry with something before it can be compared against it: a line-level diff, computed in your browser from the two sources it already fetched, so nothing on the server is doing the comparing.

From a program, \`GET /api/v1/documents/:id/versions\` — or \`tp versions <id>\` — answers with the chain from any member of it — the ancestors it replaces, and everything that went on to replace those — each with its \`id\`, \`name\`, \`created_at\` and its own \`replaces\`. The assistant connector exposes the same thing as \`tp_document_versions\`. Every document in a list also carries \`replaces\`, so a client with the list in hand can work out the chains without a request per row.

### Why nothing is inferred

A converter that guessed would be wrong in the way that costs you something. Two files with the same name are often not versions of each other — a \`README.md\` from two different repositories, the same report for two different months — and a tool that chained them would quietly present one as the successor of the other. So the name means nothing here, the conversion means nothing, and the time means nothing: a document is a version of another one because somebody said so, one document at a time.

### What it is not

It is not automatic history. Nothing in this app edits a document in place, so no version appears without a push, and there is no revert: an older version is still its own document, at its own address, with its own share link. Deleting an older one does not delete the newer — the link simply goes away, and what is left is the unrelated document it would have been anyway.

Related: [release notes out of Markdown](/blog/release-notes-from-markdown), and [publishing from GitHub Actions](/blog/publish-markdown-from-github-actions).`,
      },
      de: {
        title: 'Ein Dokument mit einem früheren verknüpfen und sehen, was sich geändert hat',
        summary: `Ein Push kann jetzt sagen, dass er eine neue Version eines früheren Dokuments ist — \`?replaces=\` in der API, \`--replaces\` im CLI, eine Eingabe \`replaces\` in der Action. Das ist freiwillig: Nichts verknüpft Dokumente von selbst, und ein gewöhnlicher Push bleibt das unverbundene Dokument, das er immer war. Verknüpfte Dokumente bekommen ein Kettensymbol im Verlauf und einen zeilenweisen Vergleich mit der Version davor.`,
        description:
          'Mit ?replaces= werden zwei Dokumente zu Versionen derselben Sache: eine Kette im Verlauf, ein zeilenweiser Vergleich, ein Endpunkt dafür.',
        keywords:
          'markdown dokument versionen, zwei markdown dokumente vergleichen, versionsverlauf für konvertierte dokumente, replaces parameter api, zwei versionen eines dokuments vergleichen',
        body: `Jeder Push erzeugt hier ein ganz neues Dokument, und das ist kein Versehen, das behoben werden müsste: Ein Link, den jemand vor drei Wochen in einen Kommentar geschrieben hat, muss weiter zeigen, was dieser Commit sagte. Eine Release-Notiz, die jeden Freitag gepusht wird, ist aber wirklich siebenmal dasselbe Dokument — und nichts konnte das sagen. Jetzt kann es etwas.

### Wie man es sagt

Ein Parameter, am Push, der das neuere Dokument anlegt:

    curl -H "Authorization: Bearer tp_live_…" --data-binary @v2.md \\
      "https://transformpipe.com/api/v1/documents?name=notes.md&replaces=<id>"

Das CLI schreibt es \`--replaces <id>\`, und die GitHub Action nimmt eine Eingabe \`replaces\`. Die id des früheren Dokuments gibt \`tp list\` aus, und die Ausgabe \`documents\` der Action trägt sie ebenfalls. Sie muss zu einem Dokument desselben Kontos gehören, sonst antwortet die Anfrage mit 404, statt auf etwas zu verweisen, das Sie nicht sehen können.

### Was dabei herauskommt

Im Verlauf trägt ein verknüpftes Dokument ein Kettensymbol. Wer es öffnet, sieht die ganze Kette, das Älteste zuerst, und jeder Eintrag mit einem Vorgänger lässt sich mit ihm vergleichen: ein zeilenweiser Vergleich, in Ihrem Browser aus den beiden Quellen berechnet, die er ohnehin geholt hat — auf dem Server vergleicht also nichts.

Aus einem Programm antwortet \`GET /api/v1/documents/:id/versions\` — oder \`tp versions <id>\` — mit der Kette, ausgehend von jedem ihrer Mitglieder: den Vorgängern, die es ersetzt, und allem, was diese wiederum ersetzt hat, jeweils mit \`id\`, \`name\`, \`created_at\` und eigenem \`replaces\`. Der Connector für Assistenten bietet dasselbe als \`tp_document_versions\`. Auch in einer Liste trägt jedes Dokument sein \`replaces\`, sodass ein Client mit der Liste in der Hand die Ketten ohne eine Anfrage pro Zeile bilden kann.

### Warum nichts erraten wird

Ein Konverter, der riete, läge auf die Weise falsch, die Sie etwas kostet. Zwei Dateien mit demselben Namen sind oft keine Versionen voneinander — eine \`README.md\` aus zwei Repositories, derselbe Bericht für zwei Monate —, und ein Werkzeug, das sie verkettet, würde still das eine als Nachfolger des anderen ausgeben. Also bedeutet der Name hier nichts, die Konvertierung nichts und der Zeitpunkt nichts: Ein Dokument ist die Version eines anderen, weil jemand es gesagt hat, ein Dokument auf einmal.

### Was es nicht ist

Es ist kein automatischer Verlauf. Nichts in dieser App ändert ein Dokument an Ort und Stelle, also entsteht ohne Push keine Version, und es gibt kein Zurücksetzen: Eine ältere Version bleibt ihr eigenes Dokument, an ihrer eigenen Adresse, mit ihrem eigenen Link. Ein älteres zu löschen löscht das neuere nicht — die Verknüpfung fällt einfach weg, und übrig bleibt das unverbundene Dokument, das es sonst gewesen wäre.

Weiter: [Release Notes aus Markdown](/blog/release-notes-from-markdown) und [aus GitHub Actions veröffentlichen](/blog/publish-markdown-from-github-actions).`,
      },
      fr: {
        title: 'Lier un document à un précédent, et voir ce qui a changé',
        summary: `Un push peut désormais indiquer qu’il s’agit d’une nouvelle version d’un document antérieur — \`?replaces=\` dans l’API, \`--replaces\` depuis le CLI, une entrée \`replaces\` dans l’Action. C’est facultatif : rien ne lie les documents de son propre chef, et un push ordinaire reste le document sans rapport qu’il a toujours été. Les documents liés reçoivent une icône de chaîne dans l’historique et une comparaison ligne par ligne avec la version précédente.`,
        description:
          'Avec ?replaces=, deux documents deviennent les versions d’une même chose : une chaîne dans l’historique, un diff ligne par ligne, un point d’accès qui la lit.',
        keywords:
          'versions d’un document markdown, comparer deux versions d’un document, historique des versions de documents convertis, paramètre replaces api, comparer deux versions d’un même document',
        body: `Chaque push ici crée un document entièrement nouveau, et ce n’est pas un défaut à corriger : un lien collé dans un commentaire il y a trois semaines doit continuer à montrer ce que disait ce commit. Mais une note de version poussée chaque vendredi est vraiment le même document sept fois, et rien ne pouvait le dire. Désormais, quelque chose le peut.

### Comment le dire

Un seul paramètre, sur le push qui crée le document le plus récent :

    curl -H "Authorization: Bearer tp_live_…" --data-binary @v2.md \\\\
      "https://transformpipe.com/api/v1/documents?name=notes.md&replaces=<id>"

Le CLI l’écrit \`--replaces <id>\`, et la GitHub Action prend une entrée \`replaces\`. L’id du document précédent est ce qu’affiche \`tp list\`, et ce que porte la sortie \`documents\` de l’Action. Il doit s’agir d’un document du même compte, sinon la requête renvoie 404 plutôt que de créer un lien vers quelque chose que vous ne pouvez pas voir.

### Ce que vous obtenez

Dans l’historique, un document lié porte une icône de chaîne. L’ouvrir affiche toute la chaîne, du plus ancien au plus récent, et toute entrée qui a quelque chose avant elle peut lui être comparée : une comparaison ligne par ligne, calculée dans votre navigateur à partir des deux sources déjà récupérées, si bien que rien sur le serveur ne fait la comparaison.

Depuis un programme, \`GET /api/v1/documents/:id/versions\` — ou \`tp versions <id>\` — répond avec la chaîne à partir de n’importe lequel de ses membres — les ancêtres qu’il remplace, et tout ce qui a ensuite remplacé ceux-là — chacun avec son \`id\`, son \`name\`, son \`created_at\` et son propre \`replaces\`. Le connecteur pour assistants expose la même chose sous le nom \`tp_document_versions\`. Chaque document d’une liste porte aussi son \`replaces\`, si bien qu’un client qui a la liste en main peut reconstituer les chaînes sans une requête par ligne.

### Pourquoi rien n’est déduit

Un convertisseur qui devinerait se tromperait d’une façon qui coûte. Deux fichiers au même nom ne sont souvent pas des versions l’un de l’autre — un \`README.md\` de deux dépôts différents, le même rapport pour deux mois différents — et un outil qui les enchaînerait présenterait silencieusement l’un comme le successeur de l’autre. Ici, ni le nom, la conversion ou le moment ne comptent : un document est la version d’un autre parce que quelqu’un l’a dit, un à la fois.

### Ce que ce n’est pas

Ce n’est pas un historique automatique. Rien ici ne modifie un document sur place, aucune version n’apparaît donc sans un push, et il n’y a pas de retour en arrière : une version antérieure reste son propre document, à sa propre adresse, avec son propre lien de partage. Supprimer une version antérieure ne supprime pas la plus récente — le lien disparaît, et il reste le document sans rapport qu’il aurait été de toute façon.

Autres lectures : [notes de version à partir de Markdown](/blog/release-notes-from-markdown), et [publier depuis GitHub Actions](/blog/publish-markdown-from-github-actions).`,
      },
      es: {
        title: 'Enlazar un documento con uno anterior y ver qué cambió',
        summary: `Un push ya puede decir que es una nueva versión de un documento anterior — \`?replaces=\` en la API, \`--replaces\` desde la CLI, una entrada \`replaces\` en la Action. Es voluntario: nada enlaza documentos por sí solo, y un push corriente sigue siendo el documento sin relación que siempre fue. Los documentos enlazados llevan un icono de cadena en el historial y una comparación línea a línea con la versión anterior.`,
        description:
          'Con ?replaces= al hacer push, dos documentos pasan a ser versiones de lo mismo: una cadena en el historial, una comparación línea a línea y un endpoint que la lee.',
        keywords:
          'versiones de un documento markdown, comparar dos documentos markdown, historial de versiones de documentos convertidos, parámetro replaces api, comparar dos versiones de un documento',
        body: `Aquí, cada push crea un documento completamente nuevo, y eso no es un descuido por corregir: un enlace que alguien pegó en un comentario hace tres semanas tiene que seguir mostrando lo que decía aquel commit. Pero una nota de versión que se envía cada viernes es de verdad el mismo documento siete veces, y nada podía decirlo. Ahora algo puede.

### Cómo decirlo

Un parámetro, en el push que crea el documento más reciente:

    curl -H "Authorization: Bearer tp_live_…" --data-binary @v2.md \\
      "https://transformpipe.com/api/v1/documents?name=notes.md&replaces=<id>"

La CLI lo escribe como \`--replaces <id>\`, y la GitHub Action recibe una entrada \`replaces\`. El id del documento anterior es el que imprime \`tp list\`, y el que lleva la salida \`documents\` de la Action. Tiene que ser un documento de la misma cuenta, o la petición responde 404 en lugar de enlazar con algo que no puedes ver.

### Qué se obtiene

En el historial, un documento enlazado lleva un icono de cadena. Al abrirlo se lista toda la cadena, del más antiguo al más reciente, y cualquier entrada que tenga algo antes se puede comparar con ello: una comparación línea a línea, calculada en tu navegador a partir de las dos fuentes que ya había obtenido, de modo que nada en el servidor hace la comparación.

Desde un programa, \`GET /api/v1/documents/:id/versions\` — o \`tp versions <id>\` — responde con la cadena a partir de cualquiera de sus miembros — los antecesores que reemplaza, y todo lo que a su vez reemplazó a esos —, cada uno con su \`id\`, \`name\`, \`created_at\` y su propio \`replaces\`. El conector para asistentes expone lo mismo como \`tp_document_versions\`. Cada documento de una lista también lleva su \`replaces\`, de modo que un cliente con la lista en la mano puede reconstruir las cadenas sin una petición por fila.

### Por qué nada se infiere

Un conversor que adivinara se equivocaría de una manera que cuesta algo. Dos archivos con el mismo nombre a menudo no son versiones el uno del otro — un \`README.md\` de dos repositorios distintos, el mismo informe de dos meses distintos —, y una herramienta que los encadenara presentaría en silencio uno como sucesor del otro. Así que aquí el nombre no significa nada, la conversión no significa nada y el momento no significa nada: un documento es versión de otro porque alguien lo dijo, un documento a la vez.

### Qué no es

No es un historial automático. Nada en esta aplicación edita un documento en su sitio, así que no aparece ninguna versión sin un push, y no hay manera de revertir: una versión anterior sigue siendo su propio documento, en su propia dirección, con su propio enlace para compartir. Eliminar una versión anterior no elimina la más reciente — el enlace simplemente desaparece, y lo que queda es el documento sin relación que habría sido de todos modos.

Relacionado: [notas de versión a partir de Markdown](/blog/release-notes-from-markdown) y [publicar desde GitHub Actions](/blog/publish-markdown-from-github-actions).`,
      },
      it: {
        title: 'Collega un documento a uno precedente e guarda cosa è cambiato',
        summary: `Un push può ora dichiarare di essere una nuova versione di un documento precedente — \`?replaces=\` nell'API, \`--replaces\` dalla CLI, un input \`replaces\` nell'Action. È opzionale: nulla collega i documenti da solo, e un push semplice resta il documento indipendente che è sempre stato. I documenti collegati ottengono un'icona a catena nella cronologia e un confronto riga per riga con la versione precedente.`,
        description:
          'Con ?replaces= due documenti diventano versioni della stessa cosa: una catena nella cronologia, un confronto riga per riga, un endpoint che la legge.',
        keywords:
          'versioni di un documento markdown, confrontare due versioni di un documento, cronologia delle modifiche di un documento convertito, parametro replaces api, confronto tra due versioni di un file',
        body: `Ogni push qui crea un documento completamente nuovo, e non è un difetto da correggere: un link che qualcuno ha incollato in un commento tre settimane fa deve continuare a mostrare ciò che quel commit diceva. Ma una nota di rilascio pubblicata ogni venerdì è davvero lo stesso documento sette volte, e ora può dirlo.

### Come dirlo

Un solo parametro, sul push che crea il documento più recente:

    curl -H "Authorization: Bearer tp_live_…" --data-binary @v2.md \\
      "https://transformpipe.com/api/v1/documents?name=notes.md&replaces=<id>"

La CLI lo scrive \`--replaces <id>\`, e la GitHub Action accetta un input \`replaces\`. L'id del documento precedente è quello che \`tp list\` stampa, e quello che l'output \`documents\` dell'Action porta con sé. Deve appartenere a un documento dello stesso account, altrimenti la richiesta torna con un 404 invece di collegarsi a qualcosa che tu non puoi vedere.

### Che cosa ottiene

Nella cronologia, un documento collegato porta un'icona a catena. Aprendola si vede l'intera catena dal più vecchio al più recente, e ogni voce che ha qualcosa prima di sé può essere confrontata con esso: un confronto riga per riga, calcolato nel tuo browser a partire dalle due fonti già scaricate, così sul server non c'è nulla che confronti.

Da un programma, \`GET /api/v1/documents/:id/versions\` — oppure \`tp versions <id>\` — risponde con la catena a partire da qualunque suo membro — gli antenati che sostituisce, e tutto ciò che in seguito ha sostituito quelli — ciascuno con il proprio \`id\`, \`name\`, \`created_at\` e il proprio \`replaces\`. Il connettore per assistenti espone la stessa cosa come \`tp_document_versions\`. Anche in un elenco ogni documento porta il proprio \`replaces\`, così un client che ha già la lista in mano può ricostruire le catene senza una richiesta per ogni riga.

### Perché nulla viene dedotto

Un convertitore che indovinasse sbaglierebbe nel modo che costa qualcosa. Due file con lo stesso nome spesso non sono versioni l'uno dell'altro — un \`README.md\` di due repository diversi, lo stesso rapporto per due mesi diversi — e uno strumento che li concatenasse presenterebbe silenziosamente l'uno come successore dell'altro. Quindi qui il nome non conta nulla, la conversione non conta nulla, e il momento non conta nulla: un documento è la versione di un altro perché qualcuno l'ha detto, un documento alla volta.

### Che cosa non è

Non è una cronologia automatica. Nulla in questa app modifica un documento sul posto, quindi nessuna versione appare senza un push, e non esiste un ripristino: una versione più vecchia resta un documento a sé, al proprio indirizzo, con il proprio link di condivisione. Eliminare una versione più vecchia non elimina quella più recente — il collegamento semplicemente scompare, e resta il documento indipendente che sarebbe stato comunque.

Da leggere: [note di rilascio a partire da Markdown](/blog/release-notes-from-markdown), e [pubblicare da GitHub Actions](/blog/publish-markdown-from-github-actions).`,
      },
    },
    body:
      'A push can now say it is a new version of an earlier document — `?replaces=` in the API, '
      + '`--replaces` from the CLI, a `replaces` input in the Action. It is opt-in: nothing links '
      + 'documents on its own, and a plain push stays the unrelated document it has always been. '
      + 'Linked documents get a chain icon in the history and a line-by-line diff against the '
      + 'version before them.',
  },
  {
    date: '2026-09-11',
    title: 'History search now looks inside your documents',
    slug: 'full-text-search',
    detail: {
      en: {
        description:
          'The search box over your history now matches what is written inside a saved document, not only its file name, and ranks the matches by relevance.',
        keywords:
          'search inside documents, full text search markdown documents, find a document by its content, search converted files, postgres full text search documents',
        body: `Nobody remembers what they called a file. They remember a sentence that was in it, the name of the customer it was about, or the one command the runbook contained. The box at the top of your history used to be unable to help with any of that, because it only ever compared what you typed against file names.

### Two searches, one box

Type into it and two things now happen at once. The name filter runs where it always did — in the browser, over every row on the page, instantly, on saved and unsaved conversions alike. And a moment later, if you are signed in, the server answers with the saved documents whose text matches, ranked by how well it matches, and those rows join the ones the name already found.

You do not choose between them. A query that is half a file name and half a remembered phrase finds both kinds of row, and a query that matches nothing by content simply leaves the name filter as it was. The request is debounced, so typing is not a request per keystroke, and a search that fails leaves the list working rather than replacing it with an error.

### Where the index comes from

Each saved document carries a \`tsvector\` of its Markdown, written at the moment the document is saved and indexed in Postgres. Matching is \`websearch_to_tsquery\`, so the syntax is the one every search box has taught people: \`"a quoted phrase"\` for words in order, \`or\` between alternatives, a leading \`-\` to exclude.

It is a deliberately plain configuration — no stemming and no stop-word list. Words match as they were typed, which means \`convert\` does not find \`converting\`, and also means nothing you search for is silently reinterpreted. Searching the Markdown source rather than the rendered page has a side effect worth knowing: a link's address, a fenced code block and a heading are all searchable text.

### What it does not reach

A conversion that is only in this browser has no row in the database, so nothing is indexed for it and it still matches by name alone — which is the honest consequence of conversions staying local until you save them. Documents somebody shared with you are not covered either; the chip that lists them filters by name.

From a script the same thing is one parameter: \`GET /api/v1/documents?q=…\`, or \`tp list --q "…"\`, returning the matches best first, the newer of two equal ones ahead of the older.

Related: [batch-converting Markdown files](/blog/batch-convert-markdown-files), and [documentation that lives in the repository](/blog/documentation-that-lives-in-the-repo).`,
      },
      de: {
        title: 'Die Suche im Verlauf schaut jetzt in Ihre Dokumente',
        summary: `Die Suche im Verlauf traf früher nur Dateinamen. Angemeldet findet sie ein Dokument jetzt auch an dem, was darin geschrieben steht — das Namensfeld arbeitet genau wie vorher, es ist nur nicht mehr der einzige Weg hinein.`,
        description:
          'Das Suchfeld über Ihrem Verlauf findet gespeicherte Dokumente jetzt auch an ihrem Inhalt, nicht nur am Dateinamen, und sortiert nach Relevanz.',
        keywords:
          'in dokumenten suchen, volltextsuche markdown dokumente, dokument am inhalt finden, konvertierte dateien durchsuchen, volltextsuche postgres dokumente',
        body: `Niemand erinnert sich daran, wie er eine Datei genannt hat. Man erinnert sich an einen Satz, der darin stand, an den Namen der Kundin, um die es ging, oder an den einen Befehl, den das Runbook enthielt. Das Feld über Ihrem Verlauf konnte dabei bisher nicht helfen, denn es verglich das Getippte immer nur mit Dateinamen.

### Zwei Suchen, ein Feld

Wer hineintippt, löst jetzt beides gleichzeitig aus. Der Namensfilter läuft dort, wo er immer lief — im Browser, über jede Zeile der Seite, sofort, für gespeicherte und ungespeicherte Konvertierungen gleichermaßen. Und einen Augenblick später antwortet der Server, sofern Sie angemeldet sind, mit den gespeicherten Dokumenten, deren Text passt, nach Güte des Treffers sortiert; diese Zeilen kommen zu denen hinzu, die der Name schon gefunden hat.

Sie müssen sich nicht entscheiden. Eine Anfrage, die halb Dateiname und halb erinnerte Wortfolge ist, findet beides, und eine, die inhaltlich nichts trifft, lässt den Namensfilter, wie er war. Die Anfrage ist entprellt, ein Tastendruck ist also keine Anfrage, und eine fehlgeschlagene Suche lässt die Liste arbeiten, statt sie durch einen Fehler zu ersetzen.

### Woher der Index kommt

Jedes gespeicherte Dokument trägt einen \`tsvector\` seines Markdown, geschrieben im Moment des Speicherns und in Postgres indexiert. Verglichen wird mit \`websearch_to_tsquery\`, die Syntax ist also die, die jedes Suchfeld den Leuten beigebracht hat: \`"eine Wortfolge in Anführungszeichen"\` für Wörter in dieser Reihenfolge, \`or\` zwischen Alternativen, ein vorangestelltes \`-\` zum Ausschließen.

Die Konfiguration ist absichtlich schlicht — keine Wortstammbildung, keine Liste von Füllwörtern. Wörter treffen so, wie sie getippt wurden: \`konvert\` findet also kein \`konvertieren\`, und umgekehrt wird nichts, was Sie suchen, still umgedeutet. Dass die Markdown-Quelle durchsucht wird und nicht die gesetzte Seite, hat eine Nebenwirkung, die man kennen sollte: Die Adresse eines Links, ein Codeblock und eine Überschrift sind ebenfalls durchsuchbarer Text.

### Was sie nicht erreicht

Eine Konvertierung, die nur in diesem Browser liegt, hat keine Zeile in der Datenbank, also ist für sie nichts indexiert, und sie trifft weiter allein über den Namen — die ehrliche Folge davon, dass Konvertierungen lokal bleiben, bis Sie speichern. Dokumente, die jemand mit Ihnen geteilt hat, sind ebenfalls nicht erfasst; der Chip, der sie auflistet, filtert nach Namen.

Aus einem Skript ist dasselbe ein Parameter: \`GET /api/v1/documents?q=…\` oder \`tp list --q "…"\`, und zurück kommen die Treffer, die besten zuerst, bei gleicher Güte der neuere vor dem älteren.

Weiter: [viele Markdown-Dateien auf einmal konvertieren](/blog/batch-convert-markdown-files) und [Dokumentation, die im Repository lebt](/blog/documentation-that-lives-in-the-repo).`,
      },
      fr: {
        title: 'La recherche dans l’historique regarde désormais dans vos documents',
        summary: `Rechercher dans votre historique ne comparait auparavant que les noms de fichiers. Une fois connecté, la recherche trouve désormais aussi un document d’après ce qui est écrit à l’intérieur — le champ du nom fonctionne exactement comme avant, il cesse simplement d’être la seule porte d’entrée.`,
        description:
          'Le champ de recherche au-dessus de votre historique trouve un document par son contenu, pas seulement son nom de fichier, et classe les résultats par pertinence.',
        keywords:
          'rechercher dans le contenu d’un document, recherche plein texte markdown, retrouver un document par son contenu, recherche dans les fichiers convertis, recherche plein texte postgres',
        body: `Personne ne se souvient de la façon dont il a nommé un fichier. On se souvient d’une phrase qu’il contenait, du nom du client dont il était question, ou de la seule commande que contenait le runbook. Le champ en haut de votre historique ne pouvait auparavant rien faire de tout cela, car il ne comparait jamais que ce que vous tapiez aux noms de fichiers.

### Deux recherches, un seul champ

Tapez dedans, et deux choses se produisent désormais à la fois. Le filtre par nom fonctionne là où il a toujours fonctionné — dans le navigateur, sur chaque ligne de la page, instantanément, pour les conversions enregistrées comme pour les autres. Et un instant plus tard, si vous êtes connecté, le serveur répond avec les documents enregistrés dont le texte correspond, classés selon la qualité de la correspondance, et ces lignes rejoignent celles que le nom avait déjà trouvées.

Vous n’avez pas à choisir entre les deux. Une requête moitié nom de fichier, moitié phrase dont vous vous souvenez trouve les deux types de lignes, et une requête qui ne correspond à rien par le contenu laisse simplement le filtre par nom tel qu’il était. La requête est différée pour éviter les envois à chaque frappe, et une recherche qui échoue laisse la liste fonctionner plutôt que de la remplacer par une erreur.

### D’où vient l’index

Chaque document enregistré porte un \`tsvector\` de son Markdown, écrit au moment où le document est enregistré et indexé dans Postgres. La correspondance utilise \`websearch_to_tsquery\`, la syntaxe est donc celle que tout champ de recherche a appris aux gens : \`"une phrase entre guillemets"\` pour des mots dans cet ordre, \`or\` entre des alternatives, un \`-\` en tête pour exclure.

C’est une configuration délibérément simple — pas de racinisation, pas de liste de mots vides. Les mots correspondent tels qu’ils ont été tapés, ce qui veut dire que \`convert\` ne trouve pas \`converting\`, et qu’aucune de vos recherches n’est réinterprétée en silence. Chercher dans la source Markdown plutôt que dans la page rendue a un effet secondaire à connaître : l’adresse d’un lien, un bloc de code et un titre sont tous du texte que l’on peut retrouver.

### Ce qu’elle n’atteint pas

Une conversion qui n’existe que dans ce navigateur n’a aucune ligne dans la base de données, rien n’est donc indexé pour elle, et elle continue à correspondre par le nom seul — la conséquence honnête du fait que les conversions restent locales jusqu’à ce que vous les enregistriez. Les documents que quelqu’un a partagés avec vous ne sont pas couverts non plus ; le filtre qui les liste se base sur le nom.

Depuis un script, c’est un seul paramètre : \`GET /api/v1/documents?q=…\`, ou \`tp list --q "…"\`, qui renvoie les correspondances, les meilleures d’abord, la plus récente de deux égales avant la plus ancienne.

Autres lectures : [convertir des fichiers Markdown par lots](/blog/batch-convert-markdown-files), et [la documentation qui vit dans le dépôt](/blog/documentation-that-lives-in-the-repo).`,
      },
      es: {
        title: 'La búsqueda del historial ya mira dentro de sus documentos',
        summary: `Buscar en el historial antes solo comparaba con el nombre del archivo. Con la sesión iniciada, ahora también encuentra un documento por lo que está escrito dentro — el campo de nombre sigue funcionando exactamente igual que antes, solo deja de ser la única entrada.`,
        description:
          'El cuadro de búsqueda de tu historial ya compara con el contenido de un documento guardado, no solo con su nombre, y ordena los resultados por relevancia.',
        keywords:
          'buscar dentro de documentos, búsqueda de texto completo en markdown, encontrar un documento por su contenido, buscar en archivos convertidos, búsqueda de texto completo en postgres',
        body: `Nadie recuerda cómo llamó a un archivo. Recuerda una frase que había en él, el nombre del cliente sobre el que trataba, o el único comando que contenía el runbook. El campo en la parte superior de tu historial antes no podía ayudar con nada de eso, porque solo comparaba lo que escribías con los nombres de archivo.

### Dos búsquedas, un solo campo

Al escribir en él, ahora ocurren dos cosas a la vez. El filtro por nombre funciona donde siempre funcionó — en el navegador, sobre cada fila de la página, al instante, tanto en conversiones guardadas como sin guardar. Y un instante después, si tu sesión está iniciada, el servidor responde con los documentos guardados cuyo texto coincide, ordenados por lo bien que coinciden, y esas filas se suman a las que el nombre ya había encontrado.

No hay que elegir entre ambas. Una consulta que es mitad nombre de archivo y mitad frase recordada encuentra los dos tipos de fila, y una que no coincide con nada por contenido simplemente deja el filtro por nombre como estaba. La petición tiene un retardo antes de enviarse, así que escribir no genera una petición por cada tecla, y una búsqueda que falla deja la lista funcionando en lugar de sustituirla por un error.

### De dónde viene el índice

Cada documento guardado lleva un \`tsvector\` de su Markdown, escrito en el momento en que el documento se guarda e indexado en Postgres. La coincidencia se calcula con \`websearch_to_tsquery\`, así que la sintaxis es la que cualquier campo de búsqueda ya ha enseñado a la gente: \`"una frase entre comillas"\` para palabras en ese orden, \`or\` entre alternativas, un \`-\` inicial para excluir.

Es una configuración deliberadamente sencilla — sin derivación de raíces y sin lista de palabras vacías. Las palabras coinciden tal como se escribieron: buscar \`convert\` no encuentra \`converting\`, y tampoco se reinterpreta en silencio nada de lo que buscas. Buscar en la fuente Markdown en lugar de en la página ya compuesta tiene un efecto secundario que conviene conocer: la dirección de un enlace, un bloque de código y un encabezado son también texto que se puede buscar.

### Lo que no alcanza

Una conversión que solo existe en este navegador no tiene fila en la base de datos, así que no hay nada indexado para ella y sigue encontrándose solo por el nombre — la consecuencia honesta de que las conversiones permanezcan locales hasta que se guardan. Los documentos que alguien compartió contigo tampoco están cubiertos; el chip que los lista filtra por nombre.

Desde un script, lo mismo es un solo parámetro: \`GET /api/v1/documents?q=…\`, o \`tp list --q "…"\`, que devuelve las coincidencias mejores primero, y entre dos iguales, la más reciente antes que la más antigua.

Relacionado: [convertir archivos Markdown por lotes](/blog/batch-convert-markdown-files) y [documentación que vive en el repositorio](/blog/documentation-that-lives-in-the-repo).`,
      },
      it: {
        title: 'La ricerca nella cronologia guarda ora anche dentro i tuoi documenti',
        summary: `Cercare nella cronologia trovava prima solo i nomi dei file. Da autenticato, ora trova un documento anche in base a ciò che c'è scritto dentro — il campo del nome funziona esattamente come prima, semplicemente non è più l'unico modo per entrare.`,
        description:
          'Il campo di ricerca sopra la cronologia trova ora anche il testo scritto dentro un documento salvato, non solo il nome del file, e ordina i risultati per rilevanza.',
        keywords:
          'cercare dentro i documenti, ricerca full text documenti markdown, trovare un documento dal contenuto, cercare nei file convertiti, ricerca full text postgres documenti',
        body: `Nessuno si ricorda come ha chiamato un file. Si ricorda una frase che c'era scritta, il nome del cliente di cui parlava, o l'unico comando che il runbook conteneva. Il campo in cima alla tua cronologia prima non poteva aiutare in nulla di tutto ciò, perché confrontava solo quello che digitavi con i nomi dei file.

### Due ricerche, un solo campo

Digitando, ora accadono due cose insieme. Il filtro per nome funziona dove ha sempre funzionato — nel browser, su ogni riga della pagina, all'istante, sia per le conversioni salvate che per quelle non salvate. E un istante dopo, se sei autenticato, il server risponde con i documenti salvati il cui testo corrisponde, ordinati per quanto bene corrispondono, e quelle righe si aggiungono a quelle già trovate dal nome.

Non devi scegliere tra i due. Una query che è metà nome di file e metà frase ricordata trova entrambi i tipi di riga, e una query che non corrisponde a nulla nel contenuto lascia semplicemente il filtro per nome come era. La richiesta è ritardata (debounced), quindi digitare non genera una richiesta per ogni tasto premuto, e una ricerca che fallisce lascia la lista funzionante invece di sostituirla con un errore.

### Da dove viene l'indice

Ogni documento salvato porta un \`tsvector\` del suo Markdown, scritto nel momento in cui il documento viene salvato e indicizzato in Postgres. Il confronto avviene con \`websearch_to_tsquery\`, quindi la sintassi è quella che ogni campo di ricerca ha già insegnato alle persone: \`"una frase tra virgolette"\` per parole in un certo ordine, \`or\` tra alternative, un \`-\` iniziale per escludere.

È una configurazione volutamente semplice — nessuna radicalizzazione delle parole (stemming) e nessun elenco di parole vuote. Le parole corrispondono come sono state digitate, il che significa che \`convert\` non trova \`converting\`, e significa anche che nulla di ciò che cerchi viene silenziosamente reinterpretato. Cercare nella fonte Markdown invece che nella pagina resa ha un effetto collaterale che vale la pena conoscere: l'indirizzo di un link, un blocco di codice e un titolo sono tutti testo ricercabile.

### Dove non arriva

Una conversione che esiste solo in questo browser non ha una riga nel database, quindi non c'è nulla di indicizzato per essa e continua a corrispondere solo per nome — la conseguenza onesta del fatto che le conversioni restano locali finché non le salvi. Nemmeno i documenti che qualcuno ha condiviso con te sono coperti; il chip che li elenca filtra per nome.

Da uno script la stessa cosa è un solo parametro: \`GET /api/v1/documents?q=…\`, oppure \`tp list --q "…"\`, che restituisce le corrispondenze migliori prima, e tra due equivalenti la più recente prima della più vecchia.

Da leggere: [convertire molti file Markdown in blocco](/blog/batch-convert-markdown-files), e [documentazione che vive nel repository](/blog/documentation-that-lives-in-the-repo).`,
      },
    },
    body:
      'Searching your history used to match file names only. Signed in, it now also finds a '
      + 'document by what is written inside it — the name box still works exactly as before, it '
      + 'just stops being the only way in.',
  },
  {
    date: '2026-09-11',
    title: 'A Summary tab, generated once and kept',
    slug: 'ai-summary',
    detail: {
      en: {
        description:
          'A saved document gets a Summary tab: three to five sentences from Gemini Flash, written on the first open, then stored and free to read again.',
        keywords:
          'ai document summary, summarise a markdown document, free ai summarizer for documents, gemini document summary, summarise a docx',
        body: `A history with forty documents in it is forty names, and a name tells you almost nothing about a report somebody else converted three weeks ago. The question in front of that list is always the same — what is this, and is it the one I want — and opening each candidate to find out is the slow way to answer it.

### What the tab holds

A saved document has a third tab beside **Preview** and **Markdown**, called **AI Summary**: three to five sentences of plain prose saying what the document says. No headings, no bullet points, no restating the title — the point is something you can read in ten seconds and then decide.

It needs a saved document, and says so rather than leaving the tab mysteriously empty: the text is stored on the document, so there has to be a document to store it on.

### Generated once

The first open asks the model. What comes back is written onto the document along with the time it was made, and every open after that reads that copy — no second call, no waiting, and nothing counted against anything. **Regenerate** is there for a document that has moved on since, and is the only thing that asks again.

The model is Gemini Flash, called directly rather than through a gateway, with its reasoning turned off: three sentences is a small task, and there is no sense paying a bigger model's latency for it. The first 60,000 characters of the source are what it reads, which is a token budget rather than a judgement about long documents — a summary only needs to have read the thing once.

### The limit

Twenty summaries a day per account. Past that the request comes back saying so and asking you to try again tomorrow; reading summaries you already have is unaffected, because those never reach the model. The count is per account per day and lives in its own tally, so a burst of ordinary API requests cannot eat into it.

### From a program

\`POST /api/v1/documents/:id/summary\` returns the same text with the same cache behind it — \`?force\` to regenerate — and \`tp summary <id>\` is the same thing from the CLI. An assistant with the connector attached calls \`tp_summarize_document\`, which is how a chat can triage a folder of documents without pasting any of them into the conversation.

It is a summary, not an extract: a document whose value is in its exact numbers or its table is a document to open. This is for deciding whether to.

Related: [free AI document summarisers, compared](/blog/free-ai-document-summarizer), and [turning an assistant's output into a page](/blog/ai-output-to-a-shareable-page).`,
      },
      de: {
        title: 'Ein Tab mit der KI-Zusammenfassung, einmal erzeugt und behalten',
        summary: `Ein gespeichertes Dokument hat jetzt einen dritten Tab neben Vorschau und Markdown: drei bis fünf Sätze darüber, was darin steht, damit Sie erkennen können, was etwas ist, ohne es zu öffnen. Das erste Öffnen erzeugt sie; danach ist erneutes Lesen kostenlos. Neu erstellen ist ein Klick, für ein Dokument, das sich seither weiterbewegt hat.`,
        description:
          'Ein gespeichertes Dokument bekommt einen Tab mit einer Zusammenfassung: drei bis fünf Sätze von Gemini Flash, einmal erzeugt und dann behalten.',
        keywords:
          'ki zusammenfassung dokument, markdown dokument zusammenfassen, dokumente automatisch zusammenfassen, gemini zusammenfassung, docx zusammenfassen',
        body: `Ein Verlauf mit vierzig Dokumenten ist zunächst vierzig Namen, und ein Name sagt fast nichts über einen Bericht, den jemand anderes vor drei Wochen konvertiert hat. Vor dieser Liste steht immer dieselbe Frage — was ist das, und ist es das gesuchte —, und jeden Kandidaten zu öffnen ist die langsame Art, sie zu beantworten.

### Was in dem Tab steht

Ein gespeichertes Dokument hat neben **Vorschau** und **Markdown** einen dritten Tab, **KI-Zusammenfassung**: drei bis fünf Sätze schlichte Prosa darüber, was das Dokument sagt. Keine Überschriften, keine Stichpunkte, keine Wiederholung des Titels — gedacht ist es als etwas, das man in zehn Sekunden liest und danach entscheidet.

Es braucht ein gespeichertes Dokument und sagt das auch, statt den Tab rätselhaft leer zu lassen: Der Text wird am Dokument abgelegt, es muss also ein Dokument geben, an dem das geschehen kann.

### Einmal erzeugt

Das erste Öffnen fragt das Modell. Was zurückkommt, wird mit dem Zeitpunkt seiner Entstehung an das Dokument geschrieben, und jedes weitere Öffnen liest diese Kopie — kein zweiter Aufruf, kein Warten, keine Anrechnung. **Neu erstellen** ist für ein Dokument gedacht, das sich seither weiterbewegt hat, und ist das Einzige, was erneut fragt.

Das Modell ist Gemini Flash, direkt aufgerufen und nicht über ein Gateway, mit abgeschaltetem Nachdenken: Drei Sätze sind eine kleine Aufgabe, und es hat keinen Sinn, dafür die Wartezeit eines größeren Modells zu bezahlen. Gelesen werden die ersten 60.000 Zeichen der Quelle — ein Budget an Token, kein Urteil über lange Dokumente: Eine Zusammenfassung muss die Sache genau einmal gelesen haben.

### Die Grenze

Zwanzig Zusammenfassungen pro Konto und Tag. Darüber hinaus kommt die Anfrage mit genau dieser Auskunft zurück und der Bitte, es morgen erneut zu versuchen; vorhandene Zusammenfassungen zu lesen bleibt davon unberührt, denn die erreichen das Modell nie. Gezählt wird pro Konto und Tag in einer eigenen Rechnung, sodass ein Schwall gewöhnlicher API-Anfragen dieses Budget nicht aufbrauchen kann.

### Aus einem Programm

\`POST /api/v1/documents/:id/summary\` liefert denselben Text mit demselben Zwischenspeicher dahinter — \`?force\` erzeugt ihn neu —, und \`tp summary <id>\` ist dasselbe aus dem CLI. Ein Assistent mit angeschlossenem Connector ruft \`tp_summarize_document\` auf, und so kann ein Chat einen Ordner voller Dokumente sortieren, ohne eines davon in das Gespräch einzufügen.

Es ist eine Zusammenfassung, kein Auszug: Ein Dokument, dessen Wert in seinen exakten Zahlen oder seiner Tabelle liegt, ist ein Dokument zum Öffnen. Dies hier ist dafür da, das zu entscheiden.

Weiter: [kostenlose KI-Zusammenfasser im Vergleich](/blog/free-ai-document-summarizer) und [die Ausgabe eines Assistenten als Seite](/blog/ai-output-to-a-shareable-page).`,
      },
      fr: {
        title: 'Un onglet Résumé, généré une fois et conservé',
        summary: `Un document enregistré dispose désormais d’un troisième onglet à côté d’Aperçu et de Markdown : trois à cinq phrases qui disent ce qu’il dit, pour savoir ce qu’est un document sans l’ouvrir. La première ouverture le génère ; ensuite, le relire est gratuit. Régénérer ne prend qu’un clic, pour un document qui a évolué depuis.`,
        description:
          'Un document enregistré reçoit un onglet Résumé : trois à cinq phrases de Gemini Flash, écrites à la première ouverture, puis conservées et relues gratuitement.',
        keywords:
          'résumé automatique de document, résumer un document markdown, résumeur ia gratuit pour documents, résumé de document par gemini, résumer un fichier docx',
        body: `Un historique de quarante documents, ce sont quarante noms, et un nom ne dit presque rien d’un rapport que quelqu’un d’autre a converti il y a trois semaines. La question devant cette liste est toujours la même — qu’est-ce que c’est, et est-ce celui que je cherche — et ouvrir chaque candidat pour le savoir est la façon la plus lente d’y répondre.

### Ce que contient l’onglet

Un document enregistré a un troisième onglet à côté de **Aperçu** et **Markdown**, appelé **Résumé IA** : trois à cinq phrases de prose simple disant ce que dit le document. Pas de titres, pas de puces, pas de répétition du titre — l’idée est d’avoir quelque chose que l’on peut lire en dix secondes avant de décider.

Il faut un document enregistré, et l’onglet le dit plutôt que de rester mystérieusement vide : le texte est stocké sur le document, il faut donc un document sur lequel le stocker.

### Généré une fois

La première ouverture interroge le modèle. Ce qui revient est écrit sur le document avec l’heure de sa génération, et chaque ouverture suivante lit cette copie — pas de second appel, pas d’attente, et rien n’est décompté. **Régénérer** est là pour un document qui a évolué depuis, et c’est la seule action qui interroge de nouveau.

Le modèle est Gemini Flash, appelé directement plutôt que via une passerelle, avec son raisonnement désactivé : trois phrases sont une petite tâche, et payer la latence d’un modèle plus lourd n’aurait pas de sens. Il lit les 60 000 premiers caractères de la source, ce qui est un budget de jetons plutôt qu’un jugement sur les documents longs — un résumé n’a besoin d’avoir lu la chose qu’une fois.

### La limite

Vingt résumés par jour et par compte. Au-delà, la requête revient en le disant et en demandant de réessayer le lendemain ; lire les résumés déjà obtenus n’est pas affecté, car ceux-ci n’atteignent jamais le modèle. Le compte est par compte et par jour, dans son propre décompte, si bien qu’une rafale de requêtes API ordinaires ne peut pas l’entamer.

### Depuis un programme

\`POST /api/v1/documents/:id/summary\` renvoie le même texte avec le même cache derrière lui — \`?force\` pour régénérer — et \`tp summary <id>\` fait la même chose depuis le CLI. Un assistant muni du connecteur appelle \`tp_summarize_document\`, ce qui permet à un chat de trier un dossier de documents sans en coller aucun dans la conversation.

C’est un résumé, pas un extrait : un document dont la valeur tient à ses chiffres exacts ou à son tableau est un document à ouvrir. Ceci sert à décider si on le fait.

Autres lectures : [comparatif des résumeurs de documents IA gratuits](/blog/free-ai-document-summarizer), et [transformer la sortie d’un assistant en page](/blog/ai-output-to-a-shareable-page).`,
      },
      es: {
        title: 'Una pestaña de Resumen, generada una vez y conservada',
        summary: `Un documento guardado ahora tiene una tercera pestaña junto a Vista previa y Markdown: de tres a cinco frases que dicen qué dice el documento, para poder saber qué es algo sin abrirlo. La primera vez que se abre, se genera; después, volver a leerla es gratis. Regenerar es un clic, para un documento que desde entonces ha cambiado.`,
        description:
          'Un documento guardado obtiene una pestaña de Resumen: tres a cinco frases de Gemini Flash, escritas al abrirlo y luego guardadas para leerlas gratis.',
        keywords:
          'resumen de documentos con ia, resumir un documento markdown, resumidor de ia gratis para documentos, resumen con gemini, resumir un docx',
        body: `Un historial con cuarenta documentos es, al principio, cuarenta nombres, y un nombre casi no dice nada sobre un informe que otra persona convirtió hace tres semanas. La pregunta que hay delante de esa lista es siempre la misma — qué es esto, y es el que busco — y abrir cada candidato para averiguarlo es la manera lenta de responderla.

### Qué contiene la pestaña

Un documento guardado tiene una tercera pestaña junto a **Vista previa** y **Markdown**, llamada **Resumen de IA**: de tres a cinco frases en prosa llana que dicen qué dice el documento. Sin encabezados, sin viñetas, sin repetir el título — la idea es algo que se pueda leer en diez segundos y, con eso, decidir.

Necesita un documento guardado, y lo dice en lugar de dejar la pestaña vacía sin explicación: el texto se guarda sobre el documento, así que tiene que existir un documento donde guardarlo.

### Generado una vez

La primera vez que se abre, se le pregunta al modelo. Lo que responde se escribe sobre el documento junto con el momento en que se generó, y cada apertura posterior lee esa misma copia — sin segunda llamada, sin espera y sin que nada cuente contra nada. **Regenerar** está ahí para un documento que desde entonces ha cambiado, y es lo único que vuelve a preguntar.

El modelo es Gemini Flash, llamado directamente y no a través de una pasarela, con el razonamiento desactivado: tres frases son una tarea pequeña, y no tiene sentido pagar la latencia de un modelo mayor por ella. Lo que lee son los primeros 60.000 caracteres de la fuente, que es un presupuesto de tokens y no un juicio sobre los documentos largos — un resumen solo necesita haber leído la cosa una vez.

### El límite

Veinte resúmenes al día por cuenta. Superado ese número, la petición vuelve diciéndolo y pidiendo que se intente de nuevo al día siguiente; leer los resúmenes que ya se tienen no se ve afectado, porque esos nunca llegan al modelo. El recuento es por cuenta y por día, y vive en su propio contador, de modo que una ráfaga de peticiones normales a la API no puede consumirlo.

### Desde un programa

\`POST /api/v1/documents/:id/summary\` devuelve el mismo texto con la misma caché detrás — \`?force\` para regenerarlo — y \`tp summary <id>\` es lo mismo desde la CLI. Un asistente con el conector conectado llama a \`tp_summarize_document\`, que es cómo un chat puede clasificar una carpeta de documentos sin pegar ninguno de ellos en la conversación.

Es un resumen, no un extracto: un documento cuyo valor está en sus cifras exactas o en su tabla es un documento para abrir. Esto sirve para decidir si hacerlo.

Relacionado: [resumidores de IA gratuitos para documentos, comparados](/blog/free-ai-document-summarizer) y [convertir la salida de un asistente en una página](/blog/ai-output-to-a-shareable-page).`,
      },
      it: {
        title: 'Una scheda Riassunto, generata una volta e conservata',
        summary: `Un documento salvato ha ora una terza scheda accanto ad Anteprima e Markdown: da tre a cinque frasi che dicono cosa dice il documento, così puoi capire di cosa si tratta senza aprirlo. La prima apertura lo genera; dopo, leggerlo di nuovo è gratuito. Rigenera è un clic, per un documento che nel frattempo è cambiato.`,
        description:
          'Un documento salvato ottiene una scheda Riassunto: da tre a cinque frasi generate da Gemini Flash alla prima apertura, poi conservate e gratuite da rileggere.',
        keywords:
          'riassunto ai di un documento, riassumere un documento markdown con l\'ai, riassuntore ai gratuito per documenti, riassunto documenti con gemini, riassumere un docx',
        body: `Una cronologia con quaranta documenti è, all'inizio, quaranta nomi, e un nome non dice quasi nulla su un rapporto che qualcun altro ha convertito tre settimane fa. La domanda davanti a quella lista è sempre la stessa — cos'è questo, ed è quello che sto cercando — e aprire ogni candidato per scoprirlo è il modo lento di rispondere.

### Cosa contiene la scheda

Un documento salvato ha una terza scheda accanto a **Anteprima** e **Markdown**, chiamata **Riassunto AI**: da tre a cinque frasi in prosa semplice che dicono cosa dice il documento. Nessun titolo, nessun elenco puntato, nessuna ripetizione del titolo del documento — l'idea è qualcosa che si legge in dieci secondi e dopo si decide.

Richiede un documento salvato, e lo dice invece di lasciare la scheda misteriosamente vuota: il testo viene conservato sul documento, quindi deve esistere un documento su cui conservarlo.

### Generato una volta

La prima apertura interroga il modello. Ciò che torna viene scritto sul documento insieme al momento in cui è stato creato, e ogni apertura successiva legge quella copia — nessuna seconda chiamata, nessuna attesa, e nulla viene conteggiato. **Rigenera** esiste per un documento che nel frattempo è cambiato, ed è l'unica cosa che interroga di nuovo il modello.

Il modello è Gemini Flash, chiamato direttamente e non tramite un gateway, con il ragionamento disattivato: tre frasi sono un compito piccolo, e non ha senso pagare la latenza di un modello più grande per questo. Vengono letti i primi 60.000 caratteri della fonte, un budget di token e non un giudizio sui documenti lunghi — un riassunto deve solo aver letto la cosa una volta.

### Il limite

Venti riassunti al giorno per account. Superata questa soglia, la richiesta torna dicendolo e chiedendo di riprovare il giorno dopo; leggere i riassunti che già possiedi non ne è toccato, perché quelli non raggiungono mai il modello. Il conteggio è per account e per giorno e vive nel proprio contatore separato, così una raffica di normali richieste API non può consumarlo.

### Da un programma

\`POST /api/v1/documents/:id/summary\` restituisce lo stesso testo con la stessa cache dietro — \`?force\` per rigenerarlo — e \`tp summary <id>\` è la stessa cosa dalla CLI. Un assistente con il connettore collegato chiama \`tp_summarize_document\`, ed è così che una chat può passare in rassegna una cartella di documenti senza incollarne nessuno nella conversazione.

È un riassunto, non un estratto: un documento il cui valore sta nei numeri esatti o nella tabella è un documento da aprire. Questo serve per decidere se farlo.

Da leggere: [riassuntori AI gratuiti per documenti, confrontati](/blog/free-ai-document-summarizer), e [trasformare l'output di un assistente in una pagina](/blog/ai-output-to-a-shareable-page).`,
      },
    },
    body:
      'A saved document now has a third tab beside Preview and Markdown: three to five sentences '
      + 'that say what it says, so you can tell what something is without opening it. The first '
      + 'open generates it; after that, reading it again is free. Regenerate is one click, for a '
      + 'document that has moved on since.',
  },
  {
    date: '2026-09-11',
    title: 'Nothing reaches your account until you save it',
    slug: 'conversions-stay-in-your-browser',
    detail: {
      en: {
        description:
          'Converting a file on TransformPipe no longer touches your account: the conversion stays in your browser until you press Save, and signing in uploads nothing.',
        keywords:
          'convert documents without uploading, private markdown converter, does an online converter upload my file, browser based document conversion, secure file converter',
        body: `The question behind this one is the one every online converter gets asked and most answer badly: does my file leave the machine. Here the answer is no unless you press **Save**, and it is worth saying exactly why that is possible.

Now a conversion stays in the browser that made it. **Save** is what puts it in the account, and nothing else does.

### What that means in practice

- Drop a file, read it, download the result, close the tab: nothing left our machine and nothing is on the account.
- Signing in uploads nothing. The history shows what is local and what is saved, and says which is which.
- Sharing needs a saved document, because a link has to point at something that exists — and it says so, instead of the Share button being mysteriously unavailable.
- Deleting a saved document deletes it. The local copy is the browser's, and clearing site data removes it.

### Why the conversion never needed a server

Every one of the ten conversions runs in JavaScript in your browser: Markdown, HTML, \`.docx\`, \`.csv\`, \`.xlsx\`, JSON, plain text, and the zip readers for a Notion, Confluence or Obsidian export. There was never a technical reason to send the file anywhere — the upload existed because the account existed, which is the wrong way round.

An account is for the documents you decide to keep, not a record of everything you looked at. If you never sign in, this site never receives a file at all.

Related: [whether an online converter is safe](/blog/is-an-online-converter-safe), and [sharing a document as a link](/blog/share-a-markdown-document-as-a-link).`,
      },
      de: {
        title: 'Nichts erreicht Ihr Konto, bevor Sie es speichern',
        summary: `Eine Datei zu konvertieren legte sie früher in Ihrem Konto ab. Ablegen, ansehen, Tab schließen — und sie war da, zusammen mit allem anderen, worauf Sie je einen Blick geworfen hatten. Jetzt bleibt eine Konvertierung in diesem Browser, und **Speichern** ist das, was sie ins Konto legt.`,
        description:
          'Eine Konvertierung auf TransformPipe berührt Ihr Konto nicht mehr: Sie bleibt in Ihrem Browser, bis Sie speichern, und das Anmelden lädt nichts hoch.',
        keywords:
          'dokumente ohne upload konvertieren, privater markdown konverter, lädt ein online konverter meine datei hoch, konvertierung im browser, sichere dateikonvertierung',
        body: `Hinter dieser Änderung steht die Frage, die jedem Online-Konverter gestellt und von den meisten schlecht beantwortet wird: verlässt meine Datei den Rechner. Hier lautet die Antwort nein, solange Sie nicht **Speichern** drücken — und es lohnt sich zu sagen, warum das überhaupt möglich ist.

Jetzt bleibt eine Konvertierung in dem Browser, der sie gemacht hat. **Speichern** legt sie ins Konto, und sonst tut das nichts.

### Was das in der Praxis heißt

- Datei ablegen, lesen, Ergebnis herunterladen, Tab schließen: Nichts hat unsere Maschine verlassen und nichts liegt auf dem Konto.
- Das Anmelden lädt nichts hoch. Der Verlauf zeigt, was lokal und was gespeichert ist, und sagt, was davon was ist.
- Teilen braucht ein gespeichertes Dokument, denn ein Link muss auf etwas zeigen, das existiert — und genau das steht da, statt dass der Knopf rätselhaft nicht verfügbar wäre.
- Ein gespeichertes Dokument zu löschen löscht es. Die lokale Kopie gehört dem Browser, und das Löschen der Websitedaten entfernt sie.

### Warum die Konvertierung nie einen Server brauchte

Jede der zehn Konvertierungen läuft in JavaScript in Ihrem Browser: Markdown, HTML, \`.docx\`, \`.csv\`, \`.xlsx\`, JSON, reiner Text und die Zip-Leser für einen Notion-, Confluence- oder Obsidian-Export. Es gab nie einen technischen Grund, die Datei irgendwohin zu schicken — den Upload gab es, weil es das Konto gab, und das ist die falsche Reihenfolge.

Ein Konto ist für die Dokumente da, die Sie behalten wollen, und nicht als Protokoll von allem, was Sie angesehen haben. Wenn Sie sich nie anmelden, bekommt diese Seite überhaupt nie eine Datei.

Weiter: [ob ein Online-Konverter sicher ist](/blog/is-an-online-converter-safe) und [ein Dokument als Link teilen](/blog/share-a-markdown-document-as-a-link).`,
      },
      fr: {
        title: 'Rien n’atteint votre compte avant que vous l’enregistriez',
        summary: `Convertir un fichier le plaçait auparavant dans votre compte. Déposer, regarder, fermer l’onglet — et il était là, avec tout ce que vous aviez jamais parcouru. Se connecter était pire : tout ce que ce navigateur avait converti était téléversé d’un coup, si bien que vingt-cinq choses que vous aviez regardées devenaient vingt-cinq documents que vous n’aviez jamais demandé à garder.

Désormais, une conversion reste dans ce navigateur, et **Enregistrer** la place dans le compte. L’historique montre les deux et indique ce qui est quoi ; le partage a toujours besoin d’un document enregistré, et le dit plutôt que d’être mystérieusement indisponible.

Le connecteur et l’API ont toujours fonctionné ainsi — \`tp_convert_markdown\` n’enregistre rien, \`tp_save_document\` enregistre — c’est donc l’interface qui les rattrape.`,
        description:
          'Convertir un fichier sur TransformPipe ne touche plus votre compte : la conversion reste dans le navigateur jusqu’à Enregistrer, et se connecter ne téléverse rien.',
        keywords:
          'convertir des documents sans les téléverser, convertisseur markdown privé, un convertisseur en ligne téléverse-t-il mon fichier, conversion de documents dans le navigateur, convertisseur de fichiers sécurisé',
        body: `La question derrière ce changement est celle que l’on pose à tout convertisseur en ligne et à laquelle la plupart répondent mal : mon fichier quitte-t-il la machine. Ici, la réponse est non, sauf si vous appuyez sur **Enregistrer**, et cela vaut la peine de dire précisément pourquoi c’est possible.

Désormais, une conversion reste dans le navigateur qui l’a produite. **Enregistrer** est ce qui la place dans le compte, et rien d’autre ne le fait.

### Ce que cela signifie en pratique

- Déposer un fichier, le lire, télécharger le résultat, fermer l’onglet : rien n’a quitté notre machine et rien n’est sur le compte.
- Se connecter ne téléverse rien. L’historique montre ce qui est local et ce qui est enregistré, et indique ce qui est quoi.
- Le partage nécessite un document enregistré, car un lien doit pointer vers quelque chose qui existe — et c’est ce qui est indiqué, plutôt que d’avoir un bouton Partager mystérieusement indisponible.
- Supprimer un document enregistré le supprime. La copie locale appartient au navigateur, et effacer les données du site la retire.

### Pourquoi la conversion n’a jamais eu besoin d’un serveur

Chacune des dix conversions s’exécute en JavaScript dans votre navigateur : Markdown, HTML, \`.docx\`, \`.csv\`, \`.xlsx\`, JSON, texte brut, et les lecteurs de zip pour un export Notion, Confluence ou Obsidian. Il n’y a jamais eu de raison technique d’envoyer le fichier où que ce soit — le téléversement existait parce que le compte existait, ce qui est l’ordre inverse de celui qu’il faudrait.

Un compte est fait pour les documents que vous décidez de garder, pas un registre de tout ce que vous avez regardé. Si vous ne vous connectez jamais, ce site ne reçoit jamais aucun fichier.

Autres lectures : [un convertisseur en ligne est-il sûr](/blog/is-an-online-converter-safe), et [partager un document sous forme de lien](/blog/share-a-markdown-document-as-a-link).`,
      },
      es: {
        title: 'Nada llega a tu cuenta hasta que lo guardas',
        summary: `Convertir un archivo antes lo dejaba en tu cuenta. Soltarlo, mirarlo, cerrar la pestaña — y ahí seguía, junto con todo lo demás que alguna vez había ojeado. Iniciar sesión era peor: todo lo que ese navegador había convertido se subía de una vez, así que veinticinco cosas que había mirado se convertían en veinticinco documentos que nunca había pedido conservar.

Ahora una conversión permanece en este navegador, y Guardar es lo que la pone en la cuenta. El historial muestra ambas cosas y dice cuál es cuál; compartir sigue necesitando un documento guardado, y lo dice en lugar de estar disponible sin explicación.

El conector y la API siempre funcionaron así — \`tp_convert_markdown\` no guarda nada, \`tp_save_document\` sí guarda — así que esto es la interfaz alcanzándolos.`,
        description:
          'Convertir un archivo en TransformPipe ya no toca tu cuenta: la conversión permanece en tu navegador hasta que pulsas Guardar, y al iniciar sesión no se sube nada.',
        keywords:
          'convertir documentos sin subir archivos, conversor de markdown privado, sube mis archivos un conversor online, conversión de documentos en el navegador, conversor de archivos seguro',
        body: `La pregunta detrás de este cambio es la que se le hace a cualquier conversor en línea y que la mayoría responde mal: si mi archivo sale de la máquina. Aquí la respuesta es no, salvo que pulses **Guardar**, y merece la pena explicar por qué eso es posible.

Ahora una conversión permanece en el navegador que la hizo. **Guardar** es lo único que la pone en la cuenta.

### Qué significa esto en la práctica

- Soltar un archivo, leerlo, descargar el resultado, cerrar la pestaña: nada salió de la máquina y nada está en la cuenta.
- Iniciar sesión no sube nada. El historial muestra qué es local y qué está guardado, y dice cuál es cuál.
- Compartir necesita un documento guardado, porque un enlace tiene que apuntar a algo que existe — y eso es lo que dice, en lugar de que el botón Compartir esté sin explicación deshabilitado.
- Eliminar un documento guardado lo elimina. La copia local es del navegador, y borrar los datos del sitio la quita.

### Por qué la conversión nunca necesitó un servidor

Cada una de las diez conversiones se ejecuta en JavaScript en tu navegador: Markdown, HTML, \`.docx\`, \`.csv\`, \`.xlsx\`, JSON, texto plano, y los lectores de zip para una exportación de Notion, Confluence u Obsidian. Nunca hubo una razón técnica para enviar el archivo a ningún sitio — la subida existía porque existía la cuenta, y eso es el orden equivocado.

Una cuenta es para los documentos que decides conservar, no un registro de todo lo que has mirado. Si nunca inicias sesión, este sitio no recibe ningún archivo en absoluto.

Relacionado: [si un conversor en línea es seguro](/blog/is-an-online-converter-safe) y [compartir un documento como enlace](/blog/share-a-markdown-document-as-a-link).`,
      },
      it: {
        title: 'Nulla raggiunge il tuo account finché non lo salvi',
        summary: `Convertire un file lo metteva prima nel tuo account. Rilasciare, guardare, chiudere la scheda — ed era lì, insieme a tutto il resto che avevi mai sfiorato con lo sguardo. Accedere era peggio: qualunque cosa questo browser avesse convertito veniva caricata in un colpo solo, così venticinque cose che avevi guardato diventavano venticinque documenti che non avevi mai chiesto di conservare.

Ora una conversione resta in questo browser, e **Salva** è ciò che la mette nell'account. La cronologia mostra entrambe e dice quale è quale; condividere richiede ancora un documento salvato, e lo dice invece di rendere il pulsante misteriosamente non disponibile.

Il connettore e l'API hanno sempre funzionato così — \`tp_convert_markdown\` non salva nulla, \`tp_save_document\` salva — quindi questa è l'interfaccia che li raggiunge.`,
        description:
          'Convertire un file su TransformPipe non tocca più il tuo account: la conversione resta nel browser finché non premi Salva, e accedere non carica nulla.',
        keywords:
          'convertire documenti senza caricarli, convertitore markdown privato, un convertitore online carica il mio file, conversione di documenti nel browser, convertitore di file sicuro',
        body: `La domanda dietro a questa novità è quella che ogni convertitore online riceve e che la maggior parte risponde male: il mio file lascia la macchina? Qui la risposta è no, a meno che non premi **Salva**, e vale la pena dire esattamente perché ciò è possibile.

Ora una conversione resta nel browser che l'ha fatta. **Salva** è ciò che la mette nell'account, e nulla altro lo fa.

### Cosa significa in pratica

- Rilasciare un file, leggerlo, scaricare il risultato, chiudere la scheda: nulla ha lasciato la nostra macchina e nulla è sull'account.
- Accedere non carica nulla. La cronologia mostra cosa è locale e cosa è salvato, e dice quale è quale.
- Condividere richiede un documento salvato, perché un link deve puntare a qualcosa che esiste — e lo dice, invece di rendere il pulsante Condividi misteriosamente non disponibile.
- Eliminare un documento salvato lo elimina. La copia locale appartiene al browser, e cancellare i dati del sito la rimuove.

### Perché la conversione non ha mai avuto bisogno di un server

Ognuna delle dieci conversioni funziona in JavaScript nel tuo browser: Markdown, HTML, \`.docx\`, \`.csv\`, \`.xlsx\`, JSON, testo semplice, e i lettori zip per un export da Notion, Confluence o Obsidian. Non c'è mai stata una ragione tecnica per inviare il file da qualche parte — il caricamento esisteva perché esisteva l'account, che è l'ordine sbagliato.

Un account serve per i documenti che decidi di conservare, non come registro di tutto ciò che hai guardato. Se non accedi mai, questo sito non riceve mai alcun file.

Da leggere: [se un convertitore online è sicuro](/blog/is-an-online-converter-safe), e [condividere un documento come link](/blog/share-a-markdown-document-as-a-link).`,
      },
    },
    body:
      'Converting a file used to put it in your account. Drop, look, close the tab — and it was '
      + 'there, along with everything else you had ever glanced at. Signing in was worse: whatever '
      + 'this browser had converted was uploaded in one go, so twenty-five things you had looked '
      + 'at became twenty-five documents you had never asked to keep.\n\n'
      + 'Now a conversion stays in this browser, and **Save** puts it in the account. The history '
      + 'shows both and says which is which; sharing still needs a saved document, and says so '
      + 'rather than being mysteriously unavailable.\n\n'
      + 'The connector and the API always worked this way — `tp_convert_markdown` saves '
      + 'nothing, `tp_save_document` saves — so this is the interface catching up with them.',
  },
  {
    date: '2026-09-11',
    title: 'Paste it, or type it and watch',
    slug: 'paste-and-live-preview',
    detail: {
      en: {
        description:
          'Paste Markdown instead of dropping a file, or type it at /markdown-live-preview and watch the document appear beside it. Nothing is uploaded.',
        keywords:
          'markdown live preview, paste markdown and convert, markdown editor with preview, online markdown preview, convert pasted text to html',
        body: `There are two different jobs hiding behind "convert this Markdown". One is finished work: a file exists, and you want the other format of it. The other is unfinished: you are writing, and you want to see what it looks like. A dropzone answers the first well and the second not at all, which is why there are now two answers.

### Pasting instead of dropping

Under the dropzone there is a button that opens a box you can paste into. The text becomes a file with that conversion's own extension and goes down exactly the path a dropped file goes down — the same conversion, the same size limit, the same preview, download, save, share and history. Nothing about the result is different, because nothing about the machinery is.

It is there for the conversions whose source is text: Markdown → HTML, HTML → Markdown, plain text, CSV or TSV, and JSON. On the five whose source is a file and nothing else — Word, Excel, and the Notion, Confluence and Obsidian exports — the button is visible but disabled, with the reason, because there is genuinely nothing to paste from a \`.zip\`. A character count in the box tells you where the limit is before a refusal does.

### The other question, at its own address

\`/markdown-live-preview\` is Markdown on the left, the document on the right, re-rendered about a fifth of a second after you stop typing. Both panes take their height from the window, so a tall screen is a tall editor, and there is a fullscreen for when it is not enough.

It is the same converter underneath — the same renderer, the same sanitiser, the same document styles — so what you are looking at is what a downloaded file contains. A preview that disagreed with the file would be worse than no preview. It opens with a short example rather than an empty box, which a reader who arrives with their own text never sees.

### Nothing leaves the tab

The live preview has no account, no history and no network. Your text is never sent anywhere and never saved; closing the tab is how you delete it. That is also what lets the page work with nothing but the bundle loaded.

### Between the two

They hand work to each other. Paste Markdown into the converter and the button beside it takes you to the live preview with your text already in it, rather than to the example. Write something in the live preview and **Convert and keep** sends it the other way, to the converter, where the history, the share link and the other formats live.

Related: [converting Markdown to HTML online](/blog/convert-markdown-to-html-online), and [Markdown editors worth using](/blog/best-markdown-editors).`,
      },
      de: {
        title: 'Einfügen, oder tippen und zusehen',
        summary: `Alles hier brauchte eine Datei, was eine sonderbare Forderung an jemanden ist, der das Markdown in der Zwischenablage hat. Der Konverter nimmt jetzt auch eingefügten Text — bei jeder Konvertierung außer denen, deren Quelle nur eine Datei sein kann —, und zurück kommt dasselbe Dokument, mit derselben Vorschau, demselben Herunterladen, Speichern und Teilen. Dazu eine Seite für die andere Frage: \`/markdown-live-preview\` ist Markdown links und das Dokument rechts, während getippt wird. Nichts wird hochgeladen und nichts gespeichert; der Text bleibt im Tab.`,
        description:
          'Markdown einfügen statt eine Datei ablegen — oder es unter /markdown-live-preview tippen und daneben zusehen. Nichts wird hochgeladen.',
        keywords:
          'markdown live vorschau, markdown einfügen und umwandeln, markdown editor mit vorschau, markdown vorschau online, eingefügten text in html umwandeln',
        body: `Hinter „wandle dieses Markdown um" verstecken sich zwei verschiedene Aufgaben. Die eine ist fertige Arbeit: Eine Datei existiert, und Sie wollen das andere Format davon. Die andere ist unfertig: Sie schreiben, und Sie wollen sehen, wie es aussieht. Ein Ablagefeld beantwortet die erste gut und die zweite überhaupt nicht — deshalb gibt es jetzt zwei Antworten.

### Einfügen statt ablegen

Unter dem Ablagefeld sitzt ein Knopf, der ein Feld zum Einfügen öffnet. Der Text wird zu einer Datei mit der Endung dieser Konvertierung und nimmt genau den Weg, den eine abgelegte Datei nimmt — dieselbe Konvertierung, dieselbe Größengrenze, dieselbe Vorschau, dasselbe Herunterladen, Speichern, Teilen und derselbe Verlauf. Am Ergebnis ist nichts anders, weil an der Mechanik nichts anders ist.

Es gibt das Feld für die Konvertierungen, deren Quelle Text ist: Markdown → HTML, HTML → Markdown, Reintext, CSV oder TSV und JSON. Bei den fünf, deren Quelle nur eine Datei sein kann — Word, Excel und die Exporte aus Notion, Confluence und Obsidian —, ist der Knopf sichtbar, aber abgeschaltet, mitsamt Begründung: Aus einer \`.zip\` gibt es wirklich nichts einzufügen. Eine Zeichenzahl im Feld zeigt die Grenze, bevor eine Ablehnung es tut.

### Die andere Frage, an eigener Adresse

\`/markdown-live-preview\` ist Markdown links, das Dokument rechts, neu gesetzt etwa eine Fünftelsekunde nachdem Sie aufhören zu tippen. Beide Hälften nehmen ihre Höhe vom Fenster, ein hoher Bildschirm ist also ein hoher Editor, und für den Fall, dass das nicht reicht, gibt es Vollbild.

Darunter arbeitet derselbe Konverter — dieselbe Darstellung, dieselbe Bereinigung, dieselben Dokumentstile —, was Sie ansehen, ist also das, was eine heruntergeladene Datei enthält. Eine Vorschau, die der Datei widerspricht, wäre schlimmer als keine. Die Seite beginnt mit einem kurzen Beispiel statt mit einem leeren Feld, das niemand sieht, der mit eigenem Text ankommt.

### Nichts verlässt den Tab

Die Live-Vorschau hat kein Konto, keinen Verlauf und kein Netz. Ihr Text wird nirgendwohin geschickt und nie gespeichert; ihn zu löschen heißt, den Tab zu schließen. Genau das erlaubt es der Seite auch, zu arbeiten, wenn nur das Bundle geladen ist.

### Zwischen beiden

Die beiden geben sich die Arbeit weiter. Fügen Sie Markdown im Konverter ein, führt der Knopf daneben Sie mit Ihrem Text in die Live-Vorschau, nicht zum Beispiel. Schreiben Sie dort etwas, schickt **Umwandeln und behalten** es in die andere Richtung, zum Konverter, wo Verlauf, Link zum Teilen und die übrigen Formate liegen.

Weiter: [Markdown online in HTML umwandeln](/blog/convert-markdown-to-html-online) und [Markdown-Editoren, die sich lohnen](/blog/best-markdown-editors).`,
      },
      fr: {
        title: 'Collez-le, ou tapez-le et regardez',
        summary: `Tout ici demandait un fichier, ce qui est une drôle d’exigence envers quelqu’un qui a le Markdown dans son presse-papiers. Le convertisseur accepte désormais le texte collé aussi bien qu’un fichier déposé — pour toute conversion sauf Word, où il n’y a rien à coller — et ce qui revient est le même document, avec le même aperçu, le même téléchargement, la même sauvegarde et le même partage.

Et une page pour l’autre question : \`/markdown-live-preview\` place le Markdown à gauche et le document à droite, au fil de la frappe. Rien n’est téléversé et rien n’est enregistré ; le texte reste dans l’onglet. C’est le même convertisseur en dessous, si bien que ce qui est à droite est ce que contiendrait un fichier téléchargé.

Les deux volets prennent leur hauteur de la fenêtre, un grand écran donne donc un grand éditeur, et il y a un plein écran pour quand cela ne suffit toujours pas. Un texte collé dans le convertisseur arrive ici déjà rendu, et **Convertir et garder** le renvoie dans l’autre sens — vers l’écran du document, avec l’historique, le lien de partage et les autres formats.`,
        description:
          'Collez du Markdown au lieu de déposer un fichier, ou tapez-le sur /markdown-live-preview et regardez le document apparaître à côté. Rien n’est téléversé.',
        keywords:
          'aperçu markdown en direct, coller du markdown pour le convertir, éditeur markdown avec aperçu, aperçu markdown en ligne, convertir du texte collé en html',
        body: `Deux tâches différentes se cachent derrière « convertir ce Markdown ». L’une est un travail terminé : un fichier existe, et vous en voulez l’autre format. L’autre est en cours : vous écrivez, et vous voulez voir à quoi cela ressemble. Une zone de dépôt répond bien à la première et pas du tout à la seconde, c’est pourquoi il y a désormais deux réponses.

### Coller plutôt que déposer

Sous la zone de dépôt se trouve un bouton qui ouvre un champ dans lequel coller. Le texte devient un fichier portant l’extension propre à cette conversion et suit exactement le même chemin qu’un fichier déposé — la même conversion, la même limite de taille, le même aperçu, le même téléchargement, la même sauvegarde, le même partage et le même historique. Rien dans le résultat n’est différent, car rien dans la mécanique ne l’est.

Ce champ existe pour les conversions dont la source est du texte : Markdown → HTML, HTML → Markdown, texte brut, CSV ou TSV, et JSON. Pour les cinq dont la source ne peut être qu’un fichier — Word, Excel, et les exports Notion, Confluence et Obsidian —, le bouton est visible mais désactivé, avec la raison, car il n’y a vraiment rien à coller depuis un \`.zip\`. Un compteur de caractères dans le champ indique où se situe la limite avant qu’un refus ne le fasse.

### L’autre question, à sa propre adresse

\`/markdown-live-preview\` place le Markdown à gauche, le document à droite, remis en forme environ un cinquième de seconde après que vous arrêtez de taper. Les deux volets prennent leur hauteur de la fenêtre, un grand écran donne donc un grand éditeur, et il y a un plein écran pour quand cela ne suffit pas.

C’est le même convertisseur en dessous — le même moteur de rendu, le même assainisseur, les mêmes styles de document —, ce que vous regardez est donc ce que contient un fichier téléchargé. Un aperçu en désaccord avec le fichier serait pire que pas d’aperçu du tout. La page s’ouvre avec un court exemple plutôt qu’un champ vide, que ne voit jamais un lecteur qui arrive avec son propre texte.

### Rien ne quitte l’onglet

L’aperçu en direct n’a ni compte, ni historique, ni réseau. Votre texte n’est jamais envoyé nulle part ni jamais enregistré ; fermer l’onglet est la façon de le supprimer. C’est aussi ce qui permet à la page de fonctionner avec pour seul chargement le paquet lui-même.

### Entre les deux

Ils se passent le travail l’un à l’autre. Collez du Markdown dans le convertisseur et le bouton à côté vous emmène vers l’aperçu en direct avec votre texte déjà à l’intérieur, plutôt que vers l’exemple. Écrivez quelque chose dans l’aperçu en direct et **Convertir et garder** l’envoie dans l’autre sens, vers le convertisseur, où vivent l’historique, le lien de partage et les autres formats.

Autres lectures : [convertir du Markdown en HTML en ligne](/blog/convert-markdown-to-html-online), et [des éditeurs Markdown qui valent le coup](/blog/best-markdown-editors).`,
      },
      es: {
        title: 'Pégalo, o escríbelo y observa',
        summary: `Todo esto pedía un archivo, lo cual es raro pedírselo a alguien que tiene el Markdown en el portapapeles. El conversor ahora acepta texto pegado además de un archivo soltado — para todas las conversiones salvo Word, donde no hay nada que pegar — y lo que se obtiene es el mismo documento, con la misma vista previa, descarga, guardado y compartición.

Y una página para la otra pregunta: /markdown-live-preview tiene Markdown a la izquierda y el documento a la derecha, mientras se escribe. No se sube nada y no se guarda nada; el texto permanece en la pestaña. Es el mismo conversor por debajo, así que lo que hay a la derecha es lo que contiene un archivo descargado.

Ambos paneles toman su altura de la ventana, así que una pantalla alta es un editor alto, y hay una pantalla completa para cuando eso todavía no basta. El texto pegado en el conversor llega aquí ya renderizado, y Convertir y conservar lo envía de vuelta en la otra dirección — a la pantalla del documento, con el historial, el enlace para compartir y los demás formatos.`,
        description:
          'Pega Markdown en vez de soltar un archivo, o escríbelo en /markdown-live-preview y observa el documento aparecer al lado. No se sube nada.',
        keywords:
          'vista previa de markdown en vivo, pegar markdown y convertir, editor de markdown con vista previa, vista previa de markdown online, convertir texto pegado a html',
        body: `Detrás de «convertir este Markdown» se esconden dos tareas distintas. Una es trabajo terminado: existe un archivo y quieres el otro formato de él. La otra está sin terminar: estás escribiendo, y quieres ver cómo queda. Una zona para soltar archivos responde bien a la primera y nada a la segunda, y por eso ahora hay dos respuestas.

### Pegar en vez de soltar

Debajo de la zona de soltar hay un botón que abre un cuadro en el que se puede pegar. El texto se convierte en un archivo con la extensión propia de esa conversión y sigue exactamente el mismo camino que un archivo soltado — la misma conversión, el mismo límite de tamaño, la misma vista previa, descarga, guardado, compartición e historial. Nada del resultado es distinto, porque nada de la maquinaria lo es.

Está disponible para las conversiones cuya fuente es texto: Markdown → HTML, HTML → Markdown, texto plano, CSV o TSV, y JSON. En las cinco cuya fuente solo puede ser un archivo — Word, Excel, y las exportaciones de Notion, Confluence y Obsidian —, el botón se ve pero está desactivado, con el motivo indicado, porque de un \`.zip\` realmente no hay nada que pegar. Un contador de caracteres en el cuadro avisa dónde está el límite antes de que lo haga un rechazo.

### La otra pregunta, en su propia dirección

\`/markdown-live-preview\` tiene Markdown a la izquierda y el documento a la derecha, que se vuelve a renderizar alrededor de un quinto de segundo después de dejar de escribir. Ambos paneles toman su altura de la ventana, así que una pantalla alta es un editor alto, y hay una pantalla completa para cuando eso no basta.

Por debajo es el mismo conversor — el mismo renderizador, el mismo saneador, los mismos estilos de documento —, así que lo que se ve es lo que contiene un archivo descargado. Una vista previa que no coincidiera con el archivo sería peor que ninguna vista previa. Se abre con un ejemplo breve en lugar de un cuadro vacío, que quien llega con su propio texto nunca llega a ver.

### Nada sale de la pestaña

La vista previa en vivo no tiene cuenta, ni historial, ni red. Tu texto nunca se envía a ningún sitio ni se guarda; cerrar la pestaña es la manera de borrarlo. Eso es también lo que permite que la página funcione con solo el paquete cargado.

### Entre las dos

Se pasan trabajo la una a la otra. Pega Markdown en el conversor y el botón de al lado lo lleva a la vista previa en vivo con tu texto ya puesto, en lugar del ejemplo. Escribe algo en la vista previa en vivo y **Convertir y conservar** lo envía en la otra dirección, al conversor, donde están el historial, el enlace para compartir y los demás formatos.

Relacionado: [convertir Markdown a HTML en línea](/blog/convert-markdown-to-html-online) y [editores de Markdown que merecen la pena](/blog/best-markdown-editors).`,
      },
      it: {
        title: 'Incollalo, o digitalo e osserva',
        summary: `Tutto qui richiedeva un file, il che è una richiesta strana da fare a chi ha il Markdown negli appunti. Il convertitore ora accetta anche testo incollato oltre a un file rilasciato — per ogni conversione tranne Word, dove non c'è nulla da incollare — e ciò che torna è lo stesso documento, con la stessa anteprima, lo stesso download, salvataggio e condivisione.

E una pagina per l'altra domanda: \`/markdown-live-preview\` è Markdown a sinistra e il documento a destra, mentre lo digiti. Nulla viene caricato e nulla viene salvato; il testo resta nella scheda. È il convertitore sotto, quindi ciò che appare a destra è ciò che un file scaricato contiene.

Entrambi i riquadri prendono la propria altezza dalla finestra, quindi uno schermo alto è un editor alto, e c'è una modalità a schermo intero per quando non basta ancora. Il testo incollato sul convertitore arriva qui già reso, e \`Converti e mantieni\` lo rimanda nell'altra direzione — alla schermata del documento, con la cronologia, il link di condivisione e gli altri formati.`,
        description:
          'Incolla Markdown invece di rilasciare un file, oppure digitalo su /markdown-live-preview e guarda il documento apparire a fianco. Nulla viene caricato.',
        keywords:
          'anteprima markdown in tempo reale, incollare markdown e convertire, editor markdown con anteprima, anteprima markdown online, convertire testo incollato in html',
        body: `Dietro «convertire questo Markdown» si nascondono due compiti diversi. Uno è lavoro finito: un file esiste, e vuole l'altro formato. L'altro è lavoro in corso: sta scrivendo, e vuole vedere come appare. Una zona di rilascio risponde bene al primo e per nulla al secondo, ed è per questo che ora ci sono due risposte.

### Incollare invece di rilasciare

Sotto la zona di rilascio c'è un pulsante che apre un campo in cui incollare. Il testo diventa un file con l'estensione propria di quella conversione e segue esattamente il percorso che segue un file rilasciato — la stessa conversione, lo stesso limite di dimensione, la stessa anteprima, lo stesso download, salvataggio, condivisione e cronologia. Nel risultato non cambia nulla, perché nella meccanica non cambia nulla.

È disponibile per le conversioni la cui fonte è testo: Markdown → HTML, HTML → Markdown, testo semplice, CSV o TSV, e JSON. Sulle cinque la cui fonte può essere solo un file — Word, Excel, e gli export da Notion, Confluence e Obsidian — il pulsante è visibile ma disattivato, con il motivo indicato, perché da uno \`.zip\` non c'è davvero nulla da incollare. Un conteggio di caratteri nel campo indica dove sta il limite prima che lo indichi un rifiuto.

### L'altra domanda, alla sua propria pagina

\`/markdown-live-preview\` è Markdown a sinistra, il documento a destra, ridisegnato circa un quinto di secondo dopo che smetti di digitare. Entrambi i riquadri prendono la propria altezza dalla finestra, quindi uno schermo alto è un editor alto, e c'è una modalità a schermo intero per quando non basta.

Sotto è lo stesso convertitore — lo stesso motore di rendering, lo stesso sanificatore, gli stessi stili del documento — quindi ciò che vedi è ciò che un file scaricato contiene. Un'anteprima che fosse in disaccordo con il file sarebbe peggio di nessuna anteprima. Si apre con un breve esempio invece che con un campo vuoto, che chi arriva con il proprio testo non vede mai.

### Nulla lascia la scheda

L'anteprima in tempo reale non ha account, non ha cronologia e non ha rete. Il tuo testo non viene mai inviato da nessuna parte e non viene mai salvato; chiudere la scheda è il modo per eliminarlo. È anche ciò che permette alla pagina di funzionare con nient'altro che il bundle caricato.

### Tra le due

Si passano il lavoro a vicenda. Incolla Markdown nel convertitore e il pulsante a fianco ti porta all'anteprima in tempo reale con il tuo testo già dentro, invece che all'esempio. Scrivi qualcosa nell'anteprima in tempo reale e \`Converti e mantieni\` lo rimanda nell'altra direzione, al convertitore, dove vivono la cronologia, il link di condivisione e gli altri formati.

Da leggere: [convertire Markdown in HTML online](/blog/convert-markdown-to-html-online), e [editor Markdown che vale la pena usare](/blog/best-markdown-editors).`,
      },
    },
    body:
      'Everything here needed a file, which is an odd thing to ask of somebody holding the '
      + 'Markdown in their clipboard. The converter now takes pasted text as well as a dropped '
      + 'file — for every conversion except Word, where there is nothing to paste — and '
      + 'what comes back is the same document, with the same preview, download, save and share.\n\n'
      + 'And a page for the other question: `/markdown-live-preview` is Markdown on the left and '
      + 'the document on the right, as it is typed. Nothing is uploaded and nothing is saved; the '
      + 'text stays in the tab. It is the converter underneath, so what is on the right is what a '
      + 'downloaded file contains.\n\n'
      + 'Both panes take their height from the window, so a tall screen is a tall editor, and '
      + 'there is a fullscreen for when that is still not enough. Text pasted on the converter '
      + 'arrives here already rendered, and '
      + '`Convert and keep` sends it back the other way — to the document screen, with the '
      + 'history, the share link and the other formats.',
  },
  {
    date: '2026-09-11',
    title: 'Every conversion, everywhere it can go',
    slug: 'ten-conversions',
    detail: {
      en: {
        description:
          'The ten conversions TransformPipe runs, what each one is for, and which of them a script or an assistant can ask for instead of a browser.',
        keywords:
          'document converter formats, convert word to markdown, convert excel to markdown table, convert a notion export to markdown, markdown conversion api',
        body: `Ten conversions, each on its own page, each running in the browser:

- **Markdown → HTML** (\`/\`) — the document as a page, downloadable as one self-contained file.
- **HTML → Markdown** (\`/html-to-markdown\`) — a saved page or an export back to text, with the headings, links, lists and tables kept and the furniture dropped.
- **Word → Markdown** (\`/word-to-markdown\`) — a \`.docx\`: the structure comes across, the fonts and the margins do not.
- **Excel → Markdown table** (\`/excel-to-markdown\`) — an \`.xlsx\` sheet as a real table.
- **CSV → Markdown table** (\`/csv-to-markdown\`) — \`.csv\` or \`.tsv\`, with the header row as the header.
- **JSON → Markdown** (\`/json-to-markdown\`) — a list of records becomes a table, nested objects become headings, one value per line is understood too.
- **Plain text → Markdown** (\`/text-to-markdown\`) — a \`.txt\` read as text, so an asterisk somebody typed stays an asterisk.
- **Notion → Markdown** (\`/notion-to-markdown\`) — the whole export \`.zip\`, a section per page.
- **Confluence → Markdown** (\`/confluence-to-markdown\`) — a space export, the same way.
- **Obsidian → Markdown** (\`/obsidian-to-markdown\`) — a zipped vault, every note in order.

### One list, three ways in

The app, the API and the assistant connector read the same list of conversions, which is why a menu cannot offer something the dropzone refuses. \`POST /api/v1/documents?kind=<id>\` takes any of the ten by the id in its address. Through the connector, \`tp_convert_to_markdown\` takes HTML, CSV, TSV or JSON, and \`tp_save_document\` takes the same with \`from\`, so a stored document knows what it was made from — which is what the chips in the history and the badge on a row are reading.

### Why a Word file cannot come through an assistant

A tool call is JSON and a \`.docx\` is a zip of bytes. An assistant never holds the file, only the text somebody extracted from it, so there is nothing useful to pass. An HTTP request body does carry bytes, which makes the API the one place a file can go: send the \`.docx\` as the body with \`?kind=word-to-markdown\`, and the same for an \`.xlsx\` or any of the three \`.zip\` exports.

### What they all have in common

Every one of them ends in Markdown, because Markdown is what a document is stored as here — the rendering, the sharing, the API and the assistant tools all stand on that one shape. And every one of them runs on your machine: nothing is uploaded unless you save it, none of the ten needs an account, and the limit is the file size rather than a plan.

Related: [Markdown out of Notion, Obsidian and Confluence](/blog/markdown-from-notion-obsidian-and-confluence), and [converting documents with an API](/blog/converting-documents-with-an-api).`,
      },
      de: {
        title: 'Jede Konvertierung, überall wo sie möglich ist',
        summary: `Die App konvertierte fünf Dinge, die beiden anderen Wege hinein nicht: einem Assistenten ließ sich nur Markdown übergeben, und die API lehnte Word schlicht ab. Jetzt nimmt \`tp_convert_to_markdown\` über den Konnektor HTML, CSV, TSV oder JSON, und \`tp_save_document\` dasselbe mit \`from\`, sodass ein Dokument weiß, woraus es gemacht wurde. Und die API nimmt eine \`.docx\` als Anfragekörper — die eine Stelle, an die eine Word-Datei gehen kann, denn eine Datei sind Bytes und ein Werkzeugaufruf ist JSON.`,
        description:
          'Die zehn Konvertierungen von TransformPipe, wofür jede gedacht ist und welche davon ein Skript oder ein Assistent statt eines Browsers anfordern kann.',
        keywords:
          'dokumente konvertieren formate, word in markdown umwandeln, excel in markdown tabelle umwandeln, notion export in markdown, api zum konvertieren von dokumenten',
        body: `Zehn Konvertierungen, jede auf ihrer eigenen Seite, jede im Browser:

- **Markdown → HTML** (\`/\`) — das Dokument als Seite, herunterladbar als eine in sich geschlossene Datei.
- **HTML → Markdown** (\`/html-to-markdown\`) — eine gespeicherte Seite oder ein Export zurück zu Text: Überschriften, Links, Listen und Tabellen bleiben, das Mobiliar fällt weg.
- **Word → Markdown** (\`/word-to-markdown\`) — eine \`.docx\`: der Bau kommt mit, die Schriften und Ränder nicht.
- **Excel → Markdown-Tabelle** (\`/excel-to-markdown\`) — ein \`.xlsx\`-Blatt als echte Tabelle.
- **CSV → Markdown-Tabelle** (\`/csv-to-markdown\`) — \`.csv\` oder \`.tsv\`, mit der Kopfzeile als Kopfzeile.
- **JSON → Markdown** (\`/json-to-markdown\`) — eine Liste von Datensätzen wird eine Tabelle, verschachtelte Objekte werden Überschriften, ein Wert pro Zeile wird auch verstanden.
- **Reiner Text → Markdown** (\`/text-to-markdown\`) — eine \`.txt\` wird als Text gelesen, damit ein getipptes Sternchen ein Sternchen bleibt.
- **Notion → Markdown** (\`/notion-to-markdown\`) — die ganze Export-\`.zip\`, ein Abschnitt pro Seite.
- **Confluence → Markdown** (\`/confluence-to-markdown\`) — ein Space-Export, genauso.
- **Obsidian → Markdown** (\`/obsidian-to-markdown\`) — ein gepackter Tresor, jede Notiz in ihrer Reihenfolge.

### Eine Liste, drei Wege hinein

Die App, die API und der Konnektor für Assistenten lesen dieselbe Liste von Konvertierungen — deshalb kann ein Menü nichts anbieten, was die Ablagefläche ablehnt. \`POST /api/v1/documents?kind=<id>\` nimmt jede der zehn über die id in ihrer Adresse. Über den Konnektor nimmt \`tp_convert_to_markdown\` HTML, CSV, TSV oder JSON, und \`tp_save_document\` dasselbe mit \`from\`: ein abgelegtes Dokument weiß dann, woraus es gemacht wurde — genau das lesen die Filter in der Chronik und das Abzeichen an einer Zeile.

### Warum eine Word-Datei nicht durch einen Assistenten kommt

Ein Werkzeugaufruf ist JSON, eine \`.docx\` ist ein Zip aus Bytes. Ein Assistent hält nie die Datei, sondern nur den Text, den jemand daraus gezogen hat — es gibt also nichts Brauchbares zu übergeben. Ein HTTP-Anfragekörper trägt dagegen Bytes, und damit ist die API die eine Stelle, an die eine Datei gehen kann: die \`.docx\` als Körper mit \`?kind=word-to-markdown\`, und ebenso eine \`.xlsx\` oder eine der drei \`.zip\`-Exporte.

### Was allen gemeinsam ist

Jede endet in Markdown, denn Markdown ist hier die Form, in der ein Dokument liegt — die Darstellung, das Teilen, die API und die Werkzeuge für Assistenten stehen alle auf dieser einen Form. Und jede läuft auf Ihrem Rechner: hochgeladen wird nichts, solange Sie nicht speichern, keine der zehn braucht ein Konto, und die Grenze ist die Dateigröße und kein Tarif.

Weiter: [Markdown aus Notion, Obsidian und Confluence](/blog/markdown-from-notion-obsidian-and-confluence) und [Dokumente über eine API konvertieren](/blog/converting-documents-with-an-api).`,
      },
      fr: {
        title: 'Chaque conversion, partout où elle peut aller',
        summary: `L’application convertissait cinq choses, et les deux autres portes d’entrée ne le faisaient pas. On ne pouvait remettre à un assistant que du Markdown, et l’API refusait Word purement et simplement.

Désormais, \`tp_convert_to_markdown\` accepte HTML, CSV, TSV ou JSON via le connecteur, et \`tp_save_document\` accepte la même chose avec \`from\`, si bien qu’un document est enregistré en sachant à partir de quoi il a été fait. Et l’API accepte un \`.docx\` comme corps de requête — le seul endroit où un fichier Word peut aller, car un fichier est fait d’octets et un appel d’outil est du JSON : un assistant ne détient jamais le fichier, seulement le texte que quelqu’un en a extrait.`,
        description:
          'Les dix conversions que fait tourner TransformPipe, à quoi chacune sert, et lesquelles un script ou un assistant peut demander à la place d’un navigateur.',
        keywords:
          'formats de convertisseur de documents, convertir word en markdown, convertir excel en tableau markdown, convertir un export notion en markdown, api de conversion markdown',
        body: `Dix conversions, chacune sur sa page, chacune s’exécutant dans le navigateur :

- **Markdown → HTML** (\`/\`) — le document comme une page, téléchargeable en un seul fichier autonome.
- **HTML → Markdown** (\`/html-to-markdown\`) — une page enregistrée ou un export de retour vers le texte, avec les titres, liens, listes et tableaux conservés et le décor abandonné.
- **Word → Markdown** (\`/word-to-markdown\`) — un \`.docx\` : la structure passe, les polices et les marges non.
- **Excel → tableau Markdown** (\`/excel-to-markdown\`) — une feuille \`.xlsx\` en véritable tableau.
- **CSV → tableau Markdown** (\`/csv-to-markdown\`) — \`.csv\` ou \`.tsv\`, avec la ligne d’en-tête comme en-tête.
- **JSON → Markdown** (\`/json-to-markdown\`) — une liste d’enregistrements devient un tableau, les objets imbriqués deviennent des titres, une valeur par ligne est comprise aussi.
- **Texte brut → Markdown** (\`/text-to-markdown\`) — un \`.txt\` lu comme du texte, si bien qu’un astérisque tapé par quelqu’un reste un astérisque.
- **Notion → Markdown** (\`/notion-to-markdown\`) — tout l’export \`.zip\`, une section par page.
- **Confluence → Markdown** (\`/confluence-to-markdown\`) — un export d’espace, pareil.
- **Obsidian → Markdown** (\`/obsidian-to-markdown\`) — un coffre compressé, chaque note dans l’ordre.

### Une liste, trois portes d’entrée

L’application, l’API et le connecteur pour assistants lisent la même liste de conversions, c’est pourquoi un menu ne peut pas proposer ce que la zone de dépôt refuse. \`POST /api/v1/documents?kind=<id>\` accepte n’importe laquelle des dix via l’id dans son adresse. Via le connecteur, \`tp_convert_to_markdown\` accepte HTML, CSV, TSV ou JSON, et \`tp_save_document\` accepte la même chose avec \`from\`, si bien qu’un document enregistré sait à partir de quoi il a été fait — c’est ce que lisent les puces dans l’historique et le badge sur une ligne.

### Pourquoi un fichier Word ne peut pas passer par un assistant

Un appel d’outil est du JSON et un \`.docx\` est un zip d’octets. Un assistant ne détient jamais le fichier, seulement le texte que quelqu’un en a extrait, il n’y a donc rien d’utile à transmettre. Un corps de requête HTTP, lui, porte bien des octets, ce qui fait de l’API le seul endroit où un fichier peut aller : envoyez le \`.docx\` comme corps avec \`?kind=word-to-markdown\`, et de même pour un \`.xlsx\` ou l’un des trois exports \`.zip\`.

### Ce qu’elles ont toutes en commun

Chacune se termine en Markdown, car c’est sous cette forme qu’un document est stocké ici — le rendu, le partage, l’API et les outils pour assistants reposent tous sur cette même forme. Et chacune s’exécute sur votre machine : rien n’est téléversé sauf si vous enregistrez, aucune des dix ne nécessite de compte, et la limite est la taille du fichier plutôt qu’un forfait.

Autres lectures : [du Markdown à partir de Notion, Obsidian et Confluence](/blog/markdown-from-notion-obsidian-and-confluence), et [convertir des documents avec une API](/blog/converting-documents-with-an-api).`,
      },
      es: {
        title: 'Cada conversión, en todos los sitios donde puede llegar',
        summary: `La aplicación convertía cinco cosas, y las otras dos vías de entrada no. A un asistente solo se le podía entregar Markdown, y la API rechazaba Word sin más.

Ahora \`tp_convert_to_markdown\` acepta HTML, CSV, TSV o JSON a través del conector, y \`tp_save_document\` acepta lo mismo con \`from\`, de modo que un documento se guarda sabiendo de qué se hizo. Y la API acepta un \`.docx\` como cuerpo de la petición — el único lugar al que puede ir un archivo de Word, porque un archivo son bytes y una llamada de herramienta es JSON: un asistente nunca tiene el archivo, solo el texto que alguien extrajo de él.`,
        description:
          'Las diez conversiones que ejecuta TransformPipe, para qué sirve cada una, y cuáles puede pedir un script o un asistente en vez de un navegador.',
        keywords:
          'formatos de conversor de documentos, convertir word a markdown, convertir excel a tabla markdown, convertir una exportación de notion a markdown, api de conversión de markdown',
        body: `Diez conversiones, cada una en su propia página y ejecutándose en el navegador:

- **Markdown → HTML** (\`/\`) — el documento como página, descargable como un único archivo autónomo.
- **HTML → Markdown** (\`/html-to-markdown\`) — una página guardada o una exportación de vuelta a texto, conservando los encabezados, enlaces, listas y tablas y descartando el decorado.
- **Word → Markdown** (\`/word-to-markdown\`) — un \`.docx\`: la estructura se traslada, las fuentes y los márgenes no.
- **Excel → tabla Markdown** (\`/excel-to-markdown\`) — una hoja \`.xlsx\` como tabla real.
- **CSV → tabla Markdown** (\`/csv-to-markdown\`) — \`.csv\` o \`.tsv\`, con la fila de cabecera como encabezado.
- **JSON → Markdown** (\`/json-to-markdown\`) — una lista de registros se convierte en tabla, los objetos anidados se convierten en encabezados, y un valor por línea también se entiende.
- **Texto plano → Markdown** (\`/text-to-markdown\`) — un \`.txt\` leído como texto, de modo que un asterisco que alguien escribió sigue siendo un asterisco.
- **Notion → Markdown** (\`/notion-to-markdown\`) — el \`.zip\` completo de la exportación, una sección por página.
- **Confluence → Markdown** (\`/confluence-to-markdown\`) — una exportación de espacio, de la misma manera.
- **Obsidian → Markdown** (\`/obsidian-to-markdown\`) — un vault comprimido, cada nota en orden.

### Una lista, tres vías de entrada

La aplicación, la API y el conector para asistentes leen la misma lista de conversiones, por lo que un menú no puede ofrecer algo que la zona de soltar rechace. \`POST /api/v1/documents?kind=<id>\` acepta cualquiera de las diez mediante el id en su dirección. A través del conector, \`tp_convert_to_markdown\` acepta HTML, CSV, TSV o JSON, y \`tp_save_document\` acepta lo mismo con \`from\`, de modo que un documento guardado sabe de qué se hizo — que es justo lo que leen los chips del historial y la insignia de una fila.

### Por qué un archivo de Word no puede llegar a través de un asistente

Una llamada de herramienta es JSON y un \`.docx\` es un zip de bytes. Un asistente nunca tiene el archivo, solo el texto que alguien extrajo de él, así que no hay nada útil que pasar. El cuerpo de una petición HTTP sí lleva bytes, lo que convierte a la API en el único lugar al que puede ir un archivo: enviar el \`.docx\` como cuerpo con \`?kind=word-to-markdown\`, y lo mismo para un \`.xlsx\` o cualquiera de las tres exportaciones \`.zip\`.

### Qué tienen todas en común

Todas terminan en Markdown, porque Markdown es la forma en que aquí se guarda un documento — la presentación, la compartición, la API y las herramientas para asistentes se apoyan todas en esa misma forma. Y todas se ejecutan en tu propia máquina: no se sube nada a menos que se guarde, ninguna de las diez necesita una cuenta, y el límite es el tamaño, no un plan.

Relacionado: [Markdown a partir de Notion, Obsidian y Confluence](/blog/markdown-from-notion-obsidian-and-confluence) y [convertir documentos mediante una API](/blog/converting-documents-with-an-api).`,
      },
      it: {
        title: 'Ogni conversione, ovunque possa arrivare',
        summary: `L'app convertiva cinque cose, e gli altri due modi di accedere no. A un assistente si poteva consegnare solo Markdown, e l'API rifiutava Word senz'altro.

Ora \`tp_convert_to_markdown\` accetta HTML, CSV, TSV o JSON tramite il connettore, e \`tp_save_document\` accetta lo stesso con \`from\`, così un documento viene conservato sapendo da cosa è stato fatto. E l'API accetta una \`.docx\` come corpo della richiesta — l'unico punto in cui un file Word può arrivare, perché un file è byte e una chiamata a uno strumento è JSON: un assistente non ha mai il file, solo il testo che qualcuno ne ha estratto.`,
        description:
          'Le dieci conversioni che TransformPipe esegue, a cosa serve ciascuna, e quali di esse uno script o un assistente possono richiedere invece di un browser.',
        keywords:
          'formati convertitore di documenti, convertire word in markdown, convertire excel in tabella markdown, convertire un export di notion in markdown, api di conversione markdown',
        body: `Dieci conversioni, ciascuna sulla propria pagina, ciascuna in esecuzione nel browser:

- **Markdown → HTML** (\`/\`) — il documento come pagina, scaricabile come un unico file autonomo.
- **HTML → Markdown** (\`/html-to-markdown\`) — una pagina salvata o un export tornano a essere testo, con titoli, link, elenchi e tabelle conservati e l'arredo eliminato.
- **Word → Markdown** (\`/word-to-markdown\`) — una \`.docx\`: la struttura passa, i font e i margini no.
- **Excel → tabella Markdown** (\`/excel-to-markdown\`) — un foglio \`.xlsx\` come tabella vera.
- **CSV → tabella Markdown** (\`/csv-to-markdown\`) — \`.csv\` o \`.tsv\`, con la riga di intestazione come intestazione.
- **JSON → Markdown** (\`/json-to-markdown\`) — un elenco di record diventa una tabella, gli oggetti annidati diventano titoli, e anche un valore per riga viene compreso.
- **Testo semplice → Markdown** (\`/text-to-markdown\`) — un \`.txt\` letto come testo, così un asterisco digitato da qualcuno resta un asterisco.
- **Notion → Markdown** (\`/notion-to-markdown\`) — l'intero export \`.zip\`, una sezione per pagina.
- **Confluence → Markdown** (\`/confluence-to-markdown\`) — un export di uno spazio, allo stesso modo.
- **Obsidian → Markdown** (\`/obsidian-to-markdown\`) — un vault compresso, ogni nota in ordine.

### Un solo elenco, tre modi per entrare

L'app, l'API e il connettore per assistenti leggono lo stesso elenco di conversioni, ed è per questo che un menu non può offrire ciò che la zona di rilascio rifiuta. \`POST /api/v1/documents?kind=<id>\` accetta una qualunque delle dieci tramite l'id nel suo indirizzo. Tramite il connettore, \`tp_convert_to_markdown\` accetta HTML, CSV, TSV o JSON, e \`tp_save_document\` accetta lo stesso con \`from\`, così un documento conservato sa da cosa è stato fatto — è esattamente ciò che leggono i filtri nella cronologia e il badge su una riga.

### Perché un file Word non può passare attraverso un assistente

Una chiamata a uno strumento è JSON e una \`.docx\` è uno zip di byte. Un assistente non ha mai il file, solo il testo che qualcuno ne ha estratto, quindi non c'è nulla di utile da passare. Un corpo di richiesta HTTP invece porta byte, il che rende l'API l'unico punto in cui un file può arrivare: inviare la \`.docx\` come corpo con \`?kind=word-to-markdown\`, e lo stesso per una \`.xlsx\` o per uno qualsiasi dei tre export \`.zip\`.

### Cosa hanno tutte in comune

Ognuna finisce in Markdown, perché Markdown è la forma in cui un documento viene conservato qui — la resa, la condivisione, l'API e gli strumenti per assistenti si basano tutti su questa unica forma. E ognuna funziona sulla tua macchina: non viene caricato nulla finché non salvi, nessuna delle dieci richiede un account, e il limite è la dimensione del file e non un piano.

Da leggere: [Markdown da Notion, Obsidian e Confluence](/blog/markdown-from-notion-obsidian-and-confluence), e [convertire documenti con un'API](/blog/converting-documents-with-an-api).`,
      },
    },
    body:
      'The app converted five things and the other two ways in did not. An assistant could only '
      + 'be handed Markdown, and the API refused Word outright.\n\n'
      + 'Now `tp_convert_to_markdown` takes HTML, CSV, TSV or JSON through the connector, and '
      + '`tp_save_document` takes the same with `from`, so a document is stored knowing what it '
      + 'was made from. And the API accepts a `.docx` as the request body — the one place a Word '
      + 'file can go, because a file is bytes and a tool call is JSON: an assistant never holds '
      + 'the file, only the text somebody extracted from it.',
  },
  {
    date: '2026-09-11',
    title: 'The Connect button now connects',
    slug: 'connector-oauth',
    detail: {
      en: {
        description:
          'Connecting an assistant to TransformPipe is an OAuth 2.1 flow with PKCE: you approve a named client, and it walks away with a token for your documents only.',
        keywords:
          'connect claude to transformpipe, mcp connector oauth, mcp authorization pkce, revoke an assistant access, oauth 2.1 authorization server',
        body: `Approving an assistant is one page and one button, and this is what is behind them.

### What approving actually does

You sign in here with the account you already use, read a page that names the client and the address it is about to act as, and press **Connect**. What the client walks away with is a token issued by this site — not your session, not an API key. It reaches the documents on the account and nothing else: not the account, not the sign-in, not your API keys. A read-only connection cannot save, share or delete, and that is enforced on the credential rather than on the tools.

TransformPipe has to be its own authorization server for this: the MCP specification forbids a resource accepting a token issued by somebody else, so the sign-in session cannot simply be handed over.

### The order of events

1. The assistant POSTs \`/api/mcp\` with no token and gets a 401 naming where to look.
2. It reads \`/.well-known/oauth-protected-resource\`, then \`/.well-known/oauth-authorization-server\`, to find the endpoints.
3. It identifies itself — by a metadata document it publishes, or by registering here. No secret either way: a client running on somebody else's machine cannot keep one, which is what PKCE is for.
4. It sends you to \`/authorize\` with a challenge. \`code_challenge_method=S256\` is required; a plain challenge is refused outright.
5. You approve with a POST from the page you were shown, so a link on its own authorises nothing.
6. It exchanges the code and its verifier at \`/token\`.

### What the tokens do afterwards

A code lives five minutes and is burnt at the start of its exchange, before anything is checked against it, so a copy replayed while the first call is still in flight gets nothing. Refresh tokens rotate: handing one in revokes it and issues a fresh pair. Handing in one that has already been rotated ends the whole grant — the access token, the refresh token beside it and every rotation before them — because a refresh token presented twice is the only signal anyone gets that it has been copied.

Take it back from the account menu, under MCP connector; it stops working on the next call.

### Why the button had done nothing

Two headers on our own page. It asked browsers to send no referrer, and Chrome derives a form POST's \`Origin\` from that same setting, so the page's own submission arrived claiming to come from nowhere — and the check that stops another site approving things for you stopped the page itself. Behind that, the page's \`form-action\` named only this site, so the trip back to the assistant was refused by the policy after the code had already been minted. It now names the one address the request will actually be sent to, and nothing else.

Related: [converting documents from an assistant](/blog/converting-documents-from-an-assistant), and [whether an online converter is safe](/blog/is-an-online-converter-safe).`,
      },
      de: {
        title: 'Der Connect-Knopf verbindet jetzt',
        summary: `Einen Assistenten zu genehmigen tat nichts. Die Seite sagte, das Formular komme nicht von hier — und hatte auf falsche Weise recht: die Genehmigungsseite bat Browser, keinen Referrer zu senden, und Chrome leitet den Origin einer Seite aus derselben Einstellung ab. So kam das eigene Formular der Seite von nirgendwo, und die Prüfung, die andere Websites am Genehmigen hindert, hielt die Seite selbst auf. Verbunden worden war darüber noch nie etwas. Dahinter saß ein zweiter Fehler: die Seite darf den Browser nur zu dem Assistenten schicken, der gefragt hat — und sie nannte lange nur uns selbst, sodass die Rückreise von der Seite selbst abgelehnt wurde. Jetzt nennt sie genau diese eine Adresse.`,
        description:
          'Einen Assistenten zu verbinden ist ein OAuth-2.1-Fluss mit PKCE: Sie genehmigen einen benannten Client, und der erhält ein Token für Ihre Dokumente, sonst nichts.',
        keywords:
          'claude mit transformpipe verbinden, mcp konnektor oauth, mcp autorisierung pkce, zugriff eines assistenten entziehen, oauth 2.1 autorisierungsserver',
        body: `Einen Assistenten zu genehmigen ist eine Seite und ein Knopf. Das steht dahinter.

### Was das Genehmigen tatsächlich tut

Sie melden sich mit dem Konto an, das Sie ohnehin benutzen, lesen eine Seite, die den Client und die Adresse nennt, als die er handeln wird, und drücken **Connect**. Was er mitnimmt, ist ein Token dieser Website — nicht Ihre Sitzung und kein API-Schlüssel. Es erreicht die Dokumente des Kontos und nichts weiter: nicht das Konto, nicht die Anmeldung, nicht Ihre API-Schlüssel. Eine nur lesende Verbindung kann nicht speichern, teilen oder löschen — durchgesetzt an der Berechtigung, nicht an den Werkzeugen.

TransformPipe muss dafür sein eigener Autorisierungsserver sein: laut MCP-Spezifikation darf eine Ressource kein fremdes Token annehmen, die Anmeldesitzung lässt sich also nicht weitergeben.

### Die Reihenfolge der Ereignisse

1. Der Assistent schickt ein POST an \`/api/mcp\` ohne Token und bekommt eine 401, die sagt, wo nachzusehen ist.
2. Er liest \`/.well-known/oauth-protected-resource\`, dann \`/.well-known/oauth-authorization-server\`, um die Endpunkte zu finden.
3. Er sagt, wer er ist — über ein Metadatendokument, das er veröffentlicht, oder indem er sich hier registriert. Ein Geheimnis gibt es nie: ein Client auf dem Rechner eines anderen kann keines hüten, und genau dafür ist PKCE da.
4. Er schickt Sie mit einer Challenge an \`/authorize\`. \`code_challenge_method=S256\` ist Pflicht; eine einfache Challenge wird abgelehnt.
5. Sie genehmigen mit einem POST von der Seite, die Ihnen gezeigt wurde — ein Link allein genehmigt nichts.
6. Er tauscht Code und Verifier an \`/token\` ein.

### Was die Token danach tun

Ein Code lebt fünf Minuten und wird zu Beginn des Tauschs verbrannt, bevor etwas gegen ihn geprüft wird: eine Kopie, die während des ersten Aufrufs eintrifft, bekommt nichts. Refresh-Token rotieren — wer eines einreicht, entwertet es und erhält ein frisches Paar. Wer eines vorlegt, das schon rotiert wurde, beendet die ganze Berechtigung: Zugriffstoken, Refresh-Token und jede Rotation davor. Ein zweimal vorgelegtes Refresh-Token ist das einzige Zeichen dafür, dass es kopiert wurde.

Zurücknehmen können Sie das im Konto-Menü unter MCP-Konnektor; beim nächsten Aufruf ist Schluss.

### Warum der Knopf nie etwas getan hat

Zwei Kopfzeilen auf unserer eigenen Seite. Sie bat Browser, keinen Referrer zu senden, und Chrome leitet den \`Origin\` eines Formular-POSTs aus derselben Einstellung ab — das eigene Formular der Seite kam also von nirgendwo, und die Prüfung, die fremde Websites am Genehmigen hindert, hielt die Seite selbst auf. Dahinter nannte ihr \`form-action\` nur diese Website: die Rückreise zum Assistenten lehnte die Richtlinie ab, nachdem der Code längst erzeugt war. Jetzt steht dort nur die eine Adresse, an die die Anfrage geht.

Weiter: [Dokumente aus einem Assistenten heraus konvertieren](/blog/converting-documents-from-an-assistant) und [ob ein Online-Konverter sicher ist](/blog/is-an-online-converter-safe).`,
      },
      fr: {
        title: 'Le bouton Connecter connecte désormais',
        summary: `Approuver un assistant ne faisait rien. La page disait que le formulaire ne venait pas d’ici, et elle avait raison d’une façon qui était fausse : la page d’approbation demandait aux navigateurs de n’envoyer aucun référent, et Chrome déduit l’origine d’une page de ce même réglage — le formulaire de la page elle-même arrivait donc en prétendant venir de nulle part, et la vérification censée empêcher un autre site d’approuver des choses en votre nom arrêtait la page elle-même.

Rien n’avait jamais été connecté par ce biais. Les tests ne pouvaient pas le voir, car un test n’est pas un navigateur et envoie les en-têtes qu’on lui demande d’envoyer ; la base de données, elle, le pouvait, et le disait clairement : chaque requête affichée, aucune jamais approuvée.

Derrière cela se trouvait un second problème. La page indique au navigateur qu’il ne peut vous renvoyer qu’à l’assistant qui a demandé — et elle disait qu’elle ne pouvait vous renvoyer que vers nous-mêmes, si bien qu’approuver fonctionnait et que le retour vers l’assistant était refusé par la page elle-même. Elle ne nomme désormais plus que cette seule adresse.`,
        description:
          'Connecter un assistant à TransformPipe est un flux OAuth 2.1 avec PKCE : vous approuvez un client nommé, qui repart avec un jeton valable pour vos seuls documents.',
        keywords:
          'connecter claude à transformpipe, oauth du connecteur mcp, autorisation mcp avec pkce, révoquer l’accès d’un assistant, serveur d’autorisation oauth 2.1',
        body: `Approuver un assistant, c’est une page et un bouton — voici ce qu’il y a derrière.

### Ce que l’approbation fait réellement

Vous vous connectez ici avec votre compte, lisez une page qui nomme le client et l’adresse pour laquelle il va agir, et appuyez sur **Connecter**. Le client emporte un jeton émis par ce site — ni votre session, ni une clé API — qui n’atteint que les documents du compte, rien de plus : pas le compte, pas la connexion, pas vos clés API. Une connexion en lecture seule ne peut ni enregistrer, partager ni supprimer, imposé sur l’identifiant plutôt que sur les outils.

TransformPipe doit être son propre serveur d’autorisation pour cela : la spécification MCP interdit à une ressource d’accepter un jeton émis par quelqu’un d’autre, la session de connexion ne peut donc pas simplement être transmise.

### L’ordre des événements

1. L’assistant envoie un POST à \`/api/mcp\` sans jeton et reçoit un 401 indiquant où chercher.
2. Il lit \`/.well-known/oauth-protected-resource\`, puis \`/.well-known/oauth-authorization-server\`, pour trouver les points d’accès.
3. Il s’identifie — par un document de métadonnées publié, ou en s’enregistrant ici. Aucun secret dans les deux cas : un client sur la machine de quelqu’un d’autre ne peut en garder un, et c’est à cela que sert PKCE.
4. Il vous envoie vers \`/authorize\` avec un défi. \`code_challenge_method=S256\` est obligatoire ; un défi en clair est refusé net.
5. Vous approuvez par un POST depuis la page qui vous a été montrée, si bien qu’un simple lien n’autorise rien.
6. Il échange le code et son vérificateur à \`/token\`.

### Ce que font les jetons par la suite

Un code vit cinq minutes et est brûlé au début de l’échange, avant toute vérification, si bien qu’une copie rejouée pendant le premier appel n’obtient rien. Les jetons de rafraîchissement tournent : en remettre un le révoque et délivre une paire neuve. En remettre un déjà tourné met fin à toute l’autorisation — accès, rafraîchissement et toutes les rotations précédentes — car un jeton présenté deux fois est le seul signal qu’il a été copié.

Retirez-le depuis le menu du compte, sous connecteur MCP ; il cesse de marcher au prochain appel.

### Pourquoi le bouton n’avait jamais rien fait

Deux en-têtes sur notre page. Elle demandait aux navigateurs de n’envoyer aucun référent, et Chrome déduit l’\`Origin\` d’un POST de formulaire de ce même réglage : la soumission de la page arrivait donc en prétendant venir de nulle part, et la vérification censée empêcher un autre site d’approuver des choses en votre nom arrêtait la page elle-même. Derrière cela, le \`form-action\` ne nommait que ce site, si bien que le retour vers l’assistant était refusé après que le code avait déjà été émis. Elle ne nomme désormais que la seule adresse où la requête sera réellement envoyée.

Autres lectures : [convertir des documents depuis un assistant](/blog/converting-documents-from-an-assistant), et [un convertisseur en ligne est-il sûr](/blog/is-an-online-converter-safe).`,
      },
      es: {
        title: 'El botón Connect ya conecta',
        summary: `Aprobar un asistente no hacía nada. La página decía que el formulario no venía de aquí, y tenía razón de una manera que era errónea: la página de aprobación pedía a los navegadores que no enviaran referrer, y Chrome deriva el origen de una página de ese mismo ajuste — así que el propio formulario de la página llegaba afirmando venir de ningún sitio, y la comprobación que impide que otro sitio apruebe cosas en tu nombre detenía a la página misma.

Nunca se había conectado nada a través de él. Las pruebas no podían verlo, porque una prueba no es un navegador y envía las cabeceras que se le indican; la base de datos sí podía, y lo decía con toda claridad: todas las peticiones mostradas, ninguna jamás aprobada.

Detrás de eso había un segundo problema. La página le dice al navegador que solo puede enviarte al asistente que lo pidió — y venía diciendo que no podía enviarte a ningún sitio salvo de vuelta a nosotros, así que aprobar funcionaba y el viaje de regreso al asistente era rechazado por la propia página. Ahora nombra esa única dirección, y nada más.`,
        description:
          'Conectar un asistente a TransformPipe es un flujo OAuth 2.1 con PKCE: apruebas un cliente identificado, y este se lleva un token solo para tus documentos.',
        keywords:
          'conectar claude con transformpipe, oauth del conector mcp, autorización mcp con pkce, revocar el acceso de un asistente, servidor de autorización oauth 2.1',
        body: `Aprobar un asistente es una página y un botón, y esto es lo que hay detrás de ellos.

### Qué hace en realidad aprobar

Inicias sesión aquí con la cuenta que ya usas, lees una página que nombra al cliente y la dirección con la que va a actuar, y pulsas **Connect**. Lo que el cliente se lleva es un token emitido por este sitio — no tu sesión, ni una clave de API. Alcanza los documentos de la cuenta y nada más: ni la cuenta, ni el inicio de sesión, ni tus claves de API. Una conexión de solo lectura no puede guardar, compartir ni eliminar, y eso se hace cumplir sobre la credencial y no sobre las herramientas.

Para esto, TransformPipe tiene que ser su propio servidor de autorización: la especificación de MCP prohíbe que un recurso acepte un token emitido por otro, así que la sesión de inicio de sesión no se puede entregar sin más.

### El orden de los eventos

1. El asistente envía un POST a \`/api/mcp\` sin token y recibe un 401 que indica dónde mirar.
2. Lee \`/.well-known/oauth-protected-resource\`, y luego \`/.well-known/oauth-authorization-server\`, para encontrar los endpoints.
3. Se identifica — mediante un documento de metadatos que publica, o registrándose aquí. Ningún secreto en ningún caso: un cliente que corre en la máquina de otra persona no puede guardar uno, y para eso está PKCE.
4. Te envía a \`/authorize\` con un desafío. \`code_challenge_method=S256\` es obligatorio; un desafío simple se rechaza directamente.
5. Apruebas con un POST desde la página que se te mostró, así que un enlace por sí solo no autoriza nada.
6. Intercambia el código y su verificador en \`/token\`.

### Qué hacen los tokens después

Un código vive cinco minutos y se consume al empezar su intercambio, antes de comprobar nada contra él: una copia repetida mientras la primera llamada sigue en curso no obtiene nada. Los refresh tokens rotan: entregar uno lo revoca y emite un par nuevo. Entregar uno ya rotado termina toda la concesión — el token de acceso, el refresh token y cada rotación anterior — porque presentarlo dos veces es la única señal de que se ha copiado.

Se puede retirar desde el menú de la cuenta, en Conector MCP; deja de funcionar en la siguiente llamada.

### Por qué el botón no había hecho nada

Dos cabeceras en nuestra propia página. Pedía a los navegadores que no enviaran referrer, y Chrome deriva de ese mismo ajuste el Origin del POST de un formulario — así que el propio formulario llegaba afirmando venir de ningún sitio, y la comprobación que impide que otro sitio apruebe cosas en tu nombre detenía a la página misma. Detrás, el \`form-action\` nombraba solo este sitio, así que la vuelta al asistente era rechazada por la política tras acuñarse el código. Ahora nombra la única dirección a la que la petición se enviará, y nada más.

Relacionado: [convertir documentos desde un asistente](/blog/converting-documents-from-an-assistant) y [si un conversor en línea es seguro](/blog/is-an-online-converter-safe).`,
      },
      it: {
        title: 'Il pulsante Connect ora connette davvero',
        summary: `Approvare un assistente non faceva nulla. La pagina diceva che il modulo non veniva da qui, e aveva ragione in un modo che era sbagliato: la pagina di approvazione chiedeva ai browser di non inviare un referrer, e Chrome deriva l'origine di una pagina dalla stessa impostazione — così il modulo della pagina stessa arrivava dichiarando di venire da nessun posto, e il controllo che impedisce a un altro sito di approvare cose per te bloccava la pagina stessa.

Nulla era mai stato connesso tramite di essa. I test non potevano vederlo, perché un test non è un browser e invia qualunque intestazione gli venga detto di inviare; il database sì, e lo diceva chiaramente: ogni richiesta mostrata, nessuna mai approvata.

Dietro a questo ce n'era un secondo. La pagina dice al browser che può inviarti solo verso l'assistente che ha fatto la richiesta — e diceva invece che poteva inviarti solo di nuovo verso di noi, così l'approvazione funzionava e il ritorno verso l'assistente veniva rifiutato dalla pagina stessa. Ora nomina quell'unico indirizzo, e nulla altro.`,
        description:
          'Connettere un assistente a TransformPipe è un flusso OAuth 2.1 con PKCE: approvi un client, e questo riceve un token valido solo per i tuoi documenti.',
        keywords:
          'connettere claude a transformpipe, oauth del connettore mcp, autorizzazione mcp con pkce, revocare l\'accesso di un assistente, server di autorizzazione oauth 2.1',
        body: `Approvare un assistente è una pagina e un pulsante: questo sta dietro.

### Cosa fa davvero l'approvazione

Accedi qui con l'account che usi già, leggi una pagina che nomina il client e l'indirizzo per cui sta per agire, e premi **Connect**. Ciò che il client riceve è un token emesso da questo sito — non la tua sessione, non una chiave API. Raggiunge i documenti dell'account e nulla altro: non l'account, non l'accesso, non le tue chiavi API. Una connessione di sola lettura non può salvare, condividere o eliminare, e questo è imposto sulla credenziale, non sugli strumenti.

TransformPipe deve essere il proprio server di autorizzazione per questo: la specifica MCP proibisce a una risorsa di accettare un token emesso da qualcun altro, quindi la sessione di accesso non può semplicemente essere consegnata.

### L'ordine degli eventi

1. L'assistente invia un POST a \`/api/mcp\` senza token e riceve un 401 che indica dove guardare.
2. Legge \`/.well-known/oauth-protected-resource\`, poi \`/.well-known/oauth-authorization-server\`, per trovare gli endpoint.
3. Si identifica — con un documento di metadati che pubblica, oppure registrandosi qui. Nessun segreto in entrambi i casi: un client in esecuzione sulla macchina di qualcun altro non può custodirne uno, ed è esattamente per questo che esiste PKCE.
4. Ti invia a \`/authorize\` con una challenge. \`code_challenge_method=S256\` è obbligatorio; una challenge semplice viene rifiutata senz'altro.
5. Tu approvi con un POST dalla pagina che ti è stata mostrata, così un link da solo non autorizza nulla.
6. Scambia il codice e il suo verifier su \`/token\`.

### Cosa fanno i token in seguito

Un codice vive cinque minuti e viene bruciato all'inizio del suo scambio, prima di qualunque verifica, così una copia riproposta durante la prima chiamata non ottiene nulla. I refresh token ruotano: consegnarne uno lo revoca ed emette una nuova coppia. Consegnarne uno già ruotato termina l'intera concessione — token di accesso, refresh token e ogni rotazione precedente — perché un refresh token presentato due volte è l'unico segnale che sia stato copiato.

Lo revochi dal menu dell'account, sotto Connettore MCP; smette di funzionare alla chiamata successiva.

### Perché il pulsante non aveva fatto nulla

Due intestazioni sulla nostra pagina. Chiedeva ai browser di non inviare un referrer, e Chrome deriva l'\`Origin\` di un POST da quella stessa impostazione, così il modulo della pagina arrivava dichiarando di venire da nessun posto — e il controllo che blocca un altro sito dall'approvare cose per te bloccava la pagina stessa. Dietro a questo, la \`form-action\` nominava solo questo sito, quindi il ritorno verso l'assistente era rifiutato dopo che il codice era già stato coniato. Ora nomina l'unico indirizzo a cui la richiesta verrà inviata, e nulla altro.

Da leggere: [convertire documenti da un assistente](/blog/converting-documents-from-an-assistant), e [se un convertitore online è sicuro](/blog/is-an-online-converter-safe).`,
      },
    },
    body:
      'Approving an assistant did nothing. The page said the form had not come from here, and it '
      + 'was right in a way that was wrong: the approval page asked browsers not to send a '
      + 'referrer, and Chrome takes a page’s origin off the same setting — so the page’s own '
      + 'form arrived claiming to come from nowhere, and the check that stops another site '
      + 'approving things for you stopped the page itself.\n\n'
      + 'Nothing had ever been connected through it. The tests could not see this, because a test '
      + 'is not a browser and sends whichever headers it is told to; the database could, and said '
      + 'so plainly: every request shown, none ever approved.\n\n'
      + 'Behind that sat a second one. The page tells the browser it may only send you to the '
      + 'assistant that asked — and it had been saying it may send you nowhere but back to '
      + 'us, so approving worked and the trip back to the assistant was refused by the page '
      + 'itself. It now names that one address, and nothing else.',
  },
  {
    date: '2026-09-11',
    title: 'An assistant can say who it is without registering',
    slug: 'client-id-metadata',
    detail: {
      en: {
        description:
          'A client can identify itself with a Client ID Metadata Document — an https address it publishes — instead of registering a fresh client on every connection.',
        keywords:
          'client id metadata document, mcp client registration, dynamic client registration alternative, connect an assistant without registering, oauth client identity url',
        body: `There are three ways a client can tell an authorization server who it is: register itself, be configured by hand, or publish a document at an address and use that address as its name. This server now reads the third.

### What a metadata document is

Its \`client_id\` is an https URL. The document at that URL says what the client is called, where it may be sent back to, and optionally what it is asking for. The server fetches it while you are authorizing rather than keeping a registration of its own. It is \`draft-ietf-oauth-client-id-metadata-document-00\`, as the MCP authorization spec of 2025-11-25 profiles it, and Claude prefers it as soon as a server says it is supported.

### What it replaces

Dynamic client registration (RFC 7591) mints a client here on every connection. Reconnecting the same assistant made another one, so the table held five rows all called "Claude" — none of which could be told from the others, or from a stranger who had registered under the same name. A published document has one address, and the address is the identity: what it says can change, what it is cannot. Registration still works, because clients that only do that exist.

### What the server will and will not fetch

A \`client_id\` here is a URL handed over by a stranger and then fetched by our server, which is a request forgery waiting to be written badly. So: https only; a path, because a bare origin identifies a host rather than a client and anyone who can serve a file at a domain root would otherwise speak for the whole domain; no fragment and no credentials; the URL in canonical form, and repeated inside the document it names. Redirects are not followed, the address is resolved and refused if it is private, there is a timeout inside the one the client gives the whole endpoint, a 64 KB cap, and the body has to be JSON before it is parsed. Answers are held for an hour at most and failures for a minute, so a \`client_id\` that 404s does not turn every press of the button into another fetch.

### What the approval page says about it

Where the client's description was published, and that it was read just now. And a warning when every address it may be sent back to is a program on your own machine: the document is published by the real client, but binding a port is all it takes to catch the code that comes back, and no page can tell two programs on your computer apart. That one is yours to judge.

Related: [converting documents from an assistant](/blog/converting-documents-from-an-assistant), and [converting documents with an API](/blog/converting-documents-with-an-api).`,
      },
      de: {
        title: 'Ein Assistent kann sagen, wer er ist, ohne sich zu registrieren',
        summary: `Einen Assistenten zu verbinden bedeutete bisher, dass er sich hier zuerst registriert — und Claude legte bei jeder Verbindung einen neuen Client an. Er kann sich jetzt stattdessen über ein Metadatendokument ausweisen: eine Adresse, die er veröffentlicht und die dieser Server liest, so wie es die MCP-Spezifikation vorzieht. Für Clients, die das nicht können, funktioniert die Registrierung weiterhin. Die Genehmigungsseite sagt nun dazu, wo die Beschreibung eines Clients veröffentlicht ist, und warnt, wenn er nur an ein Programm auf Ihrem eigenen Rechner zurückgeschickt werden kann — denn dort kann jedes Programm darum bitten.`,
        description:
          'Ein Client kann sich mit einem Client ID Metadata Document ausweisen — einer Adresse, die er veröffentlicht — statt sich bei jeder Verbindung neu zu registrieren.',
        keywords:
          'client id metadata document, mcp client registrierung, dynamische client registrierung alternative, assistent ohne registrierung verbinden, oauth client identität url',
        body: `Ein Client kann einem Autorisierungsserver auf drei Wegen sagen, wer er ist: sich registrieren, von Hand eingetragen werden, oder ein Dokument unter einer Adresse veröffentlichen und diese Adresse als Namen benutzen. Den dritten liest dieser Server jetzt.

### Was ein Metadatendokument ist

Seine \`client_id\` ist eine https-URL. Das Dokument unter dieser URL sagt, wie der Client heißt, wohin er zurückgeschickt werden darf und wahlweise, worum er bittet. Der Server holt es während Ihrer Autorisierung, statt eine eigene Registrierung zu führen. Es ist \`draft-ietf-oauth-client-id-metadata-document-00\` in der Fassung, die die MCP-Autorisierungsspezifikation vom 25.11.2025 daraus macht, und Claude bevorzugt es, sobald ein Server sagt, dass er es unterstützt.

### Was es ersetzt

Die dynamische Client-Registrierung (RFC 7591) legt hier bei jeder Verbindung einen Client an. Denselben Assistenten erneut zu verbinden ergab einen weiteren, und so standen fünf Zeilen in der Tabelle, alle „Claude" — keine davon von den anderen zu unterscheiden, und auch nicht von einem Fremden, der sich unter demselben Namen registriert hätte. Ein veröffentlichtes Dokument hat eine Adresse, und die Adresse ist die Identität: was es sagt, kann sich ändern, was es ist, nicht. Die Registrierung funktioniert weiterhin, denn es gibt Clients, die nur das können.

### Was der Server holt und was nicht

Eine \`client_id\` ist hier eine URL, die ein Fremder übergibt und unser Server dann abruft — eine Server-Side Request Forgery, die nur darauf wartet, schlecht geschrieben zu werden. Also: nur https; ein Pfad, denn ein nackter Origin bezeichnet einen Host und keinen Client, und sonst spräche jeder, der eine Datei im Wurzelverzeichnis einer Domain ablegen kann, für die ganze Domain; kein Fragment und keine Zugangsdaten; die URL in kanonischer Form und im Dokument selbst wiederholt. Weiterleitungen werden nicht gefolgt, die Adresse wird aufgelöst und abgelehnt, wenn sie privat ist, es gibt eine eigene Zeitgrenze innerhalb der, die der Client dem ganzen Endpunkt gibt, eine Obergrenze von 64 KB, und der Körper muss JSON sein, bevor er gelesen wird. Antworten werden höchstens eine Stunde gehalten, Fehlschläge eine Minute — eine \`client_id\`, die mit 404 antwortet, macht so nicht aus jedem Knopfdruck einen neuen Abruf.

### Was die Genehmigungsseite dazu sagt

Wo die Beschreibung des Clients veröffentlicht ist, und dass sie gerade eben gelesen wurde. Und eine Warnung, wenn jede Adresse, an die er zurückgeschickt werden darf, ein Programm auf Ihrem eigenen Rechner ist: das Dokument veröffentlicht der echte Client, aber um den zurückkommenden Code zu fangen, genügt es, einen Port zu belegen, und keine Seite kann zwei Programme auf Ihrem Rechner auseinanderhalten. Das zu beurteilen bleibt Ihnen.

Weiter: [Dokumente aus einem Assistenten heraus konvertieren](/blog/converting-documents-from-an-assistant) und [Dokumente über eine API konvertieren](/blog/converting-documents-with-an-api).`,
      },
      fr: {
        title: 'Un assistant peut dire qui il est sans s’enregistrer',
        summary: `Connecter un assistant supposait qu’il s’enregistre d’abord ici, et Claude fabriquait un nouveau client à chaque connexion. Il peut désormais s’identifier par un document de métadonnées — une adresse qu’il publie et que ce serveur lit —, ce que la spécification MCP préfère. L’enregistrement continue de servir aux clients qui ne savent rien faire d’autre.

La page d’approbation a changé avec lui. Elle indique maintenant où la description d’un client est publiée, et avertit lorsque le seul endroit où il peut vous renvoyer est un programme installé sur votre propre ordinateur, car tout ce qui tourne là peut demander la même chose.`,
        description:
          'Un client peut s’identifier par un Client ID Metadata Document — une adresse https qu’il publie — au lieu de s’enregistrer à nouveau à chaque connexion.',
        keywords:
          'client id metadata document, enregistrement d’un client mcp, connecter un assistant sans enregistrement, alternative à l’enregistrement dynamique de client, identité du client oauth par url',
        body: `Un client dispose de trois moyens de dire à un serveur d’autorisation qui il est : s’enregistrer, être inscrit à la main, ou publier un document à une adresse et se servir de cette adresse comme nom. Ce serveur lit désormais le troisième.

### Ce qu’est un document de métadonnées

Son \`client_id\` est une URL https. Le document qui se trouve à cette adresse dit comment le client s’appelle, où il peut être renvoyé et, s’il le souhaite, ce qu’il demande. Le serveur va le chercher pendant que vous autorisez, au lieu de tenir un enregistrement à lui. C’est \`draft-ietf-oauth-client-id-metadata-document-00\` dans la lecture qu’en fait la spécification d’autorisation MCP du 25 novembre 2025, et Claude le préfère dès qu’un serveur annonce le prendre en charge.

### Ce qu’il remplace

L’enregistrement dynamique de client (RFC 7591) fabrique ici un client à chaque connexion. Reconnecter le même assistant en produisait un autre, si bien que la table portait cinq lignes nommées « Claude » — impossibles à distinguer les unes des autres, et d’un inconnu enregistré sous le même nom. Un document publié a une adresse, et l’adresse est l’identité : ce qu’il dit peut changer, ce qu’il est, non. L’enregistrement continue de fonctionner, car il existe des clients qui ne savent faire que cela.

### Ce que le serveur va chercher, et ce qu’il refuse

Ici, un \`client_id\` est une URL remise par un inconnu puis appelée par notre serveur : une falsification de requête côté serveur qui n’attend qu’une écriture négligente. Donc : https uniquement ; un chemin, car une origine nue désigne un hôte et non un client, et quiconque peut déposer un fichier à la racine d’un domaine parlerait sinon pour le domaine entier ; ni fragment ni identifiants ; l’URL sous forme canonique, et répétée à l’intérieur du document qu’elle nomme. Les redirections ne sont pas suivies, l’adresse est résolue puis refusée si elle est privée, un délai propre tient dans celui que le client accorde à l’ensemble, la taille est plafonnée à 64 KB, et le corps doit être du JSON avant d’être lu. Les réponses sont gardées une heure au plus et les échecs une minute : un \`client_id\` qui répond 404 ne transforme pas chaque appui sur le bouton en nouvel appel.

### Ce que la page d’approbation en dit

Où la description du client est publiée, et qu’elle vient d’être lue. Et un avertissement lorsque toutes les adresses de retour possibles sont des programmes installés sur votre propre machine : le document est publié par le vrai client, mais ouvrir un port suffit à intercepter le code qui revient, et aucune page ne peut distinguer deux programmes de votre ordinateur. Ce jugement-là vous revient.

Autres lectures : [convertir des documents depuis un assistant](/blog/converting-documents-from-an-assistant) et [convertir des documents avec une API](/blog/converting-documents-with-an-api).`,
      },
      es: {
        title: 'Un asistente puede decir quién es sin registrarse',
        summary: `Conectar un asistente exigía que antes se registrara aquí, y Claude creaba un cliente nuevo cada vez que alguien se conectaba. Ahora puede identificarse con un documento de metadatos — una dirección que él mismo publica y que este servidor lee —, que es lo que prefiere la especificación de MCP. El registro sigue disponible para los clientes que no saben hacer otra cosa.

La página de aprobación cambió con ello. Ahora dice dónde está publicada la descripción de un cliente y avisa cuando el único sitio al que puede devolverte es un programa de tu propio ordenador, porque cualquier cosa que se ejecute allí puede pedir lo mismo.`,
        description:
          'Un cliente puede identificarse con un Client ID Metadata Document — una dirección https que publica — en lugar de registrarse de nuevo en cada conexión.',
        keywords:
          'client id metadata document, registro de cliente mcp, conectar un asistente sin registrarlo, alternativa al registro dinámico de clientes, identidad de cliente oauth por url',
        body: `Un cliente tiene tres maneras de decirle a un servidor de autorización quién es: registrarse, quedar anotado a mano, o publicar un documento en una dirección y usar esa dirección como nombre. Este servidor lee ya la tercera.

### Qué es un documento de metadatos

Su \`client_id\` es una URL https. El documento que hay en esa dirección dice cómo se llama el cliente, adónde se le puede devolver y, si quiere, qué está pidiendo. El servidor lo recoge mientras autorizas, en vez de llevar un registro propio. Es \`draft-ietf-oauth-client-id-metadata-document-00\` tal como lo perfila la especificación de autorización de MCP del 25 de noviembre de 2025, y Claude lo prefiere en cuanto un servidor dice admitirlo.

### Qué sustituye

El registro dinámico de clientes (RFC 7591) crea aquí un cliente en cada conexión. Volver a conectar el mismo asistente producía otro más, de modo que la tabla acumulaba cinco filas llamadas «Claude», imposibles de distinguir entre sí o de un desconocido registrado con ese mismo nombre. Un documento publicado tiene una dirección, y la dirección es la identidad: lo que dice puede cambiar, lo que es no. El registro sigue funcionando, porque existen clientes que solo saben hacer eso.

### Qué recoge el servidor y qué no

Aquí un \`client_id\` es una URL que entrega un desconocido y que después pide nuestro servidor: una falsificación de peticiones del lado del servidor esperando a estar mal escrita. Así que: solo https; con ruta, porque un origen desnudo identifica a un anfitrión y no a un cliente, y quien pueda dejar un archivo en la raíz de un dominio hablaría si no por el dominio entero; sin fragmento y sin credenciales; la URL en forma canónica y repetida dentro del documento que nombra. No se siguen redirecciones, la dirección se resuelve y se rechaza si es privada, hay un plazo propio dentro del que el cliente concede a todo el extremo, un tope de 64 KB, y el cuerpo debe ser JSON antes de leerse. Las respuestas se guardan una hora como mucho y los fallos un minuto: un \`client_id\` que responde 404 no convierte cada pulsación del botón en otra petición.

### Qué dice de ello la página de aprobación

Dónde está publicada la descripción del cliente, y que acaba de leerse. Y un aviso cuando todas las direcciones a las que puede devolverte son programas de tu propia máquina: el documento lo publica el cliente auténtico, pero basta con ocupar un puerto para atrapar el código que vuelve, y ninguna página puede distinguir dos programas de tu ordenador. Ese juicio queda de tu parte.

Relacionado: [convertir documentos desde un asistente](/blog/converting-documents-from-an-assistant) y [convertir documentos con una API](/blog/converting-documents-with-an-api).`,
      },
      it: {
        title: 'Un assistente può dire chi è senza registrarsi',
        summary: `Collegare un assistente voleva dire che prima si registrava qui, e Claude creava un client nuovo a ogni connessione. Ora può invece identificarsi con un documento di metadati — un indirizzo che pubblica e che questo server legge —, che è quanto preferisce la specifica MCP. La registrazione resta a disposizione dei client che non sanno fare altro.

La pagina di approvazione è cambiata con lui. Ora dice dove è pubblicata la descrizione di un client e avverte quando l’unico posto a cui il client può rimandarti è un programma sul tuo computer, perché qualunque cosa giri lì può chiedere altrettanto.`,
        description:
          'Un client può identificarsi con un Client ID Metadata Document — un indirizzo https che pubblica — invece di registrarsi da capo a ogni connessione.',
        keywords:
          'client id metadata document, registrazione client mcp, collegare un assistente senza registrarlo, alternativa alla registrazione dinamica dei client, identità del client oauth tramite url',
        body: `Un client ha tre modi di dire a un server di autorizzazione chi è: registrarsi, essere inserito a mano, oppure pubblicare un documento a un indirizzo e usare quell’indirizzo come nome. Questo server legge ora il terzo.

### Che cos’è un documento di metadati

Il suo \`client_id\` è una URL https. Il documento a quell’indirizzo dice come si chiama il client, dove può essere rimandato e, volendo, che cosa sta chiedendo. Il server lo recupera mentre autorizzi, invece di tenere una registrazione propria. È \`draft-ietf-oauth-client-id-metadata-document-00\` nella forma che ne dà la specifica di autorizzazione MCP del 25 novembre 2025, e Claude lo preferisce appena un server dichiara di sostenerlo.

### Che cosa sostituisce

La registrazione dinamica dei client (RFC 7591) crea qui un client a ogni connessione. Ricollegare lo stesso assistente ne produceva un altro, così la tabella teneva cinque righe chiamate «Claude» — indistinguibili fra loro, e da un estraneo registrato con lo stesso nome. Un documento pubblicato ha un indirizzo, e l’indirizzo è l’identità: quello che dice può cambiare, quello che è no. La registrazione continua a funzionare, perché esistono client che sanno fare solo quella.

### Che cosa il server recupera e che cosa no

Qui un \`client_id\` è una URL consegnata da un estraneo e poi richiesta dal nostro server: una falsificazione di richieste lato server che aspetta solo di essere scritta male. Quindi: solo https; con un percorso, perché un’origine nuda indica un host e non un client, e altrimenti chiunque possa mettere un file alla radice di un dominio parlerebbe per l’intero dominio; nessun frammento e nessuna credenziale; la URL in forma canonica, e ripetuta dentro il documento che nomina. I reindirizzamenti non si seguono, l’indirizzo viene risolto e rifiutato se è privato, c’è un tempo massimo proprio dentro quello che il client concede all’endpoint, un tetto di 64 KB, e il corpo deve essere JSON prima di essere letto. Le risposte si tengono al più un’ora e gli errori un minuto: un \`client_id\` che risponde 404 non trasforma ogni pressione del pulsante in un’altra richiesta.

### Che cosa ne dice la pagina di approvazione

Dove è pubblicata la descrizione del client, e che è stata letta poco fa. E un avviso quando l’unico indirizzo a cui il client può rimandarti è un programma sul tuo computer: il documento lo pubblica il client vero, ma per intercettare il codice che torna basta occupare una porta, e nessuna pagina sa distinguere due programmi sul tuo computer. Quel giudizio resta a te.

Da leggere: [convertire documenti da un assistente](/blog/converting-documents-from-an-assistant) e [convertire documenti con un’API](/blog/converting-documents-with-an-api).`,
      },
    },
    body:
      'Connecting an assistant used to mean it registered itself here first, and Claude made a '
      + 'new client every time somebody connected. It can now identify itself with a metadata '
      + 'document instead — an address it publishes, which this server reads — which is '
      + 'what the MCP specification prefers. Registration still works for clients that do not.\n\n'
      + 'The approval page changed with it. It now says where a client’s description was '
      + 'published, and warns when the only place it can be sent back to is a program on your own '
      + 'computer, because anything running there can ask to be sent there too.',
  },
  {
    date: '2026-09-10',
    title: 'This page',
    slug: 'the-changelog',
    detail: {
      en: {
        description:
          'What the TransformPipe changelog lists and what it deliberately leaves out: changes you would notice, one typed list, and entries written in English.',
        keywords:
          'transformpipe changelog, what has shipped, markdown converter release notes, product updates and changes',
        body: `A changelog is only useful if you can trust what is not in it, so this says what gets an entry.

### What does

Anything a person using TransformPipe would notice: a conversion that did not exist before, a new page, another way to sign in, a limit that moved, a bug that was visibly wrong. A tagged release carries its version number; most of what has shipped went out between tags and carries none, which is why the list is longer than the list of releases.

### What does not

Refactors, dependency bumps, build and infrastructure work — anything invisible from outside. The note at the top of the page says so, which is the reason to keep it true: an entry about a moved file would make that note a lie, and a changelog you have to filter is one you stop reading.

### One list, several places

Every entry comes off a single typed list in the repository. The page, the five prerendered languages, the \`lastmod\` in the sitemap and the handful of entries with pages of their own all read it — there is no second file to keep in step and none to forget. The bodies are Markdown, rendered by the product's own converter: a release note that breaks the renderer would break a customer's document too, and this is a better place to find that out.

### English, deliberately

The chrome is translated — the heading, the lede, the panel, and the dates and month names, which \`Intl\` renders in your language. The entries themselves are not. Five translations per entry, per release, forever is a cost that gets skipped after the second release, and a changelog with three languages missing is worse than one that is honestly English. Where an entry has earned a page of its own, that page can be translated, because there are a handful of those rather than one per release.

Related: [release notes from Markdown](/blog/release-notes-from-markdown), and [documentation that lives in the repo](/blog/documentation-that-lives-in-the-repo).`,
      },
      de: {
        title: 'Diese Seite',
        summary: `Ein Changelog, unter \`/changelog\` und aus der Fußzeile verlinkt. Jedes Release und dazwischen die Änderungen, die es wert sind, genannt zu werden — gelesen aus einer einzigen typisierten Liste und dargestellt von dem Konverter, den das Produkt verkauft.`,
        description:
          'Was das Changelog von TransformPipe aufführt und was absichtlich fehlt: sichtbare Änderungen, eine einzige Liste, und Einträge auf Englisch.',
        keywords:
          'transformpipe changelog, was wurde veröffentlicht, release notes markdown konverter, produktänderungen übersicht',
        body: `Ein Changelog ist nur dann brauchbar, wenn man dem trauen kann, was nicht darin steht. Also: was einen Eintrag bekommt.

### Was hineingehört

Alles, was jemand bemerkt, der TransformPipe benutzt: eine Konvertierung, die es vorher nicht gab, eine neue Seite, ein weiterer Weg zur Anmeldung, eine verschobene Grenze, ein Fehler, der sichtbar falsch war. Ein getaggtes Release trägt seine Versionsnummer; das meiste ging zwischen den Tags hinaus und trägt keine — deshalb ist die Liste länger als die Liste der Releases.

### Was nicht

Umbauten im Code, Abhängigkeiten, Build- und Infrastrukturarbeit — alles, was von außen unsichtbar ist. Der Hinweis oben auf der Seite sagt das, und genau deshalb muss es stimmen: ein Eintrag über eine verschobene Datei würde diesen Hinweis zur Lüge machen, und ein Changelog, das man erst filtern muss, liest man irgendwann nicht mehr.

### Eine Liste, mehrere Orte

Jeder Eintrag kommt aus einer einzigen typisierten Liste im Repository. Die Seite, die fünf vorgerenderten Sprachen, das \`lastmod\` in der Sitemap und die Handvoll Einträge mit eigener Seite lesen alle daraus — es gibt keine zweite Datei, die mitgepflegt werden müsste, und keine, die man vergessen kann. Die Texte sind Markdown und werden von dem Konverter des Produkts selbst gesetzt: eine Release-Notiz, die den Renderer bricht, würde auch das Dokument einer Kundin brechen, und hier fällt es besser auf.

### Englisch, mit Absicht

Der Rahmen ist übersetzt — Überschrift, Vorspann, die Jahresleiste und die Daten und Monatsnamen, die \`Intl\` in Ihrer Sprache setzt. Die Einträge selbst nicht. Fünf Übersetzungen pro Eintrag, pro Release, auf Dauer sind ein Aufwand, den man nach dem zweiten Release sein lässt, und ein Changelog, in dem drei Sprachen fehlen, ist schlechter als eines, das ehrlich englisch ist. Wo ein Eintrag sich eine eigene Seite verdient hat, kann diese Seite übersetzt werden — davon gibt es eine Handvoll und nicht eine pro Release.

Weiter: [Release Notes aus Markdown](/blog/release-notes-from-markdown) und [Dokumentation, die im Repository lebt](/blog/documentation-that-lives-in-the-repo).`,
      },
      fr: {
        title: 'Cette page',
        summary: `Un journal des modifications, à l’adresse \`/changelog\` et relié depuis le pied de page. Chaque version et, entre elles, les changements qui méritent d’être nommés — lus dans une seule liste typée et mis en forme par le convertisseur que vend le produit.`,
        description:
          'Ce que le journal des modifications de TransformPipe recense et ce qu’il écarte à dessein : les changements visibles, une seule liste, des entrées en anglais.',
        keywords:
          'journal des modifications transformpipe, quoi de neuf transformpipe, notes de version convertisseur markdown, historique des changements du produit',
        body: `Un journal des modifications ne sert que si l’on peut se fier à ce qui n’y figure pas. Voici donc ce qui obtient une entrée.

### Ce qui en fait partie

Tout ce qu’une personne qui se sert de TransformPipe remarquerait : une conversion qui n’existait pas, une nouvelle page, un moyen de plus de se connecter, une limite qui a bougé, un défaut visiblement faux. Une version étiquetée porte son numéro ; l’essentiel de ce qui est sorti l’a été entre deux étiquettes et n’en porte aucun, ce qui explique que la liste soit plus longue que celle des versions.

### Ce qui n’en fait pas partie

Les remaniements de code, les mises à jour de dépendances, la compilation et l’infrastructure — tout ce qui reste invisible de l’extérieur. L’encart en haut de la page le dit, et c’est la raison de le tenir pour vrai : une entrée sur un fichier déplacé ferait de cet encart un mensonge, et un journal qu’il faut filtrer est un journal qu’on cesse de lire.

### Une seule liste, plusieurs endroits

Chaque entrée provient d’une unique liste typée dans le dépôt. La page, les cinq langues pré-rendues, le \`lastmod\` du plan du site et la poignée d’entrées qui ont leur page propre la lisent toutes — il n’y a pas de second fichier à tenir à jour, donc aucun à oublier. Les textes sont en Markdown et sont mis en forme par le convertisseur du produit lui-même : une note de version qui casserait le rendu casserait aussi le document d’une cliente, et mieux vaut le découvrir ici.

### L’anglais, délibérément

L’habillage est traduit — le titre, le chapeau, le panneau des années, ainsi que les dates et les noms de mois, que \`Intl\` compose dans votre langue. Les entrées elles-mêmes, non. Cinq traductions par entrée, par version, indéfiniment, est un coût que l’on cesse d’assumer après la deuxième version, et un journal auquel manquent trois langues vaut moins qu’un journal honnêtement anglais. Là où une entrée a mérité sa propre page, cette page peut être traduite : il y en a une poignée, et non une par version.

Autres lectures : [des notes de version écrites en Markdown](/blog/release-notes-from-markdown) et [de la documentation qui vit dans le dépôt](/blog/documentation-that-lives-in-the-repo).`,
      },
      es: {
        title: 'Esta página',
        summary: `Un registro de cambios, en \`/changelog\` y enlazado desde el pie de página. Cada versión y, entre ellas, los cambios que merecen nombrarse — leídos de una sola lista tipada y compuestos por el conversor que vende el producto.`,
        description:
          'Qué recoge el registro de cambios de TransformPipe y qué deja fuera a propósito: cambios que se notan, una sola lista y entradas escritas en inglés.',
        keywords:
          'registro de cambios transformpipe, novedades de transformpipe, notas de versión conversor markdown, historial de cambios del producto',
        body: `Un registro de cambios solo sirve si uno puede fiarse de lo que no está en él, así que aquí está lo que recibe una entrada.

### Qué entra

Cualquier cosa que notaría quien usa TransformPipe: una conversión que antes no existía, una página nueva, otra forma de iniciar sesión, un límite que se movió, un fallo visiblemente equivocado. Una versión etiquetada lleva su número; casi todo lo que ha salido lo hizo entre etiquetas y no lleva ninguno, y por eso la lista es más larga que la lista de versiones.

### Qué no

Reescrituras internas, actualizaciones de dependencias, trabajo de compilación e infraestructura: todo lo invisible desde fuera. El aviso de la cabecera de la página lo dice, y esa es la razón para mantenerlo cierto: una entrada sobre un archivo movido convertiría ese aviso en una mentira, y un registro que hay que filtrar es un registro que se deja de leer.

### Una sola lista, varios sitios

Cada entrada sale de una única lista tipada del repositorio. La página, los cinco idiomas prerrenderizados, el \`lastmod\` del mapa del sitio y el puñado de entradas con página propia la leen todas: no hay un segundo archivo que mantener al día, ni ninguno que olvidar. Los textos son Markdown y los compone el conversor del propio producto: una nota de versión que rompiera el renderizador rompería también el documento de una clienta, y este es mejor sitio para descubrirlo.

### En inglés, a propósito

El marco está traducido: el encabezado, la entradilla, el panel de los años y las fechas y los nombres de los meses, que \`Intl\` compone en tu idioma. Las entradas mismas no. Cinco traducciones por entrada, por versión, para siempre, es un coste que se abandona después de la segunda versión, y un registro al que le faltan tres idiomas es peor que uno honestamente inglés. Cuando una entrada se ha ganado su propia página, esa página sí puede traducirse: hay un puñado de ellas, no una por versión.

Relacionado: [notas de versión escritas en Markdown](/blog/release-notes-from-markdown) y [documentación que vive en el repositorio](/blog/documentation-that-lives-in-the-repo).`,
      },
      it: {
        title: 'Questa pagina',
        summary: `Un registro delle modifiche, all’indirizzo \`/changelog\` e collegato dal piè di pagina. Ogni versione e, in mezzo, i cambiamenti che vale la pena nominare — letti da un solo elenco tipizzato e composti dal convertitore che il prodotto vende.`,
        description:
          'Che cosa elenca il registro delle modifiche di TransformPipe e che cosa lascia fuori di proposito: i cambiamenti visibili, un solo elenco, voci in inglese.',
        keywords:
          'registro delle modifiche transformpipe, novità di transformpipe, note di rilascio convertitore markdown, storico dei cambiamenti del prodotto',
        body: `Un registro delle modifiche serve solo se puoi fidarti di quello che non c’è dentro, quindi ecco che cosa riceve una voce.

### Che cosa entra

Tutto quello che noteresti usando TransformPipe: una conversione che prima non esisteva, una pagina nuova, un altro modo di accedere, un limite che si è spostato, un difetto visibilmente sbagliato. Una versione etichettata porta il proprio numero; quasi tutto quello che è uscito è uscito fra un’etichetta e l’altra e non ne porta nessuno, ed è per questo che l’elenco è più lungo dell’elenco delle versioni.

### Che cosa no

Riscritture interne, aggiornamenti di dipendenze, lavoro di build e di infrastruttura: tutto ciò che da fuori è invisibile. La nota in cima alla pagina lo dice, ed è la ragione per tenerla vera: una voce su un file spostato renderebbe quella nota una bugia, e un registro che devi filtrare è un registro che smetti di leggere.

### Un solo elenco, più posti

Ogni voce viene da un unico elenco tipizzato nel repository. La pagina, le cinque lingue pre-renderizzate, il \`lastmod\` nella mappa del sito e la manciata di voci con una pagina propria lo leggono tutti: non c’è un secondo file da tenere allineato, e quindi nessuno da dimenticare. I testi sono Markdown e li compone il convertitore del prodotto stesso: una nota di rilascio che rompesse il renderer romperebbe anche il documento di una cliente, e questo è un posto migliore per scoprirlo.

### In inglese, di proposito

La cornice è tradotta: il titolo, l’occhiello, il pannello degli anni, e le date e i nomi dei mesi, che \`Intl\` compone nella tua lingua. Le voci no. Cinque traduzioni per voce, per versione, per sempre, sono un costo che si abbandona dopo la seconda versione, e un registro a cui mancano tre lingue è peggio di uno onestamente inglese. Dove una voce si è meritata una pagina propria, quella pagina si può tradurre: ce n’è una manciata, non una per versione.

Da leggere: [note di rilascio scritte in Markdown](/blog/release-notes-from-markdown) e [documentazione che vive nel repository](/blog/documentation-that-lives-in-the-repo).`,
      },
    },
    body:
      'A changelog, at `/changelog` and linked from the footer. Every release and, between them, ' +
      'the changes worth naming — read from one typed list and rendered by the converter the ' +
      'product sells.',
  },
  {
    date: '2026-09-10',
    title: 'A page for an address that is not a page',
    slug: 'not-found-page',
    detail: {
      en: {
        description:
          'The TransformPipe 404: three named ways out instead of the host error page, and no more rendering the converter under an address nobody typed.',
        keywords:
          'page not found, 404 page, mistyped url markdown converter, soft 404 fix, where did the page go',
        body: `If you are reading this, you probably arrived at a 404 and wondered what the site does with one.

### What it offers

The number, a line saying the address is not a page, and three ways out named rather than hinted at: convert a file, read the documentation, browse the blog. The converter comes first and is the one filled button, because somebody who typed the domain by hand was looking for it. A last line says that if a link on this site sent you here, that is a bug rather than a typo — which tells you whether to retype the address or to report it.

It carries the site's own header and footer and is re-rendered in your language, so landing on it does not feel like being thrown out of the site.

### Why a typo used to render the converter

The router asks an address one question: which screen does it want. Its last branch was the converter, the default screen — so every path it did not recognise rendered the Markdown screen. One wrong letter in a URL looked like a working front page with a stranger's path in the address bar, and nothing anywhere said the address was wrong. That last branch is now "not found"; the converter is returned only for an address that is genuinely one of the ten conversions' own, or a shared document.

The host answers most unknown addresses before the app's code runs at all, but it answers them by serving the 404 file — and then this is what decides what you see.

### Two soft 404s went with it

A link to an article that does not exist used to answer 200, which a crawler files as a real page and then keeps. And \`/de/history\` was a plain 404 in four of the five languages, so the screen worked until somebody reloaded it.

### What it does not do

Guess what you meant, or redirect. A 404 that quietly sends you somewhere else is how a broken link stays broken: nobody finds out it is wrong, including whoever wrote it.

Related: [how to open an .md file](/blog/how-to-open-md-file), and [what a Markdown to HTML converter is for](/blog/markdown-to-html-converter).`,
      },
      de: {
        title: 'Eine Seite für eine Adresse, die keine Seite ist',
        summary: `Es gab keine: eine nicht erkannte Adresse bekam die Fehlerseite des Hosts, auf der es nichts zu klicken gab. Jetzt gibt es eine 404-Seite mit dem Rahmen der Website und drei Wegen hinaus, einmal geschrieben und in der Sprache der Leserin neu gesetzt. Zwei weiche 404er kamen mit heraus: ein Link auf einen Artikel, den es nicht gibt, antwortete mit 200, was ein Crawler als echte Seite aufnimmt; und \`/de/history\` war in vier Sprachen eine schlichte 404, sodass der Bildschirm funktionierte, bis jemand neu lud.`,
        description:
          'Die 404-Seite von TransformPipe: drei benannte Wege hinaus statt der Fehlerseite des Hosts, und kein Konverter mehr unter einer Adresse, die niemand getippt hat.',
        keywords:
          'seite nicht gefunden, 404 fehlerseite, adresse falsch getippt markdown konverter, weiche 404 beheben, wo ist die seite hin',
        body: `Wenn Sie das lesen, sind Sie wahrscheinlich auf einer 404 gelandet und haben sich gefragt, was diese Website daraus macht.

### Was sie anbietet

Die Zahl, einen Satz, dass diese Adresse keine Seite ist, und drei Wege hinaus, benannt statt angedeutet: eine Datei konvertieren, die Dokumentation lesen, im Blog stöbern. Der Konverter steht vorn und ist der einzige gefüllte Knopf, denn wer die Domain von Hand getippt hat, wollte ihn. Eine letzte Zeile sagt, dass ein Link dieser Website, der Sie hierher geschickt hat, ein Fehler und kein Tippfehler ist — daran erkennen Sie, ob Sie die Adresse neu tippen oder sie melden sollten.

Die Seite trägt Kopf und Fuß der Website und wird in Ihrer Sprache neu gesetzt: hier zu landen fühlt sich nicht an wie ein Hinauswurf.

### Warum ein Tippfehler früher den Konverter zeigte

Der Router stellt einer Adresse eine Frage: welchen Bildschirm will sie. Sein letzter Zweig war der Konverter, der Standardbildschirm — jeder Pfad, den er nicht erkannte, ergab also den Markdown-Bildschirm. Ein falscher Buchstabe in einer URL sah aus wie eine funktionierende Startseite mit einem fremden Pfad in der Adresszeile, und nirgends stand, dass die Adresse falsch war. Dieser letzte Zweig heißt jetzt „nicht gefunden"; den Konverter gibt es nur noch für eine Adresse, die wirklich einer der zehn Konvertierungen gehört, oder für ein geteiltes Dokument.

Die meisten unbekannten Adressen beantwortet der Host, bevor der Code der App überhaupt läuft — aber er beantwortet sie, indem er die 404-Datei ausliefert, und was Sie dann sehen, entscheidet dies hier.

### Zwei weiche 404er kamen mit

Ein Link auf einen Artikel, den es nicht gibt, antwortete mit 200, was ein Crawler als echte Seite aufnimmt und dann behält. Und \`/de/history\` war in vier der fünf Sprachen eine schlichte 404, sodass der Bildschirm funktionierte, bis jemand neu lud.

### Was sie nicht tut

Raten, was Sie gemeint haben, oder weiterleiten. Eine 404, die Sie still woanders hinschickt, ist der Grund, warum ein kaputter Link kaputt bleibt: niemand erfährt davon, auch nicht, wer ihn geschrieben hat.

Weiter: [wie man eine .md-Datei öffnet](/blog/how-to-open-md-file) und [wozu ein Markdown-nach-HTML-Konverter da ist](/blog/markdown-to-html-converter).`,
      },
      fr: {
        title: 'Une page pour une adresse qui n’est pas une page',
        summary: `Il n’y en avait aucune : une adresse non reconnue recevait la page d’erreur de l’hébergeur, sans rien à cliquer. Il y a maintenant une 404 qui porte l’habillage du site et trois sorties nommées, écrites une fois et recomposées dans la langue du lecteur.

Deux 404 douces sont sorties avec elle. Un lien vers un article inexistant répondait 200, ce qu’un robot d’indexation retient comme une vraie page ; et \`/de/history\` était une 404 nue dans quatre langues, si bien que l’écran fonctionnait jusqu’au premier rechargement.`,
        description:
          'La 404 de TransformPipe : trois sorties nommées au lieu de la page d’erreur de l’hébergeur, et plus de convertisseur sous une adresse que personne n’a tapée.',
        keywords:
          'page introuvable, erreur 404, adresse mal tapée convertisseur markdown, corriger une 404 douce, où est passée la page',
        body: `Si vous lisez ceci, vous êtes sans doute tombé sur une 404 et vous vous êtes demandé ce que ce site en fait.

### Ce qu’elle propose

Le nombre, une phrase disant que cette adresse n’est pas une page, et trois sorties nommées plutôt que suggérées : convertir un fichier, lire la documentation, parcourir le blog. Le convertisseur vient en premier et porte le seul bouton plein, car qui a tapé le domaine à la main le cherchait. Une dernière ligne précise qu’un lien de ce site qui vous a envoyé ici est un défaut et non une faute de frappe — vous savez ainsi s’il faut retaper l’adresse ou la signaler.

Elle porte l’en-tête et le pied de page du site et est recomposée dans votre langue : y atterrir ne ressemble pas à une expulsion.

### Pourquoi une faute de frappe affichait le convertisseur

Le routeur pose une seule question à une adresse : quel écran veut-elle. Sa dernière branche était le convertisseur, l’écran par défaut — tout chemin qu’il ne reconnaissait pas donnait donc l’écran Markdown. Une lettre fausse dans une URL ressemblait à une page d’accueil qui marche, avec un chemin étranger dans la barre d’adresse, et rien nulle part ne disait que l’adresse était mauvaise. Cette dernière branche s’appelle désormais « introuvable » ; le convertisseur n’est rendu que pour une adresse qui appartient vraiment à l’une des dix conversions, ou pour un document partagé.

L’hébergeur répond à la plupart des adresses inconnues avant même que le code de l’application tourne, mais il y répond en servant le fichier 404 — et c’est alors ceci qui décide de ce que vous voyez.

### Deux 404 douces sont sorties avec elle

Un lien vers un article qui n’existe pas répondait 200, ce qu’un robot d’indexation classe comme une vraie page et conserve ensuite. Et \`/de/history\` était une 404 nue dans quatre des cinq langues, si bien que l’écran fonctionnait jusqu’à ce que quelqu’un le recharge.

### Ce qu’elle ne fait pas

Deviner ce que vous vouliez, ni rediriger. Une 404 qui vous envoie discrètement ailleurs est la raison pour laquelle un lien cassé le reste : personne n’apprend qu’il est faux, à commencer par celui qui l’a écrit.

Autres lectures : [comment ouvrir un fichier .md](/blog/how-to-open-md-file) et [à quoi sert un convertisseur Markdown vers HTML](/blog/markdown-to-html-converter).`,
      },
      es: {
        title: 'Una página para una dirección que no es una página',
        summary: `No había ninguna: una dirección no reconocida recibía la página de error del alojamiento, sin nada que pulsar. Ahora hay una 404 con el marco del sitio y tres salidas, escrita una vez y recompuesta en el idioma del lector.

Con ella salieron dos 404 blandas. Un enlace a un artículo inexistente respondía 200, que un rastreador archiva como página real; y \`/de/history\` era una 404 pelada en cuatro idiomas, de modo que la pantalla funcionaba hasta que alguien la recargaba.`,
        description:
          'La 404 de TransformPipe: tres salidas con nombre en vez de la página de error del alojamiento, y ya no el conversor bajo una dirección que nadie tecleó.',
        keywords:
          'página no encontrada, error 404, dirección mal escrita conversor markdown, arreglar un 404 blando, dónde está la página',
        body: `Si estás leyendo esto, probablemente has llegado a una 404 y te has preguntado qué hace este sitio con ellas.

### Qué ofrece

El número, una línea que dice que esa dirección no es una página, y tres salidas nombradas en lugar de insinuadas: convertir un archivo, leer la documentación, recorrer el blog. El conversor va primero y es el único botón relleno, porque quien tecleó el dominio a mano lo buscaba. Una última línea dice que, si te trajo aquí un enlace de este sitio, eso es un fallo y no una errata — con lo que sabes si conviene volver a teclear la dirección o avisarnos.

Lleva la cabecera y el pie del sitio y se recompone en tu idioma, así que aterrizar aquí no se parece a que te echen.

### Por qué antes un error de tecleo mostraba el conversor

El enrutador le hace una sola pregunta a una dirección: qué pantalla quiere. Su última rama era el conversor, la pantalla por defecto, de modo que toda ruta que no reconocía daba la pantalla de Markdown. Una letra equivocada en una URL parecía una portada que funciona con una ruta ajena en la barra de direcciones, y en ningún sitio decía que la dirección estuviera mal. Esa última rama se llama ahora «no encontrado»; el conversor solo se devuelve para una dirección que de verdad pertenece a una de las diez conversiones, o para un documento compartido.

El alojamiento responde a casi todas las direcciones desconocidas antes de que corra el código de la aplicación, pero las responde sirviendo el archivo 404 — y entonces es esto lo que decide qué ves.

### Dos 404 blandas salieron con ella

Un enlace a un artículo que no existe respondía 200, que un rastreador archiva como página real y luego conserva. Y \`/de/history\` era una 404 pelada en cuatro de los cinco idiomas, así que la pantalla funcionaba hasta que alguien la recargaba.

### Qué no hace

Adivinar qué querías, ni redirigir. Una 404 que te manda a otro sitio en silencio es la razón de que un enlace roto siga roto: nadie se entera de que está mal, empezando por quien lo escribió.

Relacionado: [cómo abrir un archivo .md](/blog/how-to-open-md-file) y [para qué sirve un conversor de Markdown a HTML](/blog/markdown-to-html-converter).`,
      },
      it: {
        title: 'Una pagina per un indirizzo che non è una pagina',
        summary: `Non ce n’era nessuna: un indirizzo non riconosciuto riceveva la pagina d’errore dell’hosting, senza niente da cliccare. Ora c’è una 404 con la cornice del sito e tre vie d’uscita, scritta una volta e ricomposta nella tua lingua.

Con lei sono uscite due 404 morbide. Un link a un articolo inesistente rispondeva 200, che un crawler archivia come pagina vera; e \`/de/history\` era una 404 nuda in quattro lingue, così la schermata funzionava finché qualcuno non la ricaricava.`,
        description:
          'La 404 di TransformPipe: tre vie d’uscita con un nome al posto della pagina d’errore dell’hosting, e niente più convertitore sotto un indirizzo mai digitato.',
        keywords:
          'pagina non trovata, errore 404, indirizzo sbagliato convertitore markdown, correggere un 404 morbido, dove è finita la pagina',
        body: `Se stai leggendo questo, con ogni probabilità sei arrivato su una 404 e ti sei chiesto cosa ne faccia questo sito.

### Che cosa offre

Il numero, una riga che dice che quell’indirizzo non è una pagina, e tre vie d’uscita nominate invece che accennate: convertire un file, leggere la documentazione, sfogliare il blog. Il convertitore viene per primo ed è l’unico pulsante pieno, perché chi ha digitato il dominio a mano cercava quello. Un’ultima riga dice che, se ti ha mandato qui un link di questo sito, quello è un difetto e non un errore di battitura — così sai se riscrivere l’indirizzo o segnalarlo.

Porta l’intestazione e il piè di pagina del sito ed è ricomposta nella tua lingua: finirci non somiglia a essere buttati fuori.

### Perché un errore di battitura mostrava il convertitore

Il router fa a un indirizzo una sola domanda: quale schermata vuole. Il suo ultimo ramo era il convertitore, la schermata predefinita, quindi ogni percorso che non riconosceva dava la schermata Markdown. Una lettera sbagliata in una URL sembrava una pagina iniziale funzionante con un percorso estraneo nella barra degli indirizzi, e da nessuna parte c’era scritto che l’indirizzo fosse errato. Quell’ultimo ramo ora si chiama «non trovato»; il convertitore torna solo per un indirizzo che appartiene davvero a una delle dieci conversioni, o per un documento condiviso.

L’hosting risponde alla maggior parte degli indirizzi sconosciuti prima ancora che il codice dell’applicazione giri, ma risponde servendo il file 404 — e a quel punto è questo a decidere che cosa vedi.

### Due 404 morbide sono uscite con lei

Un link a un articolo che non esiste rispondeva 200, che un crawler archivia come pagina vera e poi tiene. E \`/de/history\` era una 404 nuda in quattro delle cinque lingue, così la schermata funzionava finché qualcuno non la ricaricava.

### Che cosa non fa

Indovinare che cosa intendevi, o reindirizzare. Una 404 che ti manda altrove in silenzio è il motivo per cui un link rotto resta rotto: nessuno scopre che è sbagliato, a cominciare da chi l’ha scritto.

Da leggere: [come aprire un file .md](/blog/how-to-open-md-file) e [a che cosa serve un convertitore da Markdown a HTML](/blog/markdown-to-html-converter).`,
      },
    },
    body:
      'There was none: an unmatched address got the host’s own error page, with nothing to ' +
      'click. There is now a 404 carrying the site’s chrome and three ways out, written once ' +
      'and re-rendered in the reader’s language.\n\n' +
      'Two soft 404s came out with it. A link to an article that does not exist answered 200, ' +
      'which a crawler indexes as a real page; and `/de/history` was a plain 404 in four ' +
      'languages, so the screen worked until somebody reloaded it.',
  },
  {
    date: '2026-09-10',
    title: 'The blog in German',
    slug: 'blog-in-german',
    detail: {
      en: {
        description:
          'All sixty-three TransformPipe articles exist in German, written rather than machine-translated, with the search terms a German reader would actually type.',
        keywords:
          'markdown guides in german, german documentation markdown converter, translated markdown tutorials, transformpipe blog languages',
        body: `Sixty-three articles, and every one of them now exists in English, in German and in French. German went first, an article at a time, which is why the machinery described below exists at all. Spanish and Italian have a handful rather than a blog.

### What a translation is here

Not a literal one. The register is formal, the prose is rebuilt rather than transposed, and the keywords are written around the phrase a German reader would actually type — not the English phrase translated word for word, which is how a page ends up ranking for something nobody searches for.

What does not change: the date, every link target, every code block, every table's structure, and every "checked on" citation, which keeps the date the claim was actually checked on. A statement about another tool's behaviour was true on a particular day, and translating a sentence does not re-check it.

### A language has what it has

Each language's index lists only its own articles. An article claims an \`hreflang\` for a language only where there is text in it, so a search engine is never pointed at a translation that does not exist. A language with nothing translated gets no index at all, rather than a heading over an empty list. The covers are drawn per language, because the headline is part of the picture.

The language switcher follows the same rule: on an article your language has, it takes you to that article; on one it does not, it takes you to that language's index, which lists what it does have. Following the prefix blindly would offer a German address for a piece with no German text — a 404 dressed as a translation.

### New articles do not work this way any more

An article written from the middle of September 2026 onwards ships in all five languages in the same commit, or it is not finished. The backlog is the argument for that rule: fifty-six articles went out in English, German followed one at a time, and the other three never started, because "translate it later" is a decision nobody makes on purpose. What is left of the backlog gets translated when somebody chooses to; the rule is about not growing it.

Related: [escaping in Markdown](/blog/markdown-escaping), and [CommonMark, GFM and the flavours](/blog/commonmark-gfm-and-the-flavours).`,
      },
      de: {
        title: 'Der Blog auf Deutsch',
        summary: `Neunundzwanzig der sechsundfünfzig Artikel liegen auf Deutsch vor, und der Blog kann von nun an Artikel für Artikel übersetzt werden. Die Regel dahinter lautet überall: eine Sprache hat, was sie hat. Ihre Übersicht führt nur ihre eigenen Artikel, ein Artikel beansprucht ein \`hreflang\` nur für die Sprachen, in denen wirklich Text steht, und eine Sprache ohne Übersetzungen bekommt gar keine Übersicht statt einer Überschrift über einer leeren Liste. Die Titelbilder werden pro Sprache gezeichnet, denn die Schlagzeile ist Teil des Bildes.`,
        description:
          'Alle dreiundsechzig Artikel von TransformPipe liegen auf Deutsch vor — geschrieben statt maschinell übersetzt, mit den Suchbegriffen deutscher Leser.',
        keywords:
          'markdown anleitungen auf deutsch, markdown konverter dokumentation deutsch, markdown tutorials übersetzt, transformpipe blog sprachen',
        body: `Dreiundsechzig Artikel, und jeder einzelne liegt inzwischen auf Englisch, auf Deutsch und auf Französisch vor. Deutsch kam zuerst, Artikel für Artikel — deshalb gibt es die Mechanik, um die es weiter unten geht, überhaupt. Spanisch und Italienisch haben eine Handvoll und noch keinen Blog.

### Was eine Übersetzung hier ist

Keine wörtliche. Das Register ist förmlich, die Prosa wird neu gebaut statt übertragen, und die Suchbegriffe werden um die Formulierung herum geschrieben, die eine deutsche Leserin tatsächlich eintippt — nicht um die Wort für Wort übersetzte englische, mit der eine Seite am Ende für etwas rankt, das niemand sucht.

Was sich nicht ändert: das Datum, jedes Linkziel, jeder Codeblock, der Bau jeder Tabelle und jede Angabe „geprüft am", die das Datum behält, an dem wirklich geprüft wurde. Eine Aussage über das Verhalten eines anderen Werkzeugs stimmte an einem bestimmten Tag, und eine Übersetzung prüft sie nicht neu.

### Eine Sprache hat, was sie hat

Die Übersicht jeder Sprache führt nur ihre eigenen Artikel. Ein Artikel beansprucht ein \`hreflang\` für eine Sprache nur dort, wo wirklich Text steht — eine Suchmaschine wird also nie auf eine Übersetzung geschickt, die es nicht gibt. Eine Sprache ohne Übersetzungen bekommt gar keine Übersicht statt einer Überschrift über einer leeren Liste. Und die Titelbilder werden pro Sprache gezeichnet, denn die Schlagzeile ist Teil des Bildes.

Die Sprachumschaltung folgt derselben Regel: bei einem Artikel, den Ihre Sprache hat, führt sie zu diesem Artikel; bei einem, den sie nicht hat, zur Übersicht dieser Sprache, die zeigt, was da ist. Dem Präfix blind zu folgen würde eine deutsche Adresse für einen Text ohne deutschen Inhalt anbieten — eine 404 im Gewand einer Übersetzung.

### Für neue Artikel gilt das nicht mehr

Ein Artikel, der ab Mitte September 2026 geschrieben wird, erscheint in allen fünf Sprachen im selben Commit, oder er ist nicht fertig. Der Rückstand ist das Argument für diese Regel: sechsundfünfzig Artikel gingen auf Englisch hinaus, Deutsch folgte einer nach dem anderen, und die drei übrigen Sprachen begannen nie, denn „später übersetzen" ist eine Entscheidung, die niemand absichtlich trifft. Was vom Rückstand bleibt, wird übersetzt, wenn jemand sich dafür entscheidet; die Regel soll ihn nur nicht größer werden lassen.

Weiter: [Escaping in Markdown](/blog/markdown-escaping) und [CommonMark, GFM und die Varianten](/blog/commonmark-gfm-and-the-flavours).`,
      },
      fr: {
        title: 'Le blog en allemand',
        summary: `Vingt-neuf des cinquante-six articles sont en allemand, et le blog peut désormais être traduit un article à la fois.

La règle, partout, est qu’une langue a ce qu’elle a. Son index ne recense que ses propres articles, un article ne revendique un \`hreflang\` que pour les langues où il y a vraiment du texte, et une langue sans rien de traduit n’obtient aucun index plutôt qu’un titre au-dessus d’une liste vide. Les couvertures sont dessinées par langue, car le titre fait partie de l’image.`,
        description:
          'Les soixante-trois articles de TransformPipe existent en allemand, écrits plutôt que traduits à la machine, avec les termes qu’un lecteur allemand tape vraiment.',
        keywords:
          'guides markdown en allemand, documentation du convertisseur markdown en allemand, tutoriels markdown traduits, langues du blog transformpipe',
        body: `Soixante-trois articles, et chacun d’eux existe désormais en anglais, en allemand et en français. L’allemand est venu en premier, un article à la fois, et c’est pourquoi la mécanique décrite plus bas existe. L’espagnol et l’italien en ont quatre chacun, ce qui n’est pas encore un blog.

### Ce qu’est une traduction ici

Pas une traduction littérale. Le registre est soutenu, la prose est refaite plutôt que transposée, et les mots-clés sont écrits autour de la formule qu’un lecteur allemand taperait vraiment — non autour de la formule anglaise traduite mot à mot, par laquelle une page finit par se classer sur ce que personne ne cherche.

Ce qui ne change pas : la date, chaque cible de lien, chaque bloc de code, la structure de chaque tableau, et chaque mention « vérifié le », qui garde la date à laquelle la vérification a réellement eu lieu. Une affirmation sur le comportement d’un autre outil était vraie un jour donné, et traduire une phrase ne la vérifie pas à nouveau.

### Une langue a ce qu’elle a

L’index de chaque langue ne recense que ses propres articles. Un article ne revendique un \`hreflang\` pour une langue que là où il existe du texte, de sorte qu’un moteur de recherche n’est jamais dirigé vers une traduction absente. Une langue sans rien de traduit n’obtient aucun index, plutôt qu’un titre au-dessus d’une liste vide. Les couvertures sont dessinées par langue, car le titre fait partie de l’image.

Le sélecteur de langue suit la même règle : sur un article que votre langue possède, il vous y emmène ; sur un article qu’elle ne possède pas, il vous emmène à son index, qui montre ce qu’elle a. Suivre le préfixe aveuglément proposerait une adresse allemande pour un texte sans contenu allemand — une 404 déguisée en traduction.

### Les nouveaux articles ne fonctionnent plus ainsi

Un article écrit à partir de la mi-septembre 2026 paraît dans les cinq langues au même commit, sans quoi il n’est pas fini. L’arriéré est l’argument de cette règle : cinquante-six articles sont sortis en anglais, l’allemand a suivi un par un, et les trois autres langues n’ont jamais commencé, car « traduire plus tard » est une décision que personne ne prend exprès. Ce qui reste de l’arriéré sera traduit quand quelqu’un le décidera ; la règle sert seulement à ne pas le faire grossir.

Autres lectures : [l’échappement en Markdown](/blog/markdown-escaping) et [CommonMark, GFM et les variantes](/blog/commonmark-gfm-and-the-flavours).`,
      },
      es: {
        title: 'El blog en alemán',
        summary: `Veintinueve de los cincuenta y seis artículos están en alemán, y el blog ya puede traducirse de uno en uno.

La regla, en todas partes, es que un idioma tiene lo que tiene. Su índice recoge solo sus propios artículos, un artículo reclama un \`hreflang\` únicamente para los idiomas en los que de verdad hay texto, y un idioma sin nada traducido no recibe índice alguno en lugar de un encabezado sobre una lista vacía. Las portadas se dibujan por idioma, porque el titular forma parte de la imagen.`,
        description:
          'Los sesenta y tres artículos de TransformPipe existen en alemán, escritos y no traducidos a máquina, con los términos que teclea un lector alemán.',
        keywords:
          'guías de markdown en alemán, documentación del conversor markdown en alemán, tutoriales de markdown traducidos, idiomas del blog de transformpipe',
        body: `Sesenta y tres artículos, y todos ellos existen ya en inglés, en alemán y en francés. El alemán fue el primero, artículo a artículo, y por eso existe la maquinaria que se describe más abajo. El español y el italiano tienen cuatro cada uno, que no es todavía un blog.

### Qué es aquí una traducción

No una traducción literal. El registro es formal, la prosa se rehace en lugar de transponerse, y las palabras clave se escriben alrededor de la expresión que un lector alemán teclearía de verdad, no alrededor de la expresión inglesa traducida palabra por palabra, que es como una página acaba posicionando para algo que nadie busca.

Lo que no cambia: la fecha, cada destino de enlace, cada bloque de código, la estructura de cada tabla y cada mención «comprobado el», que conserva la fecha en la que de verdad se comprobó. Una afirmación sobre el comportamiento de otra herramienta era cierta un día concreto, y traducir una frase no la vuelve a comprobar.

### Un idioma tiene lo que tiene

El índice de cada idioma recoge solo sus propios artículos. Un artículo reclama un \`hreflang\` para un idioma únicamente donde hay texto, de modo que a un buscador nunca se le señala una traducción que no existe. Un idioma sin nada traducido no recibe índice alguno, en vez de un encabezado sobre una lista vacía. Las portadas se dibujan por idioma, porque el titular forma parte de la imagen.

El selector de idioma sigue la misma regla: en un artículo que tu idioma tiene, te lleva a ese artículo; en uno que no tiene, te lleva al índice de ese idioma, que muestra lo que sí hay. Seguir el prefijo a ciegas ofrecería una dirección alemana para un texto sin contenido alemán: un 404 disfrazado de traducción.

### Los artículos nuevos ya no funcionan así

Un artículo escrito desde mediados de septiembre de 2026 sale en los cinco idiomas en el mismo commit, o no está terminado. El atraso es el argumento de esa regla: cincuenta y seis artículos salieron en inglés, el alemán fue siguiendo de uno en uno, y los otros tres idiomas no empezaron nunca, porque «ya lo traduciremos» es una decisión que nadie toma a propósito. Lo que queda del atraso se traducirá cuando alguien lo decida; la regla solo sirve para no agrandarlo.

Relacionado: [el escapado en Markdown](/blog/markdown-escaping) y [CommonMark, GFM y las variantes](/blog/commonmark-gfm-and-the-flavours).`,
      },
      it: {
        title: 'Il blog in tedesco',
        summary: `Ventinove dei cinquantasei articoli sono in tedesco, e il blog da ora si può tradurre un articolo alla volta.

La regola, dappertutto, è che una lingua ha quello che ha. Il suo indice elenca solo i propri articoli, un articolo rivendica un \`hreflang\` soltanto per le lingue in cui c’è davvero del testo, e una lingua senza nulla di tradotto non riceve alcun indice invece di un titolo sopra un elenco vuoto. Le copertine si disegnano per lingua, perché il titolo fa parte dell’immagine.`,
        description:
          'I sessantatré articoli di TransformPipe esistono in tedesco, scritti e non tradotti a macchina, con i termini che un lettore tedesco digita davvero.',
        keywords:
          'guide markdown in tedesco, documentazione del convertitore markdown in tedesco, tutorial markdown tradotti, lingue del blog di transformpipe',
        body: `Sessantatré articoli, e ognuno di essi esiste ormai in inglese, in tedesco e in francese. Il tedesco è venuto per primo, un articolo alla volta, ed è per questo che esiste la meccanica descritta qui sotto. Lo spagnolo e l’italiano ne hanno quattro ciascuno, che non è ancora un blog.

### Che cos’è qui una traduzione

Non una traduzione letterale. Il registro è formale, la prosa viene rifatta invece che trasposta, e le parole chiave si scrivono intorno all’espressione che un lettore tedesco digiterebbe davvero — non intorno all’espressione inglese tradotta parola per parola, che è il modo in cui una pagina finisce per posizionarsi su qualcosa che nessuno cerca.

Quello che non cambia: la data, ogni destinazione di link, ogni blocco di codice, la struttura di ogni tabella e ogni indicazione «verificato il», che conserva la data in cui la verifica è avvenuta davvero. Un’affermazione sul comportamento di un altro strumento era vera in un giorno preciso, e tradurre una frase non la verifica di nuovo.

### Una lingua ha quello che ha

L’indice di ogni lingua elenca solo i propri articoli. Un articolo rivendica un \`hreflang\` per una lingua soltanto dove c’è del testo, così un motore di ricerca non viene mai indirizzato a una traduzione che non esiste. Una lingua senza nulla di tradotto non riceve alcun indice, invece di un titolo sopra un elenco vuoto. Le copertine si disegnano per lingua, perché il titolo fa parte dell’immagine.

Il selettore di lingua segue la stessa regola: su un articolo che la tua lingua possiede, ti porta a quell’articolo; su uno che non possiede, ti porta all’indice di quella lingua, che mostra quello che c’è. Seguire il prefisso alla cieca offrirebbe un indirizzo tedesco per un testo senza contenuto tedesco: una 404 travestita da traduzione.

### I nuovi articoli non funzionano più così

Un articolo scritto da metà settembre 2026 in poi esce in tutte e cinque le lingue nello stesso commit, oppure non è finito. L’arretrato è l’argomento a favore di questa regola: cinquantasei articoli sono usciti in inglese, il tedesco è seguito uno alla volta, e le altre tre lingue non sono mai partite, perché «lo traduciamo poi» è una decisione che nessuno prende apposta. Quello che resta dell’arretrato verrà tradotto quando qualcuno lo deciderà; la regola serve solo a non farlo crescere.

Da leggere: [l’escaping in Markdown](/blog/markdown-escaping) e [CommonMark, GFM e le varianti](/blog/commonmark-gfm-and-the-flavours).`,
      },
    },
    body:
      'Twenty-nine of the fifty-six articles are in German, and the blog can now be translated ' +
      'one article at a time.\n\n' +
      'The rule throughout is that a language has what it has. Its index lists only its own ' +
      'articles, an article claims an `hreflang` only for the languages that actually have text, ' +
      'and a language with nothing translated gets no index at all rather than a heading over an ' +
      'empty list. Covers are drawn per language, because the headline is part of the picture.',
  },
  {
    date: '2026-09-09',
    title: 'Email that arrives',
    slug: 'email-deliverability',
    detail: {
      en: {
        description:
          'TransformPipe sends two messages: a welcome, and a notice when somebody shares a document with you. Why they used not to arrive, and what fixed it.',
        keywords:
          'why do my emails go to spam, dmarc record for transactional email, serverless function not sending email, shared document notification email, spf dkim and dmarc explained',
        body: `Mail from a product is mostly a thing to be suspicious of, so it is worth saying how little of it there is here. Two messages: a welcome, the first time an account is actually used, and a notice to somebody an account has shared a document with. No digests, no product news, nothing you have to unsubscribe from.

### Why they were not arriving

Three faults, one after the other. The notice was first wired to an endpoint the application never calls. Then it was fixed to fire after the response had gone out — which is the natural thing to write and the wrong thing in a serverless function, because the platform may freeze the instance the moment a response is sent, and a request that has not left yet never does. Three addresses were added on a live deployment and the mail provider logged nothing at all: not a failure, an absence.

So a send is now part of the request that triggered it, and awaited, with a four-second timeout so a provider having a bad minute cannot turn a share into a slow share. The third fault was duller than the other two: the key was genuinely missing from the first builds.

### Why they were going to spam

SPF and DKIM were in place from the start and were never the problem. The record that was missing was DMARC — the DNS entry that says what a receiver should do with mail failing the other two — and a young domain sending automated mail without it is treated harshly. That is DNS rather than code, which is part of why it took three attempts to find.

What the code can do is not make it worse. Both MIME parts rather than text alone, because text-only automated mail from a domain with no sending history is what a filter distrusts most. A subject that leads with the document's name instead of a raw address beside a quoted filename, a pair whose shape filters know. And a Reply-To pointing at the person who shared it, because a message you cannot answer reads as machinery.

### What these messages are not

No images and no tracking pixel; the HTML part is the same words as the plain part, rendered by the product's own converter. A document's name is printed inside a code span, so a file called \`[Confirm your account](https://elsewhere.example)\` arrives as text rather than as a live link in a message carrying our signature. A deployment with no key configured sends nothing and says nothing, and a share that worked is never reported as failed because the mail was not. All of it is in English whatever your language: it goes to an address we know nothing else about.

Related: [sharing a document as a link](/blog/share-a-markdown-document-as-a-link), and [whether an online converter is safe](/blog/is-an-online-converter-safe).`,
      },
      de: {
        title: 'E-Mail, die ankommt',
        summary: `Eine Willkommensnachricht, einmal beim ersten Gebrauch eines Kontos, und ein Hinweis an jemanden, mit dem ein Dokument geteilt wurde. Beides brauchte drei Anläufe: Der Hinweis hing an einem Endpunkt, den die Anwendung nie aufruft, ging danach erst nach der Antwort hinaus, sodass die Anfrage die Funktion nie verließ, und scheiterte schließlich an einem Schlüssel, der in den ersten Builds tatsächlich fehlte. Für die Zustellbarkeit fehlte DMARC, nicht SPF und DKIM.`,
        description:
          'TransformPipe verschickt zwei Nachrichten: ein Willkommen und einen Hinweis auf ein geteiltes Dokument. Warum sie früher nicht ankamen und was es behoben hat.',
        keywords:
          'e-mail landet im spam, dmarc eintrag einrichten, zustellbarkeit von transaktionsmails, hinweis auf geteiltes dokument, unterschied spf dkim dmarc',
        body: `Post von einem Produkt ist meistens etwas, dem man misstrauen sollte — also sei gesagt, wie wenig davon es hier gibt. Zwei Nachrichten: ein Willkommen, wenn ein Konto zum ersten Mal wirklich benutzt wird, und ein Hinweis an jemanden, mit dem ein Konto ein Dokument geteilt hat. Keine Zusammenfassungen, keine Produktneuigkeiten, keine Liste, von der Sie sich abmelden müssten.

### Warum sie nicht ankamen

Drei Fehler, einer nach dem anderen. Der Hinweis hing zuerst an einem Endpunkt, den die Anwendung nie aufruft. Dann wurde er abgeschickt, nachdem die Antwort schon hinaus war — das Naheliegende, wenn man es schreibt, und in einer serverlosen Funktion das Falsche: Die Plattform darf die Instanz in dem Moment einfrieren, in dem die Antwort geht, und eine Anfrage, die noch nicht draußen war, geht nie mehr hinaus. Auf einer laufenden Bereitstellung wurden drei Adressen hinzugefügt, und der Mail-Dienst hat gar nichts protokolliert: kein Fehlschlag, eine Abwesenheit.

Ein Versand gehört deshalb jetzt zu der Anfrage, die ihn ausgelöst hat, und wird abgewartet — mit vier Sekunden Zeitgrenze, damit ein Dienst mit einer schlechten Minute aus dem Teilen kein langsames Teilen macht. Der dritte Fehler war nüchterner als die beiden anderen: Der Schlüssel fehlte in den ersten Builds wirklich.

### Warum sie im Spam landeten

SPF und DKIM waren von Anfang an eingerichtet und nie das Problem. Was fehlte, war DMARC — der DNS-Eintrag, der sagt, was ein Empfänger mit Post tun soll, die an den beiden anderen scheitert. Eine junge Domain, die ohne ihn automatische Post verschickt, wird streng behandelt. Das ist DNS und nicht Code, was erklärt, warum es dauerte.

Was der Code tun kann, ist, es nicht schlimmer zu machen: beide MIME-Teile statt nur Text, denn eine reine Textnachricht von einer Domain ohne Versandgeschichte ist genau das, was ein Filter am wenigsten mag. Eine Betreffzeile, die mit dem Namen des Dokuments beginnt statt mit einer nackten Adresse neben einem Dateinamen in Anführungszeichen — ein Paar, dessen Form Filter kennen. Und ein Reply-To auf die Person, die geteilt hat, denn eine Nachricht, die man nicht beantworten kann, liest sich wie Maschinerie.

### Was diese Nachrichten nicht sind

Keine Bilder und kein Zählpixel; der HTML-Teil sind dieselben Worte wie der Textteil, gesetzt vom Konverter des Produkts selbst. Der Name eines Dokuments steht in einer Code-Spanne, damit eine Datei namens \`[Confirm your account](https://elsewhere.example)\` als Text ankommt und nicht als klickbarer Link in einer Nachricht, die unsere Signatur trägt. Eine Bereitstellung ohne Schlüssel verschickt nichts und sagt nichts, und ein Teilen, das geklappt hat, wird nie als gescheitert gemeldet, weil die Post es nicht tat. Alles davon ist englisch: Es geht an eine Adresse, über die wir sonst nichts wissen.

Weiter: [ein Dokument als Link teilen](/blog/share-a-markdown-document-as-a-link) und [ob ein Online-Konverter sicher ist](/blog/is-an-online-converter-safe).`,
      },
      fr: {
        title: 'Des messages qui arrivent',
        summary: `Un message de bienvenue, envoyé une seule fois lors du premier usage d’un compte, et un avis à la personne avec qui un document a été partagé.

Les deux ont demandé trois tentatives. L’avis était branché sur un point d’entrée que l’application n’appelle jamais, puis déclenché après la réponse, si bien que la requête ne quittait jamais la fonction, puis bloqué par une clé réellement absente des premières compilations. La délivrabilité, elle, réclamait DMARC et pas seulement SPF et DKIM.`,
        description:
          'TransformPipe envoie deux messages : une bienvenue et un avis de partage de document. Pourquoi ils n’arrivaient pas, et ce qui les a fait arriver.',
        keywords:
          'mes e-mails arrivent dans les indésirables, enregistrement dmarc pour e-mail transactionnel, fonction serverless qui n’envoie pas d’e-mail, avis de document partagé, différence entre spf dkim et dmarc',
        body: `Le courrier d’un produit est surtout une chose dont il faut se méfier, alors disons combien il y en a peu ici. Deux messages : une bienvenue, au premier usage réel d’un compte, et un avis à la personne avec qui un compte a partagé un document. Pas de résumés, pas d’actualités du produit, rien dont il faille se désabonner.

### Pourquoi ils n’arrivaient pas

Trois défauts, l’un après l’autre. L’avis a d’abord été branché sur un point d’entrée que l’application n’appelle jamais. Il a ensuite été corrigé pour partir une fois la réponse rendue — ce qui vient naturellement à l’écriture et se révèle faux dans une fonction serverless, car la plateforme peut geler l’instance à l’instant où une réponse part, et une requête qui n’est pas encore sortie ne sort jamais. Trois adresses ont été ajoutées sur un déploiement en service et le fournisseur de courrier n’a rien consigné : pas un échec, une absence.

Un envoi fait donc désormais partie de la requête qui l’a déclenché, et il est attendu, avec un délai de quatre secondes : un fournisseur qui passe une mauvaise minute ne transforme pas un partage en partage lent. Le troisième défaut était plus terne : la clé manquait vraiment dans les premières compilations.

### Pourquoi ils partaient en indésirables

SPF et DKIM étaient en place depuis le début et n’ont jamais été le problème. Ce qui manquait, c’était DMARC — l’entrée DNS qui dit ce qu’un destinataire doit faire du courrier qui échoue aux deux autres — et un domaine jeune qui envoie du courrier automatique sans elle est traité durement. C’est du DNS et non du code, ce qui explique en partie les trois tentatives.

Ce que le code peut faire, c’est ne rien aggraver. Les deux parties MIME plutôt que du texte seul, car un message automatique tout en texte venant d’un domaine sans historique est ce dont un filtre se méfie le plus. Un objet qui commence par le nom du document au lieu d’une adresse nue à côté d’un nom de fichier entre guillemets, une paire dont les filtres connaissent la forme. Et un Reply-To pointant vers la personne qui a partagé, car un message auquel on ne peut pas répondre se lit comme de la machinerie.

### Ce que ces messages ne sont pas

Ni images ni pixel de suivi ; la partie HTML reprend les mots de la partie texte, mise en forme par le convertisseur du produit lui-même. Le nom d’un document est imprimé dans une portion de code, si bien qu’un fichier nommé \`[Confirm your account](https://elsewhere.example)\` arrive comme du texte et non comme un lien vivant dans un message portant notre signature. Un déploiement sans clé n’envoie rien et ne dit rien, et un partage réussi n’est jamais annoncé comme échoué parce que le courrier l’a été. Tout cela est en anglais quelle que soit votre langue : cela part vers une adresse dont nous ne savons rien d’autre.

Autres lectures : [partager un document sous forme de lien](/blog/share-a-markdown-document-as-a-link) et [si un convertisseur en ligne est sûr](/blog/is-an-online-converter-safe).`,
      },
      es: {
        title: 'Correo que llega',
        summary: `Un mensaje de bienvenida, enviado una sola vez la primera vez que se usa una cuenta, y un aviso a la persona con quien se ha compartido un documento.

Los dos necesitaron tres intentos. El aviso colgaba de un extremo que la aplicación nunca llama, luego salía después de la respuesta, de modo que la petición jamás abandonaba la función, y luego lo frenó una clave que faltaba de verdad en las primeras compilaciones. La entregabilidad pedía DMARC, no solo SPF y DKIM.`,
        description:
          'TransformPipe envía dos mensajes: una bienvenida y un aviso de documento compartido. Por qué antes no llegaban y qué fue lo que lo arregló.',
        keywords:
          'por qué mis correos van a spam, registro dmarc para correo transaccional, función serverless que no envía correo, aviso de documento compartido, diferencia entre spf dkim y dmarc',
        body: `El correo de un producto es sobre todo algo de lo que desconfiar, así que conviene decir lo poco que hay aquí. Dos mensajes: una bienvenida, la primera vez que una cuenta se usa de verdad, y un aviso a la persona con quien una cuenta ha compartido un documento. Ni resúmenes, ni novedades del producto, ni nada de lo que haya que darse de baja.

### Por qué no llegaban

Tres fallos, uno detrás de otro. El aviso estaba conectado primero a un extremo que la aplicación no llama nunca. Después se arregló para salir una vez enviada la respuesta, que es lo natural al escribirlo y lo equivocado en una función serverless, porque la plataforma puede congelar la instancia en el momento en que sale una respuesta, y una petición que aún no ha salido ya no sale. Se añadieron tres direcciones en un despliegue en servicio y el proveedor de correo no registró absolutamente nada: no un fallo, una ausencia.

Así que un envío forma ahora parte de la petición que lo provocó, y se espera a él, con un plazo de cuatro segundos para que un proveedor con un mal minuto no convierta un compartir en un compartir lento. El tercer fallo era más gris que los otros dos: la clave faltaba de verdad en las primeras compilaciones.

### Por qué acababan en spam

SPF y DKIM estaban puestos desde el principio y nunca fueron el problema. Lo que faltaba era DMARC, el registro DNS que dice qué debe hacer un receptor con el correo que falla los otros dos, y a un dominio joven que manda correo automático sin él se le trata con dureza. Eso es DNS y no código, que es parte de por qué costó tres intentos encontrarlo.

Lo que el código sí puede hacer es no empeorarlo. Las dos partes MIME en lugar de solo texto, porque un correo automático de solo texto desde un dominio sin historial de envío es justo lo que más desconfianza da a un filtro. Un asunto que empieza por el nombre del documento y no por una dirección desnuda junto a un nombre de archivo entrecomillado, una pareja cuya forma los filtros conocen. Y un Reply-To que apunta a quien compartió, porque un mensaje que no se puede contestar se lee como maquinaria.

### Lo que estos mensajes no son

Sin imágenes y sin píxel de seguimiento; la parte HTML son las mismas palabras que la parte de texto, compuestas por el conversor del propio producto. El nombre de un documento se imprime dentro de un fragmento de código, de modo que un archivo llamado \`[Confirm your account](https://elsewhere.example)\` llega como texto y no como enlace vivo en un mensaje que lleva nuestra firma. Un despliegue sin clave configurada no envía nada y no dice nada, y un compartir que funcionó nunca se comunica como fallido porque fallara el correo. Todo ello va en inglés sea cual sea tu idioma: se dirige a una dirección de la que no sabemos nada más.

Relacionado: [compartir un documento como enlace](/blog/share-a-markdown-document-as-a-link) y [si un conversor en línea es seguro](/blog/is-an-online-converter-safe).`,
      },
      it: {
        title: 'Email che arrivano',
        summary: `Un messaggio di benvenuto, mandato una sola volta al primo uso di un account, e un avviso a chi ha ricevuto un documento condiviso.

Entrambi hanno richiesto tre tentativi. L’avviso era attaccato a un endpoint che l’applicazione non chiama mai, poi partiva dopo la risposta, così la richiesta non lasciava mai la funzione, e infine si è fermato su una chiave davvero assente dalle prime build. La recapitabilità voleva DMARC, non solo SPF e DKIM.`,
        description:
          'TransformPipe manda due messaggi: un benvenuto e un avviso di documento condiviso. Perché prima non arrivavano e che cosa li ha fatti arrivare.',
        keywords:
          'perché le mie email finiscono nello spam, record dmarc per email transazionali, funzione serverless che non invia email, avviso di documento condiviso, differenza tra spf dkim e dmarc',
        body: `La posta di un prodotto è per lo più una cosa di cui diffidare, quindi vale la pena dire quanta poca ce ne sia qui. Due messaggi: un benvenuto, la prima volta che un account viene davvero usato, e un avviso a chi un account ha condiviso un documento. Nessun riepilogo, nessuna novità di prodotto, niente da cui devi disiscriverti.

### Perché non arrivavano

Tre difetti, uno dopo l’altro. L’avviso era collegato in un primo momento a un endpoint che l’applicazione non chiama mai. Poi è stato corretto perché partisse dopo che la risposta era uscita — la cosa che viene naturale scrivere e quella sbagliata in una funzione serverless, perché la piattaforma può congelare l’istanza nell’istante in cui una risposta parte, e una richiesta non ancora uscita non esce più. Su un deploy in servizio sono stati aggiunti tre indirizzi e il fornitore di posta non ha registrato nulla: non un errore, un’assenza.

Un invio fa quindi ora parte della richiesta che lo ha provocato e viene atteso, con un limite di quattro secondi perché un fornitore in un minuto storto non trasformi una condivisione in una condivisione lenta. Il terzo difetto era più scialbo degli altri due: la chiave mancava davvero dalle prime build.

### Perché finivano nello spam

SPF e DKIM c’erano fin dall’inizio e non sono mai stati il problema. Quello che mancava era DMARC — il record DNS che dice a un destinatario che cosa fare della posta che fallisce gli altri due — e un dominio giovane che manda posta automatica senza di esso viene trattato con durezza. Quello è DNS e non codice, ed è in parte il motivo per cui ci sono voluti tre tentativi.

Quello che il codice può fare è non peggiorare le cose. Entrambe le parti MIME invece del solo testo, perché un messaggio automatico di solo testo da un dominio senza storia di invii è ciò di cui un filtro diffida di più. Un oggetto che comincia con il nome del documento invece che con un indirizzo nudo accanto a un nome di file fra virgolette, una coppia la cui forma i filtri conoscono. E un Reply-To che punta alla persona che ha condiviso, perché un messaggio a cui non puoi rispondere si legge come macchinario.

### Che cosa non sono questi messaggi

Nessuna immagine e nessun pixel di tracciamento; la parte HTML sono le stesse parole della parte testuale, composte dal convertitore del prodotto stesso. Il nome di un documento è stampato dentro un frammento di codice, così un file chiamato \`[Confirm your account](https://elsewhere.example)\` arriva come testo e non come link vivo in un messaggio che porta la nostra firma. Un deploy senza chiave configurata non manda nulla e non dice nulla, e una condivisione riuscita non viene mai segnalata come fallita solo perché la posta non è partita. Tutto è in inglese qualunque sia la tua lingua: va a un indirizzo di cui non sappiamo altro.

Da leggere: [condividere un documento con un link](/blog/share-a-markdown-document-as-a-link) e [se un convertitore online è sicuro](/blog/is-an-online-converter-safe).`,
      },
    },
    body:
      'A welcome message, sent once when an account is first used, and a notice to somebody a ' +
      'document has been shared with.\n\n' +
      'Both took three attempts. The notice was wired to an endpoint the app never calls, then ' +
      'fired after the response so the request never left the function, then blocked by a key ' +
      'that was genuinely absent from the first builds. Deliverability needed DMARC, not just ' +
      'SPF and DKIM.',
  },
  {
    date: '2026-09-09',
    title: 'Signing in with an email address',
    slug: 'sign-in-with-email',
    detail: {
      en: {
        description:
          'Sign in to TransformPipe with an address and a password, or with Google. What an unconfirmed address may do, and where the session cookie comes from.',
        keywords:
          'sign in with email and password, account for a markdown converter, reset my password, confirm my email address, sign in with google',
        body: `Handing a third party a new relationship in order to keep a text file is a lot to ask, and for the first weeks it was the only thing on offer. There is now a form beside the Google button. If the address is the same one, it is the same account.

### It is a dialogue, not a page

Signing in, signing up, asking for a reset link and entering the confirmation code are four views of one dialogue, over whatever you were already doing. Somebody here is usually in the middle of converting something, and a navigation loses the document they had open; changing your mind between "sign in" and "sign up" costs nothing for the same reason. Google sits below the form rather than above it — the form is what the dialogue is for now, and the button that leaves the page belongs after the one that does not.

No password rules are listed anywhere in it. The identity service enforces its own minimum, this application does not know what that minimum is, and a list of requirements that disagrees with the server is worse than no list at all: it tells you a password is fine and then refuses it. You get whatever the service actually said instead.

### Where the session comes from

Identity is Neon Auth's rather than ours, Google included — that is its provider, not a second integration here. The service lives on its own hostname, so letting the page talk to it directly would make its session cookie a third-party cookie for this site, and browsers are steadily refusing to carry those. Everything under \`/api/auth/\` is forwarded through this origin instead, and the cookie coming back has its Domain attribute stripped off. It then belongs to this site, first-party, and is carried without argument.

### Until the address is confirmed

An unconfirmed account keeps ten documents rather than five hundred, and cannot publish a document to a link anybody can open. Sharing with named addresses works either way, because that names people and asks each of them to sign in — it puts no page on the open web.

Neither limit is a trial or a paywall. An address nobody has proved cannot be recovered, cannot be told anything, and costs nothing to make a hundred of, so the two things held back are the two that matter: accumulating storage, and putting a page on the public internet under our domain. Entering the code lifts both on your very next request rather than your next sign-in. An account that arrived through Google is confirmed already — the provider asserts the address, so there was never anything here to confirm.

Related: [sharing a document as a link](/blog/share-a-markdown-document-as-a-link), and [turning an assistant's output into a page](/blog/ai-output-to-a-shareable-page).`,
      },
      de: {
        title: 'Anmelden mit einer E-Mail-Adresse',
        summary: `Google war der einzige Weg herein. Jetzt gibt es einen Dialog mit Anmelden, Registrieren, Passwort-Zurücksetzen und einem Einmalcode — und ein Konto mit unbestätigter Adresse wird zurückgehalten: kein Veröffentlichen per Link und zehn Dokumente statt fünfhundert, bis die Adresse bestätigt ist.`,
        description:
          'Bei TransformPipe mit Adresse und Passwort anmelden oder mit Google. Was ein unbestätigtes Konto darf und woher das Cookie der Sitzung kommt.',
        keywords:
          'mit e-mail adresse anmelden, konto für markdown konverter, passwort zurücksetzen, e-mail adresse bestätigen, mit google anmelden',
        body: `Einem Dritten eine neue Beziehung zu überlassen, nur um eine Textdatei zu behalten, ist viel verlangt — und in den ersten Wochen war es das Einzige, was hier angeboten wurde. Neben dem Google-Knopf steht jetzt ein Formular. Ist es dieselbe Adresse, ist es dasselbe Konto.

### Ein Dialog, keine Seite

Anmelden, Registrieren, einen Link zum Zurücksetzen anfordern und den Bestätigungscode eingeben sind vier Ansichten eines Dialogs, der sich über das legt, was Sie gerade getan haben. Wer hier ist, konvertiert meist gerade etwas, und ein Seitenwechsel würde das offene Dokument verlieren; die Meinung zwischen „Anmelden“ und „Registrieren“ zu ändern kostet aus demselben Grund nichts. Google steht unter dem Formular und nicht darüber: Das Formular ist der Zweck dieses Dialogs, und der Knopf, der die Seite verlässt, gehört hinter den, der es nicht tut.

Regeln für das Passwort stehen nirgends darin. Der Identitätsdienst setzt seine eigene Mindestanforderung durch, diese Anwendung kennt sie nicht, und eine Liste von Anforderungen, die dem Server widerspricht, ist schlechter als keine Liste: Sie sagt Ihnen, ein Passwort sei in Ordnung, und weist es dann ab. Sie sehen stattdessen, was der Dienst tatsächlich gesagt hat.

### Woher die Sitzung kommt

Die Identität gehört Neon Auth und nicht uns, Google eingeschlossen — das ist dessen Anbieter, keine zweite Anbindung hier. Der Dienst liegt auf einem eigenen Hostnamen: Würde die Seite direkt mit ihm sprechen, wäre sein Sitzungs-Cookie für diese Seite ein Drittanbieter-Cookie, und Browser verweigern solche zunehmend. Alles unter \`/api/auth/\` läuft deshalb über diese Herkunft, und dem Cookie auf dem Rückweg wird das Domain-Attribut genommen. Es gehört dann dieser Seite, ist erstanbieterisch und wird ohne Diskussion mitgeführt.

### Bis die Adresse bestätigt ist

Ein unbestätigtes Konto behält zehn Dokumente statt fünfhundert und kann kein Dokument unter einem Link veröffentlichen, den jede Person öffnen kann. Das Teilen mit benannten Adressen geht in beiden Fällen, denn es benennt Menschen und verlangt von jedem eine Anmeldung — es stellt keine Seite ins offene Netz.

Keine der beiden Grenzen ist eine Testphase oder eine Bezahlschranke. Eine Adresse, die niemand nachgewiesen hat, lässt sich nicht wiederherstellen, ihr lässt sich nichts mitteilen, und hundert davon kosten nichts. Zurückgehalten werden deshalb genau die zwei Dinge, auf die es ankommt: Speicher anzusammeln und eine Seite unter unserer Domain ins öffentliche Netz zu stellen. Den Code einzugeben hebt beides bei der nächsten Anfrage auf, nicht erst bei der nächsten Anmeldung. Ein Konto, das über Google kam, ist ohnehin bestätigt — der Anbieter versichert die Adresse, es gab hier also nie etwas zu bestätigen.

Weiter: [ein Dokument als Link teilen](/blog/share-a-markdown-document-as-a-link) und [aus der Ausgabe eines Assistenten eine Seite machen](/blog/ai-output-to-a-shareable-page).`,
      },
      fr: {
        title: 'Se connecter avec une adresse e-mail',
        summary: `Google était la seule porte d’entrée. Il y a maintenant une boîte de dialogue avec connexion, inscription, réinitialisation du mot de passe et code à usage unique, et un compte dont l’adresse n’est pas confirmée est retenu : pas de publication par lien, et dix documents au lieu de cinq cents, tant que l’adresse n’est pas confirmée.`,
        description:
          'Se connecter à TransformPipe avec une adresse et un mot de passe, ou avec Google. Ce qu’un compte non confirmé peut faire, et d’où vient le cookie de session.',
        keywords:
          'se connecter avec une adresse e-mail, compte pour un convertisseur markdown, réinitialiser mon mot de passe, confirmer mon adresse e-mail, se connecter avec google',
        body: `Confier à un tiers une relation de plus pour garder un fichier texte, c’est beaucoup demander, et pendant les premières semaines c’était la seule offre. Un formulaire se tient désormais à côté du bouton Google. Si l’adresse est la même, le compte est le même.

### Une boîte de dialogue, pas une page

Se connecter, s’inscrire, demander un lien de réinitialisation et saisir le code de confirmation sont quatre vues d’un même dialogue, posé par-dessus ce que vous faisiez. Qui vient ici est le plus souvent en train de convertir quelque chose, et une navigation perdrait le document ouvert ; changer d’avis entre « se connecter » et « s’inscrire » ne coûte rien pour la même raison. Google se place sous le formulaire plutôt qu’au-dessus : le formulaire est la raison d’être de ce dialogue, et le bouton qui quitte la page vient après celui qui ne le fait pas.

Aucune règle de mot de passe n’y figure. Le service d’identité impose son propre minimum, cette application ignore lequel, et une liste d’exigences en désaccord avec le serveur vaut moins que pas de liste du tout : elle vous dit qu’un mot de passe convient, puis le refuse. Vous recevez à la place ce que le service a réellement répondu.

### D’où vient la session

L’identité appartient à Neon Auth et non à nous, Google compris — c’est son fournisseur, pas une seconde intégration ici. Le service vit sur son propre nom d’hôte : laisser la page lui parler directement ferait de son cookie de session un cookie tiers pour ce site, et les navigateurs refusent peu à peu de les transporter. Tout ce qui se trouve sous \`/api/auth/\` passe donc par cette origine, et le cookie du retour se voit retirer son attribut Domain. Il appartient alors à ce site, en propre, et il est transporté sans discussion.

### Tant que l’adresse n’est pas confirmée

Un compte non confirmé garde dix documents plutôt que cinq cents, et ne peut pas publier un document sous un lien ouvert à tous. Le partage vers des adresses nommées fonctionne dans les deux cas, car il nomme des personnes et demande à chacune de se connecter — il ne met aucune page sur le web ouvert.

Aucune de ces deux limites n’est un essai ni un péage. Une adresse que personne n’a prouvée ne peut être récupérée, ne peut rien apprendre, et n’en coûte rien pour en fabriquer cent ; les deux choses retenues sont donc les deux qui comptent : accumuler du stockage, et poser une page sur l’internet public sous notre domaine. Saisir le code lève les deux dès votre requête suivante, et non à la prochaine connexion. Un compte arrivé par Google est déjà confirmé — le fournisseur atteste l’adresse, il n’y a donc jamais rien eu à confirmer ici.

Autres lectures : [partager un document sous forme de lien](/blog/share-a-markdown-document-as-a-link) et [faire une page de la sortie d’un assistant](/blog/ai-output-to-a-shareable-page).`,
      },
      es: {
        title: 'Iniciar sesión con una dirección de correo',
        summary: `Google era la única puerta de entrada. Ahora hay un diálogo con inicio de sesión, registro, restablecimiento de contraseña y un código de un solo uso, y una cuenta sin dirección confirmada queda retenida: no puede publicar por enlace y guarda diez documentos en vez de quinientos, hasta que la dirección esté confirmada.`,
        description:
          'Entrar en TransformPipe con una dirección y una contraseña, o con Google. Qué puede hacer una cuenta sin confirmar y de dónde sale la cookie de sesión.',
        keywords:
          'iniciar sesión con correo y contraseña, cuenta para un conversor de markdown, restablecer mi contraseña, confirmar mi dirección de correo, entrar con google',
        body: `Entregarle a un tercero una relación nueva solo para conservar un archivo de texto es mucho pedir, y durante las primeras semanas era lo único que había. Ahora hay un formulario junto al botón de Google. Si la dirección es la misma, la cuenta es la misma.

### Un diálogo, no una página

Entrar, registrarse, pedir un enlace de restablecimiento y escribir el código de confirmación son cuatro vistas de un mismo diálogo, encima de lo que estuvieras haciendo. Quien llega aquí suele estar a medio convertir algo, y una navegación pierde el documento abierto; cambiar de idea entre «entrar» y «registrarse» no cuesta nada por la misma razón. Google va debajo del formulario y no encima: el formulario es aquello para lo que existe el diálogo, y el botón que abandona la página va después del que no lo hace.

No figura ninguna regla de contraseña. El servicio de identidad impone su propio mínimo, esta aplicación no sabe cuál es, y una lista de requisitos que contradice al servidor es peor que ninguna lista: te dice que una contraseña vale y luego la rechaza. En su lugar ves lo que el servicio dijo de verdad.

### De dónde viene la sesión

La identidad es de Neon Auth y no nuestra, Google incluido: ese es su proveedor, no una segunda integración aquí. El servicio vive en su propio nombre de anfitrión, así que dejar que la página hablara con él directamente convertiría su cookie de sesión en una cookie de terceros para este sitio, y los navegadores cada vez se niegan más a llevarlas. Todo lo que hay bajo \`/api/auth/\` se reenvía por este origen, y a la cookie de vuelta se le quita el atributo Domain. Pasa entonces a ser de este sitio, de primera parte, y se lleva sin discusión.

### Hasta que la dirección está confirmada

Una cuenta sin confirmar guarda diez documentos en vez de quinientos y no puede publicar un documento en un enlace que abra cualquiera. Compartir con direcciones concretas funciona en ambos casos, porque nombra personas y le pide a cada una que inicie sesión: no pone ninguna página en la web abierta.

Ninguno de los dos límites es una prueba ni un muro de pago. Una dirección que nadie ha demostrado no se puede recuperar, no se le puede comunicar nada y cuesta cero hacer cien, de modo que lo que se retiene son las dos cosas que importan: acumular almacenamiento y poner una página en la internet pública bajo nuestro dominio. Escribir el código levanta ambas en su siguiente petición, no en su siguiente inicio de sesión. Una cuenta llegada por Google ya está confirmada: el proveedor da fe de la dirección, así que aquí nunca hubo nada que confirmar.

Relacionado: [compartir un documento como enlace](/blog/share-a-markdown-document-as-a-link) y [convertir la salida de un asistente en una página](/blog/ai-output-to-a-shareable-page).`,
      },
      it: {
        title: 'Accedere con un indirizzo email',
        summary: `Google era l’unica porta d’ingresso. Ora c’è una finestra di dialogo con accesso, registrazione, reimpostazione della password e un codice usa e getta, e un account con indirizzo non confermato viene trattenuto: nessuna pubblicazione tramite link e dieci documenti invece di cinquecento, finché l’indirizzo non è confermato.`,
        description:
          'Accedere a TransformPipe con un indirizzo e una password, oppure con Google. Che cosa può fare un account non confermato e da dove arriva il cookie di sessione.',
        keywords:
          'accedere con email e password, account per un convertitore markdown, reimpostare la password, confermare il mio indirizzo email, accedere con google',
        body: `Affidare a un terzo un rapporto in più solo per tenere un file di testo è chiedere parecchio, e per le prime settimane era l’unica cosa offerta. Ora accanto al pulsante di Google c’è un modulo. Se l’indirizzo è lo stesso, l’account è lo stesso.

### Una finestra di dialogo, non una pagina

Accedere, registrarsi, chiedere un link di reimpostazione e inserire il codice di conferma sono quattro viste di un unico dialogo, sopra a quello che stavi già facendo. Chi arriva qui di solito sta convertendo qualcosa, e una navigazione perde il documento aperto; cambiare idea fra «accedi» e «registrati» non costa nulla per la stessa ragione. Google sta sotto il modulo e non sopra: il modulo è il motivo per cui il dialogo esiste, e il pulsante che lascia la pagina viene dopo quello che non la lascia.

Non c’è scritta da nessuna parte una regola sulla password. Il servizio di identità impone il proprio minimo, questa applicazione non sa quale sia, e un elenco di requisiti in disaccordo con il server è peggio di nessun elenco: ti dice che una password va bene e poi la rifiuta. Vedi invece quello che il servizio ha detto davvero.

### Da dove arriva la sessione

L’identità è di Neon Auth e non nostra, Google compreso: quello è il suo fornitore, non una seconda integrazione qui. Il servizio vive su un nome host proprio, perciò lasciare che la pagina gli parlasse direttamente renderebbe il suo cookie di sessione un cookie di terze parti per questo sito, e i browser si rifiutano sempre più di portarli. Tutto quello che sta sotto \`/api/auth/\` passa invece attraverso questa origine, e al cookie di ritorno viene tolto l’attributo Domain. A quel punto appartiene a questo sito, di prima parte, e viene portato senza discussioni.

### Finché l’indirizzo non è confermato

Un account non confermato tiene dieci documenti invece di cinquecento e non può pubblicare un documento su un link che chiunque possa aprire. La condivisione con indirizzi indicati funziona in entrambi i casi, perché nomina delle persone e chiede a ciascuna di accedere: non mette nessuna pagina sul web aperto.

Nessuno dei due limiti è una prova o un muro a pagamento. Un indirizzo che nessuno ha dimostrato non si può recuperare, non si può avvisare di nulla e non costa niente farne cento, quindi le due cose trattenute sono le due che contano: accumulare spazio e mettere una pagina sull’internet pubblico sotto il nostro dominio. Inserire il codice le toglie entrambe già alla richiesta successiva, non al prossimo accesso. Un account arrivato tramite Google è già confermato: il fornitore attesta l’indirizzo, quindi qui non c’è mai stato nulla da confermare.

Da leggere: [condividere un documento con un link](/blog/share-a-markdown-document-as-a-link) e [trasformare l’output di un assistente in una pagina](/blog/ai-output-to-a-shareable-page).`,
      },
    },
    body:
      'Google was the only way in. There is now a dialogue with sign-in, sign-up, a password ' +
      'reset and a one-time code, and an unconfirmed account is held back: no publishing by ' +
      'link, and ten documents rather than five hundred, until the address is confirmed.',
  },
  {
    date: '2026-09-09',
    title: 'Five languages',
    slug: 'five-languages',
    detail: {
      en: {
        description:
          'The interface, the documentation and every page of prose read in English, German, French, Spanish and Italian. What is translated here, and what is not.',
        keywords:
          'document converter in german, markdown converter in french, convert markdown to html in spanish, change the interface language, multilingual online converter',
        body: `The switcher in the header names each language in itself — Deutsch, Français, Español, Italiano — because that is the only name a reader of it recognises. Choosing one takes you to the same page in that language, and it stays chosen.

### The language is in the address

\`/de/docs\`, \`/fr/csv-to-markdown\`, \`/es/markdown-to-html\`: one address per page per language, which is what a search engine needs in order to offer somebody the right one. English deliberately keeps the bare paths. Sixty-eight pages were already indexed at them, and moving English under a prefix of its own would have traded everything a search engine knows about this site for a tidier scheme.

A browser asking for a language nobody has written here lands on English, rather than on a redirect to something it cannot read. Dates and month names are not translated by hand at all — \`Intl\` renders them, which is also why English here reads "8 September 2026" and not the American order.

### One catalogue, checked by the build

Every sentence the interface says lives in one typed catalogue, with English as the source. A key added in English and forgotten in German does not compile, which removes the failure mode of every string table that is checked by hand.

Types cannot see everything, though. A list of three sections satisfies the same type as a list of five, so a translator who dropped a paragraph would ship a page missing it, in one language, silently. So a build step walks each language against English — same keys, same list lengths, nothing empty, the same placeholders — and it runs inside the build, so a language that does not line up stops a deploy instead of reaching a reader. It found 192 missing keys the first time it ran.

### The blog is a different thing

An article is a file rather than a string, and a translation of one is another file beside it, so the blog is translated a piece at a time. English, German and French have all sixty-three. Where a language has nothing, it lists nothing, links to nothing and claims no \`hreflang\` for it: a heading over an empty index is worse than an honest absence.

### What stays in English

The API's messages and the connector's, because an API answers in one language. The consent page an assistant sends you to, and the server's own copy of a shared document: both are rendered for a reader we know nothing about, at an address with no language in it, and guessing wrong on a consent screen is worse than English. The entries in this changelog are English too — a page like this one is written in another language when it is worth having in it.

Related: [what a Markdown to HTML converter is for](/blog/markdown-to-html-converter), and [choosing among online document converters](/blog/best-online-document-converters).`,
      },
      de: {
        title: 'Fünf Sprachen',
        summary: `Oberfläche, Dokumentation und alle Textseiten liegen auf Englisch, Deutsch, Französisch, Spanisch und Italienisch vor — die Sätze in einem einzigen typisierten Katalog, dazu ein Build-Schritt, der jede Sprache gegen das Englische prüft: gleiche Schlüssel, gleiche Listenlängen, nichts leer, dieselben Platzhalter. Beim ersten Lauf fand er 192 fehlende Schlüssel. Die Sprache steht in der Adresse — \`/de/docs\`, \`/fr/csv-to-markdown\` —, und Englisch behält die bloßen Pfade, weil achtundsechzig Seiten dort schon indexiert waren.`,
        description:
          'Oberfläche, Dokumentation und alle Textseiten gibt es auf Englisch, Deutsch, Französisch, Spanisch und Italienisch. Was hier übersetzt ist und was nicht.',
        keywords:
          'dokumentenkonverter auf deutsch, markdown konverter deutsche oberfläche, sprache der oberfläche umstellen, markdown in html auf deutsch, mehrsprachiger online konverter',
        body: `Die Sprachauswahl in der Kopfzeile nennt jede Sprache so, wie sie sich selbst nennt — Deutsch, Français, Español, Italiano —, denn das ist der einzige Name, den ihre Leser wiedererkennen. Die Auswahl führt auf dieselbe Seite in dieser Sprache und bleibt gewählt.

### Die Sprache steht in der Adresse

\`/de/docs\`, \`/fr/csv-to-markdown\`, \`/es/markdown-to-html\`: eine Adresse pro Seite und Sprache, denn nur so kann eine Suchmaschine die passende anbieten. Englisch behält bewusst die bloßen Pfade. Achtundsechzig Seiten waren dort schon indexiert; Englisch unter ein eigenes Präfix zu schieben hätte alles, was eine Suchmaschine über diese Seite weiß, gegen ein ordentlicheres Schema getauscht.

Ein Browser, der eine Sprache verlangt, die hier niemand geschrieben hat, landet auf Englisch statt auf einer Weiterleitung zu etwas, das er nicht lesen kann. Datumsangaben und Monatsnamen werden gar nicht von Hand übersetzt: \`Intl\` setzt sie, weshalb im Englischen „8 September 2026“ steht und nicht die amerikanische Reihenfolge.

### Ein Katalog, vom Build geprüft

Jeder Satz, den die Oberfläche sagt, liegt in einem typisierten Katalog, und das Englische ist die Quelle. Ein Schlüssel, der im Englischen hinzukommt und im Deutschen vergessen wird, kompiliert nicht — damit ist die Schwachstelle jeder handgeprüften Textsammlung weg.

Typen sehen aber nicht alles. Eine Liste mit drei Abschnitten erfüllt denselben Typ wie eine mit fünf; wer beim Übersetzen einen Absatz verliert, liefert also eine Seite aus, der er fehlt — in einer Sprache, unbemerkt. Ein Build-Schritt läuft deshalb jede Sprache gegen das Englische ab: gleiche Schlüssel, gleiche Listenlängen, nichts leer, dieselben Platzhalter. Er steckt im Build, also hält eine Sprache, die nicht zusammenpasst, die Auslieferung auf, statt bei Lesern zu landen. Beim ersten Lauf fand er 192 fehlende Schlüssel.

### Das Blog ist etwas anderes

Ein Artikel ist eine Datei und keine Zeichenkette, seine Übersetzung eine weitere Datei daneben — das Blog wird also Stück für Stück übersetzt. Englisch, Deutsch und Französisch haben alle dreiundsechzig. Wo eine Sprache nichts hat, listet sie nichts, verlinkt nichts und beansprucht kein \`hreflang\` dafür: Eine Überschrift über einem leeren Verzeichnis ist schlechter als ein ehrliches Fehlen.

### Was englisch bleibt

Die Meldungen der API und des Connectors, denn eine API antwortet in einer Sprache. Die Zustimmungsseite, auf die ein Assistent Sie schickt, und die serverseitige Fassung eines geteilten Dokuments: Beide werden für Leser gesetzt, über die wir nichts wissen, an einer Adresse ohne Sprache — und auf einer Zustimmungsseite falsch zu raten ist schlechter als Englisch. Die Einträge dieses Änderungsprotokolls sind ebenfalls englisch; eine Seite wie diese wird übersetzt, wenn sie es wert ist.

Weiter: [wozu ein Markdown-nach-HTML-Konverter da ist](/blog/markdown-to-html-converter) und [wie man unter Online-Dokumentenkonvertern wählt](/blog/best-online-document-converters).`,
      },
      fr: {
        title: 'Cinq langues',
        summary: `L’interface, la documentation et les pages de texte sont en anglais, en allemand, en français, en espagnol et en italien, les phrases tenues dans un seul catalogue typé et une étape de compilation qui confronte chaque langue à l’anglais : mêmes clés, mêmes longueurs de listes, rien de vide, mêmes substituants. Elle a trouvé 192 clés manquantes à son premier passage.

La langue est dans l’adresse — \`/de/docs\`, \`/fr/csv-to-markdown\` — et l’anglais garde les chemins nus, car soixante-huit pages y étaient déjà indexées.`,
        description:
          'L’interface, la documentation et chaque page de texte se lisent en anglais, allemand, français, espagnol et italien. Ce qui est traduit ici, et ce qui ne l’est pas.',
        keywords:
          'convertisseur de documents en français, convertisseur markdown en français, changer la langue de l’interface, convertir markdown en html en français, convertisseur en ligne multilingue',
        body: `Le sélecteur de l’en-tête nomme chaque langue dans sa propre langue — Deutsch, Français, Español, Italiano — car c’est le seul nom que reconnaît celui qui la lit. En choisir une vous emmène à la même page dans cette langue, et le choix demeure.

### La langue est dans l’adresse

\`/de/docs\`, \`/fr/csv-to-markdown\`, \`/es/markdown-to-html\` : une adresse par page et par langue, ce dont un moteur de recherche a besoin pour proposer la bonne. L’anglais garde délibérément les chemins nus. Soixante-huit pages y étaient déjà indexées, et glisser l’anglais sous un préfixe à lui aurait échangé tout ce qu’un moteur sait de ce site contre un schéma plus net.

Un navigateur qui réclame une langue que personne n’a écrite ici arrive sur l’anglais, plutôt que sur une redirection vers un texte qu’il ne peut pas lire. Les dates et les noms de mois ne sont pas traduits à la main : \`Intl\` les compose, ce qui explique aussi que l’anglais affiche ici « 8 September 2026 » et non l’ordre américain.

### Un seul catalogue, vérifié par la compilation

Chaque phrase que dit l’interface vit dans un catalogue typé, l’anglais faisant source. Une clé ajoutée en anglais et oubliée en allemand ne compile pas, ce qui supprime le défaut propre à toute table de chaînes vérifiée à la main.

Les types ne voient pourtant pas tout. Une liste de trois sections satisfait le même type qu’une liste de cinq : un traducteur qui perdrait un paragraphe livrerait donc une page amputée, dans une seule langue, sans bruit. Une étape de compilation parcourt donc chaque langue face à l’anglais — mêmes clés, mêmes longueurs de listes, rien de vide, mêmes substituants — et elle tourne dans la compilation, si bien qu’une langue qui ne correspond pas arrête un déploiement au lieu d’atteindre un lecteur. Elle a trouvé 192 clés manquantes à son premier passage.

### Le blog est autre chose

Un article est un fichier et non une chaîne, et sa traduction est un autre fichier à côté : le blog se traduit donc pièce par pièce. L’anglais, l’allemand et le français ont les soixante-trois. Là où une langue n’a rien, elle ne recense rien, ne relie rien et ne revendique aucun \`hreflang\` : un titre au-dessus d’un index vide vaut moins qu’une absence honnête.

### Ce qui reste en anglais

Les messages de l’API et ceux du connecteur, car une API répond dans une seule langue. La page de consentement vers laquelle un assistant vous envoie, et la version que le serveur rend d’un document partagé : toutes deux sont composées pour un lecteur dont nous ne savons rien, à une adresse sans langue, et se tromper sur un écran de consentement vaut moins que l’anglais. Les entrées de ce journal sont en anglais elles aussi — une page comme celle-ci est écrite dans une autre langue lorsqu’elle mérite d’y être.

Autres lectures : [à quoi sert un convertisseur Markdown vers HTML](/blog/markdown-to-html-converter) et [comment choisir parmi les convertisseurs de documents en ligne](/blog/best-online-document-converters).`,
      },
      es: {
        title: 'Cinco idiomas',
        summary: `La interfaz, la documentación y las páginas de texto están en inglés, alemán, francés, español e italiano, con las frases en un solo catálogo tipado y un paso de compilación que recorre cada idioma frente al inglés: mismas claves, mismas longitudes de lista, nada vacío, los mismos marcadores. Encontró 192 claves ausentes en su primera pasada.

El idioma está en la dirección — \`/de/docs\`, \`/fr/csv-to-markdown\` — y el inglés conserva las rutas desnudas, porque sesenta y ocho páginas ya estaban indexadas en ellas.`,
        description:
          'La interfaz, la documentación y todas las páginas de texto se leen en inglés, alemán, francés, español e italiano. Qué se traduce aquí y qué no.',
        keywords:
          'conversor de documentos en español, conversor de markdown en español, cambiar el idioma de la interfaz, convertir markdown a html en español, conversor en línea multilingüe',
        body: `El selector de la cabecera nombra cada idioma en sí mismo — Deutsch, Français, Español, Italiano — porque ese es el único nombre que reconoce quien lo lee. Elegir uno te lleva a la misma página en ese idioma, y la elección se queda puesta.

### El idioma está en la dirección

\`/de/docs\`, \`/fr/csv-to-markdown\`, \`/es/markdown-to-html\`: una dirección por página y por idioma, que es lo que un buscador necesita para ofrecer la correcta. El inglés conserva a propósito las rutas desnudas. Sesenta y ocho páginas ya estaban indexadas en ellas, y meter el inglés bajo un prefijo propio habría cambiado todo lo que un buscador sabe de este sitio por un esquema más pulcro.

Un navegador que pide un idioma que aquí nadie ha escrito aterriza en inglés, y no en una redirección hacia algo que no puede leer. Las fechas y los nombres de los meses no se traducen a mano en absoluto: los compone \`Intl\`, que es también por lo que el inglés dice aquí «8 September 2026» y no el orden americano.

### Un solo catálogo, comprobado por la compilación

Cada frase que dice la interfaz vive en un catálogo tipado, con el inglés como fuente. Una clave añadida en inglés y olvidada en alemán no compila, lo que elimina el modo de fallo de cualquier tabla de cadenas revisada a mano.

Pero los tipos no lo ven todo. Una lista de tres secciones satisface el mismo tipo que una de cinco, así que quien tradujera perdiendo un párrafo publicaría una página incompleta, en un idioma, sin ruido. Por eso un paso de compilación recorre cada idioma frente al inglés — mismas claves, mismas longitudes de lista, nada vacío, los mismos marcadores — y corre dentro de la compilación, de modo que un idioma que no cuadra detiene un despliegue en lugar de llegar a un lector. Encontró 192 claves ausentes en su primera pasada.

### El blog es otra cosa

Un artículo es un archivo y no una cadena, y su traducción es otro archivo al lado, así que el blog se traduce pieza a pieza. El inglés, el alemán y el francés tienen los sesenta y tres. Donde un idioma no tiene nada, no lista nada, no enlaza nada y no reclama ningún \`hreflang\`: un encabezado sobre un índice vacío es peor que una ausencia honesta.

### Qué se queda en inglés

Los mensajes de la API y los del conector, porque una API responde en un idioma. La página de consentimiento a la que te manda un asistente, y la versión que el servidor compone de un documento compartido: ambas se preparan para un lector del que no sabemos nada, en una dirección sin idioma dentro, y equivocarse en una pantalla de consentimiento es peor que el inglés. Las entradas de este registro de cambios también están en inglés; una página como esta se escribe en otro idioma cuando merece la pena tenerla en él.

Relacionado: [para qué sirve un conversor de Markdown a HTML](/blog/markdown-to-html-converter) y [cómo elegir entre los conversores de documentos en línea](/blog/best-online-document-converters).`,
      },
      it: {
        title: 'Cinque lingue',
        summary: `L’interfaccia, la documentazione e le pagine di testo sono in inglese, tedesco, francese, spagnolo e italiano, con le frasi in un solo catalogo tipizzato e un passaggio di build che confronta ogni lingua con l’inglese: stesse chiavi, stesse lunghezze degli elenchi, niente di vuoto, gli stessi segnaposto. Alla prima esecuzione ha trovato 192 chiavi mancanti.

La lingua sta nell’indirizzo — \`/de/docs\`, \`/fr/csv-to-markdown\` — e l’inglese conserva i percorsi nudi, perché sessantotto pagine erano già indicizzate lì.`,
        description:
          'L’interfaccia, la documentazione e ogni pagina di testo si leggono in inglese, tedesco, francese, spagnolo e italiano. Che cosa qui è tradotto e che cosa no.',
        keywords:
          'convertitore di documenti in italiano, convertitore markdown in italiano, cambiare la lingua dell’interfaccia, convertire markdown in html in italiano, convertitore online multilingue',
        body: `Il selettore nell’intestazione nomina ogni lingua nella lingua stessa — Deutsch, Français, Español, Italiano — perché quello è l’unico nome che chi la legge riconosce. Sceglierne una ti porta alla stessa pagina in quella lingua, e la scelta resta.

### La lingua sta nell’indirizzo

\`/de/docs\`, \`/fr/csv-to-markdown\`, \`/es/markdown-to-html\`: un indirizzo per pagina e per lingua, che è ciò di cui un motore di ricerca ha bisogno per proporre quello giusto. L’inglese conserva di proposito i percorsi nudi. Sessantotto pagine erano già indicizzate lì, e spostare l’inglese sotto un prefisso proprio avrebbe barattato tutto quello che un motore sa di questo sito con uno schema più ordinato.

Un browser che chiede una lingua che qui nessuno ha scritto atterra sull’inglese, invece che su un reindirizzamento verso qualcosa che non sa leggere. Le date e i nomi dei mesi non si traducono affatto a mano: li compone \`Intl\`, ed è anche il motivo per cui qui l’inglese scrive «8 September 2026» e non l’ordine americano.

### Un solo catalogo, controllato dalla build

Ogni frase che l’interfaccia pronuncia vive in un catalogo tipizzato, con l’inglese come fonte. Una chiave aggiunta in inglese e dimenticata in tedesco non compila, il che elimina il difetto di ogni tabella di stringhe controllata a mano.

I tipi però non vedono tutto. Un elenco di tre sezioni soddisfa lo stesso tipo di uno di cinque, quindi chi traducendo perdesse un paragrafo pubblicherebbe una pagina monca, in una lingua, in silenzio. Perciò un passaggio di build percorre ogni lingua contro l’inglese — stesse chiavi, stesse lunghezze degli elenchi, niente di vuoto, gli stessi segnaposto — e sta dentro la build, così una lingua che non combacia ferma un rilascio invece di arrivare a un lettore. Alla prima esecuzione ha trovato 192 chiavi mancanti.

### Il blog è un’altra cosa

Un articolo è un file e non una stringa, e la sua traduzione è un altro file accanto: il blog si traduce quindi un pezzo alla volta. L’inglese, il tedesco e il francese hanno tutti e sessantatré. Dove una lingua non ha nulla, non elenca nulla, non collega nulla e non rivendica alcun \`hreflang\`: un titolo sopra un indice vuoto è peggio di un’assenza onesta.

### Che cosa resta in inglese

I messaggi dell’API e quelli del connettore, perché un’API risponde in una lingua sola. La pagina di consenso a cui ti manda un assistente, e la versione che il server compone di un documento condiviso: entrambe sono preparate per un lettore di cui non sappiamo nulla, a un indirizzo senza lingua dentro, e sbagliare su una schermata di consenso è peggio dell’inglese. Anche le voci di questo registro delle modifiche sono in inglese: una pagina come questa viene scritta in un’altra lingua quando vale la pena averla.

Da leggere: [a che cosa serve un convertitore da Markdown a HTML](/blog/markdown-to-html-converter) e [come scegliere fra i convertitori di documenti online](/blog/best-online-document-converters).`,
      },
    },
    body:
      'The interface, the documentation and the pages of words are in English, German, French, ' +
      'Spanish and Italian, with the words in one typed catalogue and a build step that walks ' +
      'every language against English: same keys, same array lengths, nothing empty, the same ' +
      'placeholders. It found 192 missing keys on its first run.\n\n' +
      'The language is in the address — `/de/docs`, `/fr/csv-to-markdown` — and English keeps the ' +
      'bare paths, because sixty-eight pages were already indexed at them.',
  },
  {
    date: '2026-09-09',
    title: 'An embed, and the frame policy the app never had',
    slug: 'embed-the-converter',
    detail: {
      en: {
        description:
          'A page at /embed is the TransformPipe converter with no chrome, to frame in your own site. The file converts in the visitor’s browser and reaches no server.',
        keywords:
          'embed a document converter in my site, iframe markdown to html converter, add a file converter to a web page, postmessage iframe integration, white label markdown converter',
        body: `A dropzone, the document it produced, a copy button and a download. That is the whole of \`/embed\`: no header, no footer, no blog, no account, no history — nothing that would look like our navigation turning up inside somebody else's page.

### What the host controls

\`?conversion=\` decides which conversion the frame opens on, and \`?theme=dark\` or \`?theme=light\` decides how it looks. The host chooses the theme rather than the visitor's operating system, because a widget that follows the OS lands as a dark rectangle in a light page for half the audience.

Results come back by \`postMessage\` to the parent window, and every message carries \`source: 'TransformPipe'\` — a host listening on \`window\` hears from every frame it has and from its own scripts, so without a name to check, the first handler anybody writes fires on somebody else's message. One message is sent on load, so a host can wait for the frame instead of guessing at a timeout. Check \`event.origin\` at your end.

### Why frame it rather than proxy it

The conversion runs in the visitor's browser, exactly as it does here. Your reader drops a file and it reaches neither your server nor ours. A host that wants server-side conversion should call the API; what the embed offers is the one thing an API cannot, which is the file never leaving the machine it is on.

It is also anonymous on purpose. The embed is rendered instead of the application rather than as the application with its chrome hidden, and it sits above the part that asks the server who is signed in — so a page on any domain framing it never causes a credentialed request to us. There is no cookie banner in it either: asking for consent inside somebody else's page is asking on their behalf.

### Everything else now refuses to be framed

The embed needed a \`frame-ancestors\` rule, and writing one exposed that no route had ever had one. Every other address now says no — \`frame-ancestors 'none'\` and \`X-Frame-Options: DENY\` — so the converter that has an account behind it cannot be put in a frame at all. \`/embed\` and its translations (\`/de/embed\` and the rest) allow any ancestor and carry \`noindex\`, because a chromeless converter is not a page anybody should arrive at from a search.

Keeping a document, sharing it and the history stay on transformpipe.com. The embed has no session to reach them with, and that is the design rather than a limitation.

Related: [converting Markdown to HTML in JavaScript](/blog/markdown-to-html-in-javascript), and [whether an online converter is safe](/blog/is-an-online-converter-safe).`,
      },
      de: {
        title: 'Ein Embed, und die Frame-Regel, die die App nie hatte',
        summary: `\`/embed\` ist der Konverter ohne alles Beiwerk, für eine Seite, die ihn beherbergen will, und er spricht per \`postMessage\` mit seinem Gastgeber. Ihn hinzuzufügen hieß, die fehlende Regel endlich aufzuschreiben: Jede andere Route weigert sich nun überhaupt, in einen Frame gestellt zu werden — was vorher nirgends stand.`,
        description:
          'Die Seite /embed ist der TransformPipe-Konverter ohne Beiwerk, zum Einbetten in die eigene Seite. Die Datei wird im Browser umgewandelt und erreicht keinen Server.',
        keywords:
          'konverter in eigene seite einbetten, markdown konverter im iframe, dateikonverter auf website einbinden, postmessage einbindung iframe, konverter ohne upload einbetten',
        body: `Ein Ablagefeld, das entstandene Dokument, ein Knopf zum Kopieren und einer zum Herunterladen. Das ist alles, was unter \`/embed\` steht: keine Kopfzeile, keine Fußzeile, kein Blog, kein Konto, kein Verlauf — nichts, das aussähe wie unsere Navigation in der Seite eines anderen.

### Was der Gastgeber bestimmt

\`?conversion=\` legt fest, mit welcher Konvertierung der Frame öffnet, und \`?theme=dark\` oder \`?theme=light\`, wie er aussieht. Das Erscheinungsbild wählt der Gastgeber und nicht das Betriebssystem des Besuchers, denn ein Baustein, der dem System folgt, landet für die Hälfte des Publikums als dunkles Rechteck in einer hellen Seite.

Ergebnisse kommen per \`postMessage\` beim übergeordneten Fenster heraus, und jede Nachricht trägt \`source: 'TransformPipe'\`. Wer auf \`window\` lauscht, hört von jedem Frame und von den eigenen Skripten — ohne einen Namen zum Prüfen feuert die erste Behandlung, die jemand schreibt, also auf fremde Nachrichten. Beim Laden geht eine Nachricht hinaus, damit ein Gastgeber auf den Frame warten kann, statt eine Zeitspanne zu raten. Prüfen Sie \`event.origin\` auf Ihrer Seite.

### Warum einbetten und nicht weiterleiten

Die Konvertierung läuft im Browser des Besuchers, genau wie hier. Ihr Leser legt eine Datei ab, und sie erreicht weder Ihren Server noch unseren. Wer serverseitig umwandeln will, ruft die API; das Embed bietet das Einzige, was eine API nicht kann — dass die Datei den Rechner nie verlässt, auf dem sie liegt.

Es ist außerdem bewusst anonym. Das Embed wird anstelle der Anwendung gezeichnet und nicht als Anwendung mit versteckter Umgebung, und es liegt über dem Teil, der den Server fragt, wer angemeldet ist. Eine Seite auf irgendeiner Domain löst durch das Einbetten also nie eine Anfrage mit Anmeldedaten bei uns aus. Einen Cookie-Hinweis gibt es darin ebenfalls nicht: In der Seite eines anderen um Zustimmung zu bitten heißt, an dessen Stelle zu fragen.

### Alles andere verweigert sich dem Frame

Das Embed brauchte eine \`frame-ancestors\`-Regel, und sie zu schreiben machte sichtbar, dass keine Route je eine hatte. Jede andere Adresse sagt nun Nein — \`frame-ancestors 'none'\` und \`X-Frame-Options: DENY\` —, der Konverter mit dem Konto dahinter lässt sich also überhaupt nicht in einen Frame stellen. \`/embed\` und seine Sprachfassungen (\`/de/embed\` und die übrigen) erlauben jeden Vorfahren und tragen \`noindex\`, denn ein Konverter ohne Beiwerk ist keine Seite, auf der jemand aus einer Suche landen sollte.

Ein Dokument zu behalten, es zu teilen und der Verlauf bleiben auf transformpipe.com. Das Embed hat keine Sitzung, mit der es dorthin käme, und das ist so gebaut und keine Einschränkung.

Weiter: [Markdown mit JavaScript in HTML umwandeln](/blog/markdown-to-html-in-javascript) und [ob ein Online-Konverter sicher ist](/blog/is-an-online-converter-safe).`,
      },
      fr: {
        title: 'Un embed, et la règle de frame que l’application n’avait jamais eue',
        summary: `\`/embed\` est le convertisseur sans aucun décor, pour une page qui veut l’héberger, et il dialogue avec elle par \`postMessage\`. L’ajouter a obligé à écrire la règle qui manquait : toute autre route refuse désormais d’être mise dans un cadre, ce que rien ne disait auparavant.`,
        description:
          'La page /embed est le convertisseur TransformPipe sans décor, à intégrer dans votre site. Le fichier est converti dans le navigateur et n’atteint aucun serveur.',
        keywords:
          'intégrer un convertisseur de documents dans mon site, convertisseur markdown vers html en iframe, ajouter un convertisseur de fichiers à une page web, intégration iframe avec postmessage, convertisseur markdown en marque blanche',
        body: `Une zone de dépôt, le document produit, un bouton pour copier et un pour télécharger. C’est tout ce que contient \`/embed\` : pas d’en-tête, pas de pied de page, pas de blog, pas de compte, pas d’historique — rien qui ressemblerait à notre propre navigation apparaissant dans la page de quelqu’un d’autre.

### Ce que l’hôte contrôle

\`?conversion=\` décide quelle conversion le cadre ouvre, et \`?theme=dark\` ou \`?theme=light\` décide de son apparence. C’est l’hôte qui choisit le thème plutôt que le système d’exploitation du visiteur, car un composant qui suit le système atterrit en rectangle sombre sur une page claire pour la moitié du public.

Les résultats reviennent par \`postMessage\` vers la fenêtre parente, et chaque message porte \`source: 'TransformPipe'\` — un hôte qui écoute sur \`window\` entend chaque cadre qu’il contient et ses propres scripts, donc sans un nom à vérifier, le premier gestionnaire que quelqu’un écrit se déclenche sur le message d’un autre. Un message est envoyé au chargement, pour qu’un hôte puisse attendre le cadre plutôt que de deviner un délai. Vérifiez \`event.origin\` de votre côté.

### Pourquoi l’intégrer plutôt que le relayer

La conversion tourne dans le navigateur du visiteur, exactement comme ici. Votre lecteur dépose un fichier, et celui-ci n’atteint ni votre serveur ni le nôtre. Un hôte qui veut une conversion côté serveur doit appeler l’API ; ce que l’embed offre est la seule chose qu’une API ne peut pas faire, à savoir que le fichier ne quitte jamais la machine où il se trouve.

Il est aussi anonyme, délibérément. L’embed est dessiné à la place de l’application plutôt que comme l’application avec son décor caché, et il se situe au-dessus de la partie qui demande au serveur qui est connecté — une page sur n’importe quel domaine qui l’intègre ne provoque donc jamais de requête authentifiée vers nous. Il n’y a pas non plus de bandeau de cookies : demander un consentement dans la page de quelqu’un d’autre revient à demander en son nom.

### Tout le reste refuse désormais d’être mis dans un cadre

L’embed avait besoin d’une règle \`frame-ancestors\`, et l’écrire a révélé qu’aucune route n’en avait jamais eu. Toute autre adresse dit désormais non — \`frame-ancestors 'none'\` et \`X-Frame-Options: DENY\` —, si bien que le convertisseur qui a un compte derrière lui ne peut plus du tout être placé dans un cadre. \`/embed\` et ses traductions (\`/de/embed\` et les autres) autorisent n’importe quel ancêtre et portent \`noindex\`, car un convertisseur sans décor n’est pas une page où l’on devrait arriver depuis une recherche.

Conserver un document, le partager et l’historique restent sur transformpipe.com. L’embed n’a pas de session pour les atteindre, et c’est voulu, pas une limitation.

Autres lectures : [convertir du Markdown en HTML en JavaScript](/blog/markdown-to-html-in-javascript), et [si un convertisseur en ligne est sûr](/blog/is-an-online-converter-safe).`,
      },
      es: {
        title: 'Un embed, y la política de frames que la aplicación nunca tuvo',
        summary: `\`/embed\` es el conversor sin nada alrededor, para una página que quiera alojarlo, y habla con su anfitrión mediante \`postMessage\`. Añadirlo obligó a escribir la regla que faltaba: cualquier otra ruta se niega ahora a ser puesta en un frame, algo que antes no decía ninguna.`,
        description:
          'La página /embed es el conversor de TransformPipe sin nada alrededor, para insertarlo en tu sitio. El archivo se convierte en el navegador sin llegar a un servidor.',
        keywords:
          'insertar un conversor de documentos en mi sitio, iframe conversor de markdown a html, añadir un conversor de archivos a una página web, integración de iframe con postmessage, conversor de markdown de marca blanca',
        body: `Una zona para soltar el archivo, el documento resultante, un botón de copiar y otro de descargar. Eso es todo \`/embed\`: sin cabecera, sin pie, sin blog, sin cuenta, sin historial — nada que se parezca a nuestra navegación apareciendo dentro de la página de otra persona.

### Lo que controla el anfitrión

\`?conversion=\` decide con qué conversión se abre el frame, y \`?theme=dark\` o \`?theme=light\` decide su aspecto. El aspecto lo elige el anfitrión y no el sistema operativo del visitante, porque un widget que sigue al sistema aterriza como un rectángulo oscuro en una página clara para la mitad del público.

Los resultados vuelven por \`postMessage\` a la ventana superior, y cada mensaje lleva \`source: 'TransformPipe'\` — un anfitrión que escucha en \`window\` oye a cada frame que tiene y a sus propios scripts, así que sin un nombre que comprobar, el primer manejador que alguien escriba dispara con el mensaje de otro. Al cargar se envía un mensaje, para que un anfitrión pueda esperar al frame en vez de adivinar un tiempo de espera. Comprueba \`event.origin\` en tu extremo.

### Por qué insertarlo en un frame y no hacer de proxy

La conversión corre en el navegador del visitante, exactamente como aquí. Tu lector suelta un archivo y este no llega ni a tu servidor ni al nuestro. Quien quiera conversión en el servidor debe llamar a la API; lo que ofrece el embed es lo único que una API no puede, que el archivo nunca salga de la máquina en la que está.

También es anónimo a propósito. El embed se representa en lugar de la aplicación, no como la aplicación con su interfaz oculta, y se sitúa por encima de la parte que le pregunta al servidor quién ha iniciado sesión — así que una página en cualquier dominio que lo inserte nunca provoca una petición con credenciales hacia nosotros. Tampoco hay aviso de cookies dentro: pedir consentimiento dentro de la página de otro es pedirlo en su nombre.

### Todo lo demás se niega ahora a ser insertado en un frame

El embed necesitaba una regla \`frame-ancestors\`, y escribirla dejó al descubierto que ninguna ruta había tenido nunca una. Cualquier otra dirección dice ahora que no — \`frame-ancestors 'none'\` y \`X-Frame-Options: DENY\` — así que el conversor que tiene una cuenta detrás no puede insertarse en un frame de ninguna manera. \`/embed\` y sus traducciones (\`/de/embed\` y las demás) permiten cualquier antecesor y llevan \`noindex\`, porque un conversor sin interfaz no es una página a la que nadie debería llegar desde una búsqueda.

Guardar un documento, compartirlo y el historial se quedan en transformpipe.com. El embed no tiene sesión con la que alcanzarlos, y eso es diseño, no una limitación.

Relacionado: [convertir Markdown a HTML en JavaScript](/blog/markdown-to-html-in-javascript), y [si un conversor online es seguro](/blog/is-an-online-converter-safe).`,
      },
      it: {
        title: 'Un embed, e la regola sui frame che l’app non aveva mai avuto',
        summary: `\`/embed\` è il convertitore senza alcuna interfaccia di contorno, per una pagina che vuole ospitarlo, e comunica con chi lo ospita tramite \`postMessage\`. Aggiungerlo ha significato scrivere la regola che mancava: ogni altra rotta ora si rifiuta del tutto di essere incorniciata in un frame, cosa che prima non diceva nessuno.`,
        description:
          'Una pagina su /embed è il convertitore TransformPipe senza interfaccia, da incorniciare nel proprio sito: il file resta nel browser di chi visita.',
        keywords:
          'incorporare un convertitore di documenti nel sito, iframe convertitore markdown html, aggiungere un convertitore di file a una pagina web, integrazione iframe con postmessage, convertitore markdown senza marchio',
        body: `Una zona di rilascio, il documento prodotto, un pulsante per copiare e uno per scaricare. Questo è tutto ciò che sta sotto \`/embed\`: nessuna intestazione, nessun piè di pagina, nessun blog, nessun account, nessuna cronologia — nulla che assomigli alla nostra navigazione spuntata dentro la pagina di qualcun altro.

### Cosa controlla chi ospita

\`?conversion=\` decide con quale conversione si apre il frame, e \`?theme=dark\` oppure \`?theme=light\` decide il suo aspetto. È chi ospita a scegliere il tema, non il sistema operativo di chi visita, perché un widget che segue il sistema finisce per metà del pubblico come un rettangolo scuro dentro una pagina chiara.

I risultati tornano tramite \`postMessage\` alla finestra madre, e ogni messaggio porta \`source: 'TransformPipe'\` — chi ascolta su \`window\` sente ogni frame che ha e i propri script, quindi senza un nome da controllare il primo gestore che qualcuno scrive scatta sul messaggio di un altro. Al caricamento viene inviato un messaggio, così chi ospita può attendere il frame invece di indovinare un tempo massimo. Verifica \`event.origin\` sul tuo lato.

### Perché incorniciarlo invece di fare da proxy

La conversione avviene nel browser di chi visita, esattamente come qui. Il tuo lettore lascia cadere un file, e questo non raggiunge né il tuo server né il nostro. Chi vuole una conversione lato server deve chiamare l'API; quello che offre l'embed è l'unica cosa che un'API non può dare: che il file non lasci mai la macchina su cui si trova.

È anche anonimo di proposito. L'embed viene disegnato al posto dell'applicazione, non come l'applicazione con l'interfaccia nascosta, e si trova sopra la parte che chiede al server chi è connesso — così una pagina su qualsiasi dominio che lo incornici non provoca mai una richiesta con credenziali verso di noi. Non c'è nemmeno un avviso sui cookie: chiedere il consenso dentro la pagina di qualcun altro significa chiederlo per suo conto.

### Tutto il resto ora si rifiuta di essere incorniciato

L'embed aveva bisogno di una regola \`frame-ancestors\`, e scriverla ha rivelato che nessuna rotta ne aveva mai avuta una. Ogni altro indirizzo ora dice no — \`frame-ancestors 'none'\` e \`X-Frame-Options: DENY\` — così il convertitore che ha un account dietro non può essere messo in un frame in alcun modo. \`/embed\` e le sue traduzioni (\`/de/embed\` e le altre) permettono qualsiasi antenato e portano \`noindex\`, perché un convertitore senza interfaccia non è una pagina su cui qualcuno dovrebbe arrivare da una ricerca.

Conservare un documento, condividerlo e la cronologia restano su transformpipe.com. L'embed non ha una sessione con cui raggiungerli, ed è una scelta di progetto, non un limite.

Da leggere: [convertire Markdown in HTML con JavaScript](/blog/markdown-to-html-in-javascript), e [se un convertitore online sia sicuro](/blog/is-an-online-converter-safe).`,
      },
    },
    body:
      '`/embed` is the converter with no chrome, for a page that wants to host it, and it talks ' +
      'to its host with `postMessage`. Adding it meant writing the rule that was missing: every ' +
      'other route now refuses to be framed at all, which nothing had said before.',
  },
  {
    date: '2026-09-09',
    title: 'The connector has its own dialogue',
    slug: 'connector-consent-page',
    detail: {
      en: {
        description:
          'Connecting an assistant to TransformPipe has its own dialogue and its own consent page: what the assistant may do, and why read-only really is read-only.',
        keywords:
          'connect an assistant to a document converter, mcp connector setup, oauth read only access, revoke an assistant’s access, add an mcp server by url',
        body: `Open the account menu, choose the connector, and the screen is about one thing: connecting an assistant. It used to be the API keys dialogue, on the argument that both are ways into the same account — and that was the wrong argument, because somebody who had just chosen "MCP connector" landed on a screen headed "API keys" with a key generator at the top, and had to work out whether they were in the right place.

### The dialogue

The address to add, which is \`/api/mcp\` on whatever origin you are actually on rather than a hostname written down somewhere — a preview deployment hands out its own. The one-line command, for a client that takes one. And the assistants currently connected, each with when it was, and a way to cut it off. Nothing here makes a key, and connecting an assistant no longer involves pasting one.

### The page the assistant sends you to

A client that supports OAuth sends you here to approve it, and what arrives is a page rendered by the server with no scripts in it at all. It names the account it would act as, and then says, in plain sentences: that it can read the documents on this account and their share links; whether it can save, share and delete, or cannot; that sharing publishes a page anybody holding the link can open; and that it cannot reach your account, your sign-in or your API keys. The address it will send you back to is printed. If the client published its own metadata, where that was read from is printed too.

If every address it wants to be sent back to is on this machine, the page says so and says why it matters: any program on your computer can ask to be sent there, and no server can tell them apart. That is the one thing on the page only the person at the keyboard can judge.

### Read-only is read-only

A connection granted \`documents:read\` without \`documents:write\` is refused on anything that changes something — a 403, with an \`insufficient_scope\` header saying what it would have needed. The check sits on the credential rather than on individual routes, and it works from a list of safe methods rather than a list of unsafe ones, so a route added later is covered by default. The first version had that the other way round.

An approval also cannot be driven from somewhere else. A pending request is recorded against the browser session it was shown to and can only be approved from that one; the approving endpoint checks \`Origin\` and \`Sec-Fetch-Site\`; and a request nobody approved goes stale after half an hour. Any grant can be taken back from the account menu.

Related: [converting documents from an assistant](/blog/converting-documents-from-an-assistant), and [converting documents with an API](/blog/converting-documents-with-an-api).`,
      },
      de: {
        title: 'Der Connector hat seinen eigenen Dialog',
        summary: `TransformPipe zu einem Assistenten hinzuzufügen öffnete früher den Dialog für API-Schlüssel — eine Fläche mit der Überschrift „API keys“ und einem Schlüsselgenerator obenan, sodass jemand, der „MCP connector“ gewählt hatte, erst herausfinden musste, dass er am richtigen Ort war. Es ist jetzt ein eigener Dialog, mit der Adresse, dem einzeiligen Befehl und den bereits verbundenen Assistenten.`,
        description:
          'Einen Assistenten mit TransformPipe zu verbinden hat einen eigenen Dialog und eine Zustimmungsseite: was er darf, und warum nur lesend wirklich nur lesend ist.',
        keywords:
          'assistenten mit dokumentenkonverter verbinden, mcp connector einrichten, oauth nur lesender zugriff, zugriff eines assistenten entziehen, mcp server per adresse hinzufügen',
        body: `Öffnen Sie das Kontomenü und wählen den Connector, geht es um eine Sache: einen Assistenten zu verbinden. Früher war das der Dialog für API-Schlüssel, mit der Begründung, beides führe in dasselbe Konto — und die Begründung war falsch, denn wer gerade „MCP connector“ gewählt hatte, landete auf einer Fläche mit der Überschrift „API keys“ und einem Schlüsselgenerator obenan und musste erst herausfinden, ob er richtig war.

### Der Dialog

Die Adresse, die hinzugefügt wird: \`/api/mcp\` auf der Herkunft, auf der Sie tatsächlich sind, und nicht ein irgendwo notierter Hostname — eine Vorschau-Bereitstellung nennt ihre eigene. Dazu der einzeilige Befehl für Programme, die einen nehmen. Und die derzeit verbundenen Assistenten, jeder mit dem Zeitpunkt und einem Weg, ihn zu trennen. Nichts hier erzeugt einen Schlüssel, und einen Assistenten zu verbinden heißt nicht mehr, einen einzufügen.

### Die Seite, auf die der Assistent Sie schickt

Ein Programm mit OAuth schickt Sie zur Zustimmung hierher, und was kommt, ist eine vom Server gesetzte Seite ganz ohne Skripte. Sie benennt das Konto, in dessen Namen gehandelt würde, und sagt dann in klaren Sätzen: dass die Dokumente dieses Kontos und ihre Teilen-Links gelesen werden können; ob gespeichert, geteilt und gelöscht werden darf oder eben nicht; dass Teilen eine Seite veröffentlicht, die jede Person mit dem Link öffnen kann; und dass Ihr Konto, Ihre Anmeldung und Ihre API-Schlüssel unerreichbar bleiben. Die Adresse, an die Sie zurückgeschickt werden, steht da; hat das Programm eigene Angaben veröffentlicht, auch, woher sie gelesen wurden.

Liegt jede Adresse, an die es zurückgeschickt werden will, auf diesem Rechner, sagt die Seite das und sagt, warum es zählt: Jedes Programm auf Ihrem Rechner darf verlangen, dorthin geschickt zu werden, und kein Server kann sie auseinanderhalten. Das ist das Einzige auf dieser Seite, das nur der Mensch davor beurteilen kann.

### Nur lesend ist wirklich nur lesend

Eine Verbindung mit \`documents:read\` und ohne \`documents:write\` wird bei allem abgewiesen, was etwas ändert — mit 403 und einem \`insufficient_scope\`-Kopf, der sagt, was gefehlt hätte. Die Prüfung sitzt an der Berechtigung und nicht an einzelnen Routen, und sie arbeitet mit einer Liste der unbedenklichen Methoden statt mit einer Liste der bedenklichen: Eine später hinzugefügte Route ist damit von vornherein erfasst. In der ersten Fassung war es umgekehrt.

Eine Zustimmung lässt sich auch nicht von außen auslösen. Eine offene Anfrage wird der Browsersitzung zugeordnet, der sie gezeigt wurde, und kann nur aus dieser bestätigt werden; die bestätigende Stelle prüft \`Origin\` und \`Sec-Fetch-Site\`; und eine Anfrage, die niemand bestätigt, verfällt nach einer halben Stunde. Jede Erteilung lässt sich im Kontomenü zurücknehmen.

Weiter: [Dokumente aus einem Assistenten konvertieren](/blog/converting-documents-from-an-assistant) und [Dokumente mit einer API konvertieren](/blog/converting-documents-with-an-api).`,
      },
      fr: {
        title: 'Le connecteur a son propre dialogue',
        summary: `Ajouter TransformPipe à un assistant ouvrait autrefois le dialogue des clés API — un écran intitulé « API keys » avec un générateur de clé en haut, si bien qu’une personne ayant choisi « MCP connector » devait comprendre qu’elle était au bon endroit. C’est désormais son propre dialogue, avec l’adresse, la commande en une ligne et les assistants déjà connectés.`,
        description:
          'Connecter un assistant à TransformPipe a son propre dialogue et sa page de consentement : ce qu’il peut faire, et pourquoi lecture seule veut dire lecture seule.',
        keywords:
          'connecter un assistant à un convertisseur de documents, configurer un connecteur mcp, accès oauth en lecture seule, révoquer l’accès d’un assistant, ajouter un serveur mcp par url',
        body: `Ouvrez le menu du compte, choisissez le connecteur, et l’écran ne parle que d’une chose : connecter un assistant. C’était autrefois le dialogue des clés API, avec l’argument que les deux menaient au même compte — et cet argument était faux, car quelqu’un qui venait de choisir « MCP connector » atterrissait sur un écran intitulé « API keys » avec un générateur de clé en haut, et devait d’abord comprendre s’il était au bon endroit.

### Le dialogue

L’adresse à ajouter, qui est \`/api/mcp\` sur l’origine où vous vous trouvez réellement plutôt qu’un nom d’hôte noté quelque part — un déploiement de prévisualisation donne le sien. La commande en une ligne, pour un client qui en accepte une. Et les assistants actuellement connectés, chacun avec la date et un moyen de couper l’accès. Rien ici ne crée de clé, et connecter un assistant ne demande plus d’en coller une.

### La page vers laquelle l’assistant vous envoie

Un client qui prend en charge OAuth vous envoie ici pour approuver, et ce qui s’affiche est une page rendue par le serveur, sans aucun script. Elle nomme le compte au nom duquel on agirait, puis dit, en phrases simples : qu’il peut lire les documents de ce compte et leurs liens de partage ; s’il peut enregistrer, partager et supprimer, ou non ; que partager publie une page que quiconque possède le lien peut ouvrir ; et qu’il ne peut atteindre ni votre compte, ni votre connexion, ni vos clés API. L’adresse vers laquelle vous serez renvoyé est affichée. Si le client a publié ses propres métadonnées, l’endroit d’où elles ont été lues l’est aussi.

Si chaque adresse de retour est sur cette machine, la page le dit et dit pourquoi cela compte : n’importe quel programme de votre ordinateur peut demander à y être envoyé, et aucun serveur ne peut les distinguer. C’est la seule chose ici que seule la personne devant le clavier peut juger.

### Lecture seule veut dire lecture seule

Une connexion qui a \`documents:read\` sans \`documents:write\` est refusée sur tout ce qui change quelque chose — un 403, avec un en-tête \`insufficient_scope\` disant ce qu’il aurait fallu. Le contrôle porte sur l’habilitation plutôt que sur chaque route, et il s’appuie sur une liste de méthodes sûres plutôt que sur une liste de méthodes dangereuses, si bien qu’une route ajoutée plus tard est couverte par défaut. La première version faisait l’inverse.

Une approbation ne peut pas non plus venir d’ailleurs. Une demande en attente est liée à la session de navigateur à laquelle elle a été montrée et ne peut être approuvée que depuis celle-ci ; le point d’approbation vérifie \`Origin\` et \`Sec-Fetch-Site\` ; et une demande que personne n’approuve expire après une demi-heure. Toute autorisation se retire depuis le menu du compte.

Autres lectures : [convertir des documents depuis un assistant](/blog/converting-documents-from-an-assistant), et [convertir des documents avec une API](/blog/converting-documents-with-an-api).`,
      },
      es: {
        title: 'El connector tiene su propio diálogo',
        summary: `Añadir TransformPipe a un asistente abría antes el diálogo de claves de API — una pantalla encabezada «API keys» con un generador de claves arriba, así que quien elegía «MCP connector» tenía que averiguar si estaba en el lugar correcto. Ahora tiene su propio diálogo, con la dirección, el comando de una línea y los asistentes ya conectados.`,
        description:
          'Conectar un asistente a TransformPipe tiene su propio diálogo y página de consentimiento: qué puede hacer, y por qué solo lectura es realmente solo lectura.',
        keywords:
          'conectar un asistente a un conversor de documentos, configurar connector mcp, acceso oauth de solo lectura, revocar el acceso de un asistente, añadir un servidor mcp por dirección',
        body: `Abre el menú de la cuenta, elige el connector, y la pantalla trata de una sola cosa: conectar un asistente. Antes era el diálogo de claves de API, con el argumento de que ambos son formas de entrar en la misma cuenta — y ese argumento era el equivocado, porque quien acababa de elegir «MCP connector» aterrizaba en una pantalla encabezada «API keys» con un generador de claves arriba, y tenía que averiguar si estaba en el lugar correcto.

### El diálogo

La dirección que hay que añadir, que es \`/api/mcp\` en el origen en el que de verdad se encuentra y no un nombre de host apuntado en algún sitio — una implementación de vista previa entrega el suyo propio. El comando de una línea, para un cliente que acepte uno. Y los asistentes conectados en ese momento, cada uno con la fecha y una forma de cortarlo. Nada aquí genera una clave, y conectar un asistente ya no supone pegar ninguna.

### La página a la que el asistente le envía

Un cliente que admite OAuth le envía aquí para aprobarlo, y lo que llega es una página generada por el servidor sin ningún script dentro. Nombra la cuenta en cuyo nombre actuaría, y a continuación dice, en frases sencillas: que puede leer los documentos de esta cuenta y sus enlaces para compartir; si puede guardar, compartir y eliminar, o no puede; que compartir publica una página que puede abrir cualquiera que tenga el enlace; y que no puede alcanzar tu cuenta, tu inicio de sesión ni tus claves de API. La dirección a la que te devolverá aparece impresa. Si el cliente publicó sus propios metadatos, también aparece de dónde se leyeron.

Si todas las direcciones a las que quiere que se le devuelva están en este equipo, la página lo dice y explica por qué importa: cualquier programa de tu ordenador puede pedir que se le envíe allí, y ningún servidor puede distinguirlos. Eso es lo único de la página que solo puede juzgar la persona frente al teclado.

### Solo lectura es solo lectura

Una conexión con \`documents:read\` sin \`documents:write\` es rechazada en cualquier cosa que cambie algo — con un 403 y una cabecera \`insufficient_scope\` que indica qué habría necesitado. La comprobación se hace sobre la credencial y no sobre rutas concretas, y trabaja a partir de una lista de métodos seguros en lugar de una lista de los inseguros, de modo que una ruta añadida más adelante queda cubierta por defecto. La primera versión lo tenía al revés.

Una aprobación tampoco se puede impulsar desde otro sitio. Una solicitud pendiente queda registrada contra la sesión del navegador a la que se mostró y solo puede aprobarse desde esa misma; el extremo que aprueba comprueba \`Origin\` y \`Sec-Fetch-Site\`; y una solicitud que nadie aprueba caduca a la media hora. Cualquier permiso concedido puede retirarse desde el menú de la cuenta.

Relacionado: [convertir documentos desde un asistente](/blog/converting-documents-from-an-assistant), y [convertir documentos con una API](/blog/converting-documents-with-an-api).`,
      },
      it: {
        title: 'Il connettore ha un proprio dialogo',
        summary: `Aggiungere TransformPipe a un assistente apriva prima il dialogo delle chiavi API — una schermata intitolata «API keys» con un generatore di chiavi in alto, così chi aveva scelto «MCP connector» doveva capire di essere nel posto giusto. Ora è un dialogo a sé, con l’indirizzo, il comando a una riga e gli assistenti già connessi.`,
        description:
          'Collegare un assistente a TransformPipe ha un proprio dialogo e una pagina di consenso: cosa può fare, e perché la sola lettura è davvero solo lettura.',
        keywords:
          'collegare un assistente a un convertitore di documenti, configurare un connettore mcp, accesso oauth di sola lettura, revocare l’accesso di un assistente, aggiungere un server mcp tramite indirizzo',
        body: `Apri il menu dell'account, scegli il connettore, e la schermata riguarda una cosa sola: collegare un assistente. Prima era il dialogo delle chiavi API, con l'argomento che entrambi fossero vie d'accesso allo stesso account — ed era l'argomento sbagliato, perché chi aveva appena scelto «MCP connector» finiva su una schermata intitolata «API keys» con un generatore di chiavi in alto, e doveva capire se fosse nel posto giusto.

### Il dialogo

L'indirizzo da aggiungere, che è \`/api/mcp\` sull'origine su cui ti trovi davvero e non un nome host scritto da qualche parte — una distribuzione di anteprima ne fornisce uno proprio. Il comando a una riga, per un client che lo accetta. E gli assistenti attualmente connessi, ciascuno con la data e un modo per interrompere il collegamento. Nulla qui genera una chiave, e collegare un assistente non richiede più di incollarne una.

### La pagina a cui l'assistente rimanda

Un client che supporta OAuth rimanda qui per l'approvazione, e quello che arriva è una pagina resa dal server, senza alcuno script al suo interno. Indica il nome dell'account per conto del quale agirebbe, e poi dice, in frasi semplici: che può leggere i documenti di questo account e i loro link di condivisione; se può salvare, condividere ed eliminare, oppure no; che condividere pubblica una pagina che chiunque abbia il link può aprire; e che non può raggiungere il tuo account, il tuo accesso o le tue chiavi API. L'indirizzo a cui verrai rimandato è riportato. Se il client ha pubblicato propri metadati, è riportato anche da dove sono stati letti.

Se ogni indirizzo a cui vuole essere rimandato si trova su questa stessa macchina, la pagina lo dice e spiega perché conta: qualsiasi programma sul tuo computer può chiedere di essere rimandato lì, e nessun server può distinguerli. È l'unica cosa, in questa pagina, che solo la persona davanti alla tastiera può valutare.

### Solo lettura è davvero solo lettura

Una connessione con \`documents:read\` e senza \`documents:write\` viene respinta su qualsiasi cosa modifichi qualcosa — un 403, con un'intestazione \`insufficient_scope\` che dice cosa sarebbe servito. Il controllo si trova sulla credenziale e non sulle singole rotte, e lavora a partire da un elenco di metodi sicuri piuttosto che da un elenco di quelli rischiosi, così una rotta aggiunta più avanti è coperta di default. La prima versione aveva le cose al contrario.

Un'approvazione, inoltre, non può essere avviata da un altro luogo. Una richiesta in sospeso viene registrata insieme alla sessione del browser a cui è stata mostrata e può essere approvata solo da quella; l'endpoint che approva controlla \`Origin\` e \`Sec-Fetch-Site\`; e una richiesta che nessuno approva scade dopo mezz'ora. Qualsiasi concessione può essere ritirata dal menu dell'account.

Da leggere: [convertire documenti da un assistente](/blog/converting-documents-from-an-assistant), e [convertire documenti con un'API](/blog/converting-documents-with-an-api).`,
      },
    },
    body:
      'Adding TransformPipe to an assistant used to open the API keys dialogue — a screen headed ' +
      '"API keys" with a key generator at the top, so a person who chose "MCP connector" had to ' +
      'work out they were in the right place. It is its own dialogue now, with the address, the ' +
      'one-line command and the assistants already connected.',
  },
  {
    date: '2026-09-09',
    title: 'A guard for the failures that only happen on the platform',
    slug: 'deploy-checks',
    detail: {
      en: {
        description:
          'A check that runs inside every build and refuses the mistakes that only fail once deployed: a specifier Node will not resolve, and a config pattern it rejects.',
        keywords:
          'function invocation failed on vercel, esm import missing js extension, cannot import json in a serverless function, vercel.json invalid source pattern, check before deploying',
        body: `Types pass, the bundler builds, the dev server serves — and the deployment answers 500 on every request. That gap is what this script is for. All three of those tools resolve modules and read configuration the way a bundler does; the deployed function does neither, and the script checks exactly the difference. It runs inside \`npm run build\` and exits non-zero, so neither mistake can reach a push again.

### What it refuses

**A relative import with no extension.** The API runs as ESM on Node, where \`./faq\` does not resolve and \`./faq.js\` does. One such line, reached from the server's own import graph, answered every \`/api\` route with FUNCTION_INVOCATION_FAILED.

**A \`.json\` import in that graph.** \`import { version } from '../package.json'\` type-checks, builds, and works in the dev server. The deployed bundle carries modules and not the repository, so the file is simply not there and the import throws at module load — which is every request, so the whole API returned 500.

**A \`source\` pattern the platform's router will not parse.** The symptom here is not a failing deploy: an invalid pattern is rejected before a build starts, so there is no deployment at all and production quietly stays on the commit before. The patterns are parsed with the same library the platform parses them with.

**A version that disagrees with itself.** \`shared/version.ts\` must equal \`package.json\`. It is a copy precisely because a JSON import is the failure above, and a copy nobody checks goes stale; the extension's manifest and the release tag read one of them, the connector reads the other.

### How it decides what to look at

The rule applies to the files the deployed function actually loads, and that set is not "everything under \`server/\`" — it follows imports wherever they lead, which is how a file under \`src/lib\` became part of the server in the first place. So it starts at the function's entry point and walks. A type-only import is skipped: it is erased at compile time, so its specifier never becomes something a runtime has to resolve.

### What it is not

Not a test suite and not a linter. It knows four specific ways the platform differs from a laptop and nothing else; it will not notice a logic error, and it warns rather than fails if the library it parses patterns with is not installed, because the point is to catch the mistake on the machine where it is being made. Each rule was proved by putting its bug back and watching the check fail.

Related: [documentation that lives in the repository](/blog/documentation-that-lives-in-the-repo), and [publishing Markdown from GitHub Actions](/blog/publish-markdown-from-github-actions).`,
      },
      de: {
        title: 'Ein Schutz für die Fehler, die nur auf der Plattform auftreten',
        summary: `Zwei Dinge hatten die Produktion lahmgelegt, und keines von beiden konnte lokal scheitern: ein Import ohne Endung, den ein Bundler verdeckt und Node verweigert, und ein Muster in \`vercel.json\`, das überhaupt keine Bereitstellung erzeugt. Beides wird jetzt vor dem Build geprüft, und der Schutz wurde bewiesen, indem jeder der beiden Fehler noch einmal eingebaut wurde.`,
        description:
          'Eine Prüfung in jedem Build, die die Fehler abweist, die erst nach der Bereitstellung auftreten: ein Import, den Node nicht auflöst, und ein ungültiges Muster.',
        keywords:
          'function invocation failed beheben, esm import ohne endung in node, json import in serverloser funktion, ungültiges muster in vercel.json, prüfung vor dem deploy',
        body: `Die Typen stimmen, der Bundler baut, der Entwicklungsserver liefert aus — und die Bereitstellung antwortet auf jede Anfrage mit 500. Für genau diesen Abstand gibt es dieses Skript. Alle drei Werkzeuge lösen Module auf und lesen Konfiguration so, wie ein Bundler es tut; die ausgelieferte Funktion tut beides nicht, und das Skript prüft genau den Unterschied. Es steckt in \`npm run build\` und endet mit einem Fehlercode, damit keiner der beiden Fehler noch einmal bis zu einem Push kommt.

### Was es abweist

**Einen relativen Import ohne Endung.** Die API läuft als ESM auf Node, wo \`./faq\` nicht auflöst und \`./faq.js\` schon. Eine einzige solche Zeile, erreichbar aus dem Importgraphen des Servers, beantwortete jede \`/api\`-Route mit FUNCTION_INVOCATION_FAILED.

**Einen \`.json\`-Import in diesem Graphen.** \`import { version } from '../package.json'\` besteht die Typprüfung, baut und läuft im Entwicklungsserver. Das ausgelieferte Bündel trägt Module und nicht das Repository, die Datei ist also einfach nicht da, und der Import scheitert beim Laden des Moduls — und das ist jede Anfrage, weshalb die ganze API 500 lieferte.

**Ein \`source\`-Muster, das der Router der Plattform nicht liest.** Das Symptom ist hier keine fehlgeschlagene Auslieferung: Ein ungültiges Muster wird abgewiesen, bevor ein Build beginnt, es gibt also überhaupt keine Bereitstellung, und die Produktion bleibt still auf dem vorherigen Commit. Die Muster werden mit derselben Bibliothek gelesen, mit der die Plattform sie liest.

**Eine Version, die sich selbst widerspricht.** \`shared/version.ts\` muss mit \`package.json\` übereinstimmen. Es ist eine Kopie, eben weil ein JSON-Import der Fehler von oben ist, und eine Kopie, die niemand prüft, veraltet; das Manifest der Erweiterung und das Release-Tag lesen die eine, der Connector die andere.

### Wie es entscheidet, wohin es schaut

Die Regel gilt für die Dateien, die die ausgelieferte Funktion wirklich lädt, und diese Menge ist nicht „alles unter \`server/\`“ — sie folgt den Importen, wohin sie führen, und genau so wurde eine Datei unter \`src/lib\` überhaupt Teil des Servers. Es beginnt deshalb am Eingangspunkt der Funktion und läuft von dort. Ein Import, der nur Typen holt, wird übersprungen: Er wird beim Kompilieren getilgt, seine Angabe muss also nie zur Laufzeit aufgelöst werden.

### Was es nicht ist

Keine Testsuite und kein Linter. Es kennt vier bestimmte Unterschiede zwischen der Plattform und einem Laptop und sonst nichts; einen Denkfehler bemerkt es nicht, und wenn die Bibliothek zum Lesen der Muster fehlt, warnt es statt zu scheitern — denn der Zweck ist, den Fehler auf der Maschine zu fangen, auf der er gemacht wird. Jede Regel wurde bewiesen, indem ihr Fehler wieder eingebaut wurde und die Prüfung fiel.

Weiter: [Dokumentation, die im Repository lebt](/blog/documentation-that-lives-in-the-repo) und [Markdown aus GitHub Actions veröffentlichen](/blog/publish-markdown-from-github-actions).`,
      },
      fr: {
        title: 'Un garde-fou pour les échecs qui n’arrivent que sur la plateforme',
        summary: `Deux choses avaient mis la production à terre, et ni l’une ni l’autre ne pouvait échouer en local : un import sans extension qu’un bundler masque et que Node refuse, et un motif dans \`vercel.json\` qui ne produit aucun déploiement du tout. Les deux sont désormais vérifiés avant le build, et le garde-fou a été prouvé en réintroduisant chacun des deux bugs.`,
        description:
          'Une vérification intégrée à chaque build qui rejette les erreurs qui n’échouent qu’une fois déployées : un chemin que Node refuse, et un motif invalide.',
        keywords:
          'corriger function invocation failed sur vercel, import esm sans extension js, impossible d’importer un json dans une fonction serverless, motif source invalide dans vercel.json, vérifier avant de déployer',
        body: `Les types passent, le bundler construit, le serveur de développement répond — et le déploiement répond 500 à chaque requête. Cet écart est ce pour quoi ce script existe. Ces trois outils résolvent les modules et lisent la configuration comme un bundler ; la fonction déployée ne fait ni l’un ni l’autre, et le script vérifie cette différence. Il s’exécute dans \`npm run build\` et sort en erreur, si bien qu’aucune des deux erreurs ne peut plus atteindre un push.

### Ce qu’il rejette

**Un import relatif sans extension.** L’API tourne en ESM sur Node, où \`./faq\` ne se résout pas et \`./faq.js\` oui. Une seule ligne de ce genre, atteinte depuis le graphe d’import du serveur, a fait répondre chaque route \`/api\` avec FUNCTION_INVOCATION_FAILED.

**Un import \`.json\` dans ce graphe.** \`import { version } from '../package.json'\` passe la vérification de types, se construit et fonctionne dans le serveur de développement. Le paquet déployé contient des modules et non le dépôt, le fichier n’est donc simplement pas là, et l’import échoue au chargement du module — c’est-à-dire à chaque requête, si bien que l’API entière renvoyait 500.

**Un motif \`source\` que le routeur de la plateforme ne sait pas analyser.** Le symptôme ici n’est pas un déploiement en échec : un motif invalide est rejeté avant que le build commence, il n’y a donc aucun déploiement, et la production reste sur le commit précédent. Les motifs sont analysés avec la même bibliothèque que la plateforme.

**Une version qui se contredit elle-même.** \`shared/version.ts\` doit être égal à \`package.json\`. C’est une copie, précisément parce qu’un import JSON est l’erreur décrite plus haut, et une copie que personne ne vérifie devient obsolète ; le manifeste de l’extension et le tag de version lisent l’une, le connecteur lit l’autre.

### Comment il choisit ce qu’il regarde

La règle s’applique aux fichiers que la fonction déployée charge réellement, et cet ensemble n’est pas « tout ce qui se trouve sous \`server/\` » — il suit les imports où qu’ils mènent, et c’est ainsi qu’un fichier sous \`src/lib\` est devenu une partie du serveur. Il commence au point d’entrée de la fonction et remonte de là. Un import qui ne sert qu’aux types est ignoré : il est effacé à la compilation, et son chemin n’a donc jamais besoin d’être résolu à l’exécution.

### Ce qu’il n’est pas

Ni une suite de tests, ni un linter. Il connaît quatre différences précises entre la plateforme et un ordinateur portable, et rien d’autre ; il ne remarquera pas une erreur de logique, et il avertit plutôt que d’échouer si la bibliothèque qui analyse les motifs n’est pas installée, car le but est d’attraper l’erreur sur la machine où elle est commise. Chaque règle a été prouvée en réintroduisant son bug et en observant la vérification échouer.

Autres lectures : [la documentation qui vit dans le dépôt](/blog/documentation-that-lives-in-the-repo), et [publier du Markdown depuis GitHub Actions](/blog/publish-markdown-from-github-actions).`,
      },
      es: {
        title: 'Un guardián para los fallos que solo ocurren en la plataforma',
        summary: `Dos cosas habían derribado producción, y ninguna podía fallar en local: un import sin extensión que un bundler oculta y Node rechaza, y un patrón de \`vercel.json\` que no produce ninguna implementación. Ambas se comprueban ahora antes del build, y el guardián se puso a prueba reintroduciendo cada error.`,
        description:
          'Una comprobación en cada build que rechaza los errores que solo fallan tras el despliegue: un especificador que Node no resuelve, y un patrón rechazado.',
        keywords:
          'function invocation failed en vercel, import esm sin extensión js, no se puede importar json en una función serverless, patrón source inválido en vercel.json, comprobación antes de desplegar',
        body: `Los tipos pasan, el bundler compila, el servidor de desarrollo responde — y el despliegue contesta 500 a cada petición. Este script existe para esa brecha. Las tres herramientas anteriores resuelven módulos y leen configuración como lo hace un bundler; la función desplegada no hace ninguna de las dos cosas, y el script comprueba exactamente esa diferencia. Se ejecuta dentro de \`npm run build\` y termina con un código de error, para que ninguno de los dos fallos vuelva a llegar a un push.

### Lo que rechaza

**Un import relativo sin extensión.** La API se ejecuta como ESM sobre Node, donde \`./faq\` no resuelve y \`./faq.js\` sí. Una sola línea así, alcanzable desde el propio grafo de imports del servidor, hizo que cada ruta \`/api\` respondiera con FUNCTION_INVOCATION_FAILED.

**Un import de \`.json\` en ese grafo.** \`import { version } from '../package.json'\` pasa la comprobación de tipos, compila y funciona en el servidor de desarrollo. El paquete desplegado contiene módulos y no el repositorio, así que el archivo simplemente no está, y el import lanza un error al cargar el módulo — lo que ocurre en cada petición, así que toda la API devolvía 500.

**Un patrón \`source\` que el enrutador de la plataforma no puede interpretar.** El síntoma aquí no es un despliegue que falla: un patrón inválido se rechaza antes de que empiece un build, así que no hay ningún despliegue en absoluto, y producción se queda en silencio en el commit anterior. Los patrones se interpretan con la misma librería con la que los interpreta la plataforma.

**Una versión que se contradice a sí misma.** \`shared/version.ts\` debe coincidir con \`package.json\`. Es una copia precisamente porque un import de JSON es el fallo de arriba, y una copia que nadie comprueba se queda desactualizada; el manifiesto de la extensión y la etiqueta de versión leen una, el connector lee la otra.

### Cómo decide dónde mirar

La regla se aplica a los archivos que la función desplegada carga de verdad, y ese conjunto no es «todo lo que hay bajo \`server/\`» — sigue los imports adonde lleven, que es como un archivo bajo \`src/lib\` acabó formando parte del servidor. Así que empieza en el punto de entrada de la función y recorre desde ahí. Un import que solo trae tipos se salta: se elimina al compilar, así que su especificador nunca llega a ser algo que un runtime tenga que resolver.

### Lo que no es

No es una suite de pruebas ni un linter. Conoce cuatro diferencias concretas entre la plataforma y un portátil y nada más; no notará un error de lógica, y avisa en vez de fallar si la librería con la que interpreta los patrones no está instalada, porque el objetivo es atrapar el error en la máquina donde se está cometiendo. Cada regla se puso a prueba reintroduciendo su error y comprobando que la verificación fallaba.

Relacionado: [documentación que vive en el repositorio](/blog/documentation-that-lives-in-the-repo), y [publicar Markdown desde GitHub Actions](/blog/publish-markdown-from-github-actions).`,
      },
      it: {
        title: 'Un controllo per gli errori che accadono solo sulla piattaforma',
        summary: `Due cose avevano bloccato la produzione, e nessuna delle due poteva fallire in locale: un import senza estensione che un bundler nasconde e Node rifiuta, e un pattern in \`vercel.json\` che non produce alcuna distribuzione. Entrambe vengono ora controllate prima del build, e il controllo è stato verificato reintroducendo ciascun errore.`,
        description:
          'Un controllo in ogni build che respinge gli errori visibili solo dopo la distribuzione: un percorso che Node non risolve, un pattern rifiutato.',
        keywords:
          'function invocation failed su vercel, import esm senza estensione js, importare json in una funzione serverless, pattern non valido in vercel.json, controllo prima del deploy',
        body: `I tipi passano, il bundler compila, il server di sviluppo serve — e la distribuzione risponde 500 a ogni richiesta. Questo script colma esattamente quello scarto. Tutti e tre quegli strumenti risolvono i moduli e leggono la configurazione come farebbe un bundler; la funzione distribuita non fa né l'uno né l'altro, e lo script controlla proprio questa differenza. Viene eseguito dentro \`npm run build\` e termina con un codice d'errore, così nessuno dei due errori arriva più a un push.

### Cosa respinge

**Un import relativo senza estensione.** L'API viene eseguita come ESM su Node, dove \`./faq\` non si risolve e \`./faq.js\` sì. Una sola riga di questo tipo, raggiungibile dal grafo di import del server, rispondeva a ogni rotta \`/api\` con FUNCTION_INVOCATION_FAILED.

**Un import \`.json\` in quel grafo.** \`import { version } from '../package.json'\` passa il controllo dei tipi, compila e funziona nel server di sviluppo. Il bundle distribuito contiene moduli e non il repository, quindi il file semplicemente non c'è, e l'import genera un errore al caricamento del modulo — cioè a ogni richiesta, per cui l'intera API restituiva 500.

**Un pattern \`source\` che il router della piattaforma non riesce ad analizzare.** Qui il sintomo non è una distribuzione fallita: un pattern non valido viene respinto prima che inizi un build, quindi non c'è alcuna distribuzione, e la produzione resta silenziosamente sul commit precedente. I pattern vengono analizzati con la stessa libreria con cui li analizza la piattaforma.

**Una versione in contraddizione con sé stessa.** \`shared/version.ts\` deve corrispondere a \`package.json\`. È una copia proprio perché un import JSON è l'errore descritto sopra, e una copia che nessuno controlla diventa obsoleta; il manifesto dell'estensione e il tag di release leggono uno dei due, il connettore legge l'altro.

### Come decide cosa guardare

La regola si applica ai file che la funzione distribuita carica davvero, e questo insieme non è «tutto sotto \`server/\`» — segue gli import dovunque conducano, ed è così che un file sotto \`src/lib\` è diventato parte del server fin dall'inizio. Parte quindi dal punto d'ingresso della funzione e percorre il grafo. Un import solo di tipi viene saltato: viene eliminato in fase di compilazione, quindi il suo percorso non diventa mai qualcosa che un runtime deve risolvere.

### Cosa non è

Non è una suite di test e non è un linter. Conosce quattro modi precisi in cui la piattaforma differisce da un portatile e nulla oltre; non nota un errore di logica, e avvisa invece di fallire se la libreria con cui legge i pattern non è installata, perché lo scopo è cogliere l'errore sulla macchina dove viene commesso. Ogni regola è stata provata reintroducendo il suo errore e osservando il controllo fallire.

Da leggere: [la documentazione che vive nel repository](/blog/documentation-that-lives-in-the-repo), e [pubblicare Markdown da GitHub Actions](/blog/publish-markdown-from-github-actions).`,
      },
    },
    body:
      'Two things had taken production down and neither could fail locally: an extensionless ' +
      'import that a bundler hides and Node refuses, and a `vercel.json` pattern that produces ' +
      'no deployment at all. Both are now checked before the build, and the guard was proved by ' +
      'reintroducing each bug.',
  },
  {
    date: '2026-09-09',
    title: 'Share an article',
    slug: 'share-an-article',
    detail: {
      en: {
        description:
          'Three plain share links at the foot of every TransformPipe article — X, LinkedIn and Reddit — with no third-party script watching the reader.',
        keywords:
          'share a blog article, share buttons without tracking, add share links to a blog, share an article on linkedin, submit a link to reddit',
        body: `Every article here ends with three links: X, LinkedIn and Reddit. Each is an ordinary anchor to that network's own compose screen, with the article's address and its headline already filled in, opening in a new tab so a half-read article is not lost behind it.

### Why links and not buttons

All three networks publish a script that draws its own button, keeps a count, and sees everybody who loads the page it sits on. This site's claim is that a document you convert is never sent anywhere, and a page that quietly loaded three trackers under the prose would be making that claim with its fingers crossed. A plain anchor does the same work: nothing runs until the reader clicks, and the only request that leaves is the one they asked for.

The names are spelled out rather than drawn, for a duller reason. The icon set this site uses has a LinkedIn glyph and the old Twitter bird, no X mark and no Reddit one — a bird beside a real logo beside an approximate Snoo reads as three different decisions, where three words read as one.

### What it does not do

It is for the articles, not for your documents. Sharing something you converted is a different screen with different rules: private, a link anybody with it can open, or named addresses that each sign in. And nothing here publishes on your behalf — the link opens the network's own compose box, and the network asks you before anything is posted.

Related: [sharing a Markdown document as a link](/blog/share-a-markdown-document-as-a-link), and [turning assistant output into a page somebody can open](/blog/ai-output-to-a-shareable-page).`,
      },
      de: {
        title: 'Einen Artikel teilen',
        summary: `X, LinkedIn und Reddit, unter dem Text statt darüber — geteilt wird ein Artikel, den man gelesen hat.`,
        description:
          'Drei einfache Links am Fuß jedes Artikels auf TransformPipe: X, LinkedIn und Reddit, ohne Skript eines Dritten, das den Leser beobachtet.',
        keywords:
          'artikel teilen button, share buttons ohne tracking, teilen links im blog einbauen, artikel auf linkedin teilen, link bei reddit einreichen',
        body: `Jeder Artikel hier endet mit drei Links: X, LinkedIn und Reddit. Jeder davon ist ein gewöhnlicher Anker auf das Eingabefenster des jeweiligen Netzwerks, in dem die Adresse des Artikels und seine Überschrift schon stehen, und jeder öffnet einen neuen Tab, damit ein halb gelesener Artikel nicht dahinter verschwindet.

### Warum Links und keine Schaltflächen

Alle drei Netzwerke bieten ein Skript an, das seine eigene Schaltfläche zeichnet, mitzählt und jeden sieht, der die Seite lädt, auf der es sitzt. Diese Seite behauptet, dass ein Dokument, das Sie konvertieren, nirgendwohin geschickt wird — und eine Seite, die darunter still drei Zähldienste lädt, würde diese Behauptung mit gekreuzten Fingern aufstellen. Ein einfacher Anker leistet dasselbe: Es läuft nichts, bevor der Leser klickt, und nach draußen geht nur die Anfrage, um die er gebeten hat.

Die Namen stehen als Wörter da, statt gezeichnet zu sein, und der Grund ist banal. Der Symbolsatz dieser Seite hat ein LinkedIn-Zeichen und den alten Twitter-Vogel, aber kein X und kein Reddit — ein Vogel neben einem echten Logo neben einem ungefähren Snoo sieht nach drei verschiedenen Entscheidungen aus, drei Wörter nach einer.

### Was es nicht tut

Es gilt für die Artikel, nicht für Ihre Dokumente. Etwas zu teilen, das Sie konvertiert haben, ist ein anderer Dialog mit anderen Regeln: privat, ein Link für alle, die ihn haben, oder benannte Adressen, die sich jeweils anmelden. Und hier wird nichts in Ihrem Namen veröffentlicht — der Link öffnet das Eingabefenster des Netzwerks, und das Netzwerk fragt Sie, bevor etwas erscheint.

Weiter: [ein Markdown-Dokument als Link teilen](/blog/share-a-markdown-document-as-a-link) und [KI-Ausgabe als Seite, die jemand öffnen kann](/blog/ai-output-to-a-shareable-page).`,
      },
      fr: {
        title: 'Partager un article',
        summary: `X, LinkedIn et Reddit, sous le texte plutôt qu’au-dessus — on partage un article qu’on a lu.`,
        description:
          'Trois simples liens de partage au bas de chaque article TransformPipe — X, LinkedIn et Reddit — sans aucun script tiers pour observer le lecteur.',
        keywords:
          'partager un article de blog, boutons de partage sans pistage, ajouter des liens de partage à un blog, partager un article sur linkedin, soumettre un lien sur reddit',
        body: `Chaque article se termine ici par trois liens : X, LinkedIn et Reddit. Chacun est une simple ancre vers l’écran de composition de ce réseau, avec déjà l’adresse de l’article et son titre, et s’ouvre dans un nouvel onglet pour qu’un article à moitié lu ne disparaisse pas derrière.

### Pourquoi des liens et non des boutons

Les trois réseaux proposent un script qui dessine son propre bouton, tient un compteur, et voit tous ceux qui chargent la page où il se trouve. Ce site affirme qu’un document que vous convertissez n’est jamais envoyé nulle part, et une page qui chargerait discrètement trois traceurs sous le texte ferait cette affirmation les doigts croisés. Une simple ancre fait le même travail : rien ne s’exécute avant que le lecteur ne clique, et la seule requête qui part est celle qu’il a demandée.

Les noms sont écrits en toutes lettres plutôt que dessinés, pour une raison plus terre-à-terre. Le jeu d’icônes de ce site a un symbole LinkedIn et l’ancien oiseau de Twitter, mais pas de marque X ni de symbole Reddit — un oiseau à côté d’un vrai logo à côté d’un Snoo approximatif ressemble à trois décisions différentes, là où trois mots ressemblent à une seule.

### Ce qu’il ne fait pas

C’est pour les articles, pas pour vos documents. Partager quelque chose que vous avez converti est un autre écran, avec d’autres règles : privé, un lien que quiconque le possède peut ouvrir, ou des adresses nommées qui se connectent chacune. Et rien ici ne publie en votre nom — le lien ouvre l’écran de composition du réseau, qui vous demande confirmation avant que quoi que ce soit ne soit publié.

Autres lectures : [partager un document Markdown sous forme de lien](/blog/share-a-markdown-document-as-a-link), et [transformer une sortie d’assistant en page que quelqu’un peut ouvrir](/blog/ai-output-to-a-shareable-page).`,
      },
      es: {
        title: 'Compartir un artículo',
        summary: `X, LinkedIn y Reddit, bajo el texto y no encima — se comparte un artículo que se ha leído.`,
        description:
          'Tres enlaces sencillos al pie de cada artículo de TransformPipe — X, LinkedIn y Reddit — sin ningún script de terceros observando al lector.',
        keywords:
          'compartir un artículo de blog, botones de compartir sin rastreo, añadir enlaces para compartir en un blog, compartir un artículo en linkedin, enviar un enlace a reddit',
        body: `Cada artículo de aquí termina con tres enlaces: X, LinkedIn y Reddit. Cada uno es un simple enlace a la pantalla de composición propia de esa red, con la dirección del artículo y su titular ya rellenos, y se abre en una pestaña nueva para que un artículo a medio leer no quede oculto detrás.

### Por qué enlaces y no botones

Las tres redes ofrecen un script que dibuja su propio botón, lleva la cuenta y ve a todo el que carga la página en la que está. Este sitio afirma que un documento que conviertes no se envía a ningún sitio, y una página que cargara en silencio tres rastreadores bajo el texto haría esa afirmación con los dedos cruzados. Un simple enlace hace el mismo trabajo: no se ejecuta nada hasta que el lector hace clic, y la única petición que sale es la que él ha pedido.

Los nombres están escritos como palabras y no dibujados, por un motivo más aburrido. El conjunto de iconos de este sitio tiene un glifo de LinkedIn y el viejo pájaro de Twitter, ningún símbolo de X ni de Reddit — un pájaro junto a un logo real junto a un Snoo aproximado parece tres decisiones distintas, donde tres palabras parecen una sola.

### Lo que no hace

Es para los artículos, no para tus documentos. Compartir algo que has convertido es otra pantalla con otras reglas: privado, un enlace que puede abrir cualquiera que lo tenga, o direcciones concretas que inician sesión cada una. Y nada de esto publica en tu nombre — el enlace abre el cuadro de composición propio de la red, y la red te pregunta antes de publicar nada.

Relacionado: [compartir un documento Markdown como enlace](/blog/share-a-markdown-document-as-a-link), y [convertir la salida de un asistente en una página que alguien pueda abrir](/blog/ai-output-to-a-shareable-page).`,
      },
      it: {
        title: 'Condividere un articolo',
        summary: `X, LinkedIn e Reddit, sotto il testo invece che sopra — si condivide un articolo che si è letto.`,
        description:
          'Tre semplici link di condivisione al fondo di ogni articolo di TransformPipe — X, LinkedIn e Reddit — senza alcuno script di terzi che osservi chi legge.',
        keywords:
          'condividere un articolo di blog, pulsanti di condivisione senza tracciamento, aggiungere link di condivisione a un blog, condividere un articolo su linkedin, pubblicare un link su reddit',
        body: `Ogni articolo qui finisce con tre link: X, LinkedIn e Reddit. Ciascuno è un semplice collegamento alla schermata di composizione propria di quel social, con l'indirizzo dell'articolo e il suo titolo già inseriti, e si apre in una nuova scheda perché un articolo letto a metà non vada perso dietro di essa.

### Perché link e non pulsanti

Tutti e tre i social offrono uno script che disegna il proprio pulsante, tiene un conteggio e vede chiunque carichi la pagina su cui si trova. Questo sito sostiene che un documento che converti non viene mai inviato da nessuna parte, e una pagina che caricasse silenziosamente tre strumenti di tracciamento sotto il testo farebbe quell'affermazione con le dita incrociate. Un semplice collegamento fa lo stesso lavoro: non parte nulla finché chi legge non clicca, e l'unica richiesta che esce è quella richiesta.

I nomi sono scritti per intero invece che disegnati, per un motivo più banale. Il set di icone di questo sito ha un simbolo di LinkedIn e il vecchio uccellino di Twitter, nessun simbolo di X e nessuno di Reddit — un uccellino accanto a un logo vero accanto a uno Snoo approssimato leggono come tre decisioni diverse, mentre tre parole leggono come una sola.

### Cosa non fa

Riguarda gli articoli, non i tuoi documenti. Condividere qualcosa che hai convertito è una schermata diversa con regole diverse: privata, un link che chiunque lo possieda può aprire, oppure indirizzi nominati che devono ciascuno accedere. E qui nulla pubblica in tuo nome — il link apre la finestra di composizione propria del social, che ti chiede conferma prima che qualcosa venga pubblicato.

Da leggere: [condividere un documento Markdown come link](/blog/share-a-markdown-document-as-a-link), e [trasformare l'output di un assistente in una pagina che si possa aprire](/blog/ai-output-to-a-shareable-page).`,
      },
    },
    body: 'X, LinkedIn and Reddit, under the prose rather than above it — somebody shares an ' +
      'article they have read.',
  },
  {
    date: '2026-09-09',
    version: '2.0.0',
    title: 'TransformPipe, and four conversions',
    slug: 'transformpipe-2-0',
    detail: {
      en: {
        description:
          'Version 2.0.0 renamed M2H to TransformPipe and added four ways in — HTML, Word, CSV and TSV, and JSON — each conversion at an address of its own.',
        keywords:
          'transformpipe 2.0.0, m2h renamed transformpipe, convert word csv json to markdown, json to markdown table, markdown converter release notes',
        body: `Version 2.0.0 is where the product got the name it has now. Until then it was M2H, which did one thing: Markdown in, HTML out. The name was accurate and it was also a ceiling — a converter called M2H cannot grow a Word reader without lying about itself.

### Four ways in

Markdown had been the only thing the app would accept. From 2.0.0 it also reads HTML, a \`.docx\`, a \`.csv\` or \`.tsv\`, and JSON, and each of those becomes Markdown — which then becomes any of the things the converter could already hand back.

JSON is the one that needed a decision. There is no single correct rendering of arbitrary JSON, so the converter picks one per shape: an array of flat objects becomes a table, an array of scalars a list, an object a heading per nested key, and anything nested past three levels a fenced code block, because a heading at depth seven is not a heading.

### Why each conversion has an address

\`/word-to-markdown\`, \`/csv-to-markdown\`, \`/json-to-markdown\` — pages, not tabs on one screen. "Word to markdown" is a thing people type into a search box, and a page that answers exactly that question is more use than a general converter that could also do it. The conversion you land on is the one already selected.

### Also in this release

An assistant can act on an account through a connector, with no API key pasted into a chat window. The blog went from twenty articles to fifty-six, each with a cover the build refuses to ship without. And the blog stopped being handed to everybody who opened the converter — 952 kB of Markdown had been sitting in the main bundle.

### Where it went next

Ten conversions now, not five: plain text, Excel, a Notion or Confluence export and a zipped Obsidian vault followed. Conversion moved out of the account and into the browser entirely, an API endpoint lays a saved document out as a PDF, and the same converters run in a browser extension and in an installable app. This release was the turn, not the destination.

Related: [JSON into a Markdown table](/blog/convert-json-to-markdown-table), and [converting documents from an assistant](/blog/converting-documents-from-an-assistant).`,
      },
      de: {
        title: 'TransformPipe, und vier Konvertierungen',
        summary: `Die Umbenennung, unter transformpipe.com, und vier Formate hinein statt einem: HTML, Word, CSV und TSV sowie JSON. Jede Konvertierung hat eine eigene Adresse, denn „word to markdown" ist etwas, das Menschen in ein Suchfeld tippen.

JSON wird je nach Gestalt gerendert statt nach einer Regel für alles — ein Array flacher Objekte wird eine Tabelle, ein Array von Skalaren eine Liste, ein Objekt eine Überschrift pro verschachteltem Schlüssel, und alles jenseits von drei Ebenen ein eingezäunter Block, denn eine Überschrift in Tiefe sieben ist keine Überschrift.

Außerdem: Ein Assistent kann über einen Konnektor auf einem Konto arbeiten, ohne dass irgendwo ein API-Schlüssel eingefügt wird; sechsundfünfzig Artikel statt zwanzig, jeder mit einem Titelbild, ohne das der Build nicht ausliefert; und das Blog wird nicht mehr an alle geschickt, die den Konverter öffnen — es waren 952 kB Markdown im Haupt-Bundle.`,
        description:
          'Version 2.0.0 machte aus M2H TransformPipe und brachte vier Formate hinein: HTML, Word, CSV und TSV sowie JSON, jedes unter einer eigenen Adresse.',
        keywords:
          'transformpipe 2.0.0, m2h heißt jetzt transformpipe, word csv json in markdown umwandeln, json in markdown tabelle, versionshinweise markdown konverter',
        body: `Mit Version 2.0.0 bekam das Produkt den Namen, den es heute trägt. Davor hieß es M2H und tat eine Sache: Markdown hinein, HTML hinaus. Der Name war zutreffend und war zugleich eine Decke — ein Konverter, der M2H heißt, kann keinen Word-Leser bekommen, ohne über sich selbst zu lügen.

### Vier Wege hinein

Markdown war bis dahin das Einzige, was die App annahm. Ab 2.0.0 liest sie außerdem HTML, eine \`.docx\`, eine \`.csv\` oder \`.tsv\` und JSON, und aus jedem davon wird Markdown — und daraus dann jedes Format, das der Konverter ohnehin schon zurückgeben konnte.

JSON war der Fall, der eine Entscheidung brauchte. Für beliebiges JSON gibt es keine einzig richtige Darstellung, also wählt der Konverter eine je nach Gestalt: Ein Array flacher Objekte wird eine Tabelle, ein Array von Skalaren eine Liste, ein Objekt eine Überschrift pro verschachteltem Schlüssel, und alles, was tiefer als drei Ebenen verschachtelt ist, ein eingezäunter Codeblock — denn eine Überschrift in Tiefe sieben ist keine Überschrift.

### Warum jede Konvertierung eine Adresse hat

\`/word-to-markdown\`, \`/csv-to-markdown\`, \`/json-to-markdown\` — Seiten, keine Reiter auf einem Bildschirm. „Word to markdown" ist etwas, das Menschen in ein Suchfeld tippen, und eine Seite, die genau diese Frage beantwortet, nützt mehr als ein allgemeiner Konverter, der es auch könnte. Die Konvertierung, auf der Sie ankommen, ist schon ausgewählt.

### Ebenfalls in dieser Version

Ein Assistent kann über einen Konnektor auf einem Konto arbeiten, ohne dass irgendwo in einem Chatfenster ein API-Schlüssel eingefügt wird. Das Blog wuchs von zwanzig auf sechsundfünfzig Artikel, jeder mit einem Titelbild, ohne das der Build nichts ausliefert. Und das Blog wird nicht mehr an jeden geschickt, der den Konverter öffnet — 952 kB Markdown hatten im Haupt-Bundle gelegen.

### Wie es weiterging

Heute sind es zehn Konvertierungen, nicht fünf: reiner Text, Excel, ein Notion- oder Confluence-Export und ein gezippter Obsidian-Tresor kamen dazu. Die Konvertierung zog ganz aus dem Konto in den Browser, ein API-Endpunkt setzt ein gespeichertes Dokument als PDF, und dieselben Konverter laufen in einer Browser-Erweiterung und in einer installierbaren App. Diese Version war die Wende, nicht das Ziel.

Weiter: [JSON in eine Markdown-Tabelle](/blog/convert-json-to-markdown-table) und [Dokumente aus einem Assistenten heraus konvertieren](/blog/converting-documents-from-an-assistant).`,
      },
      fr: {
        title: 'TransformPipe, et quatre conversions',
        summary: `Le changement de nom, sur transformpipe.com, et quatre formats en entrée plutôt qu’un : HTML, Word, CSV et TSV, et JSON. Chaque conversion a sa propre adresse, car « word to markdown » est ce que les gens tapent dans un champ de recherche.

JSON choisit un rendu selon sa forme plutôt qu’une règle unique pour tout — un tableau d’objets plats devient un tableau Markdown, un tableau de valeurs simples une liste, un objet un titre par clé imbriquée, et tout ce qui dépasse trois niveaux un bloc de code, car un titre à la profondeur sept n’est plus un titre.

Aussi dans cette version : un assistant peut agir sur un compte via un connecteur sans qu’aucune clé API ne soit collée nulle part ; cinquante-six articles, contre vingt auparavant, chacun avec une image de couverture sans laquelle le build refuse de livrer ; et le blog a cessé d’être envoyé à quiconque ouvrait le convertisseur, ce qui représentait 952 Ko de Markdown dans le paquet principal.`,
        description:
          'La version 2.0.0 a renommé M2H en TransformPipe et ajouté quatre entrées — HTML, Word, CSV et TSV, et JSON — chaque conversion avec sa propre adresse.',
        keywords:
          'transformpipe 2.0.0, m2h renommé transformpipe, convertir word csv json en markdown, tableau json vers markdown, notes de version convertisseur markdown',
        body: `La version 2.0.0 est celle où le produit a reçu le nom qu’il porte aujourd’hui. Jusque-là, il s’appelait M2H, et faisait une seule chose : Markdown en entrée, HTML en sortie. Le nom était exact, et c’était aussi un plafond — un convertisseur appelé M2H ne peut pas apprendre à lire du Word sans se mentir à lui-même.

### Quatre entrées

Markdown avait été jusque-là la seule chose que l’application acceptait. Depuis 2.0.0, elle lit aussi du HTML, un \`.docx\`, un \`.csv\` ou \`.tsv\`, et du JSON, et chacun de ces formats devient du Markdown — qui devient ensuite n’importe lequel des formats que le convertisseur savait déjà rendre.

JSON est celui qui demandait une décision. Il n’existe pas de rendu unique et correct pour un JSON arbitraire, le convertisseur en choisit donc un selon la forme : un tableau d’objets plats devient un tableau Markdown, un tableau de valeurs simples une liste, un objet un titre par clé imbriquée, et tout ce qui est imbriqué au-delà de trois niveaux un bloc de code, car un titre à la profondeur sept n’est pas un titre.

### Pourquoi chaque conversion a une adresse

\`/word-to-markdown\`, \`/csv-to-markdown\`, \`/json-to-markdown\` — des pages, pas des onglets sur un seul écran. « Word to markdown » est ce que les gens tapent dans un champ de recherche, et une page qui répond exactement à cette question sert plus qu’un convertisseur généraliste qui pourrait aussi le faire. La conversion sur laquelle vous arrivez est déjà celle qui est sélectionnée.

### Aussi dans cette version

Un assistant peut agir sur un compte via un connecteur, sans qu’aucune clé API ne soit collée dans une fenêtre de discussion. Le blog est passé de vingt à cinquante-six articles, chacun avec une image de couverture sans laquelle le build refuse de livrer. Et le blog a cessé d’être envoyé à quiconque ouvrait le convertisseur — 952 Ko de Markdown avaient jusque-là logé dans le paquet principal.

### Où cela a mené ensuite

Dix conversions aujourd’hui, pas cinq : le texte brut, Excel, un export Notion ou Confluence et une archive Obsidian zippée sont venus s’ajouter. La conversion a quitté entièrement le compte pour le navigateur, un point d’entrée d’API met en page un document enregistré sous forme de PDF, et les mêmes convertisseurs tournent dans une extension de navigateur et dans une application installable. Cette version fut le virage, pas la destination.

Autres lectures : [JSON dans un tableau Markdown](/blog/convert-json-to-markdown-table), et [convertir des documents depuis un assistant](/blog/converting-documents-from-an-assistant).`,
      },
      es: {
        title: 'TransformPipe, y cuatro conversiones',
        summary: `El cambio de nombre, en transformpipe.com, y cuatro formatos de entrada en vez de uno: HTML, Word, CSV y TSV, y JSON. Cada conversión tiene su propia dirección, porque «word to markdown» es algo que la gente escribe en un cuadro de búsqueda.

JSON elige una representación según la forma en lugar de una sola regla para todo — un array de objetos planos se vuelve una tabla, un array de valores escalares una lista, un objeto un encabezado por cada clave anidada, y cualquier cosa más allá de tres niveles un bloque de código, porque un encabezado en el nivel siete no es un encabezado.

Además: un asistente puede actuar sobre una cuenta a través de un connector que no necesita ninguna clave de API pegada en ningún sitio; cincuenta y seis artículos, frente a veinte, cada uno con una portada sin la que el build se niega a publicar; y el blog dejó de enviarse a todo el que abría el conversor, que habían sido 952 kB de Markdown en el paquete principal.`,
        description:
          'La versión 2.0.0 renombró M2H como TransformPipe y añadió cuatro formatos de entrada — HTML, Word, CSV y TSV, y JSON — cada uno con su propia dirección.',
        keywords:
          'transformpipe 2.0.0, m2h ahora se llama transformpipe, convertir word csv json a markdown, json a tabla markdown, notas de la versión del conversor markdown',
        body: `La versión 2.0.0 es donde el producto recibió el nombre que tiene hoy. Hasta entonces era M2H, y hacía una sola cosa: Markdown dentro, HTML fuera. El nombre era exacto y era también un techo — un conversor llamado M2H no puede incorporar un lector de Word sin mentir sobre sí mismo.

### Cuatro vías de entrada

Markdown había sido lo único que la aplicación aceptaba. Desde 2.0.0 lee también HTML, un \`.docx\`, un \`.csv\` o \`.tsv\`, y JSON, y cada uno de ellos se convierte en Markdown — que a su vez se convierte en cualquiera de las cosas que el conversor ya sabía devolver.

JSON fue el caso que necesitó una decisión. No hay una única representación correcta para un JSON arbitrario, así que el conversor elige una según la forma: un array de objetos planos se vuelve una tabla, un array de valores escalares una lista, un objeto un encabezado por cada clave anidada, y cualquier cosa anidada más allá de tres niveles un bloque de código, porque un encabezado en el nivel siete no es un encabezado.

### Por qué cada conversión tiene una dirección

\`/word-to-markdown\`, \`/csv-to-markdown\`, \`/json-to-markdown\` — páginas, no pestañas de una sola pantalla. «Word to markdown» es algo que la gente escribe en un cuadro de búsqueda, y una página que responde exactamente a esa pregunta es más útil que un conversor general que también podría hacerlo. La conversión en la que aterriza ya está seleccionada.

### También en esta versión

Un asistente puede actuar sobre una cuenta a través de un connector, sin pegar ninguna clave de API en una ventana de chat. El blog pasó de veinte artículos a cincuenta y seis, cada uno con una portada sin la que el build se niega a publicar. Y el blog dejó de entregarse a todo el que abría el conversor — habían sido 952 kB de Markdown en el paquete principal.

### Hacia dónde fue después

Ahora son diez conversiones, no cinco: texto sin formato, Excel, una exportación de Notion o Confluence y un vault de Obsidian comprimido llegaron después. La conversión salió por completo de la cuenta y se trasladó al navegador, un endpoint de la API compone un documento guardado como PDF, y los mismos conversores funcionan en una extensión de navegador y en una aplicación instalable. Esta versión fue el giro, no el destino.

Relacionado: [JSON en una tabla Markdown](/blog/convert-json-to-markdown-table), y [convertir documentos desde un asistente](/blog/converting-documents-from-an-assistant).`,
      },
      it: {
        title: 'TransformPipe, e quattro conversioni',
        summary: `Il cambio di nome, su transformpipe.com, e quattro formati in ingresso invece di uno: HTML, Word, CSV e TSV, e JSON. Ogni conversione ha un indirizzo proprio, perché «word to markdown» è qualcosa che le persone digitano in un campo di ricerca.

JSON sceglie una resa in base alla forma invece di una regola unica per tutto — un array di oggetti piatti diventa una tabella, un array di scalari una lista, un oggetto un'intestazione per ogni chiave annidata, e tutto ciò che supera tre livelli un blocco di codice, perché un'intestazione alla profondità sette non è un'intestazione.

Inoltre: un assistente può agire su un account tramite un connettore che non richiede di incollare alcuna chiave API da nessuna parte; cinquantasei articoli, in salita da venti, ciascuno con una copertina senza la quale il build si rifiuta di pubblicare; e il blog ha smesso di essere inviato a chiunque apra il convertitore, dopo che erano 952 kB di Markdown nel bundle principale.`,
        description:
          'La versione 2.0.0 ha rinominato M2H in TransformPipe e ha aggiunto quattro formati in ingresso — HTML, Word, CSV e TSV, e JSON — ciascuno con un indirizzo proprio.',
        keywords:
          'transformpipe 2.0.0, m2h rinominato in transformpipe, convertire word csv json in markdown, json in tabella markdown, note di rilascio convertitore markdown',
        body: `Con la versione 2.0.0 il prodotto ha preso il nome che porta oggi. Fino ad allora si chiamava M2H e faceva una cosa sola: Markdown in ingresso, HTML in uscita. Il nome era accurato ed era anche un limite — un convertitore chiamato M2H non può aggiungere un lettore di Word senza mentire su sé stesso.

### Quattro vie d'ingresso

Markdown era stato finora l'unica cosa che l'app accettava. Dalla 2.0.0 legge anche HTML, un \`.docx\`, un \`.csv\` o \`.tsv\`, e JSON, e ciascuno di questi diventa Markdown — che a sua volta diventa qualsiasi cosa il convertitore fosse già in grado di restituire.

JSON è quello che ha richiesto una decisione. Non esiste una resa unica corretta per un JSON arbitrario, quindi il convertitore ne sceglie una per ogni forma: un array di oggetti piatti diventa una tabella, un array di scalari una lista, un oggetto un'intestazione per ogni chiave annidata, e qualsiasi cosa annidata oltre tre livelli un blocco di codice, perché un'intestazione alla profondità sette non è un'intestazione.

### Perché ogni conversione ha un indirizzo

\`/word-to-markdown\`, \`/csv-to-markdown\`, \`/json-to-markdown\` — pagine, non schede su un'unica schermata. «Word to markdown» è qualcosa che le persone digitano in un campo di ricerca, e una pagina che risponde esattamente a quella domanda è più utile di un convertitore generico che potrebbe farlo anch'esso. La conversione su cui arrivi è già quella selezionata.

### Anche in questa versione

Un assistente può agire su un account tramite un connettore, senza incollare alcuna chiave API in una finestra di chat. Il blog è passato da venti a cinquantasei articoli, ciascuno con una copertina senza la quale il build si rifiuta di pubblicare. E il blog ha smesso di essere inviato a chiunque apra il convertitore — c'erano 952 kB di Markdown nel bundle principale.

### Come è andata dopo

Oggi sono dieci conversioni, non cinque: testo semplice, Excel, un export di Notion o Confluence e un vault Obsidian compresso sono arrivati in seguito. La conversione è uscita del tutto dall'account per entrare nel browser, un endpoint API impagina un documento salvato come PDF, e gli stessi convertitori funzionano in un'estensione del browser e in un'app installabile. Questa versione è stata la svolta, non la destinazione.

Da leggere: [JSON in una tabella Markdown](/blog/convert-json-to-markdown-table), e [convertire documenti da un assistente](/blog/converting-documents-from-an-assistant).`,
      },
    },
    body:
      'The rename, at transformpipe.com, and four formats in rather than one: HTML, Word, CSV ' +
      'and TSV, and JSON. Each conversion has an address of its own, because "word to markdown" ' +
      'is a thing people type into a search box.\n\n' +
      'JSON picks a rendering per shape rather than one rule for everything — an array of flat ' +
      'objects becomes a table, an array of scalars a list, an object a heading per nested key, ' +
      'and anything past three levels a fenced block, because a heading at depth seven is not a ' +
      'heading.\n\n' +
      'Also: an assistant can act on an account through a connector that needs no API key ' +
      'pasted anywhere; fifty-six articles, up from twenty, each with a cover the build refuses ' +
      'to ship without; and the blog stopped being sent to everybody who opened the converter, ' +
      'which had been 952 kB of Markdown in the main bundle.',
  },
  {
    date: '2026-09-08',
    version: '1.1.0',
    title: 'A blog, and real HTML for every page',
    slug: 'prerendered-pages',
    detail: {
      en: {
        description:
          'Version 1.1.0 gave every address real prerendered HTML with its own title, description and structured data, and opened the blog with twenty articles.',
        keywords:
          'transformpipe 1.1.0, prerendered html for a single page app, sitemap and robots txt, self-contained html download, seo for a javascript app',
        body: `Before this release the site was one JavaScript bundle behind one HTML file. Every address served that same file, so every address had the same title and the same description: a crawler, a link preview, or a reader with scripts switched off got the shell and nothing in it.

### Real HTML for every address

Each page a stranger can arrive on is now written out as a file of its own, with its own title, description, canonical link and structured data, plus a \`sitemap.xml\` and a \`robots.txt\` that were simply absent before. The app still takes over once it loads; what changed is what arrives first.

### Twenty articles

The blog opened with twenty articles at \`/blog\`, written as Markdown and rendered by the converter the site is for. That was deliberate and still is: a change that breaks the renderer breaks these pages before it breaks somebody's document, which is a better place to find out.

The FAQ arrived with it — under the dropzone and again in the documentation, read from one list, so the two cannot drift apart.

### The download stopped needing a network

The \`.html\` a conversion hands back was meant to stand on its own and did not quite: it linked its typeface from Google Fonts. A file that phones out in order to render is not a file you can archive, mail to somebody behind a firewall, or read on a plane. Everything is inside it now, including the font.

### Where it went next

The prerenderer writes every page in five languages, the blog stands at sixty-three articles in English, German and French, and the changelog you came from is prerendered off the same typed list — this page with it. The counts have grown; the rule has not changed.

Related: [what self-contained HTML means](/blog/self-contained-html-explained), and [a static site generator or a converter](/blog/static-site-generator-or-converter).`,
      },
      de: {
        title: 'Ein Blog, und echtes HTML für jede Seite',
        summary: `Zwanzig Artikel unter \`/blog\`, gerendert von dem Konverter, den sie beschreiben. Ein FAQ unter der Ablagefläche und noch einmal in der Dokumentation, aus einer Liste.

Jede Seite, auf der ein Fremder landet, ist jetzt eine echte Datei mit eigenem Titel, eigener Beschreibung, kanonischem Link und strukturierten Daten, dazu \`sitemap.xml\` und \`robots.txt\`. Und die heruntergeladene \`.html\` wurde wirklich eigenständig — sie hatte ihre Schrift bis dahin von Google Fonts geladen.`,
        description:
          'Version 1.1.0 gab jeder Adresse echtes, vorgerendertes HTML mit eigenem Titel und eigener Beschreibung — und eröffnete das Blog mit zwanzig Artikeln.',
        keywords:
          'transformpipe 1.1.0, vorgerendertes html single page app, sitemap und robots txt, eigenständige html datei herunterladen, seo für javascript app',
        body: `Vor dieser Version war die Seite ein JavaScript-Bündel hinter einer einzigen HTML-Datei. Jede Adresse lieferte dieselbe Datei aus, also hatte jede Adresse denselben Titel und dieselbe Beschreibung: Ein Crawler, eine Link-Vorschau oder ein Leser mit abgeschalteten Skripten bekam die Hülle und nichts darin.

### Echtes HTML für jede Adresse

Jede Seite, auf der ein Fremder ankommen kann, wird jetzt als eigene Datei geschrieben — mit eigenem Titel, eigener Beschreibung, kanonischem Link und strukturierten Daten, dazu eine \`sitemap.xml\` und eine \`robots.txt\`, die vorher einfach fehlten. Die App übernimmt weiterhin, sobald sie geladen ist; geändert hat sich, was vorher ankommt.

### Zwanzig Artikel

Das Blog begann mit zwanzig Artikeln unter \`/blog\`, als Markdown geschrieben und von dem Konverter gerendert, um den es auf dieser Seite geht. Das war Absicht und ist es weiterhin: Eine Änderung, die den Renderer beschädigt, beschädigt diese Seiten, bevor sie das Dokument eines Menschen beschädigt — und das ist der bessere Ort, um davon zu erfahren.

Das FAQ kam mit: unter der Ablagefläche und noch einmal in der Dokumentation, aus einer einzigen Liste gelesen, damit die beiden nicht auseinanderlaufen können.

### Der Download brauchte kein Netz mehr

Die \`.html\`, die eine Konvertierung zurückgibt, sollte für sich stehen und tat es nicht ganz: Sie lud ihre Schrift von Google Fonts. Eine Datei, die zum Anzeigen nach draußen telefoniert, ist keine Datei, die man archivieren, an jemanden hinter einer Firewall schicken oder im Flugzeug lesen kann. Jetzt steckt alles darin, die Schrift eingeschlossen.

### Wie es weiterging

Der Prerenderer schreibt jede Seite in fünf Sprachen, das Blog steht bei dreiundsechzig Artikeln auf Englisch, Deutsch und Französisch, und das Changelog, aus dem Sie kommen, wird aus derselben getippten Liste vorgerendert — diese Seite mit ihm. Die Zahlen sind gewachsen; die Regel ist dieselbe.

Weiter: [was eigenständiges HTML bedeutet](/blog/self-contained-html-explained) und [Static-Site-Generator oder Konverter](/blog/static-site-generator-or-converter).`,
      },
      fr: {
        title: 'Un blog, et du vrai HTML pour chaque page',
        summary: `Vingt articles sous \`/blog\`, rendus par le convertisseur qu’ils décrivent. Une FAQ sous la zone de dépôt, et de nouveau dans la documentation, issue d’une même liste.

Chaque page où un inconnu peut arriver est désormais un vrai fichier avec son propre titre, sa propre description, un lien canonique et des données structurées, plus un \`sitemap.xml\` et un \`robots.txt\`. Et le \`.html\` téléchargé est devenu véritablement autonome — il chargeait auparavant sa police depuis Google Fonts.`,
        description:
          'La version 1.1.0 a donné à chaque adresse du vrai HTML prégénéré avec titre et description propres, et a ouvert le blog avec vingt articles.',
        keywords:
          'html prérendu pour une application monopage, sitemap et robots txt, fichier html téléchargeable autonome, seo pour une application javascript, transformpipe 1.1.0',
        body: `Avant cette version, le site était un seul paquet JavaScript derrière un unique fichier HTML. Chaque adresse renvoyait ce même fichier, si bien que chaque adresse avait le même titre et la même description : un robot d’indexation, un aperçu de lien ou un lecteur ayant désactivé les scripts recevait la coquille et rien dedans.

### Du vrai HTML pour chaque adresse

Chaque page où un inconnu peut arriver est désormais écrite comme un fichier à part, avec son propre titre, sa propre description, un lien canonique et des données structurées, plus un \`sitemap.xml\` et un \`robots.txt\` qui, avant, manquaient tout simplement. L’application prend toujours le relais une fois chargée ; ce qui a changé, c’est ce qui arrive en premier.

### Vingt articles

Le blog a ouvert avec vingt articles sous \`/blog\`, écrits en Markdown et rendus par le convertisseur auquel ce site est consacré. C’était voulu et le reste : un changement qui casse le moteur de rendu casse ces pages avant de casser le document de quelqu’un, ce qui est un meilleur endroit pour s’en apercevoir.

La FAQ est arrivée avec lui — sous la zone de dépôt et de nouveau dans la documentation, lue depuis une seule liste, pour que les deux ne puissent pas diverger.

### Le téléchargement n’a plus besoin d’un réseau

Le \`.html\` qu’une conversion renvoyait était censé tenir seul et n’y arrivait pas tout à fait : il chargeait sa police depuis Google Fonts. Un fichier qui téléphone à l’extérieur pour s’afficher n’est pas un fichier que vous pouvez archiver, envoyer par courriel à quelqu’un derrière un pare-feu, ou lire en avion. Tout est désormais à l’intérieur, la police comprise.

### Où cela a mené ensuite

Le moteur de rendu préalable écrit chaque page en cinq langues, le blog compte soixante-trois articles en anglais, en allemand et en français, et le changelog dont vous venez est prégénéré à partir de cette même liste tapée — cette page avec lui. Les chiffres ont grandi ; la règle n’a pas changé.

Autres lectures : [ce que signifie du HTML autonome](/blog/self-contained-html-explained), et [générateur de site statique ou convertisseur](/blog/static-site-generator-or-converter).`,
      },
      es: {
        title: 'Un blog, y HTML real para cada página',
        summary: `Veinte artículos en \`/blog\`, renderizados por el conversor que describen. Un FAQ bajo la zona de arrastre y otra vez en la documentación, a partir de una sola lista.

Cada página a la que llega un desconocido es ahora un archivo real con su propio título, descripción, enlace canónico y datos estructurados, además de \`sitemap.xml\` y \`robots.txt\`. Y el \`.html\` descargado se volvió realmente autónomo — antes enlazaba su tipografía desde Google Fonts.`,
        description:
          'La versión 1.1.0 dio a cada dirección HTML real pregenerado con su propio título, descripción y datos estructurados, y abrió el blog con veinte artículos.',
        keywords:
          'html pregenerado para una single page app, sitemap y robots txt, descargar html autónomo, seo para una aplicación javascript, transformpipe 1.1.0',
        body: `Antes de esta versión, el sitio era un único paquete de JavaScript detrás de un único archivo HTML. Cada dirección servía ese mismo archivo, así que cada dirección tenía el mismo título y la misma descripción: un rastreador, una vista previa de enlace o un lector con los scripts desactivados recibía la cáscara y nada dentro.

### HTML real para cada dirección

Cada página a la que puede llegar un desconocido se escribe ahora como un archivo propio, con su propio título, descripción, enlace canónico y datos estructurados, además de un \`sitemap.xml\` y un \`robots.txt\` que antes simplemente no existían. La aplicación sigue tomando el control en cuanto carga; lo que cambió es lo que llega primero.

### Veinte artículos

El blog abrió con veinte artículos en \`/blog\`, escritos en Markdown y renderizados por el conversor al que está dedicado el sitio. Eso fue deliberado y sigue siéndolo: un cambio que rompe el renderizador rompe estas páginas antes de romper el documento de alguien, que es un lugar mejor para descubrirlo.

El FAQ llegó con ello — bajo la zona de arrastre y otra vez en la documentación, leído de una sola lista, para que las dos no puedan separarse.

### La descarga dejó de necesitar una red

El \`.html\` que devuelve una conversión debía sostenerse por sí solo y no lo hacía del todo: enlazaba su tipografía desde Google Fonts. Un archivo que llama hacia fuera para poder mostrarse no es un archivo que se pueda archivar, enviar por correo a alguien detrás de un cortafuegos o leer en un avión. Ahora todo está dentro de él, la tipografía incluida.

### Hacia dónde fue después

El pregenerador escribe cada página en cinco idiomas, el blog está en sesenta y tres artículos en inglés, alemán y francés, y el changelog del que vienes se pregenera a partir de la misma lista escrita — esta página incluida. Las cifras han crecido; la regla no ha cambiado.

Relacionado: [qué significa HTML autónomo](/blog/self-contained-html-explained), y [un generador de sitios estáticos o un conversor](/blog/static-site-generator-or-converter).`,
      },
      it: {
        title: 'Un blog, e HTML vero per ogni pagina',
        summary: `Venti articoli su \`/blog\`, resi dal convertitore che descrivono. Un FAQ sotto la zona di rilascio e di nuovo nella documentazione, presi da una sola lista.

Ogni pagina su cui un estraneo può arrivare è ora un file vero con titolo, descrizione, link canonico e dati strutturati propri, più \`sitemap.xml\` e \`robots.txt\`. E l'\`.html\` scaricato è diventato davvero autonomo — prima collegava il proprio carattere da Google Fonts.`,
        description:
          'La versione 1.1.0 ha dato a ogni indirizzo un vero HTML pre-renderizzato con titolo, descrizione e dati strutturati propri, e ha aperto il blog con venti articoli.',
        keywords:
          'transformpipe 1.1.0, html pre-renderizzato per single page application, sitemap e robots txt, file html autonomo da scaricare, seo per un’app javascript',
        body: `Prima di questa versione il sito era un unico bundle JavaScript dietro un unico file HTML. Ogni indirizzo serviva lo stesso file, quindi ogni indirizzo aveva lo stesso titolo e la stessa descrizione: un crawler, un'anteprima di link o chi legge con gli script disattivati riceveva il guscio e nulla al suo interno.

### HTML vero per ogni indirizzo

Ogni pagina su cui un estraneo può arrivare è ora scritta come file a sé, con titolo, descrizione, link canonico e dati strutturati propri, più una \`sitemap.xml\` e un \`robots.txt\` che prima semplicemente non esistevano. L'app prende ancora il controllo una volta caricata; quello che è cambiato è ciò che arriva per primo.

### Venti articoli

Il blog è iniziato con venti articoli su \`/blog\`, scritti in Markdown e resi dal convertitore per cui esiste il sito. Era una scelta deliberata e lo è ancora: una modifica che rompe il renderer rompe queste pagine prima di rompere il documento di qualcuno, e questo è un posto migliore per scoprirlo.

Il FAQ è arrivato insieme: sotto la zona di rilascio e di nuovo nella documentazione, letto da una sola lista, così le due versioni non possono divergere.

### Il download non ha più bisogno della rete

L'\`.html\` che restituisce una conversione doveva stare in piedi da solo e non ci riusciva del tutto: collegava il proprio carattere da Google Fonts. Un file che telefona all'esterno per essere visualizzato non è un file che si può archiviare, spedire a qualcuno dietro un firewall o leggere in aereo. Ora contiene tutto al suo interno, compreso il carattere.

### Come è andata dopo

Il pre-renderer scrive ogni pagina in cinque lingue, il blog è arrivato a sessantatré articoli in inglese, tedesco e francese, e il changelog da cui sei arrivato qui è pre-renderizzato dalla stessa lista tipizzata — questa pagina compresa. I numeri sono cresciuti; la regola non è cambiata.

Da leggere: [cosa significa HTML autonomo](/blog/self-contained-html-explained), e [un generatore di siti statici o un convertitore](/blog/static-site-generator-or-converter).`,
      },
    },
    body:
      'Twenty articles at `/blog`, rendered by the converter they describe. An FAQ under the ' +
      'dropzone and again in the documentation, from one list.\n\n' +
      'Every page a stranger arrives on is now a real file with its own title, description, ' +
      'canonical link and structured data, plus `sitemap.xml` and `robots.txt`. And the ' +
      'downloaded `.html` became genuinely self-contained — it used to link its typeface from ' +
      'Google Fonts.',
  },
  {
    date: '2026-09-08',
    version: '1.0.0',
    title: 'Markdown in, a document out',
    slug: 'markdown-in-a-document-out',
    detail: {
      en: {
        description:
          'Version 1.0.0, the first release: Markdown to HTML with a preview and a download, an account with a history, sharing by link, and an API, a CLI and an Action.',
        keywords:
          'transformpipe 1.0.0, m2h first release, markdown to html converter with preview, markdown converter api and cli, github action markdown to html',
        body: `The first tag, under the product's first name: M2H, a Markdown-to-HTML converter. One direction, one format in, one format out — and, unusually for a first release, an API, a CLI and a GitHub Action on the same day.

### What it did

Drop a Markdown file and get three things: a preview of the document, the HTML source behind it, and a download of one \`.html\` file meant to stand on its own — it still linked its typeface from Google Fonts, which 1.1.0 fixed. An account kept a history that followed you between machines, and a document could be shared by link or with named addresses, who got a read-only page rather than the converter.

### Why a script could use it from the start

A public API with revocable keys and quotas, a CLI with no dependencies, and a GitHub Action that comments rendered links on a pull request. A converter is a thing people reach for repeatedly — the second time you convert a release note by hand you want the build to do it — so the machine-readable way in was not left for later.

The documentation at \`/docs\` shipped with it, its screenshots captured from the running app rather than drawn, so they cannot quietly show an interface that no longer exists.

### What it did not do

Anything but Markdown. No Word, no CSV, no JSON, no HTML back into Markdown, no PDF, and no pasting — it wanted a file. Converting also put the result on your account, because the history was the point; that is the part of this release that has since been undone, and a conversion now stays in your browser until you press Save.

### Where it went next

1.1.0 brought the blog and real HTML for every page; 2.0.0 brought the name and four more formats in. Today it reads ten, converts entirely in the browser, and the same converters run in a browser extension, in an installable app, and behind a connector an assistant can use.

Related: [what a Markdown to HTML converter is for](/blog/markdown-to-html-converter), and [converting documents with an API](/blog/converting-documents-with-an-api).`,
      },
      de: {
        title: 'Markdown rein, ein Dokument raus',
        summary: `Die erste Veröffentlichung. Ein Konverter mit Vorschau, einer Ansicht des HTML-Quelltexts und einem eigenständigen Download; Konten und ein Verlauf über Geräte hinweg; Teilen per Link oder per Adresse, mit einer Seite nur zum Lesen.

Eine öffentliche API mit widerrufbaren Schlüsseln und Kontingenten, ein CLI ohne Abhängigkeiten und eine GitHub Action, die gerenderte Links an einen Pull Request kommentiert. Dokumentation unter \`/docs\`, mit Screenshots aus der laufenden App.`,
        description:
          'Version 1.0.0, die erste Veröffentlichung: Markdown zu HTML mit Vorschau, ein Konto mit Verlauf, Teilen per Link und dazu API, CLI und GitHub Action.',
        keywords:
          'transformpipe 1.0.0, m2h erste version, markdown zu html konverter mit vorschau, markdown konverter api und cli, github action markdown zu html',
        body: `Der erste Tag, unter dem ersten Namen des Produkts: M2H, ein Konverter von Markdown nach HTML. Eine Richtung, ein Format hinein, ein Format hinaus — und, für eine erste Veröffentlichung ungewöhnlich, am selben Tag eine API, ein CLI und eine GitHub Action.

### Was es konnte

Eine Markdown-Datei ablegen und drei Dinge bekommen: eine Vorschau des Dokuments, den HTML-Quelltext dahinter und den Download einer \`.html\`-Datei, die für sich stehen sollte — sie lud ihre Schrift noch von Google Fonts, was 1.1.0 behoben hat. Ein Konto führte einen Verlauf, der zwischen Rechnern mitkam, und ein Dokument ließ sich per Link oder an benannte Adressen teilen, die eine Seite nur zum Lesen bekamen statt des Konverters.

### Warum ein Skript es von Anfang an benutzen konnte

Eine öffentliche API mit widerrufbaren Schlüsseln und Kontingenten, ein CLI ohne Abhängigkeiten und eine GitHub Action, die gerenderte Links an einen Pull Request kommentiert. Ein Konverter ist etwas, zu dem man immer wieder greift — beim zweiten von Hand konvertierten Änderungshinweis möchten Sie, dass der Build es tut —, also blieb der maschinenlesbare Weg hinein nicht für später liegen.

Die Dokumentation unter \`/docs\` kam mit, ihre Screenshots aus der laufenden App aufgenommen statt gezeichnet, damit sie nicht unbemerkt eine Oberfläche zeigen können, die es nicht mehr gibt.

### Was es nicht konnte

Alles außer Markdown. Kein Word, kein CSV, kein JSON, kein HTML zurück nach Markdown, kein PDF und kein Einfügen — es wollte eine Datei. Und eine Konvertierung legte ihr Ergebnis auf das Konto, denn der Verlauf war der Sinn der Sache; das ist der Teil dieser Version, der seither zurückgenommen wurde: Eine Konvertierung bleibt jetzt in Ihrem Browser, bis Sie speichern.

### Wie es weiterging

1.1.0 brachte das Blog und echtes HTML für jede Seite, 2.0.0 den Namen und vier weitere Formate hinein. Heute liest es zehn, konvertiert vollständig im Browser, und dieselben Konverter laufen in einer Browser-Erweiterung, in einer installierbaren App und hinter einem Konnektor, den ein Assistent benutzen kann.

Weiter: [wozu ein Markdown-nach-HTML-Konverter da ist](/blog/markdown-to-html-converter) und [Dokumente über eine API konvertieren](/blog/converting-documents-with-an-api).`,
      },
      fr: {
        title: 'Markdown en entrée, un document en sortie',
        summary: `La première version. Un convertisseur avec un aperçu, une vue du code source HTML et un téléchargement autonome ; des comptes et un historique valable sur plusieurs appareils ; un partage par lien ou par adresse, avec une page en lecture seule.

Une API publique avec des clés révocables et des quotas, un CLI sans dépendance, et une GitHub Action qui commente les liens rendus sur une pull request. Documentation sous \`/docs\`, avec des captures d’écran prises depuis l’application en fonctionnement.`,
        description:
          'Version 1.0.0, la première publication : Markdown vers HTML avec aperçu, un compte avec historique, partage par lien, une API, un CLI et une Action.',
        keywords:
          'transformpipe 1.0.0, première version de m2h, convertisseur markdown vers html avec aperçu, api et cli de convertisseur markdown, github action markdown vers html',
        body: `La première étiquette de version, sous le premier nom du produit : M2H, un convertisseur de Markdown vers HTML. Une seule direction, un format en entrée, un format en sortie — et, ce qui est rare pour une première version, une API, un CLI et une GitHub Action le même jour.

### Ce qu’il faisait

Déposer un fichier Markdown et obtenir trois choses : un aperçu du document, le code source HTML derrière lui, et le téléchargement d’un fichier \`.html\` unique censé tenir seul — il chargeait encore sa police depuis Google Fonts, ce que 1.1.0 a corrigé. Un compte tenait un historique qui vous suivait entre les machines, et un document pouvait être partagé par lien ou avec des adresses nommées, qui recevaient une page en lecture seule plutôt que le convertisseur.

### Pourquoi un script pouvait l’utiliser dès le début

Une API publique avec des clés révocables et des quotas, un CLI sans dépendance, et une GitHub Action qui commente des liens rendus sur une pull request. Un convertisseur est une chose vers laquelle on revient sans cesse — la deuxième fois que vous convertissez à la main une note de version, vous voulez que le build le fasse — donc la voie lisible par machine n’a pas été laissée pour plus tard.

La documentation sous \`/docs\` est arrivée avec lui, ses captures d’écran prises depuis l’application en fonctionnement plutôt que dessinées, pour qu’elles ne puissent pas montrer discrètement une interface qui n’existe plus.

### Ce qu’il ne faisait pas

Tout, sauf Markdown. Pas de Word, pas de CSV, pas de JSON, pas de HTML remis en Markdown, pas de PDF, et pas de collage — il voulait un fichier. Convertir plaçait aussi le résultat sur votre compte, car l’historique était le but ; c’est la partie de cette version qui a depuis été défaite, et une conversion reste désormais dans votre navigateur jusqu’à ce que vous appuyiez sur Enregistrer.

### Où cela a mené ensuite

1.1.0 a apporté le blog et du vrai HTML pour chaque page ; 2.0.0 a apporté le nom et quatre formats supplémentaires en entrée. Aujourd’hui, il en lit dix, convertit entièrement dans le navigateur, et les mêmes convertisseurs tournent dans une extension de navigateur, dans une application installable, et derrière un connecteur qu’un assistant peut utiliser.

Autres lectures : [à quoi sert un convertisseur Markdown vers HTML](/blog/markdown-to-html-converter), et [convertir des documents avec une API](/blog/converting-documents-with-an-api).`,
      },
      es: {
        title: 'Markdown dentro, un documento fuera',
        summary: `La primera versión. Un conversor con vista previa, una vista del código HTML fuente y una descarga autónoma; cuentas e historial entre dispositivos; compartir por enlace o por dirección, con una página de solo lectura.

Una API pública con claves revocables y cuotas, un CLI sin dependencias, y una GitHub Action que comenta enlaces renderizados en un pull request. Documentación en \`/docs\`, con capturas tomadas de la aplicación en marcha.`,
        description:
          'La versión 1.0.0, la primera publicación: Markdown a HTML con vista previa y descarga, cuenta con historial, compartir por enlace, y una API, un CLI y una Action.',
        keywords:
          'transformpipe 1.0.0, primera versión de m2h, conversor de markdown a html con vista previa, api y cli para conversor markdown, github action de markdown a html',
        body: `La primera etiqueta, bajo el primer nombre del producto: M2H, un conversor de Markdown a HTML. Una sola dirección, un formato de entrada, un formato de salida — y, algo inusual para una primera versión, una API, un CLI y una GitHub Action el mismo día.

### Qué hacía

Soltar un archivo Markdown y obtener tres cosas: una vista previa del documento, el código HTML que hay detrás, y la descarga de un único archivo \`.html\` pensado para sostenerse por sí solo — todavía enlazaba su tipografía desde Google Fonts, algo que 1.1.0 arregló. Una cuenta llevaba un historial que le seguía entre equipos, y un documento podía compartirse por enlace o con direcciones concretas, que recibían una página de solo lectura en lugar del conversor.

### Por qué un script podía usarlo desde el principio

Una API pública con claves revocables y cuotas, un CLI sin dependencias, y una GitHub Action que comenta enlaces renderizados en un pull request. Un conversor es algo a lo que se recurre una y otra vez — la segunda vez que convierte a mano una nota de versión quiere que lo haga el build — así que la vía legible por máquinas no se dejó para más adelante.

La documentación en \`/docs\` se publicó con ella, con capturas tomadas de la aplicación en marcha en vez de dibujadas, para que no puedan mostrar sin darse cuenta una interfaz que ya no existe.

### Qué no hacía

Nada que no fuera Markdown. Ni Word, ni CSV, ni JSON, ni HTML de vuelta a Markdown, ni PDF, ni pegar texto — pedía un archivo. Convertir también dejaba el resultado en tu cuenta, porque el historial era el objetivo; esa es la parte de esta versión que desde entonces se ha revertido, y ahora una conversión permanece en tu navegador hasta que pulsas Guardar.

### Hacia dónde fue después

1.1.0 trajo el blog y HTML real para cada página; 2.0.0 trajo el nombre y cuatro formatos más de entrada. Hoy lee diez, convierte por completo en el navegador, y los mismos conversores funcionan en una extensión de navegador, en una aplicación instalable y detrás de un connector que puede usar un asistente.

Relacionado: [para qué sirve un conversor de Markdown a HTML](/blog/markdown-to-html-converter), y [convertir documentos con una API](/blog/converting-documents-with-an-api).`,
      },
      it: {
        title: 'Markdown in ingresso, un documento in uscita',
        summary: `La prima versione. Un convertitore con anteprima, una vista del codice HTML sorgente e un download autonomo; account e cronologia tra dispositivi; condivisione per link o per indirizzo, con una pagina di sola lettura.

Un'API pubblica con chiavi revocabili e quote, una CLI senza dipendenze e una GitHub Action che commenta link resi su una pull request. Documentazione su \`/docs\`, con schermate catturate dall'app in esecuzione.`,
        description:
          'La versione 1.0.0, la prima release: da Markdown a HTML con anteprima e download, un account con cronologia, condivisione per link, e un’API, una CLI e una Action.',
        keywords:
          'transformpipe 1.0.0, m2h prima versione, convertitore markdown html con anteprima, api e cli per convertitore markdown, github action markdown in html',
        body: `Il primo tag, sotto il primo nome del prodotto: M2H, un convertitore da Markdown a HTML. Una sola direzione, un formato in ingresso, un formato in uscita — e, cosa inusuale per una prima release, un'API, una CLI e una GitHub Action lo stesso giorno.

### Cosa faceva

Lasciavi cadere un file Markdown e ottenevi tre cose: un'anteprima del documento, il codice HTML sottostante, e il download di un unico file \`.html\` pensato per stare in piedi da solo — collegava ancora il proprio carattere da Google Fonts, cosa che la 1.1.0 ha corretto. Un account manteneva una cronologia che ti seguiva tra i dispositivi, e un documento poteva essere condiviso per link o con indirizzi nominati, che ottenevano una pagina di sola lettura invece del convertitore.

### Perché uno script poteva usarlo fin dall'inizio

Un'API pubblica con chiavi revocabili e quote, una CLI senza dipendenze, e una GitHub Action che commenta link resi su una pull request. Un convertitore è qualcosa a cui si torna ripetutamente — la seconda volta che converti a mano una nota di rilascio vuoi che a farlo sia il build — quindi la via leggibile dalle macchine non è stata lasciata per dopo.

La documentazione su \`/docs\` è arrivata insieme, con schermate catturate dall'app in esecuzione invece che disegnate, così non possono mostrare silenziosamente un'interfaccia che non esiste più.

### Cosa non faceva

Tutto tranne Markdown. Niente Word, niente CSV, niente JSON, niente HTML tornato in Markdown, niente PDF e nessun incolla — voleva un file. Convertire, inoltre, metteva il risultato sul tuo account, perché la cronologia era il punto centrale; questa è la parte di questa versione che è stata poi ritirata, e ora una conversione resta nel tuo browser finché non premi Salva.

### Come è andata dopo

La 1.1.0 ha portato il blog e HTML vero per ogni pagina; la 2.0.0 ha portato il nome e quattro formati in più in ingresso. Oggi ne legge dieci, converte interamente nel browser, e gli stessi convertitori funzionano in un'estensione del browser, in un'app installabile e dietro un connettore che un assistente può usare.

Da leggere: [a cosa serve un convertitore da Markdown a HTML](/blog/markdown-to-html-converter), e [convertire documenti con un'API](/blog/converting-documents-with-an-api).`,
      },
    },
    body:
      'The first release. A converter with a preview, an HTML source view and a self-contained ' +
      'download; accounts and history across devices; sharing by link or by address, with a ' +
      'read-only page.\n\n' +
      'A public API with revocable keys and quotas, a dependency-free CLI, and a GitHub Action ' +
      'that comments rendered links on a pull request. Documentation at `/docs`, with ' +
      'screenshots captured from the running app.',
  },
];

/**
 * Newest first, sorted here rather than trusted from the list above.
 *
 * An entry added in the wrong place is the likeliest edit to this file, and it would put a March
 * change above a September one with nothing failing.
 */
export const CHANGELOG: ChangelogEntry[] = [...ENTRIES].sort((a, b) =>
  b.date.localeCompare(a.date)
);

/** The newest entry's date, for the sitemap. Real, unlike the deploy date. */
export const CHANGELOG_UPDATED = CHANGELOG[0].date;

export interface ChangelogMonth {
  /** `YYYY-MM`, which is what `formatMonth` turns into the reader's words. */
  key: string;
  entries: ChangelogEntry[];
}

export interface ChangelogYear {
  year: string;
  months: ChangelogMonth[];
}

/**
 * The entries as a year of months of entries, newest first at every level.
 *
 * Grouping here rather than in the page, because the prerenderer needs the same shape and the two
 * must not disagree about which month an entry falls in. Both take it from this.
 *
 * A year holds one month today and the page is built for the year it holds three: the grouping is
 * what makes a changelog readable once it is longer than a screen, and adding it later would mean
 * restructuring a page somebody had already learned.
 */
export function changelogByYear(): ChangelogYear[] {
  const years: ChangelogYear[] = [];

  for (const entry of CHANGELOG) {
    const year = entry.date.slice(0, 4);
    const key = entry.date.slice(0, 7);

    let holding = years.find((one) => one.year === year);

    if (!holding) {
      holding = { year, months: [] };
      years.push(holding);
    }

    let month = holding.months.find((one) => one.key === key);

    if (!month) {
      month = { key, entries: [] };
      holding.months.push(month);
    }

    month.entries.push(entry);
  }

  return years;
}

/** Every year with an entry in it, newest first — what a year navigation is built from. */
export const CHANGELOG_YEARS: string[] = [
  ...new Set(CHANGELOG.map((entry) => entry.date.slice(0, 4))),
];

/** Every entry that has a page of its own, newest first. */
export const CHANGELOG_PAGES: ChangelogEntry[] = CHANGELOG.filter(
  (entry) => Boolean(entry.slug)
);

/**
 * One entry's page in the language asked for, falling back to English.
 *
 * The fallback is not a failure: the rule for this file is English, and a translation is the
 * exception somebody wrote on purpose. A reader in a language nobody has written yet gets the
 * English piece under a translated heading, which is what the changelog list already does.
 */
export function detailIn(
  detail: ChangelogDetail,
  locale: Locale
): ChangelogDetailText {
  return detail[locale] ?? detail.en;
}

/** One entry by its slug, for the router and the page. */
export function changelogEntryBySlug(
  slug: string
): ChangelogEntry | undefined {
  return CHANGELOG_PAGES.find((entry) => entry.slug === slug);
}

/**
 * What is wrong with the entries, as sentences, or nothing.
 *
 * Called by the prerenderer, so a bad entry fails the build rather than shipping a page with an
 * empty body or two entries at the same address. The rules are the blog's, for the same reasons:
 * a description a search result can show whole, a body that is not endless, and one page per URL.
 */
export function changelogProblems(): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const entry of CHANGELOG) {
    const where = `${entry.date} "${entry.title}"`;

    if (!entry.slug) {
      if (entry.detail) {
        problems.push(`${where}: has a detail but no slug, so nothing can reach it`);
      }

      continue;
    }

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry.slug)) {
      problems.push(`${where}: slug "${entry.slug}" is not kebab-case`);
    }

    if (seen.has(entry.slug)) {
      problems.push(`${where}: slug "${entry.slug}" is used twice`);
    }

    seen.add(entry.slug);

    if (!entry.detail) {
      problems.push(`${where}: has a slug and no detail`);

      continue;
    }

    for (const [language, text] of Object.entries(entry.detail)) {
      const said = `${where} [${language}]`;

      if (!text.body.trim()) {
        problems.push(`${said}: empty body`);
      }

      if (text.body.length > DETAIL_LIMIT) {
        problems.push(
          `${said}: body is ${text.body.length} characters, over ${DETAIL_LIMIT}`
        );
      }

      /* The page supplies the h1, so a heading in the body would be a second one. */
      if (/^#\s/m.test(text.body)) {
        problems.push(`${said}: body has a top-level heading of its own`);
      }

      const length = text.description.length;

      if (length < 100 || length > 165) {
        problems.push(`${said}: description is ${length} characters, want 100-165`);
      }

      if (text.keywords.split(',').filter((one) => one.trim()).length < 4) {
        problems.push(`${said}: keywords should be at least four phrases`);
      }
    }
  }

  /*
   * Neither the Italian nor the Spanish addresses the reader formally, and both catalogues say so
   * at the top of themselves — `messages/it/ui.ts`:
   * "No 'Lei': a converter that says it sounds like a bank letter", and `messages/es/ui.ts`:
   * "El registro es impersonal siempre que se puede ... y tutea cuando no hay forma de evitar
   * dirigirse al lector". Both blogs follow the same line — `il tuo account`, `tu cuenta`.
   *
   * They were comments, and a comment is a thing you find out about after writing forty-two pages
   * in the wrong voice — twice, once per language, because after fixing the Italian I said the
   * Spanish was fine without measuring it. This is those notes, as something that fails.
   *
   * Only the forms that cannot be anything else: the `Lei` pronoun with its capitalised
   * possessives and the `voi` forms; `usted` and `ustedes`. Lower-case `suo`, `sua` and `su` are
   * left alone — they are the ordinary third-person possessive and appear in every honest sentence
   * about a document and its author. That makes this check narrower than the rules, which is the
   * right way round: it never cries wolf, and the rules themselves are prose a person still has to
   * read.
   */
  const FORMAL: Partial<Record<Locale, { pattern: RegExp; note: string }>> = {
    it: {
      pattern:
        /\b(Lei|Suo|Sua|Suoi|Sue|avete|potete|siete|vostro|vostra|vostri|vostre|voi)\b/,
      note: "this site's Italian uses tu — see the note at the top of messages/it/ui.ts",
    },
    es: {
      pattern: /\b(usted|ustedes)\b/i,
      note: "this site's Spanish tutea — see the note at the top of messages/es/ui.ts",
    },
  };

  for (const entry of CHANGELOG) {
    for (const [language, rule] of Object.entries(FORMAL)) {
      const piece = entry.detail?.[language as Locale];

      if (!piece) {
        continue;
      }

      const found = [
        piece.title,
        piece.summary,
        piece.description,
        piece.keywords,
        piece.body,
      ]
        .join(' ')
        .match(rule.pattern);

      if (found) {
        problems.push(
          `${entry.date} "${entry.title}" [${language}]: "${found[0]}" addresses the reader ` +
            `formally; ${rule.note}`
        );
      }
    }
  }

  return problems;
}
