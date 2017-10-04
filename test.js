import Breakdancer from './index';
import assume from 'assume';

it('is exposed as a function', function () {
  assume(Breakdancer).is.a('function');
});

describe('breakdancer', function () {
  let breakdancer;
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

  beforeEach(function () {
    breakdancer = new Breakdancer(specification);
  });

  it('safely works without existing windows object', function () {
    breakdancer = new Breakdancer(specification, {});

    assume(breakdancer.height()).equals(0);
    assume(breakdancer.width()).equals(0);
  });

  describe('constructor', function () {
    it('stores the specification as arrays', function () {
      assume(breakdancer.specification).is.a('array');
      assume(breakdancer.specification[0].name).equals('mobile');
    });

    it('sets the current breakpoint', function () {
      assume(breakdancer.breakpoint).is.a('string');
      assume(breakdancer.breakpoint).is.either(['mobile', 'desktop', 'whatever']);
    });

    it('can be supplied with a custom window object', function () {
      var bd = new Breakdancer(specification, {
        innerHeight: 10,
        innerWidth: 10
      });

      assume(bd.breakpoint).equals('mobile');
    });
  });

  describe('#height', function () {
    it('defaults to documentElement clientHeight on missing innerHeight', function () {
      var bd = new Breakdancer(specification, {
        document: {
          documentElement: {
            clientHeight: 1337,
            clientWidth: 1337
          }
        }
      });

      assume(bd.height()).equals(1337);
    });

    it('defaults to innerHeight', function () {
      var bd = new Breakdancer(specification, {
        innerHeight: 10,
        innerWidth: 11,
        document: {
          documentElement: {
            clientHeight: 1337,
            clientWidth: 1338
          }
        }
      });

      assume(bd.height()).equals(10);
    });
  });

  describe('#width', function () {
    it('defaults to documentElement clientHeight on missing innerWidth', function () {
      var bd = new Breakdancer(specification, {
        document: {
          documentElement: {
            clientHeight: 1337,
            clientWidth: 1338
          }
        }
      });

      assume(bd.width()).equals(1338);
    });

    it('defaults to innerWidth', function () {
      var bd = new Breakdancer(specification, {
        innerHeight: 10,
        innerWidth: 11,
        document: {
          documentElement: {
            clientHeight: 1337,
            clientWidth: 1338
          }
        }
      });

      assume(bd.width()).equals(11);
    });
  });

  describe('#changed', function () {
    it('returns a boolean if the breakpoint has changed', function () {
      assume(breakdancer.changed()).is.false();
      assume(breakdancer.changed()).is.false();
      assume(breakdancer.changed()).is.false();

      var viewport = { width: 200, height: 500 };

      assume(breakdancer.changed(viewport)).is.true();
    });

    it('updates the .breakpoint', function () {
      var viewport = { width: 200, height: 500 };

      assume(breakdancer.breakpoint).does.not.equal('mobile');
      assume(breakdancer.changed(viewport)).is.true();
      assume(breakdancer.breakpoint).equals('mobile');
    });
  });

  describe('#currently', function () {
    it('matches as desktop', function () {
      var viewport = { width: 800, height: 600 };

      assume(breakdancer.currently(viewport)).equals('desktop');
    });

    it('matches as mobile', function () {
      var viewport = { width: 200, height: 500 };

      assume(breakdancer.currently(viewport)).equals('mobile');
    });

    it('matches unknown', function () {
      var viewport = { width: 1800, height: 1600 };

      assume(breakdancer.currently(viewport)).equals('unknown');
    });
  });

  describe('#viewport', function () {
    it('returns the width and height', function () {
      const viewport = breakdancer.viewport();

      assume(viewport.width).is.above(0);
      assume(viewport.width).equals(breakdancer.width());

      assume(viewport.height).is.above(0);
      assume(viewport.height).equals(breakdancer.height());
    });
  });

  describe('#compare', function () {
    var bd = new Breakdancer(specification, {
      innerWidth: 1234,
      innerHeight: 1000,
      document: {
        documentElement: {
          clientHeight: 1337,
          clientWidth: 1338
        }
      }
    });

    it('should throw an error when looking at an unspecified breakpoint', function () {
      assume(bd.compare('hologram', 'width')).throws(TypeError);
    });

    it('should throw an error when the given dimension does not exist for the given breakpoint', function () {
      assume(bd.compare('whatever', 'height')).throws(TypeError);
    });

    it('should return the difference in width between the current and specified breakpoint', function () {
      assume(bd.compare('mobile', 'width')).equals(1234 - 400);
      assume(bd.compare('mobile', 'height')).equals(1000 - 600);
    });
  });
});
