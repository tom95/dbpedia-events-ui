var app = angular.module('dbpedia-events-ui');

app.controller('TabController', function() {
	this.tab = 0;
  this.setTab = function(newTab) {
    this.tab = newTab;
    console.log(this.tab);
  };

  this.isSet = function(tabIndex) {
    return this.tab == tabIndex;
  };
});
