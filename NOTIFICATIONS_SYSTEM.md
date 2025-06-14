# 🔔 Système de Notifications BodyCount

## Vue d'ensemble

Le système de notifications de BodyCount rappelle quotidiennement aux utilisateurs de compléter leurs activités dans l'application. Les notifications se réinitialisent automatiquement chaque jour à **6h du matin (heure française)**.

## 🚀 Fonctionnalités

### 1. Bouton de Notifications (Header)
- **Localisation** : En haut à droite de la page d'accueil
- **Indicateur visuel** : Badge rouge avec le nombre de notifications en attente
- **Animation** : Le bouton pulse quand il y a des notifications non lues
- **Dropdown** : Affiche toutes les activités en attente avec priorités

### 2. Notifications Quotidiennes
Les notifications sont organisées par priorité :

#### **Priorité Élevée (Rouge)** 🔴
- **Confession anonyme** : Partager ses pensées en toute anonymité
- **Journal intime** : Consigner ses réflexions du jour

#### **Priorité Moyenne (Jaune)** 🟡
- **Le miroir** : Introspection et développement personnel (hebdomadaire)
- **Wishlist secrète** : Gérer ses désirs et objectifs (hebdomadaire)
- **Insights IA** : Découvrir ses patterns relationnels (hebdomadaire)
- **Ajouter une relation** : Enrichir son profil relationnel (rappel)

#### **Priorité Faible (Bleu)** 🔵
- **Graphiques** : Visualiser ses données (hebdomadaire)

### 3. Toast de Notification Matinale
- **Apparition** : Entre 6h et 10h du matin (heure française)
- **Fréquence** : Une fois par jour maximum
- **Message** : Accueil chaleureux avec rappel des activités du jour
- **Auto-dismiss** : Peut être fermé manuellement

## 🛠️ Utilisation

### Pour l'Utilisateur

1. **Consulter les notifications** : Cliquer sur l'icône cloche en haut à droite
2. **Compléter une activité** : Cliquer sur une notification pour être redirigé vers la page correspondante
3. **Marquer comme lu** : Les notifications se marquent automatiquement comme complétées lors du clic
4. **Tout marquer** : Bouton "Tout marquer" pour marquer toutes les notifications comme lues

### Réinitialisation Automatique

Le système vérifie chaque minute si c'est 6h du matin (heure française) et :
- Réinitialise les notifications quotidiennes et hebdomadaires
- Conserve l'état des rappels
- Affiche le toast de bienvenue matinal
- Met à jour le compteur de notifications

## 🧪 Mode Démonstration

Un composant de démonstration est disponible en bas à droite de la page d'accueil (icône tube à essai) pour tester le système sans attendre 6h du matin.

---

*Ce système de notifications transforme l'utilisation de BodyCount en une expérience quotidienne engageante et structurée.* 🚀 