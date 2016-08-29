(function() {
  var app = {}; typeof module != "undefined" && module.exports ? module.exports = app : window.app = app;
  (function() {
    var a = 'a';
    
    app.a = a;
  })();
  (function() {
    app.b = function() {
      app.bWasCalled = true;
    };
  })();
  (function() {
    /**
     * @namespace app
     */
    
    app.b();
  })();
})();