import angular from 'angular';

import easyDropdownController from './easy-dropdown-controller';

angular.module('ng-easy-dropdown', [])
    .directive('easyDropdown', () => ({
      controller: easyDropdownController,
      template: '<select class="dropdown" ng-transclude></select>',
      transclude: true,
      // require: ['ngOptions'],
      scope: {
        settings: '<',
        options: '<',
      },
      link: (scope, element, attrs, ctrl) => {
        ctrl.init(element.find('select'), scope.settings || {});
      },
    }));
