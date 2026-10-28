const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Step 1/2: Generating OpenAPI JSON from NestJS API...');
execSync('pnpm --filter @gadgetbazar/api exec ts-node src/generate-openapi.ts', {
  stdio: 'inherit',
  cwd: rootDir,
});

console.log('📦 Step 2/2: Generating typed API client with openapi-typescript...');
execSync('pnpm --filter @gadgetbazar/api exec openapi-typescript openapi.json -o ../../packages/api-client/src/generated/schema.ts', {
  stdio: 'inherit',
  cwd: rootDir,
});

console.log('✨ packages/api-client generated successfully from OpenAPI spec!');
