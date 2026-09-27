const authError = document.getElementById('auth-error');
const liveClock = document.getElementById('live-clock');

const SESSION_KEY = 'tododay.session';
const USERS_TABLE = '/api/db/users';

// ⏰ Jam live
function updateClock() {
  const now = new Date();
  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  liveClock.textContent = '🕒 ' + now.toLocaleDateString('id-ID', options);
}

function showError(msg) {
  authError.textContent = msg;
  authError.hidden = false;
}

function hideError() {
  authError.hidden = true;
}

// 🔐 Hash password sederhana (client-side; untuk demo)
function hashPassword(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h' + Math.abs(hash).toString(16) + '_' + str.length;
}

function setSession(user) {
  const session = {
    id: user.id,
    username: user.username,
    email: user.mail || user.email || '',
    name: user.name || '',
    login_at: new Date().toISOString()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// 🔎 Ambil semua user
async function fetchUsers() {
  const res = await fetch(USERS_TABLE + '?limit=1000');
  if (!res.ok) throw new Error('Gagal memuat data akun');
  const data = await res.json();
  return data.rows || [];
}

// Nilai password & email yang disimpan
function userPwd(u) {
  if (u.pwd !== undefined && u.pwd !== null && u.pwd !== '') return u.pwd;
  if (u.password !== undefined && u.password !== null && u.password !== '') return u.password;
  return null;
}

function userMail(u) {
  if (u.mail !== undefined && u.mail !== null && u.mail !== '') return u.mail;
  if (u.email !== undefined && u.email !== null && u.email !== '') return u.email;
  return null;
}

// 🔑 Login (bisa pakai username atau email)
async function login(identifier, password) {
  hideError();

  try {
    const users = await fetchUsers();
    const ident = identifier.trim().toLowerCase();

    const user = users.find(u => {
      const uname = (u.username || '').toLowerCase();
      const mail = (userMail(u) || '').toLowerCase();
      return uname === ident || mail === ident;
    });

    if (!user) {
      showError('Akun tidak ditemukan.');
      return;
    }

    const savedPwd = userPwd(user);
    if (savedPwd === null) {
      showError('Akun ini tidak memiliki password tersimpan. Silakan daftar akun baru.');
      return;
    }

    if (savedPwd !== hashPassword(password)) {
      showError('Password salah.');
      return;
    }

    setSession(user);
    window.location.href = 'index.html';
  } catch (err) {
    showError(err.message || 'Terjadi kesalahan. Coba lagi.');
  }
}

// 📝 Daftar akun baru
async function register(username, name, email, password) {
  hideError();

  if (password.length < 6) {
    showError('Password minimal 6 karakter.');
    return;
  }

  if (!email.includes('@') || !email.includes('.')) {
    showError('Email tidak valid.');
    return;
  }

  try {
    const users = await fetchUsers();
    const uname = username.trim().toLowerCase();
    const mail = email.trim().toLowerCase();

    const existing = users.find(u => u.username && u.username.toLowerCase() === uname);
    if (existing) {
      showError('Username sudah dipakai. Coba username lain.');
      return;
    }

    const existingEmail = users.find(u => {
      const m = userMail(u);
      return m && m.toLowerCase() === mail;
    });
    if (existingEmail) {
      showError('Email sudah terdaftar. Gunakan email lain.');
      return;
    }

    const hashed = hashPassword(password);

    const res = await fetch(USERS_TABLE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: uname,
        name: name,
        password: hashed,  // memenuhi kolom required "password"
        email: mail,       // isi kolom email (private) juga
        pwd: hashed,       // kolom public untuk pembacaan login
        mail: mail         // kolom public untuk pembacaan login
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal mendaftar');
    }

    // Response bisa bermacam bentuk — cari user yang baru dibuat
    const data = await res.json();
    let user = data.row || data;

    // Kalau response berbentuk { rows: [...] } atau array
    if (!user && data.rows && Array.isArray(data.rows)) {
      user = data.rows[0];
    }
    if (Array.isArray(data)) {
      user = data[0];
    }

    if (!user || !user.id) {
      // Fallback: cari ulang berdasarkan username
      const usersAfter = await fetchUsers();
      user = usersAfter.find(u => (u.username || '').toLowerCase() === uname);
    }

    if (!user) {
      throw new Error('Pendaftaran berhasil tapi data akun tidak ditemukan.');
    }

    setSession(user);
    window.location.href = 'index.html';
  } catch (err) {
    showError(err.message || 'Terjadi kesalahan. Coba lagi.');
  }
}

// Inisialisasi berdasarkan halaman yang aktif
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const identifier = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    login(identifier, password);
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;
    register(username, name, email, password);
  });
}

// Jika sudah login dan berada di halaman login/daftar, langsung ke utama
if (getSession() && (loginForm || registerForm)) {
  window.location.href = 'index.html';
}

updateClock();
setInterval(updateClock, 1000);
