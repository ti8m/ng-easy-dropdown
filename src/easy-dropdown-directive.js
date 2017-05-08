/**
 * Get the collection out ogf a comprehension string such as 'for i in [1, 2, 3, 4, 5]'
 * @param comprehensionString
 * @returns {*|XML|string|void}
 */
function getCollectionName(comprehensionString) {
  return comprehensionString.replace(/.*\sin\s([^ ]+).*/, '$1');
}

function easyDropdownDirective($timeout) {
  return {
    restrict: 'A',
    controller: 'easyDropdownController',
    scope: {
      settings: '<',
    },
    link: (scope, element, attrs, ctrl) => {

      function init() {
        ctrl.init(element, scope.settings || {});
      }

      function watchCollection(collection) {
        $timeout(() => {
          if (!collection.match(/\[.*\]/)) {
            // dynamic list -> watch for changes
            scope.$watchCollection(() => scope.$parent[collection], () => {
              $timeout(() => {
                if (ctrl.rendered) {
                  ctrl.destroy();
                }
                init();
              });
            }, true);
          } else {
            // static list -> no need to watch it
            init();
          }
        });
      }

      // ng-options -> watch the options
      if (attrs.ngOptions) {
        // watch for option changes
        watchCollection(getCollectionName(attrs.ngOptions));
      }

      $timeout(() => {
        const options = [].slice.call(element.find('option'));
        const optionWithNgRepeat = options.find(n => n.hasAttribute('ng-repeat'));
        if (optionWithNgRepeat) {
          // // ng-repeat -> watch for collection changes
          watchCollection(getCollectionName(optionWithNgRepeat.getAttribute('ng-repeat')));
        } else {
          // static options -> render without watching
          init();
        }
      });
    },
  };
}

easyDropdownDirective.$inject = ['$timeout'];

export default easyDropdownDirective;

