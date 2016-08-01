angular.module('dbpedia-events-ui').controller('TimelineController', ['$scope', '$http', 'dbpCategoryList', function ($scope, $http, dbpCategoryList) {
    $scope.availableDays = [];
    var DAY = 1000 * 60 * 60 * 24;
    var FIRST_YEAR = 2013;

    $scope.categoryForTmpl = dbpCategoryList.categoryForTmpl;
    $scope.arrayEqual = dbpCategoryList.arrayEqual;
    $scope.categories = dbpCategoryList.categories;

    $scope.jumpToToday = function jumpToToday() {
        var today = new Date();
        $scope.currentDayOfMonth = today.getDate();
        $scope.currentMonth = today.getMonth();
        $scope.currentYear = today.getFullYear();
    };

    $scope.selectedTmpl = [];
    $scope.loading = false;

    $scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    $scope.jumpToToday();
    $scope.currentDayOfMonth = 1;
    $scope.currentMonth = 7;
    $scope.currentYear = 2015;

    $scope.daysOfMonth = [];
    for (var i = 1; i <= 31; i++) $scope.daysOfMonth.push(i);
    $scope.years = [];
    for (var i = new Date().getFullYear(); i >= FIRST_YEAR; i--) $scope.years.push(i);

    $scope.opacityForListItem = function opacityForListItem(day, current, max) {
        return (Math.pow((max - Math.abs(current - day)) / max, 6) * 0.7) + 0.3;
    };

    $scope.daysOfCurrentMonth = function daysOfCurrentMonth() {
        var today = new Date();
        if ($scope.currentYear == today.getFullYear() && $scope.currentMonth == today.getMonth()) {
            return today.getDate();
        }
        return new Date($scope.currentYear, $scope.currentMonth + 1, 0).getDate();
    };

    $scope.monthsOfCurrentYear = function monthsOfCurrentYear() {
        var today = new Date();
        if ($scope.currentYear == today.getFullYear()) {
            return today.getMonth() + 1;
        }
        return new Date($scope.currentYear, -1, $scope.currentDay).getMonth();
    }

    $scope.$watch('currentMonth + currentDayOfMonth + currentYear', function () {
        if($scope.currentMonth + 1 > $scope.monthsOfCurrentYear())
                $scope.currentMonth = new Date().getMonth();
        if ($scope.currentDayOfMonth > $scope.daysOfCurrentMonth())
                $scope.currentDayOfMonth = $scope.daysOfCurrentMonth();
       
        $scope.activeDay = new Date();
        $scope.activeDay.setMonth($scope.currentMonth);
        $scope.activeDay.setDate($scope.currentDayOfMonth);
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
}]);

