"use strict";

var $        = require('jquery');
var Shepherd = require('tether-shepherd');
var once     = require("./lib/once");
var i18n     = require("./i18n");

var currentLanguage,
	tour,
    mainTour,
    newbieTour;

window.jQuery = $;

require('chardin.js');

// @todo temporary hack
function _translateStep(step) {
	var titleTranslationKey = step.options.translationKey;
	
	if(step.options.buttons.length) {
		step.options.buttons.forEach(function(button){
			var key = button.translationKey;
			
			button.text = i18n.t( key[0], key.slice(1) );
		});
	}
	
	if(titleTranslationKey) {
		step.options.title = i18n.t(
			'TITLE', 
			titleTranslationKey
		);
	}
}

// `Sheperd.on` is sadly not chainable
Shepherd.on('show', function(tour){
	var step        = tour.step,
	    stepIndex   = tour.tour.steps.indexOf(step) + 1,
		stepsLength = tour.tour.steps.length;

	if(!step.options.title)
		step.options.title = `${stepIndex}/${stepsLength}`;
	
	try {
		_translateStep(tour.step);
	}
	catch(e) {
		console.error("Couldn't translate the step", e);
	}
	
	$(document).trigger({ type: "overtones:help:show", idx:  stepIndex });
});

Shepherd.on('cancel', function(tour){
	var step      = tour.tour.currentStep,
	    stepIndex = tour.tour.steps.indexOf(step) + 1;
	
	$(document).trigger({ type: "overtones:help:close", idx:  stepIndex });
});

Shepherd.on('complete', function(tour){
	var step      = tour.step,
	    stepIndex = tour.tour.steps.indexOf(step) + 1;

	$(document).trigger({ type: "overtones:help:complete" });
});

mainTour = new Shepherd.Tour();
mainTour.options.defaults = {
	classes: 'shepherd-theme-dark main-tour',
	showCancelLink: true,
	buttons: [
		{
			text: 'Next',
			translationKey: ['NEXT', 'help', 'buttons'],
			action: mainTour.next
		}
	]
}

mainTour
.addStep('overtone-spiral', {
	text: function() {
		return i18n.t('STEP_OVERTONE_SPIRAL', ['help']);
	},
	attachTo: '#Overtone-Spiral right',
	tetherOptions: {
		offset: '0 -220px'
	},
	when: {
		'before-show': function() {
			if( $('body').data('shepherd-step') === 'newbie-help' ){
				newbieTour.next(); // Close the newbie tour if open
				// This fixes a bug happening if the two tours would overlap
				$('body').addClass('shepherd-active');
			}
		}
	}
})
.addStep('first-partial', {
	text: function() {
		return i18n.t('STEP_FIRST_PARTIAL', ['help']);
	},
	attachTo: '#overtone-1 bottom',
	buttons: {},
	advanceOn: {
		selector: '.overtone, .space',
		event: 'click'
	}
})
.addStep('note-details', {
	text: function() {
		return i18n.t('STEP_NOTE_DETAILS', ['help']);
	},
	attachTo: '#sound-details bottom',
	buttons: [],
	when: {
		show: function(tour) {
			$('body').chardinJs({
				attribute: `data-intro-${i18n.getLocale()}`,
				method:    'start'
			});
			
			$('#sound-details').addClass('is-active visible');
			
			$('#overtone-1').addClass('shepherd-enabled');
		},
		hide: function() {
			$('body').chardinJs('stop');
			$('#overtone-1').removeClass('shepherd-enabled');
			$('#sound-details').removeClass('visible is-active');
		}
	},
	advanceOn: {
		selector: '#sound-details, #sound-details *',
		event: 'mouseup'
	},
	tetherOptions: {
		offset: '-20px 70px'
	}
})
.addStep('spiral-pieces', {
	text: function() {
		return i18n.t('STEP_SPIRAL_PIECES', ['help']);
	},
	attachTo: '.spiral-piece:nth-of-type(2) bottom',
	buttons: {},
	advanceOn: {
		selector: '.spiral-piece',
		event: 'click'
	}
})
.addStep('interval-details', {
	text: function() {
		return i18n.t('STEP_INTERVAL_DETAILS', ['help']);
	},
	attachTo: '#sound-details bottom',
	when: {
		show: function(tour) {
			$('body').chardinJs({
				attribute: `data-intro-${i18n.getLocale()}`,
				method:    'start'
			});
			$('.spiral-piece').eq(1).addClass('shepherd-enabled');
		},
		hide: function() {
			$('body').chardinJs('stop');
			$('.spiral-piece').eq(1).removeClass('shepherd-enabled');
			$('#sound-details').removeClass('visible');
		}
	},
	tetherOptions: {
		offset: '-20px 70px'
	}
})
.addStep('options-base', {
	text: function() {
		return i18n.t('STEP_OPTIONS_BASE', ['help']);
	},
	attachTo: '#base-wrapper right',
	advanceOn: {
		selector: '#base',
		event: 'change'
	},
	tetherOptions: {
		offset: '-20px 0'
	}
})
.addStep('options-keyboard', {
	text: function() {
		return i18n.t('STEP_OPTIONS_KEYBOARD', ['help']);
	},
	attachTo: '#keyboard-container right',
	when: {
		show: function() {
			$('#base-wrapper').addClass('shepherd-enabled');
			$('#keyboard-container').addClass('visible is-active');
		},
		hide: function() {
			$('#base-wrapper').removeClass('shepherd-enabled');
			$('#keyboard-container').removeClass('visible is-active');
		}
	},
	tetherOptions: {
		offset: '0 -240px'
	}
})
.addStep('options-volume', {
	text: function() {
		return i18n.t('STEP_OPTIONS_VOLUME', ['help']);
	},
	attachTo: '#volume-control-wrapper right',
	advanceOn: {
		selector: '#volume-control',
		event: 'change'
	}
})
.addStep('options-group', {
	text: function() {
		return i18n.t('STEP_OPTIONS_GROUP', ['help']);
	},
	attachTo: '#group-notes bottom',
	tetherOptions: {
		offset: '-20px 0'
	}
})
.addStep('options-octave', {
	text: function() {
		return i18n.t('STEP_OPTIONS_OCTAVE', ['help']);
	},
	attachTo: '#reduce-to-octave bottom',
	tetherOptions: {
		offset: '-20px 0'
	}
})
.addStep('options-sustain', {
	text: function() {
		return i18n.t('STEP_OPTIONS_SUSTAIN', ['help']);
	},
	attachTo: '#sustain bottom',
	tetherOptions: {
		offset: '-20px 0'
	}
})
.addStep('options-record', {
	text: function() {
		return i18n.t('STEP_OPTIONS_RECORD', ['help']);
	},
	attachTo: '#record bottom',
	tetherOptions: {
		offset: '-20px 0'
	}
})
.addStep('play-panel', {
	text: function() {
		return i18n.t('STEP_PLAY_PANEL', ['help']);
	},
	attachTo: '#play-panel top',
	tetherOptions: {
		offset: '20px 0' 
	}
})
.addStep('options-microphone', {
	text: function() {
		return i18n.t('STEP_OPTIONS_MICROPHONE', ['help']);
	},
	attachTo: '#microphone bottom',
	tetherOptions: {
		offset: '-20px 0'
	}
})
.addStep('end-tour', {
	text: function() {
		return i18n.t('STEP_END', ['help']);
	},
	buttons: [
		{
			text: 'Thank you!',
			action: mainTour.next,
			translationKey: ['THANKS', 'help', 'buttons'],
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
	text: function() {
		return i18n.t('CONTENT', ['help', 'NEWBIE_HELP']);
	},
	attachTo: '#help right',
	title: 'Confused by what you see?',
	translationKey: ['help', 'NEWBIE_HELP'],
	buttons: [
		{
			text: 'No, thanks, I\'m good',
			action: function(){
				newbieTour.next();
				
				$(document).trigger({
					type: "overtones:help:close",
					idx: 0
				});
			},
			classes: "button-cancel",
			translationKey: ['CANCEL', 'help', 'buttons']
		},
		{
			text: 'Show me around!',
			action: function() {
				newbieTour.next();
				mainTour.start();
				
				$(document).trigger({
					type: "overtones:help:next",
					idx: 0
				});
			},
			translationKey: ['SHOW_AROUND', 'help', 'buttons']
		}
	],
	when: {
		'show': function() {
			var selector = '.newbie-tour .language-switcher';
			
			if( $(selector).length )
				return;
			else {
				$('.language-switcher')
					.clone(true, true)
					.data('toggle', selector)
					.appendTo('.newbie-tour header');
			}
		}
	}
});

window.newbieTour = newbieTour;
module.exports = {
	mainTour: mainTour,
	init: function(){
		setTimeout(function(){
			once(function(){ newbieTour.start(); }, 'newbieTour');
		}, 2000);
		
		$('#help').on('click', function(e){
			e.preventDefault();
			
			if( !$("body").hasClass("shepherd-active") )
				mainTour.start();
		});
		
		// Deny UI parts when help is active
		$(".spiral-piece, .overtone, .axis, .option-button, #settings-button").on("click", function(e){
			var $body       = $("body"),
			    currentStep = mainTour.currentStep,
			    idx         = currentStep ? currentStep.tour.steps.indexOf(currentStep) + 1 : 0;

			if( $body.hasClass("shepherd-active") && !$(e.delegateTarget).hasClass("shepherd-enabled") ){
				e.stopImmediatePropagation();

					$(document).trigger({
						type: "overtones:help:denied",
						target: e.target,
						idx: idx
					});
			}
		});
		
		
		// Re-inizializes the steps on locale change
		$(document).on("i18n:localeChange", function() {
			var activeTour = Shepherd.activeTour;
			
			$('body').chardinJs('stop');
			newbieTour.steps.forEach((step) => {
				step.destroy();
			});
			
			mainTour.steps.forEach((step) => {
				step.destroy();
			});
			
			if(activeTour)
				activeTour.start();
		});
	},
};