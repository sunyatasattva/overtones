/* globals Overtones */

"use strict";

var jQuery    = require("jquery"),
    browser   = require("detect-browser"),
	analytics = require("./analytics"),
    tour      = require("./shepherd.conf.js"),
    utils     = require("./lib/utils"),
	easterEgg = require("./easter-egg");

window.Tones     = require("./lib/tones");
window.Overtones = require("./overtones");

navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia || 
                          navigator.msGetUserMedia);


jQuery(document).ready(function($){
    $("body").addClass(browser.name); // This makes me sad, it's 2016 Firefox!
    
    tour.init();
    Overtones.init();
	analytics($);
	
	easterEgg.init();
	
	function update(){
        const CONFIDENCE_TRESHOLD = 10;
        var confidence = 0;
        var lastHarmonicSpectrum;

    function draw() {
      requestAnimationFrame(draw);

//          let overtonesDetected = harmonicSpectrum.map((envelope) => envelope.overtone);
//          utils.difference(lastHarmonicSpectrum, overtonesDetected).length ? confidence = 0 : confidence++;
//          lastHarmonicSpectrum = overtonesDetected;
          //console.log(harmonicSpectrum, confidence);
        
          //if(confidence > CONFIDENCE_TRESHOLD) {
            
          //}
    };
		
		draw();
	}
});