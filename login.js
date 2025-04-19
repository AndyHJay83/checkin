document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === 'TricksIStole' && password === 'password') {
            // Store login state
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            
            // Redirect to settings page
            window.location.href = 'settings.html';
        } else {
            alert('Invalid username or password');
        }
    });
}); 