# breakdancer [![Version npm](https://img.shields.io/npm/v/breakdancer.svg?style=flat-square)](https://www.npmjs.com/package/breakdancer)[![Build Status](https://img.shields.io/travis/godaddy/breakdancer/master.svg?style=flat-square)](https://travis-ci.org/godaddy/breakdancer)[![Dependencies](https://img.shields.io/david/godaddy/breakdancer.svg?style=flat-square)](https://david-dm.org/godaddy/breakdancer)[![Coverage Status](https://img.shields.io/coveralls/godaddy/breakdancer/master.svg?style=flat-square)](https://coveralls.io/r/godaddy/breakdancer?branch=master)

Breakdancer is a small utility library that helps developing and using ergonomic
breakpoints. Devices and sizes will always change, human ergonomics like palm,
wrist, lap, desk, wall never will.

## Table of Contents

- [Installation](#installation)
- [API](#api)
  - [.width()](#width)
  - [.height()](#height)
  - [.viewport()](#viewport)
  - [.changed()](#changed)
  - [.currently()](#currently)
  - [.compareWidth()](#comparewidth)
  - [.compareHeight()](#compareheight)
  - [.breakpoint](#breakpoint)
- [License](#license)

## Installation

The module is released in the public npm registry and can be installed by
running the following command in your terminal:

```
npm install --save breakdancer
```

Please do note that:

- This module was written from a browser environment so it depends on window and
  document to be available in the global scope. We do fallback to a polyfill if
  those are missing so the module should not break in a Node.js environment.
- The module is written in ES6, so make sure that you environment supports this
  or use a transpiler like [Babel](http://babeljs.io/) to compile the code.

## Support

Breakdancer is tested and works on both `web` and `react-native` platforms.
Note that we don't specify `react-native` as a peer dependency in order to avoid
dependency issues on pure `web` projects, so make sure you have `react-native`
as a dependency.

## API

The `Breakdancer` constructor is exported as default interface of this module
and can be imported using:

```js
import Breakdancer from 'breakdancer';
```

The `Breakdancer` constructor accepts 2 arguments which are your specification
ergonomic or just breakpoints and an optional reference to a custom `window`
object which should be used for view port information. The specification can
either be an object where the key of the object is name and the value the
width/height specification or an array of object where the objects have a `name`
property.

```js
var breakpoints = new Breakdancer([
  {
    name: 'wrist',
    width: 320
  },
  {
    name: 'palm',
    width: 800,
    height: 600
  }
]);
```

The `width` and/or `height` that you specified should be seen as a minimum value.
So when you specify 320 as width for wrist that means that 0 - 319 will trigger
as `wrist` breakpoint. If width and height are both set it needs to satisfy
the minim value of height as well before our checks move to the next
breakpoint.

Now that everything is specified we can look at which methods are exposed on the
created instance. In all examples we assume that the code above is used as
example.

### width()

Returns the width of the current view port.

```js
breakpoints.width()  // 390
```

### height()

Returns the height of the current view port.

```js
breakpoints.height(); // 509
```

### viewport()

Returns both the height and width of the current view port as an object.

```js
breakpoints.viewport() // { width: 390, height: 509 }
```

### changed()

Check if the view port and therefor our specified breakpoints have changed since
the last time we've called the `changed` method. When constructing an instance
we automatically check what our current satisfied breakpoint is. This method
returns a boolean as indication if a change has occurred.

```js
breakpoints.changed() // false

.. resize the browser ..

breakpoints.changed() // true
```

The method accepts an optional viewport argument if you want to test a different
viewport configuration. If none is provided it will use the viewport information
from the `.viewport()` method.

### currently()

Calculates what we're currently triggering as view port. It does by iterating
over the specified breakpoints and see if they are satisfying in the current
view port. The name of the triggered breakpoint is returned as string.

```js
breakpoints.currently(); // desktop
```

The method accepts an optional viewport argument if you want to test a different
viewport configuration. If none is provided it will use the viewport information
from the `.viewport()` method.

### .breakpoint

A cached value that is used to see if the breakpoint is changed. This is updated
when the `.changed()` method is called. So it's advised to use `.changed()` and
`.breakpoint` over manually calling the `.currently()` method for figuring out
the current break point.

```js
console.log(breakpoints.breakpoint) // wrist

breakpoints.changed();
console.log(breakpoints.breakpoint) // palm
```

### compare()

Returns the difference between the current window and the given breakpoint in
the given dimension. This can be used to check if the window is "greater" than a
breakpoint. If either the given breakpoint or the given attribute do not exist,
a `TypeError` will be thrown.

```js
var breakpoints = new Breakdancer([{
    name: 'wrist',
    width: 320
  }, {
    name: 'palm',
    width: 800,
    height: 600
}]);

// let's assume the window is 500 px wide and 500 px tall.
console.log(breakpoints.compare('wrist', 'width')) // 180
console.log(breakpoints.compare('palm', 'height')) // -100
```

## License

[MIT](LICENSE)
