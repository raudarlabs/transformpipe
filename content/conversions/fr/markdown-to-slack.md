## Ce qui est conservé

Le format de Slack s’appelle mrkdwn, et ce n’est pas du Markdown : un seul astérisque met en gras, un tiret bas en italique, un seul tilde barre le texte, un lien s’écrit `<address|words>`, et il n’a ni titres ni tableaux. Pour convertir du Markdown en mrkdwn Slack, le convertisseur écrit chaque élément sous la forme la plus proche qu’un message permette :

| Dans le Markdown | Dans le mrkdwn |
| --- | --- |
| `## Heading` | `*Heading*`, une ligne en gras à part |
| `**bold**`, `*italic*`, `~~struck~~` | `*bold*`, `_italic_`, `~struck~` |
| `[words](https://example.com)` | `<https://example.com\|words>` |
| `![chart](https://example.com/a.png)` | `<https://example.com/a.png\|chart>` |
| Des puces imbriquées | `•`, puis `◦`, puis `▪`, quatre espaces plus loin à chaque niveau |
| `3. item` | `3. item`, en comptant à partir du premier numéro du Markdown |
| Une liste de tâches | `☑` pour une tâche faite, `☐` pour une tâche ouverte |
| Un bloc de code délimité | un bloc de code, sans son langage |
| Un tableau | un bloc de code aux colonnes complétées par des espaces |
| Une citation | `>` au début de chaque ligne |
| Une alerte comme `> [!TIP]` | une citation précédée de `:bulb:` et du titre en gras |
| Une note de bas de page | `[1]`, les notes étant regroupées à la fin |

Une image avec une adresse web devient un lien vers elle, que Slack déplie pour afficher l’image. Le texte surligné passe en gras. Le gras au milieu d’un mot, comme dans `**un**believable`, reçoit une espace sans chasse à côté de l’astérisque pour que Slack le lise quand même. Les autres alertes commencent par leur propre émoji, comme `:warning:`.

Un tableau est complété dans chaque colonne jusqu’à la cellule la plus large, avec une ligne de `─` sous l’en-tête, et une colonne alignée à droite le reste.

`&`, `<` et `>` s’écrivent `&amp;`, `&lt;` et `&gt;`, les entités que demande l’API de Slack.

## Ce qui se perd

- **La mise en forme dans les titres, les textes de lien et les cellules de tableau.** Les mots restent, les signes disparaissent.
- **Les liens vers les titres du document** gardent leurs mots et perdent l’adresse, puisqu’un message n’a pas de titres vers lesquels sauter.
- **Le langage d’un bloc de code**, que les blocs de code de Slack ne prévoient pas.
- **Les indices et les exposants** : `H~2~O` arrive sous la forme H2O.
- **Les images sans adresse web** deviennent `_[description]_`, ou `_[picture]_` sans description ; voir [des images et des liens qui fonctionnent encore](/blog/images-and-links-that-still-work).
- **Le front matter** est supprimé, les **wikiliens** gardent leurs mots, et **le HTML brut** ne garde que son texte.
- **Les diagrammes et les formules** arrivent sous forme de source, en police de code.

## Un exemple

Une note de version rédigée en Markdown :

```markdown
## Release 4.2

Exports are **twice as fast**. Details in the [changelog](https://example.com/changes).

- Word export
  - tables keep their widths
- [ ] Update the docs

| Plan | Price |
| :--- | ---: |
| Team | 8 |
| Business | 15 |

> [!TIP]
> Restart the app to pick it up.
```

Le mrkdwn obtenu :

````text
*Release 4.2*

Exports are *twice as fast*. Details in the <https://example.com/changes|changelog>.

• Word export
    ◦ tables keep their widths
☐ Update the docs

```
Plan      Price
────────  ─────
Team          8
Business     15
```

> :bulb: *Tip*
> Restart the app to pick it up.
````

## Limites

- Fichiers `.md`, `.markdown`, `.mdown` et `.mkd` jusqu’à 10 Mo, ou du Markdown collé dans la page. Plusieurs fichiers déposés ensemble forment un seul document, et les 10 Mo valent pour l’ensemble.
- La conversion se fait dans votre navigateur. Rien n’est envoyé, sauf si vous êtes connecté et cliquez sur Enregistrer ; un compte conserve des documents jusqu’à 4 Mo.
- Le téléchargement est un fichier texte, `<name>.slack.txt`.
- Le résultat est du texte mrkdwn, pas du JSON Block Kit.

## Questions

### Slack prend-il en charge le Markdown ?

Pas dans le `text` d’un message, que Slack lit comme du mrkdwn : des signes simples, des liens entre chevrons, sans titres ni tableaux. Du Markdown envoyé là par l’API ou par un webhook arrive donc avec des astérisques doublés, des dièses en début de ligne et un tableau dessiné avec des barres verticales.

### Comment coller du Markdown dans Slack sans perdre la mise en forme ?

Convertissez-le ici, puis cliquez sur « Copier pour Slack ». Le presse-papiers reçoit alors le mrkdwn en texte brut et le document rendu en HTML, et le champ de message de Slack prend la version mise en forme. Plus de détails dans [le guide pour coller](/how-to/paste-markdown).

### Un message Slack peut-il afficher un tableau ?

Pas en mrkdwn, qui n’en a pas. Le tableau est écrit comme un bloc de code aux colonnes complétées, qui s’aligne parce qu’un bloc de code utilise une police à chasse fixe. La mise en forme des cellules est abandonnée, car un bloc de code afficherait les astérisques au lieu de les interpréter.

### Pourquoi le résultat contient-il `&amp;` au lieu de `&` ?

Slack traite `&`, `<` et `>` comme des caractères de contrôle, et son API attend qu’ils soient écrits sous forme d’entités. Un message envoyé par l’API ou par un webhook les affiche comme les caractères eux-mêmes.

### Produit-il du JSON Block Kit ?

Non. Il écrit le texte mrkdwn, qui se place dans le champ `text` d’un appel à `chat.postMessage` ou d’un webhook entrant, ou dans un bloc de section. Le JSON autour reste à écrire de votre côté.
