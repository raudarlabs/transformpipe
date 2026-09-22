---
title: "Des images et des liens qui fonctionnent encore après l’envoi du fichier"
description: "Chemins relatifs, URL raw GitHub, data URI, texte alternatif, SVG et ancres : pourquoi une image ou un lien Markdown casse quand le fichier change de place"
updated: 2026-09-09
date: 2026-08-01
tag: Syntaxe
keywords: image markdown, image markdown ne s’affiche pas, lien relatif markdown, lien ancre markdown, lien vers un titre markdown, image base64 markdown, html autonome, html en un seul fichier, taille image markdown, texte alternatif markdown, url image github raw, image svg markdown, vérifier les liens morts markdown
---

Un fichier Markdown s’écrit à l’intérieur d’un dossier, et la moitié de son contenu dépend discrètement de ce dossier. `![Flow](img/flow.png)` a l’air correct dans l’éditeur, a l’air correct dans le dépôt, et affiche une icône d’image cassée à la seconde où un collègue ouvre le HTML converti depuis son dossier de téléchargements. Rien n’a changé dans le fichier. Ce sont ses voisins qui ont changé.

### En bref

Les images et les liens internes se résolvent par rapport à l’endroit où la page affichée atterrit, pas par rapport au dossier dans lequel vous avez écrit : déplacer le fichier déplace donc la réponse. Les URL absolues publiques et les data URI survivent au voyage ; les chemins relatifs et relatifs à la racine n’y survivent que si le dossier ou le site voyage avec eux. Les ancres de titres, elles, cassent pour une autre raison — GitHub, Pandoc, markdown-it et marked transforment chacun un titre en identifiant à leur manière, si bien qu’un lien qui fonctionne dans le dépôt peut tomber à côté dans l’export. Convertissez une fois, lisez les valeurs `src` et `href` que le convertisseur a réellement produites, et corrigez celles qui ne se résolvent que depuis votre propre bureau.

Cette panne a une signature : l’auteur ne la voit jamais. Sur la machine où le document a été écrit, chaque chemin se résout, puisque c’est précisément pour cette machine qu’il a été écrit. Le lecteur, lui, reçoit des rectangles gris ornés d’une icône au coin déchiré, en conclut que le document est à moitié terminé, et n’en dit généralement rien.

Deux systèmes distincts sont en jeu, et ils échouent pour des raisons qui n’ont rien à voir entre elles. Une image est une référence vers des octets rangés ailleurs, et elle casse quand cet ailleurs change de place. Une ancre est une référence vers un identifiant que le moteur de rendu a inventé pendant la conversion, et elle casse quand un autre moteur en invente un différent. Toutes deux sont des promesses à propos d’un lieu, et toutes deux sont vérifiées au moment où quelqu’un d’autre ouvre le fichier — c’est-à-dire au pire moment possible pour l’apprendre.

## Les trois sortes de chemin, et ce que chacune supporte

Une URL dans du Markdown prend quelques formes, et chacune suppose autre chose sur l’endroit où le document va atterrir.

| Écrit comme | Sorte | Résolu par rapport à | Supporte d’être envoyé ? |
| --- | --- | --- | --- |
| `img/flow.png` | relatif | le dossier depuis lequel la page est servie | seulement si ce dossier voyage aussi |
| `../assets/flow.png` | relatif | le dossier au-dessus | pareil, avec un cran de fragilité en plus |
| `/assets/flow.png` | relatif à la racine | la racine du site courant | seulement à l’intérieur de ce même site |
| `https://example.com/flow.png` | absolu | rien, elle est déjà complète | oui, tant que l’hôte la sert |
| `data:image/png;base64,…` | aucune — les octets sont là | rien du tout | oui, au prix du poids |

Le détail qui piège tout le monde : un lien relatif en Markdown se résout par rapport à l’URL de la *page affichée*, pas par rapport au dossier où vivait le fichier `.md`. Convertissez `docs/guide.md`, ouvrez le HTML depuis votre bureau, et `img/flow.png` désigne désormais un dossier `img` sur votre bureau. Le chemin n’a jamais été faux ; il répondait à une question que plus personne ne pose.

Le relatif à la racine est la forme que l’on juge le plus souvent de travers. Une barre oblique en tête ne signifie pas « le sommet de mon projet » — elle désigne la racine de l’origine qui sert la page à cet instant. Déployez le même fichier sur un site dont les ressources vivent sous `/assets/`, et c’est la plus stable des formes relatives. Ouvrez-le comme fichier local, et le navigateur lit cette barre comme la racine du disque : `/assets/flow.png` devient `C:\assets\flow.png` sous Windows et `/assets/flow.png` sur un Mac, et aucun des deux n’existe. Les chemins relatifs à la racine sont faits pour des sites. Pour un fichier que quelqu’un télécharge, ils sont franchement pires que de simples chemins relatifs.

Les URL absolues supportent tout, sauf la disparition de l’hôte. C’est la seule forme qui fonctionne à l’identique dans un dépôt, dans un export, dans un wiki et dans un courriel — à condition que l’hôte soit public, qu’il reste debout, et qu’il ne s’oppose pas à être appelé depuis ailleurs. Cette dernière condition travaille bien plus qu’il n’y paraît : les images servies depuis un bucket privé, depuis le CDN d’un outil de discussion, depuis une pièce jointe Confluence ou derrière une URL signée renvoient toutes une adresse d’allure absolue qui ne fonctionne que tant que le lecteur porte votre session, ou tant que la signature n’a pas expiré.

### Là où le fichier finit, et quels chemins se résolvent encore

Le même document passe par cinq endroits au cours de sa vie. Voici ce qui arrive à chaque sorte de chemin à chaque étape.

| Destination | `img/flow.png` | `../assets/flow.png` | `/assets/flow.png` | `https://…/flow.png` | Data URI |
| --- | --- | --- | --- | --- | --- |
| Le `.md` affiché sur une page de dépôt | fonctionne | fonctionne, si le dossier parent est dans le dépôt | échoue — se résout par rapport à la racine de l’hébergeur de code | fonctionne | fonctionne |
| Un fichier HTML converti dans les téléchargements de quelqu’un | échoue, sauf si vous avez copié `img/` aussi | échoue | pointe vers la racine de son disque | fonctionne, avec une connexion | fonctionne |
| Le corps d’un courriel | échoue | échoue | échoue | seulement si le logiciel accepte d’aller chercher les images distantes | fonctionne |
| Un site statique avec les ressources déployées à côté | fonctionne | fonctionne, jusqu’à ce que vous déplaciez la page | fonctionne | fonctionne | fonctionne |
| Un PDF imprimé depuis le navigateur | figé dedans seulement s’il s’était résolu au moment de l’impression | pareil | pareil | pareil | fonctionne |
| Collé dans un wiki ou un ticket | échoue | échoue | échoue | fonctionne si l’hôte est public | en général retiré par l’assainisseur du wiki |

La ligne du PDF mérite qu’on s’y arrête. Imprimer ne répare pas un chemin cassé, cela le photographie : ce que le navigateur avait à cet instant est ce qui atterrit dans le fichier, donc un document imprimé sur la machine de l’auteur est parfait, et le même document imprimé par le destinataire est troué exactement aux mêmes endroits que son écran. Si la destination est un PDF, réglez d’abord les images : l’impression suppose que la page s’affiche déjà.

### GitHub : une URL blob est une page, pas une image

Ouvrez une image dans un dépôt, copiez ce qui se trouve dans la barre d’adresse, et vous obtenez quelque chose comme `https://github.com/acme/docs/blob/main/assets/flow.png`. Collez cela dans `![Flow](…)` et le lecteur obtient une image cassée, parce que cette URL ne renvoie pas un PNG. Elle renvoie une page HTML — la visionneuse de fichiers, avec son en-tête, son fil d’Ariane, sa barre latérale et l’image à l’intérieur. Le navigateur a demandé une image et a reçu une page web : il a donc dessiné l’icône d’image cassée.

| Forme de l’URL | Ce que le serveur renvoie | Utilisable dans `![]()` ? |
| --- | --- | --- |
| `https://github.com/o/r/blob/main/a/flow.png` | une page HTML qui affiche l’image | non |
| `https://github.com/o/r/blob/main/a/flow.png?raw=true` | une redirection vers les octets du fichier | oui |
| `https://raw.githubusercontent.com/o/r/main/a/flow.png` | les octets du fichier | oui |
| `assets/flow.png`, relatif, dans un `.md` du dépôt | résolu par rapport au dossier du fichier lui-même | oui, sur la page du dépôt |

La recommandation de GitHub lui-même est de préférer les liens relatifs pour les images qui vivent dans le dépôt, et il donne `../blob/main/assets/images/electrocat.png?raw=true` comme la forme à employer dans les tickets, les pull requests et les commentaires — en avertissant que ces formes ne fonctionnent, dans un dépôt privé, que pour un lecteur qui y a déjà un accès en lecture (vérifié sur docs.github.com, le 9 septembre 2026).

Deux autres pièges habitent ces URL. Le nom de la branche fait partie de l’adresse : `…/blob/main/…` suit donc `main` et bouge quand `main` bouge, tandis que `…/blob/a1b2c3d/…` est épinglé à un commit et ne change jamais — choisissez exprès, car un schéma qui se met à jour en silence est soit exactement ce que vous vouliez, soit un document qui cite une image ne correspondant plus à sa prose. Et une URL raw issue d’un dépôt privé n’est pas une URL publique ; elle a besoin de la session du lecteur, exactement comme une pièce jointe de messagerie instantanée, ce qui explique qu’une capture collée depuis Slack s’affiche pour vous et pour personne d’autre.

## Pourquoi une image Markdown ne s’affiche pas

Quand une image Markdown n’apparaît pas, la cause est presque toujours l’une de celles-ci.

- **Le chemin pointe vers l’ancien emplacement.** Déplacez le fichier, déplacez les images, ou passez aux URL absolues.
- **La casse ne correspond pas.** `Diagram.PNG` et `diagram.png` ne font qu’un seul fichier sur un disque Mac ou Windows, qui ignore la casse par défaut, et deux fichiers sur la machine Linux qui sert votre site.
- **Il y a une espace dans le nom du fichier.** Entourez la cible de chevrons, `![Flow](<my diagram.png>)`, ou encodez-la en pourcentages : `my%20diagram.png`.
- **L’image est derrière une authentification.** Les URL collées depuis un outil de discussion, un dépôt privé ou un wiki réclament en général la session du lecteur ; un inconnu n’obtient rien.
- **Vous avez lié une page plutôt qu’un fichier.** C’est le cas de l’URL blob ci-dessus, et la même erreur se produit avec les espaces de stockage en ligne, qui distribuent une URL de visionneuse au lieu des octets.
- **La page est en HTTPS et l’image en HTTP.** Les navigateurs bloquent le contenu mixte, silencieusement, et la console est le seul endroit où cela se dit.
- **Un assainisseur a supprimé la balise.** Une liste blanche qui autorise `img` peut tout de même refuser une source `data:` ou un élément `svg`, et ce qu’elle refuse, elle l’efface.
- **La balise n’en a jamais été une.** Un `\!` échappé, une image à l’intérieur d’un bloc de code délimité, ou une apostrophe inverse égarée, et le moteur de rendu a produit du texte qui ressemble à une balise d’image parce que c’en est une.

Le moyen le plus rapide de les distinguer est d’arrêter de deviner et d’interroger le navigateur. Ouvrez la page, ouvrez l’onglet réseau, rechargez, et lisez le code de statut de l’image qui a échoué.

| Ce que vous voyez | Ce que dit l’onglet réseau | Signifie en général |
| --- | --- | --- |
| Icône cassée, texte alternatif visible | 404 | le chemin est faux pour l’endroit depuis lequel la page est servie |
| Icône cassée | 403 | dépôt privé, URL signée expirée, ou protection contre les liens directs |
| Icône cassée | 200 avec `text/html` | vous avez lié une page, pas un fichier |
| Rien, aucune requête du tout | aucune entrée | échappé, retiré par l’assainisseur, ou à l’intérieur d’un bloc de code |
| Correct chez vous, cassé chez eux | 200 chez vous | l’image est derrière votre session |

Ce tableau est aussi la raison de vérifier le fichier *converti* plutôt que l’aperçu de l’éditeur. Un aperçu résout les chemins par rapport au dossier où se trouve la source, et c’est précisément l’hypothèse qui cesse de tenir dès que le document se met à voyager.

## Les data URI, et l’arithmétique qui va avec

Un data URI met les octets dans le document : une image Markdown en base64 est une image ordinaire dont le fichier encodé occupe la place du chemin.

```markdown
![Company logo](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...)
```

Le compromis, honnêtement : base64 encode trois octets en quatre caractères, donc l’image grossit d’environ un tiers avant même de compter le reste du document. Une capture d’écran de 2 Mo arrive sous la forme de quelque 2,7 Mo de texte planté au milieu de votre prose, impossible à comparer d’une version à l’autre, et renvoyé avec chaque copie. Les navigateurs ne peuvent pas non plus la mettre en cache séparément.

Faites le calcul avant de décider, car le facteur est fixe et les nombres deviennent vite désagréables. Base64 lit trois octets et écrit quatre caractères : 4/3 est donc le plancher — environ 33 % d’augmentation — et le remplissage, plus un éventuel retour à la ligne, pousse un peu au-delà.

| L’image sur le disque | Encodée en base64 | Ce que cela veut dire en pratique |
| --- | --- | --- |
| icône de 12 Ko | environ 16 Ko | gratuit ; en intégrer des dizaines sans s’en apercevoir |
| schéma de 120 Ko | environ 160 Ko | confortable |
| capture d’écran de 800 Ko | environ 1,1 Mo | trois de celles-ci dominent le document |
| photographie de 2 Mo | environ 2,7 Mo | une seule image constitue désormais l’essentiel du fichier |
| photographie de 4 Mo | environ 5,4 Mo | à elle seule au-delà de la plupart des limites raisonnables |

Ces limites sont réelles et non théoriques. Le convertisseur de ce site plafonne une conversion unique à 10 Mo et un document conservé dans un compte à 4 Mo, parce que la fonction Vercel qui se trouve dessous rejette tout corps de requête ou de réponse dépassant 4,5 Mo avec un 413 (vérifié sur vercel.com, le 9 septembre 2026). Chaque configuration d’hébergement a un nombre de ce genre quelque part, et base64 est le moyen le plus rapide de le trouver.

Les autres coûts ne se mesurent pas en octets. Une image intégrée ne peut pas être mise en cache séparément : un lecteur qui ouvre le document deux fois la télécharge deux fois. Elle ne peut pas être comparée d’une version à l’autre : changez un pixel, et l’historique du gestionnaire de versions enregistre une modification de mille lignes sans le moindre contenu lisible. Elle ne peut pas être remplacée sans éditer le fichier de prose. Et chaque transfert, chaque réponse, chaque copie l’emporte à nouveau en entier.

Cela réserve les data URI à un ensemble étroit de cas : une icône, un logo, un petit schéma, une signature, un graphique dans un document qui doit voyager seul et arriver complet. Pour les documents chargés de captures d’écran, hébergez les images et utilisez des URL absolues — ou acceptez que le document soit désormais un fichier de 15 Mo, et envoyez-le délibérément plutôt que par accident.

L’échange vaut malgré tout la peine plus souvent qu’on ne le croit, parce que ce que vous récupérez, c’est un fichier sans aucune dépendance. [Ce que « autonome » promet réellement](/blog/self-contained-html-explained), c’est une page dont les styles sont déjà à l’intérieur ; mettez-y aussi les images et vous obtenez un document qui s’affiche à l’identique sur un portable dans un hôtel sans connexion, sur une machine d’entreprise verrouillée qui bloque les hôtes inconnus, et dans trois ans, quand le bucket où vivaient les images aura été supprimé. Rien d’autre sur cette page ne vous offre cela.

## Texte alternatif, dimensions, SVG et thème : les attributs que Markdown n’a pas

La syntaxe d’image de Markdown a exactement trois emplacements — une URL, un texte alternatif et un titre facultatif — et tout ce que les gens attendent d’autre d’une image vit en dehors. C’est par cette faille que le HTML brut entre dans un fichier Markdown, et le HTML brut est l’endroit où les convertisseurs commencent à se contredire.

### Le texte alternatif, c’est ce que lit un lecteur d’écran

Le texte alternatif n’est pas une légende. Une légende est visible de tous et se tient à côté de l’image ; le texte alternatif remplace l’image pour un lecteur qui n’en reçoit pas. MDN le dit sans détour : l’attribut contient un remplacement textuel de l’image, et les lecteurs d’écran énoncent sa valeur pour que leurs utilisateurs sachent ce que l’image signifie (vérifié sur developer.mozilla.org, le 9 septembre 2026). C’est aussi ce que le navigateur dessine dans le vide quand le chemin est faux, ce qui en fait la chose la plus utile qui soit dans un document dont les images sont cassées.

Écrivez donc ce que l’image *dit*, et non ce qu’elle *est*. « Schéma d’architecture » n’apprend rien à quelqu’un qui écoute. « Les requêtes arrivent dans la file, un worker écrit dans le stockage, l’API y lit » est exactement l’information que le lecteur voyant tire du schéma en deux secondes.

L’exception, c’est une image qui ne dit rien : un séparateur, une cale, une fioriture décorative. Pour celles-là, une chaîne vide est le choix correct et délibéré. MDN : mettre `alt=""` indique que cette image n’est pas un élément essentiel du contenu — c’est une décoration ou un pixel espion — et que les navigateurs non visuels peuvent l’omettre ; les navigateurs visuels, eux, masquent en plus l’icône d’image cassée quand l’attribut alt est vide et que l’image n’a pas pu s’afficher (vérifié sur developer.mozilla.org, le 9 septembre 2026). Un alt vide, ce sont deux gains d’un coup : le lecteur d’écran reste silencieux, et une image décorative cassée ne laisse aucune cicatrice sur la page.

Le troisième emplacement de Markdown est le titre. `![Flow](img/flow.png "Figure 3: the ingest path")` place cette chaîne entre guillemets dans un attribut `title`, et la plupart des convertisseurs le restituent fidèlement. Presque rien d’utile ne se produit ensuite. Un `title` apparaît en infobulle au survol : il est donc invisible sur tout appareil tactile, peu fiable avec les technologies d’assistance, et entièrement disparu si la liste blanche de l’assainisseur ne comprend pas cet attribut. Traitez-le comme une décoration. Si les mots comptent, mettez-les dans la prose en dessous, où chaque lecteur les recevra.

| Vous écrivez | Ce qui en sort | Qui le reçoit vraiment |
| --- | --- | --- |
| `![Ingest path](flow.png)` | `alt="Ingest path"` | les utilisateurs de lecteurs d’écran, et quiconque dont l’image a échoué |
| `![](rule.png)` | `alt=""` | personne, à dessein — aucune annonce, aucune icône cassée |
| `![Ingest path](flow.png "Figure 3")` | `alt="Ingest path" title="Figure 3"` | un survol à la souris, si l’attribut a survécu |
| Une ligne en italique sous l’image | un paragraphe ordinaire | tout le monde, toujours |

### Les dimensions : aucune syntaxe, alors on se rabat sur HTML

Ni CommonMark ni GitHub Flavored Markdown n’ont de largeur. Il n’existe pas de `![Flow](flow.png){width=400}`, pas de pourcentage, pas de `=400x`. Certains éditeurs implémentent leur propre extension de dimensionnement, et une extension n’est pas une spécification : partout où elle n’est pas implémentée, le lecteur voit les caractères littéraux au milieu de la phrase.

Le réflexe habituel est donc le HTML brut, `<img src="flow.png" width="400" alt="Ingest path">`, et cela connaît trois fins possibles selon le convertisseur.

| Le convertisseur | Ce qui arrive à `<img … width="400">` |
| --- | --- |
| Laisse passer le HTML brut | cela fonctionne, et tout le reste du fichier aussi |
| Échappe le HTML brut par défaut | le lecteur voit la balise sous forme de texte visible |
| Assainit contre une liste blanche | l’`img` survit, le `width` peut-être pas, et l’image s’affiche en taille réelle |

Le troisième cas est celui qui déroute, parce qu’il fonctionne à moitié. L’image apparaît, à la taille où elle a été enregistrée, et rien nulle part ne signale qu’un attribut a été écarté. Une liste blanche est une liste de ce qui est permis : un attribut auquel personne n’a pensé est donc simplement absent — comportement correct pour un dispositif de sécurité, et déconcertant pour un auteur. C’est l’argument le plus net en faveur d’[écrire le fragment en HTML dès le départ](/blog/markdown-vs-html) quand un document dépend réellement de sa mise en page.

La réponse durable consiste à redimensionner le fichier. Un schéma qui sera affiché à 400 pixels, enregistré à 400 pixels, n’a besoin d’aucun attribut, ne peut en perdre aucun, pèse moins lourd à envoyer, et sera plus net que la même image réduite par un navigateur. Corriger dans l’image, c’est une correction qui survit à tous les convertisseurs.

### SVG : en ligne contre lié, et par où le script entre

Un SVG n’est pas un fichier image au sens où les autres le sont. C’est du XML, et le format comprend son propre élément `<script>` — MDN le décrit comme l’équivalent SVG de celui de HTML, utilisant `href` plutôt que `src` (vérifié sur developer.mozilla.org, le 9 septembre 2026) — auquel s’ajoutent des attributs d’événement et la capacité de référencer des ressources externes.

Que cela importe ou non dépend entièrement de la façon dont le fichier entre dans le document.

Référencé comme une image, c’en est une, et le navigateur le traite comme telle. La liste de restrictions que MDN dresse pour un SVG utilisé comme image est explicite : JavaScript est désactivé, les ressources externes telles qu’images et feuilles de style ne peuvent pas être chargées, les styles de liens `:visited` ne sont pas rendus, et l’apparence native des widgets de la plateforme est désactivée. Ces restrictions s’appliquent quand le SVG est chargé via `<img>`, un `background-image` en CSS, un `drawImage()` sur un canvas et d’autres contextes semblables — et elles ne s’appliquent pas quand le fichier est ouvert directement ou intégré via `<iframe>`, `<object>` ou `<embed>` (vérifié sur developer.mozilla.org, le 9 septembre 2026).

Placé en ligne, ce n’est plus du tout une image. Coller le balisage `<svg>…</svg>` dans votre Markdown range ces éléments dans le DOM de la page elle-même, où ses scripts sont les scripts de la page et où ses identifiants peuvent entrer en collision avec ceux de la page. Et le mettre en ligne est précisément ce que les gens font, parce que c’est le seul moyen de styler un schéma avec le CSS de la page pour qu’il suive le thème.

| | `<svg>…</svg>` en ligne | `<img src="chart.svg">` |
| --- | --- | --- |
| Voyage à l’intérieur du fichier | oui | non, sauf si la source est un data URI |
| Stylable par le CSS de la page | oui | non |
| Les scripts qu’il contient peuvent s’exécuter | oui | non — désactivés pour un SVG-comme-image |
| Survit à un assainisseur | dépend de la liste blanche | en général oui, c’est un `img` ordinaire |
| Sûr à accepter d’un inconnu | non | traitez-le comme une image |

La règle qui en découle est courte : un SVG que vous avez dessiné convient dans les deux cas ; un SVG venu d’ailleurs — un badge, un jeu d’icônes, un graphique produit par un outil, un schéma envoyé par un client — doit être référencé et non mis en ligne. Si vous devez malgré tout l’intégrer, ouvrez-le d’abord dans un éditeur de texte et lisez-le. C’est du XML. Vous pouvez voir tout ce qu’il fait.

### Des images qui suivent le thème du lecteur

Un schéma aux traits noirs sur fond transparent disparaît sur une page sombre, et à peu près la moitié de vos lecteurs ont désormais une page sombre. La réponse des standards est l’élément `<picture>` : zéro ou plusieurs éléments `<source>` suivis d’exactement un `<img>`, où chaque source porte une condition `media`, où le navigateur retient la première qui correspond, et où l’`<img>` sert de repli quand aucune ne correspond. Le texte alternatif se met sur l’`<img>`, pas sur le `<picture>` (vérifié sur developer.mozilla.org, le 9 septembre 2026).

```html
<picture>
  <source srcset="flow-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="flow-light.png" media="(prefers-color-scheme: light)">
  <img src="flow-light.png" alt="Requests hit the queue, a worker writes to the store">
</picture>
```

GitHub prend en charge cette forme pour les images propres à un thème, et a déprécié en sa faveur son approche antérieure, qui consistait à accoler `#gh-dark-mode-only` ou `#gh-light-mode-only` à l’URL de l’image (vérifié sur github.blog, le 9 septembre 2026). Si vous avez cette syntaxe de fragment dans un vieux README, ses jours sont comptés.

Deux réserves, toutes deux venues de plus haut dans cette section. C’est du HTML brut : il connaît donc les trois mêmes sorts qu’un attribut `width` — laissé passer, échappé, ou partiellement assaini. Et un assainisseur qui autorise `img` n’autorise pas forcément `picture` et `source`, auquel cas ce que reçoit votre lecteur est le repli — bon argument pour faire du repli la version à fond clair, celle qui reste lisible sur du blanc, et pour placer le texte alternatif là où il doit être.

Il existe aussi une solution qui ne demande aucun HTML : donnez au schéma un fond explicite et une encre de valeur moyenne, pour qu’il se lise aussi bien sur du blanc que sur de l’anthracite. Une image qui n’a pas besoin de connaître le thème ne peut pas se tromper de thème, et elle survit à tous les convertisseurs, à tous les assainisseurs et à tous les logiciels de courrier de cette page.

## Les liens d’ancre, et la fabrication du slug

Un lien d’ancre en Markdown est un lien vers un titre du même document : `[see below](#installing-the-cli)`. L’identifiant visé est engendré à partir du texte du titre, et la recette est à peu près la même partout. Mettre le texte en minuscules, retirer la ponctuation, changer les suites d’espaces en traits d’union, et ajouter un nombre quand deux titres se télescopent.

À peu près la même n’est pas la même, et c’est la raison pour laquelle un sommaire qui fonctionne parfaitement dans le dépôt arrive chez le lecteur avec la moitié de ses entrées inertes. Chaque moteur de rendu implémente sa propre fonction de slug, et les écarts sont assez petits pour que la plupart des liens survivent, assez grands pour que certains n’y parviennent pas.

GitHub documente sa règle en une phrase : les lettres sont converties en minuscules, les espaces sont remplacées par des traits d’union, et tout autre caractère d’espacement ou de ponctuation est supprimé (vérifié sur docs.github.com, le 9 septembre 2026). Pandoc documente une recette plus longue, et l’une de ses étapes ne ressemble à celle de personne d’autre : il supprime tout ce qui précède la première lettre, car un identifiant ne peut pas commencer par un chiffre ni par un signe de ponctuation, si bien que `## 3. Applications` devient `applications` et non `3-applications`. Les titres en doublon reçoivent `-1`, puis `-2`, et s’il ne reste rien après ce dépouillement, l’identifiant est `section` (vérifié sur pandoc.org, le 9 septembre 2026). Activer `gfm_auto_identifiers` fait passer Pandoc à la méthode de GitHub : espaces en tirets, majuscules en minuscules, ponctuation autre que `-` et `_` supprimée, émojis remplacés par leur nom.

Les bibliothèques JavaScript sont plus étranges encore, car deux des plus répandues ne produisent aucun identifiant tant qu’on ne le demande pas. marked a retiré ses options `headerIds` et `headerPrefix` en v8.0.0 et renvoie au paquet distinct `marked-gfm-heading-id` ceux qui les veulent (vérifié sur marked.js.org, le 9 septembre 2026). markdown-it n’émet pas non plus d’identifiants de titres de lui-même ; la réponse habituelle est markdown-it-anchor, qui se décrit comme un greffon ajoutant un attribut `id` aux titres et, au choix, des permaliens, qui distingue les doublons par un suffixe numérique commençant à 1, et qui vous laisse remplacer entièrement la fonction de slug ; il est gratuit, publié sous licence Unlicense (vérifié sur github.com, le 9 septembre 2026).

| Titre dans la source | GitHub | Pandoc, par défaut | Pandoc + `gfm_auto_identifiers` | markdown-it + markdown-it-anchor | marked, sans extension |
| --- | --- | --- | --- | --- | --- |
| `## Installing the CLI` | `installing-the-cli` | `installing-the-cli` | `installing-the-cli` | `installing-the-cli` | aucun identifiant émis |
| `## 3. Applications` | `3-applications` | `applications` | `3-applications` | ce que fait la fonction de slug | aucun identifiant émis |
| `## Maître d'hôtel` | `maître-dhôtel` | `maître-dhôtel`, ou `maitre-dhotel` avec `ascii_identifiers` | `maître-dhôtel` | dépend de la fonction de slug | aucun identifiant émis |
| `## Notes` apparaissant deux fois | un suffixe numérique | `notes`, puis `notes-1` | un suffixe numérique | `notes`, puis `notes-1` | aucun identifiant émis |
| La ponctuation, en général | supprimée sauf les traits d’union | supprimée sauf `_`, `-` et `.` | supprimée sauf `-` et `_` | configurable | — |

La ligne qui coûte le plus cher est celle des nombres. La documentation regorge de `## 1. Prerequisites` et de `## 2. Installing`, et un sommaire construit pour GitHub vise `#1-prerequisites` tandis qu’une compilation Pandoc produit `#prerequisites`. Chaque lien de la liste tombe à côté. Rien ne signale d’erreur : un fragment qui ne correspond à aucun identifiant n’est pas un échec en HTML, c’est une demande de défiler vers rien, et le navigateur l’exauce en restant exactement où il est. Le lecteur clique, rien ne bouge, et il en conclut que la page est cassée d’une manière vague qu’il ne saurait décrire.

L’autre divergence silencieuse est le préfixe. Ce site préfixe chaque identifiant de titre par `doc-` : `## Installing the CLI` devient donc `id="doc-installing-the-cli"` et le lien doit s’écrire `#doc-installing-the-cli`. Ce préfixe existe pour tenir les identifiants à l’écart du terrain du DOM clobbering, qui est le même raisonnement que celui derrière [le fait d’assainir la sortie tout court](/blog/sanitising-markdown-safely). D’autres outils préfixent pour leurs propres raisons, et un préfixe met en échec toutes les ancres écrites à la main d’un seul coup.

Convertissez donc d’abord, et lisez les identifiants que le convertisseur a produits au lieu de les deviner. Ouvrez la sortie, cherchez-y `id="`, cherchez-y `href="#`, et comparez les deux listes — tout ce qui figure dans la seconde et manque dans la première est un lien mort, et la vérification prend moins de temps que l’écriture du sommaire n’en a pris. Il existe aussi une correction structurelle : donnez au titre un identifiant explicite là où le moteur de rendu le permet, ou visez un titre stable plutôt qu’un titre numéroté. Renommer un titre casse en silence toutes les ancres qui le visent, ce qui est une raison de garder le sommaire court dans [une documentation qui vit dans le dépôt](/blog/documentation-that-lives-in-the-repo).

## Les liens en style référence, et la vérification automatique de chaque destination

Les liens en ligne encombrent la phrase. Le style référence déplace chaque URL vers le bas et ne laisse qu’une courte étiquette.

```markdown
The [style guide][guide] changed, and so did the [API reference][api].
Read the [style guide][guide] again before you file anything.

[guide]: https://example.com/style
[api]: https://example.com/api/v1
```

L’étiquette se réemploie autant de fois que vous voulez, l’URL n’est écrite qu’une fois : un domaine qui déménage est donc une seule modification plutôt qu’une chasse à travers les paragraphes. Cela vous donne aussi un seul bloc à auditer avant l’envoi : toutes les destinations vers lesquelles le document pointe. Un long pâté de base64 a sa place là-dessous également, et les images aussi — `![Flow][flow]` avec `[flow]: assets/flow.png` au pied du fichier garde un data URI de 40 Ko hors du milieu d’une phrase.

Ce bloc est également ce qu’une machine sait lire. Une fois que toutes les destinations sont au même endroit, les vérifier cesse d’être un travail humain.

### Un vérificateur que vous pouvez réellement contrôler

lychee est un vérificateur de liens écrit en Rust, que son propre dépôt décrit comme un vérificateur rapide, asynchrone et fondé sur des flux, qui trouve les URL et les adresses de courrier cassées dans du Markdown, du HTML, du reStructuredText, des sites web et davantage. Il est gratuit et sous double licence Apache 2.0 ou MIT, et il existe une GitHub Action officielle, `lycheeverse/lychee-action` (vérifié sur github.com, le 9 septembre 2026). Pointez-le vers vos fichiers `.md` et il rapporte ce qui ne se résout plus.

Sa place, ce sont deux endroits, pas un.

| Quand il s’exécute | Ce qu’il attrape | Ce qu’il doit faire en cas d’échec |
| --- | --- | --- |
| À chaque pull request touchant un `.md` | le lien que vous avez mal tapé il y a dix minutes | faire échouer la vérification — l’auteur est juste là |
| Selon un calendrier, chaque semaine ou chaque nuit | le lien qui a pourri le mois dernier | ouvrir un ticket, ne pas faire échouer une compilation |

Cette séparation compte, parce que les deux échecs n’ont pas le même propriétaire. Une exécution sur pull request ne regarde que ce que la pull request a changé : elle ne remarquera donc jamais qu’un prestataire a réorganisé sa documentation en juin. Une exécution planifiée le remarque, mais bloquer un déploiement parce que le site de quelqu’un d’autre est indisponible dix minutes punit la mauvaise personne. Câblez l’exécution planifiée pour qu’elle ouvre un ticket à la place, à côté de tout ce que vous [publiez déjà depuis un workflow](/blog/publish-markdown-from-github-actions).

Et soyez clair sur ce qu’aucun vérificateur ne peut faire pour vous. Il résout les chemins relatifs par rapport au dépôt, parce que le dépôt est l’endroit où il se tient — `img/flow.png` passe donc, à chaque fois, y compris lors de l’exécution qui précède immédiatement l’envoi de l’export à quelqu’un dont le dossier de téléchargements ne contient aucun `img`. La panne exacte dont parle cet article est invisible pour l’outil qui vérifie la source. Vérifiez la sortie.

## La part honnête : un document envoyé par courriel porte ses images ou n’en a pas

Tout ce qui précède suppose que le logiciel du lecteur ira chercher une image quand on le lui demande. Le courriel est l’endroit où cette hypothèse est tout simplement fausse, et elle l’est à dessein.

Outlook est configuré par défaut pour bloquer le téléchargement automatique des images venues d’internet, et Microsoft en donne quatre raisons : du contenu lié potentiellement choquant, du code malveillant, le coût en bande passante du téléchargement d’images que le lecteur n’a pas demandées, et les pixels espions — ces images invisibles qui indiquent à un expéditeur que le message a été lu (vérifié sur support.microsoft.com, le 9 septembre 2026). Tous les autres logiciels de messagerie se comportent en gros de la même façon, parce que le problème des pixels espions est le même pour tous.

Un document HTML collé dans le corps d’un courriel, avec des images référencées par URL, arrive donc sous forme de prose et de rectangles gris, surmontés d’un bandeau qui propose de télécharger les images. Certains lecteurs cliquent dessus. Beaucoup ne le font pas, et quelques-uns travaillent dans un endroit où l’option a été retirée purement et simplement. Ce n’est pas un défaut de votre côté, et il n’existe ni en-tête, ni attribut, ni astuce qui y remédie : le logiciel protège son utilisateur exactement du mécanisme sur lequel vous comptez.

Il reste donc deux options honnêtes, et pas de troisième.

**Le document porte ses images.** Chaque image devient un data URI, et le message contient les octets au lieu d’une requête pour les obtenir. Rien n’est bloqué parce que rien n’est demandé. Le coût, c’est l’arithmétique de tout à l’heure : un document avec six captures d’écran est un message de plusieurs mégaoctets, transféré intégralement à chaque fois, posé dans des boîtes aux lettres soumises à des quotas, et transitant par des passerelles qui réécrivent parfois le courrier HTML au passage. Certains filtres d’entreprise retirent les sources `data:` pour la même raison que l’assainisseur d’un wiki.

**Le document n’a pas d’images.** Le schéma devient une phrase, la capture d’écran devient un tableau, le graphique devient trois nombres, et le message est petit, rapide et lisible partout, y compris sur le téléphone dans le train. Le coût, c’est que la traduction est à votre charge, et que certaines choses ne se traduisent vraiment pas — un flame graph n’est pas une phrase.

Il existe une voie intermédiaire, qui échange une panne contre l’autre. Joignez le fichier HTML converti au lieu de le coller dans le corps : le lecteur le télécharge et l’ouvre dans un navigateur, qui va chercher les images normalement, et les URL distantes refonctionnent. En échange, chaque chemin relatif se résout désormais par rapport à son dossier de téléchargements, c’est-à-dire là où cet article a commencé. Il n’existe aucun arrangement dépourvu des deux problèmes. Il n’y a que le choix de celui que vous préférez expliquer.

## Ce qu’il faut vérifier avant d’envoyer le fichier

Le HTML autonome est une affirmation sur la présentation, rarement sur le contenu. Dans un document HTML en un seul fichier, les styles sont en ligne, il n’y a pas de scripts et rien n’est téléchargé pour que la page ait la bonne allure — le téléchargement de TransformPipe fonctionne ainsi. Ce que cela ne couvre jamais, c’est une image que vous avez désignée ailleurs. `<img src="diagram.png">` veut toujours dire `diagram.png`, à côté de l’endroit où le lecteur a rangé le fichier.

Les critères ci-dessous sont ce qu’il faut trancher, dans cet ordre, avant que le fichier ne quitte votre machine.

1. **Décidez de la destination avant d’écrire le chemin.** Un document qui sera ouvert depuis un dossier de téléchargements ne peut employer ni chemin relatif ni chemin relatif à la racine : `../assets/flow.png` sort du dossier que vous envoyez, et une barre oblique en tête pointe vers la racine du disque du lecteur. Décidez d’abord et vous écrirez chaque chemin une fois, au lieu d’avoir à les retrouver tous plus tard.
2. **Intégrez ce qui est petit, hébergez ce qui est gros.** Base64 ajoute environ un tiers aux octets : une icône ne coûte donc rien, tandis qu’une capture d’écran coûte un mégaoctet de texte illisible coincé dans la prose, renvoyé avec chaque copie et invisible pour toute comparaison de versions.
3. **Donnez un texte alternatif à chaque image porteuse de sens et un `alt` vide à chaque image décorative.** Le premier est ce qu’annonce un lecteur d’écran et ce qui comble le vide quand l’image échoue ; le second empêche qu’une cale soit lue à voix haute et masque l’icône d’image cassée quand elle ne se charge pas.
4. **N’intégrez jamais en ligne un SVG que vous n’avez pas dessiné.** En ligne, il rejoint le DOM de la page et ses scripts deviennent les scripts de la page ; référencé depuis un `img`, le navigateur désactive son scripting et le traite comme l’image que vous pensiez recevoir.
5. **Supposez que tout attribut HTML brut est facultatif.** La largeur, la hauteur, `picture`, `source`, `title` et `class` vivent tous à la merci d’une liste blanche : toute mise en page qui ne fonctionne que si l’attribut survit finira par être vue sans lui.
6. **Lisez les identifiants que le convertisseur a produits, pas ceux que vous attendiez.** Les algorithmes de slug diffèrent d’un moteur de rendu à l’autre, et une ancre qui ne correspond à rien échoue en silence — aucune erreur, aucun avertissement en console, juste une page qui refuse de défiler.
7. **Faites tourner un vérificateur de liens sur les pull requests et selon un calendrier.** Le premier attrape le lien que vous avez raté aujourd’hui ; seul le second attrape celui qui a pourri pendant que personne n’éditait ce fichier.
8. **Ouvrez l’export depuis un autre dossier, sur une autre machine, réseau coupé.** Ce seul test attrape d’un coup les fichiers manquants, les chemins relatifs à la racine, les dépendances à un CDN et les blocages de liens directs, et il prend environ une minute.

Faites ensuite la passe qui coûte une minute. Convertissez votre fichier, ouvrez l’onglet du code source HTML, et cherchez-y `src="` et `href="`. Lisez chaque valeur et demandez-vous par rapport à quoi elle se résout depuis la machine du lecteur, pas depuis la vôtre. Corrigez celles qui répondent de travers, puis envoyez le fichier — ou renoncez à la pièce jointe et [partagez-le sous forme de lien](/blog/share-a-markdown-document-as-a-link), ce qui épargne un téléchargement au lecteur mais pas un chemin relatif : celui-ci se résout toujours par rapport à la page qui le sert, là où les images n’ont jamais été déposées.

## Conclusion

Chaque image cassée et chaque ancre morte d’un document converti viennent de la même erreur, commise deux fois : une référence a été écrite depuis un endroit et lue depuis un autre. Les URL absolues et les data URI sont les deux formes qui se moquent de l’endroit où se tient le lecteur, le texte alternatif est ce qui reste quand l’image n’arrive pas, et les identifiants de titres méritent d’être lus plutôt que devinés, puisque quatre moteurs de rendu vous donneront quatre réponses. Rien de tout cela n’est difficile ; tout cela est invisible depuis la machine où le document a été écrit. Alors [convertissez le fichier](/), ouvrez la sortie, lisez chaque `src` et chaque `href` qu’elle a produits, et demandez à chacun où il pointe depuis le bureau de quelqu’un d’autre — cette unique passe fait la différence entre un document qui supporte d’être envoyé et un document qui arrive plein de rectangles gris.

## FAQ

### Pourquoi mon image Markdown ne s’affiche-t-elle pas ?

Neuf fois sur dix, le chemin est relatif et le fichier a changé de place : il se résout donc désormais par rapport à un dossier qui ne contient aucune image. Ouvrez l’onglet réseau du navigateur et lisez le statut : 404 signale un chemin faux, 403 des droits ou une protection contre les liens directs, et un 200 qui renvoie du HTML veut dire que vous avez lié une page plutôt qu’un fichier.

### Comment lier une image rangée dans un dépôt GitHub ?

Utilisez un chemin relatif si le Markdown est lu sur la page du dépôt, ce que GitHub recommande lui-même. S’il vous faut une URL absolue, passez par `raw.githubusercontent.com` ou ajoutez `?raw=true` à l’URL blob — l’adresse `…/blob/…` toute simple renvoie une page HTML, pas une image, et s’affichera toujours cassée.

### Faut-il encoder les images en base64 dans du Markdown ?

Pour des icônes, des logos et de petits schémas dans un document qui doit voyager seul, oui. Base64 rend les données environ un tiers plus grosses que le fichier : une capture de 2 Mo devient donc quelque 2,7 Mo de texte au milieu de votre prose, impossible à mettre en cache, à comparer ou à remplacer séparément — au-delà de quelques centaines de kilooctets, hébergez plutôt l’image.

### Puis-je fixer la largeur d’une image en Markdown ?

Pas en CommonMark ni en GitHub Flavored Markdown, qui vous donnent une URL, un texte alternatif et un titre facultatif, et rien d’autre. On se rabat sur un `<img width="400">` brut, mais un convertisseur peut échapper le HTML brut ou assainir l’attribut : redimensionner le fichier image lui-même est donc la seule correction qui fonctionne partout.

### Pourquoi mon lien vers un titre fonctionne-t-il sur GitHub et casse-t-il dans le HTML exporté ?

Parce que les deux moteurs de rendu fabriquent les slugs différemment. GitHub met en minuscules, remplace les espaces par des traits d’union et retire la ponctuation ; Pandoc supprime en plus tout ce qui précède la première lettre, si bien que `## 3. Applications` donne `#applications` et non `#3-applications` ; marked et markdown-it n’émettent aucun identifiant sans greffon. Lisez les identifiants dans la sortie au lieu de les supposer.

### Mes images s’afficheront-elles si j’envoie le HTML converti par courriel ?

Seulement si elles sont intégrées. Outlook bloque par défaut le téléchargement automatique des images venues d’internet, en grande partie pour déjouer les pixels espions, et les autres logiciels font de même : un document envoyé par courriel avec des URL d’images distantes arrive donc sous forme de prose et de rectangles gris, jusqu’à ce que le lecteur choisisse de les charger.

### Quelle est la différence entre un texte alternatif et une légende ?

Une légende est visible de tous, se tient près de l’image et ajoute quelque chose que l’image ne dit pas d’elle-même. Le texte alternatif remplace l’image pour un lecteur qui n’en reçoit pas — utilisateur de lecteur d’écran, ou quiconque dont l’image ne s’est pas chargée — il doit donc dire ce que l’image communique, et rester vide quand l’image ne communique rien.

### Pourquoi les images ont-elles disparu après la conversion ?

Parce que le convertisseur les a trouvées et a écrit une référence au lieu des octets. Une image dans un `.docx`, un `.pptx` ou un export Notion est un fichier distinct à l'intérieur du conteneur, et une conversion doit soit l'intégrer, soit l'écrire à côté du Markdown en réécrivant la référence, soit dire qu'elle n'a fait ni l'un ni l'autre. [Où passent les images quand vous exportez un document](/blog/pictures-in-a-document-export) dit où chaque format les garde et ce que coûtent les trois options.
