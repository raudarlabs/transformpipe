---
title: "Convertir PowerPoint en Markdown : diapositives, notes et ordre de lecture"
description: "Ce qui survit à la conversion d'un .pptx en Markdown, pourquoi Pandoc ne sait pas lire PowerPoint et où passent les notes du présentateur — six voies comparées"
date: 2026-09-21
tag: Conversion
keywords: powerpoint en markdown, convertir pptx en markdown, notes du présentateur powerpoint, convertisseur pptx markdown, diapositives en markdown, présentation en texte
---

Une présentation est la version la plus courte d'un raisonnement que quelqu'un a déjà tenu en entier. C'est précisément ce qui rend sa conversion intéressante : les diapositives portent la structure, les notes du présentateur portent les phrases que les diapositives ont comprimées. Les deux se trouvent dans le fichier `.pptx`, en XML lisible, et presque toutes les sorties de PowerPoint en abandonnent une — les notes, le plus souvent, parce qu'elles n'ont jamais été à l'écran.

### En bref

Un `.pptx` est une archive zip de parties XML : une partie par diapositive, une partie distincte par page de notes, et les images dans un dossier `ppt/media/`. La qualité d'une conversion tient presque entièrement à la liste des parties que l'outil prend la peine d'ouvrir. Pandoc n'aidera pas : il écrit le `pptx` et ne le lit pas, si bien que le conseil courant « prends Pandoc » échoue dès la première commande (vérifié sur pandoc.org, le 21 septembre 2026). L'export Plan/RTF intégré à PowerPoint récupère le texte des espaces réservés de titre et de corps et laisse tout le reste, notes comprises. Passer par un PDF transforme un document structuré en texte positionné et perd justement la structure qui rendait la présentation digne d'être conservée. `python-pptx` lit les diapositives et les notes et vous rend les morceaux — le Markdown, c'est vous qui l'écrivez. Un convertisseur qui ouvre directement les parties, comme [PowerPoint → Markdown chez TransformPipe](/powerpoint-to-markdown), donne en une passe un titre par diapositive, ses notes en dessous et ses images intégrées.

Ce qu'aucune voie ne récupère : les animations, les transitions, l'ordre d'apparition, le SmartArt en tant que schéma et les graphiques autrement que sous forme d'image. Rien de tout cela n'a jamais été du texte.

## Ce qu'un .pptx contient réellement

Renommez-en un en `.zip` et ouvrez-le. Les parties utiles :

| Partie | Contenu |
| --- | --- |
| `ppt/slides/slide1.xml` | Les formes d'une diapositive, dans l'ordre où PowerPoint les range |
| `ppt/slides/_rels/slide1.xml.rels` | Ses renvois : vers les images, les hyperliens et sa page de notes |
| `ppt/notesSlides/notesSlide1.xml` | Les notes d'une diapositive, dans un document à part |
| `ppt/media/image1.png` | Chaque image, en taille réelle, sous son propre nom |
| `ppt/presentation.xml` | `<p:sldIdLst>` — l'ordre des diapositives, qui n'est pas celui des noms de fichiers |

Deux de ces lignes sont l'endroit où la plupart des conversions déraillent.

La première est l'ordre. `slide1.xml` n'est pas forcément la première diapositive. Les numéros sont des identifiants attribués à la création, et déplacer des diapositives dans l'éditeur ne les renumérote pas. L'ordre réel se trouve dans `<p:sldIdLst>`, dans `presentation.xml`, sous forme d'une liste d'identifiants de relation qu'il faut résoudre via `ppt/_rels/presentation.xml.rels` pour obtenir des noms de fichiers. Un convertisseur qui trie par nom de fichier rend une présentation réordonnée, et c'est pire que pas de conversion du tout, parce que le résultat a l'air correct.

La seconde, ce sont les notes. Elles ne sont pas dans la partie de la diapositive. Chaque page de notes est un document XML à part, rattaché à sa diapositive uniquement par le fichier de relations. Un outil qui lit `ppt/slides/*.xml` et rien d'autre ne perd pas les notes à cause d'un défaut — il n'a jamais regardé.

## Les six voies, comparées

| Voie | Diapositives | Notes | Images | Ordre de lecture | Effort |
| --- | --- | --- | --- | --- | --- |
| Copier-coller depuis l'éditeur | Texte seul | Non — pas à l'écran | Non | Celui de vos clics | Élevé, par diapositive |
| PowerPoint → Plan/RTF | Espaces réservés | Non | Non | Ordre des espaces réservés | Faible |
| PowerPoint → PDF → Markdown | En texte positionné | Seulement en imprimant les pages de notes | Parfois | Deviné d'après la géométrie | Moyen |
| Script `python-pptx` | Oui | Oui | Avec du travail | À votre main | Élevé, une fois |
| Pandoc | Ne lit pas le `.pptx` | — | — | — | — |
| Un convertisseur qui lit les parties | Oui | Oui | Intégrées | Ordre du document | Faible |

## Pandoc lit docx et epub, et ne lit pas pptx

Autant le dire nettement, tant le conseil circule. La liste des formats de Pandoc est asymétrique : `docx` figure en entrée et en sortie, `epub` aussi, `pptx` uniquement en sortie (vérifié sur pandoc.org, le 21 septembre 2026). `pandoc -f pptx deck.pptx -t markdown` ne produit donc pas une conversion médiocre, mais une erreur, faute de lecteur pptx à sélectionner.

Cette asymétrie tient moins de l'oubli que du constat sur le format. Un document Word est un flux de paragraphes portant des styles, qui se projette presque directement sur le modèle interne de Pandoc. Une diapositive est une surface de formes positionnées sans ordre de lecture intrinsèque, et la linéariser demande des suppositions que Pandoc a choisi de ne pas faire. Tout ce qui convertit une présentation fait ces suppositions ; la seule question est de savoir si l'outil le dit.

Si vous avez une présentation et une chaîne de traitement bâtie autour de Pandoc, la voie honnête tient en deux étapes : obtenir du Markdown depuis le `.pptx` par un autre moyen, puis confier ce Markdown à Pandoc pour la suite. La seconde moitié est traitée dans [les alternatives à Pandoc](/blog/pandoc-alternatives-for-markdown-to-html).

## L'export Plan intégré

PowerPoint sait enregistrer un plan : Fichier, Enregistrer sous, puis Plan/RTF dans la liste des formats. Sous Windows c'est une option d'enregistrement ordinaire ; sur Mac l'import fonctionne avec le RTF, mais les options d'export varient selon la version — fiez-vous à la liste que vous avez sous les yeux (vérifié sur support.microsoft.com, le 21 septembre 2026).

Ce qui en sort, c'est le texte des espaces réservés de titre et de corps, indenté selon le niveau de plan. Ce qui n'en sort pas, c'est tout le reste : le texte saisi dans une forme ou une zone de texte libre plutôt que dans un espace réservé, les tableaux, les images et les notes du présentateur.

| Avantages | Inconvénients |
| --- | --- |
| Intégré : aucun outil, aucun envoi, aucun script | Espaces réservés seulement — une présentation faite de zones de texte ressort presque vide |
| Conserve les niveaux de titre sous forme d'indentation | Ni notes, ni tableaux, ni images, ni liens |
| Le RTF se convertit ensuite proprement | Muet sur ce qu'il a laissé de côté |

**Pour qui ?** Une présentation très textuelle, bâtie strictement sur les dispositions standard, dont seule la structure à puces vous intéresse. Si vous prenez cette voie, le RTF obtenu demande une seconde conversion — [RTF → Markdown](/rtf-to-markdown) s'en charge.

## Passer par un PDF

Tentant, puisque toute présentation s'exporte en PDF et que les convertisseurs de PDF ne manquent pas. Le problème est dans ce que fait l'export : le PDF ne connaît ni titres, ni listes, ni tableaux, seulement des glyphes à des coordonnées. Un titre est un titre parce qu'il est grand et placé en haut. Une liste à puces en est une parce que plusieurs lignes commencent par le même caractère au même retrait. Chaque convertisseur qui lit ce PDF reconstruit une structure que le `.pptx` énonçait et que le PDF a jetée.

Cette voie sait pourtant faire une chose que les autres ne font pas sans script : dans Imprimer, choisissez la disposition Pages de notes, et vous obtenez les notes sous une image de chaque diapositive. C'est un PDF des notes, pas les notes en tant que texte, mais c'est la seule sortie sans programmation qui les emporte.

| Avantages | Inconvénients |
| --- | --- |
| Fonctionne depuis n'importe quelle version, sur n'importe quelle plateforme | La structure est déduite de la géométrie, pas lue |
| Les pages de notes sont la seule voie intégrée qui inclut les notes | Les notes arrivent sous une image tramée de la diapositive |
| La fidélité visuelle est exacte | Les tableaux ressortent en texte épars ; les diapositives à deux colonnes s'entrelacent |

**Pour qui ?** Une présentation que plus rien n'ouvre à part le lecteur qui a produit le PDF. Sinon, c'est transformer volontairement un fichier structuré en fichier qui ne l'est plus, ce qui fait un premier geste étrange.

## Un script, avec python-pptx

Si les présentations sont les vôtres et qu'il y en aura d'autres, lire le fichier directement est la voie rentable. `python-pptx` ouvre tout `.pptx` depuis PowerPoint 2007, et les notes y sont accessibles : `Slide.has_notes_slide` et `Slide.notes_slide.notes_text_frame` font partie de l'interface documentée (vérifié sur python-pptx.readthedocs.io, le 21 septembre 2026).

```python
from pptx import Presentation

deck = Presentation('deck.pptx')
out = []

for number, slide in enumerate(deck.slides, start=1):
    title = slide.shapes.title
    out.append(f'## {title.text}' if title and title.text else f'## Slide {number}')

    for shape in slide.shapes:
        if shape == slide.shapes.title or not shape.has_text_frame:
            continue
        for paragraph in shape.text_frame.paragraphs:
            text = ''.join(run.text for run in paragraph.runs).strip()
            if text:
                out.append(('  ' * paragraph.level) + f'- {text}')

    if slide.has_notes_slide:
        notes = slide.notes_slide.notes_text_frame.text.strip()
        if notes:
            out.append('> **Notes**')
            out.extend(f'> {line}' for line in notes.splitlines())

    out.append('')

print('\n'.join(out))
```

Regardez sur quoi porte la boucle : `deck.slides`, que python-pptx résout via la liste d'identifiants de diapositives. L'ordre est donc celui de la présentation et non celui des noms de fichiers — la seule partie difficile est faite pour vous.

Ce que ce script ne fait pas encore, c'est la longue traîne : les images (repérer `shape.shape_type` valant `PICTURE`, récupérer `shape.image.blob`, l'écrire quelque part, émettre un lien), les tableaux (`shape.has_table`, puis lignes et cellules vers un tableau Markdown), les formes groupées (un groupe est une forme contenant des formes, la boucle doit donc être récursive) et les hyperliens (`run.hyperlink.address`, un objet distinct du texte du run). Chacun fait vingt lignes. Ensemble, ils expliquent pourquoi il s'agit d'un projet et non d'un extrait.

| Avantages | Inconvénients |
| --- | --- |
| Lit la structure réelle, notes comprises | Vous écrivez et maintenez un convertisseur |
| Reproductible sur un dossier entier | Groupes, tableaux, images et liens : une passe chacun |
| Rien ne quitte la machine | Dépendance à Python partout où il tourne |

**Pour qui ?** Quelqu'un avec une chaîne récurrente et une forme de sortie précise en tête — des présentations de version versées dans un dépôt, des points hebdomadaires versés dans un wiki.

## L'ordre de lecture, ce dont personne ne parle

Les formes d'une diapositive sont rangées dans l'ordre de l'arbre des formes, c'est-à-dire à peu près l'ordre où elles ont été ajoutées et exactement l'ordre où elles se superposent. Ce n'est pas l'ordre dans lequel on lit. Une diapositive avec un titre, deux colonnes et une légende en dessous a un ordre de lecture visuel parfaitement clair et, éventuellement, un arbre des formes qui donne légende, colonne de droite, titre, colonne de gauche — parce qu'elle s'est construite ainsi en trois révisions.

Chaque convertisseur choisit une stratégie, et elles diffèrent :

- **Ordre du document** — émettre les formes telles que le fichier les liste. Prévisible, parfois faux, jamais surprenant d'une manière invisible.
- **Ordre géométrique** — trier par haut, puis par gauche. Juste plus souvent, et désastreux sur une diapositive dont la colonne latérale pleine hauteur commence au-dessus de la colonne principale.
- **Espaces réservés d'abord** — titre, puis corps, puis le reste. Bon sur les dispositions standard, faible sur les diapositives dessinées.

Il n'y a pas de bonne réponse, seulement une réponse annoncée. Quand une présentation convertie se lit bizarrement, c'est presque toujours la cause, et le remède est dans la présentation : remettre les formes en ordre de lecture depuis le volet Sélection de PowerPoint, puis reconvertir.

## Images, tableaux et tout ce qui n'est pas du texte

**Les images** sont le gain facile, et celui que la plupart des convertisseurs sautent. Elles sont déjà extraites : elles sont dans `ppt/media/`, en PNG et JPEG ordinaires, à pleine résolution. Une conversion qui émet `![](image3.png)` et vous laisse chercher image3 a fait la moitié du travail ; une qui intègre les octets vous rend un fichier unique, déplaçable. [Les images et les liens qui survivent](/blog/images-and-links-that-still-work) passe en revue les compromis.

**Les tableaux** passent si l'outil lit `<a:tbl>`, le même modèle de tableau que Word. Le piège tient aux cellules fusionnées : un tableau de diapositive à en-tête fusionné n'a pas d'équivalent Markdown, et chaque outil tranche autrement — répéter la valeur, vider les cellules de continuation, ou supprimer la ligne. [Les tableaux qui survivent à une conversion](/blog/markdown-tables-that-survive-conversion) dit quoi vérifier.

**Les graphiques** sont un tableau de données plus un rendu, rangés dans une partie distincte avec un classeur intégré. Le rendu est une image ; les nombres derrière sont de vraies données. La plupart des convertisseurs prennent l'image. Si ce sont les nombres qui vous intéressent, ils sont dans `ppt/embeddings/` sous forme d'un petit `.xlsx`, et une conversion [Excel → Markdown](/excel-to-markdown) les lira.

**Le SmartArt** est un dessin engendré à partir d'un petit modèle de données XML. Le texte qu'il contient est récupérable ; le schéma ne l'est pas, sauf vers un format qui est lui-même un format de schéma.

**Animations, transitions et ordre d'apparition** portent un vrai sens dans certaines présentations : tout l'intérêt d'une diapositive peut tenir à ce que trois éléments apparaissent l'un après l'autre. Rien de cela n'a de forme en Markdown. Si cela compte, cela a sa place dans les notes avant la conversion, pas après.

## Une courte liste avant de convertir

1. **Ouvrez le volet Sélection** et vérifiez l'ordre des formes sur chaque diapositive à disposition non standard. Cela coûte une minute et règle la plainte de loin la plus fréquente sur le résultat.
2. **Décidez si les notes sont l'essentiel.** Si oui, écartez tout de suite l'export Plan et le copier-coller : ni l'un ni l'autre ne les atteint.
3. **Cherchez le texte dans les images.** Une diapositive dont le contenu est une capture d'écran de tableau devient une image de tableau. Rien en aval ne saura la lire.
4. **Regardez à quoi servent les graphiques.** Si c'est l'allure de la courbe, prenez l'image. Si ce sont les nombres, allez chercher le classeur intégré.
5. **Convertissez d'abord une diapositive** et lisez-la. L'ordre de lecture et le traitement des notes se voient tous deux sur les deux premières, et les deux se découvrent à bon compte.

## Où cela vous mène

Pour une présentation unique dont vous voulez le texte une fois, l'export Plan prend trente secondes et suffit — à condition qu'elle ait été bâtie sur des espaces réservés et que les notes soient sans importance. Partout où les notes comptent, et c'est le cas de la plupart des présentations qui méritent une conversion, le choix se joue entre écrire un script `python-pptx` et utiliser quelque chose qui lit déjà les parties. [La conversion PowerPoint → Markdown proposée ici](/powerpoint-to-markdown) résout l'ordre des diapositives via `<p:sldIdLst>`, place les notes de chaque diapositive en citation juste en dessous et intègre les images, de sorte que le résultat tient en un fichier — dans le navigateur, la présentation n'est donc envoyée nulle part. Pour le format voisin, [convertir un .docx](/blog/convert-docx-to-markdown) bute sur d'autres problèmes, la plupart liés aux styles plutôt qu'à l'ordre.
