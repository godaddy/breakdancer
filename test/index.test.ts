import { describe, it, expect, beforeEach } from 'vitest';
import { Breakdancer } from '../src/index';

it('is exposed as a function', () => {
  expect(typeof Breakdancer).toBe('function');
});

describe('breakdancer', () => {
  let breakdancer: InstanceType<typeof Breakdancer>;
  const specification = [
    {
      name: 'mobile',
      width: 400,
      height: 600
    },
    {
      name: 'desktop',
      width: 1024
    },
    {
      name: 'whatever',
      width: 1409
    }
  ];

  beforeEach(() => {
    breakdancer = new Breakdancer(specification);
  });

  it('safely works without existing windows object', () => {
    breakdancer = new Breakdancer(specification, {});

    expect(breakdancer.height()).toBe(0);
    expect(breakdancer.width()).toBe(0);
  });

  describe('constructor', () => {
    it('stores the specification as arrays', () => {
      expect(Array.isArray(breakdancer.specification)).toBe(true);
      expect(breakdancer.specification[0].name).toBe('mobile');
    });

    it('sets the current breakpoint', () => {
      expect(typeof breakdancer.breakpoint).toBe('string');
      expect(['mobile', 'desktop', 'whatever', 'unknown']).toContain(breakdancer.breakpoint);
    });

    it('can be supplied with a custom window object', () => {
      const bd = new Breakdancer(specification, {
        innerHeight: 10,
        innerWidth: 10
      });

      expect(bd.breakpoint).toBe('mobile');
    });
  });

  describe('#height', () => {
    it('defaults to documentElement clientHeight on missing innerHeight', () => {
      const bd = new Breakdancer(specification, {
        document: {
          documentElement: {
            clientHeight: 1337,
            clientWidth: 1337
          }
        }
      });

      expect(bd.height()).toBe(1337);
    });

    it('defaults to innerHeight', () => {
      const bd = new Breakdancer(specification, {
        innerHeight: 10,
        innerWidth: 11,
        document: {
          documentElement: {
            clientHeight: 1337,
            clientWidth: 1338
          }
        }
      });

      expect(bd.height()).toBe(10);
    });
  });

  describe('#width', () => {
    it('defaults to documentElement clientWidth on missing innerWidth', () => {
      const bd = new Breakdancer(specification, {
        document: {
          documentElement: {
            clientHeight: 1337,
            clientWidth: 1338
          }
        }
      });

      expect(bd.width()).toBe(1338);
    });

    it('defaults to innerWidth', () => {
      const bd = new Breakdancer(specification, {
        innerHeight: 10,
        innerWidth: 11,
        document: {
          documentElement: {
            clientHeight: 1337,
            clientWidth: 1338
          }
        }
      });

      expect(bd.width()).toBe(11);
    });
  });

  describe('#changed', () => {
    it('returns a boolean if the breakpoint has changed', () => {
      expect(breakdancer.changed()).toBe(false);
      expect(breakdancer.changed()).toBe(false);
      expect(breakdancer.changed()).toBe(false);

      const viewport = { width: 200, height: 500 };

      expect(breakdancer.changed(viewport)).toBe(true);
    });

    it('updates the .breakpoint', () => {
      const viewport = { width: 200, height: 500 };

      expect(breakdancer.breakpoint).not.toBe('mobile');
      expect(breakdancer.changed(viewport)).toBe(true);
      expect(breakdancer.breakpoint).toBe('mobile');
    });
  });

  describe('#currently', () => {
    it('matches as desktop', () => {
      const viewport = { width: 800, height: 600 };

      expect(breakdancer.currently(viewport)).toBe('desktop');
    });

    it('matches as mobile', () => {
      const viewport = { width: 200, height: 500 };

      expect(breakdancer.currently(viewport)).toBe('mobile');
    });

    it('matches unknown', () => {
      const viewport = { width: 1800, height: 1600 };

      expect(breakdancer.currently(viewport)).toBe('unknown');
    });
  });

  describe('#viewport', () => {
    it('returns the width and height', () => {
      const viewport = breakdancer.viewport();

      expect(viewport.width).toBeGreaterThan(0);
      expect(viewport.width).toBe(breakdancer.width());

      expect(viewport.height).toBeGreaterThan(0);
      expect(viewport.height).toBe(breakdancer.height());
    });
  });

  describe('#compare', () => {
    const bd = new Breakdancer(specification, {
      innerWidth: 1234,
      innerHeight: 1000,
      document: {
        documentElement: {
          clientHeight: 1337,
          clientWidth: 1338
        }
      }
    });

    it('should return a TypeError when looking at an unspecified breakpoint', () => {
      expect(bd.compare('hologram', 'width')).toBeInstanceOf(TypeError);
    });

    it('should return a TypeError when the given dimension does not exist for the given breakpoint', () => {
      expect(bd.compare('whatever', 'height')).toBeInstanceOf(TypeError);
    });

    it('should return the difference in width between the current and specified breakpoint', () => {
      expect(bd.compare('mobile', 'width')).toBe(1234 - 400);
      expect(bd.compare('mobile', 'height')).toBe(1000 - 600);
    });

    it('treats 0 as a valid breakpoint dimension (not "missing")', () => {
      const zeroBd = new Breakdancer(
        [{ name: 'origin', width: 0, height: 0 }],
        { innerWidth: 1234, innerHeight: 1000 }
      );

      expect(zeroBd.compare('origin', 'width')).toBe(1234);
      expect(zeroBd.compare('origin', 'height')).toBe(1000);
    });
  });
});
