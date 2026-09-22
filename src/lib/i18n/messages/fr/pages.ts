import type { Content } from '../../content';

/*
 * Les mots des cinq pages qui ne sont que des mots : à propos, contact, et les trois pages légales.
 *
 * `src/lib/pages.ts` garde ce qu’une page *est* — son identifiant, son adresse, et la date que les
 * trois pages légales annoncent — et ce fichier garde ce qu’une page *dit*.
 *
 * Les trois pages légales sont une politique. Elles sont traduites, pas réécrites : même nombre de
 * paragraphes, même portée, aucune exception ajoutée ni retirée.
 */

export const pages: Content['pages'] = {
  about: {
    label: 'À propos',
    title: 'Ce qu’est TransformPipe',
    lede: 'Un convertisseur de documents qui fait le travail dans votre navigateur, et vous laisse tranquille.',
    sections: [
      {
        heading: 'Ce qu’il fait',
        body: [
          'Quinze conversions. Un fichier Word, un diaporama, un tableur, un livre EPUB, un fichier OpenDocument ou en texte enrichi, un export Evernote, une page HTML enregistrée, un CSV, une réponse JSON, ou l’archive que Notion, Confluence et Obsidian produisent à l’export — chacun devient du Markdown. Et le Markdown devient une page HTML finie, un fichier Word, du texte brut, ou quelque chose d’imprimable.',
          'Tout se normalise en Markdown, parce que le Markdown est un format qui se lit sans l’outil qui l’a produit, se compare dans une pull request, et s’ouvrira encore dans vingt ans.',
        ],
      },
      {
        heading: 'Il tourne dans votre navigateur',
        body: [
          'Déconnecté, aucun fichier n’est envoyé nulle part. Il n’y a pas de téléversement à qui faire confiance parce qu’il n’y a pas de téléversement : la conversion se fait sur votre machine — c’est pourquoi une page derrière l’authentification de votre entreprise se convertit aussi facilement qu’une page publique.',
          'Connectez-vous et le Markdown reste dans votre compte, si bien qu’un document vous suit sur une autre machine. Il reste privé jusqu’à ce que vous le partagiez, et un lien partagé se révoque.',
        ],
      },
      {
        heading: 'Ce qui en sort est un seul fichier',
        body: [
          'Le HTML exporté porte en lui ses styles, ses images, ses diagrammes et ses formules. Il ne demande rien au réseau — et c’est exactement ce qui fait qu’il s’ouvrira dans cinq ans sur un portable sans connexion comme il s’ouvre aujourd’hui, et qu’on peut l’envoyer à quelqu’un qui l’ouvrira une fois sans plus jamais y penser.',
        ],
      },
      {
        heading: 'Et pas seulement dans le navigateur',
        body: [
          'Les mêmes conversions atteignent un terminal, une pull request, un onglet et une conversation : une API publique, un client en ligne de commande sans dépendances, une GitHub Action qui publie le Markdown qu’une pull request modifie, une extension de navigateur qui convertit la page que vous lisez, et un serveur MCP pour qu’un assistant convertisse et partage en votre nom. Un seul jeu de convertisseurs derrière tout cela, pour qu’un tableau sorte pareil d’où qu’on l’ait demandé.',
        ],
      },
      {
        heading: 'Qui le construit',
        body: [
          'TransformPipe est construit par Raudar Labs. Le code source est public et sous licence MIT : la conversion à laquelle vous faites confiance, vous pouvez la lire.',
        ],
      },
    ],
    seo: {
      title: 'Ce qu’est TransformPipe — un convertisseur qui tourne dans le navigateur',
      description:
        'TransformPipe convertit quinze formats en Markdown et inversement, dans le navigateur et sans téléversement. Avec une API, un CLI, une Action, une extension et un serveur MCP.',
    },
  },
  support: {
    label: 'Assistance',
    title: 'Assistance',
    lede: 'Un bug, un format qui vous manque, ou quelque chose qui ne devrait pas être publié.',
    sections: [
      {
        heading: 'Un fichier mal converti',
        body: [
          'C’est la chose la plus utile que vous puissiez envoyer. Joignez-le au ticket si vous pouvez le partager, dites ce que vous attendiez, et nommez le navigateur si le résultat était correct ailleurs. Une conversion fausse sur un fichier l’est en général sur une forme, et le fichier est ce qui mène à cette forme.',
          'Un format que nous ne convertissons pas encore est une demande qui vaut la peine. Plusieurs de ceux qui sont ici ont commencé ainsi.',
        ],
      },
      {
        heading: 'Un partage qui ne devrait pas exister',
        body: [
          'Chaque document partagé porte un lien « Report this document » au pied de la page qu’il ouvre. C’est la voie la plus rapide : il désigne le document sans que vous ayez à le décrire, et ne demande aucun compte.',
        ],
      },
      {
        heading: 'Vie privée et questions légales',
        body: [
          'Les questions sur ce qui est conservé, ou une demande de suppression d’un compte et de tout ce qu’il contient, vont aux mêmes tickets. Connecté, vous pouvez aussi supprimer n’importe quel document vous-même — cela retire la ligne et la source stockée ensemble.',
        ],
      },
    ],
    seo: {
      title: 'Assistance — TransformPipe',
      description:
        'Signaler un bug, demander un format, signaler un document partagé, ou demander ce qui est conservé et le faire supprimer. Un ticket en deux champs.',
    },
  },
  extension: {
    label: 'Extension de navigateur',
    title: 'L’extension de navigateur',
    lede: 'La page où vous êtes, en Markdown, sans la quitter.',
    sections: [
      {
        heading: 'Un clic, et la page devient un document',
        body: [
          'Appuyez sur le bouton de la barre d’outils : l’extension lit la page que vous regardez, extrait l’article de la navigation et des bandeaux de cookies, rend absolue chaque adresse de lien et d’image, et rend du Markdown. Copiez-le, téléchargez-le, ou enregistrez la page en un fichier `.html` autonome — son design, ses images dans le fichier, et aucune requête vers quoi que ce soit.',
        ],
      },
      {
        heading: 'Les pages qui n’ont pas d’export',
        body: [
          'Une documentation, un wiki, un ticket, un fil — tout ce qui n’existe que rendu. L’extension lit ce que votre navigateur affiche déjà, donc une page que vous seul pouvez voir se convertit sans que personne ne confie un mot de passe : Confluence, Jira et Notion n’ont besoin ni d’administrateur, ni d’export, ni de jeton d’API.',
        ],
      },
      {
        heading: 'Deux façons de la garder ouverte',
        body: [
          'Le bouton ouvre un panneau compact par-dessus la page. Le panneau latéral est la même chose gardée ouverte à côté : il vous suit d’un onglet à l’autre et convertit chaque page à votre arrivée — ce que vous voulez quand vous parcourez une série de pages plutôt que d’en convertir une. Le menu contextuel convertit une sélection.',
        ],
      },
      {
        heading: 'Des fichiers aussi, sans les téléverser',
        body: [
          'Les dix conversions du site — Word, PDF, tableurs, HTML, CSV, JSON, EPUB et le reste — tournent dans l’extension. Rien n’est téléversé, rien n’exige de connexion, et plusieurs fichiers choisis ensemble deviennent un seul document, dans l’ordre où vous les avez choisis.',
        ],
      },
      {
        heading: 'Ce qu’elle ne fait pas',
        body: [
          'Les autorisations demandées sont le plus petit ensemble qui fasse le travail, et la plus large d’entre elles est facultative :',
        ],
        items: [
          'Déconnecté, elle ne nous parle pas du tout. La conversion a lieu dans la page, sur votre machine.',
          'Elle ne contient ni analytique, ni télémétrie, ni trace des pages que vous avez converties.',
          'Elle ne lit une page que lorsque vous pressez son bouton ou ouvrez le panneau latéral, et elle n’écrit jamais dans une page.',
          'Lire l’onglet courant s’accorde au moment où vous activez le panneau latéral ; le refuser vous coûte le panneau et rien d’autre.',
        ],
      },
      {
        heading: 'Avec un compte',
        body: [
          'Connectez-vous — le même compte que le site, un clic, aucune clé à coller — et Enregistrer place le document là où sont les autres. Partager publie un lien, ou nomme les personnes autorisées à le lire ; elles sont prévenues par e-mail et le lisent connectées sous leur propre identité.',
        ],
      },
      {
        heading: 'L’installer',
        body: [
          'Chrome la prend sur le Chrome Web Store, et les navigateurs bâtis sur Chromium aussi : Edge, Brave, Opera, Arc. À l’installation elle ne demande aucune autorisation de site — tant que vous ne connectez pas de compte, elle n’a aucune raison de nous parler — et le panneau latéral demande ce qu’il lui faut au moment où vous l’activez.',
          'Firefox la prend sur Mozilla Add-ons, sur le bureau comme sur Android. La même compilation, depuis la même source ; là où Chrome demande une permission pour son panneau latéral, Firefox accorde le sien par le manifeste, et elle ne demande donc rien du tout.',
        ],
      },
    ],
    seo: {
      title: 'Extension de navigateur — TransformPipe',
      description:
        'Convertissez en un clic la page où vous êtes en Markdown, ou un fichier de votre machine — dans votre navigateur, hors ligne et sans compte.',
    },
  },
  privacy: {
    label: 'Confidentialité',
    title: 'Confidentialité',
    lede: 'Ce qui est conservé, où, et ce qui n’est jamais collecté du tout.',
    sections: [
      {
        heading: 'Déconnecté, rien ne nous parvient',
        body: [
          'La conversion se fait dans votre navigateur. Le fichier est lu, converti et rendu sur votre propre machine, et rien n’en est envoyé à un serveur. L’historique que vous voyez est le stockage de votre navigateur, pas un compte.',
        ],
      },
      {
        heading: 'Connecté, ceci et rien de plus',
        body: [
          'Un compte existe pour que les documents puissent vous suivre d’un appareil à l’autre et être partagés. Il contient :',
        ],
        items: [
          'Votre identité, par l’intermédiaire de notre prestataire d’authentification : une adresse e-mail, un nom lorsqu’il en a été donné un, et un identifiant de compte. Une connexion avec Google les fait venir de Google ; une inscription avec une adresse et un mot de passe laisse ce mot de passe chez le prestataire d’authentification, sous forme de hachage. Dans les deux cas, nous ne voyons ni ne conservons jamais de mot de passe.',
          'Pour chaque document conservé : son nom, la conversion qui l’a produit, sa taille, le nombre de mots, de titres, de liens, de blocs de code, de tableaux et d’images, et sa date de création.',
          'Le Markdown lui-même, dans un stockage d’objets privé — privé signifiant qu’il n’a pas d’URL publique et n’est lu qu’au travers d’une requête que nous autorisons.',
          'Les clés API sous forme de hachages, jamais la clé. Une clé n’est affichée qu’une fois, à sa création, et ne peut plus être retrouvée ensuite — ni par vous, ni par nous.',
          'Les réglages de partage : si un document est privé, ouvert par lien, ou adressé à des adresses e-mail précises, et le jeton que porte un lien.',
        ],
      },
      {
        heading: 'L’extension de navigateur',
        body: [
          'L’extension convertit la page où vous êtes, dans cette page et sur votre propre machine. Elle ne lit une page qu’après une pression sur son bouton ou l’ouverture du panneau latéral, elle n’écrit jamais dans une page, et rien d’une page ne part où que ce soit avant que vous n’appuyiez sur Enregistrer ou Partager — déconnecté, elle ne nous parle pas du tout.',
        ],
        items: [
          'Rien n’est collecté de votre navigation. L’extension ne contient ni analytique, ni télémétrie, et nulle part la trace des pages que vous avez converties.',
          'Connecté, un jeton OAuth reste dans le stockage d’extension du navigateur — la même autorisation qui figure sur votre page de compte et s’y révoque. C’est le seul identifiant que l’extension détient, et aucun mot de passe ne s’y trouve.',
          'Un document converti passe du panneau à l’onglet qui l’affiche par le stockage de session, que le navigateur vide à la fermeture et n’écrit jamais sur le disque.',
          'La lecture de l’onglet où vous êtes est demandée au moment où vous activez le panneau latéral, car un panneau qui vous suit d’un onglet à l’autre ne peut pas redemander à chacun. Le bouton de la barre d’outils n’en a pas besoin : il lit le seul onglet sur lequel vous l’avez pressé.',
          'Enregistrer et Partager envoient ce seul document à votre compte, exactement comme l’application. Rien d’autre ne quitte le navigateur.',
        ],
      },
      {
        heading: 'Ce que nous ne faisons pas',
        body: [
          'Il n’y a ni publicité, ni pixel de suivi, et rien n’est vendu. Un seul script tiers se charge — Google Tag Manager — et il n’apporte Google Analytics que si vous l’avez autorisé dans la bannière cookies ; refusé ou sans réponse, les balises de Google n’écrivent rien dans votre navigateur. Rien n’est communiqué à personne en dehors de l’infrastructure qui fait tourner le service : la base de données, le stockage d’objets, le prestataire d’authentification, le prestataire d’e-mail et l’hébergeur.',
          'Vos documents ne sont pas lus par nous, et ils ne servent pas à entraîner quoi que ce soit.',
        ],
      },
      {
        heading: 'Les e-mails',
        body: [
          'Un e-mail part dans quatre cas et dans aucun autre : pour confirmer votre adresse, pour réinitialiser un mot de passe, pour vous accueillir une fois après votre inscription, et pour prévenir quelqu’un qu’un document a été partagé avec lui. Les deux premiers viennent du prestataire d’authentification, les deux autres du prestataire d’e-mail. Il n’y a pas de lettre d’information, et il n’y a rien à quoi se désabonner.',
          'Ce que reçoit le prestataire d’e-mail, c’est l’adresse du destinataire, celle de la personne qui partage lorsqu’il y en a une, et le message lui-même. Il ne reçoit jamais de document.',
        ],
      },
      {
        heading: 'Cookies et stockage du navigateur',
        body: [
          'Un seul cookie de session, posé par notre prestataire d’authentification quand vous vous connectez, propriétaire et HttpOnly. Un cookie de courte durée existe pendant l’aller-retour de connexion et expire au bout de dix minutes. C’est tout — il n’y a rien d’optionnel à désactiver. La page cookies donne le détail.',
          'Votre thème et, quand vous êtes déconnecté, votre historique vivent dans le stockage local de votre navigateur. Ils n’en sortent jamais.',
        ],
      },
      {
        heading: 'Supprimer des choses',
        body: [
          'Supprimer un document supprime la ligne et le Markdown conservé ensemble, tout de suite, pas selon un calendrier. Révoquer un partage abandonne le jeton, de sorte qu’un lien déjà envoyé cesse de fonctionner.',
          'Pour retirer un compte et tout ce qu’il contient, demandez-le — voir la page d’assistance. Atteindre une limite de stockage refuse l’écriture ; cela ne supprime jamais quelque chose que vous avez choisi de garder pour faire de la place.',
        ],
      },
      {
        heading: 'Enfants',
        body: [
          'C’est un outil de travail, pas un service pour les enfants, et il ne s’adresse à personne de moins de 16 ans.',
        ],
      },
      {
        heading: 'Modifications',
        body: [
          'Si cette page change d’une manière qui touche à ce qui est collecté, la date ci-dessus change avec elle.',
        ],
      },
    ],
    seo: {
      title: 'Confidentialité — TransformPipe',
      description:
        'Déconnecté, rien ne quitte le navigateur. Connecté, nous conservons le document, ses métadonnées et votre identité de compte — la mesure d’audience seulement si vous l’autorisez, aucun pixel de suivi, rien de vendu.',
    },
  },
  terms: {
    label: 'Conditions',
    title: 'Conditions d’utilisation',
    lede: 'La version courte, parce qu’une longue ne serait pas lue.',
    sections: [
      {
        heading: 'Utiliser le service',
        body: [
          'TransformPipe est proposé gratuitement, tel quel. Utilisez-le pour tout ce que vous avez le droit de convertir, depuis l’application, l’API, la ligne de commande ou un assistant.',
          'Un compte est à vous, à garder ou à supprimer. Vous êtes responsable de ce que vous faites avec une clé API, alors traitez-la comme un mot de passe : quiconque la détient peut lire et écrire vos documents.',
        ],
      },
      {
        heading: 'Vos documents restent les vôtres',
        body: [
          'Vous conservez tous les droits que vous aviez sur un document avant de le convertir. Nous ne revendiquons aucune propriété et aucune licence au-delà de ce qu’exige le fonctionnement du service : le conserver pour que vous puissiez le rouvrir, et le servir à qui vous l’avez délibérément partagé.',
        ],
      },
      {
        heading: 'Ce qu’il ne faut pas mettre ici',
        body: [
          'N’utilisez pas le service pour un contenu illégal, que vous n’avez pas le droit de diffuser, ou qui existe pour nuire à quelqu’un — logiciel malveillant, matériel d’exploitation sexuelle d’enfants, harcèlement ciblé. N’utilisez pas un lien de partage pour faire tourner une page d’hameçonnage.',
          'Les documents partagés peuvent être signalés par quiconque les ouvre. Un document qui enfreint cette section peut être dépublié ou supprimé, et un compte récidiviste fermé.',
        ],
      },
      {
        heading: 'Limites et disponibilité',
        body: [
          'Des limites de débit et de stockage s’appliquent et sont publiées dans la documentation. Elles existent pour garder le service debout, et peuvent changer.',
          'Il n’y a aucune promesse de disponibilité. Le service peut être interrompu, et des fonctions peuvent changer ou être retirées. Gardez votre propre copie de tout ce que vous ne pouvez pas perdre — le téléchargement existe exactement pour cela, et il n’a besoin de rien de notre part pour s’ouvrir.',
        ],
      },
      {
        heading: 'Aucune garantie, et la limite de ce que nous devons',
        body: [
          'Le service est fourni sans garantie d’aucune sorte, expresse ou implicite. Dans toute la mesure permise par la loi, Raudar Labs n’est pas responsable des pertes de données, des pertes de bénéfices, ni d’aucun préjudice indirect ou consécutif résultant de son utilisation.',
          'Rien ici ne limite un droit dont vous disposez et qui ne peut pas être limité par convention.',
        ],
      },
      {
        heading: 'Modifications et fin',
        body: [
          'Ces conditions peuvent changer ; la date ci-dessus dit quand elles l’ont fait pour la dernière fois, et continuer à utiliser le service est la manière de les accepter. Vous pouvez arrêter à tout moment en supprimant vos documents et votre compte.',
        ],
      },
    ],
    seo: {
      title: 'Conditions d’utilisation — TransformPipe',
      description:
        'TransformPipe est gratuit et fourni tel quel. Vos documents restent les vôtres, les limites sont publiées, et il n’y a aucune garantie.',
    },
  },
  cookies: {
    label: 'Cookies',
    title: 'Cookies',
    lede: 'Deux sont nécessaires pour se connecter. Une chose est facultative — la mesure d’audience — et elle reste désactivée tant que vous ne l’autorisez pas.',
    sections: [
      {
        heading: 'La seule chose que vous choisissez',
        body: [
          'La plupart des pages cookies existent pour vous laisser refuser la mesure d’audience et la publicité. Ici, il n’y a aucune publicité. La mesure d’audience, c’est Google Analytics chargé via Google Tag Manager, et c’est le seul interrupteur du site : la bannière pose la question à la première visite, le bouton au bas de cette page rouvre la réponse, et tant que vous n’autorisez rien les balises de Google n’écrivent rien dans votre navigateur et envoient tout au plus des pings sans cookie.',
          'Déconnecté, et avec la mesure d’audience refusée ou sans réponse, ce site ne pose aucun cookie.',
        ],
      },
      {
        heading: 'Les deux qui existent',
        body: [
          'Tous deux sont posés par notre prestataire d’authentification, sont propriétaires, et sont marqués HttpOnly et Secure — le script de la page ne peut pas les lire :',
        ],
        items: [
          '__Secure-neon-auth.session_token — vous garde connecté. Sans lui, chaque chargement de page redemanderait la connexion. Il disparaît quand vous vous déconnectez.',
          '__Secure-neon-auth.session_challenge — existe pendant les dix minutes de l’aller-retour de connexion, pour que la réponse de Google puisse être rapprochée de la requête qui l’a lancée. C’est ce qui empêche la connexion de quelqu’un d’autre d’atterrir dans votre session.',
        ],
      },
      {
        heading: 'Le stockage du navigateur, qui n’est pas un cookie',
        body: [
          'Deux choses vivent dans le stockage local de votre navigateur et ne sont jamais envoyées où que ce soit : le thème que vous avez choisi et — quand vous êtes déconnecté — vos conversions récentes, pour que l’historique ait quelque chose dedans. Effacer les données du site dans votre navigateur retire les deux, et l’application continue sans elles.',
        ],
      },
      {
        heading: 'Si cela change',
        body: [
          'Si quelque chose d’optionnel est un jour ajouté, cette page reçoit un vrai réglage avant qu’il soit posé, pas après. La date ci-dessus dira quand.',
        ],
      },
    ],
    seo: {
      title: 'Cookies — TransformPipe',
      description:
        'Deux cookies de session propriétaires, tous deux nécessaires pour se connecter. Aucune mesure d’audience, aucune publicité, rien d’optionnel à configurer.',
    },
  },

  /*
   * Les pages pratiques : une par extension que la zone de dépôt accepte.
   *
   * Elles répondent au lieu d’argumenter, et c’est ce qui les sépare du blog. Quelqu’un a un fichier
   * et aucune idée de ce qui l’ouvre ; il a cherché l’extension ; il veut la réponse dans le premier
   * paragraphe et, en bas, une sortie de secours. Donc : ce qu’est la chose, ce qui l’ouvre sur
   * chaque genre de machine, ce qui coince, et la conversion qui met fin à la question.
   */
  'how-to-md': {
    label: 'Ouvrir un fichier .md',
    title: 'Comment ouvrir un fichier .md',
    lede: 'Un fichier Markdown est du texte brut. Tout ce qui ouvre du texte l’ouvre — la question est de savoir ce qui lui donne l’allure d’un document.',
    sections: [
      {
        heading: 'Ce que c’est',
        body: [
          'Un fichier `.md` est un fichier texte avec quelques conventions dedans : un dièse pour un titre, des astérisques pour la mise en valeur, des tirets pour une liste. Rien dans le fichier n’est binaire et rien n’est compressé, donc un éditeur de texte vous en montre immédiatement toute la vérité.',
          'C’est aussi pour cela qu’il a l’air inachevé. Les conventions sont des instructions destinées à un moteur de rendu, et tant que rien ne les rend, vous lisez les instructions plutôt que le document.',
        ],
      },
      {
        heading: 'Sur un ordinateur',
        body: [
          'Sous Windows, Notepad l’ouvre et affiche le texte brut. Sur un Mac, TextEdit fait de même, même s’il peut d’abord proposer de convertir le fichier — refusez, et il reste brut. Sur les deux, VS Code affiche un aperçu en direct à côté de la source, et c’est ce qui ressemble le plus à la page finie sans quitter votre éditeur.',
          'Faire glisser le fichier sur une fenêtre de navigateur ne fonctionne pas comme on l’imagine : le navigateur affiche le texte brut ou propose de le télécharger, parce qu’aucun navigateur ne rend le Markdown de lui-même.',
        ],
      },
      {
        heading: 'Sur un téléphone',
        body: [
          'La plupart des téléphones n’ont aucun lecteur Markdown installé et proposeront d’ouvrir le fichier dans une application de notes ou de fichiers, qui affiche le texte tel qu’il est écrit. Sous iOS, Fichiers en donne un aperçu en texte brut ; sous Android, le comportement dépend de l’éditeur de texte installé.',
          'Le convertir d’abord en HTML va généralement plus vite que de chercher un lecteur, parce que chaque téléphone a déjà un navigateur et que chaque navigateur ouvre le HTML.',
        ],
      },
      {
        heading: 'Ce qui coince le plus souvent',
        body: [
          'Un fichier enregistré sous le nom `notes.md.txt` par un éditeur de texte qui a ajouté sa propre extension ne sera reconnu par rien de ce qui cherche du Markdown. Renommez-le et le problème disparaît.',
          'Les tableaux, les notes de bas de page et les listes de tâches ne figurent pas dans la spécification Markdown d’origine : un lecteur qui affiche littéralement les barres verticales et les crochets n’est donc pas cassé — il met en œuvre le cœur et pas les extensions.',
        ],
      },
    ],
    action: 'Convertir un fichier .md en HTML',
    seo: {
      title: 'Comment ouvrir un fichier .md — TransformPipe',
      description:
        'Ce qu’est un fichier Markdown, ce qui l’ouvre sous Windows, macOS et au téléphone, pourquoi le navigateur affiche du texte brut, et comment en faire une page.',
    },
  },
  'how-to-html': {
    label: 'Ouvrir un fichier .html',
    title: 'Comment ouvrir un fichier .html',
    lede: 'Tous les navigateurs l’ouvrent. La question intéressante est de savoir quoi faire quand on veut en tirer les mots plutôt que la page.',
    sections: [
      {
        heading: 'Ce que c’est',
        body: [
          'Un fichier `.html` est la page elle-même : le texte, et le balisage qui dit quelle partie est un titre, un lien, un tableau. Il peut aussi renvoyer à des styles, des images et des scripts qui vivent ailleurs, et c’est pourquoi une page enregistrée s’ouvre parfois en n’ayant l’air de rien.',
        ],
      },
      {
        heading: 'L’ouvrir',
        body: [
          'Un double-clic l’ouvre dans votre navigateur par défaut sur tous les systèmes de bureau. Si elle s’ouvre plutôt dans un éditeur, faites un clic droit, choisissez « Ouvrir avec », puis un navigateur.',
          'Sur un téléphone, un gestionnaire de fichiers la passe généralement au navigateur. S’il refuse, s’envoyer le fichier par e-mail et ouvrir la pièce jointe fonctionne normalement, parce que les logiciels de messagerie confient le HTML à une vue web.',
        ],
      },
      {
        heading: 'Quand elle s’ouvre vide ou sans mise en forme',
        body: [
          'Une page enregistrée avec « Enregistrer sous, Page web, complète » garde ses styles et ses images dans un dossier à côté du fichier. Déplacez le fichier sans le dossier et la page perd tout sauf son texte.',
          'Une page enregistrée en un seul fichier garde tout à l’intérieur et s’ouvre partout de la même façon. C’est pourquoi un export qui vaut la peine d’être gardé est un export autonome.',
        ],
      },
      {
        heading: 'En sortir le texte',
        body: [
          'Copier depuis le navigateur vous donne les mots et perd la structure : les titres deviennent des lignes ordinaires, les tableaux des suites de texte. Convertir le fichier en Markdown garde la structure sous une forme qui se lit et se modifie, ce qui est généralement ce que l’on voulait vraiment.',
        ],
      },
    ],
    action: 'Convertir un fichier .html en Markdown',
    seo: {
      title: 'Comment ouvrir un fichier .html — TransformPipe',
      description:
        'Comment ouvrir un fichier HTML sur un ordinateur ou un téléphone, pourquoi une page enregistrée perd sa mise en forme, et comment en tirer le texte structuré.',
    },
  },
  'how-to-docx': {
    label: 'Ouvrir un fichier .docx',
    title: 'Comment ouvrir un fichier .docx',
    lede: 'Un .docx est une archive zip de XML. Word l’ouvre, et plusieurs outils gratuits aussi.',
    sections: [
      {
        heading: 'Ce que c’est',
        body: [
          'Un `.docx` n’est pas un document unique mais un dossier compressé : renommez-le en `.zip` et vous pourrez l’ouvrir pour y trouver le texte, les styles et les images sous forme de fichiers séparés. C’est cela, le format, et c’est pourquoi un `.docx` ne se lit pas utilement dans un éditeur de texte.',
        ],
      },
      {
        heading: 'Sans acheter Word',
        body: [
          'Google Docs ouvre un `.docx` en le téléversant dans Drive, LibreOffice Writer l’ouvre sur n’importe quel système de bureau et est gratuit, et Apple Pages comme la version web de Word de Microsoft en ouvrent un sans licence payante.',
          'Sur un téléphone, l’application Word ouvre les fichiers `.docx` en lecture sans abonnement ; c’est à la modification que commence le péage.',
        ],
      },
      {
        heading: 'Quand il refuse de s’ouvrir',
        body: [
          'Un fichier qui arrive sous le nom `document.docx` mais que rien n’ouvre est souvent un `.doc` — l’ancien format — avec la mauvaise extension, ou un fichier dont le téléchargement n’est pas allé au bout. Regardez d’abord la taille : un téléchargement interrompu est en général manifestement trop petit.',
          'Un `.docx` protégé par mot de passe ouvre la boîte de dialogue et rien d’autre. Aucun convertisseur ne passe outre, ce qui est une propriété du fichier plutôt qu’une limite de l’outil.',
        ],
      },
      {
        heading: 'Garder les mots, laisser la mise en page',
        body: [
          'Convertir en Markdown garde les titres, les listes, les liens et les tableaux, et jette les polices, les marges et les sauts de page. Pour du texte qui doit vivre dans un dépôt, un wiki ou un diff, ce troc est le but plutôt qu’une perte.',
        ],
      },
    ],
    action: 'Convertir un fichier .docx en Markdown',
    seo: {
      title: 'Comment ouvrir un fichier .docx — TransformPipe',
      description:
        'Ce qu’est vraiment un .docx, comment en ouvrir un sans acheter Word, que faire quand il refuse de s’ouvrir, et comment garder le texte sans la mise en page.',
    },
  },
  'how-to-csv': {
    label: 'Ouvrir un fichier .csv',
    title: 'Comment ouvrir un fichier .csv',
    lede: 'Un tableur l’ouvre, un éditeur de texte vous montre ce qu’il contient vraiment, et la différence compte plus qu’il n’y paraît.',
    sections: [
      {
        heading: 'Ce que c’est',
        body: [
          'Un `.csv`, ce sont des lignes de texte avec un séparateur entre les champs — le plus souvent une virgule, parfois un point-virgule ou une tabulation. Il n’y a ni types, ni formules, ni mise en forme : chaque valeur est une chaîne de caractères, et tout ce qui ressemble à une date ou à un nombre est une supposition de votre logiciel.',
        ],
      },
      {
        heading: 'L’ouvrir',
        body: [
          'Un double-clic l’ouvre dans Excel ou Numbers sur la plupart des machines, et dans LibreOffice Calc si celui-ci est installé. Google Sheets en importe un par « Fichier, Importer ».',
          'L’ouvrir d’abord dans un éditeur de texte vaut les dix secondes que cela prend : il montre le vrai séparateur, si la première ligne est un en-tête, et si les champs sont entre guillemets — trois choses qu’un tableur décide pour vous en silence.',
        ],
      },
      {
        heading: 'Quand les colonnes sortent de travers',
        body: [
          'Tout qui atterrit dans une seule colonne veut dire que le séparateur de votre fichier n’est pas celui qu’attendait votre tableur. Dans Excel, passez par « Données, À partir d’un fichier texte/CSV » plutôt que par le double-clic, et fixez le délimiteur vous-même.',
          'Des caractères accentués qui sortent en charabia sont un décalage d’encodage : le fichier est en UTF-8 et le programme a supposé autre chose. La même boîte de dialogue d’importation vous laisse le dire.',
          'Les zéros de tête qui disparaissent des codes postaux ou des références ne se récupèrent pas après coup — le tableur a converti la valeur en nombre à l’ouverture. Importez plutôt la colonne comme du texte.',
        ],
      },
      {
        heading: 'Le mettre dans un document',
        body: [
          'Coller une plage de tableur dans un document vous donne soit une image de tableau, soit un désordre, selon l’endroit où vous collez. Convertir le fichier en tableau Markdown vous donne des lignes qui survivent à une copie, à un diff et à une pull request.',
        ],
      },
    ],
    action: 'Convertir un fichier .csv en tableau Markdown',
    seo: {
      title: 'Comment ouvrir un fichier .csv — TransformPipe',
      description:
        'Comment ouvrir un CSV, pourquoi les colonnes se replient parfois en une seule, ce qui casse les zéros de tête et les accents, et comment en faire un tableau.',
    },
  },
  'how-to-json': {
    label: 'Ouvrir un fichier .json',
    title: 'Comment ouvrir un fichier .json',
    lede: 'C’est du texte, donc tout l’ouvre. C’est le lire qui demande de l’aide.',
    sections: [
      {
        heading: 'Ce que c’est',
        body: [
          'Un fichier `.json` contient des données structurées : des objets aux champs nommés, des listes, des nombres et des chaînes de caractères. C’est le format dans lequel une API répond et celui vers lequel la plupart des applications exportent leurs réglages, ce qui explique qu’il en apparaisse un dans un dossier de téléchargements sans explication.',
        ],
      },
      {
        heading: 'L’ouvrir',
        body: [
          'Le faire glisser dans une fenêtre de navigateur marche bien : Firefox et Chrome affichent tous deux une vue repliable où l’on peut chercher, plutôt que du texte brut. VS Code l’ouvre avec le repliement et reformate d’une seule commande un fichier tenant sur une ligne.',
          'Un très gros export — des dizaines de mégaoctets — met un éditeur en difficulté. Un outil en ligne de commande comme `jq` lit ceux-là sans charger tout le fichier dans une fenêtre.',
        ],
      },
      {
        heading: 'Quand il refuse d’être analysé',
        body: [
          'Les trois fautes habituelles sont une virgule en trop après le dernier élément, des guillemets simples là où le format en exige des doubles, et un commentaire — le JSON n’a pas de commentaires, quoi qu’ait pu contenir le fichier d’où il vient.',
          'Une erreur qui nomme une ligne et une colonne mérite qu’on lui fasse confiance : l’analyseur s’est arrêté exactement là, et la faute est généralement un caractère plus tôt.',
        ],
      },
      {
        heading: 'Le rendre lisible par une personne',
        body: [
          'Une vue repliable sert à inspecter des données. Quand il s’agit de les montrer à quelqu’un, convertir en Markdown transforme une liste d’enregistrements en tableau et les objets imbriqués en sections avec titres — la même information, dans une forme qui survit à un collage dans un document.',
        ],
      },
    ],
    action: 'Convertir un fichier .json en Markdown',
    seo: {
      title: 'Comment ouvrir un fichier .json — TransformPipe',
      description:
        'Comment ouvrir et lire un fichier JSON dans un navigateur ou un éditeur, les trois choses qui cassent habituellement l’analyse, et comment le rendre lisible.',
    },
  },
  'how-to-txt': {
    label: 'Ouvrir un fichier .txt',
    title: 'Comment ouvrir un fichier .txt',
    lede: 'Rien ne s’ouvre plus facilement. Les ennuis commencent quand le texte a été écrit sur un autre genre de machine.',
    sections: [
      {
        heading: 'Ce que c’est',
        body: [
          'Un fichier `.txt`, ce sont des caractères et des retours à la ligne, sans rien qui décrive de quoi tout cela devrait avoir l’air. C’est sa vertu : il s’ouvre sur tous les systèmes jamais construits et s’ouvrira encore dans trente ans.',
        ],
      },
      {
        heading: 'L’ouvrir',
        body: [
          'Chaque système d’exploitation a un éditeur qui l’ouvre d’un double-clic — Notepad, TextEdit, gedit. Un navigateur en ouvre un déposé sur sa fenêtre. Un téléphone en donne un aperçu dans son application de fichiers.',
        ],
      },
      {
        heading: 'Quand il s’ouvre sur une seule longue ligne, ou en carrés',
        body: [
          'Le texte écrit sous Windows termine ses lignes par deux caractères et le texte écrit sous Unix par un seul. Les éditeurs anciens qui attendent l’autre convention affichent le fichier comme une seule ligne interminable, ou dessinent un petit carré à chaque retour. N’importe quel éditeur moderne gère les deux ; Notepad depuis 2018.',
          'Des caractères absurdes là où devraient se trouver des accents ou des guillemets sont un décalage d’encodage — le fichier est en UTF-8 et l’éditeur a deviné un ancien encodage sur un octet. La plupart des éditeurs permettent de rouvrir avec un encodage que vous nommez.',
        ],
      },
      {
        heading: 'Quand il doit devenir un document',
        body: [
          'Traiter du texte brut comme du Markdown a l’air de fonctionner jusqu’à ce qu’une ligne commençant par un tiret devienne une puce, qu’un astérisque au milieu d’une phrase mette la moitié d’un paragraphe en italique, et qu’une année en début de ligne devienne une liste numérotée. Le convertir correctement échappe d’abord ces caractères, pour que ce que disait le fichier soit ce que dit la page.',
        ],
      },
    ],
    action: 'Convertir un fichier .txt en Markdown',
    seo: {
      title: 'Comment ouvrir un fichier .txt — TransformPipe',
      description:
        'Comment ouvrir un fichier texte partout, pourquoi il s’affiche parfois sur une seule ligne ou en carrés, et comment en faire un document sans formatage ajouté.',
    },
  },
  'how-to-xlsx': {
    label: 'Ouvrir un fichier .xlsx',
    title: 'Comment ouvrir un fichier .xlsx',
    lede: 'Excel n’est pas le seul à en ouvrir un, et pour lire une feuille il est rarement le plus rapide.',
    sections: [
      {
        heading: 'Ce que c’est',
        body: [
          'Un `.xlsx` est une archive zip de XML, la même construction qu’un `.docx` : les feuilles, les styles et les chaînes partagées sous forme de fichiers séparés dans un même dossier compressé. Il porte des types, des formules, de la mise en forme et plusieurs feuilles à la fois, c’est-à-dire tout ce qu’un CSV ne peut pas.',
        ],
      },
      {
        heading: 'Sans acheter Excel',
        body: [
          'Google Sheets en importe un par « Fichier, Importer ». LibreOffice Calc l’ouvre sur n’importe quel système de bureau et est gratuit. Apple Numbers en ouvre un sur un Mac, et la version web d’Excel de Microsoft en lit un sans licence payante.',
        ],
      },
      {
        heading: 'Ce qu’il faut vérifier avant de croire les chiffres',
        body: [
          'Une cellule qui affiche `####` est une colonne trop étroite pour afficher la valeur, pas un fichier cassé. Une date qui se lit comme un nombre à cinq chiffres est la valeur de série sous-jacente, dont la mise en forme s’est perdue.',
          'Les formules sont conservées à côté de leur dernier résultat calculé. Un fichier ouvert dans quelque chose qui ne les évalue pas affiche ces résultats, qui sont justes au moment du dernier enregistrement et pas nécessairement maintenant.',
        ],
      },
      {
        heading: 'Faire entrer une feuille dans un document',
        body: [
          'Le chemin habituel consiste à exporter chaque feuille en CSV et à convertir cela, ce qui perd tout sauf la feuille active. Convertir directement le classeur vous donne un tableau Markdown par feuille, avec une table des matières lorsqu’il y en a plus d’une.',
        ],
      },
    ],
    action: 'Convertir un fichier .xlsx en tableaux Markdown',
    seo: {
      title: 'Comment ouvrir un fichier .xlsx — TransformPipe',
      description:
        'Comment ouvrir un classeur Excel sans acheter Excel, ce que veulent dire #### et les dates à cinq chiffres, et comment en tirer un tableau Markdown par feuille.',
    },
  },
  'how-to-pptx': {
    label: 'Ouvrir un fichier .pptx',
    title: 'Comment ouvrir un fichier .pptx',
    lede: 'L’ouvrir est simple. Le lire sans avoir assisté à la présentation est la partie où rien n’aide.',
    sections: [
      {
        heading: 'Ce que c’est',
        body: [
          'Un `.pptx` est une archive zip de XML, construite comme un `.docx` ou un `.xlsx` : un fichier par diapositive, un par page de notes, et les images à côté. L’ancien `.ppt` est tout autre chose — un format binaire d’avant 2007, que la plupart des logiciels ouvrant un `.pptx` savent aussi convertir.',
        ],
      },
      {
        heading: 'Sans acheter PowerPoint',
        body: [
          'Google Slides l’importe via Fichier, Ouvrir. LibreOffice Impress l’ouvre sur n’importe quel système de bureau et est gratuit. Keynote l’ouvre sur un Mac, et la version web de PowerPoint le lit sans licence payante.',
          'Sur un Mac, appuyer sur la barre d’espace dans le Finder affiche toutes les diapositives sans rien ouvrir du tout.',
        ],
      },
      {
        heading: 'Où sont les notes du présentateur',
        body: [
          'Sous la diapositive, dans un volet que la plupart des logiciels masquent par défaut : Affichage, puis Notes, dans PowerPoint comme dans Google Slides. C’est là que le raisonnement est écrit en phrases complètes, la diapositive au-dessus n’en étant que le résumé lu à voix haute.',
          'L’export en PDF les supprime, sauf à choisir la mise en page avec pages de notes — d’où le fait qu’un diaporama transmis en PDF ait si souvent perdu la moitié qui l’expliquait.',
        ],
      },
      {
        heading: 'Du diaporama au document',
        body: [
          'La méthode habituelle consiste à recopier le texte de chaque diapositive à la main, ce qui perd les notes puisqu’elles ne sont pas à l’écran pendant l’opération. Convertir le fichier directement donne une section par diapositive, dans l’ordre de présentation, puces, tableaux et notes toujours rattachés à la diapositive dont ils viennent.',
        ],
      },
    ],
    action: 'Convertir un .pptx en Markdown',
    seo: {
      title: 'Comment ouvrir un fichier .pptx — TransformPipe',
      description:
        'Comment ouvrir un fichier PowerPoint sans PowerPoint, où se cachent les notes du présentateur, et comment transformer tout un diaporama en document lisible.',
    },
  },
  'how-to-epub': {
    label: 'Ouvrir un fichier .epub',
    title: 'Comment ouvrir un fichier .epub',
    lede: 'Toutes les liseuses l’ouvrent. C’est en extraire le texte qui devient pénible.',
    sections: [
      {
        heading: 'Ce que c’est',
        body: [
          'Un `.epub` est une archive zip de XHTML — une page web par chapitre, une feuille de style, les images, et un fichier de paquet qui les énumère et fixe l’ordre de lecture. C’est le format ouvert sur lequel toute l’industrie s’est accordée ; les `.azw3` et `.mobi` du Kindle sont l’exception, pas la norme.',
        ],
      },
      {
        heading: 'Pour le lire',
        body: [
          'Apple Books l’ouvre sur Mac, iPhone et iPad, et Microsoft Edge l’ouvre sous Windows sans rien installer. Calibre est le lecteur de bureau gratuit qui convertit aussi entre formats, et Thorium celui à choisir pour un système de lecture qui suit la spécification de près.',
          'Une Kindle ne lit pas l’`.epub` directement, mais le service « Envoyer vers Kindle » d’Amazon l’accepte et le convertit au passage.',
        ],
      },
      {
        heading: 'Pourquoi le renommer en .zip marche presque',
        body: [
          'Parce que c’en est un. Décompressez un `.epub` et chaque chapitre est là, ouvrable dans un navigateur. Ce que vous n’aurez pas, c’est l’ordre : les fichiers s’appellent souvent `index_split_030.xhtml`, `index_split_002.xhtml`, et ces numéros ne sont que ce que l’outil de fabrication a écrit. L’ordre de lecture est dans la spine du fichier de paquet, et nulle part ailleurs.',
        ],
      },
      {
        heading: 'Du livre au document',
        body: [
          'Le convertir directement donne un document Markdown : les chapitres dans l’ordre de la spine, sous les titres du sommaire du livre, les images portées dans le fichier, et les renvois d’un chapitre à l’autre réduits à leurs mots, faute de destination dans un document fusionné.',
        ],
      },
    ],
    action: 'Convertir un .epub en Markdown',
    seo: {
      title: 'Comment ouvrir un fichier .epub — TransformPipe',
      description:
        'Comment ouvrir un EPUB sur n’importe quel appareil, pourquoi le décompresser fait perdre l’ordre des chapitres, et comment transformer un livre en document.',
    },
  },
  'how-to-odt': {
    label: 'Ouvrir un fichier .odt',
    title: 'Comment ouvrir un fichier .odt',
    lede: 'C’est la norme internationale du document de traitement de texte — et Word l’ouvre aussi.',
    sections: [
      {
        heading: 'Ce que c’est',
        body: [
          'Un `.odt` est une archive zip de XML — `content.xml` pour les mots, `styles.xml` pour leur apparence, un dossier `Pictures` — et c’est OpenDocument Text, une norme ISO et non le format d’une seule entreprise. LibreOffice et OpenOffice l’écrivent par défaut, et Google Docs le rend via Fichier, Télécharger.',
        ],
      },
      {
        heading: 'Pour l’ouvrir',
        body: [
          'LibreOffice est la réponse évidente et il est gratuit sur tous les systèmes de bureau. Microsoft Word ouvre et enregistre les `.odt` depuis 2007, Word en ligne aussi ; Google Docs l’importe via Fichier, Ouvrir. Apple Pages l’ouvre également, mais voudra le réenregistrer autrement.',
          'S’il s’agit seulement de le lire, l’archive vous est ouverte : décompressez-la et `content.xml` est le document, balises comprises.',
        ],
      },
      {
        heading: 'Ce qui tourne mal en général',
        body: [
          'L’aller-retour par Word. Un `.odt` ouvert dans Word puis réenregistré garde ses mots et perd une partie de sa mise en forme, faute d’accord entre les deux logiciels sur ce que signifie chaque style — ce qui ne pose problème que si quelqu’un le rouvre ensuite dans LibreOffice.',
          'Les polices, comme pour tout format de document. Un fichier qui nomme une police absente de votre machine est composé avec ce que le lecteur substitue, et un nombre de pages qui comptait cesse d’être le même.',
        ],
      },
      {
        heading: 'Du document au Markdown',
        body: [
          'C’est le format qui se convertit le plus fidèlement, parce qu’il dit ce que les choses sont plutôt que de quoi elles ont l’air : un titre connaît son niveau, une liste son imbrication, un tableau est un tableau et une note une note. La conversion garde tout cela, images portées dans le fichier.',
        ],
      },
    ],
    action: 'Convertir un .odt en Markdown',
    seo: {
      title: 'Comment ouvrir un fichier .odt — TransformPipe',
      description:
        'Comment ouvrir un fichier OpenDocument, quels logiciels le lisent hormis LibreOffice, ce que coûte un aller-retour par Word, et comment en faire du Markdown.',
    },
  },
  'how-to-rtf': {
    label: 'Ouvrir un fichier .rtf',
    title: 'Comment ouvrir un fichier .rtf',
    lede: 'Tout l’ouvre. C’est précisément sa raison d’être, et la raison pour laquelle il existe encore.',
    sections: [
      {
        heading: 'Ce que c’est',
        body: [
          'Le Rich Text Format est du texte brut avec des instructions dedans : `{\\rtf1` au début, puis des mots de contrôle comme `\\b` pour le gras et `\\par` pour un nouveau paragraphe, jusqu’au bout. Microsoft l’a publié en 1987 et a cessé de le faire évoluer en 2008 — c’est exactement pour cela que tout traitement de texte écrit depuis sait le lire.',
        ],
      },
      {
        heading: 'Pour l’ouvrir',
        body: [
          'TextEdit sur Mac et WordPad sous Windows l’ouvrent sans rien installer, comme Word, LibreOffice, Google Docs et Pages. Sur un Mac, la barre d’espace dans le Finder l’affiche.',
          'Il se lit aussi tel quel : ouvrez-le dans un éditeur de texte et les mots sont là entre les mots de contrôle, ce qu’on ne peut pas dire d’un `.docx`.',
        ],
      },
      {
        heading: 'Pourquoi il arrive si souvent',
        body: [
          'Parce que c’est ce qu’un Mac produit quand du texte quitte une application. Faites glisser une sélection d’une fenêtre à une autre et macOS transmet du RTF ; il en va de même pour une grande partie des copier-coller entre logiciels, et pour tout ce qu’a exporté un système plus ancien soucieux de garder le gras et l’italique sans s’engager sur un format.',
          'Il ne porte presque aucune métadonnée et aucune macro, ce qui en fait aussi l’option prudente pour envoyer un document à l’extérieur.',
        ],
      },
      {
        heading: 'Et en Markdown',
        body: [
          'Gras, italique, barré, liens, listes et tableaux se convertissent. Les titres sont la seule chose sur laquelle le format reste vague : Word écrit un niveau de plan et le pense, un Mac n’écrit rien d’autre qu’une ligne grasse plus grande — on prend donc le niveau de plan là où il existe, et sinon un paragraphe gras composé plus grand que le corps du texte.',
        ],
      },
    ],
    action: 'Convertir un .rtf en Markdown',
    seo: {
      title: 'Comment ouvrir un fichier .rtf — TransformPipe',
      description:
        'Comment ouvrir un fichier de texte enrichi, pourquoi un Mac en produit dès qu’on déplace du texte, ce qu’il contient, et comment en faire du Markdown.',
    },
  },
  'how-to-enex': {
    label: 'Ouvrir un fichier .enex',
    title: 'Comment ouvrir un fichier .enex',
    lede: 'C’est la seule sortie des notes d’Evernote, et presque rien ne l’ouvre directement.',
    sections: [
      {
        heading: 'Ce que c’est',
        body: [
          'Un `.enex` est un seul fichier XML contenant toutes les notes exportées : le titre, les étiquettes, les dates, et la note elle-même en ENML — la variante restreinte de XHTML propre à Evernote — enchâssée dans le XML. Les pièces jointes voyagent dans le même fichier, encodées en base64, reliées à la note par l’empreinte MD5 de leur contenu et non par un nom.',
        ],
      },
      {
        heading: 'Comment en obtenir un',
        body: [
          'Sélectionnez les notes, ou un carnet entier, puis Fichier, Exporter les notes. L’application de bureau écrit du `.enex` ; la version web ne propose aucun export, c’est donc une opération de bureau uniquement.',
          'Exportez un carnet à la fois plutôt que tout d’un coup. Un fichier unique de dix mille notes, c’est une chose qui peut mal tourner au lieu de vingt.',
        ],
      },
      {
        heading: 'Ce qui le lit',
        body: [
          'Le greffon Importer d’Obsidian, l’import de Notion, Notes d’Apple, Joplin et Bear acceptent tous le `.enex` — parce que c’est le format pour lequel tout le monde a écrit un importateur quand les tarifs d’Evernote ont changé. Ce qui ne le lit pas, c’est un éditeur de texte : ouvrez-le et vous avez du XML avec vos notes en base64 et en CDATA.',
        ],
      },
      {
        heading: 'Ce qu’il faut vérifier après un import',
        body: [
          'Les étiquettes d’abord. C’est l’organisation même d’une bibliothèque Evernote, et plusieurs importateurs les laissent tomber — dix mille notes deviennent alors un tas et non une bibliothèque.',
          'Puis les pièces jointes. Une note qui contenait un PDF ou une photographie devrait encore le dire ; le format relie les deux par une empreinte et non par un nom de fichier, et c’est précisément là qu’un importateur ayant pris un raccourci se trahit.',
        ],
      },
    ],
    action: 'Convertir un .enex en Markdown',
    seo: {
      title: 'Comment ouvrir un fichier .enex — TransformPipe',
      description:
        'Comment exporter un .enex depuis Evernote, ce qu’il contient, quelles applications l’importent, et quoi vérifier ensuite — étiquettes et pièces jointes avant tout.',
    },
  },
  'how-to-zip': {
    label: 'Ouvrir un export .zip',
    title: 'Comment ouvrir un export .zip de Notion, Confluence ou Obsidian',
    lede: 'Le dézipper est la moitié facile. Ce qu’il y a dedans est un dossier de fichiers qui pointent tous les uns vers les autres.',
    sections: [
      {
        heading: 'Ce qu’il y a dedans',
        body: [
          'Un export Notion, c’est un fichier Markdown par page avec un long identifiant ajouté à chaque nom de fichier, plus un CSV par base de données. Un export d’espace Confluence, c’est un fichier HTML par page avec ses pièces jointes à côté. Un coffre Obsidian est déjà du Markdown, dans les dossiers que vous avez faits.',
          'Tous les trois se décompressent avec les outils déjà présents sur votre machine : un double-clic sous Windows ou macOS, `unzip` dans un terminal.',
        ],
      },
      {
        heading: 'Pourquoi les liens sont cassés',
        body: [
          'Notion écrit ses liens en fonction du nom de fichier exact qu’il a généré, identifiant compris. Renommez les fichiers pour quelque chose de lisible et tous les liens entre les pages cessent de fonctionner, ce qui est la manière la plus courante de rater une migration.',
          'Les liens de Confluence pointent vers ses propres ids de page, et les pièces jointes vers une URL de téléchargement qui attend que vous soyez connecté. Obsidian utilise des `[[wikilinks]]`, que seule son application résout.',
        ],
      },
      {
        heading: 'Le lire sans le réparer',
        body: [
          'Ouvrir cent fichiers un par un pour découvrir ce que contenait un espace de travail est un travail de la mauvaise forme. Fusionner l’export en un seul document — chaque page dans l’ordre, avec une table des matières — vous donne quelque chose qui se lit d’une traite, ce qui est généralement à cela que sert un export archivé.',
        ],
      },
      {
        heading: 'Quand il vous faut vraiment les fichiers séparés',
        body: [
          'Si les pages doivent rester des fichiers séparés avec des liens qui fonctionnent, le renommage et la réécriture des liens doivent se faire ensemble, à partir d’une seule table des anciens noms vers les nouveaux. Les faire en deux passes laisse un dossier de documents qui pointent tous vers des noms qui n’existent plus.',
        ],
      },
    ],
    action: 'Convertir un export .zip en Markdown',
    seo: {
      title: 'Comment ouvrir un export .zip de Notion ou Confluence — TransformPipe',
      description:
        'Ce que contient un export Notion, Confluence ou Obsidian, pourquoi les liens entre les pages se cassent, et comment lire l’ensemble comme un seul document.',
    },
  },
  'how-to-assistant': {
    label: 'Partager depuis un assistant',
    title: 'Comment convertir et partager un document depuis un assistant IA',
    lede: 'Un assistant écrit du Markdown à longueur de journée et ne sait pas vous remettre une page. Connecter celui-ci lui permet de faire les deux, sans que personne ne recopie du texte d’un onglet à l’autre.',
    sections: [
      {
        heading: 'Ce qu’est un connecteur',
        body: [
          'TransformPipe fait tourner un serveur MCP à l’adresse `/api/mcp`. MCP est le protocole par lequel les assistants appellent des outils : ajouter cette adresse comme connecteur donne donc à l’assistant une série de verbes qu’il peut employer en votre nom — convertir ceci, l’enregistrer, le partager, lister ce qui est là.',
          'Il n’y a aucune clé à coller. Ajouter le connecteur vous fait passer par une connexion ordinaire, et l’assistant reçoit l’accès à ce compte jusqu’à ce que vous le déconnectiez — la même forme que se connecter à n’importe quelle autre application avec votre compte.',
        ],
      },
      {
        heading: 'L’ajouter',
        body: [
          'Sur claude.ai : Paramètres, puis Connecteurs, puis Ajouter un connecteur personnalisé, et donnez-lui `https://transformpipe.com/api/mcp`. Connectez-vous quand on vous le demande, et les outils apparaissent dans la conversation suivante.',
          'Depuis un terminal, une seule commande fait la même chose : `claude mcp add --transport http transformpipe https://transformpipe.com/api/mcp`.',
          'Rien d’autre n’est à configurer. Le connecteur se retire depuis le même écran, et le retirer révoque l’accès immédiatement.',
        ],
      },
      {
        heading: 'Ce qu’il peut alors faire',
        body: [
          'Onze outils, tous nommés `tp_`. Ceux qui comptent dans une conversation sont `tp_convert_markdown`, qui transforme du Markdown en document HTML fini, `tp_convert_to_markdown` pour un fichier qui fait le chemin inverse, `tp_save_document`, qui garde le résultat dans votre compte, et `tp_share_document`, qui le publie et renvoie un lien que vous pouvez envoyer.',
          'Les autres sont ceux qu’un assistant emploie de lui-même : `tp_list_documents` et `tp_get_document` pour retrouver quelque chose que vous avez fait plus tôt, `tp_summarize_document` pour dire ce que contient un document long, `tp_document_versions` pour montrer ce qui a remplacé quoi, `tp_usage` pour vérifier la place qu’il reste, et `tp_delete_document`.',
          'En pratique, la phrase utile est courte. Demandez-lui d’écrire les notes de version, puis demandez-lui de les publier — l’assistant convertit, enregistre et partage, et répond avec l’adresse.',
        ],
      },
      {
        heading: 'Ce qu’il peut atteindre, et ce qu’il ne peut pas',
        body: [
          'Le connecteur agit en tant que vous, dans votre compte, sur les documents qui vous appartiennent. Il ne peut pas modifier le compte, lire votre mot de passe, créer des clés API, ni atteindre les documents de quelqu’un d’autre.',
          'Un accès peut aussi être accordé en lecture seule, auquel cas l’assistant peut lister, récupérer et résumer mais ne peut ni enregistrer, ni partager, ni supprimer — et cette restriction s’applique au jeton lui-même plutôt qu’aux outils, elle tient donc quoi que l’assistant demande.',
          'Bon à savoir plutôt qu’à redouter : un assistant muni d’un connecteur dispose d’une autorité permanente pour agir, et un document qu’il lit peut contenir des instructions qui lui sont destinées. C’est le coût honnête de la commodité, et la raison pour laquelle un accès en lecture seule est le bon réglage par défaut pour tout ce que vous n’avez pas écrit vous-même.',
        ],
      },
      {
        heading: 'Quand ne pas l’utiliser',
        body: [
          'Un connecteur convient au document qui existe à l’intérieur d’une conversation et nulle part ailleurs. Pour un fichier déjà sur le disque, le déposer sur le convertisseur va plus vite ; pour quelque chose qui se produit à chaque merge, l’API ou la GitHub Action est la bonne forme ; et pour un dossier de quatre cents fichiers, un convertisseur local l’emporte sur une conversation.',
        ],
      },
    ],
    action: 'Lire la documentation',
    seo: {
      title: 'Convertir et partager un document depuis un assistant IA — TransformPipe',
      description:
        'Comment ajouter TransformPipe à Claude comme connecteur MCP, ce que font les onze outils, et ce qu’un assistant peut atteindre ou non dans votre compte.',
    },
  },
};
