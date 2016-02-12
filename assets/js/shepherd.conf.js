require('chardin.js');
var Shepherd = require('tether-shepherd');
var tour;

tour = new Shepherd.Tour({
  defaults: {
    classes: 'shepherd-theme-dark',
    showCancelLink: true
  }
});

tour
.addStep('overtone-spiral', {
    text: 'This is a visual representation of a fundamental sound and its overtones.',
    attachTo: '#Overtone-Spiral right',
})
.addStep('fundamental-overtone', {
    text: ['The circle at the center of the spiral represents the fundamental tone.',
         'Click on the circle to hear the sound.'],
    attachTo: '#overtone-1 bottom',
    buttons: {},
    advanceOn: {
        selector: '.overtone, .space',
        event: 'click'
    }
})
.addStep('note-details', {
    text: ['Here you can see information about the sound you just heard'],
    attachTo: '#sound-details bottom',
    when: {
        show: function() {
            $('body').chardinJs('start');
        },
        hide: function() {
            $('body').chardinJs('stop');
        }
    }
})
.addStep('spiral-pieces', {
    text: ['You can also click on other places of the spiral, such as the purple pieces connecting two circles.'],
    attachTo: '.spiral-piece:nth-of-type(2) bottom',
    buttons: {},
    advanceOn: {
        selector: '.spiral-piece',
        event: 'click'
    }
})
.addStep('interval-details', {
    text: ['In this case you see the information of the relationship between the notes you just heard.'],
    attachTo: '#sound-details bottom',
    when: {
        show: function() {
            $('body').chardinJs('start');
        },
        hide: function() {
            $('body').chardinJs('stop');
        }
    }
})
.addStep('options-base', {
    text: ['You can change the frequency of the fundamental note by using this slider.',
          '<small>You can also directly change the number if you want finer tuning!</small>'],
    attachTo: '#base-wrapper right',
})
.addStep('options-volume', {
    text: ['You can change the volume of all the sounds through this slider.',
          '<small>Be careful if you are wearing headphones! Higher overtones especially are going to sound piercing loud.</small>'],
    attachTo: '#volume-control-wrapper right',
})
.addStep('options-group', {
    text: ['If you turn this option off, you will hear notes separetely when playing intervals.'],
    attachTo: '#group-notes bottom',
})
.addStep('options-octave', {
    text: ['If you turn this option on, all the sounds will be played on frequencies within one octave of the fundamental tone.'],
    attachTo: '#reduce-to-octave bottom',
})
.addStep('end-tour', {
    text: ['That is all! Enjoy!']
});

module.exports = tour;