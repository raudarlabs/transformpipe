---
title: "Convertisseur de documents MCP : convertir et partager depuis une conversation"
description: "Comment un convertisseur de documents MCP transforme le Markdown d'un assistant en page envoyable : les huit outils, la connexion sans clé et les vrais risques"
date: 2026-09-09
tag: Automatisation
keywords: convertisseur de documents mcp, serveur mcp markdown vers html, connecteur personnalisé claude, convertir du markdown dans un assistant, connecteur mcp oauth, partager un document depuis une conversation
---

Un assistant écrit du Markdown à longueur de journée. Demandez-lui des notes de version, le compte rendu d'une réunion, un premier jet de spécification, et ce qui revient est une accumulation de dièses, d'astérisques et de barres verticales dans une fenêtre de discussion. Cela se lit correctement là, parce que la fenêtre effectue le rendu. Cela ne ressemble à rien partout ailleurs.

### En bref

Un convertisseur de documents MCP est un connecteur : un petit serveur que l'assistant peut appeler, pour que le Markdown qu'il vient d'écrire devienne un fichier converti ou une page publiée sans qu'une personne déplace du texte entre deux onglets. La forme utile tient en cinq verbes — convertir, enregistrer, partager, lister, récupérer — et la partie délicate n'est pas la conversion mais l'autorisation, qui devrait être une approbation révocable plutôt qu'une clé à longue durée de vie collée quelque part. C'est réellement pratique et c'est réellement un mandat permanent d'agir en votre nom, ce qui signifie qu'un document lu par le modèle peut tenter de le convaincre d'utiliser vos outils. Servez-vous d'un connecteur pour le document qui existe à l'intérieur d'une conversation, et d'une API, d'une commande ou d'une étape de build pour tout le reste.

La réparation habituelle consiste à sortir le texte à la main. Sélectionner la réponse, copier, trouver un convertisseur, coller, attendre, télécharger, renommer le fichier, le joindre, s'apercevoir que le tableau est ressorti en paragraphe de barres verticales, revenir en arrière et recommencer. Chacune de ces étapes fonctionne. C'est l'enchaînement qui pose problème, et c'est l'étape qui casse sans cesse — la copie qui attrape la moitié d'un bloc de code, le collage qui arrive avec la mise en forme de la discussion accrochée, le fichier appelé `download (3).html`. Cette friction a son propre article : [ce qui se passe vraiment quand on déplace la sortie d'un modèle vers un document](/blog/ai-output-to-a-shareable-page) couvre le chemin manuel et ce qu'il coûte, et le présent texte ne le répète pas.

Ce qui est étrange dans le chemin manuel, c'est que l'assistant est déjà un programme qui appelle d'autres programmes. Il lit des fichiers, lance des recherches, ouvre des pull requests. La seule chose qu'il ne sait généralement pas faire, c'est vous remettre le document qu'il vient d'écrire sous une forme qu'une personne puisse ouvrir. Non parce que c'est difficile, mais parce que personne n'a branché le convertisseur.

C'est l'écart que comble un connecteur, et le reste de cet article porte sur ce à quoi ressemble un bon connecteur, sur ce qu'il a le droit de faire en votre nom, et sur les cas où y recourir est le mauvais réflexe.

## Ce qu'est MCP, simplement

Le Model Context Protocol est « une norme open source pour connecter les applications d'IA à des systèmes externes » (vérifié sur modelcontextprotocol.io, le 9 septembre 2026). C'est toute l'idée. Avant lui, chaque assistant avait son propre format d'extension et chaque fournisseur d'outil écrivait plusieurs fois la même intégration. Un protocole partagé signifie qu'un outil se construit une fois et s'atteint depuis tout ce qui le parle.

Il a une forme client-serveur, avec trois participants nommés plutôt que deux. L'hôte est l'application d'IA ; il crée un client par serveur, et chaque client tient une connexion dédiée vers son serveur, qui est « un programme fournissant du contexte aux clients MCP » (vérifié sur modelcontextprotocol.io, le 9 septembre 2026). En pratique, lisez « hôte » comme l'assistant dans lequel vous tapez, « client » comme la partie de celui-ci qui parle à un outil précis, et « serveur » comme l'outil.

| Participant | Ce que c'est | Dans cet article |
| --- | --- | --- |
| Hôte | L'application d'IA, qui coordonne un ou plusieurs clients | L'assistant auquel vous parlez |
| Client | Tient une connexion et obtient du contexte d'un serveur | Créé par l'hôte, pas quelque chose que vous configurez directement |
| Serveur | Un programme qui fournit du contexte et des outils | Le convertisseur |

Un serveur expose jusqu'à trois sortes de choses : des outils, fonctions exécutables que l'application peut invoquer pour accomplir des actions ; des ressources, sources de données fournissant du contexte ; et des invites, modèles réutilisables (vérifié sur modelcontextprotocol.io, le 9 septembre 2026). Un convertisseur est presque entièrement fait d'outils. Convertir est une action avec un effet sur le monde — un fichier existe qui n'existait pas — et c'est exactement à cela que sert un outil.

Il existe deux transports. Stdio « utilise les flux d'entrée/sortie standard pour la communication directe entre processus locaux sur la même machine », et Streamable HTTP « utilise HTTP POST pour les messages du client vers le serveur, avec des Server-Sent Events facultatifs pour le streaming », ce qui « permet la communication avec un serveur distant et prend en charge les méthodes d'authentification HTTP standard, y compris les jetons bearer, les clés d'API et les en-têtes personnalisés », OAuth étant recommandé pour obtenir ces jetons (vérifié sur modelcontextprotocol.io, le 9 septembre 2026).

Cette distinction décide de ce que l'on ressent en installant un connecteur. Un serveur stdio est un processus sur votre machine : vous l'installez, il tourne quand l'assistant le lance, et il peut atteindre votre système de fichiers parce qu'il se tient dedans. Un serveur HTTP est une URL : rien n'est installé, c'est le même serveur pour tous ceux qui l'ajoutent, et la question intéressante devient : comment sait-il qui demande ? Un convertisseur de documents hébergé est du second type, et c'est pourquoi l'essentiel de cet article porte sur cette question.

Deux choses que MCP n'est délibérément pas. Ce n'est pas une façon d'exécuter un modèle — le protocole « se concentre uniquement sur le protocole d'échange de contexte » et ne dicte pas comment les applications utilisent les modèles ni gèrent le contexte (vérifié sur modelcontextprotocol.io, le 9 septembre 2026). Et ce n'est pas un système de permissions. Il transporte une autorisation, et ne définit rien quant à savoir si le modèle aurait dû appeler l'outil qu'il vient d'appeler. Ce jugement reste à l'auteur de l'outil et à vous.

## Ce que vaut un convertisseur en tant que connecteur

L'argument en faveur du branchement d'un convertisseur de documents n'est pas que la conversion soit difficile. C'est que le document est déjà dans la conversation, et que tout ce que vous feriez ensuite relève d'une application distincte.

Cinq verbes couvrent presque tout. Convertir, pour que le Markdown devienne une page. Enregistrer, pour qu'il ait une adresse au lieu de vivre dans un historique de défilement. Partager, pour que quelqu'un d'autre puisse l'ouvrir. Lister, pour que l'assistant puisse répondre à « qu'est-ce que j'ai ». Récupérer, pour qu'un document écrit il y a trois semaines puisse être modifié plutôt que réécrit de mémoire. Avec ces cinq-là, le modèle termine le travail dans la conversation au lieu de tendre au lecteur un mur d'astérisques en lui souhaitant bonne chance.

Le connecteur de TransformPipe expose huit outils, et la répartition est délibérée : deux font le travail, quatre répondent à des questions, et deux modifient ce que d'autres personnes peuvent voir ou l'existence même d'un document.

| Outil | À quoi il sert | Ce qu'il peut provoquer |
| --- | --- | --- |
| `tp_help` | Répond aux questions sur le fonctionnement du produit, depuis sa documentation plutôt que de mémoire | Rien. Il lit des sections de documentation et les renvoie |
| `tp_convert_markdown` | Markdown en entrée, HTML assaini en sortie ; en option le document autonome complet | Rien n'est enregistré. La sortie repasse par la conversation, donc un long document coûte du contexte |
| `tp_save_document` | Enregistre du Markdown sur le compte, et le publie dans le même appel si on le lui demande | Écrit un document. Avec un mode de partage, publie une page sur le web public |
| `tp_list_documents` | Ce que contient le compte — noms, tailles, dates, statut de partage — avec l'id que prennent les autres outils | Lecture. Expose la liste des documents à la conversation |
| `tp_get_document` | Un document, par id, sous forme de source Markdown ou de HTML rendu | Lecture. Fait entrer un document entier dans la conversation |
| `tp_share_document` | Change qui peut ouvrir un document : un lien, des adresses nommées, ou personne | Publie ou dépublie. Révoquer casse une URL déjà envoyée |
| `tp_usage` | Ce que le compte consomme par rapport à ses limites | Lecture. Utile quand un enregistrement a été refusé |
| `tp_delete_document` | Supprime un document, définitivement | Détruit des données. Exige une confirmation explicite, et n'en retire qu'un seul |

Deux détails structurels comptent plus que la liste elle-même.

Le premier est que ces outils ne sont pas une seconde implémentation de quoi que ce soit. Chacun appelle l'API publique de l'application elle-même, en processus, avec l'identifiant de l'appelant transmis, si bien qu'une conversation et un script obtiennent la même réponse du même code. Cela ressemble à un souci de propreté interne et n'en est pas un. Un outil qui interrogerait directement la base de données serait une seconde implémentation de « à qui appartiennent ces documents », et c'est la question à laquelle on veut le moins deux réponses. Le même raisonnement vaut pour la conversion : le HTML que renvoie un outil est le HTML que produit la page dans le navigateur, assaini contre la même liste d'autorisations, parce que c'est le même moteur de rendu.

Le second est `tp_help`. Un modèle à qui l'on demande comment fonctionne un produit répondra à partir de ce qu'il a absorbé à l'entraînement, ce qui donne, pour tout produit plus jeune que sa date de coupure, une description assurée de quelque chose qui n'existe pas. Un outil de documentation transforme cela en consultation. C'est l'outil le moins spectaculaire du tableau et celui qui évite le plus de réponses fausses.

## L'ajouter, et la connexion qui ne contient aucune clé

L'adresse est le déploiement suivi de `/api/mcp` :

```
https://transformpipe.com/api/mcp
```

Sur claude.ai, cela se saisit dans Paramètres → Connecteurs → Ajouter un connecteur personnalisé. Depuis un terminal :

```
claude mcp add --transport http transformpipe https://transformpipe.com/api/mcp
```

C'est toute la configuration. Il n'y a aucune clé à coller, et cette absence est précisément le sujet.

Sous l'adresse, le transport est du JSON-RPC sur un unique POST, sans flux d'événements. Chaque outil répond depuis la base de données ou depuis le stockage d'objets en un seul aller-retour ; la seule chose qu'un flux apporterait serait un rapport de progression sur un travail sans étape intermédiaire à rapporter. Un `GET` reçoit un 405, ce qui est une façon conforme de dire qu'il n'y a pas de flux à cette adresse.

### Ce qui se passe au premier appel

Le premier appel ne porte aucun jeton, et ce qui revient est un 401. Le statut est le signal du protocole, et cela mérite d'être dit clairement parce que c'est la façon la plus courante dont un connecteur fait maison échoue : un 200 transportant une erreur poliment formulée est lu comme un outil en échec, et ne déclenche jamais de connexion. Seul le code de statut le fait.

Le 401 porte un en-tête `WWW-Authenticate` nommant un document de ressource protégée et les portées qu'il demande — `documents:read documents:write`. À partir de là, le client parcourt une chaîne de documents bien connus pour découvrir où se connecter, s'enregistre lui-même, et envoie la personne vers une page du site.

L'ordre des événements, qui n'est évident depuis aucune de ses parties prises isolément :

1. Le client fait un POST sur le point de terminaison sans jeton et reçoit un 401 accompagné d'un en-tête `WWW-Authenticate` nommant le document de ressource protégée.
2. Il lit `/.well-known/oauth-protected-resource` pour trouver le serveur d'autorisation, puis `/.well-known/oauth-authorization-server` pour trouver les points de terminaison de ce serveur.
3. Il s'enregistre et reçoit un `client_id`. Aucun secret n'est délivré : un client tournant sur la machine de quelqu'un d'autre ne peut pas en garder un, et c'est à cela que sert PKCE.
4. Il envoie la personne vers `/authorize` avec un défi PKCE. Si elle n'est pas connectée, elle est mise en attente et passe d'abord par l'authentification de l'application.
5. Elle approuve — par un POST depuis une page qu'elle a réellement lue, si bien qu'un lien seul n'autorise rien.
6. Le client échange le code et son vérificateur contre un jeton d'accès et un jeton de rafraîchissement.

Le site doit être son propre serveur d'autorisation pour cela, plutôt que de céder la session qu'il possède déjà. La spécification d'autorisation interdit à une ressource d'accepter un jeton émis par quelqu'un d'autre ; la personne se connecte donc exactement comme d'habitude, approuve un client nommé sur une page qu'elle a regardée, et le client repart avec un jeton de la fabrication du site.

### Ce que le client obtient réellement

Un jeton qui agit en tant que cette personne, pour ses documents, et n'atteint rien d'autre. Pas le compte. Pas l'authentification à laquelle le compte est rattaché. Pas les clés d'API, qui sont un identifiant distinct pour un usage distinct. Les jetons d'accès sont émis avec une durée de trente jours et les jetons de rafraîchissement de cent quatre-vingts, si bien qu'un connecteur dont vous vous servez continue de fonctionner et qu'un connecteur oublié finit par s'arrêter.

La révocation se trouve dans le menu du compte, sous Clés d'API, et prend effet au prochain appel plutôt qu'à la fin d'une fenêtre de cache.

Deux détails de la page de consentement existent à cause d'attaques précises plutôt que par bon goût. La page nomme l'adresse au nom de laquelle le client s'apprête à agir, parce qu'un « approuver » sans sujet n'est pas un consentement. Et le nom du client est débarrassé des caractères de contrôle et des inversions bidirectionnelles avant affichage, parce qu'un client pourrait sinon s'enregistrer sous un nom terminé par une marque d'écriture de droite à gauche et faire afficher un mensonge à la page — un problème auquel l'échappement HTML ne change rien.

### Pourquoi cette forme plutôt qu'une clé

Un connecteur détenant une clé d'API à longue durée de vie que vous avez collée est un identifiant rangé dans un endroit que vous oublierez. Il repose dans un fichier de configuration, ou dans les réglages d'un assistant hébergé, et il vaut exactement ce que vaut la clé que vous avez collée — laquelle, si vous avez collé celle que vous aviez déjà, est la même que celle qu'utilisent vos scripts de déploiement. La faire tourner casse les deux. L'auditer vous dit qu'une clé a servi, pas quel client s'en est servi.

Un client approuvé est un autre objet. Il a un nom lisible, une portée plus étroite que le compte, sa propre expiration, et un bouton de révocation qui ne casse rien d'autre de ce que vous possédez. Quand vous regarderez la liste dans six mois et ne reconnaîtrez pas une entrée, vous pourrez retirer cette entrée seule. C'est là tout l'argument, et il vaut la page supplémentaire dans le parcours.

## Les deux outils façonnés pour les ennuis qu'ils peuvent causer

Six des huit outils sont ordinaires. Deux ne le sont pas, et ils sont écrits différemment à dessein.

**Partager publie une page sur le web public.** Il y a trois modes, et la transition entre eux est la partie que les gens ratent.

| Mode | Qui peut l'ouvrir | La conséquence à connaître |
| --- | --- | --- |
| `private` | Le propriétaire seul | Révoque entièrement un lien existant, donc une URL déjà envoyée cesse de fonctionner |
| `link` | Quiconque détient l'URL | C'est sur le web public. Une URL n'est pas un mot de passe, et les liens voyagent |
| `people` | Uniquement les adresses indiquées | La liste d'adresses est remplacée, pas complétée — envoyez la liste entière à chaque fois |

L'enregistrement peut publier dans le même appel, ce qui est pratique et explique exactement pourquoi les instructions que le serveur donne au modèle lui disent de ne partager un document que si la personne l'a demandé. Un outil qui stocke et publie en une seule étape est un outil capable de transformer « garde ça » en « publie ça » par une seule phrase mal lue. L'atténuation n'a rien de subtil : la description dit ce qu'il fait dès sa première ligne, le mode est une énumération explicite plutôt qu'un booléen nommé `public`, et la réponse au modèle indique dans quel mode se trouve désormais le document et quelle est son URL, si bien que le résumé de l'assistant est une affirmation que vous pouvez vérifier.

**Supprimer exige une confirmation explicite et retire exactement un document.** `confirm: true` est obligatoire, et sans lui l'outil refuse et dit au modèle d'aller demander. Il n'y a ni annulation ni corbeille. Et il n'existe aucun outil qui en supprime plusieurs — pas de motif générique, pas de « supprimer tous les documents partagés », pas de plage de dates. C'est une absence délibérée plutôt qu'une fonctionnalité manquante. Une suppression en masse est le seul outil où une instruction mal comprise détruit un travail irrécupérable, et un connecteur incapable d'exprimer l'instruction est incapable de l'exécuter.

La confirmation est une atténuation réelle et partielle, ce qui est le thème de la section suivante. Elle empêche une suppression accidentelle, parce qu'un accident n'inclut pas d'ordinaire un drapeau de confirmation. Elle n'empêche pas une suppression à laquelle le modèle a été amené par la persuasion, car un modèle convaincu de supprimer quelque chose passera `confirm: true` aussi volontiers que l'id.

## Là où un connecteur échoue, et ce que cela coûte

Un connecteur est un mandat permanent d'agir en votre nom. Ce n'est pas une réserve en bas de page ; c'est ce que la chose est. Une fois ajouté, l'assistant peut appeler ces outils dès qu'il les juge pertinents, dans une conversation que vous ne lisez pas nécessairement de près, sur la base d'un texte que vous n'avez pas nécessairement écrit.

**Un modèle peut être amené à utiliser vos outils par le document qu'il est en train de lire.** C'est l'injection d'invite, et elle n'a rien d'hypothétique pour un convertisseur de documents, puisque lire des documents est tout son métier. Quelqu'un vous envoie un fichier Markdown. Vous demandez à l'assistant de le convertir et de le publier. Quelque part au milieu de ce fichier, dans un commentaire, un bloc de code ou du texte blanc sur blanc, se trouve un paragraphe adressé au modèle plutôt qu'à vous. Le modèle traite désormais les instructions d'un inconnu tout en détenant un jeton qui agit en votre nom.

Les atténuations sont réelles, et elles sont partielles. Les énoncer honnêtement suppose d'en énoncer les deux moitiés.

| Atténuation | Ce qu'elle empêche réellement | Ce qu'elle n'empêche pas |
| --- | --- | --- |
| Un jeton limité aux données d'un seul produit | D'atteindre votre messagerie, vos dépôts, vos autres comptes, ou les clés d'API du même compte | Tout ce qui est dans la portée : lire, publier et supprimer vos documents |
| Une confirmation explicite sur l'outil destructeur | La suppression accidentelle, et la suppression désinvolte que la personne n'a jamais demandée | Une suppression à laquelle le modèle a été persuadé et qu'il confirme lui-même |
| Un partage visible et révocable | Qu'une publication vous reste cachée, ou qu'elle soit permanente | La fenêtre entre la publication et le moment où vous la remarquez. Une page copiée reste copiée |
| Aucune opération en masse | Qu'une instruction détruise de nombreux documents | Des appels unitaires répétés, si personne ne surveille la transcription |
| La personne lisant ce que l'assistant dit avoir fait | L'essentiel, en pratique, si la personne lit vraiment | Tout ce qui se trouve dans une conversation que personne n'a relue, c'est-à-dire la plupart des longues conversations |

Cette dernière ligne fait plus de travail que les autres, et c'est la moins fiable. Le résumé honnête est que la sûreté d'un connecteur repose aujourd'hui sur une portée étroite plus une personne attentive, et que la seconde moitié se dégrade précisément avec la charge de travail qui rend un connecteur intéressant.

Il y a trois autres coûts qui ne relèvent pas du tout de l'injection.

**C'est un service de plus qui détient vos documents.** Hors connexion, la conversion dans le navigateur sur ce site n'envoie rien nulle part : le fichier est lu, converti et rendu sur votre propre machine, et vous pouvez regarder l'onglet réseau rester vide pendant l'opération. Un connecteur est par nécessité l'arrangement inverse. Enregistrer un document suppose un compte, un compte suppose du stockage, et du stockage suppose une entreprise qui détient un texte que vous avez écrit. Pour un README, cela n'a aucune importance. Pour un contrat, une note médicale ou un plan non publié, c'est toute la question, et la bonne réponse peut être de convertir dans le navigateur et de ne jamais rien enregistrer.

**Le document entre dans la conversation.** `tp_convert_markdown` renvoie la sortie convertie par le même canal que tout le reste, ce qui veut dire qu'un long document fait désormais partie d'une transcription détenue par l'hébergeur de l'assistant. L'outil tronque le texte renvoyé à quarante mille caractères et indique combien il a laissé de côté, plutôt que de tronquer en silence — une troncature silencieuse se lit comme de la complétude, ce qui est pire qu'un trou visible — mais cette limite est une clémence envers la fenêtre de contexte, pas un contrôle de confidentialité. Pour tout ce qui est long, enregistrer puis partager le lien revient moins cher et expose moins.

**L'assainissement reste un sujet à comprendre, pas à exécuter vous-même.** Le HTML brut présent dans une source Markdown passe par un assainisseur à liste d'autorisations fixe avant d'atteindre une page, si bien qu'une balise `<script>` dans un fichier qu'on vous a envoyé ne survit pas à la conversion. C'est une propriété du convertisseur plutôt que du connecteur, et il vaut la peine de lire [comment fonctionne l'assainissement et où il doit avoir lieu](/blog/sanitising-markdown-safely) si vous convertissez des fichiers que vous n'avez pas écrits. Ce que l'assainisseur ne peut pas faire, c'est vous dire que la prose elle-même s'adressait à votre assistant.

## Les limites, et pourquoi l'une d'elles vaut 4 Mo

Le connecteur n'est pas un produit séparé avec des plafonds séparés. Les mêmes chiffres s'appliquent qu'un document arrive d'un onglet de navigateur, d'un script ou d'une conversation, ce qui est le seul arrangement qui ne produit pas de tickets de support.

| Limite | Valeur | Pourquoi ce chiffre |
| --- | --- | --- |
| Par conversion | 10 Mo | La conversion s'exécute dans le navigateur ; c'est donc un jugement sur la machine devant la personne plutôt qu'une règle de plateforme. Plusieurs fichiers déposés ensemble comptent pour le document unique qu'ils deviennent |
| Par document conservé | 4 Mo | Pas une politique. La plateforme refuse un corps de requête ou de réponse au-delà de 4,5 Mo avant que le code de l'application ne s'exécute ; un document plus gros ne pourrait être ni enregistré ni relu |
| Par compte | 100 Mo, 500 documents | Octets et lignes sont plafonnés séparément : mille fichiers minuscules coûtent de vraies lignes |
| Par appelant | 60 appels par minute | Un appelant qui déclenche cette limite boucle, il ne travaille pas |
| Texte renvoyé | 40 000 caractères | Une réponse d'outil doit traverser la conversation, et un document ne devrait pas la dévorer |

Le chiffre de 4 Mo est celui qui mérite d'être compris, parce que c'est la seule limite qui ne soit pas un choix. Il est fixé en dessous des 4,5 Mo de la plateforme plutôt qu'à leur niveau, pour que le refus vienne de l'application avec les deux tailles nommées dedans plutôt que d'un rejet nu venu d'en dessous — ce qui fait la différence entre un modèle capable de vous dire quoi faire ensuite et un modèle qui rapporte un échec qu'il ne peut pas expliquer. Un document au-delà de cette taille se convertit quand même, se prévisualise quand même et se télécharge quand même — la conversion s'exécute dans votre navigateur, où aucun corps de requête n'intervient — il reste simplement hors de l'historique enregistré, et l'application le dit au lieu de rapporter un enregistrement qui n'a pas eu lieu. Un connecteur hérite exactement de cela : `tp_convert_markdown` traitera un fichier que `tp_save_document` refuse.

Si un enregistrement est refusé, `tp_usage` est l'outil qui dit pourquoi, sous forme d'octets et de documents comptés contre chaque plafond. Il existe parce que « ça n'a pas enregistré » est une phrase qu'un modèle interprétera autrement de façon créative.

Une dernière propriété facile à manquer : l'export est un fichier complet plutôt qu'un fragment. Doctype, en-tête, styles en ligne, aucune requête externe. C'est ce qui permet à un document converti de survivre à un envoi par e-mail, à une ouverture hors ligne ou à une lecture sur une machine qui n'a jamais vu le site — et c'est [une propriété précise avec des compromis précis](/blog/self-contained-html-explained) plutôt qu'une formule commerciale.

## Quand un connecteur est le mauvais outil

Un connecteur est fait pour le document qui existe à l'intérieur d'une conversation. Ce cas est plus étroit qu'il n'y paraît, et y recourir en dehors produit le pire des deux arrangements : une personne dans la boucle, plus une étape non déterministe au milieu.

| La tâche | Le bon outil | Pourquoi pas un connecteur |
| --- | --- | --- |
| Un script convertit des documents dans le cadre d'un ensemble plus vaste | L'[API REST](/blog/converting-documents-with-an-api) | Un script n'a besoin d'aucun modèle pour décider quoi que ce soit. Il lui faut un code de statut et un corps |
| Un dossier de fichiers, à convertir maintenant | La [ligne de commande](/blog/markdown-to-html-from-the-command-line) | Cent fichiers, c'est une boucle, pas cent appels d'outils. C'est plus rapide, moins cher et reproductible |
| Un dépôt publie à chaque poussée | L'[action GitHub](/blog/publish-markdown-from-github-actions) | Le déclencheur est un commit, et il n'y a personne dans la conversation à qui demander |
| Un document déjà sur votre disque, une seule fois | La page dans le navigateur | Ajouter un connecteur pour convertir un fichier représente plus de configuration que la tâche |

Le test consiste à repérer où se trouve le document au moment où vous voulez le convertir. S'il est sur un disque, dans un dépôt ou dans une variable, c'est un programme qui doit le convertir. S'il n'existe que sous forme de texte qu'un modèle vient de produire, alors le sortir pour le convertir et le réinjecter pour en discuter est de nouveau le problème du copier-coller, sous un autre chapeau.

Pour situer, les serveurs MCP de référence publiés aux côtés du protocole montrent à quoi ressemble le cas local, de forme stdio : Filesystem, « opérations de fichiers sécurisées avec contrôles d'accès configurables » ; Git, « outils pour lire, chercher et manipuler des dépôts Git » ; Fetch, « récupération et conversion de contenu web pour un usage efficace par un LLM » ; plus Memory, Time, Sequential Thinking et un serveur de test Everything (vérifié sur github.com/modelcontextprotocol/servers, le 9 septembre 2026). Notez la division du travail. Filesystem et Git atteignent déjà votre disque et votre dépôt ; un document qui vit dans l'un des deux n'a pas besoin d'un convertisseur hébergé pour aller le chercher — il en a besoin pour convertir ce que ces outils ont remis, ou de rien du tout.

## Comment juger un connecteur de documents

1. **Vérifiez s'il peut être révoqué sans casser autre chose.** Un connecteur qui réutilise votre clé d'API existante signifie que faire tourner cette clé tue aussi vos scripts de déploiement, et vous l'apprendrez au pire moment ; un connecteur qui détient sa propre approbation peut être retiré sur une simple intuition, sans conséquence.
2. **Lisez la description de l'outil destructeur avant de l'ajouter.** Si la suppression n'exige aucune confirmation, ou s'il existe un outil qui supprime plusieurs choses à la fois, alors une instruction mal lue dans une longue conversation devient une perte de données irrécupérable plutôt qu'une erreur agaçante.
3. **Découvrez si le partage est une étape distincte ou un drapeau sur l'enregistrement.** Les deux se défendent, mais un enregistrement qui publie dans le même appel exige que le mode soit nommé explicitement dans la réponse, sinon « je l'ai enregistré » et « je l'ai posté sur internet » sont la même phrase pour la personne qui lit le résumé.
4. **Demandez-vous ce que les outils renvoient à travers la conversation.** Un outil qui restitue des documents entiers remplira la fenêtre de contexte et placera votre texte dans la transcription ; un connecteur qui renvoie une URL pour tout ce qui est long vous rend un service qui se voit en coût moindre et en exposition moindre.
5. **Confirmez que les limites correspondent au reste du produit.** Un connecteur avec ses propres plafonds plus discrets refusera quelque chose que le site web a accepté, et l'échec arrivera sous forme de modèle s'excusant vaguement plutôt que d'erreur exploitable.
6. **Décidez, avant de l'ajouter, quels documents vous acceptez de voir stockés.** Un connecteur qui enregistre est un service détenant votre texte, et la seule version de cette décision qui survit à une semaine chargée est celle que vous avez prise à l'avance, pas celle que vous prenez en collant.

## Conclusion

Un connecteur mérite sa place quand le document est déjà à l'intérieur de la conversation et que toutes les solutions de rechange supposent qu'une personne déplace du texte entre deux fenêtres. Ce qui le rend digne d'être ajouté plutôt que simplement astucieux, c'est la partie ennuyeuse : un jeton qui couvre les documents d'un seul produit et rien d'autre, une approbation portant un nom et un bouton de révocation qui ne casse rien, un outil destructeur qui demande, et un partage qui annonce à voix haute ce qu'il vient de publier. Ce sont les propriétés à vérifier sur n'importe quel connecteur, pas seulement celui-ci. Si vous préférez garder le document sur votre propre machine, la même conversion s'exécute dans le navigateur avec [rien de téléversé lorsque vous n'êtes pas connecté](/) — et si la tâche est un script, un dossier ou un dépôt, servez-vous de l'API, de la ligne de commande ou de l'action, et laissez la conversation aux documents qui n'existent que là.

## FAQ

### Qu'est-ce qu'un convertisseur de documents MCP ?

C'est un convertisseur de documents exposé comme serveur MCP, afin qu'un assistant puisse l'appeler comme outil au lieu qu'une personne convertisse le fichier à la main. En pratique, cela signifie que le modèle peut transformer le Markdown qu'il vient d'écrire en HTML, l'enregistrer, le publier sous forme de page et le relire plus tard, le tout dans la conversation où le texte se trouve déjà.

### Ai-je besoin d'une clé d'API pour ajouter le connecteur ?

Non. Le premier appel revient non autorisé, l'assistant suit cette réponse jusqu'à une page du site, et vous vous connectez avec le compte que vous utilisez déjà puis approuvez un client nommé. Le client reçoit un jeton valable pour vos documents et rien d'autre, et vous le révoquez depuis le menu du compte, sous Clés d'API.

### Un assistant peut-il publier mon document sans demander ?

Il le peut, et c'est pourquoi les outils ont la forme qu'ils ont : l'enregistrement peut publier dans le même appel, et les instructions du serveur disent au modèle de ne partager que si la personne l'a demandé. Le partage est visible dans votre liste de documents et révocable, et remettre un document en privé empêche un lien déjà envoyé de s'ouvrir — mais une page copiée pendant qu'elle était publique reste copiée.

### Que se passe-t-il si mon document dépasse la limite ?

La conversion est plafonnée à 10 Mo et un document stocké à 4 Mo, si bien qu'un fichier situé entre les deux se convertit et se télécharge mais ne peut pas être conservé sur le compte. Cette seconde limite est celle de la plateforme plutôt qu'une politique : une fonction refuse un corps de requête ou de réponse au-delà de 4,5 Mo avant que le code de l'application ne s'exécute, donc le document ne pourrait être ni enregistré ni relu.

### Un connecteur est-il plus sûr que coller dans un convertisseur en ligne ?

Ils échouent différemment. Coller fait courir un risque à la copie elle-même — la moitié d'un bloc de code, un tableau écrasé, le mauvais onglet — tandis qu'un connecteur fait courir le risque qu'un mandat permanent soit utilisé sur la foi d'un texte que vous n'avez pas écrit, c'est-à-dire l'injection d'invite. Convertir dans le navigateur sans être connecté ne téléverse rien du tout, et pour un document que vous ne pouvez vous permettre de stocker nulle part, cela reste l'option la plus solide.

### Un connecteur MCP ne fonctionne-t-il qu'avec un seul assistant ?

Non. MCP est une norme ouverte prise en charge par de nombreux clients, donc un serveur distant atteint par HTTP fonctionne avec tout ce qui parle le protocole et sait mener la connexion à son terme. Ce qui diffère d'une application à l'autre, c'est l'endroit où vous collez l'adresse et la manière dont elles présentent l'étape d'approbation, pas le serveur.

### Que faire si le connecteur cesse de fonctionner ?

Vérifiez d'abord l'approbation : un client révoqué, ou un jeton de rafraîchissement arrivé au bout de sa vie, produit exactement la même réponse non autorisée qu'un connecteur tout neuf, et réapprouver règle le problème. S'il s'autorise puis refuse d'enregistrer, demandez à l'assistant d'appeler l'outil d'usage, qui rapporte octets et documents comptés contre le plafond du compte au lieu de laisser le modèle deviner.

### La conversion par un connecteur fait-elle vraiment économiser quelque chose ?

Des jetons, et le montant relève de l'arithmétique plutôt que de l'affirmation. Un appel d'outil qui renvoie un lien met onze jetons dans la transcription là où le document lui-même en aurait mis des milliers — et la transcription est renvoyée à chaque tour suivant, donc l'écart se cumule. [Ce qu'un document coûte à un assistant](/blog/what-a-document-costs-an-assistant) fait le calcul, y compris le cas où le modèle doit vraiment lire le document et où l'économie est nulle.
