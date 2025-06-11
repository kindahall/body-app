# 💝 Body - Gestionnaire de Relations

Une application moderne de gestion de relations interpersonnelles avec fonctionnalités avancées et système de crédits.

## 🚀 Fonctionnalités

### Core Features
- 👥 **Gestion de Relations** : Créez et gérez vos relations personnelles
- 📊 **Insights IA** : Analyses basées sur l'intelligence artificielle
- 📝 **Journal** : Suivi de vos interactions et émotions
- 🎯 **Mirror** : Réflexions et développement personnel

### Fonctionnalités Premium
- 💳 **Système de Crédits** : Intégration Stripe pour les achats
- 🎁 **Bonus Quotidien** : Crédits gratuits chaque jour
- 🔄 **Temps Réel** : Synchronisation instantanée
- 🌍 **Multilingue** : Support français/anglais

## 🛠️ Stack Technique

- **Frontend** : Next.js 15, TypeScript, Tailwind CSS v4
- **Backend** : Next.js API Routes, Supabase
- **Base de données** : PostgreSQL (Supabase)
- **Authentification** : Supabase Auth
- **Paiements** : Stripe
- **Déploiement** : Vercel

## 🔧 Installation

### Prérequis
```bash
Node.js 18+
npm/yarn/pnpm
```

### Configuration locale
```bash
# Cloner le repository
git clone https://github.com/votre-username/body-app.git
cd body-app

# Installer les dépendances
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env.local
```

### Variables d'environnement
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Lancer l'application
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 📦 Structure du Projet

```
src/
├── app/                    # App Router Next.js
│   ├── api/               # API Routes
│   │   └── stripe/        # Intégration Stripe
│   ├── auth/              # Authentification
│   ├── credits/           # Gestion des crédits
│   ├── relations/         # Gestion des relations
│   └── insights/          # Analyses IA
├── components/            # Composants réutilisables
├── lib/                   # Utilitaires et configuration
│   ├── supabase/         # Client Supabase
│   └── types/            # Types TypeScript
└── locales/              # Internationalisation
```

## 🔐 Sécurité

- **Row Level Security (RLS)** : Politiques Supabase strictes
- **Authentification** : JWT tokens sécurisés
- **Validation** : Types TypeScript + validation côté serveur
- **HTTPS** : Chiffrement end-to-end en production

## 🚀 Déploiement

### Production sur Vercel
```bash
# Connecter votre repository GitHub à Vercel
# Configurer les variables d'environnement dans Vercel
# Le déploiement se fait automatiquement

vercel --prod
```

### Configuration Stripe Production
1. Passer aux clés live dans les variables d'environnement
2. Configurer le webhook : `https://votre-domaine.com/api/stripe/webhook`
3. Événement : `checkout.session.completed`

## 📝 Développement

### Scripts disponibles
```bash
npm run dev          # Développement local
npm run build        # Build de production
npm run start        # Démarrer en production
npm run lint         # Linter
npm run type-check   # Vérification TypeScript
```

### Tests
```bash
npm run test         # Tests unitaires
npm run test:e2e     # Tests end-to-end
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@body-app.com
- 💬 Discord : [Lien vers Discord]
- 📚 Documentation : [Lien vers docs]

## 🎯 Roadmap

- [ ] Mode hors-ligne avec synchronisation
- [ ] Application mobile (React Native)
- [ ] Intégrations API externes
- [ ] Analytics avancés
- [ ] Notifications push

---

Développé avec ❤️ par [Votre Nom]
