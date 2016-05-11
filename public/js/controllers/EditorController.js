var app = angular.module('dbpedia-events-ui');

app.controller('EditorController', ['$scope', function($scope) {
  $scope.submit = function() {
    alert("Digest Template successfully saved!");
  };
}]);
