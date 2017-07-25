var $          = require("jquery"),
	get        = require("lodash.get"),
	extend     = require("lodash.assign"),
	dictionary = {
		"en-US": require("./l10n/en-US.json"),
		"it-IT": require("./l10n/it-IT.json")
	},
	currentLocale = "en-US";

const LANGUAGES = {
	"en-US": "English",
	"it-IT": "Italiano"
};

/*
 * Returns a native name for a language from its code.
 *
 * @param  {String}  The current locale in ISO-639 / ISO-3166 format.
 *
 * @return {String}  The native name for the language.
 */
function getLanguageNameFromCode(code) {
	return LANGUAGES[code];
}

/**
 * Gets the current application locale.
 *
 * @return  {String}  The current locale in ISO-639 / ISO-3166 format.
 */
function getLocale() {
	return currentLocale;
}

/**
 * Sets the current application locale to a string.
 *
 * Also triggers an event for the locale change.
 *
 * @param  {String}  locale  The ISO-639 / ISO-3166 locale string.
 *
 * @return void
 */
function setLocale(locale) {
	currentLocale = locale;
	
	$("html").attr("lang", locale);
	$(document).trigger({
		type: "i18n:localeChange",
		details: { locale: locale }
	});
}

/**
 * Translate a string to a certain locale.
 *
 * The string can be namespaced in the dictionary JSON.
 *
 * @param  {String}  string       The string to translate.
 * @param  {Array}   [namespace]  An array containing the path of the dictionary.
 * @param  {String}  [locale]     The locale to translate to. Default: current.
 *
 * @return {String}  Returns the translated string if it is found, otherwise
 *                   defaults to the untranslated string/key.
 */
function translate(string, namespace, locale) {
	var locale = locale || currentLocale,
		path = namespace ? [locale].concat(namespace) : [locale];
	
	return get( dictionary, path.concat( [string] ) ) || string;
}

module.exports = {
	/**
	 * @alias module:i18n.getLanguageNameFromCode
	 */
	getLanguageNameFromCode: getLanguageNameFromCode,
	/**
	 * @alias module:i18n.getLocale
	 */
	getLocale: getLocale,
	/*
	 * @alias module:i18n.setLocale
	 */
	setLocale: setLocale,
	/*
	 * @alias module:i18n.translate
	 */
	t:         translate
}