var app = angular.module('dbpedia-events-ui', ['ngRoute']);

app.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.when('/', {
            controller: 'TimelineController',
            templateUrl: 'views/timeline.html'
        }).when('/editor', {
            controller: 'EditorController',
            templateUrl: 'views/template-editor.html'
        }).when('/resource', {
            controller: 'ResourceController',
            templateUrl: 'views/resource.html'
        }).otherwise({
            redirectTo: '/'
        });
    }])
    .factory('dbpCategoryList', function () {
        var categories = [
            {
                label: 'All Categories',
                tmpl: [],
                icon: 'magic'
            },
            {
                label: 'Awarded',
                tmpl: ['http://events.dbpedia.org/data/digests#AWARDED'],
                desc: ['%%labelres%% awarded with the %%award%%.'],
                icon: 'award'
            },
            {
                label: 'Change of Leader',
                tmpl: ['http://events.dbpedia.org/data/digests#LEADER'],
                desc: ['%%newLeader%% succeeds %%oldLeader%% as the leader of %%labelres%%.'],
                icon: 'users'
            },
            {
                label: 'Deceased People',
                tmpl: ['http://events.dbpedia.org/data/digests#DEADPEOPLE', 'http://events.dbpedia.org/data/digests#DEADPEOPLEWOF'],
                desc: ['%%labelres%% died on %%deathdate%% in %%deathplace%%.', '%%labelres%% died on %%deathdate%% in %%deathplace%%.'],
                icon: 'religious-christian'
            },
            {
                label: 'Released Things',
                tmpl: ['http://events.dbpedia.org/data/digests#RELEASED'],
                desc: ['%%labelres%% is released on %%releasedate%%.'],
                icon: 'plus'
            },
            {
                label: 'Introduced Things',
                tmpl: ['http://events.dbpedia.org/data/digests#INTRODUCED'],
                desc: ['%%labelres%% is introduced on %%introductionDate%%.'],
                icon: 'sun'
            },
            {
                label: 'Rising Numbers',
                tmpl: ['http://events.dbpedia.org/data/digests#RISINGNUMBERS'],
                desc: ['%%labelres%%\'s %%p%% raised from %%old%% to %%new%%.'],
                icon: 'chart-line'
            },
            {
                label: 'Headhunted',
                tmpl: ['http://events.dbpedia.org/data/digests#HEADHUNTED'],
                desc: ['%%labelres%% switches from %%oldTeam%% to %%newTeam%%.'],
                icon: 'user-plus'
            },
            {
                label: 'Change of President',
                tmpl: ['http://events.dbpedia.org/data/digests#PRESIDENT'],
                desc: ['%%newPres%% succeeds %%oldPres%% as the president of %%labelres%%.'],
                icon: 'users'
            },
            {
                label: 'Europe 2015',
                tmpl: ['http://events.dbpedia.org/data/digests#EUROPE2015'],
                desc: ['Highlighted event for Europe in 2015 %%labelres%%.'],
                icon: 'euro'
            },
            {
                label: 'Winners Announced',
                tmpl: ['http://events.dbpedia.org/data/digests#GRANDPRIX', 'http://events.dbpedia.org/data/digests#PODIUM'],
                desc: ['%%firstD (%%firstT%%) wins %%labelres%%, %%secondD%% (%%secondT%%) got second, %%thirdD%% (%%thirdT%%) third.', 'Gold for %%gold%%, Silver for %%silver%%, Bronze for %%bronze%% in %%labelres%%.'],
                icon: 'award-1'
            },
            {
                label: 'Just Married',
                tmpl: ['http://events.dbpedia.org/data/digests#JUSTMARRIED'],
                desc: ['%%labelres%% married %%spouse%%.'],
                icon: 'heart'
            },
            {
                label: 'Just Divorced',
                tmpl: ['http://events.dbpedia.org/data/digests#JUSTDIVORCED'],
                desc: ['%%labelres%% divorced %%spouse%%.'],
                icon: 'heart-broken'
            },
            {
                label: 'Aircraft Occurence',
                tmpl: ['http://events.dbpedia.org/data/digests#AIRCRAFTOCCURRENCE'],
                desc: ['%%type%% with %%labelres%% from %%origin%% to %%destination%%.'],
                icon: 'paper-plane'
            },
            {
                label: 'Volcano Eruption',
                tmpl: ['http://events.dbpedia.org/data/digests#VOLCANO'],
                desc: ['Eruption of %%labelres%%.'],
                icon: 'fire'
            }
        ];

        function arrayEqual(a, b) {
            if (a.length != b.length)
                return false;
            for (var i = 0; i < a.length; i++)
                if (a[i] != b[i])
                    return false;
            return true;
        };

        function categoryForTmpl(tmpl) {
            if (typeof tmpl === 'string')
                return categories.filter(function (c) {
                    return c.tmpl.indexOf(tmpl) >= 0;
                })[0];
            else
                return categories.filter(function (c) {
                    return arrayEqual(c.tmpl, tmpl);
                })[0];
        }

        function escapeRegExp(str) {
            // http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }

        function insertDataLinks(desc, tmpl) {
            var category = categoryForTmpl(tmpl);
            if (!category)
                return;

            var descTemplate = category.desc[category.tmpl.indexOf(tmpl)];
            if (!descTemplate)
                return;

            var regex = escapeRegExp(descTemplate).replace(/%%.+?%%/g, "(.+)");

            return desc.split('<br>').map(function (line) {
                var current = 0;
                var matches = line.match(regex);
                return descTemplate.replace(/%%(.+?)%%/g, function () {
                    current++;
                    return '<dbp-data-link href="' + matches[current] + '">' + matches[current] + '</dbp-data-link>';
                });
            }).join('<br>');
        }

        return {
            categoryForTmpl: categoryForTmpl,
            insertDataLinks: insertDataLinks,
            categories: categories,
            arrayEqual: arrayEqual
        };
    })
    .directive('dbpLateCompile', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            scope: {
                dbpLateCompile: '='
            },
            link: function ($scope, $element, $attrs) {
                $scope.$watch('dbpLateCompile', function (val) {
                    $element.html('');
                    $element.append($compile('<div>' + val + '</div>')($scope));
                });
            }
        };
    }]);

