---
title: Les alternatives à MarkItDown, classées par la raison qui vous amène
description: MarkItDown est une bibliothèque Python destinée aux pipelines LLM, et son propre README le dit. Voici quoi prendre quand ce n’est pas votre problème.
date: 2026-09-22
tag: Conversion
keywords: alternative markitdown, markitdown vs docling, markitdown sans python, convertir des documents en markdown pour llm, microsoft markitdown, markitdown pdf
---

Personne ne cherche une alternative à MarkItDown parce que MarkItDown serait mauvais. On cherche parce que le fichier est ouvert dans un onglet, sur une machine où il n’y a pas de Python ; parce que le PDF est ressorti en colonne de mots agglutinés ; ou parce que le Markdown était destiné à être lu par quelqu’un et qu’il ne se lit pas comme du texte écrit par quelqu’un. L’outil n’est pas en cause. Il a été construit pour une forme de problème précise, et cette forme est énoncée clairement dans sa propre documentation — ce que peu de projets font.

### En bref

MarkItDown est un utilitaire Python qui convertit des fichiers en Markdown **pour des pipelines d’analyse de texte**, et son README précise que la sortie « n’est peut-être pas la meilleure option pour des conversions fidèles destinées à la lecture humaine ». Si votre pipeline est en Python, si les fichiers sont sur le disque à côté, et si le Markdown part vers un modèle, c’est le bon choix par défaut et rien ici ne le dépasse. Regardez ailleurs quand il n’y a pas de Python là où se trouve le document, quand l’entrée est un PDF scanné, quand le Markdown doit ressortir sous une autre forme, ou quand le document ne doit pas quitter la machine du tout. Ce dernier point se vérifie plutôt qu’il ne se suppose : certaines de ses meilleures options sont des appels cloud facturés.

## Ce qu’est réellement MarkItDown

Une enveloppe mince et bien choisie. Le document intéressant n’est pas le README mais `pyproject.toml`, car les dépendances optionnelles sont la fiche technique honnête (vérifié sur github.com/microsoft/markitdown, le 22 septembre 2026) :

| Format | Ce qui le lit |
| --- | --- |
| `.docx` | `mammoth` |
| `.pptx` | `python-pptx` |
| `.xlsx` / `.xls` | `pandas` avec `openpyxl` ou `xlrd` |
| `.pdf` | `pdfminer.six` et `pdfplumber` |
| Audio | `pydub` avec `SpeechRecognition` |
| YouTube | `youtube-transcript-api` |
| HTML | `beautifulsoup4` et `markdownify` |

Python 3.10 à 3.14, `pip install 'markitdown[all]'`, ou une extra à la fois — `pip install 'markitdown[pdf, docx, pptx]'` — ce qui est l’installation raisonnable une fois que vous savez lesquelles trois vous servent.

Connaître cette liste, c’est connaître le plafond avant de le heurter. Le lecteur Word est Mammoth : MarkItDown hérite donc exactement de [ce que Mammoth emporte et de ce qu’il laisse](/blog/mammoth-js-and-docx-parsers). Les lecteurs de PDF sont des extracteurs de texte : ils récupèrent les objets texte que le PDF déclare. Ils ne modélisent pas la page, donc un scan sur deux colonnes ressort entrelacé, et une page numérisée ressort vide, parce qu’il n’y a aucun texte à en extraire. L’OCR existe — par un greffon qui envoie la page à un modèle de vision dont vous fournissez la clé, ou par Azure Document Intelligence — et les deux sont des appels réseau.

Et il y a la note de périmètre, qui décide de la plus grande partie de cet article :

> Nous ne pouvons pas accepter d’applications, de services ou de serveurs supplémentaires. Cela comprend : les serveurs web, les API REST ou HTTP et les services de conversion hébergés ; les interfaces web et les interfaces utilisateur dans le navigateur ; les applications de bureau et mobiles.

Ce n’est pas une lacune. C’est une frontière délibérée, inscrite dans le guide de contribution, et elle signifie que le projet n’aura jamais ce que la moitié des gens en quête d’une alternative veulent réellement.

## Les quatre raisons qui amènent

### 1. Il n’y a pas de Python là où se trouve le document

C’est la raison la plus fréquente, et ce n’est pas une objection technique. Le document est une page Confluence, un ticket, un Google Doc, un fil de discussion — ou c’est un `.docx` sur le portable de quelqu’un qui n’a pas de terminal et n’en aura pas. Un pipeline qui commence par `pip install` a déjà échoué pour cette personne.

Ce qui marche à la place, c’est un convertisseur qui tourne là où le document se trouve déjà : un onglet, une extension dans la barre d’outils, un téléphone. La conversion elle-même n’est pas la partie difficile — `mammoth` existe en version JavaScript, `turndown` l’a toujours été —, donc convertir Word, HTML, tableurs et présentations côté navigateur est devenu ordinaire, et rien n’est téléversé quand cela se passe dans la page.

### 2. L’entrée est un PDF, et le PDF est une image

`pdfminer.six` et `pdfplumber` sont bons à ce qu’ils font : lire le texte qu’un fichier PDF déclare. Un contrat numérisé n’en déclare aucun. Un article scientifique sur deux colonnes déclare son texte dans l’ordre du tracé, pas dans celui de la lecture.

Si le PDF est la véritable entrée, l’outil bâti pour cela s’appelle **Docling**, d’IBM Research et désormais hébergé par la LF AI & Data Foundation : mise en page, ordre de lecture, structure des tableaux, formules, OCR pour les scans, et un modèle de document en dessous plutôt qu’un tampon de texte. Il est bien plus lourd — des poids de modèles se téléchargent au premier lancement — et ce poids est la fonctionnalité. [La comparaison de dix convertisseurs](/blog/ten-markdown-converters-compared) met les deux dans le même tableau si vous voulez voir le reste du terrain à côté.

### 3. Le Markdown doit ressortir

MarkItDown convertit *vers* Markdown. C’est toute sa conception, et « la seule cible » lui est vrai d’une manière qui ne l’est pas pour Pandoc.

Dès que la tâche devient « nous avons le Markdown et il lui faut maintenant être un fichier Word que le service juridique annote », vous regardez un autre outil. [Pandoc](/blog/pandoc-alternatives-for-markdown-to-html) est la réponse de référence pour ce sens-là et pour la matrice de formats en général — une source, plusieurs sorties, tenues au même pas.

### 4. Le document ne doit pas quitter la machine

À lire attentivement, car « tourne localement » et « sans réseau » ne sont pas la même phrase.

Les convertisseurs intégrés de MarkItDown sont locaux. Ses meilleurs résultats sur les entrées difficiles ne le sont pas : Azure Document Intelligence et Azure Content Understanding sont des services cloud, chaque appel est facturé, et les descriptions d’images fonctionnent en envoyant l’image à un LLM via un client que vous construisez vous-même. Les trois sont à activer explicitement et aucun n’est une surprise — la documentation est claire —, mais une réponse de conformité qui dit « cela tourne localement » pendant que le pipeline passe un drapeau qui téléverse la page est précisément le genre de chose qu’on ne découvre qu’en audit. [Comment vérifier où un convertisseur envoie votre fichier](/blog/is-an-online-converter-safe) est une question que mérite chaque outil de cette page, y compris le nôtre.

## Ce que rien ici ne remplace

Être juste est aussi la partie utile, car cela vous dit quand arrêter de lire.

- **Les transcriptions YouTube et l’audio.** Rien d’autre dans cet article ne transforme une adresse de vidéo ou un `.wav` en texte. Si c’est sur la liste, MarkItDown est sur la liste.
- **Les fichiers `.msg` d’Outlook.** Un format vraiment ingrat, et il est lu.
- **Les archives ZIP, parcourues.** Il traverse le contenu et convertit chaque pièce.
- **Le système de greffons.** Un format dont vous avez besoin et que personne ne gère est un paquet que vous publiez, pas un fork que vous entretenez.
- **Un serveur MCP.** `markitdown-mcp` place l’ensemble devant un assistant, ce qui est [la façon la moins chère de faire entrer un document dans une conversation](/blog/what-a-document-costs-an-assistant) quand le fichier est déjà sur la machine que l’assistant atteint.

## Où se situe ce site

TransformPipe est la réponse côté navigateur à la première raison. Quinze conversions — Word, PowerPoint, EPUB, tableurs, HTML, CSV, JSON, ainsi que les exports Notion, Confluence, Obsidian et Evernote — tournent dans la page, sans rien téléverser, et les mêmes convertisseurs se trouvent derrière une API, un client en ligne de commande, une extension de navigateur pour la page que vous lisez et un serveur MCP pour un assistant.

Les limites honnêtes, dans l’esprit de la note de périmètre citée plus haut : **il n’y a pas de PDF ici du tout**, dans aucun sens, et il n’y en aura pas — lire un PDF correctement demande des modèles de mise en page et de l’OCR, donc un serveur, ce qui retirerait la seule propriété qui rende un convertisseur de navigateur intéressant. Pas d’audio, pas de vidéo, pas de YouTube. Et la sortie est du Markdown et du HTML plutôt qu’une matrice de formats ; un `.docx` ressort bien, mais l’étendue de Pandoc, non.

Si la réponse à « où cela tourne-t-il » est « dans un processus Python à côté des fichiers », installez MarkItDown. Si c’est « dans l’onglet que je regarde », rien de tout cela n’est pour vous — et c’est exactement pour cela que cette liste existe.
