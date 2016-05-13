
angular.module('dbpedia-events-ui').directive('dbpDataLink', ['$http', function($http) {
	return {
		restrict: 'AE',
		link: function($scope, $element, $attrs) {
			var POPOVER_WIDTH = 500;
			var POPOVER_HEIGHT = 200;
			var POPOVER_OFFSET = 36;
			var SCREEN_PADDING = 12;
			var DISMISS_DELAY = 350;
			var popover;

			var entity = $element.text();
			var isOpen = false;
			var wasEntered = false;

			function close() {
				popover.detach();
				isOpen = false;
			}

			function closeIfNotEntered() {
				wasEntered = false;

				if (isOpen) {
					setTimeout(function() {
						if (!wasEntered) {
							close();
						}
					}, DISMISS_DELAY);
				}
			}

			$element.mouseleave(closeIfNotEntered)

			$element.mouseover(function() {
				if (isOpen)
					return;

				isOpen = true;

				if (!popover) {
					popover = $('<div/>')
						.css({
							width: POPOVER_WIDTH,
							height: POPOVER_HEIGHT
						})
						.addClass('dbp-popover')
						.mouseleave(closeIfNotEntered)
						.mouseenter(function() {
							wasEntered = true;
						}).
						append('<div class="dbp-popover-tip"/>')

						$.ajax({
							url: 'https://en.wikipedia.org/w/api.php',
							jsonp: 'callback', 
							dataType: 'jsonp', 
							data: {
								action: 'query', 
								prop: 'extracts|pageimages|revisions|info', 
								redirects: true,
								exintro: true,
								explaintext: true,
								piprop: 'thumbnail',
								pithumbsize: '300',
								rvprop: 'timestamp',
								inprop: 'url',
								indexpageids: true,
								titles: entity,
								format: 'json'
							},
							xhrFields: { withCredentials: true },
							success: function(response) {
								var pages = response.query.pages;
								var page = pages[Object.keys(pages)[0]];
								var image = page.thumbnail ? '<img src="' + page.thumbnail.source + '">' : '';
								popover
									.html(image +
										  '<div class="text"><h2>' + page.title + '</h2>' +
										  '<p>' + page.extract + '</p></div>')
									.click(function() { window.open(page.fullurl); })
							}
						});
				}

				var offset = $element.offset();
				var shootoverRight = Math.max(offset.left + POPOVER_WIDTH + SCREEN_PADDING - $(window).width(), 0);
				var x = offset.left - shootoverRight;

				var tip = popover.find('.dbp-popover-tip');
				tip.css('left', shootoverRight + $element.width() / 2 - tip.width() / 2 + 'px');

				popover
					.css({
						left: x,
						top: offset.top + POPOVER_OFFSET,
					})
					.appendTo(document.body);
			});
		}
	};
}]);

