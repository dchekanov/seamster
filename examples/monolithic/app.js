var app = {
  announceCurrentDate: function() {
    alert('Today is ' + this.utils.getCurrentDate().toDateString());
  },
  utils: {
    getCurrentDate: function() { return new Date(); }
  }
};

app.announceCurrentDate();
