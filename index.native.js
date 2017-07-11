import Breakdancer from './';
import { Dimensions } from 'react-native';

export default class NativeDancer extends Breakdancer {
  /**
   * Return the current view port.
   *
   * @returns {Object} viewport
   * @public
   */
  viewport () {
    return Dimensions.get('window');
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
