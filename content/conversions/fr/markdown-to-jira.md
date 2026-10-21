## Ce qui est conservé

Le balisage wiki de Jira ressemble à du Markdown, mais il se lit autrement : un seul astérisque met en gras, un trait d’union barre le texte, une liste est une suite de `*` ou de `#`, et un retour à la ligne dans un paragraphe reste un saut de ligne. Pour convertir du Markdown en balisage Jira, le convertisseur réécrit chaque élément sous la forme que Jira comprend :

| Dans le Markdown | Dans le balisage Jira |
| --- | --- |
| `## Heading` | `h2. Heading` |
| `**bold**`, `*italic*`, `~~struck~~` | `*bold*`, `_italic_`, `-struck-` |
| `[words](https://example.com)` | `[words\|https://example.com]` |
| `![chart](https://example.com/a.png)` | `!https://example.com/a.png\|alt=chart!` |
| Un bloc de code dans un langage que Jira connaît | `{code:python}` |
| Tout autre bloc de code | `{noformat}` |
| Un tableau | `\|\|head\|\|` et `\|cell\|` |
| Une citation | `{quote}` |
| Une alerte comme `> [!WARNING]` | `{panel}` dans la couleur qu’Atlassian lui donne |
| Une liste de tâches | `(/)` pour une tâche faite, `☐` pour une tâche ouverte |

Les listes imbriquées répètent le marqueur : une puce sous un élément numéroté devient `#*`. Les lignes coupées à l’intérieur d’un paragraphe sont rejointes, pour que Jira ne les sépare pas là où votre éditeur les avait renvoyées à la ligne. Un lien vers un titre du document fonctionne toujours, grâce à un `{anchor}` placé au début de ce titre, et les notes de bas de page deviennent des numéros en exposant.

Les crochets, les accolades et les barres verticales sont toujours échappés par une barre oblique inverse, car chacun ouvre un lien, une macro ou une cellule. Un signe comme `*` ou `-` n’est échappé qu’en bord de mot, là où Jira l’interpréterait : `e-mail` reste tel quel, `-flag` devient `\-flag`. Les émoticônes comme `(i)` sont échappées pour rester du texte, et le gras au milieu d’un mot prend la forme entre accolades, `{*}un{*}believable`. Les règles propres au Markdown sont dans [la référence sur l’échappement](/blog/markdown-escaping).

## Ce qui se perd

- **Le front matter** en tête d’une note est supprimé, et les **wikiliens** ne gardent que leurs mots.
- **Les images sans adresse web**, avec un chemin relatif ou intégrées au fichier, deviennent leur description en italique, `_\[diagram\]_`, ou disparaissent si elles n’en ont pas, car Jira ne peut pas les charger ; voir [des images et des liens qui fonctionnent encore](/blog/images-and-links-that-still-work).
- **Le HTML brut** garde son texte et perd ses balises et ses commentaires.
- **Une citation dans une citation** se fond dans la première, car `{quote}` ne s’imbrique pas.
- **L’alignement des colonnes** des tableaux.
- **Les diagrammes et les formules** arrivent sous forme de source, dans `{noformat}` ou `{{ }}`.

## Un exemple

Un rapport de bug rédigé en Markdown :

````markdown
## Steps to reproduce

1. Open **Billing** and pick a plan
2. Run `sync --force`, then check the [log](https://example.com/log)

> [!WARNING]
> The retry deletes the draft invoice.

| Field | Before | After |
| --- | --- | --- |
| Status | *open* | ~~paid~~ |

```ts
await retry(invoice);
```

- [x] Reproduced on staging
- [ ] Fixed
````

Le balisage Jira obtenu :

```text
h2. Steps to reproduce

# Open *Billing* and pick a plan
# Run {{sync \-\-force}}, then check the [log|https://example.com/log]

{panel:title=Warning|bgColor=#FFFAE6}
The retry deletes the draft invoice.
{panel}

||Field||Before||After||
|Status|_open_|-paid-|

{code:javascript}
await retry(invoice);
{code}

* (/) Reproduced on staging
* ☐ Fixed
```

Les traits d’union dans `{{ }}` sont échappés parce que Jira y lit encore les signes de mise en forme ; TypeScript devient `javascript`, le langage le plus proche que connaisse la macro `{code}`.

## Limites

- Fichiers `.md`, `.markdown`, `.mdown` et `.mkd` jusqu’à 10 Mo, ou du Markdown collé dans la page. Plusieurs fichiers déposés ensemble forment un seul document, et les 10 Mo valent pour l’ensemble.
- La conversion se fait dans votre navigateur. Rien n’est envoyé, sauf si vous êtes connecté et cliquez sur Enregistrer ; un compte conserve des documents jusqu’à 4 Mo.
- Le téléchargement est un fichier texte, `<name>.jira.txt`.
- Une liste numérotée commence à 1 dans Jira, quel que soit le premier numéro du Markdown. Un bloc de code ou un tableau placé dans un élément de liste est écrit après la ligne de cet élément, et la numérotation repart de 1 en dessous.

## Questions

### Jira prend-il en charge le Markdown ?

En partie. L’éditeur de Jira Cloud met en forme le Markdown pendant la saisie, mais le mode texte de Jira Data Center, la version 2 de l’API REST et les règles d’automatisation lisent du balisage wiki, et du Markdown collé tel quel y met en valeur les mauvais mots.

### Comment coller du Markdown dans Jira Cloud sans perdre la mise en forme ?

Convertissez-le ici, puis cliquez sur « Copier pour Jira ». Le presse-papiers reçoit alors le balisage wiki en texte brut et le document rendu en HTML, et l’éditeur de Jira Cloud prend la version mise en forme. Plus de détails dans [le guide pour coller](/how-to/paste-markdown).

### Peut-on convertir le balisage Jira en Markdown ?

Non. La conversion va dans un seul sens, du Markdown vers le balisage wiki.

### Pourquoi mon bloc de code est-il sorti en {noformat} ?

Le bloc n’avait pas de langage, ou un langage que la macro `{code}` ne connaît pas. Un bloc `{code}` sans langage est coloré comme du Java, si bien que `{noformat}` l’affiche plutôt tel quel. Les abréviations comme `sh` et `yml` sont ramenées à `bash` et `yaml`.

### Produit-il le JSON de la version 3 de l’API REST ?

Non. La version 3 de l’API REST de Jira Cloud attend l’Atlassian Document Format, que cet outil n’écrit pas ; c’est la version 2 qui accepte le balisage wiki.

### Est-ce le format qu’utilise Confluence ?

Non. Confluence enregistre une page dans son format de stockage, du XHTML avec ses propres macros, et c’est ce format qu’écrit le convertisseur Markdown vers Confluence.
