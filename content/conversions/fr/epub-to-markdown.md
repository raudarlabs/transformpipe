## Ce qui est conservé

Un `.epub` est une archive zip de pages XHTML. Quand vous convertissez ici un EPUB en Markdown, le livre entier devient un seul document : le titre en guise de titre principal, le premier auteur en italique juste en dessous, la liste des chapitres, puis chaque chapitre dans sa propre section sous un titre `# Titre du chapitre`, séparée de la suivante par une ligne horizontale.

L’ordre suivi est l’ordre de lecture que le livre indique lui-même dans la spine de son fichier de paquet, et non l’ordre des noms de fichiers. Les titres viennent de la table des matières du livre (le document de navigation d’EPUB 3 ou l’ancien `toc.ncx`). Pour un chapitre qui n’y figure pas, c’est son premier `<h1>` qui sert, à défaut son premier `<h2>` ou `<h3>`, puis sa balise `<title>`, et à défaut de tout cela, il est nommé « Chapter 4 », en anglais, d’après sa position.

| Dans le livre | Dans le Markdown |
| --- | --- |
| Titres à l’intérieur d’un chapitre | `##`, `###` et ainsi de suite, au niveau choisi par le livre |
| Gras, italique, listes, tableaux | `**gras**`, `*italique*`, listes et tableaux Markdown |
| Liens vers des sites web | Conservés, avec leur adresse |
| Liens entre chapitres, appels de note | Leur texte seulement, par exemple `\[1\]` |
| Images contenues dans l’archive | Intégrées au document |
| La page de sommaire d’un EPUB 3 | Omise, puisque le document écrit sa propre liste |

Lorsqu’un chapitre commence par son propre titre, ce titre est retiré pour ne pas apparaître deux fois. Un titre qui commence par un numéro suivi d’un point, comme « 1. The Light », ou qui contient des crochets, des tirets bas, des astérisques ou d’autres caractères que Markdown échappe, n’est pas reconnu comme une répétition et apparaît alors deux fois.

## Ce qui est laissé de côté

- **L’image de couverture.** C’est la jaquette, pas une page : l’image que le livre désigne comme sa couverture n’est jamais intégrée. Une page de couverture dessinée en SVG disparaît avec elle ; une page de couverture faite d’un simple `<img>` laisse une courte section avec un lien vers une image absente.
- **La mise en forme.** La feuille de style et les polices intégrées ne sont pas lues : polices, lettrines, couleurs et soulignements disparaissent, de même que tout ce qu’une page dessine en SVG intégré, y compris une image encadrée par ce SVG. Les images insérées avec `<img>`, fichiers SVG compris, sont conservées.
- **La plupart des métadonnées.** Seuls le titre et le premier auteur sont lus ; l’éditeur, l’ISBN, la langue et la date ne le sont pas.
- **L’imbrication du sommaire.** Une partie qui regroupe des chapitres devient une liste à plat, avec une section par fichier de la spine, et une page qui ne contient que son titre est omise.

## Un exemple

*The Lighthouse Keeper*, de Mary Hale, est un livre EPUB 3 avec une couverture en SVG, deux chapitres enregistrés sous `index_split_030.xhtml` et `index_split_002.xhtml` (lus dans cet ordre) et une page de notes, ainsi qu’une carte, un appel de note, un tableau et un lien qui renvoie au premier chapitre. Voici ce qu’il devient, avec le base64 raccourci :

```markdown
# The Lighthouse Keeper

*Mary Hale*

- The Light
- The Storm
- Notes

---

# The Light


The lamp was lit at *dusk*, as it had been for forty years.\[1\]

![Map of the headland](data:image/png;base64,iVBORw0KGgo…)

See [the register](https://example.org/lighthouses).

---

# The Storm


| Night | Wind |
| --- | --- |
| Monday | Force 9 |

Back to the first chapter.

---

# Notes

\[1\] Since 1884.
```

## Limites

- **50 Mo par envoi.** Plusieurs livres déposés en même temps sont enchaînés en un seul document, et la limite s’applique à leur total.
- **Les images se partagent une enveloppe.** Chacune n’est intégrée que si elle pèse moins d’environ 750 Ko, et les images d’un même livre disposent ensemble d’environ 1,5 Mo, consommés dans l’ordre de lecture. Au-delà, une image garde son chemin dans l’archive, qui n’affiche rien en dehors d’elle.
- **La conversion se fait dans votre navigateur.** Le livre n’est pas envoyé. Le Markdown n’arrive dans un compte que si vous vous connectez et cliquez sur Enregistrer, et un document enregistré peut atteindre 4 Mo.
- **Uniquement des `.epub`.** Un fichier Kindle `.mobi` ou `.azw3` est refusé.

## Questions fréquentes

### Comment ouvrir un fichier EPUB ?

Pour le lire, utilisez une application de lecture comme Apple Books ou Calibre ; [Comment ouvrir un fichier .epub](/how-to/open-epub) passe les options en revue. Pour en extraire le texte, convertissez-le ici : le livre s’affiche comme une seule page que vous pouvez lire dans le navigateur, copier ou télécharger en `.md`.

### Les chapitres seront-ils dans le bon ordre ?

Oui. L’ordre vient de la spine, le seul endroit où un EPUB l’indique, et les noms de fichiers sont ignorés. [Convertir un EPUB en Markdown](/blog/convert-epub-to-markdown) explique pourquoi on ne peut pas se fier à ces noms.

### Que deviennent les notes de bas de page ?

L’appel de note garde son texte, `[1]`, mais ne renvoie plus nulle part, et la note reste là où le livre l’avait placée, le plus souvent dans un chapitre de notes à la fin. Les notes ne sont pas transformées en notes Markdown de la forme `[^1]`.

### Peut-on convertir un livre Kindle ou un livre protégé par DRM ?

Non. Seuls les fichiers `.epub` sont acceptés, et aucun chapitre n’est déchiffré ici. Les chapitres d’un livre protégé ressortent donc sous forme de caractères illisibles.

### Puis-je obtenir chaque chapitre dans un fichier séparé ?

Non. Un livre devient toujours un seul document, mais chaque chapitre commence après une ligne horizontale par son propre titre `# `, ce qui permet de le découper facilement à la main.
