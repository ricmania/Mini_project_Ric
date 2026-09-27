// 🛡️ Proteksi halaman: hanya pengguna yang sudah login yang boleh akses
const SESSION_KEY = 'tododay.session';

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'login.html';
}

const session = getSession();

// Jika belum login, arahkan ke halaman login
if (!session) {
  window.location.href = 'login.html';
} else {
  // Tampilkan nama pengguna
  const userNameEl = document.getElementById('user-name');
  if (userNameEl) {
    userNameEl.textContent = session.name || session.username;
  }

  // Pasang tombol logout
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
}
