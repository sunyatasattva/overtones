var jQuery = require("jquery");
window.dataLayer = window.dataLayer || [];

module.exports = function($){
	$(document)
	.on('overtones:play overtones:options:change', function(e){
    	dataLayer.push({ event: e.type, data: e.details });
  	})
	.on('overtones:help:show overtones:help:close overtones:help:complete', function(e){
		e.idx = e.idx || null;
		
    	dataLayer.push({ event: e.type, idx: e.idx });
  	});
}