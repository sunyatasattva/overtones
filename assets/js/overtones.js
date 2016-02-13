/**
 *  Overtones module
 *
 * @module
 */

"use strict";

var jQuery,
    App;

var $ = jQuery = require("jquery");

require("velocity-animate");
require("jquery.animate-number");

var utils     = require("./lib/utils.js"),
    intervals = require("../data/intervals.json"),
    tones     = require("./lib/tones.js"),
    $         = require("jquery");

var tTET = require("../data/12-tet.json");

/**
 * Will hide the elements if this function is not called again for 5 seconds
 *
 * @function
 *
 * @param  {jQuery}  $element  The jQuery object of the element
 */
var hideElementWhenIdle = utils.debounce(function($element){
          $element.removeClass("visible");
    }, 5000);

/**
 * Animates an overtone for a given duration
 *
 * @param  {string}  el        Element selector
 * @param  {number}  duration  Duration of the animation in milliseconds
 *
 * @return  void
 */
function animateOvertone(el, duration) {
    var $el              = $(el),
        $spacesGroup     = $el.find(".spaces"),
        // We'll animate the circles from the inner to the outer, that's
        // why we are reversing the array
        $circles         = $( $spacesGroup.find("g").get().reverse() ),
        numbersOfCircles = $circles.length,
        originalFill     = utils.rgbToHex( $spacesGroup.css("fill") ),
        fillColor        = "#FFE08D";

    // If it's already animating, it won't animate again
    if( $el.find(".velocity-animating").length )
        return;

    el.classList.add("active");
    
    // If there are no inner circles, the animation only fills the spaces
    // with the fillColor
    if( !numbersOfCircles ) {
        $.Velocity( $spacesGroup, {
            fill: fillColor
        }, { duration: duration.attack * 1000 } )
        .then( function(spaces){
            $.Velocity( spaces, { fill: originalFill });
            el.classList.remove("active");
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
                    el.classList.remove("active");
            }, { duration: duration.release * 1000 } );
        });
    }
}

/**
 * Shows the difference between a tone and its closest frequency in a given tuning.
 *
 * @todo  Implement tuning parameter
 * @todo  Refactor this to actually return something interesting
 *
 * @param  {Sound}  tone  The Sound object
 *
 * @return  void
 */
function showIntervalDifferenceWithTuning(tone, tuning) {
    var tuning = tuning || "12-TET", // @todo this doesn't do anything currently, placeholder
        frequencies      = utils.values(tTET),
        closestFrequency = utils.binarySearch(tone.frequency, frequencies),
        centsDifference  = tone.intervalInCents( { frequency: closestFrequency } ),
        note;
    
    note = utils.findKey( tTET, 
        function(frequency){ 
            return frequency === closestFrequency;
        } ).split(/(\d)/);
    
    $("#note-frequency")
    // Set the base number from which to animate to the current frequency
    .prop( "number", $("#note-frequency").text().match(/\d+/)[0] )
    .animateNumber({
        number:     tone.frequency,
        numberStep: function(now, tween){
           var flooredNumber = Math.floor(now),
               $target        = $(tween.elem);
    
           $target.text(flooredNumber + " Hz");
     }
    }, 200);
    
    // Fills up the note name
    $("#note-name").text( note[0] );
    // Fills up the note octave
    $("#note sub").text( note[1] );
    
    // Fills up the bar indicating the cents difference: a difference of 0
    // would have the pointer at the center, with the extremes being 50
    $(".cents-difference.tuning")
    .css("text-indent", centsDifference + "%")
    .find(".cents").prop( "number", $(".tuning .cents").text() ).animateNumber({
        number: centsDifference,
        numberStep: function(now, tween){
            var flooredNumber = Math.floor(now),
                target = tween.elem;
            target.innerHTML = flooredNumber > 0 ? "+" + flooredNumber : flooredNumber;
        }
    }, 200);
    
    $(".tuning .cent-bar").css("left", 50 + centsDifference / 2 + "%");
    
    console.log(note[0], closestFrequency, centsDifference);
}

/**
 * Shows the interval name between two tones
 *
 * @param  {Sound}  firstTone
 * @param  {Sound}  secondTone
 *
 * @return  {string}  The interval name;
 */
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
    
    $("#interval-name").text(intervalName);
    
    $("#interval sup").text( ratio[1] );
    $("#interval sub").text( ratio[2] );
    
    $(".cents-difference.interval")
        .css("text-indent", centsDifference / 12 + "%")
        .find(".cents").prop( "number", $(".interval .cents").text() )
        .animateNumber( {number: centsDifference }, 200 );
    
    $(".interval .cent-bar").css("left", centsDifference / 12 + "%");
    
    return intervalName;
}

/**
 * Fills in the sound details
 *
 * It will show the sound details section and make sure that it disappears if idle.
 * If an array is passed, it will show the interval information between the first two,
 * otherwise it will show the sound information with the difference with 12-TET tuning.
 *
 * @param  {Sound[]|Sound}  A single Sound or an Array of Sounds.
 *
 * @return  void
 */
function fillSoundDetails(tones) {
    $("#sound-details").addClass("visible");
    hideElementWhenIdle( $("#sound-details") );
    
    if( !tones.length ) {
        $("#sound-details").addClass("show-note").removeClass("show-interval");
        showIntervalDifferenceWithTuning(tones);
    }
    else {
        $("#sound-details").addClass("show-interval").removeClass("show-note");
        showIntervalName( tones[0], tones[1] );
    }    
}

/**
 * Will play an interval and animate two overtones.
 *
 * If `overtones.options.groupNotes` is set to `true` will play the sounds
 * together, otherwise with a small delay of 250ms.
 *
 * @param  {Sound[]}  tones  An Array of Sounds, will play the first two.
 * @param  {int}      idx    The index of the spiral piece within the overtone spiral
 *
 * @return  void
 */
function playIntervalOnSpiral(tones, idx) {
    if ( !tones.length )
        return;
        
    tones[0].play();
    animateOvertone( $(".overtone")[idx - 1], tones[0].envelope );

    if( App.options.groupNotes ) {
        tones[1].play();
        animateOvertone( $(".overtone")[idx], tones[1].envelope );
    }
    else {
        setTimeout( function(){
            tones[1].play();
            animateOvertone( $(".overtone")[idx], tones[1].envelope );
        }, 250);
    }
}

/**
 * Plays a certain interval over an axis of the overtone spiral
 *
 * So it will play all the displayed octaves of that same interval. Notes
 * can be played sequentially or grouped depending on the value of the
 * `overtones.options.groupNotes` option.
 *
 * @param  {number}  interval  The interval with the fundamental tone
 * @param  {Sound}   tone      The first iteration of the tone on the axis
 *
 * @return  void
 */
function playIntervalOnAxis(interval, tone) {
      tones.playFrequency( App.baseTone.frequency );
      animateOvertone( $(".overtone")[0], App.baseTone.envelope );

      /*
       * Notes are grouped
       */
      if( App.options.groupNotes ){
          if( App.options.octaveReduction ) {
              tone.play();
              animateOvertone( $(".overtone")[interval - 1], tone.envelope );
          }
          else {
              // Loop through the first overtone and all the octaves of the same interval
              while( $("#overtone-" + interval).length ) {
                  tones.playFrequency( interval * App.baseTone.frequency );
                  animateOvertone( $(".overtone")[interval - 1], tone.envelope );
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
                  animateOvertone( $(".overtone")[interval - 1], tone.envelope );
              }, 250);
          }
          else {
              var axisIntervals = [];
              
              // Push into an array all the octaves of the same interval present
              // on one particular axis
              while( $("#overtone-" + interval).length ) {
                  axisIntervals.push(interval);
                  interval = interval * 2;
              }
              
              // For each of them, play them sequentially with a delay of 250ms
              axisIntervals.forEach(function(interval, idx){
                  setTimeout(function(){
                      tones.playFrequency( interval * App.baseTone.frequency );
                      animateOvertone( $(".overtone")[interval - 1], tone.envelope );
                  }, 250 * (idx + 1));
              });
              
              tone.remove();
          }
      }
}

/**
 * Toggles an option value (also updates the controls)
 *
 * @param  {string}  option  The option name
 *
 * @return {bool}  The new option state
 */
function toggleOption(option) {
    App.options[option] = !App.options[option];
    $("[data-option=" + option + "]").toggleClass("off");
    
    return App.options[option];
}

/**
 * Updates the Fundamental tone frequency
 *
 * Makes sure that the controls are updated.
 *
 * @param  {number}  val    A frequency value
 * @param  {bool}    [mute] Unless set to `true` a sound will play with the new frequency
 *                          also animating the middle overtone circle
 *
 * @return {number}  The new frequency
 */
function updateBaseFrequency(val, mute) {
    var frequency = Math.floor(val);
    App.baseTone = tones.createSound(frequency);
    $("#base, #base-detail").val(frequency);
    
    if( !mute )
        $("#overtone-1").click();
    
    return frequency;
}

/**
 * Updates the Master Volume
 *
 * @param  {number}  val    A volume value (scale 1–100)
 * @param  {bool}    [mute] Unless set to `true` a sound will play with the new volume
 *
 * @return {number}  The new volume (scale 0–1)
 */
function updateVolume(val, mute) {
    val /= 100;

    App.currentVolume = val;
    tones.masterGain.gain.setValueAtTime(App.currentVolume, tones.context.currentTime);
    if (!mute) tones.playFrequency( App.baseTone.frequency );
    
    return val;
}

/**
 * Click Handler for Overtone circle.
 *
 * It will play and animate the overtone clicked and fill the sound details
 * for that sound.
 *
 * @see  {@link animateOvertone}
 *
 * @return  void
 */
function overtoneClickHandler() {
    var idx           = $(this).index() + 1,
        self          = this,
        noteFrequency = idx * App.baseTone.frequency,
        tone          = tones.createSound(noteFrequency);

    if( App.options.octaveReduction )
        tone.reduceToSameOctaveAs(App.baseTone);

    tone.play();

    animateOvertone( self, tone.envelope );

    fillSoundDetails(tone);
}

/**
 * Click Handler for Spiral piece connecting two overtones
 *
 * It will play the two sounds connected by the spiral piece and fill the sound
 * details for the interval between the two.
 *
 * @see  {@link playIntervalOnSpiral}
 *
 * @return  void
 */
function spiralPieceClickHandler() {
    var idx         = $(this).index() + 1,
        firstTone   = tones.createSound(idx * App.baseTone.frequency),
        secondTone  = tones.createSound( (idx + 1)  * App.baseTone.frequency );

    if( App.options.octaveReduction ){
      firstTone.reduceToSameOctaveAs(App.baseTone, true);
      secondTone.reduceToSameOctaveAs(App.baseTone);
    }

    playIntervalOnSpiral( [firstTone, secondTone], idx );

    fillSoundDetails( [firstTone, secondTone] );
}

/**
 * Click Handler for Overtone Axis
 *
 * It will play an interval repeated on the axis and fill in the sound details
 * for that interval
 *
 * @see  {@link playIntervalOnAxis}
 *
 * @return  void
 */
function axisClickHandler() {
    var interval = parseInt( $(this).data("interval") ),
        tone = tones
               .createSound(interval * App.baseTone.frequency)
               .reduceToSameOctaveAs(App.baseTone);

    playIntervalOnAxis(interval, tone);

    fillSoundDetails( [App.baseTone, tone] );
}

/**
 * Initializes the application
 *
 * Sets the master gain volume to the slider bar, attaches the event handlers to the
 * overtone spiral SVG and to the options buttons.
 *
 * @return  void
 */
function init() {
    updateVolume( $("#volume-control").val(), true );
    
    $(".overtone").on("click", overtoneClickHandler);
    $(".spiral-piece").on("click", spiralPieceClickHandler);
    $(".axis").on("click", axisClickHandler);
    
    $("#base, #base-detail").on("change", function(){
      updateBaseFrequency( $(this).val() );
    });

    $("#volume-control").on("change", function(){
      updateVolume( $(this).val() );
    });

    $("[data-option]").on("click", function(){
      toggleOption( $(this).data("option") );
    });
}

var App = {
    /**
     * The fundamental tone from which to calculate the overtones values
     *
     * @alias module:overtones.baseTone
     *
     * @type  {Sound}
     */
    baseTone: tones.createSound( $("#base").val() ),
    init:     init,
    /**
     * @alias module:overtones.options
     *
     * @type {object}
     * @property  {bool}  groupNotes      If set to `true`, it will play the notes
     *                                    at the same time.
     * @property  {bool}  octaveReduction If set to `true` all notes will be played
     *                                    on the same octave of the fundamental tone.
     *                                    See {@link baseTone}.
     */
    options: {
        groupNotes:      true,
        octaveReduction: false
    },
    /**
     * Frequency data for various tunings
     *
     * @alias module:overtones.tunings
     *
     * @type {object}
     * @property  {Object}  _12TET  12-TET frequency data
     */
    tunings: {
        _12TET: tTET
    }
};

module.exports = App;