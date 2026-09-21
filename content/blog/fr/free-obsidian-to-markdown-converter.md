---
title: "Convertisseur Obsidian vers Markdown gratuit : toutes les options comparées"
description: "Un coffre Obsidian est déjà du Markdown : rien à acheter — comparatif des outils gratuits qui réparent wikiliens, intégrations, références de bloc et encadrés"
date: 2026-09-14
tag: Conversion
keywords: convertisseur obsidian markdown gratuit, exporter un coffre obsidian gratuitement, obsidian vers markdown gratuit, export obsidian markdown, convertir obsidian en markdown en ligne, greffon export obsidian gratuit
---

Qui cherche un convertisseur Obsidian vers Markdown gratuit a en général déjà trouvé la partie gênante : il n’y a rien à acheter, parce qu’il n’y a rien à convertir. Un coffre Obsidian est un dossier de fichiers `.md` sur le disque. Vous pouvez en ouvrir un dans le Bloc-notes, ou verser l’ensemble dans un dépôt, sans toucher au moindre convertisseur. Le format est le format de destination.

Et pourtant la recherche revient sans cesse, parce que les fichiers cessent de fonctionner dès qu’ils sortent. Une note qui se lit parfaitement dans Obsidian arrive ailleurs en traînant un `[[Note de cadrage]]` entre doubles crochets, un marqueur `> [!warning]` imprimé en toutes lettres en tête d’une citation, et un `![[schema.png]]` qui n’affiche rien. Ce que les gens cherchent à acheter n’est pas un changement de format. C’est une réparation portant sur quatre constructions inventées par Obsidian, et chaque outil qui mérite d’être comparé est une réponse différente à la manière dont ces quatre-là se réparent.

Cela recadre utilement la question du prix. Quand le format de base est libre et que les fichiers source sont déjà les vôtres, « gratuit » cesse d’être une remise et devient la norme. Ce que coûtent réellement ces options, c’est de l’installation, du contrôle, et la part de la structure du coffre que vous acceptez de perdre dans l’échange.

### En bref

Toutes les options sérieuses ici sont gratuites : choisissez donc sur la forme plutôt que sur le prix. **Le convertisseur en ligne sur [/obsidian-to-markdown](/obsidian-to-markdown)** prend un coffre zippé et rend un document unique avec un sommaire, les wikiliens réduits aux mots qu’ils affichaient et le frontmatter retiré — sans installation, sans rien téléverser quand vous êtes déconnecté, et c’est la bonne réponse quand la destination est un document lisible unique. **[obsidian-export](https://github.com/zoni/obsidian-export)** est un outil en ligne de commande écrit en Rust et gratuit (BSD-2-Clause-Patent, vérifié sur github.com/zoni/obsidian-export, le 14 septembre 2026) qui parcourt un coffre et écrit de l’autre côté des fichiers CommonMark, liens et intégrations résolus — ce qu’il vous faut quand le coffre doit rester un dossier de fichiers séparés. **Le réglage « Use \[\[Wikilinks\]\] » d’Obsidian** ne coûte rien et ne répare rien rétroactivement. **Un greffon d’export communautaire** exporte une note ou un dossier avec ses images, depuis Obsidian même. **Pandoc** est gratuit et sous GPL, et ne lit les wikiliens que derrière une extension non activée par défaut — sans index du coffre, il ne peut pas résoudre `[[Note]]` vers un chemin comme le fait Obsidian. **Un script que vous écrivez vous-même** est la seule voie qui vous laisse décider de ce qui arrive à un nom de fichier en double. Pour le détail de la syntaxe derrière tout cela, [le guide complet passe le dialecte en revue note par note](/blog/convert-obsidian-vault-to-markdown).

## Pourquoi un dossier de fichiers Markdown a quand même besoin d’un convertisseur

Si ce travail existe, c’est parce que le dialecte d’Obsidian est un sur-ensemble et que les ajouts ne sont marqués comme tels nulle part dans le fichier. Il n’y a ni drapeau, ni espace de noms, ni zone délimitée qui dise « ce bout-là est à nous ». Un wikilien ressemble exactement à du texte ordinaire contenant des crochets, ce qui est précisément pourquoi un analyseur standard le traite comme du texte ordinaire contenant des crochets.

Quatre constructions concentrent presque tous les dégâts, et elles sont toute la base sur laquelle les outils ci-dessous diffèrent :

**Les wikiliens** — `[[Note]]`, `[[Note|Texte affiché]]`, `[[Note#Titre]]` — se résolvent à l’intérieur d’Obsidian contre un index du coffre entier, en retrouvant un fichier par son nom où qu’il se trouve, et aussi contre son frontmatter `aliases`. Hors du coffre, cet index a disparu : il ne reste donc plus rien contre quoi résoudre.

**Les intégrations.** `![[Note]]` insère une autre note au moment de l’affichage ; `![[image.png]]` montre une pièce jointe. Le Markdown standard a une syntaxe d’image et aucune syntaxe de transclusion : une intégration de note n’a donc aucun équivalent vers lequel la convertir — seulement un choix entre insérer une copie et retomber sur un lien ordinaire.

**Les références de bloc.** `[[Note#^id-de-bloc]]` vise un paragraphe via un identifiant ajouté à la ligne de ce paragraphe. Quand l’identifiant disparaît, la référence ne casse pas ; elle cesse de renvoyer à quoi que ce soit.

**Les encadrés.** `> [!note]`, `> [!warning]` et les autres sont des citations portant un marqueur typé sur la première ligne. Partout ailleurs, le marqueur est du texte.

Un cinquième élément n’est pas une construction mais une erreur de catégorie qu’il vaut mieux nommer tôt : tout ce qu’un greffon a rendu plutôt qu’écrit. Une requête Dataview est stockée sous forme de bloc de code délimité contenant la question, et le tableau qu’elle produisait était généré à l’ouverture, à chaque fois. Aucun convertisseur, gratuit ou non, ne le récupère, parce qu’il n’y a rien à récupérer. Le frontmatter et les `%%commentaires en ligne%%` complètent la liste, tous deux faciles à traiter si l’outil s’en donne la peine — [ce que les convertisseurs font du front matter en général](/blog/front-matter-and-what-converters-do-with-it) s’applique ici sans modification.

## Ce que « gratuit » coûte dans chaque direction

Puisque la colonne des prix ci-dessous affiche « gratuit » à chaque ligne, il vaut la peine d’expliciter ce qui varie à la place.

**Le coût d’installation.** Une page web, c’est zéro. Un binaire Rust, c’est un téléchargement ou un `cargo install`. Un greffon communautaire, c’est un greffon que vous maintenez désormais. Un script, c’est un après-midi puis pour toujours.

**Le contrôle de l’ambiguïté.** Deux notes nommées `Notes de réunion.md` dans des dossiers différents sont ambiguës pour un `[[Notes de réunion]]` nu, même à l’intérieur d’Obsidian, qui tranche selon sa propre règle interne. Tout outil automatisé hérite de cette ambiguïté au lieu de la lever ; seul du code que vous avez écrit vous laisse décider laquelle gagne.

**La forme de la sortie.** La vraie bifurcation, et non une différence de qualité : certains outils produisent un dossier de fichiers avec des liens relatifs qui fonctionnent entre eux, d’autres produisent un document unique, ce qui supprime le besoin même d’une cible de lien.

**Où va le coffre.** Un coffre est souvent la chose la plus intime qu’une personne possède sous forme de texte : un convertisseur qui tourne localement et un convertisseur qui téléverse sont au même prix et ne constituent pas la même transaction — la version générale de cette question est [savoir si un convertisseur en ligne est sûr](/blog/is-an-online-converter-safe).

## Comparatif rapide : l’aide-mémoire

| Outil | Idéal pour | Capacité principale | Prix |
| --- | --- | --- | --- |
| TransformPipe | Un coffre, ou une partie de coffre, qui doit devenir un document lisible unique | Coffre zippé en entrée, un document avec sommaire en sortie, wikiliens et frontmatter traités dans la même passe | Gratuit |
| obsidian-export | Un coffre qui doit rester un dossier de fichiers séparés et liés | Export récursif du coffre vers CommonMark, en résolvant les liens `[[note]]` et les intégrations `![[note]]` | Gratuit, BSD-2-Clause-Patent |
| Le réglage « Use \[\[Wikilinks\]\] » d’Obsidian | Empêcher l’arriéré de grossir | Écrit des liens `[texte](chemin)` standard pour tout ce qui est créé après le changement | Gratuit, intégré |
| Un greffon d’export communautaire | Exporter une note ou un dossier depuis Obsidian | Empaquette les images liées à côté du Markdown exporté | Gratuit |
| Pandoc | Un coffre qui n’est qu’une entrée parmi d’autres dans un build que vous faites déjà tourner | Prise en charge des wikiliens derrière une extension non activée par défaut, vers tout format que Pandoc écrit | Gratuit, GPL |
| Un script que vous écrivez vous-même | Les noms de fichiers en double, les alias, et les règles que vous seul connaissez | Contrôle exact sur chaque cas ambigu, et rien d’autre à qui faire confiance | Gratuit, coûte du temps |

## Les options, une par une

### TransformPipe — idéal quand le coffre doit devenir un document unique

Zippez le dossier du coffre, déposez l’archive sur [/obsidian-to-markdown](/obsidian-to-markdown), et chaque note revient sous forme de section d’un document Markdown unique, dans l’ordre des chemins, sous un sommaire généré. Il n’y a rien à installer, aucun compte exigé, et déconnecté l’archive est lue par la page depuis votre propre disque plutôt qu’envoyée quelque part.

Le choix de conception qui sous-tend tout cela fait disparaître le problème des wikiliens plutôt qu’il ne le résout : quand chaque note est une section du même document, il n’y a plus de fichier distinct vers lequel un lien pourrait pointer. Ainsi `[[Note de cadrage]]` devient les mots *Note de cadrage*, `[[Note de cadrage|le cadrage]]` devient *le cadrage*, et `[[Note de cadrage#Périmètre]]` devient *Note de cadrage* — dans chaque cas, le texte que le lecteur voyait de toute façon. Une perte si vous vouliez des liens navigables ; exactement ce qu’il faut si vous vouliez quelque chose qu’une personne puisse lire d’un bout à l’autre.

| Avantages | Inconvénients |
| --- | --- |
| Pas d’installation, pas de binaire, pas de greffon — une archive et un onglet de navigateur | Un document unique, pas un dossier de fichiers : la mauvaise forme si les notes doivent rester adressables séparément |
| Wikiliens, libellés après une barre verticale `\|` et ancres `#titre` se réduisent tous aux mots affichés en une seule passe | Les liens deviennent du texte brut plutôt que des liens actifs, puisqu’il ne reste aucune cible externe |
| Le frontmatter est retiré au lieu d’être rendu sous forme d’un filet horizontal égaré suivi d’un bloc de clés-valeurs parasites, et une intégration d’image devient l’image elle-même | Le plafond est de deux mégaoctets d’images par document, et une pièce jointe qui n’est pas une image devient toujours du texte en italique |
| Un sommaire généré, si bien qu’un coffre de cent notes se parcourt depuis le haut | Les tableaux Dataview et les autres vues rendues par un greffon sont absents, comme par toutes les voies |
| Tourne dans le navigateur ; le coffre n’est pas téléversé quand vous êtes déconnecté | Un très gros coffre est limité par la machine qui fait le travail |

**Prix :** gratuit. Un compte ajoute l’historique et le partage, gratuits eux aussi.

**Détails techniques et fonctionnalités**

- L’archive n’est lue que pour ses entrées `.md`, triées par leur chemin complet à l’intérieur de l’archive, ce qui fixe l’ordre des sections dans la sortie — renommez un dossier et l’ordre change avec lui
- Le titre d’une note vient de son nom de fichier plutôt que de quoi que ce soit écrit dedans, à l’image de la manière dont Obsidian lui-même identifie les notes ; si la première ligne de cette note répète le titre en H1, le doublon est retiré au lieu d’être imprimé deux fois
- La réécriture des wikiliens couvre `[[Cible]]`, `[[Cible|Affiché]]`, `[[Cible#Titre]]` et `[[Cible#Titre|Affiché]]`, ainsi que la forme d’intégration `![[...]]` de chacun
- Une intégration dont la cible est une image présente dans l’archive devient cette image, portée dans le document ; une dont la cible est un autre fichier de document ou de média reconnu devient du texte en italique le nommant, plutôt qu’une référence cassée pointant vers un fichier absent
- Le bloc de frontmatter YAML en tête d’une note est supprimé avant que quoi que ce soit d’autre ne s’exécute
- Les sections sont jointes par un filet horizontal, la même convention que celle employée par l’application pour [fusionner plusieurs fichiers Markdown en un seul](/blog/merging-many-markdown-files)

**Pour qui ?** Pour quelqu’un qui remet un coffre, ou l’équivalent des notes d’un projet, à une personne qui n’utilise pas Obsidian — un client, une archive, une passation, un document qui doit être lu plutôt que parcouru. Pas l’outil qu’il faut pour un coffre qui doit continuer à fonctionner comme un graphe de liens de l’autre côté.

### obsidian-export — idéal quand le coffre reste un dossier de fichiers

obsidian-export est un programme en ligne de commande et une bibliothèque Rust qui parcourt un coffre et écrit du CommonMark brut de l’autre côté, un fichier en entrée pour un fichier en sortie. C’est ce qui se rapproche le plus d’un convertisseur gratuit conçu exprès pour ce travail sans être un greffon, et sa propre documentation prend soin de préciser qu’il n’est pas officiellement soutenu par Obsidian et qu’il prend en charge l’essentiel du dialecte, mais pas tout.

| Avantages | Inconvénients |
| --- | --- |
| Préserve la forme des dossiers : des fichiers séparés avec les liens entre eux résolus, sans aplatissement | Un outil en ligne de commande : un terminal est donc un prérequis |
| Traite aussi bien les références `[[note]]` que les inclusions de fichiers `![[note]]`, et pas seulement les liens ordinaires | Non soutenu par Obsidian, et son propre README indique que la couverture du dialecte est partielle |
| Les motifs d’exclusion utilisent la syntaxe gitignore, et les fichiers déjà ignorés par git sont écartés par défaut | Suppose de l’UTF-8 pour le texte et les noms de fichiers, avec conversion avec pertes sinon |
| Le comportement sur le frontmatter est une option plutôt qu’une décision figée | Un binaire de plus à installer et à tenir à jour |
| Scriptable : l’export est donc reproductible plutôt qu’une chose dont quelqu’un doit se souvenir | Un export partiel obéit à des règles qu’il vaut mieux lire d’abord |

**Prix :** gratuit, BSD-2-Clause-Patent d’après le propre `Cargo.toml` du projet (vérifié sur github.com/zoni/obsidian-export, le 14 septembre 2026).

**Détails techniques et fonctionnalités**

- `obsidian-export /chemin/vers/coffre /chemin/vers/sortie` est toute l’invocation de base ; le dossier de destination doit déjà exister
- `--start-at` exporte un sous-ensemble du coffre tout en traitant le coffre entier comme contexte de résolution, si bien que les liens sortant du sous-ensemble exporté restent intacts. Désigner un fichier unique comme source ne résout au contraire délibérément rien — la documentation présente cela comme voulu
- `--frontmatter=never` supprime entièrement le frontmatter, `--frontmatter=always` insère un bloc vide pour les générateurs de sites statiques qui en exigent un, et le comportement par défaut le recopie tel quel
- Les fichiers cachés, les chemins visés par un fichier `.export-ignore` et tout ce que git ignore déjà sont exclus par défaut, chacun ajustable par son option propre
- `--skip-tags` et `--only-tags` filtrent les notes par les étiquettes du frontmatter, ce qui est un moyen réellement utile d’exporter la moitié publique d’un coffre
- Une note qui pointe vers une note exclue est déliée plutôt que laissée à pointer dans le vide — le texte du lien survit, le lien non
- Deux notes qui s’intègrent l’une l’autre provoquent une erreur par défaut, `--no-recursive-embeds` brisant le cycle en insérant un lien à la deuxième rencontre

**Pour qui ?** Pour quiconque exporte un coffre vers un site statique, un dépôt de documentation, ou partout où les notes doivent garder leur identité propre et leurs liens entre elles. C’est l’outil gratuit qui correspond le plus directement au modèle mental d’« exporter mon coffre » au sens où la plupart des gens l’entendent.

### Le réglage « Use \[\[Wikilinks\]\] » d’Obsidian — gratuit, intégré, et à moitié un remède

Le réglage se trouve dans Paramètres, Fichiers et liens : désactivez « Use \[\[Wikilinks\]\] » et Obsidian écrit des liens Markdown `[texte](chemin)` standard pour tout ce que vous créez à partir de cet instant (vérifié sur obsidian.md et via la documentation des paramètres d’Obsidian, le 14 septembre 2026). L’autocomplétion ne change pas — tapez `[[`, choisissez la note — seule la syntaxe écrite sur le disque diffère.

| Avantages | Inconvénients |
| --- | --- |
| Ne coûte rien et n’ajoute aucun outil, greffon ni dépendance | Purement tourné vers l’avenir : chaque lien écrit avant le changement reste intact |
| L’expérience d’écriture ne change pas du tout — même autocomplétion, même fluidité | N’affecte que les liens ordinaires ; intégrations, références de bloc et encadrés ne sont pas concernés |
| Rend le coffre progressivement plus portable sans aucun événement de migration | Ce n’est une conversion en aucun sens — un coffre établi a toujours besoin d’une passe de réécriture |

**Prix :** gratuit, il fait partie de l’application. Obsidian lui-même est gratuit pour un usage personnel, avec une licence commerciale à 50 $ par utilisateur et par an pour un usage professionnel en organisation, et des modules optionnels Sync et Publish facturés séparément (vérifié sur obsidian.md, le 14 septembre 2026).

**Pour qui ?** Pour tout le monde, quelle que soit l’autre option retenue pour l’arriéré. C’est le seul élément de cette page qui soit exempt de compromis, parce qu’il ne s’attaque pas à la partie difficile.

### Un greffon d’export communautaire — idéal pour une note ou un dossier, depuis Obsidian

Le répertoire de greffons communautaires d’Obsidian propose des greffons d’export, et [obsidian-markdown-export-plugin](https://github.com/bingryan/obsidian-markdown-export-plugin) en est un exemple réel et activement poussé : il exporte une note isolée ou un dossier entier sous forme de paquet avec ses images liées empaquetées à côté du Markdown, depuis une commande dans Obsidian plutôt qu’un outil séparé.

| Avantages | Inconvénients |
| --- | --- |
| S’exécute depuis l’application, sur la note que vous avez sous les yeux | Le dépôt ne comporte aucun fichier de licence, ce qui compte si vous comptez le forker ou en intégrer le code (vérifié sur github.com/bingryan/obsidian-markdown-export-plugin, le 14 septembre 2026) |
| Garde les images comme fichiers à côté du Markdown exporté, là où la voie de la fusion en un document unique les place à l’intérieur du document | Un greffon communautaire est une dépendance avec son propre rythme de publication et ses propres décisions |
| Propose une option de sortie en GitHub Flavored Markdown, la variante sur laquelle la plupart des destinations s’accordent | Son traitement des références de bloc, des encadrés et du contenu rendu par greffon est le choix du greffon, pas le vôtre |
| Exporte aussi bien des dossiers que des fichiers isolés, et peut également produire du HTML | Un export par greffon passe mal à l’échelle d’un coffre entier face à un outil en ligne de commande que vous pouvez scripter |

**Prix :** gratuit, installé depuis le navigateur de greffons communautaires d’Obsidian.

**Détails techniques et fonctionnalités**

- Les capacités documentées sont l’export de dossiers et de fichiers isolés, l’inclusion des images en pièces jointes, une option de sortie en GitHub Flavored Markdown, le traitement du contenu intégré, et une sortie au choix en `md` ou en `html` (vérifié sur github.com/bingryan/obsidian-markdown-export-plugin, le 14 septembre 2026)
- L’installation suit le chemin ordinaire des greffons communautaires : Paramètres, greffons communautaires, parcourir, chercher « markdown export »
- Parce qu’il s’exécute dans Obsidian, il a accès au même index de coffre qu’Obsidian utilise lui-même pour résoudre un lien — l’avantage structurel qu’ont les greffons sur tous les outils externes d’ici

La prudence habituelle envers les greffons communautaires s’applique, sans qu’il faille en faire une affaire : avant de compter sur l’un d’eux pour quelque chose que vous ne pourriez pas refaire à la main, vérifiez sur sa fiche actuelle l’état de maintenance et lisez ce qu’il fait des constructions que vous avez réellement. Un greffon qui abandonne discrètement les encadrés convient très bien si vous n’avez pas d’encadrés.

**Pour qui ?** Pour quelqu’un qui exporte une poignée de notes à la fois, avec leurs images, et qui préfère rester dans Obsidian plutôt qu’apprendre un outil en terminal. Les pièces jointes sont la fonctionnalité décisive — c’est la seule option de cette page qui les fasse sortir avec le texte.

### Pandoc — idéal quand le coffre n’est qu’une entrée parmi d’autres

Pandoc est le convertisseur de documents généraliste, gratuit et sous licence GPL (vérifié sur pandoc.org, le 14 septembre 2026), et il mérite une ligne ici pour les gens qui l’ont déjà dans un build. Il connaît bien les wikiliens, mais à des conditions qu’il vaut mieux comprendre avant d’y recourir.

| Avantages | Inconvénients |
| --- | --- |
| Déjà installé sur un très grand nombre de machines de build documentaire | Aucun index de coffre : il ne peut pas résoudre `[[Note]]` vers `dossier/Note.md` comme le fait Obsidian |
| L’analyse des wikiliens est disponible via une extension documentée | Les extensions ne sont pas activées par défaut : un simple `-f markdown` laisse donc les wikiliens sous forme de texte littéral |
| Écrit vers tous les formats de sortie que Pandoc gère, depuis la même entrée | Ne connaît ni les encadrés, ni les références de bloc, ni Dataview — ils passent tels qu’ils sont textuellement |
| Se compose avec des filtres, si bien qu’une réécriture sur mesure peut s’exécuter dans la conversion | Par nature fichier par fichier ; un coffre, c’est une boucle que vous écrivez autour |

**Prix :** gratuit, sous licence GPL.

**Détails techniques et fonctionnalités**

- `--from=markdown+wikilinks_title_after_pipe` active l’analyse de `[[Wiki]]` et `[[URL|titre]]` ; `wikilinks_title_before_pipe` en est l’image inversée, `[[titre|URL]]` (vérifié dans le manuel Pandoc sur pandoc.org, le 14 septembre 2026)
- Les deux figurent dans la section du manuel consacrée aux extensions non activées par défaut : aucune n’est donc active tant que vous ne la nommez pas. Obsidian met la cible en premier et le texte affiché après la barre verticale, ce qui fait de `wikilinks_title_after_pipe` celle qui correspond à un coffre
- Ce que l’extension vous donne, c’est un lien dont la destination est le texte littéral entre les crochets — utile, et pas la même chose qu’un chemin relatif résolu vers un fichier ailleurs dans le coffre
- Un filtre Lua est la manière honnête de combler cet écart : analyser la cible du lien, la chercher dans un index que vous avez construit vous-même à partir du coffre, et réécrire la destination

**Pour qui ?** Pour quelqu’un dont les notes ne sont qu’une entrée dans un build qui fait déjà tourner Pandoc pour d’autres raisons. Comme convertisseur Obsidian autonome, c’est l’option la plus faible d’ici, parce que la partie difficile — la résolution à l’échelle du coffre — est précisément celle qu’il ne fait pas.

### Un script que vous écrivez vous-même — idéal pour les cas que personne d’autre ne peut trancher

La dernière option gratuite est celle qui ne comporte aucun outil. Parcourir le coffre, construire un index de tous les noms de fichiers et de tous les alias, repérer les motifs de wikiliens et d’intégrations, résoudre chaque cible contre cet index, réécrire sur place.

| Avantages | Inconvénients |
| --- | --- |
| La seule voie où c’est vous qui décidez vers quoi se résout un nom de fichier en double | Vous maintenez désormais un convertisseur |
| Alias, règles d’étiquettes et conventions de dossiers propres à votre coffre peuvent tous être encodés | Chaque cas limite du dialecte est à vous de le découvrir, généralement après l’export |
| Aucune dépendance, aucun greffon, aucun binaire, et rien à qui faire confiance sinon du code que vous pouvez lire | Plus lent à donner un premier résultat que toutes les autres options d’ici, et les échecs intéressants sont silencieux |

**Prix :** gratuit, payé en temps.

**Détails techniques et fonctionnalités**

- Une seule expression régulière sur `!?\[\[cible(#titre)?(\|affiché)?\]\]` attrape toute la famille, intégrations comprises ; le guide lié plus haut déroule une version qui fonctionne, avec son résolveur
- La résolution doit chercher dans tout le coffre par nom de fichier, pas dans le dossier de la note qui établit le lien, parce que c’est ce que fait Obsidian ; un résolveur limité au dossier produit des liens morts pour toute note rangée ailleurs et ne signale rien
- L’index a besoin du frontmatter `aliases` de chaque note à côté de son nom de fichier, sinon un lien écrit contre l’ancien titre d’une note renommée retombe en texte brut
- Gardez un coffre de test contenant une occurrence de chaque construction — un encadré, une intégration, une référence de bloc, un lien par alias, un nom de fichier en double — et passez-y chaque modification

**Pour qui ?** Pour quiconque déplace un coffre volumineux et ancien vers un endroit où il doit continuer à fonctionner, et où un lien mort silencieux est pire qu’un après-midi passé à écrire du code. Et aussi pour quiconque a essayé l’un des outils ci-dessus et y a trouvé une règle avec laquelle il n’était pas d’accord.

## Là où le choix gratuit et évident s’effondre

Le choix gratuit évident, pour la plupart des gens, c’est « il suffit de copier le dossier » — le coffre est du Markdown, alors déplacez-le et n’en parlons plus. Les endroits où cela échoue méritent d’être décrits précisément, parce que les échecs sont silencieux et arrivent plus tard.

**Les liens ont l’air corrects jusqu’à ce que quelqu’un clique.** Dans un éditeur de texte brut, `[[Note de cadrage]]` est lisible et un lecteur comprend. Dans un README GitHub rendu ou sur un site statique, c’est lisible et mort. Rien ne signale d’erreur ; la page porte simplement un bout de texte qui a l’air de vouloir être un lien, et le lecteur suppose que c’est le site qui est cassé, pas la source.

**Les encadrés perdent leur emphase et gardent leurs mots.** Une citation `> [!warning]` perd son style et garde son texte : une note qui utilisait la couleur d’un encadré pour distinguer « faites ceci » de « ne faites jamais cela » se lit désormais comme deux citations identiques. C’est pire que perdre le contenu, parce que le contenu est là et que sa pondération a disparu.

**Les pièces jointes cassent d’une manière que le texte ne montre pas.** Les images vivent dans un dossier de pièces jointes référencé par une intégration. Copiez les fichiers `.md` sans le dossier et toutes les images ont disparu ; copiez le dossier à une position relative différente et toutes les images ont disparu d’une manière qui paraît identique. Le Markdown est inchangé et correct dans les deux cas.

**Une référence de bloc n’est pas un lien cassé, c’est rien du tout.** `[[Note#^a1b2c3]]` hors d’Obsidian vise un identifiant qui n’existe plus nulle part dans aucun fichier. Il n’y a ni cible à réparer, ni solution de repli à afficher. La seule réparation honnête consiste à insérer le texte qui était visé, ce qui suppose d’avoir encore le coffre ouvert dans Obsidian pour voir ce que c’était.

**Le contenu rendu par un greffon ne laisse aucune trace d’avoir existé.** Une note dont toute la valeur était un tableau Dataview se convertit en un bloc de code contenant une requête. Pour un lecteur qui n’a jamais utilisé le coffre, cette note a désormais l’air d’avoir toujours été un fragment. Repérez ces cas tant que le coffre les affiche encore.

**Et le frontmatter est parfois porteur.** Il peut être le seul endroit où une note a consigné d’où elle venait ou de qui elle parlait. La voie de la fusion le retire automatiquement, ce qui est juste pour la lisibilité et mérite un coup d’œil préalable si ces propriétés comptaient.

## Comment choisir

1. **Décidez d’abord de la forme de la sortie, parce qu’on ne revient pas dessus à bon compte.** Un dossier de fichiers séparés avec des liens qui fonctionnent entre eux désigne obsidian-export ou votre propre script ; un document unique destiné à être lu par une personne désigne la voie de la fusion. Convertir dans le mauvais sens puis remettre en forme à la main, c’est la version la plus lente de ce travail.
2. **Cherchez les quatre constructions dans le coffre avant de choisir.** Un `grep` sur `![[`, sur `> [!`, sur `#^`, et sur ```` ```dataview ````. Un coffre sans intégrations ni encadrés peut utiliser à peu près n’importe quoi ici ; un coffre bâti dessus a besoin d’un outil dont vous avez réellement lu le traitement de ces cas.
3. **Vérifiez si les pièces jointes doivent suivre.** Si c’est le cas, la voie du greffon ou un export en ligne de commande fichier à fichier sont les seules options qui les transportent. Une fusion purement Markdown ne le peut pas, par construction, et aucun réglage n’y change rien.
4. **Comptez combien de fois cela se produira.** Une fois, c’est un onglet de navigateur. Chaque semaine, ou à chaque commit, c’est un outil en ligne de commande dans un script — une personne qui pense à faire glisser une archive sur une page est l’étape qui finit par ne plus arriver.
5. **Cherchez les noms de fichiers en double avant de faire confiance à une réécriture automatique.** `find . -name '*.md' | xargs -n1 basename | sort | uniq -d` prend une seconde. Rien en retour signifie que tous les outils d’ici sont sûrs sur cet axe ; des lignes en retour signifient que seul un script que vous contrôlez les tranchera comme vous l’entendiez.

## Conclusion

Il n’y a pas de palier payant à comparer ici, ce qui fait de ce comparatif un exercice exceptionnellement honnête : toutes les voies sont gratuites, et la décision porte entièrement sur la forme de la sortie et sur la part du dialecte d’Obsidian que chacune comprend. Pour un coffre qui doit rester un dossier de fichiers liés et fonctionnels, obsidian-export est l’outil gratuit conçu exactement pour cela. Pour une note ou un dossier dont les images doivent voyager avec, un greffon communautaire est la seule voie qui transporte des binaires. Pour un coffre qui devient un document unique que quelqu’un lira hors d’Obsidian, [la conversion Obsidian vers Markdown](/obsidian-to-markdown) de TransformPipe fait la fusion, le sommaire, la réduction des wikiliens et le retrait du frontmatter en une seule passe, dans le navigateur, sans rien téléverser. Quel que soit votre choix, désactivez « Use \[\[Wikilinks\]\] » le jour même pour que l’arriéré cesse de grossir, et cherchez les blocs Dataview tant que le coffre est encore ouvert — c’est la seule chose qu’aucun convertisseur d’ici, à aucun prix, ne récupère. Si Obsidian n’est pas la seule source en jeu, [le comparatif des trois exports](/blog/markdown-from-notion-obsidian-and-confluence) couvre ce que Notion et Confluence font différemment.

## FAQ

### Existe-t-il un convertisseur Obsidian vers Markdown réellement gratuit ?

Ils le sont tous. Les fichiers d’Obsidian sont déjà du Markdown et chaque outil de cette page est gratuit à l’usage : il n’y a donc aucun palier payant auquel les comparer. Les options diffèrent selon qu’elles produisent des fichiers séparés ou un document unique, et selon le degré auquel elles traitent wikiliens, intégrations, références de bloc et encadrés.

### Obsidian dispose-t-il d’un export Markdown intégré ?

Non, et il n’en a pas besoin — le coffre est déjà un dossier de fichiers `.md`. Obsidian propose bien un réglage « Use \[\[Wikilinks\]\] » qui rend les nouveaux liens conformes au Markdown standard, mais il ne s’applique qu’aux liens écrits après le changement : c’est donc une mesure préventive plutôt qu’un export.

### Quelle est la manière gratuite la plus rapide de transformer tout un coffre en un seul fichier ?

Zippez le dossier du coffre et déposez-le sur un convertisseur en ligne qui lit l’archive directement — il rend un document unique où chaque note est une section, sous un sommaire généré. Rien à installer, et le problème des wikiliens se règle tout seul, puisqu’un document fusionné n’a plus de fichiers distincts vers lesquels des liens pourraient pointer.

### Un convertisseur gratuit conservera-t-il mes images ?

Certains seulement. Un greffon qui exporte une note ou un dossier avec ses pièces jointes empaquetées le fera ; un outil qui produit un seul document Markdown ne le peut pas, parce qu’un fichier Markdown contient du texte et une référence à une image, jamais l’image elle-même. Vérifiez quel comportement vous obtenez avant de convertir un coffre dont les schémas portent le sens.

### Pandoc peut-il convertir gratuitement un coffre Obsidian ?

Pandoc est gratuit et sous licence GPL, et il analyse les wikiliens via l’extension `wikilinks_title_after_pipe`, non activée par défaut. Ce qu’il ne peut pas faire, c’est résoudre un wikilien vers un fichier situé ailleurs dans le coffre, faute d’en avoir un index — au-delà des notes les plus simples, il lui faut donc un filtre ou un script d’enrobage qui fasse la résolution lui-même.

### Qu’advient-il des tableaux Dataview et des autres contenus de greffons ?

Rien ne les emporte, parce qu’ils n’ont jamais été dans le fichier. Dataview stocke la requête et produit le tableau au moment de l’affichage dans Obsidian : une note convertie montre donc la requête sous forme de bloc de code et aucun tableau. Notez où ces tableaux comptaient avant de convertir, tant qu’ils sont encore visibles.

### Est-il sûr de convertir un coffre dans un navigateur ?

Cela dépend entièrement de si la page téléverse le fichier ou le lit localement. Un convertisseur qui fait le travail dans votre propre navigateur n’envoie jamais l’archive nulle part, ce que vous pouvez vérifier en ouvrant le panneau réseau et en regardant qu’il ne se passe rien — cela vaut la peine d’être fait une fois pour un coffre contenant quoi que ce soit de privé.
