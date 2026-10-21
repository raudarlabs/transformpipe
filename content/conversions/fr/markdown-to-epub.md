## Ce qui est conservé

Convertir Markdown en EPUB ici part de la page même que dessine l’aperçu, découpée en chapitres et empaquetée en EPUB 3.

| Dans le Markdown | Dans le livre |
| --- | --- |
| titres | des chapitres, coupés à `#` s’il apparaît au moins deux fois, sinon à `##` selon la même règle |
| `$…$`, `$$…$$` et blocs `mermaid` | formules en MathML ; diagrammes dessinés en SVG, en couleurs claires |
| blocs de code délimités dans un langage reconnu | police à chasse fixe, mots-clés en gras, commentaires en italique |
| tableaux, citations, encadrés du type `[!NOTE]` | tableaux filetés, citations avec un filet à gauche, encadrés avec un bord coloré et leur titre |
| `==marked==`, `- [ ]`, `- [x]` | un surlignage, ☐, ☑ |
| `[^1]` | une note numérotée en fin de livre, liée dans les deux sens |
| liens vers des titres, des adresses web et `mailto:` | des liens ; celui qui vise un titre retrouve le chapitre où ce titre a abouti |
| images incorporées en `data:` | des fichiers dans le livre : PNG, JPEG, GIF, WebP ou SVG |
| images situées à une adresse web | récupérées par votre navigateur et placées dans le livre, si le serveur l’autorise |

La table des matières liste chaque chapitre sous son premier titre, avec le niveau suivant en dessous quand il y a plusieurs chapitres, à la fois comme page de navigation EPUB 3 et comme `toc.ncx`, l’ancien format. Le titre du livre est le premier titre de niveau 1 à 3, ou à défaut le nom du fichier ; la langue est celle du site, donc `fr` sur cette page. Aucune police ni couleur de texte n’est imposée au texte courant : la police, la taille et le mode nuit de la liseuse s’appliquent.

## Ce qui se perd

- **L’en-tête YAML (front matter).** Le bloc en tête de fichier est supprimé ; ses `title:` et `author:` ne sont pas lus ([en savoir plus sur le front matter](/blog/front-matter-and-what-converters-do-with-it)).
- **Auteur et couverture.** Ni l’un ni l’autre n’est enregistré : le livre ne porte qu’un titre, une langue, une date et un identifiant, nouveau à chaque téléchargement.
- **Certaines images.** Une image sur votre disque, ou incorporée dans un autre format, devient sa description entre crochets, en italique ; une image à une adresse web que le navigateur ne peut pas récupérer, ou qu’un livre ne peut pas afficher, devient un lien sous cette description.
- **Les liens qui sortent du document.** Un lien vers un autre fichier, ou vers un titre inexistant, ne garde que ses mots. De même pour un wikilien.
- **La couleur.** La coloration syntaxique devient du gras et de l’italique, jamais de la couleur.
- **Le HTML brut.** Un bloc `<details>` est déplié, son résumé laissé en texte simple.

## Un exemple

```markdown
---
title: Field notes
author: J. Hale
---

# Field notes

A year of walks round the reservoir.

## Spring

Snowdrops by the north gate.[^1]

![North gate](https://example.com/gate.jpg)

## Summer

The path floods in June; take [the dry route](#spring) instead.

- [x] Boots
- [ ] Map

[^1]: Counted on 4 March.
```

Un `#` et deux `##` placent la coupe à `##`. Un titre seul ouvrirait le premier chapitre ; celui-ci est suivi d’un paragraphe, les deux forment donc un chapitre à part :

```text
mimetype
META-INF/container.xml
OEBPS/content.opf
OEBPS/toc.ncx
OEBPS/style.css
OEBPS/nav.xhtml
OEBPS/chapter-1.xhtml
OEBPS/chapter-2.xhtml
OEBPS/chapter-3.xhtml
```

La table des matières indique Field notes, Spring, Summer. On suppose ici que le serveur de l’image refuse le navigateur, si bien que le chapitre 2 la donne en lien sous la forme `[North gate]` ; sinon, elle figurerait dans le livre sous `OEBPS/images/picture-1.jpg`. Le chapitre 3 contient :

```html
<h2 id="doc-summer">Summer</h2>
<p>The path floods in June; take <a href="chapter-2.xhtml#doc-spring">the dry route</a> instead.</p>
<ul>
<li>☑ Boots</li>
<li>☐ Map</li>
</ul>
<hr class="md-fnrule" />
<ol class="md-footnotes">
<li id="doc-fn-1">Counted on 4 March. <a href="chapter-2.xhtml#doc-fnref-1" class="md-fnback">↩</a></li>
</ol>
```

## Limites

- Fichiers `.md`, `.markdown`, `.mdown` et `.mkd` jusqu’à 10 Mo, ou Markdown collé. Plusieurs fichiers déposés ensemble se partagent les 10 Mo et deviennent un seul livre, séparés par des filets.
- Le livre est fabriqué dans votre navigateur, et seulement là : il a besoin de l’analyseur HTML du navigateur, si bien que l’API ne produit pas d’EPUB. Rien ne part vers un compte tant que vous ne vous connectez pas et n’appuyez pas sur Enregistrer ; un document enregistré peut peser au plus 4 Mo.
- Les images situées à une adresse web sont demandées par votre navigateur, dix secondes au plus chacune.

## Questions

### Comment convertir Markdown en EPUB ?

Déposez le fichier .md ici ou collez le Markdown, vérifiez l’aperçu, puis appuyez sur Télécharger .epub. [Comment créer un EPUB à partir de Markdown](/how-to/make-epub) indique quelles liseuses l’ouvrent et comment le vérifier.

### Pourquoi mon livre n’a-t-il qu’un seul long chapitre ?

Les chapitres ne sont coupés qu’à `#` ou `##`, et seulement à un niveau utilisé au moins deux fois. Un document titré en `###` d’un bout à l’autre, ou qui n’a qu’un `#` et un `##`, reste un seul chapitre.

### Peut-on définir l’auteur, la couverture ou la langue ?

Pas ici. Le titre vient du premier titre et la langue du site : en français, le livre est marqué `fr`, en anglais `en`. Calibre permet d’ajouter ensuite l’auteur et la couverture qu’une boutique exigera.

### Le livre s’ouvre-t-il sur un Kindle ?

Send to Kindle accepte l’EPUB depuis 2022, et Apple Books, Google Play Livres et Kobo l’ouvrent directement. Formules et diagrammes voyagent en MathML et en SVG, que certaines liseuses à encre électronique plus anciennes n’affichent pas.
