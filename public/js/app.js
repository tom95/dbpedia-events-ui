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
  .factory('dbpCategoryList', function() {
    var categories = [
      {
	label: 'All Categories',
	tmpl: [],
	icon: 'magic'
      },
      {
	label: 'Awarded',
	tmpl: ['http://events.dbpedia.org/data/digests#AWARDED'],
	icon: 'award'
      },
      {
	label: 'Change of Leader',
	tmpl: ['http://events.dbpedia.org/data/digests#LEADER'],
	icon: 'users'
      },
      {
	label: 'Deceased People',
	tmpl: ['http://events.dbpedia.org/data/digests#DEADPEOPLE', 'http://events.dbpedia.org/data/digests#DEADPEOPLEWOF'],
	icon: 'religious-christian'
      },
      {
	label: 'Released Things',
	tmpl: ['http://events.dbpedia.org/data/digests#RELEASED'],
	icon: 'plus'
      },
      {
	label: 'Introduced Things',
	tmpl: ['http://events.dbpedia.org/data/digests#INTRODUCED'],
	icon: 'sun'
      },
      {
	label: 'Rising Numbers',
	tmpl: ['http://events.dbpedia.org/data/digests#RISINGNUMBERS'],
	icon: 'chart-line'
      },
      {
	label: 'Headhunted',
	tmpl: ['http://events.dbpedia.org/data/digests#HEADHUNTED'],
	icon: 'user-plus'
      },
      {
	label: 'Change of President',
	tmpl: ['http://events.dbpedia.org/data/digests#PRESIDENT'],
	icon: 'users'
      },
      {
	label: 'Europe 2015',
	tmpl: ['http://events.dbpedia.org/data/digests#EUROPE2015'],
	icon: 'euro'
      },
      {
	label: 'Winners Announced',
	tmpl: ['http://events.dbpedia.org/data/digests#GRANDPRIX', 'http://events.dbpedia.org/data/digests#PODIUM'],
	icon: 'award-1'
      },
      {
	label: 'Just Married',
	tmpl: ['http://events.dbpedia.org/data/digests#JUSTMARRIED'],
	icon: 'heart'
      },
      {
	label: 'Just Divorced',
	tmpl: ['http://events.dbpedia.org/data/digests#JUSTDIVORCED'],
	icon: 'heart-broken'
      },
      {
	label: 'Aircraft Occurence',
	tmpl: ['http://events.dbpedia.org/data/digests#AIRCRAFTOCCURRENCE'],
	icon: 'paper-plane'
      },
      {
	label: 'Volcano Eruption',
	tmpl: ['http://events.dbpedia.org/data/digests#VOLCANO'],
	icon: 'fire'
      }
    ];

    function arrayEqual (a, b) {
      if (a.length != b.length)
	return false;
      for (var i = 0; i < a.length; i++)
	if (a[i] != b[i])
	  return false;
      return true;
    };

    return {
      categoryForTmpl: function(tmpl) {
	if (typeof tmpl === 'string')
	  return categories.filter(function(c) { return c.tmpl.indexOf(tmpl) >= 0; })[0];
	else
	  return categories.filter(function(c) { return arrayEqual(c.tmpl, tmpl); })[0];
      }
    };
  })
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

