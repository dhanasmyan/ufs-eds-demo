/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-recipe
 * Base block: carousel
 * Source: https://www.unileverfoodsolutions.nl/recept/griekse-puntpaprika-salade-R0072510.html
 * Selector: .toprecipes .featured-item-slider
 * Generated: 2026-06-09
 *
 * Extracts carousel slides from the "Misschien ook interessant" (related recipes) section.
 * Items are dynamically loaded via JS into .featured-item-slider__list.
 * Each slide contains a recipe card with image, title, and link.
 * Falls back to extracting the heading and CTA if items are not rendered.
 */
export default function parse(element, { document }) {
  // Extract heading
  const heading = element.querySelector('h2.featured-item-slider__title, h2');

  // Extract carousel items from the dynamically-populated list
  // Items are loaded by JS into .featured-item-slider__list / .js-swipecarousel
  const itemContainer = element.querySelector('.featured-item-slider__list, .js-swipecarousel');
  const items = itemContainer
    ? Array.from(itemContainer.querySelectorAll('a[href], .item, .slide, [class*="card"], [class*="tile"]'))
    : [];

  // Extract CTA link (e.g., "Alle recepten")
  const ctaLink = element.querySelector('.button-wrapper a, a.button');

  const cells = [];

  if (items.length > 0) {
    // Build rows from carousel items: each row = [image, content with title + link]
    items.forEach((item) => {
      const img = item.querySelector('img');
      const title = item.querySelector('h3, h4, .title, [class*="title"], strong');
      const desc = item.querySelector('p, .description, [class*="desc"]');
      const link = item.tagName === 'A' ? item : item.querySelector('a[href]');

      const imageCell = img || document.createTextNode('');
      const contentCell = [];

      if (title) contentCell.push(title);
      if (desc) contentCell.push(desc);
      if (link && link !== item) contentCell.push(link);
      if (link && link === item) {
        // The item itself is the link - create a reference
        const linkEl = document.createElement('a');
        linkEl.href = link.href;
        linkEl.textContent = link.textContent.trim() || (title ? title.textContent.trim() : '');
        contentCell.push(linkEl);
      }

      // Only add row if there is meaningful content
      if (img || title || link) {
        cells.push([imageCell, contentCell.length > 0 ? contentCell : document.createTextNode('')]);
      }
    });
  }

  // Fallback: if no items were rendered, create a single row with heading and CTA
  if (cells.length === 0) {
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (ctaLink) contentCell.push(ctaLink);
    if (contentCell.length > 0) {
      cells.push([contentCell]);
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-recipe', cells });
  element.replaceWith(block);
}
