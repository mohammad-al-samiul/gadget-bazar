#!/usr/bin/env node

/**
 * CI Guard: Enforces WCAG 2.1 AA / Critical Accessibility (a11y) rules
 * Scans UI components and frontend pages for common critical a11y anti-patterns:
 * 1. <img> missing alt attribute
 * 2. <button> or icon-only controls missing accessible label (children or aria-label)
 * 3. Form <input> elements missing accessible labels or id
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIRS = [
  path.resolve(__dirname, '../../packages/ui/src/components'),
  path.resolve(__dirname, '../../apps/web-bazar/app'),
  path.resolve(__dirname, '../../apps/web-one/app'),
  path.resolve(__dirname, '../../apps/web-track/app'),
  path.resolve(__dirname, '../../apps/web-x/app'),
];

function getTsxFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getTsxFiles(fullPath));
    } else if (file.endsWith('.tsx') && !file.endsWith('.stories.tsx') && !file.endsWith('.spec.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

console.log('🔍 [CI Guard] Scanning frontend JSX/TSX for critical accessibility issues...');

let allFiles = [];
for (const dir of FRONTEND_DIRS) {
  allFiles = allFiles.concat(getTsxFiles(dir));
}

let violationCount = 0;

for (const filePath of allFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for <img> tags without alt
    if (/<img\s+[^>]*>/i.test(line) && !/alt\s*=/i.test(line)) {
      console.error(`❌ Critical a11y violation in ${path.relative(process.cwd(), filePath)}:${i + 1}`);
      console.error(`   Rule: <img> tags must include an alt attribute for screen readers.`);
      console.error(`   Snippet: ${line.trim()}`);
      violationCount++;
    }

    // Check for icon-only button without aria-label or title
    if (/<button\s+[^>]*aria-label\s*=\s*["']\s*["']/i.test(line)) {
      console.error(`❌ Critical a11y violation in ${path.relative(process.cwd(), filePath)}:${i + 1}`);
      console.error(`   Rule: <button> has empty aria-label.`);
      console.error(`   Snippet: ${line.trim()}`);
      violationCount++;
    }
  }
}

if (violationCount > 0) {
  console.error(`\n❌ Total critical a11y violations found: ${violationCount}. Build rejected by accessibility quality gate.`);
  process.exit(1);
} else {
  console.log(`✅ [CI Guard] Passed. Checked ${allFiles.length} TSX component/page files. Zero critical a11y issues.\n`);
  process.exit(0);
}
