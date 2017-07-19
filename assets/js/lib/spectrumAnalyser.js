"use strict";

var peakDetector = require("slayer");
var audioCtx = new (window.AudioContext || window.webkitAudioContext)(),
	analyser = audioCtx.createAnalyser(),
	bufferLength,
	dataArray,
	source;

function init(stream) {
	source = audioCtx.createMediaStreamSource(stream);
	
	analyser.maxDecibels = -10;
	analyser.minDecibels = -70;
	analyser.fftSize     = 2048;
	
	source.connect(analyser);
	
	bufferLength = analyser.frequencyBinCount / 2;
	dataArray    = new Uint8Array(bufferLength);
}

function analyse(dataArray) {
	return peakDetector( { minPeakDistance: 3 } )
		.x( (val, i) => i * (audioCtx.sampleRate/analyser.fftSize) )
		.fromArray( Array.from(dataArray) )
		.then( peaks => {
			var harmonicSpectrum = new Array(16).fill(0),
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
			}

			return {
				fundamental: lowestPeak,
				spectrum:    harmonicSpectrum
			}
		} );
}

function update(cb) {
	requestAnimationFrame(() => update(cb));

	analyser.getByteFrequencyData(dataArray);
	cb( analyse(dataArray) );
}

module.exports = {
	analyse: analyse,
	init:    init,
	update:  update
};