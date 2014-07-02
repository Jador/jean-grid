angular.module('jnGrid')

.run(['$templateCache', function($templateCache) {
  $templateCache.put('jnGrid.html',
    '<table>'+
      '<tr>' +
        '<jn-grid-header ng-repeat="column in options.columns"></jn-grid-header>' +
      '</tr>' +
      '<jn-grid-row '+
        'ng-class="{ jnRowEven: $even, jnRowOdd: $odd }"' +
        'ng-repeat="row in dataset | orderBy:sortCol:sortDir">' +
      '</jn-grid-row>'+
    '</table>');
}]);
