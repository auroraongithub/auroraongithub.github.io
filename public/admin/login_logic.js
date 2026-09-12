import '../assets/app.js';

const form = document.querySelector('#loginForm');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const submitButton = form?.querySelector('button[type="submit"]');
const status = document.querySelector('#loginStatus');

function setStatus(message = '', state = '') {
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state;
}

function setFieldError(input, hasError) {
  if (!input) return;
  input.setAttribute('aria-invalid', String(hasError));
  input.closest('.login-input-wrap')?.classList.toggle('has-error', hasError);
}

emailInput?.addEventListener('input', () => setFieldError(emailInput, false));
passwordInput?.addEventListener('input', () => setFieldError(passwordInput, false));

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  setStatus('');
  setFieldError(emailInput, !email);
  setFieldError(passwordInput, !password);
  if (!email || !password) { setStatus('Enter your email and password to continue.', 'error'); return; }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.dataset.loading = 'true';
    submitButton.querySelector('span').textContent = 'Checking…';
    submitButton.querySelector('i').className = 'bi bi-arrow-repeat';
  }

  try {
    const res = await fetch('https://nijikade-backend.vercel.app/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('jwt', data.token);
    setStatus('Login successful. Opening the workspace…', 'success');
    window.location.href = './blogs.html';
  } catch (err) {
    setStatus(err.message || 'Unable to sign in. Try again.', 'error');
    setFieldError(emailInput, true);
    setFieldError(passwordInput, true);
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.dataset.loading = 'false';
      submitButton.querySelector('span').textContent = 'Log in';
      submitButton.querySelector('i').className = 'bi bi-arrow-right';
    }
  }
});


