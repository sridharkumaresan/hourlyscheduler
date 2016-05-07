(function ($) {
  'use strict';

  var HourlyScheduleSelector = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, HourlyScheduleSelector.DEFAULTS, options);
    this.render();
    this.addEvents();
    this.$startSelecting = null;
  }
  /**
  * Define  Defaults
  * Program has the facility to add more than one days of schedule
  */
  HourlyScheduleSelector.DEFAULTS = {
    days        : [0],  
    startTime   : '08:00',                // HH:mm format
    endTime     : '20:00',                // HH:mm format
    interval    : 30,                     // minutes
    stringDays  : ['Mon'],
    template    : '<div class="hourly-schedule-container">'         +
                    '<div class="schedules"></div>'   +
                  '<div>'
  };

  /**
   * Initialize and render the slots
   * 
   */
  HourlyScheduleSelector.prototype.render = function () {
    this.$element.html(this.options.template);
    this.renderRows();
  };

  /**
   * Display the slots with selection. Handle Start, Lunch, End hours
   * 
   */
  HourlyScheduleSelector.prototype.renderRows = function () {
    var start = this.options.startTime, end = this.options.endTime, interval = this.options.interval, days = this.options.days, $element = this.$element.find('.schedules');

    $.each(dateGeneration(start, end, interval), function (i, d) {
      var officeTimings = {
        officeStart : i===0?true:false,
        officeEnd : i===23?true:false,
        officeLunch : i===12?true:false
      };
      var subClass =  (officeTimings.officeStart ? ' start ' : '') +
                      (officeTimings.officeEnd ? ' end ' : '') +
                      (officeTimings.officeLunch ? ' lunch ' : '');
      var daysForTheRow = $.map(new Array(days.length), function (_, i) {
        
        var timeSlotOutput = '<div class="time-slot'+subClass+'" data-time="' + returnTimeAsHHMM(d) + '" data-day="' + days[i] + '">';
        if(officeTimings.officeStart || officeTimings.officeLunch || officeTimings.officeEnd){
          if(officeTimings.officeEnd){
            var newDateObj = new Date();
            d.setTime(d.getTime() + (30 * 60 * 1000));
          }
          timeSlotOutput = timeSlotOutput + '<span class="time-lablel">'+ getTimeWithAMPM(d) +'</span>'
        }
        timeSlotOutput=timeSlotOutput+'</div>';
        return timeSlotOutput;
      }).join();
      $element.append(daysForTheRow);
    });
  };

  /**
   * Check if the mode is in selecting slots mode
   * 
   */
  HourlyScheduleSelector.prototype.isSelecting = function () {
    return !!this.$startSelecting;
  }

  HourlyScheduleSelector.prototype.select = function ($slot) { $slot.attr('data-slot-selected', 'selected'); }
  HourlyScheduleSelector.prototype.deselect = function ($slot) { $slot.removeAttr('data-slot-selected'); }

  function isSlotSelected($slot) { return $slot.is('[data-slot-selected]'); }
  function isSlotSelecting($slot) { return $slot.is('[data-slot-selecting]'); }

  /**
   * Get time slot that is selected 
   * 
   */
  function getSlotsSelected(plugin, $a, $b) {
    var $slots, small, large, temp;
    if (!$a.hasClass('time-slot') || !$b.hasClass('time-slot') ||
        ($a.data('day') != $b.data('day'))) { return []; }
    $slots = plugin.$element.find('.time-slot[data-day="' + $a.data('day') + '"]');
    small = $slots.index($a); large = $slots.index($b);
    if (small > large) { temp = small; small = large; large = temp; }
    return $slots.slice(small, large + 1);
  }

  HourlyScheduleSelector.prototype.addEvents = function () {
    var plugin = this, options = this.options, $slots;

    this.$element.on('click', '.time-slot', function () {
      var day = $(this).data('day');
      if (!plugin.isSelecting()) {  
        if (isSlotSelected($(this))) { plugin.deselect($(this)); }
        else {  
          plugin.$startSelecting = $(this);
          $(this).attr('data-slot-selecting', 'selecting');
          plugin.$element.find('.time-slot').attr('data-disabled', 'disabled');
          plugin.$element.find('.time-slot[data-day="' + day + '"]').removeAttr('data-disabled');
        }
      } else {  
        if (day == plugin.$startSelecting.data('day')) {  
          plugin.$element.find('.time-slot[data-day="' + day + '"]').filter('[data-slot-selecting]')
            .attr('data-slot-selected', 'selected').removeAttr('data-slot-selecting');
          plugin.$element.find('.time-slot').removeAttr('data-disabled');
          plugin.$element.trigger('selected.hourlyScheduleSelector', [getSlotsSelected(plugin, plugin.$startSelecting, $(this))]);
          plugin.$startSelecting = null;
        }
      }
    });
  };

  /**
   * arrange the selections
   */
  HourlyScheduleSelector.prototype.arrange = function () {
    var plugin = this, selections = {};

    $.each(this.options.days, function (_, v) {
      var start, end;
      start = end = false; selections[v] = [];
      plugin.$element.find(".time-slot[data-day='" + v + "']").each(function () {

        if (isSlotSelected($(this)) && !start) {
          start = $(this).data('time');
        }

        if (!isSlotSelected($(this)) && !!start) {
          end = $(this).data('time');
        }

        if (isSlotSelected($(this)) && !!start && $(this).is(".time-slot[data-day='" + v + "']:last")) {
          end = convertSecondsToHHMM(
            convertHHMMroSeconds($(this).data('time')) + plugin.options.interval * 60);
        }

        if (!!end) { selections[v].push([start, end]); start = end = false; }
      });
    })
    return selections;
  };

  /**
   * Show the selected time slots on page
   */
  HourlyScheduleSelector.prototype.showSelections = function (schedule) {
    var plugin = this, i;
    $.each(schedule.data, function(d, ds) {
      var $slots = plugin.$element.find('.time-slot[data-day="' + d + '"]');
      $.each(ds, function(_, s) {
        for (i = 0; i < $slots.length; i++) {
          if ($slots.eq(i).data('time') >= s[1]) { break; }
          if ($slots.eq(i).data('time') >= s[0]) { 
            plugin.select($slots.eq(i)); 
          }
        }
      })
    });
  };

  function Plugin(option) {
    return this.each(function (){
      var $this   = $(this), data = $this.data('.hourlyScheduleSelector'), options = typeof option == 'object' && option;

      if (!data) {
        $this.data('.hourlyScheduleSelector', (data = new HourlyScheduleSelector(this, options)));
      }
    })
  }

  $.fn.hourlyScheduleSelector = Plugin;

  /**
   * Generate Date objects for each time slot in a day
   */
  function dateGeneration(start, end, interval) {
    var numOfRows = Math.ceil(timeDiff(start, end) / interval);
    return $.map(new Array(numOfRows), function (_, i) {
      return new Date(new Date(2000, 0, 1, start.split(':')[0], start.split(':')[1]).getTime() + i * interval * 60000);
    });
  }

  /**
   * Return minute diff
   */
  function timeDiff(start, end) {   
    return (new Date(2000, 0, 1, end.split(':')[0], end.split(':')[1]).getTime() -
            new Date(2000, 0, 1, start.split(':')[0], start.split(':')[1]).getTime()) / 60000;
  }

  /**
   * Convert a Date object with am/pm
   */
  function getTimeWithAMPM(date) {
    var hours = date.getHours(), minutes = date.getMinutes(), ampm = hours >= 12 ? 'pm' : 'am';
    return hours + ':' + ('0' + minutes).slice(-2);
  }

  /**
   * Some Date Conversion Utils
   * 
   */
  function returnTimeAsHHMM(date) {
    var hours = date.getHours(), minutes = date.getMinutes();
    return ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2);
  }

  function convertHHMMroSeconds(hhmm) {
    var h = hhmm.split(':')[0], m = hhmm.split(':')[1];
    return parseInt(h, 10) * 60 * 60 + parseInt(m, 10) * 60;
  }

  function convertSecondsToHHMM(seconds) {
    var minutes = Math.floor(seconds / 60);
    return ('0' + Math.floor(minutes / 60)).slice(-2) + ':' +
           ('0' + (minutes % 60)).slice(-2);
  }

})(jQuery);
