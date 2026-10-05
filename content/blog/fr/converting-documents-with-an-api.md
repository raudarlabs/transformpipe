---
title: "Convertir des documents avec une API : ce qui en rend une utilisable"
description: "Ce qu'il faut à une API de conversion avant qu'un script lui fasse confiance : un corps de requête honnête, de vraies erreurs, des limites publiées et une URL"
date: 2026-08-13
tag: Automatisation
keywords: api de conversion de documents, api markdown vers html, convertir des documents api rest, api de conversion de fichiers, corps de requête envoi de fichier, idempotence conversion de fichier, limite de taille requête serverless
---

Une conversion qui se produit dans un onglet de navigateur est une conversion faite une fois par une personne. La version intéressante est celle qui se produit à chaque fusion, pour chaque version publiée, pour quatre cents fichiers à deux heures du matin, sans personne pour regarder. Cette version-là est une requête, et les requêtes échouent d'une manière qu'une page ne connaît jamais.

### En bref

Une API de conversion de documents devient utilisable quand quatre choses sont vraies : le corps de la requête est le document plutôt qu'une enveloppe autour d'une enveloppe, un fichier cassé revient sous forme de code de statut accompagné d'une phrase qu'une personne peut lire, les limites sont publiées plutôt que découvertes en production, et le résultat possède une URL que vous pourrez rappeler demain. Envoyez le fichier brut comme corps quand la conversion est nommée dans le chemin ou la requête, et gardez une enveloppe JSON pour l'unique cas où le corps serait autrement ambigu. Prévoyez le plafond de taille de requête avant qu'un fichier de 6 Mo ne le trouve pour vous — sur une plateforme serverless, ce plafond avoisine 4,5 Mo, et il est appliqué au-dessus de votre code, si bien que l'erreur n'est pas la vôtre à formuler.

La friction vient rarement de la conversion elle-même. Analyser du Markdown et émettre du HTML est un problème résolu avec une demi-douzaine de bonnes bibliothèques derrière. Ce qui casse, c'est tout ce qui entoure l'analyse : une étape de build qui poste un fichier et reçoit un 200 au corps vide, une tâche nocturne qui tronque silencieusement à la taille que la plateforme refuse ce jour-là, un réessai qui transforme un document en trois parce que la première tentative a expiré après avoir déjà réussi.

Les échecs ont une forme. Un client ne peut pas distinguer un 500 d'un 413 si la plateforme répond avant l'exécution de votre gestionnaire. Un client ne peut pas distinguer « votre fichier n'est pas du JSON valide » de « notre stockage est en panne » si les deux arrivent sous la même chaîne d'erreur plate. Et un client ne peut pas bien se comporter face à des limites qu'il doit deviner à partir d'une série de refus, ce qui est ce que « contactez-nous pour les détails » signifie en pratique.

Cet article porte donc sur le contrat plutôt que sur l'analyseur. Là où un exemple concret aide, il s'appuie sur notre propre `/api/v1`, parce que c'est celui dont je peux citer exactement la source et les messages de refus plutôt que de les supposer.

## La question du corps de requête, forme par forme

### Comparatif rapide : l'aide-mémoire

Toute API de conversion répond d'abord à une question : où va le fichier ? Les sept réponses ci-dessous couvrent tout l'espace, et le choix décide de la taille maximale d'un document, de la qualité possible de vos messages d'erreur, et de la quantité de code que l'appelant écrit avant que quoi que ce soit ne se convertisse.

| Forme | À quoi ressemble le corps | Idéal pour | Là où elle casse |
| --- | --- | --- | --- |
| Fichier brut comme corps | Le fichier, octet pour octet, avec un `Content-Type` qui le nomme | Une conversion nommée : un fichier entrant, un document sortant | Les métadonnées n'ont nulle part où aller sinon la chaîne de requête |
| Enveloppe JSON | `{"name": "…", "markdown": "…"}` | Des appelants ayant plusieurs champs à envoyer | Le document doit être échappé dans une chaîne JSON ; le corps devient ambigu quand le document est lui-même du JSON |
| `multipart/form-data` | Une partie fichier plus des parties texte | Les formulaires de navigateur, plusieurs fichiers à la fois | Chaque client a besoin d'un encodeur multipart ; l'analyse coûte de la mémoire côté serveur |
| Base64 dans du JSON | `{"file": "PGh0bWw+…"}` | Les formats binaires via des clients qui ne parlent que JSON | Environ un tiers plus lourd sur le fil, contre un plafond de corps fixe |
| Une URL que le serveur va chercher | `{"url": "https://…"}` | Des documents déjà sur le réseau | Le serveur devient un client HTTP pointé vers ce que vous nommez, ce qui est un risque de falsification de requête |
| Envoi direct, puis une référence | `{"blob": "uploads/ab12…"}` | Les fichiers au-delà du plafond de requête | Deux allers-retours, une URL signée à émettre, et des envois orphelins à balayer |
| Un tableau de lot | `{"documents": [ … ]}` | Des centaines de petits fichiers | Un seul mauvais fichier dans le tableau impose une forme de réponse à échec partiel que personne n'aime écrire |

Rien de tout cela n'est faux dans l'abstrait. L'erreur consiste à en choisir deux pour le même point de terminaison et à laisser le type de contenu décider laquelle, sans le dire — un appelant qui poste un fichier `.json` à convertir, avec l'honnête `Content-Type: application/json`, se fait alors lire comme une enveloppe, se voit reprocher l'absence de champ de document, et se fait refuser pour une raison qui n'a aucun sens vu de l'extérieur.

### Le fichier brut comme corps

Le document est le corps. Rien ne l'enveloppe, rien ne l'échappe, et `curl --data-binary @file.md` constitue tout le client. Le nom et les options voyagent dans la chaîne de requête, où ils sont visibles dans une ligne de journal et faciles à modifier à la main.

| Avantages | Inconvénients |
| --- | --- |
| Aucun échappement : un fichier avec accents graves, guillemets et fins de ligne CRLF arrive inchangé | Les métadonnées doivent vivre dans la chaîne de requête, qui a ses propres limites de longueur |
| Le plus petit corps possible, ce qui compte face à un plafond fixe | Un seul fichier par requête |
| Déboguable par une personne munie de `curl` et d'aucun SDK | Le serveur ne doit pas deviner le format à partir des octets et se tromper |

**Pour qui ?** Pour tout appelant dont la conversion est déjà nommée — par la route, ou par un paramètre de requête tel que `?kind=html-to-markdown`. Si le point de terminaison sait ce que le corps est censé être, le corps n'a aucune raison de s'expliquer.

La nôtre adopte cette forme en premier. `POST /api/v1/documents` lit le corps de la requête comme source, prend le nom du fichier dans `?name=`, et la conversion dans `?kind=`, qui accepte `html-to-markdown`, `csv-to-markdown` et `json-to-markdown` ; sans aucun `kind`, le corps est du Markdown, ce qu'était chaque document avant qu'il n'y ait plus d'une conversion.

```bash
curl -fsS \
  -H "Authorization: Bearer $TP_API_KEY" \
  -H "Content-Type: text/markdown" \
  --data-binary @README.md \
  "https://transformpipe.com/api/v1/documents?name=README.md&share=link"
```

### L'enveloppe JSON

Le document devient un champ chaîne dans un objet. C'est la forme vers laquelle la plupart des clients d'API se tournent par défaut, parce que c'est la forme que tout le reste de leur base de code utilise déjà.

| Avantages | Inconvénients |
| --- | --- |
| Plusieurs champs sans toucher à la chaîne de requête | Le document doit être échappé et rééchappé à travers chaque couche |
| Un seul type de contenu familier pour toute l'API | Un document JSON comme charge utile entre en collision avec l'enveloppe |
| Facile à étendre sans changement cassant | Plus lourd sur le fil dès que les retours à la ligne deviennent des `\n` |

**Pour qui ?** Pour les appelants qui envoient plus qu'un fichier — un nom, un titre, un thème, une destination — et qui génèrent la requête depuis un client typé plutôt que depuis un shell.

La collision mérite d'être nommée, car c'est le bogue que nous avons livré puis corrigé. L'enveloppe était reconnue au type de contenu, si bien que poster un fichier JSON à convertir avec `Content-Type: application/json` se lisait comme une enveloppe, se révélait dépourvu de champ `markdown`, et se faisait refuser. La règle qui a corrigé cela mérite d'être copiée : une conversion nommée possède le corps. Seule la conversion par défaut lit une enveloppe, et toute requête qui nomme ce qu'elle convertit voit son corps traité comme le fichier source, quoi que prétende le type de contenu.

### `multipart/form-data`

La forme qu'un formulaire de navigateur produit sans aide, et donc celle qu'un service de conversion doté d'une interface web tend à exposer.

| Avantages | Inconvénients |
| --- | --- |
| Fichiers et champs ensemble, sans échappement | Chaque client non navigateur a besoin d'un encodeur |
| Plusieurs fichiers dans une requête | Les analyseurs en flux sont délicats ; ceux qui tamponnent sont gourmands en mémoire |
| Type de contenu et nom de fichier arrivent par partie | Difficile à reproduire à la main quand vous déboguez à 2 heures du matin |

**Pour qui ?** Pour les points de terminaison appelés directement par une page, et les clients qui ont réellement plusieurs fichiers par requête. Pour une conversion scriptée d'un fichier unique, c'est du cérémonial sans contrepartie.

### Le base64 dans du JSON

La porte de secours des formats binaires quand le client ne sait parler que JSON. Un `.docx` est une archive zip, il ne peut donc pas entrer dans une chaîne JSON en tant que texte : le base64 est la façon dont il y entre quand même.

| Avantages | Inconvénients |
| --- | --- |
| Du binaire à travers un client qui ne parle que JSON | L'encodage gonfle la charge utile d'environ un tiers |
| Un seul type de contenu pour les formats texte et binaires | Le plafond arrive plus tôt : un fichier de 3,3 Mo fait un corps de 4,4 Mo |
| Trivial à journaliser et à comparer, si vous aimez les journaux gigantesques | Le client ne peut pas distinguer un échec de décodage d'un échec de conversion sans une bonne erreur |

**Pour qui ?** Pour les entrées binaires qui doivent franchir une frontière purement JSON, avec une limite de taille assez basse pour que le gonflement ne morde pas.

### Une URL que le serveur va chercher

L'appelant envoie une adresse ; le serveur télécharge le document et le convertit. Tentant, et c'est la forme au tranchant le plus vif.

| Avantages | Inconvénients |
| --- | --- |
| Aucun envoi du tout pour des documents déjà sur le web | Le serveur devient un client HTTP visant là où l'appelant le dit |
| Contourne entièrement le plafond de corps de requête | Falsification de requête côté serveur, à moins que la récupération ne soit sévèrement restreinte |
| Pratique pour des README publics et des pages publiées | Les échecs se multiplient : DNS, TLS, redirections, 404, expirations, et la conversion elle-même |

**Pour qui ?** Pour les services qui en ont assez besoin pour faire le travail : une liste d'autorisation ou de blocage couvrant les plages d'adresses privées, un plafond de redirections, un plafond d'octets, un délai d'expiration, et des erreurs distinguant « impossible de récupérer » de « impossible de convertir ». Moins que cela, c'est un trou dans votre réseau muni d'une interface JSON.

### L'envoi direct, puis une référence

Le client demande une URL d'envoi de courte durée, dépose le fichier directement dans le stockage d'objets, et poste la clé obtenue. Le document ne traverse jamais la fonction d'API.

| Avantages | Inconvénients |
| --- | --- |
| Le plafond de corps de requête cesse de s'appliquer | Deux allers-retours et un point de terminaison qui émet des jetons |
| Les gros fichiers cessent d'être un cas particulier | Les envois sans requête de suivi demandent un balayage |
| Les lectures peuvent rediriger vers une URL signée, donc les réponses restent petites | Plus de pièces mobiles à rater, et davantage à expliquer |

**Pour qui ?** Pour tout service dont les documents dépassent régulièrement la limite de corps de la plateforme. C'est la réponse honnête à « augmentez la limite » — et c'est un changement dans la façon dont les documents circulent, pas un chiffre plus grand, ce qui explique pourquoi notre propre plafond reste là où la plateforme l'a posé tant que ce travail n'est pas fait.

### Un tableau de lot

Beaucoup de documents, une requête. Séduisant face à une limite de débit par minute, et malcommode partout ailleurs.

| Avantages | Inconvénients |
| --- | --- |
| Des centaines de petits fichiers sans des centaines de requêtes | L'échec partiel exige une forme de réponse, et les clients doivent la gérer |
| Une seule authentification et un seul créneau de limite de débit | Tout le lot partage un unique plafond de corps |
| Moins d'allers-retours sur une liaison lente | Un long lot flirte avec le délai d'expiration de la fonction |

**Pour qui ?** Pour les appelants disposant de nombreux petits documents et de la patience de gérer un tableau de résultats par élément. L'alternative, quand les documents vont ensemble de toute façon, consiste à les fusionner en un seul avant de poster — [ce qui a ses propres problèmes, surtout les niveaux de titre et les collisions d'ancres](/blog/merging-many-markdown-files), mais produit une chose qu'un lecteur peut réellement lire.

## Erreurs et limites qu'un client ne devrait pas avoir à découvrir

Deux tableaux décident si un appelant peut s'automatiser contre vous. Le premier dit ce que signifient vos refus. Le second dit quels sont vos plafonds. Les deux ont leur place dans la documentation, et ni l'un ni l'autre ne devrait se rétro-concevoir depuis une série d'échecs dans le journal d'intégration continue de quelqu'un.

Une erreur est utile quand elle porte trois choses : un code de statut qui signifie ce que dit la spécification, un message sur lequel une personne peut agir, et une forme de corps identique à chaque fois. Un message n'est pas une politesse. C'est la différence entre un échec de build que quelqu'un corrige en une minute et un échec qu'il fait remonter.

Voici le jeu complet de nos propres points de terminaison, volontairement petit :

| Statut | Quand | Ce que dit le corps |
| --- | --- | --- |
| 201 | Le document a été créé | Le document, avec son id, sa taille, son nombre de mots et son URL de partage |
| 400 | Un `kind` inconnu, un corps vide, une valeur `share` autre que `link` ou `people`, un CSV sans ligne, du JSON invalide | Le message de l'analyseur lui-même, y compris l'endroit où il s'est arrêté |
| 400 | `kind=word-to-markdown` | Refusé nommément, avec la page qui le fait dans le navigateur |
| 401 | Aucun identifiant, ou un identifiant inconnu ou révoqué | Deux phrases différentes, selon qu'un en-tête `Authorization` a été envoyé ou non |
| 403 | Le compte n'a plus de place, ou le mandat est en lecture seule | Quelle limite, et où vous en êtes par rapport à elle |
| 404 | Le document de quelqu'un d'autre, ou un id qui n'est pas un UUID | `Not found`, pour les deux, délibérément |
| 410 | La ligne existe et sa source non | La source de ce document est manquante |
| 413 | Un document au-delà du plafond par document | La taille du document et la taille de la limite |
| 429 | Plus de 60 requêtes en une minute | La limite, les secondes à attendre, et un en-tête `Retry-After` |
| 502 | Le magasin de documents n'a pas pu être joint | Que le problème est le nôtre, et la raison sous-jacente |

Trois de ces lignes existent à cause d'un échec précis qui mérite d'être copié. Un id malformé atteignait autrefois Postgres, qui le rejetait, ce qui ressortait en 500 — les id sont donc contrôlés dans leur forme et un id invalide est simplement introuvable. Un fichier stocké manquant et un magasin injoignable arrivaient autrefois sous le même 500 nu ; les séparer en 410 et 502 indique à l'appelant s'il doit renoncer à ce document ou réessayer la requête. Et renvoyer `Not found` à la fois pour « aucun document de ce genre » et « pas le vôtre » n'est pas de la paresse : l'alternative confirme l'existence des documents d'autrui à quiconque dispose d'un générateur d'UUID.

Les limites forment la seconde moitié du contrat :

| Limite | Valeur | Pourquoi ce chiffre |
| --- | --- | --- |
| Par conversion | 10 Mo | La conversion s'exécute dans le navigateur ; c'est donc un jugement sur la machine devant la personne, pas une règle de plateforme |
| Par document conservé | 4 Mo | La plateforme refuse un corps de requête ou de réponse au-delà de 4,5 Mo ; 4 Mo laisse la place au nom et au JSON autour |
| Par compte | 100 Mo et 500 documents | Mille fichiers minuscules coûtent de vraies lignes, les deux sont donc plafonnés |
| Par appelant | 60 requêtes par minute | Comptées par identifiant, pour qu'un script emballé ne dépense pas l'allocation d'une session de navigateur |

Deux propriétés de ce tableau comptent plus que les chiffres. D'abord, chaque plafond nomme ce qui l'impose, et c'est ainsi qu'un appelant sait si demander gentiment servirait à quelque chose. Ensuite, atteindre une limite provoque un refus plutôt qu'une éviction discrète. Cette application supprimait autrefois le document le plus ancien pour rester sous son plafond, ce qui détruisait quelque chose que son propriétaire avait délibérément conservé ; un refus qui indique quoi supprimer à la place est plus désagréable à recevoir et préférable à avoir reçu.

## L'authentification, et ce qu'une clé ne doit pas atteindre

Une API de conversion a besoin d'un identifiant pour une raison qui prime sur toutes les autres : les documents appartiennent à quelqu'un. Limitation de débit, quotas et traitement des abus découlent tous du fait de savoir à qui.

La clé bearer est la base, et cinq propriétés sont à bien traiter.

**Un préfixe reconnaissable.** Les nôtres commencent par `tp_live_`, ce qui permet au serveur de distinguer sa propre clé du jeton de quelqu'un d'autre sans consulter la base, et aux détecteurs de secrets d'en repérer une dans un commit. Une chaîne opaque aléatoire ne fait ni l'un ni l'autre.

**Hachée au repos, montrée une fois.** La clé est affichée à sa création et stockée uniquement sous forme de hachage. Si elle peut être relue depuis une page de compte, elle peut être lue depuis un ticket de support, une capture d'écran et une sauvegarde.

**Révocable en une action.** Une clé que vous ne pouvez pas tuer en dix secondes est une clé que vous ne ferez pas tourner.

**Plus étroite que le compte.** Une de nos clés atteint les documents et les partages, jamais le compte, l'authentification ou les clés elles-mêmes. C'est la propriété qui rend une fuite survivable : une clé volée ne peut ni engendrer son remplacement ni verrouiller le propriétaire dehors.

**Appliquée sur l'identifiant, pas sur une porte.** C'est celle qui nous a mordus. Un mandat en lecture seule issu d'un assistant connecté — le type de jeton [que le connecteur d'un assistant collecte lorsqu'il se connecte](/blog/converting-documents-from-an-assistant), plutôt qu'une clé collée par quelqu'un — était vérifié dans le répartiteur d'outils plutôt que sur l'identifiant, si bien que la promesse de la page de consentement — qu'il ne peut ni enregistrer, ni partager, ni supprimer — était vraie des outils et fausse de l'API que ces outils appellent. Le contrôle se tient désormais devant chaque route, sous forme de liste d'autorisation de méthodes sûres plutôt que de liste de méthodes dangereuses, si bien qu'une route ajoutée l'an prochain est couverte par défaut. Un refus revient en 403 avec `WWW-Authenticate: Bearer error="insufficient_scope"`, la manière standard de dire « authentifié, mais pas pour ceci ».

Deux décisions plus modestes épargnent un vrai temps de débogage. Accepter un cookie de session autant qu'une clé permet d'essayer les mêmes points de terminaison depuis un navigateur connecté, si bien que la documentation est testable sans émettre d'identifiant. Et répondre différemment à une requête non authentifiée selon qu'un en-tête `Authorization` est arrivé ou non transforme les deux erreurs de configuration les plus fréquentes — pas d'en-tête, et un en-tête que le proxy a supprimé — en deux messages distincts plutôt qu'en un haussement d'épaules.

## Limites de débit, réessais et idempotence

Une limite de débit est une promesse sur le pire des cas, et un client ne peut coopérer qu'avec une promesse qu'il peut lire. La nôtre est de 60 requêtes par minute et par identifiant, et le 429 porte à la fois le chiffre et un en-tête `Retry-After`, si bien qu'un client n'a pas à deviner combien de temps dormir.

Être honnête sur le mécanisme compte aussi. Le compteur est une ligne par appelant et par minute dans Postgres, incrémentée par un upsert. Il n'est pas exact sous forte concurrence — deux appels peuvent lire le même décompte — et à cette échelle c'est le bon compromis face à l'idée de faire tourner un cache à côté de la base. Un appelant ayant besoin d'une allocation exacte devrait le savoir ; un appelant qui veut simplement ne pas matraquer le service a tout ce qu'il lui faut.

Côté client, quatre règles couvrent presque tous les cas :

- Réessayez sur 429, 408 et 5xx. Ne réessayez aucun autre 4xx : la requête est fausse et le restera.
- Reculez de façon exponentielle avec de la gigue, et respectez `Retry-After` quand il est présent — c'est une meilleure information que votre formule.
- Plafonnez le total des tentatives. Un build qui réessaie indéfiniment est un build qui se fige au lieu d'échouer.
- Rendez l'échec bruyant. `curl` sort avec le code zéro sur un 401 ou un 429 à moins de passer `-f`, ce qui signifie qu'une chaîne de traitement peut écrire un corps d'erreur dans le fichier qu'elle était censée convertir et continuer allègrement. C'est la façon la plus courante dont une conversion pilotée par API casse en silence, et cela n'a rien à voir avec l'API.

Ce qui amène l'idempotence, et un aveu honnête. `POST /api/v1/documents` n'est pas idempotent. Postez deux fois le même fichier et vous obtenez deux documents, deux id et deux URL de partage. Rien ne les déduplique.

C'est un choix délibéré à un endroit et un problème non résolu à un autre. C'est délibéré pour la publication : [notre action GitHub crée un nouveau document à chaque poussée](/blog/publish-markdown-from-github-actions) précisément pour qu'un lien dans un vieux commentaire de pull request continue de montrer ce que disait ce commit, plutôt que de muter sous les yeux d'un relecteur qui l'a ouvert la semaine dernière. Écraser serait plus propre et réécrirait discrètement une histoire que quelqu'un est en train de lire.

C'est non résolu pour les réessais. Si une requête expire après l'écriture de la ligne mais avant le retour de la réponse, le client ne peut pas distinguer succès et échec, et le réessai prudent crée un doublon. Il existe trois issues, et il vaut la peine de savoir laquelle une API que vous évaluez a retenue :

1. **Une clé d'idempotence.** Le client envoie une valeur unique dans un en-tête — `Idempotency-Key` est la convention que les API de paiement ont rendue familière — et le serveur conserve la première réponse associée à cette clé pendant une certaine fenêtre, rejouant cette réponse pour toute répétition. C'est la bonne réponse et elle coûte une table, une politique d'expiration, et une décision sur ce qui se passe quand la même clé arrive avec un corps différent.
2. **Un id fourni par l'appelant.** Le client choisit l'id du document, si bien qu'une répétition est un conflit plutôt qu'un doublon. Simple, et cela confie la génération d'id à des appelants qui n'en veulent peut-être pas.
3. **Une réconciliation côté client.** L'appelant liste les documents récents et compare nom et taille avant de poster. C'est ce que vous faites, que vous l'ayez voulu ou non, quand l'API n'offre aucune des deux options précédentes.

Une API qui revendique l'idempotence sans dire pendant combien de temps, ni quels champs forment la clé, ne vous a presque rien dit. Demandez la fenêtre.

## Les fichiers trop gros pour un corps de requête

Toute API de conversion hébergée a un plafond de taille, et ce plafond n'est généralement pas l'opinion du service. Sur une plateforme serverless, requête et réponse passent toutes deux par une infrastructure dotée de ses propres limites, et sur Vercel cette limite est de 4,5 Mo pour un corps de requête ou de réponse, refusé en 413 `FUNCTION_PAYLOAD_TOO_LARGE` (vérifié sur vercel.com/docs/functions/limitations, le 8 septembre 2026).

L'important n'est pas le chiffre. C'est que le refus se produit au-dessus de votre gestionnaire. Un envoi de 6 Mo n'atteint jamais le code qui aurait dit quelque chose d'utile, si bien que l'appelant reçoit le 413 nu de la plateforme et une page d'erreur écrite par personne en particulier. Vu de l'extérieur, cela ressemble à une API cassée.

C'est pourquoi notre plafond par document est de 4 Mo plutôt que de 4,5 Mo : l'application doit refuser la requête elle-même, avec une phrase nommant la taille du document et celle de la limite, avant que la plateforme ne la refuse sans un mot. Le demi-mégaoctet de marge sert au nom du fichier et au JSON autour du Markdown. Et c'est aussi pourquoi le plafond de conversion et le plafond de stockage sont deux chiffres distincts plutôt qu'un seul : convertir se passe dans le navigateur et peut se permettre 10 Mo, conserver le résultat exige une requête et ne le peut pas.

Le versant réponse du plafond s'oublie facilement. Récupérer un document renvoie sa source, et en rendre un renvoie un fichier HTML entier ; les deux sont des corps de réponse, et les deux sont bornés par la même limite. Un service qui vous laisse envoyer un document plus gros que ce qu'il peut vous rendre contient un piège.

Si vos documents sont réellement plus gros que le plafond, il existe quatre options honnêtes :

| Option | Ce qu'elle coûte | Quand elle convient |
| --- | --- | --- |
| Découper le document | Plusieurs requêtes, plusieurs sorties, et une décision sur ce qui les relie | Des documents qui étaient déjà plusieurs documents |
| Fusionner et convertir une fois | Un gros corps, donc cela n'aide que si la fusion réduit le total | Beaucoup de petits fichiers qui vont ensemble |
| Convertir localement, poster le résultat | Une dépendance dans votre chaîne, et une dérive de version à gérer | Des étapes de build qui disposent déjà d'un environnement d'exécution |
| Envoi direct vers le stockage | Des URL signées, un balayage des orphelins, et des lectures qui redirigent | Un service où les gros documents sont la norme plutôt que l'exception |

La troisième option mérite d'être prise au sérieux plutôt que vécue comme une défaite. [Un convertisseur local en ligne de commande](/blog/markdown-to-html-from-the-command-line) n'a ni plafond de taille, ni réseau, ni clé à faire tourner, ni limite de débit ; ce qu'il a à la place, c'est une installation à maintenir et une version dont le comportement doit être épinglé sous peine de dérive. Une API de conversion n'est pas automatiquement la meilleure moitié de ce marché.

Un cas n'est pas du tout un problème de taille. Un `.docx` est une archive zip pleine de XML, et en lire un exige un lecteur zip et un traducteur d'éléments — un poids que notre fonction ne porte pas, si bien que `kind=word-to-markdown` est refusé nommément, avec un renvoi vers la page qui le fait dans le navigateur. C'est une contrainte réelle honnêtement énoncée, et le contournement consiste à [convertir le `.docx` d'abord et à poster le Markdown produit](/blog/convert-docx-to-markdown). Une API qui accepterait discrètement le fichier et le stockerait non converti serait pire à tous égards.

## Ressortir le document

La dernière chose qui sépare un point de terminaison de conversion d'une API de conversion est de savoir si le résultat possède une adresse. Un point de terminaison qui convertit, renvoie des octets et oublie a rendu l'appelant responsable du stockage, du nommage et du partage — ce qui convient s'il voulait une bibliothèque et n'aide pas s'il voulait un service.

Trois représentations du même document couvrent presque tous les usages :

| Requête | Ce qui revient | Utilisé par |
| --- | --- | --- |
| `GET /api/v1/documents/:id` | Du JSON : nom, type, taille, nombre de mots, état de partage, et la source Markdown | Un script qui décide de la suite |
| `GET /api/v1/documents/:id.html` | Le fichier HTML autonome, `?theme=dark` en option | Un build qui écrit un fichier sur le disque |
| `GET /api/v1/documents` | Les 500 plus récents, en liste | Réconciliation, nettoyage, tableaux de bord |

Le HTML autonome mérite une note, parce que « HTML » n'est pas une chose unique. Ce qui revient est un document complet — doctype, en-tête, styles en ligne — plutôt qu'un fragment, et c'est le même fichier que l'application elle-même télécharge, si bien qu'un script et une personne obtiennent une sortie identique depuis un code identique. Une API de conversion qui renvoie un fragment vous a remis un travail, pas un document : ouvert dans un navigateur, c'est du texte sans style sur toute la largeur de la fenêtre.

La publication en est l'autre moitié. `?share=link` sur l'appel de création publie le document et renvoie son URL dans la même réponse, ce qui est tout l'intérêt d'une API pour un outil de ce genre : publier un document devrait tenir en une requête plutôt qu'en trois. La révocation doit être réelle, et c'est la partie que l'on rate : remettre un document en privé supprime son jeton, donc un lien déjà envoyé cesse de fonctionner. Un partage que vous ne pouvez pas annuler n'est pas un partage, c'est une publication.

Et un document sur le web public porte le contenu de quelqu'un d'autre sur votre domaine, ce qui est une question de sûreté plutôt qu'une question d'API. Les pages partagées ici sont servies avec `script-src 'self'` et `frame-ancestors 'none'`, si bien qu'une injection qui aurait survécu à [l'assainisseur](/blog/sanitising-markdown-safely) ne peut toujours pas s'exécuter, et que la page ne peut pas être encadrée comme celle d'un autre. Si une API de conversion doit héberger la sortie pour vous, demandez ce qu'elle envoie dans les en-têtes avant de la pointer vers des documents que vous n'avez pas écrits.

Enfin, un point de terminaison d'usage sonne comme une réflexion après coup et n'en est pas une. `GET /api/v1/usage` répond à « où j'en suis ? » en une requête, ce qui fait la différence entre un client qui ralentit avant d'être refusé et un client qui découvre chaque plafond en le heurtant.

## Là où une API est la mauvaise réponse, et ce que cela coûte

La réponse évidente à « convertis cela selon un calendrier » est un appel d'API, et il y a quatre cas où c'est la mauvaise.

**Un fichier, une fois.** Une clé à émettre, un secret à stocker et un client à écrire, pour un travail qu'une page fait en dix secondes. L'API gagne sa place à la deuxième occurrence, pas à la première.

**Des documents qui ne doivent pas quitter la machine.** Un contrat, une note médicale, un plan non publié — pour ceux-là, la question n'est pas de savoir si un service est digne de confiance mais si le fichier a franchi le réseau. La conversion côté navigateur répond avec l'onglet réseau ; une bibliothèque locale répond avec l'absence de réseau. Une API ne peut pas répondre du tout, quoi que dise la politique de confidentialité.

**Un build qui doit être reproductible.** Un service s'améliore, et l'amélioration est une dérive. Si votre sortie doit être identique octet pour octet à celle de l'an dernier, vous voulez une version de bibliothèque épinglée dans votre propre fichier de verrouillage, pas le dernier déploiement de quelqu'un d'autre.

**Des milliers de fichiers en une passe.** Soixante requêtes par minute, ce sont quarante fichiers README sans s'en apercevoir et quatre mille pages jamais. À ce volume, la réponse est un convertisseur local, ou un document fusionné, ou un point de terminaison de lot si le service en a un.

Les coûts d'un choix en faveur d'une API méritent d'être énoncés clairement, parce qu'ils sont tous du même genre : une dépendance que vous ne contrôlez pas.

- **Un saut réseau dans votre build.** Chaque conversion peut désormais échouer pour des raisons étrangères à votre document : DNS, TLS, un mauvais déploiement à l'autre bout.
- **Un secret avec un cycle de vie.** Les clés fuient, expirent et doivent tourner, dans chaque environnement que vous exploitez, et une rotation oubliée est une panne que vous avez planifiée il y a des mois.
- **Les plafonds de quelqu'un d'autre.** Leur limite de taille, leur limite de débit et leur quota deviennent des faits concernant votre chaîne de traitement, et ils peuvent changer sans vous demander.
- **Une surface d'audit.** Où est allé le document, qui pouvait le lire, combien de temps il a été conservé : autant de questions dont les réponses se cherchent au lieu de s'écrire.
- **Une latence que vous ne pouvez pas optimiser.** Une analyse locale se compte en millisecondes. Un aller-retour se compte en dizaines ou centaines, multipliées par le nombre de fichiers.

Rien de tout cela ne plaide contre une API de conversion. Cela plaide pour en choisir une parce que l'alternative était pire pour ce travail précis, et pour savoir lequel de ces coûts vous avez accepté.

## Comment juger une API de conversion de documents

1. **Lisez le catalogue d'erreurs avant la liste des fonctionnalités.** Si un fichier cassé revient en 500 sans message, chaque échec de votre chaîne coûtera une heure de l'après-midi de quelqu'un, parce que l'API ne vous a rien dit d'exploitable.
2. **Trouvez les limites de taille dans la documentation, pas en production.** Une limite découverte via une requête refusée est une limite découverte pendant une mise en production, et sur une plateforme serverless le refus peut même ne pas venir du service.
3. **Vérifiez si un réessai peut dupliquer.** Sans clé d'idempotence ni id fourni par l'appelant, chaque expiration vous laisse réconcilier à la main — décidez donc maintenant si votre client déduplique, ou acceptez délibérément les doublons comme un choix de publication.
4. **Vérifiez ce que l'identifiant peut atteindre.** Une clé capable de créer des clés, de modifier la facturation ou de supprimer le compte transforme une variable d'environnement fuitée en incident plutôt qu'en rotation.
5. **Demandez ce qu'est réellement le corps de la réponse.** Un fragment signifie qu'il vous reste l'enveloppe à écrire ; un fichier complet et autonome signifie que vous pouvez remettre la sortie directement à une personne.
6. **Essayez d'annuler un partage.** Si révoquer un lien laisse l'ancienne URL fonctionner, l'idée que le service se fait du privé et la vôtre diffèrent, et vous l'apprendrez de la pire façon.
7. **Convertissez un vrai document, puis récupérez-le.** Pas l'échantillon de la documentation : votre fichier, avec ses tableaux, son en-tête et ses caractères bizarres, récupéré par une seconde requête. Cette boucle unique éprouve d'un coup la forme de requête, les limites, les chemins d'erreur et le stockage, et prend environ cinq minutes.

## Conclusion

Une API de conversion de documents est un petit morceau d'infrastructure qui, soit dit ce qu'il fait, soit ne le dit pas. Ce qui en décide est peu spectaculaire : où va le fichier dans la requête, sous quelle forme revient un mauvais fichier, quel plafond appartient au service et lequel à la plateforme en dessous, si un réessai est sûr, et si le résultat possède une URL. Réussissez cela et la conversion elle-même devient la partie facile. Si vous voulez voir la même conversion à la main avant de l'automatiser, [le convertisseur qui se tient devant cette API](/) s'exécute dans le navigateur, ne convertit rien ailleurs, et rend le même fichier autonome que l'API — ce qui en fait une façon raisonnable de vérifier ce que votre script va produire avant de le pointer vers quatre cents fichiers. Et quand le document à convertir n'a derrière lui ni fichier ni dépôt parce qu'un assistant vient tout juste de l'écrire, [un connecteur plutôt qu'un client est la route la plus courte](/blog/converting-documents-from-an-assistant).

## FAQ

### Qu'est-ce qu'une api de conversion de documents ?

Un point de terminaison HTTP qui prend un document dans un format et le renvoie dans un autre, pour que la conversion ait lieu dans un script, une étape de build ou une tâche planifiée plutôt que dans un onglet de navigateur. Les bonnes stockent aussi le résultat et lui donnent une URL, pour que la sortie puisse être récupérée au lieu d'être régénérée.

### Le fichier doit-il aller dans le corps de la requête ou dans un champ JSON ?

Envoyez-le comme corps brut quand le point de terminaison sait déjà quelle est la conversion, par la route ou par un paramètre de requête : rien n'a besoin d'être échappé et le corps reste aussi petit que possible. Utilisez une enveloppe JSON quand vous avez plusieurs champs à envoyer, et assurez-vous que l'API dise quelle forme l'emporte quand le document est lui-même du JSON.

### Quelle est la taille maximale de fichier pour une API de conversion hébergée ?

Cela dépend davantage de la plateforme que du service : sur un hébergeur serverless, les corps de requête et de réponse sont plafonnés, et sur Vercel le plafond est de 4,5 Mo, appliqué avant l'exécution du code de l'application. Les services qui doivent accepter des documents plus gros sortent le fichier de la requête entièrement, avec un envoi direct vers le stockage et une référence postée ensuite.

### Comment empêcher un réessai de créer deux documents ?

Préférez une API qui accepte une clé d'idempotence, pour qu'une requête répétée rejoue la première réponse au lieu de créer un second document. À défaut, faites générer par le client son propre marqueur et vérifiez la liste des documents récents avant de poster, ou traitez délibérément chaque envoi comme une nouvelle version — ce qui est la bonne réponse quand les anciens liens doivent continuer de montrer ce qu'ils montraient.

### Ai-je besoin d'une clé d'API distincte par environnement ?

Oui, pour deux raisons : une clé par environnement peut être révoquée sans tout arrêter, et le décompte de débit par clé fait qu'une tâche emballée en préproduction ne peut pas dépenser l'allocation de la production. Gardez les clés dans le magasin de secrets que votre plateforme fournit déjà, jamais dans le dépôt, et faites-les tourner à une date que vous avez notée.

### Que devrait renvoyer une API de conversion quand le fichier est cassé ?

Un 400 avec le message de l'analyseur lui-même, y compris l'endroit du fichier où il s'est arrêté — c'est la seule information sur laquelle un appelant peut agir, et un plat « conversion impossible » envoie quelqu'un fouiller un mégaoctet à l'œil nu. Réservez les 5xx aux échecs propres au service, et donnez aux deux cas des codes différents pour qu'un client sache si réessayer pourrait servir à quelque chose.

### Puis-je convertir un document Word via une API ?

Parfois, et cela mérite vérification plutôt que supposition. Un `.docx` est une archive zip de XML, un service doit donc embarquer un lecteur zip et un traducteur pour en accepter un ; là où ce poids n'est pas dans la fonction, la conversion est proposée dans le navigateur et l'API reçoit le Markdown qui en est sorti.
