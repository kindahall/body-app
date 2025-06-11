// Données de test qui correspondent à ce que vous avez dans votre interface
// Copiez-collez ce code dans la console de votre navigateur

localStorage.setItem('test-relations', JSON.stringify([
  {
    id: '1',
    type: 'other',
    name: 'adeline',
    start_date: '2023-06-17',
    location: 'rennes',
    duration: null,
    feelings: 'pas terrible, femme possessive.',
    rating: 4,
    private_note: 'Expérience compliquée',
    created_at: '2023-06-17T10:00:00Z'
  },
  {
    id: '2', 
    type: 'other',
    name: 'celine',
    start_date: '2025-05-31',
    location: 'paris',
    duration: null,
    feelings: 'c etait vraiment geniale comme histoire',
    rating: 6,
    private_note: 'Très bonne expérience',
    created_at: '2025-05-31T14:30:00Z'
  }
]));

console.log('✅ Données de test créées pour correspondre à votre interface !');
console.log('📊 2 relations ajoutées de type "Autre"');
console.log('🔄 Rechargez la page pour voir les statistiques !');

// Vérification des données
const testData = JSON.parse(localStorage.getItem('test-relations') || '[]');
console.log('Données stockées:', testData);
testData.forEach(relation => {
  console.log(`- ${relation.name}: type "${relation.type}", note ${relation.rating}/10`);
}); 