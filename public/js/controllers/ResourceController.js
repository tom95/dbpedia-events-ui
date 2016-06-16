angular.module('dbpedia-events-ui').controller('ResourceController', ['$scope', '$http', '$q', function ($scope, $http, $q) {
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

        if (!$scope.search || $scope.resource)
            return;

        searchTriggerTimeout = setTimeout(function () {
            var search = $scope.search;
            $scope.loading = true;

            $http.get('http://lookup.dbpedia.org/api/search/PrefixSearch?MaxHits=8&QueryString=' + search, {
                headers: {'Accept': 'application/json'}
            }).then(function (data) {
                // check if our query is still the most recent one
                $scope.loading = false;
                requestCanceler = null;
                if (search != $scope.search)
                    return;

                $scope.items = data.data.results.map(function (item) {
                    return {
                        res: item.uri,
                        description: item.description,
                        label: item.label
                    };
                });
            }, function (err) {
                $scope.loading = false;
                // cancelled by us
                if (err.status < 0)
                    return;
                alert(JSON.stringify(err));
            });
        }, SEARCH_DELAY);
    };

    $scope.$watch('resource', function () {
        if ($scope.resource)
            $scope.imageForResource($scope.resource);
    });

    $scope.imageForResource = function imageForResource(resource) {
        if (false)
            $http.get('http://dbpedia-live.openlinksw.com/sparql?format=json&query=' +
                escape('select ?img { <' + resource.res + '> <http://xmlns.com/foaf/0.1/depiction> ?img }'))
                .then((res) => {
                    if (res.data.results.bindings.length)
                        resource.image = res.data.results.bindings[0].img.value;
            });
        else {
            var entity = resource.res.match(/\/([^/]+)$/)[1];
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
                xhrFields: {withCredentials: true},
                success: function (response) {
                    var pages = response.query.pages;
                    var page = pages[Object.keys(pages)[0]];
                    resource.image = page.thumbnail ? page.thumbnail.source : null;
                    $scope.$apply();
                }
            });
        }
    };

    $scope.$watch('resource', function () {
        if (!$scope.resource)
            return;

        $http.get('/events/resource?resource=' + escape($scope.resource.res)).success(function (data) {
            $scope.events = data.map(function (item) {
                item.endTime = new Date(item.endTime);
                return item;
            });
        });
    });
}]);

