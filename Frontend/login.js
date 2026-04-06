var username;
document.querySelector('.btn-login').addEventListener('click', async () => {
    const username2 = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!username2 || !password) {
        alert('Fill in all fields!');
        return;
    }
    username = username2;
    try {
        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            window.location.href = 'UserProfile.html';
        } else {
            alert('Username ou password incorretos!');
        }
    } catch (error) {
        alert('Erro ao conectar ao servidor. Verifica se o Spring Boot está a correr.');
    }
});
module.exports = { username };