(function() {
  var app = {};
  (function() {
    app.announceCurrentDate = function() {
      alert('Today is ' + app.utils.getCurrentDate().toDateString());
    };
  })();
  (function() {
    function getCurrentDate() {
      return new Date();
    }
    
    app.utils = {
      getCurrentDate: getCurrentDate
    };
  })();
  (function() {
    app.announceCurrentDate();
  })();
})();
//# sourceMappingURL=app.js.map