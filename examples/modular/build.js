var fs = require('fs');
var path = require('path');
var seamster = require('../../index');

var modulesDir = path.join(__dirname, 'modules');

var files = fs
  .readdirSync(modulesDir)
  .sort(function(a, b) {
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
