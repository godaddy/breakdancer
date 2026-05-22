import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

/**
 * These tests run against the BUILT artifacts in `dist/` (not `src/`).
 *
 * The goal is to verify that the build pipeline preserves `Breakdancer`
 * as a real ES class constructor, so that bundlers and consumers that
 * perform class-detection (e.g. `Function.prototype.toString` heuristics,
 * `new.target` checks, or "must be called with new" errors) identify it
 * correctly. If a build step ever transpiled the class down to a plain
 * ES5 function or wrapped it in a factory, these assertions would fail.
 */

const distEsm = resolve(__dirname, '../dist/index.mjs');
const distCjs = resolve(__dirname, '../dist/index.cjs');

beforeAll(() => {
  if (!existsSync(distEsm) || !existsSync(distCjs)) {
    throw new Error(
      'dist/ artifacts are missing. Run `npm run build` before running these tests.'
    );
  }
});

/**
 * Shared assertions that anything claiming to be `Breakdancer` is a real
 * ES class constructor.
 */
function assertIsClassConstructor(Ctor: unknown, label: string): void {
  // 1. It's callable.
  expect(typeof Ctor, `${label}: typeof should be 'function'`).toBe('function');

  const Fn = Ctor as new (...args: unknown[]) => unknown;

  // 2. Its source representation starts with `class` -- the canonical
  //    heuristic bundlers and frameworks use to detect class constructors.
  const source = Function.prototype.toString.call(Fn);
  expect(source.startsWith('class'), `${label}: toString should start with 'class', got: ${source.slice(0, 40)}`).toBe(true);

  // 3. Calling without `new` throws a TypeError. Only real class
  //    constructors enforce this; a transpiled-to-ES5 function would
  //    silently accept being called as a function.
  expect(() => (Fn as unknown as (...args: unknown[]) => unknown)([]), `${label}: must throw when called without new`).toThrow(TypeError);

  // 4. The prototype's constructor points back at the class.
  expect(Fn.prototype.constructor, `${label}: prototype.constructor`).toBe(Fn);

  // 5. The `prototype` property is non-writable. This is true of class
  //    declarations but NOT of plain `function` declarations -- another
  //    distinguishing trait of real class constructors.
  const protoDescriptor = Object.getOwnPropertyDescriptor(Fn, 'prototype');
  expect(protoDescriptor, `${label}: prototype descriptor`).toBeDefined();
  expect(protoDescriptor!.writable, `${label}: prototype should be non-writable`).toBe(false);

  // 6. `new` actually produces an instance.
  const instance = new Fn([{ name: 'mobile', width: 400 }]);
  expect(instance instanceof Fn, `${label}: instanceof check`).toBe(true);
}

describe('built ESM bundle (dist/index.mjs)', () => {
  it('exports Breakdancer as a class constructor', async () => {
    const mod = await import(distEsm);
    assertIsClassConstructor(mod.Breakdancer, 'esm');
  });
});

describe('built CJS bundle (dist/index.cjs)', () => {
  it('exports Breakdancer as a class constructor', () => {
    const require = createRequire(import.meta.url);
    const mod = require(distCjs);
    assertIsClassConstructor(mod.Breakdancer, 'cjs');
  });
});
