import NativeDancer from './index.native';
import assume from 'assume';
import { Dimensions } from 'react-native';

it('is exposed as a function', function () {
  assume(NativeDancer).is.a('function');
});

describe('nativeDancer', function () {
  let nativeDancer;
  const specification = [
    {
      name: 'mobile',
      width: 400,
      height: 600
    },

    {
      name: 'tablet',
      width: 1024
    },

    {
      name: 'whatever',
      width: 1409
    }
  ];

  beforeEach(function () {
    nativeDancer = new NativeDancer(specification);
  });

  describe('constructor', function () {
    it('stores the specification as arrays', function () {
      assume(nativeDancer.specification).is.a('array');
      assume(nativeDancer.specification[0].name).equals('mobile');
    });

    it('sets the current breakpoint', function () {
      assume(nativeDancer.breakpoint).is.a('string');
      assume(nativeDancer.breakpoint).is.either(['mobile', 'tablet', 'whatever']);
    });
  });

  describe('#height', function () {
    it('equals to device\'s height', function () {
      var bd = new NativeDancer(specification);
      assume(bd.height()).equals(Dimensions.get('window').height);
    });
  });

  describe('#width', function () {
    it('equals to device\'s width', function () {
      var bd = new NativeDancer(specification);
      assume(bd.width()).equals(Dimensions.get('window').width);
    });
  });

  describe('#changed', function () {
    it('returns a boolean if the breakpoint has changed', function () {
      assume(nativeDancer.changed()).is.false();
      assume(nativeDancer.changed()).is.false();
      assume(nativeDancer.changed()).is.false();

      var viewport = { width: 200, height: 500 };

      assume(nativeDancer.changed(viewport)).is.true();
    });

    it('updates the .breakpoint', function () {
      var viewport = { width: 200, height: 500 };

      assume(nativeDancer.breakpoint).does.not.equal('mobile');
      assume(nativeDancer.changed(viewport)).is.true();
      assume(nativeDancer.breakpoint).equals('mobile');
    });
  });

  describe('#currently', function () {
    it('matches as tablet', function () {
      var viewport = { width: 800, height: 600 };

      assume(nativeDancer.currently(viewport)).equals('tablet');
    });

    it('matches as mobile', function () {
      var viewport = { width: 200, height: 500 };

      assume(nativeDancer.currently(viewport)).equals('mobile');
    });

    it('matches unknown', function () {
      var viewport = { width: 1800, height: 1600 };

      assume(nativeDancer.currently(viewport)).equals('unknown');
    });
  });

  describe('#viewport', function () {
    it('returns the width and height', function () {
      const viewport = nativeDancer.viewport();

      assume(viewport.width).is.above(0);
      assume(viewport.width).equals(nativeDancer.width());

      assume(viewport.height).is.above(0);
      assume(viewport.height).equals(nativeDancer.height());
    });
  });
});
