---
title: "Convertir un coffre Obsidian en Markdown : wikiliens, intégrations et ce qui reste"
description: "Un coffre Obsidian est déjà fait de fichiers Markdown : ce que la conversion vers du Markdown standard répare vraiment, des wikiliens aux encarts et à Dataview"
date: 2026-09-14
tag: Conversion
keywords: obsidian vers markdown, convertir un coffre obsidian en markdown, wikiliens obsidian markdown, exporter obsidian en markdown, export coffre obsidian, dialecte markdown obsidian
---

Un coffre Obsidian est un dossier de fichiers `.md` posés sur un disque, ce qui fait de « le convertir en Markdown » une formulation un peu absurde : c'est déjà du Markdown. Le piège tient dans le mot « déjà ». Obsidian écrit son propre dialecte par-dessus le noyau CommonMark, et quatre de ses constructions — wikiliens, intégrations, références de bloc et encarts — se lisent comme une syntaxe cassée ou comme du texte brut pour tout ce qui n'est pas Obsidian lui-même. Il n'y a rien à exporter, puisqu'il n'existe ni bouton d'export ni conversion de format au sens habituel. Il y a une réécriture, et elle doit avoir lieu avant que le coffre ne quitte Obsidian pour de bon.

### En bref

Le coffre n'a besoin d'aucune étape d'export — les fichiers sont déjà sur le disque — mais quatre conventions propres à Obsidian ne survivent pas au contact d'un analyseur Markdown standard : les `[[wikiliens]]`, les `![[intégrations]]`, les références de bloc `[[Note#^block-id]]` et les encarts `> [!note]`. Un `[[wikilien]]` n'est un lien vers rien du tout hors d'Obsidian tant qu'il n'est pas réécrit en chemin relatif réel ; une intégration n'a aucun équivalent de transclusion en Markdown standard et devient soit une copie du contenu insérée sur place, soit un simple lien ; une référence de bloc n'a littéralement plus rien à viser dès que l'identifiant de bloc disparaît ; et un encart est une citation affublée d'un marqueur que la plupart des moteurs de rendu affichent en texte brut. Désactivez « Use \[\[Wikilinks\]\] » dans Paramètres, Fichiers et liens, pour que les nouveaux liens soient écrits en Markdown standard par la suite — le réglage ne s'applique qu'aux liens écrits après votre changement, donc un coffre établi devra de toute façon voir les anciens réécrits. Pour un coffre entier transformé en un document unique avec les wikiliens déjà résolus, [la conversion Obsidian → Markdown de TransformPipe](/obsidian-to-markdown) lit directement un coffre compressé et fait la réécriture dans la même passe.

Ce que cela ne répare pas, parce que rien ne le peut : une requête Dataview affichait un tableau uniquement à l'intérieur d'Obsidian, au moment de l'affichage, depuis un plugin — le texte de la requête se convertit très bien, en bloc de code, et le tableau qu'elle produisait n'est tout simplement pas là pour un lecteur hors d'Obsidian.

## Pourquoi un coffre de fichiers Markdown a quand même besoin d'être converti

CommonMark et GitHub Flavored Markdown, les deux dialectes qu'attendent presque tous les outils hors d'Obsidian, n'ont aucune notion de wikilien, d'intégration, de référence de bloc ou de bloc d'encart. Obsidian a ajouté les quatre comme extensions par-dessus la syntaxe standard, parce qu'elles sont réellement utiles dans une base de connaissances personnelle qui connaît déjà chacun de ses fichiers — un wikilien peut atteindre une note par son titre sans que vous indiquiez de chemin, puisque Obsidian indexe tout le coffre. Dès qu'un fichier quitte cet environnement indexé — collé dans un README GitHub, ouvert dans un éditeur de texte, donné à un générateur de site statique — l'index a disparu et les raccourcis cessent de se résoudre vers quoi que ce soit.

## Comparatif rapide : ce qui doit être réécrit, et qui fait la réécriture

| Construction Obsidian | Ce qu'un analyseur standard voit | Correction |
| --- | --- | --- |
| `[[Note]]` | Du texte littéral : deux crochets ouvrants, le mot Note, deux crochets fermants | Réécrire en `[Note](note.md)`, en résolvant le chemin relatif au coffre |
| `[[Note\|Texte affiché]]` | La même chose, littérale | Réécrire en `[Texte affiché](note.md)` |
| `![[Note]]` (intégration de note) | Du texte littéral | Insérer le contenu de la note sur place, ou un simple lien — la transclusion n'a pas d'équivalent standard |
| `![[image.png]]` (intégration de fichier) | Du texte littéral | Réécrire en `![](image.png)`, la syntaxe d'image standard |
| `[[Note#Titre]]` | Du texte littéral | Réécrire en `note.md#titre`, en vérifiant la règle d'ancrage du moteur de rendu cible |
| `[[Note#^block-id]]` | Du texte littéral | Aucune cible hors d'Obsidian — insérer plutôt le texte cité |
| `^block-id` en fin de ligne | Un accent circonflexe isolé et un mot, imprimés | Supprimer dès que plus rien ne le référence |
| Encart `> [!note]` | Une citation dont la première ligne contient le texte littéral `[!note]` | Retirer le marqueur, garder la citation, signaler le type autrement si cela compte |
| Un bloc ` ```dataview ` | Un bloc de code affichant le texte de la requête | Rien à convertir — le tableau n'a jamais été dans le fichier |
| `%%commentaire%%` | Le texte lui-même, visible, puisque la syntaxe de commentaire en ligne d'Obsidian n'est pas standard non plus | Supprimer avant de convertir |
| En-tête YAML (bloc `---`) | Généralement sans problème, mais un analyseur qui ne le reconnaît pas rend le `---` d'ouverture comme un filet horizontal | Le retirer, ou le convertir dans la convention d'en-tête du format cible |

## Désactiver les wikiliens, et ce que cela répare ou non

Le réglage se trouve dans Paramètres, Fichiers et liens, « Use \[\[Wikilinks\]\] » : désactivez-le et Obsidian écrit des liens Markdown standard, `[texte](chemin)`, pour chaque lien créé à partir de ce moment (vérifié sur obsidian.md et via la documentation des paramètres d'Obsidian, le 14 septembre 2026). L'autocomplétion continue de fonctionner exactement pareil — tapez `[[`, choisissez une note dans les suggestions — le seul changement porte sur ce qui est écrit sur le disque une fois le choix confirmé.

| Avantages | Inconvénients |
| --- | --- |
| Coût de migration nul pour les liens écrits après le changement | Chaque lien écrit avant reste intact : un coffre établi a de toute façon besoin d'une passe de réécriture |
| Rend le coffre immédiatement plus interopérable pour la suite | Les intégrations, références de bloc et encarts ne sont pas concernés — ce réglage ne touche que les liens simples |
| Aucun plugin, aucun export, aucune nouvelle dépendance | Le lien automatique par titre suppose toujours que le fichier se trouve au chemin qu'Obsidian a résolu à la création du lien |

**Pour qui ?** Pour quiconque compte continuer à écrire dans Obsidian tout en rendant le coffre progressivement plus portable. Ce n'est pas un outil de migration en soi : cela empêche le problème de grossir, et l'arriéré de wikiliens existants demande toujours une passe.

## Réécrire wikiliens et intégrations dans un coffre existant

Pour un coffre qui compte déjà des mois ou des années de wikiliens, la solution pratique est un script : parcourir chaque fichier `.md`, repérer les motifs de wikilien et d'intégration, résoudre chaque cible contre l'index de fichiers du coffre, et réécrire sur place.

```text
WIKILINK = /!?\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/

for file in vault:
    text = read(file)
    text = replace_all(text, WIKILINK, (whole, target, shown) => {
        path = resolve_in_vault(target)      # match by filename, vault-wide
        text_shown = shown ?? target
        if whole starts with "!" and target looks like an image or attachment:
            return "![](" + path + ")"
        if path exists:
            return "[" + text_shown + "](" + path + ")"
        return text_shown                     # nothing to link to; keep the words
    })
    write(file, text)
```

Le détail qui piège une première tentative : `resolve_in_vault` doit chercher dans tout le coffre par nom de fichier, et pas seulement dans le dossier courant, parce que la résolution de liens d'Obsidian fait exactement cela — un wikilien écrit `[[Meeting Notes]]` depuis n'importe quelle note du coffre trouve un fichier nommé `Meeting Notes.md` où qu'il se trouve, et un script qui n'inspecte que le dossier de la note émettrice produira silencieusement des liens morts pour tout ce qui n'est pas rangé à côté d'elle.

**Une remarque sur l'ambiguïté.** Deux fichiers de même nom dans des dossiers différents sont indiscernables pour un `[[Meeting Notes]]` nu : Obsidian résout vers celui qu'il trouve en premier selon sa propre règle interne, et un script de réécriture hérite de la même ambiguïté. Si un coffre contient des noms de fichiers dupliqués d'un dossier à l'autre, réglez cela avant d'accorder votre confiance à une réécriture automatique des liens qui les relient.

## Encarts, Dataview et l'écosystème de plugins en général

Un encart — `> [!note]`, `> [!warning]`, et Obsidian en livre une douzaine de types — est une citation dont la première ligne porte un marqueur de type entre crochets. Un moteur de rendu Markdown standard affiche le marqueur en texte littéral au lieu de styler le bloc ; la correction consiste donc soit à retirer le marqueur (en perdant la distinction visuelle entre une note et un avertissement), soit à faire correspondre chaque type à une convention de votre cru dans le format de destination, à supposer que celle-ci prenne en charge des encarts stylés.

Dataview est le cas que l'on interprète le plus souvent de travers. Une requête Dataview s'écrit dans un bloc de code délimité dont la chaîne d'information est `dataview` — ce bloc se convertit parfaitement, en bloc de code ordinaire affichant le texte de la requête. Ce qui ne se convertit pas, c'est le tableau que Dataview produisait, parce que ce tableau n'a jamais été écrit dans le fichier : le plugin Dataview d'Obsidian exécute la requête et rend le résultat au moment de l'affichage, à chaque ouverture de la note, et le fichier source n'a jamais contenu que la question, jamais la réponse.

La même logique vaut pour tout plugin qui affiche quelque chose que le fichier lui-même ne contient pas : une vue carte mentale, une vue graphe, un canevas. Si la valeur d'une note dépend du rendu d'un plugin plutôt que de son texte brut, convertir le texte seul donnera toujours l'impression d'avoir perdu quelque chose, parce que c'est le cas : le rendu n'a jamais été stocké.

## Les alias : l'autre façon dont la cible d'un wikilien est ambiguë

L'en-tête YAML d'une note peut porter une liste `aliases`, et Obsidian résout un `[[wikilien]]` contre l'un quelconque des alias d'une note cible aussi volontiers que contre son vrai nom de fichier. C'est commode à l'intérieur du coffre — renommer une note sans casser tous les liens vers son ancien titre, tant que ce titre reste un alias — et c'est une chose de plus dont un script de réécriture doit tenir compte : `resolve_in_vault` doit consulter l'en-tête `aliases` de chaque fichier autant que son nom de fichier, faute de quoi un lien écrit contre un alias ne résout vers rien et retombe en texte brut non lié.

## Un plugin communautaire, si vous préférez ne pas écrire le script

L'annuaire de plugins d'Obsidian propose des plugins d'export construits par la communauté — [obsidian-markdown-export-plugin](https://github.com/bingryan/obsidian-markdown-export-plugin) en est un, qui exporte une note ou un dossier entier sous forme de paquet avec ses images liées à côté et les liens internes réécrits pour se résoudre hors du coffre. C'est une vraie option pour qui préférerait installer un plugin plutôt qu'écrire le résolveur ci-dessus, au prix d'un plugin communautaire ajouté à votre coffre et d'une confiance accordée à sa logique de réécriture plutôt qu'à une logique que vous pouvez relire ligne à ligne.

| Avantages | Inconvénients |
| --- | --- |
| Aucun script à écrire ou à maintenir soi-même | Une dépendance au rythme de publication et aux choix d'un plugin communautaire |
| Regroupe les pièces jointes images à côté du Markdown exporté | Le comportement sur les références de bloc, les encarts et Dataview relève du plugin, pas de vous |
| Fonctionne depuis l'interface d'Obsidian, sans outil séparé | Vérifiez la fiche actuelle du plugin pour sa licence et son état de maintenance avant d'en dépendre pour quelque chose que vous ne pourriez pas refaire à la main |

**Pour qui ?** Pour quelqu'un qui exporte une poignée de notes à la fois depuis Obsidian, plutôt que de scripter une migration de coffre entier ou de recourir à une fusion dans le navigateur.

## Rendre un coffre portable avant d'en avoir besoin

Quatre habitudes gardent un coffre convertible sans changer votre façon d'écrire au quotidien :

- **Désactivez les wikiliens** pour que les nouveaux liens soient standard à partir de maintenant.
- **Gardez les pièces jointes dans le dossier du coffre**, sans les référencer depuis l'extérieur, pour que les chemins relatifs tiennent quand le dossier est copié ou compressé.
- **Préférez un lien à une intégration** quand les deux conviendraient — un lien se dégrade proprement en lien ; une intégration se dégrade soit en copie dupliquée du contenu, soit en une paire de crochets nus, selon le convertisseur.
- **Traitez les références de bloc comme une aide personnelle à la navigation**, pas comme un moyen de bâtir un raisonnement à partir de morceaux épars, puisqu'une référence de bloc n'a aucun chemin de repli en Markdown standard : hors d'Obsidian, ce n'est pas un lien cassé, ce n'est rien.

## Téléverser le coffre directement, fusionné en un seul document

La réécriture ci-dessus vaut la peine pour un coffre qui reste un dossier de fichiers séparés. Si la destination a toujours été un document unique — un export à transmettre, une archive des notes d'un projet — [la conversion Obsidian → Markdown de TransformPipe](/obsidian-to-markdown) évite la réécriture fichier par fichier : compressez le dossier du coffre et téléversez-le, et chaque note devient une section d'un document unique, dans son ordre d'origine, avec un sommaire généré. Wikiliens, alias et ancres de titre se résolvent vers les mots qu'ils affichaient plutôt que vers un chemin, pour la même raison qu'un lien inter-pages dans un export Notion ou Confluence fusionné garde ses mots au lieu de son adresse : dès que chaque note est une section du même document, il ne reste nulle part où pointer.

| Avantages | Inconvénients |
| --- | --- |
| Aucun script, aucun index de noms de fichiers à construire soi-même | Produit un document unique — la mauvaise forme si les notes doivent rester des fichiers séparés avec leurs propres chemins |
| L'en-tête est retiré automatiquement, et une intégration `![[image.png]]` devient l'image elle-même, portée dans le document | Le plafond est de deux mégaoctets d'images par document ; une pièce jointe qui n'est pas une image — un PDF, une note audio — devient toujours du texte en italique |
| Fonctionne dans le navigateur ; le coffre n'est jamais téléversé quand vous n'êtes pas connecté | Les tableaux Dataview et les autres contenus rendus par plugin sont absents, comme par n'importe quel autre chemin, puisque le fichier source ne les a jamais contenus |

**Prix :** gratuit, exécution locale.

**Pour qui ?** Pour un coffre, ou une partie de coffre, transmis ou archivé comme un document lisible unique plutôt que conservé comme un ensemble de fichiers vivants et liés entre eux.

## Comment choisir

1. **Décidez si le coffre reste un dossier de fichiers ou devient un document unique.** Des fichiers séparés avec des liens relatifs fonctionnels appellent le script de réécriture sur place. Un document unique appelle la fusion, qui règle le même problème de wikiliens autrement, en supprimant le besoin d'une cible distincte à résoudre.
2. **Repérez les blocs Dataview et les autres contenus rendus par plugin avant de convertir quoi que ce soit.** Ils se convertissent correctement, en texte de requête, et le tableau ou la vue qu'ils produisaient n'est pas récupérable depuis le fichier — notez où ces tableaux comptaient tant que vous pouvez encore les voir affichés.
3. **Surveillez les noms de fichiers dupliqués d'un dossier à l'autre.** Un wikilien vers un nom non unique est ambigu même à l'intérieur d'Obsidian ; un script de réécriture hérite de cette ambiguïté plutôt que de la trancher pour vous.
4. **Désactivez les wikiliens pour la suite, quel que soit le chemin retenu pour l'arriéré.** Cela ne coûte rien et empêche le problème de grossir pendant que vous traitez l'existant.

Si la question porte sur l'outil plutôt que sur le chemin — toutes les options ici sont gratuites et diffèrent par le coût de mise en place et par le contrôle qu'elles vous laissent sur les cas ambigus — [le comparatif des convertisseurs Obsidian gratuits](/blog/free-obsidian-to-markdown-converter) est la réponse plus courte.

## Conclusion

Un coffre Obsidian a moins besoin d'être exporté que traduit : les fichiers sont déjà du Markdown, et tout le travail se concentre sur les quatre endroits où Obsidian a écrit sa propre syntaxe par-dessus — wikiliens, intégrations, références de bloc et encarts. Les réécrire sur place garde le coffre sous forme de dossier de fichiers séparés et fonctionnels ; fusionner le coffre entier en un document unique règle le même problème de wikiliens en supprimant le besoin d'une cible distincte à atteindre. Dans les deux cas, rien ne récupère un tableau Dataview ni la vue rendue par un plugin, puisque ni l'un ni l'autre n'a jamais été stocké dans le fichier — vérifiez cela pendant que le coffre est encore ouvert dans Obsidian, pas après. [Comment Notion et Confluence se comparent](/blog/markdown-from-notion-obsidian-and-confluence) sur le même problème d'export puis de réparation vaut la lecture si Obsidian n'est pas la seule source en jeu.

## FAQ

### Obsidian dispose-t-il d'une fonction d'export vers Markdown ?

Non, et il n'en a pas besoin : un coffre est déjà un dossier de fichiers `.md` sur le disque. Ce qui demande une conversion, c'est la syntaxe propre à Obsidian posée par-dessus le Markdown standard : wikiliens, intégrations, références de bloc et encarts, qu'aucun analyseur standard ne lit correctement.

### Comment convertir les `[[wikiliens]]` d'Obsidian en liens Markdown standard ?

Désactivez « Use \[\[Wikilinks\]\] » dans Paramètres, Fichiers et liens, pour tout ce qui sera écrit ensuite. Pour les liens déjà présents dans le coffre, un script doit repérer chaque `[[wikilien]]`, résoudre le nom de fichier cible contre l'ensemble du coffre, et le réécrire en lien standard `[texte](chemin)`.

### Qu'advient-il des requêtes Dataview lors de la conversion d'un coffre ?

La requête elle-même se convertit très bien, en bloc de code délimité affichant son texte. Le tableau qu'elle affichait ne se convertit pas, parce qu'il n'a jamais été stocké dans le fichier : Dataview le génère au moment de l'affichage, à l'intérieur d'Obsidian, depuis un plugin.

### Puis-je conserver les encarts Obsidian en passant au Markdown standard ?

Pas en tant qu'encarts stylés, puisque `> [!note]` est une syntaxe spécifique à Obsidian. Le repli sûr consiste à retirer le marqueur entre crochets et à conserver la citation ; si le type compte, signalez-le dans le texte lui-même, car un moteur de rendu standard ne stylera pas différemment les différents types d'encart de lui-même.

### Que devient une intégration comme `![[Note]]` hors d'Obsidian ?

Du texte littéral — un point d'exclamation suivi de crochets, le nom de la note, deux crochets fermants — sauf si quelque chose la réécrit. Il n'existe aucune syntaxe de transclusion en Markdown standard, donc les corrections honnêtes consistent à insérer directement le contenu de la note référencée, ou à convertir l'intégration en simple lien, selon que le format de destination offre ou non un équivalent.

### Puis-je convertir un coffre sans le téléverser quelque part ?

Oui, si le convertisseur s'exécute localement dans votre navigateur plutôt que d'envoyer les fichiers à un serveur — cela mérite vérification pour un coffre contenant quoi que ce soit de sensible, en surveillant le panneau réseau pendant la conversion et en confirmant que rien ne sort.

### Mon wikilien pointe vers l'ancien titre d'une note. Pourquoi fonctionne-t-il encore dans Obsidian mais plus après conversion ?

Parce que l'ancien titre figure probablement dans l'en-tête `aliases` de cette note, et qu'Obsidian résout les wikiliens contre les alias autant que contre les vrais noms de fichiers. Un script de réécriture ou un convertisseur doit consulter cette même liste d'alias, sinon un lien écrit contre l'ancien titre d'une note renommée ne résout plus rien dès qu'il quitte Obsidian.

### Dois-je convertir les références de bloc avant de partager un coffre hors d'Obsidian ?

Oui, au sens où rien d'autre ne les affichera utilement : `[[Note#^block-id]]` n'a strictement aucun équivalent hors d'Obsidian. La seule correction honnête consiste à insérer directement le texte cité là où se trouvait la référence, puisqu'il n'existe aucune cible externe à viser.
