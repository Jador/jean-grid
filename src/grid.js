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
