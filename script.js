window.tones = require("./tones.js");

var utils     = require("./utils.js"),
    intervals = require("./intervals.json");

var tTET = require('./12-tet.json');

var hideElementWhenIdle = utils.debounce(function($element){
          $element.removeClass('visible');
    }, 5000);

window.App = {
    options: {
        groupNotes: true
    }
};

$(document).ready(function($){
 
  $('.overtone').on('click', function(){
      var idx           = $(this).index() + 1,
          baseFrequency = $('#base').val(),
          noteFrequency = idx * baseFrequency;

      var tone = tones.playFrequency(noteFrequency);
      
      // @todo obviously clean this up
      var frequencies      = utils.values(tTET),
          closestFrequency = utils.binarySearch(noteFrequency, frequencies),
          note             = utils.findKey( tTET, function(frequency){ return frequency === closestFrequency } ).split(/(\d)/),
          centsDifference  = tone.intervalInCents( { frequency: closestFrequency } );
      
      $('#sound-details').addClass('visible show-note').removeClass('show-interval');
      hideElementWhenIdle( $('#sound-details') );
      
      $('#note-frequency')
          .prop( 'number', $('#note-frequency').text().match(/\d+/)[0] )
          .animateNumber({
             number: noteFrequency,
             numberStep: function(now, tween){
                var floored_number = Math.floor(now),
                    $target        = $(tween.elem);

                $target.text(floored_number + " Hz");
             }
          }, 200)
      
      $('#note-name').text(note[0]);
      $('#note sub').text(note[1]);
      $('.cents-difference.tuning')
          .css('text-indent', centsDifference + "%")
          .find('.cents').prop( 'number', $('.tuning .cents').text() ).animateNumber({
               number: centsDifference,
               numberStep: function(now, tween){
                   var floored_number = Math.floor(now),
                       target = tween.elem;

                  target.innerHTML = floored_number > 0 ? "+" + floored_number : floored_number;
               }
          }, 200);

      $('.tuning .cent-bar').css('left', 50 + centsDifference / 2 + "%");
      
      console.log(note[0], closestFrequency, centsDifference);
  });
    
  $('.spiral-piece').on('click', function(){
      var baseFrequency   = $('#base').val(),
          idx             = $(this).index() + 1,
          firstFrequency  = idx * baseFrequency,
          secondFrequency = (idx + 1)  * baseFrequency,
          ratio           = utils.fraction( secondFrequency/firstFrequency, 999),
          intervalName,
          firstTone,
          centsDifference;
      
      firstTone       = tones.playFrequency( firstFrequency );
      centsDifference = Math.abs( firstTone.intervalInCents( { frequency: secondFrequency } ) );
      
      try {
          intervalName = intervals[ ratio[1] + "/" + ratio[2] ].name;
      }
      catch(e) {
          intervalName = "Unknown interval";
      }
      
      if( App.options.groupNotes ) {
          tones.playFrequency( secondFrequency );
      }
      else {
          setTimeout( function(){
              tones.playFrequency( secondFrequency );
          }, 250)
      }
      
      $('#sound-details').addClass('visible show-interval').removeClass('show-note');;
      hideElementWhenIdle( $('#sound-details') );
      
      $('#interval-name').text(intervalName);
      
      $('#interval sup').text( ratio[1] );
      $('#interval sub').text( ratio[2] );
      
      $('.cents-difference.interval')
          .css('text-indent', centsDifference / 12 + "%")
          .find('.cents').prop( 'number', $('.interval .cents').text() ).animateNumber( {number: centsDifference }, 200 );
      
      $('.interval .cent-bar').css('left', centsDifference / 12 + "%");
  });
    
  $('.axis').on('click', function(){
      var baseFrequency = $('#base').val(),
          interval      = parseInt( $(this).data('interval') ),
          octaveReducedTone,
          centsDifference,
          ratio,
          intervalName;

      octaveReducedTone = tones.playFrequency( baseFrequency ).reduceToSameOctaveAs( { frequency: interval * baseFrequency } );
      centsDifference   = Math.abs( octaveReducedTone.intervalInCents( { frequency: interval * baseFrequency } ) );

      ratio = utils.fraction( octaveReducedTone.frequency / (interval * baseFrequency), 999 );
      
      try {
          intervalName = intervals[ ratio[1] + "/" + ratio[2] ].name;
      }
      catch(e) {
          intervalName = "Unknown interval";
      }

      $('#sound-details').addClass('visible show-interval').removeClass('show-note');;
      hideElementWhenIdle( $('#sound-details') );
      
      $('#interval-name').text(intervalName);
      
      $('#interval sup').text( ratio[1] );
      $('#interval sub').text( ratio[2] );
      
      $('.cents-difference.interval')
          .css('text-indent', centsDifference / 12 + "%")
          .find('.cents').prop( 'number', $('.interval .cents').text() ).animateNumber( {number: centsDifference }, 200 );
      
      $('.interval .cent-bar').css('left', centsDifference / 12 + "%");
      
      if( App.options.groupNotes ){
          while( $('#overtone-' + interval).length ) {
              tones.playFrequency( interval * baseFrequency );
              interval = interval * 2;
           }
      }
      else {
          var axisIntervals = [];
          while( $('#overtone-' + interval).length ) {
              axisIntervals.push(interval);
              interval = interval * 2;
          }
          axisIntervals.forEach(function(interval, idx){
              setTimeout(function(){
                  tones.playFrequency( interval * baseFrequency );
              }, 250 * (idx + 1));
          });
      }
  });
  
  $('#base').on('change', function(){
      var val = Math.floor( $(this).val() );
      tones.playFrequency(val);
      $('#base-frequency-label').text(val + "Hz");
  });
    
  $('#volume-control').on('change', function(){
      var val = $(this).val() / 100;
      
      tones.masterGain.gain.setValueAtTime(val, tones.context.currentTime);
  });
    
  $('#group-notes').on('click', function(){
      App.options.groupNotes = App.options.groupNotes ? false : true;
      $(this).toggleClass('grouped');
  });
});