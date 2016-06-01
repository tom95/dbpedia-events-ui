
angular.module('dbpedia-events-ui').controller('TimelineController', ['$scope', '$http', function($scope, $http) {
	$scope.availableDays = [];
	var DAY = 1000 * 60 * 60 * 24; 
	var daysOfThisYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / DAY);
	for (var i = 0; i < daysOfThisYear; i++) {
		$scope.availableDays.push(new Date(+new Date() - DAY * i));
	}

	$scope.day = '1st';
	$scope.month = 'Jan';
	$scope.selectedTmpl = [];
	$scope.selectedYear = new Date().getFullYear();
	$scope.activeDay = new Date();
	$scope.loading = false;
	var FIRST_YEAR = 2013;

	$scope.$watch('activeDay', function(newDay) {
		$scope.setDay(newDay);
	});

	$scope.years = [];
	for (var year = $scope.selectedYear; year >= FIRST_YEAR; year--)
		$scope.years.push(year);

	$scope.skipDays = function skipDays(num) {
		$scope.activeDay = new Date(+$scope.activeDay + num * 24 * 60 * 60 * 1000);
	};

	$scope.filterEvents = function(event) {
		return $scope.selectedTmpl.indexOf(event.tmpl) >= 0 || !$scope.selectedTmpl.length;
	}

	$scope.setDay = function(date) {
		$scope.events = [];
		$scope.loading = true;

		$http.get('/events/day?day=' + escape($scope.activeDay.toISOString())).then(function(body) {
			$scope.loading = false;
			$scope.events = body.data.map(function(digest) {
				return {
					text: digest.desc,
					icon: $scope.categoryForTmpl(digest.tmpl).icon,
					tmpl: digest.tmpl,
					image: digest.image
				};
			});
		});

		$scope.day = date.getDate();
		var lastNum = $scope.day[$scope.day.length - 1];
		$scope.day = $scope.day + (lastNum == '1' ? $scope.day + 'st' :
			lastNum == '2' ? $scope.day + 'nd' :
			lastNum == '3' ? $scope.day + 'rd' :
			'th');

		$scope.month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'][date.getMonth()];
	};

	$scope.categoryForTmpl = function categoryForTmpl(tmpl) {
		if (typeof tmpl === 'string')
			return $scope.categories.filter(function(c) { return c.tmpl.indexOf(tmpl) >= 0; })[0];
		else
			return $scope.categories.filter(function(c) { return $scope.arrayEqual(c.tmpl, tmpl); })[0];
	};
	$scope.arrayEqual = function(a, b) {
		if (a.length != b.length)
			return false;
		for (var i = 0; i < a.length; i++)
			if (a[i] != b[i])
				return false;
		return true;
	};

	$scope.categories = [
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

}]);

