document.getElementById('navbar').innerHTML = `
<nav class="sidebar">
    <img src="assets/img/logo.png" class="logo">
    <div class="nav-links">
        <a href="index.html">Home</a>
        <a href="how-it-works.html">How it Works</a>
        <a href="browse.html">Browse Books</a>
        <a href="login.html">Login</a>
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

document.querySelector('.logo').addEventListener('click', function() {
    window.location.href = 'index.html';
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
    return token;
}

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
