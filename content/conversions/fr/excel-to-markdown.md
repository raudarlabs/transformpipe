## Ce qui est conservé

Chaque feuille qui contient au moins une ligne remplie devient un tableau Markdown, dans l'ordre du classeur, feuilles masquées comprises. Un classeur qui n'a qu'une feuille de ce genre donne un seul tableau, sous un titre tiré du nom du fichier. À partir de deux, ce titre est suivi de la liste des noms de feuilles, puis chaque feuille suit sous son propre titre, séparée de la suivante par une ligne horizontale.

La première ligne de chaque feuille devient la ligne d'en-tête, et les lignes plus courtes sont complétées par des cellules vides.

| Dans le classeur | Dans le Markdown |
| --- | --- |
| Du texte | Le même texte, sans espaces au début ni à la fin |
| Un nombre | La valeur enregistrée : `1250`, et non `£1,250.00` |
| Une date | Une date ISO, par exemple `2026-07-14` |
| VRAI et FAUX | `true` et `false` |
| Une formule | Le résultat enregistré avec le fichier |
| Un retour à la ligne dans une cellule | `<br>` |
| Une barre verticale | Échappée, pour ne pas fermer la cellule |
| Une ligne vide entre deux lignes | Une ligne de cellules vides |

## Ce qui se perd

Tout ce qui n'est pas une valeur. Les formats de nombre d'abord : symboles monétaires, séparateurs de milliers, nombre de décimales choisi et pourcentages, si bien qu'une cellule affichant 10 % devient `0.1`. Une date accompagnée d'une heure ne garde que la date, et une heure seule devient la date `1899-12-30`. Les polices, couleurs, bordures, largeurs de colonnes, mises en forme conditionnelles, commentaires, graphiques et images ne sont pas lus.

Une cellule fusionnée garde sa valeur dans la première cellule, et les cellules qu'elle recouvrait arrivent vides. Un lien garde son texte et perd son adresse. Une formule qui aboutit à une erreur comme `#DIV/0!` donne une cellule vide.

Les astérisques et les tirets bas saisis dans une cellule ne sont pas échappés : `**brouillon**` dans une cellule s'affiche en gras une fois le Markdown rendu.

## Un exemple

`q3-budget.xlsx` compte trois feuilles. « Q3 budget » contient deux achats avec une date, un coût au format livre sterling et une colonne VRAI ou FAUX, un intitulé coupé sur deux lignes, et une ligne de total calculée par `=SUM(D2:D3)`. « Suppliers » a un nom qui contient une barre verticale et une remise au format pourcentage. La troisième feuille est vide.

  ```markdown
  # q3-budget

  - Q3 budget
  - Suppliers

  ---

  # Q3 budget

  | Item | Owner | Due | Cost | Approved |
  | --- | --- | --- | --- | --- |
  | Laptop stands | Priya | 2026-07-14 | 1250 | true |
  | Monitor arms<br>(pair) | Sam | 2026-08-01 | 480.5 | false |
  | Total |  |  | 1730.5 |  |

  ---

  # Suppliers

  | Supplier | Lead time | Discount |
  | --- | --- | --- |
  | Ergodesk \| UK | 5 days | 0.1 |
  | Northlight | 2 weeks |  |
  ```

La feuille vide, les symboles de la livre et le pourcentage ont disparu, et le total est la valeur qu'Excel avait enregistrée.

## Limites

Un fichier peut peser jusqu'à 50 Mo. Plusieurs classeurs déposés ensemble se partagent ces 50 Mo et deviennent un seul document.

La page n'accepte que le `.xlsx` : les fichiers `.xls`, `.xlsm` et `.ods` sont refusés, enregistrez donc d'abord une copie au format `.xlsx`. Un `.csv` déposé ici est confié au convertisseur CSV. Une feuille graphique, c'est-à-dire un graphique déplacé sur une feuille à part, fait pour l'instant échouer la conversion avec un message d'erreur : supprimez-la d'abord dans une copie. Un graphique placé sur une feuille de calcul ordinaire est simplement ignoré.

Un titre ou une ligne vide au-dessus des noms de colonnes devient l'en-tête, et des données qui commencent plus bas ou plus à droite conservent les lignes et colonnes vides qui les précèdent. Supprimez-les avant la conversion ; les lignes et colonnes vides situées après les données sont ignorées.

Si vous êtes connecté, un document enregistré peut contenir jusqu'à 4 Mo de Markdown. Pour ouvrir un `.xlsx` sans Excel, voyez [comment ouvrir un fichier .xlsx](/how-to/open-xlsx) ; ce que perdent l'export CSV ou le copier-coller est détaillé dans [Excel en tableau Markdown : toutes les méthodes](/blog/convert-excel-to-markdown-table).

## Questions

### Comment convertir un fichier Excel en Markdown ?

Déposez le `.xlsx` sur cette page ou sélectionnez-le avec « Choisir des fichiers ». Les tableaux s'affichent à l'écran, prêts à être copiés ou téléchargés en fichier `.md` portant le nom du classeur.

### Toutes les feuilles sont-elles converties, même les feuilles masquées ?

Oui, toutes celles qui ont une ligne remplie, dans l'ordre du classeur. Il n'est pas possible de choisir une seule feuille : si vous n'en voulez qu'une, supprimez les autres dans une copie du fichier.

### Les formules sont-elles conservées ?

Non, seulement leurs résultats : chaque cellule de formule donne la valeur qu'Excel a enregistrée lors de la dernière sauvegarde. Un classeur produit par un script qui n'a jamais calculé ses formules donne des cellules vides à leur place.

### Peut-on convertir un tableau Markdown en Excel ?

Non. Rien ici n'écrit de `.xlsx` ni de `.csv` : les téléchargements proposés sont le Markdown, le HTML, le texte brut, Word, EPUB et les formats de Confluence, Jira et Slack.

### Le classeur est-il envoyé sur un serveur ?

Non. Il est décompressé et converti dans votre navigateur, et le fichier ne quitte pas votre ordinateur. Rien de son contenu n'est envoyé, sauf si vous êtes connecté et cliquez sur Enregistrer, et c'est alors le Markdown qui est conservé, pas le classeur.
