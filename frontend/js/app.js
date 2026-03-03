const API = "https://krishi-backend-vwux.onrender.com/api";

/***********************
 * NAVIGATION & AUTH
 ***********************/
function goLogin(role) {
    localStorage.setItem("role", role);
    window.location.href = "login.html";
}

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const result = await res.json();
        
        // This popup will tell us exactly what the database sent back
        alert("Server says role is: " + (result.role || "MISSING"));

        if (!res.ok) {
            alert(result.error || "Login failed");
            return;
        }

        localStorage.setItem("token", result.token);
        
        // Final check: exactly match 'wholesaler' from your MongoDB screenshot
        const role = String(result.role).toLowerCase().trim();

        if (role === "farmer") {
            window.location.replace("farmer.html");
        } else if (role === "wholesaler") {
            window.location.replace("wholesaler.html");
        } else {
            alert("Success, but role '" + role + "' has no page!");
        }

    } catch (err) {
        console.error(err);
        alert("Check Console for error details");
    }
}

async function signup() {
    const role = document.getElementById("role").value;
    const payload = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        password: document.getElementById("password").value,
        role: role
    };

    if (role === 'wholesaler') {
        payload.companyName = document.getElementById("companyName").value;
        payload.companyId = document.getElementById("companyId").value;
    }

    try {
        const res = await fetch(`${API}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        alert(result.message || result.error);
        if (res.ok) window.location.href = "login.html";
    } catch (err) {
        alert("Signup failed");
    }
}

/***********************
 * LANGUAGE SUPPORT
 ***********************/
function changeLang(lang) {
    localStorage.setItem("lang", lang);
    location.reload(); // Simplest way to re-apply
}

function applyLang() {
    const lang = localStorage.getItem("lang") || "en";
    if (typeof translations === "undefined") return;
    
    const t = translations[lang];
    // Example mapping
    const title = document.getElementById("title");
    if (title && t.dashboardTitle) title.innerText = t.dashboardTitle;
}

// Auto-run if elements exist
document.addEventListener("DOMContentLoaded", applyLang);