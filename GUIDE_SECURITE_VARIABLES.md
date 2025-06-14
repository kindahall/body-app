# 🔒 Guide de Sécurité - Variables d'Environnement

## Vue d'ensemble

Ce guide vous aide à sécuriser vos variables d'environnement dans BodyCount App. Les variables mal configurées peuvent exposer des clés API sensibles.

## 🚨 Problèmes de sécurité identifiés

### ✅ **Problèmes résolus :**
- Logs exposant `process.env` supprimés
- Script d'audit de sécurité créé
- Variables d'environnement documentées

### ⚠️ **À vérifier :**
- Votre fichier `.env.local` contient-il de vraies clés ?
- Ces clés sont-elles différentes en production ?
- Le fichier `.env.local` est-il dans `.gitignore` ?

## 📋 Variables d'environnement requises

### **Variables publiques (exposées côté client) :**
```env
# Supabase (OBLIGATOIRE)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Stripe (OPTIONNEL)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Application (OPTIONNEL)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Variables privées (côté serveur seulement) :**
```env
# Supabase Service (GARDEZ SECRÈTE)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Stripe (GARDEZ SECRÈTES)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PACK_50=price_...
STRIPE_PRICE_PACK_150=price_...
STRIPE_PRICE_PACK_500=price_...

# IA APIs (OPTIONNEL)
OPENAI_API_KEY=sk-...
CLAUDE_API_KEY=sk-ant-...
```

## 🛡️ Bonnes pratiques de sécurité

### **1. Gestion des fichiers**
```bash
# ✅ Votre .gitignore doit contenir :
.env*
.env.local
.env.production

# ❌ Ne commitez JAMAIS :
.env.local avec de vraies clés
.env.production avec des clés live
```

### **2. Séparation dev/production**
```env
# Développement (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
STRIPE_SECRET_KEY=sk_test_...

# Production (variables Vercel/serveur)
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
STRIPE_SECRET_KEY=sk_live_...
```

### **3. Rotation des clés**
- 🔄 Changez les clés tous les 6 mois
- 🚨 Régénérez immédiatement si exposées
- 📝 Documentez les changements d'équipe

## 🔧 Outils de sécurité

### **Script d'audit automatique :**
```bash
# Lancer l'audit de sécurité
npm run security-audit

# Vérifier les imports circulaires
npm run check-imports

# Nettoyer les logs de debug
npm run clean-logs
```

### **Que vérifie l'audit :**
- ✅ Variables `NEXT_PUBLIC_*` légitimes
- ❌ Logs exposant des données sensibles
- 📁 Fichiers `.env*` dans `.gitignore`
- 🔍 Patterns de sécurité dans `next.config.ts`

## 📊 Exemple de rapport d'audit

```
🔒 AUDIT DE SÉCURITÉ - BodyCount App
=====================================

1. 📄 Vérification des fichiers d'environnement
✅ .env.local est protégé par .gitignore

2. 🌐 Variables NEXT_PUBLIC (exposées côté client)
✅ NEXT_PUBLIC_SUPABASE_URL - Autorisée
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY - Autorisée
⚠️ NEXT_PUBLIC_DEBUG_MODE - Non répertoriée (vérifiez)

3. 🚨 Détection des logs dangereux
✅ Aucun log dangereux détecté

📊 RECOMMANDATIONS DE SÉCURITÉ
==============================
✅ Audit terminé !
```

## 🚨 Actions d'urgence

### **Si des clés sont exposées :**

1. **Immédiatement :**
   ```bash
   # Supprimer le commit compromis
   git reset --hard HEAD~1
   git push --force-with-lease
   ```

2. **Dans les 15 minutes :**
   - Régénérer toutes les clés exposées
   - Changer les mots de passe associés
   - Révoquer les anciens accès

3. **Dans l'heure :**
   - Audit complet des logs d'accès
   - Notification de l'équipe
   - Mise à jour de la documentation

## 🔍 Vérification manuelle

### **Checklist de sécurité :**
- [ ] `.env.local` est dans `.gitignore`
- [ ] Aucune variable secrète dans le code source
- [ ] Variables différentes dev/prod
- [ ] Clés régénérées récemment
- [ ] Accès d'équipe documentés
- [ ] Backup sécurisé des clés de production

### **Commandes de vérification :**
```bash
# Vérifier .gitignore
grep -E "^\.env" .gitignore

# Chercher des clés hardcodées
grep -r "sk_live\|sk_test" src/

# Lister les variables d'environnement
env | grep -E "SUPABASE|STRIPE|OPENAI"
```

## 📝 Log d'audit

Tenez un log des audits de sécurité :

```
Date: 2024-01-15
Auditeur: [Nom]
Statut: ✅ Conforme
Actions: Rotation clés Stripe
Prochaine révision: 2024-07-15
```

## 🆘 Support

En cas de problème de sécurité :

1. **Lancez l'audit :** `npm run security-audit`
2. **Vérifiez les logs :** Recherchez les erreurs dans la console
3. **Consultez ce guide :** Suivez les recommandations
4. **Contactez l'équipe :** Si le problème persiste

---

**⚠️ RAPPEL IMPORTANT :** La sécurité est la responsabilité de toute l'équipe. Un seul fichier mal configuré peut compromettre toute l'application. 