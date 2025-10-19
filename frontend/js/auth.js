const API_URL = 'http://localhost:5000/api';

if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('errorMessage');

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } else {
                errorMsg.textContent = data.error || 'Login failed';
                errorMsg.classList.add('show');
            }
        } catch {
            errorMsg.textContent = 'Network error. Please try again.';
            errorMsg.classList.add('show');
        }
    });
}

if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorMsg = document.getElementById('errorMessage');
        const successMsg = document.getElementById('successMessage');

        errorMsg.classList.remove('show');
        successMsg.classList.remove('show');

        if (password !== confirmPassword) {
            errorMsg.textContent = 'Passwords do not match';
            errorMsg.classList.add('show');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();

            if (response.ok) {
                successMsg.textContent = 'Registration successful! Redirecting...';
                successMsg.classList.add('show');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                errorMsg.textContent = data.error || 'Registration failed';
                errorMsg.classList.add('show');
            }
        } catch {
            errorMsg.textContent = 'Network error. Please try again.';
            errorMsg.classList.add('show');
        }
    });
}
