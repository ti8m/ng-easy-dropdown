import angular from 'angular';

import controller from './controller.js';

angular.module('ng-easy-dropdown', [])
    .run(() => console.log('loaded!'))
    .directive('easyDropdown', () => ({
      controller,
      template: '<select class="dropdown"><option value="1">Option 1</option> <option value="2">Option 2</option> <option value="3">Option 3</option> <option value="4">Option 4</option></select>',
      transclude: true,
      scope: {
        settings: '<',
      },
      link: (scope, element, attrs, controller) => {
        console.log('linking!');
        const domNode = element.find('select')[0];

        controller.init(domNode, scope.settings || {});
      },
    }));
