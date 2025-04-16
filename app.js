// Study Pace Tracker - Application Logic

// State management
const AppState = {
    taskName: '',
    totalTasks: 0,
    completedTasks: 0,
    deadline: null,
    startDate: null,
    dailyGoal: 1,
    history: [], // [{date: "YYYY-MM-DD", tasksCompleted: Number}]
    darkMode: false, // Dark mode state
    
    // Get today's tasks completed
    getTodayTasksCompleted() {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const todayEntry = this.history.find(item => item.date === today);
        return todayEntry ? todayEntry.tasksCompleted : 0;
    },
    
    // Initialize state from localStorage or with defaults
    init() {
        try {
            const savedState = localStorage.getItem('studyPaceTracker');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                
                // Assign all properties from saved state
                this.taskName = parsedState.taskName || '';
                this.totalTasks = parsedState.totalTasks || 0;
                this.completedTasks = parsedState.completedTasks || 0;
                this.dailyGoal = parsedState.dailyGoal || 1;
                this.history = parsedState.history || [];
                this.darkMode = parsedState.darkMode || false; // Load dark mode preference
                
                // Convert string dates back to Date objects
                if (parsedState.deadline) {
                    this.deadline = new Date(parsedState.deadline);
                }
                
                if (parsedState.startDate) {
                    this.startDate = new Date(parsedState.startDate);
                }
                
                console.log('Loaded state:', this);
            }
        } catch (error) {
            console.error('Error loading saved state:', error);
            // If there's an error loading the state, reset to defaults
            this.reset();
        }
        
        // Apply dark mode if enabled
        if (this.darkMode) {
            this.applyDarkMode();
        }
        
        // Render the UI with the loaded state
        this.render();
    },
    
    // Save state to localStorage
    save() {
        localStorage.setItem('studyPaceTracker', JSON.stringify({
            taskName: this.taskName,
            totalTasks: this.totalTasks,
            completedTasks: this.completedTasks,
            deadline: this.deadline,
            startDate: this.startDate,
            dailyGoal: this.dailyGoal,
            history: this.history,
            darkMode: this.darkMode // Save dark mode preference
        }));
    },
    
    // Reset the app state
    reset() {
        this.taskName = '';
        this.totalTasks = 0;
        this.completedTasks = 0;
        this.deadline = null;
        this.startDate = null;
        this.dailyGoal = 1;
        this.history = [];
        // Don't reset dark mode preference when resetting study data
        localStorage.removeItem('studyPaceTracker');
    },
    
    // Toggle dark mode
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        
        if (this.darkMode) {
            this.applyDarkMode();
        } else {
            this.removeDarkMode();
        }
        
        this.save();
    },
    
    // Apply dark mode
    applyDarkMode() {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').checked = true;
    },
    
    // Remove dark mode
    removeDarkMode() {
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-toggle').checked = false;
    },
    
    // Calculate days left until deadline
    getDaysLeft() {
        if (!this.deadline) return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(this.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    },
    
    // Calculate tasks per day needed to finish on time (minimum required pace)
    getRequiredPace() {
        const daysLeft = this.getDaysLeft();
        const tasksLeft = this.totalTasks - this.completedTasks;
        
        if (daysLeft === 0) return tasksLeft; // All remaining tasks if deadline is today
        if (tasksLeft <= 0) return 0; // No tasks left
        
        return Math.ceil((tasksLeft / daysLeft) * 10) / 10; // Round to 1 decimal place
    },
    
    // Get the progress relative to the user's daily goal
    getDailyGoalProgress() {
        const daysLeft = this.getDaysLeft();
        const tasksLeft = this.totalTasks - this.completedTasks;
        
        if (tasksLeft <= 0) return 100; // All tasks completed
        
        // Calculate how many days we've been studying
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(this.startDate);
        startDate.setHours(0, 0, 0, 0);
        const daysPassed = Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
        
        // Expected progress based on daily goal
        const expectedTasksCompleted = Math.min(this.dailyGoal * daysPassed, this.totalTasks);
        
        // Return percentage of expected progress
        return (this.completedTasks / expectedTasksCompleted) * 100;
    },
    
    // Determine the current study status based on progress
    getStatus() {
        const daysLeft = this.getDaysLeft();
        const tasksLeft = this.totalTasks - this.completedTasks;
        const requiredPace = this.getRequiredPace();
        const goalPace = this.dailyGoal;
        
        // Calculate how many days we've been studying
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(this.startDate);
        startDate.setHours(0, 0, 0, 0);
        const daysPassed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
        
        // Calculate the expected progress based on even distribution
        const expectedProgress = daysPassed / (daysPassed + daysLeft) * this.totalTasks;
        const actualProgress = this.completedTasks;
        
        // Determine status based on comparison
        if (tasksLeft <= 0) {
            return {
                status: 'complete',
                message: 'Congratulations! You\'ve completed all your tasks.'
            };
        } else if (actualProgress >= expectedProgress + goalPace) {
            return {
                status: 'ahead',
                message: `You're ahead of your goal! You can take a break or maintain your lead.`
            };
        } else if (actualProgress < expectedProgress - goalPace) {
            return {
                status: 'way-behind',
                message: `You're falling behind. To catch up, complete at least ${Math.ceil(requiredPace)} tasks per day (your goal: ${goalPace}).`
            };
        } else if (actualProgress < expectedProgress) {
            const neededPace = Math.max(goalPace, Math.ceil(requiredPace));
            return {
                status: 'behind',
                message: `You're slightly behind. Aim for ${neededPace} tasks per day to stay on track with your goal.`
            };
        } else {
            // On track
            const nextMilestone = Math.min(this.totalTasks, this.completedTasks + goalPace);
            return {
                status: 'on-track',
                message: `Nice! You're keeping pace with your goal of ${goalPace} tasks per day. Next milestone: ${nextMilestone}/${this.totalTasks}.`
            };
        }
    },
    
    // Generate helpful tips based on current progress
    getTip() {
        const daysLeft = this.getDaysLeft();
        const tasksLeft = this.totalTasks - this.completedTasks;
        const dailyGoal = this.dailyGoal;
        
        // Only show tips if there are tasks remaining and days left
        if (tasksLeft <= 0 || daysLeft <= 0) {
            return null;
        }
        
        // Calculate if doing extra tasks today would allow skipping days
        const extraTasksNeeded = dailyGoal + 1; // One more than the daily goal
        const tasksAfterExtra = tasksLeft - extraTasksNeeded;
        
        // If we're on track or ahead, and doing extra today would help
        if (tasksLeft <= daysLeft * dailyGoal) {
            // If doing extraTasksNeeded today would let the user skip tomorrow
            if (tasksAfterExtra <= (daysLeft - 1) * dailyGoal) {
                return {
                    message: `Psst... if you complete ${extraTasksNeeded} tasks today, you can skip studying tomorrow!`,
                    type: 'skip-day'
                };
            }
            
            // If doing double today would let the user do half tomorrow
            if (dailyGoal >= 2 && tasksLeft <= (dailyGoal * 2) + ((daysLeft - 1) * (dailyGoal / 2))) {
                return {
                    message: `Tip: Do ${dailyGoal * 2} tasks today, and you'll only need to do ${Math.ceil(dailyGoal / 2)} tomorrow.`,
                    type: 'reduce-load'
                };
            }
        }
        
        // If we're slightly behind but can catch up with a bit of extra work
        const requiredPace = this.getRequiredPace();
        if (requiredPace > dailyGoal && requiredPace <= dailyGoal * 1.5) {
            return {
                message: `Tip: Doing ${Math.ceil(requiredPace)} tasks per day will get you back on track.`,
                type: 'catch-up'
            };
        }
        
        return null;
    },
    
    // Log daily progress
    logProgress(tasksCompleted) {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Check if we already have an entry for today
        const todayIndex = this.history.findIndex(item => item.date === today);
        
        let todayTasksBeforeUpdate = 0;
        if (todayIndex >= 0) {
            // Get current count for today before updating
            todayTasksBeforeUpdate = this.history[todayIndex].tasksCompleted;
            // Update existing entry
            this.history[todayIndex].tasksCompleted += tasksCompleted;
        } else {
            // Add new entry
            this.history.push({
                date: today,
                tasksCompleted
            });
        }
        
        // Calculate tasks after update for today
        const todayTasksAfterUpdate = todayTasksBeforeUpdate + tasksCompleted;
        
        // Check if today's goal was just met
        const wasGoalMet = todayTasksBeforeUpdate >= this.dailyGoal;
        const isGoalNowMet = todayTasksAfterUpdate >= this.dailyGoal;
        
        this.completedTasks += tasksCompleted;
        this.save();
        this.render();
        
        // Show a special message if the user just met their daily goal
        if (!wasGoalMet && isGoalNowMet) {
            alert(`🎉 Congratulations! You've met your daily goal of ${this.dailyGoal} tasks!`);
        }
    },
    
    // Set up new study plan
    setupPlan(taskName, totalTasks, dailyGoal, deadline) {
        // Validate inputs
        if (!taskName || !totalTasks || !dailyGoal || !deadline) {
            console.error('Invalid setup plan parameters:', { taskName, totalTasks, dailyGoal, deadline });
            return false;
        }
        
        try {
            // Parse number inputs
            const parsedTotalTasks = parseInt(totalTasks);
            const parsedDailyGoal = parseInt(dailyGoal);
            
            if (isNaN(parsedTotalTasks) || parsedTotalTasks <= 0) {
                console.error('Invalid total tasks:', totalTasks);
                return false;
            }
            
            if (isNaN(parsedDailyGoal) || parsedDailyGoal <= 0) {
                console.error('Invalid daily goal:', dailyGoal);
                return false;
            }
            
            // Set state values
            this.taskName = taskName;
            this.totalTasks = parsedTotalTasks;
            this.dailyGoal = parsedDailyGoal;
            this.completedTasks = 0;
            this.deadline = new Date(deadline);
            this.startDate = new Date();
            this.history = [];
            
            // Save and render
            this.save();
            this.render();
            return true;
        } catch (error) {
            console.error('Error setting up plan:', error);
            return false;
        }
    },
    
    // Export data as JSON
    exportData() {
        const dataStr = JSON.stringify({
            taskName: this.taskName,
            totalTasks: this.totalTasks,
            completedTasks: this.completedTasks,
            deadline: this.deadline,
            startDate: this.startDate,
            dailyGoal: this.dailyGoal,
            history: this.history
        });
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        
        const exportFileName = `study-tracker-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
    },
    
    // Import data from JSON
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Validate required fields
            if (!data.taskName || !data.totalTasks || !data.deadline) {
                throw new Error('Invalid data format');
            }
            
            // Import data
            this.taskName = data.taskName;
            this.totalTasks = data.totalTasks;
            this.completedTasks = data.completedTasks || 0;
            this.deadline = new Date(data.deadline);
            this.startDate = data.startDate ? new Date(data.startDate) : new Date();
            this.dailyGoal = data.dailyGoal || 1;
            this.history = data.history || [];
            
            this.save();
            this.render();
            return true;
        } catch (error) {
            console.error('Import error:', error);
            alert('Failed to import data. The file format is invalid.');
            return false;
        }
    },
    
    // Render the UI based on current state
    render() {
        const setupSection = document.getElementById('setup-section');
        const trackingSection = document.getElementById('tracking-section');
        
        // Determine which view to show - Only show setup if we don't have the required data
        if (!this.taskName || !this.totalTasks || !this.deadline) {
            setupSection.classList.remove('hidden');
            trackingSection.classList.add('hidden');
            return; // Exit early, nothing else to render
        } else {
            setupSection.classList.add('hidden');
            trackingSection.classList.remove('hidden');
        }
        
        // Update task title
        document.getElementById('task-title').textContent = this.taskName;
        
        // Update stats
        document.getElementById('completed-tasks').textContent = `${this.completedTasks}/${this.totalTasks}`;
        document.getElementById('days-left').textContent = this.getDaysLeft();
        document.getElementById('required-pace').textContent = this.getRequiredPace();
        document.getElementById('daily-goal-display').textContent = this.dailyGoal;
        
        // Update today's goal
        const todaysCompleted = this.getTodayTasksCompleted();
        document.getElementById('today-goal').textContent = `${todaysCompleted}/${this.dailyGoal}`;
        
        // Add visual indicator if today's goal is met
        const todayGoalElement = document.getElementById('today-goal-container');
        if (todaysCompleted >= this.dailyGoal) {
            todayGoalElement.classList.add('goal-met');
            todayGoalElement.classList.remove('goal-not-met');
        } else {
            todayGoalElement.classList.add('goal-not-met');
            todayGoalElement.classList.remove('goal-met');
        }
        
        // Update progress bar - show total progress while using daily goal info for status
        const totalProgressPercentage = (this.completedTasks / this.totalTasks) * 100;
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = `${totalProgressPercentage}%`;
        document.getElementById('progress-percentage').textContent = `${Math.round(totalProgressPercentage)}%`;
        
        // Get goal progress for status calculation only
        const goalProgress = this.getDailyGoalProgress();
        
        // Update feedback message
        const status = this.getStatus();
        const feedbackElement = document.getElementById('feedback-message');
        feedbackElement.textContent = status.message;
        
        // Remove all status classes and add the current one
        feedbackElement.classList.remove('status-on-track', 'status-ahead', 'status-behind', 'status-way-behind');
        if (status.status !== 'complete') {
            feedbackElement.classList.add(`status-${status.status}`);
        }
        
        // Check for and display a helpful tip if available
        const tip = this.getTip();
        const tipElement = document.getElementById('tip-message');
        
        if (tip) {
            tipElement.textContent = tip.message;
            tipElement.classList.remove('hidden');
            
            // Set appropriate styling based on tip type
            tipElement.className = 'tip-container';
            tipElement.classList.add(`tip-${tip.type}`);
        } else {
            tipElement.classList.add('hidden');
        }
        
        // Update tasks completed today input to reflect remaining tasks
        const tasksCompletedTodayInput = document.getElementById('tasks-completed-today');
        const tasksRemainingToday = Math.max(0, this.dailyGoal - todaysCompleted);
        tasksCompletedTodayInput.value = tasksRemainingToday > 0 ? 1 : 0;
        tasksCompletedTodayInput.max = this.totalTasks - this.completedTasks;
        
        // Update history list
        this.renderHistory();
    },
    
    // Render the history list
    renderHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        // Sort history by date, newest first
        const sortedHistory = [...this.history].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        if (sortedHistory.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'history-item';
            emptyItem.textContent = 'No progress recorded yet';
            historyList.appendChild(emptyItem);
            return;
        }
        
        sortedHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const dateSpan = document.createElement('span');
            dateSpan.className = 'history-date';
            // Format date for better readability (e.g., "April 8, 2023")
            const dateObj = new Date(item.date);
            dateSpan.textContent = dateObj.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });
            
            const tasksSpan = document.createElement('span');
            tasksSpan.className = 'history-completed';
            tasksSpan.textContent = `${item.tasksCompleted} task${item.tasksCompleted !== 1 ? 's' : ''} completed`;
            
            historyItem.appendChild(dateSpan);
            historyItem.appendChild(tasksSpan);
            historyList.appendChild(historyItem);
        });
    },
    
    // Set completed tasks directly
    setCompletedTasks(newCount) {
        // Validate the input
        newCount = parseInt(newCount);
        if (isNaN(newCount) || newCount < 0) {
            newCount = 0;
        }
        if (newCount > this.totalTasks) {
            newCount = this.totalTasks;
        }
        
        // Update the completed tasks count
        this.completedTasks = newCount;
        this.save();
        this.render();
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize app state
    AppState.init();
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('change', () => {
        AppState.toggleDarkMode();
    });
    
    // Setup form submission
    const setupForm = document.getElementById('setup-form');
    setupForm.addEventListener('submit', event => {
        event.preventDefault();
        
        // Get form values
        const taskName = document.getElementById('task-name').value.trim();
        const totalTasks = document.getElementById('total-tasks').value;
        const dailyGoal = document.getElementById('daily-goal').value;
        const deadline = document.getElementById('deadline').value;
        
        // Attempt to setup the plan
        const success = AppState.setupPlan(taskName, totalTasks, dailyGoal, deadline);
        
        if (!success) {
            alert('There was an error setting up your study plan. Please check your inputs and try again.');
        }
    });
    
    // Log progress button
    const logProgressBtn = document.getElementById('log-progress-btn');
    logProgressBtn.addEventListener('click', () => {
        const tasksCompleted = parseInt(document.getElementById('tasks-completed-today').value) || 0;
        if (tasksCompleted > 0) {
            AppState.logProgress(tasksCompleted);
            document.getElementById('tasks-completed-today').value = 0;
        }
    });
    
    // Edit plan button
    const editPlanBtn = document.getElementById('edit-plan-btn');
    editPlanBtn.addEventListener('click', () => {
        // Pre-fill the form with current values
        document.getElementById('task-name').value = AppState.taskName;
        document.getElementById('total-tasks').value = AppState.totalTasks;
        document.getElementById('daily-goal').value = AppState.dailyGoal;
        
        // Format date to YYYY-MM-DD for input
        const deadlineDate = new Date(AppState.deadline);
        const year = deadlineDate.getFullYear();
        const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
        const day = String(deadlineDate.getDate()).padStart(2, '0');
        document.getElementById('deadline').value = `${year}-${month}-${day}`;
        
        // Show setup form
        document.getElementById('setup-section').classList.remove('hidden');
        document.getElementById('tracking-section').classList.add('hidden');
    });
    
    // Reset button
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            AppState.reset();
            AppState.render();
        }
    });
    
    // Export button
    const exportBtn = document.getElementById('export-btn');
    exportBtn.addEventListener('click', () => {
        AppState.exportData();
    });
    
    // Import button
    const importBtn = document.getElementById('import-btn');
    importBtn.addEventListener('click', () => {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const jsonData = e.target.result;
                AppState.importData(jsonData);
            };
            reader.readAsText(file);
        };
        
        fileInput.click();
    });
    
    // Set min date for deadline input (today)
    const deadlineInput = document.getElementById('deadline');
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    deadlineInput.min = `${year}-${month}-${day}`;
    
    // Edit tasks button
    const editTasksBtn = document.getElementById('edit-tasks-btn');
    const editTasksModal = document.getElementById('edit-tasks-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const saveTasksBtn = document.getElementById('save-tasks-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const editCompletedTasksInput = document.getElementById('edit-completed-tasks');
    
    // Open modal
    editTasksBtn.addEventListener('click', () => {
        editCompletedTasksInput.value = AppState.completedTasks;
        editCompletedTasksInput.max = AppState.totalTasks;
        editTasksModal.classList.remove('hidden');
    });
    
    // Close modal handlers
    const closeModal = () => {
        editTasksModal.classList.add('hidden');
    };
    
    closeModalBtn.addEventListener('click', closeModal);
    cancelEditBtn.addEventListener('click', closeModal);
    
    // Save changes
    saveTasksBtn.addEventListener('click', () => {
        const newCount = parseInt(editCompletedTasksInput.value);
        AppState.setCompletedTasks(newCount);
        closeModal();
    });
    
    // Close modal if clicking outside
    editTasksModal.addEventListener('click', (event) => {
        if (event.target === editTasksModal) {
            closeModal();
        }
    });
    
    // Allow pressing Enter to save
    editCompletedTasksInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            saveTasksBtn.click();
        }
    });
}); 