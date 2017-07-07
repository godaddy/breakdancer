import { Dimensions } from 'react-native';

export default class Breakdancer {
  constructor(specification) {
    //
    // what if specification is null
    //
    this.specification = this.normalize(specification)
    this.breakpoint = this.currently();
  }

  /**
   * Normalize the specification.
   *
   * @param {Array|Object} specification Different breakpoints we need to know.
   * @returns {Array} List of media query specifications
   * @private
   */
  normalize (specification) {
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
  changed (viewport) {
    var breakpoint = this.breakpoint;
    this.breakpoint = this.currently(viewport);

    return this.breakpoint !== breakpoint;
  }

  /**
   * Return the current view port.
   *
   * @returns {Object} viewport
   * @public
   */
  viewport () {
    return {
      height: this.height(),
      width: this.width()
    };
  }

  /**
   * Check if a given specification matches our current set resolution.
   *
   * @param {Object} viewport The view port specification.
   * @param {Object} specification The supplied specification.
   * @returns {Boolean} True if viewport fits into the specification.
   * @private
   */
  matches (viewport, specification) {
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
  currently (viewport) {
    viewport = viewport || this.viewport();

    for (var i = 0, l = this.specification.length; i < l; i++) {
      var spec = this.specification[i];

      if (this.matches(viewport, spec)) return spec.name;
    }

    return 'unknown';
  }

  /**
   * Lookup the view port width.
   *
   * @returns {Number} Current width.
   * @public
   */
  width () {
    return Dimensions.get('window').width;
  }

  /**
   * Lookup the view port height.
   *
   * @returns {Number} Current height.
   * @public
   */
  height () {
    return Dimensions.get('window').height;
  }
}
