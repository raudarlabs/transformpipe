## Ce qui est conservé

Pour convertir un RTF en Markdown, le convertisseur le lit comme un traitement de texte le rejoue : il garde la mise en forme qui a un équivalent en Markdown et saute la table des polices, la table des couleurs et la feuille de styles, qui occupent souvent la moitié du fichier.

| Dans le fichier | Dans le Markdown |
| --- | --- |
| Gras, italique, barré | `**gras**`, `*italique*`, `~~barré~~` |
| Un paragraphe doté d’un niveau hiérarchique (Word) | Un titre de ce niveau, de `#` à `######` |
| Une ligne en gras plus grande que le corps du texte (TextEdit, Pages) | Un titre, la plus grande taille devenant `#` |
| Listes à puces et listes numérotées | Listes en `-` et en `1.`, indentées selon le niveau |
| Liens hypertexte | `[texte](https://…)` |
| Tableaux | Tableaux Markdown, la première ligne servant de ligne d’en-tête |
| Un saut de ligne à l’intérieur d’un paragraphe (Word) | Un saut de ligne forcé, une barre oblique inverse en fin de ligne |

Word marque un titre par un niveau hiérarchique, qui est utilisé quand il existe. Un Mac n’écrit qu’une ligne en gras plus grande : un paragraphe en gras d’un bout à l’autre et plus grand que le corps du texte est donc lu comme un titre, classé selon sa taille. La taille du corps du texte est celle dans laquelle la majeure partie du texte est composée. Une ligne en gras à la taille du corps reste un paragraphe en gras, et un titre perd son gras : `# Titre`, et non `# **Titre**`.

Les caractères sont décodés dans la page de code que le fichier indique, en Windows-1252 s’il n’en indique aucune, et les séquences Unicode sont lues aussi : « café » et le texte cyrillique arrivent intacts. Le texte chinois et japonais n’arrive intact que là où le fichier l’écrit sous forme de séquences Unicode. Le texte d’un lien fait aussi exception : les lettres accentuées et les caractères non latins y sont perdus, et un point d’interrogation reste parfois à leur place. Un astérisque ou un tiret bas tapé dans le texte est échappé, pour rester un caractère au lieu de devenir de la mise en forme. Si le document ne commence pas par un titre, le nom du fichier est ajouté comme titre.

## Ce qui est laissé de côté

- **Les images.** Elles sont ignorées. Un `.rtfd` de Mac, ce que TextEdit enregistre dès qu’un document contient des images, n’est pas accepté du tout.
- **Les polices, les couleurs, les tailles et l’alignement.** La taille des caractères sert uniquement à repérer les titres.
- **Le soulignement, l’exposant et l’indice.** Les mots restent, la mise en forme disparaît : un 2 en exposant après un x arrive sous la forme `x2`.
- **Les en-têtes, les pieds de page et les propriétés du document.** Le titre et l’auteur enregistrés dans les propriétés du fichier ne sont pas lus. Seule exception : un en-tête ou un pied de page distinct pour la première page, dont les mots arrivent comme du texte ordinaire.
- **Les commentaires.** Ils sont ignorés, mais le texte mis en forme comme masqué arrive comme du texte ordinaire.
- **Les appels de note.** L’appel disparaît, et le texte de la note est intégré au paragraphe auquel elle se rattachait.
- **Les tabulations**, qui deviennent de simples espaces.

## Un exemple

Une courte liste de contrôle enregistrée depuis TextEdit, avec un titre plus grand en gras, un mot en italique, une liste numérotée, un lien et un horaire barré :

```rtf
{\rtf1\ansi\ansicpg1252\cocoartf2761
{\fonttbl\f0\fswiss\fcharset0 Helvetica-Bold;\f1\fswiss\fcharset0 Helvetica;\f2\fswiss\fcharset0 Helvetica-Oblique;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx566\pardirnatural\partightenfactor0

\f0\b\fs36 \cf0 Caf\'e9 opening checklist\
\f1\b0\fs24 Before the doors open on 
\f2\i Monday
\f1\i0 :\
\pard\tx220\tx720\li720\fi-720\pardirnatural\partightenfactor0
\ls1\ilvl0\cf0 {\listtext	1.	}Count the 
\f0\b float
\f1\b0 \
{\listtext	2.	}Check the {\field{\*\fldinst{HYPERLINK "https://example.com/rota"}}{\fldrslt rota}}\
\pard\tx566\pardirnatural\partightenfactor0
\cf0 Old opening time: \strike \strikec0 7:30\strike0\striked0  8:00\
}
```

Elle devient :

```markdown
# Café opening checklist

Before the doors open on *Monday*:

1. Count the **float**
1. Check the [rota](https://example.com/rota)

Old opening time: ~~7:30~~ 8:00
```

Les éléments numérotés sont tous écrits `1.` ; Markdown les numérote au moment de l’affichage.

## Limites

- **10 Mo par envoi.** Plusieurs fichiers déposés en même temps sont enchaînés en un seul document, et la limite s’applique à leur total.
- **La conversion se fait dans votre navigateur.** Le fichier n’est pas envoyé. Le Markdown n’arrive dans un compte que si vous vous connectez et cliquez sur Enregistrer.
- **Il doit s’agir de RTF.** Un fichier qui ne commence pas par `{\rtf` est refusé, même s’il porte l’extension `.rtf`.

## Questions fréquentes

### Qu’est-ce qu’un fichier RTF ?

Rich Text Format, ou format de texte enrichi : un fichier texte dans lequel la mise en forme est écrite sous forme de mots de contrôle, au milieu des mots eux-mêmes. Presque tous les traitements de texte savent le lire et l’écrire.

### Comment ouvrir un fichier RTF ?

TextEdit sur Mac, Word, LibreOffice et la plupart des autres traitements de texte l’ouvrent directement ; [Comment ouvrir un fichier .rtf](/how-to/open-rtf) les passe en revue. Sans traitement de texte, convertissez-le ici et lisez-le dans le navigateur.

### Mes titres resteront-ils des titres ?

Depuis Word, oui, s’ils utilisent les styles de titre de Word, car ceux-ci portent un niveau hiérarchique. Depuis TextEdit ou Pages, ils ne sont retrouvés que si la ligne de titre est en gras d’un bout à l’autre et plus grande que le corps du texte.

### Les images sont-elles conservées ?

Non. Les images contenues dans un `.rtf` sont ignorées, et les paquets `.rtfd` ne sont pas acceptés. Pour garder les images, enregistrez le document en `.docx` ou en `.odt` et convertissez plutôt ce fichier.

### Peut-on transformer un fichier RTF en Word ou en PDF ?

Oui, en passant par le Markdown : une fois la conversion faite, le menu à côté du bouton de téléchargement propose notamment Word et « Imprimer ou enregistrer en PDF ». Ces formats contiennent ce que contient le Markdown ; les polices et les couleurs de l’original ne reviennent donc pas.
