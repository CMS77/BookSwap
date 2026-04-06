document.getElementById('navbar').innerHTML = `
<nav class="sidebar">
    <img src="img/logo.png" class="logo">
    <div class="nav-links">
        <a href="Home.html">Home</a>
        <a href="HowItWorks.html">How it Works</a>
        <a href="BrowserBook.html">Browser Book</a>
        <a href="Login.html">Login</a>
    </div>
    <div class="search-bar">
        <input type="text" placeholder="Search...">
        <button>🔍</button>
    </div>
</nav>`;

document.getElementById('footer').innerHTML = `
<footer class="footer">
    <a href="terms.html">Terms of Service</a>
    <a href="privacy.html">Privacy Policy</a>
    <a href="safety.html">Safety Guidelines</a>
    <p>© 2025 HappyPotato BookSwap 🥔</p>
</footer>`;

document.querySelectorAll('.card-flip').forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });
});
//HP: Funtion that makes logo turns to button
document.querySelector('.logo').addEventListener('click', function() {
    window.location.href = 'Home.html';
});
//Autenticação
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'Login.html';
    }
    return token;
}
// adiciona o token a qualquer fetch autenticado
function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });
}