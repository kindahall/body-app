#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing remaining compilation errors...\n');

// 1. Fix logger import in useAIInsights.ts (if needed)
const useAIInsightsPath = 'src/hooks/useAIInsights.ts';
if (fs.existsSync(useAIInsightsPath)) {
  let content = fs.readFileSync(useAIInsightsPath, 'utf8');
  
  // Ensure correct logger import
  if (content.includes("import { log }")) {
    content = content.replace("import { log }", "import { logger }");
    content = content.replace(/\blog\./g, 'logger.');
    fs.writeFileSync(useAIInsightsPath, content);
    console.log('✅ Fixed logger import in useAIInsights.ts');
  } else {
    console.log('✅ useAIInsights.ts logger import is correct');
  }
}

// 2. Ensure logger.ts exists and exports correct function
const loggerPath = 'src/lib/logger.ts';
if (!fs.existsSync(loggerPath)) {
  const loggerContent = `// Logging utility
export const logger = {
  info: (message: string, data?: any) => {
    console.log(\`ℹ️ \${message}\`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(\`❌ \${message}\`, error || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(\`⚠️ \${message}\`, data || '');
  },
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(\`🐛 \${message}\`, data || '');
    }
  }
};

export default logger;
`;
  fs.writeFileSync(loggerPath, loggerContent);
  console.log('✅ Created logger.ts');
} else {
  console.log('✅ logger.ts already exists');
}

// 3. Check and fix any corrupted files
const filesToCheck = [
  'src/app/settings/page.tsx',
  'src/app/wishlist/ItemCard.tsx',
  'src/app/wishlist/AddEditModal.tsx',
  'src/app/profiles/[id]/ShareMemoryDrawer.tsx'
];

filesToCheck.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check for corrupted content
    if (content.startsWith("'u") || content.includes("se client'")) {
      console.log(`⚠️ Detected corrupted content in ${filePath}`);
      // Try to fix by ensuring proper 'use client' directive
      content = content.replace(/^'u.*?se client'/, "'use client'");
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed corrupted content in ${filePath}`);
    }
  }
});

// 4. Create a comprehensive health check
const healthCheckPath = 'health-check.js';
const healthCheckContent = `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏥 BodyCount Health Check\\n');

const checks = [
  {
    name: 'logger.ts exists',
    check: () => fs.existsSync('src/lib/logger.ts'),
    fix: 'Run npm run fix-compilation-errors'
  },
  {
    name: 'useAIInsights.ts imports correct',
    check: () => {
      const content = fs.readFileSync('src/hooks/useAIInsights.ts', 'utf8');
      return content.includes('import { logger }') && !content.includes('import { log }');
    },
    fix: 'Check logger import in useAIInsights.ts'
  },
  {
    name: 'AgeInput component exists',
    check: () => fs.existsSync('src/components/AgeInput.tsx'),
    fix: 'Run npm run install-age-feature'
  },
  {
    name: 'Age validation exists',
    check: () => {
      const content = fs.readFileSync('src/lib/validation.ts', 'utf8');
      return content.includes('userAge');
    },
    fix: 'Check validation schema'
  }
];

let allPassed = true;

checks.forEach(check => {
  try {
    const passed = check.check();
    console.log(passed ? '✅' : '❌', check.name);
    if (!passed) {
      console.log('   Fix:', check.fix);
      allPassed = false;
    }
  } catch (error) {
    console.log('❌', check.name, '- Error:', error.message);
    allPassed = false;
  }
});

console.log('\\n' + (allPassed ? '🎉 All checks passed!' : '⚠️ Some issues found. Please fix them.'));
`;

fs.writeFileSync(healthCheckPath, healthCheckContent);
fs.chmodSync(healthCheckPath, '755');

console.log('\n🎉 Compilation fixes completed!');
console.log('📋 Created health-check.js for future diagnostics');
console.log('\nRun the following to verify:');
console.log('  node health-check.js'); 