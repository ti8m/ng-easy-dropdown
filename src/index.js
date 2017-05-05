import angular from 'angular';

import easyDropdownController from './easy-dropdown-controller';

angular.module('ng-easy-dropdown', [])
    .directive('easyDropdown', () => ({
      controller: easyDropdownController,
      template: '<select class="dropdown"><option value="1">Option 1</option> <option value="2">Option 2</option> <option value="3">Option 3</option> <option value="4">Option 4</option></select>',
      transclude: true,
      scope: {
        settings: '<',
      },
      link: (scope, element, attrs, ctrl) => {
        const domNode = element.find('select')[0];

        ctrl.init(domNode, scope.settings || {});
      },
    }));
