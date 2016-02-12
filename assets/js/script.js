/* globals Overtones */

"use strict";

var jQuery,
    $ = jQuery = require('jquery'),
    browser = require('detect-browser');

window.Tones     = require("./lib/tones");
window.Overtones = require("./overtones");

$(document).ready(function($){
    $('body').addClass(browser.name); // This makes me sad, it's 2016 Firefox!
    
    Overtones.init();
});