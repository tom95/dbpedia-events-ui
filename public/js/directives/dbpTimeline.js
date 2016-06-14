
angular.module('dbpedia-events-ui').directive('dbpTimeline', ['$http', 'dbpCategoryList', function($http, dbpCategoryList) {
	return {
		restrict: 'E',
		scope: {
			events: '=',
			showDate: '=?',
			large: '='
		},
		templateUrl: '/views/timeline-template.html',
		link: function($scope, $element, $attrs) {
			$scope.categoryForTmpl = dbpCategoryList.categoryForTmpl;
			$scope.insertDataLinks = dbpCategoryList.insertDataLinks;
		}
	}
}]);

