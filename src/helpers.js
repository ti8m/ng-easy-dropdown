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
