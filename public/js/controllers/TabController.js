var app = angular.module('dbpedia-events-ui');

app.controller('TabController', ['$location', function ($location) {
    this.isSet = function (location) {
        return location == $location.path();
    };
}]);
