"use strict";

var peakDetector = require("slayer");

var audioCtx    = new (window.AudioContext || window.webkitAudioContext)(),
	analyser    = audioCtx.createAnalyser(),
	confidence  = 0,
	uncertainty = 0,
	bufferLength,
	dataArray,
	debugMode,
	lastHarmonicSpectrum,
	overtonesResolution,
	requestID,
	source;

// Debug variables
var canvas    = document.querySelector('.visualizer'),
	canvasCtx = canvas.getContext("2d"),
	canvasW   = canvas.width,
	canvasH   = canvas.height;

function compareHarmonics(a, b) {
	return a.reduce(
		(b, val, i) => {
			if(b) {
				if(val === 0 && b[i] === val) 
					return b;
				else if(val > 0 && b[i] > 0)
					return b;
			}
			
			return false;
		},
		b
	)
}

function init(
	stream,
	{
		debug       = false,
		fftSize     = 2048,
		maxDecibels = -10,
		minDecibels = -70,
		resolution  = 16
	} = {}
) {
	debugMode            = debug;
	overtonesResolution  = resolution;
	lastHarmonicSpectrum = new Array(resolution).fill(0);
	source               = audioCtx.createMediaStreamSource(stream);
	
	analyser.maxDecibels = maxDecibels;
	analyser.minDecibels = minDecibels;
	analyser.fftSize     = fftSize;
	
	source.connect(analyser);
	
	bufferLength = analyser.frequencyBinCount / 2;
	dataArray    = new Uint8Array(bufferLength);
}

function analyse(dataArray) {
	return peakDetector( { minPeakDistance: 3 } )
		.x( (val, i) => i * (audioCtx.sampleRate/analyser.fftSize) )
		.fromArray( Array.from(dataArray) )
		.then( peaks => {
			var harmonicSpectrum = new Array(overtonesResolution).fill(0),
				lowestPeak,
				loudestPeak;
		
			if(peaks.length) {
				lowestPeak    = peaks[0].x,
				loudestPeak   = peaks.reduce( 
					(loudest, val) => val.y > loudest ? val.y : loudest, 
					0
				);
				harmonicSpectrum = peaks.reduce(
					(spectrum, peak) => {
						var i = Math.floor(peak.x / lowestPeak);

						spectrum[i] = peak.y / loudestPeak;

						return spectrum;
					},
					harmonicSpectrum // @todo check support for fill
				);
				
				if( compareHarmonics(harmonicSpectrum, lastHarmonicSpectrum) ) {
					confidence++;
					uncertainty = 0;
				}
				else {
					uncertainty++;
					
					if(uncertainty > 5)
						confidence = 0;
					else
						confidence = Math.floor(confidence / 2);
				}
				
				lastHarmonicSpectrum = harmonicSpectrum;
			}
		
			if(debugMode) {
				console.log(harmonicSpectrum);
				console.log('%c %i', 'color:green', confidence);
			}

			return {
				confidence:  confidence,
				fundamental: lowestPeak,
				spectrum:    harmonicSpectrum
			}
		} );
}

function draw() {
	let barWidth = (canvasW / bufferLength) * 2.5,
		x        = 0,
		barHeight;
	
	canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0, 0, canvasW, canvasH);
	
	for(var i = 0; i < bufferLength; i++) {
		barHeight = dataArray[i];
		
		canvasCtx.fillStyle = `rgba(50, ${confidence * 15}, ${confidence * 5}, ${barHeight / 50})`;
		
		canvasCtx.fillRect(
			x, 
			canvasH - barHeight / 2,
			barWidth,
			barHeight / 2
		);

		x += barWidth + 1;
	}
}

function stop() {
	cancelAnimationFrame(requestID);
	
	if(debugMode) {
		canvasCtx.clearRect(0, 0, canvasW, canvasH);
	}
}

function update(cb) {
	requestID = requestAnimationFrame(() => update(cb));

	analyser.getByteFrequencyData(dataArray);
	cb( analyse(dataArray) );
	
	if(debugMode) {
		draw();
	}
}

module.exports = {
	analyse: analyse,
	init:    init,
	stop:    stop,
	update:  update
};