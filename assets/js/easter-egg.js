var $     = require("jquery");
var once  = require("./lib/once");
var Tones = require("./lib/tones");

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
		$(".easter-egg-announcement .shepherd-cancel-link").on("click", function(e){
			e.preventDefault();
			
			$(this).closest(".easter-egg-announcement").removeClass("show");
		});
		
		$(document).on("overtones:play:all", function(){
			once(function(){ $(".easter-egg-announcement").addClass("show"); }, 'easterEggFound');
			
			$("body").addClass("easter-egg");
			secretMusic();
			
			$(".share-easter-egg").on("click", function(e){
				e.preventDefault();
				try {
					FB.ui({
					  method:  "feed",
					  link:    "http://www.suonoterapia.org/overtones",
					  caption: "I've found the secret overtone rainbow, can you also find it?",
					}, function(response){
						console.log(response);
						$(".easter-egg-announcement").removeClass("shepherd-open");
						
						$(document).trigger("overtones:easteregg:share")
					});
				}
				catch(e){ $(".easter-egg-announcement").removeClass("shepherd-open"); }
			});
		});
	}
}