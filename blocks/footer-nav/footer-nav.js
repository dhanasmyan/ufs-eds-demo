/**
 * Footer Nav Block
 * Renders the multi-column footer navigation grid.
 * Expected structure: one row with N column divs (brand + nav link groups).
 * @param {Element} block The footer-nav block element
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;

  const cols = [...row.children];
  block.classList.add(`footer-nav-${cols.length}-cols`);
}
