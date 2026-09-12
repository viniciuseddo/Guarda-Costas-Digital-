// Constantes do bairro e catálogo de mídia (100% compatível com todos os navegadores)
const CAMPUS_ROUTE = [
  { id: 'p1', name: 'Rua das Flores (Saída)', x: 12, y: 78, description: 'Início do trajeto no bairro' },
  { id: 'p2', name: 'Av. Brasil (Iluminada)', x: 38, y: 55, description: 'Avenida principal com comércio' },
  { id: 'p3', name: 'Praça Central do Bairro', x: 65, y: 40, description: 'Área residencial arborizada' },
  { id: 'p4', name: 'Destino (Residência/Metrô)', x: 90, y: 18, description: 'Ponto final do trajeto' },
];

const DEMO_ZONES = [
  {
    id: 'zone-corridor',
    name: 'Corredor Seguro (Bairro)',
    type: 'safe_corridor',
    description: 'Via com iluminação pública e movimentação',
    polygon: [[10, 85], [35, 75], [45, 50], [20, 60]],
  },
  {
    id: 'zone-caution',
    name: 'Trecho com Atenção (Bairro)',
    type: 'caution_area',
    description: 'Rua residencial com menor iluminação à noite',
    polygon: [[55, 50], [80, 45], [85, 25], [60, 30]],
  },
];

const MEDIA_CATALOG = [
  {
    id: 'foto-1',
    kind: 'photo',
    title: 'Fachada Residencial',
    caption: 'Foto de contexto: fachada de casa no bairro',
    url: '/assets/foto-1.svg',
    license: 'Licença aberta / Ativo sintético educacional',
    source: 'mock-campus-asset',
    atOffset: 0,
  },
  {
    id: 'foto-2',
    kind: 'photo',
    title: 'Calçada da Av. Brasil',
    caption: 'Foto de contexto: calçada iluminada com postes',
    url: '/assets/foto-2.svg',
    license: 'Licença aberta / Ativo sintético educacional',
    source: 'mock-campus-asset',
    atOffset: 3,
  },
  {
    id: 'foto-3',
    kind: 'photo',
    title: 'Praça do Bairro',
    caption: 'Foto de contexto: visão panorâmica da praça',
    url: '/assets/foto-3.svg',
    license: 'Licença aberta / Ativo sintético educacional',
    source: 'mock-campus-asset',
    atOffset: 6,
  },
  {
    id: 'foto-4',
    kind: 'photo',
    title: 'Entrada do Destino',
    caption: 'Foto de contexto: portão residencial de chegada',
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

// Estado local da sessão do cliente
const state = {
  roomId: 'sala-demo',
  pin: '1234',
  role: 'owner',
  name: 'Alex',
  participantId: 'p-' + Math.random().toString(36).slice(2, 9),
  run: null,
  cursor: 0,
  connectionStatus: 'offline',
  lastPositionTime: 0,
  eventSource: null,
  heartbeatTimer: null,
  audioCtx: null,
  sirenOsc: null,
};

// Carrega dados salvos da sessão anterior
function loadStoredSession() {
  try {
    const saved = localStorage.getItem('sentinela_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      state.roomId = parsed.roomId || state.roomId;
      state.pin = parsed.pin || state.pin;
      state.role = parsed.role || state.role;
      state.name = parsed.name || state.name;
      state.participantId = parsed.participantId || state.participantId;
    }
  } catch (e) {
    console.warn('Falha ao ler sessão salva', e);
  }
}

function saveSession() {
  try {
    localStorage.setItem('sentinela_session', JSON.stringify({
      roomId: state.roomId,
      pin: state.pin,
      role: state.role,
      name: state.name,
      participantId: state.participantId,
    }));
  } catch (e) {}
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
  loadStoredSession();
  setupUIEvents();
  registerServiceWorker();

  // Pré-preenche inputs de login
  document.getElementById('input-room-id').value = state.roomId;
  document.getElementById('input-pin').value = state.pin;
  document.getElementById('input-name').value = state.name;
});

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration note:', err);
    });
  }
}

// Configuração dos eventos de interface
function setupUIEvents() {
  // Login
  document.getElementById('btn-login-owner').addEventListener('click', () => join('owner'));
  document.getElementById('btn-login-family').addEventListener('click', () => join('family'));

  // Drawer de controles da demo
  document.getElementById('btn-toggle-demo-drawer').addEventListener('click', () => {
    const d = document.getElementById('demo-controls-drawer');
    d.style.display = d.style.display === 'none' ? 'flex' : 'none';
  });
  document.getElementById('btn-close-demo-drawer').addEventListener('click', () => {
    document.getElementById('demo-controls-drawer').style.display = 'none';
  });

  // Controles do apresentador
  document.getElementById('btn-demo-pause').addEventListener('click', () => sendCommand('pause', {}));
  document.getElementById('btn-demo-resume').addEventListener('click', () => sendCommand('resume', {}));
  document.getElementById('btn-demo-step-5').addEventListener('click', () => sendCommand('step', { seconds: 5 }));
  document.getElementById('btn-demo-step-10').addEventListener('click', () => sendCommand('step', { seconds: 10 }));
  document.getElementById('btn-demo-swap-role').addEventListener('click', swapRoles);
  document.getElementById('btn-demo-reset').addEventListener('click', resetRoom);

  // Ações Meu Trajeto (Owner)
  document.getElementById('btn-start-journey').addEventListener('click', () => {
    const mode = document.getElementById('select-mode').value;
    sendCommand('start', { mode, sound: mode === 'sound' });
  });

  document.getElementById('btn-owner-safe').addEventListener('click', () => sendCommand('safe', {}));
  document.getElementById('btn-owner-checking-sos').addEventListener('click', () => sendCommand('sos', {}));
  document.getElementById('btn-owner-sos').addEventListener('click', () => sendCommand('sos', {}));
  document.getElementById('btn-owner-arrive').addEventListener('click', () => sendCommand('arrive', {}));
  document.getElementById('btn-owner-extend').addEventListener('click', () => sendCommand('extend', {}));
  document.getElementById('btn-silence-siren').addEventListener('click', stopSiren);
  document.getElementById('btn-owner-restart').addEventListener('click', resetRoom);

  // Simulações de Sensores (Owner)
  document.getElementById('btn-sim-impact').addEventListener('click', () => sendCommand('simulate', { scenario: 'impact' }));
  document.getElementById('btn-sim-snatch').addEventListener('click', () => sendCommand('simulate', { scenario: 'snatch' }));
  document.getElementById('btn-sim-volume').addEventListener('click', () => sendCommand('simulate', { scenario: 'help' }));
  document.getElementById('btn-sim-voice').addEventListener('click', () => sendCommand('simulate', { scenario: 'voice' }));
  document.getElementById('btn-sim-battery').addEventListener('click', () => sendCommand('simulate', { scenario: 'battery' }));
  document.getElementById('btn-sim-signal').addEventListener('click', () => sendCommand('simulate', { scenario: 'signal' }));
  document.getElementById('btn-sim-ai-offline').addEventListener('click', () => sendCommand('simulate', { scenario: 'ai-offline' }));

  // Ações Familiar
  document.getElementById('btn-family-ack').addEventListener('click', () => sendCommand('ack', {}));

  // Simulação Policial
  document.getElementById('btn-open-police-modal').addEventListener('click', openPoliceModal);
  document.getElementById('btn-close-police-modal').addEventListener('click', () => {
    document.getElementById('modal-police-preview').style.display = 'none';
  });
  document.getElementById('btn-confirm-police-send').addEventListener('click', confirmPoliceSend);
  document.getElementById('btn-police-fail').addEventListener('click', () => sendCommand('police-fail', {}));
  document.getElementById('btn-police-retry').addEventListener('click', () => sendCommand('police-retry', {}));
  document.getElementById('btn-police-cancel').addEventListener('click', () => sendCommand('police-cancel', {}));

  // Modal Foto
  document.getElementById('btn-close-photo-modal').addEventListener('click', () => {
    document.getElementById('modal-photo').style.display = 'none';
  });
}

// Vínculo de sala
async function join(role) {
  state.roomId = document.getElementById('input-room-id').value.trim() || 'sala-demo';
  state.pin = document.getElementById('input-pin').value.trim() || '1234';
  state.name = document.getElementById('input-name').value.trim() || (role === 'owner' ? 'Alex' : 'Mariana');
  state.role = role;
  saveSession();

  try {
    const res = await fetch(`/api/rooms/${encodeURIComponent(state.roomId)}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin: state.pin,
        role: state.role,
        name: state.name,
        participantId: state.participantId,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(`Erro ao entrar na sala: ${err.error || 'Falha de autenticação'}`);
      return;
    }

    const data = await res.json();
    state.run = data.run;
    state.cursor = data.cursor;

    updateScreenView();
    connectSSE();
    startHeartbeat();
  } catch (err) {
    alert(`Erro de conexão ao coordenador: ${err.message}`);
  }
}

// Alternar papel (Inversão A ⇄ B)
async function swapRoles() {
  const newRole = state.role === 'owner' ? 'family' : 'owner';
  state.role = newRole;
  state.name = newRole === 'owner' ? 'Alex' : 'Mariana';
  saveSession();
  await join(newRole);
}

// Conectar ao canal SSE de eventos da sala
function connectSSE() {
  if (state.eventSource) {
    state.eventSource.close();
  }

  setConnectionStatus('reconnecting');
  const url = `/api/rooms/${encodeURIComponent(state.roomId)}/events`;
  state.eventSource = new EventSource(url);

  state.eventSource.onopen = () => {
    setConnectionStatus('online');
    // Busca snapshot atual para recuperar qualquer evento pendente
    fetchSnapshot();
  };

  state.eventSource.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.run) {
        state.run = data.run;
      }
      if (typeof data.cursor === 'number') {
        state.cursor = data.cursor;
      }
      render();
    } catch (err) {
      console.warn('Falha no parse do evento SSE', err);
    }
  };

  state.eventSource.onerror = () => {
    setConnectionStatus('reconnecting');
    // EventSource reconecta automaticamente
  };
}

// Heartbeat a cada 5s para registrar conectividade real
function startHeartbeat() {
  if (state.heartbeatTimer) clearInterval(state.heartbeatTimer);
  state.heartbeatTimer = setInterval(async () => {
    try {
      await fetch(`/api/rooms/${encodeURIComponent(state.roomId)}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: state.participantId }),
      });
    } catch (e) {
      setConnectionStatus('offline');
    }
  }, 5000);
}

async function fetchSnapshot() {
  try {
    const res = await fetch(`/api/rooms/${encodeURIComponent(state.roomId)}/snapshot?cursor=${state.cursor}`);
    if (res.ok) {
      const snap = await res.json();
      state.run = snap.run;
      state.cursor = snap.cursor;
      render();
    }
  } catch (err) {}
}

function setConnectionStatus(status) {
  state.connectionStatus = status;
  const badge = document.getElementById('conn-indicator');
  badge.className = `conn-status conn-${status}`;
  badge.textContent = status === 'online' ? 'Online' : status === 'reconnecting' ? 'Reconectando' : 'Offline';
}

// Disparo de comandos idempotentes para o coordenador
async function sendCommand(action, payload) {
  if (!state.run) return;
  const commandId = `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const body = {
    roomId: state.roomId,
    runId: state.run.id,
    role: state.role,
    participantId: state.participantId,
    commandId,
    action,
    payload,
  };

  try {
    const res = await fetch(`/api/rooms/${encodeURIComponent(state.roomId)}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(`Ação não permitida: ${err.error || 'Erro no comando'}`);
      return;
    }

    const data = await res.json();
    state.run = data.run;
    state.cursor = data.cursor;
    render();
  } catch (err) {
    alert(`Falha de comunicação: ${err.message}`);
  }
}

// Reset da sala
async function resetRoom() {
  if (!confirm('Deseja reiniciar a execução da demonstração para esta sala?')) return;
  try {
    const res = await fetch(`/api/rooms/${encodeURIComponent(state.roomId)}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmed: true }),
    });
    if (res.ok) {
      const data = await res.json();
      state.run = data.run;
      state.cursor = 0;
      render();
    }
  } catch (err) {
    alert(`Erro ao resetar: ${err.message}`);
  }
}

// Alterna telas visíveis conforme papel
function updateScreenView() {
  document.getElementById('screen-login').style.display = 'none';
  document.getElementById('screen-owner').style.display = state.role === 'owner' ? 'flex' : 'none';
  document.getElementById('screen-family').style.display = state.role === 'family' ? 'flex' : 'none';

  const roleLabel = document.getElementById('label-role');
  roleLabel.textContent = state.role === 'owner' ? '📱 Meu Trajeto' : '👥 Familiar';
}

// RENDERIZAÇÃO COMPLETA DA INTERFACE
function render() {
  if (!state.run) return;
  const run = state.run;

  // Atualiza mapas
  renderMap('map-owner', run);
  renderMap('map-family', run);

  if (state.role === 'owner') {
    renderOwnerScreen(run);
  } else if (state.role === 'family') {
    renderFamilyScreen(run);
  }
}

// RENDER: MEU TRAJETO
function renderOwnerScreen(run) {
  const setupPanel = document.getElementById('owner-setup-panel');
  const activePanel = document.getElementById('owner-active-panel');
  const arrivedPanel = document.getElementById('owner-arrived-panel');
  const simulatorsCard = document.getElementById('owner-simulators-card');
  const checkingBanner = document.getElementById('owner-checking-banner');
  const alertBanner = document.getElementById('owner-alert-banner');

  if (run.journey === 'idle') {
    setupPanel.style.display = 'flex';
    activePanel.style.display = 'none';
    arrivedPanel.style.display = 'none';
    simulatorsCard.style.display = 'none';
    checkingBanner.style.display = 'none';
    alertBanner.style.display = 'none';
    return;
  }

  setupPanel.style.display = 'none';
  activePanel.style.display = run.journey === 'active' ? 'flex' : 'none';
  arrivedPanel.style.display = run.journey === 'arrived' ? 'flex' : 'none';
  simulatorsCard.style.display = run.journey === 'active' ? 'flex' : 'none';

  // Telemetria
  document.getElementById('owner-eta-display').textContent = formatSeconds(Math.max(0, run.eta - run.elapsed));
  document.getElementById('owner-deadline-display').textContent = formatSeconds(Math.max(0, run.deadline - run.elapsed));
  document.getElementById('owner-battery-display').textContent = `${run.battery}%${run.battery <= 15 ? ' (Crítica)' : ''}`;
  document.getElementById('owner-signal-display').textContent = run.signal ? 'Conectado' : 'Sinal Perdido (Congelado)';

  // Checagem de falso alarme
  if (run.incident?.status === 'checking') {
    checkingBanner.style.display = 'flex';
    const remaining = Math.max(0, run.incident.deadline - run.elapsed);
    document.getElementById('checking-reason').textContent = run.incident.reason;
    document.getElementById('checking-countdown').textContent = `${remaining}s`;
  } else {
    checkingBanner.style.display = 'none';
  }

  // Alerta em andamento
  if (run.incident?.status === 'alert') {
    alertBanner.style.display = 'flex';
    document.getElementById('owner-alert-desc').textContent =
      `Motivo: ${run.incident.reason}. Evidências enviadas ao familiar.`;

    if (run.mode === 'sound' && run.soundEnabled) {
      document.getElementById('siren-container').style.display = 'block';
      playSiren();
    } else {
      document.getElementById('siren-container').style.display = 'none';
    }
  } else {
    alertBanner.style.display = 'none';
    stopSiren();
  }
}

// RENDER: FAMILIAR
function renderFamilyScreen(run) {
  const badge = document.getElementById('family-status-badge');
  const alertCard = document.getElementById('family-alert-card');
  const ackStatus = document.getElementById('family-ack-status');
  const btnAck = document.getElementById('btn-family-ack');

  // Status geral
  badge.textContent = run.journey === 'idle' ? 'AGUARDANDO' : run.journey === 'arrived' ? 'CHEGADA CONFIRMADA' : run.incident?.status === 'alert' ? 'ALERTA ATIVO' : 'EM TRAJETO';
  badge.style.backgroundColor = run.incident?.status === 'alert' ? '#dc2626' : run.journey === 'arrived' ? '#16a34a' : '#22c55e';

  document.getElementById('family-battery-display').textContent = `${run.battery}%`;
  document.getElementById('family-signal-age').textContent = run.signal ? 'Ao vivo' : 'Sinal perdido há 12s';

  // Alerta
  if (run.incident && (run.incident.status === 'alert' || run.incident.status === 'checking')) {
    alertCard.style.display = 'flex';
    document.getElementById('family-alert-reason').textContent = run.incident.reason;
    document.getElementById('family-alert-time').textContent = `T + ${run.incident.at}s do cenário`;

    if (run.incident.acknowledged) {
      ackStatus.style.display = 'block';
      btnAck.disabled = true;
      btnAck.textContent = '✓ Alerta Reconhecido';
    } else {
      ackStatus.style.display = 'none';
      btnAck.disabled = false;
      btnAck.textContent = '👀 Confirmar Recebimento Humano';
    }

    renderPoliceStatus(run);
  } else {
    alertCard.style.display = 'none';
  }

  // Galeria de evidências
  renderEvidenceGrid(run);

  // Timeline
  renderTimeline(run);
}

// Galeria de registros e evidências
function renderEvidenceGrid(run) {
  const container = document.getElementById('evidence-grid');
  container.innerHTML = '';
  const evidence = run.incident?.evidence || [];

  if (evidence.length === 0) {
    container.innerHTML = '<div style="grid-column: span 2; font-size: 0.8rem; color: var(--text-muted);">Nenhuma evidência registrada ainda.</div>';
    document.getElementById('audio-player-container').style.display = 'none';
    return;
  }

  let hasAudioAvailable = false;

  for (const item of evidence) {
    const card = document.createElement('div');
    card.className = 'media-card';

    const statusLabel =
      item.status === 'available' ? '✓ Disponível' :
      item.status === 'sending' ? '⏳ Enviando...' :
      item.status === 'failed' ? '❌ Falha de Envio' : 'Pendente';

    if (item.kind === 'photo') {
      const asset = MEDIA_CATALOG.find(m => m.id === item.id.split('-').slice(-2).join('-')) || MEDIA_CATALOG[0];
      card.innerHTML = `
        <div style="font-weight: bold;">${item.label}</div>
        <img class="media-thumbnail" src="${asset.url}" alt="${item.label}">
        <div>Status: <strong>${statusLabel}</strong></div>
        ${item.status === 'available' ? `<button class="btn btn-secondary" style="min-height: 36px; padding: 4px; font-size: 0.75rem;">Ver Foto</button>` : ''}
        ${item.status === 'failed' ? `<button class="btn btn-warning btn-retry" style="min-height: 36px; padding: 4px; font-size: 0.75rem;">Repetir Envio</button>` : ''}
      `;

      if (item.status === 'available') {
        card.querySelector('button')?.addEventListener('click', () => openPhotoModal(asset));
      }
      if (item.status === 'failed') {
        card.querySelector('.btn-retry')?.addEventListener('click', () => sendCommand('media-retry', { id: item.id }));
      }
    } else if (item.kind === 'audio') {
      if (item.status === 'available') hasAudioAvailable = true;
      card.innerHTML = `
        <div style="font-weight: bold;">${item.label} (12s)</div>
        <div class="media-thumbnail" style="font-size: 1.5rem;">🎙️</div>
        <div>Status: <strong>${statusLabel}</strong></div>
        ${item.status === 'failed' ? `<button class="btn btn-warning btn-retry" style="min-height: 36px; padding: 4px; font-size: 0.75rem;">Repetir Envio</button>` : ''}
      `;
      if (item.status === 'failed') {
        card.querySelector('.btn-retry')?.addEventListener('click', () => sendCommand('media-retry', { id: item.id }));
      }
    }

    container.appendChild(card);
  }

  document.getElementById('audio-player-container').style.display = hasAudioAvailable ? 'block' : 'none';
}

// Modal de Foto
function openPhotoModal(asset) {
  document.getElementById('modal-photo-title').textContent = asset.title;
  document.getElementById('modal-photo-img').src = asset.url;
  document.getElementById('modal-photo-caption').textContent = asset.caption;
  document.getElementById('modal-photo').style.display = 'flex';
}

// Status do Acionamento Policial Simulado
function renderPoliceStatus(run) {
  const panel = document.getElementById('police-status-panel');
  const p = run.police;

  if (p.status === 'idle' || p.status === 'cancelled') {
    panel.style.display = 'none';
    return;
  }

  panel.style.display = 'flex';
  document.getElementById('police-ref-display').textContent = p.reference;

  const stageMap = {
    preparing: 'Preparando pacote de contexto...',
    calling: 'Chamada simulada em andamento...',
    sending: 'Transmitindo pacote de dados simulados...',
    received: 'Pacote recebido na simulação (Concluído)',
    failed: 'Falha na transmissão fictícia',
  };

  document.getElementById('police-stage-display').textContent = stageMap[p.status] || p.status;
  document.getElementById('btn-police-fail').style.display = (p.status === 'calling' || p.status === 'sending') ? 'inline-flex' : 'none';
  document.getElementById('btn-police-retry').style.display = p.status === 'failed' ? 'inline-flex' : 'none';
  document.getElementById('btn-police-cancel').style.display = p.status !== 'received' ? 'inline-flex' : 'none';
}

// Modal Prévia Acionamento Policial
function openPoliceModal() {
  const run = state.run;
  if (!run || !run.incident) return;

  document.getElementById('police-preview-reason').textContent = run.incident.reason;
  document.getElementById('police-preview-pos').textContent = `Passarela dos Estudantes (Coord: X=${Math.round(run.position.x)}, Y=${Math.round(run.position.y)})`;
  document.getElementById('police-preview-time').textContent = `T + ${run.incident.at}s do cenário`;

  const list = document.getElementById('police-preview-evidence-list');
  list.innerHTML = '';

  for (const e of run.incident.evidence) {
    const div = document.createElement('div');
    const checked = e.status === 'available' ? 'checked' : '';
    const note = e.status === 'pending' ? '(Envio pendente)' : e.status === 'failed' ? '(Falhou)' : '(Disponível)';
    div.innerHTML = `
      <label style="flex-direction: row; align-items: center; gap: 8px;">
        <input type="checkbox" value="${e.id}" ${checked}>
        <span>${e.label} ${note}</span>
      </label>
    `;
    list.appendChild(div);
  }

  document.getElementById('modal-police-preview').style.display = 'flex';
}

function confirmPoliceSend() {
  const checkboxes = document.querySelectorAll('#police-preview-evidence-list input[type="checkbox"]:checked');
  const selected = Array.from(checkboxes).map(c => c.value);
  document.getElementById('modal-police-preview').style.display = 'none';
  sendCommand('police-start', { selected });
}

// Timeline de eventos
function renderTimeline(run) {
  const container = document.getElementById('timeline-list');
  container.innerHTML = '';

  if (run.events.length === 0) {
    container.innerHTML = '<div style="font-size: 0.85rem; color: var(--text-muted);">Nenhum evento registrado ainda.</div>';
    return;
  }

  const events = [...run.events].reverse(); // mais recentes primeiro
  for (const ev of events) {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
      <div class="timeline-header">
        <span>${formatEventKind(ev.kind)}</span>
        <span>+${ev.at}s</span>
      </div>
      ${ev.detail ? `<div style="font-size: 0.8rem;">${ev.detail}</div>` : ''}
      <div class="timeline-status">Sincronizado • Apresentado</div>
    `;
    container.appendChild(item);
  }
}

function formatEventKind(kind) {
  const map = {
    start: '🏁 Trajeto Iniciado',
    alert: '🚨 Alerta Emitido',
    ack: '👀 Alerta Reconhecido pelo Familiar',
    arrived: '🎉 Chegada Confirmada',
    extend: '⏱️ Prazo Estendido',
    simulate: '🧪 Simulação Acionada',
    'false-alarm': '✅ Falso Alarme Resolvido',
    escalate: '⚠️ Escalonamento por Vencimento',
    'police-start': '🚓 Simulação Policial Iniciada',
    'police-fail': '❌ Falha Simulação Policial',
    'police-retry': '🔄 Repetir Simulação Policial',
    'police-cancel': '⏹️ Cancelamento Simulação Policial',
    pause: '⏸️ Cenário Pausado',
    resume: '▶️ Cenário Retomado',
  };
  return map[kind] || kind;
}

// MAPA VETORIAL ILUSTRATIVO INTERATIVO (Reqs 5.1 - 5.4)
function renderMap(elementId, run) {
  const container = document.getElementById(elementId);
  if (!container) return;

  const points = CAMPUS_ROUTE;
  const pos = run.position || { x: 0, y: 0 };
  const routePath = points.map(p => `${p.x * 5},${p.y * 2.5}`).join(' L ');

  // SVG interativo com zonas de demonstração e percurso
  const svgHtml = `
    <svg viewBox="0 0 500 250" style="width: 100%; height: 100%; background: #e2e8f0;">
      <!-- Grid de fundo -->
      <defs>
        <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#cbd5e1" stroke-width="0.5"/>
        </pattern>
      </defs>
      <rect width="500" height="250" fill="url(#grid)" />

      <!-- Zonas de demonstração (Req 5.4) -->
      ${DEMO_ZONES.map(z => {
        const poly = z.polygon.map(([x, y]) => `${x * 5},${y * 2.5}`).join(' ');
        const fill = z.type === 'safe_corridor' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(245, 158, 11, 0.25)';
        const stroke = z.type === 'safe_corridor' ? '#16a34a' : '#d97706';
        return `<polygon points="${poly}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-dasharray="4,4"/>`;
      }).join('')}

      <!-- Linha do trajeto planejado -->
      <path d="M ${routePath}" fill="none" stroke="#64748b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Pontos de referência do campus -->
      ${points.map((p, i) => `
        <circle cx="${p.x * 5}" cy="${p.y * 2.5}" r="5" fill="#334155" />
        <text x="${p.x * 5}" y="${p.y * 2.5 - 9}" font-size="10" fill="#0f172a" font-weight="600" text-anchor="middle">${p.name}</text>
      `).join('')}

      <!-- Marcador de posição atual -->
      <g transform="translate(${pos.x * 5}, ${Math.max(10, Math.min(240, 150 + pos.y * 2))})">
        <circle r="12" fill="${run.incident?.status === 'alert' ? '#ef4444' : '#2563eb'}" opacity="0.3">
          <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle r="7" fill="${run.incident?.status === 'alert' ? '#dc2626' : '#1d4ed8'}" stroke="#ffffff" stroke-width="2"/>
      </g>
    </svg>
  `;

  container.innerHTML = svgHtml;

  // Atualiza label da posição
  const posLabel = document.getElementById(`${elementId}-pos`);
  if (posLabel) {
    posLabel.textContent = run.position.x > 80 ? 'Chegando ao Destino (Residência)' : run.position.x > 40 ? 'Praça Central do Bairro' : 'Rua das Flores (Saída)';
  }
}

// SIRENE LOCAL DE ENSAIO (Req 6.5)
function playSiren() {
  if (state.sirenOsc) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new AudioCtx();
    const osc = state.audioCtx.createOscillator();
    const gain = state.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, state.audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, state.audioCtx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.2, state.audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(state.audioCtx.destination);

    osc.start();
    state.sirenOsc = osc;

    // Sirene dura no máximo 5 segundos conforme requisito 6.5
    setTimeout(() => {
      stopSiren();
    }, 5000);
  } catch (e) {
    console.warn('AudioContext bloqueado ou indisponível', e);
  }
}

function stopSiren() {
  if (state.sirenOsc) {
    try {
      state.sirenOsc.stop();
      state.sirenOsc.disconnect();
    } catch (e) {}
    state.sirenOsc = null;
  }
}

function formatSeconds(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
