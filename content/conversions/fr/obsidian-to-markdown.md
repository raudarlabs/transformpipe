## Ce qui est conservé

Compressez en .zip le dossier du coffre, ou ce qu’a produit un plugin d’export, puis déposez-le. Chaque fichier `.md` non vide devient une note, dans le dossier où elle se trouvait.

| Dans le coffre | Dans le Markdown |
| --- | --- |
| `Projects/Website.md` | Une note « Website » dans un dossier Projects |
| Les propriétés, le bloc `---` en tête | Supprimées |
| `[[Pricing]]`, `[[Pricing#Plans]]` | `Pricing` |
| `[[Pricing\|the plan list]]` | `the plan list` |
| `![[sketch.png]]` | L’image, intégrée, retrouvée par son nom n’importe où dans le .zip |
| `![[brief.pdf]]` | `*brief.pdf*` |

Le titre d’une note est son nom de fichier, placé en titre de premier niveau ; un titre placé en tête qui ne fait que le répéter est retiré.

Titres, listes, tâches, tableaux, code, formules, `==surlignages==` et callouts restent tels qu’ils sont écrits ; l’aperçu affiche `> [!warning]` comme un encadré d’avertissement. Les wikiliens placés dans du code ne sont pas touchés.

Par défaut, le coffre devient **Un dossier de pages**, dans ses propres dossiers, et une note de dossier, `Projects.md` à côté de `Projects/`, passe en tête de son dossier. L’option **Un seul document**, sous la zone de dépôt, donne un fichier unique : un sommaire, puis chaque note sous son titre, séparées par des lignes horizontales.

## Ce qui ne passe pas

- **La destination des wikiliens.** Hors d’un coffre, seuls les mots restent. Un lien interne à la note, `[[#Tasks]]`, est laissé tel quel.
- **Les notes intégrées.** `![[Pricing]]` donne le nom, pas le texte de Pricing.
- **Les autres pièces jointes.** Un PDF, MP3, WAV, MP4 ou MOV intégré devient son nom de fichier en italique.
- **Les intégrations avec un dossier.** Seul un nom de fichier nu est recherché, si bien que `![[assets/plan.png]]` devient `*assets/plan.png*`, même quand le fichier est dans le .zip.
- **Les intégrations dont le nom contient un espace**, comme les fichiers `Pasted image …` d’Obsidian, qui s’affichent en texte.
- **Les liens Markdown entre notes**, laissés tels qu’ils sont écrits.
- **Les canvas, les réglages et les données des plugins.** Seules les notes et les images sont lues.

Les identifiants de bloc comme `^a1b2c3` et les `%%commentaires%%` restent visibles dans le texte.

## Un exemple

Le dossier My vault, compressé, contient `Pricing.md`, `attachments/sketch.png` et cette note, `Projects/Website.md` :

```markdown
---
tags: [work]
status: active
---
# Website

Ship the new pricing page: see [[Pricing#Plans|the plan list]] and [[Roadmap]].

![[sketch.png]]
![[brief.pdf]]

> [!warning] Deadline
> Friday, not Monday.
```

En **Un dossier de pages**, l’import est un dossier My vault qui contient Pricing et un dossier Projects avec ce document (base64 raccourci) :

```markdown
# Website


Ship the new pricing page: see the plan list and Roadmap.

![sketch.png](data:image/png;base64,iVBORw0KGgo…)
*brief.pdf*

> [!warning] Deadline
> Friday, not Monday.
```

## Limites

- **250 Mo par .zip**, traité dans votre navigateur. Sans connexion, rien n’est téléversé ; connecté, rien n’arrive dans votre compte avant que vous n’enregistriez.
- **Les images se partagent un quota** : 2 Mo encodés pour un document unique, environ 4 Mo moins le texte pour chaque note d’un dossier, 1 Mo (environ 750 Ko sur le disque) par image. Un PNG, JPEG, WebP ou BMP de plus de 120 Ko est d’abord redessiné, à 1 600 pixels au plus sur son grand côté, et n’est gardé que si cela le rend plus léger. Une image qui ne tient toujours pas garde son lien.
- **4 Mo par document enregistré.** Une note plus lourde est signalée par son nom et laissée de côté à l’enregistrement du dossier.
- **Tous les fichiers `.md` sont lus**, y compris dans des dossiers cachés comme `.trash` : retirez ce dont vous ne voulez pas avant de compresser.
- **Pas de dimensions.** Dans `![[sketch.png|300]]`, le 300 devient le texte alternatif de l’image.

## Questions

### Comment exporter un coffre Obsidian en Markdown ?

Un coffre est déjà un dossier de fichiers `.md`, il n’y a donc rien à exporter : compressez le dossier du coffre et déposez-le.

### Que deviennent les wikiliens ?

Un lien vers une note devient ses mots : le texte après la barre verticale s’il y en a un, sinon le nom de la note. Le titre ou le bloc visé disparaît avec l’adresse.

### Mes images sont-elles conservées ?

Oui, si le fichier est dans le .zip, tient dans le quota et, s’il est intégré, n’a pas d’espace dans son nom. Une intégration est retrouvée par son nom, une image Markdown par son chemin, puis par son nom. [Convertir un coffre Obsidian](/blog/convert-obsidian-vault-to-markdown) traite le reste de la syntaxe d’Obsidian.

### Les propriétés et les tags sont-ils conservés ?

Pas dans les propriétés : le bloc `---` est supprimé, avec les tags et les alias, parce que ses clés n’ont de sens qu’à l’intérieur du coffre. Un `#tag` dans le texte reste. [Ce que les convertisseurs font du front matter](/blog/front-matter-and-what-converters-do-with-it) explique ce choix.

### Peut-on passer des notes d’Obsidian à Confluence ?

Pas directement : rien ici ne publie dans Confluence. Convertissez le coffre avec **Un seul document**, puis choisissez « Confluence storage format » dans le menu à côté du bouton de téléchargement.

### Est-ce un convertisseur de formats Obsidian au sens large ?

Il lit un coffre, réduit les wikiliens à leurs mots et retire les propriétés ; avec **Un seul document**, le même menu propose aussi HTML, texte brut, Word, EPUB, le balisage Jira ou Slack et **Imprimer ou enregistrer en PDF**. De la syntaxe propre à Obsidian, il n’écrit que les liens vers les titres, dans le téléchargement « Markdown for Obsidian ».
