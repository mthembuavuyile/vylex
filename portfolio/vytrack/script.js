// Categories configuration
        // Categories configuration with improved organization and subcategories
        const categories = {
            income: [
        'Salary',                // Primary employment income
        'Allowance',             // Monthly support from family or guardians
        'Business Income',       // Self-employed or business earnings
        'Freelance',             // Contract/gig work income
        'Investments',           // Dividends, interest, capital gains
        'Savings',               // Interest or earnings from savings accounts
        'Rental Income',         // Property rental earnings
        'Passive Income',        // Royalties, affiliate marketing, etc.
        'Government Benefits',   // Social security, unemployment, etc.
        'Student Allowance',     // Monthly allowance from family or guardians
        'NSFAS',                 // National Student Financial Aid Scheme for qualifying students
        'Bursaries and Scholarships', // Financial aid based on academic or athletic performance
        'Other Income'           // Miscellaneous income sources
    ],
    
        expense: {
            Housing: [
                'Rent/Mortgage',
                'Property Tax',
                'Home Insurance',
                'Maintenance & Repairs',
                'Utilities',
                'Home Decor'
            ],
            Transportation: [
                'Car Payment',
                'Fuel',
                'Car Insurance',
                'Maintenance & Repairs',
                'Public Transit',
                'Parking'
            ],
            Food: [
                'Groceries',
                'Restaurants',
                'Food Delivery',
                'Snacks & Beverages'
            ],
            Healthcare: [
                'Insurance Premium',
                'Doctor Visits',
                'Medications',
                'Dental Care',
                'Vision Care',
                'Mental Health'
            ],
            Personal: [
                'Clothing',
                'Personal Care',
                'Gym & Fitness',
                'Hair & Beauty',
                'Shopping'
            ],
            Entertainment: [
                'Streaming Services',
                'Gaming',
                'Movies & Events',
                'Hobbies',
                'Sports'
            ],
            Education: [
                'Tuition',
                'Books & Supplies',
                'Online Courses',
                'Professional Development'
            ],
            Technology: [
                'Phone Bill',
                'Internet',
                'Software Subscriptions',
                'Hardware & Gadgets'
            ],
            Financial: [
                'Debt Payments',
                'Insurance',
                'Investments',
                'Savings',
                'Bank Fees'
            ],
            Miscellaneous: [
                'Gifts Given',
                'Charitable Donations',
                'Pet Expenses',
                'Travel',
                'Other'
            ]
        }
    };
    
    // Initialize data structures with version control
    const APP_VERSION = '1.0.0';
    const DEFAULT_CURRENCY = 'zar'; // Changed to USD for general example
    
    // Data persistence
    function saveTransactions() {
        try {
            localStorage.setItem('transactions', JSON.stringify(transactions));
        } catch (e) {
            console.error('Error saving transactions:', e);
            alert('Failed to save transactions. Local storage might be full.');
        }
    }
    
    function saveBudgets() {
        try {
            localStorage.setItem('budgets', JSON.stringify(budgets));
        } catch (e) {
            console.error('Error saving budgets:', e);
            alert('Failed to save budgets. Local storage might be full.');
        }
    }
    
    // Load data on page load
    document.addEventListener('DOMContentLoaded', () => {
        loadSavedData();
        updateUI();
    });
    
    // Function to load all saved data
    function loadSavedData() {
        // Load transactions
        const savedTransactions = localStorage.getItem('transactions');
        if (savedTransactions) {
            try {
                transactions = JSON.parse(savedTransactions);
            } catch (e) {
                console.error('Error loading transactions:', e);
                transactions = [];
            }
        }
    
        // Load budgets
        const savedBudgets = localStorage.getItem('budgets');
        if (savedBudgets) {
            try {
                budgets = JSON.parse(savedBudgets);
            } catch (e) {
                console.error('Error loading budgets:', e);
                budgets = {};
            }
        }
    
        // Initialize dropdowns
        updateCategoryDropdown();
        initializeBudgetDropdown();
    }
    
    // DOM elements
    const transactionForm = document.getElementById('transaction-form-element');
    const transactionsList = document.getElementById('transactions-list');
    const transactionType = document.getElementById('transaction-type');
    const transactionCategory = document.getElementById('transaction-category');
    const transactionSubcategory = document.getElementById('transaction-subcategory');
    const budgetForm = document.getElementById('budget-form-element');
    const budgetCategory = document.getElementById('budget-category');
    const budgetProgress = document.getElementById('budget-progress');
    const burgerMenu = document.getElementById('burger-menu');
    const mainNav = document.getElementById('main-nav');
    const reportMessage = document.getElementById('report-message');
    const profileIcon = document.getElementById('profile-icon');
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileNameInput = document.getElementById('profile-name-input');
    const displayName = document.getElementById('display-name');
    
    // Initialize data structures
    let transactions = (() => {
        const saved = localStorage.getItem('transactions');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error loading transactions:', e);
                return [];
            }
        }
        return [];
    })();
    
    let budgets = (() => {
        const saved = localStorage.getItem('budgets');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error loading budgets:', e);
                return {};
            }
        }
        return {};
    })();
    
    // Enhanced category dropdown initialization
    function updateCategoryDropdown() {
        const type = transactionType.value;
        transactionCategory.innerHTML = '<option value="">Select Category</option>';
    
        if (type === 'income') {
            categories.income.forEach(category => {
                transactionCategory.innerHTML += `<option value="${category}">${category}</option>`;
            });
        } else if (type === 'expense') {
            Object.keys(categories.expense).forEach(category => {
                transactionCategory.innerHTML += `<option value="${category}">${category}</option>`;
            });
        }
    
        updateSubcategoryDropdown();
    }
    
    // New subcategory dropdown handling
    function updateSubcategoryDropdown() {
        const type = transactionType.value;
        const category = transactionCategory.value;
    
        transactionSubcategory.innerHTML = '<option value="">Select Subcategory</option>';
    
        if (type === 'expense' && category && categories.expense[category]) {
            categories.expense[category].forEach(subcategory => {
                transactionSubcategory.innerHTML += `<option value="${subcategory}">${subcategory}</option>`;
            });
            document.getElementById('subcategory-group').style.display = 'block';
        } else {
            document.getElementById('subcategory-group').style.display = 'none';
        }
    }
    
    // Initialize budget category dropdown
    function initializeBudgetDropdown() {
        budgetCategory.innerHTML = '<option value="">Select Category</option>';
        Object.keys(categories.expense).forEach(category => {
            budgetCategory.innerHTML += `<option value="${category}">${category}</option>`;
        });
    }
    
    // Event listeners
    transactionType.addEventListener('change', updateCategoryDropdown);
    transactionCategory.addEventListener('change', updateSubcategoryDropdown);
    
    // Enhanced transaction addition
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
    
        const type = transactionType.value;
        const description = document.getElementById('transaction-description').value;
        const category = transactionCategory.value;
        const subcategory = transactionSubcategory.value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const date = document.getElementById('transaction-date')?.value || new Date().toISOString().split('T')[0];
    
        if (!type || !description || !category || !amount) {
            alert('Please fill in all required fields');
            return;
        }
    
        const transaction = {
            id: Date.now(),
            type,
            description,
            category,
            subcategory: type === 'expense' ? subcategory : '',
            amount,
            date,
            currency: DEFAULT_CURRENCY,
            createdAt: new Date().toISOString()
        };
    
        transactions.unshift(transaction);
        saveTransactions();
        updateUI();
        transactionForm.reset();
    });
    
    // Enhanced budget setting
    budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
    
        const category = budgetCategory.value;
        const amount = parseFloat(document.getElementById('budget-amount').value);
        const period = document.getElementById('budget-period')?.value || 'monthly';
    
        if (!category || !amount) {
            alert('Please fill in all required fields');
            return;
        }
    
        budgets[category] = {
            amount,
            period,
            lastUpdated: new Date().toISOString()
        };
    
        saveBudgets();
        updateBudgetProgress();
        budgetForm.reset();
    });
    
    // Enhanced transaction list with better formatting
    function updateTransactionsList() {
        transactionsList.innerHTML = transactions.map(transaction => `
            <li class="entry-item ${transaction.type}">
                <div class="transaction-info">
                    <strong>${transaction.description}</strong>
                    <span>${transaction.category}${transaction.subcategory ? ` › ${transaction.subcategory}` : ''}</span>
                    <small>${new Date(transaction.date).toLocaleDateString()}</small>
                </div>
                <div class="transaction-amount">
                    <span class="${transaction.type}-amount">
                        ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                    </span>
                    <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `).join('');
    }
    
    // Currency formatting helper
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: DEFAULT_CURRENCY
        }).format(amount);
    }
    
    // Enhanced transaction deletion with confirmation
    function deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            transactions = transactions.filter(t => t.id !== id);
            saveTransactions();
            updateUI();
        }
    }
    
    // Enhanced summary calculation
    function updateSummary() {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
    
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
    
        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
    
        document.getElementById('total-income').textContent = formatCurrency(totalIncome);
        document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
        document.getElementById('balance').textContent = formatCurrency(balance);
        document.getElementById('savings-rate').textContent = `${savingsRate.toFixed(1)}%`;
    }
    
    // Enhanced budget progress with better visualization
    function updateBudgetProgress() {
        budgetProgress.innerHTML = '';
    
        Object.entries(budgets).forEach(([category, budget]) => {
            const categoryExpenses = transactions
                .filter(t => t.type === 'expense' && t.category === category)
                .reduce((sum, t) => sum + t.amount, 0);
    
            const percentage = (categoryExpenses / budget.amount) * 100;
            const status = percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good';
    
            budgetProgress.innerHTML += `
                <div class="budget-category">
                    <div class="budget-header">
                        <strong>${category}</strong>
                        <span>${formatCurrency(categoryExpenses)} / ${formatCurrency(budget.amount)}</span>
                    </div>
                    <div class="budget-bar">
                        <div class="budget-fill ${status}"
                             style="width: ${Math.min(percentage, 100)}%">
                        </div>
                    </div>
                    <div class="budget-footer">
                        <small>${percentage.toFixed(1)}% used</small>
                        <small>Updated: ${new Date(budget.lastUpdated).toLocaleDateString()}</small>
                    </div>
                </div>
            `;
        });
    }
    
    // Enhanced expense chart with better categorization
    function updateExpenseChart() {
        const ctx = document.getElementById('expense-chart').getContext('2d');
    
        const categoryTotals = {};
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
            });
    
        if (window.expenseChart) {
            window.expenseChart.destroy();
        }
    
        const chartColors = {
            Housing: '#2563eb',
            Transportation: '#dc2626',
            Food: '#16a34a',
            Healthcare: '#ca8a04',
            Personal: '#7c3aed',
            Entertainment: '#db2777',
            Education: '#0891b2',
            Technology: '#4b5563',
            Financial: '#059669',
            Miscellaneous: '#9ca3af'
        };
    
        window.expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryTotals),
                datasets: [{
                    data: Object.values(categoryTotals),
                    backgroundColor: Object.keys(categoryTotals).map(category => chartColors[category] || '#9ca3af'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            generateLabels: function(chart) {
                                const data = chart.data;
                                const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
    
                                return data.labels.map((label, i) => ({
                                    text: `${label} (${((data.datasets[0].data[i] / total) * 100).toFixed(1)}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: isNaN(data.datasets[0].data[i]),
                                    index: i
                                }));
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Expense Distribution',
                        font: {
                            size: 16
                        }
                    }
                }
            }
        });
    }
    
    // Enhanced monthly chart with better visualization
    function updateMonthlyChart() {
        const ctx = document.getElementById('monthly-chart').getContext('2d');
    
        const monthlyData = {};
        transactions.forEach(t => {
            const month = new Date(t.date).toLocaleString('default', { month: 'long' });
            if (!monthlyData[month]) {
                monthlyData[month] = { income: 0, expenses: 0 };
            }
            if (t.type === 'income') {
                monthlyData[month].income += t.amount;
            } else {
                monthlyData[month].expenses += t.amount;
            }
        });
    
        if (window.monthlyChart) {
            window.monthlyChart.destroy();
        }
    
        window.monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(monthlyData),
                datasets: [
                    {
                        label: 'Income',
                        data: Object.values(monthlyData).map(d => d.income),
                        backgroundColor: 'rgba(22, 163, 74, 0.7)',
                        borderColor: 'rgba(22, 163, 74, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Expenses',
                        data: Object.values(monthlyData).map(d => d.expenses),
                        backgroundColor: 'rgba(220, 38, 38, 0.7)',
                        borderColor: 'rgba(220, 38, 38, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount ($)',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            callback: value => formatCurrency(value)
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Income vs Expenses',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                }
            }
    
        });
    }
    
    // Enhanced UI update function with error handling
    function updateUI() {
        try {
            if (transactions.length === 0) {
                // Show empty state message for transactions
                transactionsList.innerHTML = `
                    <div class="empty-state">
                        <p>No transactions yet. Add your first transaction to get started!</p>
                    </div>
                `;
            } else {
                updateTransactionsList();
            }
    
            if (Object.keys(budgets).length === 0) {
                // Show empty state message for budgets
                budgetProgress.innerHTML = `
                    <div class="empty-state">
                        <p>No budgets set. Set your first budget to track your spending!</p>
                    </div>
                `;
            } else {
                updateBudgetProgress();
            }
    
            updateSummary();
            updateExpenseChart();
            updateMonthlyChart();
            updateReportMessage();
        } catch (error) {
            console.error('Error updating UI:', error);
            alert('There was an error updating the display. Please refresh the page.');
        }
    }
    
    // Enhanced report message with more detailed insights
    function updateReportMessage() {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
    
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
    
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
        const name = localStorage.getItem('userName') || 'User';
    
        let message = `<strong>${name}</strong>, `;
        if (totalIncome > totalExpenses) {
            message += `you're saving ${savingsRate.toFixed(1)}% of your income. `;
            if (savingsRate > 20) {
                message += 'Excellent saving habits!';
            } else if (savingsRate > 10) {
                message += 'Good progress on your savings.';
            } else {
                message += 'Consider ways to increase your savings rate.';
            }
        } else {
            message += 'your expenses exceed your income. ';
            message += 'Consider reviewing your budget and finding ways to reduce expenses.';
        }
    
        reportMessage.innerHTML = message;
    }
    
    // Navigation handling with smooth transitions
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').slice(1);
    
            // Handle section visibility and opacity
            document.querySelectorAll('.section').forEach(section => {
                if (section.id === targetId) {
                    section.style.display = 'block';
                    setTimeout(() => {
                        section.style.opacity = '1'; // Set opacity for visible section
                    }, 50);
                } else {
                    section.style.opacity = '0'; // Fade out
                    setTimeout(() => {
                        section.style.display = 'none'; // Hide after fade out
                    }, 200); // Match this with your CSS transition duration
                }
            });
    
            // Close navigation on mobile
            if (window.innerWidth <= 768) {
                mainNav.classList.remove('active');
                burgerMenu.classList.remove('active');
            }
    
            // Remove active class from all links and add to current
            document.querySelectorAll('.main-nav a').forEach(navLink => navLink.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
    
    // Enhanced mobile navigation
    burgerMenu.addEventListener('click', () => {
        burgerMenu.classList.toggle('active');
        mainNav.classList.toggle('active');
    });
    
    function initializeDefaultView() {
        // Show dashboard section by default
        const dashboardSection = document.getElementById('dashboard');
        if (dashboardSection) {
            dashboardSection.style.display = 'block';
            setTimeout(() => {
                dashboardSection.style.opacity = '1'; // Fade in effect
            }, 50);
        }
    }
    
    // Initialize profile and default view when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        initializeProfile();
        initializeDefaultView();
    });
    
    
    // Initialize profile on page load
    function initializeProfile() {
        const savedName = localStorage.getItem('userName');
        if (savedName) {
            displayName.textContent = savedName;
            profileIcon.textContent = getInitials(savedName);
            profileNameInput.value = savedName;
        } else {
            displayName.textContent = 'User';
            profileIcon.textContent = 'U'; // Default icon
        }
    }
    
    // Get initials from name (e.g., "John Doe" -> "JD")
    function getInitials(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }
    
    // Save user's name
    function saveName() {
        const name = profileNameInput.value.trim();
        if (name) {
            localStorage.setItem('userName', name);
            displayName.textContent = name;
            profileIcon.textContent = getInitials(name);
            profileDropdown.classList.remove('active');
        }
    }
    
    // Toggle profile dropdown
    profileIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target) && !profileIcon.contains(e.target)) {
            profileDropdown.classList.remove('active');
        }
    });
    
    
    // Create and style the logout button
    const logoutButton = document.createElement('button');
    logoutButton.id = 'logout-btn';
    logoutButton.className = 'logout-button';
    
    // Create the icon element
    const icon = document.createElement('i');
    icon.className = 'fas fa-sign-out-alt'; // Font Awesome class for the logout icon
    
    // Append the icon and text to the button
    logoutButton.appendChild(icon);
    logoutButton.appendChild(document.createTextNode(' Logout')); // Add space before text
    
    document.querySelector('#profile-dropdown').appendChild(logoutButton);
    
    // Add logout functionality
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout? This will clear all your data.')) {
            // Clear all local storage
            localStorage.clear();
    
            // Reset all data structures
            transactions = [];
            budgets = {};
    
            // Reset forms
            transactionForm.reset();
            budgetForm.reset();
    
            // Reset profile
            displayName.textContent = 'User';
            profileIcon.textContent = 'U';
            profileNameInput.value = '';
    
            // Update UI
            updateUI();
    
            // Close profile dropdown
            profileDropdown.classList.remove('active');
    
            // Show confirmation message
            alert('Successfully logged out. All data has been cleared.');
    
            // Optionally reload the page for a fresh start
            window.location.reload();
        }
    });
    
    // Add empty state styles - already in CSS, no need to add again dynamically
    
            // Initialize dropdowns on page load
            updateCategoryDropdown();
            initializeBudgetDropdown();