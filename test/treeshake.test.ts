import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build as esbuild } from 'esbuild';
import { rollup } from 'rollup';
import { existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { tmpdir } from 'node:os';

/**
 * Tree-shakability tests.
 *
 * We bundle the package the way a real consumer would (esbuild + rollup,
 * with node resolution so each bundler reads our package.json#sideEffects)
 * and assert that:
 *
 *   1. When `Breakdancer` is imported but never used, the class body is
 *      dropped from the output (true tree-shaking).
 *   2. When `Breakdancer` is imported AND used, it survives the bundle
 *      (sanity check -- guards against false-positive #1 from a broken
 *      test setup that drops everything).
 *
 * If either bundler fails to drop the unused import, this package is not
 * tree-shakable from that bundler's perspective. Likely culprits:
 *   - missing `"sideEffects": false` in package.json
 *   - top-level statements in dist that the bundler can't prove are pure
 *     (in which case `sideEffects: false` is the override that tells the
 *     bundler to trust us)
 */

const __dirname = dirname(fileURLToPath(import.meta.url));

const distEsm = resolve(__dirname, '../dist/index.mjs');
const pkgRoot = resolve(__dirname, '..');

let tmpDir: string;
let unusedEntry: string;
let usedEntry: string;

beforeAll(() => {
  if (!existsSync(distEsm)) {
    throw new Error('dist/index.mjs missing. Run `npm run build` first.');
  }

  // Build virtual entry files that import the package by absolute path.
  // This sidesteps node_modules setup while still letting each bundler
  // walk up from `dist/index.mjs` to read `package.json#sideEffects`.
  tmpDir = mkdtempSync(join(tmpdir(), 'breakdancer-treeshake-'));

  unusedEntry = join(tmpDir, 'unused.mjs');
  writeFileSync(
    unusedEntry,
    // Import the symbol but never reference it. A tree-shaking bundler
    // honoring sideEffects:false MUST drop this entirely.
    `import { Breakdancer } from ${JSON.stringify(distEsm)};\nexport {};\n`
  );

  usedEntry = join(tmpDir, 'used.mjs');
  writeFileSync(
    usedEntry,
    // Actually instantiate so the bundler is forced to retain it.
    `import { Breakdancer } from ${JSON.stringify(distEsm)};\nglobalThis.__bd = new Breakdancer([{ name: 'm', width: 1 }]);\n`
  );
});

/**
 * Bundle with esbuild and return the output as a string.
 */
async function bundleWithEsbuild(entry: string): Promise<string> {
  const result = await esbuild({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    write: false,
    minify: false, // keep identifiers so we can grep for `Breakdancer`
    treeShaking: true,
    platform: 'neutral',
    mainFields: ['module', 'main'],
    absWorkingDir: pkgRoot,
    logLevel: 'silent',
    // Externalize propget so we're only measuring breakdancer's contribution.
    external: ['propget'],
  });
  return result.outputFiles[0].text;
}

/**
 * Bundle with rollup and return the output as a string.
 */
async function bundleWithRollup(entry: string): Promise<string> {
  const bundle = await rollup({
    input: entry,
    external: ['propget'],
    onwarn: () => {}, // silence unresolved-import warnings for `propget`
    treeshake: {
      // moduleSideEffects: 'no-external' would also work; the default
      // already honors package.json#sideEffects, which is what we want
      // to verify.
      moduleSideEffects: true,
    },
  });
  const { output } = await bundle.generate({ format: 'esm' });
  await bundle.close();
  return output.map(chunk => (chunk.type === 'chunk' ? chunk.code : '')).join('\n');
}

/**
 * The class body contains uniquely identifying tokens. We assert on the
 * presence/absence of the class declaration itself (`class Breakdancer`
 * or `Breakdancer = class`) plus a method name that only this class has
 * (`compare`) to avoid being fooled by an incidental identifier.
 */
function containsBreakdancerClassBody(code: string): boolean {
  // The class might be retained as either `class Breakdancer` or
  // `Breakdancer = class` depending on bundler renaming.
  const hasClass = /\bclass\s+Breakdancer\b/.test(code) || /\bBreakdancer\s*=\s*class\b/.test(code);
  // Method unique enough that it almost certainly only comes from us.
  const hasUniqueMethod = /\bcompare\s*\(/.test(code) && /\bnormalize\s*\(/.test(code);
  return hasClass && hasUniqueMethod;
}

describe('tree-shaking — esbuild', () => {
  it('drops Breakdancer when imported but unused', async () => {
    const code = await bundleWithEsbuild(unusedEntry);
    expect(containsBreakdancerClassBody(code)).toBe(false);
  });

  it('retains Breakdancer when actually used (sanity check)', async () => {
    const code = await bundleWithEsbuild(usedEntry);
    expect(containsBreakdancerClassBody(code)).toBe(true);
  });
});

describe('tree-shaking — rollup', () => {
  it('drops Breakdancer when imported but unused', async () => {
    const code = await bundleWithRollup(unusedEntry);
    expect(containsBreakdancerClassBody(code)).toBe(false);
  });

  it('retains Breakdancer when actually used (sanity check)', async () => {
    const code = await bundleWithRollup(usedEntry);
    expect(containsBreakdancerClassBody(code)).toBe(true);
  });
});

// Cleanup the temp directory after all tests in this file have run.
afterAll(() => {
  try {
    rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
});
