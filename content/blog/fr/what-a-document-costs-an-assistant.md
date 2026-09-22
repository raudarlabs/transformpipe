---
title: "Ce qu'un document coûte à un assistant, et comment ne pas le dépenser"
description: "Un jeton vaut environ 3,5 caractères : un document entre dans la fenêtre de contexte ou n'y entre pas — l'arithmétique de la conversion hors conversation"
date: 2026-09-22
tag: Automatisation
keywords: économiser des jetons ia, document jetons fenêtre de contexte, convertir un document sans ia, réduire la consommation de jetons claude, jetons markdown, flux de travail ia moins cher
---

Il y a une habitude qui mérite examen. Vous avez un `.docx`, vous voulez le voir en Markdown, et l'assistant est là — alors vous joignez le fichier et vous demandez. Cela marche, et cela vous coûte le document entier deux fois : une fois à l'aller, une fois au retour. Rien dans cette conversion n'avait besoin d'un modèle de langue. Lire de l'OOXML et écrire du Markdown, c'est de l'analyse syntaxique, et l'analyse syntaxique est un problème résolu depuis bien avant tout ceci.

### En bref

Pour Claude, un jeton représente environ 3,5 caractères anglais (vérifié sur platform.claude.com, le 22 septembre 2026). Ce seul nombre fait de toute la question une affaire d'arithmétique et non d'opinion. Un article de 2 500 mots fait environ 15 000 caractères, donc à peu près 4 300 jetons ; demander la conversion à un assistant dépense cela à l'aller et encore autant au retour, disons 8 500 pour un travail qu'un analyseur fait gratuitement. Un document avec une image intégrée est pire de deux ordres de grandeur : un mégaoctet de base64 vaut environ 300 000 jetons, ce qui n'entre dans aucune fenêtre de contexte courante. Un lien vers le même document en vaut onze.

La version honnête de l'affirmation : convertir un document hors de la conversation ne rend pas un modèle moins cher d'un certain pourcentage. Cela retire le document de la fenêtre de contexte, purement et simplement, et ce que cela vaut dépend de la part de texte documentaire dans votre conversation. La formule est plus bas, pour que vous calculiez votre propre chiffre plutôt que de croire le mien.

## Le seul nombre dont tout découle

Le glossaire d'Anthropic le dit sans détour : chez Claude, un jeton représente approximativement 3,5 caractères anglais, le nombre exact variant selon la langue employée (vérifié sur platform.claude.com, le 22 septembre 2026). Divisez un nombre de caractères par 3,5 et vous avez une estimation utilisable. Doublez-la si le texte n'est pas anglais : la plupart des tokeniseurs ont été ajustés sur l'anglais et dépensent plus de jetons par caractère pour tout le reste, ce qui rend ce calcul pire, et non meilleur, pour un document français.

Voici de vrais fichiers, mesurés et non devinés :

| Document | Mots | Caractères | Jetons, environ |
| --- | --- | --- | --- |
| Un long article de blog | 2 513 | 14 921 | 4 300 |
| Un README de projet conséquent | 4 654 | 30 138 | 8 600 |
| Un mégaoctet d'image en base64 | — | 1 048 576 | 300 000 |
| Un lien vers un document partagé | 5 | 40 | 11 |

Les deux dernières lignes sont les intéressantes, et ce n'est pas un tour de rhétorique. Une image portée dans un fichier Markdown sous forme d'URI `data:` est du texte, et le texte est tokenisé. Si vous collez un tel document dans une conversation, le modèle lit chaque caractère de cet encodage. [Où passent les images quand vous exportez un document](/blog/pictures-in-a-document-export) explique pourquoi l'encodage pèse un tiers de plus que le fichier sur le disque ; ici, la conséquence est qu'une seule capture d'écran peut coûter plus de jetons que tout le reste d'un long rapport.

## Trois habitudes et ce que chacune dépense

### Demander la conversion à l'assistant

Le modèle lit le document et le réécrit. Les deux moitiés sont facturées, et sur toutes les grandes interfaces la moitié en sortie est tarifée au-dessus de celle en entrée, parce que produire demande plus de travail que lire. Pour l'article ci-dessus, cela fait environ 4 300 à l'aller et 4 300 au retour.

Ce que vous obtenez pour ce prix : une conversion faite par quelque chose qui devine. Un modèle qui lit un `.docx` ne résout pas les identifiants de relation pour trouver les images, ne lit pas `<w:numPr>` pour déterminer à quelle liste appartient un paragraphe, et ne voit pas du tout les octets de `word/media/`. Il produit du Markdown plausible, ce qui n'est pas la même chose que du Markdown correct, et les erreurs sont du genre silencieux : un niveau de titre qui a dérivé, un tableau dont la cellule fusionnée est devenue une colonne de plus.

Ce qu'un analyseur donne pour rien : la vraie réponse, de façon déterministe, identique deux fois de suite.

### Coller un document pour le regarder

C'est le cas que l'arithmétique punit vraiment, et il est extrêmement courant. Vous voulez vérifier un document en cours de route : les tableaux ont-ils tenu, l'en-tête a-t-il l'air juste, la section quatre est-elle encore là. Vous demandez donc à l'assistant de le montrer, et il réécrit le document. C'est la longueur entière du document en jetons de sortie, dépensée pour un acte de lecture qu'un navigateur accomplit gratuitement.

Un aperçu rendu ne coûte rien. Un lien partagé coûte onze jetons et peut être ouvert par quelqu'un qui n'est pas dans la conversation. [Partager un document Markdown par un lien](/blog/share-a-markdown-document-as-a-link) en est le mécanisme ; ici, le seul point est que « montre-moi le document » est de loin la façon la plus chère de regarder un document.

### Garder le document dans la conversation pendant que vous travaillez à autre chose

Le contexte ne se paie pas une seule fois. Chaque tour suivant renvoie tout l'historique : un document collé en haut est donc repayé à chaque message ultérieur — ce qui transforme 8 600 jetons ponctuels en charge permanente pour le reste de la session. La mise en cache change le prix de cette répétition sur certaines interfaces, pas le fait qu'elle ait lieu.

Tenir le document par référence — stocké quelque part, adressé par un lien — signifie que la conversation porte onze jetons là où elle en portait des milliers. C'est l'essentiel de l'argument en faveur de [la conversion de documents par un connecteur](/blog/converting-documents-from-an-assistant) plutôt que dans la fenêtre de discussion : l'appel d'outil renvoie une adresse, et le document lui-même n'entre jamais dans la transcription.

## La formule, pour ne plus croire personne sur parole

Soit **D** le nombre de caractères de texte documentaire dans une conversation, et **C** celui de tout le reste — vos questions, le raisonnement du modèle, le code, la discussion. La part des jetons imputable au texte documentaire vaut alors :

```text
document share = D / (D + C)
```

Et l'économie réalisée en convertissant hors de la conversation est cette part, moins ce que le modèle doit réellement lire.

Trois exemples honnêtes :

- **Vous joignez une spécification de 30 000 caractères et posez trois questions courtes.** D vaut 30 000, C peut-être 3 000. Le texte documentaire représente 91 pour cent de la conversation — mais vous aviez besoin que le modèle lise la spécification : l'économie est donc nulle. La convertir ailleurs d'abord n'apporte rien du tout.
- **Vous convertissez six documents dans une session, regardez chacun et n'en discutez aucun.** D est tout et C presque rien. L'économie approche les cent pour cent, parce que rien de cela n'avait à figurer dans le contexte.
- **Vous travaillez pour de vrai avec un assistant et convertissez au passage quatre fichiers, dont vous en regardez deux.** C'est le cas réaliste. Si ces fichiers font 20 000 caractères à eux quatre et la conversation de travail 60 000, le texte documentaire est un quart du total, et sortir les conversions en retire presque tout.

C'est dans cette bande médiane que vit l'affirmation honnête. Qu'un cinquième à un quart des jetons d'une session de travail partent en texte documentaire sur lequel personne ne voulait faire réfléchir le modèle est tout à fait ordinaire — et tout à fait dépendant de vos habitudes, raison pour laquelle un pourcentage unique affiché serait un chiffre inventé pour sonner bien. Calculez `D / (D + C)` sur votre propre transcription et vous aurez un chiffre vrai pour vous.

## Quand le modèle doit vraiment le lire

Cela mérite sa propre section, car le reste de l'article pourrait se lire comme « tenez les documents loin des assistants », et ce serait faux.

Si vous voulez que le contenu soit résumé, critiqué, traduit, comparé à un autre document, examiné pour ses contradictions, ou pensé de quelque manière que ce soit, alors le document doit entrer dans la fenêtre de contexte. Ce n'est pas du gaspillage : c'est le travail. Aucun convertisseur ne le réduit, et quiconque prétend le contraire cherche à vous vendre quelque chose. La seule économie sensée à cet endroit est d'envoyer le document sous sa forme honnête la plus compacte : du Markdown plutôt que du HTML, le texte plutôt que le base64 d'un scan du texte, les quatre sections pertinentes plutôt que le manuel entier.

La distinction est simple et vaut d'être retenue : **une conversion est mécanique, une interprétation ne l'est pas.** Payez le modèle pour l'interprétation. Ne le payez pas pour être un analyseur syntaxique.

## À quoi cela ressemble en pratique

Quatre changements, à peu près par ordre d'économie :

1. **Convertir le fichier là où il est.** Un navigateur contient un analyseur. Une conversion qui se fait dans la page coûte zéro jeton et n'envoie le document nulle part, ce qui est autant une réponse de confidentialité que de coût.
2. **Regarder les documents dans une visionneuse, pas dans une transcription.** « Réécris-le que je vérifie » est l'habitude chère. Le rendu est gratuit.
3. **Passer les documents par une adresse.** Un outil qui renvoie un lien garde le document hors de l'historique, et hors de chaque tour suivant.
4. **Retirer avant l'envoi ce dont personne n'a besoin.** Pages liminaires, navigation, formules répétées et images intégrées sont toutes des jetons, et pour la plupart des questions aucune ne porte la réponse.

Les quinze conversions proposées ici tournent dans le navigateur, et un connecteur offre les mêmes conversions à un assistant comme des appels d'outil qui renvoient un lien et non un document. C'est construit ainsi à cause de l'arithmétique ci-dessus, et non l'inverse : un document qui n'entre jamais dans la transcription est le seul dont vous soyez certain de ne pas payer deux fois. Pour la variante par interface, [convertir des documents avec une API](/blog/converting-documents-with-an-api) montre comment le faire depuis un script, où le compte de jetons est nul par construction.
