// Theme handling
const THEME_KEY = 'theme';
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY);
}

function getInitialTheme() {
  return getStoredTheme() || (prefersDark ? 'dark' : 'dark'); // default to dark
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const next = (localStorage.getItem(THEME_KEY) || getInitialTheme()) === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  document.querySelectorAll('.theme-toggle').forEach(b=>{
    b.classList.remove('fade');
    // trigger reflow
    void b.offsetWidth;
    b.classList.add('fade');
  });
}

// Mobile menu
function toggleMobileMenu() {
  const menu = document.querySelector('.mobile-menu');
  if (!menu) return;
  const isOpen = menu.style.display === 'block';
  menu.style.display = isOpen ? 'none' : 'block';
}

// Wire up header controls on each page
function initHeaderControls() {
  const toggleButtons = document.querySelectorAll('[data-toggle-theme]');
  toggleButtons.forEach(btn => btn.addEventListener('click', toggleTheme));

  const burgers = document.querySelectorAll('[data-toggle-menu]');
  burgers.forEach(btn => btn.addEventListener('click', toggleMobileMenu));
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    const menu = document.querySelector('.mobile-menu');
    const burger = document.querySelector('[data-toggle-menu]');
    if (!menu || !burger) return;
    const clickInside = menu.contains(e.target) || burger.contains(e.target);
    if (!clickInside) menu.style.display = 'none';
  });
}

// Data fetchers
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

export async function getAllPosts(type) {
  const root = document.querySelector('#posts');
  if (!root) return;
  root.innerHTML = 'Loading...';
  try {
    const data = await fetchJSON('https://nijikade-backend.vercel.app/api/post?type=' + encodeURIComponent(type));
    root.innerHTML = '';
    (data.posts || []).forEach(year => {
      const yearTitle = document.createElement('h3');
      yearTitle.textContent = year.year;
      root.appendChild(yearTitle);
      (year.posts || []).forEach(post => {
        const item = document.createElement('div');
        item.className = 'post-item';
        item.innerHTML = `
          <a class="link" href="./post.html?id=${post.id}">${post.title}</a>
          <div class="post-meta"><span>${post.date}</span><span class="chip">${post.tags || 'No tags'}</span></div>
        `;
        root.appendChild(item);
      });
    });
  } catch (e) {
    root.textContent = 'Failed to load posts.';
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
    if (!id) { window.location.href = './blogs.html'; return; }
    const data = await fetchJSON('https://nijikade-backend.vercel.app/api/post/' + encodeURIComponent(id));
    titleEl.textContent = data.data.title;
    contentEl.innerHTML = data.data.content;
  } catch (e) {
    titleEl.textContent = 'Failed to load';
    contentEl.textContent = '';
  }
}

// Slides
let slideIndex = 0;
export function initCarousel() {
  const track = document.querySelector('.carousel-track');
  if (!track) return;
  const items = Array.from(track.children);
  let index = 0;
  function perView() { return parseInt(getComputedStyle(track).getPropertyValue('--per-view')) || 3; }
  function stepWidth() {
    const col = items[0];
    if (!col) return 0;
    return col.getBoundingClientRect().width + parseInt(getComputedStyle(track).getPropertyValue('--gap'));
  }
  function maxIndex() { return Math.max(0, items.length - perView()); }
  function render() { track.style.transform = `translateX(-${index * stepWidth()}px)`; }
  const nextBtn = document.querySelector('[data-carousel-next]');
  const prevBtn = document.querySelector('[data-carousel-prev]');
  function next() { index = (index >= maxIndex()) ? 0 : index + 1; render(); }
  function prev() { index = (index <= 0) ? maxIndex() : index - 1; render(); }
  nextBtn?.addEventListener('click', next);
  prevBtn?.addEventListener('click', prev);
  window.addEventListener('resize', render);
  // auto-advance
  let timer = setInterval(next, 5000);
  [nextBtn, prevBtn, track].forEach(el => el?.addEventListener('pointerenter', ()=>{ clearInterval(timer); }));
  [nextBtn, prevBtn, track].forEach(el => el?.addEventListener('pointerleave', ()=>{ timer = setInterval(next, 5000); }));
  render();

  // Hover card logic (hardcoded series details)
  const details = {
    // NOTE: All info below is hardcoded snapshots from the time of writing; update as needed.
    mabarai: {
      title: "Mabarai-san wa Boku wo Karitai (Mabarai-san Hunts Me Down)",
      tags: ["Romance","Comedy","School Life"],
      status: "Completed",
      rating: "8.18",
      bookmarks: "12.5k",
      desc: "A romcom where the assertive Mabarai-san relentlessly ‘hunts’ the dense MC with hilarious, sweet moments.",
      link: "https://mangadex.org/title/4db9c1e8-243b-4f73-95e8-ea29f632f456/mabarai-san-wa-boku-wo-karitai"
    },
    blacksmith: {
      title: "Kyuutei Kajishi no Shiawase na Nichijou (Happy Daily Life of a Court Blacksmith)",
      tags: ["Fantasy","Slice of Life","Work Life"],
      status: "Ongoing",
      rating: "7.93",
      bookmarks: "9.4k",
      desc: "A talented blacksmith finds happiness forging for the court, with wholesome daily-life episodes.",
      link: "https://mangadex.org/title/4bdeff13-b1fb-4fd8-9a9f-56d2d885c2c7/kyuutei-kajishi-no-shiawase-na-nichijou-black-na-shokuba-wo-tsuihou-saretaga-ringoku-de-koushaku"
    },
    contract: {
      title: "There Is a Lie in My Contract Marriage",
      tags: ["Romance","Drama","Isekai"],
      status: "Ongoing",
      rating: "8.02",
      bookmarks: "21.3k",
      desc: "A contract marriage built on a lie spirals into complicated feelings and hidden agendas.",
      link: "https://mangadex.org/title/72fe5a3b-a69b-4f74-af4e-9d679b28b750/there-is-a-lie-in-my-contract-marriage"
    },
    kobayashi: {
      title: "Endo and Kobayashi's Live Commentary on the Villainess",
      tags: ["Fantasy","Romance","Comedy"],
      status: "Completed",
      rating: "8.35",
      bookmarks: "32.0k",
      desc: "Two students give ‘live commentary’ to a game world, changing the fate of a misunderstood villainess.",
      link: "https://mangadex.org/title/a944aace-6f03-4298-b864-aee895acab28/endo-and-kobayashi-s-live-commentary-on-the-villainess"
    },
    forcedgf: {
      title: "Bocchi no Boku ni Kyousei Kanojo ga Yattekita",
      tags: ["Romance","Comedy","School Life"],
      status: "Ongoing",
      rating: "7.76",
      bookmarks: "6.8k",
      desc: "A loner boy’s life turns upside down when a ‘forced’ girlfriend barges in—cute chaos ensues.",
      link: "https://mangadex.org/title/fc7e628c-6c26-497a-b17d-dfea90b44652/bocchi-no-boku-ni-kyousei-kanojo-ga-yattekita"
    },
    deathgame: {
      title: "Isekaigaeri no Moto Yuusha... Death Game ni Makikomaremashita",
      tags: ["Action","Thriller","Survival"],
      status: "Ongoing",
      rating: "7.68",
      bookmarks: "4.1k",
      desc: "A returned overpowered hero is dragged into a modern death game—old skills, new rules, deadly stakes.",
      link: "https://mangadex.org/title/720466f8-2eee-43a5-893b-67f9190c04ae/isekaigaeri-no-moto-yuusha-desuga-death-game-ni-makikomare-mashita"
    },
    finalmessage: {
      title: "Okuru Kotoba (Final Message)",
      tags: ["Drama","One-shot"],
      status: "Completed",
      rating: "7.90",
      bookmarks: "1.2k",
      desc: "A poignant one-shot about the words we leave behind and the people who carry them.",
      link: "https://mangadex.org/title/d21daa0a-0abc-45c4-b9b1-d3456ba884d5/okuru-kotoba"
    },
    shigure: {
      title: "Shigure-san Wants to Shine!",
      tags: ["Comedy","School Life"],
      status: "Ongoing",
      rating: "7.81",
      bookmarks: "3.3k",
      desc: "Shigure wants to stand out—expect antics, earnest growth, and lighthearted fun.",
      link: "https://mangadex.org/title/a476ce7f-2fb8-4f6f-8337-fa62ce5034fb/shigure-san-wants-to-shine"
    },
    '80k': {
      title: "Saving 80,000 Gold in Another World for My Retirement",
      tags: ["Fantasy","Isekai","Adventure"],
      status: "Ongoing",
      rating: "7.85",
      bookmarks: "29.6k",
      desc: "A resourceful girl exploits two worlds to build a retirement fund—smart and entertaining.",
      link: "https://mangadex.org/title/89ed3ec2-ebe6-4d6b-92eb-d753a8bb365e/saving-80-000-gold-in-another-world-for-my-retirement"
    },
    mmo: {
      title: "Retire Shita Ningyoushi no MMO Kikou Jojishi",
      tags: ["Fantasy","Adventure","Game"],
      status: "Ongoing",
      rating: "7.70",
      bookmarks: "1.8k",
      desc: "A retired dollmaker chronicles cozy MMO adventures—crafting and exploration galore.",
      link: "https://mangadex.org/title/b5ef1317-7c35-411a-b33b-f588c2f76940/retire-shita-ningyoushi-no-mmo-kikou-jojishi"
    }
  };

  const hover = document.getElementById('seriesHover');
  function showHoverCard(e, key) {
    const d = details[key];
    if (!d) return;
    hover.innerHTML = `
      <div class="title">${d.title}</div>
      <div class="meta"><span>Status: ${d.status}</span><span>Rating: ${d.rating}</span><span>Bookmarks: ${d.bookmarks}</span></div>
      <div class="tags">${(d.tags||[]).map(t=>`<span class="chip-sm">${t}</span>`).join('')}</div>
      <div class="desc">${d.desc}</div>
    `;
    moveHover(e);
    hover.style.display = 'block';
  }
  function moveHover(e) {
    const padding = 12;
    const x = Math.min(window.innerWidth - (hover.offsetWidth + padding), Math.max(padding, e.clientX + 16));
    const y = Math.min(window.innerHeight - (hover.offsetHeight + padding), Math.max(padding, e.clientY + 16));
    hover.style.left = `${x}px`;
    hover.style.top = `${y}px`;
  }
  function hideHoverCard() { hover.style.display = 'none'; }
  // Follow mouse while hovering a cover; keep open when hovering the card
  const itemEls = document.querySelectorAll('.carousel-item');
  itemEls.forEach(item => {
    let active = false;
    item.addEventListener('mouseenter', (e) => {
      const key = item.getAttribute('data-series');
      active = true;
      showHoverCard(e, key);
    });
    item.addEventListener('mousemove', (e) => {
      if (hover.style.display === 'block') moveHover(e);
    });
    item.addEventListener('mouseleave', (e) => {
      active = false;
      if (!hover.contains(e.relatedTarget)) hideHoverCard();
    });
  });
  hover.addEventListener('mouseleave', hideHoverCard);
}

// Page init
function initTheme() { applyTheme(getInitialTheme()); }

function initPage() {
  initTheme();
  initHeaderControls();
}

document.addEventListener('DOMContentLoaded', initPage);


