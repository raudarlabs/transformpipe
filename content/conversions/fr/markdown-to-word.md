## Ce qui est conservé

Convertir Markdown en Word ici donne la structure propre à Word : des styles nommés, une vraie numérotation et de vraies notes de bas de page, pas une mise en forme plaquée sur du texte Normal.

| Dans le Markdown | Dans le document Word |
| --- | --- |
| `#` à `######` | Titre 1 à Titre 6, listés dans le volet de navigation |
| listes `-` et `1.`, imbriquées | la numérotation de Word, sur neuf niveaux ; une liste numérotée de premier niveau garde son numéro de départ |
| `- [ ]` et `- [x]` | ☐ et ☑ |
| `**bold**`, `*italic*`, `~~struck~~`, `==marked==`, `H~2~O`, `x^2^` | gras, italique, barré, surlignage jaune, indice, exposant |
| `` `code` `` et blocs de code délimités | le style de caractère Inline Code ; un paragraphe Code grisé par bloc, en Consolas |
| citations `>` et encadrés du type `[!NOTE]` | le style Citation ; un style Note, Tip, Important, Warning ou Caution |
| un tableau | Grille du tableau, ligne d’en-tête en gras et répétée sur chaque page, alignement conservé |
| `[^1]` | une note en bas de page, numérotée par Word |
| liens vers des adresses web, `mailto:` et des titres | des liens hypertexte ; des liens vers un signet posé sur le titre |
| images | dans le fichier, réduites à la largeur de la page si elles la dépassent, le texte alternatif servant de description |

Le titre, dans les propriétés du document, est le premier titre du texte, ou à défaut le nom du fichier. Les pages sont au format A4, en Calibri 11 pt.

## Ce qui se perd

- **L’en-tête YAML (front matter).** Le bloc entre lignes `---` en tête de fichier est supprimé ; son `title:` n’est pas repris.
- **Coloration, diagrammes et formules.** Le code reste monochrome, sans coloration syntaxique. Un bloc `mermaid` n’est pas dessiné : sa source reste, sous la légende « Mermaid diagram ». `$…$` et `$$…$$` gardent leur TeX, mis en forme comme du code et non comme des équations Word.
- **Certaines images.** Seuls PNG, JPEG et GIF entrent dans le fichier, et une image de ce type incorporée sous forme d’adresse `data:` y entre toujours. Un WebP ou un SVG, un chemin sur votre disque, ou une adresse web dont le serveur refuse la lecture à un navigateur devient sa description entre crochets, sous forme de lien ou en italique.
- **Les liens sans destination.** Un lien vers un autre fichier, ou vers un titre absent du document, ne garde que ses mots. De même pour un wikilien comme `[[Page|text]]`.
- **Le HTML brut.** Les balises disparaissent et les mots qu’elles entourent restent. Un commentaire est supprimé entièrement, de même qu’un script ou un style écrit comme un bloc à part.
- **L’habillage de page.** Ni table des matières, ni en-tête, ni pied de page, ni numéros de page ne sont ajoutés ; Word construit une table des matières à partir des titres quand vous la demandez. Les colonnes des tableaux ont toutes la même largeur, et la propriété Auteur indique TransformPipe.

## Un exemple

```markdown
---
title: Release 2.4
---

# Release checklist

Before tagging, read [the build notes](#build-notes) and the
[runbook](https://example.com/runbook).[^1] The ==date== goes in
[the plan](../plans/q3.md).

1. Run the tests
2. Update `CHANGELOG.md`
   - [x] version bumped
   - [ ] date set

> [!WARNING]
> Do not tag on a Friday.

| Step  | Owner |
|:------|------:|
| Build | Ana   |

## Build notes

![Pipeline](pipeline.png)

[^1]: The runbook is internal.
```

Le .docx contient ces paragraphes, avec leurs styles :

```text
Heading 1       Release checklist
Normal          Before tagging, read the build notes and the runbook.¹ The date goes in the plan.
List Paragraph  1. Run the tests
List Paragraph  2. Update CHANGELOG.md
List Paragraph       ☑ version bumped
List Paragraph       ☐ date set
Warning         Warning
Warning         Do not tag on a Friday.
Table Grid      Step  | Owner
                Build |   Ana
Heading 2       Build notes
Normal          [Pipeline]
Footnote Text   ¹ The runbook is internal.
```

Dans un Word en français, les styles intégrés s’appellent « Titre 1 », « Normal », « Paragraphe de liste », « Grille du tableau » et « Note de bas de page ». « the build notes » renvoie à son titre. « the plan » pointait vers un fichier sur le disque, il ne reste donc que les mots ; `[Pipeline]` remplace une image que le document n’a jamais contenue.

## Limites

- Fichiers `.md`, `.markdown`, `.mdown` et `.mkd` jusqu’à 10 Mo, ou Markdown collé. Plusieurs fichiers déposés ensemble se partagent les 10 Mo et deviennent un seul document, séparés par des filets.
- Le .docx est fabriqué dans votre navigateur. Rien ne part vers un compte tant que vous ne vous connectez pas et n’appuyez pas sur Enregistrer ; un document enregistré peut peser au plus 4 Mo.
- Les images situées à une adresse web sont demandées par votre navigateur, dix secondes au plus chacune.

## Questions

### Comment convertir Markdown en Word ?

Déposez le fichier .md ici ou collez le Markdown, vérifiez l’aperçu, puis appuyez sur Télécharger .docx. Pour ouvrir le résultat sans Word, voir [Comment ouvrir un fichier .docx](/how-to/open-docx).

### Peut-on importer du Markdown dans un document Word existant ?

Convertissez-le d’abord ici, puis insérez le .docx avec Insertion › Objet › Texte d’un fichier. Les titres y arrivent en Titre 1 à 6.

### Est-ce la même chose que Pandoc pour passer de Markdown à Word ?

Non. Pandoc est un programme à installer, qui reprend les styles d’un .docx de référence. Ici, pas de modèle, mais les titres, le texte, les listes, les citations, les tableaux et les notes portent les noms de styles intégrés de Word : appliquer dans Word le modèle de votre organisation en change l’apparence d’un coup. [Markdown vers Word](/blog/markdown-to-word) compare Pandoc et son document de référence aux autres méthodes.

### Faut-il garder la source en Markdown ou en .docx ?

Gardez le Markdown comme original s’il vit dans un dépôt ou change souvent, et envoyez le .docx aux lecteurs qui travaillent dans Word. Leurs modifications ne reviennent qu’en reconvertissant le .docx. [Markdown ou Word pour la documentation](/blog/markdown-vs-docx-for-documentation) détaille la décision.
