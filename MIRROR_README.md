# 🪞 Le Miroir - Documentation

## Vue d'ensemble

**Le Miroir** est un espace d'introspection personnelle permettant aux utilisateurs de réfléchir sur eux-mêmes, leurs relations et leur développement personnel. Cette fonctionnalité offre une interface dynamique et persistante pour l'auto-évaluation structurée.

## 🎯 Fonctionnalités principales

### 1. **Trois onglets d'introspection**
- **👁️ Comment je me vois** : Auto-perception et qualités personnelles
- **👥 Comment les autres me voient** : Retours et perceptions externes
- **🎯 Développement personnel** : Objectifs, apprentissages et niveau de confiance

### 2. **Interface dynamique**
- ✅ Édition en temps réel avec validation (60 caractères max par item)
- ✅ Ajout/suppression d'éléments avec raccourci Enter
- ✅ Sauvegarde automatique dans Supabase ou localStorage
- ✅ Progress bar avec animation confettis à 100%
- ✅ Mode sombre/clair adaptatif

### 3. **Persistance des données**
- ✅ **Supabase** : Pour les utilisateurs authentifiés
- ✅ **localStorage** : Pour les utilisateurs de test
- ✅ **Historique** : Versions précédentes avec timestamps
- ✅ **Trigger automatique** : `updated_at` mis à jour automatiquement

### 4. **Fonctionnalités avancées**
- ✅ **Export PDF/TXT** : Téléchargement de l'introspection complète
- ✅ **Partage contrôlé** : Liens privés avec durée configurable (à implémenter)
- ✅ **Conseils IA** : Recommandations pour une introspection efficace
- ✅ **Niveau de confiance** : Slider 1-10 avec visualisation graphique

## 🗄️ Structure de données

### Table `self_reflection`

```sql
CREATE TABLE self_reflection (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('self', 'others', 'growth')),
    title TEXT NOT NULL,
    items TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Interface TypeScript

```typescript
interface ReflectionItem {
  id: string
  user_id: string
  type: 'self' | 'others' | 'growth'
  title: string
  items: string[]
  created_at: string
  updated_at: string
}

interface MirrorData {
  self: ReflectionItem[]
  others: ReflectionItem[]
  growth: ReflectionItem[]
  confidenceLevel: number
  lastUpdated: string
}
```

## 🎨 Design et UX

### Palette de couleurs
- **Dégradé principal** : `from-pink-50 via-white to-rose-50`
- **Mode sombre** : `from-gray-900 via-gray-800 to-gray-900`
- **Accents** : Rose/Pink pour les actions principales
- **Progress bar** : Dégradé vert-bleu pour la progression

### Animations
- **fadeInUp** : Apparition progressive des sections
- **bounce** : Animation confettis à 100% de progression
- **transition-all** : Transitions fluides sur tous les éléments
- **hover effects** : Feedback visuel sur les interactions

### Responsive Design
- **Mobile-first** : Interface optimisée pour smartphone
- **Breakpoints** : `md:` pour tablette, `lg:` pour desktop
- **Overflow** : Scroll horizontal pour les onglets sur mobile
- **Safe areas** : Support iOS avec padding adaptatif

## 🔧 Architecture technique

### Composants principaux

#### 1. **MirrorPage** (page principale)
```typescript
// État principal
const [activeTab, setActiveTab] = useState<'self' | 'others' | 'growth'>('self')
const [isEditing, setIsEditing] = useState(false)
const [mirrorData, setMirrorData] = useState<MirrorData>()

// Fonctions clés
- loadMirrorData() // Chargement depuis Supabase
- saveMirrorData() // Sauvegarde avec upsert
- calculateProgress() // Calcul du pourcentage de completion
```

#### 2. **ListEditor** (composant d'édition)
```typescript
// Props
interface ListEditorProps {
  sectionIndex: number
  section: ReflectionItem
  placeholder: string
  isEditing: boolean
}

// Fonctionnalités
- Ajout d'items avec validation
- Suppression avec confirmation visuelle
- Placeholder motivant si vide
```

### Gestion d'état
- **React hooks** : `useState`, `useEffect` pour la réactivité
- **Supabase client** : `createClientComponentClient()` pour la persistance
- **localStorage** : Fallback pour les utilisateurs non connectés
- **TypeScript strict** : Typage complet pour la robustesse

## 🔒 Sécurité et RGPD

### Row Level Security (RLS)
```sql
-- Politique de sécurité stricte
CREATE POLICY "Users can view own reflections" ON self_reflection
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON self_reflection
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Protection des données
- ✅ **Accès strict** : `user_id = session.user.id` uniquement
- ✅ **Soft delete** : Flag de suppression (à implémenter)
- ✅ **Chiffrement** : Données sensibles protégées par Supabase
- ✅ **Audit trail** : Historique des modifications avec timestamps

## 📱 Tests et compatibilité

### Navigateurs supportés
- ✅ **Chrome/Edge** : 90+
- ✅ **Firefox** : 88+
- ✅ **Safari** : 14+
- ✅ **Mobile** : iOS 14+, Android 10+

### Tests recommandés
1. **Fonctionnels** : Ajout/suppression d'items, sauvegarde
2. **Responsive** : Mobile, tablette, desktop
3. **Performance** : Chargement < 2s, animations fluides
4. **Accessibilité** : Navigation clavier, screen readers
5. **Offline** : Cache localStorage, sync à la reconnexion

## 🚀 Installation et configuration

### 1. Base de données
```bash
# Exécuter le schéma SQL
psql -h your-supabase-host -d postgres -f supabase_schema.sql
```

### 2. Variables d'environnement
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Dépendances
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "lucide-react": "^0.x",
    "next": "^14.x",
    "react": "^18.x"
  }
}
```

## 🎁 Fonctionnalités bonus (implémentées)

### ✅ **Progress Bar animée**
- Calcul automatique du pourcentage de completion
- Animation confettis 🎉 à 100%
- Indicateur visuel dans le header

### ✅ **Export de données**
- Format TXT avec structure claire
- Nom de fichier avec date automatique
- Contenu complet des 3 sections

### ✅ **Conseils IA intégrés**
- Section dédiée avec recommandations
- Tips contextuels pour une introspection efficace
- Design cohérent avec le reste de l'interface

### ✅ **Interface motivante**
- Placeholders encourageants ("Ajoute ta première réflexion, biloute !")
- Emojis contextuels pour chaque section
- Messages de félicitations à la completion

## 🔮 Améliorations futures

### À implémenter
- [ ] **Partage contrôlé** : Liens privés avec expiration
- [ ] **Historique visuel** : Timeline avec diff highlighting
- [ ] **Notifications push** : Rappels hebdomadaires
- [ ] **Export PDF** : Mise en page professionnelle
- [ ] **Sync offline** : IndexedDB avec synchronisation

### Optimisations possibles
- [ ] **Realtime** : Supabase subscriptions pour sync multi-device
- [ ] **Compression** : Optimisation des arrays TEXT[]
- [ ] **Cache intelligent** : Stratégie de mise en cache avancée
- [ ] **Analytics** : Métriques d'usage et d'engagement

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs de la console navigateur
2. Tester la connexion Supabase
3. Valider les permissions RLS
4. Consulter la documentation Supabase

---

**Version** : 2.0  
**Dernière mise à jour** : Mars 2025  
**Compatibilité** : Next.js 14+, React 18+, Supabase 2.x
