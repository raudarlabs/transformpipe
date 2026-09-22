---
title: "Où passent les images quand vous exportez un document"
description: "Chaque export range ses images quelque part et la plupart des conversions les y laissent — où chaque format les garde, les trois issues et le calcul de l'intégration"
date: 2026-09-21
tag: Conversion
keywords: images manquantes markdown, convertir un document en gardant les images, export notion images, images docx markdown, image base64 markdown, exporter un document avec ses images
---

L'export a fonctionné. Les titres sont justes, les listes sont justes, les tableaux sont passés, et chaque image est un rectangle gris au coin corné. C'est de loin la façon la plus courante dont une conversion de document déçoit quelqu'un, et cela ne signifie presque jamais que le convertisseur n'a pas trouvé les images. Il les a trouvées, a décidé qu'elles regardaient quelqu'un d'autre, et a écrit une référence vers un fichier dont il savait que vous ne l'aviez pas.

### En bref

Dans tout format documentaire, une image est un fichier distinct à l'intérieur du conteneur, et le document y renvoie par un chemin. Markdown est un seul fichier texte : il n'existe donc que trois endroits où une image peut atterrir — un dossier à côté du Markdown, une adresse quelque part sur le web, ou le Markdown lui-même, sous forme d'URI `data:`. La plupart des convertisseurs en choisissent une quatrième par accident — un chemin vers le dossier qui aurait existé s'ils avaient écrit les fichiers — et c'est le rectangle gris. L'intégration est la seule des trois qui survive à un envoi par courriel, et elle coûte environ un tiers d'octets de plus que le fichier sur le disque, parce que base64 écrit trois octets en quatre caractères.

La règle pratique : après toute conversion, cherchez `src="` et `](` dans le résultat et regardez ce que disent vraiment les chemins. Cela prend dix secondes et vous dit laquelle des quatre vous avez obtenue.

## Où chaque format garde ses images

| Source | Où sont les octets | Comment le document y renvoie |
| --- | --- | --- |
| `.docx` | `word/media/image1.png` dans le zip | Un identifiant de relation, résolu via `word/_rels/document.xml.rels` |
| `.pptx` | `ppt/media/image1.png` | Le même mécanisme, diapositive par diapositive |
| `.odt` | `Pictures/10000201000...png` | Un `xlink:href` sur un `<draw:image>` |
| `.epub` | Là où le manifeste l'indique, souvent `OEBPS/images/` | Un chemin relatif depuis le XHTML du chapitre |
| Export Notion | Un dossier au nom de la page, suivi de son identifiant de 32 caractères | Un chemin relatif encodé, `%20` pour chaque espace |
| Export HTML Confluence | `attachments/<id de page>/<fichier>` | Un `src` relatif depuis le HTML de la page |
| Coffre Obsidian | Là où vous les avez mises, souvent `assets/` | `![[image.png]]`, résolu sur tout le coffre |
| Evernote `.enex` | En base64 dans le XML de la note | `<en-media hash="…">`, le MD5 des octets décodés |
| Google Docs | Pas dans l'export `.docx` tant que vous n'en faites pas un | Téléchargées dans le zip à l'export HTML |

Deux de ces lignes méritent un second regard, car c'est là que les conversions échouent d'une manière difficile à diagnostiquer.

**Notion** écrit des chemins encodés. Une page nommée `Q3 Plan` devient un dossier `Q3 Plan 1f2a…`, et le Markdown renvoie à `Q3%20Plan%201f2a…/chart.png`. Un convertisseur qui ne décode pas le chemin cherche un répertoire contenant littéralement `%20` dans son nom, ne trouve rien, et ressort la référence telle quelle. [Convertir un export Notion](/blog/convert-notion-export-to-markdown) passe en revue le reste de ce que font ces identifiants.

**Evernote** ne stocke aucun nom de fichier. Une image est adressée par le MD5 de ses propres octets, et la ressource qui porte ces octets se trouve ailleurs dans le même fichier, encodée en base64. Les apparier suppose de calculer un MD5 sur chaque ressource décodée — raison pour laquelle une conversion, ou bien le fait correctement, ou bien perd toutes les images de la note. Il n'y a pas d'entre-deux.

## Les trois destinations possibles

| Destination | Survit au courriel | Survit au déplacement du dossier | Survit à la disparition de la source | Coût |
| --- | --- | --- | --- | --- |
| Un dossier à côté du Markdown | Non — un fichier arrive, l'autre non | Non | Oui | Aucun |
| Une adresse publique | Oui | Oui | Non — lien mort, et l'hébergeur voit qui regarde | Aucun pour vous |
| Une URI `data:` dans le fichier | Oui | Oui | Oui | Environ 4 octets de texte pour 3 octets d'image |

Le dossier est le réglage par défaut de presque tous les outils en ligne de commande, et c'est la bonne réponse quand le Markdown part dans un dépôt : le dossier voyage avec lui, git suit les deux, et personne n'envoie rien par courriel. Le `--extract-media` de Pandoc le fait bien et réécrit les références en conséquence, ce qui est précisément ce qui le distingue des convertisseurs qui n'en font que la moitié.

L'adresse publique est ce qui se produit quand un convertisseur hébergé annonce qu'il a gardé vos images. Il les a gardées, sur son serveur, et la référence dans votre Markdown pointe maintenant là-bas. C'est un document qui fonctionne et une dépendance durable : les images restent tant que ce compte reste, et chaque lecteur qui ouvre le fichier émet une requête que l'hébergeur peut journaliser. Bon à savoir avant d'envoyer le document à un client.

L'URI `data:` est la seule option qui produise un unique fichier autonome, et le bon réglage par défaut pour un document que quelqu'un d'autre va lire. [Le HTML autonome](/blog/self-contained-html-explained) tient le même raisonnement pour la version rendue.

## Le calcul de l'intégration

Base64 transforme trois octets en quatre caractères : une image intégrée pèse donc environ 33 pour cent de plus que le fichier d'origine, plus un court préfixe qui nomme le type. Une capture d'écran de 750 Ko devient à peu près un mégaoctet de texte. Ce chiffre est toute la raison pour laquelle les convertisseurs hésitent à intégrer, et il vaut la peine d'être concret :

- Un rapport de dix pages avec six captures : peut-être 2 Mo de texte. S'ouvre instantanément, s'envoie sans peine, ne casse jamais.
- Une présentation de conférence avec quarante photos : 30 Mo de texte. Un éditeur l'ouvrira lentement et un diff n'en dira rien d'utile.
- Un document numérisé : chaque page est une image, le fichier vaut le scan plus un tiers, et il ne contient aucun texte.

Le bon dessin est un budget, pas un interrupteur : intégrer jusqu'à un plafond, et au-delà laisser les références telles quelles pour que l'échec soit visible plutôt que de produire un fichier que rien n'ouvre. Ici, ce plafond est de deux mégaoctets d'images par document et d'un mégaoctet pour une image seule — un mégaoctet encodé fait environ 750 Ko sur le disque, soit une capture généreuse et une petite photo. Le plafond par image existe pour un échec précis : sans lui, une photo sortie d'un téléphone consomme toute l'allocation et les douze captures suivantes, celles qui portaient le propos, disparaissent toutes.

## Six façons dont les images disparaissent sans que le convertisseur y soit pour rien

**L'image est un lien, pas un fichier.** Un document qui renvoie à une image sur un intranet, à une adresse Google Drive ou à un lien CDN de Slack ne contient aucun octet à extraire. La conversion transporte fidèlement une référence qui ne se résout que depuis votre réseau ou votre session.

**L'image est un métafichier.** Un graphique collé depuis Excel ou un schéma collé depuis Visio est fréquemment stocké en EMF ou WMF, un format vectoriel Windows qu'aucun navigateur ne rend. Les octets sont là, la référence est juste, et le lecteur ne voit rien. Recollez-le comme image dans le document source avant de convertir ; rien en aval ne peut y remédier.

**L'image est un dessin, pas une image.** Les formes Word, le SmartArt de PowerPoint et tout ce qui vient des outils de dessin sont des instructions XML de rendu, pas un fichier image. Il n'y a rien à extraire dans `media/` parce que le document n'a jamais rien contenu.

**Deux images portent le même nom.** Fusionner un dossier de documents en un seul fichier Markdown fait tomber `image1.png` de neuf sources sur un même chemin. Le résultat montre neuf fois la même image, et cela ressemble à un défaut du convertisseur plutôt qu'à une collision de noms.

**Le texte alternatif n'a jamais été écrit.** Le texte alternatif est la seule chose d'une image que Markdown porte parfaitement, et dans la plupart des documents il est vide, parce que l'outil de rédaction ne l'a pas demandé. Quand une image saute pour l'une des raisons ci-dessus, un bon texte alternatif fait la différence entre une phrase qui tient encore debout et un trou.

**L'image est le texte.** Une capture d'écran d'un tableau est une image d'un tableau. C'est l'échec sans aucun remède technique, et le seul moment utile pour le repérer est avant la conversion, dans la source.

## Ce qu'une conversion devrait faire, et ce qu'il faut vérifier

Une conversion qui traite correctement les images fait quatre choses, et chacune se vérifie en moins d'une minute :

1. **Résoudre la référence par le mécanisme propre au format** — identifiants de relation pour OOXML, manifeste pour EPUB, MD5 pour Evernote — plutôt que de deviner d'après un nom de fichier.
2. **Décoder le chemin** avant de chercher le fichier, pour que `%20` et `+` ne deviennent pas des morceaux de nom de répertoire.
3. **Dire ce qu'elle a fait des octets.** Intégrés, écrits à côté, ou laissés sur place : les trois se défendent, le silence non.
4. **Garder le texte alternatif**, y compris quand elle laisse tomber l'image.

Et côté résultat :

- Cherchez `](` et lisez les chemins. Tout ce qui est relatif est une promesse sur un dossier.
- Cherchez `data:image` et comptez. Cela vous dit combien ont été intégrées.
- Regardez la taille du fichier. Un document Markdown avec images intégrées se mesure en mégaoctets ; sans elles, en kilo-octets, quel que soit le nombre d'images de l'original.
- Ouvrez-le ailleurs. La machine de l'auteur est le seul endroit où tous les chemins se résolvent, ce qui est exactement pourquoi l'auteur est le dernier à s'en apercevoir.

## Où cela vous mène

Pour un document qui part dans un dépôt, un dossier à côté est la bonne réponse, à la seule condition que le convertisseur réécrive les références vers l'endroit où il a réellement écrit. Pour un document qui part vers une personne, l'intégration est la seule réponse qui survive au trajet, et le prix est un tiers d'octets de plus et un plafond qu'il vaut mieux connaître que découvrir. Pour tout le reste, la vérification tient aux mêmes trois recherches, et elle mérite d'être faite une fois sur un document auquel vous tenez avant de confier cinquante documents à un outil.

Chaque conversion proposée ici — [Word](/word-to-markdown), [PowerPoint](/powerpoint-to-markdown), [les exports Notion, Confluence et Obsidian](/notion-to-markdown) parmi elles — intègre les images qu'elle trouve, dans le navigateur, si bien que rien n'est téléversé pour être hébergé et que rien ne dépend d'un dossier resté en arrière. Pour le problème voisin des liens qui ne se résolvent que depuis votre bureau, [les images et les liens qui fonctionnent encore](/blog/images-and-links-that-still-work) dit l'essentiel.
