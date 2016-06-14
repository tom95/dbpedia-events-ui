angular.module('dbpedia-events-ui')
    .directive('gzTimeline', ['$compile', function ($compile) {
        function getMonthName(month) {
            return ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL',
                'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'][month];
        }

        return {
            restrict: 'E',
            scope: {
                'days': '=',
                'active': '='
            },
            link: function ($scope, $element, $attrs) {
                var $list = $element.find('.timeline');

                $scope.selectDay = function selectDay(index) {
                    $scope.active = $scope.days[index];
                };

                function buildTimeline() {
                    $list.html($compile('<li ng-click="selectDay(0)"><span class="glyphicon glyphicon-time"></span></li>')($scope));

                    if (!$scope.days || !$scope.days.length)
                        return;

                    var currentMonth = -1;
                    $list.detach();

                    for (var i = 0; i < $scope.days.length; i++) {
                        var date = $scope.days[i];
                        var monthId = date.getMonth().toString() + date.getFullYear();

                        if (monthId != currentMonth) {
                            currentMonth = monthId;
                            var monthName = getMonthName(date.getMonth());

                            $list.append($compile('<li ng-click="selectDay(' + i + ')" class="month">' +
                                monthName + '</li>')($scope));
                        }

                        $list.append($compile('<li ng-click="selectDay(' + i + ')" class="day" month="' +
                            monthId + '">' + date.getDate() + '</li>')($scope));
                    }

                    $list.prependTo($element);
                    selectActive(null);
                }

                function selectActive(cur, prev) {
                    var DURATION = 200;

                    $list.find('.active').removeClass('active');

                    if (!$scope.active)
                        return $list.find('.day').hide();

                    var monthId = $scope.active.getMonth().toString() + $scope.active.getFullYear();

                    var sameMonth = prev && prev.getMonth() == cur.getMonth() && prev.getFullYear() == cur.getFullYear();

                    if (!sameMonth) {
                        $list.find('.day[month!=' + monthId + ']').animate({height: 0}, DURATION, function () {
                            $(this).hide();
                        });

                        $list.find('[month=' + monthId + ']').show().css('height', 0).animate({height: '48px'}, DURATION);
                    }

                    var month = $scope.active.getMonth();
                    var year = $scope.active.getFullYear();
                    var day = $scope.active.getDate();
                    for (var i = 0; i < $scope.days.length; i++) {
                        var date = $scope.days[i];
                        if (date.getDate() == day && date.getMonth() == month && date.getFullYear() == year)
                            break;
                    }
                    $list.find('.day').eq(i).addClass('active');
                }

                $scope.$watch('days', buildTimeline);
                $scope.$watch('active', selectActive);
            },
            template: '<ul class="timeline"></ul>'
        };
    }]);

