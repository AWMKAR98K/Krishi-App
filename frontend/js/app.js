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

        if (!res.ok) {
            alert(result.error || "Login failed");
            return;
        }

        // Store Token
        localStorage.setItem("token", result.token);
        
        // Redirect based on role
        if (result.role === "farmer") window.location.href = "farmer.html";
        else if (result.role === "wholesaler") window.location.href = "wholesaler.html";
        else window.location.href = "admin.html";

    } catch (err) {
        alert("Server connection failed");
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