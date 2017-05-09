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
          console.log('key', key);
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
            if (key === 16) {
              _this4.shift = true;
            } else if (key === 9 || key === 27) {
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
            } else if (key !== 16 && key !== 38 && key !== 40) {
              _this4.query += _this4.shift ? String.fromCharCode(key) : String.fromCharCode(key).toLowerCase();
              _this4.search();
              clearTimeout(_this4.resetQuery);
            }
          }
        }
        console.log(_this4.query);
        return true;
      });

      this.$select.on('keyup', function (e) {
        if (e.keyCode === 16) {
          _this4.shift = false;
        }
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
        return _this5.options[i].title;
      };

      for (var i = 0; i < this.options.length; i += 1) {
        var title = getTitle(i);
        var titleLowercase = getTitle(i).toLowerCase();
        if (title.indexOf(this.query) === 0) {
          lock(i);
          return;
        } else if (titleLowercase.indexOf(this.query.toLowerCase()) === 0) {
          lock(i);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbInNyYy9wb2x5ZmlsbHMuanMiLCJzcmMvaGVscGVycy5qcyIsInNyYy9lYXN5LWRyb3Bkb3duLWNvbnRyb2xsZXIuanMiLCJzcmMvZWFzeS1kcm9wZG93bi1kaXJlY3RpdmUuanMiLCJzcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgKi9cblxuLy8gbWF0Y2hlcyBwb2x5ZmlsbFxuaWYgKCFFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XG4gIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgPVxuICAgIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXNTZWxlY3RvciB8fFxuICAgIEVsZW1lbnQucHJvdG90eXBlLm1vek1hdGNoZXNTZWxlY3RvciB8fFxuICAgIEVsZW1lbnQucHJvdG90eXBlLm1zTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgRWxlbWVudC5wcm90b3R5cGUub01hdGNoZXNTZWxlY3RvciB8fFxuICAgIEVsZW1lbnQucHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fFxuICAgIGZ1bmN0aW9uIG1hdGNoZXNQb2x5ZmlsbChzKSB7XG4gICAgICBjb25zdCBtYXRjaGVzID0gKHRoaXMuZG9jdW1lbnQgfHwgdGhpcy5vd25lckRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHMpO1xuICAgICAgZm9yIChsZXQgaSA9IG1hdGNoZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpIC09IDEpIHtcbiAgICAgICAgaWYgKG1hdGNoZXMuaXRlbShpKSA9PT0gdGhpcykge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbn1cblxuLy8gY2xvc2VzdCBwb2x5ZmlsbFxuaWYgKHdpbmRvdy5FbGVtZW50ICYmICFFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0KSB7XG4gIEVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QgPVxuICAgIGZ1bmN0aW9uKHMpIHtcbiAgICAgIGxldCBtYXRjaGVzID0gKHRoaXMuZG9jdW1lbnQgfHwgdGhpcy5vd25lckRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHMpLFxuICAgICAgICBpLFxuICAgICAgICBlbCA9IHRoaXM7XG4gICAgICBkbyB7XG4gICAgICAgIGkgPSBtYXRjaGVzLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKC0taSA+PSAwICYmIG1hdGNoZXMuaXRlbShpKSAhPT0gZWwpIHt9XG4gICAgICB9IHdoaWxlICgoaSA8IDApICYmIChlbCA9IGVsLnBhcmVudEVsZW1lbnQpKTtcbiAgICAgIHJldHVybiBlbDtcbiAgICB9O1xufVxuXG4vLyBwcmV2aW91c0VsZW1lbnRTaWJsaW5nIHBvbHlmaWxsc1xuKGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICBpZiAoaXRlbS5oYXNPd25Qcm9wZXJ0eSgncHJldmlvdXNFbGVtZW50U2libGluZycpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpdGVtLCAncHJldmlvdXNFbGVtZW50U2libGluZycsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGVsID0gdGhpcztcbiAgICAgICAgd2hpbGUgKGVsID0gZWwucHJldmlvdXNTaWJsaW5nKSB7XG4gICAgICAgICAgaWYgKGVsLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSxcbiAgICAgIHNldDogdW5kZWZpbmVkXG4gICAgfSk7XG4gIH0pO1xufSkoW0VsZW1lbnQucHJvdG90eXBlLCBDaGFyYWN0ZXJEYXRhLnByb3RvdHlwZV0pO1xuXG4vLyBmaW5kIHBvbHlmaWxsXG5pZiAoIUFycmF5LnByb3RvdHlwZS5maW5kKSB7XG4gIEFycmF5LnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0aGlzID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FycmF5LnByb3RvdHlwZS5maW5kIGNhbGxlZCBvbiBudWxsIG9yIHVuZGVmaW5lZCcpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByZWRpY2F0ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncHJlZGljYXRlIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cbiAgICBsZXQgbGlzdCA9IE9iamVjdCh0aGlzKTtcbiAgICBsZXQgbGVuZ3RoID0gbGlzdC5sZW5ndGggPj4+IDA7XG4gICAgbGV0IHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgbGV0IHZhbHVlO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWUgPSBsaXN0W2ldO1xuICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBsaXN0KSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IG51bGw7XG4iLCJleHBvcnQgZnVuY3Rpb24gZ2V0RWxlbWVudEluZGV4KG5vZGUpIHtcbiAgbGV0IGluZGV4ID0gMDtcbiAgbGV0IGN1cnJlbnROb2RlID0gbm9kZTtcbiAgd2hpbGUgKGN1cnJlbnROb2RlLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpIHtcbiAgICBpbmRleCArPSAxO1xuICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgfVxuICByZXR1cm4gaW5kZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaWJsaW5ncyhlbCkge1xuICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsKGVsLnBhcmVudE5vZGUuY2hpbGRyZW4sIGNoaWxkID0+IGNoaWxkICE9PSBlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bndyYXAoZWwpIHtcbiAgLy8gZ2V0IHRoZSBlbGVtZW50J3MgcGFyZW50IG5vZGVcbiAgY29uc3QgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcbiAgY29uc3QgZ3JhbmRQYXJlbnQgPSBlbC5wYXJlbnROb2RlLnBhcmVudE5vZGU7XG5cbiAgLy8gbW92ZSBhbGwgY2hpbGRyZW4gb3V0IG9mIHRoZSBlbGVtZW50XG4gIGdyYW5kUGFyZW50Lmluc2VydEJlZm9yZShlbCwgcGFyZW50KTtcblxuICAvLyByZW1vdmUgdGhlIGVtcHR5IGVsZW1lbnRcbiAgZ3JhbmRQYXJlbnQucmVtb3ZlQ2hpbGQocGFyZW50KTtcblxuICByZXR1cm4gZWw7XG59XG4iLCJpbXBvcnQgYW5ndWxhciBmcm9tICdhbmd1bGFyJztcbi8vIGltcG9ydCAkIGZyb20gJ2pxdWVyeSc7XG5pbXBvcnQgJy4vcG9seWZpbGxzJztcbmltcG9ydCB7IGdldEVsZW1lbnRJbmRleCwgc2libGluZ3MsIHVud3JhcCB9IGZyb20gJy4vaGVscGVycyc7XG5cbmNvbnN0IGNsb3NlQWxsRXZlbnQgPSAnZWFzeURyb3Bkb3duOmNsb3NlQWxsJztcbmNvbnN0ICQgPSBhbmd1bGFyLmVsZW1lbnQ7XG5cbmNsYXNzIEVhc3lEcm9wZG93bkNvbnRyb2xsZXIge1xuXG4gIGNvbnN0cnVjdG9yKCR3aW5kb3csICRyb290U2NvcGUpIHtcbiAgICB0aGlzLiR3aW5kb3cgPSAkd2luZG93O1xuICAgIHRoaXMuJHJvb3RTY29wZSA9ICRyb290U2NvcGU7XG5cbiAgICB0aGlzLmlzRmllbGQgPSB0cnVlO1xuICAgIHRoaXMuZG93biA9IGZhbHNlO1xuICAgIHRoaXMuaW5Gb2N1cyA9IGZhbHNlO1xuICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICB0aGlzLmN1dE9mZiA9IGZhbHNlO1xuICAgIHRoaXMuaGFzTGFiZWwgPSBmYWxzZTtcbiAgICB0aGlzLmtleWJvYXJkTW9kZSA9IGZhbHNlO1xuICAgIHRoaXMubmF0aXZlVG91Y2ggPSB0cnVlO1xuICAgIHRoaXMud3JhcHBlckNsYXNzID0gJ2Ryb3Bkb3duJztcbiAgICB0aGlzLm9uQ2hhbmdlID0gbnVsbDtcblxuICAgIHRoaXMuaW5zdGFuY2VzID0ge307XG4gIH1cblxuICBpbml0KHNlbGVjdEVsZW1lbnQsIHNldHRpbmdzKSB7XG4gICAgYW5ndWxhci5leHRlbmQodGhpcywgc2V0dGluZ3MpO1xuICAgIHRoaXMuJHNlbGVjdCA9IHNlbGVjdEVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gW107XG4gICAgdGhpcy4kb3B0aW9ucyA9IHRoaXMuJHNlbGVjdC5maW5kKCdvcHRpb24nKTtcbiAgICB0aGlzLmlzVG91Y2ggPSAnb250b3VjaGVuZCcgaW4gdGhpcy4kd2luZG93LmRvY3VtZW50O1xuICAgIHRoaXMuJHNlbGVjdC5yZW1vdmVDbGFzcyhgJHt0aGlzLndyYXBwZXJDbGFzc30gZHJvcGRvd25gKTtcbiAgICBpZiAodGhpcy4kc2VsZWN0WzBdLm1hdGNoZXMoJzpkaXNhYmxlZCcpKSB7XG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRoaXMuJG9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICB3aW5kb3cubyA9IHRoaXMuJG9wdGlvbnM7XG4gICAgICBhbmd1bGFyLmZvckVhY2godGhpcy4kb3B0aW9ucywgKG9wdGlvbiwgaSkgPT4ge1xuICAgICAgICBpZiAob3B0aW9uLm1hdGNoZXMoJzpjaGVja2VkJykpIHtcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkID0ge1xuICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICB0aXRsZTogb3B0aW9uLmlubmVyVGV4dCxcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRoaXMuZm9jdXNJbmRleCA9IGk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9uLm1hdGNoZXMoJy5sYWJlbCcpICYmIGkgPT09IDApIHtcbiAgICAgICAgICB0aGlzLmhhc0xhYmVsID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLmxhYmVsID0gb3B0aW9uLmlubmVyVGV4dDtcbiAgICAgICAgICBvcHRpb24uc2V0QXR0cmlidXRlKCd2YWx1ZScsICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLm9wdGlvbnMucHVzaCh7XG4gICAgICAgICAgICBkb21Ob2RlOiBvcHRpb24sXG4gICAgICAgICAgICB0aXRsZTogb3B0aW9uLmlubmVyVGV4dCxcbiAgICAgICAgICAgIHZhbHVlOiBvcHRpb24udmFsdWUsXG4gICAgICAgICAgICBzZWxlY3RlZDogb3B0aW9uLm1hdGNoZXMoJzpjaGVja2VkJyksXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIXRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHtcbiAgICAgICAgICBpbmRleDogMCxcbiAgICAgICAgICB0aXRsZTogdGhpcy4kb3B0aW9ucy5lcSgwKS50ZXh0KCksXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZm9jdXNJbmRleCA9IDA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgLy8gcmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnNcbiAgICB0aGlzLiRyb290U2NvcGUuJG9uKGNsb3NlQWxsRXZlbnQsIDo6dGhpcy5jbG9zZSk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgdG91Y2hDbGFzcyA9IHRoaXMuaXNUb3VjaCAmJiB0aGlzLm5hdGl2ZVRvdWNoID8gJyB0b3VjaCcgOiAnJztcbiAgICBjb25zdCBkaXNhYmxlZENsYXNzID0gdGhpcy5kaXNhYmxlZCA/ICcgZGlzYWJsZWQnIDogJyc7XG5cbiAgICB0aGlzLiRjb250YWluZXIgPSB0aGlzLiRzZWxlY3RcbiAgICAgIC53cmFwKGA8ZGl2IGNsYXNzPVwiJHt0aGlzLndyYXBwZXJDbGFzc30ke3RvdWNoQ2xhc3N9JHtkaXNhYmxlZENsYXNzfVwiPjwvZGl2PmApXG4gICAgICAud3JhcCgnPHNwYW4gY2xhc3M9XCJvbGRcIj4nKVxuICAgICAgLnBhcmVudCgpXG4gICAgICAucGFyZW50KCk7XG5cbiAgICB0aGlzLiRhY3RpdmUgPSAkKGA8c3BhbiBjbGFzcz1cInNlbGVjdGVkXCI+JHt0aGlzLnNlbGVjdGVkLnRpdGxlfTwvc3Bhbj5gKTtcbiAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKHRoaXMuJGFjdGl2ZSk7XG4gICAgdGhpcy4kY2FyYXQgPSAkKCc8c3BhbiBjbGFzcz1cImNhcmF0XCIvPicpO1xuICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmQodGhpcy4kY2FyYXQpO1xuICAgIHRoaXMuJHNjcm9sbFdyYXBwZXIgPSAkKCc8ZGl2Pjx1bC8+PC9kaXY+Jyk7XG4gICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZCh0aGlzLiRzY3JvbGxXcmFwcGVyKTtcbiAgICB0aGlzLiRkcm9wRG93biA9IHRoaXMuJHNjcm9sbFdyYXBwZXIuZmluZCgndWwnKTtcbiAgICB0aGlzLiRmb3JtID0gJCh0aGlzLiRjb250YWluZXJbMF0uY2xvc2VzdCgnZm9ybScpKTtcblxuICAgIHRoaXMub3B0aW9ucy5mb3JFYWNoKChvKSA9PiB7XG4gICAgICBjb25zdCBhY3RpdmUgPSBvLnNlbGVjdGVkID8gJyBjbGFzcz1cImFjdGl2ZVwiJyA6ICcnO1xuICAgICAgdGhpcy4kZHJvcERvd24uYXBwZW5kKGA8bGkke2FjdGl2ZX0+JHtvLnRpdGxlfTwvbGk+YCk7XG4gICAgfSk7XG4gICAgdGhpcy4kaXRlbXMgPSB0aGlzLiRkcm9wRG93bi5maW5kKCdsaScpO1xuXG4gICAgaWYgKHRoaXMuY3V0T2ZmICYmIHRoaXMuJGl0ZW1zLmxlbmd0aCA+IHRoaXMuY3V0T2ZmKSB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ3Njcm9sbGFibGUnKTtcblxuICAgIHRoaXMuZ2V0TWF4SGVpZ2h0KCk7XG5cbiAgICBpZiAodGhpcy5pc1RvdWNoICYmIHRoaXMubmF0aXZlVG91Y2gpIHtcbiAgICAgIHRoaXMuYmluZFRvdWNoSGFuZGxlcnMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5iaW5kSGFuZGxlcnMoKTtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXJlZCA9IHRydWU7XG4gIH1cblxuICBnZXRNYXhIZWlnaHQoKSB7XG4gICAgdGhpcy5tYXhIZWlnaHQgPSAwO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLiRpdGVtcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgJGl0ZW0gPSB0aGlzLiRpdGVtcy5lcShpKTtcbiAgICAgIHRoaXMubWF4SGVpZ2h0ICs9ICRpdGVtWzBdLm9mZnNldEhlaWdodDtcbiAgICAgIGlmICh0aGlzLmN1dE9mZiA9PT0gaSArIDEpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYmluZFRvdWNoSGFuZGxlcnMoKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLm9uKCdjbGljaycsICgpID0+IHtcbiAgICAgIHRoaXMuJHNlbGVjdFswXS5mb2N1cygpO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kc2VsZWN0Lm9uKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBlLnRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKCdvcHRpb246Y2hlY2tlZCcpWzBdO1xuICAgICAgY29uc3QgdGl0bGUgPSBzZWxlY3RlZC5pbm5lclRleHQ7XG4gICAgICBjb25zdCB2YWx1ZSA9IHNlbGVjdGVkLnZhbHVlO1xuXG4gICAgICB0aGlzLiRhY3RpdmUudGV4dCh0aXRsZSk7XG4gICAgICBpZiAodHlwZW9mIHRoaXMub25DaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5vbkNoYW5nZS5jYWxsKHRoaXMuJHNlbGVjdFswXSwge1xuICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuJHNlbGVjdC5vbignZm9jdXMnLCAoKSA9PiB7XG4gICAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ2ZvY3VzJyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLiRzZWxlY3Qub24oJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgdGhpcy4kY29udGFpbmVyLnJlbW92ZUNsYXNzKCdmb2N1cycpO1xuICAgIH0pO1xuICB9XG5cbiAgYmluZEhhbmRsZXJzKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHRoaXMucXVlcnkgPSAnJztcblxuICAgIHRoaXMuJGNvbnRhaW5lci5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmRvd24gJiYgIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB9XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kY29udGFpbmVyLm9uKCdtb3VzZW1vdmUnLCAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5rZXlib2FyZE1vZGUpIHtcbiAgICAgICAgdGhpcy5rZXlib2FyZE1vZGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgICQodGhpcy4kd2luZG93LmRvY3VtZW50LmJvZHkpLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBjb25zdCBjbGFzc05hbWVzID0gdGhpcy53cmFwcGVyQ2xhc3Muc3BsaXQoJyAnKS5qb2luKCcuJyk7XG5cbiAgICAgIGlmICghZS50YXJnZXQuY2xvc2VzdChgLiR7Y2xhc3NOYW1lc31gKSAmJiB0aGlzLmRvd24pIHtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy4kaXRlbXMub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gZ2V0RWxlbWVudEluZGV4KGUudGFyZ2V0KTtcbiAgICAgIHRoaXMuc2VsZWN0KGluZGV4KTtcbiAgICAgIHRoaXMuJHNlbGVjdFswXS5mb2N1cygpO1xuICAgICAgZS50YXJnZXQuc2V0QXR0cmlidXRlKCdzZWxlY3RlZCcsICdzZWxlY3RlZCcpO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kaXRlbXMub24oJ21vdXNlb3ZlcicsIChlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMua2V5Ym9hcmRNb2RlKSB7XG4gICAgICAgIGNvbnN0ICR0ID0gJChlLnRhcmdldCk7XG4gICAgICAgICR0LmFkZENsYXNzKCdmb2N1cycpO1xuICAgICAgICBzaWJsaW5ncygkdFswXSkuZm9yRWFjaChzID0+ICQocykucmVtb3ZlQ2xhc3MoJ2ZvY3VzJykpO1xuICAgICAgICB0aGlzLmZvY3VzSW5kZXggPSBnZXRFbGVtZW50SW5kZXgoZS50YXJnZXQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy4kaXRlbXMub24oJ21vdXNlb3V0JywgKGUpID0+IHtcbiAgICAgIGlmICghdGhpcy5rZXlib2FyZE1vZGUpIHtcbiAgICAgICAgJChlLnRhcmdldCkucmVtb3ZlQ2xhc3MoJ2ZvY3VzJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLiRzZWxlY3Qub24oJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgdGhpcy4kY29udGFpbmVyLmFkZENsYXNzKCdmb2N1cycpO1xuICAgICAgdGhpcy5pbkZvY3VzID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHRoaXMuJHNlbGVjdC5vbignYmx1cicsICgpID0+IHtcbiAgICAgIHRoaXMuJGNvbnRhaW5lci5yZW1vdmVDbGFzcygnZm9jdXMnKTtcbiAgICAgIHRoaXMuaW5Gb2N1cyA9IGZhbHNlO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kc2VsZWN0Lm9uKCdrZXlkb3duJywgKGUpID0+IHtcbiAgICAgIGlmICh0aGlzLmluRm9jdXMpIHtcbiAgICAgICAgdGhpcy5rZXlib2FyZE1vZGUgPSB0cnVlO1xuICAgICAgICBjb25zdCBrZXkgPSBlLmtleUNvZGU7XG4gICAgICAgIGNvbnNvbGUubG9nKCdrZXknLCBrZXkpO1xuICAgICAgICBjb25zdCB3YXNEb3duID0gdGhpcy5kb3duO1xuXG4gICAgICAgIGlmIChrZXkgPT09IDM4IHx8IGtleSA9PT0gNDAgfHwga2V5ID09PSAzMiB8fCBrZXkgPT09IDEzKSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGlmIChrZXkgPT09IDM4KSB7XG4gICAgICAgICAgICB0aGlzLmZvY3VzSW5kZXggLT0gMTtcbiAgICAgICAgICAgIHRoaXMuZm9jdXNJbmRleCA9IHRoaXMuZm9jdXNJbmRleCA8IDAgPyB0aGlzLiRpdGVtcy5sZW5ndGggLSAxIDogdGhpcy5mb2N1c0luZGV4O1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSA0MCkge1xuICAgICAgICAgICAgdGhpcy5mb2N1c0luZGV4ICs9IDE7XG4gICAgICAgICAgICB0aGlzLmZvY3VzSW5kZXggPSB0aGlzLmZvY3VzSW5kZXggPiB0aGlzLiRpdGVtcy5sZW5ndGggLSAxID8gMCA6IHRoaXMuZm9jdXNJbmRleDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBvcGVuIHRoZSBkcm9wZG93biB3aXRoIHNwYWNlIG9yIGVudGVyXG4gICAgICAgICAgaWYgKCF0aGlzLmRvd24gJiYga2V5ICE9PSAzOCAmJiBrZXkgIT09IDQwKSB7XG4gICAgICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3QodGhpcy5mb2N1c0luZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy4kaXRlbXNcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnZm9jdXMnKVxuICAgICAgICAgICAgLmVxKHRoaXMuZm9jdXNJbmRleClcbiAgICAgICAgICAgIC5hZGRDbGFzcygnZm9jdXMnKTtcblxuICAgICAgICAgIGlmICh0aGlzLmN1dE9mZikge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxUb1ZpZXcoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLnF1ZXJ5ID0gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5kb3duKSB7XG4gICAgICAgICAgaWYgKGtleSA9PT0gMTYpIHtcbiAgICAgICAgICAgIHRoaXMuc2hpZnQgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSA5IHx8IGtleSA9PT0gMjcpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gMTMgJiYgd2FzRG93bikge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3QodGhpcy5mb2N1c0luZGV4KTtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gOCkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5xdWVyeSA9IHRoaXMucXVlcnkuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgICAgdGhpcy5zZWFyY2goKTtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlc2V0UXVlcnkpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5ICE9PSAxNiAmJiBrZXkgIT09IDM4ICYmIGtleSAhPT0gNDApIHtcbiAgICAgICAgICAgIHRoaXMucXVlcnkgKz0gdGhpcy5zaGlmdFxuICAgICAgICAgICAgICA/IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5KVxuICAgICAgICAgICAgICA6IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5KS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgdGhpcy5zZWFyY2goKTtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlc2V0UXVlcnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc29sZS5sb2codGhpcy5xdWVyeSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcblxuXG4gICAgdGhpcy4kc2VsZWN0Lm9uKCdrZXl1cCcsIChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXlDb2RlID09PSAxNikge1xuICAgICAgICB0aGlzLnNoaWZ0ID0gZmFsc2U7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc2V0UXVlcnkgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5xdWVyeSA9ICcnO1xuICAgICAgfSwgMTIwMCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLiRkcm9wRG93bi5vbignc2Nyb2xsJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuJGRyb3BEb3duWzBdLnNjcm9sbFRvcCA+PSB0aGlzLiRkcm9wRG93blswXS5zY3JvbGxIZWlnaHQgLSB0aGlzLm1heEhlaWdodCkge1xuICAgICAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ2JvdHRvbScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLnJlbW92ZUNsYXNzKCdib3R0b20nKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh0aGlzLiRmb3JtLmxlbmd0aCkge1xuICAgICAgdGhpcy4kZm9ybS5vbigncmVzZXQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IHRoaXMuaGFzTGFiZWwgPyB0aGlzLmxhYmVsIDogc2VsZi5vcHRpb25zWzBdLnRpdGxlO1xuICAgICAgICB0aGlzLiRhY3RpdmUudGV4dChhY3RpdmUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgdW5iaW5kSGFuZGxlcnMoKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLm9mZignY2xpY2snKTtcbiAgICB0aGlzLiRjb250YWluZXIub2ZmKCdtb3VzZW1vdmUnKTtcbiAgICAkKHRoaXMuJHdpbmRvdy5kb2N1bWVudC5ib2R5KS5vZmYoJ2NsaWNrJyk7XG4gICAgdGhpcy4kaXRlbXMub2ZmKCdjbGljaycpO1xuICAgIHRoaXMuJGl0ZW1zLm9mZignbW91c2VvdmVyJyk7XG4gICAgdGhpcy4kaXRlbXMub2ZmKCdtb3VzZW91dCcpO1xuICAgIHRoaXMuJHNlbGVjdC5vZmYoJ2ZvY3VzJyk7XG4gICAgdGhpcy4kc2VsZWN0Lm9mZignYmx1cicpO1xuICAgIHRoaXMuJHNlbGVjdC5vZmYoJ2tleWRvd24nKTtcbiAgICB0aGlzLiRzZWxlY3Qub2ZmKCdrZXl1cCcpO1xuICAgIHRoaXMuJGRyb3BEb3duLm9mZignc2Nyb2xsJyk7XG4gICAgdGhpcy4kZm9ybS5vZmYoJ3Jlc2V0Jyk7XG4gIH1cblxuICBvcGVuKCkge1xuICAgIGNvbnN0IHNjcm9sbFRvcCA9IHRoaXMuJHdpbmRvdy5zY3JvbGxZIHx8IHRoaXMuJHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuICAgIGNvbnN0IHNjcm9sbExlZnQgPSB0aGlzLiR3aW5kb3cuc2Nyb2xsWCB8fCB0aGlzLiR3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQ7XG4gICAgY29uc3Qgc2Nyb2xsT2Zmc2V0ID0gdGhpcy5ub3RJblZpZXdwb3J0KHNjcm9sbFRvcCk7XG5cbiAgICB0aGlzLmNsb3NlQWxsKCk7XG4gICAgdGhpcy5nZXRNYXhIZWlnaHQoKTtcbiAgICB0aGlzLiRzZWxlY3RbMF0uZm9jdXMoKTtcbiAgICB0aGlzLiR3aW5kb3cuc2Nyb2xsVG8oc2Nyb2xsTGVmdCwgc2Nyb2xsVG9wICsgc2Nyb2xsT2Zmc2V0KTtcbiAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICB0aGlzLiRzY3JvbGxXcmFwcGVyLmNzcygnaGVpZ2h0JywgYCR7dGhpcy5tYXhIZWlnaHR9cHhgKTtcbiAgICB0aGlzLmRvd24gPSB0cnVlO1xuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgdGhpcy4kc2Nyb2xsV3JhcHBlci5jc3MoJ2hlaWdodCcsICcwcHgnKTtcbiAgICB0aGlzLmZvY3VzSW5kZXggPSB0aGlzLnNlbGVjdGVkLmluZGV4O1xuICAgIHRoaXMucXVlcnkgPSAnJztcbiAgICB0aGlzLmRvd24gPSBmYWxzZTtcbiAgfVxuXG4gIGNsb3NlQWxsKCkge1xuICAgIHRoaXMuJHJvb3RTY29wZS4kZW1pdChjbG9zZUFsbEV2ZW50KTtcbiAgfVxuXG4gIHNlbGVjdChpbmRleCkge1xuICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMub3B0aW9uc1tpbmRleF07XG4gICAgY29uc3Qgc2VsZWN0SW5kZXggPSB0aGlzLmhhc0xhYmVsID8gaW5kZXggKyAxIDogaW5kZXg7XG4gICAgdGhpcy4kaXRlbXMucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpLmVxKGluZGV4KS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgdGhpcy4kYWN0aXZlLnRleHQob3B0aW9uLnRpdGxlKTtcblxuICAgIHRoaXMuJHNlbGVjdFxuICAgICAgLmZpbmQoJ29wdGlvbicpXG4gICAgICAucmVtb3ZlQXR0cignc2VsZWN0ZWQnKVxuICAgICAgLmVxKHNlbGVjdEluZGV4KVxuICAgICAgLnByb3AoJ3NlbGVjdGVkJywgdHJ1ZSlcbiAgICAgIC5wYXJlbnQoKVxuICAgICAgLnRyaWdnZXJIYW5kbGVyKCdjaGFuZ2UnKTtcblxuICAgIHRoaXMuc2VsZWN0ZWQgPSB7XG4gICAgICBpbmRleCxcbiAgICAgIHRpdGxlOiBvcHRpb24udGl0bGUsXG4gICAgfTtcbiAgICB0aGlzLmZvY3VzSW5kZXggPSBpbmRleDtcbiAgICBpZiAodHlwZW9mIHRoaXMub25DaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMub25DaGFuZ2UuY2FsbCh0aGlzLiRzZWxlY3RbMF0sIHtcbiAgICAgICAgdGl0bGU6IG9wdGlvbi50aXRsZSxcbiAgICAgICAgdmFsdWU6IG9wdGlvbi52YWx1ZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHNlYXJjaCgpIHtcbiAgICBjb25zdCBsb2NrID0gKGkpID0+IHtcbiAgICAgIHRoaXMuZm9jdXNJbmRleCA9IGk7XG4gICAgICB0aGlzLiRpdGVtcy5yZW1vdmVDbGFzcygnZm9jdXMnKS5lcSh0aGlzLmZvY3VzSW5kZXgpLmFkZENsYXNzKCdmb2N1cycpO1xuICAgICAgdGhpcy5zY3JvbGxUb1ZpZXcoKTtcbiAgICB9O1xuXG4gICAgY29uc3QgZ2V0VGl0bGUgPSBpID0+IHRoaXMub3B0aW9uc1tpXS50aXRsZTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCB0aXRsZSA9IGdldFRpdGxlKGkpO1xuICAgICAgY29uc3QgdGl0bGVMb3dlcmNhc2UgPSBnZXRUaXRsZShpKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKHRpdGxlLmluZGV4T2YodGhpcy5xdWVyeSkgPT09IDApIHtcbiAgICAgICAgbG9jayhpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSBlbHNlIGlmICh0aXRsZUxvd2VyY2FzZS5pbmRleE9mKHRoaXMucXVlcnkudG9Mb3dlckNhc2UoKSkgPT09IDApIHtcbiAgICAgICAgbG9jayhpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgdGl0bGUgPSBnZXRUaXRsZShpKTtcbiAgICAgIGlmICh0aXRsZS5pbmRleE9mKHRoaXMucXVlcnkpID4gLTEpIHtcbiAgICAgICAgbG9jayhpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2Nyb2xsVG9WaWV3KCkge1xuICAgIGlmICh0aGlzLmZvY3VzSW5kZXggPj0gdGhpcy5jdXRPZmYpIHtcbiAgICAgIGNvbnN0ICRmb2N1c0l0ZW0gPSB0aGlzLiRpdGVtcy5lcSh0aGlzLmZvY3VzSW5kZXgpO1xuICAgICAgdGhpcy4kZHJvcERvd25bMF0uc2Nyb2xsVG9wID1cbiAgICAgICAgKCRmb2N1c0l0ZW1bMF0ub2Zmc2V0SGVpZ2h0ICogKHRoaXMuZm9jdXNJbmRleCArIDEpKSAtIHRoaXMubWF4SGVpZ2h0O1xuICAgIH1cbiAgfVxuXG4gIG5vdEluVmlld3BvcnQoc2Nyb2xsVG9wKSB7XG4gICAgY29uc3QgcmFuZ2UgPSB7XG4gICAgICBtaW46IHNjcm9sbFRvcCxcbiAgICAgIG1heDogc2Nyb2xsVG9wICsgKHRoaXMuJHdpbmRvdy5pbm5lckhlaWdodCB8fFxuICAgICAgdGhpcy4kd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpLFxuICAgIH07XG5cbiAgICBjb25zdCBtZW51Qm90dG9tID0gdGhpcy4kZHJvcERvd25bMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICtcbiAgICAgIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wICsgdGhpcy5tYXhIZWlnaHQ7XG5cbiAgICBpZiAobWVudUJvdHRvbSA+PSByYW5nZS5taW4gJiYgbWVudUJvdHRvbSA8PSByYW5nZS5tYXgpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICByZXR1cm4gKG1lbnVCb3R0b20gLSByYW5nZS5tYXgpICsgNTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy51bmJpbmRIYW5kbGVycygpO1xuICAgIHVud3JhcCh0aGlzLiRzZWxlY3RbMF0pO1xuICAgIHNpYmxpbmdzKHRoaXMuJHNlbGVjdFswXSkuZm9yRWFjaChlbCA9PiBlbC5yZW1vdmUoKSk7XG4gICAgdW53cmFwKHRoaXMuJHNlbGVjdFswXSk7XG4gICAgdGhpcy5yZW5kZXJlZCA9IGZhbHNlO1xuICB9XG5cbiAgZGlzYWJsZSgpIHtcbiAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcbiAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgdGhpcy4kc2VsZWN0LmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgaWYgKCF0aGlzLmRvd24pIHRoaXMuY2xvc2UoKTtcbiAgfVxuXG4gIGVuYWJsZSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLmRpc2FibGVkID0gZmFsc2U7XG4gICAgc2VsZi4kY29udGFpbmVyLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgIHNlbGYuJHNlbGVjdC5hdHRyKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgfVxuXG59XG5cbkVhc3lEcm9wZG93bkNvbnRyb2xsZXIuJGluamVjdCA9IFsnJHdpbmRvdycsICckcm9vdFNjb3BlJ107XG5cbmV4cG9ydCBkZWZhdWx0IEVhc3lEcm9wZG93bkNvbnRyb2xsZXI7XG4iLCJpbXBvcnQgeyBnZXRFbGVtZW50SW5kZXggfSBmcm9tICcuL2hlbHBlcnMnO1xuXG4vKipcbiAqIEdldCB0aGUgY29sbGVjdGlvbiBvdXQgb2YgYSBjb21wcmVoZW5zaW9uIHN0cmluZyBzdWNoIGFzXG4gKiAnZm9yIGkgaW4gWzEsIDIsIDMsIDQsIDVdJyBvciAnZm9yIGkgaW4gYXJyYXknIGV0Yy4uLlxuICogQHBhcmFtIGNvbXByZWhlbnNpb25TdHJpbmdcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldENvbGxlY3Rpb25OYW1lKGNvbXByZWhlbnNpb25TdHJpbmcpIHtcbiAgcmV0dXJuIGNvbXByZWhlbnNpb25TdHJpbmcucmVwbGFjZSgvLipcXHNpblxccyhbXiBdKykuKi8sICckMScpO1xufVxuXG5mdW5jdGlvbiBlYXN5RHJvcGRvd25EaXJlY3RpdmUoJHRpbWVvdXQpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIGNvbnRyb2xsZXI6ICdlYXN5RHJvcGRvd25Db250cm9sbGVyJyxcbiAgICByZXF1aXJlOiBbJ2Vhc3lEcm9wZG93bicsICc/bmdNb2RlbCddLFxuICAgIHNjb3BlOiB7XG4gICAgICBzZXR0aW5nczogJzwnLFxuICAgIH0sXG4gICAgbGluazogKHNjb3BlLCBlbGVtZW50LCBhdHRycywgW2N0cmwsIG5nTW9kZWxDb250cm9sbGVyXSkgPT4ge1xuXG4gICAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICBjdHJsLmluaXQoZWxlbWVudCwgc2NvcGUuc2V0dGluZ3MgfHwge30pO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB3YXRjaENvbGxlY3Rpb24oY29sbGVjdGlvbikge1xuICAgICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFjb2xsZWN0aW9uLm1hdGNoKC9cXFsuKlxcXS8pKSB7XG4gICAgICAgICAgICAvLyBkeW5hbWljIGxpc3QgLT4gd2F0Y2ggZm9yIGNoYW5nZXNcbiAgICAgICAgICAgIHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oKCkgPT4gc2NvcGUuJHBhcmVudFtjb2xsZWN0aW9uXSwgKCkgPT4ge1xuICAgICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGN0cmwucmVuZGVyZWQpIHtcbiAgICAgICAgICAgICAgICAgIGN0cmwuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHN0YXRpYyBsaXN0IC0+IG5vIG5lZWQgdG8gd2F0Y2ggaXRcbiAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBuZy1vcHRpb25zIC0+IHdhdGNoIHRoZSBvcHRpb25zXG4gICAgICBpZiAoYXR0cnMubmdPcHRpb25zKSB7XG4gICAgICAgIC8vIHdhdGNoIGZvciBvcHRpb24gY2hhbmdlc1xuICAgICAgICB3YXRjaENvbGxlY3Rpb24oZ2V0Q29sbGVjdGlvbk5hbWUoYXR0cnMubmdPcHRpb25zKSk7XG4gICAgICB9XG5cbiAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IFtdLnNsaWNlLmNhbGwoZWxlbWVudC5maW5kKCdvcHRpb24nKSk7XG4gICAgICAgIGNvbnN0IG9wdGlvbldpdGhOZ1JlcGVhdCA9IG9wdGlvbnMuZmluZChuID0+IG4uaGFzQXR0cmlidXRlKCduZy1yZXBlYXQnKSk7XG4gICAgICAgIGlmIChvcHRpb25XaXRoTmdSZXBlYXQpIHtcbiAgICAgICAgICAvLyAvLyBuZy1yZXBlYXQgLT4gd2F0Y2ggZm9yIGNvbGxlY3Rpb24gY2hhbmdlc1xuICAgICAgICAgIHdhdGNoQ29sbGVjdGlvbihnZXRDb2xsZWN0aW9uTmFtZShvcHRpb25XaXRoTmdSZXBlYXQuZ2V0QXR0cmlidXRlKCduZy1yZXBlYXQnKSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHN0YXRpYyBvcHRpb25zIC0+IHJlbmRlciB3aXRob3V0IHdhdGNoaW5nXG4gICAgICAgICAgaW5pdCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKG5nTW9kZWxDb250cm9sbGVyKSB7XG4gICAgICAgIC8vIHdhdGNoIG1vZGVsIGNoYW5nZXMgYW5kIHNldCB0aGUgZHJvcGRvd24gdmFsdWUgaWYgdGhlIHZhbHVlIGNoYW5nZWRcbiAgICAgICAgc2NvcGUuJHdhdGNoKCgpID0+IG5nTW9kZWxDb250cm9sbGVyLiRtb2RlbFZhbHVlLCAobmV3VmFsdWUpID0+IHtcbiAgICAgICAgICBpZiAobmV3VmFsdWUgJiYgY3RybC5yZW5kZXJlZCkge1xuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZE9wdGlvbiA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignW3NlbGVjdGVkXScpO1xuXG4gICAgICAgICAgICAgIGlmIChzZWxlY3RlZE9wdGlvbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gZ2V0RWxlbWVudEluZGV4KHNlbGVjdGVkT3B0aW9uKTtcbiAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdChpbmRleCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn1cblxuZWFzeURyb3Bkb3duRGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XG5cbmV4cG9ydCBkZWZhdWx0IGVhc3lEcm9wZG93bkRpcmVjdGl2ZTtcblxuIiwiaW1wb3J0IGFuZ3VsYXIgZnJvbSAnYW5ndWxhcic7XG5cbmltcG9ydCBlYXN5RHJvcGRvd25Db250cm9sbGVyIGZyb20gJy4vZWFzeS1kcm9wZG93bi1jb250cm9sbGVyJztcbmltcG9ydCBlYXN5RHJvcGRvd25EaXJlY3RpdmUgZnJvbSAnLi9lYXN5LWRyb3Bkb3duLWRpcmVjdGl2ZSc7XG5cbmFuZ3VsYXIubW9kdWxlKCduZy1lYXN5LWRyb3Bkb3duJywgW10pXG4gICAgLmRpcmVjdGl2ZSgnZWFzeURyb3Bkb3duJywgZWFzeURyb3Bkb3duRGlyZWN0aXZlKVxuICAgIC5jb250cm9sbGVyKCdlYXN5RHJvcGRvd25Db250cm9sbGVyJywgZWFzeURyb3Bkb3duQ29udHJvbGxlcik7XG5cbiJdLCJuYW1lcyI6WyJFbGVtZW50IiwicHJvdG90eXBlIiwibWF0Y2hlcyIsIm1hdGNoZXNTZWxlY3RvciIsIm1vek1hdGNoZXNTZWxlY3RvciIsIm1zTWF0Y2hlc1NlbGVjdG9yIiwib01hdGNoZXNTZWxlY3RvciIsIndlYmtpdE1hdGNoZXNTZWxlY3RvciIsIm1hdGNoZXNQb2x5ZmlsbCIsInMiLCJkb2N1bWVudCIsIm93bmVyRG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiaSIsImxlbmd0aCIsIml0ZW0iLCJ3aW5kb3ciLCJjbG9zZXN0IiwiZWwiLCJwYXJlbnRFbGVtZW50IiwiYXJyIiwiZm9yRWFjaCIsImhhc093blByb3BlcnR5IiwiZGVmaW5lUHJvcGVydHkiLCJwcmV2aW91c1NpYmxpbmciLCJub2RlVHlwZSIsInVuZGVmaW5lZCIsIkNoYXJhY3RlckRhdGEiLCJBcnJheSIsImZpbmQiLCJwcmVkaWNhdGUiLCJUeXBlRXJyb3IiLCJsaXN0IiwiT2JqZWN0IiwidGhpc0FyZyIsImFyZ3VtZW50cyIsInZhbHVlIiwiY2FsbCIsImdldEVsZW1lbnRJbmRleCIsIm5vZGUiLCJpbmRleCIsImN1cnJlbnROb2RlIiwicHJldmlvdXNFbGVtZW50U2libGluZyIsInNpYmxpbmdzIiwiZmlsdGVyIiwicGFyZW50Tm9kZSIsImNoaWxkcmVuIiwiY2hpbGQiLCJ1bndyYXAiLCJwYXJlbnQiLCJncmFuZFBhcmVudCIsImluc2VydEJlZm9yZSIsInJlbW92ZUNoaWxkIiwiY2xvc2VBbGxFdmVudCIsIiQiLCJhbmd1bGFyIiwiZWxlbWVudCIsIkVhc3lEcm9wZG93bkNvbnRyb2xsZXIiLCIkd2luZG93IiwiJHJvb3RTY29wZSIsImlzRmllbGQiLCJkb3duIiwiaW5Gb2N1cyIsImRpc2FibGVkIiwiY3V0T2ZmIiwiaGFzTGFiZWwiLCJrZXlib2FyZE1vZGUiLCJuYXRpdmVUb3VjaCIsIndyYXBwZXJDbGFzcyIsIm9uQ2hhbmdlIiwiaW5zdGFuY2VzIiwic2VsZWN0RWxlbWVudCIsInNldHRpbmdzIiwiZXh0ZW5kIiwiJHNlbGVjdCIsIm9wdGlvbnMiLCIkb3B0aW9ucyIsImlzVG91Y2giLCJyZW1vdmVDbGFzcyIsIm8iLCJvcHRpb24iLCJzZWxlY3RlZCIsImlubmVyVGV4dCIsImZvY3VzSW5kZXgiLCJsYWJlbCIsInNldEF0dHJpYnV0ZSIsInB1c2giLCJlcSIsInRleHQiLCJyZW5kZXIiLCIkb24iLCJjbG9zZSIsInRvdWNoQ2xhc3MiLCJkaXNhYmxlZENsYXNzIiwiJGNvbnRhaW5lciIsIndyYXAiLCIkYWN0aXZlIiwidGl0bGUiLCJhcHBlbmQiLCIkY2FyYXQiLCIkc2Nyb2xsV3JhcHBlciIsIiRkcm9wRG93biIsIiRmb3JtIiwiYWN0aXZlIiwiJGl0ZW1zIiwiYWRkQ2xhc3MiLCJnZXRNYXhIZWlnaHQiLCJiaW5kVG91Y2hIYW5kbGVycyIsImJpbmRIYW5kbGVycyIsInJlbmRlcmVkIiwibWF4SGVpZ2h0IiwiJGl0ZW0iLCJvZmZzZXRIZWlnaHQiLCJvbiIsImZvY3VzIiwiZSIsInRhcmdldCIsInNlbGYiLCJxdWVyeSIsIm9wZW4iLCJzdG9wUHJvcGFnYXRpb24iLCJib2R5IiwiY2xhc3NOYW1lcyIsInNwbGl0Iiwiam9pbiIsInNlbGVjdCIsIiR0Iiwia2V5Iiwia2V5Q29kZSIsImxvZyIsIndhc0Rvd24iLCJwcmV2ZW50RGVmYXVsdCIsInNjcm9sbFRvVmlldyIsInNoaWZ0Iiwic2xpY2UiLCJzZWFyY2giLCJyZXNldFF1ZXJ5IiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwidG9Mb3dlckNhc2UiLCJzZXRUaW1lb3V0Iiwic2Nyb2xsVG9wIiwic2Nyb2xsSGVpZ2h0Iiwib2ZmIiwic2Nyb2xsWSIsImRvY3VtZW50RWxlbWVudCIsInNjcm9sbExlZnQiLCJzY3JvbGxYIiwic2Nyb2xsT2Zmc2V0Iiwibm90SW5WaWV3cG9ydCIsImNsb3NlQWxsIiwic2Nyb2xsVG8iLCJjc3MiLCIkZW1pdCIsInNlbGVjdEluZGV4IiwicmVtb3ZlQXR0ciIsInByb3AiLCJ0cmlnZ2VySGFuZGxlciIsImxvY2siLCJnZXRUaXRsZSIsInRpdGxlTG93ZXJjYXNlIiwiaW5kZXhPZiIsIiRmb2N1c0l0ZW0iLCJyYW5nZSIsImlubmVySGVpZ2h0IiwiY2xpZW50SGVpZ2h0IiwibWVudUJvdHRvbSIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInRvcCIsIm1pbiIsIm1heCIsInVuYmluZEhhbmRsZXJzIiwicmVtb3ZlIiwiYXR0ciIsIiRpbmplY3QiLCJnZXRDb2xsZWN0aW9uTmFtZSIsImNvbXByZWhlbnNpb25TdHJpbmciLCJyZXBsYWNlIiwiZWFzeURyb3Bkb3duRGlyZWN0aXZlIiwiJHRpbWVvdXQiLCJzY29wZSIsImF0dHJzIiwiY3RybCIsIm5nTW9kZWxDb250cm9sbGVyIiwiaW5pdCIsIndhdGNoQ29sbGVjdGlvbiIsImNvbGxlY3Rpb24iLCJtYXRjaCIsIiR3YXRjaENvbGxlY3Rpb24iLCIkcGFyZW50IiwiZGVzdHJveSIsIm5nT3B0aW9ucyIsIm9wdGlvbldpdGhOZ1JlcGVhdCIsIm4iLCJoYXNBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCIkd2F0Y2giLCIkbW9kZWxWYWx1ZSIsIm5ld1ZhbHVlIiwic2VsZWN0ZWRPcHRpb24iLCJxdWVyeVNlbGVjdG9yIiwibW9kdWxlIiwiZGlyZWN0aXZlIiwiY29udHJvbGxlciIsImVhc3lEcm9wZG93bkNvbnRyb2xsZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7OztBQUdBLElBQUksQ0FBQ0EsUUFBUUMsU0FBUixDQUFrQkMsT0FBdkIsRUFBZ0M7VUFDdEJELFNBQVIsQ0FBa0JDLE9BQWxCLEdBQ0VGLFFBQVFDLFNBQVIsQ0FBa0JFLGVBQWxCLElBQ0FILFFBQVFDLFNBQVIsQ0FBa0JHLGtCQURsQixJQUVBSixRQUFRQyxTQUFSLENBQWtCSSxpQkFGbEIsSUFHQUwsUUFBUUMsU0FBUixDQUFrQkssZ0JBSGxCLElBSUFOLFFBQVFDLFNBQVIsQ0FBa0JNLHFCQUpsQixJQUtBLFNBQVNDLGVBQVQsQ0FBeUJDLENBQXpCLEVBQTRCO1FBQ3BCUCxVQUFVLENBQUMsS0FBS1EsUUFBTCxJQUFpQixLQUFLQyxhQUF2QixFQUFzQ0MsZ0JBQXRDLENBQXVESCxDQUF2RCxDQUFoQjtTQUNLLElBQUlJLElBQUlYLFFBQVFZLE1BQVIsR0FBaUIsQ0FBOUIsRUFBaUNELEtBQUssQ0FBdEMsRUFBeUNBLEtBQUssQ0FBOUMsRUFBaUQ7VUFDM0NYLFFBQVFhLElBQVIsQ0FBYUYsQ0FBYixNQUFvQixJQUF4QixFQUE4QjtlQUNyQixJQUFQOzs7V0FHRyxLQUFQ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
