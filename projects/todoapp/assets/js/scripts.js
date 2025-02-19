// Action Button Component
class ActionButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['type', 'label'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const type = this.getAttribute('type');
    const label = this.getAttribute('label');
    const color = type === 'delete' ? '#dc3545' : '#4285f4';

    this.shadowRoot.innerHTML = `
      <style>
        .action-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          color: ${color};
          font-size: 12px;
          transition: background-color 0.2s;
        }
        .action-button:hover {
          background: ${color}15;
        }
      </style>
      <button class="action-button">${label}</button>
    `;

    this.shadowRoot.querySelector('button').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent(`${type}-clicked`));
    });
  }
}
customElements.define('action-button', ActionButton);

// Add Button Component
class AddButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        .add-button {
          background: #4285f4;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        .add-button:hover {
          background: #3367d6;
        }
      </style>
      <button class="add-button">Add</button>
    `;

    this.shadowRoot.querySelector('button').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('add-clicked'));
    });
  }
}
customElements.define('add-button', AddButton);

class TodoApp extends HTMLElement {
  constructor() {
    super();
    this.todos = JSON.parse(localStorage.getItem('todos') || '[]');
    this.filter = 'all';
    this.editingId = null;
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleAddClick = this.handleAddClick.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  setupEventListeners() {
    this.addEventListener('click', this.handleClick);
    const input = this.querySelector('.input-container input');
    if (input) {
      input.addEventListener('keyup', this.handleKeyUp);
    }
    
    const addButton = this.querySelector('add-button');
    if (addButton) {
      addButton.addEventListener('add-clicked', this.handleAddClick);
    }

    this.querySelectorAll('action-button').forEach(button => {
      button.addEventListener('edit-clicked', this.handleEditClick);
      button.addEventListener('delete-clicked', this.handleDeleteClick);
    });

    const editInput = this.querySelector('.todo-item.editing input[type="text"]');
    if (editInput) {
      editInput.focus();
      editInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          this.saveEdit(this.editingId, e.target.value);
        } else if (e.key === 'Escape') {
          this.cancelEdit();
        }
      });
      editInput.addEventListener('blur', () => {
        this.saveEdit(this.editingId, editInput.value);
      });
    }
  }

  handleEditClick(e) {
    const todoItem = e.target.closest('.todo-item');
    if (todoItem) {
      this.editingId = parseInt(todoItem.dataset.id);
      this.render();
    }
  }

  handleDeleteClick(e) {
    const todoItem = e.target.closest('.todo-item');
    if (todoItem) {
      this.deleteTodo(parseInt(todoItem.dataset.id));
    }
  }

  saveEdit(id, newText) {
    if (newText.trim()) {
      this.todos = this.todos.map(todo =>
        todo.id === id ? { ...todo, text: newText.trim() } : todo
      );
      this.saveTodos();
    }
    this.editingId = null;
    this.render();
  }

  cancelEdit() {
    this.editingId = null;
    this.render();
  }

  /* Rest of the methods remain the same */
  removeEventListeners() {
    this.removeEventListener('click', this.handleClick);
    const input = this.querySelector('.input-container input');
    if (input) {
      input.removeEventListener('keyup', this.handleKeyUp);
    }
    const addButton = this.querySelector('add-button');
    if (addButton) {
      addButton.removeEventListener('add-clicked', this.handleAddClick);
    }
  }

  handleAddClick() {
    const input = this.querySelector('.input-container input');
    if (input && input.value.trim()) {
      this.addTodo(input.value.trim());
      input.value = '';
    }
  }

  handleKeyUp(e) {
    if (e.key === 'Enter' && e.target.value.trim()) {
      this.addTodo(e.target.value.trim());
      e.target.value = '';
    }
  }

  addTodo(text) {
    this.todos.push({
      id: Date.now(),
      text,
      completed: false
    });
    this.saveTodos();
    this.render();
  }

  toggleTodo(id) {
    this.todos = this.todos.map(todo =>
      todo.id === parseInt(id) ? { ...todo, completed: !todo.completed } : todo
    );
    this.saveTodos();
    this.render();
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.saveTodos();
    this.render();
  }

  clearAll() {
    this.todos = [];
    this.saveTodos();
    this.render();
  }

  saveTodos() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  handleClick(e) {
    if (e.target.matches('.tab')) {
      this.filter = e.target.dataset.filter;
      this.render();
    } else if (e.target.matches('.clear-all')) {
      this.clearAll();
    } else if (e.target.matches('input[type="checkbox"]')) {
      const todoItem = e.target.closest('.todo-item');
      if (todoItem) {
        this.toggleTodo(todoItem.dataset.id);
      }
    }
  }

  filteredTodos() {
    switch (this.filter) {
      case 'pending':
        return this.todos.filter(todo => !todo.completed);
      case 'completed':
        return this.todos.filter(todo => todo.completed);
      default:
        return this.todos;
    }
  }

  render() {
    this.innerHTML = `
      <div class="todo-app">
        <div class="input-container">
          <input type="text" placeholder="Add a new task">
          <add-button></add-button>
        </div>
        <div class="tabs">
          <span class="tab ${this.filter === 'all' ? 'active' : ''}" data-filter="all">All</span>
          <span class="tab ${this.filter === 'pending' ? 'active' : ''}" data-filter="pending">Pending</span>
          <span class="tab ${this.filter === 'completed' ? 'active' : ''}" data-filter="completed">Completed</span>
          <button class="clear-all">Clear All</button>
        </div>
        ${this.filteredTodos().map(todo => `
          <div class="todo-item ${todo.completed ? 'completed' : ''} ${this.editingId === todo.id ? 'editing' : ''}" data-id="${todo.id}">
            <input type="checkbox" ${todo.completed ? 'checked' : ''}>
            ${this.editingId === todo.id 
              ? `<input type="text" value="${todo.text}">`
              : `<span>${todo.text}</span>`
            }
            <div class="actions">
              <action-button type="edit" label="Edit"></action-button>
              <action-button type="delete" label="Delete"></action-button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    this.setupEventListeners();
  }
}

customElements.define('todo-app', TodoApp);