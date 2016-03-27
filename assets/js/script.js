/* globals Overtones */

"use strict";

var jQuery    = require("jquery"),
    browser   = require("detect-browser"),
	analytics = require("./analytics"),
    tour      = require("./shepherd.conf.js"),
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
		const WIDTH = canvas.width;
	    const HEIGHT = canvas.height;
		analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    var dataArray = new Uint8Array(bufferLength);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
      requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

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