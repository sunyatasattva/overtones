var extend   = require('lodash.assign'),
    ctx      = new (window.AudioContext || window.webkitAudioContext)(),
    defaults = {
        attack:  150,
        decay:   200,
        sustain: 0,
        release: 1250,
        volume:  0.5,
        detune:  0,
        type:    'sine'
    },
    /*
     * A list of currently active sounds for manipulation
     */
    sounds = [];

/*
 * Creates the ADSR Envelope for the sound
 *
 * The parameters should be passed in milliseconds.
 *
 * @param  {int}  attack  The amount of time the sound will take to reach full amplitude
 * @param  {int}  decay   The amount of time for the sound to reach sustain amplitude after attack
 * @param  {int}  sustain The duration of the sound is kept being played
 * @param  {int}  release The amount of time for the sound to fade out
 *
 * @return {obj}  The envelope object, containing the gain node.
 */
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

/*
 * Creates an Oscillator
 *
 * @param  {int}  frequency     The frequency of the wave
 * @param  {int}  [detune=0]    The number of cents to manipulate the frequency of the wave
 * @param  {str}  [type='sine'] The shape of the wave. Can be ['sine', 'square', 'sawtooth', 'triangle', 'custom']
 *
 * @return {obj}  The oscillator node
 */
function _createOscillator(frequency, detune, type) {
    var oscillatorNode = ctx.createOscillator();
    
    oscillatorNode.frequency.value = frequency;
    oscillatorNode.detune.value    = detune || 0;
    oscillatorNode.type            = type || 'sine';
    
    return oscillatorNode;
}

/*
 * Given the oscillator and the envelope, returns an object with their main properties
 *
 * @param  {obj}  oscillator  The oscillator node
 * @param  {obj}  envelope    The envelope object
 *
 * @return {obj}  The sound properties
 *
 * @todo Is this necessary? Can it be improved with methods for the sound itself? Maybe stop should be moved here?
 */
function _getSoundProperties(oscillator, envelope) {
    return {
        envelope: {
            node:    envelope.node,
            attack:  envelope.attack * 1000,
            decay:   envelope.decay * 1000,
            sustain: envelope.sustain * 1000,
            release: envelope.release * 1000
        },
        oscillator: oscillator,
        frequency:  oscillator.frequency.value,
        detune:     oscillator.detune.value,
        waveType:   oscillator.type
    }
}

/*
 * Stops a sound and disconnects it from the context and removes it from the list.
 *
 * @param  {obj}  sound  The sound object.
 *
 * @return {obj}  The stopped sound.
 */
function stopSound(sound) {
    sound.oscillator.stop();
    sound.oscillator.disconnect(sound.envelope.node);
    sound.envelope.node.gain.cancelScheduledValues(ctx.currentTime);
    sound.envelope.node.disconnect(ctx.destination);
    
    return sounds.splice( sounds.indexOf(sound), 1 )
}

/*
 * Plays a given frequency
 *
 * The function accepts an optional `opts` argument.
 *
 * @param  {int}  frequency  The frequency of the wave
 * @param  {obj}  [opts]     Options for the playing frequency
 * @param  {int}  [opts.attack]     The attack duration of the sound (in ms). See {@link _createEnvelope}
 * @param  {int}  [opts.decay]      The decay duration of the sound (in ms). See {@link _createEnvelope}
 * @param  {int}  [opts.detune]     The amount of cents to detune the frequency with. See {@link _createOscillator}
 * @param  {flo}  [opts.maxVolume]  The maximum amplitude of the sound, reached after the attack. 1 is full amplitude.
 *                                  If not provided, will default to volume.
 * @param  {int}  [opts.release]    The release duration of the sound (in ms). See {@link _createEnvelope}
 * @param  {int}  [opts.sustain]    The sustain duration of the sound (in ms). See {@link _createEnvelope}
 * @param  {str}  [opts.type]       The shape of the wave. See {@link _createOscillator}
 * @param  {flo}  [opts.volume]     The amplitude of the sound, after the decay. 1 is full amplitude.
 *
 * @return {obj}  The oscillator node
 */
function playFrequency(frequency, opts) {
    var opts       = extend( {}, defaults, opts ),
        envelope   = _createEnvelope(opts.attack, opts.decay, opts.sustain, opts.release),
        oscillator = _createOscillator(frequency, opts.detune, opts.type),
        thisSound  = _getSoundProperties(oscillator, envelope),
        now        = ctx.currentTime,
        soundDuration;
    
    opts.maxVolume = opts.maxVolume || opts.volume;
    
    oscillator.connect(envelope.node);
    envelope.node.connect(ctx.destination);
    
    oscillator.start();
    
    /*
     * Using `setTargetAtTime` because `exponentialRampToValueAtTime` doesn't seem to work properly under
     * the current build of Chrome I'm developing in. Not sure if a bug, or I didn't get something.
     * `setTargetAtTime` gets the `timeCostant` as third argument, which is the amount of time it takes
     * for the curve to reach 1 - 1/e * 100% of the target. The reason why the provided arguments are divided
     * by 5 is because after 5 times worth of the Time Constant the value reaches 99.32% of the target, which
     * is an acceptable approximation for me.
     *
     * @see {@link https://en.wikipedia.org/wiki/Time_constant}
     *
     * @todo put an if with opts.linear = true to use linearRampToValueAtTime instead
     */
    
    // The note starts NOW from 0 and will get to `maxVolume` in approximately `attack` seconds 
    envelope.node.gain.setTargetAtTime( opts.maxVolume, now, envelope.attack / 5 )
    // After `attack` seconds, start a transition to fade to sustain volume in `decay` seconds
    envelope.node.gain.setTargetAtTime( opts.volume, now + envelope.attack, envelope.decay / 5 )

    // @todo if sustain is null, note has to be stopped manually. Also document this.
    if( envelope.sustain !== null ) {
        // The whole approximate sound duration.
        soundDuration = envelope.attack + envelope.decay + envelope.sustain + envelope.release;
        
        // Setting a "keyframe" for the volume to be kept until `sustain` seconds have passed (plus all the rest)
        envelope.node.gain.setValueAtTime( opts.volume, now + envelope.attack + envelope.decay + envelope.sustain );
        // Fade out completely starting at the end of the `sustain` in `release` seconds
        envelope.node.gain.setTargetAtTime( 0, now + envelope.attack + envelope.decay + envelope.sustain, envelope.release / 5 );

        // Start the removal of the sound process after a little more than the sound duration to account for
        // the approximation. (To make sure that the sound doesn't get cut off while still audible)
        setTimeout( function() {
            stopSound(thisSound);
        }, soundDuration * 1250 );
    }
    
    this.sounds.push(thisSound);
    return thisSound;
}

module.exports = {
    context:       ctx,
    playFrequency: playFrequency,
    stopSound:     stopSound,
    sounds:        sounds
}