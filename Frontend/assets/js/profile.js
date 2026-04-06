const username = localStorage.getItem('username');

document.addEventListener("DOMContentLoaded", () => {
    if (!checkAuth()) return;
    loadUserProfile();
    changeTab("myBooks");
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

        if (user.profilePhoto) {
            document.querySelector(".profile-photo img").src =
                "data:image/png;base64," + user.profilePhoto;
        }
    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

async function saveProfile() {
    const bio = document.getElementById("bio").value;
    const location = document.getElementById("location").value;

    try {
        await authFetch("http://localhost:8080/users/" + username, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ bio, location })
        });

        alert("Profile updated!");
    } catch (error) {
        console.error("Error saving profile:", error);
    }
}

function changeTab(tabName) {
    const content = document.getElementById("tabContent");
    const tabs = document.querySelectorAll(".tab");

    tabs.forEach(t => t.classList.remove("active"));
    document.querySelector(`.tab[onclick="changeTab('${tabName}')"]`).classList.add("active");

    switch (tabName) {
        case "myBooks":
            content.innerHTML = "<p>Your available books 📚</p>";
            break;
        case "wanted":
            content.innerHTML = "<p>Books you want to read 👀</p>";
            break;
        case "borrowed":
            content.innerHTML = "<p>Books you borrowed 📖</p>";
            break;
        case "lent":
            content.innerHTML = "<p>Books you lent 🤝</p>";
            break;
    }
}
