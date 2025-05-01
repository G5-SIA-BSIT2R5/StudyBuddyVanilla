
document.addEventListener('DOMContentLoaded', function() {
  // Notes elements
  const newNoteBtn = document.getElementById('new-note-btn');
  const notesList = document.getElementById('notes-list');
  const noteEditor = document.getElementById('note-editor');
  const noteTitle = document.getElementById('note-title');
  const noteContent = document.getElementById('note-content');
  const saveNoteBtn = document.getElementById('save-note');
  const cancelNoteBtn = document.getElementById('cancel-note');
  const emptyState = notesList.querySelector('.empty-state');
  
  // Notes variables
  let notes = JSON.parse(localStorage.getItem('ustp-notes')) || [];
  let currentNoteId = null;
  
  // Update notes display
  function updateNotes() {
    // Clear current list
    while (notesList.firstChild) {
      notesList.removeChild(notesList.firstChild);
    }
    
    if (notes.length === 0) {
      notesList.appendChild(emptyState);
      return;
    }
    
    emptyState.remove();
    
    // Add each note
    notes.forEach(function(note) {
      const noteItem = document.createElement('div');
      noteItem.className = 'note-item';
      noteItem.dataset.id = note.id;
      
      noteItem.innerHTML = `
        <div class="note-header">
          <h3 class="note-title">${note.title}</h3>
          <div class="note-actions">
            <button class="icon-button edit-note">
              <i class="fas fa-edit"></i>
            </button>
            <button class="icon-button delete-note">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <p class="note-content">${note.content || 'No content'}</p>
        <div class="note-timestamp">Last updated: ${note.lastUpdated}</div>
      `;
      
      notesList.appendChild(noteItem);
      
      // Add event listeners to new elements
      const editButton = noteItem.querySelector('.edit-note');
      editButton.addEventListener('click', function() {
        editNote(note.id);
      });
      
      const deleteButton = noteItem.querySelector('.delete-note');
      deleteButton.addEventListener('click', function() {
        deleteNote(note.id);
      });
    });
    
    // Save to localStorage
    localStorage.setItem('ustp-notes', JSON.stringify(notes));
  }
  
  function editNote(id) {
    const note = notes.find(note => note.id === id);
    if (!note) return;
    
    noteTitle.value = note.title;
    noteContent.value = note.content;
    currentNoteId = note.id;
    
    notesList.classList.add('hidden');
    noteEditor.classList.remove('hidden');
    newNoteBtn.classList.add('hidden');
  }
  
  function newNote() {
    noteTitle.value = '';
    noteContent.value = '';
    currentNoteId = null;
    
    notesList.classList.add('hidden');
    noteEditor.classList.remove('hidden');
    newNoteBtn.classList.add('hidden');
  }
  
  function saveNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    
    if (title === '') {
      window.createToast('Note title required', 'error');
      return;
    }
    
    const timestamp = new Date().toLocaleString();
    
    if (currentNoteId) {
      // Update existing note
      notes = notes.map(note => {
        if (note.id === currentNoteId) {
          return {
            ...note,
            title,
            content,
            lastUpdated: timestamp
          };
        }
        return note;
      });
      
      window.createToast('Note updated successfully!', 'success');
      
      // Add activity to streak
      if (window.addActivityToStreak) {
        window.addActivityToStreak({
          type: 'note',
          description: `Updated note "${title}"`
        });
      }
    } else {
      // Create new note
      const newNote = {
        id: Date.now().toString(),
        title,
        content,
        lastUpdated: timestamp
      };
      
      notes.push(newNote);
      window.createToast('Note created successfully!', 'success');
      
      // Add activity to streak
      if (window.addActivityToStreak) {
        window.addActivityToStreak({
          type: 'note',
          description: `Created note "${title}"`
        });
      }
    }
    
    cancelEdit();
    updateNotes();
  }
  
  function cancelEdit() {
    notesList.classList.remove('hidden');
    noteEditor.classList.add('hidden');
    newNoteBtn.classList.remove('hidden');
    currentNoteId = null;
  }
  
  function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    updateNotes();
    window.createToast('Note deleted!', 'error');
  }
  
  // Event listeners
  newNoteBtn.addEventListener('click', newNote);
  saveNoteBtn.addEventListener('click', saveNote);
  cancelNoteBtn.addEventListener('click', cancelEdit);
  
  // Initialize notes
  updateNotes();
});
