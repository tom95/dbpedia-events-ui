angular.module('dbpedia-events-ui').controller('TimelineController', ['$scope', '$http', 'dbpCategoryList', function ($scope, $http, dbpCategoryList) {
    $scope.availableDays = [];
    var DAY = 1000 * 60 * 60 * 24;
    var FIRST_YEAR = 2013;

    $scope.categoryForTmpl = dbpCategoryList.categoryForTmpl;
    $scope.arrayEqual = dbpCategoryList.arrayEqual;
    $scope.categories = dbpCategoryList.categories;

    $scope.updateAvailableDays = function updateAvailableDays() {
        $scope.availableDays = [];
        if ($scope.currentYear == new Date().getFullYear()) {
            var daysOfThisYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / DAY);
            for (var i = 0; i < daysOfThisYear; i++) {
                $scope.availableDays.push(new Date(+new Date() - DAY * i));
            }
        } else {
            var start = new Date($scope.currentYear + '-01-01');
            for (var i = 0; i < 365; i++) {
                $scope.availableDays.push(new Date(+start + DAY * i));
            }
        }
    };

    $scope.months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    $scope.daysOfMonth = [];
    $scope.currentDayOfMonth = 10;
    $scope.currentMonth = 2;
    $scope.currentYear = new Date().getFullYear() - 1;

    $scope.opacityForListItem = function opacityForListItem(day, current, max) {
        return (Math.pow((max - Math.abs(current - day)) / max, 6) * 0.7) + 0.3;
    };

    for (var i = 1; i <= 31; i++) $scope.daysOfMonth.push(i);
    $scope.daysOfCurrentMonth = function daysOfCurrentMonth() {
        return new Date($scope.currentYear, $scope.currentMonth + 1, 0).getDate();
    }

    $scope.$watch('currentMonth + currentDayOfMonth + currentYear', function () {
        if ($scope.currentDayOfMonth + 1 > $scope.daysOfCurrentMonth())
            $scope.currentDayOfMonth = $scope.daysOfCurrentMonth() - 1;

        $scope.activeDay = new Date();
        $scope.activeDay.setMonth($scope.currentMonth);
        $scope.activeDay.setDate($scope.currentDayOfMonth + 1);
        $scope.activeDay.setFullYear($scope.currentYear);
    });

    $scope.day = '1st';
    $scope.month = 'Jan';
    $scope.selectedTmpl = [];
    $scope.loading = false;

    $scope.updateAvailableDays();

    $scope.$watch('activeDay', function (newDay) {
        $scope.setDay(newDay);
    });

    $scope.years = [];
    for (var year = new Date().getFullYear(); year >= FIRST_YEAR; year--)
        $scope.years.push(year);

    $scope.skipDays = function skipDays(num) {
        $scope.activeDay = new Date(+$scope.activeDay + num * 24 * 60 * 60 * 1000);
    };

    $scope.filterEvents = function (event) {
        return $scope.selectedTmpl.indexOf(event.tmpl) >= 0 || !$scope.selectedTmpl.length;
    }

    $scope.setDay = function (date) {
        $scope.events = [];
        $scope.loading = true;

        $http.get('/events/day?day=' + escape($scope.activeDay.toISOString())).then(function (body) {
            $scope.loading = false;
            $scope.events = body.data;
        });

        $scope.day = date.getDate();
        var lastNum = $scope.day[$scope.day.length - 1];
        $scope.day = $scope.day + (lastNum == '1' ? $scope.day + 'st' :
                lastNum == '2' ? $scope.day + 'nd' :
                    lastNum == '3' ? $scope.day + 'rd' :
                        'th');

        $scope.month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'][date.getMonth()];
    };

    $scope.largeScreen = window.innerWidth >= 768;
    window.addEventListener('resize', function () {
        $scope.largeScreen = window.innerWidth >= 768;
        $scope.$apply();
    });
    ;

}]);

