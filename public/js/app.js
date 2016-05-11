
angular.module('dbpedia-events-ui', ['wu.masonry'])
	.config(function($sceProvider) {
		// TODO remove!
		$sceProvider.enabled(false);
	})
	.directive('dbpLateCompile', ['$compile', function($compile) {
		return {
			restrict: 'A',
			scope: {
				dbpLateCompile: '='
			},
			link: function($scope, $element, $attrs) {
				$scope.$watch('dbpLateCompile', function(val) {
					console.log(val);
					$element.html('');
					$element.append($compile('<div>' + val + '</div>')($scope));
				});
			}
		};
	}]);

