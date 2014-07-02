angular.module('jnGrid')

.directive('jnGridCell', [function() {
  return {
    restrict: 'EA',
    requires: 'jnGrid',
    replace: true,
    scope: {
      value: '=',
      filter: '@?'
    },
    template: '<td>{{ value | jnfilter: filter }}</td>',
  };
}]);
