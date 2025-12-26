// ==========================================================================
// NEOCITIES REDESIGN - app.js
// Theme handling, scroll animations, carousel, and API functions
// ==========================================================================

// ==========================================================================
// THEME HANDLING
// ==========================================================================

const THEME_KEY = 'theme';
const COLOR_KEY = 'color';
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY);
}

function getStoredColor() {
  return localStorage.getItem(COLOR_KEY) || 'cyan';
}

function getInitialTheme() {
  const stored = getStoredTheme();
  if (stored) return stored;
  return prefersDark ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  
  // Update icon
  document.querySelectorAll('.theme-toggle i').forEach(icon => {
    icon.className = theme === 'dark' ? 'bi bi-moon-stars' : 'bi bi-brightness-high';
  });
}

function applyColor(color) {
  document.documentElement.setAttribute('data-color', color);
  localStorage.setItem(COLOR_KEY, color);
  
  // Update active state in color picker
  document.querySelectorAll('.color-option').forEach(option => {
    option.classList.toggle('active', option.dataset.color === color);
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || getInitialTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  
  // Animate the toggle button
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.classList.remove('fade');
    void btn.offsetWidth; // Trigger reflow
    btn.classList.add('fade');
  });
}

// ==========================================================================
// COLOR PICKER
// ==========================================================================

function initColorPicker() {
  const modal = document.querySelector('[data-color-modal]');
  const toggleBtn = document.querySelector('[data-color-picker]');
  const closeBtn = document.querySelector('[data-color-close]');
  const colorOptions = document.querySelectorAll('.color-option');
  
  if (!modal || !toggleBtn) return;
  
  // Open modal
  toggleBtn.addEventListener('click', () => {
    modal.classList.add('active');
  });
  
  // Close modal
  const closeModal = () => {
    modal.classList.remove('active');
  };
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
  
  // Color option selection
  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      const color = option.dataset.color;
      applyColor(color);
      closeModal();
    });
  });
  
  // Apply stored color on load
  const storedColor = getStoredColor();
  applyColor(storedColor);
}

// ==========================================================================
// SCROLL ANIMATIONS (IntersectionObserver)
// ==========================================================================

function initScrollAnimations() {
  const animateElements = document.querySelectorAll('.scroll-animate, .masonry-item, .neo-box');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Add staggered delay based on element position
          const delay = index * 0.05;
          entry.target.style.animationDelay = `${delay}s`;
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    animateElements.forEach(el => {
      // Reset state for animation
      if (!el.classList.contains('animate-in')) {
        observer.observe(el);
      }
    });
  } else {
    // Fallback: just show everything
    animateElements.forEach(el => {
      el.classList.add('animate-in');
    });
  }
}

// Make it globally available for dynamic content
window.initScrollAnimations = initScrollAnimations;

// ==========================================================================
// HEADER CONTROLS
// ==========================================================================

function initHeaderControls() {
  // Theme toggle buttons
  const toggleButtons = document.querySelectorAll('[data-toggle-theme]');
  toggleButtons.forEach(btn => btn.addEventListener('click', toggleTheme));
}

// ==========================================================================
// MOBILE BOTTOM NAV - Highlight Active Page
// ==========================================================================

function initMobileNav() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.mobile-bottom-nav a');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    
    // Check if this link matches the current page
    if (href === './' && (currentPath.endsWith('/') || currentPath.endsWith('index.html'))) {
      link.classList.add('active');
    } else if (href !== './' && currentPath.includes(href.replace('./', ''))) {
      link.classList.add('active');
    }
  });
}

// ==========================================================================
// DATA FETCHERS
// ==========================================================================

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

export async function getAllPosts(type) {
  const root = document.querySelector('#posts');
  if (!root) return;
  
  root.innerHTML = '<div class="loading">Loading...</div>';
  
  try {
    const data = await fetchJSON('https://nijikade-backend.vercel.app/api/post?type=' + encodeURIComponent(type));
    root.innerHTML = '';
    
    (data.posts || []).forEach(year => {
      // Year header
      const yearHeader = document.createElement('div');
      yearHeader.className = 'year-header';
      yearHeader.textContent = year.year;
      root.appendChild(yearHeader);
      
      // Posts for this year
      (year.posts || []).forEach((post, i) => {
        const card = document.createElement('div');
        card.className = 'masonry-item';
        card.style.animationDelay = `${i * 0.1}s`;
        card.innerHTML = `
          <div class="item-header">
            <h3><a href="./post.html?id=${post.id}">${post.title}</a></h3>
          </div>
          <div class="item-content">
            <div class="item-meta">
              <span><i class="bi bi-calendar3"></i> ${post.date}</span>
              <span class="chip">${post.tags || 'No tags'}</span>
            </div>
          </div>
        `;
        root.appendChild(card);
      });
    });
    
    // Trigger scroll animations for new content
    initScrollAnimations();
    
  } catch (e) {
    root.innerHTML = '<div class="neo-box"><div class="neo-content">Failed to load posts. Please try again later.</div></div>';
  }
}

export async function getPost() {
  const titleEl = document.querySelector('#title');
  const contentEl = document.querySelector('#post-content');
  
  if (!titleEl || !contentEl) return;
  
  titleEl.textContent = 'Loading...';
  
  try {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    
    if (!id) {
      window.location.href = './blogs.html';
      return;
    }
    
    const data = await fetchJSON('https://nijikade-backend.vercel.app/api/post/' + encodeURIComponent(id));
    titleEl.textContent = data.data.title;
    contentEl.innerHTML = data.data.content;
    
    // Update page title
    document.title = `${data.data.title} · nijika.de`;
    
  } catch (e) {
    titleEl.textContent = 'Failed to load';
    contentEl.innerHTML = '<p>Could not load the post. Please try again later.</p>';
  }
}

// ==========================================================================
// CAROUSEL
// ==========================================================================

export function initCarousel() {
  const track = document.querySelector('.carousel-track');
  if (!track) return;
  
  const items = Array.from(track.children);
  let index = 0;
  
  function perView() {
    return parseInt(getComputedStyle(track).getPropertyValue('--per-view')) || 3;
  }
  
  function stepWidth() {
    const col = items[0];
    if (!col) return 0;
    return col.getBoundingClientRect().width + parseInt(getComputedStyle(track).getPropertyValue('--gap'));
  }
  
  function maxIndex() {
    return Math.max(0, items.length - perView());
  }
  
  function render() {
    track.style.transform = `translateX(-${index * stepWidth()}px)`;
  }
  
  const nextBtn = document.querySelector('[data-carousel-next]');
  const prevBtn = document.querySelector('[data-carousel-prev]');
  
  function next() {
    index = (index >= maxIndex()) ? 0 : index + 1;
    render();
  }
  
  function prev() {
    index = (index <= 0) ? maxIndex() : index - 1;
    render();
  }
  
  nextBtn?.addEventListener('click', next);
  prevBtn?.addEventListener('click', prev);
  window.addEventListener('resize', render);
  
  // Auto-advance
  let timer = setInterval(next, 5000);
  
  [nextBtn, prevBtn, track].forEach(el => {
    el?.addEventListener('pointerenter', () => clearInterval(timer));
    el?.addEventListener('pointerleave', () => { timer = setInterval(next, 5000); });
  });
  
  render();

  // ==========================================================================
  // HOVER CARD LOGIC (Hardcoded series details)
  // ==========================================================================
  
  const details = {
    mabarai: {
      title: "Mabarai-san wa Boku wo Karitai (Mabarai-san Hunts Me Down)",
      tags: ["Romance", "Comedy", "School Life"],
      status: "Completed",
      rating: "8.18",
      bookmarks: "12.5k",
      desc: "A romcom where the assertive Mabarai-san relentlessly 'hunts' the dense MC with hilarious, sweet moments."
    },
    blacksmith: {
      title: "Kyuutei Kajishi no Shiawase na Nichijou (Happy Daily Life of a Court Blacksmith)",
      tags: ["Fantasy", "Slice of Life", "Work Life"],
      status: "Ongoing",
      rating: "7.93",
      bookmarks: "9.4k",
      desc: "A talented blacksmith finds happiness forging for the court, with wholesome daily-life episodes."
    },
    contract: {
      title: "There Is a Lie in My Contract Marriage",
      tags: ["Romance", "Drama", "Isekai"],
      status: "Ongoing",
      rating: "8.02",
      bookmarks: "21.3k",
      desc: "A contract marriage built on a lie spirals into complicated feelings and hidden agendas."
    },
    kobayashi: {
      title: "Endo and Kobayashi's Live Commentary on the Villainess",
      tags: ["Fantasy", "Romance", "Comedy"],
      status: "Completed",
      rating: "8.35",
      bookmarks: "32.0k",
      desc: "Two students give 'live commentary' to a game world, changing the fate of a misunderstood villainess."
    },
    forcedgf: {
      title: "Bocchi no Boku ni Kyousei Kanojo ga Yattekita",
      tags: ["Romance", "Comedy", "School Life"],
      status: "Ongoing",
      rating: "7.76",
      bookmarks: "6.8k",
      desc: "A loner boy's life turns upside down when a 'forced' girlfriend barges in—cute chaos ensues."
    },
    deathgame: {
      title: "Isekaigaeri no Moto Yuusha... Death Game ni Makikomaremashita",
      tags: ["Action", "Thriller", "Survival"],
      status: "Ongoing",
      rating: "7.68",
      bookmarks: "4.1k",
      desc: "A returned overpowered hero is dragged into a modern death game—old skills, new rules, deadly stakes."
    },
    finalmessage: {
      title: "Okuru Kotoba (Final Message)",
      tags: ["Drama", "One-shot"],
      status: "Completed",
      rating: "7.90",
      bookmarks: "1.2k",
      desc: "A poignant one-shot about the words we leave behind and the people who carry them."
    },
    shigure: {
      title: "Shigure-san Wants to Shine!",
      tags: ["Comedy", "School Life"],
      status: "Ongoing",
      rating: "7.81",
      bookmarks: "3.3k",
      desc: "Shigure wants to stand out—expect antics, earnest growth, and lighthearted fun."
    },
    '80k': {
      title: "Saving 80,000 Gold in Another World for My Retirement",
      tags: ["Fantasy", "Isekai", "Adventure"],
      status: "Ongoing",
      rating: "7.85",
      bookmarks: "29.6k",
      desc: "A resourceful girl exploits two worlds to build a retirement fund—smart and entertaining."
    },
    mmo: {
      title: "Retire Shita Ningyoushi no MMO Kikou Jojishi",
      tags: ["Fantasy", "Adventure", "Game"],
      status: "Ongoing",
      rating: "7.70",
      bookmarks: "1.8k",
      desc: "A retired dollmaker chronicles cozy MMO adventures—crafting and exploration galore."
    }
  };

  const hover = document.getElementById('seriesHover');
  if (!hover) return;
  
  function showHoverCard(e, key) {
    const d = details[key];
    if (!d) return;
    
    hover.innerHTML = `
      <div class="title">${d.title}</div>
      <div class="meta">
        <span>Status: ${d.status}</span>
        <span>Rating: ${d.rating}</span>
        <span>Bookmarks: ${d.bookmarks}</span>
      </div>
      <div class="tags">${(d.tags || []).map(t => `<span class="chip chip-sm">${t}</span>`).join('')}</div>
      <div class="desc">${d.desc}</div>
    `;
    moveHover(e);
    hover.style.display = 'block';
    hover.style.pointerEvents = 'auto';
  }
  
  function moveHover(e) {
    const padding = 20;
    const offsetX = 20;
    const offsetY = 20;
    
    // Position card relative to cursor
    let x = e.clientX + offsetX;
    let y = e.clientY + offsetY;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cardWidth = 340;
    const cardHeight = hover.offsetHeight;
    
    // Flip horizontally if too close to right edge
    if (x + cardWidth > viewportWidth - padding) {
      x = e.clientX - cardWidth - offsetX;
    }
    
    // Flip vertically if too close to bottom edge
    if (y + cardHeight > viewportHeight - padding) {
      y = e.clientY - cardHeight - offsetY;
    }
    
    // Ensure card stays within viewport
    x = Math.max(padding, Math.min(x, viewportWidth - cardWidth - padding));
    y = Math.max(padding, Math.min(y, viewportHeight - cardHeight - padding));
    
    hover.style.left = `${x}px`;
    hover.style.top = `${y}px`;
  }
  
  function hideHoverCard() {
    hover.style.display = 'none';
    hover.style.pointerEvents = 'none';
  }
  
  // Attach hover events to carousel items
  const itemEls = document.querySelectorAll('.carousel-item');
  itemEls.forEach(item => {
    item.addEventListener('mouseenter', (e) => {
      const key = item.getAttribute('data-series');
      showHoverCard(e, key);
    });
    item.addEventListener('mousemove', (e) => {
      if (hover.style.display === 'block') moveHover(e);
    });
    item.addEventListener('mouseleave', (e) => {
      if (!hover.contains(e.relatedTarget)) hideHoverCard();
    });
  });
  
  hover.addEventListener('mouseleave', hideHoverCard);
}

// ==========================================================================
// PAGE INITIALIZATION
// ==========================================================================

function initTheme() {
  applyTheme(getInitialTheme());
  applyColor(getStoredColor());
}

function initPage() {
  initTheme();
  initHeaderControls();
  initColorPicker();
  initMobileNav();
  
  // Initialize scroll animations after a short delay to let content render
  setTimeout(initScrollAnimations, 100);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initPage);

// Re-run animations when window loads (for images etc)
window.addEventListener('load', () => {
  initScrollAnimations();
});
