/* =============================================
   MIGUEL MADRIGAL — AUTOMOTIVE PHOTOGRAPHY
   Main JavaScript with Bilingual System
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  initLanguageSwitcher();
  initNavbar();
  initMobileNav();
  initScrollReveal();
  initGalleryFilters();
  initLightbox();
  initContactForm();
  initSmoothScroll();
  initPricingButtons();
  initAmbientParallax();
});


/* =============================================
   1. BILINGUAL SYSTEM — EN/JP Language Switcher
   ============================================= */
function initLanguageSwitcher() {
  const langButtons = document.querySelectorAll('.lang-btn');
  const elements = document.querySelectorAll('body [lang]');
  
  if (!langButtons.length) return;

  // Load saved preference or default to English
  const savedLang = localStorage.getItem('portfolio-lang') || 'en';
  setLanguage(savedLang);

  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.dataset.lang;
      setLanguage(selectedLang);
    });
  });

  function setLanguage(lang) {
    // 1. Update body class for typography/font changes
    document.body.className = `lang-${lang}`;
    
    // Save selection
    localStorage.setItem('portfolio-lang', lang);

    // 2. Toggle active button states
    langButtons.forEach(btn => {
      if (btn.dataset.lang === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 3. Show/hide translation elements
    elements.forEach(el => {
      if (el.getAttribute('lang') === lang) {
        el.classList.remove('lang-hide');
      } else {
        el.classList.add('lang-hide');
      }
    });

    // Dynamically update form textarea placeholder
    const msgField = document.getElementById('contact-message');
    if (msgField) {
      if (lang === 'ja') {
        msgField.placeholder = "メーカー、モデル、カスタム概要、希望日程など...";
      } else {
        msgField.placeholder = "Make, model, modification overview, timing...";
      }
    }

    // 4. Force refresh scroll reveal observations as heights change
    if (window.ScrollRevealObserver) {
      window.ScrollRevealObserver.disconnect();
      initScrollReveal();
    }
  }
}


/* =============================================
   2. NAVBAR — Transparent → Solid on scroll
   ============================================= */
function initNavbar() {
  const header = document.querySelector('.header');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section');
  if (!header) return;

  const scrollThreshold = 80;

  function updateHeader() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  // Active section indicator in nav
  function updateActiveLink() {
    let currentActive = '';
    const headerHeight = 90;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - headerHeight;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentActive = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentActive}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', () => {
    updateHeader();
    updateActiveLink();
  }, { passive: true });

  updateHeader();
  updateActiveLink();
}


/* =============================================
   3. MOBILE NAV — Hamburger toggle
   ============================================= */
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('is-active');
    mobileNav.classList.toggle('is-open');
    document.body.style.overflow = mobileNav.classList.contains('is-open') ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('is-active');
      mobileNav.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });
}


/* =============================================
   4. SMOOTH SCROLL — With header offset
   ============================================= */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      
      const headerHeight = window.innerWidth <= 768 ? 72 : 80;
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    });
  });
}


/* =============================================
   5. SCROLL REVEAL — Intersection Observer
   ============================================= */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -20px 0px'
  });

  elements.forEach(el => observer.observe(el));
  window.ScrollRevealObserver = observer; // Cache observer reference to refresh on language switches
}


/* =============================================
   6. GALLERY FILTERS — Filter by category
   ============================================= */
function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!filterBtns.length || !galleryItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      galleryItems.forEach((item, index) => {
        const category = item.dataset.category;

        if (filter === 'all' || category === filter) {
          item.classList.remove('is-hidden');
          item.style.opacity = '0';
          item.style.transform = 'scale(0.96)';
          setTimeout(() => {
            item.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, index * 40);
        } else {
          item.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
          item.style.opacity = '0';
          item.style.transform = 'scale(0.96)';
          setTimeout(() => {
            item.classList.add('is-hidden');
          }, 400);
        }
      });
    });
  });
}


/* =============================================
   7. LIGHTBOX — GLightbox initialization
   ============================================= */
function initLightbox() {
  if (typeof GLightbox === 'undefined') {
    return;
  }

  GLightbox({
    selector: '.glightbox',
    touchNavigation: true,
    loop: true,
    closeOnOutsideClick: true,
    skin: 'clean',
    openEffect: 'zoom',
    closeEffect: 'zoom'
  });
}


/* =============================================
   8. CONTACT FORM — Validation & Bilingual Feedback
   ============================================= */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const formSuccess = document.querySelector('.form-success');
  if (!form || !formSuccess) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#contact-name');
    const email = form.querySelector('#contact-email');
    const service = form.querySelector('#contact-service');
    const message = form.querySelector('#contact-message');
    const submitBtn = form.querySelector('button[type="submit"]');

    let isValid = true;

    [name, email, message].forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#e32929';
        isValid = false;
        setTimeout(() => { field.style.borderColor = ''; }, 2000);
      }
    });

    if (email && email.value && !isValidEmail(email.value)) {
      email.style.borderColor = '#e32929';
      isValid = false;
      setTimeout(() => { email.style.borderColor = ''; }, 2000);
    }

    if (!isValid) return;

    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span lang="en">Sending...</span><span lang="ja" class="lang-hide">送信中...</span>';
    
    // Support translation states inside button loading text
    const activeLang = localStorage.getItem('portfolio-lang') || 'en';
    const activeLoadingSpan = submitBtn.querySelector(`span[lang="${activeLang}"]`);
    if (activeLoadingSpan) {
      submitBtn.querySelectorAll('span').forEach(s => s.classList.add('lang-hide'));
      activeLoadingSpan.classList.remove('lang-hide');
    }

    // Send AJAX request to FormSubmit.co
    fetch('https://formsubmit.co/ajax/miguelmadrigalwork@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        Name: name.value,
        Email: email.value,
        Service: service ? service.value : 'N/A',
        Message: message.value
      })
    })
    .then(response => {
      if (response.ok) {
        // Display success alert
        form.style.display = 'none';
        formSuccess.classList.add('is-visible');
        form.reset();

        setTimeout(() => {
          formSuccess.classList.remove('is-visible');
          form.style.display = 'flex';
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }, 8000);
      } else {
        throw new Error('Form submission failed.');
      }
    })
    .catch(err => {
      console.error(err);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      alert('Failed to send message. Please try emailing directly to miguelmadrigalwork@gmail.com.');
    });
  });
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}


/* =============================================
   9. PARALLAX EFFECT — Hero background
   ============================================= */
(function initHeroParallax() {
  const heroBg = document.querySelector('.hero-bg img');
  if (!heroBg) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBg.style.transform = `scale(1.05) translateY(${scrolled * 0.12}px)`;
    }
  }, { passive: true });
})();

/* =============================================
   10. PRICING BUTTONS — Form Auto-Select
   ============================================= */
function initPricingButtons() {
  const bookBtns = document.querySelectorAll('a[data-service]');
  const contactServiceSelect = document.getElementById('contact-service');

  if (!bookBtns.length || !contactServiceSelect) return;

  bookBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const service = btn.getAttribute('data-service');
      if (service) {
        contactServiceSelect.value = service;
      }
    });
  });
}

/* =============================================
   11. AMBIENT BACKGROUND — Subtle scroll parallax
   ============================================= */
function initAmbientParallax() {
  const glow1 = document.querySelector('.ambient-glow-1');
  const glow2 = document.querySelector('.ambient-glow-2');
  const grid = document.querySelector('.ambient-grid');

  if (!glow1 && !grid) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    
    // Very subtle translations
    if (glow1) glow1.style.transform = `translate3d(0, ${scrolled * 0.15}px, 0)`;
    if (glow2) glow2.style.transform = `translate3d(0, ${scrolled * -0.1}px, 0)`;
    if (grid) grid.style.transform = `translate3d(0, ${scrolled * 0.05}px, 0)`;
  }, { passive: true });
}
