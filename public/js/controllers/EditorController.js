var app = angular.module('dbpedia-events-ui');

app.controller('EditorController', ['$scope', '$http', function($scope, $http) {

    $scope.ontologies = [];
    $scope.filters = [];

    $scope.addOntology = function() {
        $scope.ontologies.push($scope.newOntology);
        $scope.newOntology = "";
    };

    $scope.removeOntology = function(ontology) {
        console.log($scope.ontologies);
        var index = $scope.ontologies.indexOf(ontology);
        if (index > -1) {
            $scope.ontologies.splice(index, 1);
        }
        console.log($scope.ontologies);
    };

    $scope.addFilter = function() {
        $scope.filters.push($scope.newFilter);
        $scope.newFilter = "";
    };

    $scope.removeFilter = function(filter) {
        console.log($scope.filters);
        var index = $scope.filters.indexOf(filter);
        if (index > -1) {
            $scope.filters.splice(index, 1);
        }
        console.log($scope.filters);
    };

    $scope.submit = function() {

        var templateText = angular.element(document.getElementById("template")).text();
        var queryString = angular.element(document.getElementById("queryString")).text();
        var contextQueryString = angular.element(document.getElementById("contextQueryString")).text();


        var template = {
            "templateText": templateText,
            "name": $scope.name,
            "description": $scope.description,
            "queryString": queryString,
            "ontologies": $scope.ontologies,
            "contextQueryString": contextQueryString,
            "descriptionTemplate": $scope.descriptionTemplate,
            "rankWeight": $scope.rankWeight
        };

        console.log(template)



        $http({
            method: 'POST',
            url: '/template',
            data: {
                "name": $scope.name,
                "query": template
            },
            headers: {
                'Content-Type': 'application/json'
            },
            success: function(data, status) {
                console.log("Posted template successfully");
            }
        });
    };


}]);
