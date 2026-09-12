// Modelo de estado compartilhado para demo Sentinela (PWA).
// Autoritativo no coordenador; sincronizado por eventos.

export type Role = 'owner' | 'family' | 'observer';
export type JourneyStatus = 'idle' | 'active' | 'arrived';
export type IncidentStatus = 'checking' | 'alert' | 'resolved';
export type MediaStatus = 'pending' | 'sending' | 'available' | 'failed';
export type PoliceStatus = 'idle' | 'preparing' | 'calling' | 'sending' | 'received' | 'failed' | 'cancelled';
export type Scenario = 'impact' | 'snatch' | 'voice' | 'help' | 'ai-offline' | 'injection' | 'battery' | 'signal';

export interface Position { x: number; y: number; }
export interface Event { kind: string; at: number; detail?: string; }
export interface Evidence { id: string; kind: 'photo' | 'audio'; label: string; status: MediaStatus; at: number; duration?: number; }
export interface Incident {
  id: string;
  status: IncidentStatus;
  sources: Scenario[];
  reason: string;
  at: number;
  deadline: number;
  acknowledged: boolean;
  evidence: Evidence[];
}
export interface PoliceSim {
  status: PoliceStatus;
  reference: string;
  selected: string[];
  at: number;
}

export interface Run {
  id: string;
  room: string;
  journey: JourneyStatus;
  paused: boolean;
  elapsed: number;
  eta: number;
  deadline: number;
  position: Position;
  battery: number;
  signal: boolean;
  aiAvailable: boolean;
  mode: 'discreet' | 'sound';
  soundEnabled: boolean;
  incident: Incident | null;
  police: PoliceSim;
  events: Event[];
  source: 'mock';
  version: number;
}

const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o));
const now = () => 0; // tempo virtual controlado por advance/step

export function createRun(id = 'demo', room = 'sala-demo'): Run {
  return {
    id,
    room,
    journey: 'idle',
    paused: false,
    elapsed: 0,
    eta: 90,
    deadline: 90,
    position: { x: 0, y: 0 },
    battery: 100,
    signal: true,
    aiAvailable: true,
    mode: 'discreet',
    soundEnabled: false,
    incident: null,
    police: { status: 'idle', reference: '', selected: [], at: 0 },
    events: [],
    source: 'mock',
    version: 0,
  };
}

function assertActive(run: Run) {
  if (run.journey !== 'active') throw new Error('Comando requer trajeto ativo');
}
function assertRole(run: Run, role: Role, allowed: Role[]) {
  if (!allowed.includes(role)) throw new Error('Sem permissão para este papel');
}

export interface Participant {
  id: string;
  role: Role;
  name: string;
  lastSeen: number;
}

export interface Room {
  id: string;
  pin: string;
  createdAt: number;
  participants: Participant[];
}

export interface CommandMessage {
  roomId: string;
  runId: string;
  role: Role;
  participantId: string;
  commandId: string;
  expectedVersion?: number;
  action: string;
  payload: Record<string, unknown>;
}

export interface RoomSnapshot {
  room: Room;
  run: Run;
  cursor: number;
  serverTime: number;
}

export function validateCommand(data: unknown): CommandMessage {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Comando inválido: esperado objeto');
  }
  const c = data as Record<string, unknown>;
  if (typeof c.roomId !== 'string' || !c.roomId) throw new Error('roomId obrigatório');
  if (typeof c.runId !== 'string' || !c.runId) throw new Error('runId obrigatório');
  if (c.role !== 'owner' && c.role !== 'family' && c.role !== 'observer') {
    throw new Error('Papel inválido');
  }
  if (typeof c.action !== 'string' || !c.action) throw new Error('action obrigatória');
  return {
    roomId: c.roomId,
    runId: c.runId,
    role: c.role as Role,
    participantId: typeof c.participantId === 'string' ? c.participantId : 'anon',
    commandId: typeof c.commandId === 'string' ? c.commandId : `cmd-${Date.now()}-${Math.random()}`,
    expectedVersion: typeof c.expectedVersion === 'number' ? c.expectedVersion : undefined,
    action: c.action,
    payload: (typeof c.payload === 'object' && c.payload !== null) ? c.payload as Record<string, unknown> : {},
  };
}

function makeEvidence(incidentId: string): Evidence[] {
  return [
    { id: `${incidentId}-foto-1`, kind: 'photo', label: 'Fachada próxima', status: 'pending', at: 0 },
    { id: `${incidentId}-foto-2`, kind: 'photo', label: 'Caminho percorrido', status: 'pending', at: 0 },
    { id: `${incidentId}-foto-3`, kind: 'photo', label: 'Pátio central', status: 'pending', at: 0 },
    { id: `${incidentId}-foto-4`, kind: 'photo', label: 'Portaria de acesso', status: 'pending', at: 0 },
    { id: `${incidentId}-audio-1`, kind: 'audio', label: 'Áudio ambiente', status: 'pending', at: 0, duration: 12 },
  ];
}

export function command(run: Run, role: Role, action: string, payload: Record<string, unknown>): Run {
  const r = clone(run);
  r.version += 1;

  switch (action) {
    case 'start': {
      assertRole(r, role, ['owner']);
      if (r.journey !== 'idle') throw new Error('Trajeto já iniciado');
      r.journey = 'active';
      r.mode = payload.mode === 'sound' ? 'sound' : 'discreet';
      r.soundEnabled = Boolean(payload.sound);
      r.events.push({ kind: 'start', at: r.elapsed, detail: `modo=${r.mode}` });
      break;
    }
    case 'pause': {
      assertActive(r);
      assertRole(r, role, ['owner', 'observer']);
      r.paused = true;
      r.events.push({ kind: 'pause', at: r.elapsed });
      break;
    }
    case 'resume': {
      assertActive(r);
      assertRole(r, role, ['owner', 'observer']);
      r.paused = false;
      r.events.push({ kind: 'resume', at: r.elapsed });
      break;
    }
    case 'step': {
      assertActive(r);
      assertRole(r, role, ['owner', 'observer']);
      const sec = Number(payload.seconds);
      if (!Number.isFinite(sec) || sec <= 0) throw new Error('Segundos inválidos');
      return advance(r, sec, true);
    }
    case 'extend': {
      assertActive(r);
      assertRole(r, role, ['owner']);
      r.deadline += 50;
      r.events.push({ kind: 'extend', at: r.elapsed, detail: 'deadline+50' });
      break;
    }
    case 'arrive': {
      assertActive(r);
      assertRole(r, role, ['owner']);
      r.journey = 'arrived';
      if (r.incident) r.incident.status = 'resolved';
      r.events.push({ kind: 'arrived', at: r.elapsed });
      break;
    }
    case 'safe': {
      assertActive(r);
      assertRole(r, role, ['owner']);
      if (r.incident?.status === 'checking') {
        r.incident.status = 'resolved';
        r.events.push({ kind: 'false-alarm', at: r.elapsed });
      }
      break;
    }
    case 'sos': {
      assertActive(r);
      assertRole(r, role, ['owner']);
      if (!r.incident) {
        r.incident = {
          id: `inc-${r.elapsed}`,
          status: 'alert',
          sources: ['help'],
          reason: 'SOS manual',
          at: r.elapsed,
          deadline: r.elapsed + 10,
          acknowledged: false,
          evidence: makeEvidence(`inc-${r.elapsed}`),
        };
      } else {
        r.incident.status = 'alert';
      }
      r.events.push({ kind: 'alert', at: r.elapsed, detail: 'SOS' });
      break;
    }
    case 'ack': {
      assertActive(r);
      assertRole(r, role, ['family']);
      if (r.incident) r.incident.acknowledged = true;
      r.events.push({ kind: 'ack', at: r.elapsed });
      break;
    }
    case 'simulate': {
      assertActive(r);
      assertRole(r, role, ['owner']);
      const scenario = String(payload.scenario) as Scenario;
      if (!['impact', 'snatch', 'voice', 'help', 'ai-offline', 'injection', 'battery', 'signal'].includes(scenario))
        throw new Error('Cenário desconhecido');

      if (scenario === 'battery') r.battery = 5;
      if (scenario === 'signal') r.signal = false;
      if (scenario === 'ai-offline') r.aiAvailable = false;
      if (scenario === 'injection') {
        r.events.push({ kind: 'injection-blocked', at: r.elapsed });
        break;
      }

      if (!r.incident) {
        r.incident = {
          id: `inc-${r.elapsed}`,
          status: 'alert', // wait, help is alert, others checking
          sources: [scenario],
          reason: scenario === 'impact' ? 'Possível impacto' : scenario === 'snatch' ? 'Possível arrebate' : scenario === 'voice' ? 'Conversa suspeita' : 'Pedido de ajuda',
          at: r.elapsed,
          deadline: r.elapsed + 10,
          acknowledged: false,
          evidence: makeEvidence(`inc-${r.elapsed}`),
        };
        if (scenario !== 'help') r.incident.status = 'checking';
      } else if (!r.incident.sources.includes(scenario)) {
        r.incident.sources.push(scenario);
      }
      r.events.push({ kind: 'simulate', at: r.elapsed, detail: scenario });
      break;
    }
    case 'media-fail': {
      assertActive(r);
      assertRole(r, role, ['owner', 'family']);
      const id = String(payload.id);
      const item = r.incident?.evidence.find(e => e.id === id);
      if (item) item.status = 'failed';
      break;
    }
    case 'media-retry': {
      assertActive(r);
      assertRole(r, role, ['family']);
      const id = String(payload.id);
      const item = r.incident?.evidence.find(e => e.id === id);
      if (item) item.status = 'sending';
      break;
    }
    case 'police-start': {
      assertActive(r);
      assertRole(r, role, ['family']);
      if (r.police.status === 'idle' || r.police.status === 'cancelled') {
        r.police = {
          status: 'calling',
          reference: `DEMO-${r.id}-${r.elapsed}`,
          selected: Array.isArray(payload.selected) ? payload.selected.map(String) : [],
          at: r.elapsed,
        };
        r.events.push({ kind: 'police-start', at: r.elapsed });
      }
      break;
    }
    case 'police-cancel': {
      assertActive(r);
      assertRole(r, role, ['family']);
      if (['preparing', 'calling', 'sending'].includes(r.police.status)) {
        r.police.status = 'cancelled';
        r.events.push({ kind: 'police-cancel', at: r.elapsed });
      }
      break;
    }
    case 'police-fail': {
      assertActive(r);
      assertRole(r, role, ['family']);
      if (['preparing', 'calling', 'sending'].includes(r.police.status)) {
        r.police.status = 'failed';
        r.events.push({ kind: 'police-fail', at: r.elapsed });
      }
      break;
    }
    case 'police-retry': {
      assertActive(r);
      assertRole(r, role, ['family']);
      if (r.police.status === 'failed') {
        r.police.status = 'calling';
        r.police.at = r.elapsed;
        r.events.push({ kind: 'police-retry', at: r.elapsed });
      }
      break;
    }
    default:
      throw new Error(`Ação desconhecida: ${action}`);
  }
  return r;
}

export function advance(run: Run, seconds: number, force = false): Run {
  if (seconds <= 0 || (run.paused && !force) || run.journey !== 'active') return run;
  const r = clone(run);
  r.elapsed += seconds;

  // Movimento do marcador
  if (r.signal) {
    const progress = Math.min(1, r.elapsed / r.eta);
    r.position = { x: progress * 100, y: Math.sin(progress * Math.PI) * 20 };
  }

  // Checagem de suspeita -> alerta
  if (r.incident?.status === 'checking' && r.elapsed >= r.incident.deadline) {
    r.incident.status = 'alert';
    r.events.push({ kind: 'escalate', at: r.elapsed, detail: 'sem resposta' });
  }

  // Prazo de segurança vencido
  if (r.elapsed >= r.deadline && !r.incident) {
    r.incident = {
      id: `inc-${r.elapsed}`,
      status: 'alert',
      sources: ['signal'],
      reason: 'Prazo de segurança vencido',
      at: r.elapsed,
      deadline: r.elapsed,
      acknowledged: false,
      evidence: makeEvidence(`inc-${r.elapsed}`),
    };
    r.events.push({ kind: 'deadline', at: r.elapsed });
  }

  // Progressão de mídia
  if (r.incident) {
    for (const e of r.incident.evidence) {
      if (e.status === 'pending' && r.elapsed >= e.at + 2) e.status = 'sending';
      if (e.status === 'sending' && r.elapsed >= e.at + 5) e.status = 'available';
    }
  }

  // Fluxo policial simulado
  if (r.police.status === 'preparing' && r.elapsed >= r.police.at + 2) r.police.status = 'calling';
  if (r.police.status === 'calling' && r.elapsed >= r.police.at + 5) r.police.status = 'sending';
  if (r.police.status === 'sending' && r.elapsed >= r.police.at + 8) r.police.status = 'received';

  return r;
}
