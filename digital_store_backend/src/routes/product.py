from flask import Blueprint, request, jsonify
from src.models.product import db, Product, Order, OrderItem, Cart
from src.models.user import User
import json

product_bp = Blueprint('product', __name__)

@product_bp.route('/products', methods=['GET'])
def get_products():
    """الحصول على جميع المنتجات مع إمكانية الفلترة"""
    category = request.args.get('category')
    search = request.args.get('search')
    
    query = Product.query.filter_by(is_active=True)
    
    if category:
        query = query.filter_by(category=category)
    
    if search:
        query = query.filter(Product.name.contains(search))
    
    products = query.all()
    return jsonify([product.to_dict() for product in products])

@product_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """الحصول على منتج محدد"""
    product = Product.query.get_or_404(product_id)
    return jsonify(product.to_dict())

@product_bp.route('/categories', methods=['GET'])
def get_categories():
    """الحصول على جميع الفئات"""
    categories = db.session.query(Product.category).distinct().all()
    return jsonify([cat[0] for cat in categories])

@product_bp.route('/cart', methods=['POST'])
def add_to_cart():
    """إضافة منتج إلى السلة"""
    data = request.get_json()
    user_id = data.get('user_id')
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    
    if not user_id or not product_id:
        return jsonify({'error': 'معرف المستخدم ومعرف المنتج مطلوبان'}), 400
    
    # التحقق من وجود المنتج
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'المنتج غير موجود'}), 404
    
    # التحقق من وجود المنتج في السلة
    existing_item = Cart.query.filter_by(user_id=user_id, product_id=product_id).first()
    
    if existing_item:
        existing_item.quantity += quantity
    else:
        cart_item = Cart(user_id=user_id, product_id=product_id, quantity=quantity)
        db.session.add(cart_item)
    
    db.session.commit()
    return jsonify({'message': 'تم إضافة المنتج إلى السلة بنجاح'})

@product_bp.route('/cart/<int:user_id>', methods=['GET'])
def get_cart(user_id):
    """الحصول على سلة المستخدم"""
    cart_items = Cart.query.filter_by(user_id=user_id).all()
    return jsonify([item.to_dict() for item in cart_items])

@product_bp.route('/cart/<int:item_id>', methods=['DELETE'])
def remove_from_cart(item_id):
    """حذف منتج من السلة"""
    cart_item = Cart.query.get_or_404(item_id)
    db.session.delete(cart_item)
    db.session.commit()
    return jsonify({'message': 'تم حذف المنتج من السلة'})

@product_bp.route('/cart/<int:item_id>', methods=['PUT'])
def update_cart_item(item_id):
    """تحديث كمية منتج في السلة"""
    data = request.get_json()
    quantity = data.get('quantity')
    
    if not quantity or quantity < 1:
        return jsonify({'error': 'الكمية يجب أن تكون أكبر من صفر'}), 400
    
    cart_item = Cart.query.get_or_404(item_id)
    cart_item.quantity = quantity
    db.session.commit()
    
    return jsonify(cart_item.to_dict())

@product_bp.route('/orders', methods=['POST'])
def create_order():
    """إنشاء طلب جديد"""
    data = request.get_json()
    user_id = data.get('user_id')
    currency = data.get('currency', 'USD')
    
    if not user_id:
        return jsonify({'error': 'معرف المستخدم مطلوب'}), 400
    
    # الحصول على عناصر السلة
    cart_items = Cart.query.filter_by(user_id=user_id).all()
    
    if not cart_items:
        return jsonify({'error': 'السلة فارغة'}), 400
    
    # حساب الإجمالي
    total_usd = 0
    total_sar = 0
    
    for item in cart_items:
        total_usd += item.product.price_usd * item.quantity
        total_sar += item.product.price_sar * item.quantity
    
    # إنشاء الطلب
    order = Order(
        user_id=user_id,
        total_usd=total_usd,
        total_sar=total_sar,
        currency=currency,
        status='pending'
    )
    db.session.add(order)
    db.session.flush()  # للحصول على معرف الطلب
    
    # إضافة عناصر الطلب
    for item in cart_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_usd=item.product.price_usd,
            price_sar=item.product.price_sar
        )
        db.session.add(order_item)
    
    # حذف عناصر السلة
    for item in cart_items:
        db.session.delete(item)
    
    db.session.commit()
    
    return jsonify({
        'message': 'تم إنشاء الطلب بنجاح',
        'order_id': order.id,
        'order': order.to_dict()
    })

@product_bp.route('/orders/<int:user_id>', methods=['GET'])
def get_user_orders(user_id):
    """الحصول على طلبات المستخدم"""
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    
    orders_data = []
    for order in orders:
        order_dict = order.to_dict()
        order_dict['items'] = [item.to_dict() for item in order.items]
        orders_data.append(order_dict)
    
    return jsonify(orders_data)

@product_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """تحديث حالة الطلب"""
    data = request.get_json()
    status = data.get('status')
    
    if status not in ['pending', 'completed', 'cancelled']:
        return jsonify({'error': 'حالة غير صحيحة'}), 400
    
    order = Order.query.get_or_404(order_id)
    order.status = status
    db.session.commit()
    
    return jsonify(order.to_dict())

