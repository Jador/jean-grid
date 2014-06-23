angular.module('jnGrid', [])

  .directive('jnGridCell', [function() {
    return {
      restrict: 'EA',
      requires: 'jnGrid',
      replace: true,
      scope: {
        value: '='
      },
      template: '<td>{{ value }}</td>'
    };
  }])

  .directive('jnGridRow', ['$compile', '$rootScope', function($compile, $rootScope) {

    var IGNORED_PROPERTIES = [ '$$hashKey', 'clicked' ];

    function createAccordion(scope, element, template) {
      if(template) {

        template(scope, function(el) {
          element.after(el);
        });

        element.bind('click', function() {
          scope.row.clicked = !scope.row.clicked;
          scope.$apply();
        });

      }
    }

    function createCells(scope, element) {
      if(!scope.options.columns) {
        var keys = Object.keys(scope.row);

        for(var i in keys) {
          var key = keys[i];

          if(IGNORED_PROPERTIES.indexOf(key) === -1) {
            element.append($compile('<div jn-grid-cell value="row.' + key + '"></div>')(scope));
          }

        }
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

            createCells(scope, element);
            createAccordion(scope, element, scope.options.template);
          }
        };
      }
    };
  }])

  .directive('jnGrid', ['$compile', function($compile) {

    function createAccordionTemplate(scope) {
      if(scope.options.template) {
        var el = angular.element(scope.options.template);

        el.addClass('jn-accordion');
        el.attr('ng-show', 'row.clicked'); //append click handler | will make smarter later

        scope.options.template = $compile(el);
      }
    }

    return {
      restrict: 'EA',
      scope: {
        dataset: '=',
        options: '='
      },
      template: '<jn-grid-row ng-repeat="row in dataset"></jn-grid-row>',
      link: function(scope) {
        scope.options = scope.options || {}
        createAccordionTemplate(scope);
      }
    }
  }]);
