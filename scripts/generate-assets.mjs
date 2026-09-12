import fs from 'node:fs';
import path from 'node:path';

const assetsDir = path.resolve('public/assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1. Fotos SVG ilustrativas de exemplo
const fotos = [
  { file: 'foto-1.svg', title: 'Fachada Próxima - Bloco 40', color: '#1b4d3e', desc: 'Edifício acadêmico iluminado' },
  { file: 'foto-2.svg', title: 'Caminho Percorrido - Passarela', color: '#2d5a7b', desc: 'Passarela com postes de iluminação' },
  { file: 'foto-3.svg', title: 'Pátio Central - Bancos e Jardins', color: '#3d405b', desc: 'Área aberta de pedestres' },
  { file: 'foto-4.svg', title: 'Portaria Principal (Demo)', color: '#4a5759', desc: 'Guarita e portão de acesso' },
];

for (const f of fotos) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
    <rect width="600" height="400" fill="${f.color}"/>
    <circle cx="300" cy="160" r="80" fill="#ffffff" opacity="0.1"/>
    <path d="M50,350 L200,220 L350,300 L550,180 L550,350 Z" fill="#000000" opacity="0.25"/>
    <rect x="20" y="20" width="560" height="40" rx="6" fill="#000000" opacity="0.4"/>
    <text x="35" y="46" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold">${f.title}</text>
    <rect x="20" y="320" width="560" height="60" rx="6" fill="#000000" opacity="0.5"/>
    <text x="35" y="348" fill="#a0f0c0" font-family="sans-serif" font-size="14">FOTO DE EXEMPLO • DEMO MOCK-FIRST</text>
    <text x="35" y="368" fill="#e0e0e0" font-family="sans-serif" font-size="12">${f.desc} • Licença de demonstração</text>
  </svg>`;
  fs.writeFileSync(path.join(assetsDir, f.file), svg, 'utf8');
}

// 2. Arquivo de áudio WAV válido de 12 segundos (PCM 8kHz 8-bit mono)
function createWavBuffer(seconds = 12, sampleRate = 8000) {
  const numSamples = seconds * sampleRate;
  const buffer = Buffer.alloc(44 + numSamples);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk size
  buffer.writeUInt16LE(1, 20);  // PCM format
  buffer.writeUInt16LE(1, 22);  // mono
  buffer.writeUInt32LE(sampleRate, 24); // sample rate
  buffer.writeUInt32LE(sampleRate, 28); // byte rate (sampleRate * 1 * 1)
  buffer.writeUInt16LE(1, 32);  // block align
  buffer.writeUInt16LE(8, 34);  // bits per sample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples, 40);

  // Generate subtle tone + simulated background pulse
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // alternating subtle beeps simulating environment/radio every 2s
    const beep = (t % 2 < 0.15) ? Math.sin(2 * Math.PI * 440 * t) * 30 : 0;
    const ambientNoise = ((Math.random() * 2 - 1) * 8);
    const sample = Math.floor(128 + beep + ambientNoise);
    buffer.writeUInt8(Math.max(0, Math.min(255, sample)), 44 + i);
  }

  return buffer;
}

fs.writeFileSync(path.join(assetsDir, 'audio-1.wav'), createWavBuffer(12));
console.log('Assets criados com sucesso em public/assets!');
