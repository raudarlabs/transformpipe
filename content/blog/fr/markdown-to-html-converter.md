---
title: "Markdown vers HTML : ce qui arrive vraiment à votre fichier"
description: "Ce qu’un convertisseur Markdown vers HTML fait de votre fichier — analyser, rendre, assainir, envelopper — et à quoi ressemble un échec à chacune des quatre étapes"
updated: 2026-10-21
date: 2026-09-08
tag: Conversion
keywords: markdown en html, md en html, convertir markdown en html, convertisseur markdown html en ligne, générateur html depuis markdown, afficher du markdown en html
---

Convertir un fichier Markdown en HTML sonne comme une seule opération. Ce sont quatre travaux exécutés dans l’ordre, et un outil peut être soigneux sur l’un et négligent sur le suivant. Savoir lequel est lequel explique pourquoi deux convertisseurs produisent un HTML différent à partir du même fichier, pourquoi un tableau arrive parfois sous forme de paragraphe truffé de barres verticales, et pourquoi le résultat s’ouvre de temps à autre sur un mur de texte sans mise en forme où les tirets cadratins se sont changés en charabia.

Les quatre étapes sont l’analyse, le rendu, l’assainissement et l’enveloppe. Chacune jette de l’information ou en invente qui n’a jamais figuré dans votre source, et chacune échoue d’une façon que l’on reconnaît à l’écran dès que l’on sait quoi chercher. Aucune des quatre n’est facultative si le fichier doit s’ouvrir ailleurs que dans l’outil qui l’a produit.

Voici le récit mécanique : ce que l’analyseur construit réellement, ce que le moteur de rendu décide à votre place, ce que contient la liste d’autorisation d’un assainisseur et ce qu’il supprime, et ce dont un navigateur a besoin dans le `<head>` avant de restituer votre document tel que vous l’avez vu dans l’aperçu.

### En bref

Un convertisseur Markdown vers HTML analyse votre texte pour en faire un **arbre syntaxique** de nœuds typés, parcourt cet arbre pour **rendre** des balises, **assainit** le fragment obtenu contre une liste d’autorisation de balises, d’attributs et de schémas d’URL, puis **enveloppe** le fragment dans un document complet doté d’un doctype, d’un jeu de caractères et de styles. La variante se décide à la première étape : un analyseur CommonMark nu transforme donc vos tableaux GitHub en paragraphes, sans le moindre message d’erreur. L’assainissement se décide à la troisième étape, et il compte dès l’instant où le Markdown vient d’ailleurs que de votre propre plume. Que le fichier s’ouvre correctement chez la personne à qui vous l’envoyez se décide presque entièrement à la quatrième étape, par quatre lignes dans l’en-tête que la plupart des bibliothèques n’écrivent jamais, parce que les écrire n’est pas le métier d’une bibliothèque.

## Les quatre étapes, en un coup d’œil

| Étape | Entrée | Sortie | Ce qui s’y décide |
| --- | --- | --- | --- |
| Analyse | Des caractères | Un arbre de nœuds typés | La variante : tableaux, listes de tâches, notes de bas de page, règles de saut de ligne |
| Rendu | L’arbre | Un fragment HTML | Identifiants de titres, classes des blocs de code, balisage des cases à cocher, encodage des URL |
| Assainissement | Le fragment | Un fragment débarrassé de ses parties dangereuses | Quelles balises, quels attributs et quels schémas d’URL survivent |
| Enveloppe | Le fragment | Un document complet | Doctype, jeu de caractères, titre, fenêtre d’affichage, styles, et s’il lui faut le réseau |

Lisez ce tableau comme une chaîne. Un fichier qui sort de travers est sorti de travers à exactement un de ces quatre points, et le symptôme vous dit lequel. Des tableaux manquants sont un problème d’analyse, et aucun restylage n’y changera rien. Du texte sans mise en forme est un problème d’enveloppe et n’a rien à voir avec l’analyseur. Une balise `<script>` survivante est un problème d’assainissement, et c’est le seul des quatre qui puisse faire du mal à quelqu’un.

## Première étape : l’analyse, et ce que contient réellement un arbre syntaxique

Un analyseur lit les caractères et construit un arbre. Pas du HTML — un arbre de nœuds typés, chacun doté d’une poignée de champs, et sans la moindre balise. Prenez quatre lignes de Markdown :

```markdown
## Release 2.1

- [x] Tighten the allow-list
- [ ] Document the API

See the [changelog](CHANGELOG.md) for the rest.
```

Ce que l’analyseur produit ressemble davantage à ceci, écrit sous forme de plan :

```text
document
  heading (level: 2)
    text "Release 2.1"
  list (ordered: false, tight: true, marker: "-")
    item (checked: true)
      paragraph
        text "Tighten the allow-list"
    item (checked: false)
      paragraph
        text "Document the API"
  paragraph
    text "See the "
    link (destination: "CHANGELOG.md", title: null)
      text "changelog"
    text " for the rest."
```

Plusieurs éléments de ce plan méritent d’être nommés, car chacun devient plus tard une différence visible dans le HTML.

**Les nœuds sont de bloc ou en ligne.** Les blocs donnent sa forme au document : `document`, `heading`, `paragraph`, `list`, `item`, `block_quote`, `code_block`, `thematic_break`, `html_block`. Les nœuds en ligne sont le contenu d’un bloc : `text`, `emphasis`, `strong`, `code`, `link`, `image`, `softbreak`, `linebreak`, `html_inline`. La structure de bloc est déterminée d’abord, en une passe sur les lignes ; le contenu en ligne est analysé ensuite, à l’intérieur de chaque bloc. C’est cette conception en deux temps qui empêche un `*` égaré en fin de paragraphe de mettre le titre suivant en italique, et qui interdit à une ligne de tableau de contenir une liste.

**Chaque nœud porte ses positions dans la source.** Ligne et colonne de début, ligne et colonne de fin. Personne ne les voit dans la sortie, mais ce sont elles qui permettent à l’aperçu d’un éditeur de défiler au rythme du texte, à un linter d’annoncer « ligne 47, colonne 3 », et à un outil de signaler sur quelle ligne se trouvait un lien cassé. Un convertisseur qui jette les positions ne peut pas vous dire où quoi que ce soit a dérapé.

**Certains nœuds portent des attributs structurels qui changent le rendu.** Un nœud `list` enregistre s’il est ordonné, à quel numéro il commence, et s’il est *serré* ou *lâche*. La compacité se décide par les lignes vides de votre source : des puces sans ligne vide entre elles font une liste serrée, et les éléments d’une liste serrée sont rendus sans enveloppe `<p>`. Glissez une seule ligne vide entre deux puces et chaque élément de la liste devient lâche, gagne un paragraphe, et la liste entière grandit. C’est le « pourquoi l’espacement a-t-il changé » le plus fréquent en Markdown, et cela se produit dans l’arbre, avant qu’aucun HTML n’existe.

Un nœud `code_block` enregistre le caractère de clôture, la longueur de la clôture et la *chaîne d’information* — le `js` de ` ```js `. Cette chaîne est du texte libre ; l’analyseur ignore qu’il s’agit d’un nom de langage. Dans un analyseur de variante GitHub, un nœud `item` enregistre si sa case était cochée. Un nœud `link` enregistre une destination et un titre facultatif, déjà déséchappés.

**Les définitions de référence de lien ne survivent pas sous forme de nœuds.** Écrivez `[changelog][cl]` dans un paragraphe et `[cl]: https://example.com/log` au bas du fichier : l’analyseur consomme entièrement la ligne de définition et résout la destination dans le nœud `link`. Rien dans l’arbre ne se souvient que le lien avait été écrit par référence. Deux conséquences en découlent : une définition que personne ne référence disparaît sans laisser de trace, et une référence dont l’étiquette contient une faute de frappe n’est pas une erreur — c’est du texte littéral, et `[changelog][cl2]` s’affiche avec exactement ces caractères, crochets compris.

**Le HTML brut est une chaîne opaque.** Un `<div>` ou un `<script>` dans votre Markdown devient un nœud `html_block` dont le contenu est le texte brut. L’analyseur Markdown ne le décompose pas en éléments, ne vérifie pas que les balises s’équilibrent, et ne sait pas ce qu’il dit. C’est une boîte scellée transportée jusqu’à la sortie, et c’est précisément pour cela que l’assainisseur de la troisième étape doit faire sa propre analyse du HTML plutôt que d’inspecter l’arbre.

## Là où les variantes de Markdown divergent

La variante est une propriété de l’analyseur, et elle se décide ici. Chaque différence ci-dessous est un écart réel et énumérable entre des spécifications et des implémentations nommées.

**Le CommonMark nu n’a pas de tableaux.** Pas de listes de tâches, pas de texte barré, pas de transformation automatique des URL nues en liens. Il a les titres ATX, les titres setext, le code clôturé et indenté, les listes, les citations, les lignes horizontales, l’emphase, les liens, les images et le HTML brut. C’est cela, la spécification. Confiez un tableau à barres verticales à un analyseur strictement conforme et vous récupérez un paragraphe contenant des barres verticales, disposé en un seul flot de texte, sans le moindre avertissement.

**GitHub Flavored Markdown ajoute cinq extensions par-dessus CommonMark :** les tableaux, les éléments de liste de tâches, le texte barré avec `~~`, les liens automatiques littéraux, et le HTML brut interdit, qui filtre une courte liste de balises dès l’analyse. C’est une spécification à part entière, publiée comme un écart par rapport à CommonMark, et c’est pourquoi « prend-il en charge GFM ? » est une question sensée à laquelle on répond par oui ou par non. Notez que la cinquième extension ne remplace pas la troisième étape : elle nomme une poignée de balises, pas une liste d’autorisation.

**Les notes de bas de page ne sont dans aucune des deux spécifications.** Un convertisseur qui prend en charge `[^1]` le fait au titre d’une extension, et les extensions ne s’accordent entre elles ni sur l’endroit où peut vivre le texte de la note, ni sur le droit d’une note à contenir une liste, ni sur l’allure du lien de retour. Les notes de bas de page sont la fonctionnalité qui a le plus de chances de survivre à une conversion et de disparaître à la suivante.

**L’emphase à l’intérieur d’un mot diffère.** CommonMark refuse délibérément de voir dans un `_` interne à un mot une marque d’emphase : `snake_case_name` reste donc intact. Des convertisseurs plus anciens, y compris des convertisseurs JavaScript antérieurs à CommonMark, mettent le milieu de cet identifiant en italique. Si votre document est plein de noms de variables, l’analyseur que vous choisissez fait la différence entre lisible et massacré.

**Les sauts de ligne souples sont une option, pas une règle.** Un simple retour à la ligne dans un paragraphe est un nœud `softbreak`. CommonMark le rend par un retour à la ligne dans le HTML, que le navigateur réduit à une espace. marked et markdown-it exposent tous deux une option `breaks` qui le rend en `<br>` à la place ; Python-Markdown fait de même via son extension `nl2br`. Même fichier, deux réglages, deux documents — l’un où votre bloc d’adresse tient sur trois lignes et l’autre où il n’en fait qu’une.

**Les dialectes étendus vont encore plus loin.** Le Markdown propre à Pandoc ajoute les listes de définitions, les blocs `div` clôturés, les citations bibliographiques et les mathématiques en ligne. L’extension `attr_list` de Python-Markdown permet d’attacher des classes et des identifiants aux éléments depuis la source. PHP Markdown Extra et MultiMarkdown ont chacun leurs variations de syntaxe de tableau. Tout cela s’analyse dans l’outil qui le définit et se dégrade en ponctuation littérale partout ailleurs, et c’est ce que les gens veulent dire quand ils affirment qu’un fichier Markdown n’est pas portable. La question de la variante mérite d’être bien comprise, car [les variantes diffèrent de façons précises et énumérables](/blog/commonmark-gfm-and-the-flavours) et ces différences sont toutes silencieuses.

## Deuxième étape : le rendu, et les choix que personne ne vous a soumis

Le moteur de rendu parcourt l’arbre et écrit des balises. C’est ici que le convertisseur se met à inventer, car le HTML exige des détails que le Markdown n’a jamais exprimés. À partir de l’arbre ci-dessus, un moteur de rendu de variante GitHub pourrait écrire :

```html
<h2 id="doc-release-21">Release 2.1</h2>
<ul class="contains-task-list">
  <li class="task-list-item"><input type="checkbox" checked disabled> Tighten the allow-list</li>
  <li class="task-list-item"><input type="checkbox" disabled> Document the API</li>
</ul>
<p>See the <a href="CHANGELOG.md">changelog</a> for the rest.</p>
```

Aucun de ces identifiants, de ces classes ni de ces éléments `input` n’existait dans votre source. Ce sont des choix maison, et c’est pourquoi deux convertisseurs peuvent avoir tous deux raison tout en se contredisant.

**Les identifiants de titres sont l’arête la plus vive.** Aucune spécification ne dit que les titres reçoivent un `id`, et aucune ne définit comment le texte devient un identifiant lisible. Les implémentations passent le texte en minuscules, retirent la ponctuation, remplacent les espaces par des traits d’union et ajoutent un compteur aux doublons — mais elles ne s’accordent ni sur la ponctuation à retirer, ni sur l’allure du compteur. Un moteur de rendu ôte le point et produit `release-21` ; un autre le garde et produit `release-2.1` ; un troisième préfixe le tout, comme le `doc-release-21` ci-dessus, pour éviter la collision avec le balisage propre à la page. Des ancres écrites à la main contre l’un de ces schémas cassent silencieusement contre un autre, et « silencieusement » veut dire ici que le navigateur ne défile nulle part et n’affiche aucune erreur.

**Les blocs de code reçoivent une classe, et la convention n’est pas universelle.** La sortie habituelle est `<pre><code class="language-js">`, qui reprend le premier mot de la chaîne d’information. Certains moteurs écrivent `class="js"`, d’autres ajoutent un attribut `data-lang`, d’autres émettent un `<div>` enveloppant portant le langage. La coloration syntaxique est encore une décision distincte : ou bien le convertisseur exécute un colorateur au moment de la conversion et émet des `span` porteurs de classes, ou bien il émet un élément de code nu et attend qu’un script le colore dans le navigateur. Le premier produit un fichier qui fonctionne hors ligne ; le second produit un fichier qui exige le réseau et une balise de script. Ce choix, et [le traitement des blocs de code en général](/blog/code-blocks-in-markdown), décide si vos exemples de code survivent à un envoi par courriel.

**Le texte et les URL sont échappés, et l’échappement diffère.** Dans les nœuds de texte, `&`, `<` et `>` sont remplacés par des entités. Dans les valeurs d’attributs, ce sont les guillemets. Les destinations de liens sont encodées en pourcentage, et les implémentations divergent sur le sort d’une destination qui contient déjà un `%` : laissée telle quelle, ou encodée une seconde fois — auquel cas une URL qui marchait devient un 404. Les moteurs de rendu divergent aussi sur la normalisation de la casse des échappements hexadécimaux et sur l’encodage de caractères légaux dans une URL mais disgracieux.

**La typographie est facultative.** L’option `typographer` de markdown-it et l’extension `smart` de Pandoc convertissent les guillemets droits en guillemets courbes, `--` en tiret demi-cadratin et `...` en points de suspension. Agréable dans de la prose, désastreux dans un document plein de lignes de commande, où une apostrophe courbe collée dans un terminal échoue avec un message qui ne parle pas d’apostrophes.

**Le balisage des listes de tâches varie.** Certains moteurs émettent un vrai `<input type="checkbox" disabled>`, d’autres un `<span>` stylé, d’autres laissent le `[x]` littéral en place parce qu’ils n’ont jamais implémenté l’extension. Cela compte deux fois : une fois pour l’apparence, et une autre à la troisième étape, car un élément `input` est exactement le genre de chose que la liste d’autorisation d’un assainisseur a envie de supprimer.

**Les tableaux reçoivent des attributs d’alignement, ou des classes.** Les deux-points de la ligne de délimitation d’un tableau GFM deviennent soit des attributs `align="left"` sur les cellules, soit une classe par colonne, soit des styles en ligne — trois façons d’exprimer la même intention, que chaque assainisseur traite différemment. Les tableaux en portent davantage par ligne que tout le reste du Markdown, et c’est pourquoi [les tableaux sont ce qui casse le plus souvent en chemin](/blog/markdown-tables-that-survive-conversion).

Ce que le moteur de rendu renvoie est un fragment. Des titres, des paragraphes et des listes, sans doctype, sans en-tête, sans styles, et sans aucune promesse que tout cela soit sûr.

## Troisième étape : l’assainissement, le travail que l’on oublie

Markdown laisse passer le HTML brut par conception. Une balise `<script>` dans un fichier .md n’est pas une erreur ; c’est du contenu, et un moteur de rendu fidèle la recopie dans la sortie. Idem pour un attribut `onerror` sur une image, idem pour une URL `javascript:` dans un lien. Si le Markdown vient d’un endroit que vous ne maîtrisez pas — une demande de fusion, un ticket, un client, la sortie d’un modèle —, le fragment que vous venez de produire est du HTML non fiable, et l’ouvrir dans un navigateur, c’est l’exécuter.

L’assainissement fait passer ce fragment par une liste d’autorisation et jette tout le reste. Il faut que ce soit une liste d’autorisation. Une liste d’interdiction des balises connues comme mauvaises perd contre la prochaine astuce d’encodage, la prochaine variante en majuscules, le prochain espace de noms où un attribut signifie autre chose.

## À quoi ressemble vraiment une liste d’autorisation

Une liste d’autorisation, ce sont trois listes et une règle, pas une seule liste de balises.

**La liste des balises.** Tout ce que Markdown peut légitimement produire, et rien de plus : `p`, `h1` à `h6`, `ul`, `ol`, `li`, `blockquote`, `pre`, `code`, `em`, `strong`, `del`, `a`, `img`, `hr`, `br`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `sup`, `sub`. Ajoutez `input` si vous voulez les cases des listes de tâches, `details` et `summary` si vos documents en usent, `span` et `div` si vous autorisez ne serait-ce que les conteneurs HTML bruts.

**La liste des attributs, balise par balise.** C’est la partie que l’on rate en écrivant une seule liste globale. `a` reçoit `href`, `title`, `rel` et éventuellement `target`. `img` reçoit `src`, `alt`, `title`, `width` et `height`. `th` et `td` reçoivent `colspan`, `rowspan` et `align`. `code` reçoit `class`, restreinte au préfixe `language-` si vous êtes prudent. `input` reçoit `type`, `checked` et `disabled`, et `type` est cloué à `checkbox`. Les titres reçoivent `id`. Rien d’autre ne reçoit rien.

**La liste des schémas d’URL.** `http`, `https` et `mailto` pour les liens ; ajoutez `data:` pour les images seulement si vous avez décidé de vouloir des images intégrées, et dans ce cas restreignez-le aux types de média d’image. Tout le reste dégage : `javascript:`, `vbscript:`, `file:`, et `data:text/html`, qui est un document entier déguisé en URL. Les schémas doivent être vérifiés après déséchappement et après suppression des espaces et des caractères de contrôle, car `java&#09;script:` est une URL qu’un navigateur suivra de bon cœur.

**La règle pour tout le reste.** Une balise inconnue est soit supprimée en entier, soit déballée — la balise retirée et ses enfants conservés. Le déballage préserve davantage de votre texte ; la suppression est plus sûre pour les conteneurs dont le contenu n’a jamais été conçu pour être lu comme de la prose. Choisissez délibérément, car la différence se manifeste soit par du contenu dupliqué, soit par du contenu manquant, dès la première fois que le document de quelqu’un contient un `<template>`.

## Ce qu’un assainisseur supprime, et pourquoi dans chaque cas

| Supprimé | Pourquoi |
| --- | --- |
| `<script>` | S’exécute à l’ouverture. Toute la raison d’être de cette étape |
| Les attributs `on*` | `onerror`, `onload`, `onmouseover` s’exécutent sans la moindre balise de script |
| Les URL `javascript:` et `data:text/html` | Un lien ou une source d’image qui exécute du code au lieu de récupérer une ressource |
| `<iframe>`, `<object>`, `<embed>` | Chargent et exécutent du contenu tiers à l’intérieur de votre document |
| `srcdoc` | Un document HTML entier passé en fraude dans un attribut |
| `<style>` et l’attribut `style` | Peuvent déplacer et déguiser des éléments ; souvent retirés, parfois autorisés avec une liste de propriétés |
| `<form>`, `<button>`, `formaction` | Demandent une saisie au lecteur et l’envoient quelque part |
| `<base>` | Une seule balise qui réécrit silencieusement toutes les URL relatives du document |
| `<meta http-equiv="refresh">` | Redirige le lecteur loin de votre document |
| `<svg>` et `<math>` | Leurs règles d’analyse de contenu étranger diffèrent de celles du HTML, et les deux peuvent porter des scripts et leur propre syntaxe de liens |
| `id` et `name` sans préfixe | Écrasement du DOM : `id="attributes"` masque une vraie propriété du DOM et casse les scripts qui la lisent |

Deux détails décident si un assainisseur tient la route en pratique.

**Où il s’exécute.** Un assainisseur dans le navigateur s’appuie sur l’analyseur du navigateur lui-même, celui-là même qui restituera plus tard le document — un vrai avantage, car il voit le balisage comme le navigateur le verra. Un assainisseur sur un serveur doit analyser le HTML par ses propres moyens, avec sa propre idée de l’imbrication des balises mal formées. Si un outil convertit aux deux endroits, les deux doivent s’accorder, sans quoi le même document se restitue différemment selon qui l’a demandé. C’est aussi là que vivent les problèmes de mutation : si l’analyse de l’assainisseur et celle du navigateur divergent sur un cas d’imbrication limite, nettoyer le balisage peut produire quelque chose que le navigateur réanalysera en un balisage autre que celui qui avait été approuvé.

**Les identifiants de titres, encore.** Un `id="title"` nu masque une propriété du DOM : un assainisseur de navigateur le retire là où un analyseur côté serveur le conserve — un document, deux formes, et des ancres qui fonctionnent d’un côté et pas de l’autre. Préfixer les identifiants répond aux deux problèmes d’un coup. TransformPipe assainit avec DOMPurify dans le navigateur et avec le paquet `xss` sur le serveur, contre une seule et même liste d’autorisation, et ses identifiants de titres portent un préfixe `doc-`.

Un dernier mot sur cette étape : l’assainissement se voit. Il retire des choses. Les cases à cocher disparaissent si `input` n’est pas sur la liste, un bloc `<details>` s’aplatit en son contenu, un diagramme intégré ne devient plus rien du tout. Ce n’est pas un défaut — c’est la liste d’autorisation qui fait son travail — mais cela veut dire que la sortie doit être lue, et non supposée.

## Quatrième étape : l’enveloppe, parce qu’un fragment n’est pas une page

Ce que le moteur de rendu et l’assainisseur vous rendent est un fragment : `<h1>Titre</h1><p>Texte</p>` et rien autour. Collez-le dans une page existante et il fonctionne parfaitement. Enregistrez-le en .html, envoyez-le à quelqu’un, et le navigateur fera de son mieux avec un document qui ne s’est jamais déclaré.

Un document complet a besoin d’un petit ensemble fixe de choses, et chacune a un échec bien précis qui lui est attaché.

**`<!doctype html>`, en première ligne.** Sans lui, le navigateur bascule en mode quirks, qui est un autre moteur de rendu avec un autre modèle de boîte, un autre héritage dans les cellules de tableau et une autre gestion de la hauteur de ligne. Votre document ne sera pas cassé, à proprement parler — il sera subtilement, inexplicablement espacé autrement que l’aperçu que vous aviez approuvé.

**`<html lang="fr">`.** L’attribut de langue est ce sur quoi un lecteur d’écran s’appuie pour choisir une voix et une prononciation, et ce dont le navigateur se sert pour la césure et les guillemets. Omettez-le et un document français pourra être lu à voix haute avec la phonétique de la langue par défaut du lecteur.

**`<meta charset="utf-8">`, dans les 1024 premiers octets.** C’est celui qui produit le symptôme classique. Votre fichier est en UTF-8 ; sans déclaration, le navigateur devine, et une mauvaise devinette restitue chaque tiret cadratin en `â€"`, chaque apostrophe courbe en `â€™` et chaque nom accentué en deux caractères de bruit. La déclaration doit venir tôt, avant tout contenu substantiel, car le navigateur cesse de renifler dès qu’il a commencé.

**`<title>`.** Il nomme l’onglet du navigateur, c’est ce qu’une boîte de dialogue « Enregistrer sous » propose comme nom de fichier, et c’est ce qu’un aperçu de lien affiche dans une messagerie. Un document sans titre atterrit dans le dossier de téléchargements de quelqu’un sous la forme de son propre chemin.

**`<meta name="viewport" content="width=device-width, initial-scale=1">`.** Sans cela, un téléphone dispose la page à une largeur à peu près de bureau puis dézoome pour la faire tenir : votre document s’ouvre donc en mode lisible-si-vous-pincez. La moitié des gens à qui vous envoyez un document l’ouvriront d’abord sur un téléphone.

**Une feuille de style.** C’est la différence entre converti et ayant l’air converti. Ce dont elle a besoin n’a rien de glorieux : une justification lisible pour que les lignes ne traversent pas tout l’écran, une hauteur de ligne, des bordures et des marges intérieures sur les cellules de tableau, `overflow-x: auto` sur `pre` pour qu’une longue ligne de code défile au lieu d’étirer la page, `max-width: 100%` sur les images pour qu’une capture d’écran ne pousse pas la mise en page de côté, et un bloc `@media print` si quelqu’un doit l’imprimer.

**Intégrez les styles si le fichier doit voyager.** Un `<link>` vers une feuille de style ou une police sur un CDN signifie que le document n’a bonne allure que là où il y a une connexion, et il signifie qu’ouvrir le fichier apprend à un tiers qu’il a été ouvert. Un fichier autonome porte ses styles dans un élément `<style>` et ne demande rien. Il est plus gros, et c’est la seule version qui se restitue à l’identique hors ligne, sur un portable verrouillé, et dans cinq ans quand l’URL du CDN aura bougé.

**Les chemins relatifs se résolvent par rapport au nouvel emplacement du fichier.** Une image écrite `images/diagram.png` se résout par rapport à l’endroit où se trouve désormais le .html : elle casse donc dès que le fichier bouge ou qu’il est joint à un courriel. Seule une URL absolue ou une URI de données voyage avec le document. Cela vaut aussi pour `[changelog](CHANGELOG.md)` : cela devient un `href` vers un fichier .md, et un navigateur à qui l’on tend un .md le télécharge en général au lieu de le restituer, à moins que vous n’ayez converti ce fichier-là aussi et réécrit l’extension.

## À quoi ressemble un échec à chaque étape, à l’écran

Le symptôme identifie l’étape. Voici le tableau à garder.

| Étape | Ce que vous voyez | Ce qui s’est réellement passé | Comment le vérifier |
| --- | --- | --- | --- |
| Analyse | Un paragraphe rempli de `\|` là où devrait être un tableau | L’analyseur applique CommonMark, pas GFM ; les tableaux n’ont jamais été reconnus | Cherchez `<table>` dans la source HTML. Sans élément de tableau, aucun style n’aidera |
| Analyse | Des `[x]` et `[ ]` littéraux en tête des éléments de liste | L’extension des listes de tâches n’est pas activée | Cherchez `type="checkbox"` dans la sortie |
| Analyse | Un `[^1]` littéral dans le texte et aucune note en bas | Les notes de bas de page sont une extension, et cet analyseur ne l’a pas | Vérifiez la variante ou la liste d’extensions de l’outil |
| Analyse | Une adresse de trois lignes réduite à une seule | Les retours à la ligne isolés sont des sauts souples ; l’option `breaks` est désactivée | Cherchez `<br>` dans la source ; il n’y en aura aucun |
| Analyse | Une liste imbriquée rendue à plat, ou en bloc de code | L’indentation de continuation ne correspondait pas à ce qu’attend l’analyseur | Comptez les espaces ; c’est l’arbre qui est faux, pas le CSS |
| Rendu | Les ancres ne mènent nulle part | Les identifiants de titres diffèrent de ceux contre lesquels vos liens ont été écrits | Comparez un `href="#..."` avec l’`id` du titre |
| Rendu | Des blocs de code présents mais sans couleur | Le moteur a émis une classe et laissé la coloration à un script absent du fichier | Cherchez `class="language-…"` et une balise de script |
| Rendu | Des guillemets courbes dans une ligne de commande qui refuse désormais de s’exécuter | La substitution typographique était activée | Cherchez `’` et `“` dans la sortie |
| Rendu | Une URL en 404 alors qu’elle marchait dans la source | La destination a été encodée en pourcentage deux fois | Comparez le `href` et la destination Markdown caractère par caractère |
| Assainissement | Une boîte d’alerte, ou quoi que ce soit qui s’exécute | Rien n’a assaini le fragment. Le document exécute le code de son auteur | Cherchez `<script` et les gestionnaires `on` dans la source avant de l’ouvrir |
| Assainissement | Cases à cocher disparues, blocs `<details>` aplatis, un contenu intégré absent | La liste d’autorisation a fait son travail et ces balises n’y figuraient pas | Comparez les fragments avant et après assainissement si l’outil montre les deux |
| Assainissement | Le même document se restitue différemment sur deux machines | Les assainisseurs côté navigateur et côté serveur appliquent des listes différentes | Convertissez le même fichier aux deux endroits et comparez le HTML |
| Enveloppe | Un mur de texte à empattements sur toute la largeur de la fenêtre | On vous a donné un fragment, pas un document. Pas de doctype, pas d’en-tête, pas de styles | Regardez la première ligne du fichier, à la recherche de `<!doctype html>` |
| Enveloppe | Des `â€"` et des `â€™` parsemés dans la prose | Aucune déclaration de jeu de caractères : le navigateur a mal deviné | Cherchez `<meta charset="utf-8">` dans l’en-tête |
| Enveloppe | Lisible seulement après un zoom à deux doigts sur un téléphone | Pas de balise meta de fenêtre d’affichage | Vérifiez l’en-tête ; puis ouvrez-le sur un téléphone, pas dans un émulateur |
| Enveloppe | Des icônes d’images cassées après l’envoi du fichier par courriel | Des chemins d’images relatifs qui ne se résolvent plus | Regardez les valeurs de `src` ; tout ce qui n’est ni absolu ni une URI de données cassera |
| Enveloppe | Correct avec le réseau, dépouillé sans lui | Les styles ou les polices sont liés depuis un CDN au lieu d’être intégrés | Coupez le réseau et rouvrez le fichier |

## Comparatif rapide : où peuvent tourner les quatre étapes

Les quatre étapes se déroulent là où vous les placez. Ce qui change, c’est lesquelles l’outil fait pour vous, et lesquelles il vous laisse sur les bras.

| Où vous convertissez | Idéal pour | Étapes prises en charge | Prix |
| --- | --- | --- | --- |
| Convertisseur dans le navigateur | Un fichier, maintenant, avec quelqu’un à qui l’envoyer | Les quatre, enveloppe autonome comprise | Gratuit |
| Une bibliothèque dans votre propre code | Restituer du Markdown dans une application que vous construisez | Analyse et rendu ; l’assainissement et l’enveloppe sont à vous | Gratuit, MIT ou BSD selon la bibliothèque |
| Convertisseur en ligne de commande | Conversion scriptée et reproductible de fichiers sur disque | Analyse, rendu et éventuellement enveloppe ; assainissement rarement | Gratuit, open source ; Pandoc est sous GPL |
| Générateur de site statique | Un ensemble de documents qui se citent les uns les autres | Les quatre, plus la navigation, sur tout un répertoire | Gratuit, open source |
| API, CLI ou action d’intégration continue | Conversion dans une compilation, sans navigateur | Les quatre, si le service les fait ; l’intérêt est de ne rien installer sur le runner | Gratuit avec TransformPipe ; variable ailleurs |
| L’export d’un éditeur | Le fichier que vous avez justement sous les yeux | Analyse et rendu ; l’enveloppe dépend entièrement de l’extension | Gratuit pour VS Code ; les éditeurs de bureau varient, voyez l’éditeur |

## Où exécuter la conversion

### Un convertisseur dans le navigateur — les quatre étapes, un fichier, rien de téléversé

Un convertisseur qui tourne dans le navigateur effectue l’analyse, le rendu, l’assainissement et l’enveloppe sur votre propre machine et vous remet un fichier .html terminé. Déconnecté, le fichier n’est envoyé nulle part : il est lu, converti et restitué localement, ce que vous pouvez vérifier en regardant l’onglet réseau ne rien faire pendant qu’il travaille.

| Avantages | Inconvénients |
| --- | --- |
| Produit un document complet, pas un fragment | Un document à la fois, ou plusieurs enchaînés en un seul |
| Rien n’est téléversé : la source reste sur votre machine | Un très gros fichier est borné par la mémoire de la machine |
| Assainit contre une liste d’autorisation fixe avant même que vous n’ouvriez la sortie | Pas de langage de gabarits : l’enveloppe est celle de l’outil, pas la vôtre |
| Rien à installer et rien à configurer | Ce n’est pas une étape de compilation : il faut quelqu’un devant l’écran |

**Prix :** gratuit. Un compte y ajoute l’historique, le partage et une API, gratuits eux aussi.

**Détails techniques et fonctions**

- GitHub Flavored Markdown à l’étape d’analyse : tableaux, listes de tâches, texte barré, liens automatiques, code clôturé
- Les identifiants de titres portent un préfixe `doc-`, et survivent donc à l’assainissement côté navigateur comme côté serveur
- L’export est autonome : doctype, en-tête, jeu de caractères, fenêtre d’affichage, `<style>` intégré, aucune requête externe
- Une vue « source HTML », pour lire l’enveloppe et voir ce qu’est devenu le HTML brut éventuel avant d’envoyer quoi que ce soit
- Téléchargement en `.html`, `.md` ou texte brut, ou impression en PDF par la boîte de dialogue du navigateur — et le téléchargement en texte fait ses propres choix sur les titres, les liens et les tableaux, ce qui est [le prix d’un aplatissement du Markdown en texte brut](/blog/markdown-to-plain-text)

**Pour qui ?** Pour quiconque a « envoyer ceci à quelqu’un » comme prochaine étape, et pour quiconque convertit un document qu’il préférerait ne pas téléverser — un contrat, une note médicale, un plan non publié.

### Une bibliothèque dans votre propre code — deux étapes, et deux qui vous restent

marked et markdown-it en JavaScript, Python-Markdown et markdown-it-py en Python, Goldmark en Go, commonmark.js quand il vous faut le comportement de référence. Celles-ci font l’analyse et le rendu correctement puis s’arrêtent là, à dessein : une bibliothèque ignore si sa sortie ira dans une page existante ou dans un fichier autonome, elle ne peut donc pas écrire votre enveloppe, et elle ignore si l’entrée est fiable, la plupart se refusent donc à assainir en silence.

| Avantages | Inconvénients |
| --- | --- |
| Maîtrise complète des options : variante, sauts, typographie, identifiants de titres | L’assainissement est votre affaire, et l’oubli est silencieux |
| Assez rapide pour tourner à chaque requête | L’enveloppe est votre affaire, et le fragment paraît cassé sans elle |
| Points d’extension pour un rendu de nœuds sur mesure | Deux bibliothèques, deux variantes par défaut, deux jeux de bogues |
| Testable dans votre propre suite | La décision de sécurité vous appartient désormais |

**Prix :** gratuit, open source. marked et markdown-it sont sous licence MIT ; Python-Markdown et commonmark.js sont sous licence BSD.

**Détails techniques et fonctions**

- markdown-it échappe le HTML brut par défaut, ce qui est le réglage sûr ; marked le laisse passer et documente qu’il faut l’associer à DOMPurify
- Toutes deux exposent une option `breaks` pour les sauts de ligne souples et des options pour les identifiants de titres
- markdown-it vous donne un flux de jetons et marked un analyseur lexical : vous pouvez donc inspecter l’arbre avant le rendu
- Les extensions de Python-Markdown couvrent les tableaux, les notes de bas de page et les listes d’attributs

**Pour qui ?** Pour les développeurs qui restituent du Markdown dans une application où le document environnant existe déjà — une zone de commentaires, un panneau d’aperçu, une compilation de documentation avec son propre gabarit.

### La ligne de commande — reproductible, scriptable, et discrète sur la sécurité

Pandoc est la réponse générale, et la plupart des langages livrent un enrobage en ligne de commande autour de leur bibliothèque. Un convertisseur en ligne de commande est le bon outil quand la même conversion devra se reproduire la semaine prochaine, sur des fichiers qui vivent sur un disque, sans personne devant un onglet de navigateur.

| Avantages | Inconvénients |
| --- | --- |
| Reproductible et scriptable sur de nombreux fichiers | Demande une installation et un terminal |
| Le `--standalone` de Pandoc écrit un vrai document, et `--embed-resources` intègre les ressources | Le HTML brut passe : l’assainissement ne fait pas partie du travail |
| Les gabarits donnent une maîtrise exacte de l’enveloppe | Ses dialectes Markdown diffèrent de GFM de façons qui surprennent |
| Tourne là où il n’y a aucun navigateur | Plus d’outillage qu’un fichier unique n’en demande d’ordinaire |

**Prix :** gratuit, open source. Pandoc est sous licence GPL.

**Détails techniques et fonctions**

- Sélection explicite du lecteur : vous pouvez demander `commonmark`, `gfm` ou le dialecte propre à Pandoc plutôt que de deviner
- `--standalone` pour l’enveloppe, `--template` pour la vôtre, `--embed-resources` pour une sortie en un seul fichier
- `--sandbox` restreint l’accès au système de fichiers quand vous convertissez des fichiers auxquels vous ne faites pas confiance
- Écrit d’autres formats que le HTML depuis la même source, ce qui est la vraie raison de l’installer

**Pour qui ?** Pour quiconque convertit selon un calendrier, en masse, ou vers des formats au-delà du HTML.

### Un générateur de site statique — les quatre étapes, sur un répertoire

Hugo, Eleventy, MkDocs, Docusaurus et Jekyll convertissent tous du Markdown en HTML, et aucun d’eux n’est un convertisseur. Ce sont des systèmes de compilation : ils attendent un répertoire, un fichier de configuration, des gabarits et une cible de déploiement, et ils vous rendent de la navigation, une recherche et des liens croisés.

| Avantages | Inconvénients |
| --- | --- |
| Une enveloppe cohérente sur chaque page | Une lourdeur démesurée pour un seul fichier |
| Navigation, flux et liens entre documents | Un fichier de configuration et une compilation à maintenir pour toujours |
| Des thèmes : la question de la feuille de style est réglée | La sortie est un site à déployer, pas un document à envoyer |
| L’analyseur est figé et connu | Sa variante de Markdown est le choix du générateur, pas le vôtre |

**Prix :** gratuit, open source.

**Détails techniques et fonctions**

- Le générateur possède entièrement la quatrième étape, et c’est pourquoi toutes les pages se ressemblent
- Le front matter est ici de la donnée, pas du contenu : il alimente le gabarit au lieu d’apparaître dans le texte
- La plupart figent un analyseur précis — Hugo utilise Goldmark, MkDocs utilise Python-Markdown — la variante est donc une propriété du générateur

**Pour qui ?** Pour quiconque publie un ensemble de documents qui se citent les uns les autres. Pour un fichier et un destinataire, c’est une forme entièrement inadaptée.

### Une API, une CLI ou une action d’intégration continue — convertir sans navigateur dans la boucle

Quand la conversion doit se produire dans une demande de fusion, une compilation nocturne ou l’appel d’outil d’un assistant, il n’y a personne pour cliquer. Il vous faut les mêmes quatre étapes, disponibles au bout d’un fil ou sous forme de binaire auquel le runner fait déjà confiance.

| Avantages | Inconvénients |
| --- | --- |
| Rien à installer sur le runner de compilation | Un aller-retour réseau, sauf si vous prenez la CLI |
| La même liste d’autorisation et la même enveloppe que l’outil interactif : les sorties concordent | Vous dépendez d’un service en état de marche |
| S’insère dans un contrôle de demande de fusion ou une tâche de publication | Pas interactif : vous lisez la sortie après coup, dans un artefact |

**Prix :** gratuit avec l’API, la CLI, l’action GitHub et le serveur MCP de TransformPipe ; variable ailleurs.

**Détails techniques et fonctions**

- La CLI est sans dépendances : un runner n’a donc pas besoin d’une étape d’installation de paquets
- La même conversion est accessible depuis un appel REST, un shell, une étape de workflow ou un assistant
- Comme les quatre étapes tournent côté serveur, la sortie est le document enveloppé et assaini, et non un fragment

**Pour qui ?** Pour les équipes qui convertissent dans le cadre d’une compilation — journaux de versions, documentation générée, aperçu restitué joint à une demande de fusion.

### L’export d’un éditeur — commode, et l’enveloppe est une loterie

VS Code livre un aperçu Markdown bâti sur markdown-it, et des extensions ajoutent l’export ; [Markdown vers HTML dans VS Code](/blog/markdown-to-html-in-vs-code) détaille ce que chacune écrit autour du fragment. Les éditeurs de bureau exportent aussi du HTML. Si le fichier est déjà ouvert devant vous, c’est le plus court chemin du texte à la page.

| Avantages | Inconvénients |
| --- | --- |
| Déjà installé, et déjà en train de regarder le fichier | Le style de l’aperçu n’est en général pas celui de l’export |
| La variante de l’aperçu est connaissable, puisque l’analyseur est nommé | La qualité de l’export dépend entièrement de l’extension choisie |
| Aucun téléversement | L’assainissement n’en fait généralement pas partie |
| Convient pour un README ou une note | Ce n’est pas une chaîne : il convertit ce qui est ouvert |

**Prix :** gratuit pour VS Code et ses extensions ; les éditeurs de bureau sont tarifés par leur éditeur, voyez donc sa propre page.

**Détails techniques et fonctions**

- L’aperçu de VS Code utilise markdown-it : il suit donc CommonMark, avec les extensions propres à l’éditeur par-dessus
- Les extensions d’export divergent sur l’intégration des styles, leur liaison, ou l’écriture d’un simple fragment
- Ce que montre l’aperçu est stylé par le thème de l’éditeur, qui n’est pas livré avec le fichier

**Pour qui ?** Pour les développeurs qui convertissent un fichier en passant, et qui ouvriront le résultat ailleurs avant de l’envoyer.

## Là où le choix évident échoue, et ce que cela coûte

Le choix évident pour un fichier est un convertisseur dans le navigateur, et c’est le bon assez souvent pour que ses échecs méritent d’être nommés.

**Il convertit un document, pas un projet.** Enchaînez plusieurs fichiers en un seul et vous obtenez un long document ; vous n’obtenez pas un site avec une barre latérale. Si la réponse demande de la navigation, le convertisseur n’est que la première étape d’un générateur de site statique, et prétendre le contraire vous coûtera une reconstruction plus tard.

**La machine est la limite.** Convertir côté navigateur veut dire que l’analyse, le rendu et l’assainissement se passent tous dans un onglet. Un fichier long comme un livre avec des centaines d’images est borné par la mémoire de cet onglet, et l’échec est une roue qui tourne, pas un message d’erreur. La conversion côté serveur ou en ligne de commande n’a pas ce plafond.

**Il n’y a rien à comparer.** Une conversion que quelqu’un exécute à la main n’est pas dans le gestionnaire de versions, ne peut pas être rejouée à l’identique le mois prochain, et ne peut pas faire échouer une compilation. Si le même document est publié à répétition, le clic est un passif et l’API, la CLI ou l’action sont le remède.

**Un fichier autonome est un gros fichier.** Intégrer les styles, et les images sous forme d’URI de données, peut multiplier la taille par plusieurs. En échange, il se restitue à l’identique hors ligne et ne demande rien. C’est un compromis, et pour une page servie depuis un site web — où une feuille de style partagée et mise en cache est tout l’intérêt — c’est le mauvais côté du compromis.

**L’assainissement emporte des choses que vous vouliez.** Une liste d’autorisation figée n’a aucun moyen de savoir que le contenu intégré dans votre document était le vôtre. Diagrammes, lecteurs intégrés et conteneurs HTML écrits à la main ressortent sous forme de trous. Le flux de travail honnête consiste à convertir, lire la sortie, et remettre délibérément ce que la liste d’autorisation a retiré.

**L’enveloppe reflète le goût de quelqu’un d’autre.** Pas de langage de gabarits veut dire pas de police maison, pas de logo, pas de page de garde. Pour un document destiné à un client sous une marque, c’est une vraie limite, et un générateur à gabarits est la réponse, même pour une seule page.

**Le front matter est une décision d’analyseur que personne ne documente.** Un fichier venu d’un site statique ou d’une application de notes commence d’ordinaire par un en-tête YAML, et aucune spécification Markdown ne dit ce qu’est un en-tête. Cela se traite donc à la première étape, selon ce que l’analyseur fait par hasard : le consommer, ou le traiter comme du texte ordinaire. C’est le second cas que vous voyez, car l’en-tête arrive dans le document restitué en tant que contenu — d’où l’intérêt de convertir un fichier d’un répertoire avant de convertir le répertoire.

**Les identifiants de titres peuvent ne pas correspondre à ceux que vos liens supposent.** Préfixer les identifiants est la bonne réponse pour la sécurité et la mauvaise pour les ancres copiées depuis GitHub. Convertissez un document et cliquez vos propres liens internes avant d’en croire cent.

## Comment choisir

1. **Partez de la destination, pas du format.** Un document destiné à une personne a besoin des quatre étapes, enveloppe comprise ; un panneau d’aperçu dans votre application n’en a besoin que de deux, puisque la page existe déjà. Choisissez pour la mauvaise destination et vous finirez à écrire un `<head>` à la main.
2. **Accordez la variante au fichier avant toute autre chose.** Si le document contient des tableaux, des listes de tâches ou des notes de bas de page, vérifiez que l’analyseur les implémente, car une extension manquante produit de la prose d’apparence plausible plutôt qu’une erreur, et vous ne le remarquerez pas avant un lecteur.
3. **Tranchez la question de l’assainissement avant de convertir un fichier que vous n’avez pas écrit.** Pour vos propres notes, c’est un non-sujet. Pour un README trouvé sur le réseau, le document d’un client ou la sortie d’un modèle, ou bien le convertisseur assainit, ou bien c’est vous — et si ni l’un ni l’autre ne le fait, ouvrir le résultat revient à l’exécuter.
4. **Exigez une enveloppe que vous puissiez lire.** Ouvrez la source HTML et cherchez le doctype, le jeu de caractères, la balise de fenêtre d’affichage et l’endroit où vivent les styles. Ces quatre lignes prédisent presque toutes les plaintes du type « ça marchait très bien sur ta machine » que vous recevrez sinon plus tard.
5. **Décidez si le fichier peut avoir besoin du réseau.** S’il doit être envoyé par courriel, archivé ou ouvert sur un portable verrouillé, intégrez tout ; une seule police liée depuis un CDN suffit à le faire s’afficher autrement chez la personne à qui vous l’avez envoyé.
6. **Pesez les installations contre la fréquence.** Une conversion ponctuelle ne devrait pas exiger un gestionnaire de paquets ; une compilation nocturne ne devrait pas exiger un onglet de navigateur et quelqu’un devant. Inverser ces deux principes coûte soit un après-midi, soit une corvée récurrente.
7. **Testez en ouvrant la sortie ailleurs.** Pas dans l’aperçu de l’outil — un autre navigateur, une autre machine, le réseau coupé, et une fois sur un téléphone. Ce seul test attrape d’un coup les fragments, les jeux de caractères manquants, les liens CDN et les chemins d’images cassés, et il prend une minute. Si vous hésitez encore entre plusieurs outils, [le comparatif honnête fait l’objet d’un texte à part](/blog/best-markdown-to-html-converters).

## Conclusion

Un convertisseur Markdown vers HTML est une chaîne à quatre étapes, et toute conversion décevante est une étape identifiable qui fait quelque chose de raisonnable dont vous ne vouliez pas : un analyseur appliquant une variante plus petite, un moteur de rendu inventant des identifiants qui ne correspondent pas à vos liens, un assainisseur retirant un contenu intégré, ou une enveloppe jamais écrite parce qu’une bibliothèque a refusé, à juste titre, de deviner. Lisez la sortie plutôt que la liste des fonctionnalités, et lisez-la dans la vue source HTML, où le doctype, le jeu de caractères et le HTML brut survivant sont visibles d’un seul coup. Si vous voulez les quatre étapes en une passe, sur votre propre machine, avec un fichier autonome au bout, [la conversion de Markdown en HTML de TransformPipe](/) est gratuite, ne demande aucune installation, et ne téléverse rien tant que vous êtes déconnecté.

## FAQ

### Qu’est-ce qu’un convertisseur Markdown vers HTML fait réellement à mon fichier ?

Il analyse le texte pour en faire un arbre de nœuds typés, parcourt cet arbre pour écrire des balises HTML, filtre le résultat contre une liste d’autorisation de balises et d’attributs, et enveloppe le fragment dans un document complet. La première étape décide quelle syntaxe existe tout court, et la dernière décide si le fichier s’ouvre correctement chez quelqu’un d’autre. Un outil peut n’en faire qu’un sous-ensemble et se dire convertisseur quand même.

### Pourquoi le même fichier Markdown produit-il un HTML différent dans deux outils ?

Parce que deux des étapes reposent sur des choix qu’aucune spécification ne fait. Les analyseurs peuvent appliquer des variantes différentes, l’un voyant un tableau là où l’autre voit un paragraphe, et les moteurs de rendu inventent les identifiants de titres, les classes des blocs de code et le balisage des cases selon leurs propres conventions. Les deux sorties peuvent être du HTML correct et se contredire ligne par ligne.

### Dois-je assainir du Markdown que j’ai écrit moi-même ?

Pour un fichier dont vous êtes l’auteur et que vous seul ouvrirez, non : il ne contient rien que vous n’y ayez mis. Assainissez dès l’instant où le document vient d’ailleurs, est assemblé de plusieurs sources, ou sera servi à d’autres personnes, car Markdown autorise le HTML brut et le HTML brut autorise les scripts. Assainir un fichier sûr ne coûte rien ; ne pas assainir un fichier dangereux coûte l’exécution du code de son auteur.

### Pourquoi mes cases à cocher ont-elles disparu après la conversion ?

Presque toujours parce que la liste d’autorisation de l’assainisseur n’inclut pas `input`. GFM rend un élément coché en `<input type="checkbox" checked disabled>`, et une liste d’autorisation prudente supprime les éléments de formulaire en bloc. Un convertisseur qui prend correctement en charge les listes de tâches autorise `input` avec `type` cloué à `checkbox` et rien d’autre dessus.

### Que faut-il dans l’en-tête pour qu’un fichier HTML s’ouvre correctement ?

Un doctype en première ligne, pour que le navigateur ne tombe pas en mode quirks ; un `<meta charset="utf-8">` assez tôt pour être vu, afin que les caractères accentués et les tirets ne se changent pas en bruit ; un titre, parce qu’il nomme l’onglet et le fichier enregistré ; une balise meta de fenêtre d’affichage, pour que ce soit lisible sur un téléphone ; et des styles, intégrés si le fichier doit voyager. Qu’il en manque un et le fichier s’ouvrira quand même — mais pas comme vous l’aviez vu.

### Pourquoi mes ancres cessent-elles de fonctionner après la conversion ?

Parce que les identifiants de titres sont l’invention du moteur de rendu, pas la vôtre, et que les règles de fabrication diffèrent. Un outil transforme « Release 2.1 » en `release-21`, un autre en `release-2.1`, et un outil qui préfixe par sécurité produit encore autre chose. Convertissez un document et cliquez chaque lien interne avant de faire confiance au schéma.

### Convertir du Markdown en HTML change-t-il les mots ?

Cela peut arriver. Les options typographiques réécrivent les guillemets droits en guillemets courbes et `--` en tiret demi-cadratin, une option `breaks` change les retours à la ligne isolés en `<br>`, et les définitions de liens non référencées disparaissent entièrement. Le texte est le même pour un lecteur et n’est pas le même pour un terminal, et c’est pourquoi les lignes de commande d’un document converti méritent une vérification caractère par caractère.
