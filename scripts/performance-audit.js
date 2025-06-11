#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 AUDIT DE PERFORMANCE - BodyCount App\n');

class PerformanceAuditor {
  constructor() {
    this.issues = [];
    this.stats = {
      duplicateLibraries: 0,
      unoptimizedImages: 0,
      missingLazyLoading: 0,
      largeComponents: 0,
      criticalIssues: 0
    };
  }

  async analyzePackageJson() {
    console.log('📦 1. ANALYSE DES DEPENDENCIES...\n');
    
    const packagePath = path.join(__dirname, '../package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Détecter les doublons de librairies
    const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
    
    // React Query ET SWR = doublon
    if (dependencies['@tanstack/react-query'] && dependencies['swr']) {
      this.issues.push({
        type: 'DUPLICATE_LIBRARIES',
        severity: 'HIGH',
        message: 'React Query ET SWR détectés - doublon de librairies',
        suggestion: 'Choisir une seule librairie pour la gestion du cache',
        impact: '~145KB de bundle en trop',
        fix: 'npm uninstall swr OU npm uninstall @tanstack/react-query'
      });
      this.stats.duplicateLibraries++;
      this.stats.criticalIssues++;
    }

    // Vérifier les versions très récentes
    const recentVersions = [];
    if (dependencies.react?.startsWith('^19')) {
      recentVersions.push('React 19');
    }
    if (dependencies.next?.startsWith('15.3')) {
      recentVersions.push('Next.js 15.3');
    }

    if (recentVersions.length > 0) {
      this.issues.push({
        type: 'BLEEDING_EDGE_VERSIONS',
        severity: 'MEDIUM',
        message: `Versions très récentes détectées: ${recentVersions.join(', ')}`,
        suggestion: 'Surveiller les bugs potentiels et avoir un plan de rollback',
        impact: 'Risque de bugs non documentés'
      });
    }

    // Analyser la taille du bundle
    const heavyLibraries = [];
    if (dependencies['react-confetti']) heavyLibraries.push('react-confetti');
    if (dependencies['react-use']) heavyLibraries.push('react-use');
    
    if (heavyLibraries.length > 0) {
      this.issues.push({
        type: 'HEAVY_DEPENDENCIES',
        severity: 'MEDIUM',
        message: `Dépendances lourdes: ${heavyLibraries.join(', ')}`,
        suggestion: 'Envisager des alternatives plus légères ou du lazy loading',
        impact: 'Bundle size augmenté'
      });
    }

    console.log(`   Total dependencies: ${Object.keys(dependencies).length}`);
    console.log(`   React Query: ${dependencies['@tanstack/react-query'] ? '✅' : '❌'}`);
    console.log(`   SWR: ${dependencies['swr'] ? '⚠️' : '❌'}`);
    console.log(`   Next.js version: ${dependencies.next || 'N/A'}`);
  }

  async analyzeComponents() {
    console.log('\n🧩 2. ANALYSE DES COMPOSANTS...\n');
    
    const srcDir = path.join(__dirname, '../src');
    this.walkDirectory(srcDir, (filePath, content) => {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        this.analyzeFile(filePath, content);
      }
    });

    console.log(`   Fichiers analysés: ${this.getFileCount(srcDir)}`);
    console.log(`   Composants lourds: ${this.stats.largeComponents}`);
    console.log(`   Images non optimisées: ${this.stats.unoptimizedImages}`);
  }

  analyzeFile(filePath, content) {
    const lines = content.split('\n');
    
    // Détecter les gros composants (>500 lignes)
    if (lines.length > 500) {
      this.stats.largeComponents++;
      this.issues.push({
        type: 'LARGE_COMPONENT',
        severity: 'MEDIUM',
        file: filePath,
        message: `Composant volumineux (${lines.length} lignes)`,
        suggestion: 'Diviser en plus petits composants ou lazy loading',
        impact: 'Bundle size et performance'
      });
    }

    // Détecter les imports non lazy
    lines.forEach((line, index) => {
      // Import dynamique manquant pour les composants lourds
      if (line.includes('import') && 
          (line.includes('Confetti') || line.includes('Chart') || line.includes('Gallery'))) {
        const isAlreadyDynamic = content.includes('dynamic(') || content.includes('lazy(');
        if (!isAlreadyDynamic) {
          this.issues.push({
            type: 'MISSING_LAZY_LOADING',
            severity: 'MEDIUM',
            file: filePath,
            line: index + 1,
            message: 'Composant lourd sans lazy loading',
            suggestion: 'Utiliser dynamic() de Next.js',
            code: line.trim()
          });
          this.stats.missingLazyLoading++;
        }
      }

      // Images non optimisées
      if (line.includes('<img') && !line.includes('OptimizedImage')) {
        this.stats.unoptimizedImages++;
        this.issues.push({
          type: 'UNOPTIMIZED_IMAGE',
          severity: 'HIGH',
          file: filePath,
          line: index + 1,
          message: 'Image non optimisée détectée',
          suggestion: 'Utiliser OptimizedImage au lieu de <img>',
          code: line.trim()
        });
      }
    });
  }

  walkDirectory(dir, callback) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        this.walkDirectory(filePath, callback);
      } else if (stat.isFile()) {
        const content = fs.readFileSync(filePath, 'utf8');
        callback(filePath, content);
      }
    });
  }

  getFileCount(dir) {
    let count = 0;
    this.walkDirectory(dir, () => count++);
    return count;
  }

  async analyzeBundleSize() {
    console.log('\n📊 3. ANALYSE DE LA TAILLE DU BUNDLE...\n');
    
    // Vérifier si .next existe
    const nextDir = path.join(__dirname, '../.next');
    if (!fs.existsSync(nextDir)) {
      console.log('   ⚠️ Dossier .next non trouvé - lancez `npm run build` d\'abord');
      return;
    }

    // Analyser les chunks JS
    const staticDir = path.join(nextDir, 'static');
    if (fs.existsSync(staticDir)) {
      this.walkDirectory(staticDir, (filePath, content) => {
        if (filePath.endsWith('.js')) {
          const sizeKB = Buffer.byteLength(content, 'utf8') / 1024;
          if (sizeKB > 500) { // Plus de 500KB
            this.issues.push({
              type: 'LARGE_BUNDLE_CHUNK',
              severity: 'HIGH',
              file: filePath,
              message: `Chunk volumineux: ${sizeKB.toFixed(1)}KB`,
              suggestion: 'Code splitting ou lazy loading nécessaire',
              impact: 'Performance de chargement dégradée'
            });
            this.stats.criticalIssues++;
          }
        }
      });
    }

    console.log('   Analyse des chunks terminée');
  }

  generateReport() {
    console.log('\n🎯 RAPPORT DE PERFORMANCE\n');
    
    // Score global
    const totalChecks = 10;
    const passedChecks = totalChecks - this.stats.criticalIssues;
    const score = Math.round((passedChecks / totalChecks) * 100);
    
    console.log(`📊 SCORE GLOBAL: ${score}/100`);
    
    if (score >= 90) {
      console.log('🟢 Excellente performance !');
    } else if (score >= 70) {
      console.log('🟡 Performance correcte, améliorations possibles');
    } else {
      console.log('🔴 Performance dégradée, optimisations urgentes');
    }

    // Statistiques
    console.log('\n📈 STATISTIQUES:');
    console.log(`   Librairies dupliquées: ${this.stats.duplicateLibraries}`);
    console.log(`   Images non optimisées: ${this.stats.unoptimizedImages}`);
    console.log(`   Composants sans lazy loading: ${this.stats.missingLazyLoading}`);
    console.log(`   Composants volumineux: ${this.stats.largeComponents}`);
    console.log(`   Problèmes critiques: ${this.stats.criticalIssues}`);

    // Issues par sévérité
    if (this.issues.length > 0) {
      console.log('\n🚨 PROBLÈMES DÉTECTÉS:\n');
      
      const grouped = this.issues.reduce((acc, issue) => {
        if (!acc[issue.severity]) acc[issue.severity] = [];
        acc[issue.severity].push(issue);
        return acc;
      }, {});

      // Afficher par ordre de priorité
      ['HIGH', 'MEDIUM', 'LOW'].forEach(severity => {
        if (grouped[severity]) {
          const icon = severity === 'HIGH' ? '🔴' : severity === 'MEDIUM' ? '🟡' : '🟢';
          console.log(`${icon} ${severity} (${grouped[severity].length} issues)`);
          
          grouped[severity].slice(0, 3).forEach(issue => {
            console.log(`\n   ${issue.type}:`);
            console.log(`   📋 ${issue.message}`);
            console.log(`   💡 ${issue.suggestion}`);
            if (issue.impact) console.log(`   💥 Impact: ${issue.impact}`);
            if (issue.fix) console.log(`   🔧 Fix: ${issue.fix}`);
            if (issue.file) console.log(`   📁 ${path.relative(process.cwd(), issue.file)}`);
          });
          
          if (grouped[severity].length > 3) {
            console.log(`   ... et ${grouped[severity].length - 3} autres`);
          }
        }
      });
    }

    // Recommandations prioritaires
    console.log('\n🎯 ACTIONS PRIORITAIRES:\n');
    
    if (this.stats.duplicateLibraries > 0) {
      console.log('1️⃣ URGENT - Supprimer les doublons de librairies');
      console.log('   • Choisir entre React Query OU SWR');
      console.log('   • Économie: ~145KB de bundle\n');
    }

    if (this.stats.unoptimizedImages > 0) {
      console.log('2️⃣ HIGH - Optimiser toutes les images');
      console.log('   • Remplacer <img> par <OptimizedImage>');
      console.log('   • Configurer les formats WebP/AVIF\n');
    }

    if (this.stats.missingLazyLoading > 0) {
      console.log('3️⃣ MEDIUM - Implémenter le lazy loading');
      console.log('   • Utiliser dynamic() pour les composants lourds');
      console.log('   • Amélioration du Time to Interactive\n');
    }

    console.log('💡 PROCHAINES ÉTAPES:');
    console.log('   1. Corriger les problèmes HIGH en priorité');
    console.log('   2. Lancer `npm run build` pour analyser le bundle');
    console.log('   3. Utiliser Lighthouse pour mesurer les Core Web Vitals');
    console.log('   4. Implémenter le monitoring en production');
  }
}

// Exécution
async function main() {
  const auditor = new PerformanceAuditor();
  
  try {
    await auditor.analyzePackageJson();
    await auditor.analyzeComponents();
    await auditor.analyzeBundleSize();
    auditor.generateReport();
  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error.message);
    process.exit(1);
  }
}

main(); 