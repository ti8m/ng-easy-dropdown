'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _easyDropdownController = require('./easy-dropdown-controller');

var _easyDropdownController2 = _interopRequireDefault(_easyDropdownController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_angular2.default.module('ng-easy-dropdown', []).directive('easyDropdown', function () {
  return {
    controller: _easyDropdownController2.default,
    template: '<select class="dropdown"><option value="1">Option 1</option> <option value="2">Option 2</option> <option value="3">Option 3</option> <option value="4">Option 4</option></select>',
    transclude: true,
    scope: {
      settings: '<'
    },
    link: function link(scope, element, attrs, ctrl) {
      var domNode = element.find('select')[0];

      ctrl.init(domNode, scope.settings || {});
    }
  };
});