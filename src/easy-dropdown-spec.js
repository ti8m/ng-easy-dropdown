/* eslint-env jasmine */

describe('ng-easy-dropdown', () => {

  describe('Controller', () => {

    let $ctrl;
    let $container;
    let $select;

    beforeEach(angular.mock.module('ng-easy-dropdown'));
    beforeEach(angular.mock.inject((_$controller_) => {
      $ctrl = _$controller_('easyDropdownController');

      $container = angular.element('<div></div>');
      $select = angular.element(`
        <select>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
        </select>
      `);
      $container.append($select);
    }));

    it('Should initialize the controller', () => {
      expect($ctrl).toBeDefined();
    });

    it('Should initialize a dropdown list with all options', () => {
      $ctrl.init($select, {});
      expect($container.find('ul').children().length).toBe(3);
    });

    it('Should add the scrollable class if cutOff is smaller than number of options', () => {
      $ctrl.init($select, {
        cutOff: 1,
      });
      expect($container[0].querySelector('.scrollable')).not.toBe(null);
    });
  });

  describe('Directive', () => {

  });
});
