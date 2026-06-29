// State Management
let tasks = JSON.parse(localStorage.getItem('zenTasks')) || [];
let currentFilter = 'all';
let editingTaskId = null;

// DOM Elements
const taskList = document.getElementById('taskList');
const taskInput = document.getElementById('taskInput');
const categorySelect = document.getElementById('categorySelect');
const prioritySelect = document.getElementById('prioritySelect');
const dateInput = document.getElementById('dateInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const taskStats = document.getElementById('taskStats');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const themeToggle = document.getElementById('themeToggle');
const editModal = document.getElementById('editModal');
const editTaskInput = document.getElementById('editTaskInput');
const editCategorySelect = document.getElementById('editCategorySelect');
const editPrioritySelect = document.getElementById('editPrioritySelect');
const editDateInput = document.getElementById('editDateInput');
const saveEditBtn = document.getElementById('saveEdit');
const cancelEditBtn = document.getElementById('cancelEdit');

// Landing Page Elements
const landingPage = document.getElementById('landingPage');
const mainContent = document.getElementById('mainContent');
const getStartedBtn = document.getElementById('getStartedBtn');
const backToHome = document.getElementById('backToHome');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set today's date as default in date inputs
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    // Load theme
    const savedTheme = localStorage.getItem('zenTheme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Check if user has already "started"
    if (localStorage.getItem('zenStarted') === 'true') {
        showApp();
    }
    
    renderTasks();
});

// Navigation
getStartedBtn.addEventListener('click', () => {
    localStorage.setItem('zenStarted', 'true');
    showApp();
});

backToHome.addEventListener('click', () => {
    landingPage.style.display = 'grid';
    mainContent.style.display = 'none';
});

function showApp() {
    landingPage.style.display = 'none';
    mainContent.style.display = 'block';
    mainContent.classList.add('fade-in');
}

// Theme Management
themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('zenTheme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Task CRUD
function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now(),
        text: text,
        category: categorySelect.value,
        priority: prioritySelect.value,
        date: dateInput.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveAndRender();
    taskInput.value = '';
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

function toggleComplete(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveAndRender();
}

function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    editingTaskId = id;
    editTaskInput.value = task.text;
    editCategorySelect.value = task.category;
    editPrioritySelect.value = task.priority || 'medium';
    editDateInput.value = task.date;
    editModal.style.display = 'flex';
}

function closeEditModal() {
    editModal.style.display = 'none';
    editingTaskId = null;
}

saveEditBtn.addEventListener('click', () => {
    if (editingTaskId) {
        tasks = tasks.map(task => {
            if (task.id === editingTaskId) {
                return {
                    ...task,
                    text: editTaskInput.value,
                    category: editCategorySelect.value,
                    priority: editPrioritySelect.value,
                    date: editDateInput.value
                };
            }
            return task;
        });
        saveAndRender();
        closeEditModal();
    }
});

cancelEditBtn.addEventListener('click', closeEditModal);

clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(task => !task.completed);
    saveAndRender();
});

// UI Rendering
function saveAndRender() {
    localStorage.setItem('zenTasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    const query = searchInput.value.toLowerCase();
    
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(query);
        const matchesFilter = 
            currentFilter === 'all' || 
            (currentFilter === 'pending' && !task.completed) ||
            (currentFilter === 'completed' && task.completed);
        return matchesSearch && matchesFilter;
    });

    taskList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>No tasks found. Time to relax!</p>
            </div>
        `;
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="checkbox-wrapper">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleComplete(${task.id})">
                <div class="custom-checkbox"></div>
            </div>
            <div class="task-content">
                <span class="task-text">${task.text}</span>
                <div class="task-meta">
                    <span class="tag tag-${task.category}">${task.category}</span>
                    <span class="priority-badge priority-${task.priority || 'medium'}">${task.priority || 'medium'}</span>
                    <span class="due-date"><i class="far fa-calendar-alt"></i> ${formatDate(task.date)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn edit" onclick="openEditModal(${task.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        taskList.appendChild(li);
    });

    updateStats();
}

function updateStats() {
    const pendingCount = tasks.filter(t => !t.completed).length;
    taskStats.textContent = `You have ${pendingCount} pending task${pendingCount !== 1 ? 's' : ''}`;
}

function formatDate(dateStr) {
    if (!dateStr) return 'No date';
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}

// Event Listeners
addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

searchInput.addEventListener('input', renderTasks);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
});
