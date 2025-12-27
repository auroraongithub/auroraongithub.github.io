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
      desc: "A romcom where Mabarai-san (a vampire hunter) relentlessly teases the MC (a vampire)."
    },
    blacksmith: {
      title: "Kyuutei Kajishi no Shiawase na Nichijou (Happy Daily Life of a Court Blacksmith)",
      tags: ["Fantasy", "Slice of Life", "Work Life"],
      status: "Ongoing",
      rating: "7.93",
      bookmarks: "9.4k",
      desc: "A talented blacksmith finds happiness after being picked up by the daughter of a neighboring country."
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
      desc: "A loner boy's life turns upside down when a 'forced' girlfriend temporarily barges in his life."
    },
    deathgame: {
      title: "Isekaigaeri no Moto Yuusha... Death Game ni Makikomaremashita",
      tags: ["Action", "Thriller", "Survival"],
      status: "Ongoing",
      rating: "7.68",
      bookmarks: "4.1k",
      desc: "A returned stupidly overpowered hero is dragged into a modern death game."
    },
    finalmessage: {
      title: "Okuru Kotoba (Final Message)",
      tags: ["Drama", "One-shot"],
      status: "Completed",
      rating: "7.90",
      bookmarks: "1.2k",
      desc: "They say that a spirit sometimes appears on a certain crossing in town. One day, a high school boy named Sahara gets into an accident on that very crossing, causing his and his friends' lives to change forever."
    },
    shigure: {
      title: "Shigure-san Wants to Shine!",
      tags: ["Comedy", "School Life"],
      status: "Ongoing",
      rating: "7.81",
      bookmarks: "3.3k",
      desc: "Two loner seatmates trying their best to 'shine'."
    },
    '80k': {
      title: "Saving 80,000 Gold in Another World for My Retirement",
      tags: ["Fantasy", "Isekai", "Adventure"],
      status: "Ongoing",
      rating: "7.85",
      bookmarks: "29.6k",
      desc: "A resourceful girl exploits two worlds to build a retirement fund."
    },
    mmo: {
      title: "Retire Shita Ningyoushi no MMO Kikou Jojishi",
      tags: ["Fantasy", "Adventure", "Game"],
      status: "Ongoing",
      rating: "7.70",
      bookmarks: "1.8k",
      desc: "A retired top dollmaker with a broken hand learns about a VRMMO and proceeds to play doll pokemon using dolls with egos."
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
  initPetals();
  initStatusStrip();
  initDesktopWidgets();
  initMainWidgets();
  initFavorites();
  initRecentPosts();
  initMoreDrawer();
  initModals();
  initShoutbox();
  initPortfolio();
  
  // Initialize scroll animations after a short delay to let content render
  setTimeout(initScrollAnimations, 100);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initPage);

// Re-run animations when window loads (for images etc)
window.addEventListener('load', () => {
  initScrollAnimations();
});

// ==========================================================================
// FALLING PETALS ANIMATION
// ==========================================================================

function initPetals() {
  const body = document.body;
  body.style.overflowX = 'hidden';
  
  const options = {
    blowAnimations: ['blow-soft-left', 'blow-medium-left', 'blow-soft-right', 'blow-medium-right'],
    className: 'petal',
    fallSpeed: 1,
    maxSize: 14,
    minSize: 10,
    newOn: 300,
    swayAnimations: ['sway-0', 'sway-1', 'sway-2', 'sway-3', 'sway-4', 'sway-5', 'sway-6', 'sway-7', 'sway-8']
  };
  
  let animationId = null;
  
  function randomArrayElem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  function elementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  function createPetal() {
    if (!animationId) return;
    
    setTimeout(() => {
      requestAnimationFrame(createPetal);
    }, options.newOn);
    
    // Get random animations
    const blowAnimation = randomArrayElem(options.blowAnimations);
    const swayAnimation = randomArrayElem(options.swayAnimations);
    const fallTime = ((document.documentElement.clientHeight * 0.007) + Math.round(Math.random() * 5)) * options.fallSpeed;
    
    // Build animation string
    const animations = `fall ${fallTime}s linear 0s 1, ${blowAnimation} ${((fallTime > 30 ? fallTime : 30) - 20) + randomInt(0, 20)}s linear 0s infinite, ${swayAnimation} ${randomInt(2, 4)}s linear 0s infinite`;
    
    // Create petal element
    const petal = document.createElement('div');
    petal.className = options.className;
    
    // Randomize size
    const height = randomInt(options.minSize, options.maxSize);
    const width = height - Math.floor(randomInt(0, options.minSize) / 3);
    
    // Apply styles
    petal.style.animation = animations;
    petal.style.borderRadius = `${randomInt(options.maxSize, options.maxSize + Math.floor(Math.random() * 10))}px ${randomInt(1, Math.floor(width / 4))}px`;
    petal.style.height = `${height}px`;
    petal.style.width = `${width}px`;
    petal.style.left = `${Math.random() * document.documentElement.clientWidth - 100}px`;
    petal.style.marginTop = `${-(Math.floor(Math.random() * 20) + 15)}px`;
    
    // Remove petal when animation ends
    petal.addEventListener('animationend', function(e) {
      if (e.animationName === 'fall' && !elementInViewport(this)) {
        this.remove();
      }
    });
    
    petal.addEventListener('animationiteration', function(e) {
      if ((options.blowAnimations.includes(e.animationName) || options.swayAnimations.includes(e.animationName)) && !elementInViewport(this)) {
        this.remove();
      }
    });
    
    body.appendChild(petal);
  }
  
  // Start the animation
  animationId = requestAnimationFrame(createPetal);
  
  // Store animation ID for potential cleanup
  body.dataset.petalsAnimId = animationId;
}

// ==========================================================================
// STATUS STRIP & WIDGETS
// ==========================================================================

const API_BASE = 'https://nijikade-backend.vercel.app/api';

async function initStatusStrip() {
  const statusStrip = document.getElementById('statusStrip');
  if (!statusStrip) return;
  
  try {
    const res = await fetch(`${API_BASE}/site/status`);
    const data = await res.json();
    
    const feelingEl = document.getElementById('statusFeeling');
    const doingEl = document.getElementById('statusDoing');
    const updatedEl = document.getElementById('statusUpdated');
    const marqueeEl = document.getElementById('marqueeText');
    
    if (feelingEl) feelingEl.textContent = data.feeling || 'Happy';
    if (doingEl) doingEl.textContent = data.doing || 'Vibing';
    if (updatedEl && data.last_updated) {
      const date = new Date(data.last_updated._seconds ? data.last_updated._seconds * 1000 : data.last_updated);
      updatedEl.textContent = date.toLocaleDateString();
    }
    if (marqueeEl) marqueeEl.textContent = data.currently_marquee || 'Welcome to nijika.de! ✨';
  } catch (err) {
    console.error('Failed to load status:', err);
  }
}

// ==========================================================================
// DESKTOP WIDGETS (RIGHT SIDEBAR)
// ==========================================================================

async function initDesktopWidgets() {
  // Load Now widget (sidebar + drawer)
  try {
    const res = await fetch(`${API_BASE}/site/now`);
    const data = await res.json();
    
    // Update sidebar widget
    const workingEl = document.getElementById('widgetWorkingOn');
    const learningEl = document.getElementById('widgetLearning');
    const collabsEl = document.getElementById('widgetCollabs');
    
    if (workingEl) workingEl.textContent = data.working_on || 'Various projects';
    if (learningEl) learningEl.textContent = data.learning || 'New things';
    if (collabsEl) {
      collabsEl.innerHTML = data.open_to_collabs 
        ? '<i class="bi bi-check-circle-fill" style="color: #2ecc71;"></i> Yes!'
        : '<i class="bi bi-x-circle-fill" style="color: #e74c3c;"></i> Not right now';
    }
    
    // Update drawer widget
    const drawerWorkingEl = document.getElementById('drawerWorkingOn');
    const drawerLearningEl = document.getElementById('drawerLearning');
    const drawerCollabsEl = document.getElementById('drawerCollabs');
    
    if (drawerWorkingEl) drawerWorkingEl.textContent = data.working_on || 'Various projects';
    if (drawerLearningEl) drawerLearningEl.textContent = data.learning || 'New things';
    if (drawerCollabsEl) {
      drawerCollabsEl.innerHTML = data.open_to_collabs 
        ? '<i class="bi bi-check-circle-fill" style="color: #2ecc71;"></i> Yes!'
        : '<i class="bi bi-x-circle-fill" style="color: #e74c3c;"></i> Not right now';
    }
  } catch (err) {
    console.error('Failed to load Now widget:', err);
  }
  
  // Load Changelog widget (sidebar + drawer)
  try {
    const res = await fetch(`${API_BASE}/site/changelog?limit=3`);
    const entries = await res.json();
    
    const changelogHTML = !entries.length 
      ? '<p class="loading-small">No updates yet.</p>'
      : entries.map(entry => `
          <div class="changelog-widget-entry ${entry.pinned ? 'pinned' : ''}">
            <div class="date">${entry.date ? new Date(entry.date).toLocaleDateString() : ''}</div>
            ${entry.title ? `<div class="title">${entry.title}</div>` : ''}
            <div class="body">${entry.body}</div>
          </div>
        `).join('');
    
    // Update sidebar widget
    const listEl = document.getElementById('widgetChangelog');
    if (listEl) listEl.innerHTML = changelogHTML;
    
    // Update drawer widget
    const drawerListEl = document.getElementById('drawerChangelog');
    if (drawerListEl) drawerListEl.innerHTML = changelogHTML;
    
  } catch (err) {
    console.error('Failed to load Changelog widget:', err);
  }
  
  // Load Spotify widget (right sidebar)
  try {
    const res = await fetch(`${API_BASE}/site/settings`);
    const data = await res.json();
    
    if (data.spotify_embed_url) {
      const spotifyBox = document.getElementById('widgetSpotifyBox');
      const spotifyFrame = document.getElementById('widgetSpotify');
      
      if (spotifyBox && spotifyFrame) {
        spotifyFrame.src = data.spotify_embed_url;
        spotifyBox.style.display = 'block';
      }
    }
  } catch (err) {
    console.error('Failed to load Spotify widget:', err);
  }
}

// ==========================================================================
// MAIN WIDGETS SECTION (in main content area)
// ==========================================================================

async function initMainWidgets() {
  // Load Stats (for left sidebar)
  try {
    const res = await fetch(`${API_BASE}/site/stats`);
    const data = await res.json();
    
    const projectsEl = document.getElementById('statProjects');
    const postsEl = document.getElementById('statPosts');
    
    if (projectsEl) projectsEl.textContent = data.projects_count || '0';
    if (postsEl) postsEl.textContent = data.posts_count || '0';
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
  
  // Initialize visitor tracking
  initVisitorTracking();
}

// ==========================================================================
// RECENT / PROOF OF LIFE SECTION
// ==========================================================================

async function initRecentPosts() {
  // Load Latest Blogs
  try {
    const res = await fetch(`${API_BASE}/site/posts/latest?type=blog&limit=1`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log('Recent blogs response:', data);
    // Handle both array and { posts: [...] } formats, and check for error response
    const posts = data.error ? [] : (Array.isArray(data) ? data : (data.posts || []));
    const listEl = document.getElementById('recentBlogs');
    
    if (listEl) {
      if (!posts || posts.length === 0) {
        listEl.innerHTML = '<p class="text-muted">No blog posts yet.</p>';
      } else {
        listEl.innerHTML = posts.map(post => `
          <a href="./post.html?id=${post.id}" class="recent-card">
            <div class="title">${post.title}</div>
            <div class="date">${post.date || ''}</div>
            ${post.excerpt ? `<div class="excerpt">${post.excerpt}</div>` : ''}
          </a>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Failed to load recent blogs:', err);
    const listEl = document.getElementById('recentBlogs');
    if (listEl) listEl.innerHTML = '<p class="text-muted">Failed to load</p>';
  }
  
  // Load Latest Stories
  try {
    const res = await fetch(`${API_BASE}/site/posts/latest?type=story&limit=1`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log('Recent stories response:', data);
    // Handle both array and { posts: [...] } formats, and check for error response
    const posts = data.error ? [] : (Array.isArray(data) ? data : (data.posts || []));
    const listEl = document.getElementById('recentStories');
    
    if (listEl) {
      if (!posts || posts.length === 0) {
        listEl.innerHTML = '<p class="text-muted">No stories yet.</p>';
      } else {
        listEl.innerHTML = posts.map(post => `
          <a href="./post.html?id=${post.id}" class="recent-card">
            <div class="title">${post.title}</div>
            <div class="date">${post.date || ''}</div>
            ${post.excerpt ? `<div class="excerpt">${post.excerpt}</div>` : ''}
          </a>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Failed to load recent stories:', err);
    const listEl = document.getElementById('recentStories');
    if (listEl) listEl.innerHTML = '<p class="text-muted">Failed to load</p>';
  }
}

// ==========================================================================
// FAVORITES WIDGET
// ==========================================================================

let currentFavCategory = 'anime';
let favCarouselIndex = 0;

function initFavorites() {
  const track = document.getElementById('favoritesTrack');
  if (!track) return;
  
  // Make switchFavoritesTab available globally
  window.switchFavoritesTab = switchFavoritesTab;
  
  // Setup carousel controls
  setupFavoritesCarousel();
  
  // Load initial category
  loadFavorites('anime');
}

function setupFavoritesCarousel() {
  const prevBtn = document.querySelector('[data-fav-carousel-prev]');
  const nextBtn = document.querySelector('[data-fav-carousel-next]');
  const track = document.getElementById('favoritesTrack');
  
  if (!prevBtn || !nextBtn || !track) return;
  
  prevBtn.addEventListener('click', () => {
    const items = track.querySelectorAll('.carousel-item');
    if (items.length === 0) return;
    
    const perView = getPerView();
    const maxIndex = Math.max(0, items.length - perView);
    
    // Infinite: wrap to end if at start
    favCarouselIndex = (favCarouselIndex <= 0) ? maxIndex : favCarouselIndex - 1;
    updateFavoritesCarousel();
  });
  
  nextBtn.addEventListener('click', () => {
    const items = track.querySelectorAll('.carousel-item');
    if (items.length === 0) return;
    
    const perView = getPerView();
    const maxIndex = Math.max(0, items.length - perView);
    
    // Infinite: wrap to start if at end
    favCarouselIndex = (favCarouselIndex >= maxIndex) ? 0 : favCarouselIndex + 1;
    updateFavoritesCarousel();
  });
  
  // Auto-advance every 5 seconds
  let autoAdvanceTimer = setInterval(() => {
    const items = track.querySelectorAll('.carousel-item');
    if (items.length === 0) return;
    
    const perView = getPerView();
    const maxIndex = Math.max(0, items.length - perView);
    favCarouselIndex = (favCarouselIndex >= maxIndex) ? 0 : favCarouselIndex + 1;
    updateFavoritesCarousel();
  }, 5000);
  
  // Pause on hover
  [prevBtn, nextBtn, track].forEach(el => {
    el?.addEventListener('pointerenter', () => clearInterval(autoAdvanceTimer));
    el?.addEventListener('pointerleave', () => {
      autoAdvanceTimer = setInterval(() => {
        const items = track.querySelectorAll('.carousel-item');
        if (items.length === 0) return;
        
        const perView = getPerView();
        const maxIndex = Math.max(0, items.length - perView);
        favCarouselIndex = (favCarouselIndex >= maxIndex) ? 0 : favCarouselIndex + 1;
        updateFavoritesCarousel();
      }, 5000);
    });
  });
}

function getPerView() {
  if (window.innerWidth <= 500) return 2;
  if (window.innerWidth <= 900) return 3;
  return 5;
}

function updateFavoritesCarousel() {
  const track = document.getElementById('favoritesTrack');
  if (!track) return;
  
  const perView = getPerView();
  const gap = 12;
  const itemWidth = (track.parentElement.offsetWidth - (gap * (perView - 1))) / perView;
  const offset = favCarouselIndex * (itemWidth + gap);
  
  track.style.transform = `translateX(-${offset}px)`;
}

// Update carousel on resize
window.addEventListener('resize', () => {
  const track = document.getElementById('favoritesTrack');
  if (track && track.querySelectorAll('.carousel-item').length > 0) {
    // Clamp index to valid range after resize
    const items = track.querySelectorAll('.carousel-item');
    const perView = getPerView();
    const maxIndex = Math.max(0, items.length - perView);
    favCarouselIndex = Math.min(favCarouselIndex, maxIndex);
    updateFavoritesCarousel();
  }
});

function switchFavoritesTab(category) {
  currentFavCategory = category;
  favCarouselIndex = 0; // Reset carousel position
  
  // Update tab active states
  document.querySelectorAll('.fav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.category === category);
  });
  
  loadFavorites(category);
}

async function loadFavorites(category) {
  const track = document.getElementById('favoritesTrack');
  if (!track) return;
  
  track.innerHTML = '<div class="loading-small" style="grid-column: 1/-1; text-align: center; padding: 40px;">Loading favorites...</div>';
  track.style.transform = 'translateX(0)';
  
  try {
    const res = await fetch(`${API_BASE}/site/favorites?category=${category}`);
    const data = await res.json();
    const items = data.items || [];
    
    if (!items.length) {
      track.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 40px;">No favorites added yet.</p>';
      return;
    }
    
    track.innerHTML = items.map(item => `
      <div class="carousel-item">
        ${item.image 
          ? `<img src="${item.image}" alt="${escapeHtml(item.title)}" onerror="this.outerHTML='<div class=\\'favorite-item-image no-image\\' style=\\'height:180px;display:flex;align-items:center;justify-content:center;\\'><i class=\\'bi bi-image\\'></i></div>'">`
          : `<div class="favorite-item-image no-image" style="height:180px;display:flex;align-items:center;justify-content:center;"><i class="bi bi-image"></i></div>`
        }
        <div class="fav-item-info">
          <div class="fav-item-title">${escapeHtml(item.title)}</div>
          <div class="fav-item-meta">
            ${item.year ? `<span><i class="bi bi-calendar"></i> ${item.year}</span>` : ''}
            ${item.score ? `<span><i class="bi bi-star-fill"></i> ${item.score}</span>` : ''}
          </div>
          ${(item.status && category !== 'characters') ? `<span class="fav-item-status ${item.status}">${formatFavStatus(item.status)}</span>` : ''}
        </div>
      </div>
    `).join('');
    
    // Reset and update carousel
    favCarouselIndex = 0;
    updateFavoritesCarousel();
    
  } catch (err) {
    console.error('Failed to load favorites:', err);
    track.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 40px;">Failed to load favorites.</p>';
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatFavStatus(status) {
  const map = {
    'completed': 'Completed',
    'watching': 'Watching/Playing',
    'plan': 'Plan to Watch',
    'dropped': 'Dropped'
  };
  return map[status] || status;
}

// ==========================================================================
// MORE DRAWER (MOBILE)
// ==========================================================================

function initMoreDrawer() {
  const drawer = document.getElementById('moreDrawer');
  if (!drawer) return;
  
  const toggleBtn = document.querySelector('[data-more-toggle]');
  const closeBtns = document.querySelectorAll('[data-more-close]');
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      drawer.classList.add('active');
    });
  }
  
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      drawer.classList.remove('active');
    });
  });
  
  // Handle drawer link clicks that scroll to sections
  drawer.querySelectorAll('[data-drawer-scroll]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.dataset.drawerScroll;
      const target = document.getElementById(targetId);
      if (target) {
        drawer.classList.remove('active');
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ==========================================================================
// NOW MODAL
// ==========================================================================

function initNowModal() {
  const modal = document.getElementById('nowModal');
  if (!modal) return;
  
  const openBtns = document.querySelectorAll('[data-now-modal]');
  const closeBtns = document.querySelectorAll('[data-now-close]');
  
  openBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      // Close drawer if open
      document.getElementById('moreDrawer')?.classList.remove('active');
      modal.classList.add('active');
      
      // Load data
      try {
        const res = await fetch(`${API_BASE}/site/now`);
        const data = await res.json();
        
        document.getElementById('nowWorkingOn').textContent = data.working_on || 'Various projects';
        document.getElementById('nowLearning').textContent = data.learning || 'New things';
        document.getElementById('nowCollabs').innerHTML = data.open_to_collabs 
          ? '<i class="bi bi-check-circle-fill" style="color: #2ecc71;"></i> Yes!'
          : '<i class="bi bi-x-circle-fill" style="color: #e74c3c;"></i> Not right now';
      } catch (err) {
        console.error('Failed to load now:', err);
      }
    });
  });
  
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => modal.classList.remove('active'));
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal.querySelector('.now-modal-overlay')) {
      modal.classList.remove('active');
    }
  });
}

// ==========================================================================
// CHANGELOG MODAL
// ==========================================================================

function initChangelogModal() {
  const modal = document.getElementById('changelogModal');
  if (!modal) return;
  
  const openBtns = document.querySelectorAll('[data-changelog-modal]');
  const closeBtns = document.querySelectorAll('[data-changelog-close]');
  const listEl = document.getElementById('changelogList');
  
  openBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      // Close drawer if open
      document.getElementById('moreDrawer')?.classList.remove('active');
      modal.classList.add('active');
      
      // Load data
      try {
        const res = await fetch(`${API_BASE}/site/changelog?limit=5`);
        const entries = await res.json();
        
        if (!entries.length) {
          listEl.innerHTML = '<p style="color: var(--text-muted);">No updates yet.</p>';
          return;
        }
        
        listEl.innerHTML = entries.map(entry => `
          <div class="changelog-entry ${entry.pinned ? 'pinned' : ''}">
            <div class="date">${entry.date ? new Date(entry.date).toLocaleDateString() : ''}</div>
            ${entry.title ? `<div class="title">${entry.title}</div>` : ''}
            <div class="body">${entry.body}</div>
          </div>
        `).join('');
      } catch (err) {
        listEl.innerHTML = '<p style="color: red;">Failed to load</p>';
      }
    });
  });
  
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => modal.classList.remove('active'));
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal.querySelector('.changelog-modal-overlay')) {
      modal.classList.remove('active');
    }
  });
}

// ==========================================================================
// INIT ALL MODALS
// ==========================================================================

function initModals() {
  initNowModal();
  initChangelogModal();
}

// ==========================================================================
// VISITOR TRACKING SYSTEM
// ==========================================================================

let visitorEventSource = null;
let sessionId = null;
let heartbeatInterval = null;

function initVisitorTracking() {
  const visitorsEl = document.getElementById('statVisitors');
  const pageviewsEl = document.getElementById('statPageviews');
  
  if (!visitorsEl || !pageviewsEl) return;
  
  // Generate or retrieve session ID
  sessionId = sessionStorage.getItem('visitorSessionId');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('visitorSessionId', sessionId);
  }
  
  // Register visitor and start tracking
  registerVisitor();
  
  // Heartbeat every 25 seconds to keep session alive (expires after 60s of inactivity)
  heartbeatInterval = setInterval(sendHeartbeat, 25000);
  
  // Connect to real-time updates
  connectToVisitorStream();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (visitorEventSource) visitorEventSource.close();
    // Send disconnect signal
    navigator.sendBeacon(`${API_BASE}/site/visitors/disconnect`, JSON.stringify({ sessionId }));
  });
}

function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function registerVisitor() {
  try {
    await fetch(`${API_BASE}/site/visitors/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sessionId,
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct'
      })
    });
  } catch (err) {
    console.error('Failed to register visitor:', err);
  }
}

async function sendHeartbeat() {
  try {
    await fetch(`${API_BASE}/site/visitors/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
  } catch (err) {
    console.error('Heartbeat failed:', err);
  }
}

function connectToVisitorStream() {
  // Use long-polling instead of SSE for better compatibility
  pollVisitorCount();
}

async function pollVisitorCount() {
  try {
    const res = await fetch(`${API_BASE}/site/visitors/stats`);
    const data = await res.json();
    
    const visitorsEl = document.getElementById('statVisitors');
    const pageviewsEl = document.getElementById('statPageviews');
    
    if (visitorsEl) visitorsEl.textContent = data.online || '0';
    if (pageviewsEl) pageviewsEl.textContent = formatNumber(data.total || 0);
    
    // Poll every 10 seconds
    setTimeout(pollVisitorCount, 10000);
  } catch (err) {
    console.error('Failed to fetch visitor stats:', err);
    // Retry after 15 seconds on error
    setTimeout(pollVisitorCount, 15000);
  }
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// ==========================================================================
// SHOUTBOX
// ==========================================================================

let shoutboxUser = null;
let shoutboxColor = '#6de6e2'; // Default to theme primary color
let shoutboxPollTimer = null;

// All shoutbox instances (sidebar, mobile, drawer)
const shoutboxInstances = ['', 'mobile', 'drawer'];

function initShoutbox() {
  // Check if any shoutbox exists
  const hasShoutbox = shoutboxInstances.some(prefix => {
    const id = prefix ? `${prefix}ShoutboxMessages` : 'shoutboxMessages';
    return document.getElementById(id);
  });
  
  if (!hasShoutbox) return;
  
  // Check if user already has a saved username
  const savedUser = localStorage.getItem('shoutboxUser');
  const savedColor = localStorage.getItem('shoutboxColor');
  
  if (savedUser) {
    shoutboxUser = savedUser;
    shoutboxColor = savedColor || '#6de6e2';
    showShoutboxInput();
  } else {
    // Set color picker to theme color on first load for all instances
    shoutboxInstances.forEach(prefix => {
      const colorId = prefix ? `${prefix}ShoutboxColor` : 'shoutboxColor';
      const colorInput = document.getElementById(colorId);
      if (colorInput) colorInput.value = '#6de6e2';
    });
  }
  
  // Load messages
  loadShoutboxMessages();
  
  // Poll for new messages every 5 seconds
  shoutboxPollTimer = setInterval(loadShoutboxMessages, 5000);
  
  // Check admin status on load
  updateAdminButtons(isAdminLoggedIn());
  
  // Make functions globally available
  window.joinShoutbox = joinShoutbox;
  window.changeShoutboxUser = changeShoutboxUser;
  window.sendShoutboxMessage = sendShoutboxMessage;
  window.deleteShoutboxMsg = deleteShoutboxMsg;
  window.toggleAdminMode = toggleAdminMode;
  window.openAdminLogin = openAdminLogin;
  window.closeAdminLogin = closeAdminLogin;
  window.submitAdminLogin = submitAdminLogin;
}

// Check if user is logged in as admin
function isAdminLoggedIn() {
  // Check both sessionStorage (chatbox login) and localStorage (admin panel login)
  return !!(sessionStorage.getItem('jwt') || localStorage.getItem('jwt'));
}

// Get the JWT token from either storage
function getAdminToken() {
  return sessionStorage.getItem('jwt') || localStorage.getItem('jwt');
}

// Open admin login modal
function openAdminLogin() {
  const modal = document.getElementById('adminLoginModal');
  const emailInput = document.getElementById('adminEmail');
  const passwordInput = document.getElementById('adminPassword');
  const errorEl = document.getElementById('adminLoginError');
  
  if (modal) {
    modal.classList.add('active');
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (emailInput) {
      emailInput.focus();
    }
    if (errorEl) errorEl.textContent = '';
  }
}

// Close admin login modal
function closeAdminLogin() {
  const modal = document.getElementById('adminLoginModal');
  if (modal) modal.classList.remove('active');
}

// Submit admin login
async function submitAdminLogin() {
  const emailInput = document.getElementById('adminEmail');
  const passwordInput = document.getElementById('adminPassword');
  const errorEl = document.getElementById('adminLoginError');
  const btn = document.querySelector('.admin-login-btn');
  
  const email = emailInput?.value.trim();
  const password = passwordInput?.value;
  
  if (!email) {
    if (errorEl) errorEl.textContent = 'Please enter your email';
    emailInput?.focus();
    return;
  }
  
  if (!password) {
    if (errorEl) errorEl.textContent = 'Please enter your password';
    passwordInput?.focus();
    return;
  }
  
  if (btn) btn.disabled = true;
  if (errorEl) errorEl.textContent = '';
  
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: email,
        password: password 
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      sessionStorage.setItem('jwt', data.token);
      closeAdminLogin();
      updateAdminButtons(true);
      loadShoutboxMessages();
    } else {
      if (errorEl) errorEl.textContent = 'Invalid password';
    }
  } catch (err) {
    console.error('Login failed:', err);
    if (errorEl) errorEl.textContent = 'Login failed. Please try again.';
  } finally {
    if (btn) btn.disabled = false;
  }
}

// Update admin button appearance
function updateAdminButtons(isAdmin) {
  document.querySelectorAll('.shoutbox-admin-btn').forEach(btn => {
    if (isAdmin) {
      btn.classList.add('active');
      btn.title = 'Logged in as admin (click to logout)';
    } else {
      btn.classList.remove('active');
      btn.title = 'Admin login';
    }
  });
}

// Toggle admin mode
function toggleAdminMode() {
  if (isAdminLoggedIn()) {
    // Log out - clear both storages
    sessionStorage.removeItem('jwt');
    localStorage.removeItem('jwt');
    updateAdminButtons(false);
    loadShoutboxMessages();
  } else {
    // Open login modal
    openAdminLogin();
  }
}

// Delete a shoutbox message (admin only)
async function deleteShoutboxMsg(msgId) {
  if (!isAdminLoggedIn()) {
    openAdminLogin();
    return;
  }
  
  try {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE}/admin/shoutbox/${msgId}?token=${token}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      loadShoutboxMessages();
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.error('Delete failed:', res.status, errorData);
      alert('Failed to delete message: ' + (errorData.error || res.status));
    }
  } catch (err) {
    console.error('Delete failed:', err);
    alert('Failed to delete message: ' + err.message);
  }
}

async function loadShoutboxMessages() {
  const isAdmin = isAdminLoggedIn();
  
  try {
    const res = await fetch(`${API_BASE}/site/shoutbox?limit=30`);
    const data = await res.json();
    const messages = data.messages || [];
    
    const html = !messages.length 
      ? '<div class="shoutbox-empty">No messages yet. Be the first to say hi!</div>'
      : messages.map(msg => {
          const time = new Date(msg.timestamp);
          const timeStr = time.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
          
          return `
            <div class="shoutbox-msg" data-msg-id="${msg.id}">
              <div class="shoutbox-msg-header">
                <span class="shoutbox-msg-user" style="color: ${escapeHtml(msg.color)}">${escapeHtml(msg.username)}</span>
                <span class="shoutbox-msg-time">${timeStr}</span>
                ${isAdmin ? `<button class="shoutbox-delete-btn" onclick="deleteShoutboxMsg('${msg.id}')" title="Delete message"><i class="bi bi-trash"></i></button>` : ''}
              </div>
              <div class="shoutbox-msg-text">${escapeHtml(msg.message)}</div>
            </div>
          `;
        }).join('');
    
    // Update all instances
    shoutboxInstances.forEach(prefix => {
      const id = prefix ? `${prefix}ShoutboxMessages` : 'shoutboxMessages';
      const messagesEl = document.getElementById(id);
      if (messagesEl) {
        messagesEl.innerHTML = html;
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    });
    
  } catch (err) {
    console.error('Failed to load shoutbox:', err);
    shoutboxInstances.forEach(prefix => {
      const id = prefix ? `${prefix}ShoutboxMessages` : 'shoutboxMessages';
      const messagesEl = document.getElementById(id);
      if (messagesEl) {
        messagesEl.innerHTML = '<div class="shoutbox-loading">Failed to load messages</div>';
      }
    });
  }
}

function joinShoutbox(source = '') {
  const prefix = source ? `${source}Shoutbox` : 'shoutbox';
  const usernameInput = document.getElementById(`${prefix}Username`);
  const colorInput = document.getElementById(`${prefix}Color`);
  
  const username = usernameInput?.value.trim();
  if (!username) {
    usernameInput?.focus();
    return;
  }
  
  shoutboxUser = username;
  shoutboxColor = colorInput?.value || '#6de6e2';
  
  // Save to localStorage
  localStorage.setItem('shoutboxUser', shoutboxUser);
  localStorage.setItem('shoutboxColor', shoutboxColor);
  
  showShoutboxInput();
}

function showShoutboxInput() {
  // Update all instances
  shoutboxInstances.forEach(prefix => {
    const setupId = prefix ? `${prefix}ShoutboxSetup` : 'shoutboxSetup';
    const inputId = prefix ? `${prefix}ShoutboxInput` : 'shoutboxInput';
    const userId = prefix ? `${prefix}ShoutboxCurrentUser` : 'shoutboxCurrentUser';
    
    const setupEl = document.getElementById(setupId);
    const inputEl = document.getElementById(inputId);
    const currentUserEl = document.getElementById(userId);
    
    if (setupEl) setupEl.style.display = 'none';
    if (inputEl) inputEl.style.display = 'flex';
    if (currentUserEl) {
      currentUserEl.textContent = shoutboxUser;
      currentUserEl.style.color = shoutboxColor;
    }
  });
}

function changeShoutboxUser(source = '') {
  // Update all instances
  shoutboxInstances.forEach(prefix => {
    const setupId = prefix ? `${prefix}ShoutboxSetup` : 'shoutboxSetup';
    const inputId = prefix ? `${prefix}ShoutboxInput` : 'shoutboxInput';
    const usernameId = prefix ? `${prefix}ShoutboxUsername` : 'shoutboxUsername';
    const colorId = prefix ? `${prefix}ShoutboxColor` : 'shoutboxColor';
    
    const setupEl = document.getElementById(setupId);
    const inputEl = document.getElementById(inputId);
    const usernameInput = document.getElementById(usernameId);
    const colorInput = document.getElementById(colorId);
    
    // Pre-fill current values
    if (usernameInput) usernameInput.value = shoutboxUser || '';
    if (colorInput) colorInput.value = shoutboxColor || '#6de6e2';
    
    if (setupEl) setupEl.style.display = 'flex';
    if (inputEl) inputEl.style.display = 'none';
  });
}

async function sendShoutboxMessage(source = '') {
  const prefix = source ? `${source}Shoutbox` : 'shoutbox';
  const messageInput = document.getElementById(`${prefix}Message`);
  const message = messageInput?.value.trim();
  
  if (!message || !shoutboxUser) return;
  
  // Disable input while sending
  if (messageInput) messageInput.disabled = true;
  
  try {
    const res = await fetch(`${API_BASE}/site/shoutbox`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: shoutboxUser,
        message: message,
        color: shoutboxColor
      })
    });
    
    if (res.ok) {
      // Clear all message inputs
      shoutboxInstances.forEach(p => {
        const msgId = p ? `${p}ShoutboxMessage` : 'shoutboxMessage';
        const input = document.getElementById(msgId);
        if (input) input.value = '';
      });
      // Immediately reload messages
      await loadShoutboxMessages();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to send message');
    }
  } catch (err) {
    console.error('Failed to send message:', err);
    alert('Failed to send message');
  } finally {
    if (messageInput) {
      messageInput.disabled = false;
      messageInput.focus();
    }
  }
}

// ============================================
// Portfolio
// ============================================
let portfolioProjects = [];
let portfolioPage = 0;
const PORTFOLIO_PER_PAGE = 4;

async function initPortfolio() {
  const portfolioGrid = document.querySelector('#portfolioGrid');
  if (!portfolioGrid) return;
  
  // Store original content as fallback
  const fallbackHTML = portfolioGrid.innerHTML;
  
  try {
    portfolioGrid.innerHTML = '<p style="text-align:center;color:var(--text-muted)">Loading projects...</p>';
    
    const res = await fetch(`${API_BASE}/site/projects`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    // Handle both { projects: [...] } and [...] formats
    portfolioProjects = data.error ? [] : (Array.isArray(data) ? data : (data.projects || []));
    
    if (portfolioProjects.length === 0) {
      portfolioGrid.innerHTML = fallbackHTML;
      return;
    }
    
    renderPortfolio();
  } catch (err) {
    console.error('Failed to load portfolio:', err);
    portfolioGrid.innerHTML = fallbackHTML;
  }
}

function renderPortfolio() {
  const portfolioGrid = document.querySelector('#portfolioGrid');
  if (!portfolioGrid) return;
  
  const totalPages = Math.ceil(portfolioProjects.length / PORTFOLIO_PER_PAGE);
  const start = portfolioPage * PORTFOLIO_PER_PAGE;
  const end = start + PORTFOLIO_PER_PAGE;
  const pageProjects = portfolioProjects.slice(start, end);
  
  let html = pageProjects.map(p => `
    <a href="${p.github_url}" class="portfolio-item" target="_blank">
      <h4>${escapeHtml(p.name)}</h4>
      <p>${escapeHtml(p.description || 'No description')}</p>
      <div class="portfolio-meta">
        ${p.language ? `<span class="language">${escapeHtml(p.language)}</span>` : ''}
        <span class="stars">★ ${p.stars || 0}</span>
        <span class="forks">⑂ ${p.forks || 0}</span>
      </div>
    </a>
  `).join('');
  
  // Add pagination if needed
  if (totalPages > 1) {
    html += `
      <div class="portfolio-pagination">
        <button class="btn btn-ghost" onclick="portfolioPrev()" ${portfolioPage === 0 ? 'disabled' : ''}>
          <i class="bi bi-chevron-left"></i> Prev
        </button>
        <span class="page-info">${portfolioPage + 1} / ${totalPages}</span>
        <button class="btn btn-ghost" onclick="portfolioNext()" ${portfolioPage >= totalPages - 1 ? 'disabled' : ''}>
          Next <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    `;
  }
  
  portfolioGrid.innerHTML = html;
}

window.portfolioPrev = function() {
  if (portfolioPage > 0) {
    portfolioPage--;
    renderPortfolio();
  }
};

window.portfolioNext = function() {
  const totalPages = Math.ceil(portfolioProjects.length / PORTFOLIO_PER_PAGE);
  if (portfolioPage < totalPages - 1) {
    portfolioPage++;
    renderPortfolio();
  }
};
