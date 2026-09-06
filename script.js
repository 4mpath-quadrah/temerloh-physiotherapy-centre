(() => {
  const ROUTES = {
    home: { href: './', file: 'index.html', title: 'Selamat Datang | TPC' },
    about: { href: 'about.html', file: 'about.html', title: 'About Us | TPC' },
    gallery: { href: 'gallery.html', file: 'gallery.html', title: 'Gallery | TPC' },
    pricing: { href: 'pricing.html', file: 'pricing.html', title: 'Pricing | TPC' },
    contact: { href: 'contact.html', file: 'contact.html', title: 'Contact Us | TPC' }
  };

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let currentRoute = document.body.dataset.page || 'home';
  let galleryItems = [];
  let galleryIndex = 0;

  function showLoader() {
    const loader = document.querySelector('.loader');
    if (!loader) return;
    loader.classList.remove('hide');
    document.body.classList.add('loading');
  }
  function hideLoader() {
    const loader = document.querySelector('.loader');
    if (!loader) return;
    setTimeout(() => { loader.classList.add('hide'); document.body.classList.remove('loading'); }, 450);
  }

  function closeMenu() {
    const nav = document.querySelector('.nav-links');
    const menu = document.querySelector('.menu-btn');
    nav?.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
  }

  function setActive(route) {
    document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
      a.classList.toggle('active', a.dataset.page === route);
    });
  }

  function bindMenu() {
    const menu = document.querySelector('.menu-btn');
    const nav = document.querySelector('.nav-links');
    menu?.addEventListener('click', () => {
      nav?.classList.toggle('open');
      menu.setAttribute('aria-expanded', nav?.classList.contains('open') ? 'true' : 'false');
    });
  }

  function bindNavigation() {
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      const route = Object.keys(ROUTES).find(k => ROUTES[k].href === href || (k === 'home' && href === 'index.html'));
      if (!route || a.dataset.spaBound === '1') return;
      a.dataset.spaBound = '1';
      a.addEventListener('click', e => {
        e.preventDefault();
        navigate(route);
      });
    });
  }

  async function navigate(route, initial = false) {
    const target = ROUTES[route] || ROUTES.home;
    if (!initial && route === currentRoute) { closeMenu(); window.scrollTo({top: 0, behavior: 'smooth'}); return; }
    closeMenu();
    showLoader();
    try {
      const response = await fetch(target.file, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newMain = doc.querySelector('main');
      const currentMain = document.querySelector('main');
      if (!newMain || !currentMain) throw new Error('Main content missing');
      currentMain.replaceWith(newMain);
      currentRoute = route;
      document.body.dataset.page = route;
      document.title = target.title;
      setActive(route);
      bindPageFeatures();
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (err) {
      console.error('TPC navigation error:', err);
      if (!initial) {
        // Keep the current page visible if a secondary page cannot be loaded.
        const note = document.querySelector('.page-load-error');
        if (note) note.remove();
      }
    } finally {
      await sleep(250);
      hideLoader();
    }
  }

  function bindGallery() {
    const modal = document.querySelector('.modal');
    if (!modal) return;
    galleryItems = [...document.querySelectorAll('.gallery-item')];
    const img = modal.querySelector('img');
    const open = i => {
      if (!galleryItems.length) return;
      galleryIndex = (i + galleryItems.length) % galleryItems.length;
      const source = galleryItems[galleryIndex].querySelector('img');
      img.src = source.src; img.alt = source.alt;
      modal.classList.add('open'); document.body.style.overflow = 'hidden';
    };
    const close = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };
    galleryItems.forEach((item,i) => item.addEventListener('click', () => open(i)));
    modal.querySelector('.modal-close')?.addEventListener('click', close);
    modal.querySelector('.modal-prev')?.addEventListener('click', () => open(galleryIndex - 1));
    modal.querySelector('.modal-next')?.addEventListener('click', () => open(galleryIndex + 1));
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
  }

  function bindContacts() {
    document.querySelectorAll('.contact-card').forEach(card => {
      const toggle = () => {
        const open = card.classList.toggle('open');
        card.setAttribute('aria-expanded', String(open));
      };
      card.addEventListener('click', e => { if (!e.target.closest('a')) toggle(); });
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });
  }

  function bindPageFeatures() { bindGallery(); bindContacts(); bindNavigation(); }

  function bindInstallCard() {
    const card = document.querySelector('.install-card');
    if (!card || !window.matchMedia('(max-width: 850px)').matches || sessionStorage.getItem('tpcInstallDismissed')) return;
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; });
    setTimeout(() => card.classList.add('show'), 1800);
    card.querySelector('.dismiss')?.addEventListener('click', () => {
      sessionStorage.setItem('tpcInstallDismissed','1'); card.classList.remove('show');
    });
    card.querySelector('.install')?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null;
        card.classList.remove('show'); sessionStorage.setItem('tpcInstallDismissed','1');
      } else {
        const help = card.querySelector('.install-help'); if (help) help.hidden = !help.hidden;
      }
    });
  }

  document.addEventListener('keydown', e => {
    const modal = document.querySelector('.modal');
    if (!modal?.classList.contains('open')) return;
    if (e.key === 'Escape') { modal.classList.remove('open'); document.body.style.overflow=''; }
    if (e.key === 'ArrowLeft') modal.querySelector('.modal-prev')?.click();
    if (e.key === 'ArrowRight') modal.querySelector('.modal-next')?.click();
  });

  window.addEventListener('load', async () => {
    bindMenu(); bindPageFeatures(); bindInstallCard(); setActive(currentRoute);
    hideLoader();
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(err => console.warn('TPC SW:', err));
  }
})();
