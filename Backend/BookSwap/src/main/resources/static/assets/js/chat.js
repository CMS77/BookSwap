const token = localStorage.getItem('token');
const currentUser = localStorage.getItem('username');

if (!token) window.location.href = 'login.html';

const params = new URLSearchParams(window.location.search);
const requestId = params.get('requestId');
const bookTitle = params.get('book') || 'Book';
const otherUser = params.get('with') || '';

if (!requestId) window.location.href = 'profile.html';

document.getElementById('chatBookTitle').textContent = bookTitle;
document.getElementById('chatWith').textContent = otherUser ? `with @${otherUser}` : '';

const messagesEl = document.getElementById('chatMessages');
let lastMessageId = 0;
let polling = false;

function renderMessage(msg) {
    const isMine = msg.senderUsername === currentUser;
    const div = document.createElement('div');
    div.className = `chat-message ${isMine ? 'mine' : 'theirs'}`;
    div.innerHTML = `
        ${!isMine ? `<span class="chat-sender">@${escapeHtml(msg.senderUsername)}</span>` : ''}
        <span class="chat-bubble">${escapeHtml(msg.content)}</span>
        <span class="chat-time">${formatTime(msg.sentAt)}</span>
    `;
    return div;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatTime(isoString) {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function pollMessages() {
    if (polling) return;
    polling = true;
    try {
        const url = lastMessageId > 0
            ? `/api/messages/${requestId}?since=${lastMessageId}`
            : `/api/messages/${requestId}`;

        const res = await authFetch(url);
        if (!res.ok) return;
        const messages = await res.json();

        if (messages.length === 0) return;

        const placeholder = messagesEl.querySelector('.chat-loading, .chat-empty');
        if (placeholder) placeholder.remove();

        messages.forEach(m => {
            messagesEl.appendChild(renderMessage(m));
            lastMessageId = Math.max(lastMessageId, m.id);
        });
        localStorage.setItem(`chat_seen_${requestId}`, lastMessageId);
        scrollToBottom();
    } catch (e) { } finally {
        polling = false;
    }
}

// load history then start polling
pollMessages().then(() => {
    if (lastMessageId === 0) {
        messagesEl.innerHTML = '<div class="chat-empty">No messages yet. Say hi!</div>';
    }
    setInterval(pollMessages, 3000);
});

// send message
document.getElementById('chatForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    const content = input.value.trim();
    if (!content) return;

    input.value = '';
    input.focus();

    await authFetch(`/api/messages/${requestId}`, {
        method: 'POST',
        body: JSON.stringify({ content })
    });

    await pollMessages();
});
