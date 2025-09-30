import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import exec from '../../../src/runner/transform-executor.js';

const { runJscodeshiftTransforms } = exec;

const FIXTURE_DIR = path.resolve(process.cwd(), 'tests/list');
const BEFORE_DIR = path.join(FIXTURE_DIR, 'before');
const AFTER_DIR = path.join(FIXTURE_DIR, 'after');

function format(code, filePath) {
  try {
    const config = prettier.resolveConfig.sync(filePath) || {};
    return prettier.format(code, { ...config, filepath: filePath });
  } catch {
    return code;
  }
}

async function transformSource(source, filePath) {
  const res = await runJscodeshiftTransforms({ filePath, source });
  return res.source;
}

describe('List fixtures (before -> after)', () => {
  const beforeFiles = fs.existsSync(BEFORE_DIR) ? fs.readdirSync(BEFORE_DIR).filter((f) => f.endsWith('.jsx')) : [];

  for (const fileName of beforeFiles) {
    const beforePath = path.join(BEFORE_DIR, fileName);
    const afterPath = path.join(AFTER_DIR, fileName);
    if (!fs.existsSync(afterPath)) continue;

    it(`transforms ${fileName} to expected output`, async () => {
      const beforeCode = fs.readFileSync(beforePath, 'utf8');
      const afterCode = fs.readFileSync(afterPath, 'utf8');
      const once = await transformSource(beforeCode, beforePath);
      const formattedActual = format(once, beforePath);
      const formattedExpected = format(afterCode, afterPath);
      expect(formattedActual.trim()).toBe(formattedExpected.trim());
    });
  }
});

describe('Idempotency (after files)', () => {
  const afterFiles = fs.existsSync(AFTER_DIR) ? fs.readdirSync(AFTER_DIR).filter((f) => f.endsWith('.jsx')) : [];
  for (const fileName of afterFiles) {
    const afterPath = path.join(AFTER_DIR, fileName);
    it(`does not change ${fileName} when already migrated`, async () => {
      const afterCode = fs.readFileSync(afterPath, 'utf8');
      const once = await transformSource(afterCode, afterPath);
      expect(format(once, afterPath).trim()).toBe(format(afterCode, afterPath).trim());
    });
  }
});
