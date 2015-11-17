require("velocity-animate");

window.tones = require("./tones.js");

var utils     = require("./utils.js"),
    intervals = require("./intervals.json");

var tTET = require('./12-tet.json');

var hideElementWhenIdle = utils.debounce(function($element){
          $element.removeClass('visible');
    }, 5000);

window.App = {
    baseTone: tones.createSound( $('#base').val() ),
    options: {
        groupNotes:      true,
        octaveReduction: false
    }
};

function animateOvertone(el, duration){
    var $el = $(el),
        $spacesGroup = $el.find( '#' + $el.attr('id') + "-space" ),
        $circles = $( $spacesGroup.find('g').get().reverse() ),
        numbersOfCircles = $circles.length,
        fillColor = "#FFE08D",
        originalFill = "#FFFFFF";

    if( $el.hasClass('velocity-animating') )
        return;

    el.classList.add('active');
    
    if( !numbersOfCircles ) {
        $.Velocity( $spacesGroup, {
            fill: fillColor
        }, { duration: duration.attack * 1000 } )
        .then( function(spaces){
            $.Velocity( spaces, { fill: originalFill });
            el.classList.remove('active');
        }, { duration: duration.release * 1000 } );
    }
    else {
        $circles.each(function(i){
            $.Velocity( this, {
                fill: fillColor
            }, { 
                delay:    i * (duration.attack * 1000 / numbersOfCircles),
                duration: duration.attack * 1000, 
            } )
            .then( function(circle){
                $.Velocity( circle, { fill: originalFill });
                if( i === $circles.length - 1 )
                    el.classList.remove('active');
            }, { duration: duration.release * 1000 } );
        });
    }
}

$(document).ready(function($){
 
  $('.overtone').on('click', function(){
      var idx           = $(this).index() + 1,
          noteFrequency = idx * App.baseTone.frequency,
          self          = this;

      var tone = tones.createSound(noteFrequency);
      
      if( App.options.octaveReduction )
          tone.reduceToSameOctaveAs(App.baseTone);
      
      tone.play();
      
      // @todo obviously clean this up
      var frequencies      = utils.values(tTET),
          closestFrequency = utils.binarySearch(tone.frequency, frequencies),
          note             = utils.findKey( tTET, function(frequency){ return frequency === closestFrequency } ).split(/(\d)/),
          centsDifference  = tone.intervalInCents( { frequency: closestFrequency } );
      
      animateOvertone( self, tone.envelope );
      
      $('#sound-details').addClass('visible show-note').removeClass('show-interval');
      hideElementWhenIdle( $('#sound-details') );
      
      $('#note-frequency')
          .prop( 'number', $('#note-frequency').text().match(/\d+/)[0] )
          .animateNumber({
             number: tone.frequency,
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
          var idx         = $(this).index() + 1,
          firstTone       = tones.createSound(idx * App.baseTone.frequency),
          secondTone      = tones.createSound( (idx + 1)  * App.baseTone.frequency ),
          ratio           = utils.fraction( secondTone.frequency/firstTone.frequency, 999),
          intervalName,
          centsDifference;
      
      centsDifference = Math.abs( firstTone.intervalInCents(secondTone) );
      
      try {
          intervalName = intervals[ ratio[1] + "/" + ratio[2] ].name;
      }
      catch(e) {
          intervalName = "Unknown interval";
      }
      console.log( secondTone.isOctaveOf( App.baseTone ) );
      if( App.options.octaveReduction ){
          firstTone.reduceToSameOctaveAs(App.baseTone, true);
          secondTone.reduceToSameOctaveAs(App.baseTone);
      }
      
      firstTone.play();
      animateOvertone( $('.overtone')[idx - 1], firstTone.envelope );
      
      if( App.options.groupNotes ) {
          secondTone.play();
          animateOvertone( $('.overtone')[idx], secondTone.envelope );
      }
      else {
          setTimeout( function(){
              secondTone.play();
              animateOvertone( $('.overtone')[idx], secondTone.envelope );
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
      var interval      = parseInt( $(this).data('interval') ),
          tone          = tones.createSound(interval * App.baseTone.frequency).reduceToSameOctaveAs(App.baseTone),
          centsDifference,
          ratio,
          intervalName;

      centsDifference   = Math.abs( tone.intervalInCents(App.baseTone) );

      ratio = utils.fraction( tone.frequency / App.baseTone.frequency, 999 );
      
      try {
          intervalName = intervals[ ratio[1] + "/" + ratio[2] ].name;
      }
      catch(e) {
          intervalName = "Unknown interval";
      }
      
      tones.playFrequency( App.baseTone.frequency );
      animateOvertone( $('.overtone')[0], App.baseTone.envelope );

      if( App.options.groupNotes ){
          if( App.options.octaveReduction ) {
              tone.play();
              animateOvertone( $('.overtone')[interval - 1], tone.envelope );
          }
          else {
              while( $('#overtone-' + interval).length ) {
                  tones.playFrequency( interval * App.baseTone.frequency );
                  animateOvertone( $('.overtone')[interval - 1], tone.envelope );
                  interval = interval * 2;
               }
              
              tone.remove();
          }
      }
      else {
          if( App.options.octaveReduction ){
              setTimeout(function(){
                  tone.play();
                  animateOvertone( $('.overtone')[interval - 1], tone.envelope );
              }, 250);
          }
          else {
              var axisIntervals = [];
              
              while( $('#overtone-' + interval).length ) {
                  axisIntervals.push(interval);
                  interval = interval * 2;
              }
              
              axisIntervals.forEach(function(interval, idx){
                  setTimeout(function(){
                      tones.playFrequency( interval * App.baseTone.frequency );
                      animateOvertone( $('.overtone')[interval - 1], tone.envelope );
                  }, 250 * (idx + 1));
              });
              
              tone.remove();
          }
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
  
  $('#base').on('change', function(){
      var val = Math.floor( $(this).val() );
      App.baseTone = tones.playFrequency(val);
      $('#base').attr('data-frequency', val + "Hz");
  });
    
  $('#volume-control').on('change', function(){
      var val = $(this).val() / 100;
      
      tones.masterGain.gain.setValueAtTime(val, tones.context.currentTime);
      tones.playFrequency( App.baseTone.frequency );
  });
    
  $('#group-notes').on('click', function(){
      App.options.groupNotes = App.options.groupNotes ? false : true;
      $(this).toggleClass('grouped');
  });
    
  $('#reduce-to-octave').on('click', function(){
      App.options.octaveReduction = App.options.octaveReduction ? false : true;
      $(this).toggleClass('off');
  });
});