// Check if user is already logged in on page load
window.onload = function() {
    const token = localStorage.getItem('authToken');
    if (token) {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        showDashboard(user, token);
    }
};

// Show/Hide Pages
function showPage(pageId) {
    const pages = ['loginPage', 'registerPage', 'dashboardPage'];
    pages.forEach(page => {
        document.getElementById(page).classList.add('hidden');
    });
    document.getElementById(pageId).classList.remove('hidden');
    clearMessages();
}

// Toggle Password Visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// Clear Error/Success Messages
function clearMessages() {
    document.getElementById('loginError').textContent = '';
    document.getElementById('registerError').textContent = '';
}

// Generate Token
function generateToken() {
    return btoa(Date.now() + Math.random().toString(36));
}

// Password Strength Checker
document.getElementById('registerPassword')?.addEventListener('input', function() {
    const password = this.value;
    const strengthDiv = document.getElementById('passwordStrength');
    
    if (password.length === 0) {
        strengthDiv.textContent = '';
        return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) {
        strengthDiv.textContent = 'Weak';
        strengthDiv.style.color = '#dc2626';
        strengthDiv.style.background = '#fef2f2';
    } else if (strength <= 4) {
        strengthDiv.textContent = 'Medium';
        strengthDiv.style.color = '#d97706';
        strengthDiv.style.background = '#fef3c7';
    } else {
        strengthDiv.textContent = 'Strong';
        strengthDiv.style.color = '#16a34a';
        strengthDiv.style.background = '#f0fdf4';
    }
});

// Register Form Handler
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('registerError');
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        errorDiv.textContent = 'All fields are required!';
        return;
    }
    
    if (!validateEmail(email)) {
        errorDiv.textContent = 'Invalid email format!';
        return;
    }
    
    if (password.length < 8) {
        errorDiv.textContent = 'Password must be at least 8 characters!';
        return;
    }
    
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
        errorDiv.textContent = 'Password must contain uppercase, lowercase, number and special character!';
        return;
    }
    
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match!';
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        errorDiv.textContent = 'User already exists!';
        return;
    }
    
    // Hash password (simple simulation - in real app use bcrypt)
    const hashedPassword = btoa(password); // Base64 encoding (NOT secure for production)
    
    // Save user
    users.push({ name, email, password: hashedPassword });
    localStorage.setItem('users', JSON.stringify(users));
    
    errorDiv.className = 'success-message';
    errorDiv.textContent = 'Registration successful! Redirecting to login...';
    
    setTimeout(() => {
        errorDiv.className = 'error-message';
        showPage('loginPage');
        document.getElementById('registerForm').reset();
    }, 1500);
});

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    // Validation
    if (!email || !password) {
        errorDiv.textContent = 'All fields are required!';
        return;
    }
    
    // Find user (Check Email)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (!user) {
        errorDiv.textContent = 'User not found!';
        return;
    }
    
    // Compare Password
    const hashedPassword = btoa(password);
    if (user.password !== hashedPassword) {
        errorDiv.textContent = 'Invalid credentials!';
        return;
    }
    
    // Create Token
    const token = generateToken();
    
    // Store session data
    localStorage.setItem('authToken', token);
    localStorage.setItem('loggedInUser', JSON.stringify({ name: user.name, email: user.email }));
    
    // Redirect to Dashboard
    showDashboard({ name: user.name, email: user.email }, token);
    document.getElementById('loginForm').reset();
});

// Show Dashboard
function showDashboard(user, token) {
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userToken').textContent = token;
    showPage('dashboardPage');
}

// Logout Function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('loggedInUser');
    showPage('loginPage');
}

// Email Validation
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
