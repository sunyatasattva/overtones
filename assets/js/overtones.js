require("velocity-animate");
require("jquery.animate-number");

var utils     = require("./lib/utils.js"),
    intervals = require("../data/intervals.json"),
    tones     = require("./lib/tones.js");

var tTET = require('../data/12-tet.json');

var hideElementWhenIdle = utils.debounce(function($element){
          $element.removeClass('visible');
    }, 5000);

function animateOvertone(el, duration) {
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
    
    // Fills up the note name
    $('#note-name').text( note[0] );
    // Fills up the note octave
    $('#note sub').text( note[1] );
    
    // Fills up the bar indicating the cents difference: a difference of 0
    // would have the pointer at the center, with the extremes being 50
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

function playIntervalOnSpiral(tones, idx) {
    if ( !tones.length )
        return;
        
    tones[0].play();
    animateOvertone( $('.overtone')[idx - 1], tones[0].envelope );

    if( App.options.groupNotes ) {
        tones[1].play();
        animateOvertone( $('.overtone')[idx], tones[1].envelope );
    }
    else {
        setTimeout( function(){
            tones[1].play();
            animateOvertone( $('.overtone')[idx], tones[1].envelope );
        }, 250);
    }
}

function playIntervalOnAxis(interval, tone) {
      tones.playFrequency( App.baseTone.frequency );
      animateOvertone( $('.overtone')[0], App.baseTone.envelope );

      /*
       * Notes are grouped
       */
      if( App.options.groupNotes ){
          if( App.options.octaveReduction ) {
              tone.play();
              animateOvertone( $('.overtone')[interval - 1], tone.envelope );
          }
          else {
              // Loop through the first overtone and all the octaves of the same interval
              while( $('#overtone-' + interval).length ) {
                  tones.playFrequency( interval * App.baseTone.frequency );
                  animateOvertone( $('.overtone')[interval - 1], tone.envelope );
                  interval = interval * 2;
               }
              
              tone.remove();
          }
      }
      /*
       * Notes are played sequentially
       */
      else {
          if( App.options.octaveReduction ){
              setTimeout(function(){
                  tone.play();
                  animateOvertone( $('.overtone')[interval - 1], tone.envelope );
              }, 250);
          }
          else {
              var axisIntervals = [];
              
              // Push into an array all the octaves of the same interval present
              // on one particular axis
              while( $('#overtone-' + interval).length ) {
                  axisIntervals.push(interval);
                  interval = interval * 2;
              }
              
              // For each of them, play them sequentially with a delay of 250ms
              axisIntervals.forEach(function(interval, idx){
                  setTimeout(function(){
                      tones.playFrequency( interval * App.baseTone.frequency );
                      animateOvertone( $('.overtone')[interval - 1], tone.envelope );
                  }, 250 * (idx + 1));
              });
              
              tone.remove();
          }
      }
}

function toggleOption(option) {
    App.options[option] = !App.options[option];
    $('[data-option=' + option + ']').toggleClass('off');
}

function init() {
    $('.overtone').on('click', function(){
        var idx           = $(this).index() + 1,
            self          = this,
            noteFrequency = idx * App.baseTone.frequency,
            tone          = tones.createSound(noteFrequency);

        if( App.options.octaveReduction )
            tone.reduceToSameOctaveAs(App.baseTone);

        tone.play();

        animateOvertone( self, tone.envelope );

        fillSoundDetails(tone);
    });

    $('.spiral-piece').on('click', function(){
          var idx         = $(this).index() + 1,
          firstTone       = tones.createSound(idx * App.baseTone.frequency),
          secondTone      = tones.createSound( (idx + 1)  * App.baseTone.frequency );

      if( App.options.octaveReduction ){
          firstTone.reduceToSameOctaveAs(App.baseTone, true);
          secondTone.reduceToSameOctaveAs(App.baseTone);
      }

      playIntervalOnSpiral( [firstTone, secondTone], idx );

      fillSoundDetails( [firstTone, secondTone] );
    });

    $('.axis').on('click', function(){
      var interval = parseInt( $(this).data('interval') ),
          tone = tones
                 .createSound(interval * App.baseTone.frequency)
                 .reduceToSameOctaveAs(App.baseTone);

      playIntervalOnAxis(interval, tone);

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

    $('[data-option]').on('click', function(){
      toggleOption( $(this).data('option') );
    });
}

var App = {
    baseTone: tones.createSound( $('#base').val() ),
    init:     init,
    options: {
        groupNotes:      true,
        octaveReduction: false
    }
};

module.exports = App;