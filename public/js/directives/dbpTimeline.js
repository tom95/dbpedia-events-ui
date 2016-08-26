function extractSubjectObject(desc, tmpl) {
	function escapeRegExp(str) {
		// http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

	var regex = escapeRegExp(tmpl).replace(/%%.+?%%/g, "(.+)");

	var current = 0;
	return desc.match(regex).slice(1);
}

angular.module('dbpedia-events-ui').directive('dbpTimeline', ['$http', 'dbpCategoryList', '$filter', '$q', function ($http, dbpCategoryList, $filter, $q) {
    return {
        restrict: 'E',
        scope: {
            events: '=',
            showDate: '=?',
            filterEvents: '=?',
            large: '='
        },
        templateUrl: '/views/timeline-template.html',
        link: function ($scope, $element, $attrs) {
            $scope.categoryForTmpl = dbpCategoryList.categoryForTmpl;
            $scope.insertDataLinks = dbpCategoryList.insertDataLinks;

            $scope.confirmEvent = function confirmEvent(event, doConfirm) {
                $http.put('/events/confirm/' + event.id, { confirm: doConfirm })
                    .then(function(res) {
                        event.confirm = res.data.confirm;
                    });
            };

            $scope.eventDisconfirmed = function eventDisconfirmed(event) {
                if (!event)
                    return false;

                if (event.confirm.confirm + event.confirm.disconfirm > 5 &&
                    event.confirm.disconfirm > event.confirm.confirm)
                    return 'Many people marked this event as wrong.';

                if (event.articles && event.articles.length > 0)
                    return false;

                if (!event.trends || !event.trends.counts.length)
                    return false;

                for (var i = 0; i < event.trends.labels.length; i++) {
                    if (event.trends.labels[i] ==  'Event Occurrence')
                        break;
                }

                if (event.trends.counts[i] < event.trends.mean * 3)
                    return 'Based on trends data, this event received no attention, so it may be wrong.'

                return false;
            };

            function labelToResource(label) {
                return '<http://dbpedia.org/resource/' + label.replace(/\s/g, '_') + '>';
            }

            function resolvePrefix(res) {
                return '<' + res
                    .replace(/^dbo:/, 'http://dbpedia.org/ontology/')
                    .replace(/^rdfs:/, 'https://www.w3.org/2000/01/rdf-schema#')
                    .replace(/^rdf:/, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
                    + '>';
            }

	    $scope.updateConfirm = function updateConfirm(event) {
		$http.put('/event/' + event.id, {
		    status: event.status
		}).then(function() { event.userChecked = true; },
			function(err) { alert(JSON.stringify(err)); })
	    };

            $scope.testVerifyArticle = function testVerifyArticle(event) {
                var category = $scope.categoryForTmpl(event.tmpl);
                /*if (category.require) {
                    var objs = extractSubjectObject(event.desc.split('<br>')[0], category.desc[0]);
                    var types = objs.map(function(label, index) {
                        if (!category.require[index])
                            return null;

                        return {
                            resource: labelToResource(label),
                            type: resolvePrefix(category.require[index])
                        };
                    }).filter(function(item) { return !!item; });

                    waiting.push($http.post('/events/type', types)
                        .then(function(res) {
                            console.log(res.data);
                            event.correctEntityTypes = res.data;
                        }));
                }*/

	       if (event.trends && event.trends.length) {
		    var eventDate = new Date(event.endTime);
		    var VARIANCE = 12 * 32 * 24 * 60 * 60 * 1000;
		    var start = +eventDate - VARIANCE;
		    var end = +eventDate + VARIANCE;

		    var data = event.trends.map(function(i) {
			i.date = new Date(i.date);
			return i;
		    }).filter(function(i) {
			return i.date >= start && i.date <= end;
		    });

		    var sum = 0;
		    var counts = data.map(function(i) {
			sum += i.count;
			return i.count;
		    });
		    var mean = sum / counts.length;
		    console.log(mean, counts);

		    event.trends = {
			mean: mean,
			counts: counts,
			labels: data.map(function(i) { return (i.date.getMonth() == eventDate.getMonth() &&
					 i.date.getFullYear() == eventDate.getFullYear()) ?
					 'Event Occurrence' :
					 $filter('date')(i.date, 'MMM yyyy'); })
		    };
		}

		// default state
		event.state = 'unknown';
		event.stateDescription = 'Insufficient data available to confirm or disconfirm event.';

		// evaluate returned articles
		if (event.articles && event.articles.length > 0) {
		    event.stateDescription = 'This event may have received news coverage by third party sources.'
		    event.state = 'confirmed';
		    return;
		}

		// evaluate trends data
		if (!event.trends)
		    return;
		if (!event.trends.counts)
		    return;
		if (!event.trends.counts.length)
		    return;

		for (var i = 0; i < event.trends.labels.length; i++) {
		    if (event.trends.labels[i] ==  'Event Occurrence')
			break;
		}

		if (event.trends.counts[i] < event.trends.mean * 3) {
		    event.stateDescription = 'Based on trends data, this event received no attention, so it may be wrong.'
		    event.state = 'disconfirmed';
		} else {
		    event.stateDescription = 'Based on trends data, this event may have received attention on Google.';
		    event.state = 'confirmed';
		}
            };

            $scope.remoteTestVerifyArticle = function remoteTestVerifyArticle(event) {
                var category = $scope.categoryForTmpl(event.tmpl);
		var waiting = [];
                if (category.require) {
                    var objs = extractSubjectObject(event.desc.split('<br>')[0], category.desc[0]);
                    var types = objs.map(function(label, index) {
                        if (!category.require[index])
                            return null;

                        return {
                            resource: labelToResource(label),
                            type: resolvePrefix(category.require[index])
                        };
                    }).filter(function(item) { return !!item; });

                    waiting.push($http.post('/events/type', types)
                        .then(function(res) {
                            console.log(res.data);
                            event.correctEntityTypes = res.data;
                        }));
                }

                waiting.push($http.get('/events/verify?tmpl=' + escape(category.desc[0]) +
                          '&desc=' + escape(event.desc) +
                          '&endTime=' + escape(event.endTime))
                    .then(function(res) {
                        event.news = res.data.articles;
                        if (!res.data.trends || !res.data.trends.length)
                            return;

                        var eventDate = new Date(event.endTime);
                        var VARIANCE = 12 * 32 * 24 * 60 * 60 * 1000;
                        var start = +eventDate - VARIANCE;
                        var end = +eventDate + VARIANCE;

                        var data = res.data.trends.map(function(i) {
                            i.date = new Date(i.date);
                            return i;
                        }).filter(function(i) {
                            return i.date >= start && i.date <= end;
                        });

                        var sum = 0;
                        var counts = data.map(function(i) {
                            sum += i.count;
                            return i.count;
                        });
                        var mean = sum / counts.length;
                        console.log(mean, counts);

                        event.trends = {
                            mean: mean,
                            counts: counts,
                            labels: data.map(function(i) { return (i.date.getMonth() == eventDate.getMonth() &&
                                             i.date.getFullYear() == eventDate.getFullYear()) ?
                                             'Event Occurrence' :
                                             $filter('date')(i.date, 'MMM yyyy'); })
                        };
                    }, function(err) {
                        console.log(err);
                        alert('Failed to grab news (see console)');
                    }));

		$q.all(waiting).then(function() {
		    // default state
		    event.state = 'unknown';
		    event.stateDescription = 'Insufficient data available to confirm or disconfirm event.';

		    // evaluate user feedback
		    if (event.confirm.confirm + event.confirm.disconfirm > 5 &&
			event.confirm.disconfirm > event.confirm.confirm) {
			event.stateDescription = 'Many people marked this event as wrong.';
			event.state = 'disconfirmed';
			return;
		    }

		    // evaluate returned articles
		    if (event.articles && event.articles.length > 0) {
			event.stateDescription = 'This event may have received news coverage by third party sources.'
			event.state = 'confirmed';
			return;
		    }

		    // evaluate trends data
		    if (!event.trends || !event.trends.counts.length)
			return;

		    for (var i = 0; i < event.trends.labels.length; i++) {
			if (event.trends.labels[i] ==  'Event Occurrence')
			    break;
		    }

		    if (event.trends.counts[i] < event.trends.mean * 3) {
			event.stateDescription = 'Based on trends data, this event received no attention, so it may be wrong.'
			event.state = 'disconfirmed';
		    } else {
			event.stateDescription = 'Based on trends data, this event may have received attention on Google.';
			event.state = 'confirmed';
		    }
		});
            };
        }
    }
}]);
