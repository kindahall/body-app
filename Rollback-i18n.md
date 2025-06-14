# Rollback i18n - BodyCount

## Résumé

Ce document décrit le rollback complet de l'internationalisation (i18n) effectué sur le projet BodyCount pour revenir à une application monolingue française.

## Dépendances supprimées

- `next-intl` - Bibliothèque d'internationalisation pour Next.js

## Fichiers et dossiers supprimés

### Dossiers complets
- `/messages/` - Contenait les fichiers de traduction (fr.json, en.json, es.json, de.json, it.json, pt.json)
- `/i18n/` - Configuration i18n
- `/src/app/[locale]/` - Routes localisées

### Fichiers individuels
- `src/i18n.ts` - Configuration principale i18n
- `src/middleware.ts` - Middleware de gestion des locales
- `src/lib/i18n.ts` - Utilitaires i18n
- `src/lib/supabase/updateUserLocale.ts` - Fonction de mise à jour de la locale utilisateur
- `src/components/LanguageSelect.tsx` - Composant de sélection de langue
- `scripts/extract-messages.ts` - Script d'extraction des messages
- `migrations/add_locale_to_profiles.sql` - Migration pour ajouter la colonne locale
- `README_I18N.md` - Documentation i18n

## Fichiers modifiés

### Configuration
- `next.config.ts` - Suppression de la configuration next-intl
- `package.json` - Suppression de la dépendance next-intl

### Layout et navigation
- `src/app/layout.tsx` - Changement de langue de 'en' à 'fr', locale OpenGraph, et ajout de l'AuthProvider + MobileNavigation
- `src/components/MobileNavigation.tsx` - Remplacement des traductions par du texte français en dur

### Pages
- `src/app/settings/page.tsx` - Suppression du sélecteur de langue et des fonctions i18n

## Structure finale

L'application utilise maintenant la structure App Router standard de Next.js :

```
src/app/
├── layout.tsx          # Layout principal (français) avec AuthProvider
├── page.tsx            # Redirection vers /home
├── home/
├── settings/
├── profiles/
├── auth/
├── add-relationship/
├── charts/
├── confessions/
├── insights/
├── journal/
├── mirror/
├── relations/
└── wishlist/
```

## Textes français

Tous les textes de l'interface sont maintenant en français :
- Navigation : "Accueil", "Ajouter", "Profils", "Analyses", "Paramètres"
- Fonctionnalités : "Confessions", "Journal", "Miroir", "Wishlist"
- Interface des paramètres : "Langue de l'interface : 🇫🇷 Français (par défaut)"

## Actions pour réactiver l'i18n (si nécessaire)

Si vous souhaitez réactiver l'internationalisation plus tard :

1. **Réinstaller les dépendances**
   ```bash
   pnpm add next-intl
   ```

2. **Restaurer la configuration**
   - Recréer `src/i18n.ts`
   - Recréer `src/middleware.ts`
   - Modifier `next.config.ts` pour inclure next-intl

3. **Restaurer la structure [locale]**
   - Recréer `/src/app/[locale]/`
   - Déplacer les pages dans cette structure

4. **Restaurer les fichiers de traduction**
   - Recréer le dossier `/messages/`
   - Ajouter les fichiers JSON de traduction

5. **Mettre à jour les composants**
   - Réintégrer `useTranslations` dans les composants
   - Restaurer `LanguageSelect.tsx`

## État actuel

✅ Application monolingue française  
✅ Structure App Router standard  
✅ Aucune dépendance i18n  
✅ Navigation et interface en français  
✅ Paramètres de langue désactivés  
✅ AuthProvider et MobileNavigation restaurés  
✅ Application fonctionnelle et testée  

L'application fonctionne maintenant entièrement en français sans aucune complexité liée à l'internationalisation. Toutes les fonctionnalités d'authentification et de navigation sont opérationnelles.
