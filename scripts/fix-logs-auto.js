#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 AUTO-FIX : Remplacement des logs critiques par le logger conditionnel\n');

class LogFixer {
  constructor() {
    this.fixes = 0;
    this.files = 0;
  }

  // Corriger le fichier le plus problématique : profiles/page.tsx
  fixProfilesPage() {
    const filePath = path.join(__dirname, '../src/app/profiles/page.tsx');
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Ajouter l'import du logger s'il n'existe pas
    if (!content.includes("import { logger }")) {
      content = content.replace(
        "import { useRelationTypeCounts, useRelationStats, getTypeCount } from '@/hooks/useRelationTypeCounts'",
        "import { useRelationTypeCounts, useRelationStats, getTypeCount } from '@/hooks/useRelationTypeCounts'\nimport { logger } from '@/lib/logger'"
      );
    }

    // Remplacer les logs problématiques par le logger conditionnel
    const logReplacements = [
      {
        old: "console.log('Loaded test relations:', testRelations.length)",
        new: "logger.debug('Loaded test relations:', testRelations.length)"
      },
      {
        old: "console.log('No user ID available')",
        new: "logger.debug('No user ID available')"
      },
      {
        old: "console.log('Fetching relationships for user:', userId)",
        new: "logger.db('Fetching relationships for user:', userId)"
      },
      {
        old: "console.log('🔄 Type counts from server:', typeCounts)",
        new: "logger.debug('Type counts from server:', typeCounts)"
      },
      {
        old: "console.log('📊 Relation stats from server:', relationStats)",
        new: "logger.debug('Relation stats from server:', relationStats)"
      },
      {
        old: "console.log('❌ Type counts error:', typeCountsError)",
        new: "logger.debug('Type counts error:', typeCountsError)"
      },
      {
        old: "console.log('❌ Stats error:', statsError)",
        new: "logger.debug('Stats error:', statsError)"
      },
      {
        old: "console.log('📈 Final stats used in UI:', stats)",
        new: "logger.debug('Final stats used in UI:', stats)"
      },
      {
        old: "console.log('🔧 Using local calculation:', useLocalCalculation)",
        new: "logger.debug('Using local calculation:', useLocalCalculation)"
      },
      {
        old: "console.log('🔄 Setting up real-time updates for user:', user.id)",
        new: "logger.debug('Setting up real-time updates for user:', user.id)"
      }
    ];

    let changesMade = 0;
    logReplacements.forEach(replacement => {
      if (content.includes(replacement.old)) {
        content = content.replace(replacement.old, replacement.new);
        changesMade++;
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ profiles/page.tsx: ${changesMade} logs remplacés`);
      this.fixes += changesMade;
      this.files++;
    }
  }

  // Corriger les APIs critiques
  fixApiRoutes() {
    const apiFiles = [
      'src/app/api/insights/route.ts',
      'src/app/api/stripe/checkout/route.ts',
      'src/app/api/stripe/webhook/route.ts',
      'src/app/auth/callback/route.ts'
    ];

    apiFiles.forEach(relativePath => {
      const filePath = path.join(__dirname, '..', relativePath);
      if (!fs.existsSync(filePath)) return;

      let content = fs.readFileSync(filePath, 'utf8');
      
      // Ajouter l'import du logger s'il n'existe pas
      if (!content.includes("import { logger }") && !content.includes("import { log }")) {
        content = "import { logger } from '@/lib/logger'\n" + content;
      }

      // Remplacer console.error par logger.error
      const originalContent = content;
      content = content.replace(/console\.error\(/g, 'logger.error(');
      content = content.replace(/console\.log\(/g, 'logger.debug(');
      content = content.replace(/console\.warn\(/g, 'logger.warn(');

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        const changes = (originalContent.match(/console\.(log|error|warn)\(/g) || []).length;
        console.log(`✅ ${relativePath}: ${changes} logs remplacés`);
        this.fixes += changes;
        this.files++;
      }
    });
  }

  // Corriger les hooks critiques
  fixHooks() {
    const hookFiles = [
      'src/hooks/useArchivedInsights.ts',
      'src/hooks/useMirror.ts',
      'src/hooks/useWishlist.ts'
    ];

    hookFiles.forEach(relativePath => {
      const filePath = path.join(__dirname, '..', relativePath);
      if (!fs.existsSync(filePath)) return;

      let content = fs.readFileSync(filePath, 'utf8');
      
      if (!content.includes("import { logger }")) {
        // Trouver la dernière ligne d'import
        const imports = content.match(/^import .+$/gm) || [];
        if (imports.length > 0) {
          const lastImport = imports[imports.length - 1];
          content = content.replace(lastImport, lastImport + "\nimport { logger } from '@/lib/logger'");
        } else {
          content = "import { logger } from '@/lib/logger'\n" + content;
        }
      }

      const originalContent = content;
      content = content.replace(/console\.error\(/g, 'logger.error(');
      content = content.replace(/console\.log\(/g, 'logger.debug(');
      content = content.replace(/console\.warn\(/g, 'logger.warn(');

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        const changes = (originalContent.match(/console\.(log|error|warn)\(/g) || []).length;
        console.log(`✅ ${relativePath}: ${changes} logs remplacés`);
        this.fixes += changes;
        this.files++;
      }
    });
  }

  generateReport() {
    console.log('\n🎯 RAPPORT DE CORRECTION AUTOMATIQUE');
    console.log('=====================================');
    console.log(`📁 Fichiers corrigés: ${this.files}`);
    console.log(`🔧 Logs remplacés: ${this.fixes}`);
    console.log('');
    console.log('✅ Les logs les plus critiques ont été convertis au logger conditionnel');
    console.log('💡 En développement: logs visibles');
    console.log('🚀 En production: seuls les erreurs/warnings sont affichés');
    console.log('');
    console.log('🔄 Redémarrez le serveur de développement pour voir les changements');
  }
}

// Exécution
const fixer = new LogFixer();

try {
  fixer.fixProfilesPage();
  fixer.fixApiRoutes();
  fixer.fixHooks();
  fixer.generateReport();
} catch (error) {
  console.error('❌ Erreur lors de la correction:', error.message);
  process.exit(1);
} 