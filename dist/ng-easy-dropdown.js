(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('angular')) :
	typeof define === 'function' && define.amd ? define('ngEasyDropdown', ['angular'], factory) :
	(factory(global.angular));
}(this, (function (angular) { 'use strict';

angular = 'default' in angular ? angular['default'] : angular;

/* eslint-disable */

// matches polyfill
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function matchesPolyfill(s) {
    var matches = (this.document || this.ownerDocument).querySelectorAll(s);
    for (var i = matches.length - 1; i >= 0; i -= 1) {
      if (matches.item(i) === this) {
        return true;
      }
    }
    return false;
  };
}

// closest polyfill
if (window.Element && !Element.prototype.closest) {
  Element.prototype.closest = function (s) {
    var matches = (this.document || this.ownerDocument).querySelectorAll(s),
        i = void 0,
        el = this;
    do {
      i = matches.length;
      while (--i >= 0 && matches.item(i) !== el) {}
    } while (i < 0 && (el = el.parentElement));
    return el;
  };
}

// previousElementSibling polyfills
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('previousElementSibling')) {
      return;
    }
    Object.defineProperty(item, 'previousElementSibling', {
      configurable: true,
      enumerable: true,
      get: function get() {
        var el = this;
        while (el = el.previousSibling) {
          if (el.nodeType === 1) {
            return el;
          }
        }
        return null;
      },
      set: undefined
    });
  });
})([Element.prototype, CharacterData.prototype]);

// find polyfill
if (!Array.prototype.find) {
  Array.prototype.find = function (predicate) {
    'use strict';

    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value = void 0;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

function getElementIndex(node) {
  var index = 0;
  var currentNode = node;
  while (currentNode.previousElementSibling) {
    index += 1;
    currentNode = currentNode.previousElementSibling;
  }
  return index;
}

function siblings(el) {
  return Array.prototype.filter.call(el.parentNode.children, function (child) {
    return child !== el;
  });
}

function unwrap(el) {
  // get the element's parent node
  var parent = el.parentNode;
  var grandParent = el.parentNode.parentNode;

  // move all children out of the element
  grandParent.insertBefore(el, parent);

  // remove the empty element
  grandParent.removeChild(parent);

  return el;
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();



























var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

// import $ from 'jquery';
var closeAllEvent = 'easyDropdown:closeAll';
var $ = angular.element;

var EasyDropdownController = function () {
  function EasyDropdownController($window, $rootScope) {
    classCallCheck(this, EasyDropdownController);

    this.$window = $window;
    this.$rootScope = $rootScope;

    this.isField = true;
    this.down = false;
    this.inFocus = false;
    this.disabled = false;
    this.cutOff = false;
    this.hasLabel = false;
    this.keyboardMode = false;
    this.nativeTouch = true;
    this.wrapperClass = 'dropdown';
    this.onChange = null;

    this.instances = {};
  }

  createClass(EasyDropdownController, [{
    key: 'init',
    value: function init(selectElement, settings) {
      var _this = this;

      angular.extend(this, settings);
      this.$select = selectElement;
      this.options = [];
      this.$options = this.$select.find('option');
      this.isTouch = 'ontouchend' in this.$window.document;
      this.$select.removeClass(this.wrapperClass + ' dropdown');
      if (this.$select[0].matches(':disabled')) {
        this.disabled = true;
      }
      if (this.$options.length) {
        window.o = this.$options;
        angular.forEach(this.$options, function (option, i) {
          if (option.matches(':checked')) {
            _this.selected = {
              index: i,
              title: option.innerText
            };
            _this.focusIndex = i;
          }

          if (option.matches('.label') && i === 0) {
            _this.hasLabel = true;
            _this.label = option.innerText;
            option.setAttribute('value', '');
          } else {
            _this.options.push({
              domNode: option,
              title: option.innerText,
              value: option.value,
              selected: option.matches(':checked')
            });
          }
        });

        if (!this.selected) {
          this.selected = {
            index: 0,
            title: this.$options.eq(0).text()
          };
          this.focusIndex = 0;
        }

        this.render();
      }

      // register event handlers
      this.$rootScope.$on(closeAllEvent, this.close.bind(this));
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var touchClass = this.isTouch && this.nativeTouch ? ' touch' : '';
      var disabledClass = this.disabled ? ' disabled' : '';

      this.$container = this.$select.wrap('<div class="' + this.wrapperClass + touchClass + disabledClass + '"></div>').wrap('<span class="old">').parent().parent();

      this.$active = $('<span class="selected">' + this.selected.title + '</span>');
      this.$container.append(this.$active);
      this.$carat = $('<span class="carat"/>');
      this.$container.append(this.$carat);
      this.$scrollWrapper = $('<div><ul/></div>');
      this.$container.append(this.$scrollWrapper);
      this.$dropDown = this.$scrollWrapper.find('ul');
      this.$form = $(this.$container[0].closest('form'));

      this.options.forEach(function (o) {
        var active = o.selected ? ' class="active"' : '';
        _this2.$dropDown.append('<li' + active + '>' + o.title + '</li>');
      });
      this.$items = this.$dropDown.find('li');

      if (this.cutOff && this.$items.length > this.cutOff) this.$container.addClass('scrollable');

      this.getMaxHeight();

      if (this.isTouch && this.nativeTouch) {
        this.bindTouchHandlers();
      } else {
        this.bindHandlers();
      }
      this.rendered = true;
    }
  }, {
    key: 'getMaxHeight',
    value: function getMaxHeight() {
      this.maxHeight = 0;

      for (var i = 0; i < this.$items.length; i += 1) {
        var $item = this.$items.eq(i);
        this.maxHeight += $item[0].offsetHeight;
        if (this.cutOff === i + 1) {
          break;
        }
      }
    }
  }, {
    key: 'bindTouchHandlers',
    value: function bindTouchHandlers() {
      var _this3 = this;

      this.$container.on('click', function () {
        _this3.$select[0].focus();
      });

      this.$select.on('change', function (e) {
        var selected = e.target.querySelectorAll('option:checked')[0];
        var title = selected.innerText;
        var value = selected.value;

        _this3.$active.text(title);
        if (typeof _this3.onChange === 'function') {
          _this3.onChange.call(_this3.$select[0], {
            title: title,
            value: value
          });
        }
      });

      this.$select.on('focus', function () {
        _this3.$container.addClass('focus');
      });

      this.$select.on('focus', function () {
        _this3.$container.removeClass('focus');
      });
    }
  }, {
    key: 'bindHandlers',
    value: function bindHandlers() {
      var _this4 = this;

      var self = this;
      this.query = '';

      this.$container.on('click', function (e) {
        if (!_this4.down && !_this4.disabled) {
          _this4.open();
        } else {
          _this4.close();
        }
        e.stopPropagation();
      });

      this.$container.on('mousemove', function () {
        if (_this4.keyboardMode) {
          _this4.keyboardMode = false;
        }
      });

      $(this.$window.document.body).on('click', function (e) {
        var classNames = _this4.wrapperClass.split(' ').join('.');

        if (!e.target.closest('.' + classNames) && _this4.down) {
          _this4.close();
        }
      });

      this.$items.on('click', function (e) {
        var index = getElementIndex(e.target);
        _this4.select(index);
        _this4.$select[0].focus();
        e.target.setAttribute('selected', 'selected');
      });

      this.$items.on('mouseover', function (e) {
        if (!_this4.keyboardMode) {
          var $t = $(e.target);
          $t.addClass('focus');
          siblings($t[0]).forEach(function (s) {
            return $(s).removeClass('focus');
          });
          _this4.focusIndex = getElementIndex(e.target);
        }
      });

      this.$items.on('mouseout', function (e) {
        if (!_this4.keyboardMode) {
          $(e.target).removeClass('focus');
        }
      });

      this.$select.on('focus', function () {
        _this4.$container.addClass('focus');
        _this4.inFocus = true;
      });

      this.$select.on('blur', function () {
        _this4.$container.removeClass('focus');
        _this4.inFocus = false;
      });

      this.$select.on('keydown', function (e) {
        if (_this4.inFocus) {
          _this4.keyboardMode = true;
          var key = e.keyCode;
          var wasDown = _this4.down;

          if (key === 38 || key === 40 || key === 32 || key === 13) {
            e.preventDefault();
            if (key === 38) {
              _this4.focusIndex -= 1;
              _this4.focusIndex = _this4.focusIndex < 0 ? _this4.$items.length - 1 : _this4.focusIndex;
            } else if (key === 40) {
              _this4.focusIndex += 1;
              _this4.focusIndex = _this4.focusIndex > _this4.$items.length - 1 ? 0 : _this4.focusIndex;
            }

            // open the dropdown with space or enter
            if (!_this4.down && key !== 38 && key !== 40) {
              _this4.open();
            } else {
              _this4.select(_this4.focusIndex);
            }
            _this4.$items.removeClass('focus').eq(_this4.focusIndex).addClass('focus');

            if (_this4.cutOff) {
              _this4.scrollToView();
            }

            _this4.query = '';
          }

          if (_this4.down) {
            if (key === 9 || key === 27) {
              _this4.close();
            } else if (key === 13 && wasDown) {
              e.preventDefault();
              _this4.select(_this4.focusIndex);
              _this4.close();
              return false;
            } else if (key === 8) {
              e.preventDefault();
              _this4.query = _this4.query.slice(0, -1);
              _this4.search();
              clearTimeout(_this4.resetQuery);
              return false;
            } else if (key !== 38 && key !== 40) {
              _this4.query += String.fromCharCode(key);
              _this4.search();
              clearTimeout(_this4.resetQuery);
            }
          }
        }
        return true;
      });

      this.$select.on('keyup', function () {
        _this4.resetQuery = setTimeout(function () {
          _this4.query = '';
        }, 1200);
      });

      this.$dropDown.on('scroll', function () {
        if (_this4.$dropDown[0].scrollTop >= _this4.$dropDown[0].scrollHeight - _this4.maxHeight) {
          _this4.$container.addClass('bottom');
        } else {
          _this4.$container.removeClass('bottom');
        }
      });

      if (this.$form.length) {
        this.$form.on('reset', function () {
          var active = _this4.hasLabel ? _this4.label : self.options[0].title;
          _this4.$active.text(active);
        });
      }
    }
  }, {
    key: 'unbindHandlers',
    value: function unbindHandlers() {
      this.$container.off('click');
      this.$container.off('mousemove');
      $(this.$window.document.body).off('click');
      this.$items.off('click');
      this.$items.off('mouseover');
      this.$items.off('mouseout');
      this.$select.off('focus');
      this.$select.off('blur');
      this.$select.off('keydown');
      this.$select.off('keyup');
      this.$dropDown.off('scroll');
      this.$form.off('reset');
    }
  }, {
    key: 'open',
    value: function open() {
      var scrollTop = this.$window.scrollY || this.$window.document.documentElement.scrollTop;
      var scrollLeft = this.$window.scrollX || this.$window.document.documentElement.scrollLeft;
      var scrollOffset = this.notInViewport(scrollTop);

      this.closeAll();
      this.getMaxHeight();
      this.$select[0].focus();
      this.$window.scrollTo(scrollLeft, scrollTop + scrollOffset);
      this.$container.addClass('open');
      this.$scrollWrapper.css('height', this.maxHeight + 'px');
      this.down = true;
    }
  }, {
    key: 'close',
    value: function close() {
      this.$container.removeClass('open');
      this.$scrollWrapper.css('height', '0px');
      this.focusIndex = this.selected.index;
      this.query = '';
      this.down = false;
    }
  }, {
    key: 'closeAll',
    value: function closeAll() {
      this.$rootScope.$emit(closeAllEvent);
    }
  }, {
    key: 'select',
    value: function select(index) {
      var option = this.options[index];
      var selectIndex = this.hasLabel ? index + 1 : index;
      this.$items.removeClass('active').eq(index).addClass('active');
      this.$active.text(option.title);

      this.$select.find('option').removeAttr('selected').eq(selectIndex).prop('selected', true).parent().triggerHandler('change');

      this.selected = {
        index: index,
        title: option.title
      };
      this.focusIndex = index;
      if (typeof this.onChange === 'function') {
        this.onChange.call(this.$select[0], {
          title: option.title,
          value: option.value
        });
      }
    }
  }, {
    key: 'search',
    value: function search() {
      var _this5 = this;

      var lock = function lock(i) {
        _this5.focusIndex = i;
        _this5.$items.removeClass('focus').eq(_this5.focusIndex).addClass('focus');
        _this5.scrollToView();
      };

      var getTitle = function getTitle(i) {
        return _this5.options[i].title.toUpperCase();
      };

      for (var i = 0; i < this.options.length; i += 1) {
        var title = getTitle(i);
        if (title.indexOf(this.query) === 0) {
          lock(i);
          return;
        }
      }

      for (var _i = 0; _i < this.options.length; _i += 1) {
        var _title = getTitle(_i);
        if (_title.indexOf(this.query) > -1) {
          lock(_i);
          break;
        }
      }
    }
  }, {
    key: 'scrollToView',
    value: function scrollToView() {
      if (this.focusIndex >= this.cutOff) {
        var $focusItem = this.$items.eq(this.focusIndex);
        this.$dropDown[0].scrollTop = $focusItem[0].offsetHeight * (this.focusIndex + 1) - this.maxHeight;
      }
    }
  }, {
    key: 'notInViewport',
    value: function notInViewport(scrollTop) {
      var range = {
        min: scrollTop,
        max: scrollTop + (this.$window.innerHeight || this.$window.document.documentElement.clientHeight)
      };

      var menuBottom = this.$dropDown[0].getBoundingClientRect().top + document.body.scrollTop + this.maxHeight;

      if (menuBottom >= range.min && menuBottom <= range.max) {
        return 0;
      }
      return menuBottom - range.max + 5;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.unbindHandlers();
      unwrap(this.$select[0]);
      siblings(this.$select[0]).forEach(function (el) {
        return el.remove();
      });
      unwrap(this.$select[0]);
      this.rendered = false;
    }
  }, {
    key: 'disable',
    value: function disable() {
      this.disabled = true;
      this.$container.addClass('disabled');
      this.$select.attr('disabled', true);
      if (!this.down) this.close();
    }
  }, {
    key: 'enable',
    value: function enable() {
      var self = this;
      self.disabled = false;
      self.$container.removeClass('disabled');
      self.$select.attr('disabled', false);
    }
  }]);
  return EasyDropdownController;
}();

EasyDropdownController.$inject = ['$window', '$rootScope'];

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
      settings: '<'
    },
    link: function link(scope, element, attrs, _ref) {
      var _ref2 = slicedToArray(_ref, 2),
          ctrl = _ref2[0],
          ngModelController = _ref2[1];

      function init() {
        ctrl.init(element, scope.settings || {});
      }

      function watchCollection(collection) {
        $timeout(function () {
          if (!collection.match(/\[.*\]/)) {
            // dynamic list -> watch for changes
            scope.$watchCollection(function () {
              return scope.$parent[collection];
            }, function () {
              $timeout(function () {
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

      $timeout(function () {
        var options = [].slice.call(element.find('option'));
        var optionWithNgRepeat = options.find(function (n) {
          return n.hasAttribute('ng-repeat');
        });
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
        scope.$watch(function () {
          return ngModelController.$modelValue;
        }, function (newValue) {
          if (newValue && ctrl.rendered) {
            $timeout(function () {
              var selectedOption = element[0].querySelector('[selected]');

              if (selectedOption) {
                var index = getElementIndex(selectedOption);
                ctrl.select(index);
              }
            });
          }
        });
      }
    }
  };
}

easyDropdownDirective.$inject = ['$timeout'];

angular.module('ng-easy-dropdown', []).directive('easyDropdown', easyDropdownDirective).controller('easyDropdownController', EasyDropdownController);

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbInNyYy9wb2x5ZmlsbHMuanMiLCJzcmMvaGVscGVycy5qcyIsInNyYy9lYXN5LWRyb3Bkb3duLWNvbnRyb2xsZXIuanMiLCJzcmMvZWFzeS1kcm9wZG93bi1kaXJlY3RpdmUuanMiLCJzcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgKi9cblxuLy8gbWF0Y2hlcyBwb2x5ZmlsbFxuaWYgKCFFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XG4gIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgPVxuICAgIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXNTZWxlY3RvciB8fFxuICAgIEVsZW1lbnQucHJvdG90eXBlLm1vek1hdGNoZXNTZWxlY3RvciB8fFxuICAgIEVsZW1lbnQucHJvdG90eXBlLm1zTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgRWxlbWVudC5wcm90b3R5cGUub01hdGNoZXNTZWxlY3RvciB8fFxuICAgIEVsZW1lbnQucHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fFxuICAgIGZ1bmN0aW9uIG1hdGNoZXNQb2x5ZmlsbChzKSB7XG4gICAgICBjb25zdCBtYXRjaGVzID0gKHRoaXMuZG9jdW1lbnQgfHwgdGhpcy5vd25lckRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHMpO1xuICAgICAgZm9yIChsZXQgaSA9IG1hdGNoZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpIC09IDEpIHtcbiAgICAgICAgaWYgKG1hdGNoZXMuaXRlbShpKSA9PT0gdGhpcykge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbn1cblxuLy8gY2xvc2VzdCBwb2x5ZmlsbFxuaWYgKHdpbmRvdy5FbGVtZW50ICYmICFFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0KSB7XG4gIEVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QgPVxuICAgIGZ1bmN0aW9uKHMpIHtcbiAgICAgIGxldCBtYXRjaGVzID0gKHRoaXMuZG9jdW1lbnQgfHwgdGhpcy5vd25lckRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHMpLFxuICAgICAgICBpLFxuICAgICAgICBlbCA9IHRoaXM7XG4gICAgICBkbyB7XG4gICAgICAgIGkgPSBtYXRjaGVzLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKC0taSA+PSAwICYmIG1hdGNoZXMuaXRlbShpKSAhPT0gZWwpIHt9XG4gICAgICB9IHdoaWxlICgoaSA8IDApICYmIChlbCA9IGVsLnBhcmVudEVsZW1lbnQpKTtcbiAgICAgIHJldHVybiBlbDtcbiAgICB9O1xufVxuXG4vLyBwcmV2aW91c0VsZW1lbnRTaWJsaW5nIHBvbHlmaWxsc1xuKGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICBpZiAoaXRlbS5oYXNPd25Qcm9wZXJ0eSgncHJldmlvdXNFbGVtZW50U2libGluZycpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpdGVtLCAncHJldmlvdXNFbGVtZW50U2libGluZycsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGVsID0gdGhpcztcbiAgICAgICAgd2hpbGUgKGVsID0gZWwucHJldmlvdXNTaWJsaW5nKSB7XG4gICAgICAgICAgaWYgKGVsLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSxcbiAgICAgIHNldDogdW5kZWZpbmVkXG4gICAgfSk7XG4gIH0pO1xufSkoW0VsZW1lbnQucHJvdG90eXBlLCBDaGFyYWN0ZXJEYXRhLnByb3RvdHlwZV0pO1xuXG4vLyBmaW5kIHBvbHlmaWxsXG5pZiAoIUFycmF5LnByb3RvdHlwZS5maW5kKSB7XG4gIEFycmF5LnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0aGlzID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FycmF5LnByb3RvdHlwZS5maW5kIGNhbGxlZCBvbiBudWxsIG9yIHVuZGVmaW5lZCcpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByZWRpY2F0ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncHJlZGljYXRlIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cbiAgICBsZXQgbGlzdCA9IE9iamVjdCh0aGlzKTtcbiAgICBsZXQgbGVuZ3RoID0gbGlzdC5sZW5ndGggPj4+IDA7XG4gICAgbGV0IHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgbGV0IHZhbHVlO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWUgPSBsaXN0W2ldO1xuICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBsaXN0KSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IG51bGw7XG4iLCJleHBvcnQgZnVuY3Rpb24gZ2V0RWxlbWVudEluZGV4KG5vZGUpIHtcbiAgbGV0IGluZGV4ID0gMDtcbiAgbGV0IGN1cnJlbnROb2RlID0gbm9kZTtcbiAgd2hpbGUgKGN1cnJlbnROb2RlLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpIHtcbiAgICBpbmRleCArPSAxO1xuICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgfVxuICByZXR1cm4gaW5kZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaWJsaW5ncyhlbCkge1xuICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsKGVsLnBhcmVudE5vZGUuY2hpbGRyZW4sIGNoaWxkID0+IGNoaWxkICE9PSBlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bndyYXAoZWwpIHtcbiAgLy8gZ2V0IHRoZSBlbGVtZW50J3MgcGFyZW50IG5vZGVcbiAgY29uc3QgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcbiAgY29uc3QgZ3JhbmRQYXJlbnQgPSBlbC5wYXJlbnROb2RlLnBhcmVudE5vZGU7XG5cbiAgLy8gbW92ZSBhbGwgY2hpbGRyZW4gb3V0IG9mIHRoZSBlbGVtZW50XG4gIGdyYW5kUGFyZW50Lmluc2VydEJlZm9yZShlbCwgcGFyZW50KTtcblxuICAvLyByZW1vdmUgdGhlIGVtcHR5IGVsZW1lbnRcbiAgZ3JhbmRQYXJlbnQucmVtb3ZlQ2hpbGQocGFyZW50KTtcblxuICByZXR1cm4gZWw7XG59XG4iLCJpbXBvcnQgYW5ndWxhciBmcm9tICdhbmd1bGFyJztcbi8vIGltcG9ydCAkIGZyb20gJ2pxdWVyeSc7XG5pbXBvcnQgJy4vcG9seWZpbGxzJztcbmltcG9ydCB7IGdldEVsZW1lbnRJbmRleCwgc2libGluZ3MsIHVud3JhcCB9IGZyb20gJy4vaGVscGVycyc7XG5cbmNvbnN0IGNsb3NlQWxsRXZlbnQgPSAnZWFzeURyb3Bkb3duOmNsb3NlQWxsJztcbmNvbnN0ICQgPSBhbmd1bGFyLmVsZW1lbnQ7XG5cbmNsYXNzIEVhc3lEcm9wZG93bkNvbnRyb2xsZXIge1xuXG4gIGNvbnN0cnVjdG9yKCR3aW5kb3csICRyb290U2NvcGUpIHtcbiAgICB0aGlzLiR3aW5kb3cgPSAkd2luZG93O1xuICAgIHRoaXMuJHJvb3RTY29wZSA9ICRyb290U2NvcGU7XG5cbiAgICB0aGlzLmlzRmllbGQgPSB0cnVlO1xuICAgIHRoaXMuZG93biA9IGZhbHNlO1xuICAgIHRoaXMuaW5Gb2N1cyA9IGZhbHNlO1xuICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICB0aGlzLmN1dE9mZiA9IGZhbHNlO1xuICAgIHRoaXMuaGFzTGFiZWwgPSBmYWxzZTtcbiAgICB0aGlzLmtleWJvYXJkTW9kZSA9IGZhbHNlO1xuICAgIHRoaXMubmF0aXZlVG91Y2ggPSB0cnVlO1xuICAgIHRoaXMud3JhcHBlckNsYXNzID0gJ2Ryb3Bkb3duJztcbiAgICB0aGlzLm9uQ2hhbmdlID0gbnVsbDtcblxuICAgIHRoaXMuaW5zdGFuY2VzID0ge307XG4gIH1cblxuICBpbml0KHNlbGVjdEVsZW1lbnQsIHNldHRpbmdzKSB7XG4gICAgYW5ndWxhci5leHRlbmQodGhpcywgc2V0dGluZ3MpO1xuICAgIHRoaXMuJHNlbGVjdCA9IHNlbGVjdEVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gW107XG4gICAgdGhpcy4kb3B0aW9ucyA9IHRoaXMuJHNlbGVjdC5maW5kKCdvcHRpb24nKTtcbiAgICB0aGlzLmlzVG91Y2ggPSAnb250b3VjaGVuZCcgaW4gdGhpcy4kd2luZG93LmRvY3VtZW50O1xuICAgIHRoaXMuJHNlbGVjdC5yZW1vdmVDbGFzcyhgJHt0aGlzLndyYXBwZXJDbGFzc30gZHJvcGRvd25gKTtcbiAgICBpZiAodGhpcy4kc2VsZWN0WzBdLm1hdGNoZXMoJzpkaXNhYmxlZCcpKSB7XG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRoaXMuJG9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICB3aW5kb3cubyA9IHRoaXMuJG9wdGlvbnM7XG4gICAgICBhbmd1bGFyLmZvckVhY2godGhpcy4kb3B0aW9ucywgKG9wdGlvbiwgaSkgPT4ge1xuICAgICAgICBpZiAob3B0aW9uLm1hdGNoZXMoJzpjaGVja2VkJykpIHtcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkID0ge1xuICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICB0aXRsZTogb3B0aW9uLmlubmVyVGV4dCxcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRoaXMuZm9jdXNJbmRleCA9IGk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9uLm1hdGNoZXMoJy5sYWJlbCcpICYmIGkgPT09IDApIHtcbiAgICAgICAgICB0aGlzLmhhc0xhYmVsID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLmxhYmVsID0gb3B0aW9uLmlubmVyVGV4dDtcbiAgICAgICAgICBvcHRpb24uc2V0QXR0cmlidXRlKCd2YWx1ZScsICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLm9wdGlvbnMucHVzaCh7XG4gICAgICAgICAgICBkb21Ob2RlOiBvcHRpb24sXG4gICAgICAgICAgICB0aXRsZTogb3B0aW9uLmlubmVyVGV4dCxcbiAgICAgICAgICAgIHZhbHVlOiBvcHRpb24udmFsdWUsXG4gICAgICAgICAgICBzZWxlY3RlZDogb3B0aW9uLm1hdGNoZXMoJzpjaGVja2VkJyksXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIXRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHtcbiAgICAgICAgICBpbmRleDogMCxcbiAgICAgICAgICB0aXRsZTogdGhpcy4kb3B0aW9ucy5lcSgwKS50ZXh0KCksXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZm9jdXNJbmRleCA9IDA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgLy8gcmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnNcbiAgICB0aGlzLiRyb290U2NvcGUuJG9uKGNsb3NlQWxsRXZlbnQsIDo6dGhpcy5jbG9zZSk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgdG91Y2hDbGFzcyA9IHRoaXMuaXNUb3VjaCAmJiB0aGlzLm5hdGl2ZVRvdWNoID8gJyB0b3VjaCcgOiAnJztcbiAgICBjb25zdCBkaXNhYmxlZENsYXNzID0gdGhpcy5kaXNhYmxlZCA/ICcgZGlzYWJsZWQnIDogJyc7XG5cbiAgICB0aGlzLiRjb250YWluZXIgPSB0aGlzLiRzZWxlY3RcbiAgICAgIC53cmFwKGA8ZGl2IGNsYXNzPVwiJHt0aGlzLndyYXBwZXJDbGFzc30ke3RvdWNoQ2xhc3N9JHtkaXNhYmxlZENsYXNzfVwiPjwvZGl2PmApXG4gICAgICAud3JhcCgnPHNwYW4gY2xhc3M9XCJvbGRcIj4nKVxuICAgICAgLnBhcmVudCgpXG4gICAgICAucGFyZW50KCk7XG5cbiAgICB0aGlzLiRhY3RpdmUgPSAkKGA8c3BhbiBjbGFzcz1cInNlbGVjdGVkXCI+JHt0aGlzLnNlbGVjdGVkLnRpdGxlfTwvc3Bhbj5gKTtcbiAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKHRoaXMuJGFjdGl2ZSk7XG4gICAgdGhpcy4kY2FyYXQgPSAkKCc8c3BhbiBjbGFzcz1cImNhcmF0XCIvPicpO1xuICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmQodGhpcy4kY2FyYXQpO1xuICAgIHRoaXMuJHNjcm9sbFdyYXBwZXIgPSAkKCc8ZGl2Pjx1bC8+PC9kaXY+Jyk7XG4gICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZCh0aGlzLiRzY3JvbGxXcmFwcGVyKTtcbiAgICB0aGlzLiRkcm9wRG93biA9IHRoaXMuJHNjcm9sbFdyYXBwZXIuZmluZCgndWwnKTtcbiAgICB0aGlzLiRmb3JtID0gJCh0aGlzLiRjb250YWluZXJbMF0uY2xvc2VzdCgnZm9ybScpKTtcblxuICAgIHRoaXMub3B0aW9ucy5mb3JFYWNoKChvKSA9PiB7XG4gICAgICBjb25zdCBhY3RpdmUgPSBvLnNlbGVjdGVkID8gJyBjbGFzcz1cImFjdGl2ZVwiJyA6ICcnO1xuICAgICAgdGhpcy4kZHJvcERvd24uYXBwZW5kKGA8bGkke2FjdGl2ZX0+JHtvLnRpdGxlfTwvbGk+YCk7XG4gICAgfSk7XG4gICAgdGhpcy4kaXRlbXMgPSB0aGlzLiRkcm9wRG93bi5maW5kKCdsaScpO1xuXG4gICAgaWYgKHRoaXMuY3V0T2ZmICYmIHRoaXMuJGl0ZW1zLmxlbmd0aCA+IHRoaXMuY3V0T2ZmKSB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ3Njcm9sbGFibGUnKTtcblxuICAgIHRoaXMuZ2V0TWF4SGVpZ2h0KCk7XG5cbiAgICBpZiAodGhpcy5pc1RvdWNoICYmIHRoaXMubmF0aXZlVG91Y2gpIHtcbiAgICAgIHRoaXMuYmluZFRvdWNoSGFuZGxlcnMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5iaW5kSGFuZGxlcnMoKTtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXJlZCA9IHRydWU7XG4gIH1cblxuICBnZXRNYXhIZWlnaHQoKSB7XG4gICAgdGhpcy5tYXhIZWlnaHQgPSAwO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLiRpdGVtcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgJGl0ZW0gPSB0aGlzLiRpdGVtcy5lcShpKTtcbiAgICAgIHRoaXMubWF4SGVpZ2h0ICs9ICRpdGVtWzBdLm9mZnNldEhlaWdodDtcbiAgICAgIGlmICh0aGlzLmN1dE9mZiA9PT0gaSArIDEpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYmluZFRvdWNoSGFuZGxlcnMoKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLm9uKCdjbGljaycsICgpID0+IHtcbiAgICAgIHRoaXMuJHNlbGVjdFswXS5mb2N1cygpO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kc2VsZWN0Lm9uKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBlLnRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKCdvcHRpb246Y2hlY2tlZCcpWzBdO1xuICAgICAgY29uc3QgdGl0bGUgPSBzZWxlY3RlZC5pbm5lclRleHQ7XG4gICAgICBjb25zdCB2YWx1ZSA9IHNlbGVjdGVkLnZhbHVlO1xuXG4gICAgICB0aGlzLiRhY3RpdmUudGV4dCh0aXRsZSk7XG4gICAgICBpZiAodHlwZW9mIHRoaXMub25DaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5vbkNoYW5nZS5jYWxsKHRoaXMuJHNlbGVjdFswXSwge1xuICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuJHNlbGVjdC5vbignZm9jdXMnLCAoKSA9PiB7XG4gICAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ2ZvY3VzJyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLiRzZWxlY3Qub24oJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgdGhpcy4kY29udGFpbmVyLnJlbW92ZUNsYXNzKCdmb2N1cycpO1xuICAgIH0pO1xuICB9XG5cbiAgYmluZEhhbmRsZXJzKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHRoaXMucXVlcnkgPSAnJztcblxuICAgIHRoaXMuJGNvbnRhaW5lci5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmRvd24gJiYgIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB9XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kY29udGFpbmVyLm9uKCdtb3VzZW1vdmUnLCAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5rZXlib2FyZE1vZGUpIHtcbiAgICAgICAgdGhpcy5rZXlib2FyZE1vZGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgICQodGhpcy4kd2luZG93LmRvY3VtZW50LmJvZHkpLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBjb25zdCBjbGFzc05hbWVzID0gdGhpcy53cmFwcGVyQ2xhc3Muc3BsaXQoJyAnKS5qb2luKCcuJyk7XG5cbiAgICAgIGlmICghZS50YXJnZXQuY2xvc2VzdChgLiR7Y2xhc3NOYW1lc31gKSAmJiB0aGlzLmRvd24pIHtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy4kaXRlbXMub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gZ2V0RWxlbWVudEluZGV4KGUudGFyZ2V0KTtcbiAgICAgIHRoaXMuc2VsZWN0KGluZGV4KTtcbiAgICAgIHRoaXMuJHNlbGVjdFswXS5mb2N1cygpO1xuICAgICAgZS50YXJnZXQuc2V0QXR0cmlidXRlKCdzZWxlY3RlZCcsICdzZWxlY3RlZCcpO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kaXRlbXMub24oJ21vdXNlb3ZlcicsIChlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMua2V5Ym9hcmRNb2RlKSB7XG4gICAgICAgIGNvbnN0ICR0ID0gJChlLnRhcmdldCk7XG4gICAgICAgICR0LmFkZENsYXNzKCdmb2N1cycpO1xuICAgICAgICBzaWJsaW5ncygkdFswXSkuZm9yRWFjaChzID0+ICQocykucmVtb3ZlQ2xhc3MoJ2ZvY3VzJykpO1xuICAgICAgICB0aGlzLmZvY3VzSW5kZXggPSBnZXRFbGVtZW50SW5kZXgoZS50YXJnZXQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy4kaXRlbXMub24oJ21vdXNlb3V0JywgKGUpID0+IHtcbiAgICAgIGlmICghdGhpcy5rZXlib2FyZE1vZGUpIHtcbiAgICAgICAgJChlLnRhcmdldCkucmVtb3ZlQ2xhc3MoJ2ZvY3VzJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLiRzZWxlY3Qub24oJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgdGhpcy4kY29udGFpbmVyLmFkZENsYXNzKCdmb2N1cycpO1xuICAgICAgdGhpcy5pbkZvY3VzID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHRoaXMuJHNlbGVjdC5vbignYmx1cicsICgpID0+IHtcbiAgICAgIHRoaXMuJGNvbnRhaW5lci5yZW1vdmVDbGFzcygnZm9jdXMnKTtcbiAgICAgIHRoaXMuaW5Gb2N1cyA9IGZhbHNlO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kc2VsZWN0Lm9uKCdrZXlkb3duJywgKGUpID0+IHtcbiAgICAgIGlmICh0aGlzLmluRm9jdXMpIHtcbiAgICAgICAgdGhpcy5rZXlib2FyZE1vZGUgPSB0cnVlO1xuICAgICAgICBjb25zdCBrZXkgPSBlLmtleUNvZGU7XG4gICAgICAgIGNvbnN0IHdhc0Rvd24gPSB0aGlzLmRvd247XG5cbiAgICAgICAgaWYgKGtleSA9PT0gMzggfHwga2V5ID09PSA0MCB8fCBrZXkgPT09IDMyIHx8IGtleSA9PT0gMTMpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgaWYgKGtleSA9PT0gMzgpIHtcbiAgICAgICAgICAgIHRoaXMuZm9jdXNJbmRleCAtPSAxO1xuICAgICAgICAgICAgdGhpcy5mb2N1c0luZGV4ID0gdGhpcy5mb2N1c0luZGV4IDwgMCA/IHRoaXMuJGl0ZW1zLmxlbmd0aCAtIDEgOiB0aGlzLmZvY3VzSW5kZXg7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IDQwKSB7XG4gICAgICAgICAgICB0aGlzLmZvY3VzSW5kZXggKz0gMTtcbiAgICAgICAgICAgIHRoaXMuZm9jdXNJbmRleCA9IHRoaXMuZm9jdXNJbmRleCA+IHRoaXMuJGl0ZW1zLmxlbmd0aCAtIDEgPyAwIDogdGhpcy5mb2N1c0luZGV4O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIG9wZW4gdGhlIGRyb3Bkb3duIHdpdGggc3BhY2Ugb3IgZW50ZXJcbiAgICAgICAgICBpZiAoIXRoaXMuZG93biAmJiBrZXkgIT09IDM4ICYmIGtleSAhPT0gNDApIHtcbiAgICAgICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdCh0aGlzLmZvY3VzSW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLiRpdGVtc1xuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdmb2N1cycpXG4gICAgICAgICAgICAuZXEodGhpcy5mb2N1c0luZGV4KVxuICAgICAgICAgICAgLmFkZENsYXNzKCdmb2N1cycpO1xuXG4gICAgICAgICAgaWYgKHRoaXMuY3V0T2ZmKSB7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFRvVmlldygpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMucXVlcnkgPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmRvd24pIHtcbiAgICAgICAgICBpZiAoa2V5ID09PSA5IHx8IGtleSA9PT0gMjcpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gMTMgJiYgd2FzRG93bikge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3QodGhpcy5mb2N1c0luZGV4KTtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gOCkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5xdWVyeSA9IHRoaXMucXVlcnkuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgICAgdGhpcy5zZWFyY2goKTtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlc2V0UXVlcnkpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5ICE9PSAzOCAmJiBrZXkgIT09IDQwKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXJ5ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5KTtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoKCk7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5yZXNldFF1ZXJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kc2VsZWN0Lm9uKCdrZXl1cCcsICgpID0+IHtcbiAgICAgIHRoaXMucmVzZXRRdWVyeSA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLnF1ZXJ5ID0gJyc7XG4gICAgICB9LCAxMjAwKTtcbiAgICB9KTtcblxuICAgIHRoaXMuJGRyb3BEb3duLm9uKCdzY3JvbGwnLCAoKSA9PiB7XG4gICAgICBpZiAodGhpcy4kZHJvcERvd25bMF0uc2Nyb2xsVG9wID49IHRoaXMuJGRyb3BEb3duWzBdLnNjcm9sbEhlaWdodCAtIHRoaXMubWF4SGVpZ2h0KSB7XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcygnYm90dG9tJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoJ2JvdHRvbScpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuJGZvcm0ubGVuZ3RoKSB7XG4gICAgICB0aGlzLiRmb3JtLm9uKCdyZXNldCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWN0aXZlID0gdGhpcy5oYXNMYWJlbCA/IHRoaXMubGFiZWwgOiBzZWxmLm9wdGlvbnNbMF0udGl0bGU7XG4gICAgICAgIHRoaXMuJGFjdGl2ZS50ZXh0KGFjdGl2ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICB1bmJpbmRIYW5kbGVycygpIHtcbiAgICB0aGlzLiRjb250YWluZXIub2ZmKCdjbGljaycpO1xuICAgIHRoaXMuJGNvbnRhaW5lci5vZmYoJ21vdXNlbW92ZScpO1xuICAgICQodGhpcy4kd2luZG93LmRvY3VtZW50LmJvZHkpLm9mZignY2xpY2snKTtcbiAgICB0aGlzLiRpdGVtcy5vZmYoJ2NsaWNrJyk7XG4gICAgdGhpcy4kaXRlbXMub2ZmKCdtb3VzZW92ZXInKTtcbiAgICB0aGlzLiRpdGVtcy5vZmYoJ21vdXNlb3V0Jyk7XG4gICAgdGhpcy4kc2VsZWN0Lm9mZignZm9jdXMnKTtcbiAgICB0aGlzLiRzZWxlY3Qub2ZmKCdibHVyJyk7XG4gICAgdGhpcy4kc2VsZWN0Lm9mZigna2V5ZG93bicpO1xuICAgIHRoaXMuJHNlbGVjdC5vZmYoJ2tleXVwJyk7XG4gICAgdGhpcy4kZHJvcERvd24ub2ZmKCdzY3JvbGwnKTtcbiAgICB0aGlzLiRmb3JtLm9mZigncmVzZXQnKTtcbiAgfVxuXG4gIG9wZW4oKSB7XG4gICAgY29uc3Qgc2Nyb2xsVG9wID0gdGhpcy4kd2luZG93LnNjcm9sbFkgfHwgdGhpcy4kd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG4gICAgY29uc3Qgc2Nyb2xsTGVmdCA9IHRoaXMuJHdpbmRvdy5zY3JvbGxYIHx8IHRoaXMuJHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcbiAgICBjb25zdCBzY3JvbGxPZmZzZXQgPSB0aGlzLm5vdEluVmlld3BvcnQoc2Nyb2xsVG9wKTtcblxuICAgIHRoaXMuY2xvc2VBbGwoKTtcbiAgICB0aGlzLmdldE1heEhlaWdodCgpO1xuICAgIHRoaXMuJHNlbGVjdFswXS5mb2N1cygpO1xuICAgIHRoaXMuJHdpbmRvdy5zY3JvbGxUbyhzY3JvbGxMZWZ0LCBzY3JvbGxUb3AgKyBzY3JvbGxPZmZzZXQpO1xuICAgIHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcygnb3BlbicpO1xuICAgIHRoaXMuJHNjcm9sbFdyYXBwZXIuY3NzKCdoZWlnaHQnLCBgJHt0aGlzLm1heEhlaWdodH1weGApO1xuICAgIHRoaXMuZG93biA9IHRydWU7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICB0aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICB0aGlzLiRzY3JvbGxXcmFwcGVyLmNzcygnaGVpZ2h0JywgJzBweCcpO1xuICAgIHRoaXMuZm9jdXNJbmRleCA9IHRoaXMuc2VsZWN0ZWQuaW5kZXg7XG4gICAgdGhpcy5xdWVyeSA9ICcnO1xuICAgIHRoaXMuZG93biA9IGZhbHNlO1xuICB9XG5cbiAgY2xvc2VBbGwoKSB7XG4gICAgdGhpcy4kcm9vdFNjb3BlLiRlbWl0KGNsb3NlQWxsRXZlbnQpO1xuICB9XG5cbiAgc2VsZWN0KGluZGV4KSB7XG4gICAgY29uc3Qgb3B0aW9uID0gdGhpcy5vcHRpb25zW2luZGV4XTtcbiAgICBjb25zdCBzZWxlY3RJbmRleCA9IHRoaXMuaGFzTGFiZWwgPyBpbmRleCArIDEgOiBpbmRleDtcbiAgICB0aGlzLiRpdGVtcy5yZW1vdmVDbGFzcygnYWN0aXZlJykuZXEoaW5kZXgpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICB0aGlzLiRhY3RpdmUudGV4dChvcHRpb24udGl0bGUpO1xuXG4gICAgdGhpcy4kc2VsZWN0XG4gICAgICAuZmluZCgnb3B0aW9uJylcbiAgICAgIC5yZW1vdmVBdHRyKCdzZWxlY3RlZCcpXG4gICAgICAuZXEoc2VsZWN0SW5kZXgpXG4gICAgICAucHJvcCgnc2VsZWN0ZWQnLCB0cnVlKVxuICAgICAgLnBhcmVudCgpXG4gICAgICAudHJpZ2dlckhhbmRsZXIoJ2NoYW5nZScpO1xuXG4gICAgdGhpcy5zZWxlY3RlZCA9IHtcbiAgICAgIGluZGV4LFxuICAgICAgdGl0bGU6IG9wdGlvbi50aXRsZSxcbiAgICB9O1xuICAgIHRoaXMuZm9jdXNJbmRleCA9IGluZGV4O1xuICAgIGlmICh0eXBlb2YgdGhpcy5vbkNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5vbkNoYW5nZS5jYWxsKHRoaXMuJHNlbGVjdFswXSwge1xuICAgICAgICB0aXRsZTogb3B0aW9uLnRpdGxlLFxuICAgICAgICB2YWx1ZTogb3B0aW9uLnZhbHVlLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgc2VhcmNoKCkge1xuICAgIGNvbnN0IGxvY2sgPSAoaSkgPT4ge1xuICAgICAgdGhpcy5mb2N1c0luZGV4ID0gaTtcbiAgICAgIHRoaXMuJGl0ZW1zLnJlbW92ZUNsYXNzKCdmb2N1cycpLmVxKHRoaXMuZm9jdXNJbmRleCkuYWRkQ2xhc3MoJ2ZvY3VzJyk7XG4gICAgICB0aGlzLnNjcm9sbFRvVmlldygpO1xuICAgIH07XG5cbiAgICBjb25zdCBnZXRUaXRsZSA9IGkgPT4gdGhpcy5vcHRpb25zW2ldLnRpdGxlLnRvVXBwZXJDYXNlKCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgdGl0bGUgPSBnZXRUaXRsZShpKTtcbiAgICAgIGlmICh0aXRsZS5pbmRleE9mKHRoaXMucXVlcnkpID09PSAwKSB7XG4gICAgICAgIGxvY2soaSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCB0aXRsZSA9IGdldFRpdGxlKGkpO1xuICAgICAgaWYgKHRpdGxlLmluZGV4T2YodGhpcy5xdWVyeSkgPiAtMSkge1xuICAgICAgICBsb2NrKGkpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzY3JvbGxUb1ZpZXcoKSB7XG4gICAgaWYgKHRoaXMuZm9jdXNJbmRleCA+PSB0aGlzLmN1dE9mZikge1xuICAgICAgY29uc3QgJGZvY3VzSXRlbSA9IHRoaXMuJGl0ZW1zLmVxKHRoaXMuZm9jdXNJbmRleCk7XG4gICAgICB0aGlzLiRkcm9wRG93blswXS5zY3JvbGxUb3AgPVxuICAgICAgICAoJGZvY3VzSXRlbVswXS5vZmZzZXRIZWlnaHQgKiAodGhpcy5mb2N1c0luZGV4ICsgMSkpIC0gdGhpcy5tYXhIZWlnaHQ7XG4gICAgfVxuICB9XG5cbiAgbm90SW5WaWV3cG9ydChzY3JvbGxUb3ApIHtcbiAgICBjb25zdCByYW5nZSA9IHtcbiAgICAgIG1pbjogc2Nyb2xsVG9wLFxuICAgICAgbWF4OiBzY3JvbGxUb3AgKyAodGhpcy4kd2luZG93LmlubmVySGVpZ2h0IHx8XG4gICAgICB0aGlzLiR3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCksXG4gICAgfTtcblxuICAgIGNvbnN0IG1lbnVCb3R0b20gPSB0aGlzLiRkcm9wRG93blswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgK1xuICAgICAgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgKyB0aGlzLm1heEhlaWdodDtcblxuICAgIGlmIChtZW51Qm90dG9tID49IHJhbmdlLm1pbiAmJiBtZW51Qm90dG9tIDw9IHJhbmdlLm1heCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiAobWVudUJvdHRvbSAtIHJhbmdlLm1heCkgKyA1O1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLnVuYmluZEhhbmRsZXJzKCk7XG4gICAgdW53cmFwKHRoaXMuJHNlbGVjdFswXSk7XG4gICAgc2libGluZ3ModGhpcy4kc2VsZWN0WzBdKS5mb3JFYWNoKGVsID0+IGVsLnJlbW92ZSgpKTtcbiAgICB1bndyYXAodGhpcy4kc2VsZWN0WzBdKTtcbiAgICB0aGlzLnJlbmRlcmVkID0gZmFsc2U7XG4gIH1cblxuICBkaXNhYmxlKCkge1xuICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xuICAgIHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgICB0aGlzLiRzZWxlY3QuYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgICBpZiAoIXRoaXMuZG93bikgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgZW5hYmxlKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBzZWxmLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgc2VsZi4kc2VsZWN0LmF0dHIoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICB9XG5cbn1cblxuRWFzeURyb3Bkb3duQ29udHJvbGxlci4kaW5qZWN0ID0gWyckd2luZG93JywgJyRyb290U2NvcGUnXTtcblxuZXhwb3J0IGRlZmF1bHQgRWFzeURyb3Bkb3duQ29udHJvbGxlcjtcbiIsImltcG9ydCB7IGdldEVsZW1lbnRJbmRleCB9IGZyb20gJy4vaGVscGVycyc7XG5cbi8qKlxuICogR2V0IHRoZSBjb2xsZWN0aW9uIG91dCBvZiBhIGNvbXByZWhlbnNpb24gc3RyaW5nIHN1Y2ggYXNcbiAqICdmb3IgaSBpbiBbMSwgMiwgMywgNCwgNV0nIG9yICdmb3IgaSBpbiBhcnJheScgZXRjLi4uXG4gKiBAcGFyYW0gY29tcHJlaGVuc2lvblN0cmluZ1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0Q29sbGVjdGlvbk5hbWUoY29tcHJlaGVuc2lvblN0cmluZykge1xuICByZXR1cm4gY29tcHJlaGVuc2lvblN0cmluZy5yZXBsYWNlKC8uKlxcc2luXFxzKFteIF0rKS4qLywgJyQxJyk7XG59XG5cbmZ1bmN0aW9uIGVhc3lEcm9wZG93bkRpcmVjdGl2ZSgkdGltZW91dCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgY29udHJvbGxlcjogJ2Vhc3lEcm9wZG93bkNvbnRyb2xsZXInLFxuICAgIHJlcXVpcmU6IFsnZWFzeURyb3Bkb3duJywgJz9uZ01vZGVsJ10sXG4gICAgc2NvcGU6IHtcbiAgICAgIHNldHRpbmdzOiAnPCcsXG4gICAgfSxcbiAgICBsaW5rOiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBbY3RybCwgbmdNb2RlbENvbnRyb2xsZXJdKSA9PiB7XG5cbiAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgIGN0cmwuaW5pdChlbGVtZW50LCBzY29wZS5zZXR0aW5ncyB8fCB7fSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHdhdGNoQ29sbGVjdGlvbihjb2xsZWN0aW9uKSB7XG4gICAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBpZiAoIWNvbGxlY3Rpb24ubWF0Y2goL1xcWy4qXFxdLykpIHtcbiAgICAgICAgICAgIC8vIGR5bmFtaWMgbGlzdCAtPiB3YXRjaCBmb3IgY2hhbmdlc1xuICAgICAgICAgICAgc2NvcGUuJHdhdGNoQ29sbGVjdGlvbigoKSA9PiBzY29wZS4kcGFyZW50W2NvbGxlY3Rpb25dLCAoKSA9PiB7XG4gICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY3RybC5yZW5kZXJlZCkge1xuICAgICAgICAgICAgICAgICAgY3RybC5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc3RhdGljIGxpc3QgLT4gbm8gbmVlZCB0byB3YXRjaCBpdFxuICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIG5nLW9wdGlvbnMgLT4gd2F0Y2ggdGhlIG9wdGlvbnNcbiAgICAgIGlmIChhdHRycy5uZ09wdGlvbnMpIHtcbiAgICAgICAgLy8gd2F0Y2ggZm9yIG9wdGlvbiBjaGFuZ2VzXG4gICAgICAgIHdhdGNoQ29sbGVjdGlvbihnZXRDb2xsZWN0aW9uTmFtZShhdHRycy5uZ09wdGlvbnMpKTtcbiAgICAgIH1cblxuICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gW10uc2xpY2UuY2FsbChlbGVtZW50LmZpbmQoJ29wdGlvbicpKTtcbiAgICAgICAgY29uc3Qgb3B0aW9uV2l0aE5nUmVwZWF0ID0gb3B0aW9ucy5maW5kKG4gPT4gbi5oYXNBdHRyaWJ1dGUoJ25nLXJlcGVhdCcpKTtcbiAgICAgICAgaWYgKG9wdGlvbldpdGhOZ1JlcGVhdCkge1xuICAgICAgICAgIC8vIC8vIG5nLXJlcGVhdCAtPiB3YXRjaCBmb3IgY29sbGVjdGlvbiBjaGFuZ2VzXG4gICAgICAgICAgd2F0Y2hDb2xsZWN0aW9uKGdldENvbGxlY3Rpb25OYW1lKG9wdGlvbldpdGhOZ1JlcGVhdC5nZXRBdHRyaWJ1dGUoJ25nLXJlcGVhdCcpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gc3RhdGljIG9wdGlvbnMgLT4gcmVuZGVyIHdpdGhvdXQgd2F0Y2hpbmdcbiAgICAgICAgICBpbml0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAobmdNb2RlbENvbnRyb2xsZXIpIHtcbiAgICAgICAgLy8gd2F0Y2ggbW9kZWwgY2hhbmdlcyBhbmQgc2V0IHRoZSBkcm9wZG93biB2YWx1ZSBpZiB0aGUgdmFsdWUgY2hhbmdlZFxuICAgICAgICBzY29wZS4kd2F0Y2goKCkgPT4gbmdNb2RlbENvbnRyb2xsZXIuJG1vZGVsVmFsdWUsIChuZXdWYWx1ZSkgPT4ge1xuICAgICAgICAgIGlmIChuZXdWYWx1ZSAmJiBjdHJsLnJlbmRlcmVkKSB7XG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkT3B0aW9uID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCdbc2VsZWN0ZWRdJyk7XG5cbiAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkT3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBnZXRFbGVtZW50SW5kZXgoc2VsZWN0ZWRPcHRpb24pO1xuICAgICAgICAgICAgICAgIGN0cmwuc2VsZWN0KGluZGV4KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICB9O1xufVxuXG5lYXN5RHJvcGRvd25EaXJlY3RpdmUuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcblxuZXhwb3J0IGRlZmF1bHQgZWFzeURyb3Bkb3duRGlyZWN0aXZlO1xuXG4iLCJpbXBvcnQgYW5ndWxhciBmcm9tICdhbmd1bGFyJztcblxuaW1wb3J0IGVhc3lEcm9wZG93bkNvbnRyb2xsZXIgZnJvbSAnLi9lYXN5LWRyb3Bkb3duLWNvbnRyb2xsZXInO1xuaW1wb3J0IGVhc3lEcm9wZG93bkRpcmVjdGl2ZSBmcm9tICcuL2Vhc3ktZHJvcGRvd24tZGlyZWN0aXZlJztcblxuYW5ndWxhci5tb2R1bGUoJ25nLWVhc3ktZHJvcGRvd24nLCBbXSlcbiAgICAuZGlyZWN0aXZlKCdlYXN5RHJvcGRvd24nLCBlYXN5RHJvcGRvd25EaXJlY3RpdmUpXG4gICAgLmNvbnRyb2xsZXIoJ2Vhc3lEcm9wZG93bkNvbnRyb2xsZXInLCBlYXN5RHJvcGRvd25Db250cm9sbGVyKTtcblxuIl0sIm5hbWVzIjpbIkVsZW1lbnQiLCJwcm90b3R5cGUiLCJtYXRjaGVzIiwibWF0Y2hlc1NlbGVjdG9yIiwibW96TWF0Y2hlc1NlbGVjdG9yIiwibXNNYXRjaGVzU2VsZWN0b3IiLCJvTWF0Y2hlc1NlbGVjdG9yIiwid2Via2l0TWF0Y2hlc1NlbGVjdG9yIiwibWF0Y2hlc1BvbHlmaWxsIiwicyIsImRvY3VtZW50Iiwib3duZXJEb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJpIiwibGVuZ3RoIiwiaXRlbSIsIndpbmRvdyIsImNsb3Nlc3QiLCJlbCIsInBhcmVudEVsZW1lbnQiLCJhcnIiLCJmb3JFYWNoIiwiaGFzT3duUHJvcGVydHkiLCJkZWZpbmVQcm9wZXJ0eSIsInByZXZpb3VzU2libGluZyIsIm5vZGVUeXBlIiwidW5kZWZpbmVkIiwiQ2hhcmFjdGVyRGF0YSIsIkFycmF5IiwiZmluZCIsInByZWRpY2F0ZSIsIlR5cGVFcnJvciIsImxpc3QiLCJPYmplY3QiLCJ0aGlzQXJnIiwiYXJndW1lbnRzIiwidmFsdWUiLCJjYWxsIiwiZ2V0RWxlbWVudEluZGV4Iiwibm9kZSIsImluZGV4IiwiY3VycmVudE5vZGUiLCJwcmV2aW91c0VsZW1lbnRTaWJsaW5nIiwic2libGluZ3MiLCJmaWx0ZXIiLCJwYXJlbnROb2RlIiwiY2hpbGRyZW4iLCJjaGlsZCIsInVud3JhcCIsInBhcmVudCIsImdyYW5kUGFyZW50IiwiaW5zZXJ0QmVmb3JlIiwicmVtb3ZlQ2hpbGQiLCJjbG9zZUFsbEV2ZW50IiwiJCIsImFuZ3VsYXIiLCJlbGVtZW50IiwiRWFzeURyb3Bkb3duQ29udHJvbGxlciIsIiR3aW5kb3ciLCIkcm9vdFNjb3BlIiwiaXNGaWVsZCIsImRvd24iLCJpbkZvY3VzIiwiZGlzYWJsZWQiLCJjdXRPZmYiLCJoYXNMYWJlbCIsImtleWJvYXJkTW9kZSIsIm5hdGl2ZVRvdWNoIiwid3JhcHBlckNsYXNzIiwib25DaGFuZ2UiLCJpbnN0YW5jZXMiLCJzZWxlY3RFbGVtZW50Iiwic2V0dGluZ3MiLCJleHRlbmQiLCIkc2VsZWN0Iiwib3B0aW9ucyIsIiRvcHRpb25zIiwiaXNUb3VjaCIsInJlbW92ZUNsYXNzIiwibyIsIm9wdGlvbiIsInNlbGVjdGVkIiwiaW5uZXJUZXh0IiwiZm9jdXNJbmRleCIsImxhYmVsIiwic2V0QXR0cmlidXRlIiwicHVzaCIsImVxIiwidGV4dCIsInJlbmRlciIsIiRvbiIsImNsb3NlIiwidG91Y2hDbGFzcyIsImRpc2FibGVkQ2xhc3MiLCIkY29udGFpbmVyIiwid3JhcCIsIiRhY3RpdmUiLCJ0aXRsZSIsImFwcGVuZCIsIiRjYXJhdCIsIiRzY3JvbGxXcmFwcGVyIiwiJGRyb3BEb3duIiwiJGZvcm0iLCJhY3RpdmUiLCIkaXRlbXMiLCJhZGRDbGFzcyIsImdldE1heEhlaWdodCIsImJpbmRUb3VjaEhhbmRsZXJzIiwiYmluZEhhbmRsZXJzIiwicmVuZGVyZWQiLCJtYXhIZWlnaHQiLCIkaXRlbSIsIm9mZnNldEhlaWdodCIsIm9uIiwiZm9jdXMiLCJlIiwidGFyZ2V0Iiwic2VsZiIsInF1ZXJ5Iiwib3BlbiIsInN0b3BQcm9wYWdhdGlvbiIsImJvZHkiLCJjbGFzc05hbWVzIiwic3BsaXQiLCJqb2luIiwic2VsZWN0IiwiJHQiLCJrZXkiLCJrZXlDb2RlIiwid2FzRG93biIsInByZXZlbnREZWZhdWx0Iiwic2Nyb2xsVG9WaWV3Iiwic2xpY2UiLCJzZWFyY2giLCJyZXNldFF1ZXJ5IiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwic2V0VGltZW91dCIsInNjcm9sbFRvcCIsInNjcm9sbEhlaWdodCIsIm9mZiIsInNjcm9sbFkiLCJkb2N1bWVudEVsZW1lbnQiLCJzY3JvbGxMZWZ0Iiwic2Nyb2xsWCIsInNjcm9sbE9mZnNldCIsIm5vdEluVmlld3BvcnQiLCJjbG9zZUFsbCIsInNjcm9sbFRvIiwiY3NzIiwiJGVtaXQiLCJzZWxlY3RJbmRleCIsInJlbW92ZUF0dHIiLCJwcm9wIiwidHJpZ2dlckhhbmRsZXIiLCJsb2NrIiwiZ2V0VGl0bGUiLCJ0b1VwcGVyQ2FzZSIsImluZGV4T2YiLCIkZm9jdXNJdGVtIiwicmFuZ2UiLCJpbm5lckhlaWdodCIsImNsaWVudEhlaWdodCIsIm1lbnVCb3R0b20iLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJ0b3AiLCJtaW4iLCJtYXgiLCJ1bmJpbmRIYW5kbGVycyIsInJlbW92ZSIsImF0dHIiLCIkaW5qZWN0IiwiZ2V0Q29sbGVjdGlvbk5hbWUiLCJjb21wcmVoZW5zaW9uU3RyaW5nIiwicmVwbGFjZSIsImVhc3lEcm9wZG93bkRpcmVjdGl2ZSIsIiR0aW1lb3V0Iiwic2NvcGUiLCJhdHRycyIsImN0cmwiLCJuZ01vZGVsQ29udHJvbGxlciIsImluaXQiLCJ3YXRjaENvbGxlY3Rpb24iLCJjb2xsZWN0aW9uIiwibWF0Y2giLCIkd2F0Y2hDb2xsZWN0aW9uIiwiJHBhcmVudCIsImRlc3Ryb3kiLCJuZ09wdGlvbnMiLCJvcHRpb25XaXRoTmdSZXBlYXQiLCJuIiwiaGFzQXR0cmlidXRlIiwiZ2V0QXR0cmlidXRlIiwiJHdhdGNoIiwiJG1vZGVsVmFsdWUiLCJuZXdWYWx1ZSIsInNlbGVjdGVkT3B0aW9uIiwicXVlcnlTZWxlY3RvciIsIm1vZHVsZSIsImRpcmVjdGl2ZSIsImNvbnRyb2xsZXIiLCJlYXN5RHJvcGRvd25Db250cm9sbGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7QUFHQSxJQUFJLENBQUNBLFFBQVFDLFNBQVIsQ0FBa0JDLE9BQXZCLEVBQWdDO1VBQ3RCRCxTQUFSLENB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
