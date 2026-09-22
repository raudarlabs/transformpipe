---
title: "Dix convertisseurs Markdown comparés par ce qu'ils refusent de lire"
description: "Toute comparaison compte les formats pris en charge. L'autre décompte est le bon — ce que dix convertisseurs refusent, et s'ils le disent avant ou après"
date: 2026-09-22
tag: Conversion
keywords: comparatif convertisseur markdown, meilleur convertisseur markdown, pandoc ou markitdown, docling comparaison, comparatif convertisseur de documents, convertir en markdown outil
---

La page d'accueil de chaque convertisseur compte vers le haut : trois cents formats, vingt-cinq mille conversions. Le chiffre est vrai et presque inutile, car une liste de formats est une liste de choses qui ne produiront pas immédiatement une erreur. Ce qui sépare ces outils, c'est l'autre liste — celle que personne ne publie — de ce que chacun ne lit pas du tout, de ce qu'il lit et écarte en silence, et du moment où vous l'apprenez : avant de vous fier au résultat, ou trois documents plus tard.

### En bref

Dix outils, vérifiés sur leur propre documentation le 22 septembre 2026. Pandoc lit `docx` et `epub` et ne lit pas `pptx` du tout. calibre atteint Markdown par son exporteur de texte et supprime tous les liens si vous ne passez pas deux options. LibreOffice Writer sait désormais enregistrer du Markdown directement, en CommonMark. Google Docs sait l'exporter, la moitié copier-coller étant désactivée par défaut. MarkItDown lit PowerPoint, notes du présentateur comprises. Docling lit la plus large liste d'entrées présente ici. CloudConvert convertit une présentation en Markdown et ne liste pas l'EPUB comme source. Turndown lit du HTML et rien d'autre, à dessein. Mammoth lit le `.docx` et produit du HTML, pas du Markdown. python-pptx vous donne les pièces et aucun format de sortie.

Aucun n'est mauvais. Chacun a été bâti pour une forme de problème différente, et l'écart entre cette forme et la vôtre est l'endroit où les conversions se gâtent.

## Les sept questions qui séparent vraiment

Compter les formats masque les différences. Ces sept, non :

1. **Le fichier quitte-t-il votre machine ?**
2. **L'outil lit-il le conteneur ou seulement le texte ?** Un `.pptx` est un zip de parties XML ; lire `ppt/slides/*.xml` et s'arrêter fait un outil différent de celui qui ouvre aussi `ppt/notesSlides/` et `ppt/media/`.
3. **Qu'advient-il des images** — intégrées, écrites à côté du fichier, ou renvoyées vers un dossier qui n'existe pas ?
4. **Dit-il ce qu'il a laissé tomber ?** Le silence est la propriété coûteuse.
5. **Markdown est-il une cible ou un sous-produit ?** Un exporteur de texte à qui il a poussé un mode Markdown ne se comporte pas comme un convertisseur visant Markdown.
6. **Sait-il lire un dossier comme un seul document ?** Un export Notion, Confluence ou Obsidian, ce sont plusieurs fichiers et un document.
7. **Faut-il installer, se connecter, ou ni l'un ni l'autre ?**

## Le tableau

Vérifié sur la documentation de chaque projet, le 22 septembre 2026.

| Outil | S'exécute | Lit pptx | Lit epub | Markdown est | Images |
| --- | --- | --- | --- | --- | --- |
| Pandoc | En local | Non — sortie seulement | Oui | Une cible à part entière | `--extract-media` les écrit |
| calibre | En local | Non | Oui | Un mode de sortie TXT | Références gardées avec une option |
| LibreOffice Writer | En local | Ouvre la présentation, enregistre depuis Writer | Oui | Un filtre d'enregistrement, CommonMark | Non traité dans la doc |
| Google Docs | Hébergé | L'ouvre, exporte depuis Docs | Non | Téléchargement et import | Non traité dans la doc |
| MarkItDown | En local | Oui, avec les notes | Oui | La seule cible | Noms de fichiers, ou URI data sur demande |
| Docling | En local | Oui | Oui | Une sortie parmi plusieurs | Intégrées ou référencées |
| CloudConvert | Hébergé | Oui | Pas listé pour md | Une sortie parmi des centaines | Côté serveur, selon le service |
| Turndown | Une bibliothèque | Non | Non | La seule cible | Reprises du HTML |
| Mammoth | Une bibliothèque | Non | Non | Non produit — le HTML l'est | Un rappel que vous écrivez |
| python-pptx | Une bibliothèque | Oui, notes comprises | Non | Rien n'est produit | `shape.image.blob`, à vous de l'écrire |

## Ce que chacun est, en un paragraphe

**Pandoc** est la mise en œuvre de référence de l'idée que les documents ont une structure commune. Sa liste de formats est asymétrique d'une façon qui mérite d'être retenue : `docx` figure comme lecteur et comme écrivain, `epub` de même, et `pptx` seulement comme écrivain. `pandoc -f pptx` n'est pas une conversion médiocre, c'est une erreur. Pour tout ce qu'il lit, c'est l'outil le plus fidèle et le plus scriptable d'ici. [Des solutions plus légères](/blog/pandoc-alternatives-for-markdown-to-html) existent pour le cas du fichier unique.

**calibre** convertit des livres numériques, et Markdown est accessible par sa sortie texte : `--txt-output-formatting=markdown`. Le piège est documenté et silencieux en pratique — les liens sont toujours retirés en sortie texte brut, donc sans `--keep-links` et `--keep-image-references` vous obtenez un livre propre, lisible, sans liens, et aucun signal qu'il en contenait quatre cents. C'est aussi le lecteur le plus indulgent d'EPUB malformés, ce qui compte plus qu'il ne devrait.

**LibreOffice Writer** enregistre désormais du Markdown directement : Fichier, Enregistrer sous, Document Markdown (.md), et la documentation indique qu'il met en œuvre la spécification CommonMark. C'est un changement notable — le conseil courant a longtemps été de passer par le HTML — et la documentation ne dit pas ce que deviennent les images et les tableaux, ce qui est exactement le genre de lacune à tester sur votre propre document avant de lui en confier cinquante.

**Google Docs** importe et exporte du Markdown, l'export étant actif par défaut ; « Copier au format Markdown » et « Coller depuis Markdown » sont distincts et désactivés tant que vous ne les activez pas dans Outils, Préférences, Activer Markdown. C'est le convertisseur que la plupart des gens ont déjà, et ses limites sont les évidentes : votre document est déjà sur le serveur de quelqu'un, et ce que Docs ne savait pas représenter a été perdu à l'entrée, pas à la sortie.

**MarkItDown**, de Microsoft, vise directement Markdown et lit PowerPoint correctement — y compris `slide.has_notes_slide`, qu'il écrit sous un titre `### Notes:`. Les images sortent par défaut en références de nom de fichier, et en URI data sur demande ; les graphiques deviennent des tableaux là où il sait les lire, et un `[unsupported chart]` explicite là où il ne sait pas. Ce dernier détail est la bonne habitude : il dit ce qu'il n'a pas pu faire.

**Docling**, d'IBM, lit la plus large liste ici — formats Office, OpenDocument, PDF, EPUB, HTML, images et davantage — et écrit du Markdown parmi plusieurs sorties. C'est le plus lourd des outils locaux, et celui vers lequel se tourner quand l'entrée est un tas de formats mélangés plutôt qu'un format connu.

**CloudConvert** convertit une présentation en Markdown, ce que la plupart des outils d'ici ne savent pas faire, ainsi que `docx`, `odt`, `rtf`, `pdf` et une vingtaine d'autres. L'EPUB ne figure pas parmi les sources qu'il annonce pour la sortie Markdown. C'est un serveur : le document est donc téléversé, et c'est la première question, pas la dernière. [Savoir si un convertisseur en ligne est sûr](/blog/is-an-online-converter-safe) traite de la façon de le vérifier plutôt que de le supposer.

**Turndown** convertit du HTML en Markdown et n'accepte rien d'autre. Ce n'est pas une limite mais la conception, et c'est pourquoi presque tous les autres outils JavaScript du domaine finissent avec Turndown ou un cousin en dessous. [Les bibliothèques HTML vers Markdown](/blog/turndown-and-html-to-markdown-libraries) diffèrent surtout sur les cas pénibles.

**Mammoth** lit le `.docx` et produit du HTML, délibérément : il projette les styles de Word sur des éléments sémantiques et ignore le détail visuel. Il ne produit pas de Markdown, c'est donc une moitié de chaîne, et sa propre documentation est claire : l'écart entre la structure d'un `.docx` et celle du HTML fait que les documents compliqués ne se convertiront pas parfaitement. [En quoi mammoth et les analyseurs docx diffèrent](/blog/mammoth-js-and-docx-parsers) dit le reste.

**python-pptx** lit une présentation correctement — ordre des diapositives résolu par la liste d'identifiants, `Slide.notes_slide.notes_text_frame` pour les notes, `shape.image.blob` pour les images — et ne produit rien. C'est une bibliothèque pour bâtir son propre convertisseur, et s'il figure dans un comparatif de convertisseurs, c'est que pour un travail PowerPoint récurrent il est souvent la bonne réponse. [Convertir PowerPoint en Markdown](/blog/convert-powerpoint-to-markdown) contient un script qui tourne.

## Où se situe l'outil derrière ce site, y compris ce qu'il ne fait pas

TransformPipe convertit quinze choses depuis et vers Markdown dans le navigateur, ce qui répond aux questions un, trois et sept : le fichier n'est pas téléversé, les images sont intégrées en URI data pour que le résultat soit un fichier unique, et il n'y a rien à installer. Il lit les conteneurs plutôt que le texte — ordre des diapositives depuis `<p:sldIdLst>`, titres de chapitre depuis le document de navigation d'un EPUB, ressources Evernote appariées par MD5 — et il lit un dossier d'export comme un document unique avec une table des matières, ce qui répond à la question six.

L'autre moitié, honnêtement :

- **Pas de PDF en entrée.** Un PDF, ce sont des glyphes à des coordonnées, et en reconstruire la structure est une autre discipline. CloudConvert, Docling et MarkItDown lisent tous le PDF ; pas celui-ci.
- **Pas de LaTeX, pas de reStructuredText, pas de `.doc` ni de `.ppt` anciens.** Pandoc couvre les deux premiers, LibreOffice les deux seconds.
- **Un plafond de quatre mégaoctets** sur un document enregistré, qui découle d'une limite de plateforme et non d'un choix, dont deux mégaoctets pour les images.
- **Pas un outil de lot.** Convertir cinq cents fichiers appartient à un script contenant Pandoc ou Docling, pas à un onglet de navigateur.
- **Côté navigateur signifie que c'est votre machine qui travaille,** donc un très gros fichier est limité par la mémoire de l'onglet et non par la patience d'un serveur.

Un comparatif où l'outil vendu gagne toutes les lignes n'est pas un comparatif. Ces cinq lignes sont celles où l'outil de quelqu'un d'autre est la bonne réponse, et savoir sur quelle ligne vous êtes est tout l'exercice.

## Comment choisir en une passe

- **Le document est confidentiel.** Côté navigateur ou hors ligne. Cela élimine les services hébergés avant toute question de fonctionnalité, et ce n'est pas affaire de confiance en une politique — cela s'observe dans l'onglet réseau.
- **La conversion se répète.** Pandoc ou Docling dans un script. Une page web qu'une personne doit ouvrir n'est pas une chaîne de traitement.
- **L'entrée est un tas de formats mélangés, PDF compris.** Docling.
- **C'est une présentation et les notes comptent.** MarkItDown, python-pptx, ou un convertisseur qui ouvre les parties de notes.
- **C'est un livre.** Pandoc avec `--extract-media`, ou calibre avec les deux options `--keep`.
- **C'est un fichier, maintenant, et vous voulez voir le résultat.** Un convertisseur côté navigateur, car l'aller-retour téléversement, file d'attente et téléchargement dure plus longtemps que la conversion.
- **Vous intégrez cela dans un logiciel.** Une bibliothèque — Turndown, Mammoth, python-pptx — en acceptant que vous maintenez désormais un convertisseur.

## Le document de test à conserver

Quel que soit votre choix, la comparaison honnête prend dix minutes. Fabriquez un document contenant les six choses qui cassent : un titre venu de texte en gras plutôt que d'un style de titre, un tableau avec une cellule fusionnée, une image, une note de bas de page, une liste imbriquée, et un lien vers un autre fichier du même export. Passez-le dans deux ou trois candidats et lisez la sortie.

Chaque différence du tableau ci-dessus apparaîtra dans ce seul document, et elle apparaîtra pour vos documents plutôt que pour ceux d'un testeur. Le nombre de formats affiché en page d'accueil ne vous en aurait rien dit. Pour le champ plus large — services hébergés, suites bureautiques et Enregistrer sous du navigateur — [le panorama des convertisseurs de documents en ligne](/blog/best-online-document-converters) les classe plutôt par l'endroit où va le fichier.
