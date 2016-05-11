
angular.module('dbpedia-events-ui').directive('dbpDataLink', ['$http', function($http) {
	return {
		restrict: 'AE',
		link: function($scope, $element, $attrs) {
			var POPOVER_WIDTH = 500;
			var POPOVER_HEIGHT = 200;
			var POPOVER_OFFSET = 36;
			var popover;

			var entity = $element.text();

			$element.mouseover(function() {
				if (!popover) {
					popover = $('<div/>')
						.css({
							width: POPOVER_WIDTH,
							height: POPOVER_HEIGHT,
							zIndex: 999999,
							position: 'absolute',
							backgroundColor: '#fff',
							boxShadow: '0 5px 20px rgba(0, 0, 0, 0.6)'
						})
						.addClass('dbp-popover')
						.mouseleave(function() {
							popover.detach();
						});

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
				popover
					.css({
						left: offset.left,
						top: offset.top + POPOVER_OFFSET,
					})
					.appendTo(document.body);
			});
		}
	};
}]);

