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
