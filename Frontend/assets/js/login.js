document.querySelector('.btn-login').addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert('Fill in all fields!');
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', username);
            window.location.href = 'profile.html';
        } else {
            alert('Invalid username or password!');
        }
    } catch (error) {
        alert('Could not connect to the server.');
    }
});
