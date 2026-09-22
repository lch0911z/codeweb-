// Quản lý trạng thái ứng dụng
let currentTable = localStorage.getItem('itaewon_table') || 'Bàn 01';
let cart = [];
let menuData = [];
let categoriesData = [];

// Khởi tạo ứng dụng khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    updateTableDisplay();
    bindEvents();
}

function updateTableDisplay() {
    const tableBadge = document.getElementById('currentTableBadge');
    if (tableBadge) tableBadge.innerText = currentTable;
}

// Xử lý giỏ hàng
window.addToCart = function(dishId, name, price) {
    const existing = cart.find(item => item.id === dishId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: dishId, name, price, qty: 1 });
    }
    renderCartUI();
};

window.updateQty = function(dishId, delta) {
    const index = cart.findIndex(item => item.id === dishId);
    if (index !== -1) {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) cart.splice(index, 1);
    }
    renderCartUI();
};

function renderCartUI() {
    const cartCount = document.getElementById('cartTotalCount');
    const cartPrice = document.getElementById('cartTotalPrice');
    
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (cartCount) cartCount.innerText = totalQty;
    if (cartPrice) cartPrice.innerText = totalPrice.toLocaleString('vi-VN') + 'đ';
}

// Xử lý gửi đơn lên Firebase
window.submitOrderToKitchen = function() {
    if (cart.length === 0) {
        alert('Vui lòng chọn ít nhất 1 món trước khi gửi order!');
        return;
    }

    const newOrder = {
        table: currentTable,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        status: 'pending',
        items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price }))
    };

    // Push dữ liệu lên Realtime Database
    const ordersRef = window.dbRef(window.db, 'orders');
    window.dbPush(ordersRef, newOrder)
        .then(() => {
            alert('Gửi order thành công! Bếp đang chuẩn bị món.');
            cart = [];
            renderCartUI();
        })
        .catch(err => {
            console.error('Lỗi gửi order:', err);
            alert('Không thể gửi order. Vui lòng kiểm tra kết nối mạng!');
        });
};