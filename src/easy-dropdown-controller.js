import angular from 'angular';
// import $ from 'jquery';
import './polyfills';
import { getElementIndex, siblings } from './helpers';

const closeAllEvent = 'easyDropdown:closeAll';
const $ = angular.element;

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

  init(selectElement, settings) {
    angular.extend(this, settings);
    this.$select = selectElement;
    this.options = [];
    this.$options = this.$select.find('option');
    this.isTouch = 'ontouchend' in this.$window.document;
    this.$select.removeClass(`${this.wrapperClass} dropdown`);
    if (this.$select[0].matches(':disabled')) {
      this.disabled = true;
    }
    if (this.$options.length) {
      window.o = this.$options;
      angular.forEach(this.$options, (option, i) => {
        if (option.matches(':checked')) {
          this.selected = {
            index: i,
            title: option.innerText,
          };
          this.focusIndex = i;
        }

        if (option.matches('.label') && i === 0) {
          this.hasLabel = true;
          this.label = option.innerText;
          option.setAttribute('value', '');
        } else {
          this.options.push({
            domNode: option,
            title: option.innerText,
            value: option.value,
            selected: option.matches(':checked'),
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

    this.$container = this.$select
      .wrap(`<div class="${this.wrapperClass}${touchClass}${disabledClass}"></div>`)
      .wrap('<span class="old">')
      .parent()
      .parent();

    this.$active = $(`<span class="selected">${this.selected.title}</span>`);
    this.$container.append(this.$active);
    this.$carat = $('<span class="carat"/>');
    this.$container.append(this.$carat);
    this.$scrollWrapper = $('<div><ul/></div>');
    this.$container.append(this.$scrollWrapper);
    this.$dropDown = this.$scrollWrapper.find('ul');
    this.$form = $(this.$container[0].closest('form'));

    this.options.forEach((o) => {
      const active = o.selected ? ' class="active"' : '';
      this.$dropDown.append(`<li${active}>${o.title}</li>`);
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
      self.maxHeight += $item[0].offsetHeight;
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
    this.query = '';

    this.$container.on('click', (e) => {
      if (!this.down && !this.disabled) {
        this.open();
      } else {
        this.close();
      }
      e.stopPropagation();
    });

    this.$container.on('mousemove', () => {
      if (this.keyboardMode) {
        this.keyboardMode = false;
      }
    });

    $(this.$window.document.body).on('click', (e) => {
      const classNames = this.wrapperClass.split(' ').join('.');

      if (!e.target.closest(`.${classNames}`) && this.down) {
        this.close();
      }
    });

    this.$items.on('click', (e) => {
      const index = getElementIndex(e.target);
      this.select(index);
      this.$select[0].focus();
    });

    this.$items.on('mouseover', (e) => {
      if (!this.keyboardMode) {
        const $t = $(e.target);
        $t.addClass('focus');
        siblings($t[0]).forEach(s => $(s).removeClass('focus'));
        this.focusIndex = getElementIndex(e.target);
      }
    });

    this.$items.on('mouseout', (e) => {
      if (!this.keyboardMode) {
        $(e.target).removeClass('focus');
      }
    });

    this.$select.on('focus', () => {
      this.$container.addClass('focus');
      this.inFocus = true;
    });

    this.$select.on('blur', () => {
      this.$container.removeClass('focus');
      this.inFocus = false;
    });

    this.$select.on('keydown', (e) => {
      if (this.inFocus) {
        this.keyboardMode = true;
        const key = e.keyCode;

        if (key === 38 || key === 40 || key === 32) {
          e.preventDefault();
          if (key === 38) {
            this.focusIndex -= 1;
            this.focusIndex = this.focusIndex < 0 ? this.$items.length - 1 : this.focusIndex;
          } else if (key === 40) {
            this.focusIndex += 1;
            this.focusIndex = this.focusIndex > this.$items.length - 1 ? 0 : this.focusIndex;
          }

          if (!this.down) {
            this.open();
          }
          this.$items.removeClass('focus');
          this.$items[this.focusIndex].addClass('focus');

          if (this.cutOff) {
            this.scrollToView();
          }

          this.query = '';
        }

        if (this.down) {
          if (key === 9 || key === 27) {
            this.close();
          } else if (key === 13) {
            e.preventDefault();
            this.select(this.focusIndex);
            this.close();
            return false;
          } else if (key === 8) {
            e.preventDefault();
            this.query = this.query.slice(0, -1);
            this.search();
            clearTimeout(this.resetQuery);
            return false;
          } else if (key !== 38 && key !== 40) {
            const letter = String.fromCharCode(key);
            this.query += letter;
            this.search();
            clearTimeout(this.resetQuery);
          }
        }
      }
      return false;
    });

    this.$select.on('keyup', () => {
      this.resetQuery = setTimeout(() => {
        this.query = '';
      }, 1200);
    });

    this.$dropDown.on('scroll', () => {
      if (this.$dropDown[0].scrollTop >= this.$dropDown[0].scrollHeight - this.maxHeight) {
        this.$container.addClass('bottom');
      } else {
        this.$container.removeClass('bottom');
      }
    });

    if (this.$form.length) {
      this.$form.on('reset', () => {
        const active = this.hasLabel ? this.label : self.options[0].title;
        this.$active.text(active);
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
    this.$select[0].focus();
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

    const menuBottom = this.$dropDown[0].getBoundingClientRect().top +
      document.body.scrollTop + this.maxHeight;

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