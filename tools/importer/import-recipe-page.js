/* eslint-disable */
/* global WebImporter */

import heroRecipeParser from './parsers/hero-recipe.js';
import columnsRecipeParser from './parsers/columns-recipe.js';
import cardsProductParser from './parsers/cards-product.js';
import carouselRecipeParser from './parsers/carousel-recipe.js';

import ufsCleanupTransformer from './transformers/ufs-cleanup.js';
import ufsSectionsTransformer from './transformers/ufs-sections.js';

const parsers = {
  'hero-recipe': heroRecipeParser,
  'columns-recipe': columnsRecipeParser,
  'cards-product': cardsProductParser,
  'carousel-recipe': carouselRecipeParser,
};

const PAGE_TEMPLATE = {
  name: 'recipe-page',
  description: 'Recipe detail page with ingredients, preparation steps, and nutritional information',
  urls: [
    'https://www.unileverfoodsolutions.nl/recept/griekse-puntpaprika-salade-R0072510.html',
  ],
  blocks: [
    {
      name: 'hero-recipe',
      instances: ['.page-header_recipe .recipe-detailv3__recipe'],
    },
    {
      name: 'columns-recipe',
      instances: ['.recipe-layout-wrapper#tab1-content'],
    },
    {
      name: 'cards-product',
      instances: ['.recipeproduct-tile'],
    },
    {
      name: 'carousel-recipe',
      instances: ['.toprecipes .featured-item-slider'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Recipe Hero',
      selector: '.page-header_recipe',
      style: null,
      blocks: ['hero-recipe'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Recipe Content',
      selector: '.tab-content',
      style: null,
      blocks: ['columns-recipe', 'cards-product'],
      defaultContent: ['.desc-container p.recipe-desc', '.pdp-section.js-rating-section'],
    },
    {
      id: 'section-3',
      name: 'Related Recipes',
      selector: '.toprecipes.section',
      style: null,
      blocks: ['carousel-recipe'],
      defaultContent: [],
    },
  ],
};

const transformers = [
  ufsCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [ufsSectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
