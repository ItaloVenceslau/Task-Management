// ========================================
// MAIN APPLICATION - COMPLETE FIXED VERSION
// ========================================

// App State
let allTasks = [];
let taskChart = null;
let activityChart = null;
let currentFilter = 'all';
let currentSort = 'newest';

// DOM Elements
const views = {
    dashboard: document.getElementById('dashboardView'),
    tasks: document.getElementById('tasksView'),
    create: document.getElementById('createView'),
    analytics: document.getElementById('analyticsView'),
    calendar: document.getElementById('calendarView')
};

// ========================================
// Utility Functions
// ========================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.log(`[${type}] ${message}`);
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateTaskCounts() {
    const total = allTasks.length;
    const pending = allTasks.filter(t => t.status === 'pending').length;
    const inProgress = allTasks.filter(t => t.status === 'in-progress').length;
    const completed = allTasks.filter(t => t.status === 'completed').length;
    
    const elements = {
        allCount: document.getElementById('allCount'),
        pendingCount: document.getElementById('pendingCount'),
        progressCount: document.getElementById('progressCount'),
        completedCount: document.getElementById('completedCount'),
        taskCountBadge: document.getElementById('taskCountBadge')
    };
    
    if (elements.allCount) elements.allCount.textContent = total;
    if (elements.pendingCount) elements.pendingCount.textContent = pending;
    if (elements.progressCount) elements.progressCount.textContent = inProgress;
    if (elements.completedCount) elements.completedCount.textContent = completed;
    if (elements.taskCountBadge) elements.taskCountBadge.textContent = total;
}

// ========================================
// Dashboard Functions
// ========================================
function updateDashboardStats() {
    const total = allTasks.length;
    const pending = allTasks.filter(t => t.status === 'pending').length;
    const inProgress = allTasks.filter(t => t.status === 'in-progress').length;
    const completed = allTasks.filter(t => t.status === 'completed').length;
    
    const totalEl = document.getElementById('totalTasks');
    const pendingEl = document.getElementById('pendingTasks');
    const progressEl = document.getElementById('inProgressTasks');
    const completedEl = document.getElementById('completedTasks');
    const percentEl = document.getElementById('completionPercent');
    const progressFillEl = document.getElementById('pendingProgress');
    
    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending;
    if (progressEl) progressEl.textContent = inProgress;
    if (completedEl) completedEl.textContent = completed;
    
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;
    
    if (percentEl) percentEl.textContent = percent;
    if (progressFillEl) progressFillEl.style.width = `${pendingPercent}%`;
    
    const circle = document.getElementById('completionCircle');
    if (circle) {
        const circumference = 2 * Math.PI * 80;
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }
}

function renderRecentTasks() {
    const container = document.getElementById('recentTasksList');
    if (!container) return;
    
    const recentTasks = [...allTasks]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    if (recentTasks.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>No tasks yet. Create your first task!</p></div>';
        return;
    }
    
    container.innerHTML = recentTasks.map(task => `
        <div class="timeline-item" onclick="window.editTask(${task.id})">
            <div class="timeline-icon ${task.status}">
                <i class="fas ${task.status === 'completed' ? 'fa-check' : task.status === 'in-progress' ? 'fa-spinner fa-spin' : 'fa-clock'}"></i>
            </div>
            <div class="timeline-content">
                <div class="timeline-title">${escapeHtml(task.title)}</div>
                <div class="timeline-meta">
                    <span class="timeline-status status-${task.status}">${task.status}</span>
                    <span>${formatDate(task.createdAt)}</span>
                </div>
            </div>
            <i class="fas fa-chevron-right"></i>
        </div>
    `).join('');
}

// ========================================
// Chart Functions
// ========================================
function initTaskChart() {
    const ctx = document.getElementById('taskChart')?.getContext('2d');
    if (!ctx) return;
    
    const pending = allTasks.filter(t => t.status === 'pending').length;
    const inProgress = allTasks.filter(t => t.status === 'in-progress').length;
    const completed = allTasks.filter(t => t.status === 'completed').length;
    
    if (taskChart) taskChart.destroy();
    
    taskChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'In Progress', 'Completed'],
            datasets: [{
                data: [pending, inProgress, completed],
                backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
            },
            cutout: '60%'
        }
    });
}

function initActivityChart() {
    const ctx = document.getElementById('activityChart')?.getContext('2d');
    if (!ctx) return;
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map(() => Math.floor(Math.random() * 10));
    
    if (activityChart) activityChart.destroy();
    
    activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Tasks Created',
                data: data,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } } }
        }
    });
}

// ========================================
// Tasks View Functions
// ========================================
function renderTasksList() {
    const container = document.getElementById('tasksList');
    if (!container) return;
    
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    let filteredTasks = [...allTasks];
    
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) || 
            (task.description && task.description.toLowerCase().includes(searchTerm))
        );
    }
    
    if (currentFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.status === currentFilter);
    }
    
    filteredTasks.sort((a, b) => {
        switch (currentSort) {
            case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
            case 'az': return a.title.localeCompare(b.title);
            case 'za': return b.title.localeCompare(a.title);
            default: return 0;
        }
    });
    
    if (filteredTasks.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No tasks found matching your criteria</p></div>';
        return;
    }
    
    container.innerHTML = filteredTasks.map(task => `
        <div class="task-card" data-task-id="${task.id}">
            <div class="task-header">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                <button class="task-action-btn" onclick="event.stopPropagation(); window.editTask(${task.id})">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
            <p class="task-description">${escapeHtml(task.description) || 'No description provided'}</p>
            <div class="task-footer">
                <span class="task-status-badge status-${task.status}">
                    <i class="fas ${task.status === 'completed' ? 'fa-check-circle' : task.status === 'in-progress' ? 'fa-sync-alt fa-spin' : 'fa-hourglass-half'}"></i>
                    ${task.status}
                </span>
                <div class="task-actions-preview">
                    <button class="task-action-btn" onclick="event.stopPropagation(); window.editTask(${task.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn" onclick="event.stopPropagation(); window.deleteTask(${task.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ========================================
// Calendar Functions
// ========================================
let currentDate = new Date();

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthYear = document.getElementById('currentMonthYear');
    if (monthYear) {
        monthYear.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const calendarDays = document.getElementById('calendarDays');
    if (!calendarDays) return;
    
    calendarDays.innerHTML = '';
    
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarDays.appendChild(emptyDay);
    }
    
    for (let day = 1; day <= totalDays; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasTask = allTasks.some(task => task.createdAt.startsWith(dateString));
        
        if (hasTask) {
            dayElement.classList.add('has-task');
            const dot = document.createElement('div');
            dot.className = 'task-dot';
            dayElement.appendChild(dot);
        }
        
        const today = new Date();
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        calendarDays.appendChild(dayElement);
    }
}

// ========================================
// CRUD Operations - FIXED DELETE
// ========================================
async function loadAllTasks() {
    console.log('🔄 Loading tasks...');
    
    try {
        const tasks = await TaskAPI.getAllTasks();
        console.log(`📋 Received ${tasks.length} tasks`);
        
        allTasks = tasks;
        
        updateDashboardStats();
        renderRecentTasks();
        renderTasksList();
        updateTaskCounts();
        initTaskChart();
        initActivityChart();
        renderCalendar();
        
        if (allTasks.length === 0) {
            console.log('No tasks found');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast(error.message, 'error');
    }
}

async function createTask(title, description) {
    try {
        const result = await TaskAPI.createTask(title, description);
        showToast(result.message || 'Task created successfully!', 'success');
        await loadAllTasks();
        return true;
    } catch (error) {
        showToast(error.message, 'error');
        return false;
    }
}

async function updateTask(id, updates) {
    try {
        const result = await TaskAPI.updateTask(id, updates);
        showToast(result.message || 'Task updated successfully!', 'success');
        await loadAllTasks();
        return true;
    } catch (error) {
        showToast(error.message, 'error');
        return false;
    }
}

// FIXED DELETE FUNCTION - Complete rewrite
async function deleteTask(id) {
    console.log('🗑️ Delete function called for task ID:', id);
    
    if (!id) {
        console.error('No task ID provided');
        showToast('Invalid task ID', 'error');
        return;
    }
    
    // Show confirmation dialog
    const confirmed = confirm(`Are you sure you want to delete task #${id}? This action cannot be undone.`);
    
    if (!confirmed) {
        console.log('Delete cancelled by user');
        return;
    }
    
    try {
        console.log('Sending delete request for task:', id);
        await TaskAPI.deleteTask(id);
        console.log('Delete successful for task:', id);
        showToast('Task deleted successfully!', 'success');
        await loadAllTasks();
    } catch (error) {
        console.error('Delete failed:', error);
        showToast(error.message || 'Failed to delete task', 'error');
    }
}

async function editTask(id) {
    console.log('✏️ Edit function called for task ID:', id);
    
    try {
        const task = await TaskAPI.getTaskById(id);
        console.log('Task data:', task);
        
        const modal = document.getElementById('editModal');
        const idField = document.getElementById('editTaskId');
        const titleField = document.getElementById('editTitle');
        const descField = document.getElementById('editDescription');
        const statusField = document.getElementById('editStatus');
        
        if (idField) idField.value = task.id;
        if (titleField) titleField.value = task.title;
        if (descField) descField.value = task.description || '';
        if (statusField) statusField.value = task.status;
        
        // Update status selector UI
        document.querySelectorAll('.status-option').forEach(opt => {
            opt.classList.remove('active');
            if (opt.dataset.status === task.status) {
                opt.classList.add('active');
            }
        });
        
        if (modal) modal.classList.add('active');
    } catch (error) {
        console.error('Edit failed:', error);
        showToast(error.message, 'error');
    }
}

// ========================================
// Event Handlers
// ========================================
function handleCreateTask(e) {
    e.preventDefault();
    const title = document.getElementById('taskTitle')?.value.trim();
    const description = document.getElementById('taskDescription')?.value.trim();
    
    if (!title) {
        showToast('Title is required', 'error');
        return;
    }
    
    if (title.length < 3) {
        showToast('Title must be at least 3 characters', 'error');
        return;
    }
    
    if (!description) {
        showToast('Description is required', 'error');
        return;
    }
    
    createTask(title, description).then(success => {
        if (success) {
            const form = document.getElementById('createTaskForm');
            if (form) form.reset();
            const titleCount = document.getElementById('titleCount');
            const descCount = document.getElementById('descCount');
            if (titleCount) titleCount.textContent = '0';
            if (descCount) descCount.textContent = '0';
            document.querySelector('[data-view="tasks"]')?.click();
        }
    });
}

function handleUpdateTask(e) {
    e.preventDefault();
    const id = document.getElementById('editTaskId')?.value;
    const updates = {};
    
    const title = document.getElementById('editTitle')?.value.trim();
    const description = document.getElementById('editDescription')?.value.trim();
    const status = document.getElementById('editStatus')?.value;
    
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (status) updates.status = status;
    
    updateTask(id, updates).then(() => {
        document.getElementById('editModal')?.classList.remove('active');
    });
}

// ========================================
// View Navigation
// ========================================
function switchView(viewName) {
    Object.values(views).forEach(view => {
        if (view) view.classList.remove('active');
    });
    
    if (views[viewName]) views[viewName].classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === viewName) {
            item.classList.add('active');
        }
    });
    
    if (viewName === 'dashboard' || viewName === 'tasks' || viewName === 'calendar') {
        loadAllTasks();
    }
}

// ========================================
// API Health Check
// ========================================
async function checkApiStatus() {
    const statusIndicator = document.getElementById('apiStatus');
    const statusText = document.getElementById('apiStatusText');
    const isOnline = await TaskAPI.checkHealth();
    
    if (statusIndicator && statusText) {
        if (isOnline) {
            statusIndicator.className = 'api-status-indicator online';
            statusText.textContent = 'Connected';
        } else {
            statusIndicator.className = 'api-status-indicator offline';
            statusText.textContent = 'Offline';
        }
    }
}

// ========================================
// Event Listeners Setup
// ========================================
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(btn.dataset.view);
        });
    });
    
    // Forms
    const createForm = document.getElementById('createTaskForm');
    const editForm = document.getElementById('editTaskForm');
    if (createForm) createForm.addEventListener('submit', handleCreateTask);
    if (editForm) editForm.addEventListener('submit', handleUpdateTask);
    
    // Search & Filters
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', renderTasksList);
    }
    
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            renderTasksList();
        });
    });
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderTasksList();
        });
    }
    
    // Modal close buttons
    document.querySelectorAll('.modal-close, #cancelEditBtn, #cancelDeleteBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
    
    // Status selector
    document.querySelectorAll('.status-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.status-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            const statusField = document.getElementById('editStatus');
            if (statusField) statusField.value = opt.dataset.status;
        });
    });
    
    // Refresh buttons
    const refreshDashboard = document.getElementById('refreshDashboardBtn');
    const refreshChart = document.getElementById('refreshChartBtn');
    if (refreshDashboard) refreshDashboard.addEventListener('click', loadAllTasks);
    if (refreshChart) refreshChart.addEventListener('click', () => {
        initTaskChart();
        initActivityChart();
        showToast('Charts refreshed!', 'success');
    });
    
    // Calendar navigation
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');
    if (prevMonth) prevMonth.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    if (nextMonth) nextMonth.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    // Create task button
    const createHeaderBtn = document.getElementById('createTaskHeaderBtn');
    if (createHeaderBtn) createHeaderBtn.addEventListener('click', () => switchView('create'));
    
    // Clear search
    const clearSearch = document.getElementById('clearSearch');
    if (clearSearch && searchInput) {
        searchInput.addEventListener('input', () => {
            clearSearch.style.display = searchInput.value ? 'block' : 'none';
        });
        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            renderTasksList();
            clearSearch.style.display = 'none';
        });
    }
}

// ========================================
// Initialization
// ========================================
window.editTask = editTask;
window.deleteTask = deleteTask;

async function init() {
    console.log('🚀 Initializing TaskFlow...');
    console.log('API URL:', window.TaskAPI ? 'TaskAPI loaded' : 'TaskAPI NOT loaded');
    
    setupEventListeners();
    await checkApiStatus();
    await loadAllTasks();
    switchView('dashboard');
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            loadAllTasks();
        }
    }, 30000);
}

// Start the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}