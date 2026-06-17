/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-recipe-page.js
  var import_recipe_page_exports = {};
  __export(import_recipe_page_exports, {
    default: () => import_recipe_page_default
  });

  // tools/importer/parsers/hero-recipe.js
  function parse(element, { document }) {
    const heroImage = element.querySelector(
      ".recipe-image-v2 img, .recipe-detailv3__video-fallback-img img, .recipe-detailv3__box-two img"
    );
    const heading = element.querySelector(
      ".recipe-description h1, .recipe-detailv3__description h1, h1"
    );
    const description = element.querySelector(
      ".recipe-description > p, .recipe-detailv3__description > p, .recipe-description .recipe-desc"
    );
    const ctaLinks = Array.from(
      element.querySelectorAll(".recipe-description a.btn, .recipe-description a.button, .recipe-detailv3__description a.cta")
    );
    const cells = [];
    if (heroImage) {
      cells.push([heroImage]);
    }
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
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-recipe", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-recipe.js
  function parse2(element, { document }) {
    const ingredientsContainer = element.querySelector("#ingredients-content");
    const leftContent = [];
    if (ingredientsContainer) {
      const ingredientsHeading = ingredientsContainer.querySelector("h3.k-menu-item");
      if (ingredientsHeading) {
        const h3 = document.createElement("h3");
        h3.textContent = ingredientsHeading.textContent.trim();
        leftContent.push(h3);
      }
      const ingredientLists = ingredientsContainer.querySelectorAll(":scope .content-section > ul.ingredients");
      ingredientLists.forEach((ul) => {
        let prevSibling = ul.previousElementSibling;
        while (prevSibling && prevSibling.tagName !== "H4") {
          prevSibling = prevSibling.previousElementSibling;
        }
        if (prevSibling && prevSibling.tagName === "H4" && prevSibling.textContent.trim()) {
          const h4 = document.createElement("h4");
          h4.textContent = prevSibling.textContent.trim();
          leftContent.push(h4);
        }
        const newUl = document.createElement("ul");
        const items = ul.querySelectorAll("li .ingredient-row");
        items.forEach((row) => {
          const li = document.createElement("li");
          const nameSpan = row.querySelector(":scope > span:not(.amount)");
          const amountSpan = row.querySelector(":scope > span.amount, :scope > a span.amount");
          const linkedName = row.querySelector(":scope > a span:not(.amount)");
          const name = nameSpan ? nameSpan.textContent.trim() : linkedName ? linkedName.textContent.trim() : "";
          const amount = amountSpan ? amountSpan.textContent.trim() : "";
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
    const preparationContainer = element.querySelector("#preparation-content");
    const rightContent = [];
    if (preparationContainer) {
      const description = preparationContainer.querySelector(".desc-container .recipe-desc");
      if (description) {
        const p = document.createElement("p");
        p.textContent = description.textContent.trim();
        rightContent.push(p);
      }
      const prepHeading = preparationContainer.querySelector(".content-section h3");
      if (prepHeading) {
        const h3 = document.createElement("h3");
        h3.textContent = prepHeading.textContent.trim();
        rightContent.push(h3);
      }
      const instructionsList = preparationContainer.querySelector("ol.instructions");
      if (instructionsList) {
        const ol = document.createElement("ol");
        const steps = instructionsList.querySelectorAll(":scope > li");
        steps.forEach((step) => {
          const li = document.createElement("li");
          const stepHeading = step.querySelector("h4");
          if (stepHeading) {
            const strong = document.createElement("strong");
            strong.textContent = stepHeading.textContent.trim();
            li.appendChild(strong);
            li.appendChild(document.createTextNode(" "));
          }
          const textNodes = [];
          step.childNodes.forEach((node) => {
            if (node.nodeType === 3 && node.textContent.trim()) {
              textNodes.push(node.textContent.trim());
            } else if (node.tagName === "BR") {
              textNodes.push("\n");
            }
          });
          if (textNodes.length > 0) {
            li.appendChild(document.createTextNode(textNodes.join(" ").replace(/\s+/g, " ").trim()));
          }
          ol.appendChild(li);
        });
        rightContent.push(ol);
      }
    }
    const cells = [
      [leftContent, rightContent]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-recipe", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse3(element, { document }) {
    const image = element.querySelector(".recipeproduct__image img, .product-tile-row img");
    const titleLink = element.querySelector("span.product-title a, a.js-recipe-rdp-image");
    const productLink = element.querySelector("a.js-product-click, a.js-recipe-rdp-image");
    const contentCell = [];
    if (titleLink) {
      const strong = document.createElement("strong");
      strong.textContent = titleLink.textContent.trim();
      contentCell.push(strong);
      if (productLink && productLink.getAttribute("href")) {
        const link = document.createElement("a");
        link.href = productLink.getAttribute("href");
        link.textContent = titleLink.textContent.trim();
        contentCell.push(link);
      }
    }
    const cells = [];
    if (image && contentCell.length > 0) {
      cells.push([image, contentCell]);
    } else if (image) {
      cells.push([image]);
    } else if (contentCell.length > 0) {
      cells.push([contentCell]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-recipe.js
  function parse4(element, { document }) {
    const heading = element.querySelector("h2.featured-item-slider__title, h2");
    const itemContainer = element.querySelector(".featured-item-slider__list, .js-swipecarousel");
    const items = itemContainer ? Array.from(itemContainer.querySelectorAll('a[href], .item, .slide, [class*="card"], [class*="tile"]')) : [];
    const ctaLink = element.querySelector(".button-wrapper a, a.button");
    const cells = [];
    if (items.length > 0) {
      items.forEach((item) => {
        const img = item.querySelector("img");
        const title = item.querySelector('h3, h4, .title, [class*="title"], strong');
        const desc = item.querySelector('p, .description, [class*="desc"]');
        const link = item.tagName === "A" ? item : item.querySelector("a[href]");
        const imageCell = img || document.createTextNode("");
        const contentCell = [];
        if (title) contentCell.push(title);
        if (desc) contentCell.push(desc);
        if (link && link !== item) contentCell.push(link);
        if (link && link === item) {
          const linkEl = document.createElement("a");
          linkEl.href = link.href;
          linkEl.textContent = link.textContent.trim() || (title ? title.textContent.trim() : "");
          contentCell.push(linkEl);
        }
        if (img || title || link) {
          cells.push([imageCell, contentCell.length > 0 ? contentCell : document.createTextNode("")]);
        }
      });
    }
    if (cells.length === 0) {
      const contentCell = [];
      if (heading) contentCell.push(heading);
      if (ctaLink) contentCell.push(ctaLink);
      if (contentCell.length > 0) {
        cells.push([contentCell]);
      }
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-recipe", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/ufs-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".camerascan-popup",
        ".lightbox__overlay",
        "#onetrust-consent-sdk",
        "#chat-widget-container",
        ".notification",
        ".floating-notification"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        ".main-header-pusher",
        ".breadcrumb-wrapper-v2",
        ".munchkin-label",
        ".content-tools",
        ".minicart-flyout",
        ".recipeproduct-tilepop",
        "link",
        "noscript",
        "iframe"
      ]);
    }
  }

  // tools/importer/transformers/ufs-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const { template } = payload;
      if (!template || !template.sections || template.sections.length < 2) return;
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };
      const doc = element.ownerDocument || document;
      const sections = [...template.sections].reverse();
      sections.forEach((section) => {
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) return;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        const isFirstSection = template.sections[0].selector === section.selector;
        if (!isFirstSection) {
          const hr = doc.createElement("hr");
          sectionEl.before(hr);
        }
      });
    }
  }

  // tools/importer/import-recipe-page.js
  var parsers = {
    "hero-recipe": parse,
    "columns-recipe": parse2,
    "cards-product": parse3,
    "carousel-recipe": parse4
  };
  var PAGE_TEMPLATE = {
    name: "recipe-page",
    description: "Recipe detail page with ingredients, preparation steps, and nutritional information",
    urls: [
      "https://www.unileverfoodsolutions.nl/recept/griekse-puntpaprika-salade-R0072510.html"
    ],
    blocks: [
      {
        name: "hero-recipe",
        instances: [".page-header_recipe .recipe-detailv3__recipe"]
      },
      {
        name: "columns-recipe",
        instances: [".recipe-layout-wrapper#tab1-content"]
      },
      {
        name: "cards-product",
        instances: [".recipeproduct-tile"]
      },
      {
        name: "carousel-recipe",
        instances: [".toprecipes .featured-item-slider"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Recipe Hero",
        selector: ".page-header_recipe",
        style: null,
        blocks: ["hero-recipe"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Recipe Content",
        selector: ".tab-content",
        style: null,
        blocks: ["columns-recipe", "cards-product"],
        defaultContent: [".desc-container p.recipe-desc", ".pdp-section.js-rating-section"]
      },
      {
        id: "section-3",
        name: "Related Recipes",
        selector: ".toprecipes.section",
        style: null,
        blocks: ["carousel-recipe"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_recipe_page_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_recipe_page_exports);
})();
