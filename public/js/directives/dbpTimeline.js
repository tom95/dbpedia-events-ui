angular.module('dbpedia-events-ui').directive('dbpTimeline', ['$http', 'dbpCategoryList', function ($http, dbpCategoryList) {
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
                        console.log(res.data);
                        event.news = res.data;
                    }, function(err) {
                        console.log(err);
                        alert('Failed to grab news (see console)');
                    });
            };
        }
    }
}]);
