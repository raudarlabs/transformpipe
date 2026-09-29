import type { Content } from '../../content';

/*
 * Les sections de la documentation en français : un titre et la phrase qui dit ce à quoi la
 * section répond, par identifiant de section.
 *
 * Les identifiants et l’ordre restent dans `src/lib/docs-sections.ts`, parce qu’un identifiant est
 * l’ancre dans l’adresse — `/fr/docs#converting` — et qu’une adresse est la même dans toutes les
 * langues.
 *
 * Le résumé est lu seul dans la page pré-rendue : il doit tenir debout sans la section dessous.
 */
export const docs: Content['docs'] = {
  start: {
    title: 'Pour commencer',
    summary:
      'Déposez un fichier et vous avez le document converti et un téléchargement ; connectez-vous et les mêmes documents vous suivent d’un appareil à l’autre, peuvent être partagés, et sont accessibles à un script.',
  },
  converting: {
    title: 'Convertir',
    summary:
      'Les quinze conversions — Markdown vers HTML, et HTML, Word, PowerPoint, Excel, OpenDocument, texte enrichi, EPUB, CSV, JSON, texte brut et les exports Evernote, Notion, Confluence ou Obsidian vers Markdown — ce que chacune accepte, l’enchaînement de plusieurs fichiers en un seul document, l’onglet source, et les formats qu’un téléchargement peut livrer : Markdown, HTML, texte brut ou un PDF imprimé.',
  },
  extension: {
    title: 'Extension de navigateur',
    summary:
      'La page où vous êtes, en Markdown, en un clic — et les conversions du site, dans le navigateur.',
  },
  history: {
    title: 'Historique',
    summary:
      'Recherche, colonnes triables, et un filtre par conversion pour réduire une liste mêlée à un seul type. Les lignes se fusionnent, se téléchargent dans n’importe quel format, ou se suppriment en lot.',
  },
  sharing: {
    title: 'Partage',
    summary:
      'Un lien que tout le monde peut ouvrir, ou des adresses nommées qui demandent au lecteur de se connecter. La révocation abandonne le jeton, de sorte qu’un lien déjà envoyé cesse de fonctionner. Un lien peut cesser de fonctionner à une date choisie.',
  },
  account: {
    title: 'Compte',
    summary:
      'La connexion Google, le thème, et les clés API — affichées une seule fois, stockées sous forme de hachage, et incapables d’atteindre le compte ou les clés elles-mêmes.',
  },
  api: {
    title: 'API',
    summary:
      'Tous les points d’entrée sous /api/v1, ce que chacun renvoie, et ce que signifient les statuts d’erreur.',
  },
  webhooks: {
    title: 'Webhooks',
    summary:
      'Un POST signé vers votre URL quand un document est créé ou partagé, et comment le vérifier.',
  },
  cli: {
    title: 'Ligne de commande',
    summary:
      'Un client sans dépendances : login, push, list, rm et usage, avec --share, --merge et --json.',
  },
  action: {
    title: 'GitHub Action',
    summary:
      'Publie le Markdown qu’une pull request a modifié et en commente les liens. Toutes les entrées, et les deux permissions dont elle a besoin.',
  },
  assistant: {
    title: 'MCP',
    summary:
      'Ajoutez TransformPipe à Claude comme connecteur et il peut convertir, enregistrer, partager et supprimer des documents dans ce compte — connecté en votre nom, sans aucune clé à coller.',
  },
  embed: {
    title: 'Solution intégrée',
    summary:
      'Intégrez le convertisseur dans votre propre interface avec /embed. Le fichier est converti dans le navigateur du visiteur et n’atteint aucun serveur, ni le vôtre ni le nôtre ; le résultat sort par postMessage.',
  },
  limits: {
    title: 'Limites',
    summary:
      '10 MB par fichier à convertir et 4 MB pour en conserver un dans un compte, 100 MB et 500 documents par compte, 60 requêtes par minute. Atteindre une limite refuse l’écriture au lieu de supprimer quoi que ce soit.',
  },
  faq: {
    title: 'Questions',
    summary:
      'Les mêmes réponses que le convertisseur affiche sous sa zone de dépôt, réunies en un seul endroit pour que les deux ne puissent pas diverger.',
  },
};
