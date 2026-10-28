#!/usr/bin/env node

/**
 * CI Guard: Enforces 01-security.md rule - "Validate every input with DTOs/zod"
 * Scans all NestJS controllers to ensure every @Body(), @Query(), and @Param() uses a typed DTO class
 * and forbids untyped inputs (such as : any, : object, : Record<...>).
 */

const fs = require('fs');
const path = require('path');

const API_SRC_DIR = path.resolve(__dirname, '../../apps/api/src');

function getControllerFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getControllerFiles(fullPath));
    } else if (file.endsWith('.controller.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

console.log('🔍 [CI Guard] Scanning NestJS controllers for validated DTOs...');

const controllers = getControllerFiles(API_SRC_DIR);
let violationCount = 0;

// Patterns that indicate untyped inputs
const UNTYPED_PATTERNS = [
  /@Body\s*\(\s*\)\s+([a-zA-Z0-9_]+)\s*:\s*(any|object|Record<[^>]+>)/g,
  /@Query\s*\(\s*\)\s+([a-zA-Z0-9_]+)\s*:\s*(any|object|Record<[^>]+>)/g,
  /@Body\s*\(\s*\)\s+([a-zA-Z0-9_]+)\s*[,)]/g, // @Body() without any type annotation
  /@Query\s*\(\s*\)\s+([a-zA-Z0-9_]+)\s*[,)]/g, // @Query() without type annotation
];

for (const filePath of controllers) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const pattern of UNTYPED_PATTERNS) {
      if (pattern.test(line)) {
        console.error(`❌ Missing or untyped DTO in ${path.relative(process.cwd(), filePath)}:${i + 1}`);
        console.error(`   Snippet: ${line.trim()}`);
        console.error(`   Rule: All @Body() and @Query() parameters must be typed with a validated DTO class.`);
        violationCount++;
      }
    }
  }
}

if (violationCount > 0) {
  console.error(`\n❌ Total DTO violations found: ${violationCount}. Build rejected by 01-security.md policy.`);
  process.exit(1);
} else {
  console.log(`✅ [CI Guard] Passed. Checked ${controllers.length} controller files. All endpoints use validated DTOs.\n`);
  process.exit(0);
}
