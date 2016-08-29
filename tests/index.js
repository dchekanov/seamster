var assert = require('assert');
var fs = require('fs');
var path = require('path');
var seamster = require('../index');

/* incorrect options */

// no options provided
assert.throws(seamster);

// invalid namespace provided
assert.throws(function() {
  seamster({
    ns: true,
    files: ['dummy']
  });
});

// not an array of files provided
assert.throws(function() {
  seamster({
    ns: 'test',
    files: {}
  });
});

// an empty list of files provided
assert.throws(function() {
  seamster({
    ns: 'test',
    files: []
  });
});

/* stitching */

var modules = ['a', 'b'];
var modulesDirectory = path.resolve(__dirname, 'app/modules');
var bundleDest = path.resolve(__dirname, 'app/bundle.js');
var sourceMapDest = bundleDest + '.map';

var files = modules.map(function(module) {
  return path.join(modulesDirectory, module + '.js');
});

files.push(path.resolve(__dirname, 'app/init.js'));

function deleteOldBundle() {
  try {
    fs.unlinkSync(bundleDest);
    fs.unlinkSync(sourceMapDest);
  } catch (err) {
    // files didn't exist is ok
    if (err.code != 'ENOENT') throw err;
  }
}

deleteOldBundle();

seamster({
  ns: 'app',
  files: files,
  dest: bundleDest,
  expose: true
});

assert.doesNotThrow(function() {
  // a bundle was created
  fs.accessSync(bundleDest);
  // a source map was created
  fs.accessSync(sourceMapDest);
});

var exposedBundle = require(bundleDest);

// namespace is exposed
assert(typeof exposedBundle == 'object');
assert(exposedBundle.a == 'a');

// the base.js was executed
assert(exposedBundle.bWasCalled);

deleteOldBundle();

var nonExposedBundle = seamster({
  ns: 'app',
  files: files,
  dest: bundleDest,
  expose: true,
  sourceMap: false
});

// namespace is not exposed
assert(typeof nonExposedBundle == 'undefined');

assert.throws(function() {
  // a source map was not created
  fs.accessSync(sourceMapDest);
});

console.log('All tests passed');
