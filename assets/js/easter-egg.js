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

var oldSoundsGainValues;

/*
 * Dampens all the playing sounds volumes.
 *
 * @return void
 */
function dampenAllSounds() {
	var now = Tones.context.currentTime;
	
	oldSoundsGainValues = [];
	
	Tones.sounds
		.slice(1, Tones.sounds.length)
		.forEach(function(sound) {
			oldSoundsGainValues.push(sound.envelope.node.gain.value);
		
			sound.envelope.node.gain.setTargetAtTime(0, now, 0.25);
		});
}

/*
 * Restores the sound volume of all the sounds to what they were before.
 *
 * @return void
 */
function restoreSoundsVolume() {
	var now = Tones.context.currentTime;
	
	Tones.sounds
		.slice(1, Tones.sounds.length)
		.forEach(function(sound, i) {
			sound.envelope.node.gain.setTargetAtTime(
				oldSoundsGainValues[i], 
				now,
				3
			);
		});
}

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
	
	dampenAllSounds();
	
	// Equal temperament
	Tones.playFrequenciesSequence(
		[780, 739, 622, 440, 415, 659, 830, 1046],
		opts
	);
	
	// Just intonation
	Tones.playFrequenciesSequence(
		[780, 731.25, 624, 438, 416, 650, 832, 1040],
		opts
	).then(function(){
		restoreSoundsVolume();
	});
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