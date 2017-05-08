export function getElementIndex(node) {
  let index = 0;
  let currentNode = node;
  while (currentNode.previousElementSibling) {
    index += 1;
    currentNode = currentNode.previousElementSibling;
  }
  return index;
}

export function siblings(el) {
  return Array.prototype.filter.call(el.parentNode.children, child => child !== el);
}

export function unwrap(el) {
  // get the element's parent node
  const parent = el.parentNode;
  const grandParent = el.parentNode.parentNode;

  // move all children out of the element
  grandParent.insertBefore(el, parent);

  // remove the empty element
  grandParent.removeChild(parent);

  return el;
}
