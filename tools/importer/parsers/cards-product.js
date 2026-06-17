/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-product variant.
 * Base block: cards
 * Source: https://www.unileverfoodsolutions.nl/recept/griekse-puntpaprika-salade-R0072510.html
 * Selector: .recipeproduct-tile
 * Generated: 2026-06-09
 *
 * Extracts product card content (image, title, link) from recipe product tiles
 * and produces a Cards block table with image in first cell and title+link in second cell.
 */
export default function parse(element, { document }) {
  // Extract product image from the product tile image area
  const image = element.querySelector('.recipeproduct__image img, .product-tile-row img');

  // Extract product title and link
  const titleLink = element.querySelector('span.product-title a, a.js-recipe-rdp-image');
  const productLink = element.querySelector('a.js-product-click, a.js-recipe-rdp-image');

  // Build the content cell: title as bold text + link
  const contentCell = [];

  if (titleLink) {
    // Create a strong element wrapping the product title text
    const strong = document.createElement('strong');
    strong.textContent = titleLink.textContent.trim();
    contentCell.push(strong);

    // Create a link to the product page
    if (productLink && productLink.getAttribute('href')) {
      const link = document.createElement('a');
      link.href = productLink.getAttribute('href');
      link.textContent = titleLink.textContent.trim();
      contentCell.push(link);
    }
  }

  // Build cells to match library example: [image] | [title + link]
  const cells = [];

  if (image && contentCell.length > 0) {
    cells.push([image, contentCell]);
  } else if (image) {
    cells.push([image]);
  } else if (contentCell.length > 0) {
    cells.push([contentCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
