var app = angular.module('dbpedia-events-ui');

app.controller('EditorController', ['$scope', '$http', function ($scope, $http) {

    var prefixes = "@prefix dig:        <http://events.dbpedia.org/data/digests#> .\
@prefix dbe:        <http://events.dbpedia.org/ns/core#> . \
@prefix dcterms:    <http://purl.org/dc/terms/> .\
@prefix rdf:        <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\
@prefix dc:         <http://purl.org/dc/elements/1.1/> .\
@prefix spin:       <http://spinrdf.org/spin#> .\
@prefix xsd:        <http://www.w3.org/2001/XMLSchema#> ."

    $scope.ontologies = [];
    $scope.filters = [];

    $scope.addOntology = function () {
        $scope.ontologies.push($scope.newOntology);
        $scope.newOntology = "";
    };

    $scope.removeOntology = function (ontology) {
        console.log($scope.ontologies);
        var index = $scope.ontologies.indexOf(ontology);
        if (index > -1) {
            $scope.ontologies.splice(index, 1);
        }
        console.log($scope.ontologies);
    };

    $scope.addFilter = function () {
        $scope.filters.push($scope.newFilter);
        $scope.newFilter = "";
    };

    $scope.removeFilter = function (filter) {
        console.log($scope.filters);
        var index = $scope.filters.indexOf(filter);
        if (index > -1) {
            $scope.filters.splice(index, 1);
        }
        console.log($scope.filters);
    };

    $scope.templates = [];

    $scope.loadTemplates = function () {
        $http({
            method: 'GET',
            url: '/template'
        }).then(function successCallback(response) {
            console.log(response);
            $scope.templates = response.data;
        }, function errorCallback(response) {
            console.log(response);
        });
    };

    $scope.loadTemplates();

    $scope.loadTemplateIntoEditor = function (template) {
        $scope.name = template.name;
        $scope.description = template.description;
        $scope.ontologies = template.ontologies;
        $scope.descriptionTemplate = template.descriptionTemplate;
        $scope.filters = template.filters || [];
        $scope.rankWeight = template.rankWeight;
    };

    $scope.deleteTemplate = function (templateName) {
        $http({
            method: 'DELETE',
            url: '/template/' + templateName
        }).then(function successCallback() {
            console.log("Deleted template " + templateName + " successfully")
        }, function errorCallback(response) {
            console.log(response);
        });
        $scope.loadTemplates();
    };


    $scope.saveTemplate = function () {

        var templateText = prefixes + angular.element(document.getElementById("template")).text();
        var queryString = angular.element(document.getElementById("queryString")).text();
        var contextQueryString = angular.element(document.getElementById("contextQueryString")).text();


        var template = {
            "name": $scope.name,
            "description": $scope.description,
            "queryString": queryString,
            "ontologies": $scope.ontologies,
            "contextQueryString": contextQueryString,
            "descriptionTemplate": $scope.descriptionTemplate,
            "filters": $scope.filters,
            "rankWeight": $scope.rankWeight,
            "templateText": templateText
        };
        if(templateAlreadyDefined(template.name)) {
            updateTemplate(template);
        } else {
            createTemplate(template);
        }
        $scope.loadTemplates();
    };

    function templateAlreadyDefined(name) {
        var templates = $scope.templates;
        for (var i = 0; i < templates.length; i++) {
            if (name == templates[i].name) {
                return true;
            }
        }
        return false;
    }

    function updateTemplate(template) {

        $http({
            method: 'PATCH',
            url: '/template/' + template.name,
            data: {
                "name": template.name,
                "query": template
            },
            headers: {
                'Content-Type': 'application/json'
            },
            success: function (data, status) {
                console.log("Updated template successfully");
            }
        });
        $scope.loadTemplates();
    }

    function createTemplate(template) {
        $http({
            method: 'POST',
            url: '/template',
            data: {
                "name": template.name,
                "query": template
            },
            headers: {
                'Content-Type': 'application/json'
            },
            success: function (data, status) {
                console.log("Saved new template successfully");
            }
        });
    }

    $scope.testTemplate = function () {
        var templateText = prefixes + angular.element(document.getElementById("template")).text();
        $http.post('/events/custom', {
            "templateText": templateText
        }).then(function(response) {
            console.log(response.data);
            console.log("Sent new template to backend");
        });
    };

    $scope.noTemplates = function () {
        return $scope.templates.length < 1;
    };
}]);
