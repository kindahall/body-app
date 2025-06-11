#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script pour détecter les imports circulaires
 */

class ImportChecker {
  constructor() {
    this.dependencies = new Map();
    this.visiting = new Set();
    this.circularDeps = [];
  }

  // Extraire les imports d'un fichier
  extractImports(filePath, content) {
    const imports = [];
    
    // Regex pour les imports ES6
    const importRegex = /import\s+.*?\s+from\s+['"`](.+?)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Ignorer les modules node_modules
      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        continue;
      }
      
      // Résoudre le chemin relatif
      let resolvedPath = path.resolve(path.dirname(filePath), importPath);
      
      // Ajouter les extensions possibles
      const extensions = ['.ts', '.tsx', '.js', '.jsx'];
      for (const ext of extensions) {
        if (fs.existsSync(resolvedPath + ext)) {
          resolvedPath = resolvedPath + ext;
          break;
        }
      }
      
      // Vérifier si c'est un dossier avec index
      if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
        for (const ext of extensions) {
          const indexPath = path.join(resolvedPath, 'index' + ext);
          if (fs.existsSync(indexPath)) {
            resolvedPath = indexPath;
            break;
          }
        }
      }
      
      if (fs.existsSync(resolvedPath)) {
        imports.push(resolvedPath);
      }
    }
    
    return imports;
  }

  // Scanner un fichier
  scanFile(filePath) {
    if (this.dependencies.has(filePath)) {
      return;
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const imports = this.extractImports(filePath, content);
      this.dependencies.set(filePath, imports);
      
      // Scanner récursivement les imports
      for (const importPath of imports) {
        this.scanFile(importPath);
      }
    } catch (error) {
      console.warn(`Erreur lors de la lecture de ${filePath}:`, error.message);
    }
  }

  // Scanner un dossier
  scanDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        this.scanDirectory(fullPath, extensions);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        this.scanFile(fullPath);
      }
    }
  }

  // Détecter les cycles
  detectCycles(filePath, visited = new Set(), path = []) {
    if (this.visiting.has(filePath)) {
      // Cycle détecté
      const cycleStart = path.indexOf(filePath);
      const cycle = path.slice(cycleStart);
      cycle.push(filePath);
      this.circularDeps.push(cycle);
      return true;
    }
    
    if (visited.has(filePath)) {
      return false;
    }
    
    visited.add(filePath);
    this.visiting.add(filePath);
    path.push(filePath);
    
    const deps = this.dependencies.get(filePath) || [];
    for (const dep of deps) {
      this.detectCycles(dep, visited, [...path]);
    }
    
    this.visiting.delete(filePath);
    return false;
  }

  // Analyser tous les fichiers
  analyze() {
    console.log('🔍 Analyse des imports en cours...');
    
    // Scanner le dossier src
    this.scanDirectory('./src');
    
    console.log(`📊 ${this.dependencies.size} fichiers analysés`);
    
    // Détecter les cycles
    for (const filePath of this.dependencies.keys()) {
      this.detectCycles(filePath);
    }
    
    // Générer le rapport
    this.generateReport();
  }

  // Générer le rapport
  generateReport() {
    console.log('\n🔄 DÉTECTION D\'IMPORTS CIRCULAIRES\n');
    console.log('=' .repeat(50));
    
    if (this.circularDeps.length === 0) {
      console.log('\n✅ Aucun import circulaire détecté !');
    } else {
      console.log(`\n🚨 ${this.circularDeps.length} import(s) circulaire(s) détecté(s):\n`);
      
      this.circularDeps.forEach((cycle, index) => {
        console.log(`${index + 1}. Cycle détecté:`);
        cycle.forEach((file, i) => {
          const shortPath = path.relative('./src', file);
          if (i === cycle.length - 1) {
            console.log(`   └─ ${shortPath} (retour au début)`);
          } else {
            console.log(`   ├─ ${shortPath}`);
          }
        });
        console.log('');
      });
      
      console.log('💡 SOLUTIONS:');
      console.log('• Déplacer les types/interfaces partagés dans un fichier séparé');
      console.log('• Utiliser l\'injection de dépendances');
      console.log('• Restructurer l\'architecture des modules');
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log(`Analyse terminée. ${this.circularDeps.length} problèmes trouvés.`);
  }
}

// Exécution du script
function main() {
  const checker = new ImportChecker();
  checker.analyze();
}

if (require.main === module) {
  main();
}

module.exports = ImportChecker; 