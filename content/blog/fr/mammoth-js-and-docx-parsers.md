---
title: "mammoth.js dans le navigateur : convertToHtml et arrayBuffer"
description: "Lire un .docx dans le navigateur ou dans Node : l’appel arrayBuffer, les style maps vers votre propre HTML, les images en base64 et le tableau de messages ignoré."
date: 2026-08-20
tag: Code
keywords: docx vers html javascript, mammoth js, lire un docx en node, analyseur docx javascript, convertir docx en html node, docx4js, docxtemplater, docx vers html navigateur, python-docx
---

Vous avez un `.docx` et du code qui réclame du HTML. Sur npm, une douzaine de paquets portent peut-être « docx » dans leur nom, et trois des plus populaires font un travail complètement différent de celui que vous cherchez. L’un fabrique des fichiers Word à partir de rien. L’autre remplit des marqueurs dans un gabarit. Le troisième rend un document pour qu’il ressemble à une page imprimée. Seuls certains d’entre eux lisent un fichier existant et vous rendent du balisage.

La requête est « docx to html javascript » et la réponse honnête est courte : en JavaScript, ce travail est celui de mammoth. Ce qui demande plus de temps à expliquer, c’est pourquoi la sortie de mammoth est bien plus propre que vous ne l’attendiez, pourquoi elle omet en silence des choses dont vous étiez certain qu’elles figuraient dans le document, et pourquoi ces deux faits n’en sont qu’un.

Le point dur n’est pas d’installer une bibliothèque. C’est qu’un `.docx` range le sens par référence, réparti sur une douzaine de fichiers XML, et que chaque analyseur doit décider lesquelles de ces références il suivra et lesquelles il ignorera. Un analyseur qui les suit toutes produit du HTML bourré de `span` en ligne qui reproduit la page et ne vous apprend rien. Un analyseur qui n’en suit que quelques-unes produit du HTML sémantique propre et laisse tomber le reste sans bruit. Il n’y a pas de troisième option, et savoir laquelle vous avez choisie constitue l’essentiel du travail.

### En bref

Pour lire un `.docx` et obtenir du HTML en JavaScript, prenez **mammoth** — licence BSD-2-Clause, fonctionne sous Node et dans le navigateur via la version `mammoth.browser.js`, et piloté par une **carte de styles** qui traduit les styles nommés de Word en éléments HTML plutôt que de chercher à reproduire la mise en forme. Lisez le tableau `messages` de chaque résultat : c’est la seule liste exploitable par une machine de ce que le convertisseur n’a pas su transposer. Décidez explicitement du sort des images, car la valeur par défaut consiste en des URI de données base64 en ligne et `convertImage` est le moyen d’en changer. Et si les listes ressortent en paragraphes, la cause est presque toujours `numbering.xml` — le fichier qui les définit est absent de l’archive ou ne se résout pas.

## Ce qu’est un .docx pour un programme qui doit le lire

Un `.docx` est une archive zip de parties XML au format Office Open XML. [Comment entrer dedans et ce que contient chaque partie](/blog/convert-docx-to-markdown) mérite une lecture si vous n’en avez jamais décompressé un, et la suite de cet article suppose que c’est fait. Ce qui compte ici, c’est la forme des données une fois passé le zip, parce que c’est à cette forme que réagit chacune des bibliothèques de cette page.

Le corps du document est une suite d’éléments de paragraphe `w:p`. Chaque paragraphe contient des éléments de passage `w:r`. Chaque passage contient un élément de texte `w:t`. La phrase « le rapport trimestriel est en retard » n’est donc pas stockée sous forme de chaîne. Elle est stockée sous forme d’un certain nombre de passages, et ce nombre dépend de faits que vous ne pouvez pas prévoir.

C’est la première chose qui surprend ceux qui tentent d’analyser eux-mêmes le XML. Word coupe les passages à chaque changement de mise en forme, ce qui est raisonnable, mais aussi aux frontières de révision, à l’état du correcteur orthographique et à diverses écritures internes, ce qui l’est moins. Un mot unique peut valoir trois passages. Le mot « trimestriel » peut se présenter comme `trimes` + `tri` + `el` parce que quelqu’un en a modifié le milieu en 2019. Toute approche fondée sur la recherche d’une expression dans `document.xml` échoue sur les documents réels, et elle échoue par intermittence, ce qui est pire.

La deuxième surprise, c’est que les espaces sont conditionnelles. Un élément `w:t` laisse tomber les espaces de début et de fin à moins de porter `xml:space="preserve"`. Recollez les passages naïvement et vous obtenez « lerapporttrimestriel ». Recollez-les avec des espaces et vous obtenez « trimes tri el ».

La troisième surprise, celle qui décide de tout le reste, c’est l’indirection. Presque rien dans `document.xml` ne dit ce qu’il est :

| Ce que vous voyez dans `document.xml` | Où réside le sens | Ce qu’il faut suivre |
| --- | --- | --- |
| `w:pStyle` nommant un style | `styles.xml` | La définition du style, plus sa chaîne `w:basedOn` |
| `w:numPr` avec `w:numId` et `w:ilvl` | `numbering.xml` | `w:num` vers `w:abstractNumId` vers `w:abstractNum` vers le bon `w:lvl` |
| `w:drawing` avec un identifiant `r:embed` | `word/_rels/document.xml.rels` | L’identifiant de relation vers un chemin sous `word/media/` |
| `w:hyperlink` avec un `r:id` | la même partie de relations | L’identifiant de relation vers une URL |
| `w:footnoteReference` avec un identifiant | `footnotes.xml` | Le corps de la note par identifiant |
| `w:commentRangeStart` et une référence | `comments.xml` | Le texte du commentaire, son auteur et sa date |

Un titre est un paragraphe dont le style se résout, deux fichiers plus loin, en quelque chose qui s’appelle Titre 1. Une puce est un paragraphe dont le `w:numId` se résout, par deux niveaux d’indirection, en une définition de numérotation abstraite dont le niveau zéro porte un `w:numFmt` valant `bullet`. Une image est un identifiant de relation. Rien ne se décrit soi-même.

Et il y a une couche au-dessus de tout cela. Les contrôles de contenu — les éléments `w:sdt` — enveloppent un contenu quelconque : les paragraphes ne sont donc pas toujours des enfants directs de `w:body`. Les tableaux s’imbriquent, et les cellules fusionnent par `w:gridSpan` et `w:vMerge` plutôt que par quoi que ce soit ressemblant à `colspan`. Les images arrivent en `w:drawing` DrawingML si elles ont été insérées cette décennie, et en `w:pict` VML hérité si elles viennent d’un fichier plus ancien ou d’un collage. Les insertions suivies sont des passages ordinaires enveloppés dans `w:ins` ; les suppressions suivies cachent leur texte dans `w:delText` au lieu de `w:t`, ce qui veut dire qu’un lecteur qui ne regarde que `w:t` accepte en silence comme définitive chaque modification en attente.

Écrire son propre analyseur n’est donc pas l’affaire d’un week-end. Décompresser avec fflate et parcourir du XML représente le quart facile du travail. Les trois autres quarts sont la résolution des références, et c’est pour cela que vous choisissez une bibliothèque.

## Comparatif rapide : l’antisèche

| Bibliothèque | Langage | Lit ou écrit | Sortie | Licence |
| --- | --- | --- | --- | --- |
| mammoth | JavaScript (Node + navigateur) | Lit du `.docx` | Du HTML sémantique, piloté par une carte de styles | Gratuit, BSD-2-Clause |
| docx-preview | JavaScript (navigateur) | Lit du `.docx` | Du HTML qui imite la page imprimée | Gratuit, Apache-2.0 |
| docx4js | JavaScript | Lit du `.docx`, du `.pptx` | Ce que construisent vos fonctions visiteuses | Gratuit, MIT |
| docxtemplater | JavaScript | Écrit à partir d’un gabarit `.docx` | Un nouveau `.docx` aux marqueurs remplis | Gratuit, MIT ou GPL-3.0 ; modules payants |
| docx (dolanmiu) | JavaScript / TypeScript | Génère du `.docx` | Un fichier Word depuis un arbre déclaratif | Gratuit, MIT |
| python-docx | Python | Lit et écrit | Un modèle objet que vous parcourez vous-même | Gratuit, MIT |
| Pandoc en sous-processus | N’importe lequel (appel externe) | Lit du `.docx` | HTML, Markdown, des dizaines d’autres formats | Gratuit, GPL |
| LibreOffice sans interface | N’importe lequel (appel externe) | Lit du `.doc`, du `.docx`, et plus | HTML, ou un `.docx` plus propre | Gratuit, MPL-2.0 |
| Le vôtre, sur fflate ou JSZip | N’importe lequel | Lit ce que vous implémentez | Exactement ce que vous écrivez | Votre temps |

La colonne qui compte le plus est la troisième. La moitié de la confusion dans ce domaine vient de gens qui saisissent une bibliothèque d’écriture pour un travail de lecture, parce que le nom du paquet ne les distinguait pas.

## mammoth et la philosophie de la carte de styles

mammoth convertit du `.docx` en HTML. Il ne cherche pas à reproduire votre document. Son objectif déclaré est de produire du HTML simple et propre en s’appuyant sur l’information sémantique présente dans le fichier — les styles nommés — et en ignorant le reste.

Cette seule décision explique tout ce que les gens apprécient et tout ce dont ils se plaignent.

Prenez un paragraphe Word en 16 points, gras, bleu foncé et centré, avec 12 points d’espace au-dessus. Un convertisseur qui vise la fidélité produit un `div` doté de six styles en ligne. mammoth pose une autre question : quel est le style de ce paragraphe ? Si la réponse est Titre 2, il produit `<h2>`. Si la réponse est Normal, il produit `<p>` et jette le gras, le bleu, le centrage et l’espacement, parce que rien de tout cela n’est ce que le paragraphe *est*. C’est la façon dont il avait l’air.

```js
const mammoth = require("mammoth");

const result = await mammoth.convertToHtml(
  { path: "quarterly.docx" },
  {
    styleMap: [
      "p[style-name='Report Title'] => h1:fresh",
      "p[style-name='Report Subhead'] => h2:fresh",
      "p[style-name='Callout'] => aside.callout:fresh",
      "p[style-name='Code Sample'] => pre:separator('\\n')",
      "highlight[color='yellow'] => mark",
      "u => em",
      "comment-reference => sup",
    ],
    includeDefaultStyleMap: true,
  }
);

console.log(result.value);
```

Six points de cet extrait méritent d’être explicités.

**Le sélecteur est un nom de style, entre apostrophes.** `p[style-name='Report Title']` correspond aux paragraphes dont le style porte exactement ce nom. Les noms de styles sont ce que l’utilisateur voit dans la galerie de styles de Word. mammoth permet aussi de cibler l’**identifiant** de style avec une syntaxe à point — `p.ReportTitle` — ce qui est plus stable, car les identifiants ne changent pas quand le document est ouvert dans une version de Word d’une autre langue, alors que les noms le font parfois.

**`:fresh` n’est pas un ornement.** Sans lui, mammoth fusionne en un seul élément les paragraphes consécutifs qui correspondent. C’est juste pour un bloc `pre` et faux pour un titre. `:fresh` signifie : commencer un nouvel élément à chaque fois. L’oublier sur une règle de titre produit un énorme `h2` contenant trois titres, et c’est de loin l’erreur de carte de styles la plus fréquente.

**`:separator()` traite le cas inverse.** Lorsque vous voulez *effectivement* voir des paragraphes consécutifs fondus en un seul élément, `pre:separator('\n')` place un retour à la ligne entre eux au lieu de coller les textes bout à bout. C’est ainsi qu’un exemple de code réparti sur plusieurs paragraphes dans Word devient un `pre` utilisable.

**Il existe aussi des sélecteurs au niveau du passage.** Ceux qui sont documentés comprennent `b`, `i`, `u`, `strike`, `all-caps`, `small-caps` et `highlight`, et `highlight` accepte une couleur facultative : `highlight[color='yellow'] => mark`. C’est ainsi qu’un document où le relecteur a surligné les questions ouvertes devient du balisage réellement interrogeable.

**`comment-reference` est un sélecteur.** Les commentaires sont pris en charge, et mettre en correspondance `comment-reference => sup` est la façon dont les marques d’appel atteignent la sortie. Sans règle pour cela, les commentaires de relecture font partie des choses qui n’apparaissent pas, sans bruit.

**`includeDefaultStyleMap` décide si vous étendez ou si vous remplacez.** Il vaut vrai par défaut : vos règles s’ajoutent donc à la carte intégrée de mammoth plutôt que de la remplacer, et les vôtres l’emportent. Ne le mettez à faux que si vous voulez la maîtrise totale et que vous êtes prêt à transposer Titre 1 vous-même.

Il existe une option supplémentaire, `includeEmbeddedStyleMap`, et une fonction correspondante `mammoth.embedStyleMap(input, styleMap)` qui écrit une carte de styles **à l’intérieur** d’une copie du `.docx`. Quand mammoth lira ce fichier par la suite, il utilisera la carte incorporée. Pour une équipe qui vous remet des documents bâtis sur des styles maison, c’est une très bonne idée : la correspondance voyage avec le gabarit au lieu de vivre dans votre code, et la personne qui renomme un style est celle qui tient le fichier qui la décrit.

### La version navigateur

mammoth livre une version autonome pour le navigateur, `mammoth.browser.js`, dépendances incluses, et le dépôt contient un exemple fonctionnel dans `browser-demo/index.html`. La seule différence d’API porte sur l’entrée : au lieu d’un chemin, vous lui passez un `arrayBuffer`.

```html
<input type="file" id="docx" accept=".docx">
<div id="out"></div>
<script src="mammoth.browser.js"></script>
<script>
  document.getElementById("docx").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
    document.getElementById("out").innerHTML = result.value;
    result.messages.forEach((m) => console.warn(m.type + ": " + m.message));
  });
</script>
```

C’est là tout le mécanisme derrière chaque convertisseur Word dans le navigateur que vous avez utilisé, y compris celui de ce site. Le fichier est lu par la page, converti sur la machine, et jamais envoyé nulle part — une propriété que vous pouvez vérifier l’onglet réseau ouvert, plutôt qu’une promesse qu’il faut croire sur parole.

Une réserve sur cet extrait, et elle n’est pas mince : employer `innerHTML` avec du balisage tiré d’un fichier qu’on vous a envoyé est une décision, pas un réglage par défaut. La sortie de mammoth est engendrée à partir de la structure du document : elle est donc bien plus étroite que du HTML quelconque, mais un `.docx` peut transporter un hyperlien dont la cible est une URL `javascript:`, et un convertisseur qui reproduit fidèlement le lien reproduira fidèlement cela aussi. Si le fichier ne vient pas de vous, [assainissez avant qu’il n’atteigne le DOM](/blog/sanitising-markdown-safely).

Dans le même ordre d’idées, et bon à savoir avant de déployer : mammoth documente une option `externalFileAccess`, et l’accès aux fichiers externes est **désactivé par défaut**, à n’activer que pour les documents auxquels vous faites confiance. Un `.docx` peut référencer du contenu extérieur à lui-même. La valeur par défaut de la bibliothèque est la valeur sûre ; laissez-la là, sauf raison précise.

### mammoth en un tableau

| Avantages | Inconvénients |
| --- | --- |
| La sortie est du HTML sémantique que vous auriez écrit à la main | Écarte volontairement la mise en forme directe, couleur, corps et alignement compris |
| Les cartes de styles prennent en charge des styles maison qu’aucun autre outil ne connaît | Ces cartes, c’est à vous de les écrire ; rien ne les devine |
| Fonctionne à l’identique sous Node et dans le navigateur | JavaScript seulement |
| Signale les styles non transposés dans un tableau `messages` | Son propre générateur de Markdown est déprécié par son auteur |
| Les images sont configurables, pas figées | Aucune géométrie de page, puisque HTML n’a pas de pages |
| Une interface en ligne de commande est fournie pour les travaux ponctuels | Zones de texte, champs et constructions de mise en page arrivent de façon inégale |

**Prix :** gratuit, sous licence BSD-2-Clause.

**Pour qui ?** Pour quiconque a du HTML comme étape suivante, sur une page ou dans un éditeur, et pour quiconque convertit des documents issus d’un gabarit connu. C’est le bon choix par défaut dans le navigateur, car il n’y a pas de concurrence sérieuse pour la sortie sémantique.

## Images et messages : les deux parties du résultat qu’il faut traiter

Chaque appel à mammoth renvoie un objet doté de deux propriétés, et la plupart des tutoriels n’en utilisent qu’une.

### Les images : base64 en ligne, une fonction de rappel, ou des fichiers sur le disque

Par défaut, les images sont incluses en ligne dans le HTML produit. Concrètement, cela veut dire que `mammoth.images.dataUri` s’exécute et que chaque image devient une balise `<img>` dont le `src` est une URI de données base64. Pour un document contenant deux logos, c’est invisible et commode. Pour un document contenant quarante captures d’écran, cela produit un fichier HTML plusieurs fois plus gros que le `.docx` d’origine, et l’encodage base64 ajoute environ un tiers par-dessus les octets bruts avant même que tout cela ne soit stocké ou transmis.

L’option `convertImage` est le moyen d’en changer, et `mammoth.images.imgElement` est l’assistant qui enveloppe votre fonction :

```js
const path = require("node:path");
const fs = require("node:fs/promises");

let index = 0;

const result = await mammoth.convertToHtml(
  { path: "quarterly.docx" },
  {
    convertImage: mammoth.images.imgElement(async (image) => {
      const extension = image.contentType.split("/")[1];
      const name = `image-${index++}.${extension}`;
      const buffer = await image.readAsBuffer();
      await fs.writeFile(path.join("media", name), buffer);
      return { src: `/media/${name}`, alt: image.altText ?? "" };
    }),
  }
);
```

L’objet image que mammoth vous remet expose `contentType` — `image/png`, `image/jpeg`, et ainsi de suite — et des méthodes de lecture pour chaque environnement : `readAsArrayBuffer()`, `readAsBuffer()` et `readAsBase64String()`. Il existe aussi une méthode plus ancienne, `read([encoding])`, que la documentation signale comme dépréciée ; prenez les trois méthodes explicites.

La voie qui vous convient découle de la destination du HTML :

| Destination | Voie | Pourquoi |
| --- | --- | --- |
| Un fichier autonome à envoyer par courriel | Les URI de données par défaut | Le fichier s’ouvre le réseau coupé |
| Une page sur un site | `convertImage` écrivant des fichiers | Le navigateur met les images en cache séparément du balisage |
| Un CMS ou un éditeur | `convertImage` téléversant et renvoyant l’URL du CDN | Les images appartiennent au CMS, pas au balisage |
| Un travail ponctuel au terminal | L’interface en ligne de commande avec `--output-dir` | Elle écrit les images en fichiers séparés à votre place |

Deux détails mordent. Le premier, c’est que `image.contentType` n’est pas une extension de fichier, et que découper sur la barre oblique est un raccourci qui produit `.jpeg` et `.svg+xml` ; faites-en une vraie correspondance si les noms de fichiers comptent. Le second, c’est que le texte de remplacement dans Word réside dans un champ de description que la plupart des auteurs ne remplissent jamais : `alt` est donc souvent vide, et le problème d’accessibilité de votre sortie est hérité, pas introduit.

### Le tableau messages : le seul relevé de ce qui a été perdu

La seconde propriété du résultat est `messages`, un tableau d’objets dotés d’un `type` — « warning » ou « error » —, d’une chaîne `message` et d’une propriété facultative `error` portant l’exception levée lorsqu’il y en a eu une.

C’est l’API la plus sous-employée de toute la catégorie. Aucun autre convertisseur d’usage courant ne vous dit ce qu’il n’a pas su traiter. Pandoc n’énumère pas ce qu’il a normalisé en silence. Une conversion par copier-coller ne vous dit rien, par définition. mammoth vous tend une liste.

```js
const { value, messages } = await mammoth.convertToHtml({ path: file });

const unmapped = messages.filter((m) => m.type === "warning");

if (unmapped.length) {
  console.warn(`${unmapped.length} things were not mapped:`);
  for (const m of unmapped) console.warn("  " + m.message);
}
```

Un avertissement de style non reconnu est une instruction, pas une récrimination. Il nomme un style qui existe dans le document et n’a aucune règle dans votre carte, ce qui signifie que ces paragraphes sont ressortis en simples éléments `p`. Ajoutez une ligne à la carte de styles et l’avertissement disparaît en même temps que le défaut. Passez-la sur un corpus de documents réels et les avertissements deviennent une liste de tâches classée par fréquence.

Le conseil opérationnel est brutal : faites-les remonter. Journalisez-les dans une construction, affichez-les dans une interface, faites échouer une tâche d’intégration continue quand un nouveau apparaît. Une chaîne de conversion qui jette `messages` est une chaîne incapable de distinguer une conversion propre d’une conversion cassée, et vous non plus.

## C’est numbering.xml qui décide si les listes survivent

L’échec le plus signalé dans cette catégorie est une liste numérotée qui arrive sous la forme d’une suite de paragraphes ordinaires, et le diagnostic est presque toujours le même.

Un élément de liste, dans `document.xml`, ressemble à ceci — un paragraphe doté de propriétés de numérotation et d’aucun autre indice sur sa nature :

```xml
<w:p>
  <w:pPr>
    <w:numPr>
      <w:ilvl w:val="0"/>
      <w:numId w:val="4"/>
    </w:numPr>
  </w:pPr>
  <w:r><w:t>Approve the budget</w:t></w:r>
</w:p>
```

`w:ilvl` est le niveau d’indentation. `w:numId` pointe vers un élément `w:num` dans `numbering.xml`, qui pointe vers un `w:abstractNumId`, qui identifie un élément `w:abstractNum`, qui contient un `w:lvl` par niveau, et c’est *là* que `w:numFmt` finit par dire `bullet`, ou `decimal`, ou `lowerLetter`, ou `upperRoman`. Ce n’est qu’au bout de cette chaîne que quiconque sait si le paragraphe relève d’un `ul` ou d’un `ol`.

Chaque maillon de la chaîne est un endroit où elle peut rompre :

| Échec | Cause | Ce que vous voyez |
| --- | --- | --- |
| `numbering.xml` est absent | Le document n’a jamais contenu de vraie liste | Des paragraphes commençant par des caractères « 1. » tapés |
| `numId` ne se résout sur rien | La partie a été retirée, ou le document est malformé | Des paragraphes, aucun balisage de liste |
| L’auteur a tapé les numéros | Des « 1. », « 2. », « 3. » manuels, sans le moindre `w:numPr` | Des paragraphes dont le texte commence par des chiffres |
| La liste est un style, pas une numérotation | Un style « Paragraphe de liste » avec indentation mais sans `numPr` | Des paragraphes indentés |
| Redémarrages de niveau et `lvlOverride` | Word peut relancer la numérotation en cours de document | Un balisage de liste correct, des numéros visibles faux |
| `lvlText` personnalisé | Des formats comme « Article 1.2 — » | Un `ol` qui renumérote à partir de 1 dans le navigateur |

Les deux derniers sont la limite honnête plutôt qu’un bogue. Le `ol` de HTML possède un attribut `start` et rien d’autre. Il ne sait pas exprimer « repartir de 1 pour chaque groupe de niveau deux tout en poursuivant la séquence de niveau un », et il n’a pas d’équivalent d’une chaîne de format de niveau personnalisée. Un convertisseur qui obtient la bonne structure perdra malgré tout les numéros visibles lorsque le document se servait de la numérotation de Word comme d’un système de citation juridique. Si c’est le cas du vôtre, les numéros sont du contenu et il faut envisager de les mettre dans le texte.

Notez aussi ce que la carte de styles atteint et n’atteint pas. Les sélecteurs documentés de mammoth couvrent les paragraphes et leurs styles, les passages et leurs propriétés, les tableaux et les références de commentaires. Le traitement des listes est intégré au convertisseur plutôt que configurable par une règle : le correctif d’une liste cassée est donc un correctif apporté au document — appliquer un vrai style de liste — et non une ligne dans votre carte. Cette distinction épargne un après-midi.

La même chaîne explique pourquoi [les tableaux et les listes se comportent si différemment à la sortie](/blog/markdown-tables-that-survive-conversion) : la structure d’un tableau est là, dans `document.xml`, sous forme d’éléments imbriqués, alors que la structure d’une liste est une clé étrangère.

## Les autres bibliothèques, et les différents métiers qu’elles exercent

### docx-preview — la fidélité plutôt que la sémantique

docx-preview, issu du dépôt docxjs, est le pari inverse de mammoth. Son but est de rendre un `.docx` en HTML qui ressemble au document, en gardant le HTML aussi sémantique que possible tout en acceptant que la priorité soit l’apparence. Le point d’entrée principal est `renderAsync()`, qui prend le document sous forme de blob ainsi qu’un élément cible et se résout une fois le rendu terminé. `parseAsync()` et `renderDocument()` sont disponibles séparément pour les deux moitiés.

Ses options sont révélatrices : `breakPages`, `ignoreWidth`, `ignoreHeight`, `renderHeaders`, `renderFooters`, `renderComments`, `useBase64URL`, `debug`. Ce sont les préoccupations de quelque chose qui dessine une page — en-têtes, pieds de page, sauts de page, dimensions physiques — dont mammoth n’a aucune opinion, puisqu’un titre n’a pas de hauteur.

| Avantages | Inconvénients |
| --- | --- |
| La sortie ressemble au document, en-têtes et sauts de page compris | Le balisage est présentationnel ; ce n’est pas du contenu que l’on stockerait |
| Rend les commentaires, les en-têtes et les pieds de page | Orienté navigateur ; ce n’est pas une étape de conversion sous Node |
| Des options pour ignorer la géométrie de page quand vous voulez du texte qui se recompose | La bibliothèque avertit que ses rouages internes peuvent changer ; seul `renderAsync` est traité comme stable |
| Pas d’aller-retour serveur pour un aperçu | Ce n’est pas une voie vers Markdown ni vers du HTML propre |

**Prix :** gratuit, sous licence Apache-2.0.

**Pour qui ?** Pour une visionneuse. Si l’utilisateur a besoin de *voir* le fichier Word dans votre application avant de décider quelque chose, c’est cette bibliothèque-là. Si vous avez besoin de *stocker* ce que dit le fichier, c’est la mauvaise — le balisage est un rendu, pas un document.

### docx4js — un analyseur que vous pilotez vous-même

docx4js analyse les fichiers Office — du `.docx` principalement, du `.pptx` depuis la version 3.1.30, avec un `.xlsx` encore limité (les deux points notés dans son README, vérifié sur github.com/lalalic/docx4js, le 8 septembre 2026) — et vous confie le parcours. Plutôt que de bâtir un arbre complet en mémoire, il traverse le document, reconnaît les modèles Office XML et appelle vos visiteurs, ce qui limite la consommation mémoire sur les gros fichiers. Le rendu passe par une fonction `createElement` que vous fournissez : le format de sortie relève donc entièrement de votre décision.

Les modèles qu’il identifie couvrent une large surface : sections, en-têtes, pieds de page, paragraphes, tableaux, formes, images, hyperliens, contrôles de contenu y compris cases à cocher et listes déroulantes, champs, équations, signets et graphiques.

| Avantages | Inconvénients |
| --- | --- |
| Reconnaît des constructions que mammoth ignore — champs, équations, graphiques, contrôles de formulaire | C’est vous qui écrivez la couche de sortie ; aucun convertisseur HTML n’est fourni |
| Des visiteurs à la manière d’un flux plutôt qu’un arbre entièrement analysé | Un démarrage plus rude qu’un `convertToHtml` en une ligne |
| Lit aussi le `.pptx` | La documentation est maigre à côté de celle de mammoth |
| Sous licence MIT | Les lignées 2.x et 3.x comportent des ruptures de compatibilité |

**Prix :** gratuit, sous licence MIT.

**Pour qui ?** Pour quiconque n’a pas besoin de HTML. Extraire la valeur de chaque contrôle de contenu, sortir les graphiques de cent rapports, bâtir un moteur de rendu sur mesure pour un gabarit précis : ce sont là des travaux pour docx4js, et employer mammoth pour cela revient à se battre contre une bibliothèque conçue pour jeter cette matière.

### docxtemplater — un tout autre métier

docxtemplater ressort dans toutes les recherches de bibliothèques docx, et il ne lit pas les documents au sens où vous l’entendez. C’est un moteur de gabarits qui **génère** du `.docx`, du `.pptx` et du `.xlsx` en prenant un fichier Word contenant des marqueurs comme `{first_name}` et en les remplaçant par vos données. Le déroulé est : lire le fichier de gabarit, le charger dans PizZip, construire un `Docxtemplater`, appeler `render()` avec vos données, et écrire le tampon en sortie.

Sa propre documentation est explicite : docxtemplater et PizZip viennent de la même équipe, et les capacités supplémentaires arrivent par des modules payants — un module d’images pour `{%image}`, un module HTML pour insérer du texte mis en forme dans un `.docx`, ainsi que des modules pour les graphiques, le XLSX, le style, les notes de bas de page, les tableaux, les codes QR et la localisation des erreurs, entre autres.

| Avantages | Inconvénients |
| --- | --- |
| Le bon outil pour produire des fichiers Word à partir de données et d’un gabarit conçu pour cela | Ne convertit pas un document existant vers quoi que ce soit |
| Préserve exactement le style du gabarit, puisque le gabarit *est* un `.docx` | Le cœur est gratuit ; plusieurs capacités vivent derrière des modules payants |
| Double licence MIT ou GPL-3.0 | Le gabarit doit être rédigé pour lui |
| Maintenu de longue date, son auteur le décrivant comme son travail principal | Les marqueurs, dans Word, peuvent être coupés en plusieurs passages, ce qui est une classe de bogues à soi seule |

**Prix :** gratuit, sous double licence MIT ou GPL version 3. Les modules payants sont tarifés séparément par l’éditeur ; consultez sa propre page pour les montants en vigueur.

**Pour qui ?** Pour les contrats, les factures, les attestations, les promesses d’embauche — tout ce dont un humain a dessiné la mise en page dans Word et dont un programme fournit les valeurs. Personne qui convertit un document vers HTML n’en a besoin, et un nombre surprenant de gens l’installent avant de s’en apercevoir.

Cette remarque sur la coupure des passages n’est pas une pique. C’est le même fait qu’à la première section, vu du côté de l’écriture : `{first_name}` peut être stocké en `{first_` + `name}` sur deux passages à cause d’une modification faite des mois plus tôt, et tout moteur de gabarits docx doit s’en accommoder.

### docx, de dolanmiu — la génération, de façon déclarative

Le paquet npm littéralement nommé `docx` engendre et modifie des fichiers `.docx` depuis une API TypeScript déclarative — `Document`, `Paragraph`, `TextRun`, `Table`, en-têtes, pieds de page, images — et fonctionne sous Node comme dans le navigateur. Il est sous licence MIT.

**Pour qui ?** Pour du code qui doit remettre un fichier Word à un utilisateur. Il se tient de l’autre côté de la conversion par rapport à mammoth, et les deux servent fréquemment dans la même application : mammoth à l’entrée, `docx` à la sortie.

### python-docx — le modèle objet de référence

Si votre chaîne est en Python, python-docx est le point de départ équivalent, et c’est un outil d’une tout autre nature : plutôt que de convertir, il vous donne un modèle objet à parcourir et à modifier. `Document`, `Paragraph`, `Run`, `Table` avec `Row`, `Column` et `Cell`, `Section`, `Font` et `ParagraphFormat`, plus les styles, les commentaires et les formes. Sa documentation comporte des sections dédiées aux en-têtes et pieds de page ainsi qu’aux commentaires (vérifié sur python-docx.readthedocs.io, le 8 septembre 2026), et il est sous licence MIT.

| Avantages | Inconvénients |
| --- | --- |
| Lit et écrit avec un seul modèle objet | Aucune sortie HTML ; le sérialiseur, c’est vous qui l’écrivez |
| API documentée pour les styles, les sections, les en-têtes, les pieds de page et les commentaires | Le suivi des modifications ne fait pas partie de l’API documentée |
| Naturel dans une construction ou une chaîne de données Python | Python seulement |
| Sous licence MIT | Plus de code qu’un convertisseur, pour un travail de conversion |

**Pour qui ?** Pour l’extraction et la transformation plutôt que pour la conversion — sortir tous les tableaux d’un lot de rapports vers un tableau de données, réécrire une clause à travers deux cents contrats, auditer quels documents emploient un style déprécié. Quand le besoin est « docx vers HTML » et que le langage est Python, appeler Pandoc en sous-processus demande en général moins de code que de bâtir un sérialiseur par-dessus celui-ci.

### Pandoc en sous-processus — la triche pragmatique

L’option qu’on oublie : ne pas analyser le document du tout. Lancez Pandoc et lisez sa sortie.

```js
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

const run = promisify(execFile);

const { stdout } = await run("pandoc", [
  "-f", "docx",
  "-t", "html",
  "--extract-media=./media",
  "--track-changes=all",
  "--sandbox",
  "quarterly.docx",
]);
```

Le lecteur `.docx` de Pandoc prend en charge les notes de bas de page, les tableaux, le suivi des modifications et bien d’autres choses qu’une bibliothèque JavaScript n’atteindra pas, et `--extract-media` écrit les images à votre place. `--track-changes` est l’option dont l’absence engendre le plus de confusion : un document relu contient des insertions et des suppressions, et il vous faut choisir délibérément si vous les voulez acceptées, rejetées ou annotées, plutôt que de prendre ce que donne la valeur par défaut. `--sandbox` restreint l’accès au système de fichiers quand le document n’est pas le vôtre.

| Avantages | Inconvénients |
| --- | --- |
| Prend en charge les notes, le suivi des modifications et des constructions qu’aucune bibliothèque JS n’atteint | Un binaire externe sur chaque machine qui exécute votre code |
| Une seule commande, aucun analyseur à entretenir | Impossible dans le navigateur, et malcommode dans la plupart des environnements sans serveur |
| Convertit dans la foulée vers des dizaines d’autres formats depuis le même appel | Aucun équivalent de `messages` : il ne vous dit pas ce qu’il a normalisé |
| Sous licence GPL et de longue durée de vie | Le HTML est à la sauce Pandoc ; vous aurez quand même du post-traitement |

**Pour qui ?** Pour le traitement par lots côté serveur, là où vous maîtrisez l’environnement. C’est bien plus souvent la bonne réponse que la fidélité aux bibliothèques ne le laisse croire, et la mauvaise dès l’instant où le code doit tourner dans un navigateur ou dans un conteneur que vous n’avez pas construit.

LibreOffice sans interface mérite la même note en bas de page : `soffice --headless --convert-to html` lira des fichiers que rien d’autre ne lit, y compris de vieux `.doc` binaires, et sert aussi purement de préprocesseur — convertissez d’abord le fichier récalcitrant en un `.docx` propre, puis confiez celui-ci à mammoth.

## Là où mammoth est la mauvaise réponse, et ce que cela coûte

La recommandation du début de cet article a de vraies limites, et il vaut la peine de les énoncer sans détour, car ce sont elles qui produisent les plaintes après la mise en production.

**La mise en forme directe a disparu, et c’est le dessein.** Un document dont l’auteur n’a jamais employé de styles — tout est en Normal, avec du gras et du 18 points appliqués à la main — se convertit en un mur d’éléments `p`. mammoth se comporte correctement : il n’y a dans ce fichier aucune information sémantique à exploiter. Le coût, c’est que le correctif n’est pas dans votre code. Quelqu’un doit appliquer de vrais styles au document, ou bien vous devez écrire des règles de carte de styles portant sur les propriétés de passage et accepter la part de devinette. Prévoyez la conversation.

**La mise en page n’existe pas dans la sortie.** Pas de format de page, pas de marges, pas de colonnes, pas d’en-têtes, pas de pieds de page, pas de sauts de page. Si le besoin comporte le mot « imprimer », mammoth n’est pas l’outil ; docx-preview ou une voie PDF l’est.

**Les zones de texte, les formes et les SmartArt arrivent de façon inégale.** Un contenu placé dans une zone de texte flottante n’est pas dans le flux du document, et tout convertisseur HTML doit décider où le mettre. Vérifiez sur un document qui en emploie avant de promettre quoi que ce soit.

**Les champs sont des valeurs, pas des formules.** Un champ de numéro de page, un renvoi, un champ de table des matières, un champ calculé : ce sont tous des instructions dans le fichier, plus un dernier résultat mis en cache. HTML n’a pas de champs. Ce que vous obtenez est au mieux le texte mis en cache, et une table des matières ne se convertit en liste de liens que si le document a été assez bien construit pour que les ancres existent.

**Le générateur de Markdown est déprécié.** mammoth possède un `convertToMarkdown` et sa documentation dit clairement que « la prise en charge de Markdown est dépréciée », recommandant à la place le HTML suivi d’une bibliothèque HTML vers Markdown distincte, comme susceptible de produire de meilleurs résultats. Suivez le conseil. Convertissez en HTML, puis passez par un convertisseur dédié — le choix parmi [les bibliothèques HTML vers Markdown](/blog/best-html-to-markdown-converters) compte plus qu’il n’y paraît, car c’est là que vous décidez du sort du balisage que Markdown ne sait pas exprimer.

**Les très gros fichiers posent une question de mémoire, surtout dans le navigateur.** Toute l’archive est lue, images comprises. Un document de 30 Mo aux captures d’écran en haute résolution gonfle encore en base64 dans la sortie, et un onglet a moins de marge qu’un serveur. C’est pourquoi les convertisseurs hébergés plafonnent la taille des envois ; TransformPipe plafonne une conversion à 10 Mo et un document stocké à 4 Mo, ce dernier chiffre parce qu’une fonction Vercel refuse un corps de requête ou de réponse au-delà de 4,5 Mo. Ce que vous bâtirez aura besoin d’une limite aussi, et la choisir délibérément vaut mieux que de la découvrir.

**Un seul document n’est pas un problème de bibliothèque.** Si quelqu’un a besoin aujourd’hui qu’un unique `.docx` devienne du HTML ou du Markdown, installer un analyseur et écrire une carte de styles est la voie coûteuse. [Les convertisseurs qui existent déjà](/blog/best-word-to-markdown-converters) le font dans un onglet de navigateur. Prenez une bibliothèque quand la conversion est une fonctionnalité, pas une course à faire.

## Comment choisir une bibliothèque docx

1. **Décidez si vous voulez le sens ou l’apparence, avant de comparer quoi que ce soit.** Vouloir les deux est ici l’erreur la plus coûteuse, car elle vous envoie vers un moteur de fidélité pour stocker du contenu, et le balisage présentationnel que vous récupérez restera des années dans votre base.
2. **Regardez où tourne le code.** Un navigateur exclut tout sous-processus et vous laisse mammoth ou docx-preview ; un serveur maîtrisé fait de Pandoc un concurrent sérieux qui ne vous coûte presque aucune ligne.
3. **Regardez dix documents réels avant d’écrire la carte de styles, et comptez les styles.** Si les auteurs ont employé de vrais styles nommés, mammoth produira du bon HTML dès la première passe ; s’ils ont mis en forme à la main, aucune bibliothèque n’y parviendra, et le savoir tôt transforme un problème de code en problème de gabarit.
4. **Vérifiez que la bibliothèque lit plutôt qu’elle n’écrit.** docxtemplater et `docx` sont tous deux excellents et aucun des deux ne convertira votre fichier : lire le premier paragraphe d’un README épargne un après-midi de confusion.
5. **Branchez les avertissements dès le premier jour.** Avec mammoth, c’est le tableau `messages` ; avec autre chose, ce sont vos propres contrôles sur la sortie, car le silence d’un convertisseur n’est pas la preuve que quelque chose a fonctionné.
6. **Testez un document avec une liste numérotée, un avec des images, et un qui est passé par une relecture.** Ces trois-là couvrent les trois chaînes qui rompent — `numbering.xml`, la partie des relations et les marques de révision — et si les trois ressortent correctement, les documents ordinaires le feront aussi.

## Conclusion

En JavaScript, lire un `.docx` et en tirer du HTML utilisable, cela veut dire mammoth, et bien s’en servir veut dire accepter son marché : vous obtenez un balisage sémantique propre parce qu’il transpose les styles nommés et écarte la présentation, si bien que la qualité de votre sortie est fixée par la qualité des styles du document et par la carte de styles que vous écrivez en face. Lisez `messages` et la bibliothèque vous dira exactement où cette carte est courte. Choisissez `convertImage` délibérément plutôt que de livrer une page pleine de base64. Si le travail consiste à consulter un document plutôt qu’à stocker ce qu’il dit, prenez docx-preview ; s’il consiste à extraire des champs ou des graphiques, prenez docx4js ; s’il consiste à produire un fichier Word, prenez `docx` ou docxtemplater ; et si le code tourne sur un serveur que vous maîtrisez, Pandoc en sous-processus demande moins de travail que tous. Pour un fichier unique, aucune bibliothèque n’est requise — [le déposer dans un convertisseur de navigateur](/word-to-markdown) prend une dizaine de secondes et ne téléverse rien.

## FAQ

### Comment convertir un .docx en HTML en JavaScript ?

Employez mammoth : `mammoth.convertToHtml({path: "file.docx"})` sous Node, ou `mammoth.convertToHtml({arrayBuffer: buffer})` dans le navigateur avec la version `mammoth.browser.js`. Le résultat comporte une propriété `value` contenant le HTML et un tableau `messages` énumérant ce qui n’a pas pu être transposé. Ajoutez une `styleMap` pour tout style Word personnalisé qu’emploient vos documents.

### Pourquoi la sortie de mammoth perd-elle ma mise en forme ?

Parce qu’il est conçu pour cela. mammoth met en correspondance l’information sémantique — les styles nommés — avec des éléments HTML et écarte la mise en forme directe comme la couleur, le corps et l’alignement. Si les auteurs du document ont appliqué du gras et du 18 points à la main au lieu d’employer un style de titre, mammoth n’a rien à transposer, et le remède consiste à styler correctement le document ou à écrire des règles de carte de styles portant plutôt sur les propriétés de passage.

### Pourquoi mes listes numérotées se sont-elles converties en simples paragraphes ?

Presque toujours parce que la liste n’a jamais été une vraie liste. Word range l’appartenance à une liste sous la forme d’un `w:numId` qui se résout via `numbering.xml` : si cette partie manque, si l’identifiant ne se résout pas, ou si l’auteur a tapé « 1. » et « 2. » à la main, le convertisseur voit des paragraphes ordinaires. Appliquez un véritable style de liste dans Word et convertissez de nouveau.

### Puis-je lire un .docx dans le navigateur sans le téléverser ?

Oui. `mammoth.browser.js` lit l’`arrayBuffer()` d’un objet `File` et convertit entièrement dans la page : rien n’est envoyé à un serveur. C’est ainsi que fonctionnent les convertisseurs Word dans le navigateur, et vous pouvez le vérifier sur n’importe lequel d’entre eux en surveillant l’onglet réseau pendant qu’un fichier se convertit.

### Faut-il employer le convertToMarkdown de mammoth ?

Non. Sa propre documentation signale la prise en charge de Markdown comme dépréciée et recommande à la place de produire du HTML et de le passer à une bibliothèque HTML vers Markdown dédiée. HTML possède un élément pour la plupart des choses qu’un `.docx` contient, et Markdown non : la voie en deux étapes donne donc davantage de matière à la seconde bibliothèque.

### Quelle est la différence entre mammoth et docx-preview ?

Ils optimisent des choses opposées. mammoth produit du HTML sémantique propre à partir des styles nommés et ignore l’apparence ; docx-preview rend le document pour qu’il ressemble à la page imprimée, avec des options pour les sauts de page, les en-têtes et les pieds de page. Prenez mammoth quand vous voulez du contenu à conserver, et docx-preview quand un utilisateur a besoin de regarder le fichier.

### Puis-je simplement décompresser le .docx et analyser le XML moi-même ?

Vous le pouvez, et la décompression est facile. Le difficile, c’est que le sens est rangé par référence : les styles dans `styles.xml`, les listes dans `numbering.xml`, les images et les liens dans la partie des relations, et le texte réparti arbitrairement sur des passages, si bien qu’un mot unique peut valoir trois éléments. Cette résolution des références constitue l’essentiel de ce qu’est une bibliothèque, et la réimplémenter est un projet plutôt qu’une tâche.
