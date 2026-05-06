// ========================================
// UI CONTROLLER - Premium UI Interactions
// ========================================

class TaskFlowUI {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.main = document.querySelector('.main');
        this.themeToggle = document.getElementById('themeToggle');
        this.fab = document.getElementById('fab');
        this.init();
    }

    init() {
        this.initSidebar();
        this.initTheme();
        this.initFAB();
        this.initDateDisplay();
        this.initInputCounters();
        this.initModalTriggers();
    }

    initSidebar() {
        const toggleBtn = document.getElementById('sidebarToggle');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        if (mobileMenuBtn && sidebarOverlay) {
            mobileMenuBtn.addEventListener('click', () => {
                this.sidebar.classList.add('mobile-open');
                sidebarOverlay.classList.add('active');
            });

            sidebarOverlay.addEventListener('click', () => {
                this.sidebar.classList.remove('mobile-open');
                sidebarOverlay.classList.remove('active');
            });
        }
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.sidebar.classList.toggle('collapsed');
                this.main.classList.toggle('expanded');
                localStorage.setItem('sidebarCollapsed', this.sidebar.classList.contains('collapsed'));
            });
        }

        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState === 'true') {
            this.sidebar.classList.add('collapsed');
            this.main.classList.add('expanded');
        }
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            this.themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
        }

        this.themeToggle.addEventListener('click', () => {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                this.themeToggle.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>';
            } else {
                document.body.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                this.themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
            }
        });
    }

    initFAB() {
        if (this.fab) {
            this.fab.addEventListener('click', () => {
                const createBtn = document.querySelector('[data-view="create"]');
                if (createBtn) createBtn.click();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    initDateDisplay() {
        const dateDisplay = document.querySelector('.date-display');
        if (dateDisplay) {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateDisplay.textContent = now.toLocaleDateString('en-US', options);
        }
    }

    initInputCounters() {
        const titleInput = document.getElementById('taskTitle');
        const descInput = document.getElementById('taskDescription');
        const titleCount = document.getElementById('titleCount');
        const descCount = document.getElementById('descCount');

        if (titleInput && titleCount) {
            titleInput.addEventListener('input', () => {
                titleCount.textContent = titleInput.value.length;
            });
        }

        if (descInput && descCount) {
            descInput.addEventListener('input', () => {
                descCount.textContent = descInput.value.length;
            });
        }
    }

    initModalTriggers() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    static showLoading(element) {
        if (element) {
            element.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            `;
        }
    }

    static showEmpty(element, message = 'No items found') {
        if (element) {
            element.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Initialize UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.taskFlowUI = new TaskFlowUI();
});