#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('⚡ AUTO-FIX : Implémentation du lazy loading pour les composants lourds\n');

class LazyLoadingFixer {
  constructor() {
    this.fixes = 0;
    this.files = 0;
  }

  // Fix spécial pour la page d'accueil qui a déjà des dynamic imports
  optimizeLandingPage() {
    const filePath = path.join(__dirname, '../src/app/page.tsx');
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Vérifier si les composants sont déjà importés dynamiquement
    if (content.includes('Dynamic imports for heavy components')) {
      console.log('✅ src/app/page.tsx: Lazy loading déjà implémenté');
      return;
    }

    // Si on trouve des imports directs, les convertir en dynamic
    const componentsToOptimize = [
      { name: 'ScreenshotsCarousel', path: '@/components/landing/ScreenshotsCarousel' },
      { name: 'FAQAccordion', path: '@/components/landing/FAQAccordion' },
      { name: 'CookieConsent', path: '@/components/landing/CookieConsent' }
    ];

    let changesMade = 0;
    componentsToOptimize.forEach(({ name, path: importPath }) => {
      const staticImport = `import ${name} from '${importPath}'`;
      if (content.includes(staticImport)) {
        const dynamicImport = `const ${name} = dynamic(() => import('${importPath}'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
})`;
        content = content.replace(staticImport, dynamicImport);
        changesMade++;
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ src/app/page.tsx: ${changesMade} composants optimisés`);
      this.fixes += changesMade;
      this.files++;
    } else {
      console.log('✅ src/app/page.tsx: Composants déjà optimisés');
    }
  }

  // Optimiser les autres pages lourdes
  optimizeHeavyPages() {
    const pagesToOptimize = [
      'src/app/charts/page.tsx',
      'src/app/confessions/page.tsx'
    ];

    pagesToOptimize.forEach(page => this.optimizePage(page));
  }

  optimizePage(pagePath) {
    const filePath = path.join(__dirname, '..', pagePath);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ Fichier non trouvé: ${pagePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Ajouter dynamic import si pas présent
    if (!content.includes("import dynamic from 'next/dynamic'") && content.includes('react-confetti')) {
      content = content.replace(
        "'use client'",
        "'use client'\n\nimport dynamic from 'next/dynamic'"
      );
    }

    // Optimiser react-confetti spécifiquement
    if (content.includes('react-confetti')) {
      content = content.replace(
        /import.*react-confetti.*\n/,
        `const Confetti = dynamic(() => import('react-confetti'), { 
  ssr: false,
  loading: () => null
})\n`
      );
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${pagePath}: Confetti optimisé avec lazy loading`);
        this.fixes++;
        this.files++;
      }
    }
  }

  generateReport() {
    console.log('\n🎯 RAPPORT DE LAZY LOADING');
    console.log('==========================');
    console.log(`📁 Fichiers optimisés: ${this.files}`);
    console.log(`⚡ Composants lazy-loadés: ${this.fixes}`);
    console.log('');
    console.log('✅ Avantages du lazy loading:');
    console.log('   • Réduction du bundle initial');
    console.log('   • Chargement uniquement à la demande');
    console.log('   • Amélioration du Time to Interactive');
    console.log('   • Meilleure performance perçue');
    console.log('');
    if (this.fixes > 0) {
      console.log('🚀 Performance de chargement améliorée !');
    }
  }
}

// Exécution
const fixer = new LazyLoadingFixer();

try {
  fixer.optimizeLandingPage();
  fixer.optimizeHeavyPages();
  fixer.generateReport();
} catch (error) {
  console.error('❌ Erreur lors de l\'optimisation:', error.message);
  process.exit(1);
} 