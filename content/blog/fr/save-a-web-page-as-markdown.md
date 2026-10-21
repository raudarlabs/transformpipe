---
title: "Enregistrer une page web en Markdown, et posséder vraiment le fichier"
description: "Quatre voies pour transformer une page web en Markdown — mode lecture, HTML enregistré, extensions, ligne de commande — et le sort des images"
updated: 2026-10-21
date: 2026-09-05
tag: Conversion
keywords: page web en markdown, enregistrer une page web en markdown, convertir une page web en markdown, url vers markdown, sauvegarder un article en markdown, extension de capture markdown, readability markdown, récupérer le texte d’une page web
---

Une page que vous voulez conserver est une page que quelqu’un d’autre peut modifier. L’article lu en mars dernier se trouve désormais derrière un mur d’inscription, ou bien le site a été refait et l’URL renvoie une 404, ou bien le paragraphe dont vous vous souvenez a été retouché sans bruit et rien ne permet de s’en apercevoir. Un signet est une promesse faite par un inconnu. Du Markdown sur votre propre disque est un fichier.

La conversion elle-même est la partie facile. Toutes les voies décrites ci-dessous se terminent par du HTML qui devient du Markdown, et cette étape est bien résolue par une demi-douzaine d’outils. Ce qui distingue les voies, c’est tout ce qu’il y a autour : quelle partie de la page vous récupérez, si les images suivent, si le fichier s’ouvrira encore dans cinq ans, et combien d’heures cela coûte pour un seul article.

### En bref

Pour un article que vous lisez à l’instant, activez le mode lecture du navigateur, enregistrez ou copiez la page nettoyée, et convertissez cela — le mode lecture est une étape d’extraction offerte, et il retire la navigation, l’encadré d’inscription à la lettre d’information et la colonne d’articles connexes avant qu’aucun convertisseur ne les voie. Pour une page que vous voulez en entier, enregistrez-la d’abord en HTML et convertissez le fichier, car un fichier enregistré peut être reconverti quand vous changez d’avis, ce qu’un copier-coller ne permet pas. Pour un geste routinier, une extension de capture dépose le Markdown directement dans vos notes en un clic et masque les deux étapes. Et quelle que soit la voie, tranchez délibérément la question des images : un fichier Markdown qui pointe vers les URL d’images de quelqu’un d’autre est un fichier qui se videra lentement.

## Les voies, comparées

Chaque ligne est un arbitrage différent entre l’effort et la fidélité. Aucune n’est fausse ; elles échouent à des endroits différents.

| Voie | Idéale pour | Ce qu’elle garde | Ce qu’elle coûte | Prix |
| --- | --- | --- | --- | --- |
| Mode lecture, puis conversion | Un article, lu maintenant, conservé comme du texte | Titres, paragraphes, liens du corps, en général les tableaux | Tout ce que l’extracteur a jugé décoratif, y compris de vraies figures | Gratuit |
| Enregistrer en HTML, puis convertir le fichier | Une page que vous voulez entière, ou deux fois | Tout ce que contenait la page, décor compris | Le décor, c’est à vous de le retirer | Gratuit |
| Convertisseur côté navigateur | Un fichier converti sans être téléversé | Tableaux, listes de tâches, code, titres | Un document à la fois | Gratuit |
| Extension MarkDownload | Capturer la page qui est devant vous | L’article extrait, plus un front matter portant l’URL | Une extension autorisée à lire les pages | Gratuit, Apache 2.0 |
| Obsidian Web Clipper | Du Markdown qui atterrit dans un coffre | Extraction, gabarits, propriétés de page | Lié au dossier d’Obsidian | Gratuit, MIT |
| Notion Web Clipper | Lire plus tard à l’intérieur de Notion | La page sous forme de blocs Notion | Pas du Markdown — un second export pour y arriver | Gratuit |
| SingleFile | Garder la page telle qu’elle était | Images, CSS et polices intégrés dans un fichier HTML unique | Un gros fichier, et la conversion reste à faire | Gratuit, open source |
| monolith | Archiver des pages depuis un script | Ressources intégrées en URI de données, sans dossier | Une installation Rust ; aucune extraction d’article | Gratuit, open source |
| Pandoc | La conversion dans un build ou un script | La structure, et les images via `--extract-media` | Aucune extraction : donnez-lui du HTML propre, sinon vous aurez le menu | Gratuit, GPL |
| Turndown | Un outil ou une extension que vous écrivez | Exactement les règles que vous définissez | À vous de fournir le DOM, l’extraction et l’enveloppe | Gratuit, MIT |
| Mozilla Readability | Trouver l’article à l’intérieur d’une page | Titre, signature, HTML d’article nettoyé | Produit du HTML, pas du Markdown |
| `wget` / `curl` | Beaucoup de pages, sans connexion, depuis un terminal | Les octets tels que le serveur les a envoyés | Aucune extraction, et le devoir d’y mettre les formes | Gratuit |
| Une archive web publique | Prouver ce que disait la page | Un instantané daté et citable | Ni votre fichier, ni du Markdown | Gratuit |
| Impression en PDF | Une mise en page qui ne doit pas bouger | La page comme une image d’elle-même | Le texte structuré a disparu ; revenir en arrière est un nouveau chantier | Gratuit |

## Voie n° 1 : enregistrer le HTML, puis convertir le fichier

C’est la voie qu’il vaut la peine d’apprendre en premier, parce qu’elle sépare la capture de la conversion. Une fois le HTML sur le disque, vous pouvez le convertir de quatre manières, comparer les résultats, et tout rejouer l’an prochain avec un meilleur outil. Le copier-coller ne vous laisse qu’un essai.

| Avantages | Inconvénients |
| --- | --- |
| La capture est permanente et reconvertible | Deux étapes au lieu d’une |
| Fonctionne sur n’importe quelle page, y compris celles qu’aucun extracteur ne traite bien | Vous récupérez la navigation et le pied de page en plus de l’article |
| Le fichier enregistré fait preuve : c’est ce que disait la page ce jour-là | Les formats que proposent les navigateurs ne sont pas tous également utiles |
| Rien n’a besoin d’être téléversé pour le convertir ensuite | Les ressources atterrissent dans un dossier voisin, facile à perdre |

**Pour qui ?** Pour quiconque conserve une page à titre de référence plutôt que pour la lire : une documentation susceptible d’être retirée, une spécification, un fil de support que vous devrez citer, la page tarifaire d’un concurrent le jour où vous l’avez consultée.

### Le format choisi dans la boîte de dialogue décide de ce que vous obtenez

Appuyer sur le raccourci d’enregistrement n’est pas une action unique. Le menu déroulant de la boîte de dialogue propose des formats aux comportements très différents, et choisir le mauvais est la raison la plus fréquente pour qu’une conversion ne produise rien d’utile.

| Format | Où le trouver | Ce qui atterrit sur le disque | Se convertit bien ? |
| --- | --- | --- | --- |
| Page web, complète | Chrome, Edge, Firefox (« Page web, complète ») | Un fichier `.html` et un dossier `_files` d’images, de CSS et de scripts | Oui, et les images sont déjà locales |
| Page web, HTML seulement | Chrome, Edge, Firefox (« Page web, HTML uniquement ») | Un seul fichier `.html`, les ressources restant distantes | Oui, même si les images restent des URL distantes |
| Page web, fichier unique | Chrome, Edge | Un fichier `.mhtml` : une archive MIME multipartie de la page et de ses composants | Rarement — la plupart des convertisseurs Markdown ne lisent pas le MHTML |
| Archive web | Safari | Un fichier `.webarchive`, une liste de propriétés binaire | Non : c’est le format d’Apple, pas du HTML |
| Source de la page | Safari | Le HTML envoyé par le serveur | Oui, mais voyez la note sur JavaScript ci-dessous |
| Fichiers texte | Firefox | La page en texte brut | Aucune structure ne survit : il n’y a rien à convertir |

Le MHTML mérite un avertissement à lui seul, parce que « fichier unique » ressemble exactement à ce que vous vouliez. C’est un conteneur MIME — la même enveloppe qu’un courriel avec pièces jointes, normalisée par la RFC 2557 — où le HTML et chaque ressource figurent comme parties encodées en base64. Les navigateurs l’ouvrent. Les convertisseurs Markdown, en général, non, et le fichier ne laisse rien deviner du problème : vous obtenez une erreur, ou une unique ligne gigantesque de base64.

### Quand la page est bâtie par JavaScript, enregistrez le DOM rendu

Un très grand nombre de pages envoient un document presque vide et le remplissent par script. Enregistrez la source de l’une d’elles et vous aurez enregistré un indicateur de chargement. La réponse fiable consiste à prendre le DOM que le navigateur a réellement construit : ouvrez les outils de développement, trouvez l’élément `<html>` en haut du panneau des éléments, faites un clic droit dessus et choisissez Copier, puis Copier outerHTML. Collez cela dans un fichier portant l’extension `.html` et convertissez-le à la place. C’est la page rendue, tableaux compris, dans l’état où vous la regardiez.

La même astuce resserre le travail. Au lieu de l’élément `<html>`, copiez l’outerHTML de l’élément `<article>` ou du conteneur de contenu principal. Vous avez alors fait l’extraction à la main, avec précision, en quatre secondes environ, et le convertisseur n’a plus rien à deviner.

### Le même travail dans un script

Pour plus d’une page, le terminal est plus court. `curl -sL <url> -o page.html` récupère le document et suit les redirections. `wget --page-requisites --convert-links <url>` récupère la page ainsi que les images et les feuilles de style qu’elle référence, et réécrit ces références pour qu’elles pointent vers les copies locales, ce qui est l’équivalent le plus proche de « Page web, complète » depuis une ligne de commande.

Pandoc sait lire du HTML et écrire du Markdown directement, et il accepte une URL en entrée aussi bien qu’un fichier : `pandoc -f html -t gfm <url> -o page.md` est donc une commande d’une ligne pour une page simple. Il ne fait strictement aucune extraction — vous récupérerez le menu, le pied de page et tous les liens de la barre latérale — et il a donc sa place en fin de chaîne, là où quelque chose d’autre a déjà trouvé l’article. Son option `--extract-media` est la partie utile pour conserver une page : elle écrit les images dans un répertoire et réécrit les liens du Markdown en conséquence, ce qui transforme un fichier plein d’URL distantes en un dossier autonome.

Si c’est la page que vous voulez plutôt que son texte, `monolith` est un petit outil en ligne de commande écrit en Rust qui rassemble une page et ses ressources dans un unique fichier HTML, tout étant intégré sous forme d’URI de données. Pas de serveur, pas de dossier à perdre. Il est gratuit et open source. Convertissez ce fichier plus tard si vous voulez du Markdown ; gardez-le dans tous les cas si la page risque de disparaître.

## Voie n° 2 : le mode lecture et l’extraction à la Readability

Le mode lecture est l’outil de conversion le plus sous-employé du navigateur, parce que personne n’y voit un outil de conversion. Ce qu’il fait, c’est exactement la moitié difficile du travail : il regarde le document, détermine quel bloc constitue l’article, et jette le reste. Le mode lecture de Firefox repose sur la bibliothèque Readability de Mozilla. Safari a son Lecteur, Chrome un mode de lecture dans son panneau latéral, et Edge le Lecteur immersif. Ils ne sont pas identiques, mais tous pratiquent le même genre de notation : combien de texte dans cet élément, combien de liens, quelle profondeur d’imbrication, quels noms de classes.

Activez-le, puis enregistrez ou copiez depuis la vue nettoyée. Comme la vue de lecture est elle-même un vrai document dans le navigateur, l’astuce des outils de développement ci-dessus fonctionne dessus : copiez l’outerHTML du conteneur de lecture et vous tenez l’article sans le moindre décor. Convertissez cela et le Markdown commence au titre.

| Avantages | Inconvénients |
| --- | --- |
| L’extraction est faite, gratuitement, par un logiciel qui a vu des millions de pages | Il décide de ce qu’est une « figure », et il se trompe parfois |
| Fonctionne sur la page que vous lisez déjà, sans rien installer | Échoue sur les pages qui ne sont pas des articles : tableaux de bord, docs à barre latérale, forums |
| Retire au passage les pixels espions, les emplacements publicitaires et les encadrés d’inscription | Les citations mises en exergue, les légendes et les notes en ligne sautent souvent |
| Vous donne le titre et la signature comme champs distincts et propres | Aucun contrôle sur les règles, sauf à exécuter la bibliothèque vous-même |

**Pour qui ?** Pour les lecteurs qui conservent des articles : journalisme, essais, billets de blog, tout ce qui tient en une colonne de prose sous un titre. C’est le mauvais outil pour une documentation de référence, où la navigation latérale et les tableaux en marge font la moitié de la valeur.

Exécuter la bibliothèque directement mérite d’être connu si vous faites cela en quantité. Readability, de Mozilla, est écrit en JavaScript, sous licence Apache 2.0, et prend un document DOM ; `new Readability(document).parse()` renvoie un objet contenant le titre, la signature, un extrait, le nom du site et l’article nettoyé sous forme de HTML. Il s’arrête là — l’extraction est tout son périmètre, et transformer ce HTML en Markdown est le travail de l’outil suivant. Postlight Parser pratique le même genre d’extraction et sait produire du Markdown lui-même. La comparaison entre ceux-là et les bibliothèques simples est [détaillée outil par outil ailleurs](/blog/best-html-to-markdown-converters) ; ce qui compte ici, c’est l’ordre des opérations. Extraire, puis convertir. Dans l’autre sens, on obtient un rendu Markdown très propre d’un menu de navigation.

## Voie n° 3 : les extensions de capture, et ce que chacune abîme

Une extension de capture, c’est l’extraction et la conversion agrafées derrière un seul bouton de barre d’outils, et pour un usage quotidien c’est la bonne forme. Le prix à payer, c’est une extension de navigateur autorisée à lire les pages que vous visitez, et une opinion — arrêtée par quelqu’un d’autre — sur ce qui dans une page mérite d’être gardé.

| Extension | Ce qu’elle produit | Où cela va | Ce qu’elle a tendance à abîmer |
| --- | --- | --- | --- |
| MarkDownload | Un fichier `.md`, au besoin avec un front matter YAML portant l’URL et le titre | Votre dossier de téléchargements, ou le presse-papiers | Ce que l’extracteur a laissé tomber ; les images restent des liens distants sauf demande contraire |
| Obsidian Web Clipper | Du Markdown et des propriétés de page, mis en forme par un gabarit que vous écrivez | Directement dans un dossier de coffre | Les surlignages et les encadrés sont des conventions propres à Obsidian : ils voyagent mal vers d’autres outils |
| Notion Web Clipper | Des blocs Notion, pas du Markdown | Une base ou une page Notion | Tout ce pour quoi Notion n’a pas de bloc ; récupérer du Markdown demande un second export |
| Extension TransformPipe | Le Markdown de l’article extrait, ou la page en un seul fichier `.html` autonome | Le presse-papiers, votre dossier de téléchargements, ou un compte si vous vous connectez | Ce que l’extracteur a laissé tomber ; les images du Markdown restent des liens distants, réécrits en adresses absolues |
| Une extension générique « enregistrer en Markdown » | Cela varie énormément | Les téléchargements | Inconnu, et c’est là le problème : on ne peut pas auditer ce qu’on ne peut pas lire |

MarkDownload est l’honnête cheval de trait : il passe Readability sur la page puis Turndown sur le résultat, c’est-à-dire la même chaîne en deux temps décrite plus haut, câblée pour vous. Il est gratuit et open source sous licence Apache 2.0, ce qui veut dire que la chaîne est inspectable — vous pouvez lire exactement quelles règles ont produit le fichier obtenu.

Le Web Clipper d’Obsidian est celui qu’il faut employer si la destination est un coffre, car il écrit la note là où le coffre l’attend, avec les propriétés sur lesquelles reposent vos gabarits. Il est gratuit et sous licence MIT. Deux choses à garder en tête. D’abord, ses gabarits sont une vraie fonctionnalité qu’il vaut la peine de régler une fois : une note capturée avec l’URL source, l’auteur et la date de récupération dans ses propriétés est une note que vous pourrez encore citer dans deux ans. Ensuite, la variante d’Obsidian comporte ses propres extensions — wikiliens, encadrés, insertions — et une note qui en est pleine n’est pas une note qu’un autre outil saura rendre. [Ce que chacune de ces applications fait au Markdown en sortie](/blog/markdown-from-notion-obsidian-and-confluence) est une plus longue histoire, et elle vaut pour les pages capturées autant que pour les notes écrites.

L’extension de Notion est l’exception, et celle qui piège les gens. Elle n’enregistre pas de Markdown. Elle enregistre la page dans Notion sous forme de blocs Notion, ce qui est réellement utile si c’est dans Notion que vous lisez, et une impasse si vous vouliez un fichier. Pour en ressortir du Markdown, vous exportez ensuite la page depuis Notion, ce qui produit une archive zip avec des identifiants hexadécimaux ajoutés à chaque nom de fichier et les bases sous forme de fichiers CSV séparés. Cela fait deux conversions avec perte là où vous en demandiez une.

Le convertisseur décrit plus bas existe aussi sous forme d’[extension de navigateur](/extension), et c’est la même chaîne en deux temps : Readability trouve l’article dans la page où vous êtes, le convertisseur HTML vers Markdown du site écrit le Markdown, et chaque adresse de lien et d’image est réécrite en adresse absolue, afin que le fichier pointe encore quelque part une fois sorti de l’onglet — les images restent des liens vers le site d’origine plutôt que des copies. Elle sait aussi enregistrer la page en un seul fichier `.html`, feuilles de style, images et polices intégrées en URI data, et son menu contextuel convertit une sélection plutôt que la page entière. Elle ne demande aucune autorisation d’hôte à l’installation, ne lit une page que lorsque vous appuyez sur son bouton ou ouvrez son panneau latéral sur cette page, et ne contacte jamais les serveurs du site tant que vous n’êtes pas connecté ; elle s’installe dans Chrome et les navigateurs fondés sur Chromium, ainsi que dans Firefox, sur ordinateur comme sur Android.

**Pour qui sont les extensions de capture ?** Pour les gens qui conservent des pages tous les jours et veulent que la décision soit prise à leur place. Si vous capturez deux fois par an, l’autorisation accordée à l’extension n’en vaut pas la peine et la voie en deux étapes convient très bien.

### L’option côté navigateur, si vous préférez ne rien installer

Entre « coller dans un site web » et « installer une extension » il existe une troisième position : un convertisseur qui tourne dans l’onglet du navigateur sans faire partie du navigateur. Déposez sur la page le fichier `.html` enregistré, ou collez le HTML copié depuis les outils de développement, et la conversion a lieu sur votre propre machine. Déconnecté, [la conversion de HTML vers Markdown](/html-to-markdown) de TransformPipe ne téléverse absolument rien — le fichier est lu, analysé et converti localement, ce que vous pouvez vérifier en ouvrant l’onglet réseau et en constatant qu’il ne s’y passe rien. La conversion est plafonnée à 10 Mo, et un document que vous choisissez de conserver dans un compte est plafonné à 4 Mo, parce que la fonction qui le stocke refuse un corps de requête plus gros.

| Avantages | Inconvénients |
| --- | --- |
| Pas d’installation, pas d’autorisations d’extension, rien de téléversé une fois déconnecté | La capture du HTML reste à votre charge |
| Conserve les tableaux GFM, les listes de tâches, le code encadré et les titres | Un document à la fois, et non une exploration de site |
| Convertit aussi dans l’autre sens, et depuis Word, CSV et JSON | C’est le navigateur qui travaille : une page énorme dépend donc de la machine |

**Pour qui ?** Pour quelqu’un qui a une page enregistrée et une conversion à faire, sur une machine où installer quoi que ce soit est lent ou interdit.

## Les images : les télécharger, ou accepter la décomposition

C’est la partie que tous les guides sautent, et c’est elle qui décide si votre archive aura encore de la valeur dans trois ans.

Markdown ne possède qu’une syntaxe d’image et elle contient un emplacement : `![alt](url)`. Convertissez une page web et cette URL sera celle qu’employait la page — le plus souvent une adresse absolue sur le domaine d’origine ou sur un CDN. Le Markdown est correct à l’instant où vous le fabriquez, et ce n’est la copie de rien. C’est une copie du texte et un pointeur vers les images de quelqu’un d’autre, et les pointeurs se décomposent d’au moins cinq façons :

- Le site est refait et les chemins des médias changent.
- Le CDN est remplacé, le compartiment renommé, ou l’ancien préfixe cesse de résoudre.
- L’URL portait une chaîne de requête signée avec une date d’expiration, et la signature est désormais périmée.
- Une protection contre les liens directs se met à refuser les requêtes qui ne viennent pas des pages du site.
- Le site disparaît entièrement, ce qui est généralement la raison pour laquelle vous aviez enregistré la page.

Il y a trois choix honnêtes, et pas de quatrième.

| Choix | Ce que vous obtenez | Ce qui casse | Effort |
| --- | --- | --- | --- |
| Laisser les URL distantes | Un petit fichier texte, des images tant qu’elles durent | Chacune des défaillances ci-dessus, en silence et une par une | Aucun |
| Télécharger les images à côté du fichier | Un dossier qui est vraiment une copie | Les chemins relatifs cassent si le fichier bouge sans le dossier | Une option, ou un réglage d’extension |
| Intégrer les images en URI de données | Un fichier unique qui n’a besoin d’aucun réseau | Un fichier bien plus gros, et certains outils refusent les URI très longues | Une étape de conversion |

Télécharger est ce que la plupart des gens devraient faire, et l’outillage existe : `--extract-media` de Pandoc écrit les médias et réécrit les liens, `wget --page-requisites --convert-links` fait l’équivalent au moment de la capture, et SingleFile comme monolith intègrent tout dans le HTML avant même qu’il soit question de convertir. Le piège du dossier, c’est qu’un fichier Markdown et son répertoire `images/` ne font plus qu’un, et que le lien entre eux est un chemin relatif — c’est-à-dire exactement [l’hypothèse qui casse la première fois que quelqu’un déplace le fichier](/blog/images-and-links-that-still-work) sans le dossier.

Deux problèmes d’images plus petits méritent d’être connus avant d’accuser le convertisseur. Le chargement différé fait que la véritable adresse de l’image loge souvent dans un attribut `data-src` ou `srcset` tandis que `src` contient un espace réservé : un convertisseur qui travaille sur le HTML source capture donc cet espace réservé — un carré gris ou un GIF transparent d’un pixel. Copier le DOM rendu après avoir fait défiler la page règle généralement la chose, car le navigateur a d’ici là substitué la vraie adresse. Et `<figure>` avec un `<figcaption>` n’a pas d’équivalent en Markdown : la légende arrive donc en paragraphe isolé sous l’image, impossible à distinguer du corps du texte.

## Là où enregistrer une page en Markdown échoue

La réponse honnête, c’est que Markdown est un format avec perte pour le web, et que pour certaines pages la perte est précisément tout l’intérêt de la page.

**Les applications déguisées en documents.** Un tableau de bord, une carte, un calculateur, un tableau triable avec des filtres — il n’y a rien à enregistrer. Ce que vous pouvez garder, c’est une capture d’écran ou un PDF, qui préserve l’image et abandonne le texte.

**Tout ce qui a besoin du réseau pour exister.** Vidéo intégrée, messages de réseaux sociaux, cadres CodePen, fils de commentaires chargés au défilement, graphiques interactifs dessinés à partir d’un flux JSON. Un convertisseur transforme un `<iframe>` en rien, ou en un lien vers une URL qui ne survivra peut-être pas à la page.

**Le défilement infini et la pagination.** Vous obtenez ce qui était chargé au moment de la capture. Un fil de deux cents réponses vous en donne vingt, et rien dans le fichier ne le signale.

**Le contenu derrière une connexion.** Une extension de capture fonctionne parce que le navigateur est déjà authentifié ; `curl` ne l’est pas, et ira chercher la page de connexion, qu’il convertira parfaitement.

**Le HTML structurel sans équivalent en Markdown.** Les tableaux à `rowspan` ou `colspan`, les listes de définitions, les tableaux imbriqués, les notes en marge, les blocs `<details>`, les mathématiques rendues par KaTeX ou MathJax, le code colorisé dont le langage vit dans un nom de classe que le convertisseur ne lit pas. Certains convertisseurs produisent du HTML brut pour ces cas, ce qui conserve l’information au prix de la portabilité ; d’autres approximent ; d’autres encore les suppriment. Les tableaux sont la victime la plus fréquente et la plus visible, et [ce qui permet à un tableau de survivre au trajet](/blog/markdown-tables-that-survive-conversion) mérite lecture si vos pages sont de la documentation.

**La question de la sécurité, si le fichier doit aller quelque part.** Markdown autorise le HTML brut, et du HTML converti depuis une page web peut transporter du HTML brut jusqu’au bout — y compris `<script>`, des gestionnaires `onerror=` et des URL `javascript:` venus de la page enregistrée. Tout cela est inerte dans un éditeur de texte et devient vivant dès l’instant où vous le reconvertissez en HTML et l’ouvrez dans un navigateur. Si une page enregistrée doit redevenir une page, [l’assainissement est l’étape qu’on ne peut pas sauter](/blog/sanitising-markdown-safely).

**Et le coût que personne n’énonce.** Une copie en Markdown est un instantané dépouillé de la mise en page, de l’habillage et de l’identité de la source. Elle est plus petite, cherchable, exploitable par `grep`, comparable et vôtre. Elle ne prouve plus rien non plus, parce que vous auriez pu la taper. S’il vous faut montrer ce que disait la page, gardez le HTML — ou l’instantané d’archive — en plus du Markdown, et inscrivez l’URL et la date de récupération dans le front matter du fichier. Cette habitude coûte une ligne et clôt les discussions.

## Votre propre lecture, et non une republication

Enregistrer une page pour soi et publier ce qu’on a enregistré sont deux actes différents, et le second n’est pas couvert par le premier.

Le texte et les images d’une page web sont le travail de quelqu’un, et le droit d’auteur s’applique qu’il y ait une mention ou non. Garder une copie personnelle pour lire, annoter, chercher et citer relève de l’usage ordinaire, et les exceptions que prévoient la plupart des juridictions — l’exception de copie privée et de courte citation en France, le *fair dealing* au Royaume-Uni, le *fair use* aux États-Unis — existent à peu près pour cela. Prendre le Markdown que vous avez produit et le publier sur votre propre site, l’injecter dans un produit, ou le faire circuler comme un document portant votre nom en tête est une autre question, et la réponse dépend de la quantité prise, de l’usage qui en est fait, et du fait que vous le facturiez ou non. Rien de tout cela n’est un conseil juridique ; la version pratique suit.

| Ce que vous faites | Comment cela se lit d’ordinaire | Que faire |
| --- | --- | --- |
| Garder un article pour le lire hors ligne | Usage personnel | Rien. Notez l’URL et la date |
| Citer un paragraphe avec attribution | Citation ordinaire | Liez vers l’original, nommez l’auteur |
| Republier l’article entier sur votre site | Republication | Demandez, ou liez au lieu de copier |
| Constituer un corpus cherchable pour une équipe | Dépend entièrement de l’échelle et de la licence | Vérifiez les conditions ; demandez l’autorisation par écrit |
| Alimenter un produit commercial avec des pages | Ce n’est un usage personnel sous aucune lecture | Prenez conseil avant, pas après |

Vient ensuite la moitié « savoir-vivre », qui est technique et non facultative. `robots.txt` est une demande et non une licence, et un script qui va chercher mille pages est un robot d’exploration, quoi que vous en pensiez. Récupérez lentement, une page à la fois, avec une pause entre les requêtes. Envoyez un User-Agent qui dit qui vous êtes et comment vous joindre. Respectez un `429` et l’en-tête `Retry-After` qui l’accompagne au lieu de réessayer immédiatement. Mettez en cache ce que vous avez déjà récupéré, pour qu’une nouvelle exécution ne frappe pas le site une deuxième fois. Et lisez les conditions d’utilisation avant d’automatiser quoi que ce soit contre un site qui ne vous appartient pas, en particulier quand le contenu se trouve derrière une connexion ou un péage — contourner un contrôle d’accès est une affaire distincte du droit d’auteur, et une affaire plus grave.

Une page, enregistrée à la main, depuis un site que vous lisez : personne n’y trouve à redire, et c’est bien pour cela que les navigateurs ont un bouton d’enregistrement depuis toujours. Un balayage scripté de toute une publication : demandez d’abord.

## Comment choisir

1. **Partez de ce que vous ferez du fichier.** Le lire plus tard veut dire qu’un extracteur est votre ami et que le décor est du bruit. Le citer dans une discussion veut dire garder le HTML aussi, car le Markdown seul ne prouve rien.
2. **Capturez avant de convertir.** Enregistrez le HTML, ou copiez le DOM rendu, et conservez-le. Les outils de conversion s’améliorent et vos exigences changent : un fichier sur le disque pourra passer dans un meilleur outil l’an prochain, ce qu’un collage dans une zone de texte ne permettra pas.
3. **Tranchez la question des images au moment de la capture, pas après.** Les télécharger coûte une option tant que la page est devant vous, et coûte une archive cassée si vous remettez à plus tard, une fois les URL déjà décomposées.
4. **Vérifiez les tableaux avant de faire confiance à l’outil.** Les tableaux ne figurent pas dans la spécification CommonMark : un convertisseur doit donc mettre en œuvre délibérément les tableaux du GFM. Convertissez une page contenant un tableau et regardez-le ; ce seul test écarte la plupart des mauvaises options.
5. **Assainissez tout ce qui redeviendra du HTML.** Une page que vous avez enregistrée peut transporter des scripts, et un aller-retour fidèle les ramène jusqu’à un navigateur. Si le Markdown ne doit jamais être lu autrement que comme du texte, cela n’a pas d’importance ; dès l’instant où il est publié, c’est la seule chose qui en ait.
6. **Mettez le nombre d’installations en regard de la fréquence.** Capturer tous les jours justifie une extension et un gabarit. Deux pages par an, non : servez-vous du mode lecture, enregistrez le HTML, convertissez-le dans un onglet de navigateur, et gardez vos autorisations pour vous.

## Conclusion

La façon fiable de conserver une page web tient en deux étapes qui n’en ont l’air que d’une : sortir l’article de la page, puis sortir le Markdown de l’article. Le mode lecture ou un extracteur fait la première, n’importe quel convertisseur compétent fait la seconde, et une extension de capture fait les deux d’un coup en échange d’une autorisation. Quelle que soit la voie, enregistrez les images ou acceptez sciemment qu’elles s’effacent, inscrivez l’URL source et la date dans le fichier, et rappelez-vous que la copie est pour vous — la page, elle, appartient toujours à qui l’a écrite.

## FAQ

### Quelle est la façon la plus rapide d’enregistrer une page web en Markdown ?

Activez le mode lecture du navigateur, copiez l’article nettoyé et collez-le dans un convertisseur : cela prend moins d’une minute et ne demande aucune installation. Si vous le faites souvent, une extension de capture ramène l’opération à un clic, au prix d’un accès accordé à une extension sur les pages que vous visitez.

### Quel format d’enregistrement du navigateur faut-il choisir ?

« Page web, complète » si vous voulez les images sur le disque, ou « Page web, HTML uniquement » si seul le texte vous importe. Évitez « Page web, fichier unique » (`.mhtml`) et l’Archive web de Safari quand le but est le Markdown, car la plupart des convertisseurs ne savent lire ni l’un ni l’autre.

### Pourquoi ma page enregistrée ne se convertit-elle presque en rien ?

La page rend très probablement son contenu avec JavaScript, si bien que la source enregistrée est une coquille vide. Ouvrez les outils de développement, faites un clic droit sur l’élément `<html>`, choisissez Copier puis Copier outerHTML, enregistrez cela dans un fichier `.html` et convertissez-le à la place — c’est la page telle que le navigateur l’a construite.

### Les images viennent-elles avec le Markdown ?

Pas par défaut. Un convertisseur écrit les URL d’images qu’il a trouvées, lesquelles pointent vers le site d’origine et ne fonctionnent qu’aussi longtemps que lui. Employez `--extract-media` de Pandoc, `wget --page-requisites --convert-links`, ou un outil qui intègre les ressources, si vous voulez une copie plutôt qu’un pointeur.

### Puis-je convertir une URL directement en Markdown sans rien installer ?

Oui, pour les pages simples : Pandoc accepte une URL en entrée, et plusieurs outils en ligne en acceptent une aussi. Les deux approches sautent l’extraction : attendez-vous donc à trouver la navigation et le pied de page dans la sortie, sauf si l’outil exécute d’abord un extracteur à lui.

### Est-il légal d’enregistrer une page web en Markdown ?

Garder une copie personnelle pour la lire relève de l’usage ordinaire, et c’est à cela que sert le bouton d’enregistrement d’un navigateur. Republier ce que vous avez enregistré, ou bâtir un corpus commercial à partir de nombreuses pages, est une autre question qui dépend de l’échelle, de la licence et des conditions d’utilisation — demandez avant d’automatiser sur un site qui ne vous appartient pas.

### Puis-je convertir tout un site d’un coup ?

Techniquement oui, avec `wget` et un convertisseur dans une boucle, et c’est la demande la plus susceptible d’agacer le propriétaire d’un site ou de faire bloquer votre adresse. Limitez le débit, identifiez-vous dans le User-Agent, respectez les réponses `429`, et demandez-vous si un instantané d’archive ou une demande polie de la source ne vous servirait pas mieux.
