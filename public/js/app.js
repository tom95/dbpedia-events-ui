
var app = angular.module('dbpedia-events-ui', ['ngRoute']);

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        controller: 'TimelineController',
        templateUrl: 'views/timeline.html'
      }).
      when('/editor', {
        controller: 'EditorController',
        templateUrl: 'views/template-editor.html'
      }).
      otherwise({
        redirectTo: '/',
      });
  }]);
