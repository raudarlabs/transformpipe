## Ce qui est conservé

Tout ce qui, dans `<body>`, a un équivalent en Markdown le reçoit. Un astérisque ou un tiret bas isolé dans le texte est échappé. Les entités sont décodées : `&copy;` arrive sous la forme ©, et `&lt;b&gt;` sous la forme d’une vraie balise `<b>`.

| Dans le HTML | Dans le Markdown |
| --- | --- |
| `<h1>` à `<h6>` | `#` à `######` |
| `<strong>`, `<em>`, `<del>` et leurs formes courtes | `**gras**`, `*italique*`, `~~barré~~` |
| `<a href>` | `[texte](adresse)`, ou `<adresse>` quand le texte est l’adresse elle-même |
| `<img>` | `![alt](src)`, le `src` tel qu’il est écrit |
| `<ul>`, `<ol>` | Des listes en `-` et `1.`, chaque niveau décalé de deux espaces |
| Une case à cocher dans un élément de `<ul>` | `- [x]` ou `- [ ]` |
| `<table>` | Un tableau, la première ligne servant d’en-tête |
| `<pre><code class="language-js">` | Un bloc de code délimité, marqué `js` |
| `<code>`, `<blockquote>`, `<hr>`, `<br>` | `` `code` ``, `>`, `---`, un saut de ligne |

Les tableaux sont remis au propre au passage : une colonne vide sur toutes les lignes disparaît, et les cellules ne sont pas complétées par des espaces. Une `<caption>` devient une ligne en gras au-dessus du tableau.

## Ce qui se perd

- **Le `<head>`** : titre, balises meta, feuilles de style et scripts, si bien qu’une page titrée seulement dans `<title>` arrive sans titre.
- **`<script>`, `<style>`, `<noscript>`, `<template>`, `<svg>` et `<iframe>`**, avec tout leur contenu : une vidéo ou une carte intégrée ne laisse aucune trace.
- **`<nav>` et `<footer>`**, contenu compris, où qu’ils se trouvent. `<header>` et `<aside>` sont conservés.
- **Les commentaires, et tous les `class`, `id` et `style`.** `<u>`, `<mark>`, `<sub>` et `<sup>` gardent leurs mots et perdent leur marque : `H<sub>2</sub>O` devient H2O.
- **Les images intégrées sous forme d’adresse `data:`**, texte alternatif compris : une page autonome, enregistrée en un seul fichier, perd donc ses images.

## Un exemple

Une page de version enregistrée :

```html
<!DOCTYPE html>
<html>
<head><title>Release 2.4</title><style>h1 { color: navy; }</style></head>
<body>
<nav><a href="/">Home</a> <a href="/blog">Blog</a></nav>
<h1>Release 2.4</h1>
<p>Adds <strong>offline mode</strong> and fixes the <em>sync</em> bug.
See <a href="https://example.com/changes">the changelog</a>.</p>
<ul>
  <li><input type="checkbox" checked> Update the docs</li>
  <li><input type="checkbox"> Tell support</li>
</ul>
<table>
  <tr><th>Platform</th><th>Status</th></tr>
  <tr><td>macOS</td><td>Shipped</td></tr>
  <tr><td>Windows</td><td><del>Beta</del> Shipped</td></tr>
</table>
<pre><code class="language-bash">npm install app@2.4</code></pre>
<footer>© 2026 Example Ltd</footer>
</body>
</html>
```

devient :

````markdown
# Release 2.4

Adds **offline mode** and fixes the *sync* bug. See [the changelog](https://example.com/changes).

- [x] Update the docs
- [ ] Tell support

| Platform | Status |
| --- | --- |
| macOS | Shipped |
| Windows | ~~Beta~~ Shipped |

```bash
npm install app@2.4
```
````

Le menu, le pied de page, la feuille de style et le titre ont disparu, et la ligne coupée au milieu du paragraphe est rejointe.

## Limites

- Des fichiers `.html`, `.htm` ou `.xhtml`, ou du code HTML collé, jusqu’à 10 Mo à la fois. Plusieurs fichiers comptent ensemble et forment un seul document, séparés par un `---`.
- Le fichier est converti dans votre navigateur, sans être envoyé. Il n’arrive dans votre compte que si vous êtes connecté et cliquez sur Enregistrer, et un document enregistré ne peut pas dépasser 4 Mo.
- Le fichier est lu en UTF-8, quoi qu’indique son `<meta charset>` : une page enregistrée en Windows-1252 affiche des caractères de remplacement au lieu de ses lettres accentuées.
- Il n’y a pas de détection de l’article : bandeaux de cookies et barres latérales passent aussi. [Convertir du HTML en Markdown](/blog/convert-html-to-markdown) montre comment les retirer avant la conversion.
- Un bloc de code exige un `<code>` seul dans son `<pre>`, sans aucun blanc autour, et son langage ne vient que d’une classe `language-…`. Un `<pre>` sans `<code>` devient du texte où rien n’est échappé et dont les sauts de ligne disparaissent à l’affichage.
- Les cellules fusionnées ne sont pas réparties : une cellule en `colspan` ou `rowspan` occupe une seule place et le reste de la ligne se décale vers la gauche. Les tableaux imbriqués sont aplatis, et un `<br>` dans une cellule colle ses mots les uns aux autres.
- Une liste placée dans un élément numéroté est décalée de deux espaces, moins que ce qu’exige CommonMark, et n’est donc plus imbriquée.

## Questions

### Peut-on convertir une page web en Markdown à partir de son URL ?

Non : cette page a besoin du fichier ou de son code source. Enregistrez la page au format HTML et déposez le fichier ici, ou utilisez l’extension de navigateur, qui convertit la page ouverte et commence par en repérer l’article.

### Existe-t-il une API pour convertir du HTML en Markdown ?

Oui. Envoyez le HTML comme corps de requête à `/api/v1/documents?kind=html-to-markdown`, avec une clé d’API créée depuis le menu de votre compte. Le même convertisseur tourne sur le serveur et enregistre un document ; `GET /api/v1/documents/:id` renvoie son Markdown.

```bash
curl -H "Authorization: Bearer tp_live_…" \
     --data-binary @page.html \
     "https://transformpipe.com/api/v1/documents?kind=html-to-markdown&name=page.md"
```

### Comment convertir du HTML en Markdown en Python ?

Il n’existe pas de paquet Python. Un script peut appeler l’API avec `requests` ; pour convertir dans Python même, [ce comparatif de bibliothèques](/blog/turndown-and-html-to-markdown-libraries) présente html2text et Pandoc.

### Un tableau HTML devient-il un tableau Markdown ?

Oui, avec sa première ligne en en-tête, car un tableau Markdown en exige un. Gras, italique, texte barré, liens et images survivent dans les cellules ; le code en ligne perd ses backticks.

### Pourquoi les images manquent-elles ?

Soit c’étaient des adresses `data:`, qui sont supprimées, soit elles se trouvent dans le dossier qu’un navigateur enregistre à côté de la page. Les chemins sont gardés tels quels : les images ne s’affichent que si ce dossier se trouve à côté du Markdown. [Comment ouvrir un fichier .html](/how-to/open-html) explique ce dossier.
