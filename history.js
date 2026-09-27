const list = document.getElementById('history-list');
const empty = document.getElementById('history-empty');
const count = document.getElementById('history-count');
const clearAllBtn = document.getElementById('clear-all');
const liveClock = document.getElementById('live-clock');

const modal = document.getElementById('confirm-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalOk = document.getElementById('modal-ok');
const modalCancel = document.getElementById('modal-cancel');

const HISTORY_KEY = 'tododay.history';

let pendingAction = null; // fungsi yang dijalankan jika user klik "Ya, Hapus"

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(items) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

// ⏰ Jam & tanggal live
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

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return d.toLocaleDateString('id-ID', options);
}

function formatDeadline(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return d.toLocaleDateString('id-ID', options);
}

function render() {
  const items = loadHistory();
  list.innerHTML = '';

  items.forEach((item, index) => {
    const li = document.createElement('li');
    if (item.done) li.classList.add('done');

    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = item.done ? '✅' : '🗒️';

    const content = document.createElement('div');
    content.className = 'history-content';

    const span = document.createElement('span');
    span.className = 'text';
    span.textContent = item.text;

    const date = document.createElement('span');
    date.className = 'date';
    date.textContent = 'Selesai: ' + formatDate(item.done_at);

    content.append(span, date);

    if (item.deadline) {
      const deadline = document.createElement('span');
      deadline.className = 'deadline';
      deadline.textContent = '📅 Dikumpulkan: ' + formatDeadline(item.deadline);
      content.append(deadline);
    }

    const del = document.createElement('button');
    del.className = 'delete';
    del.textContent = '✕';
    del.setAttribute('aria-label', 'Hapus riwayat');
    del.addEventListener('click', () => confirmRemove(index));

    li.append(icon, content, del);
    list.appendChild(li);
  });

  empty.style.display = items.length === 0 ? 'block' : 'none';
  count.textContent = `${items.length} tugas dalam riwayat`;
  clearAllBtn.style.display = items.length > 0 ? 'inline-block' : 'none';
}

function openModal(title, message, onConfirm) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  pendingAction = onConfirm;
  modal.hidden = false;
  modalOk.focus();
}

function closeModal() {
  modal.hidden = true;
  pendingAction = null;
}

function confirmRemove(index) {
  const items = loadHistory();
  const text = items[index] ? items[index].text : 'tugas ini';

  openModal(
    'Hapus riwayat?',
    `"${text}"\n\nRiwayat ini akan dihapus permanen dan tidak bisa dikembalikan.`,
    () => {
      const current = loadHistory();
      current.splice(index, 1);
      saveHistory(current);
      render();
    }
  );
}

function confirmClearAll() {
  const items = loadHistory();

  openModal(
    'Hapus semua riwayat?',
    `${items.length} riwayat akan dihapus permanen dan tidak bisa dikembalikan.`,
    () => {
      saveHistory([]);
      render();
    }
  );
}

modalOk.addEventListener('click', () => {
  if (pendingAction) {
    pendingAction();
    pendingAction = null;
  }
  closeModal();
});

modalCancel.addEventListener('click', closeModal);

// Klik area gelap di luar modal = batal
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Tutup dengan tombol Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

clearAllBtn.addEventListener('click', confirmClearAll);

// Mulai jam live & update setiap detik
updateClock();
setInterval(updateClock, 1000);

render();
