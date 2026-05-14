if (!localStorage.getItem('token')) window.location.href = 'login.html';

const me = localStorage.getItem('username');
const chatList = document.getElementById('chatList');

function timeAgo(isoString) {
    const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function truncate(str, max) {
    return str.length > max ? str.slice(0, max) + '…' : str;
}

function renderChats(chats) {
    if (chats.length === 0) {
        chatList.innerHTML = '<div class="messages-empty">No active swap requests yet.<br>Browse books to get started!</div>';
        return;
    }

    chatList.innerHTML = '';
    chats.forEach(chat => {
        const hasMessages = chat.lastContent !== null;
        const seen = parseInt(localStorage.getItem(`chat_seen_${chat.requestId}`) || '0');
        const isUnread = hasMessages && chat.lastMessageId > seen && chat.lastSenderUsername !== me;

        const preview = !hasMessages
            ? 'No messages yet — say hi!'
            : chat.lastSenderUsername === me
                ? `You: ${truncate(chat.lastContent, 40)}`
                : truncate(chat.lastContent, 45);

        const link = `chat.html?requestId=${chat.requestId}&book=${encodeURIComponent(chat.bookTitle)}&with=${encodeURIComponent(chat.otherUser)}`;

        const item = document.createElement('a');
        item.href = link;
        item.className = `messages-item${isUnread ? ' unread' : ''}${!hasMessages ? ' no-messages' : ''}`;
        const statusClass = chat.status === 'ACCEPTED' ? 'msg-status-accepted' : chat.status === 'COMPLETED' ? 'msg-status-completed' : 'msg-status-pending';
        item.innerHTML = `
            <div class="messages-item-icon">📖</div>
            <div class="messages-item-body">
                <div class="messages-item-top">
                    <span class="messages-book">${escapeHtml(chat.bookTitle)}</span>
                    <span class="messages-time">${hasMessages ? timeAgo(chat.lastSentAt) : ''}</span>
                </div>
                <div class="messages-item-bottom">
                    <span class="messages-user">@${escapeHtml(chat.otherUser)}</span>
                    <span class="messages-preview">${escapeHtml(preview)}</span>
                </div>
            </div>
            <span class="msg-status ${statusClass}">${chat.status}</span>
            ${isUnread ? '<div class="messages-dot"></div>' : ''}
        `;
        chatList.appendChild(item);
    });
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function loadChats() {
    try {
        const res = await authFetch('/api/messages/active-chats');
        if (!res.ok) return;
        const chats = await res.json();
        chats.sort((a, b) => {
            const dateA = a.lastSentAt ? new Date(a.lastSentAt) : new Date(a.createdAt);
            const dateB = b.lastSentAt ? new Date(b.lastSentAt) : new Date(b.createdAt);
            return dateB - dateA;
        });
        renderChats(chats);
    } catch (e) {}
}

loadChats();
setInterval(loadChats, 15000);
