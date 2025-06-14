// Script pour créer des données de test
// Copiez-collez ce code dans la console de votre navigateur pour créer des données de test

localStorage.setItem('test-relations', JSON.stringify([
  {
    id: '1',
    type: 'romantic',
    name: 'Emma',
    start_date: '2023-06-15',
    location: 'Paris',
    duration: '8 mois',
    feelings: 'Une relation intense et passionnée. Beaucoup de complicité et de moments magiques.',
    rating: 8,
    private_note: 'Très belle expérience',
    created_at: '2023-06-16T10:00:00Z'
  },
  {
    id: '2',
    type: 'friend',
    name: 'Alex',
    start_date: '2023-03-10',
    location: 'Lyon',
    duration: '1 an',
    feelings: 'Une amitié solide et durable. Toujours là dans les moments difficiles.',
    rating: 9,
    private_note: 'Ami fidèle',
    created_at: '2023-03-11T14:30:00Z'
  },
  {
    id: '3',
    type: 'sexual',
    name: 'Morgan',
    start_date: '2023-08-20',
    location: 'Marseille',
    duration: '3 mois',
    feelings: 'Relation physique intense mais pas de sentiments profonds.',
    rating: 6,
    private_note: 'Expérience enrichissante',
    created_at: '2023-08-21T16:45:00Z'
  },
  {
    id: '4',
    type: 'friendzone',
    name: 'Julie',
    start_date: '2023-09-05',
    location: 'Nice',
    duration: '2 mois',
    feelings: 'J\'étais intéressé mais elle ne voyait que de l\'amitié.',
    rating: 4,
    private_note: 'Situation compliquée',
    created_at: '2023-09-06T11:20:00Z'
  },
  {
    id: '5',
    type: 'other',
    name: 'Pat',
    start_date: '2023-01-12',
    location: 'Bordeaux',
    duration: '6 mois',
    feelings: 'Relation de travail qui a évolué en quelque chose de plus personnel.',
    rating: 7,
    private_note: 'Collègue devenu proche',
    created_at: '2023-01-13T09:15:00Z'
  }
]));

console.log('✅ Données de test créées avec succès !');
console.log('📊 5 relations ajoutées : 1 romantique, 1 sexuelle, 1 amitié, 1 friendzone, 1 autre');
console.log('📈 Note moyenne calculée automatiquement');
console.log('🔄 Rechargez la page pour voir les statistiques !'); 