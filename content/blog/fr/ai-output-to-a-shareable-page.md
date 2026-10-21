---
title: "Votre assistant IA écrit du Markdown. Vos collègues ne le lisent pas."
description: "Pourquoi les assistants répondent en Markdown, ce qui survit au collage dans un courriel, Slack, Word ou un ticket, et la voie ennuyeuse qui tient"
updated: 2026-10-21
date: 2026-07-21
tag: Workflow
keywords: chatgpt markdown, convertir une réponse chatgpt en html, exporter du markdown depuis claude, sortie ia markdown, copier du markdown depuis un chat, coller du markdown dans word, astérisques réponse ia, signes dollar formule markdown
---

La réponse affichée dans la fenêtre de chat ressemble à un document. Des titres, un petit tableau, une liste numérotée, du gras aux bons endroits. Vous la copiez dans un courriel et vous obtenez un mur d’astérisques et de dièses. Ou vous obtenez la moitié d’un document : les titres sont passés, le tableau est arrivé sous forme de rangée de barres verticales, et votre lecteur doit deviner quels caractères étaient censés être lus au pied de la lettre.

Rien ne s’est mal passé. L’assistant a écrit du Markdown, parce que c’est ce que ces outils écrivent.

L’écart n’est pas une affaire de goût. Ce qui est à l’écran et ce qui est dans votre presse-papiers sont deux documents différents, et chaque endroit où vous collez fait sa propre supposition sur celui qu’il vient de recevoir. Certaines destinations devinent bien. La plupart devinent autrement que les autres, et c’est pour cela que la même réponse paraît correcte dans une fenêtre et cassée dans la suivante.

### En bref

Les assistants de chat répondent en Markdown parce que c’est le moyen le moins coûteux de marquer un titre à l’intérieur d’un flux de texte brut, et la fenêtre de chat vous restitue cette source sous forme affichée. Le presse-papiers, lui, reçoit la source. Le courriel, Slack, Word, Google Docs, Notion, les gestionnaires de tickets et les systèmes de contenu l’interprètent chacun à leur façon : les tableaux, le code clôturé, les listes imbriquées, les appels de note et tout ce qui relève des mathématiques cassent donc à un endroit différent dans chacun. La voie qui survit est ennuyeuse : enregistrez la réponse en fichier `.md`, relisez-la contre une liste de contrôle avant qu’elle ne porte votre nom, convertissez-la une fois en page HTML autonome, et envoyez la page au lieu du collage.

## Pourquoi la réponse arrive en Markdown

Un modèle produit du texte morceau par morceau. Pour marquer un titre, il doit employer des caractères pris dans le même flux que les mots, et Markdown est le moyen le moins coûteux d’y parvenir : du texte brut, quelques signes de ponctuation, aucun format à négocier. L’interface de chat le réaffiche à votre bout de la chaîne. Cet affichage est l’illusion — ce que vous tenez, c’est la source.

Ce n’est pas la bizarrerie d’un produit en particulier. ChatGPT, Claude, Gemini et Copilot répondent tous ainsi, et les assistants logés dans les éditeurs et les gestionnaires de tickets également. Demander du texte brut fonctionne parfois, mais vous négociez alors avec un modèle au lieu de convertir un fichier.

## Ce que fait réellement le fait de le copier

La plupart des fenêtres de chat gardent deux exemplaires de la réponse. Le bouton de copie vous remet la source, astérisques compris. Une sélection à la souris vous remet la version affichée sous forme de texte enrichi, que la destination réinterprète ensuite. Ni l’une ni l’autre n’est fiable, et elles échouent à des endroits différents.

| Là où vous collez | Bouton de copie (source) | Sélection à la souris (texte enrichi) |
| --- | --- | --- |
| Courriel en texte brut | Chaque dièse, chaque astérisque, chaque barre verticale | Aplati de nouveau en texte brut |
| Word ou Google Docs | La syntaxe brute, rien d’affiché | Titres, gras et le plus souvent tableaux survivent ; le code clôturé perd son bloc |
| Slack ou Teams | Une partie de la syntaxe s’affiche, une partie reste littérale | Variable selon le client ; les listes et les clôtures de code souffrent le plus |
| Un wiki qui parle Markdown | Proche du juste, si son dialecte correspond | Du texte enrichi : le Markdown a disparu |

Le cas à moitié affiché est le plus coûteux. Un lecteur qui voit des titres propres au-dessus d’un fatras de barres verticales en conclut que vous avez envoyé cela sans soin, et non que deux outils étaient en désaccord sur les tableaux. Les tableaux sont de toute façon la victime la plus régulière, pour [des raisons qu’il vaut la peine de connaître](/blog/markdown-tables-that-survive-conversion) si vous en collez souvent.

Ce que le bouton de copie vous remet mérite d’être décrit avec précision, car c’est partout la même chose alors que les interfaces, elles, diffèrent : une chaîne de texte Markdown. Pas un document, pas un format qui porte un nom, rien qu’un logiciel de messagerie pourrait ouvrir — une suite de caractères dans laquelle `##` ne veut dire « titre » que pour un lecteur qui le sait déjà. Rien, dans le presse-papiers, ne le dit.

Une sélection à la souris est d’une autre nature. Les navigateurs déposent deux représentations à la fois dans le presse-papiers : une version en texte brut et une version HTML de la même sélection, et l’application réceptrice prend celle qu’elle préfère. Collez dans un champ de texte brut et vous obtenez le texte aplati. Collez dans un champ de texte enrichi et vous obtenez le balisage de la fenêtre de chat elle-même — ses balises `<h2>`, sa structure de liste, et parfois ses classes CSS et ses couleurs, ce qui explique que des réponses collées arrivent de temps à autre dans une police que personne n’a choisie. Aucune des deux voies n’est un défaut, et aucune ne se répare à la destination.

### Où cela atterrit, destination par destination

Voici l’aide-mémoire. Il décrit ce qui arrive au texte Markdown issu du bouton de copie, parce que c’est la copie que les gens prennent, et la dernière colonne indique quoi faire à la place. Le comportement dérive d’un client à l’autre et d’une version à l’autre : lisez donc ce tableau comme la forme du problème plutôt que comme une garantie sur la version que vous avez devant vous.

| Destination | Ce qui survit au collage | Ce qui ne survit pas | Que faire à la place |
| --- | --- | --- | --- |
| Courriel en texte brut | Rien n’est interprété ; le texte s’affiche exactement tel qu’il a été tapé | Chaque titre, chaque marque de liste, chaque ligne de tableau se lit comme de la ponctuation | Joindre ou lier une page convertie |
| Courriel HTML | Les sauts de ligne et les paragraphes, en gros | Titres, gras, tableaux, code — tout reste syntaxe littérale | Envoyer un lien, ou un fichier `.html` autonome en pièce jointe |
| Slack | Le gras, l’italique et le code en ligne, une fois que l’éditeur les a analysés | Les titres et les tableaux n’ont aucun équivalent dans un message | Lier la page ; poser deux lignes de résumé au-dessus |
| Word | Les paragraphes, et ce que la correction automatique décide de changer | Les titres restent des dièses ; les clôtures restent des accents graves ; les tableaux restent des barres verticales | Convertir, ou coller une sélection en texte enrichi et réparer |
| Google Docs | Les paragraphes, et un comportement qui dépend d’un réglage du document | Le même ensemble, sauf si le réglage en décide autrement | Tester le réglage une fois, ou convertir et lier |
| Notion | L’essentiel : Notion lit le Markdown collé comme du Markdown | L’imbrication profonde, et tout ce pour quoi Notion n’a pas de bloc | Coller, puis vérifier les listes et les blocs de code |
| Un ticket ou une issue | Tout, si le champ de commentaire du gestionnaire parle Markdown | Tout, s’il parle son propre balisage à la place | Déterminer une fois pour toutes dans quel camp est le vôtre |
| Un CMS | Les paragraphes, en tant que paragraphes | La structure, sauf si l’éditeur importe le Markdown exprès | Importer en Markdown si c’est proposé ; sinon convertir |
| Un wiki qui parle Markdown | Presque tout, si le dialecte correspond | Les extensions que le wiki n’a jamais implémentées | Coller et lire le résultat avant de publier |

### Le courriel

Le courriel, ce sont deux produits sous un seul nom. Un message en texte brut n’a aucun analyseur : les dièses et les astérisques sont donc montrés au lecteur en tant que caractères, et c’est le mur de ponctuation que tout le monde a déjà vu. Un message en texte enrichi ou en HTML a un analyseur, mais c’est un analyseur HTML, et Markdown n’est pas HTML. Il voit un paragraphe commençant par deux dièses et affiche un paragraphe commençant par deux dièses.

La voie de la sélection à la souris s’en tire mieux ici et apporte son propre problème : le bloc collé arrive en portant la mise en forme de l’application de chat, si bien que votre message contient deux polices et que la chaîne de réponses citée en dessous en contient une troisième. À terme, la solution consiste à ne pas coller du tout. Envoyez un lien ou un unique fichier autonome, et laissez le document être un document.

### Slack et Teams

Un éditeur de messages n’est pas un éditeur de documents, et il ne prétend pas l’être. Il y a de l’emphase en ligne et du code en ligne, et cela couvre presque tout le vocabulaire. Il n’y a pas de titre : `## Résultats` est donc le texte littéral « ## Résultats ». Il n’y a pas de tableau : un tableau devient donc une pile de lignes séparées par des barres verticales, qui se replient au bord de la fenêtre et perdent l’alignement de leurs colonnes dès le premier écran étroit.

C’est la destination où les gens décident le plus souvent que la réponse convient parce qu’elle avait l’air de convenir dans l’éditeur, et c’est la destination où le client du lecteur a le plus de chances de différer de celui de l’expéditeur. La forme sûre pour la messagerie instantanée, c’est un court résumé dans le message et, en dessous, un lien vers le document. Deux lignes de prose valent mieux qu’un tableau massacré, et elles survivent à une lecture sur téléphone.

### Word

Word fait deux choses peu obligeantes à la fois. Il prend le texte Markdown au pied de la lettre, puis il le modifie. La correction automatique transforme les guillemets droits en guillemets courbes, un double trait d’union en tiret, met une majuscule après ce qu’elle prend pour un point, et convertit une ligne commençant par un trait d’union en liste Word avec la numérotation propre à Word. Chacune de ces décisions est raisonnable prise isolément, et ensemble elles signifient que le texte que vous collez n’est pas le texte que vous avez copié.

Pour du code, ce n’est pas négligé, c’est fatal : une commande contenant un guillemet courbe ne s’exécute pas, et la personne qui essaie reçoit une erreur qui n’a rien à voir avec la commande. Si quelqu’un a réellement besoin d’un fichier Word au bout du compte, c’est un travail de conversion et non un travail de collage, et les outils qui le font correctement sont les convertisseurs de documents, pas le presse-papiers.

### Google Docs

Docs se comporte à peu près comme Word, avec une variable de plus : il existe un réglage au niveau du document qui gouverne le traitement de la syntaxe Markdown, et le même collage se comporte donc différemment dans deux documents appartenant à la même personne. C’est pire qu’un échec constant, parce que cela vous enseigne dans un document une règle qui est fausse dans le suivant.

Testez le réglage une fois sur un document jetable, collez-y une réponse représentative comportant un tableau et un bloc de code, et notez ce qui s’est produit. Ensuite, fiez-vous-y ou ignorez-le délibérément. Ce qu’il ne faut pas faire, c’est supposer que le comportement observé le mois dernier est celui que vous obtiendrez aujourd’hui.

### Notion

Notion est l’exception, et la bonne : le Markdown collé est en général lu comme du Markdown et converti en blocs, si bien que les titres deviennent des titres et qu’un tableau devient un tableau. Si la destination est Notion, le collage est souvent la bonne réponse et le reste de cet article est inutile.

Deux choses méritent tout de même un coup d’œil. Notion est fondé sur des blocs et non sur du texte : une imbrication plus profonde que ce que sa propre structure autorise est donc aplatie, et l’indication de langage d’un bloc clôturé survit ou non comme langage du bloc. Collez, puis lisez les blocs de code et la liste la plus profonde, car ce sont les deux endroits où la conversion perd de l’information.

### Un ticket

Les gestionnaires de tickets se divisent en deux camps, et la division n’est pas évidente de l’extérieur. Un camp traite le champ de commentaire comme du Markdown : le collage est alors proche du juste et seules les extensions qu’emploie votre texte échoueront. L’autre camp a son propre langage de balisage, antérieur à la domination de Markdown, et dans ce camp vos astérisques et vos dièses ne veulent rien dire ou, pire, veulent dire autre chose.

Déterminez une fois pour toutes dans quel camp est le vôtre, avec un commentaire de test sur un ticket que personne ne surveille. Mettez-y un tableau, un bloc clôturé et une liste imbriquée, car ce sont les trois choses qui séparent les camps. Après quoi vous saurez si coller la réponse d’un modèle dans un ticket est une affaire de deux secondes ou une réécriture de dix minutes.

### Un CMS

Un système de contenu est l’endroit où un mauvais collage fait le dégât le plus public, parce que l’échec est publié au lieu d’être envoyé. Les éditeurs par blocs font en général un paragraphe par ligne et laissent la syntaxe visible, ce qui a au moins le mérite d’être évident. Le cas pire est un éditeur qui analyse à moitié : une partie de l’emphase en ligne est convertie, les titres ne le sont pas, et l’article part en ligne avec trois dièses au-dessus de la deuxième section.

La plupart des systèmes qui publient du Markdown ont une voie d’import distincte de la voie du collage, et elle est presque toujours meilleure. Si le vôtre n’en a pas, convertissez en HTML et collez ce HTML dans la vue source de l’éditeur, où la structure est explicite et où vous voyez exactement ce qui sera affiché.

## Ce qui casse, construction par construction

La destination décide de l’allure qu’aura l’échec. La construction décide s’il y en aura un. Voici les huit qui cassent, à peu près dans l’ordre de leur fréquence dans une réponse de chat. Chacune a droit à une courte section ci-dessous, sauf les mathématiques, qui ont assez de matière pour mériter ensuite une section à elles.

| Construction | Ce que le modèle a écrit | Ce qui arrive | Pourquoi |
| --- | --- | --- | --- |
| Tableau | Des lignes séparées par des barres verticales | Des rangées de barres verticales, ou une pile de lignes non alignées | Les tableaux sont une extension GFM, pas du Markdown de base |
| Code clôturé | Trois accents graves et une indication de langage | Les accents graves en texte, l’indentation affaissée, les guillemets courbés | La destination n’a aucun style de code au niveau bloc sur lequel s’appuyer |
| Liste imbriquée | Des entrées `-` et `1.` indentées | Une seule liste plate, ou des marques littérales | L’indentation porte du sens en Markdown et n’est que décorative en texte enrichi |
| Emphase au milieu d’un mot | `my_variable_name` | *my variable name*, mis en italique au milieu | Les anciens analyseurs déclenchent l’emphase sur les tirets bas à l’intérieur des mots |
| Mathématiques | `$x^2$` | Deux signes dollar et un accent circonflexe | Les mathématiques ne figurent dans aucune spécification Markdown |
| Appel de note | `[^1]` et sa définition | Des crochets littéraux, deux fois | Les notes de bas de page ne sont ni dans CommonMark ni dans le noyau GFM |
| Marque de citation | `[3]` ou `[source]` | Des crochets littéraux sans rien derrière | La définition de référence n’a jamais été produite |
| Émojis et caractères typographiques | Points de code, guillemets courbes, tirets | Des carrés, ou des caractères qui cassent les commandes | Couverture des polices et correction automatique, rien à voir avec Markdown |

### Les tableaux

Un tableau Markdown, c’est une ligne d’en-tête, une ligne de séparation faite de tirets et de deux-points, et des lignes de contenu, le tout tenu par des barres verticales. Il ne fait pas partie de la spécification d’origine et il ne fait pas partie de CommonMark ; il est arrivé avec GitHub Flavored Markdown, ce qui veut dire qu’un analyseur peut être parfaitement correct et afficher tout de même votre tableau comme un paragraphe plein de barres verticales.

Le coût est pire qu’un tableau manquant, parce que le repli n’est pas vide. C’est votre donnée, désalignée, dans l’ordre de lecture, avec de la ponctuation entre les cellules. Les lecteurs essaient de la décoder et se trompent, et les colonnes comportant des cellules vides décalent silencieusement le sens d’un cran. Si la réponse contient un tableau, aucun collage ne le tiendra partout, et l’étape de conversion cesse d’être facultative.

### Le code clôturé

Un bloc clôturé, ce sont trois accents graves, une indication de langage facultative, le code, puis à nouveau trois accents graves. Trois choses distinctes lui arrivent en chemin. Les caractères de clôture deviennent du texte visible. L’indentation initiale est normalisée par les règles de paragraphe de la destination, et Python cesse donc d’être valide. Et la correction automatique atteint les guillemets, si bien que même un code qui a gardé sa forme peut ne plus s’exécuter.

C’est ce dernier point qui coûte un après-midi à quelqu’un, parce que le code a l’air juste. Un guillemet courbe et un guillemet droit sont indiscernables au premier coup d’œil dans une police à chasse variable, et le message d’erreur désigne un problème de syntaxe plutôt qu’un problème de caractère. Si vous envoyez du code, envoyez une page ou un fichier, jamais un collage.

### Les listes imbriquées

Markdown construit l’imbrication à partir de l’indentation, et le nombre d’espaces compte. Une destination en texte enrichi n’a aucune notion de « deux espaces d’indentation, cela veut dire une entrée fille » — elle a des niveaux de liste, et elle les redéduit de la structure qu’elle croit avoir reçue. Un plan à trois niveaux arrive souvent sous forme de liste plate unique, la hiérarchie en moins, et c’est un changement de sens et non d’apparence.

La voie du texte brut échoue de façon plus visible et moins dangereuse : les marques restent `-` et `1.`, et le lecteur voit ce qui était voulu. Le cas à moitié réussi est de nouveau le piège, et il vaut la peine de lire la liste la plus profonde de chaque réponse avant de l’envoyer où que ce soit.

### L’emphase à l’intérieur d’un mot

Les modèles écrivent `**Remarque :**` en début de ligne sans arrêt, et ce cas-là se passe généralement bien. L’échec est le cas inverse : du texte qui ne devait jamais être mis en valeur et qui l’est. Les identifiants écrits en snake case en sont l’exemple classique — `my_variable_name` a deux tirets bas autour d’un mot, et les anciens analyseurs en mettent volontiers le milieu en italique.

CommonMark a resserré cela avec des règles de flanc : `_` à l’intérieur d’un mot n’ouvre donc plus d’emphase dans un analyseur conforme. Toutes les destinations ne sont pas conformes, et celles qui analysent un collage à moitié sont les moins susceptibles de l’être. Le symptôme est un document technique dans lequel il manque silencieusement des caractères à certains identifiants, un défaut difficile à repérer et coûteux à livrer.

### Appels de note et marques de citation

Les notes de bas de page ne sont ni dans CommonMark ni dans le noyau de GFM : `[^1]` est donc une extension qu’un moteur de rendu donné implémente ou imprime. Quand il l’imprime, vous obtenez l’appel dans le corps du texte et la définition abandonnée en bas de page, tous deux entre crochets, et le lien entre les deux n’existe que dans la tête du lecteur. [Ce que chaque implémentation fait réellement des notes de bas de page](/blog/markdown-footnotes-support) mérite d’être connu avant de compter sur l’une d’elles.

Les marques de citation sont un autre problème avec la même apparence. Un modèle à qui l’on demande des sources produit souvent `[1]`, `[2]`, `[source]` dans le corps du texte sans jamais produire les définitions de référence dont ces crochets ont besoin. Ce n’est pas un échec de conversion — c’est un document incomplet, et il s’affiche en crochets littéraux dans tous les outils, y compris ceux qui prennent correctement en charge les notes de bas de page. Vérifiez qu’il y a bien quelque chose derrière chaque crochet avant de décider que le convertisseur est en tort.

### Les émojis

Les émojis arrivent comme de vrais caractères : ils survivent donc intacts au presse-papiers. Ce à quoi ils ne survivent pas, c’est à la police de la destination. Une machine dépourvue du glyphe montre un carré, un vieux logiciel de messagerie peut montrer un point d’interrogation, et une police monochrome affiche une puce là où l’auteur voulait un statut. Convertir en HTML n’y change rien : un fichier autonome peut transporter ses styles, mais il ne peut pas transporter la police d’émojis du système du lecteur.

Là où le caractère est décoratif, cela ne coûte rien. Là où il porte du sens — une coche en face d’une ligne du tableau et une croix en face d’une autre —, un carré à la place du glyphe fait disparaître la seule information de la colonne. Remplacez ces caractères-là par des mots. « Oui » et « Non » s’affichent dans toutes les polices qui aient jamais existé.

### Guillemets typographiques et tirets

Les modèles produisent des caractères typographiques : guillemets courbes, apostrophes, tirets demi-cadratins, points de suspension. Dans de la prose, ils sont corrects et un peu plus élégants que les solutions de repli. Dans tout ce qu’une machine va lire, ils sont un défaut, et les deux se rencontrent dès qu’une réponse contient une commande shell, un fragment de JSON ou un chemin de fichier.

La correction automatique à la destination ajoute une deuxième couche du même problème : un texte parti droit du modèle peut arriver courbé. La règle qui vous évite les ennuis est simple : la prose peut avoir des caractères typographiques, le code non, et la seule manière fiable de les tenir séparés consiste à faire passer le code par un convertisseur qui préserve un bloc clôturé sous forme d’élément `<pre>`, plutôt que par un champ de texte qui croit rendre service.

## Les mathématiques sont un problème à part

Rien dans Markdown ne définit les mathématiques. Ni la syntaxe d’origine, ni CommonMark, ni GFM. Les mathématiques délimitées par des signes dollar sont une convention empruntée à TeX que des moteurs de rendu ont ajoutée par-dessus, un par un, avec des règles légèrement différentes. Voilà toute l’explication du fait que `$x^2$` ressemble à une équation dans la fenêtre de chat et à deux signes dollar et un accent circonflexe partout ailleurs.

La fenêtre de chat l’affiche parce qu’une bibliothèque mathématique est chargée dans la page à côté du moteur de rendu Markdown. KaTeX, l’un des choix courants, se décrit comme la bibliothèque de composition mathématique la plus rapide du web et est sous licence MIT (vérifié sur katex.org, le 9 septembre 2026). GitHub l’affiche parce que GitHub a ajouté la fonction exprès : il accepte `$…$` et `$$…$$` ainsi qu’une clôture de code `math`, et sa documentation indique que le rendu est assuré par MathJax (vérifié sur docs.github.com, le 9 septembre 2026).

Un simple convertisseur de Markdown vers HTML n’a aucune raison de connaître tout cela. Son travail consiste à transformer du Markdown en HTML, et les signes dollar ne sont pas du Markdown. Il fait donc la seule chose correcte à sa portée et les laisse passer en tant que texte. Ce n’est pas une lacune à contourner en cherchant un meilleur convertisseur généraliste ; c’est un autre travail, qui demande un outil qui le fasse.

La même fonction recèle un piège de second ordre. Dans un moteur de rendu qui prend *effectivement* en charge les mathématiques en dollars, un signe dollar ordinaire dans de la prose peut ouvrir une expression qui ne se referme jamais ou, pire, en refermer une. Un paragraphe mentionnant `$PATH` et un prix dans les mêmes quelques lignes peut silencieusement avaler tout ce qui se trouve entre les deux. Le même fichier s’affiche donc différemment dans la fenêtre de chat, sur GitHub et dans votre convertisseur, et un seul de ces trois rendus correspond à ce que vous vouliez.

| Si vous avez besoin de | Faites ceci | Ce que cela coûte |
| --- | --- | --- |
| Une ou deux expressions simples | Demandez-les en toutes lettres, ou en notation simple comme `x^2` | Rien, et cela se lit bien dans toutes les destinations |
| De la vraie notation dans un document | Convertissez avec Pandoc, qui a `--math-method=mathml` et `--math-method=katex` parmi ses options (vérifié sur pandoc.org, le 9 septembre 2026) | Une installation et une ligne de commande |
| De la vraie notation dans un fichier autonome | Pré-rendez les expressions en HTML avec KaTeX sous Node, puis convertissez le résultat | Une étape de build, et aucune bibliothèque mathématique chez le lecteur |
| Des mathématiques dans une page qui ne doit rien télécharger | MathML, ou des images | La prise en charge de MathML varie ; les images ne se replient pas et ne suivent pas la taille du texte |
| Le livrer aujourd’hui | Mettez les expressions dans un bloc clôturé et étiquetez-le | Honnête, laid et sans ambiguïté — personne n’y voit un défaut d’affichage |

La réponse pragmatique, pour la plupart des documents professionnels, est la première ligne. Si les mathématiques sont une formule que le lecteur doit appliquer et non une démonstration qu’il doit suivre, une notation simple dans un fragment de code la communique parfaitement et voyage partout. Gardez la composition typographique pour les documents où la notation est le sujet.

## Relisez-le avant qu’il ne porte votre nom

Une documentation produite par une IA reste une documentation. Elle sort sous votre nom, et c’est à vous que le lecteur la reprochera, pas au modèle.

Faites-le avant de convertir, pas après. Une page affichée a l’air finie, et ce qui a l’air fini est lu comme si quelqu’un l’avait vérifié. La relecture est la partie qu’un modèle ne peut pas faire à votre place ici — [un résumé du document par l’IA](/blog/free-ai-document-summarizer) vous dit ce qu’il prétend dire, ce qui est une tout autre question que de savoir si quoi que ce soit là-dedans est vrai.

- [ ] Chaque nombre : pouvez-vous dire d’où il vient ?
- [ ] Chaque lien : ouvrez-le. Des URL plausibles qui ne mènent nulle part sont un échec fréquent.
- [ ] Chaque citation, chaque référence et chaque nom de produit : confirmez que cela existe et que c’est bien orthographié.
- [ ] Chaque bout de code : exécutez-le, ou dites clairement qu’il n’a pas été testé.
- [ ] Les passages assurés : le ton est identique, que le modèle sache ou qu’il devine.
- [ ] Tout ce que vous avez collé dans le prompt : vérifiez que rien n’en a été renvoyé dans la réponse.

Cette liste est le résumé. Les cinq vérifications ci-dessous sont celles qui se passent réellement mal, dans l’ordre où elles se passent mal, et elles valent la peine d’être faites une par une plutôt qu’en un seul survol.

| Quoi vérifier | Comment cela se lit quand c’est faux | Ce que coûte l’impasse |
| --- | --- | --- |
| Les affirmations que vous ne pouvez pas sourcer | Assurées, générales et inattribuables | Quelqu’un fait des plans dessus |
| Les liens | Une URL plausible qui ne mène nulle part | Votre crédibilité, dès le premier clic |
| Les citations attribuées à des personnes | Un vrai nom à côté de mots jamais prononcés | Une personne nommée, déformée par écrit |
| Les nombres sans origine | Un chiffre précis sans année et sans source | Une décision prise sur un nombre inventé |
| Les affirmations sur une entreprise existante | Un prix, une fonction, une limite, énoncés tout net | Une affirmation publique sur le produit d’un autre |

### Les affirmations que vous ne pouvez pas sourcer

La règle n’est pas « est-ce plausible » — la sortie d’un modèle est uniformément plausible, et c’est précisément le problème. La règle est : pouvez-vous dire d’où cela vient ? Si la réponse est un document, une page ou une personne, gardez-le. Si la réponse est « ça sonne juste », vérifiez-le ou coupez la phrase.

Portez votre attention sur le milieu assuré d’un paragraphe plutôt que sur ses extrémités. Les ouvertures et les conclusions sont lues attentivement parce qu’elles portent l’argument. L’invention porteuse est le plus souvent une proposition subordonnée à mi-parcours, posée comme un élément de contexte, que personne ne songe à mettre en doute parce que ce n’est pas le propos de la phrase.

### Les liens qui ne résolvent pas

Ouvrez-les tous. Pas les survoler : les ouvrir. Un modèle qui a appris à quoi ressemble une URL de documentation peut produire une chaîne en forme d’URL pour une page qui n’a jamais existé, et la forme est convaincante : le bon domaine, un chemin plausible, parfois une ancre plausible.

Deux échecs se cachent ici. Le lien mort est l’évident, et il échoue bruyamment, ce qui est le bon cas. Le cas pire est un lien vivant vers la mauvaise page — le bon domaine, un vrai document, et pas celui qui étaye l’affirmation d’à côté. Vérifiez que la page sur laquelle vous atterrissez dit bien ce que la phrase prétend qu’elle dit.

### Les citations attribuées à des personnes

Traitez chaque guillemet entourant les propos d’une personne nommée comme un défaut jusqu’à preuve du contraire. Une citation mal attribuée est la chose la plus dommageable de cette liste, parce que c’est une déclaration écrite sur ce qu’une personne identifiable a dit, qu’elle voyage bien, et qu’elle est trivialement réfutable par l’intéressé.

Trouvez l’original. Si vous ne trouvez pas l’original, retirez les guillemets et le nom ensemble, et écrivez l’idée avec vos propres mots. Une paraphrase que vous pouvez assumer vaut mieux qu’une citation que vous ne pouvez pas assumer.

### Les nombres sans origine

Tout chiffre a besoin de trois choses : une valeur, une unité et une date. La sortie d’un modèle fournit régulièrement la première et laisse tomber les deux autres, et un pourcentage sans année à côté n’est pas une information. Méfiez-vous particulièrement des nombres qui semblent trop ronds et de ceux qui semblent trop précis — les deux sont des motifs et non des mesures.

Là où le nombre compte et où vous ne pouvez pas le sourcer, dites-le dans le document. « Environ un tiers, d’après l’export du deuxième trimestre, non vérifié de façon indépendante » est utile à un lecteur. Un « 34 % » tout nu que personne ne peut retracer est pire que rien, car il sera cité plus loin sans la réserve que vous n’avez jamais écrite.

### Tout ce qui concerne une entreprise existante

Les prix, les limites des offres, la disponibilité des fonctions, les conditions de licence, l’existence même d’un produit — tout cela change, tout cela est affirmé avec assurance, et tout cela constitue des affirmations sur les affaires de quelqu’un d’autre qui sortent avec votre nom dessus. Un prix faux dans un document qui circule en interne devient un prix faux dans un budget.

La vérification consiste à ouvrir la page de l’éditeur lui-même et à la lire. Pas un comparateur, pas un résumé, pas ce dont vous vous souvenez de l’an dernier — la page que l’entreprise publie. Si vous gardez l’affirmation, gardez la date à côté, pour que le prochain lecteur sache quel âge elle a.

### Le remplissage, et la forme vers laquelle les modèles retombent

Coupez aussi le remplissage. Les modèles rembourrent : une ouverture qui reformule la question, un paragraphe de conclusion qui résume ce que le lecteur vient de lire. Supprimez les deux.

Le même réflexe vaut pour la structure. Une réponse en trois points n’a pas besoin de trois titres, d’une liste à puces et d’un tableau récapitulatif disant les trois mêmes choses sous trois formes. C’est cette superposition qui fait paraître substantiel un contenu court, et la retirer fait généralement la différence entre une page qui se lit comme réfléchie et une page qui se lit comme générée.

## Enregistrez-le, convertissez-le, envoyez la page

La voie qui tient est ennuyeuse et prend une minute.

**Enregistrez la réponse dans un fichier.** Appuyez sur copier, collez dans n’importe quel éditeur de texte, enregistrez sous `handover.md`. Un fichier .md est du texte brut : rien à installer, rien qui puisse mal tourner. Ce que vous ne pouvez pas faire, c’est l’envoyer — sur la machine d’un collègue, il s’ouvre dans le programme qui revendique l’extension, ou dans rien du tout.

**Convertissez-le en HTML.** [La conversion de Markdown vers HTML](/) fait cela dans le navigateur : déposez le fichier et le travail se fait sur votre propre machine. Déconnecté, le fichier ne la quitte jamais, ce qui compte quand la réponse contient quelque chose d’interne. Vous obtenez un aperçu, le source HTML exact et un téléchargement — un seul fichier .html autonome, avec des styles en ligne, sans script et sans requête réseau. Plusieurs réponses, plusieurs fichiers : déposez-les tous en même temps et ils sont chaînés en un seul document, dans l’ordre, séparés par un filet. Une réponse de chat représente quelques kilo-octets de texte : rien ici n’approche donc la limite de 10 Mo de la conversion ; ce plafond existe pour les documents numérisés, pas pour de la prose.

**Envoyez la page, pas le fichier.** Le .html s’ouvre d’un double-clic sur n’importe quelle machine. Si une pièce jointe reste malgré tout la mauvaise forme, connectez-vous et publiez plutôt un lien en lecture seule : lisible par quiconque a l’adresse, ou seulement par les adresses que vous nommez. Révoquez-le et un lien déjà envoyé cesse de fonctionner. [Les quatre façons d’envoyer un document](/blog/share-a-markdown-document-as-a-link) traitent de celle qui convient à quel lecteur.

```bash
# with a key already remembered by `tp login`, publishing is one line
node cli/tp.mjs push handover.md --share link
```

Les trois étapes prennent environ une minute à elles toutes, et cette minute achète quelque chose de précis : un artefact avec une adresse, au lieu d’un collage par destinataire et d’aucun moyen d’en corriger aucun. Quand vous trouvez une erreur dans une page, vous corrigez la page. Quand vous trouvez une erreur dans six collages, vous envoyez six excuses.

### La question de confidentialité que personne ne pose

Il y a au milieu de tout cela une étape que les gens franchissent sans y penser, et elle mérite une phrase de réflexion. Coller un brouillon dans un convertisseur en ligne, c’est un téléversement. La plupart des convertisseurs fonctionnent côté serveur, ce qui veut dire que le texte quitte votre machine, traverse le réseau et est analysé sur du matériel que vous ne contrôlez pas, par une entreprise dont vous n’avez pas lu la politique de conservation.

Le contenu aggrave les choses au lieu de les arranger. Le document que vous convertissez est une réponse de chat, et une réponse de chat contient tout ce que vous avez mis dans le prompt : le nom du client, la date non annoncée, la fourchette de salaire, le paragraphe que vous avez collé depuis un document interne pour le faire résumer. C’est précisément la catégorie de texte qu’il ne faut pas confier à un prestataire supplémentaire comme sous-produit d’une mise en forme.

Le contre-argument veut que l’assistant ait déjà le texte, alors qu’importe une copie de plus. Cela importe parce que c’est une autre entreprise, une autre durée de conservation, une autre juridiction et une autre surface d’exposition, et parce que votre organisation a approuvé la première et ne sait rien de la seconde. Un prestataire est une décision. Deux sont un accident.

La vérification prend dix secondes et n’est pas une question de confiance. Ouvrez l’onglet réseau du navigateur, convertissez un fichier et regardez. Un convertisseur qui tourne dans le navigateur n’émet aucune requête quand vous y déposez le fichier — vous pouvez voir cette absence. Un convertisseur qui téléverse vous montre la requête, avec le fichier dedans. C’est un fait sur l’outil et non une affirmation de sa communication, et [la question plus large de ce qu’un convertisseur en ligne fait de votre fichier](/blog/is-an-online-converter-safe) mérite d’être lue une fois et sue pour toujours.

La conversion côté navigateur est la raison pour laquelle TransformPipe peut affirmer que rien n’est téléversé lorsque vous êtes déconnecté : il n’y a pas de téléversement à décrire. La connexion change cela délibérément, car enregistrer un document et publier un lien exigent tous deux un serveur qui le détienne — un échange que vous consentez en connaissance de cause, document par document, plutôt que par défaut.

### Se passer entièrement de la copie

Le presse-papiers est le maillon faible de tout cela, et on peut le supprimer. Un assistant relié à un service de conversion par [un connecteur](/agents) exécute toute la séquence à l’intérieur de la conversation : il prend le texte qu’il vient d’écrire, le convertit et vous rend un fichier ou un lien sans que rien de tout cela ne passe par un champ de texte. Rien n’a l’occasion d’être corrigé automatiquement, puisque rien n’a jamais été collé.

Le mécanisme est un serveur MCP, ou un appel d’API, ou une invocation en ligne de commande depuis ce que l’assistant a le droit d’exécuter — la même conversion dans chaque cas, atteinte par une autre direction. [Convertir des documents depuis un assistant](/blog/converting-documents-from-an-assistant) traite de ce que chaque voie peut et ne peut pas faire. C’est la bonne réponse lorsque cela se produit assez souvent pour être une habitude plutôt qu’une corvée, et cela ne change rien à l’étape de relecture ci-dessus, qui reste la vôtre.

## Là où une page qui a l’air finie échoue, et ce que cela coûte

Voici la partie inconfortable, et c’est la raison pour laquelle la section sur la relecture précède la section sur la conversion au lieu de la suivre.

La mise en forme est un signal de crédibilité, et c’est un signal que les lecteurs appliquent sans s’en rendre compte. Un mur de texte non formaté est lu avec scepticisme ; le lecteur suppose que c’est un brouillon et traite les affirmations comme provisoires. Le même contenu avec des titres, un tableau et des espacements réguliers est lu comme un document — quelque chose qui est passé par un processus, que quelqu’un a vérifié, derrière quoi il y a un certain soin. Rien de cela n’est vrai d’une réponse de chat convertie, et c’est justement la conversion qui fournit l’impression.

La sortie d’un modèle est donc la plus dangereuse quand elle est bien mise en forme. Non pas quand elle est fausse — elle l’est à la même fréquence dans les deux cas —, mais quand la présentation emprunte une autorité que le contenu n’a pas méritée. La référence inventée qui aurait été mise en doute dans un collage brut est transférée deux fois dans une page soignée. C’est un coût réel du mode de travail que cet article recommande, et la seule chose qui le compense est la liste de contrôle ci-dessus, faite correctement, à chaque fois.

Deux habitudes aident. Dites ce qu’est le document : une ligne en haut indiquant « rédigé avec un assistant, chiffres vérifiés contre l’export du deuxième trimestre, liens vérifiés » ne coûte rien et voyage avec le fichier. Et gardez la source `.md` à côté de la page, pour que la personne suivante puisse voir ce qui a changé entre la réponse du modèle et ce que vous avez envoyé.

Convertir n’en vaut pas toujours la peine non plus. Parfois un autre outil l’emporte nettement.

Si le destinataire doit modifier le texte, envoyez quelque chose de modifiable : collez-le dans un document, acceptez que le bloc de code en souffre, et laissez-le travailler. S’il vous faut un vrai .docx, Pandoc convertit entre des formats qu’un convertisseur de navigateur ne touche pas, et [c’est le meilleur outil pour ce travail-là](/blog/pandoc-alternatives-for-markdown-to-html).

Si la réponse fait trois phrases, tapez-les dans le message. Une étape de conversion pour un paragraphe, c’est du cérémonial.

Si le contenu a sa place dans le wiki de l’équipe, mettez-le là. Notion, Confluence et la plupart des gestionnaires de tickets acceptent le Markdown à l’import ou au collage, chacun avec ses bizarreries. Une page partagée est faite pour les documents sans domicile, pas pour du contenu qui en a déjà un.

Et si la réponse sera fausse dans quinze jours — un état d’avancement, un jeu de chiffres qui bougent chaque semaine —, une page est le mauvais contenant, quelle que soit la qualité de la conversion. Les documents survivent à leur exactitude, et une page bien faite y survit plus longtemps, parce qu’elle continue d’avoir l’air faisant autorité après avoir cessé d’être vraie.

## Comment choisir ce que vous envoyez

1. **Partez de ce que le lecteur va en faire.** Lire appelle une page, modifier appelle un fichier modifiable, et approuver appelle des chiffres sourcés avant que quoi que ce soit d’autre ne se produise. Choisir le format avant de connaître le verbe, c’est ainsi qu’un document finit sous la mauvaise forme pour tout le monde.
2. **Comptez les constructions avant de compter les mots.** Un tableau, un bloc clôturé ou une expression entre signes dollar suffit à garantir qu’une destination la massacrera, et à partir de là convertir cesse d’être une préférence pour devenir la seule voie qui tienne.
3. **Décidez si le texte a le droit de quitter votre machine.** S’il ne l’a pas, le convertisseur doit tourner dans le navigateur ou sur du matériel que vous contrôlez, et la voie la plus courte — coller dans le premier outil que renvoie une recherche — devient celle que vous ne pouvez pas prendre.
4. **Budgétez la relecture avant la conversion.** Convertir prend une minute ; sourcer cinq chiffres et ouvrir neuf liens en prend vingt. Ne réserver que la minute, c’est ainsi qu’une sortie non vérifiée acquiert une feuille de style et se met à ressembler à du travail fait par quelqu’un.
5. **Produisez un artefact plutôt qu’un collage par personne.** La liste des destinataires s’allonge après l’envoi — quelqu’un transfère, quelqu’un redemande une semaine plus tard —, et une page se transmet sans changement. Les collages non : chacun est une copie séparée qui vieillit pour son compte.
6. **Testez chaque destination une fois, puis arrêtez de deviner.** Collez une réponse représentative — tableau, clôture de code, liste imbriquée — dans l’outil que vous utilisez le plus, gardez le résultat, et fiez-vous-y. Le comportement est stable par destination, même s’il diffère énormément de l’une à l’autre.

## Conclusion

La réponse dans la fenêtre de chat est un affichage, et ce que vous copiez est la source qui l’a produit. Chaque destination où vous collez redécide de ce que cette source veut dire, et c’est pour cela que le même texte est net dans une fenêtre et plein de barres verticales et d’astérisques dans la suivante, et pour cela que discuter de mise en forme avec l’assistant n’y change jamais rien. La prochaine fois qu’une réponse mérite d’être gardée, enregistrez-la en `.md` avant toute autre chose. Relisez-la contre la liste de contrôle, corrigez ce que le modèle a deviné, coupez le rembourrage, puis convertissez-la une fois et envoyez la page — un fichier, une adresse, et le même document pour tous ceux qui l’ouvrent.

## FAQ

### Pourquoi la sortie de ChatGPT montre-t-elle des astérisques et des dièses quand je la colle ?

Parce que l’assistant a écrit du Markdown et que la fenêtre de chat l’a affiché pour vous. Le bouton de copie vous donne la source sous-jacente, et une destination dépourvue d’analyseur Markdown montre ces caractères exactement tels qu’ils sont. Rien n’est cassé ; vous regardez le texte qui a produit la mise en forme que vous aviez sous les yeux.

### Comment coller une réponse d’IA dans Word sans perdre le tableau ?

Sélectionnez la réponse affichée à la souris au lieu d’utiliser le bouton de copie : le navigateur dépose alors dans le presse-papiers une version en texte enrichi que Word accepte généralement, tableaux compris. Vérifiez ensuite les blocs de code et les guillemets, car la correction automatique de Word modifie ce que vous collez. Pour tout ce qui doit être exact, convertissez le fichier au lieu de le coller.

### Quelle est la meilleure façon d’envoyer un document produit par une IA à quelqu’un ?

Enregistrez-le en fichier `.md`, relisez-le, et convertissez-le en un seul fichier HTML autonome ou en un lien en lecture seule. Les deux s’ouvrent d’un double-clic ou d’un clic, sur n’importe quelle machine, sans installation et sans exiger du lecteur qu’il connaisse Markdown. Le collage n’est fiable que lorsque la destination est un outil qui parle Markdown nativement, comme Notion ou un champ de commentaire en Markdown.

### Pourquoi les signes dollar autour de mes équations ne se transforment-ils pas en mathématiques ?

Parce que les mathématiques délimitées par des dollars ne font partie d’aucune spécification Markdown. C’est une convention que certains moteurs de rendu ont ajoutée par-dessus, si bien que la fenêtre de chat et GitHub les affichent tandis qu’un convertisseur généraliste laisse passer les caractères tels quels. Prenez un convertisseur doté d’un mode mathématique, pré-rendez les expressions, ou écrivez les formules simples en notation ordinaire.

### Est-il prudent de coller un brouillon d’IA dans un convertisseur en ligne ?

Seulement si vous savez où la conversion a lieu. Un convertisseur côté serveur reçoit le téléversement d’un document qui contient probablement tout ce que vous avez mis dans le prompt, c’est-à-dire souvent le texte le plus sensible que vous manipulez de la semaine. Ouvrez l’onglet réseau et regardez : un convertisseur côté navigateur n’émet aucune requête.

### Faut-il dire aux gens qu’un document a été rédigé par un modèle ?

Oui, en une ligne, en précisant ce que vous avez vérifié. Cela ne coûte rien, cela règle le scepticisme du lecteur au bon niveau, et cela vous protège quand un chiffre que vous aviez vérifié se révèle faux à la source. Une sortie de modèle non déclarée qui déraille plus tard donne une conversation bien plus désagréable qu’une sortie déclarée qui déraille plus tard.

### Puis-je récupérer la réponse sans la copier du tout ?

Oui, si l’assistant peut atteindre directement un service de conversion par un connecteur, une API ou une commande qu’il a le droit d’exécuter. Le texte va du modèle au convertisseur sans toucher au presse-papiers, ce qui retire entièrement du processus la correction automatique et les collages à moitié analysés. L’étape de relecture, elle, reste exactement là où elle était.
