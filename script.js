window.tones = require("./tones.js");

var utils    = require("./utils.js"),
    Odometer = require("odometer");

var tTET = require('./12-tet.json');

var hideElementWhenIdle = utils.debounce(function($element){
          $element.removeClass('visible');
    }, 5000);

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
      
      $('#sound-details').addClass('visible');
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
      $('#cents-difference')
          .css('text-indent', centsDifference + "%")
          .find('span').prop( 'number', $('#cents').text() ).animateNumber({
               number: centsDifference,
               numberStep: function(now, tween){
                   var floored_number = Math.floor(now),
                       target = tween.elem;

                  target.innerHTML = floored_number > 0 ? "+" + floored_number : floored_number;
               }
          }, 200);

      $('#cent-bar').css('left', 50 + centsDifference / 2 + "%");
      
      console.log(note[0], closestFrequency, centsDifference);
  });
    
  $('.spiral-piece').on('click', function(){
      var baseFrequency = $('#base').val(),
          idx           = $(this).index() + 1;
      console.log(baseFrequency);
      tones.playFrequency( idx * baseFrequency );
      tones.playFrequency( (idx + 1)  * baseFrequency );
  });
    
  $('.axis').on('click', function(){
      var baseFrequency = $('#base').val(),
          interval      = parseInt( $(this).data('interval') );
      console.log(baseFrequency);
      tones.playFrequency( baseFrequency );
      
      while( $('#overtone-' + interval).length ) {
          tones.playFrequency( interval * baseFrequency );
          interval = interval * 2;
       }
  });
  
  $('#base').on('change', function(){
      var val = Math.floor( $(this).val() );
      tones.playFrequency(val);
      $('#base-frequency-label').text(val + "Hz");
  });
});