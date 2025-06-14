#!/usr/bin/env node

/**
 * Script utilitaire pour aider à l'internationalisation
 * Utilisation: node scripts/add-translations.js
 */

const fs = require('fs');
const path = require('path');

// Chemins des fichiers de traduction
const FR_PATH = path.join(__dirname, '../src/locales/fr.json');
const EN_PATH = path.join(__dirname, '../src/locales/en.json');

/**
 * Charge un fichier JSON de traduction
 */
function loadTranslations(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Erreur lors du chargement de ${filePath}:`, error.message);
    return {};
  }
}

/**
 * Sauvegarde un fichier JSON de traduction
 */
function saveTranslations(filePath, translations) {
  try {
    const content = JSON.stringify(translations, null, 2);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Traductions sauvegardées dans ${filePath}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la sauvegarde de ${filePath}:`, error.message);
  }
}

/**
 * Aplati un objet imbriqué en notation pointée
 */
function flattenObject(obj, prefix = '') {
  const flattened = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }
  
  return flattened;
}

/**
 * Fonction principale
 */
function main() {
  console.log('🌍 Vérification des traductions BodyCount...\n');
  
  // Charger les traductions
  const frTranslations = loadTranslations(FR_PATH);
  const enTranslations = loadTranslations(EN_PATH);
  
  const frFlat = flattenObject(frTranslations);
  const enFlat = flattenObject(enTranslations);
  
  const frKeys = Object.keys(frFlat);
  const enKeys = Object.keys(enFlat);
  
  const missingInEn = frKeys.filter(key => !enKeys.includes(key));
  const missingInFr = enKeys.filter(key => !frKeys.includes(key));
  
  // Afficher les résultats
  if (missingInEn.length > 0) {
    console.log('🇺🇸 Clés manquantes dans en.json:');
    missingInEn.forEach(key => console.log(`   - ${key}`));
    console.log('');
  }
  
  if (missingInFr.length > 0) {
    console.log('🇫🇷 Clés manquantes dans fr.json:');
    missingInFr.forEach(key => console.log(`   - ${key}`));
    console.log('');
  }
  
  if (missingInEn.length === 0 && missingInFr.length === 0) {
    console.log('✅ Toutes les traductions sont synchronisées!');
  } else {
    console.log(`📊 Statistiques:`);
    console.log(`   - Clés françaises: ${frKeys.length}`);
    console.log(`   - Clés anglaises: ${enKeys.length}`);
    console.log(`   - Manquantes en anglais: ${missingInEn.length}`);
    console.log(`   - Manquantes en français: ${missingInFr.length}`);
  }
  
  console.log('\n📝 Guide rapide:');
  console.log('1. Ajoutez vos traductions dans src/locales/fr.json et src/locales/en.json');
  console.log('2. Utilisez <FormattedMessage id="votre.cle" /> dans vos composants');
  console.log('3. Pour des traductions dynamiques, utilisez const intl = useIntl()');
  console.log('4. Relancez ce script pour vérifier la synchronisation');
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = {
  loadTranslations,
  saveTranslations,
  flattenObject
}; 