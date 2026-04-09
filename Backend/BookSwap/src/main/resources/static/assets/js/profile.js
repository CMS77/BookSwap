const username = localStorage.getItem('username');
let profilePhotoBase64 = null;

document.addEventListener("DOMContentLoaded", () => {
    if (!checkAuth()) return;
    loadUserProfile();
    changeTab("myBooks");
    checkPendingRequests();

    document.getElementById('uploadPhoto').addEventListener('change', function (event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            profilePhotoBase64 = reader.result.split(',')[1];
            document.querySelector(".profile-photo img").src = reader.result;
        };
    });
});

async function loadUserProfile() {
    try {
        const response = await authFetch("http://localhost:8080/users/" + username, {
            method: "GET",
        });

        const user = await response.json();

        document.getElementById("name").innerText = user.name;
        document.querySelector(".username").innerText = "@" + user.username;
        document.querySelector(".rating").innerText = "⭐ " + user.rating;

        document.getElementById("bio").value = user.bio || "";
        document.getElementById("location").value = user.location || "";

        if (user.profilePhotoUrl) {
            document.querySelector(".profile-photo img").src = user.profilePhotoUrl;
        }
    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

async function saveProfile() {
    const bio = document.getElementById("bio").value;
    const location = document.getElementById("location").value;

    const body = { bio, location };
    if (profilePhotoBase64) {
        body.profilePhoto = profilePhotoBase64;
    }

    try {
        const response = await authFetch("http://localhost:8080/users/" + username, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Save failed:", response.status, errorText);
            alert("Error saving profile: " + response.status);
            return;
        }

        profilePhotoBase64 = null;
        await loadUserProfile();
        alert("Profile updated!");
    } catch (error) {
        console.error("Error saving profile:", error);
        alert("Could not connect to the server.");
    }
}

function changeTab(tabName) {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach(t => t.classList.remove("active"));
    document.querySelector(`.tab[onclick="changeTab('${tabName}')"]`).classList.add("active");

    switch (tabName) {
        case "myBooks":
            loadBooks("http://localhost:8080/users/" + username + "/books", "You haven't added any books yet.", "myBooks");
            break;
        case "lent":
            loadBooks("http://localhost:8080/users/" + username + "/books/lent", "You haven't lent any books yet.", "lent");
            break;
        case "borrowed":
            loadBooks("http://localhost:8080/users/" + username + "/books/borrowed", "You haven't borrowed any books yet.", "borrowed");
            break;
        case "requests":
            loadRequests();
            break;
    }
}

function buildBookCard(book, tab) {
    const menu = tab === 'myBooks' ? `
        <div class="card-menu">
            <button class="btn-kebab" onclick="toggleMenu(event, ${book.id})">⋮</button>
            <div class="card-dropdown" id="menu-${book.id}">
                <button onclick="openEditModal(${book.id}, '${book.titulo.replace(/'/g, "\\'")}', '${book.autor.replace(/'/g, "\\'")}', '${book.genre || ''}')">Edit book</button>
                <button onclick="deleteBook(${book.id})">Remove book</button>
            </div>
        </div>` : '';

    let extra = '';
    if (tab === 'lent' && book.borrowedBy) {
        extra = `<span class="book-owner">Lent to @${book.borrowedBy.username}</span>
                 <button class="btn-return" onclick="returnBook(${book.id})">Return</button>`;
    } else if (tab === 'borrowed' && book.user) {
        extra = `<span class="book-owner">Owner: @${book.user.username}</span>`;
    }

    const isLent = !!book.borrowedBy;
    const badge = isLent
        ? `<span class="badge-unavailable">Unavailable</span>`
        : `<span class="badge-available">Available</span>`;

    return `
        <div class="book-card">
            ${menu}
            <img class="book-cover"
                 src="${book.bookCoverUrl || 'assets/img/default-user.png'}"
                 alt="${book.titulo}">
            <div class="book-card-body">
                <p class="book-title">${book.titulo}</p>
                <p class="book-author">${book.autor}</p>
                <span class="book-genre">${book.genre || ''}</span>
                ${badge}
                ${extra}
            </div>
        </div>`;
}

function toggleMenu(event, bookId) {
    event.stopPropagation();
    const menu = document.getElementById(`menu-${bookId}`);
    const isOpen = menu.classList.contains('open');
    document.querySelectorAll('.card-dropdown').forEach(m => m.classList.remove('open'));
    if (!isOpen) menu.classList.add('open');
}

document.addEventListener('click', () => {
    document.querySelectorAll('.card-dropdown').forEach(m => m.classList.remove('open'));
});

let editingBookId = null;

function openEditModal(bookId, titulo, autor, genre) {
    editingBookId = bookId;
    document.getElementById('editTitulo').value = titulo;
    document.getElementById('editAutor').value = autor;
    document.getElementById('editGenre').value = genre;
    document.getElementById('editCover').value = '';
    document.getElementById('editBookModal').style.display = 'flex';
    document.querySelectorAll('.card-dropdown').forEach(m => m.classList.remove('open'));
}

function closeEditModal() {
    document.getElementById('editBookModal').style.display = 'none';
    editingBookId = null;
}

async function submitEditBook() {
    const titulo = document.getElementById('editTitulo').value.trim();
    const autor = document.getElementById('editAutor').value.trim();
    const genre = document.getElementById('editGenre').value;

    if (!titulo || !autor || !genre) {
        alert("Please fill in all required fields.");
        return;
    }

    const body = { titulo, autor, genre };

    const coverFile = document.getElementById('editCover').files[0];
    if (coverFile) {
        const reader = new FileReader();
        reader.readAsDataURL(coverFile);
        reader.onload = async () => {
            body.bookCover = reader.result.split(',')[1];
            await sendEditRequest(body);
        };
    } else {
        await sendEditRequest(body);
    }
}

async function sendEditRequest(body) {
    const response = await authFetch(`http://localhost:8080/books/${editingBookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (response.ok) {
        closeEditModal();
        changeTab('myBooks');
    } else {
        alert("Error saving changes. Try again.");
    }
}

async function deleteBook(bookId) {
    if (!confirm("Remove this book? This cannot be undone.")) return;

    const response = await authFetch(`http://localhost:8080/books/${bookId}`, { method: "DELETE" });

    if (response.ok) {
        changeTab("myBooks");
    } else {
        const msg = await response.text();
        alert(msg || "Could not remove the book.");
    }
}

async function returnBook(bookId) {
    if (!confirm("Mark this book as returned?")) return;
    await authFetch(`http://localhost:8080/books/${bookId}/return`, { method: "PUT" });
    changeTab("lent");
}

async function loadRequests() {
    const content = document.getElementById("tabContent");
    content.innerHTML = "<p>Loading...</p>";

    try {
        const [receivedRes, sentRes] = await Promise.all([
            authFetch("http://localhost:8080/requests/received"),
            authFetch("http://localhost:8080/requests/sent")
        ]);

        const received = await receivedRes.json();
        const sent = await sentRes.json();

        const pending = received.filter(r => r.status === "PENDING");
        const completedReceived = received.filter(r => r.status === "COMPLETED");

        let html = `<div class="requests-section">`;

        html += `<h3 class="requests-title">Received</h3>`;
        if (pending.length === 0) {
            html += `<p class="requests-empty">No pending requests.</p>`;
        } else {
            pending.forEach(r => {
                const photo = r.requester.profilePhotoUrl
                    ? `http://localhost:8080${r.requester.profilePhotoUrl}`
                    : 'assets/img/default-user.png';
                const rating = r.requester.rating ? `⭐ ${r.requester.rating}` : '⭐ —';
                const location = r.requester.location ? `📍 ${r.requester.location}` : '';

                html += `
                <div class="request-card">
                    <div class="requester-profile">
                        <img class="requester-photo" src="${photo}" alt="${r.requester.username}">
                        <div class="requester-info">
                            <span class="requester-name">${r.requester.name}</span>
                            <span class="requester-username">@${r.requester.username}</span>
                            <span class="requester-meta">${rating} ${location}</span>
                        </div>
                    </div>
                    <div class="request-book-info">
                        wants to borrow <strong>${r.book.titulo}</strong>
                    </div>
                    <div class="request-actions">
                        <button class="btn-accept" onclick="respondRequest(${r.id}, 'accept')">Accept</button>
                        <button class="btn-reject" onclick="respondRequest(${r.id}, 'reject')">Reject</button>
                    </div>
                </div>`;
            });
        }

        if (completedReceived.length > 0) {
            html += `<h3 class="requests-title" style="margin-top:1.5rem">Completed — Rate the borrower</h3>`;
            completedReceived.forEach(r => {
                html += `
                <div class="request-card">
                    <div class="request-info">
                        <span class="request-book">${r.book.titulo}</span>
                        <span class="request-user">returned by @${r.requester.username}</span>
                    </div>
                    ${buildRatingForm(r.id)}
                </div>`;
            });
        }

        html += `<h3 class="requests-title" style="margin-top:1.5rem">Sent</h3>`;
        if (sent.length === 0) {
            html += `<p class="requests-empty">You haven't sent any requests yet.</p>`;
        } else {
            sent.forEach(r => {
                const statusClass = r.status === "ACCEPTED" ? "badge-available"
                                  : r.status === "REJECTED" ? "badge-unavailable"
                                  : r.status === "COMPLETED" ? "badge-completed"
                                  : "badge-pending";
                html += `
                <div class="request-card">
                    <div class="request-info">
                        <span class="request-book">${r.book.titulo}</span>
                        <span class="request-user">from @${r.book.user.username}</span>
                    </div>
                    <span class="${statusClass}">${r.status}</span>
                    ${r.status === "COMPLETED" ? buildRatingForm(r.id) : ''}
                </div>`;
            });
        }

        html += `</div>`;
        content.innerHTML = html;

        updateRequestsBadge(pending.length);

    } catch (error) {
        content.innerHTML = "<p>Error loading requests.</p>";
    }
}

function buildRatingForm(swapId) {
    const stars = [1, 2, 3, 4, 5]
        .map(n => `<span class="star" onclick="selectStar(${swapId}, ${n})">★</span>`)
        .join('');
    return `
        <div class="rating-form" id="rate-${swapId}">
            <div class="star-input" id="stars-${swapId}" data-score="0">${stars}</div>
            <textarea id="comment-${swapId}" class="rating-textarea" placeholder="Comment (optional)" rows="2"></textarea>
            <button class="btn-accept" onclick="submitRating(${swapId})">Submit Rating</button>
        </div>`;
}

function selectStar(swapId, score) {
    const container = document.getElementById(`stars-${swapId}`);
    container.dataset.score = score;
    container.querySelectorAll('.star').forEach((s, i) => {
        s.classList.toggle('selected', i < score);
    });
}

async function submitRating(swapId) {
    const container = document.getElementById(`stars-${swapId}`);
    const score = parseInt(container.dataset.score);
    if (score === 0) {
        alert("Please select a star rating.");
        return;
    }
    const comment = document.getElementById(`comment-${swapId}`).value.trim();

    const response = await authFetch('http://localhost:8080/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ swapRequestId: swapId, score, comment: comment || null })
    });

    const ratingDiv = document.getElementById(`rate-${swapId}`);
    if (response.ok) {
        ratingDiv.innerHTML = '<span class="badge-available">Rating submitted ⭐</span>';
    } else {
        const msg = await response.text();
        if (msg.includes("already rated")) {
            ratingDiv.innerHTML = '<span class="badge-available">Already rated ⭐</span>';
        } else {
            alert(msg || "Could not submit rating.");
        }
    }
}

async function respondRequest(requestId, action) {
    const label = action === 'accept' ? 'accept' : 'reject';
    if (!confirm(`Are you sure you want to ${label} this request?`)) return;

    const response = await authFetch(`http://localhost:8080/requests/${requestId}/${action}`, {
        method: "PUT"
    });

    if (response.ok) {
        loadRequests();
    } else {
        alert("Something went wrong.");
    }
}

function openModal() {
    document.getElementById("addBookModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("addBookModal").style.display = "none";
    document.getElementById("bookTitulo").value = "";
    document.getElementById("bookAutor").value = "";
    document.getElementById("bookGenre").value = "";
    document.getElementById("bookCover").value = "";
}

async function submitBook() {
    const titulo = document.getElementById("bookTitulo").value.trim();
    const autor = document.getElementById("bookAutor").value.trim();
    const genre = document.getElementById("bookGenre").value;

    if (!titulo || !autor || !genre) {
        alert("Please fill in all required fields.");
        return;
    }

    const body = { titulo, autor, genre, disponibilidade: true };

    const coverFile = document.getElementById("bookCover").files[0];
    if (coverFile) {
        const reader = new FileReader();
        reader.readAsDataURL(coverFile);
        reader.onload = async () => {
            body.bookCover = reader.result.split(',')[1];
            await sendBookRequest(body);
        };
    } else {
        await sendBookRequest(body);
    }
}

async function sendBookRequest(body) {
    const response = await authFetch("http://localhost:8080/books", {
        method: "POST",
        body: JSON.stringify(body)
    });

    if (response.ok) {
        closeModal();
        changeTab("myBooks");
    } else {
        alert("Error adding book. Try again.");
    }
}

async function checkPendingRequests() {
    try {
        const response = await authFetch("http://localhost:8080/requests/received");
        const received = await response.json();
        const count = received.filter(r => r.status === "PENDING").length;
        updateRequestsBadge(count);
    } catch (e) {}
}

function updateRequestsBadge(count) {
    const tab = document.getElementById("tabRequests");
    if (!tab) return;
    tab.textContent = count > 0 ? `Requests (${count})` : "Requests";
}

async function loadBooks(url, emptyMessage, tab) {
    const content = document.getElementById("tabContent");
    content.innerHTML = "<p>Loading...</p>";

    try {
        const response = await authFetch(url);
        const books = await response.json();

        const addBtn = tab === "myBooks"
            ? `<div style="padding: 1rem 1rem 0.5rem">
                   <button class="btn-primary" onclick="openModal()">+ Add Book</button>
               </div>`
            : '';

        if (books.length === 0) {
            content.innerHTML = addBtn + `<p style="color:#5F5E5A; padding: 1rem;">${emptyMessage}</p>`;
            return;
        }

        content.innerHTML = addBtn +
            `<div class="book-grid">` +
            books.map(book => buildBookCard(book, tab)).join('') +
            `</div>`;
    } catch (error) {
        content.innerHTML = "<p>Error loading books.</p>";
    }
}
