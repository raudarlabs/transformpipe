---
title: "Ce qu'est Pandoc, et quand vous n'en avez pas besoin"
description: "Pandoc, c'est un programme, cinquante lecteurs, soixante-six écrivains et un modèle de document au milieu. Ce que cela apporte, et les tâches où c'est trop."
date: 2026-09-22
tag: Conversion
keywords: qu'est-ce que pandoc, pandoc, pandoc en ligne, application pandoc, utiliser pandoc, installer pandoc, alternative à pandoc
---

Presque tout ce qui s’écrit sur Pandoc part d’une commande que quelqu’un veut lancer. Ce texte commence un cran plus tôt, parce que la commande n’a de sens qu’une fois su ce qu’est le programme : un seul binaire qui lit cinquante formats, en écrit soixante-six, et ne convertit jamais l’un vers l’autre directement.

### En bref

Pandoc est un programme en ligne de commande et une bibliothèque Haskell. Il lit un document dans une représentation interne, puis réécrit cette représentation dans un autre format. C’est un logiciel libre sous GPL, écrit par John MacFarlane et publié depuis 2006. Il n’y a pas d’application, pas de compte et aucun service en ligne officiel — une démonstration sur `pandoc.org/try`, rien d’autre. Vous le voulez quand la tâche est une matrice de formats, des citations, du Word à la charte d’une autre équipe, ou la même conversion mille fois. Vous ne le voulez pas quand la tâche est un fichier, une fois, sur une machine où vous n’avez pas le droit d’installer quoi que ce soit — ou quand le document est un onglet que vous regardez plutôt qu’un fichier que vous détenez.

## Un programme, deux listes et un document au milieu

La conception tient en une idée, et tout le reste en découle. Pandoc ne convertit pas du Markdown en HTML. Il **lit** le Markdown vers un arbre syntaxique abstrait — un document fait de titres, de paragraphes, de listes, de tableaux, de liens, de notes — puis il **écrit** cet arbre en HTML. La moitié qui lit et la moitié qui écrit ne se connaissent pas.

C’est pourquoi la liste des formats est si longue sans que personne ait écrit mille convertisseurs. Cinquante lecteurs et soixante-six écrivains, ce ne sont pas 116 travaux, ce sont 116 travaux qui produisent 3 300 conversions. Personne n’a écrit un convertisseur de carnet Jupyter vers le wiki de Jira. Il sort du croisement.

Cela explique aussi les deux propriétés qui surprennent :

**Un format est un lecteur ou un écrivain, et pas automatiquement les deux.** LaTeX, DocBook et Word sont les deux. Beamer, ICML et reveal.js sont uniquement des écrivains. RIS et EndNote XML sont uniquement des lecteurs. Demander une conversion pour laquelle il n’existe pas de lecteur donne une erreur plutôt qu’un mauvais résultat, et c’est le comportement honnête.

**Ce que Pandoc ne sait pas représenter est perdu à la lecture, pas à l’écriture.** Si les commentaires d’un fichier Word n’entrent pas dans l’arbre, aucun format de sortie ne pourra les imprimer. C’est pourquoi « Pandoc a perdu mon X » est presque toujours une question adressée au lecteur.

## La liste change, et ce dont vous vous souvenez est périmé

Le 1er décembre 2025, la version 3.8.3 a ajouté `pptx` et `xlsx` comme formats **d’entrée**. Pendant dix-neuf ans, une présentation PowerPoint était quelque chose que Pandoc écrivait sans savoir le lire, et les conseils qui circulent — y compris, jusqu’à ce matin, quatre articles de ce site — le répètent encore.

L’habitude utile n’est donc pas de mémoriser la matrice, mais d’interroger le programme :

```bash
pandoc --list-input-formats
pandoc --list-output-formats
pandoc --version
```

Trois commandes, et la réponse vaut pour la version que vous avez réellement. Les mêmes listes se trouvent dans les menus de `pandoc.org/try`, ce qui est la façon la plus rapide de vérifier sans rien installer : `pptx` et `xlsx` y figurent tous deux dans la liste « from » (vérifié le 22 septembre 2026).

Une réserve, si vous acceptez cette offre pour une présentation : le lecteur PowerPoint ouvre les diapositives, leurs tableaux, leurs images et leur SmartArt, et n’ouvre pas du tout la partie des notes. [Ce que devient une présentation et ses notes du présentateur](/blog/convert-powerpoint-to-markdown) est traité ailleurs en détail ; les deux nouveaux lecteurs se déclarent alpha dans leur propre source.

## Il n’y a pas d’application Pandoc, ni de Pandoc en ligne

Les deux se cherchent, alors disons-le nettement : Pandoc est un programme en ligne de commande. Il n’existe pas d’application graphique officielle, ni de service hébergé officiel.

Ce qui existe sur `pandoc.org/try` est une démonstration — une zone de texte, deux menus et un bouton, pour essayer une conversion sur un extrait. Ce n’est pas un convertisseur de fichiers et cela ne prétend pas l’être.

Tout ce qui s’appelle par ailleurs « Pandoc en ligne » est le serveur de quelqu’un sur lequel Pandoc est installé. C’est une chose légitime à construire, et nous en construisons une voisine, mais cela déplace entièrement la question : votre document est désormais un fichier sur une machine que vous ne contrôlez pas, avec une durée de conservation que vous n’avez pas lue. [Comment vérifier où un convertisseur envoie vraiment votre fichier](/blog/is-an-online-converter-safe) vaut pour tous.

## Les quatre commandes qui couvrent l’essentiel

```bash
# Markdown vers une vraie page HTML, tout dans un seul fichier
pandoc notes.md -o notes.html --standalone --embed-resources

# Un fichier Word vers Markdown, avec ses images écrites à côté
pandoc report.docx -t gfm -o report.md --extract-media=media

# Markdown vers Word, à la charte de quelqu’un d’autre
pandoc paper.md -o paper.docx --reference-doc=template.docx

# Markdown avec citations vers un PDF
pandoc paper.md --citeproc --bibliography=refs.bib -o paper.pdf
```

Deux notes. `--self-contained` est l’ancien nom de la seconde option de la première ligne ; c’est aujourd’hui un synonyme déprécié de `--embed-resources --standalone`, donc une réponse vieille de quatre ans fonctionne toujours et vous avertit au passage.

Et la dernière ligne cache une installation. **Markdown vers PDF n’est pas un des écrivains de Pandoc.** Le PDF est produit en confiant le document à un moteur séparé, et la valeur par défaut est un moteur TeX — en général un téléchargement bien plus gros que Pandoc lui-même, et la raison la plus courante pour laquelle quelqu’un conclut que Pandoc dépasse son besoin. `--pdf-engine` peut viser `weasyprint`, `wkhtmltopdf`, `typst`, `prince`, `pagedjs-cli` ou `context`, dont plusieurs sont nettement plus légers. [Les routes de Markdown vers PDF](/blog/markdown-to-pdf) les compare.

## Quand rien d’autre ne fera l’affaire

- **Une matrice de formats.** Une source, plusieurs sorties, tenues au même pas : HTML pour le site, DOCX pour la relecture, EPUB pour le train. Tout ce qui est plus léger fait bien une seule sortie.
- **Les citations.** `--citeproc` avec BibTeX, BibLaTeX ou CSL JSON, et des centaines de styles CSL. Rien d’autre dans cette catégorie n’a de processeur de citations.
- **Une charte pour Word.** `--reference-doc` reprend polices, styles de titres et espacements d’un `.docx` existant. Si le modèle vient du service juridique ou du marketing, cette option est à elle seule la raison d’installer Pandoc.
- **Les filtres.** Un filtre Lua ou JSON réécrit le document tant qu’il est encore un arbre : renuméroter chaque tableau, promouvoir chaque titre, réécrire chaque lien interne. La version à coups d’expressions régulières marche jusqu’au jour où elle ne marche plus.
- **Le volume.** C’est un binaire qui lit l’entrée standard et écrit sur la sortie standard. Mille fichiers, c’est une boucle `for`.

## Quand c’est plus que ce que la tâche demande

- **Un fichier, une fois.** Amener un document seul jusqu’à HTML, c’est `--standalone`, puis une feuille de style, puis éventuellement un gabarit écrit dans le langage de gabarits de Pandoc. C’est un vrai travail de mise en place, et il ne rétrécit pas quand la tâche est petite. [Les alternatives plus légères](/blog/pandoc-alternatives-for-markdown-to-html) sont classées selon la partie que vous cherchez à éviter.
- **Une machine où vous ne pouvez rien installer.** Un portable administré, un téléphone, le bureau de quelqu’un d’autre.
- **Un document qui n’est pas un fichier.** Une page de wiki, un ticket, un fil — tout ce qui n’existe que rendu dans un navigateur doit d’abord être enregistré pour que Pandoc le voie, et l’enregistrer est la moitié difficile.
- **Une conversion dont vous voulez voir le résultat avant de lui faire confiance.** Pandoc est un outil de chaîne de traitement : excellent une fois que vous savez ce que vous voulez, coûteux tant que vous le cherchez encore.

## Où se situe ce site

TransformPipe convertit dans le navigateur : quinze formats en entrée, du Markdown et un fichier HTML autonome en sortie, et le fichier ne quitte pas la machine. Cela couvre le milieu de la dernière liste — un document, aucune installation, un résultat que vous voyez — et rien de la première. Il n’y a ici ni processeur de citations, ni langage de gabarits, ni matrice de formats, ni PDF dans un sens ou dans l’autre.

Le résumé honnête : deux outils différents pour deux moitiés du même problème, et la frontière s’énonce simplement. Si la conversion se reproduit la semaine prochaine, scriptez-la avec Pandoc. Si elle a lieu une fois, dans les deux minutes qui viennent, vous ne devriez rien avoir à installer pour cela.
