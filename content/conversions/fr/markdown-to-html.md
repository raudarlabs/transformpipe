## Ce qui est conservé

Le Markdown est lu comme du GitHub Flavored Markdown, complété par les extensions courantes dans les notes et la documentation :

| Dans le Markdown | Dans le HTML |
| --- | --- |
| Titres | `<h1>` à `<h6>`, chacun avec un identifiant comme `doc-setup` |
| Un lien vers `#setup` | Dirigé vers ce titre, qu’il soit écrit à la manière de GitHub ou d’Obsidian |
| Listes de tâches, tableaux | Des cases qu’on ne peut pas cocher ; des tableaux qui défilent sur un écran étroit |
| Blocs de code délimités | Coloration syntaxique pour Python, JavaScript, SQL, Bash, YAML et une vingtaine d’autres langages |
| Un bloc `mermaid` | Le diagramme, dessiné en SVG dans le fichier téléchargé |
| Formules `$…$`, notes de bas de page | MathML ; notes numérotées et regroupées à la fin |
| `> [!NOTE]`, `==mark==`, `H~2~O` | Un encadré d’avertissement, `<mark>`, `<sub>` |

« Télécharger .html » enregistre un seul fichier : le document avec sa feuille de style intégrée, sans script ni police web, dans la palette claire ou sombre qu’affiche l’application, et en clair à l’impression. Une ligne en pied de page indique le nom du document, l’heure de la conversion et un lien vers TransformPipe. Le menu à côté du bouton propose aussi Markdown, Markdown pour Obsidian, texte brut, Word, EPUB, Confluence, Jira, Slack et un PDF via la boîte de dialogue d’impression.

## Ce qui se perd

- **Le front matter.** Un bloc YAML placé entre deux lignes `---` en tête du fichier est supprimé.
- **Les wikiliens.** `[[Install guide]]` devient les mots « Install guide », et `![[diagram.png]]` le nom du fichier en italique.
- **Le HTML hors liste autorisée.** `<script>`, `<style>` et `<iframe>` disparaissent avec leur contenu, les attributs `style` et `onclick` sont retirés, et une balise comme `<details>` est supprimée tandis que son texte reste.
- **Les retours à la ligne simples.** Un saut de ligne à l’intérieur d’un paragraphe devient une espace, comme sur GitHub. Pour obtenir un `<br>`, terminez la ligne par deux espaces ou par une barre oblique inverse.
- **Les images en tant que fichiers.** Une image reste une balise `<img>` qui pointe vers son adresse. Un chemin relatif comme `img/chart.png` ne s’affiche que si ce dossier se trouve à côté du fichier téléchargé, car seul le `.md` parvient au convertisseur.

## Un exemple

L’entrée :

```markdown
---
title: Release notes
---

# Release 2.4

Read the [setup notes][setup] first.

- [x] Faster export
- [ ] Print in dark mode

| Format | Size |
| --- | ---: |
| HTML | 48 KB |

## Setup

Run `npm ci`.[^1]

[setup]: #setup
[^1]: Node 20 or later.
```

Dans la balise `<article>` du fichier téléchargé :

```html
<h1 id="doc-release-24">Release 2.4</h1>
<p>Read the <a href="#doc-setup">setup notes</a> first.</p>
<ul>
<li><input checked="" disabled="" type="checkbox"> Faster export</li>
<li><input disabled="" type="checkbox"> Print in dark mode</li>
</ul>
<div class="md-table"><table>
<thead>
<tr>
<th>Format</th>
<th align="right">Size</th>
</tr>
</thead>
<tbody><tr>
<td>HTML</td>
<td align="right">48 KB</td>
</tr>
</tbody></table>
</div>
<h2 id="doc-setup">Setup</h2>
<p>Run <code>npm ci</code>.<sup class="md-fnref" id="doc-fnref-1"><a href="#doc-fn-1">1</a></sup></p>
<hr class="md-fnrule">
<ol class="md-footnotes">
<li id="doc-fn-1">Node 20 or later. <a href="#doc-fnref-1" class="md-fnback">↩</a></li>
</ol>
```

Le front matter a disparu, le lien atteint l’identifiant réel du titre, et la note de bas de page est passée à la fin.

## Limites

- **10 Mo par conversion**, comptés sur l’ensemble des fichiers déposés en même temps. Plusieurs fichiers forment un seul document, séparés par une ligne horizontale.
- **.md, .markdown, .mdown et .mkd**, ou du Markdown collé sous forme de texte. Un `.txt` part plutôt vers le convertisseur de texte brut.
- **Tout se passe dans votre navigateur**, la conversion comme le téléchargement. Si vous n’êtes pas connecté, le fichier n’est pas envoyé ; une fois connecté, le document n’atteint votre compte que lorsque vous cliquez sur Enregistrer, dans la limite de 4 Mo.
- **Un diagramme doit être valide.** Un bloc Mermaid qui contient une erreur reste affiché sous forme de code source.
- **Une seule feuille de style.** Aucun réglage ne permet d’ajouter votre propre CSS ou un modèle.

## Questions

### Comment convertir Markdown en HTML ?

Déposez un fichier `.md` sur cette page, ou collez le Markdown sous forme de texte. L’aperçu montre la page, et « Télécharger .html » l’enregistre sous le même nom. Aucun compte n’est nécessaire. Pour simplement lire un fichier, [Comment ouvrir un fichier .md](/how-to/open-md) indique les logiciels qui le font.

### Le fichier HTML est-il autonome ?

Oui, à l’exception des images liées par une adresse. La feuille de style est dans le fichier, rien n’est chargé pour les polices ou les scripts, et diagrammes et formules y sont dessinés : il s’ouvre de la même façon depuis un e-mail ou depuis un disque sans réseau. [HTML autonome expliqué](/blog/self-contained-html-explained) va plus loin.

### Peut-on copier le HTML plutôt que le télécharger ?

Oui. L’onglet « Source HTML » montre le fichier entier, les diagrammes restant sous forme de source Mermaid, et « Copier HTML » le place tel quel dans le presse-papiers. Pour un fragment à coller dans un CMS, prenez ce qui se trouve à l’intérieur de `<article>`.

### Le GitHub Flavored Markdown est-il pris en charge ?

Oui : tableaux, listes de tâches, `~~texte barré~~`, blocs de code délimités et liens nus sont lus comme GitHub les lit, avec en plus les notes de bas de page, les encadrés, les formules et Mermaid.

### Mon Markdown est-il envoyé sur un serveur ?

Non. Il est converti dans votre navigateur et conservé dans le stockage de ce navigateur ; il n’atteint un serveur que si vous vous connectez et cliquez sur Enregistrer. [Convertir du Markdown en HTML en ligne, sans rien installer](/blog/convert-markdown-to-html-online) montre comment le vérifier pour n’importe quel convertisseur.

### Puis-je utiliser mon propre CSS ?

Non. Le fichier contient la feuille de style du document. C’est du HTML ordinaire, et le bloc `<style>` peut donc être remplacé après coup.
