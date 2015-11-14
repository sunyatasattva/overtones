window.tones = require("./tones.js");

var utils = require("./utils.js");

var tTET = require('./12-tet.json');

$(document).ready(function($){
    
  $('.overtone').on('click', function(){
      var baseFrequency = $('#base').val(),
          idx           = $(this).index() + 1;
      console.log(baseFrequency);
      var tone = tones.playFrequency( idx * baseFrequency );
      
      // @todo obviously clean this up
      var frequencies      = utils.values(tTET),
          closestFrequency = utils.binarySearch( idx * baseFrequency, frequencies),
          note             = utils.findKey( tTET, function(frequency){ return frequency === closestFrequency } ).split(/(\d)/),
          centsDifference  = tone.intervalInCents( { frequency: closestFrequency } );
      
      $('#note-name').text(note[0]);
      $('#note sub').text(note[1]);
      $('#cents-difference')
          .css('text-indent', centsDifference + "%")
          .find('span')[0].innerHTML = centsDifference > 0 ? "+" + centsDifference : centsDifference;

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