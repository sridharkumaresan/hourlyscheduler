describe ("HourlyScheduler", function () {
  beforeEach (function () {
    document.body.innerHTML = '<div id="main-container"></div>';
  });
    describe ("#arrange", function() {
    beforeEach (function() {
      var selections = [
        [0, '10:00'], [0, '15:30'] // first one and last one   
      ]
      $("#main-container").hourlyScheduleSelector();
      for (var i = 0; i < selections.length; i++) {
        $("#main-container .time-slot[data-day='" + selections[i][0] +"'][data-time='" + selections[i][1] + "']").attr('data-slot-selected', 'selected');
      }
    });

    it ("arranges the selected time slots correctly", function () {
      var selected = $("#main-container").data('.hourlyScheduleSelector').arrange()
      selected.should.eql({
        0: [['08:00', '08:30'], ['19:30', '20:00']]        
      });
    });
  });
});