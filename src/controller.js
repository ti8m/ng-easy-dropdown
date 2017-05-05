

import angular from 'angular';

class EasyDropdownController {

  constructor($document) {
    this.$document = $document;

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
    const self = this;

    $.extend(self, settings);
    self.$select = $(domNode);
    self.id = domNode.id;
    self.options = [];
    self.$options = self.$select.find('option');
    self.isTouch = 'ontouchend' in document;
    self.$select.removeClass(`${self.wrapperClass} dropdown`);
    if (self.$select.is(':disabled')) {
      self.disabled = true;
    }
    if (self.$options.length) {
      self.$options.each(function (i) {
        const $option = $(this);
        if ($option.is(':selected')) {
          self.selected = {
            index: i,
            title: $option.text(),
          };
          self.focusIndex = i;
        }

        if ($option.hasClass('label') && i == 0) {
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
      if (!self.selected) {
        self.selected = {
          index: 0,
          title: self.$options.eq(0).text(),
        };
        self.focusIndex = 0;
      }

      self.render();
    }
  }

  render() {
    let self = this,
      touchClass = self.isTouch && self.nativeTouch ? ' touch' : '',
      disabledClass = self.disabled ? ' disabled' : '';

    self.$container = self.$select.wrap(`<div class="${self.wrapperClass}${touchClass}${disabledClass}"><span class="old"/></div>`).parent().parent();
    self.$active = $(`<span class="selected">${self.selected.title}</span>`).appendTo(self.$container);
    self.$carat = $('<span class="carat"/>').appendTo(self.$container);
    self.$scrollWrapper = $('<div><ul/></div>').appendTo(self.$container);
    self.$dropDown = self.$scrollWrapper.find('ul');
    self.$form = self.$container.closest('form');
    $.each(self.options, function () {
      let option = this,
        active = option.selected ? ' class="active"' : '';
      self.$dropDown.append(`<li${active}>${option.title}</li>`);
    });
    self.$items = self.$dropDown.find('li');

    if (self.cutOff && self.$items.length > self.cutOff) self.$container.addClass('scrollable');

    self.getMaxHeight();

    if (self.isTouch && self.nativeTouch) {
      self.bindTouchHandlers();
    } else {
      self.bindHandlers();
    }
  }

  getMaxHeight() {
    const self = this;

    self.maxHeight = 0;

    for (let i = 0; i < self.$items.length; i++) {
      this.i = i;
      const $item = self.$items.eq(i);
      self.maxHeight += $item.outerHeight();
      if (self.cutOff == i + 1) {
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
        let $selected = $(this).find('option:selected'),
          title = $selected.text(),
          value = $selected.val();

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
      let $target = $(e.target),
        classNames = self.wrapperClass.split(' ').join('.');

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
      'focus.easyDropDown': function () {
        self.$container.addClass('focus');
        self.inFocus = true;
      },
      'blur.easyDropDown': function () {
        self.$container.removeClass('focus');
        self.inFocus = false;
      },
      'keydown.easyDropDown': function (e) {
        if (self.inFocus) {
          self.keyboardMode = true;
          const key = e.keyCode;

          if (key == 38 || key == 40 || key == 32) {
            e.preventDefault();
            if (key == 38) {
              self.focusIndex--;
              self.focusIndex = self.focusIndex < 0 ? self.$items.length - 1 : self.focusIndex;
            } else if (key == 40) {
              self.focusIndex++;
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
            if (key == 9 || key == 27) {
              self.close();
            } else if (key == 13) {
              e.preventDefault();
              self.select(self.focusIndex);
              self.close();
              return false;
            } else if (key == 8) {
              e.preventDefault();
              self.query = self.query.slice(0, -1);
              self.search();
              clearTimeout(self.resetQuery);
              return false;
            } else if (key != 38 && key != 40) {
              const letter = String.fromCharCode(key);
              self.query += letter;
              self.search();
              clearTimeout(self.resetQuery);
            }
          }
        }
      },
      'keyup.easyDropDown': function () {
        self.resetQuery = setTimeout(() => {
          self.query = '';
        }, 1200);
      },
    });

    self.$dropDown.on('scroll.easyDropDown', (e) => {
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
    let self = this,
      scrollTop = window.scrollY || document.documentElement.scrollTop,
      scrollLeft = window.scrollX || document.documentElement.scrollLeft,
      scrollOffset = self.notInViewport(scrollTop);

    self.closeAll();
    self.getMaxHeight();
    self.$select.focus();
    window.scrollTo(scrollLeft, scrollTop + scrollOffset);
    self.$container.addClass('open');
    self.$scrollWrapper.css('height', `${self.maxHeight}px`);
    self.down = true;
  }

  close() {
    const self = this;
    self.$container.removeClass('open');
    self.$scrollWrapper.css('height', '0px');
    self.focusIndex = self.selected.index;
    self.query = '';
    self.down = false;
  }

  closeAll() {
    let self = this,
      instances = Object.getPrototypeOf(self).instances;
    for (const key in instances) {
      const instance = instances[key];
      instance.close();
    }
  }

  select(index) {
    const self = this;

    if (typeof index === 'string') {
      index = self.$select.find(`option[value=${index}]`).index() - 1;
    }


    let option = self.options[index],
      selectIndex = self.hasLabel ? index + 1 : index;
    self.$items.removeClass('active').eq(index).addClass('active');
    self.$active.text(option.title);
    self.$select
            .find('option')
            .removeAttr('selected')
            .eq(selectIndex)
            .prop('selected', true)
            .parent()
            .trigger('change');

    self.selected = {
      index,
      title: option.title,
    };
    self.focusIndex = this.i;
    if (typeof self.onChange === 'function') {
      self.onChange.call(self.$select[0], {
        title: option.title,
        value: option.value,
      });
    }
  }

  search() {
    let self = this,
      lock = function (i) {
        self.focusIndex = i;
        self.$items.removeClass('focus').eq(self.focusIndex).addClass('focus');
        self.scrollToView();
      },
      getTitle = function (i) {
        return self.options[i].title.toUpperCase();
      };

    for (i = 0; i < self.options.length; i++) {
      var title = getTitle(i);
      if (title.indexOf(self.query) == 0) {
        lock(i);
        return;
      }
    }


    for (var i = 0; i < self.options.length; i++) {
      this.i = i;
      var title = getTitle(i);
      if (title.indexOf(self.query) > -1) {
        lock(i);
        break;
      }
    }
  }

  scrollToView() {
    const self = this;
    if (self.focusIndex >= self.cutOff) {
      let $focusItem = self.$items.eq(self.focusIndex),
        scroll = ($focusItem.outerHeight() * (self.focusIndex + 1)) - self.maxHeight;

      self.$dropDown.scrollTop(scroll);
    }
  }

  notInViewport(scrollTop) {
    let self = this,
      range = {
        min: scrollTop,
        max: scrollTop + (window.innerHeight || document.documentElement.clientHeight),
      },
      menuBottom = self.$dropDown.offset().top + self.maxHeight;

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
    const self = this;
    self.disabled = true;
    self.$container.addClass('disabled');
    self.$select.attr('disabled', true);
    if (!self.down) self.close();
  }

  enable() {
    const self = this;
    self.disabled = false;
    self.$container.removeClass('disabled');
    self.$select.attr('disabled', false);
  }

}

EasyDropdownController.$inject = ['$document'];

export default EasyDropdownController;
