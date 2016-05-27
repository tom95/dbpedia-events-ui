var app = angular.module('dbpedia-events-ui');

app.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which == 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.keyEnter, {'event': event});
                });
                event.preventDefault();
            }
        });
    };
});
