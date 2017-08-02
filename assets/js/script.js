/* globals Overtones */

"use strict";

var jQuery    = require("jquery"),
    browser   = require("detect-browser"),
    analytics = require("./analytics"),
    tour      = require("./shepherd.conf.js"),
	social    = require("./social"),
    easterEgg = require("./easter-egg");

window.Tones     = require("./lib/tones");
window.Overtones = require("./overtones");

navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia || 
                          navigator.msGetUserMedia);


jQuery(document).ready(function($){
	Overtones.init();
	tour.init();
	analytics($);
	social.init();

	easterEgg.init();
});