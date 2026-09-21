---
title: "Convertir un export Notion en Markdown : tous les chemins, id compris"
description: "Transformer un zip « Export as Markdown & CSV » en Markdown propre : le suffixe d'id sur chaque fichier, ce qu'un script répare, ce que seule la fusion résout"
date: 2026-09-14
tag: Conversion
keywords: export notion markdown, convertir notion en markdown, notion vers markdown, notion api markdown, exporter une page notion en markdown, zip notion markdown, enlever les id d'un export notion
---

Le bouton d'export de Notion annonce « Markdown & CSV » et vous remet un zip qui, techniquement, dit la vérité. Ouvrez-le : chaque fichier est du vrai Markdown, titres, listes, liens, lisible dans n'importe quel éditeur. Ce qu'il ne vous dit pas, c'est que chaque nom de fichier et chaque lien entre pages porte désormais un identifiant hexadécimal de 32 caractères, qu'une base de données est ressortie sous forme de CSV séparé auquel vos fichiers Markdown ne font aucune référence, et que l'export est l'instantané d'un moment, pas une copie vivante de quoi que ce soit.

Rien de tout cela n'est un défaut. Notion identifie une page par son id et traite le titre comme une étiquette susceptible de changer ; l'export doit donc loger l'id quelque part de durable, et le nom de fichier est l'endroit où il atterrit. Le problème est entièrement en aval : un dossier de fichiers qui se désignent tous entre eux par id convient parfaitement à Notion et reste illisible comme cible de migration tant que rien ne réécrit ces pointeurs.

### En bref

Trois chemins fonctionnent réellement. **Exporter en Markdown & CSV, puis réécrire les id** est la voie généraliste : décompresser, construire une table associant le suffixe d'id de chaque fichier au nom que vous voulez vraiment, puis réécrire chaque lien et chaque nom de fichier à partir de cette seule table. À dix pages c'est manuel, à mille c'est un script. **`notion-to-md`**, un paquet Node open source qui lit les pages via l'API de Notion, convient mieux à une chaîne de traitement scriptée ou à la génération d'un site statique, parce qu'il ne produit jamais ces noms de fichiers suffixés : c'est vous qui nommez la sortie. **Téléverser le zip d'export tel quel dans un convertisseur qui le fusionne** — [la conversion Notion → Markdown de TransformPipe](/notion-to-markdown) en est une — contourne le problème d'id d'une troisième manière : chaque page devient une section d'un document unique, dans l'ordre, avec un sommaire, et un lien inter-pages conserve ses mots au lieu de pointer vers un fichier qui n'existera pas. Choisissez le premier pour un dossier de fichiers séparés que vous maintiendrez, le deuxième pour l'automatisation, le troisième pour un document à lire ou à transmettre.

Quel que soit le chemin, trois choses ne survivent à aucun d'eux : les commentaires, parce qu'ils sont une discussion attachée à une page plutôt que du contenu de page ; les vues non par défaut d'une base de données, parce que Notion n'exporte que la vue que vous avez sous les yeux ; et les blocs synchronisés, qui ressortent sous forme de leur contenu à chaque endroit où ils étaient affichés, dupliqués, sans la moindre marque indiquant qu'ils furent un jour le même bloc.

## Pourquoi l'id est là, et pourquoi il ne part pas tout seul

Une page Notion est identifiée par un UUID dès l'instant de sa création. Le titre est une métadonnée attachée à cet id, modifiable à tout moment, et n'intervient nulle part là où l'export doit retrouver une page. Quand l'export écrit `Meeting notes.md`, il n'a donc aucune garantie que ce nom soit unique — deux pages intitulées « Meeting notes » existent dans la plupart des espaces de travail de plus d'un an — et il résout cela en inscrivant l'id dans chaque nom de fichier qu'il produit.

```text
Meeting notes 21f4c8a1b2c34d5e8f90123456789abc.md    the file on disk
Meeting%20notes%2021f4c8a1b2c34d5e8f90123456789abc.md    the link another page uses to reach it
meeting-notes.md    what you actually want to keep
```

Un lien d'une page vers une autre est écrit contre le nom de fichier exact, avec l'espace encodé en pourcentage. Renommez le fichier pour supprimer l'id et tous les liens qui visaient l'ancien nom se cassent — en silence, puisqu'un lien relatif mort dans un dossier de fichiers Markdown ne produit aucune erreur tant que personne ne clique dessus. C'est là tout le problème de migration : le renommage et la réécriture des liens doivent se faire ensemble, depuis une seule table, en une seule passe.

## La boîte de dialogue d'export, et les limites qu'elle n'annonce pas

L'export de Notion se trouve dans le menu de la page ou de l'espace de travail sous « Export ». Il propose un choix de format entre PDF, HTML et Markdown & CSV, une liste déroulante « Include content » qui permet d'exclure fichiers et images, un interrupteur « Include subpages » et un interrupteur « Create folders for subpages » (vérifié sur notion.com, le 9 septembre 2026). Trois limites issues de cette même surface comptent avant de bâtir une migration autour d'elle :

- Seule la vue courante ou la vue par défaut d'une base de données est exportée. Toutes les vues d'un coup n'est pas pris en charge, et une vue formulaire ne peut pas être exportée du tout — c'est la vue tableau qui part à sa place.
- Un export volumineux est envoyé par e-mail sous forme de lien de téléchargement plutôt que démarré immédiatement, ce lien expire au bout de sept jours, et le traitement peut prendre jusqu'à trente heures.
- Les sous-pages sont exportées comme dossiers imbriqués quand l'interrupteur est actif, et c'est ce qui rend l'arborescence du zip digne d'être conservée plutôt qu'aplatie.

Ce délai de traitement est un fait de planification, pas une note de bas de page. « On exporte l'espace de travail vendredi après-midi, on convertit vendredi soir » suppose un export qui se termine en quelques minutes ; pour un grand espace de travail, ce ne sera peut-être pas le cas.

## Comparatif rapide : trois chemins et ce que chacun coûte

| Chemin | Idéal pour | Conserve | Perd | Installation |
| --- | --- | --- | --- | --- |
| Exporter en Markdown & CSV, réécrire les id à la main ou par script | Un dossier de fichiers séparés que vous continuerez à éditer | Chaque page, la structure exacte, les lignes de base sous forme de CSV | Commentaires, vues non par défaut, identité des blocs synchronisés | Aucune, ou un court script |
| `notion-to-md` via l'API Notion | Une étape de build, un site statique, une synchronisation planifiée | Tout ce que vous écrivez dans votre propre moteur de rendu | Idem ci-dessus, plus tout ce que votre moteur n'implémente pas | Node, un jeton d'intégration |
| Téléverser le zip d'export directement (TransformPipe) | Un document à lire ou à transmettre | Chaque page dans l'ordre, un sommaire, les lignes de base sous forme de tableau | L'adresse des liens inter-pages, les commentaires, les vues non par défaut | Aucune |
| Copier une page, coller dans un éditeur | Une poignée de pages, une fois | La mise en forme que la cible du collage comprend | Tout ce qui touche à l'échelle : cela ne dépasse pas quelques pages | Aucune |

## Exporter en Markdown & CSV, puis réparer les id

C'est l'export décrit plus haut, et la manière honnête de s'en servir consiste à traiter l'id comme une donnée plutôt que comme du bruit : c'est la seule chose du zip qui identifie une page de façon unique et permanente, donc la clé de jointure du renommage.

```text
1. Unzip the export.
2. Walk every .md and .csv filename, split off the trailing id, build id -> new-name.
3. Rewrite every filename using the map.
4. Walk every file's content, find links matching the export's own href pattern,
   look up the id in the same map, rewrite the href to the new name.
5. Flatten or keep the folder structure, depending on where the files are going.
```

| Avantages | Inconvénients |
| --- | --- |
| Aucune nouvelle dépendance, aucun compte, aucun jeton d'API | Le renommage et la réécriture des liens doivent former une passe unique sur une table unique, sinon la moitié des liens casse |
| Fonctionne hors ligne, sur des fichiers que vous avez déjà | Le `.csv` d'une base de données n'est pas automatiquement rattaché à la page à laquelle il appartenait |
| Le chemin le plus sûr quand la destination est un dossier de fichiers qui doivent garder leurs propres noms | Dix pages à la main coûtent une soirée ; mille pages à la main n'est pas réaliste |

**Détails techniques.** L'id compte 32 caractères hexadécimaux minuscules, séparés du titre par une espace (parfois un tiret bas, selon la version du client qui a produit l'export). Une expression régulière ancrée à la fin du nom de fichier — retirez d'abord l'extension, puis cherchez l'id final — sépare les deux de façon fiable. Les liens à l'intérieur du Markdown sont relatifs et encodés en pourcentage exactement comme le nom de fichier, si bien que la même expression régulière, appliquée après décodage de l'URL, retrouve aussi l'id dans un lien. Le `.csv` d'une base de données se trouve à côté du dossier de la page qui la contenait, nommé de la même manière avec son propre suffixe d'id ; le rattacher à la page à laquelle il appartient est une correspondance de nom de fichier, pas quelque chose que l'export consigne ailleurs.

**Pour qui ?** Pour quiconque vise un dossier de fichiers Markdown qui doivent continuer à fonctionner comme fichiers séparés — un site de documentation avec une page par URL, un import de wiki où chaque page devient sa propre entrée. La sortie est composée de vrais fichiers aux vrais noms ; ce que cela coûte, c'est de faire la réécriture correctement une bonne fois.

**Une version minimale du script**, en ébauche plutôt qu'en programme complet, parce que la forme importe davantage que le langage :

```text
map = {}
for file in list(export_folder, recursive=true):
    id = extract_trailing_hex(file.name_without_extension)
    map[id] = slugify(file.name_without_extension_or_id)

for file in list(export_folder, recursive=true):
    text = read(file)
    text = replace_all(text, LINK_PATTERN, (id) => map[id] ?? id)
    write(new_path_for(file, map), text)
```

`LINK_PATTERN` est une expression régulière calquée sur la forme des liens de l'export lui-même — un href relatif se terminant par `.md` ou `.csv`, encodé en pourcentage, portant le même id hexadécimal final que le nom de fichier. Le détail qui piège les gens : exécutez l'extraction de l'id sur le href *décodé*, pas sur sa version encodée, puisque `%20` ne correspondra jamais à un motif écrit pour une espace littérale.

**Les bases de données méritent leur propre passe.** Une base de données en pleine page s'exporte sous forme de `.csv` à côté d'un dossier contenant un `.md` par ligne ayant eu un corps de page, chaque fichier de ligne portant son propre suffixe d'id comme une page. Reconstruire « le tableau, avec un lien vers la page plus complète pour chaque ligne qui en avait une » est une jointure entre les lignes du CSV et les noms de fichiers du dossier, appariés sur la colonne que Notion a utilisée comme titre de page — rien que le CSV ni les fichiers de ligne n'enregistrent explicitement comme relation.

## `notion-to-md` : éviter le problème d'id en ne l'écrivant jamais

Notion publie aussi une API officielle, et lire les pages par ce biais plutôt que par le bouton d'export élude entièrement le problème de nommage : rien dans l'API n'impose un id dans un nom, puisque c'est vous qui appelez `writeFileSync` à la fin. [`notion-to-md`](https://github.com/souvikinator/notion-to-md) est le paquet open source couramment utilisé pour cela : Node, open source, il lit l'arbre de blocs d'une page via l'API et le convertit en Markdown, MDX ou quelques autres cibles. Vous choisissez le nom du fichier de sortie, il n'y a donc rien à réécrire ensuite.

| Avantages | Inconvénients |
| --- | --- |
| Jamais de suffixe d'id dans la sortie — vous nommez chaque fichier | Demande un jeton d'intégration et un accès à l'API, une étape de configuration que le bouton d'export n'exige pas |
| S'insère naturellement dans un script de build ou une synchronisation planifiée | Une page à la fois, par id ou par requête sur une base ; parcourir un espace de travail entier est une récursion que vous écrivez vous-même |
| Tourne en intégration continue sans navigateur ni clic manuel sur Export | Restitue des blocs que vous devez cartographier vous-même au-delà du jeu courant — une vue de base, un bloc synchronisé : les mêmes pertes que l'export |

**Prix :** gratuit, open source — la licence mérite d'être vérifiée par vous-même avant d'en dépendre, car les métadonnées du paquet publié et le fichier `LICENSE` du dépôt ne concordent pas actuellement (vérifié sur npmjs.com et github.com, le 14 septembre 2026).

**Détails techniques :** le paquet demande à l'API Notion les enfants d'une page sous forme de blocs et convertit l'arbre de blocs en Markdown, avec des points d'accroche pour traiter les types de blocs qu'il ne couvre pas par défaut. Il exige qu'une intégration soit créée dans les paramètres de Notion et que cette intégration soit partagée sur les pages ou bases lues — une étape d'autorisation, pas de code, et le seul endroit où ce chemin démarre plus lentement qu'un clic sur Export.

L'API elle-même est limitée à une moyenne de trois requêtes par seconde et par intégration, avec en plus la limite partagée de l'espace de travail (vérifié sur developers.notion.com, le 14 septembre 2026) ; une requête au-delà de la limite reçoit un 429 accompagné d'un en-tête `Retry-After` au lieu des données, si bien qu'un script parcourant plus de quelques dizaines de pages doit intégrer la boucle attente-et-réessai dès le départ, et non après le premier échec. Pour une page isolée ou une petite base, cela n'a aucune importance ; pour un espace de travail entier, c'est la différence entre un script qui se termine et un script qui semble figé.

**Pour qui ?** Pour un site statique qui tire son contenu de Notion à chaque build, une tâche planifiée qui reflète un espace de travail dans un dépôt git, ou tout cas où « exporter à la main de temps en temps » est la mauvaise forme pour la façon dont le contenu évolue réellement.

## Ce qu'il advient des images, fichiers et pièces jointes

Chaque chemin traite les médias différemment, et cela vaut la peine d'être vérifié avant de confier à l'un d'eux une page qui contient plus d'images que de texte.

L'export Markdown & CSV écrit les images de chaque page dans un dossier voisin de son `.md`, sous des noms générés, atteints depuis le Markdown par des chemins relatifs encodés en pourcentage — qui ne tiennent qu'aussi longtemps que le dossier d'images voyage avec le fichier auquel il appartient (la même fragilité que [les chemins relatifs traînent toujours](/blog/images-and-links-that-still-work)). Déplacez le `.md` seul et chaque référence d'image casse sans avertissement, parce que rien ne vérifie que le dossier a suivi.

`notion-to-md` renvoie les blocs image sous forme de syntaxe Markdown ordinaire pointant vers les URL de fichiers temporaires de Notion, lesquelles expirent — le paquet ne télécharge pas le fichier pour vous, donc un script suivant ce chemin a besoin de sa propre étape pour récupérer chaque URL d'image avant qu'elle ne périme et réécrire le Markdown vers une copie locale.

Un chemin de fusion et téléversement ne voyait auparavant que ce que disait le texte du zip, et un chemin relatif cassé restait cassé tel quel. Les images sont désormais lues dans l'archive elles aussi et portées dans le document lui-même, si bien qu'il ne reste plus de chemin à casser : l'image voyage dans le Markdown, dans l'export HTML et dans tout ce qui en est partagé. Le plafond est de deux mégaoctets d'images par document et d'un par image — un document enregistré doit tenir dans quatre — et une image au-delà garde le lien qu'elle avait, ce qui n'est pas pire qu'avant.

## Téléverser le zip d'export directement, fusionné en un seul document

Le problème d'id de l'export disparaît d'une troisième manière si la destination n'a jamais été un dossier de fichiers séparés : [la conversion Notion → Markdown de TransformPipe](/notion-to-markdown) prend le zip « Export as Markdown & CSV » sans modification, fusionne chaque page en un document unique dans son ordre d'origine avec un sommaire généré, et transforme un lien inter-pages en les mots qu'il affichait plutôt qu'en un nom de fichier qui ne se résoudra plus une fois les pages devenues sections du même document. Une base de données revient sous forme de tableau, dans le même document.

| Avantages | Inconvénients |
| --- | --- |
| Aucun renommage, aucune table d'id, aucun script | Produit un document unique — pas la bonne forme si les pages doivent rester des fichiers séparés avec leurs propres URL |
| Chaque page dans l'ordre, avec un sommaire construit pour vous | Les liens inter-pages gardent leur texte, pas leur adresse : il ne reste nulle part où pointer une fois la fusion faite |
| Fonctionne dans le navigateur ; le zip n'est envoyé nulle part quand vous n'êtes pas connecté | Les vues non par défaut et les commentaires restent absents, parce que l'export ne les a jamais contenus |

**Prix :** gratuit, exécution locale dans le navigateur.

**Pour qui ?** Pour quiconque visait en réalité un document lisible d'un seul tenant — un export de wiki transformé en fichier unique à transmettre, un espace de travail archivé comme une seule chose à relire plus tard — plutôt qu'un dossier de pages ayant chacune besoin de sa propre adresse.

## Là où les trois chemins échouent de la même façon

**Les commentaires.** Un fil de commentaires est attaché à une page, pas écrit dans son contenu, donc aucun des trois chemins ci-dessus ne le voit. Si une décision n'existe que sous forme de réponse dans un fil, recopiez-la dans le corps de la page avant d'exporter quoi que ce soit : après, elle a disparu, et pas seulement « non convertie ».

**Les vues de base non par défaut.** Notion exporte la vue que vous avez ouverte, pas toutes les vues d'une base. Une base filtrée de trois façons pour trois publics s'exporte sous l'une de ces trois formes, et les deux autres ne sont pas récupérables depuis l'export : il faut les reconstruire à partir des lignes sous-jacentes.

**Les blocs synchronisés.** Un bloc synchronisé affiche le même contenu à plusieurs endroits à la fois dans Notion. L'export n'a aucune notion de « le même bloc, montré deux fois » : chaque endroit où il apparaissait reçoit sa propre copie du contenu, si bien qu'en modifier une après la migration ne met plus à jour l'autre, et rien dans le fichier ne signale qu'elles furent liées.

## Comment choisir

1. **Décidez d'abord de la forme de la destination.** Des fichiers séparés avec leurs propres URL appellent le chemin de réécriture ou `notion-to-md`. Un document unique appelle la fusion. Choisir après avoir converti revient à refaire le travail.
2. **Demandez-vous à quelle fréquence cela se produit.** Une seule fois, et l'export manuel suivi de la réécriture sera terminé avant qu'une intégration API ne soit approuvée. Chaque semaine ou à chaque déploiement, et `notion-to-md` dans une étape de build s'amortit en un mois.
3. **Repérez les commentaires et les vues non par défaut avant d'exporter, pas après.** Les deux sont invisibles dans la sortie et aucune erreur ne les signale ; la seule vérification fiable consiste à regarder la source dans Notion d'abord.
4. **Comptez les pages.** Dix pages tolèrent une réécriture d'id à la main. Cent appellent un script. Mille appellent l'API, parce que cliquer sur Export et attendre jusqu'à trente heures ne passe pas non plus à l'échelle.

Si la question porte sur l'outil plutôt que sur le chemin — tous sont gratuits, et ce qui les sépare est le coût de mise en place plutôt que le prix — [le comparatif des convertisseurs Notion gratuits](/blog/free-notion-to-markdown-converter) est la réponse plus courte.

## Conclusion

L'export Notion est du Markdown honnête portant un id dont il ne peut pas se défaire seul. Réécrire cet id depuis une table règle le cas d'un dossier de fichiers qui doivent rester des fichiers ; lire l'espace de travail via l'API et nommer soi-même sa sortie règle tout ce qui est scripté ; et fusionner l'export en un document unique règle la question d'une troisième manière, en supprimant le besoin que l'id se résolve vers quoi que ce soit. Ce qu'aucun des trois chemins ne récupère, c'est ce que l'export n'a jamais contenu — un fil de commentaires, une vue de base que vous ne regardiez pas, ou l'identité d'un bloc synchronisé. La seule vérification qui vaille avant d'exporter consiste donc à confirmer que cela n'a pas d'importance pour ce que vous êtes sur le point de perdre. [À lire également](/blog/markdown-from-notion-obsidian-and-confluence) : comment Confluence et Obsidian se comparent sur le même problème.

## FAQ

### Notion peut-il exporter directement du Markdown propre, sans l'id dans le nom de fichier ?

Pas via le bouton d'export : Markdown & CSV ajoute toujours l'id, parce que le titre seul n'est pas un nom de fichier fiable. Le chemin `notion-to-md`, qui lit les pages via l'API, est la façon d'obtenir des noms de fichiers de votre choix, puisque c'est vous qui les écrivez au lieu d'accepter ce qu'un export produit.

### Pourquoi mes liens exportés pointent-ils vers des noms de fichiers contenant de longs codes ?

Parce que Notion identifie les pages par id, que le titre n'est qu'une étiquette, et que l'export inscrit l'id dans le nom de fichier pour garantir l'unicité des noms. Le lien et le nom de fichier utilisent le même id, ce qui rend justement la réécriture possible : construisez une table de l'id vers le nom voulu, puis réécrivez les deux ensemble.

### L'export inclut-il d'autres vues de base que celle que j'avais ouverte ?

Non. Seule la vue courante ou par défaut est exportée, et la boîte de dialogue d'export de Notion ne propose pas « toutes les vues ». Une vue formulaire, en particulier, ne peut pas être exportée du tout : exportez la vue tableau de la même base à la place.

### Les commentaires Notion sont-ils inclus dans un export ?

Non, dans aucun des formats que Notion propose. Un commentaire est attaché à une page en tant que discussion, il n'est pas stocké comme contenu de page, et n'atteint donc jamais le PDF, le HTML ni le Markdown & CSV. Recopiez dans le corps de la page tout ce qui touche à une décision avant d'exporter.

### Qu'arrive-t-il à un bloc synchronisé lors d'un export ?

Il s'exporte comme contenu ordinaire à chaque endroit où il était affiché, sans aucune indication que les copies furent un jour le même bloc. Modifier une copie après la migration ne mettra pas les autres à jour, car la relation de synchronisation n'existait qu'à l'intérieur de Notion.

### Puis-je convertir un export Notion sans téléverser mon espace de travail quelque part ?

Oui, si le convertisseur s'exécute dans le navigateur plutôt que sur un serveur — cela mérite confirmation pour un espace de travail contenant quoi que ce soit de sensible, en ouvrant le panneau réseau et en vérifiant que rien ne sort pendant la conversion.

### Combien de temps prend un export Notion ?

Les petits exports se terminent immédiatement sous forme de téléchargement direct. Un export volumineux arrive par e-mail sous forme de lien plutôt qu'en téléchargement immédiat, ce lien expire au bout de sept jours, et la documentation de Notion prévoit un traitement pouvant aller jusqu'à trente heures — planifiez l'export bien avant l'échéance qui en dépend, pas le même après-midi.

### Y a-t-il une limite de débit si je lis un espace de travail via l'API au lieu de l'exporter ?

Oui : une moyenne de trois requêtes par seconde et par intégration, plus une limite distincte partagée par l'ensemble de l'espace de travail. Un script lisant plus de quelques pages doit traiter une réponse `429` en attendant la durée indiquée dans son en-tête `Retry-After` puis en réessayant, plutôt qu'en considérant l'erreur comme un échec.
