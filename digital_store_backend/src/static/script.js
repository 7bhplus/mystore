// Global Variables
let products = [];
let cart = [];
let currentCurrency = 'USD';
let currentUser = null;

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const loginModal = document.getElementById('loginModal');
const currencySelect = document.getElementById('currency');

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCart();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    currencySelect.addEventListener('change', function() {
        currentCurrency = this.value;
        updateProductPrices();
        updateCartTotal();
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            hideLogin();
        }
    });
    
    // Close cart when clicking outside
    document.addEventListener('click', function(e) {
        if (!cartSidebar.contains(e.target) && !e.target.closest('.cart-btn')) {
            if (cartSidebar.classList.contains('open')) {
                toggleCart();
            }
        }
    });
}

// Sample Products Data
const sampleProducts = [
    {
        id: 1,
        name: 'نتفليكس بريميوم',
        description: 'اشتراك شهري في نتفليكس بريميوم مع جودة 4K ودعم 4 أجهزة',
        price_usd: 15.99,
        price_sar: 59.99,
        category: 'entertainment',
        image: 'https://via.placeholder.com/300x200/E50914/FFFFFF?text=Netflix',
        features: ['جودة 4K', '4 أجهزة', 'تحميل غير محدود', 'بدون إعلانات']
    },
    {
        id: 2,
        name: 'سبوتيفاي بريميوم',
        description: 'اشتراك شهري في سبوتيفاي بريميوم مع موسيقى بدون إعلانات',
        price_usd: 9.99,
        price_sar: 37.99,
        category: 'music',
        image: 'https://via.placeholder.com/300x200/1DB954/FFFFFF?text=Spotify',
        features: ['بدون إعلانات', 'تحميل الموسيقى', 'جودة عالية', 'تشغيل غير محدود']
    },
    {
        id: 3,
        name: 'أدوبي كريتيف كلاود',
        description: 'اشتراك شهري في مجموعة أدوبي الكاملة للتصميم والإبداع',
        price_usd: 52.99,
        price_sar: 198.99,
        category: 'productivity',
        image: 'https://via.placeholder.com/300x200/FF0000/FFFFFF?text=Adobe',
        features: ['جميع تطبيقات أدوبي', 'تحديثات مجانية', 'تخزين سحابي', 'دعم فني']
    },
    {
        id: 4,
        name: 'مايكروسوفت 365',
        description: 'اشتراك شهري في مايكروسوفت 365 مع أوفيس وتخزين سحابي',
        price_usd: 6.99,
        price_sar: 26.99,
        category: 'productivity',
        image: 'https://via.placeholder.com/300x200/0078D4/FFFFFF?text=Microsoft',
        features: ['أوفيس كامل', '1TB تخزين', 'تيمز', 'أوت لوك']
    },
    {
        id: 5,
        name: 'يوتيوب بريميوم',
        description: 'اشتراك شهري في يوتيوب بريميوم بدون إعلانات مع يوتيوب ميوزيك',
        price_usd: 11.99,
        price_sar: 44.99,
        category: 'entertainment',
        image: 'https://via.placeholder.com/300x200/FF0000/FFFFFF?text=YouTube',
        features: ['بدون إعلانات', 'تشغيل في الخلفية', 'يوتيوب ميوزيك', 'تحميل الفيديوهات']
    },
    {
        id: 6,
        name: 'ديزني بلس',
        description: 'اشتراك شهري في ديزني بلس مع محتوى ديزني ومارفل وستار وورز',
        price_usd: 7.99,
        price_sar: 29.99,
        category: 'entertainment',
        image: 'https://via.placeholder.com/300x200/113CCF/FFFFFF?text=Disney+',
        features: ['محتوى ديزني', 'مارفل', 'ستار وورز', 'ناشيونال جيوغرافيك']
    }
];

// Load Products
async function loadProducts() {
    try {
        // For now, use sample data
        products = sampleProducts;
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to sample data
        products = sampleProducts;
        displayProducts(products);
    }
}

// Display Products
function displayProducts(productsToShow) {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    productsToShow.forEach(product => {
        const price = currentCurrency === 'USD' ? product.price_usd : product.price_sar;
        const currency = currentCurrency === 'USD' ? '$' : 'ر.س';
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-overlay">
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i>
                        إضافة للسلة
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-features">
                    ${product.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
                <div class="product-price">
                    <span class="price">${currency}${price}</span>
                    <span class="period">/شهرياً</span>
                </div>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

// Update Product Prices
function updateProductPrices() {
    displayProducts(products);
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.product.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            product: product,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCart();
    showNotification('تم إضافة المنتج للسلة!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.product.id !== productId);
    updateCartDisplay();
    saveCart();
    showNotification('تم حذف المنتج من السلة');
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.product.id === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCartDisplay();
        saveCart();
    }
}

function updateCartDisplay() {
    if (!cartItems || !cartCount || !cartTotal) return;
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">السلة فارغة</div>';
    } else {
        cart.forEach(item => {
            const price = currentCurrency === 'USD' ? item.product.price_usd : item.product.price_sar;
            const currency = currentCurrency === 'USD' ? '$' : 'ر.س';
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.product.name}</h4>
                    <p class="cart-item-price">${currency}${price}</p>
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateQuantity(${item.product.id}, ${item.quantity - 1})" class="quantity-btn">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.product.id}, ${item.quantity + 1})" class="quantity-btn">+</button>
                    <button onclick="removeFromCart(${item.product.id})" class="remove-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    
    updateCartTotal();
}

function updateCartTotal() {
    if (!cartTotal) return;
    
    const total = cart.reduce((sum, item) => {
        const price = currentCurrency === 'USD' ? item.product.price_usd : item.product.price_sar;
        return sum + (price * item.quantity);
    }, 0);
    
    const currency = currentCurrency === 'USD' ? '$' : 'ر.س';
    cartTotal.textContent = `${currency}${total.toFixed(2)}`;
}

function loadCart() {
    const savedCart = localStorage.getItem('digitalStoreCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}

function saveCart() {
    localStorage.setItem('digitalStoreCart', JSON.stringify(cart));
}

function toggleCart() {
    cartSidebar.classList.toggle('open');
}

async function checkout() {
    if (cart.length === 0) {
        showError('السلة فارغة');
        return;
    }
    
    if (!currentUser) {
        showLogin();
        return;
    }
    
    try {
        const total = cart.reduce((sum, item) => {
            const price = currentCurrency === 'USD' ? item.product.price_usd : item.product.price_sar;
            return sum + (price * item.quantity);
        }, 0);
        
        const paymentData = {
            amount: total,
            currency: currentCurrency,
            customer_email: currentUser.email || 'customer@example.com',
            customer_name: currentUser.name || 'Customer',
            order_id: Date.now().toString(),
            items: cart.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                price: currentCurrency === 'USD' ? item.product.price_usd : item.product.price_sar
            }))
        };

        showNotification('جاري إنشاء عملية الدفع...', 'info');

        const response = await fetch('/api/payment/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();

        if (result.success && result.payment_url) {
            window.location.href = result.payment_url;
        } else {
            showError('حدث خطأ في إنشاء عملية الدفع');
            console.error('Payment creation failed:', result);
        }

    } catch (error) {
        console.error('Checkout error:', error);
        showError('حدث خطأ في عملية الدفع');
    }
}

// Filter Functions
function filterByCategory(category) {
    if (category === 'all') {
        displayProducts(products);
    } else {
        const filteredProducts = products.filter(product => product.category === category);
        displayProducts(filteredProducts);
    }
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="filterByCategory('${category}')"]`).classList.add('active');
}

// User Functions
function showLogin() {
    loginModal.style.display = 'block';
}

function hideLogin() {
    loginModal.style.display = 'none';
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
        return;
    }
    
    // Simple mock login
    currentUser = {
        id: 1,
        name: 'مستخدم',
        email: email
    };
    
    hideLogin();
    showNotification('تم تسجيل الدخول بنجاح!');
    
    // Update UI
    document.querySelector('.login-btn').style.display = 'none';
    document.querySelector('.user-info').style.display = 'block';
    document.querySelector('.user-name').textContent = currentUser.name;
}

function logout() {
    currentUser = null;
    document.querySelector('.login-btn').style.display = 'block';
    document.querySelector('.user-info').style.display = 'none';
    showNotification('تم تسجيل الخروج');
}

// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    let icon = 'fas fa-check-circle';
    let bgColor = 'linear-gradient(45deg, #28a745, #20c997)';
    
    if (type === 'error') {
        icon = 'fas fa-exclamation-circle';
        bgColor = 'linear-gradient(45deg, #dc3545, #c82333)';
    } else if (type === 'info') {
        icon = 'fas fa-info-circle';
        bgColor = 'linear-gradient(45deg, #17a2b8, #138496)';
    }
    
    notification.style.background = bgColor;
    notification.innerHTML = `
        <i class="${icon}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function showError(message) {
    showNotification(message, 'error');
}

// Payment Success Handler
function handlePaymentSuccess() {
    cart = [];
    updateCartDisplay();
    saveCart();
    showNotification('تم الدفع بنجاح! شكرًا لك على الشراء', 'success');
    if (cartSidebar.classList.contains('open')) {
        toggleCart();
    }
}

// Check if we're on payment success page
if (window.location.pathname.includes('payment-success') || window.location.search.includes('payment=success')) {
    document.addEventListener('DOMContentLoaded', function() {
        handlePaymentSuccess();
    });
}
