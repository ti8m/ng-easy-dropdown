/* eslint-disable */

// matches polyfill
if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.matchesSelector ||
    Element.prototype.mozMatchesSelector ||
    Element.prototype.msMatchesSelector ||
    Element.prototype.oMatchesSelector ||
    Element.prototype.webkitMatchesSelector ||
    function matchesPolyfill(s) {
      const matches = (this.document || this.ownerDocument).querySelectorAll(s);
      for (let i = matches.length - 1; i >= 0; i -= 1) {
        if (matches.item(i) === this) {
          return true;
        }
      }
      return false;
    };
}

// closest polyfill
if (window.Element && !Element.prototype.closest) {
  Element.prototype.closest =
    function(s) {
      let matches = (this.document || this.ownerDocument).querySelectorAll(s),
        i,
        el = this;
      do {
        i = matches.length;
        while (--i >= 0 && matches.item(i) !== el) {}
      } while ((i < 0) && (el = el.parentElement));
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
      get: function () {
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

export default null;
