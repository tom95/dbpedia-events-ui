
angular.module('dbpedia-events-ui').controller('ResourceController', ['$scope', '$http', function($scope, $http) {
	$scope.resource = null;

	var searchTriggerTimeout;
	var SEARCH_DELAY = 400;
	$scope.updateSearchQuery = function updateSearchQuery() {
		if (searchTriggerTimeout)
			clearTimeout(searchTriggerTimeout);

		$scope.items = [];
		$scope.resource = null;

		searchTriggerTimeout = setTimeout(function() {
			var search = $scope.search.toLowerCase();
			$scope.loading = true;

			$http.get('http://dbpedia-live.openlinksw.com/sparql?format=json&query=' +
					escape('select distinct ?res ?label where {' +
						'?res a owl:Thing.' +
						'?res rdfs:label ?label.' +
						'filter contains( lcase(?label), "' + search + '" ).' +
						'} LIMIT 7')).then(function(data) {
				// check if our query is still the most recent one
				console.log(search, '=>', data);
				$scope.loading = false;
				if (search != $scope.search)
					return;

				$scope.items = data.data.results.bindings.map(function(item) {
					return {
						res: item.res.value,
						label: item.label.value
					};
				});
			}, function(err) { alert(err); $scope.loading = false; });
		}, SEARCH_DELAY);
	};

	$scope.$watch('resource', function() {
		if (!$scope.resource)
			return;

		$http.get('/events/resource?resource=' + escape($scope.resource)).success(function(data) {
			$scope.events = data;
		});
	})
}]);

