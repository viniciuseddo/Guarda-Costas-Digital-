import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRun, command, advance } from '../shared/model.ts';
import { CAMPUS_ROUTE, DEMO_ZONES, MEDIA_CATALOG, SCENARIO_PRESETS } from '../shared/fixtures.ts';

const start = () => command(createRun('run-fixtures'), 'owner', 'start', { mode: 'discreet', sound: false });

test('fixtures campus route and demo zones exist and have valid coordinates', () => {
  assert.equal(CAMPUS_ROUTE.length, 4);
  assert.equal(CAMPUS_ROUTE[0].name, 'Biblioteca Central');
  assert.equal(CAMPUS_ROUTE[3].name, 'Portaria Principal (demo)');
  assert.equal(DEMO_ZONES.length, 2);
  for (const zone of DEMO_ZONES) {
    assert.ok(zone.polygon.length >= 3);
  }
});

test('media catalog assets exist on disk and audio duration matches metadata', () => {
  assert.equal(MEDIA_CATALOG.length, 5);
  for (const item of MEDIA_CATALOG) {
    const filePath = path.resolve('public', item.url.replace(/^\//, ''));
    assert.ok(fs.existsSync(filePath), `Asset ${item.url} deve existir no disco`);
    if (item.kind === 'audio') {
      const stats = fs.statSync(filePath);
      // WAV PCM 8000Hz 8-bit mono = 8000 bytes/sec + 44 bytes header. 12s = 96044 bytes
      const expectedBytes = 44 + (item.duration! * 8000);
      assert.equal(stats.size, expectedBytes);
    }
  }
});

test('each scenario preset transitions run to expected state without external services', () => {
  for (const preset of SCENARIO_PRESETS) {
    let run = start();
    run = command(run, 'owner', 'simulate', { scenario: preset.id });
    if (preset.id === 'impact' || preset.id === 'snatch' || preset.id === 'voice') {
      assert.equal(run.incident?.status, 'checking');
    } else if (preset.id === 'help') {
      assert.equal(run.incident?.status, 'alert');
    } else if (preset.id === 'battery') {
      assert.equal(run.battery, 5);
    } else if (preset.id === 'signal') {
      assert.equal(run.signal, false);
    } else if (preset.id === 'ai-offline') {
      assert.equal(run.aiAvailable, false);
    }
  }
});
