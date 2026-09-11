import { API_BASE, escapeHtml } from './site-api.js';

const ADMIN_USERNAME = 'aurora';
let username = localStorage.getItem('shoutboxUser') || '';
let color = localStorage.getItem('shoutboxColor') || '#6de6e2';
let messages = [];
let channel = null;

const emojis = {
  laugh: '87893-laugh.png', party: '91838-party.png', thumbs_up: '92984-thumbsup.png', plead: '84145-plead.png',
  scared: '73697-scared.png', shrug: '40335-shrug.png', think: '69470-think.png', salute: '35744-salute.png',
  suspicious: '34928-suspicious.png', tears: '72467-tears.png', blank: '91810-blank.png', gasp: '9137-gasp.png'
};

function adminToken() { return sessionStorage.getItem('jwt') || localStorage.getItem('jwt'); }
function isAdmin() { return Boolean(adminToken()); }

function parseEmojis(value) {
  return escapeHtml(value).replace(/:([a-zA-Z0-9_]+):/g, (match, name) => emojis[name] ? `<img src="/img/emojis/${emojis[name]}" alt=":${name}:" class="chat-emoji">` : match);
}

function timestamp(value) {
  const date = value?._seconds ? new Date(value._seconds * 1000) : new Date(value || Date.now());
  return Number.isNaN(date.valueOf()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function render() {
  const root = document.getElementById('shoutboxMessages');
  if (!root) return;
  root.innerHTML = messages.map((message) => {
    const adminMessage = Boolean(message.isAdmin) || String(message.username || '').toLowerCase() === ADMIN_USERNAME;
    const userStyle = adminMessage ? '' : `style="color:${escapeHtml(message.color || '#6de6e2')}"`;
    return `<div class="shoutbox-msg" data-msg-id="${escapeHtml(message.id || '')}"><div class="shoutbox-msg-header"><span class="${adminMessage ? 'shoutbox-msg-user admin-rainbow' : 'shoutbox-msg-user'}" ${userStyle}>${adminMessage ? '<i class="bi bi-star-fill admin-icon"></i> ' : ''}${escapeHtml(message.username || 'anon')}</span><span class="shoutbox-msg-time">${timestamp(message.timestamp)}</span>${isAdmin() ? `<button class="shoutbox-delete-btn" onclick="deleteShoutboxMsg('${escapeHtml(message.id || '')}')" title="Delete message"><i class="bi bi-trash"></i></button>` : ''}</div><div class="shoutbox-msg-text">${parseEmojis(message.message || '')}</div></div>`;
  }).join('') || '<div class="shoutbox-loading">No messages yet.</div>';
  root.scrollTop = root.scrollHeight;
}

function showInput() {
  const setup = document.getElementById('shoutboxSetup');
  const input = document.getElementById('shoutboxInput');
  if (username) {
    if (setup) setup.style.display = 'none';
    if (input) input.style.display = 'flex';
    const label = document.getElementById('shoutboxCurrentUser');
    if (label) { label.textContent = username; label.style.color = color; }
  } else {
    if (setup) setup.style.display = '';
    if (input) input.style.display = 'none';
  }
}

window.joinShoutbox = () => {
  const input = document.getElementById('shoutboxUsername');
  username = input?.value.trim() || '';
  color = document.getElementById('shoutboxColor')?.value || '#6de6e2';
  if (!username) return input?.focus();
  localStorage.setItem('shoutboxUser', username);
  localStorage.setItem('shoutboxColor', color);
  showInput();
};

window.changeShoutboxUser = () => {
  const setup = document.getElementById('shoutboxSetup');
  const input = document.getElementById('shoutboxInput');
  const nameInput = document.getElementById('shoutboxUsername');
  if (nameInput) nameInput.value = username;
  if (setup) setup.style.display = '';
  if (input) input.style.display = 'none';
};

window.sendShoutboxMessage = async () => {
  const input = document.getElementById('shoutboxMessage');
  const message = input?.value.trim();
  if (!message || !username) return;
  input.disabled = true;
  try {
    const response = await fetch(`${API_BASE}/site/shoutbox`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, message, color, isAdmin: isAdmin() && username.toLowerCase() === ADMIN_USERNAME }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to send message');
    input.value = '';
    if (data.message) {
      if (channel) channel.publish('message', data.message);
      else { messages.push(data.message); render(); }
    }
  } catch (error) {
    alert(error.message || 'Failed to send message');
  } finally {
    input.disabled = false;
    input.focus();
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
    window.closeAdminLogin();
    showInput();
    render();
  } catch (err) {
    if (error) error.textContent = err.message || 'Login failed';
  }
};

window.toggleEmojiPicker = () => {
  const container = document.getElementById('emojiPickerContainer');
  if (!container) return;
  container.style.display = container.style.display === 'none' ? 'block' : 'none';
};

function setupEmojiPicker() {
  const picker = document.getElementById('customEmojiPicker');
  if (!picker) return;
  picker.innerHTML = Object.entries(emojis).map(([name, file]) => `<img src="/img/emojis/${file}" alt=":${name}:" title=":${name}:" class="custom-emoji-option" data-code=":${name}:">`).join('');
  picker.addEventListener('click', (event) => {
    const target = event.target.closest('[data-code]');
    const input = document.getElementById('shoutboxMessage');
    if (!target || !input) return;
    input.value += target.dataset.code;
    input.focus();
    document.getElementById('emojiPickerContainer').style.display = 'none';
  });
}

async function loadHistory() {
  try {
    const response = await fetch(`${API_BASE}/site/shoutbox?limit=30`);
    const data = await response.json();
    messages = data.messages || [];
    render();
  } catch (error) {
    console.warn('Chat history unavailable', error);
  }
}

function initRealtime() {
  if (!window.Ably) return;
  try {
    const client = new window.Ably.Realtime('n02Veg.q8RTcA:dGXZAbNs4sibJ6mTELpZoUhT5ZdGqvW_1LH6aPdnmMs');
    channel = client.channels.get('nijikade-chat');
    channel.subscribe('message', ({ data }) => {
      if (!data) return;
      const exists = messages.some((message) => message.id && data.id && String(message.id) === String(data.id));
      if (!exists) { messages.push(data); render(); }
    });
    channel.subscribe('delete', ({ data }) => {
      messages = messages.filter((message) => String(message.id) !== String(data?.id));
      render();
    });
  } catch (error) {
    console.warn('Realtime chat unavailable', error);
  }
}

async function initChat() {
  if (!document.getElementById('shoutboxMessages')) return;
  showInput();
  setupEmojiPicker();
  await loadHistory();
  initRealtime();
}

document.addEventListener('DOMContentLoaded', initChat, { once: true });
