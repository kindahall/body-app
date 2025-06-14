// Script de diagnostic pour le problème de crédits
// File: debug-credits-issue.js
// À ouvrir dans la console du navigateur sur la page /credits

console.log('🔍 Diagnostic des crédits - BodyCount App');

// 1. Vérifier l'état d'authentification
console.log('1. État d'authentification:');
const authCookies = document.cookie.split(';').filter(c => c.includes('sb-'));
console.log('Cookies d\'authentification:', authCookies);

// 2. Vérifier les erreurs réseau
console.log('2. Vérification des erreurs réseau en cours...');

// 3. Tester la connexion à Supabase
(async () => {
  try {
    console.log('3. Test de connexion Supabase...');
    
    // Simuler une requête simple
    const response = await fetch('/api/test', { method: 'GET' });
    console.log('Réponse API test:', response.status);
    
    // Vérifier les variables d'environnement côté client
    console.log('4. Variables d\'environnement (côté client):');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', window.location.origin);
    
    // Vérifier le localStorage
    console.log('5. localStorage:');
    console.log('Test relations:', localStorage.getItem('test-relations'));
    console.log('Autres clés:', Object.keys(localStorage));
    
    // Vérifier l'état de l'application
    console.log('6. État de la page:');
    console.log('URL actuelle:', window.location.href);
    console.log('User Agent:', navigator.userAgent);
    
    // Instructions pour résoudre
    console.log('📋 INSTRUCTIONS DE RÉSOLUTION:');
    console.log('');
    console.log('Si vous voyez des erreurs de cookies:');
    console.log('1. Ouvrez un onglet privé/incognito');
    console.log('2. Allez sur votre app: http://localhost:3001');
    console.log('3. Reconnectez-vous');
    console.log('');
    console.log('Si le problème persiste:');
    console.log('1. Fermez tous les onglets de l\'app');
    console.log('2. Redémarrez le serveur de dev');
    console.log('3. Videz le cache du navigateur (Ctrl+Shift+R)');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
})();

// 4. Fonction pour nettoyer les cookies
window.clearAppCookies = () => {
  console.log('🧹 Nettoyage des cookies...');
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    if (name.includes('sb-') || name.includes('supabase') || name.includes('bodycount')) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      console.log('Supprimé:', name);
    }
  });
  console.log('✅ Cookies nettoyés. Rechargez la page.');
};

// 5. Fonction pour forcer la reconnexion
window.forceReconnect = () => {
  console.log('🔄 Redirection vers la page d\'authentification...');
  window.location.href = '/auth';
};

console.log('');
console.log('💡 COMMANDES UTILES:');
console.log('• clearAppCookies() - Nettoie les cookies');
console.log('• forceReconnect() - Force la reconnexion');
console.log('• location.reload() - Recharge la page'); 