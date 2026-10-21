---
title: "Comment ouvrir un fichier .md sous Windows, macOS, Linux, iOS et Android"
description: "Un fichier .md est du texte brut : voilà pourquoi un double-clic ouvre un éditeur de code ou rien. Le lire tel quel, le lire mis en forme, fixer l’application"
updated: 2026-10-21
date: 2026-09-02
tag: Conversion
keywords: comment ouvrir un fichier md, ouvrir fichier .md windows, qu’est-ce qu’un fichier md, lire un fichier markdown, ouvrir fichier markdown mac, visionneuse md en ligne, ouvrir un fichier md dans le navigateur, lire un fichier md sur téléphone
---

Vous avez téléchargé un fichier nommé `README.md`, vous avez double-cliqué dessus, et il s’est passé quelque chose d’inutile. Un éditeur de code s’est ouvert. Ou bien Windows vous a proposé une liste de programmes dont vous n’avez jamais entendu parler. Ou bien vous êtes tombé sur une fenêtre austère pleine de dièses et d’astérisques. Ou bien il ne s’est rien passé du tout, et votre téléphone vous a répondu qu’aucune application ne pouvait ouvrir ce fichier.

Le fichier n’est ni cassé ni corrompu. Aucun système d’exploitation n’est livré avec une application qui affiche du Markdown en tant que Markdown, et ce seul fait explique toutes les variantes du problème — la mauvaise application, l’absence d’application, et l’application qui l’ouvre en vous montrant de la ponctuation au lieu d’une mise en forme.

Il y a deux choses bien distinctes que vous pouvez vouloir, et la plupart des conseils que l’on trouve en ligne les confondent. Vous voulez peut-être voir ce que contient le fichier, ce que chaque machine en votre possession sait déjà faire. Ou vous voulez le lire comme un document, avec de vrais titres, du gras et des tableaux, et cela demande quelque chose en plus. Le chemin diffère selon ce que vous cherchez, et il diffère encore sur un téléphone.

### En bref

Un fichier `.md` est du texte brut : tout ce qui ouvre un fichier texte l’ouvrira donc, le Bloc-notes sous Windows, TextEdit sous macOS, `less` sous Linux. Si vous devez en lire et en écrire régulièrement, [un éditeur Markdown](/blog/best-markdown-editors) est la meilleure réponse. Cette voie vous montre la source, ponctuation comprise. Pour le lire plutôt comme un document mis en forme, déposez-le dans une visionneuse qui tourne dans le navigateur, installez un éditeur doté d’un aperçu comme VS Code ou Obsidian, ou poussez-le sur GitHub. Si vous devez l’envoyer à quelqu’un d’autre, cessez de chercher une visionneuse et convertissez-le une bonne fois en HTML — un fichier `.html` s’ouvre d’un double-clic sur tout appareil muni d’un navigateur, ce qui n’est vrai de `.md` nulle part.

## Qu’est-ce qu’un fichier .md ?

Du texte brut. Voilà toute la réponse.

Ouvrez-en un dans le Bloc-notes et vous voyez chaque caractère qu’il contient. Pas de mise en forme cachée, pas de données binaires, pas de compression, rien qu’un programme spécial devrait décoder au préalable. Un fichier `.docx` est une archive zip pleine de XML, illisible dans un éditeur de texte ; un fichier `.md` est exactement ce dont il a l’air. L’extension de fichier Markdown indique seulement quelle convention suit le texte : Markdown, un petit ensemble de règles pour écrire de la mise en forme avec de la ponctuation ordinaire.

```markdown
## Release notes

**Version 2** fixes the login timeout.

- Faster start-up
- New export button

| Platform | Status |
| --- | --- |
| Windows | Shipped |
| macOS | In review |
```

Chaque `#` marque un titre, et plus il y en a, plus le titre est petit. Les astérisques mettent le texte en gras. Les tirets font une liste. Les barres verticales font un tableau. Les accents graves encadrent du code. Quelqu’un l’a écrit ainsi pour qu’un programme puisse plus tard en faire un document mis en forme, mais le texte brut reste lisible tel quel — c’est l’essentiel de l’intérêt de Markdown, et la raison pour laquelle on le retrouve dans les README, les journaux de versions, les applications de prise de notes et la sortie de tous les assistants d’intelligence artificielle.

Vous rencontrerez le même contenu sous d’autres extensions. `.markdown`, `.mdown`, `.mkd` et `.mdwn` désignent la même chose sous un nom plus long ou plus ancien ; elles s’ouvrent de la même manière et ne signifient rien de différent. `.mdx`, c’est du Markdown mêlé de composants JavaScript : toujours du texte, donc, mais qui contiendra des balises qu’aucune visionneuse ordinaire n’affiche. `.rmd`, c’est du R Markdown, avec des blocs de code exécutables. Si vous avez l’un de ces fichiers, tout ce qui suit s’applique encore à sa lecture — seule la syntaxe supplémentaire aura l’air bizarre.

Ce sur quoi les gens butent, c’est l’en-tête. Les fichiers exportés depuis un générateur de site statique, une chaîne de documentation ou une application de notes commencent souvent par un bloc encadré de trois tirets :

```markdown
---
title: Quarterly plan
author: Priya
date: 2026-08-14
---
```

C’est du front matter YAML : des métadonnées destinées à l’outil qui a construit la page, et non une partie du document. Certaines visionneuses le masquent, d’autres l’affichent en haut sous forme d’un paragraphe de lignes `clé : valeur`, quelques-unes en font un tableau. Aucun de ces comportements n’est un bogue. Cela vaut la peine de le reconnaître, car un document qui commence par ce qui ressemble à du charabia est le plus souvent un simple fichier sorti d’un générateur.

## Pourquoi le double-clic fait quelque chose d’étrange

Chaque système d’exploitation de bureau choisit le programme qui ouvrira un fichier d’après son extension, et chacun échoue à sa façon quand rien n’a correctement revendiqué cette extension.

**Windows n’est livré avec rien qui enregistre `.md`.** C’est donc ce qui s’est installé en dernier et a levé la main qui l’emporte. Sur un poste professionnel, il s’agit le plus souvent d’un éditeur de code, d’un client Git ou d’un outil arrivé avec la chaîne d’outils de développement — et si rien n’a revendiqué l’extension, vous obtenez la boîte de dialogue « Comment voulez-vous ouvrir ce fichier ? », une liste d’applications et aucune indication sur celle qui convient. Aucun de ces deux résultats ne dit quoi que ce soit sur votre fichier.

**macOS se rabat sur TextEdit**, qui l’ouvre volontiers et vous montre la source. Cela ressemble à un échec et n’en est pas un : TextEdit fait exactement son travail, qui consiste à afficher du texte. Sélectionnez le fichier et appuyez sur la barre d’espace pour obtenir Coup d’œil, et vous aurez en général la même chose — les caractères, pas la mise en forme.

**Sous Linux, tout dépend de votre bureau.** Le type MIME du fichier est en général détecté comme `text/markdown`, et la présence d’un gestionnaire enregistré pour ce type varie d’une distribution à l’autre. Vous pouvez vérifier ce que votre système croit avoir entre les mains :

```bash
xdg-mime query filetype notes.md
xdg-mime query default text/markdown
```

La première commande affiche le type, la seconde l’entrée de bureau qui ouvrira le fichier — ou rien du tout si aucune application ne l’a revendiqué.

**Les téléphones sont plus stricts que tout cela.** iOS et Android décident eux aussi du sort d’un fichier d’après son type, et si aucune application installée ne déclare prendre en charge Markdown, la feuille de partage ne vous propose simplement rien d’utile. Android dit souvent tout net qu’aucune application ne peut ouvrir le fichier. C’est là que la plupart des gens renoncent, et c’est aussi le cas le plus facile à régler, car sur un téléphone le navigateur est presque toujours la réponse.

Un éditeur de code qui ouvre vos notes de réunion n’est pas le signe que le fichier contient du code. Cela veut dire que cet éditeur est la dernière chose à avoir revendiqué l’extension. Des notes de ce genre proviennent en général d’un export, et le long identifiant dans le nom du fichier ou le dossier d’images posé à côté est l’indice qui trahit leur origine : [ce que produisent respectivement Notion, Obsidian et Confluence](/blog/markdown-from-notion-obsidian-and-confluence) décide si ces images fonctionnent encore une fois le fichier déplacé.

## Lire la source, ou lire le rendu

Avant d’installer quoi que ce soit, décidez lequel des deux vous voulez. Ce sont des problèmes différents, avec des outils différents.

**Lire la source**, c’est regarder les caractères tels qu’ils ont été écrits : `## Titre`, `**gras**`, les barres verticales d’un tableau. Pour un fichier court, cela convient parfaitement, et c’est souvent préférable — vous voyez exactement ce qui s’y trouve, y compris les cibles des liens, qu’une vue mise en forme dissimule derrière le texte du lien. Chaque machine que vous possédez en est déjà capable, et il n’y a rien à installer.

**Lire le rendu**, c’est voir la mise en forme appliquée : des titres dans une police plus grande, du gras en gras, des listes indentées, des tableaux en grilles, du code dans un bloc à chasse fixe. C’est ce qu’il vous faut pour un long document, car au-delà de deux écrans la ponctuation entre en concurrence avec les mots. Les listes imbriquées en sont le cas le plus net : trois niveaux d’indentation mêlant puces et numéros sont difficiles à tenir en tête sous forme de texte brut et deviennent évidents une fois rendus.

Il existe une troisième chose que l’on confond avec les deux autres, et c’est celle dont les gens ont réellement besoin étonnamment souvent : **en faire un fichier que quelqu’un d’autre pourra ouvrir**. Cela s’appelle de la conversion, pas de la consultation, et c’est traité plus bas. Si votre vrai problème est qu’un collègue n’arrive pas à ouvrir le `.md` que vous lui avez envoyé, aucune visionneuse de cette page ne vous aidera — il lui faut un autre fichier, pas une autre application.

## Comparatif rapide : toutes les façons d’ouvrir un fichier .md

| Option | Idéal pour | Ce que vous voyez | Prix |
| --- | --- | --- | --- |
| Bloc-notes, TextEdit, n’importe quel éditeur de texte | Vérifier ce que contient réellement le fichier | La source, avec toute la ponctuation | Gratuit, déjà installé |
| TransformPipe dans un navigateur | Lire le rendu et récupérer un fichier | Un document mis en forme, converti sur votre propre machine | Gratuit |
| Une extension Markdown pour navigateur | Ouvrir souvent des fichiers `.md` locaux dans un navigateur | Une page mise en forme sous une URL `file://` | Gratuit, MIT |
| VS Code | Les développeurs dont le fichier est déjà dans l’éditeur | La source et l’aperçu côte à côte | Gratuit |
| Obsidian | Lire régulièrement tout un dossier de Markdown | Des notes rendues ; les fichiers restent du texte brut sur le disque | Gratuit pour un usage personnel, commercial et associatif |
| MarkText | Un lecteur de bureau simple, sans compte | Le rendu au fil de la frappe | Gratuit, MIT |
| Typora | Écrire et lire du Markdown tous les jours | Le rendu remplace la source sur place | 14,99 $ hors taxes, jusqu’à 3 appareils (vérifié sur typora.io, le 8 septembre 2026) |
| GitHub, GitLab, Gist | Les fichiers qui vivent déjà dans un dépôt | Du GFM rendu dans l’interface web | Gratuit |
| `less`, `bat`, `glow` | Un terminal, un serveur, pas de bureau du tout | Du texte, ou un rendu dessiné dans le terminal | Gratuit, open source |
| Markor, Obsidian, Working Copy | Android et iOS, hors ligne | Un aperçu mis en forme sur l’appareil | Markor et Obsidian gratuits ; certains éditeurs iOS payants |
| Pandoc | Produire d’abord un autre format | Rien — il écrit un fichier que vous ouvrez ensuite | Gratuit, GPL |

## Ouvrir un fichier .md, plateforme par plateforme

### Windows

Toute machine Windows peut vous montrer le texte sans rien installer :

| Voie | Ce qu’il faut faire | Résultat |
| --- | --- | --- |
| Bloc-notes | Clic droit sur le fichier, Ouvrir avec, Bloc-notes | La source |
| Invite de commandes | `type notes.md` | La source, affichée |
| PowerShell | `Get-Content notes.md` | La source, affichée |
| Bloc-notes en ligne de commande | `notepad notes.md` | La source, dans une fenêtre |

Pour lire le rendu, le chemin le plus court sans rien installer passe par un navigateur : ouvrez une visionneuse qui tourne dans le navigateur et faites glisser le fichier sur la page. Si vous lisez du Markdown assez souvent pour que le double-clic compte, installez un éditeur doté d’un aperçu, puis définissez l’application par défaut pour que Windows cesse de poser la question.

**Changer l’application par défaut sous Windows.** Clic droit sur le fichier, choisissez Ouvrir avec, puis Choisir une autre application, sélectionnez le programme et cochez la case qui rend le choix permanent. Si l’application voulue n’apparaît pas dans la liste, prenez « Rechercher une autre application sur ce PC » et indiquez à Windows le fichier exécutable. Vous pouvez aussi passer par les Paramètres : Applications, puis Applications par défaut, puis chercher le type de fichier `.md` et y définir le gestionnaire. C’est cette seconde voie qu’il faut emprunter quand l’extension a été revendiquée par un logiciel que vous avez désinstallé depuis, ce qui laisse l’association pointer vers le vide.

### macOS

TextEdit est de toute façon l’application de repli : un double-clic vous montre donc en général la source. Depuis un terminal :

| Voie | Ce qu’il faut faire | Résultat |
| --- | --- | --- |
| TextEdit | Clic droit, Ouvrir avec, TextEdit | La source |
| Terminal | `open -e notes.md` | La source, dans TextEdit |
| Terminal | `less notes.md` | La source, page par page |
| Coup d’œil | Sélectionner le fichier, appuyer sur la barre d’espace | Le texte, pas la mise en forme |

Un piège propre à macOS : TextEdit peut être réglé pour traiter les fichiers comme du texte enrichi, et si c’est le cas, il peut proposer de convertir ou de reformater ce qu’il ouvre. La lecture est sans danger dans les deux cas, mais n’enregistrez pas depuis TextEdit sans être certain qu’il est en mode texte brut, car un fichier `.md` enregistré en RTF n’est plus un fichier `.md`.

**Changer l’application par défaut sous macOS.** Sélectionnez le fichier, appuyez sur Commande-I pour afficher les informations, ouvrez la section « Ouvrir avec », choisissez l’application, puis cliquez sur « Tout modifier » pour que le réglage s’applique à tous les fichiers `.md` et pas seulement à celui-ci. Le clic sur « Tout modifier » est la partie que les gens oublient ; sans lui, le réglage ne vaut que pour un fichier et le téléchargement suivant vous surprend de nouveau.

### Linux

L’éditeur de votre bureau l’ouvrira — GNOME Text Editor, Kate, Mousepad, ce que votre distribution fournit — et tout ce qui vit dans le terminal aussi :

| Voie | Ce qu’il faut faire | Résultat |
| --- | --- | --- |
| Pagination | `less notes.md` | La source, page par page, avec recherche par `/` |
| Affichage | `cat notes.md` | La source, d’un seul tenant |
| Coloration syntaxique | `bat notes.md` | La source avec le Markdown mis en couleur |
| Rendu dans le terminal | `glow notes.md` | Titres, listes et tableaux dessinés en texte |

`glow` est l’outil intéressant si vous habitez dans un terminal : il rend le Markdown dans le terminal lui-même, vous obtenez donc une mise en forme sans la moindre application graphique. Il est gratuit et sous licence MIT. `bat` ne rend rien, il colore la source, ce qui est un gain plus modeste mais utile sur les fichiers longs.

**Changer l’application par défaut sous Linux.** Passez par les Propriétés de votre gestionnaire de fichiers, onglet « Ouvrir avec », ou réglez cela en ligne de commande :

```bash
xdg-mime default org.gnome.TextEditor.desktop text/markdown
```

Remplacez l’entrée de bureau par celle de l’application que vous voulez. Si `xdg-mime query filetype` signale autre chose que `text/markdown` — `text/plain` est fréquent —, définissez plutôt la valeur par défaut pour ce type-là, faute de quoi votre réglage semblera ne rien faire.

### iOS et iPadOS

Il n’y a pas de système de fichiers sur lequel faire un clic droit : les possibilités sont donc plus étroites et l’ordre compte. Essayez-les dans cette séquence :

1. **Touchez le fichier dans Fichiers.** Coup d’œil affiche souvent le texte. Cela répond à la question pour un fichier court et ne coûte rien.
2. **Ouvrez-le dans une visionneuse qui tourne dans le navigateur.** Safari comme Chrome sous iOS savent aller chercher un fichier dans Fichiers via le sélecteur de fichiers d’une page : une visionneuse qui s’exécute dans le navigateur fonctionne donc sur un téléphone exactement comme sur un portable. C’est la seule voie qui ne demande aucune installation et vous donne quand même la mise en forme.
3. **Installez une application qui déclare prendre en charge Markdown.** Obsidian est gratuit et lit directement un dossier de fichiers `.md`. Working Copy est un client Git qui parcourt les dépôts et affiche un aperçu du Markdown ; son installation est gratuite, avec un déverrouillage payant dont le prix figure sur l’App Store.
4. **Renommez-le en `.txt`.** Grossier, efficace, et cela suffit pour que Coup d’œil et toutes les applications de texte le traitent comme du texte. Conservez une copie sous le nom d’origine si le fichier doit repartir ailleurs ensuite.

### Android

Android est la plateforme la plus susceptible de refuser tout net, et aussi la plus facile à dépanner :

1. **Essayez la visionneuse de texte intégrée à votre gestionnaire de fichiers.** Certains en proposent une, d’autres non.
2. **Installez Markor.** C’est un éditeur de texte pour Android, gratuit et sous licence Apache 2.0, disponible sur F-Droid et GitHub. Il stocke les fichiers en texte brut sur l’appareil, rien n’est donc converti dans un format propriétaire à votre insu, et il affiche un aperçu du Markdown sous forme mise en forme.
3. **Utilisez une visionneuse dans le navigateur.** Chrome sous Android sait confier un fichier local au sélecteur de fichiers d’une page, ce qui vous donne un document rendu sans rien installer.
4. **Renommez-le en `.txt`.** Même astuce, même réserve.

Google Drive affiche également le contenu d’un fichier texte qu’il héberge, ce qu’il est utile de savoir quand le fichier est arrivé sous forme de lien Drive plutôt que de téléchargement.

## Les options, une par une

### L’éditeur de texte que vous avez déjà — idéal pour découvrir ce que vous avez entre les mains

Bloc-notes, TextEdit, GNOME Text Editor, Kate, `less`, `nano`. Chacun d’eux ouvre correctement un fichier `.md`, tout de suite, sans rien télécharger.

| Avantages | Inconvénients |
| --- | --- |
| Déjà installé sur toutes les machines | Aucune mise en forme : vous lisez la ponctuation |
| Montre le fichier exactement tel qu’il est, cibles des liens et front matter compris | Les longs documents à listes imbriquées deviennent difficiles à suivre |
| Ne peut rien abîmer tant que vous n’enregistrez pas | Pas de rendu des tableaux : un tableau large est un mur de barres verticales |

**Prix :** gratuit, déjà installé.

**Détails techniques et fonctions**

- Accepte n’importe quelle variante de Markdown, puisqu’il n’analyse rien
- Montre le front matter YAML, les commentaires HTML et le HTML brut que des vues rendues peuvent masquer
- Recherche à l’intérieur du fichier : `Ctrl-F` dans un éditeur, `/` dans `less`
- Sans danger pour n’importe quel fichier, puisque rien n’y est exécuté ni récupéré

**Pour qui ?** Pour tout le monde, d’abord. Ouvrez le fichier dans un éditeur de texte avant de décider qu’il vous faut un outil. Une fois sur deux, le fichier fait quarante lignes et vous avez votre réponse en dix secondes.

### TransformPipe dans un navigateur — idéal pour lire le rendu sans rien installer

Déposez le fichier `.md` sur la page et lisez-le comme un document. Tout tourne dans le navigateur : déconnecté, le fichier n’est téléversé nulle part, ce qui compte quand le document est un projet de contrat ou un manuel d’exploitation interne plutôt qu’un README public.

| Avantages | Inconvénients |
| --- | --- |
| Pas d’installation, pas de compte, fonctionne sur un téléphone comme sur un portable | Demande un onglet de navigateur : ce n’est donc pas un gestionnaire pour le double-clic |
| Rien n’est téléversé tant que vous n’êtes pas connecté | Un document à la fois, ou plusieurs enchaînés en un seul |
| Rend le GitHub Flavored Markdown : les tableaux et les listes de tâches apparaissent comme tels | Ce n’est pas un éditeur : il lit et convertit, il ne vous aide pas à écrire |
| Exporte un fichier HTML autonome s’il faut transmettre le document | |

**Prix :** gratuit. Un compte ajoute l’historique, le partage et une API, gratuits eux aussi.

**Détails techniques et fonctions**

- GFM : tableaux, listes de tâches, texte barré, liens automatiques, blocs de code encadrés
- L’export est un document HTML complet, styles intégrés et sans aucune requête externe
- Le HTML brut présent dans la source traverse un assainisseur à liste blanche fixe avant d’atteindre la page
- Téléchargement en `.html`, en `.md` ou en texte brut, ou impression en PDF via la boîte de dialogue du navigateur lui-même
- Convertit aussi HTML, Word, CSV et JSON vers Markdown, et la même conversion est disponible depuis une API REST, une interface en ligne de commande, une GitHub Action et un serveur MCP

**Pour qui ?** Pour quiconque a un fichier et aucune envie d’installer un logiciel pour lui, et pour quiconque a pour étape suivante d’envoyer le document à quelqu’un d’autre.

### Une extension Markdown pour navigateur — idéale pour ouvrir des fichiers locaux à répétition

Des extensions comme Markdown Viewer rendent les fichiers `.md` au moment où vous les ouvrez dans le navigateur : une URL `file:///` devient alors une page mise en forme.

| Avantages | Inconvénients |
| --- | --- |
| Transforme le navigateur en visionneuse `.md` pour les fichiers locaux | Exige d’accorder à l’extension l’accès aux URL de fichiers |
| Rend dès l’ouverture du fichier, sans glisser-déposer | Une extension ayant accès aux fichiers peut lire les fichiers locaux que vous ouvrez |
| Variantes et thèmes configurables dans les meilleures | La qualité et la maintenance des extensions varient beaucoup |

**Prix :** gratuit, sous licence MIT pour Markdown Viewer.

**Détails techniques et fonctions**

- Disponible pour Chrome, Firefox, Edge, Opera, Brave, Chromium et Vivaldi
- Exige d’activer explicitement « Autoriser l’accès aux URL de fichier » sur la page de détails de l’extension avant que les fichiers locaux ne soient rendus
- Le rendu a lieu dans la page : la recherche, le zoom et l’impression du navigateur fonctionnent donc normalement

**Pour qui ?** Pour les gens qui ouvrent des fichiers Markdown locaux toutes les semaines et veulent que le navigateur s’en charge sans détour. Lisez d’abord les autorisations : l’interrupteur des URL de fichiers est toute la raison d’être de l’extension, et aussi la raison de n’en choisir qu’une à qui vous confieriez votre disque.

### VS Code — idéal s’il est déjà ouvert

VS Code intègre un aperçu Markdown, bâti sur markdown-it. Ouvrez le fichier et appuyez sur le bouton d’aperçu, ou divisez la fenêtre pour avoir la source et le rendu côte à côte.

| Avantages | Inconvénients |
| --- | --- |
| Déjà installé chez la plupart des développeurs | Un gros téléchargement si vous ne voulez lire qu’un fichier |
| L’aperçu suit CommonMark de près, avec les ajouts de GFM | Le style de l’aperçu est celui de l’éditeur, pas celui du document |
| La vue divisée montre ensemble la source et le résultat | Ce n’est pas un lecteur : c’est un éditeur de code doté d’un volet d’aperçu |

**Prix :** gratuit.

**Détails techniques et fonctions**

- Aperçu bâti sur markdown-it : son rendu correspond donc au comportement de cet analyseur
- Des extensions ajoutent l’export en HTML et en PDF, ainsi que des syntaxes supplémentaires comme les diagrammes
- Gère un dossier entier de fichiers Markdown, avec recherche dans l’ensemble
- Affiche le front matter comme de la source, sauf si une extension en fait quelque chose

**Pour qui ?** Pour les développeurs dont le fichier est déjà dans l’éditeur. Si vous ouvrez VS Code exprès pour lire une pièce jointe `.md`, un onglet de navigateur est plus rapide. Et si l’étape suivante est un fichier `.html`, l’aperçu ne vous en donnera pas : [Markdown vers HTML dans VS Code](/blog/markdown-to-html-in-vs-code) passe en revue les extensions qui exportent, et explique pourquoi aucune ne reprend par défaut l’apparence de l’aperçu.

### Obsidian — idéal pour un dossier de Markdown auquel vous revenez sans cesse

Obsidian est une application de notes dont tout le stockage consiste en fichiers Markdown bruts, dans un dossier ordinaire sur le disque. Montrez-lui un répertoire et chaque fichier `.md` qu’il contient devient une note lisible et reliée aux autres.

| Avantages | Inconvénients |
| --- | --- |
| Les fichiers restent du `.md` brut sur le disque, lisible par n’importe quoi d’autre | Veut un dossier, appelé coffre, pas un fichier isolé |
| Fonctionne sous Windows, macOS, Linux, iOS et Android | Sa propre syntaxe de liens et d’insertions n’est pas portable vers d’autres moteurs de rendu |
| Lit et rend sans compte | Toute une application à apprendre si vous voulez seulement lire |

**Prix :** gratuit pour un usage personnel, commercial et associatif ; les licences commerciales sont facultatives et vendues à l’année en guise de soutien (vérifié sur obsidian.md, le 8 septembre 2026).

**Détails techniques et fonctions**

- Local d’abord : le coffre est un répertoire, et rien n’oblige à se connecter
- Rend le GFM, plus ses propres `[[liens]]` de style wiki et ses insertions
- Les applications mobiles pour iOS et Android lisent les mêmes fichiers
- Parce que le stockage est du texte brut, tout ce que vous y écrivez reste ensuite ouvrable dans le Bloc-notes

**Pour qui ?** Pour quiconque a accumulé un dossier de Markdown — notes exportées, copie locale d’une documentation, wiki personnel — et y lit régulièrement plutôt qu’une seule fois.

### MarkText — le meilleur lecteur de bureau simple, sans compte

MarkText est un éditeur Markdown de bureau open source qui rend au fil de la frappe, et fait donc aussi office de lecteur.

| Avantages | Inconvénients |
| --- | --- |
| Gratuit et sous licence MIT | Le rythme de développement est plus lent que celui des éditeurs commerciaux |
| S’installe sous Windows 10 ou 11, macOS 11 ou plus récent, et Linux | Moins de fonctions que Typora ou Obsidian |
| Disponible via Homebrew, Chocolatey et Winget | Reste une installation, pour un travail qu’un onglet de navigateur sait faire |

**Prix :** gratuit, sous licence MIT.

**Détails techniques et fonctions**

- Installeurs Windows x64 et arm64, versions macOS arm64 et x64 sans binaire universel, et binaires Linux depuis la page des versions (vérifié sur github.com/marktext/marktext, le 8 septembre 2026)
- Rend sur place plutôt que dans un volet d’aperçu séparé
- Exporte en HTML et en PDF le fichier qu’il a ouvert

**Pour qui ?** Pour les gens qui veulent qu’une application de bureau possède l’extension `.md`, sur une machine où l’achat d’un éditeur payant n’est pas envisageable.

### Typora — idéal si vous lisez et écrivez du Markdown tous les jours

Typora remplace le Markdown par son rendu au fil de la frappe : il n’y a donc ni volet d’aperçu ni vue de la source, sauf demande expresse. C’est le plus confortable de cette liste pour y rester des heures, et le seul ici qui coûte de l’argent.

| Avantages | Inconvénients |
| --- | --- |
| Le rendu est le document : aucun volet divisé à gérer | Payant, et uniquement pour le bureau |
| Exporte en HTML, PDF et Word | Masquer la syntaxe agace certains rédacteurs |
| Fichiers locaux, rien n’est téléversé | Ne vaut pas l’achat pour ouvrir une seule pièce jointe |

**Prix :** 14,99 $ hors taxes, pour un maximum de 3 appareils, avec 15 jours d’essai gratuit (vérifié sur typora.io, le 8 septembre 2026).

**Détails techniques et fonctions**

- Édition WYSIWYG, avec un mode source disponible quand vous avez besoin de voir les signes
- Les thèmes sont du CSS : l’export peut donc être habillé de votre propre charte
- Exporte via Pandoc pour les formats qu’il n’écrit pas lui-même

**Pour qui ?** Pour les gens dont le travail passe quotidiennement par Markdown. Comme lecteur `.md` ponctuel, c’est un mauvais achat.

### GitHub, GitLab et Gist — idéal quand le fichier vit déjà dans un dépôt

Les deux rendent le GitHub Flavored Markdown dans leur interface web, et les deux lisent un fichier assez bien pour que vous n’ayez besoin de rien d’autre. Ni l’un ni l’autre n’est une visionneuse pour les fichiers de votre disque.

| Avantages | Inconvénients |
| --- | --- |
| Rend le GFM de façon fiable, tableaux et listes de tâches compris | Le fichier doit d’abord être poussé quelque part |
| Rien à installer ; un lien que n’importe qui peut ouvrir | Ne convient pas à un document confidentiel |
| Gist fonctionne pour un fichier isolé | Pas de bouton d’export : ce que vous enregistrez, c’est leur page et leur balisage |

**Prix :** gratuit.

**Pour qui ?** Pour quiconque a un fichier qui a de toute façon sa place sur un hébergeur de code. Collez un fichier unique dans un Gist privé et vous obtenez une vue rendue en quelques secondes — mais seulement pour un contenu que vous acceptez de déposer là.

### less, bat et glow — idéal sur un serveur sans bureau

Parfois le fichier se trouve sur une machine atteinte en SSH, sans navigateur ni interface graphique. Le terminal offre trois niveaux de réponse.

| Avantages | Inconvénients |
| --- | --- |
| Fonctionne sans le moindre environnement graphique | Le rendu dans un terminal a ses limites : pas d’images, les tableaux se replient dans une fenêtre étroite |
| `less` est déjà présent sur pratiquement toutes les machines Unix | `bat` et `glow` sont des installations supplémentaires |
| `glow` rend les titres, les listes et les tableaux en texte mis en forme | Personne ne choisirait cette voie sur un portable |

**Prix :** gratuit, open source ; `glow` est sous licence MIT.

**Détails techniques et fonctions**

- `less notes.md` affiche la source page par page et la fouille avec `/`
- `bat notes.md` affiche la source avec la coloration syntaxique du Markdown
- `glow notes.md` dessine un rendu dans le terminal, stylé pour un fond sombre ou clair

**Pour qui ?** Pour quiconque lit un README ou un manuel d’exploitation sur un serveur, là où « installer une application de bureau » n’est pas une phrase qui veut dire quelque chose.

### Markor, Obsidian mobile et Working Copy — idéal sur un téléphone

C’est sur mobile que « il suffit d’ouvrir le fichier » échoue le plus durement : cela vaut donc la peine de connaître une application par plateforme.

| Avantages | Inconvénients |
| --- | --- |
| Markor est gratuit, sous Apache 2.0, et garde les fichiers en texte brut sur l’appareil | Chacune est une installation par plateforme, pour un fichier que vous ne lirez peut-être qu’une fois |
| Obsidian tourne sous iOS comme sous Android et lit un dossier de `.md` | La gestion des fichiers est plus laborieuse sur mobile que sur un ordinateur |
| Working Copy affiche un aperçu du Markdown depuis un dépôt Git sous iOS | Certains éditeurs iOS sont payants, avec le montant fixé sur l’App Store |

**Prix :** Markor gratuit, Apache 2.0. Obsidian gratuit. Working Copy s’installe gratuitement, avec un déverrouillage payant dont le prix figure sur l’App Store.

**Détails techniques et fonctions**

- Markor : Android, depuis F-Droid ou GitHub, sans publicité, fichiers interopérables avec tout autre outil de texte brut
- Obsidian mobile : ouvre le même dossier de coffre que l’application de bureau
- Working Copy : un client Git, donc la bonne réponse quand le fichier se trouve dans un dépôt plutôt que dans un téléchargement

**Pour qui ?** Pour les gens qui lisent du Markdown sur un téléphone plus d’une fois. Pour une pièce jointe unique, une visionneuse dans le navigateur ne demande aucune installation et fonctionne sur les deux plateformes.

### Pandoc — idéal quand la réponse est un autre fichier

Pandoc est un convertisseur de documents en ligne de commande écrit en Haskell. Il n’affiche rien ; il écrit un nouveau fichier, que vous ouvrez ensuite dans quelque chose qui, lui, affiche.

| Avantages | Inconvénients |
| --- | --- |
| Convertit le Markdown en HTML, PDF, Word, EPUB et bien d’autres | Demande une installation et un terminal |
| `--standalone` produit un document complet plutôt qu’un fragment | Pas une visionneuse du tout : pas de fenêtre, pas d’aperçu |
| Scriptable : il traite un dossier aussi facilement qu’un fichier | Ses gabarits et ses dialectes forment leur propre courbe d’apprentissage |

**Prix :** gratuit, sous licence GPL.

**Détails techniques et fonctions**

- Lit plusieurs dialectes de Markdown, choisis explicitement, et écrit une quarantaine de formats de sortie
- `--standalone` emballe la sortie ; `--embed-resources` intègre les images et le CSS dans un seul fichier
- Tourne sans interface : il a donc sa place dans une chaîne de build ou une tâche planifiée, pas dans une séance de lecture

**Pour qui ?** Pour les gens qui ont besoin du document dans un autre format, de façon répétée, sur une machine qu’ils contrôlent. Pour un fichier et une lecture, c’est plus d’outillage que la tâche n’en demande.

## On vous a envoyé un fichier .md par courriel et vous n’avez rien d’installé

C’est la variante la plus fréquente de la question, et elle a une réponse courte : n’installez rien.

Téléchargez la pièce jointe, ouvrez une visionneuse qui tourne dans le navigateur et faites glisser le fichier sur la page. Cela fonctionne sur un portable professionnel à la politique logicielle verrouillée, sur un téléphone et sur une machine empruntée. Vérifiez ce que la page annonce faire du fichier avant d’y déposer un document confidentiel — avec un outil qui travaille côté navigateur, rien n’est téléversé, et vous pouvez le confirmer en ouvrant l’onglet réseau et en regardant qu’il ne se passe rien.

Si vous ne pouvez pas non plus utiliser un onglet de navigateur, deux solutions de repli :

- **Renommez-le.** Changez `notes.md` en `notes.txt` et toutes les visionneuses de texte de la machine, y compris l’aperçu de pièce jointe de votre webmail, vous montreront la source. Rien ne change dans le fichier, sauf son nom.
- **Ouvrez l’aperçu de la pièce jointe.** La plupart des webmails affichent une pièce jointe textuelle en ligne plutôt que de la télécharger, et un fichier `.md` est une pièce jointe textuelle.

Et si cela se répète — si un collègue vous envoie régulièrement des fichiers `.md` et que vous cherchez chaque fois un moyen de les lire —, le correctif se situe en amont de vous. Demandez-lui d’envoyer plutôt du HTML ou un lien. Une pièce jointe `.md` est un fichier qui ne s’ouvre correctement que pour les gens ayant déjà résolu ce problème.

## Lire et convertir sont deux travaux différents

Une visionneuse règle votre problème. Elle ne règle pas celui de la personne suivante.

S’il faut envoyer le document par courriel, l’imprimer, le joindre à un ticket, le mettre sous les yeux d’un client, ou pouvoir encore l’ouvrir dans cinq ans, convertissez-le une bonne fois en HTML. Un fichier `.html` s’ouvre d’un double-clic sur tout ce qui possède un navigateur, mise en forme intacte, sans rien à installer ni rien à expliquer. C’est la propriété que `.md` n’a sur aucune plateforme, et c’est toute la raison d’être de cet article. [Ce qui se passe réellement quand du Markdown devient du HTML](/blog/markdown-to-html-converter) mérite d’être compris avant de choisir un outil, et si le lecteur ne devrait pas avoir affaire à une pièce jointe du tout, vous pouvez à la place [le publier sous forme de lien en lecture seule](/blog/share-a-markdown-document-as-a-link).

L’arbitrage s’inverse tant que vous êtes encore en train d’écrire. Un éditeur doté d’un aperçu en direct justifie alors son téléchargement, parce que vous regardez le document des dizaines de fois par jour. Un convertisseur est fait pour le moment où vous avez fini et où quelqu’un d’autre doit lire. Choisir entre les deux revient en réalité à se demander qui est le prochain lecteur — et si cette question revient avant l’écriture du fichier plutôt qu’après, la décision qui se cache dessous est [de savoir si le document aurait dû être du Markdown ou du HTML dès le départ](/blog/markdown-vs-html).

## Là où le choix évident échoue

Le conseil évident est « installez VS Code » ou « ouvrez-le simplement dans le Bloc-notes », et les deux ont raison une fois sur deux. Voici ce que chacun vous coûte.

**Le texte brut masque la structure exactement quand vous en avez besoin.** Un fichier de quarante lignes se lit très bien en source. Un manuel d’exploitation de soixante pages avec quatre niveaux d’imbrication, une douzaine de tableaux et du code en ligne une ligne sur trois, non : vous finissez par analyser la ponctuation au lieu de lire les mots, et vous passerez à côté de choses. L’échec est silencieux — vous ne remarquez pas l’élément que vous avez sauté.

**Installer un éditeur pour un seul fichier est un mauvais marché, et difficile à défaire.** Un éditeur de code, c’est un gros téléchargement, une visite guidée de réglages que vous n’avez pas demandée, et une nouvelle application par défaut pour une extension dont vous ne voulez peut-être pas qu’il s’empare. Il a aussi tendance à ouvrir le Markdown avec la coloration syntaxique active, ce qui n’est pas la même chose que de le rendre — les dièses sont toujours là, ils ont simplement changé de couleur.

**Les visionneuses « en ligne » signifient en général téléversé.** « En ligne » et « dans le navigateur » sonnent pareil et ne le sont pas. Certains outils envoient votre fichier à un serveur pour le convertir ; d’autres font le travail localement et n’envoient rien. Pour un README public, la différence est sans importance. Pour un contrat, une note médicale, un plan non publié ou un rapport d’incident interne, c’est la seule question qui compte, et la réponse est écrite sur la page ou vérifiable dans l’onglet réseau.

**Les extensions de navigateur veulent accéder à votre disque.** Une extension qui rend des fichiers `.md` locaux ne peut le faire qu’avec l’autorisation de lire les URL de fichiers, et cette autorisation n’est pas étroite. C’est un marché raisonnable si vous lisez du Markdown en permanence, et un mauvais marché pour une pièce jointe unique.

**Les visionneuses ne sont pas d’accord sur Markdown.** Les tableaux, les listes de tâches, le texte barré et les liens automatiques viennent du GitHub Flavored Markdown et non de la syntaxe d’origine : une visionneuse strictement CommonMark affiche donc des barres verticales brutes là où vous attendiez un tableau. Le fichier va bien ; c’est la visionneuse qui met en œuvre une variante plus petite. C’est de loin le signalement « mon Markdown est cassé » le plus fréquent, et ce n’est presque jamais le fichier. Les variantes valent la peine d’être connues si vous manipulez du Markdown venu de plusieurs sources.

**Les images ne seront pas dans le fichier.** Markdown référence les images par leur chemin ; il ne les contient pas. Ouvrez un fichier `.md` exporté avec un dossier `images/` à côté de lui, dans une visionneuse qui n’a reçu que le `.md`, et chaque image devient une icône cassée. Ce n’est pas la visionneuse qui échoue, c’est [ce que font les chemins relatifs quand un fichier se déplace](/blog/images-and-links-that-still-work).

**Changer l’application par défaut règle le double-clic et rien d’autre.** Cela vaut la peine d’être fait, et cela ne rend pas le fichier transportable. Votre machine ouvre désormais proprement les `.md`. La personne à qui vous l’envoyez se retrouve là où vous en étiez au départ.

## Comment choisir

1. **Ouvrez-le d’abord dans un éditeur de texte.** Cela prend dix secondes, ne demande rien, et vous dit exactement ce que vous avez entre les mains — la longueur, le front matter, la présence de tableaux, et même s’il s’agit bien de Markdown. Sautez cette étape et vous risquez d’installer une application pour lire quarante lignes de texte.
2. **Comptez la fréquence à laquelle cela se reproduira.** Une fois, c’est un onglet de navigateur. Chaque semaine, c’est une extension de navigateur ou un éditeur que vous avez déjà. Tous les jours, c’est une application dans laquelle vous aimez vous installer, et c’est le seul cas où payer pour l’une d’elles a du sens.
3. **Décidez si le contenu a le droit de quitter la machine.** Si ce n’est pas le cas, écartez tout ce qui téléverse avant même de comparer quoi que ce soit d’autre, car ce n’est pas une préférence sur laquelle on peut revenir après coup.
4. **Confrontez la variante au fichier.** Si le document comporte des tableaux ou des listes de tâches, la visionneuse doit gérer le GFM. Ouvrez un fichier représentatif et regardez les tableaux avant de vous engager ; une visionneuse qui affiche des barres verticales continuera d’en afficher.
5. **Demandez-vous qui le lira ensuite.** Si la réponse est « vous seul », n’importe quelle visionneuse d’ici fera l’affaire. Si la réponse est un collègue, un client ou vous-même plus tard sur un autre appareil, ce n’est pas du tout une visionneuse qu’il vous faut — c’est un fichier converti, et le choix de la visionneuse cesse alors d’avoir de l’importance.

## Conclusion

Ouvrez d’abord le fichier dans le Bloc-notes, dans TextEdit ou avec `less` : c’est du texte brut, il s’ouvrira, et il vous dira exactement ce que vous avez. Si la source répond à votre question, arrêtez-vous là. Si le document est assez long pour que la ponctuation gêne, lisez le rendu — un onglet de navigateur pour un fichier, une extension ou un éditeur si c’est une habitude hebdomadaire, Markor ou Obsidian sur un téléphone. Et si le vrai problème est que le fichier doit atteindre quelqu’un qui ne devrait jamais avoir à voir un dièse, convertissez-le une bonne fois avec [la conversion de Markdown vers HTML de TransformPipe](/) : elle tourne dans votre navigateur, rien n’est téléversé tant que vous n’êtes pas connecté, et ce que vous récupérez est un unique fichier HTML autonome qui s’ouvre d’un double-clic sur tous les appareils qu’on est susceptible de vous mettre entre les mains.

## FAQ

### Pourquoi mon fichier .md s’ouvre-t-il dans un éditeur de code ?

Parce que Windows et macOS choisissent l’application d’après l’extension du fichier, et que rien n’est livré en revendiquant `.md`. C’est le programme ayant enregistré l’extension le plus récemment qui l’emporte, et sur une machine équipée d’outils de développement il s’agit le plus souvent d’un éditeur de code. Cela ne dit rien du contenu de votre fichier.

### Puis-je ouvrir un fichier .md dans Word ?

Word l’ouvrira si vous le pointez directement sur le fichier, et il le traitera comme un document de texte brut — vous verrez les dièses et les astérisques, pas des titres et du gras. Word n’est pas un moteur de rendu Markdown : cela ne sert donc qu’à lire la source. S’il vous faut vraiment le document au format Word, convertissez-le plutôt que de l’ouvrir.

### Quelle est la différence entre .md et .markdown ?

Aucune. Les deux extensions désignent le même texte brut suivant les mêmes conventions, et `.mdown`, `.mkd` et `.mdwn` sont encore la même chose. Les seules extensions qui diffèrent réellement sont `.mdx`, qui y mêle des composants JavaScript, et `.rmd`, c’est-à-dire du R Markdown avec des blocs de code exécutables.

### Est-il sans danger d’ouvrir un fichier .md qu’on m’a envoyé ?

Le lire dans un éditeur de texte est totalement sans danger : rien dans le fichier ne s’exécute et rien n’est récupéré. Le rendre est une question légèrement différente, car Markdown autorise le HTML brut : un fichier `.md` peut donc transporter des balises `<script>` et des URL `javascript:` qu’un moteur de rendu fidèle transmet à votre navigateur. Utilisez une visionneuse qui assainit le HTML, et sachez qu’un éditeur de texte brut contourne entièrement la question.

### Comment changer le programme qui ouvre les fichiers .md ?

Sous Windows : clic droit, Ouvrir avec, Choisir une autre application, sélectionnez le programme, cochez la case qui rend le choix permanent — ou réglez cela dans Paramètres, Applications, Applications par défaut, en cherchant `.md`. Sous macOS : Lire les informations, Ouvrir avec, choisissez l’application, puis cliquez sur Tout modifier. Sous Linux : l’onglet « Ouvrir avec » du gestionnaire de fichiers, ou `xdg-mime default <app>.desktop text/markdown`.

### Puis-je lire un fichier .md sur mon téléphone sans rien installer ?

Oui. Touchez-le dans Fichiers sous iOS ou dans votre gestionnaire de fichiers sous Android et vous obtiendrez souvent le texte dans un aperçu. Pour la mise en forme sans installation, ouvrez une visionneuse qui tourne dans le navigateur, dans Safari ou Chrome, et choisissez le fichier via le sélecteur de fichiers de la page — les navigateurs mobiles savent lire un fichier local de cette façon, et c’est la seule voie qui fonctionne sur les deux plateformes.

### Faut-il convertir un fichier .md pour le lire ?

Non. La conversion sert quand quelqu’un d’autre doit le lire, ou quand vous avez besoin du document dans un autre format. Pour votre propre lecture, un éditeur de texte ou une visionneuse suffit, et ni l’un ni l’autre ne modifie le fichier. Convertissez quand la destination est une personne, une imprimante ou une archive plutôt que votre propre écran.
