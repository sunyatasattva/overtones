const DEFAULT_LOCALE = "en-US",
	  LANGUAGES = {
		"en-US": "English",
		"it-IT": "Italiano"
	  },
	  SUPPORTED_LANGUAGES = ["en-US", "it-IT"];
	  

var $          = require("jquery"),
	get        = require("lodash.get"),
	extend     = require("lodash.assign"),
	dictionary = {
		"en-US": require("./l10n/en-US.json"),
		"it-IT": require("./l10n/it-IT.json")
	},
	currentLocale = DEFAULT_LOCALE;

/**
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
 * See which of the supported locales is the best for the user settings.
 *
 * @return  {String|undefined}  The locale in ISO-639 / ISO-3166 format 
 *                              or `undefined`.
 */
function getPreferredSupportedLocale() {
	var preferredLocales = getUserLanguages(),
		locale;
	
	if(preferredLocales) {
		locale = preferredLocales.reduce(function(set, lang) {
			if(set)
				return set;
			
			if( SUPPORTED_LANGUAGES.includes(lang) )
				return lang;
			else {
				return SUPPORTED_LANGUAGES.find(function(supportedLanguage) {
					return supportedLanguage.split("-")[0] === lang;
				});
			}
			
			return false;
		}, false);
	}
	
	return locale;
}

/**
 * Gets the user preferred languages array from the browser.
 *
 * The browser can't really be trusted, but this is a good approximation.
 *
 * @return  {Array}  An array of locale strings. There is no guarantee that those
 *                   strings include the country code, and that they are
 *                   actually ordered by preference.
 */
function getUserLanguages() {
	return navigator.languages ?
		navigator.languages :
		[navigator.language || navigator.userLanguage]
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

/**
 * Tries to set the current locale to the user preferences.
 *
 * If no preferred locale is supported, it will either fallback to setting the
 * locale to the default one, or do nothing.
 *
 * @param  {bool}  fallbackToDefault  If `true` and no preferred supported locale is
 *                                    found, will set the locale to the default one.
 *
 * @return {String|undefined}  The locale in ISO-639 / ISO-3166 format
 *                              or `undefined`.
 */
function trySettingLocaleToPreferred(fallbackToDefault) {
	var locale = getPreferredSupportedLocale();
	
	if(locale)
		setLocale(locale);
	else if(fallbackToDefault)
		setLocale(DEFAULT_LOCALE);
	
	return locale;
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
	/**
	 * @alias module:i18n.getPreferredSupportedLocale
	 */
	getPreferredSupportedLocale: getPreferredSupportedLocale,
	/*
	 * @alias module:i18n.getUserLanguages
	 */
	getUserLanguages: getUserLanguages,
	/*
	 * @alias module:i18n.setLocale
	 */
	setLocale: setLocale,
	/*
	 * @alias module:i18n.translate
	 */
	t: translate,
	/*
	 * @alias module:i18n.trySettingLocaleToPreferred
	 */
	trySettingLocaleToPreferred: trySettingLocaleToPreferred
}