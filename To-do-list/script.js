// ==========================================================================
// 1. STATE CONFIGURATION & INITIALIZATION
// ==========================================================================
let todos = JSON.parse(localStorage.getItem('rainbow_todos')) || [];
let currentFilter = 'all';

// DOM Element Selectors
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const taskCounter = document.getElementById('task-counter');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

// ==========================================================================
// 2. STATE PERSISTENCE & RENDER ENGINE (CRUD: READ)
// ==========================================================================
function saveAndRender() {
    // Sync state automatically using window.localStorage
    localStorage.setItem('rainbow_todos', JSON.stringify(todos));
    
    // Clear dynamic DOM stack
    todoList.innerHTML = '';

    // Advanced Filtering Logic (All, Active, Completed)
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true; // 'all'
    });

    // Dynamic Element Creation & Injection
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        li.innerHTML = `
            <div class="todo-item-left">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                ${todo.isEditing 
                    ? `<input type="text" class="edit-input" value="${todo.text}">` 
                    : `<span class="todo-text">${todo.text}</span>`
                }
            </div>
            <div class="action-group">
                <button class="action-btn edit-btn">${todo.isEditing ? 'Save' : 'Edit'}</button>
                <button class="action-btn delete-btn">Delete</button>
            </div>
        `;
        todoList.appendChild(li);
    });

    // Update Counter Interface
    const activeTasks = todos.filter(t => !t.completed).length;
    taskCounter.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
}

// ==========================================================================
// 3. EVENT HANDLERS (CRUD: CREATE)
// ==========================================================================
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = todoInput.value.trim();
    if (!taskText) return;

    // Create State Object
    const newTodo = {
        id: Date.now().toString(),
        text: taskText,
        completed: false,
        isEditing: false
    };

    todos.push(newTodo);
    todoInput.value = '';
    saveAndRender();
});

// ==========================================================================
// 4. DELEGATED EVENT LISTENERS (CRUD: UPDATE & DELETE)
// ==========================================================================
todoList.addEventListener('click', (e) => {
    const target = e.target;
    const todoItem = target.closest('.todo-item');
    if (!todoItem) return;
    const id = todoItem.dataset.id;

    // A. Toggle Complete State (Update)
    if (target.classList.contains('todo-checkbox')) {
        todos = todos.map(todo => todo.id === id ? { ...todo, completed: target.checked } : todo);
        saveAndRender();
    }

    // B. Handle Delete Lifecycle (Delete)
    if (target.classList.contains('delete-btn')) {
        todos = todos.filter(todo => todo.id !== id);
        saveAndRender();
    }

    // C. Inline Edit Management (Update Text)
    if (target.classList.contains('edit-btn')) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                if (todo.isEditing) {
                    // Save mode activated
                    const editInput = todoItem.querySelector('.edit-input');
                    const updatedText = editInput.value.trim();
                    return { ...todo, text: updatedText || todo.text, isEditing: false };
                } else {
                    // Enter edit mode
                    return { ...todo, isEditing: true };
                }
            }
            return todo;
        });
        saveAndRender();
    }
});

// ==========================================================================
// 5. GLOBAL AUXILIARY CONTROLS (FILTERS & SWEEPS)
// ==========================================================================

// Filter Switch Trigger
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        saveAndRender();
    });
});

// Clear Completed Sweep
clearCompletedBtn.addEventListener('click', () => {
    todos = todos.filter(todo => !todo.completed);
    saveAndRender();
});

// Initial Render Bootstrap Call
saveAndRender();