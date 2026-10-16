import { initPointerWarp } from './warp';

// Static Astro documents, voiding a fragile custom i18n router
type View = 'presentation' | 'engineering';
type Destination = { url: URL; fromHistory: boolean; scrollY?: number };
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));
const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();
let teardown: () => void = () => {};
let navigating = false;
let queued: Destination | null = null;

// Keep anchor destinations below both mobile navigation rows
function anchorOffset(): number {
  const headerBottom = document.querySelector<HTMLElement>('[data-site-header]')?.getBoundingClientRect().bottom || 72;
  const selectorBottom = innerWidth <= 740
    ? document.querySelector<HTMLElement>('[data-perspective-switcher]')?.getBoundingClientRect().bottom || 132
    : 0;
  return Math.max(headerBottom, selectorBottom) + 24;
}

function activeSection(): string {
  const view = (document.body.dataset.view || 'presentation') as View;
  const ids = view === 'presentation'
    ? ['top','about','experience','work','education','thinking','contact']
    : ['top','frame','eufunding','systems','contact'];
  const limit = anchorOffset() + 36;
  let current = 'top';
  for (const id of ids) {
    const section = document.getElementById(id);
    if (section && section.getBoundingClientRect().top <= limit) current = id;
  }
  return current;
}

function initScroll(): () => void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const surface = document.querySelector<HTMLElement>('[data-paper-front]');
  const switcher = document.querySelector<HTMLElement>('[data-perspective-switcher]');
  if (!header || !surface) return () => {};
  const night = surface.querySelector<HTMLElement>('[data-dark-universe]');
  const threshold = surface.querySelector<HTMLElement>('[data-shadow-threshold]');
  const anchors = [...header.querySelectorAll<HTMLAnchorElement>('a[data-anchor]')];
  const controller = new AbortController();
  let frame = 0;
  const update = () => {
    frame = 0;
    header.classList.toggle('is-scrolled', scrollY > 24);
    let dark = document.body.dataset.view === 'engineering';
    let indexDark = dark;
    if (night && document.body.dataset.view === 'presentation') {
      const indexMidpoint = switcher ? switcher.getBoundingClientRect().top + switcher.offsetHeight / 2 : innerHeight * .52;
      dark = night.getBoundingClientRect().top < 80;
      indexDark = night.getBoundingClientRect().top < indexMidpoint;
      if (threshold) {
        const rect = threshold.getBoundingClientRect();
        const stageHeight = threshold.querySelector<HTMLElement>('.threshold-stage')?.getBoundingClientRect().height || innerHeight;
        const progress = clamp01(-rect.top / Math.max(1, rect.height - stageHeight));
        threshold.style.setProperty('--shadow-y', `${(stageHeight * (1.04 - 2.66 * progress)).toFixed(1)}px`);
        dark = dark || (rect.top < 84 && rect.bottom > 84 && progress > .82);
        if (rect.top < indexMidpoint && rect.bottom > indexMidpoint && progress > .65) indexDark = true;
      }
    }
    header.classList.toggle('is-dark', dark);
    switcher?.classList.toggle('is-dark', indexDark);
    const current = activeSection();
    for (const anchor of anchors) {
      const selected = anchor.hash === `#${current}`;
      anchor.classList.toggle('is-current', selected);
      if (selected) anchor.setAttribute('aria-current', 'location'); else anchor.removeAttribute('aria-current');
    }
  };
  const request = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll', request, { passive: true, signal: controller.signal });
  addEventListener('resize', request, { passive: true, signal: controller.signal });
  reducedMotion.addEventListener('change', request, { signal: controller.signal });
  update();
  return () => { controller.abort(); cancelAnimationFrame(frame); };
}

function initMobileMenu(): () => void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const toggle = header?.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  if (!header || !toggle) return () => {};
  const controller = new AbortController();
  const close = (returnFocus = false) => {
    header.classList.remove('has-open-menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', toggle.dataset.openLabel === 'Menú' ? 'Abrir menú' : 'Open menu');
    const label = toggle.querySelector<HTMLElement>('.menu-toggle-label');
    if (label) label.textContent = toggle.dataset.openLabel || 'Menu';
    if (returnFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    const open = !header.classList.contains('has-open-menu');
    if (!open) { close(); return; }
    header.classList.add('has-open-menu');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', toggle.dataset.closeLabel === 'Cerrar' ? 'Cerrar menú' : 'Close menu');
    const label = toggle.querySelector<HTMLElement>('.menu-toggle-label');
    if (label) label.textContent = toggle.dataset.closeLabel || 'Close';
  }, { signal: controller.signal });
  header.querySelectorAll<HTMLAnchorElement>('.nav-links a').forEach(link => link.addEventListener('click', () => close(), { signal: controller.signal }));
  document.addEventListener('pointerdown', event => {
    if (event.target instanceof Node && !header.contains(event.target)) close();
  }, { signal: controller.signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('has-open-menu')) close(true);
  }, { signal: controller.signal });
  addEventListener('resize', () => { if (innerWidth > 1050) close(); }, { passive: true, signal: controller.signal });
  return () => { close(); controller.abort(); };
}

function mount(): void {
  const cleanups = [initScroll(), initMobileMenu(), initPointerWarp()];
  teardown = () => cleanups.forEach(dispose => dispose());
}

async function retrieve(url: URL): Promise<Document> {
  const path = url.pathname;
  let html = cache.get(path);
  if (!html) {
    let task = inflight.get(path);
    if (!task) {
      task = fetch(path, { headers: { Accept: 'text/html' } }).then(async response => {
        if (!response.ok) throw new Error(`Navigation returned ${response.status}`);
        const text = await response.text();
        cache.set(path, text);
        return text;
      }).finally(() => inflight.delete(path));
      inflight.set(path, task);
    }
    html = await task;
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (!doc.querySelector('[data-paper-front]') || !doc.querySelector('[data-perspective-switcher]')) throw new Error('Not a portfolio document');
  return doc;
}

function syncDocument(doc: Document): void {
  document.title = doc.title;
  for (const selector of [
    'meta[name="description"]', 'meta[name="robots"]', 'meta[name="theme-color"]',
    'meta[name="color-scheme"]', 'meta[name="twitter:card"]', 'meta[name="twitter:image"]',
    'meta[property^="og:"]', 'link[rel="canonical"]', 'link[rel="alternate"]',
    'script[data-portfolio-structured-data]'
  ]) {
    document.head.querySelectorAll(selector).forEach(node => node.remove());
    doc.head.querySelectorAll(selector).forEach(node => document.head.appendChild(document.importNode(node, true)));
  }
  const view = doc.body.dataset.view || 'presentation';
  document.documentElement.lang = doc.documentElement.lang;
  document.documentElement.classList.toggle('engineering-page', view === 'engineering');
  document.body.dataset.view = view;
  document.body.dataset.locale = doc.body.dataset.locale;
  for (const selector of ['[data-site-header]', '[data-perspective-switcher]']) {
    const current = document.querySelector<HTMLElement>(selector);
    const incoming = doc.querySelector<HTMLElement>(selector);
    if (current && incoming) {
      current.innerHTML = incoming.innerHTML;
      if (selector === '[data-site-header]') { current.classList.toggle('is-dark', view === 'engineering'); current.classList.remove('has-open-menu'); }
      if (selector === '[data-perspective-switcher]') current.dataset.current = view;
    }
  }
  const skip = doc.querySelector('.skip-link');
  if (skip) document.querySelector('.skip-link')!.textContent = skip.textContent;
}

// Attach non-interactive navigation copies to their own paper sheets, not
function showNavigationTransition(doc: Document, front: HTMLElement, rear: HTMLElement, incomingDark: boolean): () => void {
  const copies: HTMLElement[] = [];
  const sheets = [front, rear];
  for (const [sheet, source] of [[front, document], [rear, doc]] as const) {
    for (const selector of ['[data-site-header]', '[data-perspective-switcher]']) {
      const nav = source.querySelector<HTMLElement>(selector);
      if (!nav) continue;
      const clone = nav.cloneNode(true) as HTMLElement;
      clone.removeAttribute(selector === '[data-site-header]' ? 'data-site-header' : 'data-perspective-switcher');
      clone.classList.add('paper-navigation-copy');
      clone.setAttribute('aria-hidden', 'true');
      clone.inert = true;
      if (sheet === rear) clone.classList.toggle('is-dark', incomingDark);
      sheet.appendChild(clone);
      copies.push(clone);
    }
  }
  const position = () => {
    const y = `${window.scrollY}px`;
    for (const sheet of sheets) sheet.style.setProperty('--navigation-scroll', y);
  };
  position();
  addEventListener('scroll', position, { passive: true });
  document.body.classList.add('navigation-transition-active');
  return () => {
    removeEventListener('scroll', position);
    for (const copy of copies) copy.remove();
    for (const sheet of sheets) sheet.style.removeProperty('--navigation-scroll');
    document.body.classList.remove('navigation-transition-active');
  };
}

// Positions content without smooth scrolling
function jump(target: string | null, restoredScroll?: number): void {
  const oldBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';
  const element = target ? document.getElementById(target) : null;
  if (element) {
    const offset = element.getBoundingClientRect().top + scrollY - (target === 'top' ? 0 : anchorOffset());
    window.scrollTo({ top: Math.max(0, offset), behavior: 'instant' });
  } else if (restoredScroll !== undefined) {
    window.scrollTo({ top: restoredScroll, behavior: 'instant' });
  } else window.scrollTo({ top: 0, behavior: 'instant' });
  document.documentElement.style.scrollBehavior = oldBehavior;
}

// Calculate the destination viewport BEFORE the entering sheet becomes visible.
function prepareIncoming(rear: HTMLElement, doc: Document, target: string | null, restored?: number) {
  const source = doc.querySelector<HTMLElement>('[data-paper-front]')!;
  const viewport = document.createElement('div');
  viewport.className = 'incoming-sheet-content';
  viewport.replaceChildren(...Array.from(source.childNodes).map(node => document.importNode(node, true)));
  rear.replaceChildren(viewport);
  const available = Math.max(0, viewport.scrollHeight - innerHeight);
  const anchor = target ? viewport.querySelector<HTMLElement>(`#${CSS.escape(target)}`) : null;
  const requiredY = anchor
    ? (anchor.getBoundingClientRect().top - viewport.getBoundingClientRect().top + document.querySelector<HTMLElement>('[data-paper-front]')!.getBoundingClientRect().top + scrollY - (target === 'top' ? 0 : anchorOffset()))
    : restored ?? 0;
  const desiredY = Math.max(0, Math.min(available, requiredY));
  const followScroll = () => viewport.style.setProperty('--preview-shift', `${scrollY - desiredY}px`);
  followScroll();

  // Keep the preview aligned even if the visitor scrolls while the paper is moving
  addEventListener('scroll', followScroll, { passive:true });
  return {
    viewport, desiredY,
    dispose: () => removeEventListener('scroll', followScroll),
  };
}

function routeInfo(path: string): { locale: string; view: View } | null {
  if (path === '/') return { locale: 'en', view: 'presentation' };
  const match = path.match(/^\/(en|es)\/(engineering\/)?$/);
  const locale = match?.[1];
  return match && (locale === 'en' || locale === 'es')
    ? { locale, view: match[2] ? 'engineering' : 'presentation' } : null;
}

async function swap(destination: Destination): Promise<void> {
  if (navigating) { queued = destination; return; }
  const { url, fromHistory, scrollY: restoredScroll } = destination;
  const existing = document.body.dataset.path || location.pathname;
  if (existing === url.pathname) {
    if (url.hash || restoredScroll !== undefined) jump(url.hash ? decodeURIComponent(url.hash.slice(1)) : null, restoredScroll);
    return;
  }
  const stack = document.querySelector<HTMLElement>('[data-sheet-stack]');
  const front = document.querySelector<HTMLElement>('[data-paper-front]');
  const rear = document.querySelector<HTMLElement>('[data-paper-rear]');
  if (!stack || !front || !rear) { location.assign(url.href); return; }
  navigating = true;
  stack.setAttribute('aria-busy', 'true');
  let disposePreview = () => {};
  let disposeNavigation = () => {};
  const outgoing = (document.body.dataset.view || 'presentation') as View;
  const incoming = routeInfo(url.pathname)?.view || 'presentation';

  // Perspective tabs introduce the other page
  const semantic = url.hash ? decodeURIComponent(url.hash.slice(1)) : fromHistory ? null : 'top';
  try {
    const doc = await retrieve(url);
    teardown();
    rear.dataset.view = incoming;
    rear.style.minHeight = `${Math.max(front.offsetHeight, innerHeight)}px`;
    rear.inert = true;
    rear.setAttribute('aria-hidden', 'true');
    const preview = prepareIncoming(rear, doc, semantic, restoredScroll);
    rear.style.minHeight = `${Math.max(front.offsetHeight, preview.viewport.scrollHeight, innerHeight)}px`;
    disposePreview = preview.dispose;
    const incomingDark = incoming === 'engineering' || (incoming === 'presentation' && ['thinking','contact'].includes(semantic || ''));
    disposeNavigation = !reducedMotion.matches ? showNavigationTransition(doc, front, rear, incomingDark) : () => {};
    document.body.dataset.transition = 'separating';
    stack.dataset.phase = 'separating';
    if (!reducedMotion.matches) {
      stack.classList.add('is-changing');
      await new Promise<void>(resolve => {
        const cross = window.setTimeout(() => {
          stack.classList.add('is-crossed');
          stack.dataset.phase = 'crossing';
          document.body.dataset.transition = 'crossing';
        }, 320);
        window.setTimeout(() => { clearTimeout(cross); resolve(); }, 640);
      });
    }
    stack.dataset.phase = 'settling';
    document.body.dataset.transition = 'settling';

    // Synchronously change both visual alignment and the document's scroll.
    disposePreview(); disposePreview = () => {};
    front.replaceChildren(...Array.from(preview.viewport.childNodes));
    front.dataset.view = incoming;
    rear.replaceChildren();
    rear.style.removeProperty('min-height');
    rear.dataset.view = outgoing;
    stack.classList.remove('is-crossed', 'is-changing');
    syncDocument(doc);
    if (!fromHistory) {
      history.replaceState({ ...(history.state || {}), scrollY: scrollY }, '', location.href);
      history.pushState({ scrollY: null }, '', url.pathname + url.search + url.hash);
    }
    document.body.dataset.path = url.pathname;

    const previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top: preview.desiredY, behavior: 'instant' });
    document.documentElement.style.scrollBehavior = previousBehavior;
    mount();

    if (!fromHistory) {
      const section = semantic ? document.getElementById(semantic) : null;
      const destinationHeading = section?.querySelector<HTMLElement>('h1, h2')
        || document.querySelector<HTMLElement>('[data-paper-front] h1');
      if (destinationHeading) {
        const addedTabIndex = !destinationHeading.hasAttribute('tabindex');
        if (addedTabIndex) destinationHeading.setAttribute('tabindex', '-1');
        destinationHeading.focus({ preventScroll: true });
        if (addedTabIndex) destinationHeading.addEventListener('blur', () => destinationHeading.removeAttribute('tabindex'), { once: true });
      }
    }
    disposeNavigation(); disposeNavigation = () => {};
    requestAnimationFrame(() => { document.body.dataset.transition = 'idle'; stack.dataset.phase = 'idle'; });
  } catch (error) {
    console.error('Sheet navigation failed; using native navigation.', error);
    location.assign(url.href);
  } finally {
    disposePreview();
    disposeNavigation();
    stack.classList.remove('is-changing', 'is-crossed');
    stack.removeAttribute('aria-busy');
    navigating = false;
    if (queued) { const next = queued; queued = null; void swap(next); }
  }
}

function routeClicks(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  const anchor = target.closest<HTMLAnchorElement>('a[href]');
  if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
  const url = new URL(anchor.href);
  if (url.origin !== location.origin) return;
  // Smooth return to the top without the native hash jump.
  if (!navigating && url.pathname === location.pathname && url.hash === '#top') {
    event.preventDefault();
    if (location.hash !== '#top') {
      history.pushState({ scrollY: 0 }, '', url.pathname + url.search + '#top');
    }
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    return;
  }
  if (navigating && anchor.hasAttribute('data-perspective')) {
    event.preventDefault(); queued = {url, fromHistory: false}; return;
  }
  const destination = routeInfo(url.pathname);
  const current = routeInfo(location.pathname);
  if (!destination || !current) return;
  // Static cross-locale navigation retains the section when it exists in both translations.
  if (destination.locale !== current.locale) {
    if (destination.view === current.view && !url.hash) {
      const section = activeSection();
      if (section !== 'top') {
        url.hash = `#${section}`;
        event.preventDefault();
        location.assign(url.href);
      }
    }
    return;
  }
  if (destination.view === current.view) {
    if (url.pathname === location.pathname && !url.hash) event.preventDefault();
    return; // native anchor behavior for same-page links
  }
  event.preventDefault();
  void swap({ url, fromHistory: false });
}

history.scrollRestoration = 'manual';
document.body.dataset.path = location.pathname;
document.body.dataset.transition = 'idle';
document.addEventListener('click', routeClicks);
addEventListener('popstate', event => {
  const url = new URL(location.href);
  if (!routeInfo(url.pathname)) return;
  void swap({ url, fromHistory: true, scrollY: typeof event.state?.scrollY === 'number' ? event.state.scrollY : undefined });
});
document.addEventListener('pointerover', event => {
  if (!(event.target instanceof Element)) return;
  const anchor = event.target.closest<HTMLAnchorElement>('a[data-perspective]');
  if (!anchor || matchMedia('(prefers-reduced-data: reduce)').matches) return;
  const url = new URL(anchor.href);
  if (url.pathname !== location.pathname && !cache.has(url.pathname)) void retrieve(url).catch(() => {});
}, { passive: true });
mount();
