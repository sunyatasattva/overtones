'use strict';

var jQuery = require('jquery');
window.dataLayer = window.dataLayer || [];

module.exports = function($){
	$(document)
	.on('overtones:play overtones:options:change', function(e){
    	window.dataLayer.push({ event: e.type, data: e.details });
  	})
	.on('overtones:help:show overtones:help:close overtones:help:complete overtones:help:denied', function(e){
		var action = e.type.split(':')[2],
			target = e.target.classList ? e.target.classList[0] : e.target;

		e.idx = e.idx || null;

		window.dataLayer.push({ event: e.type, idx: e.idx, action: action, target: target });
  	});
};