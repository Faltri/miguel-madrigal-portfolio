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
  initHighlightSlideshow();
  initPovCarousel();
});


/* =============================================
   1. BILINGUAL SYSTEM — EN/JP Language Switcher
   ============================================= */
function initLanguageSwitcher() {
  const langButtons = document.querySelectorAll('.lang-btn');
  const elements = document.querySelectorAll('body [lang]');
  
  if (!langButtons.length) return;

  // Load saved preference, or detect browser language, or default to English
  let defaultLang = 'en';
  if (navigator.language && navigator.language.toLowerCase().startsWith('ja')) {
    defaultLang = 'ja';
  }
  const savedLang = localStorage.getItem('portfolio-lang') || defaultLang;
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
        msgField.placeholder = "メーカー、モデル、カスタム概要、希望-程など...";
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

/* =============================================
   12. HIGHLIGHT SLIDESHOW (Auto-rotates when scrolled into view)
   ============================================= */
function initHighlightSlideshow() {
  const slides = document.querySelectorAll('.highlight-slide');
  const dots = document.querySelectorAll('.highlight-dot');
  const thumbs = document.querySelectorAll('.highlight-thumb');
  const prevBtn = document.querySelector('.highlight-nav-prev');
  const nextBtn = document.querySelector('.highlight-nav-next');
  const container = document.querySelector('.highlight-of-the-day');
  if (!slides.length) return;

  let currentIndex = 0;
  let intervalId = null;
  const ROTATE_INTERVAL = 4000; // Rotates every 4 seconds

  function showSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    dots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    thumbs.forEach((thumb, i) => {
      if (i === index) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });

    currentIndex = index;
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    intervalId = setInterval(nextSlide, ROTATE_INTERVAL);
  }

  function stopAutoplay() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  // Dot Click Navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      stopAutoplay();
      const slideIdx = dot.dataset.slide !== undefined ? parseInt(dot.dataset.slide, 10) : index;
      showSlide(isNaN(slideIdx) ? index : slideIdx);
      startAutoplay();
    });
  });

  // Thumbnail Click Navigation
  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      stopAutoplay();
      const slideIdx = thumb.dataset.slide !== undefined ? parseInt(thumb.dataset.slide, 10) : index;
      showSlide(isNaN(slideIdx) ? index : slideIdx);
      startAutoplay();
    });
  });

  // Prev / Next Buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      stopAutoplay();
      prevSlide();
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      stopAutoplay();
      nextSlide();
      startAutoplay();
    });
  }

  // Hover & Touch Events
  if (container) {
    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);

    container.addEventListener('touchstart', (e) => {
      stopAutoplay();
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        nextSlide();
      } else if (touchEndX - touchStartX > 50) {
        prevSlide();
      }
      startAutoplay();
    }, { passive: true });

    // Scroll Detection via IntersectionObserver
    if ('IntersectionObserver' in window) {
      const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAutoplay();
          } else {
            stopAutoplay();
          }
        });
      }, { threshold: 0.2 });

      scrollObserver.observe(container);
    } else {
      startAutoplay();
    }
  }

  // Start with Slide 0 (Touge Formation)
  showSlide(0);
}


/* =============================================
   12. POV VIDEO CAROUSEL & AUTO-ROTATION (SEAMLESS INFINITE LOOP)
   ============================================= */
function initPovCarousel() {
  const track = document.getElementById('pov-carousel-track');
  const prevBtn = document.querySelector('.pov-nav-prev');
  const nextBtn = document.querySelector('.pov-nav-next');
  if (!track) return;

  // Clone 2 extra sets (3 sets total) for flawless, seamless wrap in any direction & screen size
  const originalCards = Array.from(track.children);
  const totalOriginal = originalCards.length;
  if (totalOriginal === 0) return;

  // Clone set 1 and set 2
  for (let i = 0; i < 2; i++) {
    originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      track.appendChild(clone);
    });
  }

  let isDown = false;
  let startX = 0;
  let scrollLeftStart = 0;
  let isDragging = false;
  let autoScrollActive = true;
  let lastTimestamp = null;
  const SCROLL_SPEED_PPS = 32; // Smooth, relaxed cinematic speed (32 pixels per second)
  let animId = null;

  function ensureVideosPlay() {
    track.querySelectorAll('video').forEach(v => {
      if (v.paused) {
        v.play().catch(() => {});
      }
    });
  }

  function getCycleWidth() {
    const firstCard = track.children[0];
    const nthCard = track.children[totalOriginal];
    if (firstCard && nthCard) {
      return nthCard.offsetLeft - firstCard.offsetLeft;
    }
    return track.scrollWidth / 3;
  }

  // Position at middle set initially
  requestAnimationFrame(() => {
    const cycle = getCycleWidth();
    if (cycle > 0) {
      track.scrollLeft = cycle;
    }
    ensureVideosPlay();
  });

  function handleInfiniteBounds() {
    const cycle = getCycleWidth();
    if (cycle <= 0) return;
    if (track.scrollLeft >= cycle * 2) {
      track.scrollLeft -= cycle;
    } else if (track.scrollLeft <= 10) {
      track.scrollLeft += cycle;
    }
  }

  // Mouse Dragging & Click Handling
  track.addEventListener('mousedown', (e) => {
    isDown = true;
    isDragging = false;
    startX = e.pageX - track.offsetLeft;
    scrollLeftStart = track.scrollLeft;
  });

  window.addEventListener('mouseup', () => {
    if (isDown) {
      isDown = false;
      track.classList.remove('is-dragging');
    }
  });

  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const x = e.pageX - track.offsetLeft;
    const dist = Math.abs(x - startX);
    if (dist > 6) {
      isDragging = true;
      track.classList.add('is-dragging');
    }
    if (isDragging) {
      e.preventDefault();
      track.scrollLeft = scrollLeftStart - (x - startX) * 1.5;
      handleInfiniteBounds();
    }
  });

  // Touch handlers for mobile
  let touchStartX = 0;
  let touchScrollStart = 0;
  let touchMoved = false;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].pageX - track.offsetLeft;
    touchScrollStart = track.scrollLeft;
    touchMoved = false;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX - track.offsetLeft;
    if (Math.abs(x - touchStartX) > 8) {
      touchMoved = true;
    }
    if (touchMoved) {
      track.scrollLeft = touchScrollStart - (x - touchStartX) * 1.5;
      handleInfiniteBounds();
    }
  }, { passive: true });

  // Navigation Arrows
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const cardWidth = track.children[0] ? track.children[0].offsetWidth + 18 : 240;
      track.scrollLeft -= cardWidth;
      handleInfiniteBounds();
      ensureVideosPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const cardWidth = track.children[0] ? track.children[0].offsetWidth + 18 : 240;
      track.scrollLeft += cardWidth;
      handleInfiniteBounds();
      ensureVideosPlay();
    });
  }

  // Smooth continuous infinite auto-rotation loop (frame-rate independent)
  function step(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    lastTimestamp = timestamp;

    if (autoScrollActive && !isDown) {
      track.scrollLeft += SCROLL_SPEED_PPS * delta;
      const cycle = getCycleWidth();
      if (cycle > 0 && track.scrollLeft >= cycle * 2) {
        track.scrollLeft -= cycle;
      }
    }
    animId = requestAnimationFrame(step);
  }

  // Viewport Observer to play videos and rotate only when in view
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          autoScrollActive = true;
          lastTimestamp = null;
          ensureVideosPlay();
        } else {
          autoScrollActive = false;
        }
      });
    }, { threshold: 0.15 });
    observer.observe(track);
  } else {
    autoScrollActive = true;
  }

  animId = requestAnimationFrame(step);
  ensureVideosPlay();
}

