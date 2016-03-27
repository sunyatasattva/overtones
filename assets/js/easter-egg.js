/**
 * Easter egg module
 *
 * Manages easter eggs across the application.
 *
 * @module
 */

var $     = require("jquery");
var once  = require("./lib/once");
var Tones = require("./lib/tones");

/**
 * Plays the Easter Egg unlocked secret music.
 *
 * @return void
 */
function secretMusic(){
	var opts = {
		attack: 75,
		decay: 100
	};
	
	// Equal temperament
	Tones.playFrequency(780, opts)
	.then( ()=>Tones.playFrequency(739, opts) )
	.then( ()=>Tones.playFrequency(622, opts) )
	.then( ()=>Tones.playFrequency(440, opts) )
	.then( ()=>Tones.playFrequency(415, opts) )
	.then( ()=>Tones.playFrequency(659, opts) )
	.then( ()=>Tones.playFrequency(830, opts) )
	.then( ()=>Tones.playFrequency(1046, opts) )
	
	// Just intonation
	Tones.playFrequency(780, opts)
	.then( ()=>Tones.playFrequency(731.25, opts) )
	.then( ()=>Tones.playFrequency(624, opts) )
	.then( ()=>Tones.playFrequency(438, opts) )
	.then( ()=>Tones.playFrequency(416, opts) )
	.then( ()=>Tones.playFrequency(650, opts) )
	.then( ()=>Tones.playFrequency(832, opts) )
	.then( ()=>Tones.playFrequency(1040, opts) )
}

module.exports = {
	init: function() {
		// Closes the "easter egg found" announcement div on click on close link
		$(".easter-egg-announcement .shepherd-cancel-link").on("click", function(e){
			e.preventDefault();
			
			$(this).closest(".easter-egg-announcement").removeClass("show");
		});
		
		// When all overtones are played together, unlock the easter egg
		$(document).on("overtones:play:all", function(){
			// Only show the "easter egg found" once
			once(function(){ $(".easter-egg-announcement").addClass("show"); }, 'easterEggFound');
			
			$("body").addClass("easter-egg");
			secretMusic();
			
			$(".share-easter-egg").on("click", function(e){
				e.preventDefault();
				try {
					FB.ui({
						method:  "share",
						href:    "http://www.suonoterapia.org/overtones"
					}, function(response){
						$(".easter-egg-announcement").removeClass("shepherd-open");
						
						$(document).trigger("overtones:easteregg:share")
					});
				}
				catch(e){ $(".easter-egg-announcement").removeClass("shepherd-open"); }
			});
		});
	}
}