---
title: "Markdown vers PDF : toutes les voies et ce que chacune coûte"
description: "Toutes les voies du Markdown vers le PDF comparées : impression navigateur, Pandoc et LaTeX, wkhtmltopdf, WeasyPrint, Chrome sans interface, et ce qui casse."
updated: 2026-10-21
date: 2026-09-01
tag: Publication
keywords: markdown en pdf, convertir md en pdf, convertisseur markdown pdf, pandoc markdown pdf, markdown vers pdf en ligne de commande, imprimer du markdown en pdf, md en pdf sans installation
---

### En bref

Il n’existe pas de conversion directe du Markdown vers le PDF ; chaque outil passe par un format intermédiaire, et celui qu’il choisit décide de l’allure de votre PDF. Pour un document unique dont vous avez besoin tout de suite, convertissez-le en un fichier HTML complet et imprimez-le depuis le navigateur : c’est la meilleure typographie disponible gratuitement, et c’est dans la boîte de dialogue d’impression que vous réglez le format de papier et les marges. Pour un long document à sections numérotées, avec des en-têtes courants et une table des matières paginée, installez Pandoc et un moteur LaTeX, et acceptez la taille de l’installation. Pour une compilation qui tourne sans personne dedans, employez Chrome sans interface ou WeasyPrint, et posez les règles de page dans la CSS plutôt que dans une boîte de dialogue que personne ne sera là pour cliquer.

Markdown n’a pas de pages. Il a des titres, des paragraphes, des listes et du code, et il ne dit rien de l’endroit où une feuille de papier s’arrête et où la suivante commence. Le PDF est tout le contraire : un format de page fixe, une marge fixe, une rupture entre la page quatre et la page cinq, et chaque police employée transportée à l’intérieur du fichier. Convertir de l’un vers l’autre n’est pas une traduction, c’est une invention. Il faut bien que quelque chose décide du format de papier, des marges, de l’endroit où le tableau se coupe et de la police qui sera intégrée, et si vous ne décidez pas, l’outil décide pour vous.

C’est pourquoi le même fichier `.md` donne quatre PDF différents avec quatre outils différents, et pourquoi les écarts ne sont pas cosmétiques. L’un pose vos blocs de code sur un fond gris, l’autre les imprime sur blanc en coupant les lignes longues à la marge. L’un numérote les pages, l’autre imprime l’URL du fichier et la date d’hier en haut de page. L’un intègre la police que vous avez choisie, l’autre lui en substitue une autre sans vous le dire.

Il y a quatre voies, et quatre seulement. Convertir en HTML et imprimer depuis un navigateur. Convertir en LaTeX et composer. Convertir en HTML et le confier à un moteur HTML vers PDF dédié. Ou ouvrir le fichier dans un éditeur doté d’un menu d’export. Tout le reste est l’une de ces quatre voies dans un autre emballage, y compris tous les convertisseurs en ligne qui promettent un PDF en un clic.

## Comparatif rapide : l’aide-mémoire

| Voie | Idéale pour | Ce qu’elle exige | Contrôle sur la page | Licence et prix |
| --- | --- | --- | --- | --- |
| HTML, puis impression depuis le navigateur | Un document, tout de suite | Un navigateur que vous avez déjà | Papier, marges, échelle, fonds — depuis une boîte de dialogue | Gratuit |
| Pandoc + pdflatex | De la prose ordinaire, sans glyphes inhabituels | Pandoc plus une installation TeX | Total, par les variables du gabarit | Gratuit, GPL ; TeX Live gratuit |
| Pandoc + xelatex ou lualatex | Polices du système, écritures non latines, mathématiques | Les mêmes, plus les polices | Total | Gratuit, GPL |
| Pandoc + Typst | Une page de qualité LaTeX sans installer TeX | Pandoc plus le binaire Typst | Total, par la syntaxe propre à Typst | Gratuit ; Typst est en Apache 2.0 |
| Pandoc + WeasyPrint | La CSS que vous connaissez déjà, avec de vraies règles de page | Python plus WeasyPrint | Total, par les médias paginés CSS | Gratuit, BSD |
| WeasyPrint sur votre propre HTML | En-têtes courants, compteurs de pages, signets PDF | Python plus WeasyPrint | Total, par la CSS | Gratuit, BSD |
| wkhtmltopdf | Un script qui l’appelle déjà | Un binaire unique | Bon, par les options en ligne de commande | Gratuit, LGPLv3 ; dépôt archivé |
| Chrome sans interface | Une étape de compilation, ou beaucoup de fichiers d’un coup | Chrome ou Chromium installé | Par la CSS d’impression du document | Gratuit |
| Puppeteer | La même chose, scriptée, avec les marges dans le code | Node plus un téléchargement de Chromium | Total, par l’API | Gratuit, Apache 2.0 |
| Typora | Écrire et exporter dans une seule application | Une installation de bureau, payante | Celui du thème, plus une mise en page | 14,99 $ en une fois, jusqu’à 3 appareils |
| Obsidian | Un coffre dans lequel vous écrivez déjà | Une installation de bureau | Celui du thème | Gratuit ; licence commerciale facultative |
| Extension VS Code | Le fichier est déjà ouvert dans votre éditeur | Une extension, souvent un Chromium | Ce que l’extension expose | Gratuit, variable selon l’extension |
| Markdown vers `.docx`, puis Word ou LibreOffice | Quelqu’un devra le modifier après vous | Pandoc plus une suite bureautique | La mise en page de la suite | Gratuit avec LibreOffice |

Prix vérifiés sur typora.io et obsidian.md, le 8 septembre 2026. L’avis sur le dépôt wkhtmltopdf a été vérifié sur github.com, le 8 septembre 2026.

## Convertir en HTML, puis imprimer depuis le navigateur

C’est la voie que la plupart des gens devraient prendre pour un document unique, et celle dont ils se méfient parce qu’elle semble trop simple. Convertissez le Markdown en un fichier HTML complet — pas un fragment, un document avec un doctype, un en-tête et ses styles en ligne — ouvrez-le, et appuyez sur le raccourci d’impression. Choisissez « Enregistrer au format PDF » comme destination.

La typographie est la raison de procéder ainsi. La sortie d’impression d’un navigateur vient du même moteur de rendu que celui qui affiche chaque page que vous regardez : un vrai crénage, des ligatures, une césure de ligne correcte, du texte vectoriel à tous les zooms, et des sous-ensembles de polices intégrés au PDF produit. Rien de gratuit ne fait mieux, et plusieurs choses payantes font moins bien. Si le document pose `lang` sur l’élément racine et `hyphens: auto` dans sa feuille de style, vous obtenez aussi la coupure des mots, ce qui fait toute la différence entre un paragraphe justifié qui se lit bien et un paragraphe plein de lézardes.

La contrepartie, c’est que tout votre contrôle vit dans une boîte de dialogue, et cette boîte mérite d’être comprise, car quatre de ses réglages modifient votre document en silence.

| Réglage | Ce qu’il fait réellement | Pourquoi cela compte |
| --- | --- | --- |
| Destination | Choisit une imprimante physique ou « Enregistrer au format PDF » | Seul « Enregistrer au format PDF » produit un fichier ; le PDF d’un pilote d’imprimante peut matricer le texte |
| Format de papier | A4, Letter, Legal et le reste | A4 fait 210 sur 297 mm, Letter 8,5 sur 11 pouces ; une mise en page réglée pour l’un se recompose sur l’autre |
| Marges | Par défaut, aucune, minimales, personnalisées | « Aucune » pousse le contenu jusqu’au bord du papier, ce que la plupart des imprimantes physiques ne savent pas reproduire |
| Échelle | « Ajuster à la zone imprimable », ou un pourcentage | L’ajustement rétrécit tout : un seul tableau trop large rend le corps de texte plus petit que ce que vous aviez réglé |
| Graphiques d’arrière-plan | Désactivé par défaut | C’est le réglage qui supprime le fond de vos blocs de code et les rayures de vos tableaux |
| En-têtes et pieds de page | Désactivés ou activés | Activés, ils impriment le titre de la page, l’emplacement du fichier, la date et un numéro de page, dans la typographie du navigateur |

Deux de ces valeurs par défaut causent l’essentiel des plaintes sur les PDF imprimés depuis un navigateur. Les graphiques d’arrière-plan sont désactivés parce que l’encre coûte cher, et l’effet sur un document technique est que chaque bloc de code ombré, chaque encadré coloré et chaque tableau rayé ressort d’un blanc plat. Activez-les. Les en-têtes et pieds de page sont une commodité pour imprimer une page web et un défaut pour tout ce que vous envoyez à quelqu’un : ils tamponnent un chemin `file:///Users/you/Downloads/…` en haut de la première page. Désactivez-les.

La CSS du document peut en reprendre une partie. Une feuille de style qui déclare `@page { size: A4; margin: 20mm; }` donne à la boîte de dialogue un point de départ raisonnable, et les règles `@media print` permettent de retirer la navigation, de déplier les sections repliées et d’imposer des couleurs qui survivent à une imprimante monochrome. C’est aussi là que vous placez `break-inside: avoid` pour qu’un tableau ou une figure cesse de se couper au passage à la page.

| Avantages | Inconvénients |
| --- | --- |
| La meilleure typographie disponible sans rien payer | Une personne doit cliquer dans une boîte de dialogue : ce n’est donc pas une étape de compilation |
| Aucune installation, et aucun téléversement si la conversion tourne dans le navigateur | Pas d’en-tête ni de pied de page courants de votre propre conception |
| Le PDF est produit depuis un fichier que vous pouvez garder et réimprimer | Pas de table des matières paginée, pas de renvois croisés |
| À deux réglages du résultat correct, une fois que vous savez lesquels | Un document à la fois |

**Pour qui ?** Pour quiconque a un document et un destinataire. Un convertisseur qui vous rend du HTML autonome avec ses styles en ligne fait de ceci un travail en deux étapes, et [ce qui arrive à votre fichier au passage](/blog/markdown-to-html-converter) mérite d’être lu avant de faire confiance à la sortie de l’un d’eux. TransformPipe effectue la conversion dans votre navigateur et imprime par la même boîte de dialogue, et c’est pourquoi il est à côté de cette liste plutôt que dedans : le PDF est l’œuvre du navigateur, pas celle du convertisseur.

## Pandoc avec un moteur LaTeX

`pandoc report.md -o report.pdf` est la commande que tout le monde cite, et elle induit en erreur d’une manière bien précise : Pandoc ne fabrique pas de PDF. Il convertit votre Markdown en LaTeX puis lance un moteur de composition externe, qui est la chose qui produit réellement le fichier. Si ce moteur n’est pas installé, la commande échoue, et l’erreur nomme un binaire dont vous n’avez jamais entendu parler.

Cette indirection est aussi la source de la qualité. TeX compose des mathématiques et de la prose longue depuis les années 1980, et son algorithme de coupure de lignes optimise des paragraphes entiers au lieu d’une ligne à la fois. Pour une thèse, un manuel, un contrat ou tout ce qui comporte des sections numérotées et des équations, il reste la meilleure sortie de cette page.

### Quel moteur, et ce que son installation coûte

| Moteur | Sélectionné par | À employer quand | Coût |
| --- | --- | --- | --- |
| pdflatex | La valeur par défaut | De la prose ordinaire, sans glyphes inhabituels | Une installation TeX |
| xelatex | `--pdf-engine=xelatex` | Vous voulez les polices du système, ou des écritures non latines | La même, plus les polices |
| lualatex | `--pdf-engine=lualatex` | La même chose, avec du script Lua dans le gabarit | La même |
| Typst | `--pdf-engine=typst` dans les Pandoc récents | Vous voulez une installation rapide et légère plutôt que TeX | Un binaire, Apache 2.0 |
| WeasyPrint | `--pdf-engine=weasyprint` | Vous préférez écrire de la CSS que du LaTeX | Python et une installation pip |
| wkhtmltopdf | `--pdf-engine=wkhtmltopdf` | Une chaîne héritée l’attend | Un binaire, non maintenu |

L’installation est le vrai coût, et il vaut mieux le dire sans fard. Une distribution TeX complète est de loin la plus grosse dépendance de toutes les chaînes documentaires que la plupart des gens assemblent ; elle se mesure en gigaoctets et elle prend du temps. Les petites distributions — BasicTeX, TinyTeX — s’installent dans une fraction de cet espace puis échouent la première fois que votre document réclame un paquet qu’elles ont laissé de côté. L’échec est au moins lisible : LaTeX s’arrête et nomme le fichier `.sty` manquant, et `tlmgr install <package>` va le chercher. Vous ferez cela quatre ou cinq fois avant qu’un premier document ne se construise, puis plus jamais sur cette machine.

### Les options qui font le travail

| Option | Effet |
| --- | --- |
| `-V geometry:margin=25mm` | Règle la marge de la page via le paquet geometry |
| `-V mainfont="Source Serif 4"` | Choisit une police du système ; exige xelatex ou lualatex |
| `-V fontsize=11pt` | Taille du corps de texte, que les 10pt par défaut satisfont rarement |
| `-V documentclass=report` | Des chapitres et une page de titre au lieu d’un article |
| `--toc` | Une table des matières, paginée, engendrée depuis vos titres |
| `--number-sections` | Numérote les titres en conséquence |
| `-V colorlinks=true` | Des liens colorés au lieu des cadres par défaut |
| `--highlight-style=tango` | Choisit le thème de coloration du code |
| `--include-in-header=head.tex` | Injecte du LaTeX brut, ce qui est la façon d’obtenir de vrais en-têtes courants |

`--toc` et `--number-sections` ensemble sont la raison honnête de quitter le navigateur. Une table des matières qui indique « Étapes de migration … 14 » ne peut pas être produite par un navigateur du tout, car un navigateur ne sait pas sur quelle page une chose atterrit tant qu’il ne l’a pas déjà imprimée.

### Ce qui casse

Les longues lignes de code sont les premières à sauter. LaTeX ne coupe pas le texte verbatim : une commande shell plus large que le bloc de texte sort donc par le bord droit du papier et disparaît purement et simplement. Le remède est une configuration de coloration qui coupe les lignes, ou des lignes plus courtes dans la source ; dans les deux cas, il faut le remarquer, car rien ne vous prévient. [Comment les blocs de code voyagent d’un format à l’autre](/blog/code-blocks-in-markdown) traite la version large de ce problème.

Les tableaux trop larges échouent de la même façon, et plus visiblement. L’Unicode est le second piège : pdflatex lui est antérieur, si bien qu’un document contenant une apostrophe courbe venue d’un traitement de texte, une lettre grecque, un nom chinois ou un émoji s’arrête sur une erreur de caractère indéfini. Passer à xelatex règle l’essentiel ; les émojis n’apparaîtront toujours pas, faute de tracé monochrome pour eux dans une police de texte ordinaire.

| Avantages | Inconvénients |
| --- | --- |
| La meilleure sortie gratuite pour les longs documents | La plus grosse installation de toutes les voies présentées ici |
| Une table des matières paginée, et des renvois croisés | Les erreurs LaTeX sont réputées illisibles |
| Reproductible : la même commande donne le même fichier | Personnaliser le gabarit veut dire apprendre le LaTeX |
| Une seule commande convertit aussi en HTML, DOCX et EPUB | Le HTML brut dans le Markdown est ignoré, pas rendu |

**Pour qui ?** Pour quiconque produit un document qui sera lu sur papier, relié, ou déposé quelque part où des règles de mise en forme s’appliquent. Et aussi pour quiconque fabrique le même PDF chaque semaine, car la commande est la spécification et elle ne dérive pas.

## Les moteurs HTML vers PDF : wkhtmltopdf, Chrome sans interface et WeasyPrint

Ils se placent entre les deux voies ci-dessus. Vous convertissez toujours en HTML, mais c’est un programme qui l’imprime au lieu d’une personne, ce qui lui permet de tourner dans une compilation. Ils diffèrent par le moteur de rendu qu’ils emploient, et ce seul fait détermine ce que votre CSS a le droit de contenir.

| Moteur | Moteur de rendu | En-têtes et pieds de page | CSS moderne | Maintenu |
| --- | --- | --- | --- | --- |
| wkhtmltopdf | Qt WebKit, un vieux fork | Oui, par des options, avec des variables de page | Peu fiable | Dépôt archivé, janvier 2023 |
| Chrome sans interface | Chromium actuel | Seulement la bande propre au navigateur, ou via les gabarits Puppeteer | Tout ce que fait un navigateur | Oui |
| WeasyPrint | Le sien, écrit en Python pour la pagination | Oui, par les boîtes de marge CSS | Partielle : flexbox et grid sont limités | Oui |

### wkhtmltopdf

wkhtmltopdf est un outil en ligne de commande qui rend du HTML avec le moteur Qt WebKit et est publié sous LGPLv3 (vérifié sur wkhtmltopdf.org, le 8 septembre 2026). Son dépôt GitHub porte l’avis « This repository was archived by the owner on Jan 2, 2023. It is now read-only » (vérifié sur github.com, le 8 septembre 2026).

Sa surface en ligne de commande est franchement bonne, et meilleure que celle d’un navigateur pour ce travail : `--margin-top` et ses frères règlent les marges en unités réelles, `--header-html` et `--footer-html` acceptent des fichiers HTML, `--footer-center "[page]/[topage]"` vous donne « 3/12 » au bas de chaque page, `--print-media-type` lui fait respecter vos règles `@media print`, et `--enable-local-file-access` est indispensable pour qu’il lise les images et les feuilles de style sur le disque. Si vous avez un script qui produit déjà des PDF acceptables avec ces options, rien ne presse de le remplacer.

Le problème est le moteur en dessous. C’est un fork d’un WebKit qui a cessé d’avancer il y a des années : une feuille de style écrite dans cette décennie — propriétés personnalisées, grid, comportement moderne de flexbox — peut donc s’afficher comme quelque chose que vous n’avez pas dessiné, sans la moindre erreur. Ne commencez rien de neuf ici.

### Chrome sans interface

`chrome --headless --print-to-pdf=out.pdf report.html` emploie exactement le moteur qu’emploie la boîte de dialogue d’impression : la sortie correspond donc à ce que vous aviez à l’écran. C’est tout son argument, et il est solide.

Le piège, c’est que les cases à cocher de la boîte de dialogue ne sont pas sur la ligne de commande. Chrome applique ses propres marges par défaut, et le fait qu’il tamponne ou non la bande avec l’URL et le numéro de page dépend d’une option dont le nom a changé selon les versions — lancez `chrome --help` sur la version que vous avez plutôt que de recopier une option depuis un billet de blog. Tout le reste de ce que vous voulez doit se trouver dans la CSS d’impression du document, ce qui est de toute façon sa juste place.

Puppeteer supprime les devinettes. Son appel `page.pdf()` accepte `format`, `margin`, `printBackground`, `displayHeaderFooter`, `headerTemplate` et `footerTemplate` : format de papier, marges et pied de page courant vivent donc dans le code, à côté de tout le reste de votre compilation. `printBackground: true` est le remède au fond de bloc de code manquant qui attrape tout le monde la première fois. Puppeteer est gratuit et sous licence Apache 2.0 ; il télécharge son propre Chromium, ce qui représente un gros coût unique dans un cache d’intégration continue.

### WeasyPrint

WeasyPrint est une bibliothèque Python doublée d’un outil en ligne de commande, sous licence BSD, et ce n’est pas un navigateur. Sa documentation indique qu’il est « fondé sur diverses bibliothèques mais pas sur un moteur de rendu complet comme WebKit ou Gecko », avec un moteur de mise en page CSS écrit en Python et conçu pour la pagination (vérifié sur doc.courtbouillon.org, le 8 septembre 2026).

Ce choix de conception est tout l’intérêt. Il prend en charge la règle `@page` avec les sélecteurs `:left`, `:right`, `:first` et `:blank`, les boîtes de marge de page, les compteurs fondés sur la page, et les propriétés `bookmark-level`, `bookmark-label` et `bookmark-state` qui construisent le plan du PDF — les titres deviennent des signets par défaut. Les ancres internes comme les URL externes ressortent en liens cliquables (le tout vérifié sur doc.courtbouillon.org, le 8 septembre 2026). Les navigateurs n’implémentent rien de la machinerie des boîtes de marge : c’est donc la seule voie de cette page qui vous donne un véritable en-tête courant en CSS plutôt qu’en LaTeX.

Le coût est l’autre moitié du même choix. Sa propre documentation décrit flexbox comme fonctionnant « pour des cas d’usage simples, mais sans tests approfondis » et grid comme fonctionnant « pour des cas simples, mais avec quelques limites » (vérifié sur doc.courtbouillon.org, le 8 septembre 2026). Donnez-lui un document, pas une mise en page d’application, et il est excellent.

**Pour qui ?** Pour quiconque doit voir son PDF produit par une machine selon un calendrier : un rapport nocturne, une facture engendrée, un PDF joint à chaque version. Choisissez Chrome ou Puppeteer si le document est déjà une page web qui vous convient ; choisissez WeasyPrint s’il vous faut des en-têtes courants, des compteurs de pages et des signets, et que vous préférez écrire de la CSS que du LaTeX.

## Les éditeurs qui exportent un PDF directement

La voie la plus courte de toutes, quand le fichier est déjà ouvert devant vous. Chacun d’eux est l’une des voies ci-dessus surmontée d’une entrée de menu — la plupart embarquent un moteur de navigateur — si bien que la seule question est de savoir si l’export est assez bon et si vous pouvez le répéter.

| Éditeur | Comment il exporte | Prix et licence |
| --- | --- | --- |
| Typora | « Export to PDF with bookmarks », plus docx, LaTeX, EPUB et d’autres | 14,99 $ hors taxes, une licence couvrant jusqu’à 3 appareils, essai gratuit de 15 jours (vérifié sur typora.io, le 8 septembre 2026) |
| Obsidian | Export vers PDF intégré, depuis la note | Gratuit pour tout usage, usage commercial compris ; une licence commerciale est facultative à 50 $ par utilisateur et par an (vérifié sur obsidian.md/pricing, le 8 septembre 2026) |
| VS Code | Une extension ; la plupart embarquent ou téléchargent un Chromium et impriment avec | Gratuit, mais la qualité de l’extension est celle de l’extension |
| Word ou LibreOffice | Convertir le Markdown en `.docx` avec Pandoc, puis exporter depuis la suite | Gratuit avec LibreOffice |

Prix et conditions vérifiés sur typora.io et obsidian.md, le 8 septembre 2026.

VS Code est le seul éditeur du tableau sans export PDF qui lui soit propre. Markdown PDF est l’une des extensions qui l’ajoutent : elle pilote un navigateur basé sur Chromium via Puppeteer et écrit aussi du HTML, du PNG ou du JPEG à partir des mêmes réglages, et la feuille de style de l’aperçu n’est pas celle avec laquelle elle imprime — [Markdown vers HTML dans VS Code](/blog/markdown-to-html-in-vs-code) passe ces réglages en revue, avec ce que chaque voie d’export met autour de la page.

| Avantages | Inconvénients |
| --- | --- |
| Une entrée de menu, pas de terminal, pas d’archéologie de boîte de dialogue | L’habillage est celui du thème de l’éditeur, pas celui de votre document |
| Le thème est en général conçu pour la lecture : le résultat par défaut est correct | Non scriptable, donc impossible à intégrer à une compilation |
| Des signets et un plan cliquable chez les meilleurs | Enfermé dans cette application, sur cette machine |
| Le détour par `.docx` laisse un fichier que quelqu’un peut modifier | Chaque saut par un format de plus fait perdre quelque chose |

Le détour par `.docx` mérite sa propre note, car il résout un problème qu’aucune autre voie ne résout. Si la personne qui reçoit le document voudra le modifier, un PDF est une impasse et un fichier Word n’en est pas une. `pandoc report.md -o report.docx --reference-doc=house-style.docx` applique vos propres styles, et LibreOffice convertira le résultat sur un serveur avec `soffice --headless --convert-to pdf report.docx`. Deux conversions, c’est une de plus que l’idéal, et c’est le prix à payer pour remettre à quelqu’un quelque chose qu’il peut modifier — et si le `.docx` est le livrable plutôt qu’une étape, [faire entrer du Markdown dans un fichier Word que quelqu’un peut modifier](/blog/markdown-to-word) est l’endroit où le document de référence, les styles que Pandoc cherche et le coût du voyage retour sont traités comme il faut.

**Pour qui ?** Pour les rédacteurs, pour des brouillons et pour tout ce dont on demande seulement que « ça ait l’air correct ». Pas pour des compilations, et pas pour des documents soumis à une charte graphique.

## Ce que les gens ratent

Cinq choses cassent dans les PDF faits depuis du Markdown, et elles cassent de la même façon quelle que soit la voie choisie.

| Symptôme | Cause | Remède |
| --- | --- | --- |
| Les blocs de code et les tableaux ont perdu leur fond | « Graphiques d’arrière-plan » est désactivé par défaut dans la boîte de dialogue | Activez-le, ou passez `printBackground: true` dans Puppeteer |
| Un titre reste seul en bas de page | Rien n’a dit au moteur de le garder avec son texte | `break-after: avoid` sur les titres, `break-inside: avoid` sur les tableaux et les figures |
| Le corps de texte est sorti plus petit que prévu | « Ajuster à la zone imprimable » a rétréci tout le document pour caser un élément trop large | Trouvez le tableau ou la ligne de code trop large et corrigez-le, puis imprimez à 100 % |
| La première page porte un chemin de fichier en haut | « En-têtes et pieds de page » est activé | Désactivez-le, ou employez un moteur dont vous contrôlez le pied de page |
| Les longues lignes de code sont coupées à la marge | LaTeX ne coupe pas le texte verbatim | Coupez les lignes dans la source, ou prenez une voie qui pratique le retour à la ligne automatique |
| Des images manquent complètement | Des chemins relatifs qui ne se résolvent plus depuis l’endroit où se trouve le HTML | Intégrez les images, ou convertissez avec le fichier à sa place |
| Un caractère est sorti en carré, ou pas du tout | La police intégrée n’a pas de glyphe pour lui | Changez de police, ou de moteur, et cessez d’employer des émojis à l’impression |
| Chaque page est en A4 chez vous et en Letter chez eux | Aucun format de page dans le document : le moteur a pris la valeur par défaut de sa localisation | Déclarez `@page { size: A4 }` ou passez le format explicitement |

### Les sauts de page

Markdown n’a pas de saut de page. Il n’existe aucune syntaxe pour cela, aucune extension qui en ajoute une de façon portable, et aucune quantité de lignes vides n’y parviendra. Vous forcez un saut en mettant du HTML brut dans le fichier Markdown :

```markdown
Text before the break.

<div style="break-after: page"></div>

Text on the next page.
```

`break-after: page` est la propriété CSS actuelle ; `page-break-after: always` est l’ancien alias que les vieux moteurs réclament encore, et inclure les deux est sans danger. Deux choses tournent alors mal. La première, c’est qu’un convertisseur qui ignore le HTML brut — la voie LaTeX de Pandoc en fait partie — abandonne votre `div` et le saut avec lui ; sous LaTeX, vous voulez plutôt `\newpage` dans un bloc brut. La seconde, c’est qu’un convertisseur qui assainit supprimera l’attribut `style`, parce que les styles en ligne sont exactement le genre de chose qu’une liste blanche retire, et votre saut disparaît sans le moindre avertissement. [Pourquoi l’assainissement retire plus que des scripts](/blog/sanitising-markdown-safely) explique ce qui survit d’ordinaire et ce qui ne survit pas.

### Les marges

Trois parties règlent vos marges et une seule l’emporte : la boîte de dialogue d’impression, la règle `@page` du document, et la bordure non imprimable de l’imprimante physique. Décidez laquelle fait autorité et laissez les autres tranquilles. Pour un PDF qui sera lu à l’écran, mettez la marge dans la CSS et laissez la boîte de dialogue sur Par défaut. Pour un PDF qui sera imprimé sur un appareil précis, laissez au moins 10 mm et testez sur cet appareil, car « Marges : aucune » produit un fichier dont une imprimante laser rognera les bords.

### Les en-têtes et les pieds de page

C’est la ligne de partage la plus nette entre les voies. Le navigateur vous donne une bande, avec son contenu et sa typographie choisis pour vous, activée ou désactivée. Tout le reste — un titre de document à gauche, un numéro de page à droite, rien du tout sur la première page — exige les boîtes de marge CSS, que les navigateurs n’implémentent pas, ou du LaTeX, qui le fait par un paquet. Si votre document doit porter un en-tête courant, vous avez choisi WeasyPrint ou LaTeX, que vous l’ayez voulu ou non.

### La survie des liens

Les liens cliquables d’un PDF sont des annotations posées par-dessus le texte, et leur écriture dépend du moteur : la seule vérification fiable consiste donc à ouvrir le PDF fini et à en cliquer un. Les liens internes — d’une table des matières vers un titre — dépendent de la présence d’identifiants sur les titres du HTML, qu’un convertisseur engendre ou non. Pour un document qui sera imprimé sur papier, les liens sont invisibles, et une seule règle d’impression y remédie :

```css
@media print {
  a[href^="http"]::after {
    content: " (" attr(href) ")";
  }
}
```

Cela imprime l’URL entre parenthèses après le texte du lien, ce qui est laid à l’écran et reste la seule option lisible sur papier. Les liens et les images relatifs ont leur propre mode de défaillance, puisqu’un PDF ne peut pas résoudre `../images/diagram.png` après coup : [des chemins qui continuent de fonctionner quand le fichier bouge](/blog/images-and-links-that-still-work) est la version de ce problème que l’on rencontre en premier.

### L’intégration des polices

Un PDF transporte un sous-ensemble de chacune des polices qu’il emploie réellement, ce qui le fait ressembler au même document partout — et il ne peut transporter qu’une police disponible au moment de sa fabrication. Deux modes de défaillance en découlent. Un document qui demande une police web par le réseau, converti sans réseau, retombe silencieusement sur autre chose et intègre cette autre chose ; le PDF n’est pas cassé, il n’est simplement pas ce que vous aviez dessiné. Un document qui nomme une pile de polices du système intègre ce que cette machine-là possédait : vous et un collègue produisez donc des PDF visuellement différents depuis le même Markdown et la même commande.

Le remède est d’être explicite. Nommez une police, livrez-la avec le document ou installez-la sur la machine de compilation, et laissez la pile retomber sur une serif générique dont la substitution sera prévisible. Vérifiez le résultat : n’importe quel lecteur de PDF liste les polices intégrées dans les propriétés du document, et une police signalée comme « Type 3 » ou comme non intégrée est une police que votre lecteur ne verra pas.

## Où la voie du navigateur échoue, et ce qu’il en coûte de la quitter

Imprimer depuis le navigateur est le bon choix par défaut, et il a un plafond net. Il vaut la peine de nommer ce plafond avec précision, car la plupart des gens n’ont pas besoin d’aller au-delà, et ceux qui en ont besoin devraient savoir ce qu’ils achètent.

| Ce que vous ne pouvez pas faire dans un navigateur | Pourquoi | Ce que coûte le remède |
| --- | --- | --- |
| Un en-tête ou un pied de page courant de votre propre conception | Les navigateurs n’implémentent pas les boîtes de marge CSS | WeasyPrint, ou LaTeX via Pandoc |
| Une table des matières paginée | La page où atterrit un titre n’est pas connue avant la fin de la mise en page | Le `--toc` de Pandoc, ou un moteur à compteurs de pages |
| Un renvoi du type « voir page 14 » | La même raison | LaTeX, ou les compteurs de WeasyPrint |
| Produire le fichier sans surveillance | Une boîte de dialogue exige une personne | Chrome sans interface, Puppeteer, ou WeasyPrint |
| Un seul PDF depuis douze fichiers de chapitres | Le navigateur imprime un document | Fusionnez d’abord le Markdown, ou fusionnez les PDF après |
| Garantir l’absence de tout titre veuf | Le contrôle des ruptures est approximatif d’un moteur à l’autre | Des sauts manuels, et un relecteur qui vérifie |

Chaque remède a un prix, et les prix ne s’équivalent pas. LaTeX vous achète la plus belle page de cette liste au prix de la plus grosse installation et d’un langage de gabarit à apprendre ; le gabarit est un travail unique, mais c’est un vrai travail unique et il faut que quelqu’un en soit responsable. WeasyPrint vous achète des règles de page en CSS au prix d’une dépendance Python et d’un moteur de mise en page qui n’est pas un navigateur : une feuille de style bâtie autour de grid devra donc être réécrite. Chrome sans interface vous achète la reproductibilité au prix d’un navigateur dans votre image de compilation, ce qui n’est pas léger et demande des mises à jour pour les mêmes raisons de sécurité que celui de votre portable. wkhtmltopdf vous achète des options commodes et vous remet une dépendance archivée, c’est-à-dire une dette avec une échéance.

Le cas des fichiers multiples est celui que l’on rencontre le plus tôt et que l’on attend le moins. Un manuel de douze chapitres, ce sont douze fichiers `.md`, et un PDF est un seul document : il faut donc bien que quelque chose les réunisse — dans le bon ordre, avec les niveaux de titre décalés pour que le `#` du chapitre deux ne concurrence pas le titre du document. [Faire un seul document de plusieurs fichiers Markdown](/blog/merging-many-markdown-files) est un travail distinct de la conversion, et le faire dans le mauvais ordre est la manière dont une table des matières se retrouve avec trois entrées « Introduction ».

## Comment choisir

1. **Partez de qui produit le fichier.** Si c’est une personne qui fabrique le PDF quand il est nécessaire, imprimez depuis le navigateur et arrêtez votre lecture ; si c’est une machine qui le fabrique selon un calendrier, il vous faut Chrome sans interface, Puppeteer ou WeasyPrint, car une boîte de dialogue ne s’automatise pas.
2. **Demandez-vous si le document a besoin de mobilier de page.** En-têtes courants, chapitres numérotés et table des matières paginée éliminent complètement le navigateur, et cette seule exigence est ce qui justifie d’installer LaTeX ou WeasyPrint.
3. **Comptez les glyphes avant de compter les fonctions.** Un document contenant du chinois, du grec, du cyrillique ou de la notation mathématique échouera sous pdflatex et fonctionnera sous xelatex, et le découvrir à la première compilation coûte moins cher que le découvrir à l’échéance.
4. **Accordez le moteur à la CSS que vous avez déjà écrite.** Si votre feuille de style emploie grid, seul un moteur de navigateur la disposera correctement ; si c’est une feuille de style de document avec des règles `@page`, WeasyPrint en tirera plus qu’un navigateur ne le peut.
5. **Décidez si quelqu’un devra le modifier ensuite.** Un PDF est définitif, et si la réponse est oui, vous voulez un `.docx` au milieu de la chaîne, ce qui change l’outil et l’effort.
6. **Imprimez une vraie page et regardez-la.** Pas l’aperçu — le PDF fini, ouvert dans un autre lecteur, avec le panneau des polices vérifié et un lien cliqué. Ce seul test attrape d’un coup les fonds manquants, les polices substituées, les liens morts et les lignes de code rognées, et il prend deux minutes.

## Conclusion

Le PDF depuis du Markdown est toujours un travail en deux étapes, et la question honnête est de savoir avec quel format intermédiaire vous voulez discuter. Pour un document unique avec un destinataire, convertissez le Markdown en un fichier HTML complet et autonome et imprimez-le depuis votre navigateur, fonds activés et en-têtes désactivés — c’est à cela que sert [la conversion du Markdown vers le HTML de TransformPipe](/), gratuite, dans le navigateur, sans rien téléverser quand vous n’êtes pas connecté. Pour un long document avec du mobilier de page, installez Pandoc et xelatex, écrivez le gabarit une fois et n’y pensez plus jamais. Pour un PDF qui doit apparaître sans personne à côté, mettez les règles de page dans la CSS et laissez Chrome sans interface ou WeasyPrint faire l’impression. Les trois sont gratuits ; toute la différence tient à ce que vous acceptez d’installer et de maintenir.

## FAQ

### Comment convertir du Markdown en PDF sans rien installer ?

Convertissez le Markdown en un fichier HTML complet dans un convertisseur qui tourne dans le navigateur, ouvrez le fichier, et imprimez-le en PDF avec la boîte de dialogue d’impression de votre navigateur. Aucun gestionnaire de paquets, aucun terminal, et avec un convertisseur qui travaille côté client, le document n’est jamais téléversé. Pensez à activer les graphiques d’arrière-plan et à désactiver les en-têtes et pieds de page avant d’enregistrer.

### Pourquoi mon PDF perd-il le fond de ses blocs de code ?

Parce que « Graphiques d’arrière-plan » est désactivé par défaut dans la boîte de dialogue d’impression, afin d’économiser l’encre des imprimantes physiques. Cela retire aussi les rayures des tableaux et les encadrés colorés : un document technique paraît donc plat et délavé. Activez l’option dans la boîte de dialogue, ou passez `printBackground: true` si vous imprimez via Puppeteer.

### Comment forcer un saut de page en Markdown ?

Il n’existe pas de syntaxe Markdown pour cela. Vous insérez du HTML brut — `<div style="break-after: page"></div>` — et vous espérez que le convertisseur le laisse passer, ou vous ajoutez `\newpage` dans un bloc LaTeX brut si vous convertissez avec Pandoc. Les convertisseurs qui assainissent retireront le style en ligne : testez donc le saut au lieu de supposer qu’il a survécu.

### Pandoc est-il la meilleure façon de convertir du Markdown en PDF ?

Il produit les meilleurs documents longs, et c’est l’option la plus lourde : `pandoc file.md -o file.pdf` exige un moteur LaTeX installé, et une distribution TeX complète est la plus grosse dépendance de la plupart des chaînes documentaires. Pour un rapport à sections numérotées avec une table des matières, elle vaut chaque gigaoctet. Pour une note d’une page, c’est plus d’outil que le travail n’en demande.

### Les hyperliens fonctionnent-ils encore dans un PDF engendré depuis du Markdown ?

En général, mais cela dépend du moteur : ouvrez donc le fichier fini et cliquez-en un. Les liens internes vers des titres ne fonctionnent que si le HTML intermédiaire a donné des identifiants à ces titres, ce que tous les convertisseurs ne font pas. Pour un document destiné à l’impression, ajoutez une règle d’impression qui ajoute l’URL entre parenthèses après chaque lien, car un lien cliquable sur papier n’est que du texte souligné.

### Pourquoi les polices sont-elles différentes dans le PDF et à l’écran ?

Un PDF n’intègre que les polices disponibles à l’instant de sa fabrication. Si le document demandait une police par le réseau et que le réseau n’était pas là, ou s’il nommait une police du système que votre machine possède et que le serveur de compilation n’a pas, le moteur a substitué quelque chose sans vous le dire. Vérifiez les polices intégrées dans les propriétés du document de votre lecteur de PDF et nommez une police que vous livrez réellement.

### Puis-je engendrer un PDF depuis du Markdown dans un travail d’intégration continue ?

Oui, et il y a trois façons raisonnables de le faire : Pandoc avec une image TeX, Chrome sans interface ou Puppeteer sur votre HTML converti, ou WeasyPrint. Chrome donne une sortie identique à celle d’un navigateur et demande un navigateur dans l’image ; WeasyPrint est une petite dépendance Python et vous donne de vraies règles de page en CSS. Quel que soit votre choix, mettez le format de papier et les marges dans le document plutôt que dans des options, pour que le même fichier s’imprime de la même façon à la main.
