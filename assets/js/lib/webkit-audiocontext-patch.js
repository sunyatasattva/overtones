/**
 * Patch to port old implementation of `webkitAudioContext`
 * to standards based `audioContext`.
 *
 * Props to Lajos György Mészáros <m_lajos@hotmail.com> for this patch, 
 * although some edits were needed to make it work.
 * @see https://github.com/meszaros-lajos-gyorgy/meszaros-lajos-gyorgy.github.io/blob/master/microtonal/monochord/js/webkit-audio-context-patch.js
 */

"use strict";

module.exports = function(){
	var AudioContext,
		OscillatorNode,
		oldStart,
		oldStop;
	
	if( !window.hasOwnProperty("AudioContext") &&
	    window.hasOwnProperty("webkitAudioContext") ){
		AudioContext   = window.AudioContext = window.webkitAudioContext;
		OscillatorNode = window.OscillatorNode;
		
		if(!AudioContext.prototype.hasOwnProperty("createGain")){
			AudioContext.prototype.createGain = AudioContext.prototype.createGainNode;
		}
		
		if(!OscillatorNode.prototype.hasOwnProperty("start")){
			OscillatorNode.prototype.start = OscillatorNode.prototype.noteOn;
		}
		
		// make the first parameter optional for firefox <30
		oldStart = OscillatorNode.prototype.start;
		OscillatorNode.prototype.start = function(t = 0){
			oldStart.call(this, t);
		};
		
		if(!OscillatorNode.prototype.hasOwnProperty("stop")){
			OscillatorNode.prototype.stop = OscillatorNode.prototype.noteOff;
		}
		
		// make the first parameter optional for firefox <30
		oldStop = OscillatorNode.prototype.stop;
		OscillatorNode.prototype.stop = function(t = 0){
			oldStop.call(this, t);
		};
		
		Object.defineProperty(OscillatorNode.prototype, "type", {
			get: function() {
				return ["sine", "square", "sawtooth", "triangle", "custom"][this.type];
			},
			set: function(type) {
				this.type = OscillatorNode.prototype[type.toUpperCase()] || type;
			}
		});
	}
};