#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏥 BodyCount Health Check\n');

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

console.log('\n' + (allPassed ? '🎉 All checks passed!' : '⚠️ Some issues found. Please fix them.'));
