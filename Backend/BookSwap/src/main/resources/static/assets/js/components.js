function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch (e) {
        return true;
    }
}

function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
}

const _token = localStorage.getItem('token');
if (_token && isTokenExpired(_token)) {
    clearSession();
}

const isLoggedIn = !!localStorage.getItem('token');

document.getElementById('navbar').innerHTML = `
<nav class="sidebar">
    <a href="index.html" class="nav-brand">
        <img src="assets/img/logo.png" class="logo">
        <span class="nav-brand-name">BookSwap</span>
    </a>
    <div class="nav-links">
        <a href="index.html">Home</a>
        <a href="browse.html">Browse Books</a>
        ${isLoggedIn
            ? `<a href="profile.html">Profile</a>
               <a href="messages.html" id="messagesLink">Messages <span id="chatBadge" class="chat-badge"></span></a>
               <a href="#" class="nav-logout" id="logoutBtn">Logout</a>`
            : `<a href="login.html">Login</a>`
        }
    </div>
    <div class="search-bar">
        <input type="text" id="navSearch" placeholder="Search...">
        <button id="navSearchBtn">🔍</button>
    </div>
</nav>`;

if (isLoggedIn) {
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = 'login.html';
    });

    startChatNotifications();
}

function startChatNotifications() {
    async function checkUnread() {
        try {
            const res = await authFetch('/api/messages/active-chats');
            if (!res.ok) return;
            const chats = await res.json();
            const me = localStorage.getItem('username');
            let unread = 0;
            chats.forEach(chat => {
                const seen = parseInt(localStorage.getItem(`chat_seen_${chat.requestId}`) || '0');
                if (chat.lastMessageId > seen && chat.lastSenderUsername !== me) unread++;
            });
            const badge = document.getElementById('chatBadge');
            if (badge) {
                badge.textContent = unread > 0 ? unread : '';
                badge.style.display = unread > 0 ? 'inline' : 'none';
            }
        } catch (e) {}
    }
    checkUnread();
    setInterval(checkUnread, 15000);
}

const navSearchBtn = document.getElementById('navSearchBtn');
const navSearch = document.getElementById('navSearch');

navSearchBtn.addEventListener('click', () => {
    const term = navSearch.value.trim();
    if (term) window.location.href = `browse.html?search=${encodeURIComponent(term)}`;
});

navSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') navSearchBtn.click();
});

document.getElementById('footer').innerHTML = `
<footer class="footer">
    <a href="terms.html">Terms of Service</a>
    <a href="privacy.html">Privacy Policy</a>
    <a href="safety.html">Safety Guidelines</a>
    <p>© 2025 HappyPotato BookSwap 🥔</p>
</footer>`;

const startSwapBtn = document.getElementById('startSwapBtn');
if (startSwapBtn && isLoggedIn) {
    startSwapBtn.href = 'profile.html';
}

document.querySelectorAll('.card-flip').forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });
});


function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
        clearSession();
        window.location.href = 'login.html';
    }
    return token;
}

async function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });
    if (response.status === 401) {
        clearSession();
        window.location.href = 'login.html';
        return response;
    }
    return response;
}
