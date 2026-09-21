import type { Content } from '../../content';

/*
 * Le nom de chaque conversion et ce que dit sa page, en français.
 *
 * Les identifiants, les adresses et les extensions restent dans `shared/conversions.ts` : le
 * serveur les lit et n’a pas de langue. Ici il n’y a que des mots.
 *
 * Les blocs `seo` ne sont pas une traduction de l’anglais mais la phrase qu’un francophone tape
 * réellement — « convertir markdown en html », « convertir word en markdown » — avec la même
 * promesse que fait l’anglais, ni plus ni moins.
 */

export const conversions: Content['conversions'] = {
  'markdown-to-html': {
    label: 'Markdown → HTML',
    short: 'MD → HTML',
    title: 'Markdown vers HTML',
    blurb:
      'Déposez un fichier Markdown — le HTML rendu apparaît aussitôt et se télécharge comme un document prêt à l’emploi.',
    hint: 'Déposez un fichier .md et voyez exactement le rendu qu’il aura en HTML. Plusieurs fichiers déposés ensemble sont enchaînés en un seul document, dans l’ordre choisi.',
    seo: {
      title: 'Convertir Markdown en HTML — TransformPipe',
      description:
        'Convertir Markdown en HTML dans le navigateur : le document rendu et un .html autonome à télécharger. Connectez-vous pour conserver, partager et publier.',
    },
  },
  'html-to-markdown': {
    label: 'HTML → Markdown',
    short: 'HTML → MD',
    title: 'HTML vers Markdown',
    blurb:
      'Déposez un fichier HTML — ou une page que vous avez enregistrée — et récupérez du Markdown, titres, liens, listes et tableaux intacts.',
    hint: 'Déposez un fichier .html et récupérez du Markdown. Les tableaux, les listes de tâches et les blocs de code survivent ; la mise en forme, non, parce que Markdown n’en a pas.',
    seo: {
      title: 'Convertir HTML en Markdown — TransformPipe',
      description:
        'Convertir un fichier HTML ou une page enregistrée en Markdown, tableaux et blocs de code compris. Conversion dans le navigateur : rien n’est envoyé.',
    },
  },
  'word-to-markdown': {
    label: 'Word → Markdown',
    short: 'DOCX → MD',
    title: 'Word vers Markdown',
    blurb:
      'Déposez un .docx et récupérez du Markdown : les titres, les listes, les liens et les tableaux passent, les polices et les marges non.',
    hint: 'Déposez un .docx venu de Word, de Google Docs ou de LibreOffice. Ce qui revient est la structure du document en Markdown — pas sa mise en page.',
    seo: {
      title: 'Convertir Word en Markdown (.docx) — TransformPipe',
      description:
        'Convertir un document Word en Markdown dans le navigateur : titres, listes, liens et tableaux conservés, mise en forme abandonnée. Rien n’est téléversé.',
    },
  },
  'csv-to-markdown': {
    label: 'CSV → tableau Markdown',
    short: 'CSV → MD',
    title: 'CSV en tableau Markdown',
    blurb:
      'Déposez un CSV ou un TSV et récupérez un tableau Markdown, la première ligne en en-tête et les colonnes alignées.',
    hint: 'Déposez un .csv ou un .tsv. Les champs entre guillemets, les virgules qu’ils contiennent et les retours à la ligne dans les cellules sont tous gérés.',
    seo: {
      title: 'CSV en tableau Markdown — TransformPipe',
      description:
        'Convertir un CSV en tableau Markdown : champs entre guillemets et virgules incluses gérés. Fonctionne aussi avec les TSV. Conversion locale, rien n’est téléversé.',
    },
  },
  'json-to-markdown': {
    label: 'JSON → Markdown',
    short: 'JSON → MD',
    title: 'JSON vers Markdown',
    blurb:
      'Déposez un fichier JSON et lisez-le comme un document : une liste d’enregistrements devient un tableau, un objet devient des sections avec ses champs en tête.',
    hint: 'Déposez un fichier .json. Une liste d’enregistrements devient un tableau ; les objets imbriqués deviennent des titres. Une valeur par ligne — un export de journal — est comprise aussi.',
    seo: {
      title: 'Convertir JSON en Markdown — TransformPipe',
      description:
        'JSON en Markdown lisible : les listes d’enregistrements deviennent des tableaux, les objets des sections. Tout se fait dans le navigateur, rien n’est envoyé.',
    },
  },
  'notion-to-markdown': {
    label: 'Notion → Markdown',
    short: 'Notion → MD',
    title: 'Export Notion vers Markdown',
    blurb:
      'Déposez le .zip de l’« Export as Markdown & CSV » de Notion et obtenez un seul document : chaque page dans l’ordre, avec un sommaire, les bases de données en tableaux.',
    hint: 'Déposez le .zip que Notion exporte. Chaque page devient une section avec son propre titre, dans l’ordre d’origine ; une base de données devient un tableau.',
    seo: {
      title: 'Convertir un export Notion en Markdown — TransformPipe',
      description:
        'Convertir un .zip « Export as Markdown & CSV » de Notion en un document Markdown, pages dans l’ordre avec sommaire. Conversion locale, rien n’est téléversé.',
    },
  },
  'confluence-to-markdown': {
    label: 'Confluence → Markdown',
    short: 'Confluence → MD',
    title: 'Export Confluence vers Markdown',
    blurb:
      'Déposez le .zip du « Export → HTML » d’un espace Confluence et obtenez un document Markdown : chaque page dans l’ordre, avec un sommaire.',
    hint: 'Déposez le .zip que produit l’export d’un espace Confluence. Chaque page devient une section avec son propre titre, dans l’ordre d’origine.',
    seo: {
      title: 'Convertir un export Confluence en Markdown — TransformPipe',
      description:
        'Convertir un .zip d’export HTML d’un espace Confluence en un document Markdown, pages dans l’ordre avec sommaire. Conversion locale, rien n’est téléversé.',
    },
  },
  'obsidian-to-markdown': {
    label: 'Obsidian → Markdown',
    short: 'Obsidian → MD',
    title: 'Coffre Obsidian vers Markdown',
    blurb:
      'Déposez un coffre Obsidian zippé et obtenez un document : chaque note dans l’ordre, avec un sommaire, les wikiliens conservés en texte.',
    hint: 'Déposez le .zip du dossier d’un coffre Obsidian. Chaque note devient une section avec son propre titre, dans l’ordre d’origine.',
    seo: {
      title: 'Convertir un coffre Obsidian en Markdown — TransformPipe',
      description:
        'Convertir un coffre Obsidian zippé en un document Markdown, notes dans l’ordre avec sommaire, wikiliens conservés en texte. Conversion locale, rien n’est téléversé.',
    },
  },
  'text-to-markdown': {
    label: 'Texte brut → Markdown',
    short: 'TXT → MD',
    title: 'Texte brut vers Markdown',
    blurb:
      'Déposez un fichier .txt qui n’a jamais été pensé comme du Markdown, et obtenez du Markdown qui dit exactement la même chose — un astérisque ou un tiret bas isolé ne devient pas une mise en emphase.',
    hint: 'Déposez un fichier .txt. Les caractères propres à Markdown — *, _, #, un tiret en début de ligne — sont échappés pour que le texte s’affiche exactement tel qu’écrit.',
    seo: {
      title: 'Convertir du texte brut en Markdown — TransformPipe',
      description:
        'Convertir du texte brut en Markdown sans que ses propres caractères soient pris pour de la mise en forme — astérisques, tirets bas et retours à la ligne conservés. Conversion locale, rien n’est téléversé.',
    },
  },
  'powerpoint-to-markdown': {
    label: 'PowerPoint → Markdown',
    short: 'PPTX → MD',
    title: 'PowerPoint vers Markdown',
    blurb:
      'Déposez un .pptx et obtenez une section par diapositive, dans l’ordre de présentation — avec les notes du présentateur, soit la moitié d’un diaporama que personne ne lit en dehors de la salle.',
    hint: 'Déposez un .pptx. Chaque diapositive devient une section sous son propre titre, les puces restent des puces et les tableaux des tableaux ; les notes suivent chacune d’elles.',
    seo: {
      title: 'Convertir PowerPoint en Markdown — TransformPipe',
      description:
        'Convertir un .pptx PowerPoint en Markdown : une section par diapositive, puces, tableaux et notes du présentateur conservés. Conversion locale, rien n’est téléversé.',
    },
  },
  'epub-to-markdown': {
    label: 'EPUB → Markdown',
    short: 'EPUB → MD',
    title: 'Un livre EPUB vers Markdown',
    blurb:
      'Déposez un .epub et obtenez le livre entier en un document — les chapitres dans l’ordre de lecture, sous les titres du sommaire, images comprises.',
    hint: 'Déposez un .epub. L’ordre de lecture vient de la spine du livre et non des noms de fichiers ; chaque chapitre devient une section.',
    seo: {
      title: 'Convertir un EPUB en Markdown — TransformPipe',
      description:
        'Convertir un livre EPUB en un document Markdown : chapitres dans l’ordre de lecture, sommaire conservé, images incluses. Conversion locale, rien n’est téléversé.',
    },
  },
  'odt-to-markdown': {
    label: 'OpenDocument → Markdown',
    short: 'ODT → MD',
    title: 'Un fichier OpenDocument vers Markdown',
    blurb:
      'Déposez un .odt — le format de LibreOffice, d’OpenOffice et d’un téléchargement Google Docs — et obtenez du Markdown avec ses titres, listes, tableaux, notes de bas de page et images.',
    hint: 'Déposez un .odt. Ce format annonce lui-même ses niveaux de titre, rien n’est donc deviné : les listes gardent leur imbrication, les tableaux restent des tableaux, les notes restent des notes.',
    seo: {
      title: 'Convertir un ODT en Markdown — TransformPipe',
      description:
        'Convertir un .odt LibreOffice ou OpenDocument en Markdown avec titres, listes, tableaux, notes et images conservés. Conversion locale, rien n’est téléversé.',
    },
  },
  'rtf-to-markdown': {
    label: 'Texte enrichi → Markdown',
    short: 'RTF → MD',
    title: 'Texte enrichi vers Markdown',
    blurb:
      'Déposez un .rtf — ce qu’écrivent TextEdit, WordPad et la plupart des logiciels quand on en tire du texte — et obtenez du Markdown plutôt qu’un mur de mots de contrôle.',
    hint: 'Déposez un .rtf. Gras, italique, liens, listes et tableaux passent ; un titre est lu dans le niveau de plan là où il y en a un, et dans le corps de la police là où il n’y en a pas.',
    seo: {
      title: 'Convertir un RTF en Markdown — TransformPipe',
      description:
        'Convertir un fichier .rtf en Markdown : gras, italique, liens, listes et tableaux conservés, titres retrouvés. Conversion locale, rien n’est téléversé.',
    },
  },
  'evernote-to-markdown': {
    label: 'Evernote → Markdown',
    short: 'ENEX → MD',
    title: 'Un export Evernote vers Markdown',
    blurb:
      'Déposez un .enex et obtenez chaque note comme section d’un seul document — avec ses étiquettes, sa date, ses cases à cocher et ses images.',
    hint: 'Déposez un .enex issu de Fichier, Exporter les notes. Les étiquettes suivent sous le titre de chaque note, les cases deviennent une liste de tâches, et une image est reliée à sa note par l’empreinte que le format utilise pour les associer.',
    seo: {
      title: 'Convertir un ENEX Evernote en Markdown — TransformPipe',
      description:
        'Convertir un export Evernote .enex en un document Markdown : chaque note une section, étiquettes, dates, cases et images conservées. Conversion locale.',
    },
  },
  'excel-to-markdown': {
    label: 'Excel → tableau Markdown',
    short: 'XLSX → MD',
    title: 'Excel vers un tableau Markdown',
    blurb:
      'Déposez un .xlsx et obtenez un tableau Markdown pour chaque feuille contenant des lignes — plus d’une, et elles arrivent avec un sommaire.',
    hint: 'Déposez un classeur .xlsx. La première ligne de chaque feuille devient l’en-tête du tableau ; les dates ressortent en date ISO plutôt qu’en numéro de série propre à Excel.',
    seo: {
      title: 'Convertir Excel en tableau Markdown — TransformPipe',
      description:
        'Convertir un classeur Excel .xlsx en tableaux Markdown, un par feuille avec sommaire. Conversion locale, rien n’est téléversé.',
    },
  },
};
