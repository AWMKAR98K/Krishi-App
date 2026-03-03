// js/farmer-market.js

// 1. Load Products
async function loadMarketplace() {
    console.log("Fetching market products...");
    try {
        const response = await fetch('https://krishi-backend-vwux.onrender.com/api/market/products');
        const products = await response.json();
        const grid = document.getElementById('product-grid');
        if (!grid) return;

        grid.innerHTML = products.map(p => {
    // Determine if it's for Rent or Sale
    const isRent = p.type === 'Borrowing';
    const badgeColor = isRent ? '#3498db' : '#27ae60';
    const statusText = isRent ? 'For Rent' : 'For Sale';

    return `
        <div class="product-card">
            <div class="badge" style="background: ${badgeColor};">${statusText}</div>
            <img src="${p.image || 'images/default-item.png'}" alt="${p.name}">
            <div class="product-info">
                <h4>${p.name}</h4>
                <p class="price">₹${p.price} ${isRent ? '/day' : ''}</p>
                <p class="location"><i class="fas fa-map-marker-alt"></i> ${p.location}</p>
                <button onclick="buyProduct('${p._id}', '${p.price}')" class="buy-btn">
                    ${isRent ? 'Rent Now' : 'Buy Now'}
                </button>
            </div>
        </div>
    `;
}).join('');
    } catch (error) {
        console.error("Market Load Error:", error);
    }
}

// 2. The Buy Function (Attached to window so HTML can find it)
window.buyProduct = async function(productId, price) {
    console.log("Buy button clicked for ID:", productId);
    const method = confirm("OK for Razorpay, Cancel for COD") ? 'Razorpay' : 'COD';

    if (method === 'Razorpay') {
        const options = {
            "key": "rzp_test_SKPtLfkPGRDzPw", 
            "amount": parseInt(price) * 100,
            "currency": "INR",
            "handler": function (response) {
                completeOrder(productId, 'Razorpay');
            }
        };
        const rzp = new Razorpay(options);
        rzp.open();
    } else {
        completeOrder(productId, 'COD');
    }
};

async function completeOrder(productId, method) {
    const res = await fetch('https://krishi-backend-vwux.onrender.com/api/market/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            farmerId: localStorage.getItem('userId'), 
            productId: productId,
            paymentType: method
        })
    });
    const data = await res.json();
    if (data.uniqueCode) {
        alert("Success! Code: " + data.uniqueCode);
        location.reload();
    }
}

async function processOrder(productId, method) {
    // Get the user ID from your auth data
    const farmerId = localStorage.getItem("userId") || "65e123456789012345678901"; // Fallback for testing

    try {
        const res = await fetch('https://krishi-backend-vwux.onrender.com/api/market/place-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                farmerId: farmerId, 
                productId: productId,
                paymentType: method
            })
        });

        const data = await res.json();
        console.log("Order saved response:", data);

        if (data.uniqueCode) {
            alert("✅ SUCCESS! \n\nYOUR CODE: " + data.uniqueCode);
            location.reload(); 
        } else {
            alert("Error: " + data.message);
        }
    } catch (err) {
        console.error("Order Save Error:", err);
    }
}