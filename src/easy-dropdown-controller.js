import angular from 'angular';
import $ from 'jquery';

const closeAllEvent = 'easyDropdown:closeAll';

class EasyDropdownController {

  constructor($window, $rootScope) {
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

  init(domNode, settings) {
    // const self = this;

    angular.extend(this, settings);
    this.$select = $(domNode);
    this.id = domNode.id;
    this.options = [];
    this.$options = this.$select.find('option');
    this.isTouch = 'ontouchend' in this.$window.document;
    this.$select.removeClass(`${this.wrapperClass} dropdown`);
    if (this.$select.is(':disabled')) {
      this.disabled = true;
    }
    if (this.$options.length) {
      const self = this;
      this.$options.each(function (i) {
        const $option = $(this);
        if ($option.is(':selected')) {
          self.selected = {
            index: i,
            title: $option.text(),
          };
          self.focusIndex = i;
        }

        if ($option.hasClass('label') && i === 0) {
          self.hasLabel = true;
          self.label = $option.text();
          $option.attr('value', '');
        } else {
          self.options.push({
            domNode: $option[0],
            title: $option.text(),
            value: $option.val(),
            selected: $option.is(':selected'),
          });
        }
      });
      if (!this.selected) {
        this.selected = {
          index: 0,
          title: this.$options.eq(0).text(),
        };
        this.focusIndex = 0;
      }

      this.render();
    }

    // register event handlers
    this.$rootScope.$on(closeAllEvent, ::this.close);
  }

  render() {
    const touchClass = this.isTouch && this.nativeTouch ? ' touch' : '';
    const disabledClass = this.disabled ? ' disabled' : '';

    this.$container = this.$select.wrap(`<div class="${this.wrapperClass}${touchClass}${disabledClass}"><span class="old"/></div>`).parent().parent();
    this.$active = $(`<span class="selected">${this.selected.title}</span>`).appendTo(this.$container);
    this.$carat = $('<span class="carat"/>').appendTo(this.$container);
    this.$scrollWrapper = $('<div><ul/></div>').appendTo(this.$container);
    this.$dropDown = this.$scrollWrapper.find('ul');
    this.$form = this.$container.closest('form');
    const self = this;
    $.each(this.options, function () {
      const option = this;
      const active = option.selected ? ' class="active"' : '';
      self.$dropDown.append(`<li${active}>${option.title}</li>`);
    });
    this.$items = this.$dropDown.find('li');

    if (this.cutOff && this.$items.length > this.cutOff) this.$container.addClass('scrollable');

    this.getMaxHeight();

    if (this.isTouch && this.nativeTouch) {
      this.bindTouchHandlers();
    } else {
      this.bindHandlers();
    }
  }

  getMaxHeight() {
    const self = this;

    self.maxHeight = 0;

    for (let i = 0; i < self.$items.length; i += 1) {
      this.i = i;
      const $item = self.$items.eq(i);
      self.maxHeight += $item.outerHeight();
      if (self.cutOff === i + 1) {
        break;
      }
    }
  }

  bindTouchHandlers() {
    const self = this;
    self.$container.on('click.easyDropDown', () => {
      self.$select.focus();
    });
    self.$select.on({
      change() {
        const $selected = $(this).find('option:selected');
        const title = $selected.text();
        const value = $selected.val();

        self.$active.text(title);
        if (typeof self.onChange === 'function') {
          self.onChange.call(self.$select[0], {
            title,
            value,
          });
        }
      },
      focus() {
        self.$container.addClass('focus');
      },
      blur() {
        self.$container.removeClass('focus');
      },
    });
  }

  bindHandlers() {
    const self = this;
    self.query = '';
    self.$container.on({
      'click.easyDropDown': function () {
        if (!self.down && !self.disabled) {
          self.open();
        } else {
          self.close();
        }
      },
      'mousemove.easyDropDown': function () {
        if (self.keyboardMode) {
          self.keyboardMode = false;
        }
      },
    });

    $('body').on(`click.easyDropDown.${self.id}`, (e) => {
      const $target = $(e.target);
      const classNames = self.wrapperClass.split(' ').join('.');

      if (!$target.closest(`.${classNames}`).length && self.down) {
        self.close();
      }
    });

    self.$items.on({
      'click.easyDropDown': function () {
        const index = $(this).index();
        self.select(index);
        self.$select.focus();
      },
      'mouseover.easyDropDown': function () {
        if (!self.keyboardMode) {
          const $t = $(this);
          $t.addClass('focus').siblings().removeClass('focus');
          self.focusIndex = $t.index();
        }
      },
      'mouseout.easyDropDown': function () {
        if (!self.keyboardMode) {
          $(this).removeClass('focus');
        }
      },
    });

    self.$select.on({
      'focus.easyDropDown': function focus() {
        self.$container.addClass('focus');
        self.inFocus = true;
      },
      'blur.easyDropDown': function blur() {
        self.$container.removeClass('focus');
        self.inFocus = false;
      },
      'keydown.easyDropDown': function keydown(e) {
        if (self.inFocus) {
          self.keyboardMode = true;
          const key = e.keyCode;

          if (key === 38 || key === 40 || key === 32) {
            e.preventDefault();
            if (key === 38) {
              self.focusIndex -= 1;
              self.focusIndex = self.focusIndex < 0 ? self.$items.length - 1 : self.focusIndex;
            } else if (key === 40) {
              self.focusIndex += 1;
              self.focusIndex = self.focusIndex > self.$items.length - 1 ? 0 : self.focusIndex;
            }

            if (!self.down) {
              self.open();
            }

            self.$items.removeClass('focus').eq(self.focusIndex).addClass('focus');
            if (self.cutOff) {
              self.scrollToView();
            }

            self.query = '';
          }

          if (self.down) {
            if (key === 9 || key === 27) {
              self.close();
            } else if (key === 13) {
              e.preventDefault();
              self.select(self.focusIndex);
              self.close();
              return false;
            } else if (key === 8) {
              e.preventDefault();
              self.query = self.query.slice(0, -1);
              self.search();
              clearTimeout(self.resetQuery);
              return false;
            } else if (key !== 38 && key !== 40) {
              const letter = String.fromCharCode(key);
              self.query += letter;
              self.search();
              clearTimeout(self.resetQuery);
            }
          }
        }
        return false;
      },
      'keyup.easyDropDown': function () {
        self.resetQuery = setTimeout(() => {
          self.query = '';
        }, 1200);
      },
    });

    self.$dropDown.on('scroll.easyDropDown', () => {
      if (self.$dropDown[0].scrollTop >= self.$dropDown[0].scrollHeight - self.maxHeight) {
        self.$container.addClass('bottom');
      } else {
        self.$container.removeClass('bottom');
      }
    });

    if (self.$form.length) {
      self.$form.on('reset.easyDropDown', () => {
        const active = self.hasLabel ? self.label : self.options[0].title;
        self.$active.text(active);
      });
    }
  }

  unbindHandlers() {
    const self = this;

    self.$container
      .add(self.$select)
      .add(self.$items)
      .add(self.$form)
      .add(self.$dropDown)
      .off('.easyDropDown');
    $('body').off(`.${self.id}`);
  }

  open() {
    const scrollTop = this.$window.scrollY || this.$window.document.documentElement.scrollTop;
    const scrollLeft = this.$window.scrollX || this.$window.document.documentElement.scrollLeft;
    const scrollOffset = this.notInViewport(scrollTop);

    this.closeAll();
    this.getMaxHeight();
    this.$select.focus();
    this.$window.scrollTo(scrollLeft, scrollTop + scrollOffset);
    this.$container.addClass('open');
    this.$scrollWrapper.css('height', `${this.maxHeight}px`);
    this.down = true;
  }

  close() {
    this.$container.removeClass('open');
    this.$scrollWrapper.css('height', '0px');
    this.focusIndex = this.selected.index;
    this.query = '';
    this.down = false;
  }

  closeAll() {
    this.$rootScope.$emit(closeAllEvent);
  }

  select(i) {
    let index;
    if (typeof i === 'string') {
      index = this.$select.find(`option[value=${index}]`).index() - 1;
    } else {
      index = i;
    }

    const option = this.options[index];
    const selectIndex = this.hasLabel ? index + 1 : index;
    this.$items.removeClass('active').eq(index).addClass('active');
    this.$active.text(option.title);
    this.$select
      .find('option')
      .removeAttr('selected')
      .eq(selectIndex)
      .prop('selected', true)
      .parent()
      .trigger('change');

    this.selected = {
      index,
      title: option.title,
    };
    this.focusIndex = this.i;
    if (typeof this.onChange === 'function') {
      this.onChange.call(this.$select[0], {
        title: option.title,
        value: option.value,
      });
    }
  }

  search() {
    const lock = (i) => {
      this.focusIndex = i;
      this.$items.removeClass('focus').eq(this.focusIndex).addClass('focus');
      this.scrollToView();
    };

    const getTitle = i => this.options[i].title.toUpperCase();

    for (let i = 0; i < this.options.length; i += 1) {
      this.i = i;
      const title = getTitle(i);
      if (title.indexOf(this.query) === 0) {
        lock(i);
        return;
      }
    }


    for (let i = 0; i < this.options.length; i += 1) {
      this.i = i;
      const title = getTitle(i);
      if (title.indexOf(this.query) > -1) {
        lock(i);
        break;
      }
    }
  }

  scrollToView() {
    if (this.focusIndex >= this.cutOff) {
      const $focusItem = this.$items.eq(this.focusIndex);
      const scroll = ($focusItem.outerHeight() * (this.focusIndex + 1)) - this.maxHeight;

      this.$dropDown.scrollTop(scroll);
    }
  }

  notInViewport(scrollTop) {
    const range = {
      min: scrollTop,
      max: scrollTop + (this.$window.innerHeight ||
        this.$window.document.documentElement.clientHeight),
    };
    const menuBottom = this.$dropDown.offset().top + this.maxHeight;

    if (menuBottom >= range.min && menuBottom <= range.max) {
      return 0;
    }
    return (menuBottom - range.max) + 5;
  }

  destroy() {
    const self = this;
    self.unbindHandlers();
    self.$select.unwrap().siblings().remove();
    self.$select.unwrap();
    delete Object.getPrototypeOf(self).instances[self.$select[0].id];
  }

  disable() {
    this.disabled = true;
    this.$container.addClass('disabled');
    this.$select.attr('disabled', true);
    if (!this.down) this.close();
  }

  enable() {
    const self = this;
    self.disabled = false;
    self.$container.removeClass('disabled');
    self.$select.attr('disabled', false);
  }

}

EasyDropdownController.$inject = ['$window', '$rootScope'];

export default EasyDropdownController;
