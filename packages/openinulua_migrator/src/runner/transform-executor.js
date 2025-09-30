'use strict';

const path = require('path');
const fs = require('fs');
const baseJscodeshift = require('jscodeshift');
const recast = require('recast');

function loadAllTransforms() {
  // In the prototype, load built-in transforms from ../transforms
  const base = path.resolve(__dirname, '..', '..', 'transforms');
  const exists = fs.existsSync(base) && fs.statSync(base).isDirectory();
  if (!exists) return [];
  const files = fs
    .readdirSync(base, { withFileTypes: true })
    .flatMap((d) => {
      if (d.isDirectory()) {
        const dir = path.join(base, d.name);
        return fs
          .readdirSync(dir)
          .filter((f) => f.endsWith('.js'))
          .map((f) => path.join(dir, f));
      }
      if (d.isFile() && d.name.endsWith('.js')) return [path.join(base, d.name)];
      return [];
    });
  return files.map((p) => ({ id: inferRuleId(base, p), path: p }));
}

function inferRuleId(base, absPath) {
  const rel = path.relative(base, absPath).replace(/\\/g, '/');
  return rel.replace(/\.js$/, '');
}

function requireTransformModule(absPath) {
  // Clear from cache to allow re-run in tests
  delete require.cache[require.resolve(absPath)];
  const mod = require(absPath);
  return mod && mod.default ? mod.default : mod;
}

async function runJscodeshiftTransforms({ filePath, source, onlyRules, parser = 'auto', verbose }) {
  let current = source;
  const appliedRules = [];
  const warnings = [];

  const all = loadAllTransforms();
  let selected;
  if (onlyRules && onlyRules.length > 0) {
    const byId = new Map(all.map((t) => [t.id, t]));
    selected = onlyRules.map((id) => byId.get(id)).filter(Boolean);
  } else {
    selected = all;
  }

  // Enforce a stable transform order to satisfy cross-rule expectations.
  // Notably, run state transforms before event transforms so event can normalize ++.
  function weightForId(id) {
    if (!id) return 500;
    if (id === 'core/state' || id === 'state/useState') return 100;
    if (id === 'core/event') return 200;
    if (id === 'core/useEffect' || id === 'watch/useEffect') return 300;
    if (id === 'core/dynamic') return 350;
    if (id === 'computed/useMemo' || id === 'core/useMemo') return 400;
    if (id === 'core/context') return 450;
    if (id === 'core/imports') return 900;
    return 500;
  }
  selected = selected.slice().sort((a, b) => weightForId(a.id) - weightForId(b.id));

  for (const t of selected) {
    const transformer = requireTransformModule(t.path);
    if (typeof transformer !== 'function') continue;

    const fileInfo = { path: filePath, source: current }; // standard jscodeshift FileInfo
    // Determine parser per file
    let parserChoice = 'babel';
    if (parser && parser !== 'auto') {
      if (parser === 'ts' || parser === 'tsx' || parser === 'babel') parserChoice = parser;
    } else {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.ts') parserChoice = 'ts';
      else if (ext === '.tsx') parserChoice = 'tsx';
      else parserChoice = 'babel';
    }
    const j = baseJscodeshift.withParser(parserChoice);
    const api = {
      jscodeshift: j,
      j,
      stats: () => {},
      report: (msg) => warnings.push({ code: t.id.toUpperCase(), message: String(msg) }),
      // expose recast for printing options if needed by transforms
      recast,
    };
    const options = {};

    const before = current;
    let after = before;
    try {
      after = transformer(fileInfo, api, options);
      if (typeof after !== 'string') {
        after = String(after || before);
      }
    } catch (e) {
      throw new Error(`Transform ${t.id} failed: ${e && e.message ? e.message : e}`);
    }

    if (after !== before) {
      appliedRules.push({ id: t.id, count: 1 });
      current = after;
      if (verbose) {
        // no-op, could log per-rule info here
      }
    }
  }

  return { source: current, appliedRules, warnings };
}

module.exports = { runJscodeshiftTransforms };

