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
    var $el              = $(el),
        $spacesGroup     = $el.find('.spaces'),
        // We'll animate the circles from the inner to the outer, that's
        // why we are reversing the array
        $circles         = $( $spacesGroup.find('g').get().reverse() ),
        numbersOfCircles = $circles.length,
        originalFill     = utils.rgbToHex( $spacesGroup.css('fill') ),
        fillColor        = "#FFE08D";

    if( $el.hasClass('velocity-animating') )
        return;

    el.classList.add('active');
    
    // If there are no inner circles, the animation only fills the spaces
    // with the fillColor
    if( !numbersOfCircles ) {
        $.Velocity( $spacesGroup, {
            fill: fillColor
        }, { duration: duration.attack * 1000 } )
        .then( function(spaces){
            $.Velocity( spaces, { fill: originalFill });
            el.classList.remove('active');
        }, { duration: duration.release * 1000 } );
    }
    // If there are inner circles, we iterate through the circles and fill
    // them progressively
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

function showIntervalDifferenceWithTuning(tone, tuning) {
    var tuning = tuning || '12-TET', // @todo this doesn't do anything currently, placeholder
        frequencies      = utils.values(tTET),
        closestFrequency = utils.binarySearch(tone.frequency, frequencies),
        note             = utils.findKey( tTET, function(frequency){ return frequency === closestFrequency } ).split(/(\d)/),
        centsDifference  = tone.intervalInCents( { frequency: closestFrequency } );
    
    $('#note-frequency')
    // Set the base number from which to animate to the current frequency
    .prop( 'number', $('#note-frequency').text().match(/\d+/)[0] )
    .animateNumber({
        number:     tone.frequency,
        numberStep: function(now, tween){
           var floored_number = Math.floor(now),
               $target        = $(tween.elem);
    
           $target.text(floored_number + " Hz");
     }
    }, 200);
    
    $('#note-name').text(note[0]);
    $('#note sub').text(note[1]);
    $('.cents-difference.tuning')
    .css('text-indent', centsDifference + "%")
    .find('.cents').prop( 'number', $('.tuning .cents').text() ).animateNumber({
        number: centsDifference,
        numberStep: function(now, tween){
            var floored_number = Math.floor(now),
                target = tween.elem
            target.innerHTML = floored_number > 0 ? "+" + floored_number : floored_number;
        }
    }, 200);
    
    $('.tuning .cent-bar').css('left', 50 + centsDifference / 2 + "%");
    
    console.log(note[0], closestFrequency, centsDifference);
}

function showIntervalName(firstTone, secondTone) {
    var ratio           = utils.fraction( secondTone.frequency/firstTone.frequency, 999),
        centsDifference = Math.abs( firstTone.intervalInCents(secondTone) ),
        intervalName;
          
    try {
        intervalName = intervals[ ratio[1] + "/" + ratio[2] ].name;
    }
    catch(e) {
        intervalName = "Unknown interval";
    }
    
    $('#interval-name').text(intervalName);
    
    $('#interval sup').text( ratio[1] );
    $('#interval sub').text( ratio[2] );
    
    $('.cents-difference.interval')
        .css('text-indent', centsDifference / 12 + "%")
        .find('.cents').prop( 'number', $('.interval .cents').text() ).animateNumber( {number: centsDifference }, 200 );
    
    $('.interval .cent-bar').css('left', centsDifference / 12 + "%");
}

function fillSoundDetails(tones) {
    $('#sound-details').addClass('visible');
    hideElementWhenIdle( $('#sound-details') );
    
    if( !tones.length ) {
        $('#sound-details').addClass('show-note').removeClass('show-interval');
        showIntervalDifferenceWithTuning(tones);
    }
    else {
        $('#sound-details').addClass('show-interval').removeClass('show-note');
        showIntervalName( tones[0], tones[1] );
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
      
      animateOvertone( self, tone.envelope );
      
      fillSoundDetails( tone, 'difference' );
  });
    
  $('.spiral-piece').on('click', function(){
          var idx         = $(this).index() + 1,
          firstTone       = tones.createSound(idx * App.baseTone.frequency),
          secondTone      = tones.createSound( (idx + 1)  * App.baseTone.frequency );
      
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
      
      fillSoundDetails( [firstTone, secondTone] );
  });
    
  $('.axis').on('click', function(){
      var interval      = parseInt( $(this).data('interval') ),
          tone          = tones.createSound(interval * App.baseTone.frequency).reduceToSameOctaveAs(App.baseTone);
      
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
      
      fillSoundDetails( [App.baseTone, tone] );
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