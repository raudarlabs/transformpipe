## Ce qui est conservé

Chaque note du fichier `.enex` devient une section d’un seul document Markdown. Celui-ci s’ouvre sur un titre au nom du fichier et sur la liste des titres de notes ; chaque note suit ensuite sous son propre titre, séparée de la suivante par une ligne horizontale.

| Dans la note | Dans le Markdown |
| --- | --- |
| Titre | `# Titre` ; une note sans titre devient `# Note 3`, selon sa place dans le fichier |
| Date de création et étiquettes | Une ligne en italique sous le titre : `*2026-09-14 · travel, 2026*` |
| Gras, italique, barré, liens, listes, tableaux | Leur forme Markdown ; la première ligne d’un tableau en devient l’en-tête |
| Cases à cocher | Une liste de tâches : `- [x]` et `- [ ]` |
| Images (PNG, JPEG, GIF, WebP, BMP, AVIF, TIFF) | Intégrées, avec le nom du fichier comme texte alternatif |
| Autres pièces jointes | Le nom du fichier en italique, à l’endroit de la pièce jointe |
| Texte chiffré | Une phrase en anglais signalant qu’il faut sa phrase secrète |

Une note ne désigne pas ses images par leur nom, mais par l’empreinte MD5 de leurs octets. Le convertisseur calcule cette empreinte pour chaque pièce jointe : chaque image retrouve ainsi sa note, à l’endroit où elle se trouvait.

## Ce qui se perd

- **Les autres informations de la note.** La date de modification, l’auteur, l’URL source et le lieu ne sont pas lus.
- **La mise en forme.** Le soulignement, la couleur du texte, le surlignage et les polices n’ont pas d’équivalent en Markdown. Les mots restent, la mise en forme disparaît.
- **Les blocs de code d’Evernote.** Ils arrivent comme des paragraphes ordinaires, un par ligne, et non comme un bloc de code délimité.
- **Les fichiers joints eux-mêmes.** Un PDF ou un enregistrement garde son nom dans la note ; le fichier reste dans Evernote.
- **Les liens entre notes.** Ils conservent leur adresse `evernote:///`, qui n’ouvre rien en dehors d’Evernote.
- **Les notes vides.** Une note sans contenu, sans date et sans étiquettes est ignorée et n’apparaît pas non plus dans la liste des titres.

## Un exemple

`Travel.enex` contient deux notes : « Lisbon trip », avec les étiquettes travel et 2026, une ligne qui commence en gras, deux cases à cocher (dont une cochée) et une carte d’embarquement en PDF jointe ; et « Where to eat », avec l’étiquette travel et une liste à puces. On obtient :

```markdown
# Travel

- Lisbon trip
- Where to eat

---

# Lisbon trip

*2026-09-14 · travel, 2026*

**Flight:** TP 1351, 07:40 from Heathrow

- [x] Book the hotel
- [ ] Renew the travel insurance

*boarding-pass.pdf*

---

# Where to eat

*2026-09-16 · travel*

Recommended by Ana:

- Cervejaria Ramiro
- Taberna da Rua das Flores
```

Si une photo avait été jointe à la place de la carte d’embarquement, elle figurerait au même endroit, sous forme d’image portant ses propres octets dans une URI data.

## Limites

- **50 Mo par conversion**, comptés sur l’ensemble des fichiers déposés en même temps. Plusieurs fichiers `.enex` déposés ensemble donnent un seul document, un export après l’autre.
- **Les images ont un budget**, puisqu’elles voyagent dans le document : 1 Mo au plus par image une fois encodée (environ 750 Ko sur le disque), et 2 Mo pour l’ensemble des images d’un même export. Elles sont reprises dans l’ordre ; une image qui dépasse le budget est remplacée par son nom de fichier en italique.
- **Un seul document, pas un fichier par note.** Aucune option ne permet de découper un export en notes séparées.
- **L’enregistrement accepte jusqu’à 4 Mo de Markdown.** Un document plus lourd reste à l’écran et peut toujours être téléchargé.
- **Tout se passe dans votre navigateur.** Si vous n’êtes pas connecté, le fichier n’est pas envoyé. Une fois connecté, le document n’atteint votre compte que lorsque vous cliquez sur Enregistrer.

## Questions

### Qu’est-ce qu’un fichier .enex ?

C’est le fichier qu’Evernote écrit lorsque vous exportez des notes : un seul fichier XML contenant toutes les notes, le contenu de chacune en ENML, la version restreinte de XHTML propre à Evernote, et les pièces jointes en base64. [Comment ouvrir un fichier .enex](/how-to/open-enex) détaille ce qu’il contient.

### Comment convertir Evernote en Markdown ?

Exportez les notes depuis Evernote avec Fichier, Exporter les notes, puis déposez le fichier `.enex` sur cette page. Le Markdown s’affiche à l’écran, et le bouton de téléchargement l’enregistre dans un fichier `.md` du même nom.

### Les étiquettes sont-elles conservées ?

Oui, en italique sous le titre de chaque note, après la date de création. Dans le Markdown, ce sont toutefois du texte simple, et non des étiquettes qu’une autre application reconnaîtrait comme telles.

### Puis-je obtenir un fichier Markdown par note ?

Pas avec ce convertisseur. Chaque note devient une section d’un seul document, sous son propre titre, et chaque téléchargement produit un seul fichier.

### Que deviennent les images et les pièces jointes ?

Les images sont intégrées sous forme d’URI data : le document n’a besoin d’aucun dossier à côté de lui. Toute autre pièce jointe se réduit à son nom en italique. [Où passent les images quand vous exportez un document](/blog/pictures-in-a-document-export) explique ce que coûte l’intégration.

### Et le texte chiffré ?

Il ne peut pas être lu sans la phrase secrète, et le convertisseur ne la demande pas. À sa place, la note affiche la phrase anglaise « Encrypted text, which needs the passphrase it was written with ».
