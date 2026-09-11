import { API_BASE, escapeHtml } from './site-api.js';

const ADMIN_USERNAME = 'aurora';
const shoutboxInstances = ['', 'mobile', 'drawer'];
let username = localStorage.getItem('shoutboxUser') || '';
let color = localStorage.getItem('shoutboxColor') || '#6de6e2';
let messages = [];
let channel = null;
let rainbowInterval = null;
let inputRainbowInterval = null;

const emojis = [
  ['encoreexcited', '1899-encoreexcited.png'], ['baizhialert', '2305-baizhialert.png'], ['baizhipat', '2305-baizhipat.png'],
  ['nowords', '27020-nowords.png'], ['cookie', '29913-cookie.png'], ['snicker', '30807-snicker.png'],
  ['suspicious', '34928-suspicious.png'], ['salute', '35744-salute.png'], ['drool', '36175-drool.png'],
  ['desperate', '37802-desperate.png'], ['shades', '38741-shades.png'], ['shrug', '40335-shrug.png'],
  ['lingyangwhat', '4260-lingyangwhat.png'], ['linyangget', '4260-linyangget.png'], ['unamused', '42837-unamused.png'],
  ['goofy', '46615-goofy.png'], ['chixiacry', '4836-chixiacry.png'], ['regret', '58272-regret.png'],
  ['yangyanglove', '5982-yangyanglove.png'], ['argue', '60413-argue.png'], ['yangyanghappy', '6788-yangyanghappy.png'],
  ['think', '69470-think.png'], ['tears', '72467-tears.png'], ['hesitant', '72568-hesitant.png'],
  ['jianxinehe', '7356-jianxinehe.png'], ['scared', '73697-scared.png'], ['yangyangded', '7552-yangyangded.png'],
  ['annoyed', '77556-annoyed.png'], ['fistshake', '77867-fistshake.png'], ['yangyangsus', '7817-yangyangsus.png'],
  ['shy', '7938-shy.png'], ['verinaok', '7973-verinaok.png'], ['yangyangapprove', '8350-yangyangapprove.png'],
  ['plead', '84145-plead.png'], ['laugh', '87893-laugh.png'], ['devious', '9057-devious.png'],
  ['gasp', '9137-gasp.png'], ['baizhiangry', '9174-baizhiangry.png'], ['blank', '91810-blank.png'],
  ['party', '91838-party.png'], ['yangyangstonks', '9288-yangyangstonks.png'], ['thumbsup', '92984-thumbsup.png'],
  ['army', '94610-army.png'], ['beg', '96763-beg.png'], ['zani', '97212-zani.png']
];

function ids(source = '') {
  const prefix = source ? `${source}Shoutbox` : 'shoutbox';
  return {
    messages: `${prefix}Messages`, setup: `${prefix}Setup`, input: `${prefix}Input`,
    username: `${prefix}Username`, color: `${prefix}Color`, currentUser: `${prefix}CurrentUser`, message: `${prefix}Message`,
    emojiButton: `${prefix}EmojiButton`,
    picker: source ? `${source}EmojiPickerContainer` : 'emojiPickerContainer',
    customPicker: source ? `${source}CustomEmojiPicker` : 'customEmojiPicker'
  };
}

function existingSources() {
  return shoutboxInstances.filter((source) => document.getElementById(ids(source).messages));
}

function adminToken() { return sessionStorage.getItem('jwt') || localStorage.getItem('jwt'); }
function isAdmin() { return Boolean(adminToken()); }

function parseEmojis(value) {
  return escapeHtml(value).replace(/:([a-zA-Z0-9_]+):/g, (match, name) => {
    const emoji = emojis.find(([emojiName]) => emojiName === name);
    return emoji ? `<img src="/img/emojis/${emoji[1]}" alt=":${name}:" title=":${name}:" class="chat-emoji">` : match;
  });
}

function timestamp(value) {
  const date = value?._seconds ? new Date(value._seconds * 1000) : new Date(value || Date.now());
  return Number.isNaN(date.valueOf()) ? '' : date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

function render() {
  const admin = isAdmin();
  const html = messages.length ? messages.map((message) => {
    const adminMessage = Boolean(message.isAdmin);
    const user = escapeHtml(message.username || 'anon');
    const userStyle = adminMessage ? '' : `style="color:${escapeHtml(message.color || '#6de6e2')}"`;
    return `<div class="shoutbox-msg" data-msg-id="${escapeHtml(message.id || '')}"><div class="shoutbox-msg-header"><span class="${adminMessage ? 'shoutbox-msg-user admin-rainbow' : 'shoutbox-msg-user'}" ${userStyle} data-username="${user}">${adminMessage ? '<i class="bi bi-star-fill admin-icon"></i> ' : ''}${user}</span><span class="shoutbox-msg-time">${timestamp(message.timestamp)}</span>${admin ? `<button class="shoutbox-delete-btn" onclick="deleteShoutboxMsg('${escapeHtml(message.id || '')}')" title="Delete message"><i class="bi bi-trash"></i></button>` : ''}</div><div class="shoutbox-msg-text">${parseEmojis(message.message || '')}</div></div>`;
  }).join('') : '<div class="shoutbox-empty">No messages yet. Be the first to say hi!</div>';

  existingSources().forEach((source) => {
    const root = document.getElementById(ids(source).messages);
    root.innerHTML = html;
    root.scrollTop = root.scrollHeight;
  });
  startRainbowAnimation();
}

const rainbowColors = ['#ff0000', '#ff5500', '#ffaa00', '#ffff00', '#aaff00', '#55ff00', '#00ff00', '#00ff55', '#00ffaa', '#00ffff', '#00aaff', '#0055ff', '#0000ff', '#5500ff', '#aa00ff', '#ff00ff', '#ff00aa', '#ff0055'];

function startRainbowAnimation() {
  if (rainbowInterval) clearInterval(rainbowInterval);
  let index = 0;
  rainbowInterval = setInterval(() => {
    document.querySelectorAll('.admin-rainbow').forEach((element) => {
      const value = element.dataset.username || ADMIN_USERNAME;
      element.innerHTML = `<i class="bi bi-star-fill admin-icon"></i> ${[...value].map((char, offset) => `<span style="color:${rainbowColors[(offset + index) % rainbowColors.length]};text-shadow:${rainbowColors[(offset + index) % rainbowColors.length]} 0 0 3px">${char}</span>`).join('')}`;
    });
    index += 1;
  }, 100);
}

function startInputRainbowAnimation() {
  if (inputRainbowInterval) clearInterval(inputRainbowInterval);
  let index = 0;
  inputRainbowInterval = setInterval(() => {
    document.querySelectorAll('.admin-rainbow-input').forEach((element) => {
      const value = element.dataset.username || ADMIN_USERNAME;
      element.innerHTML = [...value].map((char, offset) => `<span style="color:${rainbowColors[(offset + index) % rainbowColors.length]};text-shadow:${rainbowColors[(offset + index) % rainbowColors.length]} 0 0 3px">${char}</span>`).join('');
    });
    index += 1;
  }, 100);
}

function showInput() {
  const admin = isAdmin();
  if (admin && username.toLowerCase() !== ADMIN_USERNAME) {
    username = ADMIN_USERNAME;
    localStorage.setItem('shoutboxUser', username);
  }
  shoutboxInstances.forEach((source) => {
    const current = ids(source);
    const setup = document.getElementById(current.setup);
    const input = document.getElementById(current.input);
    const user = document.getElementById(current.currentUser);
    if (!setup && !input) return;
    if (username) {
      if (setup) setup.style.display = 'none';
      if (input) input.style.display = 'flex';
      if (user) {
        user.dataset.username = username;
        if (admin && username.toLowerCase() === ADMIN_USERNAME) {
          user.classList.add('admin-rainbow-input');
          startInputRainbowAnimation();
        } else {
          user.classList.remove('admin-rainbow-input');
          user.textContent = username;
          user.style.color = color;
        }
      }
    } else {
      if (setup) setup.style.display = '';
      if (input) input.style.display = 'none';
    }
  });
}

window.joinShoutbox = (source = '') => {
  const current = ids(source);
  const nameInput = document.getElementById(current.username);
  username = nameInput?.value.trim() || '';
  color = document.getElementById(current.color)?.value || '#6de6e2';
  if (!username) return nameInput?.focus();
  localStorage.setItem('shoutboxUser', username);
  localStorage.setItem('shoutboxColor', color);
  showInput();
};

window.changeShoutboxUser = () => {
  shoutboxInstances.forEach((source) => {
    const current = ids(source);
    const setup = document.getElementById(current.setup);
    const input = document.getElementById(current.input);
    const nameInput = document.getElementById(current.username);
    const colorInput = document.getElementById(current.color);
    if (nameInput) nameInput.value = username;
    if (colorInput) colorInput.value = color;
    if (setup) setup.style.display = '';
    if (input) input.style.display = 'none';
  });
};

window.sendShoutboxMessage = async (source = '') => {
  const current = ids(source);
  const input = document.getElementById(current.message);
  const message = input?.value.trim();
  if (!message || !username) return;
  if (input) input.disabled = true;
  closeEmojiPickers();
  try {
    const response = await fetch(`${API_BASE}/site/shoutbox`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, message, color, isAdmin: isAdmin() && username.toLowerCase() === ADMIN_USERNAME }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to send message');
    shoutboxInstances.forEach((instance) => {
      const target = document.getElementById(ids(instance).message);
      if (target) target.value = '';
    });
    if (data.message) {
      if (channel) channel.publish('message', data.message);
      else { messages.push(data.message); render(); }
    }
  } catch (error) {
    alert(error.message || 'Failed to send message');
  } finally {
    if (input) { input.disabled = false; input.focus(); }
  }
};

window.deleteShoutboxMsg = async (id) => {
  const token = adminToken();
  if (!token) return window.toggleAdminMode();
  const response = await fetch(`${API_BASE}/admin/shoutbox/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`, { method: 'DELETE' });
  if (!response.ok) return alert('Failed to delete message');
  messages = messages.filter((message) => String(message.id) !== String(id));
  render();
  channel?.publish('delete', { id });
};

window.openAdminLogin = () => document.getElementById('adminLoginModal')?.classList.add('active');
window.closeAdminLogin = () => document.getElementById('adminLoginModal')?.classList.remove('active');
window.toggleAdminMode = () => {
  if (isAdmin()) {
    sessionStorage.removeItem('jwt');
    localStorage.removeItem('jwt');
    document.querySelectorAll('.shoutbox-admin-btn').forEach((button) => { button.classList.remove('active'); button.title = 'Admin login'; });
    render();
  } else window.openAdminLogin();
};
window.submitAdminLogin = async () => {
  const email = document.getElementById('adminEmail')?.value.trim();
  const password = document.getElementById('adminPassword')?.value || '';
  const error = document.getElementById('adminLoginError');
  try {
    const response = await fetch(`${API_BASE}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Invalid credentials');
    sessionStorage.setItem('jwt', data.token);
    username = ADMIN_USERNAME;
    localStorage.setItem('shoutboxUser', username);
    document.querySelectorAll('.shoutbox-admin-btn').forEach((button) => { button.classList.add('active'); button.title = 'Logged in as admin (click to logout)'; });
    window.closeAdminLogin();
    showInput();
    render();
  } catch (err) {
    if (error) error.textContent = err.message || 'Login failed';
  }
};

function closeEmojiPickers() {
  shoutboxInstances.forEach((source) => {
    const current = ids(source);
    const picker = document.getElementById(current.picker);
    const button = document.getElementById(current.emojiButton);
    if (picker) {
      picker.style.display = 'none';
      picker.style.visibility = '';
      picker.dataset.open = 'false';
    }
    button?.setAttribute('aria-expanded', 'false');
  });
}

function positionEmojiPicker(picker, button) {
  picker.style.display = 'block';
  picker.style.visibility = 'hidden';

  const buttonRect = button.getBoundingClientRect();
  const pickerWidth = picker.offsetWidth;
  const pickerHeight = picker.offsetHeight;
  const margin = 8;
  const maxLeft = Math.max(margin, window.innerWidth - pickerWidth - margin);
  const left = Math.min(Math.max(margin, buttonRect.right - pickerWidth), maxLeft);
  let top = buttonRect.top - pickerHeight - margin;

  if (top < margin) {
    top = Math.min(buttonRect.bottom + margin, Math.max(margin, window.innerHeight - pickerHeight - margin));
  }

  picker.style.left = `${Math.round(left)}px`;
  picker.style.top = `${Math.round(top)}px`;
  picker.style.visibility = 'visible';
}

window.toggleEmojiPicker = (source = '') => {
  const current = ids(source);
  const picker = document.getElementById(current.picker);
  const button = document.getElementById(current.emojiButton);
  if (!picker || !button) return;

  if (picker.dataset.open === 'true') {
    closeEmojiPickers();
    return;
  }

  closeEmojiPickers();
  positionEmojiPicker(picker, button);
  picker.dataset.open = 'true';
  button.setAttribute('aria-expanded', 'true');
};

function setupEmojiPickers() {
  shoutboxInstances.forEach((source) => {
    const current = ids(source);
    const picker = document.getElementById(current.customPicker);
    const container = document.getElementById(current.picker);
    if (!picker || !container) return;
    if (container.parentElement !== document.body) document.body.appendChild(container);
    container.dataset.open = 'false';
    picker.innerHTML = emojis.map(([name, file]) => `<img src="/img/emojis/${file}" alt=":${name}:" title=":${name}:" class="custom-emoji-option" data-code=":${name}:">`).join('');
    picker.addEventListener('click', (event) => {
      const target = event.target.closest('[data-code]');
      const input = document.getElementById(current.message);
      if (!target || !input) return;
      const start = input.selectionStart || input.value.length;
      const end = input.selectionEnd || start;
      input.value = `${input.value.slice(0, start)}${target.dataset.code}${input.value.slice(end)}`;
      input.selectionStart = input.selectionEnd = start + target.dataset.code.length;
      input.focus();
      closeEmojiPickers();
    });
  });

  if (!document.documentElement.dataset.emojiPickerEventsBound) {
    document.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest('.emoji-picker-container, .shoutbox-emoji-btn')) return;
      closeEmojiPickers();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeEmojiPickers();
    });
    window.addEventListener('resize', closeEmojiPickers);
    window.addEventListener('scroll', closeEmojiPickers, true);
    document.documentElement.dataset.emojiPickerEventsBound = 'true';
  }
}

async function loadHistory() {
  try {
    const response = await fetch(`${API_BASE}/site/shoutbox?limit=30`);
    const data = await response.json();
    messages = data.messages || [];
    render();
  } catch (error) {
    console.warn('Chat history unavailable', error);
    existingSources().forEach((source) => {
      const root = document.getElementById(ids(source).messages);
      root.innerHTML = '<div class="shoutbox-loading">Failed to load messages</div>';
    });
  }
}

function initRealtime() {
  if (!window.Ably) return;
  try {
    const client = new window.Ably.Realtime('n02Veg.q8RTcA:dGXZAbNs4sibJ6mTELpZoUhT5ZdGqvW_1LH6aPdnmMs');
    channel = client.channels.get('nijikade-chat');
    channel.subscribe('message', ({ data }) => {
      if (data && !messages.some((message) => message.id && data.id && String(message.id) === String(data.id))) { messages.push(data); render(); }
    });
    channel.subscribe('delete', ({ data }) => { messages = messages.filter((message) => String(message.id) !== String(data?.id)); render(); });
  } catch (error) { console.warn('Realtime chat unavailable', error); }
}

async function initChat() {
  if (!existingSources().length) return;
  showInput();
  setupEmojiPickers();
  document.querySelectorAll('.shoutbox-admin-btn').forEach((button) => { if (isAdmin()) { button.classList.add('active'); button.title = 'Logged in as admin (click to logout)'; } });
  await loadHistory();
  initRealtime();
}

document.addEventListener('DOMContentLoaded', initChat, { once: true });
