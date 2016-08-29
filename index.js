var fs = require('fs');
var path = require('path');
var mkpath = require('mkpath');
var SourceMapGenerator = require('source-map').SourceMapGenerator;

/**
 * Stitches files together, generates source map, writes everything down
 * @param {Object} opts - stitching parameters
 * @param {string} opts.ns - the namespace to be used within the bundle
 * @param {string[]} opts.files - the list of files to stitch (use absolute paths)
 * @param {string} opts.dest - where to save the bundle
 * @param {boolean} [opts.sourceMap] - whether to generate a source map
 * @param {boolean} [opts.expose] - whether to expose the namespace to the global namespace
 */
function stitch(opts) {
  if (typeof opts != 'object') throw new Error('Options were not provided');
  if (typeof opts.ns != 'string') throw new Error('A namespace was not provided');
  if (!Array.isArray(opts.files) || opts.files.length == 0) throw new Error('A list of files to stich was not provided');
  if (!opts.dest) throw new Error('A destination file path was not provided');

  if (typeof opts.sourceMap == 'undefined') opts.sourceMap = true;

  var destPath = path.parse(opts.dest);
  var sourceMap = opts.sourceMap ? new SourceMapGenerator() : null;
  var bundle = '';
  var nsDef = 'var ' + opts.ns + ' = {};';

  if (opts.expose) {
    nsDef += ' typeof module != "undefined" && module.exports ? ' +
      'module.exports = ' + opts.ns + ' : ' +
      'window.' + opts.ns + ' = ' + opts.ns + ';';
  }

  bundle += nsDef + '\n';

  opts.files.forEach(function(file, idx, arr) {
    var fileContents = fs.readFileSync(file);

    if (sourceMap) {
      var filePath = path.parse(file);
      var dirRel = path.relative(destPath.dir, filePath.dir);
      var fileRel = path.join(dirRel, filePath.base).replace(/\\/g, '/');
      var bundleNewlines = bundle.match(/\n/g) || [];
      var fileNewlines = fileContents.toString().trim().match(/\n/g) || [];

      for (var i = 1; i <= fileNewlines.length + 1; i++) {
        sourceMap.addMapping({
          source: fileRel,
          original: {
            line: i,
            column: 0
          },
          generated: {
            // initial offset: a line for the top-level wrapper and another for namespace definition
            line: 2 + bundleNewlines.length + i,
            column: 0
          }
        });
      }

      sourceMap.setSourceContent(fileRel, fileContents.toString());
    }

    bundle += wrap(fileContents, idx != arr.length - 1);
  });

  bundle = wrap(bundle);
  if (sourceMap) bundle += '\n//# sourceMappingURL=' + destPath.base + '.map';

  mkpath.sync(destPath.dir);

  fs.writeFileSync(opts.dest, bundle);
  if (sourceMap) fs.writeFileSync(opts.dest + '.map', sourceMap);
}

/**
 * Wraps code into an IIFE, trimming and adjusting indentation to improve readability
 * @param {*} code - code to wrap
 * @param {boolean} [addNewLine] - whether to append a new line in the end, to make output prettier
 * @returns {string} - wrapped code
 * @private
 */
function wrap(code, addNewLine) {
  return '(function() {\n  ' + code.toString().trim().replace(/\n/g, '\n  ') + '\n})();' + (addNewLine ? '\n' : '');
}

module.exports = stitch;
