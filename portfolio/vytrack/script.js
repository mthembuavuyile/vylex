// --- State & Initialization ---
let transactions = JSON.parse(localStorage.getItem('vytrack_transactions')) || [];
let budgets = JSON.parse(localStorage.getItem('vytrack_budgets')) || {};
let chartInstance = null;

// NEW: Time tracking state
let currentViewDate = new Date(); // Defaults to today

// DOM Elements
const omniInput = document.getElementById('omni-input');
const budgetCatInput = document.getElementById('budget-category');
const budgetLimitInput = document.getElementById('budget-limit');
const addBudgetBtn = document.getElementById('add-budget-btn');
const budgetListEl = document.getElementById('budget-list');
const txList = document.getElementById('transaction-list');
const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const savingsRateEl = document.getElementById('savings-rate');
const clearDataBtn = document.getElementById('clear-data');
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const monthDisplayEl = document.getElementById('current-month-display');
const htmlEl = document.documentElement;

// Theme Initialization
const savedTheme = localStorage.getItem('vytrack_theme') || 'dark';
htmlEl.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

// --- Core Logic ---

function parseInput(input) {
    input = input.trim();
    if (!input) return null;

    const regex = /^([+-]?\d+(?:\.\d+)?)\s+(.+)$/;
    const match = input.match(regex);

    if (!match) return null;

    const amountRawStr = match[1];
    let amount = parseFloat(amountRawStr);
    const text = match[2].trim().toLowerCase();

    let type = 'expense';
    if (amountRawStr.startsWith('+')) {
        type = 'income';
    } else {
        amount = Math.abs(amount);
    }

    // Force the new transaction to save in the CURRENTLY VIEWED month
    // (So if you are looking at last month, it saves it to last month)
    const txDate = new Date(currentViewDate);
    if (txDate.getMonth() === new Date().getMonth()) {
        txDate.setDate(new Date().getDate()); // If current month, use today's exact day
    } else {
        txDate.setDate(1); // If past month, just set to the 1st
    }

    return {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        amount: amount,
        category: text,
        type: type,
        date: txDate.toISOString()
    };
}

function getIconForCategory(category) {
    const cat = category.toLowerCase();
    if (cat.includes('food') || cat.includes('lunch') || cat.includes('dinner') || cat.includes('burger') || cat.includes('eat')) return 'fa-burger';
    if (cat.includes('coffee') || cat.includes('cafe')) return 'fa-mug-hot';
    if (cat.includes('gas') || cat.includes('fuel') || cat.includes('car')) return 'fa-gas-pump';
    if (cat.includes('grocery') || cat.includes('shop') || cat.includes('supermarket')) return 'fa-basket-shopping';
    if (cat.includes('bill') || cat.includes('rent') || cat.includes('sub') || cat.includes('water') || cat.includes('power')) return 'fa-file-invoice-dollar';
    if (cat.includes('health') || cat.includes('doc') || cat.includes('med') || cat.includes('gym')) return 'fa-heart-pulse';
    if (cat.includes('travel') || cat.includes('flight') || cat.includes('taxi') || cat.includes('uber')) return 'fa-plane';
    if (cat.includes('salary') || cat.includes('pay') || cat.includes('wage') || cat.includes('freelance')) return 'fa-money-bill-wave';
    if (cat.includes('home') || cat.includes('house')) return 'fa-house';
    if (cat.includes('game') || cat.includes('movie') || cat.includes('fun')) return 'fa-gamepad';
    return 'fa-tag';
}

// --- Date & Filtering Logic ---

window.changeMonth = function (offset) {
    currentViewDate.setMonth(currentViewDate.getMonth() + offset);
    updateUI();
}

function getFilteredTransactions() {
    const viewMonth = currentViewDate.getMonth();
    const viewYear = currentViewDate.getFullYear();

    return transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === viewMonth && txDate.getFullYear() === viewYear;
    });
}

function updateMonthDisplay() {
    const options = { month: 'long', year: 'numeric' };
    monthDisplayEl.innerText = currentViewDate.toLocaleDateString('en-US', options);
}

// --- Event Listeners ---

omniInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const tx = parseInput(omniInput.value);
        if (tx) {
            transactions.unshift(tx);
            saveData();
            omniInput.value = '';

            omniInput.closest('.hero-search').style.transform = 'scale(1.02)';
            setTimeout(() => { omniInput.closest('.hero-search').style.transform = 'scale(1)'; }, 150);
        } else {
            omniInput.style.animation = 'shake 0.4s';
            setTimeout(() => omniInput.style.animation = '', 400);
        }
    }
});

clearDataBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all transactions?')) {
        transactions = [];
        saveData();
    }
});

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('vytrack_theme', newTheme);
    updateThemeIcon(newTheme);
    updateChart();
});

function updateThemeIcon(theme) {
    themeIcon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
}

window.deleteTransaction = function (id) {
    transactions = transactions.filter(tx => tx.id !== id);
    saveData();
}

window.deleteBudget = function (cat) {
    delete budgets[cat];
    localStorage.setItem('vytrack_budgets', JSON.stringify(budgets));
    updateUI();
}

addBudgetBtn.addEventListener('click', () => {
    const cat = budgetCatInput.value.trim().toLowerCase();
    const limit = parseFloat(budgetLimitInput.value);
    if (cat && limit > 0) {
        budgets[cat] = limit;
        localStorage.setItem('vytrack_budgets', JSON.stringify(budgets));
        budgetCatInput.value = '';
        budgetLimitInput.value = '';
        updateUI();
    }
});

// --- UI Updates ---

function saveData() {
    localStorage.setItem('vytrack_transactions', JSON.stringify(transactions));
    updateUI();
}

const formatMoney = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatDate = (isoString) => {
    const date = new Date(isoString);
    if (date.toDateString() === new Date().toDateString()) return 'Today';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function updateUI() {
    updateMonthDisplay();
    const filteredTx = getFilteredTransactions();

    let income = 0;
    let expenses = 0;
    txList.innerHTML = '';

    if (filteredTx.length === 0) {
        txList.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-ghost"></i>
                <p>No transactions for this month.</p>
            </div>`;
    } else {
        filteredTx.forEach(tx => {
            if (tx.type === 'income') income += tx.amount;
            else expenses += tx.amount;

            const iconClass = getIconForCategory(tx.category);
            const sign = tx.type === 'income' ? '+' : '-';

            const div = document.createElement('div');
            div.className = 'tx-item';
            div.innerHTML = `
                <div class="tx-left">
                    <div class="tx-icon ${tx.type}"><i class="fa-solid ${iconClass}"></i></div>
                    <div class="tx-details">
                        <h4>${tx.category}</h4>
                        <p>${formatDate(tx.date)}</p>
                    </div>
                </div>
                <div class="tx-right">
                    <div class="tx-amount ${tx.type}">${sign}${formatMoney(tx.amount)}</div>
                    <button class="delete-btn" onclick="deleteTransaction('${tx.id}')"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
            txList.appendChild(div);
        });
    }

    const balance = income - expenses;
    let savingsRate = income > 0 ? Math.max(((income - expenses) / income) * 100, 0) : 0;

    totalBalanceEl.innerText = formatMoney(balance);
    totalIncomeEl.innerText = formatMoney(income);
    totalExpensesEl.innerText = formatMoney(expenses);
    savingsRateEl.innerText = `${savingsRate.toFixed(1)}%`;

    updateBudgets(filteredTx);
    updateChart(filteredTx);
}

function updateBudgets(filteredTx) {
    budgetListEl.innerHTML = '';

    const spentPerCat = {};
    // ONLY calculate spending from the currently viewed month
    filteredTx.forEach(tx => {
        if (tx.type === 'expense') {
            const cat = tx.category.toLowerCase();
            let matchedCat = cat;

            Object.keys(budgets).forEach(budgetKey => {
                if (cat.includes(budgetKey) || budgetKey.includes(cat)) matchedCat = budgetKey;
            });
            spentPerCat[matchedCat] = (spentPerCat[matchedCat] || 0) + tx.amount;
        }
    });

    const budgetKeys = Object.keys(budgets);
    if (budgetKeys.length === 0) {
        budgetListEl.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No budgets set yet. Add one above!</p>';
        return;
    }

    budgetKeys.forEach(cat => {
        const limit = budgets[cat];
        const spent = spentPerCat[cat] || 0;
        const percent = Math.min((spent / limit) * 100, 100);

        let colorClass = percent >= 100 ? 'danger' : (percent > 75 ? 'warning' : '');

        const div = document.createElement('div');
        div.className = 'budget-item';
        div.innerHTML = `
            <div class="budget-header">
                <div><span style="text-transform: capitalize;">${cat}</span>: ${formatMoney(spent)} / ${formatMoney(limit)}</div>
                <div>${percent.toFixed(0)}% <button class="budget-delete" onclick="deleteBudget('${cat}')" title="Delete Budget"><i class="fa-solid fa-xmark"></i></button></div>
            </div>
            <div class="budget-track">
                <div class="budget-fill ${colorClass}" style="width: ${percent}%"></div>
            </div>
        `;
        budgetListEl.appendChild(div);
    });
}

function updateChart(filteredTx) {
    const expenseData = {};

    // ONLY chart data for the currently viewed month
    filteredTx.forEach(tx => {
        if (tx.type === 'expense') {
            const cat = tx.category.split(' ')[0].toLowerCase();
            expenseData[cat] = (expenseData[cat] || 0) + tx.amount;
        }
    });

    const labels = Object.keys(expenseData);
    const data = Object.values(expenseData);
    const isLightMode = htmlEl.getAttribute('data-theme') === 'light';

    if (chartInstance) chartInstance.destroy();

    const ctx = document.getElementById('expense-chart').getContext('2d');
    if (labels.length === 0) { labels.push("No Expenses"); data.push(1); }

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: filteredTx.length === 0 || data.reduce((a, b) => a + b, 0) === 0
                    ? [isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)']
                    : ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6', '#14b8a6'],
                borderWidth: isLightMode ? 2 : 0,
                borderColor: isLightMode ? '#ffffff' : 'transparent',
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '70%',
            plugins: {
                legend: { position: 'right', labels: { color: isLightMode ? '#64748b' : '#94a3b8', font: { family: "'Outfit', sans-serif" }, usePointStyle: true } },
                tooltip: { callbacks: { label: ctx => filteredTx.length === 0 ? ' No data' : ` ${ctx.label}: ${formatMoney(ctx.raw)}` } }
            }
        }
    });
}

// Initial Render
updateUI();