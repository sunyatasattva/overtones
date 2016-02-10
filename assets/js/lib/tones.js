var extend     = require('lodash.assign'),
    utils      = require('./utils.js'),
    ctx        = new (window.AudioContext || window.webkitAudioContext)(),
    masterGain = ctx.createGain(),
    defaults   = {
        attack:  150,
        decay:   200,
        sustain: 0,
        release: 1250,
        volume:  1,
        detune:  0,
        type:    'sine'
    },
    /*
     * A list of currently active sounds for manipulation
     */
    sounds = [];

masterGain.connect(ctx.destination);

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

function Sound(oscillator, envelope, opts){
   this.envelope = {
        node:      envelope.node,
        attack:    envelope.attack,
        decay:     envelope.decay,
        sustain:   envelope.sustain,
        release:   envelope.release,
        volume:    opts.volume,
        maxVolume: opts.maxVolume
   };
   this.oscillator = oscillator;
   this.frequency  = oscillator.frequency.value;
   this.detune     = oscillator.detune.value;
   this.waveType   = oscillator.type;
    
   this.duration = envelope.attack + envelope.decay + envelope.sustain + envelope.release;
}

Sound.prototype.play = function(){
    var now  = ctx.currentTime,
        self = this;
    
    this.oscillator.start();
    
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
    this.envelope.node.gain.setTargetAtTime( this.envelope.maxVolume, now, this.envelope.attack / 5 )
    // After `attack` seconds, start a transition to fade to sustain volume in `decay` seconds
    this.envelope.node.gain.setTargetAtTime( this.envelope.volume, now + this.envelope.attack, this.envelope.decay / 5 )

    // @todo if sustain is null, note has to be stopped manually. Also document this.
    if( this.envelope.sustain !== null ) {
        
        
        // Setting a "keyframe" for the volume to be kept until `sustain` seconds have passed (plus all the rest)
        this.envelope.node.gain.setValueAtTime( this.envelope.volume, now + this.envelope.attack + this.envelope.decay + this.envelope.sustain );
        // Fade out completely starting at the end of the `sustain` in `release` seconds
        this.envelope.node.gain.setTargetAtTime( 0, now + this.envelope.attack + this.envelope.decay + this.envelope.sustain, this.envelope.release / 5 );

        // Start the removal of the sound process after a little more than the sound duration to account for
        // the approximation. (To make sure that the sound doesn't get cut off while still audible)
        setTimeout( function() {
            self.stop();
        }, this.duration * 1250 );
    }
    
    return this;
}

Sound.prototype.remove = function(){
    this.oscillator.disconnect(this.envelope.node);
    this.envelope.node.gain.cancelScheduledValues(ctx.currentTime);
    this.envelope.node.disconnect(masterGain);

    return sounds.splice( sounds.indexOf(this), 1 );
}

Sound.prototype.stop = function(){
    this.oscillator.stop();
    
    return this.remove();
}

Sound.prototype.intervalInCents = function(tone){
    var ratio = this.frequency / tone.frequency;
    
    return Math.round( 1200 * utils.logBase(2, ratio) );
}

Sound.prototype.isOctaveOf = function(tone){
    return utils.isPowerOfTwo( this.frequency / tone.frequency );
}

Sound.prototype.reduceToSameOctaveAs = function(tone, excludeOctave){
    var ratio = this.frequency / tone.frequency;
    
    if( excludeOctave ) {
        while( ratio < 1 || ratio >= 2 ){
            if( ratio < 1 )
                this.frequency = this.frequency * 2;
            else
                this.frequency = this.frequency / 2;

            ratio = this.frequency / tone.frequency;
        }
    }
    else {
        while( ratio <= 1 || ratio > 2 ){
            if( ratio <= 1 )
                this.frequency = this.frequency * 2;
            else
                this.frequency = this.frequency / 2;

            ratio = this.frequency / tone.frequency;
        }
    }
    
    this.oscillator.frequency.setValueAtTime( this.frequency, ctx.currentTime );

    return this;
}

function createSound(frequency, opts){
    var opts       = extend( {}, defaults, opts ),
        envelope   = _createEnvelope(opts.attack, opts.decay, opts.sustain, opts.release),
        oscillator = _createOscillator(frequency, opts.detune, opts.type),
        thisSound;
    
    opts.maxVolume = opts.maxVolume || opts.volume;
    
    thisSound = new Sound(oscillator, envelope, opts);
    
    oscillator.connect(envelope.node);
    envelope.node.connect(masterGain);
    
    sounds.push(thisSound);
    
    return thisSound;
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
    var thisSound = createSound(frequency, opts);
    
    return thisSound.play();
}

module.exports = {
    context:       ctx,
    createSound:   createSound,
    masterGain:    masterGain,
    playFrequency: playFrequency,
    sounds:        sounds,
}