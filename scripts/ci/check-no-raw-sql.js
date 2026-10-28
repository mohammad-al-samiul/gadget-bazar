#!/usr/bin/env node

/**
 * CI Guard: Enforces 01-security.md rule - "No raw SQL"
 * Scans apps/api/src for forbidden raw SQL invocations or unsafe raw queries.
 */

const fs = require('fs');
const path = require('path');

const API_SRC_DIR = path.resolve(__dirname, '../../apps/api/src');

const FORBIDDEN_PATTERNS = [
  { pattern: /\$queryRawUnsafe/g, description: 'Direct usage of Prisma $queryRawUnsafe is forbidden' },
  { pattern: /\$executeRawUnsafe/g, description: 'Direct usage of Prisma $executeRawUnsafe is forbidden' },
  { pattern: /require\(['"]pg['"]\)/g, description: 'Direct pg driver usage bypassing Prisma is forbidden' },
  { pattern: /from ['"]pg['"]/g, description: 'Direct pg driver import bypassing Prisma is forbidden' },
  { pattern: /SELECT\s+.*FROM\s+.*WHERE\s+.*\+\s*/gi, description: 'Dynamic string concatenation in SQL queries detected' },
];

function getTsFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getTsFiles(fullPath));
    } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

console.log('🔍 [CI Guard] Scanning apps/api/src for forbidden raw SQL...');

const files = getTsFiles(API_SRC_DIR);
let violationCount = 0;

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    for (const rule of FORBIDDEN_PATTERNS) {
      if (rule.pattern.test(line)) {
        console.error(`❌ Raw SQL violation in ${path.relative(process.cwd(), filePath)}:${lineIndex + 1}`);
        console.error(`   Rule: ${rule.description}`);
        console.error(`   Snippet: ${line.trim()}`);
        violationCount++;
      }
    }
  }
}

if (violationCount > 0) {
  console.error(`\n❌ Total violations found: ${violationCount}. Build rejected by 01-security.md policy.`);
  process.exit(1);
} else {
  console.log(`✅ [CI Guard] Passed. Checked ${files.length} API source files. No raw SQL detected.\n`);
  process.exit(0);
}
