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

// API Functions
async function loadProducts() {
    try {
        showLoading(productsGrid);
        const response = await fetch('/api/products');
        if (response.ok) {
            products = await response.json();
            displayProducts(products);
        } else {
            throw new Error('فشل في تحميل المنتجات');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        // Load demo data as fallback
        loadDemoData();
        showNotification('تم تحميل البيانات التجريبية');
    }
}

async function addToCartAPI(productId, quantity = 1) {
    if (!currentUser) {
        showLogin();
        return;
    }
    
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: currentUser.id,
                product_id: productId,
                quantity: quantity
            })
        });
        
        if (response.ok) {
            loadCart();
            showNotification('تم إضافة المنتج إلى السلة بنجاح');
        } else {
            throw new Error('فشل في إضافة المنتج إلى السلة');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showError('فشل في إضافة المنتج إلى السلة');
    }
}

async function loadCart() {
    if (!currentUser) {
        cart = [];
        updateCartDisplay();
        return;
    }
    
    try {
        const response = await fetch(`/api/cart/${currentUser.id}`);
        if (response.ok) {
            cart = await response.json();
            updateCartDisplay();
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

async function removeFromCart(itemId) {
    try {
        const response = await fetch(`/api/cart/${itemId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadCart();
            showNotification('تم حذف المنتج من السلة');
        } else {
            throw new Error('فشل في حذف المنتج');
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        showError('فشل في حذف المنتج من السلة');
    }
}

async function updateCartItemQuantity(itemId, quantity) {
    try {
        const response = await fetch(`/api/cart/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity: quantity })
        });
        
        if (response.ok) {
            loadCart();
        } else {
            throw new Error('فشل في تحديث الكمية');
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        showError('فشل في تحديث الكمية');
    }
}

// Display Functions
function displayProducts(productsToShow) {
    if (productsToShow.length === 0) {
        displayEmptyState(productsGrid, 'لا توجد منتجات في هذه الفئة');
        return;
    }
    
    productsGrid.innerHTML = productsToShow.map(product => {
        const features = product.features ? JSON.parse(product.features) : [];
        const price = currentCurrency === 'USD' ? product.price_usd : product.price_sar;
        const currency = currentCurrency === 'USD' ? '$' : 'ر.س';
        
        return `
            <div class="product-card" data-category="${product.category}">
                <div class="product-image">
                    <i class="fas fa-play-circle"></i>
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-features">
                        <ul>
                            ${features.slice(0, 3).map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="product-footer">
                        <span class="product-price">${price} ${currency}</span>
                        <button class="add-to-cart" onclick="addToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i>
                            إضافة للسلة
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateCartDisplay() {
    updateCartCount();
    updateCartItems();
    updateCartTotal();
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
}

function updateCartItems() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>السلة فارغة</h3>
                <p>لم تقم بإضافة أي منتجات بعد</p>
            </div>
        `;
        return;
    }
    
    cartItems.innerHTML = cart.map(item => {
        const price = currentCurrency === 'USD' ? item.product.price_usd : item.product.price_sar;
        const currency = currentCurrency === 'USD' ? '$' : 'ر.س';
        
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.product.name}</h4>
                    <p>${price} ${currency}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-item" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => {
        const price = currentCurrency === 'USD' ? item.product.price_usd : item.product.price_sar;
        return sum + (price * item.quantity);
    }, 0);
    
    const currency = currentCurrency === 'USD' ? '$' : 'ر.س';
    cartTotal.textContent = `${total.toFixed(2)} ${currency}`;
}

function updateProductPrices() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        const product = products[index];
        if (product) {
            const price = currentCurrency === 'USD' ? product.price_usd : product.price_sar;
            const currency = currentCurrency === 'USD' ? '$' : 'ر.س';
            const priceElement = card.querySelector('.product-price');
            if (priceElement) {
                priceElement.textContent = `${price} ${currency}`;
            }
        }
    });
}

// Utility Functions
function showLoading(element) {
    element.innerHTML = `
        <div class="empty-state">
            <div class="loading"></div>
            <h3>جاري التحميل...</h3>
        </div>
    `;
}

function displayEmptyState(element, message) {
    element.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-box-open"></i>
            <h3>${message}</h3>
        </div>
    `;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
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
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.background = 'linear-gradient(45deg, #dc3545, #c82333)';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
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

// Cart Functions
function addToCart(productId) {
    if (!currentUser) {
        // For demo purposes, add to local cart
        const product = products.find(p => p.id === productId);
        if (product) {
            const existingItem = cart.find(item => item.product_id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: Date.now(),
                    product_id: productId,
                    product: product,
                    quantity: 1
                });
            }
            updateCartDisplay();
            showNotification('تم إضافة المنتج إلى السلة بنجاح');
        }
        return;
    }
    
    addToCartAPI(productId);
}

function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(itemId);
        return;
    }
    
    if (!currentUser) {
        // For demo purposes, update local cart
        const item = cart.find(item => item.id === itemId);
        if (item) {
            item.quantity = newQuantity;
            updateCartDisplay();
        }
        return;
    }
    
    updateCartItemQuantity(itemId, newQuantity);
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
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: currentUser.id,
                currency: currentCurrency
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification('تم إنشاء الطلب بنجاح!');
            cart = [];
            updateCartDisplay();
            toggleCart();
            
            // Redirect to payment or order confirmation
            setTimeout(() => {
                alert(`تم إنشاء الطلب رقم: ${result.order_id}\nسيتم توجيهك لصفحة الدفع...`);
            }, 1000);
        } else {
            throw new Error('فشل في إنشاء الطلب');
        }
    } catch (error) {
        console.error('Error during checkout:', error);
        showError('فشل في إتمام الطلب. يرجى المحاولة مرة أخرى.');
    }
}

// Filter Functions
function filterByCategory(category) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter products
    let filteredProducts = products;
    if (category !== 'all') {
        filteredProducts = products.filter(product => product.category === category);
    }
    
    displayProducts(filteredProducts);
}

// Navigation Functions
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Auth Functions
function showLogin() {
    loginModal.classList.add('show');
}

function hideLogin() {
    loginModal.classList.remove('show');
}

function showRegister() {
    // For demo purposes, just show a message
    alert('ميزة التسجيل ستكون متاحة قريباً');
}

async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            hideLogin();
            loadCart();
            showNotification('تم تسجيل الدخول بنجاح');
            
            // Update login button
            const loginBtn = document.querySelector('.login-btn');
            loginBtn.innerHTML = `
                <i class="fas fa-user"></i>
                ${user.name || user.email}
            `;
        } else {
            throw new Error('بيانات الدخول غير صحيحة');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('فشل في تسجيل الدخول. يرجى التحقق من البيانات.');
    }
}

// Demo Data (for when API is not available)
function loadDemoData() {
    products = [
        {
            id: 1,
            name: 'Netflix Premium',
            description: 'اشتراك نتفليكس بريميوم - مشاهدة غير محدودة بجودة 4K',
            category: 'ترفيه',
            price_usd: 15.99,
            price_sar: 59.99,
            duration_months: 1,
            features: JSON.stringify([
                'مشاهدة على 4 أجهزة في نفس الوقت',
                'جودة Ultra HD (4K)',
                'تحميل المحتوى للمشاهدة بدون إنترنت',
                'مكتبة ضخمة من الأفلام والمسلسلات'
            ])
        },
        {
            id: 2,
            name: 'Spotify Premium',
            description: 'اشتراك سبوتيفاي بريميوم - موسيقى بدون إعلانات',
            category: 'موسيقى',
            price_usd: 9.99,
            price_sar: 37.49,
            duration_months: 1,
            features: JSON.stringify([
                'موسيقى بدون إعلانات',
                'تحميل الموسيقى للاستماع بدون إنترنت',
                'جودة صوت عالية',
                'تخطي الأغاني بلا حدود'
            ])
        },
        {
            id: 3,
            name: 'Adobe Creative Cloud',
            description: 'مجموعة أدوبي الإبداعية الكاملة',
            category: 'إنتاجية',
            price_usd: 52.99,
            price_sar: 198.74,
            duration_months: 1,
            features: JSON.stringify([
                'Photoshop, Illustrator, Premiere Pro',
                'After Effects, InDesign, Lightroom',
                'تخزين سحابي 100GB',
                'خطوط Adobe وأصول إبداعية'
            ])
        }
    ];
    
    displayProducts(products);
}

