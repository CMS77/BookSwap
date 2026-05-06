let allBooks = [];
let activeGenre = 'all';

async function loadBooks() {
    const response = await fetch('http://localhost:8080/books');
    allBooks = await response.json();

    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    if (search) {
        document.getElementById('navSearch').value = search;
    }

    renderCards();
}

function filterGenre(genre) {
    activeGenre = genre;
    document.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));
    document.querySelector(`.genre-pill[onclick="filterGenre('${genre}')"]`).classList.add('active');
    renderCards();
}

function renderCards() {
    const search = document.getElementById('navSearch').value.toLowerCase();

    const loggedUser = localStorage.getItem('username');

    const filtered = allBooks.filter(book => {
        if (loggedUser && book.user?.username === loggedUser) return false;
        const matchGenre = activeGenre === 'all' || book.genre === activeGenre;
        const matchSearch = !search
            || book.titulo.toLowerCase().includes(search)
            || book.autor.toLowerCase().includes(search);
        return matchGenre && matchSearch;
    });

    const grid = document.getElementById('bookGrid');

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="color:#5F5E5A">No books found.</p>';
        return;
    }

    grid.innerHTML = filtered.map(book => {
        const available = !book.borrowedBy;
        const canRequest = loggedUser && available;

        return `
        <div class="book-card">
            <img class="book-cover"
                 src="${book.bookCoverUrl || 'assets/img/default-user.png'}"
                 alt="${book.titulo}">
            <div class="book-card-body">
                <p class="book-title">${book.titulo}</p>
                <p class="book-author">${book.autor}</p>
                <span class="book-genre">${book.genre || ''}</span>
                <a class="book-owner" href="user.html?username=${book.user?.username}">@${book.user?.username || 'unknown'}</a>
                <span class="${available ? 'badge-available' : 'badge-unavailable'}">
                    ${available ? 'Available' : 'Unavailable'}
                </span>
                ${canRequest ? `<button class="btn-request" onclick="requestBook(${book.id}, '${book.user?.username}')">Request</button>` : ''}
            </div>
        </div>`;
    }).join('');
}

async function requestBook(bookId, ownerUsername) {
    const loggedUser = localStorage.getItem('username');
    if (!loggedUser) {
        window.location.href = 'login.html';
        return;
    }
    if (!confirm(`Send a request to borrow this book from @${ownerUsername}?`)) return;

    const response = await authFetch('http://localhost:8080/requests', {
        method: 'POST',
        body: JSON.stringify({ bookId })
    });

    if (response.ok) {
        alert('Request sent! Waiting for the owner to accept.');
        loadBooks();
    } else {
        const msg = await response.text();
        alert(msg || 'Could not send the request.');
    }
}

document.addEventListener('DOMContentLoaded', loadBooks);