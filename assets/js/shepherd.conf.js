var $        = require('jquery');
var Shepherd = require('tether-shepherd');
var once     = require("./lib/once");
var tour,
    mainTour,
    newbieTour;

window.jQuery = $;

require('chardin.js');

mainTour = new Shepherd.Tour({
  defaults: {
    classes: 'shepherd-theme-dark',
    showCancelLink: true
  }
});

mainTour
.addStep('overtone-spiral', {
    text: ['This is a visual representation of a fundamental sound and its overtones.',
          'Each complete spiral revolution is a full circle, and represents an octave.'],
    attachTo: '#Overtone-Spiral right',
    title: '1/10',
    tetherOptions: {
        offset: '0 -220px'
    }
})
.addStep('fundamental-overtone', {
    text: ['The circle at the center of the spiral represents the fundamental tone.',
         'Click on the circle to hear the sound.'],
    attachTo: '#overtone-1 bottom',
    title: '2/10',
    buttons: {},
    advanceOn: {
        selector: '.overtone, .space',
        event: 'click'
    }
})
.addStep('note-details', {
    text: ['Here you can see information about the sound you just heard'],
    attachTo: '#sound-details bottom',
    title: '3/10',
    when: {
        show: function() {
            $('body').chardinJs('start');
            $('#overtone-1').addClass('shepherd-enabled');
        },
        hide: function() {
            $('body').chardinJs('stop');
            $('#overtone-1').removeClass('shepherd-enabled');
        }
    },
    tetherOptions: {
        offset: '-20px 70px'
    }
})
.addStep('spiral-pieces', {
    text: ['You can also click on other places of the spiral, such as the purple pieces connecting two circles.'],
    attachTo: '.spiral-piece:nth-of-type(2) bottom',
    title: '4/10',
    buttons: {},
    advanceOn: {
        selector: '.spiral-piece',
        event: 'click'
    }
})
.addStep('interval-details', {
    text: ['In this case you see the information about the relationship between the notes you just heard.'],
    attachTo: '#sound-details bottom',
    title: '5/10',
    when: {
        show: function() {
            $('body').chardinJs('start');
            $('.spiral-piece').eq(1).addClass('shepherd-enabled');
        },
        hide: function() {
            $('body').chardinJs('stop');
            $('.spiral-piece').eq(1).removeClass('shepherd-enabled');
        }
    },
    tetherOptions: {
        offset: '-20px 70px'
    }
})
.addStep('options-base', {
    text: ['You can change the frequency of the fundamental note by using this slider.',
          '<small>You can also directly change the number if you want finer tuning!</small>'],
    attachTo: '#base-wrapper right',
    title: '6/10',
    advanceOn: {
        selector: '#base',
        event: 'change'
    },
    tetherOptions: {
        offset: '-20px 0'
    }
})
.addStep('options-volume', {
    text: ['You can change the volume of all the sounds through this slider.',
          '<small>Be careful if you are wearing headphones! Higher overtones especially are going to sound piercing loud.</small>'],
    attachTo: '#volume-control-wrapper right',
    advanceOn: {
        selector: '#volume-control',
        event: 'change'
    },
    title: '7/10'
})
.addStep('options-group', {
    text: ['If you turn this option off, you will hear notes separately when playing intervals.'],
    attachTo: '#group-notes bottom',
    title: '8/10',
    tetherOptions: {
        offset: '-20px 0'
    }
})
.addStep('options-octave', {
    text: ['If you turn this option on, all the sounds will be played on frequencies within one octave of the fundamental tone.'],
    attachTo: '#reduce-to-octave bottom',
    title: '9/10',
    tetherOptions: {
        offset: '-20px 0'
    }
})
.addStep('end-tour', {
    text: ['That is all! Enjoy!'],
    title: '10/10',
    buttons: [
        {
            text: 'Thank you!',
            action: mainTour.next
        }
    ] 
});

newbieTour = new Shepherd.Tour({
    defaults: {
        classes: 'shepherd-theme-dark newbie-tour',
        showCancelLink: true,
        tetherOptions: {
            offset: '80px -20px',
        }
    }
});


newbieTour
.addStep('newbie-help', {
    text: 'You can click this button at any time to have a quick rundown of what\'s going on.',
    attachTo: '#help right',
    title: 'Confused by what you see?',
    buttons: [
        {
            text: 'No, thanks, I\'m good',
            action: newbieTour.next,
            classes: "button-cancel"
        },
        {
            text: 'Show me around!',
            action: function() {
                newbieTour.next();
                mainTour.start();
            }
        }
    ] 
});

module.exports = {
    mainTour: mainTour,
    init: function(){
        setTimeout(function(){
            once(function(){ newbieTour.start(); }, 'newbieTour');
        }, 2000);
        
        $('#help').on('click', function(e){
            e.preventDefault();
            mainTour.start();
        });
        
        $(".spiral-piece, .overtone, .axis").on("click", function(e){
            var $body = $("body");

            if( $body.hasClass("shepherd-active") && !$(e.delegateTarget).hasClass("shepherd-enabled") )
                e.stopImmediatePropagation();
        });
    },
};