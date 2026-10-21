## Ce qui est conservé

La présentation devient un seul document : la liste des titres des diapositives, puis une section par diapositive, séparées par des lignes horizontales. Les diapositives arrivent dans l'ordre de projection, si bien qu'une diapositive glissée en tête reste en tête. Dans une diapositive, les formes sont lues dans l'ordre où le fichier les enregistre.

| Sur la diapositive | Dans le Markdown |
| --- | --- |
| Le titre | Le titre de section, à défaut une première ligne courte, à défaut « Slide 4 » |
| Puces et numéros définis sur la diapositive | Une liste, `-` ou `1.`, en retrait selon le niveau |
| Le reste du texte | Des paragraphes |
| Mots en gras et en italique | `**gras**` et `*italique*`, sauf si toute la ligne l'est |
| Un lien web | Un lien Markdown vers la même adresse |
| Un tableau | Un tableau Markdown, la première ligne en en-tête |
| Une image | Une image intégrée au document, avec son texte alternatif |
| Les notes du présentateur | Une citation sous la diapositive, intitulée **Notes** |

Hors des tableaux, un astérisque ou un dièse saisi sur une diapositive est échappé et s'affiche tel quel. Une image qui revient sur une diapositive suivante, un logo par exemple, n'est reprise que la première fois.

## Ce qui se perd

Les graphiques et les SmartArt ne sont pas lus ; une diapositive qui ne contient qu'un diagramme garde son titre et ses notes. Les numéros de diapositive, les dates et les pieds de page disparaissent, de même que tout ce qui relève de la mise en page : thème, couleurs, polices, positions, animations et transitions. Ce qui se trouve sur le masque des diapositives ou sur une disposition n'est pas lu, pas plus que les commentaires de relecture. Un lien vers une autre diapositive pointe vers un chemin à l'intérieur du fichier, par exemple `ppt/slides/slide3.xml`, et ne mène nulle part.

Dans un tableau, une cellule fusionnée est supprimée plutôt que gardée vide, si bien que le reste de sa ligne se décale d'une colonne vers la gauche : un titre qui couvre deux colonnes se retrouve au-dessus de la première. Une colonne vide sur toutes les lignes est retirée.

## Un exemple

`hiring-plan.pptx` compte deux diapositives. « Where the gaps are » a trois puces définies sur la diapositive, dont la deuxième en retrait, un mot en gras et deux paragraphes de notes du présentateur. « Budget » contient un tableau de trois lignes et un graphique. Les deux portent un pied de page et un numéro.

  ```markdown
  # hiring-plan

  - Where the gaps are
  - Budget

  ---

  # Where the gaps are

  - Two backend engineers by September
    - One for search, one for payments
  - A designer shared with **Growth**

  > **Notes**
  >
  > We lost two people in June. **Search** is the hire that matters, because the index rebuild is blocked on it.
  >
  > Ask Finance about the designer before Thursday.

  ---

  # Budget

  | Role | Start | Cost |
  | --- | --- | --- |
  | Backend (search) | September | £78k |
  | Backend (payments) | October | £74k |
  ```

Le graphique, le pied de page et les numéros ont disparu ; les notes sont sous la diapositive qu'elles expliquent.

## Limites

Un fichier peut peser jusqu'à 50 Mo. Plusieurs présentations déposées ensemble se partagent ces 50 Mo et deviennent un seul document. Seul le `.pptx` est lu ; l'ancien format binaire `.ppt` est refusé.

Les puces sont lues sur la diapositive elle-même. Quand une diapositive les hérite de sa disposition, comme le fait en général la zone de contenu de la disposition « Titre et contenu » de PowerPoint, les points arrivent sous forme de paragraphes séparés, sans puces ni niveaux. Pour la même raison, le sous-titre d'une diapositive de titre peut apparaître comme une liste d'un seul élément.

Les images sont intégrées au Markdown, jusqu'à environ 750 Ko chacune et 1,5 Mo pour toute la présentation. Une image qui dépasse l'une de ces limites, ou dans un format qui ne peut pas être intégré, comme EMF, devient une ligne en italique, avec son texte alternatif s'il existe.

Les diapositives masquées sont converties elles aussi. Si vous êtes connecté, un document enregistré peut contenir jusqu'à 4 Mo de Markdown, images comprises.

## Questions

### Comment convertir un PowerPoint en Markdown ?

Déposez le `.pptx` sur cette page ou sélectionnez-le avec « Choisir des fichiers ». Le document s'affiche à l'écran, prêt à être copié ou téléchargé en fichier `.md` portant le nom de la présentation.

### Les notes du présentateur sont-elles reprises ?

Oui, après le contenu de chaque diapositive, sous forme de citation intitulée **Notes**. Un export PDF les perd le plus souvent. L'endroit où se cache le volet des notes est indiqué dans [comment ouvrir un fichier .pptx](/how-to/open-pptx).

### Peut-on convertir un ancien fichier .ppt ?

Non. Le `.ppt` est le format binaire d'avant 2007, et cette page ne lit que le `.pptx`, qui est une archive zip. Enregistrez la présentation au format `.pptx` dans le logiciel qui l'ouvre, puis convertissez ce fichier.

### Peut-on convertir du Markdown en PowerPoint ?

Non. Rien ici n'écrit de `.pptx` : un document se télécharge en Markdown, HTML, texte brut, Word, EPUB ou dans les formats de Confluence, Jira et Slack. Les méthodes comparées dans [convertir PowerPoint en Markdown](/blog/convert-powerpoint-to-markdown) partent toutes d'une présentation.

### La présentation est-elle envoyée sur un serveur ?

Non. Elle est décompressée et convertie dans votre navigateur, et le fichier ne quitte pas votre ordinateur. Rien de son contenu n'est envoyé, sauf si vous êtes connecté et cliquez sur Enregistrer, et c'est alors le Markdown qui est conservé, pas la présentation.
