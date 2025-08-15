import '../assets/app.js';

const form = document.querySelector('#loginForm');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) { alert('Fill all the fields'); return; }
  try {
    const res = await fetch('https://nijikade-backend.vercel.app/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('jwt', data.token);
    alert('Logged in successfully');
    window.location.href = './blogs.html';
  } catch (err) {
    alert(err.message || 'An error occurred');
  }
});


