const translations = {
    en: {
        welcome: "Welcome to Krishi Auction",
        login: "Login",
        signup: "Signup",
        farmer: "Farmer",
        wholesaler: "Wholesaler",
        email_placeholder: "Enter Email"
    },
    mr: {
        welcome: "कृषी लिलावात आपले स्वागत आहे",
        login: "लॉगिन करा",
        signup: "साइन अप करा",
        farmer: "शेतकरी",
        wholesaler: "घाऊक व्यापारी",
        email_placeholder: "ईमेल टाका"
    },
    // Add hi, gu, bn, pa, ta, te, kn, ml here...
};

function applyLanguage(lang) {
    const t = translations[lang];
    
    // Map the IDs to the translated text
    if (document.getElementById("title")) document.getElementById("title").innerText = t.welcome;
    if (document.getElementById("loginBtn")) document.getElementById("loginBtn").innerText = t.login;
    if (document.getElementById("email")) document.getElementById("email").placeholder = t.email_placeholder;
    
    // Save preference
    localStorage.setItem("selectedLang", lang);
}