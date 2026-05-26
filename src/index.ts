import get from 'propget';

export interface BreakpointSpec {
  name: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

export interface Viewport {
  width: number;
  height: number;
}

/**
 * Small fallback for when the `window` global is not accessible in a given
 * environment. This allows the module to still be used in a regular `node`
 * environment.
 */
const win = typeof window !== 'undefined' ? window : {
  innerWidth: 1280,
  innerHeight: 768
};

/**
 * Breakdancer is a simple breakpoint utility.
 *
 * @param specification - Different breakpoints we need to know.
 * @param windows - Optional window object reference.
 */
export class Breakdancer {
  specification: BreakpointSpec[];
  breakpoint: string;
  window: Record<string, unknown>;

  constructor(specification: BreakpointSpec[] | Record<string, Omit<BreakpointSpec, 'name'> & { name?: string }>, windows?: Record<string, unknown>) {
    this.window = (windows || win) as Record<string, unknown>;
    this.specification = this.normalize(specification);
    this.breakpoint = this.currently();
  }

  /**
   * Normalize the specification.
   *
   * @param specification - Different breakpoints we need to know.
   * @returns List of media query specifications
   */
  normalize(specification: BreakpointSpec[] | Record<string, Omit<BreakpointSpec, 'name'> & { name?: string }>): BreakpointSpec[] {
    if (Array.isArray(specification)) return specification;

    return Object.keys(specification).reduce(function reduce(memo: BreakpointSpec[], key: string) {
      const breakpoint = specification[key];

      //
      // If there is no name specified, use the key as name.
      //
      const named: BreakpointSpec = {
        ...breakpoint,
        name: breakpoint.name || key
      };
      memo.push(named);
      return memo;
    }, []);
  }

  /**
   * Check if the setup has changed since we've last checked the real estate.
   *
   * @param viewport - The view port specification.
   * @returns True if the breakpoint for the viewport has changed.
   */
  changed(viewport?: Viewport): boolean {
    const breakpoint = this.breakpoint;
    this.breakpoint = this.currently(viewport);

    return this.breakpoint !== breakpoint;
  }

  /**
   * Check if a given specification matches our current set resolution.
   *
   * @param viewport - The view port specification.
   * @param specification - The supplied specification.
   * @returns True if viewport fits into the specification.
   */
  matches(viewport: Viewport | undefined, specification: BreakpointSpec): boolean {
    viewport = viewport || this.viewport();

    let matched = false;

    if ('height' in specification && specification.height !== undefined) {
      matched = viewport.height < specification.height;

      if (!matched) return matched;
    }

    if ('width' in specification && specification.width !== undefined) {
      matched = viewport.width < specification.width;
    }

    return matched;
  }

  /**
   * Find out which breakpoint we're currently triggering.
   *
   * @param viewport - The view port specification.
   * @returns The current breakpoint that we got triggered.
   */
  currently(viewport?: Viewport): string {
    viewport = viewport || this.viewport();

    for (let i = 0, l = this.specification.length; i < l; i++) {
      const spec = this.specification[i];

      if (this.matches(viewport, spec)) return spec.name;
    }

    return 'unknown';
  }

  /**
   * Returns the difference between the current width and the given breakpoint.
   * This can be used to check if the window is "greater" than a breakpoint.
   * If either the given breakpoint or the given attribute do not exist, a
   * `TypeError` is returned (not thrown) so callers can branch on the result
   * without a try/catch.
   *
   * @param breakpoint - Breakpoint name to be compared
   * @param property - 'height' or 'width'
   * @returns Difference between current and specified properties, or a
   *   `TypeError` instance when the breakpoint/property is not part of the
   *   given specification.
   */
  compare(breakpoint: string, property: 'width' | 'height'): number | TypeError {
    const desiredSpec = this.specification.filter(spec => spec.name === breakpoint)[0];

    if (!desiredSpec) {
      return new TypeError(`${breakpoint} is not part of the given specifications`);
    }

    // Use explicit `typeof` check so a legitimate `0` value isn't treated as
    // missing (truthiness would reject it).
    if (typeof desiredSpec[property] !== 'number') {
      return new TypeError(`${breakpoint}.${property} is not part of the given specifications`);
    }

    return this[property]() - (desiredSpec[property] as number);
  }

  /**
   * Return the current view port.
   *
   * @returns viewport
   */
  viewport(): Viewport {
    return {
      height: this.height(),
      width: this.width()
    };
  }

  /**
   * Lookup the view port width.
   *
   * @returns Current width.
   */
  width(): number {
    return (get(this.window, 'innerWidth')
    || get(this.window, 'document.documentElement.clientWidth')
    || get(this.window, 'document.body.clientWidth')
    || 0) as number;
  }

  /**
   * Lookup the view port height.
   *
   * @returns Current height.
   */
  height(): number {
    return (get(this.window, 'innerHeight')
    || get(this.window, 'document.documentElement.clientHeight')
    || get(this.window, 'document.body.clientHeight')
    || 0) as number;
  }
}
