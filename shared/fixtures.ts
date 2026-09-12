// Catálogo versionado e fixtures para a demonstração Sentinela
// Nenhuma informação pessoal de terceiros ou credencial real.

export interface CampusPoint {
  id: string;
  name: string;
  x: number; // 0..100% coordenadas relativas na planta vetorial
  y: number; // 0..100%
  description: string;
}

export interface DemoZone {
  id: string;
  name: string;
  type: 'safe_corridor' | 'caution_area';
  description: string;
  polygon: [number, number][];
}

export interface CatalogMedia {
  id: string;
  kind: 'photo' | 'audio';
  title: string;
  caption: string;
  url: string;
  license: string;
  source: 'mock-campus-asset';
  duration?: number;
  atOffset: number; // segundos após início do incidente
}

export const CAMPUS_ROUTE: CampusPoint[] = [
  { id: 'p1', name: 'Biblioteca Central', x: 12, y: 78, description: 'Ponto de partida do trajeto monitorado' },
  { id: 'p2', name: 'Passarela dos Estudantes', x: 38, y: 55, description: 'Corredor iluminado com câmeras fictícias' },
  { id: 'p3', name: 'Pátio das Engenharias', x: 65, y: 40, description: 'Área aberta de transição' },
  { id: 'p4', name: 'Portaria Principal (demo)', x: 90, y: 18, description: 'Destino final planejado' },
];

export const DEMO_ZONES: DemoZone[] = [
  {
    id: 'zone-corridor',
    name: 'Corredor Seguro (Demo)',
    type: 'safe_corridor',
    description: 'Iluminação reforçada e totens ilustrativos',
    polygon: [[10, 85], [35, 75], [45, 50], [20, 60]],
  },
  {
    id: 'zone-caution',
    name: 'Zona de Demonstração C (Atenção)',
    type: 'caution_area',
    description: 'Trecho com obras simuladas no campus',
    polygon: [[55, 50], [80, 45], [85, 25], [60, 30]],
  },
];

export const MEDIA_CATALOG: CatalogMedia[] = [
  {
    id: 'foto-1',
    kind: 'photo',
    title: 'Fachada Próxima',
    caption: 'Foto de contexto: fachada de edifício acadêmico',
    url: '/assets/foto-1.svg',
    license: 'Licença aberta / Ativo sintético educacional',
    source: 'mock-campus-asset',
    atOffset: 0,
  },
  {
    id: 'foto-2',
    kind: 'photo',
    title: 'Caminho Percorrido',
    caption: 'Foto de contexto: calçada iluminada da passarela',
    url: '/assets/foto-2.svg',
    license: 'Licença aberta / Ativo sintético educacional',
    source: 'mock-campus-asset',
    atOffset: 3,
  },
  {
    id: 'foto-3',
    kind: 'photo',
    title: 'Pátio Central',
    caption: 'Foto de contexto: visão panorâmica do pátio',
    url: '/assets/foto-3.svg',
    license: 'Licença aberta / Ativo sintético educacional',
    source: 'mock-campus-asset',
    atOffset: 6,
  },
  {
    id: 'foto-4',
    kind: 'photo',
    title: 'Portaria de Acesso',
    caption: 'Foto de contexto: guarita e portão de acesso',
    url: '/assets/foto-4.svg',
    license: 'Licença aberta / Ativo sintético educacional',
    source: 'mock-campus-asset',
    atOffset: 8,
  },
  {
    id: 'audio-1',
    kind: 'audio',
    title: 'Escuta Ambiental (12s)',
    caption: 'Áudio ambiente simulado para escuta protetiva',
    url: '/assets/audio-1.wav',
    license: 'Licença aberta / Amostra sintética de demonstração',
    source: 'mock-campus-asset',
    duration: 12,
    atOffset: 0,
  },
];

export const SCENARIO_PRESETS = [
  {
    id: 'impact',
    label: 'Simular Impacto',
    description: 'Aceleração brusca (simula queda ou colisão)',
    expectedStatus: 'checking',
    detail: 'Possível impacto',
  },
  {
    id: 'snatch',
    label: 'Simular Arrebate',
    description: 'Movimento brusco seguido de perda de proximidade',
    expectedStatus: 'checking',
    detail: 'Possível arrebate',
  },
  {
    id: 'voice',
    label: 'Voz Suspeita',
    description: 'IA local simula detecção de conversa hostil',
    expectedStatus: 'checking',
    detail: 'Conversa suspeita',
  },
  {
    id: 'help',
    label: 'Gesto SOS (3x Volume+)',
    description: 'Acionamento direto de emergência',
    expectedStatus: 'alert',
    detail: 'SOS manual',
  },
  {
    id: 'battery',
    label: 'Bateria Crítica',
    description: 'Simula queda rápida para 5% de bateria',
    expectedStatus: 'active',
    detail: 'Bateria crítica 5%',
  },
  {
    id: 'signal',
    label: 'Perda de Sinal',
    description: 'Telemetria congela e relógio de segurança continua',
    expectedStatus: 'active',
    detail: 'Sinal desconectado',
  },
  {
    id: 'ai-offline',
    label: 'IA Indisponível',
    description: 'Simula falha de modelo sem interromper trajeto',
    expectedStatus: 'active',
    detail: 'IA offline',
  },
];
