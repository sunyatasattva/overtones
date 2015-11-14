var extend   = require('lodash.assign'),
    ctx      = new (window.AudioContext || window.webkitAudioContext)(),
    defaults = {
        attack:  150,
        decay:   200,
        sustain: 0,
        release: 300,
        volume:  1,
        detune:  0,
        type:    'sine'
    },
    sounds = []; // @todo push sounds here as they are created and pop them as they are erased

function _createEnvelope(attack, decay, sustain, release) {
    var gainNode = ctx.createGain();
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    
    return {
        node:    gainNode,
        attack:  attack / 1000,
        decay:   decay / 1000,
        sustain: sustain / 1000,
        release: release / 1000
    }
}

function _createOscillator(frequency, detune, type) {
    var oscillatorNode = ctx.createOscillator();
    
    oscillatorNode.frequency.value = frequency;
    oscillatorNode.detune.value    = detune;
    oscillatorNode.type            = type;
    
    return oscillatorNode;
}

function _getSoundProperties(oscillator, envelope) {
    return {
        envelope: {
            attack:  envelope.attack * 1000,
            decay:   envelope.decay * 1000,
            sustain: envelope.sustain * 1000,
            release: envelope.release * 1000
        },
        frequency: oscillator.frequency.value,
        detune:    oscillator.detune.value,
        waveType:  oscillator.type
    }
}

function stopSound(oscillator, envelope) {
    oscillator.stop();
    oscillator.disconnect(envelope.node);
    envelope.node.gain.cancelScheduledValues(ctx.currentTime);
    envelope.node.disconnect(ctx.destination);
    
    console.log("Sound stopped");
    
    return _getSoundProperties(oscillator, envelope);
}

function playFrequency(frequency, opts) {
    var opts       = extend( {}, defaults, opts ),
        envelope   = _createEnvelope(opts.attack, opts.decay, opts.sustain, opts.release),
        oscillator = _createOscillator(frequency, opts.detune, opts.type),
        now        = ctx.currentTime,
        soundDuration;
    
    opts.maxVolume = opts.maxVolume || opts.volume;
    
    oscillator.connect(envelope.node);
    envelope.node.connect(ctx.destination);
    
    oscillator.start();
    
    // @todo put an if with opts.exponential = true to use setValueAtTime instead
    
    envelope.node.gain.linearRampToValueAtTime( opts.maxVolume, now + envelope.attack );
    envelope.node.gain.linearRampToValueAtTime( opts.volume, now + envelope.attack + envelope.decay );

    if( envelope.sustain !== null ) {
        soundDuration = envelope.attack + envelope.decay + envelope.sustain + envelope.release;
        
        envelope.node.gain.setValueAtTime( opts.volume, now + envelope.attack + envelope.decay + envelope.sustain );
        envelope.node.gain.linearRampToValueAtTime( 0, now + soundDuration );
        setTimeout( function() {
            stopSound(oscillator, envelope);
        }, soundDuration * 1000 );
    }
    
    return _getSoundProperties(oscillator, envelope);
}

module.exports = {
    context:       ctx,
    playFrequency: playFrequency,
    stopSound:     stopSound
}


/*
(function(window) {
    var tones = {
        context: new (window.AudioContext || window.webkitAudioContext)(),
        attack: 1,
        release: 100,
        volume: 1,
        type: "sine",

        /** 
         * Usage: 
         * notes.play(440);     // plays 440 hz tone
         * notes.play("c");     // plays note c in default 4th octave
         * notes.play("c#");    // plays note c sharp in default 4th octave
         * notes.play("eb");    // plays note e flat in default 4th octave
         * notes.play("c", 2);  // plays note c in 2nd octave
         *
        play: function(freqOrNote, octave) {
            if(typeof freqOrNote === "number") {
                this.playFrequency(freqOrNote);
            }
            else if(typeof freqOrNote === "string") {
                if(octave == null) {
                    octave = 4;
                }
                this.playFrequency(this.map[octave][freqOrNote.toLowerCase()]);
            }
        },

        map: [{
            // octave 0
            "c": 16.351,
            "c#": 17.324,
            "db": 17.324,
            "d": 18.354,
            "d#": 19.445,
            "eb": 19.445,
            "e": 20.601,
            "f": 21.827,
            "f#": 23.124,
            "gb": 23.124,
            "g": 24.499,
            "g#": 25.956,
            "ab": 25.956,
            "a": 27.5,
            "a#": 29.135,
            "bb": 29.135,
            "b": 30.868
        }]
    };

    // need to create a node in order to kick off the timer in Chrome.
    tones.context.createGain();

    if (typeof define === "function" && define.amd) {
        define(tones);
    } else {
       window.tones = tones;
    }

}(window)); */
