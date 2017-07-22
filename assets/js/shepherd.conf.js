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

// `Sheperd.on` is sadly not chainable
Shepherd.on('show', function(tour){
	var step      = tour.step,
	    stepIndex = tour.tour.steps.indexOf(step) + 1;

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

mainTour = new Shepherd.Tour({
	defaults: {
		classes: 'shepherd-theme-dark main-tour',
		showCancelLink: true
	}
});

mainTour
.addStep('overtone-spiral', {
	text: function() {
		return i18n.t('STEP_1', ['help']);
	},
	attachTo: '#Overtone-Spiral right',
	title: '1/11',
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
.addStep('fundamental-overtone', {
	text: function() {
		return i18n.t('STEP_2', ['help']);
	},
	attachTo: '#overtone-1 bottom',
	title: '2/11',
	buttons: {},
	advanceOn: {
		selector: '.overtone, .space',
		event: 'click'
	}
})
.addStep('note-details', {
	text: function() {
		return i18n.t('STEP_3', ['help']);
	},
	attachTo: '#sound-details bottom',
	title: '3/11',
	when: {
		show: function() {
			$('body').chardinJs({
				attribute: `data-intro-${window.currentLanguage}`,
				method:    'start'
			});
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
	text: function() {
		return i18n.t('STEP_4', ['help']);
	},
	attachTo: '.spiral-piece:nth-of-type(2) bottom',
	title: '4/11',
	buttons: {},
	advanceOn: {
		selector: '.spiral-piece',
		event: 'click'
	}
})
.addStep('interval-details', {
	text: function() {
		return i18n.t('STEP_5', ['help']);
	},
	attachTo: '#sound-details bottom',
	title: '5/11',
	when: {
		show: function() {
			$('body').chardinJs({
				attribute: `data-intro-${window.currentLanguage}`,
				method:    'start'
			});
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
	text: function() {
		return i18n.t('STEP_6', ['help']);
	},
	attachTo: '#base-wrapper right',
	title: '6/11',
	advanceOn: {
		selector: '#base',
		event: 'change'
	},
	tetherOptions: {
		offset: '-20px 0'
	}
})
.addStep('options-volume', {
	text: function() {
		return i18n.t('STEP_7', ['help']);
	},
	attachTo: '#volume-control-wrapper right',
	advanceOn: {
		selector: '#volume-control',
		event: 'change'
	},
	title: '7/11'
})
.addStep('options-group', {
	text: function() {
		return i18n.t('STEP_8', ['help']);
	},
	attachTo: '#group-notes bottom',
	title: '8/11',
	tetherOptions: {
		offset: '-20px 0'
	}
})
.addStep('options-octave', {
	text: function() {
		return i18n.t('STEP_9', ['help']);
	},
	attachTo: '#reduce-to-octave bottom',
	title: '9/11',
	tetherOptions: {
		offset: '-20px 0'
	}
})
.addStep('options-sustain', {
	text: function() {
		return i18n.t('STEP_10', ['help']);
	},
	attachTo: '#sustain bottom',
	title: '10/11',
	tetherOptions: {
		offset: '-20px 0'
	}
})
.addStep('end-tour', {
	text: function() {
		return i18n.t('STEP_11', ['help']);
	},
	title: '11/11',
	buttons: [
		{
			text: 'Thank you!',
			action: mainTour.next,
			classes: 'button-thank-you'
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
		return i18n.t('STEP_0', ['help']);
	},
	attachTo: '#help right',
	title: 'Confused by what you see?',
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
			classes: "button-cancel"
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
			classes: "button-show-around"
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
		
		$(document).on("i18n:localeChange", function() {
			newbieTour.steps.forEach((step) => {
				step.destroy();
			});
			
			mainTour.steps.forEach((step) => {
				step.destroy();
			});
		});
	},
};