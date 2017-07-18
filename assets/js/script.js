/* globals Overtones */

"use strict";

var slayer = require("slayer");

var jQuery    = require("jquery"),
    browser   = require("detect-browser"),
	analytics = require("./analytics"),
    tour      = require("./shepherd.conf.js"),
    utils     = require("./lib/utils"),
	easterEgg = require("./easter-egg");

window.Tones     = require("./lib/tones");
window.Overtones = require("./overtones");

jQuery(document).ready(function($){
    $("body").addClass(browser.name); // This makes me sad, it's 2016 Firefox!
    
    tour.init();
    Overtones.init();
	analytics($);
	
	easterEgg.init();
	
	navigator.getUserMedia = (navigator.getUserMedia ||
                                  navigator.webkitGetUserMedia ||
                                  navigator.mozGetUserMedia || 
                                  navigator.msGetUserMedia);

        // Check that browser supports getUserMedia
        if (navigator.getUserMedia) {
            // Request the microphone
            navigator.getUserMedia({audio:true}, gotStream, noStream);
        } 
        else {
            alert('Sorry, your browser does not support getUserMedia');
        }
	
	var source, audioCtx, analyser;
	
	audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	analyser = audioCtx.createAnalyser();
	analyser.maxDecibels = -10;
	analyser.minDecibels = -70;
	
	var canvas = document.querySelector('.visualizer');
	var canvasCtx = canvas.getContext("2d");
	
	function gotStream(stream){
		 source = audioCtx.createMediaStreamSource(stream);
		 source.connect(analyser);
		
		 update();
	}
	
	function noStream(stream){}
	
	function update(){
        const CONFIDENCE_TRESHOLD = 10;
		const WIDTH = canvas.width;
	    const HEIGHT = canvas.height;
		analyser.fftSize = 2048;
        var bufferLength = analyser.frequencyBinCount / 2;
        var dataArray = new Uint8Array(bufferLength);
        var confidence = 0;
        var lastHarmonicSpectrum;

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      
    function highlightOvertone($overtone, k) {
		let fillColor = "#FFE08D",
		    $spaces   = $overtone.find('.spaces');
		
		$overtone.velocity(
			{ scale: utils.clamp(1.5 * k, 1, 1.5) }, 
			{ duration: 15 }
		);

		$spaces.velocity(
			{ 
				fillBlue: 1/( 1/255 * Math.max(1, k * 2) ),
			},
			{ duration: 15 }
		);
    }

    function draw() {
      requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);
//      var indexOfMaxValue = dataArray.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
      //console.log('Data array', indexOfMaxValue * (audioCtx.sampleRate/analyser.fftSize));
      
      slayer({ minPeakDistance: 3 })
        .x((val, i) => i * (audioCtx.sampleRate/analyser.fftSize))
        .fromArray(Array.from(dataArray)).then(peaks => {
          let lowestPeak  = peaks[0].x,
              loudestPeak = peaks.reduce((loudest, curr) => curr.y > loudest ? curr.y : loudest, 0),
              harmonicSpectrum = peaks.reduce((spectrum, peak) => {
                let i = Math.floor(peak.x / lowestPeak);
                
                spectrum[i] = peak.y / loudestPeak
                
                return spectrum;
              }, new Array(16).fill(0)); // @todo check support for .fill

            console.log(harmonicSpectrum);
//          let overtonesDetected = harmonicSpectrum.map((envelope) => envelope.overtone);
//          utils.difference(lastHarmonicSpectrum, overtonesDetected).length ? confidence = 0 : confidence++;
//          lastHarmonicSpectrum = overtonesDetected;
          //console.log(harmonicSpectrum, confidence);
        
          //if(confidence > CONFIDENCE_TRESHOLD) {
            Overtones.updateBaseFrequency(lowestPeak, true);
            harmonicSpectrum.forEach((partial, i) => {
              let $overtone        = jQuery(".overtone").eq(i),
				  adjustedLoudness = partial * utils.logBase(8, i + 2);
              
                highlightOvertone($overtone, adjustedLoudness);
            });
          //}
        
        });
      
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