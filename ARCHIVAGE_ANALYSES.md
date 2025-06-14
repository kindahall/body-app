# 📁 Système d'Archivage des Analyses IA

## Vue d'ensemble

Le système d'archivage permet de sauvegarder et organiser vos analyses IA pour créer un historique de votre évolution personnelle. L'IA peut maintenant utiliser vos analyses précédentes comme contexte pour fournir des insights plus personnalisés et noter votre progression.

## 🚀 Fonctionnalités

### 1. Archivage d'analyses
- **Bouton "Archiver"** : Sauvegarde l'analyse actuelle avec un titre personnalisé
- **Organisation par dossiers** : Classez vos analyses par thème (ex: "Relations", "Développement personnel", "Objectifs 2024")
- **Tags** : Ajoutez des mots-clés pour faciliter la recherche
- **Snapshot des données** : Sauvegarde l'état de vos données au moment de l'analyse

### 2. Consultation des archives
- **Bouton "Archives"** : Affiche toutes vos analyses sauvegardées
- **Recherche** : Trouvez rapidement une analyse par titre, contenu ou tags
- **Filtrage par dossier** : Affichez seulement les analyses d'un dossier spécifique
- **Aperçu** : Visualisez un extrait de chaque analyse

### 3. Contexte pour l'IA
- **Évolution** : L'IA compare automatiquement avec vos 5 dernières analyses
- **Progression** : Identification des améliorations et changements positifs
- **Continuité** : Recommandations basées sur votre historique personnel

## 📋 Guide d'utilisation

### Étape 1 : Créer la table en base de données
Exécutez le script SQL suivant dans votre tableau de bord Supabase :

```sql
-- Copiez le contenu du fichier create-archived-insights-table.sql
```

### Étape 2 : Générer une analyse
1. Allez sur la page **Insights**
2. Cliquez sur **"Générer l'analyse"**
3. Attendez que l'IA termine l'analyse

### Étape 3 : Archiver l'analyse
1. Cliquez sur le bouton **"Archiver"** (vert)
2. Donnez un **titre descriptif** (ex: "Bilan janvier 2024")
3. Choisissez un **dossier** (ex: "Évolution mensuelle")
4. Ajoutez des **tags** séparés par des virgules (ex: "relations, confiance, objectifs")
5. Cliquez sur **"Archiver"**

### Étape 4 : Consulter les archives
1. Cliquez sur **"Archives"** pour voir toutes vos analyses
2. Utilisez la **barre de recherche** pour trouver une analyse spécifique
3. **Filtrez par dossier** pour voir un thème particulier
4. Cliquez sur l'icône **poubelle** pour supprimer une analyse

## 🎯 Conseils d'utilisation

### Organisation recommandée

**Dossiers suggérés :**
- `Évolution mensuelle` - Analyses régulières pour suivre les progrès
- `Relations` - Analyses focalisées sur la vie relationnelle
- `Développement personnel` - Insights sur la croissance personnelle
- `Objectifs` - Analyses liées aux projets et ambitions
- `Crises` - Analyses pendant les périodes difficiles
- `Réussites` - Analyses après des accomplissements

**Tags utiles :**
- `confiance`, `estime-de-soi`, `anxiété`
- `relations`, `amour`, `amitié`, `famille`
- `travail`, `carrière`, `objectifs`
- `santé`, `bien-être`, `sport`
- `créativité`, `apprentissage`, `compétences`

### Fréquence recommandée
- **Mensuelle** : Analyse générale de votre évolution
- **Trimestrielle** : Bilan approfondi avec objectifs
- **Événementielle** : Après des changements importants
- **Thématique** : Focus sur un aspect spécifique

## 🔄 Impact sur l'IA

Avec vos analyses archivées, l'IA peut maintenant :

1. **Comparer votre évolution** dans le temps
2. **Identifier des patterns** récurrents
3. **Noter vos progrès** et célébrer vos réussites
4. **Adapter ses recommandations** à votre parcours unique
5. **Éviter de répéter** les mêmes conseils
6. **Personnaliser davantage** ses insights

## 🛠️ Aspects techniques

### Base de données
- Table `archived_insights` avec RLS (Row Level Security)
- Stockage JSON des données au moment de l'analyse
- Index optimisés pour la recherche et le filtrage

### Sécurité
- Chaque utilisateur ne voit que ses propres analyses
- Suppression en cascade si l'utilisateur supprime son compte
- Validation côté client et serveur

### Performance
- Limitation à 5 analyses pour le contexte IA
- Troncature des analyses longues pour l'API
- Cache local pour éviter les requêtes répétées

## 🚨 Notes importantes

1. **Sauvegarde** : Vos analyses sont stockées de façon permanente
2. **Suppression** : La suppression d'une analyse est définitive
3. **Contexte IA** : Plus vous archivez, plus l'IA devient pertinente
4. **Vie privée** : Vos analyses restent strictement privées

---

*Ce système d'archivage transforme vos insights ponctuels en un véritable journal de développement personnel alimenté par l'IA.* 