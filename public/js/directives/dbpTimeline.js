angular.module('dbpedia-events-ui').directive('dbpTimeline', ['$http', 'dbpCategoryList', '$filter', function ($http, dbpCategoryList, $filter) {
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
                return event.confirm.confirm + event.confirm.disconfirm > 5 &&
                    event.confirm.disconfirm > event.confirm.confirm;
            };

            $scope.testVerifyArticle = function testVerifyArticle(event) {
                $http.get('/events/verify?tmpl=' + escape($scope.categoryForTmpl(event.tmpl).desc[0]) +
                          '&desc=' + escape(event.desc) +
                          '&endTime=' + escape(event.endTime))
                    .then(function(res) {
                        event.news = res.data.articles;

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

                        event.trends = {
                            counts: data.map(function(i) { return i.count; }),
                            labels: data.map(function(i) { return (i.date.getMonth() == eventDate.getMonth() &&
                                             i.date.getFullYear() == eventDate.getFullYear()) ?
                                             'Event Occurrence' :
                                             $filter('date')(i.date, 'MMM yyyy'); })
                        };
                    }, function(err) {
                        console.log(err);
                        alert('Failed to grab news (see console)');
                    });
            };
        }
    }
}]);
