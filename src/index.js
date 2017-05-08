import angular from 'angular';

import easyDropdownController from './easy-dropdown-controller';
import easyDropdownDirective from './easy-dropdown-directive';

angular.module('ng-easy-dropdown', [])
    .directive('easyDropdown', easyDropdownDirective)
    .controller('easyDropdownController', easyDropdownController);

