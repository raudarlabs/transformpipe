## Ce qui est conservé

Pour convertir du Markdown vers Confluence, le texte est écrit au format de stockage Confluence, le XHTML dans lequel une page est enregistrée, et affiché dans l’onglet **Confluence** à côté de l’aperçu :

| Dans le Markdown | Dans Confluence |
| --- | --- |
| `#` à `######` | `<h1>` à `<h6>` |
| Un bloc de code délimité | La macro de code, avec son langage quand la liste de la macro le connaît |
| `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]` | Les macros `info`, `tip`, `info`, `note` et `warning` |
| Une liste de tâches, chaque élément `- [ ]` ou `- [x]` | La liste de tâches de Confluence, avec des cases à cocher |
| Un lien vers `#un-titre` | Un lien vers une macro d’ancre placée au début de ce titre |
| Un tableau | Un tableau avec une ligne d’en-tête, alignement des colonnes conservé |
| Les notes de bas de page | Des numéros en exposant, les notes listées à la fin |
| Une image à une adresse `https://` | Une image qui pointe vers cette adresse |
| `==surligné==`, `H~2~O`, `x^2^` | Surlignage, indice, exposant |

Les panneaux sont attribués par couleur, non par nom : chez Confluence, `note` est jaune et `warning` rouge, donc le Warning de GitHub devient `note` et son Caution `warning`. Un titre écrit après le marqueur, comme `> [!TIP] Avant de commencer`, devient le titre du panneau. Les listes imbriquées et le numéro de départ d’une liste numérotée sont conservés.

## Ce qui se perd

- **Diagrammes et formules.** Un bloc Mermaid reste sa source dans une macro de code intitulée « Mermaid diagram », une formule centrée son TeX dans une macro intitulée « LaTeX », une formule dans le texte devient du code.
- **Les images sans adresse web.** Un chemin relatif ou une image intégrée au fichier ne peut pas atteindre une page sans téléversement ; elle est donc écrite sous la forme de son texte alternatif en italique, `[Screenshot]`, ou omise si elle n’en a pas.
- **Le HTML brut.** Les balises disparaissent, leurs mots restent ; un `<br>` reste un saut de ligne.
- **Le front matter** est retiré, et les **wikiliens** ne gardent que leurs mots.
- **Une liste qui mêle tâches et éléments ordinaires** devient une liste ordinaire, les cases dessinées en ☑ et ☐.
- **Les langages que la macro de code ne connaît pas**, comme Go ou Rust : le bloc part sans langage.

## Un exemple

````markdown
## Before you deploy

- [x] Tests pass on `main`
- [ ] Changelog updated

> [!WARNING]
> Deploys are frozen after **Thursday**.

```bash
npm run build
```

Back to [the checklist](#before-you-deploy).
````

devient :

```xml
<h2><ac:structured-macro ac:name="anchor" ac:schema-version="1"><ac:parameter ac:name="">before-you-deploy</ac:parameter></ac:structured-macro>Before you deploy</h2>
<ac:task-list><ac:task><ac:task-id>1</ac:task-id><ac:task-status>complete</ac:task-status><ac:task-body>Tests pass on <code>main</code></ac:task-body></ac:task><ac:task><ac:task-id>2</ac:task-id><ac:task-status>incomplete</ac:task-status><ac:task-body>Changelog updated</ac:task-body></ac:task></ac:task-list>
<ac:structured-macro ac:name="note" ac:schema-version="1"><ac:rich-text-body><p>Deploys are frozen after <strong>Thursday</strong>.</p></ac:rich-text-body></ac:structured-macro>
<ac:structured-macro ac:name="code" ac:schema-version="1"><ac:parameter ac:name="language">bash</ac:parameter><ac:plain-text-body><![CDATA[npm run build]]></ac:plain-text-body></ac:structured-macro>
<p>Back to <ac:link ac:anchor="before-you-deploy"><ac:link-body>the checklist</ac:link-body></ac:link>.</p>
```

## Limites

Un fichier peut peser jusqu’à 10 Mo, ou bien le Markdown peut être collé directement. La conversion se fait dans votre navigateur ; sans connexion, rien n’est téléversé. **Télécharger .confluence.xml** enregistre le format de stockage dans un fichier.

Rien ici ne se connecte à Confluence : c’est vous qui collez ou envoyez le résultat, et sa destination décide de la moitié de **Copier pour Confluence** qui sert, puisque le bouton place deux versions dans le presse-papiers.

- **Confluence Cloud.** L’éditeur prend la version mise en forme, le HTML de l’aperçu, et en refait une page selon ses propres règles de collage. Pour obtenir la macro de code, les panneaux et la liste de tâches exactement comme écrits, envoyez le format de stockage dans `body.storage` de l’API REST.
- **Data Center.** L’éditeur de source et l’API REST prennent le format de stockage. La macro de code ne reçoit que des langages de sa propre liste, car Data Center affiche un encadré d’erreur pour tout autre.
- **Les deux.** Les liens vers les titres passent par des macros d’ancre, car Confluence écrit ses propres identifiants de titres différemment dans Cloud et dans Data Center.

Le résultat est le corps d’une page : un `# Titre` en tête y reste sous forme de titre.

## Questions

### Comment coller du Markdown dans Confluence ?

Convertissez le fichier, appuyez sur **Copier pour Confluence**, puis collez. L’éditeur Cloud prend la version mise en forme et un champ qui attend du balisage prend le format de stockage ; [coller du Markdown dans Confluence, Jira ou Slack](/how-to/paste-markdown) détaille les deux cas.

### Peut-on importer ou téléverser du Markdown dans Confluence directement ?

Non. Il n’existe aucune connexion à Confluence, donc aucune page ne peut être créée, modifiée ou téléversée d’ici. Vous obtenez le format de stockage à coller, ou à confier à un script qui l’envoie à l’API REST.

### Est-ce que cela produit de l’Atlassian Document Format (ADF) ?

Non. La seule sortie pour Confluence est le format de stockage, le XHTML qu’accepte `body.storage`. L’ADF est un format JSON distinct, et rien ici ne l’écrit.

### Comment les tableaux Markdown arrivent-ils dans Confluence ?

Sous forme de tableaux Confluence : la première ligne en cellules d’en-tête, et l’alignement fixé par les deux-points de la ligne de séparation conservé sur chaque cellule. Le Markdown n’a pas de cellules fusionnées, il n’en crée donc aucune ; [des tableaux Markdown qui survivent à la conversion](/blog/markdown-tables-that-survive-conversion) montre comment écrire un tableau pour qu’il soit reconnu.

### Y a-t-il ici un convertisseur HTML vers Confluence ?

Non, et pas de plugin non plus : cette page prend du Markdown. Un fichier HTML doit d’abord passer par la conversion HTML vers Markdown, puis revenir ici.
