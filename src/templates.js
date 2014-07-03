angular.module('jnGrid')

.run(['$templateCache', '$sce', function($templateCache, $sce) {

  'use strict';

  $templateCache.put('jnGrid.html', $sce.trustAsHtml(
    '<table>'+
      '<thead>' +
        '<tr class="jnHeaderRow">' +
          '<th jn-grid-header ng-repeat="column in options.columns"></th>' +
        '</tr>' +
      '</thead>' +
      '<tbody>' +
        '<tr jn-grid-row '+
          'ng-class="{ jnRowEven: $even, jnRowOdd: $odd }"' +
          'ng-repeat="row in dataset | orderBy:sortCol:sortDir">' +
        '</tr>'+
      '</tbody>' +
    '</table>'));
}]);
