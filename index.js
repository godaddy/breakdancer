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
}
