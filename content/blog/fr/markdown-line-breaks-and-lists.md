---
title: "Sauts de ligne et listes Markdown : 14 symptômes, 14 règles"
description: "Un saut devenu espace, une liste devenue bloc de code, des numéros qui se renumérotent : le symptôme, la règle qui le produit, et ce qu’il faut écrire à la place."
updated: 2026-09-09
date: 2026-07-11
tag: Syntaxe
keywords: saut de ligne markdown, retour à la ligne markdown, deux espaces markdown, liste imbriquée markdown, liste numérotée markdown, case à cocher markdown, liste de tâches markdown, échapper un caractère markdown, indentation liste markdown, liste compacte ou aérée, saut de ligne dur commonmark, balise br markdown, saut de ligne souple markdown, antislash fin de ligne markdown, ma liste markdown ne s’imbrique pas, option breaks markdown, numérotation liste markdown
---

Markdown est assez réduit pour que la plupart des gens l’apprennent par imitation et ne lisent jamais les règles. Cela fonctionne jusqu’au jour où une ligne refuse de se couper, où une liste arrive comme un seul long paragraphe, ou où un astérisque que vous vouliez littéral avale la moitié d’une phrase. Rien de tout cela n’est un bogue. Chaque cas est une règle qui fait exactement ce qu’elle annonce, à un endroit où le fichier source ne donne aucun indice visuel que quelque chose se produit.

### En bref

Un simple retour à la ligne est un espace, pas un saut de ligne : CommonMark l’appelle un saut de ligne souple et laisse les moteurs de rendu libres de l’imprimer comme un blanc, ce qu’un fichier `.md` fait presque partout. Pour couper une ligne à l’intérieur d’un paragraphe, terminez-la par **deux espaces** ou un **antislash** ; pour en commencer une nouvelle, laissez une **ligne vide**. Une liste imbriquée s’indente de la largeur du marqueur du parent plus les espaces qui le suivent — **deux sous `- `, trois sous `1. `** — et une seule ligne vide n’importe où dans une liste rend tous les éléments aérés et enveloppe leur texte dans un `<p>`. Tout le reste de cette page n’est jamais que l’une de ces deux règles appliquée là où vous ne regardiez pas.

Les règles sont écrites noir sur blanc. CommonMark est la spécification qui les fixe, et la version 0.31.2 est l’actuelle (vérifié sur spec.commonmark.org, le 9 septembre 2026). Chaque cas ci-dessous est une règle numérotée de cette spécification, et non une bizarrerie propre à tel ou tel outil. Ce qu’une spécification ne peut pas résoudre, c’est qu’aucune de ces règles ne laisse de trace dans la source. Une espace en fin de ligne ne ressemble à rien. Deux espaces d’indentation ressemblent à trois. Une ligne vide au milieu d’une liste ressemble à du rangement.

Sauts de ligne et listes tiennent dans un même article parce qu’ils partagent une arithmétique. Qu’une ligne se coupe ou non dépend de ce qui se trouve à sa fin ; qu’un élément imbriqué s’imbrique ou non dépend de la distance entre le début de sa ligne et la colonne de contenu de son parent. Les deux se comptent en caractères invisibles, et les deux échouent en silence — aucune erreur, aucun avertissement, seulement une sortie qui n’est pas celle voulue, généralement remarquée par quelqu’un d’autre.

## L’antisèche : le symptôme, et la règle qui le produit

| Symptôme | La règle en cause | Que faut-il écrire à la place |
| --- | --- | --- |
| Deux lignes n’en ont fait qu’une | Un simple retour à la ligne est un saut souple, imprimé comme une espace | Deux espaces en fin de ligne, un antislash, ou une ligne vide |
| Ça coupe dans un encadré de commentaire mais pas dans un fichier | Certains moteurs transforment chaque retour à la ligne en `<br>` ; un fichier `.md` non | Écrivez le saut explicitement et il survit aux deux |
| Le premier élément de liste a fini dans le paragraphe au-dessus | Une liste numérotée ne peut interrompre un paragraphe que si elle commence à `1` | Laissez une ligne vide au-dessus de la liste |
| Toute la liste est ressortie en chasse fixe | Quatre espaces au premier niveau, c’est un bloc de code indenté | Commencez la liste à moins de trois espaces de la marge |
| L’élément imbriqué est devenu un élément frère | L’indentation du contenu, c’est la largeur du marqueur plus les espaces qui suivent | Deux espaces sous `- `, trois sous `1. ` |
| L’élément imbriqué est devenu un bloc de code | Le contenu se trouve à quatre colonnes ou plus au-delà de la colonne de contenu du parent | Comptez depuis la colonne de contenu, pas depuis la marge |
| La liste a gagné un espacement vertical que personne n’a demandé | Une ligne vide n’importe où à l’intérieur rend toute la liste aérée | Retirez-la, ou acceptez un `<p>` dans chaque élément |
| Les numéros se sont renumérotés eux-mêmes | Seul le premier marqueur est lu ; le reste est compté par le navigateur | Écrivez `1.` pour chaque élément, délibérément |
| Une liste est devenue silencieusement deux listes | Changer le caractère de puce ou le délimiteur démarre une nouvelle liste | Un seul caractère de puce et un seul délimiteur par fichier |
| Une année en début de ligne est devenue l’élément un | `1986. ` est un marqueur de liste numérotée valide | `1986\. ` |
| Les astérisques ont disparu et les mots sont passés en italique | `*` ouvre l’emphase n’importe où, y compris à l’intérieur d’un mot | `\*star\*`, ou une plage de code |
| La case à cocher s’est affichée comme `[ ]` | Les listes de tâches sont une extension GFM, pas du CommonMark | Un convertisseur qui parle GFM |
| Un antislash s’est imprimé en fin de ligne | Aucune des deux syntaxes de saut ne fonctionne en fin de bloc | Placez le saut entre deux lignes, jamais après la dernière |
| Le second paragraphe de l’élément est tombé hors de la liste | Une ligne de continuation doit atteindre la colonne de contenu de l’élément | Indentez-la là où commence le texte de l’élément lui-même |
| La sous-liste sous l’élément dix a perdu son indentation | `10. ` est une colonne plus large que `9. ` | Recomptez le marqueur à dix, ou indentez tout de quatre |
| Le marqueur de l’élément imbriqué s’est imprimé comme un tiret en plein milieu de phrase | Du texte surindenté sans ligne vide au-dessus est une continuation de paragraphe | Indentez jusqu’à la colonne de contenu, pas au-delà |

Chaque ligne est une règle tirée de la spécification CommonMark et non l’opinion d’un outil, et le reste de
cette page consiste à dérouler l’arithmétique de ces règles.

## Trois façons de terminer une ligne

Commençons par le paragraphe, car toute question de saut de ligne est une question de paragraphe déguisée. Un paragraphe est une suite de lignes consécutives non vides. Il se termine à une ligne vide, et nulle part ailleurs. Les fins de ligne à l’intérieur ne sont pas du contenu : CommonMark appelle une fin de ligne à l’intérieur d’un paragraphe un saut de ligne souple, et dit qu’un moteur de rendu peut la présenter de diverses façons. Le comportement dominant, celui qu’un fichier `.md` adopte à peu près partout où il est rendu, est une simple espace.

Ainsi ceci :

```markdown
Roses are red
Violets are blue
```

forme un seul paragraphe, deux lignes de source et une seule ligne de sortie. Le retour à la ligne survit dans le HTML sous forme de blanc, et le navigateur le réduit comme il réduit toute suite de blancs. Rien n’est perdu et rien n’est cassé. Le fichier n’est simplement pas d’accord avec vous sur l’endroit où une ligne se termine.

Deux détails de cette définition compteront plus loin. Chaque ligne d’un paragraphe peut commencer avec jusqu’à trois
espaces d’indentation sans que rien ne change, ce qui explique pourquoi une ligne légèrement indentée rejoint quand
même le paragraphe au-dessus plutôt que de devenir autre chose. Et les blancs situés de part et d’autre d’une fin de
ligne interne sont éliminés : la spécification précise que les espaces en fin d’une ligne et en début de la suivante
sont retirés (vérifié sur spec.commonmark.org, le 9 septembre 2026). Aligner la seconde ligne d’un paragraphe ne fait
rien à la sortie, et le désaligner non plus.

Trois choses changent cela, et une quatrième contourne la question.

| Ce que vous écrivez | Ce que fait l’analyseur | Ce que vous obtenez |
| :--- | :--- | :--- |
| Une ligne vide | Termine le paragraphe | Un nouveau paragraphe, `<p>` |
| Deux espaces ou plus en fin de ligne | Un saut de ligne dur | `<br>` à l’intérieur du même paragraphe |
| Un antislash en fin de ligne | Un saut de ligne dur | `<br>` à l’intérieur du même paragraphe |
| Un `<br>` littéral | Du HTML brut, transmis ou échappé | `<br>`, si le convertisseur autorise le HTML brut |

### Deux espaces en fin de ligne, le saut que personne ne voit

La règle des deux espaces est le saut dur d’origine, et le plus fragile. Les blancs de fin de ligne sont invisibles, beaucoup d’éditeurs les suppriment à l’enregistrement, les linters les signalent, et un relecteur lisant un diff ne peut pas voir ce qui a changé.

Deux détails que la spécification ajoute et que la plupart des guides passent sous silence. La règle est deux espaces *ou davantage*, une ligne finissant par cinq espaces se coupe donc exactement comme une ligne finissant par deux — ce qui explique en partie pourquoi personne ne peut le voir à l’œil, et pourquoi « ajouter encore une espace » n’est jamais la solution. Et aucune des deux formes n’agit en fin de bloc : un saut dur exige une ligne après lui à l’intérieur du même paragraphe, si bien que des espaces de fin sur la dernière ligne d’un paragraphe ne sont que des espaces de fin.

Un troisième détail règle un débat que les gens ont avec leurs propres fichiers. Un saut dur ne peut pas se produire à
l’intérieur d’une plage de code ni d’une balise HTML. Enveloppez deux lignes entre accents graves, avec deux espaces
de fin sur la première, et le moteur de rendu renvoie un seul élément `<code>` portant ces espaces comme contenu et le
retour à la ligne comme blanc — aucun saut nulle part. Si ce que vous voulez couper se trouve dans une plage de code,
la syntaxe qu’il vous faut est un bloc délimité, pas un saut de ligne.

### L’antislash, et le seul endroit où il s’imprime lui-même

La forme à l’antislash fait le même travail, mais au grand jour. La spécification l’introduit comme l’alternative
plus visible à deux espaces ou davantage. C’est un ajout de CommonMark : le document original décrivant la syntaxe
Markdown ne mentionne que la forme à deux espaces et traite l’antislash uniquement comme un moyen d’imprimer un
caractère littéral (vérifié sur daringfireball.net, le 9 septembre 2026), un analyseur écrit avant CommonMark
imprime donc l’antislash au lieu de couper la ligne.

Son mode d’échec est l’inverse de celui des deux espaces, et la différence mérite d’être choisie délibérément. Les
deux sont inertes en fin de bloc, mais seul l’antislash le signale. Un paragraphe dont la dernière ligne est `foo\`
se rend en `<p>foo\</p>`, antislash compris ; un titre écrit `### foo\` se rend en `<h3>foo\</h3>`. Les mêmes
positions écrites avec deux espaces de fin rendent `<p>foo</p>` et `<h3>foo</h3>` — rien n’a cassé, et rien ne l’a
dit. L’une des deux syntaxes échoue bruyamment sur la page ; l’autre échoue en silence et attend qu’un lecteur
remarque une ligne trop longue.

### `<br>`, et l’avis du convertisseur à son sujet

La quatrième option consiste à cesser d’utiliser Markdown pour cette ligne-là et à écrire `<br>` vous-même. Markdown autorise le HTML brut par conception, un `<br>` littéral dans la source arrive donc dans la sortie sous forme de `<br>`. C’est la seule des quatre options visible dans un diff, qui survit à un formateur, et qu’aucun réglage d’éditeur ne peut supprimer. Elle dépend cependant du fait que le convertisseur laisse passer le HTML brut, ce qui n’est pas automatique : markdown-it livre `html: false` dans son préréglage par défaut, avec le commentaire « Enable HTML tags in source » (vérifié sur cdn.jsdelivr.net, le 9 septembre 2026), les balises brutes sont donc échappées et votre `<br>` arrive sur la page comme du texte visible, à moins que quelqu’un n’ait activé cette option. Un convertisseur qui assainit un fichier qu’il n’a pas écrit peut aussi retirer des balises qu’il ne reconnaît pas. `<br>` figure sur à peu près toutes les listes blanches raisonnables, il arrive donc en pratique — mais c’est la décision du convertisseur, pas la vôtre.

### Ce que fait un simple retour à la ligne, moteur par moteur

Avant de choisir entre les quatre, il vaut la peine de voir ce que font réellement les moteurs de rendu, car la raison pour laquelle la question ne se règle jamais est que les deux mêmes lignes de Markdown produisent des documents différents selon l’endroit où elles sont rendues, et que chacun de ces moteurs se comporte correctement. La latitude que donne la spécification est explicite — un saut de ligne souple peut être présenté de diverses façons, et le transformer en `<br>` en est une. Voici la même entrée face aux moteurs que les gens rencontrent réellement, chaque ligne vérifiée contre la documentation propre à ce projet.

| Où le texte est rendu | Un simple retour à la ligne devient | Comment c’est documenté |
| --- | --- | --- |
| Un fichier `.md`, tout moteur CommonMark ou GFM | Une espace | Le traitement par défaut d’un saut de ligne souple, selon la spécification |
| Un fichier `.md` sur GitHub | Une espace | Le guide de rédaction de GitHub dit qu’un saut dans un fichier `.md` exige deux espaces de fin, un antislash ou un `<br/>` (vérifié sur docs.github.com, le 9 septembre 2026) |
| Un commentaire, un ticket, une pull request ou une revue GitHub | `<br>` | Le même guide dit que les champs de commentaire rendent le saut de ligne pour vous (vérifié sur docs.github.com, le 9 septembre 2026) |
| marked, tel quel | Une espace | Son option `breaks` vaut `false` par défaut (vérifié sur marked.js.org, le 9 septembre 2026) |
| marked avec `gfm: true` et `breaks: true` | `<br>` | Documenté comme reproduisant le comportement de GitHub sur les commentaires, explicitement pas son comportement sur les fichiers Markdown rendus ; `breaks` exige `gfm` (vérifié sur marked.js.org, le 9 septembre 2026) |
| markdown-it, tel quel | Une espace | Son préréglage par défaut fixe `breaks: false`, avec le commentaire « Convert ’\n’ in paragraphs into `<br>` » (vérifié sur cdn.jsdelivr.net, le 9 septembre 2026) |
| markdown-it avec `breaks: true` | `<br>` | La même option, faisant le même travail |
| Python-Markdown, tel quel | Une espace | Les retours à la ligne à l’intérieur d’un paragraphe sont des blancs, sauf si une extension dit le contraire |
| Python-Markdown avec l’extension `nl2br` | `<br />` | L’extension traite chaque retour à la ligne comme un saut dur ; activée avec `extensions=['nl2br']` (vérifié sur python-markdown.github.io, le 9 septembre 2026) |
| Pandoc lisant `markdown`, `gfm` ou `commonmark` | Une espace | Son extension `hard_line_breaks` est désactivée par défaut pour les trois (vérifié sur pandoc.org, le 9 septembre 2026) |
| Pandoc avec `+hard_line_breaks` | `<br />` | L’extension lit chaque retour à la ligne dans un paragraphe comme un saut dur plutôt que comme une espace (vérifié sur pandoc.org, le 9 septembre 2026) |

Deux conséquences en découlent, et toutes deux concernent le passage d’un contexte à l’autre. Un texte rédigé dans un encadré de commentaire puis collé dans un fichier s’écrase ; un texte rédigé dans un fichier puis collé dans un encadré de commentaire gagne des sauts qu’il n’a jamais eus. Aucun des deux moteurs n’a tort, parce que le document n’a jamais porté l’information dans un sens ni dans l’autre.

La seconde conséquence est plus tranchante. `breaks: true` est un réglage du moteur de rendu, pas une propriété du document, un fichier qui en dépend ne se rend donc correctement qu’à un seul endroit — le vôtre. Envoyez-le à un dépôt, un client de messagerie, une génération de site statique ou n’importe quel autre convertisseur, et les sauts disparaissent. Si le saut compte, mettez-le dans le document : deux espaces, un antislash ou un `<br>` survivent à chaque ligne de ce tableau. [Les options qui changent le comportement d’un moteur JavaScript](/blog/markdown-to-html-in-javascript) vont bien au-delà de celle-ci, et `breaks` est celle que les gens basculent sans réfléchir à qui lira la sortie.

Il existe un usage honorable de cette option, et il mérite d’être nommé car c’est le cas où les gens se trouvent
souvent en la découvrant. Si votre application possède les deux bouts — la zone dans laquelle quelqu’un tape et la
page où son texte apparaît — et que le texte ne sort jamais sous forme de fichier `.md`, alors `breaks: true`
correspond à ce qu’attend une personne qui tape dans un champ, et rien en aval n’en souffre. Un champ de commentaire,
un message de discussion, un panneau de notes. À l’instant où ce texte peut être exporté, versionné ou copié dans un
dépôt, l’option cesse d’être une commodité et devient un document qui ne se rend correctement que chez lui.

### Laquelle des quatre utiliser, et où

Pour de la prose courante, la ligne vide est presque toujours ce que vous vouliez. Réservez le saut dur au cas où le retour à la ligne fait partie du contenu : une adresse, un vers, une signature sur deux lignes.

| Le document part vers | Utilisez | Parce que |
| :--- | :--- | :--- |
| Un dépôt, lu sur GitHub et dans un éditeur | Un antislash | Visible dans un diff, survit à une purge des blancs, et s’imprime lui-même si vous le placez quelque part d’inutile |
| Un convertisseur que vous ne contrôlez pas | `<br>` | Du HTML brut, soumis seulement à un assainissement, pas à des options de saut de ligne |
| Un fichier qu’un linter ou un formateur touche à l’enregistrement | Un antislash ou `<br>` | Les deux espaces sont la seule forme qu’une chaîne d’outils supprime sans le dire |
| Un champ de commentaire, un ticket, un message de discussion | Rien du tout | Ces moteurs coupent déjà à chaque retour à la ligne |
| De la prose où le saut n’est que visuel | Une ligne vide | C’est un nouveau paragraphe, et les paragraphes sont ce pour quoi les feuilles de style sont écrites |

Aucune des cinq réponses n’est un réglage de moteur de rendu, et c’est bien là le fond de l’affaire : un document qui porte lui-même ses sauts se rend de la même façon partout où il est ouvert. Les listes présentent le même genre de problème, mesuré dans une autre unité — ce que fait une ligne y dépend de sa distance à la marge.

## Pourquoi la liste n’est pas une liste

Une liste a besoin d’une ligne vide au-dessus d’elle. Écrite directement sous une ligne de prose, le premier élément peut être absorbé par ce paragraphe et ressortir comme un tiret égaré en plein milieu de phrase.

Les règles diffèrent d’un analyseur à l’autre ici. CommonMark laisse une liste à puces interrompre un paragraphe, et une liste numérotée seulement quand elle commence à `1`. Les analyseurs plus anciens n’autorisent ni l’une ni l’autre. Laissez la ligne vide et il cesse d’importer lequel des deux votre convertisseur utilise — la même protection qui garde un [tableau intact](/blog/markdown-tables-that-survive-conversion), et une différence que [l’article sur les dialectes](/blog/commonmark-gfm-and-the-flavours) couvre en entier.

### Interrompre un paragraphe, et la phrase qui a fait naître la règle

La position de CommonMark est qu’une liste peut interrompre un paragraphe, avec deux exceptions attachées au
premier élément : quand il commence sur une ligne qui serait sinon du texte de continuation du paragraphe, l’élément
ne doit pas commencer par une ligne vide, et s’il est numéroté, son numéro de départ doit être `1` (vérifié sur
spec.commonmark.org, le 9 septembre 2026). La spécification explique pourquoi de la façon la plus limpide possible —
en imprimant la phrase qui, sinon, se briserait :

```markdown
The number of windows in my house is
14.  The number of doors is 6.
```

Cela reste un seul paragraphe. Sous une règle qui autoriserait n’importe quel nombre à interrompre, `14.` ouvrirait
une liste numérotée démarrant à quatorze, et une phrase repliée automatiquement se disloquerait selon l’endroit où
la ligne a fini par se couper. Restreindre l’interruption à `1` rachète presque tous les nombres repliés
automatiquement dans de la prose ordinaire, et c’est la raison pour laquelle la règle est asymétrique plutôt
qu’élégante.

La lecture pratique est courte. Une liste à puces peut suivre un paragraphe sans ligne vide, et cela fonctionne.
Une liste numérotée aussi, mais seulement en démarrant à `1`, et seulement sous CommonMark. Tout ce qui est plus
ancien réclame la ligne vide. Écrivez la ligne vide et rien de tout cela n’est plus votre problème.

### Quatre espaces depuis la marge, ce n’est plus une liste

L’échec inverse consiste à indenter la liste. Jusqu’à trois espaces d’indentation avant le marqueur ne changent rien du tout — la liste se rend comme si les espaces n’étaient pas là. La quatrième espace est celle qui change le bloc : une puce à quatre espaces de la marge gauche n’est plus une liste, parce qu’au premier niveau quatre espaces signifient encore un bloc de code indenté, la liste ressort donc en texte à chasse fixe, tirets intacts.

C’est un échec facile à diagnostiquer et facile à provoquer. Coller une liste sortie d’un contexte imbriqué, un
éditeur qui indente à la touche Entrée, ou une copie depuis un encadré de commentaire déjà indenté, tout cela le
produit. Le signe distinctif, c’est que rien dans la source ne semble faux ; la sortie est un encadré gris.

### Les numéros que vous écrivez sont pour la plupart ignorés

Dans une liste numérotée, seul le premier numéro est lu. Le numéro de départ de la liste vient de son premier élément, et les numéros des éléments suivants sont ignorés — le moteur de rendu émet `<ol>`, ou `<ol start="5">`, et le navigateur compte à partir de là. Les marqueurs doivent faire neuf chiffres ou moins : `123456789.` ouvre une liste, `1234567890.` est un paragraphe commençant par un très grand nombre (vérifié sur spec.commonmark.org, le 9 septembre 2026). `1)` fonctionne aussi bien que `1.` en CommonMark.

| Ce que vous écrivez | Ce qui se rend | La règle |
| :--- | :--- | :--- |
| `1.` `2.` `3.` | 1, 2, 3 | Le premier marqueur fixe le départ ; le reste est ignoré |
| `1.` `1.` `1.` | 1, 2, 3 | La même règle, avec un fichier qui cesse de se contredire |
| `1.` `7.` `3.` | 1, 2, 3 | La même règle encore — les mauvais numéros ne coûtent rien |
| `5.` `6.` `7.` | 5, 6, 7 | `<ol start="5">`, et le navigateur poursuit le compte depuis cinq |
| `5.` `1.` `1.` | 5, 6, 7 | Seul le `5` a été lu |
| `0.` `0.` `0.` | 0, 1, 2 | Zéro est un numéro de départ légal |
| `1234567890.` | Un paragraphe | Dix chiffres, c’est un de trop pour être un marqueur |

Écrire chaque élément comme `1.` garde les diffs petits : la renumérotation se fait au moment du rendu plutôt que sur vingt lignes du fichier, insérer un élément au milieu ne touche donc qu’une ligne au lieu de toutes. L’argument inverse est que la source ne se lit plus dans l’ordre, ce qui compte si des gens lisent le fichier `.md` directement. Les deux se défendent ; ce qui ne se défend pas, c’est un fichier où certaines listes font l’un et d’autres l’autre, car alors un `7.` égaré ressemble à une erreur que quelqu’un devrait corriger.

### Changez le marqueur et vous obtenez deux listes

Changer le caractère de puce ou le délimiteur numéroté démarre une nouvelle liste. C’est une règle, pas une
tolérance, et elle est invisible sur la page rendue :

```markdown
- foo
- bar
+ baz
```

est un `<ul>` de deux éléments suivi d’un `<ul>` d’un élément, pas une liste de trois. La même chose se produit entre
`1.` et `1)`, et le cas numéroté s’en fait davantage remarquer, car la seconde liste démarre sa propre numérotation.
Les causes habituelles sont un fichier édité par deux personnes aux habitudes différentes, ou un bloc collé depuis
un endroit qui utilisait `*` alors que votre fichier utilise `-`.

Dans un navigateur, deux listes à puces adjacentes ressemblent presque exactement à une seule, ce qui explique que
cela passe souvent inaperçu en production. Ce qui trahit la chose, c’est l’espacement : si l’une des deux listes
contient une ligne vide, elle devient aérée tandis que sa voisine reste compacte, et la moitié d’une liste se
retrouve soudain avec plus d’air autour qu’elle que l’autre moitié. Un seul caractère de puce et un seul délimiteur
par document supprime toute cette catégorie de problème.

## Jusqu’où indenter une liste markdown imbriquée

L’indentation se mesure depuis la colonne de contenu de l’élément parent, pas depuis la marge gauche. C’est toute la règle, et elle explique chaque liste qui refuse de s’imbriquer.

```markdown
- Bullet: content starts at column 2
  - so two spaces nests under it
1. Ordered: `1. ` is three characters wide
   - so three spaces nests under it
10. At ten the marker is four wide
    - and four spaces is what nests
```

Quatre espaces, c’est l’habitude que la plupart des gens transportent avec eux, et l’indentation supplémentaire étant autorisée, cela fonctionne d’ordinaire. Cela échoue dans les deux sens : trop peu, et la liste imbriquée devient une sœur de son parent ; quatre colonnes ou plus au-delà de la colonne de contenu, et c’est de nouveau du code.

### L’arithmétique, en détail

La spécification construit un élément de liste à partir d’un marqueur de largeur L suivi de N espaces, où N vaut
entre un et quatre, puis indente chaque ligne suivante de cet élément de L + N (vérifié sur
spec.commonmark.org, le 9 septembre 2026). L + N est la colonne de contenu, et c’est le seul nombre qui compte.
Le guide de rédaction de GitHub donne la même règle sans l’algèbre : tapez des espaces devant l’élément imbriqué
jusqu’à ce que son marqueur se trouve directement sous le premier caractère du texte au-dessus de lui, et dans une
police à chasse variable, comptez les caractères qui précèdent le contenu de l’élément (vérifié sur docs.github.com,
le 9 septembre 2026).

Ainsi, la largeur du marqueur est la largeur du marqueur tel qu’il est écrit, et chaque partie compte :

| Marqueur du parent | Largeur du marqueur | Espaces après | Colonne de contenu | Imbriquer un enfant à |
| :--- | :--- | :--- | :--- | :--- |
| `- ` | 1 | 1 | 2 | 2 espaces |
| `* ` | 1 | 1 | 2 | 2 espaces |
| `-   ` | 1 | 3 | 4 | 4 espaces |
| `1. ` | 2 | 1 | 3 | 3 espaces |
| `1) ` | 2 | 1 | 3 | 3 espaces |
| `10. ` | 3 | 1 | 4 | 4 espaces |
| `100. ` | 4 | 1 | 5 | 5 espaces |

La ligne qui piège tout le monde, c’est `10. `. Une liste qui s’imbriquait correctement pour neuf éléments cesse de
s’imbriquer correctement au dixième, parce que le marqueur a gagné un caractère et que la colonne de contenu a
bougé avec lui. Personne ne s’attend à cela, parce que le fichier qui casse est le fichier qui fonctionnait la
veille, avec un élément de moins.

### Deux espaces sous une puce, et ce que produisent les autres indentations

Prenez un parent à puce, colonne de contenu 2. Correct :

```markdown
- Parent item
  - Nested, because two spaces reach the content column
```

Une espace de moins, et l’enfant n’en est plus un du tout — c’est un autre élément de la même liste, car un marqueur
de liste tolère jusqu’à trois espaces de sa propre indentation :

```markdown
- Parent item
 - One space: a sibling, rendered flush with its parent
```

Quatre colonnes au-delà de la colonne de contenu, avec une ligne vide au-dessus, et l’analyseur lit un bloc de code
indenté à l’intérieur de l’élément parent :

```markdown
- Parent item

      - Six spaces: this is code now
```

qui se rend en `<li><p>Parent item</p><pre><code>- Six spaces: this is code now</code></pre></li>` — un encadré gris
sous la puce, tiret compris. Retirez la ligne vide et les six mêmes espaces produisent encore autre chose : sans
ligne vide, le texte surindenté est une continuation de paragraphe, il rejoint donc le propre paragraphe du parent
et le marqueur s’imprime comme un tiret littéral en plein milieu de phrase.

### Trois espaces sous un élément numéroté

Un parent numéroté déplace la colonne d’une position, et l’habitude des deux espaces échoue d’une façon qui
ressemble à un bogue du convertisseur :

```markdown
1. Parent item
  - Two spaces: not nested, and not even in the list
```

Deux espaces, c’est en deçà de la colonne de contenu qui est à 3, l’enfant ne fait donc pas partie de l’élément ; et
comme son marqueur est une puce plutôt qu’un numéro, il ne peut pas non plus être un frère. La liste numérotée se
referme et une nouvelle liste à puces s’ouvre à côté. La page rendue montre un `<ol>` d’un élément suivi d’un `<ul>`
d’un élément — ce qui, dans la plupart des feuilles de style, ressemble à une liste imbriquée ayant perdu son
indentation.

Trois espaces est la correction :

```markdown
1. Parent item
   - Three spaces: nested, as intended
```

| Indentation sous un parent `- ` | Indentation sous un parent `1. ` | Ce qu’en fait l’analyseur |
| :--- | :--- | :--- |
| 0–1 espace | 0–2 espaces | Ne fait pas partie de l’élément : un frère si le type de marqueur correspond, une toute nouvelle liste sinon |
| 2–5 espaces | 3–6 espaces | Une liste imbriquée — la colonne de contenu, plus jusqu’à trois espaces de tolérance |
| 6 espaces ou plus après une ligne vide | 7 espaces ou plus après une ligne vide | Un bloc de code indenté à l’intérieur de l’élément parent |
| 6 espaces ou plus sans ligne vide | 7 espaces ou plus sans ligne vide | Continuation de paragraphe : le marqueur s’imprime comme du texte |

La tolérance de la ligne du milieu explique pourquoi quatre espaces fonctionnent le plus souvent tout en restant la
mauvaise habitude. Quatre est dans la plage pour les deux marqueurs aujourd’hui. Cela cesse d’être dans la plage
dès qu’un marqueur s’élargit, et cela cache l’arithmétique à quiconque éditera le fichier ensuite.

### Ce qui peut aller à l’intérieur d’un élément de liste

Tout ce que vous pouvez écrire au premier niveau peut aller à l’intérieur d’un élément de liste, tant que cela
commence à la colonne de contenu de l’élément. C’est toute l’extension de la règle, et elle couvre quatre choses
que l’on demande séparément :

- **Un second paragraphe.** Une ligne vide, puis le paragraphe indenté jusqu’à la colonne de contenu. Sous
  `- élément`, c’est deux espaces. Indentez-le d’une espace de moins et il tombe entièrement hors de la liste : la
  liste se referme et le texte devient un paragraphe à part, posé sous une liste dans laquelle il était censé être.
- **Un bloc de code.** Une clôture démarrant à la colonne de contenu appartient à l’élément ; quatre colonnes
  au-delà, la clôture cesse d’en être une et devient des accents graves littéraux dans un bloc de code indenté. Ce
  cas a [sa propre arithmétique et ses propres exemples travaillés](/blog/code-blocks-in-markdown), y compris ce qui
  se passe quand la liste dépasse l’élément dix.
- **Une citation.** Un `> ` à la colonne de contenu, sur chaque ligne de la citation, lignes vides comprises.
  Retirez le marqueur sur une ligne et la citation s’arrête là.
- **Une autre liste.** C’est la règle d’imbrication ci-dessus, appliquée une fois de plus depuis la nouvelle
  colonne de contenu.

Deux conséquences découlent de cette façon d’écrire les choses. Un élément de liste est un conteneur de bloc, pas
une ligne de texte, tout ce qui le concerne — espacement, code, citations — est donc une question de colonnes plutôt
que de listes. Et plus on s’imbrique en profondeur, plus on compte de colonnes, ce qui est l’argument pratique
contre trois niveaux d’imbrication dans un document que d’autres personnes éditeront.

## Listes compactes, listes aérées, et la ligne vide qui bascule de l’une à l’autre

Vient ensuite l’espacement qui apparaît de nulle part. Une liste est compacte quand ses éléments sont collés les uns aux autres, et que leur texte va directement dans chaque `<li>`. Mettez une ligne vide entre deux éléments quelconques, ou donnez deux paragraphes à un seul élément, et toute la liste devient aérée : chaque élément, y compris ceux que vous n’avez pas touchés, voit son texte enveloppé dans un paragraphe, ce qui se traduit dans le navigateur par de l’espace vertical supplémentaire. Une ligne vide a suffi à changer le type de la liste.

La spécification énonce la condition et sa conséquence en un seul endroit : une liste est aérée si l’un de ses
éléments est séparé des autres par des lignes vides, ou si un élément contient directement deux éléments de bloc
avec une ligne vide entre eux ; sinon elle est compacte. La différence dans le HTML tient à ce que les paragraphes
d’une liste aérée sont enveloppés de balises `<p>`, tandis que ceux d’une liste compacte ne le sont pas (vérifié
sur spec.commonmark.org, le 9 septembre 2026).

C’est tout le mécanisme. Voici la paire, côte à côte. Compacte :

```markdown
- a
- b
- c
```

```html
<ul>
<li>a</li>
<li>b</li>
<li>c</li>
</ul>
```

Aérée, à cause d’une seule ligne vide avant le dernier élément :

```markdown
- a
- b

- c
```

```html
<ul>
<li><p>a</p></li>
<li><p>b</p></li>
<li><p>c</p></li>
</ul>
```

Trois choses concernant cette sortie méritent d’être dites clairement, car chacune est une question de support que
quelqu’un a déjà posée.

**Le changement affecte la liste, pas l’élément.** Les éléments `a` et `b` n’ont pas été touchés et ont pourtant
tous deux gagné un `<p>`. L’aération est une propriété de la liste dans son ensemble, une ligne vide n’importe où à
l’intérieur re-rend donc chaque élément.

**L’espacement vient de votre feuille de style, pas de Markdown.** Un `<p>` à l’intérieur d’un `<li>` récupère la
marge haute et basse que la page attribue aux paragraphes. C’est pourquoi le même fichier paraît sobre sur GitHub
et aéré sur un site de documentation, ou l’inverse : la quantité d’espace supplémentaire est une décision CSS que
le Markdown s’est contenté de déclencher.

**Une liste imbriquée après une ligne vide rend aérée la liste extérieure aussi.** C’est la règle qui prend au
dépourvu des gens qui n’ont rien fait de mal :

```markdown
- a

  - a nested item
- b
```

Le premier élément contient désormais directement un paragraphe et une liste séparés par une ligne vide, toute la
liste extérieure devient donc aérée et l’élément `b` reçoit un `<p>` qu’il n’a pas demandé. Retirez la ligne vide et
la liste redevient compacte.

Rien de tout cela n’est un défaut à corriger. Les listes aérées sont la bonne forme quand les éléments sont des
phrases ou contiennent plusieurs blocs ; les listes compactes sont adaptées à de courtes étiquettes. Ce qui pose
problème, c’est de faire les deux par accident dans un même document, de sorte que certaines listes respirent et
d’autres non, pour des raisons que personne ne peut voir dans la source. Choisissez par liste, délibérément, et
gardez les lignes vides cohérentes à l’intérieur de chacune.

## Cases à cocher et listes de tâches

Une case à cocher est un élément de liste dont le texte commence par des crochets :

- [x] Marqueur, espace, crochets, espace, puis le texte
- [ ] Les crochets viennent en premier — du texte avant eux, et c’est un élément ordinaire
- [ ] `x` ou `X` la coche, une seule espace la laisse vide, et cette espace est obligatoire

Une liste de tâches est une extension du GitHub Flavored Markdown, pas du CommonMark pur, un convertisseur strictement CommonMark vous rend donc des crochets littéraux. TransformPipe parle GFM : les listes de tâches, les tableaux, le texte barré et les liens automatiques passent donc tels quels. La case à cocher dans la sortie est une image de l’état dans votre fichier, pas un contrôle : GFM la rend comme un champ désactivé, il n’y a donc rien à cliquer.

La spécification GFM est précise sur ce qui compte. Un élément de liste de tâches est un élément de liste dont le
premier bloc est un paragraphe commençant par un marqueur de liste de tâches suivi d’au moins un caractère blanc
avant tout autre contenu, et le marqueur lui-même est un crochet ouvrant, soit un caractère blanc soit la lettre
`x` dans l’une ou l’autre casse, puis un crochet fermant. Une fois rendu, le marqueur est remplacé par un élément
case à cocher, coché quand le caractère entre les crochets n’est pas un blanc (vérifié sur github.github.com, le
9 septembre 2026).

Lu contre un fichier réel, cela donne quatre règles et une surprise :

| Ce que vous écrivez | Ce que vous obtenez | Pourquoi |
| :--- | :--- | :--- |
| `- [ ] Task` | Une case décochée | Un blanc entre les crochets |
| `- [x] Task` ou `- [X] Task` | Une case cochée | Les deux casses de `x` la cochent |
| `- []Task` | Un élément de liste ordinaire, crochets affichés | Aucun blanc à l’intérieur, ni après |
| `- Task [ ] later` | Un élément de liste ordinaire, crochets affichés | Le marqueur doit démarrer le premier paragraphe de l’élément |
| `- [ ] Parent` avec un `- [ ] Child` indenté | Des cases à cocher imbriquées | Les listes de tâches s’imbriquent comme n’importe quelle liste |

La surprise, c’est la sortie elle-même. Le rendu de référence est `<input disabled="" type="checkbox">` — un
élément input, déjà désactivé, à l’intérieur du `<li>`. GitHub superpose son propre comportement à l’intérieur des
tickets et pull requests, où les cases peuvent être cochées et décochées au fil du travail (vérifié sur
docs.github.com, le 9 septembre 2026) ; un document HTML converti n’a nulle part où enregistrer un clic, la case à
cocher est donc une image statique de l’état présent dans la source. Si vous avez besoin d’une case que quelqu’un
puisse cocher et voir mémorisée, il vous faut une application, pas un document.

Le mode d’échec avec un convertisseur qui ne parle pas GFM est plus discret qu’il n’y paraît. Vous n’obtenez pas
une erreur ; vous obtenez `<li>[ ] Task</li>`, soit une liste d’éléments commençant par deux crochets. Sur une page
avec un style correct, cela se lit comme une erreur de mise en forme plutôt que comme une fonctionnalité manquante,
ce qui explique pourquoi « mes cases à cocher ne fonctionnent plus » est en général un problème de dialecte — le
même qui fait disparaître en même temps tableaux et texte barré.

## Échapper un caractère qui a un sens

Le caractère d’échappement est l’antislash. En CommonMark il fonctionne devant n’importe quel signe de ponctuation ASCII et nulle part ailleurs, un antislash devant une lettre reste donc sur la page comme un antislash.

```markdown
1986\. The year, not the first item of a list.
The shape is a \*star\*, and I mean the asterisks.
A literal backslash is written \\.
```

La date est le cas classique : une ligne commençant par un chiffre, un point et une espace est une liste numérotée, un paragraphe qui s’ouvre sur une année devient donc silencieusement l’élément un. Les titres (`#`), les citations (`>`) et les puces (`-`) font de même en début de ligne, et les barres verticales doivent être échappées à l’intérieur d’un tableau.

Deux choses vous épargnent des antislashs. Les tirets bas à l’intérieur d’un mot sont laissés tranquilles, `snake_case_name` survit donc intact ; les astérisques ne le sont pas, `a*b*c` met encore en emphase. Et un antislash ne fait rien à l’intérieur d’une plage de code, ce qui est de toute façon la meilleure réponse pour un nom de fichier, une option ou un motif glob — le cas qui ouvre [la référence complète sur l’échappement](/blog/markdown-escaping), qui poursuit avec les références de caractères qu’un antislash ne peut pas remplacer et les cas des gabarits, des chemins Windows et de `__init__` qui produisent la plupart des plaintes.

### Chaque caractère qui en a besoin, et où

L’ensemble est fixé. CommonMark autorise un antislash devant n’importe quel caractère de ponctuation ASCII et
nulle part ailleurs, ce qui donne ces trente-deux : ``!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~`` (vérifié sur
spec.commonmark.org, le 9 septembre 2026). Un antislash devant une lettre, un chiffre ou une espace est un
antislash littéral, imprimé tel quel.

La plupart de ces trente-deux ne font jamais rien et n’ont jamais besoin d’être échappés. Voici ceux qui comptent :

| Caractère | Ce qu’il signifie sans échappement | Où il mord | Écrire à la place |
| :--- | :--- | :--- | :--- |
| `\` | Le caractère d’échappement lui-même | N’importe où dans le texte | `\\` |
| `` ` `` | Ouvre une plage de code | N’importe où en ligne | ``\` ``, ou entourer le texte d’une plus longue suite d’accents graves |
| `*` | Emphase, et marqueur de puce | N’importe où en ligne, y compris en plein mot ; en début de ligne | `\*` |
| `_` | Emphase | Seulement en bordure de mot — les tirets bas en plein mot sont sûrs | `\_` |
| `#` | Un titre ATX | Début de ligne seulement | `\#` |
| `>` | Une citation | Début de ligne seulement | `\>` |
| `-` | Une puce, un soulignement setext, une rupture thématique | Début de ligne seulement | `\-` |
| `+` | Une puce | Début de ligne seulement | `\+` |
| `.` | Un marqueur de liste numérotée, après des chiffres | Début de ligne seulement | `1986\.` |
| `)` | Un marqueur de liste numérotée, après des chiffres | Début de ligne seulement | `1986\)` |
| `[` `]` | Un lien, une image, une note, un marqueur de tâche | N’importe où en ligne | `\[` `\]` |
| `!` | Une image, quand suivi de `[` | N’importe où en ligne | `\!` |
| `<` | Du HTML brut, ou un lien automatique | N’importe où en ligne | `\<`, ou l’entité `&lt;` |
| `&` | Le début d’une référence d’entité | N’importe où en ligne | `&amp;` |
| Une barre verticale | Une frontière de cellule dans un tableau GFM | Seulement à l’intérieur d’une ligne de tableau | Un antislash devant, même dans une plage de code |
| `~` | Texte barré, en GFM | N’importe où en ligne, par paires | `\~` |
| `=` | Un soulignement de titre setext, transformant la ligne au-dessus en `<h1>` | Début de ligne, directement sous un paragraphe | `\=` |

La colonne qui épargne le plus de travail est la troisième. `#`, `>`, `-`, `+`, `.` et `)` n’ont de sens qu’en
début de ligne, un dièse en plein milieu de phrase est donc un simple dièse et n’a besoin de rien. Les échapper
partout est une habitude reprise d’outils qui échappent par précaution, et cela laisse des antislashs disséminés
dans une prose qu’un lecteur finira par voir, car un antislash devant un caractère qui ne signifiait rien disparaît
tout de même de la sortie tout en restant dans le fichier, pour la perplexité de la prochaine personne.

### Là où un antislash ne fait rigoureusement rien

Les échappements ne fonctionnent pas à l’intérieur des plages de code, des blocs de code, des liens automatiques
ni du HTML brut (vérifié sur spec.commonmark.org, le 9 septembre 2026). À l’intérieur d’accents graves, `\*` est un
antislash et un astérisque, tous deux imprimés — ce qui est exactement ce qu’il faut pour un motif glob ou un
chemin Windows, et exactement ce qui surprend ceux qui ont échappé d’abord et ajouté les accents graves ensuite.

Ils fonctionnent en revanche à trois endroits auxquels on ne s’attend pas forcément : les destinations de liens, les
titres de liens, et la chaîne d’information après une clôture. Une parenthèse à l’intérieur d’une URL peut être
échappée plutôt qu’encodée en pourcentage, et un titre contenant un guillemet peut le porter.

### Les échappements qu’un convertisseur écrit à votre place

Dans l’autre sens — HTML, `.docx` ou tableur vers Markdown — chacun de ces caractères est le problème du
convertisseur, pas le vôtre, et c’est une façon raisonnable d’en juger un. Un paragraphe Word qui commence par
« 1986. L’année » doit arriver en `1986\. L'année`, sans quoi le document gagne une liste que personne n’a écrite.
Un titre dont le texte contient un `#`, une phrase contenant un tiret bas ou un astérisque, une cellule de tableau
contenant une barre verticale : chacun a besoin d’un antislash inséré pendant la conversion, et un convertisseur
qui néglige cela produit un fichier Markdown qui se rend différemment du document dont il vient. Cela vaut la
peine d’être testé avec un paragraphe délibérément piégeux avant de faire confiance à un convertisseur pour cent
pages.

Dans l’autre sens, l’échappement est le problème du navigateur et le convertisseur le gère silencieusement : `<`
et `&` dans votre texte arrivent dans le HTML sous la forme `&lt;` et `&amp;`, ce qui explique pourquoi un `<div>`
littéral écrit dans la prose apparaît comme du texte sur la page plutôt que de disparaître dans le balisage.

## La partie honnête : la syntaxe que votre chaîne d’outils supprime

Tout ce qui précède suppose que le fichier enregistré est le fichier que lit le convertisseur. Pour le saut dur à
deux espaces, cette hypothèse est en général fausse, et elle l’est d’une façon que personne ne peut voir.

Les blancs de fin de ligne sont la seule chose que pratiquement toute chaîne d’outils moderne est configurée pour
retirer. C’est une propriété EditorConfig standard : `trim_trailing_whitespace` réglé sur `true` retire les
caractères blancs avant le retour à la ligne, et c’est pris en charge par la plupart des éditeurs (vérifié sur
editorconfig.org, le 9 septembre 2026). Un dépôt dont l’`.editorconfig` fixe ce réglage pour `[*]` supprime vos
sauts de ligne au prochain enregistrement, dans chaque fichier, pour tout le monde. Rien ne vous avertit, parce que
du point de vue de l’éditeur, il n’a retiré rien de précieux, et [l’éditeur dans lequel vous écrivez](/blog/best-markdown-editors) est en général celui-là même qui applique ce
réglage — une option activée il y a des années pour un langage où les blancs de fin sont réellement du bruit.

Le linter est d’accord avec l’éditeur et en désaccord avec la spécification. La règle MD009 de markdownlint,
alias `no-trailing-spaces`, signale les lignes finissant par un blanc inattendu, avec un paramètre `br_spaces` qui
autorise une exception pour un nombre précis d’espaces de fin utilisées comme saut explicite ; sa valeur par défaut
est `2` (vérifié sur github.com, le 9 septembre 2026). Un saut à deux espaces passe donc, et un saut à trois
espaces est signalé — alors même que les deux se rendent identiquement, puisque la règle est « deux ou plus ». La
syntaxe est légale à toute largeur au-dessus de un, et propre au regard du linter à exactement une seule largeur.

Ajoutez les deux derniers faits et le tableau est complet. Une revue de code ne montre rien : les espaces de fin
n’apparaissent pas comme du contenu dans un diff, le commit qui a supprimé vos sauts de ligne ressemble donc au
commit qui a corrigé une indentation. Et la personne qui s’en aperçoit, c’est le lecteur, des semaines plus tard,
face à une adresse tenant sur une seule ligne.

C’est là le nœud de tout le sujet. La façon documentée, originelle, universellement prise en charge de couper une
ligne consiste en une séquence de caractères invisibles que les outils autour de votre fichier sont configurés
pour supprimer, que votre linter tolère à exactement une seule largeur, et dont la disparition est invisible en
relecture. Ce n’est pas un défaut de Markdown et ce n’est pas un défaut d’outillage ; ce sont deux positions
raisonnables qui se rencontrent dans un fichier.

## Conclusion : les règles qui survivent à un aller-retour

Dix règles couvrent tous les échecs de cette page, et elles sont toutes, au fond, la même règle : mettre le sens
dans le document plutôt que dans l’outil qui le rend.

1. **Écrivez les sauts durs avec un antislash, pas avec deux espaces.** Une purge des blancs ne peut pas le
   supprimer, un diff le montre, et si vous le placez quelque part d’inutile, il s’imprime lui-même au lieu
   d’échouer en silence.
2. **Utilisez un `<br>` littéral quand le convertisseur n’est pas le vôtre.** La seule chose capable de le retirer
   est la liste blanche d’un assainisseur, ce qui est une liste de possibilités plus courte que l’ensemble des
   options de saut de ligne de chaque moteur de rendu.
3. **Préférez une ligne vide avant l’un ou l’autre.** Un nouveau paragraphe est un bloc qu’une feuille de style
   peut espacer, et un `<br>` ne l’est pas — la plupart des sauts pour lesquels les gens se battent auraient dû
   être des paragraphes.
4. **Laissez une ligne vide au-dessus de chaque liste.** Cela coûte une ligne et supprime toute différence entre
   dialectes concernant l’interruption d’un paragraphe, y compris la règle voulant qu’une liste numérotée démarre
   à 1.
5. **Comptez le marqueur plutôt que de suivre l’habitude : deux sous `- `, trois sous `1. `, quatre à partir de
   l’élément dix.** Quatre espaces fonctionnent jusqu’à ce qu’un marqueur s’élargisse, et la liste qui casse est
   celle que vous n’avez pas éditée.
6. **Décidez compacte ou aérée par liste, et gardez les lignes vides cohérentes à l’intérieur.** Sinon
   l’espacement de votre document change pour des raisons invisibles dans la source et impossibles à attribuer en
   relecture.
7. **Gardez un seul caractère de puce et un seul délimiteur numéroté par document.** Un `+` ou un `1)` égaré scinde
   silencieusement une liste en deux, et deux listes adjacentes ressemblent presque exactement à une seule.
8. **Échappez un caractère seulement là où il porte un sens.** `#`, `>`, `-` et `.` signifient quelque chose en
   début de ligne et rien ailleurs, les échapper partout laisse donc des antislashs dans une prose que quelqu’un
   finira par lire dans la source.
9. **Traitez l’option `breaks` d’un moteur de rendu comme une propriété de votre application, jamais de vos
   documents.** Le jour où le texte est exporté, versionné ou collé ailleurs, chaque saut qui en dépendait a
   disparu.
10. **Lisez le HTML, pas l’aperçu.** Un `<p>` là où vous attendiez un `<br>`, un `<pre>` là où vous attendiez un
    élément imbriqué, un second `<ul>` là où vous attendiez une seule liste : la sortie nomme la règle qui s’est
    déclenchée.

Rien de tout cela n’a besoin d’un outil pour être appliqué. Il faut que le fichier source dise ce que vous vouliez
dire, pour qu’il le signifie encore après qu’un formateur, un relecteur et le convertisseur de quelqu’un d’autre y
soient tous passés. Quand un document se rend encore mal et que vous n’en voyez pas la raison, convertissez-le et
lisez le HTML à côté de l’aperçu — [TransformPipe fait cela dans le navigateur](/), source et sortie côte à côte —
car les balises répondent à la question que la source ne peut pas poser : un `<p>` signifie que le saut ne s’est
jamais produit, un `<pre>` signifie que vous avez trop indenté, et une liste qui a gagné des paragraphes signifie
qu’une ligne vide s’est glissée quelque part sans que vous regardiez. Chaque symptôme de cette page se ramène à
l’un de ces trois-là, et chacun est une règle qui fait exactement ce qu’elle annonce.

## FAQ

### Comment faire un saut de ligne en Markdown ?

Terminez la ligne par deux espaces ou un antislash, et le saut se produit à l’intérieur du même paragraphe, sous
forme de `<br>`. Laissez une ligne vide à la place et vous obtenez un nouveau paragraphe, ce qui est ce que vous
voulez pour de la prose. L’antislash est le meilleur des deux sauts durs, car les espaces de fin sont invisibles et
la plupart des chaînes d’outils les suppriment.

### Pourquoi mon saut de ligne ne fonctionne-t-il pas sur GitHub ?

Parce qu’un fichier `.md` et un encadré de commentaire sont deux moteurs de rendu différents. Le guide de GitHub
dit qu’un champ de commentaire rend le saut de ligne pour vous, tandis qu’un saut dans un fichier `.md` exige deux
espaces de fin, un antislash ou un `<br/>` (vérifié sur docs.github.com, le 9 septembre 2026). Un texte rédigé dans
un commentaire puis collé dans un fichier s’écrase précisément pour cette raison.

### De combien d’espaces faut-il indenter une liste Markdown imbriquée ?

Deux sous `- `, trois sous `1. `, et quatre une fois la numérotation arrivée à `10. ` — la largeur du marqueur plus
les espaces qui le suivent. Trop peu et l’élément devient un frère au lieu d’un enfant ; quatre colonnes ou plus
au-delà de ce point et il devient un bloc de code ou rejoint le paragraphe du parent.

### Pourquoi ma liste a-t-elle soudain gagné un espacement supplémentaire entre les éléments ?

Une ligne vide quelque part à l’intérieur a rendu toute la liste aérée, le texte de chaque élément est donc
désormais enveloppé dans un `<p>` et récupère les marges de paragraphe de votre feuille de style. La ligne vide
n’a pas besoin d’être entre deux éléments — en placer une avant une liste imbriquée produit le même effet.
Retirez-la et la liste redevient compacte.

### Pourquoi mes numéros de liste se renumérotent-ils tout seuls ?

Seul le premier marqueur est lu ; les numéros des éléments suivants sont ignorés et le navigateur compte à partir
du numéro de départ. C’est pourquoi `1. 7. 3.` se rend en 1, 2, 3, et pourquoi écrire chaque élément comme `1.`
est un style légitime plutôt qu’une erreur.

### Pourquoi ma case à cocher s’affiche-t-elle comme `[ ]` ?

Les listes de tâches sont une extension du GitHub Flavored Markdown plutôt qu’une partie de CommonMark, un
convertisseur strictement CommonMark rend donc les crochets comme du texte ordinaire. Il vous faut un convertisseur
qui parle GFM — le même dont vous avez besoin pour les tableaux, le texte barré et les liens automatiques, ce qui
explique pourquoi ils cassent en général ensemble.

### Comment empêcher qu’une année en début de ligne devienne une liste ?

Échappez le point : `1986\. L'année`. Un chiffre suivi de `.` ou de `)` puis d’une espace est un marqueur de liste
numérotée valide en début de ligne, le paragraphe devient donc l’élément un d’une liste démarrant à 1986.
L’antislash est invisible dans la sortie et ne coûte rien.
