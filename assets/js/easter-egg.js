var $    = require("jquery");
var once = require("./lib/once");

module.exports = {
	init: function() {
		$(document).on("overtones:play:all", function(){
			once(function(){ $(".easter-egg-announcement").addClass("shepherd-open"); }, 'easterEggFound');
			
			$("body").addClass("easter-egg");
			$(".share-easter-egg").on("click", function(e){
				e.preventDefault();
				try {
					FB.ui({
					  method:  "feed",
					  link:    "http://www.suonoterapia.org/overtones",
					  caption: "I've found the secret overtone rainbow, can you also find it?",
					}, function(response){
						console.log(response);
						$(document).trigger("overtones:easteregg:share")
						$(".easter-egg-announcement").removeClass("shepherd-open");
					});
				}
				catch(e){ $(".easter-egg-announcement").removeClass("shepherd-open"); }
			});
		});
	}
}