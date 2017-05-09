import { getElementIndex } from './helpers';

/**
 * Get the collection out of a comprehension string such as
 * 'for i in [1, 2, 3, 4, 5]' or 'for i in array' etc...
 * @param comprehensionString
 * @returns {string}
 */
function getCollectionName(comprehensionString) {
  return comprehensionString.replace(/.*\sin\s([^ ]+).*/, '$1');
}

function easyDropdownDirective($timeout) {
  return {
    restrict: 'A',
    controller: 'easyDropdownController',
    require: ['easyDropdown', '?ngModel'],
    scope: {
      settings: '<',
    },
    link: (scope, element, attrs, [ctrl, ngModelController]) => {

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

      if (ngModelController) {
        // watch model changes and set the dropdown value if the value changed
        scope.$watch(() => ngModelController.$modelValue, (newValue) => {
          if (newValue && ctrl.rendered) {
            $timeout(() => {
              const selectedOption = element[0].querySelector('[selected]');

              if (selectedOption) {
                const index = getElementIndex(selectedOption);
                ctrl.select(index);
              }
            });
          }
        });
      }
    },
  };
}

easyDropdownDirective.$inject = ['$timeout'];

export default easyDropdownDirective;

