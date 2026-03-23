document.getElementById('navbar').innerHTML = `
<nav class="sidebar">
    <img src="img/logo.png" class="logo">
    <div class="nav-links">
        <a href="HappyStore.html">Home</a>
        <a href="HowItWorks.html">How it Works</a>
        <a href="BrowserBook.html">Browser Book</a>
        <a href="Login.html">Login</a>
    </div>
    <div class="search-bar">
        <input type="text" placeholder="Search...">
        <button>🔍</button>
    </div>
</nav>`;

//HP: Funtion that makes logo turns to button
document.querySelector('.logo').addEventListener('click', function() {
    window.location.href = 'HappyStore.html';
});

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