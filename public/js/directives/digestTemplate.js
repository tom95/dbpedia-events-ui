var app = angular.module('dbpedia-events-ui');

app.directive('digestTemplate', [function() {
    return {
        retrict: 'E',
        templateUrl: 'views/digest-template.html'
    };
}]);
