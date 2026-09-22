---
title: "CommonMark contre GFM : ce que gère chaque moteur, en un tableau"
description: "Ce que CommonMark a fixé, les cinq extensions ajoutées par GFM, ce qui n’est dans aucun des deux, et dix moteurs alignés pour prévoir où cela casse."
date: 2026-08-18
tag: Syntaxe
keywords: commonmark, commonmark ou markdown, github flavored markdown, gfm, gfm ou commonmark, dialectes markdown, spécification markdown, extensions markdown
---

Collez un même fichier dans trois outils et vous pouvez obtenir trois documents. L’un dessine un tableau, l’autre affiche une rangée de barres verticales. L’un transforme un simple retour à la ligne en saut de ligne, l’autre replie les lignes en un paragraphe. Rien n’est cassé et rien n’est mal configuré. Les outils parlent des dialectes différents, « Markdown » nomme la famille plutôt qu’un membre en particulier, et savoir lequel de ces membres vous écrivez constitue l’essentiel de la solution.

### En bref

CommonMark est une spécification accompagnée d’une suite de tests : elle tranche les querelles autour de la syntaxe d’origine et s’arrête délibérément à un noyau, sans tableaux, sans listes de tâches, sans texte barré et sans liens automatiques pour les URL nues. GFM, c’est cette spécification plus exactement cinq extensions nommées — tableaux, éléments de liste de tâches, texte barré, liens automatiques, et un filtre qui échappe neuf balises HTML brutes — et c’est le dialecte que la plupart des gens désignent quand ils disent Markdown. Tout le reste de ce que vous avez vu dans un fichier `.md` — notes de bas de page, listes de définitions, listes d’attributs, mathématiques, encadrés, en-tête de métadonnées — ne figure dans aucune des deux spécifications et ne voyage pas plus loin que la liste d’extensions de l’outil suivant. Écrivez pour le lecteur le plus strict de la chaîne, et testez avec un fichier sonde plutôt qu’avec une intuition.

## Trois spécifications, et les années qui les séparent

John Gruber a publié Markdown en 2004 : une description de la syntaxe sur une page web, et `Markdown.pl`, un script Perl qui transformait cette syntaxe en HTML. La dernière version est la 1.0.1, datée du 17 décembre 2004 (vérifié sur daringfireball.net/projects/markdown, le 8 septembre 2026). La page et le script formaient ensemble la définition, et partout où la prose se taisait — ce qui arrivait souvent — ce que le script faisait devenait la réponse.

C’est très bien pour un blog, et douloureux pour la deuxième implémentation. La description ne dit jamais de combien d’espaces s’indente une liste imbriquée, ce qui se passe quand une emphase s’ouvre à l’intérieur d’un mot, comment une liste interagit avec la citation dans laquelle elle se trouve, ni si un saut de ligne forcé survit à la fin d’un paragraphe. Chaque implémenteur a deviné, et les intuitions divergeaient. En quelques années il y a eu des dizaines de bibliothèques, toutes appelées Markdown, aucune d’accord sur les cas tordus et toutes d’accord sur les cas faciles. La comparaison que les gens cherchent sous le nom de *commonmark ou markdown* est donc en réalité une comparaison entre une spécification et une description accompagnée d’un script.

CommonMark, publié pour la première fois en 2014, c’est cette spécification manquante enfin écrite. Elle définit les règles d’analyse en détail et livre des centaines de cas de test, chacun étant un extrait de Markdown à côté du HTML exact qu’il doit produire. Il n’existe pas de « à peu près CommonMark » : une implémentation passe la suite de tests ou elle ne la passe pas.

GFM a pris le problème par l’autre bout. GitHub avait un moteur de rendu avec des millions de fichiers pointés dessus et une liste d’ajouts dont ses utilisateurs dépendaient : il a donc écrit la spécification GitHub Flavored Markdown comme un sur-ensemble strict de CommonMark — le même document, avec cinq sections d’extension ajoutées. C’est pourquoi *commonmark ou gfm* a une réponse courte : même noyau, cinq ajouts nommés, aucune autre différence. Tout ce qui va au-delà de ces cinq-là est l’extension de quelqu’un, et les extensions sont l’endroit où les fichiers cessent de voyager.

## Ce que CommonMark a réellement tranché

Il est facile de lire CommonMark comme un Markdown plus court, à cause de ce qu’il laisse de côté. La valeur est dans ce qu’il fixe. Chacun des points ci-dessous était un vrai désaccord entre implémentations avant l’existence de la spécification, et chacun trouve désormais sa réponse en pointant un exemple numéroté.

- **L’indentation des listes.** Jusqu’où une liste enfant doit être indentée est défini par rapport à la colonne de contenu du parent, et non par un nombre fixe d’espaces. C’est pourquoi les marques `-` et `1.` se comportent différemment quand vous imbriquez dessous : elles n’ont pas la même largeur.
- **Listes lâches et listes serrées.** Une ligne vide entre deux éléments rend toute la liste lâche, ce qui enveloppe le texte de chaque élément dans un `<p>`. Une seule ligne vide égarée change l’espacement d’une liste à laquelle vous n’avez pas touché — la surprise la plus fréquente de toute la spécification, et qui a [ses propres modes de défaillance qu’il vaut la peine de lire](/blog/markdown-line-breaks-and-lists).
- **L’emphase.** Les règles de suites de délimiteurs à flanc gauche et à flanc droit remplacent l’ancien « ça dépend » pour les `mots_en_serpent`, `**gras**accolé`, et tous les mélanges d’astérisques et de traits de soulignement.
- **Les blocs de code clôturés.** Clôtures en backticks et en tildes, règles de la clôture fermante, et chaîne d’info. Le mot qui suit la clôture est une étiquette et rien de plus : [tout convertisseur en fait un nom de classe et s’arrête là](/blog/code-blocks-in-markdown).
- **Les sauts de ligne forcés.** Deux espaces en fin de ligne ou une barre oblique inverse. Un simple retour à la ligne est un espace. C’est une règle de la spécification, pas une préférence, et c’est la règle que le plus d’outils proposent de casser par une option.
- **Les blocs HTML.** Sept types distincts, chacun avec ses propres conditions de début et de fin, ce qui explique qu’un `<div>` avale parfois le Markdown qui le suit et parfois non.
- **Les définitions de liens de référence**, les références d’entités, l’expansion des tabulations à quatre colonnes, les séparateurs thématiques, les titres ATX et setext, et la continuation paresseuse des citations.

CommonMark s’arrête volontairement à ce noyau. Pas de tableaux, pas de notes de bas de page, pas de texte barré, pas de listes de tâches, pas de lien automatique sur les URL nues. Le raisonnement se défend : le noyau, c’est ce que tout le monde avait déjà en commun, et geler les querelles à son sujet était la mission. La conséquence est qu’un analyseur strictement conforme affiche votre tableau sous forme de paragraphe plein de barres verticales, en silence, et correctement.

## Ce que GFM ajoute, règle par règle

La spécification GFM nomme cinq extensions. Quatre ajoutent de la syntaxe ; une retire quelque chose. Chacune a des règles assez précises pour qu’on trébuche dessus, et les échecs sont toujours silencieux — un tableau qui n’est pas reconnu n’est que du texte.

**Les tableaux.** Une ligne d’en-tête, une ligne de délimitation, puis zéro ou plusieurs lignes de corps. La ligne de délimitation est faite de traits d’union avec des deux-points facultatifs : `:---` à gauche, `:---:` au centre, `---:` à droite. La règle qui piège les gens est que la ligne d’en-tête et la ligne de délimitation doivent contenir le même nombre de cellules ; si ce n’est pas le cas, le bloc n’est pas du tout un tableau et vous obtenez des barres verticales sur la page (vérifié sur github.github.com/gfm, le 8 septembre 2026). Les barres verticales de début et de fin sont facultatives. Les lignes de corps qui ont trop peu de cellules sont complétées par des cellules vides, et celles qui en ont trop sont tronquées. Les cellules ne portent que du contenu en ligne — pas de listes, pas de blocs clôturés, pas de second paragraphe dans une cellule — et une barre verticale littérale doit s’écrire `\|`, y compris dans un segment de code. Le tableau s’arrête à la première ligne vide ou au début d’un autre bloc. L’essentiel de ce qui tourne mal avec les tableaux lors d’une conversion vient de ces trois dernières règles, et [les tableaux méritent leur propre lecture](/blog/markdown-tables-that-survive-conversion).

**Les éléments de liste de tâches.** `[ ]`, `[x]` ou `[X]` comme toute première chose du premier paragraphe d’un élément de liste, suivi d’un espace. Il faut que ce soit un élément de liste : les mêmes crochets sur une ligne isolée sont des crochets littéraux. La sortie est une case à cocher `<input>` marquée `disabled`, ce qui explique qu’une liste de contrôle convertie paraisse grisée dans le navigateur — c’est le rendu spécifié, pas un bogue du convertisseur. Les vues de tickets et de demandes de fusion de GitHub les rendent cliquables via leur propre application, ce qui ne fait pas partie de la syntaxe.

**Le texte barré.** `~~texte~~`. Une rupture de paragraphe termine le segment, de la même façon qu’elle termine l’emphase. GitHub rend aussi un tilde unique, et toutes les implémentations de GFM ne le suivent pas sur ce point : écrivez-en deux si le fichier doit aller ailleurs.

**Les liens automatiques.** Une URL nue en `http://`, `https://` ou `www.`, et une adresse de courriel nue, deviennent des liens sans chevrons. Les règles sont plus étroites qu’elles n’en ont l’air. L’URL doit commencer en début de ligne ou suivre un espace ou l’un des caractères `*`, `_`, `~` et `(`. La ponctuation finale est retirée de la fin du lien plutôt qu’incluse. Une parenthèse fermante n’est incluse que si les parenthèses s’équilibrent, ce qui explique qu’une URL Wikipédia se terminant par `(disambiguation)` survive généralement et qu’une URL placée entre parenthèses perde généralement son dernier caractère. Un trait de soulignement n’importe où dans les deux derniers segments du domaine annule entièrement le lien automatique. Les liens automatiques entre chevrons, `<https://example.com>`, relèvent du noyau CommonMark et fonctionnent toujours — l’extension ne couvre que la forme nue.

**Le HTML brut interdit.** La soustraction. GFM échappe le `<` ouvrant de neuf noms de balises pour qu’ils atteignent la page en texte visible plutôt qu’en balisage : `title`, `textarea`, `style`, `xmp`, `iframe`, `noembed`, `noframes`, `script` et `plaintext` (vérifié sur github.com/github/cmark-gfm, le 8 septembre 2026). C’est une règle de sécurité du rendu qui appartient à GFM plutôt qu’à Markdown, et il vaut la peine d’être précis sur ce qu’elle n’est pas. Ce n’est pas un assainisseur. Elle filtre neuf noms de balises par liste ; elle ne fait rien contre un `onerror=` sur une `<img>`, rien contre un `javascript:` dans un `<a href>`, et rien contre un `<svg>` portant un gestionnaire. Si vous convertissez un fichier écrit par quelqu’un d’autre, [il vous faut toujours un véritable assainisseur à liste blanche](/blog/sanitising-markdown-safely) après l’analyseur.

Deux choses sont couramment réputées faire partie de GFM sans en faire partie. Les notes de bas de page ne sont pas dans la spécification, même si le site de GitHub les affiche. Les alertes `> [!NOTE]` non plus. Les deux sont des comportements d’un moteur de rendu, ajoutés après l’écriture de la spécification, et un analyseur qui revendique la conformité GFM n’a pas tort de les ignorer.

## Ce qui ne figure dans aucune des deux spécifications

Passé ces cinq extensions, le terrain cesse d’être commun. Tout ce qui suit est répandu, utile et non portable — chaque élément existe en plusieurs syntaxes, ou dans un seul outil.

- **Les notes de bas de page** — `[^1]` dans le texte, `[^1]:` en bas. GitHub les rend, Pandoc les rend, remark-gfm les rend, et un simple analyseur CommonMark imprime les crochets exactement tels qu’ils ont été tapés.
- **Les listes de définitions** — un terme, puis des lignes commençant par `:`. Héritées de PHP Markdown Extra. Pandoc, Python-Markdown, Goldmark et kramdown les ont ; le monde JavaScript, pour l’essentiel, non.
- **Les listes d’attributs** — `{#mon-id .warning}` après un titre ou un segment, pour fixer un identifiant, une classe ou un attribut quelconque. Intégrées à Pandoc et à kramdown, extension officielle dans Python-Markdown, greffon dans markdown-it, et absentes de marked.
- **Les mathématiques** — `$...$` en ligne et `$$...$$` en affichage, confiés à KaTeX ou MathJax sur la page. Chaque implémentation l’écrit différemment, et plusieurs ont besoin d’une option de passage direct pour que l’analyseur laisse le TeX tranquille au lieu d’avaler les traits de soulignement comme de l’emphase.
- **Les encadrés** — `> [!NOTE]` sur GitHub, `:::note` dans Docusaurus et plusieurs autres cadriciels, `!!! note` dans MkDocs, une liste d’attributs `{: .note}` dans Jekyll. Quatre syntaxes pour une seule idée, et aucune spécification pour aucune d’elles.
- **L’en-tête de métadonnées** — un bloc YAML clôturé par `---` tout en haut du fichier. Les générateurs de site le retirent et le lisent comme des métadonnées. Un convertisseur qui n’en a jamais entendu parler le rend comme du contenu, et le résultat est un filet horizontal suivi de vos métadonnées en titre, parce que `---` sous une ligne de texte est la syntaxe d’un titre setext.
- **Les ancres de titres** — les identifiants `#titre-de-section` qui font fonctionner un sommaire. Générés au rendu par GitHub, par tous les générateurs, et par un greffon ou une option dans la plupart des bibliothèques. Ce n’est pas du tout de la syntaxe, et l’algorithme de création des identifiants diffère d’un outil à l’autre : un lien croisé écrit à la main peut casser quand le moteur de rendu change.
- **Les plus petites** — abréviations, exposants et indices, codes emoji comme `:tada:`, liens wiki `[[Page]]`, mermaid traité comme un diagramme plutôt que comme un bloc de code, et la ponctuation intelligente qui transforme vos guillemets en guillemets courbes, que vous l’ayez voulu ou non.

## Comparatif rapide : les dialectes et les moteurs qui les parlent

| Nom | Idéal pour | Capacité principale | Prix |
| --- | --- | --- | --- |
| Markdown d’origine 1.0.1 | Référence historique | La page de syntaxe de 2004 plus `Markdown.pl` | Gratuit, licence de type BSD |
| CommonMark | Trancher une querelle sur l’analyse | Une spécification avec une suite de tests exécutable | Gratuit, spécification ouverte |
| GitHub Flavored Markdown | La cible par défaut pour tout ce qui est partagé | CommonMark plus cinq extensions nommées | Gratuit, spécification ouverte |
| markdown-it (JS) | La justesse, avec de la place pour étendre | Conforme à CommonMark, échappe le HTML brut par défaut | Gratuit, MIT |
| marked (JS) | GFM sans aucune configuration | GFM actif par défaut, un seul appel de fonction | Gratuit, MIT |
| remark / unified (JS) | Réécrire le document, pas seulement le rendre | Un AST plus remark-gfm et un vaste jeu de greffons | Gratuit, MIT |
| Le Markdown de Pandoc | Les documents qui ont besoin de notes et de mathématiques | Des extensions nommées que vous activez une à une | Gratuit, GPL |
| Python-Markdown | Les constructions Python et les sites MkDocs | Une API d’extensions officielle : tables, footnotes, attr_list | Gratuit, BSD |
| Goldmark (Go) | Les programmes Go et les sites Hugo | CommonMark plus un jeu d’extensions GFM livré avec | Gratuit, MIT |
| kramdown (Ruby) | Jekyll et GitHub Pages | Un sur-ensemble de Markdown avec listes d’attributs en ligne | Gratuit, MIT |
| MDX | Les sites de documentation avec composants | Du JSX dans du Markdown, compilé plutôt que rendu | Gratuit, MIT |

## Les dialectes et les implémentations, un par un

Ce qui suit ne concerne que le dialecte — quelles constructions chacun reconnaît et comment vous changez cela. Lequel choisir comme convertisseur est [une autre comparaison](/blog/best-markdown-to-html-converters), sur d’autres critères.

### Markdown d’origine 1.0.1 — l’ancêtre, pas une cible

La page de syntaxe et le script Perl de Gruber. C’est encore la raison pour laquelle un fichier `.md` autorise du HTML brut, et encore la source de comportements qui survivent dans des outils écrits bien après lui.

| Avantages | Inconvénients |
| --- | --- |
| La plus courte description de la syntaxe jamais écrite | Ambiguë exactement là où les implémentations divergent |
| Explique pourquoi le HTML brut passe par défaut | Ni tableaux, ni blocs de code clôturés, ni suite de tests |
| Toujours la référence de `markdown_strict` dans Pandoc | Non maintenu depuis la 1.0.1 |

**Prix :** gratuit, licence de type BSD.

**Détails techniques et fonctionnalités**

- Blocs de code indentés seulement — le code clôturé est arrivé avec les dialectes ultérieurs
- Les balises HTML brutes de niveau bloc passent intactes, et le Markdown qu’elles contiennent n’est pas analysé
- Emphase, liens, images, citations, titres ATX et setext, listes, filets horizontaux
- Aucune spécification de l’indentation des listes imbriquées, l’ambiguïté dont tout l’aval a hérité

**Pour qui ?** Personne, comme cible. Lisez-le pour comprendre pourquoi une construction se comporte comme elle le fait, et choisissez `markdown_strict` dans Pandoc si vous avez précisément besoin de savoir comment un fichier se serait rendu en 2004.

### CommonMark — le noyau auquel tout le reste se mesure

CommonMark, c’est la spécification plus `cmark`, son implémentation de référence en C. Son but est la conformité, pas les fonctionnalités, et sa retenue est la fonctionnalité.

| Avantages | Inconvénients |
| --- | --- |
| Chaque cas tordu a un exemple numéroté et une sortie attendue | Ni tableaux, ni listes de tâches, ni texte barré, ni liens automatiques nus |
| Des centaines de cas de test : la conformité est un fait, pas une affirmation | Un tableau se rend en paragraphe de barres verticales, en silence |
| Des implémentations existent pour la plupart des langages et visent la même suite | Délibérément aucun mécanisme d’extension dans la spécification elle-même |
| Le plancher le plus sûr pour écrire | La plupart des vrais documents ont besoin d’au moins une extension |

**Prix :** gratuit, spécification ouverte ; `cmark` est gratuit sous licence BSD-2-Clause.

**Détails techniques et fonctionnalités**

- Définit l’indentation des listes par rapport à la colonne de contenu du parent, mettant fin à la querelle des espaces
- Les suites de délimiteurs à flanc gauche et à flanc droit définissent précisément l’emphase
- Sept types de blocs HTML, chacun avec des conditions de début et de fin explicites
- Les sauts de ligne forcés sont deux espaces finaux ou une barre oblique inverse finale ; un retour à la ligne isolé est un espace
- Le HTML brut passe par défaut, ce qui est une décision de spécification et non de sécurité
- Parmi les implémentations compagnes, comrak en Rust ; markdown-it et Goldmark visent la même suite

**Pour qui ?** Quiconque a besoin de savoir ce que la syntaxe signifie plutôt que ce qu’un outil fait. Quand deux moteurs de rendu divergent, les exemples de la spécification décident lequel a le bogue — et s’y référer est plus souvent le bon réflexe qu’on ne l’imagine.

### GitHub Flavored Markdown — la valeur par défaut pratique

GFM, c’est CommonMark plus les tableaux, les listes de tâches, le texte barré, les liens automatiques et le filtre de HTML brut. C’est ce en quoi un README se rend, et ce que la plupart des gestionnaires de tickets et des outils de discussion ont copié.

| Avantages | Inconvénients |
| --- | --- |
| Une spécification écrite, pas seulement le comportement d’un moteur | Toujours ni notes de bas de page, ni listes de définitions, ni mathématiques, ni attributs |
| Couvre les constructions que les documents utilisent réellement | Le filtre de balises est souvent pris pour un assainisseur |
| Largement implémenté : un fichier GFM voyage généralement | Le site de GitHub rend des choses que la spécification ne définit pas |
| Un sur-ensemble strict de CommonMark : rien du noyau ne change | Les règles des liens automatiques nus sont plus pointilleuses qu’il n’y paraît |

**Prix :** gratuit, spécification ouverte.

**Détails techniques et fonctionnalités**

- Des tableaux avec alignement par colonne, contenu en ligne seulement, et ligne de délimitation concordante obligatoire
- Des éléments de liste de tâches rendus en cases à cocher `disabled`
- Du texte barré avec `~~` ; GitHub accepte aussi un tilde unique
- Des liens automatiques sur les URL et les courriels nus, avec des règles de ponctuation finale et de parenthèses équilibrées
- Neuf noms de balises HTML brutes échappés plutôt que transmis
- Les notes de bas de page et les alertes `> [!NOTE]` fonctionnent sur GitHub et ne sont pas dans la spécification

**Pour qui ?** Presque tout le monde, pour presque tout fichier partagé. Si un document doit se rendre sur GitHub, sur un site de documentation et en HTML converti, GFM est l’intersection que les trois comprennent.

### markdown-it — CommonMark d’abord, les extensions à la demande

Un analyseur JavaScript qui suit la spécification CommonMark et ajoute un peu par-dessus. Son propre résumé dit qu’il « ajoute des extensions de syntaxe et du confort (liens automatiques sur les URL, typographe) » (vérifié sur github.com/markdown-it/markdown-it, le 8 septembre 2026).

| Avantages | Inconvénients |
| --- | --- |
| Passe la suite CommonMark et livre un préréglage strict `commonmark` | Les listes de tâches et les notes de bas de page exigent des greffons |
| Échappe le HTML brut par défaut : le comportement sûr est celui par défaut | La qualité des greffons varie dans l’écosystème |
| Les règles peuvent être ajoutées, remplacées ou réordonnées au niveau bloc et en ligne | Les liens automatiques sont inactifs tant que vous ne les activez pas |

**Prix :** gratuit, sous licence MIT.

**Détails techniques et fonctionnalités**

- Trois préréglages : `commonmark` pour la conformité stricte, `default`, et `zero` pour construire à partir de rien
- Les tableaux et le texte barré sont actifs dans le préréglage par défaut ; `linkify` et `breaks` sont inactifs
- `html: false` par défaut — le HTML brut de la source est échappé, pas transmis
- Des greffons couvrent les notes de bas de page, les conteneurs pour encadrés, les attributs, les ancres, les listes de tâches et les mathématiques
- La surface de greffon est documentée : une extension peut s’écrire plutôt que se chercher

**Pour qui ?** Les équipes qui veulent que la spécification soit suivie par défaut et que chaque extension soit activée délibérément. C’est aussi le dialecte dont hérite une grande partie de l’outillage, dont l’aperçu Markdown intégré à VS Code.

### marked — GFM sans décision à prendre

Un petit analyseur et compilateur JavaScript dont le dialecte par défaut est déjà celui que la plupart des gens veulent.

| Avantages | Inconvénients |
| --- | --- |
| GFM actif par défaut : tableaux, texte barré, listes de tâches, liens automatiques | Pas d’écosystème de greffons digne de ce nom ; les extensions sont à votre charge |
| Une fonction, un objet d’options | Le HTML brut passe, par conception |
| Tourne dans le navigateur et dans Node | Notes de bas de page, listes de définitions et mathématiques indisponibles |

**Prix :** gratuit, sous licence MIT.

**Détails techniques et fonctionnalités**

- `gfm: true` par défaut ; `breaks: false` par défaut, donc un simple retour à la ligne est un espace
- `breaks: true` reproduit le comportement des boîtes de commentaires de GitHub plutôt que celui de ses README
- Un analyseur lexical que vous pouvez appeler séparément pour inspecter les jetons au lieu du HTML
- Des moteurs de rendu personnalisés redéfinissent la façon dont chaque type de nœud est émis, et c’est ainsi que se font la plupart des extensions
- Aucun assainissement : la réponse documentée est de passer la sortie dans DOMPurify

**Pour qui ?** Quiconque vise le GFM pur et n’a besoin de rien au-delà. C’est le chemin le plus court d’un fichier GFM à du HTML de forme GFM, et la raison pour laquelle tant de logiciels se comportent comme GitHub avec `breaks` mal réglé.

### remark et unified — le dialecte comme liste de greffons

remark analyse le Markdown en un arbre syntaxique abstrait. Le dialecte n’est pas un réglage ; c’est l’ensemble des extensions que vous avez ajoutées à la chaîne.

| Avantages | Inconvénients |
| --- | --- |
| remark-gfm couvre les cinq extensions GFM, plus les notes de bas de page | L’option la plus lourde ici, et de loin |
| L’en-tête de métadonnées, les mathématiques et les directives ont chacun un greffon de premier plan | La chaîne unified demande un vrai apprentissage |
| Le HTML brut est abandonné sauf autorisation explicite | Chaque extension est une dépendance à tenir à jour |

**Prix :** gratuit, sous licence MIT.

**Détails techniques et fonctionnalités**

- mdast pour le Markdown, hast pour le HTML, avec des greffons pour passer de l’un à l’autre
- remark-gfm ajoute d’un coup les tableaux, les listes de tâches, le texte barré, les liens automatiques et les notes de bas de page
- remark-frontmatter analyse l’en-tête YAML au lieu de le rendre comme un titre
- remark-directive donne les conteneurs `:::note`, et c’est ainsi que la plupart des syntaxes d’encadrés sont implémentées
- Faire passer le HTML brut exige `allowDangerousHtml` : le choix dangereux est donc explicite

**Pour qui ?** Les équipes qui ont besoin d’un dialecte que personne ne livre — GFM plus les notes de bas de page plus les directives plus une règle maison sur le texte des liens — et qui acceptent de l’assembler et de l’assumer.

### Le Markdown de Pandoc — un dialecte avec un tableau de bord

Pandoc lit plusieurs dialectes de Markdown ainsi que le sien, étendu, et chaque construction est une extension nommée que vous pouvez activer ou désactiver individuellement.

| Avantages | Inconvénients |
| --- | --- |
| Notes de bas de page, listes de définitions, attributs et mathématiques intégrés | Son dialecte n’est pas ce que rend GitHub, ce qui surprend |
| Plusieurs syntaxes de tableaux, dont les tableaux en grille à cellules multilignes | Les noms d’extensions forment un vocabulaire à apprendre |
| Les dialectes de lecture et d’écriture se choisissent séparément | Le HTML brut passe sans aucun assainissement |
| `markdown_strict`, `commonmark`, `gfm` et `commonmark_x` tous disponibles | Exige une installation et un terminal |

**Prix :** gratuit, sous licence GPL.

**Détails techniques et fonctionnalités**

- Dialectes choisis par leur nom : `markdown`, `markdown_strict`, `markdown_phpextra`, `markdown_mmd`, `commonmark`, `commonmark_x`, `gfm`
- Extensions basculées avec `+nom` et `-nom` sur le format, par exemple `gfm+footnotes`
- Syntaxe d’attributs `{#id .class key=value}` sur les titres, les blocs de code, les liens et les images
- `tex_math_dollars` pour les mathématiques, `fenced_divs` pour les conteneurs de type encadré, `definition_lists`, `footnotes`
- Les tableaux en grille et multilignes portent du contenu de bloc dans leurs cellules, ce que les tableaux à barres verticales ne peuvent pas faire

**Pour qui ?** Quiconque écrit des documents plutôt que des pages : quelque chose avec des notes, des citations, des équations, ou un format de sortie autre que le HTML. Demandez explicitement `gfm` quand le fichier doit aussi se rendre sur GitHub, parce que le dialecte propre à Pandoc acceptera volontiers une syntaxe que GitHub ne sait pas dessiner.

### Python-Markdown — les extensions comme API

L’implémentation Python de longue date. Son dialecte de base est plus proche du Markdown d’origine que de CommonMark, et son API d’extensions est le socle d’une bonne part de l’outillage de documentation.

| Avantages | Inconvénients |
| --- | --- |
| Extensions officielles pour les tableaux, les notes, les listes de définitions et les listes d’attributs | Pas conforme à CommonMark dans tous les détails |
| `md_in_html` analyse le Markdown à l’intérieur des blocs HTML bruts, ce que la plupart des analyseurs refusent | Les listes de tâches et le texte barré exigent des extensions tierces |
| L’extension `admonition` est l’implémentation de référence de `!!! note` | Les écarts avec GFM apparaissent dans les cas limites des listes et de l’emphase |

**Prix :** gratuit, sous licence BSD.

**Détails techniques et fonctionnalités**

- Le paquet `extra` regroupe tableaux, notes de bas de page, listes de définitions, abréviations, listes d’attributs, code clôturé et `md_in_html`
- `toc` génère les identifiants de titres et un sommaire ; `smarty` fait la ponctuation intelligente
- `nl2br` transforme les retours à la ligne isolés en `<br>`, le même interrupteur que d’autres outils appellent `breaks`
- `meta` lit un en-tête de métadonnées, et MkDocs prend en charge l’en-tête YAML au-dessus
- Le texte barré, les listes de tâches et les mathématiques `$...$` viennent des PyMdown Extensions, qui sont tierces

**Pour qui ?** Les scripts de construction Python, et quiconque étend MkDocs, où il est déjà le moteur. Soyez délibéré sur les extensions activées : le dialecte est exactement la liste de votre fichier de configuration, et un fichier écrit contre une liste plus fournie perdra des choses en silence.

### Goldmark — CommonMark avec un interrupteur GFM

Un analyseur conforme à CommonMark écrit en Go, et le moteur au cœur de Hugo. Ses extensions sont des valeurs Go que vous composez plutôt que des chaînes que vous configurez.

| Avantages | Inconvénients |
| --- | --- |
| Conforme à CommonMark, avec un unique paquet `extension.GFM` pour les quatre ajouts GFM | Go uniquement |
| Listes de définitions, notes de bas de page et typographe livrés d’origine | Moins d’extensions toutes faites que dans l’écosystème JavaScript |
| Le comportement des attributs et du passage direct est explicite plutôt qu’implicite | Certains choix de dialecte vous parviennent via la configuration de Hugo, pas celle de Goldmark |

**Prix :** gratuit, sous licence MIT.

**Détails techniques et fonctionnalités**

- `extension.GFM` regroupe Table, Strikethrough, Linkify et TaskList (vérifié sur github.com/yuin/goldmark, le 8 septembre 2026)
- `extension.DefinitionList` et `extension.Footnote` implémentent les syntaxes de PHP Markdown Extra
- `html.WithHardWraps()` rend un retour à la ligne en `<br>`, la même option sous un troisième nom
- `html.WithUnsafe()` est requis avant que le HTML brut ne passe : l’échappement est donc le comportement par défaut
- Hugo empile par-dessus ses crochets de rendu et sa propre configuration, et c’est là que vivent réellement la plupart des questions de dialecte sous Hugo

**Pour qui ?** Les programmes Go, et les utilisateurs de Hugo cherchant pourquoi une construction se rend sur GitHub et pas sur leur site. La réponse est généralement une extension disponible et non activée.

### kramdown — un sur-ensemble, pas un dialecte de CommonMark

Un convertisseur en Ruby pur, sur-ensemble de Markdown, et le moteur par défaut de Jekyll. Il a sa propre syntaxe pour plusieurs choses que les autres outils font autrement, ce qui est un vrai avantage dans Jekyll et un vrai problème en dehors.

| Avantages | Inconvénients |
| --- | --- |
| Listes d’attributs en ligne — `{: .warning}` — sur presque tout bloc | Pas conforme à CommonMark, et ne prétend pas l’être |
| Listes de définitions, notes de bas de page, abréviations et mathématiques intégrées | Ni listes de tâches ni texte barré dans la syntaxe de base |
| Les tableaux prennent en charge un séparateur d’en-tête et de pied | Sa syntaxe propre ne survit pas à une lecture par un autre outil |
| Déjà installé si vous utilisez Jekyll ou GitHub Pages | La gestion des sauts de ligne est configurable et n’est pas celle de CommonMark par défaut |

**Prix :** gratuit, sous licence MIT (vérifié sur github.com/gettalong/kramdown, le 8 septembre 2026).

**Détails techniques et fonctionnalités**

- Écrit en Ruby, sans dépendance obligatoire pour l’analyseur Markdown
- Les listes d’attributs en ligne fixent des identifiants, des classes et des attributs quelconques sans passer au HTML
- Les mathématiques `$$...$$`, les notes de bas de page et les définitions d’abréviations sont de la syntaxe de base et non des greffons
- Un analyseur GFM distinct est disponible et c’est celui qu’utilise GitHub Pages, ce qui n’est pas la même chose que le dialecte propre de kramdown
- Convertit vers HTML, LaTeX et de nouveau vers kramdown

**Pour qui ?** Les sites Jekyll, et seulement pour du contenu qui y reste. Si une page écrite en kramdown doit être lue ailleurs, ses listes d’attributs deviennent des accolades visibles.

### MDX — un autre langage sous une surface familière

MDX met des composants JSX dans du Markdown. Il est compilé en composant plutôt que rendu en HTML, et il repose sur remark : la moitié Markdown est donc le dialecte de remark.

| Avantages | Inconvénients |
| --- | --- |
| Un composant React au milieu d’un document, avec ses propriétés | Ce n’est pas du Markdown : aucun outil Markdown ordinaire ne sait le lire |
| La moitié Markdown est du CommonMark plus les greffons remark que vous ajoutez | Exige une étape de construction et un cadriciel JavaScript |
| Fait tourner les sites de documentation où se mêlent prose et exemples interactifs | Un `<` ou un `{` égaré dans la prose devient une erreur de syntaxe |

**Prix :** gratuit, sous licence MIT.

**Détails techniques et fonctionnalités**

- Compile vers du JavaScript : la sortie est un composant et non un fichier HTML
- Utilise remark pour le Markdown et peut prendre remark-gfm et le reste du jeu de greffons
- Les accolades sont des expressions, ce qui veut dire qu’un `{` littéral dans la prose doit être échappé
- L’en-tête de métadonnées exige un greffon, comme partout ailleurs

**Pour qui ?** Les sites de documentation qui ont besoin d’exemples vivants au milieu de la prose, et personne qui ait besoin d’un fichier portable. Un fichier MDX est du code source qui ressemble à un document.

## Les fonctionnalités face aux implémentations

Lisez une colonne pour un outil, et une ligne pour une fonctionnalité. « Greffon » signifie disponible mais non intégré ; « extension » signifie livré avec le projet mais inactif tant qu’il n’est pas activé ; « option » signifie un booléen quelque part dans la configuration.

| Fonctionnalité | CommonMark | GFM | markdown-it | marked | remark | Pandoc | Python-Markdown | Goldmark | kramdown |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tableaux | Non | Oui | Actif par défaut | Actif par défaut | remark-gfm | Intégré, plusieurs syntaxes | Extension `tables` | `extension.Table` | Intégré |
| Éléments de liste de tâches | Non | Oui | Greffon | Actif par défaut | remark-gfm | Extension `task_lists` | Extension tierce | `extension.TaskList` | Non |
| Texte barré | Non | Oui | Actif par défaut | Actif par défaut | remark-gfm | Extension `strikeout` | Extension tierce | `extension.Strikethrough` | Non |
| Liens automatiques sur URL nues | Non | Oui | Option `linkify` | Actif par défaut | remark-gfm | `autolink_bare_uris` | Extension tierce | `extension.Linkify` | Non |
| HTML brut par défaut | Transmis | Neuf balises échappées | Échappé | Transmis | Abandonné sauf autorisation | Transmis | Transmis | Échappé sauf mode unsafe | Transmis |
| Notes de bas de page | Non | Hors spécification ; GitHub les rend | Greffon | Non | remark-gfm | Extension `footnotes` | Extension `footnotes` | `extension.Footnote` | Intégré |
| Listes de définitions | Non | Non | Greffon | Non | Greffon | `definition_lists` | Extension `def_list` | `extension.DefinitionList` | Intégré |
| Listes d’attributs | Non | Non | Greffon | Non | Greffon | Intégré | Extension `attr_list` | Tierce | Intégré |
| Mathématiques | Non | Non | Greffon | Non | remark-math | `tex_math_dollars` | Extension tierce | Passage direct ou tierce | Intégré |
| Conteneurs d’encadrés | Non | Non | Greffon | Non | remark-directive | `fenced_divs` | Extension `admonition` | Tierce | Listes d’attributs |
| En-tête de métadonnées | Non | Non | Greffon | Non | remark-frontmatter | Intégré pour son propre format | Extension `meta` | Géré par Hugo | Géré par Jekyll |
| Identifiants de titres | Non | Ajoutés par GitHub au rendu | Greffon | Extension | Greffon | Intégré | Extension `toc` | Tierce | Intégré |
| Retour à la ligne en `<br>` | Non | Non | Option `breaks` | Option `breaks` | remark-breaks | `hard_line_breaks` | Extension `nl2br` | `WithHardWraps` | Option |

Deux motifs de ce tableau valent plus que les cellules prises une à une. Le premier est que les outils JavaScript divergent surtout sur les valeurs par défaut, pas sur les capacités : markdown-it et marked savent tous deux rendre un fichier GFM, mais à la sortie de la boîte l’un échappe votre HTML brut et l’autre non. Le second est que les outils à la syntaxe la plus riche — Pandoc, Python-Markdown, kramdown — sont ceux dont les fichiers voyagent le plus mal, parce que la richesse est tout entière dans des extensions que rien d’autre n’implémente.

## Comment savoir quel dialecte parle un outil

Ne lisez pas la documentation. Gardez un fichier sonde, collez-le, et lisez ce qui revient.

```markdown
| Feature | Renders |
| --- | --- |
| tables | yes? |

- [x] a checkbox
- [ ] or literal brackets

~~Strikethrough~~ and a bare URL: https://example.com

Term
: A definition, or a paragraph starting with a colon.

A footnote reference.[^1]

Heading with an attribute
{: .probe}

Line one
line two

[^1]: Only some tools render this.
```

Neuf réponses en un seul collage, dans l’ordre qui compte. Un tableau dessiné, des cases à cocher, du texte barré et un lien actif couvrent les quatre extensions de syntaxe de GFM — si les quatre apparaissent, vous avez au moins GFM. Une définition indentée signifie que l’outil va au-delà de GFM, sur le terrain de PHP Markdown Extra. Une note de bas de page rendue signifie la même chose. Des accolades `{: .probe}` visibles signifient pas de listes d’attributs, ce qui est le cas de la plupart des outils. Et si « line two » se retrouve sur sa propre ligne, `breaks` est activé, ce qu’il vaut mieux savoir avant d’écrire dix pages sur une mauvaise hypothèse.

Ajoutez un `$x^2$` et une ligne `> [!NOTE]` si les mathématiques ou les encadrés vous importent. L’intérêt de ce fichier est qu’il prend dix secondes et remplace un après-midi de suppositions.

## Là où GFM — le choix évident — échoue, et ce que cela coûte

GFM est la bonne valeur par défaut, et il vaut la peine d’être honnête sur les quatre endroits où il s’épuise.

**Il n’a pas de notes de bas de page, et vous non plus.** GitHub rend les notes de bas de page, donc les gens en écrivent, et elles ne sont pas dans la spécification. Un analyseur GFM qui ignore `[^1]` est conforme. Si votre document a réellement besoin de notes de bas de page, vous avez quitté GFM, que vous l’ayez voulu ou non, et le prix est que votre fichier dépend désormais de la liste d’extensions d’un outil précis plutôt que d’une spécification — [quels outils rendent la syntaxe des notes et lesquels impriment les crochets](/blog/markdown-footnotes-support) est la liste à consulter avant d’écrire cent notes.

**Il n’a pas d’attributs : la mise en forme passe donc par du HTML brut.** Il n’y a aucun moyen en GFM de poser une classe sur un paragraphe. Soit vous descendez à un `<div>` — ce qui vous met à la merci de ce que le moteur de rendu fait du HTML brut, et du filtre de balises s’il s’agit d’un moteur GFM — soit vous acceptez la mise en forme par défaut. Pandoc et kramdown ont résolu cela il y a des années, et leurs solutions ne voyagent pas.

**Le filtre de balises n’est pas de la sécurité.** Neuf noms de balises échappés, c’est une liste, pas une politique. Quiconque convertit du Markdown venu de tiers en pensant que la conformité GFM le couvre est à un `<img onerror=>` de découvrir le contraire. L’assainissement se fait après l’analyse, contre une liste blanche, et c’est un travail distinct du choix d’un dialecte.

**La question des sauts de ligne n’a pas de bonne réponse.** Les boîtes de commentaires de GitHub transforment un simple retour à la ligne en `<br>` ; la spécification dit qu’un simple retour à la ligne est un espace ; le rendu des README suit la spécification. Le même texte peut donc se rendre de deux façons sur le même site web, et chaque outil en aval doit en choisir une. TransformPipe convertit avec GFM activé et `breaks` désactivé, ce qui correspond à la spécification et au rendu des README plutôt qu’à la boîte de commentaires, parce qu’un document est plus proche d’un README que d’un commentaire. Quel que soit le choix d’un outil, les paragraphes de quelqu’un ressortent faux, et c’est le problème de dialecte le plus souvent signalé qui soit.

Le coût de ces quatre points réunis est que « GFM » vous dit ce qui se rendra et non ce qui aura l’air juste. C’est un plancher, pas une finition.

## Comment choisir un dialecte

1. **Écrivez pour le lecteur le plus strict de la chaîne.** Si un fichier doit se rendre sur GitHub, sur un site de documentation et en HTML converti, n’utilisez que ce que les trois prennent en charge, parce que c’est l’analyseur le plus faible qui décide de ce que voit le lecteur et qu’il ne vous préviendra pas.
2. **Choisissez le dialecte avant l’outil, pas après.** Décider que vous avez besoin de notes et de mathématiques vous dit d’installer Pandoc ; décider que vous avez besoin qu’un README se rende vous dit que GFM suffit. Faire l’inverse revient à découvrir la limite au milieu d’un document.
3. **Gardez chaque extension près de l’outil qui la possède.** L’en-tête de métadonnées appartient à un dépôt que lit un générateur, pas à un fichier que vous confiez à un convertisseur qui le rendra en titre. Une liste d’attributs appartient au site Jekyll, pas au fichier que vous envoyez par courriel.
4. **Traitez les valeurs par défaut comme faisant partie du dialecte.** Deux bibliothèques peuvent toutes deux revendiquer GFM et diverger sur le HTML brut, les liens automatiques et les sauts de ligne, ce qui fait trois occasions pour un fichier de se rendre différemment sans que personne n’ait changé un mot.
5. **Convertissez un fichier représentatif avant de vous engager.** Pas un fichier « bonjour le monde » : celui avec le tableau, la liste de contrôle, la longue URL entre parenthèses et la note de bas de page. Dix secondes de sondage valent mieux qu’une réécriture, et c’est la seule façon de voir un échec silencieux pendant qu’il coûte encore peu.

## Conclusion

CommonMark est le noyau, GFM est le noyau plus cinq extensions nommées, et tout le reste de ce que vous avez tapé dans un fichier `.md` est l’extension de quelqu’un qui s’arrête au bord de son outil. Voilà toute la carte, et elle suffit à prévoir presque toutes les différences de rendu que vous rencontrerez. Écrivez du GFM par défaut, tournez-vous vers Pandoc quand le document réclame des notes ou des équations, gardez l’en-tête de métadonnées et les listes d’attributs dans les projets qui les comprennent, et sondez avant de vous engager. Si c’est sur GFM que vous atterrissez, [le convertir en HTML](/) dans le navigateur vous montrera exactement ce qu’est devenue chaque construction — la source HTML est juste là, à côté de l’aperçu, de sorte que vous pouvez vérifier le tableau au lieu de l’espérer.

## FAQ

### Quelle est la différence entre CommonMark et GFM ?

GFM est la spécification CommonMark plus cinq extensions nommées : tableaux, éléments de liste de tâches, texte barré, liens automatiques sur les URL nues, et un filtre qui échappe neuf noms de balises HTML brutes. Les règles d’analyse du noyau sont identiques, parce que GFM est défini comme un sur-ensemble strict. Toute autre différence entre deux moteurs de rendu n’est pas une différence CommonMark contre GFM — c’est une extension que l’un a et l’autre non.

### GFM est-il un sur-ensemble de CommonMark ?

Oui, et la spécification le dit explicitement. Tout document CommonMark valide est un document GFM valide qui se rend de la même façon, à la seule exception des neuf balises HTML brutes filtrées, que GFM échappe et que CommonMark transmet. C’est pourquoi écrire du CommonMark pur est la façon la plus sûre de rendre un fichier portable.

### CommonMark prend-il en charge les tableaux ?

Non. Les tableaux ne sont pas dans la spécification CommonMark, et un analyseur strictement conforme rend un tableau à barres verticales comme un paragraphe ordinaire contenant des barres verticales. L’échec est silencieux : si un tableau est ressorti en texte, votre analyseur fait probablement exactement ce qu’on lui a dit de faire. Les tableaux arrivent avec GFM ou avec une extension propre à un outil.

### Les notes de bas de page font-elles partie de GitHub Flavored Markdown ?

Pas dans la spécification, même si le site de GitHub les rend. Les notes de bas de page sont une extension que Pandoc, remark-gfm, Python-Markdown, Goldmark et kramdown implémentent tous d’une façon qui se ressemble, et qu’un simple analyseur GFM est en droit d’ignorer. Si votre document en a besoin, choisissez un outil sur ce critère plutôt que sur la conformité GFM.

### Pourquoi mon Markdown se rend-il différemment sur GitHub et dans mon convertisseur ?

Trois causes habituelles, par ordre de probabilité. Le réglage des sauts de ligne : les boîtes de commentaires de GitHub traitent un simple retour à la ligne comme un `<br>`, et la spécification non. Une extension : notes de bas de page, en-tête de métadonnées, alertes et mathématiques se rendent sur GitHub ou dans un générateur et ne figurent dans aucune des deux spécifications. Ou une construction pas tout à fait valide — un tableau dont la ligne de délimitation n’a pas le bon nombre de cellules, par exemple — dont GitHub et votre convertisseur peuvent se remettre différemment.

### Dans quel dialecte de Markdown devrais-je écrire ?

GFM, sauf si quelque chose vous en écarte. Il est spécifié, largement implémenté, et couvre les tableaux, les listes de contrôle et le texte barré, soit l’essentiel de ce qu’utilise un vrai document. Passez au dialecte de Pandoc quand vous avez besoin de notes de bas de page, de listes de définitions ou d’équations, et acceptez que le fichier soit alors lié à Pandoc.

### Que fait un convertisseur Markdown d’un en-tête YAML de métadonnées ?

Cela dépend entièrement de savoir si l’outil en a entendu parler, puisque l’en-tête de métadonnées ne figure dans aucune des deux spécifications. Un générateur le retire et le lit comme des métadonnées ; un simple convertisseur le rend comme du contenu, ce qui produit un filet horizontal suivi de vos métadonnées en titre setext. Si vous confiez des fichiers à un convertisseur, retirez l’en-tête au préalable ou choisissez un outil doté d’une option pour cela.
