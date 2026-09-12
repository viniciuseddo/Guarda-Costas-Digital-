process.env.NODE_ENV = 'test';
import test from 'node:test';
import assert from 'node:assert/strict';
import { server, coordinator, startServer } from '../server/index.ts';

const PORT = 3099;

test.before(async () => {
  await startServer(PORT);
});

test.after(() => {
  coordinator.stop();
  server.close();
});

test('end-to-end HTTP API and static file serving', async () => {
  const baseUrl = `http://localhost:${PORT}`;
  const roomId = `sala-e2e-${Date.now()}`;

  // 1. Static file serving
  const htmlRes = await fetch(`${baseUrl}/`);
  assert.equal(htmlRes.status, 200);
  const htmlText = await htmlRes.text();
  assert.ok(htmlText.includes('Sentinela'));

  const manifestRes = await fetch(`${baseUrl}/manifest.json`);
  assert.equal(manifestRes.status, 200);
  const manifest = await manifestRes.json();
  assert.equal(manifest.short_name, 'Sentinela');

  const audioRes = await fetch(`${baseUrl}/assets/audio-1.wav`);
  assert.equal(audioRes.status, 200);

  // 2. Room creation and joining
  const joinOwner = await fetch(`${baseUrl}/api/rooms/${roomId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin: '1234', role: 'owner', name: 'Alex' }),
  });
  assert.equal(joinOwner.status, 200);
  const ownerData = await joinOwner.json();
  assert.equal(ownerData.room.id, roomId);
  assert.equal(ownerData.run.journey, 'idle');

  const joinFamily = await fetch(`${baseUrl}/api/rooms/${roomId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin: '1234', role: 'family', name: 'Mariana' }),
  });
  assert.equal(joinFamily.status, 200);
  const familyData = await joinFamily.json();
  assert.equal(familyData.room.participants.length, 2);

  // 3. Start journey
  const startRes = await fetch(`${baseUrl}/api/rooms/${roomId}/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      runId: ownerData.run.id,
      role: 'owner',
      participantId: ownerData.participantId,
      commandId: 'cmd-e2e-1',
      action: 'start',
      payload: { mode: 'sound', sound: true },
    }),
  });
  assert.equal(startRes.status, 200);
  const startRun = (await startRes.json()).run;
  assert.equal(startRun.journey, 'active');

  // 4. Simulate impact -> checking
  const impactRes = await fetch(`${baseUrl}/api/rooms/${roomId}/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      runId: ownerData.run.id,
      role: 'owner',
      participantId: ownerData.participantId,
      commandId: 'cmd-e2e-2',
      action: 'simulate',
      payload: { scenario: 'impact' },
    }),
  });
  assert.equal(impactRes.status, 200);
  const impactRun = (await impactRes.json()).run;
  assert.equal(impactRun.incident.status, 'checking');

  // 5. SOS -> alert
  const sosRes = await fetch(`${baseUrl}/api/rooms/${roomId}/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      runId: ownerData.run.id,
      role: 'owner',
      participantId: ownerData.participantId,
      commandId: 'cmd-e2e-3',
      action: 'sos',
      payload: {},
    }),
  });
  assert.equal(sosRes.status, 200);
  const sosRun = (await sosRes.json()).run;
  assert.equal(sosRun.incident.status, 'alert');

  // 6. Family acknowledgement
  const ackRes = await fetch(`${baseUrl}/api/rooms/${roomId}/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      runId: ownerData.run.id,
      role: 'family',
      participantId: familyData.participantId,
      commandId: 'cmd-e2e-4',
      action: 'ack',
      payload: {},
    }),
  });
  assert.equal(ackRes.status, 200);
  const ackRun = (await ackRes.json()).run;
  assert.equal(ackRun.incident.acknowledged, true);

  // 7. Police escalation demo
  const policeRes = await fetch(`${baseUrl}/api/rooms/${roomId}/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      runId: ownerData.run.id,
      role: 'family',
      participantId: familyData.participantId,
      commandId: 'cmd-e2e-5',
      action: 'police-start',
      payload: { selected: ['foto-1'] },
    }),
  });
  assert.equal(policeRes.status, 200);
  const policeRun = (await policeRes.json()).run;
  assert.equal(policeRun.police.status, 'calling');
  assert.match(policeRun.police.reference, /^DEMO-/);

  // 8. Snapshot retrieval
  const snapRes = await fetch(`${baseUrl}/api/rooms/${roomId}/snapshot?cursor=0`);
  assert.equal(snapRes.status, 200);
  const snap = await snapRes.json();
  assert.equal(snap.run.journey, 'active');
  assert.ok(snap.eventsSince.length > 0);

  // 9. Arrive
  const arriveRes = await fetch(`${baseUrl}/api/rooms/${roomId}/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      runId: ownerData.run.id,
      role: 'owner',
      participantId: ownerData.participantId,
      commandId: 'cmd-e2e-6',
      action: 'arrive',
      payload: {},
    }),
  });
  assert.equal(arriveRes.status, 200);
  const arriveRun = (await arriveRes.json()).run;
  assert.equal(arriveRun.journey, 'arrived');
  assert.equal(arriveRun.incident.status, 'resolved');

  // 10. Reset room
  const resetRes = await fetch(`${baseUrl}/api/rooms/${roomId}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmed: true }),
  });
  assert.equal(resetRes.status, 200);
  const resetData = await resetRes.json();
  assert.equal(resetData.run.journey, 'idle');
});
