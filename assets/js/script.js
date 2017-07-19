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
	
	var canvas = document.querySelector('.visualizer');
	var canvasCtx = canvas.getContext("2d");
	
	function update(){
        const CONFIDENCE_TRESHOLD = 10;
		const WIDTH = canvas.width;
	    const HEIGHT = canvas.height;
        var confidence = 0;
        var lastHarmonicSpectrum;

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      
    function draw() {
      requestAnimationFrame(draw);

//          let overtonesDetected = harmonicSpectrum.map((envelope) => envelope.overtone);
//          utils.difference(lastHarmonicSpectrum, overtonesDetected).length ? confidence = 0 : confidence++;
//          lastHarmonicSpectrum = overtonesDetected;
          //console.log(harmonicSpectrum, confidence);
        
          //if(confidence > CONFIDENCE_TRESHOLD) {
            
          //}
      
      canvasCtx.fillStyle = 'rgb(0, 0, 0)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      var barWidth = (WIDTH / bufferLength) * 2.5;
      var barHeight;
      var x = 0;

      for(var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
        canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);

        x += barWidth + 1;
      }
    };
		
		draw();
	}
});