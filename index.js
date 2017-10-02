import Breakdancer from './breakdancer';
import get from 'propget';

/**
 * Small fallback for when the `window` global is not accessible in a given
 * environment. This allows the module to still be used in a regular `node`
 * environment.
 *
 * @type {Object} Window reference or inner{height|width} polyfill.
 * @private
 */
const win = typeof window !== 'undefined' ? window : {
  innerWidth: 1280,
  innerHeight: 768
};

/**
 * Breakdancer is a simple breakpoint utility.
 *
 * @constructor
 * @param {Object} specification Different breakpoints we need to know.
 * @param {Object} windows Option window object reference.
 * @public
 */
export default class WebDancer extends Breakdancer {
  constructor(specification, windows) {
    super(specification);

    this.window = windows || win;
    this.breakpoint = this.currently();
  }

  /**
   * Return the current view port.
   *
   * @returns {Object} viewport
   * @public
   */
  viewport() {
    return {
      height: this.height(),
      width: this.width()
    };
  }

  /**
   * Lookup the view port width.
   *
   * @returns {Number} Current width.
   * @public
   */
  width() {
    return get(this.window, 'innerWidth')
    || get(this.window, 'document.documentElement.clientWidth')
    || get(this.window, 'document.body.clientWidth')
    || 0;
  }

  /**
   * Lookup the view port height.
   *
   * @returns {Number} Current height.
   * @public
   */
  height() {
    return get(this.window, 'innerHeight')
    || get(this.window, 'document.documentElement.clientHeight')
    || get(this.window, 'document.body.clientHeight')
    || 0;
  }

  /**
   * Compare current and specified properties of given breakpoint
   *
   * @param {String} breakpoint to be compared
   * @param {String} property height or width
   * @returns {Number} different between current and specified properties
   * @private
   */
  compare(breakpoint, property) {
    if (!this.specification[breakpoint]) {
      return new TypeError(`${breakpoint} is not part of the given specifications`);
    }

    if (!this.specifications[breakpoint][property]) {
      return this[property]();
    }

    return this[property]() - this.specifications[breakpoint][property];
  }

  /**
   * Returns the difference between the current width and the given breakpoint.
   * This can be used to check if the window is "greater" than a breakpoint.
   * If the given breakpoint does not have a width, this will always
   * return the current width. If the given breakpoint does not exist, than
   *
   * @param {String} breakpoint to be compared
   * @returns {Integer} difference between given breakpoint and current one
   * @public
   */
  compareWidth(breakpoint) {
    return this.compare(breakpoint, 'width');
  }

  /**
    * Returns the difference between the current Height and the given breakpoint.
    * This can be used to check if the window is "greater" than a breakpoint.
    * If the given breakpoint does not have a Height, this will always
    * return the current width.
    *
    * @param {String} breakpoint to be compared
    * @returns {Integer} difference between given breakpoint and current one
    * @public
    */
  compareHeight(breakpoint) {
    return this.compare(breakpoint, 'height');
  }
}
