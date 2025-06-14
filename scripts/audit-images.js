#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script d'audit des performances d'images
 * Analyse l'utilisation des images dans l'application et détecte les problèmes de performance
 */

class ImageAuditor {
  constructor() {
    this.issues = [];
    this.stats = {
      totalImages: 0,
      optimizedImages: 0,
      unoptimizedImages: 0,
      missingAlt: 0,
      missingLazyLoading: 0,
      missingSizes: 0,
      lowQuality: 0
    };
  }

  // Analyser un fichier pour les problèmes d'images
  analyzeFile(filePath, content) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Détecter les balises <img> non optimisées
      const imgMatches = line.match(/<img[^>]*>/g);
      if (imgMatches) {
        imgMatches.forEach(imgTag => {
          this.stats.totalImages++;
          this.stats.unoptimizedImages++;
          
          this.issues.push({
            type: 'UNOPTIMIZED_IMG',
            severity: 'HIGH',
            file: filePath,
            line: lineNumber,
            message: 'Utilisation de <img> au lieu de Next.js Image ou OptimizedImage',
            suggestion: 'Remplacer par <OptimizedImage> pour de meilleures performances',
            code: imgTag.trim()
          });
          
          // Vérifier l'attribut alt
          if (!imgTag.includes('alt=')) {
            this.stats.missingAlt++;
            this.issues.push({
              type: 'MISSING_ALT',
              severity: 'MEDIUM',
              file: filePath,
              line: lineNumber,
              message: 'Attribut alt manquant',
              suggestion: 'Ajouter un attribut alt descriptif pour l\'accessibilité',
              code: imgTag.trim()
            });
          }
          
          // Vérifier le lazy loading
          if (!imgTag.includes('loading=') && !imgTag.includes('priority')) {
            this.stats.missingLazyLoading++;
            this.issues.push({
              type: 'MISSING_LAZY_LOADING',
              severity: 'MEDIUM',
              file: filePath,
              line: lineNumber,
              message: 'Lazy loading manquant',
              suggestion: 'Ajouter loading="lazy" ou priority pour les images importantes',
              code: imgTag.trim()
            });
          }
        });
      }
      
      // Détecter les composants Image de Next.js
      const nextImageMatches = line.match(/<Image[^>]*>/g);
      if (nextImageMatches) {
        nextImageMatches.forEach(imageTag => {
          this.stats.totalImages++;
          this.stats.optimizedImages++;
          
          // Vérifier l'attribut sizes pour les images responsives
          if (imageTag.includes('fill') && !imageTag.includes('sizes=')) {
            this.stats.missingSizes++;
            this.issues.push({
              type: 'MISSING_SIZES',
              severity: 'MEDIUM',
              file: filePath,
              line: lineNumber,
              message: 'Attribut sizes manquant pour une image avec fill',
              suggestion: 'Ajouter sizes="..." pour optimiser le responsive',
              code: imageTag.trim()
            });
          }
          
          // Vérifier la qualité
          const qualityMatch = imageTag.match(/quality=\{?(\d+)\}?/);
          if (qualityMatch && parseInt(qualityMatch[1]) < 60) {
            this.stats.lowQuality++;
            this.issues.push({
              type: 'LOW_QUALITY',
              severity: 'LOW',
              file: filePath,
              line: lineNumber,
              message: `Qualité d'image très basse (${qualityMatch[1]})`,
              suggestion: 'Considérer une qualité entre 75-85 pour un bon compromis',
              code: imageTag.trim()
            });
          }
        });
      }
      
      // Détecter les composants OptimizedImage
      const optimizedImageMatches = line.match(/<OptimizedImage[^>]*>/g);
      if (optimizedImageMatches) {
        optimizedImageMatches.forEach(imageTag => {
          this.stats.totalImages++;
          this.stats.optimizedImages++;
        });
      }
      
      // Détecter les images en background CSS
      const bgImageMatches = line.match(/background-image:\s*url\([^)]+\)|bg-\[url\([^)]+\)\]/g);
      if (bgImageMatches) {
        bgImageMatches.forEach(bgImage => {
          this.stats.totalImages++;
          this.stats.unoptimizedImages++;
          
          this.issues.push({
            type: 'CSS_BACKGROUND_IMAGE',
            severity: 'MEDIUM',
            file: filePath,
            line: lineNumber,
            message: 'Image en background CSS non optimisée',
            suggestion: 'Utiliser OptimizedImage avec objectFit="cover" si possible',
            code: bgImage.trim()
          });
        });
      }
      
      // Détecter URL.createObjectURL (preview d'upload)
      if (line.includes('URL.createObjectURL') && line.includes('<img')) {
        this.issues.push({
          type: 'BLOB_URL_IMG',
          severity: 'LOW',
          file: filePath,
          line: lineNumber,
          message: 'Utilisation de <img> avec URL.createObjectURL',
          suggestion: 'Utiliser OptimizedImage même pour les previews d\'upload',
          code: line.trim()
        });
      }
    });
  }

  // Scanner récursivement un dossier
  scanDirectory(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        this.scanDirectory(fullPath, extensions);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          this.analyzeFile(fullPath, content);
        } catch (error) {
          console.warn(`Erreur lors de la lecture de ${fullPath}:`, error.message);
        }
      }
    });
  }

  // Générer le rapport
  generateReport() {
    console.log('\n🖼️  AUDIT DES PERFORMANCES D\'IMAGES\n');
    console.log('=' .repeat(50));
    
    // Statistiques générales
    console.log('\n📊 STATISTIQUES GÉNÉRALES:');
    console.log(`Total d'images trouvées: ${this.stats.totalImages}`);
    console.log(`Images optimisées: ${this.stats.optimizedImages} (${Math.round(this.stats.optimizedImages / this.stats.totalImages * 100)}%)`);
    console.log(`Images non optimisées: ${this.stats.unoptimizedImages} (${Math.round(this.stats.unoptimizedImages / this.stats.totalImages * 100)}%)`);
    
    // Score de performance
    const score = this.stats.totalImages > 0 ? Math.round(this.stats.optimizedImages / this.stats.totalImages * 100) : 100;
    let scoreColor = '🔴';
    if (score >= 80) scoreColor = '🟢';
    else if (score >= 60) scoreColor = '🟡';
    
    console.log(`\n${scoreColor} SCORE DE PERFORMANCE: ${score}/100`);
    
    // Problèmes détectés
    if (this.issues.length > 0) {
      console.log('\n🚨 PROBLÈMES DÉTECTÉS:');
      
      const groupedIssues = this.issues.reduce((acc, issue) => {
        if (!acc[issue.type]) acc[issue.type] = [];
        acc[issue.type].push(issue);
        return acc;
      }, {});
      
      Object.entries(groupedIssues).forEach(([type, issues]) => {
        const severity = issues[0].severity;
        const icon = severity === 'HIGH' ? '🔴' : severity === 'MEDIUM' ? '🟡' : '🟢';
        
        console.log(`\n${icon} ${type} (${issues.length} occurrences)`);
        console.log(`   Sévérité: ${severity}`);
        console.log(`   Description: ${issues[0].message}`);
        console.log(`   Solution: ${issues[0].suggestion}`);
        
        // Afficher quelques exemples
        issues.slice(0, 3).forEach(issue => {
          console.log(`   📁 ${issue.file}:${issue.line}`);
        });
        
        if (issues.length > 3) {
          console.log(`   ... et ${issues.length - 3} autres`);
        }
      });
    } else {
      console.log('\n✅ Aucun problème détecté !');
    }
    
    // Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    
    if (this.stats.unoptimizedImages > 0) {
      console.log('• Remplacer toutes les balises <img> par OptimizedImage');
      console.log('• Configurer next.config.ts avec les domaines d\'images externes');
    }
    
    if (this.stats.missingAlt > 0) {
      console.log('• Ajouter des attributs alt descriptifs pour l\'accessibilité');
    }
    
    if (this.stats.missingSizes > 0) {
      console.log('• Ajouter l\'attribut sizes pour les images responsives');
    }
    
    console.log('• Utiliser des formats modernes (WebP, AVIF) via Next.js Image');
    console.log('• Implémenter le lazy loading pour toutes les images non critiques');
    console.log('• Optimiser la qualité selon le contexte (75-85% généralement)');
    
    console.log('\n' + '=' .repeat(50));
    console.log(`Audit terminé. ${this.issues.length} problèmes trouvés.`);
  }

  // Générer un rapport JSON détaillé
  generateJSONReport(outputPath) {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      score: Math.round(this.stats.optimizedImages / this.stats.totalImages * 100),
      issues: this.issues
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Rapport détaillé sauvegardé: ${outputPath}`);
  }
}

// Exécution du script
function main() {
  const auditor = new ImageAuditor();
  
  console.log('🔍 Analyse des images en cours...');
  
  // Scanner le dossier src
  auditor.scanDirectory('./src');
  
  // Générer le rapport
  auditor.generateReport();
  
  // Sauvegarder le rapport JSON
  auditor.generateJSONReport('./image-audit-report.json');
}

if (require.main === module) {
  main();
}

module.exports = ImageAuditor; 