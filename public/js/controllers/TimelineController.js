angular.module('dbpedia-events-ui').controller('TimelineController', ['$scope', '$http', 'dbpCategoryList', function ($scope, $http, dbpCategoryList) {
    $scope.availableDays = [];
    var DAY = 1000 * 60 * 60 * 24;
    var FIRST_YEAR = 2013;

    $scope.categoryForTmpl = dbpCategoryList.categoryForTmpl;
    $scope.arrayEqual = dbpCategoryList.arrayEqual;
    $scope.categories = dbpCategoryList.categories;

    $scope.selectedTmpl = [];
    $scope.loading = false;

    $scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'Octobe', 'November', 'December'];
    $scope.currentDayOfMonth = 8;
    $scope.currentMonth = 4;
    $scope.currentYear = new Date().getFullYear() - 1;

    $scope.daysOfMonth = [];
    for (var i = 1; i <= 31; i++) $scope.daysOfMonth.push(i);
    $scope.years = [];
    for (var i = new Date().getFullYear(); i >= FIRST_YEAR; i--) $scope.years.push(i);

    $scope.opacityForListItem = function opacityForListItem(day, current, max) {
        return (Math.pow((max - Math.abs(current - day)) / max, 6) * 0.7) + 0.3;
    };

    $scope.daysOfCurrentMonth = function daysOfCurrentMonth() {
        return new Date($scope.currentYear, $scope.currentMonth + 1, 0).getDate();
    };

    $scope.$watch('currentMonth + currentDayOfMonth + currentYear', function () {
        if ($scope.currentDayOfMonth + 1 > $scope.daysOfCurrentMonth())
            $scope.currentDayOfMonth = $scope.daysOfCurrentMonth() - 1;

        $scope.activeDay = new Date();
        $scope.activeDay.setMonth($scope.currentMonth);
        $scope.activeDay.setDate($scope.currentDayOfMonth + 1);
        $scope.activeDay.setFullYear($scope.currentYear);
    });

    $scope.$watch('activeDay', function (newDay) {
        $scope.setDay(newDay);
    });

    $scope.skipDays = function skipDays(num) {
        $scope.activeDay = new Date(+$scope.activeDay + num * 24 * 60 * 60 * 1000);
    };

    $scope.filterEvents = function filterEvents(event) {
        return $scope.selectedTmpl.indexOf(event.tmpl) >= 0 || !$scope.selectedTmpl.length;
    };

    $scope.setDay = function setDay(date) {
        $scope.events = [];
        $scope.loading = true;

        $http.get('/events/day?day=' + escape($scope.activeDay.toISOString())).then(function (body) {
            $scope.loading = false;
            $scope.events = body.data;
        });
    };

    $scope.largeScreen = window.innerWidth >= 768;
    window.addEventListener('resize', function () {
        $scope.largeScreen = window.innerWidth >= 768;
        $scope.$apply();
    });

    $scope.confirmEvent = function confirmEvent(event, doConfirm) {
        console.log('hi');
        $http.put('/events/confirm/' + event.id, { confirm: doConfirm })
            .then(function(body) {
                event.confirm = body.confirm;
                console.log(body);
            });
    };
}]);

