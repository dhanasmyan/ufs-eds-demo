/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-recipe
 * Base block: columns
 * Source: https://www.unileverfoodsolutions.nl/recept/griekse-puntpaprika-salade-R0072510.html
 * Selector: .recipe-layout-wrapper#tab1-content
 * Generated: 2026-06-09
 *
 * Extracts ingredients (left column) and preparation steps (right column)
 * into a two-column Columns block layout.
 */
export default function parse(element, { document }) {
  // === LEFT COLUMN: Ingredients ===
  const ingredientsContainer = element.querySelector('#ingredients-content');
  const leftContent = [];

  if (ingredientsContainer) {
    // Add "Personen" heading for ingredients section
    const ingredientsHeading = ingredientsContainer.querySelector('h3.k-menu-item');
    if (ingredientsHeading) {
      const h3 = document.createElement('h3');
      h3.textContent = ingredientsHeading.textContent.trim();
      leftContent.push(h3);
    }

    // Extract ingredient groups: only h4 elements that are direct siblings of ul.ingredients
    // (avoids picking up h4s from the hidden cost calculator/lightbox sections)
    const ingredientLists = ingredientsContainer.querySelectorAll(':scope .content-section > ul.ingredients');

    ingredientLists.forEach((ul) => {
      // Get the preceding h4 sibling as the category heading
      let prevSibling = ul.previousElementSibling;
      while (prevSibling && prevSibling.tagName !== 'H4') {
        prevSibling = prevSibling.previousElementSibling;
      }
      if (prevSibling && prevSibling.tagName === 'H4' && prevSibling.textContent.trim()) {
        const h4 = document.createElement('h4');
        h4.textContent = prevSibling.textContent.trim();
        leftContent.push(h4);
      }

      // Build the ingredient list
      const newUl = document.createElement('ul');
      const items = ul.querySelectorAll('li .ingredient-row');
      items.forEach((row) => {
        const li = document.createElement('li');
        const nameSpan = row.querySelector(':scope > span:not(.amount)');
        const amountSpan = row.querySelector(':scope > span.amount, :scope > a span.amount');
        // Handle linked ingredients (e.g., UFS products)
        const linkedName = row.querySelector(':scope > a span:not(.amount)');
        const name = nameSpan ? nameSpan.textContent.trim() : (linkedName ? linkedName.textContent.trim() : '');
        const amount = amountSpan ? amountSpan.textContent.trim() : '';
        if (name) {
          li.textContent = amount ? `${name} - ${amount}` : name;
          newUl.appendChild(li);
        }
      });
      if (newUl.children.length > 0) {
        leftContent.push(newUl);
      }
    });
  }

  // === RIGHT COLUMN: Preparation steps ===
  const preparationContainer = element.querySelector('#preparation-content');
  const rightContent = [];

  if (preparationContainer) {
    // Extract recipe description
    const description = preparationContainer.querySelector('.desc-container .recipe-desc');
    if (description) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      rightContent.push(p);
    }

    // Extract preparation heading
    const prepHeading = preparationContainer.querySelector('.content-section h3');
    if (prepHeading) {
      const h3 = document.createElement('h3');
      h3.textContent = prepHeading.textContent.trim();
      rightContent.push(h3);
    }

    // Extract preparation steps (ordered list)
    const instructionsList = preparationContainer.querySelector('ol.instructions');
    if (instructionsList) {
      const ol = document.createElement('ol');
      const steps = instructionsList.querySelectorAll(':scope > li');
      steps.forEach((step) => {
        const li = document.createElement('li');
        // Get the step heading (h4) if present
        const stepHeading = step.querySelector('h4');
        if (stepHeading) {
          const strong = document.createElement('strong');
          strong.textContent = stepHeading.textContent.trim();
          li.appendChild(strong);
          li.appendChild(document.createTextNode(' '));
        }
        // Get the step text (everything after h4)
        const textNodes = [];
        step.childNodes.forEach((node) => {
          if (node.nodeType === 3 && node.textContent.trim()) {
            textNodes.push(node.textContent.trim());
          } else if (node.tagName === 'BR') {
            textNodes.push('\n');
          }
        });
        if (textNodes.length > 0) {
          li.appendChild(document.createTextNode(textNodes.join(' ').replace(/\s+/g, ' ').trim()));
        }
        ol.appendChild(li);
      });
      rightContent.push(ol);
    }
  }

  // === BUILD CELLS ===
  const cells = [
    [leftContent, rightContent],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-recipe', cells });
  element.replaceWith(block);
}
