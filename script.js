const form = document.getElementById('form');
const input = document.getElementById('input');
const deadlineInput = document.getElementById('deadline');
const list = document.getElementById('list');
const empty = document.getElementById('empty');
const remaining = document.getElementById('remaining');
const clearBtn = document.getElementById('clear');
const exportBtn = document.getElementById('export');
const importBtn = document.getElementById('import');
const importFile = document.getElementById('import-file');
const liveClock = document.getElementById('live-clock');
const errorDiv = document.getElementById('task-error'); // ← Elemen untuk peringatan

const STORAGE_KEY = 'tododay.todos';

let todos = load(STORAGE_KEY);

function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
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

function formatDeadline(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return d.toLocaleDateString('id-ID', options);
}

// Status tenggat: lewat, hari ini, besok, atau sisa hari
function deadlineStatus(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (diff < 0) return { label: 'Terlambat', cls: 'overdue' };
  if (diff === 0) return { label: 'Dikumpulkan hari ini', cls: 'today' };
  if (diff === 1) return { label: 'Dikumpulkan besok', cls: 'soon' };
  return { label: `${diff} hari lagi`, cls: '' };
}

function showError(msg) {
  if (errorDiv) {
    errorDiv.textContent = msg;
    errorDiv.hidden = false;
    setTimeout(() => { errorDiv.hidden = true; }, 3000);
  }
}

function render() {
  list.innerHTML = '';
  let active = 0;

  todos.forEach((todo, index) => {
    if (!todo.done) active++;

    const li = document.createElement('li');
    if (todo.done) li.classList.add('done');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.addEventListener('change', () => toggle(index));

    const content = document.createElement('div');
    content.className = 'todo-content';

    const span = document.createElement('span');
    span.className = 'text';
    span.textContent = todo.text;

    content.append(span);

    if (todo.deadline) {
      const deadline = document.createElement('span');
      const status = deadlineStatus(todo.deadline);
      deadline.className = 'deadline ' + (status ? status.cls : '');
      deadline.textContent = '📅 ' + formatDeadline(todo.deadline) + (status ? ' — ' + status.label : '');
      content.append(deadline);
    }

    const del = document.createElement('button');
    del.className = 'delete';
    del.textContent = '✕';
    del.setAttribute('aria-label', 'Hapus tugas');
    del.addEventListener('click', () => remove(index));

    li.append(checkbox, content, del);
    list.appendChild(li);
  });

  empty.style.display = todos.length === 0 ? 'block' : 'none';
  remaining.textContent = `${active} tugas tersisa`;
  clearBtn.style.display = todos.some(t => t.done) ? 'inline-block' : 'none';
}

function add(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    showError('⚠️ Tugas tidak boleh kosong.');
    input.focus();
    return;
  }
  todos.push({ text: trimmed, done: false, deadline: deadlineInput.value || '' });
  save();
  render();
  deadlineInput.value = '';
  input.value = '';
  input.focus();
}

function toggle(index) {
  todos[index].done = !todos[index].done;

  // ✅ Masuk riwayat hanya saat dicentang (selesai)
  if (todos[index].done) {
    addToHistory(todos[index]);
  }

  save();
  render();
}

function remove(index) {
  // ❌ Hapus tanpa menambah ke riwayat
  todos.splice(index, 1);
  save();
  render();
}

function addToHistory(todo) {
  const historyKey = 'tododay.history';
  try {
    const raw = localStorage.getItem(historyKey);
    const history = raw ? JSON.parse(raw) : [];

    // Hindari duplikat: tugas yang sama baru dicatat sekali saat selesai
    const exists = history.some(
      (h) => h.text === todo.text && h.done === true
    );

    if (exists) return;

    history.push({
      text: todo.text,
      done: true,
      done_at: new Date().toISOString(),
      deadline: todo.deadline || ''
    });

    localStorage.setItem(historyKey, JSON.stringify(history));
  } catch (e) {
    console.error('Gagal simpan ke history:', e);
  }
}

function exportData() {
  const data = {
    version: 1,
    exported_at: new Date().toISOString(),
    todos: todos
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tododay-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function restoreData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      if (!data || typeof data !== 'object') throw new Error('Format tidak valid');

      if (data.todos && Array.isArray(data.todos)) {
        todos = data.todos.filter(t => t && typeof t.text === 'string');
        save();
      }

      render();
      alert('✅ Data berhasil dipulihkan!');
    } catch (err) {
      console.error('Gagal memulihkan data:', err);
      alert('❌ Gagal memulihkan data. Pastikan file backup valid.');
    }
  };
  reader.readAsText(file);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  add(input.value);
});

clearBtn.addEventListener('click', () => {
  // ❌ Hanya hapus tugas selesai, tanpa menambah riwayat lagi
  todos = todos.filter(t => !t.done);
  save();
  render();
});

exportBtn.addEventListener('click', exportData);

importBtn.addEventListener('click', () => importFile.click());

importFile.addEventListener('change', () => {
  if (importFile.files.length > 0) {
    restoreData(importFile.files[0]);
    importFile.value = '';
  }
});

// Mulai jam live & update setiap detik
updateClock();
setInterval(updateClock, 1000);

render();
