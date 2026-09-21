---
title: "Les meilleurs convertisseurs de documents en ligne en 2026 : où part vraiment votre fichier"
description: "Les convertisseurs de documents en ligne comparés sur le sort du fichier : outils dans le navigateur qui ne téléversent rien, services hébergés et rétention"
date: 2026-09-07
tag: Conversion
keywords: convertisseur de documents en ligne, meilleur convertisseur de documents en ligne, convertir un document sans téléverser, convertisseur de fichiers dans le navigateur, convertisseur de fichiers gratuit en ligne, api de conversion de documents, convertisseur de documents hors ligne, combien de temps un convertisseur garde mes fichiers
---

Choisir un convertisseur de documents en ligne ressemble à une comparaison de fonctionnalités et relève en réalité d’une question de géographie. Votre fichier reste sur votre machine, ou bien il part sur celle de quelqu’un d’autre. Tout le reste — la liste des formats, la zone de glisser-déposer, la jolie barre de progression — se pose sur cette unique différence, et aucune page tarifaire ne la met dans le tableau.

### En bref

Choisissez selon la destination du fichier, pas selon le nombre de formats affichés. Un convertisseur qui tourne dans votre navigateur traite le fichier sur votre propre machine, ne téléverse rien, et vous permet de le prouver en regardant un onglet réseau vide : c’est la valeur par défaut correcte pour tout ce que vous n’avez pas écrit pour le public. Un service côté serveur comme CloudConvert, Convertio, Zamzar ou FreeConvert gère des formats qu’un navigateur ne sait pas traiter, au prix d’un téléversement du document et de l’acceptation d’une politique de rétention. Pandoc est la réponse hors ligne quand la conversion doit se répéter, s’exécuter dans une chaîne automatisée ou toucher des formats qu’aucune page web ne prend en charge.

## La question que personne ne met sur la page tarifaire

La page d’accueil de chaque convertisseur se bat sur les trois mêmes promesses : c’est rapide, c’est gratuit, et des centaines de formats sont pris en charge. Aucune des trois ne vous dit si le document que vous vous apprêtez à convertir quitte les lieux. C’est pourtant la seule affirmation qui ait une conséquence, et elle se trouve généralement à quatre clics de là, dans une page de confidentialité, formulée comme un réconfort plutôt que comme un fait.

Un convertisseur peut tenir trois positions honnêtes. Il peut faire le travail dans votre navigateur, auquel cas rien n’est téléversé et il n’y a rien à conserver. Il peut envoyer le fichier sur un serveur, l’y convertir et le supprimer selon un calendrier, auquel cas le calendrier est le produit. Ou bien il peut tourner sur votre machine en dehors du navigateur, auquel cas le réseau n’intervient pas du tout et vous payez en installation. La plupart des outils appartiennent au deuxième groupe. La plupart des gens s’imaginent dans le premier.

La deuxième chose que personne n’annonce, c’est ce que vous récupérez. « Converti » n’est pas un résultat unique. Un convertisseur peut vous rendre un fichier complet qui s’ouvre seul, un fragment qui réclame un habillage que vous devrez écrire, ou une archive contenant le document plus un dossier d’images et une feuille de style qu’il s’attend à trouver à côté. Les trois portent le même mot sur le bouton. Seul le premier survit à un envoi par courriel.

Et la troisième est plus subtile : un convertisseur peut produire une sortie qui a l’air correcte sur la page où vous l’avez convertie et fausse partout ailleurs, parce que le résultat dépend discrètement d’une police ou d’une feuille de style récupérée sur un réseau dont le destinataire ne dispose peut-être pas. Un fichier qui a besoin du réseau pour ressembler à lui-même n’est pas autonome, quoi qu’ait laissé entendre le bouton de téléchargement.

## Comparatif rapide : l’aide-mémoire

| Outil | Idéal pour | Capacité principale | Prix |
| --- | --- | --- | --- |
| TransformPipe | Convertir un document sans le téléverser | Conversion dans le navigateur, export HTML autonome, API et CLI | Gratuit |
| Pandoc | Une conversion reproductible entre de nombreux formats | Formats balisés, HTML, bureautique, TeX et livres numériques, gabarits, `--standalone`, `--embed-resources` | Gratuit, GPL |
| LibreOffice (headless) | Les formats bureautiques hors ligne, en masse | `--convert-to` pour Word, Excel, PowerPoint, ODF, PDF | Gratuit, MPL 2.0 |
| CloudConvert | Une API sur laquelle bâtir | Étendue des formats, choix de région, fichiers supprimés après traitement | Palier gratuit : 10 conversions/jour |
| Convertio | Une conversion ponctuelle d’un format inhabituel | Liste de formats très large, web et API | Palier gratuit, puis à partir de 11,99 $/mois |
| Zamzar | Une conversion occasionnelle façon bureau | Service ancien et stable, web et API | Gratuit : 2 fichiers/24 h, puis à partir de 12 $/mois |
| FreeConvert | Conversion de médias et de documents à la minute | Compté en minutes de conversion plutôt qu’en fichiers | Gratuit : 20 minutes/jour, puis à partir de 12,99 $/mois |
| Adobe Acrobat en ligne | Tout ce qui a le PDF en entrée ou en sortie | Export et import PDF avec le moteur d’Acrobat lui-même | Outils gratuits limités ; le reste dans un abonnement |
| Google Docs / Microsoft 365 | Une conversion que vous payez déjà | Import `.docx`, export HTML, PDF, texte brut | Inclus avec le compte |
| Gotenberg | Une conversion côté serveur que vous hébergez | API Docker sans état enveloppant LibreOffice et Chromium | Gratuit, MIT |
| Des bibliothèques dans votre code | Une conversion à l’intérieur d’une application | marked, Turndown, mammoth, Papa Parse et leurs équivalents | Gratuit, open source |
| Enregistrer sous / Imprimer en PDF du navigateur | La conversion déjà installée chez vous | Enregistre une page en PDF ou en HTML plus un dossier de ressources | Gratuit |

## Les meilleurs convertisseurs de documents en ligne en 2026

### TransformPipe — le meilleur pour convertir un document sans le téléverser

TransformPipe convertit du Markdown en HTML, et du HTML, du Word `.docx`, du CSV, du TSV et du JSON en Markdown, dans le navigateur. Hors connexion au compte, le fichier est lu, analysé et rendu sur votre propre machine, et n’est envoyé nulle part. L’export HTML est un fichier complet unique, styles en ligne, ce qui veut dire qu’il s’ouvre de la même façon sur un portable sans connexion que chez vous.

| Avantages | Inconvénients |
| --- | --- |
| Rien n’est téléversé tant que vous n’êtes pas connecté, et l’onglet réseau le prouve | C’est le navigateur qui travaille : un très gros fichier dépend de la machine |
| L’export HTML est un fichier unique qui ne demande rien au réseau | Pas un convertisseur universel : ni vidéo, ni audio, ni images, ni PDF vers Word |
| Le HTML brut traverse un nettoyeur à liste d’autorisation fixe | Un document à la fois, ou plusieurs fusionnés en un — pas la construction d’un site |
| La même conversion existe en API REST, en CLI, en GitHub Action et en serveur MCP | Aucun langage de gabarit pour des mises en page sur mesure |

**Prix :** gratuit. Un compte ajoute l’historique, le partage et l’accès à l’API, gratuitement aussi.

**Détails techniques et fonctionnalités**

- Markdown vers HTML en GitHub Flavored Markdown : tableaux, listes de tâches, texte barré, liens automatiques, code délimité
- HTML, `.docx`, CSV, TSV et JSON vers Markdown sur la même page, sans installation ni compte
- La sortie est un document complet — doctype, en-tête, `<style>` en ligne — ou du `.md` brut, ou une impression en PDF via la boîte de dialogue du navigateur
- Le HTML brut présent en entrée est filtré selon une liste d’autorisation unique, dans le navigateur comme sur le serveur
- Une interface en ligne de commande sans dépendances et une GitHub Action pour la même conversion dans une chaîne automatisée

**Pour qui ?** Quiconque convertit un document qui n’est pas déjà public : un contrat, le brouillon d’un client, un plan interne, l’export d’une application de notes. C’est aussi le chemin le plus court pour la tâche précise qui consiste à transformer du Markdown en page que l’on peut envoyer, ce qui est [comparé en détail ailleurs face aux bibliothèques et aux outils de bureau](/blog/best-markdown-to-html-converters).

### Pandoc — le meilleur pour une conversion reproductible entre de nombreux formats

Pandoc est un convertisseur de documents en ligne de commande écrit en Haskell, qui lit et écrit une quarantaine de formats, dont Markdown, HTML, LaTeX, EPUB, Word et OpenDocument. Il tourne sur votre machine, donc aucun fichier ne la quitte, et c’est le seul outil ici dont la matrice de formats rivalise vraiment avec celle des services hébergés.

| Avantages | Inconvénients |
| --- | --- |
| Convertit entre des formats dont aucun service web ne s’embarrasse | Exige une installation et un terminal |
| Tourne entièrement hors ligne : le réseau ne fait pas partie de la question de confiance | Gabarits, filtres et drapeaux de dialecte forment un vrai apprentissage |
| `--standalone` et `--embed-resources` produisent un fichier complet unique | Aucun nettoyage : le HTML brut passe tel quel |
| Scriptable, donc la même conversion se répète à l’identique le mois prochain | Ses dialectes Markdown s’écartent du GFM d’une façon qui surprend |

**Prix :** gratuit, sous licence GPL.

**Détails techniques et fonctionnalités**

- Lecteurs et écrivains sélectionnés explicitement, dont `commonmark`, `gfm`, `html`, `docx` et `latex`
- `--standalone` enveloppe la sortie dans un document complet ; `--embed-resources` met images et CSS en ligne
- `--template` et les filtres Lua pour réécrire le document en cours de conversion
- `--sandbox` restreint l’accès au système de fichiers lors de la conversion d’un fichier auquel vous ne faites pas confiance
- `--reference-doc` transporte une mise en forme Word dans la sortie `.docx`
- La liste des formats est asymétrique : il lit l'[EPUB](/blog/convert-epub-to-markdown) mais écrit le PowerPoint sans le lire, donc [une présentation demande une autre voie](/blog/convert-powerpoint-to-markdown)

**Pour qui ?** Quiconque convertit plus d’une fois : un build de documentation, une chaîne de production de manuscrit, un processus de publication. Pour un seul fichier et une personne qui l’attend, Pandoc en fait plus que la tâche ne demande, et [les options plus légères méritent d’être connues](/blog/pandoc-alternatives-for-markdown-to-html) avant d’installer un binaire Haskell.

### LibreOffice headless — le meilleur pour les formats bureautiques hors ligne

LibreOffice est une suite bureautique, et son mode en ligne de commande est un convertisseur de documents que la plupart des gens ont déjà installé sans le savoir. `soffice --headless --convert-to` lit et écrit des fichiers Word, Excel, PowerPoint et OpenDocument, et exporte du PDF, sur votre propre machine.

| Avantages | Inconvénients |
| --- | --- |
| Gère nativement les formats Microsoft, hors ligne, en masse | Une installation très volumineuse pour un outil de conversion |
| Gratuit et open source, sans compte ni téléversement | Une mise en page Word complexe ne survit pas toujours à l’aller-retour |
| Scriptable sur un répertoire entier | Son export HTML est daté, et ce n’est pas un document à envoyer |
| Le moteur que bien des services hébergés font tourner derrière leur API | Un processus à la fois, sauf gestion soignée des profils utilisateur |

**Prix :** gratuit, sous licence MPL 2.0.

**Détails techniques et fonctionnalités**

- `--convert-to` avec un filtre de destination, et `--outdir` pour la sortie
- Lit et écrit `.docx`, `.xlsx`, `.pptx`, les formats ODF et le CSV
- Export PDF avec ses propres options, PDF/A compris
- Fonctionne sous Windows, macOS et Linux, et dans un conteneur

**Pour qui ?** Les équipes qui convertissent des documents bureautiques en volume, quand ces documents ne doivent pas quitter le réseau. Si vous avez déjà collé un `.docx` dans un convertisseur web pour en extraire le texte, voici la même chose sans rien téléverser.

### CloudConvert — le meilleur convertisseur côté serveur sur lequel bâtir

CloudConvert est un service de conversion hébergé dont le centre de gravité est une API, et non une addition tardive. Votre fichier est téléversé, converti dans un conteneur, puis renvoyé. C’est l’option côté serveur la plus claire sur ce qui arrive au fichier pendant son séjour.

| Avantages | Inconvénients |
| --- | --- |
| Une API documentée, dont l’interface web n’est qu’un client | Le fichier est téléversé : c’est le modèle, pas un réglage |
| Annonce que les fichiers ne sont gardés que pour le traitement et supprimés aussitôt après | Le palier gratuit est assez étroit pour tenir de l’essai plutôt que de l’offre |
| La région de traitement peut être choisie | Les crédits sont une unité à traduire dans votre propre charge de travail |
| Chaque tâche s’exécute dans un conteneur isolé distinct | Aucun mode hors ligne, par définition |

**Prix :** le palier gratuit offre 10 conversions par jour. Il plafonne le fichier à 1 Go, le traitement à cinq minutes et les tâches simultanées à cinq. L’usage payant se vend en paquets de crédits ou par abonnement, tarifé au volume sur un curseur, avec une offre entreprise sur mesure au-dessus (vérifié sur cloudconvert.com/pricing, le 8 septembre 2026).

**Détails techniques et fonctionnalités**

- API REST dont les travaux se composent de tâches d’import, de conversion et d’export
- Documents, tableurs, présentations, images, audio, vidéo et archives
- Choix de la région où s’exécute la conversion (vérifié sur cloudconvert.com/security, le 8 septembre 2026)
- SSL pour les transferts, et une politique affichée d’absence de stockage permanent

**Pour qui ?** Les développeurs qui ont besoin d’un point d’entrée de conversion couvrant des formats hors de portée d’un navigateur, et qui peuvent accepter un téléversement pour les documents concernés. La clarté de la déclaration de rétention est la raison de le préférer au segment financé par la publicité.

### Convertio — le meilleur pour convertir ponctuellement un format inhabituel

Convertio est un service basé sur le navigateur doté de l’une des listes de formats les plus larges qui soient. Vous déposez un fichier, il est téléversé, converti sur le serveur, et vous téléchargez le résultat. C’est l’outil qui, le plus fiablement, a déjà entendu parler de l’extension que vous tenez.

| Avantages | Inconvénients |
| --- | --- |
| Une couverture de formats qui dépasse largement les documents | Chaque conversion est un téléversement, y compris pour le privé |
| Aucune installation, fonctionne sur un téléphone comme sur un portable | Les fichiers convertis restent 24 heures sur le service, selon sa propre politique |
| Les mêmes conversions disponibles via une API | L’usage gratuit est plafonné par taille de fichier plutôt que clairement par nombre |
| Le style et la structure de la sortie sont ses choix, pas les vôtres | Les paliers payants visent un volume que vous n’avez peut-être pas |

**Prix :** l’usage sans inscription est plafonné à une taille de fichier de 1 Go. Les offres payantes commencent à 11,99 $ par mois pour Lite, 22,99 $ pour Basic et 44,99 $ pour Pro en facturation mensuelle. Les tarifs annuels sont plus bas, et il existe une offre sur mesure au-dessus (vérifié sur convertio.co/pricing, le 8 septembre 2026).

**Détails techniques et fonctionnalités**

- Conversions de documents, d’images, d’audio, de vidéo, d’archives, de livres numériques, de polices et de présentations
- Interface web plus une API REST au même catalogue
- Annonce : fichiers téléversés supprimés immédiatement, fichiers convertis après 24 heures (vérifié sur convertio.co, le 8 septembre 2026)
- Les conversions font la queue côté serveur : un gros fichier n’est donc pas limité par votre machine

**Pour qui ?** Quiconque détient un fichier dans un format que rien d’autre ne lit, et n’a aucun problème de confidentialité : un jeu de données public, une police, une vidéo, un document déjà en ligne. C’est le mauvais outil pour un document qui n’a pas encore été publié.

### Zamzar — le meilleur pour une conversion occasionnelle à limite gratuite claire

Zamzar est l’un des convertisseurs en ligne les plus anciens et l’un des rares à énoncer son quota gratuit sous forme de nombre plutôt que d’impression. Le modèle est celui de Convertio : téléverser, convertir sur le serveur, télécharger.

| Avantages | Inconvénients |
| --- | --- |
| La limite gratuite est un nombre de fichiers annoncé, pas une vague clause d’usage raisonnable | Deux fichiers par jour est un quota réellement étroit |
| La rétention est documentée en phrases claires | Une conversion échouée fait garder votre original plus longtemps |
| Une API à côté de l’interface web | Le téléversement est inévitable |
| Simple, stable et prévisible | Le plafond de taille gratuit exclut beaucoup de documents réels |

**Prix :** le service gratuit convertit jusqu’à 2 fichiers par tranche de 24 heures, avec une limite de téléversement de 50 Mo. Les offres payantes sont à 12 $ par mois pour Basic (50 conversions de bureau par jour, fichiers de 200 Mo), 19 $ pour Pro (100 par jour, 400 Mo) et 39 $ pour Business (500 par jour, 2 Go). Vérifié sur zamzar.com et secure.zamzar.com, le 8 septembre 2026.

**Détails techniques et fonctionnalités**

- Documents, images, audio, vidéo, livres numériques et archives
- Un fichier converti est conservé au maximum 24 heures pour que vous le téléchargiez ; si une conversion échoue, l’original est gardé jusqu’à sept jours pour le support (vérifié sur zamzar.com/faq, le 8 septembre 2026)
- API de conversion au même catalogue de formats
- Des plafonds de taille par offre plutôt qu’une limite globale unique

**Pour qui ?** Ceux qui convertissent un fichier de temps à autre et veulent savoir exactement ce que permet le palier gratuit. La conservation de sept jours en cas d’échec est le détail à peser avant de téléverser quoi que ce soit de sensible.

### FreeConvert — le meilleur quand votre travail se compte en minutes

FreeConvert couvre le même terrain que Convertio et Zamzar, et compte différemment : l’unité est la minute de conversion plutôt que le fichier. Cela convient aux gros médias et pénalise les conversions longues et isolées.

| Avantages | Inconvénients |
| --- | --- |
| Un quota gratuit quotidien mesuré en minutes, pas en fichiers | Un plafond de durée par fichier en usage gratuit arrêtera une grosse conversion en chemin |
| L’usage web et l’usage API puisent dans le même quota | Côté serveur : le fichier est donc téléversé |
| Les paliers supérieurs relèvent nettement le plafond de taille | Les minutes sont difficiles à estimer avant de commencer |
| Aucune installation, aucune dépendance de bureau | Les conditions de rétention demandent à être cherchées |

**Prix :** l’usage gratuit est de 20 minutes de conversion par jour, web et API confondus, avec une limite de 5 minutes de conversion par fichier. Les offres payantes sont à 12,99 $ par mois pour Basic, 24,99 $ pour Standard et 29,99 $ pour Pro, avec une tarification à la demande au-dessus (vérifié sur freeconvert.com/pricing, le 8 septembre 2026).

**Détails techniques et fonctionnalités**

- Documents, images, audio, vidéo, archives et livres numériques
- Tailles maximales de fichier par offre, de 1,5 Go sur Basic jusqu’à 20 Go sur le palier à la demande (vérifié sur freeconvert.com/pricing, le 8 septembre 2026)
- Une seule API pour tout le catalogue
- Le temps de conversion, et non le nombre de fichiers, comme unité de facturation

**Pour qui ?** Quiconque a des conversions longues plutôt que nombreuses — vidéo, audio, gros tableurs — et s’accommode du téléversement.

### Adobe Acrobat en ligne — le meilleur quand le PDF est l’un des deux bouts

Les outils en ligne d’Adobe convertissent vers et depuis le PDF avec le moteur d’Acrobat lui-même, ce qui compte parce que le PDF est le format le plus susceptible d’être abîmé par la réimplémentation d’un tiers. Ces outils tournent dans un navigateur et traitent le fichier sur les serveurs d’Adobe.

| Avantages | Inconvénients |
| --- | --- |
| La conversion PDF la plus fidèle, parce que c’est celle d’Adobe | La connexion au compte arrive vite dès qu’on dépasse un usage léger |
| Gère PDF vers Word, Word vers PDF et les paires habituelles | Téléverse le document chez Adobe |
| Cohérent avec la sortie de l’application de bureau | Pas un convertisseur généraliste : le PDF est toujours l’un des deux bouts |
| Aucune installation pour les outils en ligne | Facturé dans un abonnement, pas à la conversion |

**Prix :** plusieurs outils en ligne sont gratuits avec des limites d’usage, et un accès plus complet est inclus dans un abonnement Acrobat dont le prix dépend de l’offre, de la région et de la durée — allez chercher sur adobe.com le chiffre qui vous concerne plutôt que de faire confiance à un nombre dans un article.

**Détails techniques et fonctionnalités**

- Création, export, fusion et compression de PDF depuis le navigateur
- Conversion vers et depuis Word, Excel, PowerPoint et les images
- Connexion exigée au-delà d’une faible dose d’usage gratuit
- Les mêmes conversions disponibles dans l’application de bureau et ses API

**Pour qui ?** Quiconque a la fidélité du PDF pour seul enjeu : un formulaire, un document signé, un fichier prêt pour l’impression. Ce n’est pas l’outil pour extraire le texte d’un document que vous préféreriez qu’Adobe n’ait pas.

### Google Docs et Microsoft 365 — le convertisseur que vous payez déjà

Si vous avez l’un de ces comptes, vous possédez déjà un convertisseur de documents. Téléversez un `.docx`, ouvrez-le, exportez-le en HTML, en PDF ou en texte brut. Personne ne les vend comme des convertisseurs, et pour bon nombre de tâches ponctuelles ce sont les chemins les plus courts.

| Avantages | Inconvénients |
| --- | --- |
| Déjà disponible, et à qui vous confiez déjà vos documents | Le fichier est téléversé par définition : c’est ce qu’est le compte |
| Gère la mise en forme Word mieux que la plupart des tiers | L’export HTML de Google Docs arrive en archive, images en fichiers séparés |
| Aucun nouveau fournisseur à évaluer | Le HTML exporté porte le balisage et les noms de classe de l’éditeur |
| Gratuit avec le compte que vous avez | Malcommode au-delà d’une poignée de fichiers |

**Prix :** inclus avec le compte Google ou Microsoft que vous avez déjà.

**Détails techniques et fonctionnalités**

- Import et export de `.docx`, `.xlsx`, `.pptx`, PDF, texte brut et HTML
- Choix d’export faits document par document dans un menu, pas par script
- Le document reste dans le stockage du compte après la conversion, sauf si vous le supprimez
- Disponible sur mobile comme sur ordinateur

**Pour qui ?** Quiconque convertit un document qui vit déjà dans ce compte. S’il n’y vit pas encore, l’y téléverser pour en tirer du HTML est un grand pas pour une petite tâche.

### Gotenberg — la meilleure conversion côté serveur que vous hébergez vous-même

Gotenberg est une API de conversion sans état distribuée sous forme d’image Docker, qui enveloppe LibreOffice et Chromium derrière des points d’entrée HTTP. C’est le terrain intermédiaire entre un service hébergé et une installation locale : une API de la forme de celle de CloudConvert, qui tourne sur du matériel que vous contrôlez.

| Avantages | Inconvénients |
| --- | --- |
| Une API HTTP sans qu’aucun document ne quitte votre infrastructure | C’est vous qui l’exécutez, le surveillez et le mettez à jour |
| Sans état par conception : aucune politique de rétention à lire | Liste de formats plus étroite que celle des services hébergés |
| Gratuit et open source | Demande Docker et un endroit où le poser |
| Coût prévisible : votre propre calcul | Pas un outil pour une personne avec un fichier |

**Prix :** gratuit, sous licence MIT.

**Détails techniques et fonctionnalités**

- Points d’entrée HTTP pour la conversion de documents bureautiques, le HTML vers PDF et les opérations sur PDF
- LibreOffice pour les formats bureautiques, Chromium pour le rendu HTML
- Distribué en conteneur, configuré par drapeaux et variables d’environnement
- Aucune persistance entre les requêtes

**Pour qui ?** Les équipes techniques qui ont besoin de la conversion comme service à l’intérieur d’un produit ou d’un intranet, avec une réponse de conformité qui ne dépend pas du calendrier de suppression d’un tiers.

### Des bibliothèques dans votre propre code — quand la conversion est une fonctionnalité

Si la conversion a lieu à l’intérieur d’un logiciel que vous écrivez, la réponse honnête est généralement une bibliothèque plutôt qu’un convertisseur de cette page : marked ou markdown-it pour Markdown vers HTML, Turndown pour HTML vers Markdown, mammoth pour `.docx` vers HTML, un analyseur CSV pour les données tabulaires.

| Avantages | Inconvénients |
| --- | --- |
| Rien ne quitte le processus, encore moins la machine | Vous écrivez l’habillage, la gestion d’erreurs et la mise en forme |
| Aucun coût par conversion et aucune limite de débit | Le nettoyage est votre responsabilité dans la plupart d’entre elles |
| Versionnées dans votre fichier de verrouillage : le comportement ne change pas sous vos pieds | Une bibliothèque par direction : une matrice devient plusieurs dépendances |
| Gratuites et open source | Aucune aide du tout pour le PDF, la vidéo ou les formats exotiques |

**Prix :** gratuit, open source — marked et Turndown sont sous licence MIT.

**Détails techniques et fonctionnalités**

- Markdown vers HTML : marked, markdown-it, remark en JavaScript ; des équivalents dans tous les autres langages
- HTML vers Markdown : Turndown, avec des règles redéfinissables élément par élément
- `.docx` vers HTML : mammoth, qui associe délibérément des styles plutôt que de reproduire le balisage de Word
- Le nettoyage est une étape séparée que vous ajoutez, pas un défaut dont vous héritez

**Pour qui ?** Les développeurs dont le produit convertit des documents dans le cadre de son travail. Lisez [ce que le HTML brut peut transporter à travers une conversion](/blog/sanitising-markdown-safely) avant d’afficher le résultat de l’une d’elles dans le navigateur de quelqu’un.

### Enregistrer sous et Imprimer en PDF du navigateur — le convertisseur déjà installé

Tous les navigateurs convertissent des documents. `Ctrl+P` vers un PDF, ou Enregistrer la page sous, vous donnera un artefact lisible de presque tout ce que vous pouvez ouvrir. Cela ne coûte rien, ne téléverse rien et n’exige aucune décision.

| Avantages | Inconvénients |
| --- | --- |
| Gratuit, installé, hors ligne et instantané | Le PDF perd la structure : les titres deviennent visuels, pas sémantiques |
| Rien n’est téléversé | « Enregistrer la page, complète » produit un fichier plus un dossier de ressources |
| Fonctionne pour tout ce que le navigateur sait afficher | Les sauts de page tombent où ils tombent |
| Aucun compte, aucune limite | Non scriptable dans un build |

**Prix :** gratuit.

**Pour qui ?** Quiconque a besoin d’une copie figée et lisible de quelque chose, tout de suite, et n’a pas besoin que la sortie soit modifiable ou structurée ensuite.

## Ce que les pages tarifaires omettent

Les tableaux comparatifs se construisent à partir des champs que les éditeurs acceptent de publier. Ce qui décide si une conversion était une bonne idée n’en fait généralement pas partie.

**Si le fichier est téléversé, tout simplement.** C’est la première question, et elle n’est presque jamais dans le tableau. « En ligne » a fini par vouloir dire « sur le serveur de quelqu’un », mais un navigateur est un environnement d’exécution, et un convertisseur écrit pour y tourner fait le travail sur votre machine. La différence n’est pas une promesse à croire sur parole : ouvrez les outils de développement, surveillez l’onglet réseau, convertissez le fichier et regardez si quelque chose sort. Un convertisseur côté navigateur ne vous montre rien d’autre que la page déjà chargée. Un convertisseur côté serveur vous montre votre document partir, et cette même habitude d’observer au lieu de croire est [la façon de trancher si un convertisseur en ligne convient au document que vous avez sous les yeux](/blog/is-an-online-converter-safe), au lieu de lire le cadenas comme une réponse.

**Combien de temps il est conservé une fois téléversé.** La rétention est une politique, c’est-à-dire une phrase que quelqu’un a écrite et peut réécrire. Les bons services l’énoncent clairement. CloudConvert dit que les fichiers ne sont gardés que pour le traitement et supprimés aussitôt après. Convertio dit que les fichiers téléversés sont supprimés immédiatement et les fichiers convertis après 24 heures. Zamzar conserve un fichier converti au maximum 24 heures, et garde l’original jusqu’à sept jours quand une conversion échoue, pour que le support puisse l’examiner. Chacune de ces politiques est raisonnable et aucune n’est égale à zéro. La conversion côté navigateur n’a pas de politique de rétention parce qu’il n’y a rien à conserver, ce qui est une réponse d’une autre catégorie.

**Si ce que vous récupérez est un fichier complet.** Trois choses arrivent sous le même bouton de téléchargement. Un document complet s’ouvre seul et ressemble à lui-même. Un fragment — des titres et des paragraphes sans `<html>`, sans `<head>` ni styles autour — s’affiche en texte noir sur toute la largeur par défaut et paraît cassé à celui à qui vous l’avez envoyé. Une archive contenant un fichier HTML, une feuille de style et un dossier d’images est un site dans un sac : déplacez le HTML seul et les images disparaissent. Si la sortie doit voyager par courriel ou par messagerie, seul le premier des trois fonctionne.

**Si le résultat a besoin du réseau pour être correct.** Un convertisseur qui lie une police ou une feuille de style depuis un réseau de diffusion de contenu a produit un fichier qui s’affiche bien sur votre bureau et se dégrade dans un train. Il raconte aussi à celui qui l’ouvre quelque chose sur le parcours du fichier. Un export autonome porte ses styles en ligne et ne demande rien. C’est un fichier plus gros, et c’est la seule version qui se comporte partout de la même façon. Un convertisseur dont la sortie a besoin du réseau pour s’ouvrir correctement ne propose pas un fichier autonome, quel que soit le nom de la boîte de dialogue d’export — c’est exactement [pourquoi un lien et un fichier ne sont pas le même livrable](/blog/share-a-markdown-document-as-a-link).

**Ce que le palier gratuit compte réellement.** Les paliers gratuits d’ici comptent quatre choses différentes. Zamzar compte des fichiers : 2 par 24 heures. CloudConvert compte des conversions : 10 par jour, avec cinq tâches simultanées. FreeConvert compte des minutes : 20 par jour, et pas plus de 5 sur un seul fichier. Convertio plafonne la taille du fichier pour l’usage sans inscription. Aucun de ces compteurs n’est comparable à un autre, et celui qui compte est celui sur lequel votre charge de travail réelle bute. Vingt minutes par jour, c’est généreux pour des documents et maigre pour de la vidéo ; deux fichiers par jour, c’est correct pour une personne et inutile pour une équipe.

**Ce que le format ne peut pas transporter.** Toute conversion perd quelque chose dans une direction. Les commentaires Word, le suivi des modifications et les zones de texte n’ont pas d’équivalent en Markdown. Les cellules fusionnées et les formules d’un tableur ne survivent pas au passage en tableau. Le PDF abandonne complètement sa structure et il faut la lui deviner. Un convertisseur ne peut pas réparer cela et les bons ne prétendent pas le contraire : ils font un choix défendable et vous le laissent voir. Les tableaux sont l’endroit où cela se voit en premier et le plus nettement, et [ce qui survit à la conversion d’un tableau](/blog/markdown-tables-that-survive-conversion) mérite d’être vérifié sur un fichier représentatif avant d’en engager cent.

**Qui d’autre est dans la chaîne.** Un convertisseur hébergé tourne sur une infrastructure qu’il loue, dans une région qu’il choisit, avec des sous-traitants qu’il liste quelque part. C’est normal, et c’est aussi une liste de parties plus longue que « moi et une page web ». Pour un README public, cela n’a pas d’importance. Pour un contrat non signé, une note médicale ou un plan produit non annoncé, c’est toute la décision, et ce n’est pas une décision qu’un tableau de fonctionnalités vous aidera à prendre.

## Comment choisir

1. **Commencez par imaginer ce document dans une fuite.** S’il était gênant, contractuel ou réglementé, la conversion doit avoir lieu sur votre machine — dans le navigateur ou hors ligne — et la liste des formats n’a aucune importance tant que ce point n’est pas réglé. Trancher cela en premier élimine l’essentiel du marché d’un coup et vous épargne la comparaison de paliers que vous n’utiliserez pas.
2. **Lisez la phrase sur la rétention, pas le titre sur la confidentialité.** « Nous prenons votre vie privée au sérieux » n’est pas une politique ; « les fichiers convertis sont supprimés après 24 heures » en est une. Si vous ne trouvez pas de phrase contenant une durée, supposez que la durée est inconnue et traitez le téléversement en conséquence.
3. **Vérifiez ce que compte le palier gratuit avant d’en dépendre.** Fichiers, conversions, minutes et mégaoctets sont quatre compteurs différents, et l’offre qui paraît généreuse sur l’un est restrictive sur le vôtre. Convertissez d’abord votre plus gros fichier réaliste sur le palier gratuit ; c’est là que les plafonds de durée par fichier et les limites de taille remontent à la surface.
4. **Ouvrez la sortie sur une machine qui n’a jamais vu l’outil.** Autre navigateur, autre ordinateur, réseau coupé. Ce seul test attrape d’un coup les fragments, les images manquantes, les feuilles de style liées à un CDN et les exports en archive, et il prend une minute — alors que le découvrir après avoir envoyé le fichier à un client coûte des excuses.
5. **Comptez les installations et les comptes.** Une conversion ponctuelle ne devrait pas demander un gestionnaire de paquets ; une tâche nocturne ne devrait pas demander un onglet de navigateur avec quelqu’un devant. Choisissez en fonction de la fréquence, parce que c’est ce décalage qui fait abandonner un bon outil au bout de quinze jours.
6. **Partez du principe que vous recommencerez.** Si la conversion se répète, il vous faut une API, une CLI ou un binaire scriptable, pas une page que l’on visite. Choisir un outil manuel pour une tâche récurrente est la version la plus répandue de cette erreur, et elle coûte un peu de temps chaque semaine au lieu de beaucoup une seule fois — ce qui explique sa longévité.

## Conclusion

Le meilleur convertisseur de documents en ligne est celui dont la réponse à « où est parti mon fichier ? » est « nulle part ». Pour des documents qui ne sont pas déjà publics, cela veut dire une conversion côté navigateur. C’est ce que [fait TransformPipe](/) : du Markdown vers un fichier HTML autonome, et du HTML, du Word, du CSV, du TSV et du JSON de nouveau vers Markdown, sur votre propre machine, gratuitement. Rien n’est téléversé tant que vous n’êtes pas connecté, et l’onglet réseau le montre. Quand le format dépasse ce qu’un navigateur sait analyser, un service côté serveur est le bon outil et c’est la politique de rétention que vous choisissez vraiment : CloudConvert, Convertio, Zamzar et FreeConvert énoncent toutes la leur, et les différences sont réelles. Et quand la conversion doit se répéter, installez Pandoc ou hébergez Gotenberg, et cessez d’y penser.

## FAQ

### Quel est le meilleur convertisseur de documents en ligne gratuit ?

Pour des documents que vous préféreriez ne pas téléverser, un convertisseur côté navigateur est la meilleure option gratuite, parce qu’il n’y a pas de palier à dépasser ni de fichier à supprimer ensuite. Le convertisseur côté navigateur évoqué plus haut est gratuit pour le Markdown, le HTML, le Word, le CSV, le TSV et le JSON. Pour des formats qu’un navigateur ne sait pas lire, les paliers gratuits de CloudConvert, Zamzar et FreeConvert conviennent tous à un usage occasionnel, à condition d’avoir lu ce que chacun compte.

### Est-il prudent de téléverser des documents vers un convertisseur en ligne ?

Cela dépend entièrement du document et de la politique. Pour tout ce qui est déjà public, le risque est négligeable. Pour un contrat, une note médicale ou un plan non publié, la position sûre est un convertisseur qui ne téléverse pas du tout — soit un outil qui tourne dans votre navigateur, soit un outil installé sur votre machine. Une politique de rétention est une promesse au sujet d’une copie qui existe, pas l’absence de copie.

### Comment convertir un document sans le téléverser ?

Servez-vous d’un convertisseur qui tourne dans le navigateur, ou d’un convertisseur hors ligne. Un outil côté navigateur charge son code une fois puis fait l’analyse localement : vous pouvez ouvrir les outils de développement, convertir le fichier et regarder l’onglet réseau rester vide. Hors ligne, Pandoc et le mode `--convert-to` de LibreOffice ne touchent jamais au réseau.

### Combien de temps les convertisseurs en ligne gardent-ils mes fichiers ?

Les réponses publiées vont de quelques minutes à une semaine. CloudConvert annonce que les fichiers ne sont gardés que pour le traitement et supprimés aussitôt après ; Convertio supprime les téléversements immédiatement et les fichiers convertis après 24 heures ; Zamzar conserve un fichier converti jusqu’à 24 heures, et un original jusqu’à sept jours si la conversion a échoué. Vérifiez la formulation actuelle sur la page de l’éditeur, car ce sont des politiques et les politiques changent.

### Puis-je convertir des documents hors ligne ?

Oui, et c’est généralement la meilleure réponse pour tout ce qui est répété ou sensible. Pandoc convertit entre une quarantaine de formats depuis la ligne de commande, LibreOffice convertit documents bureautiques et PDF avec `--headless --convert-to`, et un convertisseur côté navigateur continue de fonctionner une fois la page chargée. Tous les trois laissent le réseau en dehors de l’affaire.

### Un convertisseur de documents en ligne fonctionne-t-il sur un téléphone ?

Les convertisseurs côté serveur, oui, puisque le téléphone n’a qu’à téléverser et télécharger. Les convertisseurs côté navigateur fonctionnent aussi, mais la conversion s’exécute sur le processeur et la mémoire du téléphone : un très gros document y sera donc plus lent que sur un portable. Pour un document normal — un rapport, un README, un export de tableur — l’un comme l’autre conviennent.

### Quelle est la différence entre un convertisseur et un éditeur de documents ?

Un convertisseur prend un fichier dans un format et vous rend le même contenu dans un autre ; un éditeur est l’endroit où vous l’écrivez. Les éditeurs ont souvent un menu d’export, ce qui en fait des convertisseurs par accident, et l’export est mis en forme à la manière de l’éditeur plutôt qu’à la vôtre. Si vous avez déjà le fichier et qu’il vous faut seulement un autre format, un convertisseur demande moins d’étapes et réserve moins de surprises.
