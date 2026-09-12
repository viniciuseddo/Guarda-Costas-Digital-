import fs from 'node:fs';
import path from 'node:path';
import { createRun, command, advance, validateCommand } from '../shared/model.ts';
import type { Run, Role, Room, CommandMessage, RoomSnapshot } from '../shared/model.ts';

export interface RoomData {
  room: Room;
  run: Run;
  eventLog: Array<{ cursor: number; data: any }>;
  cursor: number;
  commandHistory: Map<string, { status: number; result: any }>;
  subscribers: Set<(msg: string) => void>;
}

export class Coordinator {
  private rooms: Map<string, RoomData> = new Map();
  private storageDir: string;
  private intervalTimer: NodeJS.Timeout | null = null;

  constructor(storageDir = path.resolve('.data/snapshots')) {
    this.storageDir = storageDir;
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
    this.loadSnapshots();
    this.startClock();
  }

  public stop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  private startClock() {
    this.intervalTimer = setInterval(() => {
      this.tick();
    }, 1000);
    // Don't keep process open if only timer is running
    if (this.intervalTimer.unref) this.intervalTimer.unref();
  }

  public tick() {
    for (const [roomId, data] of this.rooms.entries()) {
      if (data.run.journey === 'active' && !data.run.paused) {
        const prevEventsCount = data.run.events.length;
        const prevIncidentStatus = data.run.incident?.status;
        const prevPoliceStatus = data.run.police.status;

        data.run = advance(data.run, 1);

        // Check if new events were produced
        if (data.run.events.length > prevEventsCount) {
          const newEvents = data.run.events.slice(prevEventsCount);
          for (const ev of newEvents) {
            data.cursor += 1;
            data.eventLog.push({ cursor: data.cursor, data: { type: 'event', event: ev } });
          }
        }

        this.broadcast(roomId, {
          type: 'tick',
          run: data.run,
          cursor: data.cursor,
          serverTime: Date.now(),
        });
      }
    }
  }

  private loadSnapshots() {
    try {
      if (!fs.existsSync(this.storageDir)) return;
      const files = fs.readdirSync(this.storageDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const raw = fs.readFileSync(path.join(this.storageDir, file), 'utf8');
        const snap = JSON.parse(raw);
        if (snap.room && snap.run) {
          this.rooms.set(snap.room.id, {
            room: snap.room,
            run: snap.run,
            eventLog: snap.eventLog || [],
            cursor: snap.cursor || 0,
            commandHistory: new Map(),
            subscribers: new Set(),
          });
        }
      }
    } catch {
      // Ignora falhas de leitura inicial
    }
  }

  private persistSnapshot(roomId: string) {
    const data = this.rooms.get(roomId);
    if (!data) return;
    try {
      const snap = {
        room: data.room,
        run: data.run,
        eventLog: data.eventLog.slice(-50), // guarda últimos 50 eventos
        cursor: data.cursor,
        savedAt: Date.now(),
      };
      fs.writeFileSync(path.join(this.storageDir, `${roomId}.json`), JSON.stringify(snap, null, 2), 'utf8');
    } catch {
      // Ignora erros não críticos de persistência
    }
  }

  public getOrCreateRoom(roomId = 'sala-demo', pin = '1234'): RoomData {
    let data = this.rooms.get(roomId);
    if (!data) {
      const room: Room = {
        id: roomId,
        pin,
        createdAt: Date.now(),
        participants: [],
      };
      const run = createRun(`run-${Date.now()}`, roomId);
      data = {
        room,
        run,
        eventLog: [],
        cursor: 0,
        commandHistory: new Map(),
        subscribers: new Set(),
      };
      this.rooms.set(roomId, data);
      this.persistSnapshot(roomId);
    }
    return data;
  }

  public joinRoom(roomId: string, pin: string, role: Role, name: string, participantId?: string): { participantId: string; room: Room; run: Run; cursor: number } {
    const data = this.getOrCreateRoom(roomId, pin);
    if (data.room.pin && data.room.pin !== pin) {
      throw new Error('PIN inválido para a sala');
    }

    const pId = participantId || `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const existing = data.room.participants.find(p => p.id === pId);
    if (existing) {
      existing.role = role;
      existing.name = name;
      existing.lastSeen = Date.now();
    } else {
      data.room.participants.push({
        id: pId,
        role,
        name,
        lastSeen: Date.now(),
      });
    }

    this.persistSnapshot(roomId);
    this.broadcast(roomId, {
      type: 'participant_joined',
      participants: data.room.participants,
    });

    return {
      participantId: pId,
      room: data.room,
      run: data.run,
      cursor: data.cursor,
    };
  }

  public heartbeat(roomId: string, participantId: string) {
    const data = this.rooms.get(roomId);
    if (!data) return;
    const p = data.room.participants.find(x => x.id === participantId);
    if (p) {
      p.lastSeen = Date.now();
    }
  }

  public executeCommand(rawCommand: unknown): { run: Run; cursor: number } {
    const cmd = validateCommand(rawCommand);
    const data = this.rooms.get(cmd.roomId);
    if (!data) throw new Error('Sala não encontrada');

    // Validação de execução atual
    if (cmd.runId !== data.run.id) {
      throw new Error(`Comando obsoleto da execução ${cmd.runId}; execução atual é ${data.run.id}`);
    }

    // Idempotência
    if (data.commandHistory.has(cmd.commandId)) {
      const cached = data.commandHistory.get(cmd.commandId)!;
      return cached.result;
    }

    // Executa comando no modelo
    const prevEventsCount = data.run.events.length;
    data.run = command(data.run, cmd.role, cmd.action, cmd.payload);

    // Registra novos eventos
    if (data.run.events.length > prevEventsCount) {
      const newEvents = data.run.events.slice(prevEventsCount);
      for (const ev of newEvents) {
        data.cursor += 1;
        data.eventLog.push({ cursor: data.cursor, data: { type: 'event', event: ev } });
      }
    }

    const result = { run: data.run, cursor: data.cursor };
    data.commandHistory.set(cmd.commandId, { status: 200, result });
    this.persistSnapshot(cmd.roomId);

    // Notifica clientes da sala
    this.broadcast(cmd.roomId, {
      type: 'command_executed',
      action: cmd.action,
      run: data.run,
      cursor: data.cursor,
      serverTime: Date.now(),
    });

    return result;
  }

  public resetRoom(roomId: string, confirmed: boolean): { room: Room; run: Run; cursor: number } {
    if (!confirmed) throw new Error('Confirmação de reset obrigatória');
    const data = this.rooms.get(roomId);
    if (!data) throw new Error('Sala não encontrada');

    // Nova execução invalida comandos anteriores
    const newRunId = `run-${Date.now()}`;
    data.run = createRun(newRunId, roomId);
    data.eventLog = [];
    data.cursor = 0;
    data.commandHistory.clear();

    this.persistSnapshot(roomId);
    this.broadcast(roomId, {
      type: 'reset',
      run: data.run,
      cursor: 0,
      serverTime: Date.now(),
    });

    return {
      room: data.room,
      run: data.run,
      cursor: 0,
    };
  }

  public getSnapshot(roomId: string, sinceCursor = 0): RoomSnapshot & { eventsSince: any[] } {
    const data = this.rooms.get(roomId);
    if (!data) throw new Error('Sala não encontrada');
    const eventsSince = data.eventLog.filter(e => e.cursor > sinceCursor);
    return {
      room: data.room,
      run: data.run,
      cursor: data.cursor,
      serverTime: Date.now(),
      eventsSince,
    };
  }

  public subscribe(roomId: string, listener: (msg: string) => void): () => void {
    const data = this.getOrCreateRoom(roomId);
    data.subscribers.add(listener);
    return () => {
      data.subscribers.delete(listener);
    };
  }

  private broadcast(roomId: string, payload: any) {
    const data = this.rooms.get(roomId);
    if (!data) return;
    const msg = `data: ${JSON.stringify(payload)}\n\n`;
    for (const sub of data.subscribers) {
      try {
        sub(msg);
      } catch {
        data.subscribers.delete(sub);
      }
    }
  }
}
