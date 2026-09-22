---
title: "Convertir un EPUB en Markdown : ordre du spine, titres de chapitre et notes"
description: "Un EPUB est un site web dans un zip — ce que donnent Pandoc, calibre et une lecture directe, et les quatre choses qui cassent quand un livre devient un seul fichier"
date: 2026-09-21
tag: Conversion
keywords: epub en markdown, convertir epub en markdown, livre numérique en texte, extraire le texte d'un epub, calibre epub markdown, pandoc epub markdown
---

Un EPUB est un petit site web qui se trouve être vendu comme un livre : des fichiers XHTML, une feuille de style, des images et un index qui indique dans quel ordre les lire. C'est ce qui en fait le plus accueillant des formats documentaires, et c'est aussi pourquoi les problèmes intéressants ne concernent pas l'analyse syntaxique. Ils concernent ce qui arrive quand cent quatre-vingts fichiers distincts deviennent un seul document Markdown et que chaque lien entre eux cesse de pointer vers quoi que ce soit.

### En bref

Renommez un `.epub` en `.zip` et vous pouvez tout lire. `META-INF/container.xml` désigne le document de paquet, et le spine de celui-ci donne l'ordre de lecture — qui, comme dans tout format zippé, n'est pas l'ordre des noms de fichiers (vérifié sur w3.org, le 21 septembre 2026). Pandoc lit l'EPUB directement, et le lit bien : `pandoc -f epub -t gfm book.epub -o book.md --extract-media=media`. calibre sait aussi produire du Markdown, via sa sortie TXT : `ebook-convert book.epub book.txt --txt-output-formatting=markdown`, mais il supprime les liens et les références d'image tant que vous ne passez pas `--keep-links` et `--keep-image-references` (vérifié sur manual.calibre-ebook.com, le 21 septembre 2026). Un convertisseur qui lit les parties directement, comme [EPUB → Markdown](/epub-to-markdown), résout le spine, prend les titres de chapitre dans le document de navigation et transforme les renvois entre chapitres en quelque chose qui fonctionne encore à l'intérieur d'un seul fichier.

Ce qui casse dans tous les cas : les liens entre chapitres, les notes marquées par `epub:type`, les listes de pages, et tout ce que contient un livre à mise en page fixe, c'est-à-dire des images avec le texte dessiné dedans.

## Ce que contient un .epub

| Chemin | Rôle |
| --- | --- |
| `mimetype` | La première entrée du zip, non compressée, qui annonce un EPUB |
| `META-INF/container.xml` | Le seul fichier à chemin fixe — il nomme le document de paquet |
| `OEBPS/content.opf` | Le document de paquet : métadonnées, manifeste de tous les fichiers, et spine |
| `OEBPS/nav.xhtml` | Le document de navigation d'EPUB 3 — la table des matières, en liste imbriquée |
| `OEBPS/toc.ncx` | Son équivalent EPUB 2, encore présent dans la plupart des livres par compatibilité |
| `OEBPS/chapter-12.xhtml` | Un chapitre, en XHTML ordinaire |
| `OEBPS/images/` | Les images, couverture comprise |

Deux règles rendent cela facile à lire et une le rend facile à rater. Les faciles : `META-INF/container.xml` est le seul chemin à connaître, puisque tout le reste se découvre à partir de lui, et le contenu est du XHTML, que n'importe quel analyseur HTML traite déjà. La difficile est celle de tous les formats zippés : le spine définit l'ordre de lecture, et rien d'autre ne le fait. `chapter-12.xhtml` peut être le troisième chapitre, l'annexe, ou un fichier inutilisé resté dans le manifeste. Trier par nom de fichier produit un livre dans un ordre que personne n'a écrit.

## Les trois voies

| Voie | Ordre | Titres de chapitre | Images | Liens entre chapitres | Notes |
| --- | --- | --- | --- | --- | --- |
| Pandoc | Depuis le spine | Depuis les titres | `--extract-media` | Conservés, pointant vers du vide | Conservés comme liens |
| calibre TXT/Markdown | Depuis le spine | Depuis les titres | Désactivées par défaut | Désactivés par défaut | Conservés si les liens le sont |
| Lire les parties directement | Depuis le spine | Navigation d'abord, titres ensuite | Intégrées | Réécrivables en ancres internes | Résolvables jusqu'au texte de la note |
| Copier depuis une liseuse | Ce que vous avez sélectionné | Non | Non | Non | Non |

## Pandoc, qui lit bel et bien l'EPUB

`epub` figure des deux côtés de la liste de Pandoc depuis des années, ce qui n'est pas vrai de tous les formats qu'il écrit : `pptx` n'était qu'un format de sortie jusqu'au lecteur ajouté en 3.8.3 (vérifié sur pandoc.org, le 22 septembre 2026). C'est la meilleure réponse courte pour un livre que vous voulez en un seul fichier :

```bash
pandoc -f epub -t gfm book.epub -o book.md --extract-media=media
```

`--extract-media` écrit chaque image dans le dossier indiqué et réécrit les liens d'image vers celui-ci, ce que vous voulez, car l'alternative est un Markdown qui renvoie à des fichiers toujours scellés dans le zip. Ajoutez `--wrap=none` si le retour à la ligne forcé gêne vos diffs.

Vous obtenez un document fidèle et plat : les titres de chaque chapitre au niveau que le XHTML employait, les paragraphes dans l'ordre du spine, les images à côté du fichier. Ce que vous n'obtenez pas, c'est la moindre prise en compte du fait que les chapitres étaient des documents séparés. Chaque `<a href="chapter-13.xhtml#note-4">` du livre est désormais un lien vers un fichier qui n'existe pas, dans un document Markdown qui contient précisément la cible, quelques centaines de lignes plus bas.

| Avantages | Inconvénients |
| --- | --- |
| Une commande, aucune configuration, grande fidélité | Les liens entre chapitres survivent en chemins relatifs cassés |
| L'ordre du spine est traité correctement | Les titres viennent des en-têtes : un livre dont les ouvertures de chapitre sont des images a des chapitres sans nom |
| `--extract-media` règle proprement la question des images | Pages liminaires, copyright et index passent tous comme des chapitres |

**Pour qui ?** Pour qui a déjà Pandoc et un livre de structure conventionnelle. C'est le bon réglage par défaut, et le problème des liens tient à un chercher-remplacer.

## calibre, et les deux options qui comptent

`ebook-convert`, dans calibre, est l'autre outil que la plupart des gens ont déjà, et il atteint le Markdown par sa sortie TXT :

```bash
ebook-convert book.epub book.txt \
  --txt-output-formatting=markdown \
  --keep-links \
  --keep-image-references
```

L'option de formatage accepte `plain`, `markdown` ou `textile`. Les deux options `--keep` sont la partie à connaître, parce que leur absence est silencieuse : la documentation indique que les liens sont toujours retirés en sortie texte brut, et que les conserver n'a de sens qu'une fois une option de formatage choisie (vérifié sur manual.calibre-ebook.com, le 21 septembre 2026). Lancez la commande sans elles et vous obtenez un livre propre, lisible et sans liens, sans que rien ne vous dise qu'il en contenait quatre cents.

`--keep-image-references` a le défaut symétrique de celui de Pandoc : il garde les références et n'extrait pas les fichiers, si bien que vous vous retrouvez avec `![](../images/fig-3.png)` pointant dans un zip que vous n'avez plus ouvert. calibre produira volontiers aussi une sortie HTMLZ contenant les images — moment où vous faites l'extraction à la main de toute façon.

| Avantages | Inconvénients |
| --- | --- |
| Déjà installé partout où une bibliothèque est gérée | Deux options peu évidentes vous séparent d'une conversion sans perte |
| Encaisse bien plus de livres mal formés que Pandoc | Les références d'image sont gardées, les fichiers non |
| La conversion en lot d'une bibliothèque tient en une ligne | Le Markdown est un sous-produit d'un exporteur de texte, pas un format cible |

**Pour qui ?** Pour qui convertit beaucoup de livres d'un coup, ou un livre que Pandoc refuse. C'est aussi le plus indulgent des deux lecteurs, ce qui compte plus qu'il ne devrait : une part surprenante des EPUB réels ne sont pas valides.

## Lire les parties soi-même

Le format entier tient en quatre étapes, assez courtes pour valoir la peine d'être connues même si vous ne les écrivez jamais :

```text
1. unzip the file
2. read META-INF/container.xml → <rootfile full-path="OEBPS/content.opf">
3. read the opf:
     <manifest> → id → href, media-type
     <spine>    → ordered list of idrefs
4. for each idref in spine order: parse the XHTML, convert it, append
```

Procéder ainsi vaut l'effort pour une seule raison : vous avez le spine et le document de navigation en main en même temps, et c'est ce qui fait sortir correctement les titres de chapitre et les liens. Ni Pandoc ni calibre ne prend les titres dans le document de navigation — tous deux prennent ce que disent les en-têtes du XHTML, ce qui est le plus souvent la même chose et parfois non.

## Les quatre choses qui cassent, et quoi y faire

### Des titres de chapitre absents du chapitre

L'ouverture d'un chapitre est fréquemment une image dessinée — le numéro composé dans un caractère de titrage, exporté en PNG — dont le texte n'apparaît nulle part dans le XHTML. Le document de navigation sait pourtant que le chapitre s'appelle « Le second hiver », puisque c'est la chaîne que la liseuse affiche dans sa table des matières. Une conversion qui ne lit que les fichiers de chapitre produit un document sans aucun titre, et sans explication apparente.

Le remède est de prendre le titre dans le document de navigation, indexé par le fichier qu'il désigne, et de ne retomber sur le premier en-tête que si la navigation n'a rien. [EPUB → Markdown ici](/epub-to-markdown) lit `nav.xhtml` et `toc.ncx` exactement pour cela, car quantité de fichiers EPUB 3 portent un NCX aux libellés meilleurs que leur nav.

### Les liens entre chapitres

C'est ce qui distingue un livre d'un document. Dans l'EPUB, `<a href="ch13.xhtml#fn4">` est un lien fonctionnel vers un autre fichier. Dans un document Markdown unique, la source et la cible sont dans le même fichier, et le lien est un chemin relatif vers un fichier qui n'existe pas.

Il y a trois réponses défendables, et la mauvaise est de ne rien faire :

- **Réécrire en ancre interne.** `ch13.xhtml#fn4` devient `#fn4`, ce qui marche si l'identifiant cible a survécu jusque dans le Markdown et si le moteur de rendu émet des identifiants pour les titres. Meilleur résultat, plus de travail.
- **Supprimer le lien, garder le texte.** La phrase se lit correctement et rien n'est cassé. C'est ce qu'une conversion devrait faire par défaut.
- **Laisser le href tel quel.** Le document contient maintenant des liens qui échouent en silence. C'est ce que font la plupart des conversions.

### Les notes

EPUB 3 marque les notes avec `epub:type="noteref"` sur le lien et `epub:type="footnote"` sur la cible, laquelle vit d'ordinaire en fin de chapitre ou dans un fichier de notes séparé. Markdown a une syntaxe de note dans la plupart de ses dialectes, et c'est une cible vraiment bonne : `[^4]` dans le texte, `[^4]: la note` en bas. Presque rien n'établit cette correspondance, parce qu'elle exige de lire les attributs `epub:type` et d'apparier les identifiants d'un fichier à l'autre au lieu de convertir chaque fichier isolément. [Ce que Markdown fait des notes de bas de page](/blog/markdown-footnotes-support) dit quels moteurs gèrent la syntaxe une fois que vous l'avez.

### Les livres à mise en page fixe

Bandes dessinées, albums pour enfants, livres de cuisine et la plupart des ouvrages illustrés sortent en EPUB à mise en page fixe : une image par page, positionnée en absolu, avec le texte cuit dans l'image. Il n'y a pas de texte à convertir. La conversion d'un tel livre produit une liste d'images et une poignée de numéros de page, et ce n'est pas une défaillance de l'outil — les mots n'ont jamais été des caractères. Cherchez `<meta property="rendition:layout">pre-paginated</meta>` dans le document de paquet avant d'y passer du temps.

## Ce qui ne marchera pas

**Un livre protégé par DRM.** Ses fichiers de contenu sont chiffrés et listés dans `META-INF/encryption.xml` ; chacun des outils ci-dessus lit le zip, trouve du chiffré et échoue. C'est le comportement voulu du format, et rien dans cet article n'est un moyen de le contourner. Les livres vendus sans DRM, ceux publiés sous une licence qui l'autorise et vos propres manuscrits sont tous des EPUB ordinaires.

**La vraie typographie.** Lettrines, petites capitales, ponctuation suspendue, titrage crénelé et contrôle soigneux des lignes creuses et orphelines relèvent tous de la feuille de style. Markdown n'a aucun moyen de les exprimer et, dans l'ensemble, ne devrait pas en avoir. Ce que cela coûte mérite d'être nommé quand la chose convertie est un livre dessiné plutôt qu'un manuscrit.

**La sémantique de la feuille de style.** Un livre qui distingue une épigraphe d'un exergue et d'une citation en bloc le fait avec trois classes CSS sur trois blockquotes. Markdown en a un. Quelque chose sera perdu, et lequel des trois importe le plus est une décision qui n'appartient qu'à vous — avant la conversion, en changeant le balisage, pas après.

## Une liste pour un livre auquel vous tenez

1. **Vérifiez la propriété de mise en page** et cherchez `pre-paginated` avant toute chose. Si la mise en page est fixe, arrêtez-vous là.
2. **Comptez les entrées du spine** et les chapitres du Markdown obtenu. Un écart signifie en général que des pages liminaires ont fusionné ou qu'une section a sauté.
3. **Cherchez `.xhtml` dans la sortie.** Chaque occurrence est un lien qui fonctionnait.
4. **Regardez le premier titre de chaque chapitre.** Si plusieurs commencent par une image et sans titre, les titres viennent du mauvais endroit.
5. **Tranchez sur les pages liminaires et finales.** Copyright, dédicace, index et colophon se convertissent tous, et dans un document que vous allez éditer, c'est du bruit. Ce sont aussi les éléments les plus faciles à retirer une fois pour toutes, au début.
6. **Si le livre a des notes, suivez-en une de bout en bout** — l'appel dans le texte, la note elle-même, et ce qui les relie encore.

## Où cela vous mène

Pour un livre, `pandoc -f epub -t gfm --extract-media=media` et dix minutes à réparer les liens est le chemin honnête le plus court. Pour une étagère entière, calibre avec les deux options `--keep` traite le lot proprement. Pour un livre dont les notes et les titres comptent — un ouvrage de référence, un manuscrit qui revient de l'éditeur, tout ce que vous comptez continuer à travailler — la différence tient aux parties que les outils généralistes ne lisent pas, et [la conversion EPUB → Markdown proposée ici](/epub-to-markdown) prend les titres dans le document de navigation et intègre les images pour que le résultat soit un fichier unique. Une fois en Markdown, [le fusionner et le découper](/blog/merging-many-markdown-files) est un problème tout autre, et bien plus simple.
