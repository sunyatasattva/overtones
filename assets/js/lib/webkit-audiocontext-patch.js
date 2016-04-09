/**
 * Patch to port old implementation of `webkitAudioContext`
 * to standards based `audioContext`.
 *
 * Props to Lajos György Mészáros <m_lajos@hotmail.com> for this patch.
 * @see https://github.com/meszaros-lajos-gyorgy/meszaros-lajos-gyorgy.github.io/blob/master/microtonal/monochord/js/webkit-audio-context-patch.js
 */

/* globals OscillatorNode */

"use strict";

module.exports = function(){
	if( !window.hasOwnProperty("AudioContext") &&
	    window.hasOwnProperty("webkitAudioContext") ){
		var a = window.AudioContext = window.webkitAudioContext;
		
		if(!a.prototype.hasOwnProperty("createGain")){
			a.prototype.createGain = a.prototype.createGainNode;
		}
		
		if(!OscillatorNode.prototype.hasOwnProperty("start")){
			OscillatorNode.prototype.start = OscillatorNode.prototype.noteOn;
		}
		// make the first parameter optional for firefox <30
		var oldStart = OscillatorNode.prototype.start;
		OscillatorNode.prototype.start = function(t){
			oldStart(t || 0);
		};
		
		if(!OscillatorNode.prototype.hasOwnProperty("stop")){
			OscillatorNode.prototype.stop = OscillatorNode.prototype.noteOff;
		}
		// make the first parameter optional for firefox <30
		var oldStop = OscillatorNode.prototype.stop;
		OscillatorNode.prototype.stop = function(t){
			oldStop(t || 0);
		};
		
		Object.defineProperty(OscillatorNode.prototype, "type", {
			get : function(){
				return ["sine", "square", "sawtooth", "triangle", "custom"][this.type];
			},
			set : function(type){
				this.type = OscillatorNode.prototype[type.toUpperCase()];
			}
		});
	}
};