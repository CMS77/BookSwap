const {username} = require('./login.js');

async function loadUserProfile() {
    try {
        const response = await fetch("http://localhost:8080/users/" + username, {
            method: "GET",
            credentials: "include"
        });

        const user = await response.json();


        document.getElementById("name").innerText = user.name;
        document.querySelector(".username").innerText = "@" + user.username;
        document.querySelector(".rating").innerText = "⭐ " + user.rating;

        document.getElementById("bio").value = user.bio || "";
        document.getElementById("location").value = user.location || "";

        if (user.fotoUser) {
            document.querySelector(".profile-photo img").src =
                "data:image/png;base64," + user.fotoUser;
        }

    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

async function saveProfile() {
    const bio = document.getElementById("bio").value;
    const location = document.getElementById("location").value;

    try {
        await fetch("http://localhost:8080/users/" + username, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                bio,
                location
            })
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
    event.target.classList.add("active");

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

document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
    changeTab("myBooks");
});