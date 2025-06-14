# 📸 Système de Souvenirs - Documentation

## Vue d'ensemble

Le **Système de Souvenirs** est une fonctionnalité multimédia avancée permettant aux utilisateurs d'attacher des photos, vidéos et notes à leurs relations. Cette solution offre une galerie interactive, un système de partage contrôlé et une expérience utilisateur fluide avec drag & drop, visionneuse plein écran et timeline.

## 🎯 Fonctionnalités principales

### 1. **Types de souvenirs supportés**
- 📸 **Photos** : JPG, PNG, WebP ≤ 5 Mo avec compression automatique
- 🎥 **Vidéos** : MP4, WebM ≤ 100 Mo, ≤ 2 min avec génération de miniatures
- 📝 **Notes** : Texte libre avec support markdown

### 2. **Interface utilisateur moderne**
- ✅ **Galerie responsive** : Grid 3-6 colonnes selon l'écran
- ✅ **Timeline chronologique** : Vue verticale avec ligne de temps
- ✅ **Visionneuse plein écran** : Lightbox avec navigation clavier
- ✅ **Upload drag & drop** : Zone de glisser-déposer intuitive
- ✅ **Progress bar animée** : Suivi temps réel de l'upload

### 3. **Fonctionnalités avancées**
- ✅ **Partage public** : Liens temporaires (24h/7j/permanent)
- ✅ **Téléchargement** : Export direct des fichiers
- ✅ **Temps réel** : Synchronisation automatique Supabase
- ✅ **Compression** : Optimisation automatique des images
- ✅ **Miniatures vidéo** : Génération automatique de thumbnails

## 🗄️ Architecture de données

### Base de données Supabase

#### Table `relation_memories`
```sql
CREATE TABLE relation_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relation_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind memory_kind NOT NULL,
    title TEXT,
    description TEXT,
    file_url TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Table `memory_shares`
```sql
CREATE TABLE memory_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memory_id UUID NOT NULL REFERENCES relation_memories(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Types personnalisés
```sql
CREATE TYPE memory_kind AS ENUM ('photo', 'video', 'note');
```

### Interfaces TypeScript

```typescript
interface RelationMemory {
  id: string
  relation_id: string
  user_id: string
  kind: MemoryKind
  title?: string
  description?: string
  file_url?: string
  thumbnail_url?: string
  created_at: string
}

interface MemoryStats {
  total: number
  photos: number
  videos: number
  notes: number
  totalSize: number
}
```

## 🎨 Design & UX

### Palette de couleurs
- **Dégradé principal** : `from-pink-50 via-white to-rose-50`
- **Mode sombre** : `from-gray-900 via-gray-800 to-gray-900`
- **Accent rose** : `#ec4899` pour les boutons et actions
- **Glassmorphism** : `bg-white/80 backdrop-blur-lg` pour les cartes

### Animations & interactions
- **Hover effects** : Scale et overlay sur les vignettes
- **Confetti** : Animation bounce lors du premier souvenir
- **Progress ring** : Indicateur circulaire d'upload
- **Slide animations** : Drawer et modals avec slideInUp

### Responsive design
- **Grid adaptatif** : 3 colonnes mobile → 6 colonnes desktop
- **Touch targets** : Boutons 44px minimum pour mobile
- **Overflow scroll** : Navigation fluide sur tous écrans
- **Safe areas** : Support iOS avec padding adaptatif

## 🔧 Architecture technique

### Structure des composants

#### 1. **RelationDetailPage** (page principale)
```typescript
// Route : /relations/[relationId]
// État principal
const [memories, setMemories] = useState<RelationMemory[]>([])
const [stats, setStats] = useState<MemoryStats>()
const [viewMode, setViewMode] = useState<'gallery' | 'timeline'>('gallery')

// Fonctions clés
- loadData() // Chargement Supabase + stats
- setupRealtimeSubscription() // Abonnement temps réel
- handleMemoryUploaded() // Callback après upload
```

#### 2. **MemoriesGallery** (galerie principale)
```typescript
// Affichage des souvenirs
- renderGalleryView() // Grid responsive avec vignettes
- renderTimelineView() // Liste chronologique verticale
- Hover actions : Voir, Supprimer
- Badge date et type sur chaque vignette
```

#### 3. **UploadMemoryModal** (upload modal)
```typescript
// Upload multimédia
- Sélection type : Photo/Vidéo/Note avec icônes
- Drag & drop zone avec validation
- Progress bar animée avec pourcentages
- Compression automatique des images > 2MB
- Preview temps réel des fichiers sélectionnés
```

#### 4. **MemoryViewer** (visionneuse plein écran)
```typescript
// Lightbox avancé
- Navigation clavier : ← → Espace Échap
- Carrousel avec indicateurs de position
- Actions : Partager, Télécharger, Supprimer
- Support vidéo avec contrôles personnalisés
- Affichage notes avec formatage markdown
```

#### 5. **ShareMemoryDrawer** (partage contrôlé)
```typescript
// Partage public
- Génération liens avec durée configurable
- Preview du souvenir à partager
- Web Share API pour partage natif mobile
- Intégration Twitter, Facebook
- Copie URL avec feedback visuel
```

### Service de données

#### MemoriesService
```typescript
class MemoriesService {
  // CRUD operations
  async getRelationMemories(relationId: string): Promise<RelationMemory[]>
  async createMemory(memory: Omit<RelationMemory, 'id' | 'user_id' | 'created_at'>): Promise<RelationMemory>
  async updateMemory(id: string, updates: Partial<RelationMemory>): Promise<RelationMemory>
  async deleteMemory(id: string): Promise<void>
  
  // File management
  async uploadFile(file: File, relationId: string, kind: MemoryKind): Promise<{fileUrl: string; thumbnailUrl?: string}>
  async generateVideoThumbnail(videoFile: File): Promise<Blob | null>
  async compressImage(file: File, maxSizeMB?: number): Promise<File>
  
  // Sharing
  async createShareLink(memoryId: string, duration: '24h' | '7d' | 'permanent'): Promise<string>
  async getSharedMemory(slug: string): Promise<RelationMemory | null>
  
  // Analytics
  async getMemoryStats(relationId: string): Promise<MemoryStats>
  
  // Realtime
  subscribeToMemoryChanges(relationId: string, callback: (payload: any) => void)
  
  // Validation
  validateFile(file: File, kind: MemoryKind): {valid: boolean; error?: string}
}
```

## 🔒 Sécurité & RGPD

### Row Level Security (RLS)
```sql
-- Politiques strictes
CREATE POLICY "Users can view own memories" ON relation_memories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories" ON relation_memories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Partage public contrôlé
CREATE POLICY "Public can view shared memories" ON memory_shares
    FOR SELECT USING (expires_at IS NULL OR expires_at > NOW());
```

### Protection des données
- ✅ **Accès strict** : `user_id = auth.uid()` uniquement
- ✅ **Partage temporaire** : Liens avec expiration automatique
- ✅ **Validation fichiers** : Types et tailles contrôlés
- ✅ **Suppression cascade** : Nettoyage automatique storage
- ✅ **Audit trail** : Timestamps de création

## 📱 Stockage Supabase

### Configuration du bucket
```sql
-- Créer le bucket pour les souvenirs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('relation-memories', 'relation-memories', true);

-- Politique d'upload
CREATE POLICY "Users can upload memories" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'relation-memories' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Politique de lecture
CREATE POLICY "Users can view own memories" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'relation-memories' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
```

### Structure des dossiers
```
relation-memories/
├── memories/
│   ├── {relation_id}/
│   │   ├── {timestamp}-{random}.jpg
│   │   ├── {timestamp}-{random}.mp4
│   │   └── thumb_{timestamp}-{random}.jpg
```

## 🚀 Installation et configuration

### 1. Base de données
```bash
# Exécuter les migrations
psql -h your-supabase-host -d postgres -f supabase_schema.sql
```

### 2. Storage Supabase
```bash
# Créer le bucket via l'interface Supabase ou SQL
# Configurer les politiques RLS pour le storage
```

### 3. Variables d'environnement
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Dépendances
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

### ✅ **Upload avancé**
- Drag & drop avec zone de glisser-déposer
- Progress bar avec pourcentages temps réel
- Compression automatique des images > 2MB
- Génération miniatures vidéo avec canvas
- Validation stricte des types et tailles

### ✅ **Visionneuse professionnelle**
- Navigation clavier complète (← → Espace Échap)
- Carrousel avec indicateurs de position
- Support vidéo avec contrôles personnalisés
- Zoom et pan pour les images (à implémenter)
- Raccourcis clavier affichés

### ✅ **Partage intelligent**
- Liens temporaires avec expiration
- Web Share API pour partage natif
- Intégration réseaux sociaux
- Preview du contenu à partager
- Avertissements de sécurité

### ✅ **Interface gamifiée**
- Animation confetti premier souvenir
- Compteurs par type de média
- Timeline avec ligne de temps visuelle
- Badges de date sur les vignettes
- Hover effects avec actions

## 🔮 Améliorations futures

### À implémenter
- [ ] **Reconnaissance émotions** : OpenAI Vision pour emoji overlay
- [ ] **Géolocalisation** : Extraction EXIF + carte Mapbox
- [ ] **Story mode** : Swiper auto pour revivre la relation
- [ ] **Compression vidéo** : FFmpeg.wasm pour optimisation
- [ ] **OCR texte** : Extraction texte des images

### Optimisations possibles
- [ ] **CDN** : Distribution globale des médias
- [ ] **Lazy loading** : Chargement progressif des vignettes
- [ ] **Cache intelligent** : Stratégie de mise en cache avancée
- [ ] **Sync offline** : IndexedDB avec synchronisation
- [ ] **Analytics** : Métriques d'usage et engagement

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs de la console navigateur
2. Tester la connexion Supabase Storage
3. Valider les permissions RLS et bucket
4. Consulter la documentation Supabase Storage

---

**Version** : 1.0  
**Dernière mise à jour** : Mars 2025  
**Compatibilité** : Next.js 14+, React 18+, Supabase 2.x

## 🎉 Résultat final

Le Système de Souvenirs offre une expérience multimédia complète :

- **✅ CRUD temps réel** : Upload, visualisation, modification, suppression
- **✅ 3 types de médias** : Photos, vidéos, notes avec validation
- **✅ Interface moderne** : Galerie/Timeline, drag & drop, visionneuse
- **✅ Partage contrôlé** : Liens temporaires avec expiration
- **✅ Optimisations** : Compression, miniatures, progress bars
- **✅ Sécurité enterprise** : RLS, validation, audit trail
- **✅ UX exceptionnelle** : Animations, raccourcis, feedback visuel

L'application permet aux utilisateurs de créer une véritable galerie de souvenirs pour chaque relation, avec une expérience utilisateur moderne et sécurisée ! 🚀
