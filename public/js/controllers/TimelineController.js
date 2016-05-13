
angular.module('dbpedia-events-ui').controller('TimelineController', ['$scope', function($scope) {
	$scope.availableDays = [];
	var DAY = 1000 * 60 * 60 * 24; 
	var daysOfThisYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / DAY);
	for (var i = 0; i < daysOfThisYear; i++) {
		$scope.availableDays.push(new Date(+new Date() - DAY * i));
	}

	$scope.day = '1st';
	$scope.month = 'Jan';
	$scope.activeDay = new Date();

	$scope.$watch('activeDay', function(newDay) {
		$scope.setDay(newDay);
	});

	$scope.setDay = function(date) {
		$scope.events = [];
		if (date < new Date() - 10000) $scope.events = TEST;

		$scope.day = date.getDate();
		var lastNum = $scope.day[$scope.day.length - 1];
		$scope.day = $scope.day + (lastNum == '1' ? $scope.day + 'st' :
			lastNum == '2' ? $scope.day + 'nd' :
			lastNum == '3' ? $scope.day + 'rd' :
			'th');

		$scope.month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'][date.getMonth()];
	};

	var TEST = [
		{
			text: '<dbp-data-link href="">Max Mustermann</dbp-data-link> married <dbp-data-link class="data-link">Marta Mustermann</dbp-data-link>.',
			icon: 'heart',
			image: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Mustermann_1987.jpg'
		},
		{
			text: '<dbp-data-link class="data-link">Max Mustermann</dbp-data-link> is now president of <dbp-data-link class="data-link">Mustermann Inc.</dbp-data-link>.',
			icon: 'user'
		},
		{
			text: 'The <dbp-data-link class="data-link">Mustermann Chronicles</dbp-data-link> were released.',
			icon: 'book'
		},
		{
			text: 'Eruption of <dbp-data-link class="data-link">Mount Aso</dbp-data-link>.',
			icon: 'fire',
			image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Kome_Zuka.JPG/320px-Kome_Zuka.JPG'
		},
		{
			text: '<dbp-data-link class="data-link">Aadesh Shrivastava</dbp-data-link> died on 2015-09-05 in <dbp-data-link class="data-link">Mumbai</dbp-data-link>.',
			icon: 'remove',
			image: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Aadesh_Shrivastava.jpg?1462958478123'
		},
		{
			text: '<dbp-data-link class="data-link">Scream Queens (2015 TV series)</dbp-data-link> is released on 2015-09-22',
			icon: 'book',
			image: 'https://upload.wikimedia.org/wikipedia/en/f/f0/Scream_Queens%2C_title_art.jpg?1462958872497'
		},
		{
			text: '<dbp-data-link class="data-link">Hellmuth Karasek</dbp-data-link> died on 2015-09-29 in <dbp-data-link class="data-link">Hamburg</dbp-data-link>.',
			icon: 'remove',
			image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Hellmuth_Karasek_3821-2.jpg/640px-Hellmuth_Karasek_3821-2.jpg?1462959149106'
		}
	];
}]);

