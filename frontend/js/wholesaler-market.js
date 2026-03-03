// --- 1. Add Product Form ---
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const productData = {
        name: document.getElementById('pName').value,
        category: document.getElementById('pCategory').value,
        price: document.getElementById('pPrice').value,
        type: document.getElementById('pType').value,
        location: document.getElementById('pLocation').value,
        image: document.getElementById('pImage').value,
        sellerName: localStorage.getItem('username') || "Ajay",
        phone: "9969306206" 
    };

    try {
        const response = await fetch('https://krishi-backend.onrender.com/api/market/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        const result = await response.json();
        alert(result.message);
        document.getElementById('productForm').reset();
    } catch (error) {
        alert("Server Error: Could not add product.");
    }
});

// --- 2. Load Pending Deliveries (The List) ---
async function loadWholesalerOrders() {
    try {
        // Fetching all orders for the presentation
        const res = await fetch('https://krishi-backend.onrender.com/api/market/seller/orders/all');
        const orders = await res.json();
        
        const container = document.getElementById('ordersList');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = "<p>No pending deliveries found.</p>";
            return;
        }

        container.innerHTML = orders.map(order => {
    // FIX: Safely handle missing Product or Farmer data
    const pName = order.productId ? order.productId.name : "Unknown Product";
    const fName = order.farmerId ? (order.farmerId.username || order.farmerId) : "Guest Farmer";
    const isDone = order.status === 'Completed';

    return `
        <div style="border: 2px solid #27ae60; padding: 15px; margin: 10px 0; border-radius: 10px; background: #fff;">
            <h4>📦 Item: ${pName}</h4>
            <p><b>Farmer:</b> ${fName}</p>
            <p><b>Payment:</b> ${order.paymentType} 
            
            <div id="status-area-${order._id}">
                ${isDone ? 
                    '<b style="color:green">✅ Verified & Delivered</b>' : 
                    `<input type="text" id="code-${order._id}" placeholder="Enter Farmer's Code" style="padding:5px;">
                     <button onclick="verifyOrder('${order._id}')" style="background:#27ae60; color:white; border:none; padding:6px 12px; cursor:pointer; border-radius:4px;">Verify</button>`
                }
            </div>
        </div>
    `;
}).join('');
    } catch (err) {
        console.error("Dashboard Error:", err);
    }
}

// --- 3. Verify Unique Code Logic ---
async function verifyOrder(orderId) {
    const inputCode = document.getElementById(`code-${orderId}`).value.toUpperCase();
    
    try {
        const res = await fetch('https://krishi-backend.onrender.com/api/market/verify-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, inputCode })
        });

        const data = await res.json();
        if (data.success) {
            alert("Verification Success! Green Tick Added.");
            document.getElementById(`status-area-${orderId}`).innerHTML = '<b style="color:green; font-size:1.2em;">✅ Order Delivered & Verified</b>';
        } else {
            alert("❌ Invalid Code! Order not verified.");
        }
    } catch (err) {
        alert("Error during verification.");
    }
}

// Initialize list
loadWholesalerOrders();