var app = angular.module('dbpedia-events-ui');

app.controller('EditorController', ['$scope', '$http', function($scope, $http) {

    $scope.ontologies = [];
    $scope.filters = [];

    $scope.addOntology = function() {
        $scope.ontologies.push($scope.newOntology);
        $scope.newOntology = "";
    };

    $scope.removeOntology = function(ontology) {
        console.log($scope.ontologies)
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
        console.log($scope.filters)
        var index = $scope.filters.indexOf(filter);
        if (index > -1) {
            $scope.filters.splice(index, 1);
        }
        console.log($scope.filters);
    };

    $scope.submit = function() {
        $scope.fulltemplate = 'dig:' + $scope.name + ' a dbe:DigestTemplate ;\
 dcterms:identifier ' + $scope.name + ' ;\
 dcterms:description ' + '"""' + $scope.description + '"""@en ;\
 dbe:queryString ' + '"""' + $scope.queryString + '""" ;\
 dbe:contextQueryString ' + '"""' + $scope.contextQueryString + '""" ;\
 dbe:descriptionTemplate ' + '"""' + $scope.descriptionTemplate + '""" ;\
 dbe:rankWeight ' + '"' + $scope.rankWeight + '"' + '^^xsd:float ; .';

        var template = {
            fulltemplate: $scope.fulltemplate,
            name: $scope.name,
            description: $scope.description,
            queryString: $scope.queryString,
            contextQueryString: $scope.contextQueryString,
            descriptionTemplate: $scope.descriptionTemplate,
            rankWeight: $scope.rankWeight
        };

        console.log(template);



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
              console.log("Posted data successfully");
            }
        });

        // $http.post("/template", entry).success(function(data, status) {
        //     console.log('Data posted successfully');
        // });
    };


}]);
