/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-recipe
 * Base block: hero
 * Source: https://www.unileverfoodsolutions.nl/recept/griekse-puntpaprika-salade-R0072510.html
 * Selector: .page-header_recipe .recipe-detailv3__recipe
 * Generated: 2026-06-09
 *
 * Extracts recipe hero image and heading from the recipe detail header.
 * Source structure:
 *   - .recipe-detailv3__box-one > .recipe-description contains h1 heading
 *   - .recipe-detailv3__box-two contains recipe image in .recipe-image-v2 picture/img
 * Target structure (from library example):
 *   Row 1: Hero image
 *   Row 2: Heading (h1)
 *   Row 3: Description text (optional - may not exist in source)
 *   Row 4: CTA button (optional - may not exist in source)
 */
export default function parse(element, { document }) {
  // Extract hero image from the video/image container
  const heroImage = element.querySelector(
    '.recipe-image-v2 img, .recipe-detailv3__video-fallback-img img, .recipe-detailv3__box-two img'
  );

  // Extract heading from the recipe description area
  const heading = element.querySelector(
    '.recipe-description h1, .recipe-detailv3__description h1, h1'
  );

  // Extract optional description text (paragraph below heading, not UI elements)
  const description = element.querySelector(
    '.recipe-description > p, .recipe-detailv3__description > p, .recipe-description .recipe-desc'
  );

  // Extract optional CTA links (excluding rating/review widget links)
  const ctaLinks = Array.from(
    element.querySelectorAll('.recipe-description a.btn, .recipe-description a.button, .recipe-detailv3__description a.cta')
  );

  // Build cells array matching library example structure
  const cells = [];

  // Row 1: Hero image
  if (heroImage) {
    cells.push([heroImage]);
  }

  // Row 2+: Content cell with heading, description, and CTAs
  const contentCell = [];
  if (heading) {
    contentCell.push(heading);
  }
  if (description) {
    contentCell.push(description);
  }
  if (ctaLinks.length > 0) {
    contentCell.push(...ctaLinks);
  }

  if (contentCell.length > 0) {
    cells.push(contentCell);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-recipe', cells });
  element.replaceWith(block);
}
