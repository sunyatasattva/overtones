window.tones = require("./tones.js");

$(document).ready(function($){
    
  $('.overtone').on('click', function(){
      var baseFrequency = $('#base').val(),
          idx           = $(this).index() + 1;
      console.log(baseFrequency);
      tones.playFrequency( idx * baseFrequency );
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