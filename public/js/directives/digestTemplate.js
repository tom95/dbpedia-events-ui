var app = angular.module('dbpedia-events-ui');

app.directive('digestTemplate', ['$compile', function($compile) {
        return {
            retrict: 'E',
            templateUrl: 'views/digest-template.html'
        };
    }]);
