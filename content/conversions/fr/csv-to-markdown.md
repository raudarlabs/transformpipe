## Ce qui est conservé

La première ligne du fichier devient l’en-tête du tableau, et chaque ligne suivante une ligne du tableau. Le nom du fichier, sans son extension, est placé au-dessus comme titre : `orders.csv` s’ouvre sous la forme `# orders`.

Un `.tsv` est toujours découpé sur les tabulations. Pour tout autre fichier, le séparateur retenu est celui qui revient le plus souvent sur la première ligne, hors guillemets, parmi la virgule, la tabulation, le point-virgule et la barre verticale ; à défaut, c’est la virgule. Un export d’une version française d’Excel, séparé par des points-virgules, ne demande donc aucun réglage, et une virgule décimale comme dans `3,50` reste dans sa cellule.

Les guillemets suivent la RFC 4180 :

| Dans le fichier | Dans le Markdown |
| --- | --- |
| Une virgule dans un champ entre guillemets | Reste dans la cellule |
| Un guillemet doublé dans un tel champ | Un seul guillemet |
| Un retour à la ligne dans un tel champ | `<br>`, car une ligne de tableau ne peut pas s’étendre sur deux lignes |
| Une barre verticale dans une valeur | Échappée par une barre oblique inverse, pour ne pas fermer la cellule |
| Une barre oblique inverse dans une valeur | Doublée, pour être affichée et non lue comme un échappement |
| Lignes vides, indicateur d’ordre des octets (BOM) | Supprimés |

Les valeurs restent du texte, telles qu’elles sont écrites : `42.50` garde son zéro final et `007` ses zéros initiaux. Seuls les espaces au début et à la fin d’une cellule sont retirés.

## Ce qui ne passe pas

- **L’alignement.** Chaque colonne reçoit un simple `---`, si bien que les nombres ne sont pas alignés à droite. Pour cela, remplacez à la main le `---` de la colonne par `---:`.
- **L’échappement au-delà des barres verticales.** Les astérisques, les tirets bas et les accents graves d’une valeur sont laissés tels quels : une cellule contenant `*urgent*` s’affiche donc en italique.
- **Tout ce qu’ajoute un tableur.** Un CSV ne contient que des valeurs, sans formules, sans couleurs, sans deuxième feuille. Pour un classeur, déposez directement le `.xlsx` sur cette page : c’est alors le convertisseur Excel qui le lit.

## Un exemple

Un export de commandes avec une virgule, un retour à la ligne et des guillemets doublés dans des champs entre guillemets, ainsi qu’une barre verticale dans un champ sans guillemets :

```csv
id,customer,note,total
1001,"Smith, Jane","Leave at the door
Ring twice",42.50
1002,"Acme ""North"" Ltd",,19.99
1003,Brown | Co,*urgent*,7.00
```

Enregistré sous `orders.csv`, il devient un titre `# orders` suivi de ce tableau :

```markdown
| id | customer | note | total |
| --- | --- | --- | --- |
| 1001 | Smith, Jane | Leave at the door<br>Ring twice | 42.50 |
| 1002 | Acme "North" Ltd |  | 19.99 |
| 1003 | Brown \| Co | *urgent* | 7.00 |
```

## Limites

- Un fichier peut peser jusqu’à 10 Mo. Plusieurs fichiers déposés ensemble sont comptés ensemble dans cette limite et deviennent un seul document, chaque tableau sous son propre titre.
- Le fichier est converti dans votre navigateur et n’est pas téléversé. Si vous êtes connecté, le tableau n’arrive dans votre compte que lorsque vous cliquez sur « Enregistrer », et un document enregistré ne peut pas dépasser 4 Mo.
- Les lignes plus courtes sont complétées par des cellules vides. Une ligne plus longue que l’en-tête, souvent à cause d’une virgule de trop en fin de ligne, ajoute une colonne à l’en-tête vide.
- Un fichier vide est refusé avec le message « Ce fichier ne contient aucune ligne. »

## Questions

### Comment convertir un CSV en tableau Markdown ?

Déposez le fichier ou collez son texte : des cellules copiées depuis un tableur arrivent séparées par des tabulations, et ces tabulations sont reconnues. Le bouton principal télécharge un fichier `.md`, et le menu situé à côté propose HTML, Word et texte brut. [Convertir un CSV en tableau Markdown sans casser les données](/blog/convert-csv-to-markdown-table) passe en revue les fichiers qui posent le plus souvent problème.

### À quoi ressemble un tableau Markdown ?

Une ligne d’en-tête, une ligne de séparation faite de tirets, puis une ligne par enregistrement, avec des barres verticales entre les cellules. Les tableaux viennent de GitHub Flavored Markdown et non du cœur de CommonMark : un moteur de rendu strictement conforme à CommonMark affiche donc les barres comme du texte. [Des tableaux Markdown qui survivent à la conversion](/blog/markdown-tables-that-survive-conversion) recense toutes les façons d’en casser un.

### Les points-virgules, les tabulations et les virgules entre guillemets sont-ils gérés ?

Oui. Le séparateur est détecté sur la première ligne, un `.tsv` est toujours lu comme séparé par des tabulations, et tout ce qui se trouve dans un champ entre guillemets reste dans sa cellule.

### Mon fichier n’a pas de ligne d’en-tête. Que se passe-t-il ?

La première ligne sert toujours d’en-tête, et aucun réglage ne permet de changer cela. Ajoutez en haut une ligne de noms de colonnes avant de convertir, faute de quoi le premier enregistrement se retrouvera dans l’en-tête.

### Pourquoi les lettres accentuées s’affichent-elles mal ?

Le fichier est lu en UTF-8 : un CSV enregistré dans un encodage plus ancien, comme Windows-1252, perd donc ses lettres accentuées. Enregistrez-le de nouveau en UTF-8, ce qu’Excel propose sous le nom « CSV UTF-8 ». [Comment ouvrir un fichier .csv](/how-to/open-csv) traite les autres problèmes d’import.

### Peut-on reconvertir un tableau Markdown en CSV ?

Non. Les téléchargements proposés sont Markdown, HTML, Word, texte brut, EPUB et des formats pour Confluence, Jira et Slack ; le CSV n’en fait pas partie.
