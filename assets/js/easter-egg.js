var $    = require("jquery");
var once = require("./lib/once");

module.exports = {
	init: function() {
		$(".easter-egg-announcement .shepherd-cancel-link").on("click", function(e){
			e.preventDefault();
			
			$(this).closest(".easter-egg-announcement").removeClass("show");
		});
		
		$(document).on("overtones:play:all", function(){
			once(function(){ $(".easter-egg-announcement").addClass("show"); }, 'easterEggFound');
			
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
						$(".easter-egg-announcement").removeClass("shepherd-open");
						
						$(document).trigger("overtones:easteregg:share")
					});
				}
				catch(e){ $(".easter-egg-announcement").removeClass("shepherd-open"); }
			});
		});
	}
}