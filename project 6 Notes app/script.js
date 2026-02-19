let notes = JSON.parse(localStorage.getItem('notes')) || [];
let currentNoteId = null;
let currentCategory = 'all';

const addNoteBtn = document.getElementById('addNoteBtn');
const noteModal = document.getElementById('noteModal');
const closeModal = document.getElementById('closeModal');
const notesGrid = document.getElementById('notesGrid');
const searchBar = document.getElementById('searchBar');
const themeToggle = document.getElementById('themeToggle');
const bgToggle = document.getElementById('bgToggle');
const bgModal = document.getElementById('bgModal');
const closeBgModal = document.getElementById('closeBgModal');
const categoryBtns = document.querySelectorAll('.sidebar-btn');

addNoteBtn.addEventListener('click', () => openModal());
closeModal.addEventListener('click', saveAndClose);
searchBar.addEventListener('input', (e) => renderNotes(e.target.value));
themeToggle.addEventListener('click', toggleTheme);
bgToggle.addEventListener('click', () => bgModal.classList.add('active'));
closBgModal.addEventListener('click', () => bgModal.classList.remove('active'));

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        renderNotes();
    });
});

function openModal(noteId = null) {
    currentNoteId = noteId;
    noteModal.classList.add('active');
    
    if (noteId) {
        const note = notes.find(n => n.id === noteId);
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('noteContent').value = note.content;
        document.getElementById('noteCategory').value = note.category;
    } else {
        document.getElementById('noteTitle').value = '';
        document.getElementById('noteContent').value = '';
        document.getElementById('noteCategory').value = 'personal';
    }
}

function closeModalHandler() {
    noteModal.classList.remove('active');
    currentNoteId = null;
}

function saveAndClose() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    
    if (title || content) {
        saveNote();
    }
    closeModalHandler();
}

function saveNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    const category = document.getElementById('noteCategory').value;
    
    if (!title && !content) return;
    
    if (currentNoteId) {
        const note = notes.find(n => n.id === currentNoteId);
        note.title = title;
        note.content = content;
        note.category = category;
        note.updatedAt = new Date().toISOString();
    } else {
        const newNote = {
            id: Date.now(),
            title,
            content,
            category,
            color: '#fff',
            pinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes.unshift(newNote);
    }
    
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
    closeModalHandler();
}

function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(n => n.id !== id);
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
    }
}

function togglePin(id) {
    const note = notes.find(n => n.id === id);
    note.pinned = !note.pinned;
    notes.sort((a, b) => b.pinned - a.pinned);
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
}

function renderNotes(searchTerm = '') {
    let filteredNotes = notes;
    
    if (currentCategory !== 'all') {
        if (currentCategory === 'pinned') {
            filteredNotes = notes.filter(n => n.pinned);
        } else {
            filteredNotes = notes.filter(n => n.category === currentCategory);
        }
    }
    
    if (searchTerm) {
        filteredNotes = filteredNotes.filter(n => 
            n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    if (filteredNotes.length === 0) {
        notesGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h2>No notes found</h2>
                <p>${searchTerm ? 'Try a different search term' : 'Click "New Note" to create your first note'}</p>
            </div>
        `;
        return;
    }
    
    notesGrid.innerHTML = filteredNotes.map(note => `
        <div class="note-card ${note.pinned ? 'pinned' : ''}" style="background: ${note.color}" onclick="openModal(${note.id})">
            <h3 class="note-title">${note.title}</h3>
            <p class="note-content">${note.content}</p>
            <div class="note-footer">
                <span class="note-tag">${note.category}</span>
                <span>${new Date(note.updatedAt).toLocaleDateString()}</span>
            </div>
            <div class="note-actions">
                <button class="action-btn" onclick="event.stopPropagation(); togglePin(${note.id})">${note.pinned ? '📌' : '📍'}</button>
                <button class="action-btn" onclick="event.stopPropagation(); deleteNote(${note.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    themeToggle.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.textContent = '☀️';
}

noteModal.addEventListener('click', (e) => {
    if (e.target === noteModal) closeModalHandler();
});

bgModal.addEventListener('click', (e) => {
    if (e.target === bgModal) bgModal.classList.remove('active');
});

document.querySelectorAll('.bg-option').forEach(option => {
    option.addEventListener('click', () => {
        const bgClass = option.dataset.bg;
        document.body.className = document.body.classList.contains('light-mode') ? `light-mode bg-${bgClass}` : `bg-${bgClass}`;
        localStorage.setItem('background', bgClass);
        bgModal.classList.remove('active');
    });
});

const savedBg = localStorage.getItem('background');
if (savedBg) {
    document.body.classList.add(`bg-${savedBg}`);
}

renderNotes();
