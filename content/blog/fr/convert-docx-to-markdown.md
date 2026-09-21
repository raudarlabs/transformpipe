---
title: "Convertir un DOCX en Markdown : les voies du navigateur, de Pandoc et de mammoth"
description: "Convertir un .docx en Markdown de trois façons, comprendre pourquoi l’archive décide de ce qui survit, et la liste de contrôle pour repérer ce qui a été perdu"
date: 2026-09-04
tag: Conversion
keywords: docx vers markdown, convertir docx en markdown, docx en md, pandoc docx vers markdown, mammoth docx vers markdown, docx vers markdown en ligne de commande, convertir docx sans téléversement, numérotation docx markdown
---

Vous avez un fichier Word et il vous faut du Markdown. Premier réflexe raisonnable : ouvrir le `.docx` dans un éditeur de texte pour voir à quoi vous avez affaire. Ce que vous obtenez est un écran de déchets binaires avec les lettres `PK` en tête et quelques noms de fichiers reconnaissables enfouis dedans. Rien sur cet écran n’évoque un document.

Cet écran est pourtant la chose la plus utile que vous verrez de la journée, parce qu’il vous dit en quoi consiste réellement la conversion. Un `.docx` n’est pas un fichier contenant du texte. C’est une archive zip contenant une douzaine de fichiers XML, et les mots sont dans l’un d’eux tandis que le sens des mots est réparti entre les autres. Le convertir en Markdown revient à décompresser l’archive, à résoudre ces renvois croisés, et à jeter tout ce pour quoi Markdown n’a pas de syntaxe.

C’est pourquoi le même document se convertit différemment selon les outils, et pourquoi les échecs sont si précis. Les titres arrivent mais la liste numérotée est ressortie en simples paragraphes. Le tableau est arrivé sans sa ligne d’en-tête. Les images sont soit absentes, soit présentes sous la forme d’une seule ligne de base64 longue de quarante mille caractères. Les notes de bas de page ne sont tout simplement pas là, et rien ne vous l’a dit. Chacun de ces cas a une cause que vous pouvez trouver en deux minutes environ, une fois que vous savez où regarder.

Voici le mode d’emploi : ce qu’il y a dans le fichier, trois voies pour en sortir, puis la partie que la plupart des guides sautent — comment lire le résultat et déterminer ce qu’il a perdu.

### En bref

Pour un seul document, prenez un convertisseur qui tourne dans le navigateur : déposez le `.docx`, lisez le Markdown, aucune installation et rien de téléversé. Pour plus d’un document, pour des images qu’il vous faut sur le disque, ou pour un fichier passé par une relecture, installez **Pandoc** et utilisez `pandoc -f docx -t gfm --wrap=none --extract-media=./media`. Pour une conversion à l’intérieur de votre propre code, utilisez **mammoth** pour produire du HTML puis une étape HTML vers Markdown distincte derrière — c’est ce que recommandent les auteurs de mammoth eux-mêmes. Ensuite, vérifiez trois choses dans la sortie avant de jeter le `.docx` : si les listes numérotées sont encore des listes, où sont passées les images, et si les notes de bas de page existent tout court.

## Ce qu’est vraiment un .docx, et pourquoi un éditeur de texte affiche du charabia

Un `.docx` est une archive zip au format Office Open XML, normalisé sous les noms ECMA-376 et ISO/IEC 29500. Tout fichier zip sur terre commence par les deux octets `PK`, les initiales de Phil Katz, auteur du format d’origine — c’est donc la première chose que votre éditeur de texte vous montre, suivie de données compressées qu’il n’a aucun moyen d’afficher.

Renommez une copie en `.zip`, décompressez-la, et le document se transforme en répertoire :

```
$ cp report.docx report-copy.zip
$ unzip -l report-copy.zip
  [Content_Types].xml
  _rels/.rels
  word/document.xml
  word/styles.xml
  word/numbering.xml
  word/settings.xml
  word/fontTable.xml
  word/footnotes.xml
  word/media/image1.png
  word/media/image2.jpeg
  word/_rels/document.xml.rels
  docProps/core.xml
  docProps/app.xml
```

La liste exacte varie, et la variation est la partie intéressante. `word/numbering.xml` n’est là que si le document a un jour contenu une liste. `word/footnotes.xml` n’est là que s’il a des notes de bas de page. `word/media/` n’existe que s’il y a des images. `word/header1.xml` apparaît si quelqu’un a défini un en-tête courant. Une archive à laquelle il manque l’une de ces parties est une archive à laquelle il manque la fonctionnalité correspondante, et aucun convertisseur ne peut l’inventer.

Sous Windows, PowerShell refuse d’extraire une archive dont l’extension n’est pas `.zip` : commencez donc par la copier.

```powershell
Copy-Item report.docx report-copy.zip
Expand-Archive report-copy.zip -DestinationPath .\report-unzipped
```

`word/document.xml` tient généralement sur une seule ligne énorme, parce que Word n’a aucune raison de la rendre lisible. Passez-la dans un formateur avant d’essayer :

```
$ xmllint --format report-unzipped/word/document.xml | head -60
```

Voici maintenant le point important. Dans ce XML, **le sens est stocké par référence**. Un titre n’est pas balisé comme un titre. C’est un paragraphe portant un élément `w:pStyle` qui nomme un style, et c’est la définition de ce style — là-bas, dans `styles.xml` — qui dit qu’il s’agit de Titre 1. Un élément de liste est un paragraphe portant un élément `w:numPr` avec un `w:numId` et un `w:ilvl`, et le fait qu’il s’agisse d’une puce ou d’un numéro décimal vit dans `numbering.xml`. Une image est un attribut `r:embed` contenant un identifiant de relation, et c’est `word/_rels/document.xml.rels` qui transforme cet identifiant en `word/media/image1.png`.

Un convertisseur de `.docx` vers Markdown est donc un programme qui fait quatre choses dans l’ordre : décompresser le paquet, parcourir `document.xml`, résoudre les références de chaque élément contre les autres parties, et sérialiser le résultat en Markdown. Toute différence entre les outils est une différence à la troisième ou à la quatrième étape. Quand la troisième étape n’arrive pas à résoudre quelque chose, le convertisseur n’a aucune idée de ce qu’il regardait, et ce que vous obtenez est un simple paragraphe.

| Partie de l’archive | Ce qu’elle contient | Ce qui casse sans elle |
| --- | --- | --- |
| `word/document.xml` | Les paragraphes, les passages et les tableaux | Rien ne se convertit du tout |
| `word/styles.xml` | Les définitions de styles nommés | Les titres arrivent en paragraphes gras |
| `word/numbering.xml` | Les formats de listes, les niveaux et les remises à zéro | Les listes numérotées et à puces arrivent en paragraphes |
| `word/_rels/document.xml.rels` | Les identifiants de relations vers les chemins de fichiers | Les images ne peuvent pas être localisées |
| `word/media/` | Les fichiers d’images eux-mêmes | Les références d’images ne pointent vers rien |
| `word/footnotes.xml` | Le corps des notes de bas de page | Des marques de notes sans texte, ou pas de notes du tout |
| `word/comments.xml` | Les commentaires de relecture | Commentaires perdus, généralement en silence |

## Quelle voie pour quel travail

| Voie | Idéale pour | Installation requise | Ce qu’elle fait des images | Prix |
| --- | --- | --- | --- | --- |
| Convertisseur dans le navigateur | Un document, tout de suite, sans le téléverser | Aucune | Les intègre en ligne, ou laisse des références | Gratuit |
| Pandoc | Les lots, le suivi des modifications, les images sur le disque | Pandoc | `--extract-media` les écrit dans un dossier | Gratuit, GPL |
| mammoth (Node ou navigateur) | La conversion à l’intérieur de votre propre application | npm | Des URI de données par défaut, ou votre propre rappel | Gratuit, BSD-2-Clause |
| mammoth en ligne de commande | Un coup unique avec les images en fichiers | npm | `--output-dir` les écrit à côté du HTML | Gratuit, BSD-2-Clause |
| MarkItDown | Alimenter une chaîne de traitement, pas une personne | Python | Extraites là où le format le permet | Gratuit, MIT |
| Word, Enregistrer comme page web | Un document que les autres convertisseurs maltraitent | Word | Écrites dans un dossier à côté du HTML | Avec Word |
| Export depuis Google Docs | Un document déjà dans Drive | Aucune | Incluses dans le téléchargement | Gratuit avec un compte |
| Copier-coller | Quelques paragraphes, immédiatement | Aucune | Perdues | Gratuit |
| LibreOffice, sans interface | Les vieux `.doc`, `.rtf` et formats bizarres | LibreOffice | Reportées dans le `.docx` qu’il écrit | Gratuit, MPL 2.0 |
| python-docx et votre propre générateur | Une règle maison qu’aucun convertisseur n’implémente | Python | Ce que vous écrivez | Gratuit, MIT |
| Décompresser et lire le XML | Diagnostiquer pourquoi une conversion a échoué | Aucune | Vous les regardez directement | Gratuit |

Trois de ces lignes sont les voies que presque tout le monde emprunte réellement, et le reste de cet article porte surtout sur elles. Si vous voulez la comparaison des voies en tant que produits plutôt qu’en tant que procédures — tarifs, licences, à qui chacune convient — [la comparaison complète des outils Word vers Markdown](/blog/best-word-to-markdown-converters) couvre celles que cette page se contente d’énumérer.

## La voie du navigateur : déposez le fichier, lisez le Markdown

Un convertisseur de navigateur lit le `.docx` en JavaScript sur votre propre machine. L’archive est décompressée dans la page, le XML est parcouru dans la page, et le Markdown apparaît dans la page. Déconnecté, aucune partie du fichier n’est envoyée où que ce soit, et cela se vérifie au lieu d’être une promesse : ouvrez l’onglet réseau, convertissez, et regardez qu’il ne se passe rien.

La procédure tient en quatre étapes et il n’y a rien à configurer.

1. Ouvrez la page de conversion.
2. Déposez-y le `.docx`, ou choisissez-le dans la boîte de dialogue de fichiers.
3. Lisez le Markdown qui apparaît, et modifiez-le sur place si nécessaire.
4. Téléchargez le `.md`, ou copiez-le.

| Avantages | Inconvénients |
| --- | --- |
| Aucune installation, aucun terminal, aucun compte | Un document à la fois, pas un répertoire |
| Rien de téléversé quand vous êtes déconnecté | C’est le navigateur qui travaille : un très gros fichier est donc limité par la machine |
| Titres, listes, tableaux, liens, gras et italique passent | Aucune option pour extraire les images vers un dossier de votre choix |
| Le résultat est modifiable avant que vous ne l’emportiez | Le suivi des modifications se résout en texte accepté ; les commentaires ne passent pas |

Il existe un plafond de taille qu’il vaut mieux connaître à l’avance, parce que c’est la seule chose qui vous arrêtera. Sur TransformPipe, la conversion elle-même est plafonnée à 10 Mo, et un document que vous gardez dans votre historique à 4 Mo, parce que la fonction qui le stocke refuse un corps de requête plus gros. Un `.docx` grossit pour une seule raison — les photographies — donc si un fichier dépasse la limite, la réponse consiste généralement à regarder ce que contient `word/media/` plutôt qu’à supposer que le document est énorme.

En dessous, la voie du navigateur est généralement mammoth plus une étape HTML vers Markdown, ce qui est exactement l’agencement que recommande la documentation de mammoth. Cela compte plus qu’il n’y paraît : cela signifie que la voie du navigateur et la voie mammoth ci-dessous ont les mêmes forces et les mêmes angles morts, et qu’un document qui se convertit mal avec l’une se convertira mal avec l’autre.

**Pour qui.** Quiconque a un document et une raison de ne pas le déposer sur le serveur d’un inconnu — un contrat, une note médicale, un rapport interne, un plan non publié. Et aussi quiconque veut simplement le Markdown dans les trente secondes sans apprendre une option.

## La voie Pandoc : une commande, et les quatre options qui comptent

Pandoc est un convertisseur de documents en ligne de commande écrit en Haskell, qui lit et écrit une quarantaine de formats. Son lecteur de `.docx` est le plus configurable qui existe, et c’est la seule voie de cette page qui propose une réponse documentée au suivi des modifications.

La commande dans sa forme utile la plus courte :

```
$ pandoc -f docx -t gfm --wrap=none -o report.md report.docx
```

C’est-à-dire : lire du `docx`, écrire du GitHub Flavored Markdown, ne pas replier les paragraphes, sortir vers `report.md`. Omettez `--wrap=none` et Pandoc repliera votre prose à 72 colonnes, ce qui produit un fichier hostile aux comparaisons et constitue la première chose que la plupart des gens veulent défaire.

Avec les images extraites :

```
$ pandoc -f docx -t gfm --wrap=none \
    --extract-media=./media \
    -o report.md report.docx
```

Et pour un document passé par une relecture :

```
$ pandoc -f docx -t gfm --wrap=none \
    --track-changes=all \
    -o report.md report.docx
```

Tout un répertoire, en bash :

```
$ for f in *.docx; do
    pandoc -f docx -t gfm --wrap=none -o "${f%.docx}.md" "$f"
  done
```

La même chose en PowerShell :

```powershell
Get-ChildItem *.docx | ForEach-Object {
  pandoc -f docx -t gfm --wrap=none -o "$($_.BaseName).md" $_.Name
}
```

| Option | Ce qu’elle fait | Pourquoi vous la voulez |
| --- | --- | --- |
| `-t gfm` | Choisit le GitHub Flavored Markdown en sortie | Les tableaux et le texte barré relèvent de GFM, pas de CommonMark. Le dialecte par défaut de Pandoc est son propre Markdown étendu, ce qui n’est pas la même chose |
| `--wrap=none` | Cesse de replier les paragraphes à une limite de colonnes | Un paragraphe par ligne, donc des comparaisons lisibles |
| `--extract-media=DIR` | Écrit les images incorporées dans un répertoire | Sinon les images restent dans l’archive que vous vous apprêtez à ne plus utiliser |
| `--track-changes=accept\|reject\|all` | Décide du sort des insertions, des suppressions et des commentaires | `accept` est la valeur par défaut et jette discrètement la relecture ; `all` garde tout, enveloppé dans des spans |
| `--markdown-headings=atx` | Force les titres de style `#` | Sinon, le générateur `markdown` propre à Pandoc souligne les titres des deux premiers niveaux |

| Avantages | Inconvénients |
| --- | --- |
| Scriptable : deux cents fichiers coûtent le même effort qu’un seul | Une installation, et un terminal |
| Le seul contrôle documenté sur le suivi des modifications et les commentaires | Son dialecte de sortie par défaut n’est pas GFM à moins de le demander |
| Les images dans un dossier avec une seule option | Les styles Word personnalisés exigent une correspondance que vous écrivez vous-même |
| Lit et écrit le `.docx`, donc les allers-retours sont possibles | Le manuel est long et les options sont nombreuses |

**Prix :** gratuit, sous licence GPL.

**Pour qui.** Quiconque convertit plus d’un fichier, quiconque a besoin des images sous forme de fichiers, et quiconque tient un document passé par une relecture juridique ou éditoriale. Si un `.docx` contient un suivi des modifications, c’est la seule voie de cette page qui ne le résoudra pas en silence à votre place.

## La voie mammoth : convertir un .docx à l’intérieur de votre propre code

mammoth est une bibliothèque JavaScript qui convertit le `.docx` en HTML, avec des versions pour Node et pour le navigateur. Un très grand nombre d’outils « Word vers Markdown » se révèlent être mammoth avec une seconde étape boulonnée dessus, et si vous écrivez votre propre convertisseur, c’est la fondation raisonnable.

Son idée distinctive est la carte de styles. Au lieu de deviner ce qu’est un paragraphe, mammoth fait correspondre les styles nommés de Word à des éléments HTML, et cette correspondance est une configuration que vous maîtrisez :

```js
const mammoth = require("mammoth");
const TurndownService = require("turndown");

const { value: html, messages } = await mammoth.convertToHtml(
  { path: "report.docx" },
  {
    styleMap: [
      "p[style-name='Chapter Title'] => h1:fresh",
      "p[style-name='Section Heading'] => h2:fresh",
      "p[style-name='Intense Quote'] => blockquote:fresh",
    ],
  }
);

const markdown = new TurndownService().turndown(html);

for (const message of messages) {
  console.warn(message.message);
}
```

Deux choses dans cet extrait résument à elles seules la raison d’utiliser la bibliothèque.

La première est `styleMap`. Une organisation dotée de styles maison — « Chapter Title » plutôt que « Heading 1 » — n’obtiendra que de simples paragraphes de tous les autres outils de cette page, parce qu’aucune règle nulle part ne dit qu’un style nommé « Chapter Title » est un titre. Ici, c’est vous qui écrivez cette règle. Le suffixe `:fresh` dit à mammoth de commencer un nouvel élément plutôt que de fusionner avec le précédent, ce que vous voulez pour des titres et ce que vous ne voulez pas pour un style qui poursuit un paragraphe.

La seconde est `messages`. Chaque résultat de mammoth porte un tableau d’avertissements énumérant les styles qu’il n’a pas reconnus et les éléments qu’il n’a pas traités. C’est le seul compte rendu lisible par une machine de ce qu’un convertisseur a laissé tomber que fournisse une voie de cette page. Affichez-le, journalisez-le, montrez-le à vos utilisateurs. Un avertissement de style non reconnu est exactement le moment d’ajouter une ligne à la carte de styles.

Le README de mammoth marque son propre générateur Markdown comme obsolète et recommande de produire du HTML puis de le convertir en Markdown. Suivez le conseil — le HTML a un élément pour presque tout ce que contient un `.docx`, Markdown non, et passer par le HTML donne à la seconde étape de quoi travailler. Le choix de cette seconde bibliothèque est une petite décision en soi, et [les convertisseurs HTML vers Markdown qui méritent réflexion](/blog/best-html-to-markdown-converters) diffèrent surtout par ce qu’ils font du balisage que Markdown ne sait pas exprimer.

Dans le navigateur, l’entrée est un `ArrayBuffer` plutôt qu’un chemin :

```js
const buffer = await file.arrayBuffer();
const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buffer });
```

Et en ligne de commande, pour un coup unique, le paquet livre une interface qui écrit les images en fichiers séparés au lieu de les intégrer :

```
$ npx mammoth report.docx --output-dir=out
```

| Avantages | Inconvénients |
| --- | --- |
| Tourne dans Node et dans le navigateur | Produit du HTML ; l’étape Markdown est à votre charge |
| Les cartes de styles traitent correctement les styles Word personnalisés | Son propre générateur Markdown est déclaré obsolète par ses auteurs |
| Signale ce qu’il n’a pas su faire correspondre, dans `messages` | JavaScript uniquement |
| Une interface en ligne de commande est incluse pour les travaux ponctuels | Aucune mise en page, puisque le HTML n’a pas de page |

**Prix :** gratuit, sous licence BSD-2-Clause.

**Pour qui.** Les développeurs qui intègrent la conversion dans une application, et quiconque dont les documents utilisent des styles maison plutôt que ceux intégrés à Word. Dans le navigateur, c’est en pratique la seule véritable option.

## Là où la conversion échoue, et ce que cela coûte

Tout ce qui précède fonctionne. Ce qui suit se produit quand même, parce qu’un `.docx` compte des centaines de constructions et Markdown une douzaine environ. Les pertes sont structurelles, ce ne sont pas des bogues, et la question utile est de savoir auxquelles vous consentez.

### La numérotation ne survit que si numbering.xml résout la liste

C’est la plainte la plus fréquente à propos de la conversion des `.docx`, et elle a une cause précise.

Une liste numérotée dans Word est un ensemble de paragraphes, portant chacun un `w:numPr` avec un `w:numId` et un `w:ilvl`. C’est tout. Le paragraphe ne sait pas qu’il est numéroté, ne sait pas quel numéro il porte, et ne sait pas s’il s’agit d’une puce ou d’un décimal. Tout cela vit dans `numbering.xml`, où un élément `w:num` fait correspondre le `w:numId` à une définition abstraite, laquelle contient un `w:lvl` par niveau d’indentation avec un `w:numFmt` indiquant `bullet`, `decimal`, `lowerRoman` et ainsi de suite.

Un convertisseur qui rencontre un paragraphe de liste doit donc suivre deux sauts : du `w:numId` à la définition de numérotation, puis du `w:ilvl` au niveau à l’intérieur de celle-ci. Si l’un des deux sauts échoue — la partie est absente, ou elle est présente mais ne contient pas la définition référencée — le convertisseur n’a rien sur quoi s’appuyer. Il ne sait pas que le paragraphe était un élément de liste. Ce qu’il émet est un paragraphe ordinaire, et il l’émet sans se plaindre, parce que de son point de vue rien n’a mal tourné.

Lisez le code source de mammoth et le mécanisme est directement visible : un niveau compte comme ordonné dès lors que son format de numéro est autre chose que `bullet`, et quand la partie de numérotation est introuvable, la bibliothèque se rabat sur un ensemble vide de définitions. Avec un ensemble vide, la recherche de la numérotation d’un paragraphe ne renvoie rien, le paragraphe cesse de satisfaire la règle qui en aurait fait un élément de liste, et il ressort en prose.

Voilà pourquoi les listes d’un document se convertissent parfaitement et celles du suivant s’effondrent. Ce n’est pas l’outil qui manque de constance. Une archive avait une partie de numérotation exploitable et l’autre non — ce qui arrive aux fichiers assemblés par des scripts, exportés depuis d’autres applications, engendrés par des outils de rapport, ou réparés par Word après un plantage. Avant d’accuser le convertisseur, décompressez le fichier et regardez :

```
$ unzip -l report-copy.zip | grep numbering
```

L’absence de `word/numbering.xml` dans la liste signifie qu’aucune voie de cette page ne vous donnera de listes, et la correction est en amont : ouvrez le document dans Word ou LibreOffice, appliquez une vraie mise en forme de liste, enregistrez, et convertissez la copie enregistrée. Et vérifiez l’imbrication de ce qui survit, car l’aplatissement des sous-niveaux dans le niveau supérieur est un échec distinct avec ses propres causes — [l’indentation des listes et les sauts de ligne](/blog/markdown-line-breaks-and-lists) se comportent mal en Markdown pour des raisons qui n’ont rien à voir avec Word.

### Les images atterrissent en fichiers séparés, en base64, ou nulle part

Le Markdown ne contient jamais une image. Il contient une référence vers une image — `![légende](chemin/vers/image.png)` — et le fichier doit exister à ce chemin au moment où quelque chose rend le Markdown. Un `.docx`, à l’inverse, contient les octets réels de l’image dans `word/media/`. Franchir cet écart est une décision, et chaque voie la prend différemment.

| Voie | Ce que vous obtenez | Ce qu’il vous reste à faire |
| --- | --- | --- |
| Pandoc avec `--extract-media=./media` | Des fichiers d’images dans `./media`, les références pointant dessus | Gardez le dossier à côté du Markdown, et versionnez les deux |
| Pandoc sans cette option | Des références vers un chemin qui n’existe pas sur le disque | Relancez avec l’option |
| mammoth, par défaut | `<img src="data:image/png;base64,...">` dans le HTML | Décidez si vous voulez un fichier énorme ou des fichiers séparés |
| mammoth avec un rappel `convertImage` | Ce que vous écrivez vous-même | Écrivez les fichiers et renvoyez le `src` que vous voulez |
| mammoth en ligne de commande avec `--output-dir` | Des images en fichiers à côté du HTML | Convertissez le HTML en Markdown, les chemins intacts |
| Copier-coller | Rien | Enregistrez chaque image depuis Word à la main |

Le cas du base64 est celui qui surprend le plus. Une URI de données est légale, autonome et s’affiche correctement — et une seule photographie devient une ligne de Markdown longue de dizaines de milliers de caractères, ce qui rend le fichier illisible dans un éditeur, impossible à relire dans une comparaison, et lent dans tout ce qui colore la syntaxe. C’est la bonne réponse quand le Markdown doit voyager seul sans dossier à côté, et la mauvaise réponse dans un dépôt.

Le comportement par défaut de mammoth est l’URI de données, et le remplacer est une option documentée plutôt qu’un contournement :

```js
const options = {
  convertImage: mammoth.images.imgElement(function (image) {
    return image.read("base64").then(function (data) {
      return { src: "data:" + image.contentType + ";base64," + data };
    });
  }),
};
```

Cet exemple reproduit le comportement par défaut ; remplacez le corps par du code qui écrit les octets dans un fichier et renvoie un `src` relatif, et vous avez les images sur le disque avec les chemins que vous avez choisis. Quelle que soit la voie retenue, les images sont la partie de la conversion la plus susceptible de casser plus tard plutôt que maintenant, quand le Markdown bouge et que le dossier ne bouge pas — [ce qui fait réellement tenir une référence d’image](/blog/images-and-links-that-still-work) mérite lecture avant de verser cent fichiers convertis dans un dépôt.

### Des titres qui n’en ont jamais été

Si quelqu’un a fabriqué ses titres en sélectionnant une ligne, en la passant en 18 points et en appuyant sur gras, il n’y a aucun `w:pStyle` à résoudre, et aucun convertisseur ne peut distinguer cette ligne d’une phrase emphatique. Vous obtiendrez `**Chapter Two**` en paragraphe, ou du texte brut, selon l’outil.

Cela ne se corrige pas dans le convertisseur, uniquement en amont. Ouvrez le document, appliquez de vrais styles de titre depuis la galerie de styles, enregistrez, reconvertissez. Si le document utilise plutôt des styles nommés personnalisés, le `styleMap` de mammoth est la réponse et Pandoc réclame une correspondance de styles que vous écrivez vous-même. Ne pas corriger cela coûte ceci : votre Markdown n’a aucune structure documentaire — pas de sommaire, pas d’ancres, pas de plan — et la structure est l’essentiel de ce à quoi sert Markdown.

### Des tableaux qui perdent leur en-tête, ou leur forme

La syntaxe de tableau de Markdown est une grille de cellules simples, avec une ligne d’en-tête, sans fusion et sans contenu de bloc. Un tableau `.docx` est une structure imbriquée de lignes et de cellules, avec des fusions, un alignement vertical, des tableaux imbriqués et des paragraphes dans les cellules.

Une grille simple se convertit très bien. Tout le reste se dégrade : une cellule d’en-tête fusionnée devient une cellule et les colonnes se décalent, une cellule contenant une liste à puces devient une cellule contenant le texte de la liste agglutiné, un tableau imbriqué est aplati ou supprimé. Pire, le résultat a généralement l’air plausible. L’échec n’est pas un désordre sur la page, c’est un tableau qui se lit correctement et qui contient les mauvaises données dans la mauvaise colonne. Comptez les colonnes de la sortie face à celles de Word, sur le tableau le plus large du document, avant de faire confiance à aucun d’eux — [les tableaux sont ce qui casse le plus souvent dans les deux sens](/blog/markdown-tables-that-survive-conversion).

Les lignes d’en-tête disparaissent pour une raison précise qu’il vaut mieux connaître : Word marque une ligne d’en-tête par une propriété de ligne de tableau, et un convertisseur qui l’ignore produit un tableau dont la première ligne est une ligne de données ordinaire. Markdown exige une ligne d’en-tête : ce que vous obtenez est donc soit un tableau dont la première ligne de données a été promue en en-tête, soit un tableau à l’en-tête vide et à tout le contenu décalé d’un cran.

### Notes de bas de page, commentaires et zones de texte

**Les notes de bas de page** vivent dans `word/footnotes.xml` et sont référencées depuis le texte par un `w:footnoteReference`. Elles n’ont un endroit où atterrir que dans certains dialectes : les notes de bas de page ne figurent ni dans la spécification CommonMark ni dans celle de GFM, elles n’existent donc qu’en extensions. Le dialecte Markdown propre à Pandoc a une syntaxe de notes ; un convertisseur qui vise le CommonMark strict doit les insérer dans le texte, les ajouter en paragraphes ordinaires à la fin, ou les abandonner. Descendez au bas de la sortie et regardez avant de supposer.

**Les commentaires** sont une conversation attachée à une plage de texte, et Markdown n’a aucune ancre à quoi en rattacher une. Le manuel de Pandoc précise que `accept` et `reject` ignorent tous deux les commentaires et que seul `--track-changes=all` les inclut. mammoth les laisse de côté à moins que vous n’ajoutiez vous-même une correspondance de références de commentaires. Tout le reste les abandonne sans le dire. Le fil de relecture est souvent la chose la plus précieuse d’un document, et c’est la première à disparaître.

**Les zones de texte et les formes** sont des objets de dessin, pas des éléments du flux du document. Le texte à l’intérieur de l’une d’elles peut se trouver à peu près n’importe où dans le XML par rapport à l’endroit où il apparaît sur la page, et il s’évapore couramment. C’est la perte que les gens ont le plus de mal à croire, parce que l’exergue était bien là, à l’écran. Cherchez dans la sortie une phrase dont vous savez qu’elle était dans une zone de texte ; si elle manque, elle n’a jamais été dans le flux.

Et puis il y a les choses sans le moindre équivalent en Markdown : polices, corps de caractères, couleurs, marges, format de page, sauts de page, en-têtes, pieds de page et numéros de page. Non pas « mal prises en charge » — absentes de la syntaxe. Un outil qui semble les conserver émet du HTML brut avec des attributs `style`, c’est-à-dire un autre document affublé d’une extension de Markdown.

## La liste de contrôle : quoi lire dans le fichier converti

Faites ceci une fois, sur un document représentatif, avant d’en convertir deux cents. Cela prend une dizaine de minutes et cela vaut plus que tous les tableaux comparatifs, y compris celui ci-dessus, parce que vos documents ne ressemblent à ceux de personne d’autre.

1. **Lisez les titres sous forme de liste.** `grep -n "^#" report.md` vous donne le plan du document en un écran. S’il est court, les titres sont devenus des paragraphes — cherchez `**Ligne en gras**` seule sur sa ligne, ce en quoi se transforme un titre mis en forme à la main.
2. **Trouvez les listes.** Cherchez les lignes commençant par `1.`, `-` ou `*`. Si le document comportait des procédures numérotées et que la sortie n’en a aucune, allez vérifier la présence de `word/numbering.xml` avant toute autre chose.
3. **Vérifiez l’imbrication des listes.** Les sous-éléments devraient être indentés sous leurs parents. Les sous-niveaux aplatis sont fréquents et changent le sens d’une procédure.
4. **Comptez les colonnes du tableau le plus large.** Comparez avec Word. Puis vérifiez que la ligne d’en-tête est bien l’en-tête, et non la première ligne de données promue.
5. **Cherchez les références d’images.** `grep -n "!\[" report.md` les énumère. Puis confirmez que les fichiers existent à ces chemins, ou que les URI de données sont bien là — une référence vers un fichier jamais extrait s’affiche en image cassée et rien ne vous prévient.
6. **Descendez tout en bas.** Les notes de bas de page et de fin apparaissent ici, apparaissent dans le texte, ou n’apparaissent pas. N’importe lequel de ces cas peut convenir ; ne pas savoir lequel vous avez obtenu, non.
7. **Cherchez une phrase dont vous savez qu’elle était dans une zone de texte, une légende ou un encadré.** C’est le test des pertes que rien ne signale.
8. **Cherchez une phrase dont vous savez qu’elle a été supprimée pendant la relecture.** Si elle est là, le suivi des modifications a été conservé en texte. Si une phrase supprimée a disparu et que l’historique vous était nécessaire, vous avez converti avec le mauvais réglage.
9. **Regardez le haut du fichier.** Le sommaire de Word, fondé sur des champs, se convertit en le texte mis en cache la dernière fois que Word l’a actualisé, numéros de page compris, pointant vers des pages qui n’existent plus. Supprimez-le et laissez votre moteur de rendu en construire un nouveau.
10. **Ouvrez le Markdown dans un moteur de rendu, pas dans un éditeur.** L’éditeur vous montre la syntaxe ; le moteur de rendu vous montre ce que reçoit un lecteur. Ils divergent plus souvent qu’on ne l’imagine.

En PowerShell, les points un, deux et cinq donnent :

```powershell
Select-String -Path report.md -Pattern '^#'
Select-String -Path report.md -Pattern '^\s*(\d+\.|[-*])\s'
Select-String -Path report.md -Pattern '!\['
```

| Symptôme dans la sortie | Ce qui s’est réellement passé | Que faire |
| --- | --- | --- |
| Les titres sont des paragraphes gras | Le document n’avait pas de styles de titre, ou en avait des personnalisés | Appliquez de vrais styles dans Word, ou écrivez une carte de styles |
| Les listes numérotées sont de simples paragraphes | `numbering.xml` absent ou non résoluble | Vérifiez l’archive ; réenregistrez depuis un traitement de texte |
| Les sous-éléments se retrouvent au premier niveau | Niveaux d’indentation perdus ou aplatis | Corrigez à la main ; il n’existe aucune option pour cela |
| La ligne d’en-tête du tableau est une ligne de données | La propriété de ligne d’en-tête a été ignorée | Corrigez à la main, ou convertissez plutôt via le HTML |
| Les colonnes ne s’alignent pas | Des cellules fusionnées ou imbriquées ont été aplaties | Restructurez le tableau ; Markdown ne sait pas exprimer les fusions |
| Icônes d’images cassées | Références extraites, fichiers non | Relancez avec `--extract-media` ou un répertoire de sortie |
| Une ligne du fichier fait 40 000 caractères | Images intégrées en URI de données | Passez à une voie qui écrit des fichiers |
| Le texte des notes de bas de page manque | Le dialecte cible n’a pas de syntaxe de notes | Prenez un dialecte qui en a, ou acceptez l’insertion dans le texte |
| Les commentaires ont disparu | Toutes les voies sauf une les abandonnent | `--track-changes=all`, et gardez l’original |
| Un exergue manque entièrement | Il était dans une zone de texte | Recopiez-le à la main |

## Comment choisir une voie

1. **Décidez où le fichier a le droit d’aller avant de choisir un outil.** Un README peut être téléversé n’importe où. Un contrat signé, un résultat non publié ou tout ce qui contient les données médicales d’une personne ne le peut pas, et choisir un convertisseur hébergé pour l’un d’eux est une divulgation plutôt qu’une conversion. La conversion côté navigateur garde le fichier sur la machine et vous pouvez le vérifier dans l’onglet réseau.
2. **Comptez les documents, puis comptez les clics.** Un fichier ne justifie pas d’installer un binaire Haskell. Deux cents fichiers ne justifient pas un onglet de navigateur et une personne qui clique dedans. L’installation se paie une fois ; les clics se paient à chaque fois, ce qui fait basculer la réponse quelque part entre cinq fichiers et cinquante.
3. **Établissez si le document a été relu.** Le suivi des modifications et les commentaires sont jetés par défaut à peu près partout. Si la relecture compte, `--track-changes=all` est le moyen documenté de la conserver, et si vous n’utilisez pas Pandoc, acceptez qu’elle ait disparu plutôt que de le découvrir plus tard.
4. **Décidez du sort des images avant de convertir, pas après.** Des fichiers dans un dossier, ou du base64 dans le Markdown. Les deux se défendent ; aucun ne s’obtient par accident, et l’accident consiste généralement en des références qui ne pointent vers rien.
5. **Déterminez si le document utilise de vrais styles.** Ouvrez-le dans Word et cliquez sur un titre : si la zone de style indique Titre 1, toutes les voies fonctionneront. Si elle indique Normal, aucune ne fonctionnera, et la correction est dans le document plutôt que dans l’outil.
6. **Gardez le `.docx`.** Tout ce qui figure dans la section ci-dessus est à sens unique. Archivez l’original là où vous saurez le retrouver, parce que le jour où quelqu’un demandera ce que disait le paragraphe supprimé est le jour où vous apprendrez que la réponse n’était que dans le fichier que vous avez effacé.

## Conclusion

Convertir un `.docx` en Markdown n’est pas une traduction, c’est un tri. Si le document vit dans Google Docs plutôt que sur le disque, [cet export a sa propre réponse](/blog/convert-google-docs-to-markdown). Le travail est un tri : décompresser l’archive, résoudre ce qui peut l’être, et accepter la perte de tout ce pour quoi Markdown n’a pas de syntaxe. Savoir que les réponses vivent dans l’archive transforme presque tout échec mystérieux en une vérification de deux minutes — pas de `numbering.xml`, pas de listes ; pas de styles de titre, pas de titres ; pas de `--extract-media`, pas d’images. Pour un document isolé, le chemin honnête le plus court est un convertisseur qui tourne dans votre navigateur, ce que fait [la conversion Word vers Markdown de TransformPipe](/word-to-markdown), gratuitement, sans installation et sans rien téléverser quand vous êtes déconnecté. Pour un répertoire, pour des images sur le disque ou pour un document relu, installez Pandoc. Pour une conversion dans votre propre code, utilisez mammoth, lisez ses `messages`, et convertissez son HTML plutôt que son Markdown. Puis déroulez la liste de contrôle, parce que les pertes qui comptent sont les pertes silencieuses — et [un inventaire de chacune d’elles, avec un verdict sur celles à regretter et celles dont il faut se réjouir](/blog/what-not-to-keep-from-a-docx) est ce qu’il faut lire avant de décider que quoi que ce soit méritait d’être conservé.

## FAQ

### Comment convertir un .docx en Markdown sans rien installer ?

Prenez un convertisseur qui tourne dans le navigateur : il décompresse et lit l’archive en JavaScript sur votre propre machine, il n’y a donc rien à installer et, déconnecté, rien à téléverser. Confirmez ce dernier point en ouvrant l’onglet réseau pendant la conversion. L’autre voie sans installation est le copier-coller, qui fait passer les titres, les listes et les liens via le presse-papiers HTML mais perd toutes les images.

### Pourquoi mes listes numérotées sont-elles ressorties en simples paragraphes ?

Parce que la recherche en deux sauts dans `numbering.xml` a échoué. Un paragraphe de liste dans Word ne porte qu’un identifiant de numérotation et un niveau d’indentation ; le format vit dans cette partie séparée de l’archive, et si elle est absente ou référence des définitions qu’elle ne contient pas, le convertisseur ne peut pas savoir que le paragraphe a jamais été un élément de liste. Décompressez le `.docx` et vérifiez la présence de `word/numbering.xml` avant d’accuser l’outil.

### Quelle est la meilleure commande pour convertir un docx en Markdown ?

`pandoc -f docx -t gfm --wrap=none --extract-media=./media -o out.md in.docx` couvre la plupart des cas : du GitHub Flavored Markdown pour que les tableaux survivent, aucun repliement des paragraphes pour que les comparaisons restent lisibles, et les images écrites dans un dossier au lieu de rester dans l’archive. Ajoutez `--track-changes=all` si le document est passé par une relecture.

### Puis-je convertir un .doc plutôt qu’un .docx ?

Pas directement avec ces voies — l’ancien `.doc` binaire est un format entièrement différent, sans zip et sans XML. Convertissez-le d’abord avec LibreOffice sans interface, `soffice --headless --convert-to docx old.doc`, puis convertissez le `.docx` produit. Attendez-vous à ce que les surprises soient dans la première étape, puisqu’il s’agit d’une conversion complète à part entière.

### Les images passeront-elles automatiquement ?

Non, parce que le Markdown ne fait jamais que référencer un fichier d’image au lieu d’en contenir un. Le `--extract-media` de Pandoc les écrit dans un répertoire, mammoth les intègre en URI de données par défaut ou les confie à un rappel que vous écrivez, et le copier-coller les perd entièrement. Vérifiez les images avant de supprimer le document source.

### Pourquoi les titres fonctionnent-ils dans un document et pas dans un autre ?

Parce que le fait d’être un titre est stocké comme une référence de style, et non comme une propriété du texte. Un document dont les titres viennent de la galerie de styles se convertit proprement ; un document dont les titres sont du gras de 18 points n’a aucune référence de style à résoudre, il n’y a donc rien à trouver pour un convertisseur. L’outil se comporte de façon identique dans les deux cas — ce sont les documents qui diffèrent.

### Passer par le HTML vaut-il mieux que convertir directement en Markdown ?

Généralement oui, et c’est ce que recommandent les auteurs de mammoth. Le HTML a un élément pour presque tout ce que contient un `.docx` : la première étape ne perd donc presque rien, et la seconde prend ensuite une décision claire sur ce que Markdown ne sait pas exprimer. Convertir en un seul saut revient à laisser ces décisions se prendre en silence, au fond du lecteur, là où vous ne pouvez ni les voir ni les changer.

### Est-ce que tout cela vaut pour une présentation PowerPoint ?

En partie seulement. Un `.pptx` est le même genre d'archive zip de parties XML, mais une diapositive est une surface de formes positionnées et non un flux de paragraphes stylés : la question difficile passe de « quel style était-ce » à « dans quel ordre faut-il lire tout cela » — et les notes du présentateur, qui forment une partie distincte du fichier, sont ce que la plupart des voies perdent. [Convertir PowerPoint en Markdown](/blog/convert-powerpoint-to-markdown) parcourt les six voies et ce que chacune laisse tomber.
