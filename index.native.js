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
}
