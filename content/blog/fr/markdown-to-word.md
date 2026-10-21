---
title: "Markdown vers Word : comment obtenir une .docx que quelqu’un peut modifier"
description: "Obtenir une .docx que quelqu’un peut modifier : Pandoc et son document de référence, le chemin HTML, Google Docs, et ce que perd le retour vers Markdown."
updated: 2026-10-21
date: 2026-08-24
tag: Publication
keywords: markdown vers word, markdown vers docx, convertir markdown en document word, pandoc docx de référence, md vers docx, markdown vers word en ligne, modèle word pandoc markdown
---

Personne ne convertit du Markdown en Word pour son propre plaisir. Cela arrive parce que quelqu’un d’autre — un avocat, une cliente, une chef de service, un régulateur — travaille dans Word, y suit les modifications, et ne lira pas un fichier qui arrive sous forme de texte truffé de dièses. La conversion est une concession, et la question est de savoir laquelle coûte le moins cher.

### En bref

Utilisez Pandoc avec un document de référence : `pandoc report.md --reference-doc=house.docx -o report.docx`. Le document de référence est une `.docx` ordinaire dont Pandoc copie les styles dans la sortie, si bien que le fichier que votre relecteur ouvre porte les titres, les marges et le corps de texte de votre organisation, et non les valeurs par défaut de Pandoc. Le chemin conversion-en-HTML-puis-ouverture-dans-Word est plus rapide et produit un document sans jeu de styles utilisable, ce qui convient à un mémo et ne convient pas à ce qui sera restylé. Et sachez avant de commencer que le retour est destructeur : les modifications suivies peuvent être lues dans la `.docx` renvoyée, mais elles arrivent sous forme d’annotations en ligne que vous ne pouvez ni accepter ni rejeter — traitez donc les corrections du relecteur comme des conseils à reporter vous-même à la main.

Markdown et `.docx` ne sont pas deux encodages d’une même chose. Markdown est un petit ensemble de marques structurelles — ceci est un titre, ceci est une liste, ceci est un lien — et rien de plus. Une `.docx` est une archive zip de XML dans laquelle chaque paragraphe pointe vers un style nommé, les styles vivent dans une feuille de styles, la numérotation vit dans sa propre partie, et l’ensemble porte taille de page, marges, en-têtes, pieds de page et un historique des révisions. Passer du premier au second, c’est inventer tout ce que le second possède et que le premier n’a pas.

Cette invention est tout le travail, et c’est là que les chemins diffèrent. Pandoc invente à partir d’un modèle que vous contrôlez. Word, en ouvrant un fichier HTML, invente à partir du CSS et de ses propres styles orientés web. Google Docs invente à partir des styles de Google. Le bouton d’export d’un éditeur invente en général à partir des valeurs par défaut de Pandoc, parce que la plupart de ces éditeurs ne sont que Pandoc avec un menu devant.

La deuxième chose à savoir d’emblée : si le relecteur n’a besoin que de lire le document, rien de tout cela ne s’applique. Un PDF ou une page HTML autonome est un meilleur artefact qu’une `.docx`, et [convertir Markdown en PDF](/blog/markdown-to-pdf) est un chemin plus court, avec moins de choses qui peuvent mal tourner. Word ne mérite sa complexité que lorsque quelqu’un va effectivement modifier le document.

## Pourquoi la question se pose : le relecteur travaille avec les modifications suivies

La demande n’est presque jamais « envoyez-moi ça au format Word ». C’est « j’ai besoin de commenter ceci », et dans la plupart des organisations, commenter signifie le ruban Révision de Word : insertions soulignées en couleur, suppressions barrées, une marge pleine de bulles de commentaires avec des noms dessus, et un bouton Accepter/Rejeter pour chacune. Ce flux de travail a des décennies, c’est celui sur lequel sont formées les équipes juridiques et de conformité, et il n’a aucun équivalent dans un fichier Markdown.

Git a un équivalent, bien sûr. Une pull request avec des commentaires ligne par ligne fait le même travail, en mieux, et conserve l’historique. Mais on n’envoie pas de pull request à la directrice juridique de quelqu’un, et la réunion où vous lui expliquez qu’elle devrait en apprendre l’usage est une réunion que vous perdrez. Le document quitte donc le dépôt sous forme de `.docx` et revient en `.docx` avec les corrections de quelqu’un d’autre dedans, et la question technique intéressante est ce que vous faites à ce moment-là.

Se tromper là-dessus d’une manière précise et coûteuse est fréquent. Une équipe exporte vers Word, le relecteur passe deux jours à annoter, le fichier revient, et l’équipe découvre que réconcilier quarante insertions suivies avec une source Markdown est un travail manuel que personne n’avait budgété — ou pire, que quelqu’un a accepté toutes les modifications, reconverti, et produit un commit qui réécrit chaque ligne du fichier parce que le convertisseur retourne à la ligne différemment. Décider du chemin de retour avant d’envoyer quoi que ce soit fait toute la différence entre une relecture et un incident.

## Comparatif rapide : le pense-bête

| Chemin | Idéal pour | Ce qu’il faut | Ce que ça coûte |
| --- | --- | --- | --- |
| Pandoc avec `--reference-doc` | Tout document qui doit ressembler à ceux de votre organisation | Pandoc installé, un modèle `.docx` que vous avez édité | Un après-midi pour construire le modèle, une fois |
| Pandoc sans document de référence | Un brouillon où l’apparence n’a pas d’importance | Pandoc installé | Les styles par défaut de Pandoc, qui ne ressemblent à rien de précis |
| Convertir en HTML, ouvrir dans Word | Un mémo court que personne ne restylera | Un convertisseur Markdown vers HTML, et Word | Aucun jeu de styles utilisable ; le CSS arrive en formatage direct |
| HTML autonome, puis LibreOffice en mode headless | Automatiser ce qui précède sur un serveur | LibreOffice installé, aucune licence Word | L’interprétation par LibreOffice de votre CSS |
| Google Docs comme intermédiaire | Les équipes déjà dans Google Workspace | Un compte Google | Le document se trouve sur les serveurs de Google ; vous héritez des styles de Google |
| Typora, VS Code et éditeurs similaires | Un fichier, depuis l’appli où vous êtes déjà | L’éditeur, plus Pandoc pour la `.docx` | Généralement aucun moyen de transmettre un document de référence |
| Writage, à l’intérieur de Word | Les relecteurs qui ne quitteront jamais Word | Un plugin Word payant sur leur machine | Une installation par machine et une licence |
| Coller du Markdown rendu dans Word | Deux paragraphes, tout de suite | Un aperçu rendu et un presse-papiers | Du formatage direct partout ; les images peuvent disparaître |
| Markdown vers PDF à la place | Un relecteur qui lit mais ne modifie pas | N’importe lequel des chemins PDF | Aucune modification, aucun commentaire dans le fichier lui-même |
| python-docx, construire le fichier soi-même | Un document généré avec des exigences précises | Python, et un cahier des charges | Vous voilà en train d’écrire un générateur Word |

## Pandoc et le document de référence, expliqués sérieusement

Pandoc est la véritable réponse ici, et le document de référence est la partie qu’on saute. Convertir sans en avoir un fonctionne — `pandoc report.md -o report.docx` produit un fichier Word valide — et cela produit un document qui ressemble à un document Pandoc : du Calibri approximatif, un interlignage généreux, des titres dans un bleu que personne n’a choisi. Les relecteurs y lisent un brouillon venu de l’extérieur de l’organisation, ce qu’il est.

### Ce qu’une .docx conserve et que Markdown n’a pas

Renommez une `.docx` en `.zip` et ouvrez-la. À l’intérieur, `word/document.xml` contient le texte, et presque chaque paragraphe y porte un élément `w:pStyle` nommant un style : `Heading 1`, `Body Text`, `Source Code`. Le style lui-même — police, taille, espacement, couleur, maintien avec le paragraphe suivant, niveau de plan — vit dans `word/styles.xml`. Les définitions de numérotation pour les listes vivent dans `word/numbering.xml`. Taille de page, marges, en-têtes et pieds de page vivent dans les propriétés de section.

Cette indirection est ce qui rend les documents Word modifiables d’une façon qu’un PDF ne l’est pas. Une relectrice qui change le style `Heading 2` change tous les titres de second niveau en une fois. Un document dont le formatage a été appliqué directement — gras ici, 14 pt là — a l’air identique et ne peut absolument pas être restylé, et chaque chemin de cet article, sauf Pandoc-avec-modèle, produit une certaine quantité de ce formatage direct.

### Comment fonctionne --reference-doc

`--reference-doc=FICHIER` est documenté ainsi : « Utilise le fichier indiqué comme référence de style pour produire un fichier docx ou ODT. » Ce que Pandoc prend de ce fichier, ce sont ses feuilles de styles et ses propriétés de document, y compris les marges, la taille de page, l’en-tête et le pied de page (vérifié sur pandoc.org, le 8 septembre 2026). Votre contenu est écrit dans cette coquille.

Le mécanisme est fruste, et c’est sa qualité. Pandoc écrit un paragraphe, l’étiquette `Heading 1`, et Word cherche `Heading 1` dans la feuille de styles venue de votre fichier de référence. Il n’y a aucune couche de correspondance à configurer, aucun langage de modèle à apprendre. Si le style existe dans le document de référence, votre sortie l’utilise. S’il n’existe pas, Word affiche une référence à un style introuvable comme du simple texte `Normal` — exactement pourquoi les blocs de code ressortent comme du corps de texte quand quelqu’un utilise l’en-tête à lettres de l’entreprise comme document de référence sans y ajouter de style `Source Code`.

### Les noms de styles que Pandoc recherche

Voici la liste à épingler au mur, car un document de référence ne vaut que par sa couverture de celle-ci. Les styles de paragraphe que Pandoc utilise dans l’écrivain docx sont `Normal`, `Body Text`, `First Paragraph`, `Compact`, `Title`, `Subtitle`, `Author`, `Date`, `Abstract`, `AbstractTitle`, `Bibliography`, `Heading 1` à `Heading 9`, `Block Text`, `Footnote Block Text`, `Source Code`, `Footnote Text`, `Definition Term`, `Definition`, `Caption`, `Table Caption`, `Image Caption`, `Figure`, `Captioned Figure` et `TOC Heading`. Les styles de caractère sont `Default Paragraph Font`, `Verbatim Char`, `Footnote Reference`, `Hyperlink` et `Section Number`. Il existe un style de tableau, appelé `Table` (vérifié sur pandoc.org, le 8 septembre 2026).

Lisez cette liste comme une carte de ce que Pandoc peut exprimer. `Source Code` et `Verbatim Char` sont ce qui permet aux blocs délimités et au code en ligne de ressembler à du code. `Block Text` est votre citation. `Image Caption` et `Captioned Figure` sont ce que devient `![Une légende](diagramme.png)`. `Definition Term` et `Definition` ne comptent que si vous utilisez la syntaxe de listes de définitions de Pandoc. Si votre modèle maison ne définit aucun de ces styles, voilà le travail de l’après-midi.

### Construire un document de référence, étape par étape

1. **Partez du modèle par défaut de Pandoc plutôt que d’un fichier vide**, avec `pandoc -o custom-reference.docx --print-default-data-file reference.docx`. Il contient déjà tous les styles de la liste ci-dessus, correctement câblés, y compris les définitions de numérotation des listes — vous restylez donc un document qui fonctionne, au lieu de découvrir trois jours plus tard que les listes numérotées ressortent en simples paragraphes.
2. **Ouvrez-le dans Word et modifiez les styles, jamais le texte.** Faites un clic droit sur un style dans la galerie de styles, choisissez Modifier, et changez-y la police, la taille, l’espacement et la couleur. Un formatage appliqué directement au texte d’exemple n’a aucun effet, puisque votre contenu le remplace.
3. **Occupez-vous d’abord des titres et vérifiez le niveau de plan de chacun.** Le volet de navigation de Word, la table des matières et chaque export PDF que vous ferez plus tard lisent tous les niveaux de plan, un `Heading 2` stylé pour ressembler à un titre mais laissé au niveau du corps de texte produira donc un document impossible à naviguer.
4. **Réglez la taille de page, les marges, l’en-tête et le pied de page dans le document de référence, pas à chaque conversion.** Ce sont des propriétés de document que Pandoc reporte telles quelles, ce qui veut dire que le document de référence est aussi là où vit votre mobilier de page — un pied de page avec un numéro de document, par exemple, apparaît à chaque conversion sans être mentionné dans aucune commande.
5. **Si vous devez plutôt partir d’un modèle maison, ajoutez-y les styles manquants sous leur nom exact.** Les modèles d’entreprise ont presque toujours `Heading 1` à `Heading 4` et rien d’autre de la liste ; `Source Code`, `Verbatim Char`, `Block Text`, `Image Caption`, `Table Caption` et le style de tableau `Table` sont les lacunes habituelles, et chaque style manquant est une catégorie de contenu qui arrive non formatée.
6. **Testez avec un document qui utilise tout.** Un fichier avec neuf niveaux de titres, une liste numérotée imbriquée dans une liste à puces, une citation, un bloc de code délimité avec un langage, du code en ligne, une note de bas de page, un lien, une image avec légende et un tableau à trois colonnes. Convertissez-le, ouvrez-le, regardez. Ce fichier a sa place dans le dépôt, à côté du modèle.
7. **Committez le document de référence à côté du Markdown.** C’est une entrée du build, il dérivera le jour où quelqu’un refait l’identité visuelle, et un modèle qui vit dans le dossier Téléchargements d’une seule personne est un modèle qui cesse d’exister quand elle part.

### Les options qui comptent pour l’écrivain docx

| Option | Ce qu’elle fait |
| --- | --- |
| `--reference-doc=FICHIER` | Styles et propriétés du document viennent de `FICHIER` |
| `--toc` | Insère une table des matières construite à partir des titres |
| `-N`, `--number-sections` | Numérote les titres de section ; le manuel cite Docx parmi les sorties prises en charge |
| `--highlight-style=NOM` | Choisit le thème de coloration syntaxique pour les blocs de code ; `--list-highlight-styles` affiche les options |
| `--resource-path=DOSSIERS` | Où chercher les images référencées par un chemin relatif |
| `--dpi=NOMBRE` | Conversion pixels-pouces pour la taille des images ; la valeur par défaut est 96 |
| `--lua-filter=FICHIER` | Réécrit le document en cours de conversion, avant que l’écrivain ne le voie |
| `--metadata-file=FICHIER` | Fournit titre, auteur et date sans toucher au Markdown |

Toutes ces options sont actuelles chez Pandoc (vérifié sur pandoc.org, le 8 septembre 2026). Deux autres choses valent d’être sues sur cet écrivain. Les images sont tirées dans le paquet `.docx`, la sortie est donc un fichier autonome plutôt qu’un document avec des liens vers votre système de fichiers — mais seulement si Pandoc parvient à les trouver, ce à quoi sert `--resource-path`, et pourquoi [les images et les liens qui continuent de fonctionner](/blog/images-and-links-that-still-work) vaut la peine d’être lu avant de déplacer un dossier. Et le HTML brut de votre Markdown est abandonné : un `<div>` ou un `<br>` atteint l’écrivain HTML et non l’écrivain docx, un fichier Markdown qui s’appuie sur du HTML en ligne pour sa mise en page perd donc cette mise en page en silence.

Deux extras de Pandoc sont vraiment utiles une fois les bases acquises. Un div délimité portant un attribut `custom-style` applique le style Word de votre choix à son contenu — `::: {custom-style="Warning"}` enveloppe un bloc dans le style de paragraphe `Warning` de votre modèle — et l’équivalent en span entre crochets fait de même pour les styles de caractère. Et [les tableaux](/blog/markdown-tables-that-survive-conversion) reçoivent le style de tableau `Table`, qui est le seul formatage de tableau que vous obtiendrez, définissez-le donc correctement et n’attendez rien de subtil côté largeur des colonnes.

**Pour qui ?** Quiconque fera cette conversion plus de deux fois. Le modèle est un coût fixe, payé une fois et amorti sur chaque document ensuite, et c’est le seul chemin ici qui produit une `.docx` déjà aux styles de votre organisation, qu’une utilisatrice de Word peut ensuite continuer à restyler depuis la galerie de styles.

## Le chemin HTML : convertir en HTML, puis ouvrir dans Word

Word ouvre les fichiers `.html`. Ce n’est pas une astuce, et ce n’est pas nouveau ; cela fonctionne depuis que Word a appris à enregistrer des pages web. Convertissez votre Markdown en HTML, double-cliquez sur le résultat, et Word l’affiche comme un document que vous pouvez ensuite enregistrer en `.docx` via Fichier, Enregistrer sous.

C’est réellement le chemin le plus rapide, il ne demande aucune installation au-delà d’un convertisseur dans le navigateur, et pour un document court, c’est très bien. C’est aussi le chemin qui produit le fichier le moins modifiable, et il vaut la peine d’être précis sur les raisons.

**Word fait correspondre le HTML importé à ses propres styles intégrés orientés web**, pas à ceux de votre modèle. Les paragraphes de corps arrivent en général en `Normal (Web)`, les blocs préformatés en `HTML Preformatted`. Le `Body Text` de votre organisation n’entre pas en jeu. Le document a l’air raisonnable et n’appartient à aucun modèle.

**Le CSS devient du formatage direct.** Une feuille de style qui dit `h2 { color: #1a4f7a; font-size: 20px }` ne devient pas une définition de style `Heading 2` ; elle devient un formatage appliqué à ces paragraphes. Le relecteur qui ouvre la galerie de styles pour changer la couleur des titres n’y trouve rien à changer, et la personne qui hérite du document plus tard ne peut absolument pas le restyler.

**Les tableaux arrivent sans style de tableau.** Bordures et marges internes viennent de votre CSS comme du formatage direct de cellule, appliquer le look maison des tableaux implique donc de sélectionner chaque tableau et de choisir un style à la main — ce qui abandonne au passage tout ce que faisait votre CSS.

**Les images ne survivent que si elles sont à l’intérieur du fichier.** Un fichier HTML qui référence un `diagramme.png` posé à côté fonctionne jusqu’à ce que le fichier soit envoyé seul par e-mail, moment où le relecteur récupère un cadre vide. Un export HTML autonome, avec les images intégrées en URI de données et les styles dans un bloc `<style>`, est la version de ce chemin qui voyage réellement.

**Le fichier reste du HTML tant que personne ne l’a converti.** Si vous envoyez le `.html` et que le relecteur modifie et enregistre, il modifie toujours du HTML, et la sortie HTML de Word a ses propres habitudes. Enregistrez vous-même en `.docx` avant d’envoyer, et vérifiez le résultat plutôt que de le supposer bon.

**La mise en page vient de nulle part.** Ni taille de page, ni marges, ni en-tête ou pied de page, parce que le HTML n’en avait aucun. Pour un document destiné à être imprimé ou paginé, ce sont autant de décisions que quelqu’un doit désormais prendre à la main.

Pour l’automatisation, le même chemin fonctionne sans Word du tout : produisez du HTML autonome, puis `soffice --headless --convert-to docx report.html`. LibreOffice fait un travail compétent, et son interprétation de votre CSS lui appartient, testez-la donc une fois plutôt que de lui faire confiance.

**Pour qui ?** Des documents ponctuels où le relecteur va commenter sans restyler — un mémo de deux pages, une spécification envoyée pour un seul tour de remarques. Pas pour ce qui entre dans un ensemble de documents régi par un modèle.

Le formatage direct vient du HTML placé au milieu, pas du fait de convertir dans un navigateur. La [conversion Markdown vers Word](/markdown-to-word) de ce site écrit la `.docx` dans le navigateur directement à partir du Markdown, sans étape HTML : les titres utilisent les styles intégrés de Word Heading 1 à 6 (Titre 1 à 6 dans un Word en français), les listes la numérotation propre à Word, les notes se placent en bas de page, et les tableaux portent le style Table Grid (Grille du tableau) avec une ligne d’en-tête répétée sur chaque page. Elle ne prend pas de document de référence, si bien que le fichier arrive avec son propre aspect par défaut plutôt qu’avec celui de votre organisation ; comme les styles portent les noms intégrés de Word, un modèle maison appliqué ensuite dans Word peut les restyler, mais pour un document produit chaque semaine, Pandoc avec un document de référence reste moins de travail.

## Google Docs comme intermédiaire

Google Docs lit et écrit du Markdown nativement. Dans Docs, Fichier, Ouvrir, Importer prend un fichier `.md` et l’ouvre comme un document ; depuis Drive, clic droit sur le fichier importé puis Ouvrir avec Google Docs. Le sens inverse est Fichier, Télécharger, Markdown (.md). Il existe aussi un réglage dans Outils, Préférences, nommé Activer Markdown, qui active Copier en tant que Markdown et Coller depuis Markdown pour déplacer des fragments (vérifié sur support.google.com, le 8 septembre 2026).

Cela fait de Docs un chemin en deux étapes vers Word : importer le Markdown, puis Fichier, Télécharger, Microsoft Word (.docx). Cela ne demande aucune installation ni aucun terminal, ce qui explique qu’on continue de le recommander.

| Avantages | Inconvénients |
| --- | --- |
| Aucune installation, aucune ligne de commande, fonctionne depuis n’importe quelle machine | Le document est téléversé sur les serveurs de Google |
| L’import et l’export sont tous deux des fonctions natives | Vous héritez des styles de Google — Titre, Titre 1 à 6, Texte normal — pas de ceux de votre modèle |
| Le relecteur peut commenter dans Docs et se passer entièrement de `.docx` | Aucun équivalent de `Source Code`, les blocs de code arrivent donc en formatage direct à chasse fixe |
| Le mode suggestion est un vrai flux de relecture avec une vraie traçabilité | Les suggestions ne survivent pas à l’export Markdown ; vous récupérez le texte actuel |

Ce qu’il y a de vraiment intéressant dans ce chemin, c’est qu’il peut supprimer le besoin de Word. Si l’objection du relecteur est « j’ai besoin de commenter et de suggérer des changements », le mode suggestion de Docs fait exactement cela, avec des noms, des dates et un contrôle accepter/rejeter, dans un navigateur, sans qu’aucun fichier ne circule. C’est une meilleure réponse qu’un aller-retour en `.docx` chaque fois que l’organisation l’acceptera — et le même problème de réconciliation attend à la fin, parce que l’export Markdown donne le texte résolu, pas les suggestions.

Le coût, c’est l’endroit où va le document. Pour un README public, cela n’a pas d’importance. Pour un plan non publié, un contrat ou tout ce qui relève d’une obligation de confidentialité, le téléverser pour le convertir est toute la question, et le fait que la conversion soit pratique ne change pas la réponse.

**Pour qui ?** Les équipes déjà dans Google Workspace, qui convertissent des documents non sensibles, où le relecteur est à l’aise dans Docs.

## Les éditeurs qui exportent en .docx, et ce qu’ils font vraiment

Plusieurs éditeurs Markdown ont Word dans leur menu d’export. Il vaut la peine de savoir ce qui se cache derrière cet élément de menu, parce que dans la plupart des cas, c’est Pandoc.

**Typora** exporte vers Word, ODT, RTF, EPUB, LaTeX et plus encore — et sa propre documentation indique que pour les formats autres que HTML, PDF et images, Typora utilise Pandoc pour l’export, qu’il faut installer soi-même (vérifié sur support.typora.io, le 8 septembre 2026). L’export Word de Typora est donc l’export Word de Pandoc avec une boîte de dialogue devant, et il porte les styles par défaut de Pandoc sauf si l’éditeur permet de passer des arguments supplémentaires. Typora coûte 14,99 $ hors taxes, un achat unique couvrant jusqu’à trois appareils, avec un essai gratuit de 15 jours (vérifié sur typora.io, le 8 septembre 2026).

**VS Code** n’a pas d’export `.docx` intégré ; des extensions l’ajoutent, et celles qui le font appellent généralement Pandoc en sous-processus, elles aussi. Si vous convertissez depuis un éditeur, savoir que le vrai moteur est Pandoc vous dit où chercher quand la sortie est fausse : du côté du document de référence, pas de l’éditeur.

**Obsidian** exporte en PDF depuis l’application principale. L’export Word vient d’un plugin communautaire qui appelle Pandoc, avec la même conséquence — les styles sont ceux de Pandoc tant que vous ne le pointez pas vers un modèle.

**Writage** inverse le problème. C’est un plugin Markdown pour Word lui-même, disponible sous Windows et macOS, qui ouvre et enregistre des fichiers `.md` depuis l’intérieur de Word et convertit dans les deux sens. C’est un plugin payant vendu en une seule fois, avec un essai gratuit (vérifié sur writage.com, le 8 septembre 2026). Son intérêt tient à son emplacement : la conversion se fait sur la machine du relecteur, dans l’application qu’il a déjà ouverte, ce qui évite toute la question de savoir qui convertit quoi et quand.

**Le copier-coller** mérite une mention parce que les gens le font de toute façon. Copiez le rendu depuis un volet d’aperçu ou un navigateur, collez dans Word, et le format HTML du presse-papiers transporte étonnamment bien titres, gras, listes, liens et structure de tableau. Tout arrive en formatage direct, les images sont un coup de chance selon la façon dont elles étaient référencées, et les blocs de code perdent en général leur fond. Pour deux paragraphes, c’est l’effort qu’il faut fournir, ni plus ni moins. Pour un document, c’est le chemin vers un fichier que personne ne pourra maintenir.

Le point plus général sur les éditeurs : ils sont le bon choix quand la conversion est occasionnelle et que l’apparence importe peu, et le mauvais choix quand elle fait partie d’un processus répétable, parce que ce qu’on a le plus besoin de contrôler est ce qu’ils cachent le plus souvent. Quel éditeur vous convient est une question à part, et [le comparatif des éditeurs](/blog/best-markdown-editors) y répond mieux qu’un menu d’export.

**Pour qui ?** Les rédacteurs qui convertissent leurs propres documents, un par un, et qui vivent déjà dans l’éditeur.

## Là où l’aller-retour vers Markdown échoue, et ce qu’il coûte

Voici la partie honnête. Faire passer du Markdown dans Word est un problème résolu — Pandoc plus un modèle, terminé. Faire revenir le document Word relu vers Markdown ne l’est pas, et prétendre le contraire est ce qui fait qu’une équipe se retrouve avec un dépôt qui ne correspond plus au document dont tout le monde discute.

Commençons par ce que Pandoc sait faire, parce que c’est plus que ce que la plupart des gens attendent. En lecture d’une `.docx`, `--track-changes` prend trois valeurs. `accept` est la valeur par défaut et traite toutes les insertions et suppressions. `reject` les ignore. `all` inclut insertions, suppressions et commentaires, enveloppés dans des spans portant les classes `insertion`, `deletion`, `comment-start` et `comment-end`, avec l’auteur et l’horodatage de chaque modification ; un paragraphe entièrement inséré ou supprimé produit un span de classe `paragraph-insertion` ou `paragraph-deletion` avant le saut de paragraphe concerné. L’option n’affecte que le lecteur docx (vérifié sur pandoc.org, le 8 septembre 2026).

La relecture est donc récupérable sous forme de données :

```
pandoc --track-changes=all -f docx -t markdown review.docx -o review.md
```

Voici maintenant les coûts, classés selon les ennuis qu’ils causent.

**Les modifications cessent d’être des modifications.** Dans Word, une insertion est une proposition assortie d’un bouton. Dans le Markdown converti, c’est un span entre crochets portant un attribut d’auteur — du texte à propos d’une modification, posé dans la prose, qu’aucun outil Markdown ne peut accepter ni rejeter. Vous le lisez et retapez la décision. Pour un document avec une douzaine de corrections, cela prend vingt minutes. Pour un document annoté ligne par ligne, c’est une journée, et une journée de transcription sans aucun test pour vous dire où vous vous êtes trompé.

**Les commentaires perdent leurs ancrages.** Un commentaire dans Word s’attache à une plage. Une fois converti, il devient un span `comment-start` et un span `comment-end`, et si cela fonctionne pour une expression à l’intérieur d’un paragraphe, les plages de commentaires qui s’étendent sur plusieurs paragraphes ou chevauchent une suppression suivie reviennent déformées ou détachées. Un commentaire dont on ne peut plus identifier la cible est un commentaire que quelqu’un devra de toute façon traquer en ouvrant la `.docx` d’origine.

**`accept` et `reject` jettent chacun la moitié de l’information.** `accept` donne un texte propre et aucune trace de qui a changé quoi ni pourquoi, ce qui était précisément l’objet de la relecture. `reject` rend simplement votre propre document. Aucun des deux n’est un mauvais choix — ce ne sont juste pas des relectures ; ce sont des façons d’en clore une.

**Le diff ne vaut rien tant qu’on n’a pas normalisé d’abord.** C’est l’échec qui surprend les gens. Convertissez une `.docx` en Markdown, et la sortie est le Markdown de Pandoc : son retour à la ligne, son échappement, son style de titres, son alignement de tableaux. Chaque ligne diffère de votre original, `git diff` affiche donc le fichier entier comme modifié, et les corrections réelles du relecteur y deviennent invisibles. Le remède est de faire parler le même dialecte aux deux côtés. Convertissez votre propre Markdown à travers le même pipeline une fois, committez cette version normalisée comme source, et figez les réglages de sortie sur le chemin du retour :

```
pandoc --track-changes=all -f docx -t gfm \
  --wrap=none --markdown-headings=atx \
  review.docx -o review.md
```

Avec les mêmes options des deux côtés, le diff montre la relecture et rien d’autre. Sans elles, il montre une réécriture.

**Tout ce que Word peut exprimer et que Markdown ne peut pas disparaît, quelles que soient les options.** La surbrillance d’un relecteur, une couleur utilisée pour signifier quelque chose, un fil de commentaires avec trois réponses, un tableau restructuré, un emplacement de figure suggéré, une hiérarchie de titres réécrite en restylant plutôt qu’en retapant — rien de tout cela n’a d’endroit où atterrir. Le problème de réconciliation dans l’autre sens, et ce qu’une `.docx` porte qu’aucun fichier Markdown ne peut contenir, sont traités sérieusement dans [convertir une .docx en Markdown](/blog/convert-docx-to-markdown).

**Ce que ça coûte, dit sans détour :** l’aller-retour est à sens unique en pratique. Markdown à l’aller, `.docx` au retour, commentaires lus par un humain, corrections reportées à la main dans le Markdown, qui reste la source unique. Tout processus qui traite la `.docx` renvoyée comme une entrée à fusionner automatiquement produira soit une relecture perdue, soit un commit que personne ne peut lire. Mettez-vous d’accord là-dessus avec le relecteur avant d’envoyer le fichier — « envoyez-moi vos commentaires et je les appliquerai, et la version dans le dépôt est celle qui compte » — et le frottement devient une étape d’un processus plutôt qu’une dispute sur quel fichier fait foi.

## Comment choisir

1. **Décidez si le relecteur modifie ou lit seulement.** S’il ne fait que lire, produisez un PDF ou une page HTML autonome et arrêtez-vous là ; vous éviterez tout le problème de l’aller-retour, et un document que personne ne peut modifier ne peut pas se scinder en deux versions.
2. **Comptez combien de fois vous ferez cela.** Une fois, depuis le menu d’export d’un éditeur, est raisonnable. Chaque semaine impose de construire un document de référence, car l’alternative est de réappliquer le look maison à la main chaque semaine, et de l’obtenir légèrement différent à chaque fois.
3. **Demandez-vous si la sortie sera restylée.** Si elle entre dans un ensemble de documents régi par un modèle, le chemin HTML est disqualifié — son formatage est direct et non stylé, et un document qui ne peut pas être restylé sera retapé à la place.
4. **Vérifiez où le fichier a le droit d’aller.** Un chemin passant par un service hébergé signifie que le document est sur le serveur de quelqu’un d’autre ; pour tout ce qui est confidentiel, cela élimine les options pratiques et ne laisse que Pandoc sur votre propre machine.
5. **Mettez-vous d’accord sur le chemin de retour avant d’envoyer quoi que ce soit.** Notez qui convertit le fichier relu, avec quelles options, et qui applique les changements au Markdown. Le coût d’avoir sauté cette étape apparaît au pire moment possible, celui où la relecture revient et où l’échéance est vendredi.
6. **Testez avec un document qui sollicite tout, sur la copie de Word du relecteur lui-même.** Neuf niveaux de titres, des listes imbriquées, un bloc de code, une note de bas de page, une image avec légende et un tableau large. Les différences de version et de plateforme dans Word se voient exactement là-dessus, et les découvrir par le relecteur coûte cher.

## Conclusion

Le chemin qui fonctionne est Pandoc avec un document de référence construit une fois et committé à côté de votre Markdown, parce que c’est le seul qui produise un fichier Word portant vos propres styles plutôt qu’un formatage figé ou les réglages par défaut de quelqu’un d’autre — et ce sont les styles qui rendent une `.docx` digne d’être envoyée à quelqu’un qui va la modifier. Le chemin HTML est un raccourci raisonnable pour un document court, et il s’améliore considérablement si le HTML de départ est un fichier complet et autonome plutôt qu’un fragment, ce que produit dans le navigateur, sans rien téléverser, [la conversion Markdown vers HTML de TransformPipe](/). Quand le document a besoin de vrais titres et de vraies listes Word mais pas du modèle de votre organisation, la [conversion Markdown vers Word](/markdown-to-word) du même site se passe entièrement du HTML et écrit dans le navigateur une `.docx` construite sur des styles. Google Docs est le choix pragmatique à l’intérieur de Workspace, et le mauvais choix pour tout ce qui est confidentiel. Quel que soit votre choix, décidez d’abord du chemin de retour : la conversion à l’aller est une commande, et la conversion au retour est une conversation avec une personne sur qui applique ses corrections et quel fichier fait foi.

## FAQ

### Comment convertir du Markdown en Word sans rien installer ?

Importez le fichier `.md` dans Google Docs — Fichier, Ouvrir, Importer — puis Fichier, Télécharger, Microsoft Word (.docx). Cela ne demande ni installation ni terminal, au prix du passage du document par les serveurs de Google et de son arrivée avec les styles de Google plutôt que ceux de votre organisation. Les autres chemins sans installation passent par le navigateur : convertir en HTML et ouvrir le résultat dans Word est encore plus rapide et produit un fichier sans jeu de styles utilisable, tandis qu’un convertisseur qui écrit directement la `.docx`, comme celui de ce site, vous donne les styles intégrés de Word pour les titres et les listes, sans votre modèle pour autant.

### Quelle est la meilleure commande Pandoc pour passer de Markdown à Word ?

`pandoc report.md --reference-doc=house.docx -o report.docx`, où `house.docx` est un document de référence que vous avez édité. Ajoutez `--toc` pour une table des matières et `--highlight-style=NOM` si l’apparence des blocs de code vous importe. Sans `--reference-doc`, la commande fonctionne quand même et vous donne l’apparence par défaut de Pandoc.

### Comment faire utiliser mon modèle d’entreprise par Word ?

Construisez un document de référence à partir du modèle par défaut de Pandoc avec `pandoc -o custom-reference.docx --print-default-data-file reference.docx`, puis restylez-le dans Word pour correspondre au modèle. Partir du fichier de Pandoc plutôt que du modèle d’entreprise compte, car la copie de Pandoc définit déjà chaque style que référence l’écrivain docx — y compris `Source Code`, `Block Text` et `Image Caption`, que les modèles d’entreprise n’ont presque jamais.

### Pourquoi mon bloc de code ressemble-t-il à du corps de texte dans le fichier Word ?

Parce que le document de référence n’a pas de style de paragraphe `Source Code`, Word affiche donc une référence à un style qu’il ne trouve pas. Ajoutez `Source Code` pour les blocs délimités et le style de caractère `Verbatim Char` pour le code en ligne, tous deux sous exactement ces noms, et le formatage apparaît.

### Puis-je conserver les modifications suivies en reconvertissant Word vers Markdown ?

Vous pouvez les lire, pas les conserver. `pandoc --track-changes=all` enveloppe insertions, suppressions et commentaires dans des spans avec des attributs d’auteur et d’horodatage, ce qui suffit à voir qui a proposé quoi — mais ils arrivent comme des annotations dans la prose, et aucun outil Markdown ne peut les accepter ni les rejeter. Prévoyez d’appliquer les changements à la main.

### Pourquoi mon diff montre-t-il le fichier entier comme modifié après un aller-retour ?

Parce que le dialecte Markdown du convertisseur n’est pas le vôtre : retour à la ligne différent, échappement différent, style de titres différent. Normalisez les deux côtés en faisant passer votre propre source par le même pipeline une fois, et en figeant les options de sortie — `--wrap=none --markdown-headings=atx`, par exemple — pour que la seule différence montrée par le diff soit les corrections du relecteur.

### Faut-il envoyer du Word ou du PDF pour une relecture ?

Du PDF s’ils lisent, du Word s’ils modifient. Un PDF est plus léger, a le même aspect partout et ne peut pas se scinder en une seconde version du document ; une `.docx` existe pour que quelqu’un puisse la changer, et chaque coût de cet article est le coût de cette capacité. Envoyer du Word à quelqu’un qui voulait seulement lire invite des corrections qu’il faudra ensuite réconcilier.
