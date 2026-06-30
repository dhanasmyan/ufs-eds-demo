import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Builds and inserts the dismissible promo/announcement banner above the nav.
 * The banner content comes from the nav-promo section of the nav fragment.
 * Dismissed state is stored in sessionStorage.
 * @param {Element} promoSection The nav-promo section element
 * @param {Element} navWrapper The wrapper element to prepend the banner to
 */
function buildPromoBanner(promoSection, navWrapper) {
  if (!promoSection) return;
  const dismissed = sessionStorage.getItem('ufs-promo-dismissed');
  if (dismissed) return;

  const banner = document.createElement('div');
  banner.className = 'nav-promo-banner';
  banner.setAttribute('role', 'banner');

  const content = document.createElement('div');
  content.className = 'nav-promo-banner-content';
  content.innerHTML = promoSection.innerHTML;
  banner.append(content);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'nav-promo-banner-close';
  closeBtn.setAttribute('aria-label', 'Dismiss announcement');
  closeBtn.innerHTML = '&#x2715;';
  closeBtn.addEventListener('click', () => {
    banner.remove();
    sessionStorage.setItem('ufs-promo-dismissed', '1');
    document.documentElement.style.removeProperty('--promo-height');
  });
  banner.append(closeBtn);

  navWrapper.before(banner);

  // expose promo height as CSS variable for page offset
  requestAnimationFrame(() => {
    document.documentElement.style.setProperty('--promo-height', `${banner.offsetHeight}px`);
  });
}

/**
 * Builds the search toggle button inserted into nav-tools.
 * @param {Element} navTools The nav-tools element
 */
function buildSearchToggle(navTools) {
  const searchBtn = document.createElement('button');
  searchBtn.type = 'button';
  searchBtn.className = 'nav-search-toggle';
  searchBtn.setAttribute('aria-label', 'Search');
  searchBtn.setAttribute('aria-expanded', 'false');
  searchBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>`;

  // build inline search input overlay
  const searchOverlay = document.createElement('div');
  searchOverlay.className = 'nav-search-overlay';
  searchOverlay.setAttribute('hidden', '');
  searchOverlay.innerHTML = `
    <form class="nav-search-form" action="/search-results.html" method="get" role="search">
      <input type="search" name="q" placeholder="Search recipes, products, topics&hellip;" aria-label="Search" autocomplete="off">
      <button type="submit" aria-label="Submit search">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      </button>
    </form>`;

  searchBtn.addEventListener('click', () => {
    const expanded = searchBtn.getAttribute('aria-expanded') === 'true';
    searchBtn.setAttribute('aria-expanded', String(!expanded));
    if (expanded) {
      searchOverlay.setAttribute('hidden', '');
    } else {
      searchOverlay.removeAttribute('hidden');
      searchOverlay.querySelector('input').focus();
    }
  });

  // close search on Escape
  searchOverlay.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      searchBtn.setAttribute('aria-expanded', 'false');
      searchOverlay.setAttribute('hidden', '');
      searchBtn.focus();
    }
  });

  navTools.prepend(searchBtn);
  return searchOverlay;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // assign nav section classes — supports optional promo banner as first section
  // 4 sections: promo | brand | sections | tools
  // 3 sections:         brand | sections | tools
  const sectionCount = nav.children.length;
  const hasPromo = sectionCount >= 4;
  const classes = hasPromo
    ? ['promo', 'brand', 'sections', 'tools']
    : ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // clean up brand link button styling added by decorateButtons
  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand && navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    const btnContainer = brandLink.closest('.button-container');
    if (btnContainer) btnContainer.className = '';
  }

  // wire up nav section dropdowns
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  // build nav wrapper
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // build promo banner (above nav wrapper, outside scroll-lock)
  const promoSection = nav.querySelector('.nav-promo');
  buildPromoBanner(promoSection, navWrapper);

  // build search toggle in tools
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const searchOverlay = buildSearchToggle(navTools);
    navWrapper.append(searchOverlay);
  }
}

