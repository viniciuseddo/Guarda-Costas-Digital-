import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, command, advance } from '../shared/model.ts';

const start = () => command(createRun('run-1'), 'owner', 'start', { mode: 'discreet', sound: false });

test('start creates a running demo without real sensors', () => {
  const run = start();
  assert.equal(run.journey, 'active');
  assert.equal(run.paused, false);
  assert.equal(run.source, 'mock');
});

test('suspect can be resolved without ending the journey', () => {
  let run = command(start(), 'owner', 'simulate', { scenario: 'impact' });
  assert.equal(run.incident?.status, 'checking');
  run = command(run, 'owner', 'safe', {});
  assert.equal(run.incident?.status, 'resolved');
  assert.equal(run.journey, 'active');
});

test('suspect escalates after its deadline and SOS is immediate', () => {
  const run = command(start(), 'owner', 'simulate', { scenario: 'impact' });
  assert.equal(advance(run, 10).incident?.status, 'alert');
  assert.equal(command(run, 'owner', 'sos', {}).incident?.status, 'alert');
});

test('family acknowledgement is not arrival', () => {
  const run = command(command(start(), 'owner', 'sos', {}), 'family', 'ack', {});
  assert.equal(run.incident?.acknowledged, true);
  assert.equal(run.journey, 'active');
  assert.throws(() => command(run, 'family', 'arrive', {}), /permissão/);
});

test('arrival resolves but preserves incident history', () => {
  const run = command(command(start(), 'owner', 'sos', {}), 'owner', 'arrive', {});
  assert.equal(run.journey, 'arrived');
  assert.equal(run.incident?.status, 'resolved');
  assert.ok(run.events.some(event => event.kind === 'alert'));
});

test('critical battery and lost signal do not cancel remote deadline', () => {
  let run = command(start(), 'owner', 'simulate', { scenario: 'battery' });
  run = command(run, 'owner', 'simulate', { scenario: 'signal' });
  const x = run.position.x;
  run = advance(run, 120);
  assert.equal(run.battery, 5);
  assert.equal(run.position.x, x);
  assert.equal(run.incident?.status, 'alert');
  assert.equal(run.journey, 'active');
});

test('pause freezes virtual time and manual stepping is explicit', () => {
  const run = command(start(), 'owner', 'pause', {});
  assert.equal(advance(run, 10).elapsed, 0);
  assert.equal(command(run, 'owner', 'step', { seconds: 5 }).elapsed, 5);
});

test('correlated signals produce one incident', () => {
  let run = command(start(), 'owner', 'simulate', { scenario: 'impact' });
  const id = run.incident!.id;
  run = command(run, 'owner', 'simulate', { scenario: 'voice' });
  assert.equal(run.incident?.id, id);
  assert.equal(run.incident?.sources.length, 2);
});

test('audio failure and rejected instruction do not block SOS', () => {
  let run = command(start(), 'owner', 'simulate', { scenario: 'ai-offline' });
  run = command(run, 'owner', 'simulate', { scenario: 'injection' });
  assert.equal(run.journey, 'active');
  assert.equal(run.aiAvailable, false);
  assert.equal(command(run, 'owner', 'sos', {}).incident?.status, 'alert');
});

test('media progresses and retry preserves its identifier', () => {
  let run = command(start(), 'owner', 'sos', {});
  run = advance(run, 10);
  const item = run.incident!.evidence[0];
  assert.equal(item.status, 'available');
  run = command(run, 'owner', 'media-fail', { id: item.id });
  assert.equal(run.incident!.evidence[0].status, 'failed');
  run = command(run, 'family', 'media-retry', { id: item.id });
  run = advance(run, 3);
  assert.equal(run.incident!.evidence[0].id, item.id);
  assert.equal(run.incident!.evidence[0].status, 'available');
});

test('police flow is only fictional and only a family action', () => {
  let run = advance(command(start(), 'owner', 'sos', {}), 10);
  assert.throws(() => command(run, 'owner', 'police-start', { selected: [] }), /permissão/);
  run = command(run, 'family', 'police-start', { selected: [run.incident!.evidence[0].id] });
  assert.match(run.police.reference, /^DEMO-/);
  assert.equal(run.police.status, 'calling');
  run = advance(run, 8);
  assert.equal(run.police.status, 'received');
  assert.equal(run.journey, 'active');
  assert.equal(run.incident?.acknowledged, false);
});

test('police cancel and retry keep the same fictional reference', () => {
  let run = command(command(start(), 'owner', 'sos', {}), 'family', 'police-start', { selected: [] });
  const reference = run.police.reference;
  run = command(run, 'family', 'police-fail', {});
  assert.equal(run.police.status, 'failed');
  run = command(run, 'family', 'police-retry', {});
  assert.equal(run.police.reference, reference);
  run = command(run, 'family', 'police-cancel', {});
  assert.equal(run.police.status, 'cancelled');
  assert.equal(run.incident?.status, 'alert');
});

test('late commands cannot reopen a completed journey', () => {
  const run = command(start(), 'owner', 'arrive', {});
  assert.throws(() => command(run, 'owner', 'simulate', { scenario: 'impact' }), /trajeto ativo/);
});

test('extension changes the safety deadline, not just the displayed ETA', () => {
  const run = command(start(), 'owner', 'extend', {});
  assert.equal(run.deadline, 140);
  assert.equal(advance(run, 125).incident, null);
});

test('invalid input is rejected without changing source state', () => {
  const run = start();
  assert.throws(() => command(run, 'owner', 'step', { seconds: Number.NaN }), /inválido/);
  assert.throws(() => command(run, 'family', 'simulate', { scenario: 'impact' }), /permissão/);
  assert.equal(run.incident, null);
});
