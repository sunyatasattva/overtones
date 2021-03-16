var jQuery;

var $ = jQuery = require("jquery");

/*
 * Gets Facebook Engagement data
 *
 * @return  {Promise}  The promise with of the JSON data.
 */
function getFacebookEngagement() {
	return $.getJSON("http://graph.facebook.com/?id=http://www.suonoterapia.org/overtones");
}

/*
 * Gets Facebook Engagement data
 *
 * @return  {Promise}  The promise with of the open issues count.
 */
function getGithubIssuesCount() {
	return $.getJSON("https://api.github.com/repos/sunyatasattva/overtones").then(function(data) {
		return data.open_issues_count;
	});
}

/*
 * Given a number, it shortens it, rounds it and adds a relevant suffix.
 *
 * @param  {Number}  n  The number to simplify.
 *
 * @return  {String}  The more readable string.
 */
function getReadableNumberFrom(n) {
	var str;
	
	if(n >= 1000000)
		str = (n / 1000000).toFixed(1) + "m";
	else if(n >= 100000)
		str = Math.round(n / 1000) + "k";
	else if(n >= 1000)
		str = (n / 1000).toFixed(1) + "k";
	else
		str = n;
	
	return str;
}

/*
 * Opens the sharer popup window centered to the parent window.
 *
 * @param  {Event}  e  The click event object.
 *
 * @return  void
 */
function openShareWindow(e) {
	var href  = this.href,
		props = "toolbar=0, menubar=0, location=0, scrollbars=0",
		size  = "width=600, height=600",
		top   = window.top.outerHeight / 2 + window.top.screenY - 300,
		left  = window.top.outerWidth / 2 + window.top.screenX - 300,
		pos   = `top=${top}, left=${left}`,
		feats = `${size}, ${pos}, ${props}`;

	e.preventDefault();
	
	$(document).trigger({
		type: "social",
		details: { href: href }
	});

	window.open(href, "share-window", feats);
}

module.exports = {
	/*
	 * Fills up the buttons data
	 *
	 * @return void
	 */
	init: function() {
		getFacebookEngagement()
		.then(function(data) {
			var n = getReadableNumberFrom(data.share.share_count * 2);
			
			$(".facebook-button .btn-count").text(n);
		});
		
		getGithubIssuesCount()
		.then(function(data) {
			$(".feedback-button .btn-count").text(data);
		});
		
		$(".facebook-button, .twitter-button, .donate-button")
			.on("click", openShareWindow);
	}
}