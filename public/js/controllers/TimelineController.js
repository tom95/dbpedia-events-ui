
angular.module('dbpedia-events-ui').controller('TimelineController', ['$scope', function($scope) {
	$scope.availableDays = [new Date(), new Date(+new Date() - 60*60*1000*24*5)];
	$scope.activeDay = new Date();
}]);

