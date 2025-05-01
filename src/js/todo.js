document.addEventListener('DOMContentLoaded', function() {
  // Todo elements
  const todoInput = document.getElementById('todo-input');
  const addTodoButton = document.getElementById('add-todo');
  const todoList = document.getElementById('todo-list');
  const todoStats = document.getElementById('todo-stats');
  const emptyState = todoList.querySelector('.empty-state');

  // Load todos from localStorage
  let todos = JSON.parse(localStorage.getItem('ustp-todos')) || [];
  
  // Update todos display
  function updateTodos() {
    // Clear current list
    while (todoList.firstChild) {
      todoList.removeChild(todoList.firstChild);
    }
    
    if (todos.length === 0) {
      todoList.appendChild(emptyState);
      todoStats.classList.add('hidden');
      return;
    }
    
    emptyState.remove();
    
    // Add each todo
    todos.forEach(function(todo) {
      const todoItem = document.createElement('div');
      todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      todoItem.dataset.id = todo.id;
      
      todoItem.innerHTML = `
        <div class="todo-checkbox-label">
          <input type="checkbox" id="todo-${todo.id}" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
          <span class="todo-text">${todo.text}</span>
        </div>
        <button class="icon-button delete-todo">
          <i class="fas fa-trash-alt"></i>
        </button>
      `;
      
      todoList.appendChild(todoItem);
      
      // Add event listeners to new elements
      const checkbox = todoItem.querySelector('.todo-checkbox');
      checkbox.addEventListener('change', function() {
        toggleTodo(todo.id);
      });
      
      const deleteButton = todoItem.querySelector('.delete-todo');
      deleteButton.addEventListener('click', function() {
        deleteTodo(todo.id);
      });
    });
    
    // Update stats
    const completedTodos = todos.filter(todo => todo.completed).length;
    todoStats.textContent = `${completedTodos} of ${todos.length} tasks completed`;
    todoStats.classList.remove('hidden');
    
    // Save to localStorage
    localStorage.setItem('ustp-todos', JSON.stringify(todos));
  }

  function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') return;
    
    const todo = {
      id: Date.now().toString(),
      text: text,
      completed: false
    };
    
    todos.push(todo);
    todoInput.value = '';
    updateTodos();
    window.createToast('Task added successfully!', 'success');
    
    // Add activity to streak
    if (window.addActivityToStreak) {
      window.addActivityToStreak({
        type: 'todo',
        description: `Added task "${text}"`
      });
    }
  }

  function toggleTodo(id) {
    let todoText = '';
    let wasCompleted = false;
    
    todos = todos.map(todo => {
      if (todo.id === id) {
        todoText = todo.text;
        wasCompleted = todo.completed;
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    
    updateTodos();
    
    // Only add to streak when completing a todo, not unchecking
    if (!wasCompleted && todoText) {
      // Add activity to streak
      if (window.addActivityToStreak) {
        window.addActivityToStreak({
          type: 'todo',
          description: `Completed task "${todoText}"`
        });
      }
      window.createToast('Task completed!', 'success');
    }
  }

  function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    updateTodos();
    window.createToast('Task deleted!', 'error');
  }

  // Event listeners
  addTodoButton.addEventListener('click', addTodo);
  
  todoInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      addTodo();
    }
  });
  
  // Initialize todos
  updateTodos();
});
