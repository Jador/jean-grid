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

      var keys = [];

      if(!scope.options.columns) {
        var temp = Object.keys(scope.row);

        for(var i in temp) {
          var key = temp[i];

          if(IGNORED_PROPERTIES.indexOf(key) === -1) {
            keys.push({ field: key });
          }
        }
      }
      else {
        keys = scope.options.columns;
      }

      for(var i in keys) {
        var key = keys[i];
        element.append($compile('<div jn-grid-cell value="row.' + key.field + '"></div>')(scope));
      }

    }

    return {
      restrict: 'EA',
      requires: 'jnGrid',

      link: function(scope, element) {
        var row = scope.row;
        row.clicked = false;

        createCells(scope, element);
        createAccordion(scope, element, scope.options.accordion);
      }
    };
  }])

  .directive('jnGrid', ['$compile', function($compile) {

    function createAccordionTemplate(scope) {
      if(scope.options.accordion) {
        var el = angular.element(scope.options.accordion);

        el.addClass('jnAccordion');
        el.attr('ng-show', 'row.clicked'); //append click handler | will make smarter later

        scope.options.accordion = $compile(el);
      }
    }

    return {
      restrict: 'EA',
      scope: {
        dataset: '=',
        options: '=?'
      },
      template: '<jn-grid-row ng-class="{jnRowEven: $even, jnRowOdd: $odd}" ng-repeat="row in dataset"></jn-grid-row>',
      link: function(scope) {
        scope.options = scope.options || {}
        createAccordionTemplate(scope);
      }
    }
  }]);
