## Ce qui est conservé

Convertir Word en Markdown, c’est garder la structure du document et laisser sa mise en page : un `.docx` est lu pour ce qu’est chacune de ses parties, pas pour l’allure qu’elle a sur la page.

| Dans le fichier Word | Dans le Markdown |
| --- | --- |
| Titre 1 à Titre 6 | `#` à `######` |
| Gras, italique, barré | `**bold**`, `*italic*`, `~~struck~~` |
| Listes à puces et numérotées | Listes en `-` et `1.`, deux espaces de retrait par niveau |
| Cases à cocher cochées ou vides dans une liste | `- [x]` et `- [ ]` |
| Un tableau | Un tableau Markdown, sa première ligne comme ligne d’en-tête |
| Un lien hypertexte | Un lien vers la même adresse |
| Une image | Intégrée au document, avec son texte de remplacement |
| Notes de bas de page et notes de fin | Une liste numérotée à la fin, `[1]` dans le texte |
| Un saut de ligne (Maj+Entrée) | Une ligne qui se termine par deux espaces |
| Une zone de texte | Son texte, après le paragraphe auquel elle était ancrée |

`report.docx` devient `report.md`. Un astérisque ou un tiret bas tapé dans le texte est échappé par une barre oblique inverse, pour rester un caractère au lieu de devenir de l’emphase.

## Ce qui se perd

- **Les styles qui ne sont pas des titres.** Titre, Sous-titre, Citation, Titre 7 à 9 et vos propres styles deviennent des paragraphes ordinaires.
- **L’apparence.** Polices, tailles, couleurs, surlignage et soulignement. L’exposant et l’indice perdent leur position, si bien que H₂O arrive en H2O, et une police à chasse fixe ne fait pas du code.
- **Les commentaires,** sans aucune marque à l’endroit où ils se trouvaient.
- **L’habillage de la page.** En-têtes, pieds de page, numéros de page et sauts de page.
- **Les équations.** Tout ce qui vient de l’éditeur d’équations disparaît, et la phrase se referme autour.
- **Les cellules fusionnées.** Une cellule fusionnée est écrite une seule fois, et les cellules suivantes se décalent vers la gauche, dans l’espace qu’elle couvrait. Deux paragraphes dans une même cellule se collent l’un à l’autre, sans espace.
- **Des notes qui fonctionnent.** Les liens `[1]` et `↑` pointent vers des ancres que le Markdown ne contient pas ; ce ne sont pas des notes Markdown en `[^1]`.
- **Une table des matières qui fonctionne.** Ses entrées arrivent sous forme de liens suivis de leur numéro de page, vers des signets qui n’existent plus.

## Un exemple

Un `.docx` contenant une ligne au style Titre, un Titre 1, un paragraphe avec un mot en gras, un mot en italique, une note de bas de page et un lien, une liste imbriquée, un tableau et une photo devient ceci, le base64 de l’image raccourci :

```markdown
Roof survey

# Findings

The north gutter is **blocked** and two tiles are *cracked*.[\[1\]](#footnote-1) Prices are on the [supplier’s page](https://example.com/tiles).

- Clear the gutter
  - North side only
- Replace two tiles

| Job | Cost |
| --- | --- |
| Gutter | £80 |
| Tiles | £240 |

![The blocked north gutter](data:image/png;base64,iVBORw0KGgo…)

1. Seen from the scaffold on 3 March. [↑](#footnote-ref-1)
```

« Roof survey » reste un paragraphe ordinaire, parce que la ligne portait le style Titre.

## Limites

- Uniquement des `.docx`, jusqu’à 50 Mo. Plusieurs fichiers déposés ensemble comptent ensemble et forment un seul document, séparés par des filets.
- Le fichier est lu dans votre navigateur, il n’est pas envoyé. Rien ne va vers un compte tant que vous n’êtes pas connecté et que vous n’appuyez pas sur Enregistrer, et un document enregistré ne peut dépasser 4 Mo.
- Les images voyagent à l’intérieur du Markdown : environ 1 Mo chacune une fois encodée (un fichier d’environ 750 Ko) et 2 Mo au total pour chaque `.docx`. Une image qui ne tient plus est remplacée par son texte de remplacement en italique, ou par rien si elle n’en avait pas.
- Les listes imbriquées sous un élément numéroté sont décalées de deux espaces, ce qui ne suffit pas au Markdown : à l’affichage, les sous-éléments sortent de leur élément. Sous des puces, l’imbrication fonctionne.
- Un `.docx` protégé par mot de passe ne peut pas être lu ; retirez d’abord le mot de passe dans Word.

## Questions

### Comment convertir un document Word (.docx) en Markdown (.md) ?

Déposez le `.docx` ici, vérifiez l’aperçu et appuyez sur Télécharger .md. [Convertir un DOCX en Markdown](/blog/convert-docx-to-markdown) compare cette voie à Pandoc et à mammoth dans votre propre code.

### Peut-on convertir un ancien fichier .doc ?

Non, seulement des `.docx`. Enregistrez d’abord le `.doc` en `.docx` dans Word ou LibreOffice ; [comment ouvrir un fichier .docx](/how-to/open-docx) traite aussi du `.doc` qui arrive avec la mauvaise extension.

### Peut-on convertir un document Google Docs ?

Oui, en passant par le format de Word. Dans Google Docs, choisissez Fichier, Télécharger, Microsoft Word, puis déposez ce `.docx` ici.

### Pourquoi mon titre n’est-il pas devenu un titre Markdown ?

Le style Titre de Word n’est pas l’un des styles Titre 1 à Titre 6, les seuls qui deviennent des titres. Appliquez Titre 1 à la ligne avant de convertir, ou ajoutez `# ` devant après coup.

### Que deviennent les commentaires et les modifications suivies ?

Les commentaires disparaissent. Les modifications suivies sortent comme si vous les aviez toutes acceptées : le texte inséré reste et le texte supprimé a disparu, mais un texte déplacé pendant le suivi des modifications manque aux deux endroits. Acceptez ou refusez chaque modification dans Word avant la conversion.

### Quelle mise en forme vaut la peine d’être gardée ?

Moins qu’il n’y paraît. [Ce qu’il ne faut pas garder d’un .docx](/blog/what-not-to-keep-from-a-docx) passe en revue ce que le Markdown ne sait pas dire et les pertes qui comptent vraiment.
