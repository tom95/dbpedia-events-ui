var app = angular.module('dbpedia-events-ui');

app.controller('EditorController', ['$scope', function($scope) {
  $scope.submit = function($scope) {
    alert("Digest Template successfully saved!");
  };
  $scope.change = function($scope) {

  };
}]);
