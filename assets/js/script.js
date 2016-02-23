/* globals Overtones */

"use strict";

var jQuery    = require("jquery"),
    browser   = require("detect-browser"),
	analytics = require("./analytics"),
    tour      = require("./shepherd.conf.js");

window.Tones     = require("./lib/tones");
window.Overtones = require("./overtones");

jQuery(document).ready(function($){
    $("body").addClass(browser.name); // This makes me sad, it's 2016 Firefox!
    
    tour.init();
    Overtones.init();
	analytics($);
});