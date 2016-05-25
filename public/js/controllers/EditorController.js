var app = angular.module('dbpedia-events-ui');

app.controller('EditorController', ['$scope', function($scope) {
    $scope.submit = function() {
        console.log($scope.template);
        console.log(angular.element(template).html());
    };
    $scope.change = function() {

    };
}]);
