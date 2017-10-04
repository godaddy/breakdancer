/**
 * Breakdancer is a simple breakpoint utility.
 *
 * @constructor
 * @param {Object} specification Different breakpoints we need to know.
 * @public
 */
export default class Breakdancer {
  constructor(specification) {
    //
    // Setup our default values after the window has been set so we don't have
    // any undefined references.
    //
    this.specification = this.normalize(specification);
  }

  /**
   * Normalize the specification.
   *
   * @param {Array|Object} specification Different breakpoints we need to know.
   * @returns {Array} List of media query specifications
   * @private
   */
  normalize(specification) {
    if (Array.isArray(specification)) return specification;

    return Object.keys(specification).reduce(function reduce(memo, key) {
      var breakpoint = specification[key];

      //
      // If there is no name specified, use the key as name.
      //
      breakpoint.name = breakpoint.name || key;
      memo.push(breakpoint);
      return memo;
    }, []);
  }

  /**
   * Check if the setup has changed since we've last checked the real estate.
   *
   * @param {Object} viewport The view port specification.
   * @returns {Boolean} True if the breakpoint for the viewport has changed.
   * @public
   */
  changed(viewport) {
    var breakpoint = this.breakpoint;
    this.breakpoint = this.currently(viewport);

    return this.breakpoint !== breakpoint;
  }

  /**
   * Check if a given specification matches our current set resolution.
   *
   * @param {Object} viewport The view port specification.
   * @param {Object} specification The supplied specification.
   * @returns {Boolean} True if viewport fits into the specification.
   * @private
   */
  matches(viewport, specification) {
    viewport = viewport || this.viewport();

    let matched = false;

    if ('height' in specification) {
      matched = viewport.height < specification.height;

      if (!matched) return matched;
    }

    if ('width' in specification) {
      matched = viewport.width < specification.width;
    }

    return matched;
  }

  /**
   * Find out which breakpoint we're currently triggering.
   *
   * @param {Object} viewport The view port specification.
   * @returns {String} The current breakpoint that we got triggered.
   * @public
   */
  currently(viewport) {
    viewport = viewport || this.viewport();

    for (var i = 0, l = this.specification.length; i < l; i++) {
      var spec = this.specification[i];

      if (this.matches(viewport, spec)) return spec.name;
    }

    return 'unknown';
  }

  /**
   * Returns the difference between the current width and the given breakpoint. This
   * can be used to check if the window is "greater" than a breakpoint. If either the
   * given breakpoint or the given attribute do not exist, a `TypeError` will be thrown.
   *
   *
   * @param {String} breakpoint to be compared
   * @param {String} property height or width
   * @throws {TypeError} If not given breakpoint and property do not exist within the given spec
   * @returns {Number} different between current and specified properties
   * @public
   */
  compare(breakpoint, property) {
    const desiredSpec = this.specification.filter(spec => spec.name === breakpoint)[0];

    if (!desiredSpec) {
      return new TypeError(`${breakpoint} is not part of the given specifications`);
    }

    if (!desiredSpec[property]) {
      return new TypeError(`${breakpoint}.${property} is not part of the given specifications`);
    }

    return this[property]() - desiredSpec[property];
  }
}
