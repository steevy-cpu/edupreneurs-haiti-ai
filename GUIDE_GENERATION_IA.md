# Guide d'utilisation: Génération automatique de contenu avec IA

## Vue d'ensemble

Le système de génération de contenu avec IA permet de créer et régénérer automatiquement le contenu des leçons en utilisant **Gemini 2.5 Flash**. Chaque section de leçon peut être générée individuellement ou toutes ensemble.

## Sections générées

Le système génère 4 sections principales pour chaque leçon:

1. **Objectif d'apprentissage** (150-250 mots)
   - 3-5 objectifs mesurables
   - Verbes d'action (comprendre, analyser, identifier)
   - Contextualisation haïtienne

2. **Introduction** (250-350 mots)
   - Accroche captivante
   - Mise en contexte
   - Importance de la leçon
   - Ce qu'on va apprendre

3. **Contenu principal** (800-1200 mots)
   - 5-7 sections principales
   - Explications détaillées
   - Encadrés "💡 Le savais-tu ?"
   - Exemples concrets haïtiens
   - Vocabulaire clé

4. **Exemples et Exercices** (400-700 mots)
   - 4-5 exemples détaillés haïtiens
   - 8-10 exercices variés (QCM, Vrai/Faux, Questions ouvertes, etc.)
   - Format structuré

## Pour les éditeurs

### Générer une section individuelle

1. **Accéder à Content Editor**
   - Cliquez sur "Révision des Leçons" depuis le dashboard
   - Sélectionnez une leçon dans le navigateur de gauche

2. **Générer ou régénérer une section**
   - Repérez la section souhaitée (Objectif, Introduction, Contenu, Exemples & Exercices)
   - Cliquez sur le bouton "✨ Générer avec IA" (ou "🔄 Régénérer" si du contenu existe)
   
3. **Configurer la génération**
   - **Nombre de mots cible**: Ajustez avec le slider (100-1500 mots)
   - **Contexte additionnel**: Ajoutez des instructions spécifiques (optionnel)
     - Ex: "Ajouter plus d'exemples pratiques"
     - Ex: "Focus sur les applications quotidiennes en Haïti"
   - Cliquez sur "Générer le contenu"

4. **Évaluer le résultat**
   - **Score de qualité**: Le système affiche un score (A+, A, B, C, D, F)
   - **Avertissements**: Liste des problèmes détectés
   - **Suggestions**: Recommandations d'amélioration
   - **Aperçu**: Visualisez le contenu formaté

5. **Actions disponibles**
   - ✅ **Appliquer**: Remplace le contenu actuel
   - 🔄 **Régénérer**: Génère une nouvelle version
   - 👁️ **Aperçu**: Affiche/masque la prévisualisation
   - ❌ **Annuler**: Garde le contenu original

### Générer toutes les sections d'une leçon (Leçon individuelle)

1. **Accéder à Content Editor**
   - Naviguez vers "Révision des Leçons"
   - Sélectionnez une leçon dans le navigateur de gauche
   - Dans l'onglet "Révision"

2. **Lancer la génération**
   - Repérez la carte "Génération IA pour cette leçon" en haut à droite
   - Cliquez sur "✨ Générer les sections de cette leçon"

3. **Configurer la génération**
   - **Sélection des sections**: Cochez les sections à générer
     - ☑️ Objectif
     - ☑️ Introduction
     - ☑️ Contenu principal
     - ☑️ Exemples & Exercices
   - **Nombre de mots**: Ajustez avec les sliders pour chaque section
     - Objectif: 100-1500 mots (défaut: 200)
     - Introduction: 100-1500 mots (défaut: 300)
     - Contenu: 100-1500 mots (défaut: 1000)
     - Exemples & Exercices: 100-1500 mots (défaut: 500)
   - **Contexte additionnel**: Instructions spécifiques pour toutes les sections
     - Ex: "Ajouter plus d'exemples pratiques haïtiens"
     - Ex: "Focus sur les applications quotidiennes en agriculture"

4. **Suivre la progression en temps réel**
   - Barre de progression globale (ex: 2/4 sections)
   - État de chaque section:
     - ⏳ En attente (gris)
     - 🔄 En génération (bleu, animation)
     - ✅ Terminé (vert)
     - ❌ Erreur (rouge, avec message d'erreur)
   - Pause de 3 secondes entre chaque section (rate limiting)
   - Durée estimée: ~50-60 secondes par leçon complète

5. **Résultat**
   - Message de succès: "X section(s) générée(s), Y erreur(s)"
   - Le contenu est automatiquement enregistré dans la base de données
   - La leçon est actualisée automatiquement dans la prévisualisation
   - Toutes les générations sont enregistrées dans les logs (Analytics)

### Génération par lot (Multiple leçons)

Pour générer le contenu de plusieurs leçons simultanément:

1. **Accéder à l'onglet Génération par lot**
   - Dans Content Editor, cliquez sur l'onglet "⚡ Génération par lot"

2. **Configurer les critères de sélection**
   - **Niveau scolaire**: Tous, 7AF, 8AF, 9AF, NS1, NS2, NS3, NS4
   - **Matière**: Toutes, Mathématiques, Sciences, Français, Anglais, etc.
   - **Sections à générer**: Cochez les sections souhaitées
   - **Option**: "Générer uniquement les sections vides" (recommandé)

3. **Personnaliser les paramètres**
   - Ajustez le nombre de mots pour chaque section
   - Ajoutez un contexte global qui s'appliquera à toutes les leçons
   - Le système affiche le nombre de leçons trouvées

4. **Lancer la génération**
   - ⚠️ **Limite**: Maximum 50 leçons par lot (évite surcharge)
   - Cliquez sur "Démarrer la génération"
   - Suivi en temps réel:
     - Progression globale: X/Y leçons terminées
     - Tableau détaillé par leçon:
       - Titre de la leçon
       - Statut (En attente, En cours, Terminé, Erreur)
       - Sections générées
       - Temps de génération
   - Possibilité de **Pause/Reprendre** en cours

5. **Gestion des erreurs**
   - Les erreurs sont affichées avec détails
   - Bouton "Réessayer les erreurs" pour relancer uniquement les échecs
   - Retry automatique (3 tentatives avec délai croissant)
   - Gestion des erreurs 429 (rate limit) et 402 (crédits épuisés)

6. **Export des résultats**
   - Bouton "Exporter CSV" pour télécharger le rapport complet:
     - Leçon, Statut, Sections générées, Temps, Erreurs

7. **Durée estimée**
   - 1 leçon (4 sections): ~50-60 secondes
   - 50 leçons: ~45-50 minutes
   - 100 leçons: ~1h30-2h (nécessite 2 lots de 50)

## Prompt Template Utilisé

Le système utilise un prompt flexible avec variables:

```
Génère le contenu pour {{section_name}} selon {{lesson_topic}} 
pour {{student_grade}} avec au moins {{words_count}} mots.

Variables:
- {{section_name}}: Nom de la section (objectif, introduction, contenu, exemples_exercices)
- {{lesson_topic}}: Titre de la leçon (ex: "Les Types de Roches")
- {{student_grade}}: Niveau scolaire (7AF, AF8, AF9, NS1, NS2, NS3, NS4)
- {{words_count}}: Nombre de mots cible
```

## Bonnes pratiques

### Quand utiliser la génération IA

✅ **Utilisez la génération IA quand:**
- Vous créez une nouvelle leçon
- Le contenu existant est incomplet ou dépassé
- Vous voulez enrichir une section avec plus d'exemples
- Vous avez besoin d'une contextualisation haïtienne

❌ **Évitez la génération IA quand:**
- Le contenu existant est de haute qualité et récent
- La leçon contient des informations spécialisées uniques
- Vous voulez conserver un style d'écriture très spécifique

### Quand régénérer

🔄 **Régénérez quand:**
- Le contenu est trop générique
- Manque d'exemples haïtiens/caribéens
- Niveau de langue inadapté au grade level
- Structure désorganisée ou confuse
- Score de qualité < B (70%)

### Optimiser la qualité

💡 **Pour obtenir le meilleur contenu:**

1. **Utilisez le contexte additionnel**
   - Spécifiez le type d'exercices souhaités
   - Demandez des exemples spécifiques
   - Précisez le niveau de difficulté
   - Mentionnez des thèmes particuliers

   Exemples:
   - "Inclure des exemples de Port-au-Prince et Jacmel"
   - "Focus sur les applications dans l'agriculture haïtienne"
   - "Ajouter des exercices de niveau avancé pour NS4"

2. **Ajustez le nombre de mots**
   - Objectif: 150-250 mots
   - Introduction: 250-350 mots
   - Contenu: 800-1200 mots
   - Exemples & Exercices: 400-700 mots

3. **Régénérez si nécessaire**
   - Ne vous contentez pas du premier résultat
   - Utilisez le contexte additionnel pour affiner
   - Comparez plusieurs versions

4. **Éditez après génération**
   - Relisez toujours le contenu généré
   - Corrigez les erreurs factuelles
   - Ajoutez votre touche personnelle
   - Vérifiez l'exactitude des informations

## Spécificités par matière

### Mathématiques
- Formules et étapes détaillées
- Problèmes avec solutions progressives
- Graphiques et représentations visuelles

### Sciences Expérimentales
- Expériences réalisables avec matériel local
- Observations du contexte haïtien
- Protocoles et consignes de sécurité

### Langues (Français, Anglais, Espagnol, Créole)
- Dialogues pratiques
- Exercices de conjugaison
- Vocabulaire thématique
- Comparaisons linguistiques

### Sciences Sociales
- Documents historiques haïtiens
- Cartes et chronologies
- Études de cas locaux
- Analyses géographiques

## Système de qualité

### Scores de qualité

| Score | Grade | Signification |
|-------|-------|---------------|
| 90-100 | A+ | Excellent - Prêt à publier |
| 80-89 | A | Très bon - Petits ajustements |
| 70-79 | B | Bon - Quelques améliorations |
| 60-69 | C | Satisfaisant - Révision recommandée |
| 50-59 | D | Passable - Régénération suggérée |
| 0-49 | F | À améliorer - Régénérez |

### Critères évalués

- ✅ **Nombre de mots** (respecte la fourchette)
- ✅ **Structure HTML** (balises et classes Tailwind)
- ✅ **Mode sombre** (compatibilité dark/light)
- ✅ **Émojis** (rend le contenu attrayant)
- ✅ **Contexte haïtien** (exemples et références locales)
- ✅ **Lisibilité** (vocabulaire adapté au niveau)
- ✅ **Organisation** (titres, listes, paragraphes)

## Résolution de problèmes

### Erreur: "Rate limit exceeded"
**Cause**: Trop de requêtes en peu de temps
**Solution**: Attendez 5-10 secondes puis réessayez

### Erreur: "Payment required"
**Cause**: Crédits Lovable AI épuisés
**Solution**: Rechargez votre compte via Settings → Workspace → Usage

### Contenu trop court ou vide
**Cause**: Prompt insuffisant ou erreur IA
**Solution**: 
1. Ajoutez plus de contexte
2. Augmentez le nombre de mots cible
3. Régénérez

### Manque d'exemples haïtiens
**Cause**: IA n'a pas assez contextualisé
**Solution**:
1. Ajoutez dans le contexte: "Inclure des exemples haïtiens spécifiques"
2. Mentionnez des villes ou régions: "Exemples de Port-au-Prince, Cap-Haïtien"
3. Régénérez avec ces instructions

### Score de qualité bas
**Cause**: Plusieurs critères non respectés
**Solution**:
1. Lisez les avertissements et suggestions
2. Régénérez avec contexte additionnel
3. Si score persiste < 70%, éditez manuellement

## Conseils avancés

### Pour les nouveaux éditeurs
1. Commencez par générer une seule section
2. Comparez avec des leçons existantes
3. Pratiquez l'utilisation du contexte additionnel
4. N'hésitez pas à régénérer plusieurs fois

### Pour les éditeurs expérimentés
1. Utilisez la génération globale pour gagner du temps
2. Affinez avec du contexte spécifique
3. Combinez génération IA + édition manuelle
4. Créez vos propres modèles de contexte

### Workflow recommandé
1. Générez toutes les sections d'une leçon
2. Évaluez les scores de qualité
3. Régénérez les sections avec score < B
4. Éditez manuellement pour personnalisation
5. Prévisualisez dans l'onglet "Aperçu"
6. Enregistrez et publiez

## Analytics de génération IA

### Accéder aux analytics

1. Dans Content Editor, cliquez sur "📊 Analytics IA" en haut à droite
2. Tableau de bord avec métriques:
   - Total de générations
   - Taux de réussite (%)
   - Temps moyen de génération
   - Score de qualité moyen
   - Nombre total de mots générés

### Métriques disponibles

**Cartes de statistiques:**
- Total de générations (toutes les sections, tous niveaux)
- Taux de réussite en pourcentage
- Temps moyen de génération (en secondes)
- Score de qualité moyen (/100)
- Total de mots générés

**Graphiques et analyses:**
- Générations par section (objectif, introduction, contenu, exemples)
- Erreurs récentes avec détails
- Logs des 100 dernières générations avec:
  - Titre de la leçon
  - Section générée
  - Niveau scolaire
  - Score de qualité
  - Temps de génération
  - Statut (Succès/Erreur)

### Utilité des analytics

- **Identifier les problèmes**: Voir quelles sections échouent le plus
- **Optimiser les prompts**: Analyser les scores de qualité par section
- **Planifier la charge**: Suivre le nombre de générations quotidiennes
- **Déboguer**: Consulter les messages d'erreur détaillés
- **Mesurer l'efficacité**: Temps moyen, taux de réussite, qualité

## Support

Pour toute question ou problème:
- Consultez la documentation Lovable: [https://docs.lovable.dev/](https://docs.lovable.dev/)
- Contactez l'équipe support
- Partagez vos retours pour améliorer le système

---

**Version du guide**: 2.0  
**Dernière mise à jour**: 2025-01-03  
**Modèle IA utilisé**: google/gemini-2.5-flash  
**Nouvelles fonctionnalités v2.0**:
- ✨ Génération de leçon individuelle complète
- ⚡ Génération par lot (jusqu'à 50 leçons)
- 📊 Analytics et logs de génération
- 🔄 Système de retry automatique
- ⏸️ Pause/Reprise pour génération par lot
