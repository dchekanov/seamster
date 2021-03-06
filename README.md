# Seamster

Seamster helps to organize JavaScript code in small and simple projects.

Intended to be used for scripts running in the browser, it stitches files together, 
making sure the global scope is not altered unintentionally. 

In a nutshell, it is an [IIFE](https://en.wikipedia.org/wiki/Immediately-invoked_function_expression)-wrapping concatenator that provides a namespace for modules to communicate with each other.
 
To illustrate what it does, consider having this codebase:

```javascript
// ./examples/monolithic/app.js
var app = {
  announceCurrentDate: function() {
    alert('Today is ' + this.utils.getCurrentDate().toDateString());
  },
  utils: {
    getCurrentDate: function() { return new Date(); }
  }
};

app.announceCurrentDate();
```

You can split that into a number of files:

```javascript
// ./examples/modular/modules/utils.js
// no manual wrapping is necessary here to protect the global scope 
function getCurrentDate() {
  return new Date();
}
// modules have access to a common shared namespace (the name of which is configurable), 
// the namespace is used to transparently "import" and "export" functionality
app.utils = {
  getCurrentDate: getCurrentDate
};
```

```javascript
// ./examples/modular/modules/announce-current-date.js
// a shorter way to export a module
app.announceCurrentDate = function() {
  alert('Today is ' + app.utils.getCurrentDate().toDateString());
};
```

```javascript
// ./examples/modular/modules/init.js
// no explicit importing is required
app.announceCurrentDate();
```

Call Seamster in the build script to stitch files together:

```javascript
// ./examples/modular/build.js
var fs = require('fs');
var path = require('path');
var seamster = require('seamster');

var modulesDir = path.join(__dirname, 'modules');

// a globbing module could be used here instead
var files = fs
  .readdirSync(modulesDir)
  .sort(function(a, b) {
    // the order of concatenation is important here
    if (a == 'init.js') return 1;

    return 0;
  })
  .map(function(file) {
    return path.join(modulesDir, file);
  });

seamster({
  ns: 'app',
  files: files,
  dest: path.join(__dirname, 'app.js')
});

```

End result:

```javascript
// top-level IIFE protects the global scope
(function() {
  // namespace declaration is inserted by the tool
  // the namespace can be exposed, if needed (see the API section)
  var app = {};
  // contents of each file are wrapped into an IIFE to give each module a private scope
  (function() {
    // contents of ./examples/modular/modules/utils.js
  })();
  (function() {
    // contents of ./examples/modular/modules/announce-current-date.js
  })();
  (function() {
    // contents of ./examples/modular/modules/init.js
  })();
})();
// an external source map file is generated by default to help with debugging
//# sourceMappingURL=app.js.map
```

## Rationale

The shown approach to modularization is viable when:

1. The project code is too large to be edited comfortably in a single file.
2. Some parts of the code can be grouped together, but still depend heavily on other parts and are unlikely to be reused in other projects.
3. The code uses browser-specific APIs and DOM a lot, so authoring it as CommonJS modules won't make it easily reusable and testable in Node.js environment.
4. Using AMD doesn't seem to bring any benefits and explicit manual code wrapping is undesirable.
5. Tools like Browserify, Webpack, or Gulp with plugins seem too complex for a task and won't be utilized for anything else but for stitching a few JavaScript files together.
6. ES6 module loading is not yet supported everywhere.
7. You're ok with creating custom build scripts.

## Installation and usage

### Requirements

Node.js >= 0.10.

### Installation

```
$ npm install seamster --save-dev
```

### Workflow

1. Pick a namespace to be used throughout the code.
2. Author the code.
3. Create a build script that will call Seamster to stitch files (see above for an example).
4. Call the build script when you need it.

If you need a fancy CLI, watch mode, streaming, piping, and all that cool stuff - this tool doesn't have any of those. 
It is an intentionally low-level and fairly basic script.
You can add those in your custom build script, or just use a more complex tool.

## API

Call `seamster()` with the following options:

```javascript
/**
 * @param {Object} opts - stitching parameters
 * @param {string} opts.ns - the namespace to be used within the bundle
 * @param {string[]} opts.files - the list of files to stitch (use absolute paths)
 * @param {string} opts.dest - where to save the bundle and the source map
 * @param {boolean} [opts.sourceMap] - whether to generate a source map
 * @param {boolean} [opts.expose] - whether to expose the namespace to the global namespace
 */
```

The tool is synchronyous and throws errors if anything goes wrong.

Source maps have source code included. 
Consider some sort of access protection if you don't want to leak the source code of your application, or disable source map generation for production build.

When requested, the tool exposes the namespace like this:

```javascript
typeof module != "undefined" && module.exports ? module.exports = NS : window.NS = NS;
```

## Tips

1. Add this virtual comment into the entry point file to help WebStorm to support the used namespace:

```javascript
/**
 * @namespace THE_NAMESPACE_YOU_PICKED
 */
```

## License

[MIT](./LICENSE)
