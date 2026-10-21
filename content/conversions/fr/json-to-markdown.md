## Ce qui est conservé

Le JSON ne connaît ni titres ni paragraphes : le convertisseur décide donc selon la forme des données. Le nom du fichier, sans son extension, devient le titre du document : `users.json` s’ouvre sous la forme `# users`.

| Dans le fichier | Dans le Markdown |
| --- | --- |
| Un tableau d’objets dont toutes les valeurs sont simples | Un tableau Markdown, une ligne par objet, les clés en colonnes |
| Un tableau de valeurs simples | Une liste à puces |
| Un objet | Ses champs simples en libellés gras (`**Status:** shipped`), puis un titre par champ imbriqué (`## Customer`) |
| Un tableau d’éléments mélangés ou imbriqués | Une section numérotée par élément : `## 1`, `## 2` |
| Un objet ou une liste mélangée à trois niveaux sous le titre du document | Un bloc de code `json` délimité, indenté proprement |
| `null` | `_null_`, écrit plutôt qu’omis |
| Un tableau ou un objet vide | `_Empty list._` ou `_Empty object._` |

Les colonnes sont recueillies dans tous les enregistrements, dans l’ordre où elles apparaissent pour la première fois : un champ que seul le dixième enregistrement possède obtient malgré tout sa colonne, et les autres y reçoivent une cellule vide. Les clés deviennent des mots : les tirets bas et les traits d’union deviennent des espaces, le camelCase est séparé et la première lettre passe en majuscule, si bien que `first_name` se lit « First name » et `lastLogin` « Last Login ».

## Ce qui ne passe pas

- **Les clés telles qu’elles sont écrites.** Hors d’un bloc de code, seule la forme reformulée apparaît.
- **L’écriture des nombres.** Les nombres sont lus comme des nombres : `42.50` devient `42.5`, `1e3` devient `1000`, et un entier de plus de 15 chiffres environ peut perdre ses derniers chiffres. Les valeurs entre guillemets restent intactes : `"007"` reste `007`.
- **Le tableau, dès qu’un enregistrement est imbriqué.** Il suffit qu’un seul enregistrement contienne une liste, même vide, pour que tout le tableau devienne des sections numérotées. Rien n’est aplati en noms de colonnes à points.
- **L’échappement.** Les chaînes sont écrites telles quelles : des astérisques ou des tirets bas dans une valeur sont donc lus comme du Markdown. Dans un tableau, une barre verticale est échappée et un retour à la ligne devient `<br>`.

## Un exemple

Une liste d’utilisateurs renvoyée par une API, enregistrée sous `users.json` :

```json
[
  { "id": 1, "first_name": "Ana", "isActive": true, "lastLogin": "2026-10-01" },
  { "id": 2, "first_name": "Ben", "isActive": false, "lastLogin": null },
  { "id": 3, "first_name": "Chloé", "isActive": true, "team": "Docs | Web" }
]
```

Elle devient un titre `# users` suivi de ce tableau :

```markdown
| Id | First name | Is Active | Last Login | Team |
| --- | --- | --- | --- | --- |
| 1 | Ana | true | 2026-10-01 |  |
| 2 | Ben | false | _null_ |  |
| 3 | Chloé | true |  | Docs \| Web |
```

## Limites

- Un fichier peut peser jusqu’à 10 Mo, et la page n’accepte que le `.json` : un fichier `.jsonl` ou `.ndjson` doit donc d’abord être renommé. Vous pouvez aussi coller le texte.
- Le fichier est converti dans votre navigateur et n’est pas téléversé. Si vous êtes connecté, le document n’arrive dans votre compte que lorsque vous cliquez sur « Enregistrer », et un document enregistré ne peut pas dépasser 4 Mo.
- Le JSON doit être strictement valide. Un fichier illisible est refusé avec « That is not valid JSON », suivi du message du navigateur, qui indique généralement la position de l’erreur.

## Questions

### Comment convertir du JSON en tableau Markdown ?

Un tableau d’objets dont toutes les valeurs sont des chaînes, des nombres, des booléens ou `null` devient un seul tableau Markdown. Aplatissez d’abord les enregistrements imbriqués, avec `jq` par exemple, ou acceptez des sections à la place. [JSON vers tableau Markdown](/blog/convert-json-to-markdown-table) détaille ce qui passe proprement et ce qui ne passe pas.

### Que devient un JSON imbriqué ?

Chaque champ imbriqué reçoit un titre, jusqu’à trois niveaux sous le titre du document. À ce niveau, un objet ou une liste mélangée devient un bloc de code `json`, tandis qu’un tableau ou une liste simple est toujours rendu normalement.

### Peut-on convertir du JSON en Markdown avec Python ?

Il n’existe pas de paquet Python : la page convertit dans le navigateur. Avec un compte, l’API exécute le même code : envoyez le fichier à `POST /api/v1/documents?kind=json-to-markdown&name=users.json` avec une clé d’API, depuis `requests` ou n’importe quel client HTTP, et le résultat est enregistré dans votre compte, sous le titre `# users`.

### Le format JSON Lines est-il pris en charge ?

Oui, dès lors que le fichier se termine par `.json`. Si le fichier entier ne peut pas être lu, chaque ligne non vide est lue comme une valeur à part, si bien qu’un journal d’un objet plat par ligne devient un tableau. Si une ligne échoue, c’est l’erreur de la première tentative qui est signalée.

### Pourquoi mon fichier est-il refusé comme JSON non valide ?

Les causes habituelles sont une virgule après le dernier élément, des apostrophes à la place des guillemets doubles, et des commentaires, que le JSON n’autorise pas. [Comment ouvrir un fichier .json](/how-to/open-json) explique comment retrouver l’erreur à partir de la position indiquée dans le message.

### Peut-on reconvertir du Markdown en JSON ?

Non. Les téléchargements proposés sont Markdown, HTML, Word, texte brut, EPUB et des formats pour Confluence, Jira et Slack ; le JSON n’en fait pas partie.
