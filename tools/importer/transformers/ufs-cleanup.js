/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: UFS (Unilever Food Solutions) site-wide cleanup.
 * Removes non-authorable content from pages before and after block parsing.
 * All selectors validated against migration-work/cleaned.html DOM.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove elements that block parsing or are overlays/popups/widgets
    // Found: <div class="camerascan-popup js-camerascan-popup hidden"> (line 4)
    // Found: <div class="lightbox__overlay lightbox-login hide-print js-lightbox-login hidden"> (line 236)
    // Found: <div class="lightbox__overlay tradepartner-dialog js-tradepartner-api-dialog"> (line 668)
    // Found: <div id="onetrust-consent-sdk"> (line 2301)
    // Found: <div id="chat-widget-container"> (line 2918)
    // Found: <div class="notification hidden success js-notification-add"> (line 1934)
    // Found: <div class="floating-notification js-notification-info hidden"> (line 2283)
    WebImporter.DOMUtils.remove(element, [
      '.camerascan-popup',
      '.lightbox__overlay',
      '#onetrust-consent-sdk',
      '#chat-widget-container',
      '.notification',
      '.floating-notification',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable site chrome (header, footer, breadcrumbs, nav, search)
    // Found: <header class="main-header-v5 js-main-header js-main-header-v3 sticky-header_unpinned"> (line 26)
    // Found: <footer class="footer"> (line 2071)
    // Found: <div class="main-header-pusher "> (line 2)
    // Found: <div class="hide-print breadcrumb-wrapper-v2 js-breadcrumb-wrapper-v2 breadcrumb-new-headerv5 recipe-breadcrumb-bg"> (line 843)
    // Found: <div class="munchkin-label"> (line 2063)
    // Found: <div class="content-tools n-rdp hide-print clearfix"> (line 876)
    // Found: <div class="content-tools hide-print clearfix"> (line 1781, 1895)
    // Found: <div class="minicart-flyout"> (line 641)
    // Found: <div class="recipeproduct-tilepop"> (line 1328) - popup for product tile, not authorable
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      '.main-header-pusher',
      '.breadcrumb-wrapper-v2',
      '.munchkin-label',
      '.content-tools',
      '.minicart-flyout',
      '.recipeproduct-tilepop',
      'link',
      'noscript',
      'iframe',
    ]);
  }
}
