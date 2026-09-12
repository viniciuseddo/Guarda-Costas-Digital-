import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

console.log('--- Iniciando build Sentinela Demo ---');

// 1. Gera assets sintéticos caso não existam
execSync('node scripts/generate-assets.mjs', { stdio: 'inherit' });

// 2. Garante arquivos essenciais do PWA
const requiredFiles = [
  'public/index.html',
  'public/app.js',
  'public/styles.css',
  'public/manifest.json',
  'public/sw.js',
  'public/assets/foto-1.svg',
  'public/assets/foto-2.svg',
  'public/assets/foto-3.svg',
  'public/assets/foto-4.svg',
  'public/assets/audio-1.wav',
];

for (const f of requiredFiles) {
  if (!fs.existsSync(path.resolve(f))) {
    console.warn(`Arquivo pendente: ${f}`);
  }
}

console.log('--- Build concluído com sucesso ---');
