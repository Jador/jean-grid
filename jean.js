angular.module('jnGrid', [])

  //======================//
  //    Cell Directive    //
  //======================//
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

  //======================//
  //   Header Directive   //
  //======================//
  .directive('jnGridHeader', [function() {

    return {
      restrict: 'EA',
      requires: 'jnGrid',
      replace: true,
      template: '<th>{{ column.displayName || column.field }}</th>'
    };

  }])

  //======================//
  //     Row Directive    //
  //======================//
  .directive('jnGridRow', ['$compile', '$rootScope', function($compile, $rootScope) {

    function createAccordion(scope, element, template) {
      if(template) {

        template(scope, function(el) {
          element.after(el);
          element.addClass('clickable');
        });

        element.bind('click', function() {
          scope.row.clicked = !scope.row.clicked;
          scope.$apply();
        });

      }
    }

    function createCells(scope, element) {

      var keys = scope.options.columns;

      for(var i in keys) {
        element.append($compile('<div jn-grid-cell value="row.' + keys[i].field + '"></div>')(scope));
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

  //======================//
  //    Grid Directive    //
  //======================//
  .directive('jnGrid', ['$compile', function($compile) {

    function createAccordionTemplate(scope) {
      if(scope.options.accordion) {
        var el = angular.element('<td>' + scope.options.accordion + '</td>');

        el.addClass('jnAccordion');
        el.attr('colspan', scope.options.columns.length);
        el.attr('ng-class', '{ jnRowEven: $even, jnRowOdd: $odd }');
        el.attr('ng-show', 'row.clicked'); //append click handler | will make smarter later

        scope.options.accordion = $compile(el);
      }
    }

    function createColumns(scope) {
      var IGNORED_PROPERTIES = [ '$$hashKey', 'clicked' ];

      if(!scope.options.columns) {
        scope.options.columns = [];
        var temp = Object.keys(scope.dataset[0]);

        for(var i in temp) {
          var key = temp[i];

          if(IGNORED_PROPERTIES.indexOf(key) === -1) {
            scope.options.columns.push({ field: key });
          }
        }
      }
    }

    return {
      restrict: 'EA',
      scope: {
        dataset: '=',
        options: '=?'
      },
      template: '<tr><jn-grid-header ng-repeat="column in options.columns"></jn-grid-header></tr>'+
                '<jn-grid-row ng-class="{ jnRowEven: $even,' +
                                       '  jnRowOdd: $odd }"' +
                             'ng-repeat="row in dataset">' +
                '</jn-grid-row>',
      link: function(scope) {
        scope.options = scope.options || {}
        createColumns(scope);
        createAccordionTemplate(scope);
      }
    }
  }]);
