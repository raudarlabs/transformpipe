## Ce qui est conservé

Chaque caractère et chaque ligne, avec une barre oblique inverse ou une entité ajoutée presque partout où Markdown lirait une mise en forme dans du texte brut :

| Dans le fichier | Dans le Markdown |
| --- | --- |
| `*`, `_`, `` ` ``, `[`, `]`, `~` n’importe où | `\*`, `\_`, `` \` ``, `\[`, `\]`, `\~` |
| Une barre oblique inverse, comme dans `C:\Users` | Deux : `C:\\Users` |
| `#` ou `>` en début de ligne | `\#`, `\>` |
| `-`, `+`, `1.` ou `1)` suivi d’une espace en début de ligne | `\-`, `\+`, `1\.`, `1\)` |
| `<` devant une lettre, `/`, `!` ou `?` | `&lt;` |
| `&` qui ouvre une entité, comme `&amp;` | `&amp;amp;` |

Chaque retour à la ligne reçoit une barre oblique inverse, le saut de ligne forcé et visible de CommonMark, car Markdown réunirait sinon les lignes. Plusieurs lignes vides d’affilée deviennent un seul changement de paragraphe, les fins de ligne Windows sont normalisées et l’indicateur d’ordre des octets (BOM) est retiré.

Tout le reste est recopié tel qu’il a été tapé, `AT&T` et `a < b` compris.

## Ce qui se perd

Aucun mot ne disparaît. Ce qui reste en route, c’est la structure que le texte ne fait que suggérer :

- **Les titres.** Un titre en majuscules reste une ligne ordinaire.
- **Les listes.** Une ligne qui commence par un tiret ou un nombre reste une simple ligne.
- **L’alignement.** Les espaces et tabulations de début de ligne restent dans le Markdown, mais l’affichage les réduit.

## Un exemple

Un fichier texte de notes de réunion :

```text
Standup notes, 14 October
Owner: priya_k

- deploy moved to *Thursday*
1. fix the login bug first
# of open tickets: 12
Wrap key names in <kbd> in the docs

> 3 failing tests, see C:\ci\log.txt
```

devient :

```markdown
Standup notes, 14 October\
Owner: priya\_k

\- deploy moved to \*Thursday\*\
1\. fix the login bug first\
\# of open tickets: 12\
Wrap key names in &lt;kbd> in the docs

\> 3 failing tests, see C:\\ci\\log.txt\
```

À l’affichage, il se lit ligne pour ligne comme le fichier, `<kbd>` compris ; seule la dernière barre oblique inverse est en trop. Lu comme du Markdown, le même fichier donnerait une puce, de l’italique, une liste numérotée, un titre et une citation.

## Limites

- Des fichiers `.txt`, ou du texte collé, jusqu’à 10 Mo à la fois. Plusieurs fichiers forment un seul document, séparés par un `---`.
- Le fichier est converti dans votre navigateur, sans être envoyé. Il n’arrive dans votre compte que si vous êtes connecté et cliquez sur Enregistrer, et un document enregistré ne peut pas dépasser 4 Mo.
- Le fichier est lu en UTF-8 : un texte enregistré en Windows-1252 affiche des caractères de remplacement à la place de ses lettres accentuées, et [Comment ouvrir un fichier .txt](/how-to/open-txt) explique comment le rouvrir dans le bon encodage.
- Un fichier qui se termine par un seul retour à la ligne, comme l’enregistrent la plupart des éditeurs, garde une barre oblique inverse après sa dernière ligne, et l’aperçu l’affiche : c’est celle qui termine l’exemple.
- `$`, `=` et `^` ne sont pas échappés : l’aperçu affiche donc `$x+1$` comme une formule, `==mot==` surligné et `x^2^` en exposant. Une somme entre crochets comme `[a+b]` devient elle aussi une formule, car les crochets échappés sont les délimiteurs de LaTeX.
- Une ligne isolée d’au moins trois tirets devient un trait de séparation, et une ligne de `=` ou de `-` qui termine un paragraphe en fait un titre. Un tableau tapé avec des barres verticales reste du texte.
- Un paragraphe indenté de quatre espaces ou d’une tabulation, sauf le premier, devient un bloc de code où les barres obliques inverses restent visibles.
- Une adresse web qui contient un tiret bas, ou qui termine une ligne, montre une barre oblique inverse de trop quand l’aperçu en fait un lien.

## Questions

### Pourquoi ne pas simplement renommer le .txt en .md ?

Si le fichier a été écrit en Markdown, oui : un `.md` va sur la page Markdown vers HTML, qui le prend tel quel. Sinon, le renommage transforme un tiret en puce et un astérisque en italique.

### Peut-on convertir du texte enrichi en Markdown ?

Pas avec ce convertisseur. Un `.txt` ne contient aucune mise en forme, et la zone de collage accepte du texte brut : le gras et les titres copiés depuis une page arrivent comme de simples mots. Un `.rtf` a son propre convertisseur, Texte enrichi vers Markdown ; une page web enregistrée relève de HTML vers Markdown.

### Transformera-t-il mes titres et mes listes en Markdown ?

Non. Il ne sait pas distinguer un titre d’une phrase courte, ni une puce d’un signe moins, et une mauvaise supposition changerait ce que dit le texte.

### Pourquoi y a-t-il des barres obliques inverses partout ?

Ce sont des caractères d’échappement, que l’affichage masque : `\*` apparaît comme un astérisque, et une barre oblique inverse en fin de ligne comme un saut de ligne. [Échapper les caractères en Markdown](/blog/markdown-escaping) détaille ce que chacune protège ; [Sauts de ligne et listes Markdown](/blog/markdown-line-breaks-and-lists) explique le saut de ligne.

### Peut-on convertir du texte en Markdown depuis un script ?

Oui, avec un compte : envoyez le texte comme corps de requête à `/api/v1/documents?kind=text-to-markdown`, avec une clé d’API créée depuis le menu de votre compte. Le même convertisseur tourne sur le serveur et enregistre un document.
