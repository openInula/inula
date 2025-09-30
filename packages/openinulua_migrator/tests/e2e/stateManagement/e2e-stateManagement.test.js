import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import exec from '../../src/runner/transform-executor.js';

const { runJscodeshiftTransforms } = exec;

const FIXTURE_DIR = path.resolve(process.cwd(), 'tests/stateManagement');
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

function isReactSource(code) {
  return /from\s+['"]react['"]/i.test(code) || /useState\s*\(/.test(code);
}

describe('State Management fixtures (before -> after)', () => {
  const beforeFiles = fs.readdirSync(BEFORE_DIR).filter((f) => f.endsWith('.jsx'));

  for (const fileName of beforeFiles) {
    const beforePath = path.join(BEFORE_DIR, fileName);
    const afterPath = path.join(AFTER_DIR, fileName);
    if (!fs.existsSync(afterPath)) continue;

    it(`transforms ${fileName} to expected output`, async () => {
      const beforeCode = fs.readFileSync(beforePath, 'utf8');
      const afterCode = fs.readFileSync(afterPath, 'utf8');

      if (!isReactSource(beforeCode)) {
        // Unsupported direction for now; ensure we don't crash and remains stable
        const once = await transformSource(beforeCode, beforePath);
        expect(typeof once).toBe('string');
        return;
      }

      const once = await transformSource(beforeCode, beforePath);
      const formattedActual = format(once, beforePath);
      const formattedExpected = format(afterCode, afterPath);
      expect(formattedActual.trim()).toBe(formattedExpected.trim());
    });
  }
});

describe('Idempotency (after files)', () => {
  const afterFiles = fs.readdirSync(AFTER_DIR).filter((f) => f.endsWith('.jsx'));

  for (const fileName of afterFiles) {
    const afterPath = path.join(AFTER_DIR, fileName);

    it(`does not change ${fileName} when already migrated`, async () => {
      const afterCode = fs.readFileSync(afterPath, 'utf8');
      if (isReactSource(afterCode)) {
        // If fixture is React, skip because our tool migrates React -> OpenInula
        return;
      }
      const once = await transformSource(afterCode, afterPath);
      const formattedOriginal = format(afterCode, afterPath);
      const formattedOnce = format(once, afterPath);
      expect(formattedOnce.trim()).toBe(formattedOriginal.trim());
    });
  }
});

describe('Idempotency (double-run on before files)', () => {
  const beforeFiles = fs.readdirSync(BEFORE_DIR).filter((f) => f.endsWith('.jsx'));

  for (const fileName of beforeFiles) {
    const filePath = path.join(BEFORE_DIR, fileName);

    it(`second run produces no further changes for ${fileName}`, async () => {
      const src = fs.readFileSync(filePath, 'utf8');
      if (!isReactSource(src)) {
        // Unsupported direction for now
        return;
      }
      const once = await transformSource(src, filePath);
      const twice = await transformSource(once, filePath);
      const f1 = format(once, filePath);
      const f2 = format(twice, filePath);
      expect(f2.trim()).toBe(f1.trim());
    });
  }
});

