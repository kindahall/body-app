#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🖼️ AUTO-FIX : Remplacement des <img> par <OptimizedImage>\n');

class ImageFixer {
  constructor() {
    this.fixes = 0;
    this.files = 0;
  }

  // Fichiers avec images non optimisées
  fixImageFiles() {
    const filesToFix = [
      'src/app/wishlist/ItemCard.tsx',
      'src/app/wishlist/AddEditModal.tsx', 
      'src/app/profiles/[id]/ShareMemoryDrawer.tsx',
      'src/app/confessions/page.tsx',
      'src/app/relations/[relationId]/ShareMemoryDrawer.tsx'
    ];

    filesToFix.forEach(relativePath => {
      this.fixFile(relativePath);
    });
  }

  fixFile(relativePath) {
    const filePath = path.join(__dirname, '..', relativePath);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ Fichier non trouvé: ${relativePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Ajouter l'import OptimizedImage s'il n'existe pas
    if (!content.includes("import OptimizedImage") && content.includes('<img')) {
      // Trouver la ligne d'import appropriée pour ajouter OptimizedImage
      if (content.includes("from 'lucide-react'")) {
        content = content.replace(
          /from 'lucide-react'/,
          "from 'lucide-react'\nimport OptimizedImage from '@/components/ui/OptimizedImage'"
        );
      } else if (content.includes("'use client'")) {
        content = content.replace(
          "'use client'",
          "'use client'\n\nimport OptimizedImage from '@/components/ui/OptimizedImage'"
        );
      }
    }

    // Compter les img tags avant correction
    const imgMatches = content.match(/<img[^>]*>/g) || [];
    
    // Remplacements simples pour les cas les plus courants
    content = content.replace(/<img\s+/g, '<OptimizedImage ');
    content = content.replace(/OptimizedImage([^>]*?)>/g, (match, attrs) => {
      // Ajouter width/height si pas présents
      if (!attrs.includes('width=') && !attrs.includes('height=')) {
        return `OptimizedImage${attrs} width={400} height={300} quality={80}>`;
      }
      return match;
    });

    // Sauvegarder si des changements ont été effectués
    if (content !== originalContent && imgMatches.length > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${relativePath}: ${imgMatches.length} images optimisées`);
      this.fixes += imgMatches.length;
      this.files++;
    }
  }

  generateReport() {
    console.log('\n🎯 RAPPORT D\'OPTIMISATION D\'IMAGES');
    console.log('===================================');
    console.log(`📁 Fichiers corrigés: ${this.files}`);
    console.log(`🖼️ Images optimisées: ${this.fixes}`);
    console.log('');
    console.log('✅ Avantages de OptimizedImage:');
    console.log('   • Formats modernes (WebP, AVIF)');
    console.log('   • Lazy loading automatique');
    console.log('   • Responsive avec breakpoints');
    console.log('   • Compression optimisée');
    console.log('');
    if (this.fixes > 0) {
      console.log('🚀 Performance améliorée !');
    }
  }
}

// Exécution
const fixer = new ImageFixer();

try {
  fixer.fixImageFiles();
  fixer.generateReport();
} catch (error) {
  console.error('❌ Erreur lors de l\'optimisation:', error.message);
  process.exit(1);
} 