angular.module('jnGrid', [])

  .directive('jnGridCell', [function() {
    return {
      restrict: 'EA',
      requires: 'jnGrid',
      scope: {
        content: '@'
      },
      template: '<div class="jn-cell">{{ content }}</div>'
    };
  }])

  .directive('jnGridRow', ['$compile', function($compile) {

    function createAccordion(scope, element, template) {
      if(template) {
        var el = angular.element(scope.options.template);
        el.attr('ng-show', 'row.clicked');

        element.append(el);

        $compile(el)(scope);

        element.bind('click', function() {
          scope.row.clicked = !scope.row.clicked;
          scope.$apply();
        });
      }
    }

    return {
      restrict: 'EA',
      requires: 'jnGrid',

      compile: function() {
        return {
          pre: function(scope, element) {

            var row = scope.row;
            row.clicked = false;

            element.append(row.name);
            createAccordion(scope, element, scope.options.template);

          }
        };
      }
    };
  }])

  .directive('jnGrid', ['$compile', function($compile) {
    return {
      restrict: 'EA',
      scope: {
        dataset: '=',
        options: '='
      },
      template: '<div ng-repeat="row in dataset">' +
                  '<div jn-grid-row></div>' +
                '</div>',
      link: function(scope) {
        scope.options = scope.options || {}
      }
    }
  }]);
