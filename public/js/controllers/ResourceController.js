
angular.module('dbpedia-events-ui').controller('ResourceController', ['$scope', '$http', '$q', function($scope, $http, $q) {
	$scope.resource = null;

	var searchTriggerTimeout;
	var requestCanceler;
	var SEARCH_DELAY = 400;
	$scope.updateSearchQuery = function updateSearchQuery() {
		if (searchTriggerTimeout)
			clearTimeout(searchTriggerTimeout);

		if (requestCanceler)
			requestCanceler.resolve();
		requestCanceler = $q.defer();

		$scope.items = [];
		$scope.resource = null;

		if (!$scope.search)
			return;

		searchTriggerTimeout = setTimeout(function() {
			var search = $scope.search.toLowerCase();
			$scope.loading = true;

			$http.get('http://dbpedia-live.openlinksw.com/sparql?format=json&query=' +
					escape('select distinct ?res ?label where {' +
						'?res a owl:Thing.' +
						'?res rdfs:label ?label.' +
						'filter contains( lcase(?label), "' + search + '" ).' +
						'} LIMIT 7'), { timeout: requestCanceler.promise }).then(function(data) {
				// check if our query is still the most recent one
				console.log(search, '=>', data);
				$scope.loading = false;
				requestCanceler = null;
				if (search != $scope.search)
					return;

				$scope.items = data.data.results.bindings.map(function(item) {
					return {
						res: item.res.value,
						label: item.label.value
					};
				});
			}, function(err) {
				$scope.loading = false;
				// cancelled by us
				if (err.status < 0)
					return;
				alert(JSON.stringify(err));
			});
		}, SEARCH_DELAY);
	};

	$scope.$watch('resource', function() {
		if (!$scope.resource)
			return;

		$http.get('/events/resource?resource=' + escape($scope.resource)).success(function(data) {
			console.log(data);
			$scope.events = data;
		});
	})
}]);

