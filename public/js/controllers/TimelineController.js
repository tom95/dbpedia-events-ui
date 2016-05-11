
angular.module('dbpedia-events-ui').controller('TimelineController', ['$scope', function($scope) {
	$scope.availableDays = [new Date(), new Date(+new Date() - 60*60*1000*24*5)];
	$scope.activeDay = new Date();
	$scope.events = [
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

