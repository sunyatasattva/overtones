/**
 * Spectrum Analyser module
 *
 * @module
 */

'use strict';

var peakDetector = require('slayer');

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
var canvas    = document.createElement('canvas'),
	canvasCtx = canvas.getContext('2d');

canvas.id     = 'spectrum-analyser-debug';
canvas.width  = 640;
canvas.height = 100;
canvas.setAttribute('style', 'position: fixed; bottom: 0; left: 0'); 

document.querySelector('body').append(canvas);

/*
 * Compares whether two set of harmonic spectrums share the same harmonics.
 *
 * Doesn't matter the amplitude, but they need to be both either at 0 amplitude or
 * both at an amplitude more than 0.
 *
 * @param  {Array}  a  The first set of harmonics as an array of amplitudes.
 * @param  {Array}  b  The second set of harmonics.
 *
 * @return {bool}  True if the arrays share the same harmonic composition.
 */
function _compareHarmonics(a, b) {
	return !!a.reduce(
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

/*
 * Initializes the analyser.
 *
 * Sets the options for the analyser precision and sensitivity and then creates a
 * Fast Fourier Transform from the source stream.
 *
 * @param  {MediaStream}  stream  The media stream containing the audio track.
 * @param  {Object}       opts
 * @param  {bool}         [opts.debug=false]     Whether to run the analyser in debug
 *                                               mode. See {@link analyse}.
 * @param  {Number}       [opts.fftSize=2048]    The number of bins in the FFT.
 * @param  {Number}       [opts.maxDecibels=-10] The maximum dB sensitivity.
 * @param  {Number}       [opts.minDecibels=-70] The minimum dB sensitivity.
 * @param  {Number}       [opts.resolution=16]   The number of overtones that will
 *                                               be taken in consideration.
 *
 * @return void
 */
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

/*
 * @typedef  {Object}  HarmonicSpectrum
 *
 * @property {Number}  confidence   A number representing the confidence of the
 *                                  analysed harmonic structure.
 * @property {Number}  fundamental  The frequency of the fundamental.
 * @property {Array}   spectrum     The array containing the spectrum, where each
 *                                  index corresponds to a partial, and the value
 *                                  to its amplitude relative to the loudest one.
 */

/*
 * Analyses a snapshot of a Fast Fourier Transformed waveform.
 *
 * It first calculates the frequency slices of the the FFT and then tries to
 * identify peaks in the spectrum that are slightly further away from each other
 * It assumes that, given a sound with harmonic partials, the peaks should be
 * integer multiples of each other and that the peak lowest in frequency is the
 * fundamental sound.
 *
 * It then creates an array representing the harmonic spectrum and the amplitude
 * of each harmonic relative to the loudest one (from 0 to 1). It compares the
 * spectrum with the last identified one, and, if they have the same harmonic
 * components, it will increase the confidence and reset the uncertainty. If they
 * are not, the uncertainty is increased and: if the uncertainty is larger than 5,
 * it will reset the confidence to 0, otherwise it will just halve the current
 * confidence.
 *
 * If in `debug` mode, it will output the harmonic spectrum and the current
 * confidence level to the console. See {@link _draw}.
 *
 * @param  {Uint8Array}  dataArray  A data array containing the FFT waveform.
 *
 * @return {HarmonicSpectrum}  The Analysed Harmonic spectrum from the waveform.
 */
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
				
				if( _compareHarmonics(harmonicSpectrum, lastHarmonicSpectrum) ) {
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

/*
 * Draws a visual representation of the waveform, its peaks and its confidence.
 *
 * The more the analyser is confident in the harmonic structure, the greener
 * the bars will appear to be.
 *
 * @return void
 */
function _draw() {
	let barWidth = (canvas.width / bufferLength) * 2.5,
		x        = 0,
		barHeight;
	
	canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
	
	for(var i = 0; i < bufferLength; i++) {
		barHeight = dataArray[i];
		
		canvasCtx.fillStyle = `rgba(50, ${confidence * 15}, ${confidence * 5}, ${barHeight / 50})`;
		
		canvasCtx.fillRect(
			x, 
			canvas.height - barHeight / 2,
			barWidth,
			barHeight / 2
		);

		x += barWidth + 1;
	}
}

/*
 * Stops analysing and clears the debug canvas.
 *
 * @return void
 */
function stop() {
	cancelAnimationFrame(requestID);
	
	if(debugMode) {
		canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
	}
}

/*
 * Updates the analyser each animation frame.
 *
 * @param  {Function}  cb  The callback to call at each frame. See {@link analyse}.
 *
 * @return void
 */
function update(cb) {
	requestID = requestAnimationFrame(() => update(cb));

	analyser.getByteFrequencyData(dataArray);
	cb( analyse(dataArray) );
	
	if(debugMode) {
		_draw();
	}
}

module.exports = {
	analyse: analyse,
	init:    init,
	stop:    stop,
	update:  update
};