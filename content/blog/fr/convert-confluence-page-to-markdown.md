---
title: "Convertir une page Confluence en Markdown : chaque export, et le HTML qui se cache dessous"
description: "Comment faire passer une page ou un espace Confluence en Markdown : pourquoi il n’existe aucun export natif, ce que garde l’export HTML, ce que chaque macro perd"
date: 2026-09-14
tag: Conversion
keywords: confluence vers markdown, convertir une page confluence en markdown, export markdown confluence, confluence html vers markdown, export de page confluence, export html espace confluence
---

Confluence a un bouton Exporter, plusieurs formats derrière, et aucun d’eux n’est du Markdown. Ce n’est pas un oubli : une page Confluence n’est pas stockée en Markdown, ni en quoi que ce soit d’approchant. Elle est stockée dans le format de stockage propre à Confluence — un balisage fondé sur XHTML, avec deux espaces de noms maison posés par-dessus pour les macros et les références de ressources — et chaque format d’export proposé par Confluence est un rendu de ce format de stockage vers autre chose. Arriver au Markdown revient à choisir l’un de ces rendus et à le convertir une seconde fois.

La conséquence pratique est que « convertir Confluence en Markdown » est toujours un travail en deux temps : exporter dans un format qui conserve assez de structure pour valoir la conversion, puis passer une véritable conversion HTML vers Markdown sur ce qui en est sorti. Sauter directement à Word ou à PDF jette la structure avant que la seconde étape n’ait de quoi travailler.

### En bref

**Le HTML est le seul export qui vaille la peine d’être converti.** Le format de stockage de Confluence est fondé sur XHTML : l’export HTML d’un espace conserve donc les titres, les listes, les tableaux et les liens sous forme de vrai balisage qu’un convertisseur sait lire — les exports Word et PDF du même contenu se compriment en mise en forme dont on récupère bien moins. L’export d’espace exige la permission d’administrateur d’espace et n’exporte que ce que votre propre compte peut déjà voir, sauf s’il est lancé par un administrateur de site, auquel cas tout est exporté quelles que soient les restrictions de visibilité (vérifié sur support.atlassian.com, le 14 septembre 2026). Quoi qu’il en sorte, convertissez-le avec [une conversion HTML vers Markdown](/html-to-markdown) plutôt qu’avec un script qui retire les balises à coups d’expressions régulières — le HTML de Confluence est dense en attributs de style `mso` et en `div` d’enrobage de macros qu’un dépouilleur naïf laisse derrière lui en bruit visible. Pour un espace entier fondu en un seul document lisible, [la conversion Confluence → Markdown de TransformPipe](/confluence-to-markdown) prend directement l’archive de l’export HTML et produit un document unique avec un sommaire, sans parcours de répertoire.

Ce qu’aucune des voies ci-dessous ne récupère : une macro qui exécutait une requête vivante — une macro de ticket Jira, une page incluse — revient sous la forme de ce qu’elle affichait le jour de l’export, et non sous forme de requête. Les commentaires de page n’entrent jamais dans un export HTML ou PDF. Et les ancres internes changent, parce que Confluence engendre des identifiants de titres qui incluent le titre de la page : un lien écrit selon l’ancien format d’identifiant cesse donc de se résoudre à l’instant où un autre moteur de rendu écrit les identifiants à sa façon.

## Pourquoi il n’existe pas d’export Markdown natif

Le contenu d’une page Confluence vit dans ce qu’Atlassian appelle le format de stockage : techniquement du XML plutôt que du XHTML strict, avec les éléments propres à Confluence dans un espace de noms `ac:` et les références de ressources — pièces jointes, liens de pages — dans un espace de noms `ri:`. Une macro est un `ac:structured-macro` avec un attribut de nom ; une image est un `ac:image` enveloppant un `ri:attachment` ; un lien vers une autre page est un `ac:link` enveloppant un `ri:page`. Rien de tout cela n’a d’équivalent en Markdown, parce que Markdown n’a aucune notion de macro — une macro est un comportement nommé et paramétré, alors que tout l’inventaire de Markdown se résume à de la mise en forme de texte statique.

Le menu d’export de Confluence propose donc des rendus du format de stockage à la place : Word, PDF, HTML, XML, et CSV pour un espace. Chacun d’eux est ce à quoi ressemble le format de stockage une fois rendu, à la fidélité que ce format d’export permet, et on atteint le Markdown en convertissant l’un de ces rendus une seconde fois.

## Comparatif rapide : les formats d’export, et ce qui survit à chacun

| Export | Portée | Permission requise | Ce qui en sort | Vaut-il d’être converti en Markdown ? |
| --- | --- | --- | --- | --- |
| Export vers Word | Une page | Quiconque a accès à la page | Un `.docx` que bien d’autres éditeurs rendent imparfaitement | Seulement via une conversion Word vers Markdown ; la structure survit, les faux titres non |
| Export vers PDF | Une page | Quiconque a accès à la page | Une page rendue, statique ; les commentaires ne sont jamais inclus | Non — une page rendue n’a plus de structure à extraire |
| Export d’espace, HTML | Tout l’espace | Administrateur d’espace | Une archive de fichiers HTML rendus, un par page, plus les pièces jointes | Oui — c’est la voie à suivre |
| Export d’espace, XML | Tout l’espace | Administrateur d’espace | Le XML du format de stockage propre à Confluence, pour réimport dans Confluence | Pas directement — il est fait pour Confluence, pas pour un convertisseur |
| Export d’espace, CSV | Tout l’espace | Administrateur d’espace | Le contenu en lignes de CSV, pièces jointes et commentaires inclus par défaut | Non — aplatit la structure dont une conversion Markdown a besoin |
| Une application du Marketplace | Page, arborescence ou espace, selon l’application | Ce qu’exige l’application | Du Markdown directement, dans la forme propre à l’application | Parfois — vérifiez la fiche actuelle ; plusieurs options gratuites existent |

Chaque portée et chaque exigence de permission de ce tableau vient de la documentation d’Atlassian : HTML, XML et CSV n’existent qu’en exports au niveau de l’espace et exigent la permission d’administrateur d’espace, et « seul le contenu qui vous est visible sera exporté » pour l’export d’un administrateur d’espace — un administrateur de site lançant le même export CSV ou XML obtient tout, restrictions de visibilité comprises (vérifié sur support.atlassian.com, le 14 septembre 2026). Les articles de blog sont laissés de côté par l’export PDF et HTML d’un espace, et les commentaires ne sont jamais inclus dans un export PDF, d’après la même page.

## L’export d’espace en HTML — la voie qui conserve la structure

Depuis la barre latérale de l’espace, Autres actions, Paramètres de l’espace, Général, Exporter l’espace, choisissez HTML. Ce qui revient est une archive : un fichier HTML par page, un dossier de pièces jointes, et un fichier d’index listant les pages.

| Avantages | Inconvénients |
| --- | --- |
| Du vrai balisage — titres, listes, tableaux et liens survivent en éléments, et non en pixels rendus | Exige la permission d’administrateur d’espace ; un auteur de page qui ne l’a pas ne peut pas lancer cet export lui-même |
| Les pièces jointes sont empaquetées à côté des pages qui les utilisent | La hiérarchie des pages ne vit que dans le fichier d’index — les noms de fichiers sont à plat, il faut donc reconstruire les dossiers à partir de lui si vous les voulez |
| Fonctionne hors ligne une fois téléchargé — plus aucune dépendance à la disponibilité de Confluence | Les macros se rendent dans le HTML qu’elles ont produit le jour de l’export, et non en quoi que ce soit que Markdown comprenne |

**Prix :** gratuit — l’export fait partie de Confluence lui-même, et tout convertisseur digne d’être lancé de l’autre côté est gratuit aussi.

**Détails techniques.** Les noms de fichiers exportés sont engendrés par la machine et illisibles pour un humain : identifier quel fichier correspond à quelle page suppose donc de lire l’index plutôt que la liste du répertoire. Les ancres de titres sont les identifiants engendrés par Confluence, qui incluent le titre de la page dans la chaîne de l’identifiant — un lien écrit contre `#TitreDePage-Titre` casse à l’instant où un autre convertisseur HTML vers Markdown engendre à la place un simple `#titre`, parce que les deux schémas d’identifiants ne concordent pas.

**Pour qui ?** Quiconque convertit plus de deux ou trois pages, et en particulier quiconque a besoin que le résultat soit plus qu’un instantané — le HTML est le seul format d’export assez dense pour qu’une véritable conversion récupère les tableaux, les liens et les listes plutôt qu’un paragraphe de texte agglutiné.

## Convertir le HTML : un vrai analyseur, pas une expression régulière

Une fois le HTML sorti, la seconde étape est une conversion HTML vers Markdown ordinaire — [le même travail](/html-to-markdown) que convertir n’importe quelle page web enregistrée — avec une ride propre à Confluence : le balisage est dense en styles en ligne préfixés `mso-` et en `div` d’enrobage de macros qu’un script naïf de retrait de balises laisse derrière lui en déchets visibles dans la sortie. Un vrai analyseur HTML qui construit un arbre et le parcourt, au lieu d’une suite de remplacements de chaînes, fait la différence entre du Markdown propre et un paragraphe plein de noms de classes égarés.

| Ce en quoi la macro s’est rendue | Ce que voit un convertisseur | Après conversion |
| --- | --- | --- |
| Panneau d’information, de note, d’avertissement, de conseil | Un `div` avec un nom de classe et une image d’icône | Un simple paragraphe — donnez-lui une convention de citation à la main |
| Macro de bloc de code | Un élément `pre`, souvent avec des spans de coloration syntaxique | Un bloc de code clôturé, généralement avec l’attribut de langage perdu |
| Macro de sommaire | Une liste rendue de liens d’ancres | Une liste de liens vers des ancres qui peuvent ne plus se résoudre après conversion |
| Macro d’arborescence ou d’affichage des pages enfants | Une liste rendue de liens ramenant au site Confluence en service | Des liens pointant vers Confluence, pas vers les fichiers convertis |
| Macro d’extrait ou d’inclusion | Le texte inclus, déjà inséré au moment de l’export | Du texte dupliqué, une fois par page qui l’incluait — impossible de le distinguer du contenu d’origine |
| Macro de ticket ou de filtre Jira | Un tableau instantané, ou un simple lien, selon le rendu propre à la macro | Un tableau figé au jour de l’export, ou un lien mort s’il s’est rendu en référence |
| Macro de bloc dépliable | Le contenu, déjà déplié dans l’export statique | Du contenu ordinaire — le comportement replier/déplier n’existe pas en Markdown |
| Macro de pièces jointes | Une liste de liens vers `/download/attachments/...` | Des liens qui exigent une session Confluence active pour se résoudre |

La ligne des pièces jointes est celle à vérifier avant de publier quoi que ce soit. Ces liens pointent vers le point d’accès de téléchargement propre à Confluence, qui attend que vous soyez connecté — une page qui a l’air complète tant que vous êtes connecté à Confluence affiche des cadres d’images cassées pour quiconque ne l’est pas, et un export d’espace empaquette les fichiers réels dans l’archive précisément pour que le convertisseur puisse réécrire ces liens vers les copies locales au lieu de les laisser pointer vers une URL gardée par une session.

**À quoi ressemble vraiment le HTML brut.** Un panneau de note n’est pas un `<blockquote>` — il ressemble plutôt à ceci, débarrassé des attributs qu’un dépouilleur naïf laisse derrière lui :

```html
<div class="confluence-information-macro confluence-information-macro-note">
  <span class="aui-icon aui-icon-small aui-iconfont-warning"></span>
  <div class="confluence-information-macro-body">
    <p>Deploys are frozen after Thursday.</p>
  </div>
</div>
```

Une expression régulière de retrait de balises là-dessus produit un paragraphe plus une ligne vide égarée à l’emplacement du `span` de l’icône. Un vrai analyseur reconnaît la classe du `div` d’enrobage, jette entièrement l’élément d’icône, et ne garde que le texte — ce qui résume tout l’argument en faveur d’un convertisseur qui construit un arbre plutôt que d’un convertisseur qui supprime des chevrons.

### Les ancres de titres : pourquoi un lien interne casse alors que la page tient

Confluence engendre l’identifiant d’un titre en combinant le titre de la page et le texte du titre, de sorte que deux pages avec un titre rédigé à l’identique n’entrent pas en collision, et un lien interne est écrit contre cet identifiant complet. Un convertisseur qui engendre les identifiants de la manière ordinaire — texte du titre en minuscules, espaces changés en traits d’union, rien d’autre — produit un identifiant différent pour le même titre : tout lien écrit sous la forme `#TitreDePage-NomDeSection` cesse donc de se résoudre alors même que la section elle-même s’est parfaitement convertie. La correction est mécanique une fois que l’on sait la chercher : après la conversion, réécrivez les liens internes contre l’identifiant engendré par le nouveau titre plutôt que de supposer que l’ancien a survécu.

## Déposer l’archive d’export directement, fondue en un seul document

Pour un espace dont la destination a toujours été un document lisible unique plutôt qu’un répertoire de fichiers doté d’une arborescence de pages fonctionnelle, [la conversion Confluence → Markdown de TransformPipe](/confluence-to-markdown) prend l’archive de l’export HTML de l’espace telle qu’elle sort de Confluence, convertit le HTML de chaque page avec le même convertisseur que celui de la page HTML vers Markdown, et fond toutes les pages dans l’ordre en un seul document doté d’un sommaire engendré.

| Avantages | Inconvénients |
| --- | --- |
| Aucun parcours de répertoire, aucun fichier d’index à lire à la main | Produit un seul document — ce n’est pas la forme voulue si chaque page doit rester un fichier à elle avec son URL |
| Chaque page dans l’ordre, avec un sommaire construit pour vous, et une pièce jointe qui est une image portée dans le document au lieu de pointer vers `/download/attachments/` | Ne reconstruit pas l’arborescence — rien ne le fait sans décider où les fichiers vivront — et une pièce jointe qui n’est pas une image garde le lien qu’elle avait |
| Tourne dans le navigateur ; l’archive n’est pas téléversée quand vous êtes déconnecté | Les pertes de macros sont identiques à toute autre voie HTML vers Markdown, puisque le HTML source est le même de toute façon |

**Prix :** gratuit, tourne localement.

**Pour qui ?** Un espace que l’on archive, un wiki transmis sous forme de document unique, ou tout cas où la personne qui lira le résultat tient davantage au contenu dans l’ordre qu’au fait que chaque page garde une URL à elle.

## Une application du Marketplace, si l’export Markdown colle mieux à votre façon de travailler

Plusieurs applications de l’Atlassian Marketplace exportent une page, une arborescence de pages ou un espace entier directement en Markdown, avec des options gratuites à côté des payantes (vérifié sur marketplace.atlassian.com, le 14 septembre 2026) — la catégorie existe et change assez souvent pour que nommer ici une application précise soit périmé en moins d’un an, ce qui est exactement pourquoi la voie exporter-puis-convertir ci-dessus vaut d’être connue quoi qu’il arrive : elle ne dépend de rien d’autre que de l’export intégré à Confluence et d’un convertisseur, dont aucun n’est un abonnement qui peut changer de tarif ou disparaître d’une fiche de marketplace.

| Avantages | Inconvénients |
| --- | --- |
| Du Markdown direct, sans étape de conversion HTML séparée | Ajoute une application du Marketplace au site, que quelqu’un doit approuver et maintenir |
| Certaines préservent automatiquement la hiérarchie des dossiers dans la sortie | Les paliers gratuits et les jeux de fonctionnalités changent ; vérifiez la fiche actuelle plutôt que de vous fier à un vieil avis |
| Peut être plus rapide pour l’export ponctuel d’une seule page | Un palier payant est souvent nécessaire pour un espace entier plutôt que pour une page |

**Pour qui ?** Une équipe qui installe déjà librement des applications du Marketplace et veut du Markdown en une étape, plutôt qu’une chaîne d’export et de conversion qu’elle entretient elle-même.

## La différence Confluence Server et Data Center

Tout ce qui précède à propos de la boîte de dialogue d’export décrit Confluence Cloud. Les instances Server et Data Center ont le même format de stockage sous-jacent et la même catégorie d’export HTML d’espace, mais le chemin de menu exact et le modèle de permissions exact varient selon la version et — puisqu’il n’existe pas par défaut sur ces instances d’équivalent scripté à l’Automation de Jira — se tourner vers une application du Marketplace (ScriptRunner est un choix courant, spécifiquement sur Server et Data Center) est plus souvent la voie pratique pour tout ce qui dépasse la boîte de dialogue d’export intégrée. Si votre instance est Server ou Data Center, vérifiez les options d’export dans votre propre console d’administration plutôt que de supposer que le chemin de menu du Cloud s’applique tel quel.

## Comment choisir

1. **Confirmez que l’export HTML vous est accessible avant de bâtir un plan autour.** Il exige la permission d’administrateur d’espace ; si vous ne l’avez pas, la première étape pratique consiste à demander à celui qui l’a, pas à chercher un contournement.
2. **Décidez si la destination est un ensemble de fichiers séparés ou un seul document.** Des fichiers séparés avec chacun son URL appellent la chaîne exporter-puis-convertir, gardée à un fichier par page. Un document unique appelle la voie de fusion.
3. **Repérez les macros qui étaient des requêtes vivantes avant de convertir quoi que ce soit.** Une macro de ticket Jira ou une macro d’arborescence se rend en instantané ; si la version vivante compte, notez-la à part avant que l’export n’en capture une copie figée.
4. **Lisez intégralement une page convertie avant de faire confiance au reste.** Les liens de pièces jointes, les ancres de titres et les `div` rendus par les macros sont les trois choses qui ont l’air correctes dans une comparaison et fausses à la lecture.

Si l’obstacle se révèle être le coût plutôt que la mécanique — quelles fiches du Marketplace sont réellement gratuites plutôt que gratuites à l’essai, et quelles voies exigent un administrateur — [le comparatif des convertisseurs Confluence gratuits](/blog/free-confluence-to-markdown-converter) y répond séparément.

## Conclusion

Confluence vers Markdown est une conversion en deux temps qui porte le nom d’un export en un temps : choisissez la sortie HTML, parce que c’est la seule assez dense pour bien se convertir, puis passez dessus une véritable étape HTML vers Markdown plutôt qu’un script de remplacements de chaînes. Ce qui survit, c’est tout ce que le format de stockage exprimait en structure statique — titres, listes, tableaux, liens ; ce qui ne survit pas, c’est tout ce qui relevait du comportement vivant d’une macro plutôt que de son rendu le jour de votre export. Pour un espace entier destiné à devenir un document unique, sautez le parcours de répertoire et confiez l’archive d’export à un convertisseur qui la fond directement. [Comment Notion et Obsidian se comparent](/blog/markdown-from-notion-obsidian-and-confluence) sur le même problème d’export puis de réparation vaut la lecture si Confluence n’est pas la seule source en jeu.

## FAQ

### Puis-je exporter une page Confluence directement en Markdown ?

Pas avec ce qui est intégré à Confluence. Chaque export natif — Word, PDF, HTML, XML, CSV — est un rendu différent du format de stockage propre à la page, et aucun n’est du Markdown ; y arriver suppose de convertir l’un de ces exports une seconde fois, ou d’installer une application du Marketplace qui fait les deux étapes pour vous.

### Quel format d’export Confluence faut-il convertir ?

Le HTML. C’est le seul export assez dense pour conserver les titres, les listes, les tableaux et les liens sous forme de vrai balisage plutôt que de texte aplati ou de pixels rendus, ce dont un convertisseur HTML vers Markdown a besoin pour faire du bon travail.

### Faut-il être administrateur d’espace pour exporter un espace Confluence ?

Oui, pour les exports d’espace en HTML, XML et CSV précisément — l’export Word ou PDF d’une seule page ne demande que l’accès dont vous disposez déjà pour lire cette page. Si vous n’êtes pas administrateur d’espace, exporter tout un espace revient à le demander à quelqu’un qui l’est.

### Qu’advient-il des macros de tickets Jira et des autres contenus vivants lors d’un export ?

Elles gèlent. Une macro de ticket Jira, un affichage d’arborescence de pages, un extrait inclus — chacun s’exporte tel qu’il s’est rendu le jour de l’export, un instantané plutôt qu’une requête, et rien dans le format d’export ne le garde vivant.

### Pourquoi mes images converties apparaissent-elles en liens cassés ?

Parce que les liens de pièces jointes en ligne de Confluence pointent vers des URL `/download/attachments/...` qui attendent une session active et authentifiée. Un export d’espace empaquette les fichiers de pièces jointes réels dans son archive précisément pour cela — la correction consiste à réécrire les liens vers ces fichiers locaux, et non vers les URL Confluence d’origine.

### Puis-je convertir une page Confluence sans la téléverser nulle part ?

Oui, si le convertisseur tourne dans votre navigateur au lieu d’envoyer le fichier à un serveur — cela vaut d’être confirmé pour tout ce qui ne devrait pas quitter votre machine, en surveillant le panneau réseau pendant la conversion.

### Pourquoi les liens internes cassent-ils après la conversion d’une page Confluence ?

Parce que Confluence engendre les identifiants de titres à partir du titre de la page et du texte du titre réunis, alors qu’un convertisseur HTML vers Markdown standard engendre un identifiant plus simple à partir du seul texte du titre. La section s’est tout de même bien convertie — seul l’identifiant a changé — et la correction consiste donc à réécrire le lien contre le nouvel identifiant, pas à reconvertir le contenu.

### Confluence Server ou Data Center diffère-t-il du Cloud sur ce point ?

Le format de stockage et l’export HTML sont la même idée des deux côtés, mais le chemin de menu exact, le modèle de permissions et les applications du Marketplace disponibles varient selon la version et l’édition. Server et Data Center s’appuient plus souvent sur une application du Marketplace telle que ScriptRunner pour tout ce qui dépasse la boîte de dialogue d’export intégrée, faute d’une règle d’Automation à la mode Cloud sur laquelle se rabattre.
