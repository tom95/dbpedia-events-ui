var app = angular.module('dbpedia-events-ui');

app.controller('EditorController', ['$scope', '$http', function($scope, $http) {
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

        var entry = {
            name: $scope.name,
            query: template
        };

        $http({
            method: 'POST',
            url: '/template',
            data: entry,
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
