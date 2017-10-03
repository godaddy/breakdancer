import Breakdancer from './breakdancer';
import { Dimensions } from 'react-native';

/**
 * Breakdancer is a simple breakpoint utility.
 *
 * @constructor
 * @param {Object} specification Different breakpoints we need to know.
 * @public
 */
export default class NativeDancer extends Breakdancer {
  constructor(specification) {
    super(specification);

    this.breakpoint = this.currently();
  }

  /**
   * Return the current view port.
   *
   * @returns {Object} viewport
   * @public
   */
  viewport() {
    return Dimensions.get('window');
  }

  /**
   * Lookup the view port width.
   *
   * @returns {Number} Current width.
   * @public
   */
  width() {
    return Dimensions.get('window').width;
  }

  /**
   * Lookup the view port height.
   *
   * @returns {Number} Current height.
   * @public
   */
  height() {
    return Dimensions.get('window').height;
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
    const desiredSpec = this.specification.filter(spec => spec.name === breakpoint)[0];

    if (!desiredSpec) {
      return new TypeError(`${breakpoint} is not part of the given specifications`);
    }

    if (!desiredSpec[property]) {
      return this[property]();
    }

    return this[property]() - desiredSpec[property];
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
