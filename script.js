document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const splashScreen = document.getElementById('splashScreen');
    const loginScreen = document.getElementById('loginScreen');
    const signupScreen = document.getElementById('signupScreen');
    const forgotPasswordScreen = document.getElementById('forgotPasswordScreen');
    const dashboardScreen = document.getElementById('dashboardScreen');
    const createRecordScreen = document.getElementById('createRecordScreen');
    const bankBalanceScreen = document.getElementById('bankBalanceScreen');
    const monthlySummaryScreen = document.getElementById('monthlySummaryScreen');
    const allRecordsScreen = document.getElementById('allRecordsScreen');

    const profileModal = document.getElementById('profileModal');
    const editProfileModal = document.getElementById('editProfileModal');
    const deleteAccountModal = document.getElementById('deleteAccountModal');

    const customAlert = document.getElementById('customAlert');

    const backgroundSound = document.getElementById('backgroundSound');
    const welcomeSound = document.getElementById('welcomeSound');

    // Show splash screen first
    setTimeout(() => {
        splashScreen.style.display = 'none';

        // Check if user exists in localStorage
        const users = JSON.parse(localStorage.getItem('moneyGuardUsers')) || {};
        const currentUser = localStorage.getItem('moneyGuardCurrentUser');

        if (currentUser && users[currentUser]) {
            showScreen(loginScreen);
        } else {
            showScreen(signupScreen);
        }

        // Play background sound at low volume
        backgroundSound.volume = 0.2;
        backgroundSound.play();
    }, 2000);

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.textContent = '🌙';
            localStorage.setItem('moneyGuardTheme', 'dark');
        } else {
            themeToggle.textContent = '☀️';
            localStorage.setItem('moneyGuardTheme', 'light');
        }
    });

    // Check saved theme
    if (localStorage.getItem('moneyGuardTheme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '🌙';
    }

    // Navigation
    document.getElementById('goToSignup').addEventListener('click', () => showScreen(signupScreen));
    document.getElementById('goToLogin').addEventListener('click', () => showScreen(loginScreen));
    document.getElementById('forgotPasswordLink').addEventListener('click', () => showScreen(forgotPasswordScreen));
    document.getElementById('backToLogin').addEventListener('click', () => showScreen(loginScreen));

    document.getElementById('createRecordBtn').addEventListener('click', () => showScreen(createRecordScreen));
    document.getElementById('checkBalanceBtn').addEventListener('click', () => showScreen(bankBalanceScreen));
    document.getElementById('monthlySummaryBtn').addEventListener('click', showMonthlySummary);
    document.getElementById('allRecordsBtn').addEventListener('click', showAllRecords);

    document.getElementById('backToDashboard').addEventListener('click', () => showScreen(dashboardScreen));
    document.getElementById('backToDashboardFromBalance').addEventListener('click', () => showScreen(dashboardScreen));
    document.getElementById('backToDashboardFromSummary').addEventListener('click', () => showScreen(dashboardScreen));
    document.getElementById('backToDashboardFromRecords').addEventListener('click', () => showScreen(dashboardScreen));

    // Record type selection
    document.getElementById('receiveMoneyBtn').addEventListener('click', () => {
        document.getElementById('incomeForm').style.display = 'block';
        document.getElementById('expenseForm').style.display = 'none';
    });

    document.getElementById('sendMoneyBtn').addEventListener('click', () => {
        document.getElementById('incomeForm').style.display = 'none';
        document.getElementById('expenseForm').style.display = 'block';
    });

    // Profile
    document.getElementById('avatar').addEventListener('click', showProfile);
    document.getElementById('closeProfileModal').addEventListener('click', () => profileModal.style.display = 'none');
    document.getElementById('closeEditProfileModal').addEventListener('click', () => editProfileModal.style.display = 'none');
    document.getElementById('closeDeleteAccountModal').addEventListener('click', () => deleteAccountModal.style.display = 'none');

    document.getElementById('editProfileBtn').addEventListener('click', showEditProfile);
    document.getElementById('deleteAccountBtn').addEventListener('click', () => deleteAccountModal.style.display = 'flex');

    document.getElementById('cancelDeleteAccount').addEventListener('click', () => deleteAccountModal.style.display = 'none');
    document.getElementById('confirmDeleteAccount').addEventListener('click', deleteAccount);

    // Forms
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('forgotPasswordForm').addEventListener('submit', handleForgotPassword);
    document.getElementById('incomeFormData').addEventListener('submit', handleIncome);
    document.getElementById('expenseFormData').addEventListener('submit', handleExpense);
    document.getElementById('editProfileForm').addEventListener('submit', handleEditProfile);
    document.getElementById('balancePasswordFormData').addEventListener('submit', handleBalancePassword);

    // Filter functionality
    document.getElementById('applyFilters').addEventListener('click', applyFilters);

    // Functions
    function showScreen(screen) {
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => s.classList.remove('active'));

        // Show requested screen
        screen.classList.add('active');
    }

    function showAlert(message, isSuccess = true) {
        customAlert.textContent = message;
        customAlert.style.background = isSuccess ? 'var(--primary-gradient)' : 'var(--danger-gradient)';
        customAlert.style.display = 'block';

        setTimeout(() => {
            customAlert.style.display = 'none';
        }, 3000);
    }

    function speakWelcomeMessage(username, gender) {
        // Use the browser's speech synthesis API
        if ('speechSynthesis' in window) {
            const greeting = gender === 'male' ? 'Mr.' : 'Miss';
            const message = `  Welcome, ${greeting} ${username}`;

            const speech = new SpeechSynthesisUtterance(message);
            speech.volume = 1;
            speech.rate = 1;
            speech.pitch = 1;

            window.speechSynthesis.speak(speech);
        }
    }

    function handleSignup(e) {
        e.preventDefault();

        const username = document.getElementById('signupUsername').value;
        const gender = document.getElementById('signupGender').value;
        const password = document.getElementById('signupPassword').value;
        const securityQuestion = document.getElementById('securityQuestion').value;
        const securityAnswer = document.getElementById('securityAnswer').value;

        // Get users from localStorage or initialize empty object
        const users = JSON.parse(localStorage.getItem('moneyGuardUsers')) || {};

        // Check if username already exists
        if (users[username]) {
            showAlert('Username already exists. Please choose a different one.', false);
            return;
        }

        // Save user data
        users[username] = {
            gender,
            password,
            securityQuestion,
            securityAnswer,
            transactions: [],
            balance: 0
        };

        localStorage.setItem('moneyGuardUsers', JSON.stringify(users));
        localStorage.setItem('moneyGuardCurrentUser', username);

        showAlert('Account created successfully!');
        showScreen(dashboardScreen);
        updateDashboard(username, users[username]);
    }

    function handleLogin(e) {
        e.preventDefault();

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const users = JSON.parse(localStorage.getItem('moneyGuardUsers')) || {};

        if (!users[username] || users[username].password !== password) {
            showAlert('Invalid username or password', false);
            return;
        }

        // Set current user
        localStorage.setItem('moneyGuardCurrentUser', username);

        // Play welcome sound
        welcomeSound.play();

        // Speak welcome message
        speakWelcomeMessage(username, users[username].gender);

        // Show welcome message based on gender
        const greeting = users[username].gender === 'male' ? 'Mr.' : 'Miss';
        showAlert(`Welcome to Money Guard, ${greeting} ${username}`);

        showScreen(dashboardScreen);
        updateDashboard(username, users[username]);
    }

    function handleForgotPassword(e) {
        e.preventDefault();

        const username = document.getElementById('resetUsername').value;
        const securityQuestion = document.getElementById('securityQuestionReset').value;
        const securityAnswer = document.getElementById('securityAnswerReset').value;
        const newPassword = document.getElementById('newPassword').value;

        const users = JSON.parse(localStorage.getItem('moneyGuardUsers')) || {};

        if (!users[username]) {
            showAlert('Username not found', false);
            return;
        }

        if (users[username].securityQuestion !== securityQuestion ||
            users[username].securityAnswer !== securityAnswer) {
            showAlert('Security answer is incorrect', false);
            return;
        }

        // Update password
        users[username].password = newPassword;
        localStorage.setItem('moneyGuardUsers', JSON.stringify(users));

        showAlert('Password reset successfully!');
        showScreen(loginScreen);
    }

    function handleIncome(e) {
        e.preventDefault();

        const currentUser = localStorage.getItem('moneyGuardCurrentUser');
        if (!currentUser) {
            showAlert('Please login first', false);
            showScreen(loginScreen);
            return;
        }

        const users = JSON.parse(localStorage.getItem('moneyGuardUsers'));
        const user = users[currentUser];

        const date = document.getElementById('incomeDate').value;
        const amount = parseFloat(document.getElementById('incomeAmount').value);
        const source = document.getElementById('incomeSource').value;
        const reason = document.getElementById('incomeReason').value;

        // Create transaction
        const transaction = {
            type: 'income',
            date,
            amount,
            source,
            reason,
            balance: user.balance + amount
        };

        // Update user data
        user.balance += amount;
        user.transactions.push(transaction);

        // Save to localStorage
        users[currentUser] = user;
        localStorage.setItem('moneyGuardUsers', JSON.stringify(users));

        // Show confirmation
        showAlert(`You received ₹${amount}. Please check PhonePe/GPay to confirm.`);

        // Reset form
        document.getElementById('incomeFormData').reset();
    }

    function handleExpense(e) {
        e.preventDefault();

        const currentUser = localStorage.getItem('moneyGuardCurrentUser');
        if (!currentUser) {
            showAlert('Please login first', false);
            showScreen(loginScreen);
            return;
        }

        const users = JSON.parse(localStorage.getItem('moneyGuardUsers'));
        const user = users[currentUser];

        const date = document.getElementById('expenseDate').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const recipient = document.getElementById('expenseRecipient').value;
        const reason = document.getElementById('expenseReason').value;

        // Check if sufficient balance
        if (user.balance < amount) {
            showAlert('Insufficient balance', false);
            return;
        }

        // Create transaction
        const transaction = {
            type: 'expense',
            date,
            amount,
            recipient,
            reason,
            balance: user.balance - amount
        };

        // Update user data
        user.balance -= amount;
        user.transactions.push(transaction);

        // Save to localStorage
        users[currentUser] = user;
        localStorage.setItem('moneyGuardUsers', JSON.stringify(users));

        // Show confirmation
        showAlert(`Your remaining balance is ₹${user.balance}. Please check PhonePe/GPay to confirm.`);

        // Reset form
        document.getElementById('expenseFormData').reset();
    }

    function handleBalancePassword(e) {
        e.preventDefault();

        const currentUser = localStorage.getItem('moneyGuardCurrentUser');
        if (!currentUser) {
            showAlert('Please login first', false);
            showScreen(loginScreen);
            return;
        }

        const password = document.getElementById('balancePassword').value;
        const users = JSON.parse(localStorage.getItem('moneyGuardUsers'));
        const user = users[currentUser];

        if (user.password !== password) {
            showAlert('Incorrect password', false);
            return;
        }

        document.getElementById('balancePasswordForm').style.display = 'none';
        document.getElementById('balanceDisplay').style.display = 'block';
        document.getElementById('currentBalance').textContent = `₹${user.balance}`;
    }

    function showMonthlySummary() {
        const currentUser = localStorage.getItem('moneyGuardCurrentUser');
        if (!currentUser) {
            showAlert('Please login first', false);
            showScreen(loginScreen);
            return;
        }

        const users = JSON.parse(localStorage.getItem('moneyGuardUsers'));
        const user = users[currentUser];

        // Get current month and year
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter transactions for current month
        const monthlyTransactions = user.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === currentMonth &&
                transactionDate.getFullYear() === currentYear;
        });

        // Calculate totals
        const totalIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const closingBalance = user.balance;

        // Update UI
        document.getElementById('totalIncome').textContent = `₹${totalIncome}`;
        document.getElementById('totalExpense').textContent = `₹${totalExpense}`;
        document.getElementById('closingBalance').textContent = `₹${closingBalance}`;

        // Display recent transactions
        const monthlyRecords = document.getElementById('monthlyRecords');
        monthlyRecords.innerHTML = '';

        if (monthlyTransactions.length === 0) {
            monthlyRecords.innerHTML = '<p>No transactions for this month</p>';
        } else {
            monthlyTransactions.slice(-5).reverse().forEach(transaction => {
                const recordItem = document.createElement('div');
                recordItem.className = 'record-item';

                recordItem.innerHTML = `
                            <div class="record-details">
                                <div>${transaction.date}</div>
                                <div>${transaction.type === 'income' ? `From: ${transaction.source}` : `To: ${transaction.recipient}`}</div>
                                <div>${transaction.reason}</div>
                            </div>
                            <div class="record-amount ${transaction.type}">
                                ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount}
                            </div>
                        `;

                monthlyRecords.appendChild(recordItem);
            });
        }

        showScreen(monthlySummaryScreen);
    }

    function showAllRecords() {
        const currentUser = localStorage.getItem('moneyGuardCurrentUser');
        if (!currentUser) {
            showAlert('Please login first', false);
            showScreen(loginScreen);
            return;
        }

        const users = JSON.parse(localStorage.getItem('moneyGuardUsers'));
        const user = users[currentUser];

        displayRecordsTable(user.transactions);
        showScreen(allRecordsScreen);
    }

    function displayRecordsTable(transactions) {
        const tableBody = document.getElementById('recordsTableBody');
        tableBody.innerHTML = '';

        if (transactions.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No transactions found</td></tr>';
            return;
        }

        // Show transactions in reverse chronological order
        transactions.slice().reverse().forEach(transaction => {
            const row = document.createElement('tr');

            row.innerHTML = `
                        <td>${transaction.date}</td>
                        <td>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
                        <td class="${transaction.type}">${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount}</td>
                        <td>₹${transaction.balance}</td>
                        <td>${transaction.type === 'income' ? transaction.source : transaction.recipient}: ${transaction.reason}</td>
                        <td><button class="delete-btn" data-id="${transaction.date}-${transaction.amount}">Delete</button></td>
                    `;

            tableBody.appendChild(row);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const transactionId = this.getAttribute('data-id');
                deleteTransaction(transactionId);
            });
        });
    }

    function applyFilters() {
        const currentUser = localStorage.getItem('moneyGuardCurrentUser');
        if (!currentUser) return;

        const users = JSON.parse(localStorage.getItem('moneyGuardUsers'));
        const user = users[currentUser];

        const searchText = document.getElementById('searchRecords').value.toLowerCase();
        const filterType = document.getElementById('filterType').value;
        const filterDate = document.getElementById('filterDate').value;

        let filteredTransactions = user.transactions;

        // Apply search filter
        if (searchText) {
            filteredTransactions = filteredTransactions.filter(transaction =>
                (transaction.type === 'income' ? transaction.source : transaction.recipient).toLowerCase().includes(searchText) ||
                transaction.reason.toLowerCase().includes(searchText)
            );
        }

        // Apply type filter
        if (filterType !== 'all') {
            filteredTransactions = filteredTransactions.filter(transaction =>
                transaction.type === filterType
            );
        }

        // Apply date filter
        if (filterDate) {
            filteredTransactions = filteredTransactions.filter(transaction =>
                transaction.date === filterDate
            );
        }

        displayRecordsTable(filteredTransactions);
    }

    function deleteTransaction(transactionId) {
        // Implementation for deleting a transaction
        showAlert('Delete functionality would be implemented here');
    }

    function showProfile() {
        const currentUser = localStorage.getItem('moneyGuardCurrentUser');
        if (!currentUser) {
            showAlert('Please login first', false);
            return;
        }

        const users = JSON.parse(localStorage.getItem('moneyGuardUsers'));
        const user = users[currentUser];

        document.getElementById('profileInfo').innerHTML = `
                    <div class="profile-item"><strong>Username:</strong> ${currentUser}</div>
                    <div class="profile-item"><strong>Gender:</strong> ${user.gender}</div>
                    <div class="profile-item"><strong>Password:</strong> ******</div>
                    <div class="profile-item"><strong>Security Question:</strong> ${user.securityQuestion === 'favoriteFruit' ? 'What is your favorite fruit?' : 'What is your favorite color?'}</div>
                    <div class="profile-item"><strong>Answer:</strong> ${user.securityAnswer}</div>
                `;

        profileModal.style.display = 'flex';
    }

    function showEditProfile() {
        const currentUser = localStorage.getItem('moneyGuardCurrentUser');
        const users = JSON.parse(localStorage.getItem('moneyGuardUsers'));
        const user = users[currentUser];

        document.getElementById('editUsername').value = currentUser;
        document.getElementById('editGender').value = user.gender;
        document.getElementById('editSecurityQuestion').value = user.securityQuestion;
        document.getElementById('editSecurityAnswer').value = user.securityAnswer;

        profileModal.style.display = 'none';
        editProfileModal.style.display = 'flex';
    }

    function handleEditProfile(e) {
        e.preventDefault();

        const currentUser = localStorage.getItem('moneyGuardCurrentUser');
        const users = JSON.parse(localStorage.getItem('moneyGuardUsers'));

        const newUsername = document.getElementById('editUsername').value;
        const gender = document.getElementById('editGender').value;
        const newPassword = document.getElementById('editPassword').value;
        const securityQuestion = document.getElementById('editSecurityQuestion').value;
        const securityAnswer = document.getElementById('editSecurityAnswer').value;

        // Get user data
        const userData = users[currentUser];

        // Remove old user entry
        delete users[currentUser];

        // Update username if changed
        const usernameToUse = newUsername || currentUser;

        // Add updated user entry
        users[usernameToUse] = {
            gender: gender,
            password: newPassword || userData.password,
            securityQuestion: securityQuestion,
            securityAnswer: securityAnswer,
            transactions: userData.transactions,
            balance: userData.balance
        };

        // Save to localStorage
        localStorage.setItem('moneyGuardUsers', JSON.stringify(users));
        localStorage.setItem('moneyGuardCurrentUser', usernameToUse);

        showAlert('Profile updated successfully!');
        editProfileModal.style.display = 'none';

        // Update dashboard if needed
        updateDashboard(usernameToUse, users[usernameToUse]);
    }

    function deleteAccount() {
        const currentUser = localStorage.getItem('moneyGuardCurrentUser');
        const users = JSON.parse(localStorage.getItem('moneyGuardUsers'));

        // Remove user
        delete users[currentUser];

        // Save updated users
        localStorage.setItem('moneyGuardUsers', JSON.stringify(users));
        localStorage.removeItem('moneyGuardCurrentUser');

        deleteAccountModal.style.display = 'none';
        showAlert('Account deleted successfully');

        // Redirect to signup screen
        showScreen(signupScreen);
    }

    function updateDashboard(username, userData) {
        document.getElementById('welcomeUsername').textContent = username;

        // Update avatar with first letter of username
        document.getElementById('avatar').textContent = username.charAt(0).toUpperCase();
    }
});