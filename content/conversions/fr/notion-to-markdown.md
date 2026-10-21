## Ce qui est conservé

Déposez le .zip que Notion produit en exportant au format « Markdown & CSV ». Chaque fichier `.md` non vide qu’il contient devient une page, chaque `.csv` un tableau, quelle que soit leur profondeur dans les dossiers.

| Dans l’export | Dans le Markdown |
| --- | --- |
| `Project plan 0f1e…e1f0.md` | Une page intitulée « Project plan », sans l’identifiant |
| La ligne `# Project plan` de la page | Un seul titre, pas deux |
| Un dossier de sous-pages | Un dossier du même nom, la page parente en premier |
| Une base de données, `Tasks 9f8e…b1a0.csv` | Un tableau sous « Tasks », la première ligne en en-tête |
| Une image dans le dossier de la page | Intégrée à la page |

Les titres, listes, cases à cocher, citations, blocs de code, l’emphase, les liens vers des sites et le HTML, comme un bloc `<aside>`, restent tels que Notion les a écrits. Dans le tableau d’une base de données, un saut de ligne à l’intérieur d’une cellule devient `<br>`.

Par défaut, l’export devient **Un dossier de pages** : un document par page, dans les dossiers de l’export. L’option **Un seul document**, sous la zone de dépôt, donne à la place un fichier unique : un sommaire, puis chaque page sous son titre, séparées par des lignes horizontales, les bases de données à la fin.

Une image est retrouvée par son chemin relatif, sinon par son nom de fichier n’importe où dans l’archive, puis écrite dans la page sous forme d’adresse `data:`.

## Ce qui ne passe pas

- **La destination des liens entre pages.** Notion relie les pages par leurs noms de fichiers exportés, et une fois les pages devenues des documents, plus rien ne se trouve sous ces noms. Le lien garde ses mots et perd son adresse, dans les deux modes ; un lien vers le `.csv` d’une base de données aussi.
- **Les identifiants**, retirés des titres et des noms de dossiers. Quand tout se trouve dans le dossier `Export-…` de Notion, le dossier de l’import prend le nom de votre .zip.
- **Les autres fichiers.** Les PDF et autres pièces jointes ne sont pas lus, et un .zip placé dans le .zip n’est pas ouvert.
- **Les images au-delà du quota**, qui gardent leur ancienne adresse au lieu d’être intégrées.

## Un exemple

Un export Notion contient une page Project plan et, dans son dossier, une image, une base de données Tasks et une sous-page Meeting notes avec une courte liste. Le Markdown de la page est le suivant :

```markdown
# Project plan

Launch is planned for **March**. Notes from the kick-off are in [Meeting notes](Project%20plan%200f1e2d3c4b5a69788796a5b4c3d2e1f0/Meeting%20notes%20a1b2c3d4e5f60718293a4b5c6d7e8f90.md); wording follows the [style guide](https://example.com/style).

![Timeline](Project%20plan%200f1e2d3c4b5a69788796a5b4c3d2e1f0/timeline.png)
```

Avec **Un seul document**, l’export devient ceci (le base64 de l’image raccourci) :

```markdown
# Contents

- Project plan
- Meeting notes
- Tasks

---

# Project plan


Launch is planned for **March**. Notes from the kick-off are in Meeting notes; wording follows the [style guide](https://example.com/style).

![Timeline](data:image/png;base64,iVBORw0KGgo…)

---

# Meeting notes


- Scope agreed
- [ ] Book the room

---

# Tasks

| Name | Status | Owner |
| --- | --- | --- |
| Draft brief | Done | Ana |
| Review, round 2 | In progress | Tom |
```

En **Un dossier de pages**, l’import contient un dossier Project plan avec trois documents, dans cet ordre : Project plan, Meeting notes, Tasks.

## Limites

- **250 Mo par .zip**, traité dans votre navigateur. Sans connexion, rien n’est téléversé ; connecté, rien n’arrive dans votre compte avant que vous n’enregistriez.
- **Les images se partagent un quota** : 2 Mo encodés pour un document unique, environ 4 Mo moins le texte pour chaque page d’un dossier, 1 Mo (environ 750 Ko sur le disque) par image. Un PNG, JPEG, WebP ou BMP de plus de 120 Ko est d’abord redessiné, à 1 600 pixels au plus sur son grand côté, et n’est gardé que si cela le rend plus léger.
- **4 Mo par document enregistré.** Une page plus lourde est signalée par son nom et laissée de côté à l’enregistrement du dossier ; un document unique plus lourd reste téléchargeable.
- **Ordre des chemins** : alphabétique, « Page 2 » avant « Page 10 ».

## Questions

### Comment convertir Notion en Markdown ?

Exportez la page ou l’espace de travail depuis Notion au format « Markdown & CSV », puis déposez le .zip ici. Les pages arrivent sous leurs titres, les bases de données en tableaux.

### Que sont les codes de 32 caractères dans les noms de fichiers exportés ?

Chacun est l’identifiant d’une page dans Notion, ajouté à ses noms de fichier et de dossier et repris dans chaque lien vers elle. La conversion les retire ; [Comment ouvrir un .zip d’export](/how-to/open-zip) explique pourquoi renommer les fichiers à la main casse les liens.

### Faut-il inclure les sous-pages à l’export ?

Oui, si vous voulez les pages situées sous celle que vous exportez : seul ce qui se trouve dans le .zip est converti. Si « Create folders for subpages » est aussi activé, une page et ses sous-pages deviennent ici un dossier, la page en premier.

### Les liens entre pages fonctionnent-ils encore ?

Non : leurs mots restent, leurs adresses disparaissent. Pour obtenir des fichiers séparés qui se renvoient encore les uns aux autres, [Convertir un export Notion](/blog/convert-notion-export-to-markdown) décrit la réécriture nécessaire.

### Est-ce la même chose que notion-to-md ?

Non. notion-to-md est un paquet Node qui lit les pages par l’API de Notion avec un jeton d’intégration ; cette page lit le .zip exporté et ne se connecte jamais à votre espace de travail.

### Peut-on faire passer un export Notion dans Obsidian ?

En partie. En **Un dossier de pages**, choisissez **Télécharger le .zip**, puis **Pour Obsidian** : les mêmes dossiers, un fichier `.md` par page, les liens vers les titres écrits à la façon d’Obsidian. Les liens entre pages arrivent en simple texte.
