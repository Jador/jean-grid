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
    restrict: 'A',
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
