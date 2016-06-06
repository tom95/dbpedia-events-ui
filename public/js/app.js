var app = angular.module('dbpedia-events-ui', ['ngRoute']);

app
  .config(['$routeProvider',
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
	when('/resource', {
	  controller: 'ResourceController',
	  templateUrl: 'views/resource.html'
	}).
	otherwise({
	  redirectTo: '/'
	});
    }])
  .directive('dbpLateCompile', ['$compile', function($compile) {
    return {
      restrict: 'A',
      scope: {
	dbpLateCompile: '='
      },
      link: function($scope, $element, $attrs) {
	$scope.$watch('dbpLateCompile', function(val) {
	  $element.html('');
	  $element.append($compile('<div>' + val + '</div>')($scope));
	});
      }
    };
  }]);

