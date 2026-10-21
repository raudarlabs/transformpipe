## Ce qui est conservé

Un `.odt` dit lui-même ce qu’est chacune de ses parties. Convertir un ODT en Markdown restitue donc la structure telle qu’elle a été écrite, sans rien avoir à deviner.

| Dans le fichier OpenDocument | Dans le Markdown |
| --- | --- |
| Les titres, et les styles de paragraphe qui en dérivent | `#` à `######`, les niveaux plus profonds en `######` |
| Gras, italique, barré sur des mots | `**bold**`, `*italic*`, `~~struck~~` |
| Listes à puces et numérotées | Listes en `-` et `1.`, deux espaces de retrait par niveau |
| Un tableau | Un tableau Markdown, sa première ligne non vide comme ligne d’en-tête |
| Des cellules fusionnées | Le texte une fois, puis des cellules vides, pour que les colonnes restent alignées |
| Notes de bas de page et notes de fin | `[^1]` dans le texte, les notes à la fin, dans une seule numérotation |
| Un lien hypertexte | Un lien vers la même adresse |
| Une image | Intégrée au document, avec son titre (et non sa description) comme texte de remplacement |
| Un saut de ligne (Maj+Entrée) | Une ligne qui se termine par une barre oblique inverse |

Chaque élément numéroté est écrit `1.` : une liste qui commençait à 5 commence donc à 1. Si le document ne s’ouvre pas sur un Titre 1, un titre est ajouté en haut : celui indiqué dans Fichier, Propriétés, ou à défaut le nom du fichier.

## Ce qui se perd

- **L’apparence.** Soulignement, exposant et indice, couleurs, polices et tailles. Le gras ou l’italique qui appartient au style du paragraphe entier, plutôt qu’à des mots à l’intérieur, se perd aussi.
- **Les styles qui ne sont pas des titres.** Titre, Sous-titre, Citations et Texte préformaté deviennent des paragraphes ordinaires.
- **Les en-têtes et pieds de page,** avec leurs numéros de page : seul le corps du document est lu.
- **Les cadres.** Le texte d’un cadre disparaît, sauf si le cadre est ancré à la page ; celui d’une zone de texte se mêle à la phrase qui l’entoure.

## Un exemple

Un `.odt` qui s’ouvre sur un Titre 1, suivi d’un paragraphe avec un mot en gras, un mot en italique, une note de bas de page et un lien, d’une liste imbriquée, d’un tableau et d’une photo pourvue d’un titre, devient ceci, le base64 de l’image raccourci :

```markdown
# Findings

The north gutter is **blocked** and two tiles are *cracked*.[^1] Prices are on the [supplier’s page](https://example.com/tiles).

- Clear the gutter
  - North side only
- Replace two tiles

| Job | Cost |
| --- | --- |
| Gutter | £80 |
| Tiles | £240 |

![The blocked north gutter](data:image/png;base64,iVBORw0KGgo…)

[^1]: Seen from the scaffold on 3 March.
```

Si `roof-survey.odt` avait commencé par une ligne au style Titre, cette ligne resterait un paragraphe ordinaire, placé sous `# roof-survey`.

## Limites

- Uniquement des `.odt`, jusqu’à 50 Mo ; ni `.ods`, ni `.odp`, ni `.fodt` à plat. Plusieurs fichiers déposés ensemble comptent ensemble et forment un seul document.
- Le fichier est lu dans votre navigateur, il n’est pas envoyé. Rien ne va vers un compte tant que vous n’êtes pas connecté et que vous n’appuyez pas sur Enregistrer, et un document enregistré ne peut dépasser 4 Mo.
- Les images voyagent à l’intérieur du Markdown, environ 1 Mo chacune une fois encodée et 2 Mo par fichier. Une image qui ne tient plus, ou qui est au format WMF ou EMF, garde son chemin à l’intérieur du `.odt` et arrive sous forme d’image cassée.
- **Les commentaires se mêlent au texte :** l’auteur, la date et le commentaire atterrissent au milieu de la phrase à laquelle ils étaient attachés. Supprimez-les avant de convertir.
- **Les modifications encore enregistrées** placent en tête du document le nom et la date de chaque modification, ainsi que chaque passage supprimé. Acceptez-les ou refusez-les toutes dans Writer au préalable.
- **Une table des matières** arrive sous la forme de son titre deux fois, puis de ses entrées en liens suivis du numéro de page.
- Les listes imbriquées sous un élément numéroté sortent de cet élément à l’affichage : deux espaces de retrait sous `1.` ne suffisent pas.
- Un `.odt` protégé par mot de passe ne peut pas être lu ; enregistrez-en une copie sans mot de passe.

## Questions

### Comment ouvrir un fichier .odt ?

LibreOffice Writer l’ouvre gratuitement sur tous les systèmes de bureau, et Word comme Google Docs l’ouvrent aussi. Pour le lire sans rien installer, déposez-le ici et lisez l’aperçu ; [comment ouvrir un fichier .odt](/how-to/open-odt) présente les autres possibilités.

### Comment convertir un ODT en Markdown ?

Déposez le `.odt` ici, vérifiez l’aperçu et appuyez sur Télécharger .md. Le fichier garde son nom, `notes.odt` devient donc `notes.md`, et Copier Markdown place plutôt le texte dans le presse-papiers.

### Les notes de bas de page sont-elles conservées ?

Oui, sous forme de notes Markdown, que l’aperçu affiche ici comme des notes numérotées. Tous les outils Markdown ne les affichent pas : [les notes de bas de page en Markdown](/blog/markdown-footnotes-support) indique lesquels le font.

### Pourquoi le nom de mon fichier apparaît-il en titre tout en haut ?

Le document ne commençait pas par un Titre 1, ou des modifications enregistrées le précédaient. Indiquez un titre dans Fichier, Propriétés, et c’est lui qui figurera en haut, ou commencez le document par un Titre 1, et rien ne sera ajouté.

### Peut-on convertir des fichiers .ods ou .odp ?

Non, uniquement des documents texte. Enregistrez un classeur en `.xlsx` dans LibreOffice Calc et utilisez « Excel vers un tableau Markdown », ou une présentation en `.pptx` dans Impress et utilisez « PowerPoint vers Markdown ».
