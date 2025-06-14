# Guide d'Internationalisation - BodyCount

## Vue d'ensemble

L'application BodyCount est maintenant entièrement internationalisée avec support pour le français et l'anglais grâce à **React Intl**.

## Fonctionnalités implémentées

### ✅ Configuration de base
- ✅ Installation de `react-intl`
- ✅ Provider d'internationalisation configuré
- ✅ Fichiers de traduction pour FR et EN
- ✅ Sélecteur de langue intégré
- ✅ Sauvegarde de la préférence de langue dans localStorage

### ✅ Composants traduits
- ✅ Page d'accueil (landing page)
- ✅ Navigation mobile
- ✅ Header principal
- ✅ Sélecteur de langue

## Structure des fichiers

```
src/
├── locales/
│   ├── fr.json          # Traductions françaises
│   └── en.json          # Traductions anglaises
├── providers/
│   └── IntlProvider.tsx # Provider d'internationalisation
├── components/
│   └── LanguageSelector.tsx # Sélecteur de langue
└── hooks/
    └── useTranslatedNavigation.ts # Hook pour navigation traduite
```

## Utilisation

### 1. Ajouter une nouvelle traduction

Dans `src/locales/fr.json`:
```json
{
  "monNouveau": {
    "titre": "Mon titre en français",
    "description": "Ma description en français"
  }
}
```

Dans `src/locales/en.json`:
```json
{
  "monNouveau": {
    "titre": "My title in English",
    "description": "My description in English"
  }
}
```

### 2. Utiliser les traductions dans un composant

```tsx
import { FormattedMessage } from 'react-intl'

function MonComposant() {
  return (
    <div>
      <h1><FormattedMessage id="monNouveau.titre" /></h1>
      <p><FormattedMessage id="monNouveau.description" /></p>
    </div>
  )
}
```

### 3. Utiliser le hook useIntl pour des traductions dynamiques

```tsx
import { useIntl } from 'react-intl'

function MonComposant() {
  const intl = useIntl()
  
  const titre = intl.formatMessage({ id: 'monNouveau.titre' })
  
  return <input placeholder={titre} />
}
```

### 4. Changer la langue

Le composant `LanguageSelector` est déjà intégré dans le header. Les utilisateurs peuvent:
- Cliquer sur le sélecteur de langue dans le header
- Choisir entre Français 🇫🇷 et English 🇺🇸
- La préférence est automatiquement sauvegardée

## Sélecteur de langue

Le `LanguageSelector` offre:
- Interface utilisateur intuitive avec drapeaux
- Dropdown élégant avec animation
- Indicateur visuel de la langue sélectionnée
- Design responsive et accessible

## Configuration avancée

### Ajouter une nouvelle langue

1. Créer un nouveau fichier de traduction: `src/locales/es.json`
2. Mettre à jour le type `Locale` dans `IntlProvider.tsx`:
```tsx
type Locale = 'fr' | 'en' | 'es'
```
3. Ajouter la langue dans `LanguageSelector.tsx`:
```tsx
const languages = [
  { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
  { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  { code: 'es' as const, name: 'Español', flag: '🇪🇸' }
]
```

### Format des messages avec variables

```json
{
  "bienvenue": "Bienvenue {nom}! Vous avez {count} messages."
}
```

```tsx
<FormattedMessage 
  id="bienvenue" 
  values={{ nom: 'Jean', count: 5 }} 
/>
```

### Pluralisation

```json
{
  "messages": {
    "one": "Vous avez 1 message",
    "other": "Vous avez {count} messages"
  }
}
```

## Pages à traduire

### ✅ Déjà traduites
- Page d'accueil
- Navigation
- Sélecteur de langue

### 🔄 À traduire
- `/auth` - Page de connexion
- `/home` - Tableau de bord
- `/settings` - Paramètres
- `/profiles` - Profils
- `/insights` - Analyses
- `/confessions` - Confessions
- `/journal` - Journal
- `/mirror` - Miroir
- `/wishlist` - Liste de souhaits
- Toutes les autres pages

## Prochaines étapes

1. **Traduire toutes les pages**: Remplacer progressivement tous les textes codés en dur
2. **Traductions dynamiques**: Ajouter la traduction pour les contenus générés par IA
3. **Formats de date/heure**: Adapter les formats selon la langue
4. **Validation des formulaires**: Traduire les messages d'erreur
5. **SEO multilingue**: Adapter les métadonnées selon la langue

## Support technique

Le système d'internationalisation est basé sur:
- **React Intl**: Bibliothèque robuste et largement utilisée
- **Flat structure**: Messages aplatis pour une utilisation simple avec react-intl
- **TypeScript**: Support complet avec auto-complétion
- **Performance**: Chargement optimisé des traductions

## Test

Pour tester l'internationalisation:
1. Lancez l'application: `npm run dev`
2. Ouvrez http://localhost:3000
3. Cliquez sur le sélecteur de langue dans le header
4. Changez entre français et anglais
5. Vérifiez que les textes changent instantanément

La préférence de langue est sauvegardée et persistera entre les sessions. 