const params = new URLSearchParams(window.location.search);
const username = params.get('username');

let userData = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!username) {
        document.getElementById('sectionContent').innerHTML = '<p>User not found.</p>';
        return;
    }

    await loadUserProfile();
    changeSection('books');
});

async function loadUserProfile() {
    try {
        const res = await fetch(`http://localhost:8080/users/${username}`);
        if (!res.ok) throw new Error();
        userData = await res.json();

        document.getElementById('name').innerText = userData.name;
        document.getElementById('username').innerText = '@' + userData.username;
        document.getElementById('rating').innerText = '⭐ ' + (userData.rating || '—');
        document.getElementById('bio').innerText = userData.bio || '';
        document.getElementById('location').innerText = userData.location ? '📍 ' + userData.location : '';

        if (userData.profilePhotoUrl) {
            document.getElementById('userPhoto').src = 'http://localhost:8080' + userData.profilePhotoUrl;
        }
    } catch {
        document.getElementById('sectionContent').innerHTML = '<p>Could not load profile.</p>';
    }
}

function changeSection(section) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[onclick="changeSection('${section}')"]`).classList.add('active');

    if (section === 'books') loadBooks();
    else loadRatings();
}

async function loadBooks() {
    const content = document.getElementById('sectionContent');
    content.innerHTML = '<p>Loading...</p>';

    try {
        const res = await fetch(`http://localhost:8080/users/${username}/books`);
        const books = await res.json();

        if (books.length === 0) {
            content.innerHTML = '<p style="color:#5F5E5A; padding:1rem">No books available.</p>';
            return;
        }

        content.innerHTML = `<div class="book-grid">` + books.map(book => `
            <div class="book-card">
                <img class="book-cover"
                     src="${book.bookCoverUrl || 'assets/img/default-user.png'}"
                     alt="${book.titulo}">
                <div class="book-card-body">
                    <p class="book-title">${book.titulo}</p>
                    <p class="book-author">${book.autor}</p>
                    <span class="book-genre">${book.genre || ''}</span>
                    <span class="${book.borrowedBy ? 'badge-unavailable' : 'badge-available'}">
                        ${book.borrowedBy ? 'Unavailable' : 'Available'}
                    </span>
                </div>
            </div>`).join('') + `</div>`;
    } catch {
        content.innerHTML = '<p>Error loading books.</p>';
    }
}

async function loadRatings() {
    const content = document.getElementById('sectionContent');
    content.innerHTML = '<p>Loading...</p>';

    try {
        const res = await fetch(`http://localhost:8080/users/${username}/ratings`);
        const ratings = await res.json();

        if (ratings.length === 0) {
            content.innerHTML = '<p style="color:#5F5E5A; padding:1rem">No ratings yet.</p>';
            return;
        }

        content.innerHTML = `<div class="requests-section">` + ratings.map(r => {
            const stars = '★'.repeat(r.score) + '☆'.repeat(5 - r.score);
            const date = new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            return `
            <div class="request-card">
                <div class="requester-info" style="flex:1">
                    <span class="requester-username">@${r.rater.username}</span>
                    <span style="color:#c8a96e; font-size:1.2rem; margin-left:0.5rem">${stars}</span>
                    <span style="color:#999; font-size:0.8rem; margin-left:0.5rem">${date}</span>
                    ${r.comment ? `<p style="color:#5F5E5A; margin:0.4rem 0 0">"${r.comment}"</p>` : ''}
                </div>
            </div>`;
        }).join('') + `</div>`;
    } catch {
        content.innerHTML = '<p>Error loading ratings.</p>';
    }
}
