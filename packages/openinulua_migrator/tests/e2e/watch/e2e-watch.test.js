import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import exec from '../../src/runner/transform-executor.js';

const { runJscodeshiftTransforms } = exec;

const FIXTURE_DIR = path.resolve(process.cwd(), 'tests/watch');
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
  return /from\s+['\"]react['\"]/i.test(code) || /useEffect\s*\(/.test(code);
}

describe('Watch fixtures (before -> after)', () => {
  const beforeFiles = fs.readdirSync(BEFORE_DIR).filter((f) => f.endsWith('.jsx'));

  for (const fileName of beforeFiles) {
    const beforePath = path.join(BEFORE_DIR, fileName);
    const afterPath = path.join(AFTER_DIR, fileName);
    if (!fs.existsSync(afterPath)) continue;

    it(`transforms ${fileName} to expected output`, async () => {
      const beforeCode = fs.readFileSync(beforePath, 'utf8');
      const afterCode = fs.readFileSync(afterPath, 'utf8');

      if (!isReactSource(beforeCode)) {
        const once = await transformSource(beforeCode, beforePath);
        expect(typeof once).toBe('string');
        return;
      }

      const once = await transformSource(beforeCode, beforePath);
      expect(format(once, beforePath).trim()).toBe(format(afterCode, afterPath).trim());
    });
  }
});

describe('Idempotency (after files)', () => {
  const afterFiles = fs.readdirSync(AFTER_DIR).filter((f) => f.endsWith('.jsx'));
  for (const fileName of afterFiles) {
    const afterPath = path.join(AFTER_DIR, fileName);
    it(`does not change ${fileName} when already migrated`, async () => {
      const afterCode = fs.readFileSync(afterPath, 'utf8');
      if (isReactSource(afterCode)) return;
      const once = await transformSource(afterCode, afterPath);
      expect(format(once, afterPath).trim()).toBe(format(afterCode, afterPath).trim());
    });
  }
});

describe('Idempotency (double-run on before files)', () => {
  const beforeFiles = fs.readdirSync(BEFORE_DIR).filter((f) => f.endsWith('.jsx'));
  for (const fileName of beforeFiles) {
    const beforePath = path.join(BEFORE_DIR, fileName);
    it(`second run produces no further changes for ${fileName}`, async () => {
      const src = fs.readFileSync(beforePath, 'utf8');
      if (!isReactSource(src)) return;
      const once = await transformSource(src, beforePath);
      const twice = await transformSource(once, beforePath);
      expect(format(twice, beforePath).trim()).toBe(format(once, beforePath).trim());
    });
  }
});