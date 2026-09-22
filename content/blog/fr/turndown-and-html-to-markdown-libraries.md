---
title: "Turndown et cinq bibliothèques HTML vers Markdown : les pertes"
description: "Six bibliothèques comparées sur les tableaux, les listes imbriquées, les blocs de code et les espaces, avec addRule, keep et remove sur le HTML qui les exige."
date: 2026-08-21
tag: Code
keywords: bibliothèque html vers markdown, turndown, turndown addrule, node-html-markdown, html-to-md, html2text python, pandoc html vers markdown
---

Le HTML que vous devez convertir n’est jamais celui du README. Il contient un `<div class="callout">` qui veut dire quelque chose, un bloc de code fait de deux cents éléments `<span>`, un tableau dont une cellule d’en-tête est fusionnée, et un paragraphe vide un élément sur trois parce qu’un CMS l’a mis là. Toutes les bibliothèques de cette page convertiront cette page en Markdown. Elles produiront cinq fichiers différents, et les différences ne sont pas cosmétiques.

### En bref

Choisissez selon la forme de l’entrée et l’endroit où le code s’exécute. **Turndown** est le choix par défaut en JavaScript, parce que ses règles sont remplaçables élément par élément, ce qui est la seule chose qui rende un HTML inhabituel traitable — mais les tableaux réclament `turndown-plugin-gfm`. **node-html-markdown** embarque son propre analyseur (`node-html-parser`), donc il tourne là où il n’y a pas de DOM et gère les tableaux sans greffon. **html-to-md** est la petite option sans dépendances, et sa valeur par défaut de `skipTags` écarte déjà le mobilier de page. **html2text** est la réponse Python quand la sortie est faite pour être lue plutôt que pour repasser dans l’autre sens. **Pandoc** en sous-processus est la réponse quand Markdown n’est pas le dernier format que le document doit prendre.

L’échec qui piège les gens n’est pas une fonctionnalité manquante. C’est l’hypothèse que ces bibliothèques sont interchangeables, et donc que le choix peut se faire tard et se changer à peu de frais. Il ne le peut pas : dans ce domaine, la configuration est du code, pas des options, et le code diffère d’une bibliothèque à l’autre. Une règle qui fait correspondre `<div class="warning">` à une citation en bloc, c’est trente lignes contre l’API de Turndown et trente lignes différentes contre celle de node-html-markdown.

La deuxième chose à savoir avant d’installer quoi que ce soit, c’est laquelle de ces bibliothèques a besoin d’un DOM. Turndown travaille à travers un DOM — sous Node, il amène `@mixmark-io/domino` comme dépendance pour le fournir. C’est commode et c’est aussi une contrainte sur l’endroit où le code peut tourner et sur ce qu’un gros document coûte en mémoire. Les bibliothèques qui possèdent leur analyseur font l’arbitrage inverse. Si vous choisissez entre des outils plutôt qu’entre des bibliothèques, [le comparatif plus large des convertisseurs HTML vers Markdown](/blog/best-html-to-markdown-converters) couvre les extensions, les commandes et les services hébergés ; cet article-ci parle du code que vous importez.

## Six bibliothèques, et ce qu’est chacune

Quatre d’entre elles sont des bibliothèques que l’on appelle, une est un paquet Python doté d’une commande, et une est un binaire vers lequel on lance un sous-processus. Cette distinction compte davantage que n’importe quelle fonctionnalité du tableau, parce qu’elle décide de ce qui arrive quand la conversion échoue : une bibliothèque lève une exception, un sous-processus renvoie un code de sortie et une ligne sur la sortie d’erreur que quelqu’un doit lire.

| Bibliothèque | Langage | Idéale pour | Capacité clé | Licence |
| --- | --- | --- | --- | --- |
| Turndown | JavaScript | Le contrôle élément par élément sur du HTML bizarre | `addRule`, `keep`, `remove`, et trois options de remplacement | Gratuit, MIT |
| turndown-plugin-gfm | JavaScript | Tableaux, texte barré et listes de tâches dans Turndown | `gfm`, `tables`, `strikethrough`, `taskListItems` | Gratuit, MIT |
| node-html-markdown | TypeScript | Le volume, et les environnements sans DOM | Embarque `node-html-parser` ; un traducteur par élément | Gratuit, MIT |
| html-to-md | JavaScript | Un convertisseur qui n’est qu’un détail dans un bundle | Zéro dépendance ; `skipTags` et `aliasTags` | Gratuit, MIT |
| html2text | Python | Une sortie texte lisible depuis un script ou un shell | Commande et bibliothèque ; `--backquote-code-style`, `--body-width` | Gratuit, GPLv3 |
| Pandoc | Binaire Haskell | Du HTML qui doit devenir plus que du Markdown | `-f html -t gfm`, lit l’entrée standard | Gratuit, GPL |

Deux des six ne sont pas vraiment en compétition. `turndown-plugin-gfm` fait partie de Turndown pour toute entrée réaliste, parce que le HTML sans tableaux est assez rare pour que traiter la prise en charge des tableaux comme optionnelle soit une décision que vous finirez par annuler. Et Pandoc n’est pas une bibliothèque du tout dans ce contexte ; c’est un processus, et le coût de son usage se mesure en lancements de processus plutôt qu’en octets de bundle.

## Turndown en détail : règles, keep, remove et les remplacements spéciaux

Turndown convertit une chaîne HTML ou un nœud du DOM — un élément, un document ou un fragment de document — en Markdown. Cette souplesse d’entrée est le premier détail pratique : dans une extension de navigateur, vous pouvez lui passer un élément vivant plutôt que de sérialiser la page et de la réanalyser, ce qui économise une copie du document et préserve ce que les scripts de la page ont déjà modifié.

Tout le reste de Turndown est son système de règles, et il vaut donc la peine de comprendre comment une règle est choisie avant d’en écrire une.

### Comment Turndown choisit une règle

Les règles sont essayées dans un ordre fixe, et cet ordre explique la plupart des sorties surprenantes :

1. La **règle blank**, qui l’emporte sur toutes les autres.
2. Les **règles ajoutées**, dans l’ordre où vous les avez ajoutées.
3. Les **règles CommonMark** intégrées.
4. Les règles **keep**.
5. Les règles **remove**.
6. La **règle par défaut**.

Deux conséquences en découlent immédiatement. D’abord, vos propres règles battent les règles intégrées : vous n’avez donc jamais à forker quoi que ce soit pour changer la façon dont `<a>` ou `<pre>` est émis — vous ajoutez une règle avec le même filtre et elle gagne. Ensuite, la règle blank bat la vôtre. Un nœud est blank s’il ne contient que des espaces et n’est ni un `<a>`, ni un `<td>`, ni un `<th>`, ni un élément vide. Donc si votre règle vise `<div class="spacer">` et que ce div est vide, votre règle ne s’exécute jamais, et la raison n’est pas dans votre code.

### addRule avec un nom de balise, une liste ou une fonction de filtre

`addRule(key, rule)` prend un nom — utilisé uniquement pour qu’un appel ultérieur puisse le remplacer — et un objet doté d’un `filter` et d’un `replacement`. Il renvoie le service, donc les appels se chaînent.

Le filtre a trois formes. Une chaîne correspond à un nom de balise. Un tableau correspond à plusieurs noms de balises. Une fonction reçoit le nœud et les options et renvoie un booléen, et c’est là que se fait le vrai travail.

```js
import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
  strongDelimiter: '**',
  linkStyle: 'inlined',
});

// A string filter: one tag.
turndown.addRule('figcaption', {
  filter: 'figcaption',
  replacement: (content) => `\n\n_${content.trim()}_\n\n`,
});

// An array filter: several tags, one handler.
turndown.addRule('smallprint', {
  filter: ['small', 'cite'],
  replacement: (content) => content,
});

// A function filter: the only form that can see attributes.
turndown.addRule('warning', {
  filter: (node) =>
    node.nodeName === 'DIV' &&
    (node.getAttribute('class') || '').includes('warning'),
  replacement: (content) =>
    `\n\n> **Warning**\n>\n> ${content.trim().replace(/\n/g, '\n> ')}\n\n`,
});
```

La signature de `replacement` est `(content, node, options)`. `content` est le Markdown déjà converti des enfants, et c’est la partie que les gens comprennent de travers : on ne vous remet pas le HTML interne, on vous remet le résultat de sa conversion, vous ne pouvez donc pas réexaminer la structure interne depuis votre propre remplacement. S’il vous faut la structure, regardez `node` ; s’il vous faut le texte, regardez `content`.

La fonction de filtre est aussi la réponse au besoin réel le plus courant de tous : un nom de classe porte un sens pour lequel Markdown n’a aucun vocabulaire. Un `<div class="warning">` devient un paragraphe ordinaire sous toutes les valeurs par défaut de cet article, et le lecteur perd le seul signal indiquant que ce paragraphe-là est celui qui compte. On peut demander à Turndown de le faire correspondre à une citation en bloc. Cela fait une règle par classe, écrite par vous, par site — et c’est encore le correctif le moins cher disponible.

### Les options, et les deux qui changent réellement la sortie

L’objet d’options couvre `headingStyle` (`setext` ou `atx`), `hr`, `bulletListMarker` (`-`, `+` ou `*`), `codeBlockStyle` (`indented` ou `fenced`), `fence` (trois accents graves ou `~~~`), `emDelimiter` (`_` ou `*`), `strongDelimiter` (`**` ou `__`), `linkStyle` (`inlined` ou `referenced`), `linkReferenceStyle` (`full`, `collapsed` ou `shortcut`) et `preformattedCode`.

La plupart relèvent du style de la maison et rien ne casse dans un sens ou dans l’autre. Deux font exception :

- `codeBlockStyle: 'fenced'` est celle à régler délibérément. Les blocs de code indentés ne peuvent pas porter de langage : un bloc indenté perd donc la coloration à l’arrivée et ne se distingue pas d’un élément de liste profondément indenté pour un analyseur peu regardant.
- `linkStyle: 'referenced'` déplace toutes les URL au bas du document. Pour une page contenant quarante liens en ligne, c’est la différence entre de la prose lisible et un mur de crochets — et pour un fichier destiné au contrôle de version, c’est la différence entre un diff lisible et un diff qui ne l’est pas.

`preformattedCode` est la discrète. Elle décide si les espaces à l’intérieur des éléments `code` sont préservés plutôt que réduits, et si vous convertissez du HTML où l’indentation dans du code en ligne a un sens, la valeur par défaut vous surprendra.

### keep, remove, et pourquoi ce ne sont pas des contraires

`keep(filter)` et `remove(filter)` acceptent les mêmes trois formes de filtre qu’une règle, et font des choses très différentes.

```js
// Emit these as raw HTML, because Markdown has no equivalent.
turndown.keep(['iframe', 'sup', 'sub', 'kbd']);

// Delete these and everything inside them.
turndown.remove(['script', 'style', 'noscript', 'nav', 'footer']);
```

`keep` veut dire « mettre le HTML d’origine dans le Markdown ». Les éléments conservés de niveau bloc sont séparés du contenu environnant par des lignes vides, la sortie reste donc structurellement du Markdown valide. Ce qu’elle n’est pas, c’est portable : du HTML brut dans un fichier Markdown ne survit que si le moteur de rendu suivant autorise le HTML brut, et il est échappé en soupe de balises visible dans le cas contraire. Conserver un `<iframe>` est un pari sur la destination.

`remove` veut dire que l’élément et son contenu disparaissent. Rien n’est supprimé par défaut — voilà la partie qui mérite un pense-bête. Turndown ne retire pas `<script>` pour vous. Donnez-lui une page web enregistrée et le contenu des scripts arrive dans votre Markdown sous forme de texte, ce qui n’est pas un problème de sécurité en soi mais assurément un problème de sortie, et c’est la raison d’un grand nombre de rapports de bug du type « pourquoi y a-t-il du JavaScript dans mon Markdown ». Si le HTML vient d’un endroit que vous ne contrôlez pas, retirer les scripts et les styles est le minimum, et [ce que l’assainissement doit réellement couvrir](/blog/sanitising-markdown-safely) mérite une lecture avant de faire confiance au résultat d’une conversion, dans un sens comme dans l’autre.

Le point d’accroche de `keep` est `keepReplacement`, une fonction de remplacement comme une autre : vous pouvez donc décider qu’un élément conservé est enveloppé, indenté ou annoté plutôt qu’émis tel quel.

### blankReplacement, et le problème du paragraphe vide

`blankReplacement` est l’option qui résout la catégorie la plus agaçante de mauvais HTML : l’élément vide qu’un système de gestion de contenu insère pour espacer. La règle blank attrape ces nœuds avant toute autre règle, et son remplacement décide de ce qu’ils deviennent.

Le comportement par défaut conserve la séparation des blocs : un nœud vide de niveau bloc produit tout de même un saut de paragraphe, un nœud vide en ligne ne produit rien. C’est généralement juste, et c’est parfois la cause exacte d’un document criblé de trous.

```js
const turndown = new TurndownService({
  // Drop empty blocks entirely instead of leaving a paragraph break.
  blankReplacement: () => '',
});
```

Le coût est réel et vous devriez le connaître avant de régler cela : vous venez de supprimer le mécanisme qui séparait deux blocs dont le seul séparateur était un nœud vide. Sur du HTML bien structuré, cela ne change rien. Sur du HTML où un `<p>&nbsp;</p>` faisait le travail d’un saut de paragraphe, vous obtenez deux paragraphes collés l’un à l’autre. Convertissez un document représentatif des deux façons et lisez le résultat plutôt que de raisonner dessus.

`defaultReplacement` est la troisième des options spéciales et la moins employée. Elle se déclenche pour les éléments qu’aucune règle n’a captés, et par défaut elle émet le contenu textuel du nœud, séparé par des lignes vides si le nœud est de niveau bloc. La redéfinir est le moyen de découvrir ce que contient vraiment votre HTML : renvoyez une chaîne repère au lieu du contenu, convertissez, et cherchez le repère. Chaque occurrence est un élément qu’aucune de vos règles n’a traité.

### Le greffon GFM : tableaux, texte barré, listes de tâches

Le cœur de Turndown implémente CommonMark, et CommonMark n’a pas de tableaux. `turndown-plugin-gfm` fournit le reste.

```js
import TurndownService from 'turndown';
import { gfm, tables, strikethrough, taskListItems } from 'turndown-plugin-gfm';

const turndown = new TurndownService();

// Everything the plugin provides:
turndown.use(gfm);

// Or only what you want:
// turndown.use([tables, strikethrough, taskListItems]);
```

`use` accepte un greffon ou un tableau de greffons, et renvoie le service : il se chaîne donc avec `addRule`. La forme sélective compte plus qu’il n’y paraît : `tables` est la règle coûteuse du lot, et si vous savez que l’entrée ne contient pas de tableaux — messages de discussion, corps de commentaires, gestionnaires de collage d’éditeur — l’omettre retire toute une classe de cas limites de la sortie.

Ce que le greffon ne peut pas faire, c’est inventer une expressivité que Markdown n’a pas. Les tableaux GFM sont une grille plate de cellules simples : ni `rowspan`, ni `colspan`, ni contenu de bloc, ni tableau dans une cellule. [Ce qui survit réellement quand un tableau change de format](/blog/markdown-tables-that-survive-conversion) décrit la forme du problème, et cela vaut également pour toutes les bibliothèques d’ici.

### L’échappement, et la redéfinition dont il faut se méfier

Turndown échappe avec des barres obliques inverses les caractères de syntaxe Markdown présents dans le texte, pour qu’un astérisque littéral de la source ne devienne pas de l’emphase dans la sortie. Le texte à l’intérieur des éléments `code` en est dispensé, ce qui est correct et constitue aussi la frontière où se concentrent les plaintes : un nom de fichier comme `my_file_name.txt` en prose ordinaire ressort en `my\_file\_name.txt`, ce qui s’affiche correctement et a mauvaise mine dans le fichier brut.

`escape` est une méthode documentée et remplaçable, la tentation est donc évidente :

```js
// Do this only if you own both ends of the pipeline.
turndown.escape = (text) => text;
```

Cela produit du Markdown d’aspect propre qui veut dire autre chose que le HTML de départ. Les tirets bas deviennent de l’emphase, les traits d’union en début de ligne deviennent des éléments de liste, une ligne commençant par `#` devient un titre. Si le Markdown part directement dans un diff qu’un humain va lire et ne repasse jamais par un moteur de rendu, cela peut se défendre. S’il doit être rendu, c’est de la corruption de données sous une apparence soignée. Le correctif plus étroit — soustraire une classe de caractères de l’échappement par défaut plutôt que toutes — est presque toujours le bon calibre de changement.

**Pour qui est Turndown ?** Pour les développeurs JavaScript qui doivent maîtriser la sortie élément par élément : gestionnaires de collage d’éditeur, extensions de navigateur, importateurs lisant un CMS hérité. Son omniprésence est une vraie fonctionnalité, parce que lorsqu’une page se convertit mal, quelqu’un a en général déjà publié la règle.

## node-html-markdown : pas de DOM, un traducteur par élément

node-html-markdown est un convertisseur TypeScript dont le but affiché est le débit. Il dépend de `node-html-parser` et utilise le `DOMParser` natif quand il y en a un, ce que contrôle l’option `preferNativeParser`. C’est toute la différence d’architecture avec Turndown, et elle décide de trois choses : il tourne dans un worker ou une fonction serverless sans cale DOM, son profil mémoire sur un gros document est celui d’un arbre d’analyse plutôt que d’un DOM complet, et son API d’extension est la sienne plutôt que celle de Turndown.

```js
import { NodeHtmlMarkdown } from 'node-html-markdown';

// One-off:
const md = NodeHtmlMarkdown.translate(html);

// Reused — build the instance once, translate many times:
const nhm = new NodeHtmlMarkdown(
  {
    bulletMarker: '-',
    codeBlockStyle: 'fenced',
    strongDelimiter: '**',
    emDelimiter: '_',
    strikeDelimiter: '~~',
    maxConsecutiveNewlines: 2,
    keepDataImages: false,
    useInlineLinks: true,
  },
  {
    aside: { prefix: '> ', surroundingNewlines: 2 },
    button: { ignore: true },
    figcaption: { prefix: '_', postfix: '_' },
  }
);

const markdown = nhm.translate(html);
```

La méthode statique `translate(html, options?, customTranslators?, customCodeBlockTranslators?)` est commode et reconstruit tout à chaque appel. Si vous convertissez plus d’une poignée de documents, construisez l’instance une seule fois : c’est précisément la différence pour laquelle cette bibliothèque existe.

L’objet traducteur est l’endroit où node-html-markdown diverge le plus utilement de Turndown. Au lieu d’un filtre et d’un remplacement, un traducteur est une déclaration de champs, chacun faisant un travail : `prefix` et `postfix` encadrent le contenu, `content` fixe une sortie constante, `surroundingNewlines` ajoute des sauts de ligne avant et après (un booléen, ou un nombre par côté), `recurse: false` empêche tout examen des éléments enfants, `ignore` saute entièrement le nœud, `noEscape` désactive l’échappement pour cet élément, `preserveWhitespace` conserve les espaces tels quels, `preserveIfEmpty` visite le traducteur même quand l’élément est vide, `spaceIfRepeatingChar` insère une espace quand le premier caractère entrerait en collision avec le dernier écrit, `childTranslators` substitue une autre collection de traducteurs pour les enfants, et `postprocess` s’exécute une fois les nœuds internes rendus.

C’est cette dernière paire qui fait gagner son salaire à l’API. `postprocess` peut renvoyer `PostProcessResult.RemoveNode` pour écarter un nœud après avoir vu ce qu’il a rendu — soit la réponse à « supprimer cet élément s’il s’est avéré vide », décision impossible à prendre avec un filtre qui s’exécute avant la conversion. `childTranslators` permet à un `<table>` de traiter ses descendants sous d’autres règles que le reste du document, sans toucher à la configuration globale.

Les deux options à régler délibérément sont `maxConsecutiveNewlines`, qui est le contrôle des espaces que les autres bibliothèques JavaScript n’exposent pas directement, et `keepDataImages`. Une page contenant des images base64 en ligne produira sinon un fichier Markdown où une seule ligne d’image est plus longue que tout le reste du document réuni.

**Pour qui ?** Pour la conversion en masse, et pour tout environnement d’exécution dépourvu de DOM : un worker, une fonction en périphérie, un consommateur de file digérant un crawl. C’est aussi le moteur du convertisseur de ce site, exactement pour cette raison — le même chemin de code dans un onglet de navigateur et sur un serveur.

## html-to-md : la petite, et les options qui font le travail

html-to-md est un convertisseur JavaScript sans dépendances, doté d’une seule fonction exportée. Son API tient en trois arguments et aucune instance :

```js
import html2md from 'html-to-md';

const markdown = html2md(html, {
  skipTags: ['div', 'section', 'nav', 'footer', 'aside', 'header', 'main'],
  ignoreTags: ['script', 'style', 'svg', 'noscript', 'head', 'meta', 'form'],
  aliasTags: { figure: 'p', figcaption: 'p', dl: 'p', dt: 'p', dd: 'p' },
});
```

Les deux options à comprendre sont `skipTags` et `ignoreTags`, parce qu’elles se ressemblent à l’oreille et font des choses opposées à votre contenu. `skipTags` omet la balise de la conversion et garde ce qu’elle contient — c’est ce que vous voulez pour `<div>` et `<section>`, éléments qui portent de la mise en page et aucun sens. `ignoreTags` jette la balise et tout son contenu interne, ce que vous voulez pour `<script>`, `<style>` et `<svg>`. Inversez-les et vous supprimez l’article ou vous y collez une feuille de style.

Les valeurs par défaut sont exceptionnellement tranchées, d’une façon qui épargne du travail : `skipTags` contient déjà les éléments structurels — `div`, `html`, `body`, `nav`, `section`, `footer`, `main`, `aside`, `article`, `header` — et `ignoreTags` contient déjà `style`, `head`, `script`, `meta`, `svg`, `noscript` et `form`. Telle quelle, elle est plus près de rendre lisible une page enregistrée que les autres bibliothèques JavaScript, ce qui est l’inverse de l’arbitrage habituel pour une petite dépendance.

`aliasTags` fait correspondre une balise à un gestionnaire qui existe déjà, et c’est la porte de sortie d’une liste de balises prises en charge, par opposition à un système de règles. La bibliothèque documente ce qu’elle traite : `a`, `b`, `blockquote`, `code`, `del`, `em`, `h1` à `h6`, `hr`, `i`, `img`, `input`, `li`, `ol`, `p`, `pre`, `s`, `strong`, `table`, `tbody`, `td`, `th`, `thead`, `tr`, `ul`. Tout ce qui sort de cette liste réclame un alias, un saut, ou `renderCustomTags` pour décider du sort des éléments inconnus. `tagListener` vous remet une balise à traiter vous-même, et la priorité des options est documentée ainsi : `skipTags` avant `emptyTags` avant `ignoreTags` avant `aliasTags`, ordre dans lequel il faut raisonner quand deux de vos listes mentionnent le même élément.

Le troisième argument de `html2md` décide si vos tableaux remplacent purement et simplement les valeurs par défaut au lieu d’être fusionnés avec elles. C’est un interrupteur plus important qu’il n’y paraît : passez `skipTags: ['div']` sans lui et vous dépendez peut-être encore de neuf autres valeurs par défaut que vous n’avez jamais lues.

**Pour qui ?** Pour du code frontal où la taille du bundle est une contrainte réelle, et pour du HTML qui se tient raisonnablement bien. Ce n’est explicitement pas l’outil pour du balisage mal imbriqué ou malformé : la bibliothèque indique elle-même qu’elle attend du HTML valide, et elle n’a pas d’analyseur DOM derrière elle pour réparer le désordre.

## Hors du JavaScript : html2text et Pandoc

### html2text, pour Python et pour une sortie que l’on lit

html2text est une bibliothèque Python dotée d’une interface en ligne de commande. Son but est un texte lisible qui se trouve être du Markdown valide, et ses valeurs par défaut reflètent cette priorité plutôt que la fidélité.

```bash
html2text --backquote-code-style --body-width=0 --pad-tables page.html > page.md
```

```python
import html2text

h = html2text.HTML2Text()
h.body_width = 0             # no hard wrapping
h.backquote_code_style = True  # fenced code blocks
h.ignore_images = True
h.escape_snob = False

markdown = h.handle(html)
```

Trois options portent l’essentiel de la différence entre une sortie utilisable et une sortie qui ne l’est pas.

`--backquote-code-style` est l’option importante pour quiconque convertit des documents techniques : elle produit des blocs de code multilignes dans le style à trois accents graves. Sans elle, vous dépendez des blocs indentés, ou de `--mark-code`, qui marque les blocs de code avec des délimiteurs littéraux `[code]` et `[/code]` — utile si vous post-traitez, mauvais si un humain doit lire le fichier.

`--body-width` fixe le nombre de caractères par ligne de sortie et accepte `0` pour ne pas couper. C’est l’option qui décide si le Markdown se compare bien en diff. Une prose coupée en dur signifie qu’une modification d’un mot recoupe le paragraphe et que le diff affiche cinq lignes changées. Mettez-la à zéro pour tout ce qui part dans un contrôle de version.

Pour les tableaux il y a trois positions distinctes : `--pad-tables` complète les cellules à largeur de colonne égale, `--bypass-tables` met les tableaux en HTML plutôt qu’en syntaxe Markdown, et `--ignore-tables` ignore les balises de tableau tout en gardant les lignes. La dernière mérite d’être connue parce qu’elle est la réponse honnête pour les tableaux employés comme mise en page plutôt que comme données : vous gardez le contenu et abandonnez la grille.

Deux autres méritent une ligne. `--reference-links` emploie des liens par référence au lieu de liens en ligne, et `--protect-links` entoure les liens de chevrons pour que la coupure de ligne ne puisse pas les briser. `--escape-all` échappe tous les caractères spéciaux : moins lisible, et cela évite les échecs de mise en forme dans les cas limites.

La licence est ce qu’il faut vérifier en premier, pas en dernier. html2text est sous GPLv3, ce que certains projets ne peuvent pas accepter.

**Pour qui ?** Pour du code Python produisant du texte destiné à des humains ou à un index : résumés, corps de notifications, parties texte brut de courriels, corpus pour un moteur de recherche. S’il vous faut une copie structurelle fidèle plutôt qu’une copie lisible, vous êtes du mauvais côté de l’arbitrage.

### Pandoc en sous-processus

Pandoc n’est pas une bibliothèque que l’on importe ; c’est un binaire que l’on lance. Dans le sens HTML vers Markdown, l’invocation est courte :

```bash
pandoc -f html -t gfm --wrap=none input.html -o output.md

# or read standard input, which is what you want from code
cat input.html | pandoc -f html -t gfm --wrap=none
```

Depuis Node, passez les arguments sous forme de tableau : aucun shell n’intervient et le HTML n’a jamais à être mis entre guillemets.

```js
import { execFileSync } from 'node:child_process';

const markdown = execFileSync(
  'pandoc',
  ['-f', 'html', '-t', 'gfm', '--wrap=none'],
  { input: html, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }
);
```

Depuis Python :

```python
import subprocess

markdown = subprocess.run(
    ["pandoc", "-f", "html", "-t", "gfm", "--wrap=none"],
    input=html,
    capture_output=True,
    text=True,
    check=True,
).stdout
```

Quatre aspects de ce motif méritent d’être décidés délibérément.

**Le processus est le coût.** Une conversion est gratuite. Dix mille conversions font dix mille lancements de processus, chacun avec son propre démarrage, et c’est le point à partir duquel une bibliothèque en processus l’emporte, quelle que soit la qualité de la sortie de Pandoc. Regroupez le travail en moins d’appels, ou prenez une bibliothèque.

**`maxBuffer` et le tube sont de vraies limites.** Un gros document renvoyé par un tube doit tenir dans le tampon que vous avez autorisé. La valeur par défaut de Node n’est pas généreuse, et le mode de défaillance est un document tronqué plutôt qu’une exception que vous remarqueriez en test.

**Ne construisez jamais la commande sous forme de chaîne.** Passer un tableau, comme ci-dessus, signifie que le HTML voyage sur l’entrée standard et qu’aucun shell n’en interprète quoi que ce soit. Construire `pandoc ... "${html}"` par interpolation, c’est une injection de commande qui attend le premier document contenant un accent grave.

**Vérifiez le code de sortie.** `check=True` en Python et le comportement d’exception sur code non nul de `execFileSync` font un travail nécessaire. Un sous-processus qui échoue en silence vous donne un fichier vide, et un fichier vide ressemble à un document sans contenu plutôt qu’à une erreur.

La raison d’accepter tout cela, c’est `-t gfm` et tout ce qui se trouve en aval. Pandoc lit du HTML et écrit vers une longue liste d’autres formats : le même pipeline qui produit du Markdown peut produire du DOCX, du LaTeX ou de l’EPUB depuis la même source, et `--sandbox` restreint l’accès au système de fichiers quand l’entrée n’est pas la vôtre. `--wrap=none` compte pour la même raison que `--body-width=0` dans html2text.

**Pour qui ?** Pour les chaînes de build, les travaux planifiés, et tout projet où Markdown n’est qu’une sortie parmi plusieurs. Pas pour une conversion par requête dans un service web.

## Tableaux, blocs de code, listes imbriquées et espaces

C’est le comparatif qui décide les vrais projets, et ce n’est pas celui que les README des bibliothèques mettent en avant.

| Point | Turndown | node-html-markdown | html-to-md | html2text | Pandoc |
| --- | --- | --- | --- | --- | --- |
| Tableaux | Greffon requis (`tables` ou `gfm`) | Assurés par les traducteurs par défaut | `table`, `thead`, `tbody`, `tr`, `th`, `td` pris en charge | Tableaux Markdown, plus `--pad-tables`, `--bypass-tables`, `--ignore-tables` | Tableaux à barres verticales avec `-t gfm` |
| Blocs de code | `codeBlockStyle: 'fenced'`, langage lu dans une classe `language-*` | `codeBlockStyle`, plus des traducteurs propres aux blocs de code | `pre` et `code` dans la liste des balises prises en charge | Indentés par défaut ; `--backquote-code-style` pour les clôtures | Clôturés, avec le langage quand la classe l’indique |
| Listes imbriquées | Indente le contenu imbriqué, décalage du marqueur compris | Assurées par les traducteurs de listes | `ul`, `ol`, `li` pris en charge | Assurées, coupure contrôlée par `--wrap-list-items` | Assurées |
| Espaces | Réduits ; `preformattedCode` pour `code` | `maxConsecutiveNewlines`, `preserveWhitespace` par traducteur | Non exposés directement | `--body-width`, `--single-line-break` | `--wrap=none` |
| Tourne dans un navigateur | Oui, et accepte un nœud vivant du DOM | Oui, `DOMParser` natif quand il est disponible | Oui, via un bundler | Non | Non |
| Analyseur | Un DOM (`@mixmark-io/domino` sous Node) | `node-html-parser` | Le sien, sans dépendances | Celui de Python | Le lecteur HTML de Pandoc |

Quatre remarques pour lire ce tableau.

**Les tableaux sont une décision de greffon, pas une case de fonctionnalité.** Turndown sans `turndown-plugin-gfm` ne dégrade pas discrètement un tableau en quelque chose de lisible : vous obtenez le texte des cellules collé à la prose environnante, ce qui a l’air d’un convertisseur qui perd vos données parce que c’est exactement ce qui se passe. C’est la surprise Turndown la plus courante et elle s’évite entièrement en une ligne.

**Les blocs de code dépendent du nom de classe, pas de la balise.** Tous les colorateurs syntaxiques émettent un bloc de code sous la forme `<pre><code class="language-python">` enveloppant un nid de `<span>` par jeton. Un convertisseur qui lit la classe vous donne une clôture annotée et la coloration à l’arrivée ; un convertisseur qui ne la lit pas vous donne une clôture nue et une perte que vous ne remarquerez qu’à la publication. [Ce qu’il faut à un bloc de code pour survivre à une conversion](/blog/code-blocks-in-markdown) tient en une courte liste, et la classe de langage en est la tête.

**L’indentation des listes imbriquées est l’endroit où les fichiers cessent d’être portables.** Les analyseurs Markdown ne s’accordent pas sur la quantité d’indentation qui fait une liste enfant plutôt qu’un bloc de code, et un convertisseur qui indente le contenu imbriqué autrement que ne l’attend votre moteur de rendu produit un document correct à un endroit et faux à un autre. Convertissez une liste à trois niveaux et ouvrez le résultat dans le moteur qui publiera réellement.

**Les espaces sont un problème de diff avant d’être un problème d’apparence.** Toutes les cinq produiront quelque chose qu’un navigateur affiche à l’identique. Seules certaines produisent quelque chose où la modification d’une phrase se traduit par un diff d’une ligne. Si le Markdown part dans un dépôt, le contrôle des espaces — `--wrap=none`, `--body-width=0`, `maxConsecutiveNewlines` — n’est pas une configuration cosmétique.

## Là où la réponse évidente échoue

La réponse évidente en JavaScript est Turndown, et c’est le bon choix par défaut. Voici où lui, et toute la catégorie, cessent de suffire.

**Une bibliothèque convertit ce que vous lui donnez, et une page enregistrée n’est pas l’article, pour l’essentiel.** Aucun de ces outils n’a d’étape d’extraction. Donnez à n’importe lequel une page d’actualité enregistrée et vous obtiendrez le bandeau, la navigation, l’avis sur les cookies, l’invitation à s’abonner, la liste des articles liés et un pied de soixante liens, fidèlement traduits en Markdown, avec l’article quelque part au milieu. `remove` et `skipTags` aident ; ce ne sont pas des extracteurs de contenu. Si l’entrée est constituée de pages entières, il vous faut quelque chose qui trouve d’abord l’article, et [enregistrer une page web en Markdown](/blog/save-a-web-page-as-markdown) est un autre métier avec d’autres outils.

**La configuration est du code, et le code est un coût de maintenance.** Trente règles qui font correspondre les noms de classe d’un site à des constructions Markdown forment un petit programme. Cela fonctionne jusqu’à la refonte du site, moment où les noms de classe changent et où votre convertisseur cesse silencieusement de reconnaître les encadrés. Personne ne s’en aperçoit, parce que la sortie reste du Markdown valide. Les jeux de règles arrimés au balisage de quelqu’un d’autre ont une date de péremption qui n’est écrite nulle part.

**Le DOM est un coût mémoire que vous n’aviez pas budgété.** L’analyse d’un gros document par Turndown est un DOM complet, donc un objet nœud pour chaque élément et chaque suite de texte, plutôt que les octets que vous lui avez remis. C’est sans conséquence sur un portable et c’est exactement le genre de chose qui échoue dans un environnement de fonction contraint — et cela échoue sur les plus gros documents du corpus plutôt que sur les premiers, donc un import peut tourner tranquillement longtemps avant de casser. Mesurez avec votre plus grosse entrée réelle plutôt qu’avec une entrée représentative.

**L’échappement produit une sortie correcte qui a l’air fausse.** Toutes les bibliothèques échappent la ponctuation Markdown dans le texte, parce qu’elles le doivent. Le résultat est `my\_file\_name.txt` et `1\. Introduction`, qui s’affichent correctement et se lisent mal pour quiconque ouvre le fichier brut. Si un humain doit relire le Markdown, il ouvrira un ticket contre votre convertisseur, régulièrement. Ce n’en est pas un, et le lui dire n’aide pas.

**Rien ici n’assainit.** Turndown ne supprime aucun élément par défaut. Le métier d’un convertisseur est la traduction, pas la sécurité, et un Markdown qui transporte du HTML brut — parce que vous avez utilisé `keep`, ou parce que la bibliothèque émet du HTML brut pour ce que Markdown ne peut pas exprimer — est un Markdown qui peut transporter une balise `<script>` jusqu’au moteur de rendu suivant. Le coût d’une erreur ici n’est pas un fichier laid.

**Et l’aller-retour n’est pas un aller-retour.** Convertir du HTML en Markdown puis revenir ne rend pas le HTML de départ, dans aucune de ces bibliothèques, jamais. Mise en page, classes, identifiants, styles en ligne, cellules fusionnées, formulaires et contenus embarqués n’ont aucune représentation Markdown. Si quelqu’un attend du HTML en entrée et un HTML équivalent en sortie, corrigez cette attente avant d’écrire du code, parce qu’aucune configuration ne l’atteint.

## Comment choisir une bibliothèque

1. **Partez de l’endroit où le code s’exécute, parce que cela élimine des options avant toute fonctionnalité.** Un worker ou une fonction en périphérie sans DOM écarte la voie fondée sur le DOM ; un bundle navigateur sous contrainte de taille écarte tout ce qui traîne un arbre d’analyse derrière lui ; un script de build n’écarte rien et peut appeler Pandoc.
2. **Décidez si vous avez besoin de règles élément par élément, et soyez honnête.** Si le HTML est produit par un seul système que vous contrôlez, les valeurs par défaut suffisent probablement et l’API de règles de Turndown est une complexité dont vous ne vous servirez pas. Si le HTML vient de sources multiples avec des noms de classe porteurs de sens, cette API est la raison entière de le choisir.
3. **Convertissez votre pire document avant de vous engager, pas le plus simple.** Prenez la page avec un tableau, un bloc de code coloré, une liste à trois niveaux et un encadré. Ce qui préserve ces quatre-là préserve à peu près tout le reste, et vous le saurez en dix minutes plutôt qu’après deux cents documents.
4. **Réglez les options de coupure et d’espaces dès le premier jour.** `--wrap=none`, `--body-width=0`, `maxConsecutiveNewlines` : les choisir après avoir converti le corpus revient à le convertir deux fois, parce que recouper change chaque ligne de chaque fichier et enterre les vraies modifications.
5. **Vérifiez la licence contre votre projet avant de vérifier les fonctionnalités.** html2text est sous GPLv3 et Pandoc sous GPL ; Turndown, node-html-markdown et html-to-md sont sous MIT. Pour une bibliothèque que vous embarquez dans un produit, cette différence fixe la liste restreinte quelle que soit la qualité de la sortie.
6. **Écrivez ce qui arrive à ce que Markdown ne peut pas exprimer.** Supprimé, conservé en HTML brut, ou approché par une règle que vous avez écrite : choisissez délibérément, par classe d’éléments. Laissé indécidé, c’est la bibliothèque qui choisit pour vous, et elle choisit différemment dans chacune des cinq.

## Conclusion

Il n’existe pas de meilleure bibliothèque HTML vers Markdown, seulement un plus court chemin entre votre entrée et le fichier dont vous avez besoin. En JavaScript, commencez par Turndown et le greffon GFM, et ne sortez son API de règles que lorsqu’un nom de classe porte du sens ; passez à node-html-markdown quand il n’y a pas de DOM ou que le volume est réel ; choisissez html-to-md quand le convertisseur n’est qu’un détail dans un bundle. En Python, html2text si la sortie est faite pour être lue et si sa licence GPLv3 est acceptable. Appelez Pandoc quand Markdown n’est pas le dernier format que le document doit prendre. Et quand le travail porte sur un fichier plutôt que sur un pipeline, une bibliothèque est une réponse de la mauvaise forme — [la conversion HTML vers Markdown de TransformPipe](/html-to-markdown) s’exécute dans le navigateur, sans rien téléverser ni rien installer, ce qui est une route plus rapide vers le même Markdown que n’importe quel `npm install`.

## FAQ

### Quelle est la meilleure bibliothèque HTML vers Markdown pour JavaScript ?

Turndown, pour la plupart des projets : elle tourne dans le navigateur comme sous Node, et son API de règles permet de redéfinir le traitement de n’importe quel élément sans forker la bibliothèque. Ajoutez `turndown-plugin-gfm` sauf si vous êtes certain que l’entrée ne contient aucun tableau. Prenez plutôt node-html-markdown quand il n’y a pas de DOM disponible ou que vous convertissez en masse.

### Turndown prend-il en charge les tableaux ?

Pas dans son cœur, qui implémente CommonMark, et CommonMark n’a pas de tableaux. `turndown-plugin-gfm` les ajoute, avec le texte barré et les éléments de liste de tâches ; `turndownService.use(gfm)` active les trois, ou vous pouvez importer `tables` seul. Sans le greffon, le texte des cellules d’un tableau est collé à la prose environnante.

### Comment faire ignorer un élément à Turndown ?

`remove(filter)` supprime l’élément et son contenu, et accepte un nom de balise, un tableau de noms de balises ou une fonction de filtre. Rien n’est supprimé par défaut, donc `remove(['script', 'style', 'noscript'])` mérite d’être ajouté à tout convertisseur qui traite du HTML que vous n’avez pas écrit. Employez plutôt `keep(filter)` quand vous voulez le HTML d’origine dans la sortie plutôt que rien.

### À quoi sert blankReplacement dans Turndown ?

Elle décide du sort des nœuds qui ne contiennent que des espaces — les paragraphes vides qu’un système de gestion de contenu laisse derrière lui. La règle blank s’exécute avant toutes les autres, y compris les vôtres, donc un élément vide n’atteint jamais une règle que vous avez écrite. Régler `blankReplacement: () => ''` supprime ces trous, au prix de la séparation des blocs là où un nœud vide était la seule chose à l’assurer.

### Quelles bibliothèques HTML vers Markdown tournent dans un navigateur ?

Turndown, node-html-markdown et html-to-md le font toutes les trois. Turndown accepte un élément vivant du DOM plutôt qu’une chaîne, ce qui explique que les extensions de navigateur l’emploient. html2text est en Python et Pandoc est un binaire : ni l’un ni l’autre ne tourne côté client. Convertir dans le navigateur sans étape de build veut donc dire l’une des trois bibliothèques JavaScript, ou [une page de conversion qui en embarque déjà une](/blog/best-html-to-markdown-converters).

### À quoi sert --backquote-code-style dans html2text ?

Elle fait employer aux blocs de code multilignes des clôtures à trois accents graves au lieu de l’indentation. Sans elle, vous obtenez des blocs indentés, qui ne peuvent porter aucune annotation de langage, ou des marqueurs `[code]` si vous avez passé `--mark-code`. Associez-la à `--body-width=0` pour que le code ne soit pas coupé en dur à la longueur de ligne par défaut.

### Vaut-il la peine d’appeler Pandoc depuis du code plutôt que d’utiliser une bibliothèque ?

Oui quand Markdown n’est pas la seule sortie — le même appel peut produire du DOCX, du LaTeX ou de l’EPUB à partir du même HTML — et non quand vous convertissez à la requête. Chaque conversion est un lancement de processus, donc le débit est mauvais face à une bibliothèque en processus. Passez les arguments sous forme de tableau et le HTML sur l’entrée standard, jamais dans une chaîne shell interpolée.
