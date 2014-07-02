angular.module('jnGrid')

.directive('jnGridHeader', [function() {

  return {
    restrict: 'EA',
    requires: 'jnGrid',
    replace: true,
    template: '<th class="jnHeader th-{{ $parent.$id }} {{ column.sortable ? \'clickable\' : \'\' }}" ng-click="clickFn()">{{ column.displayName || column.field }}</th>',
    link: function(scope, element) {

      if(scope.$first && scope.options.enableCheckbox) {
        element.parent().prepend('<th></th>');
      }

      scope.clickFn = function() {
        if(scope.column.sortable) {
          if(scope.$parent.sortCol === scope.column.field) {
            scope.$parent.sortDir = !scope.$parent.sortDir;
          }
          else {

            var selector = '.th-' + scope.$parent.$id + '.sorted';

            angular.element(document.querySelector(selector)).removeClass('sorted');
            element.addClass('sorted');
            scope.$parent.sortCol = scope.column.field;
            scope.$parent.sortDir = false;
          }

          element.removeClass('sort-' + !scope.$parent.sortDir);
          element.addClass('sort-' + scope.$parent.sortDir);
        }
      };
    }
  };

}]);
