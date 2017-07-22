var $          = require("jquery"),
	get        = require("lodash.get"),
	extend     = require("lodash.assign"),
	dictionary = {
		"en-US": require("./l10n/en-US.json"),
		"it-IT": require("./l10n/it-IT.json")
	},
	currentLocale = "en-US";

function getLocale() {
	return currentLocale;
}

function setLocale(locale) {
	currentLocale = locale;
	
	$("html").attr("lang", locale);
	$(document).trigger({
		type: "i18n:localeChange",
		details: { locale: locale }
	});
}

function translate(string, namespace, locale) {
	var locale = locale || currentLocale,
		path = [locale].concat(namespace);
	
	return get( dictionary, path.concat( [string] ) ) || string;
}

module.exports = {
	getLocale: getLocale,
	setLocale: setLocale,
	t:         translate
}