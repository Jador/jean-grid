angular.module('jnGrid', [])

  .factory('syncService', [function() {
    function get(url) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    }

    return {
      get: get
    }

  }])

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
      template: '<th class="jnHeader th-{{ $parent.$id }} {{ column.sortable ? \'clickable\' : \'\' }}" ng-click="clickFn()">{{ column.displayName || column.field }}</th>',
      link: function(scope, element) {

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

  }])

  //======================//
  //     Row Directive    //
  //======================//
  .directive('jnGridRow', ['$compile', '$rootScope', function($compile, $rootScope) {

    function createAccordion(scope, element, template) {
      var accordion;

      if(template) {

        template(scope, function(el) {
          accordion = el;
          element.after(el);
          element.addClass('clickable');
        });

      }

      element.bind('click', function() { selectRow(scope, element, accordion); });
    }

    function selectRow(scope, element, accordion) {

      if(scope.options.enableRowSelection) {
        // TODO !scope.options.selectByCheckboxOnly
        if(scope.options.selected.rows.indexOf(scope.row) > -1) {
          deselect();
        }
        else {
          select();
        }
      }

      function select() {
        if(scope.options.multiSelect) {
          scope.options.selected.rows.push(scope.row);
        }
        else {
          scope.options.selected.rows[0] = scope.row;
          angular.element(document.querySelector('jn-grid-row.selected')).removeClass('selected');
          angular.element(document.querySelector('.jnAccordion.selected')).removeClass('selected');
        }

        element.addClass('selected');

        if(accordion) {
          accordion.addClass('selected');
        }

        scope.options.selected.item = scope.row;
        scope.$emit('jnRowSelect', scope.options.id, scope.row);
      }

      function deselect() {
        if(scope.options.multiSelect) {
          var idx = scope.options.selected.rows.indexOf(scope.row);
          if(idx > -1) {
            scope.options.selected.rows.splice(idx, 1);
          }
        }
        else {
          scope.options.selected.rows[0] = undefined;
        }

        element.removeClass('selected');

        if(accordion) {
          accordion.removeClass('selected');
        }

        scope.options.selected.item = undefined;
        scope.$emit('jnRowDeselect', scope.options.id, scope.row);
      }

      if(accordion) {
        if(scope.options.showAccordionFn) {
          scope.options.showAccordion(scope.row);
        }
        else {
          scope.row.show = !scope.row.show;
        }

        scope.$apply();
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
        row.show = false;

        scope.$watch('dataset', function() {
          createCells(scope, element);
        });

        createAccordion(scope, element, scope.options.accordion);
      }
    };
  }])

  //======================//
  //    Grid Directive    //
  //======================//
  .directive('jnGrid', ['$compile', '$templateCache', 'syncService', function($compile, $templateCache, sync) {

    function getRemoteTemplate(url) {
      var template = sync.get(url);
      $templateCache.put(url, template);
      return template;
    }

    function createAccordionTemplate(scope) {

      if(scope.options.accordionUrl) {
        scope.options.accordion = $templateCache.get(scope.options.accordionUrl) || getRemoteTemplate(scope.options.accordionUrl);
      }

      if(scope.options.accordion) {
        var el = angular.element('<td>' + scope.options.accordion + '</td>');

        el.addClass('jnAccordion');
        el.attr('colspan', scope.options.columns.length);
        el.attr('ng-class', '{ jnRowEven: $even, jnRowOdd: $odd }');
        el.attr('ng-show', 'row.show');

        scope.options.accordion = $compile(el);
      }
    }

    function createColumns(scope) {
      var IGNORED_PROPERTIES = [ '$$hashKey', 'clicked', 'show' ];

      if(scope.dataset && scope.dataset.length > 0) {
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
    }

    return {
      restrict: 'EA',
      scope: {
        dataset: '=',
        options: '=?',
      },
      template: '<table>'+
                  '<tr><jn-grid-header ng-repeat="column in options.columns"></jn-grid-header></tr>'+
                  '<jn-grid-row '+
                      'ng-class="{ jnRowEven: $even, jnRowOdd: $odd }"' +
                      'ng-repeat="row in dataset | orderBy:sortCol:sortDir">' +
                  '</jn-grid-row>'+
                '</table>',
      link: function(scope) {
        scope.options = scope.options || {}

        if(scope.options.enableRowSelection === undefined) {
          scope.options.enableRowSelection = true;
        }

        scope.options.selected = {};
        scope.options.selected.rows = [];

        if(!scope.options.columns) {
          scope.$watch('dataset', function() {
            createColumns(scope);
          });
        }

        createColumns(scope);
        createAccordionTemplate(scope);
      }
    }
  }]);
