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
  function EasyDropdownController($window, $rootScope, $timeout) {
    classCallCheck(this, EasyDropdownController);

    this.$window = $window;
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;

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
              _this4.$timeout.cancel(_this4.resetQuery);
              return false;
            } else if (key !== 16 && key !== 38 && key !== 40) {
              _this4.query += _this4.shift ? String.fromCharCode(key) : String.fromCharCode(key).toLowerCase();
              _this4.search();
              _this4.$timeout.cancel(_this4.resetQuery);
            }
          }
        }
        return true;
      });

      this.$select.on('keyup', function (e) {
        if (e.keyCode === 16) {
          _this4.shift = false;
        }
        _this4.resetQuery = _this4.$timeout(function () {
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

      var focusIndex = function focusIndex(i) {
        _this5.focusIndex = i;
        _this5.$items.removeClass('focus').eq(_this5.focusIndex).addClass('focus');
        _this5.scrollToView();
      };

      var getTitle = function getTitle(i) {
        return _this5.options[i].title;
      };

      var foundIndex = null;

      for (var i = 0; i < this.options.length; i += 1) {
        var title = getTitle(i);
        var titleLowercase = title.toLowerCase();
        if (title.indexOf(this.query) === 0) {
          foundIndex = i;
          break;
        } else if (titleLowercase.indexOf(this.query) === 0) {
          foundIndex = i;
          break;
        } else if (title.indexOf(this.query) > 0) {
          foundIndex = i;
          break;
        } else if (titleLowercase.indexOf(this.query) > 0) {
          foundIndex = i;
          break;
        }
      }

      if (foundIndex) {
        focusIndex(foundIndex);
      }

      // for (let i = 0; i < this.options.length; i += 1) {
      //   const title = getTitle(i);
      //   const titleLowercase = getTitle(i).toLowerCase();
      //   if (title.indexOf(this.query) === 0) {
      //     focusIndex(i);
      //   } else if (titleLowercase.indexOf(this.query.toLowerCase()) === 0) {
      //     focusIndex(i);
      //     return;
      //   }
      // }
      //
      // for (let i = 0; i < this.options.length; i += 1) {
      //   const title = getTitle(i);
      //   if (title.indexOf(this.query) > -1) {
      //     focusIndex(i);
      //     break;
      //   }
      // }
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

EasyDropdownController.$inject = ['$window', '$rootScope', '$timeout'];

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbInNyYy9wb2x5ZmlsbHMuanMiLCJzcmMvaGVscGVycy5qcyIsInNyYy9lYXN5LWRyb3Bkb3duLWNvbnRyb2xsZXIuanMiLCJzcmMvZWFzeS1kcm9wZG93bi1kaXJlY3RpdmUuanMiLCJzcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgKi9cblxuLy8gbWF0Y2hlcyBwb2x5ZmlsbFxuaWYgKCFFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XG4gIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgPVxuICAgIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXNTZWxlY3RvciB8fFxuICAgIEVsZW1lbnQucHJvdG90eXBlLm1vek1hdGNoZXNTZWxlY3RvciB8fFxuICAgIEVsZW1lbnQucHJvdG90eXBlLm1zTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgRWxlbWVudC5wcm90b3R5cGUub01hdGNoZXNTZWxlY3RvciB8fFxuICAgIEVsZW1lbnQucHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fFxuICAgIGZ1bmN0aW9uIG1hdGNoZXNQb2x5ZmlsbChzKSB7XG4gICAgICBjb25zdCBtYXRjaGVzID0gKHRoaXMuZG9jdW1lbnQgfHwgdGhpcy5vd25lckRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHMpO1xuICAgICAgZm9yIChsZXQgaSA9IG1hdGNoZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpIC09IDEpIHtcbiAgICAgICAgaWYgKG1hdGNoZXMuaXRlbShpKSA9PT0gdGhpcykge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbn1cblxuLy8gY2xvc2VzdCBwb2x5ZmlsbFxuaWYgKHdpbmRvdy5FbGVtZW50ICYmICFFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0KSB7XG4gIEVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QgPVxuICAgIGZ1bmN0aW9uKHMpIHtcbiAgICAgIGxldCBtYXRjaGVzID0gKHRoaXMuZG9jdW1lbnQgfHwgdGhpcy5vd25lckRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHMpLFxuICAgICAgICBpLFxuICAgICAgICBlbCA9IHRoaXM7XG4gICAgICBkbyB7XG4gICAgICAgIGkgPSBtYXRjaGVzLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKC0taSA+PSAwICYmIG1hdGNoZXMuaXRlbShpKSAhPT0gZWwpIHt9XG4gICAgICB9IHdoaWxlICgoaSA8IDApICYmIChlbCA9IGVsLnBhcmVudEVsZW1lbnQpKTtcbiAgICAgIHJldHVybiBlbDtcbiAgICB9O1xufVxuXG4vLyBwcmV2aW91c0VsZW1lbnRTaWJsaW5nIHBvbHlmaWxsc1xuKGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICBpZiAoaXRlbS5oYXNPd25Qcm9wZXJ0eSgncHJldmlvdXNFbGVtZW50U2libGluZycpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpdGVtLCAncHJldmlvdXNFbGVtZW50U2libGluZycsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGVsID0gdGhpcztcbiAgICAgICAgd2hpbGUgKGVsID0gZWwucHJldmlvdXNTaWJsaW5nKSB7XG4gICAgICAgICAgaWYgKGVsLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSxcbiAgICAgIHNldDogdW5kZWZpbmVkXG4gICAgfSk7XG4gIH0pO1xufSkoW0VsZW1lbnQucHJvdG90eXBlLCBDaGFyYWN0ZXJEYXRhLnByb3RvdHlwZV0pO1xuXG4vLyBmaW5kIHBvbHlmaWxsXG5pZiAoIUFycmF5LnByb3RvdHlwZS5maW5kKSB7XG4gIEFycmF5LnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0aGlzID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FycmF5LnByb3RvdHlwZS5maW5kIGNhbGxlZCBvbiBudWxsIG9yIHVuZGVmaW5lZCcpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByZWRpY2F0ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncHJlZGljYXRlIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cbiAgICBsZXQgbGlzdCA9IE9iamVjdCh0aGlzKTtcbiAgICBsZXQgbGVuZ3RoID0gbGlzdC5sZW5ndGggPj4+IDA7XG4gICAgbGV0IHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgbGV0IHZhbHVlO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWUgPSBsaXN0W2ldO1xuICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBsaXN0KSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IG51bGw7XG4iLCJleHBvcnQgZnVuY3Rpb24gZ2V0RWxlbWVudEluZGV4KG5vZGUpIHtcbiAgbGV0IGluZGV4ID0gMDtcbiAgbGV0IGN1cnJlbnROb2RlID0gbm9kZTtcbiAgd2hpbGUgKGN1cnJlbnROb2RlLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpIHtcbiAgICBpbmRleCArPSAxO1xuICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgfVxuICByZXR1cm4gaW5kZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaWJsaW5ncyhlbCkge1xuICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsKGVsLnBhcmVudE5vZGUuY2hpbGRyZW4sIGNoaWxkID0+IGNoaWxkICE9PSBlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bndyYXAoZWwpIHtcbiAgLy8gZ2V0IHRoZSBlbGVtZW50J3MgcGFyZW50IG5vZGVcbiAgY29uc3QgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcbiAgY29uc3QgZ3JhbmRQYXJlbnQgPSBlbC5wYXJlbnROb2RlLnBhcmVudE5vZGU7XG5cbiAgLy8gbW92ZSBhbGwgY2hpbGRyZW4gb3V0IG9mIHRoZSBlbGVtZW50XG4gIGdyYW5kUGFyZW50Lmluc2VydEJlZm9yZShlbCwgcGFyZW50KTtcblxuICAvLyByZW1vdmUgdGhlIGVtcHR5IGVsZW1lbnRcbiAgZ3JhbmRQYXJlbnQucmVtb3ZlQ2hpbGQocGFyZW50KTtcblxuICByZXR1cm4gZWw7XG59XG4iLCJpbXBvcnQgYW5ndWxhciBmcm9tICdhbmd1bGFyJztcbi8vIGltcG9ydCAkIGZyb20gJ2pxdWVyeSc7XG5pbXBvcnQgJy4vcG9seWZpbGxzJztcbmltcG9ydCB7IGdldEVsZW1lbnRJbmRleCwgc2libGluZ3MsIHVud3JhcCB9IGZyb20gJy4vaGVscGVycyc7XG5cbmNvbnN0IGNsb3NlQWxsRXZlbnQgPSAnZWFzeURyb3Bkb3duOmNsb3NlQWxsJztcbmNvbnN0ICQgPSBhbmd1bGFyLmVsZW1lbnQ7XG5cbmNsYXNzIEVhc3lEcm9wZG93bkNvbnRyb2xsZXIge1xuXG4gIGNvbnN0cnVjdG9yKCR3aW5kb3csICRyb290U2NvcGUsICR0aW1lb3V0KSB7XG4gICAgdGhpcy4kd2luZG93ID0gJHdpbmRvdztcbiAgICB0aGlzLiRyb290U2NvcGUgPSAkcm9vdFNjb3BlO1xuICAgIHRoaXMuJHRpbWVvdXQgPSAkdGltZW91dDtcblxuICAgIHRoaXMuaXNGaWVsZCA9IHRydWU7XG4gICAgdGhpcy5kb3duID0gZmFsc2U7XG4gICAgdGhpcy5pbkZvY3VzID0gZmFsc2U7XG4gICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIHRoaXMuY3V0T2ZmID0gZmFsc2U7XG4gICAgdGhpcy5oYXNMYWJlbCA9IGZhbHNlO1xuICAgIHRoaXMua2V5Ym9hcmRNb2RlID0gZmFsc2U7XG4gICAgdGhpcy5uYXRpdmVUb3VjaCA9IHRydWU7XG4gICAgdGhpcy53cmFwcGVyQ2xhc3MgPSAnZHJvcGRvd24nO1xuICAgIHRoaXMub25DaGFuZ2UgPSBudWxsO1xuXG4gICAgdGhpcy5pbnN0YW5jZXMgPSB7fTtcbiAgfVxuXG4gIGluaXQoc2VsZWN0RWxlbWVudCwgc2V0dGluZ3MpIHtcbiAgICBhbmd1bGFyLmV4dGVuZCh0aGlzLCBzZXR0aW5ncyk7XG4gICAgdGhpcy4kc2VsZWN0ID0gc2VsZWN0RWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSBbXTtcbiAgICB0aGlzLiRvcHRpb25zID0gdGhpcy4kc2VsZWN0LmZpbmQoJ29wdGlvbicpO1xuICAgIHRoaXMuaXNUb3VjaCA9ICdvbnRvdWNoZW5kJyBpbiB0aGlzLiR3aW5kb3cuZG9jdW1lbnQ7XG4gICAgdGhpcy4kc2VsZWN0LnJlbW92ZUNsYXNzKGAke3RoaXMud3JhcHBlckNsYXNzfSBkcm9wZG93bmApO1xuICAgIGlmICh0aGlzLiRzZWxlY3RbMF0ubWF0Y2hlcygnOmRpc2FibGVkJykpIHtcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAodGhpcy4kb3B0aW9ucy5sZW5ndGgpIHtcbiAgICAgIHdpbmRvdy5vID0gdGhpcy4kb3B0aW9ucztcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0aGlzLiRvcHRpb25zLCAob3B0aW9uLCBpKSA9PiB7XG4gICAgICAgIGlmIChvcHRpb24ubWF0Y2hlcygnOmNoZWNrZWQnKSkge1xuICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB7XG4gICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgIHRpdGxlOiBvcHRpb24uaW5uZXJUZXh0LFxuICAgICAgICAgIH07XG4gICAgICAgICAgdGhpcy5mb2N1c0luZGV4ID0gaTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb24ubWF0Y2hlcygnLmxhYmVsJykgJiYgaSA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuaGFzTGFiZWwgPSB0cnVlO1xuICAgICAgICAgIHRoaXMubGFiZWwgPSBvcHRpb24uaW5uZXJUZXh0O1xuICAgICAgICAgIG9wdGlvbi5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMub3B0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgIGRvbU5vZGU6IG9wdGlvbixcbiAgICAgICAgICAgIHRpdGxlOiBvcHRpb24uaW5uZXJUZXh0LFxuICAgICAgICAgICAgdmFsdWU6IG9wdGlvbi52YWx1ZSxcbiAgICAgICAgICAgIHNlbGVjdGVkOiBvcHRpb24ubWF0Y2hlcygnOmNoZWNrZWQnKSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmICghdGhpcy5zZWxlY3RlZCkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkID0ge1xuICAgICAgICAgIGluZGV4OiAwLFxuICAgICAgICAgIHRpdGxlOiB0aGlzLiRvcHRpb25zLmVxKDApLnRleHQoKSxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5mb2N1c0luZGV4ID0gMDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICAvLyByZWdpc3RlciBldmVudCBoYW5kbGVyc1xuICAgIHRoaXMuJHJvb3RTY29wZS4kb24oY2xvc2VBbGxFdmVudCwgOjp0aGlzLmNsb3NlKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB0b3VjaENsYXNzID0gdGhpcy5pc1RvdWNoICYmIHRoaXMubmF0aXZlVG91Y2ggPyAnIHRvdWNoJyA6ICcnO1xuICAgIGNvbnN0IGRpc2FibGVkQ2xhc3MgPSB0aGlzLmRpc2FibGVkID8gJyBkaXNhYmxlZCcgOiAnJztcblxuICAgIHRoaXMuJGNvbnRhaW5lciA9IHRoaXMuJHNlbGVjdFxuICAgICAgLndyYXAoYDxkaXYgY2xhc3M9XCIke3RoaXMud3JhcHBlckNsYXNzfSR7dG91Y2hDbGFzc30ke2Rpc2FibGVkQ2xhc3N9XCI+PC9kaXY+YClcbiAgICAgIC53cmFwKCc8c3BhbiBjbGFzcz1cIm9sZFwiPicpXG4gICAgICAucGFyZW50KClcbiAgICAgIC5wYXJlbnQoKTtcblxuICAgIHRoaXMuJGFjdGl2ZSA9ICQoYDxzcGFuIGNsYXNzPVwic2VsZWN0ZWRcIj4ke3RoaXMuc2VsZWN0ZWQudGl0bGV9PC9zcGFuPmApO1xuICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmQodGhpcy4kYWN0aXZlKTtcbiAgICB0aGlzLiRjYXJhdCA9ICQoJzxzcGFuIGNsYXNzPVwiY2FyYXRcIi8+Jyk7XG4gICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZCh0aGlzLiRjYXJhdCk7XG4gICAgdGhpcy4kc2Nyb2xsV3JhcHBlciA9ICQoJzxkaXY+PHVsLz48L2Rpdj4nKTtcbiAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKHRoaXMuJHNjcm9sbFdyYXBwZXIpO1xuICAgIHRoaXMuJGRyb3BEb3duID0gdGhpcy4kc2Nyb2xsV3JhcHBlci5maW5kKCd1bCcpO1xuICAgIHRoaXMuJGZvcm0gPSAkKHRoaXMuJGNvbnRhaW5lclswXS5jbG9zZXN0KCdmb3JtJykpO1xuXG4gICAgdGhpcy5vcHRpb25zLmZvckVhY2goKG8pID0+IHtcbiAgICAgIGNvbnN0IGFjdGl2ZSA9IG8uc2VsZWN0ZWQgPyAnIGNsYXNzPVwiYWN0aXZlXCInIDogJyc7XG4gICAgICB0aGlzLiRkcm9wRG93bi5hcHBlbmQoYDxsaSR7YWN0aXZlfT4ke28udGl0bGV9PC9saT5gKTtcbiAgICB9KTtcbiAgICB0aGlzLiRpdGVtcyA9IHRoaXMuJGRyb3BEb3duLmZpbmQoJ2xpJyk7XG5cbiAgICBpZiAodGhpcy5jdXRPZmYgJiYgdGhpcy4kaXRlbXMubGVuZ3RoID4gdGhpcy5jdXRPZmYpIHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcygnc2Nyb2xsYWJsZScpO1xuXG4gICAgdGhpcy5nZXRNYXhIZWlnaHQoKTtcblxuICAgIGlmICh0aGlzLmlzVG91Y2ggJiYgdGhpcy5uYXRpdmVUb3VjaCkge1xuICAgICAgdGhpcy5iaW5kVG91Y2hIYW5kbGVycygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJpbmRIYW5kbGVycygpO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlcmVkID0gdHJ1ZTtcbiAgfVxuXG4gIGdldE1heEhlaWdodCgpIHtcbiAgICB0aGlzLm1heEhlaWdodCA9IDA7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuJGl0ZW1zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCAkaXRlbSA9IHRoaXMuJGl0ZW1zLmVxKGkpO1xuICAgICAgdGhpcy5tYXhIZWlnaHQgKz0gJGl0ZW1bMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgaWYgKHRoaXMuY3V0T2ZmID09PSBpICsgMSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBiaW5kVG91Y2hIYW5kbGVycygpIHtcbiAgICB0aGlzLiRjb250YWluZXIub24oJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgdGhpcy4kc2VsZWN0WzBdLmZvY3VzKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLiRzZWxlY3Qub24oJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICBjb25zdCBzZWxlY3RlZCA9IGUudGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoJ29wdGlvbjpjaGVja2VkJylbMF07XG4gICAgICBjb25zdCB0aXRsZSA9IHNlbGVjdGVkLmlubmVyVGV4dDtcbiAgICAgIGNvbnN0IHZhbHVlID0gc2VsZWN0ZWQudmFsdWU7XG5cbiAgICAgIHRoaXMuJGFjdGl2ZS50ZXh0KHRpdGxlKTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vbkNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLm9uQ2hhbmdlLmNhbGwodGhpcy4kc2VsZWN0WzBdLCB7XG4gICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy4kc2VsZWN0Lm9uKCdmb2N1cycsICgpID0+IHtcbiAgICAgIHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcygnZm9jdXMnKTtcbiAgICB9KTtcblxuICAgIHRoaXMuJHNlbGVjdC5vbignZm9jdXMnLCAoKSA9PiB7XG4gICAgICB0aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoJ2ZvY3VzJyk7XG4gICAgfSk7XG4gIH1cblxuICBiaW5kSGFuZGxlcnMoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5xdWVyeSA9ICcnO1xuXG4gICAgdGhpcy4kY29udGFpbmVyLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZG93biAmJiAhdGhpcy5kaXNhYmxlZCkge1xuICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIH1cbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLiRjb250YWluZXIub24oJ21vdXNlbW92ZScsICgpID0+IHtcbiAgICAgIGlmICh0aGlzLmtleWJvYXJkTW9kZSkge1xuICAgICAgICB0aGlzLmtleWJvYXJkTW9kZSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCh0aGlzLiR3aW5kb3cuZG9jdW1lbnQuYm9keSkub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZXMgPSB0aGlzLndyYXBwZXJDbGFzcy5zcGxpdCgnICcpLmpvaW4oJy4nKTtcblxuICAgICAgaWYgKCFlLnRhcmdldC5jbG9zZXN0KGAuJHtjbGFzc05hbWVzfWApICYmIHRoaXMuZG93bikge1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLiRpdGVtcy5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgY29uc3QgaW5kZXggPSBnZXRFbGVtZW50SW5kZXgoZS50YXJnZXQpO1xuICAgICAgdGhpcy5zZWxlY3QoaW5kZXgpO1xuICAgICAgdGhpcy4kc2VsZWN0WzBdLmZvY3VzKCk7XG4gICAgICBlLnRhcmdldC5zZXRBdHRyaWJ1dGUoJ3NlbGVjdGVkJywgJ3NlbGVjdGVkJyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLiRpdGVtcy5vbignbW91c2VvdmVyJywgKGUpID0+IHtcbiAgICAgIGlmICghdGhpcy5rZXlib2FyZE1vZGUpIHtcbiAgICAgICAgY29uc3QgJHQgPSAkKGUudGFyZ2V0KTtcbiAgICAgICAgJHQuYWRkQ2xhc3MoJ2ZvY3VzJyk7XG4gICAgICAgIHNpYmxpbmdzKCR0WzBdKS5mb3JFYWNoKHMgPT4gJChzKS5yZW1vdmVDbGFzcygnZm9jdXMnKSk7XG4gICAgICAgIHRoaXMuZm9jdXNJbmRleCA9IGdldEVsZW1lbnRJbmRleChlLnRhcmdldCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLiRpdGVtcy5vbignbW91c2VvdXQnLCAoZSkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmtleWJvYXJkTW9kZSkge1xuICAgICAgICAkKGUudGFyZ2V0KS5yZW1vdmVDbGFzcygnZm9jdXMnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuJHNlbGVjdC5vbignZm9jdXMnLCAoKSA9PiB7XG4gICAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ2ZvY3VzJyk7XG4gICAgICB0aGlzLmluRm9jdXMgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kc2VsZWN0Lm9uKCdibHVyJywgKCkgPT4ge1xuICAgICAgdGhpcy4kY29udGFpbmVyLnJlbW92ZUNsYXNzKCdmb2N1cycpO1xuICAgICAgdGhpcy5pbkZvY3VzID0gZmFsc2U7XG4gICAgfSk7XG5cbiAgICB0aGlzLiRzZWxlY3Qub24oJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgaWYgKHRoaXMuaW5Gb2N1cykge1xuICAgICAgICB0aGlzLmtleWJvYXJkTW9kZSA9IHRydWU7XG4gICAgICAgIGNvbnN0IGtleSA9IGUua2V5Q29kZTtcbiAgICAgICAgY29uc3Qgd2FzRG93biA9IHRoaXMuZG93bjtcblxuICAgICAgICBpZiAoa2V5ID09PSAzOCB8fCBrZXkgPT09IDQwIHx8IGtleSA9PT0gMzIgfHwga2V5ID09PSAxMykge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBpZiAoa2V5ID09PSAzOCkge1xuICAgICAgICAgICAgdGhpcy5mb2N1c0luZGV4IC09IDE7XG4gICAgICAgICAgICB0aGlzLmZvY3VzSW5kZXggPSB0aGlzLmZvY3VzSW5kZXggPCAwID8gdGhpcy4kaXRlbXMubGVuZ3RoIC0gMSA6IHRoaXMuZm9jdXNJbmRleDtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gNDApIHtcbiAgICAgICAgICAgIHRoaXMuZm9jdXNJbmRleCArPSAxO1xuICAgICAgICAgICAgdGhpcy5mb2N1c0luZGV4ID0gdGhpcy5mb2N1c0luZGV4ID4gdGhpcy4kaXRlbXMubGVuZ3RoIC0gMSA/IDAgOiB0aGlzLmZvY3VzSW5kZXg7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gb3BlbiB0aGUgZHJvcGRvd24gd2l0aCBzcGFjZSBvciBlbnRlclxuICAgICAgICAgIGlmICghdGhpcy5kb3duICYmIGtleSAhPT0gMzggJiYga2V5ICE9PSA0MCkge1xuICAgICAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0KHRoaXMuZm9jdXNJbmRleCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuJGl0ZW1zXG4gICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2ZvY3VzJylcbiAgICAgICAgICAgIC5lcSh0aGlzLmZvY3VzSW5kZXgpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2ZvY3VzJyk7XG5cbiAgICAgICAgICBpZiAodGhpcy5jdXRPZmYpIHtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsVG9WaWV3KCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5xdWVyeSA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZG93bikge1xuICAgICAgICAgIGlmIChrZXkgPT09IDE2KSB7XG4gICAgICAgICAgICB0aGlzLnNoaWZ0ID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gOSB8fCBrZXkgPT09IDI3KSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IDEzICYmIHdhc0Rvd24pIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0KHRoaXMuZm9jdXNJbmRleCk7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IDgpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMucXVlcnkgPSB0aGlzLnF1ZXJ5LnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoKCk7XG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0LmNhbmNlbCh0aGlzLnJlc2V0UXVlcnkpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5ICE9PSAxNiAmJiBrZXkgIT09IDM4ICYmIGtleSAhPT0gNDApIHtcbiAgICAgICAgICAgIHRoaXMucXVlcnkgKz0gdGhpcy5zaGlmdFxuICAgICAgICAgICAgICA/IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5KVxuICAgICAgICAgICAgICA6IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5KS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgdGhpcy5zZWFyY2goKTtcbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQuY2FuY2VsKHRoaXMucmVzZXRRdWVyeSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcblxuXG4gICAgdGhpcy4kc2VsZWN0Lm9uKCdrZXl1cCcsIChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXlDb2RlID09PSAxNikge1xuICAgICAgICB0aGlzLnNoaWZ0ID0gZmFsc2U7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc2V0UXVlcnkgPSB0aGlzLiR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5xdWVyeSA9ICcnO1xuICAgICAgfSwgMTIwMCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLiRkcm9wRG93bi5vbignc2Nyb2xsJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuJGRyb3BEb3duWzBdLnNjcm9sbFRvcCA+PSB0aGlzLiRkcm9wRG93blswXS5zY3JvbGxIZWlnaHQgLSB0aGlzLm1heEhlaWdodCkge1xuICAgICAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ2JvdHRvbScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLnJlbW92ZUNsYXNzKCdib3R0b20nKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh0aGlzLiRmb3JtLmxlbmd0aCkge1xuICAgICAgdGhpcy4kZm9ybS5vbigncmVzZXQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IHRoaXMuaGFzTGFiZWwgPyB0aGlzLmxhYmVsIDogc2VsZi5vcHRpb25zWzBdLnRpdGxlO1xuICAgICAgICB0aGlzLiRhY3RpdmUudGV4dChhY3RpdmUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgdW5iaW5kSGFuZGxlcnMoKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLm9mZignY2xpY2snKTtcbiAgICB0aGlzLiRjb250YWluZXIub2ZmKCdtb3VzZW1vdmUnKTtcbiAgICAkKHRoaXMuJHdpbmRvdy5kb2N1bWVudC5ib2R5KS5vZmYoJ2NsaWNrJyk7XG4gICAgdGhpcy4kaXRlbXMub2ZmKCdjbGljaycpO1xuICAgIHRoaXMuJGl0ZW1zLm9mZignbW91c2VvdmVyJyk7XG4gICAgdGhpcy4kaXRlbXMub2ZmKCdtb3VzZW91dCcpO1xuICAgIHRoaXMuJHNlbGVjdC5vZmYoJ2ZvY3VzJyk7XG4gICAgdGhpcy4kc2VsZWN0Lm9mZignYmx1cicpO1xuICAgIHRoaXMuJHNlbGVjdC5vZmYoJ2tleWRvd24nKTtcbiAgICB0aGlzLiRzZWxlY3Qub2ZmKCdrZXl1cCcpO1xuICAgIHRoaXMuJGRyb3BEb3duLm9mZignc2Nyb2xsJyk7XG4gICAgdGhpcy4kZm9ybS5vZmYoJ3Jlc2V0Jyk7XG4gIH1cblxuICBvcGVuKCkge1xuICAgIGNvbnN0IHNjcm9sbFRvcCA9IHRoaXMuJHdpbmRvdy5zY3JvbGxZIHx8IHRoaXMuJHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuICAgIGNvbnN0IHNjcm9sbExlZnQgPSB0aGlzLiR3aW5kb3cuc2Nyb2xsWCB8fCB0aGlzLiR3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQ7XG4gICAgY29uc3Qgc2Nyb2xsT2Zmc2V0ID0gdGhpcy5ub3RJblZpZXdwb3J0KHNjcm9sbFRvcCk7XG5cbiAgICB0aGlzLmNsb3NlQWxsKCk7XG4gICAgdGhpcy5nZXRNYXhIZWlnaHQoKTtcbiAgICB0aGlzLiRzZWxlY3RbMF0uZm9jdXMoKTtcbiAgICB0aGlzLiR3aW5kb3cuc2Nyb2xsVG8oc2Nyb2xsTGVmdCwgc2Nyb2xsVG9wICsgc2Nyb2xsT2Zmc2V0KTtcbiAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICB0aGlzLiRzY3JvbGxXcmFwcGVyLmNzcygnaGVpZ2h0JywgYCR7dGhpcy5tYXhIZWlnaHR9cHhgKTtcbiAgICB0aGlzLmRvd24gPSB0cnVlO1xuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgdGhpcy4kc2Nyb2xsV3JhcHBlci5jc3MoJ2hlaWdodCcsICcwcHgnKTtcbiAgICB0aGlzLmZvY3VzSW5kZXggPSB0aGlzLnNlbGVjdGVkLmluZGV4O1xuICAgIHRoaXMucXVlcnkgPSAnJztcbiAgICB0aGlzLmRvd24gPSBmYWxzZTtcbiAgfVxuXG4gIGNsb3NlQWxsKCkge1xuICAgIHRoaXMuJHJvb3RTY29wZS4kZW1pdChjbG9zZUFsbEV2ZW50KTtcbiAgfVxuXG4gIHNlbGVjdChpbmRleCkge1xuICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMub3B0aW9uc1tpbmRleF07XG4gICAgY29uc3Qgc2VsZWN0SW5kZXggPSB0aGlzLmhhc0xhYmVsID8gaW5kZXggKyAxIDogaW5kZXg7XG4gICAgdGhpcy4kaXRlbXMucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpLmVxKGluZGV4KS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgdGhpcy4kYWN0aXZlLnRleHQob3B0aW9uLnRpdGxlKTtcblxuICAgIHRoaXMuJHNlbGVjdFxuICAgICAgLmZpbmQoJ29wdGlvbicpXG4gICAgICAucmVtb3ZlQXR0cignc2VsZWN0ZWQnKVxuICAgICAgLmVxKHNlbGVjdEluZGV4KVxuICAgICAgLnByb3AoJ3NlbGVjdGVkJywgdHJ1ZSlcbiAgICAgIC5wYXJlbnQoKVxuICAgICAgLnRyaWdnZXJIYW5kbGVyKCdjaGFuZ2UnKTtcblxuICAgIHRoaXMuc2VsZWN0ZWQgPSB7XG4gICAgICBpbmRleCxcbiAgICAgIHRpdGxlOiBvcHRpb24udGl0bGUsXG4gICAgfTtcbiAgICB0aGlzLmZvY3VzSW5kZXggPSBpbmRleDtcbiAgICBpZiAodHlwZW9mIHRoaXMub25DaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMub25DaGFuZ2UuY2FsbCh0aGlzLiRzZWxlY3RbMF0sIHtcbiAgICAgICAgdGl0bGU6IG9wdGlvbi50aXRsZSxcbiAgICAgICAgdmFsdWU6IG9wdGlvbi52YWx1ZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHNlYXJjaCgpIHtcbiAgICBjb25zdCBmb2N1c0luZGV4ID0gKGkpID0+IHtcbiAgICAgIHRoaXMuZm9jdXNJbmRleCA9IGk7XG4gICAgICB0aGlzLiRpdGVtcy5yZW1vdmVDbGFzcygnZm9jdXMnKS5lcSh0aGlzLmZvY3VzSW5kZXgpLmFkZENsYXNzKCdmb2N1cycpO1xuICAgICAgdGhpcy5zY3JvbGxUb1ZpZXcoKTtcbiAgICB9O1xuXG4gICAgY29uc3QgZ2V0VGl0bGUgPSBpID0+IHRoaXMub3B0aW9uc1tpXS50aXRsZTtcblxuICAgIGxldCBmb3VuZEluZGV4ID0gbnVsbDtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCB0aXRsZSA9IGdldFRpdGxlKGkpO1xuICAgICAgY29uc3QgdGl0bGVMb3dlcmNhc2UgPSB0aXRsZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKHRpdGxlLmluZGV4T2YodGhpcy5xdWVyeSkgPT09IDApIHtcbiAgICAgICAgZm91bmRJbmRleCA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfSBlbHNlIGlmICh0aXRsZUxvd2VyY2FzZS5pbmRleE9mKHRoaXMucXVlcnkpID09PSAwKSB7XG4gICAgICAgIGZvdW5kSW5kZXggPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH0gZWxzZSBpZiAodGl0bGUuaW5kZXhPZih0aGlzLnF1ZXJ5KSA+IDApIHtcbiAgICAgICAgZm91bmRJbmRleCA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfSBlbHNlIGlmICh0aXRsZUxvd2VyY2FzZS5pbmRleE9mKHRoaXMucXVlcnkpID4gMCkge1xuICAgICAgICBmb3VuZEluZGV4ID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZvdW5kSW5kZXgpIHtcbiAgICAgIGZvY3VzSW5kZXgoZm91bmRJbmRleCk7XG4gICAgfVxuXG4gICAgLy8gZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAvLyAgIGNvbnN0IHRpdGxlID0gZ2V0VGl0bGUoaSk7XG4gICAgLy8gICBjb25zdCB0aXRsZUxvd2VyY2FzZSA9IGdldFRpdGxlKGkpLnRvTG93ZXJDYXNlKCk7XG4gICAgLy8gICBpZiAodGl0bGUuaW5kZXhPZih0aGlzLnF1ZXJ5KSA9PT0gMCkge1xuICAgIC8vICAgICBmb2N1c0luZGV4KGkpO1xuICAgIC8vICAgfSBlbHNlIGlmICh0aXRsZUxvd2VyY2FzZS5pbmRleE9mKHRoaXMucXVlcnkudG9Mb3dlckNhc2UoKSkgPT09IDApIHtcbiAgICAvLyAgICAgZm9jdXNJbmRleChpKTtcbiAgICAvLyAgICAgcmV0dXJuO1xuICAgIC8vICAgfVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgLy8gICBjb25zdCB0aXRsZSA9IGdldFRpdGxlKGkpO1xuICAgIC8vICAgaWYgKHRpdGxlLmluZGV4T2YodGhpcy5xdWVyeSkgPiAtMSkge1xuICAgIC8vICAgICBmb2N1c0luZGV4KGkpO1xuICAgIC8vICAgICBicmVhaztcbiAgICAvLyAgIH1cbiAgICAvLyB9XG4gIH1cblxuICBzY3JvbGxUb1ZpZXcoKSB7XG4gICAgaWYgKHRoaXMuZm9jdXNJbmRleCA+PSB0aGlzLmN1dE9mZikge1xuICAgICAgY29uc3QgJGZvY3VzSXRlbSA9IHRoaXMuJGl0ZW1zLmVxKHRoaXMuZm9jdXNJbmRleCk7XG4gICAgICB0aGlzLiRkcm9wRG93blswXS5zY3JvbGxUb3AgPVxuICAgICAgICAoJGZvY3VzSXRlbVswXS5vZmZzZXRIZWlnaHQgKiAodGhpcy5mb2N1c0luZGV4ICsgMSkpIC0gdGhpcy5tYXhIZWlnaHQ7XG4gICAgfVxuICB9XG5cbiAgbm90SW5WaWV3cG9ydChzY3JvbGxUb3ApIHtcbiAgICBjb25zdCByYW5nZSA9IHtcbiAgICAgIG1pbjogc2Nyb2xsVG9wLFxuICAgICAgbWF4OiBzY3JvbGxUb3AgKyAodGhpcy4kd2luZG93LmlubmVySGVpZ2h0IHx8XG4gICAgICB0aGlzLiR3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCksXG4gICAgfTtcblxuICAgIGNvbnN0IG1lbnVCb3R0b20gPSB0aGlzLiRkcm9wRG93blswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgK1xuICAgICAgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgKyB0aGlzLm1heEhlaWdodDtcblxuICAgIGlmIChtZW51Qm90dG9tID49IHJhbmdlLm1pbiAmJiBtZW51Qm90dG9tIDw9IHJhbmdlLm1heCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiAobWVudUJvdHRvbSAtIHJhbmdlLm1heCkgKyA1O1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLnVuYmluZEhhbmRsZXJzKCk7XG4gICAgdW53cmFwKHRoaXMuJHNlbGVjdFswXSk7XG4gICAgc2libGluZ3ModGhpcy4kc2VsZWN0WzBdKS5mb3JFYWNoKGVsID0+IGVsLnJlbW92ZSgpKTtcbiAgICB1bndyYXAodGhpcy4kc2VsZWN0WzBdKTtcbiAgICB0aGlzLnJlbmRlcmVkID0gZmFsc2U7XG4gIH1cblxuICBkaXNhYmxlKCkge1xuICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xuICAgIHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgICB0aGlzLiRzZWxlY3QuYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgICBpZiAoIXRoaXMuZG93bikgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgZW5hYmxlKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBzZWxmLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgc2VsZi4kc2VsZWN0LmF0dHIoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICB9XG5cbn1cblxuRWFzeURyb3Bkb3duQ29udHJvbGxlci4kaW5qZWN0ID0gWyckd2luZG93JywgJyRyb290U2NvcGUnLCAnJHRpbWVvdXQnXTtcblxuZXhwb3J0IGRlZmF1bHQgRWFzeURyb3Bkb3duQ29udHJvbGxlcjtcbiIsImltcG9ydCB7IGdldEVsZW1lbnRJbmRleCB9IGZyb20gJy4vaGVscGVycyc7XG5cbi8qKlxuICogR2V0IHRoZSBjb2xsZWN0aW9uIG91dCBvZiBhIGNvbXByZWhlbnNpb24gc3RyaW5nIHN1Y2ggYXNcbiAqICdmb3IgaSBpbiBbMSwgMiwgMywgNCwgNV0nIG9yICdmb3IgaSBpbiBhcnJheScgZXRjLi4uXG4gKiBAcGFyYW0gY29tcHJlaGVuc2lvblN0cmluZ1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0Q29sbGVjdGlvbk5hbWUoY29tcHJlaGVuc2lvblN0cmluZykge1xuICByZXR1cm4gY29tcHJlaGVuc2lvblN0cmluZy5yZXBsYWNlKC8uKlxcc2luXFxzKFteIF0rKS4qLywgJyQxJyk7XG59XG5cbmZ1bmN0aW9uIGVhc3lEcm9wZG93bkRpcmVjdGl2ZSgkdGltZW91dCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgY29udHJvbGxlcjogJ2Vhc3lEcm9wZG93bkNvbnRyb2xsZXInLFxuICAgIHJlcXVpcmU6IFsnZWFzeURyb3Bkb3duJywgJz9uZ01vZGVsJ10sXG4gICAgc2NvcGU6IHtcbiAgICAgIHNldHRpbmdzOiAnPCcsXG4gICAgfSxcbiAgICBsaW5rOiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBbY3RybCwgbmdNb2RlbENvbnRyb2xsZXJdKSA9PiB7XG5cbiAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgIGN0cmwuaW5pdChlbGVtZW50LCBzY29wZS5zZXR0aW5ncyB8fCB7fSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHdhdGNoQ29sbGVjdGlvbihjb2xsZWN0aW9uKSB7XG4gICAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBpZiAoIWNvbGxlY3Rpb24ubWF0Y2goL1xcWy4qXFxdLykpIHtcbiAgICAgICAgICAgIC8vIGR5bmFtaWMgbGlzdCAtPiB3YXRjaCBmb3IgY2hhbmdlc1xuICAgICAgICAgICAgc2NvcGUuJHdhdGNoQ29sbGVjdGlvbigoKSA9PiBzY29wZS4kcGFyZW50W2NvbGxlY3Rpb25dLCAoKSA9PiB7XG4gICAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY3RybC5yZW5kZXJlZCkge1xuICAgICAgICAgICAgICAgICAgY3RybC5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc3RhdGljIGxpc3QgLT4gbm8gbmVlZCB0byB3YXRjaCBpdFxuICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIG5nLW9wdGlvbnMgLT4gd2F0Y2ggdGhlIG9wdGlvbnNcbiAgICAgIGlmIChhdHRycy5uZ09wdGlvbnMpIHtcbiAgICAgICAgLy8gd2F0Y2ggZm9yIG9wdGlvbiBjaGFuZ2VzXG4gICAgICAgIHdhdGNoQ29sbGVjdGlvbihnZXRDb2xsZWN0aW9uTmFtZShhdHRycy5uZ09wdGlvbnMpKTtcbiAgICAgIH1cblxuICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gW10uc2xpY2UuY2FsbChlbGVtZW50LmZpbmQoJ29wdGlvbicpKTtcbiAgICAgICAgY29uc3Qgb3B0aW9uV2l0aE5nUmVwZWF0ID0gb3B0aW9ucy5maW5kKG4gPT4gbi5oYXNBdHRyaWJ1dGUoJ25nLXJlcGVhdCcpKTtcbiAgICAgICAgaWYgKG9wdGlvbldpdGhOZ1JlcGVhdCkge1xuICAgICAgICAgIC8vIC8vIG5nLXJlcGVhdCAtPiB3YXRjaCBmb3IgY29sbGVjdGlvbiBjaGFuZ2VzXG4gICAgICAgICAgd2F0Y2hDb2xsZWN0aW9uKGdldENvbGxlY3Rpb25OYW1lKG9wdGlvbldpdGhOZ1JlcGVhdC5nZXRBdHRyaWJ1dGUoJ25nLXJlcGVhdCcpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gc3RhdGljIG9wdGlvbnMgLT4gcmVuZGVyIHdpdGhvdXQgd2F0Y2hpbmdcbiAgICAgICAgICBpbml0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAobmdNb2RlbENvbnRyb2xsZXIpIHtcbiAgICAgICAgLy8gd2F0Y2ggbW9kZWwgY2hhbmdlcyBhbmQgc2V0IHRoZSBkcm9wZG93biB2YWx1ZSBpZiB0aGUgdmFsdWUgY2hhbmdlZFxuICAgICAgICBzY29wZS4kd2F0Y2goKCkgPT4gbmdNb2RlbENvbnRyb2xsZXIuJG1vZGVsVmFsdWUsIChuZXdWYWx1ZSkgPT4ge1xuICAgICAgICAgIGlmIChuZXdWYWx1ZSAmJiBjdHJsLnJlbmRlcmVkKSB7XG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkT3B0aW9uID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCdbc2VsZWN0ZWRdJyk7XG5cbiAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkT3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBnZXRFbGVtZW50SW5kZXgoc2VsZWN0ZWRPcHRpb24pO1xuICAgICAgICAgICAgICAgIGN0cmwuc2VsZWN0KGluZGV4KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICB9O1xufVxuXG5lYXN5RHJvcGRvd25EaXJlY3RpdmUuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcblxuZXhwb3J0IGRlZmF1bHQgZWFzeURyb3Bkb3duRGlyZWN0aXZlO1xuXG4iLCJpbXBvcnQgYW5ndWxhciBmcm9tICdhbmd1bGFyJztcblxuaW1wb3J0IGVhc3lEcm9wZG93bkNvbnRyb2xsZXIgZnJvbSAnLi9lYXN5LWRyb3Bkb3duLWNvbnRyb2xsZXInO1xuaW1wb3J0IGVhc3lEcm9wZG93bkRpcmVjdGl2ZSBmcm9tICcuL2Vhc3ktZHJvcGRvd24tZGlyZWN0aXZlJztcblxuYW5ndWxhci5tb2R1bGUoJ25nLWVhc3ktZHJvcGRvd24nLCBbXSlcbiAgICAuZGlyZWN0aXZlKCdlYXN5RHJvcGRvd24nLCBlYXN5RHJvcGRvd25EaXJlY3RpdmUpXG4gICAgLmNvbnRyb2xsZXIoJ2Vhc3lEcm9wZG93bkNvbnRyb2xsZXInLCBlYXN5RHJvcGRvd25Db250cm9sbGVyKTtcblxuIl0sIm5hbWVzIjpbIkVsZW1lbnQiLCJwcm90b3R5cGUiLCJtYXRjaGVzIiwibWF0Y2hlc1NlbGVjdG9yIiwibW96TWF0Y2hlc1NlbGVjdG9yIiwibXNNYXRjaGVzU2VsZWN0b3IiLCJvTWF0Y2hlc1NlbGVjdG9yIiwid2Via2l0TWF0Y2hlc1NlbGVjdG9yIiwibWF0Y2hlc1BvbHlmaWxsIiwicyIsImRvY3VtZW50Iiwib3duZXJEb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJpIiwibGVuZ3RoIiwiaXRlbSIsIndpbmRvdyIsImNsb3Nlc3QiLCJlbCIsInBhcmVudEVsZW1lbnQiLCJhcnIiLCJmb3JFYWNoIiwiaGFzT3duUHJvcGVydHkiLCJkZWZpbmVQcm9wZXJ0eSIsInByZXZpb3VzU2libGluZyIsIm5vZGVUeXBlIiwidW5kZWZpbmVkIiwiQ2hhcmFjdGVyRGF0YSIsIkFycmF5IiwiZmluZCIsInByZWRpY2F0ZSIsIlR5cGVFcnJvciIsImxpc3QiLCJPYmplY3QiLCJ0aGlzQXJnIiwiYXJndW1lbnRzIiwidmFsdWUiLCJjYWxsIiwiZ2V0RWxlbWVudEluZGV4Iiwibm9kZSIsImluZGV4IiwiY3VycmVudE5vZGUiLCJwcmV2aW91c0VsZW1lbnRTaWJsaW5nIiwic2libGluZ3MiLCJmaWx0ZXIiLCJwYXJlbnROb2RlIiwiY2hpbGRyZW4iLCJjaGlsZCIsInVud3JhcCIsInBhcmVudCIsImdyYW5kUGFyZW50IiwiaW5zZXJ0QmVmb3JlIiwicmVtb3ZlQ2hpbGQiLCJjbG9zZUFsbEV2ZW50IiwiJCIsImFuZ3VsYXIiLCJlbGVtZW50IiwiRWFzeURyb3Bkb3duQ29udHJvbGxlciIsIiR3aW5kb3ciLCIkcm9vdFNjb3BlIiwiJHRpbWVvdXQiLCJpc0ZpZWxkIiwiZG93biIsImluRm9jdXMiLCJkaXNhYmxlZCIsImN1dE9mZiIsImhhc0xhYmVsIiwia2V5Ym9hcmRNb2RlIiwibmF0aXZlVG91Y2giLCJ3cmFwcGVyQ2xhc3MiLCJvbkNoYW5nZSIsImluc3RhbmNlcyIsInNlbGVjdEVsZW1lbnQiLCJzZXR0aW5ncyIsImV4dGVuZCIsIiRzZWxlY3QiLCJvcHRpb25zIiwiJG9wdGlvbnMiLCJpc1RvdWNoIiwicmVtb3ZlQ2xhc3MiLCJvIiwib3B0aW9uIiwic2VsZWN0ZWQiLCJpbm5lclRleHQiLCJmb2N1c0luZGV4IiwibGFiZWwiLCJzZXRBdHRyaWJ1dGUiLCJwdXNoIiwiZXEiLCJ0ZXh0IiwicmVuZGVyIiwiJG9uIiwiY2xvc2UiLCJ0b3VjaENsYXNzIiwiZGlzYWJsZWRDbGFzcyIsIiRjb250YWluZXIiLCJ3cmFwIiwiJGFjdGl2ZSIsInRpdGxlIiwiYXBwZW5kIiwiJGNhcmF0IiwiJHNjcm9sbFdyYXBwZXIiLCIkZHJvcERvd24iLCIkZm9ybSIsImFjdGl2ZSIsIiRpdGVtcyIsImFkZENsYXNzIiwiZ2V0TWF4SGVpZ2h0IiwiYmluZFRvdWNoSGFuZGxlcnMiLCJiaW5kSGFuZGxlcnMiLCJyZW5kZXJlZCIsIm1heEhlaWdodCIsIiRpdGVtIiwib2Zmc2V0SGVpZ2h0Iiwib24iLCJmb2N1cyIsImUiLCJ0YXJnZXQiLCJzZWxmIiwicXVlcnkiLCJvcGVuIiwic3RvcFByb3BhZ2F0aW9uIiwiYm9keSIsImNsYXNzTmFtZXMiLCJzcGxpdCIsImpvaW4iLCJzZWxlY3QiLCIkdCIsImtleSIsImtleUNvZGUiLCJ3YXNEb3duIiwicHJldmVudERlZmF1bHQiLCJzY3JvbGxUb1ZpZXciLCJzaGlmdCIsInNsaWNlIiwic2VhcmNoIiwiY2FuY2VsIiwicmVzZXRRdWVyeSIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsInRvTG93ZXJDYXNlIiwic2Nyb2xsVG9wIiwic2Nyb2xsSGVpZ2h0Iiwib2ZmIiwic2Nyb2xsWSIsImRvY3VtZW50RWxlbWVudCIsInNjcm9sbExlZnQiLCJzY3JvbGxYIiwic2Nyb2xsT2Zmc2V0Iiwibm90SW5WaWV3cG9ydCIsImNsb3NlQWxsIiwic2Nyb2xsVG8iLCJjc3MiLCIkZW1pdCIsInNlbGVjdEluZGV4IiwicmVtb3ZlQXR0ciIsInByb3AiLCJ0cmlnZ2VySGFuZGxlciIsImdldFRpdGxlIiwiZm91bmRJbmRleCIsInRpdGxlTG93ZXJjYXNlIiwiaW5kZXhPZiIsIiRmb2N1c0l0ZW0iLCJyYW5nZSIsImlubmVySGVpZ2h0IiwiY2xpZW50SGVpZ2h0IiwibWVudUJvdHRvbSIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInRvcCIsIm1pbiIsIm1heCIsInVuYmluZEhhbmRsZXJzIiwicmVtb3ZlIiwiYXR0ciIsIiRpbmplY3QiLCJnZXRDb2xsZWN0aW9uTmFtZSIsImNvbXByZWhlbnNpb25TdHJpbmciLCJyZXBsYWNlIiwiZWFzeURyb3Bkb3duRGlyZWN0aXZlIiwic2NvcGUiLCJhdHRycyIsImN0cmwiLCJuZ01vZGVsQ29udHJvbGxlciIsImluaXQiLCJ3YXRjaENvbGxlY3Rpb24iLCJjb2xsZWN0aW9uIiwibWF0Y2giLCIkd2F0Y2hDb2xsZWN0aW9uIiwiJHBhcmVudCIsImRlc3Ryb3kiLCJuZ09wdGlvbnMiLCJvcHRpb25XaXRoTmdSZXBlYXQiLCJuIiwiaGFzQXR0cmlidXRlIiwiZ2V0QXR0cmlidXRlIiwiJHdhdGNoIiwiJG1vZGVsVmFsdWUiLCJuZXdWYWx1ZSIsInNlbGVjdGVkT3B0aW9uIiwicXVlcnlTZWxlY3RvciIsIm1vZHVsZSIsImRpcmVjdGl2ZSIsImNvbnRyb2xsZXIiLCJlYXN5RHJvcGRvd25Db250cm9sbGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7QUFHQSxJQUFJLENBQUNBLFFBQVFDLFNBQVIsQ0FBa0JDLE9BQXZCLEVBQWdDO1VBQ3RCRCxTQUFSLENBQWtCQyxPQUFsQixHQUNFRixRQUFRQyxTQUFSLENBQWtCRSxlQUFsQixJQUNBSCxRQUFRQyxTQUFSLENBQWtCRyxrQkFEbEIsSUFFQUosUUFBUUMsU0FBUixDQUFrQkksaUJBRmxCLElBR0FMLFFBQVFDLFNBQVIsQ0FBa0JLLGdCQUhsQixJQUlBTixRQUFRQyxTQUFSLENBQWtCTSxxQkFKbEIsSUFLQSxTQUFTQyxlQUFULENBQXlCQyxDQUF6QixFQUE0QjtRQUNwQlAsVUFBVSxDQUFDLEtBQUtRLFFBQUwsSUFBaUIsS0FBS0MsYUFBdkIsRUFBc0NDLGdCQUF0QyxDQUF1REgsQ0FBdkQsQ0FBaEI7U0FDSyxJQUFJSSxJQUFJWCxRQUFRWSxNQUFSLEdBQWlCLENBQTlCLEVBQWlDRCxLQUFLLENBQXRDLEVBQXlDQSxLQUFLLENBQTlDLEVBQWlEO1VBQzNDWCxRQUFRYSxJQUFSLENBQWFGLENBQWIsTUFBb0IsSUFBeEIsRUFBOEI7ZUFDckIsSUFBUDs7O1dBR0csS0FBUDtHQWJKOzs7O0FBa0JGLElBQUlHLE9BQU9oQixPQUFQLElBQWtCLENBQUNBLFFBQVFDLFNBQVIsQ0FBa0JnQixPQUF6QyxFQUFrRDtVQUN4Q2hCLFNBQVIsQ0FBa0JnQixPQUFsQixHQUNFLFVBQVNSLENBQVQsRUFBWTtRQUNOUCxVQUFVLENBQUMsS0FBS1EsUUFBTCxJQUFpQixLQUFLQyxhQUF2QixFQUFzQ0MsZ0JBQXRD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
