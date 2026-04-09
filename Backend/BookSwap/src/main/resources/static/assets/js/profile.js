const username = localStorage.getItem('username');
let profilePhotoBase64 = null;

document.addEventListener("DOMContentLoaded", () => {
    if (!checkAuth()) return;
    loadUserProfile();
    changeTab("myBooks");

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
