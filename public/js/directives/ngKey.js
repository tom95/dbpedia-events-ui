// Used for keybindings
var app = angular.module('dbpedia-events-ui');

app.directive('ngEnter', function () {
    return {
        link: function (scope, elements, attrs) {
            elements.bind('keydown keypress', function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter);
                    });
                    event.preventDefault();
                }
            });
        }
    };
});

app.directive('ngEsc', function () {
    return {
        link: function (scope, elements, attrs) {
            elements.bind('keydown keypress', function (event) {
                if (event.which === 27) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEsc);
                    });
                    event.preventDefault();
                }
            });
        }
    };
});
