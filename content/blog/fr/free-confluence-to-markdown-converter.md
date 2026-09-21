---
title: "Le meilleur convertisseur Confluence vers Markdown gratuit en 2026 : toutes les options comparées"
description: "Quel convertisseur Confluence vers Markdown est gratuit en pratique : où s’arrêtent les essais, pourquoi l’export intégré exige des droits d’administrateur d’espace"
date: 2026-09-14
tag: Conversion
keywords: convertisseur confluence markdown gratuit, convertir confluence en markdown, confluence vers markdown, exporter confluence en markdown gratuitement, export markdown confluence, application markdown confluence, export espace confluence markdown
---

Cherchez un convertisseur Confluence vers Markdown gratuit et tous les résultats annoncent « gratuit ». Puis vous les essayez. L’un est un essai de trente jours qui se présente comme gratuit sur sa fiche. L’un est réellement gratuit et traite une page à la fois, ce qui n’est pas ce que vous vouliez quand la chose à convertir est un wiki de quatre cents pages. L’un est gratuit et déjà intégré à Confluence, et vous arrête sur une permission que vous ne pouvez pas vous accorder vous-même. Et l’un fonctionnerait parfaitement si vous arriviez à sortir le contenu de Confluence dans une forme qu’il sache lire, ce qui est précisément le problème.

Cela fait une densité d’astérisques inhabituelle pour un travail qui paraît simple, et ce n’est pas un hasard. Confluence n’a pas d’export Markdown : chaque voie passe donc soit par un format d’export conçu pour autre chose, soit par une application que quelqu’un disposant de droits d’administration doit installer. Dans ce créneau, « gratuit » veut le plus souvent dire « gratuit pour vous si quelqu’un d’autre dit oui ».

Cet article traite de celles de ces voies qui sont réellement gratuites, pour qui, et à quelle échelle. Pour la mécanique — quel format d’export conserve quoi, en quoi se transforme chaque macro, pourquoi les liens internes cassent — [comment convertir une page Confluence en Markdown](/blog/convert-confluence-page-to-markdown) passe les formats d’export en revue un par un avec les dégâts que chacun cause. Celui-ci est la liste de courses.

### En bref

**La voie gratuite à l’échelle d’un espace entier, c’est un export plus une conversion.** L’export HTML d’espace intégré à Confluence ne coûte rien, mais il exige la permission d’administrateur d’espace, et l’export d’un administrateur d’espace ne contient que ce que son propre compte peut voir, sauf si c’est un administrateur de site qui le lance, auquel cas tout est exporté quelles que soient les restrictions de visibilité (vérifié sur support.atlassian.com, le 14 septembre 2026). Une fois cette archive en main, la convertir est gratuit par toutes les voies : déposez-la sur [un convertisseur en ligne](/confluence-to-markdown) pour obtenir un document fusionné unique avec un sommaire, ou pointez Pandoc ou un script turndown sur les fichiers HTML pour obtenir un fichier Markdown par page.

**Sur l’Atlassian Marketplace, lisez le mot au-dessus du bouton.** Une fiche coiffée de **Free app** est gratuite ; une fiche coiffée de **Try it free** est un essai avec un prix derrière. Les deux existent aujourd’hui dans cette catégorie, et la section ci-dessous nomme qui est quoi (vérifié sur marketplace.atlassian.com, le 14 septembre 2026). Dans les deux cas, quelqu’un disposant de droits d’administration doit l’installer, ce qui est la même barrière que pour l’export.

**Les exports Word et PDF sont gratuits et ne sont pas une voie.** Ce sont les deux exports que n’importe qui peut lancer sans permission, ce qui explique exactement pourquoi les gens s’y jettent, et ce sont les deux qui jettent la structure dont une conversion en Markdown a besoin.

## Pourquoi le « gratuit » est la partie difficile dans cette conversion précise

Pour la plupart des conversions, la gratuité est une question ennuyeuse. Un CSV est un fichier sur votre disque ; un convertisseur le lit ; personne n’approuve rien. Confluence est différent sur deux points, et les deux se transforment en argent ou en permission.

**Il n’existe pas d’export Markdown : chaque option gratuite fait donc deux métiers.** Une page est stockée dans le format de stockage propre à Confluence, fondé sur XHTML, et le menu d’export en propose des rendus — Word, PDF, HTML, XML, CSV — dont aucun n’est du Markdown. Un convertisseur doit donc être soit une application vivant dans Confluence et lisant ce format via l’API, soit une seconde étape après un export. Les applications coûtent de l’argent parce que ce sont des logiciels maintenus face à une API mouvante ; les secondes étapes sont gratuites parce que les pièces existent déjà. Voilà l’économie de toute cette catégorie.

**Les exports utiles sont conditionnés à une permission plutôt qu’à un paiement.** L’export Word et PDF d’une page isolée est accessible à quiconque peut lire la page. Tout ce qui est à l’échelle de l’espace — HTML, XML, CSV — exige la permission d’administrateur d’espace. La voie intégrée gratuite ne coûte pas d’argent et peut coûter une semaine d’attente sur un ticket. La plupart des gens qui cherchent un convertisseur gratuit ne sont pas administrateurs d’espace ; ce sont un développeur, un rédacteur technique ou un nouvel arrivant à qui l’on a confié un wiki en lui demandant de le mettre dans un dépôt.

Ce second point mérite d’être dit franchement, parce qu’aucune page d’outil ne vous le dira : **si vous n’êtes pas administrateur d’espace et ne pouvez pas le devenir, le choix du convertisseur n’est pas votre goulet d’étranglement.** La question à laquelle vous répondez vraiment est de savoir laquelle de deux demandes est la plus petite : demander à un administrateur d’espace de lancer un export et de vous envoyer une archive, ou demander à un administrateur de site d’installer une application. La première est un service ponctuel ; la seconde est une décision durable sur les logiciels qui tournent sur le Confluence de l’entreprise, et c’est pourquoi la voie export-puis-conversion gagne plus souvent que son ergonomie ne le mériterait.

Encore une chose sur cet export intégré gratuit : l’export d’un administrateur d’espace ne contient que ce que cet administrateur peut déjà voir. Les pages dont l’accès lui est restreint sont discrètement absentes de l’archive, et rien en aval ne peut vous parler d’une page qui n’y a jamais figuré. Un administrateur de site qui lance le même export obtient tout (vérifié sur support.atlassian.com, le 14 septembre 2026). Les articles de blog ne figurent pas du tout dans l’export HTML ou PDF d’un espace, et les commentaires ne sont jamais dans un export PDF, d’après la même documentation.

## Comparatif rapide : l’aide-mémoire

| Outil | Idéal pour | Capacité principale | Prix |
| --- | --- | --- | --- |
| L’export HTML d’espace de Confluence | Sortir le contenu, tout simplement | Un fichier HTML par page, plus les pièces jointes, dans une archive | Gratuit, exige la permission d’administrateur d’espace |
| Le convertisseur en ligne sur /confluence-to-markdown | Transformer cette archive en un document lisible | Déposez l’archive d’export, obtenez un document unique avec un sommaire | Gratuit ; rien n’est téléversé quand vous êtes déconnecté |
| Pandoc | Une migration en masse pilotée par script | `html` en entrée, `gfm` ou `commonmark` en sortie, une commande par fichier | Gratuit, GPL |
| Un script turndown | Des règles que vous devez maîtriser vous-même | Des règles sur mesure pour le balisage d’enrobage produit par Confluence | Gratuit, MIT |
| Application du Marketplace, fiche Free app | Un export Markdown depuis Confluence | Exporter sans quitter la page | Gratuit selon la fiche ; un administrateur l’installe |
| Application du Marketplace, fiche Try it free | Évaluer avant une décision d’achat | Pareil, avec l’arborescence des pages et les pièces jointes prises en charge | Un essai ; le prix est sur l’onglet tarifs |
| Export vers Word | Une page dont vous avez besoin dans un éditeur | Un `.docx` d’une seule page | Gratuit, aucune permission requise |
| Export vers PDF | Envoyer une page à quelqu’un | Une page rendue, figée | Gratuit, aucune permission requise, aucune voie vers le Markdown |

## Les options, une par une

### L’export HTML d’espace de Confluence, puis n’importe quel convertisseur HTML vers Markdown

C’est la référence à laquelle toutes les autres options gratuites se mesurent, et ce sont deux choses gratuites à la suite plutôt qu’un seul outil. Depuis la barre latérale de l’espace : Plus d’actions, Paramètres de l’espace, Général, Exporter l’espace, HTML. Revient une archive contenant un fichier HTML rendu par page, un dossier de pièces jointes et un index listant les pages. La convertir est une [conversion HTML vers Markdown](/blog/convert-html-to-markdown) ordinaire, sans aucune étape propre à Confluence.

| Avantages | Inconvénients |
| --- | --- |
| Gratuit, sans compte, sans installation et sans application à faire approuver | La permission d’administrateur d’espace, qui est la barrière que la plupart des gens rencontrent |
| Du vrai balisage : titres, listes, tableaux et liens survivent en tant qu’éléments | L’archive ne contient que ce que le compte exportateur peut voir |
| Les pièces jointes sont empaquetées avec les pages qui les référencent | Les noms de fichiers sont générés par machine ; l’arborescence des pages ne vit que dans le fichier d’index |
| Ne dépend de rien qui puisse changer de tarif ou quitter le Marketplace | Les articles de blog ne sont pas inclus dans l’export HTML |

**Prix :** gratuit. L’export fait partie de Confluence, et tout convertisseur qu’il vaut la peine de pointer sur le résultat est gratuit lui aussi.

**Détails techniques.** Le HTML exporté est dense — styles en ligne, `div` d’enrobage de macros, `span` d’icônes ne portant aucun texte — c’est pourquoi la seconde étape réclame un vrai analyseur HTML plutôt qu’un script qui supprime les chevrons. Le fichier d’index est le seul endroit où la hiérarchie des pages existe, parce que les noms de fichiers sont à plat et portent des identifiants générés plutôt que des titres. Si votre destination a besoin de dossiers reproduisant l’arborescence du wiki, cette correspondance est à vous de la construire à partir de l’index.

**Pour qui ?** Pour quiconque a les droits d’administrateur d’espace ou connaît quelqu’un qui les a, et pour quiconque veut une voie sans dépendance durable.

### Le convertisseur en ligne — déposez l’archive d’export, obtenez un document

Une fois cette archive en main, le chemin gratuit le plus court consiste à confier l’archive entière à un convertisseur qui la lit directement. [La conversion Confluence vers Markdown de TransformPipe](/confluence-to-markdown) prend l’archive d’export telle qu’elle sort de Confluence, convertit le HTML de chaque page avec le même convertisseur que celui derrière sa page HTML vers Markdown, et fusionne le tout en un document unique avec un sommaire en tête.

| Avantages | Inconvénients |
| --- | --- |
| Pas de décompression, pas de parcours de dossiers, pas de fichier d’index à lire à la main | Un document en sortie, pas un fichier par page — la mauvaise forme pour un site de documentation |
| Un sommaire est généré à partir du titre de chaque page | Le sommaire contient des titres bruts, pas des liens |
| Tourne dans le navigateur ; déconnecté, l’archive n’est téléversée nulle part, et une pièce jointe qui est une image est portée dans le document | Une pièce jointe qui n’est pas une image garde son lien, lequel exige toujours une session Confluence |
| Gratuit, sans compte, sans installation, sans rien à faire approuver par un administrateur | L’ordre des pages suit les chemins de l’archive, pas la hiérarchie du wiki |

**Prix :** gratuit. Un compte ajoute l’historique, le partage et une API, gratuits eux aussi.

**Détails techniques et fonctionnalités**

- Chaque entrée `.html` est lue, les dossiers et les entrées vides sont ignorés, et les entrées sont triées par chemin : deux exports du même espace produisent donc le même document dans le même ordre
- Le titre de chaque page vient de son propre élément `<title>`, avec repli sur le nom du fichier privé de l’identifiant numérique de page final et dont les séparateurs sont retransformés en espaces, si bien qu’une page dont l’export n’a conservé aucun titre atterrit tout de même lisiblement dans le sommaire
- Une page qui s’ouvre déjà sur son propre titre en guise de titre de niveau ne l’obtient pas deux fois ; le doublon est retiré avant la fusion
- Les pages sont jointes par un filet horizontal, la même convention que pour la fusion manuelle de plusieurs fichiers téléversés
- La décompression utilise `fflate`, du pur JavaScript sans liaison native, ce qui permet au même code de tourner dans un onglet de navigateur et sur le serveur pour les appels d’API

**Pour qui ?** Un espace que l’on archive, un wiki remis à une nouvelle équipe sous forme d’un document unique, ou le cas où quelqu’un vous a envoyé une archive d’export et où vous voulez la lire sans rien installer. Pas l’outil qu’il faut si chaque page doit rester son propre fichier avec sa propre URL.

### Pandoc — gratuit, et la bonne réponse pour une migration en masse

Pandoc lit `html` et écrit `gfm`, `commonmark` et `markdown_strict`, entre beaucoup d’autres, ce qui réduit la seconde moitié de la voie export-puis-conversion à une boucle de shell (vérifié sur pandoc.org, le 14 septembre 2026). C’est l’option gratuite qui passe à l’échelle, pour quand la sortie doit être faite de centaines de fichiers avec une structure que vous contrôlez.

| Avantages | Inconvénients |
| --- | --- |
| Gratuit et sous licence GPL, sans compte ni service derrière | Une installation, et une grosse |
| `-t gfm` donne la variante de Markdown qu’attendent GitHub et la plupart des générateurs de sites statiques | Aucune connaissance de Confluence : les `div` d’enrobage passent tels que le HTML les a faits |
| `--extract-media` extrait les médias liés dans un dossier et réécrit les références | La boucle, le nommage et l’arborescence des dossiers, c’est vous qui les écrivez |
| Possède aussi un lecteur `jira` pour le balisage wiki de Jira et Confluence | Ce balisage wiki n’est pas celui dans lequel une page Cloud moderne est stockée |

**Prix :** gratuit, sous licence GPL.

**Détails techniques et fonctionnalités**

- `pandoc -f html -t gfm page.html -o page.md` est toute la conversion pour une page ; une boucle sur le dossier d’export est toute la conversion pour un espace
- `--wrap=none` empêche Pandoc de couper durement la sortie à une largeur de colonne, ce qui compte si le résultat atterrit dans un dépôt où les diffs devraient être par phrase
- `--extract-media=media` extrait les médias référencés par la source et ajuste les références pour qu’elles pointent vers les fichiers extraits — ce qui se rapproche le plus, gratuitement, d’un remède aux URL de pièces jointes de Confluence conditionnées à une session
- Le format `jira` est listé en entrée comme en sortie, décrit comme le balisage wiki de Jira et Confluence — utile pour d’anciennes pages Server rédigées ainsi, et pas une voie pour les pages Cloud, stockées dans le format de stockage fondé sur XHTML
- `gfm` est la variante à demander si les tableaux comptent ; `markdown_strict` n’a aucune syntaxe de tableau

**Pour qui ?** Pour quiconque déplace un wiki dans un dépôt une bonne fois, proprement — là où le résultat est une arborescence de dossiers, une convention de nommage et un build qui se régénère sans accroc. Une migration que vous ferez tourner deux fois devrait être un script, et c’est ce script-là.

### Un script turndown — gratuit, quand les règles doivent être les vôtres

Turndown est une bibliothèque JavaScript qui convertit le HTML en Markdown, sous licence MIT, acceptant des chaînes HTML ou des nœuds DOM (vérifié sur github.com/mixmark-io/turndown, le 14 septembre 2026). La raison de scripter autour d’elle plutôt que de lancer Pandoc, c’est que le HTML exporté par Confluence contient des formes reconnaissables — panneaux de macros, enrobages de blocs de code, macros dépliables — et que turndown vous laisse ajouter une règle par forme.

| Avantages | Inconvénients |
| --- | --- |
| Gratuit, MIT, et une dépendance plutôt qu’une installation | Vous écrivez un programme, avec tout ce que cela suppose |
| Les règles peuvent cibler les noms de classe propres à Confluence et produire exactement ce que vous voulez | Chaque règle est une dette de maintenance quand le rendu de Confluence change |
| `turndown-plugin-gfm` ajoute les tableaux et le texte barré par-dessus les règles de base | Turndown seul, sans ce greffon, ne produit pas de tableaux |
| Tourne partout où Node tourne, y compris en intégration continue | A besoin d’un DOM : sous Node, cela veut dire en fournir un |

**Prix :** gratuit, sous licence MIT.

**Détails techniques et fonctionnalités**

- Une règle est un filtre plus une fonction de remplacement : faire de `div.confluence-information-macro-note` une citation tient donc en quelques lignes plutôt qu’en une passe de post-traitement sur la sortie
- Comme turndown accepte des nœuds DOM, un script peut élaguer avant de convertir — en supprimant les `span` d’icônes et le mobilier de navigation qu’un convertisseur générique transforme fidèlement en lignes vides parasites
- Le greffon GFM est la pièce à ajouter en premier : les tableaux sont la chose la plus fréquente dans un wiki exporté, et la bibliothèque de base les laisse en HTML

**Pour qui ?** Une migration dont la sortie doit se conformer à une charte rédactionnelle existante, ou dans laquelle une macro apparaît sur deux cents pages et doit ressortir de la même manière à chaque fois. Pour une conversion ponctuelle, c’est plus de travail que le résultat n’en justifie.

### Les applications de l’Atlassian Marketplace — lisez le mot au-dessus du bouton

Plusieurs applications exportent des pages Confluence en Markdown depuis Confluence même, sans export HTML intermédiaire. C’est là que le mot « gratuit » demande le plus d’attention, parce que le Marketplace affiche deux choses différentes presque au même endroit : une fiche coiffée de **Free app** est gratuite, et une fiche coiffée de **Try it free** est un essai avec un prix sur l’onglet tarifs.

Les deux existent aujourd’hui. Listées comme applications gratuites : « Markdown Exporter for Confluence (API, Bulk & Attachments) » de Yamuno Software US, et « Markdown | Source Editor | Markdown Exporter (FREE) » d’Agilva Solutions. Listées comme Try it free : « Easy Markdown Exporter for Confluence » d’AppLiger, « Markdown Exporter for Confluence » de Narva Software, « Export to Markdown for Confluence Cloud » d’Atly Apps, et « Instant Markdown Exporter for Confluence » de Philip Lindner, qui annonce un essai gratuit de 30 jours (tout vérifié sur marketplace.atlassian.com, le 14 septembre 2026).

| Avantages | Inconvénients |
| --- | --- |
| Du Markdown directement, sans étape séparée d’export puis de conversion | Installer une application est une décision d’administrateur, pas d’auteur de page |
| Certaines réécrivent les liens en chemins relatifs et conservent l’arborescence des pages, ce que la voie gratuite ne fait pas | Une fiche qui dit Try it free est un essai, et le prix est à un onglet de distance |
| Tournent sur le contenu vivant : rien n’est l’instantané d’un jour d’export | Les fiches, les éditeurs et les tarifs de cette catégorie changent souvent |
| Les applications Forge tournent dans votre propre environnement Atlassian | Une application est une dépendance durable que quelqu’un doit maintenir |

**Prix :** variable, et l’en-tête de la fiche est le signal le plus rapide — Free app ou Try it free (vérifié sur marketplace.atlassian.com, le 14 septembre 2026). Vérifiez la fiche actuelle plutôt que n’importe quel article, celui-ci compris : c’est la partie la plus susceptible d’être périmée quand vous la lirez.

**Détails techniques.** Les différences qui valent d’être comparées sont celles que la voie gratuite ne peut pas faire du tout : la hiérarchie des pages est-elle préservée sous forme de dossiers, les pièces jointes descendent-elles avec les pages, et les liens internes sont-ils réécrits en chemins relatifs pour que le résultat se parcoure hors ligne. Ces trois points sont le vrai produit ; convertir du HTML en Markdown est la partie banalisée, et la raison pour laquelle tant de ces applications existent avec si peu de différences entre elles.

**Pour qui ?** Pour des équipes qui installent couramment des applications du Marketplace et veulent l’export Markdown comme capacité durable. Pour une migration unique, la voie export-puis-conversion vous y mène sans conversation avec les achats.

### L’export Word ou PDF — gratuit, sans permission, et sans issue

Ce sont les deux exports accessibles à quiconque peut lire une page, ce qui explique pourquoi c’est la première chose que les gens essaient quand l’export HTML est grisé. Ils figurent ici par honnêteté, pas comme recommandation.

| Avantages | Inconvénients |
| --- | --- |
| Aucune permission au-delà de la lecture de la page | Une page à la fois ; il n’existe aucune version à l’échelle d’un espace qui aide |
| Gratuit, intégré, deux clics | Le PDF est une sortie rendue — la structure a disparu avant qu’un convertisseur ne la voie |
| Un `.docx` conserve au moins titres, listes et tableaux comme structure | Les titres de Word ne valent que par l’usage que l’export a fait des vrais styles de titre |
| Très bien quand la destination était Word ou PDF depuis le début | Les commentaires ne sont jamais inclus dans un export PDF |

**Prix :** gratuit.

**Détails techniques.** La voie `.docx` n’est pas désespérée — un document Word a un vrai modèle documentaire, et [le convertir en Markdown](/blog/best-word-to-markdown-converters) récupère titres, listes et tableaux. C’est le chemin le plus long : format de stockage vers Word vers Markdown, en perdant quelque chose à chaque étape, là où HTML vers Markdown est une seule étape avec moins de pertes. Le PDF, lui, est vraiment sans issue, parce qu’un PDF décrit où l’encre se pose sur une page et que la structure de titres dont Markdown a besoin n’y existe plus.

**Pour qui ?** Pour quelqu’un qui a une page, pas de droits d’administrateur d’espace et aucune envie d’ouvrir un ticket. Pour cette personne, l’export Word suivi d’une conversion Word vers Markdown est une voie gratuite légitime, et il vaut mieux le dire que prétendre que la seule bonne réponse exige une permission dont elle ne dispose pas.

## Là où le choix gratuit évident s’effondre

La voie export-puis-conversion est la recommandation de cet article : elle mérite donc une section sur les endroits où elle ne tient pas. Il y en a quatre, et trois ne sont pas la faute du convertisseur.

**Elle produit des fichiers, et des fichiers ne font pas un wiki.** Un espace Confluence est un arbre avec des liens croisés. L’export HTML aplatit cet arbre en un dossier de noms de fichiers générés, et tout convertisseur en aval hérite de cet aplatissement. Vous obtenez le contenu et perdez la navigation, à moins de la reconstruire vous-même à partir de l’index. Les applications du Marketplace qui vantent « préserve la hiérarchie » vantent la seule chose que la voie gratuite ne fait pas.

**Les liens entre pages ne survivent pas au déplacement.** Un lien d’une page vers une autre était une URL Confluence, et après conversion c’en est toujours une — correct si Confluence reste en place, faux s’il s’agit d’une migration qui le quitte. Réécrire ces liens demande une correspondance entre page et nouveau chemin de fichier, et cette correspondance n’existe pas tant que vous n’avez pas décidé de l’organisation des fichiers. C’est le plus gros morceau de travail manuel dans une vraie migration.

**Les pièces jointes pointent vers une session.** Les liens de pièces jointes intégrés de Confluence visent son propre point d’accès de téléchargement, qui attend que vous soyez connecté : une page qui a l’air complète dans votre navigateur a donc des images cassées pour tous les autres. L’export d’espace empaquette les fichiers dans l’archive pour cette raison ; le remède consiste à repointer les liens vers ces copies locales. Le `--extract-media` de Pandoc fait une partie du chemin ; le reste est un chercher-remplacer que vous écrivez.

**Ce qui était une macro est désormais un instantané.** Tout ce qui était une requête vivante — une macro d’issue Jira, une page incluse, une arborescence de pages — a été exporté tel qu’il s’affichait ce jour-là, et aucun convertisseur ne peut restaurer un comportement qui n’a jamais été dans le fichier. [L’article pratique](/blog/convert-confluence-page-to-markdown) contient le tableau macro par macro si vous en avez besoin avant de vous engager.

Et un point sur la gratuité plutôt que sur la structure : **un convertisseur gratuit qui téléverse votre wiki est un convertisseur gratuit qui possède désormais votre wiki.** La documentation interne contient des noms de clients, de l’architecture et des comptes rendus d’incidents — la moitié des choses qu’une entreprise préférerait ne pas confier à un service que personne n’a évalué. La conversion côté navigateur et les outils locaux en ligne de commande sont les deux formes où la question ne se pose pas, et la différence n’apparaît dans aucun tableau de fonctionnalités ; on la vérifie en regardant l’onglet réseau. La question de savoir si [un convertisseur en ligne est sûr](/blog/is-an-online-converter-safe) vaut dix minutes avant de déposer l’export d’un espace sur quoi que ce soit.

## Comment choisir

1. **Réglez la question de la permission avant de comparer quoi que ce soit.** Sans droits d’administrateur d’espace, l’export HTML vous est inaccessible, et une application du Marketplace exige un administrateur de site pour l’installer. Les deux routes commencent par demander à quelqu’un, et la personne la plus facile à joindre décide de votre voie davantage que n’importe quelle fonctionnalité.
2. **Décidez d’abord de la forme de la sortie.** Un document à lire, ou un dossier de fichiers ? Un document unique, c’est un fichier déposé sur un convertisseur qui fusionne. Un dossier, c’est Pandoc ou un script, et une décision sur l’organisation des dossiers avant de commencer.
3. **Comptez les pages.** En dessous de dix, le travail manuel coûte moins cher que l’automatisation, et l’export Word d’une page isolée est une réponse gratuite légitime. Au-dessus de cent, seule une voie scriptée survit, parce que les corrections à la main qui suivront auront déjà épuisé votre patience.
4. **Vérifiez si le contenu a le droit de quitter la machine.** La documentation interne n’en a généralement pas le droit, ce qui exclut tout convertisseur hébergé qui téléverse et laisse la conversion côté navigateur, un outil local, ou une application Forge tournant dans votre propre environnement Atlassian.
5. **Sur le Marketplace, lisez l’en-tête puis l’onglet tarifs.** Free app et Try it free occupent la même place et n’ont pas le même sens. Confirmez aussi la portée : une application qui exporte gratuitement une page est un autre produit qu’une application qui exporte un espace.
6. **Convertissez une page difficile avant d’en convertir quatre cents.** Choisissez la page qui a le plus de macros, le tableau le plus large et le plus de pièces jointes, et lisez le résultat sérieusement. Tout ce qui ira mal sur l’ensemble de l’espace est déjà visible dans ce seul fichier.

## Conclusion

Le convertisseur Confluence vers Markdown gratuit qui convient à presque tout le monde n’est pas un outil : c’est l’export HTML d’espace intégré à Confluence, suivi d’une conversion gratuite de votre choix. Cette voie ne coûte rien, ne dépend de rien qui puisse changer de tarif, et fonctionne pareil sur Cloud, Server et Data Center. Son prix est une permission — administrateur d’espace — et le dire franchement est plus utile que n’importe quel comparatif de fonctionnalités, parce que pour une large part des gens qui tapent cette expression, la permission est tout le problème et aucun convertisseur ne le résout.

À partir de là, le choix est simple. Un document lisible unique tiré de l’archive d’export d’un espace, c’est un fichier déposé sur [la conversion Confluence proposée ici](/confluence-to-markdown), gratuitement, l’archive restant sur votre machine tant que vous êtes déconnecté. Un dépôt plein de fichiers, c’est Pandoc dans une boucle, ou turndown avec des règles que vous avez écrites. Et sur le Marketplace, « gratuit » veut dire ce que dit l’en-tête de la fiche et rien de plus — à vérifier aujourd’hui plutôt qu’à croire sur parole d’un article, celui-ci compris.

## FAQ

### Existe-t-il un convertisseur Confluence vers Markdown réellement gratuit ?

Oui, plusieurs, mais la partie gratuite est rarement le convertisseur lui-même. L’export HTML d’espace de Confluence est gratuit et exige la permission d’administrateur d’espace ; convertir cet export est gratuit avec Pandoc, un script turndown, ou un convertisseur en ligne qui prend l’archive directement. Sur le Marketplace, certaines applications sont listées comme gratuites et d’autres affichent Try it free, c’est-à-dire un essai.

### Puis-je convertir Confluence en Markdown sans être administrateur ?

Pas à l’échelle d’un espace. Les exports HTML, XML et CSV sont des opérations au niveau de l’espace qui exigent la permission d’administrateur d’espace, et installer une application du Marketplace exige un administrateur également. Pour une page isolée que vous pouvez déjà lire, l’export Word suivi d’une conversion Word vers Markdown est une voie gratuite ne demandant aucune permission supplémentaire.

### Pourquoi l’export gratuit ne contient-il pas toutes les pages ?

Parce que l’export d’un administrateur d’espace ne contient que ce que son compte peut voir — les pages restreintes sont absentes de l’archive, sans le moindre avertissement. Un administrateur de site qui lance le même export obtient tout, quelles que soient les restrictions de visibilité (vérifié sur support.atlassian.com, le 14 septembre 2026). Si une migration paraît incomplète, vérifiez cela d’abord.

### Une application Confluence vers Markdown gratuite conserve-t-elle la hiérarchie des pages ?

Certaines oui, et c’est le principal point à comparer entre elles, parce que la voie export-puis-conversion ne le fait pas : l’export HTML aplatit les pages en noms de fichiers générés et ne conserve l’arbre que dans un fichier d’index. Vérifiez sur chaque fiche la hiérarchie, les pièces jointes et la réécriture des liens relatifs — ces trois points sont ce qui distingue ces applications.

### Quelle est la manière gratuite la plus rapide de lire un espace Confluence hors ligne ?

Exportez l’espace en HTML et confiez l’archive à un convertisseur qui la fusionne en un document unique avec un sommaire. Cela évite la décompression, le fichier d’index et toute décision sur l’organisation des dossiers, au prix des frontières de fichier par page, qui n’ont aucune importance si le but est de lire.

### Faut-il utiliser Pandoc ou un convertisseur en ligne pour cela ?

Pandoc si la sortie doit être faite de nombreux fichiers avec une organisation que vous contrôlez, parce qu’il passe à l’échelle et se scripte. Un convertisseur en ligne si la sortie est un document unique et que vous le voulez sans installation. Les deux sont gratuits et tournent localement ; la différence est la forme dont vous avez besoin à l’arrivée, pas la qualité de conversion.

### Les noms d’applications du Marketplace cités ici sont-ils à jour ?

Ce sont ceux qu’affichaient les fiches le 14 septembre 2026, et cette catégorie change plus vite que la plupart. Des éditeurs arrivent et repartent, des paliers gratuits apparaissent et ferment, et les onglets tarifs évoluent indépendamment des en-têtes de fiche. Traitez ces noms comme un point de départ et lisez la fiche actuelle avant de décider quoi que ce soit.
