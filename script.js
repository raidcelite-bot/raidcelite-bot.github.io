const OWNER_PHONE = "213660018673";

// المتجر يبدأ فارغاً تماماً
let products = [];
let selectedCategory = "الكل";
let cart = {};
let currentImageData = "";

document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
    renderCategories();
    renderProducts();
    loadCustomerInfo();
});

function loadSavedData() {
    const savedProds = localStorage.getItem('ce_wholesale_products');
    if (savedProds) {
        products = JSON.parse(savedProds);
    }
}

function toggleModal(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

// عرض وتوليد أزرار الفئات
function renderCategories() {
    const bar = document.getElementById('categoriesBar');
    bar.innerHTML = '';

    const categories = ["الكل", ...new Set(products.map(p => p.category))];

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `cat-tab-btn ${cat === selectedCategory ? 'active' : ''}`;
        btn.textContent = cat;
        btn.onclick = () => {
            selectedCategory = cat;
            renderCategories();
            renderProducts();
        };
        bar.appendChild(btn);
    });
}

// عرض شبكة المنتجات
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    // تصفية المنتجات حسب الفئة المختارة
    const filteredProds = (selectedCategory === "الكل") 
        ? products 
        : products.filter(p => p.category === selectedCategory);

    if (filteredProds.length === 0) {
        grid.innerHTML = `<div class="empty-store-msg">لا توجد منتجات معروضة حالياً في هذه الفئة.</div>`;
        updateFloatingCartBtn();
        return;
    }

    filteredProds.forEach(p => {
        const qty = cart[p.id] || 0;
        const isOut = !p.inStock;

        grid.innerHTML += `
            <div class="product-card ${isOut ? 'out-of-stock' : ''}">
                ${p.badge ? `<span class="product-badge-tag">${p.badge}</span>` : ''}
                <img src="${p.img}" class="product-img" alt="${p.name}">
                <div class="product-title">${p.name}</div>
                <div class="product-price">${p.price.toLocaleString()} د.ج / باكي</div>
                
                ${isOut ? `<div class="out-badge-text">غير متوفر حالياً</div>` : `
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="updateQty(${p.id}, -1)">-</button>
                        <span class="qty-number">${qty}</span>
                        <button class="qty-btn" onclick="updateQty(${p.id}, 1)">+</button>
                    </div>
                `}
            </div>
        `;
    });

    updateFloatingCartBtn();
}

function updateQty(prodId, delta) {
    const current = cart[prodId] || 0;
    const updated = current + delta;

    if (updated <= 0) {
        delete cart[prodId];
    } else {
        cart[prodId] = updated;
    }

    renderProducts();
}

function updateFloatingCartBtn() {
    const btn = document.getElementById('floatingCartBtn');
    let totalItems = 0;
    let totalPrice = 0;

    for (let id in cart) {
        const prod = products.find(p => p.id == id);
        if (prod) {
            totalItems += cart[id];
            totalPrice += prod.price * cart[id];
        }
    }

    if (totalItems > 0) {
        btn.style.display = 'flex';
        document.getElementById('cartTotalItems').textContent = totalItems;
        document.getElementById('cartTotalPrice').textContent = totalPrice.toLocaleString() + ' د.ج';
    } else {
        btn.style.display = 'none';
    }
}

function openCartModal() {
    const list = document.getElementById('cartItemsList');
    list.innerHTML = '';

    let totalQty = 0;
    let rawTotal = 0;

    for (let id in cart) {
        const prod = products.find(p => p.id == id);
        if (prod) {
            const qty = cart[id];
            const itemSum = prod.price * qty;
            totalQty += qty;
            rawTotal += itemSum;

            list.innerHTML += `
                <div class="cart-item-row">
                    <div>
                        <strong>${prod.name}</strong><br>
                        <small>${qty} × ${prod.price.toLocaleString()} د.ج</small>
                    </div>
                    <strong>${itemSum.toLocaleString()} د.ج</strong>
                </div>
            `;
        }
    }

    let discount = 0;
    const discountNote = document.getElementById('discountNote');
    const discountRow = document.getElementById('discountRow');

    if (totalQty >= 10) {
        discount = rawTotal * 0.03;
        discountNote.style.display = 'block';
        discountRow.style.display = 'flex';
        document.getElementById('summaryDiscountPrice').textContent = `- ${discount.toLocaleString()} د.ج`;
    } else {
        discountNote.style.display = 'none';
        discountRow.style.display = 'none';
    }

    const finalTotal = rawTotal - discount;

    document.getElementById('summaryTotalQty').textContent = totalQty;
    document.getElementById('summaryFinalPrice').textContent = finalTotal.toLocaleString() + ' د.ج';

    toggleModal('cartModal');
}

function saveCustomerInfo() {
    const info = {
        name: document.getElementById('custName').value,
        phone: document.getElementById('custPhone').value,
        address: document.getElementById('custAddress').value
    };
    localStorage.setItem('ce_customer_info', JSON.stringify(info));
}

function loadCustomerInfo() {
    const saved = localStorage.getItem('ce_customer_info');
    if (saved) {
        const info = JSON.parse(saved);
        document.getElementById('custName').value = info.name || '';
        document.getElementById('custPhone').value = info.phone || '';
        document.getElementById('custAddress').value = info.address || '';
    }
}

function getCurrentLocation() {
    const status = document.getElementById('gpsStatus');
    if (navigator.geolocation) {
        status.textContent = "جاري تحديد الموقع...";
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const link = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
                document.getElementById('custGpsLink').value = link;
                status.textContent = "✓ تم تحديد الموقع بنجاح";
            },
            () => { status.textContent = "تعذر تحديد الموقع تلقائياً"; }
        );
    }
}

function processOrder(platform) {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const gps = document.getElementById('custGpsLink').value;

    if (!name || !phone || !address) {
        alert("يرجى ملء جميع بيانات التوصيل الأساسية.");
        return;
    }

    saveCustomerInfo();

    let orderText = `*فاتورة طلبية جملة - Couture Elite*%0A`;
    orderText += `--------------------------------%0A`;
    
    let rawTotal = 0;
    let totalQty = 0;

    for (let id in cart) {
        const prod = products.find(p => p.id == id);
        if (prod) {
            const qty = cart[id];
            const sum = prod.price * qty;
            totalQty += qty;
            rawTotal += sum;
            orderText += `• ${prod.name}%0A  الكمية: ${qty} | السعر: ${sum.toLocaleString()} د.ج%0A`;
        }
    }

    let discount = (totalQty >= 10) ? (rawTotal * 0.03) : 0;
    let finalTotal = rawTotal - discount;

    orderText += `--------------------------------%0A`;
    orderText += `• مجموع الباكيات: ${totalQty}%0A`;
    if (discount > 0) orderText += `• الخصم (3%): -${discount.toLocaleString()} د.ج%0A`;
    orderText += `• *المجموع النهائي: ${finalTotal.toLocaleString()} د.ج*%0A`;
    orderText += `--------------------------------%0A`;
    orderText += `*معلومات المشتري:*%0A`;
    orderText += `- الاسم: ${name}%0A`;
    orderText += `- الهاتف: ${phone}%0A`;
    orderText += `- العنوان/الولاية: ${address}%0A`;
    if (gps) orderText += `- رابط الموقع الجغرافي: ${gps}%0A`;

    let url = (platform === 'whatsapp')
        ? `https://wa.me/${OWNER_PHONE}?text=${orderText}`
        : `https://t.me/share/url?url=${orderText}`;

    window.open(url, '_blank');
}

// إدارة المالك
function openAdminPanel() {
    renderAdminProdsList();
    toggleModal('adminModal');
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            currentImageData = event.target.result;
            document.getElementById('imgPreviewHolder').innerHTML = `<img src="${currentImageData}">`;
        };
        reader.readAsDataURL(file);
    }
}

function saveNewProduct() {
    const name = document.getElementById('admProdName').value.trim();
    const price = document.getElementById('admProdPrice').value.trim();
    const cat = document.getElementById('admProdCat').value.trim();
    const badge = document.getElementById('admProdBadge').value;

    if (!name || !price || !cat) {
        alert("يرجى ملء جميع البيانات المطلوب.");
        return;
    }

    const newP = {
        id: Date.now(),
        name: name,
        price: parseInt(price),
        category: cat,
        badge: badge,
        inStock: true,
        img: currentImageData || 'https://via.placeholder.com/150'
    };

    products.push(newP);
    localStorage.setItem('ce_wholesale_products', JSON.stringify(products));

    document.getElementById('admProdName').value = '';
    document.getElementById('admProdPrice').value = '';
    document.getElementById('admProdCat').value = '';
    document.getElementById('imgPreviewHolder').innerHTML = '<span>لم يتم اختيار صورة</span>';
    currentImageData = '';

    toggleModal('adminModal');
    renderCategories();
    renderProducts();
}

function toggleStock(id) {
    const p = products.find(item => item.id === id);
    if (p) {
        p.inStock = !p.inStock;
        localStorage.setItem('ce_wholesale_products', JSON.stringify(products));
        renderProducts();
        renderAdminProdsList();
    }
}

// إضافة إمكانية الحذف النهائي للمنتج
function deleteProduct(id) {
    if (confirm("هل أنت تأكد من إمكانية حذف هذا المنتج نهائياً من المتجر؟")) {
        products = products.filter(p => p.id !== id);
        delete cart[id];
        localStorage.setItem('ce_wholesale_products', JSON.stringify(products));
        renderCategories();
        renderProducts();
        renderAdminProdsList();
    }
}

function renderAdminProdsList() {
    const list = document.getElementById('adminProductsList');
    list.innerHTML = '';
    if (products.length === 0) {
        list.innerHTML = '<div style="font-size:12px; color:#777;">لا توجد منتجات مضافة بعد.</div>';
        return;
    }
    products.forEach(p => {
        list.innerHTML += `
            <div class="admin-prod-item">
                <span>${p.name} (${p.category})</span>
                <div class="admin-actions-btns">
                    <button class="btn-toggle-out" onclick="toggleStock(${p.id})">
                        ${p.inStock ? 'تعيين كـ غير متوفر' : 'إعادة إتاحة'}
                    </button>
                    <button class="btn-delete-prod" onclick="deleteProduct(${p.id})">
                        حذف
                    </button>
                </div>
            </div>
        `;
    });
}