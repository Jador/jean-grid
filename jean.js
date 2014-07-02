angular.module('jnGrid', []);

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

angular.module('jnGrid')

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

.filter('jnfilter', ['$filter', function($filter) {
  return function(value, spec) {

    if(spec) {

      var args = spec.split(/:\s/);
      var filter = $filter(args.shift());
      args.unshift(value);

      return filter.apply(null, args);
    }
    else {
      return value;
    }

  }
}]);

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

angular.module('jnGrid')

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
      el.attr('colspan', scope.options.columns.length + (scope.options.enableCheckbox ? 1 : 0));
      el.attr('ng-class', '{ jnRowEven: $even, jnRowOdd: $odd }');
      el.attr('ng-show', 'row.show');

      scope.options.accordion = $compile(el);
    }
  }

  function defaultProperties(scope) {
    for(var i in PROPERTIES) {
      var prop = PROPERTIES[i];

      if(scope.options[prop.property] === undefined || scope.options[prop.property] === null) {
        scope.options[prop.property] = prop.default;
      }
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

  var PROPERTIES = [
    { property: 'enableRowSelection', default: true },
    { property: 'selectByCheckboxOnly', default: false },
    { property: 'enableCheckbox', default:false },
    { property: 'multiSelect', default:false }
  ];

  return {
    restrict: 'EA',
    scope: {
      dataset: '=',
      options: '=?',
    },
    templateUrl: 'jnGrid.html',
    link: function(scope) {
      scope.options = scope.options || {}

      defaultProperties(scope);

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
  };

}]);

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

angular.module('jnGrid')

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

    return accordion;

  }

  var selector = function(scope, element, accordion) {

    function select() {

      var CHECKBOX = element[0].querySelector('input[type="checkbox"]');

      if(scope.options.multiSelect) {
        scope.options.selected.rows.push(scope.row);
      }
      else {
        scope.options.selected.rows[0] = scope.row;

        var parent = element.parent();

        angular.element(parent[0].querySelector('jn-grid-row.selected')).removeClass('selected');
        angular.element(parent[0].querySelector('.jnAccordion.selected')).removeClass('selected');

        if(CHECKBOX) {
          checkboxes = parent[0].querySelectorAll('input[type="checkbox"]');

          for(i in checkboxes) {
            if(checkboxes[i] !== CHECKBOX) {
              checkboxes[i].checked = false;
            }
          }

        }
      }

      element.addClass('selected');

      if(CHECKBOX && CHECKBOX.checked === false) {
        CHECKBOX.checked = true;
      }

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

    return {
      selectFn: function(checkbox, event) {

        if(checkbox === true) {
          event.stopPropagation();
        }

        if(scope.options.enableRowSelection) {
          if(!scope.options.selectByCheckboxOnly || checkbox === true) {

            if(scope.options.selected.rows.indexOf(scope.row) > -1) {
              deselect(checkbox);
            }
            else {
              select(checkbox);
            }
          }
        }

        if(accordion) {
          if(scope.options.showAccordionFn) {
            scope.options.showAccordionFn(scope.row);
          }
          else {
            scope.row.show = !scope.row.show;
          }

          setTimeout(function() { scope.$apply(); }, 0);

        }
      }
    }
  }

  function createCells(scope, element) {
    var cols = scope.options.columns;

    if(scope.options.enableCheckbox) {
      element.append($compile('<td style="width:1em; padding:0.5em;"><input type="checkbox" ng-click="selectRow(true, $event)"/></td>')(scope));
    }

    for(var i in cols) {
      element.append($compile('<div jn-grid-cell value="row.' + cols[i].field + '" filter="' + (cols[i].filter ? cols[i].filter : '') + '"></div>')(scope));
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

      var accordion = createAccordion(scope, element, scope.options.accordion);
      scope.selectRow = selector(scope, element, accordion).selectFn;

      element.bind('click', scope.selectRow);

    }
  };

}]);
