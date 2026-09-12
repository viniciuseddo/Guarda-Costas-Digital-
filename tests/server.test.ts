import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Coordinator } from '../server/coordinator.ts';

const testDir = path.resolve('.data/test-snapshots');

test.beforeEach(() => {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
});

test('room creation and joining with role validation', () => {
  const coord = new Coordinator(testDir);
  try {
    const res = coord.joinRoom('sala-1', '1234', 'owner', 'Alex');
    assert.equal(res.room.id, 'sala-1');
    assert.equal(res.room.participants.length, 1);
    assert.equal(res.room.participants[0].role, 'owner');
    assert.equal(res.run.journey, 'idle');

    // Invalid PIN
    assert.throws(() => coord.joinRoom('sala-1', 'errado', 'family', 'Mariana'), /PIN inválido/);

    // Family joins with correct PIN
    const res2 = coord.joinRoom('sala-1', '1234', 'family', 'Mariana');
    assert.equal(res2.room.participants.length, 2);
  } finally {
    coord.stop();
  }
});

test('command idempotency prevents duplicate state changes or events', () => {
  const coord = new Coordinator(testDir);
  try {
    const { run } = coord.joinRoom('sala-idemp', '1234', 'owner', 'Alex');
    const startCmd = {
      roomId: 'sala-idemp',
      runId: run.id,
      role: 'owner',
      participantId: 'alex',
      commandId: 'cmd-start-1',
      action: 'start',
      payload: { mode: 'discreet', sound: false },
    };

    const res1 = coord.executeCommand(startCmd);
    assert.equal(res1.run.journey, 'active');
    const cursorAfterFirst = res1.cursor;

    // Repeating the same commandId
    const res2 = coord.executeCommand(startCmd);
    assert.equal(res2.run.journey, 'active');
    assert.equal(res2.cursor, cursorAfterFirst); // Cursor does not advance on replay

    // SOS command
    const sosCmd = {
      roomId: 'sala-idemp',
      runId: run.id,
      role: 'owner',
      participantId: 'alex',
      commandId: 'cmd-sos-1',
      action: 'sos',
      payload: {},
    };
    const res3 = coord.executeCommand(sosCmd);
    assert.equal(res3.run.incident?.status, 'alert');
    const sosEventsCount = res3.run.events.length;

    // Duplicate SOS command does not add duplicate event or incident
    const res4 = coord.executeCommand(sosCmd);
    assert.equal(res4.run.events.length, sosEventsCount);
  } finally {
    coord.stop();
  }
});

test('snapshot persistence and coordinator reload restore state', () => {
  const coord1 = new Coordinator(testDir);
  let runId = '';
  try {
    const { run } = coord1.joinRoom('sala-persist', '1234', 'owner', 'Alex');
    runId = run.id;
    coord1.executeCommand({
      roomId: 'sala-persist',
      runId,
      role: 'owner',
      participantId: 'alex',
      commandId: 'cmd-start',
      action: 'start',
      payload: { mode: 'sound', sound: true },
    });
  } finally {
    coord1.stop();
  }

  // Load in a fresh coordinator instance
  const coord2 = new Coordinator(testDir);
  try {
    const snap = coord2.getSnapshot('sala-persist');
    assert.equal(snap.run.journey, 'active');
    assert.equal(snap.run.mode, 'sound');
    assert.equal(snap.run.id, runId);
  } finally {
    coord2.stop();
  }
});

test('reset creates new execution, resets cursor and rejects old commands without affecting other room', () => {
  const coord = new Coordinator(testDir);
  try {
    const r1 = coord.joinRoom('sala-a', '1234', 'owner', 'Alex');
    const r2 = coord.joinRoom('sala-b', '1234', 'owner', 'Carlos');

    coord.executeCommand({
      roomId: 'sala-a',
      runId: r1.run.id,
      role: 'owner',
      participantId: 'alex',
      commandId: 'cmd-a-start',
      action: 'start',
      payload: {},
    });

    coord.executeCommand({
      roomId: 'sala-b',
      runId: r2.run.id,
      role: 'owner',
      participantId: 'carlos',
      commandId: 'cmd-b-start',
      action: 'start',
      payload: {},
    });

    // Reset sala-a
    const resetRes = coord.resetRoom('sala-a', true);
    assert.notEqual(resetRes.run.id, r1.run.id);
    assert.equal(resetRes.run.journey, 'idle');
    assert.equal(resetRes.cursor, 0);

    // Old command targeting old runId in sala-a must be rejected
    assert.throws(() => coord.executeCommand({
      roomId: 'sala-a',
      runId: r1.run.id,
      role: 'owner',
      participantId: 'alex',
      commandId: 'cmd-a-old',
      action: 'extend',
      payload: {},
    }), /Comando obsoleto/);

    // sala-b remains untouched and active!
    const snapB = coord.getSnapshot('sala-b');
    assert.equal(snapB.run.journey, 'active');
    assert.equal(snapB.run.id, r2.run.id);
  } finally {
    coord.stop();
  }
});

test('cursor and event replay fetch missing events for reconnecting client', () => {
  const coord = new Coordinator(testDir);
  try {
    const { run } = coord.joinRoom('sala-events', '1234', 'owner', 'Alex');
    coord.executeCommand({
      roomId: 'sala-events',
      runId: run.id,
      role: 'owner',
      participantId: 'alex',
      commandId: 'c1',
      action: 'start',
      payload: {},
    });
    coord.executeCommand({
      roomId: 'sala-events',
      runId: run.id,
      role: 'owner',
      participantId: 'alex',
      commandId: 'c2',
      action: 'extend',
      payload: {},
    });

    const snap = coord.getSnapshot('sala-events', 0);
    assert.ok(snap.eventsSince.length >= 2);
    assert.equal(snap.eventsSince[0].cursor, 1);
    assert.equal(snap.eventsSince[1].cursor, 2);

    // Replay since cursor 1 gives only events after 1
    const snapFrom1 = coord.getSnapshot('sala-events', 1);
    assert.equal(snapFrom1.eventsSince.length, snap.eventsSince.length - 1);
  } finally {
    coord.stop();
  }
});
