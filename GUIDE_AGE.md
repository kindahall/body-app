# 🎯 Guide d'implémentation du critère âge

## Vue d'ensemble

Le critère âge a été ajouté à l'application BodyCount pour calibrer les analyses IA selon la tranche d'âge de l'utilisateur.

## Étapes d'implémentation

### 1. Base de données
Exécutez le script SQL `add-age-field.sql` dans votre tableau de bord Supabase :
```bash
# Dans Supabase SQL Editor
-- Coller le contenu du fichier add-age-field.sql
```

### 2. Validation
Le schéma Zod dans `src/lib/validation.ts` a été mis à jour pour inclure l'âge (18-99 ans).

### 3. Interface utilisateur
- Nouveau composant `AgeInput` dans `src/components/AgeInput.tsx`
- Intégration dans la page Settings pour la saisie de l'âge
- Validation côté client et serveur

### 4. Analyse IA
- L'API `/api/insights` prend maintenant en compte l'âge
- Recommandations calibrées selon la tranche d'âge :
  - 18-25 ans : Jeune adulte (découverte, exploration)
  - 26-35 ans : Adulte établi (stabilisation, construction)
  - 36-45 ans : Adulte mature (équilibre, réalisation)
  - 46-55 ans : Adulte expérimenté (sagesse, transmission)
  - 56-65 ans : Pré-senior (transition, bilan)
  - 66+ ans : Senior (sérénité, partage)

### 5. Hooks et données
- `useAIInsights` mis à jour pour inclure l'âge
- Cache invalidé quand l'âge change
- Données d'export incluent l'âge

## Utilisation

### Dans les composants
```tsx
import AgeInput from '@/components/AgeInput'

// Dans votre composant
<AgeInput
  currentAge={userAge}
  onAgeUpdate={updateUserAge}
  isLoading={isLoading}
  isTestUser={isTestUser}
/>
```

### Dans l'analyse IA
L'âge est automatiquement inclus dans les données envoyées à l'API d'analyse.

## Validation

- **Côté client** : Validation en temps réel (18-99 ans)
- **Côté serveur** : Contrainte de base de données
- **API** : Validation Zod

## Sécurité

- L'âge est stocké de manière sécurisée dans la table profiles
- RLS (Row Level Security) appliqué
- Validation stricte des entrées

## Tests

Pour tester la fonctionnalité :
1. Connectez-vous à l'application
2. Allez dans Paramètres > Profil
3. Saisissez votre âge (18-99 ans)
4. Générez une analyse IA
5. Vérifiez que les recommandations sont adaptées à votre âge

## Notes importantes

- L'âge est **requis** pour les utilisateurs authentifiés
- Les utilisateurs en mode test n'ont pas besoin de saisir leur âge
- L'âge influence directement la qualité et la pertinence des analyses IA
- Les recommandations sont calibrées selon les défis et opportunités de chaque tranche d'âge
