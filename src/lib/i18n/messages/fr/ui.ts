import type { Content } from '../../content';

/*
 * La version française de `messages/en/ui.ts` : mêmes clés, même ordre, mêmes espaces réservés.
 *
 * Registre : vouvoiement, et des tournures impersonnelles partout où l’interface n’a pas besoin
 * de s’adresser à quelqu’un. Les libellés de boutons restent courts, quitte à dire un peu moins
 * que l’anglais — un bouton tronqué renseigne moins qu’un mot approchant.
 *
 * Les espaces avant « : », « ; » et « ? » sont insécables, et les guillemets sont les français.
 */

export const ui: Content['ui'] = {
  /* Mots qui n’appartiennent à aucun écran. */
  'common.copy': 'Copier',
  'common.copied': 'Copié',
  'common.loading': 'Chargement…',
  'common.clipboard.error': 'Accès au presse-papiers impossible',
  'common.selectall': 'Tout sélectionner',
  'common.deselectall': 'Tout désélectionner',
  'common.selected': '{count} sélectionnés',
  'common.exitselection': 'Quitter la sélection',
  'common.scrolltotop': 'Haut de la page',
  /* Dite par le convertisseur après un dépôt et par l’historique après une fusion — même phrase. */
  'common.chained': '{count} fichiers enchaînés en un seul document',
  /*
   * Le nom que porte un document fait de plusieurs fichiers : le premier nom, puis combien ont
   * suivi.
   *
   * Un nom plutôt qu’un libellé, et toujours une phrase — « autres » est un mot. Le nom d’un
   * document à source unique est celui de ce fichier, et `merged.md` pour aucune source est un nom
   * de fichier : les deux restent dans `src/lib/merge.ts`, avec le reste du nommage.
   */
  'common.merged.name': '{first} + {count} autres',

  /*
   * La connexion, qui échoue de plus de façons qu’elle ne réussit et doit dire laquelle.
   *
   * Les quatre phrases `auth.error` qui suivent la première sont les issues que `/api/auth/finish`
   * peut renvoyer dans la chaîne de requête — un ensemble fermé, parce que la raison arrive dans
   * un lien et qu’un lien, n’importe qui peut l’écrire. `auth.incomplete` est le toast qui porte
   * celle qui est arrivée.
   */
  'dialog.mcp.lede':
    'Ajoutez TransformPipe dans un assistant : il pourra convertir, enregistrer et partager des documents de ce compte.',
  'dialog.mcp.address': 'Adresse du connecteur',
  'dialog.mcp.nokey':
    'Sur claude.ai : Paramètres → Connecteurs → Ajouter un connecteur personnalisé. Aucune clé à coller : la connexion se fait sous votre compte et peut être coupée ici.',
  'dialog.mcp.command': 'Depuis un terminal',
  'header.connector': 'Connecteur MCP',
  'header.webhooks': 'Webhooks',

  /* The sign-in dialog: three views — in, up, and asking for a reset link. */
  'auth.dialog.signin.title': 'Connexion',
  'auth.dialog.signup.title': 'Créer votre compte',
  'auth.dialog.reset.title': 'Réinitialiser votre mot de passe',
  'auth.dialog.reset.lede':
    'Saisissez l’adresse e-mail du compte et un lien de réinitialisation vous sera envoyé.',
  'auth.dialog.email': 'E-mail',
  'auth.dialog.password': 'Mot de passe',
  'auth.dialog.forgot': 'Mot de passe oublié ?',
  'auth.dialog.submit.signin': 'Se connecter',
  'auth.dialog.submit.signup': 'Continuer',
  'auth.dialog.submit.reset': 'Envoyer le lien',
  'auth.dialog.tonew': 'Vous n’avez pas de compte ?',
  'auth.dialog.tonew.action': 'S’inscrire',
  'auth.dialog.toexisting': 'Vous avez déjà un compte ?',
  'auth.dialog.toexisting.action': 'Se connecter',
  'auth.dialog.back': 'Retour à la connexion',
  'auth.dialog.or': 'ou',
  'auth.dialog.google': 'Continuer avec Google',
  'auth.dialog.aside.lede': 'Le compte n’est pas l’essentiel. Ce qu’il contient, si.',
  'auth.dialog.aside.history': 'Historique',
  'auth.dialog.aside.history.detail': 'chaque document converti est conservé et se rouvre',
  'auth.dialog.aside.links': 'Liens',
  'auth.dialog.aside.links.detail': 'partager un document avec tout le monde ou avec des personnes nommées',
  'auth.dialog.aside.api': 'API et MCP',
  'auth.dialog.aside.api.detail': 'une clé pour la CLI, la GitHub Action et votre assistant',
  'auth.dialog.aside.extension': 'L’extension',
  'auth.dialog.aside.extension.detail': 'le même compte, connecté depuis votre navigateur',
  'auth.dialog.terms': 'J’accepte les {terms}',
  'auth.dialog.terms.link': 'conditions d’utilisation',
  'auth.dialog.terms.required': 'Les conditions doivent être acceptées pour créer un compte.',
  'auth.dialog.verify.title': 'Confirmer votre e-mail',
  'auth.dialog.verify.lede':
    'Un code à six chiffres a été envoyé à {email}. Il expire dans dix minutes.',
  'auth.dialog.verify.code': 'Code à six chiffres',
  'auth.dialog.verify.submit': 'Confirmer',
  'auth.dialog.verify.resend': 'Envoyer un autre code',
  'auth.dialog.verify.resent': 'Un nouveau code est en route.',
  'auth.dialog.verify.done': 'L’adresse est confirmée.',
  'auth.dialog.verify.later': 'Plus tard',
  'header.verify': 'Confirmer votre e-mail',
  'auth.dialog.reset.sent': 'Si un compte existe pour cette adresse, un lien est en route.',
  'auth.verify.sent':
    'Le compte est créé. Le lien de confirmation de l’adresse est dans votre boîte.',

  'auth.incomplete': 'La connexion n’a pas abouti',
  'auth.error.unfinished': 'La connexion ne s’est pas terminée. Réessayez.',
  'auth.error.link': 'Le lien de connexion était incomplet. Réessayez.',
  'auth.error.unreachable': 'Le service de connexion est inaccessible.',
  'auth.error.rejected': 'Le service de connexion a refusé la demande.',
  'auth.error.nosession': 'Le service de connexion n’a renvoyé aucune session.',
  'auth.error.start': 'Lancement de la connexion impossible',
  'auth.error.signout': 'La déconnexion a échoué',

  /* La barre du haut, sur grand écran et dans le panneau du téléphone. */
  'header.home': 'Nouveau fichier',
  'header.nav.converter': 'Convertisseur',
  'header.nav.history': 'Historique',
  'header.nav.docs': 'Docs',
  'header.nav.documentation': 'Documentation',
  'header.nav.blog': 'Blog',
  'header.menu.open': 'Menu',
  'header.menu.title': 'Menu',
  'header.menu.close': 'Fermer le menu',
  'header.menu.convert': 'Convertir',
  'header.menu.goto': 'Aller à',
  'docs.webhooks.intro':
    'Le menu du compte contient une entrée {webhooks} : vous enregistrez une URL et elle reçoit un POST signé dès qu’un document est créé, ou partagé avec des personnes nommées. C’est derrière une session et non sous {api}, délibérément — une clé capable d’enregistrer un webhook transformerait une fuite en flux permanent de tous les documents à venir, au lieu de l’accès ponctuel d’aujourd’hui.',
  'docs.webhooks.signature':
    'Le corps est signé en HMAC-SHA256 sur {payload} et envoyé dans l’en-tête {header} — la forme utilisée par Stripe et GitHub, si bien qu’un code de vérification existant ne demande en général qu’un autre secret.',
  'docs.webhooks.secret':
    'Le secret est affiché à la création et peut être réaffiché depuis la fenêtre. Contrairement à une clé d’API, il est présenté par cette application et non à elle : le propriétaire du compte peut légitimement avoir besoin de le relire en configurant un récepteur.',
  'docs.webhooks.delivery':
    'La livraison est au mieux : une requête, cinq secondes de délai, aucune reprise et aucune file d’attente. Un récepteur arrêté rate cette livraison, et la fenêtre indique quand la dernière a échoué.',
  /* The browser extension — see extension/ and content/extension-plan.md. */
  'ext.panel': 'Ouvrir dans le panneau latéral',
  'ext.refresh': 'Reconvertir cette page',
  'ext.panel.permission':
    'Le panneau latéral reste ouvert pendant que vous naviguez : il lui faut donc l’autorisation de lire les pages que vous ouvrez — le bouton de la barre n’en a jamais eu besoin, car l’appuyer *est* l’autorisation.',
  'ext.panel.allow': 'Autoriser la lecture',
  'ext.panel.close': 'Fermer le panneau latéral',
  'ext.panel.detail':
    'Il reste à côté de la page et vous suit d’un onglet à l’autre, au lieu de se fermer dès que vous regardez ailleurs.',
  'ext.account': 'Compte',
  'ext.signin': 'Se connecter avec TransformPipe',
  'ext.signout': 'Se déconnecter',
  'ext.signedout': 'Non connecté',
  'ext.settings': 'Paramètres',
  'ext.share.failed': 'Échec de l’enregistrement — reconnectez-vous',
  'ext.shared.link': 'Lien copié dans le presse-papiers',
  'ext.signin.hint':
    'Connectez-vous et cette extension pourra enregistrer une page convertie dans votre compte et publier un lien. Elle demande la même autorisation qu’un assistant, et vous pouvez la retirer à tout moment depuis votre compte.',
  'ext.signin.refused': 'La connexion n’a pas abouti.',
  'ext.key.connect': 'Connecter',
  'ext.key.connected': 'Connecté',
  'ext.key.disconnect': 'Déconnecter',
  'ext.save': 'Enregistrer',
  'ext.saved': 'Enregistré',
  'ext.share': 'Partager',
  'ext.shared': 'Lien copié',
  'ext.connect': 'Connectez un compte pour enregistrer et partager',
  'ext.converting': 'Conversion…',
  'ext.failed': 'Cette page ne peut pas être lue',
  'ext.restricted': 'Chrome n’autorise aucune extension à lire ses propres pages. Ouvrez une page ordinaire et réessayez — ou convertissez un fichier à la place.',
  'ext.wholepage': 'Page entière',
  'ext.selection': 'Sélection',
  'ext.stats': '{words} mots · {size}',
  'ext.copy': 'Copier le Markdown',
  'ext.copied': 'Copié',
  'ext.download': 'Télécharger le .md',
  'ext.download.html': 'Télécharger le .html',
  'ext.generating': 'Génération du HTML…',
  'ext.html.page': 'La page, telle quelle',
  'ext.html.page.detail': 'Son design, images et styles inclus dans le fichier',
  'ext.html.text': 'L’article seul',
  'ext.html.text.detail': 'Converti et nettoyé, comme sur le site',
  'ext.open': 'Ouvrir dans un onglet',
  'ext.files': 'Ouvrir des fichiers…',
  'ext.viewer.empty': 'Choisissez des fichiers à convertir — dix formats, le tout dans ce navigateur',
  'ext.viewer.hint':
    'Déposez un fichier ou choisissez-en un — Word, Excel, CSV, JSON, HTML, texte brut, ou un export Notion, Confluence ou Obsidian. Plusieurs fichiers sont enchaînés en un seul document. Rien ne quitte ce navigateur.',
  'palette.title': 'Recherche',
  'palette.placeholder': 'Rechercher un document, une conversion ou une page',
  'palette.empty': 'Aucun résultat',
  'palette.group.recent': 'Récents',
  'palette.seeall': 'Voir tous les documents',
  'palette.group.read': 'Lire',

  /* The consent banner and its switches. See src/lib/consent.tsx for what each one turns on. */
  'cookies.banner.title': 'Les cookies sur ce site',
  'cookies.banner.body': 'La connexion nécessite deux cookies, toujours actifs. Les statistiques sont facultatives et désactivées tant que vous ne les autorisez pas — rien n’est écrit dans votre navigateur avant votre réponse.',
  'cookies.banner.more': 'Ce que fait chacun',
  'cookies.banner.accept': 'Tout accepter',
  'cookies.banner.reject': 'Nécessaires uniquement',
  'cookies.banner.customise': 'Personnaliser',
  'cookies.settings.title': 'Paramètres des cookies',
  'cookies.settings.lede': 'Deux catégories, dont une est un choix. Vous pouvez le modifier à tout moment depuis la page Cookies.',
  'cookies.settings.necessary': 'Nécessaires',
  'cookies.settings.necessary.detail': 'La session de connexion et le thème choisi. Les refuser reviendrait à refuser de se connecter : ils ne peuvent pas être désactivés.',
  'cookies.settings.analytics': 'Statistiques',
  'cookies.settings.analytics.detail': 'Google Analytics, via Google Tag Manager : combien de personnes arrivent et quelles pages elles lisent. Désactivé tant que vous ne l’autorisez pas, et tant que c’est désactivé les balises de Google n’écrivent rien dans votre navigateur.',
  'cookies.settings.save': 'Enregistrer mes choix',
  'cookies.settings.open': 'Paramètres des cookies',
  'header.account': 'Compte',
  'header.signin': 'Se connecter',
  'header.logout': 'Se déconnecter',
  'header.apikeys': 'Clés API',
  'header.theme.label': 'Thème',
  'header.theme.dark': 'Sombre',
  'header.theme.light': 'Clair',
  'header.theme.toggle': 'Changer de thème',
  'header.theme.tolight': 'Passer en clair',
  'header.theme.todark': 'Passer en sombre',

  /* L’écran du convertisseur : la zone de dépôt, le document produit, et les bandes du dessous. */
  'converter.dropzone.title': 'Déposer les fichiers {extension} ici',
  'converter.dropzone.choose': 'Choisir des fichiers',
  'converter.dropzone.limits':
    '{extensions} · jusqu’à 10 MB · traité dans le navigateur',
  /*
   * Le même fait que `converter.dropzone.limits`, en phrase plutôt qu’en série de fragments :
   * celle-ci est destinée à la page pré-rendue, lue par un robot et par qui n’a pas encore reçu
   * le bundle, là où une file de points médians n’est pas de la prose.
   */
  'converter.accepts':
    'Accepte {extensions}, jusqu’à 10 MB, converti dans votre navigateur.',
  'converter.picker.label': 'Ou convertir autre chose',
  'converter.picker.soon': 'Bientôt',
  'converter.picker.soon.title': 'Pas encore là — c’est prévu',
  'converter.howto': 'Ce format est nouveau pour vous ?',
  'converter.blog.eyebrow': 'Blog',
  'converter.blog.title': 'Discipliner le Markdown',
  'converter.blog.blurb':
    'De la syntaxe qui casse, des documents qui doivent arriver chez quelqu’un d’autre, et tout cela qui tourne sans vous.',
  'converter.blog.all': 'Tous les articles',
  'converter.faq.eyebrow': 'FAQ',
  'converter.faq.title': 'Les questions que l’on se pose en arrivant',
  'converter.faq.blurb':
    'Ce qu’il advient du fichier, ce que contient le téléchargement, et ce qu’apporte un compte.',
  'converter.badge.converted': 'converti',
  'converter.badge.merged': '{count} fichiers fusionnés',
  'converter.newfile': 'Nouveau fichier',
  'converter.share': 'Partager',
  'converter.share.hint': 'Partager un lien vers ce document',
  'converter.share.hint.signedout':
    'Connectez-vous pour partager — le partage suppose le document dans votre compte',
  'converter.copy': 'Copier {format}',
  'converter.copy.done': '{format} copié dans le presse-papiers',
  'converter.download': 'Télécharger .{format}',
  'converter.download.more': 'Autres formats',
  'converter.download.done': '{format} téléchargé',
  'converter.print': 'Imprimer ou enregistrer en PDF',
  'converter.print.error': 'Ouverture de la boîte d’impression impossible',
  'converter.print.error.hint': 'Essayez plutôt de le télécharger.',
  'converter.download.docx': 'Word (.docx)',
  'converter.download.docx.needsSave': 'Word (.docx) — enregistrez d’abord le document',
  'converter.download.docx.error': 'Impossible de générer le document Word',
  'converter.tab.preview': 'Aperçu',
  'converter.tab.html': 'Source HTML',
  'converter.tab.markdown': 'Markdown',
  'converter.tab.check': 'Vérification',
  'check.clean': 'Rien à corriger',
  'check.clean.detail': 'Aucune ancre morte, aucun titre vide, aucune image sans texte alternatif.',
  'check.lede': 'Ce sur quoi un lecteur ou un lecteur d’écran buterait. Rien n’est modifié pour vous : chaque point est une seule correction dans la source.',
  'check.line': 'Ligne {line}',
  'check.suggestion': 'Vouliez-vous dire {anchor} ?',
  'check.dead-anchor': 'Lien vers une section absente',
  'check.duplicate-anchor': 'Deux titres portant le même nom',
  'check.empty-heading': 'Un titre sans texte',
  'check.missing-alt': 'Une image sans texte alternatif',
  'check.empty-link': 'Un lien sans libellé',
  'check.empty-href': 'Un lien qui ne mène nulle part',
  'converter.tab.summary': 'Résumé IA',
  'converter.fullscreen.enter': 'Lire en plein écran',
  'converter.fullscreen.exit': 'Quitter le plein écran',
  'converter.summary.needsSave':
    'Enregistrez ce document dans votre compte pour le résumer.',
  'converter.summary.loading': 'Lecture du document…',
  'converter.summary.error': 'Impossible de résumer ce document.',
  'converter.summary.retry': 'Réessayer',
  'converter.summary.regenerate': 'Régénérer',

  /*
   * Quand un fichier ne passe pas : ce qui a été déposé, ce qui était trop volumineux, ce que la
   * conversion elle-même avait à dire, et ce qu’est un document converti mais trop gros pour être
   * conservé.
   *
   * La raison est toujours une deuxième phrase plutôt qu’une proposition accrochée à la première,
   * parce que le toast a deux lignes et qu’une raison est ce sur quoi on peut agir. `{conversion}`
   * est le nom venu de `content.conversions`, donc l’échec dit « Word → Markdown n’a pas
   * fonctionné » dans toutes les langues.
   */
  'converter.reject.title': 'Ce fichier ne peut pas être converti ici',
  'converter.reject.extension': '{name} — cette page accepte {extensions}.',
  'converter.reject.mixed':
    'Ce sont {count} types de fichiers différents. Convertissez un type à la fois.',
  'converter.toolarge.one': 'Fichier trop volumineux',
  'converter.toolarge.many': 'Ces fichiers sont trop volumineux',
  'converter.toolarge.detail': '{size} — la limite est de {limit} par document.',
  'converter.converted': 'Converti en {format}',
  'converter.notkept.title': 'Converti, mais non enregistré dans votre compte',
  'converter.notkept.detail':
    'Un document conservé peut atteindre {limit} ; celui-ci fait {size}. Téléchargez-le — il est prêt.',
  'converter.failed': '{conversion} n’a pas fonctionné',
  'converter.failed.detail': 'Le fichier n’a pas pu être lu.',
  'converter.error.norows': 'Ce fichier ne contient aucune ligne.',
  /* `{why}` est ce que le convertisseur en dit lui-même, celui de mammoth pour un fichier Word. */
  'converter.error.empty': 'Ce document n’a rien produit — {why}.',
  'converter.error.empty.why': 'le fichier ne contient aucun texte',
  /* Le cadre depuis lequel un PDF est imprimé : jamais vu, lu par un lecteur d’écran. */
  'converter.print.frame': '{name}, pour l’impression',
  'converter.print.unprepared':
    'Préparation du document pour l’impression impossible.',

  /*
   * Ce dont le document est fait, un nom par décompte. Le nombre est un élément à part sur la
   * ligne — il est en gras — donc le mot se traduit seul et non dans une phrase à trou.
   */
  'converter.stats.word': 'mot',
  'converter.stats.words': 'mots',
  'converter.stats.heading': 'titre',
  'converter.stats.headings': 'titres',
  'converter.stats.table': 'tableau',
  'converter.stats.tables': 'tableaux',
  'converter.stats.codeblock': 'bloc de code',
  'converter.stats.codeblocks': 'blocs de code',
  'converter.stats.link': 'lien',
  'converter.stats.links': 'liens',
  'converter.stats.image': 'image',
  'converter.stats.images': 'images',

  /* La liste de tout ce qui a été converti : son en-tête, ses filtres, ses lignes, ses colonnes. */
  'history.title': 'Historique',
  /*
   * Saving, which is now something a person does rather than something that happens to them.
   *
   * A conversion stays in this browser; the account gets a document when the button is pressed. So
   * the list has two kinds of row, and `history.mixed` is what the page says when it holds both.
   */
  'converter.save': 'Enregistrer',
  'converter.saved': 'Enregistré',
  'converter.save.hint': 'Le garde dans votre compte, sur tous vos appareils.',
  'converter.save.hint.signedout':
    'Connectez-vous pour le garder dans votre compte. D’ici là il reste dans ce navigateur.',
  'converter.save.done': 'Enregistré dans votre compte',
  'converter.share.hint.unsaved':
    'Enregistrez-le d’abord — un lien demande le document dans votre compte.',
  'history.row.unsaved': 'Non enregistré',
  'history.mixed': 'Les documents enregistrés, et ce que ce navigateur a converti',

  'history.synced': 'Enregistré dans votre compte',
  'history.local':
    'Conservé dans ce navigateur — connectez-vous pour y accéder partout',
  'history.usage':
    '· {bytes} sur {maxBytes} · {documents} sur {maxDocuments} documents',
  'history.empty.title': 'Aucune conversion pour l’instant',
  'history.empty.synced':
    'Chaque fichier converti est enregistré dans votre compte — ouvrez-le depuis n’importe quel appareil.',
  'history.empty.local':
    'Chaque fichier converti apparaît ici. Connectez-vous pour garder la liste d’un appareil à l’autre.',
  'history.empty.action': 'Convertir un fichier',
  'history.drop.title': 'Déposer des fichiers',
  'history.drop.hint':
    'ou cliquez pour parcourir — plusieurs fichiers sont enchaînés en un seul document',
  'history.search.placeholder': 'Rechercher par nom',
  'history.search.label': 'Rechercher dans l’historique par nom de fichier',
  'history.search.clear': 'Effacer la recherche',
  'history.chip.all': 'Tous les formats',
  'history.chip.shared': 'Partagés avec moi',
  'history.shared.one': '{count} document partagé avec vous',
  'history.shared.many': '{count} documents partagés avec vous',
  'history.count.one': '{count} fichier',
  'history.count.many': '{count} fichiers',
  'history.count.filtered.one': '{found} fichier sur {total}',
  'history.count.filtered.many': '{found} fichiers sur {total}',
  'history.merge': 'Fusionner',
  'history.merge.hint':
    'Enchaîner les fichiers sélectionnés en un seul document, du plus ancien au plus récent',
  'history.merge.hint.few': 'Choisissez au moins deux fichiers à enchaîner',
  'history.download': 'Télécharger',
  'history.delete': 'Supprimer',
  'history.clear': 'Vider l’historique',
  'history.column.file': 'Fichier',
  'history.column.type': 'Type',
  'history.column.sharedby': 'Partagé par',
  'history.column.size': 'Taille source',
  'history.column.content': 'Contenu',
  'history.column.converted': 'Converti',
  'history.column.actions': 'Actions',
  'history.row.someone': 'quelqu’un',
  'history.row.select': 'Sélectionner {name}',
  'history.row.open': 'Ouvrir l’aperçu',
  'history.row.open.label': 'Ouvrir {name}',
  'history.row.unavailable':
    'Source trop volumineuse pour être conservée localement',
  'history.row.share': 'Partager',
  'history.row.share.label': 'Partager {name}',
  'history.row.versions': 'Versions',
  'history.row.versions.label': 'Voir les versions de {name}',
  'history.row.download.label': 'Télécharger {name}',
  'history.row.remove': 'Retirer de l’historique',
  'history.row.stats.one': '{words} mots · {headings} titre',
  'history.row.stats.many': '{words} mots · {headings} titres',

  /*
   * Ce que la liste dit quand elle a fait quelque chose, ou n’a pas pu.
   *
   * `history.error.*` appartiennent à `useHistory` : le hook n’a pas de mots à lui, l’écran lui
   * passe un `t` et il rend compte dans la langue du lecteur. Le refus d’un serveur est repris
   * comme le `{reason}` de l’une de ces phrases plutôt qu’affiché seul, puisqu’il arrive en
   * anglais quelle que soit la langue du lecteur — et `history.error.delete.reason` tient la place
   * quand il ne dit rien.
   */
  'history.error.load': 'Chargement de l’historique impossible',
  'history.error.save': 'Enregistrement du fichier impossible',
  'history.error.delete': 'Suppression impossible : {reason}',
  'history.error.delete.reason': 'refus du serveur',
  'history.error.delete.some':
    '{failed} fichiers sur {total} n’ont pas pu être supprimés',
  'history.error.clear': 'Vidage de l’historique impossible',
  'history.source.missing': 'La source de ce fichier n’est plus disponible',
  'history.download.done': 'Fichier téléchargé',
  'history.download.none': 'Aucun téléchargement possible',
  'history.download.one': 'Fichier {format} téléchargé',
  'history.download.many': '{count} fichiers {format} téléchargés',
  'history.merge.none': 'Rien à fusionner',
  'history.merge.none.detail':
    'Les sources de ces fichiers ne sont plus disponibles.',
  'history.removed.one': 'Fichier retiré',
  'history.removed.many': '{count} fichiers retirés',
  'history.cleared': 'Historique vidé',

  /*
   * L’index du blog. Les articles eux-mêmes ne sont pas dans le catalogue — voir `content.ts` —
   * donc le titre, la description et l’étiquette d’une carte restent l’anglais dans lequel le
   * texte a été écrit, et seul le mobilier autour est ici.
   */
  'blog.eyebrow': 'Blog',
  'blog.title': 'Le Markdown, et quoi en faire',
  'blog.blurb':
    'Conversion, syntaxe qui casse, publication, et tout cela qui tourne sans vous.',
  'blog.chip.all': 'Tout',
  'blog.empty': 'Rien sous cette étiquette pour l’instant.',
  'blog.card.meta': '{date} · {minutes} min de lecture',

  /* Un article : le mobilier autour d’un texte qui reste en anglais. */
  'article.toc': 'Dans cet article',
  'article.meta': '{date} · {minutes} min de lecture',
  'article.meta.updated':
    '{date} · mis à jour le {updated} · {minutes} min de lecture',
  'article.share': 'Partager',
  'article.cta.text':
    'Cette page a été écrite en Markdown et rendue par le convertisseur qu’elle décrit.',
  'article.cta.button': 'Convertir un fichier',
  'article.more.eyebrow': 'Suite',
  'article.more.title': 'Continuer la lecture',
  'article.more.meta': '{minutes} min de lecture',
  'article.missing.title': 'Article introuvable',
  'article.missing.blurb':
    'Il a peut-être été renommé. L’index contient tout ce qui existe.',
  'article.missing.back': 'Retour au blog',

  /*
   * Les cinq pages qui ne sont que des mots. Leur texte est dans `pages.ts`, par page ; ces deux
   * clés sont ce que le rendu dit autour.
   *
   * La phrase de clôture est coupée parce qu’un lien se trouve dedans : `page.questions` est la
   * phrase jusqu’au lien et `page.questions.link` les mots que porte l’ancre.
   */
  'page.updated': 'Dernière mise à jour le {date}',
  'page.questions': 'Toute question à ce sujet est à adresser à',
  'page.questions.link': 'les tickets du dépôt',

  /*
   * Un document que quelqu’un vous a envoyé, à /open/<token>.
   *
   * C’est un écran de l’application, donc il suit la langue du lecteur comme tous les autres. Le
   * texte que le serveur rend à /s/<token> est une autre page, pour un lecteur dont on ne sait
   * rien, et ses mots ne sont pas ici — voir `src/lib/i18n/content.ts`.
   *
   * Son bouton de téléchargement et son bouton de connexion disent ce que ces boutons disent
   * partout ailleurs : ils lisent `converter.download` et `header.signin` plutôt que des clés à
   * eux.
   */
  'shared.loading': 'Ouverture du document…',
  'shared.meta': 'partagé · converti le {date}',
  'shared.badge': 'Partagé avec vous',
  'shared.save': 'Enregistrer une copie',
  'shared.saved': 'Enregistré sur votre compte',
  'shared.save.done': 'Une copie est sur votre compte',
  'shared.save.error': 'La copie n’a pas pu être enregistrée',
  'shared.cta.title': 'Ce document a été créé avec TransformPipe',
  'shared.cta.body': 'Une page web, un fichier Word, un PDF ou un tableur devient un document propre — la conversion a lieu dans votre navigateur, le fichier n’en sort pas. Un compte conserve vos documents et les partage comme celui-ci l’a été avec vous.',
  'shared.cta.primary': 'Convertir un fichier — gratuit',
  'shared.cta.secondary': 'Créer un compte',

  /* Le formulaire de la page d’assistance. Il remplit un ticket GitHub ; il n’envoie rien lui-même. */
  'support.form.title': 'Signaler quelque chose',
  'support.form.blurb':
    'Deux champs, et le ticket s’ouvre sur GitHub avec les deux déjà écrits dedans.',
  'support.form.summary': 'Ce qui s’est passé, en une ligne',
  'support.form.summary.placeholder': 'Les tableaux arrivent vides quand je convertis un .docx',
  'support.form.details': 'Ce que vous attendiez, et ce que vous avez obtenu',
  'support.form.details.placeholder':
    'J’ai converti un fichier Word avec un tableau à trois colonnes. Les en-têtes sont arrivés, pas les lignes. Chrome 140 sur macOS.',
  'support.form.open': 'Ouvrir le ticket sur GitHub',
  'support.form.note':
    'Rien ne quitte cette page : elle ouvre GitHub, où vous appuyez sur Envoyer. Un compte GitHub est nécessaire.',
  'shared.signin.title': 'Ce document est partagé avec des personnes précises',
  'shared.signin.detail':
    'Connectez-vous avec l’adresse à laquelle il a été partagé.',
  'shared.missing.title': 'Ce lien n’ouvre aucun document',
  'shared.missing.action': 'Convertir votre propre fichier',

  /* Le partage d’un document. */
  'dialog.share.title': 'Partager',
  'dialog.share.mode.private': 'Privé',
  'dialog.share.mode.link': 'Toute personne ayant le lien',
  'dialog.share.mode.people': 'Personnes précises',
  'dialog.share.private.note':
    'Vous seul pouvez ouvrir ce document. Choisissez un mode ci-dessus pour le partager.',
  'dialog.share.link': 'Lien',
  'dialog.share.link.field': 'Lien de partage',
  'dialog.share.link.note':
    'Toute personne ayant ce lien peut lire le document.',
  'dialog.share.people.note':
    'Seules les personnes ci-dessous peuvent l’ouvrir, après connexion avec cette adresse. Chacune reçoit le lien par e-mail dès que vous l’ajoutez.',
  'dialog.share.people.empty':
    'Personne pour l’instant — le lien ne s’ouvre que pour vous.',
  'dialog.share.email.label': 'Adresse du destinataire',
  'dialog.share.add': 'Ajouter',
  'dialog.share.remove.label': 'Retirer {email}',
  'dialog.share.error': 'Le partage a échoué',

  /* Les clés API, et les assistants qui ont été admis. */
  'dialog.keys.title': 'Clés API',
  'dialog.keys.blurb':
    'Convertir et partager des documents depuis un script, un terminal ou la CI — et les assistants que vous avez connectés.',
  'dialog.keys.name.placeholder': 'Ce qui l’utilisera — « CI », « mon portable »',
  'dialog.keys.name.label': 'Nom de la clé',
  'dialog.keys.create': 'Créer',
  'dialog.keys.create.error': 'Création de la clé impossible',
  'dialog.keys.fresh': 'Copiez-la maintenant — elle ne sera plus affichée',
  'dialog.keys.empty':
    'Aucune clé pour l’instant. Une clé peut lire, écrire et partager vos documents — elle ne peut toucher ni à votre compte ni à ces clés.',
  'dialog.keys.revoked': '{name} · révoquée',
  'dialog.keys.meta': '{prefix}… · {used}',
  'dialog.keys.used': 'utilisée {when}',
  'dialog.keys.never': 'jamais utilisée',
  'dialog.keys.forget': 'Retirer de la liste',
  'dialog.keys.forget.label': 'Retirer {name}',
  'dialog.keys.revoke': 'Révoquer — cesse de fonctionner immédiatement',
  'dialog.keys.revoke.label': 'Révoquer {name}',
  'dialog.keys.grants': 'Assistants connectés',
  'dialog.keys.grant.meta': 'connecté {since} · {used}',
  'dialog.keys.disconnect': 'Déconnecter — cesse aussitôt d’agir en votre nom',
  'dialog.keys.disconnect.label': 'Déconnecter {name}',

  /* La chaîne de versions d’un document, et la différence entre deux de ses versions. */
  'dialog.versions.title': 'Versions',
  'dialog.versions.blurb': 'Des documents liés entre eux comme versions d’une même chose.',
  'dialog.versions.back': 'Retour à la liste',
  'dialog.versions.compare': 'Comparer avec la précédente',
  'dialog.versions.error': 'Impossible de charger cette comparaison',

  /* Webhooks sortants : un document a été créé, ou partagé. */
  'dialog.webhooks.title': 'Webhooks',
  'dialog.webhooks.blurb':
    'Un POST signé vers une URL à vous lorsqu’un document est créé ou partagé.',
  'dialog.webhooks.url.placeholder': 'https://votre-serveur.example/webhook',
  'dialog.webhooks.url.label': 'URL du webhook',
  'dialog.webhooks.url.error': 'l’url doit être une adresse https://',
  'dialog.webhooks.create': 'Ajouter',
  'dialog.webhooks.create.error': 'Impossible de créer le webhook',
  'dialog.webhooks.fresh':
    'Le secret de signature — vérifiez les livraisons avec lui. Vous pouvez le revoir avec l’icône œil ci-dessous.',
  'dialog.webhooks.empty':
    'Pas encore de webhook. Ajoutez-en un pour être averti à la création ou au partage d’un document.',
  'dialog.webhooks.status.never': 'Aucune livraison pour l’instant',
  'dialog.webhooks.status.ok': 'Livré {when}',
  'dialog.webhooks.status.failed': 'Dernière livraison échouée, {when}',
  'dialog.webhooks.reveal': 'Afficher le secret de signature',
  'dialog.webhooks.reveal.label': 'Afficher le secret de signature de {url}',
  'dialog.webhooks.reveal.error': 'Impossible de lire le secret',
  'dialog.webhooks.revoke': 'Supprimer ce webhook',
  'dialog.webhooks.revoke.label': 'Supprimer le webhook de {url}',

  /* Le pied du site. La colonne des conversions et les liens légaux tirent leurs mots d’ailleurs. */
  'footer.tagline':
    'Conversion de documents pour les humains, les applications et les agents IA.',
  /*
   * The live preview at /markdown-live-preview, and the paste box on the converter.
   *
   * `live.sample` is what the page opens with, so it is words rather than lorem: an empty editor
   * shows nothing of what the page does, to a reader or to a search result.
   */
  'converter.paste.open': 'Ou coller du texte {extension}',
  'converter.paste.open.disabled': 'Coller du texte',
  'converter.paste.unavailable':
    'Il n’y a rien à coller pour {extension} — déposez le fichier lui-même',
  'converter.paste.label': 'Coller du texte {extension}',
  'converter.paste.close': 'Fermer',
  'converter.paste.placeholder': 'Collez ou tapez ici, puis convertissez.',
  'converter.paste.convert': 'Convertir',
  'converter.paste.count': '{count} caractères',
  'footer.live': 'Aperçu en direct',
  'live.menu.hint': 'Taper et voir le rendu',
  'converter.paste.live': 'Plutôt l’aperçu en direct',
  'live.eyebrow': 'Aperçu en direct',
  'live.title': 'Aperçu Markdown en direct',
  'live.lede':
    'Tapez ou collez du Markdown à gauche et regardez le document se construire à droite — tableaux, code coloré, diagrammes Mermaid et maths LaTeX compris. Rien n’est téléversé : le texte reste dans cet onglet.',
  'live.renders': 'Ce qui est rendu ici',
  'live.renders.gfm': 'GitHub Flavored Markdown',
  'live.renders.tables': 'Tableaux et listes de tâches',
  'live.renders.code': 'Code coloré',
  'live.renders.mermaid': 'Diagrammes Mermaid',
  'live.renders.math': 'Maths LaTeX',
  'live.bare': 'On dirait un diagramme Mermaid tout seul. Markdown ne le dessine que dans un bloc de code.',
  'live.bare.action': 'L’entourer d’un bloc',
  'live.save': 'Convertir et garder',
  'live.save.hint':
    'L’ouvre comme document : dans l’historique, prêt à partager ou à télécharger dans un autre format.',
  'live.editor': 'Markdown',
  'live.preview': 'Aperçu',
  'live.copy': 'Copier le HTML',
  'live.download': 'Télécharger le .html',
  'live.filename': 'apercu',
  'live.note':
    'Le même convertisseur que le reste du site : ce que vous voyez ici est ce que contient le fichier téléchargé — diagrammes et formules voyagent dedans, sans feuille de style ni police à récupérer. Le HTML brut de la source est assaini.',
  'live.seo.title': 'Aperçu Markdown en direct',
  'live.seo.description':
    'Collez du Markdown et voyez-le rendu à côté : GitHub Flavored Markdown, code coloré, diagrammes Mermaid et maths KaTeX. Copiez le HTML ou téléchargez un fichier autonome.',
  'live.sample':
    '# Aperçu Markdown en direct\n\nTapez à gauche. Le document à droite suit, avec les styles qu’un fichier téléchargé **emporte avec lui**.\n\n- GitHub Flavored Markdown, assaini.\n- Tableaux, listes de tâches, citations et code.\n\n| Format | Devient |\n| --- | --- |\n| Markdown | HTML |\n\nLe code est coloré selon son langage :\n\n```ts\nexport const render = (md: string) => toHtml(md); // one converter everywhere\n```\n\nDes maths entre dollars : $E = mc^2$, $\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$\n\nEt un diagramme depuis un bloc :\n\n```mermaid\nflowchart LR\n  MD[Markdown] --> TP[TransformPipe]\n  TP --> HTML\n  TP --> Word\n```\n',

  /*
   * The changelog page, at /changelog and linked from the footer's Resources.
   *
   * Only the chrome is here. The entries are `src/lib/changelog.ts`, in English, for the reason
   * `ChangelogPage` gives: a changelog grows by an entry per release, and five translations per
   * entry is a cost that gets skipped after the second one.
   */
  'changelog.eyebrow': 'Journal des versions',
  'changelog.title': 'Ce qui est livré',
  'changelog.lede':
    'Chaque version et, sous elle, les changements que quelqu’un remarquerait. La plus récente en premier ; les versions sont les tags du dépôt.',
  'changelog.years': 'Par année',
  'changelog.scope':
    'Uniquement les changements visibles dans le produit. Les remaniements internes et les travaux d’infrastructure ne figurent pas ici, et les entrées elles-mêmes sont en anglais.',
  'changelog.seo.title': 'Journal des versions',
  'changelog.seo.description':
    'Chaque version de TransformPipe et les changements qui l’accompagnent, la plus récente en premier.',
  'changelog.more': 'Lire le détail',
  'changelog.back': 'L\'intégralité du journal',
  'changelog.entry.eyebrow': 'Note de version',
  'changelog.entry.missing.title': 'Cette note de version n\'existe pas',
  'changelog.entry.missing.body': 'Rien n\'a été publié à cette adresse. Le journal des modifications recense tout ce qui l\'a été.',
  'footer.changelog': 'Journal des versions',

  /*
   * The page for an address that is not a page.
   *
   * `notfound.note` is the one line here that is not navigation: a reader who mistyped something
   * knows they did, and a reader who followed a link from these pages has found a defect and is
   * the only person who can say so.
   */
  'notfound.eyebrow': '404',
  'notfound.title': 'Cette adresse n’est pas une page',
  'notfound.lede':
    'Rien sur ce site ne lui répond. Soit un caractère est faux, soit un lien ailleurs pointe vers quelque chose qui a déménagé.',
  'notfound.converter': 'Convertir un fichier',
  'notfound.docs': 'Lire la documentation',
  'notfound.blog': 'Parcourir le blog',
  'notfound.note':
    'Si un lien de ce site vous a amené ici, c’est un défaut et non une faute de frappe.',
  'notfound.seo.title': 'Page introuvable',
  'notfound.seo.description':
    'Cette adresse ne correspond à aucune page du site. Le convertisseur, la documentation et le blog sont à un clic.',

  'footer.note': '© Raudar Labs {year}',
  'footer.converter': 'Convertisseur',
  'footer.resources': 'Ressources',
  'footer.howto': 'Guides pratiques',
  'footer.company': 'Société',
  'footer.legal': 'Mentions légales',
  'footer.docs': 'Documentation',
  'footer.blog': 'Blog',
  'footer.faq': 'FAQ',
  /* Lu après le nom du lien, donc commence par l’espace qui les sépare. */
  'footer.external': ' (s’ouvre dans un nouvel onglet)',
};
