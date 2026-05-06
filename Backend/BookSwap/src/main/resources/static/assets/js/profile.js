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
        document.querySelector(".rating").innerText = "⭐ " + (user.rating || "—");

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
            loadLentTab();
            break;
        case "borrowed":
            loadBorrowedTab();
            break;
        case "requests":
            loadRequests();
            break;
        case "ratings":
            loadMyRatings();
            break;
    }
}

async function loadLentTab() {
    const content = document.getElementById("tabContent");
    content.innerHTML = "<p>Loading...</p>";

    const [currentRes, historyRes] = await Promise.all([
        authFetch(`http://localhost:8080/users/${username}/books/lent`),
        authFetch("http://localhost:8080/requests/completed/as-owner")
    ]);

    const current = currentRes.ok ? await currentRes.json() : [];
    const history = historyRes.ok ? await historyRes.json() : [];

    let html = "";

    if (current.length > 0) {
        html += `<h3 class="requests-title">Currently lent</h3><div class="book-grid">`;
        html += current.map(book => buildBookCard(book, "lent")).join("");
        html += `</div>`;
    }

    if (history.length > 0) {
        html += `<h3 class="requests-title" style="margin-top:1.5rem">Past loans</h3>`;
        html += history.map(r => buildSwapHistoryCard(r, "lent")).join("");
    }

    if (!html) html = `<p style="color:#5F5E5A; padding:1rem">No lending history yet.</p>`;
    content.innerHTML = html;
}

async function loadBorrowedTab() {
    const content = document.getElementById("tabContent");
    content.innerHTML = "<p>Loading...</p>";

    const [currentRes, historyRes] = await Promise.all([
        authFetch(`http://localhost:8080/users/${username}/books/borrowed`),
        authFetch("http://localhost:8080/requests/completed/as-borrower")
    ]);

    const current = currentRes.ok ? await currentRes.json() : [];
    const history = historyRes.ok ? await historyRes.json() : [];

    let html = "";

    if (current.length > 0) {
        html += `<h3 class="requests-title">Currently borrowing</h3><div class="book-grid">`;
        html += current.map(book => buildBookCard(book, "borrowed")).join("");
        html += `</div>`;
    }

    if (history.length > 0) {
        html += `<h3 class="requests-title" style="margin-top:1.5rem">Past borrows</h3>`;
        html += history.map(r => buildSwapHistoryCard(r, "borrowed")).join("");
    }

    if (!html) html = `<p style="color:#5F5E5A; padding:1rem">No borrowing history yet.</p>`;
    content.innerHTML = html;
}

function buildSwapHistoryCard(swap, perspective) {
    const other = perspective === "lent" ? swap.requester : swap.book.user;
    const label = perspective === "lent" ? "Borrowed by" : "Owner";
    const cover = swap.book.bookCoverUrl || "assets/img/default-user.png";
    const date = new Date(swap.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    return `
    <div class="request-card">
        <img class="book-cover" src="${cover}" alt="${swap.book.titulo}" style="width:48px;height:64px;object-fit:cover;border-radius:4px;flex-shrink:0">
        <div class="request-info" style="flex:1">
            <span class="request-book">${swap.book.titulo}</span>
            <span class="request-user">${label}: <a class="request-user" href="user.html?username=${other.username}">@${other.username}</a></span>
            <span style="font-size:0.75rem;color:#999">${date}</span>
        </div>
        <span class="badge-completed">COMPLETED</span>
    </div>`;
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
    const title = document.getElementById('editTitulo').value.trim();
    const author = document.getElementById('editAutor').value.trim();
    const genre = document.getElementById('editGenre').value;

    if (!title || !author || !genre) {
        alert("Please fill in all required fields.");
        return;
    }

    const body = { titulo: title, autor: author, genre: genre };
    const coverFileInput = document.getElementById('editCover');
    const coverFile = coverFileInput.files[0];

    if (coverFile) {
        const reader = new FileReader();
        reader.readAsDataURL(coverFile);
        reader.onload = async () => {
            // Extracts only the Base64 string after the comma
            body.bookCover = reader.result.split(',')[1];
            await sendEditRequest(body);
        };
        reader.onerror = () => {
            alert("Error reading the image file.");
        };
    } else {
        // Sends update without changing the cover
        await sendEditRequest(body);
    }
}

async function sendEditRequest(body) {
    try {
        const response = await authFetch(`http://localhost:8080/books/${editingBookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            alert("Book updated successfully!");
            closeEditModal();
            changeTab('myBooks');
        } else {
            const errorMsg = await response.text();
            console.error("Server error:", errorMsg);
            alert("Failed to save changes: " + (errorMsg || response.status));
        }
    } catch (error) {
        console.error("Network error:", error);
        alert("Could not connect to the server.");
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
    const res = await authFetch(`http://localhost:8080/books/${bookId}/return`, { method: "PUT" });
    console.log("[returnBook] status:", res.status);
    if (!res.ok) {
        const msg = await res.text();
        alert("Error returning book: " + msg);
        return;
    }
    changeTab("requests");
}

async function loadRequests() {
    const content = document.getElementById("tabContent");
    content.innerHTML = "<p>Loading...</p>";

    try {
        const [receivedRes, sentRes, ratedRes] = await Promise.all([
            authFetch("http://localhost:8080/requests/received"),
            authFetch("http://localhost:8080/requests/sent"),
            authFetch("http://localhost:8080/ratings/my-rated-swaps")
        ]);

        if (!receivedRes.ok) {
            const err = await receivedRes.text();
            console.error("[loadRequests] /requests/received error:", receivedRes.status, err);
            throw new Error("received: " + receivedRes.status);
        }
        if (!sentRes.ok) {
            const err = await sentRes.text();
            console.error("[loadRequests] /requests/sent error:", sentRes.status, err);
            throw new Error("sent: " + sentRes.status);
        }

        const received = await receivedRes.json();
        const sent = await sentRes.json();
        const serverRatedIds = ratedRes.ok ? await ratedRes.json() : [];
        if (!ratedRes.ok) console.warn("[loadRequests] /ratings/my-rated-swaps failed:", ratedRes.status);
        const localRatedIds = JSON.parse(localStorage.getItem(`ratedSwaps_${username}`) || '[]');
        const ratedSwapIds = [...new Set([...serverRatedIds, ...localRatedIds])];
        console.log("[loadRequests] ratedSwapIds:", ratedSwapIds);
        console.log("[loadRequests] received:", received.length, "sent:", sent.length);

        const storageKey = `seenSentRequests_${username}`;
        const seen = JSON.parse(localStorage.getItem(storageKey) || '{}');

        const pending = received.filter(r => r.status === "PENDING");

        const acceptedRaw = received.filter(r => r.status === "ACCEPTED");
        const acceptedByBook = {};
        acceptedRaw.forEach(r => {
            if (!acceptedByBook[r.book.id] || r.id > acceptedByBook[r.book.id].id)
                acceptedByBook[r.book.id] = r;
        });
        const accepted = Object.values(acceptedByBook);

        const completedRaw = received.filter(r => r.status === "COMPLETED" && !ratedSwapIds.includes(r.id));
        const completedByBook = {};
        completedRaw.forEach(r => {
            if (!completedByBook[r.book.id] || r.id > completedByBook[r.book.id].id)
                completedByBook[r.book.id] = r;
        });
        const completedReceived = Object.values(completedByBook);

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
                            <a class="requester-username" href="user.html?username=${r.requester.username}">@${r.requester.username}</a>
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

        if (accepted.length > 0) {
            html += `<h3 class="requests-title" style="margin-top:1.5rem">Currently lent</h3>`;
            accepted.forEach(r => {
                html += `
                <div class="request-card">
                    <div class="request-info">
                        <span class="request-book">${r.book.titulo}</span>
                        <span class="request-user">borrowed by @${r.requester.username}</span>
                    </div>
                    <span class="badge-available">Lent out</span>
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
                    ${buildRatingForm(r.id, ratedSwapIds.includes(r.id))}
                </div>`;
            });
        }

        html += `<h3 class="requests-title" style="margin-top:1.5rem">Sent</h3>`;
        if (sent.length === 0) {
            html += `<p class="requests-empty">You haven't sent any requests yet.</p>`;
        } else {
            const sentDeduped = Object.values(
                sent.reduce((acc, r) => {
                    const key = r.status === "COMPLETED" ? `completed-${r.book.id}` : String(r.id);
                    if (!acc[key] || r.id > acc[key].id) acc[key] = r;
                    return acc;
                }, {})
            );
            const sortedSent = [...sentDeduped].sort((a, b) => {
                const aNew = (a.status === "ACCEPTED" || a.status === "REJECTED") && !seen[a.id];
                const bNew = (b.status === "ACCEPTED" || b.status === "REJECTED") && !seen[b.id];
                if (aNew !== bNew) return aNew ? -1 : 1;
                return b.id - a.id;
            });
            sortedSent.forEach(r => {
                const statusClass = r.status === "ACCEPTED" ? "badge-available"
                    : r.status === "REJECTED" ? "badge-unavailable"
                        : r.status === "COMPLETED" ? "badge-completed"
                            : "badge-pending";
                const isNew = (r.status === "ACCEPTED" || r.status === "REJECTED") && !seen[r.id];
                html += `
                <div class="request-card${isNew ? ' request-card-new' : ''}">
                    <div class="request-info">
                        <span class="request-book">${r.book.titulo}</span>
                        <a class="request-user" href="user.html?username=${r.book.user.username}">@${r.book.user.username}</a>
                    </div>
                    <div style="display:flex;align-items:center;gap:0.5rem">
                        ${isNew ? '<span style="font-size:0.75rem;color:#c8a96e;font-weight:600">NEW</span>' : ''}
                        <span class="${statusClass}">${r.status}</span>
                    </div>
                </div>`;
            });
        }


        const updatedSeen = { ...seen };
        sent.forEach(r => {
            if (r.status === "ACCEPTED" || r.status === "REJECTED") updatedSeen[r.id] = true;
        });
        localStorage.setItem(storageKey, JSON.stringify(updatedSeen));

        html += `</div>`;
        content.innerHTML = html;

        updateRequestsBadge(pending.length, 0);

    } catch (error) {
        console.error("[loadRequests] failed:", error);
        content.innerHTML = "<p>Error loading requests.</p>";
    }
}

function buildRatingForm(swapId, alreadyRated = false) {
    if (alreadyRated) return '<span class="badge-available">Already rated ⭐</span>';
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

    if (response.ok) {
        const localRatedIds = JSON.parse(localStorage.getItem(`ratedSwaps_${username}`) || '[]');
        if (!localRatedIds.includes(swapId)) localRatedIds.push(swapId);
        localStorage.setItem(`ratedSwaps_${username}`, JSON.stringify(localRatedIds));
        loadRequests();
    } else {
        const msg = await response.text();
        const ratingDiv = document.getElementById(`rate-${swapId}`);
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

    const body = { titulo, autor, genre };

    const coverFile = document.getElementById("bookCover").files[0];
    if (coverFile) {
        const reader = new FileReader();
        reader.readAsDataURL(coverFile);
        reader.onload = async () => {
            body.bookCover = reader.result.split(',')[1];
            console.log("[submitBook] sending with cover, bookCover length:", body.bookCover?.length);
            await sendBookRequest(body);
        };
        reader.onerror = () => alert("Error reading the image file.");
    } else {
        await sendBookRequest(body);
    }
}

async function sendBookRequest(body) {
    const response = await authFetch("http://localhost:8080/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (response.ok) {
        closeModal();
        changeTab("myBooks");
    } else {
        const errorMsg = await response.text();
        console.error("Server error:", response.status, errorMsg);
        alert("Error adding book: " + (errorMsg || response.status));
    }
}

async function loadMyRatings() {
    const content = document.getElementById("tabContent");
    content.innerHTML = "<p>Loading...</p>";

    try {
        const res = await authFetch(`http://localhost:8080/users/${username}/ratings`);
        const ratings = await res.json();

        if (ratings.length === 0) {
            content.innerHTML = `<p style="color:#5F5E5A; padding:1rem">You haven't received any ratings yet.</p>`;
            return;
        }

        const average = (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1);

        let html = `<div class="requests-section">`;
        html += `<p style="padding:0.5rem 0 1rem; color:#5F5E5A">Average rating: <strong style="color:#c8a96e">⭐ ${average}</strong> (${ratings.length} review${ratings.length !== 1 ? 's' : ''})</p>`;

        ratings.forEach(r => {
            const stars = '★'.repeat(r.score) + '☆'.repeat(5 - r.score);
            const date = new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            html += `
            <div class="request-card" style="flex-direction:column; align-items:flex-start; gap:0.4rem">
                <div style="display:flex; align-items:center; gap:0.75rem; width:100%">
                    <a class="requester-username" href="user.html?username=${r.rater.username}">@${r.rater.username}</a>
                    <span style="color:#c8a96e; font-size:1.1rem">${stars}</span>
                    <span style="color:#999; font-size:0.8rem; margin-left:auto">${date}</span>
                </div>
                ${r.comment ? `<p style="color:#3d3b36; margin:0; font-style:italic">"${r.comment}"</p>` : ''}
            </div>`;
        });

        html += `</div>`;
        content.innerHTML = html;
    } catch {
        content.innerHTML = "<p>Error loading ratings.</p>";
    }
}

async function checkPendingRequests() {
    try {
        const [receivedRes, sentRes] = await Promise.all([
            authFetch("http://localhost:8080/requests/received"),
            authFetch("http://localhost:8080/requests/sent")
        ]);
        const received = receivedRes.ok ? await receivedRes.json() : [];
        const sent = sentRes.ok ? await sentRes.json() : [];

        const pendingCount = received.filter(r => r.status === "PENDING").length;
        const unseenCount = countUnseenSentChanges(sent);
        updateRequestsBadge(pendingCount, unseenCount);
    } catch (e) { }
}

function countUnseenSentChanges(sent) {
    const storageKey = `seenSentRequests_${username}`;
    const raw = localStorage.getItem(storageKey);

    if (raw === null) {
        const initial = {};
        sent.forEach(r => { initial[r.id] = true; });
        localStorage.setItem(storageKey, JSON.stringify(initial));
        return 0;
    }

    const seen = JSON.parse(raw);
    return sent.filter(r =>
        (r.status === 'ACCEPTED' || r.status === 'REJECTED') && !seen[r.id]
    ).length;
}

function updateRequestsBadge(pendingCount, unseenCount = 0) {
    const tab = document.getElementById("tabRequests");
    if (!tab) return;
    const total = pendingCount + unseenCount;
    tab.textContent = total > 0 ? `Requests (${total})` : "Requests";
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
