# Changelog

## 1.1.2 — 2016.04.12

### Fixes
* Fixes an error introduced in new versions of Safari through latest patch.

### [Full changelog](https://github.com/sunyatasattva/overtones/compare/1.1.0...1.1.2)

## 1.1.1 — 2016.04.10

### Changes
* Better interval names (more commonly used). [#37](https://github.com/sunyatasattva/overtones/issues/37) 
* Facebook share button now shows share count.
* Linking latest release page in the footer instead of specific release.

### Fixes
* Fixes compatibility with older versions of Safari. [#38](https://github.com/sunyatasattva/overtones/issues/38) 

### Behind the hood
* Added some missing code documentation.

### [Full changelog](https://github.com/sunyatasattva/overtones/compare/1.1.0...1.1.1)

## 1.1.0 — 2016.03.24

### New features
* Allow notes to be sustained. [#12](https://github.com/sunyatasattva/overtones/issues/12)  
* Sound details show intervals between sustained notes.
* Allows decimals in frequency input. [#35](https://github.com/sunyatasattva/overtones/issues/35)  
* Added frequency input shortcuts: <kbd>ARROW UP/DOWN</kbd> changes the frequency in increments of one; doing so while holding <kbd>SHIFT</kbd>, changes the frequency in increments of 10, holding <kbd>ALT</kbd> in increments of 0.1. [#33](https://github.com/sunyatasattva/overtones/issues/33)  
* Adds a secret Easter Egg. :see_no_evil: 

### Changes
* Changed the way notes name appear in the detail section. [#30](https://github.com/sunyatasattva/overtones/issues/30)  
* Changed *"Issue"* text with *"Feedback"*.

### Fixes
* Correct accidental symbols (showing ♯ and♭instead of # and b). [#32](https://github.com/sunyatasattva/overtones/issues/32) 
* Enforces frequency input validation. [#26](https://github.com/sunyatasattva/overtones/issues/26) 

### Behind the hood
* Support for ES6
* Functions to calculate Equal Temperament notes given any reference note and any kind of ET. As such, removed hard coded ET frequency data. [#16](https://github.com/sunyatasattva/overtones/issues/16) 
* Refactored octave reduction function to allow for independent calculations

### [Full changelog](https://github.com/sunyatasattva/overtones/compare/1.0.0...1.1.0)