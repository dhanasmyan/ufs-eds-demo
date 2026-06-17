/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: UFS (Unilever Food Solutions) section breaks and section metadata.
 * Inserts <hr> between sections and adds Section Metadata blocks where sections have styles.
 * Runs only in afterTransform using payload.template.sections.
 * Section selectors validated against migration-work/cleaned.html DOM:
 *   - .page-header_recipe (line 1038)
 *   - .tab-content (line 1104)
 *   - .toprecipes.section (line 2004)
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { template } = payload;
    if (!template || !template.sections || template.sections.length < 2) return;

    const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };
    const doc = element.ownerDocument || document;

    // Process sections in reverse order to avoid shifting positions
    const sections = [...template.sections].reverse();

    sections.forEach((section) => {
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) return;

      // Add Section Metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Insert <hr> before this section (but not for the first section)
      const isFirstSection = template.sections[0].selector === section.selector;
      if (!isFirstSection) {
        const hr = doc.createElement('hr');
        sectionEl.before(hr);
      }
    });
  }
}
